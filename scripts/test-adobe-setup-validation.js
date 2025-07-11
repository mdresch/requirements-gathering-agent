#!/usr/bin/env node

/**
 * Adobe Setup Validation Script
 * Tests the setup script functionality without user interaction
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Adobe Setup Validation Test');
console.log('=' .repeat(50));

async function validateSetupScript() {
  const results = {
    templateExists: false,
    scriptExists: false,
    scriptExecutable: false,
    configurationCreated: false,
    errorHandling: false
  };

  try {
    // 1. Check if template exists
    const templatePath = join(projectRoot, '.env.adobe.template');
    results.templateExists = existsSync(templatePath);
    console.log(`✅ Template file exists: ${results.templateExists}`);

    // 2. Check if setup script exists
    const scriptPath = join(projectRoot, 'scripts', 'setup-adobe-integration.js');
    results.scriptExists = existsSync(scriptPath);
    console.log(`✅ Setup script exists: ${results.scriptExists}`);

    // 3. Test script is executable (starts without error)
    console.log('🧪 Testing script execution...');
    const testResult = await testScriptExecution();
    results.scriptExecutable = testResult.success;
    console.log(`✅ Script executable: ${results.scriptExecutable}`);
    if (!testResult.success) {
      console.log(`❌ Error: ${testResult.error}`);
    }

    // 4. Check npm script configuration
    const packageJsonPath = join(projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const hasAdobeSetup = packageJson.scripts && packageJson.scripts['adobe:setup'];
      console.log(`✅ npm script configured: ${hasAdobeSetup}`);
      
      if (hasAdobeSetup) {
        console.log(`   Command: ${packageJson.scripts['adobe:setup']}`);
      }
    }

    // 5. Test template content validation
    if (results.templateExists) {
      const templateContent = readFileSync(templatePath, 'utf8');
      const hasRequiredFields = [
        'ADOBE_CLIENT_ID',
        'ADOBE_CLIENT_SECRET',
        'ADOBE_ORGANIZATION_ID',
        'ADOBE_ACCOUNT_ID',
        'ADOBE_PRIVATE_KEY'
      ].every(field => templateContent.includes(field));
      
      console.log(`✅ Template has required fields: ${hasRequiredFields}`);
    }

    // Summary
    console.log('\n📊 Validation Summary:');
    console.log('=' .repeat(30));
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    console.log(`Passed: ${passed}/${total} tests`);
    
    if (passed === total) {
      console.log('🎉 All validation tests passed!');
      console.log('\n✅ Adobe setup is ready for use:');
      console.log('   Run: npm run adobe:setup');
    } else {
      console.log('⚠️  Some validation tests failed.');
      console.log('   Please review the setup configuration.');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  }
}

function testScriptExecution() {
  return new Promise((resolve) => {
    const setupScript = spawn('node', ['scripts/setup-adobe-integration.js'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    setupScript.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    setupScript.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Kill the process after a short time since it's interactive
    setTimeout(() => {
      setupScript.kill('SIGTERM');
    }, 2000);

    setupScript.on('exit', (code) => {
      const success = code === null || code === 0 || stdout.includes('Adobe Document Services Integration Setup');
      resolve({
        success,
        error: stderr || (code !== null && code !== 0 ? `Exit code: ${code}` : null),
        output: stdout
      });
    });

    setupScript.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        output: stdout
      });
    });
  });
}

// Run validation
validateSetupScript().catch(console.error);
