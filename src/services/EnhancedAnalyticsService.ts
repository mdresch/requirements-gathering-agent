import { AIContextTracking } from '../models/AIContextTracking.model.js';
import { Project } from '../models/Project.js';
import { ProjectDocument } from '../models/ProjectDocument.js';
import dbConnection from '../config/database.js';
import { logger } from '../utils/logger.js';

export interface AnalyticsMetrics {
  totalInteractions: number;
  averageUtilization: number;
  totalTokensUsed: number;
  totalCost: number;
  utilizationDistribution: { low: number; medium: number; high: number };
  topProviders: Array<{
    provider: string;
    count: number;
    percentage: number;
    avgUtilization: number;
  }>;
  performanceMetrics: {
    averageGenerationTime: number;
    averageTokensPerSecond: number;
  };
  connectionStatus: 'healthy' | 'degraded' | 'unhealthy';
  lastUpdated: string;
  dataQuality: 'excellent' | 'good' | 'degraded' | 'poor';
}

export class EnhancedAnalyticsService {
  /**
   * Get comprehensive project analytics with improved connection handling
   */
  static async getProjectAnalytics(projectId: string): Promise<AnalyticsMetrics> {
    const startTime = Date.now();
    
    try {
      logger.info(`[EnhancedAnalyticsService] Fetching analytics for project: ${projectId}`);
      
      // Check database health first
      const dbHealth = await dbConnection.healthCheck();
      
      if (dbHealth.status === 'unhealthy') {
        logger.error('Database is unhealthy, cannot provide analytics');
        return this.getDegradedAnalytics('Database unhealthy', 'unhealthy');
      }
      
      // Attempt to get real data with connection resilience
      const analyticsData = await this.fetchAnalyticsData(projectId, dbHealth.status === 'degraded');
      
      const processingTime = Date.now() - startTime;
      logger.info(`Analytics processing completed in ${processingTime}ms`);
      
      return {
        ...analyticsData,
        connectionStatus: dbHealth.status,
        lastUpdated: new Date().toISOString(),
        dataQuality: this.assessDataQuality(analyticsData, dbHealth.status)
      };
      
    } catch (error: any) {
      logger.error(`Analytics service error for project ${projectId}:`, error);
      return this.getDegradedAnalytics(error.message, 'unhealthy');
    }
  }

  /**
   * Fetch analytics data with connection resilience
   */
  private static async fetchAnalyticsData(projectId: string, isDegraded: boolean): Promise<Omit<AnalyticsMetrics, 'connectionStatus' | 'lastUpdated' | 'dataQuality'>> {
    let retryCount = 0;
    const maxRetries = isDegraded ? 2 : 3;
    
    while (retryCount <= maxRetries) {
      try {
        // Get AI context tracking data
        const contextRecords = await AIContextTracking.find({ 
          projectId, 
          status: 'completed' 
        }).limit(1000).lean();
        
        // Get project documents data
        const documentRecords = await ProjectDocument.find({ 
          projectId,
          deletedAt: { $exists: false }
        }).limit(500).lean();
        
        // Calculate metrics
        return this.calculateAnalyticsMetrics(contextRecords, documentRecords);
        
      } catch (error: any) {
        retryCount++;
        
        if (retryCount > maxRetries) {
          throw error;
        }
        
        // Check if it's a connection issue
        if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
          logger.warn(`Connection error (attempt ${retryCount}), attempting reconnection...`);
          
          try {
            await dbConnection.connect();
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Progressive delay
          } catch (reconnectError) {
            logger.error('Reconnection failed:', reconnectError);
            if (retryCount === maxRetries) {
              throw reconnectError;
            }
          }
        } else {
          throw error; // Non-connection errors should not be retried
        }
      }
    }
    
