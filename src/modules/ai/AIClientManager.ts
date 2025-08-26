/**
 * Enhanced AI Client Manager Module for Requirements Gathering Agent
 * 
 * Advanced client management system with improved connection pooling, error handling,
 * and multi-provider authentication for reliable AI service integration.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Multi-provider client management (Azure, Google, GitHub, Ollama)
 * - Advanced connection pooling and resource management
 * - Robust authentication handling (API keys, Entra ID, tokens)
 * - Enhanced error handling and recovery mechanisms
 * - Performance optimization and monitoring
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\AIClientManager.ts
 */

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { AzureOpenAI } from "openai";
import { ClientSecretCredential } from "@azure/identity";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { AIProvider } from "./types.js";
import { ConfigurationManager } from "./ConfigurationManager.js";

interface ClientInfo {
    client: any;
    lastUsed: number;
    isHealthy: boolean;
    connectionAttempts: number;
}

class AIClientManager {
    private static instance: AIClientManager;
    private clients: Map<AIProvider, ClientInfo> = new Map();
    private initialized = false;
    private skipAI = false;
    private config: ConfigurationManager;
    private readonly MAX_CONNECTION_ATTEMPTS = 3;
    private readonly CONNECTION_TIMEOUT_MS = 10000;

    private constructor() {
        this.config = ConfigurationManager.getInstance();
    }

    static getInstance(): AIClientManager {
        if (!AIClientManager.instance) {
            AIClientManager.instance = new AIClientManager();
        }
        return AIClientManager.instance;
    }

    async initializeClients(): Promise<void> {
        if (this.initialized) return;

        const provider = this.config.getAIProvider();
        console.log(`🔍 Initializing AI Provider: ${provider}`);

        try {
            await this.initializeProvider(provider);
            this.initialized = true;
            console.log(`🚀 ${provider} initialized successfully`);
        } catch (error: any) {
            console.error(`❌ Failed to initialize ${provider}:`, error.message);
            this.skipAI = true;
            throw error;
        }
    }

    async initializeSpecificProvider(provider: AIProvider): Promise<void> {
        if (this.clients.has(provider)) {
            return; // Already initialized
        }

        console.log(`🔧 Initializing specific provider: ${provider}`);

        try {
            await this.initializeProvider(provider);
            console.log(`✅ ${provider} initialized successfully`);
        } catch (error: any) {
            console.error(`❌ Failed to initialize ${provider}:`, error.message);
            throw error;
        }
    }

    private async initializeProvider(provider: AIProvider): Promise<void> {        const initMethods: Record<AIProvider, () => Promise<void>> = {
            'google-ai': () => this.initializeGoogleAI(),
            'azure-openai': () => this.initializeAzureOpenAIWithEntra(),
            'azure-openai-key': () => this.initializeAzureOpenAIWithKey(),
            'azure-openai-entra': () => this.initializeAzureOpenAIWithEntra(),
            'azure-ai-studio': () => this.initializeAzureAIStudio(),
            'github-ai': () => this.initializeGitHubAI(),
            'ollama': () => this.initializeOllama()
        };

        const initMethod = initMethods[provider];
        if (!initMethod) {
            throw new Error(`Unsupported AI provider: ${provider}`);
        }

        await initMethod();
    }    private async initializeGoogleAI(): Promise<void> {
        const apiKey = this.config.get<string>('GOOGLE_AI_API_KEY');
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY is required for Google AI Studio');
        }
        
