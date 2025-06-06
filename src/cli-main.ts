/**
 * Main CLI logic for Requirements Gathering Agent
 * Rewritten to integrate with enhanced project analyzer and modern document generation
 * Version: 2.1.2
 */

import { 
    DocumentGenerator, 
    generateAllDocuments, 
    generateDocumentsWithRetry,
    getAvailableCategories
} from './modules/documentGenerator.js';
import { readEnhancedProjectContext } from './modules/fileManager.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Options for document generation
 */
interface GenerationOptions {
    /** Output directory for generated documents */
    outputDir: string;
    /** Whether to suppress progress messages */
    quiet: boolean;
    /** Output format (markdown, json, yaml) */
    format: string;
    /** Number of retry attempts for failed generations */
    retries: number;
    /** Categories to generate */
    categories?: string[];
    /** Whether to enable PMBOK validation */
    validatePmbok?: boolean;
    /** Whether to generate with comprehensive validation */
    generateWithValidation?: boolean;
    /** Whether to validate only (no generation) */
    validateOnly?: boolean;
    /** Whether to check consistency only */
    validateConsistency?: boolean;
    /** Whether to provide quality assessment */
    qualityAssessment?: boolean;
}

/**
 * Validates environment configuration for AI providers
 */
async function validateEnvironment(): Promise<boolean> {
    try {
        // Check for required environment variables based on provider
        const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
        const googleKey = process.env.GOOGLE_AI_API_KEY;
        const githubToken = process.env.GITHUB_TOKEN;
        const azureKey = process.env.AZURE_AI_API_KEY;
        
        if (googleKey) {
            console.log('✅ Google AI configuration detected');
            return true;
        }
        
        if (endpoint && endpoint.includes('openai.azure.com')) {
            if (process.env.USE_ENTRA_ID === 'true') {
                console.log('✅ Azure OpenAI with Entra ID configuration detected');
                return true;
            } else if (azureKey) {
                console.log('✅ Azure OpenAI with API key configuration detected');
                return true;
            }
        }
        
        if (githubToken) {
            console.log('✅ GitHub AI configuration detected');
            return true;
        }
        
        console.error('❌ No valid AI provider configuration found. Please check your .env file.');
        console.error('   Supported providers: Google AI, Azure OpenAI, GitHub AI');
        return false;
    } catch (error) {
        console.error('❌ Error validating environment:', error);
        return false;
    }
}

export const VERSION = '2.1.2';

export async function main(options: GenerationOptions = { 
    outputDir: 'generated-documents',
    quiet: false,
    format: 'markdown',
    retries: 0
}) {
    try {
        // Show version if requested
        if ((options as any).version) {
            console.log(`Requirements Gathering Agent v${VERSION}`);
            return;
        }

        // Validate environment first
        const isValidEnv = await validateEnvironment();
        if (!isValidEnv) {
            throw new Error('Environment validation failed');
        }

        if (!options.quiet) {
            console.log(`📋 Starting PMBOK document generation with modern DocumentGenerator (v${VERSION})...`);
        }

        // Use enhanced project context reader
        let projectContext: string;
        try {
            projectContext = await readEnhancedProjectContext(process.cwd());
            if (!options.quiet) {
                console.log('✅ Enhanced project context loaded successfully');
            }
        } catch (error) {
            console.warn('⚠️ Could not read enhanced project context, using basic README.md');
            
            // Fallback to basic README.md reading
            const readmePath = path.join(process.cwd(), 'README.md');
            if (fs.existsSync(readmePath)) {
                projectContext = fs.readFileSync(readmePath, 'utf-8');
                if (!options.quiet) {
                    console.log('✅ Found README.md - using as project context');
                }
            } else {
                // Default sample project context
                projectContext = `
# Sample Project
A comprehensive software project requiring PMBOK documentation.

## Features
- User management system
- Data processing capabilities
- Web-based dashboard
- API integration

## Technology Stack
- TypeScript/Node.js backend
- React frontend
- PostgreSQL database
- Azure cloud deployment
                `.trim();
                if (!options.quiet) {
                    console.log('📝 Using default project context (no README.md found)');
                }
            }
        }

        // Handle validation-only modes
        if (options.validateOnly) {
            return await handleValidationOnly(projectContext, options);
        }

        if (options.validateConsistency) {
            return await handleConsistencyValidation(projectContext, options);
        }

        // Handle different generation modes using modern DocumentGenerator
        if (options.generateWithValidation || options.validatePmbok) {
            return await handleGenerationWithValidation(projectContext, options);
        }

        if (options.categories && options.categories.length > 0) {
            return await handleCategoryGeneration(projectContext, options);
        }

        // Default: Generate all documents
        return await handleFullGeneration(projectContext, options);

    } catch (error) {
        if (!options.quiet) {
            console.error('❌ Error in main CLI function:', error);
        }
        throw error;
    }
}

