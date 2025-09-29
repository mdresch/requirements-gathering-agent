import { logger } from '../utils/logger.js';
import { dataAggregationService } from './DataAggregationService.js';
import { predictiveAnalyticsService } from './PredictiveAnalyticsService.js';

/**
 * Anomaly Detection Service
 * Provides intelligent anomaly detection and early warning system
 */

export interface AnomalyDetection {
  id: string;
  metric: string;
  detectedAt: Date;
  anomalyType: 'spike' | 'drop' | 'trend_change' | 'pattern_break' | 'seasonal_deviation' | 'outlier';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  confidence: number;
  context: {
    projectId?: string;
    userId?: string;
    component?: string;
    region?: string;
  };
  recommendations: string[];
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
}

export interface EarlyWarning {
  id: string;
  type: 'threshold_breach' | 'trend_alert' | 'capacity_warning' | 'cost_alert' | 'performance_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold: number;
  projectedValue: number;
  timeToBreach: number; // minutes
  confidence: number;
  context: any;
  actions: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeframe: string;
    impact: string;
  }>;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
}

export interface DetectionRule {
  id: string;
  name: string;
  metric: string;
  algorithm: 'statistical' | 'machine_learning' | 'threshold' | 'pattern_based';
  parameters: {
    sensitivity?: number;
    windowSize?: number;
    threshold?: number;
    confidence?: number;
  };
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export class AnomalyDetectionService {
  private static instance: AnomalyDetectionService;
  private anomalies: Map<string, AnomalyDetection> = new Map();
  private earlyWarnings: Map<string, EarlyWarning> = new Map();
  private detectionRules: Map<string, DetectionRule> = new Map();
  private baselines: Map<string, Array<{ timestamp: Date; value: number }>> = new Map();

  private constructor() {
    this.initializeDetectionRules();
    this.startAnomalyDetection();
    this.startEarlyWarningMonitoring();
  }

  public static getInstance(): AnomalyDetectionService {
    if (!AnomalyDetectionService.instance) {
      AnomalyDetectionService.instance = new AnomalyDetectionService();
    }
    return AnomalyDetectionService.instance;
  }

  /**
   * Detect anomalies in real-time metrics
   */
  public async detectAnomalies(
    metric: string,
    timeRange: { start: Date; end: Date } = { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() }
  ): Promise<AnomalyDetection[]> {
    try {
      logger.info(`Detecting anomalies for ${metric}`, { timeRange });

      // Get recent data
      const recentData = await this.getRecentMetricData(metric, timeRange);
      
      if (recentData.length < 10) {
        return [];
      }

      // Get historical baseline
      const baselineData = await this.getBaselineData(metric, timeRange);
      
      if (baselineData.length < 20) {
        return [];
      }

      // Apply detection algorithms
      const anomalies: AnomalyDetection[] = [];
      
      // Statistical anomaly detection
      const statisticalAnomalies = await this.detectStatisticalAnomalies(metric, recentData, baselineData);
      anomalies.push(...statisticalAnomalies);
      
      // Pattern-based anomaly detection
      const patternAnomalies = await this.detectPatternAnomalies(metric, recentData, baselineData);
      anomalies.push(...patternAnomalies);
      
      // Trend change detection
      const trendAnomalies = await this.detectTrendAnomalies(metric, recentData, baselineData);
      anomalies.push(...trendAnomalies);

      // Store and deduplicate anomalies
      const uniqueAnomalies = this.deduplicateAnomalies(anomalies);
      
      for (const anomaly of uniqueAnomalies) {
        this.anomalies.set(anomaly.id, anomaly);
      }

      // Keep only recent anomalies (last 1000)
      if (this.anomalies.size > 1000) {
        const sortedAnomalies = Array.from(this.anomalies.values())
          .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
        
        this.anomalies.clear();
        sortedAnomalies.slice(0, 1000).forEach(anomaly => {
          this.anomalies.set(anomaly.id, anomaly);
        });
      }

      return uniqueAnomalies;
    } catch (error: any) {
      logger.error('Anomaly detection failed:', error);
      return [];
    }
  }

  /**
   * Generate early warnings based on trends and thresholds
   */
  public async generateEarlyWarnings(
    timeRange: { start: Date; end: Date } = { start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date() }
  ): Promise<EarlyWarning[]> {
    try {
      logger.info('Generating early warnings', { timeRange });

      const warnings: EarlyWarning[] = [];
      
      // Check threshold-based warnings
      const thresholdWarnings = await this.checkThresholdWarnings(timeRange);
      warnings.push(...thresholdWarnings);
      
      // Check trend-based warnings
      const trendWarnings = await this.checkTrendWarnings(timeRange);
      warnings.push(...trendWarnings);
      
      // Check capacity warnings
      const capacityWarnings = await this.checkCapacityWarnings(timeRange);
      warnings.push(...capacityWarnings);
      
      // Check cost warnings
      const costWarnings = await this.checkCostWarnings(timeRange);
      warnings.push(...costWarnings);

      // Store warnings
      for (const warning of warnings) {
        this.earlyWarnings.set(warning.id, warning);
      }

      // Keep only active warnings (last 500)
      if (this.earlyWarnings.size > 500) {
        const sortedWarnings = Array.from(this.earlyWarnings.values())
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        this.earlyWarnings.clear();
        sortedWarnings.slice(0, 500).forEach(warning => {
          this.earlyWarnings.set(warning.id, warning);
        });
      }

      return warnings;
    } catch (error: any) {
      logger.error('Early warning generation failed:', error);
      return [];
    }
  }

  /**
   * Get active anomalies
   */
  public getActiveAnomalies(): AnomalyDetection[] {
    return Array.from(this.anomalies.values())
      .filter(anomaly => anomaly.status === 'new' || anomaly.status === 'investigating')
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get active early warnings
   */
  public getActiveWarnings(): EarlyWarning[] {
    return Array.from(this.earlyWarnings.values())
      .filter(warning => warning.status === 'active')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Acknowledge anomaly
   */
  public acknowledgeAnomaly(anomalyId: string, userId: string): boolean {
    const anomaly = this.anomalies.get(anomalyId);
    if (anomaly) {
      anomaly.status = 'investigating';
      anomaly.assignedTo = userId;
      this.anomalies.set(anomalyId, anomaly);
      return true;
    }
    return false;
  }

  /**
   * Resolve anomaly
   */
  public resolveAnomaly(anomalyId: string, resolution: string): boolean {
    const anomaly = this.anomalies.get(anomalyId);
    if (anomaly) {
      anomaly.status = 'resolved';
      anomaly.resolvedAt = new Date();
      anomaly.resolution = resolution;
      this.anomalies.set(anomalyId, anomaly);
      return true;
    }
    return false;
  }

  /**
   * Acknowledge early warning
   */
  public acknowledgeWarning(warningId: string, userId: string): boolean {
    const warning = this.earlyWarnings.get(warningId);
    if (warning) {
      warning.status = 'acknowledged';
      warning.acknowledgedAt = new Date();
      warning.acknowledgedBy = userId;
      this.earlyWarnings.set(warningId, warning);
      return true;
    }
    return false;
  }

  /**
   * Create custom detection rule
   */
  public createDetectionRule(rule: Omit<DetectionRule, 'id' | 'createdAt' | 'triggerCount'>): string {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newRule: DetectionRule = {
      ...rule,
      id: ruleId,
      createdAt: new Date(),
      triggerCount: 0
    };
    
    this.detectionRules.set(ruleId, newRule);
    
    logger.info('Detection rule created', { ruleId, name: rule.name });
    return ruleId;
  }

  /**
   * Get detection rule performance
   */
  public getRulePerformance(ruleId: string): {
    triggerCount: number;
    falsePositiveRate: number;
    lastTriggered?: Date;
  } | null {
    const rule = this.detectionRules.get(ruleId);
    if (!rule) return null;
    
    // Calculate false positive rate based on resolved anomalies
    const resolvedAnomalies = Array.from(this.anomalies.values())
      .filter(anomaly => anomaly.status === 'resolved' && anomaly.resolution === 'false_positive');
    
    const falsePositiveRate = resolvedAnomalies.length / Math.max(1, rule.triggerCount);
    
    return {
      triggerCount: rule.triggerCount,
      falsePositiveRate,
      lastTriggered: rule.lastTriggered
    };
  }

  /**
   * Private helper methods
   */
  private async getRecentMetricData(
    metric: string,
    timeRange: { start: Date; end: Date }
  ): Promise<Array<{ timestamp: Date; value: number }>> {
    try {
      const results = await dataAggregationService.aggregateData({
        metric,
        timeRange: { ...timeRange, granularity: 'hour' },
        aggregationType: 'average'
      });

      return results.map(result => ({
        timestamp: result.timestamp,
        value: result.value
      }));
    } catch (error) {
      logger.warn(`Failed to get recent metric data for ${metric}:`, error);
      return [];
    }
  }

  private async getBaselineData(
    metric: string,
    timeRange: { start: Date; end: Date }
  ): Promise<Array<{ timestamp: Date; value: number }>> {
    try {
      // Get historical data for baseline (previous period)
      const baselineStart = new Date(timeRange.start.getTime() - (timeRange.end.getTime() - timeRange.start.getTime()));
      const baselineEnd = timeRange.start;
      
      const results = await dataAggregationService.aggregateData({
        metric,
        timeRange: { start: baselineStart, end: baselineEnd, granularity: 'hour' },
        aggregationType: 'average'
      });

      return results.map(result => ({
        timestamp: result.timestamp,
        value: result.value
      }));
    } catch (error) {
      logger.warn(`Failed to get baseline data for ${metric}:`, error);
      return [];
    }
  }

  private async detectStatisticalAnomalies(
    metric: string,
    recentData: Array<{ timestamp: Date; value: number }>,
    baselineData: Array<{ timestamp: Date; value: number }>
  ): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];
    
    // Calculate baseline statistics
    const baselineMean = this.calculateMean(baselineData);
    const baselineStdDev = this.calculateStandardDeviation(baselineData);
    
    // Check for statistical outliers (3-sigma rule)
    for (let i = 0; i < recentData.length; i++) {
      const dataPoint = recentData[i];
      const deviation = Math.abs(dataPoint.value - baselineMean) / baselineStdDev;
      
      if (deviation > 3) { // 3 standard deviations
        const anomalyType = this.determineAnomalyType(dataPoint.value, baselineMean, recentData, i);
        const severity = this.determineAnomalySeverity(deviation);
        
        anomalies.push({
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metric,
          detectedAt: dataPoint.timestamp,
          anomalyType,
          severity,
          description: this.generateAnomalyDescription(metric, dataPoint.value, baselineMean, anomalyType),
          expectedValue: baselineMean,
          actualValue: dataPoint.value,
          deviation,
          confidence: Math.min(deviation / 4, 1),
          context: {},
          recommendations: this.generateAnomalyRecommendations(metric, anomalyType, severity),
          status: 'new'
        });
      }
    }
    
    return anomalies;
  }

  private async detectPatternAnomalies(
    metric: string,
    recentData: Array<{ timestamp: Date; value: number }>,
    baselineData: Array<{ timestamp: Date; value: number }>
  ): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];
    
