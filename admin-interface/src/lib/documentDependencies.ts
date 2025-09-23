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

// Define document dependencies based on PMBOK analysis
// Using actual template IDs from the database
export const DOCUMENT_DEPENDENCIES: Record<string, DocumentDependency> = {
  // Project Charter (template ID will be determined dynamically)
  'project-charter': {
    templateId: 'project-charter',
    templateName: 'Project Charter',
    category: 'Project Management',
    priority: 'critical',
    pmbokKnowledgeArea: 'Integration Management',
    dependencies: ['101', '102', '103', '104'], // Business Case, Stakeholder Analysis, Scope Statement, Risk Register
    description: 'Formal project authorization document',
    estimatedTime: '2-3 hours'
  },
  // Business Case Template (MongoDB ID: 68cf6a63a14fd05622cf3cc5)
  '68cf6a63a14fd05622cf3cc5': {
    templateId: '68cf6a63a14fd05622cf3cc5',
    templateName: 'Business Case Template',
    category: 'Strategic Planning',
    priority: 'critical',
    pmbokKnowledgeArea: 'Integration Management',
    dependencies: [], // No dependencies - foundation document
    description: 'Strategic justification and financial analysis',
    estimatedTime: '4-6 hours'
  },
  // User Personas Template (MongoDB ID: tpl_1750661686417_eddew42zv)
  'tpl_1750661686417_eddew42zv': {
    templateId: 'tpl_1750661686417_eddew42zv',
    templateName: 'User Personas',
    category: 'Requirements Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['68cfa8a98c7ab32ee7fc3a80', '68cfa8fd8c7ab32ee7fc3a93'], // Depends on stakeholder analysis and scope statement
    description: 'User persona identification and analysis for requirements gathering',
    estimatedTime: '2-3 hours'
  },
  // User Personas Template (current MongoDB ID: 68cfa0be8c7ab32ee7fc39ef)
  '68cfa0be8c7ab32ee7fc39ef': {
    templateId: '68cfa0be8c7ab32ee7fc39ef',
    templateName: 'User Personas',
    category: 'Requirements Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['68cfa8a98c7ab32ee7fc3a80', '68cfa8fd8c7ab32ee7fc3a93'], // Depends on stakeholder analysis and scope statement
    description: 'User persona identification and analysis for requirements gathering',
    estimatedTime: '2-3 hours'
  },
  // User Personas Template (metadata ID: user-personas)
  'user-personas': {
    templateId: 'user-personas',
    templateName: 'User Personas',
    category: 'Requirements Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['68cfa8a98c7ab32ee7fc3a80', '68cfa8fd8c7ab32ee7fc3a93'], // Depends on stakeholder analysis and scope statement
    description: 'User persona identification and analysis for requirements gathering',
    estimatedTime: '2-3 hours'
  },
  // User Stories Template (current MongoDB ID: 68cf9f7e0b991a497873ef9d)
  '68cf9f7e0b991a497873ef9d': {
    templateId: '68cf9f7e0b991a497873ef9d',
    templateName: 'User Stories',
    category: 'Requirements Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['68cfa0be8c7ab32ee7fc39ef'], // Depends on user personas
    description: 'User stories for agile development and requirements gathering',
    estimatedTime: '2-3 hours'
  },
  // API Test Template (current MongoDB ID: 68cf9eff0b991a497873ef87)
  '68cf9eff0b991a497873ef87': {
    templateId: '68cf9eff0b991a497873ef87',
    templateName: 'API Test Template',
    category: 'Testing',
    priority: 'low',
    pmbokKnowledgeArea: 'Quality Management',
    dependencies: [], // Test template has no dependencies
    description: 'Template for API testing documentation',
    estimatedTime: '1-2 hours'
  },
  // Scope Management Template (current MongoDB ID: 68cfa8fd8c7ab32ee7fc3a93)
  '68cfa8fd8c7ab32ee7fc3a93': {
    templateId: '68cfa8fd8c7ab32ee7fc3a93',
    templateName: 'Scope Management',
    category: 'Scope Management',
    priority: 'critical',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['68cfa8a98c7ab32ee7fc3a80'], // Depends on stakeholder analysis
    description: 'Project scope definition and boundaries',
    estimatedTime: '3-5 hours'
  },
  // Stakeholder Analysis Template (current MongoDB ID: 68cfa8a98c7ab32ee7fc3a80)
  '68cfa8a98c7ab32ee7fc3a80': {
    templateId: '68cfa8a98c7ab32ee7fc3a80',
    templateName: 'Stakeholder Analysis Template',
    category: 'Stakeholder Management',
    priority: 'critical',
    pmbokKnowledgeArea: 'Stakeholder Management',
    dependencies: [], // No dependencies - foundation document
    description: 'Stakeholder identification and engagement strategy',
    estimatedTime: '3-4 hours'
  },
  // Legacy Business Case Template (ID: 101) - for backward compatibility
  '101': {
    templateId: '101',
    templateName: 'Business Case Template',
    category: 'Strategic Planning',
    priority: 'critical',
    pmbokKnowledgeArea: 'Integration Management',
    dependencies: [], // No dependencies - foundation document
    description: 'Strategic justification and financial analysis',
    estimatedTime: '4-6 hours'
  },
  // Stakeholder Analysis Template (ID: 102)
  '102': {
    templateId: '102',
    templateName: 'Stakeholder Analysis Template',
    category: 'Stakeholder Management',
    priority: 'critical',
    pmbokKnowledgeArea: 'Stakeholder Management',
    dependencies: [], // No dependencies - foundation document
    description: 'Stakeholder identification and engagement strategy',
    estimatedTime: '3-4 hours'
  },
  // Scope Statement Template (ID: 103)
  '103': {
    templateId: '103',
    templateName: 'Scope Statement Template',
    category: 'Scope Management',
    priority: 'critical',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['102'], // Depends on stakeholder analysis
    description: 'Project scope definition and boundaries',
    estimatedTime: '3-5 hours'
  },
  // Risk Register Template (ID: 104)
  '104': {
    templateId: '104',
    templateName: 'Risk Register Template',
    category: 'Risk Management',
    priority: 'critical',
    pmbokKnowledgeArea: 'Risk Management',
    dependencies: ['103'], // Depends on scope statement
    description: 'Risk identification and mitigation strategies',
    estimatedTime: '2-4 hours'
  },
  // Requirements Template (ID: 105)
  '105': {
    templateId: '105',
    templateName: 'Requirements Template',
    category: 'Requirements Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Scope Management',
    dependencies: ['102', '103'], // Depends on stakeholder analysis and scope statement
    description: 'Detailed functional and non-functional requirements',
    estimatedTime: '4-6 hours'
  },
  // Cost Management Plan Template (ID: 106)
  '106': {
    templateId: '106',
    templateName: 'Cost Management Plan Template',
    category: 'Cost Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Cost Management',
    dependencies: ['101', '103'], // Depends on business case and scope statement
    description: 'Budget estimation and financial management',
    estimatedTime: '3-4 hours'
  },
  // Schedule Management Plan Template (ID: 107)
  '107': {
    templateId: '107',
    templateName: 'Schedule Management Plan Template',
    category: 'Schedule Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Schedule Management',
    dependencies: ['103'], // Depends on scope statement
    description: 'Project timeline and milestone planning',
    estimatedTime: '3-5 hours'
  },
  // Quality Management Plan Template (ID: 108)
  '108': {
    templateId: '108',
    templateName: 'Quality Management Plan Template',
    category: 'Quality Management',
    priority: 'high',
    pmbokKnowledgeArea: 'Quality Management',
    dependencies: ['105'], // Depends on requirements
    description: 'Quality standards and assurance procedures',
    estimatedTime: '3-4 hours'
  },
  // Resource Management Plan Template (ID: 109)
  '109': {
    templateId: '109',
    templateName: 'Resource Management Plan Template',
    category: 'Resource Management',
    priority: 'medium',
    pmbokKnowledgeArea: 'Resource Management',
    dependencies: ['103'], // Depends on scope statement
    description: 'Human resource planning and team composition',
    estimatedTime: '2-3 hours'
  },
  // Communication Management Plan Template (ID: 110)
  '110': {
    templateId: '110',
    templateName: 'Communication Management Plan Template',
    category: 'Communication Management',
    priority: 'medium',
    pmbokKnowledgeArea: 'Communication Management',
    dependencies: ['102'], // Depends on stakeholder analysis
    description: 'Communication strategy and reporting structure',
    estimatedTime: '2-3 hours'
  },
  // Test Plan Template (ID: 111)
  '111': {
    templateId: '111',
    templateName: 'Test Plan Template',
    category: 'Quality Assurance',
    priority: 'low',
    pmbokKnowledgeArea: 'Quality Management',
    dependencies: ['105'], // Depends on requirements
    description: 'Test strategy and quality validation',
    estimatedTime: '3-5 hours'
  }
};

