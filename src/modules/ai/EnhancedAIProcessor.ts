/**
 * Enhanced AI Processor with Tailored Prompt Engineering
 * 
 * Advanced AI processor that leverages the new prompt management system
 * to provide tailored, document-specific content generation.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * 
 * Key Features:
 * - Document-type-specific prompt selection
 * - Context-aware content generation
 * - Performance monitoring and optimization
 * - Backward compatibility with existing processors
 * 
 * @filepath src/modules/ai/EnhancedAIProcessor.ts
 */

import { AIProcessor } from './AIProcessor.js';
import { PromptManager, PromptBuildOptions, PromptMetrics } from './prompts/PromptManager.js';
import { ChatMessage, AIResponse, ProjectContext } from './types.js';

export interface EnhancedGenerationOptions extends PromptBuildOptions {
    /** Maximum tokens for AI response */
    maxResponseTokens?: number;
    /** Enable performance monitoring */
    enableMetrics?: boolean;
    /** Retry configuration */
    retryOptions?: {
        maxRetries: number;
        backoffMultiplier: number;
    };
    /** Quality validation options */
    qualityValidation?: {
        minLength: number;
        requiredSections?: string[];
        forbiddenPhrases?: string[];
    };
}

export interface EnhancedGenerationResult {
    /** Generated content */
    content: string;
    /** Success status */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** Performance metrics */
    metrics?: PromptMetrics;
    /** AI response metadata */
    aiMetadata?: {
        provider: string;
        responseTime: number;
        tokensUsed?: number;
    };
    /** Quality validation results */
    qualityScore?: number;
    /** Warnings or suggestions */
    warnings?: string[];
}

/**
 * Enhanced AI processor with tailored prompt engineering capabilities
 */
export class EnhancedAIProcessor {
    private static instance: EnhancedAIProcessor;
    private aiProcessor: AIProcessor;
    private promptManager: PromptManager;
    private generationHistory: Map<string, EnhancedGenerationResult[]> = new Map();

    private constructor() {
        this.aiProcessor = AIProcessor.getInstance();
        this.promptManager = PromptManager.getInstance();
    }

    public static getInstance(): EnhancedAIProcessor {
        if (!EnhancedAIProcessor.instance) {
            EnhancedAIProcessor.instance = new EnhancedAIProcessor();
        }
        return EnhancedAIProcessor.instance;
    }

