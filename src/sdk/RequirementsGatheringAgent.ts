/**
 * Main Requirements Gathering Agent SDK Client
 * 
 * Primary entry point for developers to interact with the Requirements Gathering Agent.
 * Provides a unified interface for all functionality including document generation,
 * AI processing, template management, and integrations.
 */

import { EventEmitter } from 'events';
import { DocumentGenerationClient } from './DocumentGenerationClient.js';
import { AIProcessingClient } from './AIProcessingClient.js';
import { TemplateManagementClient } from './TemplateManagementClient.js';
import { ProjectAnalysisClient } from './ProjectAnalysisClient.js';
import { ValidationClient } from './ValidationClient.js';
import { IntegrationClient } from './IntegrationClient.js';
import { SDKConfiguration } from './configuration/SDKConfiguration.js';
import { PluginManager } from './plugins/PluginManager.js';
import { 
  SDKConfig, 
  ProjectContext, 
  DocumentGenerationOptions, 
  DocumentGenerationResult,
  AIAnalysisRequest,
  AIAnalysisResult,
  ValidationResult,
  PublishOptions,
  PublishResult,
  ProgressCallback,
  AnalyticsData
} from './types/index.js';
import { SDKError, ConfigurationError, ValidationError } from './errors/index.js';

/**
 * Main Requirements Gathering Agent SDK Client
 * 
 * @example
 * ```typescript
 * const agent = new RequirementsGatheringAgent({
 *   aiProvider: 'google-ai',
 *   apiKey: process.env.GOOGLE_AI_API_KEY,
 *   outputDirectory: './generated-docs'
 * });
 * 
 * await agent.initialize();
 * 
 * const result = await agent.generateProjectCharter({
 *   projectName: 'E-commerce Platform',
 *   businessProblem: 'Need to modernize legacy shopping system',
 *   technologyStack: ['React', 'Node.js', 'PostgreSQL']
 * });
 * ```
 */
export class RequirementsGatheringAgent extends EventEmitter {
  private config: SDKConfiguration;
  private documentClient: DocumentGenerationClient;
  private aiClient: AIProcessingClient;
  private templateClient: TemplateManagementClient;
  private projectClient: ProjectAnalysisClient;
  private validationClient: ValidationClient;
  private integrationClient: IntegrationClient;
  private pluginManager: PluginManager;
  private initialized = false;

  constructor(config: SDKConfig = {}) {
    super();
    
    this.config = new SDKConfiguration(config);
    this.pluginManager = new PluginManager();
    
    // Initialize client modules
    this.documentClient = new DocumentGenerationClient(this.config);
    this.aiClient = new AIProcessingClient(this.config);
    this.templateClient = new TemplateManagementClient(this.config);
    this.projectClient = new ProjectAnalysisClient(this.config);
    this.validationClient = new ValidationClient(this.config);
    this.integrationClient = new IntegrationClient(this.config);

    // Set up event forwarding
    this.setupEventForwarding();
  }

  /**
   * Initialize the SDK and all its components
   */
  async initialize(): Promise<void> {
    try {
      this.emit('initializing');
      
      // Validate configuration
      await this.config.validate();
      
      // Initialize all client modules
      await Promise.all([
        this.documentClient.initialize(),
        this.aiClient.initialize(),
        this.templateClient.initialize(),
        this.projectClient.initialize(),
        this.validationClient.initialize(),
        this.integrationClient.initialize()
      ]);

      // Load and initialize plugins
      await this.pluginManager.loadPlugins();
      
      this.initialized = true;
      this.emit('initialized');
      
    } catch (error) {
      this.emit('error', error);
      throw new ConfigurationError(`Failed to initialize SDK: ${error.message}`);
    }
  }

  /**
   * Check if the SDK is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the current configuration
   */
  getConfiguration(): SDKConfiguration {
    return this.config;
  }

  /**
   * Update the configuration
   */
  async updateConfiguration(newConfig: Partial<SDKConfig>): Promise<void> {
    await this.config.update(newConfig);
    
    // Reinitialize clients with new configuration
    await this.initialize();
  }

  // === Document Generation Methods ===

