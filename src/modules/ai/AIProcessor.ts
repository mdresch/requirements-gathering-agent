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

class AIProcessor {
    private static instance: AIProcessor;
    private clientManager: AIClientManager;
    private metricsManager: MetricsManager;
    private retryManager: RetryManager;
    private config: ConfigurationManager;
    private providerManager: ProviderManager;
    private initializationPromise: Promise<void> | null = null;
    // Add strict provider mode fields
    private strictProvider: string | null = null;
    private allowFallback: boolean = true;

    private constructor() {
        this.clientManager = AIClientManager.getInstance();
        this.metricsManager = MetricsManager.getInstance();
        this.retryManager = RetryManager.getInstance();
        this.config = ConfigurationManager.getInstance();
        this.providerManager = new ProviderManager();
        this.initializationPromise = this.initializeProviderManager();
    }    private async initializeProviderManager(): Promise<void> {
        const results = await this.providerManager.validateConfigurations();
        console.log('Provider validation results:', results);
        
        // Sync the active provider with ConfigurationManager
        const activeProvider = this.providerManager.getActiveProvider();
        if (activeProvider) {
            this.config.setProvider(activeProvider as AIProvider);
        }
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
    }    async processAIRequest<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        await this.ensureInitialized();
        
        const activeProvider = this.providerManager.getActiveProvider();
        if (!activeProvider) {
            throw new Error('No active AI provider available');
        }

        // Ensure the client for the active provider is initialized
        if (!this.clientManager.getClient(activeProvider as AIProvider)) {
            console.log(`🔧 Initializing client for active provider: ${activeProvider}`);
            await this.clientManager.initializeSpecificProvider(activeProvider as AIProvider);
        }

        const status = this.providerManager.getProviderStatus(activeProvider);
        if (!status.available || !status.withinRateLimit || !status.withinQuota) {
            // Check if we're in strict provider mode
            if (!this.allowFallback) {
                throw new Error(`Provider ${activeProvider} is not available and fallback is disabled (strict provider mode)`);
            }
            
            if (await this.providerManager.switchProvider()) {
                console.log(`Switched to fallback provider: ${this.providerManager.getActiveProvider()}`);
            } else {
                throw new Error('No available AI providers');
            }
        }

