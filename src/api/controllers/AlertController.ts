import { Request, Response, NextFunction } from 'express';
import { alertSystemService } from '../../services/AlertSystemService.js';
import { Alert, AlertThreshold, AlertRule } from '../../models/Alert.model.js';
import { logger } from '../../utils/logger.js';

export class AlertController {
  // Alert Management
  static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { status, severity, limit = 100, projectId, metric } = req.query;

      logger.debug(`Getting alerts - Request ID: ${requestId}`, {
        status, severity, limit, projectId, metric
      });

      let alerts;
      
      if (projectId) {
        alerts = await Alert.getByProject(projectId as string, parseInt(limit as string));
      } else if (metric) {
        alerts = await Alert.getByMetric(metric as string, parseInt(limit as string));
      } else if (severity) {
        alerts = await Alert.getBySeverity(severity as string, parseInt(limit as string));
      } else if (status === 'active') {
        alerts = await Alert.getActive(parseInt(limit as string));
      } else {
        alerts = await Alert.find({
          ...(status && { status }),
          ...(severity && { severity })
        })
        .sort({ triggeredAt: -1 })
        .limit(parseInt(limit as string));
      }

      res.json({
        success: true,
        data: {
          alerts,
          count: alerts.length,
          filters: { status, severity, projectId, metric }
        },
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting alerts:', error);
      next(error);
    }
  }

  static async getAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { id } = req.params;

