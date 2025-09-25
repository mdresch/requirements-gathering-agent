import { logger } from '../utils/logger.js';
import { resourceDemandForecastingService } from './ResourceDemandForecastingService.js';
import { costForecastingService } from './CostForecastingService.js';
import { predictiveAnalyticsService } from './PredictiveAnalyticsService.js';

/**
 * Capacity Planning Service
 * Provides intelligent capacity planning and scaling predictions
 */

export interface CapacityPlan {
  resourceType: string;
  currentCapacity: number;
  currentUtilization: number;
  utilizationThreshold: number;
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
  scalingRecommendations: Array<{
    timeframe: string;
    action: 'scale_up' | 'scale_down' | 'maintain' | 'optimize';
    priority: 'low' | 'medium' | 'high' | 'critical';
    currentCapacity: number;
    recommendedCapacity: number;
    scalingFactor: number;
    estimatedCost: number;
    implementationEffort: 'low' | 'medium' | 'high';
    impact: string;
    rationale: string;
  }>;
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      factor: string;
      probability: number;
      impact: string;
      timeframe: string;
      mitigation: string;
    }>;
  };
  optimizationOpportunities: Array<{
    opportunity: string;
    description: string;
    potentialSavings: number;
    implementationEffort: 'low' | 'medium' | 'high';
    timeframe: string;
    risk: 'low' | 'medium' | 'high';
  }>;
}

export interface ScalingStrategy {
  resourceType: string;
  strategy: 'horizontal' | 'vertical' | 'hybrid' | 'auto';
  triggers: Array<{
    metric: string;
    threshold: number;
    action: 'scale_up' | 'scale_down';
    cooldown: number; // minutes
  }>;
  limits: {
    minCapacity: number;
    maxCapacity: number;
    stepSize: number;
  };
  costs: {
    scaleUpCost: number;
    scaleDownCost: number;
    maintenanceCost: number;
  };
  performance: {
    scaleUpTime: number; // seconds
    scaleDownTime: number; // seconds
    availability: number; // percentage
  };
}

export interface ResourceAllocation {
  resourceType: string;
  totalCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
  utilizationByProject: Array<{
    projectId: string;
    projectName: string;
    allocatedCapacity: number;
    utilization: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  optimizationSuggestions: Array<{
    projectId: string;
    suggestion: string;
    potentialSavings: number;
    risk: 'low' | 'medium' | 'high';
  }>;
}

export interface CapacityMetrics {
  resourceType: string;
  metrics: {
    peakUtilization: number;
    averageUtilization: number;
    utilizationVariance: number;
    availability: number;
    performance: number;
    efficiency: number;
  };
  trends: {
    utilizationTrend: 'increasing' | 'decreasing' | 'stable';
    performanceTrend: 'improving' | 'degrading' | 'stable';
    efficiencyTrend: 'improving' | 'degrading' | 'stable';
  };
  benchmarks: {
    industryAverage: number;
    bestPractice: number;
    currentPerformance: number;
    performanceGap: number;
  };
}

export class CapacityPlanningService {
  private static instance: CapacityPlanningService;
  private capacityPlans: Map<string, CapacityPlan> = new Map();
  private scalingStrategies: Map<string, ScalingStrategy> = new Map();
  private resourceAllocations: Map<string, ResourceAllocation> = new Map();
  private capacityMetrics: Map<string, CapacityMetrics> = new Map();

  private constructor() {
    this.initializeScalingStrategies();
    this.startCapacityMonitoring();
  }

  public static getInstance(): CapacityPlanningService {
    if (!CapacityPlanningService.instance) {
      CapacityPlanningService.instance = new CapacityPlanningService();
    }
    return CapacityPlanningService.instance;
  }

