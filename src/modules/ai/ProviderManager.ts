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
  }
  private initializeProviders(): void {
    // Google AI Studio
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
      priority: 1,
      description: 'Google AI with Gemini models - supports ultra-large context',
      setupGuide: 'Visit https://makersuite.google.com/app/apikey to get your API key',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      tokenLimit: process.env.GOOGLE_AI_MODEL?.includes('pro') ? 2097152 : 1048576,
      costPerToken: 0.00001
    };
    this.addProvider(googleAI);

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
    };    this.addProvider(azureOpenAI);

    // Azure AI Studio (with API key)
    const azureAIStudio: ProviderConfig = {
      name: 'azure-ai-studio',
      check: async () => {
        if (!(process.env.AZURE_AI_ENDPOINT?.includes('openai.azure.com') && process.env.AZURE_AI_API_KEY)) {
          return false;
        }
        try {
          const response = await fetch(`${process.env.AZURE_AI_ENDPOINT}/openai/deployments`, {
            headers: { 
              'api-key': process.env.AZURE_AI_API_KEY,
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
      endpoint: process.env.AZURE_AI_ENDPOINT,
      tokenLimit: process.env.REQUIREMENTS_AGENT_MODEL?.includes('32k') ? 32000 : 8000,
      costPerToken: 0.00002
    };
    this.addProvider(azureAIStudio);

    // GitHub AI
    const githubAI: ProviderConfig = {
      name: 'github-ai',
      check: async () => {
        if (!process.env.GITHUB_TOKEN || 
            !process.env.AZURE_AI_ENDPOINT?.includes('models.inference.ai.azure.com')) {
          return false;
        }
        try {
          const response = await fetch('https://models.inference.ai.azure.com/api/healthz', {
            headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
          });
          return response.ok;
        } catch (error) {
          console.warn('GitHub AI check failed:', error instanceof Error ? error.message : String(error));
          return false;
        }
      },
      priority: 3,
      description: 'GitHub AI with GPT-4 - cost-effective',
      endpoint: 'https://models.inference.ai.azure.com',
      tokenLimit: 128000,
      costPerToken: 0.000015
    };
    this.addProvider(githubAI);

    // Ollama (Local)
    const ollama: ProviderConfig = {
      name: 'ollama',
      check: async () => {
        const endpoint = process.env.AZURE_AI_ENDPOINT || 'http://localhost:11434';
        if (!endpoint.includes('localhost:11434') && !endpoint.includes('127.0.0.1:11434')) {
          return false;
        }
        try {
          const response = await fetch(`${endpoint}/api/tags`);
          return response.ok;
        } catch (error) {
          console.warn('Ollama service not running:', error instanceof Error ? error.message : String(error));
          return false;
        }
      },
      priority: 4,
      description: 'Local AI models with Ollama - offline capable',
      endpoint: process.env.AZURE_AI_ENDPOINT || 'http://localhost:11434',
      tokenLimit: 131072
    };
    this.addProvider(ollama);

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
    
    for (const [name, provider] of this.providers) {
      try {
        const isValid = await provider.check();
        results.set(name, isValid);
        if (isValid && !this.activeProvider) {
          this.activeProvider = name;
        } else if (isValid) {
          this.fallbackQueue.push(name);
        }
      } catch (error) {
        console.error(`Error validating ${name}:`, error instanceof Error ? error.message : String(error));
        results.set(name, false);
      }
    }

    this.fallbackQueue.sort((a, b) => {
      const priorityA = this.providers.get(a)?.priority || 99;
      const priorityB = this.providers.get(b)?.priority || 99;
      return priorityA - priorityB;
    });

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