    /**
     * Generate document content using tailored prompts
     */
    public async generateDocumentContent(
        documentType: string,
        projectContext: string,
        options: EnhancedGenerationOptions = {}
    ): Promise<EnhancedGenerationResult> {
        const startTime = Date.now();
        
        try {
            console.log(`🎯 Generating ${documentType} with tailored prompts...`);

            // Build tailored prompt
            const promptResult = await this.promptManager.buildPromptForDocument(
                documentType,
                projectContext,
                options
            );

            if (!promptResult) {
                return {
                    content: '',
                    success: false,
                    error: `No suitable prompt found for document type: ${documentType}`
                };
            }

            const { messages, metrics } = promptResult;

            // Generate content with AI
            const aiResponse = await this.generateWithRetry(
                messages,
                options.maxResponseTokens || 2500,
                options.retryOptions
            );

            if (!aiResponse.success) {
                return {
                    content: '',
                    success: false,
                    error: aiResponse.error,
                    metrics: options.enableMetrics ? metrics : undefined
                };
            }

            // Extract and validate content
            const content = this.aiProcessor.extractContent(aiResponse.response!);
            const qualityResult = this.validateContentQuality(content, options.qualityValidation);

            // Build result
            const result: EnhancedGenerationResult = {
                content,
                success: true,
                metrics: options.enableMetrics ? metrics : undefined,
                aiMetadata: aiResponse.response?.metadata,
                qualityScore: qualityResult.score,
                warnings: qualityResult.warnings
            };

            // Store in history for analysis
            this.addToHistory(documentType, result);

            console.log(`✅ Generated ${documentType} successfully (${Date.now() - startTime}ms)`);
            return result;

        } catch (error: any) {
            console.error(`❌ Failed to generate ${documentType}:`, error.message);
            return {
                content: '',
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate content with retry logic
     */
    private async generateWithRetry(
        messages: ChatMessage[],
        maxTokens: number,
        retryOptions?: { maxRetries: number; backoffMultiplier: number }
    ): Promise<{ success: boolean; response?: AIResponse; error?: string }> {
        const maxRetries = retryOptions?.maxRetries || 3;
        const backoffMultiplier = retryOptions?.backoffMultiplier || 2;
        
        let lastError: string = '';
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.aiProcessor.makeAICall(messages, maxTokens);
                return { success: true, response };
                
            } catch (error: any) {
                lastError = error.message;
                console.warn(`AI call attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const delay = Math.pow(backoffMultiplier, attempt - 1) * 1000;
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        return { success: false, error: `All ${maxRetries} attempts failed. Last error: ${lastError}` };
    }

    /**
     * Validate content quality
     */
    private validateContentQuality(
        content: string,
        validation?: {
            minLength: number;
            requiredSections?: string[];
            forbiddenPhrases?: string[];
        }
    ): { score: number; warnings: string[] } {
        const warnings: string[] = [];
        let score = 100;

        if (!validation) {
            return { score, warnings };
        }

        // Check minimum length
        if (content.length < validation.minLength) {
            warnings.push(`Content is shorter than expected (${content.length} < ${validation.minLength} characters)`);
            score -= 20;
        }

        // Check required sections
        if (validation.requiredSections) {
            for (const section of validation.requiredSections) {
                if (!content.toLowerCase().includes(section.toLowerCase())) {
                    warnings.push(`Missing required section: ${section}`);
                    score -= 15;
                }
            }
        }

        // Check forbidden phrases
        if (validation.forbiddenPhrases) {
            for (const phrase of validation.forbiddenPhrases) {
                if (content.toLowerCase().includes(phrase.toLowerCase())) {
                    warnings.push(`Contains forbidden phrase: ${phrase}`);
                    score -= 10;
                }
            }
        }

        // Check for generic content indicators
        const genericPhrases = [
            'lorem ipsum',
            'placeholder',
            'todo',
            'tbd',
            'to be determined',
            'replace this'
        ];

        for (const phrase of genericPhrases) {
            if (content.toLowerCase().includes(phrase)) {
                warnings.push(`Contains generic placeholder: ${phrase}`);
                score -= 5;
            }
        }

        // Check for proper structure
        const hasHeaders = /^#+\s/m.test(content);
        if (!hasHeaders) {
            warnings.push('Content lacks proper markdown headers');
            score -= 10;
        }

        return { score: Math.max(0, score), warnings };
    }

    /**
     * Add result to generation history
     */
    private addToHistory(documentType: string, result: EnhancedGenerationResult): void {
        if (!this.generationHistory.has(documentType)) {
            this.generationHistory.set(documentType, []);
        }
        
        const history = this.generationHistory.get(documentType)!;
        history.push(result);
        
        // Keep only last 10 results per document type
        if (history.length > 10) {
            history.shift();
        }
    }

    /**
     * Get generation history for analysis
     */
    public getGenerationHistory(documentType?: string): Map<string, EnhancedGenerationResult[]> | EnhancedGenerationResult[] {
        if (documentType) {
            return this.generationHistory.get(documentType) || [];
        }
        return this.generationHistory;
    }

    /**
     * Get performance analytics
     */
    public getPerformanceAnalytics(): {
        totalGenerations: number;
        successRate: number;
        averageQualityScore: number;
        averageResponseTime: number;
        topPerformingDocumentTypes: string[];
        commonWarnings: string[];
    } {
        let totalGenerations = 0;
        let successfulGenerations = 0;
        let totalQualityScore = 0;
        let totalResponseTime = 0;
        const documentTypePerformance: Map<string, number> = new Map();
        const warningCounts: Map<string, number> = new Map();

        for (const [documentType, results] of this.generationHistory) {
            let typeSuccessCount = 0;
            
            for (const result of results) {
                totalGenerations++;
                
                if (result.success) {
                    successfulGenerations++;
                    typeSuccessCount++;
                }
                
                if (result.qualityScore !== undefined) {
                    totalQualityScore += result.qualityScore;
                }
                
                if (result.aiMetadata?.responseTime) {
                    totalResponseTime += result.aiMetadata.responseTime;
                }
                
                if (result.warnings) {
                    for (const warning of result.warnings) {
                        warningCounts.set(warning, (warningCounts.get(warning) || 0) + 1);
                    }
                }
            }
            
            if (results.length > 0) {
                documentTypePerformance.set(documentType, typeSuccessCount / results.length);
            }
        }

        // Get top performing document types
        const topPerformingDocumentTypes = Array.from(documentTypePerformance.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([type]) => type);

        // Get most common warnings
        const commonWarnings = Array.from(warningCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([warning]) => warning);

        return {
            totalGenerations,
            successRate: totalGenerations > 0 ? successfulGenerations / totalGenerations : 0,
            averageQualityScore: totalGenerations > 0 ? totalQualityScore / totalGenerations : 0,
            averageResponseTime: totalGenerations > 0 ? totalResponseTime / totalGenerations : 0,
            topPerformingDocumentTypes,
            commonWarnings
        };
    }

    /**
     * Get available document types
     */
    public getAvailableDocumentTypes(): string[] {
        return this.promptManager.getAvailableDocumentTypes();
    }

    /**
     * Test prompt for document type
     */
    public async testPromptForDocumentType(
        documentType: string,
        sampleContext: string = 'Sample project context for testing'
    ): Promise<{
        promptFound: boolean;
        promptDetails?: any;
        testGeneration?: EnhancedGenerationResult;
    }> {
        try {
            // Check if prompt exists
            const promptResult = await this.promptManager.buildPromptForDocument(
                documentType,
                sampleContext,
                { enableMetrics: true }
            );

            if (!promptResult) {
                return { promptFound: false };
            }

            // Test generation with sample context
            const testResult = await this.generateDocumentContent(
                documentType,
                sampleContext,
                { 
                    enableMetrics: true,
                    maxResponseTokens: 500, // Smaller for testing
                    qualityValidation: { minLength: 100 }
                }
            );

            return {
                promptFound: true,
                promptDetails: {
                    metrics: promptResult.metrics,
                    promptLength: promptResult.messages.reduce((sum, msg) => sum + msg.content.length, 0)
                },
                testGeneration: testResult
            };

        } catch (error: any) {
            console.error(`Error testing prompt for ${documentType}:`, error.message);
            return { promptFound: false };
        }
    }

    /**
     * Clear generation history
     */
    public clearHistory(): void {
        this.generationHistory.clear();
    }

    /**
     * Export configuration for backup/restore
     */
    public exportConfiguration(): any {
        return {
            availableDocumentTypes: this.getAvailableDocumentTypes(),
            performanceAnalytics: this.getPerformanceAnalytics(),
            promptMetrics: this.promptManager.getPromptMetrics()
        };
    }
}