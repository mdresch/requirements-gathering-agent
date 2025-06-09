/**
 * Quick test to verify Azure OpenAI provider is now being recognized correctly
 */

import { ProviderManager } from './dist/modules/ai/ProviderManager.js';
import { AIClientManager } from './dist/modules/ai/AIClientManager.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAzureProvider() {
  console.log('🔍 Testing Azure OpenAI Provider Recognition\n');
  
  try {
    // Test ProviderManager validation
    const providerManager = new ProviderManager();
    const validationResults = await providerManager.validateConfigurations();
    
    console.log('📋 Provider Validation Results:');
    for (const [provider, isValid] of validationResults) {
      console.log(`  ${provider}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    console.log(`\nActive Provider: ${providerManager.getActiveProvider()}`);
    console.log(`Fallback Queue: [${providerManager.getFallbackQueue().join(', ')}]`);
    
    // Test AIClientManager initialization
    if (providerManager.getActiveProvider() === 'azure-openai-key') {
      console.log('\n🚀 Testing AIClientManager with Azure OpenAI...');
      const clientManager = new AIClientManager();
      console.log('✅ AIClientManager initialization successful');
    }
    
  } catch (error) {
    console.error('❌ Error during Azure provider test:', error);
  }
}

testAzureProvider();
