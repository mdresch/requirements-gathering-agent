import { Request, Response, NextFunction } from 'express';
import { predictiveAnalyticsService } from '../../services/PredictiveAnalyticsService.js';
import { resourceDemandForecastingService } from '../../services/ResourceDemandForecastingService.js';
import { costForecastingService } from '../../services/CostForecastingService.js';
import { capacityPlanningService } from '../../services/CapacityPlanningService.js';
import { anomalyDetectionService } from '../../services/AnomalyDetectionService.js';
import { logger } from '../../utils/logger.js';

/**
 * Predictive Analytics Controller
 * Provides endpoints for predictive analytics dashboard and visualization
 */

export class PredictiveAnalyticsController {
  /**
   * Get comprehensive predictive analytics dashboard
   * GET /api/v1/analytics/predictive/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { timeRange = '30d', resourceType } = req.query;

      logger.info('Getting predictive analytics dashboard', { requestId, timeRange, resourceType });

      // Calculate time range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      // Get resource forecasts
      const resourceTypes = resourceType ? [resourceType as string] : ['compute', 'storage', 'bandwidth', 'ai_tokens', 'api_calls', 'users'];
      const resourceForecasts = await Promise.all(
        resourceTypes.map(async (type) => {
          try {
            return await resourceDemandForecastingService.generateDemandForecast(type, { start: startDate, end: endDate });
          } catch (error) {
            logger.warn(`Failed to get forecast for ${type}:`, error);
            return null;
          }
        })
      );

      // Get cost forecasts
      const costForecast = await costForecastingService.generateDetailedCostForecast('total', { start: startDate, end: endDate });

      // Get capacity plans
      const capacityPlans = await Promise.all(
        resourceTypes.map(async (type) => {
          try {
            return await capacityPlanningService.generateCapacityPlan(type, { start: startDate, end: endDate });
          } catch (error) {
            logger.warn(`Failed to get capacity plan for ${type}:`, error);
            return null;
          }
        })
      );

      // Get active anomalies and warnings
      const activeAnomalies = anomalyDetectionService.getActiveAnomalies();
      const activeWarnings = anomalyDetectionService.getActiveWarnings();

      // Get optimization opportunities
      const optimizationOpportunities = await costForecastingService.identifyOptimizationOpportunities('total', { start: startDate, end: endDate });

      // Aggregate dashboard data
      const dashboardData = {
        summary: {
          totalResources: resourceTypes.length,
          activeAnomalies: activeAnomalies.length,
          activeWarnings: activeWarnings.length,
          optimizationOpportunities: optimizationOpportunities.length,
          totalPotentialSavings: optimizationOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0)
        },
        resourceForecasts: resourceForecasts.filter(f => f !== null),
        costForecast,
        capacityPlans: capacityPlans.filter(p => p !== null),
        activeAnomalies: activeAnomalies.slice(0, 10), // Latest 10
        activeWarnings: activeWarnings.slice(0, 10), // Latest 10
        optimizationOpportunities: optimizationOpportunities.slice(0, 5), // Top 5
        timeRange: { start: startDate, end: endDate, days },
        lastUpdated: new Date().toISOString()
      };

      res.json({
        success: true,
        data: dashboardData,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get predictive analytics dashboard', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DASHBOARD_FAILED',
          message: 'Failed to retrieve predictive analytics dashboard'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get resource demand forecasts
   * GET /api/v1/analytics/predictive/resource-forecasts
   */
  static async getResourceForecasts(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { resourceType, startDate, endDate } = req.query;

      if (!resourceType) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_RESOURCE_TYPE',
            message: 'resourceType is required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const timeRange = {
        start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate as string) : new Date()
      };

      logger.info('Getting resource demand forecast', { requestId, resourceType, timeRange });

      const forecast = await resourceDemandForecastingService.generateDemandForecast(
        resourceType as string,
        timeRange
      );

      res.json({
        success: true,
        data: forecast,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get resource forecast', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'RESOURCE_FORECAST_FAILED',
          message: 'Failed to retrieve resource demand forecast'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get cost forecasts
   * GET /api/v1/analytics/predictive/cost-forecasts
   */
  static async getCostForecasts(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { category = 'total', startDate, endDate } = req.query;

      const timeRange = {
        start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate as string) : new Date()
      };

      logger.info('Getting cost forecast', { requestId, category, timeRange });

      const forecast = await costForecastingService.generateDetailedCostForecast(
        category as string,
        timeRange
      );

      res.json({
        success: true,
        data: forecast,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get cost forecast', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'COST_FORECAST_FAILED',
          message: 'Failed to retrieve cost forecast'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get capacity plans
   * GET /api/v1/analytics/predictive/capacity-plans
   */
  static async getCapacityPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { resourceType, startDate, endDate } = req.query;

      const timeRange = {
        start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate as string) : new Date()
      };

      logger.info('Getting capacity plan', { requestId, resourceType, timeRange });

      if (resourceType) {
        const plan = await capacityPlanningService.generateCapacityPlan(resourceType as string, timeRange);
        
        res.json({
          success: true,
          data: plan,
          requestId,
          timestamp: new Date().toISOString()
        });
      } else {
        const plans = capacityPlanningService.getAllCapacityPlans();
        
        res.json({
          success: true,
          data: plans,
          requestId,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error: any) {
      logger.error('Failed to get capacity plan', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CAPACITY_PLAN_FAILED',
          message: 'Failed to retrieve capacity plan'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get anomalies
   * GET /api/v1/analytics/predictive/anomalies
   */
  static async getAnomalies(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { metric, status = 'active', limit = '50' } = req.query;

      logger.info('Getting anomalies', { requestId, metric, status, limit });

      let anomalies = metric ? 
        await anomalyDetectionService.detectAnomalies(metric as string) :
        anomalyDetectionService.getActiveAnomalies();

      // Filter by status
      if (status !== 'active') {
        anomalies = anomalies.filter(anomaly => anomaly.status === status);
      }

      // Limit results
      const limitNum = parseInt(limit as string);
      anomalies = anomalies.slice(0, limitNum);

      res.json({
        success: true,
        data: {
          anomalies,
          total: anomalies.length,
          status,
          metric: metric || 'all'
        },
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get anomalies', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ANOMALIES_FAILED',
          message: 'Failed to retrieve anomalies'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get early warnings
   * GET /api/v1/analytics/predictive/warnings
   */
  static async getWarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { type, severity, limit = '50' } = req.query;

      logger.info('Getting early warnings', { requestId, type, severity, limit });

      let warnings = anomalyDetectionService.getActiveWarnings();

      // Filter by type
      if (type) {
        warnings = warnings.filter(warning => warning.type === type);
      }

      // Filter by severity
      if (severity) {
        warnings = warnings.filter(warning => warning.severity === severity);
      }

      // Limit results
      const limitNum = parseInt(limit as string);
      warnings = warnings.slice(0, limitNum);

      res.json({
        success: true,
        data: {
          warnings,
          total: warnings.length,
          type: type || 'all',
          severity: severity || 'all'
        },
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get warnings', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'WARNINGS_FAILED',
          message: 'Failed to retrieve early warnings'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get optimization opportunities
   * GET /api/v1/analytics/predictive/optimization-opportunities
   */
  static async getOptimizationOpportunities(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { category = 'total', startDate, endDate } = req.query;

      const timeRange = {
        start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate as string) : new Date()
      };

      logger.info('Getting optimization opportunities', { requestId, category, timeRange });

      const opportunities = await costForecastingService.identifyOptimizationOpportunities(
        category as string,
        timeRange
      );

      res.json({
        success: true,
        data: {
          opportunities,
          total: opportunities.length,
          totalPotentialSavings: opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0),
          category
        },
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get optimization opportunities', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'OPTIMIZATION_OPPORTUNITIES_FAILED',
          message: 'Failed to retrieve optimization opportunities'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get prediction accuracy metrics
   * GET /api/v1/analytics/predictive/accuracy
   */
  static async getPredictionAccuracy(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { metric, days = '30' } = req.query;

      logger.info('Getting prediction accuracy', { requestId, metric, days });

      const accuracyData = await predictiveAnalyticsService.getPredictionAccuracy(
        metric as string || 'document_generation',
        parseInt(days as string)
      );

      res.json({
        success: true,
        data: accuracyData,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get prediction accuracy', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PREDICTION_ACCURACY_FAILED',
          message: 'Failed to retrieve prediction accuracy metrics'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Acknowledge anomaly
   * POST /api/v1/analytics/predictive/anomalies/:anomalyId/acknowledge
   */
  static async acknowledgeAnomaly(req: Request, res: Response, next: NextFunction) {
    try {
      const { anomalyId } = req.params;
      const { userId } = req.body;
      const requestId = req.headers['x-request-id'] as string || 'unknown';

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: 'userId is required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Acknowledging anomaly', { requestId, anomalyId, userId });

      const success = anomalyDetectionService.acknowledgeAnomaly(anomalyId, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Anomaly acknowledged successfully',
          requestId,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          success: false,
          error: {
            code: 'ANOMALY_NOT_FOUND',
            message: 'Anomaly not found'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error: any) {
      logger.error('Failed to acknowledge anomaly', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ACKNOWLEDGE_ANOMALY_FAILED',
          message: 'Failed to acknowledge anomaly'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Resolve anomaly
   * POST /api/v1/analytics/predictive/anomalies/:anomalyId/resolve
   */
  static async resolveAnomaly(req: Request, res: Response, next: NextFunction) {
    try {
      const { anomalyId } = req.params;
      const { resolution } = req.body;
      const requestId = req.headers['x-request-id'] as string || 'unknown';

      if (!resolution) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_RESOLUTION',
            message: 'resolution is required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Resolving anomaly', { requestId, anomalyId });

      const success = anomalyDetectionService.resolveAnomaly(anomalyId, resolution);

      if (success) {
        res.json({
          success: true,
          message: 'Anomaly resolved successfully',
          requestId,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          success: false,
          error: {
            code: 'ANOMALY_NOT_FOUND',
            message: 'Anomaly not found'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error: any) {
      logger.error('Failed to resolve anomaly', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'RESOLVE_ANOMALY_FAILED',
          message: 'Failed to resolve anomaly'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Acknowledge early warning
   * POST /api/v1/analytics/predictive/warnings/:warningId/acknowledge
   */
  static async acknowledgeWarning(req: Request, res: Response, next: NextFunction) {
    try {
      const { warningId } = req.params;
      const { userId } = req.body;
      const requestId = req.headers['x-request-id'] as string || 'unknown';

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: 'userId is required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Acknowledging warning', { requestId, warningId, userId });

      const success = anomalyDetectionService.acknowledgeWarning(warningId, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Warning acknowledged successfully',
          requestId,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          success: false,
          error: {
            code: 'WARNING_NOT_FOUND',
            message: 'Warning not found'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error: any) {
      logger.error('Failed to acknowledge warning', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ACKNOWLEDGE_WARNING_FAILED',
          message: 'Failed to acknowledge warning'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Execute scaling action
   * POST /api/v1/analytics/predictive/scale
   */
  static async executeScaling(req: Request, res: Response, next: NextFunction) {
    try {
      const { resourceType, action, targetCapacity, reason } = req.body;
      const requestId = req.headers['x-request-id'] as string || 'unknown';

      if (!resourceType || !action || !targetCapacity || !reason) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'resourceType, action, targetCapacity, and reason are required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Executing scaling action', { requestId, resourceType, action, targetCapacity, reason });

      const result = await capacityPlanningService.executeScalingAction(
        resourceType,
        action,
        targetCapacity,
        reason
      );

      res.json({
        success: true,
        data: result,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to execute scaling action', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SCALING_ACTION_FAILED',
          message: 'Failed to execute scaling action'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
}
