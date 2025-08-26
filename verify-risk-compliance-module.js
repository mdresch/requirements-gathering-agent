#!/usr/bin/env node

/**
 * Verification script for Risk and Compliance Assessment Module
 * 
 * This script verifies the module structure and integration without executing the code.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function verifyRiskComplianceModule() {
  console.log('🔍 Verifying Risk and Compliance Assessment Module Structure\n');
  
  const checks = [];
  
  // Check 1: Verify processor file exists
  const processorPath = 'src/modules/documentTemplates/risk-management/RiskComplianceAssessmentProcessor.ts';
  if (existsSync(processorPath)) {
    checks.push({ name: 'Processor file exists', status: '✅', path: processorPath });
  } else {
    checks.push({ name: 'Processor file exists', status: '❌', path: processorPath });
  }
  
  // Check 2: Verify template file exists
  const templatePath = 'src/modules/documentTemplates/risk-management/RiskComplianceAssessmentTemplate.ts';
  if (existsSync(templatePath)) {
    checks.push({ name: 'Template file exists', status: '✅', path: templatePath });
  } else {
    checks.push({ name: 'Template file exists', status: '❌', path: templatePath });
  }
  
  // Check 3: Verify service file exists
  const servicePath = 'src/services/RiskComplianceAssessmentService.ts';
  if (existsSync(servicePath)) {
    checks.push({ name: 'Service file exists', status: '✅', path: servicePath });
  } else {
    checks.push({ name: 'Service file exists', status: '❌', path: servicePath });
  }
  
  // Check 4: Verify CLI command file exists
  const commandPath = 'src/commands/risk-compliance.ts';
  if (existsSync(commandPath)) {
    checks.push({ name: 'CLI command file exists', status: '✅', path: commandPath });
  } else {
    checks.push({ name: 'CLI command file exists', status: '❌', path: commandPath });
  }
  
  // Check 5: Verify validator file exists
  const validatorPath = 'src/modules/pmbokValidation/RiskComplianceValidator.ts';
  if (existsSync(validatorPath)) {
    checks.push({ name: 'Validator file exists', status: '✅', path: validatorPath });
  } else {
    checks.push({ name: 'Validator file exists', status: '❌', path: validatorPath });
  }
  
  // Check 6: Verify processor configuration
  const configPath = 'src/modules/documentGenerator/processor-config.json';
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      if (config['risk-compliance-assessment']) {
        checks.push({ name: 'Processor configuration exists', status: '✅', path: configPath });
      } else {
        checks.push({ name: 'Processor configuration exists', status: '❌', path: configPath });
      }
    } catch (error) {
      checks.push({ name: 'Processor configuration exists', status: '❌', path: configPath, error: error.message });
    }
  } else {
    checks.push({ name: 'Processor configuration exists', status: '❌', path: configPath });
  }
  
  // Check 7: Verify CLI integration
  const cliPath = 'src/cli.ts';
  if (existsSync(cliPath)) {
    try {
      const cliContent = readFileSync(cliPath, 'utf-8');
      if (cliContent.includes('risk-compliance')) {
        checks.push({ name: 'CLI integration exists', status: '✅', path: cliPath });
      } else {
        checks.push({ name: 'CLI integration exists', status: '❌', path: cliPath });
      }
    } catch (error) {
      checks.push({ name: 'CLI integration exists', status: '❌', path: cliPath, error: error.message });
    }
  } else {
    checks.push({ name: 'CLI integration exists', status: '❌', path: cliPath });
  }
  
  // Check 8: Verify commands index update
  const commandsIndexPath = 'src/commands/index.ts';
  if (existsSync(commandsIndexPath)) {
    try {
      const indexContent = readFileSync(commandsIndexPath, 'utf-8');
      if (indexContent.includes('createRiskComplianceCommand')) {
        checks.push({ name: 'Commands index updated', status: '✅', path: commandsIndexPath });
      } else {
        checks.push({ name: 'Commands index updated', status: '❌', path: commandsIndexPath });
      }
    } catch (error) {
      checks.push({ name: 'Commands index updated', status: '❌', path: commandsIndexPath, error: error.message });
    }
  } else {
    checks.push({ name: 'Commands index updated', status: '❌', path: commandsIndexPath });
  }
  
  // Check 9: Verify documentation exists
  const docsPath = 'docs/RISK-COMPLIANCE-ASSESSMENT-MODULE.md';
  if (existsSync(docsPath)) {
    checks.push({ name: 'Documentation exists', status: '✅', path: docsPath });
  } else {
    checks.push({ name: 'Documentation exists', status: '❌', path: docsPath });
  }
  
  // Display results
  console.log('📋 Verification Results:\n');
  
  checks.forEach((check, index) => {
    console.log(`${index + 1}. ${check.status} ${check.name}`);
    if (check.error) {
      console.log(`   Error: ${check.error}`);
    }
    console.log(`   Path: ${check.path}\n`);
  });
  
  // Summary
  const passed = checks.filter(check => check.status === '✅').length;
  const total = checks.length;
  
  console.log('📊 Summary:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log(`   Success Rate: ${Math.round((passed / total) * 100)}%\n`);
  
  if (passed === total) {
    console.log('🎉 All verification checks passed!');
    console.log('\n📋 Module Structure Verified:');
    console.log('   ✅ Core processor and template files');
    console.log('   ✅ Integration service');
    console.log('   ✅ CLI command interface');
    console.log('   ✅ Enhanced validator');
    console.log('   ✅ Configuration updates');
    console.log('   ✅ Documentation');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Build the project: npm run build');
    console.log('   2. Test the CLI: npm run cli risk-compliance --project "Test Project"');
    console.log('   3. Review generated assessments');
    console.log('   4. Integrate with your workflow');
  } else {
    console.log('⚠️  Some verification checks failed. Please review the issues above.');
  }
  
  // Verify file contents for key components
  console.log('\n🔍 Content Verification:');
  
  // Check processor content
  if (existsSync(processorPath)) {
    const processorContent = readFileSync(processorPath, 'utf-8');
    const hasRequiredMethods = [
      'process(',
      'createPrompt(',
      'validateOutput('
    ].every(method => processorContent.includes(method));
    
    console.log(`   Processor methods: ${hasRequiredMethods ? '✅' : '❌'}`);
  }
  
  // Check template content
  if (existsSync(templatePath)) {
    const templateContent = readFileSync(templatePath, 'utf-8');
    const hasRequiredSections = [
      'Executive Summary',
      'Risk Assessment',
      'Compliance Assessment',
      'Risk-Compliance Correlation'
    ].every(section => templateContent.includes(section));
    
    console.log(`   Template sections: ${hasRequiredSections ? '✅' : '❌'}`);
  }
  
  // Check service content
  if (existsSync(servicePath)) {
    const serviceContent = readFileSync(servicePath, 'utf-8');
    const hasRequiredMethods = [
      'performIntegratedAssessment(',
      'performComplianceAnalysis(',
      'performRiskAssessment('
    ].every(method => serviceContent.includes(method));
    
    console.log(`   Service methods: ${hasRequiredMethods ? '✅' : '❌'}`);
  }
  
  console.log('\n✨ Risk and Compliance Assessment Module verification complete!');
}

// Run the verification
verifyRiskComplianceModule();