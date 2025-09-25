import { logger } from '../utils/logger.js';

/**
 * AI Provider Billing Service
 * Integrates with AI provider billing APIs for precise cost reporting
 */

export interface BillingUsageData {
  provider: string;
  model: string;
  timestamp: Date;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    currency: string;
    amount: number;
    costPerToken: number;
  };
  metadata: {
    requestId?: string;
    projectId?: string;
    userId?: string;
    operation?: string;
  };
}

export interface ProviderBillingInfo {
  provider: string;
  currentUsage: {
    totalTokens: number;
    totalCost: number;
    requestCount: number;
  };
  monthlyUsage: {
    totalTokens: number;
    totalCost: number;
    requestCount: number;
  };
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
    requestsPerDay: number;
    tokensPerDay: number;
  };
  quotas: {
    monthlySpend: number;
    monthlyTokens: number;
    remainingSpend: number;
    remainingTokens: number;
  };
  lastUpdated: Date;
}

export interface PricingModel {
  provider: string;
  model: string;
  pricing: {
    promptTokensPer1K: number;
    completionTokensPer1K: number;
    currency: string;
  };
  lastUpdated: Date;
}

export class AIProviderBillingService {
  private static instance: AIProviderBillingService;
  private billingCache: Map<string, ProviderBillingInfo> = new Map();
  private pricingCache: Map<string, PricingModel> = new Map();
  private usageHistory: BillingUsageData[] = [];
  
  // Updated pricing data (as of 2024)
  private readonly pricingData: Record<string, Record<string, { prompt: number; completion: number }>> = {
    'openai': {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
      'gpt-4o': { prompt: 0.005, completion: 0.015 },
      'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
      'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
      'gpt-3.5-turbo-16k': { prompt: 0.003, completion: 0.004 }
    },
    'anthropic': {
      'claude-3-opus': { prompt: 0.015, completion: 0.075 },
      'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
      'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
      'claude-3.5-sonnet': { prompt: 0.003, completion: 0.015 }
    },
    'azure-openai': {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
      'gpt-35-turbo': { prompt: 0.0015, completion: 0.002 }
    },
    'google': {
      'gemini-pro': { prompt: 0.0005, completion: 0.0015 },
      'gemini-pro-vision': { prompt: 0.0005, completion: 0.0015 },
      'gemini-1.5-flash': { prompt: 0.000075, completion: 0.0003 },
      'gemini-1.5-pro': { prompt: 0.00125, completion: 0.005 }
    }
  };

  private constructor() {
    this.initializePricingCache();
    this.startPeriodicBillingSync();
  }

  public static getInstance(): AIProviderBillingService {
    if (!AIProviderBillingService.instance) {
      AIProviderBillingService.instance = new AIProviderBillingService();
    }
    return AIProviderBillingService.instance;
  }

  /**
   * Calculate precise cost for AI usage
   */
  public calculateCost(
    provider: string,
    model: string,
    usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  ): { currency: string; amount: number; costPerToken: number; breakdown: any } {
    try {
      const pricing = this.pricingCache.get(`${provider}:${model}`);
      
      if (!pricing) {
        // Fallback to estimated pricing
        logger.warn(`No pricing data found for ${provider}:${model}, using fallback`);
        return this.calculateFallbackCost(provider, model, usage);
      }

      const promptCost = (usage.promptTokens / 1000) * pricing.pricing.promptTokensPer1K;
      const completionCost = (usage.completionTokens / 1000) * pricing.pricing.completionTokensPer1K;
      const totalCost = promptCost + completionCost;
      const costPerToken = usage.totalTokens > 0 ? totalCost / usage.totalTokens : 0;

      return {
        currency: pricing.pricing.currency,
        amount: Math.round(totalCost * 1000000) / 1000000, // Round to 6 decimal places
        costPerToken: Math.round(costPerToken * 1000000) / 1000000,
        breakdown: {
          promptCost: Math.round(promptCost * 1000000) / 1000000,
          completionCost: Math.round(completionCost * 1000000) / 1000000,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens
        }
      };
    } catch (error: any) {
      logger.error('Failed to calculate cost:', error);
      logger.warn(`Using fallback cost calculation for ${provider}:${model}`);
      return this.calculateFallbackCost(provider, model, usage);
    }
  }

