import { Request, Response, NextFunction } from 'express';
import { realTimeMetricsService } from '../../services/RealTimeMetricsService.js';
import { UserSessionService } from '../../services/UserSessionService.js';
import { AdobeMetricsService } from '../../services/AdobeMetricsService.js';
import { aiProviderBillingService } from '../../services/AIProviderBillingService.js';
import { budgetMonitoringService } from '../../services/BudgetMonitoringService.js';
import { logger } from '../../utils/logger.js';

/**
 * Real-time Metrics Controller
 * Provides endpoints for real-time metrics aggregation and streaming
 */

export class RealTimeMetricsController {
  /**
   * Get real-time metrics dashboard data
   * GET /api/v1/metrics/dashboard
   */
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const userId = (req as any).user?.id;
      const projectId = req.query.projectId as string;
      
      logger.info('Getting real-time metrics dashboard', { requestId, userId, projectId });
      
      // Get system metrics
      const systemMetrics = await realTimeMetricsService.getSystemMetrics();
      
      // Get recent metrics by type
      const recentMetrics = {
        userActivity: realTimeMetricsService.getRecentMetrics('user_activity', 50),
        documentGeneration: realTimeMetricsService.getRecentMetrics('document_generation', 50),
        templateUsage: realTimeMetricsService.getRecentMetrics('template_usage', 50),
        adobeIntegration: realTimeMetricsService.getRecentMetrics('adobe_integration', 50),
        apiUsage: realTimeMetricsService.getRecentMetrics('api_usage', 100),
        systemPerformance: realTimeMetricsService.getRecentMetrics('system_performance', 10)
      };
      
      // Get session analytics
      const sessionAnalytics = await UserSessionService.getSessionAnalytics(
        userId, 
        parseInt(req.query.days as string) || 7
      );
      
      // Get Adobe usage statistics
      const adobeStats = await AdobeMetricsService.getAdobeUsageStats(userId, projectId);
      
      // Get AI billing analytics
      const billingAnalytics = await aiProviderBillingService.getUsageAnalytics(
        undefined,
        projectId,
        userId,
        parseInt(req.query.days as string) || 7
      );
      
      // Get budget statuses
      const budgetStatuses = await budgetMonitoringService.getBudgetStatuses();
      
      // Calculate aggregated metrics with cost information
      const totalCost = recentMetrics.documentGeneration.reduce((sum, metric) => sum + (metric.data.cost || 0), 0);
      const totalTokens = recentMetrics.documentGeneration.reduce((sum, metric) => sum + (metric.data.tokensUsed || 0), 0);
      
      const aggregatedMetrics = {
        totalActivities: recentMetrics.userActivity.length,
        totalDocumentsGenerated: recentMetrics.documentGeneration.length,
        totalTemplatesUsed: recentMetrics.templateUsage.length,
        totalAdobeOperations: recentMetrics.adobeIntegration.length,
        totalApiCalls: recentMetrics.apiUsage.length,
        totalCost: Math.round(totalCost * 1000000) / 1000000,
        totalTokens: totalTokens,
        successRates: {
          documentGeneration: this.calculateSuccessRate(recentMetrics.documentGeneration),
          adobeIntegration: this.calculateSuccessRate(recentMetrics.adobeIntegration),
          apiUsage: this.calculateSuccessRate(recentMetrics.apiUsage)
        },
        averageResponseTimes: {
          apiUsage: this.calculateAverageResponseTime(recentMetrics.apiUsage),
          adobeIntegration: this.calculateAverageProcessingTime(recentMetrics.adobeIntegration),
          documentGeneration: this.calculateAverageProcessingTime(recentMetrics.documentGeneration)
        },
        costMetrics: {
          averageCostPerDocument: recentMetrics.documentGeneration.length > 0 ? 
            Math.round((totalCost / recentMetrics.documentGeneration.length) * 1000000) / 1000000 : 0,
          averageCostPerToken: totalTokens > 0 ? 
            Math.round((totalCost / totalTokens) * 1000000) / 1000000 : 0
        }
      };
      
