#!/usr/bin/env node

/**
 * Adobe Authentication Test - Client Credentials Flow
 * Tests Adobe API authentication using the simpler client credentials method
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔐 Adobe Authentication Test - Client Credentials');
console.log('='.repeat(50));

async function testClientCredentialsAuth() {
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
      if (key && valueParts.length > 0 && !line.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });

    console.log('\n📋 Checking Configuration...');
    
    // Validate required environment variables for client credentials flow
    const required = ['ADOBE_CLIENT_ID', 'ADOBE_CLIENT_SECRET'];
    for (const key of required) {
      if (!envVars[key] || envVars[key].includes('your_')) {
        console.log(`❌ ${key} not configured`);
        console.log('💡 Run: npm run adobe:setup-real');
        process.exit(1);
      } else {
        console.log(`✅ ${key} configured`);
      }
    }

    console.log('\n🌐 Testing Adobe IMS Authentication (Client Credentials)...');

    // Prepare authentication data
    const authData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: envVars.ADOBE_CLIENT_ID,
      client_secret: envVars.ADOBE_CLIENT_SECRET,
      scope: 'openid,AdobeID,DCAPI'
    });

    try {
      console.log('🚀 Making authentication request...');
      
      const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: authData
      });

      console.log(`📊 Response status: ${response.status}`);
      console.log(`📊 Response OK: ${response.ok}`);

      if (response.ok) {
        const authResult = await response.json();
        console.log('✅ Adobe IMS authentication successful');
        console.log(`📊 Access token received`);
        console.log(`⏰ Expires in: ${authResult.expires_in} seconds`);
        console.log(`🔑 Token type: ${authResult.token_type}`);
        
        // Test the access token with PDF Services API
        console.log('\n🔍 Testing PDF Services API Access...');
        
        try {
          const apiResponse = await fetch('https://pdf-services.adobe.io/assets', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authResult.access_token}`,
              'x-api-key': envVars.ADOBE_CLIENT_ID
            }
          });

          if (apiResponse.ok) {
            console.log('✅ PDF Services API access confirmed');
          } else {
            console.log(`⚠️  PDF Services API returned: ${apiResponse.status}`);
            if (apiResponse.status === 403) {
              console.log('💡 This may be normal - PDF Services might require specific endpoints');
            }
          }
        } catch (apiError) {
          console.log(`⚠️  PDF Services API test failed: ${apiError.message}`);
          console.log('💡 This might be expected for the base endpoint');
        }
        
        console.log('\n🎉 Authentication Test PASSED!');
        console.log('✅ Your Adobe credentials are working correctly');
        console.log('✅ Client credentials authentication flow successful');
        
        console.log('\n📝 Next Steps:');
        console.log('1. Generate test PDF: npm run adobe:example-basic');
        console.log('2. Run full validation: npm run adobe:validate-real');
        console.log('3. Test real PDF generation: npm run adobe:test-real');
        
        return true;
        
      } else {
        const errorResult = await response.text();
        console.log('❌ Adobe IMS authentication failed');
        console.log(`📄 Response status: ${response.status}`);
        console.log(`📄 Response: ${errorResult}`);
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Verify client_id and client_secret in Adobe Developer Console');
        console.log('2. Ensure your Adobe project has PDF Services API enabled');
        console.log('3. Check that credentials haven\'t expired');
        console.log('4. Verify scopes are correctly configured');
        
        return false;
      }
    } catch (networkError) {
      console.log('❌ Network error during authentication:', networkError.message);
      console.log('\n🔧 Check your internet connection and try again');
      return false;
    }

  } catch (error) {
    console.log('❌ Authentication test failed:', error.message);
    console.log('\n🔧 Please check your configuration and try again');
    console.log('Stack trace:', error.stack);
    return false;
  }
}

// Export for use in other scripts
export { testClientCredentialsAuth };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testClientCredentialsAuth()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}
