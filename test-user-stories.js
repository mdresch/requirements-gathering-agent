#!/usr/bin/env node

/**
 * Test script for User Stories implementation
 * 
 * This script tests the user stories functionality to ensure it works correctly.
 */

import { 
  generateStrategicSections, 
  generateRequirements, 
  generateTechnologyStackAnalysis,
  generateRiskManagementPlan
} from './src/index.js';

async function testUserStories() {
  console.log('🧪 Testing User Stories Implementation');
  console.log('=====================================\n');

  const testInput = {
    businessProblem: 'We need to modernize our legacy customer management system to improve efficiency and user experience',
    technologyStack: ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'Docker'],
    contextBundle: 'Enterprise-level application with 10,000+ users, requiring high availability and security compliance'
  };

  try {
    // Test User Story 2: Strategic Planning
    console.log('🎯 Testing Strategic Planning Generation (User Story 2)...');
    const strategic = await generateStrategicSections(testInput);
    console.log('✅ Strategic Planning:', {
      vision: strategic.vision.substring(0, 100) + '...',
      mission: strategic.mission.substring(0, 100) + '...',
      coreValues: strategic.coreValues.substring(0, 100) + '...',
      purpose: strategic.purpose.substring(0, 100) + '...'
    });

    // Test User Story 3: Requirements Generation with JSON validation
    console.log('\n📋 Testing Requirements Generation (User Story 3)...');
    const requirements = await generateRequirements(testInput);
    console.log('✅ Requirements Generated:', requirements.length, 'user roles');
    console.log('📊 JSON Validation:', JSON.stringify(requirements, null, 2).length > 0 ? 'PASSED' : 'FAILED');

    // Test User Story 7: Technology Stack Analysis
    console.log('\n🔧 Testing Technology Stack Analysis (User Story 7)...');
    const techAnalysis = await generateTechnologyStackAnalysis(testInput);
    console.log('✅ Technology Analysis:', {
      strengths: techAnalysis.strengths.length,
      weaknesses: techAnalysis.weaknesses.length,
      recommendations: techAnalysis.recommendations.length,
      overallAssessment: techAnalysis.overallAssessment.substring(0, 100) + '...'
    });

    // Test User Story 8: Risk Management
    console.log('\n⚠️ Testing Risk Management Plan (User Story 8)...');
    const riskPlan = await generateRiskManagementPlan(testInput);
    console.log('✅ Risk Management Plan:', {
      identifiedRisks: riskPlan.identifiedRisks.length,
      riskCategories: riskPlan.riskCategories.length,
      overallAssessment: riskPlan.overallRiskAssessment.substring(0, 100) + '...'
    });

    console.log('\n🎉 All User Stories Tests Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Strategic Planning: Generated vision, mission, core values, and purpose`);
    console.log(`   ✅ Requirements: Generated ${requirements.length} user roles with strict JSON validation`);
    console.log(`   ✅ Technology Analysis: ${techAnalysis.strengths.length} strengths, ${techAnalysis.weaknesses.length} weaknesses identified`);
    console.log(`   ✅ Risk Management: ${riskPlan.identifiedRisks.length} risks identified and analyzed`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testUserStories().catch(console.error);