        const client = new GoogleGenerativeAI(apiKey);
        this.setClient('google-ai', client);
    }    private async initializeAzureOpenAIWithEntra(): Promise<void> {
        const validation = this.config.validateAzureOpenAIConfig();
        if (!validation.isValid) {
            throw new Error(`Azure OpenAI configuration error: Missing ${validation.missingVars.join(', ')}`);
        }

        const endpoint = this.config.get<string>('AZURE_OPENAI_ENDPOINT');
        const deployment = this.config.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME');
        const apiVersion = this.config.get<string>('AZURE_OPENAI_API_VERSION');
        
        // Get Entra ID credentials
        const clientId = this.config.get<string>('AZURE_CLIENT_ID');
        const tenantId = this.config.get<string>('AZURE_TENANT_ID');
        const clientSecret = this.config.get<string>('AZURE_CLIENT_SECRET');

        if (!clientId || !tenantId || !clientSecret) {
            throw new Error('AZURE_CLIENT_ID, AZURE_TENANT_ID, and AZURE_CLIENT_SECRET are required for Entra ID authentication');
        }
        
        const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        
        const client = new AzureOpenAI({ 
            endpoint: endpoint!, 
            apiKey: await credential.getToken("https://cognitiveservices.azure.com/.default").then(token => token.token),
            apiVersion, 
            deployment 
        });
        
        this.setClient('azure-openai', client);
        await this.validateConnection('azure-openai');
    }

    private async initializeAzureOpenAIWithKey(): Promise<void> {
        const validation = this.config.validateAzureOpenAIConfig();
        if (!validation.isValid) {
            throw new Error(`Azure OpenAI configuration error: Missing ${validation.missingVars.join(', ')}`);
        }

        const endpoint = this.config.get<string>('AZURE_OPENAI_ENDPOINT');
        const apiKey = this.config.get<string>('AZURE_OPENAI_API_KEY');
        const deployment = this.config.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME');
        const apiVersion = this.config.get<string>('AZURE_OPENAI_API_VERSION');
        
        if (!apiKey) {
            throw new Error('AZURE_OPENAI_API_KEY is required for azure-openai-key provider');
        }
        
        const client = new AzureOpenAI({ 
            endpoint: endpoint!, 
            apiKey,
            apiVersion, 
            deployment 
        });
        
        this.setClient('azure-openai-key', client);
        await this.validateConnection('azure-openai-key');
    }

    private async initializeAzureAIStudio(): Promise<void> {
        const validation = this.config.validateAzureOpenAIConfig();
        if (!validation.isValid) {
            throw new Error(`Azure AI Studio configuration error: Missing ${validation.missingVars.join(', ')}`);
        }

        // Try both AZURE_AI_ENDPOINT and AZURE_OPENAI_ENDPOINT
        const endpoint = this.config.get<string>('AZURE_AI_ENDPOINT') || this.config.get<string>('AZURE_OPENAI_ENDPOINT');
        const apiKey = this.config.get<string>('AZURE_AI_API_KEY') || this.config.get<string>('AZURE_OPENAI_API_KEY');
        
        const client = ModelClient(endpoint!, new AzureKeyCredential(apiKey!));
        this.setClient('azure-ai-studio', client);
        await this.validateConnection('azure-ai-studio');
    }    private async initializeGitHubAI(): Promise<void> {
        const token = this.config.get<string>('GITHUB_TOKEN');
        if (!token) {
            throw new Error('GITHUB_TOKEN is required for GitHub AI');
        }
        
        const endpoint = this.config.get<string>('GITHUB_ENDPOINT');
        if (!endpoint) {
            throw new Error('GITHUB_ENDPOINT is required for GitHub AI');
        }
        
        const client = ModelClient(endpoint, new AzureKeyCredential(token));
        this.setClient('github-ai', client);
        await this.validateConnection('github-ai');
    }private async initializeOllama(): Promise<void> {
        try {
            const endpoint = this.config.get<string>('OLLAMA_ENDPOINT') || 'http://127.0.0.1:11434';
            
            const response = await fetch(`${endpoint}/api/tags`);
            if (!response.ok) {
                throw new Error('Failed to connect to Ollama');
            }
            const models = await response.json();
            
            this.setClient('ollama', {
                endpoint,
                available: true,
                models
            });
            
            console.log('✅ Ollama initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Ollama:', error);
            throw error;
        }
    }

    private setClient(provider: AIProvider, client: any): void {
        this.clients.set(provider, {
            client,
            lastUsed: Date.now(),
            isHealthy: true,
            connectionAttempts: 0
        });
    }

    private async validateConnection(provider: AIProvider): Promise<void> {
        const clientInfo = this.clients.get(provider);
        if (!clientInfo) {
            throw new Error(`Client not initialized for provider: ${provider}`);
        }

        const { client } = clientInfo;

        try {
            await Promise.race([
                this.performHealthCheck(provider, client),
                this.createTimeoutPromise(this.CONNECTION_TIMEOUT_MS)
            ]);
            
            clientInfo.isHealthy = true;
            clientInfo.connectionAttempts = 0;
        } catch (error: any) {
            clientInfo.isHealthy = false;
            clientInfo.connectionAttempts++;
            throw this.enhanceConnectionError(error, provider);
        }
    }    private async performHealthCheck(provider: AIProvider, client: any): Promise<void> {        const healthCheckCalls: Record<AIProvider, () => Promise<void>> = {
            'azure-openai': () => this.healthCheckAzureOpenAI(client),
            'azure-openai-key': () => this.healthCheckAzureOpenAI(client),
            'azure-openai-entra': () => this.healthCheckAzureOpenAI(client),
            'azure-ai-studio': () => this.healthCheckAzureAIStudio(client),
            'github-ai': () => this.healthCheckGitHubAI(client),
            'google-ai': () => Promise.resolve(), // Google AI doesn't need health check
            'ollama': () => Promise.resolve() // Ollama doesn't need health check
        };

        const healthCheck = healthCheckCalls[provider];
        if (healthCheck) {
            await healthCheck();
        }
    }

    private async healthCheckAzureOpenAI(client: any): Promise<void> {
        const deployment = this.config.get<string>('deployment_name');
        await client.chat.completions.create({
            model: deployment,
            messages: [{ role: 'system', content: 'ping' }, { role: 'user', content: 'ping' }],
            max_tokens: 1
        });
    }    private async healthCheckAzureAIStudio(client: any): Promise<void> {
        const deployment = this.config.get<string>('deployment_name');
        const apiVersion = this.config.get<string>('api_version');
        const apiPath = `/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        
        await client.path(apiPath).post({
            body: {
                messages: [
                    { role: 'system', content: 'ping' },
                    { role: 'user', content: 'ping' }
                ],
                model: deployment,
                max_tokens: 1
            }
        });
    }

    private async healthCheckGitHubAI(client: any): Promise<void> {
        const modelName = this.config.get<string>('REQUIREMENTS_AGENT_MODEL') || "gpt-4o-mini";
        
        try {
            const result = await client.path("/chat/completions").post({
                body: {
                    messages: [
                        { role: 'system', content: 'ping' },
                        { role: 'user', content: 'ping' }
                    ],
                    model: modelName,
                    max_tokens: 1
                }
            });

            if (result.status !== "200") {
                throw new Error(`GitHub AI health check failed: ${result.status}`);
            }
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error('GitHub AI authentication failed. Please check your token.');
            } else if (error.status === 404) {
                throw new Error(`GitHub AI model ${modelName} not found. Please check your configuration.`);
            }
            throw error;
        }
    }

    private createTimeoutPromise(timeoutMs: number): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Connection timeout')), timeoutMs);
        });
    }

    private enhanceConnectionError(error: any, provider: AIProvider): Error {
        const errorMappings = [
            { condition: (e: any) => e.status === 401 || /auth/i.test(e.message), 
              message: `${provider} authentication failed. Please check your credentials.` },
            { condition: (e: any) => e.status === 404 || /not found/i.test(e.message), 
              message: `${provider} deployment/model not found. Please check your configuration.` },
            { condition: (e: any) => e.status === 429 || /rate limit/i.test(e.message), 
              message: `${provider} rate limit exceeded. Please wait or check your quota.` },
            { condition: (e: any) => /ENOTFOUND|ECONNREFUSED|network|timeout/i.test(e.message), 
              message: `Network error connecting to ${provider}. Please check connectivity.` }
        ];

        const mapping = errorMappings.find(m => m.condition(error));
        const message = mapping?.message || `${provider} connection failed: ${error.message}`;
        
        return new Error(message);
    }

    getClient(provider?: AIProvider): any {
        const targetProvider = provider || this.config.getAIProvider();
        const clientInfo = this.clients.get(targetProvider);
        
        if (!clientInfo) {
            return null;
        }

        // Update last used timestamp
        clientInfo.lastUsed = Date.now();
        
        return clientInfo.client;
    }

    getCurrentProvider(): AIProvider {
        return this.config.getAIProvider();
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    shouldSkipAI(): boolean {
        return this.skipAI;
    }

    // Health monitoring
    getClientHealth(): Record<string, any> {
        const health: Record<string, any> = {};
        
        for (const [provider, clientInfo] of this.clients) {
            health[provider] = {
                isHealthy: clientInfo.isHealthy,
                lastUsed: new Date(clientInfo.lastUsed).toISOString(),
                connectionAttempts: clientInfo.connectionAttempts,
                status: clientInfo.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS ? 'degraded' : 'healthy'
            };
        }
        
        return health;
    }

    async refreshConnection(provider?: AIProvider): Promise<void> {
        const targetProvider = provider || this.config.getAIProvider();
        
        // Remove existing client
        this.clients.delete(targetProvider);
        
        // Reinitialize
        await this.initializeProvider(targetProvider);
        
        console.log(`🔄 Refreshed connection for ${targetProvider}`);
    }    // Cleanup method
    cleanup(): void {
        this.clients.clear();
        this.initialized = false;
        this.skipAI = false;
    }
}

// Export for module usage
export { AIClientManager };
