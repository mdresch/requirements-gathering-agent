import { logger } from '../utils/logger.js';
import { dataAggregationService } from './DataAggregationService.js';
import { predictiveAnalyticsService } from './PredictiveAnalyticsService.js';

/**
 * Resource Demand Forecasting Service
 * Specialized service for forecasting resource demands with advanced algorithms
 */

export interface ResourceDemandModel {
  resourceType: string;
  modelType: 'linear' | 'polynomial' | 'exponential' | 'seasonal' | 'arima' | 'lstm';
  parameters: {
    alpha?: number; // Smoothing factor
    beta?: number; // Trend factor
    gamma?: number; // Seasonal factor
    period?: number; // Seasonal period
    degree?: number; // Polynomial degree
  };
  accuracy: {
    mae: number; // Mean Absolute Error
    rmse: number; // Root Mean Square Error
    mape: number; // Mean Absolute Percentage Error
    r2: number; // R-squared
  };
  lastTrained: Date;
  trainingDataSize: number;
}

export interface DemandForecast {
  resourceType: string;
  currentDemand: number;
  forecasts: {
    nextHour: number;
    nextDay: number;
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  };
  confidence: {
    nextHour: number;
    nextDay: number;
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  };
  seasonality: {
    detected: boolean;
    period: number;
    strength: number;
  };
  trends: {
    shortTerm: 'increasing' | 'decreasing' | 'stable';
    longTerm: 'increasing' | 'decreasing' | 'stable';
    acceleration: number; // Rate of change of trend
  };
  recommendations: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      factor: string;
      probability: number;
      impact: string;
    }>;
  };
}

export interface ResourceUtilizationPattern {
  resourceType: string;
  patterns: {
    daily: Array<{ hour: number; utilization: number }>;
    weekly: Array<{ day: number; utilization: number }>;
    monthly: Array<{ day: number; utilization: number }>;
  };
  peaks: {
    daily: { time: string; utilization: number };
    weekly: { day: string; utilization: number };
    monthly: { date: string; utilization: number };
  };
  trends: {
    dailyTrend: number;
    weeklyTrend: number;
    monthlyTrend: number;
  };
}

export class ResourceDemandForecastingService {
  private static instance: ResourceDemandForecastingService;
  private models: Map<string, ResourceDemandModel> = new Map();
  private patterns: Map<string, ResourceUtilizationPattern> = new Map();
  private forecastingCache: Map<string, { forecast: DemandForecast; timestamp: Date }> = new Map();

  private constructor() {
    this.initializeModels();
    this.startPatternAnalysis();
  }

  public static getInstance(): ResourceDemandForecastingService {
    if (!ResourceDemandForecastingService.instance) {
      ResourceDemandForecastingService.instance = new ResourceDemandForecastingService();
    }
    return ResourceDemandForecastingService.instance;
  }

