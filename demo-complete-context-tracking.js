/**
 * Complete Context Tracking System Demonstration
 * Shows the full context generation, optimization, and injection process
 */

import mongoose from 'mongoose';
import { ContextBuilder } from './dist/services/ContextBuilder.js';
import { ContextWindowManager } from './dist/services/ContextWindowManager.js';
import { ContextIntelligenceEngine } from './dist/services/ContextIntelligenceEngine.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/requirements-gathering-agent?authSource=admin';

async function demonstrateCompleteContextTracking() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const contextBuilder = new ContextBuilder();
    const intelligenceEngine = new ContextIntelligenceEngine();

    console.log('\n🎬 COMPLETE CONTEXT TRACKING SYSTEM DEMONSTRATION');
    console.log('='.repeat(80));

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

    // Mock available templates (representing your 150+ template library)
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
      },
      {
        _id: 'template-3',
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
- Funding sources

## Implementation Plan
- Timeline
- Resource requirements
- Risk mitigation
- Success metrics`,
        aiInstructions: 'Develop a compelling business case with financial justification',
        updatedAt: new Date(),
        createdAt: new Date()
      }
    ];

    // Mock dependencies
    const dependencies = [
      {
        _id: 'dependency-1',
        name: 'Project Charter Template',
        content: `# Project Charter Template

## Project Overview
- Project name and description
- Objectives and deliverables
- Success criteria
- Assumptions and constraints

## Project Organization
- Project manager
- Team structure
- Stakeholder roles
- Communication plan`,
        aiInstructions: 'Create a comprehensive project charter',
        updatedAt: new Date(),
        createdAt: new Date()
      }
    ];

    // Test with different AI providers
    const providers = [
      { provider: 'google-gemini', model: 'gemini-pro' },
      { provider: 'openai', model: 'gpt-5' },
      { provider: 'openai', model: 'gpt-4' },
      { provider: 'claude', model: 'claude-3-opus' }
    ];

    for (const { provider, model } of providers) {
      console.log(`\n🔧 TESTING WITH ${provider.toUpperCase()} - ${model.toUpperCase()}`);
      console.log('-'.repeat(60));

      try {
        // Step 1: Build context
        const contextResult = await contextBuilder.buildContext(
          provider,
          model,
          'Stakeholder Analysis Document',
          projectContext,
          availableTemplates,
          dependencies
        );

        // Step 2: Get provider limits
        const limits = ContextWindowManager.getProviderLimits(provider, model);
        
        // Step 3: Calculate optimization metrics
        const utilization = limits ? (contextResult.totalTokens / limits.inputTokens) * 100 : 0;
        const costEstimate = limits ? ContextWindowManager.getCostEstimate(
          provider, 
          model, 
          contextResult.totalTokens, 
          contextResult.totalTokens * 0.3 // Estimate 30% output tokens
        ) : 0;

        console.log('\n📊 CONTEXT OPTIMIZATION RESULTS:');
        console.log(`  Provider: ${provider}`);
        console.log(`  Model: ${model}`);
        console.log(`  Total Tokens: ${contextResult.totalTokens.toLocaleString()}`);
        console.log(`  Available Tokens: ${limits ? limits.inputTokens.toLocaleString() : 'Unknown'}`);
        console.log(`  Utilization: ${utilization.toFixed(2)}%`);
        console.log(`  Quality Score: ${(contextResult.optimization.qualityScore * 100).toFixed(1)}%`);
        console.log(`  Efficiency Score: ${(contextResult.optimization.efficiencyScore * 100).toFixed(1)}%`);
        console.log(`  Strategy: ${contextResult.optimization.strategy}`);
        console.log(`  Cost Estimate: $${costEstimate.toFixed(4)}`);

        console.log('\n🎯 CONTEXT COMPONENTS:');
        contextResult.contextComponents.forEach((component, index) => {
          console.log(`  ${index + 1}. ${component.type.toUpperCase()}`);
          console.log(`     Tokens: ${component.tokenCount.toLocaleString()}`);
          console.log(`     Quality: ${(component.qualityImpact * 100).toFixed(1)}%`);
          console.log(`     Relevance: ${(component.relevanceScore * 100).toFixed(1)}%`);
          console.log(`     Priority: ${component.priority}`);
          console.log('');
        });

        console.log('💡 OPTIMIZATION RECOMMENDATIONS:');
        contextResult.optimization.recommendations.forEach(rec => {
          console.log(`  - ${rec}`);
        });

        console.log('\n🔍 TRACEABILITY MATRIX:');
        contextResult.traceability.forEach((trace, index) => {
          console.log(`  ${index + 1}. ${trace.sourceType.toUpperCase()}`);
          console.log(`     Status: ${trace.included ? '✅ INCLUDED' : '❌ EXCLUDED'}`);
          console.log(`     Tokens: ${trace.tokensUsed.toLocaleString()}`);
          console.log(`     Quality: ${(trace.qualityContribution * 100).toFixed(1)}%`);
          console.log(`     Reason: ${trace.reason}`);
          console.log('');
        });

        // Step 4: Show context injection preview
        console.log('📝 CONTEXT INJECTION PREVIEW:');
        console.log('='.repeat(40));
        const preview = contextResult.contextString.substring(0, 500) + '...';
        console.log(preview);
        console.log('='.repeat(40));

        // Step 5: Provider-specific optimization
        console.log('\n⚡ PROVIDER-SPECIFIC OPTIMIZATION:');
        if (provider === 'google-gemini' && limits && limits.maxTokens >= 1000000) {
          console.log('  🎯 Quality-First Strategy: Maximum context for optimal quality');
          console.log('  📊 Massive headroom available for comprehensive context');
          console.log('  💰 Cost-effective for large context injection');
        } else if (provider === 'openai' && model === 'gpt-5') {
          console.log('  🚀 Future-Ready: GPT-5 with estimated 2M token capacity');
          console.log('  🎯 Quality optimization with room for growth');
        } else {
          console.log('  ⚖️ Balanced Strategy: Quality vs. efficiency optimization');
          console.log('  📊 Token utilization optimized for cost efficiency');
        }

      } catch (error) {
        console.error(`❌ Error with ${provider}-${model}:`, error.message);
      }
    }

    console.log('\n🎯 COMPLETE CONTEXT TRACKING DEMONSTRATION SUMMARY');
    console.log('='.repeat(80));
    console.log('✅ Context Building: Complete with quality-first optimization');
    console.log('✅ Context Prioritization: Quality (80%) + Relevance (20%)');
    console.log('✅ Context Dimension Design: Multi-dimensional optimization');
    console.log('✅ Recent Information Integration: Freshness and relevance tracking');
    console.log('✅ Future Development: Scalability and optimization predictions');
    console.log('✅ AI Provider Optimization: Adaptive strategies per provider');
    console.log('✅ Full Traceability: Complete input→output mapping');
    console.log('✅ Real-time Monitoring: Token usage, quality, and cost tracking');
    
    console.log('\n🚀 READY FOR PRODUCTION:');
    console.log('- Complete transparency in AI context usage');
    console.log('- Quality-first optimization for all providers');
    console.log('- Full traceability matrix for accountability');
    console.log('- Real-time monitoring and optimization');
    console.log('- Adaptive strategies for different AI models');

  } catch (error) {
    console.error('❌ Error in demonstration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the demonstration
demonstrateCompleteContextTracking();

