# 🔐 Environment Variables Guide for ADPA v2.1.3

## Overview
This guide provides a comprehensive overview of all environment variables used by the Automated Document Processing Assistant (ADPA), including the new Confluence integration.

## 🚀 AI Provider Configuration

### **GitHub Models (Recommended)**
```bash
# Required for GitHub Models
GITHUB_TOKEN=your_github_personal_access_token
```

### **Azure OpenAI**
```bash
# Required for Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

### **Google AI (Gemini)**
```bash
# Required for Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### **OpenAI (Direct)**
```bash
# Required for OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### **Anthropic Claude**
```bash
# Required for Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### **Ollama (Local)**
```bash
# Optional - defaults to http://localhost:11434
OLLAMA_BASE_URL=http://localhost:11434
```

## 🔗 Confluence Integration (NEW in v2.1.3)

### **OAuth 2.0 Authentication (Recommended)**
```bash
# OAuth 2.0 Configuration - Modern and secure
CONFLUENCE_CLIENT_ID=your_oauth2_client_id
CONFLUENCE_CLIENT_SECRET=your_oauth2_client_secret
CONFLUENCE_REDIRECT_URI=http://localhost:3000/callback
CONFLUENCE_SCOPES=read:content:confluence,write:content:confluence,read:user:confluence,read:space:confluence

# Common Configuration
CONFLUENCE_SPACE_KEY=YOURSPACE
CONFLUENCE_PARENT_PAGE_ID=optional_parent_page_id
CONFLUENCE_CLOUD_ID=optional_cloud_id
```

### **API Token Authentication (Legacy)**
```bash
# Legacy API Token Configuration
CONFLUENCE_API_TOKEN=your_atlassian_api_token
# OR alternatively:
ATLASSIAN_API_TOKEN=your_atlassian_api_token

# Required for API Token method
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
CONFLUENCE_EMAIL=your-email@domain.com
CONFLUENCE_SPACE_KEY=YOURSPACE
CONFLUENCE_PARENT_PAGE_ID=optional_parent_page_id
```

### **How to Set Up OAuth 2.0 (Recommended)**
1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Create a new app or use existing one
3. Configure OAuth 2.0 (3LO) with redirect URI: `http://localhost:3000/callback`
4. Add the following scopes:
   - `read:content:confluence` - View detailed contents
   - `write:content:confluence` - Create and update contents
   - `read:user:confluence` - View user details
   - `read:space:confluence` - View spaces
5. Copy Client ID and Client Secret to your `.env` file

### **How to Get API Token (Legacy)**
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a name (e.g., "ADPA Integration")
4. Copy the token and set it as `CONFLUENCE_API_TOKEN`

## 💻 Platform-Specific Setup

### **Windows PowerShell**
```powershell
# AI Provider (choose one)
$env:GITHUB_TOKEN="your_github_token"

# Confluence Integration
$env:CONFLUENCE_API_TOKEN="your_atlassian_api_token"
$env:CONFLUENCE_BASE_URL="https://your-domain.atlassian.net"
$env:CONFLUENCE_EMAIL="your-email@domain.com"
$env:CONFLUENCE_SPACE_KEY="YOURSPACE"
```

### **Windows Command Prompt**
```cmd
REM AI Provider (choose one)
set GITHUB_TOKEN=your_github_token

REM Confluence Integration
set CONFLUENCE_API_TOKEN=your_atlassian_api_token
set CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
set CONFLUENCE_EMAIL=your-email@domain.com
set CONFLUENCE_SPACE_KEY=YOURSPACE
```

### **Linux/macOS**
```bash
# AI Provider (choose one)
export GITHUB_TOKEN="your_github_token"

# Confluence Integration
export CONFLUENCE_API_TOKEN="your_atlassian_api_token"
export CONFLUENCE_BASE_URL="https://your-domain.atlassian.net"
export CONFLUENCE_EMAIL="your-email@domain.com"
export CONFLUENCE_SPACE_KEY="YOURSPACE"
```

## 📁 .env File Setup (Recommended)

Create a `.env` file in your project root:

