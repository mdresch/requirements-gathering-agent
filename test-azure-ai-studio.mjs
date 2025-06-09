#!/usr/bin/env node

/**
 * Test Azure AI Studio provider directly to bypass Google AI quota issue
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

// Force Azure AI Studio as the preferred provider by temporarily disabling Google AI
const originalGoogleKey = process.env.GOOGLE_AI_API_KEY;
delete process.env.GOOGLE_AI_API_KEY; // Temporarily disable Google AI

// Import the compiled modules
import('./dist/modules/documentGenerator/DocumentGenerator.js').then(async (docGenModule) => {
    const { DocumentGenerator } = docGenModule;
    
    console.log('🚀 Testing Azure AI Studio Provider\n');

    // Simple test context
    const testContext = `
Project: Test Project for Azure AI Studio
Description: A simple test to validate Azure AI Studio integration
Business Objectives: Test document generation
Technology Stack: Azure OpenAI, GPT-4
Team: Test team
Timeline: Test phase
    `.trim();

    try {
        console.log('📝 Testing project-statement-of-work generation with Azure AI Studio...');
        
        const generator = new DocumentGenerator(testContext);
        const result = await generator.generateOne('project-statement-of-work');
        
        console.log('Result:', result);
        
        if (result && result.success) {
            console.log('✅ Azure AI Studio generation completed successfully!');
            console.log('📂 Check the generated-documents/core-analysis/ directory for the output file.');
        } else {
            console.log('❌ Azure AI Studio generation failed:', result);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('   Stack:', error.stack);
    } finally {
        // Restore Google AI key
        if (originalGoogleKey) {
            process.env.GOOGLE_AI_API_KEY = originalGoogleKey;
        }
    }

}).catch(error => {
    console.error('❌ Failed to load modules:', error);
    process.exit(1);
});
