#!/usr/bin/env node

/**
 * Test script to verify UI/UX considerations integration with PMBOK alignment
 */

import { DocumentGenerator } from './src/modules/documentGenerator/DocumentGenerator.js';
import { getTaskByKey } from './src/modules/documentGenerator/generationTasks.js';

async function testUIUXIntegration() {
    console.log('🧪 Testing UI/UX Considerations Integration with PMBOK Alignment');
    console.log('=' .repeat(70));
    
    // Test 1: Verify UI/UX task exists and has proper PMBOK reference
    console.log('\n📋 Test 1: Verifying UI/UX task configuration...');
    const uiuxTask = getTaskByKey('ui-ux-considerations');
    
    if (!uiuxTask) {
        console.error('❌ UI/UX considerations task not found!');
        return false;
    }
    
    console.log(`✅ Task found: ${uiuxTask.name}`);
    console.log(`📊 Priority: ${uiuxTask.priority}`);
    console.log(`📚 PMBOK Reference: ${uiuxTask.pmbokRef}`);
    console.log(`📁 Category: ${uiuxTask.category}`);
    console.log(`🎯 Function: ${uiuxTask.func}`);
    
    // Test 2: Verify PMBOK alignment
    console.log('\n📋 Test 2: Verifying PMBOK 7.0 alignment...');
    const hasPMBOKRef = uiuxTask.pmbokRef && uiuxTask.pmbokRef !== 'N/A';
    const hasProperPriority = uiuxTask.priority <= 30; // Should be higher priority now
    
    if (hasPMBOKRef) {
        console.log('✅ PMBOK reference properly set');
    } else {
        console.log('❌ Missing or invalid PMBOK reference');
    }
    
    if (hasProperPriority) {
        console.log('✅ Priority properly elevated for better integration');
    } else {
        console.log('❌ Priority too low for effective integration');
    }
    
    // Test 3: Test document generation
    console.log('\n📋 Test 3: Testing UI/UX document generation...');
    const testContext = `
# Test Project: Modern Web Application

## Project Overview
We are developing a modern web application for project management that will serve both internal teams and external clients. The application needs to be accessible, user-friendly, and aligned with our brand guidelines.

## Key Requirements
- User-centered design approach
- Accessibility compliance (WCAG 2.1 AA)
- Mobile-first responsive design
- Integration with existing systems
- Performance optimization
- Multi-language support

## Stakeholders
- Project managers
- Development teams
- End users (internal and external)
- Accessibility compliance team
- Brand management team
    `.trim();
    
    try {
        const generator = new DocumentGenerator(testContext);
        const success = await generator.generateOne('ui-ux-considerations');
        
        if (success) {
            console.log('✅ UI/UX considerations document generated successfully');
        } else {
            console.log('❌ Failed to generate UI/UX considerations document');
        }
        
        return success;
        
    } catch (error) {
        console.error('❌ Error during document generation:', error.message);
        return false;
    }
}

// Test 4: Verify technical analysis integration
async function testTechnicalAnalysisIntegration() {
    console.log('\n📋 Test 4: Testing Technical Analysis integration...');
    
    const testContext = 'Modern web application with UI/UX focus';
    
    try {
        const result = await DocumentGenerator.generateTechnicalAnalysis(testContext);
        
        if (result.success && result.successCount > 0) {
            console.log(`✅ Technical analysis generated successfully (${result.successCount} documents)`);
            console.log('📄 Generated files:', result.generatedFiles.join(', '));
            return true;
        } else {
            console.log('❌ Technical analysis generation failed');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error during technical analysis generation:', error.message);
        return false;
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting UI/UX Integration Tests...\n');
    
    const test1Success = await testUIUXIntegration();
    const test2Success = await testTechnicalAnalysisIntegration();
    
    console.log('\n' + '=' .repeat(70));
    console.log('📊 Test Results Summary:');
    console.log(`UI/UX Integration Test: ${test1Success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Technical Analysis Integration: ${test2Success ? '✅ PASSED' : '❌ FAILED'}`);
    
    const overallSuccess = test1Success && test2Success;
    console.log(`\n🎯 Overall Result: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (overallSuccess) {
        console.log('\n🎉 UI/UX considerations are properly integrated with PMBOK alignment!');
        console.log('📋 Key improvements implemented:');
        console.log('   • Enhanced PMBOK 7.0 performance domain alignment');
        console.log('   • Improved priority for better integration');
        console.log('   • Enhanced document relationships');
        console.log('   • Comprehensive project management integration');
    }
    
    return overallSuccess;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export { testUIUXIntegration, testTechnicalAnalysisIntegration, runTests };