/**
 * Adobe Creative Cloud API Demonstration
 * Live test of InDesign API integration with real Adobe credentials
 */

/* global fetch, URLSearchParams, console */

/**
 * Demonstrate Adobe Creative Cloud Authentication
 */
async function demonstrateAdobeAuth() {
  console.log("🚀 Starting Adobe Creative Cloud API Demonstration...");
  
  // Step 1: Get credentials (replace with your actual credentials)
  const credentials = {
    clientId: "your_adobe_client_id_here", // Replace with your Client ID
    clientSecret: "your_adobe_client_secret_here", // Replace with your Client Secret
    organizationId: "your_adobe_organization_id_here", // Replace with your Org ID
  };

  if (credentials.clientId === "your_adobe_client_id_here") {
    console.log("❌ Please update the credentials in this demo file first!");
    console.log("📋 Get your credentials from: https://developer.adobe.com/console");
    return;
  }

  try {
    // Step 2: Adobe IMS Authentication
    console.log("🔐 Authenticating with Adobe Creative Cloud...");
    
    const imsTokenUrl = "https://ims-na1.adobelogin.com/ims/token/v3";
    
    const formData = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      scope: "creative_sdk,AdobeID,openid,read_organizations",
    });

    const authResponse = await fetch(imsTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error(`❌ Adobe authentication failed: ${authResponse.status}`);
      console.error(`Error details: ${errorText}`);
      return;
    }

    const tokenData = await authResponse.json();
    console.log("✅ Adobe authentication successful!");
    console.log(`📋 Access token obtained (${tokenData.access_token.substring(0, 20)}...)`);
    console.log(`⏰ Token expires in: ${tokenData.expires_in} seconds`);

    // Step 3: Test InDesign API call
    await demonstrateInDesignAPI(tokenData.access_token, credentials);

  } catch (error) {
    console.error("❌ Adobe API demonstration failed:", error);
  }
}

/**
 * Demonstrate InDesign API Integration
 */
async function demonstrateInDesignAPI(accessToken, credentials) {
  console.log("\n🎨 Testing Adobe InDesign API...");

  try {
    // Sample document structure for InDesign
    const documentRequest = {
      documentPreferences: {
        pageSize: "A4",
        orientation: "portrait",
        margins: {
          top: "1in",
          bottom: "1in",
          left: "1in",
          right: "1in"
        },
        colorProfile: "CMYK"
      },
      masterPages: [
        {
          name: "A-Master",
          elements: [
            {
              type: "textFrame",
              content: "ADPA Professional Document",
              style: {
                font: "Arial",
                size: "24pt",
                color: "#2E86AB",
                alignment: "center"
              },
              position: { x: "1in", y: "0.5in" },
              size: { width: "6.5in", height: "0.5in" }
            }
          ]
        }
      ],
      pages: [
        {
          pageNumber: 1,
          masterPage: "A-Master",
          elements: [
            {
              type: "textFrame",
              content: "Welcome to ADPA",
              style: {
                font: "Arial",
                size: "18pt",
                color: "#A23B72",
                weight: "bold"
              },
              position: { x: "1in", y: "1.5in" },
              size: { width: "6.5in", height: "0.3in" }
            },
            {
              type: "textFrame",
              content: "This document was generated using Adobe Creative Cloud APIs with professional ADPA branding and typography.",
              style: {
                font: "Times New Roman",
                size: "11pt",
                color: "#333333",
                lineHeight: "14pt"
              },
              position: { x: "1in", y: "2in" },
              size: { width: "6.5in", height: "2in" }
            }
          ]
        }
      ],
      outputSettings: {
        format: "pdf",
        quality: "print",
        colorSpace: "CMYK",
        embedFonts: true
      }
    };

    // Adobe Creative SDK InDesign API endpoint
    const indesignApiUrl = "https://indesign-api.adobe.io/v1/documents";

    console.log("📤 Sending document creation request to Adobe InDesign API...");

    const response = await fetch(indesignApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-api-key": credentials.clientId,
        "x-gw-ims-org-id": credentials.organizationId,
      },
      body: JSON.stringify(documentRequest),
    });

    console.log(`📋 InDesign API Response Status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ InDesign document creation successful!");
      console.log("📄 Document details:", {
        documentId: result.documentId || "Generated",
        status: result.status || "Processing",
        outputUrl: result.outputUrl ? result.outputUrl.substring(0, 50) + "..." : "Will be available when complete"
      });

      if (result.outputUrl) {
        console.log("📥 Attempting to download generated document...");
        
        const downloadResponse = await fetch(result.outputUrl, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (downloadResponse.ok) {
          const contentType = downloadResponse.headers.get("content-type");
          const contentLength = downloadResponse.headers.get("content-length");
          
          console.log("✅ Document download successful!");
          console.log(`📋 File type: ${contentType}`);
          console.log(`📏 File size: ${contentLength} bytes`);
          
          // Note: In a real implementation, you would save this to a file
          console.log("💾 Document ready for download!");
        } else {
          console.log("⏳ Document still processing, download URL not ready yet");
        }
      }

    } else {
      const errorText = await response.text();
      console.error(`❌ InDesign API call failed: ${response.status}`);
      console.error(`Error details: ${errorText}`);
      
      // This is expected if you don't have InDesign API access
      if (response.status === 403) {
        console.log("💡 Note: InDesign API requires additional permissions from Adobe");
        console.log("📋 For now, the integration falls back to enhanced mock functionality");
      }
    }

  } catch (error) {
    console.error("❌ InDesign API test failed:", error);
    console.log("💡 This might be expected if InDesign API access isn't configured");
  }
}

/**
 * Demonstrate Adobe PDF Services API (Alternative)
 */
async function demonstratePDFServicesAPI(accessToken, credentials) {
  console.log("\n📄 Testing Adobe PDF Services API...");

  try {
    // Adobe PDF Services API for document conversion
    const pdfServicesUrl = "https://pdf-services.adobe.io/operation/createpdf";
    
    const pdfRequest = {
      assetID: "sample-document",
      outputFormat: "pdf",
      params: {
        documentLanguage: "en-US",
        pageLayout: {
          pageSize: "A4"
        }
      }
    };

    console.log("📤 Sending PDF creation request...");

    const response = await fetch(pdfServicesUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-api-key": credentials.clientId,
      },
      body: JSON.stringify(pdfRequest),
    });

    console.log(`📋 PDF Services API Response Status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ PDF Services API call successful!");
      console.log("📄 Response:", result);
    } else {
      const errorText = await response.text();
      console.log(`ℹ️ PDF Services response: ${response.status}`);
      console.log("💡 This API requires additional setup and file uploads");
    }

  } catch (error) {
    console.error("❌ PDF Services API test failed:", error);
  }
}

// Export the demonstration function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { demonstrateAdobeAuth };
} else if (typeof window !== 'undefined') {
  window.demonstrateAdobeAuth = demonstrateAdobeAuth;
}

// Auto-run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  demonstrateAdobeAuth();
}

console.log("🎯 Adobe Creative Cloud API Demo Ready!");
console.log("📋 To run: call demonstrateAdobeAuth() after updating credentials");
console.log("🔗 Get credentials: https://developer.adobe.com/console");
