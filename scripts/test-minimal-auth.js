#!/usr/bin/env node

/**
 * Minimal Adobe Authentication Test
 */

console.log('🔐 Minimal Adobe Auth Test');

// Test environment variables
// Use environment variables for credentials  
const clientId = process.env.ADOBE_CLIENT_ID;
const clientSecret = process.env.ADOBE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.log('❌ Error: Adobe credentials not configured');
  console.log('Please set ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET environment variables');
  process.exit(1);
}

console.log('✅ Client ID:', clientId.substring(0, 8) + '...');
console.log('✅ Client Secret:', clientSecret.substring(0, 8) + '...');

// Test URL formation
const url = 'https://ims-na1.adobelogin.com/ims/token/v3';
const params = new URLSearchParams({
  grant_type: 'client_credentials',
  client_id: clientId,
  client_secret: clientSecret,
  scope: 'openid,AdobeID,DCAPI'
});

console.log('🌐 URL:', url);
console.log('📝 Params:', params.toString());

// Test fetch
try {
  console.log('\n🚀 Making request...');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  console.log('📊 Response status:', response.status);
  console.log('📊 Response OK:', response.ok);

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Success! Token received');
    console.log('📏 Token length:', data.access_token?.length || 'undefined');
    console.log('⏰ Expires in:', data.expires_in, 'seconds');
  } else {
    const errorText = await response.text();
    console.log('❌ Error response:', errorText);
  }

} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('📋 Error details:', error);
}
