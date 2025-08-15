/**
 * Test script for the enhanced prompt engineering system
 */

import { 
    initializePromptSystem, 
    getPromptSystemStatus 
} from './src/modules/ai/prompts/index.js';

async function testPromptSystem() {
    console.log('🧪 Testing Enhanced Prompt Engineering System\n');

    try {
        // Initialize the system
        console.log('1. Initializing prompt system...');
        const { promptRegistry, promptManager, enhancedProcessor } = initializePromptSystem();
        console.log('✅ System initialized successfully\n');

        // Get system status
        console.log('2. Checking system status...');
        const status = getPromptSystemStatus();
        console.log(`   Available Document Types: ${status.availableDocumentTypes.length}`);
        console.log(`   Available Categories: ${status.availableCategories.length}`);
        console.log('✅ Status check completed\n');

        // Test prompt for user stories
        console.log('3. Testing user stories prompt...');
        const testResult = await enhancedProcessor.testPromptForDocumentType(
            'user-stories',
            'Sample project: A web application for task management with user authentication, task creation, and team collaboration features.'
        );

        if (testResult.promptFound) {
            console.log('✅ User stories prompt found and tested');
            if (testResult.testGeneration?.success) {
                console.log(`   Generated content length: ${testResult.testGeneration.content.length} characters`);
                console.log(`   Quality score: ${testResult.testGeneration.qualityScore}/100`);
            }
        } else {
            console.log('❌ User stories prompt not found');
        }

        // Test prompt for business case
        console.log('\n4. Testing business case prompt...');
        const businessCaseResult = await enhancedProcessor.testPromptForDocumentType(
            'business-case',
            'Sample project: Digital transformation initiative to modernize legacy systems and improve operational efficiency.'
        );

        if (businessCaseResult.promptFound) {
            console.log('✅ Business case prompt found and tested');
            if (businessCaseResult.testGeneration?.success) {
                console.log(`   Generated content length: ${businessCaseResult.testGeneration.content.length} characters`);
                console.log(`   Quality score: ${businessCaseResult.testGeneration.qualityScore}/100`);
            }
        } else {
            console.log('❌ Business case prompt not found');
        }

        // Show available document types
        console.log('\n5. Available document types:');
        const availableTypes = enhancedProcessor.getAvailableDocumentTypes();
        console.log(`   Total: ${availableTypes.length}`);
        console.log('   Sample types:');
        for (const type of availableTypes.slice(0, 10)) {
            console.log(`     • ${type}`);
        }
        if (availableTypes.length > 10) {
            console.log(`     ... and ${availableTypes.length - 10} more`);
        }

        console.log('\n🎉 Prompt system test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test
testPromptSystem();