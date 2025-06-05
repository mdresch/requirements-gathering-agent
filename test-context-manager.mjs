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
    console.log('🧪 Testing Enhanced Context Manager...\n');

    try {
        // Get the context manager metrics
        const metrics = llmModule.getContextManagerMetrics();
        console.log('📊 Current Context Manager Metrics:');
        console.log(JSON.stringify(metrics, null, 2));
        console.log();

        // Test with different document types
        const testDocumentTypes = [
            'project-charter',
            'user-stories', 
            'tech-stack-analysis',
            'risk-analysis'
        ];

        for (const docType of testDocumentTypes) {
            console.log(`🔧 Testing context building for: ${docType}`);
            
            // Build context for the document type
            const context = llmModule.buildDocumentContext(docType);
            
            // Get token estimate (approximate)
            const tokenEstimate = Math.ceil(context.length / 3.5);
            
            console.log(`   📄 Generated context: ${context.length} characters (~${tokenEstimate.toLocaleString()} tokens)`);
            console.log(`   📝 Context preview: ${context.substring(0, 150)}...`);
            console.log();
        }

        // Test context manager report
        console.log('📋 Context Manager Report:');
        const report = llmModule.getContextManagerReport();
        console.log(report);

    } catch (error) {
        console.error('❌ Error testing context manager:', error);
    }
}).catch(error => {
    console.error('❌ Failed to import LLM processor:', error);
    console.log('💡 Make sure to run "npm run build" first to compile TypeScript');
});
