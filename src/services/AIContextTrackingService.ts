import { AIContextTracking, IAIContextTracking } from '../models/AIContextTracking.model.js';
import { AIBillingUsage } from '../models/AIBillingUsage.model.js';
import { aiProviderBillingService } from './AIProviderBillingService.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

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

      // Track billing usage with the AI Provider Billing Service
      try {
        // Ensure we have valid usage data
        const usageData = responseData.responseMetadata?.usage || {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        };

        // Ensure we have a valid model name
        const modelName = trackingRecord.aiModel || 'default';

        await aiProviderBillingService.trackUsage({
          provider: trackingRecord.aiProvider,
          model: modelName,
          timestamp: new Date(),
          usage: usageData,
          metadata: {
            requestId: generationJobId,
            projectId: trackingRecord.projectId,
            userId: 'system', // TODO: Get actual user ID from context
            operation: 'ai_completion'
          }
        });

        // Ensure usage data is complete
        const usage = responseData.responseMetadata.usage || {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        };

        // Ensure cost data is complete
        const costData = trackingRecord.performance.costEstimate || {
          currency: 'USD',
          amount: 0,
          costPerToken: 0,
          breakdown: {
            promptCost: 0,
            completionCost: 0,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
            estimated: true
          }
        };

        // Save billing usage to database
        const billingUsage = new AIBillingUsage({
          provider: trackingRecord.aiProvider,
          aiModel: modelName,
          timestamp: new Date(),
          usage: usage,
          cost: costData,
          metadata: {
            requestId: generationJobId,
            projectId: trackingRecord.projectId,
            generationJobId: trackingRecord.generationJobId,
            documentId: trackingRecord.documentId,
            templateId: trackingRecord.templateId
          }
        });

        await billingUsage.save();
        
        logger.debug('Billing usage tracked and saved', {
          generationJobId,
          provider: trackingRecord.aiProvider,
          model: trackingRecord.aiModel,
          cost: trackingRecord.performance.costEstimate?.amount
        });
      } catch (billingError: any) {
        logger.error('Failed to track billing usage:', billingError);
        // Don't fail the main operation if billing tracking fails
      }

      logger.info(`Updated AI context tracking for job ${generationJobId}`, {
        totalTokens: responseData.responseMetadata?.usage?.totalTokens || 0,
        generationTime: responseData.generationTimeMs,
        utilizationPercentage: trackingRecord.contextUtilization.utilizationPercentage,
        cost: trackingRecord.performance.costEstimate?.amount
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
   * Calculate cost estimate based on usage using AI Provider Billing Service
   */
  private static calculateCostEstimate(
    usage: { promptTokens: number; completionTokens: number; totalTokens: number },
    aiProvider: string,
    aiModel: string
  ): { currency: string; amount: number; costPerToken: number } {
    try {
      // Use the AI Provider Billing Service for precise cost calculation
      const costData = aiProviderBillingService.calculateCost(aiProvider, aiModel, usage);
      
      return {
        currency: costData.currency,
        amount: costData.amount,
        costPerToken: costData.costPerToken
      };
    } catch (error: any) {
      logger.error('Failed to calculate cost using billing service, using fallback:', error);
      
      // Fallback to basic estimation
      const estimatedCostPer1K = 0.01; // $0.01 per 1K tokens
      const totalCost = (usage.totalTokens / 1000) * estimatedCostPer1K;
      const costPerToken = usage.totalTokens > 0 ? totalCost / usage.totalTokens : 0;

      return {
        currency: 'USD',
        amount: Math.round(totalCost * 1000000) / 1000000,
        costPerToken: Math.round(costPerToken * 1000000) / 1000000
      };
    }
  }

  /**
   * Get context utilization analytics for a project
   */
  static async getProjectAnalytics(projectId: string): Promise<any> {
    try {
      logger.info(`[AIContextTrackingService] Fetching analytics for project: ${projectId}`);
      
      // Check if database is connected using improved connection handling
      const dbConnection = (await import('../config/database.js')).default;
      const isConnected = await dbConnection.healthCheck();
      if (!isConnected) {
        logger.warn('Database not connected, attempting to reconnect...');
        
        try {
          await dbConnection.connect();
          logger.info('Database reconnection successful');
        } catch (reconnectError) {
          logger.error('Database reconnection failed, returning degraded analytics data:', reconnectError);
          return {
            totalInteractions: 0,
            averageUtilization: 0,
            totalTokensUsed: 0,
            totalCost: 0,
            utilizationDistribution: { low: 0, medium: 0, high: 0 },
            topProviders: [],
            performanceMetrics: { averageGenerationTime: 0, averageTokensPerSecond: 0 },
            message: 'Database unavailable - returning degraded data',
            connectionStatus: 'degraded'
          };
        }
      }

      // Try to get real data with improved error handling
      let records;
      try {
        records = await AIContextTracking.find({ projectId, status: 'completed' }).limit(1000); // Add limit for performance
        logger.info(`Retrieved ${records.length} analytics records for project ${projectId}`);
      } catch (dbError: any) {
        logger.error(`Database query failed for project ${projectId}:`, dbError);
        
        // Check if it's a connection issue and attempt recovery
        if (dbError.name === 'MongoNetworkError' || dbError.name === 'MongoTimeoutError') {
          logger.warn('Network/timeout error detected, attempting reconnection...');
          try {
            await dbConnection.connect();
            // Retry the query once
            records = await AIContextTracking.find({ projectId, status: 'completed' }).limit(1000);
            logger.info(`Retry successful: Retrieved ${records.length} analytics records`);
          } catch (retryError) {
            logger.error('Retry failed, returning degraded data:', retryError);
            return {
              totalInteractions: 0,
              averageUtilization: 0,
              totalTokensUsed: 0,
              totalCost: 0,
              utilizationDistribution: { low: 0, medium: 0, high: 0 },
              topProviders: [],
              performanceMetrics: { averageGenerationTime: 0, averageTokensPerSecond: 0 },
              message: 'Database temporarily unavailable - returning degraded data',
              connectionStatus: 'degraded',
              error: dbError.message
            };
          }
        } else {
          // Other database errors
          return {
            totalInteractions: 0,
            averageUtilization: 0,
            totalTokensUsed: 0,
            totalCost: 0,
            utilizationDistribution: { low: 0, medium: 0, high: 0 },
            topProviders: [],
            performanceMetrics: { averageGenerationTime: 0, averageTokensPerSecond: 0 },
            message: 'Database query failed - returning degraded data',
            connectionStatus: 'degraded',
            error: dbError.message
          };
        }
      }
      
      if (records.length === 0) {
        logger.info(`No completed records found for project ${projectId}, returning empty analytics`);
        return {
          totalInteractions: 0,
          averageUtilization: 0,
          totalTokensUsed: 0,
          totalCost: 0,
          utilizationDistribution: { low: 0, medium: 0, high: 0 },
          topProviders: [],
          performanceMetrics: { averageGenerationTime: 0, averageTokensPerSecond: 0 },
          message: 'No completed context tracking records found for this project'
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
        .map(([provider, count]) => ({ provider, count: count as number, percentage: (count as number / records.length) * 100 }))
        .sort((a, b) => (b.count as number) - (a.count as number));

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
      logger.info(`[AIContextTrackingService] Generating traceability matrix for document: ${documentId}`);
      
      // Check if database is connected
      if (mongoose.connection.readyState !== 1) {
        logger.warn('Database not connected, returning mock traceability data');
        return [
          {
            generationJobId: 'mock-job-001',
            templateId: 'business-case',
            aiProvider: 'openai',
            aiModel: 'gpt-4',
            contextBreakdown: {
              systemPrompt: { tokens: 150, percentage: '15.00' },
              userPrompt: { tokens: 200, percentage: '20.00' },
              projectContext: { tokens: 300, percentage: '30.00' },
              template: { tokens: 250, percentage: '25.00' },
              output: { tokens: 100, percentage: '10.00' },
              response: { tokens: 0, percentage: '0.00' }
            },
            utilizationPercentage: 75,
            generationTime: 2500,
            qualityScore: 85,
            complianceScore: 90,
            createdAt: new Date(),
            sourceInformation: {
              projectName: 'Mock Project',
              projectType: 'Software Development',
              framework: 'multi',
              documentType: 'business-case',
              templateVersion: '1.0'
            }
          }
        ];
      }

      // Try to get real data, fallback to mock if collection doesn't exist or is empty
      let records;
      try {
        records = await AIContextTracking.find({ documentId, status: 'completed' });
      } catch (dbError) {
        logger.warn(`Database query failed, returning mock traceability data: ${dbError}`);
        return [
          {
            generationJobId: 'mock-job-001',
            templateId: 'business-case',
            aiProvider: 'openai',
            aiModel: 'gpt-4',
            contextBreakdown: {
              systemPrompt: { tokens: 150, percentage: '15.00' },
              userPrompt: { tokens: 200, percentage: '20.00' },
              projectContext: { tokens: 300, percentage: '30.00' },
              template: { tokens: 250, percentage: '25.00' },
              output: { tokens: 100, percentage: '10.00' },
              response: { tokens: 0, percentage: '0.00' }
            },
            utilizationPercentage: 75,
            generationTime: 2500,
            qualityScore: 85,
            complianceScore: 90,
            createdAt: new Date(),
            sourceInformation: {
              projectName: 'Mock Project',
              projectType: 'Software Development',
              framework: 'multi',
              documentType: 'business-case',
              templateVersion: '1.0'
            }
          }
        ];
      }
      
      if (records.length === 0) {
        logger.info(`No completed records found for document ${documentId}, returning empty traceability matrix`);
        return [];
      }
      
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
   * Create sample context tracking data for testing
   */
  static async createSampleContextData(projectId: string, documentId: string): Promise<string> {
    try {
      logger.info(`[AIContextTrackingService] Creating sample context data for project: ${projectId}, document: ${documentId}`);
      
      const generationJobId = `sample-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const sampleTrackingRecord = new AIContextTracking({
        projectId,
        documentId,
        templateId: 'business-case',
        generationJobId,
        aiProvider: 'openai',
        aiModel: 'gpt-4',
        providerConfig: {
          modelName: 'gpt-4',
          maxTokens: 4000,
          temperature: 0.7,
          topP: 0.9
        },
        contextUtilization: {
          totalTokensUsed: 2500,
          maxContextWindow: 4000,
          utilizationPercentage: 62.5,
          breakdown: {
            systemPromptTokens: 200,
            userPromptTokens: 500,
            projectContextTokens: 800,
            templateTokens: 600,
            outputTokens: 0,
            responseTokens: 400
          }
        },
        inputContext: {
          systemPrompt: 'You are a business analyst creating comprehensive business case documents.',
          userPrompt: 'Create a business case for implementing a new CRM system.',
          projectContext: {
            projectName: 'CRM Implementation Project',
            projectType: 'Software Implementation',
            framework: 'multi',
            industry: 'Technology',
            budget: 500000,
            timeline: '6 months'
          },
          templateContent: '# Business Case Template\n\n## Executive Summary\n\n## Problem Statement\n\n## Proposed Solution\n\n## Financial Analysis\n\n## Risk Assessment\n\n## Recommendation',
          fullContext: 'Full context would be assembled here...'
        },
        aiResponse: {
          rawResponse: 'Generated business case document content...',
          processedResponse: 'Processed and formatted business case document...',
          responseMetadata: {
            finishReason: 'stop',
            usage: {
              promptTokens: 2100,
              completionTokens: 400,
              totalTokens: 2500
            },
            model: 'gpt-4',
            timestamp: new Date().toISOString()
          }
        },
        performance: {
          generationTimeMs: 3500,
          tokensPerSecond: 0.71,
          costEstimate: {
            currency: 'USD',
            amount: 0.075,
            costPerToken: 0.00003
          }
        },
        traceability: {
          sourceInformation: {
            projectName: 'CRM Implementation Project',
            projectType: 'Software Implementation',
            framework: 'multi',
            documentType: 'business-case',
            templateVersion: '1.0'
          },
          generationChain: {
            parentJobId: undefined,
            childJobIds: [],
            dependencies: ['project-charter', 'stakeholder-analysis']
          },
          qualityMetrics: {
            complianceScore: 92,
            qualityScore: 88,
            automatedChecks: [
              { check: 'PMBOK Compliance', passed: true, score: 95 },
              { check: 'Financial Analysis Completeness', passed: true, score: 90 },
              { check: 'Risk Assessment Coverage', passed: true, score: 85 }
            ]
          }
        },
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          sessionId: `session-${Date.now()}`,
          requestId: `req-${Date.now()}`,
          userAgent: 'ContextTrackingService/1.0',
          ipAddress: '127.0.0.1'
        },
        status: 'completed'
      });

      await sampleTrackingRecord.save();
      
      logger.info(`✅ Sample context tracking data created: ${generationJobId}`);
      return generationJobId;
    } catch (error: any) {
      logger.error('Failed to create sample context data', { error: error.message, projectId, documentId });
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
