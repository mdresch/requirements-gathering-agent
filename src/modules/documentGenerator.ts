/**
 * Document Generator Module (Legacy Adapter)
 * 
 * DEPRECATED: This file is maintained for backward compatibility.
 * Please use the new modular structure instead:
 * - import { DocumentGenerator, ... } from './documentGenerator';
 * - import { PMBOKValidator, ... } from './pmbokValidation';
 * - import { generateAllWithPMBOKValidation } from './documentGeneratorWithValidation.js';
 * 
 * @deprecated Use the new modular structure instead
 * @version 2.2.0
 */

// Import from the refactored modules
import { 
    DocumentGenerator, 
    GenerationResult, 
    GenerationOptions,
    GenerationTask,
    GENERATION_TASKS, 
    DOCUMENT_CONFIG,
    generateDocumentsWithRetry,
    generateAllDocuments as generateAll
} from './documentGenerator/index.js';

import {
    PMBOKValidator,
    PMBOKComplianceResult,
    ComprehensiveValidationResult,
    PMBOK_DOCUMENT_REQUIREMENTS
} from './pmbokValidation/index.js';

import {
    generateAllWithPMBOKValidation,
    integratedVersion
} from './documentGeneratorWithValidation.js';

/**
 * Export all functionality from new modules for backward compatibility
 */

// Re-export main classes
export { DocumentGenerator, PMBOKValidator };

// Re-export types
export type { 
    GenerationTask,
    GenerationOptions,
    GenerationResult,
    PMBOKComplianceResult,
    ComprehensiveValidationResult
};

// Re-export constants
export { 
    GENERATION_TASKS,
    DOCUMENT_CONFIG,
    PMBOK_DOCUMENT_REQUIREMENTS
};

// Re-export utility functions
export { generateDocumentsWithRetry };

// Re-export static version
export const documentGeneratorVersion = '2.2.0';

/**
 * Legacy backward compatibility functions
 */

// Backward compatibility function for generateAllDocuments
export async function generateAllDocuments(context: string): Promise<void> {
    await generateAll(context);
}

// Legacy convenience methods - forwarded to new module
export function getAvailableCategories(): string[] {
    return [...new Set(GENERATION_TASKS.map(task => task.category))];
}

export function getTasksByCategory(category: string): GenerationTask[] {
    return GENERATION_TASKS.filter(task => task.category === category);
}

export function getTaskByKey(key: string): GenerationTask | undefined {
    return GENERATION_TASKS.find(task => task.key === key);
}

/**
 * Combined generation and validation (forwarded to the integrated module)
 */
export async function generateAllWithValidation(
    context: string,
    options: GenerationOptions = {}
): Promise<{ result: GenerationResult; validation: ComprehensiveValidationResult }> {
    return await generateAllWithPMBOKValidation(context, options);
}

/**
 * Creates a DocumentGenerator with recommended default options
 * @param context Project context
 * @param customOptions Custom options to override defaults
 * @returns DocumentGenerator instance
 */
export function createDocumentGenerator(
    context: string,
    customOptions: Partial<GenerationOptions> = {}
): DocumentGenerator {
    return new DocumentGenerator(context, {
        maxConcurrent: 1,
        delayBetweenCalls: 500,
        continueOnError: true,
        generateIndex: true,
        cleanup: true,
        ...customOptions
    });
}
