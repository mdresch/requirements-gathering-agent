# AI Provider Setup Guides

Complete setup instructions for all supported AI providers with automatic fallback configuration.

## Table of Contents

1. [Google AI Studio (Recommended for Development)](#google-ai-studio)
2. [Azure OpenAI (Recommended for Production)](#azure-openai)
3. [GitHub AI (Free for GitHub Users)](#github-ai)
4. [Ollama (Local Development)](#ollama)
5. [Azure AI Studio](#azure-ai-studio)
6. [Multi-Provider Configuration](#multi-provider-configuration)
7. [Fallback Strategy Recommendations](#fallback-strategy-recommendations)

## Google AI Studio

**Best for:** Development, prototyping, free tier usage
**Tier:** Free with generous limits
**Setup Time:** 2 minutes

### Prerequisites
- Google Account
- Internet connection

### Setup Steps

1. **Get API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Configure Environment**
   ```bash
   # Add to .env file
   GOOGLE_AI_API_KEY=your-google-ai-api-key-here
   GOOGLE_AI_MODEL=gemini-1.5-flash
   ```

3. **Set as Primary Provider**
   ```bash
   export RGA_PRIMARY_PROVIDER=google-ai
   ```

4. **Test Configuration**
   ```bash
   rga configure --test
   ```

### Features
- ✅ 1M-2M token context window
- ✅ Free tier with generous daily limits
- ✅ Fast response times
- ✅ Easy setup
- ✅ No credit card required

### Limitations
- Rate limits on free tier
- Requires internet connection
- Geographic restrictions may apply

### Troubleshooting

**Issue:** "Invalid API key" error
```bash
# Verify API key is correct
echo $GOOGLE_AI_API_KEY

# Regenerate key if needed
# Visit https://makersuite.google.com/app/apikey
```

**Issue:** Rate limit errors
```bash
# Configure automatic fallback
export RGA_AUTO_FALLBACK=true
export RGA_FALLBACK_PROVIDERS=azure-openai,github-ai,ollama
```

## Azure OpenAI

**Best for:** Production, enterprise, high availability
**Tier:** Paid (enterprise-grade)
**Setup Time:** 10-15 minutes

### Prerequisites
- Azure subscription
- Azure OpenAI resource approval
- Azure CLI or portal access

### Setup Steps

#### Option 1: Entra ID Authentication (Recommended)

1. **Create Azure OpenAI Resource**
   ```bash
   # Using Azure CLI
   az cognitiveservices account create \
     --name your-openai-resource \
     --resource-group your-resource-group \
     --kind OpenAI \
     --sku S0 \
     --location eastus
   ```

2. **Create Service Principal**
   ```bash
   az ad sp create-for-rbac --name "rga-service-principal" \
     --role "Cognitive Services OpenAI User" \
     --scopes /subscriptions/your-subscription-id/resourceGroups/your-resource-group
   ```

3. **Configure Environment**
   ```bash
   # Add to .env file
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_CLIENT_ID=your-client-id
   AZURE_TENANT_ID=your-tenant-id
   AZURE_CLIENT_SECRET=your-client-secret
   USE_ENTRA_ID=true
   AZURE_OPENAI_API_VERSION=2024-02-15-preview
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
   ```

#### Option 2: API Key Authentication

1. **Get API Key**
   - Go to Azure Portal
   - Navigate to your OpenAI resource
   - Go to "Keys and Endpoint"
   - Copy Key 1 or Key 2

2. **Configure Environment**
   ```bash
   # Add to .env file
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_API_KEY=your-api-key
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
   AZURE_OPENAI_API_VERSION=2024-02-15-preview
   ```

3. **Set as Primary Provider**
   ```bash
   export RGA_PRIMARY_PROVIDER=azure-openai
   ```

4. **Test Configuration**
   ```bash
   rga configure --test
   ```

### Features
- ✅ Enterprise-grade security
- ✅ SLA guarantees
- ✅ Data residency control
- ✅ Advanced models (GPT-4, etc.)
- ✅ High rate limits
- ✅ Integration with Azure services

### Limitations
- Requires Azure subscription
- Approval process for access
- Paid service
- Regional availability

### Troubleshooting

**Issue:** "Resource not found" error
```bash
# Verify endpoint URL
curl -H "Authorization: Bearer $(az account get-access-token --query accessToken -o tsv)" \
  "https://your-resource.openai.azure.com/openai/deployments?api-version=2024-02-15-preview"
```

**Issue:** Authentication failures
```bash
# Test Entra ID authentication
az login
az account show

# Verify service principal permissions
az role assignment list --assignee your-client-id
```

## GitHub AI

**Best for:** GitHub users, development, free tier
**Tier:** Free for GitHub users
**Setup Time:** 3 minutes

### Prerequisites
- GitHub account
- GitHub personal access token

### Setup Steps

1. **Create Personal Access Token**
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select appropriate scopes (no special scopes needed for AI models)
   - Copy the generated token

2. **Configure Environment**
   ```bash
   # Add to .env file
   GITHUB_TOKEN=your-github-token
   GITHUB_ENDPOINT=https://models.github.ai/inference/
   ```

3. **Set as Primary or Fallback Provider**
   ```bash
   export RGA_PRIMARY_PROVIDER=github-ai
   # OR
   export RGA_FALLBACK_PROVIDERS=google-ai,github-ai,ollama
   ```

4. **Test Configuration**
   ```bash
   rga configure --test
   ```

### Features
- ✅ Free for GitHub users
- ✅ Multiple model options
- ✅ Good performance
- ✅ Easy setup for developers
- ✅ Integrated with GitHub ecosystem

### Limitations
- Requires GitHub account
- Rate limits apply
- Limited to GitHub users
- Beta service (subject to changes)

### Troubleshooting

**Issue:** "Unauthorized" error
```bash
# Verify token has correct permissions
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/user"
```

**Issue:** Model not available
```bash
# List available models
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://models.github.ai/v1/models"
```

## Ollama

**Best for:** Local development, offline work, privacy
**Tier:** Free (local)
**Setup Time:** 5-10 minutes

### Prerequisites
- Local machine with sufficient resources
- Docker (optional) or direct installation

### Setup Steps

#### Option 1: Direct Installation

1. **Install Ollama**
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

2. **Start Ollama Service**
   ```bash
   ollama serve
   ```

3. **Pull Required Model**
   ```bash
   ollama pull llama3.1
   # or
   ollama pull codellama
   ollama pull mistral
   ```

#### Option 2: Docker Installation

1. **Run Ollama Container**
   ```bash
   docker run -d \
     --name ollama \
     -p 11434:11434 \
     -v ollama:/root/.ollama \
     ollama/ollama
   ```

2. **Pull Model**
   ```bash
   docker exec -it ollama ollama pull llama3.1
   ```

3. **Configure Environment**
   ```bash
   # Add to .env file
   OLLAMA_ENDPOINT=http://localhost:11434
   REQUIREMENTS_AGENT_MODEL=llama3.1
   ```

4. **Set as Fallback Provider**
   ```bash
   export RGA_FALLBACK_PROVIDERS=google-ai,azure-openai,ollama
   ```

5. **Test Configuration**
   ```bash
   rga configure --test
   ```

### Features
- ✅ Completely local and private
- ✅ No internet required (after setup)
- ✅ No API costs
- ✅ Multiple model options
- ✅ Good for development and testing

### Limitations
- Requires local resources (CPU/RAM/Storage)
- Slower than cloud providers
- Limited model selection
- Setup complexity

### Troubleshooting

**Issue:** "Connection refused" error
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve
```

**Issue:** Model not found
```bash
# List available models
ollama list

# Pull required model
ollama pull llama3.1
```

**Issue:** Performance issues
```bash
# Check system resources
docker stats ollama  # if using Docker
htop  # check CPU/memory usage

# Consider using smaller models
ollama pull llama3.1:8b  # instead of larger variants
```

## Azure AI Studio

**Best for:** Azure ecosystem integration, enterprise
**Tier:** Paid
**Setup Time:** 10 minutes

### Prerequisites
- Azure subscription
- Azure AI Studio access

### Setup Steps

1. **Create AI Studio Resource**
   - Go to [Azure AI Studio](https://ai.azure.com/)
   - Create new project
   - Deploy required models

2. **Get Endpoint and Key**
   - Navigate to your deployment
   - Copy endpoint URL and API key

3. **Configure Environment**
   ```bash
   # Add to .env file
   AZURE_AI_STUDIO_ENDPOINT=https://your-ai-studio.azure.com/
   AZURE_AI_STUDIO_API_KEY=your-api-key
   ```

4. **Set as Provider**
   ```bash
   export RGA_PRIMARY_PROVIDER=azure-ai-studio
   ```

5. **Test Configuration**
   ```bash
   rga configure --test
   ```

### Features
- ✅ Integrated with Azure ecosystem
- ✅ Multiple model options
- ✅ Enterprise security
- ✅ Custom model support

### Limitations
- Requires Azure subscription
- Paid service
- Complex setup
- Regional availability

## Multi-Provider Configuration

### Recommended Configurations

#### Development Setup
```bash
# Primary: Free tier
export RGA_PRIMARY_PROVIDER=google-ai

# Fallbacks: Local and free options
export RGA_FALLBACK_PROVIDERS=ollama,github-ai

# Relaxed thresholds
export RGA_MAX_RESPONSE_TIME=15000
export RGA_MIN_SUCCESS_RATE=0.90
```

#### Production Setup
```bash
# Primary: Enterprise grade
export RGA_PRIMARY_PROVIDER=azure-openai

# Fallbacks: Multiple reliable options
export RGA_FALLBACK_PROVIDERS=google-ai,github-ai,azure-ai-studio

# Strict thresholds
export RGA_MAX_RESPONSE_TIME=8000
export RGA_MIN_SUCCESS_RATE=0.98
```

#### Testing Setup
```bash
# Primary: Mock for consistency
export RGA_PRIMARY_PROVIDER=mock-ai

# Fallbacks: Real providers for integration tests
export RGA_FALLBACK_PROVIDERS=google-ai,github-ai

# Fast thresholds
export RGA_MAX_RESPONSE_TIME=5000
export RGA_CIRCUIT_BREAKER_THRESHOLD=2
```

### Configuration Templates

Generate complete configuration templates:

```bash
# Development template
rga configure --template development

# Production template
rga configure --template production

# Testing template
rga configure --template testing
```

## Fallback Strategy Recommendations

### High Availability Strategy

1. **Primary**: Azure OpenAI (enterprise SLA)
2. **Fallback 1**: Google AI Studio (reliable free tier)
3. **Fallback 2**: GitHub AI (developer-friendly)
4. **Fallback 3**: Azure AI Studio (alternative Azure)

```bash
export RGA_PRIMARY_PROVIDER=azure-openai
export RGA_FALLBACK_PROVIDERS=google-ai,github-ai,azure-ai-studio
export RGA_AUTO_FALLBACK=true
```

### Cost-Optimized Strategy

1. **Primary**: Google AI Studio (free tier)
2. **Fallback 1**: GitHub AI (free for users)
3. **Fallback 2**: Ollama (local, no cost)
4. **Fallback 3**: Azure OpenAI (paid, when needed)

```bash
export RGA_PRIMARY_PROVIDER=google-ai
export RGA_FALLBACK_PROVIDERS=github-ai,ollama,azure-openai
export RGA_AUTO_FALLBACK=true
```

### Privacy-First Strategy

1. **Primary**: Ollama (local)
2. **Fallback 1**: Azure OpenAI (data residency)
3. **Fallback 2**: Google AI Studio (when needed)

```bash
export RGA_PRIMARY_PROVIDER=ollama
export RGA_FALLBACK_PROVIDERS=azure-openai,google-ai
export RGA_AUTO_FALLBACK=true
```

### Performance-First Strategy

1. **Primary**: Azure OpenAI (fastest, most reliable)
2. **Fallback 1**: Google AI Studio (good performance)
3. **Fallback 2**: GitHub AI (decent performance)

```bash
export RGA_PRIMARY_PROVIDER=azure-openai
export RGA_FALLBACK_PROVIDERS=google-ai,github-ai
export RGA_MAX_RESPONSE_TIME=5000
export RGA_MIN_SUCCESS_RATE=0.99
```

## Validation and Testing

### Validate All Providers

```bash
# Comprehensive validation
rga configure --validate

# Test all configured providers
rga configure --test

# Monitor real-time health
rga configure --monitor
```

### Individual Provider Testing

```bash
# Test specific provider
export RGA_PRIMARY_PROVIDER=google-ai
rga configure --test

# Switch and test another
export RGA_PRIMARY_PROVIDER=azure-openai
rga configure --test
```

### Fallback Testing

```bash
# Simulate primary provider failure
# (temporarily disable primary provider)
export GOOGLE_AI_API_KEY=""
rga generate business-case

# Should automatically fallback to next provider
```

## Monitoring and Maintenance

### Regular Health Checks

```bash
# Weekly validation
rga configure --validate

# Monthly optimization
rga configure --optimize

# Continuous monitoring
rga configure --monitor
```

### Performance Monitoring

Track key metrics:
- Response times
- Success rates
- Fallback frequency
- Error patterns

### Configuration Backup

```bash
# Export current configuration
rga configure --export backup-$(date +%Y%m%d).json

# Import configuration
rga configure --import backup-20241201.json
```

## Support and Resources

### Provider-Specific Documentation
- [Google AI Studio Docs](https://ai.google.dev/docs)
- [Azure OpenAI Docs](https://docs.microsoft.com/azure/cognitive-services/openai/)
- [GitHub AI Models](https://github.com/marketplace/models)
- [Ollama Documentation](https://ollama.ai/docs)

### Community Resources
- [GitHub Issues](https://github.com/your-repo/issues)
- [Provider Setup Discussions](https://github.com/your-repo/discussions)
- [Configuration Examples](https://github.com/your-repo/examples)

### Professional Support
- Enterprise setup assistance
- Custom provider integration
- Performance optimization consulting
- Training and workshops