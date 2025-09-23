/**
 * Context Tracking Service
 * 
 * Tracks and monitors AI context window utilization for document generation.
 * Provides detailed analytics on context usage, token consumption, and efficiency metrics.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2025-09-22
 */

import { ProjectDocument } from '../models/ProjectDocument.js';
import { logger } from '../utils/logger.js';

export interface ContextUsageMetrics {
  // Input context metrics
  inputTokens: number;
  systemPromptTokens: number;
  userPromptTokens: number;
  projectContextTokens: number;
  templateTokens: number;
  
  // Output metrics
  outputTokens: number;
  responseTokens: number;
  
  // Utilization metrics
  totalTokensUsed: number;
  contextWindowSize: number;
  contextUtilizationPercentage: number;
  
  // Provider-specific metrics
  provider: string;
  model: string;
  
  // Timestamps
  generatedAt: Date;
  processingTimeMs: number;
}

export interface ContextBreakdown {
  component: string;
  tokens: number;
  percentage: number;
  description: string;
}

export class ContextTrackingService {
  private static instance: ContextTrackingService;
  
  // Provider context window limits (in tokens)
  private readonly contextLimits: Record<string, Record<string, number>> = {
    'google-ai': {
      'gemini-1.5-pro': 2000000, // 2M tokens
      'gemini-1.5-flash': 1000000, // 1M tokens
      'gemini-pro': 32768, // 32K tokens
      'default': 32768
    },
    'azure-openai': {
      'gpt-4o': 128000, // 128K tokens
      'gpt-4o-mini': 128000, // 128K tokens
      'gpt-4-turbo': 128000, // 128K tokens
      'gpt-4': 8192, // 8K tokens
      'gpt-3.5-turbo': 4096, // 4K tokens
      'default': 4096
    },
    'ollama': {
      'llama3': 32768, // 32K tokens
      'llama3.1': 32768, // 32K tokens
      'codellama': 16384, // 16K tokens
      'mistral': 32768, // 32K tokens
      'default': 32768
    },
    'default': {
      'default': 4096
    }
  };

  private constructor() {}

  static getInstance(): ContextTrackingService {
    if (!ContextTrackingService.instance) {
      ContextTrackingService.instance = new ContextTrackingService();
    }
    return ContextTrackingService.instance;
  }

  /**
   * Estimate token count for a given text
   * Using a rough approximation: 1 token ≈ 4 characters for English text
   */
  private estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Get context window limit for a provider and model
   */
  private getContextLimit(provider: string, model: string): number {
    const providerLimits = this.contextLimits[provider] || this.contextLimits['default'];
    return providerLimits[model] || providerLimits['default'] || 4096;
  }

  /**
   * Track context usage for a document generation
   */
  async trackContextUsage(
    documentId: string,
    provider: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    projectContext: string,
    template: string,
    response: string,
    processingTimeMs: number
  ): Promise<ContextUsageMetrics> {
    try {
      // Calculate token usage for each component
      const systemPromptTokens = this.estimateTokens(systemPrompt);
      const userPromptTokens = this.estimateTokens(userPrompt);
      const projectContextTokens = this.estimateTokens(projectContext);
      const templateTokens = this.estimateTokens(template);
      const responseTokens = this.estimateTokens(response);

      // Calculate totals
      const inputTokens = systemPromptTokens + userPromptTokens + projectContextTokens + templateTokens;
      const totalTokensUsed = inputTokens + responseTokens;
      const contextWindowSize = this.getContextLimit(provider, model);
      const contextUtilizationPercentage = Math.round((totalTokensUsed / contextWindowSize) * 100);

      const metrics: ContextUsageMetrics = {
        inputTokens,
        systemPromptTokens,
        userPromptTokens,
        projectContextTokens,
        templateTokens,
        outputTokens: responseTokens,
        responseTokens,
        totalTokensUsed,
        contextWindowSize,
        contextUtilizationPercentage,
        provider,
        model,
        generatedAt: new Date(),
        processingTimeMs
      };

      // Save context metrics to document
      await this.saveContextMetrics(documentId, metrics);

      logger.info(`📊 Context tracking for document ${documentId}:`, {
        provider,
        model,
        totalTokens: totalTokensUsed,
        contextUtilization: `${contextUtilizationPercentage}%`,
        processingTime: `${processingTimeMs}ms`
      });

      return metrics;
    } catch (error) {
      logger.error('❌ Error tracking context usage:', error);
      throw error;
    }
  }

  /**
   * Save context metrics to the document in the database
   */
  private async saveContextMetrics(documentId: string, metrics: ContextUsageMetrics): Promise<void> {
    try {
      await ProjectDocument.findByIdAndUpdate(
        documentId,
        {
          $set: {
            'metadata.contextMetrics': metrics
          }
        },
        { new: true }
      );

      logger.info(`✅ Context metrics saved for document ${documentId}`);
    } catch (error) {
      logger.error(`❌ Error saving context metrics for document ${documentId}:`, error);
    }
  }

