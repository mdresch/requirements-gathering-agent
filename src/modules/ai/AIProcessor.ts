/**
 * Enhanced AI Processor Module for Requirements Gathering Agent
 * 
 * Core AI processing engine with improved error handling, response processing,
 * and multi-provider support for robust document generation.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Multi-provider AI integration (Google AI, Azure OpenAI, GitHub AI, Ollama)
 * - Advanced error handling and retry mechanisms
 * - Performance metrics and monitoring
 * - Response validation and processing
 * - Configuration management and provider switching
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\AIProcessor.ts
 */

import { ChatMessage, AIProvider, AIResponse } from "./types.js";
import { AIClientManager } from "./AIClientManager.js";
import { MetricsManager } from "./MetricsManager.js";
import { RetryManager } from "./RetryManager.js";
import { ConfigurationManager } from "./ConfigurationManager.js";
import { ProviderManager } from "./ProviderManager.js";
import { ProviderFallbackManager } from "./ProviderFallbackManager.js";
import { AIContextTrackingService, ContextTrackingOptions, AIResponseData } from "../../services/AIContextTrackingService.js";

export class AIProcessor {
    private static instance: AIProcessor;
    private clientManager: AIClientManager;
    private metricsManager: MetricsManager;
    private retryManager: RetryManager;
    private config: ConfigurationManager;
    private providerManager: ProviderManager;
    private fallbackManager: ProviderFallbackManager;
    private initializationPromise: Promise<void> | null = null;

    private constructor() {
        this.clientManager = AIClientManager.getInstance();
        this.metricsManager = MetricsManager.getInstance();
        this.retryManager = RetryManager.getInstance();
        this.config = ConfigurationManager.getInstance();
        this.providerManager = new ProviderManager();
        this.fallbackManager = ProviderFallbackManager.getInstance();
        this.initializationPromise = this.providerManager.validateConfigurations().then(() => {});
    }

    private async ensureInitialized(): Promise<void> {
        if (this.initializationPromise) {
            await this.initializationPromise;
            this.initializationPromise = null;
        }
    }

    static getInstance(): AIProcessor {
        if (!AIProcessor.instance) {
            AIProcessor.instance = new AIProcessor();
        }
        return AIProcessor.instance;
    }

    async processAIRequest<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        await this.ensureInitialized();
        
        // Always use provider from config unless fallback is required
        let provider = this.config.getAIProvider();
        if (!provider) {
            throw new Error('No AI provider configured');
        }

        // Ensure the client for the provider is initialized
        if (!this.clientManager.getClient(provider as AIProvider)) {
            console.log(`🔧 Initializing client for provider: ${provider}`);
            await this.clientManager.initializeSpecificProvider(provider as AIProvider);
        }

        let status = this.providerManager.getProviderStatus(provider);
        if (!status.available || !status.withinRateLimit || !status.withinQuota) {
            // Try fallback only if the configured provider is unavailable
            if (await this.providerManager.switchProvider()) {
                const fallbackProvider = this.providerManager.getActiveProvider();
                if (fallbackProvider && fallbackProvider !== provider) {
                    console.log(`Switched to fallback provider: ${fallbackProvider}`);
                    provider = fallbackProvider as AIProvider;
                    this.config.setProvider(provider); // update config for this session
                    if (!this.clientManager.getClient(provider)) {
                        await this.clientManager.initializeSpecificProvider(provider);
                    }
                    status = this.providerManager.getProviderStatus(provider);
                }
            } else {
                throw new Error('No available AI providers');
            }
        }

