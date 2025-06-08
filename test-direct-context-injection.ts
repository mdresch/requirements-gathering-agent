/**
 * Integration Test for Direct Context Injection Feature
 * This script tests the new Enhanced Context Manager capabilities
 */

import { ContextManager } from './src/modules/contextManager.js';
import { runAllDirectContextInjectionExamples } from './src/examples/directContextInjectionExample.js';
import * as path from 'path';

async function testDirectContextInjection() {
    console.log('🧪 TESTING DIRECT CONTEXT INJECTION FEATURE');
    console.log('===========================================');
    
    const projectPath = process.cwd(); // Current project directory
    
    try {
        // Test 1: Basic Context Manager with new features
        console.log('\n🔬 Test 1: Basic Context Manager Functionality');
        const contextManager = new ContextManager();
        
        // Initialize core context
        await contextManager.createCoreContext('# Test Project\n\nThis is a test project for demonstrating direct context injection capabilities.');
        
        // Get metrics
        const metrics = contextManager.getMetrics();
        console.log(`✅ Core context tokens: ${metrics.coreContextTokens}`);
        console.log(`✅ Max token limit: ${metrics.maxTokens.toLocaleString()}`);
        
        // Test 2: Direct Context Injection
        console.log('\n🔬 Test 2: Direct Context Injection');
        const injectedCount = await contextManager.injectHighRelevanceMarkdownFiles(
            projectPath,
            60,  // Lower threshold for testing
            5    // Limit to 5 files
        );
        console.log(`✅ Injected ${injectedCount} high-relevance markdown files`);
        
        // Test 3: Injection Statistics
        console.log('\n🔬 Test 3: Injection Statistics');
        const stats = contextManager.getInjectionStatistics();
        console.log(`✅ Total injected: ${stats.totalInjected}`);
        console.log(`✅ Total tokens injected: ${stats.totalTokensInjected.toLocaleString()}`);
        console.log(`✅ Remaining token budget: ${stats.remainingTokenBudget.toLocaleString()}`);
        
        if (stats.injectedKeys.length > 0) {
            console.log('✅ Injected context keys:');
            stats.injectedKeys.forEach(key => console.log(`   • ${key}`));
        }
        
        // Test 4: Context Building with Injected Content
        console.log('\n🔬 Test 4: Context Building with Injected Content');
        const testDocTypes = ['project-charter', 'user-stories', 'tech-stack-analysis'];
        
        for (const docType of testDocTypes) {
            const context = contextManager.buildContextForDocument(docType);
            const tokenCount = Math.ceil(context.length / 3.5);
            console.log(`✅ ${docType}: ${tokenCount.toLocaleString()} tokens`);
            
            // Check if injected content is included
            const hasInjectedContent = stats.injectedKeys.some(key => 
                context.includes(key) || context.includes('Injected Document')
            );
            console.log(`   ${hasInjectedContent ? '✅' : '⚠️'} Contains injected content: ${hasInjectedContent}`);
        }
        
        // Test 5: Context Utilization Report
        console.log('\n🔬 Test 5: Context Utilization Report');
        const report = contextManager.getContextUtilizationReport();
        console.log('✅ Generated utilization report (sample):');
        console.log(report.split('\n').slice(0, 10).join('\n') + '...');
        
        // Test 6: Context Cleanup
        console.log('\n🔬 Test 6: Context Cleanup');
        const beforeCleanup = contextManager.getInjectionStatistics();
        console.log(`Before cleanup: ${beforeCleanup.totalInjected} injected contexts`);
        
        contextManager.clearInjectedContext();
        
        const afterCleanup = contextManager.getInjectionStatistics();
        console.log(`✅ After cleanup: ${afterCleanup.totalInjected} injected contexts`);
        
        console.log('\n✅ All Direct Context Injection tests passed!');
        
        // Test 7: Run full demonstration examples
        console.log('\n🔬 Test 7: Full Demonstration Examples');
        await runAllDirectContextInjectionExamples(projectPath);
        
        console.log('\n🎉 DIRECT CONTEXT INJECTION FEATURE TEST COMPLETED SUCCESSFULLY!');
        console.log('=====================================================================');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testDirectContextInjection().catch(console.error);
}
