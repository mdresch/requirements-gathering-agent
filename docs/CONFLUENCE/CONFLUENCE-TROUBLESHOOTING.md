# 🔍 Confluence Connection Troubleshooting

## OAuth 2.0 Authentication Issues

### "We're having trouble logging you in" Error

This error occurs during OAuth 2.0 authentication setup. Here are the most common causes and solutions:

#### 1. **Redirect URI Mismatch**
**Problem:** The redirect URI in your Atlassian OAuth app doesn't match the configured callback URL.

**Solution:**
1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console)
2. Select your OAuth 2.0 (3LO) app
3. Go to Authorization tab
4. Set Callback URL to: `http://localhost:3000/callback` (exact match required)
5. Save changes

#### 2. **OAuth App Configuration Issues**
**Required Settings:**
- **App type:** OAuth 2.0 (3LO)
- **Callback URL:** `http://localhost:3000/callback`
- **Required Scopes:**
  - `read:content:confluence`
  - `write:content:confluence`
  - `read:user:confluence`
  - `read:space:confluence`

#### 3. **Environment Variables Issues**
**Required OAuth2 Environment Variables:**
```env
CONFLUENCE_CLIENT_ID=your-client-id-here
CONFLUENCE_CLIENT_SECRET=your-client-secret-here
CONFLUENCE_OAUTH2_REDIRECT_URI=http://localhost:3000/callback
CONFLUENCE_OAUTH2_SCOPES=read:content:confluence,write:content:confluence,read:user:confluence,read:space:confluence
CONFLUENCE_SPACE_KEY=YOUR-SPACE-KEY
```

#### 4. **Port/Network Issues**
- Ensure port 3000 is available
- Check firewall settings
- Try incognito/private browser mode
- Clear Atlassian cookies

### OAuth2 Testing Commands
```bash
# Check OAuth2 configuration
npm run confluence:status

# Start OAuth2 login flow
npm run confluence:oauth:login

# Test connection after authentication
npm run confluence:test
```

---

## API Token Authentication Issues

## Current Status Analysis

**Issue:** "Current user not permitted to use Confluence" error persists even with updated API token scopes.

**Your Configuration:**
- ✅ **API Token:** Updated with new scopes
- ✅ **Base URL:** `https://cba-adpa.atlassian.net`
- ✅ **Email:** `menno@cbadmin.onmicrosoft.com`
- ❌ **Space Key:** Still empty (but this isn't causing the current error)

## 🚨 Root Cause Analysis

The error "Current user not permitted to use Confluence" indicates one of these issues:

### 1. **Confluence License Issue**
- Your account `menno@cbadmin.onmicrosoft.com` doesn't have a Confluence license
- The Atlassian organization doesn't have Confluence enabled
- You're trying to access a Confluence Cloud instance that doesn't exist

### 2. **Account Access Issue**
- The email in your API token doesn't match the account trying to access Confluence
- Account is suspended or disabled
- Account exists but isn't added to the Confluence instance

### 3. **Organization Configuration Issue**
- API access is disabled by organization admin
- Confluence is not enabled for this Atlassian instance
- Wrong base URL (instance doesn't exist or isn't accessible)

## 🔧 Diagnostic Steps

### Step 1: Verify Confluence Instance Access
Try to access your Confluence instance directly:
1. Open browser and go to: `https://cba-adpa.atlassian.net/wiki`
2. Try to log in with `menno@cbadmin.onmicrosoft.com`
3. **Result:**
   - ✅ If you can access Confluence → API token/scope issue
   - ❌ If you get "access denied" → License/permission issue
   - ❌ If site doesn't exist → Wrong URL

### Step 2: Check API Token Scopes
Your new token should have these scopes:
- `read:confluence-content.all`
- `write:confluence-content` 
- `read:confluence-space.summary`
- `read:confluence-user`

### Step 3: Verify Account Details
Confirm:
- Email used to create API token: `menno@cbadmin.onmicrosoft.com`
- Confluence instance: `https://cba-adpa.atlassian.net`
- Account has Confluence access (not just Jira)

## 🎯 Next Steps

### Option A: If Confluence Instance Exists and You Have Access
1. **Add space key** to your `.env` file
2. **Test again** with a specific space
3. **Try direct API call** to confirm connectivity

### Option B: If No Confluence Access
1. **Contact admin** of `cba-adpa.atlassian.net`
2. **Request Confluence license** for your account
3. **Verify account permissions**

### Option C: If Wrong Instance
1. **Find correct Confluence URL** 
2. **Update `CONFLUENCE_BASE_URL`** in `.env`
3. **Test with correct instance**

## 🧪 Quick Test Commands

Let's try some diagnostic commands:

```bash
# Check current status
npm run confluence:status

# Test with verbose output (if available)
node dist/cli.js confluence test --verbose

# Check configuration
cat .env | grep CONFLUENCE
```

## 💡 Immediate Action Required

**Can you confirm:**
1. Can you access `https://cba-adpa.atlassian.net/wiki` in your browser?
2. What happens when you try to log in there?
3. Do you see any Confluence spaces when logged in?

**If you can access Confluence through the browser but API fails, we have a scope/token issue.**
**If you cannot access Confluence through the browser, we have a license/permission issue.**

This will help us determine the exact solution needed!
