/**
 * Dependency Registry Service
 * 
 * This service manages the synchronization between the database templates
 * and the frontend dependency registry to ensure consistency.
 */

import { logger } from '../utils/logger.js';
import { ITemplate } from '../models/Template.model.js';

export interface DependencyRegistryEntry {
  templateId: string;
  templateName: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  pmbokKnowledgeArea: string;
  dependencies: string[];
  description: string;
  estimatedTime: string;
}

export class DependencyRegistryService {
  private static dependencyRegistry: Map<string, DependencyRegistryEntry> = new Map();

  /**
   * Initialize the dependency registry with existing templates
   */
  static async initialize(templates: ITemplate[]): Promise<void> {
    try {
      logger.info('🔄 Initializing dependency registry with existing templates...');
      
      this.dependencyRegistry.clear();
      
      for (const template of templates) {
        await this.addTemplateToRegistry(template);
      }
      
      logger.info(`✅ Dependency registry initialized with ${templates.length} templates`);
    } catch (error) {
      logger.error('❌ Failed to initialize dependency registry:', error);
      throw error;
    }
  }

  /**
   * Add a new template to the dependency registry
   */
  static async addTemplateToRegistry(template: ITemplate): Promise<void> {
    try {
      const templateId = (template._id as any).toString();
      
      // Determine PMBOK knowledge area based on category
      const pmbokKnowledgeArea = this.mapCategoryToPmbokArea(template.category);
      
      // Determine priority based on category and metadata
      const priority = this.determinePriority(template);
      
      // Determine dependencies based on category and metadata
      const dependencies = this.determineDependencies(template);
      
      // Estimate time based on category
      const estimatedTime = this.estimateTime(template.category);
      
      const entry: DependencyRegistryEntry = {
        templateId,
        templateName: template.name,
        category: template.category,
        priority,
        pmbokKnowledgeArea,
        dependencies,
        description: template.description || `${template.name} template`,
        estimatedTime
      };
      
      this.dependencyRegistry.set(templateId, entry);
      
      logger.info(`✅ Added template to dependency registry: ${template.name} (${templateId})`);
    } catch (error) {
      logger.error(`❌ Failed to add template to dependency registry: ${template.name}`, error);
      throw error;
    }
  }

  /**
   * Update the dependency registry when a template is modified
   */
  static async updateTemplateInRegistry(template: ITemplate): Promise<void> {
    try {
      const templateId = (template._id as any).toString();
      
      if (this.dependencyRegistry.has(templateId)) {
        await this.addTemplateToRegistry(template);
        logger.info(`✅ Updated template in dependency registry: ${template.name} (${templateId})`);
      } else {
        logger.warn(`⚠️ Template not found in dependency registry: ${template.name} (${templateId})`);
        await this.addTemplateToRegistry(template);
      }
    } catch (error) {
      logger.error(`❌ Failed to update template in dependency registry: ${template.name}`, error);
      throw error;
    }
  }

  /**
   * Remove a template from the dependency registry
   */
  static async removeTemplateFromRegistry(templateId: string): Promise<void> {
    try {
      if (this.dependencyRegistry.has(templateId)) {
        this.dependencyRegistry.delete(templateId);
        logger.info(`✅ Removed template from dependency registry: ${templateId}`);
      } else {
        logger.warn(`⚠️ Template not found in dependency registry: ${templateId}`);
      }
    } catch (error) {
      logger.error(`❌ Failed to remove template from dependency registry: ${templateId}`, error);
      throw error;
    }
  }

  /**
   * Get the current dependency registry as a JavaScript object
   */
  static getRegistryAsObject(): Record<string, DependencyRegistryEntry> {
    const registry: Record<string, DependencyRegistryEntry> = {};
    
    for (const [templateId, entry] of this.dependencyRegistry) {
      registry[templateId] = entry;
    }
    
    return registry;
  }

