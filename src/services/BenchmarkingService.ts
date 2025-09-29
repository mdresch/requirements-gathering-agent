import { logger } from '../utils/logger.js';
import { dataAggregationService } from './DataAggregationService.js';
import { RealTimeMetrics } from '../models/RealTimeMetrics.model.js';
import { AIBillingUsage } from '../models/AIBillingUsage.model.js';
import { ProjectDocument } from '../models/ProjectDocument.js';

/**
 * Benchmarking Service
 * Provides comprehensive benchmarking capabilities for performance comparison
 */

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'cost' | 'usage' | 'quality' | 'efficiency';
  metric: string;
  baseline: {
    value: number;
    period: string;
    source: 'historical' | 'industry' | 'target' | 'custom';
  };
  current: {
    value: number;
    period: string;
    confidence: number;
  };
  comparison: {
    difference: number;
    percentage: number;
    performance: 'above' | 'below' | 'at';
    trend: 'improving' | 'declining' | 'stable';
  };
  context: {
    projectId?: string;
    userId?: string;
    provider?: string;
    model?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastCalculated: Date;
    dataPoints: number;
    reliability: 'high' | 'medium' | 'low';
  };
}

export interface BenchmarkCategory {
  category: string;
  benchmarks: Benchmark[];
  summary: {
    total: number;
    above: number;
    below: number;
    at: number;
    averagePerformance: number;
  };
}

export interface BenchmarkComparison {
  metric: string;
  current: number;
  historical: number;
  industry: number;
  target: number;
  peers: number[];
  percentile: number;
  recommendation: string;
}

export interface PerformanceProfile {
  profileId: string;
  name: string;
  description: string;
  metrics: {
    [metric: string]: {
      baseline: number;
      target: number;
      weight: number;
    };
  };
  benchmarks: Benchmark[];
  overallScore: number;
  lastUpdated: Date;
}

export class BenchmarkingService {
  private static instance: BenchmarkingService;
  private benchmarks: Map<string, Benchmark> = new Map();
  private performanceProfiles: Map<string, PerformanceProfile> = new Map();
  private industryStandards: Map<string, number> = new Map();

  private constructor() {
    this.initializeIndustryStandards();
    this.startBenchmarkCalculation();
  }

  public static getInstance(): BenchmarkingService {
    if (!BenchmarkingService.instance) {
      BenchmarkingService.instance = new BenchmarkingService();
    }
    return BenchmarkingService.instance;
  }

  /**
   * Calculate comprehensive benchmarks
   */
  public async calculateBenchmarks(
    timeRange: { start: Date; end: Date },
    context?: {
      projectId?: string;
      userId?: string;
      provider?: string;
      model?: string;
    }
  ): Promise<Benchmark[]> {
    try {
      const benchmarks: Benchmark[] = [];

      // Document Generation Performance
      benchmarks.push(await this.calculateDocumentGenerationBenchmark(timeRange, context));
      
      // AI Usage Efficiency
      benchmarks.push(await this.calculateAIUsageBenchmark(timeRange, context));
      
      // Cost Efficiency
      benchmarks.push(await this.calculateCostEfficiencyBenchmark(timeRange, context));
      
      // Quality Metrics
      benchmarks.push(await this.calculateQualityBenchmark(timeRange, context));
      
      // System Performance
      benchmarks.push(await this.calculateSystemPerformanceBenchmark(timeRange, context));
      
      // User Engagement
      benchmarks.push(await this.calculateUserEngagementBenchmark(timeRange, context));

      // Store benchmarks
      benchmarks.forEach(benchmark => {
        this.benchmarks.set(benchmark.id, benchmark);
      });

      logger.info(`Calculated ${benchmarks.length} benchmarks`, { context });
      return benchmarks;
    } catch (error: any) {
      logger.error('Benchmark calculation failed:', error);
      throw error;
    }
  }

  /**
   * Get benchmarks by category
   */
  public getBenchmarksByCategory(): BenchmarkCategory[] {
    const categories: Map<string, Benchmark[]> = new Map();

    this.benchmarks.forEach(benchmark => {
      if (!categories.has(benchmark.category)) {
        categories.set(benchmark.category, []);
      }
      categories.get(benchmark.category)!.push(benchmark);
    });

    return Array.from(categories.entries()).map(([category, benchmarks]) => ({
      category,
      benchmarks,
      summary: {
        total: benchmarks.length,
        above: benchmarks.filter(b => b.comparison.performance === 'above').length,
        below: benchmarks.filter(b => b.comparison.performance === 'below').length,
        at: benchmarks.filter(b => b.comparison.performance === 'at').length,
        averagePerformance: this.calculateAveragePerformance(benchmarks)
      }
    }));
  }

