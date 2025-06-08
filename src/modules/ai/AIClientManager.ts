/**
 * Enhanced AI Client Manager with improved connection pooling and error handling
 */

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
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

    private async initializeProvider(provider: AIProvider): Promise<void> {
        const initMethods: Record<AIProvider, () => Promise<void>> = {
            'google-ai': () => this.initializeGoogleAI(),
            'azure-openai': () => this.initializeAzureOpenAIWithEntra(),
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
        
        const credential = new DefaultAzureCredential({
            managedIdentityClientId: this.config.get<string>('azure_client_id'),
            tenantId: this.config.get<string>('azure_tenant_id')
        });
        
        const scope = "https://cognitiveservices.azure.com/.default";
        const azureADTokenProvider = getBearerTokenProvider(credential, scope);
        
        const client = new AzureOpenAI({ 
            endpoint: endpoint!, 
            azureADTokenProvider, 
            apiVersion, 
            deployment 
        });
        
        this.setClient('azure-openai', client);
        await this.validateConnection('azure-openai');
    }

    private async initializeAzureAIStudio(): Promise<void> {
        const validation = this.config.validateAzureOpenAIConfig();
        if (!validation.isValid) {
            throw new Error(`Azure AI Studio configuration error: Missing ${validation.missingVars.join(', ')}`);
        }

        const endpoint = this.config.get<string>('azure_ai_endpoint');
        const apiKey = this.config.get<string>('azure_ai_api_key');
        
        const client = ModelClient(endpoint!, new AzureKeyCredential(apiKey!));
        this.setClient('azure-ai-studio', client);
        await this.validateConnection('azure-ai-studio');
    }

    private async initializeGitHubAI(): Promise<void> {
        const token = this.config.get<string>('github_token');
        if (!token) {
            throw new Error('GITHUB_TOKEN is required for GitHub AI');
        }
        
        const endpoint = "https://models.github.ai/inference";
        const client = ModelClient(endpoint, new AzureKeyCredential(token));
        this.setClient('github-ai', client);
    }

    private async initializeOllama(): Promise<void> {
        try {
            const response = await fetch('http://127.0.0.1:11434/api/tags');
            if (!response.ok) {
                throw new Error('Failed to connect to Ollama');
            }
            const models = await response.json();
            
            this.setClient('ollama', {
                endpoint: 'http://127.0.0.1:11434',
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
    }

    private async performHealthCheck(provider: AIProvider, client: any): Promise<void> {
        const healthCheckCalls: Record<AIProvider, () => Promise<void>> = {
            'azure-openai': () => this.healthCheckAzureOpenAI(client),
            'azure-ai-studio': () => this.healthCheckAzureAIStudio(client),
            'google-ai': () => Promise.resolve(), // Google AI doesn't need health check
            'github-ai': () => Promise.resolve(), // GitHub AI doesn't need health check  
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
    }

    private async healthCheckAzureAIStudio(client: any): Promise<void> {
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
