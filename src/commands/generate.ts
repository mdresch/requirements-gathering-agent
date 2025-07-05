/**
 * Generate Command Handler
 * Handles document generation commands including single document, category, and all documents
 */

// 1. Node.js built-ins (none in this file)

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
import { SupportedFormat } from '../constants.js';
import { 
  ValidationError, 
  validateOutputDirectory, 
  validateFormat, 
  validateRetryCount, 
  validateRetryBackoff, 
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
    validateOutputDirectory(options.output);
    validateFormat(options.format);
    if (options.retries !== undefined) validateRetryCount(options.retries);
    if (options.retryBackoff !== undefined) validateRetryBackoff(options.retryBackoff);
    
    const { output, format, quiet } = options;
    const context = await readEnhancedProjectContext(process.cwd());
    const generator = new DocumentGenerator(context, { outputDir: output, format });
    
    if (!quiet) {
      console.log(`🔍 Generating document: ${key} in ${format} format...`);
    }
    
    await generator.generateOne(key);
    
    if (!quiet) {
      console.log(`✅ Document generation complete`);
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
 * Handler for the 'generate-category' command - generates all documents in a category
 */
export async function handleGenerateCategoryCommand(category: string, options: GenerateCategoryOptions): Promise<void> {
  try {
    // Validate inputs
    validateCategory(category);
    validateOutputDirectory(options.output);
    if (options.retries !== undefined) validateRetryCount(options.retries);
    if (options.retryBackoff !== undefined) validateRetryBackoff(options.retryBackoff);
    
    const { output, retries, retryBackoff, retryMaxDelay, quiet } = options;
    const context = await readEnhancedProjectContext(process.cwd());
    
    if (!quiet) {
      console.log(`🔍 Generating all documents in category: ${category}...`);
    }
    
    await generateDocumentsWithRetry(context, { 
      includeCategories: [category], 
      outputDir: output,
      maxRetries: retries,
      retryBackoff,
      retryMaxDelay
    });
    
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
export interface GenerateOptions {
  output: string;
  format: SupportedFormat;
  quiet?: boolean;
  retries?: number;
  retryBackoff?: number;
  retryMaxDelay?: number;
}

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