  /**
   * Compare with industry standards
   */
  public async compareWithIndustry(
    metric: string,
    currentValue: number,
    context?: any
  ): Promise<BenchmarkComparison> {
    try {
      const industryStandard = this.industryStandards.get(metric) || 0;
      const historicalValue = await this.getHistoricalAverage(metric, context);
      const targetValue = this.getTargetValue(metric, context);
      const peersData = await this.getPeersData(metric, context);

      const percentile = this.calculatePercentile(currentValue, peersData);
      const recommendation = this.generateRecommendation(
        metric,
        currentValue,
        industryStandard,
        historicalValue,
        targetValue
      );

      return {
        metric,
        current: currentValue,
        historical: historicalValue,
        industry: industryStandard,
        target: targetValue,
        peers: peersData,
        percentile,
        recommendation
      };
    } catch (error: any) {
      logger.error('Industry comparison failed:', error);
      throw error;
    }
  }

  /**
   * Create performance profile
   */
  public createPerformanceProfile(
    name: string,
    description: string,
    metrics: { [metric: string]: { baseline: number; target: number; weight: number } }
  ): string {
    const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const profile: PerformanceProfile = {
      profileId,
      name,
      description,
      metrics,
      benchmarks: [],
      overallScore: 0,
      lastUpdated: new Date()
    };

    this.performanceProfiles.set(profileId, profile);
    
    logger.info('Performance profile created', { profileId, name });
    return profileId;
  }

  /**
   * Calculate performance profile score
   */
  public async calculateProfileScore(profileId: string): Promise<number> {
    const profile = this.performanceProfiles.get(profileId);
    if (!profile) {
      throw new Error(`Performance profile not found: ${profileId}`);
    }

    let totalScore = 0;
    let totalWeight = 0;

    for (const [metric, config] of Object.entries(profile.metrics)) {
      try {
        const currentValue = await this.getCurrentMetricValue(metric);
        const score = this.calculateMetricScore(currentValue, config.baseline, config.target);
        totalScore += score * config.weight;
        totalWeight += config.weight;
      } catch (error) {
        logger.warn(`Failed to calculate score for metric ${metric}:`, error);
      }
    }

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    profile.overallScore = Math.round(overallScore * 100) / 100;
    profile.lastUpdated = new Date();
    
    return profile.overallScore;
  }

  /**
   * Get benchmarking insights
   */
  public async getBenchmarkingInsights(): Promise<{
    topPerformers: Array<{ metric: string; value: number; performance: string }>;
    improvementOpportunities: Array<{ metric: string; current: number; target: number; potential: number }>;
    trends: Array<{ metric: string; trend: string; change: number }>;
    recommendations: string[];
  }> {
    try {
      const topPerformers = this.getTopPerformers();
      const improvementOpportunities = this.getImprovementOpportunities();
      const trends = await this.getTrendAnalysis();
      const recommendations = this.generateRecommendations(topPerformers, improvementOpportunities, trends);

      return {
        topPerformers,
        improvementOpportunities,
        trends,
        recommendations
      };
    } catch (error: any) {
      logger.error('Failed to generate benchmarking insights:', error);
      throw error;
    }
  }

