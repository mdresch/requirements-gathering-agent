/**
 * SDK Configuration Manager
 * 
 * Manages configuration for the Requirements Gathering Agent SDK.
 * Handles validation, defaults, and configuration updates.
 */

import { SDKConfig, AIProviderType } from '../types/index.js';
import { ConfigurationError } from '../errors/index.js';

/**
 * SDK Configuration Manager
 * 
 * Centralized configuration management for the SDK with:
 * - Configuration validation
 * - Default value management
 * - Environment variable integration
 * - Configuration persistence
 */
export class SDKConfiguration {
  private config: Required<SDKConfig>;
  private readonly defaults: Required<SDKConfig> = {
    aiProvider: 'google-ai',
    apiKey: '',
    endpoint: '',
    outputDirectory: './generated-docs',
    debug: false,
    timeout: 30000,
    maxRetries: 3,
    providerConfig: {}
  };

  constructor(initialConfig: SDKConfig = {}) {
    this.config = { ...this.defaults };
    this.loadFromEnvironment();
    this.update(initialConfig);
  }

  /**
   * Get a configuration value
   */
  get<K extends keyof SDKConfig>(key: K): SDKConfig[K] {
    return this.config[key];
  }

  /**
   * Set a configuration value
   */
  set<K extends keyof SDKConfig>(key: K, value: SDKConfig[K]): void {
    this.config[key] = value as any;
  }

  /**
   * Update multiple configuration values
   */
  async update(updates: Partial<SDKConfig>): Promise<void> {
    const newConfig = { ...this.config, ...updates };
    
    // Validate the new configuration
    await this.validateConfiguration(newConfig);
    
    // Apply the updates
    Object.assign(this.config, updates);
  }

  /**
   * Get the full configuration object
   */
  getAll(): Required<SDKConfig> {
    return { ...this.config };
  }

  /**
   * Reset configuration to defaults
   */
  reset(): void {
    this.config = { ...this.defaults };
    this.loadFromEnvironment();
  }

  /**
   * Validate the current configuration
   */
  async validate(): Promise<void> {
    await this.validateConfiguration(this.config);
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): void {
    const envMappings: Record<string, keyof SDKConfig> = {
      'RGA_AI_PROVIDER': 'aiProvider',
      'RGA_API_KEY': 'apiKey',
      'RGA_ENDPOINT': 'endpoint',
      'RGA_OUTPUT_DIR': 'outputDirectory',
      'RGA_DEBUG': 'debug',
      'RGA_TIMEOUT': 'timeout',
      'RGA_MAX_RETRIES': 'maxRetries',
      
      // Provider-specific environment variables
      'GOOGLE_AI_API_KEY': 'apiKey',
      'AZURE_OPENAI_API_KEY': 'apiKey',
      'GITHUB_TOKEN': 'apiKey',
      'OLLAMA_HOST': 'endpoint'
    };

    Object.entries(envMappings).forEach(([envVar, configKey]) => {
      const value = process.env[envVar];
      if (value !== undefined) {
        this.setEnvironmentValue(configKey, value);
      }
    });

    // Set AI provider based on available API keys
    if (!this.config.aiProvider || this.config.aiProvider === 'google-ai') {
      this.detectAIProvider();
    }
  }

  /**
   * Set a configuration value from environment variable
   */
  private setEnvironmentValue(key: keyof SDKConfig, value: string): void {
    switch (key) {
      case 'debug':
        this.config[key] = value.toLowerCase() === 'true';
        break;
      case 'timeout':
      case 'maxRetries':
        this.config[key] = parseInt(value, 10);
        break;
      default:
        this.config[key] = value as any;
    }
  }

  /**
   * Detect the best AI provider based on available credentials
   */
  private detectAIProvider(): void {
    const providers: { provider: AIProviderType; envVar: string }[] = [
      { provider: 'google-ai', envVar: 'GOOGLE_AI_API_KEY' },
      { provider: 'azure-openai', envVar: 'AZURE_OPENAI_API_KEY' },
      { provider: 'github-ai', envVar: 'GITHUB_TOKEN' },
      { provider: 'ollama', envVar: 'OLLAMA_HOST' }
    ];

    for (const { provider, envVar } of providers) {
      if (process.env[envVar]) {
        this.config.aiProvider = provider;
        if (!this.config.apiKey) {
          this.config.apiKey = process.env[envVar]!;
        }
        break;
      }
    }
  }

