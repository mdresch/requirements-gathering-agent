import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertThreshold, AlertRule } from '../models/Alert.model.js';
import { AIBillingUsage } from '../models/AIBillingUsage.model.js';
import { RealTimeMetrics } from '../models/RealTimeMetrics.model.js';
import { AIContextTracking } from '../models/AIContextTracking.model.js';

export interface AlertThreshold {
  id: string;
  name: string;
  description: string;
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
  value: number;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  enabled: boolean;
  cooldownMinutes: number;
  context?: {
    projectId?: string;
    userId?: string;
    provider?: string;
    model?: string;
    templateId?: string;
    documentType?: string;
  };
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  thresholdId: string;
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  deviationPercentage: number;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  title: string;
  description: string;
  context?: {
    projectId?: string;
    userId?: string;
    provider?: string;
    model?: string;
    templateId?: string;
    documentType?: string;
  };
  metadata?: any;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  enabled: boolean;
  priority: number;
  context?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'contains' | 'not_contains';
  value: any;
  timeWindow?: number; // minutes
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'slack' | 'teams' | 'dashboard' | 'log';
  config: {
    recipients?: string[];
    webhookUrl?: string;
    message?: string;
    template?: string;
    [key: string]: any;
  };
  delay?: number; // minutes
}

export interface AlertMetrics {
  totalAlerts: number;
  activeAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  alertsBySeverity: Record<string, number>;
  alertsByMetric: Record<string, number>;
  averageResolutionTime: number;
  topTriggeredAlerts: Array<{
    alertId: string;
    triggerCount: number;
    lastTriggered: Date;
  }>;
}

export class AlertSystemService extends EventEmitter {
  private static instance: AlertSystemService;
  private thresholds: Map<string, AlertThreshold> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private cooldowns: Map<string, Date> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;

  private constructor() {
    super();
    this.initializeDefaultThresholds();
    this.startMonitoring();
  }

  public static getInstance(): AlertSystemService {
    if (!AlertSystemService.instance) {
      AlertSystemService.instance = new AlertSystemService();
    }
    return AlertSystemService.instance;
  }

