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


import type { CommandModule } from 'yargs';
import {
    initializePromptSystem,
    getPromptSystemStatus,
    PromptManager,
    PromptRegistry
} from '../modules/ai/prompts/index.js';

export const promptsCommand: CommandModule = {
    command: 'prompts',
    describe: 'Manage and test the enhanced prompt engineering system',
    builder: (yargs) =>
        yargs
            .command({
                command: 'list',
                describe: 'List available document types and categories',
                builder: {
                    category: { type: 'string', describe: 'Filter by category' },
                    verbose: { type: 'boolean', describe: 'Show detailed information' }
                },
                handler: async (argv) => {
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
                        if (argv.category) {
                            const promptRegistry = PromptRegistry.getInstance();
                            const categoryPrompts = promptRegistry.getPromptsByCategory(argv.category);
                            console.log(`\n🏷️ Document Types in "${argv.category}" category:`);
                            for (const prompt of categoryPrompts) {
                                console.log(`   • ${prompt.documentType} (v${prompt.version})`);
                                if (argv.verbose) {
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
                }
            })
            .command({
                command: 'test <documentType>',
                describe: 'Test prompt generation for a specific document type',
                builder: {
                    context: { type: 'string', default: 'Sample project for testing prompt generation', describe: 'Custom project context for testing' },
                    verbose: { type: 'boolean', describe: 'Show detailed test results' }
                },
                handler: async (argv) => {
                    try {
                        const documentType = argv.documentType as string;
                        console.log(`🧪 Testing prompt for document type: ${documentType}\n`);
                        const { enhancedProcessor } = initializePromptSystem();
                        const testResult = await enhancedProcessor.testPromptForDocumentType(
                            documentType,
                            argv.context as string
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
                        if (argv.verbose && testResult.promptDetails) {
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
                                if (argv.verbose) {
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
                }
            })
            .command({
                command: 'analytics',
                describe: 'Show performance analytics for the prompt system',
                builder: {
                    documentType: { type: 'string', describe: 'Show analytics for specific document type' }
                },
                handler: async (argv) => {
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
                        if (argv.documentType) {
                            const history = enhancedProcessor.getGenerationHistory(argv.documentType as string);
                            if (Array.isArray(history) && history.length > 0) {
                                console.log(`\n📋 History for "${argv.documentType}":`);
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
                                console.log(`\n📋 No history found for "${argv.documentType}"`);
                            }
                        }
                    } catch (error: any) {
                        console.error('❌ Error showing analytics:', error.message);
                        process.exit(1);
                    }
                }
            })
            .command({
                command: 'init',
                describe: 'Initialize or reset the prompt engineering system',
                builder: {
                    reset: { type: 'boolean', describe: 'Reset all cached data and metrics' }
                },
                handler: async (argv) => {
                    try {
                        console.log('🚀 Initializing Enhanced Prompt Engineering System...\n');
                        const { promptRegistry, promptManager, enhancedProcessor } = initializePromptSystem();
                        if (argv.reset) {
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
                }
            })
            .demandCommand(1, 'You must provide a valid prompts command.'),
    handler: () => {} // No-op, subcommands handle everything
};

// Removed duplicate implementation of groupDocumentTypesByCategory

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