import { logger } from '../utils/logger.js';
import { RealTimeMetrics } from '../models/RealTimeMetrics.model.js';
import { AIBillingUsage } from '../models/AIBillingUsage.model.js';
import { UserSession } from '../models/UserSession.model.js';
import { ProjectDocument } from '../models/ProjectDocument.js';
import { ITemplate } from '../models/Template.model.js';
import { Project } from '../models/Project.js';

/**
 * Data Aggregation Service
 * Provides comprehensive data aggregation for historical trend analysis and benchmarking
 */

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  metadata?: any;
}

export interface TrendAnalysis {
  period: string;
  startDate: Date;
  endDate: Date;
  dataPoints: TimeSeriesDataPoint[];
  statistics: {
    min: number;
    max: number;
    average: number;
    median: number;
    standardDeviation: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    trendStrength: number; // -1 to 1, where 1 is strong increasing trend
    changePercentage: number;
  };
  forecast?: {
    nextPeriod: number;
    confidence: number;
  };
}

export interface BenchmarkData {
  metric: string;
  currentValue: number;
  benchmarkValue: number;
  performance: 'above' | 'below' | 'at';
  percentage: number;
  category: 'performance' | 'cost' | 'usage' | 'quality';
  industryStandard?: number;
  bestPractice?: number;
}

export interface AggregationResult {
  metric: string;
  period: string;
  value: number;
  breakdown?: Record<string, number>;
  metadata?: any;
  timestamp: Date;
}

export interface AggregationConfig {
  metric: string;
  timeRange: {
    start: Date;
    end: Date;
    granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  filters?: {
    projectId?: string;
    userId?: string;
    provider?: string;
    model?: string;
    component?: string;
  };
  aggregationType: 'sum' | 'average' | 'count' | 'min' | 'max' | 'median' | 'percentile';
  groupBy?: string[];
}

export class DataAggregationService {
  private static instance: DataAggregationService;
  private aggregationCache: Map<string, { data: any; timestamp: Date; ttl: number }> = new Map();
  private readonly defaultCacheTTL = 15 * 60 * 1000; // 15 minutes

  private constructor() {
    this.startCacheCleanup();
  }

  public static getInstance(): DataAggregationService {
    if (!DataAggregationService.instance) {
      DataAggregationService.instance = new DataAggregationService();
    }
    return DataAggregationService.instance;
  }

  /**
   * Aggregate data based on configuration
   */
  public async aggregateData(config: AggregationConfig): Promise<AggregationResult[]> {
    try {
      const cacheKey = this.generateCacheKey(config);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      let results: AggregationResult[] = [];

      switch (config.metric) {
        case 'document_generation':
          results = await this.aggregateDocumentGeneration(config);
          break;
        case 'ai_usage':
          results = await this.aggregateAIUsage(config);
          break;
        case 'user_activity':
          results = await this.aggregateUserActivity(config);
          break;
        case 'template_usage':
          results = await this.aggregateTemplateUsage(config);
          break;
        case 'system_performance':
          results = await this.aggregateSystemPerformance(config);
          break;
        case 'cost_analysis':
          results = await this.aggregateCostAnalysis(config);
          break;
        case 'quality_metrics':
          results = await this.aggregateQualityMetrics(config);
          break;
        default:
          throw new Error(`Unknown metric: ${config.metric}`);
      }

      this.setCachedResult(cacheKey, results);
      return results;
    } catch (error: any) {
      logger.error('Data aggregation failed:', error);
      throw error;
    }
  }

