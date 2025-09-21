#!/usr/bin/env node

/**
 * Context Quality Measurement Demo
 * 
 * This script demonstrates how to measure and compare LLM response quality
 * across different context window sizes (8K vs 1M tokens).
 * 
 * Usage:
 * node examples/context-quality-measurement-demo.js
 */

import { ContextABTesting, ProjectLibraryLoader, QualityScoringAlgorithms } from '../src/modules/ai/contextQualityMeasurement/index.js';
import path from 'path';

async function runContextQualityDemo() {
    console.log('🚀 Context Quality Measurement Demo');
    console.log('=====================================\n');
    
    try {
        // Initialize the testing framework
        const abTesting = ContextABTesting.getInstance();
        const libraryLoader = ProjectLibraryLoader.getInstance();
        const qualityScorer = QualityScoringAlgorithms.getInstance();
        
        // Demo 1: Quick comparison test
        console.log('📊 Demo 1: Quick Context Comparison');
        console.log('-----------------------------------');
        
        const quickComparison = await abTesting.runQuickComparison(
            process.cwd(),
            'project-charter',
            ['limited_8k', 'full_1m']
        );
        
        console.log(`✅ Quick comparison completed:`);
        console.log(`   Overall improvement: ${quickComparison.improvementMetrics.overallImprovement.toFixed(2)}%`);
        console.log(`   Significant improvements: ${quickComparison.improvementMetrics.significantImprovements.join(', ')}`);
        console.log(`   ROI: ${quickComparison.costAnalysis.roi.toFixed(2)}x`);
        console.log('');
        
        // Demo 2: Project library loading
        console.log('📚 Demo 2: Project Library Loading');
        console.log('----------------------------------');
        
        const library = await libraryLoader.loadProjectLibrary(process.cwd(), {
            maxTokens: 500000, // Use 500K tokens for demo
            prioritizeRecent: true,
            includePatterns: [
                '**/*.md',
                '**/README*',
                '**/package.json',
                '**/src/**/*.ts'
            ]
        });
        
        console.log(`✅ Project library loaded:`);
        console.log(`   Files: ${library.totalFiles}`);
        console.log(`   Tokens: ${library.totalTokens.toLocaleString()}`);
        console.log(`   Categories: ${Array.from(library.categories.keys()).join(', ')}`);
        
        const stats = libraryLoader.getLibraryStats(library);
        console.log(`   Largest files:`);
        stats.largestFiles.slice(0, 3).forEach(file => {
            console.log(`     - ${file.path}: ${file.tokens.toLocaleString()} tokens`);
        });
        console.log('');
        
        // Demo 3: Context conversion
        console.log('🔄 Demo 3: Context Conversion');
        console.log('-----------------------------');
        
        const structuredContext = await libraryLoader.libraryToContext(library, {
            format: 'structured',
            maxTokens: 100000,
            includeMetadata: true,
            groupByCategory: true
        });
        
        console.log(`✅ Context converted:`);
        console.log(`   Format: Structured`);
        console.log(`   Length: ${structuredContext.length.toLocaleString()} characters`);
        console.log(`   Estimated tokens: ${Math.ceil(structuredContext.length / 4).toLocaleString()}`);
        console.log('');
        
        // Demo 4: Quality analysis
        console.log('🔍 Demo 4: Quality Analysis');
        console.log('---------------------------');
        
        const sampleDocument = `
# Project Charter

## Project Overview
This project aims to develop a comprehensive requirements gathering agent that can utilize large language models with up to 1 million token context windows.

## Objectives
- Measure quality improvements with larger context windows
- Develop automated quality assessment tools
- Create A/B testing infrastructure for context comparison
- Build project library loading capabilities

## Scope
The project includes development of quality measurement frameworks, automated scoring algorithms, and comprehensive testing infrastructure.

## Stakeholders
- Project Manager: Responsible for overall project delivery
- Technical Lead: Oversees implementation and architecture
- Quality Assurance: Ensures testing and validation processes

## Timeline
- Phase 1: Framework development (2 weeks)
- Phase 2: Testing implementation (1 week)
- Phase 3: Documentation and deployment (1 week)

## Budget
Total project budget: $50,000

## Risks
- Technical complexity of large context window implementation
- Performance implications of loading entire project libraries
- Cost considerations for token usage
        `.trim();
        
        const qualityAnalysis = await qualityScorer.analyzeDocumentQuality(
            sampleDocument,
            {
                documentType: 'project-charter',
                contextSize: 1000000,
                modelUsed: 'gemini-1.5-pro',
                generationTime: 2500,
                tokenUsage: 15000
            },
            structuredContext
        );
        
        console.log(`✅ Quality analysis completed:`);
        console.log(`   Overall score: ${qualityAnalysis.overallScore.toFixed(1)}/100`);
        console.log(`   Strengths: ${qualityAnalysis.strengths.length}`);
        qualityAnalysis.strengths.forEach(strength => console.log(`     - ${strength}`));
        console.log(`   Weaknesses: ${qualityAnalysis.weaknesses.length}`);
        qualityAnalysis.weaknesses.forEach(weakness => console.log(`     - ${weakness}`));
        console.log('');
        
        // Demo 5: Comprehensive A/B test
        console.log('🧪 Demo 5: Comprehensive A/B Test');
        console.log('---------------------------------');
        
        const abTestResult = await abTesting.runABTest(process.cwd(), {
            name: 'Context Window Quality Demo Test',
            description: 'Demonstration of context window quality measurement',
            documentTypes: ['project-charter', 'requirements-documentation'],
            maxIterations: 3, // Reduced for demo
            randomizationStrategy: 'balanced'
        });
        
        console.log(`✅ A/B test completed:`);
        console.log(`   Test ID: ${abTestResult.testId}`);
        console.log(`   Iterations: ${abTestResult.summary.totalIterations}`);
        console.log(`   Average improvement: ${abTestResult.summary.averageImprovement.toFixed(2)}%`);
        console.log(`   Best configuration: ${abTestResult.summary.bestConfiguration}`);
        console.log(`   ROI: ${abTestResult.summary.costAnalysis.roi.toFixed(2)}x`);
        console.log('');
        
        // Demo 6: Generate comprehensive report
        console.log('📋 Demo 6: Comprehensive Report Generation');
        console.log('------------------------------------------');
        
        const report = await abTesting.generateTestReport(abTestResult.testId);
        
        // Save report to file
        const reportPath = path.join(process.cwd(), 'context-quality-measurement-report.md');
        await import('fs').then(fs => fs.promises.writeFile(reportPath, report));
        
        console.log(`✅ Comprehensive report generated:`);
        console.log(`   Report saved to: ${reportPath}`);
        console.log(`   Report length: ${report.length.toLocaleString()} characters`);
        console.log('');
        
        // Demo 7: Test statistics and trends
        console.log('📈 Demo 7: Test Statistics and Trends');
        console.log('-------------------------------------');
        
        const testStats = abTesting.getTestStatistics();
        console.log(`✅ Test statistics:`);
        console.log(`   Total tests: ${testStats.totalTests}`);
        console.log(`   Average improvement: ${testStats.averageImprovement.toFixed(2)}%`);
        console.log(`   Best performing configuration: ${testStats.bestPerformingConfiguration}`);
        console.log(`   Recommendations:`);
        testStats.recommendations.forEach(rec => console.log(`     - ${rec}`));
        console.log('');
        
        // Summary
        console.log('🎯 Demo Summary');
        console.log('===============');
        console.log('✅ Successfully demonstrated:');
        console.log('   - Quick context window comparisons');
        console.log('   - Project library loading and management');
        console.log('   - Context conversion to different formats');
        console.log('   - Automated quality analysis and scoring');
        console.log('   - Comprehensive A/B testing infrastructure');
        console.log('   - Detailed reporting and statistics');
        console.log('');
        console.log('🚀 The Context Quality Measurement Framework is ready for production use!');
        console.log('');
        console.log('💡 Key Insights from Demo:');
        console.log(`   - Quality improvement: ${quickComparison.improvementMetrics.overallImprovement.toFixed(1)}%`);
        console.log(`   - Cost-effectiveness: ${quickComparison.costAnalysis.roi.toFixed(1)}x ROI`);
        console.log(`   - Project context utilization: ${((library.totalTokens / 1000000) * 100).toFixed(1)}% of 1M token window`);
        console.log('');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the demo if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runContextQualityDemo().catch(console.error);
}

export { runContextQualityDemo };
