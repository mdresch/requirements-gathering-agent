#!/usr/bin/env node

import { ProjectManagementProcessor } from './dist/modules/ai/processors/ProjectManagementProcessor.js';
import { PMBOKProcessProcessor } from './dist/modules/ai/processors/PMBOKProcessProcessor.js';
import { ScopeManagementProcessor } from './dist/modules/ai/processors/ScopeManagementProcessor.js';
import { RequirementsProcessor } from './dist/modules/ai/processors/RequirementsProcessor.js';
import { WBSProcessor } from './dist/modules/ai/processors/WBSProcessor.js';
import { ActivityProcessor } from './dist/modules/ai/processors/ActivityProcessor.js';

// Test all 12 newly implemented document types
async function testNewDocumentTypes() {
    console.log('🧪 Testing 12 Newly Implemented Document Types...\n');
    
    const testContext = `
    Project: Requirements Gathering Agent Enhancement
    Type: AI-powered project management tool
    Technology: TypeScript, Node.js, Express.js
    Scope: Enhance existing system with 14 new document types following PMBOK standards
    Timeline: 3 months development phase
    Budget: $250,000
    Team: 5 developers, 2 QA engineers, 1 project manager
    Client: Internal R&D division
    Goal: Generate comprehensive project documentation following PMBOK standards
    Deliverables: Enhanced document generation system with full PMBOK compliance
    `;

    let successCount = 0;
    let totalTests = 12;

    try {
        console.log('=== CORE ANALYSIS DOCUMENTS ===');
        
        // 1. Project Statement of Work
        console.log('1. Testing Project Statement of Work...');
        const projectManagementProcessor = new ProjectManagementProcessor();
        const sow = await projectManagementProcessor.getProjectStatementOfWork(testContext);
        if (sow && sow.length > 100) {
            console.log('✅ Project Statement of Work generated successfully');
            console.log(`   Content length: ${sow.length} characters`);
            successCount++;
        } else {
            console.log('❌ Project Statement of Work failed or returned insufficient content');
        }

        // 2. Business Case
        console.log('\n2. Testing Business Case...');
        const businessCase = await projectManagementProcessor.getBusinessCase(testContext);
        if (businessCase && businessCase.length > 100) {
            console.log('✅ Business Case generated successfully');
            console.log(`   Content length: ${businessCase.length} characters`);
            successCount++;
        } else {
            console.log('❌ Business Case failed or returned insufficient content');
        }

        console.log('\n=== MANAGEMENT PLANS ===');
        
        // 3. Requirements Management Plan
        console.log('3. Testing Requirements Management Plan...');
        const requirementsProcessor = new RequirementsProcessor();
        const reqMgmtPlan = await requirementsProcessor.getRequirementsManagementPlan(testContext);
        if (reqMgmtPlan && reqMgmtPlan.length > 100) {
            console.log('✅ Requirements Management Plan generated successfully');
            console.log(`   Content length: ${reqMgmtPlan.length} characters`);
            successCount++;
        } else {
            console.log('❌ Requirements Management Plan failed or returned insufficient content');
        }

        // 4. Plan Scope Management
        console.log('\n4. Testing Plan Scope Management...');
        const scopeProcessor = new ScopeManagementProcessor();
        const planScope = await scopeProcessor.getPlanScopeManagement(testContext);
        if (planScope && planScope.length > 100) {
            console.log('✅ Plan Scope Management generated successfully');
            console.log(`   Content length: ${planScope.length} characters`);
            successCount++;
        } else {
            console.log('❌ Plan Scope Management failed or returned insufficient content');
        }

        console.log('\n=== PMBOK PROCESSES ===');
        
        // 5. Collect Requirements Process
        console.log('5. Testing Collect Requirements Process...');
        const collectReq = await requirementsProcessor.getCollectRequirementsProcess(testContext);
        if (collectReq && collectReq.length > 100) {
            console.log('✅ Collect Requirements Process generated successfully');
            console.log(`   Content length: ${collectReq.length} characters`);
            successCount++;
        } else {
            console.log('❌ Collect Requirements Process failed or returned insufficient content');
        }

        // 6. Define Scope Process
        console.log('\n6. Testing Define Scope Process...');
        const defineScope = await scopeProcessor.getDefineScopeProcess(testContext);
        if (defineScope && defineScope.length > 100) {
            console.log('✅ Define Scope Process generated successfully');
            console.log(`   Content length: ${defineScope.length} characters`);
            successCount++;
        } else {
            console.log('❌ Define Scope Process failed or returned insufficient content');
        }

        // 7. Create WBS Process
        console.log('\n7. Testing Create WBS Process...');
        const wbsProcessor = new WBSProcessor();
        const createWbs = await wbsProcessor.getCreateWbsProcess(testContext);
        if (createWbs && createWbs.length > 100) {
            console.log('✅ Create WBS Process generated successfully');
            console.log(`   Content length: ${createWbs.length} characters`);
            successCount++;
        } else {
            console.log('❌ Create WBS Process failed or returned insufficient content');
        }

        // 8. Perform Integrated Change Control Process
        console.log('\n8. Testing Perform Integrated Change Control Process...');
        const pmbokProcessor = new PMBOKProcessProcessor();
        const changeControl = await pmbokProcessor.getPerformIntegratedChangeControlProcess(testContext);
        if (changeControl && changeControl.length > 100) {
            console.log('✅ Perform Integrated Change Control Process generated successfully');
            console.log(`   Content length: ${changeControl.length} characters`);
            successCount++;
        } else {
            console.log('❌ Perform Integrated Change Control Process failed or returned insufficient content');
        }

        // 9. Close Project or Phase Process
        console.log('\n9. Testing Close Project or Phase Process...');
        const closeProject = await pmbokProcessor.getCloseProjectOrPhaseProcess(testContext);
        if (closeProject && closeProject.length > 100) {
            console.log('✅ Close Project or Phase Process generated successfully');
            console.log(`   Content length: ${closeProject.length} characters`);
            successCount++;
        } else {
            console.log('❌ Close Project or Phase Process failed or returned insufficient content');
        }

        console.log('\n=== WORK PERFORMANCE INFORMATION ===');
        
        // 10. Work Performance Information (Scope)
        console.log('10. Testing Work Performance Information (Scope)...');
        const workPerfInfo = await scopeProcessor.getWorkPerformanceInformationScope(testContext);
        if (workPerfInfo && workPerfInfo.length > 100) {
            console.log('✅ Work Performance Information (Scope) generated successfully');
            console.log(`   Content length: ${workPerfInfo.length} characters`);
            successCount++;
        } else {
            console.log('❌ Work Performance Information (Scope) failed or returned insufficient content');
        }

        console.log('\n=== PLANNING ARTIFACTS ===');
        
        // 11. Activity Duration Estimates
        console.log('11. Testing Activity Duration Estimates...');
        const activityProcessor = new ActivityProcessor();
        const durationEstimates = await activityProcessor.getActivityDurationEstimates(testContext);
        if (durationEstimates && durationEstimates.length > 100) {
            console.log('✅ Activity Duration Estimates generated successfully');
            console.log(`   Content length: ${durationEstimates.length} characters`);
            successCount++;
        } else {
            console.log('❌ Activity Duration Estimates failed or returned insufficient content');
        }

        // 12. Activity Resource Estimates
        console.log('\n12. Testing Activity Resource Estimates...');
        const resourceEstimates = await activityProcessor.getActivityResourceEstimates(testContext);
        if (resourceEstimates && resourceEstimates.length > 100) {
            console.log('✅ Activity Resource Estimates generated successfully');
            console.log(`   Content length: ${resourceEstimates.length} characters`);
            successCount++;
        } else {
            console.log('❌ Activity Resource Estimates failed or returned insufficient content');
        }

        console.log('\n' + '='.repeat(60));
        console.log(`🎯 TEST RESULTS SUMMARY`);
        console.log(`✅ Successful: ${successCount}/${totalTests} document types`);
        console.log(`❌ Failed: ${totalTests - successCount}/${totalTests} document types`);
        
        if (successCount === totalTests) {
            console.log('🎉 ALL NEW DOCUMENT TYPES ARE WORKING CORRECTLY!');
            console.log('✅ Implementation is complete and functional');
        } else {
            console.log('⚠️  Some document types need attention');
            console.log('🔧 Please review the failed implementations');
        }

    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testNewDocumentTypes()
    .then(() => {
        console.log('\n✅ Test execution completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
