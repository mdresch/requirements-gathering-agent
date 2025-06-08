/**
 * Direct Context Injection Example
 * Demonstrates the new Enhanced Context Manager capabilities
 * for automatically discovering and injecting high-relevance markdown files
 */

import { ContextManager } from '../modules/contextManager.js';
import { getReadmeContent } from '../modules/projectAnalyzer.js';
import * as path from 'path';

/**
 * Example: Using Direct Context Injection with Enhanced Context Manager
 */
export async function demonstrateDirectContextInjection(projectPath: string): Promise<void> {
    console.log('🚀 Direct Context Injection Demo');
    console.log('=====================================');
    
    try {
        // 1. Initialize Enhanced Context Manager
        const contextManager = new ContextManager();
        console.log('✅ Enhanced Context Manager initialized');
        
        // 2. Create core context from README
        const readmeContent = await getReadmeContent(projectPath);
        if (readmeContent) {
            await contextManager.createCoreContext(readmeContent);
            console.log('✅ Core context created from README');
        } else {
            console.log('⚠️ No README.md found, using minimal core context');
            await contextManager.createCoreContext('Project analysis in progress...');
        }
        
        // 3. Inject high-relevance markdown files automatically
        console.log('\n📄 Discovering and injecting high-relevance markdown files...');
        const injectedCount = await contextManager.injectHighRelevanceMarkdownFiles(
            projectPath,
            75,  // Minimum relevance score
            8    // Maximum files to inject
        );
        
        // 4. Get injection statistics
        const stats = contextManager.getInjectionStatistics();
        console.log('\n📊 Injection Statistics:');
        console.log(`   • Files injected: ${stats.totalInjected}`);
        console.log(`   • Tokens used: ${stats.totalTokensInjected.toLocaleString()}`);
        console.log(`   • Remaining budget: ${stats.remainingTokenBudget.toLocaleString()}`);
        
        // 5. Show injected context keys
        if (stats.injectedKeys.length > 0) {
            console.log('\n🔑 Injected Context Keys:');
            stats.injectedKeys.forEach(key => console.log(`   • ${key}`));
        }
        
        // 6. Generate context utilization report
        console.log('\n📈 Context Utilization Report:');
        const report = contextManager.getContextUtilizationReport();
        console.log(report);
        
        // 7. Test context building for different document types
        console.log('\n🧪 Testing Context Building:');
        const testDocuments = ['project-charter', 'user-stories', 'tech-stack-analysis'];
        
        for (const docType of testDocuments) {
            const context = contextManager.buildContextForDocument(docType);
            const contextTokens = Math.ceil(context.length / 3.5);
            console.log(`   • ${docType}: ${contextTokens.toLocaleString()} tokens`);
        }
        
        // 8. Analyze document-specific context
        console.log('\n🔍 Document Context Analysis:');
        const analysis = contextManager.analyzeDocumentContext('project-charter');
        console.log(`   • Total tokens: ${analysis.totalTokens.toLocaleString()}`);
        console.log(`   • Utilization: ${analysis.utilizationPercentage.toFixed(1)}%`);
        console.log(`   • Included contexts: ${analysis.includedContexts.length}`);
        console.log(`   • Potential contexts: ${analysis.potentialContexts.length}`);
        
        if (analysis.recommendations.length > 0) {
            console.log('   • Recommendations:');
            analysis.recommendations.forEach(rec => console.log(`     - ${rec}`));
        }
        
        console.log('\n✅ Direct Context Injection demonstration completed!');
        
    } catch (error) {
        console.error('❌ Error during demonstration:', error);
    }
}

/**
 * Example: Using specific file injection
 */
export async function demonstrateSpecificFileInjection(
    projectPath: string, 
    filePaths: string[]
): Promise<void> {
    console.log('\n🎯 Specific File Injection Demo');
    console.log('=====================================');
    
    try {
        const contextManager = new ContextManager();
        
        // Initialize with minimal context
        await contextManager.createCoreContext('Project with specific file injection...');
        
        // Inject specific files
        const injectedCount = await contextManager.injectSpecificMarkdownFiles(filePaths, projectPath);
        
        console.log(`✅ Injected ${injectedCount} specific files`);
        
        // Show results
        const stats = contextManager.getInjectionStatistics();
        console.log(`📊 Token usage: ${stats.totalTokensInjected.toLocaleString()}`);
        
    } catch (error) {
        console.error('❌ Error during specific file injection:', error);
    }
}

/**
 * Example: Context cleanup and management
 */
export async function demonstrateContextManagement(projectPath: string): Promise<void> {
    console.log('\n🧹 Context Management Demo');
    console.log('=====================================');
    
    try {
        const contextManager = new ContextManager();
        
        // Initialize and inject content
        await contextManager.createCoreContext('Test context for cleanup demo...');
        await contextManager.injectHighRelevanceMarkdownFiles(projectPath, 70, 5);
        
        const beforeStats = contextManager.getInjectionStatistics();
        console.log(`📊 Before cleanup: ${beforeStats.totalInjected} injected contexts`);
        
        // Clear injected context
        contextManager.clearInjectedContext();
        
        const afterStats = contextManager.getInjectionStatistics();
        console.log(`✅ After cleanup: ${afterStats.totalInjected} injected contexts`);
        
        // Show general metrics
        const metrics = contextManager.getMetrics();
        console.log('\n📈 Context Manager Metrics:');
        console.log(`   • Core context tokens: ${metrics.coreContextTokens.toLocaleString()}`);
        console.log(`   • Enriched context count: ${metrics.enrichedContextCount}`);
        console.log(`   • Cache size: ${metrics.cacheSize}`);
        console.log(`   • Max tokens: ${metrics.maxTokens.toLocaleString()}`);
        
    } catch (error) {
        console.error('❌ Error during context management demo:', error);
    }
}

/**
 * Run all demonstrations
 */
export async function runAllDirectContextInjectionExamples(projectPath: string): Promise<void> {
    console.log('🌟 DIRECT CONTEXT INJECTION - FULL DEMONSTRATION');
    console.log('================================================');
    
    // Main demonstration
    await demonstrateDirectContextInjection(projectPath);
    
    // Example specific files (if they exist)
    const exampleFiles = [
        path.join(projectPath, 'docs', 'architecture.md'),
        path.join(projectPath, 'docs', 'requirements.md'),
        path.join(projectPath, 'CONTRIBUTING.md')
    ].filter(filePath => {
        // In a real implementation, you'd check if files exist
        return true; // For demo purposes
    });
    
    if (exampleFiles.length > 0) {
        await demonstrateSpecificFileInjection(projectPath, exampleFiles);
    }
    
    // Context management
    await demonstrateContextManagement(projectPath);
    
    console.log('\n🎉 All Direct Context Injection examples completed!');
}

// Usage example (commented out for library use)
/*
// To run the demo:
(async () => {
    const projectPath = 'c:/Users/menno/Source/Repos/requirements-gathering-agent';
    await runAllDirectContextInjectionExamples(projectPath);
})();
*/
