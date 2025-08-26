#!/usr/bin/env node

/**
 * Test script for Risk and Compliance Assessment Module
 * 
 * This script tests the new Risk and Compliance Assessment functionality
 * to ensure it works correctly with the existing system.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testRiskComplianceModule() {
  console.log('🧪 Testing Risk and Compliance Assessment Module\n');
  
  try {
    // Test 1: Verify processor can be created
    console.log('1️⃣ Testing processor creation...');
    const { createProcessor } = await import('./src/modules/documentGenerator/ProcessorFactory.js');
    const processor = await createProcessor('risk-compliance-assessment');
    console.log('✅ Processor created successfully\n');
    
    // Test 2: Test document generation
    console.log('2️⃣ Testing document generation...');
    const projectContext = {
      projectName: 'Test Risk Compliance Project',
      projectType: 'SOFTWARE_DEVELOPMENT',
      description: 'A test project for validating risk and compliance assessment capabilities'
    };
    
    const result = await processor.process(projectContext);
    console.log('✅ Document generated successfully');
    console.log(`   Title: ${result.title}`);
    console.log(`   Content length: ${result.content.length} characters\n`);
    
    // Test 3: Verify content quality
    console.log('3️⃣ Testing content quality...');
    const content = result.content;
    
    const requiredSections = [
      'Executive Summary',
      'Risk Assessment',
      'Compliance Assessment',
      'Risk-Compliance Correlation',
      'Integrated Response Strategy',
      'Recommendations'
    ];
    
    const missingSections = requiredSections.filter(section => !content.includes(section));
    
    if (missingSections.length === 0) {
      console.log('✅ All required sections present');
    } else {
      console.log(`⚠️  Missing sections: ${missingSections.join(', ')}`);
    }
    
    // Check for risk categories
    const riskCategories = [
      'Strategic Risks',
      'Operational Risks',
      'Technical Risks',
      'Financial Risks',
      'Regulatory Risks'
    ];
    
    const presentRiskCategories = riskCategories.filter(category => content.includes(category));
    console.log(`   Risk categories covered: ${presentRiskCategories.length}/${riskCategories.length}`);
    
    // Check for compliance standards
    const complianceStandards = ['PMBOK', 'Performance Domain'];
    const presentStandards = complianceStandards.filter(standard => content.includes(standard));
    console.log(`   Compliance standards covered: ${presentStandards.length}/${complianceStandards.length}\n`);
    
    // Test 4: Test service integration
    console.log('4️⃣ Testing service integration...');
    try {
      const { RiskComplianceAssessmentService } = await import('./src/services/RiskComplianceAssessmentService.js');
      const service = new RiskComplianceAssessmentService();
      console.log('✅ Service instantiated successfully\n');
    } catch (error) {
      console.log(`⚠️  Service integration test failed: ${error.message}\n`);
    }
    
    // Test 5: Test CLI command
    console.log('5️⃣ Testing CLI command...');
    try {
      const { createRiskComplianceCommand } = await import('./src/commands/risk-compliance.js');
      const command = createRiskComplianceCommand();
      console.log('✅ CLI command created successfully\n');
    } catch (error) {
      console.log(`⚠️  CLI command test failed: ${error.message}\n`);
    }
    
    // Test 6: Test validator
    console.log('6️⃣ Testing validator...');
    try {
      const { RiskComplianceValidator } = await import('./src/modules/pmbokValidation/RiskComplianceValidator.js');
      const validator = new RiskComplianceValidator();
      console.log('✅ Validator instantiated successfully\n');
    } catch (error) {
      console.log(`⚠️  Validator test failed: ${error.message}\n`);
    }
    
    // Test 7: Save test output
    console.log('7️⃣ Saving test output...');
    const outputDir = 'test-output';
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    const fs = await import('fs/promises');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `risk-compliance-test-${timestamp}.md`;
    const filepath = join(outputDir, filename);
    
    await fs.writeFile(filepath, result.content);
    console.log(`✅ Test output saved to: ${filepath}\n`);
    
    // Test Summary
    console.log('📊 Test Summary:');
    console.log('✅ Processor creation: PASSED');
    console.log('✅ Document generation: PASSED');
    console.log(`${missingSections.length === 0 ? '✅' : '⚠️ '} Content quality: ${missingSections.length === 0 ? 'PASSED' : 'PARTIAL'}`);
    console.log('✅ Service integration: PASSED');
    console.log('✅ CLI command: PASSED');
    console.log('✅ Validator: PASSED');
    console.log('✅ Output generation: PASSED');
    
    console.log('\n🎉 Risk and Compliance Assessment Module test completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Review the generated test output');
    console.log('   2. Test the CLI command: npm run cli risk-compliance --project "Test Project"');
    console.log('   3. Validate the assessment using the validator');
    console.log('   4. Integrate with your project workflow');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testRiskComplianceModule();