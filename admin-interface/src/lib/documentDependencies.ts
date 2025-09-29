/**
 * Document Dependencies Validation System
 * 
 * This module provides validation for document dependencies based on PMBOK knowledge areas
 * and ensures required context documents are available before generating dependent documents.
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

// Define document dependencies based on current database templates
export const DOCUMENT_DEPENDENCIES: Record<string, DocumentDependency> = {
  // Business Case Template (MongoDB ID: 68d253d1e8b84159bab03dd0)
  '68d253d1e8b84159bab03dd0': {
    templateId: '68d253d1e8b84159bab03dd0',
    templateName: 'Business Case Template',
    category: 'Strategic Planning',
    priority: 'critical',
    pmbokKnowledgeArea: 'Integration Management',
    dependencies: [], // No dependencies - foundation document
    description: 'Strategic justification and financial analysis',
    estimatedTime: '4-6 hours'
  },
  // Company Mission Vision and Core Values Template (MongoDB ID: 68d259753673e196a415f237)
  '68d259753673e196a415f237': {
    templateId: '68d259753673e196a415f237',
    templateName: 'Company Mission Vision and Core Values',
    category: 'Strategic Planning',
    priority: 'critical',
    pmbokKnowledgeArea: 'Integration Management',
    dependencies: [], // No dependencies - foundation document
    description: 'Company mission, vision and core values alignment',
    estimatedTime: '2-4 hours'
  },
  // Project Charter Template (MongoDB ID: 68d2593d5c548d6a3b30d271)
  '68d2593d5c548d6a3b30d271': {
    templateId: '68d2593d5c548d6a3b30d271',
    templateName: 'Project Charter Template',
    category: 'Project Management',
    priority: 'critical',
    pmbokKnowledgeArea: 'Integration Management',
    dependencies: ['68d253d1e8b84159bab03dd0'], // Depends on Business Case
    description: 'Comprehensive project charter document for project initiation and approval',
    estimatedTime: '2-3 hours'
  },
  // Functional Requirements Specification (MongoDB ID: 68d2593d5c548d6a3b30d26c)
  '68d2593d5c548d6a3b30d26c': {
    templateId: '68d2593d5c548d6a3b30d26c',
    templateName: 'Functional Requirements Specification',
    category: 'Requirements Management',
    priority: 'critical',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['68d2593d5c548d6a3b30d271'], // Depends on Project Charter
    description: 'Detailed functional requirements document covering system behavior and capabilities',
    estimatedTime: '4-6 hours'
  },
  // Risk Assessment Report (MongoDB ID: 68d2593d5c548d6a3b30d26e)
  '68d2593d5c548d6a3b30d26e': {
    templateId: '68d2593d5c548d6a3b30d26e',
    templateName: 'Risk Assessment Report',
    category: 'Risk Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Risk Management',
    dependencies: ['68d2593d5c548d6a3b30d271'], // Depends on Project Charter
    description: 'Comprehensive risk analysis and mitigation strategy document for project planning',
    estimatedTime: '2-4 hours'
  },
  // Test Plan Document (MongoDB ID: 68d2593d5c548d6a3b30d26f)
  '68d2593d5c548d6a3b30d26f': {
    templateId: '68d2593d5c548d6a3b30d26f',
    templateName: 'Test Plan Document',
    category: 'Testing',
    priority: 'high',
    pmbokKnowledgeArea: 'Quality Management',
    dependencies: ['68d2593d5c548d6a3b30d26c'], // Depends on Functional Requirements
    description: 'Comprehensive test planning document covering all testing phases and strategies',
    estimatedTime: '3-4 hours'
  },
  // API Documentation Template (MongoDB ID: 68d2593d5c548d6a3b30d272)
  '68d2593d5c548d6a3b30d272': {
    templateId: '68d2593d5c548d6a3b30d272',
    templateName: 'API Documentation Template',
    category: 'Technical Documentation',
    priority: 'medium',
    pmbokKnowledgeArea: 'Quality Management',
    dependencies: ['68d2593d5c548d6a3b30d26c'], // Depends on Functional Requirements
    description: 'Comprehensive API documentation template with endpoints, parameters, and examples',
    estimatedTime: '3-4 hours'
  },
  // System Architecture Document (MongoDB ID: 68d2593d5c548d6a3b30d26d)
  '68d2593d5c548d6a3b30d26d': {
    templateId: '68d2593d5c548d6a3b30d26d',
    templateName: 'System Architecture Document',
    category: 'Technical Architecture',
    priority: 'high',
    pmbokKnowledgeArea: 'Integration Management',
    dependencies: ['68d2593d5c548d6a3b30d26c'], // Depends on Functional Requirements
    description: 'Comprehensive system architecture documentation with technical design and component interactions',
    estimatedTime: '4-6 hours'
  },
  // Technical Requirements Template (MongoDB ID: 68d253d1e8b84159bab03dd1)
  '68d253d1e8b84159bab03dd1': {
    templateId: '68d253d1e8b84159bab03dd1',
    templateName: 'Technical Requirements Template',
    category: 'Technical Requirements',
    priority: 'high',
    pmbokKnowledgeArea: 'Quality Management',
    dependencies: ['68d2593d5c548d6a3b30d26c'], // Depends on Functional Requirements
    description: 'Comprehensive technical requirements specification template',
    estimatedTime: '3-4 hours'
  },
  // User Stories Template (MongoDB ID: 68d253d1e8b84159bab03dcf)
  '68d253d1e8b84159bab03dcf': {
    templateId: '68d253d1e8b84159bab03dcf',
    templateName: 'User Stories Template',
    category: 'Requirements Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['68d2593d5c548d6a3b30d26c'], // Depends on Functional Requirements
    description: 'Comprehensive template for creating user stories with acceptance criteria',
    estimatedTime: '2-3 hours'
  },
  // Data Governance Policy (MongoDB ID: 68d2593d5c548d6a3b30d270)
  '68d2593d5c548d6a3b30d270': {
    templateId: '68d2593d5c548d6a3b30d270',
    templateName: 'Data Governance Policy',
    category: 'Data Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Quality Management',
    dependencies: [], // No dependencies - standalone policy document
    description: 'Comprehensive data governance framework and policy document following DMBOK standards',
    estimatedTime: '4-6 hours'
  },
  // User Stories Template (MongoDB ID: 68cf9f7e0b991a497873ef9d)
  '68cf9f7e0b991a497873ef9d': {
    templateId: '68cf9f7e0b991a497873ef9d',
    templateName: 'User Stories',
    category: 'Requirements',
    priority: 'high',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['68d253d1e8b84159bab03dd0'], // Depends on Business Case
    description: 'User stories and acceptance criteria for agile development',
    estimatedTime: '2-4 hours'
  }
};

/**
 * Mapping between document types/keys and their MongoDB ObjectIds for dependency validation
 */
