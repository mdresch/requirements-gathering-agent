#!/usr/bin/env node
/**
 * Test Azure Provider Configuration Fix
 */

import dotenv from 'dotenv';
import { ProviderManager } from './src/modules/ai/ProviderManager.js';

// Load environment
dotenv.config();

async function testAzureProviderFix() {
    console.log('🔧 Testing Azure Provider Configuration Fix...\n');

    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT || 'NOT SET');
    console.log('AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? 'SET (length: ' + process.env.AZURE_OPENAI_API_KEY.length + ')' : 'NOT SET');
    console.log('AZURE_AI_ENDPOINT:', process.env.AZURE_AI_ENDPOINT || 'NOT SET');
    console.log('AZURE_AI_API_KEY:', process.env.AZURE_AI_API_KEY ? 'SET (length: ' + process.env.AZURE_AI_API_KEY.length + ')' : 'NOT SET');
    console.log('');

    try {
        const providerManager = new ProviderManager();
        const results = await providerManager.validateConfigurations();
        
        console.log('🎯 Provider Validation Results:');
        for (const [provider, isValid] of results) {
            console.log(`  ${provider}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        }
        
        const activeProvider = providerManager.getActiveProvider();
        console.log(`\n🚀 Active provider: ${activeProvider || 'None'}`);
        
        if (results.get('azure-ai-studio')) {
            console.log('\n✅ Azure AI Studio provider validation successful!');
        } else {
            console.log('\n❌ Azure AI Studio provider validation failed');
        }
        
    } catch (error) {
        console.error('❌ Error during provider validation:', error.message);
    }
}

testAzureProviderFix();
