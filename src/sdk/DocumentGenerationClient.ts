/**
 * Document Generation Client
 * 
 * Specialized client for document generation functionality.
 * Provides easy-to-use methods for generating various types of project documents.
 */

import { EventEmitter } from 'events';
import { DocumentGenerator } from '../modules/documentGenerator/DocumentGenerator.js';
import { SDKConfiguration } from './configuration/SDKConfiguration.js';
import { 
  ProjectContext, 
  DocumentGenerationOptions, 
  DocumentGenerationResult,
  ProgressCallback,
  BatchProcessingOptions,
  BatchProcessingResult,
  DocumentFormat,
  TemplateCategory
} from './types/index.js';
import { DocumentGenerationError } from './errors/index.js';

/**
 * Document Generation Client
 * 
 * Handles all document generation operations with support for:
 * - PMBOK-compliant document generation
 * - Custom template processing
 * - Batch document generation
 * - Progress tracking and callbacks
 * - Multiple output formats
 */
export class DocumentGenerationClient extends EventEmitter {
  private config: SDKConfiguration;
  private generator: DocumentGenerator;
  private initialized = false;

  constructor(config: SDKConfiguration) {
    super();
    this.config = config;
  }

  /**
   * Initialize the document generation client
   */
  async initialize(): Promise<void> {
    try {
      // Initialize the document generator with configuration
      this.generator = new DocumentGenerator(
        this.config.get('outputDirectory') || './generated-docs',
        {
          aiProvider: this.config.get('aiProvider'),
          retryCount: this.config.get('maxRetries') || 3,
          enableValidation: true
        }
      );

      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      throw new DocumentGenerationError(`Failed to initialize document generation client: ${error.message}`);
    }
  }

