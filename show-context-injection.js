/**
 * Show the actual context string that gets injected into the LLM
 */

import mongoose from 'mongoose';
import { ContextBuilder } from './dist/services/ContextBuilder.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/requirements-gathering-agent?authSource=admin';

async function showContextInjection() {
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

    // Mock available templates
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

    console.log('\n🎬 SHOWING ACTUAL CONTEXT INJECTION');
    console.log('='.repeat(80));

    // Build context for Gemini (quality-first strategy)
    const result = await contextBuilder.buildContext(
      'google-gemini',
      'gemini-pro',
      'Stakeholder Analysis Document',
      projectContext,
      availableTemplates,
      dependencies
    );

    console.log('\n📝 ACTUAL CONTEXT STRING INJECTED INTO LLM:');
    console.log('='.repeat(80));
    console.log(result.contextString);
    console.log('='.repeat(80));

    console.log('\n📊 CONTEXT METRICS:');
    console.log(`Total Tokens: ${result.totalTokens.toLocaleString()}`);
    console.log(`Quality Score: ${(result.optimization.qualityScore * 100).toFixed(1)}%`);
    console.log(`Strategy: ${result.optimization.strategy}`);

    console.log('\n🔍 TRACEABILITY BREAKDOWN:');
    result.traceability.forEach((trace, index) => {
      console.log(`${index + 1}. ${trace.sourceType.toUpperCase()}`);
      console.log(`   Status: ${trace.included ? '✅ INCLUDED' : '❌ EXCLUDED'}`);
      console.log(`   Tokens: ${trace.tokensUsed}`);
      console.log(`   Quality: ${(trace.qualityContribution * 100).toFixed(1)}%`);
      console.log(`   Reason: ${trace.reason}`);
      console.log('');
    });

    console.log('🎯 CONTEXT INJECTION DEMONSTRATION COMPLETE');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the demonstration
showContextInjection();