  /**
   * Generate comprehensive capacity plan
   */
  public async generateCapacityPlan(
    resourceType: string,
    timeRange: { start: Date; end: Date } = { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), end: new Date() }
  ): Promise<CapacityPlan> {
    try {
      logger.info(`Generating capacity plan for ${resourceType}`, { timeRange });

      // Get current capacity and utilization
      const currentMetrics = await this.getCurrentCapacityMetrics(resourceType);
      
      // Get demand forecast
      const demandForecast = await resourceDemandForecastingService.generateDemandForecast(
        resourceType as any,
        timeRange
      );
      
      // Get cost forecast for capacity planning
      const costForecast = await costForecastingService.generateDetailedCostForecast(
        resourceType,
        timeRange
      );
      
      // Calculate utilization forecasts
      const utilizationForecasts = this.calculateUtilizationForecasts(
        currentMetrics.capacity,
        demandForecast.predictedUsage
      );
      
      // Generate scaling recommendations
      const scalingRecommendations = await this.generateScalingRecommendations(
        resourceType,
        currentMetrics,
        utilizationForecasts,
        costForecast
      );
      
      // Assess risks
      const riskAssessment = this.assessCapacityRisks(
        resourceType,
        currentMetrics,
        utilizationForecasts,
        scalingRecommendations
      );
      
      // Identify optimization opportunities
      const optimizationOpportunities = await this.identifyOptimizationOpportunities(
        resourceType,
        currentMetrics,
        costForecast
      );

      const capacityPlan: CapacityPlan = {
        resourceType,
        currentCapacity: currentMetrics.capacity,
        currentUtilization: currentMetrics.utilization,
        utilizationThreshold: this.getUtilizationThreshold(resourceType),
        forecasts: utilizationForecasts,
        confidence: demandForecast.confidence,
        scalingRecommendations,
        riskAssessment,
        optimizationOpportunities
      };

      this.capacityPlans.set(resourceType, capacityPlan);
      return capacityPlan;
    } catch (error: any) {
      logger.error('Capacity plan generation failed:', error);
      return this.getDefaultCapacityPlan(resourceType);
    }
  }

  /**
   * Create or update scaling strategy
   */
  public async createScalingStrategy(
    resourceType: string,
    strategy: 'horizontal' | 'vertical' | 'hybrid' | 'auto'
  ): Promise<ScalingStrategy> {
    try {
      logger.info(`Creating scaling strategy for ${resourceType}`, { strategy });

      const currentMetrics = await this.getCurrentCapacityMetrics(resourceType);
      
      // Generate appropriate triggers based on resource type and strategy
      const triggers = this.generateScalingTriggers(resourceType, strategy, currentMetrics);
      
      // Set appropriate limits
      const limits = this.calculateScalingLimits(resourceType, currentMetrics);
      
      // Calculate costs
      const costs = await this.calculateScalingCosts(resourceType, strategy);
      
      // Estimate performance characteristics
      const performance = this.estimateScalingPerformance(resourceType, strategy);

      const scalingStrategy: ScalingStrategy = {
        resourceType,
        strategy,
        triggers,
        limits,
        costs,
        performance
      };

      this.scalingStrategies.set(resourceType, scalingStrategy);
      return scalingStrategy;
    } catch (error: any) {
      logger.error('Scaling strategy creation failed:', error);
      throw error;
    }
  }