    // Detect seasonal pattern deviations
    const seasonalIndices = this.calculateSeasonalIndices(baselineData, 24); // Daily pattern
    const recentIndices = this.calculateSeasonalIndices(recentData, 24);
    
    // Calculate baseline mean
    const baselineMean = baselineData.reduce((sum, d) => sum + d.value, 0) / baselineData.length;
    
    for (let i = 0; i < Math.min(seasonalIndices.length, recentIndices.length); i++) {
      const baselineIndex = seasonalIndices[i];
      const recentIndex = recentIndices[i];
      
      if (Math.abs(recentIndex - baselineIndex) > 0.5) { // 50% deviation from seasonal pattern
        const hour = i;
        const recentValue = recentData.find(d => d.timestamp.getHours() === hour)?.value || 0;
        const expectedValue = baselineMean * baselineIndex;
        
        anomalies.push({
          id: `pattern_anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metric,
          detectedAt: new Date(),
          anomalyType: 'seasonal_deviation',
          severity: 'medium',
          description: `Seasonal pattern deviation detected for hour ${hour}`,
          expectedValue,
          actualValue: recentValue,
          deviation: Math.abs(recentValue - expectedValue) / expectedValue,
          confidence: 0.7,
          context: {},
          recommendations: ['Investigate seasonal pattern changes', 'Update baseline patterns'],
          status: 'new'
        });
      }
    }
    
    return anomalies;
  }

  private async detectTrendAnomalies(
    metric: string,
    recentData: Array<{ timestamp: Date; value: number }>,
    baselineData: Array<{ timestamp: Date; value: number }>
  ): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];
    
    if (recentData.length < 10 || baselineData.length < 10) {
      return anomalies;
    }
    
    // Calculate trends
    const recentTrend = this.calculateTrend(recentData);
    const baselineTrend = this.calculateTrend(baselineData);
    
    // Detect significant trend changes
    const trendChange = Math.abs(recentTrend - baselineTrend);
    if (trendChange > 0.1) { // 10% trend change
      const lastValue = recentData[recentData.length - 1].value;
      const expectedValue = baselineData[baselineData.length - 1].value;
      
      anomalies.push({
        id: `trend_anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metric,
        detectedAt: new Date(),
        anomalyType: 'trend_change',
        severity: trendChange > 0.2 ? 'high' : 'medium',
        description: `Significant trend change detected: ${recentTrend > baselineTrend ? 'increasing' : 'decreasing'}`,
        expectedValue,
        actualValue: lastValue,
        deviation: trendChange,
        confidence: 0.8,
        context: {},
        recommendations: ['Investigate trend change causes', 'Update forecasting models'],
        status: 'new'
      });
    }
    
    return anomalies;
  }