/**
 * Handle validation-only mode
 */
async function handleValidationOnly(context: string, options: GenerationOptions) {
    if (!options.quiet) {
        console.log('🔍 Validating existing documents...');
    }
    
    const generator = new DocumentGenerator(context);
    const validation = await generator.validateGeneration();
    
    console.log('\n📋 Validation Results:');
    console.log(`📁 Documents Complete: ${validation.isComplete ? 'Yes' : 'No'}`);
    
    if (!validation.isComplete) {
        console.log('\n❌ Missing Documents:');
        validation.missing.forEach(doc => console.log(`   • ${doc}`));
    }
    
    if (validation.errors.length > 0) {
        console.log('\n⚠️ Validation Errors:');
        validation.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    return validation.isComplete;
}

/**
 * Handle consistency validation mode
 */
async function handleConsistencyValidation(context: string, options: GenerationOptions) {
    if (!options.quiet) {
        console.log('🔍 Checking cross-document consistency...');
    }
    
    const generator = new DocumentGenerator(context);
    const pmbokCompliance = await generator.validatePMBOKCompliance();
    
    console.log('\n📊 Consistency Results:');
    console.log(`🎯 Consistency Score: ${pmbokCompliance.consistencyScore}/100`);
    console.log(`📊 PMBOK Compliance: ${pmbokCompliance.compliance ? 'Compliant' : 'Non-compliant'}`);
    
    return pmbokCompliance.compliance;
}

/**
 * Handle generation with comprehensive validation
 */
async function handleGenerationWithValidation(context: string, options: GenerationOptions) {
    if (!options.quiet) {
        console.log('🎯 Generating all documents with PMBOK 7.0 validation...');
    }
    
    const result = await DocumentGenerator.generateAllWithPMBOKValidation(context);
    
    if (result.result.success) {
        console.log(`✅ Successfully generated ${result.result.successCount} documents with validation`);
        console.log(`📁 Check the ${options.outputDir}/ directory for organized output`);
    } else {
        console.error(`❌ Generation completed with ${result.result.failureCount} failures`);
        result.result.errors.forEach((error: { task: string; error: string }) => {
            console.error(`   • ${error.task}: ${error.error}`);
        });
    }
    
    return result.result.success;
}

/**
 * Handle category-specific generation
 */
async function handleCategoryGeneration(context: string, options: GenerationOptions) {
    if (!options.quiet) {
        console.log(`📂 Generating documents for categories: ${options.categories!.join(', ')}`);
    }
    
    const generator = new DocumentGenerator(context, {
        includeCategories: options.categories!,
        continueOnError: true,
        generateIndex: true,
        cleanup: true
    });
    
    const result = await generator.generateAll();
    
    if (result.success) {
        console.log(`✅ Successfully generated ${result.successCount} documents for selected categories`);
        console.log(`📁 Check the ${options.outputDir}/ directory for organized output`);
    } else {
        console.error(`❌ Generation completed with ${result.failureCount} failures`);
        result.errors.forEach((error: { task: string; error: string }) => {
            console.error(`   • ${error.task}: ${error.error}`);
        });
    }
    
    return result.success;
}

/**
 * Handle full generation of all documents
 */
async function handleFullGeneration(context: string, options: GenerationOptions) {
    if (!options.quiet) {
        console.log('📚 Generating all PMBOK documents...');
    }
    
    if (options.retries > 0) {
        // Use retry mechanism
        const result = await generateDocumentsWithRetry(context, {
            maxRetries: options.retries,
            continueOnError: true,
            generateIndex: true,
            cleanup: true
        });
        
        console.log(`✅ Generation completed: ${result.successCount} successful, ${result.failureCount} failed`);
        return result.successCount > 0;
    } else {
        // Use standard generation
        const generator = new DocumentGenerator(context, {
            continueOnError: true,
            generateIndex: true,
            cleanup: true
        });
        
        const result = await generator.generateAll();
        
        if (result.success) {
            console.log(`✅ Successfully generated all ${result.successCount} documents`);
            console.log(`📁 Check the ${options.outputDir}/ directory for organized output`);
        } else {
            console.error(`❌ Generation completed with ${result.failureCount} failures`);
            result.errors.forEach((error: { task: string; error: string }) => {
                console.error(`   • ${error.task}: ${error.error}`);
            });
        }
        
        return result.success;
    }
}

/**
 * Get available document categories
 */
export function getDocumentCategories(): string[] {
    return getAvailableCategories();
}

/**
 * Display help information about available categories
 */
export function displayCategoryHelp() {
    console.log('\n📂 Available Document Categories:');
    const categories = getAvailableCategories();
    categories.forEach(category => {
        console.log(`   • ${category}`);
    });
    console.log('\nUse --categories to specify which categories to generate.');
    console.log('Example: --categories core-analysis,management-plans');
}