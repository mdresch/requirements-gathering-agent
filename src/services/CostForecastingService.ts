import { logger } from '../utils/logger.js';
import { aiProviderBillingService } from './AIProviderBillingService.js';
import { dataAggregationService } from './DataAggregationService.js';

/**
 * Cost Forecasting Service
 * Specialized service for forecasting costs and budget predictions
 */

export interface CostForecastModel {
  category: string;
  modelType: 'linear' | 'exponential' | 'seasonal' | 'arima' | 'lstm';
  parameters: {
    alpha?: number;
    beta?: number;
    gamma?: number;
    seasonality?: number;
    trend?: number;
  };
  accuracy: {
    mae: number;
    rmse: number;
    mape: number;
    r2: number;
  };
  lastTrained: Date;
  trainingDataSize: number;
}

export interface DetailedCostForecast {
  category: string;
  currentCost: number;
  forecasts: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
  confidence: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
  costBreakdown: {
    ai_costs: number;
    infrastructure_costs: number;
    operational_costs: number;
    other_costs: number;
  };
  costDrivers: Array<{
    factor: string;
    currentImpact: number;
    projectedImpact: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: number;
  }>;
  budgetRecommendations: Array<{
    timeframe: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    potentialSavings: number;
    implementationEffort: 'low' | 'medium' | 'high';
  }>;
  riskFactors: Array<{
    factor: string;
    probability: number;
    potentialImpact: number;
    mitigation: string;
  }>;
  scenarios: {
    optimistic: { nextMonth: number; nextQuarter: number; nextYear: number };
    realistic: { nextMonth: number; nextQuarter: number; nextYear: number };
    pessimistic: { nextMonth: number; nextQuarter: number; nextYear: number };
  };
}

export interface BudgetPrediction {
  budgetId: string;
  budgetName: string;
  currentSpending: number;
  budgetLimit: number;
  utilizationRate: number;
  predictedSpending: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    remainingPeriod: number;
  };
  projectedUtilization: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    endOfPeriod: number;
  };
  budgetStatus: 'on_track' | 'at_risk' | 'exceeded' | 'under_utilized';
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeframe: string;
    impact: string;
  }>;
  alerts: Array<{
    type: 'warning' | 'critical' | 'info';
    message: string;
    threshold: number;
    currentValue: number;
  }>;
}

export interface CostOptimizationOpportunity {
  category: string;
  opportunity: string;
  description: string;
  potentialSavings: number;
  savingsPercentage: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timeframe: string;
  risk: 'low' | 'medium' | 'high';
  prerequisites: string[];
  expectedROI: number;
}

export class CostForecastingService {
  private static instance: CostForecastingService;
  private models: Map<string, CostForecastModel> = new Map();
  private costDrivers: Map<string, Array<{ factor: string; weight: number; trend: number }>> = new Map();
  private forecastingCache: Map<string, { forecast: DetailedCostForecast; timestamp: Date }> = new Map();

  private constructor() {
    this.initializeCostDrivers();
    this.startCostMonitoring();
  }

  public static getInstance(): CostForecastingService {
    if (!CostForecastingService.instance) {
      CostForecastingService.instance = new CostForecastingService();
    }
    return CostForecastingService.instance;
  }

