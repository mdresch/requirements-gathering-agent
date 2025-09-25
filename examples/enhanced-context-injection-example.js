/**
 * Enhanced Context Injection Example
 * Demonstrates how the system now utilizes large context windows
 * to load all available project documents for comprehensive generation.
 */

import { EnhancedContextInjectionService } from '../src/services/EnhancedContextInjectionService.js';
import { ContextWindowValidationService } from '../src/services/ContextWindowValidationService.js';

async function demonstrateEnhancedContextInjection() {
    console.log('🚀 Enhanced Context Injection Example\n');

    // Initialize services
    const contextInjectionService = EnhancedContextInjectionService.getInstance();
    const contextValidator = ContextWindowValidationService.getInstance();

    // Example 1: Check available context window capacity
    console.log('📊 Example 1: Context Window Capacity Analysis');
    console.log('=============================================');

    const optimalProvider = await contextValidator.getOptimalProviderForLargeContext();
    
    if (optimalProvider) {
        console.log(`✅ Optimal provider found: ${optimalProvider.provider}/${optimalProvider.model}`);
        console.log(`   Context window: ${optimalProvider.contextWindow.toLocaleString()} tokens`);
        console.log(`   Input capacity: ${optimalProvider.inputTokens.toLocaleString()} tokens`);
        console.log(`   Output capacity: ${optimalProvider.outputTokens.toLocaleString()} tokens`);
        console.log(`   Cost per 1K tokens: $${optimalProvider.costPer1KTokens}`);
    } else {
        console.log('❌ No provider with large context window available');
    }

    // Example 2: Enhanced context injection for different scenarios
    console.log('\n\n📚 Example 2: Enhanced Context Injection Scenarios');
    console.log('==================================================');

    const projectId = '68cf79515c797b952fbb7bec';
    
    // Scenario 1: Full context loading (for comprehensive documents)
    console.log('\n🔍 Scenario 1: Full Context Loading');
    console.log('-----------------------------------');
    
    const fullContextResult = await contextInjectionService.injectAllProjectDocuments(projectId, {
        targetDocumentType: 'comprehensive-project-plan',
        maxUtilizationPercentage: 95, // Use 95% of available context window
        enableIntelligentPrioritization: true,
        enableContentSummarization: false, // Keep full content
        enableChunking: true,
        preserveCriticalContext: true,
        includeStakeholders: true,
        includeComplianceData: true
    });

    console.log(`📈 Full Context Loading Result:`);
    console.log(`   Success: ${fullContextResult.success ? '✅' : '❌'}`);
    console.log(`   Strategy: ${fullContextResult.strategy}`);
    console.log(`   Documents loaded: ${fullContextResult.documentsLoaded}/${fullContextResult.totalDocuments}`);
    console.log(`   Tokens used: ${fullContextResult.totalTokensUsed.toLocaleString()}`);
    console.log(`   Utilization: ${fullContextResult.contextWindowUtilization.toFixed(1)}%`);
    
    if (fullContextResult.warnings) {
        console.log(`   Warnings: ${fullContextResult.warnings.join(', ')}`);
    }

    // Scenario 2: Prioritized context loading (for focused documents)
    console.log('\n🔍 Scenario 2: Prioritized Context Loading');
    console.log('------------------------------------------');
    
    const prioritizedResult = await contextInjectionService.injectAllProjectDocuments(projectId, {
        targetDocumentType: 'technical-specification',
        maxUtilizationPercentage: 80, // Use 80% of available context window
        enableIntelligentPrioritization: true,
        enableContentSummarization: true, // Summarize non-critical content
        enableChunking: false,
        preserveCriticalContext: true,
        includeStakeholders: false,
        includeComplianceData: true
    });

    console.log(`📈 Prioritized Context Loading Result:`);
    console.log(`   Success: ${prioritizedResult.success ? '✅' : '❌'}`);
    console.log(`   Strategy: ${prioritizedResult.strategy}`);
    console.log(`   Documents loaded: ${prioritizedResult.documentsLoaded}/${prioritizedResult.totalDocuments}`);
    console.log(`   Tokens used: ${prioritizedResult.totalTokensUsed.toLocaleString()}`);
    console.log(`   Utilization: ${prioritizedResult.contextWindowUtilization.toFixed(1)}%`);

    // Scenario 3: Efficient context loading (for simple documents)
    console.log('\n🔍 Scenario 3: Efficient Context Loading');
    console.log('------------------------------------------');
    
    const efficientResult = await contextInjectionService.injectAllProjectDocuments(projectId, {
        targetDocumentType: 'user-stories',
        maxUtilizationPercentage: 60, // Use 60% of available context window
        enableIntelligentPrioritization: true,
        enableContentSummarization: true,
        enableChunking: true,
        preserveCriticalContext: false,
        includeStakeholders: true,
        includeComplianceData: false
    });

    console.log(`📈 Efficient Context Loading Result:`);
    console.log(`   Success: ${efficientResult.success ? '✅' : '❌'}`);
    console.log(`   Strategy: ${efficientResult.strategy}`);
    console.log(`   Documents loaded: ${efficientResult.documentsLoaded}/${efficientResult.totalDocuments}`);
    console.log(`   Tokens used: ${efficientResult.totalTokensUsed.toLocaleString()}`);
    console.log(`   Utilization: ${efficientResult.contextWindowUtilization.toFixed(1)}%`);

    // Example 3: Context injection strategies comparison
    console.log('\n\n📊 Example 3: Context Injection Strategies Comparison');
    console.log('====================================================');

    const strategies = [
        { name: 'Full Load', utilization: 95, summarization: false, chunking: false },
        { name: 'Prioritized Load', utilization: 80, summarization: true, chunking: false },
        { name: 'Chunked Load', utilization: 90, summarization: false, chunking: true },
        { name: 'Summarized Load', utilization: 70, summarization: true, chunking: false }
    ];

    for (const strategy of strategies) {
        console.log(`\n🔍 Testing ${strategy.name} Strategy:`);
        
        const result = await contextInjectionService.injectAllProjectDocuments(projectId, {
            targetDocumentType: 'benefits-realization-plan',
            maxUtilizationPercentage: strategy.utilization,
            enableIntelligentPrioritization: true,
            enableContentSummarization: strategy.summarization,
            enableChunking: strategy.chunking,
            preserveCriticalContext: true,
            includeStakeholders: true,
            includeComplianceData: true
        });

        console.log(`   Documents: ${result.documentsLoaded}/${result.totalDocuments}`);
        console.log(`   Tokens: ${result.totalTokensUsed.toLocaleString()}`);
        console.log(`   Utilization: ${result.contextWindowUtilization.toFixed(1)}%`);
        console.log(`   Strategy Used: ${result.strategy}`);
    }

    // Example 4: Benefits of large context windows
    console.log('\n\n🎯 Example 4: Benefits of Large Context Windows');
    console.log('===============================================');

    console.log('\n📈 Before Enhancement (Standard Context Window):');
    console.log('   Context window: Standard (2,400 tokens)');
    console.log('   Documents loaded: 1/8 (12.5%)');
    console.log('   Utilization: 76.5%');
    console.log('   Strategy: Conservative token management');
    console.log('   Result: Limited context, potential information loss');

    console.log('\n📈 After Enhancement (Large Context Window):');
    console.log('   Context window: Large (2,000,000 tokens)');
    console.log('   Documents loaded: 8/8 (100%)');
    console.log('   Utilization: 0.1%');
    console.log('   Strategy: Full context loading');
    console.log('   Result: Comprehensive context, rich document generation');

    console.log('\n🎉 Enhanced Context Injection Example Complete!');
    console.log('\nKey Benefits:');
    console.log('✅ Loads ALL available project documents');
    console.log('✅ Utilizes large context windows effectively');
    console.log('✅ Intelligent prioritization and optimization');
    console.log('✅ Multiple fallback strategies');
    console.log('✅ Comprehensive context for better generation');
}

// Run the example
demonstrateEnhancedContextInjection().catch(console.error);
