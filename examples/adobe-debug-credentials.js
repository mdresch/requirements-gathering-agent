#!/usr/bin/env node

/**
 * Adobe SDK Debug - Detailed Credentials Analysis
 * Let's debug exactly what's happening with the credentials
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Adobe SDK Credentials Debug Analysis');
console.log('='.repeat(50));

async function debugCredentials() {
  try {
    // Import Adobe PDF Services SDK
    console.log('📦 Loading Adobe PDF Services SDK...');
    
    let PDFServices, MimeType, ClientConfig, ServicePrincipalCredentials;
    
    try {
      const sdk = await import('@adobe/pdfservices-node-sdk');
      PDFServices = sdk.PDFServices;
      MimeType = sdk.MimeType;
      ClientConfig = sdk.ClientConfig;
      ServicePrincipalCredentials = sdk.ServicePrincipalCredentials;
      console.log('✅ SDK imported successfully');
      console.log('📋 ServicePrincipalCredentials type:', typeof ServicePrincipalCredentials);
      console.log('📋 ServicePrincipalCredentials constructor:', ServicePrincipalCredentials.toString());
    } catch (sdkError) {
      console.log('❌ SDK import failed:', sdkError.message);
      process.exit(1);
    }

    // Load environment variables
    const envPath = join(projectRoot, '.env.adobe');
    if (!existsSync(envPath)) {
      console.log('❌ .env.adobe file not found');
      process.exit(1);
    }

    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0 && !line.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });

    console.log('\n🔐 Environment Analysis:');
    console.log('Client ID present:', !!envVars.ADOBE_CLIENT_ID);
    console.log('Client ID length:', envVars.ADOBE_CLIENT_ID?.length);
    console.log('Client ID format:', envVars.ADOBE_CLIENT_ID?.substring(0, 8) + '...' || 'N/A');
    console.log('Client Secret present:', !!envVars.ADOBE_CLIENT_SECRET);
    console.log('Client Secret length:', envVars.ADOBE_CLIENT_SECRET?.length);
    console.log('Client Secret format:', envVars.ADOBE_CLIENT_SECRET?.substring(0, 8) + '...' || 'N/A');

    console.log('\n🔧 Creating Credentials (Step by Step):');
    
    // Test credential parameters
    const credentialParams = {
      clientId: envVars.ADOBE_CLIENT_ID,
      clientSecret: envVars.ADOBE_CLIENT_SECRET
    };
    
    console.log('📋 Credential params:', {
      clientId: credentialParams.clientId ? 'Present' : 'Missing',
      clientSecret: credentialParams.clientSecret ? 'Present' : 'Missing'
    });

    // Try to create credentials
    let credentials;
    try {
      console.log('⚙️ Attempting to create ServicePrincipalCredentials...');
      credentials = new ServicePrincipalCredentials(credentialParams);
      console.log('✅ ServicePrincipalCredentials created successfully');
      console.log('📋 Credentials type:', typeof credentials);
      console.log('📋 Credentials instanceof check:', credentials instanceof ServicePrincipalCredentials);
      console.log('📋 Credentials constructor name:', credentials.constructor.name);
      console.log('📋 Credentials client ID:', credentials.clientId);
      console.log('📋 Credentials client secret length:', credentials.clientSecret?.length);
    } catch (credError) {
      console.log('❌ Credentials creation failed:', credError.message);
      console.log('📋 Error type:', credError.constructor.name);
      console.log('📋 Full error:', credError);
      return false;
    }

    // Try to create client config
    try {
      console.log('\n⚙️ Attempting to create ClientConfig...');
      const clientConfig = new ClientConfig({
        credentials: credentials
      });
      console.log('✅ ClientConfig created successfully');
      console.log('📋 ClientConfig type:', typeof clientConfig);
    } catch (configError) {
      console.log('❌ ClientConfig creation failed:', configError.message);
      console.log('📋 Error type:', configError.constructor.name);
      console.log('📋 Full error:', configError);
      return false;
    }

    // Try to create PDFServices instance
    try {
      console.log('\n⚙️ Attempting to create PDFServices instance...');
      const clientConfig = new ClientConfig({
        credentials: credentials
      });
      const pdfServices = new PDFServices({ clientConfig });
      console.log('🎉 PDFServices instance created successfully!');
      console.log('✅ ALL CREDENTIAL TESTS PASSED!');
      return true;
    } catch (pdfError) {
      console.log('❌ PDFServices creation failed:', pdfError.message);
      console.log('📋 Error type:', pdfError.constructor.name);
      console.log('📋 Full error:', pdfError);
      
      // Enhanced error analysis
      if (pdfError.message.includes('Invalid Credentials')) {
        console.log('\n🔍 Invalid Credentials Analysis:');
        console.log('1. Credentials object exists:', !!credentials);
        console.log('2. Credentials is ServicePrincipalCredentials:', credentials instanceof ServicePrincipalCredentials);
        console.log('3. Credentials has clientId:', !!credentials?.clientId);
        console.log('4. Credentials has clientSecret:', !!credentials?.clientSecret);
        console.log('5. ClientId is string:', typeof credentials?.clientId === 'string');
        console.log('6. ClientSecret is string:', typeof credentials?.clientSecret === 'string');
        console.log('7. ClientId is not empty:', credentials?.clientId?.length > 0);
        console.log('8. ClientSecret is not empty:', credentials?.clientSecret?.length > 0);
      }
      
      return false;
    }

  } catch (error) {
    console.log('❌ Debug analysis failed:', error.message);
    console.log('📋 Full error:', error);
    return false;
  }
}

debugCredentials()
  .then(success => {
    if (success) {
      console.log('\n🎉 DEBUG COMPLETE - ALL SYSTEMS OPERATIONAL!');
    } else {
      console.log('\n❌ DEBUG COMPLETE - ISSUES FOUND');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Debug analysis crashed:', error);
    process.exit(1);
  });
