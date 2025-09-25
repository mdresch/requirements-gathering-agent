/**
 * Template Validation Utilities
 * Ensures templates have all required fields for document generation
 */

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateGenerationFields {
  aiInstructions: string;
  promptTemplate: string;
  generationFunction: string;
  documentKey: string;
  templateData?: {
    content: string;
    aiInstructions: string;
  };
}

/**
 * Validates that a template has all required fields for document generation
 */
export function validateTemplateForGeneration(template: any): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields for document generation
  if (!template.ai_instructions || template.ai_instructions.trim().length < 10) {
    errors.push('AI instructions are required and must be at least 10 characters long');
  }

  if (!template.prompt_template || template.prompt_template.trim().length < 10) {
    errors.push('Prompt template is required and must be at least 10 characters long');
  }

  if (!template.generation_function || template.generation_function.trim().length === 0) {
    errors.push('Generation function is required to map to document processor');
  }

  if (!template.documentKey || template.documentKey.trim().length === 0) {
    errors.push('Document key is required for document generation');
  }

  // Validate generation function format
  if (template.generation_function && !template.generation_function.startsWith('getAi')) {
    warnings.push('Generation function should start with "getAi" for consistency');
  }

  // Validate document key format
  if (template.documentKey && !/^[a-z0-9-]+$/.test(template.documentKey)) {
    warnings.push('Document key should be lowercase with hyphens (e.g., "business-case")');
  }

  // Check for template data consistency
  if (template.templateData) {
    if (!template.templateData.content || template.templateData.content.trim().length === 0) {
      errors.push('Template data content is required');
    }
    
    if (!template.templateData.aiInstructions || template.templateData.aiInstructions.trim().length < 10) {
      errors.push('Template data AI instructions are required and must be at least 10 characters long');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Maps template fields to document generation format
 */
export function mapTemplateForGeneration(template: any): TemplateGenerationFields {
  return {
    aiInstructions: template.ai_instructions || template.templateData?.aiInstructions || '',
    promptTemplate: template.prompt_template || '',
    generationFunction: template.generation_function || 'getAiGenericDocument',
    documentKey: template.documentKey || '',
    templateData: template.templateData
  };
}

/**
 * Validates document key format
 */
export function validateDocumentKey(documentKey: string): boolean {
  return /^[a-z0-9-]+$/.test(documentKey);
}

/**
 * Normalizes document key format
 */
export function normalizeDocumentKey(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Maps common template names to their document keys
 */
export const TEMPLATE_NAME_TO_DOCUMENT_KEY: Record<string, string> = {
  'Business Case': 'business-case',
  'Business Case Template': 'business-case',
  'Project Charter': 'project-charter',
  'Project Charter Template': 'project-charter',
  'User Stories': 'user-stories',
  'User Stories Template': 'user-stories',
  'Stakeholder Analysis': 'stakeholder-analysis',
  'Requirements Document': 'requirements-document',
  'Risk Assessment': 'risk-assessment',
  'Risk Assessment Report': 'risk-assessment',
  'Test Plan': 'test-plan',
  'Test Plan Document': 'test-plan',
  'API Documentation': 'api-documentation',
  'API Documentation Template': 'api-documentation',
  'System Architecture': 'system-architecture',
  'System Architecture Document': 'system-architecture',
  'Technical Requirements': 'technical-requirements',
  'Technical Requirements Template': 'technical-requirements',
  'Data Governance Policy': 'data-governance-plan',
  'Data Governance Plan': 'data-governance-plan',
  'Functional Requirements': 'functional-requirements',
  'Functional Requirements Specification': 'functional-requirements',
  'Company Mission Vision and Core Values': 'mission-vision-core-values',
  'Mission, Vision & Core Values': 'mission-vision-core-values'
};

/**
 * Gets document key from template name
 */
export function getDocumentKeyFromTemplateName(templateName: string): string {
  const mappedKey = TEMPLATE_NAME_TO_DOCUMENT_KEY[templateName];
  if (mappedKey) {
    return mappedKey;
  }
  
  return normalizeDocumentKey(templateName);
}
