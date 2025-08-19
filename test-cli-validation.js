#!/usr/bin/env node

/**
 * CLI Validation Test Script
 * Quick validation of CLI functionality for manual testing
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🧪 CLI Validation Test Script');
console.log('=' .repeat(40));

const tests = [
  {
    name: 'CLI Help Command',
    command: 'node dist/cli.js --help',
    expectedOutput: ['Commands:', 'generate', 'interactive'],
    description: 'Verify CLI displays help information correctly'
  },
  {
    name: 'CLI Version Command',
    command: 'node dist/cli.js --version',
    expectedOutput: [/\d+\.\d+\.\d+/],
    description: 'Verify CLI displays version information'
  },
  {
    name: 'Status Command',
    command: 'node dist/cli.js status --quiet',
    expectedOutput: [],
    description: 'Verify status command executes without errors'
  },
  {
    name: 'Generate Help',
    command: 'node dist/cli.js generate --help',
    expectedOutput: ['Generate a specific document', '--key', '--context'],
    description: 'Verify generate command help is displayed'
  },
  {
    name: 'Confluence Help',
    command: 'node dist/cli.js confluence --help',
    expectedOutput: ['Confluence integration', 'oauth2', 'status'],
    description: 'Verify Confluence command help is displayed'
  },
  {
    name: 'SharePoint Help',
    command: 'node dist/cli.js sharepoint --help',
    expectedOutput: ['SharePoint integration', 'oauth2', 'status'],
    description: 'Verify SharePoint command help is displayed'
  },
  {
    name: 'VCS Help',
    command: 'node dist/cli.js vcs --help',
    expectedOutput: ['Version control system', 'status', 'commit'],
    description: 'Verify VCS command help is displayed'
  }
];

const errorTests = [
  {
    name: 'Unknown Command Error',
    command: 'node dist/cli.js unknown-command',
    description: 'Verify unknown commands are handled gracefully'
  },
  {
    name: 'Invalid Generate Parameters',
    command: 'node dist/cli.js generate --retries -1',
    description: 'Verify parameter validation works'
  },
  {
    name: 'Missing Required Parameters',
    command: 'node dist/cli.js generate',
    description: 'Verify required parameter validation'
  }
];

let passedTests = 0;
let failedTests = 0;

console.log('\n📋 Running CLI validation tests...\n');

// Check if CLI is built
if (!existsSync('dist/cli.js')) {
  console.log('❌ CLI not built. Please run "npm run build" first.');
  process.exit(1);
}

// Run positive tests
for (const test of tests) {
  try {
    console.log(`🧪 ${test.name}: ${test.description}`);
    const output = execSync(test.command, { encoding: 'utf8', timeout: 10000 });
    
    let testPassed = true;
    for (const expected of test.expectedOutput) {
      if (typeof expected === 'string') {
        if (!output.includes(expected)) {
          console.log(`   ❌ Expected output "${expected}" not found`);
          testPassed = false;
        }
      } else if (expected instanceof RegExp) {
        if (!expected.test(output)) {
          console.log(`   ❌ Expected pattern ${expected} not matched`);
          testPassed = false;
        }
      }
    }
    
    if (testPassed) {
      console.log(`   ✅ Passed`);
      passedTests++;
    } else {
      console.log(`   ❌ Failed`);
      failedTests++;
    }
  } catch (error) {
    console.log(`   ❌ Failed with error: ${error.message}`);
    failedTests++;
  }
  console.log('');
}

// Run error tests (these should fail)
console.log('🚨 Running error handling tests (these should fail gracefully)...\n');

for (const test of errorTests) {
  try {
    console.log(`🧪 ${test.name}: ${test.description}`);
    execSync(test.command, { encoding: 'utf8', timeout: 10000 });
    console.log(`   ❌ Should have failed but didn't`);
    failedTests++;
  } catch (error) {
    console.log(`   ✅ Failed as expected: ${error.message.split('\n')[0]}`);
    passedTests++;
  }
  console.log('');
}

// Test interactive menu imports
console.log('🔧 Testing interactive menu modules...\n');

try {
  console.log('🧪 Interactive Menu System Import');
  await import('./src/modules/cli/InteractiveMenuSystem.js');
  console.log('   ✅ Successfully imported InteractiveMenuSystem');
  passedTests++;
} catch (error) {
  console.log(`   ❌ Failed to import InteractiveMenuSystem: ${error.message}`);
  failedTests++;
}

try {
  console.log('🧪 Enhanced Menu Navigation Import');
  await import('./src/modules/cli/EnhancedMenuNavigation.js');
  console.log('   ✅ Successfully imported EnhancedMenuNavigation');
  passedTests++;
} catch (error) {
  console.log(`   ❌ Failed to import EnhancedMenuNavigation: ${error.message}`);
  failedTests++;
}

// Summary
console.log('\n' + '='.repeat(40));
console.log('📊 Test Results Summary');
console.log('='.repeat(40));
console.log(`Total Tests: ${passedTests + failedTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All CLI validation tests passed!');
  console.log('✅ CLI is ready for release');
} else {
  console.log('\n⚠️  Some tests failed. Please review and fix issues.');
  process.exit(1);
}