/**
 * Enhanced Provider Fallback Manager
 * 
 * Implements intelligent automatic fallback mechanisms for AI providers
 * to maximize uptime and performance through seamless provider switching.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * 
 * Key Features:
 * - Automatic provider fallback on failures
 * - Health monitoring and recovery
 * - Performance-based provider selection
 * - Circuit breaker integration
 * - Configurable fallback strategies
 * 
 * @filepath src/modules/ai/ProviderFallbackManager.ts
 */

import { AIProvider, ProviderMetrics } from './types.js';
import { RetryManager } from './RetryManager.js';
import { ProviderManager } from './ProviderManager.js';
import { AIClientManager } from './AIClientManager.js';

export interface FallbackConfig {
    enabled: boolean;
    fallbackOrder: AIProvider[];
    healthCheckInterval: number;
    healthCheckTimeout: number;
    maxConsecutiveFailures: number;
    recoveryCheckInterval: number;
    performanceThreshold: {
        maxResponseTime: number;
        minSuccessRate: number;
    };
}

export interface ProviderHealth {
    provider: AIProvider;
    isHealthy: boolean;
    lastHealthCheck: Date;
    consecutiveFailures: number;
    averageResponseTime: number;
    successRate: number;
    lastError?: string;
}

export interface FallbackEvent {
    timestamp: Date;
    fromProvider: AIProvider;
    toProvider: AIProvider;
    reason: string;
    success: boolean;
}

export class ProviderFallbackManager {
    private static instance: ProviderFallbackManager;
    private config: FallbackConfig;
    private providerHealth: Map<AIProvider, ProviderHealth> = new Map();
    private currentProvider: AIProvider | null = null;
    private fallbackHistory: FallbackEvent[] = [];
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private retryManager: RetryManager;
    private providerManager: ProviderManager;
    private clientManager: AIClientManager;

    private readonly DEFAULT_CONFIG: FallbackConfig = {
        enabled: process.env.ENABLE_PROVIDER_FALLBACK === 'true',
        fallbackOrder: this.parseFallbackOrder(),
        healthCheckInterval: parseInt(process.env.PROVIDER_HEALTH_CHECK_INTERVAL || '300000'),
        healthCheckTimeout: parseInt(process.env.PROVIDER_HEALTH_CHECK_TIMEOUT || '10000'),
        maxConsecutiveFailures: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5'),
        recoveryCheckInterval: parseInt(process.env.CIRCUIT_BREAKER_RECOVERY_TIME || '60000'),
        performanceThreshold: {
            maxResponseTime: parseInt(process.env.MAX_RESPONSE_TIME || '30000'),
            minSuccessRate: parseFloat(process.env.MIN_SUCCESS_RATE || '0.8')
        }
    };

    private constructor() {
        this.config = this.DEFAULT_CONFIG;
        this.retryManager = RetryManager.getInstance();
        this.providerManager = new ProviderManager();
        this.clientManager = AIClientManager.getInstance();
        this.initializeHealthMonitoring();
    }

    public static getInstance(): ProviderFallbackManager {
        if (!ProviderFallbackManager.instance) {
            ProviderFallbackManager.instance = new ProviderFallbackManager();
        }
        return ProviderFallbackManager.instance;
    }

    /**
     * Initialize health monitoring for all configured providers
     */
    private async initializeHealthMonitoring(): Promise<void> {
        if (!this.config.enabled) {
            console.log('🔄 Provider fallback is disabled');
            return;
        }

        console.log('🔄 Initializing provider health monitoring...');
        
        // Initialize health status for all providers
        for (const provider of this.config.fallbackOrder) {
            this.providerHealth.set(provider, {
                provider,
                isHealthy: false,
                lastHealthCheck: new Date(),
                consecutiveFailures: 0,
                averageResponseTime: 0,
                successRate: 1.0,
                lastError: undefined
            });
        }

        // Perform initial health check
        await this.performHealthCheck();

        // Set up periodic health checks
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        
        this.healthCheckInterval = setInterval(
            () => this.performHealthCheck(),
            this.config.healthCheckInterval
        );

        console.log(`✅ Health monitoring initialized with ${this.config.healthCheckInterval}ms interval`);
    }

    /**
     * Get the best available provider based on health and performance
     */
    public async getBestProvider(): Promise<AIProvider | null> {
        if (!this.config.enabled) {
            return this.getCurrentProviderFromConfig();
        }

        // If current provider is healthy, keep using it
        if (this.currentProvider && this.isProviderHealthy(this.currentProvider)) {
            return this.currentProvider;
        }

        // Find the best healthy provider from fallback order
        for (const provider of this.config.fallbackOrder) {
            if (this.isProviderHealthy(provider) && await this.isProviderConfigured(provider)) {
                if (this.currentProvider !== provider) {
                    await this.switchToProvider(provider, 'health_check');
                }
                return provider;
            }
        }

        // If no healthy provider found, try the first configured one
        for (const provider of this.config.fallbackOrder) {
            if (await this.isProviderConfigured(provider)) {
                console.warn(`⚠️ No healthy providers found, attempting to use ${provider}`);
                if (this.currentProvider !== provider) {
                    await this.switchToProvider(provider, 'last_resort');
                }
                return provider;
            }
        }

        console.error('❌ No configured providers available');
        return null;
    }

