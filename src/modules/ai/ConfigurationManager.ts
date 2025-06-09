/**
 * Enhanced Configuration Manager Module for Requirements Gathering Agent
 * 
 * Advanced configuration management system with validation, caching,
 * and multi-provider environment setup for reliable AI service integration.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Environment variable validation and caching
 * - Multi-provider configuration management
 * - Runtime configuration validation
 * - Secure credential handling
 * - Configuration change detection
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\ConfigurationManager.ts
 */

import dotenv from "dotenv";
import { AIProvider } from "./types.js";

// Load environment variables once
dotenv.config();

interface ConfigValidationResult {
    isValid: boolean;
    missingVars: string[];
    warnings?: string[];
}

export class ConfigurationManager {
    private static instance: ConfigurationManager;
    private config: Map<string, any> = new Map();
    private validationCache: Map<string, ConfigValidationResult> = new Map();
    private modelTokenLimits: Map<string, number> = new Map([
        ['gemini-1.5-flash', 1048576], // 1M tokens
        ['gemini-1.5-pro', 2097152],   // 2M tokens
        ['gemini-2.0-flash-exp', 1048576], // 1M tokens
        ['gpt-4', 128000],        // 128k tokens
        ['gpt-4-turbo', 128000],  // 128k tokens
        ['gpt-4o', 128000],       // 128k tokens
        ['gpt-4o-mini', 128000],  // 128k tokens
        ['gpt-4.1-mini', 8000],   // 8k tokens
        ['gpt-4.1', 8000],        // 8k tokens
        ['gpt-3.5-turbo', 16385], // 16k tokens
        ['claude-3-opus', 200000], // 200k tokens
        ['claude-3-sonnet', 200000], // 200k tokens
        ['claude-3-haiku', 200000], // 200k tokens
        ['llama3.1', 131072],     // 128k tokens
        ['llama3.2', 131072],     // 128k tokens
        ['qwen2.5', 131072],      // 128k tokens
        ['phi3', 131072]          // 128k tokens
    ]);

    private currentProvider: AIProvider = 'google-ai';

    private constructor() {
        this.loadConfiguration();
    }

