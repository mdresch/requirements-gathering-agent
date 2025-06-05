/**
 * Main CLI logic for Requirements Gathering Agent
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { 
    getAiSummaryAndGoals,
    getAiUserStories,
    getAiProjectCharter,
    getAiScopeManagementPlan,
    getAiRiskManagementPlan,
    getAiWbs,
    getAiStakeholderRegister
} from './modules/llmProcessor.js';
import { generateMarkdownFile } from './modules/fileUtils.js';

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
}

/**
 * Structure of a generated document
 */
interface GeneratedDocument {
    /** Name of the document (used for file naming) */
    name: string;
    /** Generated content of the document */
    content: string;
}


export async function main(options: GenerationOptions = { 
    outputDir: 'generated-documents',
    quiet: false,
    format: 'markdown',
    retries: 0
}) {
    try {
        if (!options.quiet) {
            console.log('📋 Starting PMBOK document generation...');
        }
        
        // Look for README.md or project description file
        const readmePath = join(process.cwd(), 'README.md');
        let projectContext = '';
        
        if (existsSync(readmePath)) {
            projectContext = readFileSync(readmePath, 'utf-8');
            if (!options.quiet) {
                console.log('✅ Found README.md - using as project context');
            }
        } else {
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

        /**
         * Sleep for specified milliseconds
         */
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        /**
         * Calculate delay for retry attempt using exponential backoff with special handling
         * for the third retry attempt.
         * 
         * Delay progression:
         * - First retry: Exponential backoff starting at 1s, up to 60s
         * - Second retry: Exponential backoff starting at 1s, up to 60s
         * - Third retry: Fixed 2-minute delay to allow AI more processing time
         * 
         * @param attempt - The current retry attempt number (0-based)
         * @returns Delay in milliseconds
         */
        const getRetryDelay = (attempt: number): number => {
            const baseDelay = 1000; // Start with 1 second
            const maxRegularDelay = 60000; // Max 60 seconds for regular retries
            const extendedDelay = 120000; // 2 minutes for third retry
            
            // Special case: Third retry (attempt = 2) gets extended delay
            if (attempt === 2) {
                return extendedDelay;
            }
            
            // Regular exponential backoff with 60s cap for other retries
            const exponentialDelay = baseDelay * Math.pow(2, attempt);
            return Math.min(exponentialDelay, maxRegularDelay);
        };        /**
         * Generate document with retry logic and progress reporting
         */
        const generateWithProgress = async (name: string, generator: (context: string) => Promise<string | null>): Promise<string> => {
            let lastError: Error | null = null;
            let attempt = 0;

            while (attempt <= options.retries) {
                try {
                    if (attempt > 0 && !options.quiet) {
                        console.log(`🔄 Retry attempt ${attempt}/${options.retries} for ${name}...`);
                    } else if (!options.quiet) {
                        console.log(`🤖 Generating ${name}...`);
                    }                    const result = await generator(projectContext);
                    
                    if (!result) {
                        throw new Error(`No content generated for ${name}`);
                    }
                    
                    if (attempt > 0 && !options.quiet) {
                        console.log(`✅ Successfully generated ${name} after ${attempt} retry(ies)`);
                    }
                    
                    return result;

                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    
                    if (attempt < options.retries) {
                        const delay = getRetryDelay(attempt);
                        if (!options.quiet) {
                            console.error(`⚠️ Error generating ${name} (attempt ${attempt + 1}/${options.retries + 1}):`, lastError.message);
                            
                            // Special message for extended delay on 3rd retry
                            if (attempt === 2) {
                                console.log(`⏳ Third retry - Extended wait of 2 minutes to allow AI more processing time...`);
                            } else {
                                console.log(`⏳ Waiting ${delay/1000} seconds before retrying...`);
                            }
                        }
                        await sleep(delay);
                    } else {
                        if (!options.quiet) {
                            console.error(`❌ Failed to generate ${name} after ${options.retries + 1} attempts:`, lastError.message);
                        }
                        throw new Error(`Failed to generate ${name} after ${options.retries + 1} attempts: ${lastError.message}`);
                    }
                }
                
                attempt++;
            }

            // This should never be reached due to the throw in the last catch block
            throw lastError || new Error(`Failed to generate ${name}`);
        };

        // Define document generation tasks
        const documentTasks: Array<{
            name: string;
            displayName: string;
            generator: (context: string) => Promise<string | null>;
        }> = [
            { 
                name: 'project-summary',
                displayName: 'AI Summary and Goals',
                generator: getAiSummaryAndGoals
            },
            { 
                name: 'user-stories',
                displayName: 'User Stories',
                generator: getAiUserStories
            },
            { 
                name: 'project-charter',
                displayName: 'Project Charter',
                generator: getAiProjectCharter
            },
            { 
                name: 'scope-management-plan',
                displayName: 'Scope Management Plan',
                generator: getAiScopeManagementPlan
            },
            { 
                name: 'risk-management-plan',
                displayName: 'Risk Management Plan',
                generator: getAiRiskManagementPlan
            },
            { 
                name: 'work-breakdown-structure',
                displayName: 'Work Breakdown Structure',
                generator: getAiWbs
            },
            { 
                name: 'stakeholder-register',
                displayName: 'Stakeholder Register',
                generator: getAiStakeholderRegister
            }
        ];

        // Track generation results
        const results: {
            successful: GeneratedDocument[];
            failed: Array<{ name: string; error: Error; task: { name: string; displayName: string; generator: (context: string) => Promise<string | null> } }>;
        } = {
            successful: [],
            failed: []
        };

        // Initial generation attempt
        let currentAttempt = 0;        let failedTasks: Array<{ name: string; displayName: string; generator: (context: string) => Promise<string | null> }> = [];
        let tasksForCurrentAttempt: Array<{ name: string; displayName: string; generator: (context: string) => Promise<string | null> }> = [];

        // First attempt - try all documents
        tasksForCurrentAttempt = [...documentTasks];

        while (currentAttempt <= options.retries) {
            const isRetryAttempt = currentAttempt > 0;
            
            if (isRetryAttempt) {
                if (failedTasks.length === 0) {
                    break; // No failed tasks to retry
                }
                
                if (!options.quiet) {
                    console.log(`\n🔄 Retry attempt ${currentAttempt}/${options.retries} for failed documents...`);
                    console.log(`📝 Retrying ${failedTasks.length} failed document(s)...`);
                }
                
                // On retry, only process previously failed tasks
                tasksForCurrentAttempt = [...failedTasks];
                failedTasks = []; // Clear failed tasks for this attempt
            }

            // Process current batch of tasks
            for (const task of tasksForCurrentAttempt) {
                try {
                    if (!options.quiet) {
                        console.log(`${isRetryAttempt ? '🔄' : '🤖'} Generating ${task.displayName}...`);
                    }
                    
                    const content = await generateWithProgress(task.displayName, task.generator);
                    
                    // Add to successful results if not already present
                    if (!results.successful.some(doc => doc.name === task.name)) {
                        results.successful.push({
                            name: task.name,
                            content
                        });
                    }
                    
                    if (isRetryAttempt && !options.quiet) {
                        console.log(`✅ Successfully generated ${task.displayName} on retry attempt ${currentAttempt}`);
                    }
                } catch (error) {
                    const errorObj = error instanceof Error ? error : new Error(String(error));
                    
                    // Add to failed tasks for next retry attempt
                    failedTasks.push(task);
                    
                    // On final retry, add to permanent failed results
                    if (currentAttempt === options.retries) {
                        results.failed.push({
                            name: task.name,
                            error: errorObj,
                            task: task
                        });
                    }
                    
                    if (!options.quiet) {
                        const attemptMsg = isRetryAttempt ? ` (retry attempt ${currentAttempt})` : '';
                        console.error(`⚠️ Failed to generate ${task.displayName}${attemptMsg}: ${errorObj.message}`);
                    }
                }
            }

            // If this was the last retry or no failures, break
            if (currentAttempt >= options.retries || failedTasks.length === 0) {
                break;
            }

            // Prepare for next retry
            const delay = getRetryDelay(currentAttempt);
            if (!options.quiet) {
                console.log(`\n⚠️ ${failedTasks.length} document(s) failed to generate`);
                if (currentAttempt === 2) {
                    console.log(`⏳ Third retry - Extended wait of 2 minutes to allow AI more processing time...`);
                } else {
                    console.log(`⏳ Waiting ${delay/1000} seconds before retrying failed documents...`);
                }
            }
            
            await sleep(delay);
            currentAttempt++;
        }

        // Report generation summary
        if (!options.quiet) {
            console.log('\n📊 Document Generation Summary:');
            console.log(`✅ Successfully generated: ${results.successful.length} documents`);
            if (results.failed.length > 0) {
                console.log(`❌ Failed to generate: ${results.failed.length} documents`);
            }
        }

        // Save successful documents
        if (results.successful.length > 0) {
            if (!options.quiet) console.log('\n💾 Saving generated documents...');
              for (const doc of results.successful) {
                const filePath = join(options.outputDir, `${doc.name}.${options.format}`);
                await generateMarkdownFile(doc.name, doc.content);
                if (!options.quiet) console.log(`✅ Generated: ${filePath}`);
            }
        }

        // Report failures in detail
        if (results.failed.length > 0) {
            if (!options.quiet) {
                console.log('\n❌ Failed Documents:');
                for (const failure of results.failed) {
                    console.error(`  • ${failure.name}: ${failure.error.message}`);
                }
            }
            
            // If all documents failed, throw error
            if (results.successful.length === 0) {
                throw new Error('All document generations failed. Check the error messages above for details.');
            }
        }

        if (!options.quiet) {
            console.log('🎉 Document generation completed successfully!');
            console.log(`📁 Check ${options.outputDir}/ for generated files`);
        }

    } catch (error) {
        if (!options.quiet) console.error('❌ Error in document generation:', error);
        throw error;
    }
}