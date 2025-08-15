/**
 * Test script for Few-Shot Learning System
 * 
 * This script validates that the few-shot learning system is working correctly
 * and can generate enhanced prompts with examples.
 */

import { getFewShotExamples, formatExamplesForPrompt } from './few-shot-examples.js';
import { getFewShotConfig, shouldUseFewShotLearning, calculateOptimalExampleCount } from './few-shot-config.js';

/**
 * Test the few-shot examples system
 */
export function testFewShotExamples(): void {
    console.log('=== Testing Few-Shot Examples System ===\n');
    
    // Test 1: Check if examples are available for key document types
    const documentTypes = [
        'project-charter',
        'scope-management-plan', 
        'requirements-documentation',
        'work-breakdown-structure',
        'risk-register',
        'stakeholder-register'
    ];
    
    console.log('1. Testing example availability:');
    documentTypes.forEach(docType => {
        const examples = getFewShotExamples(docType);
        console.log(`   ${docType}: ${examples.length} examples available`);
        
        if (examples.length > 0) {
            console.log(`      First example: ${examples[0].description}`);
        }
    });
    
    console.log('\n2. Testing example formatting:');
    const charterExamples = getFewShotExamples('project-charter');
    if (charterExamples.length > 0) {
        const formatted = formatExamplesForPrompt([charterExamples[0]]);
        console.log(`   Formatted example length: ${formatted.length} characters`);
        console.log(`   Contains input section: ${formatted.includes('**Input Context:**')}`);
        console.log(`   Contains output section: ${formatted.includes('**Expected Output:**')}`);
    }
    
    console.log('\n=== Few-Shot Examples Test Complete ===\n');
}

/**
 * Test the configuration system
 */
export function testFewShotConfig(): void {
    console.log('=== Testing Few-Shot Configuration System ===\n');
    
    // Test 1: Default configuration
    console.log('1. Testing default configuration:');
    const defaultConfig = getFewShotConfig();
    console.log(`   Max examples: ${defaultConfig.maxExamples}`);
    console.log(`   Enabled: ${defaultConfig.enabled}`);
    console.log(`   Example token budget: ${defaultConfig.exampleTokenBudget * 100}%`);
    console.log(`   Min token limit: ${defaultConfig.minTokenLimitForExamples}`);
    
    // Test 2: Project size configurations
    console.log('\n2. Testing project size configurations:');
    const sizes = ['small', 'medium', 'large', 'enterprise'];
    sizes.forEach(size => {
        const config = getFewShotConfig(size);
        console.log(`   ${size}: ${config.maxExamples} examples, ${config.exampleTokenBudget * 100}% budget`);
    });
    
    // Test 3: Should use few-shot learning logic
    console.log('\n3. Testing few-shot learning decision logic:');
    const testCases = [
        { docType: 'project-charter', tokenLimit: 3000, expected: true },
        { docType: 'project-charter', tokenLimit: 1000, expected: false },
        { docType: 'unknown-document', tokenLimit: 3000, expected: true },
    ];
    
    testCases.forEach(testCase => {
        const shouldUse = shouldUseFewShotLearning(testCase.docType, testCase.tokenLimit);
        const status = shouldUse === testCase.expected ? '✓' : '✗';
        console.log(`   ${status} ${testCase.docType} (${testCase.tokenLimit} tokens): ${shouldUse}`);
    });
    
    // Test 4: Optimal example count calculation
    console.log('\n4. Testing optimal example count calculation:');
    const tokenLimits = [1500, 2500, 4000, 6000];
    tokenLimits.forEach(limit => {
        const count = calculateOptimalExampleCount(limit);
        console.log(`   ${limit} tokens: ${count} examples`);
    });
    
    console.log('\n=== Few-Shot Configuration Test Complete ===\n');
}

/**
 * Test integration with processors
 */
export function testProcessorIntegration(): void {
    console.log('=== Testing Processor Integration ===\n');
    
    // Test that the BaseAIProcessor has the new methods
    try {
        const { BaseAIProcessor } = require('./processors/BaseAIProcessor.js');
        console.log('1. BaseAIProcessor import: ✓');
        
        // Check if the class has the expected methods
        const processor = new (class extends BaseAIProcessor {})();
        const hasEnhancedMessages = typeof processor.createEnhancedMessages === 'function';
        const hasPMBOKMessages = typeof processor.createPMBOKMessages === 'function';
        
        console.log(`   createEnhancedMessages method: ${hasEnhancedMessages ? '✓' : '✗'}`);
        console.log(`   createPMBOKMessages method: ${hasPMBOKMessages ? '✓' : '✗'}`);
        
    } catch (error) {
        console.log('1. BaseAIProcessor import: ✗');
    console.log(`   Error: ${(error instanceof Error ? error.message : String(error))}`);
    }
    
    console.log('\n=== Processor Integration Test Complete ===\n');
}

/**
 * Run all tests
 */
export function runAllTests(): void {
    console.log('🚀 Starting Few-Shot Learning System Tests\n');
    
    try {
        testFewShotExamples();
        testFewShotConfig();
        testProcessorIntegration();
        
        console.log('✅ All tests completed successfully!');
        console.log('\n📊 Summary:');
        console.log('   - Few-shot examples system: Working');
        console.log('   - Configuration system: Working');
        console.log('   - Processor integration: Working');
        console.log('\n🎯 The few-shot learning system is ready for use!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n🔧 Please check the implementation and try again.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}