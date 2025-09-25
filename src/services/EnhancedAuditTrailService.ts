// Enhanced Audit Trail Service - Integrates multiple data sources
// Provides comprehensive audit trail with compliance, quality, and activity data

import mongoose from 'mongoose';
import { DocumentAuditTrail, IDocumentAuditTrail } from '../models/DocumentAuditTrail.model.js';
import ComplianceMetrics from '../models/ComplianceMetrics.model.js';
import ComplianceIssue from '../models/ComplianceIssue.model.js';
import ComplianceNotification from '../models/ComplianceNotification.model.js';
import ComplianceWorkflow from '../models/ComplianceWorkflow.model.js';
import { RealTimeMetrics } from '../models/RealTimeMetrics.model.js';
import { UserSession } from '../models/UserSession.model.js';
import { Alert } from '../models/Alert.model.js';
import { logger } from '../utils/logger.js';

export interface EnhancedAuditTrailEntry extends IDocumentAuditTrail {
  // Compliance-related data
  complianceMetrics?: {
    standardType: string;
    score: number;
    previousScore?: number;
    changePercentage?: number;
    trendDirection?: string;
  };
  
  // Data quality information
  dataQuality?: {
    qualityScore: number;
    completenessScore: number;
    accuracyScore: number;
    consistencyScore: number;
    issuesFound: number;
  };
  
  // Real-time activity context
  realTimeContext?: {
    sessionId: string;
    userAgent: string;
    ipAddress: string;
    component: string;
    action: string;
    duration?: number;
  };
  
  // Related workflow information
  workflowContext?: {
    workflowId: string;
    workflowName: string;
    status: string;
    assignedTo?: string;
    dueDate?: Date;
  };
  
  // Alert and notification context
  alertContext?: {
    alertId: string;
    alertType: string;
    severity: string;
    resolved: boolean;
  };
  
  // Enhanced metadata
  enhancedMetadata?: {
    systemVersion: string;
    apiVersion: string;
    processingTime: number;
    dataSource: string;
    relatedDocuments: string[];
    tags: string[];
  };
}

export interface AuditTrailAnalytics {
  totalEntries: number;
  entriesByCategory: Record<string, number>;
  entriesBySeverity: Record<string, number>;
  entriesByAction: Record<string, number>;
  complianceScoreTrends: {
    standardType: string;
    currentScore: number;
    previousScore: number;
    changePercentage: number;
    trendDirection: string;
  }[];
  dataQualityTrends: {
    date: Date;
    overallScore: number;
    completenessScore: number;
    accuracyScore: number;
    issuesFound: number;
  }[];
  userActivitySummary: {
    userId: string;
    userName: string;
    totalActions: number;
    lastActivity: Date;
    topActions: string[];
    complianceScore: number;
  }[];
  systemHealth: {
    averageResponseTime: number;
    errorRate: number;
    activeUsers: number;
    systemUptime: number;
  };
}

export interface AuditTrailFilters {
  documentId?: string;
  projectId?: string;
  userId?: string;
  action?: string;
  category?: string;
  severity?: string;
  standardType?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  includeCompliance?: boolean;
  includeQuality?: boolean;
  includeRealTime?: boolean;
  includeWorkflows?: boolean;
  includeAlerts?: boolean;
}

export class EnhancedAuditTrailService {
  constructor() {
    this.ensureConnection();
  }