      res.json({
        success: true,
        data: {
          system: systemMetrics,
          aggregated: aggregatedMetrics,
          recent: recentMetrics,
          sessions: sessionAnalytics,
          adobe: adobeStats,
          billing: billingAnalytics,
          budgets: budgetStatuses,
          timestamp: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to get dashboard metrics', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DASHBOARD_METRICS_FAILED',
          message: 'Failed to retrieve dashboard metrics'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get real-time metrics by type
   * GET /api/v1/metrics/:type
   */
  static async getMetricsByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      
      const validTypes = ['user_activity', 'document_generation', 'template_usage', 'adobe_integration', 'api_usage', 'system_performance'];
      
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_METRIC_TYPE',
            message: `Invalid metric type. Valid types: ${validTypes.join(', ')}`
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      const metrics = realTimeMetricsService.getRecentMetrics(type, limit);
      
      res.json({
        success: true,
        data: {
          type,
          metrics,
          count: metrics.length,
          timestamp: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to get metrics by type', { 
        error: error.message,
        type: req.params.type,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'METRICS_BY_TYPE_FAILED',
          message: 'Failed to retrieve metrics by type'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get user activity analytics
   * GET /api/v1/metrics/user-activity/:userId?
   */
  static async getUserActivityAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || (req as any).user?.id;
      const days = parseInt(req.query.days as string) || 30;
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_ID_REQUIRED',
            message: 'User ID is required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      const sessionAnalytics = await UserSessionService.getSessionAnalytics(userId, days);
      const activityTimeline = await UserSessionService.getUserActivityTimeline(userId, days);
      const activeSessions = await UserSessionService.getActiveSessions(userId);
      
      res.json({
        success: true,
        data: {
          userId,
          period: { days },
          analytics: sessionAnalytics,
          timeline: activityTimeline,
          activeSessions,
          timestamp: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to get user activity analytics', { 
        error: error.message,
        userId: req.params.userId,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_ACTIVITY_ANALYTICS_FAILED',
          message: 'Failed to retrieve user activity analytics'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get Adobe integration analytics
   * GET /api/v1/metrics/adobe-analytics
   */
  static async getAdobeAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const projectId = req.query.projectId as string;
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      
      const adobeStats = await AdobeMetricsService.getAdobeUsageStats(userId, projectId);
      
      res.json({
        success: true,
        data: {
          userId,
          projectId,
          statistics: adobeStats,
          timestamp: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to get Adobe analytics', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ADOBE_ANALYTICS_FAILED',
          message: 'Failed to retrieve Adobe analytics'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Stream real-time metrics via Server-Sent Events
   * GET /api/v1/metrics/stream
   */
  static async streamMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const userId = (req as any).user?.id;
      const types = req.query.types ? (req.query.types as string).split(',') : ['all'];
      
      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });
      
      // Send initial connection message
      res.write(`data: ${JSON.stringify({
        type: 'connection',
        message: 'Real-time metrics stream connected',
        timestamp: new Date().toISOString(),
        requestId
      })}\n\n`);
      
      // Subscribe to real-time metrics
      const subscriberId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      realTimeMetricsService.subscribe(subscriberId, (metric) => {
        // Filter metrics based on requested types
        if (types.includes('all') || types.includes(metric.type)) {
          // Filter by user if specified
          if (userId && metric.metadata.userId && metric.metadata.userId !== userId) {
            return;
          }
          
          res.write(`data: ${JSON.stringify({
            type: 'metric',
            data: metric,
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      });
      
      // Handle client disconnect
      req.on('close', () => {
        realTimeMetricsService.unsubscribe(subscriberId);
        logger.info('Real-time metrics stream disconnected', { subscriberId, requestId });
      });
      
      // Keep connection alive with periodic heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          res.write(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })}\n\n`);
        } catch (error) {
          clearInterval(heartbeatInterval);
          realTimeMetricsService.unsubscribe(subscriberId);
        }
      }, 30000); // 30 seconds
      
      // Clean up on request end
      req.on('end', () => {
        clearInterval(heartbeatInterval);
        realTimeMetricsService.unsubscribe(subscriberId);
      });
      
    } catch (error: any) {
      logger.error('Failed to setup metrics stream', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'METRICS_STREAM_FAILED',
          message: 'Failed to setup real-time metrics stream'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Calculate success rate from metrics
   */
  private static calculateSuccessRate(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const successful = metrics.filter(metric => metric.data?.success !== false).length;
    return Math.round((successful / metrics.length) * 100 * 100) / 100;
  }
  
  /**
   * Calculate average response time from API metrics
   */
  private static calculateAverageResponseTime(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const totalTime = metrics.reduce((sum, metric) => sum + (metric.data?.responseTime || 0), 0);
    return Math.round(totalTime / metrics.length);
  }
  
  /**
   * Calculate average processing time from metrics
   */
  private static calculateAverageProcessingTime(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const totalTime = metrics.reduce((sum, metric) => sum + (metric.data?.processingTime || metric.data?.generationTime || 0), 0);
    return Math.round(totalTime / metrics.length);
  }
}
