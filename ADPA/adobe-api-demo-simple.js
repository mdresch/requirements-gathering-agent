/**
 * Adobe Creative Cloud API Live Demo
 * This demonstrates real Adobe API calls using your credentials
 */

console.log("🎨 Adobe Creative Cloud API Demo Starting...");

/**
 * Main demonstration function
 */
async function runAdobeDemo() {
  // Your Adobe credentials (get from https://developer.adobe.com/console)
  const credentials = {
    clientId: "your_adobe_client_id_here",
    clientSecret: "your_adobe_client_secret_here", 
    organizationId: "your_adobe_organization_id_here"
  };

  console.log("Step 1: 🔐 Adobe Authentication");
  const accessToken = await authenticateWithAdobe(credentials);
  
  if (accessToken) {
    console.log("Step 2: 🎯 Testing Adobe InDesign API");
    await testInDesignAPI(accessToken, credentials);
    
    console.log("Step 3: 📄 Testing Adobe PDF Services");
    await testPDFServices(accessToken, credentials);
  }
}

/**
 * Adobe IMS Authentication
 */
async function authenticateWithAdobe(credentials) {
  try {
    console.log("  📡 Calling Adobe IMS Token Service...");
    
    const response = await fetch("https://ims-na1.adobelogin.com/ims/token/v3", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        scope: "creative_sdk,AdobeID,openid"
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("  ✅ Authentication successful!");
      console.log(`  🎫 Token: ${data.access_token.substring(0, 20)}...`);
      return data.access_token;
    } else {
      console.log("  ❌ Authentication failed:", data.error_description || data.error);
      return null;
    }
  } catch (error) {
    console.log("  ❌ Network error:", error.message);
    return null;
  }
}

/**
 * Test Adobe InDesign API
 */
async function testInDesignAPI(accessToken, credentials) {
  try {
    console.log("  📡 Calling Adobe InDesign Creative SDK...");
    
    const documentData = {
      name: "ADPA-Demo-Document",
      size: "A4", 
      orientation: "portrait",
      content: {
        title: "ADPA Professional Document",
        body: "Created with Adobe Creative Cloud APIs"
      }
    };

    const response = await fetch("https://indesign-api.adobe.io/v1/documents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-api-key": credentials.clientId,
        "x-gw-ims-org-id": credentials.organizationId
      },
      body: JSON.stringify(documentData)
    });

    console.log(`  📊 Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log("  ✅ InDesign API working!");
      console.log("  📄 Document created:", result);
    } else {
      const error = await response.text();
      console.log("  ℹ️ InDesign API response:", error);
      console.log("  💡 Note: InDesign API requires special permissions");
    }
    
  } catch (error) {
    console.log("  ⚠️ InDesign API test error:", error.message);
  }
}

/**
 * Test Adobe PDF Services
 */
async function testPDFServices(accessToken, credentials) {
  try {
    console.log("  📡 Calling Adobe PDF Services...");
    
    const response = await fetch("https://pdf-services.adobe.io/operation/createpdf", {
      method: "POST", 
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-api-key": credentials.clientId
      },
      body: JSON.stringify({
        inputDocumentAssetID: "test-doc",
        outputFormat: "pdf"
      })
    });

    console.log(`  📊 Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log("  ✅ PDF Services API working!");
      console.log("  📄 Result:", result);
    } else {
      console.log("  ℹ️ PDF Services requires file upload setup");
    }
    
  } catch (error) {
    console.log("  ⚠️ PDF Services test error:", error.message);
  }
}

// Instructions for running
console.log(`
📋 To run this demo:

1. Update credentials above with your Adobe values
2. Run: node adobe-api-demo-simple.js
3. Watch the console for API responses

🔗 Get credentials: https://developer.adobe.com/console
`);

// Auto-run if executed directly
if (typeof require !== "undefined" && require.main === module) {
  runAdobeDemo().catch(console.error);
}
