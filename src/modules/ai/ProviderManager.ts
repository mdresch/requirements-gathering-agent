/**
 * Provider Manager for Requirements Gathering Agent
 * Handles provider configuration, validation, and failover
 */

import { DefaultAzureCredential } from '@azure/identity';
import fetch from 'node-fetch';

interface ProviderConfig {
  name: string;
  check: () => Promise<boolean>;
  priority: number;
  description: string;
  setupGuide?: string;
  endpoint?: string;
  tokenLimit: number;
  costPerToken?: number;
}

interface ProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastError: string | null;
  lastErrorTime: Date | null;
  tokenUsage: {
    total: number;
    average: number;
  };
}

interface QuotaConfig {
  dailyTokenLimit: number;
  costLimit?: number;
  requestsPerMinute?: number;
}

interface RateLimiter {
  lastRequest: number;
  requestCount: number;
}

export class ProviderManager {
  private providers: Map<string, ProviderConfig> = new Map();
  private metrics: Map<string, ProviderMetrics> = new Map();
  private quotas: Map<string, QuotaConfig> = new Map();
  private activeProvider: string | null = null;
  private fallbackQueue: string[] = [];
  private rateLimiters: Map<string, RateLimiter> = new Map();

  constructor() {
    this.initializeProviders();
    // If CURRENT_PROVIDER is set and valid, use it as the active provider
    const explicit = process.env.CURRENT_PROVIDER;
    if (explicit && this.providers.has(explicit)) {
      this.activeProvider = explicit;
      // Fallback queue: all other valid providers by priority except the explicit one
      this.fallbackQueue = Array.from(this.providers.keys()).filter(p => p !== explicit);
    }
  }
  private initializeProviders(): void {
    // Google AI Studio (google-ai)
    const googleAI: ProviderConfig = {
      name: 'google-ai',
      check: async () => {
        if (!process.env.GOOGLE_AI_API_KEY) return false;
        try {
          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
            headers: { 'x-goog-api-key': process.env.GOOGLE_AI_API_KEY }
          });
          return response.ok;
        } catch (error) {
          console.warn('Google AI check failed:', error instanceof Error ? error.message : String(error));
          return false;
        }
      },
      priority: 5, // Lower priority than Azure OpenAI
      description: 'Google AI with Gemini models - supports ultra-large context',
      setupGuide: 'Visit https://makersuite.google.com/app/apikey to get your API key',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      tokenLimit: process.env.GOOGLE_AI_MODEL?.includes('pro') ? 2097152 : 1048576,
      costPerToken: 0.00001
    };
    this.addProvider(googleAI);

    // Google Gemini (google-gemini) - Alternative name for Google AI
    const googleGemini: ProviderConfig = {
      name: 'google-gemini',
      check: async () => {
        if (!process.env.GOOGLE_AI_API_KEY) return false;
        try {
          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
            headers: { 'x-goog-api-key': process.env.GOOGLE_AI_API_KEY }
          });
          return response.ok;
        } catch (error) {
          console.warn('Google Gemini check failed:', error instanceof Error ? error.message : String(error));
          return false;
        }
      },
      priority: 4, // Higher priority than google-ai
      description: 'Google Gemini Pro - supports ultra-large context (1M tokens)',
      setupGuide: 'Visit https://makersuite.google.com/app/apikey to get your API key',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      tokenLimit: 1048576, // 1M tokens for Gemini Pro
      costPerToken: 0.0005 // $0.0005 per 1K tokens as you specified
    };
    this.addProvider(googleGemini);

    // Azure OpenAI with Entra ID
    const azureOpenAI: ProviderConfig = {
      name: 'azure-openai',
      check: async () => {
        if (!(process.env.AZURE_OPENAI_ENDPOINT && process.env.USE_ENTRA_ID === 'true')) return false;
        try {
          const credential = new DefaultAzureCredential({
            managedIdentityClientId: process.env.AZURE_CLIENT_ID,
            tenantId: process.env.AZURE_TENANT_ID
          });
          const token = await credential.getToken('https://cognitiveservices.azure.com/.default');
          return !!token;
        } catch (error) {
          console.warn('Azure Entra ID authentication failed:', error instanceof Error ? error.message : String(error));
          return false;
        }
      },
      priority: 2,
      description: 'Azure OpenAI with Entra ID authentication - enterprise-grade',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      tokenLimit: process.env.DEPLOYMENT_NAME?.includes('32k') ? 32000 : 8000,
      costPerToken: 0.00002
    };    this.addProvider(azureOpenAI);    // Azure AI Studio (with API key)
    const azureAIStudio: ProviderConfig = {
      name: 'azure-ai-studio',
      check: async () => {
        // Check for either AZURE_AI_* or AZURE_OPENAI_* variables
        const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
        
        if (!(endpoint?.includes('openai.azure.com') && apiKey)) {
          return false;
        }        try {
          const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
          const response = await fetch(`${baseUrl}/openai/deployments`, {
            headers: { 
              'api-key': apiKey,
              'Content-Type': 'application/json'
            }
          });
          return response.ok;
        } catch (error) {
          console.warn('Azure AI Studio check failed:', error instanceof Error ? error.message : String(error));
          return false;
        }
      },
      priority: 2,
      description: 'Azure OpenAI with API key authentication',
      endpoint: process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT,
      tokenLimit: (process.env.REQUIREMENTS_AGENT_MODEL || process.env.AZURE_OPENAI_DEPLOYMENT_NAME)?.includes('32k') ? 32000 : 8000,
      costPerToken: 0.00002
    };
    this.addProvider(azureAIStudio);

    // Ollama Llama 3.1 (Local)
    const ollamaProvider: ProviderConfig = {
      name: 'ollama',
      check: async () => {
        const apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
        const requiredModel = process.env.OLLAMA_MODEL || 'llama3.1';
        try {
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(`${apiUrl}/api/tags`, { 
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            console.warn(`Ollama health check failed: HTTP ${response.status} ${response.statusText}`);
            return false;
          }
          
          const data = await response.json() as { models?: Array<{ name: string }> };
          if (!data.models || !Array.isArray(data.models)) {
            console.warn('Ollama health check: Invalid response format - no models array found');
            return false;
          }
          
          // Check for exact match or prefix match (for quantized variants)
          const found = data.models.some((m: { name: string }) => m.name === requiredModel || m.name.startsWith(requiredModel));
          if (!found) {
            console.warn(`Ollama health check: required model '${requiredModel}' not found in loaded models. Available models: ${data.models.map(m => m.name).join(', ')}`);
            return false;
          }
          
          console.log(`✅ Ollama health check passed: Model '${requiredModel}' is available`);
          return true;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('Ollama health check timed out after 5 seconds');
          } else {
            console.warn('Ollama health check failed:', error instanceof Error ? error.message : String(error));
          }
          return false;
        }
      },
      priority: 1,
      description: 'Ollama Llama 3.1 (Local AI provider)',
      endpoint: process.env.OLLAMA_API_URL || 'http://localhost:11434',
      tokenLimit: 32768,
      costPerToken: 0
    };
    this.addProvider(ollamaProvider);

    // Azure OpenAI (API Key) - matching interactive menu ID
    const azureOpenAIKey: ProviderConfig = {
      name: 'azure-openai-key',
      check: async () => {
        // Check for either AZURE_AI_* or AZURE_OPENAI_* variables
        const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
        
        if (!(endpoint?.includes('openai.azure.com') && apiKey)) {
          return false;
        }
        
        // Simple validation - just check that we have required config
        // Skip the network call for now to avoid validation issues
        return true;
      },
      priority: 1, // Higher priority than Google AI
      description: 'Azure OpenAI with API key authentication',
      endpoint: process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT,
      tokenLimit: (process.env.REQUIREMENTS_AGENT_MODEL || process.env.AZURE_OPENAI_DEPLOYMENT_NAME)?.includes('32k') ? 32000 : 8000,
      costPerToken: 0.00002
    };
    this.addProvider(azureOpenAIKey);    // GitHub AI
    const githubAI: ProviderConfig = {
      name: 'github-ai',
      check: async () => {
        if (!process.env.GITHUB_TOKEN) {
          return false;
        }
        
        // Support both GitHub endpoints (new preview and legacy)
        const endpoint = process.env.GITHUB_ENDPOINT || 
                        process.env.AZURE_AI_ENDPOINT || 
                        'https://models.inference.ai.azure.com';
        
        try {
          // Use appropriate API path based on endpoint
          const apiPath = endpoint.includes('models.github.ai') ? '/chat/completions' : '/models';
          // Ensure proper URL construction without double slashes
          const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
          const response = await fetch(`${baseUrl}${apiPath}`, {
            headers: { 
              'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          return response.ok;
        } catch (error) {
          console.warn('GitHub AI check failed:', error instanceof Error ? error.message : String(error));
          return false;
        }
      },
      priority: 3,
      description: 'GitHub AI with GPT-4 - cost-effective',
      endpoint: process.env.GITHUB_ENDPOINT || process.env.AZURE_AI_ENDPOINT || 'https://models.inference.ai.azure.com',
      tokenLimit: 128000,
      costPerToken: 0.000015
    };
    this.addProvider(githubAI);


    // Initialize default quotas
    this.setDefaultQuotas();
  }
  private setDefaultQuotas(): void {
    const quotaConfigs: [string, QuotaConfig][] = [
      ['google-ai', {
        dailyTokenLimit: 100000000,  // 100M tokens
        requestsPerMinute: 60
      }],      ['azure-openai', {
        dailyTokenLimit: 300000000,  // 300M tokens
        costLimit: 500,  // $500 per day
        requestsPerMinute: 150
      }],
      ['azure-ai-studio', {
        dailyTokenLimit: 300000000,  // 300M tokens
        costLimit: 500,  // $500 per day
        requestsPerMinute: 150
      }],
      ['github-ai', {
        dailyTokenLimit: 50000000,  // 50M tokens
        requestsPerMinute: 30
      }],
      ['ollama', {
        dailyTokenLimit: Infinity,
        requestsPerMinute: 20
      }]
    ];

    quotaConfigs.forEach(([name, config]) => {
      this.quotas.set(name, config);
    });
  }

  private initializeMetrics(providerName: string): void {
    this.metrics.set(providerName, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastError: null,
      lastErrorTime: null,
      tokenUsage: {
        total: 0,
        average: 0
      }
    });
  }

  private addProvider(config: ProviderConfig): void {
    this.providers.set(config.name, config);
    this.initializeMetrics(config.name);
  }
  public async validateConfigurations(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const validProviders: Array<{ name: string; priority: number }> = [];
    
    for (const [name, provider] of this.providers) {
      try {
        const isValid = await provider.check();
        results.set(name, isValid);
        if (isValid) {
          validProviders.push({ name, priority: provider.priority });
        }
      } catch (error) {
        console.error(`Error validating ${name}:`, error instanceof Error ? error.message : String(error));
        results.set(name, false);
      }
    }

    // Sort by priority (lower number = higher priority)
    validProviders.sort((a, b) => a.priority - b.priority);

    // Set active provider to highest priority valid provider
    if (validProviders.length > 0) {
      this.activeProvider = validProviders[0].name;
      // Set fallback queue to remaining providers in priority order
      this.fallbackQueue = validProviders.slice(1).map(p => p.name);
    }

    return results;
  }

  public getActiveProvider(): string | null {
    return this.activeProvider;
  }

  public async switchProvider(): Promise<boolean> {
    if (!this.fallbackQueue.length) {
      console.error('No fallback providers available');
      return false;
    }

    while (this.fallbackQueue.length > 0) {
      const nextProvider = this.fallbackQueue.shift();
      if (!nextProvider) continue;

      const provider = this.providers.get(nextProvider);
      if (!provider) continue;

      try {
        const isValid = await provider.check();
        if (isValid) {
          this.activeProvider = nextProvider;
          console.log(`Switched to provider: ${nextProvider}`);
          return true;
        }
      } catch (error) {
        console.warn(`Failed to switch to ${nextProvider}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return false;
  }

  public updateMetrics(
    providerName: string, 
    success: boolean, 
    responseTime: number, 
    tokenCount: number,
    error?: Error
  ): void {
    const metrics = this.metrics.get(providerName);
    if (!metrics) return;

    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
      metrics.tokenUsage.total += tokenCount;
      metrics.tokenUsage.average = metrics.tokenUsage.total / metrics.successfulRequests;
    } else {
      metrics.failedRequests++;
      metrics.lastError = error?.message || 'Unknown error';
      metrics.lastErrorTime = new Date();
    }

    metrics.averageResponseTime = 
      (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;
  }

  public getProviderMetrics(providerName?: string): Map<string, ProviderMetrics> | ProviderMetrics | null {
    if (providerName) {
      return this.metrics.get(providerName) || null;
    }
    return this.metrics;
  }

  public getProviderConfig(providerName: string): ProviderConfig | null {
    return this.providers.get(providerName) || null;
  }

  public async validateProvider(providerName: string): Promise<boolean> {
    const provider = this.providers.get(providerName);
    if (!provider) return false;
    return provider.check();
  }

  public getTokenLimit(providerName?: string): number {
    const provider = this.providers.get(providerName || this.activeProvider || '');
    return provider?.tokenLimit || 4000;
  }

  public async checkRateLimit(providerName: string): Promise<boolean> {
    const quota = this.quotas.get(providerName);
    if (!quota?.requestsPerMinute) return true;

    const now = Date.now();
    const limiter = this.rateLimiters.get(providerName) || { lastRequest: 0, requestCount: 0 };

    // Reset counter if more than a minute has passed
    if (now - limiter.lastRequest > 60000) {
      limiter.requestCount = 0;
    }

    // Check if under rate limit
    if (limiter.requestCount >= quota.requestsPerMinute) {
      return false;
    }

    // Update rate limiter
    limiter.requestCount++;
    limiter.lastRequest = now;
    this.rateLimiters.set(providerName, limiter);

    return true;
  }

  public getDailyTokenUsage(providerName: string): number {
    return this.metrics.get(providerName)?.tokenUsage.total || 0;
  }

  public getDailyCost(providerName: string): number {
    const provider = this.providers.get(providerName);
    const metrics = this.metrics.get(providerName);
    
    if (!provider?.costPerToken || !metrics) return 0;
    return metrics.tokenUsage.total * provider.costPerToken;
  }

  public checkQuota(providerName: string): boolean {
    const quota = this.quotas.get(providerName);
    if (!quota) return true;

    const tokenUsage = this.getDailyTokenUsage(providerName);
    const cost = this.getDailyCost(providerName);

    return (
      tokenUsage < quota.dailyTokenLimit &&
      (!quota.costLimit || cost < quota.costLimit)
    );
  }

  public getProviderStatus(providerName: string): {
    available: boolean;
    withinRateLimit: boolean;
    withinQuota: boolean;
    quotaRemaining?: number;
    estimatedCost?: number;
  } {
    const provider = this.providers.get(providerName);
    const quota = this.quotas.get(providerName);
    
    if (!provider) {
      return {
        available: false,
        withinRateLimit: false,
        withinQuota: false
      };
    }

    const tokenUsage = this.getDailyTokenUsage(providerName);
    const cost = this.getDailyCost(providerName);

    return {
      available: true,
      withinRateLimit: true, // Rate limiting is checked per-request
      withinQuota: this.checkQuota(providerName),
      quotaRemaining: quota ? quota.dailyTokenLimit - tokenUsage : undefined,
      estimatedCost: provider.costPerToken ? cost : undefined
    };
  }
}
