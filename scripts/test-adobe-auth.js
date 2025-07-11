#!/usr/bin/env node

/**
 * Adobe Authentication Test
 * Tests Adobe API authentication without importing TypeScript modules
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔐 Adobe Authentication Test');
console.log('='.repeat(40));

async function testAuthentication() {
  try {
    // Load environment variables
    const envPath = join(projectRoot, '.env.adobe');
    if (!existsSync(envPath)) {
      console.log('❌ .env.adobe file not found');
      console.log('💡 Run: npm run adobe:setup-real');
      process.exit(1);
    }

    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    // Parse environment variables
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });

    console.log('\n📋 Checking Configuration...');
    
    // Validate required environment variables
    const required = ['ADOBE_CLIENT_ID', 'ADOBE_CLIENT_SECRET', 'ADOBE_ORGANIZATION_ID', 'ADOBE_ACCOUNT_ID', 'ADOBE_PRIVATE_KEY_PATH'];
    for (const key of required) {
      if (!envVars[key] || envVars[key].includes('your_')) {
        console.log(`❌ ${key} not configured`);
        console.log('💡 Run: npm run adobe:setup-real');
        process.exit(1);
      } else {
        console.log(`✅ ${key} configured`);
      }
    }

    // Check private key file
    const privateKeyPath = join(projectRoot, envVars.ADOBE_PRIVATE_KEY_PATH);
    if (!existsSync(privateKeyPath)) {
      console.log(`❌ Private key file not found: ${envVars.ADOBE_PRIVATE_KEY_PATH}`);
      console.log('💡 Download your private key from Adobe Developer Console');
      process.exit(1);
    }

    console.log('✅ Private key file found');

    // Load private key
    const privateKey = readFileSync(privateKeyPath, 'utf8');
    console.log('✅ Private key loaded');

    console.log('\n🔑 Generating JWT Token...');

    // Create JWT payload
    const payload = {
      iss: envVars.ADOBE_ORGANIZATION_ID,
      sub: envVars.ADOBE_ACCOUNT_ID,
      aud: `https://ims-na1.adobelogin.com/c/${envVars.ADOBE_CLIENT_ID}`,
      'https://ims-na1.adobelogin.com/s/ent_documentcloud_sdk': true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
    };

    // Generate JWT
    const jwtToken = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    console.log('✅ JWT token generated successfully');
    console.log(`📏 Token length: ${jwtToken.length} characters`);

    console.log('\n🌐 Testing Adobe IMS Authentication...');

    // Test Adobe IMS authentication
    const authData = new URLSearchParams({
      client_id: envVars.ADOBE_CLIENT_ID,
      client_secret: envVars.ADOBE_CLIENT_SECRET,
      jwt_token: jwtToken
    });

    try {
      const response = await fetch('https://ims-na1.adobelogin.com/ims/exchange/jwt/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: authData
      });

      if (response.ok) {
        const authResult = await response.json();
        console.log('✅ Adobe IMS authentication successful');
        console.log(`📊 Access token received (expires in ${authResult.expires_in}ms)`);
        console.log(`🔑 Token type: ${authResult.token_type}`);
        
        console.log('\n🎉 Authentication Test PASSED!');
        console.log('✅ Your Adobe credentials are working correctly');
        console.log('\n📝 Next Steps:');
        console.log('1. Generate test PDF: npm run adobe:example-basic');
        console.log('2. Run full validation: npm run adobe:validate-real');
        
      } else {
        const errorResult = await response.text();
        console.log('❌ Adobe IMS authentication failed');
        console.log(`📄 Response status: ${response.status}`);
        console.log(`📄 Response: ${errorResult}`);
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Verify credentials in Adobe Developer Console');
        console.log('2. Ensure PDF Services API is enabled for your project');
        console.log('3. Check that private key matches your project');
        console.log('4. Verify Organization ID and Account ID are correct');
        
        process.exit(1);
      }
    } catch (networkError) {
      console.log('❌ Network error during authentication:', networkError.message);
      console.log('\n🔧 Check your internet connection and try again');
      process.exit(1);
    }

  } catch (error) {
    console.log('❌ Authentication test failed:', error.message);
    console.log('\n🔧 Please check your configuration and try again');
    process.exit(1);
  }
}

testAuthentication();