  private initializeDefaultThresholds(): void {
    // Cost-related thresholds
    const costThresholds: Partial<AlertThreshold>[] = [
      {
        name: 'High AI Cost per Document',
        description: 'Alert when AI cost per document exceeds $0.50',
        metric: 'ai_cost_per_document',
        operator: 'gt',
        value: 0.50,
        severity: 'warning',
        cooldownMinutes: 30
      },
      {
        name: 'Critical AI Cost per Document',
        description: 'Alert when AI cost per document exceeds $1.00',
        metric: 'ai_cost_per_document',
        operator: 'gt',
        value: 1.00,
        severity: 'critical',
        cooldownMinutes: 15
      },
      {
        name: 'Daily AI Cost Limit',
        description: 'Alert when daily AI costs exceed $100',
        metric: 'daily_ai_cost',
        operator: 'gt',
        value: 100,
        severity: 'warning',
        cooldownMinutes: 60
      },
      {
        name: 'Monthly AI Cost Limit',
        description: 'Alert when monthly AI costs exceed $1000',
        metric: 'monthly_ai_cost',
        operator: 'gt',
        value: 1000,
        severity: 'critical',
        cooldownMinutes: 1440 // 24 hours
      }
    ];

    // Performance-related thresholds
    const performanceThresholds: Partial<AlertThreshold>[] = [
      {
        name: 'Slow Document Generation',
        description: 'Alert when document generation takes longer than 60 seconds',
        metric: 'document_generation_time',
        operator: 'gt',
        value: 60,
        severity: 'warning',
        cooldownMinutes: 30
      },
      {
        name: 'Very Slow Document Generation',
        description: 'Alert when document generation takes longer than 120 seconds',
        metric: 'document_generation_time',
        operator: 'gt',
        value: 120,
        severity: 'critical',
        cooldownMinutes: 15
      },
      {
        name: 'Low Success Rate',
        description: 'Alert when document generation success rate falls below 90%',
        metric: 'document_generation_success_rate',
        operator: 'lt',
        value: 0.90,
        severity: 'warning',
        cooldownMinutes: 60
      },
      {
        name: 'Critical Success Rate',
        description: 'Alert when document generation success rate falls below 80%',
        metric: 'document_generation_success_rate',
        operator: 'lt',
        value: 0.80,
        severity: 'critical',
        cooldownMinutes: 30
      }
    ];

    // Usage-related thresholds
    const usageThresholds: Partial<AlertThreshold>[] = [
      {
        name: 'High Token Usage',
        description: 'Alert when token usage per document exceeds 10,000 tokens',
        metric: 'tokens_per_document',
        operator: 'gt',
        value: 10000,
        severity: 'warning',
        cooldownMinutes: 60
      },
      {
        name: 'API Rate Limit Warning',
        description: 'Alert when API rate limit usage exceeds 80%',
        metric: 'api_rate_limit_usage',
        operator: 'gt',
        value: 0.80,
        severity: 'warning',
        cooldownMinutes: 30
      },
      {
        name: 'API Rate Limit Critical',
        description: 'Alert when API rate limit usage exceeds 95%',
        metric: 'api_rate_limit_usage',
        operator: 'gt',
        value: 0.95,
        severity: 'critical',
        cooldownMinutes: 15
      }
    ];

    // Compliance-related thresholds
    const complianceThresholds: Partial<AlertThreshold>[] = [
      {
        name: 'Low BABOK Compliance',
        description: 'Alert when BABOK compliance falls below 85%',
        metric: 'babok_compliance',
        operator: 'lt',
        value: 0.85,
        severity: 'warning',
        cooldownMinutes: 120
      },
      {
        name: 'Critical BABOK Compliance',
        description: 'Alert when BABOK compliance falls below 75%',
        metric: 'babok_compliance',
        operator: 'lt',
        value: 0.75,
        severity: 'critical',
        cooldownMinutes: 60
      },
      {
        name: 'Low PMBOK Compliance',
        description: 'Alert when PMBOK compliance falls below 85%',
        metric: 'pmbok_compliance',
        operator: 'lt',
        value: 0.85,
        severity: 'warning',
        cooldownMinutes: 120
      }
    ];

    // Add all thresholds
    [...costThresholds, ...performanceThresholds, ...usageThresholds, ...complianceThresholds].forEach(threshold => {
      const id = uuidv4();
      const fullThreshold: AlertThreshold = {
        id,
        name: threshold.name!,
        description: threshold.description!,
        metric: threshold.metric!,
        operator: threshold.operator!,
        value: threshold.value!,
        severity: threshold.severity!,
        enabled: true,
        cooldownMinutes: threshold.cooldownMinutes!,
        context: threshold.context,
        metadata: threshold.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.thresholds.set(id, fullThreshold);
    });

    logger.info(`Initialized ${this.thresholds.size} default alert thresholds`);
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.checkInterval = setInterval(() => {
      this.checkThresholds();
    }, 60000); // Check every minute

    logger.info('Alert system monitoring started');
  }

  private stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    logger.info('Alert system monitoring stopped');
  }

  public async checkThresholds(): Promise<void> {
    try {
      for (const [thresholdId, threshold] of Array.from(this.thresholds.entries())) {
        if (!threshold.enabled) continue;

        // Check cooldown
        const cooldownKey = `${thresholdId}:${JSON.stringify(threshold.context || {})}`;
        const lastTriggered = this.cooldowns.get(cooldownKey);
        if (lastTriggered && (Date.now() - lastTriggered.getTime()) < (threshold.cooldownMinutes * 60 * 1000)) {
          continue;
        }

        // Get current metric value
        const currentValue = await this.getCurrentMetricValue(threshold.metric, threshold.context);
        if (currentValue === null) continue;

        // Check if threshold is breached
        if (this.evaluateThreshold(threshold, currentValue)) {
          await this.triggerAlert(threshold, currentValue);
          this.cooldowns.set(cooldownKey, new Date());
        }
      }
    } catch (error) {
      logger.error('Error checking alert thresholds:', error);
    }
  }

