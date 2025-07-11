#!/usr/bin/env node

/**
 * Real Adobe API Migration Validation
 * Validates without importing TypeScript modules
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
        console.log('⚠️  Real API mode not enabled (ADOBE_USE_REAL_API=true)');
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
      'ADOBE_CLIENT_SECRET', 
      'ADOBE_ORGANIZATION_ID',
      'ADOBE_ACCOUNT_ID'
    ];

    for (const envVar of requiredEnvVars) {
      if (config[envVar] && config[envVar] !== 'your_' + envVar.toLowerCase() + '_here') {
        console.log(`✅ ${envVar} configured`);
        passed++;
      } else {
        console.log(`❌ ${envVar} not configured`);
        failed++;
      }
    }
  } catch (error) {
    console.log('❌ Configuration validation failed:', error.message);
    failed++;
  }

  // Test 2: Authentication
  console.log('\n🔐 Testing Authentication...');
  try {
    const authResult = await adobeAuth.authenticate();
    if (authResult.success) {
      console.log('✅ Adobe authentication successful');
      passed++;
    } else {
      console.log('❌ Adobe authentication failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Authentication test failed:', error.message);
    failed++;
  }

  // Test 3: PDF Processor
  console.log('\n📄 Testing PDF Processor...');
  try {
    const isConnected = await realAdobePDFProcessor.validateConnection();
    if (isConnected) {
      console.log('✅ Adobe PDF Services connection successful');
      passed++;
    } else {
      console.log('❌ Adobe PDF Services connection failed');
      failed++;
    }

    const status = realAdobePDFProcessor.getStatus();
    console.log(`📊 Processor status: ${status}`);
  } catch (error) {
    console.log('❌ PDF processor test failed:', error.message);
    failed++;
  }

  // Test 4: Dependencies
  console.log('\n📦 Testing Dependencies...');
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

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Migration Validation Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${(passed / (passed + failed) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 Migration validation PASSED!');
    console.log('✅ Ready to use real Adobe API');
    process.exit(0);
  } else {
    console.log('\n⚠️  Migration validation FAILED');
    console.log('🔧 Please address the issues above');
    process.exit(1);
  }
}

validateMigration().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
