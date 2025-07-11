import fs from 'fs';
import path from 'path';

console.log('🎯 Adobe Integration Phase 1 - Simple Validation\n');

const projectRoot = process.cwd();
const requiredFiles = [
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
];

let passed = 0;
let failed = 0;

console.log('🔍 Checking File Structure...');
console.log('='.repeat(60));

for (const file of requiredFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`);
    passed++;
  } else {
    console.log(`❌ Missing: ${file}`);
    failed++;
  }
}

// Check test file
const testFile = 'src/adobe/__tests__/adobe-integration.test.ts';
const testPath = path.join(projectRoot, testFile);
if (fs.existsSync(testPath)) {
  console.log(`✅ Found: ${testFile}`);
  passed++;
} else {
  console.log(`❌ Missing: ${testFile}`);
  failed++;
}

// Check package.json for scripts
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredScripts = ['adobe:demo', 'adobe:test', 'adobe:setup', 'adobe:validate'];
    
    console.log('\n⚙️  Checking Package.json Scripts...');
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`✅ Script: ${script}`);
        passed++;
      } else {
        console.log(`❌ Missing script: ${script}`);
        failed++;
      }
    }
  } catch (error) {
    console.log(`❌ Failed to parse package.json`);
    failed++;
  }
}

// Summary
console.log('\n📊 Validation Summary');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 Adobe Integration Phase 1 - STRUCTURE VALIDATION PASSED!');
  console.log('\n📚 Next Steps:');
  console.log('  1. Run setup: npm run adobe:setup');
  console.log('  2. Test structure: npm run adobe:validate');
  console.log('  3. Review docs: docs/ADOBE/ADOBE-INTEGRATION-README.md');
} else {
  console.log('\n❌ Some files are missing. Please check the implementation.');
}

process.exit(failed === 0 ? 0 : 1);