  /**
   * Generate a project charter document
   */
  async generateProjectCharter(
    context: ProjectContext, 
    options?: DocumentGenerationOptions,
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    return this.documentClient.generateProjectCharter(context, options, progressCallback);
  }

  /**
   * Generate requirements documentation
   */
  async generateRequirementsDocumentation(
    context: ProjectContext,
    options?: DocumentGenerationOptions,
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    return this.documentClient.generateRequirementsDocumentation(context, options, progressCallback);
  }

  /**
   * Generate stakeholder register
   */
  async generateStakeholderRegister(
    context: ProjectContext,
    options?: DocumentGenerationOptions,
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    return this.documentClient.generateStakeholderRegister(context, options, progressCallback);
  }

  /**
   * Generate risk management plan
   */
  async generateRiskManagementPlan(
    context: ProjectContext,
    options?: DocumentGenerationOptions,
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    return this.documentClient.generateRiskManagementPlan(context, options, progressCallback);
  }

  /**
   * Generate all PMBOK documents for a project
   */
  async generateAllDocuments(
    context: ProjectContext,
    options?: DocumentGenerationOptions,
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult[]> {
    this.ensureInitialized();
    return this.documentClient.generateAllDocuments(context, options, progressCallback);
  }

  /**
   * Generate documents by category
   */
  async generateDocumentsByCategory(
    category: string,
    context: ProjectContext,
    options?: DocumentGenerationOptions,
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult[]> {
    this.ensureInitialized();
    return this.documentClient.generateDocumentsByCategory(category, context, options, progressCallback);
  }

  /**
   * Generate a custom document using a template
   */
  async generateCustomDocument(
    templateId: string,
    context: ProjectContext,
    options?: DocumentGenerationOptions,
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    return this.documentClient.generateCustomDocument(templateId, context, options, progressCallback);
  }

  // === AI Processing Methods ===

  /**
   * Analyze project requirements using AI
   */
  async analyzeRequirements(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    this.ensureInitialized();
    return this.aiClient.analyzeRequirements(request);
  }

  /**
   * Perform stakeholder analysis
   */
  async analyzeStakeholders(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    this.ensureInitialized();
    return this.aiClient.analyzeStakeholders(request);
  }

  /**
   * Assess project risks using AI
   */
  async assessRisks(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    this.ensureInitialized();
    return this.aiClient.assessRisks(request);
  }

  /**
   * Perform technical analysis
   */
  async analyzeTechnicalRequirements(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    this.ensureInitialized();
    return this.aiClient.analyzeTechnicalRequirements(request);
  }

  /**
   * Generate content using AI
   */
  async generateContent(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    this.ensureInitialized();
    return this.aiClient.generateContent(request);
  }

  // === Project Analysis Methods ===

  /**
   * Analyze project context and provide insights
   */
  async analyzeProject(context: ProjectContext): Promise<any> {
    this.ensureInitialized();
    return this.projectClient.analyzeProject(context);
  }

  /**
   * Generate project recommendations
   */
  async generateRecommendations(context: ProjectContext): Promise<any> {
    this.ensureInitialized();
    return this.projectClient.generateRecommendations(context);
  }

  /**
   * Assess project complexity
   */
  async assessComplexity(context: ProjectContext): Promise<any> {
    this.ensureInitialized();
    return this.projectClient.assessComplexity(context);
  }

  // === Validation Methods ===

  /**
   * Validate document for PMBOK compliance
   */
  async validateDocument(documentPath: string): Promise<ValidationResult> {
    this.ensureInitialized();
    return this.validationClient.validateDocument(documentPath);
  }

  /**
   * Validate project context
   */
  async validateProjectContext(context: ProjectContext): Promise<ValidationResult> {
    this.ensureInitialized();
    return this.validationClient.validateProjectContext(context);
  }

  /**
   * Batch validate multiple documents
   */
  async validateDocuments(documentPaths: string[]): Promise<ValidationResult[]> {
    this.ensureInitialized();
    return this.validationClient.validateDocuments(documentPaths);
  }

  // === Integration Methods ===

  /**
   * Publish documents to Confluence
   */
  async publishToConfluence(
    documentPaths: string[],
    options: PublishOptions
  ): Promise<PublishResult[]> {
    this.ensureInitialized();
    return this.integrationClient.publishToConfluence(documentPaths, options);
  }

  /**
   * Publish documents to SharePoint
   */
  async publishToSharePoint(
    documentPaths: string[],
    options: PublishOptions
  ): Promise<PublishResult[]> {
    this.ensureInitialized();
    return this.integrationClient.publishToSharePoint(documentPaths, options);
  }

  /**
   * Sync with version control system
   */
  async syncWithVCS(options: any): Promise<any> {
    this.ensureInitialized();
    return this.integrationClient.syncWithVCS(options);
  }

  // === Template Management Methods ===

  /**
   * Get available templates
   */
  async getTemplates(): Promise<any[]> {
    this.ensureInitialized();
    return this.templateClient.getTemplates();
  }

  /**
   * Create a new template
   */
  async createTemplate(template: any): Promise<any> {
    this.ensureInitialized();
    return this.templateClient.createTemplate(template);
  }

  /**
   * Update an existing template
   */
  async updateTemplate(templateId: string, updates: any): Promise<any> {
    this.ensureInitialized();
    return this.templateClient.updateTemplate(templateId, updates);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    this.ensureInitialized();
    return this.templateClient.deleteTemplate(templateId);
  }

  // === Plugin Management Methods ===

  /**
   * Install a plugin
   */
  async installPlugin(pluginName: string, config?: any): Promise<void> {
    return this.pluginManager.installPlugin(pluginName, config);
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginName: string): Promise<void> {
    return this.pluginManager.uninstallPlugin(pluginName);
  }

  /**
   * Get installed plugins
   */
  getInstalledPlugins(): any[] {
    return this.pluginManager.getInstalledPlugins();
  }

  // === Analytics and Monitoring Methods ===

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<AnalyticsData> {
    this.ensureInitialized();
    // Implementation would aggregate data from all clients
    return {
      documentsGenerated: 0,
      templatesUsed: {},
      aiProviderUsage: {},
      averageGenerationTime: 0,
      validationScores: [],
      errorRates: {},
      userActivity: []
    };
  }

  /**
   * Get health status of all components
   */
  async getHealthStatus(): Promise<any> {
    this.ensureInitialized();
    
    const health = {
      overall: 'healthy',
      components: {
        documentGeneration: await this.documentClient.getHealthStatus(),
        aiProcessing: await this.aiClient.getHealthStatus(),
        templateManagement: await this.templateClient.getHealthStatus(),
        projectAnalysis: await this.projectClient.getHealthStatus(),
        validation: await this.validationClient.getHealthStatus(),
        integrations: await this.integrationClient.getHealthStatus()
      }
    };

    // Determine overall health
    const componentStatuses = Object.values(health.components);
    if (componentStatuses.some(status => status === 'unhealthy')) {
      health.overall = 'unhealthy';
    } else if (componentStatuses.some(status => status === 'degraded')) {
      health.overall = 'degraded';
    }

    return health;
  }

  // === Utility Methods ===

  /**
   * Clean up resources and close connections
   */
  async cleanup(): Promise<void> {
    this.emit('cleanup');
    
    await Promise.all([
      this.documentClient.cleanup(),
      this.aiClient.cleanup(),
      this.templateClient.cleanup(),
      this.projectClient.cleanup(),
      this.validationClient.cleanup(),
      this.integrationClient.cleanup()
    ]);

    this.initialized = false;
    this.emit('cleaned-up');
  }

  /**
   * Reset the SDK to initial state
   */
  async reset(): Promise<void> {
    await this.cleanup();
    await this.initialize();
  }

  // === Private Methods ===

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new SDKError('SDK_NOT_INITIALIZED', 'SDK must be initialized before use. Call initialize() first.');
    }
  }

  private setupEventForwarding(): void {
    // Forward events from client modules
    const clients = [
      this.documentClient,
      this.aiClient,
      this.templateClient,
      this.projectClient,
      this.validationClient,
      this.integrationClient
    ];

    clients.forEach(client => {
      client.on('progress', (data) => this.emit('progress', data));
      client.on('error', (error) => this.emit('error', error));
      client.on('warning', (warning) => this.emit('warning', warning));
      client.on('info', (info) => this.emit('info', info));
    });
  }
}