/**
 * Context Injection Demonstration
 * Visual representation of how context gets injected into LLMs
 */

import { ContextBuilder, ContextBuildResult } from './ContextBuilder.js';
import { ContextWindowManager } from './ContextWindowManager.js';

export interface InjectionVisualization {
  provider: string;
  model: string;
  contextFlow: ContextFlowStep[];
  tokenUsage: TokenUsage;
  qualityMetrics: QualityMetrics;
  recommendations: string[];
}

export interface ContextFlowStep {
  step: number;
  name: string;
  description: string;
  tokens: number;
  quality: number;
  included: boolean;
  reason: string;
}

export interface TokenUsage {
  total: number;
  available: number;
  utilization: number;
  breakdown: {
    systemPrompt: number;
    templates: number;
    dependencies: number;
    projectContext: number;
    userPrompt: number;
  };
}

export interface QualityMetrics {
  overall: number;
  components: Array<{
    name: string;
    quality: number;
    contribution: number;
  }>;
}

export class ContextInjectionDemo {
  private contextBuilder: ContextBuilder;

  constructor() {
    this.contextBuilder = new ContextBuilder();
  }

  /**
   * Demonstrate context injection process
   */
  async demonstrateInjection(
    provider: string,
    model: string,
    targetDocument: string,
    projectContext: any,
    availableTemplates: any[],
    dependencies: any[]
  ): Promise<InjectionVisualization> {
    
    console.log(`\n🎬 CONTEXT INJECTION DEMONSTRATION`);
    console.log(`Provider: ${provider} | Model: ${model}`);
    console.log(`Target: ${targetDocument}`);
    console.log('='.repeat(60));

    // Build context
    const result = await this.contextBuilder.buildContext(
      provider,
      model,
      targetDocument,
      projectContext,
      availableTemplates,
      dependencies
    );

    // Create visualization
    const visualization = this.createVisualization(result, provider, model);
    
    // Display the visualization
    this.displayVisualization(visualization);
    
    return visualization;
  }

  /**
   * Create injection visualization
   */
  private createVisualization(
    result: ContextBuildResult,
    provider: string,
    model: string
  ): InjectionVisualization {
    
    const limits = ContextWindowManager.getProviderLimits(provider, model);
    const availableTokens = limits ? limits.inputTokens : 0;
    
    // Create context flow steps
    const contextFlow: ContextFlowStep[] = [
      {
        step: 1,
        name: 'System Instructions',
        description: 'AI system prompt and instructions',
        tokens: result.contextComponents.find(c => c.type === 'system-prompt')?.tokenCount || 0,
        quality: 1.0,
        included: true,
        reason: 'Critical for AI behavior'
      },
      {
        step: 2,
        name: 'Project Context',
        description: 'Project information and requirements',
        tokens: result.contextComponents.find(c => c.type === 'project-context')?.tokenCount || 0,
        quality: 0.8,
        included: true,
        reason: 'Essential for project-specific content'
      },
      {
        step: 3,
        name: 'Templates',
        description: 'Document templates and structures',
        tokens: result.contextComponents.filter(c => c.type === 'template').reduce((sum, c) => sum + c.tokenCount, 0),
        quality: 0.9,
        included: true,
        reason: 'High quality impact for document structure'
      },
      {
        step: 4,
        name: 'Dependencies',
        description: 'Related documents and references',
        tokens: result.contextComponents.filter(c => c.type === 'dependency').reduce((sum, c) => sum + c.tokenCount, 0),
        quality: 0.8,
        included: true,
        reason: 'Improves document quality and consistency'
      },
      {
        step: 5,
        name: 'User Requirements',
        description: 'Specific user prompts and requirements',
        tokens: result.contextComponents.find(c => c.type === 'user-prompt')?.tokenCount || 0,
        quality: 0.9,
        included: true,
        reason: 'Direct user input for customization'
      }
    ];

    // Calculate token usage breakdown
    const tokenUsage: TokenUsage = {
      total: result.totalTokens,
      available: availableTokens,
      utilization: (result.totalTokens / availableTokens) * 100,
      breakdown: {
        systemPrompt: contextFlow[0].tokens,
        templates: contextFlow[2].tokens,
        dependencies: contextFlow[3].tokens,
        projectContext: contextFlow[1].tokens,
        userPrompt: contextFlow[4].tokens
      }
    };

    // Calculate quality metrics
    const qualityMetrics: QualityMetrics = {
      overall: result.optimization.qualityScore,
      components: result.contextComponents.map(component => ({
        name: component.type,
        quality: component.qualityImpact,
        contribution: (component.qualityImpact * component.tokenCount) / result.totalTokens
      }))
    };

    return {
      provider,
      model,
      contextFlow,
      tokenUsage,
      qualityMetrics,
      recommendations: result.optimization.recommendations
    };
  }

