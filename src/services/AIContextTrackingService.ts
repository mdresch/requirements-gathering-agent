import { AIContextTracking, IAIContextTracking } from '../models/AIContextTracking.model.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface ContextTrackingOptions {
  projectId: string;
  documentId?: string;
  templateId: string;
  aiProvider: string;
  aiModel: string;
  providerConfig: any;
  projectContext: any;
  templateContent: string;
  systemPrompt: string;
  userPrompt: string;
  createdBy?: string;
  sessionId?: string;
  requestId?: string;
  parentJobId?: string;
}

export interface ContextUtilizationMetrics {
  totalTokensUsed: number;
  maxContextWindow: number;
  utilizationPercentage: number;
  breakdown: {
    systemPromptTokens: number;
    userPromptTokens: number;
    projectContextTokens: number;
    templateTokens: number;
    outputTokens: number;
    responseTokens: number;
  };
}

export interface AIResponseData {
  rawResponse: string;
  processedResponse?: string;
  responseMetadata: {
    finishReason: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    model: string;
    timestamp: string;
  };
  generationTimeMs: number;
}

export class AIContextTrackingService {
  /**
   * Start tracking a new AI context interaction
   */
  static async startTracking(options: ContextTrackingOptions): Promise<string> {
    try {
      const generationJobId = `job-${Date.now()}-${uuidv4().substring(0, 8)}`;
      
      // Calculate initial context utilization
      const contextUtilization = await AIContextTrackingService.calculateContextUtilization(
        options.systemPrompt,
        options.userPrompt,
        options.projectContext,
        options.templateContent,
        options.providerConfig.maxTokens
      );

      const trackingRecord = new AIContextTracking({
        projectId: options.projectId,
        documentId: options.documentId,
        templateId: options.templateId,
        generationJobId,
        aiProvider: options.aiProvider,
        aiModel: options.aiModel,
        providerConfig: options.providerConfig,
        contextUtilization,
        inputContext: {
          systemPrompt: options.systemPrompt,
          userPrompt: options.userPrompt,
          projectContext: options.projectContext,
          templateContent: options.templateContent,
          fullContext: AIContextTrackingService.buildFullContext(
            options.systemPrompt,
            options.userPrompt,
            options.projectContext,
            options.templateContent
          )
        },
        aiResponse: {
          rawResponse: 'pending',
          processedResponse: 'pending',
          responseMetadata: {
            finishReason: 'pending',
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            model: options.aiModel,
            timestamp: new Date().toISOString()
          }
        },
        performance: {
          generationTimeMs: 0,
          tokensPerSecond: 0
        },
        traceability: {
          sourceInformation: {
            projectName: options.projectContext.projectName || 'Unknown Project',
            projectType: options.projectContext.projectType || 'Unknown Type',
            framework: options.projectContext.framework || 'multi',
            documentType: options.templateId,
            templateVersion: '1.0'
          },
          generationChain: {
            parentJobId: options.parentJobId,
            childJobIds: [],
            dependencies: []
          },
          qualityMetrics: {
            complianceScore: 0,
            qualityScore: 0,
            automatedChecks: []
          }
        },
        metadata: {
          createdBy: options.createdBy || 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          sessionId: options.sessionId,
          requestId: options.requestId
        },
        status: 'pending'
      });

      await trackingRecord.save();
      
      logger.info(`Started AI context tracking for job ${generationJobId}`, {
        projectId: options.projectId,
        templateId: options.templateId,
        aiProvider: options.aiProvider,
        utilizationPercentage: contextUtilization.utilizationPercentage
      });

      return generationJobId;
    } catch (error: any) {
      logger.error('Failed to start AI context tracking', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Update tracking record with AI response data
   */
  static async updateWithResponse(
    generationJobId: string, 
    responseData: AIResponseData
  ): Promise<void> {
    try {
      const trackingRecord = await AIContextTracking.findOne({ generationJobId });
      
      if (!trackingRecord) {
        throw new Error(`Tracking record not found for job ${generationJobId}`);
      }

      // Update response data
      trackingRecord.aiResponse = {
        rawResponse: responseData.rawResponse,
        processedResponse: responseData.processedResponse || responseData.rawResponse,
        responseMetadata: responseData.responseMetadata
      };

      // Update performance metrics
      trackingRecord.performance = {
        generationTimeMs: responseData.generationTimeMs,
        tokensPerSecond: responseData.generationTimeMs > 0 
          ? responseData.responseMetadata.usage.totalTokens / (responseData.generationTimeMs / 1000)
          : 0,
        costEstimate: AIContextTrackingService.calculateCostEstimate(
          responseData.responseMetadata.usage,
          trackingRecord.aiProvider,
          trackingRecord.aiModel
        )
      };

      // Update context utilization with actual response tokens
      trackingRecord.contextUtilization.breakdown.responseTokens = responseData.responseMetadata.usage.completionTokens;
      trackingRecord.contextUtilization.totalTokensUsed = responseData.responseMetadata.usage.totalTokens;
      trackingRecord.contextUtilization.utilizationPercentage = 
        (trackingRecord.contextUtilization.totalTokensUsed / trackingRecord.contextUtilization.maxContextWindow) * 100;

      trackingRecord.status = 'completed';
      trackingRecord.metadata.updatedAt = new Date();

      await trackingRecord.save();

      logger.info(`Updated AI context tracking for job ${generationJobId}`, {
        totalTokens: responseData.responseMetadata.usage.totalTokens,
        generationTime: responseData.generationTimeMs,
        utilizationPercentage: trackingRecord.contextUtilization.utilizationPercentage
      });
    } catch (error: any) {
      logger.error('Failed to update AI context tracking with response', { 
        error: error.message, 
        generationJobId 
      });
      throw error;
    }
  }

  /**
   * Mark tracking record as failed
   */
  static async markAsFailed(
    generationJobId: string, 
    errorDetails: { errorCode: string; errorMessage: string; stackTrace?: string }
  ): Promise<void> {
    try {
      const trackingRecord = await AIContextTracking.findOne({ generationJobId });
      
      if (!trackingRecord) {
        throw new Error(`Tracking record not found for job ${generationJobId}`);
      }

      trackingRecord.status = 'failed';
      trackingRecord.errorDetails = {
        ...errorDetails,
        retryCount: trackingRecord.errorDetails?.retryCount || 0
      };
      trackingRecord.metadata.updatedAt = new Date();

      await trackingRecord.save();

      logger.error(`Marked AI context tracking as failed for job ${generationJobId}`, errorDetails);
    } catch (error: any) {
      logger.error('Failed to mark AI context tracking as failed', { 
        error: error.message, 
        generationJobId 
      });
      throw error;
    }
  }

  /**
   * Calculate context utilization metrics
   */
  private static async calculateContextUtilization(
    systemPrompt: string,
    userPrompt: string,
    projectContext: any,
    templateContent: string,
    maxContextWindow: number
  ): Promise<ContextUtilizationMetrics> {
    try {
      // Simple token estimation (in production, use actual tokenizer)
      const systemPromptTokens = AIContextTrackingService.estimateTokens(systemPrompt);
      const userPromptTokens = AIContextTrackingService.estimateTokens(userPrompt);
      const projectContextTokens = AIContextTrackingService.estimateTokens(JSON.stringify(projectContext));
      const templateTokens = AIContextTrackingService.estimateTokens(templateContent);
      
      const totalInputTokens = systemPromptTokens + userPromptTokens + projectContextTokens + templateTokens;
      const utilizationPercentage = (totalInputTokens / maxContextWindow) * 100;

      return {
        totalTokensUsed: totalInputTokens,
        maxContextWindow,
        utilizationPercentage,
        breakdown: {
          systemPromptTokens,
          userPromptTokens,
          projectContextTokens,
          templateTokens,
          outputTokens: 0, // Will be updated when response is received
          responseTokens: 0 // Will be updated when response is received
        }
      };
    } catch (error: any) {
      logger.error('Failed to calculate context utilization', { error: error.message });
      throw error;
    }
  }

  /**
   * Estimate token count for text (simple approximation)
   */
  private static estimateTokens(text: string): number {
    if (!text) return 0;
    
    // Simple approximation: ~4 characters per token for English text
    // In production, use actual tokenizer from the AI provider
    return Math.ceil(text.length / 4);
  }

  /**
   * Build full context string
   */
  private static buildFullContext(
    systemPrompt: string,
    userPrompt: string,
    projectContext: any,
    templateContent: string
  ): string {
    return [
      `System Prompt: ${systemPrompt}`,
      `User Prompt: ${userPrompt}`,
      `Project Context: ${JSON.stringify(projectContext, null, 2)}`,
      `Template Content: ${templateContent}`
    ].join('\n\n---\n\n');
  }

  /**
   * Calculate cost estimate based on usage
   */
  private static calculateCostEstimate(
    usage: { promptTokens: number; completionTokens: number; totalTokens: number },
    aiProvider: string,
    aiModel: string
  ): { currency: string; amount: number; costPerToken: number } {
    // Cost estimates per 1K tokens (approximate, update with actual pricing)
    const costPer1KTokens: Record<string, Record<string, number>> = {
      'openai': { 'gpt-4': 0.03, 'gpt-3.5-turbo': 0.002 },
      'anthropic': { 'claude-3': 0.015 },
      'google': { 'gemini-pro': 0.001 },
      'azure': { 'gpt-4': 0.03, 'gpt-3.5-turbo': 0.002 }
    };

    const providerCosts = costPer1KTokens[aiProvider] || costPer1KTokens['openai'];
    const costPerToken = (providerCosts[aiModel] || providerCosts['gpt-3.5-turbo']) / 1000;
    const totalCost = usage.totalTokens * costPerToken;

    return {
      currency: 'USD',
      amount: totalCost,
      costPerToken
    };
  }

  /**
   * Get context utilization analytics for a project
   */
  static async getProjectAnalytics(projectId: string): Promise<any> {
    try {
      const records = await AIContextTracking.find({ projectId, status: 'completed' });
      
      if (records.length === 0) {
        return {
          totalInteractions: 0,
          averageUtilization: 0,
          totalTokensUsed: 0,
          totalCost: 0,
          utilizationDistribution: { low: 0, medium: 0, high: 0 },
          topProviders: [],
          performanceMetrics: { averageGenerationTime: 0, averageTokensPerSecond: 0 }
        };
      }

      const totalTokensUsed = records.reduce((sum, record) => sum + record.contextUtilization.totalTokensUsed, 0);
      const averageUtilization = records.reduce((sum, record) => sum + record.contextUtilization.utilizationPercentage, 0) / records.length;
      const totalCost = records.reduce((sum, record) => sum + (record.performance.costEstimate?.amount || 0), 0);
      const averageGenerationTime = records.reduce((sum, record) => sum + record.performance.generationTimeMs, 0) / records.length;
      const averageTokensPerSecond = records.reduce((sum, record) => sum + record.performance.tokensPerSecond, 0) / records.length;

      // Utilization distribution
      const utilizationDistribution = records.reduce((dist, record) => {
        const utilization = record.contextUtilization.utilizationPercentage;
        if (utilization >= 90) dist.high++;
        else if (utilization >= 70) dist.medium++;
        else dist.low++;
        return dist;
      }, { low: 0, medium: 0, high: 0 });

      // Top providers
      const providerCounts = records.reduce((counts, record) => {
        counts[record.aiProvider] = (counts[record.aiProvider] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      const topProviders = Object.entries(providerCounts)
        .map(([provider, count]) => ({ provider, count, percentage: (count / records.length) * 100 }))
        .sort((a, b) => b.count - a.count);

      return {
        totalInteractions: records.length,
        averageUtilization,
        totalTokensUsed,
        totalCost,
        utilizationDistribution,
        topProviders,
        performanceMetrics: {
          averageGenerationTime,
          averageTokensPerSecond
        }
      };
    } catch (error: any) {
      logger.error('Failed to get project analytics', { error: error.message, projectId });
      throw error;
    }
  }

  /**
   * Get traceability matrix for a document
   */
  static async getTraceabilityMatrix(documentId: string): Promise<any> {
    try {
      const records = await AIContextTracking.find({ documentId, status: 'completed' });
      
      return records.map(record => ({
        generationJobId: record.generationJobId,
        templateId: record.templateId,
        aiProvider: record.aiProvider,
        aiModel: record.aiModel,
        contextBreakdown: (record as any).getContextBreakdown(),
        utilizationPercentage: record.contextUtilization.utilizationPercentage,
        generationTime: record.performance.generationTimeMs,
        qualityScore: record.traceability.qualityMetrics.qualityScore,
        complianceScore: record.traceability.qualityMetrics.complianceScore,
        createdAt: record.metadata.createdAt,
        sourceInformation: record.traceability.sourceInformation
      }));
    } catch (error: any) {
      logger.error('Failed to get traceability matrix', { error: error.message, documentId });
      throw error;
    }
  }

  /**
   * Get context utilization metrics for a specific document
   */
  static async getDocumentContextMetrics(documentId: string): Promise<any> {
    try {
      const record = await AIContextTracking.findOne({ documentId, status: 'completed' }).sort({ createdAt: -1 });
      
      if (!record) {
        return null;
      }

      return {
        totalTokensUsed: record.contextUtilization.totalTokensUsed,
        contextWindowSize: record.contextUtilization.maxContextWindow,
        contextUtilizationPercentage: record.contextUtilization.utilizationPercentage,
        systemPromptTokens: record.contextUtilization.breakdown.systemPromptTokens,
        userPromptTokens: record.contextUtilization.breakdown.userPromptTokens,
        projectContextTokens: record.contextUtilization.breakdown.projectContextTokens,
        templateTokens: record.contextUtilization.breakdown.templateTokens,
        responseTokens: record.contextUtilization.breakdown.responseTokens,
        aiProvider: record.aiProvider,
        aiModel: record.aiModel,
        generationTimeMs: record.performance.generationTimeMs,
        tokensPerSecond: record.performance.tokensPerSecond,
        qualityScore: record.traceability.qualityMetrics.qualityScore,
        complianceScore: record.traceability.qualityMetrics.complianceScore,
        generationJobId: record.generationJobId,
        templateId: record.templateId,
        createdAt: record.metadata.createdAt,
        inputContext: {
          systemPrompt: record.inputContext.systemPrompt,
          userPrompt: record.inputContext.userPrompt,
          projectContext: record.inputContext.projectContext,
          templateContent: record.inputContext.templateContent
        }
      };
    } catch (error: any) {
      logger.error('Failed to get document context metrics', { error: error.message, documentId });
      throw error;
    }
  }
}
