/**
 * AI Prompts Module Index
 * 
 * Exports all prompt engineering components for enhanced AI content generation.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * 
 * @filepath src/modules/ai/prompts/index.ts
 */

export { PromptRegistry } from './PromptRegistry.js';
export type { PromptTemplate, PromptContext } from './PromptRegistry.js';
export type { 
    PromptManager, 
    PromptSelectionCriteria, 
    PromptBuildOptions, 
    PromptMetrics 
} from './PromptManager.js';

// Re-export enhanced AI processor types for convenience
export type { 
    EnhancedGenerationOptions, 
    EnhancedGenerationResult 
} from '../EnhancedAIProcessor.js';

import { PromptRegistry } from './PromptRegistry.js';
import { PromptManager } from './PromptManager.js';
import { EnhancedAIProcessor } from '../EnhancedAIProcessor.js';

/**
 * Initialize the prompt engineering system
 */
export function initializePromptSystem(): {
    promptRegistry: PromptRegistry;
    promptManager: PromptManager;
    enhancedProcessor: EnhancedAIProcessor;
} {
    const promptRegistry = PromptRegistry.getInstance();
    const promptManager = PromptManager.getInstance();
    const enhancedProcessor = EnhancedAIProcessor.getInstance();

    console.log('🎯 Prompt engineering system initialized');
    console.log(`📚 Available document types: ${promptManager.getAvailableDocumentTypes().length}`);
    console.log(`🏷️ Available categories: ${promptRegistry.getCategories().length}`);

    return {
        promptRegistry,
        promptManager,
        enhancedProcessor
    };
}

/**
 * Get system status and metrics
 */
export function getPromptSystemStatus(): {
    isInitialized: boolean;
    availableDocumentTypes: string[];
    availableCategories: string[];
    performanceMetrics?: any;
} {
    try {
        const promptManager = PromptManager.getInstance();
        const promptRegistry = PromptRegistry.getInstance();
        const enhancedProcessor = EnhancedAIProcessor.getInstance();

        return {
            isInitialized: true,
            availableDocumentTypes: promptManager.getAvailableDocumentTypes(),
            availableCategories: promptRegistry.getCategories(),
            performanceMetrics: enhancedProcessor.getPerformanceAnalytics()
        };
    } catch (error) {
        return {
            isInitialized: false,
            availableDocumentTypes: [],
            availableCategories: []
        };
    }
}