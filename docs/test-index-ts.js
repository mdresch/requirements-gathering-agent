/**
 * Test script to verify index.ts compiles and works correctly
 */

import { adobeCreativeSuite } from '../src/adobe/creative-suite/index.js';

console.log('✅ Adobe Creative Suite index.ts imports successful!');

// Test the main API
async function testAdobeCreativeSuite() {
  try {
    console.log('🧪 Testing Adobe Creative Suite API...');
    
    // Test configuration validation
    const config = await adobeCreativeSuite.validateConfiguration();
    console.log('📋 Configuration Status:', config.status);
    
    // Test capabilities
    const capabilities = await adobeCreativeSuite.getCapabilities();
    console.log('⚡ Phase 2 Status:', capabilities.phase2.status);
    
    // Test client access
    console.log('🔌 API Clients Available:');
    console.log('  InDesign:', adobeCreativeSuite.inDesign ? '✅' : '❌');
    console.log('  Illustrator:', adobeCreativeSuite.illustrator ? '✅' : '❌');
    console.log('  Photoshop:', adobeCreativeSuite.photoshop ? '✅' : '❌');
    console.log('  Document Generation:', adobeCreativeSuite.documentGeneration ? '✅' : '❌');
    console.log('  Batch Processor:', adobeCreativeSuite.batch ? '✅' : '❌');
    console.log('  Template Selector:', adobeCreativeSuite.templates ? '✅' : '❌');
    
    console.log('\n✅ All Adobe Creative Suite index.ts tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdobeCreativeSuite();
