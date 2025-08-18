# Environment Configuration Guide

## Overview

The Requirements Gathering Agent (RGA) provides comprehensive environment configuration options for AI providers with automatic fallback mechanisms to maximize uptime and performance. This guide covers all configuration options, best practices, and troubleshooting.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration Options](#configuration-options)
3. [Environment Templates](#environment-templates)
4. [Automatic Fallback System](#automatic-fallback-system)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring and Health Checks](#monitoring-and-health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Quick Start

### 1. Generate Configuration Template

```bash
# Generate development template
rga configure --template development

# Generate production template
rga configure --template production

# Generate testing template
rga configure --template testing
```

### 2. Interactive Configuration Wizard

```bash
# Run interactive setup
rga configure --interactive
```

### 3. Validate Configuration

```bash
# Validate current setup
rga configure --validate
```

## Configuration Options

### Primary Configuration Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `RGA_PRIMARY_PROVIDER` | Primary AI provider | `google-ai` | `azure-openai` |
| `RGA_FALLBACK_PROVIDERS` | Comma-separated fallback providers | `azure-openai,github-ai,ollama` | `google-ai,github-ai` |
| `RGA_AUTO_FALLBACK` | Enable automatic fallback | `true` | `false` |
| `RGA_HEALTH_CHECK_INTERVAL` | Health check interval (ms) | `30000` | `15000` |

### Performance Thresholds

| Variable | Description | Default | Production | Development |
|----------|-------------|---------|------------|-------------|
| `RGA_MAX_RESPONSE_TIME` | Maximum response time (ms) | `10000` | `8000` | `15000` |
| `RGA_MIN_SUCCESS_RATE` | Minimum success rate (0-1) | `0.95` | `0.98` | `0.90` |
| `RGA_MAX_ERROR_RATE` | Maximum error rate (0-1) | `0.05` | `0.02` | `0.10` |
| `RGA_HEALTH_CHECK_TIMEOUT` | Health check timeout (ms) | `5000` | `3000` | `10000` |

### Circuit Breaker Configuration

| Variable | Description | Default | Production | Testing |
|----------|-------------|---------|------------|---------|
| `RGA_CIRCUIT_BREAKER_THRESHOLD` | Failure threshold | `5` | `3` | `2` |
| `RGA_CIRCUIT_BREAKER_RESET_TIMEOUT` | Reset timeout (ms) | `60000` | `30000` | `5000` |

### Retry Configuration

| Variable | Description | Default | Production | Development |
|----------|-------------|---------|------------|-------------|
| `RGA_MAX_RETRIES` | Maximum retry attempts | `3` | `5` | `2` |
| `RGA_RETRY_BASE_DELAY` | Base retry delay (ms) | `1000` | `2000` | `500` |
| `RGA_RETRY_MAX_DELAY` | Maximum retry delay (ms) | `30000` | `60000` | `5000` |

## Environment Templates

### Development Environment

Optimized for developer experience with free tiers and local options:

```bash
# Primary: Google AI Studio (free)
# Fallbacks: Ollama (local), GitHub AI (free for users)
rga configure --template development
```

**Features:**
- Free tier providers prioritized
- Relaxed performance thresholds
- Local development support
- Verbose logging for debugging

### Production Environment

Optimized for high availability and enterprise requirements:

```bash
# Primary: Azure OpenAI (enterprise)
# Fallbacks: Google AI, GitHub AI, Azure AI Studio
rga configure --template production
```

**Features:**
- Enterprise-grade providers
- Strict performance thresholds
- Multiple fallback options
- Enhanced monitoring
- Security-focused configuration

### Testing Environment

Optimized for CI/CD and automated testing:

```bash
# Primary: Mock AI (deterministic)
# Fallbacks: Real providers for integration tests
rga configure --template testing
```

**Features:**
- Mock providers for unit tests
- Fast response requirements
- Minimal retries for speed
- Deterministic responses
- CI/CD integration

## Automatic Fallback System

### How It Works

1. **Health Monitoring**: Continuous health checks on all providers
2. **Performance Tracking**: Real-time metrics collection
3. **Circuit Breaker**: Automatic provider isolation on failures
4. **Intelligent Fallback**: Performance-based provider selection
5. **Automatic Recovery**: Self-healing when providers recover

### Fallback Triggers

- **Primary Provider Failure**: Automatic switch to best fallback
- **Performance Degradation**: Switch when thresholds exceeded
- **Rate Limiting**: Temporary switch during rate limit periods
- **Circuit Breaker Open**: Immediate fallback to healthy provider

### Fallback Selection Logic

```typescript
// Provider scoring algorithm
const score = (responseTimeScore + successRateScore + errorRateScore + circuitBreakerScore) / 4;

// Factors considered:
// - Response time vs threshold
// - Success rate history
// - Error rate trends
// - Circuit breaker state
```

## Performance Optimization

### Automatic Optimization

```bash
# Optimize configuration based on performance data
rga configure --optimize
```

This analyzes provider performance and adjusts:
- Primary provider selection
- Performance thresholds
- Retry configurations
- Health check intervals

### Manual Optimization

1. **Monitor Performance**:
   ```bash
   rga configure --monitor
   ```

2. **Analyze Metrics**:
   - Response times
   - Success rates
   - Error patterns
   - Fallback frequency

3. **Adjust Thresholds**:
   - Increase thresholds for stability
   - Decrease for performance
   - Balance based on requirements

## Monitoring and Health Checks

### Real-time Monitoring

```bash
# Start real-time health monitor
rga configure --monitor
```

**Displays:**
- Provider status (healthy/degraded/unhealthy)
- Success rates and error rates
- Response times
- Circuit breaker states
- Recent fallback events

### Health Check Components

1. **Connection Test**: Verify provider accessibility
2. **Authentication Check**: Validate credentials
3. **Performance Test**: Measure response times
4. **Capacity Check**: Verify rate limits and quotas

### Metrics Collection

- **Response Time**: Average and percentile tracking
- **Success Rate**: Successful requests / total requests
- **Error Rate**: Failed requests / total requests
- **Availability**: Uptime percentage
- **Fallback Events**: Frequency and reasons

## Troubleshooting

### Common Issues

#### 1. Provider Not Configured

**Symptoms:**
- "Provider not properly configured" error
- Failed validation

**Solutions:**
```bash
# Check configuration
rga configure --validate

# View required environment variables
rga configure --interactive
```

#### 2. Frequent Fallbacks

**Symptoms:**
- Constant provider switching
- Performance degradation

**Solutions:**
```bash
# Check thresholds
rga configure --monitor

# Optimize configuration
rga configure --optimize

# Adjust thresholds manually
export RGA_MAX_RESPONSE_TIME=15000
export RGA_MIN_SUCCESS_RATE=0.90
```

#### 3. Circuit Breaker Always Open

**Symptoms:**
- "Circuit breaker is OPEN" errors
- No successful requests

**Solutions:**
```bash
# Reset circuit breakers
rga configure --reset

# Check provider health
rga configure --test

# Adjust circuit breaker settings
export RGA_CIRCUIT_BREAKER_THRESHOLD=10
export RGA_CIRCUIT_BREAKER_RESET_TIMEOUT=30000
```

#### 4. No Fallback Providers Available

**Symptoms:**
- "No healthy fallback providers" error
- System failure when primary fails

**Solutions:**
```bash
# Configure additional providers
rga configure --interactive

# Test all providers
rga configure --test

# Add more fallback options
export RGA_FALLBACK_PROVIDERS=google-ai,github-ai,ollama
```

### Diagnostic Commands

```bash
# Comprehensive validation
rga configure --validate

# Test all providers
rga configure --test

# Export configuration for analysis
rga configure --export config-backup.json

# Monitor in real-time
rga configure --monitor
```

## Best Practices

### 1. Multi-Provider Strategy

- **Always configure fallbacks**: Never rely on a single provider
- **Mix provider types**: Combine cloud, local, and free options
- **Test regularly**: Verify all providers work correctly

### 2. Environment-Specific Configuration

- **Development**: Use free tiers and local options
- **Production**: Use enterprise providers with SLAs
- **Testing**: Use mock providers for consistency

### 3. Performance Tuning

- **Monitor continuously**: Use real-time monitoring
- **Adjust thresholds**: Based on actual performance data
- **Optimize regularly**: Run optimization weekly

### 4. Security Considerations

- **Rotate API keys**: Regular key rotation
- **Use environment variables**: Never hardcode credentials
- **Secure storage**: Use secure credential management

### 5. Monitoring and Alerting

- **Set up alerts**: For fallback events and failures
- **Track metrics**: Monitor trends over time
- **Regular reviews**: Weekly configuration reviews

## Advanced Configuration

### Custom Provider Configuration

```typescript
// Custom provider definition
const customProvider: EnhancedProviderConfig = {
  id: 'custom-ai',
  name: 'Custom AI Provider',
  displayName: 'Custom AI Service',
  description: 'Custom AI provider integration',
  category: 'enterprise',
  priority: 1,
  requiredEnvVars: ['CUSTOM_AI_API_KEY'],
  // ... additional configuration
};
```

### Environment-Specific Overrides

```bash
# Development overrides
export NODE_ENV=development
export RGA_HEALTH_CHECK_INTERVAL=60000
export RGA_MAX_RESPONSE_TIME=15000

# Production overrides
export NODE_ENV=production
export RGA_HEALTH_CHECK_INTERVAL=15000
export RGA_MAX_RESPONSE_TIME=8000
export RGA_MIN_SUCCESS_RATE=0.98
```

### Configuration File

Create `.rga-config.json` for persistent configuration:

```json
{
  "primaryProvider": "azure-openai",
  "fallbackProviders": ["google-ai", "github-ai"],
  "autoFallbackEnabled": true,
  "healthCheckInterval": 30000,
  "performanceThresholds": {
    "maxResponseTime": 10000,
    "minSuccessRate": 0.95,
    "maxErrorRate": 0.05,
    "healthCheckTimeout": 5000
  },
  "retryConfig": {
    "maxRetries": 3,
    "baseDelay": 1000,
    "maxDelay": 30000,
    "backoffMultiplier": 2,
    "retryableErrors": ["429", "rate limit", "timeout", "500", "502", "503", "504"]
  },
  "circuitBreakerConfig": {
    "failureThreshold": 5,
    "resetTimeout": 60000,
    "halfOpenMaxCalls": 3
  }
}
```

## API Reference

### Configuration Manager

```typescript
import EnvironmentConfigManager from './modules/ai/EnvironmentConfigManager.js';

const configManager = EnvironmentConfigManager.getInstance();

// Get configuration
const config = configManager.getConfiguration();

// Update configuration
await configManager.updateConfiguration({
  primaryProvider: 'azure-openai',
  autoFallbackEnabled: true
});

// Execute with fallback
const result = await configManager.executeWithFallback(
  async (provider) => {
    // Your AI operation here
    return await aiOperation(provider);
  },
  'Document Generation'
);

// Get provider health
const health = configManager.getProviderHealth();

// Get fallback history
const history = configManager.getFallbackHistory();
```

### CLI Commands

```bash
# Configuration management
rga configure --interactive          # Interactive wizard
rga configure --template <type>      # Generate template
rga configure --validate             # Validate configuration
rga configure --optimize             # Optimize performance
rga configure --reset                # Reset to defaults
rga configure --export <file>        # Export configuration
rga configure --import <file>        # Import configuration
rga configure --monitor              # Real-time monitoring
rga configure --test                 # Test all providers

# Status and information
rga status                           # Show current status
rga configure                        # Show configuration overview
```

## Support and Resources

### Documentation
- [Provider Setup Guides](./PROVIDER-SETUP-GUIDES.md)
- [Performance Tuning](./PERFORMANCE-TUNING.md)
- [Security Best Practices](./SECURITY-GUIDE.md)

### Community
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discussions](https://github.com/your-repo/discussions)
- [Discord Community](https://discord.gg/your-server)

### Professional Support
- Enterprise support available
- Custom provider integration
- Performance consulting
- Training and workshops