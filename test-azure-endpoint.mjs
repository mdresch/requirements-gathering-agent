/**
 * Direct test of Azure OpenAI endpoint to debug validation issue
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAzureEndpoint() {
  console.log('🔍 Testing Azure OpenAI Endpoint Directly\n');
  
  const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
  
  console.log(`Endpoint: ${endpoint}`);
  console.log(`API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : 'NOT SET'}`);
  
  if (!endpoint || !apiKey) {
    console.log('❌ Missing endpoint or API key');
    return;
  }
  
  if (!endpoint.includes('openai.azure.com')) {
    console.log('❌ Endpoint does not contain openai.azure.com');
    return;
  }
  
  console.log('\n🚀 Testing endpoint validation...');
  
  try {
    // Test the exact validation logic from ProviderManager
    const testUrl = `${endpoint}/openai/deployments`;
    console.log(`Testing URL: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      headers: { 
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response ok: ${response.ok}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error response: ${errorText}`);
    } else {
      console.log('✅ Endpoint validation successful!');
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
}

testAzureEndpoint();