  /**
   * Perform trend analysis on time series data
   */
  public async performTrendAnalysis(
    metric: string,
    timeRange: { start: Date; end: Date },
    granularity: 'day' | 'week' | 'month' = 'day',
    filters?: any
  ): Promise<TrendAnalysis> {
    try {
      const config: AggregationConfig = {
        metric,
        timeRange: { ...timeRange, granularity },
        filters,
        aggregationType: 'average'
      };

      const dataPoints = await this.aggregateData(config);
      
      if (dataPoints.length === 0) {
        return this.getEmptyTrendAnalysis(timeRange.start, timeRange.end, granularity);
      }

      const values = dataPoints.map(dp => dp.value);
      const statistics = this.calculateStatistics(values);
      const trend = this.calculateTrend(dataPoints);
      const forecast = this.generateForecast(dataPoints);

      return {
        period: granularity,
        startDate: timeRange.start,
        endDate: timeRange.end,
        dataPoints: dataPoints.map(dp => ({
          timestamp: dp.timestamp,
          value: dp.value,
          metadata: dp.metadata
        })),
        statistics,
        trend,
        forecast
      };
    } catch (error: any) {
      logger.error('Trend analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate benchmarks for performance comparison
   */
  public async generateBenchmarks(
    metric: string,
    timeRange: { start: Date; end: Date },
    filters?: any
  ): Promise<BenchmarkData[]> {
    try {
      const benchmarks: BenchmarkData[] = [];

      // Get current performance data
      const currentData = await this.aggregateData({
        metric,
        timeRange: { ...timeRange, granularity: 'day' },
        filters,
        aggregationType: 'average'
      });

      if (currentData.length === 0) {
        return benchmarks;
      }

      const currentValue = currentData.reduce((sum, dp) => sum + dp.value, 0) / currentData.length;

      // Get historical baseline (previous period)
      const baselineStart = new Date(timeRange.start.getTime() - (timeRange.end.getTime() - timeRange.start.getTime()));
      const baselineEnd = timeRange.start;
      
      const baselineData = await this.aggregateData({
        metric,
        timeRange: { start: baselineStart, end: baselineEnd, granularity: 'day' },
        filters,
        aggregationType: 'average'
      });

      if (baselineData.length > 0) {
        const baselineValue = baselineData.reduce((sum, dp) => sum + dp.value, 0) / baselineData.length;
        const percentage = ((currentValue - baselineValue) / baselineValue) * 100;

        benchmarks.push({
          metric,
          currentValue,
          benchmarkValue: baselineValue,
          performance: percentage > 5 ? 'above' : percentage < -5 ? 'below' : 'at',
          percentage: Math.round(percentage * 100) / 100,
          category: this.getMetricCategory(metric)
        });
      }

      // Add industry standards if available
      const industryStandard = this.getIndustryStandard(metric);
      if (industryStandard) {
        const industryPercentage = ((currentValue - industryStandard) / industryStandard) * 100;
        benchmarks.push({
          metric,
          currentValue,
          benchmarkValue: industryStandard,
          performance: industryPercentage > 5 ? 'above' : industryPercentage < -5 ? 'below' : 'at',
          percentage: Math.round(industryPercentage * 100) / 100,
          category: this.getMetricCategory(metric),
          industryStandard
        });
      }

      return benchmarks;
    } catch (error: any) {
      logger.error('Benchmark generation failed:', error);
      throw error;
    }
  }

  /**
   * Aggregate document generation metrics
   */
  private async aggregateDocumentGeneration(config: AggregationConfig): Promise<AggregationResult[]> {
    const pipeline = this.buildTimeSeriesPipeline(
      RealTimeMetrics,
      { type: 'document_generation' },
      config
    );

    const results = await RealTimeMetrics.aggregate(pipeline);
    return results.map(result => ({
      metric: 'document_generation',
      period: this.formatTimePeriod(result._id, config.timeRange.granularity),
      value: this.applyAggregationType(result.data || [], config.aggregationType, 'generationTime'),
      breakdown: result.breakdown || {},
      metadata: result.metadata || {},
      timestamp: result._id
    }));
  }

  /**
   * Aggregate AI usage metrics
   */
  private async aggregateAIUsage(config: AggregationConfig): Promise<AggregationResult[]> {
    const pipeline = this.buildTimeSeriesPipeline(
      AIBillingUsage,
      {},
      config
    );

    const results = await AIBillingUsage.aggregate(pipeline);
    return results.map(result => ({
      metric: 'ai_usage',
      period: this.formatTimePeriod(result._id, config.timeRange.granularity),
      value: this.applyAggregationType(result.data || [], config.aggregationType, 'totalTokens'),
      breakdown: result.breakdown || {},
      metadata: result.metadata || {},
      timestamp: result._id
    }));
  }

  /**
   * Aggregate user activity metrics
   */
  private async aggregateUserActivity(config: AggregationConfig): Promise<AggregationResult[]> {
    const pipeline = this.buildTimeSeriesPipeline(
      UserSession,
      {},
      config
    );

    const results = await UserSession.aggregate(pipeline);
    return results.map(result => ({
      metric: 'user_activity',
      period: this.formatTimePeriod(result._id, config.timeRange.granularity),
      value: this.applyAggregationType(result.data || [], config.aggregationType, 'activityCount'),
      breakdown: result.breakdown || {},
      metadata: result.metadata || {},
      timestamp: result._id
    }));
  }

  /**
   * Aggregate template usage metrics
   */
  private async aggregateTemplateUsage(config: AggregationConfig): Promise<AggregationResult[]> {
    const pipeline = this.buildTimeSeriesPipeline(
      RealTimeMetrics,
      { type: 'template_usage' },
      config
    );

    const results = await RealTimeMetrics.aggregate(pipeline);
    return results.map(result => ({
      metric: 'template_usage',
      period: this.formatTimePeriod(result._id, config.timeRange.granularity),
      value: this.applyAggregationType(result.data || [], config.aggregationType, 'usageCount'),
      breakdown: result.breakdown || {},
      metadata: result.metadata || {},
      timestamp: result._id
    }));
  }

  /**
   * Aggregate system performance metrics
   */
  private async aggregateSystemPerformance(config: AggregationConfig): Promise<AggregationResult[]> {
    const pipeline = this.buildTimeSeriesPipeline(
      RealTimeMetrics,
      { type: 'system_performance' },
      config
    );

    const results = await RealTimeMetrics.aggregate(pipeline);
    return results.map(result => ({
      metric: 'system_performance',
      period: this.formatTimePeriod(result._id, config.timeRange.granularity),
      value: this.applyAggregationType(result.data || [], config.aggregationType, 'responseTime'),
      breakdown: result.breakdown || {},
      metadata: result.metadata || {},
      timestamp: result._id
    }));
  }

  /**
   * Aggregate cost analysis metrics
   */
  private async aggregateCostAnalysis(config: AggregationConfig): Promise<AggregationResult[]> {
    const pipeline = this.buildTimeSeriesPipeline(
      AIBillingUsage,
      {},
      config
    );

    const results = await AIBillingUsage.aggregate(pipeline);
    return results.map(result => ({
      metric: 'cost_analysis',
      period: this.formatTimePeriod(result._id, config.timeRange.granularity),
      value: this.applyAggregationType(result.data || [], config.aggregationType, 'cost'),
      breakdown: result.breakdown || {},
      metadata: result.metadata || {},
      timestamp: result._id
    }));
  }

  /**
   * Aggregate quality metrics
   */
  private async aggregateQualityMetrics(config: AggregationConfig): Promise<AggregationResult[]> {
    const pipeline = this.buildTimeSeriesPipeline(
      ProjectDocument,
      {},
      config
    );

    const results = await ProjectDocument.aggregate(pipeline);
    return results.map(result => ({
      metric: 'quality_metrics',
      period: this.formatTimePeriod(result._id, config.timeRange.granularity),
      value: this.applyAggregationType(result.data || [], config.aggregationType, 'qualityScore'),
      breakdown: result.breakdown || {},
      metadata: result.metadata || {},
      timestamp: result._id
    }));
  }

  /**
   * Build MongoDB aggregation pipeline for time series data
   */
  private buildTimeSeriesPipeline(
    model: any,
    baseMatch: any,
    config: AggregationConfig
  ): any[] {
    const matchStage: any = {
      timestamp: {
        $gte: config.timeRange.start,
        $lte: config.timeRange.end
      },
      ...baseMatch
    };

    // Apply filters
    if (config.filters) {
      Object.entries(config.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'projectId' || key === 'userId') {
            matchStage[`metadata.${key}`] = value;
          } else {
            matchStage[key] = value;
          }
        }
      });
    }

    // Build date grouping based on granularity
    let dateGroup: any = {};
    switch (config.timeRange.granularity) {
      case 'hour':
        dateGroup = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        };
        break;
      case 'day':
        dateGroup = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
        break;
      case 'week':
        dateGroup = {
          year: { $year: '$timestamp' },
          week: { $week: '$timestamp' }
        };
        break;
      case 'month':
        dateGroup = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' }
        };
        break;
      case 'quarter':
        dateGroup = {
          year: { $year: '$timestamp' },
          quarter: {
            $ceil: { $divide: [{ $month: '$timestamp' }, 3] }
          }
        };
        break;
      case 'year':
        dateGroup = {
          year: { $year: '$timestamp' }
        };
        break;
    }