  /**
   * Generate a project charter document
   */
  async generateProjectCharter(
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Generating Project Charter', progress: 0 });
      
      const result = await this.generator.generateOne('project-charter');
      
      progressCallback?.({ stage: 'Project Charter Generated', progress: 100 });
      
      return this.formatResult(result, 'project-charter', options);
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate project charter: ${error.message}`);
    }
  }

  /**
   * Generate requirements documentation
   */
  async generateRequirementsDocumentation(
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Generating Requirements Documentation', progress: 0 });
      
      const result = await this.generator.generateOne('requirements-documentation');
      
      progressCallback?.({ stage: 'Requirements Documentation Generated', progress: 100 });
      
      return this.formatResult(result, 'requirements-documentation', options);
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate requirements documentation: ${error.message}`);
    }
  }

  /**
   * Generate stakeholder register
   */
  async generateStakeholderRegister(
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Generating Stakeholder Register', progress: 0 });
      
      const result = await this.generator.generateOne('stakeholder-register');
      
      progressCallback?.({ stage: 'Stakeholder Register Generated', progress: 100 });
      
      return this.formatResult(result, 'stakeholder-register', options);
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate stakeholder register: ${error.message}`);
    }
  }

  /**
   * Generate risk management plan
   */
  async generateRiskManagementPlan(
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Generating Risk Management Plan', progress: 0 });
      
      const result = await this.generator.generateOne('risk-management-plan');
      
      progressCallback?.({ stage: 'Risk Management Plan Generated', progress: 100 });
      
      return this.formatResult(result, 'risk-management-plan', options);
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate risk management plan: ${error.message}`);
    }
  }

  /**
   * Generate scope management plan
   */
  async generateScopeManagementPlan(
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Generating Scope Management Plan', progress: 0 });
      
      const result = await this.generator.generateOne('scope-management-plan');
      
      progressCallback?.({ stage: 'Scope Management Plan Generated', progress: 100 });
      
      return this.formatResult(result, 'scope-management-plan', options);
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate scope management plan: ${error.message}`);
    }
  }

  /**
   * Generate quality management plan
   */
  async generateQualityManagementPlan(
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Generating Quality Management Plan', progress: 0 });
      
      const result = await this.generator.generateOne('quality-management-plan');
      
      progressCallback?.({ stage: 'Quality Management Plan Generated', progress: 100 });
      
      return this.formatResult(result, 'quality-management-plan', options);
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate quality management plan: ${error.message}`);
    }
  }

  /**
   * Generate communication management plan
   */
  async generateCommunicationManagementPlan(
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Generating Communication Management Plan', progress: 0 });
      
      const result = await this.generator.generateOne('communication-management-plan');
      
      progressCallback?.({ stage: 'Communication Management Plan Generated', progress: 100 });
      
      return this.formatResult(result, 'communication-management-plan', options);
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate communication management plan: ${error.message}`);
    }
  }

  /**
   * Generate work breakdown structure (WBS)
   */
  async generateWorkBreakdownStructure(
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Generating Work Breakdown Structure', progress: 0 });
      
      const result = await this.generator.generateOne('work-breakdown-structure');
      
      progressCallback?.({ stage: 'Work Breakdown Structure Generated', progress: 100 });
      
      return this.formatResult(result, 'work-breakdown-structure', options);
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate work breakdown structure: ${error.message}`);
    }
  }

  /**
   * Generate all PMBOK documents for a project
   */
  async generateAllDocuments(
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult[]> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Starting Full Document Generation', progress: 0 });
      
      const result = await this.generator.generateAll();
      
      progressCallback?.({ stage: 'All Documents Generated', progress: 100 });
      
      // Convert the result to an array of DocumentGenerationResult
      const results: DocumentGenerationResult[] = [];
      
      if (result.success) {
        // Create results for each generated document
        result.generatedDocuments?.forEach((doc, index) => {
          results.push({
            success: true,
            documentPath: doc,
            generationTime: result.totalTime / (result.generatedDocuments?.length || 1),
            metadata: {
              title: this.extractTitleFromPath(doc),
              createdAt: new Date()
            }
          });
        });
      }
      
      return results;
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate all documents: ${error.message}`);
    }
  }

  /**
   * Generate documents by category
   */
  async generateDocumentsByCategory(
    category: string,
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult[]> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: `Generating ${category} Documents`, progress: 0 });
      
      // Get tasks for the specified category
      const { getTasksByCategory } = await import('../modules/documentGenerator/generationTasks.js');
      const tasks = getTasksByCategory(category);
      
      const results: DocumentGenerationResult[] = [];
      
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const progress = ((i + 1) / tasks.length) * 100;
        
        progressCallback?.({ 
          stage: `Generating ${task.name}`, 
          progress 
        });
        
        try {
          const result = await this.generator.generateOne(task.key);
          results.push(this.formatResult(result, task.key, options));
        } catch (error) {
          results.push({
            success: false,
            errors: [error.message],
            metadata: {
              title: task.name,
              createdAt: new Date()
            }
          });
        }
      }
      
      progressCallback?.({ stage: `${category} Documents Generated`, progress: 100 });
      
      return results;
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate documents by category: ${error.message}`);
    }
  }

  /**
   * Generate a custom document using a template
   */
  async generateCustomDocument(
    templateId: string,
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    progressCallback?: ProgressCallback
  ): Promise<DocumentGenerationResult> {
    this.ensureInitialized();
    
    try {
      progressCallback?.({ stage: 'Generating Custom Document', progress: 0 });
      
      // This would integrate with the template system
      const result = await this.generator.generateOne(templateId);
      
      progressCallback?.({ stage: 'Custom Document Generated', progress: 100 });
      
      return this.formatResult(result, templateId, options);
    } catch (error) {
      throw new DocumentGenerationError(`Failed to generate custom document: ${error.message}`);
    }
  }

  /**
   * Batch generate multiple documents
   */
  async batchGenerate(
    documentKeys: string[],
    context: ProjectContext,
    options: DocumentGenerationOptions = {},
    batchOptions: BatchProcessingOptions = {}
  ): Promise<BatchProcessingResult<DocumentGenerationResult>> {
    this.ensureInitialized();
    
    const startTime = Date.now();
    const results: DocumentGenerationResult[] = [];
    let successCount = 0;
    let failureCount = 0;
    
    try {
      const maxConcurrency = batchOptions.maxConcurrency || 3;
      const continueOnError = batchOptions.continueOnError ?? true;
      
      // Process documents in batches
      for (let i = 0; i < documentKeys.length; i += maxConcurrency) {
        const batch = documentKeys.slice(i, i + maxConcurrency);
        const batchPromises = batch.map(async (key, index) => {
          try {
            const progress = ((i + index + 1) / documentKeys.length) * 100;
            batchOptions.progressCallback?.({
              stage: `Generating ${key}`,
              progress
            });
            
            const result = await this.generator.generateOne(key);
            const formattedResult = this.formatResult(result, key, options);
            
            if (formattedResult.success) {
              successCount++;
            } else {
              failureCount++;
            }
            
            return formattedResult;
          } catch (error) {
            failureCount++;
            
            if (!continueOnError) {
              throw error;
            }
            
            return {
              success: false,
              errors: [error.message],
              metadata: {
                title: key,
                createdAt: new Date()
              }
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      const totalProcessingTime = Date.now() - startTime;
      
      return {
        success: failureCount === 0,
        results,
        successCount,
        failureCount,
        totalProcessingTime
      };
      
    } catch (error) {
      throw new DocumentGenerationError(`Batch generation failed: ${error.message}`);
    }
  }

  /**
   * Get available document types
   */
  async getAvailableDocumentTypes(): Promise<string[]> {
    this.ensureInitialized();
    
    const { GENERATION_TASKS } = await import('../modules/documentGenerator/generationTasks.js');
    return GENERATION_TASKS.map(task => task.key);
  }

  /**
   * Get available categories
   */
  async getAvailableCategories(): Promise<string[]> {
    this.ensureInitialized();
    
    const { getAvailableCategories } = await import('../modules/documentGenerator.js');
    return getAvailableCategories();
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<string> {
    if (!this.initialized) {
      return 'unhealthy';
    }
    
    try {
      // Perform a simple health check
      await this.getAvailableDocumentTypes();
      return 'healthy';
    } catch (error) {
      return 'degraded';
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
    this.emit('cleanup');
  }

  // === Private Methods ===

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new DocumentGenerationError('Document generation client not initialized');
    }
  }

  private formatResult(
    result: any, 
    documentKey: string, 
    options: DocumentGenerationOptions
  ): DocumentGenerationResult {
    return {
      success: result === true || (typeof result === 'object' && result.success),
      documentPath: this.getDocumentPath(documentKey, options.format),
      metadata: {
        title: this.formatTitle(documentKey),
        createdAt: new Date(),
        pmbok: this.getPMBOKMetadata(documentKey)
      },
      generationTime: 0, // Would be tracked in actual implementation
      warnings: [],
      errors: result === false ? ['Generation failed'] : []
    };
  }

  private getDocumentPath(documentKey: string, format: DocumentFormat = 'markdown'): string {
    const outputDir = this.config.get('outputDirectory') || './generated-docs';
    const extension = this.getFileExtension(format);
    return `${outputDir}/${documentKey}.${extension}`;
  }

  private getFileExtension(format: DocumentFormat): string {
    const extensions = {
      markdown: 'md',
      pdf: 'pdf',
      docx: 'docx',
      html: 'html'
    };
    return extensions[format] || 'md';
  }

  private formatTitle(documentKey: string): string {
    return documentKey
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getPMBOKMetadata(documentKey: string): any {
    // Map document keys to PMBOK metadata
    const pmbokMapping: Record<string, any> = {
      'project-charter': { phase: 'initiation', processGroup: 'Initiating', knowledgeArea: 'Integration' },
      'stakeholder-register': { phase: 'initiation', processGroup: 'Initiating', knowledgeArea: 'Stakeholder' },
      'risk-management-plan': { phase: 'planning', processGroup: 'Planning', knowledgeArea: 'Risk' },
      'scope-management-plan': { phase: 'planning', processGroup: 'Planning', knowledgeArea: 'Scope' },
      'quality-management-plan': { phase: 'planning', processGroup: 'Planning', knowledgeArea: 'Quality' },
      'communication-management-plan': { phase: 'planning', processGroup: 'Planning', knowledgeArea: 'Communication' },
      'work-breakdown-structure': { phase: 'planning', processGroup: 'Planning', knowledgeArea: 'Scope' }
    };
    
    return pmbokMapping[documentKey] || { phase: 'planning', processGroup: 'Planning', knowledgeArea: 'General' };
  }

  private extractTitleFromPath(path: string): string {
    const filename = path.split('/').pop() || '';
    const nameWithoutExtension = filename.split('.')[0];
    return this.formatTitle(nameWithoutExtension);
  }
}