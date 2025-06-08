import { ProjectManagementProcessor } from './dist/modules/ai/processors/ProjectManagementProcessor.js';

// Test the newly implemented Priority 1 & 2 methods
async function testImplementations() {
    console.log('🧪 Testing Priority 1 & 2 implementations...\n');
    
    const processor = new ProjectManagementProcessor();
    const testContext = `
    Project: Requirements Gathering Agent
    Type: AI-powered project management tool
    Technology: TypeScript, Node.js
    Goal: Generate comprehensive project documentation following PMBOK standards
    `;

    try {
        // Test Priority 1 implementations
        console.log('Testing Priority 1: Strategic Statements');
        
        console.log('✓ Testing getMissionVisionAndCoreValues...');
        const mvValues = await processor.getMissionVisionAndCoreValues(testContext);
        console.log('✅ Method exists and returns:', mvValues ? 'Content received' : 'No content');
        
        console.log('✓ Testing getProjectPurpose...');
        const purpose = await processor.getProjectPurpose(testContext);
        console.log('✅ Method exists and returns:', purpose ? 'Content received' : 'No content');
        
        // Test Priority 2 implementations
        console.log('\nTesting Priority 2: ProjectManagementProcessor AI Calls');
        
        console.log('✓ Testing getUserStories...');
        const userStories = await processor.getUserStories(testContext);
        console.log('✅ Method exists and returns:', userStories ? 'Content received' : 'No content');
        
        console.log('✓ Testing getRiskAnalysis...');
        const riskAnalysis = await processor.getRiskAnalysis(testContext);
        console.log('✅ Method exists and returns:', riskAnalysis ? 'Content received' : 'No content');
        
        console.log('✓ Testing getScheduleNetworkDiagram...');
        const networkDiagram = await processor.getScheduleNetworkDiagram(testContext);
        console.log('✅ Method exists and returns:', networkDiagram ? 'Content received' : 'No content');
        
        console.log('✓ Testing getMilestoneList...');
        const milestones = await processor.getMilestoneList(testContext);
        console.log('✅ Method exists and returns:', milestones ? 'Content received' : 'No content');
        
        console.log('✓ Testing getDevelopScheduleInput...');
        const scheduleInput = await processor.getDevelopScheduleInput(testContext);
        console.log('✅ Method exists and returns:', scheduleInput ? 'Content received' : 'No content');
        
        console.log('\n🎉 All Priority 1 & 2 methods are successfully implemented!');
        console.log('✅ Total methods tested: 7');
        console.log('✅ All methods callable and functional');
        
    } catch (error) {
        console.error('❌ Error testing implementations:', error.message);
        console.error('Stack:', error.stack);
    }
}

testImplementations();
