#!/usr/bin/env node
/**
 * Debug Azure AI Studio Provider Validation
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment
dotenv.config();

async function debugAzureAIStudio() {
    console.log('🔧 Debug Azure AI Studio Provider Validation...\n');

    // Check environment variables exactly like the provider does
    const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
    
    console.log('📋 Environment Variables:');
    console.log('AZURE_AI_ENDPOINT:', process.env.AZURE_AI_ENDPOINT || 'NOT SET');
    console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT || 'NOT SET');
    console.log('AZURE_AI_API_KEY:', process.env.AZURE_AI_API_KEY ? 'SET' : 'NOT SET');
    console.log('AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? 'SET' : 'NOT SET');
    console.log('');
    
    console.log('📋 Computed Values:');
    console.log('endpoint:', endpoint);
    console.log('apiKey:', apiKey ? 'SET (length: ' + apiKey.length + ')' : 'NOT SET');
    console.log('endpoint includes openai.azure.com:', endpoint?.includes('openai.azure.com'));
    console.log('Both conditions met:', !!(endpoint?.includes('openai.azure.com') && apiKey));
    console.log('');

    if (!(endpoint?.includes('openai.azure.com') && apiKey)) {
        console.log('❌ Provider check will fail: Missing endpoint or API key');
        return;
    }

    console.log('🔍 Testing API call to Azure OpenAI...');
    try {
        const response = await fetch(`${endpoint}/openai/deployments`, {
            headers: { 
                'api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response OK:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('📡 Error response:', errorText);
        } else {
            const data = await response.json();
            console.log('📡 Success! Deployments:', data);
        }
        
    } catch (error) {
        console.error('❌ API call failed:', error.message);
    }
}

debugAzureAIStudio();
