/**
 * Enhanced Environment Configuration Manager for AI Providers
 * 
 * Provides comprehensive environment configuration management with automatic
 * fallback mechanisms, health monitoring, and performance optimization.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created December 2024
 * 
 * Features:
 * - Automatic provider fallback based on health and performance
 * - Environment validation and configuration templates
 * - Real-time health monitoring and recovery
 * - Performance-based provider selection
 * - Configuration drift detection and auto-correction
 * 
 * @filepath src/modules/ai/EnvironmentConfigManager.ts
 */

import { writeFile, readFile, existsSync } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { AIProvider } from './types.js';
import { EnhancedProviderConfig, ProviderStatus } from './enhanced-types.js';
import { PROVIDER_DEFINITIONS } from './provider-definitions.js';
import { RetryManager } from './RetryManager.js';
import { CircuitBreaker } from '../../utils/circuit-breaker.js';

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

export interface EnvironmentConfig {
  primaryProvider: AIProvider;
  fallbackProviders: AIProvider[];
  healthCheckInterval: number;
  autoFallbackEnabled: boolean;
  performanceThresholds: PerformanceThresholds;
  retryConfig: RetryConfiguration;
  circuitBreakerConfig: CircuitBreakerConfiguration;
}

export interface PerformanceThresholds {
  maxResponseTime: number;
  minSuccessRate: number;
  maxErrorRate: number;
  healthCheckTimeout: number;
}

export interface RetryConfiguration {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface CircuitBreakerConfiguration {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxCalls: number;
}

export interface ProviderHealth {
  provider: AIProvider;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  successRate: number;
  errorRate: number;
  lastChecked: Date;
  consecutiveFailures: number;
  circuitBreakerState: 'closed' | 'open' | 'half-open';
}

export interface FallbackEvent {
  timestamp: Date;
  fromProvider: AIProvider;
  toProvider: AIProvider;
  reason: string;
  success: boolean;
}

export class EnvironmentConfigManager {
  private static instance: EnvironmentConfigManager;
  private config: EnvironmentConfig;
  private providerHealth: Map<AIProvider, ProviderHealth> = new Map();
  private fallbackHistory: FallbackEvent[] = [];
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private retryManager: RetryManager;
  private circuitBreakers: Map<AIProvider, CircuitBreaker> = new Map();

  private readonly DEFAULT_CONFIG: EnvironmentConfig = {
    primaryProvider: 'google-ai',
    fallbackProviders: ['azure-openai', 'github-ai', 'ollama'],
    healthCheckInterval: 30000, // 30 seconds
    autoFallbackEnabled: true,
    performanceThresholds: {
      maxResponseTime: 10000, // 10 seconds
      minSuccessRate: 0.95, // 95%
      maxErrorRate: 0.05, // 5%
      healthCheckTimeout: 5000 // 5 seconds
    },
    retryConfig: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      retryableErrors: ['429', 'rate limit', 'timeout', '500', '502', '503', '504', 'ECONNRESET', 'ETIMEDOUT']
    },
    circuitBreakerConfig: {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      halfOpenMaxCalls: 3
    }
  };

  private constructor() {
    this.config = { ...this.DEFAULT_CONFIG };
    this.retryManager = RetryManager.getInstance();
    this.initializeCircuitBreakers();
    this.loadConfiguration();
    this.startHealthMonitoring();
  }

  static getInstance(): EnvironmentConfigManager {
    if (!EnvironmentConfigManager.instance) {
      EnvironmentConfigManager.instance = new EnvironmentConfigManager();
    }
    return EnvironmentConfigManager.instance;
  }

