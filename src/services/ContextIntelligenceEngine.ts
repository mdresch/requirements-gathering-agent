/**
 * Context Intelligence Engine
 * Optimizes context quality and relevance for AI document generation
 * Focuses on quality rather than compression (especially for Gemini with 1M tokens)
 */

import { ContextWindowManager, ProviderLimits } from './ContextWindowManager.js';

export interface ContextComponent {
  id: string;
  type: 'system-prompt' | 'template' | 'dependency' | 'project-context' | 'user-prompt';
  content: string;
  relevanceScore: number;
  qualityImpact: number;
  tokenCount: number;
  source: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ContextOptimizationResult {
  optimizedContext: ContextComponent[];
  totalTokens: number;
  qualityScore: number;
  relevanceScore: number;
  optimizationStrategy: string;
  recommendations: string[];
  traceability: ContextTraceability[];
}

export interface ContextTraceability {
  componentId: string;
  source: string;
  type: string;
  tokensUsed: number;
  qualityContribution: number;
  relevanceScore: number;
  included: boolean;
  reason: string;
}

export interface TemplateContext {
  templateId: string;
  templateName: string;
  content: string;
  dependencies: string[];
  framework: string;
  documentType: string;
  qualityScore: number;
  tokenCount: number;
}

export class ContextIntelligenceEngine {
  private contextHistory: Map<string, ContextOptimizationResult[]> = new Map();
  private qualityMetrics: Map<string, number> = new Map();

  /**
   * Optimize context for maximum quality and relevance
   */
  async optimizeContext(
    provider: string,
    model: string,
    availableContext: ContextComponent[],
    targetDocument: string,
    projectContext: any
  ): Promise<ContextOptimizationResult> {
    
    const providerLimits = ContextWindowManager.getProviderLimits(provider, model);
    if (!providerLimits) {
      throw new Error(`Provider ${provider} with model ${model} not supported`);
    }

    // For Gemini with 1M tokens, we can be very generous with context
    if (provider === 'google-gemini' && providerLimits.maxTokens >= 1000000) {
      return this.optimizeForQuality(availableContext, targetDocument, projectContext);
    }

    // For other providers, balance quality and efficiency
    return this.optimizeForEfficiency(availableContext, targetDocument, projectContext, providerLimits);
  }

  /**
   * Optimize for maximum quality (Gemini with 1M tokens, GPT-5, etc.)
   */
  private async optimizeForQuality(
    availableContext: ContextComponent[],
    targetDocument: string,
    projectContext: any
  ): Promise<ContextOptimizationResult> {
    
    // Score all context components for relevance and quality
    const scoredContext = await this.scoreContextComponents(availableContext, targetDocument, projectContext);
    
    // Quality-first sorting: prioritize components that maximize document quality
    const optimizedContext = scoredContext
      .sort((a, b) => {
        // Quality score is primary (80%), relevance is secondary (20%)
        const qualityScoreA = (a.qualityImpact * 0.8) + (a.relevanceScore * 0.2);
        const qualityScoreB = (b.qualityImpact * 0.8) + (b.relevanceScore * 0.2);
        return qualityScoreB - qualityScoreA;
      })
      .filter(component => {
        // Include components that contribute to quality above all else
        return component.qualityImpact > 0.3 || component.relevanceScore > 0.6;
      });

    const totalTokens = optimizedContext.reduce((sum, component) => sum + component.tokenCount, 0);
    const qualityScore = this.calculateOverallQuality(optimizedContext);
    const relevanceScore = this.calculateOverallRelevance(optimizedContext);

    const traceability = availableContext.map(component => {
      const included = optimizedContext.some(opt => opt.id === component.id);
      return {
        componentId: component.id,
        source: component.source,
        type: component.type,
        tokensUsed: component.tokenCount,
        qualityContribution: component.qualityImpact,
        relevanceScore: component.relevanceScore,
        included,
        reason: included 
          ? `Quality contribution: ${(component.qualityImpact * 100).toFixed(1)}%, Relevance: ${(component.relevanceScore * 100).toFixed(1)}%`
          : `Excluded: Low quality impact (${(component.qualityImpact * 100).toFixed(1)}%) and relevance (${(component.relevanceScore * 100).toFixed(1)}%)`
      };
    });

    return {
      optimizedContext,
      totalTokens,
      qualityScore,
      relevanceScore,
      optimizationStrategy: 'quality-first',
      recommendations: this.generateQualityRecommendations(optimizedContext, availableContext),
      traceability
    };
  }