    return [
      { $match: matchStage },
      {
        $group: {
          _id: dateGroup,
          data: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ];
  }

  /**
   * Apply aggregation type to data
   */
  private applyAggregationType(data: any[], type: string, field: string): number {
    if (data.length === 0) return 0;

    const values = data.map(item => {
      if (field === 'generationTime') return item.data?.generationTime || 0;
      if (field === 'totalTokens') return item.usage?.totalTokens || 0;
      if (field === 'activityCount') return item.activities?.length || 0;
      if (field === 'usageCount') return 1;
      if (field === 'responseTime') return item.data?.responseTime || 0;
      if (field === 'cost') return item.cost?.amount || 0;
      if (field === 'qualityScore') return item.qualityScore || 0;
      return 0;
    }).filter(v => v > 0);

    switch (type) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'average':
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      case 'count':
        return values.length;
      case 'min':
        return values.length > 0 ? Math.min(...values) : 0;
      case 'max':
        return values.length > 0 ? Math.max(...values) : 0;
      case 'median':
        return this.calculateMedian(values);
      case 'percentile':
        return this.calculatePercentile(values, 95);
      default:
        return values.reduce((sum, val) => sum + val, 0);
    }
  }

  /**
   * Calculate statistical measures
   */
  private calculateStatistics(values: number[]): any {
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        median: 0,
        standardDeviation: 0,
        trend: 'stable',
        trendStrength: 0,
        changePercentage: 0
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((s, v) => s + v, 0);
    const average = sum / values.length;
    const variance = values.reduce((s, v) => s + Math.pow(v - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: Math.round(average * 100) / 100,
      median: this.calculateMedian(sorted),
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      trend: 'stable', // Will be calculated separately
      trendStrength: 0, // Will be calculated separately
      changePercentage: 0 // Will be calculated separately
    };
  }

  /**
   * Calculate trend from data points
   */
  private calculateTrend(dataPoints: AggregationResult[]): any {
    if (dataPoints.length < 2) {
      return {
        trend: 'stable',
        trendStrength: 0,
        changePercentage: 0
      };
    }

    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

    const firstAvg = firstHalf.reduce((sum, dp) => sum + dp.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, dp) => sum + dp.value, 0) / secondHalf.length;

    const changePercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
    const trendStrength = Math.min(Math.abs(changePercentage) / 100, 1);
    const trend = changePercentage > 5 ? 'increasing' : changePercentage < -5 ? 'decreasing' : 'stable';

    return {
      trend,
      trendStrength: Math.round(trendStrength * 100) / 100,
      changePercentage: Math.round(changePercentage * 100) / 100
    };
  }