    throw new Error('Maximum retry attempts exceeded');
  }

  /**
   * Calculate comprehensive analytics metrics
   */
  private static calculateAnalyticsMetrics(contextRecords: any[], documentRecords: any[]) {
    const totalInteractions = contextRecords.length;
    
    if (totalInteractions === 0) {
      return {
        totalInteractions: 0,
        averageUtilization: 0,
        totalTokensUsed: 0,
        totalCost: 0,
        utilizationDistribution: { low: 0, medium: 0, high: 0 },
        topProviders: [],
        performanceMetrics: { averageGenerationTime: 0, averageTokensPerSecond: 0 }
      };
    }
    
    // Calculate utilization metrics
    const totalTokensUsed = contextRecords.reduce((sum, record) => 
      sum + (record.contextUtilization?.totalTokensUsed || 0), 0);
    
    const averageUtilization = contextRecords.reduce((sum, record) => 
      sum + (record.contextUtilization?.utilizationPercentage || 0), 0) / totalInteractions;
    
    // Calculate total cost
    const totalCost = contextRecords.reduce((sum, record) => 
      sum + (record.performance?.costEstimate?.amount || 0), 0);
    
    // Calculate utilization distribution
    const utilizationDistribution = {
      low: contextRecords.filter(r => (r.contextUtilization?.utilizationPercentage || 0) < 70).length,
      medium: contextRecords.filter(r => {
        const util = r.contextUtilization?.utilizationPercentage || 0;
        return util >= 70 && util < 90;
      }).length,
      high: contextRecords.filter(r => (r.contextUtilization?.utilizationPercentage || 0) >= 90).length
    };
    
    // Calculate provider statistics
    const providerStats = new Map<string, { count: number; totalUtilization: number }>();
    contextRecords.forEach(record => {
      const provider = record.aiProvider || 'unknown';
      const utilization = record.contextUtilization?.utilizationPercentage || 0;
      
      if (!providerStats.has(provider)) {
        providerStats.set(provider, { count: 0, totalUtilization: 0 });
      }
      
      const stats = providerStats.get(provider)!;
      stats.count++;
      stats.totalUtilization += utilization;
    });
    
    const topProviders = Array.from(providerStats.entries()).map(([provider, stats]) => ({
      provider,
      count: stats.count,
      percentage: (stats.count / totalInteractions) * 100,
      avgUtilization: stats.totalUtilization / stats.count
    })).sort((a, b) => b.count - a.count).slice(0, 5);
    
    // Calculate performance metrics
    const totalGenerationTime = contextRecords.reduce((sum, record) => 
      sum + (record.performance?.generationTimeMs || 0), 0);
    
    const totalTokensPerSecond = contextRecords.reduce((sum, record) => 
      sum + (record.performance?.tokensPerSecond || 0), 0);
    
    return {
      totalInteractions,
      averageUtilization: Math.round(averageUtilization * 100) / 100,
      totalTokensUsed,
      totalCost: Math.round(totalCost * 100) / 100,
      utilizationDistribution,
      topProviders,
      performanceMetrics: {
        averageGenerationTime: Math.round(totalGenerationTime / totalInteractions),
        averageTokensPerSecond: Math.round(totalTokensPerSecond / totalInteractions * 100) / 100
      }
    };
  }

  /**
   * Assess data quality based on metrics and connection status
   */
  private static assessDataQuality(data: any, connectionStatus: string): 'excellent' | 'good' | 'degraded' | 'poor' {
    if (connectionStatus === 'unhealthy') return 'poor';
    if (connectionStatus === 'degraded') return 'degraded';
    
    if (data.totalInteractions === 0) return 'degraded';
    if (data.totalInteractions > 100 && data.topProviders.length > 0) return 'excellent';
    if (data.totalInteractions > 10) return 'good';
    
    return 'degraded';
  }

  /**
   * Get degraded analytics when database is unavailable
   */
  private static getDegradedAnalytics(message: string, status: 'degraded' | 'unhealthy'): AnalyticsMetrics {
    return {
      totalInteractions: 0,
      averageUtilization: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      utilizationDistribution: { low: 0, medium: 0, high: 0 },
      topProviders: [],
      performanceMetrics: { averageGenerationTime: 0, averageTokensPerSecond: 0 },
      connectionStatus: status,
      lastUpdated: new Date().toISOString(),
      dataQuality: 'poor'
    };
  }

  /**
   * Get system-wide analytics
   */
  static async getSystemAnalytics(): Promise<any> {
    try {
      const dbHealth = await dbConnection.healthCheck();
      
      if (dbHealth.status === 'unhealthy') {
        return {
          status: 'unhealthy',
          message: 'Database unavailable',
          analytics: this.getDegradedAnalytics('Database unhealthy', 'unhealthy')
        };
      }
      
      // Get aggregated data across all projects
      const totalProjects = await Project.countDocuments();
      const totalDocuments = await ProjectDocument.countDocuments({ deletedAt: { $exists: false } });
      const totalContextRecords = await AIContextTracking.countDocuments({ status: 'completed' });
      
      return {
        status: dbHealth.status,
        analytics: {
          totalProjects,
          totalDocuments,
          totalContextRecords,
          connectionStatus: dbHealth.status,
          lastUpdated: new Date().toISOString(),
          dataQuality: dbHealth.status === 'healthy' ? 'good' : 'degraded'
        }
      };
      
    } catch (error: any) {
      logger.error('System analytics error:', error);
      return {
        status: 'unhealthy',
        message: error.message,
        analytics: this.getDegradedAnalytics(error.message, 'unhealthy')
      };
    }
  }
}

