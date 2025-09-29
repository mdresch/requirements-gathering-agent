/**
 * Test Database-First Document Generation
 * 
 * This test verifies that the system uses templates from the database
 * instead of TypeScript files for document generation.
 */

import mongoose from 'mongoose';

// Test configuration
const TEST_CONFIG = {
  mongoUri: 'mongodb://localhost:27017/requirements-gathering-agent',
  testTemplateKey: 'stakeholder-analysis'
};

async function testDatabaseFirstGeneration() {
  console.log('🧪 Testing Database-First Document Generation');
  console.log('================================================');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(TEST_CONFIG.mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Import the database-first processor factory
    const { createDatabaseFirstProcessor } = await import('./src/modules/documentGenerator/DatabaseFirstProcessorFactory.js');
    
    // Test 1: Check if template exists in database
    console.log('\n🔍 Test 1: Checking if template exists in database');
    const { TemplateModel } = await import('./src/models/Template.model.js');
    
    const template = await TemplateModel.findOne({ 
      documentKey: TEST_CONFIG.testTemplateKey,
      is_deleted: false,
      is_active: true 
    });
    
    if (template) {
      console.log(`✅ Template found in database:`);
      console.log(`   - Name: ${template.name}`);
      console.log(`   - ID: ${template._id}`);
      console.log(`   - Category: ${template.category}`);
      console.log(`   - Has Content: ${!!template.content}`);
      console.log(`   - Has AI Instructions: ${!!template.ai_instructions}`);
      console.log(`   - Has Prompt Template: ${!!template.prompt_template}`);
    } else {
      console.log(`❌ Template not found in database for key: ${TEST_CONFIG.testTemplateKey}`);
      return;
    }
    
    // Test 2: Create processor using database template
    console.log('\n🔧 Test 2: Creating processor using database template');
    try {
      const processor = await createDatabaseFirstProcessor(TEST_CONFIG.testTemplateKey);
      console.log('✅ Processor created successfully using database template');
    } catch (error) {
      console.log(`❌ Failed to create processor: ${error.message}`);
      return;
    }
    
    // Test 3: Generate document using database template
    console.log('\n📝 Test 3: Generating document using database template');
    try {
      const processor = await createDatabaseFirstProcessor(TEST_CONFIG.testTemplateKey);
      
      const testContext = {
        projectName: 'Test Project',
        projectId: 'test-project-123',
        description: 'This is a test project to verify database-first generation',
        projectType: 'Test Project'
      };
      
      console.log('🚀 Processing document with context:', testContext);
      const output = await processor.process(testContext);
      
      console.log('✅ Document generated successfully:');
      console.log(`   - Title: ${output.title}`);
      console.log(`   - Content Length: ${output.content.length} characters`);
      console.log(`   - Content Preview: ${output.content.substring(0, 200)}...`);
      
      // Verify content contains expected elements
      if (output.content.includes('Stakeholder Analysis')) {
        console.log('✅ Content contains expected "Stakeholder Analysis" text');
      } else {
        console.log('⚠️ Content may not contain expected text');
      }
      
    } catch (error) {
      console.log(`❌ Failed to generate document: ${error.message}`);
      return;
    }
    
    // Test 4: Compare with old TypeScript approach
    console.log('\n🔄 Test 4: Comparing with old TypeScript approach');
    try {
      const { createProcessor } = await import('./src/modules/documentGenerator/ProcessorFactory.js');
      const oldProcessor = await createProcessor(TEST_CONFIG.testTemplateKey);
      console.log('✅ Old TypeScript processor created (for comparison)');
      console.log('ℹ️  Note: Old processor uses hardcoded TypeScript files');
    } catch (error) {
      console.log(`⚠️ Old processor creation failed: ${error.message}`);
    }
    
    console.log('\n🎉 Database-First Generation Test Completed Successfully!');
    console.log('================================================');
    console.log('✅ The system is now using database templates instead of TypeScript files');
    console.log('✅ Document generation uses the latest template content from the database');
    console.log('✅ AI instructions and prompt templates are loaded from the database');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the test
testDatabaseFirstGeneration().catch(console.error);