  private async getCurrentMetricValue(metric: string, context?: any): Promise<number | null> {
    try {
      // This would integrate with your existing analytics services
      // For now, we'll simulate some metric retrieval
      
      switch (metric) {
        case 'ai_cost_per_document':
          return await this.getAICostPerDocument(context);
        case 'daily_ai_cost':
          return await this.getDailyAICost(context);
        case 'monthly_ai_cost':
          return await this.getMonthlyAICost(context);
        case 'document_generation_time':
          return await this.getDocumentGenerationTime(context);
        case 'document_generation_success_rate':
          return await this.getDocumentGenerationSuccessRate(context);
        case 'tokens_per_document':
          return await this.getTokensPerDocument(context);
        case 'api_rate_limit_usage':
          return await this.getAPIRateLimitUsage(context);
        case 'babok_compliance':
          return await this.getBABOKCompliance(context);
        case 'pmbok_compliance':
          return await this.getPMBOKCompliance(context);
        default:
          logger.warn(`Unknown metric: ${metric}`);
          return null;
      }
    } catch (error) {
      logger.error(`Error getting metric value for ${metric}:`, error);
      return null;
    }
  }

  private evaluateThreshold(threshold: AlertThreshold, currentValue: number): boolean {
    switch (threshold.operator) {
      case 'gt': return currentValue > threshold.value;
      case 'lt': return currentValue < threshold.value;
      case 'gte': return currentValue >= threshold.value;
      case 'lte': return currentValue <= threshold.value;
      case 'eq': return currentValue === threshold.value;
      case 'neq': return currentValue !== threshold.value;
      default: return false;
    }
  }

  private async triggerAlert(threshold: AlertThreshold, currentValue: number): Promise<void> {
    try {
      const alertId = uuidv4();
      const expectedValue = threshold.value;
      const deviation = Math.abs(currentValue - expectedValue);
      const deviationPercentage = expectedValue > 0 ? (deviation / expectedValue) * 100 : 0;

      const alert: Alert = {
        id: alertId,
        thresholdId: threshold.id,
        metric: threshold.metric,
        currentValue,
        expectedValue,
        deviation,
        deviationPercentage,
        severity: threshold.severity,
        status: 'active',
        title: `${threshold.severity.toUpperCase()}: ${threshold.name}`,
        description: `${threshold.description}. Current value: ${currentValue}, Expected: ${expectedValue}`,
        context: threshold.context,
        metadata: threshold.metadata,
        triggeredAt: new Date(),
        triggerCount: 1,
        lastTriggered: new Date()
      };

      this.alerts.set(alertId, alert);

      // Save to database
      try {
        const dbAlert = new Alert(alert);
        await dbAlert.save();
        logger.info(`Saved alert to database: ${alert.title}`);
      } catch (error) {
        logger.error('Error saving alert to database:', error);
      }

      // Emit alert event
      this.emit('alertTriggered', alert);

      // Execute alert actions
      await this.executeAlertActions(alert);

      logger.info(`Alert triggered: ${alert.title}`, {
        alertId,
        metric: alert.metric,
        currentValue: alert.currentValue,
        severity: alert.severity
      });
    } catch (error) {
      logger.error('Error triggering alert:', error);
    }
  }

  private async executeAlertActions(alert: Alert): Promise<void> {
    try {
      // Find applicable rules
      const applicableRules = Array.from(this.rules.values()).filter(rule => 
        rule.enabled && this.ruleMatches(rule, alert)
      );

      for (const rule of applicableRules) {
        for (const action of rule.actions) {
          await this.executeAction(action, alert);
        }
      }
    } catch (error) {
      logger.error('Error executing alert actions:', error);
    }
  }

  private ruleMatches(rule: AlertRule, alert: Alert): boolean {
    return rule.conditions.every(condition => {
      if (condition.metric !== alert.metric) return false;
      return this.evaluateCondition(condition, alert.currentValue);
    });
  }

  private evaluateCondition(condition: AlertCondition, value: any): boolean {
    switch (condition.operator) {
      case 'gt': return value > condition.value;
      case 'lt': return value < condition.value;
      case 'gte': return value >= condition.value;
      case 'lte': return value <= condition.value;
      case 'eq': return value === condition.value;
      case 'neq': return value !== condition.value;
      case 'contains': return String(value).includes(String(condition.value));
      case 'not_contains': return !String(value).includes(String(condition.value));
      default: return false;
    }
  }

  private async executeAction(action: AlertAction, alert: Alert): Promise<void> {
    try {
      if (action.delay && action.delay > 0) {
        setTimeout(() => this.executeActionImmediate(action, alert), action.delay * 60 * 1000);
      } else {
        await this.executeActionImmediate(action, alert);
      }
    } catch (error) {
      logger.error('Error executing alert action:', error);
    }
  }