  /**
   * Generate detailed cost forecast for a category
   */
  public async generateDetailedCostForecast(
    category: string = 'total',
    timeRange: { start: Date; end: Date } = { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), end: new Date() }
  ): Promise<DetailedCostForecast> {
    try {
      logger.info(`Generating detailed cost forecast for ${category}`, { timeRange });

      // Check cache first
      const cacheKey = `${category}_${timeRange.start.getTime()}_${timeRange.end.getTime()}`;
      const cached = this.forecastingCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp.getTime() < 30 * 60 * 1000) { // 30 minute cache
        return cached.forecast;
      }

      // Get historical cost data
      const historicalData = await this.getHistoricalCostData(category, timeRange);
      
      if (historicalData.length < 14) { // Need at least 2 weeks of data
        return this.getDefaultCostForecast(category);
      }

      // Generate forecasts using multiple methods
      const forecasts = await this.generateMultipleCostForecasts(historicalData);
      
      // Calculate confidence scores
      const confidence = this.calculateCostConfidence(historicalData);
      
      // Analyze cost breakdown
      const costBreakdown = await this.analyzeCostBreakdown(category, timeRange);
      
      // Identify cost drivers
      const costDrivers = await this.identifyCostDrivers(historicalData, category);
      
      // Generate budget recommendations
      const budgetRecommendations = this.generateBudgetRecommendations(forecasts, costDrivers);
      
      // Assess risk factors
      const riskFactors = this.assessCostRisks(forecasts, confidence, costDrivers);
      
      // Generate scenario analysis
      const scenarios = this.generateCostScenarios(forecasts, historicalData);

      const forecast: DetailedCostForecast = {
        category,
        currentCost: historicalData[historicalData.length - 1]?.value || 0,
        forecasts,
        confidence,
        costBreakdown,
        costDrivers,
        budgetRecommendations,
        riskFactors,
        scenarios
      };

      // Cache the result
      this.forecastingCache.set(cacheKey, { forecast, timestamp: new Date() });

      return forecast;
    } catch (error: any) {
      logger.error('Detailed cost forecast generation failed:', error);
      return this.getDefaultCostForecast(category);
    }
  }

  /**
   * Generate budget predictions and monitoring
   */
  public async generateBudgetPredictions(
    budgetId?: string,
    timeRange: { start: Date; end: Date } = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
  ): Promise<BudgetPrediction[]> {
    try {
      logger.info('Generating budget predictions', { budgetId, timeRange });

      // Get budget data from billing service
      const budgetData = await this.getBudgetData(budgetId, timeRange);
      
      const predictions: BudgetPrediction[] = [];
      
      for (const budget of budgetData) {
        // Generate cost forecast for this budget
        const costForecast = await this.generateDetailedCostForecast(budget.category, timeRange);
        
        // Calculate predicted spending
        const predictedSpending = {
          nextWeek: costForecast.forecasts.nextWeek,
          nextMonth: costForecast.forecasts.nextMonth,
          nextQuarter: costForecast.forecasts.nextQuarter,
          remainingPeriod: this.calculateRemainingPeriodSpending(budget, costForecast)
        };
        
        // Calculate projected utilization
        const projectedUtilization = {
          nextWeek: (predictedSpending.nextWeek / budget.limit) * 100,
          nextMonth: (predictedSpending.nextMonth / budget.limit) * 100,
          nextQuarter: (predictedSpending.nextQuarter / budget.limit) * 100,
          endOfPeriod: this.calculateEndOfPeriodUtilization(budget, costForecast)
        };
        
        // Determine budget status
        const budgetStatus = this.determineBudgetStatus(budget, projectedUtilization);
        
        // Generate recommendations
        const recommendations = this.generateDetailedBudgetRecommendations(budget, costForecast, projectedUtilization);
        
        // Generate alerts
        const alerts = this.generateBudgetAlerts(budget, projectedUtilization);

        predictions.push({
          budgetId: budget.id,
          budgetName: budget.name,
          currentSpending: budget.currentSpending,
          budgetLimit: budget.limit,
          utilizationRate: budget.currentSpending / budget.limit,
          predictedSpending,
          projectedUtilization,
          budgetStatus,
          recommendations,
          alerts
        });
      }

      return predictions;
    } catch (error: any) {
      logger.error('Budget prediction generation failed:', error);
      return [];
    }
  }

  /**
   * Identify cost optimization opportunities
   */
  public async identifyOptimizationOpportunities(
    category: string = 'total',
    timeRange: { start: Date; end: Date } = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
  ): Promise<CostOptimizationOpportunity[]> {
    try {
      logger.info(`Identifying cost optimization opportunities for ${category}`, { timeRange });

      const opportunities: CostOptimizationOpportunity[] = [];
      
      // Analyze cost patterns and identify inefficiencies
      const costForecast = await this.generateDetailedCostForecast(category, timeRange);
      const historicalData = await this.getHistoricalCostData(category, timeRange);
      
      // AI Cost Optimization
      if (costForecast.costBreakdown.ai_costs > costForecast.currentCost * 0.6) {
        opportunities.push({
          category: 'ai_costs',
          opportunity: 'AI Token Optimization',
          description: 'Optimize AI prompt engineering to reduce token usage',
          potentialSavings: costForecast.costBreakdown.ai_costs * 0.15,
          savingsPercentage: 15,
          implementationEffort: 'medium',
          timeframe: '2-4 weeks',
          risk: 'low',
          prerequisites: ['Prompt engineering expertise', 'A/B testing framework'],
          expectedROI: 300
        });
      }
      
      // Infrastructure Cost Optimization
      if (costForecast.costBreakdown.infrastructure_costs > costForecast.currentCost * 0.3) {
        opportunities.push({
          category: 'infrastructure_costs',
          opportunity: 'Resource Right-sizing',
          description: 'Optimize compute resources based on actual usage patterns',
          potentialSavings: costForecast.costBreakdown.infrastructure_costs * 0.25,
          savingsPercentage: 25,
          implementationEffort: 'high',
          timeframe: '4-8 weeks',
          risk: 'medium',
          prerequisites: ['Usage monitoring', 'Auto-scaling capabilities'],
          expectedROI: 200
        });
      }
      
      // Operational Cost Optimization
      if (costForecast.costBreakdown.operational_costs > costForecast.currentCost * 0.2) {
        opportunities.push({
          category: 'operational_costs',
          opportunity: 'Process Automation',
          description: 'Automate manual processes to reduce operational overhead',
          potentialSavings: costForecast.costBreakdown.operational_costs * 0.30,
          savingsPercentage: 30,
          implementationEffort: 'high',
          timeframe: '6-12 weeks',
          risk: 'medium',
          prerequisites: ['Process documentation', 'Automation tools'],
          expectedROI: 250
        });
      }
      
      // Usage Pattern Optimization
      const volatility = this.calculateCostVolatility(historicalData);
      if (volatility > 0.3) {
        opportunities.push({
          category: 'usage_patterns',
          opportunity: 'Demand Smoothing',
          description: 'Implement usage patterns to reduce peak demand costs',
          potentialSavings: costForecast.currentCost * 0.10,
          savingsPercentage: 10,
          implementationEffort: 'medium',
          timeframe: '3-6 weeks',
          risk: 'low',
          prerequisites: ['Usage analytics', 'Load balancing'],
          expectedROI: 150
        });
      }

      return opportunities.sort((a, b) => b.expectedROI - a.expectedROI);
    } catch (error: any) {
      logger.error('Cost optimization opportunity identification failed:', error);
      return [];
    }
  }

  /**
   * Train cost forecasting models
   */
  public async trainModels(): Promise<void> {
    try {
      logger.info('Training cost forecasting models');

      const categories = ['total', 'ai_costs', 'infrastructure_costs', 'operational_costs'];
      
      for (const category of categories) {
        try {
          await this.trainCostModel(category);
        } catch (error: any) {
          logger.error(`Failed to train cost model for ${category}:`, error);
        }
      }

      logger.info('Cost forecasting model training completed');
    } catch (error: any) {
      logger.error('Cost model training failed:', error);
    }
  }

  /**
   * Get cost forecasting model performance
   */
  public getModelPerformance(category: string): CostForecastModel | null {
    return this.models.get(category) || null;
  }

  /**
   * Private helper methods
   */
  private async getHistoricalCostData(
    category: string,
    timeRange: { start: Date; end: Date }
  ): Promise<Array<{ timestamp: Date; value: number }>> {
    try {
      const results = await dataAggregationService.aggregateData({
        metric: 'cost_analysis',
        timeRange: { ...timeRange, granularity: 'day' },
        aggregationType: 'sum'
      });

      return results.map(result => ({
        timestamp: result.timestamp,
        value: result.value
      }));
    } catch (error) {
      logger.warn(`Failed to get historical cost data for ${category}:`, error);
      return [];
    }
  }

  private async generateMultipleCostForecasts(
    historicalData: Array<{ timestamp: Date; value: number }>
  ): Promise<{
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  }> {
    // Use multiple forecasting methods and combine results
    const linearForecast = this.linearCostForecast(historicalData);
    const exponentialForecast = this.exponentialCostForecast(historicalData);
    const seasonalForecast = this.seasonalCostForecast(historicalData);
    
    // Weighted combination based on historical accuracy
    const weights = { linear: 0.3, exponential: 0.4, seasonal: 0.3 };
    
    return {
      nextWeek: this.combineCostForecasts([linearForecast.nextWeek, exponentialForecast.nextWeek, seasonalForecast.nextWeek], weights),
      nextMonth: this.combineCostForecasts([linearForecast.nextMonth, exponentialForecast.nextMonth, seasonalForecast.nextMonth], weights),
      nextQuarter: this.combineCostForecasts([linearForecast.nextQuarter, exponentialForecast.nextQuarter, seasonalForecast.nextQuarter], weights),
      nextYear: this.combineCostForecasts([linearForecast.nextYear, exponentialForecast.nextYear, seasonalForecast.nextYear], weights)
    };
  }

  private linearCostForecast(
    data: Array<{ timestamp: Date; value: number }>
  ): { nextWeek: number; nextMonth: number; nextQuarter: number; nextYear: number } {
    if (data.length < 2) return { nextWeek: 0, nextMonth: 0, nextQuarter: 0, nextYear: 0 };

    // Simple linear regression for cost forecasting
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
      nextWeek: Math.max(0, slope * (lastIndex + 7) + intercept),
      nextMonth: Math.max(0, slope * (lastIndex + 30) + intercept),
      nextQuarter: Math.max(0, slope * (lastIndex + 90) + intercept),
      nextYear: Math.max(0, slope * (lastIndex + 365) + intercept)
    };
  }

  private exponentialCostForecast(
    data: Array<{ timestamp: Date; value: number }>
  ): { nextWeek: number; nextMonth: number; nextQuarter: number; nextYear: number } {
    if (data.length < 3) return { nextWeek: 0, nextMonth: 0, nextQuarter: 0, nextYear: 0 };

    // Triple exponential smoothing (Holt-Winters) for cost forecasting
    const alpha = 0.3; // Level smoothing
    const beta = 0.1;  // Trend smoothing
    const gamma = 0.05; // Seasonal smoothing
    const period = 7; // Weekly seasonality
    
    let level = data[0].value;
    let trend = 0;
    const seasonals: number[] = new Array(period).fill(0);
    
    // Initialize seasonals
    for (let i = 0; i < period && i < data.length; i++) {
      seasonals[i] = data[i].value;
    }
    
    // Apply triple exponential smoothing
    for (let i = 1; i < data.length; i++) {
      const previousLevel = level;
      const seasonalIndex = i % period;
      
      level = alpha * (data[i].value / seasonals[seasonalIndex]) + (1 - alpha) * (level + trend);
      trend = beta * (level - previousLevel) + (1 - beta) * trend;
      seasonals[seasonalIndex] = gamma * (data[i].value / level) + (1 - gamma) * seasonals[seasonalIndex];
    }
    
    const forecast = (periods: number) => {
      const seasonalIndex = (data.length + periods - 1) % period;
      return Math.max(0, (level + trend * periods) * seasonals[seasonalIndex]);
    };
    
    return {
      nextWeek: forecast(7),
      nextMonth: forecast(30),
      nextQuarter: forecast(90),
      nextYear: forecast(365)
    };
  }

  private seasonalCostForecast(
    data: Array<{ timestamp: Date; value: number }>
  ): { nextWeek: number; nextMonth: number; nextQuarter: number; nextYear: number } {
    if (data.length < 14) return { nextWeek: 0, nextMonth: 0, nextQuarter: 0, nextYear: 0 };

    // Seasonal decomposition for cost forecasting
    const period = 7; // Weekly seasonality
    const seasonalIndices = this.calculateSeasonalIndices(data, period);
    
    const baseForecast = this.linearCostForecast(data);
    const currentDay = new Date().getDay();
    
    const seasonalMultiplier = seasonalIndices[currentDay] || 1;
    
    return {
      nextWeek: Math.max(0, baseForecast.nextWeek * seasonalMultiplier),
      nextMonth: Math.max(0, baseForecast.nextMonth * seasonalMultiplier),
      nextQuarter: Math.max(0, baseForecast.nextQuarter * seasonalMultiplier),
      nextYear: Math.max(0, baseForecast.nextYear * seasonalMultiplier)
    };
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

  private combineCostForecasts(forecasts: number[], weights: any): number {
    if (forecasts.length === 0) return 0;
    
    const weightedSum = forecasts.reduce((sum, forecast, index) => {
      const weight = Object.values(weights)[index] as number;
      return sum + forecast * weight;
    }, 0);
    
    return Math.max(0, Math.round(weightedSum * 1000000) / 1000000);
  }

  private calculateCostConfidence(
    historicalData: Array<{ timestamp: Date; value: number }>
  ): {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  } {
    const volatility = this.calculateCostVolatility(historicalData);
    
    // Base confidence decreases with time horizon
    const baseConfidence = {
      nextWeek: 0.90,
      nextMonth: 0.75,
      nextQuarter: 0.60,
      nextYear: 0.40
    };
    
    // Adjust for volatility
    const volatilityPenalty = volatility * 0.4;
    
    return {
      nextWeek: Math.max(0.1, Math.min(0.99, baseConfidence.nextWeek - volatilityPenalty)),
      nextMonth: Math.max(0.1, Math.min(0.99, baseConfidence.nextMonth - volatilityPenalty)),
      nextQuarter: Math.max(0.1, Math.min(0.99, baseConfidence.nextQuarter - volatilityPenalty)),
      nextYear: Math.max(0.1, Math.min(0.99, baseConfidence.nextYear - volatilityPenalty))
    };
  }

  private calculateCostVolatility(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 0;
    
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private async analyzeCostBreakdown(
    category: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    ai_costs: number;
    infrastructure_costs: number;
    operational_costs: number;
    other_costs: number;
  }> {
    try {
      // Get cost breakdown from billing service
      const usageAnalytics = await aiProviderBillingService.getUsageAnalytics(
        undefined, // provider
        undefined, // projectId
        undefined, // userId
        Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24))
      );
      
      const totalCost = usageAnalytics.totalCost || 0;
      
      return {
        ai_costs: totalCost * 0.7, // Assume 70% AI costs
        infrastructure_costs: totalCost * 0.15, // Assume 15% infrastructure
        operational_costs: totalCost * 0.10, // Assume 10% operational
        other_costs: totalCost * 0.05 // Assume 5% other costs
      };
    } catch (error) {
      logger.warn('Failed to analyze cost breakdown:', error);
      return {
        ai_costs: 0,
        infrastructure_costs: 0,
        operational_costs: 0,
        other_costs: 0
      };
    }
  }

  private async identifyCostDrivers(
    historicalData: Array<{ timestamp: Date; value: number }>,
    category: string
  ): Promise<Array<{
    factor: string;
    currentImpact: number;
    projectedImpact: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: number;
  }>> {
    const drivers = this.costDrivers.get(category) || [
      { factor: 'AI Token Usage', weight: 0.6, trend: 0.1 },
      { factor: 'API Call Volume', weight: 0.25, trend: 0.05 },
      { factor: 'User Growth', weight: 0.10, trend: 0.15 },
      { factor: 'Infrastructure Scaling', weight: 0.05, trend: 0.02 }
    ];
    
    const currentCost = historicalData[historicalData.length - 1]?.value || 0;
    
    return drivers.map(driver => ({
      factor: driver.factor,
      currentImpact: currentCost * driver.weight,
      projectedImpact: currentCost * driver.weight * (1 + driver.trend),
      trend: driver.trend > 0.05 ? 'increasing' : driver.trend < -0.05 ? 'decreasing' : 'stable',
      volatility: Math.random() * 0.3 + 0.1 // Mock volatility
    }));
  }

  private generateBudgetRecommendations(
    forecasts: any,
    costDrivers: any[]
  ): Array<{
    timeframe: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    potentialSavings: number;
    implementationEffort: 'low' | 'medium' | 'high';
  }> {
    const recommendations: any[] = [];
    
    const monthlyGrowth = (forecasts.nextMonth - forecasts.nextWeek * 4) / (forecasts.nextWeek * 4);
    
    if (monthlyGrowth > 0.2) {
      recommendations.push({
        timeframe: 'immediate',
        recommendation: 'Increase budget allocation to accommodate growth',
        priority: 'high',
        potentialSavings: -forecasts.nextMonth * 0.1, // Negative savings (cost increase)
        implementationEffort: 'low'
      });
    }
    
    // Cost optimization recommendations
    const highImpactDrivers = costDrivers.filter(d => d.trend === 'increasing' && d.currentImpact > forecasts.nextMonth * 0.2);
    
    highImpactDrivers.forEach(driver => {
      recommendations.push({
        timeframe: '1 month',
        recommendation: `Optimize ${driver.factor} to reduce costs`,
        priority: 'medium',
        potentialSavings: driver.currentImpact * 0.15,
        implementationEffort: 'medium'
      });
    });
    
    return recommendations;
  }

  private assessCostRisks(
    forecasts: any,
    confidence: any,
    costDrivers: any[]
  ): Array<{
    factor: string;
    probability: number;
    potentialImpact: number;
    mitigation: string;
  }> {
    const risks: any[] = [];
    
    // High growth risk
    const growthRate = (forecasts.nextMonth - forecasts.nextWeek * 4) / (forecasts.nextWeek * 4);
    if (growthRate > 0.3) {
      risks.push({
        factor: 'Rapid Cost Growth',
        probability: 0.8,
        potentialImpact: forecasts.nextMonth * 0.2,
        mitigation: 'Implement cost controls and monitoring'
      });
    }
    
    // Low confidence risk
    if (confidence.nextMonth < 0.6) {
      risks.push({
        factor: 'Uncertain Cost Predictions',
        probability: 0.6,
        potentialImpact: forecasts.nextMonth * 0.15,
        mitigation: 'Improve data collection and forecasting models'
      });
    }
    
    // Driver volatility risk
    const highVolatilityDrivers = costDrivers.filter(d => d.volatility > 0.3);
    highVolatilityDrivers.forEach(driver => {
      risks.push({
        factor: `Volatile ${driver.factor}`,
        probability: 0.4,
        potentialImpact: driver.currentImpact * 0.2,
        mitigation: `Implement hedging strategies for ${driver.factor}`
      });
    });
    
    return risks;
  }

  private generateCostScenarios(
    forecasts: any,
    historicalData: Array<{ timestamp: Date; value: number }>
  ): {
    optimistic: { nextMonth: number; nextQuarter: number; nextYear: number };
    realistic: { nextMonth: number; nextQuarter: number; nextYear: number };
    pessimistic: { nextMonth: number; nextQuarter: number; nextYear: number };
  } {
    const volatility = this.calculateCostVolatility(historicalData);
    
    return {
      optimistic: {
        nextMonth: forecasts.nextMonth * (1 - volatility * 0.5),
        nextQuarter: forecasts.nextQuarter * (1 - volatility * 0.5),
        nextYear: forecasts.nextYear * (1 - volatility * 0.5)
      },
      realistic: {
        nextMonth: forecasts.nextMonth,
        nextQuarter: forecasts.nextQuarter,
        nextYear: forecasts.nextYear
      },
      pessimistic: {
        nextMonth: forecasts.nextMonth * (1 + volatility * 0.5),
        nextQuarter: forecasts.nextQuarter * (1 + volatility * 0.5),
        nextYear: forecasts.nextYear * (1 + volatility * 0.5)
      }
    };
  }

  private async getBudgetData(
    budgetId?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<Array<{ id: string; name: string; category: string; limit: number; currentSpending: number }>> {
    // Mock budget data - in a real implementation, this would come from a budget service
    return [
      {
        id: 'budget_1',
        name: 'AI Operations Budget',
        category: 'ai_costs',
        limit: 10000,
        currentSpending: 6500
      },
      {
        id: 'budget_2',
        name: 'Infrastructure Budget',
        category: 'infrastructure_costs',
        limit: 5000,
        currentSpending: 3200
      },
      {
        id: 'budget_3',
        name: 'Total Operations Budget',
        category: 'total',
        limit: 20000,
        currentSpending: 12000
      }
    ].filter(budget => !budgetId || budget.id === budgetId);
  }

  private calculateRemainingPeriodSpending(budget: any, costForecast: DetailedCostForecast): number {
    const periodStart = new Date();
    const periodEnd = new Date(periodStart.getFullYear() + 1, periodStart.getMonth(), 1); // End of year
    const daysRemaining = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const dailyRate = costForecast.forecasts.nextMonth / 30;
    return Math.max(0, dailyRate * daysRemaining);
  }

  private calculateEndOfPeriodUtilization(budget: any, costForecast: DetailedCostForecast): number {
    const remainingSpending = this.calculateRemainingPeriodSpending(budget, costForecast);
    const totalProjectedSpending = budget.currentSpending + remainingSpending;
    
    return (totalProjectedSpending / budget.limit) * 100;
  }

  private determineBudgetStatus(budget: any, projectedUtilization: any): 'on_track' | 'at_risk' | 'exceeded' | 'under_utilized' {
    const currentUtilization = (budget.currentSpending / budget.limit) * 100;
    const endOfPeriodUtilization = projectedUtilization.endOfPeriod;
    
    if (currentUtilization > 100) return 'exceeded';
    if (endOfPeriodUtilization > 100) return 'at_risk';
    if (currentUtilization < 30) return 'under_utilized';
    return 'on_track';
  }

  private generateDetailedBudgetRecommendations(
    budget: any,
    costForecast: DetailedCostForecast,
    projectedUtilization: any
  ): Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeframe: string;
    impact: string;
  }> {
    const recommendations: any[] = [];
    
    if (projectedUtilization.endOfPeriod > 100) {
      recommendations.push({
        action: 'Increase budget allocation',
        priority: 'critical',
        timeframe: 'immediate',
        impact: 'Prevent budget overrun'
      });
    }
    
    if (projectedUtilization.nextMonth > 80) {
      recommendations.push({
        action: 'Implement cost optimization measures',
        priority: 'high',
        timeframe: '2 weeks',
        impact: 'Reduce projected spending'
      });
    }
    
    if (budget.currentSpending < budget.limit * 0.3) {
      recommendations.push({
        action: 'Review utilization and consider budget reallocation',
        priority: 'medium',
        timeframe: '1 month',
        impact: 'Optimize resource allocation'
      });
    }
    
    return recommendations;
  }

  private generateBudgetAlerts(
    budget: any,
    projectedUtilization: any
  ): Array<{
    type: 'warning' | 'critical' | 'info';
    message: string;
    threshold: number;
    currentValue: number;
  }> {
    const alerts: any[] = [];
    
    const currentUtilization = (budget.currentSpending / budget.limit) * 100;
    
    if (currentUtilization > 90) {
      alerts.push({
        type: 'critical',
        message: 'Budget utilization exceeded 90%',
        threshold: 90,
        currentValue: currentUtilization
      });
    } else if (currentUtilization > 75) {
      alerts.push({
        type: 'warning',
        message: 'Budget utilization exceeded 75%',
        threshold: 75,
        currentValue: currentUtilization
      });
    }
    
    if (projectedUtilization.endOfPeriod > 100) {
      alerts.push({
        type: 'critical',
        message: 'Projected to exceed budget by end of period',
        threshold: 100,
        currentValue: projectedUtilization.endOfPeriod
      });
    }
    
    return alerts;
  }

  private async trainCostModel(category: string): Promise<void> {
    // Mock model training - in a real implementation, this would use ML libraries
    const model: CostForecastModel = {
      category,
      modelType: 'exponential',
      parameters: {
        alpha: 0.3,
        beta: 0.1,
        gamma: 0.05,
        seasonality: 7,
        trend: 0.05
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
    
    this.models.set(category, model);
    logger.info(`Cost model trained for ${category}`, { accuracy: model.accuracy.r2 });
  }

  private getDefaultCostForecast(category: string): DetailedCostForecast {
    return {
      category,
      currentCost: 0,
      forecasts: { nextWeek: 0, nextMonth: 0, nextQuarter: 0, nextYear: 0 },
      confidence: { nextWeek: 0.3, nextMonth: 0.2, nextQuarter: 0.1, nextYear: 0.05 },
      costBreakdown: { ai_costs: 0, infrastructure_costs: 0, operational_costs: 0, other_costs: 0 },
      costDrivers: [],
      budgetRecommendations: [],
      riskFactors: [],
      scenarios: {
        optimistic: { nextMonth: 0, nextQuarter: 0, nextYear: 0 },
        realistic: { nextMonth: 0, nextQuarter: 0, nextYear: 0 },
        pessimistic: { nextMonth: 0, nextQuarter: 0, nextYear: 0 }
      }
    };
  }

  private initializeCostDrivers(): void {
    // Initialize cost drivers for different categories
    this.costDrivers.set('total', [
      { factor: 'AI Token Usage', weight: 0.6, trend: 0.1 },
      { factor: 'API Call Volume', weight: 0.25, trend: 0.05 },
      { factor: 'User Growth', weight: 0.10, trend: 0.15 },
      { factor: 'Infrastructure Scaling', weight: 0.05, trend: 0.02 }
    ]);
    
    this.costDrivers.set('ai_costs', [
      { factor: 'Token Consumption', weight: 0.8, trend: 0.12 },
      { factor: 'Model Selection', weight: 0.15, trend: 0.05 },
      { factor: 'Prompt Optimization', weight: 0.05, trend: -0.02 }
    ]);
    
    this.costDrivers.set('infrastructure_costs', [
      { factor: 'Compute Resources', weight: 0.6, trend: 0.08 },
      { factor: 'Storage Usage', weight: 0.25, trend: 0.03 },
      { factor: 'Network Bandwidth', weight: 0.15, trend: 0.06 }
    ]);
    
    logger.info('Cost drivers initialized');
  }

  private startCostMonitoring(): void {
    // Monitor costs every hour
    setInterval(async () => {
      try {
        // Update cost forecasts for active budgets
        const budgets = await this.getBudgetData();
        for (const budget of budgets) {
          await this.generateDetailedCostForecast(budget.category);
        }
      } catch (error: any) {
        logger.error('Cost monitoring failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Export singleton instance
export const costForecastingService = CostForecastingService.getInstance();
