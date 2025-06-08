/**
 * Core AI Types and Interfaces
 */

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ProviderMetrics {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    totalResponseTime: number;
    averageResponseTime: number;
    lastUsed: Date;
    rateLimitHits: number;
    errors: { [errorType: string]: number };
}

export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors: string[];
}

export type AIProvider = 'azure-openai' | 'github-ai' | 'ollama' | 'azure-ai-studio' | 'google-ai';

export interface AIClientConfig {
    provider: AIProvider;
    endpoint?: string;
    apiKey?: string;
    deployment?: string;
    model?: string;
    useEntraID?: boolean;
}

export interface AIResponse {
    content: string;
    metadata?: {
        provider: AIProvider;
        responseTime: number;
        tokensUsed?: number;
    };
}
