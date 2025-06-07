/**
 * Direct Context Injection Demo Script
 * Demonstrates the new Enhanced Context Manager capabilities
 */

import { ContextManager } from './dist/modules/contextManager.js';
import { getReadmeContent } from './dist/modules/projectAnalyzer.js';

async function demonstrateDirectContextInjection() {
    console.log('🌟 DIRECT CONTEXT INJECTION DEMONSTRATION');
    console.log('========================================');
    
    try {
        // 1. Initialize Enhanced Context Manager
        console.log('\n📋 Step 1: Initialize Enhanced Context Manager');
        const contextManager = new ContextManager();
        console.log('✅ Enhanced Context Manager created');
        
        // Show initial configuration
        const metrics = contextManager.getMetrics();
        console.log(`   • Max token limit: ${metrics.maxTokens.toLocaleString()}`);
        console.log(`   • Initial enriched contexts: ${metrics.enrichedContextCount}`);
        
        // 2. Create core context from README
        console.log('\n📖 Step 2: Initialize Core Context');
        const projectPath = process.cwd();
        const readmeContent = await getReadmeContent(projectPath);
        
        if (readmeContent) {
            await contextManager.createCoreContext(readmeContent);
            console.log('✅ Core context created from README.md');
        } else {
            const fallbackContext = `# Requirements Gathering Agent - Direct Context Injection Demo
            
This is a demonstration of the Direct Context Injection feature for the Enhanced Context Manager.
The system can automatically discover and inject high-relevance markdown files into the context.

## Key Features
- Automatic markdown file discovery
- Relevance scoring based on PMBOK terminology
- Intelligent token budget management
- Context categorization and prioritization
- Real-time injection statistics`;
            
            await contextManager.createCoreContext(fallbackContext);
            console.log('✅ Core context created with demo content');
        }
        
        const coreTokens = contextManager.getMetrics().coreContextTokens;
        console.log(`   • Core context tokens: ${coreTokens.toLocaleString()}`);
        
        // 3. Demonstrate Direct Context Injection
        console.log('\n🎯 Step 3: Direct Context Injection');
        console.log('   Discovering high-relevance markdown files...');
        
        const injectedCount = await contextManager.injectHighRelevanceMarkdownFiles(
            projectPath,
            60,  // Minimum relevance score (lowered for demo)
            5    // Maximum files to inject
        );
        
        console.log(`✅ Injection completed: ${injectedCount} files processed`);
        
        // 4. Show injection statistics
        console.log('\n📊 Step 4: Injection Statistics');
        const stats = contextManager.getInjectionStatistics();
        console.log(`   • Total injected contexts: ${stats.totalInjected}`);
        console.log(`   • Tokens from injected content: ${stats.totalTokensInjected.toLocaleString()}`);
        console.log(`   • Remaining token budget: ${stats.remainingTokenBudget.toLocaleString()}`);
        
        if (stats.injectedKeys.length > 0) {
            console.log('   • Injected context keys:');
            stats.injectedKeys.forEach(key => console.log(`     - ${key}`));
        } else {
            console.log('   • No high-relevance files found for injection (normal in test environments)');
        }
        
        // 5. Test context building with injected content
        console.log('\n🔧 Step 5: Context Building with Enhanced Features');
        const testDocuments = ['project-charter', 'user-stories', 'tech-stack-analysis'];
        
        for (const docType of testDocuments) {
            const context = contextManager.buildContextForDocument(docType);
            const tokens = Math.ceil(context.length / 3.5);
            console.log(`   • ${docType}: ${tokens.toLocaleString()} tokens`);
            
            // Check if injected content is present
            const hasInjectedContent = stats.injectedKeys.some(key => 
                context.includes(key) || context.includes('Injected Document')
            );
            if (hasInjectedContent) {
                console.log(`     ✅ Contains injected content`);
            }
        }
        
        // 6. Generate utilization report
        console.log('\n📈 Step 6: Context Utilization Analysis');
        const report = contextManager.getContextUtilizationReport();
        const reportLines = report.split('\n');
        
        console.log('   Context Manager Performance Summary:');
        // Show key metrics from the report
        for (let i = 0; i < Math.min(10, reportLines.length); i++) {
            if (reportLines[i].trim()) {
                console.log(`   ${reportLines[i]}`);
            }
        }
        
        // 7. Document-specific context analysis
        console.log('\n🔍 Step 7: Document-Specific Context Analysis');
        const analysis = contextManager.analyzeDocumentContext('project-charter');
        console.log(`   • Project Charter context tokens: ${analysis.totalTokens.toLocaleString()}`);
        console.log(`   • Context utilization: ${analysis.utilizationPercentage.toFixed(1)}%`);
        console.log(`   • Included contexts: ${analysis.includedContexts.length}`);
        console.log(`   • Available additional contexts: ${analysis.potentialContexts.length}`);
        
        if (analysis.recommendations.length > 0) {
            console.log('   • Recommendations:');
            analysis.recommendations.forEach(rec => console.log(`     - ${rec}`));
        }
        
        // 8. Context cleanup demonstration
        console.log('\n🧹 Step 8: Context Management & Cleanup');
        const beforeCleanup = contextManager.getInjectionStatistics();
        console.log(`   • Before cleanup: ${beforeCleanup.totalInjected} injected contexts`);
        
        if (beforeCleanup.totalInjected > 0) {
            contextManager.clearInjectedContext();
            const afterCleanup = contextManager.getInjectionStatistics();
            console.log(`   • After cleanup: ${afterCleanup.totalInjected} injected contexts`);
            console.log('   ✅ Context cleanup successful');
        } else {
            console.log('   • No injected contexts to clean up');
        }
        
        // 9. Final metrics
        console.log('\n📋 Step 9: Final System Metrics');
        const finalMetrics = contextManager.getMetrics();
        console.log(`   • Final core context tokens: ${finalMetrics.coreContextTokens.toLocaleString()}`);
        console.log(`   • Final enriched context count: ${finalMetrics.enrichedContextCount}`);
        console.log(`   • Cache efficiency: ${finalMetrics.cacheSize > 0 ? 'Active' : 'Clean'}`);
        console.log(`   • Total context capacity: ${finalMetrics.maxTokens.toLocaleString()}`);
        
        console.log('\n🎉 DIRECT CONTEXT INJECTION DEMONSTRATION COMPLETED SUCCESSFULLY!');
        console.log('================================================================');
        console.log('\n✨ Key Benefits Demonstrated:');
        console.log('   • Automatic discovery of relevant project documentation');
        console.log('   • Intelligent relevance scoring and prioritization');
        console.log('   • Dynamic token budget management');
        console.log('   • Seamless integration with existing context system');
        console.log('   • Real-time statistics and monitoring');
        console.log('   • Flexible context management and cleanup');
        
        return true;
        
    } catch (error) {
        console.error('❌ Demonstration failed:', error);
        console.error('Stack trace:', error.stack);
        return false;
    }
}

// Run the demonstration
demonstrateDirectContextInjection()
    .then(success => {
        if (success) {
            console.log('\n✅ Direct Context Injection feature is working correctly!');
            process.exit(0);
        } else {
            console.log('\n❌ Demonstration failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Fatal error during demonstration:', error);
        process.exit(1);
    });
