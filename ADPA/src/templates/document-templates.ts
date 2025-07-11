/*
 * ADPA Professional Document Templates
 * Pre-configured templates for common business and technical documents
 */

import { DocumentTemplate, TemplateSection, ADPA_BRAND_GUIDELINES } from './brand-guidelines';

/**
 * Project Charter Template - PMBOK Style
 */
export const PROJECT_CHARTER_TEMPLATE: DocumentTemplate = {
  name: 'Project Charter',
  description: 'Professional project charter following PMBOK guidelines',
  category: 'project-management',
  layout: 'standard-portrait',
  sections: [
    {
      id: 'title-page',
      name: 'Title Page',
      required: true,
      order: 1,
      styling: {
        headerLevel: 1,
        color: ADPA_BRAND_GUIDELINES.colors.primary,
        spacing: { before: '0', after: '2rem' },
        pageBreak: 'after'
      },
      content: {
        placeholder: 'Project Charter: {{projectName}}',
        format: 'html'
      }
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      required: true,
      order: 2,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Brief overview of the project objectives, scope, and expected outcomes.',
        format: 'markdown'
      }
    },
    {
      id: 'project-description',
      name: 'Project Description',
      required: true,
      order: 3,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Detailed description of the project, including background and justification.',
        format: 'markdown'
      }
    },
    {
      id: 'objectives',
      name: 'Project Objectives',
      required: true,
      order: 4,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'SMART objectives that define what the project will accomplish.',
        format: 'markdown'
      }
    },
    {
      id: 'scope',
      name: 'Project Scope',
      required: true,
      order: 5,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'What is included and excluded from the project scope.',
        format: 'markdown'
      }
    },
    {
      id: 'stakeholders',
      name: 'Key Stakeholders',
      required: true,
      order: 6,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'List of key stakeholders and their roles in the project.',
        format: 'markdown'
      }
    },
    {
      id: 'timeline',
      name: 'High-Level Timeline',
      required: true,
      order: 7,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Major milestones and timeline for project completion.',
        format: 'markdown'
      }
    },
    {
      id: 'budget',
      name: 'Budget Overview',
      required: false,
      order: 8,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'High-level budget estimates and funding sources.',
        format: 'markdown'
      }
    },
    {
      id: 'risks',
      name: 'Initial Risk Assessment',
      required: true,
      order: 9,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Key risks identified and initial mitigation strategies.',
        format: 'markdown'
      }
    },
    {
      id: 'approval',
      name: 'Approval and Sign-off',
      required: true,
      order: 10,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'before'
      },
      content: {
        placeholder: 'Approval signatures and dates from key stakeholders.',
        format: 'html'
      }
    }
  ],
  styling: {
    colors: {
      primary: ADPA_BRAND_GUIDELINES.colors.primary,
      secondary: ADPA_BRAND_GUIDELINES.colors.secondary,
      accent: ADPA_BRAND_GUIDELINES.colors.accent
    },
    typography: ADPA_BRAND_GUIDELINES.typography,
    spacing: ADPA_BRAND_GUIDELINES.spacing,
    layout: {
      columns: 1,
      pageBreaks: true,
      headerFooter: true
    }
  },
  metadata: {
    version: '1.0',
    author: 'ADPA Template System',
    created: '2024-01-01',
    updated: '2024-01-01',
    tags: ['project-management', 'pmbok', 'charter'],
    compatibility: {
      adobe: ['pdf-services', 'indesign'],
      office: ['word', 'powerpoint']
    }
  }
};

/**
 * Technical Specification Template
 */
export const TECHNICAL_SPECIFICATION_TEMPLATE: DocumentTemplate = {
  name: 'Technical Specification',
  description: 'Comprehensive technical specification document template',
  category: 'technical',
  layout: 'standard-portrait',
  sections: [
    {
      id: 'title-page',
      name: 'Title Page',
      required: true,
      order: 1,
      styling: {
        headerLevel: 1,
        color: ADPA_BRAND_GUIDELINES.colors.primary,
        spacing: { before: '0', after: '2rem' },
        pageBreak: 'after'
      },
      content: {
        placeholder: 'Technical Specification: {{systemName}}',
        format: 'html'
      }
    },
    {
      id: 'table-of-contents',
      name: 'Table of Contents',
      required: true,
      order: 2,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '0', after: '1rem' },
        pageBreak: 'after'
      },
      content: {
        placeholder: 'Automatically generated table of contents',
        format: 'html'
      }
    },
    {
      id: 'overview',
      name: 'System Overview',
      required: true,
      order: 3,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'High-level overview of the system architecture and purpose.',
        format: 'markdown'
      }
    },
    {
      id: 'requirements',
      name: 'Functional Requirements',
      required: true,
      order: 4,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Detailed functional requirements with acceptance criteria.',
        format: 'markdown'
      }
    },
    {
      id: 'architecture',
      name: 'System Architecture',
      required: true,
      order: 5,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Technical architecture diagrams and component descriptions.',
        format: 'markdown'
      }
    },
    {
      id: 'api-specification',
      name: 'API Specification',
      required: false,
      order: 6,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'API endpoints, request/response formats, and authentication.',
        format: 'markdown'
      }
    },
    {
      id: 'data-model',
      name: 'Data Model',
      required: true,
      order: 7,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Database schema, entity relationships, and data flow.',
        format: 'markdown'
      }
    },
    {
      id: 'security',
      name: 'Security Considerations',
      required: true,
      order: 8,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Security requirements, authentication, and data protection.',
        format: 'markdown'
      }
    },
    {
      id: 'deployment',
      name: 'Deployment Guide',
      required: true,
      order: 9,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Deployment procedures, environment setup, and configuration.',
        format: 'markdown'
      }
    },
    {
      id: 'appendices',
      name: 'Appendices',
      required: false,
      order: 10,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'before'
      },
      content: {
        placeholder: 'Additional technical details, code samples, and references.',
        format: 'markdown'
      }
    }
  ],
  styling: {
    colors: {
      primary: ADPA_BRAND_GUIDELINES.colors.secondary, // Use secondary color for technical docs
      secondary: ADPA_BRAND_GUIDELINES.colors.accent,
      accent: ADPA_BRAND_GUIDELINES.colors.primary
    },
    typography: ADPA_BRAND_GUIDELINES.typography,
    spacing: ADPA_BRAND_GUIDELINES.spacing,
    layout: {
      columns: 1,
      pageBreaks: true,
      headerFooter: true
    }
  },
  metadata: {
    version: '1.0',
    author: 'ADPA Template System',
    created: '2024-01-01',
    updated: '2024-01-01',
    tags: ['technical', 'specification', 'architecture'],
    compatibility: {
      adobe: ['pdf-services', 'indesign'],
      office: ['word', 'powerpoint']
    }
  }
};

