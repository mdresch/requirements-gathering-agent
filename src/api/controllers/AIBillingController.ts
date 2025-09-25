import { Request, Response, NextFunction } from 'express';
import { aiProviderBillingService } from '../../services/AIProviderBillingService.js';
import { budgetMonitoringService } from '../../services/BudgetMonitoringService.js';
import { logger } from '../../utils/logger.js';

/**
 * AI Billing Controller
 * Provides endpoints for AI provider billing analytics and budget monitoring
 */

export class AIBillingController {
  /**
   * Get AI billing analytics
   * GET /api/v1/billing/analytics
   */
  static async getBillingAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const userId = (req as any).user?.id;
      const projectId = req.query.projectId as string;
      const provider = req.query.provider as string;
      const days = parseInt(req.query.days as string) || 30;
      
      logger.info('Getting AI billing analytics', { requestId, userId, projectId, provider, days });
      
      // Get usage analytics
      const usageAnalytics = await aiProviderBillingService.getUsageAnalytics(
        provider,
        projectId,
        userId,
        days
      );
      
      // Get cost analytics
      const costAnalytics = await budgetMonitoringService.getCostAnalytics(undefined, days);
      
      // Get all pricing information
      const pricing = aiProviderBillingService.getAllPricing();
      
      res.json({
        success: true,
        data: {
          usage: usageAnalytics,
          cost: costAnalytics,
          pricing: pricing,
          period: { days },
          filters: {
            provider,
            projectId,
            userId
          },
          timestamp: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to get billing analytics', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'BILLING_ANALYTICS_FAILED',
          message: 'Failed to retrieve billing analytics'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get cost estimation for an AI operation
   * POST /api/v1/billing/estimate
   */
  static async estimateCost(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { provider, model, promptTokens, estimatedCompletionTokens, confidence } = req.body;
      
      if (!provider || !model || promptTokens === undefined || estimatedCompletionTokens === undefined) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'provider, model, promptTokens, and estimatedCompletionTokens are required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      const estimate = budgetMonitoringService.estimateCost(
        provider,
        model,
        promptTokens,
        estimatedCompletionTokens,
        confidence || 'medium'
      );
      
      res.json({
        success: true,
        data: estimate,
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to estimate cost', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'COST_ESTIMATION_FAILED',
          message: 'Failed to estimate cost'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get budget statuses
   * GET /api/v1/billing/budgets
   */
  static async getBudgetStatuses(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      
      const budgetStatuses = await budgetMonitoringService.getBudgetStatuses();
      
      res.json({
        success: true,
        data: {
          budgets: budgetStatuses,
          summary: {
            totalBudgets: budgetStatuses.length,
            healthyBudgets: budgetStatuses.filter(b => b.status === 'healthy').length,
            warningBudgets: budgetStatuses.filter(b => b.status === 'warning').length,
            criticalBudgets: budgetStatuses.filter(b => b.status === 'critical').length,
            exceededBudgets: budgetStatuses.filter(b => b.status === 'exceeded').length
          },
          timestamp: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to get budget statuses', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'BUDGET_STATUS_FAILED',
          message: 'Failed to retrieve budget statuses'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Create a new budget
   * POST /api/v1/billing/budgets
   */
  static async createBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { name, projectId, userId, provider, monthlyBudget, dailyBudget, currency, alertThresholds } = req.body;
      
      if (!name || !monthlyBudget || !currency) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'name, monthlyBudget, and currency are required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      const budgetId = budgetMonitoringService.createBudget({
        name,
        projectId,
        userId,
        provider,
        monthlyBudget,
        dailyBudget,
        currency,
        alertThresholds: alertThresholds || { warning: 75, critical: 90 },
        isActive: true
      });
      
      res.status(201).json({
        success: true,
        data: { budgetId },
        message: 'Budget created successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to create budget', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'BUDGET_CREATION_FAILED',
          message: 'Failed to create budget'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Update a budget
   * PUT /api/v1/billing/budgets/:budgetId
   */
  static async updateBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const { budgetId } = req.params;
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const updates = req.body;
      
      const success = budgetMonitoringService.updateBudget(budgetId, updates);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BUDGET_NOT_FOUND',
            message: 'Budget not found'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        success: true,
        message: 'Budget updated successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to update budget', { 
        error: error.message,
        budgetId: req.params.budgetId,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'BUDGET_UPDATE_FAILED',
          message: 'Failed to update budget'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get budget alerts
   * GET /api/v1/billing/alerts
   */
  static async getBudgetAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const acknowledged = req.query.acknowledged === 'true' ? true : req.query.acknowledged === 'false' ? false : undefined;
      
      const alerts = budgetMonitoringService.getAllAlerts(acknowledged);
      
      res.json({
        success: true,
        data: {
          alerts,
          summary: {
            total: alerts.length,
            unacknowledged: alerts.filter(a => !a.acknowledged).length,
            acknowledged: alerts.filter(a => a.acknowledged).length,
            warning: alerts.filter(a => a.type === 'warning').length,
            critical: alerts.filter(a => a.type === 'critical').length,
            exceeded: alerts.filter(a => a.type === 'exceeded').length
          },
          timestamp: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to get budget alerts', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'BUDGET_ALERTS_FAILED',
          message: 'Failed to retrieve budget alerts'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Acknowledge a budget alert
   * POST /api/v1/billing/alerts/:alertId/acknowledge
   */
  static async acknowledgeAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { alertId } = req.params;
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      
      const success = budgetMonitoringService.acknowledgeAlert(alertId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ALERT_NOT_FOUND',
            message: 'Alert not found'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        success: true,
        message: 'Alert acknowledged successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to acknowledge alert', { 
        error: error.message,
        alertId: req.params.alertId,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ALERT_ACKNOWLEDGMENT_FAILED',
          message: 'Failed to acknowledge alert'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get provider billing information
   * GET /api/v1/billing/providers/:provider
   */
  static async getProviderBillingInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider } = req.params;
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      
      const billingInfo = await aiProviderBillingService.getProviderBillingInfo(provider);
      
      if (!billingInfo) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROVIDER_NOT_FOUND',
            message: `No billing information available for provider: ${provider}`
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        success: true,
        data: billingInfo,
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to get provider billing info', { 
        error: error.message,
        provider: req.params.provider,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PROVIDER_BILLING_INFO_FAILED',
          message: 'Failed to retrieve provider billing information'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
}
