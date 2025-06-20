# OAuth 2.0 App Setup Guide
## Complete Guide to Setting up Atlassian OAuth 2.0 App for Confluence Integration

### Prerequisites
- Atlassian account with access to Confluence Cloud
- Access to [Atlassian Developer Console](https://developer.atlassian.com/console)
- Administrative permissions on your Confluence site

---

## Step 1: Create OAuth 2.0 App in Atlassian Developer Console

### 1.1 Access Developer Console
1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console)
2. Log in with your Atlassian account
3. Click **"Create"** → **"OAuth 2.0 (3LO)"**

### 1.2 Configure Basic App Settings
1. **App name**: `ADPA Confluence Integration` (or your preferred name)
2. **App description**: `Requirements Gathering Agent - Document Publishing to Confluence`
3. **App URL**: `https://github.com/your-username/requirements-gathering-agent` (optional)
4. **Privacy policy URL**: Leave blank for development
5. Click **"Create"**

### 1.3 Configure OAuth 2.0 (3LO) Settings
1. In your app dashboard, click **"OAuth 2.0 (3LO)"** tab
2. **Callback URL**: Add `http://localhost:3000/callback`
   - ⚠️ **CRITICAL**: This must match exactly (no trailing slash, correct port)
3. Click **"Save changes"**

### 1.4 Configure Permissions (Scopes)
1. Go to **"Permissions"** tab
2. Click **"Add APIs"**
3. Select **"Confluence API"**
4. Add the following scopes:
   - ✅ `read:content:confluence` - View detailed contents
   - ✅ `write:content:confluence` - Create and update contents
   - ✅ `read:user:confluence` - View user details
   - ✅ `read:space:confluence` - View spaces
5. Click **"Save changes"**

### 1.5 Get Client Credentials
1. Go to **"Settings"** tab
2. Copy the **Client ID** (starts with letters/numbers)
3. Copy the **Secret** (long alphanumeric string)
4. Store these securely - you'll need them for the `.env` file

---

## Step 2: Configure Environment Variables

Update your `.env` file with the OAuth 2.0 credentials:

```bash
# OAuth 2.0 Configuration
CONFLUENCE_CLIENT_ID=your_client_id_here
CONFLUENCE_CLIENT_SECRET=your_client_secret_here
CONFLUENCE_OAUTH2_REDIRECT_URI=http://localhost:3000/callback
CONFLUENCE_OAUTH2_SCOPES=read:content:confluence,write:content:confluence,read:user:confluence,read:space:confluence

# Confluence Configuration
CONFLUENCE_SPACE_KEY=YOUR_SPACE_KEY
```

---

## Step 3: Test OAuth 2.0 Configuration

### 3.1 Debug Configuration
```bash
npm run confluence:oauth2:debug
```

This will validate your setup and show any configuration issues.

### 3.2 Start OAuth 2.0 Login Flow
```bash
npm run confluence:oauth2:login
```

This will:
1. Generate an authorization URL
2. Open your browser automatically
3. Start a local callback server
4. Complete the token exchange

---

## Common Issues and Solutions

### Issue: "We're having trouble logging you in"

**Possible Causes & Solutions:**

#### 1. Redirect URI Mismatch
- **Check**: OAuth app callback URL is exactly `http://localhost:3000/callback`
- **Fix**: Update in Atlassian Developer Console → Your App → OAuth 2.0 (3LO) → Callback URL

#### 2. Missing or Incorrect Permissions
- **Check**: All required scopes are added to your OAuth app
- **Fix**: Go to Permissions tab and ensure all Confluence API scopes are enabled

#### 3. App Not Installed on Confluence Site
- **Check**: OAuth app might need to be "installed" on your Confluence site
- **Fix**: In some cases, you may need to install the app via Atlassian Marketplace or admin settings

#### 4. Account/Site Issues
- **Check**: Multiple Atlassian accounts or sites
- **Fix**: Ensure you're using the correct account that has access to your Confluence site

#### 5. Development Mode Restrictions
- **Check**: OAuth app might be in development mode
- **Fix**: Add your email to authorized users in the app settings

### Issue: "Connection Refused" or "Callback Server Failed"

**Solutions:**
1. Ensure port 3000 is not in use by another application
2. Check firewall settings allowing localhost connections
3. Try a different port by updating `CONFLUENCE_OAUTH2_REDIRECT_URI`

### Issue: "Invalid Client" Error

**Solutions:**
1. Verify Client ID and Secret are correct
2. Check for extra spaces in environment variables
3. Ensure OAuth app is saved and active

---

## Step 4: Verify Integration

### 4.1 Check Authorization Status
```bash
npm run confluence:oauth2:status
```

### 4.2 Test Connection
```bash
npm run confluence:test
```

### 4.3 Publish Test Document
```bash
npm run confluence:publish ./generated-documents
```

---

## Security Best Practices

1. **Store Credentials Securely**
   - Never commit `.env` file to version control
   - Use secure credential storage in production

2. **Regular Token Refresh**
   - OAuth tokens expire and are automatically refreshed
   - Monitor token storage in `.confluence-oauth2-tokens.json`

3. **Minimize Permissions**
   - Only request scopes your application actually needs
   - Review permissions regularly

4. **Secure Callback URL**
   - In production, use HTTPS callback URLs
   - Validate state parameters to prevent CSRF attacks

---

## Production Deployment Considerations

When deploying to production:

1. **Update Callback URL**: Change to your production domain
2. **HTTPS Required**: Use secure callback URLs
3. **Token Storage**: Implement secure token storage (not local files)
4. **Rate Limiting**: Implement proper rate limiting for API calls
5. **Error Handling**: Add comprehensive error handling and logging

---

## Support Resources

- [Atlassian OAuth 2.0 (3LO) Documentation](https://developer.atlassian.com/cloud/confluence/oauth-2-3lo-apps/)
- [Confluence API Documentation](https://developer.atlassian.com/cloud/confluence/rest/v2/)
- [ADPA Confluence Integration Troubleshooting](./CONFLUENCE-TROUBLESHOOTING.md)

---

## Next Steps

After successful OAuth 2.0 setup:

1. **Test Document Publishing**: Use `npm run confluence:publish`
2. **Configure Space Settings**: Set up proper space and parent pages
3. **Customize Publishing Options**: Configure labels, templates, and organization
4. **Explore Advanced Features**: Set up automated publishing workflows

---

*Last Updated: June 18, 2025*
*ADPA Version: 2.1.3*