  /**
   * Display the injection visualization
   */
  private displayVisualization(viz: InjectionVisualization): void {
    console.log(`\n📊 CONTEXT INJECTION FLOW`);
    console.log('='.repeat(60));
    
    // Show context flow
    console.log('\n🔄 CONTEXT FLOW:');
    viz.contextFlow.forEach(step => {
      const status = step.included ? '✅' : '❌';
      const qualityBar = this.createQualityBar(step.quality);
      console.log(`  ${status} Step ${step.step}: ${step.name}`);
      console.log(`     📝 ${step.description}`);
      console.log(`     🎯 Quality: ${qualityBar} ${(step.quality * 100).toFixed(1)}%`);
      console.log(`     📊 Tokens: ${step.tokens.toLocaleString()}`);
      console.log(`     💡 Reason: ${step.reason}`);
      console.log('');
    });

    // Show token usage
    console.log('\n📊 TOKEN USAGE BREAKDOWN:');
    console.log(`  Total Used: ${viz.tokenUsage.total.toLocaleString()} tokens`);
    console.log(`  Available: ${viz.tokenUsage.available.toLocaleString()} tokens`);
    console.log(`  Utilization: ${viz.tokenUsage.utilization.toFixed(1)}%`);
    
    const utilizationBar = this.createUtilizationBar(viz.tokenUsage.utilization);
    console.log(`  Progress: ${utilizationBar}`);
    
    console.log('\n  Breakdown:');
    Object.entries(viz.tokenUsage.breakdown).forEach(([key, tokens]) => {
      const percentage = (tokens / viz.tokenUsage.total) * 100;
      const bar = this.createPercentageBar(percentage);
      console.log(`    ${key}: ${bar} ${percentage.toFixed(1)}% (${tokens.toLocaleString()} tokens)`);
    });

    // Show quality metrics
    console.log('\n🎯 QUALITY METRICS:');
    console.log(`  Overall Quality: ${this.createQualityBar(viz.qualityMetrics.overall)} ${(viz.qualityMetrics.overall * 100).toFixed(1)}%`);
    
    console.log('\n  Component Contributions:');
    viz.qualityMetrics.components.forEach(component => {
      const contributionBar = this.createPercentageBar(component.contribution * 100);
      console.log(`    ${component.name}: ${contributionBar} ${(component.contribution * 100).toFixed(1)}% contribution`);
    });

    // Show recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    viz.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });

    // Show injection strategy
    console.log('\n🔧 INJECTION STRATEGY:');
    if (viz.tokenUsage.utilization > 80) {
      console.log('  ⚠️  High utilization - consider context optimization');
    } else if (viz.tokenUsage.utilization > 50) {
      console.log('  ✅ Good utilization - balanced approach');
    } else {
      console.log('  🎯 Low utilization - room for additional context');
    }

    if (viz.qualityMetrics.overall > 0.8) {
      console.log('  🎯 Excellent quality context selection');
    } else if (viz.qualityMetrics.overall > 0.6) {
      console.log('  👍 Good quality context selection');
    } else {
      console.log('  ⚠️  Consider improving context quality');
    }
  }

  /**
   * Create quality bar visualization
   */
  private createQualityBar(quality: number): string {
    const filled = Math.round(quality * 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  /**
   * Create utilization bar visualization
   */
  private createUtilizationBar(utilization: number): string {
    const filled = Math.round(utilization / 10);
    const empty = 10 - filled;
    const color = utilization > 80 ? '🔴' : utilization > 50 ? '🟡' : '🟢';
    return `${color}[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${utilization.toFixed(1)}%`;
  }

  /**
   * Create percentage bar visualization
   */
  private createPercentageBar(percentage: number): string {
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  /**
   * Generate context injection report
   */
  generateReport(viz: InjectionVisualization): string {
    return `
# Context Injection Report

## Provider Information
- **Provider**: ${viz.provider}
- **Model**: ${viz.model}
- **Total Tokens**: ${viz.tokenUsage.total.toLocaleString()}
- **Available Tokens**: ${viz.tokenUsage.available.toLocaleString()}
- **Utilization**: ${viz.tokenUsage.utilization.toFixed(1)}%

## Context Flow
${viz.contextFlow.map(step => `
### Step ${step.step}: ${step.name}
- **Description**: ${step.description}
- **Tokens**: ${step.tokens.toLocaleString()}
- **Quality**: ${(step.quality * 100).toFixed(1)}%
- **Status**: ${step.included ? 'Included' : 'Excluded'}
- **Reason**: ${step.reason}
`).join('')}

## Quality Metrics
- **Overall Quality**: ${(viz.qualityMetrics.overall * 100).toFixed(1)}%
- **Component Contributions**:
${viz.qualityMetrics.components.map(comp => `  - ${comp.name}: ${(comp.contribution * 100).toFixed(1)}%`).join('\n')}

## Recommendations
${viz.recommendations.map(rec => `- ${rec}`).join('\n')}
`;
  }
}

