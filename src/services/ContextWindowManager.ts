/**
 * Context Window Manager
 * Handles different AI provider token limits and context optimization strategies
 */

export interface ProviderLimits {
  provider: string;
  model: string;
  maxTokens: number;
  contextWindow: number;
  inputTokens: number;
  outputTokens: number;
  costPer1KTokens: number;
  supportsStreaming: boolean;
}

export interface ContextStrategy {
  provider: string;
  model: string;
  strategy: 'full-injection' | 'selective-injection' | 'compressed-injection';
  maxContextTokens: number;
  optimizationLevel: 'quality' | 'efficiency' | 'balanced';
}

export class ContextWindowManager {
  private static readonly PROVIDER_LIMITS: Record<string, ProviderLimits[]> = {
    'google-gemini': [
      {
        provider: 'google-gemini',
        model: 'gemini-pro',
        maxTokens: 1000000, // 1M tokens
        contextWindow: 1000000,
        inputTokens: 800000, // 80% for input
        outputTokens: 200000, // 20% for output
        costPer1KTokens: 0.0005,
        supportsStreaming: true
      },
      {
        provider: 'google-gemini',
        model: 'gemini-ultra',
        maxTokens: 1000000,
        contextWindow: 1000000,
        inputTokens: 800000,
        outputTokens: 200000,
        costPer1KTokens: 0.001,
        supportsStreaming: true
      }
    ],
    'openai': [
      {
        provider: 'openai',
        model: 'gpt-5',
        maxTokens: 2000000, // 2M tokens - estimated for GPT-5
        contextWindow: 2000000,
        inputTokens: 1600000, // 80% for input
        outputTokens: 400000, // 20% for output
        costPer1KTokens: 0.06, // Estimated higher cost
        supportsStreaming: true
      },
      {
        provider: 'openai',
        model: 'gpt-4',
        maxTokens: 128000,
        contextWindow: 128000,
        inputTokens: 100000,
        outputTokens: 28000,
        costPer1KTokens: 0.03,
        supportsStreaming: true
      },
      {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        maxTokens: 16000,
        contextWindow: 16000,
        inputTokens: 12000,
        outputTokens: 4000,
        costPer1KTokens: 0.002,
        supportsStreaming: true
      }
    ],
    'claude': [
      {
        provider: 'claude',
        model: 'claude-3-opus',
        maxTokens: 200000,
        contextWindow: 200000,
        inputTokens: 160000,
        outputTokens: 40000,
        costPer1KTokens: 0.015,
        supportsStreaming: true
      },
      {
        provider: 'claude',
        model: 'claude-3-sonnet',
        maxTokens: 200000,
        contextWindow: 200000,
        inputTokens: 160000,
        outputTokens: 40000,
        costPer1KTokens: 0.003,
        supportsStreaming: true
      }
    ],
    'azure-ai': [
      {
        provider: 'azure-ai',
        model: 'gpt-4',
        maxTokens: 128000,
        contextWindow: 128000,
        inputTokens: 100000,
        outputTokens: 28000,
        costPer1KTokens: 0.03,
        supportsStreaming: true
      }
    ],
    'ollama': [
      {
        provider: 'ollama',
        model: 'llama2',
        maxTokens: 4000,
        contextWindow: 4000,
        inputTokens: 3000,
        outputTokens: 1000,
        costPer1KTokens: 0.0, // Local model
        supportsStreaming: true
      }
    ],
    'huggingface': [
      {
        provider: 'huggingface',
        model: 'meta-llama/Llama-2-7b-chat-hf',
        maxTokens: 4000,
        contextWindow: 4000,
        inputTokens: 3000,
        outputTokens: 1000,
        costPer1KTokens: 0.0,
        supportsStreaming: false
      }
    ]
  };

  /**
   * Get provider limits for a specific model
   */
  static getProviderLimits(provider: string, model: string): ProviderLimits | null {
    const providerLimits = this.PROVIDER_LIMITS[provider];
    if (!providerLimits) return null;
    
    return providerLimits.find(limit => limit.model === model) || null;
  }

  /**
   * Get optimal context strategy for a provider
   */
  static getContextStrategy(provider: string, model: string, estimatedTokens: number): ContextStrategy {
    const limits = this.getProviderLimits(provider, model);
    if (!limits) {
      throw new Error(`Provider ${provider} with model ${model} not supported`);
    }

    // For high-capacity models (Gemini 1M+, GPT-5 2M+), prioritize quality
    if (limits.maxTokens >= 1000000) {
      return {
        provider,
        model,
        strategy: 'full-injection',
        maxContextTokens: Math.min(estimatedTokens * 1.5, limits.inputTokens), // 50% buffer for quality
        optimizationLevel: 'quality'
      };
    }

    // For other providers, use selective injection
    if (estimatedTokens <= limits.inputTokens * 0.8) {
      return {
        provider,
        model,
        strategy: 'selective-injection',
        maxContextTokens: limits.inputTokens * 0.8,
        optimizationLevel: 'balanced'
      };
    }

    // For constrained providers, use compression
    return {
      provider,
      model,
      strategy: 'compressed-injection',
      maxContextTokens: limits.inputTokens * 0.6,
      optimizationLevel: 'efficiency'
    };
  }

  /**
   * Estimate token count for context
   */
  static estimateTokenCount(context: {
    systemPrompt?: string;
    userPrompt?: string;
    projectContext?: string;
    templates?: string[];
    dependencies?: string[];
  }): number {
    let totalTokens = 0;

    // Rough estimation: 1 token ≈ 4 characters for English text
    const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

    if (context.systemPrompt) {
      totalTokens += estimateTokens(context.systemPrompt);
    }
    if (context.userPrompt) {
      totalTokens += estimateTokens(context.userPrompt);
    }
    if (context.projectContext) {
      totalTokens += estimateTokens(context.projectContext);
    }
    if (context.templates) {
      context.templates.forEach(template => {
        totalTokens += estimateTokens(template);
      });
    }
    if (context.dependencies) {
      context.dependencies.forEach(dependency => {
        totalTokens += estimateTokens(dependency);
      });
    }

    return totalTokens;
  }

  /**
   * Check if context fits within provider limits
   */
  static canFitContext(provider: string, model: string, estimatedTokens: number): boolean {
    const limits = this.getProviderLimits(provider, model);
    if (!limits) return false;
    
    return estimatedTokens <= limits.inputTokens;
  }

  /**
   * Get utilization percentage
   */
  static getUtilizationPercentage(provider: string, model: string, usedTokens: number): number {
    const limits = this.getProviderLimits(provider, model);
    if (!limits) return 0;
    
    return (usedTokens / limits.inputTokens) * 100;
  }

  /**
   * Get cost estimate for context usage
   */
  static getCostEstimate(provider: string, model: string, inputTokens: number, outputTokens: number): number {
    const limits = this.getProviderLimits(provider, model);
    if (!limits) return 0;
    
    const inputCost = (inputTokens / 1000) * limits.costPer1KTokens;
    const outputCost = (outputTokens / 1000) * limits.costPer1KTokens;
    
    return inputCost + outputCost;
  }

  /**
   * Get all supported providers
   */
  static getSupportedProviders(): string[] {
    return Object.keys(this.PROVIDER_LIMITS);
  }

  /**
   * Get all models for a provider
   */
  static getProviderModels(provider: string): string[] {
    const providerLimits = this.PROVIDER_LIMITS[provider];
    if (!providerLimits) return [];
    
    return providerLimits.map(limit => limit.model);
  }
}