    /**
     * Handle provider failure and attempt fallback
     */
    public async handleProviderFailure(
        failedProvider: AIProvider, 
        error: Error
    ): Promise<AIProvider | null> {
        console.warn(`⚠️ Provider ${failedProvider} failed: ${error.message}`);
        
        // Update health status
        const health = this.providerHealth.get(failedProvider);
        if (health) {
            health.consecutiveFailures++;
            health.lastError = error.message;
            health.isHealthy = health.consecutiveFailures < this.config.maxConsecutiveFailures;
            health.lastHealthCheck = new Date();
        }

        if (!this.config.enabled) {
            return null;
        }

        // Find next available provider
        const nextProvider = await this.findNextProvider(failedProvider);
        if (nextProvider) {
            await this.switchToProvider(nextProvider, `fallback_from_${failedProvider}`);
            return nextProvider;
        }

        return null;
    }

    /**
     * Execute operation with automatic fallback
     */
    public async executeWithFallback<T>(
        operation: (provider: AIProvider) => Promise<T>,
        operationName: string = 'AI_Operation'
    ): Promise<T> {
        const startTime = Date.now();
        let lastError: Error | null = null;

        // Try each provider in order
        for (const provider of this.config.fallbackOrder) {
            if (!await this.isProviderConfigured(provider)) {
                continue;
            }

            if (!this.isProviderHealthy(provider)) {
                console.log(`⏭️ Skipping unhealthy provider: ${provider}`);
                continue;
            }

            try {
                console.log(`🔄 Attempting ${operationName} with provider: ${provider}`);
                
                const result = await this.retryManager.executeWithRetry(
                    () => operation(provider),
                    operationName,
                    provider
                );

                // Update success metrics
                this.updateProviderMetrics(provider, Date.now() - startTime, true);
                
                // Set as current provider if successful
                if (this.currentProvider !== provider) {
                    this.currentProvider = provider;
                }

                console.log(`✅ ${operationName} succeeded with provider: ${provider}`);
                return result;

            } catch (error: any) {
                lastError = error;
                console.warn(`❌ ${operationName} failed with provider ${provider}: ${error.message}`);
                
                // Update failure metrics
                this.updateProviderMetrics(provider, Date.now() - startTime, false);
                
                // Handle the failure
                await this.handleProviderFailure(provider, error);
            }
        }

        // All providers failed
        const errorMessage = `All providers failed for ${operationName}. Last error: ${lastError?.message}`;
        console.error(`💥 ${errorMessage}`);
        throw new Error(errorMessage);
    }

    /**
     * Perform health check on all providers
     */
    private async performHealthCheck(): Promise<void> {
        console.log('🔍 Performing provider health check...');
        
        const healthPromises = this.config.fallbackOrder.map(async (provider) => {
            if (!await this.isProviderConfigured(provider)) {
                return;
            }

            try {
                const startTime = Date.now();
                
                // Attempt a simple health check operation
                await this.clientManager.refreshConnection(provider);
                
                const responseTime = Date.now() - startTime;
                
                // Update health status
                const health = this.providerHealth.get(provider);
                if (health) {
                    health.isHealthy = true;
                    health.consecutiveFailures = 0;
                    health.lastHealthCheck = new Date();
                    health.averageResponseTime = (health.averageResponseTime + responseTime) / 2;
                    health.lastError = undefined;
                }

                console.log(`✅ Provider ${provider} is healthy (${responseTime}ms)`);

            } catch (error: any) {
                const health = this.providerHealth.get(provider);
                if (health) {
                    health.consecutiveFailures++;
                    health.isHealthy = health.consecutiveFailures < this.config.maxConsecutiveFailures;
                    health.lastHealthCheck = new Date();
                    health.lastError = error.message;
                }

                console.warn(`⚠️ Provider ${provider} health check failed: ${error.message}`);
            }
        });

        await Promise.allSettled(healthPromises);
    }

