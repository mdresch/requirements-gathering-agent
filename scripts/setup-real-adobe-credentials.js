#!/usr/bin/env node

/**
 * Adobe Real API Setup Helper
 * Guides users through setting up real Adobe API credentials
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    readline.question(prompt, resolve);
  });
}

console.log('🔧 Adobe Real API Credentials Setup');
console.log('='.repeat(50));
console.log('');
console.log('This wizard will help you configure real Adobe PDF Services API credentials.');
console.log('Make sure you have:');
console.log('- An Adobe Developer Console account');
console.log('- A project with PDF Services API enabled');
console.log('- Downloaded your private key file');
console.log('');

async function setupCredentials() {
  try {
    console.log('📝 Please provide your Adobe API credentials:\n');

    // Collect credentials
    const clientId = await question('🔑 Adobe Client ID: ');
    const clientSecret = await question('🔐 Adobe Client Secret: ');
    const organizationId = await question('🏢 Adobe Organization ID: ');
    const accountId = await question('👤 Adobe Account ID (Technical Account ID): ');
    
    let privateKeyPath = await question('📄 Private Key File Path (relative to project root): ');
    if (!privateKeyPath) {
      privateKeyPath = './adobe-private.key';
    }

    // Validate private key file
    const fullPrivateKeyPath = join(projectRoot, privateKeyPath);
    if (!existsSync(fullPrivateKeyPath)) {
      console.log('⚠️  Warning: Private key file not found at:', fullPrivateKeyPath);
      console.log('Please ensure you download and place your private key file in the correct location.');
    } else {
      console.log('✅ Private key file found');
    }

    // Environment selection
    console.log('\n🌍 Environment Selection:');
    console.log('1. Production (default)');
    console.log('2. Staging');
    
    const envChoice = await question('Select environment [1]: ') || '1';
    const environment = envChoice === '2' ? 'staging' : 'production';

    // Feature configuration
    console.log('\n⚙️  Feature Configuration:');
    const enableRealApi = await question('Enable real API mode? [Y/n]: ') || 'Y';
    const enableDocIntelligence = await question('Enable Document Intelligence? [Y/n]: ') || 'Y';
    const enableBrandCompliance = await question('Enable Brand Compliance? [Y/n]: ') || 'Y';
    const enableCaching = await question('Enable response caching? [Y/n]: ') || 'Y';

    // Generate .env.adobe file
    const envContent = `# Adobe PDF Services API Configuration (Real API)
# Generated: ${new Date().toISOString()}

ADOBE_CLIENT_ID=${clientId}
ADOBE_CLIENT_SECRET=${clientSecret}
ADOBE_ORGANIZATION_ID=${organizationId}
ADOBE_ACCOUNT_ID=${accountId}
ADOBE_PRIVATE_KEY_PATH=${privateKeyPath}
ADOBE_ENVIRONMENT=${environment}

# API Settings
ADOBE_MAX_CONCURRENT_REQUESTS=5
ADOBE_REQUEST_TIMEOUT_MS=30000
ADOBE_RETRY_ATTEMPTS=3
ADOBE_RETRY_DELAY_MS=1000

# Feature Flags
ADOBE_USE_REAL_API=${enableRealApi.toLowerCase().startsWith('y')}
ADOBE_ENABLE_DOCUMENT_INTELLIGENCE=${enableDocIntelligence.toLowerCase().startsWith('y')}
ADOBE_ENABLE_BRAND_COMPLIANCE=${enableBrandCompliance.toLowerCase().startsWith('y')}
ADOBE_ENABLE_ADVANCED_FEATURES=false
ADOBE_ENABLE_CACHING=${enableCaching.toLowerCase().startsWith('y')}
ADOBE_ENABLE_BATCH_PROCESSING=true

# Monitoring
ADOBE_ENABLE_USAGE_TRACKING=true
ADOBE_ENABLE_HEALTH_CHECKS=true
ADOBE_LOG_LEVEL=info

# Rate Limiting
ADOBE_RATE_LIMIT_REQUESTS_PER_HOUR=1000
ADOBE_RATE_LIMIT_CONCURRENT=10
ADOBE_RATE_LIMIT_RETRY_DELAY=60000
`;

    const envPath = join(projectRoot, '.env.adobe');
    writeFileSync(envPath, envContent);

    console.log('\n✅ Configuration saved to .env.adobe');
    console.log('\n📋 Next Steps:');
    console.log('1. Ensure your private key file is in place');
    console.log('2. Run validation: npm run adobe:validate-real');
    console.log('3. Test connection: npm run adobe:test-auth');
    console.log('4. Generate test PDF: npm run adobe:example-basic');
    console.log('\n📚 Resources:');
    console.log('- Adobe Developer Console: https://developer.adobe.com/console');
    console.log('- PDF Services Docs: https://developer.adobe.com/document-services/docs/');
    console.log('- Integration Guide: docs/ADOBE/REAL-API-INTEGRATION-PLAN.md');

    // Ask if user wants to run validation
    const runValidation = await question('\n🔍 Run validation now? [Y/n]: ') || 'Y';
    if (runValidation.toLowerCase().startsWith('y')) {
      console.log('\n🔍 Running validation...');
      readline.close();
      
      // Dynamic import and run validation
      try {
        const { exec } = await import('child_process');
        exec('npm run adobe:validate-real', { cwd: projectRoot }, (error, stdout, stderr) => {
          if (error) {
            console.error('❌ Validation failed:', error.message);
          } else {
            console.log(stdout);
          }
          if (stderr) {
            console.error(stderr);
          }
        });
      } catch (error) {
        console.log('⚠️  Could not run validation automatically');
        console.log('Please run: npm run adobe:validate-real');
      }
    } else {
      readline.close();
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    readline.close();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Setup cancelled by user');
  readline.close();
  process.exit(0);
});

setupCredentials();
