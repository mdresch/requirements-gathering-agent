/**
 * Context Builder Service
 * Demonstrates and manages context building for LLM injection
 * Shows available information and how context gets constructed
 */

import { ContextWindowManager } from './ContextWindowManager.js';
import { ContextIntelligenceEngine, ContextComponent } from './ContextIntelligenceEngine.js';

export interface ContextSource {
  id: string;
  type: 'template' | 'dependency' | 'project' | 'user' | 'system';
  name: string;
  content: string;
  metadata: {
    tokens: number;
    quality: number;
    relevance: number;
    source: string;
    lastModified: Date;
  };
}

export interface ContextBuildResult {
  totalTokens: number;
  contextComponents: ContextComponent[];
  contextString: string;
  sources: ContextSource[];
  traceability: ContextTraceability[];
  optimization: {
    strategy: string;
    qualityScore: number;
    efficiencyScore: number;
    recommendations: string[];
  };
}

export interface ContextTraceability {
  componentId: string;
  source: string;
  tokensUsed: number;
  qualityContribution: number;
  included: boolean;
  reason: string;
}

export class ContextBuilder {
  private intelligenceEngine: ContextIntelligenceEngine;

  constructor() {
    this.intelligenceEngine = new ContextIntelligenceEngine();
  }

  /**
   * Build context for document generation
   */
  async buildContext(
    provider: string,
    model: string,
    targetDocument: string,
    projectContext: any,
    availableTemplates: any[],
    dependencies: any[]
  ): Promise<ContextBuildResult> {
    
    console.log('🔧 Building context for:', targetDocument);
    console.log('📊 Provider:', provider, 'Model:', model);
    
    // Step 1: Gather all available context sources
    const contextSources = await this.gatherContextSources(
      targetDocument,
      projectContext,
      availableTemplates,
      dependencies
    );
    
    console.log('📚 Available context sources:', contextSources.length);
    contextSources.forEach(source => {
      console.log(`  - ${source.type}: ${source.name} (${source.metadata.tokens} tokens, ${(source.metadata.quality * 100).toFixed(1)}% quality)`);
    });
    
    // Step 2: Convert to context components
    const contextComponents = this.convertToContextComponents(contextSources);
    
    // Step 3: Optimize context using intelligence engine
    const optimizationResult = await this.intelligenceEngine.optimizeContext(
      provider,
      model,
      contextComponents,
      targetDocument,
      projectContext
    );
    
    // Step 4: Build final context string
    const contextString = this.buildContextString(optimizationResult.optimizedContext);
    
    // Step 5: Calculate totals and metrics
    const totalTokens = optimizationResult.totalTokens;
    const qualityScore = optimizationResult.qualityScore;
    const efficiencyScore = optimizationResult.relevanceScore;
    
    console.log('✅ Context built successfully:');
    console.log(`  📊 Total tokens: ${totalTokens.toLocaleString()}`);
    console.log(`  🎯 Quality score: ${(qualityScore * 100).toFixed(1)}%`);
    console.log(`  ⚡ Efficiency score: ${(efficiencyScore * 100).toFixed(1)}%`);
    console.log(`  📝 Strategy: ${optimizationResult.optimizationStrategy}`);
    
    return {
      totalTokens,
      contextComponents: optimizationResult.optimizedContext,
      contextString,
      sources: contextSources,
      traceability: optimizationResult.traceability,
      optimization: {
        strategy: optimizationResult.optimizationStrategy,
        qualityScore,
        efficiencyScore,
        recommendations: optimizationResult.recommendations
      }
    };
  }