  /**
   * Generate the dependency registry file content
   */
  static generateRegistryFileContent(): string {
    const registry = this.getRegistryAsObject();
    
    let content = `/**
 * Document Dependencies Validation System
 * 
 * This module provides validation for document dependencies based on PMBOK knowledge areas
 * and ensures required context documents are available before generating dependent documents.
 * 
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * Last updated: ${new Date().toISOString()}
 */

export interface DocumentDependency {
  templateId: string;
  templateName: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  pmbokKnowledgeArea: string;
  dependencies: string[]; // Array of template IDs this document depends on
  description: string;
  estimatedTime: string;
}

export interface DependencyValidationResult {
  isValid: boolean;
  missingDependencies: DocumentDependency[];
  warnings: string[];
  recommendations: string[];
}

// Define document dependencies based on PMBOK analysis
// Using actual template IDs from the database
export const DOCUMENT_DEPENDENCIES: Record<string, DocumentDependency> = {
`;

    // Add each template to the registry
    for (const [templateId, entry] of Object.entries(registry)) {
      content += `  // ${entry.templateName} (MongoDB ID: ${templateId})
  '${templateId}': {
    templateId: '${templateId}',
    templateName: '${entry.templateName}',
    category: '${entry.category}',
    priority: '${entry.priority}',
    pmbokKnowledgeArea: '${entry.pmbokKnowledgeArea}',
    dependencies: [${entry.dependencies.map(dep => `'${dep}'`).join(', ')}],
    description: '${entry.description}',
    estimatedTime: '${entry.estimatedTime}'
  },
`;
    }

    content += `};

/**
 * Validates if all required dependencies are available for a given document template
 */
export function validateDocumentDependencies(
  templateId: string,
  availableDocuments: Array<{ id: string; name: string; templateId?: string }>
): DependencyValidationResult {
  const template = DOCUMENT_DEPENDENCIES[templateId];
  
  if (!template) {
    return {
      isValid: false,
      missingDependencies: [],
      warnings: [\`Template '\${templateId}' not found in dependency registry\`],
      recommendations: ['Check template ID and ensure it exists in the system']
    };
  }

  if (template.dependencies.length === 0) {
    return {
      isValid: true,
      missingDependencies: [],
      warnings: [],
      recommendations: []
    };
  }

  const availableTemplateIds = availableDocuments.map(doc => doc.templateId || doc.id);
  const missingDependencies: DocumentDependency[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check each dependency
  template.dependencies.forEach(depId => {
    if (!availableTemplateIds.includes(depId)) {
      const depTemplate = DOCUMENT_DEPENDENCIES[depId];
      if (depTemplate) {
        missingDependencies.push(depTemplate);
      }
    }
  });

  // Generate warnings and recommendations based on missing dependencies
  if (missingDependencies.length > 0) {
    warnings.push(\`\${missingDependencies.length} required dependencies are missing\`);
    recommendations.push('Generate the missing foundation documents first');
    
    missingDependencies.forEach(dep => {
      recommendations.push(\`- \${dep.templateName}: \${dep.description}\`);
    });
  }

  return {
    isValid: missingDependencies.length === 0,
    missingDependencies,
    warnings,
    recommendations
  };
}

/**
 * Gets the dependency chain for a template (all documents that need to be generated first)
 */
export function getDependencyChain(templateId: string): DocumentDependency[] {
  const chain: DocumentDependency[] = [];
  const visited = new Set<string>();
  
  function addDependencies(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    
    const template = DOCUMENT_DEPENDENCIES[id];
    if (!template) return;
    
    // Add dependencies first (depth-first)
    template.dependencies.forEach(depId => {
      addDependencies(depId);
    });
    
    // Add this template if it's not the root
    if (id !== templateId) {
      chain.push(template);
    }
  }
  
  addDependencies(templateId);
  return chain;
}

/**
 * Gets templates that can be generated immediately (no missing dependencies)
 */
export function getTemplatesReadyForGeneration(
  availableDocuments: Array<{ id: string; name: string; templateId?: string }>
): DocumentDependency[] {
  const ready: DocumentDependency[] = [];
  const availableTemplateIds = availableDocuments.map(doc => doc.templateId || doc.id);
  
  for (const template of Object.values(DOCUMENT_DEPENDENCIES)) {
    const hasAllDependencies = template.dependencies.every(depId => 
      availableTemplateIds.includes(depId)
    );
    
    if (hasAllDependencies) {
      ready.push(template);
    }
  }
  
  return ready.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
`;

    return content;
  }