        return this.retryManager.executeWithRetry(operation, operationName, activeProvider);
    }

    createMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
        return [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
    }    async makeAICall(messages: ChatMessage[], maxTokens?: number): Promise<AIResponse> {
        await this.ensureInitialized();
        
        const defaultTokens = this.config.getMaxResponseTokens();
        maxTokens = maxTokens ?? defaultTokens;
        const activeProvider = this.providerManager.getActiveProvider();
        
        if (!activeProvider) {
            throw new Error('No active AI provider available');
        }

        // Ensure the client for the active provider is initialized
        if (!this.clientManager.getClient(activeProvider as AIProvider)) {
            console.log(`🔧 Initializing client for active provider: ${activeProvider}`);
            await this.clientManager.initializeSpecificProvider(activeProvider as AIProvider);
        }

        const status = this.providerManager.getProviderStatus(activeProvider);        if (!status.withinRateLimit) {
            if (!this.allowFallback) {
                throw new Error(`Rate limit exceeded for provider ${activeProvider} and fallback is disabled (strict provider mode)`);
            }
            throw new Error(`Rate limit exceeded for provider ${activeProvider}`);
        }
        if (!status.withinQuota) {
            // Check if we're in strict provider mode
            if (!this.allowFallback) {
                throw new Error(`Quota exceeded for provider ${activeProvider} and fallback is disabled (strict provider mode)`);
            }
            
            if (await this.providerManager.switchProvider()) {
                // Sync the new active provider with ConfigurationManager
                const newActiveProvider = this.providerManager.getActiveProvider();
                if (newActiveProvider) {
                    this.config.setProvider(newActiveProvider as AIProvider);
                }
                return this.makeAICall(messages, maxTokens); // Retry with new provider
            }
            throw new Error(`Quota exceeded for provider ${activeProvider}`);
        }

        const client = this.clientManager.getClient(activeProvider as AIProvider);
        if (!client) {
            throw new Error(`No client available for provider: ${activeProvider}`);
        }

        const startTime = Date.now();

        try {
            const result = await this.routeProviderCall(activeProvider as AIProvider, client, messages, maxTokens);
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const tokensUsed = this.estimateTokens(result);

            // Update provider metrics
            this.providerManager.updateMetrics(activeProvider, true, responseTime, tokensUsed);
            
            return {
                content: result,
                metadata: {
                    provider: activeProvider as AIProvider,
                    responseTime,
                    tokensUsed
                }
            };
        } catch (error: any) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
              // Update provider metrics on failure
            this.providerManager.updateMetrics(activeProvider, false, responseTime, 0, error);
            
            // Check if we're in strict provider mode
            if (!this.allowFallback) {
                throw new Error(`Provider ${activeProvider} failed and fallback is disabled (strict provider mode): ${error.message}`);
            }
            
            // Try fallback provider
            if (await this.providerManager.switchProvider()) {
                // Sync the new active provider with ConfigurationManager
                const newActiveProvider = this.providerManager.getActiveProvider();
                if (newActiveProvider) {
                    this.config.setProvider(newActiveProvider as AIProvider);
                }
                return this.makeAICall(messages, maxTokens); // Retry with new provider
            }
            
            throw error;
        }
    }

    private async routeProviderCall(
        provider: AIProvider, 
        client: any, 
        messages: ChatMessage[], 
        maxTokens: number
    ): Promise<string> {        const callMethods: Record<AIProvider, () => Promise<string>> = {
            'google-ai': () => this.makeGoogleAICall(client, messages, maxTokens),
            'azure-openai': () => this.makeAzureOpenAICall(client, messages, maxTokens),
            'azure-openai-key': () => this.makeAzureOpenAICall(client, messages, maxTokens),
            'azure-ai-studio': () => this.makeAzureAIStudioCall(client, messages, maxTokens),
            'github-ai': () => this.makeGitHubAICall(client, messages, maxTokens),
            'ollama': () => this.makeOllamaCall(client, messages, maxTokens)
        };

        const callMethod = callMethods[provider];
        if (!callMethod) {
            throw new Error(`Unsupported provider: ${provider}`);
        }

        return await callMethod();
    }    private async makeGoogleAICall(client: any, messages: ChatMessage[], maxTokens: number): Promise<string> {
        // Get the model name from configuration or default to flash
        const modelName = process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash";
        const model = client.getGenerativeModel({ model: modelName });
        const modelMaxTokens = this.config.getModelTokenLimit(modelName);
        
        // Calculate practical token limits with safety margins
        const safetyMargin = 0.1; // 10% safety margin
        const effectiveInputLimit = Math.floor(modelMaxTokens * (1 - safetyMargin));
        const effectiveOutputLimit = Math.min(maxTokens, Math.floor(modelMaxTokens * 0.2)); // Max 20% for output
        
        // Convert messages to Google AI format
        const prompt = this.convertMessagesToGoogleFormat(messages);
        
        // Estimate total input tokens
        const totalInputText = JSON.stringify(prompt);
        const estimatedInputTokens = this.estimateTokens(totalInputText);
        
        console.log(`🤖 Google AI: Model ${modelName}, Input tokens: ~${estimatedInputTokens}, Limit: ${effectiveInputLimit}`);
        
        // Check if we need to chunk the content
        if (estimatedInputTokens > effectiveInputLimit) {
            console.warn(`⚠️  Input tokens (${estimatedInputTokens}) exceed model limit (${effectiveInputLimit}). Implementing chunking strategy...`);
            return await this.handleGoogleAIChunking(model, messages, effectiveOutputLimit, effectiveInputLimit);
        }
        
        try {
            const result = await model.generateContent({
                contents: prompt,
                generationConfig: {
                    maxOutputTokens: effectiveOutputLimit,
                    temperature: 0.7,
                },
            });

            const response = await result.response;
            return response.text();
        } catch (error: any) {
            // Enhanced error handling for Google AI specific issues
            if (error.message?.includes('quota') || error.message?.includes('limit')) {
                throw new Error(`Google AI quota/limit exceeded: ${error.message}. Consider using a different provider or reducing context size.`);
            } else if (error.message?.includes('token')) {
                throw new Error(`Google AI token limit exceeded: ${error.message}. Input was ~${estimatedInputTokens} tokens.`);
            }
            throw error;
        }
    }

    /**
     * Handle large content by chunking when Google AI input exceeds limits
     */
    private async handleGoogleAIChunking(model: any, messages: ChatMessage[], maxOutputTokens: number, inputLimit: number): Promise<string> {
        console.log('🔄 Implementing Google AI chunking strategy for large content...');
        
        // Extract the main content (usually the last user message contains the context)
        const mainMessage = messages[messages.length - 1];
        const systemMessage = messages.find(m => m.role === 'system');
        
        if (!mainMessage || mainMessage.role !== 'user') {
            throw new Error('Unable to chunk: Expected user message with context not found');
        }
        
        // Split the main content into manageable chunks
        const chunks = this.splitContentIntoChunks(mainMessage.content, inputLimit * 0.7); // Use 70% of limit per chunk
        
        console.log(`📝 Split content into ${chunks.length} chunks for processing`);
        
        const chunkResults: string[] = [];
        
        for (let i = 0; i < chunks.length; i++) {
            console.log(`🔍 Processing chunk ${i + 1}/${chunks.length}...`);
            
            // Create chunk-specific messages
            const chunkMessages: ChatMessage[] = [];
            
            if (systemMessage) {
                chunkMessages.push(systemMessage);
            }
            
            // Add chunk-specific instruction
            const chunkInstruction = chunks.length > 1 
                ? `This is part ${i + 1} of ${chunks.length} of a larger document. Please provide analysis for this section that can be combined with other parts.`
                : '';
            
            chunkMessages.push({
                role: 'user',
                content: `${chunkInstruction}\n\n${chunks[i]}`
            });
            
            try {
                const chunkPrompt = this.convertMessagesToGoogleFormat(chunkMessages);
                const result = await model.generateContent({
                    contents: chunkPrompt,
                    generationConfig: {
                        maxOutputTokens: Math.floor(maxOutputTokens / chunks.length) + 500, // Distribute output tokens
                        temperature: 0.7,
                    },
                });
                
                const chunkResponse = await result.response;
                chunkResults.push(chunkResponse.text());
                
                // Add delay between chunks to respect rate limits
                if (i < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error: any) {
                console.error(`❌ Error processing chunk ${i + 1}:`, error.message);
                throw new Error(`Failed to process chunk ${i + 1}: ${error.message}`);
            }
        }
        
        // Combine results
        if (chunks.length === 1) {
            return chunkResults[0];
        } else {
            console.log('🔗 Combining chunk results...');
            return this.combineChunkResults(chunkResults);
        }
    }

    /**
     * Split content into chunks that fit within token limits
     */
    private splitContentIntoChunks(content: string, maxTokensPerChunk: number): string[] {
        const estimatedTokens = this.estimateTokens(content);
        
        if (estimatedTokens <= maxTokensPerChunk) {
            return [content];
        }
        
        // Split by sections first (look for markdown headers)
        const sections = content.split(/(?=\n##?\s+)/);
        const chunks: string[] = [];
        let currentChunk = '';
        
        for (const section of sections) {
            const sectionTokens = this.estimateTokens(section);
            const currentChunkTokens = this.estimateTokens(currentChunk);
            
            if (currentChunkTokens + sectionTokens <= maxTokensPerChunk) {
                currentChunk += section;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = section;
                } else if (sectionTokens > maxTokensPerChunk) {
                    // Split large section by paragraphs
                    const paragraphs = section.split('\n\n');
                    for (const paragraph of paragraphs) {
                        const paragraphTokens = this.estimateTokens(paragraph);
                        const currentTokens = this.estimateTokens(currentChunk);
                        
                        if (currentTokens + paragraphTokens <= maxTokensPerChunk) {
                            currentChunk += '\n\n' + paragraph;
                        } else {
                            if (currentChunk) {
                                chunks.push(currentChunk.trim());
                            }
                            currentChunk = paragraph;
                        }
                    }
                } else {
                    currentChunk = section;
                }
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks.length > 0 ? chunks : [content];
    }

    /**
     * Combine results from multiple chunks
     */
    private combineChunkResults(chunkResults: string[]): string {
        if (chunkResults.length === 1) {
            return chunkResults[0];
        }
        
        // Create a combined result with clear sections
        let combined = '# Combined Analysis Results\n\n';
        combined += `This document was generated by processing ${chunkResults.length} content sections due to size limitations.\n\n`;
        
        chunkResults.forEach((result, index) => {
            combined += `## Section ${index + 1} Analysis\n\n`;
            combined += result.trim();
            combined += '\n\n---\n\n';
        });
        
        // Add a summary note
        combined += '## Integration Note\n\n';
        combined += 'This analysis was created by processing the content in multiple sections. ';
        combined += 'Each section above represents analysis of a portion of the complete project context. ';
        combined += 'Please review all sections for comprehensive understanding.\n';
        
        return combined;
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
    }    private async makeGitHubAICall(client: any, messages: ChatMessage[], maxTokens: number): Promise<string> {
    // GitHub AI via OpenAI-compatible API supports multiple models
    const possibleModels = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo", "text-davinci-003"];
    let modelName = process.env.GITHUB_AI_MODEL || possibleModels[0];
    const modelMaxTokens = this.config.getModelTokenLimit(modelName);
    console.log(`🤖 GitHub AI: Using model ${modelName}, max tokens: ${Math.min(maxTokens, modelMaxTokens)}`);

    try {
        const completion = await client.chat.completions.create({
            model: modelName,
            messages,
            max_tokens: Math.min(maxTokens, modelMaxTokens),
            temperature: 0.7
        });
        const content = completion.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('GitHub AI returned empty response');
        }
        return content;
    } catch (error: any) {
        console.error(`❌ GitHub AI call error: ${error.message}`);
        if (error.message?.includes('model') && modelName === possibleModels[0]) {
            throw new Error(`GitHub AI model ${modelName} not available. Set GITHUB_AI_MODEL env var to supported model.`);
        }
        throw error;
    }
}    private async makeOllamaCall(client: any, messages: ChatMessage[], maxTokens: number): Promise<string> {
        const { endpoint } = client;
        const modelName = 'llama2';
        const modelMaxTokens = this.config.getModelTokenLimit(modelName);
        
        const response = await fetch(`${endpoint}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                messages: messages,
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
        const result = await response.json() as { message?: { content?: string } };
        return result.message?.content || '';
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
    }    /**
     * Configure strict provider mode - disables fallback logic
     * @param providerId Specific provider to use exclusively, or null to allow fallbacks
     */
    setStrictProvider(providerId: string | null): void {
        this.strictProvider = providerId;
        this.allowFallback = providerId === null;
        
        if (providerId) {
            console.log(`🔒 Strict provider mode enabled: ${providerId} (fallback disabled)`);
            // Force the provider manager to use this specific provider
            this.providerManager.setActiveProvider(providerId);
            
            // Adjust context manager token limits for the specific provider
            this.adjustContextManagerForProvider(providerId);
        } else {
            console.log('🔓 Fallback mode enabled (all providers available)');
        }
    }

    /**
     * Adjust context manager settings for a specific provider
     * @param providerId Provider to optimize context manager for
     */
    private async adjustContextManagerForProvider(providerId: string): Promise<void> {
        try {
            // Use dynamic import to avoid circular dependency
            const { ContextManager } = await import('../contextManager.js');
            
            // Get or create a context manager instance
            const contextManager = new ContextManager();
            
            // Apply provider-specific token limit adjustments
            contextManager.adjustTokenLimitsForProvider(providerId);
            
            console.log(`🔧 Context manager optimized for provider: ${providerId}`);
        } catch (error) {
            console.warn(`Failed to adjust context manager for provider ${providerId}:`, error);
        }
    }

    /**
     * Get current strict provider setting
     */
    getStrictProvider(): string | null {
        return this.strictProvider;
    }

    /**
     * Check if fallback is allowed
     */
    isFallbackAllowed(): boolean {
        return this.allowFallback;
    }
}

// Export singleton getter function
export function getAIProcessor(): AIProcessor {
    return AIProcessor.getInstance();
}

// Export for module usage
export { AIProcessor };
