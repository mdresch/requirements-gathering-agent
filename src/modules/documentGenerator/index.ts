/**
 * Document Generator Module
 * Exports functionality for generating project documentation
 */
import { DocumentGenerator, documentGeneratorVersion } from './DocumentGenerator';
import { GENERATION_TASKS, DOCUMENT_CONFIG, getAvailableCategories, getTasksByCategory, getTaskByKey } from './generationTasks';
import type { GenerationTask, GenerationOptions, GenerationResult, DocumentConfig, ValidationResult } from './types';

// Enhanced batch generation with smart retry
export async function generateDocumentsWithRetry(
    context: string, 
    options: GenerationOptions & { maxRetries?: number } = {}
): Promise<GenerationResult> {
    const maxRetries = options.maxRetries || 2;
    let lastResult: GenerationResult | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`\n🔄 Generation attempt ${attempt}/${maxRetries}`);
        
        const generator = new DocumentGenerator(context, {
            ...options,
            cleanup: attempt === 1 // Only cleanup on first attempt
        });
        
        lastResult = await generator.generateAll();
        
        if (lastResult.success && lastResult.failureCount === 0) {
            console.log(`✅ All documents generated successfully on attempt ${attempt}`);
            break;
        }
        
        if (attempt < maxRetries) {
            console.log(`⚠️ Some documents failed. Retrying in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
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
