/**
 * Simple Adobe API credential verification script
 */

import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables
config();

console.log('🔧 Adobe Creative Suite Setup Verification\n');

// Check environment variables
const requiredVars = [
  'ADOBE_CLIENT_ID',
  'ADOBE_CLIENT_SECRET', 
  'ADOBE_ORGANIZATION_ID',
  'ADOBE_TECHNICAL_ACCOUNT_ID',
  'ADOBE_ACCOUNT_ID',
  'ADOBE_PRIVATE_KEY'
];

console.log('📋 Environment Variable Check:');
let allPresent = true;

for (const varName of requiredVars) {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? `${value.substring(0, 20)}...` : 'NOT SET';
  console.log(`  ${status} ${varName}: ${display}`);
  if (!value) allPresent = false;
}

console.log(`\n📊 Configuration Status: ${allPresent ? '✅ Complete' : '❌ Incomplete'}`);

if (allPresent) {
  console.log('\n🎉 Adobe Creative Suite credentials are properly configured!');
  console.log('\n📖 Next Steps:');
  console.log('  1. Run: npm run build');
  console.log('  2. Test connections: node dist/adobe/test-connections.js');
  console.log('  3. Process first document: node dist/adobe/creative-suite/index.js');
  
  // Test template directories
  console.log('\n📁 Template Directory Status:');
  const templateDirs = [
    'templates/indesign',
    'templates/illustrator', 
    'templates/photoshop',
    'templates/document-generation',
    'templates/brand-assets'
  ];
  
  for (const dir of templateDirs) {
    const exists = fs.existsSync(dir);
    console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
  }
} else {
  console.log('\n❌ Please complete your .env file with all required Adobe API credentials');
  console.log('   Visit: https://developer.adobe.com/console to get your credentials');
}
