/**
 * Context Window Validation Example
 * Demonstrates how to use the new context window validation system
 * for AI generation tasks.
 */

import { ContextWindowValidationService } from '../src/services/ContextWindowValidationService.js';
import { ContextFallbackStrategyService } from '../src/services/ContextFallbackStrategyService.js';
import { DocumentGenerator } from '../src/modules/documentGenerator/DocumentGenerator.js';

async function demonstrateContextWindowValidation() {
    console.log('🔍 Context Window Validation Example\n');

    // Initialize services
    const contextValidator = ContextWindowValidationService.getInstance();
    const fallbackService = ContextFallbackStrategyService.getInstance();

    // Example 1: Validate context window for different document types
    console.log('📋 Example 1: Document Type Validation');
    console.log('=====================================');

    const documentTypes = [
        { type: 'user-stories', complexity: 'low', tokens: 2000 },
        { type: 'requirements-specification', complexity: 'high', tokens: 15000 },
        { type: 'technical-specification', complexity: 'high', tokens: 25000 },
        { type: 'comprehensive-project-plan', complexity: 'very-high', tokens: 50000 }
    ];

    for (const doc of documentTypes) {
        console.log(`\n🔍 Validating ${doc.type} (${doc.complexity} complexity, ~${doc.tokens} tokens):`);
        
        const validation = await contextValidator.validateContextWindow(
            doc.type,
            doc.tokens,
            doc.complexity
        );

        if (validation.isValid) {
            console.log(`✅ PASS: ${validation.provider}/${validation.model}`);
            console.log(`   Context Window: ${validation.contextWindow.toLocaleString()} tokens`);
            console.log(`   Utilization: ${validation.utilizationPercentage}%`);
            
            if (validation.warnings) {
                console.log(`   ⚠️  Warnings: ${validation.warnings.join(', ')}`);
            }
        } else {
            console.log(`❌ FAIL: ${validation.errors?.join(', ')}`);
            if (validation.recommendations) {
                console.log(`   💡 Recommendations: ${validation.recommendations.join(', ')}`);
            }
        }
    }

    // Example 2: Provider-specific context window check
    console.log('\n\n🔧 Example 2: Provider-Specific Validation');
    console.log('==========================================');

    const providers = [
        { provider: 'google-gemini', model: 'gemini-1.5-pro' },
        { provider: 'openai', model: 'gpt-4' },
        { provider: 'ollama', model: 'llama3.1' }
    ];

    for (const provider of providers) {
        console.log(`\n🔍 Checking ${provider.provider}/${provider.model}:`);
        
        const hasSufficientWindow = await contextValidator.checkProviderContextWindow(
            provider.provider,
            provider.model,
            10000 // 10K tokens requirement
        );

        console.log(`   Result: ${hasSufficientWindow ? '✅ SUFFICIENT' : '❌ INSUFFICIENT'}`);
    }

    // Example 3: Fallback strategy demonstration
    console.log('\n\n🔄 Example 3: Fallback Strategy');
    console.log('===============================');

    const largeContext = `
# Comprehensive Project Documentation

## Executive Summary
This is a comprehensive project documentation that contains extensive information about the project requirements, technical specifications, architecture design, implementation details, testing strategies, deployment procedures, maintenance guidelines, and operational procedures.

## Project Overview
The project involves developing a complex multi-tier application with microservices architecture, real-time data processing capabilities, advanced security features, comprehensive monitoring and logging systems, automated testing frameworks, continuous integration and deployment pipelines, and extensive documentation.

## Technical Requirements
The system must support high availability, scalability, performance optimization, data consistency, security compliance, monitoring and alerting, backup and recovery procedures, disaster recovery planning, and comprehensive testing coverage.

## Architecture Design
The architecture follows microservices patterns with API gateway, service mesh, container orchestration, database clustering, caching layers, message queuing systems, event streaming platforms, and comprehensive monitoring infrastructure.

## Implementation Details
Implementation includes detailed coding standards, development workflows, code review processes, testing methodologies, deployment strategies, configuration management, environment setup, and operational procedures.

## Testing Strategy
Comprehensive testing includes unit testing, integration testing, system testing, performance testing, security testing, user acceptance testing, and automated testing frameworks.

## Deployment Procedures
Deployment includes staging environments, production deployment procedures, rollback strategies, monitoring setup, and operational handover procedures.

## Maintenance Guidelines
Maintenance includes regular updates, security patches, performance optimization, capacity planning, and ongoing support procedures.

## Operational Procedures
Operations include monitoring, alerting, incident response, change management, and continuous improvement processes.
    `.trim();

    console.log(`\n📊 Original context: ${contextValidator.estimateTokens ? contextValidator.estimateTokens(largeContext) : Math.ceil(largeContext.length / 4)} tokens`);
    console.log(`🎯 Target limit: 8,000 tokens`);

    const fallbackResult = await fallbackService.applyFallbackStrategy(
        largeContext,
        'technical-specification',
        8000, // 8K token limit
        {
            enableChunking: true,
            enableSummarization: true,
            enablePrioritization: true,
            preserveCriticalContext: true
        }
    );

    console.log(`\n📈 Fallback Result:`);
    console.log(`   Strategy: ${fallbackResult.strategy}`);
    console.log(`   Success: ${fallbackResult.success ? '✅' : '❌'}`);
    console.log(`   Original: ${fallbackResult.originalTokenCount.toLocaleString()} tokens`);
    console.log(`   Final: ${fallbackResult.finalTokenCount.toLocaleString()} tokens`);
    console.log(`   Reduction: ${fallbackResult.reductionPercentage}%`);
    
    if (fallbackResult.warnings) {
        console.log(`   Warnings: ${fallbackResult.warnings.join(', ')}`);
    }
    
    if (fallbackResult.errors) {
        console.log(`   Errors: ${fallbackResult.errors.join(', ')}`);
    }

    // Example 4: Integration with DocumentGenerator
    console.log('\n\n📝 Example 4: DocumentGenerator Integration');
    console.log('===========================================');

    const projectContext = {
        projectName: 'ICT Governance Framework',
        description: 'The ICT modern Multi Cloud multitenant hybrid VMWare and Local infrastructure governance and maintenance.',
        framework: 'pmbok',
        projectId: '68cf79515c797b952fbb7bec'
    };

    console.log('\n🚀 Generating document with context window validation...');
    
    try {
        const generator = new DocumentGenerator(projectContext, {
            outputDir: 'generated-documents',
            continueOnError: false
        });

        // This will now automatically validate context window before generation
        const success = await generator.generateOne('benefits-realization-plan');
        
        if (success) {
            console.log('✅ Document generated successfully with context window validation!');
        } else {
            console.log('❌ Document generation failed');
        }
    } catch (error) {
        console.log(`❌ Error during generation: ${error.message}`);
    }

    console.log('\n🎉 Context Window Validation Example Complete!');
}

// Run the example
demonstrateContextWindowValidation().catch(console.error);
