/**
 * Generate Command Handler
 * Handles document generation commands including single document, category, and all documents
 * Enhanced with improved error handling and centralized types (Phase 3 refactor)
 */

// 1. Node.js built-ins
import process from 'process';

// 2. Third-party dependencies (none in this file)

// 3. Internal modules  
import { 
  DocumentGenerator, 
  generateAllDocuments, 
  generateDocumentsWithRetry,
  getAvailableCategories 
} from '../modules/documentGenerator.js';
import { getTasksByCategory, getTaskByKey, GENERATION_TASKS } from '../modules/documentGenerator/generationTasks.js';
import { readEnhancedProjectContext } from '../modules/fileManager.js';

// 4. Constants and utilities
import { SupportedFormat, DEFAULT_OUTPUT_DIR, DEFAULT_RETRY_COUNT } from '../constants.js';
import type { GenerateOptions } from '../types.js';
import { ValidationError } from '../types.js';
import { 
  validateBaseOptions,
  validateOutputDirectory as validateOutputDir,
  executeWithErrorHandling,
  logSuccess,
  logInfo
} from '../utils/errorHandler.js';
import { 
  validateFormat, 
  validateDocumentKey, 
  validateCategory 
} from './utils/validation.js';

/**
 * Handler for the 'generate' command - generates a specific document by key
 */
export async function handleGenerateCommand(key: string, options: GenerateOptions): Promise<void> {
  try {
    // Validate inputs
    validateDocumentKey(key);
    validateBaseOptions(options);
    await validateOutputDir(options.output || DEFAULT_OUTPUT_DIR);
    validateFormat(options.format || 'markdown');

    const outputDir = options.output || DEFAULT_OUTPUT_DIR;
    const retries = options.retries || DEFAULT_RETRY_COUNT;
    
    if (!options.quiet) {
      logInfo(`Generating document: ${key}`);
      logInfo(`Output directory: ${outputDir}`);
      logInfo(`Format: ${options.format || 'markdown'}`);
      if (retries > 0) {
        logInfo(`Retry configuration: ${retries} attempts`);
      }
    }

    // Read project context
    const projectContext = await readEnhancedProjectContext();
    
    // Get the task for this document
    const task = getTaskByKey(key);
    if (!task) {
      throw new ValidationError(`Document key not found: ${key}`, 'key');
    }

    // Generate the document with retry logic
    const generator = new DocumentGenerator(projectContext);
    
    if (retries > 0) {
      await generateDocumentsWithRetry(
        projectContext,
        {
          maxRetries: retries,
          retryBackoff: options.retryBackoff,
          retryMaxDelay: options.retryMaxDelay,
          outputDir
        }
      );
    } else {
      // Use the generateOne method which exists on DocumentGenerator
      await generator.generateOne(key);
    }

    logSuccess(`Document generated successfully: ${key}`, options.quiet);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Handler for the 'generate-category' command - generates all documents in a category
 */
export async function handleGenerateCategoryCommand(category: string, options: GenerateCategoryOptions): Promise<void> {
  try {
    // Validate inputs
    validateCategory(category);
    await validateOutputDir(options.output);
    
    const { output, retries, retryBackoff, retryMaxDelay, quiet } = options;
    const context = await readEnhancedProjectContext(process.cwd());
    
    if (!quiet) {
      console.log(`🔍 Generating all documents in category: ${category}...`);
    }
    
    // Get tasks for the category
    const tasks = getTasksByCategory(category);
    const generator = new DocumentGenerator(context);
    
    if (retries && retries > 0) {
      await generateDocumentsWithRetry(context, {
        includeCategories: [category],
        maxRetries: retries,
        retryBackoff,
        retryMaxDelay,
        outputDir: output
      });
    } else {
      await generateAllDocuments(context);
    }
    
    if (!quiet) {
      console.log(`✅ Category document generation complete`);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Handler for the 'generate-all' command - generates all available documents
 */
export async function handleGenerateAllCommand(options: GenerateAllOptions): Promise<void> {
  const { output, retries, retryBackoff, retryMaxDelay, quiet } = options;
  const context = await readEnhancedProjectContext(process.cwd());
  
  if (!quiet) {
    console.log(`🔍 Generating all available documents...`);
  }
  
  await generateDocumentsWithRetry(context, { 
    outputDir: output,
    maxRetries: retries,
    retryBackoff,
    retryMaxDelay
  });
  
  if (!quiet) {
    console.log(`✅ All document generation complete`);
  }
}

/**
 * Handler for the 'generate-core-analysis' command - generates core analysis documents
 */
export async function handleGenerateCoreAnalysisCommand(options: GenerateCoreOptions): Promise<void> {
  const { output, retries, retryBackoff, retryMaxDelay, quiet } = options;
  const context = await readEnhancedProjectContext(process.cwd());
  
  if (!quiet) {
    console.log(`🔍 Generating core analysis documents...`);
  }
  
  await generateDocumentsWithRetry(context, { 
    includeCategories: ['core-analysis', 'project-charter', 'scope-management', 'risk-management'],
    outputDir: output,
    maxRetries: retries,
    retryBackoff,
    retryMaxDelay
  });
  
  if (!quiet) {
    console.log(`✅ Core analysis document generation complete`);
  }
}

/**
 * Handler for the 'list-templates' command - lists available document templates
 */
export async function handleListTemplatesCommand(): Promise<void> {
  // Show available document generation tasks by category
  const categories = getAvailableCategories();
  console.log('📋 Available Document Templates by Category:\n');
  
  for (const category of categories) {
    const tasks = getTasksByCategory(category);
    console.log(`📁 ${category.toUpperCase()}:`);
    tasks.forEach(task => {
      console.log(`   ${task.emoji} ${task.name} (${task.key})`);
    });
    console.log('');
  }
  
  console.log(`Total: ${GENERATION_TASKS.length} templates available`);
}

// Types for command options
export interface GenerateCategoryOptions {
  output: string;
  quiet?: boolean;
  retries?: number;
  retryBackoff?: number;
  retryMaxDelay?: number;
}

export interface GenerateAllOptions {
  output: string;
  quiet?: boolean;
  retries?: number;
  retryBackoff?: number;
  retryMaxDelay?: number;
}

export interface GenerateCoreOptions {
  output: string;
  quiet?: boolean;
  retries?: number;
  retryBackoff?: number;
  retryMaxDelay?: number;
}