  /**
   * Validate configuration
   */
  private async validateConfiguration(config: Required<SDKConfig>): Promise<void> {
    const errors: string[] = [];

    // Validate AI provider
    const validProviders: AIProviderType[] = ['google-ai', 'azure-openai', 'azure-ai-studio', 'github-ai', 'ollama', 'custom'];
    if (!validProviders.includes(config.aiProvider)) {
      errors.push(`Invalid AI provider: ${config.aiProvider}. Must be one of: ${validProviders.join(', ')}`);
    }

    // Validate API key for providers that require it
    const providersRequiringApiKey: AIProviderType[] = ['google-ai', 'azure-openai', 'azure-ai-studio', 'github-ai'];
    if (providersRequiringApiKey.includes(config.aiProvider) && !config.apiKey) {
      errors.push(`API key is required for provider: ${config.aiProvider}`);
    }

    // Validate timeout
    if (config.timeout <= 0) {
      errors.push('Timeout must be greater than 0');
    }

    // Validate max retries
    if (config.maxRetries < 0) {
      errors.push('Max retries must be 0 or greater');
    }

    // Validate output directory
    if (!config.outputDirectory || config.outputDirectory.trim().length === 0) {
      errors.push('Output directory is required');
    }

    // Validate endpoint for custom providers
    if (config.aiProvider === 'custom' && !config.endpoint) {
      errors.push('Endpoint is required for custom AI provider');
    }

    // Validate Ollama endpoint
    if (config.aiProvider === 'ollama' && !config.endpoint) {
      // Set default Ollama endpoint if not provided
      config.endpoint = 'http://localhost:11434';
    }

    // Provider-specific validation
    await this.validateProviderSpecificConfig(config, errors);

    if (errors.length > 0) {
      throw new ConfigurationError(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate provider-specific configuration
   */
  private async validateProviderSpecificConfig(config: Required<SDKConfig>, errors: string[]): Promise<void> {
    switch (config.aiProvider) {
      case 'azure-openai':
      case 'azure-ai-studio':
        await this.validateAzureConfig(config, errors);
        break;
      case 'ollama':
        await this.validateOllamaConfig(config, errors);
        break;
      case 'custom':
        await this.validateCustomConfig(config, errors);
        break;
    }
  }

  /**
   * Validate Azure-specific configuration
   */
  private async validateAzureConfig(config: Required<SDKConfig>, errors: string[]): Promise<void> {
    const azureConfig = config.providerConfig.azure || {};
    
    if (config.aiProvider === 'azure-openai' && !config.endpoint) {
      errors.push('Azure OpenAI endpoint is required');
    }
    
    if (azureConfig.deploymentName && typeof azureConfig.deploymentName !== 'string') {
      errors.push('Azure deployment name must be a string');
    }
    
    if (azureConfig.apiVersion && typeof azureConfig.apiVersion !== 'string') {
      errors.push('Azure API version must be a string');
    }
  }

  /**
   * Validate Ollama-specific configuration
   */
  private async validateOllamaConfig(config: Required<SDKConfig>, errors: string[]): Promise<void> {
    const ollamaConfig = config.providerConfig.ollama || {};
    
    if (ollamaConfig.model && typeof ollamaConfig.model !== 'string') {
      errors.push('Ollama model must be a string');
    }
    
    // Test Ollama connection if endpoint is provided
    if (config.endpoint) {
      try {
        await this.testOllamaConnection(config.endpoint);
      } catch (error) {
        errors.push(`Cannot connect to Ollama at ${config.endpoint}: ${error.message}`);
      }
    }
  }

  /**
   * Validate custom provider configuration
   */
  private async validateCustomConfig(config: Required<SDKConfig>, errors: string[]): Promise<void> {
    if (!config.endpoint) {
      errors.push('Custom provider endpoint is required');
    }
    
    const customConfig = config.providerConfig.custom || {};
    
    if (customConfig.authType && !['apiKey', 'bearer', 'basic', 'none'].includes(customConfig.authType)) {
      errors.push('Custom provider auth type must be one of: apiKey, bearer, basic, none');
    }
  }

  /**
   * Test Ollama connection
   */
  private async testOllamaConnection(endpoint: string): Promise<void> {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${endpoint}/api/tags`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Ollama connection test failed: ${error.message}`);
    }
  }

  /**
   * Get provider-specific configuration
   */
  getProviderConfig<T = any>(provider?: AIProviderType): T {
    const targetProvider = provider || this.config.aiProvider;
    return this.config.providerConfig[targetProvider] || {};
  }

  /**
   * Set provider-specific configuration
   */
  setProviderConfig(provider: AIProviderType, config: any): void {
    this.config.providerConfig[provider] = config;
  }

  /**
   * Get configuration for debugging
   */
  getDebugInfo(): any {
    return {
      aiProvider: this.config.aiProvider,
      hasApiKey: !!this.config.apiKey,
      endpoint: this.config.endpoint,
      outputDirectory: this.config.outputDirectory,
      debug: this.config.debug,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
      providerConfigKeys: Object.keys(this.config.providerConfig)
    };
  }

  /**
   * Export configuration (without sensitive data)
   */
  export(): Partial<SDKConfig> {
    return {
      aiProvider: this.config.aiProvider,
      endpoint: this.config.endpoint,
      outputDirectory: this.config.outputDirectory,
      debug: this.config.debug,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
      providerConfig: this.sanitizeProviderConfig(this.config.providerConfig)
    };
  }

  /**
   * Import configuration
   */
  async import(config: Partial<SDKConfig>): Promise<void> {
    await this.update(config);
  }

  /**
   * Sanitize provider configuration for export (remove sensitive data)
   */
  private sanitizeProviderConfig(providerConfig: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.entries(providerConfig).forEach(([provider, config]) => {
      sanitized[provider] = { ...config };
      
      // Remove sensitive fields
      delete sanitized[provider].apiKey;
      delete sanitized[provider].clientSecret;
      delete sanitized[provider].password;
    });
    
    return sanitized;
  }
}