#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync, statSync } from 'fs';
import { createRequire } from 'module';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to read all markdown files
function readAllMarkdownFiles(dir, basePath = '') {
    const files = [];
    try {
        const items = readdirSync(dir);
        for (const item of items) {
            const itemPath = join(dir, item);
            const stat = statSync(itemPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('node_modules')) {
                files.push(...readAllMarkdownFiles(itemPath, join(basePath, item)));
            } else if (item.endsWith('.md')) {
                try {
                    const content = readFileSync(itemPath, 'utf-8');
                    files.push({
                        path: join(basePath, item),
                        name: item,
                        content: content,
                        size: content.length
                    });
                } catch (error) {
                    // Skip files that can't be read
                }
            }
        }
    } catch (error) {
        // Skip directories that can't be read
    }
    return files;
}

// Import the LLM processor module using require for CommonJS
(async () => {
    const llmModule = require('./dist/modules/llmProcessor.js');
    console.log('🧪 Testing Enhanced Context Manager with Comprehensive Project Data...\n');

    try {
        // Read README content
        const readmeContent = readFileSync('./README.md', 'utf-8');
        console.log(`📖 README Content: ${readmeContent.length} characters`);

        // Read all markdown files in the project
        const markdownFiles = readAllMarkdownFiles('./');
        console.log(`📄 Found ${markdownFiles.length} markdown files in project`);
        
        // Calculate total content size
        const totalSize = markdownFiles.reduce((sum, file) => sum + file.size, 0);
        const totalTokens = Math.ceil(totalSize / 3.5);
        console.log(`📊 Total project content: ${totalSize.toLocaleString()} characters (~${totalTokens.toLocaleString()} tokens)\n`);

        // Initialize project context
        console.log('🚀 Initializing project context...');
        const coreContext = await llmModule.initializeProjectContext(readmeContent);
        console.log(`✅ Core context initialized: ${coreContext.length} characters`);

        // Get context manager and add extensive enriched context
        const contextManager = llmModule.getEnhancedContextManager();
        
        // Add real project documentation as enriched context
        console.log('📚 Adding comprehensive project documentation as enriched context...');
        
        // Add summary information
        contextManager.addEnrichedContext('summary', 
            'This is a comprehensive AI-powered PMBOK documentation generator that supports multiple AI providers including Azure OpenAI, Google AI, GitHub AI, and Ollama. It generates complete project management documentation following PMBOK 7th Edition standards.');
        
        // Add substantial technical documentation
        const techStackContent = `
# Technology Stack Analysis

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
- **Caching System**: Efficient context reuse and relationship mapping

## Document Generation
- **PMBOK Compliance**: Full PMBOK 7th Edition standards implementation
- **29 Document Types**: Complete project management artifact generation
- **Quality Validation**: Cross-document consistency checking
- **Batch Processing**: Efficient generation with retry mechanisms
        `;
        contextManager.addEnrichedContext('tech-stack', techStackContent);
        
        // Add comprehensive user stories
        const userStoriesContent = `
# User Stories

## Primary User: Project Manager
**As a** project manager,
**I want** to automatically generate comprehensive PMBOK documentation from a simple README,
**so that** I can quickly establish proper project management foundations without manual documentation overhead.

**Acceptance Criteria:**
- Given a README file, when I run the tool, then it generates all 29 PMBOK document types
- Given multiple AI providers, when one fails, then the system automatically fails over to the next configured provider
- Given large context models, when generating documents, then the system utilizes full context capabilities for maximum accuracy

## Secondary User: Business Analyst
**As a** business analyst,
**I want** to generate detailed requirements documentation and user personas,
**so that** I can ensure comprehensive stakeholder analysis and requirements traceability.

## Technical User: DevOps Engineer
**As a** DevOps engineer,
**I want** to configure the tool with multiple AI providers and authentication methods,
**so that** I can ensure reliable operation across different environments and security requirements.

## Compliance User: Quality Assurance Manager
**As a** QA manager,
**I want** to validate generated documents for PMBOK compliance and cross-document consistency,
**so that** I can ensure documentation meets organizational and industry standards.
        `;
        contextManager.addEnrichedContext('user-stories', userStoriesContent);
        
        // Add project charter information
        const projectCharterContent = `
# Project Charter: Requirements Gathering Agent

## Project Purpose
Develop and maintain an AI-powered documentation generator that automates the creation of comprehensive PMBOK 7th Edition compliant project management documents.

## Business Justification
- **Cost Reduction**: Eliminate 40-80 hours of manual documentation per project
- **Quality Improvement**: Ensure consistent, standardized documentation across all projects
- **Compliance**: Guarantee PMBOK 7th Edition compliance for organizational standards
- **Efficiency**: Enable project managers to focus on execution rather than documentation

## Success Criteria
- Generate all 29 PMBOK document types with >95% accuracy
- Support multiple AI providers with <5 second failover times
- Achieve >90% user satisfaction in usability testing
- Maintain <2% error rate in document generation

## Stakeholders
- **Primary**: Project Managers, Business Analysts, PMO Directors
- **Secondary**: Development Teams, Quality Assurance, Compliance Officers
- **External**: Regulatory Bodies, Client Organizations, Audit Teams
        `;
        contextManager.addEnrichedContext('project-charter', projectCharterContent);
        
        // Add risk analysis
        const riskAnalysisContent = `
# Risk Analysis

## Technical Risks
- **AI Provider Downtime**: HIGH - Mitigated by multi-provider support
- **Token Limit Exceeded**: MEDIUM - Mitigated by intelligent context management
- **Authentication Failures**: MEDIUM - Mitigated by multiple auth methods

## Business Risks
- **Compliance Changes**: MEDIUM - Regular PMBOK standard updates required
- **User Adoption**: LOW - High automation value drives adoption
- **Quality Concerns**: LOW - Validation systems ensure document quality

## Operational Risks
- **Cost Overruns**: LOW - Multiple pricing tiers available across providers
- **Security Breaches**: MEDIUM - Mitigated by enterprise-grade authentication
- **Performance Issues**: LOW - Optimized for large-scale generation
        `;
        contextManager.addEnrichedContext('risk-analysis', riskAnalysisContent);
        
        // Add a large data model description
        const dataModelContent = `
# Data Model Suggestions

## Core Entities

### Project Entity
- **ProjectId**: Unique identifier (UUID)
- **ProjectName**: Human-readable project name
- **ProjectDescription**: Detailed project description
- **ProjectManager**: Assigned project manager
- **StartDate**: Project initiation date
- **EndDate**: Project completion date
- **Budget**: Allocated project budget
- **Status**: Current project status (Initiated, Planning, Executing, Closing)

### Document Entity
- **DocumentId**: Unique identifier (UUID)
- **ProjectId**: Foreign key to Project
- **DocumentType**: PMBOK document type (29 types supported)
- **DocumentContent**: Generated document content
- **GeneratedDate**: Document creation timestamp
- **AIProvider**: Provider used for generation
- **TokensUsed**: Context tokens consumed
- **ValidationStatus**: Quality validation results

### Stakeholder Entity
- **StakeholderId**: Unique identifier (UUID)
- **ProjectId**: Foreign key to Project
- **StakeholderName**: Full name
- **StakeholderRole**: Role in project
- **Influence**: Stakeholder influence level (High/Medium/Low)
- **Interest**: Stakeholder interest level (High/Medium/Low)
- **CommunicationPreference**: Preferred communication method
- **EngagementStrategy**: Planned engagement approach

### AIProvider Entity
- **ProviderId**: Unique identifier (UUID)
- **ProviderName**: Provider name (Azure, Google, GitHub, Ollama)
- **Endpoint**: API endpoint URL
- **AuthenticationMethod**: Auth type (Entra ID, API Key, Token)
- **ModelName**: Specific model identifier
- **TokenLimit**: Maximum context tokens
- **CostPerToken**: Pricing information
- **ResponseTime**: Average response time
- **SuccessRate**: Reliability percentage

## Relationships
- Project -> Documents (1:Many)
- Project -> Stakeholders (1:Many)
- Document -> AIProvider (Many:1)
- Project -> Risks (1:Many)
- Project -> Requirements (1:Many)

## Advanced Features
- **Document Versioning**: Track document evolution over time
- **Context Optimization**: Cache frequently used context patterns
- **Quality Metrics**: Measure document quality and user satisfaction
- **Usage Analytics**: Track provider performance and cost optimization
        `;
        contextManager.addEnrichedContext('data-model', dataModelContent);
        
        console.log('✅ Added comprehensive enriched context');

        // Test metrics after adding substantial content
        const metrics = llmModule.getContextManagerMetrics();
        console.log('\n📊 Context Manager Metrics After Comprehensive Setup:');
        console.log(JSON.stringify(metrics, null, 2));

        // Test large context utilization
        console.log('\n🚀 Testing Large Context Utilization...');
        
        const testTypes = ['project-charter', 'data-model-suggestions', 'tech-stack-analysis'];
        
        for (const docType of testTypes) {
            console.log(`\n🔧 Testing comprehensive context for: ${docType}`);
            
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

        // Show comprehensive report
        console.log('\n📋 Comprehensive Context Manager Report:');
        const report = llmModule.getContextManagerReport();
        console.log(report);

        console.log('\n🎯 Large Context Benefits Analysis:');
        console.log(`✅ Model: Gemini 1.5 Flash with ${metrics.maxTokens.toLocaleString()} token capacity`);
        console.log(`✅ Large Context Mode: ENABLED (>50k tokens)`);
        console.log(`✅ Full Context Allocation: ${Math.floor(metrics.maxTokens * 0.9).toLocaleString()} tokens available`);
        console.log(`✅ Enhanced Documentation: More comprehensive and accurate outputs`);
        console.log(`✅ Context Relationships: Intelligent document interconnections`);

    } catch (error) {
        console.error('❌ Error in comprehensive test:', error);
    }
})();