  private async ensureConnection(): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/requirements-gathering-agent');
      }
    } catch (error) {
      logger.error('❌ Error connecting to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get enhanced audit trail entries with integrated data from multiple sources
   */
  async getEnhancedAuditTrail(
    filters: AuditTrailFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    entries: EnhancedAuditTrailEntry[];
    total: number;
    pages: number;
    analytics: AuditTrailAnalytics;
  }> {
    try {
      await this.ensureConnection();
      
      logger.info(`🔍 Fetching enhanced audit trail with filters:`, filters);

      // Build base query
      const baseQuery: any = {};
      
      if (filters.documentId) baseQuery.documentId = filters.documentId;
      if (filters.projectId) baseQuery.projectId = filters.projectId;
      if (filters.userId) baseQuery.userId = filters.userId;
      if (filters.action) baseQuery.action = filters.action;
      if (filters.category) baseQuery.category = filters.category;
      if (filters.severity) baseQuery.severity = filters.severity;
      
      if (filters.startDate || filters.endDate) {
        baseQuery.timestamp = {};
        if (filters.startDate) baseQuery.timestamp.$gte = filters.startDate;
        if (filters.endDate) baseQuery.timestamp.$lte = filters.endDate;
      }

      if (filters.searchTerm) {
        baseQuery.$or = [
          { documentName: { $regex: filters.searchTerm, $options: 'i' } },
          { actionDescription: { $regex: filters.searchTerm, $options: 'i' } },
          { userName: { $regex: filters.searchTerm, $options: 'i' } },
          { notes: { $regex: filters.searchTerm, $options: 'i' } }
        ];
      }

      // Get base audit trail entries
      const skip = (page - 1) * limit;
      const [entries, total] = await Promise.all([
        DocumentAuditTrail.find(baseQuery)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        DocumentAuditTrail.countDocuments(baseQuery)
      ]);

      // Enhance entries with additional data
      const enhancedEntries = await Promise.all(
        entries.map(async (entry) => {
          const enhanced: EnhancedAuditTrailEntry = { ...entry };

          // Add compliance metrics if requested
          if (filters.includeCompliance !== false) {
            const complianceData = await this.getComplianceContext(entry.projectId, entry.timestamp);
            if (complianceData) {
              enhanced.complianceMetrics = complianceData;
            }
          }

          // Add data quality information if requested
          if (filters.includeQuality !== false) {
            const qualityData = await this.getDataQualityContext(entry.projectId, entry.timestamp);
            if (qualityData) {
              enhanced.dataQuality = qualityData;
            }
          }

          // Add real-time context if requested
          if (filters.includeRealTime !== false) {
            const realTimeData = await this.getRealTimeContext(entry.userId, entry.sessionId, entry.timestamp);
            if (realTimeData) {
              enhanced.realTimeContext = realTimeData;
            }
          }

          // Add workflow context if requested
          if (filters.includeWorkflows !== false) {
            const workflowData = await this.getWorkflowContext(entry.projectId, entry.documentId, entry.timestamp);
            if (workflowData) {
              enhanced.workflowContext = workflowData;
            }
          }

          // Add alert context if requested
          if (filters.includeAlerts !== false) {
            const alertData = await this.getAlertContext(entry.projectId, entry.userId, entry.timestamp);
            if (alertData) {
              enhanced.alertContext = alertData;
            }
          }

          return enhanced;
        })
      );

      // Generate analytics
      const analytics = await this.generateAuditAnalytics(filters);

      const pages = Math.ceil(total / limit);

      logger.info(`✅ Enhanced audit trail fetched: ${enhancedEntries.length} entries, ${total} total`);

      return {
        entries: enhancedEntries,
        total,
        pages,
        analytics
      };

    } catch (error) {
      logger.error('❌ Error fetching enhanced audit trail:', error);
      throw error;
    }
  }

  /**
   * Get compliance context for an audit entry
   */
  private async getComplianceContext(projectId: string, timestamp: Date): Promise<any> {
    try {
      const complianceMetrics = await ComplianceMetrics.find({
        projectId,
        calculatedAt: { $lte: timestamp }
      })
      .sort({ calculatedAt: -1 })
      .limit(1)
      .lean();

      if (complianceMetrics.length > 0) {
        const metric = complianceMetrics[0];
        return {
          standardType: metric.standardType,
          score: metric.score,
          previousScore: metric.trends?.previousScore,
          changePercentage: metric.trends?.changePercentage,
          trendDirection: metric.trends?.trendDirection
        };
      }

      return null;
    } catch (error) {
      logger.error('❌ Error fetching compliance context:', error);
      return null;
    }
  }

  /**
   * Get data quality context for an audit entry
   */
  private async getDataQualityContext(projectId: string, timestamp: Date): Promise<any> {
    try {
      // This would integrate with the DataQualityService
      // For now, return mock data structure
      return {
        qualityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        completenessScore: Math.floor(Math.random() * 40) + 60,
        accuracyScore: Math.floor(Math.random() * 40) + 60,
        consistencyScore: Math.floor(Math.random() * 40) + 60,
        issuesFound: Math.floor(Math.random() * 10)
      };
    } catch (error) {
      logger.error('❌ Error fetching data quality context:', error);
      return null;
    }
  }

  /**
   * Get real-time context for an audit entry
   */
  private async getRealTimeContext(userId?: string, sessionId?: string, timestamp?: Date): Promise<any> {
    try {
      const query: any = {};
      if (userId) query['metadata.userId'] = userId;
      if (sessionId) query['metadata.sessionId'] = sessionId;
      if (timestamp) {
        query.timestamp = {
          $gte: new Date(timestamp.getTime() - 5 * 60 * 1000), // 5 minutes before
          $lte: new Date(timestamp.getTime() + 5 * 60 * 1000)  // 5 minutes after
        };
      }

      const realTimeData = await RealTimeMetrics.findOne(query)
        .sort({ timestamp: -1 })
        .lean();

      if (realTimeData) {
        return {
          sessionId: realTimeData.metadata?.sessionId,
          userAgent: realTimeData.metadata?.userAgent,
          ipAddress: realTimeData.metadata?.ipAddress,
          component: realTimeData.component,
          action: realTimeData.action,
          duration: realTimeData.data?.duration
        };
      }

      return null;
    } catch (error) {
      logger.error('❌ Error fetching real-time context:', error);
      return null;
    }
  }

  /**
   * Get workflow context for an audit entry
   */
  private async getWorkflowContext(projectId: string, documentId?: string, timestamp?: Date): Promise<any> {
    try {
      const query: any = { projectId };
      if (documentId) query.relatedDocuments = documentId;
      if (timestamp) {
        query.createdAt = { $lte: timestamp };
      }

      const workflow = await ComplianceWorkflow.findOne(query)
        .sort({ createdAt: -1 })
        .lean();

      if (workflow) {
        return {
          workflowId: workflow._id.toString(),
          workflowName: workflow.name,
          status: workflow.status,
          assignedTo: (workflow as any).assignedTo,
          dueDate: (workflow as any).dueDate
        };
      }

      return null;
    } catch (error) {
      logger.error('❌ Error fetching workflow context:', error);
      return null;
    }
  }

  /**
   * Get alert context for an audit entry
   */
  private async getAlertContext(projectId: string, userId?: string, timestamp?: Date): Promise<any> {
    try {
      const query: any = { projectId };
      if (userId) query.assignedTo = userId;
      if (timestamp) {
        query.createdAt = {
          $gte: new Date(timestamp.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
          $lte: new Date(timestamp.getTime() + 24 * 60 * 60 * 1000)  // 24 hours after
        };
      }

      const alert = await Alert.findOne(query)
        .sort({ createdAt: -1 })
        .lean();

      if (alert) {
        return {
          alertId: alert._id.toString(),
          alertType: (alert as any).type,
          severity: alert.severity,
          resolved: alert.status === 'resolved'
        };
      }

      return null;
    } catch (error) {
      logger.error('❌ Error fetching alert context:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive audit analytics
   */
  private async generateAuditAnalytics(filters: AuditTrailFilters): Promise<AuditTrailAnalytics> {
    try {
      const baseQuery: any = {};
      if (filters.projectId) baseQuery.projectId = filters.projectId;
      if (filters.startDate || filters.endDate) {
        baseQuery.timestamp = {};
        if (filters.startDate) baseQuery.timestamp.$gte = filters.startDate;
        if (filters.endDate) baseQuery.timestamp.$lte = filters.endDate;
      }

      // Get aggregated statistics
      const [
        totalEntries,
        categoryStats,
        severityStats,
        actionStats,
        complianceTrends,
        qualityTrends,
        userActivity,
        systemHealth
      ] = await Promise.all([
        DocumentAuditTrail.countDocuments(baseQuery),
        this.getCategoryStatistics(baseQuery),
        this.getSeverityStatistics(baseQuery),
        this.getActionStatistics(baseQuery),
        this.getComplianceTrends(filters.projectId),
        this.getDataQualityTrends(filters.projectId),
        this.getUserActivitySummary(baseQuery),
        this.getSystemHealthMetrics()
      ]);

      return {
        totalEntries,
        entriesByCategory: categoryStats,
        entriesBySeverity: severityStats,
        entriesByAction: actionStats,
        complianceScoreTrends: complianceTrends,
        dataQualityTrends: qualityTrends,
        userActivitySummary: userActivity,
        systemHealth
      };

    } catch (error) {
      logger.error('❌ Error generating audit analytics:', error);
      throw error;
    }
  }

  private async getCategoryStatistics(baseQuery: any): Promise<Record<string, number>> {
    const stats = await DocumentAuditTrail.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getSeverityStatistics(baseQuery: any): Promise<Record<string, number>> {
    const stats = await DocumentAuditTrail.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getActionStatistics(baseQuery: any): Promise<Record<string, number>> {
    const stats = await DocumentAuditTrail.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getComplianceTrends(projectId?: string): Promise<any[]> {
    const query: any = {};
    if (projectId) query.projectId = projectId;

    const trends = await ComplianceMetrics.aggregate([
      { $match: query },
      { $sort: { calculatedAt: -1 } },
      { $limit: 100 },
      {
        $group: {
          _id: '$standardType',
          currentScore: { $first: '$score' },
          previousScore: { $first: '$trends.previousScore' },
          changePercentage: { $first: '$trends.changePercentage' },
          trendDirection: { $first: '$trends.trendDirection' }
        }
      }
    ]);

    return trends.map(trend => ({
      standardType: trend._id,
      currentScore: trend.currentScore,
      previousScore: trend.previousScore || 0,
      changePercentage: trend.changePercentage || 0,
      trendDirection: trend.trendDirection || 'STABLE'
    }));
  }

  private async getDataQualityTrends(projectId?: string): Promise<any[]> {
    // Mock implementation - would integrate with DataQualityService
    return [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        overallScore: 85,
        completenessScore: 88,
        accuracyScore: 82,
        issuesFound: 3
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        overallScore: 87,
        completenessScore: 90,
        accuracyScore: 85,
        issuesFound: 2
      },
      {
        date: new Date(),
        overallScore: 89,
        completenessScore: 92,
        accuracyScore: 87,
        issuesFound: 1
      }
    ];
  }

  private async getUserActivitySummary(baseQuery: any): Promise<any[]> {
    const userStats = await DocumentAuditTrail.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          totalActions: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          actions: { $addToSet: '$action' }
        }
      },
      { $sort: { totalActions: -1 } },
      { $limit: 10 }
    ]);

    return userStats.map(stat => ({
      userId: stat._id,
      userName: stat.userName || 'Unknown User',
      totalActions: stat.totalActions,
      lastActivity: stat.lastActivity,
      topActions: stat.actions.slice(0, 3),
      complianceScore: Math.floor(Math.random() * 40) + 60 // Mock data
    }));
  }

  private async getSystemHealthMetrics(): Promise<any> {
    // Mock implementation - would integrate with real system metrics
    return {
      averageResponseTime: Math.floor(Math.random() * 500) + 100,
      errorRate: Math.random() * 2,
      activeUsers: Math.floor(Math.random() * 50) + 10,
      systemUptime: 99.9
    };
  }

  /**
   * Create a new audit trail entry with enhanced context
   */
  async createEnhancedAuditEntry(entry: Partial<IDocumentAuditTrail>): Promise<IDocumentAuditTrail> {
    try {
      await this.ensureConnection();

      const auditEntry = new DocumentAuditTrail({
        ...entry,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedEntry = await auditEntry.save();
      logger.info(`✅ Enhanced audit entry created: ${savedEntry._id}`);

      return savedEntry;
    } catch (error) {
      logger.error('❌ Error creating enhanced audit entry:', error);
      throw error;
    }
  }
}

export default EnhancedAuditTrailService;
