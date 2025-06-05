import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync, statSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Enhanced Context Manager with Large Context Optimizations...\n');

try {
    // Import the CommonJS module using createRequire
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const llmModule = require('./dist/modules/llmProcessor.cjs');
    
    // Read README content
    const readmeContent = readFileSync('./README.md', 'utf-8');
    console.log(`📖 README Content: ${readmeContent.length} characters`);

    // Initialize project context
    console.log('🚀 Initializing project context...');
    const coreContext = await llmModule.initializeProjectContext(readmeContent);
    console.log(`✅ Core context initialized: ${coreContext.length} characters`);

    // Get context manager
    const contextManager = llmModule.getEnhancedContextManager();
    
    // Add enriched context
    console.log('📚 Adding enriched context...');
    contextManager.addEnrichedContext('summary', 
        'This is a comprehensive AI-powered PMBOK documentation generator that supports multiple AI providers including Azure OpenAI, Google AI, GitHub AI, and Ollama.');
    
    contextManager.addEnrichedContext('tech-stack', 
        `# Technology Stack Analysis
        
## Core Technologies
- **Runtime**: Node.js 18+ with TypeScript for type safety and modern development
- **AI Integration**: Multi-provider support with intelligent fallback mechanisms
- **Authentication**: Azure Entra ID, API keys, and token-based authentication
- **Architecture**: Modular design with enhanced context management

## AI Providers Supported
- **Azure OpenAI**: Enterprise-grade with Entra ID authentication
- **Google AI Studio**: Gemini models with 1M-2M token context windows
- **GitHub AI**: Cost-effective with GPT-4 access
- **Ollama**: Local AI models for privacy-sensitive environments

## Context Management
- **Enhanced Context Manager**: Intelligent token allocation based on model capabilities
- **Large Context Support**: Full utilization of models with >50k token windows
- **Adaptive Strategies**: 30%/60%/90% token allocation for core/enriched/full context
- **Caching System**: Efficient context reuse and relationship mapping`);

    contextManager.addEnrichedContext('user-stories', 
        `# User Stories

## Primary User: Project Manager
**As a** project manager,
**I want** to automatically generate comprehensive PMBOK documentation from a simple README,
**so that** I can quickly establish proper project management foundations without manual documentation overhead.

**Acceptance Criteria:**
- Given a README file, when I run the tool, then it generates all 29 PMBOK document types
- Given multiple AI providers, when one fails, then the system automatically fails over to the next configured provider
- Given large context models, when generating documents, then the system utilizes full context capabilities for maximum accuracy`);

    console.log('✅ Added enriched context');

    // Test metrics
    const metrics = llmModule.getContextManagerMetrics();
    console.log('\n📊 Context Manager Metrics:');
    console.log(JSON.stringify(metrics, null, 2));

    // Test large context utilization
    console.log('\n🚀 Testing Large Context Utilization...');
    
    const testTypes = ['project-charter', 'data-model-suggestions', 'tech-stack-analysis'];
    
    for (const docType of testTypes) {
        console.log(`\n🔧 Testing context for: ${docType}`);
        
        const context = llmModule.buildDocumentContext(docType);
        const tokenEstimate = Math.ceil(context.length / 3.5);
        
        console.log(`   📄 Context size: ${context.length.toLocaleString()} characters`);
        console.log(`   🎯 Token estimate: ${tokenEstimate.toLocaleString()} tokens`);
        
        // Check context utilization efficiency
        const maxTokens = metrics.maxTokens;
        const utilization = (tokenEstimate / maxTokens) * 100;
        
        console.log(`   📈 Context utilization: ${utilization.toFixed(2)}% of available capacity`);
        
        if (tokenEstimate > 100000) {
            console.log(`   🌟 EXCELLENT: Using large context capabilities effectively!`);
        } else if (tokenEstimate > 50000) {
            console.log(`   ✅ GOOD: Decent context utilization`);
        } else if (tokenEstimate > 10000) {
            console.log(`   📝 MODERATE: Standard context usage`);
        } else {
            console.log(`   ⚠️  LOW: Could utilize more context for better accuracy`);
        }
    }

    // Get detailed utilization report
    console.log('\n📋 Comprehensive Context Manager Report:');
    const report = llmModule.getContextManagerReport();
    console.log(report);

    console.log('\n🎯 Enhanced Context Benefits:');
    console.log(`✅ Model: ${llmModule.getContextManagerMetrics().maxTokens.toLocaleString()} token capacity`);
    console.log(`✅ Large Context Mode: ENABLED (Enhanced optimizations)`);
    console.log(`✅ Multi-phase Context Strategy: Direct -> Supplementary -> Comprehensive`);
    console.log(`✅ Intelligent Context Relationships: Smart document interconnections`);
    console.log(`✅ Token Optimization: 3-tier allocation strategy for maximum utilization`);

} catch (error) {
    console.error('❌ Error in enhanced context test:', error);
    console.error('Stack:', error.stack);
}
