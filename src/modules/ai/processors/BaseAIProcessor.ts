/**
 * Base processor for common functionality across AI processors
 * Enhanced with tailored prompt engineering capabilities
 */

import { AIProcessor } from "../AIProcessor.js";
import { EnhancedAIProcessor, EnhancedGenerationOptions } from "../EnhancedAIProcessor.js";
import { ChatMessage } from "../types.js";

const aiProcessor = AIProcessor.getInstance();
const enhancedAIProcessor = EnhancedAIProcessor.getInstance();

export abstract class BaseAIProcessor {
    /**
     * Enhanced AI call with tailored prompts
     */
    protected async handleEnhancedAICall(
        documentType: string,
        projectContext: string,
        options: EnhancedGenerationOptions = {}
    ): Promise<string | null> {
        try {
            const result = await enhancedAIProcessor.generateDocumentContent(
                documentType,
                projectContext,
                {
                    enableMetrics: true,
                    qualityValidation: { minLength: 200 },
                    ...options
                }
            );

            if (!result.success) {
                console.error(`Enhanced AI generation failed for ${documentType}: ${result.error}`);
                return null;
            }

            if (result.warnings && result.warnings.length > 0) {
                console.warn(`Quality warnings for ${documentType}:`, result.warnings);
            }

            return result.content;
        } catch (error: any) {
            console.error(`Enhanced AI operation failed for ${documentType}:`, error.message);
            return null;
        }
    }

    /**
     * Legacy AI call for backward compatibility
     */
    protected async handleAICall(
        operation: () => Promise<string | null>,
        operationName: string,
        cacheKey?: string
    ): Promise<string | null> {
        try {
            return await aiProcessor.processAIRequest(operation, operationName);
        } catch (error: any) {
            console.error(`AI operation failed: ${operationName}`, error.message);
            return null;
        }
    }

    /**
     * Create standard messages (legacy method)
     */
    protected createStandardMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
        return [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
    }

    /**
     * Try enhanced generation first, fallback to legacy if needed
     */
    protected async handleAICallWithFallback(
        documentType: string,
        projectContext: string,
        legacyOperation: () => Promise<string | null>,
        operationName: string,
        options: EnhancedGenerationOptions = {}
    ): Promise<string | null> {
        // Try enhanced generation first
        const enhancedResult = await this.handleEnhancedAICall(documentType, projectContext, options);
        
        if (enhancedResult) {
            console.log(`✅ Used enhanced prompts for ${documentType}`);
            return enhancedResult;
        }

        // Fallback to legacy method
        console.log(`⚠️ Falling back to legacy prompts for ${documentType}`);
        return await this.handleAICall(legacyOperation, operationName);
    }
}
