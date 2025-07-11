#!/usr/bin/env node

/**
 * Automated Adobe Setup Test - Simulates user inputs
 * Tests the setup script with predefined inputs
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync, unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🤖 Automated Adobe Setup Test');
console.log('=' .repeat(50));

async function testSetupWithInputs() {
  try {
    // Remove existing .env.adobe if it exists
    const envPath = join(projectRoot, '.env.adobe');
    if (existsSync(envPath)) {
      unlinkSync(envPath);
      console.log('🗑️  Removed existing .env.adobe file');
    }

    console.log('🚀 Starting automated setup test...');

    const setupProcess = spawn('node', ['scripts/setup-adobe-integration.js'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Simulate user inputs
    const inputs = [
      'test_client_id_12345',          // Adobe Client ID
      'test_client_secret_67890',      // Adobe Client Secret  
      'test_org_id_abcdef',            // Adobe Organization ID
      'test_account_id_ghijkl',        // Adobe Account ID
      '3',                             // Skip private key for now
      'sandbox',                       // Environment
      'y',                             // Enable interactive PDF
      'y',                             // Enable brand compliance
      'y',                             // Enable document intelligence
      'n',                             // Don't run demo now
      ''                               // Final enter
    ];

    let inputIndex = 0;
    let output = '';
    let errorOutput = '';

    setupProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('📤 Output:', text.trim());

      // Send next input when we see a prompt
      if ((text.includes(':') || text.includes('?')) && inputIndex < inputs.length) {
        setTimeout(() => {
          const input = inputs[inputIndex++];
          console.log(`📥 Sending input: "${input}"`);
          setupProcess.stdin.write(input + '\n');
        }, 100);
      }
    });

    setupProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('❌ Error:', data.toString().trim());
    });

    setupProcess.on('close', (code) => {
      console.log('\n📊 Test Results:');
      console.log('=' .repeat(30));
      console.log(`Exit code: ${code}`);
      
      // Check if .env.adobe was created
      const configCreated = existsSync(envPath);
      console.log(`Configuration file created: ${configCreated}`);
      
      if (configCreated) {
        console.log('✅ Setup completed successfully!');
        console.log('\n📋 Generated configuration file exists');
        
        // Clean up
        if (existsSync(envPath)) {
          unlinkSync(envPath);
          console.log('🗑️  Cleaned up test configuration file');
        }
      } else {
        console.log('❌ Setup did not complete successfully');
      }

      if (errorOutput) {
        console.log('❌ Errors encountered:', errorOutput);
      }

      console.log('\n🎯 Test Summary:');
      console.log(configCreated ? '✅ AUTOMATED SETUP TEST PASSED' : '❌ AUTOMATED SETUP TEST FAILED');
    });

    setupProcess.on('error', (error) => {
      console.error('❌ Process error:', error.message);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      setupProcess.kill();
      console.log('\n⏰ Test timeout - killing process');
    }, 30000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSetupWithInputs().catch(console.error);
