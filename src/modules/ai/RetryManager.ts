/**
 * Enhanced Retry Manager with intelligent backoff and circuit breaker
 */

import { RetryConfig } from "./types.js";

interface CircuitBreakerState {
    failures: number;
    lastFailureTime: number;
    state: 'closed' | 'open' | 'half-open';
}

export class RetryManager {
    private static instance: RetryManager;
    private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
    
    private readonly DEFAULT_CIRCUIT_BREAKER_CONFIG = {
        failureThreshold: 5,
        recoveryTimeMs: 60000, // 1 minute
        halfOpenMaxCalls: 3
    };

    private readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableErrors: ['429', 'rate limit', 'timeout', '500', '502', '503', '504', 'ECONNRESET', 'ETIMEDOUT']
    };

    private constructor() {}

    static getInstance(): RetryManager {
        if (!RetryManager.instance) {
            RetryManager.instance = new RetryManager();
        }
        return RetryManager.instance;
    }

    async executeWithRetry<T>(
        operation: () => Promise<T>,
        operationName: string,
        provider: string,
        retryConfig: RetryConfig = this.DEFAULT_RETRY_CONFIG
    ): Promise<T> {
        // Check circuit breaker
        if (!this.canExecute(provider)) {
            throw new Error(`Circuit breaker open for provider: ${provider}`);
        }

        let lastError: any;
        
        for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
            try {
                const result = await operation();
                
                // Reset circuit breaker on success
                this.onSuccess(provider);
                
                if (attempt > 0) {
                    console.log(`✅ ${operationName} succeeded on attempt ${attempt + 1}`);
                }
                
                return result;
            } catch (error: any) {
                lastError = error;
                
                // Update circuit breaker
                this.onFailure(provider);
                
                if (attempt === retryConfig.maxRetries) {
                    console.error(`❌ ${operationName} failed after ${retryConfig.maxRetries + 1} attempts:`, error.message);
                    throw this.enhanceError(error, operationName, provider);
                }
                
                if (!this.isRetryableError(error, retryConfig.retryableErrors)) {
                    console.error(`❌ ${operationName} failed with non-retryable error:`, error.message);
                    throw this.enhanceError(error, operationName, provider);
                }
                
                const delay = this.calculateDelay(attempt, retryConfig, error);
                console.log(`⚠️ ${operationName} failed on attempt ${attempt + 1}. Retrying in ${delay}ms...`);
                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }

    private canExecute(provider: string): boolean {
        const breaker = this.circuitBreakers.get(provider);
        if (!breaker) return true;

        const now = Date.now();
        
        switch (breaker.state) {
            case 'closed':
                return true;
            case 'open':
                if (now - breaker.lastFailureTime > this.DEFAULT_CIRCUIT_BREAKER_CONFIG.recoveryTimeMs) {
                    breaker.state = 'half-open';
                    return true;
                }
                return false;
            case 'half-open':
                return true;
            default:
                return true;
        }
    }

    private onSuccess(provider: string): void {
        const breaker = this.circuitBreakers.get(provider);
        if (breaker) {
            breaker.failures = 0;
            breaker.state = 'closed';
        }
    }

    private onFailure(provider: string): void {
        let breaker = this.circuitBreakers.get(provider);
        if (!breaker) {
            breaker = { failures: 0, lastFailureTime: 0, state: 'closed' };
            this.circuitBreakers.set(provider, breaker);
        }

        breaker.failures++;
        breaker.lastFailureTime = Date.now();

        if (breaker.failures >= this.DEFAULT_CIRCUIT_BREAKER_CONFIG.failureThreshold) {
            breaker.state = 'open';
            console.warn(`🔴 Circuit breaker opened for provider: ${provider}`);
        }
    }

    private calculateDelay(attempt: number, config: RetryConfig, error: any): number {
        let baseDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.3 + 0.85; // 85-115% of base delay
        baseDelay *= jitter;
        
        // Special handling for rate limits
        if (this.isRateLimitError(error)) {
            const retryAfter = this.extractRetryAfter(error);
            if (retryAfter) {
                baseDelay = Math.max(baseDelay, retryAfter * 1000);
            } else {
                baseDelay *= 2; // Extra penalty for rate limits
            }
        }
        
        return Math.min(baseDelay, config.maxDelay);
    }

    private isRetryableError(error: any, retryableErrors: string[]): boolean {
        const errorMessage = error.message?.toLowerCase() || '';
        const errorStatus = error.status?.toString() || '';
        
        return retryableErrors.some(retryableError => 
            errorMessage.includes(retryableError.toLowerCase()) || 
            errorStatus === retryableError
        );
    }

    private isRateLimitError(error: any): boolean {
        const message = error.message?.toLowerCase() || '';
        return error.status === 429 || 
               message.includes('rate limit') || 
               message.includes('too many requests');
    }

    private extractRetryAfter(error: any): number | null {
        // Try to extract retry-after header value
        const retryAfter = error.headers?.['retry-after'] || 
                          error.response?.headers?.['retry-after'];
        
        if (retryAfter) {
            const parsed = parseInt(retryAfter);
            return isNaN(parsed) ? null : parsed;
        }
        
        return null;
    }

    private enhanceError(error: any, operationName: string, provider: string): Error {
        const breaker = this.circuitBreakers.get(provider);
        const circuitStatus = breaker ? ` (Circuit: ${breaker.state}, Failures: ${breaker.failures})` : '';
        const enhancedMessage = `${operationName} failed with ${provider}${circuitStatus}: ${error.message}`;
        
        const enhancedError = new Error(enhancedMessage);
        enhancedError.stack = error.stack;
        return enhancedError;
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Circuit breaker status
    getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
        const status: Record<string, CircuitBreakerState> = {};
        for (const [provider, breaker] of this.circuitBreakers) {
            status[provider] = { ...breaker };
        }
        return status;
    }

    resetCircuitBreaker(provider?: string): void {
        if (provider) {
            this.circuitBreakers.delete(provider);
        } else {
            this.circuitBreakers.clear();
        }
    }
}
