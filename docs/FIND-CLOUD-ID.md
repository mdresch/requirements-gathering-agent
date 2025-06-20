# 🔧 Confluence Cloud ID Configuration Guide

## The Issue: Cloud ID Required

The error "To use API tokens, you will need to construct the request URL with a cloud ID" means your Confluence instance requires the **Cloud ID** format instead of the domain-based URL.

## 🔍 How to Find Your Confluence Cloud ID

### Method 1: Accessible Resources API
We can use the Atlassian API to find your Cloud ID:

```bash
# This will show all accessible resources with their Cloud IDs
curl -u menno@cbadmin.onmicrosoft.com:YOUR_API_TOKEN \
  https://api.atlassian.com/oauth/token/accessible-resources
```

### Method 2: Browser Developer Tools
1. Go to your Confluence site: https://cba-adpa.atlassian.net
2. Open Developer Tools (F12)
3. Go to Network tab
4. Refresh the page
5. Look for API calls to see the Cloud ID in the URLs

### Method 3: Check Confluence Admin Settings
1. Go to Confluence as an admin
2. Look in Site Administration
3. The Cloud ID is often displayed in the system information

## 🔧 Let's Find Your Cloud ID Automatically

Let me create a simple script to find your Cloud ID using your API token:
