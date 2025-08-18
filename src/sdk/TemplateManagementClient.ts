/**
 * Template Management Client
 * 
 * Specialized client for managing document templates.
 * Provides CRUD operations and template customization capabilities.
 */

import { EventEmitter } from 'events';
import { SDKConfiguration } from './configuration/SDKConfiguration.js';
import { 
  DocumentTemplate, 
  TemplateCategory, 
  TemplateVariable,
  SearchOptions,
  SearchResult
} from './types/index.js';
import { TemplateManagementError } from './errors/index.js';

/**
 * Template Management Client
 * 
 * Handles all template-related operations including:
 * - Template CRUD operations
 * - Template validation and preview
 * - Template categorization and search
 * - Custom template creation
 * - Template versioning
 */
export class TemplateManagementClient extends EventEmitter {
  private config: SDKConfiguration;
  private templates: Map<string, DocumentTemplate> = new Map();
  private initialized = false;

  constructor(config: SDKConfiguration) {
    super();
    this.config = config;
  }

  /**
   * Initialize the template management client
   */
  async initialize(): Promise<void> {
    try {
      // Load default templates
      await this.loadDefaultTemplates();
      
      // Load custom templates from configuration
      await this.loadCustomTemplates();
      
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      throw new TemplateManagementError(`Failed to initialize template management client: ${error.message}`);
    }
  }