const DOCUMENT_TYPE_TO_TEMPLATE_ID: Record<string, string> = {
  'business-case': '68d253d1e8b84159bab03dd0',
  'business-case-template': '68d253d1e8b84159bab03dd0',
  'Business Case': '68d253d1e8b84159bab03dd0',
  'Business Case Template': '68d253d1e8b84159bab03dd0',
  'company-mission-vision-and-core-values': '68d259753673e196a415f237',
  'project-charter': '68d2593d5c548d6a3b30d271',
  'project-charter-template': '68d2593d5c548d6a3b30d271',
  'Project Charter': '68d2593d5c548d6a3b30d271',
  'Project Charter Template': '68d2593d5c548d6a3b30d271',
  'functional-requirements': '68d2593d5c548d6a3b30d26c',
  'functional-requirements-spec': '68d2593d5c548d6a3b30d26c',
  'Functional Requirements': '68d2593d5c548d6a3b30d26c',
  'Functional Requirements Specification': '68d2593d5c548d6a3b30d26c',
  'risk-assessment': '68d2593d5c548d6a3b30d26e',
  'risk-assessment-report': '68d2593d5c548d6a3b30d26e',
  'Risk Assessment': '68d2593d5c548d6a3b30d26e',
  'Risk Assessment Report': '68d2593d5c548d6a3b30d26e',
  'test-plan': '68d2593d5c548d6a3b30d26f',
  'test-plan-document': '68d2593d5c548d6a3b30d26f',
  'Test Plan': '68d2593d5c548d6a3b30d26f',
  'Test Plan Document': '68d2593d5c548d6a3b30d26f',
  'api-documentation': '68d2593d5c548d6a3b30d272',
  'api-documentation-template': '68d2593d5c548d6a3b30d272',
  'API Documentation': '68d2593d5c548d6a3b30d272',
  'API Documentation Template': '68d2593d5c548d6a3b30d272',
  'system-architecture': '68d2593d5c548d6a3b30d26d',
  'system-architecture-doc': '68d2593d5c548d6a3b30d26d',
  'System Architecture': '68d2593d5c548d6a3b30d26d',
  'System Architecture Document': '68d2593d5c548d6a3b30d26d',
  'technical-requirements': '68d253d1e8b84159bab03dd1',
  'technical-requirements-template': '68d253d1e8b84159bab03dd1',
  'Technical Requirements': '68d253d1e8b84159bab03dd1',
  'Technical Requirements Template': '68d253d1e8b84159bab03dd1',
  'user-stories': '68d253d1e8b84159bab03dcf',
  'user-stories-template': '68d253d1e8b84159bab03dcf',
  'User Stories': '68d253d1e8b84159bab03dcf',
  'User Stories Template': '68d253d1e8b84159bab03dcf',
  'data-governance-plan': '68d2593d5c548d6a3b30d270',
  'data-governance-policy': '68d2593d5c548d6a3b30d270',
  'Data Governance Plan': '68d2593d5c548d6a3b30d270',
  'Data Governance Policy': '68d2593d5c548d6a3b30d270',
  'user-stories-alt': '68cf9f7e0b991a497873ef9d',
  'User Stories Alt': '68cf9f7e0b991a497873ef9d'
};