  /**
   * Private methods for benchmark calculations
   */
  private async calculateDocumentGenerationBenchmark(
    timeRange: { start: Date; end: Date },
    context?: any
  ): Promise<Benchmark> {
    const currentData = await this.getCurrentMetricValue('document_generation_time', context);
    const historicalData = await this.getHistoricalAverage('document_generation_time', context);
    const industryStandard = this.industryStandards.get('document_generation_time') || 2.5;

    return {
      id: `benchmark_doc_gen_${Date.now()}`,
      name: 'Document Generation Performance',
      description: 'Average time to generate documents',
      category: 'performance',
      metric: 'document_generation_time',
      baseline: {
        value: historicalData,
        period: 'historical',
        source: 'historical'
      },
      current: {
        value: currentData,
        period: 'current',
        confidence: 0.95
      },
      comparison: {
        difference: currentData - historicalData,
        percentage: ((currentData - historicalData) / historicalData) * 100,
        performance: currentData < historicalData * 0.95 ? 'above' : currentData > historicalData * 1.05 ? 'below' : 'at',
        trend: currentData < historicalData ? 'improving' : currentData > historicalData ? 'declining' : 'stable'
      },
      context,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCalculated: new Date(),
        dataPoints: 100,
        reliability: 'high'
      }
    };
  }

  private async calculateAIUsageBenchmark(
    timeRange: { start: Date; end: Date },
    context?: any
  ): Promise<Benchmark> {
    const currentData = await this.getCurrentMetricValue('ai_tokens_per_request', context);
    const historicalData = await this.getHistoricalAverage('ai_tokens_per_request', context);
    const industryStandard = this.industryStandards.get('ai_tokens_per_request') || 1000;

    return {
      id: `benchmark_ai_usage_${Date.now()}`,
      name: 'AI Usage Efficiency',
      description: 'Average tokens per AI request',
      category: 'efficiency',
      metric: 'ai_tokens_per_request',
      baseline: {
        value: historicalData,
        period: 'historical',
        source: 'historical'
      },
      current: {
        value: currentData,
        period: 'current',
        confidence: 0.90
      },
      comparison: {
        difference: currentData - historicalData,
        percentage: ((currentData - historicalData) / historicalData) * 100,
        performance: currentData < historicalData * 0.95 ? 'above' : currentData > historicalData * 1.05 ? 'below' : 'at',
        trend: currentData < historicalData ? 'improving' : currentData > historicalData ? 'declining' : 'stable'
      },
      context,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCalculated: new Date(),
        dataPoints: 150,
        reliability: 'high'
      }
    };
  }

  private async calculateCostEfficiencyBenchmark(
    timeRange: { start: Date; end: Date },
    context?: any
  ): Promise<Benchmark> {
    const currentData = await this.getCurrentMetricValue('cost_per_document', context);
    const historicalData = await this.getHistoricalAverage('cost_per_document', context);
    const industryStandard = this.industryStandards.get('cost_per_document') || 0.05;

    return {
      id: `benchmark_cost_eff_${Date.now()}`,
      name: 'Cost Efficiency',
      description: 'Average cost per document generated',
      category: 'cost',
      metric: 'cost_per_document',
      baseline: {
        value: historicalData,
        period: 'historical',
        source: 'historical'
      },
      current: {
        value: currentData,
        period: 'current',
        confidence: 0.85
      },
      comparison: {
        difference: currentData - historicalData,
        percentage: ((currentData - historicalData) / historicalData) * 100,
        performance: currentData < historicalData * 0.95 ? 'above' : currentData > historicalData * 1.05 ? 'below' : 'at',
        trend: currentData < historicalData ? 'improving' : currentData > historicalData ? 'declining' : 'stable'
      },
      context,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCalculated: new Date(),
        dataPoints: 120,
        reliability: 'medium'
      }
    };
  }

  private async calculateQualityBenchmark(
    timeRange: { start: Date; end: Date },
    context?: any
  ): Promise<Benchmark> {
    const currentData = await this.getCurrentMetricValue('document_quality_score', context);
    const historicalData = await this.getHistoricalAverage('document_quality_score', context);
    const industryStandard = this.industryStandards.get('document_quality_score') || 85;

    return {
      id: `benchmark_quality_${Date.now()}`,
      name: 'Document Quality',
      description: 'Average document quality score',
      category: 'quality',
      metric: 'document_quality_score',
      baseline: {
        value: historicalData,
        period: 'historical',
        source: 'historical'
      },
      current: {
        value: currentData,
        period: 'current',
        confidence: 0.88
      },
      comparison: {
        difference: currentData - historicalData,
        percentage: ((currentData - historicalData) / historicalData) * 100,
        performance: currentData > historicalData * 1.02 ? 'above' : currentData < historicalData * 0.98 ? 'below' : 'at',
        trend: currentData > historicalData ? 'improving' : currentData < historicalData ? 'declining' : 'stable'
      },
      context,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCalculated: new Date(),
        dataPoints: 80,
        reliability: 'medium'
      }
    };
  }

  private async calculateSystemPerformanceBenchmark(
    timeRange: { start: Date; end: Date },
    context?: any
  ): Promise<Benchmark> {
    const currentData = await this.getCurrentMetricValue('api_response_time', context);
    const historicalData = await this.getHistoricalAverage('api_response_time', context);
    const industryStandard = this.industryStandards.get('api_response_time') || 200;

    return {
      id: `benchmark_sys_perf_${Date.now()}`,
      name: 'System Performance',
      description: 'Average API response time',
      category: 'performance',
      metric: 'api_response_time',
      baseline: {
        value: historicalData,
        period: 'historical',
        source: 'historical'
      },
      current: {
        value: currentData,
        period: 'current',
        confidence: 0.92
      },
      comparison: {
        difference: currentData - historicalData,
        percentage: ((currentData - historicalData) / historicalData) * 100,
        performance: currentData < historicalData * 0.95 ? 'above' : currentData > historicalData * 1.05 ? 'below' : 'at',
        trend: currentData < historicalData ? 'improving' : currentData > historicalData ? 'declining' : 'stable'
      },
      context,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCalculated: new Date(),
        dataPoints: 200,
        reliability: 'high'
      }
    };
  }

  private async calculateUserEngagementBenchmark(
    timeRange: { start: Date; end: Date },
    context?: any
  ): Promise<Benchmark> {
    const currentData = await this.getCurrentMetricValue('user_session_duration', context);
    const historicalData = await this.getHistoricalAverage('user_session_duration', context);
    const industryStandard = this.industryStandards.get('user_session_duration') || 15;

    return {
      id: `benchmark_user_eng_${Date.now()}`,
      name: 'User Engagement',
      description: 'Average user session duration',
      category: 'usage',
      metric: 'user_session_duration',
      baseline: {
        value: historicalData,
        period: 'historical',
        source: 'historical'
      },
      current: {
        value: currentData,
        period: 'current',
        confidence: 0.87
      },
      comparison: {
        difference: currentData - historicalData,
        percentage: ((currentData - historicalData) / historicalData) * 100,
        performance: currentData > historicalData * 1.05 ? 'above' : currentData < historicalData * 0.95 ? 'below' : 'at',
        trend: currentData > historicalData ? 'improving' : currentData < historicalData ? 'declining' : 'stable'
      },
      context,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCalculated: new Date(),
        dataPoints: 75,
        reliability: 'medium'
      }
    };
  }

  /**
   * Helper methods
   */
  private async getCurrentMetricValue(metric: string, context?: any): Promise<number> {
    // This would typically query the appropriate data source
    // For now, return mock data based on metric type
    const mockValues: Record<string, number> = {
      'document_generation_time': 2.1,
      'ai_tokens_per_request': 950,
      'cost_per_document': 0.045,
      'document_quality_score': 87,
      'api_response_time': 180,
      'user_session_duration': 18
    };
    return mockValues[metric] || 0;
  }

  private async getHistoricalAverage(metric: string, context?: any): Promise<number> {
    // This would typically query historical data
    const historicalValues: Record<string, number> = {
      'document_generation_time': 2.8,
      'ai_tokens_per_request': 1100,
      'cost_per_document': 0.055,
      'document_quality_score': 82,
      'api_response_time': 220,
      'user_session_duration': 16
    };
    return historicalValues[metric] || 0;
  }

  private getTargetValue(metric: string, context?: any): number {
    const targetValues: Record<string, number> = {
      'document_generation_time': 1.5,
      'ai_tokens_per_request': 800,
      'cost_per_document': 0.03,
      'document_quality_score': 90,
      'api_response_time': 150,
      'user_session_duration': 20
    };
    return targetValues[metric] || 0;
  }

  private async getPeersData(metric: string, context?: any): Promise<number[]> {
    // This would typically come from industry data or peer comparisons
    const peersData: Record<string, number[]> = {
      'document_generation_time': [2.0, 2.5, 3.0, 1.8, 2.2],
      'ai_tokens_per_request': [900, 1000, 1200, 800, 950],
      'cost_per_document': [0.04, 0.05, 0.06, 0.035, 0.045],
      'document_quality_score': [85, 88, 82, 90, 87],
      'api_response_time': [180, 200, 250, 160, 190],
      'user_session_duration': [15, 18, 12, 22, 16]
    };
    return peersData[metric] || [];
  }

  private calculatePercentile(value: number, peersData: number[]): number {
    if (peersData.length === 0) return 50;
    const sorted = [...peersData].sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return Math.round(((index === -1 ? sorted.length : index) / sorted.length) * 100);
  }

  private generateRecommendation(
    metric: string,
    current: number,
    industry: number,
    historical: number,
    target: number
  ): string {
    const recommendations: Record<string, string> = {
      'document_generation_time': current > target ? 'Consider optimizing AI prompts or using faster models' : 'Great performance! Maintain current approach.',
      'ai_tokens_per_request': current > target ? 'Optimize prompts to reduce token usage' : 'Efficient token usage achieved.',
      'cost_per_document': current > target ? 'Review AI provider pricing or optimize usage patterns' : 'Cost efficiency goals met.',
      'document_quality_score': current < target ? 'Improve template quality or AI model selection' : 'Quality standards exceeded.',
      'api_response_time': current > target ? 'Optimize database queries and caching' : 'Excellent response times.',
      'user_session_duration': current < target ? 'Improve user experience and feature engagement' : 'Strong user engagement achieved.'
    };
    return recommendations[metric] || 'Continue monitoring and optimization.';
  }

  private calculateAveragePerformance(benchmarks: Benchmark[]): number {
    if (benchmarks.length === 0) return 0;
    const scores = benchmarks.map(b => {
      switch (b.comparison.performance) {
        case 'above': return 100;
        case 'at': return 50;
        case 'below': return 0;
        default: return 50;
      }
    });
    return scores.reduce((sum: number, score) => sum + score, 0) / scores.length;
  }

  private calculateMetricScore(current: number, baseline: number, target: number): number {
    if (current === target) return 100;
    if (current === baseline) return 50;
    
    const progress = (current - baseline) / (target - baseline);
    return Math.max(0, Math.min(100, 50 + (progress * 50)));
  }

  private getTopPerformers(): Array<{ metric: string; value: number; performance: string }> {
    return Array.from(this.benchmarks.values())
      .filter(b => b.comparison.performance === 'above')
      .map(b => ({
        metric: b.name,
        value: b.current.value,
        performance: `${b.comparison.percentage.toFixed(1)}% above baseline`
      }))
      .sort((a, b) => Math.abs(parseFloat(a.performance)) - Math.abs(parseFloat(b.performance)))
      .slice(0, 5);
  }

  private getImprovementOpportunities(): Array<{ metric: string; current: number; target: number; potential: number }> {
    return Array.from(this.benchmarks.values())
      .filter(b => b.comparison.performance === 'below')
      .map(b => ({
        metric: b.name,
        current: b.current.value,
        target: b.baseline.value * 0.95, // 5% improvement target
        potential: Math.abs(b.comparison.percentage)
      }))
      .sort((a, b) => b.potential - a.potential)
      .slice(0, 5);
  }

  private async getTrendAnalysis(): Promise<Array<{ metric: string; trend: string; change: number }>> {
    return Array.from(this.benchmarks.values())
      .map(b => ({
        metric: b.name,
        trend: b.comparison.trend,
        change: b.comparison.percentage
      }))
      .filter(t => Math.abs(t.change) > 2); // Only significant trends
  }

  private generateRecommendations(
    topPerformers: any[],
    improvementOpportunities: any[],
    trends: any[]
  ): string[] {
    const recommendations: string[] = [];

    if (topPerformers.length > 0) {
      recommendations.push(`Maintain excellence in ${topPerformers[0].metric} - you're performing ${topPerformers[0].performance}.`);
    }

    if (improvementOpportunities.length > 0) {
      recommendations.push(`Focus on improving ${improvementOpportunities[0].metric} - potential for ${improvementOpportunities[0].potential.toFixed(1)}% improvement.`);
    }

    const decliningTrends = trends.filter(t => t.trend === 'declining');
    if (decliningTrends.length > 0) {
      recommendations.push(`Address declining trend in ${decliningTrends[0].metric} - down ${Math.abs(decliningTrends[0].change).toFixed(1)}% from baseline.`);
    }

    return recommendations;
  }

  /**
   * Initialize industry standards
   */
  private initializeIndustryStandards(): void {
    this.industryStandards.set('document_generation_time', 2.5);
    this.industryStandards.set('ai_tokens_per_request', 1000);
    this.industryStandards.set('cost_per_document', 0.05);
    this.industryStandards.set('document_quality_score', 85);
    this.industryStandards.set('api_response_time', 200);
    this.industryStandards.set('user_session_duration', 15);
    
    logger.info('Industry standards initialized');
  }

  /**
   * Start periodic benchmark calculation
   */
  private startBenchmarkCalculation(): void {
    // Calculate benchmarks every hour
    setInterval(async () => {
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        
        await this.calculateBenchmarks({ start: startDate, end: endDate });
        logger.debug('Periodic benchmark calculation completed');
      } catch (error: any) {
        logger.error('Periodic benchmark calculation failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Export singleton instance
export const benchmarkingService = BenchmarkingService.getInstance();
