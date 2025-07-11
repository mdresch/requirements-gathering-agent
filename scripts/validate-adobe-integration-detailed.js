#!/usr/bin/env node

/**
 * Adobe Integration Validation Script
 * Validates the Phase 1 implementation and setup
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Validation configuration
 */
const VALIDATION_CONFIG = {
  requiredFiles: [
    'src/adobe/index.ts',
    'src/adobe/types.ts',
    'src/adobe/config.ts',
    'src/adobe/pdf-processor.ts',
    'src/adobe/document-intelligence.ts',
    'src/adobe/brand-compliance.ts',
    'src/adobe/enhanced-adpa-processor.ts',
    'src/adobe/example.ts',
    'src/utils/circuit-breaker.ts',
    'src/utils/rate-limiter.ts',
    'src/utils/logger.ts',
    '.env.adobe.template',
    'docs/ADOBE/ADOBE-INTEGRATION-README.md',
    'scripts/setup-adobe-integration.js'
  ],
  requiredDependencies: [
    // These would be actual Adobe SDK dependencies in production
    // For now, we validate the structure is ready
  ],
  environmentVariables: [
    'ADOBE_CLIENT_ID',
    'ADOBE_CLIENT_SECRET',
    'ADOBE_ORGANIZATION_ID',
    'ADOBE_ACCOUNT_ID',
    'ADOBE_PRIVATE_KEY',
    'ADOBE_ENVIRONMENT'
  ]
};

/**
 * Validation results tracking
 */
class ValidationTracker {
  constructor() {
    this.results = {
      fileStructure: { passed: 0, failed: 0, issues: [] },
      configuration: { passed: 0, failed: 0, issues: [] },
      integration: { passed: 0, failed: 0, issues: [] },
      documentation: { passed: 0, failed: 0, issues: [] },
      scripts: { passed: 0, failed: 0, issues: [] }
    };
    this.startTime = Date.now();
  }

  pass(category, message) {
    this.results[category].passed++;
    console.log(`✅ ${message}`);
  }

  fail(category, message, details = null) {
    this.results[category].failed++;
    this.results[category].issues.push({ message, details });
    console.log(`❌ ${message}`);
    if (details) {
      console.log(`   ${details}`);
    }
  }

  warn(category, message, details = null) {
    console.log(`⚠️  ${message}`);
    if (details) {
      console.log(`   ${details}`);
    }
  }

  getSummary() {
    const totalPassed = Object.values(this.results).reduce((sum, cat) => sum + cat.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, cat) => sum + cat.failed, 0);
    const totalTime = Date.now() - this.startTime;

    return {
      totalPassed,
      totalFailed,
      totalTime,
      success: totalFailed === 0,
      categories: this.results
    };
  }
}

/**
 * Validate file structure
 */
async function validateFileStructure(tracker) {
  console.log('\n🔍 Validating File Structure...');
  console.log('=' .repeat(60));

  for (const file of VALIDATION_CONFIG.requiredFiles) {
    const filePath = join(projectRoot, file);
    if (existsSync(filePath)) {
      tracker.pass('fileStructure', `Found: ${file}`);
    } else {
      tracker.fail('fileStructure', `Missing: ${file}`);
    }
  }

  // Check test files
  const testFile = 'src/adobe/__tests__/adobe-integration.test.ts';
  const testPath = join(projectRoot, testFile);
  if (existsSync(testPath)) {
    tracker.pass('fileStructure', `Found: ${testFile}`);
  } else {
    tracker.fail('fileStructure', `Missing: ${testFile}`);
  }

  // Validate directory structure
  const requiredDirs = [
    'src/adobe',
    'src/utils',
    'docs/ADOBE',
    'scripts'
  ];

  for (const dir of requiredDirs) {
    const dirPath = join(projectRoot, dir);
    if (existsSync(dirPath)) {
      tracker.pass('fileStructure', `Directory exists: ${dir}`);
    } else {
      tracker.fail('fileStructure', `Missing directory: ${dir}`);
    }
  }
}

/**
 * Validate configuration files
 */
