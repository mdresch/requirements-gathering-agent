/**
 * Scope Control Controller
 * API endpoints for adaptive scope control functionality
 * 
 * @class ScopeControlController
 * @description Provides REST API endpoints for scope control operations including
 * scope change management, monitoring, and PMBOK compliance validation
 * 
 * @version 1.0.0
 * @since 3.2.0
 */

import { Request, Response } from 'express';
import { AdaptiveScopeControlService, ScopeChange, AdaptiveControlSettings } from '../../services/AdaptiveScopeControlService.js';
import { Project } from '../../models/Project.js';
import { logger } from '../../utils/logger.js';

export class ScopeControlController {
  private static scopeControlService = new AdaptiveScopeControlService();

  /**
   * Initialize scope control monitoring for a project
   * POST /api/projects/:projectId/scope-control/initialize
   */
  public static async initializeScopeControl(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const settings: Partial<AdaptiveControlSettings> = req.body.settings || {};

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: `No project found with ID: ${projectId}`
        });
        return;
      }

      // Initialize scope control
      await ScopeControlController.scopeControlService.initializeProjectMonitoring(project, settings);

      res.status(200).json({
        success: true,
        message: 'Scope control monitoring initialized successfully',
        data: {
          projectId,
          settings: settings,
          monitoringActive: true
        }
      });

    } catch (error) {
      logger.error('Failed to initialize scope control:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize scope control monitoring',
        error: error.message
      });
    }
  }

  /**
   * Submit a scope change request
   * POST /api/projects/:projectId/scope-control/changes
   */
  public static async submitScopeChange(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const changeRequest = req.body;

      // Validate required fields
      const requiredFields = ['changeType', 'description', 'requestedBy', 'impact'];
      const missingFields = requiredFields.filter(field => !changeRequest[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields',
          error: `Required fields missing: ${missingFields.join(', ')}`
        });
        return;
      }

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: `No project found with ID: ${projectId}`
        });
        return;
      }

      // Submit scope change
      const scopeChange = await ScopeControlController.scopeControlService.submitScopeChange({
        ...changeRequest,
        projectId,
        requestDate: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Scope change request submitted successfully',
        data: {
          change: scopeChange,
          autoApproved: scopeChange.status === 'approved'
        }
      });

    } catch (error) {
      logger.error('Failed to submit scope change:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit scope change request',
        error: error.message
      });
    }
  }

  /**
   * Approve a scope change
   * PUT /api/scope-control/changes/:changeId/approve
   */
  public static async approveScopeChange(req: Request, res: Response): Promise<void> {
    try {
      const { changeId } = req.params;
      const { approvedBy } = req.body;

      if (!approvedBy) {
        res.status(400).json({
          success: false,
          message: 'Approver information required',
          error: 'approvedBy field is required'
        });
        return;
      }

      const approvedChange = await ScopeControlController.scopeControlService.approveScopeChange(changeId, approvedBy);

      res.status(200).json({
        success: true,
        message: 'Scope change approved successfully',
        data: {
          change: approvedChange
        }
      });

    } catch (error) {
      logger.error('Failed to approve scope change:', error);
      
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Scope change not found',
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to approve scope change',
          error: error.message
        });
      }
    }
  }

  /**
   * Get scope metrics for a project
   * GET /api/projects/:projectId/scope-control/metrics
   */
  public static async getScopeMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: `No project found with ID: ${projectId}`
        });
        return;
      }

      const metrics = await ScopeControlController.scopeControlService.getScopeMetrics(projectId);

      res.status(200).json({
        success: true,
        message: 'Scope metrics retrieved successfully',
        data: {
          projectId,
          metrics,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to get scope metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve scope metrics',
        error: error.message
      });
    }
  }

  /**
   * Get scope alerts for a project
   * GET /api/projects/:projectId/scope-control/alerts
   */
  public static async getScopeAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: `No project found with ID: ${projectId}`
        });
        return;
      }

      const alerts = await ScopeControlController.scopeControlService.getScopeAlerts(projectId);

      res.status(200).json({
        success: true,
        message: 'Scope alerts retrieved successfully',
        data: {
          projectId,
          alerts,
          alertCount: alerts.length,
          criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to get scope alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve scope alerts',
        error: error.message
      });
    }
  }

  /**
   * Detect scope creep for a project
   * POST /api/projects/:projectId/scope-control/detect-creep
   */
  public static async detectScopeCreep(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: `No project found with ID: ${projectId}`
        });
        return;
      }

      const scopeCreepDetected = await ScopeControlController.scopeControlService.detectScopeCreep(projectId);
      const metrics = await ScopeControlController.scopeControlService.getScopeMetrics(projectId);
      const alerts = scopeCreepDetected ? await ScopeControlController.scopeControlService.getScopeAlerts(projectId) : [];

      res.status(200).json({
        success: true,
        message: 'Scope creep detection completed',
        data: {
          projectId,
          scopeCreepDetected,
          metrics,
          alerts: alerts.filter(a => a.alertType === 'scope_creep'),
          recommendations: scopeCreepDetected ? [
            'Review recent scope changes for patterns',
            'Conduct stakeholder alignment session',
            'Reassess project scope baseline',
            'Implement stricter change control procedures',
            'Consider scope reduction or timeline adjustment'
          ] : [],
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to detect scope creep:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform scope creep detection',
        error: error.message
      });
    }
  }

  /**
   * Stop scope control monitoring for a project
   * DELETE /api/projects/:projectId/scope-control/monitoring
   */
  public static async stopScopeControlMonitoring(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: `No project found with ID: ${projectId}`
        });
        return;
      }

      ScopeControlController.scopeControlService.stopProjectMonitoring(projectId);

      res.status(200).json({
        success: true,
        message: 'Scope control monitoring stopped successfully',
        data: {
          projectId,
          monitoringActive: false,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to stop scope control monitoring:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop scope control monitoring',
        error: error.message
      });
    }
  }

  /**
   * Get scope control dashboard data
   * GET /api/projects/:projectId/scope-control/dashboard
   */
  public static async getScopeControlDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
          error: `No project found with ID: ${projectId}`
        });
        return;
      }

      // Gather comprehensive dashboard data
      const [metrics, alerts, scopeCreepDetected] = await Promise.all([
        ScopeControlController.scopeControlService.getScopeMetrics(projectId),
        ScopeControlController.scopeControlService.getScopeAlerts(projectId),
        ScopeControlController.scopeControlService.detectScopeCreep(projectId)
      ]);

      // Calculate dashboard insights
      const dashboardData = {
        project: {
          id: project._id,
          name: project.name,
          status: project.status,
          framework: project.framework
        },
        scopeControl: {
          metrics,
          alerts,
          scopeCreepDetected,
          healthScore: ScopeControlController.calculateHealthScore(metrics, alerts),
          riskLevel: ScopeControlController.calculateRiskLevel(metrics, alerts),
          recommendations: ScopeControlController.generateRecommendations(metrics, alerts, scopeCreepDetected)
        },
        timestamp: new Date()
      };

      res.status(200).json({
        success: true,
        message: 'Scope control dashboard data retrieved successfully',
        data: dashboardData
      });

    } catch (error) {
      logger.error('Failed to get scope control dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve scope control dashboard data',
        error: error.message
      });
    }
  }

  // Helper methods

  private static calculateHealthScore(metrics: any, alerts: any[]): number {
    let score = 100;

    // Deduct points for various issues
    score -= metrics.scopeCreepIndex * 20;
    score -= (100 - metrics.pmbokComplianceScore) * 0.5;
    score -= alerts.filter(a => a.severity === 'critical').length * 15;
    score -= alerts.filter(a => a.severity === 'warning').length * 5;

    return Math.max(0, Math.min(100, score));
  }

  private static calculateRiskLevel(metrics: any, alerts: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const healthScore = ScopeControlController.calculateHealthScore(metrics, alerts);

    if (criticalAlerts > 0 || healthScore < 50) return 'critical';
    if (metrics.scopeCreepIndex > 0.5 || healthScore < 70) return 'high';
    if (metrics.scopeCreepIndex > 0.3 || healthScore < 85) return 'medium';
    return 'low';
  }

  private static generateRecommendations(metrics: any, alerts: any[], scopeCreepDetected: boolean): string[] {
    const recommendations: string[] = [];

    if (scopeCreepDetected) {
      recommendations.push('Immediate scope review required - scope creep detected');
      recommendations.push('Conduct emergency stakeholder alignment meeting');
    }

    if (metrics.pmbokComplianceScore < 80) {
      recommendations.push('Improve PMBOK compliance documentation');
      recommendations.push('Conduct PMBOK training for project team');
    }

    if (metrics.changeVelocity > 2) {
      recommendations.push('Implement stricter change control procedures');
      recommendations.push('Review change approval thresholds');
    }

    if (alerts.filter(a => a.severity === 'critical').length > 0) {
      recommendations.push('Address critical scope control alerts immediately');
    }

    if (recommendations.length === 0) {
      recommendations.push('Scope control is operating within acceptable parameters');
      recommendations.push('Continue regular monitoring and maintain current practices');
    }

    return recommendations;
  }
}