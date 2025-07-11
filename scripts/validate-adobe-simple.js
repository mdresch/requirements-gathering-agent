#!/usr/bin/env node

/**
 * Simplified Adobe Integration Validation Script
 * Quick validation of Adobe Phase 1 implementation
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🎯 Adobe Integration Phase 1 - Quick Validation');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

function checkFile(relativePath, description) {
  const fullPath = join(projectRoot, relativePath);
  if (existsSync(fullPath)) {
    console.log(`✅ ${description}`);
    passed++;
    return true;
  } else {
    console.log(`❌ ${description} - Missing: ${relativePath}`);
    failed++;
    return false;
  }
}

function checkPackageScript(scriptName) {
  try {
    const packagePath = join(projectRoot, 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      if (packageJson.scripts && packageJson.scripts[scriptName]) {
        console.log(`✅ Package script: ${scriptName}`);
        passed++;
        return true;
      }
    }
    console.log(`❌ Package script missing: ${scriptName}`);
    failed++;
    return false;
  } catch (error) {
    console.log(`❌ Error checking package.json: ${error.message}`);
    failed++;
    return false;
  }
}

console.log('\n📁 Core Files:');
checkFile('src/adobe/index.ts', 'Main Adobe index');
checkFile('src/adobe/types.ts', 'Adobe types');
checkFile('src/adobe/config.ts', 'Adobe config');
checkFile('src/adobe/pdf-processor.ts', 'PDF processor');
checkFile('src/adobe/document-intelligence.ts', 'Document intelligence');
checkFile('src/adobe/brand-compliance.ts', 'Brand compliance');
checkFile('src/adobe/enhanced-adpa-processor.ts', 'Enhanced ADPA processor');

console.log('\n🛠️ Utility Files:');
checkFile('src/utils/circuit-breaker.ts', 'Circuit breaker');
checkFile('src/utils/rate-limiter.ts', 'Rate limiter');
checkFile('src/utils/logger.ts', 'Logger utility');

console.log('\n⚙️ Configuration:');
checkFile('.env.adobe.template', 'Environment template');
checkFile('scripts/setup-adobe-integration.js', 'Setup script');

console.log('\n📚 Documentation:');
checkFile('docs/ADOBE/ADOBE-INTEGRATION-README.md', 'Main README');
checkFile('docs/ADOBE/ADOBE-PHASE-1-COMPLETION-SUMMARY.md', 'Phase 1 summary');

console.log('\n📦 Package Scripts:');
checkPackageScript('adobe:setup');
checkPackageScript('adobe:demo');
checkPackageScript('adobe:validate');

console.log('\n' + '='.repeat(60));
console.log(`📊 Validation Results:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Success Rate: ${(passed / (passed + failed) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 Adobe Integration Phase 1 - VALIDATION PASSED!');
  console.log('\n✅ Ready for use! Try:');
  console.log('   npm run adobe:setup');
  console.log('   npm run adobe:demo');
  console.log('   npm run build');
  process.exit(0);
} else {
  console.log('\n⚠️ Some components are missing. See failed items above.');
  console.log('\n🔧 To fix, ensure all required files are present.');
  process.exit(1);
}
