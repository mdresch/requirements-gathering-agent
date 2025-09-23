/**
 * Core AI Types and Interfaces Module for Requirements Gathering Agent
 * 
 * Defines essential TypeScript interfaces and types for AI provider integration,
 * message handling, and response processing across the system.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Comprehensive AI provider type definitions
 * - Message and response interface specifications
 * - Metrics and performance tracking types
 * - Configuration and validation interfaces
 * - Cross-module type consistency
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\types.ts
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

export type AIProvider = 'azure-openai' | 'azure-openai-key' | 'azure-openai-entra' | 'github-ai' | 'ollama' | 'azure-ai-studio' | 'google-ai' | 'google-gemini';

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

export interface ProjectContext {
    projectName: string;
    programName?: string;
    programManager?: string;
    projectType?: string;
    description?: string;
    // ...other fields...
}
