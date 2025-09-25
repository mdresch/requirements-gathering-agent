/**
 * Context Window Validation Service
 * Ensures that AI generation tasks have access to models with sufficient context windows
 * for effective context building and document generation.
 */

import { logger } from '../utils/logger.js';

export interface ContextWindowValidationResult {
  isValid: boolean;
  reason?: string;
  recommendations?: string[];
  fallbackStrategies?: string[];
  availableTokens?: number;
  requiredTokens?: number;
}

export class ContextWindowValidationService {
  private static instance: ContextWindowValidationService;

  // Default context window limits for different providers
  private readonly defaultLimits = {
    'google-ai': { maxTokens: 1000000 }, // Gemini 1.5 Pro
    'azure-openai': { maxTokens: 128000 }, // GPT-4
    'ollama': { maxTokens: 32000 }, // Llama 2
    'openai': { maxTokens: 128000 } // GPT-4
  };

  // Document complexity requirements
  private readonly complexityRequirements = {
    'low': { estimatedTokens: 2000 },
    'medium': { estimatedTokens: 8000 },
    'high': { estimatedTokens: 20000 },
    'very-high': { estimatedTokens: 50000 }
  };

  private constructor() {
    // Simplified constructor
  }

  static getInstance(): ContextWindowValidationService {
    if (!ContextWindowValidationService.instance) {
      ContextWindowValidationService.instance = new ContextWindowValidationService();
    }
    return ContextWindowValidationService.instance;
  }

  /**
   * Validate context window before generation
   */
  async validateBeforeGeneration(
    documentType: string,
    contextSize: number,
    projectId?: string
  ): Promise<ContextWindowValidationResult> {
    try {
      logger.info(`🔍 Validating context window for ${documentType} generation`);
      
      const complexity = this.determineDocumentComplexity(documentType);
      const requiredTokens = this.complexityRequirements[complexity].estimatedTokens;
      
      // Use default limits for now (simplified approach)
      const currentProvider = 'google-ai'; // Default provider
      const providerLimit = this.defaultLimits[currentProvider];
      
      if (!providerLimit) {
        return {
          isValid: false,
          reason: `Unknown provider: ${currentProvider}`,
          recommendations: ['Use a supported AI provider']
        };
      }
      
      const availableTokens = providerLimit.maxTokens - contextSize;
      
      if (availableTokens < requiredTokens) {
        const recommendations = await this.getContextFallbackStrategies(
          contextSize,
          requiredTokens,
          providerLimit.maxTokens,
          projectId
        );
        
        return {
          isValid: false,
          reason: `Insufficient context window: ${availableTokens} tokens available, ${requiredTokens} required`,
          recommendations,
          fallbackStrategies: recommendations
        };
      }
      
      logger.info(`✅ Context window validation passed: ${availableTokens} tokens available`);
      
      return {
        isValid: true,
        reason: 'Context window sufficient for generation',
        availableTokens,
        requiredTokens
      };
      
    } catch (error) {
      logger.error('❌ Context window validation error:', error);
      return {
        isValid: false,
        reason: 'Validation error occurred',
        recommendations: ['Check AI provider configuration']
      };
    }
  }

  /**
   * Determine document complexity based on type
   */
  private determineDocumentComplexity(documentType: string): 'low' | 'medium' | 'high' | 'very-high' {
    const highComplexityTypes = ['requirements', 'specification', 'architecture'];
    const mediumComplexityTypes = ['business-case', 'test-plan', 'user-story'];
    
    if (highComplexityTypes.some(type => documentType.toLowerCase().includes(type))) {
      return 'high';
    } else if (mediumComplexityTypes.some(type => documentType.toLowerCase().includes(type))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get context fallback strategies
   */
  private async getContextFallbackStrategies(
    contextSize: number,
    requiredTokens: number,
    maxTokens: number,
    projectId?: string
  ): Promise<string[]> {
    const strategies: string[] = [];
    
    if (contextSize > maxTokens * 0.8) {
      strategies.push('Consider using a provider with a larger context window');
      strategies.push('Implement context summarization to reduce token usage');
      strategies.push('Use document chunking to process content in smaller segments');
    }
    
    if (requiredTokens > maxTokens * 0.5) {
      strategies.push('Break down the generation task into smaller components');
      strategies.push('Use hierarchical document generation approach');
    }
    
    strategies.push('Consider switching to a provider with higher token limits');
    strategies.push('Implement intelligent context selection based on relevance');
    
    return strategies;
  }
}