/**
 * Document Generator Types
 * Type definitions for document generation functionality
 */
import { ChatMessage } from "../ai/types.js";

/**
 * Interface for a document generation task
 */
export interface GenerationTask {
    /** Unique identifier for the document */
    key: string;
    /** Display name for the document */
    name: string;
    /** Function to call in llmProcessor module */
    func: string; // Can't use keyof typeof to avoid circular reference
    /** Emoji icon for console display */
    emoji: string;
    /** Category for grouping documents */
    category: string;
    /** Priority for document generation (lower = higher priority) */
    priority: number;
    /** Task dependencies (keys that must run before this one) */
    dependencies?: string[];
    /** PMBOK reference number or identifier */
    pmbokRef?: string;
}

/**
 * Options for document generation
 */
export interface GenerationOptions {
    /** Categories to include in generation */
    includeCategories?: string[];
    /** Categories to exclude from generation */
    excludeCategories?: string[];
    /** Maximum number of concurrent generations */
    maxConcurrent?: number;
    /** Delay between API calls in milliseconds */
    delayBetweenCalls?: number;
    /** Whether to continue on error */
    continueOnError?: boolean;
    /** Whether to generate index file */
    generateIndex?: boolean;
    /** Whether to clean up old files before generation */
    cleanup?: boolean;
    /** Output directory for generated files */
    outputDir?: string;
    /** Output format for generated files */
    format?: 'markdown' | 'json' | 'yaml';
}

/**
 * Result of document generation process
 */
export interface GenerationResult {
    /** Whether generation was successful overall */
    success: boolean;
    /** Optional message about the generation result */
    message: string;
    /** Number of successfully generated documents */
    successCount: number;
    /** Number of failed document generations */
    failureCount: number;
    /** Number of skipped documents */
    skippedCount: number;
    /** Paths of generated files */
    generatedFiles: string[];
    /** Errors encountered during generation */
    errors: Array<{ task: string; error: string; }>;
    /** Total duration of generation in milliseconds */
    duration: number;
    /** Optional error details */
    error?: string;
    /** Individual results for each task */
    taskResults?: {
        [key: string]: {
            success: boolean;
            message?: string;
            error?: string;
            path?: string;
        }
    };
}

/**
 * Configuration for a document
 */
export interface DocumentConfig {
    /** Filename for the generated document */
    filename: string;
    /** Title for the generated document */
    title: string;
    /** Description of the document */
    description?: string;
    /** Template file to use for generation */
    template?: string;
}

/**
 * Interface for validation results
 */
export interface ValidationResult {
    /** Whether validation was successful */
    isComplete: boolean;
    /** List of missing files */
    missing: string[];
    /** List of errors */
    errors: string[];
}

/**
 * Output of a document processor
 */
export interface DocumentOutput {
    title: string;
    content: string;
    // Optionally, add more fields as needed (e.g., metadata, summary, etc.)
}

// Interface for document processors
export interface DocumentProcessor {
  process(context: any): any;
}