  /**
   * Gather all available context sources
   */
  private async gatherContextSources(
    targetDocument: string,
    projectContext: any,
    availableTemplates: any[],
    dependencies: any[]
  ): Promise<ContextSource[]> {
    
    const sources: ContextSource[] = [];
    
    // 1. System Prompt
    sources.push({
      id: 'system-prompt',
      type: 'system',
      name: 'AI System Instructions',
      content: this.buildSystemPrompt(targetDocument, projectContext),
      metadata: {
        tokens: this.estimateTokens(this.buildSystemPrompt(targetDocument, projectContext)),
        quality: 1.0,
        relevance: 1.0,
        source: 'system',
        lastModified: new Date()
      }
    });
    
    // 2. Project Context
    sources.push({
      id: 'project-context',
      type: 'project',
      name: `Project: ${projectContext.projectName || 'Unknown'}`,
      content: this.buildProjectContext(projectContext),
      metadata: {
        tokens: this.estimateTokens(this.buildProjectContext(projectContext)),
        quality: 0.8,
        relevance: 0.9,
        source: 'project',
        lastModified: new Date()
      }
    });
    
    // 3. Available Templates
    availableTemplates.forEach((template, index) => {
      sources.push({
        id: `template-${template._id || index}`,
        type: 'template',
        name: template.name || `Template ${index + 1}`,
        content: template.content || template.aiInstructions || '',
        metadata: {
          tokens: this.estimateTokens(template.content || template.aiInstructions || ''),
          quality: 0.9,
          relevance: this.calculateTemplateRelevance(template, targetDocument),
          source: 'database',
          lastModified: new Date(template.updatedAt || template.createdAt || Date.now())
        }
      });
    });
    
    // 4. Dependencies
    dependencies.forEach((dependency, index) => {
      sources.push({
        id: `dependency-${dependency._id || index}`,
        type: 'dependency',
        name: dependency.name || `Dependency ${index + 1}`,
        content: dependency.content || dependency.aiInstructions || '',
        metadata: {
          tokens: this.estimateTokens(dependency.content || dependency.aiInstructions || ''),
          quality: 0.8,
          relevance: this.calculateDependencyRelevance(dependency, targetDocument),
          source: 'database',
          lastModified: new Date(dependency.updatedAt || dependency.createdAt || Date.now())
        }
      });
    });
    
    return sources;
  }

  /**
   * Convert context sources to context components
   */
  private convertToContextComponents(sources: ContextSource[]): ContextComponent[] {
    return sources.map(source => ({
      id: source.id,
      type: this.mapSourceTypeToComponentType(source.type),
      content: source.content,
      relevanceScore: source.metadata.relevance,
      qualityImpact: source.metadata.quality,
      tokenCount: source.metadata.tokens,
      source: source.metadata.source,
      priority: this.determinePriority(source.type, source.metadata.quality)
    }));
  }

  /**
   * Build final context string for LLM injection
   */
  private buildContextString(components: ContextComponent[]): string {
    const sections: string[] = [];
    
    // Sort components by type for logical ordering
    const sortedComponents = components.sort((a, b) => {
      const typeOrder = ['system-prompt', 'user-prompt', 'template', 'dependency', 'project-context'];
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    });
    
    sortedComponents.forEach(component => {
      const header = this.getComponentHeader(component);
      sections.push(`${header}\n${component.content}\n`);
    });
    
    return sections.join('\n---\n\n');
  }

  /**
   * Build system prompt
   */
  private buildSystemPrompt(targetDocument: string, projectContext: any): string {
    return `You are a professional requirements analyst and document generator specializing in ${projectContext.projectType || 'business'} projects.

Your task is to generate a high-quality ${targetDocument} document for the ${projectContext.projectName || 'current'} project.

Key Requirements:
- Follow industry best practices and standards
- Ensure comprehensive coverage of all relevant aspects
- Maintain consistency with project context and requirements
- Provide actionable, specific, and measurable content
- Use clear, professional language appropriate for stakeholders

Project Context:
- Project Name: ${projectContext.projectName || 'Not specified'}
- Project Type: ${projectContext.projectType || 'Not specified'}
- Framework: ${projectContext.framework || 'Not specified'}
- Description: ${projectContext.description || 'Not specified'}

Generate a comprehensive, professional document that meets all requirements and standards.`;
  }