  /**
   * Initialize circuit breakers for all providers
   */
  private initializeCircuitBreakers(): void {
    PROVIDER_DEFINITIONS.forEach(provider => {
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: this.config.circuitBreakerConfig.failureThreshold,
        resetTimeout: this.config.circuitBreakerConfig.resetTimeout,
        monitor: (state) => {
          this.updateProviderCircuitBreakerState(provider.id as AIProvider, state);
        }
      });
      this.circuitBreakers.set(provider.id as AIProvider, circuitBreaker);
    });
  }

  /**
   * Load configuration from file or environment
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const configPath = join(process.cwd(), '.rga-config.json');
      if (existsSync(configPath)) {
        const configData = await readFileAsync(configPath, 'utf-8');
        const loadedConfig = JSON.parse(configData);
        this.config = { ...this.DEFAULT_CONFIG, ...loadedConfig };
      }
      
      // Override with environment variables if present
      this.loadEnvironmentOverrides();
    } catch (error) {
      console.warn('Failed to load configuration, using defaults:', error);
    }
  }

  /**
   * Load configuration overrides from environment variables
   */
  private loadEnvironmentOverrides(): void {
    if (process.env.RGA_PRIMARY_PROVIDER) {
      this.config.primaryProvider = process.env.RGA_PRIMARY_PROVIDER as AIProvider;
    }
    
    if (process.env.RGA_FALLBACK_PROVIDERS) {
      this.config.fallbackProviders = process.env.RGA_FALLBACK_PROVIDERS.split(',') as AIProvider[];
    }
    
    if (process.env.RGA_AUTO_FALLBACK) {
      this.config.autoFallbackEnabled = process.env.RGA_AUTO_FALLBACK === 'true';
    }
    
    if (process.env.RGA_HEALTH_CHECK_INTERVAL) {
      this.config.healthCheckInterval = parseInt(process.env.RGA_HEALTH_CHECK_INTERVAL);
    }
    
    if (process.env.RGA_MAX_RESPONSE_TIME) {
      this.config.performanceThresholds.maxResponseTime = parseInt(process.env.RGA_MAX_RESPONSE_TIME);
    }
    
    if (process.env.RGA_MIN_SUCCESS_RATE) {
      this.config.performanceThresholds.minSuccessRate = parseFloat(process.env.RGA_MIN_SUCCESS_RATE);
    }
  }

  /**
   * Save current configuration to file
   */
  async saveConfiguration(): Promise<void> {
    try {
      const configPath = join(process.cwd(), '.rga-config.json');
      await writeFileAsync(configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  /**
   * Start health monitoring for all providers
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);
    
    // Perform initial health check
    this.performHealthChecks();
  }

  /**
   * Perform health checks on all configured providers
   */
  private async performHealthChecks(): Promise<void> {
    const allProviders = [this.config.primaryProvider, ...this.config.fallbackProviders];
    
    for (const provider of allProviders) {
      try {
        await this.checkProviderHealth(provider);
      } catch (error) {
        console.warn(`Health check failed for provider ${provider}:`, error);
      }
    }
  }

  /**
   * Check health of a specific provider
   */
  private async checkProviderHealth(provider: AIProvider): Promise<void> {
    const startTime = Date.now();
    let health = this.providerHealth.get(provider) || this.createDefaultHealth(provider);
    
    try {
      const providerConfig = PROVIDER_DEFINITIONS.find(p => p.id === provider);
      if (!providerConfig) {
        throw new Error(`Provider configuration not found: ${provider}`);
      }
      
      // Perform health check with timeout
      const healthCheckPromise = providerConfig.getStatus();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), this.config.performanceThresholds.healthCheckTimeout);
      });
      
      const status = await Promise.race([healthCheckPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;
      
      // Update health metrics
      health.responseTime = responseTime;
      health.lastChecked = new Date();
      health.consecutiveFailures = 0;
      
      // Determine health status based on performance thresholds
      if (status.connected && responseTime <= this.config.performanceThresholds.maxResponseTime) {
        health.status = 'healthy';
        health.successRate = Math.min(health.successRate + 0.1, 1.0);
        health.errorRate = Math.max(health.errorRate - 0.1, 0.0);
      } else {
        health.status = 'degraded';
        health.successRate = Math.max(health.successRate - 0.1, 0.0);
        health.errorRate = Math.min(health.errorRate + 0.1, 1.0);
      }
      
    } catch (error) {
      // Update health on failure
      health.status = 'unhealthy';
      health.consecutiveFailures++;
      health.successRate = Math.max(health.successRate - 0.2, 0.0);
      health.errorRate = Math.min(health.errorRate + 0.2, 1.0);
      health.lastChecked = new Date();
      health.responseTime = Date.now() - startTime;
    }
    
    this.providerHealth.set(provider, health);
    
    // Trigger fallback if primary provider is unhealthy
    if (provider === this.config.primaryProvider && health.status === 'unhealthy' && this.config.autoFallbackEnabled) {
      await this.triggerFallback('Primary provider unhealthy');
    }
  }

  /**
   * Create default health object for a provider
   */
  private createDefaultHealth(provider: AIProvider): ProviderHealth {
    return {
      provider,
      status: 'healthy',
      responseTime: 0,
      successRate: 1.0,
      errorRate: 0.0,
      lastChecked: new Date(),
      consecutiveFailures: 0,
      circuitBreakerState: 'closed'
    };
  }

  /**
   * Update circuit breaker state for a provider
   */
  private updateProviderCircuitBreakerState(provider: AIProvider, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'): void {
    const health = this.providerHealth.get(provider);
    if (health) {
      health.circuitBreakerState = state.toLowerCase() as 'closed' | 'open' | 'half-open';
      this.providerHealth.set(provider, health);
    }
  }

  /**
   * Trigger automatic fallback to next available provider
   */
  private async triggerFallback(reason: string): Promise<boolean> {
    const currentProvider = this.config.primaryProvider;
    
    // Find next healthy fallback provider
    for (const fallbackProvider of this.config.fallbackProviders) {
      const health = this.providerHealth.get(fallbackProvider);
      if (health && health.status !== 'unhealthy') {
        // Attempt fallback
        const fallbackEvent: FallbackEvent = {
          timestamp: new Date(),
          fromProvider: currentProvider,
          toProvider: fallbackProvider,
          reason,
          success: false
        };
        
        try {
          // Test the fallback provider
          await this.checkProviderHealth(fallbackProvider);
          const updatedHealth = this.providerHealth.get(fallbackProvider);
          
          if (updatedHealth && updatedHealth.status !== 'unhealthy') {
            // Successful fallback
            this.config.primaryProvider = fallbackProvider;
            fallbackEvent.success = true;
            this.fallbackHistory.push(fallbackEvent);
            
            console.log(`🔄 Automatic fallback: ${currentProvider} → ${fallbackProvider} (${reason})`);
            return true;
          }
        } catch (error) {
          console.warn(`Fallback to ${fallbackProvider} failed:`, error);
        }
        
        this.fallbackHistory.push(fallbackEvent);
      }
    }
    
    console.error(`❌ No healthy fallback providers available. Current: ${currentProvider}`);
    return false;
  }

  /**
   * Get the best available provider based on health and performance
   */
  getBestProvider(): AIProvider {
    const allProviders = [this.config.primaryProvider, ...this.config.fallbackProviders];
    let bestProvider = this.config.primaryProvider;
    let bestScore = 0;
    
    for (const provider of allProviders) {
      const health = this.providerHealth.get(provider);
      if (!health || health.status === 'unhealthy') continue;
      
      // Calculate provider score based on multiple factors
      const responseTimeScore = Math.max(0, 1 - (health.responseTime / this.config.performanceThresholds.maxResponseTime));
      const successRateScore = health.successRate;
      const errorRateScore = 1 - health.errorRate;
      const circuitBreakerScore = health.circuitBreakerState === 'closed' ? 1 : 0;
      
      const totalScore = (responseTimeScore + successRateScore + errorRateScore + circuitBreakerScore) / 4;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestProvider = provider;
      }
    }
    
    return bestProvider;
  }

  /**
   * Execute operation with automatic fallback
   */
  async executeWithFallback<T>(
    operation: (provider: AIProvider) => Promise<T>,
    operationName: string = 'AI Operation'
  ): Promise<T> {
    const providers = [this.config.primaryProvider, ...this.config.fallbackProviders];
    let lastError: any;
    
    for (const provider of providers) {
      const health = this.providerHealth.get(provider);
      if (health && health.status === 'unhealthy') {
        continue; // Skip unhealthy providers
      }
      
      const circuitBreaker = this.circuitBreakers.get(provider);
      if (!circuitBreaker) continue;
      
      try {
        const result = await circuitBreaker.execute(async () => {
          return await this.retryManager.executeWithRetry(
            () => operation(provider),
            operationName,
            provider,
            this.config.retryConfig
          );
        });
        
        // Update success metrics
        this.updateProviderMetrics(provider, true, Date.now());
        return result;
        
      } catch (error) {
        lastError = error;
        console.warn(`Operation failed with provider ${provider}:`, error.message);
        
        // Update failure metrics
        this.updateProviderMetrics(provider, false, Date.now());
        
        // Continue to next provider
        continue;
      }
    }
    
    throw new Error(`All providers failed for ${operationName}. Last error: ${lastError?.message}`);
  }

  /**
   * Update provider performance metrics
   */
  private updateProviderMetrics(provider: AIProvider, success: boolean, responseTime: number): void {
    let health = this.providerHealth.get(provider) || this.createDefaultHealth(provider);
    
    if (success) {
      health.successRate = Math.min(health.successRate + 0.05, 1.0);
      health.errorRate = Math.max(health.errorRate - 0.05, 0.0);
      health.consecutiveFailures = 0;
      health.responseTime = responseTime;
    } else {
      health.successRate = Math.max(health.successRate - 0.1, 0.0);
      health.errorRate = Math.min(health.errorRate + 0.1, 1.0);
      health.consecutiveFailures++;
    }
    
    // Update status based on thresholds
    if (health.successRate >= this.config.performanceThresholds.minSuccessRate && 
        health.errorRate <= this.config.performanceThresholds.maxErrorRate) {
      health.status = 'healthy';
    } else if (health.successRate >= 0.7) {
      health.status = 'degraded';
    } else {
      health.status = 'unhealthy';
    }
    
    this.providerHealth.set(provider, health);
  }

  /**
   * Get current configuration
   */
  getConfiguration(): EnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  async updateConfiguration(newConfig: Partial<EnvironmentConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfiguration();
    
    // Restart health monitoring if interval changed
    if (newConfig.healthCheckInterval) {
      this.startHealthMonitoring();
    }
    
    // Reinitialize circuit breakers if config changed
    if (newConfig.circuitBreakerConfig) {
      this.initializeCircuitBreakers();
    }
  }

  /**
   * Get provider health status
   */
  getProviderHealth(provider?: AIProvider): ProviderHealth | Map<AIProvider, ProviderHealth> {
    if (provider) {
      return this.providerHealth.get(provider) || this.createDefaultHealth(provider);
    }
    return new Map(this.providerHealth);
  }

  /**
   * Get fallback history
   */
  getFallbackHistory(): FallbackEvent[] {
    return [...this.fallbackHistory];
  }

  /**
   * Reset provider health and metrics
   */
  resetProviderHealth(provider?: AIProvider): void {
    if (provider) {
      this.providerHealth.delete(provider);
      const circuitBreaker = this.circuitBreakers.get(provider);
      if (circuitBreaker) {
        // Reset circuit breaker by creating a new one
        const newCircuitBreaker = new CircuitBreaker({
          failureThreshold: this.config.circuitBreakerConfig.failureThreshold,
          resetTimeout: this.config.circuitBreakerConfig.resetTimeout,
          monitor: (state) => {
            this.updateProviderCircuitBreakerState(provider, state);
          }
        });
        this.circuitBreakers.set(provider, newCircuitBreaker);
      }
    } else {
      this.providerHealth.clear();
      this.initializeCircuitBreakers();
    }
  }

  /**
   * Generate environment configuration template
   */
  generateConfigurationTemplate(): string {
    const template = `# Requirements Gathering Agent - Environment Configuration
# Copy this to .env and configure your AI providers

# =============================================================================
# PRIMARY PROVIDER CONFIGURATION
# =============================================================================
# Set your primary AI provider (recommended: google-ai for free tier)
RGA_PRIMARY_PROVIDER=${this.config.primaryProvider}

# =============================================================================
# FALLBACK PROVIDERS CONFIGURATION
# =============================================================================
# Comma-separated list of fallback providers (in order of preference)
RGA_FALLBACK_PROVIDERS=${this.config.fallbackProviders.join(',')}

# =============================================================================
# AUTOMATIC FALLBACK SETTINGS
# =============================================================================
# Enable automatic fallback when primary provider fails
RGA_AUTO_FALLBACK=${this.config.autoFallbackEnabled}

# Health check interval in milliseconds (default: 30000 = 30 seconds)
RGA_HEALTH_CHECK_INTERVAL=${this.config.healthCheckInterval}

# =============================================================================
# PERFORMANCE THRESHOLDS
# =============================================================================
# Maximum acceptable response time in milliseconds
RGA_MAX_RESPONSE_TIME=${this.config.performanceThresholds.maxResponseTime}

# Minimum success rate (0.0 to 1.0, default: 0.95 = 95%)
RGA_MIN_SUCCESS_RATE=${this.config.performanceThresholds.minSuccessRate}

# Maximum error rate (0.0 to 1.0, default: 0.05 = 5%)
RGA_MAX_ERROR_RATE=${this.config.performanceThresholds.maxErrorRate}

# Health check timeout in milliseconds
RGA_HEALTH_CHECK_TIMEOUT=${this.config.performanceThresholds.healthCheckTimeout}

# =============================================================================
# GOOGLE AI STUDIO CONFIGURATION (Recommended - Free Tier)
# =============================================================================
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
GOOGLE_AI_MODEL=gemini-1.5-flash

# =============================================================================
# AZURE OPENAI CONFIGURATION
# =============================================================================
# Azure OpenAI with Entra ID (Recommended for enterprise)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_SECRET=your-client-secret
USE_ENTRA_ID=true
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Azure OpenAI with API Key (Alternative)
# AZURE_OPENAI_API_KEY=your-api-key

# =============================================================================
# GITHUB AI CONFIGURATION
# =============================================================================
# GitHub Models (Free for GitHub users)
GITHUB_TOKEN=your-github-token
GITHUB_ENDPOINT=https://models.github.ai/inference/

# =============================================================================
# OLLAMA CONFIGURATION (Local AI)
# =============================================================================
# Local Ollama instance
OLLAMA_ENDPOINT=http://localhost:11434
REQUIREMENTS_AGENT_MODEL=llama3.1

# =============================================================================
# OUTPUT CONFIGURATION
# =============================================================================
OUTPUT_DIR=./generated-documents

# =============================================================================
# ADVANCED CONFIGURATION
# =============================================================================
# Circuit breaker failure threshold
RGA_CIRCUIT_BREAKER_THRESHOLD=${this.config.circuitBreakerConfig.failureThreshold}

# Circuit breaker reset timeout in milliseconds
RGA_CIRCUIT_BREAKER_RESET_TIMEOUT=${this.config.circuitBreakerConfig.resetTimeout}

# Maximum retry attempts
RGA_MAX_RETRIES=${this.config.retryConfig.maxRetries}

# Base retry delay in milliseconds
RGA_RETRY_BASE_DELAY=${this.config.retryConfig.baseDelay}

# Maximum retry delay in milliseconds
RGA_RETRY_MAX_DELAY=${this.config.retryConfig.maxDelay}
`;
    return template;
  }

  /**
   * Validate current environment configuration
   */
  async validateConfiguration(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check if primary provider is configured
    const primaryProviderConfig = PROVIDER_DEFINITIONS.find(p => p.id === this.config.primaryProvider);
    if (!primaryProviderConfig) {
      errors.push(`Primary provider '${this.config.primaryProvider}' is not supported`);
    } else {
      // Check if primary provider is properly configured
      const isConfigured = await primaryProviderConfig.check();
      if (!isConfigured) {
        errors.push(`Primary provider '${this.config.primaryProvider}' is not properly configured`);
        recommendations.push(`Configure ${this.config.primaryProvider} by setting the required environment variables: ${primaryProviderConfig.requiredEnvVars.join(', ')}`);
      }
    }
    
    // Check fallback providers
    let configuredFallbacks = 0;
    for (const fallbackProvider of this.config.fallbackProviders) {
      const providerConfig = PROVIDER_DEFINITIONS.find(p => p.id === fallbackProvider);
      if (!providerConfig) {
        warnings.push(`Fallback provider '${fallbackProvider}' is not supported`);
        continue;
      }
      
      const isConfigured = await providerConfig.check();
      if (isConfigured) {
        configuredFallbacks++;
      } else {
        warnings.push(`Fallback provider '${fallbackProvider}' is not configured`);
      }
    }
    
    if (configuredFallbacks === 0) {
      warnings.push('No fallback providers are configured - this may impact reliability');
      recommendations.push('Configure at least one fallback provider for better reliability');
    }
    
    // Check performance thresholds
    if (this.config.performanceThresholds.maxResponseTime < 1000) {
      warnings.push('Maximum response time is very low - this may cause frequent fallbacks');
    }
    
    if (this.config.performanceThresholds.minSuccessRate > 0.99) {
      warnings.push('Minimum success rate is very high - this may cause frequent fallbacks');
    }
    
    // Recommendations based on configuration
    if (this.config.primaryProvider !== 'google-ai' && !process.env.GOOGLE_AI_API_KEY) {
      recommendations.push('Consider configuring Google AI Studio as it offers a generous free tier');
    }
    
    if (!this.config.autoFallbackEnabled) {
      recommendations.push('Enable automatic fallback for better reliability');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
}

export default EnvironmentConfigManager;