import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const AZURE_AI_ENDPOINT = process.env.AZURE_AI_ENDPOINT;

console.log('=== GitHub AI Endpoint Testing ===');
console.log(`Token available: ${!!GITHUB_TOKEN}`);
console.log(`Endpoint: ${AZURE_AI_ENDPOINT}`);

if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN not found');
    process.exit(1);
}

const endpoints = [
    '/api/healthz',
    '/api/v1/models',
    '/models',
    '/chat/completions',
    '/v1/models',
    '/v1/chat/completions'
];

async function testEndpoint(endpoint) {
    const url = `${AZURE_AI_ENDPOINT}${endpoint}`;
    console.log(`\nTesting: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`  Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const text = await response.text();
            console.log(`  Response length: ${text.length} characters`);
            if (text.length < 500) {
                console.log(`  Response: ${text}`);
            }
            return true;
        } else {
            const errorText = await response.text();
            console.log(`  Error: ${errorText.substring(0, 200)}`);
            return false;
        }
    } catch (error) {
        console.log(`  Error: ${error.message}`);
        return false;
    }
}

async function testAllEndpoints() {
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
}

await testAllEndpoints();