        return this.retryManager.executeWithRetry(operation, operationName, provider);
    }

    createMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
        return [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
    }

    async makeAICall(messages: ChatMessage[], maxTokens?: number): Promise<AIResponse> {
        await this.ensureInitialized();
        
        const defaultTokens = this.config.getMaxResponseTokens();
        maxTokens = maxTokens ?? defaultTokens;
        
        const startTime = Date.now();
        
        // Use enhanced fallback manager for automatic provider switching
        return this.fallbackManager.executeWithFallback(async (provider: AIProvider) => {
            // Ensure the client for the provider is initialized
            let client = this.clientManager.getClient(provider);
            if (!client) {
                console.log(`🔧 Initializing client for provider: ${provider}`);
                await this.clientManager.initializeSpecificProvider(provider);
                client = this.clientManager.getClient(provider);
                if (!client) {
                    throw new Error(`Failed to initialize client for provider: ${provider}`);
                }
            }

            // Check provider status
            const status = this.providerManager.getProviderStatus(provider);
            if (!status.withinRateLimit) {
                throw new Error(`Rate limit exceeded for provider ${provider}`);
            }
            if (!status.withinQuota) {
                throw new Error(`Quota exceeded for provider ${provider}`);
            }

            // Make the AI call
            const result = await this.routeProviderCall(provider, client, messages, maxTokens);
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const tokensUsed = this.estimateTokens(result);

            // Update provider metrics on success
            this.providerManager.updateMetrics(provider, true, responseTime, tokensUsed);
            
            return {
                content: result,
                metadata: {
                    provider,
                    responseTime,
                    tokensUsed
                }
            };
        }, 'AI_Call');
    }

    /**
     * Make an AI call with comprehensive context tracking
     */
    async makeAICallWithContextTracking(
        messages: ChatMessage[], 
        contextOptions: ContextTrackingOptions,
        maxTokens?: number
    ): Promise<AIResponse> {
        await this.ensureInitialized();
        
        const defaultTokens = this.config.getMaxResponseTokens();
        maxTokens = maxTokens ?? defaultTokens;
        
        const startTime = Date.now();
        let generationJobId: string | null = null;
        let usedProvider: AIProvider | null = null;
        
        try {
            // Start context tracking
            const providerConfig = this.getProviderConfig(contextOptions.aiProvider);
            generationJobId = await AIContextTrackingService.startTracking({
                ...contextOptions,
                providerConfig: {
                    modelName: contextOptions.aiModel,
                    maxTokens: maxTokens,
                    temperature: providerConfig.temperature || 0.7,
                    topP: providerConfig.topP,
                    frequencyPenalty: providerConfig.frequencyPenalty,
                    presencePenalty: providerConfig.presencePenalty
                }
            });

            // Use enhanced fallback manager for automatic provider switching
            const response = await this.fallbackManager.executeWithFallback(async (provider: AIProvider) => {
                usedProvider = provider;
                
                // Ensure the client for the provider is initialized
                let client = this.clientManager.getClient(provider);
                if (!client) {
                    console.log(`🔧 Initializing client for provider: ${provider}`);
                    await this.clientManager.initializeSpecificProvider(provider);
                    client = this.clientManager.getClient(provider);
                    if (!client) {
                        throw new Error(`Failed to initialize client for provider: ${provider}`);
                    }
                }

                // Check provider status
                const status = this.providerManager.getProviderStatus(provider);
                if (!status.withinRateLimit) {
                    throw new Error(`Rate limit exceeded for provider ${provider}`);
                }
                if (!status.withinQuota) {
                    throw new Error(`Quota exceeded for provider ${provider}`);
                }

                // Make the AI call
                const result = await this.routeProviderCall(provider, client, messages, maxTokens);
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                const tokensUsed = this.estimateTokens(result);

                // Update provider metrics on success
                this.providerManager.updateMetrics(provider, true, responseTime, tokensUsed);
                
                return {
                    content: result,
                    metadata: {
                        provider,
                        responseTime,
                        tokensUsed
                    }
                };
            }, 'AI_Call');

            // Update context tracking with response data
            if (generationJobId && usedProvider) {
                const responseData: AIResponseData = {
                    rawResponse: response.content,
                    processedResponse: response.content,
                    responseMetadata: {
                        finishReason: 'stop',
                        usage: {
                            promptTokens: this.estimateTokens(messages.map(m => m.content).join(' ')),
                            completionTokens: response.metadata.tokensUsed,
                            totalTokens: response.metadata.tokensUsed + this.estimateTokens(messages.map(m => m.content).join(' '))
                        },
                        model: contextOptions.aiModel,
                        timestamp: new Date().toISOString()
                    },
                    generationTimeMs: response.metadata.responseTime
                };

                await AIContextTrackingService.updateWithResponse(generationJobId, responseData);
            }

            return response;

        } catch (error: any) {
            // Mark context tracking as failed
            if (generationJobId) {
                await AIContextTrackingService.markAsFailed(generationJobId, {
                    errorCode: 'AI_CALL_FAILED',
                    errorMessage: error.message,
                    stackTrace: error.stack
                });
            }
            throw error;
        }
    }

    /**
     * Get provider configuration
     */
    private getProviderConfig(provider: string): any {
        // This would typically come from the configuration manager
        // For now, return default values
        return {
            temperature: 0.7,
            topP: 1.0,
            frequencyPenalty: 0,
            presencePenalty: 0
        };
    }

    private async routeProviderCall(
        provider: AIProvider, 
        client: any, 
        messages: ChatMessage[], 
        maxTokens: number
    ): Promise<string> {        const callMethods: Record<AIProvider, () => Promise<string>> = {
            'google-ai': () => this.makeGoogleAICall(client, messages, maxTokens),
            'google-gemini': () => this.makeGoogleAICall(client, messages, maxTokens),
            'azure-openai': () => this.makeAzureOpenAICall(client, messages, maxTokens),
            'azure-openai-key': () => this.makeAzureOpenAICall(client, messages, maxTokens),
            'azure-openai-entra': () => this.makeAzureOpenAICall(client, messages, maxTokens),
            'azure-ai-studio': () => this.makeAzureAIStudioCall(client, messages, maxTokens),
            'github-ai': () => this.makeGitHubAICall(client, messages, maxTokens),
            'ollama': () => this.makeOllamaCall(client, messages, maxTokens)
        };

        const callMethod = callMethods[provider];
        if (!callMethod) {
            throw new Error(`Unsupported provider: ${provider}`);
        }

        return await callMethod();
    }

    private async makeGoogleAICall(client: any, messages: ChatMessage[], maxTokens: number): Promise<string> {
        // Use gemini-pro for google-gemini provider, otherwise use gemini-1.5-flash
        const currentProvider = this.config.getAIProvider();
        const modelName = currentProvider === 'google-gemini' ? "gemini-pro" : "gemini-1.5-flash";
        const model = client.getGenerativeModel({ model: modelName });
        const modelMaxTokens = this.config.getModelTokenLimit(modelName);
        
        // Convert messages to Google AI format
        const prompt = this.convertMessagesToGoogleFormat(messages);
        
        const result = await model.generateContent({
            contents: prompt,
            generationConfig: {
                maxOutputTokens: Math.min(maxTokens, modelMaxTokens),
                temperature: 0.7,
            },
        });

        const response = await result.response;
        return response.text();
    }

    private async makeAzureOpenAICall(client: any, messages: ChatMessage[], maxTokens: number): Promise<string> {
        const deployment = this.config.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME');
        const modelMaxTokens = this.config.getModelTokenLimit(deployment);
        
        const completion = await client.chat.completions.create({
            model: deployment,
            messages: messages,
            max_tokens: Math.min(maxTokens, modelMaxTokens),
            temperature: 0.7
        });

        return completion.choices[0]?.message?.content || '';
    }

    private async makeAzureAIStudioCall(client: any, messages: ChatMessage[], maxTokens: number): Promise<string> {
        const deployment = this.config.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME');
        const apiVersion = this.config.get<string>('AZURE_OPENAI_API_VERSION');
        const apiPath = `/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        const modelMaxTokens = this.config.getModelTokenLimit(deployment);
        
        const result = await client.path(apiPath).post({
            body: {
                messages: messages,
                model: deployment,
                max_tokens: Math.min(maxTokens, modelMaxTokens),
                temperature: 0.7
            }
        });

        if (result.status !== "200") {
            throw new Error(`Azure AI Studio call failed: ${result.status}`);
        }

        return result.body.choices[0]?.message?.content || '';
    }

    private async makeGitHubAICall(client: any, messages: ChatMessage[], maxTokens: number): Promise<string> {
        const modelName = "gpt-4o-mini";
        const modelMaxTokens = this.config.getModelTokenLimit(modelName);

        const result = await client.path("/chat/completions").post({
            body: {
                messages: messages,
                model: modelName,
                max_tokens: Math.min(maxTokens, modelMaxTokens),
                temperature: 0.7
            }
        });

        if (result.status !== "200") {
            throw new Error(`GitHub AI call failed: ${result.status}`);
        }

        return result.body.choices[0]?.message?.content || '';
    }

    private async makeOllamaCall(client: any, messages: ChatMessage[], maxTokens: number): Promise<string> {
        const { endpoint } = client;
        const modelName = 'llama3.1:latest';
        const modelMaxTokens = this.config.getModelTokenLimit(modelName);
        
        // Convert messages to Ollama format
        const prompt = messages.map(msg => {
            if (msg.role === 'system') return `System: ${msg.content}`;
            if (msg.role === 'user') return `Human: ${msg.content}`;
            if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
            return msg.content;
        }).join('\n\n') + '\n\nAssistant:';
        
        const response = await fetch(`${endpoint}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: Math.min(maxTokens, modelMaxTokens)
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama call failed: ${response.status}`);
        }
        const result = await response.json() as { response?: string };
        return result.response || '';
    }

    private convertMessagesToGoogleFormat(messages: ChatMessage[]): any[] {
        return messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
    }

    private estimateTokens(text: string): number {
        // Simple token estimation (roughly 4 characters per token)
        return Math.ceil(text.length / 4);
    }

    extractContent(response: AIResponse): string {
        return response.content;
    }

    /**
     * Populates enhanced context from analysis results
     * @param analysisResults The analysis results to populate context from
     * @returns Enhanced context object
     */
    static async populateEnhancedContextFromAnalysis(analysisResults: any): Promise<any> {
        try {
            const enhancedContext = {
                requirements: analysisResults.requirements || [],
                architecture: analysisResults.architecture || [],
                stakeholders: analysisResults.stakeholders || [],
                planning: analysisResults.planning || [],
                technical: analysisResults.technical || [],
                metadata: analysisResults.metadata || {},
                analysis: {
                    contextScore: analysisResults.analysis?.contextScore || 0,
                    contentScore: analysisResults.analysis?.contentScore || 0,
                    structureScore: analysisResults.analysis?.structureScore || 0,
                    completenessScore: analysisResults.analysis?.completenessScore || 0,
                }
            };

            return enhancedContext;
        } catch (error) {
            console.warn('Error populating enhanced context:', error);
            return {};
        }    }    // Performance monitoring methods
    async testConnection(provider?: AIProvider): Promise<boolean> {
        try {
            await this.ensureInitialized();
            
            if (provider) {
                const isValid = await this.providerManager.validateProvider(provider);
                if (!isValid) {
                    return false;
                }
            }

            // Use active provider if none specified
            const activeProvider = provider || this.providerManager.getActiveProvider();
            if (!activeProvider) {
                return false;
            }

            // Ensure the client for the active provider is initialized
            if (!this.clientManager.getClient(activeProvider as AIProvider)) {
                console.log(`🔧 Initializing client for test connection: ${activeProvider}`);
                await this.clientManager.initializeSpecificProvider(activeProvider as AIProvider);
            }

            const client = this.clientManager.getClient(activeProvider as AIProvider);
            if (!client) {
                return false;
            }

            const testMessages = this.createMessages(
                "You are a helpful assistant.",
                "Say 'Hello' in response."
            );
            
            await this.makeAICall(testMessages, 10);
            return true;
        } catch (error) {
            console.error(`Connection test failed:`, error);
            return false;
        }
    }

    getPerformanceMetrics(): Record<string, any> {
        return {
            metrics: this.metricsManager.getAllMetrics(),
            circuitBreakers: this.retryManager.getCircuitBreakerStatus(),
            clientHealth: this.clientManager.getClientHealth(),
            configuration: this.config.getConfigSummary(),
            providers: Array.from(this.providerManager.getProviderMetrics() as Map<string, any>).reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as Record<string, any>)
        };
    }

    async refreshConnections(): Promise<void> {
        await this.clientManager.refreshConnection();
    }

    // Cleanup method
    cleanup(): void {
        this.clientManager.cleanup();
        this.metricsManager.resetMetrics();
        this.retryManager.resetCircuitBreaker();
    }
}

// Export singleton getter function
export function getAIProcessor(): AIProcessor {
    return AIProcessor.getInstance();
}

// (Removed duplicate export to avoid redeclaration error)