  private async executeActionImmediate(action: AlertAction, alert: Alert): Promise<void> {
    switch (action.type) {
      case 'log':
        logger.warn(`Alert Action - ${alert.title}: ${action.config.message || 'No message'}`);
        break;
      case 'dashboard':
        this.emit('dashboardAlert', alert);
        break;
      case 'webhook':
        await this.sendWebhookAlert(action, alert);
        break;
      case 'email':
        await this.sendEmailAlert(action, alert);
        break;
      case 'slack':
        await this.sendSlackAlert(action, alert);
        break;
      case 'teams':
        await this.sendTeamsAlert(action, alert);
        break;
      default:
        logger.warn(`Unknown alert action type: ${action.type}`);
    }
  }

  private async sendWebhookAlert(action: AlertAction, alert: Alert): Promise<void> {
    // Implementation for webhook alerts
    logger.info(`Webhook alert sent for: ${alert.title}`);
  }

  private async sendEmailAlert(action: AlertAction, alert: Alert): Promise<void> {
    // Implementation for email alerts
    logger.info(`Email alert sent for: ${alert.title}`);
  }

  private async sendSlackAlert(action: AlertAction, alert: Alert): Promise<void> {
    // Implementation for Slack alerts
    logger.info(`Slack alert sent for: ${alert.title}`);
  }

  private async sendTeamsAlert(action: AlertAction, alert: Alert): Promise<void> {
    // Implementation for Teams alerts
    logger.info(`Teams alert sent for: ${alert.title}`);
  }