    /**
     * Switch to a different provider
     */
    private async switchToProvider(provider: AIProvider, reason: string): Promise<void> {
        const previousProvider = this.currentProvider;
        
        try {
            // Initialize the new provider
            await this.clientManager.initializeSpecificProvider(provider);
            
            this.currentProvider = provider;
            
            // Log the switch
            const event: FallbackEvent = {
                timestamp: new Date(),
                fromProvider: previousProvider || 'none' as AIProvider,
                toProvider: provider,
                reason,
                success: true
            };
            
            this.fallbackHistory.push(event);
            
            // Keep only last 100 events
            if (this.fallbackHistory.length > 100) {
                this.fallbackHistory = this.fallbackHistory.slice(-100);
            }

            console.log(`🔄 Switched to provider: ${provider} (reason: ${reason})`);
            
            if (process.env.LOG_PROVIDER_SWITCHES === 'true') {
                console.log(`📊 Provider switch: ${previousProvider || 'none'} → ${provider}`);
            }

        } catch (error: any) {
            const event: FallbackEvent = {
                timestamp: new Date(),
                fromProvider: previousProvider || 'none' as AIProvider,
                toProvider: provider,
                reason,
                success: false
            };
            
            this.fallbackHistory.push(event);
            
            console.error(`❌ Failed to switch to provider ${provider}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Find the next available provider after a failure
     */
    private async findNextProvider(failedProvider: AIProvider): Promise<AIProvider | null> {
        const currentIndex = this.config.fallbackOrder.indexOf(failedProvider);
        
        // Try providers after the failed one
        for (let i = currentIndex + 1; i < this.config.fallbackOrder.length; i++) {
            const provider = this.config.fallbackOrder[i];
            if (this.isProviderHealthy(provider) && await this.isProviderConfigured(provider)) {
                return provider;
            }
        }

        // Try providers before the failed one
        for (let i = 0; i < currentIndex; i++) {
            const provider = this.config.fallbackOrder[i];
            if (this.isProviderHealthy(provider) && await this.isProviderConfigured(provider)) {
                return provider;
            }
        }

        return null;
    }

    /**
     * Check if a provider is healthy
     */
    private isProviderHealthy(provider: AIProvider): boolean {
        const health = this.providerHealth.get(provider);
        if (!health) return false;

        return health.isHealthy && 
               health.successRate >= this.config.performanceThreshold.minSuccessRate &&
               health.averageResponseTime <= this.config.performanceThreshold.maxResponseTime;
    }

    /**
     * Check if a provider is configured
     */
    private async isProviderConfigured(provider: AIProvider): Promise<boolean> {
        return await this.providerManager.validateProvider(provider);
    }

    /**
     * Update provider performance metrics
     */
    private updateProviderMetrics(provider: AIProvider, responseTime: number, success: boolean): void {
        const health = this.providerHealth.get(provider);
        if (!health) return;

        // Update response time
        health.averageResponseTime = (health.averageResponseTime + responseTime) / 2;

        // Update success rate (simple moving average)
        const weight = 0.1; // Weight for new measurement
        health.successRate = success 
            ? health.successRate * (1 - weight) + weight
            : health.successRate * (1 - weight);

        if (success) {
            health.consecutiveFailures = 0;
            health.isHealthy = true;
        }
    }

    /**
     * Get current provider from configuration
     */
    private getCurrentProviderFromConfig(): AIProvider | null {
        const configProvider = process.env.PRIMARY_AI_PROVIDER as AIProvider;
        return configProvider || this.config.fallbackOrder[0] || null;
    }

    /**
     * Parse fallback order from environment variable
     */
    private parseFallbackOrder(): AIProvider[] {
        const orderString = process.env.PROVIDER_FALLBACK_ORDER || 'google-ai,github-ai,azure-openai-entra,azure-openai-key,ollama';
        return orderString.split(',').map(p => p.trim() as AIProvider);
    }

    // Public API methods

    /**
     * Get current provider health status
     */
    public getProviderHealth(): Map<AIProvider, ProviderHealth> {
        return new Map(this.providerHealth);
    }

    /**
     * Get fallback history
     */
    public getFallbackHistory(): FallbackEvent[] {
        return [...this.fallbackHistory];
    }

    /**
     * Get current active provider
     */
    public getCurrentProvider(): AIProvider | null {
        return this.currentProvider;
    }

    /**
     * Force a provider switch (for testing or manual control)
     */
    public async forceProviderSwitch(provider: AIProvider): Promise<void> {
        if (!await this.isProviderConfigured(provider)) {
            throw new Error(`Provider ${provider} is not configured`);
        }
        
        await this.switchToProvider(provider, 'manual_switch');
    }

    /**
     * Update configuration
     */
    public updateConfig(newConfig: Partial<FallbackConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        if (newConfig.enabled !== undefined || newConfig.healthCheckInterval !== undefined) {
            this.initializeHealthMonitoring();
        }
    }

    /**
     * Get configuration
     */
    public getConfig(): FallbackConfig {
        return { ...this.config };
    }

    /**
     * Cleanup resources
     */
    public cleanup(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }
}