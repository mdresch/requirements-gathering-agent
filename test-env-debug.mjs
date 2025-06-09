#!/usr/bin/env node

/**
 * Debug Environment Variables
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

console.log('🔍 Environment Variables Debug\n');

const relevantVars = [
    'GOOGLE_AI_API_KEY',
    'AZURE_OPENAI_ENDPOINT', 
    'AZURE_OPENAI_API_KEY',
    'USE_ENTRA_ID',
    'AZURE_CLIENT_ID',
    'AZURE_TENANT_ID',
    'AZURE_AI_ENDPOINT',
    'AZURE_AI_API_KEY'
];

relevantVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? `"${value}"` : 'undefined'}`);
});

console.log('\nChecking Azure provider logic:');
console.log(`azure-openai check: AZURE_OPENAI_ENDPOINT="${process.env.AZURE_OPENAI_ENDPOINT}" && USE_ENTRA_ID="${process.env.USE_ENTRA_ID}" === 'true'`);
console.log(`Result: ${!!(process.env.AZURE_OPENAI_ENDPOINT && process.env.USE_ENTRA_ID === 'true')}`);

console.log(`azure-ai-studio check: AZURE_AI_ENDPOINT includes openai.azure.com: ${process.env.AZURE_AI_ENDPOINT?.includes('openai.azure.com')} && AZURE_AI_API_KEY exists: ${!!process.env.AZURE_AI_API_KEY}`);
console.log(`Result: ${!!(process.env.AZURE_AI_ENDPOINT?.includes('openai.azure.com') && process.env.AZURE_AI_API_KEY)}`);
