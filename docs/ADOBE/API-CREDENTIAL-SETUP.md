# Adobe Creative Suite API Credential Setup Guide

## Overview

This guide provides step-by-step instructions for setting up Adobe Creative Cloud API credentials required for Phase 2 of the integration. These credentials will enable access to Adobe InDesign Server, Illustrator, Photoshop, and Document Generation APIs.

## Prerequisites

- Adobe Developer account with admin access
- Adobe Creative Cloud Enterprise or Team subscription
- Access to Adobe Developer Console (https://console.adobe.io/)
- Permission to create API credentials for your organization

## Step 1: Adobe Developer Console Setup

1. Log in to the [Adobe Developer Console](https://console.adobe.io/)
2. Select your organization from the dropdown in the top-right corner
3. Click "Create new project" or select an existing project
4. Name your project "Requirements Gathering Agent - Creative Suite"
5. Click "Add API" to add APIs to your project

## Step 2: Add Required APIs

For each of the following APIs, follow these steps:

### Adobe InDesign Server API

1. Search for "InDesign Server API" in the API catalog
2. Click "Add to Project"
3. Select "OAuth 2.0 Server-to-Server" authentication
4. Generate a keypair or upload your own public key
5. Save the private key securely
6. Select the required scopes:
   - `indesign_server.documents.read`
   - `indesign_server.documents.write`
   - `indesign_server.templates.read`
   - `indesign_server.templates.write`
7. Click "Save configured API"

### Adobe Illustrator API

1. Search for "Illustrator API" in the API catalog
2. Click "Add to Project"
3. Select "OAuth 2.0 Server-to-Server" authentication
4. Use the same keypair generated for InDesign Server
5. Select the required scopes:
   - `illustrator.documents.read`
   - `illustrator.documents.write`
   - `illustrator.templates.read`
   - `illustrator.templates.write`
6. Click "Save configured API"

### Adobe Photoshop API

1. Search for "Photoshop API" in the API catalog
2. Click "Add to Project"
3. Select "OAuth 2.0 Server-to-Server" authentication
4. Use the same keypair generated for InDesign Server
5. Select the required scopes:
   - `photoshop.documents.read`
   - `photoshop.documents.write`
   - `photoshop.templates.read`
   - `photoshop.templates.write`
6. Click "Save configured API"

### Adobe Document Generation API

1. Search for "Document Generation API" in the API catalog
2. Click "Add to Project"
3. Select "OAuth 2.0 Server-to-Server" authentication
4. Use the same keypair generated for InDesign Server
5. Select the required scopes:
   - `docgen.documents.read`
   - `docgen.documents.write`
   - `docgen.templates.read`
   - `docgen.templates.write`
6. Click "Save configured API"

## Step 3: Collect API Credentials

After adding all APIs, collect the following information from the Developer Console:

1. **Client ID**: Found in the Project Overview
2. **Client Secret**: Found in the Project Overview
3. **Organization ID**: Found in the Project Overview
4. **Technical Account ID**: Found in the Service Account (JWT) section
5. **Private Key**: The private key file you downloaded or uploaded

## Step 4: Configure Environment Variables

Create a `.env.adobe.creative` file in the project root with your credentials. An example template file is provided at `env.adobe.creative.example` that you can copy and modify:

```bash
# Copy the example configuration
cp env.adobe.creative.example .env.adobe.creative

# Edit the file to add your credentials
nano .env.adobe.creative  # or use your preferred editor
```

At minimum, you need to add the following variables with values from the Developer Console:

```
ADOBE_CLIENT_ID=your_client_id
ADOBE_CLIENT_SECRET=your_client_secret
ADOBE_ORGANIZATION_ID=your_organization_id
ADOBE_ACCOUNT_ID=your_technical_account_id
ADOBE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key content here\n-----END PRIVATE KEY-----"

ADOBE_INDESIGN_API_URL=https://indesign-api.adobe.io/v2
ADOBE_ILLUSTRATOR_API_URL=https://illustrator-api.adobe.io/v2
ADOBE_PHOTOSHOP_API_URL=https://photoshop-api.adobe.io/v2
ADOBE_DOCUMENT_GENERATION_API_URL=https://docgen-api.adobe.io/v2

ADOBE_ENVIRONMENT=sandbox
ADOBE_TIMEOUT_MS=30000
ADOBE_RETRY_ATTEMPTS=3
ADOBE_RATE_LIMIT=10
```

## Step 5: Validate API Access

Run the dedicated API credential validation script to ensure your credentials are working correctly:

```bash
npm run adobe:validate-creative-credentials
```

The validation script performs the following checks:
1. Configuration validation - verifies that all required configuration files exist
2. Credential validation - checks that API credentials are properly configured
3. Authentication test - attempts to authenticate with Adobe services
4. API connectivity test - tests connectivity to all required API endpoints

You should see output confirming successful validation of all checks:

```
===== Validation Summary =====
✓ Configuration: Passed
✓ Credentials: Passed
✓ Authentication: Passed
✓ API Connectivity: Passed

===== All Validations Passed =====
✓ Your Adobe Creative Suite API credentials are correctly configured and working!

ℹ Next Steps:
  1. Run template test: npm run adobe:phase2:templates
  2. Run capability check: npm run adobe:phase2:capabilities
  3. Run demo: npm run adobe:phase2:demo
```

> **Note:** If any validation step fails, the script provides detailed error messages and troubleshooting tips to help you resolve the issues.

## Step 6: Secure Your Credentials

1. Add `.env.adobe.creative` to your `.gitignore` file
2. Set up secure credential storage in your CI/CD pipeline
3. Consider using a secrets management service for production

## Troubleshooting

### Common Issues:

1. **Authentication Failed**: 
   - Ensure your private key matches the public key uploaded to Adobe Developer Console
   - Verify that your Client ID and Client Secret are correct
   - Check that your organization ID matches your Adobe organization
   - Confirm your account has permission to use the requested APIs

2. **Missing Scopes**: 
   - Check that all required scopes are enabled for each API in the Developer Console
   - Common required scopes include:
     - `indesign_server.documents.read/write`
     - `illustrator.documents.read/write`
     - `photoshop.documents.read/write`
     - `docgen.documents.read/write`

3. **Rate Limiting**: 
   - If you encounter rate limiting errors, adjust the `ADOBE_RATE_LIMIT` variable
   - Consider implementing exponential backoff in your code
   - Monitor your API usage in the Adobe Developer Console

4. **API Unavailable**: 
   - Some APIs may require additional entitlements for your Adobe subscription
   - Contact your Adobe account manager to ensure all needed services are enabled
   - Verify that the API endpoints in your configuration are correct

5. **Certificate or Key Problems**:
   - Ensure your private key is in the correct format with proper line breaks
   - Check for any extra whitespace in your key that might cause parsing errors
   - If using a certificate file, verify it's properly formatted and accessible

6. **Environment Configuration**:
   - Verify your `.env.adobe.creative` file has been created and populated correctly
   - Make sure the file is in the correct location (project root)
   - Check that environment variables are being properly loaded

### Diagnostic Tools:

For more detailed diagnostics, run these specialized validation scripts:

```bash
# Test API connectivity only
npm run adobe:test-api-connectivity

# Check configuration only
npm run adobe:validate-creative-config

# Run the comprehensive validation script
npm run adobe:validate-creative-credentials
```

### Getting Help:

- Adobe Developer Support: https://developer.adobe.com/support
- Adobe Developer Forums: https://community.adobe.com/t5/developer-discussions/bd-p/developer-discussions
- Adobe API Status Page: https://status.adobe.com/
- Project Issues: Open a ticket in the project issue tracker

## Next Steps

Once your API credentials are set up:

1. Run the full validation suite: `npm run adobe:phase2:capabilities`
2. Test template access: `npm run adobe:phase2:templates`
3. Run a simple conversion: `npm run adobe:phase2:demo`
