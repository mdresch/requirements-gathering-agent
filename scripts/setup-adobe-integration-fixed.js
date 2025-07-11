#!/usr/bin/env node

/**
 * Adobe Integration Setup Script
 * Helps users configure the Adobe Document Services integration
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🎨 Adobe Document Services Integration Setup');
console.log('=' .repeat(60));
console.log('Transform your ADPA documentation into professional,');
console.log('publication-ready documents with Adobe services.');
console.log('=' .repeat(60));
console.log('');

const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    readline.question(prompt, resolve);
  });
}

async function setupAdobeIntegration() {
  console.log('🚀 Starting Adobe PDF Services Integration Setup...\n');

  try {
    // Check if configuration already exists
    const envPath = join(projectRoot, '.env.adobe');
    const templatePath = join(projectRoot, '.env.adobe.template');
    
    console.log('📋 Checking for existing configuration...');
    
    if (existsSync(envPath)) {
      console.log('⚠️  Adobe configuration file already exists.');
      const overwrite = await question('   Overwrite existing configuration? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('✅ Setup cancelled. Existing configuration preserved.');
        readline.close();
        return;
      }
      console.log('');
    }

    // Copy template
    if (existsSync(templatePath)) {
      copyFileSync(templatePath, envPath);
      console.log('✅ Configuration template copied to .env.adobe\n');
    } else {
      console.error('❌ Configuration template not found. Please ensure .env.adobe.template exists.');
      readline.close();
      return;
    }

    // Gather Adobe credentials
    console.log('📝 Please provide your Adobe Developer Console credentials:');
    console.log('   Get these from: https://developer.adobe.com/console\n');

    const clientId = await question('🔑 Adobe Client ID: ');
    const clientSecret = await question('🔐 Adobe Client Secret: ');
    const organizationId = await question('🏢 Adobe Organization ID: ');
    const accountId = await question('👤 Adobe Account ID: ');

    console.log('\n📋 Private Key Setup:');
    console.log('   You can either:');
    console.log('   1. Provide base64 encoded private key directly');
    console.log('   2. Provide path to private key file');
    console.log('   3. Skip for now (configure manually later)\n');

    const keyOption = await question('Choose option (1/2/3): ');
    let privateKey = '';

    if (keyOption === '1') {
      privateKey = await question('🔐 Base64 encoded private key: ');
    } else if (keyOption === '2') {
      const keyPath = await question('📄 Path to private key file: ');
      if (existsSync(keyPath)) {
        try {
          const keyContent = readFileSync(keyPath, 'utf8');
          privateKey = Buffer.from(keyContent).toString('base64');
          console.log('✅ Private key encoded successfully.');
        } catch (error) {
          console.log('⚠️  Could not read private key file. You can configure this manually later.');
        }
      } else {
        console.log('⚠️  Private key file not found. You can configure this manually later.');
      }
    }

    // Environment selection
    console.log('\n🌍 Environment Configuration:');
    const environment = await question('Environment (sandbox/production) [sandbox]: ') || 'sandbox';

    // Feature configuration
    console.log('\n⚙️  Feature Configuration:');
    const interactivePdf = await question('Enable interactive PDF features? (Y/n): ');
    const brandCompliance = await question('Enable brand compliance validation? (Y/n): ');
    const documentIntelligence = await question('Enable document intelligence? (Y/n): ');

    // Write configuration
    const config = {
      ADOBE_CLIENT_ID: clientId,
      ADOBE_CLIENT_SECRET: clientSecret,
      ADOBE_ORGANIZATION_ID: organizationId,
      ADOBE_ACCOUNT_ID: accountId,
      ADOBE_PRIVATE_KEY: privateKey,
      ADOBE_ENVIRONMENT: environment,
      ADOBE_INTERACTIVE_PDF_ENABLED: interactivePdf.toLowerCase() !== 'n',
      ADOBE_BRAND_COMPLIANCE_ENABLED: brandCompliance.toLowerCase() !== 'n',
      ADOBE_DOCUMENT_INTELLIGENCE_ENABLED: documentIntelligence.toLowerCase() !== 'n'
    };

    updateEnvFile(envPath, config);

    console.log('\n✅ Adobe integration configured successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Review configuration in .env.adobe');
    console.log('   2. Run: npm run build');
    console.log('   3. Test: npm run adobe:demo');
    console.log('   4. Validate: npm run adobe:validate\n');

    console.log('📚 Documentation:');
    console.log('   • Integration Guide: docs/ADOBE/ADOBE-INTEGRATION-README.md');
    console.log('   • API Reference: docs/ADOBE/ADOBE-INTEGRATION-PROPOSAL.md\n');

    const runDemo = await question('🎬 Run demo now? (Y/n): ');
    if (runDemo.toLowerCase() !== 'n') {
      console.log('\n🚀 To run the demo, execute: npm run adobe:demo');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Manual Setup:');
    console.log('   1. Copy .env.adobe.template to .env.adobe');
    console.log('   2. Configure Adobe credentials manually');
    console.log('   3. Refer to documentation for guidance');
  } finally {
    readline.close();
  }
}

function updateEnvFile(envPath, config) {
  try {
    let envContent = readFileSync(envPath, 'utf8');
    
    // Update configuration values
    for (const [key, value] of Object.entries(config)) {
      if (value !== '') {
        const regex = new RegExp(`^${key}=.*`, 'm');
        const replacement = `${key}=${value}`;
        
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, replacement);
        } else {
          envContent += `\n${replacement}`;
        }
      }
    }

    writeFileSync(envPath, envContent);
    console.log('💾 Configuration saved to .env.adobe');
    
  } catch (error) {
    console.error('❌ Failed to update configuration file:', error.message);
    throw error;
  }
}

// Run setup
setupAdobeIntegration().catch(console.error);
