# 🔐 Atlassian Authentication Setup Guide

## 📋 **Step-by-Step Token Creation**

### **1. Personal API Token (For REST API)**
**URL**: https://id.atlassian.com/manage-profile/security/api-tokens

**Steps**:
1. Log in to your Atlassian account
2. Click "Create API token"
3. **Label**: "ADPA Confluence Integration"
4. **Copy token**: Save immediately (won't be shown again!)
5. **Format**: Usually looks like `ATATT3xFfGF0...` (starts with ATATT)

### **2. Verify Your Developer Account**
**URL**: https://developer.atlassian.com/

**Check**:
- Can you log in successfully?
- Do you see "Your apps" in the navigation?
- Is your email correct?

### **3. Test Your Credentials**

Once you have the token, test the Forge CLI login:

```bash
forge login
```

**Enter**:
- **Email**: Your Atlassian account email
- **Token**: The API token you just created

### **4. Confluence Instance Setup**

For testing, you'll also need:

**Development Site**: 
- URL: `https://your-site.atlassian.net`
- Admin access to create/modify pages
- Space key where you'll test (e.g., "TEST" or "DOCS")

### **5. Troubleshooting Common Issues**

#### **"Couldn't log you in" Error**:
- ✅ **Check email**: Must match your Atlassian account exactly
- ✅ **Verify token**: Copy/paste carefully, no extra spaces
- ✅ **Account type**: Must be Atlassian Cloud (not Server/Data Center)
- ✅ **Developer access**: Account must have developer permissions

#### **Token Format Issues**:
- ✅ **Starts with ATATT**: Personal API tokens begin with this prefix
- ✅ **Full length**: Don't truncate the token
- ✅ **No quotes**: Enter the token directly, no quotation marks

#### **Account Access Issues**:
- ✅ **Developer Console**: Can you access https://developer.atlassian.com/?
- ✅ **Organization**: Are you part of an Atlassian organization?
- ✅ **Permissions**: Do you have developer permissions in your org?

### **6. Alternative: Create New Developer Account**

If issues persist:
1. Visit https://developer.atlassian.com/
2. Sign up for a new developer account
3. Create a free development site
4. Generate new API token for the new account

### **7. Environment Variables (After Successful Login)**

Once logged in, you can set up environment variables:

```bash
# .env file for ADPA Confluence integration
CONFLUENCE_BASE_URL=https://your-site.atlassian.net
CONFLUENCE_USERNAME=your-email@domain.com
CONFLUENCE_API_TOKEN=your-api-token
CONFLUENCE_SPACE_KEY=TEST
```

### **8. Next Steps After Authentication**

1. ✅ **Verify login**: `forge whoami`
2. ✅ **Create Forge app**: `forge create`
3. ✅ **Test Confluence access**: Basic API calls
4. ✅ **Integrate with ADPA**: Add publishing module

---

## 🚀 **Ready to Continue?**

Once you have:
- ✅ Successfully logged in with `forge login`
- ✅ Can run `forge whoami` without errors
- ✅ Have your Confluence instance details

We can proceed to create the Forge app and integrate it with ADPA!

---

## 📞 **Need Help?**

If you're still having trouble:
1. **Double-check** the token creation steps
2. **Try** creating a new API token
3. **Verify** your Atlassian account has developer access
4. **Consider** creating a fresh developer account if needed

The authentication is the first hurdle - once we get past this, the development flow becomes much smoother!
