import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { RealTimeMetrics } from '../models/RealTimeMetrics.model.js';
import { aiProviderBillingService } from './AIProviderBillingService.js';
import { budgetMonitoringService } from './BudgetMonitoringService.js';

/**
 * Real-time Metrics Collection Service
 * Collects and streams real-time metrics from all system components
 */

export interface MetricEvent {
  id: string;
  timestamp: Date;
  type: 'user_activity' | 'document_generation' | 'template_usage' | 'adobe_integration' | 'api_usage' | 'system_performance';
  component: string;
  action: string;
  data: any;
  metadata: {
    userId?: string;
    projectId?: string;
    sessionId?: string;
    requestId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    free: number;
    total: number;
  };
  database: {
    connections: number;
    queries: number;
    responseTime: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

export interface UserActivityMetrics {
  userId: string;
  sessionId: string;
  timestamp: Date;
  activity: {
    type: 'page_view' | 'document_created' | 'template_used' | 'search' | 'download' | 'upload';
    component: string;
    duration?: number;
    metadata: any;
  };
}

export interface TemplateUsageMetrics {
  templateId: string;
  timestamp: Date;
  usage: {
    type: 'generated' | 'viewed' | 'edited' | 'deleted';
    userId: string;
    projectId?: string;
    duration?: number;
    success: boolean;
  };
}

export interface AdobeIntegrationMetrics {
  timestamp: Date;
  operation: {
    type: 'pdf_convert' | 'document_create' | 'template_apply' | 'export';
    documentType: string;
    success: boolean;
    processingTime: number;
    fileSize?: number;
    outputFormat: string;
  };
  user: {
    userId: string;
    projectId?: string;
  };
}

export class RealTimeMetricsService extends EventEmitter {
  private static instance: RealTimeMetricsService;
  private metricsBuffer: MetricEvent[] = [];
  private bufferSize: number = 1000;
  private flushInterval: number = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;
  private subscribers: Map<string, (metric: MetricEvent) => void> = new Map();

  private constructor() {
    super();
    this.startFlushTimer();
    this.setupSystemMetricsCollection();
  }

  public static getInstance(): RealTimeMetricsService {
    if (!RealTimeMetricsService.instance) {
      RealTimeMetricsService.instance = new RealTimeMetricsService();
    }
    return RealTimeMetricsService.instance;
  }

  /**
   * Track a metric event
   */
  public trackMetric(event: Omit<MetricEvent, 'id' | 'timestamp'>): void {
    const metricEvent: MetricEvent = {
      ...event,
      id: this.generateMetricId(),
      timestamp: new Date()
    };

    // Add to buffer
    this.metricsBuffer.push(metricEvent);

    // Emit immediately for real-time subscribers
    this.emit('metric', metricEvent);

    // Flush buffer if it's full
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }

    logger.debug(`Real-time metric tracked: ${metricEvent.type}:${metricEvent.action}`, {
      component: metricEvent.component,
      metadata: metricEvent.metadata
    });
  }

  /**
   * Track user activity
   */
  public trackUserActivity(activity: UserActivityMetrics): void {
    this.trackMetric({
      type: 'user_activity',
      component: 'user_session',
      action: activity.activity.type,
      data: activity.activity,
      metadata: {
        userId: activity.userId,
        sessionId: activity.sessionId
      }
    });
  }

  /**
   * Track template usage
   */
  public trackTemplateUsage(usage: TemplateUsageMetrics): void {
    this.trackMetric({
      type: 'template_usage',
      component: 'template_engine',
      action: usage.usage.type,
      data: usage.usage,
      metadata: {
        userId: usage.usage.userId,
        projectId: usage.usage.projectId
      }
    });
  }

  /**
   * Track Adobe integration usage
   */
  public trackAdobeIntegration(integration: AdobeIntegrationMetrics): void {
    this.trackMetric({
      type: 'adobe_integration',
      component: 'adobe_creative_suite',
      action: integration.operation.type,
      data: integration.operation,
      metadata: {
        userId: integration.user.userId,
        projectId: integration.user.projectId
      }
    });
  }

  /**
   * Track document generation with enhanced cost tracking
   */
  public trackDocumentGeneration(data: {
    documentId: string;
    templateId: string;
    projectId: string;
    userId: string;
    generationTime: number;
    success: boolean;
    tokensUsed?: number;
    cost?: number;
    provider?: string;
    model?: string;
  }): void {
    // Track real-time cost if billing data is available
    let realTimeCost = data.cost || 0;
    let billingData = null;
    
    if (data.provider && data.model && data.tokensUsed) {
      try {
        const costData = aiProviderBillingService.calculateCost(
          data.provider,
          data.model,
          {
            promptTokens: Math.floor(data.tokensUsed * 0.7), // Estimate prompt/completion split
            completionTokens: Math.floor(data.tokensUsed * 0.3),
            totalTokens: data.tokensUsed
          }
        );
        realTimeCost = costData.amount;
        billingData = costData;
      } catch (error) {
        logger.warn('Failed to calculate real-time cost for document generation:', error);
      }
    }

    this.trackMetric({
      type: 'document_generation',
      component: 'document_generator',
      action: 'generated',
      data: {
        documentId: data.documentId,
        templateId: data.templateId,
        generationTime: data.generationTime,
        success: data.success,
        tokensUsed: data.tokensUsed,
        cost: realTimeCost,
        provider: data.provider,
        model: data.model,
        billingData: billingData
      },
      metadata: {
        userId: data.userId,
        projectId: data.projectId
      }
    });

    // Trigger budget monitoring check
    if (realTimeCost > 0) {
      this.checkBudgetThresholds(data.projectId, data.userId, realTimeCost);
    }
  }

  /**
   * Track API usage
   */
  public trackApiUsage(data: {
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    userId?: string;
    requestId?: string;
  }): void {
    this.trackMetric({
      type: 'api_usage',
      component: 'api_server',
      action: `${data.method.toLowerCase()}_${data.endpoint.replace(/\//g, '_')}`,
      data: {
        endpoint: data.endpoint,
        method: data.method,
        responseTime: data.responseTime,
        statusCode: data.statusCode,
        success: data.statusCode >= 200 && data.statusCode < 400
      },
      metadata: {
        userId: data.userId,
        requestId: data.requestId
      }
    });
  }

  /**
   * Subscribe to real-time metrics
   */
  public subscribe(subscriberId: string, callback: (metric: MetricEvent) => void): void {
    this.subscribers.set(subscriberId, callback);
    this.on('metric', callback);
    logger.info(`Real-time metrics subscriber added: ${subscriberId}`);
  }

  /**
   * Unsubscribe from real-time metrics
   */
  public unsubscribe(subscriberId: string): void {
    const callback = this.subscribers.get(subscriberId);
    if (callback) {
      this.off('metric', callback);
      this.subscribers.delete(subscriberId);
      logger.info(`Real-time metrics subscriber removed: ${subscriberId}`);
    }
  }

  /**
   * Get recent metrics by type
   */
  public getRecentMetrics(type?: string, limit: number = 100): MetricEvent[] {
    let filtered = this.metricsBuffer;
    
    if (type) {
      filtered = this.metricsBuffer.filter(metric => metric.type === type);
    }
    
    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Check budget thresholds and trigger alerts if needed
   */
  private async checkBudgetThresholds(projectId?: string, userId?: string, cost: number = 0): Promise<void> {
    try {
      // Check budgets asynchronously to avoid blocking metrics tracking
      setImmediate(async () => {
        try {
          const alerts = await budgetMonitoringService.checkBudgets();
          if (alerts.length > 0) {
            // Emit budget alert events for real-time subscribers
            alerts.forEach(alert => {
              this.emit('budgetAlert', alert);
            });
          }
        } catch (error) {
          logger.error('Failed to check budget thresholds:', error);
        }
      });
    } catch (error) {
      logger.error('Failed to trigger budget threshold check:', error);
    }
  }

  /**
   * Get enhanced system metrics with cost information
   */
  public async getSystemMetrics(): Promise<SystemMetrics> {
    const memUsage = process.memoryUsage();
    
    return {
      timestamp: new Date(),
      cpu: {
        usage: await this.getCpuUsage(),
        load: process.platform === 'linux' ? require('os').loadavg() : [0, 0, 0]
      },
      memory: {
        used: memUsage.heapUsed,
        free: memUsage.heapTotal - memUsage.heapUsed,
        total: memUsage.heapTotal
      },
      database: {
        connections: 1, // This would be retrieved from dbConnection
        queries: 0, // This would be tracked separately
        responseTime: 0 // This would be tracked separately
      },
      api: {
        requestsPerMinute: this.getApiRequestsPerMinute(),
        averageResponseTime: this.getAverageApiResponseTime(),
        errorRate: this.getApiErrorRate()
      }
    };
  }

  /**
   * Start the metrics flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  /**
   * Flush metrics to storage (database, file, etc.)
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) {
      return;
    }

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      logger.debug(`Flushing ${metricsToFlush.length} metrics to database`);
      
      // Store metrics in database
      await this.storeMetricsInDatabase(metricsToFlush);
      
    } catch (error) {
      logger.error('Failed to flush metrics to storage:', error);
      // Re-add metrics to buffer if storage failed
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  /**
   * Store metrics in database
   */
  private async storeMetricsInDatabase(metrics: MetricEvent[]): Promise<void> {
    try {
      // Convert MetricEvent to database format
      const dbMetrics = metrics.map(metric => ({
        timestamp: metric.timestamp,
        type: metric.type,
        component: metric.component,
        action: metric.action,
        data: metric.data,
        metadata: metric.metadata
      }));

      // Bulk insert to database
      await RealTimeMetrics.insertMany(dbMetrics, { ordered: false });
      
      logger.debug(`Successfully stored ${metrics.length} metrics in database`);
      
    } catch (error: any) {
      logger.error('Failed to store metrics in database:', error);
      throw error;
    }
  }

  /**
   * Setup system metrics collection
   */
  private setupSystemMetricsCollection(): void {
    // Collect system metrics every 30 seconds
    setInterval(async () => {
      try {
        const systemMetrics = await this.getSystemMetrics();
        this.trackMetric({
          type: 'system_performance',
          component: 'system_monitor',
          action: 'performance_snapshot',
          data: systemMetrics,
          metadata: {}
        });
      } catch (error) {
        logger.error('Failed to collect system metrics:', error);
      }
    }, 30000);
  }

  /**
   * Generate unique metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get CPU usage (simplified implementation)
   */
  private async getCpuUsage(): Promise<number> {
    // This is a simplified implementation
    // In production, you'd use a more sophisticated CPU monitoring library
    return Math.random() * 100; // Placeholder
  }

  /**
   * Get API requests per minute
   */
  private getApiRequestsPerMinute(): number {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    return this.metricsBuffer.filter(
      metric => metric.type === 'api_usage' && metric.timestamp > oneMinuteAgo
    ).length;
  }

  /**
   * Get average API response time
   */
  private getAverageApiResponseTime(): number {
    const apiMetrics = this.metricsBuffer.filter(metric => metric.type === 'api_usage');
    if (apiMetrics.length === 0) return 0;
    
    const totalTime = apiMetrics.reduce((sum, metric) => sum + (metric.data.responseTime || 0), 0);
    return totalTime / apiMetrics.length;
  }

  /**
   * Get API error rate
   */
  private getApiErrorRate(): number {
    const apiMetrics = this.metricsBuffer.filter(metric => metric.type === 'api_usage');
    if (apiMetrics.length === 0) return 0;
    
    const errorCount = apiMetrics.filter(metric => !metric.data.success).length;
    return (errorCount / apiMetrics.length) * 100;
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.removeAllListeners();
    this.subscribers.clear();
    this.metricsBuffer = [];
  }
}

// Export singleton instance
export const realTimeMetricsService = RealTimeMetricsService.getInstance();