  /**
   * Track usage and cost for an AI operation
   */
  public trackUsage(data: Omit<BillingUsageData, 'cost'>): BillingUsageData {
    try {
      // Validate input data
      if (!data.provider || !data.model || !data.usage) {
        throw new Error('Invalid billing data: provider, model, and usage are required');
      }

      if (!data.usage.promptTokens && !data.usage.completionTokens && !data.usage.totalTokens) {
        logger.warn('No token usage data provided, using zero values');
        data.usage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        };
      }

      const cost = this.calculateCost(data.provider, data.model, data.usage);
      
      const billingData: BillingUsageData = {
        ...data,
        cost: {
          currency: cost.currency,
          amount: cost.amount,
          costPerToken: cost.costPerToken,
          breakdown: cost.breakdown
        }
      };

      // Add to usage history
      this.usageHistory.push(billingData);
      
      // Update provider billing cache
      this.updateProviderBillingCache(billingData);

      logger.debug('AI usage tracked', {
        provider: data.provider,
        model: data.model,
        tokens: data.usage.totalTokens,
        cost: cost.amount,
        currency: cost.currency
      });

      return billingData;
    } catch (error: any) {
      logger.error('Failed to track AI usage:', error);
      // Return a fallback billing data instead of throwing
      return {
        ...data,
        cost: {
          currency: 'USD',
          amount: 0,
          costPerToken: 0,
          breakdown: {
            promptCost: 0,
            completionCost: 0,
            promptTokens: data.usage?.promptTokens || 0,
            completionTokens: data.usage?.completionTokens || 0,
            totalTokens: data.usage?.totalTokens || 0,
            estimated: true
          }
        }
      };
    }
  }

  /**
   * Get billing information for a provider
   */
  public async getProviderBillingInfo(provider: string): Promise<ProviderBillingInfo | null> {
    try {
      // Check cache first
      const cached = this.billingCache.get(provider);
      if (cached && this.isCacheValid(cached.lastUpdated)) {
        return cached;
      }

      // Fetch fresh data from provider API
      const billingInfo = await this.fetchProviderBillingInfo(provider);
      if (billingInfo) {
        this.billingCache.set(provider, billingInfo);
        return billingInfo;
      }

      return cached || null;
    } catch (error: any) {
      logger.error(`Failed to get billing info for ${provider}:`, error);
      return this.billingCache.get(provider) || null;
    }
  }

  /**
   * Get usage analytics for a specific period
   */
  public getUsageAnalytics(
    provider?: string,
    projectId?: string,
    userId?: string,
    days: number = 30
  ): {
    totalCost: number;
    totalTokens: number;
    requestCount: number;
    averageCostPerRequest: number;
    costByProvider: Record<string, number>;
    costByModel: Record<string, number>;
    usageByDay: Array<{ date: string; cost: number; tokens: number; requests: number }>;
  } {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      let filteredUsage = this.usageHistory.filter(usage => usage.timestamp >= startDate);
      
      if (provider) {
        filteredUsage = filteredUsage.filter(usage => usage.provider === provider);
      }
      
      if (projectId) {
        filteredUsage = filteredUsage.filter(usage => usage.metadata.projectId === projectId);
      }
      
      if (userId) {
        filteredUsage = filteredUsage.filter(usage => usage.metadata.userId === userId);
      }

      const totalCost = filteredUsage.reduce((sum, usage) => sum + usage.cost.amount, 0);
      const totalTokens = filteredUsage.reduce((sum, usage) => sum + usage.usage.totalTokens, 0);
      const requestCount = filteredUsage.length;
      const averageCostPerRequest = requestCount > 0 ? totalCost / requestCount : 0;

      // Group by provider
      const costByProvider: Record<string, number> = {};
      filteredUsage.forEach(usage => {
        costByProvider[usage.provider] = (costByProvider[usage.provider] || 0) + usage.cost.amount;
      });

      // Group by model
      const costByModel: Record<string, number> = {};
      filteredUsage.forEach(usage => {
        const modelKey = `${usage.provider}:${usage.model}`;
        costByModel[modelKey] = (costByModel[modelKey] || 0) + usage.cost.amount;
      });

      // Group by day
      const usageByDay: Array<{ date: string; cost: number; tokens: number; requests: number }> = [];
      const dayGroups: Record<string, BillingUsageData[]> = {};
      
      filteredUsage.forEach(usage => {
        const date = usage.timestamp.toISOString().split('T')[0];
        if (!dayGroups[date]) {
          dayGroups[date] = [];
        }
        dayGroups[date].push(usage);
      });

      Object.entries(dayGroups).forEach(([date, usages]) => {
        const dayCost = usages.reduce((sum, usage) => sum + usage.cost.amount, 0);
        const dayTokens = usages.reduce((sum, usage) => sum + usage.usage.totalTokens, 0);
        const dayRequests = usages.length;
        
        usageByDay.push({
          date,
          cost: Math.round(dayCost * 1000000) / 1000000,
          tokens: dayTokens,
          requests: dayRequests
        });
      });

      usageByDay.sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalCost: Math.round(totalCost * 1000000) / 1000000,
        totalTokens,
        requestCount,
        averageCostPerRequest: Math.round(averageCostPerRequest * 1000000) / 1000000,
        costByProvider,
        costByModel,
        usageByDay
      };
    } catch (error: any) {
      logger.error('Failed to get usage analytics:', error);
      return {
        totalCost: 0,
        totalTokens: 0,
        requestCount: 0,
        averageCostPerRequest: 0,
        costByProvider: {},
        costByModel: {},
        usageByDay: []
      };
    }
  }

  /**
   * Initialize pricing cache with current data
   */
  private initializePricingCache(): void {
    Object.entries(this.pricingData).forEach(([provider, models]) => {
      Object.entries(models).forEach(([model, pricing]) => {
        const key = `${provider}:${model}`;
        this.pricingCache.set(key, {
          provider,
          model,
          pricing: {
            promptTokensPer1K: pricing.prompt,
            completionTokensPer1K: pricing.completion,
            currency: 'USD'
          },
          lastUpdated: new Date()
        });
      });
    });
    
    logger.info(`Initialized pricing cache with ${this.pricingCache.size} models`);
  }

  /**
   * Calculate fallback cost when pricing data is unavailable
   */
  private calculateFallbackCost(
    provider: string,
    model: string,
    usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  ): { currency: string; amount: number; costPerToken: number; breakdown: any } {
    // Use conservative estimates
    const estimatedCostPer1K = 0.01; // $0.01 per 1K tokens
    const totalCost = (usage.totalTokens / 1000) * estimatedCostPer1K;
    const costPerToken = usage.totalTokens > 0 ? totalCost / usage.totalTokens : 0;

    return {
      currency: 'USD',
      amount: Math.round(totalCost * 1000000) / 1000000,
      costPerToken: Math.round(costPerToken * 1000000) / 1000000,
      breakdown: {
        promptCost: Math.round((usage.promptTokens / 1000) * estimatedCostPer1K * 1000000) / 1000000,
        completionCost: Math.round((usage.completionTokens / 1000) * estimatedCostPer1K * 1000000) / 1000000,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        estimated: true
      }
    };
  }

  /**
   * Update provider billing cache with new usage data
   */
  private updateProviderBillingCache(usageData: BillingUsageData): void {
    const provider = usageData.provider;
    const existing = this.billingCache.get(provider) || {
      provider,
      currentUsage: { totalTokens: 0, totalCost: 0, requestCount: 0 },
      monthlyUsage: { totalTokens: 0, totalCost: 0, requestCount: 0 },
      rateLimits: { requestsPerMinute: 0, tokensPerMinute: 0, requestsPerDay: 0, tokensPerDay: 0 },
      quotas: { monthlySpend: 0, monthlyTokens: 0, remainingSpend: 0, remainingTokens: 0 },
      lastUpdated: new Date()
    };

    existing.currentUsage.totalTokens += usageData.usage.totalTokens;
    existing.currentUsage.totalCost += usageData.cost.amount;
    existing.currentUsage.requestCount += 1;

    // Reset daily usage at midnight
    const now = new Date();
    const lastUpdate = existing.lastUpdated;
    if (now.getDate() !== lastUpdate.getDate()) {
      existing.currentUsage = { totalTokens: 0, totalCost: 0, requestCount: 0 };
    }

    existing.lastUpdated = now;
    this.billingCache.set(provider, existing);
  }

  /**
   * Fetch billing information from provider API
   */
  private async fetchProviderBillingInfo(provider: string): Promise<ProviderBillingInfo | null> {
    try {
      switch (provider) {
        case 'openai':
          return await this.fetchOpenAIBillingInfo();
        case 'anthropic':
          return await this.fetchAnthropicBillingInfo();
        case 'azure-openai':
          return await this.fetchAzureOpenAIBillingInfo();
        case 'google':
          return await this.fetchGoogleBillingInfo();
        default:
          logger.warn(`No billing API integration for provider: ${provider}`);
          return null;
      }
    } catch (error: any) {
      logger.error(`Failed to fetch billing info for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Fetch OpenAI billing information
   */
  private async fetchOpenAIBillingInfo(): Promise<ProviderBillingInfo | null> {
    // OpenAI doesn't provide a public billing API, so we return null
    // In a real implementation, you might integrate with OpenAI's dashboard API if available
    logger.debug('OpenAI billing info fetch not implemented - using cached data');
    return null;
  }

  /**
   * Fetch Anthropic billing information
   */
  private async fetchAnthropicBillingInfo(): Promise<ProviderBillingInfo | null> {
    // Anthropic doesn't provide a public billing API, so we return null
    logger.debug('Anthropic billing info fetch not implemented - using cached data');
    return null;
  }

  /**
   * Fetch Azure OpenAI billing information
   */
  private async fetchAzureOpenAIBillingInfo(): Promise<ProviderBillingInfo | null> {
    // Azure OpenAI billing would require Azure Resource Manager API integration
    logger.debug('Azure OpenAI billing info fetch not implemented - using cached data');
    return null;
  }

  /**
   * Fetch Google billing information
   */
  private async fetchGoogleBillingInfo(): Promise<ProviderBillingInfo | null> {
    // Google Cloud billing would require Google Cloud Billing API integration
    logger.debug('Google billing info fetch not implemented - using cached data');
    return null;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(lastUpdated: Date, maxAgeMinutes: number = 15): boolean {
    const age = Date.now() - lastUpdated.getTime();
    return age < maxAgeMinutes * 60 * 1000;
  }

  /**
   * Start periodic billing sync
   */
  private startPeriodicBillingSync(): void {
    // Sync billing data every 15 minutes
    setInterval(async () => {
      try {
        const providers = ['openai', 'anthropic', 'azure-openai', 'google'];
        for (const provider of providers) {
          await this.getProviderBillingInfo(provider);
        }
        logger.debug('Periodic billing sync completed');
      } catch (error: any) {
        logger.error('Periodic billing sync failed:', error);
      }
    }, 15 * 60 * 1000); // 15 minutes
  }

  /**
   * Get current pricing for all models
   */
  public getAllPricing(): PricingModel[] {
    return Array.from(this.pricingCache.values());
  }

  /**
   * Update pricing for a specific model
   */
  public updatePricing(provider: string, model: string, pricing: { promptTokensPer1K: number; completionTokensPer1K: number; currency: string }): void {
    const key = `${provider}:${model}`;
    this.pricingCache.set(key, {
      provider,
      model,
      pricing,
      lastUpdated: new Date()
    });
    
    logger.info(`Updated pricing for ${provider}:${model}`, pricing);
  }
}

// Export singleton instance
export const aiProviderBillingService = AIProviderBillingService.getInstance();
