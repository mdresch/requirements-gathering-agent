import { logger } from '../utils/logger.js';
import { aiProviderBillingService } from './AIProviderBillingService.js';

/**
 * Budget Monitoring Service
 * Provides cost estimation, budget tracking, and alerts for AI usage
 */

export interface BudgetConfig {
  id: string;
  name: string;
  projectId?: string;
  userId?: string;
  provider?: string;
  monthlyBudget: number;
  dailyBudget?: number;
  currency: string;
  alertThresholds: {
    warning: number; // Percentage (e.g., 80 for 80%)
    critical: number; // Percentage (e.g., 95 for 95%)
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostEstimate {
  provider: string;
  model: string;
  estimatedTokens: number;
  estimatedCost: number;
  currency: string;
  breakdown: {
    promptTokens: number;
    completionTokens: number;
    promptCost: number;
    completionCost: number;
  };
  confidence: 'low' | 'medium' | 'high';
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: 'warning' | 'critical' | 'exceeded';
  message: string;
  currentUsage: number;
  budget: number;
  percentage: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface BudgetStatus {
  budgetId: string;
  name: string;
  currentUsage: number;
  budget: number;
  percentage: number;
  remaining: number;
  status: 'healthy' | 'warning' | 'critical' | 'exceeded';
  daysRemaining: number;
  projectedMonthlyCost: number;
  lastAlert?: BudgetAlert;
}

export class BudgetMonitoringService {
  private static instance: BudgetMonitoringService;
  private budgets: Map<string, BudgetConfig> = new Map();
  private alerts: BudgetAlert[] = [];
  private costHistory: Array<{ date: string; cost: number; tokens: number }> = [];

  private constructor() {
    this.initializeDefaultBudgets();
    this.startBudgetMonitoring();
  }

  public static getInstance(): BudgetMonitoringService {
    if (!BudgetMonitoringService.instance) {
      BudgetMonitoringService.instance = new BudgetMonitoringService();
    }
    return BudgetMonitoringService.instance;
  }

  /**
   * Create a new budget configuration
   */
  public createBudget(config: Omit<BudgetConfig, 'id' | 'createdAt' | 'updatedAt'>): string {
    const budgetId = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const budget: BudgetConfig = {
      ...config,
      id: budgetId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.budgets.set(budgetId, budget);
    
    logger.info('Budget created', {
      budgetId,
      name: budget.name,
      monthlyBudget: budget.monthlyBudget,
      currency: budget.currency
    });

    return budgetId;
  }

  /**
   * Update an existing budget
   */
  public updateBudget(budgetId: string, updates: Partial<Omit<BudgetConfig, 'id' | 'createdAt'>>): boolean {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      logger.warn('Budget not found for update', { budgetId });
      return false;
    }

    const updatedBudget: BudgetConfig = {
      ...budget,
      ...updates,
      updatedAt: new Date()
    };

    this.budgets.set(budgetId, updatedBudget);
    
    logger.info('Budget updated', {
      budgetId,
      updates: Object.keys(updates)
    });

    return true;
  }

  /**
   * Delete a budget
   */
  public deleteBudget(budgetId: string): boolean {
    const deleted = this.budgets.delete(budgetId);
    if (deleted) {
      logger.info('Budget deleted', { budgetId });
    } else {
      logger.warn('Budget not found for deletion', { budgetId });
    }
    return deleted;
  }

  /**
   * Estimate cost for a potential AI operation
   */
  public estimateCost(
    provider: string,
    model: string,
    promptTokens: number,
    estimatedCompletionTokens: number,
    confidence: 'low' | 'medium' | 'high' = 'medium'
  ): CostEstimate {
    try {
      const totalTokens = promptTokens + estimatedCompletionTokens;
      const costData = aiProviderBillingService.calculateCost(
        provider,
        model,
        {
          promptTokens,
          completionTokens: estimatedCompletionTokens,
          totalTokens
        }
      );

      return {
        provider,
        model,
        estimatedTokens: totalTokens,
        estimatedCost: costData.amount,
        currency: costData.currency,
        breakdown: {
          promptTokens,
          completionTokens: estimatedCompletionTokens,
          promptCost: costData.breakdown.promptCost,
          completionCost: costData.breakdown.completionCost
        },
        confidence
      };
    } catch (error: any) {
      logger.error('Failed to estimate cost:', error);
      throw error;
    }
  }

  /**
   * Get budget status for all budgets
   */
  public async getBudgetStatuses(): Promise<BudgetStatus[]> {
    const statuses: BudgetStatus[] = [];

    for (const budget of this.budgets.values()) {
      if (!budget.isActive) continue;

      try {
        const usage = await this.getBudgetUsage(budget);
        const percentage = (usage.currentCost / budget.monthlyBudget) * 100;
        const remaining = budget.monthlyBudget - usage.currentCost;
        const daysRemaining = this.getDaysRemainingInMonth();
        const projectedMonthlyCost = this.projectMonthlyCost(usage.currentCost);

        let status: BudgetStatus['status'] = 'healthy';
        if (percentage >= budget.alertThresholds.critical || remaining <= 0) {
          status = remaining <= 0 ? 'exceeded' : 'critical';
        } else if (percentage >= budget.alertThresholds.warning) {
          status = 'warning';
        }

        const lastAlert = this.getLastAlert(budget.id);

        statuses.push({
          budgetId: budget.id,
          name: budget.name,
          currentUsage: usage.currentCost,
          budget: budget.monthlyBudget,
          percentage: Math.round(percentage * 100) / 100,
          remaining: Math.max(0, remaining),
          status,
          daysRemaining,
          projectedMonthlyCost,
          lastAlert
        });
      } catch (error: any) {
        logger.error(`Failed to get status for budget ${budget.id}:`, error);
      }
    }

    return statuses.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Check budgets and generate alerts
   */
  public async checkBudgets(): Promise<BudgetAlert[]> {
    const newAlerts: BudgetAlert[] = [];

    for (const budget of this.budgets.values()) {
      if (!budget.isActive) continue;

      try {
        const usage = await this.getBudgetUsage(budget);
        const percentage = (usage.currentCost / budget.monthlyBudget) * 100;
        const lastAlert = this.getLastAlert(budget.id);

        // Check if we need to generate a new alert
        let alertType: BudgetAlert['type'] | null = null;
        let message = '';

        if (usage.currentCost >= budget.monthlyBudget) {
          alertType = 'exceeded';
          message = `Budget "${budget.name}" has been exceeded. Current usage: ${usage.currentCost.toFixed(4)} ${budget.currency}`;
        } else if (percentage >= budget.alertThresholds.critical) {
          alertType = 'critical';
          message = `Budget "${budget.name}" is at ${percentage.toFixed(1)}% of limit. Current usage: ${usage.currentCost.toFixed(4)} ${budget.currency}`;
        } else if (percentage >= budget.alertThresholds.warning) {
          alertType = 'warning';
          message = `Budget "${budget.name}" is at ${percentage.toFixed(1)}% of limit. Current usage: ${usage.currentCost.toFixed(4)} ${budget.currency}`;
        }

        // Only create new alert if we haven't already alerted for this threshold
        if (alertType && (!lastAlert || lastAlert.type !== alertType || this.shouldRegenerateAlert(lastAlert))) {
          const alert: BudgetAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            budgetId: budget.id,
            type: alertType,
            message,
            currentUsage: usage.currentCost,
            budget: budget.monthlyBudget,
            percentage: Math.round(percentage * 100) / 100,
            timestamp: new Date(),
            acknowledged: false
          };

          this.alerts.push(alert);
          newAlerts.push(alert);

          logger.warn('Budget alert generated', {
            budgetId: budget.id,
            alertType,
            percentage: percentage.toFixed(1),
            currentUsage: usage.currentCost
          });
        }
      } catch (error: any) {
        logger.error(`Failed to check budget ${budget.id}:`, error);
      }
    }

    return newAlerts;
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      logger.info('Alert acknowledged', { alertId });
      return true;
    }
    return false;
  }

  /**
   * Get cost analytics for budget planning
   */
  public async getCostAnalytics(
    budgetId?: string,
    days: number = 30
  ): Promise<{
    totalCost: number;
    averageDailyCost: number;
    projectedMonthlyCost: number;
    costTrend: 'increasing' | 'decreasing' | 'stable';
    topProviders: Array<{ provider: string; cost: number; percentage: number }>;
    topModels: Array<{ model: string; cost: number; percentage: number }>;
    costByDay: Array<{ date: string; cost: number; tokens: number }>;
  }> {
    try {
      const budget = budgetId ? this.budgets.get(budgetId) : null;
      const usageAnalytics = await aiProviderBillingService.getUsageAnalytics(
        budget?.provider,
        budget?.projectId,
        budget?.userId,
        days
      );

      const averageDailyCost = days > 0 ? usageAnalytics.totalCost / days : 0;
      const projectedMonthlyCost = averageDailyCost * 30;

      // Calculate cost trend
      const recentDays = Math.min(7, days);
      const recentCost = usageAnalytics.usageByDay.slice(-recentDays).reduce((sum, day) => sum + day.cost, 0);
      const previousCost = usageAnalytics.usageByDay.slice(-recentDays * 2, -recentDays).reduce((sum, day) => sum + day.cost, 0);
      
      let costTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentCost > previousCost * 1.1) {
        costTrend = 'increasing';
      } else if (recentCost < previousCost * 0.9) {
        costTrend = 'decreasing';
      }

      return {
        totalCost: usageAnalytics.totalCost,
        averageDailyCost: Math.round(averageDailyCost * 1000000) / 1000000,
        projectedMonthlyCost: Math.round(projectedMonthlyCost * 1000000) / 1000000,
        costTrend,
        topProviders: Object.entries(usageAnalytics.costByProvider)
          .map(([provider, cost]) => ({
            provider,
            cost: Math.round(cost * 1000000) / 1000000,
            percentage: Math.round((cost / usageAnalytics.totalCost) * 10000) / 100
          }))
          .sort((a, b) => b.cost - a.cost),
        topModels: Object.entries(usageAnalytics.costByModel)
          .map(([model, cost]) => ({
            model,
            cost: Math.round(cost * 1000000) / 1000000,
            percentage: Math.round((cost / usageAnalytics.totalCost) * 10000) / 100
          }))
          .sort((a, b) => b.cost - a.cost),
        costByDay: usageAnalytics.usageByDay
      };
    } catch (error: any) {
      logger.error('Failed to get cost analytics:', error);
      return {
        totalCost: 0,
        averageDailyCost: 0,
        projectedMonthlyCost: 0,
        costTrend: 'stable',
        topProviders: [],
        topModels: [],
        costByDay: []
      };
    }
  }

  /**
   * Get budget usage for a specific budget
   */
  private async getBudgetUsage(budget: BudgetConfig): Promise<{ currentCost: number; currentTokens: number }> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const usageAnalytics = await aiProviderBillingService.getUsageAnalytics(
      budget.provider,
      budget.projectId,
      budget.userId,
      30
    );

    return {
      currentCost: usageAnalytics.totalCost,
      currentTokens: usageAnalytics.totalTokens
    };
  }