  /**
   * Get all available templates
   */
  async getTemplates(options?: SearchOptions): Promise<DocumentTemplate[]> {
    this.ensureInitialized();
    
    let templates = Array.from(this.templates.values());
    
    if (options) {
      templates = this.filterTemplates(templates, options);
    }
    
    return templates;
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<DocumentTemplate | null> {
    this.ensureInitialized();
    
    return this.templates.get(templateId) || null;
  }

  /**
   * Create a new template
   */
  async createTemplate(template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentTemplate> {
    this.ensureInitialized();
    
    try {
      // Validate template
      this.validateTemplate(template);
      
      const newTemplate: DocumentTemplate = {
        ...template,
        id: this.generateTemplateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: template.version || '1.0.0'
      };
      
      this.templates.set(newTemplate.id, newTemplate);
      
      this.emit('template-created', newTemplate);
      
      return newTemplate;
    } catch (error) {
      throw new TemplateManagementError(`Failed to create template: ${error.message}`);
    }
  }

  /**
   * Update an existing template
   */
  async updateTemplate(templateId: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    this.ensureInitialized();
    
    const existingTemplate = this.templates.get(templateId);
    if (!existingTemplate) {
      throw new TemplateManagementError(`Template with ID ${templateId} not found`);
    }
    
    try {
      const updatedTemplate: DocumentTemplate = {
        ...existingTemplate,
        ...updates,
        id: templateId, // Ensure ID doesn't change
        updatedAt: new Date(),
        version: this.incrementVersion(existingTemplate.version)
      };
      
      // Validate updated template
      this.validateTemplate(updatedTemplate);
      
      this.templates.set(templateId, updatedTemplate);
      
      this.emit('template-updated', updatedTemplate);
      
      return updatedTemplate;
    } catch (error) {
      throw new TemplateManagementError(`Failed to update template: ${error.message}`);
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    this.ensureInitialized();
    
    const template = this.templates.get(templateId);
    if (!template) {
      throw new TemplateManagementError(`Template with ID ${templateId} not found`);
    }
    
    this.templates.delete(templateId);
    
    this.emit('template-deleted', template);
  }

  /**
   * Clone a template
   */
  async cloneTemplate(templateId: string, newName?: string): Promise<DocumentTemplate> {
    this.ensureInitialized();
    
    const originalTemplate = this.templates.get(templateId);
    if (!originalTemplate) {
      throw new TemplateManagementError(`Template with ID ${templateId} not found`);
    }
    
    const clonedTemplate = {
      ...originalTemplate,
      name: newName || `${originalTemplate.name} (Copy)`,
      version: '1.0.0'
    };
    
    delete (clonedTemplate as any).id;
    delete (clonedTemplate as any).createdAt;
    delete (clonedTemplate as any).updatedAt;
    
    return this.createTemplate(clonedTemplate);
  }

  /**
   * Validate a template
   */
  async validateTemplate(template: DocumentTemplate | Partial<DocumentTemplate>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Basic validation
    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }
    
    if (!template.content || template.content.trim().length === 0) {
      errors.push('Template content is required');
    }
    
    if (!template.category) {
      errors.push('Template category is required');
    }
    
    // Validate template variables
    if (template.variables) {
      template.variables.forEach((variable, index) => {
        if (!variable.name || variable.name.trim().length === 0) {
          errors.push(`Variable at index ${index} must have a name`);
        }
        
        if (!variable.type) {
          errors.push(`Variable '${variable.name}' must have a type`);
        }
      });
    }
    
    // Validate template content for variable references
    if (template.content && template.variables) {
      const variableNames = template.variables.map(v => v.name);
      const contentVariables = this.extractVariablesFromContent(template.content);
      
      contentVariables.forEach(varName => {
        if (!variableNames.includes(varName)) {
          errors.push(`Template content references undefined variable: ${varName}`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Preview a template with sample data
   */
  async previewTemplate(templateId: string, sampleData?: Record<string, any>): Promise<string> {
    this.ensureInitialized();
    
    const template = this.templates.get(templateId);
    if (!template) {
      throw new TemplateManagementError(`Template with ID ${templateId} not found`);
    }
    
    try {
      return this.renderTemplate(template, sampleData || this.generateSampleData(template));
    } catch (error) {
      throw new TemplateManagementError(`Failed to preview template: ${error.message}`);
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: TemplateCategory): Promise<DocumentTemplate[]> {
    this.ensureInitialized();
    
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }

  /**
   * Search templates
   */
  async searchTemplates(options: SearchOptions): Promise<SearchResult<DocumentTemplate>> {
    this.ensureInitialized();
    
    const startTime = Date.now();
    let templates = Array.from(this.templates.values());
    
    // Apply filters
    templates = this.filterTemplates(templates, options);
    
    // Apply sorting
    if (options.sortBy) {
      templates = this.sortTemplates(templates, options.sortBy, options.sortOrder || 'asc');
    }
    
    // Apply pagination
    const totalCount = templates.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    
    templates = templates.slice(offset, offset + limit);
    
    const searchTime = Date.now() - startTime;
    
    return {
      items: templates,
      totalCount,
      hasMore: offset + limit < totalCount,
      searchTime
    };
  }

  /**
   * Get available template categories
   */
  getAvailableCategories(): TemplateCategory[] {
    return [
      'project-charter',
      'requirements',
      'scope-management',
      'risk-management',
      'stakeholder-management',
      'quality-management',
      'communication-management',
      'technical-analysis',
      'business-analysis',
      'custom'
    ];
  }

  /**
   * Export templates
   */
  async exportTemplates(templateIds?: string[]): Promise<string> {
    this.ensureInitialized();
    
    const templatesToExport = templateIds 
      ? templateIds.map(id => this.templates.get(id)).filter(Boolean)
      : Array.from(this.templates.values());
    
    return JSON.stringify(templatesToExport, null, 2);
  }

  /**
   * Import templates
   */
  async importTemplates(templatesJson: string, overwrite = false): Promise<DocumentTemplate[]> {
    this.ensureInitialized();
    
    try {
      const templates: DocumentTemplate[] = JSON.parse(templatesJson);
      const importedTemplates: DocumentTemplate[] = [];
      
      for (const template of templates) {
        const existingTemplate = Array.from(this.templates.values())
          .find(t => t.name === template.name);
        
        if (existingTemplate && !overwrite) {
          throw new TemplateManagementError(`Template '${template.name}' already exists. Use overwrite option to replace.`);
        }
        
        if (existingTemplate && overwrite) {
          const updated = await this.updateTemplate(existingTemplate.id, template);
          importedTemplates.push(updated);
        } else {
          const created = await this.createTemplate(template);
          importedTemplates.push(created);
        }
      }
      
      this.emit('templates-imported', importedTemplates);
      
      return importedTemplates;
    } catch (error) {
      throw new TemplateManagementError(`Failed to import templates: ${error.message}`);
    }
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(): Promise<any> {
    this.ensureInitialized();
    
    const templates = Array.from(this.templates.values());
    
    const stats = {
      totalTemplates: templates.length,
      categoryCounts: {} as Record<string, number>,
      averageVariableCount: 0,
      mostUsedCategory: '',
      recentlyCreated: templates
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
      recentlyUpdated: templates
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5)
    };
    
    // Calculate category counts
    templates.forEach(template => {
      stats.categoryCounts[template.category] = (stats.categoryCounts[template.category] || 0) + 1;
    });
    
    // Find most used category
    stats.mostUsedCategory = Object.entries(stats.categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    
    // Calculate average variable count
    const totalVariables = templates.reduce((sum, template) => sum + (template.variables?.length || 0), 0);
    stats.averageVariableCount = templates.length > 0 ? totalVariables / templates.length : 0;
    
    return stats;
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<string> {
    if (!this.initialized) {
      return 'unhealthy';
    }
    
    try {
      // Perform basic health checks
      const templateCount = this.templates.size;
      
      if (templateCount === 0) {
        return 'degraded';
      }
      
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.templates.clear();
    this.initialized = false;
    this.emit('cleanup');
  }

  // === Private Methods ===

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new TemplateManagementError('Template management client not initialized');
    }
  }

  private async loadDefaultTemplates(): Promise<void> {
    // Load default PMBOK templates
    const defaultTemplates = this.getDefaultTemplates();
    
    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private async loadCustomTemplates(): Promise<void> {
    // Load custom templates from configuration or file system
    // This would be implemented based on the storage mechanism
  }

  private getDefaultTemplates(): DocumentTemplate[] {
    return [
      {
        id: 'project-charter-default',
        name: 'Project Charter',
        description: 'Standard PMBOK project charter template',
        category: 'project-charter',
        content: `# Project Charter

## Project Title
{{projectName}}

## Business Problem
{{businessProblem}}

## Project Objectives
{{objectives}}

## Stakeholders
{{stakeholders}}

## Success Criteria
{{successCriteria}}

## High-Level Requirements
{{requirements}}

## Budget and Timeline
{{budget}}
{{timeline}}`,
        variables: [
          { name: 'projectName', type: 'string', description: 'Name of the project', required: true },
          { name: 'businessProblem', type: 'string', description: 'Business problem being solved', required: true },
          { name: 'objectives', type: 'string', description: 'Project objectives' },
          { name: 'stakeholders', type: 'string', description: 'Key stakeholders' },
          { name: 'successCriteria', type: 'string', description: 'Success criteria' },
          { name: 'requirements', type: 'string', description: 'High-level requirements' },
          { name: 'budget', type: 'string', description: 'Budget information' },
          { name: 'timeline', type: 'string', description: 'Timeline information' }
        ],
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'System',
        tags: ['pmbok', 'initiation', 'charter']
      },
      {
        id: 'stakeholder-register-default',
        name: 'Stakeholder Register',
        description: 'Standard stakeholder register template',
        category: 'stakeholder-management',
        content: `# Stakeholder Register

## Project Information
- **Project Name:** {{projectName}}
- **Date:** {{date}}

## Stakeholder Information

{{stakeholderList}}

## Stakeholder Analysis Matrix

{{stakeholderMatrix}}

## Engagement Strategies

{{engagementStrategies}}`,
        variables: [
          { name: 'projectName', type: 'string', description: 'Name of the project', required: true },
          { name: 'date', type: 'date', description: 'Document creation date' },
          { name: 'stakeholderList', type: 'string', description: 'List of stakeholders' },
          { name: 'stakeholderMatrix', type: 'string', description: 'Stakeholder analysis matrix' },
          { name: 'engagementStrategies', type: 'string', description: 'Engagement strategies' }
        ],
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'System',
        tags: ['pmbok', 'stakeholder', 'register']
      }
      // Add more default templates as needed
    ];
  }

  private validateTemplate(template: any): void {
    const validation = this.validateTemplate(template);
    if (!validation.isValid) {
      throw new TemplateManagementError(`Template validation failed: ${validation.errors.join(', ')}`);
    }
  }

  private generateTemplateId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private extractVariablesFromContent(content: string): string[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  }

  private renderTemplate(template: DocumentTemplate, data: Record<string, any>): string {
    let content = template.content;
    
    // Replace variables with data
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, String(value));
    });
    
    return content;
  }

  private generateSampleData(template: DocumentTemplate): Record<string, any> {
    const sampleData: Record<string, any> = {};
    
    template.variables?.forEach(variable => {
      switch (variable.type) {
        case 'string':
          sampleData[variable.name] = `Sample ${variable.name}`;
          break;
        case 'number':
          sampleData[variable.name] = 42;
          break;
        case 'boolean':
          sampleData[variable.name] = true;
          break;
        case 'date':
          sampleData[variable.name] = new Date().toISOString().split('T')[0];
          break;
        case 'array':
          sampleData[variable.name] = ['Item 1', 'Item 2', 'Item 3'];
          break;
        case 'object':
          sampleData[variable.name] = { key: 'value' };
          break;
        default:
          sampleData[variable.name] = `Sample ${variable.name}`;
      }
    });
    
    return sampleData;
  }

  private filterTemplates(templates: DocumentTemplate[], options: SearchOptions): DocumentTemplate[] {
    let filtered = templates;
    
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (options.category) {
      filtered = filtered.filter(template => template.category === options.category);
    }
    
    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter(template => 
        template.tags?.some(tag => options.tags!.includes(tag))
      );
    }
    
    if (options.author) {
      filtered = filtered.filter(template => template.author === options.author);
    }
    
    if (options.dateRange) {
      filtered = filtered.filter(template => 
        template.createdAt >= options.dateRange!.start &&
        template.createdAt <= options.dateRange!.end
      );
    }
    
    return filtered;
  }

  private sortTemplates(templates: DocumentTemplate[], sortBy: string, sortOrder: 'asc' | 'desc'): DocumentTemplate[] {
    return templates.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'relevance':
          // For relevance, we'd need a more sophisticated scoring system
          return 0;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}