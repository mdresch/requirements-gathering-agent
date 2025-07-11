#!/usr/bin/env node

/**
 * Adobe Authentication Test - Working Version
 */

console.log('🔐 Adobe Authentication Test - Working Version');
console.log('='.repeat(50));

async function testAuth() {
  // Use environment variables for credentials
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log('❌ Error: Adobe credentials not configured');
    console.log('Please set ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET environment variables');
    console.log('Get your credentials from: https://developer.adobe.com/console');
    return;
  }

  console.log('\n📋 Configuration:');
  console.log(`✅ Client ID: ${clientId.substring(0, 8)}...`);
  console.log(`✅ Client Secret: ${clientSecret.substring(0, 8)}...`);

  console.log('\n🌐 Testing Adobe IMS Authentication...');

  const authData = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
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
    
    if (response.ok) {
      const authResult = await response.json();
      console.log('✅ Adobe IMS authentication successful!');
      console.log(`📏 Access token length: ${authResult.access_token.length} characters`);
      console.log(`⏰ Expires in: ${authResult.expires_in} seconds`);
      console.log(`🔑 Token type: ${authResult.token_type}`);

      // Test PDF Services API access
      console.log('\n🔍 Testing PDF Services API...');
      try {
        const pdfResponse = await fetch('https://pdf-services.adobe.io/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authResult.access_token}`,
            'x-api-key': clientId
          }
        });
        
        console.log(`📊 PDF Services response: ${pdfResponse.status}`);
        if (pdfResponse.status === 404) {
          console.log('✅ PDF Services API is accessible (404 expected for root endpoint)');
        } else if (pdfResponse.status === 401) {
          console.log('⚠️  PDF Services API returned 401 - may need different scopes');
        } else {
          console.log('✅ PDF Services API responded successfully');
        }
      } catch (pdfError) {
        console.log(`⚠️  PDF Services test: ${pdfError.message}`);
      }

      console.log('\n🎉 Authentication Test PASSED!');
      console.log('✅ Your Adobe credentials work correctly');
      console.log('✅ You can proceed with real PDF generation');
      
      console.log('\n📝 Next Steps:');
      console.log('1. Update your authentication modules to use client credentials flow');
      console.log('2. Test PDF generation: npm run adobe:example-basic');
      console.log('3. Run full tests: npm run adobe:test-real');
      
      return true;
      
    } else {
      const errorText = await response.text();
      console.log('❌ Authentication failed');
      console.log(`📄 Status: ${response.status}`);
      console.log(`📄 Error: ${errorText}`);
      return false;
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

testAuth()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
