/**
 * Test to debug provider validation consistency between ProviderManager and Interactive Menu
 */

import { ProviderManager } from './dist/modules/ai/ProviderManager.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testing Provider Validation Consistency\n');

async function testProviderConsistency() {
  try {
    // Test ProviderManager validation
    console.log('📋 ProviderManager Validation:');
    const providerManager = new ProviderManager();
    const validationResults = await providerManager.validateConfigurations();
    
    console.log('Validation Results:');
    for (const [provider, isValid] of validationResults) {
      console.log(`  ${provider}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    console.log(`\nActive Provider: ${providerManager.getActiveProvider()}`);
    console.log(`Fallback Queue: [${providerManager.getFallbackQueue().join(', ')}]`);
    
    // Test environment variables
    console.log('\n🔧 Environment Variables:');
    console.log(`AZURE_OPENAI_ENDPOINT: ${process.env.AZURE_OPENAI_ENDPOINT ? '✅ Set' : '❌ Not set'}`);
    console.log(`AZURE_OPENAI_API_KEY: ${process.env.AZURE_OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`AZURE_OPENAI_DEPLOYMENT_NAME: ${process.env.AZURE_OPENAI_DEPLOYMENT_NAME ? '✅ Set' : '❌ Not set'}`);
    console.log(`AZURE_AI_ENDPOINT: ${process.env.AZURE_AI_ENDPOINT ? '✅ Set' : '❌ Not set'}`);
    console.log(`AZURE_AI_API_KEY: ${process.env.AZURE_AI_API_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`GOOGLE_AI_API_KEY: ${process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ Not set'}`);
    
    // Test specific Azure validation
    console.log('\n🧪 Testing Azure OpenAI Configuration:');
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    
    console.log(`Endpoint: ${azureEndpoint || 'NOT SET'}`);
    console.log(`API Key: ${azureApiKey ? azureApiKey.substring(0, 10) + '...' : 'NOT SET'}`);
    console.log(`Deployment: ${deploymentName || 'NOT SET'}`);
    
    if (azureEndpoint && azureApiKey) {
      console.log('✅ Azure OpenAI should be valid');
    } else {
      console.log('❌ Azure OpenAI configuration incomplete');
    }
    
  } catch (error) {
    console.error('❌ Error during provider consistency test:', error);
  }
}

testProviderConsistency();