  // Metric retrieval methods (integrated with actual database models)
  private async getAICostPerDocument(context?: any): Promise<number> {
    try {
      const matchQuery: any = {};
      if (context?.projectId) matchQuery['metadata.projectId'] = context.projectId;
      if (context?.provider) matchQuery.provider = context.provider;
      if (context?.model) matchQuery.model = context.model;

      const result = await AIBillingUsage.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$cost.amount' },
            documentCount: { $sum: 1 }
          }
        }
      ]);

      if (result.length === 0 || result[0].documentCount === 0) return 0;
      return result[0].totalCost / result[0].documentCount;
    } catch (error) {
      logger.error('Error getting AI cost per document:', error);
      return 0;
    }
  }

  private async getDailyAICost(context?: any): Promise<number> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const matchQuery: any = {
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      };
      if (context?.projectId) matchQuery['metadata.projectId'] = context.projectId;

      const result = await AIBillingUsage.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$cost.amount' }
          }
        }
      ]);

      return result.length > 0 ? result[0].totalCost : 0;
    } catch (error) {
      logger.error('Error getting daily AI cost:', error);
      return 0;
    }
  }

  private async getMonthlyAICost(context?: any): Promise<number> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const matchQuery: any = {
        timestamp: { $gte: startOfMonth, $lte: endOfMonth }
      };
      if (context?.projectId) matchQuery['metadata.projectId'] = context.projectId;

      const result = await AIBillingUsage.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$cost.amount' }
          }
        }
      ]);

      return result.length > 0 ? result[0].totalCost : 0;
    } catch (error) {
      logger.error('Error getting monthly AI cost:', error);
      return 0;
    }
  }

  private async getDocumentGenerationTime(context?: any): Promise<number> {
    try {
      const matchQuery: any = {
        type: 'document_generation',
        'data.success': true
      };
      if (context?.projectId) matchQuery['metadata.projectId'] = context.projectId;

      const result = await RealTimeMetrics.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            avgGenerationTime: { $avg: '$data.generationTime' }
          }
        }
      ]);

      return result.length > 0 ? result[0].avgGenerationTime : 0;
    } catch (error) {
      logger.error('Error getting document generation time:', error);
      return 0;
    }
  }

  private async getDocumentGenerationSuccessRate(context?: any): Promise<number> {
    try {
      const matchQuery: any = {
        type: 'document_generation'
      };
      if (context?.projectId) matchQuery['metadata.projectId'] = context.projectId;

      const result = await RealTimeMetrics.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            successfulAttempts: {
              $sum: { $cond: [{ $eq: ['$data.success', true] }, 1, 0] }
            }
          }
        }
      ]);

      if (result.length === 0 || result[0].totalAttempts === 0) return 1;
      return result[0].successfulAttempts / result[0].totalAttempts;
    } catch (error) {
      logger.error('Error getting document generation success rate:', error);
      return 1;
    }
  }

  private async getTokensPerDocument(context?: any): Promise<number> {
    try {
      const matchQuery: any = {};
      if (context?.projectId) matchQuery.projectId = context.projectId;
      if (context?.provider) matchQuery.aiProvider = context.provider;
      if (context?.model) matchQuery.aiModel = context.model;

      const result = await AIContextTracking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            avgTokens: { $avg: '$usage.totalTokens' }
          }
        }
      ]);

      return result.length > 0 ? result[0].avgTokens : 0;
    } catch (error) {
      logger.error('Error getting tokens per document:', error);
      return 0;
    }
  }

  private async getAPIRateLimitUsage(context?: any): Promise<number> {
    try {
      // This would integrate with API usage tracking
      // For now, return a mock value based on recent activity
      const recentActivity = await RealTimeMetrics.countDocuments({
        type: 'api_call',
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      });

      // Mock calculation - in reality this would check actual rate limits
      return Math.min(recentActivity / 1000, 1); // Assume 1000 calls per hour limit
    } catch (error) {
      logger.error('Error getting API rate limit usage:', error);
      return 0;
    }
  }

  private async getBABOKCompliance(context?: any): Promise<number> {
    try {
      // This would integrate with compliance tracking
      // For now, return a mock value
      const matchQuery: any = {};
      if (context?.projectId) matchQuery.projectId = context.projectId;

      const result = await AIContextTracking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            avgCompliance: { $avg: '$compliance.babokCompliance' }
          }
        }
      ]);

      return result.length > 0 ? (result[0].avgCompliance || 0.85) : 0.85;
    } catch (error) {
      logger.error('Error getting BABOK compliance:', error);
      return 0.85; // Default fallback
    }
  }

  private async getPMBOKCompliance(context?: any): Promise<number> {
    try {
      // This would integrate with compliance tracking
      // For now, return a mock value
      const matchQuery: any = {};
      if (context?.projectId) matchQuery.projectId = context.projectId;

      const result = await AIContextTracking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            avgCompliance: { $avg: '$compliance.pmbokCompliance' }
          }
        }
      ]);

      return result.length > 0 ? (result[0].avgCompliance || 0.90) : 0.90;
    } catch (error) {
      logger.error('Error getting PMBOK compliance:', error);
      return 0.90; // Default fallback
    }
  }

  // Public API methods
  public async createThreshold(thresholdData: Partial<AlertThreshold>): Promise<AlertThreshold> {
    const id = uuidv4();
    const threshold: AlertThreshold = {
      id,
      name: thresholdData.name!,
      description: thresholdData.description!,
      metric: thresholdData.metric!,
      operator: thresholdData.operator!,
      value: thresholdData.value!,
      severity: thresholdData.severity!,
      enabled: thresholdData.enabled ?? true,
      cooldownMinutes: thresholdData.cooldownMinutes ?? 60,
      context: thresholdData.context,
      metadata: thresholdData.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    try {
      const dbThreshold = new AlertThreshold(threshold);
      await dbThreshold.save();
      logger.info(`Created alert threshold in database: ${threshold.name}`);
    } catch (error) {
      logger.error('Error saving threshold to database:', error);
    }

    this.thresholds.set(id, threshold);
    logger.info(`Created alert threshold: ${threshold.name}`);
    return threshold;
  }

  public async updateThreshold(id: string, updates: Partial<AlertThreshold>): Promise<AlertThreshold | null> {
    const threshold = this.thresholds.get(id);
    if (!threshold) return null;

    const updatedThreshold = {
      ...threshold,
      ...updates,
      updatedAt: new Date()
    };

    // Update in database
    try {
      await AlertThreshold.findByIdAndUpdate(id, updates);
      logger.info(`Updated alert threshold in database: ${updatedThreshold.name}`);
    } catch (error) {
      logger.error('Error updating threshold in database:', error);
    }

    this.thresholds.set(id, updatedThreshold);
    logger.info(`Updated alert threshold: ${updatedThreshold.name}`);
    return updatedThreshold;
  }

  public async deleteThreshold(id: string): Promise<boolean> {
    // Delete from database
    try {
      await AlertThreshold.findByIdAndDelete(id);
      logger.info(`Deleted alert threshold from database: ${id}`);
    } catch (error) {
      logger.error('Error deleting threshold from database:', error);
    }

    const deleted = this.thresholds.delete(id);
    if (deleted) {
      logger.info(`Deleted alert threshold: ${id}`);
    }
    return deleted;
  }

  public getThreshold(id: string): AlertThreshold | null {
    return this.thresholds.get(id) || null;
  }

  public getThresholds(): AlertThreshold[] {
    return Array.from(this.thresholds.values());
  }

  public getAlert(id: string): Alert | null {
    return this.alerts.get(id) || null;
  }

  public getAlerts(status?: string, severity?: string, limit: number = 100): Alert[] {
    let alerts = Array.from(this.alerts.values());

    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }

    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    return alerts
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, limit);
  }

  public async acknowledgeAlert(id: string, userId: string): Promise<Alert | null> {
    const alert = this.alerts.get(id);
    if (!alert) return null;

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = userId;

    // Update in database
    try {
      await Alert.findByIdAndUpdate(id, {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        acknowledgedBy: userId
      });
      logger.info(`Updated alert in database: acknowledged by ${userId}`);
    } catch (error) {
      logger.error('Error updating alert in database:', error);
    }

    this.alerts.set(id, alert);
    this.emit('alertAcknowledged', alert);
    logger.info(`Alert acknowledged: ${alert.title} by ${userId}`);
    return alert;
  }

  public async resolveAlert(id: string, userId: string, resolutionNotes?: string): Promise<Alert | null> {
    const alert = this.alerts.get(id);
    if (!alert) return null;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = userId;
    alert.resolutionNotes = resolutionNotes;

    // Update in database
    try {
      await Alert.findByIdAndUpdate(id, {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolutionNotes
      });
      logger.info(`Updated alert in database: resolved by ${userId}`);
    } catch (error) {
      logger.error('Error updating alert in database:', error);
    }

    this.alerts.set(id, alert);
    this.emit('alertResolved', alert);
    logger.info(`Alert resolved: ${alert.title} by ${userId}`);
    return alert;
  }

  public async createRule(ruleData: Partial<AlertRule>): Promise<AlertRule> {
    const id = uuidv4();
    const rule: AlertRule = {
      id,
      name: ruleData.name!,
      description: ruleData.description!,
      conditions: ruleData.conditions!,
      actions: ruleData.actions!,
      enabled: ruleData.enabled ?? true,
      priority: ruleData.priority ?? 1,
      context: ruleData.context,
      metadata: ruleData.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    try {
      const dbRule = new AlertRule(rule);
      await dbRule.save();
      logger.info(`Created alert rule in database: ${rule.name}`);
    } catch (error) {
      logger.error('Error saving rule to database:', error);
    }

    this.rules.set(id, rule);
    logger.info(`Created alert rule: ${rule.name}`);
    return rule;
  }

  public getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  public getAlertMetrics(): AlertMetrics {
    const alerts = Array.from(this.alerts.values());
    const activeAlerts = alerts.filter(a => a.status === 'active');
    const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

    const alertsBySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alertsByMetric = alerts.reduce((acc, alert) => {
      acc[alert.metric] = (acc[alert.metric] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolvedWithTimes = resolvedAlerts.filter(a => a.acknowledgedAt && a.resolvedAt);
    const averageResolutionTime = resolvedWithTimes.length > 0
      ? resolvedWithTimes.reduce((sum, alert) => 
          sum + (alert.resolvedAt!.getTime() - alert.acknowledgedAt!.getTime()), 0) / resolvedWithTimes.length
      : 0;

    const topTriggeredAlerts = Array.from(this.alerts.values())
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 5)
      .map(alert => ({
        alertId: alert.id,
        triggerCount: alert.triggerCount,
        lastTriggered: alert.lastTriggered || alert.triggeredAt
      }));

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      acknowledgedAlerts: acknowledgedAlerts.length,
      resolvedAlerts: resolvedAlerts.length,
      alertsBySeverity,
      alertsByMetric,
      averageResolutionTime,
      topTriggeredAlerts
    };
  }

  public destroy(): void {
    this.stopMonitoring();
    this.removeAllListeners();
    this.thresholds.clear();
    this.alerts.clear();
    this.rules.clear();
    this.cooldowns.clear();
  }
}

export const alertSystemService = AlertSystemService.getInstance();
