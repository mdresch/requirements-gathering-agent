#!/usr/bin/env node

/**
 * Debug Google AI Provider Issue
 * Test Google AI provider in isolation to identify switching cause
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
try {
    const envContent = readFileSync(join(__dirname, '.env'), 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (error) {
    console.log('Warning: Could not load .env file, using existing environment variables');
}

// Import the compiled modules
console.log('Loading AI modules...');
import('./dist/modules/ai/AIProcessor.js').then(async (aiModule) => {
    console.log('AI modules loaded:', Object.keys(aiModule));
    const { AIProcessor } = aiModule;
    
    console.log('🔍 Starting Google AI Debug Test\n');

    try {
        // Test direct AI processor interaction
        const aiProcessor = AIProcessor.getInstance();
        
        console.log('1. Testing direct Google AI client...');
        
        // Check the Google AI client initialization
        const { AIClientManager } = await import('./dist/modules/ai/AIClientManager.js');
        const clientManager = AIClientManager.getInstance();
        
        try {
            await clientManager.initializeSpecificProvider('google-ai');
            const googleClient = clientManager.getClient('google-ai');
            console.log(`   Google AI client initialized: ${googleClient ? '✅ SUCCESS' : '❌ FAILED'}`);
            
            if (googleClient) {
                console.log('   Testing direct Google AI model call...');
                try {
                    const model = googleClient.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const result = await model.generateContent({
                        contents: [{ role: 'user', parts: [{ text: 'Say hello' }] }],
                        generationConfig: { maxOutputTokens: 10, temperature: 0.7 }
                    });
                    const response = await result.response;
                    const text = response.text();
                    console.log(`   ✅ Direct Google AI call successful: "${text}"`);
                } catch (directError) {
                    console.error(`   ❌ Direct Google AI call failed:`, directError.message);
                }
            }
        } catch (clientError) {
            console.error(`   ❌ Google AI client initialization failed:`, clientError.message);
        }
        
        console.log('\n2. Testing connection to Google AI...');
        const isConnected = await aiProcessor.testConnection('google-ai');
        console.log(`   Google AI Connection: ${isConnected ? '✅ SUCCESS' : '❌ FAILED'}`);
        
        if (isConnected) {
            console.log('\n2. Making test AI call with Google AI...');
            const messages = [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say "Hello from Google AI!" in response.' }
            ];
            
            const response = await aiProcessor.makeAICall(messages, 50);
            console.log(`   Response: ${response.content}`);
            console.log(`   Provider used: ${response.metadata.provider}`);
            console.log(`   Tokens used: ${response.metadata.tokensUsed}`);
            console.log(`   Response time: ${response.metadata.responseTime}ms`);
        }
        
    } catch (error) {
        console.error('❌ Debug test failed:', error.message);
        console.error('   Stack trace:', error.stack);
    }

}).catch(error => {
    console.error('❌ Failed to load modules:', error);
    process.exit(1);
});