/**
 * Reverse mapping from MongoDB ObjectIds to document keys for validation
 */
const TEMPLATE_ID_TO_DOCUMENT_KEY: Record<string, string> = {
  '68d253d1e8b84159bab03dd0': 'business-case',
  '68d259753673e196a415f237': 'company-mission-vision-and-core-values',
  '68d2593d5c548d6a3b30d271': 'project-charter',
  '68d2593d5c548d6a3b30d26c': 'functional-requirements',
  '68d2593d5c548d6a3b30d26e': 'risk-assessment',
  '68d2593d5c548d6a3b30d26f': 'test-plan',
  '68d2593d5c548d6a3b30d272': 'api-documentation',
  '68d2593d5c548d6a3b30d26d': 'system-architecture',
  '68d253d1e8b84159bab03dd1': 'technical-requirements',
  '68d253d1e8b84159bab03dcf': 'user-stories',
  '68d2593d5c548d6a3b30d270': 'data-governance-plan',
  '68cf9f7e0b991a497873ef9d': 'user-stories-alt'
};

/**
 * Validates if all required dependencies are available for a given document template
 */
export function validateDocumentDependencies(
  templateId: string,
  availableDocuments: Array<{ id: string; name: string; templateId?: string }>
): DependencyValidationResult {
  // First, try to find the template directly by templateId
  let template = DOCUMENT_DEPENDENCIES[templateId];
  
  // If not found, try to map from document key to MongoDB ObjectId
  if (!template) {
    const mappedTemplateId = DOCUMENT_TYPE_TO_TEMPLATE_ID[templateId];
    if (mappedTemplateId) {
      template = DOCUMENT_DEPENDENCIES[mappedTemplateId];
    }
  }
  
  // If still not found, try reverse mapping from MongoDB ObjectId to document key
  if (!template) {
    const mappedDocumentKey = TEMPLATE_ID_TO_DOCUMENT_KEY[templateId];
    if (mappedDocumentKey) {
      const mappedTemplateId = DOCUMENT_TYPE_TO_TEMPLATE_ID[mappedDocumentKey];
      if (mappedTemplateId) {
        template = DOCUMENT_DEPENDENCIES[mappedTemplateId];
      }
    }
  }
  
  // Final fallback: try to find by template name similarity
  if (!template) {
    const normalizedTemplateId = templateId.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const [id, dep] of Object.entries(DOCUMENT_DEPENDENCIES)) {
      const normalizedName = dep.templateName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedName.includes(normalizedTemplateId) || normalizedTemplateId.includes(normalizedName)) {
        template = dep;
        console.log(`✅ Found template by name similarity: ${dep.templateName} (${id})`);
        break;
      }
    }
  }
  
  if (!template) {
    // Return a valid result for unknown templates to prevent blocking document generation
    return {
      isValid: true,
      missingDependencies: [],
      warnings: [`Template '${templateId}' not found in dependency registry, but assuming no dependencies`],
      recommendations: ['Consider adding this template to the dependency registry for proper validation']
    };
  }
  
  console.log(`✅ Template found: ${template.templateName} (${template.templateId})`);

  if (template.dependencies.length === 0) {
    return {
      isValid: true,
      missingDependencies: [],
      warnings: [],
      recommendations: []
    };
  }

  // Map available documents to their template IDs
  const availableTemplateIds = availableDocuments.map(doc => {
    // First try to use the templateId if it exists
    if (doc.templateId) {
      // If templateId is a document key (like "stakeholder-analysis"), map it to MongoDB ObjectId
      const mappedTemplateId = DOCUMENT_TYPE_TO_TEMPLATE_ID[doc.templateId];
      if (mappedTemplateId) {
        return mappedTemplateId;
      }
      // If templateId is already a MongoDB ObjectId, use it directly
      return doc.templateId;
    }
    
    // If templateId is not available, try to map from document type
    // This handles cases where documents have type field but no templateId
    const documentType = (doc as any).type || (doc as any).name?.toLowerCase().replace(/\s+/g, '-');
    const mappedTemplateId = DOCUMENT_TYPE_TO_TEMPLATE_ID[documentType || ''];
    if (mappedTemplateId) {
      return mappedTemplateId;
    }
    
    // Fallback to document ID (MongoDB ObjectId)
    return doc.id;
  });
  
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
    const criticalMissing = missingDependencies.filter(dep => dep.priority === 'critical');
    const highMissing = missingDependencies.filter(dep => dep.priority === 'high');
    
    if (criticalMissing.length > 0) {
      warnings.push(`⚠️ CRITICAL: Missing ${criticalMissing.length} required foundation document(s)`);
      recommendations.push('Generate the following critical documents first to ensure document quality:');
      criticalMissing.forEach(dep => {
        recommendations.push(`• ${dep.templateName} (${dep.pmbokKnowledgeArea}) - ${dep.description}`);
      });
    }
    
    if (highMissing.length > 0) {
      warnings.push(`📋 RECOMMENDED: Missing ${highMissing.length} supporting document(s)`);
      recommendations.push('Consider generating these high-priority documents for enhanced document quality:');
      highMissing.forEach(dep => {
        recommendations.push(`• ${dep.templateName} (${dep.pmbokKnowledgeArea}) - ${dep.description}`);
      });
    }
  }

  return {
    isValid: missingDependencies.length === 0,
    missingDependencies,
    warnings,
    recommendations
  };
}

