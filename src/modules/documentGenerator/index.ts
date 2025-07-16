/**
 * Document Generator Module
 * Exports functionality for generating project documentation
 */
import { DocumentGenerator, documentGeneratorVersion } from './DocumentGenerator.js';
import { DOCUMENT_CONFIG } from '../fileManager.js';
import { GENERATION_TASKS, getAvailableCategories, getTasksByCategory, getTaskByKey } from './generationTasks.js';
import { withRetry } from '../../utils/retry.js';
// ProcessorFactory is internal—no public export needed
import type { GenerationTask, GenerationOptions, GenerationResult, DocumentConfig, ValidationResult } from './types';

// Enhanced batch generation with smart retry
export async function generateDocumentsWithRetry(
    context: string, 
    options: GenerationOptions & { maxRetries?: number, retryBackoff?: number, retryMaxDelay?: number } = {}
): Promise<GenerationResult> {
    const maxRetries = options.maxRetries || 2;
    const retryBackoff = options.retryBackoff || 1000;
    const retryMaxDelay = options.retryMaxDelay || 25000;
    let lastResult: GenerationResult | null = null;

    // Use a custom DocumentGenerator that wraps generateSingleDocument with withRetry
    const generator = new DocumentGenerator(context, {
        ...options,
        cleanup: true // Only cleanup on first attempt
    });
    // Patch generateSingleDocument to use withRetry
    const origGenerateSingle = generator["generateSingleDocument"].bind(generator);
    generator["generateSingleDocument"] = async function(task) {
        return await withRetry(
            () => origGenerateSingle(task),
            maxRetries,
            retryBackoff,
            retryMaxDelay
        );
    };

    // Now just call generateAll once (it will use the patched method)
    lastResult = await generator.generateAll();
    return lastResult!;
}

// Backward compatibility function
export async function generateAllDocuments(context: string): Promise<void> {
    const generator = new DocumentGenerator(context, {
        maxConcurrent: 1,
        delayBetweenCalls: 500,
        continueOnError: true,
        generateIndex: true,
        cleanup: true
    });
    
    await generator.generateAll();
}

export {
    DocumentGenerator,
    documentGeneratorVersion,
    GENERATION_TASKS,
    DOCUMENT_CONFIG,
    getAvailableCategories,
    getTasksByCategory,
    getTaskByKey,
    // Types
    GenerationTask,
    GenerationOptions,
    GenerationResult,
    DocumentConfig,
    ValidationResult
};
