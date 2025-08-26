# Environment Configuration Guide

## Overview

The ADPA (Adaptive Document Processing Agent) provides comprehensive environment configuration options for AI providers with automatic fallback mechanisms to maximize uptime and performance. This guide covers setup, configuration, and optimization of your AI provider environment.

## Quick Start

### 1. Create Environment Configuration

```bash
# Create development environment
npm run env:setup -- --template development

# Create production environment  
npm run env:setup -- --template production

# Or use CLI directly
npx rga env setup --template development
```

### 2. Configure Your Providers

Edit the generated `.env` file and add your API keys:

```bash
# Example for Google AI (recommended for getting started)
GOOGLE_AI_API_KEY=your-api-key-here
GOOGLE_AI_ENABLED=true

# Enable automatic fallback
ENABLE_PROVIDER_FALLBACK=true
```

### 3. Validate Configuration

```bash
# Validate your setup
npm run env:validate

# Or use CLI directly
npx rga env validate --report
```

## Supported AI Providers

### 🟣 Google AI Studio (Recommended)
- **Category**: Free Tier
- **Setup Time**: 2 minutes
- **Features**: 1M-2M token context, generous free tier, fast response
- **Best For**: Getting started, development, high-volume processing

**Setup:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `.env`: `GOOGLE_AI_API_KEY=your-key`

### 🟢 GitHub AI (Free for GitHub Users)
- **Category**: Free Tier
- **Setup Time**: 3 minutes
- **Features**: GPT-4o-mini access, free for GitHub users
- **Best For**: GitHub users, reliable fallback option

