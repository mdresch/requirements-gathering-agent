/**
 * Configuration for Few-Shot Learning System
 * 
 * This module provides configuration options for the few-shot learning
 * system to control how examples are selected and used in AI prompts.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 */

export interface FewShotConfig {
    /** Maximum number of examples to include in prompts */
    maxExamples: number;
    /** Whether to enable few-shot learning */
    enabled: boolean;
    /** Token budget reserved for examples (out of total token limit) */
    exampleTokenBudget: number;
    /** Minimum token limit required to include examples */
    minTokenLimitForExamples: number;
    /** Whether to randomly select examples or use first N */
    randomSelection: boolean;
    /** Document types that should always use few-shot learning */
    priorityDocumentTypes: string[];
    /** Document types that should never use few-shot learning */
    excludedDocumentTypes: string[];
}

/**
 * Default configuration for few-shot learning
 */
export const DEFAULT_FEW_SHOT_CONFIG: FewShotConfig = {
    maxExamples: 2,
    enabled: true,
    exampleTokenBudget: 0.4, // 40% of token budget for examples
    minTokenLimitForExamples: 2000,
    randomSelection: false,
    priorityDocumentTypes: [
        'project-charter',
        'requirements-documentation',
        'scope-management-plan',
        'risk-register',
        'stakeholder-register'
    ],
    excludedDocumentTypes: [
        // Add document types that shouldn't use examples
    ]
};

/**
 * Configuration for different project sizes
 */
export const PROJECT_SIZE_CONFIGS: Record<string, Partial<FewShotConfig>> = {
    small: {
        maxExamples: 1,
        exampleTokenBudget: 0.3
    },
    medium: {
        maxExamples: 2,
        exampleTokenBudget: 0.4
    },
    large: {
        maxExamples: 2,
        exampleTokenBudget: 0.5
    },
    enterprise: {
        maxExamples: 3,
        exampleTokenBudget: 0.6
    }
};

/**
 * Get configuration based on project context
 */
export function getFewShotConfig(
    projectSize?: string,
    customConfig?: Partial<FewShotConfig>
): FewShotConfig {
    let config = { ...DEFAULT_FEW_SHOT_CONFIG };
    
    // Apply project size specific config
    if (projectSize && PROJECT_SIZE_CONFIGS[projectSize]) {
        config = { ...config, ...PROJECT_SIZE_CONFIGS[projectSize] };
    }
    
    // Apply custom overrides
    if (customConfig) {
        config = { ...config, ...customConfig };
    }
    
    return config;
}

/**
 * Determine if few-shot learning should be used for a document type
 */
export function shouldUseFewShotLearning(
    documentType: string,
    tokenLimit: number,
    config: FewShotConfig = DEFAULT_FEW_SHOT_CONFIG
): boolean {
    // Check if few-shot learning is enabled
    if (!config.enabled) {
        return false;
    }
    
    // Check if document type is excluded
    if (config.excludedDocumentTypes.includes(documentType)) {
        return false;
    }
    
    // Check if token limit is sufficient
    if (tokenLimit < config.minTokenLimitForExamples) {
        return false;
    }
    
    return true;
}

/**
 * Calculate optimal number of examples based on token budget
 */
export function calculateOptimalExampleCount(
    tokenLimit: number,
    averageExampleTokens: number = 800,
    config: FewShotConfig = DEFAULT_FEW_SHOT_CONFIG
): number {
    const availableTokensForExamples = tokenLimit * config.exampleTokenBudget;
    const maxExamplesByTokens = Math.floor(availableTokensForExamples / averageExampleTokens);
    
    return Math.min(maxExamplesByTokens, config.maxExamples);
}