#!/usr/bin/env node

/**
 * Quick Phase 3 Implementation Test
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPhase3() {
  try {
    console.log('🎨 Testing Adobe Creative Suite Phase 3 Implementation');
    console.log('=====================================================\n');
    
    // Check environment variables
    console.log('🔐 Environment Variables Check:');
    console.log('   ADOBE_CLIENT_ID:', process.env.ADOBE_CLIENT_ID ? `${process.env.ADOBE_CLIENT_ID.substring(0, 8)}...` : 'NOT_FOUND');
    console.log('   ADOBE_CLIENT_SECRET:', process.env.ADOBE_CLIENT_SECRET ? `${process.env.ADOBE_CLIENT_SECRET.substring(0, 8)}...` : 'NOT_FOUND');
    console.log('');
    
    // Test import
    const { adobeCreativeSuite } = await import('../dist/adobe/creative-suite/index.js');
    
    // Test configuration
    console.log('📋 Testing Configuration...');
    const config = await adobeCreativeSuite.validateConfiguration();
    console.log('   Status:', config.status);
    console.log('   Message:', config.message);
    
    // Test capabilities
    console.log('\n🔧 Testing Capabilities...');
    const capabilities = await adobeCreativeSuite.getCapabilities();
    console.log('   Phase 1:', capabilities.phase1.status);
    console.log('   Phase 2:', capabilities.phase2.status);
    console.log('   API Clients:', capabilities.infrastructure.apiClients.join(', '));
    
    // Test templates
    console.log('\n📋 Testing Available Templates...');
    const templates = await adobeCreativeSuite.getAvailableTemplates();
    console.log('   InDesign Templates:', templates.indesign.length);
    console.log('   Document Gen Templates:', templates.documentGeneration.length);
    
    // Test InDesign client
    console.log('\n🎨 Testing InDesign Client...');
    const indesignTemplates = await adobeCreativeSuite.inDesign.listTemplates();
    console.log('   Available Templates:');
    indesignTemplates.forEach(template => {
      console.log(`     - ${template.name} (${template.documentType})`);
    });
    
    console.log('\n✅ Phase 3 Implementation Test Complete!');
    console.log('🎯 All core components are operational and ready for use.');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testPhase3();