/**
 * Business Requirements Document Template
 */
export const BUSINESS_REQUIREMENTS_TEMPLATE: DocumentTemplate = {
  name: 'Business Requirements Document',
  description: 'Comprehensive business requirements documentation template',
  category: 'business',
  layout: 'standard-portrait',
  sections: [
    {
      id: 'title-page',
      name: 'Title Page',
      required: true,
      order: 1,
      styling: {
        headerLevel: 1,
        color: ADPA_BRAND_GUIDELINES.colors.primary,
        spacing: { before: '0', after: '2rem' },
        pageBreak: 'after'
      },
      content: {
        placeholder: 'Business Requirements Document: {{projectName}}',
        format: 'html'
      }
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      required: true,
      order: 2,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Executive summary of business needs and proposed solution.',
        format: 'markdown'
      }
    },
    {
      id: 'business-context',
      name: 'Business Context',
      required: true,
      order: 3,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Current business situation and drivers for change.',
        format: 'markdown'
      }
    },
    {
      id: 'business-objectives',
      name: 'Business Objectives',
      required: true,
      order: 4,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Specific business objectives and success criteria.',
        format: 'markdown'
      }
    },
    {
      id: 'functional-requirements',
      name: 'Functional Requirements',
      required: true,
      order: 5,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Detailed functional requirements organized by business process.',
        format: 'markdown'
      }
    },
    {
      id: 'non-functional-requirements',
      name: 'Non-Functional Requirements',
      required: true,
      order: 6,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Performance, security, usability, and other quality requirements.',
        format: 'markdown'
      }
    },
    {
      id: 'business-rules',
      name: 'Business Rules',
      required: true,
      order: 7,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Business rules and constraints that govern the solution.',
        format: 'markdown'
      }
    },
    {
      id: 'assumptions-constraints',
      name: 'Assumptions and Constraints',
      required: true,
      order: 8,
      styling: {
        headerLevel: 2,
        color: ADPA_BRAND_GUIDELINES.colors.secondary,
        spacing: { before: '1.5rem', after: '1rem' },
        pageBreak: 'auto'
      },
      content: {
        placeholder: 'Key assumptions and constraints affecting the solution.',
        format: 'markdown'
      }
    }
  ],
  styling: {
    colors: {
      primary: ADPA_BRAND_GUIDELINES.colors.accent, // Use accent color for business docs
      secondary: ADPA_BRAND_GUIDELINES.colors.primary,
      accent: ADPA_BRAND_GUIDELINES.colors.secondary
    },
    typography: ADPA_BRAND_GUIDELINES.typography,
    spacing: ADPA_BRAND_GUIDELINES.spacing,
    layout: {
      columns: 1,
      pageBreaks: true,
      headerFooter: true
    }
  },
  metadata: {
    version: '1.0',
    author: 'ADPA Template System',
    created: '2024-01-01',
    updated: '2024-01-01',
    tags: ['business', 'requirements', 'babok'],
    compatibility: {
      adobe: ['pdf-services', 'indesign'],
      office: ['word', 'powerpoint']
    }
  }
};

/**
 * Template Registry - All available templates
 */
export const DOCUMENT_TEMPLATES = {
  'project-charter': PROJECT_CHARTER_TEMPLATE,
  'technical-specification': TECHNICAL_SPECIFICATION_TEMPLATE,
  'business-requirements': BUSINESS_REQUIREMENTS_TEMPLATE
};

/**
 * Get template by name
 */
export function getDocumentTemplate(templateName: string): DocumentTemplate | null {
  return DOCUMENT_TEMPLATES[templateName] || null;
}

/**
 * Get all available templates
 */
export function getAllDocumentTemplates(): DocumentTemplate[] {
  return Object.values(DOCUMENT_TEMPLATES);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): DocumentTemplate[] {
  return Object.values(DOCUMENT_TEMPLATES).filter(template => template.category === category);
}