  /**
   * Optimize for efficiency (other providers with limited tokens)
   */
  private async optimizeForEfficiency(
    availableContext: ContextComponent[],
    targetDocument: string,
    projectContext: any,
    providerLimits: ProviderLimits
  ): Promise<ContextOptimizationResult> {
    
    const scoredContext = await this.scoreContextComponents(availableContext, targetDocument, projectContext);
    
    // Sort by efficiency score (relevance/quality per token)
    const efficiencyScored = scoredContext.map(component => ({
      ...component,
      efficiencyScore: ((component.relevanceScore * 0.6) + (component.qualityImpact * 0.4)) / component.tokenCount
    }));

    const optimizedContext: ContextComponent[] = [];
    let currentTokens = 0;
    const maxTokens = providerLimits.inputTokens * 0.8; // Use 80% of available tokens

    // Add components in order of efficiency
    for (const component of efficiencyScored.sort((a, b) => b.efficiencyScore - a.efficiencyScore)) {
      if (currentTokens + component.tokenCount <= maxTokens) {
        optimizedContext.push(component);
        currentTokens += component.tokenCount;
      }
    }

    const qualityScore = this.calculateOverallQuality(optimizedContext);
    const relevanceScore = this.calculateOverallRelevance(optimizedContext);

    const traceability = availableContext.map(component => {
      const included = optimizedContext.some(opt => opt.id === component.id);
      return {
        componentId: component.id,
        source: component.source,
        type: component.type,
        tokensUsed: component.tokenCount,
        qualityContribution: component.qualityImpact,
        relevanceScore: component.relevanceScore,
        included,
        reason: included 
          ? `Included for efficiency (${(component.relevanceScore * 100).toFixed(1)}% relevance)`
          : `Excluded due to token limit (${(component.relevanceScore * 100).toFixed(1)}% relevance)`
      };
    });

    return {
      optimizedContext,
      totalTokens: currentTokens,
      qualityScore,
      relevanceScore,
      optimizationStrategy: 'efficiency-optimized',
      recommendations: this.generateEfficiencyRecommendations(optimizedContext, availableContext),
      traceability
    };
  }

  /**
   * Score context components for relevance and quality impact
   */
  private async scoreContextComponents(
    context: ContextComponent[],
    targetDocument: string,
    projectContext: any
  ): Promise<ContextComponent[]> {
    
    return context.map(component => {
      let relevanceScore = 0;
      let qualityImpact = 0;

      // Calculate quality impact first, then relevance
      switch (component.type) {
        case 'system-prompt':
          qualityImpact = 1.0; // Always critical for quality
          relevanceScore = 1.0;
          break;
        
        case 'template':
          qualityImpact = 0.9; // Templates are crucial for quality
          relevanceScore = this.calculateTemplateRelevance(component, targetDocument, projectContext);
          break;
        
        case 'dependency':
          qualityImpact = 0.8; // Dependencies significantly improve quality
          relevanceScore = this.calculateDependencyRelevance(component, targetDocument, projectContext);
          break;
        
        case 'project-context':
          qualityImpact = 0.7; // Project context enhances quality
          relevanceScore = this.calculateProjectContextRelevance(component, targetDocument, projectContext);
          break;
        
        case 'user-prompt':
          qualityImpact = 0.9; // User requirements are essential for quality
          relevanceScore = 0.9;
          break;
      }

      // Adjust based on priority
      const priorityMultiplier = {
        'critical': 1.0,
        'high': 0.9,
        'medium': 0.7,
        'low': 0.5
      };

      relevanceScore *= priorityMultiplier[component.priority];
      qualityImpact *= priorityMultiplier[component.priority];

      return {
        ...component,
        relevanceScore: Math.min(1.0, relevanceScore),
        qualityImpact: Math.min(1.0, qualityImpact)
      };
    });
  }

