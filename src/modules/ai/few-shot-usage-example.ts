/**
 * Usage Examples for Few-Shot Learning System
 * 
 * This file demonstrates how to use the enhanced few-shot learning system
 * in different scenarios and with various configurations.
 */

import { BaseAIProcessor } from './processors/BaseAIProcessor.js';
import { getFewShotConfig } from './few-shot-config.js';
import { ChatMessage } from './types.js';

/**
 * Example processor demonstrating few-shot learning usage
 */
export class ExampleProcessor extends BaseAIProcessor {
    
    /**
     * Example 1: Basic usage with default configuration
     */
    async generateBasicProjectCharter(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            // This automatically uses few-shot learning with default settings
            const messages = this.createPMBOKMessages(
                'project-charter',
                context,
                ['stakeholder-register', 'user-stories']
            );
            
            // Simulate AI call (in real usage, this would call the actual AI)
            console.log('Generated enhanced prompt with few-shot examples');
            return 'Generated project charter content...';
        }, 'Basic Project Charter Generation', 'project-charter');
    }
    
    /**
     * Example 2: Custom configuration for enterprise project
     */
    async generateEnterpriseProjectCharter(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            // Use enterprise configuration with more examples
            const enterpriseConfig = getFewShotConfig('enterprise', {
                maxExamples: 3,
                exampleTokenBudget: 0.6
            });
            
            const messages = this.createPMBOKMessages(
                'project-charter',
                context,
                ['stakeholder-register', 'user-stories', 'risk-register'],
                4000, // Higher token limit for enterprise projects
                enterpriseConfig
            );
            
            console.log('Generated enterprise-level prompt with 3 examples');
            return 'Generated comprehensive enterprise project charter...';
        }, 'Enterprise Project Charter Generation', 'project-charter');
    }
    
    /**
     * Example 3: Small project with minimal examples
     */
    async generateSmallProjectScope(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            // Use small project configuration
            const smallConfig = getFewShotConfig('small', {
                maxExamples: 1,
                exampleTokenBudget: 0.3
            });
            
            const messages = this.createPMBOKMessages(
                'scope-management-plan',
                context,
                ['project-charter'],
                2000, // Lower token limit for small projects
                smallConfig
            );
            
            console.log('Generated small project prompt with 1 example');
            return 'Generated scope management plan for small project...';
        }, 'Small Project Scope Generation', 'scope-management-plan');
    }
    
    /**
     * Example 4: Custom document type without examples
     */
    async generateCustomDocument(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            // For document types without examples, system falls back gracefully
            const messages = this.createPMBOKMessages(
                'custom-document-type',
                context,
                [],
                2500
            );
            
            console.log('Generated standard prompt (no examples available)');
            return 'Generated custom document content...';
        }, 'Custom Document Generation', 'custom-document-type');
    }
    
    /**
     * Example 5: Direct use of enhanced messages
     */
    async generateWithDirectEnhancement(context: string): Promise<string | null> {
        return await this.handleAICall(async () => {
            const systemPrompt = `You are a PMBOK expert specializing in requirements documentation.`;
            const userPrompt = `Create detailed requirements documentation for: ${context}`;
            
            // Direct use of enhanced messages with custom configuration
            const messages = this.createEnhancedMessages(
                systemPrompt,
                userPrompt,
                'requirements-documentation',
                3000,
                { maxExamples: 2, randomSelection: true }
            );
            
            console.log('Generated directly enhanced prompt with random example selection');
            return 'Generated requirements documentation...';
        }, 'Direct Enhancement Generation', 'requirements-documentation');
    }
    
    /**
     * Example 6: Conditional few-shot learning
     */
    async generateWithConditionalExamples(
        context: string, 
        useExamples: boolean = true
    ): Promise<string | null> {
        return await this.handleAICall(async () => {
            let messages: ChatMessage[];
            
            if (useExamples) {
                // Use few-shot learning
                messages = this.createPMBOKMessages(
                    'risk-register',
                    context,
                    ['project-charter', 'stakeholder-register']
                );
                console.log('Using few-shot learning with examples');
            } else {
                // Use standard prompts
                messages = this.createStandardMessages(
                    'You are a PMBOK-certified risk management expert.',
                    `Create a comprehensive risk register for: ${context}`
                );
                console.log('Using standard prompts without examples');
            }
            
            return 'Generated risk register content...';
        }, 'Conditional Examples Generation', 'risk-register');
    }
}

/**
 * Demonstration function showing various usage patterns
 */
export async function demonstrateFewShotUsage(): Promise<void> {
    console.log('🎯 Few-Shot Learning Usage Demonstration\n');
    
    const processor = new ExampleProcessor();
    const sampleContext = `
Project: Customer Portal Modernization
Type: Web Application Development
Budget: $250,000
Timeline: 8 months
Team: 8 developers, 2 designers, 1 PM
    `.trim();
    
    console.log('Sample Project Context:');
    console.log(sampleContext);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Example 1: Basic usage
    console.log('1. Basic Project Charter Generation:');
    await processor.generateBasicProjectCharter(sampleContext);
    console.log();
    
    // Example 2: Enterprise configuration
    console.log('2. Enterprise Project Charter Generation:');
    await processor.generateEnterpriseProjectCharter(sampleContext);
    console.log();
    
    // Example 3: Small project
    console.log('3. Small Project Scope Generation:');
    await processor.generateSmallProjectScope(sampleContext);
    console.log();
    
    // Example 4: Custom document type
    console.log('4. Custom Document Generation:');
    await processor.generateCustomDocument(sampleContext);
    console.log();
    
    // Example 5: Direct enhancement
    console.log('5. Direct Enhancement Generation:');
    await processor.generateWithDirectEnhancement(sampleContext);
    console.log();
    
    // Example 6: Conditional examples
    console.log('6. Conditional Examples Generation:');
    await processor.generateWithConditionalExamples(sampleContext, true);
    await processor.generateWithConditionalExamples(sampleContext, false);
    console.log();
    
    console.log('✅ Demonstration complete!');
    console.log('\n📝 Key Takeaways:');
    console.log('   - Few-shot learning is automatically applied when examples are available');
    console.log('   - Configuration can be customized for different project sizes and needs');
    console.log('   - System gracefully falls back to standard prompts when needed');
    console.log('   - Token budgets are automatically managed for optimal performance');
}

/**
 * Configuration examples for different scenarios
 */
export const USAGE_SCENARIOS = {
    // Scenario 1: High-quality documentation for critical projects
    criticalProject: {
        maxExamples: 3,
        exampleTokenBudget: 0.6,
        priorityDocumentTypes: ['project-charter', 'risk-register', 'requirements-documentation']
    },
    
    // Scenario 2: Fast generation for routine projects
    routineProject: {
        maxExamples: 1,
        exampleTokenBudget: 0.3,
        randomSelection: true
    },
    
    // Scenario 3: Learning mode for new team members
    learningMode: {
        maxExamples: 2,
        exampleTokenBudget: 0.5,
        priorityDocumentTypes: ['project-charter', 'scope-management-plan', 'stakeholder-register']
    },
    
    // Scenario 4: Token-constrained environment
    tokenConstrained: {
        maxExamples: 1,
        exampleTokenBudget: 0.2,
        minTokenLimitForExamples: 3000
    }
};

// Run demonstration if this file is executed directly
if (require.main === module) {
    demonstrateFewShotUsage().catch(console.error);
}