```env
# .env file for ADPA v2.1.3
# IMPORTANT: Add .env to your .gitignore file!

# ===========================================
# AI PROVIDER CONFIGURATION (Choose One)
# ===========================================

# GitHub Models (Recommended - Free tier available)
GITHUB_TOKEN=your_github_personal_access_token

# Azure OpenAI (Enterprise)
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# AZURE_OPENAI_API_KEY=your_azure_openai_api_key
# AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name

# Google AI (Gemini)
# GOOGLE_AI_API_KEY=your_google_ai_api_key

# OpenAI (Direct)
# OPENAI_API_KEY=your_openai_api_key

# Anthropic Claude
# ANTHROPIC_API_KEY=your_anthropic_api_key

# ===========================================
# CONFLUENCE INTEGRATION (NEW in v2.1.3)
# ===========================================

# Option 1: OAuth 2.0 Authentication (Recommended)
# Get these from Atlassian Developer Console
CONFLUENCE_CLIENT_ID=your_oauth2_client_id
CONFLUENCE_CLIENT_SECRET=your_oauth2_client_secret
CONFLUENCE_REDIRECT_URI=http://localhost:3000/callback
CONFLUENCE_SCOPES=read:content:confluence,write:content:confluence,read:user:confluence,read:space:confluence

# Option 2: API Token Authentication (Legacy)
# CONFLUENCE_API_TOKEN=your_atlassian_api_token
# CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
# CONFLUENCE_EMAIL=your-email@domain.com

# Common Configuration (both methods)
CONFLUENCE_SPACE_KEY=YOURSPACE
CONFLUENCE_PARENT_PAGE_ID=optional_parent_page_id
CONFLUENCE_CLOUD_ID=optional_cloud_id

# ===========================================
# OPTIONAL CONFIGURATION
# ===========================================

# Ollama (Local AI)
# OLLAMA_BASE_URL=http://localhost:11434

# Debug and Development
# DEBUG=true
# VERBOSE_LOGGING=true
```

## 🔍 Verification Commands

### **Check AI Provider Configuration**
```bash
# Test your AI provider setup
npm run requirements-gathering-agent --status
```

### **Check Confluence Integration**
```bash
# Initialize Confluence configuration
npm run confluence:init

# Check Confluence status
npm run confluence:status

# Test Confluence connection
npm run confluence:test
```

## ⚠️ Security Best Practices

### **1. Environment Variable Security**
- ✅ Never commit `.env` files to version control
- ✅ Add `.env` to your `.gitignore` file
- ✅ Use different API tokens for different environments
- ✅ Regularly rotate API tokens

### **2. API Token Management**
- ✅ Use descriptive names for API tokens
- ✅ Set appropriate expiration dates
- ✅ Monitor token usage in provider dashboards
- ✅ Revoke unused tokens immediately

### **3. Confluence-Specific Security**
- ✅ Use dedicated API tokens for ADPA
- ✅ Limit token permissions to required scopes
- ✅ Monitor Confluence activity logs
- ✅ Use space-specific permissions when possible

## 🛠️ Troubleshooting

### **Common Issues**

1. **"API token not found" errors**
   ```bash
   # Check if environment variables are set
   echo $CONFLUENCE_API_TOKEN    # Linux/macOS
   echo $env:CONFLUENCE_API_TOKEN # Windows PowerShell
   ```

2. **"Connection failed" errors**
   ```bash
   # Test Confluence connection
   npm run confluence:test
   ```

3. **"Invalid space key" errors**
   ```bash
   # Check Confluence configuration
   npm run confluence:status
   ```

### **Debug Commands**
```bash
# Show detailed configuration status
node dist/cli.js --status

# Show Confluence integration status
node dist/cli.js confluence status

# Test with verbose output
node dist/cli.js confluence test --verbose
```

## 📊 Environment Variable Priority

ADPA uses the following priority order for configuration:

1. **Environment Variables** (highest priority)
2. **config-rga.json** (medium priority)
3. **Default values** (lowest priority)

This means environment variables will always override configuration file settings.

## 🎯 Quick Setup Checklist

- [ ] Choose and configure one AI provider
- [ ] Set required environment variables
- [ ] Create `.env` file (optional but recommended)
- [ ] Add `.env` to `.gitignore`
- [ ] Test AI provider: `npm run requirements-gathering-agent --status`
- [ ] Initialize Confluence: `npm run confluence:init`
- [ ] Configure Confluence settings in `config-rga.json`
- [ ] Test Confluence: `npm run confluence:test`
- [ ] Generate and publish documents: `npm run confluence:publish`

## 🚀 Ready to Go!

Once you have your environment variables configured:

1. **Generate documents**: `node dist/cli.js --generate-all`
2. **Publish to Confluence**: `npm run confluence:publish`
3. **Check status anytime**: `npm run confluence:status`

---

**Need Help?** Run `node dist/cli.js --help` for comprehensive CLI documentation!