  /**
   * Write the dependency registry to a file
   */
  static async writeRegistryToFile(filePath: string): Promise<void> {
    try {
      const content = this.generateRegistryFileContent();
      
      // Note: In a real implementation, you would write to the file system
      // For now, we'll log the content that should be written
      logger.info(`📝 Generated dependency registry file content for: ${filePath}`);
      logger.info(`📊 Registry contains ${this.dependencyRegistry.size} templates`);
      
      // In a production environment, you would use:
      // await fs.writeFile(filePath, content, 'utf8');
      // logger.info(`✅ Dependency registry written to: ${filePath}`);
    } catch (error) {
      logger.error('❌ Failed to write dependency registry to file:', error);
      throw error;
    }
  }

  /**
   * Map category to PMBOK knowledge area
   */
  private static mapCategoryToPmbokArea(category: string): string {
    const categoryMapping: Record<string, string> = {
      'project-charter': 'Integration Management',
      'scope-management': 'Scope Management',
      'stakeholder-management': 'Stakeholder Management',
      'requirements': 'Scope Management',
      'quality-assurance': 'Quality Management',
      'risk-management': 'Risk Management',
      'cost-management': 'Cost Management',
      'schedule-management': 'Schedule Management',
      'resource-management': 'Resource Management',
      'communication-management': 'Communication Management',
      'procurement-management': 'Procurement Management',
      'strategic-statements': 'Integration Management',
      'technical-design': 'Integration Management',
      'technical-analysis': 'Integration Management',
      'implementation-guides': 'Integration Management',
      'pmbok': 'Integration Management',
      'test': 'Quality Management'
    };
    
    return categoryMapping[category.toLowerCase()] || 'Integration Management';
  }

  /**
   * Determine priority based on template metadata
   */
  private static determinePriority(template: ITemplate): 'critical' | 'high' | 'medium' | 'low' {
    // Check metadata for priority
    if (template.metadata?.priority) {
      const priority = template.metadata.priority;
      if (priority <= 50) return 'critical';
      if (priority <= 100) return 'high';
      if (priority <= 200) return 'medium';
      return 'low';
    }
    
    // Default priority based on category
    const criticalCategories = ['project-charter', 'scope-management', 'stakeholder-management'];
    const highCategories = ['requirements', 'risk-management', 'quality-assurance'];
    
    if (criticalCategories.includes(template.category.toLowerCase())) {
      return 'critical';
    }
    
    if (highCategories.includes(template.category.toLowerCase())) {
      return 'high';
    }
    
    return 'medium';
  }

  /**
   * Determine dependencies based on template category and metadata
   */
  private static determineDependencies(template: ITemplate): string[] {
    // Check if dependencies are explicitly defined in metadata
    if ((template.metadata as any)?.dependencies && Array.isArray((template.metadata as any).dependencies)) {
      return (template.metadata as any).dependencies;
    }
    
    // Default dependencies based on category
    const categoryDependencies: Record<string, string[]> = {
      'scope-management': ['stakeholder-management'],
      'requirements': ['scope-management', 'stakeholder-management'],
      'risk-management': ['scope-management'],
      'quality-assurance': ['requirements'],
      'cost-management': ['scope-management'],
      'schedule-management': ['scope-management'],
      'resource-management': ['scope-management'],
      'communication-management': ['stakeholder-management'],
      'procurement-management': ['scope-management']
    };
    
    return categoryDependencies[template.category.toLowerCase()] || [];
  }

  /**
   * Estimate time based on category
   */
  private static estimateTime(category: string): string {
    const timeEstimates: Record<string, string> = {
      'project-charter': '4-6 hours',
      'scope-management': '3-5 hours',
      'stakeholder-management': '3-4 hours',
      'requirements': '4-6 hours',
      'risk-management': '2-4 hours',
      'quality-assurance': '3-4 hours',
      'cost-management': '3-4 hours',
      'schedule-management': '3-5 hours',
      'resource-management': '2-3 hours',
      'communication-management': '2-3 hours',
      'procurement-management': '2-4 hours',
      'strategic-statements': '4-6 hours',
      'technical-design': '4-8 hours',
      'technical-analysis': '3-6 hours',
      'implementation-guides': '2-4 hours',
      'test': '1-2 hours'
    };
    
    return timeEstimates[category.toLowerCase()] || '2-4 hours';
  }
}
