# Microsoft Entra ID Configuration Guide for ADPA

## Overview

This guide provides step-by-step instructions for configuring Microsoft Entra ID (formerly Azure Active Directory) to support authentication for the Automated Document Processing and Analysis (ADPA) system. This configuration enables enterprise-grade security with centralized identity management and secure AI provider access.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Application Registration](#application-registration)
3. [API Permissions Configuration](#api-permissions-configuration)
4. [Authentication Configuration](#authentication-configuration)
5. [Managed Identity Setup](#managed-identity-setup)
6. [Security Configuration](#security-configuration)
7. [Testing and Validation](#testing-and-validation)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Access
- **Global Administrator** or **Application Administrator** role in Entra ID
- **Subscription Owner** or **Contributor** role in Azure subscription
- Access to Azure portal (https://portal.azure.com)

### Required Information
- Azure subscription ID
- Tenant ID (Directory ID)
- Domain name for the organization
- Redirect URIs for the application

### Tools and Software
- Azure CLI (optional, for automation)
- PowerShell with Azure modules (optional)
- Web browser with access to Azure portal

## Application Registration

### Step 1: Create New Application Registration

1. **Navigate to Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with administrator credentials

2. **Access Entra ID**
   - Search for "Microsoft Entra ID" in the search bar
   - Select "Microsoft Entra ID" from the results

3. **Create Application Registration**
   - In the left navigation, select "App registrations"
   - Click "New registration"
   - Fill in the application details:

```json
{
  "name": "ADPA Authentication Service",
  "supportedAccountTypes": "AzureADMyOrg",
  "redirectUri": {
    "type": "Web",
    "uri": "https://your-domain.com/auth/callback"
  }
}
```

4. **Configure Application Details**
   - **Name**: `ADPA Authentication Service`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: 
     - Type: `Web`
     - URI: `https://your-adpa-domain.com/auth/callback`

5. **Complete Registration**
   - Click "Register"
   - Note the **Application (client) ID** and **Directory (tenant) ID**

### Step 2: Configure Application Settings

#### Basic Information
```json
{
  "applicationId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "displayName": "ADPA Authentication Service",
  "publisherDomain": "your-organization.com",
  "signInAudience": "AzureADMyOrg",
  "web": {
    "redirectUris": [
      "https://your-adpa-domain.com/auth/callback",
      "https://localhost:3001/auth/callback"
    ],
    "logoutUrl": "https://your-adpa-domain.com/auth/logout"
  }
}
```

#### Application ID URI
1. Go to "Expose an API" in the left navigation
2. Click "Set" next to Application ID URI
3. Use the default or set custom URI: `api://adpa-authentication-service`

## API Permissions Configuration

### Step 1: Microsoft Graph Permissions

1. **Navigate to API Permissions**
   - In your app registration, select "API permissions"
   - Click "Add a permission"

2. **Add Microsoft Graph Permissions**
   - Select "Microsoft Graph"
   - Choose "Delegated permissions"
   - Add the following permissions:

```json
{
  "delegatedPermissions": [
    {
      "id": "e1fe6dd8-ba31-4d61-89e7-88639da4683d",
      "value": "User.Read",
      "displayName": "Sign in and read user profile"
    },
    {
      "id": "b340eb25-3456-403f-be2f-af7a0d370277",
      "value": "User.ReadBasic.All",
      "displayName": "Read all users' basic profiles"
    },
    {
      "id": "5f8c59db-677d-491f-a6b8-5f174b11ec1d",
      "value": "Group.Read.All",
      "displayName": "Read all groups"
    }
  ]
}
```

3. **Add Application Permissions** (for service-to-service calls)
   - Select "Application permissions"
   - Add the following permissions:

```json
{
  "applicationPermissions": [
    {
      "id": "df021288-bdef-4463-88db-98f22de89214",
      "value": "User.Read.All",
      "displayName": "Read all users' full profiles"
    },
    {
      "id": "5b567255-7703-4780-807c-7be8301ae99b",
      "value": "Group.Read.All",
      "displayName": "Read all groups"
    }
  ]
}
```

### Step 2: Azure Cognitive Services Permissions

1. **Add Azure Cognitive Services Permission**
   - Click "Add a permission"
   - Select "APIs my organization uses"
   - Search for "Azure Cognitive Services"
   - Select "Delegated permissions"
   - Add: `https://cognitiveservices.azure.com/user_impersonation`

### Step 3: Grant Admin Consent

1. **Grant Consent**
   - Click "Grant admin consent for [Your Organization]"
   - Confirm the consent
   - Verify all permissions show "Granted for [Your Organization]"

## Authentication Configuration

### Step 1: Configure Authentication Methods

1. **Navigate to Authentication**
   - In your app registration, select "Authentication"

2. **Configure Platform Settings**
   - Click "Add a platform"
   - Select "Web"
   - Configure the following:

```json
{
  "redirectUris": [
    "https://your-adpa-domain.com/auth/callback",
    "https://localhost:3001/auth/callback"
  ],
  "frontChannelLogoutUrl": "https://your-adpa-domain.com/auth/logout",
  "implicitGrantSettings": {
    "enableAccessTokenIssuance": false,
    "enableIdTokenIssuance": true
  }
}
```

3. **Configure Advanced Settings**
   - **Allow public client flows**: No
   - **Supported account types**: Single tenant
   - **Treat application as a public client**: No

### Step 2: Create Client Secret

1. **Navigate to Certificates & Secrets**
   - Select "Certificates & secrets"
   - Click "New client secret"

2. **Configure Secret**
   - **Description**: `ADPA Production Secret`
   - **Expires**: `24 months` (recommended)
   - Click "Add"

3. **Store Secret Securely**
   - Copy the secret value immediately
   - Store in Azure Key Vault or secure configuration management
   - Never store in source code

```bash
# Example: Store in Azure Key Vault
az keyvault secret set \
  --vault-name "adpa-keyvault" \
  --name "azure-client-secret" \
  --value "your-client-secret-value"
```

### Step 3: Configure Token Configuration

1. **Navigate to Token Configuration**
   - Select "Token configuration"
   - Click "Add optional claim"

2. **Configure ID Token Claims**
   - Token type: `ID`
   - Add claims:
     - `email`
     - `family_name`
     - `given_name`
     - `preferred_username`

3. **Configure Access Token Claims**
   - Token type: `Access`
   - Add claims:
     - `email`
     - `groups`

## Managed Identity Setup

### Step 1: Create Managed Identity for Azure OpenAI

1. **Create User-Assigned Managed Identity**
```bash
# Using Azure CLI
az identity create \
  --name "adpa-openai-identity" \
  --resource-group "adpa-resources" \
  --location "East US"
```

2. **Get Identity Details**
```bash
# Get the principal ID and client ID
az identity show \
  --name "adpa-openai-identity" \
  --resource-group "adpa-resources" \
  --query '{principalId:principalId, clientId:clientId}'
```

### Step 2: Assign Permissions to Managed Identity

1. **Assign Cognitive Services User Role**
```bash
# Assign role to the managed identity
az role assignment create \
  --assignee-object-id "managed-identity-principal-id" \
  --role "Cognitive Services User" \
  --scope "/subscriptions/your-subscription-id/resourceGroups/adpa-resources/providers/Microsoft.CognitiveServices/accounts/your-openai-resource"
```

2. **Verify Role Assignment**
```bash
# List role assignments
az role assignment list \
  --assignee "managed-identity-principal-id" \
  --output table
```

### Step 3: Configure Application to Use Managed Identity

1. **Update Application Configuration**
```typescript
// Environment configuration
const config = {
  azure: {
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    managedIdentityClientId: process.env.AZURE_MANAGED_IDENTITY_CLIENT_ID,
    openai: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION
    }
  }
};
```

## Security Configuration

### Step 1: Configure Conditional Access Policies

1. **Create Conditional Access Policy**
   - Navigate to "Security" > "Conditional Access"
   - Click "New policy"
   - Configure the following:

```json
{
  "displayName": "ADPA Application Access Policy",
  "state": "enabled",
  "conditions": {
    "applications": {
      "includeApplications": ["your-adpa-app-id"]
    },
    "users": {
      "includeGroups": ["ADPA-Users-Group-ID"]
    },
    "locations": {
      "includeLocations": ["trusted-locations"]
    }
  },
  "grantControls": {
    "operator": "AND",
    "builtInControls": [
      "mfa",
      "compliantDevice"
    ]
  }
}
```

### Step 2: Configure Multi-Factor Authentication

1. **Enable MFA for ADPA Users**
   - Navigate to "Security" > "MFA"
   - Configure MFA settings for the ADPA user group

2. **Configure MFA Methods**
   - Enable: Phone call, Text message, Mobile app
   - Set default method: Mobile app
   - Configure backup methods

### Step 3: Configure Security Defaults

1. **Review Security Defaults**
   - Navigate to "Properties" > "Manage Security defaults"
   - Ensure security defaults are enabled or configure custom policies

2. **Configure Risk Policies**
   - Navigate to "Security" > "Identity Protection"
   - Configure user risk policy
   - Configure sign-in risk policy

## Testing and Validation

### Step 1: Test Authentication Flow

1. **Test OAuth2 Authorization Code Flow**
```bash
# Test authorization endpoint
curl -X GET "https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize?client_id={client-id}&response_type=code&redirect_uri={redirect-uri}&scope=openid%20profile%20email"
```

2. **Test Token Endpoint**
```bash
# Exchange authorization code for tokens
curl -X POST "https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id={client-id}&client_secret={client-secret}&code={authorization-code}&grant_type=authorization_code&redirect_uri={redirect-uri}"
```

### Step 2: Test Microsoft Graph Access

1. **Test User Profile Access**
```bash
# Get user profile using access token
curl -X GET "https://graph.microsoft.com/v1.0/me" \
  -H "Authorization: Bearer {access-token}"
```

2. **Test Group Membership**
```bash
# Get user's group memberships
curl -X GET "https://graph.microsoft.com/v1.0/me/memberOf" \
  -H "Authorization: Bearer {access-token}"
```

### Step 3: Test Managed Identity

1. **Test Azure OpenAI Access**
```typescript
// Test managed identity authentication
import { DefaultAzureCredential } from '@azure/identity';
import { OpenAIClient } from '@azure/openai';

const credential = new DefaultAzureCredential({
  managedIdentityClientId: process.env.AZURE_MANAGED_IDENTITY_CLIENT_ID
});

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  credential
);

// Test API call
const result = await client.getChatCompletions(
  process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  [{ role: 'user', content: 'Hello, world!' }]
);
```

### Step 4: Validation Checklist

- [ ] Application registration created successfully
- [ ] Required API permissions granted and consented
- [ ] Client secret created and stored securely
- [ ] Managed identity created and assigned appropriate roles
- [ ] Authentication flow works end-to-end
- [ ] Microsoft Graph API calls succeed
- [ ] Azure OpenAI access works with managed identity
- [ ] Conditional access policies applied correctly
- [ ] MFA configured and working
- [ ] Security monitoring enabled

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application"

**Solution:**
1. Verify redirect URI in application registration matches exactly
2. Check for trailing slashes and case sensitivity
3. Ensure protocol (http/https) matches

#### Issue 2: "AADSTS65001: The user or administrator has not consented to use the application"

**Solution:**
1. Grant admin consent for required permissions
2. Ensure user has appropriate permissions
3. Check conditional access policies

#### Issue 3: "AADSTS70011: The provided value for the input parameter 'scope' is not valid"

**Solution:**
1. Verify scope format: `https://graph.microsoft.com/.default`
2. Check API permissions are properly configured
3. Ensure scopes match granted permissions

#### Issue 4: Managed Identity Authentication Fails

**Solution:**
1. Verify managed identity is assigned to the resource
2. Check role assignments for the managed identity
3. Ensure correct client ID is used for user-assigned identity

#### Issue 5: Token Validation Fails

**Solution:**
1. Check token expiration
2. Verify issuer and audience claims
3. Ensure correct signing keys are used

### Diagnostic Commands

#### Check Application Registration
```bash
# Get application details
az ad app show --id {application-id}

# List API permissions
az ad app permission list --id {application-id}
```

#### Check Managed Identity
```bash
# Get managed identity details
az identity show --name {identity-name} --resource-group {resource-group}

# List role assignments
az role assignment list --assignee {principal-id}
```

#### Check Token Details
```bash
# Decode JWT token (using jwt.io or similar tool)
echo "{jwt-token}" | base64 -d
```

### Support Resources

- **Microsoft Entra ID Documentation**: https://docs.microsoft.com/azure/active-directory/
- **Microsoft Graph Documentation**: https://docs.microsoft.com/graph/
- **Azure Identity SDK**: https://docs.microsoft.com/azure/developer/javascript/sdk/authentication/
- **MSAL Documentation**: https://docs.microsoft.com/azure/active-directory/develop/msal-overview

## Security Best Practices

### Application Security
1. **Use certificate-based authentication** instead of client secrets when possible
2. **Rotate client secrets regularly** (every 6-12 months)
3. **Store secrets in Azure Key Vault** or secure configuration management
4. **Use least privilege principle** for API permissions
5. **Enable audit logging** for all authentication events

### Network Security
1. **Use HTTPS only** for all authentication endpoints
2. **Implement proper CORS policies**
3. **Use trusted certificate authorities**
4. **Configure proper firewall rules**

### Monitoring and Alerting
1. **Monitor failed authentication attempts**
2. **Set up alerts for unusual access patterns**
3. **Log all authentication and authorization events**
4. **Implement automated incident response**

## Conclusion

This configuration guide provides the foundation for implementing enterprise-grade authentication using Microsoft Entra ID. Following these steps ensures secure, scalable, and compliant authentication for the ADPA system.

Regular review and updates of the configuration are essential to maintain security and compliance with evolving requirements and best practices.