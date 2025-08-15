/**
 * Prompts CLI Command
 * 
 * Command-line interface for managing and testing the enhanced prompt engineering system.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * 
 * @filepath src/commands/prompts.ts
 */

import { Command } from 'commander';
import { 
    initializePromptSystem, 
    getPromptSystemStatus,
    EnhancedAIProcessor,
    PromptManager,
    PromptRegistry
} from '../modules/ai/prompts/index.js';

/**
 * Create prompts command
 */
export function createPromptsCommand(): Command {
    const command = new Command('prompts');
    command.description('Manage and test the enhanced prompt engineering system');

    // List available document types
    command
        .command('list')
        .description('List available document types and categories')
        .option('-c, --category <category>', 'Filter by category')
        .option('-v, --verbose', 'Show detailed information')
        .action(async (options) => {
            try {
                console.log('🎯 Enhanced Prompt Engineering System\n');
                
                const status = getPromptSystemStatus();
                
                if (!status.isInitialized) {
                    console.log('❌ Prompt system not initialized');
                    return;
                }

                console.log(`📊 System Status:`);
                console.log(`   Available Document Types: ${status.availableDocumentTypes.length}`);
                console.log(`   Available Categories: ${status.availableCategories.length}`);
                
                if (status.performanceMetrics) {
                    const metrics = status.performanceMetrics;
                    console.log(`   Total Generations: ${metrics.totalGenerations}`);
                    console.log(`   Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
                    console.log(`   Average Quality Score: ${metrics.averageQualityScore.toFixed(1)}`);
                }

                console.log('\n📚 Available Categories:');
                for (const category of status.availableCategories) {
                    console.log(`   • ${category}`);
                }

                if (options.category) {
                    const promptRegistry = PromptRegistry.getInstance();
                    const categoryPrompts = promptRegistry.getPromptsByCategory(options.category);
                    
                    console.log(`\n🏷️ Document Types in "${options.category}" category:`);
                    for (const prompt of categoryPrompts) {
                        console.log(`   • ${prompt.documentType} (v${prompt.version})`);
                        if (options.verbose) {
                            console.log(`     Tags: ${prompt.tags.join(', ')}`);
                            console.log(`     Max Tokens: ${prompt.maxTokens}`);
                            console.log(`     Priority: ${prompt.priority}`);
                        }
                    }
                } else {
                    console.log('\n📄 Available Document Types:');
                    const grouped = groupDocumentTypesByCategory(status.availableDocumentTypes, status.availableCategories);
                    
                    for (const [category, types] of Object.entries(grouped)) {
                        console.log(`\n   ${category.toUpperCase()}:`);
                        for (const type of types) {
                            console.log(`     • ${type}`);
                        }
                    }
                }

            } catch (error: any) {
                console.error('❌ Error listing prompts:', error.message);
                process.exit(1);
            }
        });

    // Test prompt for document type
    command
        .command('test <documentType>')
        .description('Test prompt generation for a specific document type')
        .option('-c, --context <context>', 'Custom project context for testing', 'Sample project for testing prompt generation')
        .option('-v, --verbose', 'Show detailed test results')
        .action(async (documentType, options) => {
            try {
                console.log(`🧪 Testing prompt for document type: ${documentType}\n`);
                
                const { enhancedProcessor } = initializePromptSystem();
                
                const testResult = await enhancedProcessor.testPromptForDocumentType(
                    documentType,
                    options.context
                );

                if (!testResult.promptFound) {
                    console.log('❌ No prompt found for document type:', documentType);
                    console.log('\n💡 Available document types:');
                    const availableTypes = enhancedProcessor.getAvailableDocumentTypes();
                    for (const type of availableTypes.slice(0, 10)) {
                        console.log(`   • ${type}`);
                    }
                    if (availableTypes.length > 10) {
                        console.log(`   ... and ${availableTypes.length - 10} more`);
                    }
                    return;
                }

                console.log('✅ Prompt found and tested successfully!');
                
                if (options.verbose && testResult.promptDetails) {
                    console.log('\n📊 Prompt Details:');
                    console.log(`   Prompt Length: ${testResult.promptDetails.promptLength} characters`);
                    if (testResult.promptDetails.metrics) {
                        console.log(`   Selection Time: ${testResult.promptDetails.metrics.selectionTime}ms`);
                        console.log(`   Context Build Time: ${testResult.promptDetails.metrics.contextBuildTime}ms`);
                        console.log(`   Context Sources: ${testResult.promptDetails.metrics.contextSources}`);
                    }
                }

                if (testResult.testGeneration) {
                    const result = testResult.testGeneration;
                    console.log('\n🎯 Test Generation Results:');
                    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
                    
                    if (result.success) {
                        console.log(`   Content Length: ${result.content.length} characters`);
                        if (result.qualityScore !== undefined) {
                            console.log(`   Quality Score: ${result.qualityScore}/100`);
                        }
                        
                        if (result.warnings && result.warnings.length > 0) {
                            console.log('   Warnings:');
                            for (const warning of result.warnings) {
                                console.log(`     ⚠️ ${warning}`);
                            }
                        }

                        if (options.verbose) {
                            console.log('\n📝 Generated Content Preview:');
                            const preview = result.content.substring(0, 300);
                            console.log(preview + (result.content.length > 300 ? '...' : ''));
                        }
                    } else {
                        console.log(`   Error: ${result.error}`);
                    }
                }

            } catch (error: any) {
                console.error('❌ Error testing prompt:', error.message);
                process.exit(1);
            }
        });

    // Show performance analytics
    command
        .command('analytics')
        .description('Show performance analytics for the prompt system')
        .option('-d, --document-type <type>', 'Show analytics for specific document type')
        .action(async (options) => {
            try {
                console.log('📊 Prompt System Performance Analytics\n');
                
                const { enhancedProcessor } = initializePromptSystem();
                const analytics = enhancedProcessor.getPerformanceAnalytics();

                console.log('📈 Overall Performance:');
                console.log(`   Total Generations: ${analytics.totalGenerations}`);
                console.log(`   Success Rate: ${(analytics.successRate * 100).toFixed(1)}%`);
                console.log(`   Average Quality Score: ${analytics.averageQualityScore.toFixed(1)}/100`);
                console.log(`   Average Response Time: ${analytics.averageResponseTime.toFixed(0)}ms`);

                if (analytics.topPerformingDocumentTypes.length > 0) {
                    console.log('\n🏆 Top Performing Document Types:');
                    for (const [index, type] of analytics.topPerformingDocumentTypes.entries()) {
                        console.log(`   ${index + 1}. ${type}`);
                    }
                }

                if (analytics.commonWarnings.length > 0) {
                    console.log('\n⚠️ Most Common Warnings:');
                    for (const [index, warning] of analytics.commonWarnings.entries()) {
                        console.log(`   ${index + 1}. ${warning}`);
                    }
                }

                if (options.documentType) {
                    const history = enhancedProcessor.getGenerationHistory(options.documentType);
                    if (Array.isArray(history) && history.length > 0) {
                        console.log(`\n📋 History for "${options.documentType}":`);
                        console.log(`   Total Attempts: ${history.length}`);
                        const successful = history.filter(h => h.success).length;
                        console.log(`   Successful: ${successful}/${history.length} (${(successful/history.length*100).toFixed(1)}%)`);
                        
                        const avgQuality = history
                            .filter(h => h.qualityScore !== undefined)
                            .reduce((sum, h) => sum + (h.qualityScore || 0), 0) / history.length;
                        if (avgQuality > 0) {
                            console.log(`   Average Quality: ${avgQuality.toFixed(1)}/100`);
                        }
                    } else {
                        console.log(`\n📋 No history found for "${options.documentType}"`);
                    }
                }

            } catch (error: any) {
                console.error('❌ Error showing analytics:', error.message);
                process.exit(1);
            }
        });

    // Initialize or reset the prompt system
    command
        .command('init')
        .description('Initialize or reset the prompt engineering system')
        .option('--reset', 'Reset all cached data and metrics')
        .action(async (options) => {
            try {
                console.log('🚀 Initializing Enhanced Prompt Engineering System...\n');
                
                const { promptRegistry, promptManager, enhancedProcessor } = initializePromptSystem();

                if (options.reset) {
                    console.log('🔄 Resetting cached data...');
                    enhancedProcessor.clearHistory();
                    promptManager.clearMetrics();
                }

                const status = getPromptSystemStatus();
                
                console.log('✅ Initialization complete!');
                console.log(`📚 Loaded ${status.availableDocumentTypes.length} document types`);
                console.log(`🏷️ Loaded ${status.availableCategories.length} categories`);
                
                console.log('\n🎯 System is ready for enhanced AI content generation!');

            } catch (error: any) {
                console.error('❌ Error initializing prompt system:', error.message);
                process.exit(1);
            }
        });

    return command;
}

/**
 * Group document types by category for display
 */
function groupDocumentTypesByCategory(
    documentTypes: string[], 
    categories: string[]
): Record<string, string[]> {
    const promptRegistry = PromptRegistry.getInstance();
    const grouped: Record<string, string[]> = {};

    // Initialize categories
    for (const category of categories) {
        grouped[category] = [];
    }

    // Group document types
    for (const docType of documentTypes) {
        const prompt = promptRegistry.getPromptByDocumentType(docType);
        if (prompt) {
            if (!grouped[prompt.category]) {
                grouped[prompt.category] = [];
            }
            grouped[prompt.category].push(docType);
        } else {
            // Fallback category for unmatched types
            if (!grouped['other']) {
                grouped['other'] = [];
            }
            grouped['other'].push(docType);
        }
    }

    // Remove empty categories
    for (const [category, types] of Object.entries(grouped)) {
        if (types.length === 0) {
            delete grouped[category];
        }
    }

    return grouped;
}