  /**
   * Generate simple forecast
   */
  private generateForecast(dataPoints: AggregationResult[]): any {
    if (dataPoints.length < 3) {
      return { nextPeriod: 0, confidence: 0 };
    }

    // Simple linear regression for forecasting
    const recentPoints = dataPoints.slice(-10); // Use last 10 points
    const trend = this.calculateTrend(recentPoints);
    const lastValue = recentPoints[recentPoints.length - 1].value;
    
    const forecastValue = lastValue * (1 + trend.changePercentage / 100);
    const confidence = Math.max(0, Math.min(1, 1 - (Math.abs(trend.changePercentage) / 50)));

    return {
      nextPeriod: Math.round(forecastValue * 100) / 100,
      confidence: Math.round(confidence * 100) / 100
    };
  }

  /**
   * Helper methods
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private formatTimePeriod(dateGroup: any, granularity: string): string {
    switch (granularity) {
      case 'hour':
        return `${dateGroup.year}-${dateGroup.month.toString().padStart(2, '0')}-${dateGroup.day.toString().padStart(2, '0')} ${dateGroup.hour.toString().padStart(2, '0')}:00`;
      case 'day':
        return `${dateGroup.year}-${dateGroup.month.toString().padStart(2, '0')}-${dateGroup.day.toString().padStart(2, '0')}`;
      case 'week':
        return `${dateGroup.year}-W${dateGroup.week.toString().padStart(2, '0')}`;
      case 'month':
        return `${dateGroup.year}-${dateGroup.month.toString().padStart(2, '0')}`;
      case 'quarter':
        return `${dateGroup.year}-Q${dateGroup.quarter}`;
      case 'year':
        return `${dateGroup.year}`;
      default:
        return `${dateGroup.year}-${dateGroup.month}-${dateGroup.day}`;
    }
  }

  private getMetricCategory(metric: string): 'performance' | 'cost' | 'usage' | 'quality' {
    if (metric.includes('generation') || metric.includes('performance')) return 'performance';
    if (metric.includes('cost') || metric.includes('billing')) return 'cost';
    if (metric.includes('usage') || metric.includes('activity')) return 'usage';
    if (metric.includes('quality')) return 'quality';
    return 'usage';
  }

  private getIndustryStandard(metric: string): number | null {
    // Industry standards (these would typically come from external data sources)
    const standards: Record<string, number> = {
      'document_generation': 2.5, // seconds average generation time
      'ai_usage': 1000, // tokens per request
      'user_activity': 15, // minutes average session
      'template_usage': 5, // templates per user per day
      'system_performance': 200, // ms average response time
      'cost_analysis': 0.01, // $0.01 per request
      'quality_metrics': 85 // quality score out of 100
    };
    return standards[metric] || null;
  }

  private getEmptyTrendAnalysis(start: Date, end: Date, granularity: string): TrendAnalysis {
    return {
      period: granularity,
      startDate: start,
      endDate: end,
      dataPoints: [],
      statistics: {
        min: 0,
        max: 0,
        average: 0,
        median: 0,
        standardDeviation: 0,
        trend: 'stable',
        trendStrength: 0,
        changePercentage: 0
      }
    };
  }

  /**
   * Cache management
   */
  private generateCacheKey(config: AggregationConfig): string {
    return `agg_${config.metric}_${config.timeRange.start.getTime()}_${config.timeRange.end.getTime()}_${config.timeRange.granularity}_${JSON.stringify(config.filters || {})}_${config.aggregationType}`;
  }

  private getCachedResult(key: string): AggregationResult[] | null {
    const cached = this.aggregationCache.get(key);
    if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  private setCachedResult(key: string, data: AggregationResult[]): void {
    this.aggregationCache.set(key, {
      data,
      timestamp: new Date(),
      ttl: this.defaultCacheTTL
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.aggregationCache.entries()) {
        if (now - cached.timestamp.getTime() > cached.ttl) {
          this.aggregationCache.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }
}

// Export singleton instance
export const dataAggregationService = DataAggregationService.getInstance();
