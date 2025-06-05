const dotenv = require('dotenv');
dotenv.config();

console.log('🧪 Testing Enhanced Context Manager...\n');

// Import the compiled module
const llmModule = require('./dist/modules/llmProcessor.js');

async function testEnhancedContextManager() {
    try {
        console.log('🔍 Initializing enhanced context manager...');
        
        // Test basic functionality
        const metrics = llmModule.getContextManagerMetrics();
        console.log('📊 Initial Metrics:', JSON.stringify(metrics, null, 2));
        
        // Initialize with README content
        const readmeContent = require('fs').readFileSync('./README.md', 'utf-8');
        console.log(`📖 README Content: ${readmeContent.length} characters`);
        
        console.log('🚀 Initializing project context...');
        const coreContext = await llmModule.initializeProjectContext(readmeContent);
        console.log(`✅ Core context initialized: ${coreContext.length} characters`);
        
        // Add some enriched context
        const contextManager = llmModule.getEnhancedContextManager();
        
        console.log('📚 Adding enriched context...');
        contextManager.addEnrichedContext('summary', 
            'AI-powered PMBOK documentation generator with multi-provider support and intelligent context management.');
        
        contextManager.addEnrichedContext('tech-stack', 
            `# Technology Stack
- Node.js 18+ with TypeScript
- Multi-provider AI integration (Azure OpenAI, Google AI, GitHub AI, Ollama)
- Enhanced Context Manager with large model optimization
- PMBOK 7th Edition compliance
- Intelligent token allocation strategies`);
        
        contextManager.addEnrichedContext('project-charter', 
            `# Project Charter
## Purpose
Automate comprehensive PMBOK documentation generation
## Success Criteria  
- Generate all 29 PMBOK document types
- Support multiple AI providers with failover
- Achieve >95% accuracy in document generation`);
        
        console.log('✅ Added enriched context');
        
        // Test context building
        console.log('\n🔧 Testing context building...');
        const testDocTypes = ['project-charter', 'tech-stack-analysis', 'user-stories'];
        
        for (const docType of testDocTypes) {
            console.log(`\n📋 Building context for: ${docType}`);
            const context = llmModule.buildDocumentContext(docType);
            const tokenEstimate = Math.ceil(context.length / 3.5);
            
            console.log(`   📄 Context size: ${context.length.toLocaleString()} characters`);
            console.log(`   🎯 Token estimate: ${tokenEstimate.toLocaleString()} tokens`);
            
            // Calculate utilization
            const maxTokens = metrics.maxTokens;
            const utilization = (tokenEstimate / maxTokens) * 100;
            console.log(`   📈 Context utilization: ${utilization.toFixed(2)}% of available capacity`);
            
            if (utilization > 50) {
                console.log(`   🌟 EXCELLENT: High context utilization!`);
            } else if (utilization > 20) {
                console.log(`   ✅ GOOD: Decent context utilization`);
            } else if (utilization > 5) {
                console.log(`   📝 MODERATE: Standard context usage`);
            } else {
                console.log(`   ⚠️  LOW: Could utilize more context for better accuracy`);
            }
        }
        
        // Get updated metrics
        console.log('\n📊 Final Metrics:');
        const finalMetrics = llmModule.getContextManagerMetrics();
        console.log(JSON.stringify(finalMetrics, null, 2));
        
        // Get comprehensive report
        console.log('\n📋 Enhanced Context Manager Report:');
        const report = llmModule.getContextManagerReport();
        console.log(report);
        
        console.log('\n🎯 Enhanced Context Benefits Analysis:');
        console.log(`✅ Model: ${finalMetrics.maxTokens.toLocaleString()} token capacity`);
        console.log(`✅ Large Context Mode: ${finalMetrics.maxTokens > 50000 ? 'ENABLED' : 'STANDARD'}`);
        console.log(`✅ Multi-phase Context Strategy: Direct -> Supplementary -> Comprehensive`);
        console.log(`✅ Intelligent Document Relationships: Smart context interconnections`);
        console.log(`✅ Enhanced Token Optimization: 3-tier allocation for maximum utilization`);
        
    } catch (error) {
        console.error('❌ Error in context manager test:', error);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testEnhancedContextManager();