  /**
   * Calculate template relevance score
   */
  private calculateTemplateRelevance(
    component: ContextComponent,
    targetDocument: string,
    projectContext: any
  ): number {
    // This would be enhanced with actual template analysis
    // For now, return a base score that can be improved with ML
    return 0.8;
  }

  /**
   * Calculate dependency relevance score
   */
  private calculateDependencyRelevance(
    component: ContextComponent,
    targetDocument: string,
    projectContext: any
  ): number {
    // Analyze how relevant the dependency is to the target document
    return 0.6;
  }

  /**
   * Calculate project context relevance score
   */
  private calculateProjectContextRelevance(
    component: ContextComponent,
    targetDocument: string,
    projectContext: any
  ): number {
    // Analyze how relevant the project context is to the target document
    return 0.7;
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(context: ContextComponent[]): number {
    if (context.length === 0) return 0;
    
    const totalWeight = context.reduce((sum, component) => sum + component.tokenCount, 0);
    const weightedQuality = context.reduce((sum, component) => 
      sum + (component.qualityImpact * component.tokenCount), 0);
    
    return weightedQuality / totalWeight;
  }

  /**
   * Calculate overall relevance score
   */
  private calculateOverallRelevance(context: ContextComponent[]): number {
    if (context.length === 0) return 0;
    
    const totalWeight = context.reduce((sum, component) => sum + component.tokenCount, 0);
    const weightedRelevance = context.reduce((sum, component) => 
      sum + (component.relevanceScore * component.tokenCount), 0);
    
    return weightedRelevance / totalWeight;
  }

  /**
   * Generate quality optimization recommendations
   */
  private generateQualityRecommendations(
    optimizedContext: ContextComponent[],
    availableContext: ContextComponent[]
  ): string[] {
    const recommendations: string[] = [];
    
    const highQuality = optimizedContext.filter(c => c.qualityImpact > 0.8);
    if (highQuality.length > 0) {
      recommendations.push(`✅ ${highQuality.length} high-quality components selected for maximum document quality`);
    }
    
    const excludedHighQuality = availableContext.filter(a => 
      !optimizedContext.some(o => o.id === a.id) && a.qualityImpact > 0.7
    );
    if (excludedHighQuality.length > 0) {
      recommendations.push(`⚠️ ${excludedHighQuality.length} high-quality components excluded - consider including for better results`);
    }
    
    const qualityScore = this.calculateOverallQuality(optimizedContext);
    if (qualityScore > 0.8) {
      recommendations.push(`🎯 Excellent quality context selection (${(qualityScore * 100).toFixed(1)}% quality score)`);
    } else if (qualityScore > 0.6) {
      recommendations.push(`👍 Good quality context selection (${(qualityScore * 100).toFixed(1)}% quality score)`);
    } else {
      recommendations.push(`⚠️ Consider adding more high-quality context components (${(qualityScore * 100).toFixed(1)}% quality score)`);
    }
    
    return recommendations;
  }

  /**
   * Generate efficiency optimization recommendations
   */
  private generateEfficiencyRecommendations(
    included: ContextComponent[],
    available: ContextComponent[]
  ): string[] {
    const recommendations: string[] = [];
    
    const excluded = available.filter(a => !included.some(i => i.id === a.id));
    if (excluded.length > 0) {
      recommendations.push(`${excluded.length} components excluded due to token limits`);
    }
    
    const utilization = (included.reduce((sum, c) => sum + c.tokenCount, 0) / 
      available.reduce((sum, c) => sum + c.tokenCount, 0)) * 100;
    
    recommendations.push(`Context utilization: ${utilization.toFixed(1)}% of available context`);
    
    return recommendations;
  }

  /**
   * Learn from document generation results
   */
  async learnFromResult(
    contextResult: ContextOptimizationResult,
    actualQuality: number,
    actualRelevance: number,
    documentId: string
  ): Promise<void> {
    // Store result for learning
    if (!this.contextHistory.has(documentId)) {
      this.contextHistory.set(documentId, []);
    }
    this.contextHistory.get(documentId)!.push(contextResult);
    
    // Update quality metrics
    this.qualityMetrics.set(documentId, actualQuality);
    
    // This would be enhanced with ML to improve future context optimization
  }
}