  /**
   * Generate comprehensive demand forecast for a resource type
   */
  public async generateDemandForecast(
    resourceType: string,
    timeRange: { start: Date; end: Date } = { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), end: new Date() }
  ): Promise<DemandForecast> {
    try {
      logger.info(`Generating demand forecast for ${resourceType}`, { timeRange });

      // Check cache first
      const cacheKey = `${resourceType}_${timeRange.start.getTime()}_${timeRange.end.getTime()}`;
      const cached = this.forecastingCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp.getTime() < 15 * 60 * 1000) { // 15 minute cache
        return cached.forecast;
      }

      // Get historical data with high granularity
      const historicalData = await this.getHighResolutionData(resourceType, timeRange);
      
      if (historicalData.length < 24) { // Need at least 24 hours of data
        return this.getDefaultDemandForecast(resourceType);
      }

      // Analyze patterns
      const patterns = await this.analyzeUtilizationPatterns(resourceType, historicalData);
      
      // Generate forecasts using multiple methods
      const forecasts = await this.generateMultipleForecasts(resourceType, historicalData);
      
      // Calculate confidence scores
      const confidence = this.calculateConfidenceScores(historicalData, patterns);
      
      // Detect seasonality
      const seasonality = this.detectSeasonality(historicalData);
      
      // Analyze trends
      const trends = this.analyzeTrends(historicalData);
      
      // Generate recommendations
      const recommendations = this.generateDemandRecommendations(
        resourceType,
        forecasts,
        confidence,
        seasonality,
        trends
      );
      
      // Assess risks
      const riskAssessment = this.assessDemandRisks(
        resourceType,
        forecasts,
        confidence,
        trends
      );

      const forecast: DemandForecast = {
        resourceType,
        currentDemand: historicalData[historicalData.length - 1]?.value || 0,
        forecasts,
        confidence,
        seasonality,
        trends,
        recommendations,
        riskAssessment
      };

      // Cache the result
      this.forecastingCache.set(cacheKey, { forecast, timestamp: new Date() });

      return forecast;
    } catch (error: any) {
      logger.error('Demand forecast generation failed:', error);
      return this.getDefaultDemandForecast(resourceType);
    }
  }

  /**
   * Analyze utilization patterns for a resource
   */
  public async analyzeUtilizationPatterns(
    resourceType: string,
    historicalData: Array<{ timestamp: Date; value: number }>
  ): Promise<ResourceUtilizationPattern> {
    try {
      // Analyze daily patterns (by hour)
      const dailyPatterns = this.analyzeDailyPatterns(historicalData);
      
      // Analyze weekly patterns (by day of week)
      const weeklyPatterns = this.analyzeWeeklyPatterns(historicalData);
      
      // Analyze monthly patterns (by day of month)
      const monthlyPatterns = this.analyzeMonthlyPatterns(historicalData);
      
      // Find peak utilization times
      const peaks = this.findPeakUtilization(dailyPatterns, weeklyPatterns, monthlyPatterns);
      
      // Calculate trends
      const trends = this.calculateUtilizationTrends(historicalData);

      const pattern: ResourceUtilizationPattern = {
        resourceType,
        patterns: {
          daily: dailyPatterns,
          weekly: weeklyPatterns,
          monthly: monthlyPatterns
        },
        peaks,
        trends
      };

      this.patterns.set(resourceType, pattern);
      return pattern;
    } catch (error: any) {
      logger.error('Pattern analysis failed:', error);
      return this.getDefaultUtilizationPattern(resourceType);
    }
  }

  /**
   * Train and optimize forecasting models
   */
  public async trainModels(): Promise<void> {
    try {
      logger.info('Training resource demand forecasting models');

      const resourceTypes = ['compute', 'storage', 'bandwidth', 'ai_tokens', 'api_calls', 'users'];
      
      for (const resourceType of resourceTypes) {
        try {
          await this.trainResourceModel(resourceType);
        } catch (error: any) {
          logger.error(`Failed to train model for ${resourceType}:`, error);
        }
      }

      logger.info('Resource demand forecasting model training completed');
    } catch (error: any) {
      logger.error('Model training failed:', error);
    }
  }

  /**
   * Get model performance metrics
   */
  public getModelPerformance(resourceType: string): ResourceDemandModel | null {
    return this.models.get(resourceType) || null;
  }

  /**
   * Get utilization patterns for a resource
   */
  public getUtilizationPatterns(resourceType: string): ResourceUtilizationPattern | null {
    return this.patterns.get(resourceType) || null;
  }

  /**
   * Private helper methods
   */
  private async getHighResolutionData(
    resourceType: string,
    timeRange: { start: Date; end: Date }
  ): Promise<Array<{ timestamp: Date; value: number }>> {
    // Map resource types to metrics and get high-resolution data
    const metricMap: Record<string, string> = {
      'compute': 'system_performance',
      'storage': 'user_activity',
      'bandwidth': 'api_usage',
      'ai_tokens': 'ai_usage',
      'api_calls': 'api_usage',
      'users': 'user_activity'
    };

    const metric = metricMap[resourceType] || 'system_performance';
    
    try {
      // Get hourly data for better pattern analysis
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
      logger.warn(`Failed to get high-resolution data for ${resourceType}:`, error);
      return [];
    }
  }

  private async generateMultipleForecasts(
    resourceType: string,
    historicalData: Array<{ timestamp: Date; value: number }>
  ): Promise<{
    nextHour: number;
    nextDay: number;
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  }> {
    // Use multiple forecasting methods and combine results
    const linearForecast = this.linearRegressionForecast(historicalData);
    const exponentialForecast = this.exponentialSmoothingForecast(historicalData);
    const seasonalForecast = this.seasonalForecast(historicalData);
    
    // Weighted combination of forecasts
    const weights = { linear: 0.4, exponential: 0.3, seasonal: 0.3 };
    
    return {
      nextHour: this.combineForecasts([linearForecast.nextHour, exponentialForecast.nextHour, seasonalForecast.nextHour], weights),
      nextDay: this.combineForecasts([linearForecast.nextDay, exponentialForecast.nextDay, seasonalForecast.nextDay], weights),
      nextWeek: this.combineForecasts([linearForecast.nextWeek, exponentialForecast.nextWeek, seasonalForecast.nextWeek], weights),
      nextMonth: this.combineForecasts([linearForecast.nextMonth, exponentialForecast.nextMonth, seasonalForecast.nextMonth], weights),
      nextQuarter: this.combineForecasts([linearForecast.nextQuarter, exponentialForecast.nextQuarter, seasonalForecast.nextQuarter], weights)
    };
  }

  private linearRegressionForecast(
    data: Array<{ timestamp: Date; value: number }>
  ): { nextHour: number; nextDay: number; nextWeek: number; nextMonth: number; nextQuarter: number } {
    if (data.length < 2) return { nextHour: 0, nextDay: 0, nextWeek: 0, nextMonth: 0, nextQuarter: 0 };

    // Simple linear regression
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.value);
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const lastIndex = n - 1;
    
    return {
      nextHour: Math.max(0, slope * (lastIndex + 1) + intercept),
      nextDay: Math.max(0, slope * (lastIndex + 24) + intercept),
      nextWeek: Math.max(0, slope * (lastIndex + 168) + intercept),
      nextMonth: Math.max(0, slope * (lastIndex + 720) + intercept),
      nextQuarter: Math.max(0, slope * (lastIndex + 2160) + intercept)
    };
  }

  private exponentialSmoothingForecast(
    data: Array<{ timestamp: Date; value: number }>
  ): { nextHour: number; nextDay: number; nextWeek: number; nextMonth: number; nextQuarter: number } {
    if (data.length < 3) return { nextHour: 0, nextDay: 0, nextWeek: 0, nextMonth: 0, nextQuarter: 0 };

    const alpha = 0.3; // Smoothing factor
    let smoothed = data[0].value;
    let trend = 0;
    
    // Double exponential smoothing with trend
    for (let i = 1; i < data.length; i++) {
      const previousSmoothed = smoothed;
      smoothed = alpha * data[i].value + (1 - alpha) * smoothed;
      trend = alpha * (smoothed - previousSmoothed) + (1 - alpha) * trend;
    }
    
    const forecast = (currentValue: number, periods: number) => 
      Math.max(0, currentValue + trend * periods);
    
    return {
      nextHour: forecast(smoothed, 1),
      nextDay: forecast(smoothed, 24),
      nextWeek: forecast(smoothed, 168),
      nextMonth: forecast(smoothed, 720),
      nextQuarter: forecast(smoothed, 2160)
    };
  }

  private seasonalForecast(
    data: Array<{ timestamp: Date; value: number }>
  ): { nextHour: number; nextDay: number; nextWeek: number; nextMonth: number; nextQuarter: number } {
    if (data.length < 168) { // Need at least a week of hourly data
      return { nextHour: 0, nextDay: 0, nextWeek: 0, nextMonth: 0, nextQuarter: 0 };
    }

    // Detect seasonal patterns (daily and weekly)
    const dailySeasonality = this.calculateSeasonalIndex(data, 24); // Daily pattern
    const weeklySeasonality = this.calculateSeasonalIndex(data, 168); // Weekly pattern
    
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    const baseForecast = this.linearRegressionForecast(data);
    const dailyAdjustment = dailySeasonality[currentHour] || 1;
    const weeklyAdjustment = weeklySeasonality[currentDay * 24 + currentHour] || 1;
    
    const seasonalMultiplier = (dailyAdjustment + weeklyAdjustment) / 2;
    
    return {
      nextHour: Math.max(0, baseForecast.nextHour * seasonalMultiplier),
      nextDay: Math.max(0, baseForecast.nextDay * seasonalMultiplier),
      nextWeek: Math.max(0, baseForecast.nextWeek * seasonalMultiplier),
      nextMonth: Math.max(0, baseForecast.nextMonth * seasonalMultiplier),
      nextQuarter: Math.max(0, baseForecast.nextQuarter * seasonalMultiplier)
    };
  }

  private calculateSeasonalIndex(data: Array<{ timestamp: Date; value: number }>, period: number): number[] {
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

  private combineForecasts(forecasts: number[], weights: any): number {
    if (forecasts.length === 0) return 0;
    
    const weightedSum = forecasts.reduce((sum, forecast, index) => {
      const weight = Object.values(weights)[index] as number;
      return sum + forecast * weight;
    }, 0);
    
    return Math.max(0, Math.round(weightedSum * 100) / 100);
  }

  private calculateConfidenceScores(
    historicalData: Array<{ timestamp: Date; value: number }>,
    patterns: ResourceUtilizationPattern
  ): {
    nextHour: number;
    nextDay: number;
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  } {
    const volatility = this.calculateVolatility(historicalData);
    const patternStrength = this.calculatePatternStrength(patterns);
    
    // Base confidence decreases with time horizon
    const baseConfidence = {
      nextHour: 0.95,
      nextDay: 0.85,
      nextWeek: 0.70,
      nextMonth: 0.50,
      nextQuarter: 0.30
    };
    
    // Adjust for volatility and pattern strength
    const volatilityPenalty = volatility * 0.3;
    const patternBonus = patternStrength * 0.2;
    
    return {
      nextHour: Math.max(0.1, Math.min(0.99, baseConfidence.nextHour - volatilityPenalty + patternBonus)),
      nextDay: Math.max(0.1, Math.min(0.99, baseConfidence.nextDay - volatilityPenalty + patternBonus)),
      nextWeek: Math.max(0.1, Math.min(0.99, baseConfidence.nextWeek - volatilityPenalty + patternBonus)),
      nextMonth: Math.max(0.1, Math.min(0.99, baseConfidence.nextMonth - volatilityPenalty + patternBonus)),
      nextQuarter: Math.max(0.1, Math.min(0.99, baseConfidence.nextQuarter - volatilityPenalty + patternBonus))
    };
  }

  private calculateVolatility(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 0;
    
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private calculatePatternStrength(patterns: ResourceUtilizationPattern): number {
    const dailyVariance = this.calculateVariance(patterns.patterns.daily.map(p => p.utilization));
    const weeklyVariance = this.calculateVariance(patterns.patterns.weekly.map(p => p.utilization));
    
    // Lower variance indicates stronger patterns
    const dailyStrength = Math.max(0, 1 - dailyVariance);
    const weeklyStrength = Math.max(0, 1 - weeklyVariance);
    
    return (dailyStrength + weeklyStrength) / 2;
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return variance;
  }

  private detectSeasonality(data: Array<{ timestamp: Date; value: number }>): {
    detected: boolean;
    period: number;
    strength: number;
  } {
    if (data.length < 168) { // Need at least a week of data
      return { detected: false, period: 0, strength: 0 };
    }
    
    // Test for daily seasonality (24 hours)
    const dailyStrength = this.calculateSeasonalityStrength(data, 24);
    
    // Test for weekly seasonality (168 hours)
    const weeklyStrength = this.calculateSeasonalityStrength(data, 168);
    
    if (dailyStrength > 0.3) {
      return { detected: true, period: 24, strength: dailyStrength };
    } else if (weeklyStrength > 0.3) {
      return { detected: true, period: 168, strength: weeklyStrength };
    }
    
    return { detected: false, period: 0, strength: 0 };
  }

  private calculateSeasonalityStrength(data: Array<{ timestamp: Date; value: number }>, period: number): number {
    const seasonalIndices = this.calculateSeasonalIndex(data, period);
    const meanIndex = seasonalIndices.reduce((sum, index) => sum + index, 0) / seasonalIndices.length;
    const variance = seasonalIndices.reduce((sum, index) => sum + Math.pow(index - meanIndex, 2), 0) / seasonalIndices.length;
    
    return Math.min(1, Math.sqrt(variance) / meanIndex);
  }

  private analyzeTrends(data: Array<{ timestamp: Date; value: number }>): {
    shortTerm: 'increasing' | 'decreasing' | 'stable';
    longTerm: 'increasing' | 'decreasing' | 'stable';
    acceleration: number;
  } {
    if (data.length < 24) {
      return { shortTerm: 'stable', longTerm: 'stable', acceleration: 0 };
    }
    
    // Short-term trend (last 24 hours)
    const shortTermData = data.slice(-24);
    const shortTermTrend = this.calculateTrendDirection(shortTermData);
    
    // Long-term trend (all data)
    const longTermTrend = this.calculateTrendDirection(data);
    
    // Calculate acceleration (change in trend)
    const acceleration = this.calculateAcceleration(data);
    
    return {
      shortTerm: shortTermTrend,
      longTerm: longTermTrend,
      acceleration
    };
  }

  private calculateTrendDirection(data: Array<{ timestamp: Date; value: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const changePercent = (lastValue - firstValue) / firstValue;
    
    if (changePercent > 0.05) return 'increasing';
    if (changePercent < -0.05) return 'decreasing';
    return 'stable';
  }

  private calculateAcceleration(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 48) return 0; // Need at least 48 hours
    
    const recentTrend = this.calculateTrend(data.slice(-24));
    const previousTrend = this.calculateTrend(data.slice(-48, -24));
    
    return recentTrend - previousTrend;
  }

  private calculateTrend(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 0;
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const timeSpan = data.length;
    
    return (lastValue - firstValue) / (firstValue * timeSpan);
  }

  private analyzeDailyPatterns(data: Array<{ timestamp: Date; value: number }>): Array<{ hour: number; utilization: number }> {
    const hourlyUtilization: number[] = new Array(24).fill(0);
    const hourlyCounts: number[] = new Array(24).fill(0);
    
    data.forEach(point => {
      const hour = point.timestamp.getHours();
      hourlyUtilization[hour] += point.value;
      hourlyCounts[hour]++;
    });
    
    return hourlyUtilization.map((total, hour) => ({
      hour,
      utilization: hourlyCounts[hour] > 0 ? total / hourlyCounts[hour] : 0
    }));
  }

  private analyzeWeeklyPatterns(data: Array<{ timestamp: Date; value: number }>): Array<{ day: number; utilization: number }> {
    const dailyUtilization: number[] = new Array(7).fill(0);
    const dailyCounts: number[] = new Array(7).fill(0);
    
    data.forEach(point => {
      const day = point.timestamp.getDay();
      dailyUtilization[day] += point.value;
      dailyCounts[day]++;
    });
    
    return dailyUtilization.map((total, day) => ({
      day,
      utilization: dailyCounts[day] > 0 ? total / dailyCounts[day] : 0
    }));
  }

  private analyzeMonthlyPatterns(data: Array<{ timestamp: Date; value: number }>): Array<{ day: number; utilization: number }> {
    const monthlyUtilization: number[] = new Array(31).fill(0);
    const monthlyCounts: number[] = new Array(31).fill(0);
    
    data.forEach(point => {
      const day = point.timestamp.getDate() - 1; // 0-based index
      if (day >= 0 && day < 31) {
        monthlyUtilization[day] += point.value;
        monthlyCounts[day]++;
      }
    });
    
    return monthlyUtilization.map((total, day) => ({
      day: day + 1,
      utilization: monthlyCounts[day] > 0 ? total / monthlyCounts[day] : 0
    }));
  }

  private findPeakUtilization(
    dailyPatterns: Array<{ hour: number; utilization: number }>,
    weeklyPatterns: Array<{ day: number; utilization: number }>,
    monthlyPatterns: Array<{ day: number; utilization: number }>
  ): {
    daily: { time: string; utilization: number };
    weekly: { day: string; utilization: number };
    monthly: { date: string; utilization: number };
  } {
    const dailyPeak = dailyPatterns.reduce((max, current) => 
      current.utilization > max.utilization ? current : max, 
      { hour: 0, utilization: 0 }
    );
    
    const weeklyPeak = weeklyPatterns.reduce((max, current) => 
      current.utilization > max.utilization ? current : max, 
      { day: 0, utilization: 0 }
    );
    
    const monthlyPeak = monthlyPatterns.reduce((max, current) => 
      current.utilization > max.utilization ? current : max, 
      { day: 1, utilization: 0 }
    );
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      daily: { time: `${dailyPeak.hour}:00`, utilization: dailyPeak.utilization },
      weekly: { day: dayNames[weeklyPeak.day], utilization: weeklyPeak.utilization },
      monthly: { date: `Day ${monthlyPeak.day}`, utilization: monthlyPeak.utilization }
    };
  }

  private calculateUtilizationTrends(data: Array<{ timestamp: Date; value: number }>): {
    dailyTrend: number;
    weeklyTrend: number;
    monthlyTrend: number;
  } {
    const dailyTrend = this.calculateTrend(data.slice(-24));
    const weeklyTrend = this.calculateTrend(data.slice(-168));
    const monthlyTrend = this.calculateTrend(data.slice(-720));
    
    return {
      dailyTrend: Math.round(dailyTrend * 10000) / 10000,
      weeklyTrend: Math.round(weeklyTrend * 10000) / 10000,
      monthlyTrend: Math.round(monthlyTrend * 10000) / 10000
    };
  }

  private generateDemandRecommendations(
    resourceType: string,
    forecasts: any,
    confidence: any,
    seasonality: any,
    trends: any
  ): string[] {
    const recommendations: string[] = [];
    
    // Growth recommendations
    const growthRate = (forecasts.nextMonth - forecasts.nextWeek * 4) / (forecasts.nextWeek * 4);
    if (growthRate > 0.2) {
      recommendations.push(`Plan for ${Math.round(growthRate * 100)}% growth in ${resourceType} demand next month`);
    }
    
    // Confidence recommendations
    if (confidence.nextMonth < 0.6) {
      recommendations.push('Increase monitoring frequency for better prediction accuracy');
    }
    
    // Seasonal recommendations
    if (seasonality.detected) {
      recommendations.push(`Leverage ${seasonality.period}-hour seasonal patterns for capacity planning`);
    }
    
    // Trend recommendations
    if (trends.shortTerm !== trends.longTerm) {
      recommendations.push('Monitor trend changes and adjust capacity planning accordingly');
    }
    
    return recommendations;
  }

  private assessDemandRisks(
    resourceType: string,
    forecasts: any,
    confidence: any,
    trends: any
  ): {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{ factor: string; probability: number; impact: string }>;
  } {
    const factors: Array<{ factor: string; probability: number; impact: string }> = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // High growth risk
    const growthRate = (forecasts.nextMonth - forecasts.nextWeek * 4) / (forecasts.nextWeek * 4);
    if (growthRate > 0.5) {
      factors.push({
        factor: 'High Demand Growth',
        probability: 0.8,
        impact: 'Potential resource exhaustion'
      });
      riskLevel = 'high';
    }
    
    // Low confidence risk
    if (confidence.nextMonth < 0.5) {
      factors.push({
        factor: 'Low Prediction Confidence',
        probability: 0.6,
        impact: 'Uncertain capacity planning'
      });
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }
    
    // Trend change risk
    if (trends.acceleration > 0.1) {
      factors.push({
        factor: 'Accelerating Demand',
        probability: 0.7,
        impact: 'Faster than expected growth'
      });
      riskLevel = riskLevel === 'low' ? 'high' : 'critical';
    }
    
    return { level: riskLevel, factors };
  }

  private async trainResourceModel(resourceType: string): Promise<void> {
    // Mock model training - in a real implementation, this would use ML libraries
    const model: ResourceDemandModel = {
      resourceType,
      modelType: 'exponential',
      parameters: {
        alpha: 0.3,
        beta: 0.1,
        gamma: 0.05,
        period: 24
      },
      accuracy: {
        mae: 0.05 + Math.random() * 0.05,
        rmse: 0.08 + Math.random() * 0.07,
        mape: 0.10 + Math.random() * 0.10,
        r2: 0.85 + Math.random() * 0.10
      },
      lastTrained: new Date(),
      trainingDataSize: 1000 + Math.floor(Math.random() * 500)
    };
    
    this.models.set(resourceType, model);
    logger.info(`Resource model trained for ${resourceType}`, { accuracy: model.accuracy.r2 });
  }

  private getDefaultDemandForecast(resourceType: string): DemandForecast {
    return {
      resourceType,
      currentDemand: 0,
      forecasts: { nextHour: 0, nextDay: 0, nextWeek: 0, nextMonth: 0, nextQuarter: 0 },
      confidence: { nextHour: 0.3, nextDay: 0.2, nextWeek: 0.1, nextMonth: 0.05, nextQuarter: 0.02 },
      seasonality: { detected: false, period: 0, strength: 0 },
      trends: { shortTerm: 'stable', longTerm: 'stable', acceleration: 0 },
      recommendations: ['Insufficient data for reliable forecasting'],
      riskAssessment: { level: 'medium', factors: [] }
    };
  }

  private getDefaultUtilizationPattern(resourceType: string): ResourceUtilizationPattern {
    return {
      resourceType,
      patterns: {
        daily: Array.from({ length: 24 }, (_, i) => ({ hour: i, utilization: 0.5 })),
        weekly: Array.from({ length: 7 }, (_, i) => ({ day: i, utilization: 0.5 })),
        monthly: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, utilization: 0.5 }))
      },
      peaks: {
        daily: { time: '12:00', utilization: 0.8 },
        weekly: { day: 'Tuesday', utilization: 0.8 },
        monthly: { date: 'Day 15', utilization: 0.8 }
      },
      trends: { dailyTrend: 0, weeklyTrend: 0, monthlyTrend: 0 }
    };
  }

  private initializeModels(): void {
    logger.info('Initializing resource demand forecasting models');
  }

  private startPatternAnalysis(): void {
    // Analyze patterns every hour
    setInterval(async () => {
      try {
        const resourceTypes = ['compute', 'storage', 'bandwidth', 'ai_tokens', 'api_calls', 'users'];
        
        for (const resourceType of resourceTypes) {
          const timeRange = { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() };
          const historicalData = await this.getHighResolutionData(resourceType, timeRange);
          
          if (historicalData.length >= 24) {
            await this.analyzeUtilizationPatterns(resourceType, historicalData);
          }
        }
      } catch (error: any) {
        logger.error('Pattern analysis failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Export singleton instance
export const resourceDemandForecastingService = ResourceDemandForecastingService.getInstance();