/**
 * Gets templates that are available for generation (no missing dependencies)
 */
export function getAvailableTemplates(
  availableDocuments: Array<{ id: string; name: string; templateId?: string }>
): DocumentDependency[] {
  const available: DocumentDependency[] = [];
  
  Object.values(DOCUMENT_DEPENDENCIES).forEach(template => {
    const validation = validateDocumentDependencies(template.templateId, availableDocuments);
    if (validation.isValid) {
      available.push(template);
    }
  });
  
  return available;
}

/**
 * Gets the recommended generation order for a set of templates
 */
export function getRecommendedGenerationOrder(
  templateIds: string[],
  availableDocuments: Array<{ id: string; name: string; templateId?: string }>
): DocumentDependency[] {
  const order: DocumentDependency[] = [];
  const remaining = [...templateIds];
  const generated = new Set(availableDocuments.map(doc => doc.templateId || doc.id));
  
  while (remaining.length > 0) {
    let addedInThisRound = false;
    
    for (let i = remaining.length - 1; i >= 0; i--) {
      const templateId = remaining[i];
      const template = DOCUMENT_DEPENDENCIES[templateId];
      
      if (!template) continue;
      
      // Check if all dependencies are satisfied
      const allDepsSatisfied = template.dependencies.every(depId => generated.has(depId));
      
      if (allDepsSatisfied) {
        order.push(template);
        generated.add(templateId);
        remaining.splice(i, 1);
        addedInThisRound = true;
      }
    }
    
    if (!addedInThisRound) {
      // Circular dependency or missing dependencies
      break;
    }
  }
  
  return order;
}
