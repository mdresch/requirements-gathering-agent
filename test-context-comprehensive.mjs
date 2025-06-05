#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the LLM processor module
import('./dist/modules/llmProcessor.js').then(async (llmModule) => {
    console.log('🧪 Testing Enhanced Context Manager with Real Project Data...\n');

    try {
        // Read README content
        const readmeContent = readFileSync('./README.md', 'utf-8');
        console.log(`📖 README Content: ${readmeContent.length} characters\n`);

        // Initialize project context
        console.log('🚀 Initializing project context...');
        const coreContext = await llmModule.initializeProjectContext(readmeContent);
        console.log(`✅ Core context initialized: ${coreContext.length} characters\n`);

        // Add some enriched context to simulate documents already generated
        const contextManager = llmModule.getEnhancedContextManager();
        
        // Simulate some generated content
        contextManager.addEnrichedContext('summary', 'This is a comprehensive requirements gathering agent that uses AI to generate PMBOK documentation.');
        contextManager.addEnrichedContext('tech-stack', 'Technology stack includes TypeScript, Node.js, Azure OpenAI, Google AI, and supports multiple AI providers.');
        contextManager.addEnrichedContext('user-stories', 'User stories focus on project managers, business analysts, and stakeholders who need automated documentation generation.');

        // Test metrics after initialization
        const metrics = llmModule.getContextManagerMetrics();
        console.log('📊 Context Manager Metrics After Initialization:');
        console.log(JSON.stringify(metrics, null, 2));
        console.log();

        // Test context building for different document types
        const testDocumentTypes = [
            'project-charter',
            'user-stories', 
            'tech-stack-analysis',
            'risk-analysis',
            'data-model-suggestions'
        ];

        for (const docType of testDocumentTypes) {
            console.log(`🔧 Testing context building for: ${docType}`);
            
            // Build context for the document type
            const context = llmModule.buildDocumentContext(docType);
            
            // Get token estimate (approximate)
            const tokenEstimate = Math.ceil(context.length / 3.5);
            
            console.log(`   📄 Generated context: ${context.length} characters (~${tokenEstimate.toLocaleString()} tokens)`);
            console.log(`   📝 Context preview: ${context.substring(0, 200)}...`);
            
            // Check if it's utilizing large context capabilities
            if (tokenEstimate > 50000) {
                console.log(`   🌟 LARGE CONTEXT: Successfully utilizing high token capacity!`);
            } else if (tokenEstimate > 10000) {
                console.log(`   📈 MEDIUM CONTEXT: Good token utilization`);
            } else {
                console.log(`   📝 STANDARD CONTEXT: Normal token usage`);
            }
            console.log();
        }

        // Test provider metrics
        console.log('🔍 Provider Performance Metrics:');
        const providerMetrics = llmModule.getProviderMetrics();
        console.log(JSON.stringify(providerMetrics, null, 2));
        console.log();

        // Generate context manager report
        console.log('📋 Final Context Manager Report:');
        const report = llmModule.getContextManagerReport();
        console.log(report);

        // Test model detection
        console.log('\n🤖 Model Detection Test:');
        console.log('Detected large context support:', metrics.maxTokens > 50000 ? 'YES' : 'NO');
        console.log('Token allocation:');
        console.log(`  - Core: ${Math.floor(metrics.maxTokens * 0.3).toLocaleString()} tokens (30%)`);
        console.log(`  - Enriched: ${Math.floor(metrics.maxTokens * 0.6).toLocaleString()} tokens (60%)`);
        console.log(`  - Full: ${Math.floor(metrics.maxTokens * 0.9).toLocaleString()} tokens (90%)`);

    } catch (error) {
        console.error('❌ Error testing context manager:', error);
    }
}).catch(error => {
    console.error('❌ Failed to import LLM processor:', error);
    console.log('💡 Make sure to run "npm run build" first to compile TypeScript');
});