  private async checkThresholdWarnings(timeRange: { start: Date; end: Date }): Promise<EarlyWarning[]> {
    const warnings: EarlyWarning[] = [];
    
    // Check utilization thresholds
    const metrics = ['compute', 'storage', 'bandwidth', 'ai_tokens', 'api_calls'];
    
    for (const metric of metrics) {
      try {
        const recentData = await this.getRecentMetricData(metric, timeRange);
        if (recentData.length === 0) continue;
        
        const currentValue = recentData[recentData.length - 1].value;
        const threshold = this.getThreshold(metric);
        
        if (currentValue > threshold * 0.9) { // 90% of threshold
          const projectedValue = this.projectValue(recentData, 60); // 1 hour projection
          const timeToBreach = this.calculateTimeToBreach(currentValue, projectedValue, threshold);
          
          if (timeToBreach < 120) { // Less than 2 hours
            warnings.push({
              id: `threshold_warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'threshold_breach',
              severity: timeToBreach < 30 ? 'critical' : 'high',
              title: `${metric} approaching threshold`,
              description: `${metric} utilization is approaching the threshold of ${threshold}`,
              metric,
              currentValue,
              threshold,
              projectedValue,
              timeToBreach,
              confidence: 0.85,
              context: { metric, threshold },
              actions: [
                {
                  action: 'Scale resources',
                  priority: timeToBreach < 30 ? 'critical' : 'high',
                  timeframe: 'immediate',
                  impact: 'Prevent service degradation'
                }
              ],
              status: 'active',
              createdAt: new Date()
            });
          }
        }
      } catch (error) {
        logger.warn(`Failed to check threshold for ${metric}:`, error);
      }
    }
    
    return warnings;
  }

  private async checkTrendWarnings(timeRange: { start: Date; end: Date }): Promise<EarlyWarning[]> {
    const warnings: EarlyWarning[] = [];
    
    const metrics = ['document_generation', 'ai_usage', 'user_activity', 'cost_analysis'];
    
    for (const metric of metrics) {
      try {
        const recentData = await this.getRecentMetricData(metric, timeRange);
        if (recentData.length < 10) continue;
        
        const trend = this.calculateTrend(recentData);
        const currentValue = recentData[recentData.length - 1].value;
        
        // Check for rapid growth trends
        if (trend > 0.2) { // 20% growth rate
          const projectedValue = this.projectValue(recentData, 1440); // 24 hour projection
          
          warnings.push({
            id: `trend_warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'trend_alert',
            severity: trend > 0.5 ? 'critical' : 'high',
            title: `Rapid growth detected in ${metric}`,
            description: `${metric} showing ${Math.round(trend * 100)}% growth rate`,
            metric,
            currentValue,
            threshold: currentValue * 2, // Double current value as threshold
            projectedValue,
            timeToBreach: this.calculateTimeToBreach(currentValue, projectedValue, currentValue * 2),
            confidence: 0.75,
            context: { trend, metric },
            actions: [
              {
                action: 'Prepare for capacity scaling',
                priority: 'high',
                timeframe: '24 hours',
                impact: 'Support projected growth'
              }
            ],
            status: 'active',
            createdAt: new Date()
          });
        }
      } catch (error) {
        logger.warn(`Failed to check trend for ${metric}:`, error);
      }
    }
    
    return warnings;
  }

  private async checkCapacityWarnings(timeRange: { start: Date; end: Date }): Promise<EarlyWarning[]> {
    const warnings: EarlyWarning[] = [];
    
    // Check capacity utilization across resources
    const resources = ['compute', 'storage', 'bandwidth'];
    
    for (const resource of resources) {
      try {
        const recentData = await this.getRecentMetricData(resource, timeRange);
        if (recentData.length === 0) continue;
        
        const currentUtilization = recentData[recentData.length - 1].value;
        
        if (currentUtilization > 0.8) { // 80% utilization
          warnings.push({
            id: `capacity_warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'capacity_warning',
            severity: currentUtilization > 0.9 ? 'critical' : 'high',
            title: `High capacity utilization: ${resource}`,
            description: `${resource} utilization is at ${Math.round(currentUtilization * 100)}%`,
            metric: resource,
            currentValue: currentUtilization,
            threshold: 0.8,
            projectedValue: this.projectValue(recentData, 60),
            timeToBreach: this.calculateTimeToBreach(currentUtilization, this.projectValue(recentData, 60), 1.0),
            confidence: 0.8,
            context: { resource, utilization: currentUtilization },
            actions: [
              {
                action: 'Scale up capacity',
                priority: currentUtilization > 0.9 ? 'critical' : 'high',
                timeframe: 'immediate',
                impact: 'Prevent resource exhaustion'
              }
            ],
            status: 'active',
            createdAt: new Date()
          });
        }
      } catch (error) {
        logger.warn(`Failed to check capacity for ${resource}:`, error);
      }
    }
    
    return warnings;
  }

  private async checkCostWarnings(timeRange: { start: Date; end: Date }): Promise<EarlyWarning[]> {
    const warnings: EarlyWarning[] = [];
    
    try {
      const recentData = await this.getRecentMetricData('cost_analysis', timeRange);
      if (recentData.length === 0) return warnings;
      
      const currentCost = recentData[recentData.length - 1].value;
      const dailyBudget = 1000; // Mock daily budget
      
      if (currentCost > dailyBudget * 0.8) { // 80% of daily budget
        const projectedCost = this.projectValue(recentData, 1440); // 24 hour projection
        
        warnings.push({
          id: `cost_warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'cost_alert',
          severity: currentCost > dailyBudget * 0.9 ? 'critical' : 'high',
          title: 'Daily budget approaching limit',
          description: `Current cost is ${Math.round(currentCost)} (${Math.round((currentCost / dailyBudget) * 100)}% of daily budget)`,
          metric: 'cost_analysis',
          currentValue: currentCost,
          threshold: dailyBudget,
          projectedValue: projectedCost,
          timeToBreach: this.calculateTimeToBreach(currentCost, projectedCost, dailyBudget),
          confidence: 0.85,
          context: { dailyBudget, projectedCost },
          actions: [
            {
              action: 'Review and optimize costs',
              priority: currentCost > dailyBudget * 0.9 ? 'critical' : 'high',
              timeframe: 'immediate',
              impact: 'Prevent budget overrun'
            }
          ],
          status: 'active',
          createdAt: new Date()
        });
      }
    } catch (error) {
      logger.warn('Failed to check cost warnings:', error);
    }
    
    return warnings;
  }

  private deduplicateAnomalies(anomalies: AnomalyDetection[]): AnomalyDetection[] {
    const uniqueAnomalies: AnomalyDetection[] = [];
    const seen = new Set<string>();
    
    for (const anomaly of anomalies) {
      const key = `${anomaly.metric}_${anomaly.anomalyType}_${Math.floor(anomaly.detectedAt.getTime() / (60 * 60 * 1000))}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueAnomalies.push(anomaly);
      }
    }
    
    return uniqueAnomalies;
  }

  private calculateMean(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.value, 0) / data.length;
  }

  private calculateStandardDeviation(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 0;
    
    const mean = this.calculateMean(data);
    const variance = data.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / data.length;
    
    return Math.sqrt(variance);
  }

  private calculateTrend(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 0;
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const timeSpan = data.length;
    
    return (lastValue - firstValue) / (firstValue * timeSpan);
  }

  private calculateSeasonalIndices(data: Array<{ timestamp: Date; value: number }>, period: number): number[] {
    const indices: number[] = new Array(period).fill(0);
    const counts: number[] = new Array(period).fill(0);
    
    data.forEach((point, index) => {
      const periodIndex = index % period;
      indices[periodIndex] += point.value;
      counts[periodIndex]++;
    });
    
    const average = data.reduce((sum, point) => sum + point.value, 0) / data.length;
    
    return indices.map((sum, index) => 
      counts[index] > 0 ? (sum / counts[index]) / average : 1
    );
  }

  private determineAnomalyType(value: number, baseline: number, recentData: Array<{ timestamp: Date; value: number }>, index: number): 'spike' | 'drop' | 'trend_change' | 'pattern_break' | 'seasonal_deviation' | 'outlier' {
    if (value > baseline * 2) return 'spike';
    if (value < baseline * 0.5) return 'drop';
    
    // Check for trend changes
    if (index > 2) {
      const recent = recentData.slice(index - 2, index + 1);
      const trend = this.calculateTrend(recent);
      if (Math.abs(trend) > 0.1) return 'trend_change';
    }
    
    return 'outlier';
  }

  private determineAnomalySeverity(deviation: number): 'low' | 'medium' | 'high' | 'critical' {
    if (deviation > 4) return 'critical';
    if (deviation > 3) return 'high';
    if (deviation > 2.5) return 'medium';
    return 'low';
  }

  private generateAnomalyDescription(metric: string, value: number, baseline: number, type: string): string {
    const percentage = Math.round(((value - baseline) / baseline) * 100);
    
    switch (type) {
      case 'spike':
        return `${metric} experienced a ${percentage}% increase above normal levels`;
      case 'drop':
        return `${metric} dropped ${Math.abs(percentage)}% below normal levels`;
      case 'trend_change':
        return `${metric} shows an unexpected trend change`;
      case 'seasonal_deviation':
        return `${metric} deviated from expected seasonal pattern`;
      default:
        return `${metric} deviated significantly from expected pattern`;
    }
  }

  private generateAnomalyRecommendations(metric: string, type: string, severity: string): string[] {
    const recommendations: string[] = [];
    
    if (severity === 'critical' || severity === 'high') {
      recommendations.push('Investigate immediately and implement corrective measures');
    }
    
    switch (type) {
      case 'spike':
        recommendations.push('Check for increased demand or system issues');
        recommendations.push('Consider scaling resources if trend continues');
        break;
      case 'drop':
        recommendations.push('Verify system health and user activity');
        recommendations.push('Check for potential service disruptions');
        break;
      case 'trend_change':
        recommendations.push('Analyze underlying causes of trend change');
        recommendations.push('Update forecasting models if needed');
        break;
      case 'seasonal_deviation':
        recommendations.push('Review seasonal patterns and update baselines');
        break;
    }
    
    return recommendations;
  }

  private getThreshold(metric: string): number {
    const thresholds: Record<string, number> = {
      'compute': 0.8,
      'storage': 0.9,
      'bandwidth': 0.7,
      'ai_tokens': 0.85,
      'api_calls': 0.75
    };
    return thresholds[metric] || 0.8;
  }

  private projectValue(data: Array<{ timestamp: Date; value: number }>, minutes: number): number {
    if (data.length < 2) return data[0]?.value || 0;
    
    const trend = this.calculateTrend(data);
    const lastValue = data[data.length - 1].value;
    
    return lastValue * (1 + trend * (minutes / 60)); // Project based on hourly trend
  }

  private calculateTimeToBreach(currentValue: number, projectedValue: number, threshold: number): number {
    if (projectedValue <= currentValue) return Infinity;
    
    const rate = (projectedValue - currentValue) / 60; // Per minute rate
    return (threshold - currentValue) / rate;
  }

  private initializeDetectionRules(): void {
    // Initialize default detection rules
    const defaultRules: Omit<DetectionRule, 'id' | 'createdAt' | 'triggerCount'>[] = [
      {
        name: 'Statistical Outlier Detection',
        metric: 'system_performance',
        algorithm: 'statistical',
        parameters: { sensitivity: 3, windowSize: 24 },
        enabled: true
      },
      {
        name: 'Utilization Threshold',
        metric: 'compute',
        algorithm: 'threshold',
        parameters: { threshold: 0.8 },
        enabled: true
      },
      {
        name: 'Cost Anomaly Detection',
        metric: 'cost_analysis',
        algorithm: 'statistical',
        parameters: { sensitivity: 2.5, windowSize: 48 },
        enabled: true
      }
    ];
    
    defaultRules.forEach(rule => {
      this.createDetectionRule(rule);
    });
    
    logger.info('Default detection rules initialized');
  }

  private startAnomalyDetection(): void {
    // Run anomaly detection every 15 minutes
    setInterval(async () => {
      try {
        const metrics = ['document_generation', 'ai_usage', 'user_activity', 'system_performance', 'cost_analysis'];
        
        for (const metric of metrics) {
          await this.detectAnomalies(metric);
        }
      } catch (error: any) {
        logger.error('Anomaly detection failed:', error);
      }
    }, 15 * 60 * 1000); // 15 minutes
  }

  private startEarlyWarningMonitoring(): void {
    // Generate early warnings every 5 minutes
    setInterval(async () => {
      try {
        await this.generateEarlyWarnings();
      } catch (error: any) {
        logger.error('Early warning monitoring failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

// Export singleton instance
export const anomalyDetectionService = AnomalyDetectionService.getInstance();