  /**
   * Build project context
   */
  private buildProjectContext(projectContext: any): string {
    return `PROJECT OVERVIEW:
Name: ${projectContext.projectName || 'Not specified'}
Type: ${projectContext.projectType || 'Not specified'}
Framework: ${projectContext.framework || 'Not specified'}
Description: ${projectContext.description || 'Not specified'}
Program: ${projectContext.programName || 'Not specified'}

PROJECT DETAILS:
${JSON.stringify(projectContext, null, 2)}`;
  }

  /**
   * Calculate template relevance
   */
  private calculateTemplateRelevance(template: any, targetDocument: string): number {
    // Simple relevance calculation - can be enhanced with ML
    const templateName = (template.name || '').toLowerCase();
    const targetName = targetDocument.toLowerCase();
    
    if (templateName.includes(targetName) || targetName.includes(templateName)) {
      return 0.9;
    }
    
    // Check for common keywords
    const commonKeywords = ['requirements', 'analysis', 'management', 'plan', 'strategy'];
    const hasCommonKeywords = commonKeywords.some(keyword => 
      templateName.includes(keyword) && targetName.includes(keyword)
    );
    
    return hasCommonKeywords ? 0.7 : 0.5;
  }

  /**
   * Calculate dependency relevance
   */
  private calculateDependencyRelevance(dependency: any, targetDocument: string): number {
    // Similar to template relevance
    return this.calculateTemplateRelevance(dependency, targetDocument);
  }

  /**
   * Estimate token count
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation
  }

  /**
   * Map source type to component type
   */
  private mapSourceTypeToComponentType(sourceType: string): ContextComponent['type'] {
    switch (sourceType) {
      case 'system': return 'system-prompt';
      case 'user': return 'user-prompt';
      case 'template': return 'template';
      case 'dependency': return 'dependency';
      case 'project': return 'project-context';
      default: return 'project-context';
    }
  }

  /**
   * Determine priority based on type and quality
   */
  private determinePriority(type: string, quality: number): ContextComponent['priority'] {
    if (type === 'system') return 'critical';
    if (quality >= 0.9) return 'high';
    if (quality >= 0.7) return 'medium';
    return 'low';
  }

  /**
   * Get component header for context string
   */
  private getComponentHeader(component: ContextComponent): string {
    switch (component.type) {
      case 'system-prompt':
        return '=== SYSTEM INSTRUCTIONS ===';
      case 'user-prompt':
        return '=== USER REQUIREMENTS ===';
      case 'template':
        return '=== TEMPLATE CONTENT ===';
      case 'dependency':
        return '=== DEPENDENCY CONTENT ===';
      case 'project-context':
        return '=== PROJECT CONTEXT ===';
      default:
        return '=== CONTEXT ===';
    }
  }

  /**
   * Display context build summary
   */
  displayContextSummary(result: ContextBuildResult): void {
    console.log('\n📊 CONTEXT BUILD SUMMARY');
    console.log('='.repeat(50));
    console.log(`📝 Total Tokens: ${result.totalTokens.toLocaleString()}`);
    console.log(`🎯 Quality Score: ${(result.optimization.qualityScore * 100).toFixed(1)}%`);
    console.log(`⚡ Efficiency Score: ${(result.optimization.efficiencyScore * 100).toFixed(1)}%`);
    console.log(`🔧 Strategy: ${result.optimization.strategy}`);
    console.log(`📚 Sources Used: ${result.sources.length}`);
    
    console.log('\n📋 CONTEXT COMPONENTS:');
    result.contextComponents.forEach((component, index) => {
      console.log(`  ${index + 1}. ${component.type.toUpperCase()}`);
      console.log(`     Tokens: ${component.tokenCount}`);
      console.log(`     Quality: ${(component.qualityImpact * 100).toFixed(1)}%`);
      console.log(`     Relevance: ${(component.relevanceScore * 100).toFixed(1)}%`);
      console.log(`     Priority: ${component.priority}`);
      console.log('');
    });
    
    console.log('💡 RECOMMENDATIONS:');
    result.optimization.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
    
    console.log('\n🔍 TRACEABILITY:');
    result.traceability.forEach(trace => {
      console.log(`  ${trace.included ? '✅' : '❌'} ${trace.componentId}: ${trace.reason}`);
    });
  }
}
