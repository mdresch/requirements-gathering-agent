/**
 * Context Building Demonstration
 * Shows how context gets built and injected into LLMs
 */

import mongoose from 'mongoose';
import { ContextBuilder } from './dist/services/ContextBuilder.js';
import { ContextWindowManager } from './dist/services/ContextWindowManager.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/requirements-gathering-agent?authSource=admin';

async function demonstrateContextBuilding() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const contextBuilder = new ContextBuilder();

    // Mock project context
    const projectContext = {
      projectName: 'ADPA Digital Transformation',
      projectType: 'Digital Transformation',
      framework: 'BABOK',
      description: 'A comprehensive digital transformation project for the Australian Digital Platform Agency',
      programName: 'Government Digital Services',
      stakeholders: ['Project Manager', 'Business Analysts', 'End Users'],
      timeline: '6 months',
      budget: '$2.5M'
    };

    // Mock available templates (this would come from your database)
    const availableTemplates = [
      {
        _id: 'template-1',
        name: 'Stakeholder Analysis Template',
        content: `# Stakeholder Analysis Template

## Stakeholder Identification
- Internal stakeholders
- External stakeholders
- Regulatory bodies
- End users

## Stakeholder Analysis
- Influence level
- Interest level
- Communication preferences
- Engagement strategy

## Stakeholder Management Plan
- Communication matrix
- Engagement schedule
- Risk mitigation strategies`,
        aiInstructions: 'Generate a comprehensive stakeholder analysis following BABOK best practices',
        updatedAt: new Date(),
        createdAt: new Date()
      },
      {
        _id: 'template-2',
        name: 'Requirements Gathering Template',
        content: `# Requirements Gathering Template

## Functional Requirements
- User stories
- Acceptance criteria
- Business rules
- System interactions

## Non-Functional Requirements
- Performance requirements
- Security requirements
- Usability requirements
- Compliance requirements

## Requirements Validation
- Traceability matrix
- Validation criteria
- Approval process`,
        aiInstructions: 'Create detailed requirements following agile methodologies',
        updatedAt: new Date(),
        createdAt: new Date()
      }
    ];

    // Mock dependencies
    const dependencies = [
      {
        _id: 'dependency-1',
        name: 'Business Case Template',
        content: `# Business Case Template

## Executive Summary
- Project overview
- Business justification
- Expected benefits
- Risk assessment

## Financial Analysis
- Cost-benefit analysis
- ROI calculations
- Budget requirements
- Funding sources`,
        aiInstructions: 'Develop a compelling business case with financial justification',
        updatedAt: new Date(),
        createdAt: new Date()
      }
    ];

    console.log('\n🚀 DEMONSTRATING CONTEXT BUILDING');
    console.log('='.repeat(60));

    // Test with different providers
    const providers = [
      { provider: 'google-gemini', model: 'gemini-pro' },
      { provider: 'openai', model: 'gpt-5' },
      { provider: 'openai', model: 'gpt-4' },
      { provider: 'claude', model: 'claude-3-opus' }
    ];

    for (const { provider, model } of providers) {
      console.log(`\n🔧 Testing with ${provider} - ${model}`);
      console.log('-'.repeat(40));

      try {
        const result = await contextBuilder.buildContext(
          provider,
          model,
          'Stakeholder Analysis Document',
          projectContext,
          availableTemplates,
          dependencies
        );

        // Display summary
        contextBuilder.displayContextSummary(result);

        // Show provider limits
        const limits = ContextWindowManager.getProviderLimits(provider, model);
        if (limits) {
          console.log(`\n📊 PROVIDER LIMITS:`);
          console.log(`  Max Tokens: ${limits.maxTokens.toLocaleString()}`);
          console.log(`  Context Window: ${limits.contextWindow.toLocaleString()}`);
          console.log(`  Input Tokens: ${limits.inputTokens.toLocaleString()}`);
          console.log(`  Output Tokens: ${limits.outputTokens.toLocaleString()}`);
          console.log(`  Cost per 1K tokens: $${limits.costPer1KTokens}`);
          
          const utilization = (result.totalTokens / limits.inputTokens) * 100;
          console.log(`  Context Utilization: ${utilization.toFixed(1)}%`);
          
          if (utilization > 80) {
            console.log(`  ⚠️  High utilization - consider optimization`);
          } else if (utilization > 50) {
            console.log(`  ✅ Good utilization`);
          } else {
            console.log(`  🎯 Low utilization - room for more context`);
          }
        }

      } catch (error) {
        console.error(`❌ Error with ${provider}-${model}:`, error.message);
      }
    }

    console.log('\n🎯 CONTEXT BUILDING DEMONSTRATION COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error in demonstration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the demonstration
demonstrateContextBuilding();

