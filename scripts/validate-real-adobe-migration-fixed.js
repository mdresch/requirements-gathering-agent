#!/usr/bin/env node

/**
 * Real Adobe API Migration Validation
 * Validates the real API setup without importing TypeScript modules
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Validating Real Adobe API Migration');
console.log('='.repeat(50));

async function validateMigration() {
  let passed = 0;
  let failed = 0;

  // Test 1: Configuration Files
  console.log('\n📋 Testing Configuration Files...');
  try {
    // Check if .env.adobe exists
    const envPath = join(projectRoot, '.env.adobe');
    if (existsSync(envPath)) {
      console.log('✅ .env.adobe file exists');
      passed++;
      
      // Check environment variables
      const envContent = readFileSync(envPath, 'utf8');
      const requiredEnvVars = [
        'ADOBE_CLIENT_ID',
        'ADOBE_CLIENT_SECRET', 
        'ADOBE_ORGANIZATION_ID',
        'ADOBE_ACCOUNT_ID'
      ];

      for (const envVar of requiredEnvVars) {
        if (envContent.includes(`${envVar}=`) && !envContent.includes(`${envVar}=your_`)) {
          console.log(`✅ ${envVar} configured`);
          passed++;
        } else {
          console.log(`❌ ${envVar} not configured or using template value`);
          failed++;
        }
      }

      // Check if real API mode is enabled
      if (envContent.includes('ADOBE_USE_REAL_API=true')) {
        console.log('✅ Real API mode enabled');
        passed++;
      } else {
        console.log('⚠️  Real API mode not enabled (set ADOBE_USE_REAL_API=true)');
        failed++;
      }

      // Check private key path
      const privateKeyMatch = envContent.match(/ADOBE_PRIVATE_KEY_PATH=(.+)/);
      if (privateKeyMatch) {
        const privateKeyPath = privateKeyMatch[1].trim();
        const fullPrivateKeyPath = join(projectRoot, privateKeyPath);
        if (existsSync(fullPrivateKeyPath)) {
          console.log('✅ Private key file found');
          passed++;
        } else {
          console.log(`❌ Private key file not found: ${privateKeyPath}`);
          failed++;
        }
      } else {
        console.log('❌ ADOBE_PRIVATE_KEY_PATH not configured');
        failed++;
      }
    } else {
      console.log('❌ .env.adobe file not found - run npm run adobe:setup-real');
      failed++;
    }
  } catch (error) {
    console.log('❌ Configuration validation failed:', error.message);
    failed++;
  }

  // Test 2: Real API Source Files
  console.log('\n📄 Testing Real API Source Files...');
  const realApiFiles = [
    'src/adobe/authenticator.ts',
    'src/adobe/real-pdf-processor.ts'
  ];

  for (const file of realApiFiles) {
    const filePath = join(projectRoot, file);
    if (existsSync(filePath)) {
      console.log(`✅ Found: ${file}`);
      passed++;
    } else {
      console.log(`❌ Missing: ${file} - run npm run adobe:migrate-real`);
      failed++;
    }
  }

  // Test 3: Dependencies
  console.log('\n📦 Testing Dependencies...');
  try {
    // Check package.json for Adobe dependencies
    const packageJsonPath = join(projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const requiredDeps = [
        '@adobe/pdfservices-node-sdk',
        'jsonwebtoken'
      ];

      for (const dep of requiredDeps) {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          console.log(`✅ ${dep} installed`);
          passed++;
        } else {
          console.log(`❌ ${dep} not installed - run npm run adobe:migrate-real`);
          failed++;
        }
      }
    }

    // Try to import Adobe SDK (if installed)
    try {
      await import('@adobe/pdfservices-node-sdk');
      console.log('✅ Adobe PDF Services SDK available');
      passed++;
    } catch (error) {
      console.log('❌ Adobe PDF Services SDK not available');
      failed++;
    }

    try {
      await import('jsonwebtoken');
      console.log('✅ JWT library available');
      passed++;
    } catch (error) {
      console.log('❌ JWT library not available');
      failed++;
    }
  } catch (error) {
    console.log('❌ Dependency validation failed:', error.message);
    failed++;
  }

  // Test 4: Package Scripts
  console.log('\n🔧 Testing Package Scripts...');
  try {
    const packageJsonPath = join(projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const requiredScripts = [
        'adobe:migrate-real',
        'adobe:setup-real',
        'adobe:validate-real',
        'adobe:test-real'
      ];

      for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          console.log(`✅ Script available: ${script}`);
          passed++;
        } else {
          console.log(`❌ Script missing: ${script}`);
          failed++;
        }
      }
    }
  } catch (error) {
    console.log('❌ Package script validation failed:', error.message);
    failed++;
  }

  // Test 5: Documentation
  console.log('\n📚 Testing Documentation...');
  const realApiDocs = [
    'docs/ADOBE/REAL-API-INTEGRATION-PLAN.md',
    'docs/ADOBE/REAL-API-QUICK-START-GUIDE.md'
  ];

  for (const doc of realApiDocs) {
    const docPath = join(projectRoot, doc);
    if (existsSync(docPath)) {
      console.log(`✅ Found: ${doc}`);
      passed++;
    } else {
      console.log(`❌ Missing: ${doc}`);
      failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Migration Validation Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${(passed / (passed + failed) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 Migration validation PASSED!');
    console.log('✅ Ready to use real Adobe API');
    console.log('\n📝 Next Steps:');
    console.log('1. Test authentication: npm run adobe:test-auth');
    console.log('2. Generate test PDF: npm run adobe:example-basic');
    console.log('3. Run full tests: npm run adobe:test-real');
    process.exit(0);
  } else {
    console.log('\n⚠️  Migration validation FAILED');
    console.log('🔧 Please address the issues above');
    console.log('\n📝 Suggested Actions:');
    if (failed > 5) {
      console.log('1. Run migration: npm run adobe:migrate-real');
      console.log('2. Setup credentials: npm run adobe:setup-real');
    } else {
      console.log('1. Setup credentials: npm run adobe:setup-real');
      console.log('2. Check file locations and permissions');
    }
    console.log('3. Validate again: npm run adobe:validate-real');
    process.exit(1);
  }
}

validateMigration().catch(error => {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
});