  /**
   * Get days remaining in current month
   */
  private getDaysRemainingInMonth(): number {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDayOfMonth.getDate() - now.getDate();
  }

  /**
   * Project monthly cost based on current usage
   */
  private projectMonthlyCost(currentCost: number): number {
    const daysElapsed = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    return (currentCost / daysElapsed) * daysInMonth;
  }

  /**
   * Get last alert for a budget
   */
  private getLastAlert(budgetId: string): BudgetAlert | undefined {
    return this.alerts
      .filter(alert => alert.budgetId === budgetId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  /**
   * Check if we should regenerate an alert (e.g., if it's been more than 24 hours)
   */
  private shouldRegenerateAlert(lastAlert: BudgetAlert): boolean {
    const hoursSinceLastAlert = (Date.now() - lastAlert.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastAlert > 24;
  }

  /**
   * Initialize default budgets
   */
  private initializeDefaultBudgets(): void {
    // Create a default system-wide budget
    const defaultBudgetId = this.createBudget({
      name: 'System-wide AI Usage Budget',
      monthlyBudget: 1000, // $1000 USD
      currency: 'USD',
      alertThresholds: {
        warning: 75, // 75%
        critical: 90  // 90%
      },
      isActive: true
    });

    logger.info('Default budget initialized', { budgetId: defaultBudgetId });
  }

  /**
   * Start budget monitoring
   */
  private startBudgetMonitoring(): void {
    // Check budgets every hour
    setInterval(async () => {
      try {
        const alerts = await this.checkBudgets();
        if (alerts.length > 0) {
          logger.warn(`Generated ${alerts.length} budget alerts`);
          // Here you could integrate with notification systems (email, Slack, etc.)
        }
      } catch (error: any) {
        logger.error('Budget monitoring failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour

    logger.info('Budget monitoring started');
  }

  /**
   * Get all budgets
   */
  public getAllBudgets(): BudgetConfig[] {
    return Array.from(this.budgets.values());
  }

  /**
   * Get all alerts
   */
  public getAllAlerts(acknowledged?: boolean): BudgetAlert[] {
    if (acknowledged === undefined) {
      return [...this.alerts];
    }
    return this.alerts.filter(alert => alert.acknowledged === acknowledged);
  }
}

// Export singleton instance
export const budgetMonitoringService = BudgetMonitoringService.getInstance();