async function validateConfiguration(tracker) {
  console.log('\n⚙️  Validating Configuration...');
  console.log('=' .repeat(60));

  // Check package.json for Adobe scripts
  const packageJsonPath = join(projectRoot, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      const requiredScripts = [
        'adobe:demo',
        'adobe:test', 
        'adobe:setup',
        'adobe:validate'
      ];

      for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          tracker.pass('configuration', `Package.json script: ${script}`);
        } else {
          tracker.fail('configuration', `Missing package.json script: ${script}`);
        }
      }
    } catch (error) {
      tracker.fail('configuration', 'Failed to parse package.json', error.message);
    }
  } else {
    tracker.fail('configuration', 'Missing package.json');
  }

  // Check environment template
  const envTemplatePath = join(projectRoot, '.env.adobe.template');
  if (existsSync(envTemplatePath)) {
    try {
      const envTemplate = readFileSync(envTemplatePath, 'utf8');
      
      for (const envVar of VALIDATION_CONFIG.environmentVariables) {
        if (envTemplate.includes(envVar)) {
          tracker.pass('configuration', `Environment variable template: ${envVar}`);
        } else {
          tracker.fail('configuration', `Missing environment variable template: ${envVar}`);
        }
      }
    } catch (error) {
      tracker.fail('configuration', 'Failed to read .env.adobe.template', error.message);
    }
  } else {
    tracker.fail('configuration', 'Missing .env.adobe.template');
  }

  // Check if actual environment file exists
  const envPath = join(projectRoot, '.env.adobe');
  if (existsSync(envPath)) {
    tracker.pass('configuration', 'Adobe environment file configured');
  } else {
    tracker.warn('configuration', 'Adobe environment file not configured - run setup script');
  }
}

/**
 * Validate TypeScript integration
 */
async function validateIntegration(tracker) {
  console.log('\n🔧 Validating TypeScript Integration...');
  console.log('=' .repeat(60));

  // Check if TypeScript files have proper exports
  const indexPath = join(projectRoot, 'src/adobe/index.ts');
  if (existsSync(indexPath)) {
    try {
      const indexContent = readFileSync(indexPath, 'utf8');
      
      const requiredExports = [
        'AdobePDFProcessor',
        'EnhancedADPAProcessor',
        'DocumentIntelligence',
        'BrandComplianceEngine',
        'generateProfessionalPDF',
        'processDocument',
        'analyzeDocument',
        'validateBrandCompliance'
      ];

      for (const exportName of requiredExports) {
        if (indexContent.includes(exportName)) {
          tracker.pass('integration', `Export available: ${exportName}`);
        } else {
          tracker.fail('integration', `Missing export: ${exportName}`);
        }
      }
    } catch (error) {
      tracker.fail('integration', 'Failed to validate index exports', error.message);
    }
  }

  // Check types file
  const typesPath = join(projectRoot, 'src/adobe/types.ts');
  if (existsSync(typesPath)) {
    try {
      const typesContent = readFileSync(typesPath, 'utf8');
      
      const requiredTypes = [
        'PDFDocument',
        'DocumentPackage',
        'DocumentAnalysis',
        'BrandComplianceResult',
        'OutputOptions'
      ];

      for (const typeName of requiredTypes) {
        if (typesContent.includes(`interface ${typeName}`)) {
          tracker.pass('integration', `Type definition: ${typeName}`);
        } else {
          tracker.fail('integration', `Missing type definition: ${typeName}`);
        }
      }
    } catch (error) {
      tracker.fail('integration', 'Failed to validate types', error.message);
    }
  }
}

/**
 * Validate documentation
 */
async function validateDocumentation(tracker) {
  console.log('\n📚 Validating Documentation...');
  console.log('=' .repeat(60));

  // Check main README
  const readmePath = join(projectRoot, 'docs/ADOBE/ADOBE-INTEGRATION-README.md');
  if (existsSync(readmePath)) {
    try {
      const readmeContent = readFileSync(readmePath, 'utf8');
      
      const requiredSections = [
        'Quick Start',
        'Configuration',
        'API Reference',
        'Examples',
        'Troubleshooting'
      ];

      for (const section of requiredSections) {
        if (readmeContent.includes(section)) {
          tracker.pass('documentation', `README section: ${section}`);
        } else {
          tracker.fail('documentation', `Missing README section: ${section}`);
        }
      }

      // Check for code examples
      if (readmeContent.includes('```')) {
        tracker.pass('documentation', 'Code examples present');
      } else {
        tracker.warn('documentation', 'No code examples found in README');
      }
    } catch (error) {
      tracker.fail('documentation', 'Failed to validate README', error.message);
    }
  } else {
    tracker.fail('documentation', 'Missing main integration README');
  }

  // Check if example file is documented
  const examplePath = join(projectRoot, 'src/adobe/example.ts');
  if (existsSync(examplePath)) {
    try {
      const exampleContent = readFileSync(examplePath, 'utf8');
      if (exampleContent.includes('/**') && exampleContent.includes('*/')) {
        tracker.pass('documentation', 'Example file is documented');
      } else {
        tracker.warn('documentation', 'Example file lacks JSDoc comments');
      }
    } catch (error) {
      tracker.fail('documentation', 'Failed to validate example file', error.message);
    }
  }
}

