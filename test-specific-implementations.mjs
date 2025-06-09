#!/usr/bin/env node

import { ProjectManagementProcessor } from './dist/modules/ai/processors/ProjectManagementProcessor.js';
import { RequirementsProcessor } from './dist/modules/ai/processors/RequirementsProcessor.js';
import { PMBOKProcessProcessor } from './dist/modules/ai/processors/PMBOKProcessProcessor.js';

// Test specific newly implemented document types with Google AI
async function testSpecificNewDocuments() {
    console.log('🧪 Testing Selected New Document Types with Google AI...\n');
    
    const testContext = `
    Project: AI-Powered Requirements Gathering System Enhancement
    Type: Software enhancement project
    Technology: TypeScript, Node.js, AI integration
    Scope: Implement 12 new PMBOK-compliant document types
    Timeline: 3 months
    Budget: $150,000
    Team: 3 senior developers, 1 QA engineer, 1 project manager
    Goal: Enhance document generation capabilities with comprehensive PMBOK compliance
    Deliverables: Enhanced AI system with 12 new document generation capabilities
    `;

    let successCount = 0;
    let totalTests = 3; // Testing just 3 key documents

    try {
        console.log('=== TESTING CORE IMPLEMENTATIONS ===\n');
        
        // 1. Test Project Statement of Work (ProjectManagementProcessor)
        console.log('1. 🔍 Testing Project Statement of Work...');
        const projectProcessor = new ProjectManagementProcessor();
        try {
            const sow = await projectProcessor.getProjectStatementOfWork(testContext);
            if (sow && sow.length > 200) {
                console.log('   ✅ SUCCESS: Project Statement of Work generated');
                console.log(`   📄 Content length: ${sow.length} characters`);
                console.log(`   🔸 Preview: ${sow.substring(0, 100)}...`);
                successCount++;
            } else {
                console.log('   ❌ FAILED: Insufficient content generated');
                console.log(`   📄 Content: ${sow || 'null'}`);
            }
        } catch (error) {
            console.log('   ❌ ERROR:', error.message);
        }

        console.log('\\n2. 🔍 Testing Requirements Management Plan...');
        const reqProcessor = new RequirementsProcessor();
        try {
            const reqPlan = await reqProcessor.getRequirementsManagementPlan(testContext);
            if (reqPlan && reqPlan.length > 200) {
                console.log('   ✅ SUCCESS: Requirements Management Plan generated');
                console.log(`   📄 Content length: ${reqPlan.length} characters`);
                console.log(`   🔸 Preview: ${reqPlan.substring(0, 100)}...`);
                successCount++;
            } else {
                console.log('   ❌ FAILED: Insufficient content generated');
                console.log(`   📄 Content: ${reqPlan || 'null'}`);
            }
        } catch (error) {
            console.log('   ❌ ERROR:', error.message);
        }

        console.log('\\n3. 🔍 Testing Perform Integrated Change Control Process...');
        const pmbokProcessor = new PMBOKProcessProcessor();
        try {
            const changeControl = await pmbokProcessor.getPerformIntegratedChangeControlProcess(testContext);
            if (changeControl && changeControl.length > 200) {
                console.log('   ✅ SUCCESS: Perform Integrated Change Control generated');
                console.log(`   📄 Content length: ${changeControl.length} characters`);
                console.log(`   🔸 Preview: ${changeControl.substring(0, 100)}...`);
                successCount++;
            } else {
                console.log('   ❌ FAILED: Insufficient content generated');
                console.log(`   📄 Content: ${changeControl || 'null'}`);
            }
        } catch (error) {
            console.log('   ❌ ERROR:', error.message);
        }

        console.log('\\n' + '='.repeat(60));
        console.log(`🎯 TEST RESULTS SUMMARY`);
        console.log(`✅ Successful: ${successCount}/${totalTests} document types`);
        console.log(`❌ Failed: ${totalTests - successCount}/${totalTests} document types`);
        
        if (successCount === totalTests) {
            console.log('\\n🎉 ALL TESTED DOCUMENT TYPES ARE WORKING!');
            console.log('✅ Implementation appears to be successful');
            console.log('🔧 The routing and processor methods are functioning correctly');
        } else if (successCount > 0) {
            console.log('\\n⚠️  Partial success - some implementations working');
            console.log('🔧 Please review any failed implementations');
        } else {
            console.log('\\n❌ All tests failed - check configuration and implementation');
        }

        console.log('\\n📋 NEXT STEPS:');
        if (successCount === totalTests) {
            console.log('  ✅ Run full document generation to test all 12 new document types');
            console.log('  ✅ Validate PMBOK compliance of generated content');
            console.log('  ✅ Test integration with main DocumentGenerator system');
        } else {
            console.log('  🔧 Debug failed implementations');
            console.log('  🔧 Check AI provider configuration');
            console.log('  🔧 Review error messages for specific issues');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the focused test
testSpecificNewDocuments()
    .then(() => {
        console.log('\\n✅ Test execution completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