      logger.debug(`Getting alert - Request ID: ${requestId}`, { alertId: id });

      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found',
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        data: { alert },
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting alert:', error);
      next(error);
    }
  }

  static async acknowledgeAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { id } = req.params;
      const { userId } = req.body;

      logger.debug(`Acknowledging alert - Request ID: ${requestId}`, { alertId: id, userId });

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found',
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Update alert in database
      alert.status = 'acknowledged';
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = userId;
      await alert.save();

      // Update alert in service
      alertSystemService.acknowledgeAlert(id, userId);

      res.json({
        success: true,
        data: { alert },
        message: 'Alert acknowledged successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error acknowledging alert:', error);
      next(error);
    }
  }

  static async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { id } = req.params;
      const { userId, resolutionNotes } = req.body;

      logger.debug(`Resolving alert - Request ID: ${requestId}`, { alertId: id, userId });

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const alert = await Alert.findById(id);
      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found',
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Update alert in database
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      alert.resolvedBy = userId;
      alert.resolutionNotes = resolutionNotes;
      await alert.save();

      // Update alert in service
      alertSystemService.resolveAlert(id, userId, resolutionNotes);

      res.json({
        success: true,
        data: { alert },
        message: 'Alert resolved successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error resolving alert:', error);
      next(error);
    }
  }

  static async getAlertStats(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { projectId, days = 30 } = req.query;

      logger.debug(`Getting alert stats - Request ID: ${requestId}`, { projectId, days });

      const stats = await Alert.getAlertStats(
        projectId as string, 
        parseInt(days as string)
      );

      const metrics = alertSystemService.getAlertMetrics();

      res.json({
        success: true,
        data: {
          database: stats,
          service: metrics,
          period: {
            days: parseInt(days as string),
            projectId: projectId as string || 'all'
          }
        },
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting alert stats:', error);
      next(error);
    }
  }

  // Alert Threshold Management
  static async getThresholds(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { metric, severity, enabled, projectId } = req.query;

      logger.debug(`Getting alert thresholds - Request ID: ${requestId}`, {
        metric, severity, enabled, projectId
      });

      let thresholds;
      
      if (metric) {
        thresholds = await AlertThreshold.getByMetric(metric as string, enabled !== 'false');
      } else if (severity) {
        thresholds = await AlertThreshold.getBySeverity(severity as string, enabled !== 'false');
      } else if (projectId) {
        thresholds = await AlertThreshold.getByProject(projectId as string, enabled !== 'false');
      } else {
        const query: any = {};
        if (enabled !== undefined) query.enabled = enabled === 'true';
        if (metric) query.metric = metric;
        if (severity) query.severity = severity;
        
        thresholds = await AlertThreshold.find(query).sort({ createdAt: -1 });
      }

      res.json({
        success: true,
        data: {
          thresholds,
          count: thresholds.length,
          filters: { metric, severity, enabled, projectId }
        },
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting alert thresholds:', error);
      next(error);
    }
  }

  static async createThreshold(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const thresholdData = req.body;

      logger.debug(`Creating alert threshold - Request ID: ${requestId}`, thresholdData);

      // Validate required fields
      const requiredFields = ['name', 'description', 'metric', 'operator', 'value', 'severity'];
      for (const field of requiredFields) {
        if (!thresholdData[field]) {
          return res.status(400).json({
            success: false,
            error: `${field} is required`,
            requestId,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Create threshold in database
      const threshold = new AlertThreshold(thresholdData);
      await threshold.save();

      // Create threshold in service
      const serviceThreshold = alertSystemService.createThreshold(thresholdData);

      res.status(201).json({
        success: true,
        data: { threshold },
        message: 'Alert threshold created successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error creating alert threshold:', error);
      next(error);
    }
  }

  static async updateThreshold(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { id } = req.params;
      const updates = req.body;

      logger.debug(`Updating alert threshold - Request ID: ${requestId}`, { thresholdId: id, updates });

      const threshold = await AlertThreshold.findById(id);
      if (!threshold) {
        return res.status(404).json({
          success: false,
          error: 'Alert threshold not found',
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Update threshold in database
      Object.assign(threshold, updates);
      await threshold.save();

      // Update threshold in service
      alertSystemService.updateThreshold(id, updates);

      res.json({
        success: true,
        data: { threshold },
        message: 'Alert threshold updated successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error updating alert threshold:', error);
      next(error);
    }
  }

  static async deleteThreshold(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { id } = req.params;

      logger.debug(`Deleting alert threshold - Request ID: ${requestId}`, { thresholdId: id });

      const threshold = await AlertThreshold.findById(id);
      if (!threshold) {
        return res.status(404).json({
          success: false,
          error: 'Alert threshold not found',
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Delete from database
      await AlertThreshold.findByIdAndDelete(id);

      // Delete from service
      alertSystemService.deleteThreshold(id);

      res.json({
        success: true,
        message: 'Alert threshold deleted successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error deleting alert threshold:', error);
      next(error);
    }
  }

  // Alert Rule Management
  static async getRules(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { enabled, priority } = req.query;

      logger.debug(`Getting alert rules - Request ID: ${requestId}`, { enabled, priority });

      let rules;
      
      if (enabled !== undefined) {
        rules = await AlertRule.find({ enabled: enabled === 'true' }).sort({ priority: 1 });
      } else if (priority) {
        rules = await AlertRule.getByPriority(parseInt(priority as string));
      } else {
        rules = await AlertRule.find().sort({ priority: 1, createdAt: -1 });
      }

      res.json({
        success: true,
        data: {
          rules,
          count: rules.length,
          filters: { enabled, priority }
        },
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting alert rules:', error);
      next(error);
    }
  }

  static async createRule(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const ruleData = req.body;

      logger.debug(`Creating alert rule - Request ID: ${requestId}`, ruleData);

      // Validate required fields
      const requiredFields = ['name', 'description', 'conditions', 'actions'];
      for (const field of requiredFields) {
        if (!ruleData[field]) {
          return res.status(400).json({
            success: false,
            error: `${field} is required`,
            requestId,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Create rule in database
      const rule = new AlertRule(ruleData);
      await rule.save();

      // Create rule in service
      alertSystemService.createRule(ruleData);

      res.status(201).json({
        success: true,
        data: { rule },
        message: 'Alert rule created successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error creating alert rule:', error);
      next(error);
    }
  }

  // System Operations
  static async triggerTestAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { metric, value, severity = 'warning' } = req.body;

      logger.debug(`Triggering test alert - Request ID: ${requestId}`, { metric, value, severity });

      if (!metric || value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Metric and value are required',
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Create a test threshold
      const testThreshold = {
        name: `Test Alert - ${metric}`,
        description: `Test alert for ${metric}`,
        metric,
        operator: 'gt' as const,
        value: parseFloat(value) - 0.01, // Slightly lower to trigger
        severity: severity as 'info' | 'warning' | 'critical' | 'emergency',
        enabled: true,
        cooldownMinutes: 0 // No cooldown for test alerts
      };

      const threshold = alertSystemService.createThreshold(testThreshold);
      
      // Manually trigger the alert check
      await alertSystemService.checkThresholds();

      res.json({
        success: true,
        data: { 
          threshold,
          testMetric: { metric, value, severity }
        },
        message: 'Test alert triggered successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error triggering test alert:', error);
      next(error);
    }
  }

  static async getSystemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';

      logger.debug(`Getting alert system status - Request ID: ${requestId}`);

      const metrics = alertSystemService.getAlertMetrics();
      const thresholds = alertSystemService.getThresholds();
      const rules = alertSystemService.getRules();

      // Get recent alerts from database
      const recentAlerts = await Alert.find()
        .sort({ triggeredAt: -1 })
        .limit(10);

      res.json({
        success: true,
        data: {
          status: 'operational',
          monitoring: true,
          metrics,
          thresholds: {
            total: thresholds.length,
            enabled: thresholds.filter(t => t.enabled).length,
            disabled: thresholds.filter(t => !t.enabled).length
          },
          rules: {
            total: rules.length,
            enabled: rules.filter(r => r.enabled).length,
            disabled: rules.filter(r => !r.enabled).length
          },
          recentAlerts,
          lastChecked: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting alert system status:', error);
      next(error);
    }
  }
}
