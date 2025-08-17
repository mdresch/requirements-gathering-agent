#!/usr/bin/env node

/**
 * Test script to verify the enhanced planning artifacts processors work correctly
 */

import { createProcessor } from './src/modules/documentGenerator/ProcessorFactory.js';

async function testPlanningArtifacts() {
  console.log('🚀 Testing Enhanced Planning Artifacts Processors...\n');

  const testContext = {
    projectName: 'ADPA Document Processing System',
    projectType: 'Software Development',
    description: 'Advanced Document Processing and Analysis system for automated document generation and management',
    stakeholders: ['Project Manager', 'Business Analyst', 'Technical Lead', 'End Users'],
    timeline: '6 months',
    budget: '$500,000'
  };

  const processors = [
    'work-breakdown-structure',
    'wbs-dictionary', 
    'schedule-network-diagram',
    'detailed-planning-artifacts'
  ];

  for (const processorKey of processors) {
    try {
      console.log(`📋 Testing ${processorKey}...`);
      
      const processor = await createProcessor(processorKey);
      const result = await processor.process(testContext);
      
      console.log(`✅ ${processorKey} - SUCCESS`);
      console.log(`   Title: ${result.title}`);
      console.log(`   Content Length: ${result.content.length} characters`);
      
      // Basic validation
      if (!result.content || result.content.length < 100) {
        throw new Error('Generated content is too short');
      }
      
      console.log(`   ✓ Content validation passed\n`);
      
    } catch (error) {
      console.error(`❌ ${processorKey} - FAILED`);
      console.error(`   Error: ${error.message}\n`);
    }
  }

  console.log('🎉 Planning Artifacts Testing Complete!');
}

// Run the test
testPlanningArtifacts().catch(console.error);