    static getInstance(): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }    private loadConfiguration(): void {
        // Consolidate all environment variable loading
        const envVars = {
            // Azure OpenAI Configuration
            'AZURE_OPENAI_ENDPOINT': process.env.AZURE_OPENAI_ENDPOINT,
            'AZURE_OPENAI_API_KEY': process.env.AZURE_OPENAI_API_KEY,
            'AZURE_OPENAI_DEPLOYMENT_NAME': process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
            'AZURE_OPENAI_API_VERSION': process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
            'USE_ENTRA_ID': process.env.USE_ENTRA_ID === 'true',
            'AZURE_CLIENT_ID': process.env.AZURE_CLIENT_ID,
            'AZURE_TENANT_ID': process.env.AZURE_TENANT_ID,

            // Google AI Configuration
            'GOOGLE_AI_API_KEY': process.env.GOOGLE_AI_API_KEY,
            'GOOGLE_AI_MODEL': process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash',
            'GOOGLE_AI_ENDPOINT': process.env.GOOGLE_AI_ENDPOINT || 'https://generativelanguage.googleapis.com',        
            'GITHUB_ENDPOINT': process.env.GITHUB_ENDPOINT || process.env.GITHUB_API_ENDPOINT || 'https://models.github.ai/inference',
            'GITHUB_COPILOT_ENDPOINT': process.env.GITHUB_COPILOT_ENDPOINT || 'https://copilot-proxy.githubusercontent.com',
            'GITHUB_TOKEN': process.env.GITHUB_TOKEN,
            'GITHUB_MODEL': process.env.GITHUB_MODEL || 'openai/gtp-4.1',
            'AZURE_AI_ENDPOINT': process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT,
            'AZURE_AI_API_KEY': process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY,

            // Additional mapping for deployment names
            'deployment_name': process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.DEPLOYMENT_NAME || process.env.REQUIREMENTS_AGENT_MODEL,
            'api_version': process.env.AZURE_OPENAI_API_VERSION || process.env.API_VERSION,

            // Ollama Configuration
            'OLLAMA_ENDPOINT': process.env.OLLAMA_ENDPOINT || 'http://localhost:11434/api',
            'OLLAMA_MODEL': process.env.OLLAMA_MODEL || 'deepseek-coder:latest',

            // General Configuration
            'max_retries': parseInt(process.env.AI_MAX_RETRIES || '3'),
            'timeout_ms': parseInt(process.env.AI_TIMEOUT || '60000'),
            'rate_limit_requests_per_minute': parseInt(process.env.RATE_LIMIT_RPM || '60')
        };        // Set all configuration at once (including lowercase versions for compatibility)
        Object.entries(envVars).forEach(([key, value]) => {
            this.config.set(key, value);
            this.config.set(key.toLowerCase(), value);
        });
    }

    get<T>(key: string, defaultValue?: T): T {
        return this.config.get(key) ?? defaultValue;
    }

    // Cached validation
    validateAzureOpenAIConfig(): ConfigValidationResult {
        const cacheKey = 'azure-openai';
        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey)!;
        }

        const result = this.performAzureOpenAIValidation();
        this.validationCache.set(cacheKey, result);
        return result;
    }    private performAzureOpenAIValidation(): ConfigValidationResult {
        const missingVars: string[] = [];
        const warnings: string[] = [];

        const endpoint = this.get<string>('AZURE_OPENAI_ENDPOINT');
        const apiKey = this.get<string>('AZURE_OPENAI_API_KEY');
        const deployment = this.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME');
        const apiVersion = this.get<string>('AZURE_OPENAI_API_VERSION');
        const useEntra = this.get<boolean>('USE_ENTRA_ID');

        if (!endpoint) missingVars.push('AZURE_AI_ENDPOINT or AZURE_OPENAI_ENDPOINT');
        if (!deployment) missingVars.push('DEPLOYMENT_NAME or REQUIREMENTS_AGENT_MODEL');
        if (!apiVersion) missingVars.push('AZURE_OPENAI_API_VERSION');
        
        if (!useEntra && !apiKey) {
            missingVars.push('AZURE_AI_API_KEY');
        }
        
        if (useEntra) {
            if (!this.get<string>('azure_client_id')) missingVars.push('AZURE_CLIENT_ID');
            if (!this.get<string>('azure_tenant_id')) missingVars.push('AZURE_TENANT_ID');
        }

        // Add warnings for common issues
        if (endpoint && !endpoint.includes('https://')) {
            warnings.push('Endpoint should use HTTPS');
        }

        return { 
            isValid: missingVars.length === 0, 
            missingVars,
            warnings: warnings.length > 0 ? warnings : undefined 
        };    }

    setProvider(provider: AIProvider): void {
        this.currentProvider = provider;
        this.validationCache.clear(); // Clear cache when switching providers
    }

    getAIProvider(): AIProvider {
        return this.currentProvider;
    }

    validateCurrentConfig(): ConfigValidationResult {
        const provider = this.getAIProvider();
        switch (provider) {
            case 'google-ai':
                return this.validateGoogleAIConfig();
            case 'azure-openai':
                return this.validateAzureOpenAIConfig();
            case 'github-ai':
                return this.validateGitHubAIConfig();
            case 'ollama':
                return this.validateOllamaConfig();
            default:
                return { isValid: false, missingVars: ['Unsupported provider'] };
        }
    }

    private validateGoogleAIConfig(): ConfigValidationResult {
        const missingVars: string[] = [];
        if (!this.get<string>('GOOGLE_AI_API_KEY')) {
            missingVars.push('GOOGLE_AI_API_KEY');
        }
        return { isValid: missingVars.length === 0, missingVars };
    }    private validateGitHubAIConfig(): ConfigValidationResult {
        const missingVars: string[] = [];
        if (!this.get<string>('GITHUB_TOKEN')) {
            missingVars.push('GITHUB_TOKEN');
        }
        
        // Support both GitHub endpoints (new preview and legacy)
        const endpoint = this.get<string>('GITHUB_ENDPOINT') || this.get<string>('AZURE_AI_ENDPOINT');
        if (!endpoint || !(
            endpoint.includes('models.inference.ai.azure.com') || 
            endpoint.includes('models.github.ai')
        )) {
            missingVars.push('GITHUB_ENDPOINT or AZURE_AI_ENDPOINT (must contain models.github.ai or models.inference.ai.azure.com)');
        }
        
        return { isValid: missingVars.length === 0, missingVars };
    }

    private validateOllamaConfig(): ConfigValidationResult {
        const missingVars: string[] = [];
        const endpoint = this.get<string>('OLLAMA_ENDPOINT');
        if (!endpoint || !endpoint.startsWith('http')) {
            missingVars.push('OLLAMA_ENDPOINT (must be a valid URL)');
        }
        return { isValid: missingVars.length === 0, missingVars };
    }

    getModelTokenLimit(model: string = ''): number {
        if (!model) {
            model = this.get<string>('deployment_name', '');
        }
        model = model.toLowerCase();

        // Find the best match for the model
        for (const [modelName, limit] of this.modelTokenLimits) {
            if (model.includes(modelName.toLowerCase())) {
                return limit;
            }
        }

        // Default fallback limits based on provider
        switch (this.getAIProvider()) {
            case 'google-ai':
                return model.includes('pro') ? 2097152 : 1048576; // 2M or 1M tokens
            case 'azure-openai':
            case 'azure-ai-studio':
                return 128000; // 128k tokens default for Azure
            case 'github-ai':
                return 128000; // 128k tokens for GitHub AI
            case 'ollama':
                return 131072; // 128k tokens for Ollama models
            default:
                return 4000; // Conservative default
        }
    }

    getMaxResponseTokens(model?: string): number {
        const totalTokens = this.getModelTokenLimit(model);
        // Reserve 20% for response tokens and system prompts
        return Math.floor(totalTokens * 0.2);
    }

    // Clear validation cache if configuration changes
    clearValidationCache(): void {
        this.validationCache.clear();
    }    getConfigSummary(): Record<string, any> {
        const deployment = this.get<string>('deployment_name', '');
        return {
            provider: this.getAIProvider(),
            hasEndpoint: !!this.get('azure_ai_endpoint'),
            hasApiKey: !!this.get('azure_ai_api_key'),
            hasDeployment: !!deployment,
            useEntraID: this.get('use_entra_id'),
            maxRetries: this.get('max_retries'),
            timeoutMs: this.get('timeout_ms'),
            modelTokenLimit: this.getModelTokenLimit(deployment),
            maxResponseTokens: this.getMaxResponseTokens(deployment)
        };
    }

    private getOllamaConfig(): Record<string, any> {
        return {
            endpoint: this.get<string>('OLLAMA_ENDPOINT') || 'http://localhost:11434',
            model: this.get<string>('REQUIREMENTS_AGENT_MODEL') || 'llama3.1'
        };
    }
}