/**
 * Validate setup scripts
 */
async function validateScripts(tracker) {
  console.log('\n🛠️  Validating Setup Scripts...');
  console.log('=' .repeat(60));

  // Check setup script
  const setupScriptPath = join(projectRoot, 'scripts/setup-adobe-integration.js');
  if (existsSync(setupScriptPath)) {
    try {
      const setupContent = readFileSync(setupScriptPath, 'utf8');
      
      if (setupContent.includes('setupAdobeIntegration')) {
        tracker.pass('scripts', 'Setup function present');
      } else {
        tracker.fail('scripts', 'Missing setup function');
      }

      if (setupContent.includes('readline')) {
        tracker.pass('scripts', 'Interactive setup implemented');
      } else {
        tracker.fail('scripts', 'Setup script not interactive');
      }
    } catch (error) {
      tracker.fail('scripts', 'Failed to validate setup script', error.message);
    }
  } else {
    tracker.fail('scripts', 'Missing setup script');
  }

  // Check if validation script exists (this script)
  const validationScriptPath = join(projectRoot, 'scripts/validate-adobe-integration.js');
  if (existsSync(validationScriptPath)) {
    tracker.pass('scripts', 'Validation script present');
  } else {
    tracker.warn('scripts', 'Validation script not found');
  }
}

/**
 * Main validation function
 */
async function runValidation() {
  console.log('🎯 Adobe Integration Phase 1 - Validation\n');
  console.log('=' .repeat(60));
  console.log('Validating the Adobe Document Services integration implementation...\n');

  const tracker = new ValidationTracker();

  try {
    await validateFileStructure(tracker);
    await validateConfiguration(tracker);
    await validateIntegration(tracker);
    await validateDocumentation(tracker);
    await validateScripts(tracker);

    // Generate summary
    const summary = tracker.getSummary();
    
    console.log('\n📊 Validation Summary');
    console.log('=' .repeat(60));
    console.log(`⏱️  Total Time: ${(summary.totalTime / 1000).toFixed(2)}s`);
    console.log(`✅ Passed: ${summary.totalPassed}`);
    console.log(`❌ Failed: ${summary.totalFailed}`);
    console.log(`📈 Success Rate: ${((summary.totalPassed / (summary.totalPassed + summary.totalFailed)) * 100).toFixed(1)}%`);

    // Category breakdown
    console.log('\n📋 Category Breakdown:');
    for (const [category, results] of Object.entries(summary.categories)) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      console.log(`  ${categoryName}: ${results.passed}✅ ${results.failed}❌`);
    }

    // Issues summary
    if (summary.totalFailed > 0) {
      console.log('\n⚠️  Issues Found:');
      for (const [category, results] of Object.entries(summary.categories)) {
        if (results.issues.length > 0) {
          console.log(`\n  ${category.charAt(0).toUpperCase() + category.slice(1)}:`);
          results.issues.forEach(issue => {
            console.log(`    • ${issue.message}`);
            if (issue.details) {
              console.log(`      ${issue.details}`);
            }
          });
        }
      }
    }

    // Final status
    console.log('\n' + '='.repeat(60));
    if (summary.success) {
      console.log('🎉 Adobe Integration Phase 1 - VALIDATION PASSED!');
      console.log('\n✅ Ready for:');
      console.log('  • npm run build');
      console.log('  • npm run adobe:demo');
      console.log('  • npm run adobe:test');
    } else {
      console.log('❌ Adobe Integration Phase 1 - VALIDATION FAILED');
      console.log('\n🔧 Please address the issues above before proceeding.');
    }

    console.log('\n📚 Next Steps:');
    console.log('  1. Run setup: npm run adobe:setup');
    console.log('  2. Configure: Edit .env.adobe with your Adobe credentials');
    console.log('  3. Test: npm run adobe:demo');
    console.log('  4. Build: npm run build');

    return summary.success;

  } catch (error) {
    console.error('\n💥 Validation failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation error:', error);
      process.exit(1);
    });
}

export { runValidation };