/**
 * Mapping between document types/keys and their MongoDB ObjectIds for dependency validation
 */
const DOCUMENT_TYPE_TO_TEMPLATE_ID: Record<string, string> = {
  'stakeholder-analysis': '68cfa8a98c7ab32ee7fc3a80',
  'scope-management-plan': '68cfa8fd8c7ab32ee7fc3a93',
  'user-personas': '68cfa0be8c7ab32ee7fc39ef',
  'user-stories': '68cf9f7e0b991a497873ef9d',
  'api-test-template': '68cf9eff0b991a497873ef87',
  'business-case': '68cf6a63a14fd05622cf3cc5',
  '101': '68cf6a63a14fd05622cf3cc5', // Legacy Business Case
  '102': '68cfa8a98c7ab32ee7fc3a80', // Legacy Stakeholder Analysis
  '103': '68cfa8fd8c7ab32ee7fc3a93', // Legacy Scope Statement
};

/**
 * Reverse mapping from MongoDB ObjectIds to document keys for validation
 */
const TEMPLATE_ID_TO_DOCUMENT_KEY: Record<string, string> = {
  '68cfa8a98c7ab32ee7fc3a80': 'stakeholder-analysis',
  '68cfa8fd8c7ab32ee7fc3a93': 'scope-management-plan',
  '68cfa0be8c7ab32ee7fc39ef': 'user-personas',
  '68cf9f7e0b991a497873ef9d': 'user-stories',
  '68cf9eff0b991a497873ef87': 'api-test-template',
  '68cf6a63a14fd05622cf3cc5': 'business-case',
};

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
      warnings: [`Template '${templateId}' not found in dependency registry`],
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
      recommendations.push('Generate the following critical documents first to ensure Project Charter quality:');
      criticalMissing.forEach(dep => {
        recommendations.push(`• ${dep.templateName} (${dep.pmbokKnowledgeArea}) - ${dep.description}`);
      });
    }
    
    if (highMissing.length > 0) {
      warnings.push(`📋 RECOMMENDED: Missing ${highMissing.length} supporting document(s)`);
      recommendations.push('Consider generating these high-priority documents for enhanced Project Charter quality:');
      highMissing.forEach(dep => {
        recommendations.push(`• ${dep.templateName} (${dep.pmbokKnowledgeArea}) - ${dep.description}`);
      });
    }

    // Add specific guidance for Project Charter
    if (templateId === 'project-charter') {
      warnings.push('🚨 Project Charter requires foundation documents for proper authorization and scope definition');
      recommendations.push('');
      recommendations.push('📚 PMBOK Best Practice: A Project Charter should synthesize information from:');
      recommendations.push('• Business Case (strategic justification)');
      recommendations.push('• Stakeholder Analysis (authority structure)');
      recommendations.push('• Scope Statement (project boundaries)');
      recommendations.push('• Risk Register (critical risks and mitigation)');
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
export function getAvailableTemplates(
  availableDocuments: Array<{ id: string; name: string; templateId?: string }>
): DocumentDependency[] {
  const availableTemplateIds = availableDocuments.map(doc => doc.templateId || doc.id);
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
