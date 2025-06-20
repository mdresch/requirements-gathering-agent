# 🔐 OAuth 2.0 Configuration for ADPA Confluence Integration

## 📋 What You Need to Update in Your .env File

Since you have **OAuth 2.0 Client ID and Secret** from the Confluence Developer console, you need to replace the placeholder values with your actual credentials.

## 🔧 Step-by-Step Configuration

### **Step 1: Get Your OAuth 2.0 Credentials**

From your Confluence Developer console (https://developer.atlassian.com/console/myapps/), find your ADPA application and copy:

1. **Client ID** - Usually looks like: `ari:cloud:ecosystem::app/12345678-1234-1234-1234-123456789abc`
2. **Client Secret** - Usually looks like: `ATOAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **Step 2: Update Your .env File**

Replace these lines in your `.env` file:

```env
# REPLACE THESE WITH YOUR ACTUAL VALUES:
CONFLUENCE_CLIENT_ID=your_actual_client_id_from_developer_console
CONFLUENCE_CLIENT_SECRET=your_actual_client_secret_from_developer_console
```

**With your real values:**

```env
# EXAMPLE (use your actual values):
CONFLUENCE_CLIENT_ID=ari:cloud:ecosystem::app/12345678-1234-1234-1234-123456789abc
CONFLUENCE_CLIENT_SECRET=ATOAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Step 3: Verify Your Callback URL**

In your Confluence Developer console, make sure you have this callback URL configured:
```
http://localhost:3000/callback
```

## 🆚 **Difference Between API Token vs OAuth 2.0**

| Aspect | API Token (Old) | OAuth 2.0 (New) |
|--------|----------------|------------------|
| **Authentication** | Basic Auth with email + token | Bearer token after OAuth flow |
| **Setup** | Simple - just token | More complex - requires app registration |
| **Security** | User-level permissions | App-level permissions with user consent |
| **Future Support** | Being phased out | Preferred method |
| **Expiration** | Manual token management | Automatic token refresh |

## 🔄 **What We Need to Change**

Since you have OAuth 2.0 credentials, we need to:

1. ✅ **Update .env with your Client ID/Secret** (you do this)
2. 🔧 **Update ConfluencePublisher to use OAuth 2.0** (I'll do this)
3. 🌐 **Add OAuth flow handling** (I'll implement this)
4. 🧪 **Test the new authentication** (we'll do together)

## 📝 **Your Action Items**

### **Immediate (Now):**
1. Copy your **Client ID** from Developer console
2. Copy your **Client Secret** from Developer console  
3. Replace the placeholder values in your `.env` file

### **Example .env Update:**
```env
# Before (placeholder):
CONFLUENCE_CLIENT_ID=your_actual_client_id_from_developer_console
CONFLUENCE_CLIENT_SECRET=your_actual_client_secret_from_developer_console

# After (your real values):
CONFLUENCE_CLIENT_ID=ari:cloud:ecosystem::app/a1b2c3d4-e5f6-7890-abcd-ef1234567890
CONFLUENCE_CLIENT_SECRET=ATOA12345678901234567890abcdefghijklmnopqrstuvwxyz
```

## 🚀 **Next Steps After You Update .env**

Once you update your `.env` file with the real Client ID and Secret:

1. **Tell me** - So I can update the Confluence integration code
2. **I'll implement OAuth 2.0 flow** - Update ConfluencePublisher for OAuth
3. **We'll test together** - Verify the OAuth authentication works
4. **Start publishing** - Use the new OAuth-based integration

## 🔍 **How to Find Your Credentials**

1. Go to: https://developer.atlassian.com/console/myapps/
2. Find your **ADPA** application
3. Click on it to open details
4. Look for:
   - **Client ID** (in Settings or Overview)
   - **Client Secret** (in Settings, may need to regenerate)

## ⚠️ **Important Security Notes**

- ✅ **Never commit** Client Secret to version control
- ✅ **Keep .env** in your .gitignore  
- ✅ **Use different credentials** for dev/prod environments
- ✅ **Regenerate secrets** if compromised

---

**Ready?** Update your `.env` file with your real Client ID and Secret, then let me know so I can update the integration code to use OAuth 2.0!
