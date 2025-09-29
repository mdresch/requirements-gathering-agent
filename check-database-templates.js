/**
 * Check Database Templates
 * 
 * This script checks what templates exist in the database
 * and verifies if stakeholder-analysis template exists.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/requirements-gathering-agent';

async function checkDatabaseTemplates() {
  console.log('🔍 Checking Database Templates');
  console.log('================================');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import TemplateModel
    const { TemplateModel } = await import('./src/models/Template.model.js');
    
    // Check all templates
    console.log('\n📋 All Templates in Database:');
    const allTemplates = await TemplateModel.find({ is_deleted: false }).select('name documentKey category template_type is_active');
    
    if (allTemplates.length === 0) {
      console.log('❌ No templates found in database');
      console.log('💡 This explains why database-first generation is failing');
      return;
    }
    
    console.log(`✅ Found ${allTemplates.length} templates:`);
    allTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name}`);
      console.log(`      - Document Key: ${template.documentKey}`);
      console.log(`      - Category: ${template.category}`);
      console.log(`      - Type: ${template.template_type}`);
      console.log(`      - Active: ${template.is_active}`);
      console.log('');
    });
    
    // Check specifically for stakeholder-analysis
    console.log('🎯 Checking for stakeholder-analysis template:');
    const stakeholderTemplate = await TemplateModel.findOne({ 
      documentKey: 'stakeholder-analysis',
      is_deleted: false 
    });
    
    if (stakeholderTemplate) {
      console.log('✅ stakeholder-analysis template found:');
      console.log(`   - Name: ${stakeholderTemplate.name}`);
      console.log(`   - ID: ${stakeholderTemplate._id}`);
      console.log(`   - Category: ${stakeholderTemplate.category}`);
      console.log(`   - Has AI Instructions: ${!!stakeholderTemplate.ai_instructions}`);
      console.log(`   - Has Prompt Template: ${!!stakeholderTemplate.prompt_template}`);
      console.log(`   - Has Content: ${!!stakeholderTemplate.content}`);
      console.log(`   - Active: ${stakeholderTemplate.is_active}`);
      
      if (stakeholderTemplate.ai_instructions) {
        console.log(`   - AI Instructions Preview: ${stakeholderTemplate.ai_instructions.substring(0, 100)}...`);
      }
      
      if (stakeholderTemplate.prompt_template) {
        console.log(`   - Prompt Template Preview: ${stakeholderTemplate.prompt_template.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ stakeholder-analysis template NOT found in database');
      console.log('💡 This is why the system falls back to simple content generation');
    }
    
    // Check for any templates with similar names
    console.log('\n🔍 Checking for similar template names:');
    const similarTemplates = await TemplateModel.find({
      $or: [
        { name: { $regex: /stakeholder/i } },
        { documentKey: { $regex: /stakeholder/i } },
        { category: { $regex: /stakeholder/i } }
      ],
      is_deleted: false
    });
    
    if (similarTemplates.length > 0) {
      console.log(`✅ Found ${similarTemplates.length} stakeholder-related templates:`);
      similarTemplates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name} (${template.documentKey})`);
      });
    } else {
      console.log('❌ No stakeholder-related templates found');
    }
    
  } catch (error) {
    console.error('❌ Error checking templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the check
checkDatabaseTemplates().catch(console.error);