**Setup:**
1. Create [GitHub Personal Access Token](https://github.com/settings/tokens)
2. Add to `.env`: `GITHUB_TOKEN=your-token`

### 🔷 Azure OpenAI (Enterprise)
- **Category**: Enterprise
- **Setup Time**: 20 minutes
- **Features**: Enterprise security, Entra ID auth, high reliability
- **Best For**: Enterprise environments, production workloads

**Setup:**
1. Create Azure OpenAI resource
2. Configure Entra ID authentication
3. Add credentials to `.env`

### 🔶 Azure OpenAI (API Key)
- **Category**: Cloud
- **Setup Time**: 5 minutes
- **Features**: Simpler setup than Entra ID
- **Best For**: Quick Azure OpenAI setup

### 🟡 Ollama (Local AI)
- **Category**: Local/Privacy
- **Setup Time**: 15 minutes
- **Features**: Offline processing, privacy-focused
- **Best For**: Privacy-conscious users, offline environments

## Environment Templates

### Development Template (`.env.development.template`)

Optimized for development with:
- Enhanced debugging and logging
- Shorter timeouts and faster recovery
- Aggressive health checking
- Test mode features

```bash
# Key development settings
LOG_LEVEL=debug
ENABLE_DEBUG_LOGGING=true
AI_TIMEOUT=30000
PROVIDER_HEALTH_CHECK_INTERVAL=60000
```

### Production Template (`.env.production.template`)

Optimized for production with:
- Performance optimization
- Longer timeouts for stability
- Comprehensive monitoring
- Security-focused logging

```bash
# Key production settings
LOG_LEVEL=info
ENABLE_DEBUG_LOGGING=false
AI_TIMEOUT=60000
PROVIDER_HEALTH_CHECK_INTERVAL=300000
```

## Automatic Fallback Configuration

### Enable Fallback

```bash
# Enable automatic provider switching
ENABLE_PROVIDER_FALLBACK=true

# Define fallback order (highest priority first)
PROVIDER_FALLBACK_ORDER=google-ai,github-ai,azure-openai-entra,azure-openai-key,ollama
```

### Fallback Settings

```bash
# Health monitoring
PROVIDER_HEALTH_CHECK_INTERVAL=300000  # 5 minutes
PROVIDER_HEALTH_CHECK_TIMEOUT=10000    # 10 seconds

# Circuit breaker
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RECOVERY_TIME=60000    # 1 minute

# Retry configuration
MAX_RETRIES=3
RETRY_BASE_DELAY=1000                  # 1 second
RETRY_MAX_DELAY=30000                  # 30 seconds
```

## Performance Optimization

### Request Caching

```bash
# Enable caching for better performance
ENABLE_REQUEST_CACHING=true
CACHE_TTL=3600000                      # 1 hour
```

### Metrics and Monitoring

```bash
# Enable performance monitoring
ENABLE_METRICS=true
METRICS_COLLECTION_INTERVAL=60000      # 1 minute
ENABLE_TOKEN_MONITORING=true
```

### Timeout Configuration

```bash
# AI request timeout
AI_TIMEOUT=60000                       # 60 seconds

# Adjust based on your needs:
# - Development: 30000 (30s)
# - Production: 60000 (60s)
# - High-volume: 120000 (2m)
```

## CLI Commands

### Environment Validation

```bash
# Basic validation
npx rga env validate

# Detailed report
npx rga env validate --report

# Save report to file
npx rga env validate --report --output config-report.md
```

### Provider Management

```bash
# Show provider status
npx rga env providers

# Detailed provider information
npx rga env providers --detailed

# Test provider connections
npx rga env test --all
npx rga env test --provider google-ai
```

### Fallback Monitoring

```bash
# Show fallback configuration
npx rga env fallback

# Show provider health status
npx rga env fallback --health

# Show fallback history
npx rga env fallback --history
```

### Configuration Optimization

```bash
# Analyze configuration for optimization
npx rga env optimize
```

## Configuration Examples

### Minimal Setup (Single Provider)

```bash
# .env
PRIMARY_AI_PROVIDER=google-ai
GOOGLE_AI_API_KEY=your-key-here
GOOGLE_AI_ENABLED=true
```

### Recommended Setup (Multiple Providers with Fallback)

```bash
# .env
PRIMARY_AI_PROVIDER=google-ai
ENABLE_PROVIDER_FALLBACK=true
PROVIDER_FALLBACK_ORDER=google-ai,github-ai

# Google AI
GOOGLE_AI_API_KEY=your-google-key
GOOGLE_AI_ENABLED=true

# GitHub AI (fallback)
GITHUB_TOKEN=your-github-token
GITHUB_ENDPOINT=https://models.github.ai/inference/
GITHUB_AI_ENABLED=true

# Performance settings
ENABLE_REQUEST_CACHING=true
ENABLE_METRICS=true
AI_TIMEOUT=60000
```

### Enterprise Setup (Azure + Fallback)

```bash
# .env
PRIMARY_AI_PROVIDER=azure-openai-entra
ENABLE_PROVIDER_FALLBACK=true
PROVIDER_FALLBACK_ORDER=azure-openai-entra,google-ai,github-ai

# Azure OpenAI (primary)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_SECRET=your-client-secret
USE_ENTRA_ID=true
AZURE_OPENAI_ENTRA_ENABLED=true

# Fallback providers
GOOGLE_AI_API_KEY=your-google-key
GOOGLE_AI_ENABLED=true
GITHUB_TOKEN=your-github-token
GITHUB_AI_ENABLED=true

# Enterprise settings
ENABLE_METRICS=true
LOG_LEVEL=info
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
```

## Troubleshooting

### Common Issues

#### No Providers Configured
```bash
❌ No AI providers are configured. At least one provider must be set up
```
**Solution**: Configure at least one provider in your `.env` file.

#### Provider Connection Failed
```bash
⚠️ Provider google-ai health check failed: Invalid API key
```
**Solution**: Verify your API key is correct and has proper permissions.

#### Fallback Not Working
```bash
⚠️ Provider fallback is disabled
```
**Solution**: Set `ENABLE_PROVIDER_FALLBACK=true` in your `.env` file.

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# .env
LOG_LEVEL=debug
ENABLE_DEBUG_LOGGING=true
LOG_AI_REQUESTS=true
LOG_PROVIDER_SWITCHES=true
LOG_CIRCUIT_BREAKER_EVENTS=true
```

### Health Check Issues

If providers are showing as unhealthy:

1. Check network connectivity
2. Verify API keys and credentials
3. Check service status pages
4. Adjust timeout settings if needed

```bash
# Increase timeouts for slow networks
PROVIDER_HEALTH_CHECK_TIMEOUT=20000
AI_TIMEOUT=120000
```

## Best Practices

### 1. Use Multiple Providers
Configure at least 2 providers for reliability:
- Primary: Your preferred provider
- Fallback: A reliable backup option

### 2. Monitor Performance
Enable metrics to track performance:
```bash
ENABLE_METRICS=true
ENABLE_TOKEN_MONITORING=true
```

### 3. Optimize for Your Use Case

**Development:**
- Use free tiers (Google AI, GitHub AI)
- Enable debug logging
- Shorter timeouts for faster feedback

**Production:**
- Use reliable providers (Azure OpenAI, Google AI)
- Enable caching
- Longer timeouts for stability
- Monitor health and performance

### 4. Security Considerations

- Never commit `.env` files to version control
- Use environment-specific configurations
- Rotate API keys regularly
- Monitor usage and costs

### 5. Cost Optimization

- Use free tiers when possible
- Enable caching to reduce API calls
- Monitor token usage
- Set up usage alerts

## Integration Examples

### Docker Environment

```dockerfile
# Dockerfile
ENV GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
ENV ENABLE_PROVIDER_FALLBACK=true
ENV PROVIDER_FALLBACK_ORDER=google-ai,github-ai
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
env:
  GOOGLE_AI_API_KEY: ${{ secrets.GOOGLE_AI_API_KEY }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  ENABLE_PROVIDER_FALLBACK: true
  LOG_LEVEL: info
```

### Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: adpa-config
data:
  ENABLE_PROVIDER_FALLBACK: "true"
  PROVIDER_FALLBACK_ORDER: "google-ai,github-ai"
  AI_TIMEOUT: "60000"
  ENABLE_METRICS: "true"
```

## Advanced Configuration

### Custom Fallback Logic

You can customize fallback behavior by adjusting:

```bash
# Performance thresholds
MAX_RESPONSE_TIME=30000
MIN_SUCCESS_RATE=0.8

# Circuit breaker tuning
CIRCUIT_BREAKER_FAILURE_THRESHOLD=3
CIRCUIT_BREAKER_RECOVERY_TIME=30000
CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS=2
```

### Provider-Specific Settings

```bash
# Google AI specific
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_MAX_TOKENS=1048576

# GitHub AI specific  
GITHUB_AI_MODEL=gpt-4o-mini
GITHUB_AI_MAX_TOKENS=128000

# Azure OpenAI specific
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Support and Resources

### Documentation
- [Provider Setup Guides](./PROVIDER-SETUP-GUIDES.md)
- [Performance Tuning](./PERFORMANCE-TUNING.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

### CLI Help
```bash
# Get help for environment commands
npx rga env --help
npx rga env validate --help
npx rga env setup --help
```

### Community
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discussions](https://github.com/your-repo/discussions)
- [Documentation](https://your-docs-site.com)

---

For more information, see the [complete documentation](./README.md) or run `npx rga env setup` to get started with the interactive setup wizard.