  /**
   * Get context breakdown for analysis
   */
  getContextBreakdown(metrics: ContextUsageMetrics): ContextBreakdown[] {
    const breakdown: ContextBreakdown[] = [
      {
        component: 'System Prompt',
        tokens: metrics.systemPromptTokens,
        percentage: Math.round((metrics.systemPromptTokens / metrics.totalTokensUsed) * 100),
        description: 'AI instructions and system-level context'
      },
      {
        component: 'User Prompt',
        tokens: metrics.userPromptTokens,
        percentage: Math.round((metrics.userPromptTokens / metrics.totalTokensUsed) * 100),
        description: 'Specific user request and instructions'
      },
      {
        component: 'Project Context',
        tokens: metrics.projectContextTokens,
        percentage: Math.round((metrics.projectContextTokens / metrics.totalTokensUsed) * 100),
        description: 'Project-specific information and context'
      },
      {
        component: 'Template',
        tokens: metrics.templateTokens,
        percentage: Math.round((metrics.templateTokens / metrics.totalTokensUsed) * 100),
        description: 'Document template and structure'
      },
      {
        component: 'Response',
        tokens: metrics.responseTokens,
        percentage: Math.round((metrics.responseTokens / metrics.totalTokensUsed) * 100),
        description: 'Generated document content'
      }
    ];

    return breakdown;
  }

  /**
   * Get context utilization summary for a project
   */
  async getProjectContextSummary(projectId: string): Promise<{
    totalDocuments: number;
    averageUtilization: number;
    maxUtilization: number;
    minUtilization: number;
    providerBreakdown: Record<string, { count: number; averageUtilization: number }>;
    modelBreakdown: Record<string, { count: number; averageUtilization: number }>;
  }> {
    try {
      const documents = await ProjectDocument.find({
        projectId,
        'metadata.contextMetrics': { $exists: true }
      });

      if (documents.length === 0) {
        return {
          totalDocuments: 0,
          averageUtilization: 0,
          maxUtilization: 0,
          minUtilization: 0,
          providerBreakdown: {},
          modelBreakdown: {}
        };
      }

      const utilizations = documents.map(doc => doc.metadata?.contextMetrics?.contextUtilizationPercentage || 0);
      const averageUtilization = Math.round(utilizations.reduce((sum, util) => sum + util, 0) / utilizations.length);
      const maxUtilization = Math.max(...utilizations);
      const minUtilization = Math.min(...utilizations);

      // Provider breakdown
      const providerStats: Record<string, { count: number; totalUtilization: number }> = {};
      documents.forEach(doc => {
        const provider = doc.metadata?.contextMetrics?.provider || 'unknown';
        if (!providerStats[provider]) {
          providerStats[provider] = { count: 0, totalUtilization: 0 };
        }
        providerStats[provider].count++;
        providerStats[provider].totalUtilization += doc.metadata?.contextMetrics?.contextUtilizationPercentage || 0;
      });

      const providerBreakdown = Object.entries(providerStats).reduce((acc, [provider, stats]) => {
        acc[provider] = {
          count: stats.count,
          averageUtilization: Math.round(stats.totalUtilization / stats.count)
        };
        return acc;
      }, {} as Record<string, { count: number; averageUtilization: number }>);

      // Model breakdown
      const modelStats: Record<string, { count: number; totalUtilization: number }> = {};
      documents.forEach(doc => {
        const model = doc.metadata?.contextMetrics?.model || 'unknown';
        if (!modelStats[model]) {
          modelStats[model] = { count: 0, totalUtilization: 0 };
        }
        modelStats[model].count++;
        modelStats[model].totalUtilization += doc.metadata?.contextMetrics?.contextUtilizationPercentage || 0;
      });

      const modelBreakdown = Object.entries(modelStats).reduce((acc, [model, stats]) => {
        acc[model] = {
          count: stats.count,
          averageUtilization: Math.round(stats.totalUtilization / stats.count)
        };
        return acc;
      }, {} as Record<string, { count: number; averageUtilization: number }>);

      return {
        totalDocuments: documents.length,
        averageUtilization,
        maxUtilization,
        minUtilization,
        providerBreakdown,
        modelBreakdown
      };
    } catch (error) {
      logger.error('❌ Error getting project context summary:', error);
      throw error;
    }
  }

  /**
   * Get context efficiency recommendations
   */
  getContextEfficiencyRecommendations(metrics: ContextUsageMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.contextUtilizationPercentage > 80) {
      recommendations.push('High context utilization detected. Consider optimizing prompts or using a larger context model.');
    }

    if (metrics.contextUtilizationPercentage < 10) {
      recommendations.push('Low context utilization. Consider including more relevant context or using a smaller, more cost-effective model.');
    }

    if (metrics.projectContextTokens > metrics.templateTokens * 3) {
      recommendations.push('Project context is significantly larger than template. Consider filtering or prioritizing project information.');
    }

    if (metrics.systemPromptTokens > metrics.userPromptTokens) {
      recommendations.push('System prompt is larger than user prompt. Consider streamlining system instructions.');
    }

    if (metrics.processingTimeMs > 30000) {
      recommendations.push('Long processing time detected. Consider optimizing prompt complexity or using a faster model.');
    }

    return recommendations;
  }
}

export default ContextTrackingService;