  /**
   * Analyze resource allocation across projects
   */
  public async analyzeResourceAllocation(
    resourceType: string
  ): Promise<ResourceAllocation> {
    try {
      logger.info(`Analyzing resource allocation for ${resourceType}`);

      // Get current resource allocation data
      const allocationData = await this.getResourceAllocationData(resourceType);
      
      // Calculate utilization by project
      const utilizationByProject = await this.calculateProjectUtilization(resourceType, allocationData);
      
      // Generate optimization suggestions
      const optimizationSuggestions = this.generateAllocationOptimizations(
        resourceType,
        allocationData,
        utilizationByProject
      );

      const resourceAllocation: ResourceAllocation = {
        resourceType,
        totalCapacity: allocationData.totalCapacity,
        allocatedCapacity: allocationData.allocatedCapacity,
        availableCapacity: allocationData.totalCapacity - allocationData.allocatedCapacity,
        utilizationByProject,
        optimizationSuggestions
      };

      this.resourceAllocations.set(resourceType, resourceAllocation);
      return resourceAllocation;
    } catch (error: any) {
      logger.error('Resource allocation analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get capacity performance metrics
   */
  public async getCapacityMetrics(
    resourceType: string,
    timeRange: { start: Date; end: Date } = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
  ): Promise<CapacityMetrics> {
    try {
      logger.info(`Getting capacity metrics for ${resourceType}`, { timeRange });

      // Get historical utilization data
      const utilizationData = await this.getHistoricalUtilizationData(resourceType, timeRange);
      
      // Calculate performance metrics
      const metrics = this.calculatePerformanceMetrics(utilizationData);
      
      // Analyze trends
      const trends = this.analyzePerformanceTrends(utilizationData);
      
      // Compare with benchmarks
      const benchmarks = this.getPerformanceBenchmarks(resourceType, metrics);

      const capacityMetrics: CapacityMetrics = {
        resourceType,
        metrics,
        trends,
        benchmarks
      };

      this.capacityMetrics.set(resourceType, capacityMetrics);
      return capacityMetrics;
    } catch (error: any) {
      logger.error('Capacity metrics retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Execute scaling action
   */
  public async executeScalingAction(
    resourceType: string,
    action: 'scale_up' | 'scale_down',
    targetCapacity: number,
    reason: string
  ): Promise<{
    success: boolean;
    newCapacity: number;
    estimatedCost: number;
    estimatedTime: number;
    message: string;
  }> {
    try {
      logger.info(`Executing scaling action for ${resourceType}`, { action, targetCapacity, reason });

      const scalingStrategy = this.scalingStrategies.get(resourceType);
      if (!scalingStrategy) {
        throw new Error(`No scaling strategy found for ${resourceType}`);
      }

      // Validate scaling request
      const validation = this.validateScalingRequest(resourceType, action, targetCapacity, scalingStrategy);
      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      // Estimate costs and time
      const costEstimate = this.estimateScalingCost(resourceType, action, targetCapacity);
      const timeEstimate = this.estimateScalingTime(resourceType, action, targetCapacity);

      // In a real implementation, this would trigger actual scaling
      // For now, we'll simulate the scaling action
      const success = await this.simulateScalingAction(resourceType, action, targetCapacity);

      if (success) {
        // Update capacity plan
        const capacityPlan = this.capacityPlans.get(resourceType);
        if (capacityPlan) {
          capacityPlan.currentCapacity = targetCapacity;
          capacityPlan.currentUtilization = this.calculateUtilization(targetCapacity, capacityPlan.forecasts.nextWeek);
          this.capacityPlans.set(resourceType, capacityPlan);
        }

        logger.info(`Scaling action completed for ${resourceType}`, { newCapacity: targetCapacity });
      }

      return {
        success,
        newCapacity: targetCapacity,
        estimatedCost: costEstimate,
        estimatedTime: timeEstimate,
        message: success ? 'Scaling action completed successfully' : 'Scaling action failed'
      };
    } catch (error: any) {
      logger.error('Scaling action execution failed:', error);
      return {
        success: false,
        newCapacity: 0,
        estimatedCost: 0,
        estimatedTime: 0,
        message: error.message
      };
    }
  }

  /**
   * Get all capacity plans
   */
  public getAllCapacityPlans(): CapacityPlan[] {
    return Array.from(this.capacityPlans.values());
  }

  /**
   * Get scaling strategies
   */
  public getScalingStrategies(): ScalingStrategy[] {
    return Array.from(this.scalingStrategies.values());
  }

  /**
   * Get resource allocations
   */
  public getResourceAllocations(): ResourceAllocation[] {
    return Array.from(this.resourceAllocations.values());
  }

  /**
   * Private helper methods
   */
  private async getCurrentCapacityMetrics(resourceType: string): Promise<{
    capacity: number;
    utilization: number;
    performance: number;
  }> {
    // Mock current capacity metrics - in a real implementation, this would query actual infrastructure
    const capacityMap: Record<string, { capacity: number; utilization: number; performance: number }> = {
      'compute': { capacity: 100, utilization: 0.75, performance: 0.85 },
      'storage': { capacity: 1000, utilization: 0.45, performance: 0.90 },
      'bandwidth': { capacity: 10000, utilization: 0.30, performance: 0.80 },
      'ai_tokens': { capacity: 1000000, utilization: 0.60, performance: 0.75 },
      'api_calls': { capacity: 100000, utilization: 0.80, performance: 0.88 },
      'users': { capacity: 500, utilization: 0.40, performance: 0.92 }
    };
    
    return capacityMap[resourceType] || { capacity: 100, utilization: 0.5, performance: 0.8 };
  }

  private calculateUtilizationForecasts(
    currentCapacity: number,
    demandForecasts: any
  ): {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  } {
    return {
      nextWeek: Math.min(1, demandForecasts.nextWeek / currentCapacity),
      nextMonth: Math.min(1, demandForecasts.nextMonth / currentCapacity),
      nextQuarter: Math.min(1, demandForecasts.nextQuarter / currentCapacity),
      nextYear: Math.min(1, demandForecasts.nextYear / currentCapacity)
    };
  }

  private async generateScalingRecommendations(
    resourceType: string,
    currentMetrics: any,
    utilizationForecasts: any,
    costForecast: any
  ): Promise<Array<{
    timeframe: string;
    action: 'scale_up' | 'scale_down' | 'maintain' | 'optimize';
    priority: 'low' | 'medium' | 'high' | 'critical';
    currentCapacity: number;
    recommendedCapacity: number;
    scalingFactor: number;
    estimatedCost: number;
    implementationEffort: 'low' | 'medium' | 'high';
    impact: string;
    rationale: string;
  }>> {
    const recommendations: any[] = [];
    const threshold = this.getUtilizationThreshold(resourceType);
    
    // Check next week utilization
    if (utilizationForecasts.nextWeek > threshold * 1.2) {
      const recommendedCapacity = Math.ceil(currentMetrics.capacity * 1.5);
      recommendations.push({
        timeframe: 'immediate',
        action: 'scale_up',
        priority: 'critical',
        currentCapacity: currentMetrics.capacity,
        recommendedCapacity,
        scalingFactor: 1.5,
        estimatedCost: this.calculateScalingCost(resourceType, recommendedCapacity),
        implementationEffort: 'medium',
        impact: 'Prevent service degradation',
        rationale: `Utilization projected to exceed ${Math.round(threshold * 120)}% next week`
      });
    } else if (utilizationForecasts.nextWeek > threshold) {
      const recommendedCapacity = Math.ceil(currentMetrics.capacity * 1.2);
      recommendations.push({
        timeframe: '1 week',
        action: 'scale_up',
        priority: 'high',
        currentCapacity: currentMetrics.capacity,
        recommendedCapacity,
        scalingFactor: 1.2,
        estimatedCost: this.calculateScalingCost(resourceType, recommendedCapacity),
        implementationEffort: 'low',
        impact: 'Maintain performance levels',
        rationale: `Utilization projected to exceed threshold of ${Math.round(threshold * 100)}%`
      });
    }
    
    // Check next month utilization
    if (utilizationForecasts.nextMonth > threshold * 1.5) {
      const recommendedCapacity = Math.ceil(currentMetrics.capacity * 2);
      recommendations.push({
        timeframe: '1 month',
        action: 'scale_up',
        priority: 'high',
        currentCapacity: currentMetrics.capacity,
        recommendedCapacity,
        scalingFactor: 2,
        estimatedCost: this.calculateScalingCost(resourceType, recommendedCapacity),
        implementationEffort: 'high',
        impact: 'Support projected growth',
        rationale: `Utilization projected to reach ${Math.round(utilizationForecasts.nextMonth * 100)}% next month`
      });
    }
    
    // Check for optimization opportunities
    if (utilizationForecasts.nextMonth < threshold * 0.5) {
      const recommendedCapacity = Math.ceil(currentMetrics.capacity * 0.8);
      recommendations.push({
        timeframe: '1 month',
        action: 'optimize',
        priority: 'medium',
        currentCapacity: currentMetrics.capacity,
        recommendedCapacity,
        scalingFactor: 0.8,
        estimatedCost: -this.calculateScalingCost(resourceType, currentMetrics.capacity - recommendedCapacity),
        implementationEffort: 'medium',
        impact: 'Reduce costs and improve efficiency',
        rationale: `Utilization projected to remain below ${Math.round(threshold * 50)}% next month`
      });
    }
    
    return recommendations;
  }

  private assessCapacityRisks(
    resourceType: string,
    currentMetrics: any,
    utilizationForecasts: any,
    scalingRecommendations: any[]
  ): {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      factor: string;
      probability: number;
      impact: string;
      timeframe: string;
      mitigation: string;
    }>;
  } {
    const factors: any[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // High utilization risk
    if (utilizationForecasts.nextWeek > 0.9) {
      factors.push({
        factor: 'Resource Exhaustion',
        probability: 0.8,
        impact: 'Service degradation or outages',
        timeframe: '1 week',
        mitigation: 'Implement immediate scaling'
      });
      riskLevel = 'critical';
    } else if (utilizationForecasts.nextMonth > 0.9) {
      factors.push({
        factor: 'Resource Exhaustion',
        probability: 0.7,
        impact: 'Service degradation or outages',
        timeframe: '1 month',
        mitigation: 'Plan capacity expansion'
      });
      riskLevel = 'high';
    }
    
    // Scaling delay risk
    const criticalRecommendations = scalingRecommendations.filter(r => r.priority === 'critical');
    if (criticalRecommendations.length > 0) {
      factors.push({
        factor: 'Scaling Delays',
        probability: 0.6,
        impact: 'Performance degradation during scaling',
        timeframe: 'immediate',
        mitigation: 'Implement automated scaling'
      });
      riskLevel = riskLevel === 'low' ? 'high' : 'critical';
    }
    
    // Performance degradation risk
    if (currentMetrics.performance < 0.8) {
      factors.push({
        factor: 'Performance Degradation',
        probability: 0.5,
        impact: 'Reduced service quality',
        timeframe: 'ongoing',
        mitigation: 'Optimize resource allocation'
      });
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }
    
    return { level: riskLevel, factors };
  }

  private async identifyOptimizationOpportunities(
    resourceType: string,
    currentMetrics: any,
    costForecast: any
  ): Promise<Array<{
    opportunity: string;
    description: string;
    potentialSavings: number;
    implementationEffort: 'low' | 'medium' | 'high';
    timeframe: string;
    risk: 'low' | 'medium' | 'high';
  }>> {
    const opportunities: any[] = [];
    
    // Right-sizing opportunity
    if (currentMetrics.utilization < 0.3) {
      opportunities.push({
        opportunity: 'Resource Right-sizing',
        description: 'Reduce capacity to match actual usage',
        potentialSavings: costForecast.forecasts.nextMonth * 0.2,
        implementationEffort: 'low',
        timeframe: '2 weeks',
        risk: 'low'
      });
    }
    
    // Auto-scaling opportunity
    if (currentMetrics.utilization > 0.7) {
      opportunities.push({
        opportunity: 'Auto-scaling Implementation',
        description: 'Implement automatic scaling based on demand',
        potentialSavings: costForecast.forecasts.nextMonth * 0.15,
        implementationEffort: 'high',
        timeframe: '4-6 weeks',
        risk: 'medium'
      });
    }
    
    // Load balancing opportunity
    opportunities.push({
      opportunity: 'Load Balancing Optimization',
      description: 'Optimize load distribution across resources',
      potentialSavings: costForecast.forecasts.nextMonth * 0.1,
      implementationEffort: 'medium',
      timeframe: '3 weeks',
      risk: 'low'
    });
    
    return opportunities;
  }

  private generateScalingTriggers(
    resourceType: string,
    strategy: string,
    currentMetrics: any
  ): Array<{
    metric: string;
    threshold: number;
    action: 'scale_up' | 'scale_down';
    cooldown: number;
  }> {
    const triggers: any[] = [];
    
    // Utilization-based triggers
    triggers.push({
      metric: 'utilization',
      threshold: 0.8,
      action: 'scale_up',
      cooldown: 5 // 5 minutes
    });
    
    triggers.push({
      metric: 'utilization',
      threshold: 0.3,
      action: 'scale_down',
      cooldown: 15 // 15 minutes
    });
    
    // Performance-based triggers
    if (strategy === 'auto' || strategy === 'hybrid') {
      triggers.push({
        metric: 'response_time',
        threshold: 1000, // 1 second
        action: 'scale_up',
        cooldown: 10
      });
    }
    
    // Resource-specific triggers
    if (resourceType === 'ai_tokens') {
      triggers.push({
        metric: 'token_usage_rate',
        threshold: currentMetrics.capacity * 0.9,
        action: 'scale_up',
        cooldown: 5
      });
    }
    
    return triggers;
  }

  private calculateScalingLimits(
    resourceType: string,
    currentMetrics: any
  ): {
    minCapacity: number;
    maxCapacity: number;
    stepSize: number;
  } {
    const baseCapacity = currentMetrics.capacity;
    
    return {
      minCapacity: Math.max(1, Math.floor(baseCapacity * 0.2)),
      maxCapacity: Math.floor(baseCapacity * 5),
      stepSize: Math.max(1, Math.floor(baseCapacity * 0.1))
    };
  }

  private async calculateScalingCosts(
    resourceType: string,
    strategy: string
  ): Promise<{
    scaleUpCost: number;
    scaleDownCost: number;
    maintenanceCost: number;
  }> {
    // Mock scaling costs - in a real implementation, this would query pricing APIs
    const baseCost = this.getResourceBaseCost(resourceType);
    
    return {
      scaleUpCost: baseCost * 0.1, // 10% of base cost for scaling up
      scaleDownCost: baseCost * 0.05, // 5% of base cost for scaling down
      maintenanceCost: baseCost * 0.02 // 2% of base cost for maintenance
    };
  }

  private estimateScalingPerformance(
    resourceType: string,
    strategy: string
  ): {
    scaleUpTime: number;
    scaleDownTime: number;
    availability: number;
  } {
    // Mock performance estimates
    const baseTime = this.getResourceBaseScalingTime(resourceType);
    
    return {
      scaleUpTime: baseTime * (strategy === 'horizontal' ? 1 : 2),
      scaleDownTime: baseTime * 0.5,
      availability: strategy === 'auto' ? 0.999 : 0.995
    };
  }

  private getResourceBaseCost(resourceType: string): number {
    const costMap: Record<string, number> = {
      'compute': 100,
      'storage': 50,
      'bandwidth': 25,
      'ai_tokens': 200,
      'api_calls': 75,
      'users': 150
    };
    return costMap[resourceType] || 100;
  }

  private getResourceBaseScalingTime(resourceType: string): number {
    const timeMap: Record<string, number> = {
      'compute': 300, // 5 minutes
      'storage': 600, // 10 minutes
      'bandwidth': 120, // 2 minutes
      'ai_tokens': 60, // 1 minute
      'api_calls': 180, // 3 minutes
      'users': 900 // 15 minutes
    };
    return timeMap[resourceType] || 300;
  }

  private getUtilizationThreshold(resourceType: string): number {
    const thresholdMap: Record<string, number> = {
      'compute': 0.8,
      'storage': 0.9,
      'bandwidth': 0.7,
      'ai_tokens': 0.85,
      'api_calls': 0.75,
      'users': 0.6
    };
    return thresholdMap[resourceType] || 0.8;
  }

  private calculateScalingCost(resourceType: string, newCapacity: number): number {
    const baseCost = this.getResourceBaseCost(resourceType);
    return baseCost * (newCapacity / 100); // Proportional cost
  }

  private async getResourceAllocationData(resourceType: string): Promise<{
    totalCapacity: number;
    allocatedCapacity: number;
    projects: Array<{ projectId: string; allocatedCapacity: number }>;
  }> {
    // Mock allocation data - in a real implementation, this would query actual allocation data
    return {
      totalCapacity: 1000,
      allocatedCapacity: 750,
      projects: [
        { projectId: 'project_1', allocatedCapacity: 300 },
        { projectId: 'project_2', allocatedCapacity: 250 },
        { projectId: 'project_3', allocatedCapacity: 200 }
      ]
    };
  }

  private async calculateProjectUtilization(
    resourceType: string,
    allocationData: any
  ): Promise<Array<{
    projectId: string;
    projectName: string;
    allocatedCapacity: number;
    utilization: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>> {
    // Mock project utilization - in a real implementation, this would query actual usage data
    return allocationData.projects.map((project: any) => ({
      projectId: project.projectId,
      projectName: `Project ${project.projectId.split('_')[1]}`,
      allocatedCapacity: project.allocatedCapacity,
      utilization: 0.6 + Math.random() * 0.4, // 60-100% utilization
      priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }));
  }

  private generateAllocationOptimizations(
    resourceType: string,
    allocationData: any,
    utilizationByProject: any[]
  ): Array<{
    projectId: string;
    suggestion: string;
    potentialSavings: number;
    risk: 'low' | 'medium' | 'high';
  }> {
    const optimizations: any[] = [];
    
    // Find underutilized projects
    const underutilizedProjects = utilizationByProject.filter(p => p.utilization < 0.3);
    
    underutilizedProjects.forEach(project => {
      optimizations.push({
        projectId: project.projectId,
        suggestion: 'Reduce allocated capacity due to low utilization',
        potentialSavings: project.allocatedCapacity * 0.5 * this.getResourceBaseCost(resourceType),
        risk: 'low'
      });
    });
    
    // Find overutilized projects
    const overutilizedProjects = utilizationByProject.filter(p => p.utilization > 0.9);
    
    overutilizedProjects.forEach(project => {
      optimizations.push({
        projectId: project.projectId,
        suggestion: 'Increase allocated capacity to prevent performance issues',
        potentialSavings: -project.allocatedCapacity * 0.2 * this.getResourceBaseCost(resourceType), // Negative savings (cost increase)
        risk: 'medium'
      });
    });
    
    return optimizations;
  }

  private async getHistoricalUtilizationData(
    resourceType: string,
    timeRange: { start: Date; end: Date }
  ): Promise<Array<{ timestamp: Date; utilization: number; performance: number }>> {
    // Mock historical data - in a real implementation, this would query actual metrics
    const data: Array<{ timestamp: Date; utilization: number; performance: number }> = [];
    const days = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const timestamp = new Date(timeRange.start.getTime() + i * 24 * 60 * 60 * 1000);
      data.push({
        timestamp,
        utilization: 0.5 + Math.random() * 0.4, // 50-90% utilization
        performance: 0.7 + Math.random() * 0.3 // 70-100% performance
      });
    }
    
    return data;
  }

  private calculatePerformanceMetrics(
    utilizationData: Array<{ timestamp: Date; utilization: number; performance: number }>
  ): {
    peakUtilization: number;
    averageUtilization: number;
    utilizationVariance: number;
    availability: number;
    performance: number;
    efficiency: number;
  } {
    if (utilizationData.length === 0) {
      return {
        peakUtilization: 0,
        averageUtilization: 0,
        utilizationVariance: 0,
        availability: 0,
        performance: 0,
        efficiency: 0
      };
    }
    
    const utilizations = utilizationData.map(d => d.utilization);
    const performances = utilizationData.map(d => d.performance);
    
    const peakUtilization = Math.max(...utilizations);
    const averageUtilization = utilizations.reduce((sum, val) => sum + val, 0) / utilizations.length;
    const utilizationVariance = this.calculateVariance(utilizations);
    const availability = performances.reduce((sum, val) => sum + val, 0) / performances.length;
    const performance = availability;
    const efficiency = averageUtilization * performance;
    
    return {
      peakUtilization,
      averageUtilization,
      utilizationVariance,
      availability,
      performance,
      efficiency
    };
  }

  private analyzePerformanceTrends(
    utilizationData: Array<{ timestamp: Date; utilization: number; performance: number }>
  ): {
    utilizationTrend: 'increasing' | 'decreasing' | 'stable';
    performanceTrend: 'improving' | 'degrading' | 'stable';
    efficiencyTrend: 'improving' | 'degrading' | 'stable';
  } {
    if (utilizationData.length < 2) {
      return {
        utilizationTrend: 'stable',
        performanceTrend: 'stable',
        efficiencyTrend: 'stable'
      };
    }
    
    const firstHalf = utilizationData.slice(0, Math.floor(utilizationData.length / 2));
    const secondHalf = utilizationData.slice(Math.floor(utilizationData.length / 2));
    
    const firstUtilization = firstHalf.reduce((sum, d) => sum + d.utilization, 0) / firstHalf.length;
    const secondUtilization = secondHalf.reduce((sum, d) => sum + d.utilization, 0) / secondHalf.length;
    
    const firstPerformance = firstHalf.reduce((sum, d) => sum + d.performance, 0) / firstHalf.length;
    const secondPerformance = secondHalf.reduce((sum, d) => sum + d.performance, 0) / secondHalf.length;
    
    const firstEfficiency = firstUtilization * firstPerformance;
    const secondEfficiency = secondUtilization * secondPerformance;
    
    return {
      utilizationTrend: secondUtilization > firstUtilization * 1.05 ? 'increasing' : 
                        secondUtilization < firstUtilization * 0.95 ? 'decreasing' : 'stable',
      performanceTrend: secondPerformance > firstPerformance * 1.05 ? 'improving' : 
                        secondPerformance < firstPerformance * 0.95 ? 'degrading' : 'stable',
      efficiencyTrend: secondEfficiency > firstEfficiency * 1.05 ? 'improving' : 
                       secondEfficiency < firstEfficiency * 0.95 ? 'degrading' : 'stable'
    };
  }

  private getPerformanceBenchmarks(
    resourceType: string,
    metrics: any
  ): {
    industryAverage: number;
    bestPractice: number;
    currentPerformance: number;
    performanceGap: number;
  } {
    // Mock benchmarks - in a real implementation, this would come from industry data
    const benchmarks: Record<string, { industryAverage: number; bestPractice: number }> = {
      'compute': { industryAverage: 0.75, bestPractice: 0.85 },
      'storage': { industryAverage: 0.80, bestPractice: 0.90 },
      'bandwidth': { industryAverage: 0.70, bestPractice: 0.80 },
      'ai_tokens': { industryAverage: 0.65, bestPractice: 0.75 },
      'api_calls': { industryAverage: 0.80, bestPractice: 0.90 },
      'users': { industryAverage: 0.70, bestPractice: 0.85 }
    };
    
    const benchmark = benchmarks[resourceType] || { industryAverage: 0.75, bestPractice: 0.85 };
    
    return {
      industryAverage: benchmark.industryAverage,
      bestPractice: benchmark.bestPractice,
      currentPerformance: metrics.efficiency,
      performanceGap: benchmark.bestPractice - metrics.efficiency
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return variance;
  }

  private calculateUtilization(capacity: number, demand: number): number {
    return Math.min(1, demand / capacity);
  }

  private validateScalingRequest(
    resourceType: string,
    action: string,
    targetCapacity: number,
    scalingStrategy: ScalingStrategy
  ): { valid: boolean; reason: string } {
    if (targetCapacity < scalingStrategy.limits.minCapacity) {
      return { valid: false, reason: `Target capacity below minimum limit of ${scalingStrategy.limits.minCapacity}` };
    }
    
    if (targetCapacity > scalingStrategy.limits.maxCapacity) {
      return { valid: false, reason: `Target capacity above maximum limit of ${scalingStrategy.limits.maxCapacity}` };
    }
    
    return { valid: true, reason: 'Valid scaling request' };
  }

  private estimateScalingCost(resourceType: string, action: string, targetCapacity: number): number {
    const baseCost = this.getResourceBaseCost(resourceType);
    return baseCost * (targetCapacity / 100);
  }

  private estimateScalingTime(resourceType: string, action: string, targetCapacity: number): number {
    const baseTime = this.getResourceBaseScalingTime(resourceType);
    return baseTime * (action === 'scale_up' ? 1 : 0.5);
  }

  private async simulateScalingAction(
    resourceType: string,
    action: string,
    targetCapacity: number
  ): Promise<boolean> {
    // Simulate scaling action - in a real implementation, this would call infrastructure APIs
    logger.info(`Simulating ${action} for ${resourceType} to capacity ${targetCapacity}`);
    
    // Simulate success 95% of the time
    return Math.random() > 0.05;
  }

  private getDefaultCapacityPlan(resourceType: string): CapacityPlan {
    return {
      resourceType,
      currentCapacity: 100,
      currentUtilization: 0.5,
      utilizationThreshold: 0.8,
      forecasts: { nextWeek: 0.5, nextMonth: 0.6, nextQuarter: 0.7, nextYear: 0.8 },
      confidence: { nextWeek: 0.3, nextMonth: 0.2, nextQuarter: 0.1, nextYear: 0.05 },
      scalingRecommendations: [],
      riskAssessment: { level: 'medium', factors: [] },
      optimizationOpportunities: []
    };
  }

  private initializeScalingStrategies(): void {
    logger.info('Initializing scaling strategies');
  }

  private startCapacityMonitoring(): void {
    // Monitor capacity every hour
    setInterval(async () => {
      try {
        const resourceTypes = ['compute', 'storage', 'bandwidth', 'ai_tokens', 'api_calls', 'users'];
        
        for (const resourceType of resourceTypes) {
          await this.generateCapacityPlan(resourceType);
        }
      } catch (error: any) {
        logger.error('Capacity monitoring failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Export singleton instance
export const capacityPlanningService = CapacityPlanningService.getInstance();
