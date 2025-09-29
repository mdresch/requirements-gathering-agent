import Joi from 'joi';

/**
 * Enhanced Validation Schemas for Phase 2 Structure
 * 
 * Comprehensive validation schemas that build upon the existing validation
 * structure and provide enhanced validation patterns for all models.
 * This follows the Phase 2 Agent 2 Validation Library specifications.
 */

// Common validation patterns
export const commonSchemas = {
  // ObjectId validation
  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required'
    }),
  
  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
    sort: Joi.string().valid('created_at', 'updated_at', 'name', 'status').default('created_at').messages({
      'any.only': 'Sort field must be one of: created_at, updated_at, name, status'
    }),
    order: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': 'Order must be asc or desc'
    })
  }),
  
  // Search schema
  search: Joi.object({
    search: Joi.string().trim().max(100).optional().messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
    category: Joi.string().trim().max(50).optional().messages({
      'string.max': 'Category filter cannot exceed 50 characters'
    }),
    status: Joi.string().valid('active', 'inactive', 'pending', 'completed', 'cancelled', 'archived').optional().messages({
      'any.only': 'Status must be one of: active, inactive, pending, completed, cancelled, archived'
    })
  }),
  
  // Email validation
  email: Joi.string()
    .email()
    .normalizeEmail()
    .max(255)
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email cannot exceed 255 characters'
    }),
  
  // URL validation
  url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .max(500)
    .messages({
      'string.uri': 'URL must be a valid HTTP or HTTPS URL',
      'string.max': 'URL cannot exceed 500 characters'
    }),
  
  // Phone validation
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .max(20)
    .messages({
      'string.pattern.base': 'Phone number must be valid',
      'string.max': 'Phone number cannot exceed 20 characters'
    }),
  
  // Priority validation
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, critical'
    }),
  
  // Status validation
  status: Joi.string()
    .valid('active', 'inactive', 'pending', 'completed', 'cancelled', 'archived')
    .default('active')
    .messages({
      'any.only': 'Status must be one of: active, inactive, pending, completed, cancelled, archived'
    }),
  
  // Severity validation
  severity: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .default('medium')
    .messages({
      'any.only': 'Severity must be one of: low, medium, high, critical'
    }),
  
  // Rating validation
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
  
  // Percentage validation
  percentage: Joi.number()
    .min(0)
    .max(100)
    .messages({
      'number.base': 'Value must be a number',
      'number.min': 'Value cannot be negative',
      'number.max': 'Value cannot exceed 100'
    }),
  
  // Date validation
  date: Joi.date().iso().messages({
    'date.format': 'Date must be in ISO format'
  }),
  
  // Future date validation
  futureDate: Joi.date()
    .iso()
    .greater('now')
    .messages({
      'date.format': 'Date must be in ISO format',
      'date.greater': 'Date must be in the future'
    }),
  
  // Past date validation
  pastDate: Joi.date()
    .iso()
    .less('now')
    .messages({
      'date.format': 'Date must be in ISO format',
      'date.less': 'Date must be in the past'
    })
};

// Template validation schemas
export const templateSchemas = {
  create: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Template name is required',
        'string.min': 'Template name must be at least 1 character long',
        'string.max': 'Template name cannot exceed 100 characters',
        'any.required': 'Template name is required'
      }),
    
    description: Joi.string()
      .trim()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.empty': 'Template description is required',
        'string.min': 'Template description must be at least 1 character long',
        'string.max': 'Template description cannot exceed 500 characters',
        'any.required': 'Template description is required'
      }),
    
    category: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Template category is required',
        'string.min': 'Template category must be at least 1 character long',
        'string.max': 'Template category cannot exceed 50 characters',
        'any.required': 'Template category is required'
      }),
    
    documentKey: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .required()
      .messages({
        'string.empty': 'Document key is required',
        'string.min': 'Document key must be at least 1 character long',
        'string.max': 'Document key cannot exceed 50 characters',
        'string.pattern.base': 'Document key can only contain letters, numbers, underscores, and hyphens',
        'any.required': 'Document key is required'
      }),
    
    template_type: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Template type is required',
        'string.min': 'Template type must be at least 1 character long',
        'string.max': 'Template type cannot exceed 50 characters',
        'any.required': 'Template type is required'
      }),
    
    ai_instructions: Joi.string()
      .trim()
      .min(10)
      .max(5000)
      .required()
      .messages({
        'string.empty': 'AI instructions are required',
        'string.min': 'AI instructions must be at least 10 characters long',
        'string.max': 'AI instructions cannot exceed 5000 characters',
        'any.required': 'AI instructions are required for document generation'
      }),
    
    prompt_template: Joi.string()
      .trim()
      .min(10)
      .max(10000)
      .required()
      .messages({
        'string.empty': 'Prompt template is required',
        'string.min': 'Prompt template must be at least 10 characters long',
        'string.max': 'Prompt template cannot exceed 10000 characters',
        'any.required': 'Prompt template is required for document generation'
      }),
    
    generation_function: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Generation function is required',
        'string.min': 'Generation function must be at least 1 character long',
        'string.max': 'Generation function cannot exceed 100 characters',
        'any.required': 'Generation function is required to map to document processor'
      }),
    
    contextPriority: commonSchemas.priority,
    
    metadata: Joi.object({
      tags: Joi.array()
        .items(Joi.string().trim().min(1).max(30))
        .max(10)
        .optional()
        .messages({
          'array.max': 'Cannot have more than 10 tags',
          'string.min': 'Each tag must be at least 1 character long',
          'string.max': 'Each tag cannot exceed 30 characters'
        }),
      
      variables: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().trim().min(1).max(50).required(),
            type: Joi.string().valid('text', 'number', 'date', 'boolean', 'array', 'object').required(),
            required: Joi.boolean().default(false),
            description: Joi.string().trim().max(200).optional(),
            defaultValue: Joi.any().optional()
          })
        )
        .optional(),
      
      layout: Joi.object({
        pageSize: Joi.string().valid('A4', 'Letter', 'Legal').default('A4'),
        orientation: Joi.string().valid('portrait', 'landscape').default('portrait'),
        margins: Joi.object({
          top: Joi.number().min(0).max(100).default(20),
          bottom: Joi.number().min(0).max(100).default(20),
          left: Joi.number().min(0).max(100).default(20),
          right: Joi.number().min(0).max(100).default(20)
        }).optional()
      }).optional(),
      
      emoji: Joi.string().trim().max(10).optional(),
      priority: Joi.number().min(1).max(10).optional(),
      source: Joi.string().trim().max(100).optional(),
      author: Joi.string().trim().max(100).optional(),
      estimatedTime: Joi.alternatives().try(
        Joi.string().trim().max(50),
        Joi.number().min(0).max(1000)
      ).optional(),
      version: Joi.string().trim().max(20).optional()
    }).default({}),
    
    is_active: Joi.boolean().default(true),
    is_deleted: Joi.boolean().default(false)
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().trim().min(1).max(500).optional(),
    category: Joi.string().trim().min(1).max(50).optional(),
    template_type: Joi.string().trim().min(1).max(50).optional(),
    ai_instructions: Joi.string().trim().min(10).max(5000).optional(),
    prompt_template: Joi.string().trim().min(10).max(10000).optional(),
    generation_function: Joi.string().trim().min(1).max(100).optional(),
    contextPriority: commonSchemas.priority,
    metadata: Joi.object().optional(),
    is_active: Joi.boolean().optional(),
    is_deleted: Joi.boolean().optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

// Project validation schemas
export const projectSchemas = {
  create: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Project name is required',
        'string.min': 'Project name must be at least 1 character long',
        'string.max': 'Project name cannot exceed 200 characters',
        'any.required': 'Project name is required'
      }),
    
    description: Joi.string()
      .trim()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.empty': 'Project description is required',
        'string.min': 'Project description must be at least 1 character long',
        'string.max': 'Project description cannot exceed 1000 characters',
        'any.required': 'Project description is required'
      }),
    
    status: Joi.string()
      .valid('draft', 'active', 'review', 'completed', 'archived')
      .default('draft')
      .messages({
        'any.only': 'Status must be one of: draft, active, review, completed, archived'
      }),
    
    framework: Joi.string()
      .valid('babok', 'pmbok', 'dmbok', 'multi')
      .required()
      .messages({
        'any.only': 'Framework must be one of: babok, pmbok, dmbok, multi',
        'any.required': 'Framework is required'
      }),
    
    startDate: commonSchemas.date.required().messages({
      'any.required': 'Start date is required'
    }),
    
    endDate: commonSchemas.date.optional(),
    
    complianceScore: commonSchemas.percentage,
    
    documents: Joi.number().min(0).default(0).messages({
      'number.min': 'Document count cannot be negative'
    }),
    
    stakeholders: Joi.number().min(0).default(0).messages({
      'number.min': 'Stakeholder count cannot be negative'
    }),
    
    owner: Joi.string().trim().max(100).optional(),
    
    tags: Joi.array()
      .items(Joi.string().trim().min(1).max(50))
      .max(20)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 20 tags',
        'string.min': 'Each tag must be at least 1 character long',
        'string.max': 'Each tag cannot exceed 50 characters'
      }),
    
    priority: commonSchemas.priority,
    
    metadata: Joi.object({
      budget: Joi.number().min(0).optional(),
      teamSize: Joi.number().integer().min(1).max(1000).optional(),
      technologies: Joi.array()
        .items(Joi.string().trim().min(1).max(50))
        .max(20)
        .optional()
    }).optional()
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(1).max(200).optional(),
    description: Joi.string().trim().min(1).max(1000).optional(),
    status: Joi.string().valid('draft', 'active', 'review', 'completed', 'archived').optional(),
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
    complianceScore: commonSchemas.percentage,
    owner: Joi.string().trim().max(100).optional(),
    tags: Joi.array().items(Joi.string().trim().min(1).max(50)).max(20).optional(),
    priority: commonSchemas.priority,
    metadata: Joi.object().optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

// Feedback validation schemas
export const feedbackSchemas = {
  create: Joi.object({
    documentId: commonSchemas.objectId.messages({
      'any.required': 'Document ID is required'
    }),
    
    projectId: commonSchemas.objectId.messages({
      'any.required': 'Project ID is required'
    }),
    
    userId: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'User ID is required',
        'string.min': 'User ID must be at least 1 character long',
        'string.max': 'User ID cannot exceed 100 characters',
        'any.required': 'User ID is required'
      }),
    
    userName: Joi.string().trim().max(100).optional(),
    
    feedbackType: Joi.string()
      .valid('general', 'technical', 'content', 'structure', 'compliance', 'quality')
      .default('general')
      .messages({
        'any.only': 'Feedback type must be one of: general, technical, content, structure, compliance, quality'
      }),
    
    rating: commonSchemas.rating,
    
    title: Joi.string()
      .trim()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Feedback title is required',
        'string.min': 'Feedback title must be at least 5 characters long',
        'string.max': 'Feedback title cannot exceed 200 characters',
        'any.required': 'Feedback title is required'
      }),
    
    description: Joi.string()
      .trim()
      .min(10)
      .max(2000)
      .required()
      .messages({
        'string.empty': 'Feedback description is required',
        'string.min': 'Feedback description must be at least 10 characters long',
        'string.max': 'Feedback description cannot exceed 2000 characters',
        'any.required': 'Feedback description is required'
      }),
    
    category: Joi.string()
      .valid('positive', 'negative', 'suggestion', 'question', 'issue')
      .default('suggestion')
      .messages({
        'any.only': 'Category must be one of: positive, negative, suggestion, question, issue'
      }),
    
    priority: commonSchemas.priority,
    
    severity: Joi.string()
      .valid('minor', 'moderate', 'major', 'critical')
      .default('moderate')
      .messages({
        'any.only': 'Severity must be one of: minor, moderate, major, critical'
      }),
    
    status: Joi.string()
      .valid('open', 'in_review', 'addressed', 'resolved', 'rejected', 'closed')
      .default('open')
      .messages({
        'any.only': 'Status must be one of: open, in_review, addressed, resolved, rejected, closed'
      }),
    
    assignedTo: Joi.string().trim().max(100).optional(),
    
    tags: Joi.array()
      .items(Joi.string().trim().min(1).max(30))
      .max(15)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 15 tags',
        'string.min': 'Each tag must be at least 1 character long',
        'string.max': 'Each tag cannot exceed 30 characters'
      }),
    
    attachments: Joi.array()
      .items(commonSchemas.url)
      .max(10)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 10 attachments'
      }),
    
    sectionReference: Joi.string().trim().max(200).optional(),
    pageNumber: Joi.number().integer().min(1).optional(),
    lineNumber: Joi.number().integer().min(1).optional(),
    
    isPublic: Joi.boolean().default(true)
  }),
  
  update: Joi.object({
    feedbackType: Joi.string().valid('general', 'technical', 'content', 'structure', 'compliance', 'quality').optional(),
    title: Joi.string().trim().min(5).max(200).optional(),
    description: Joi.string().trim().min(10).max(2000).optional(),
    category: Joi.string().valid('positive', 'negative', 'suggestion', 'question', 'issue').optional(),
    priority: commonSchemas.priority,
    severity: Joi.string().valid('minor', 'moderate', 'major', 'critical').optional(),
    status: Joi.string().valid('open', 'in_review', 'addressed', 'resolved', 'rejected', 'closed').optional(),
    assignedTo: Joi.string().trim().max(100).optional(),
    resolution: Joi.string().trim().max(1000).optional(),
    resolvedBy: Joi.string().trim().max(100).optional(),
    resolvedAt: commonSchemas.date.optional(),
    tags: Joi.array().items(Joi.string().trim().min(1).max(30)).max(15).optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

// Category validation schemas
export const categorySchemas = {
  create: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Category name is required',
        'string.min': 'Category name must be at least 1 character long',
        'string.max': 'Category name cannot exceed 50 characters',
        'any.required': 'Category name is required'
      }),
    
    description: Joi.string()
      .trim()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Category description is required',
        'string.min': 'Category description must be at least 5 characters long',
        'string.max': 'Category description cannot exceed 200 characters',
        'any.required': 'Category description is required'
      }),
    
    color: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .default('#3B82F6')
      .messages({
        'string.pattern.base': 'Color must be a valid hex color code'
      }),
    
    icon: Joi.string()
      .max(10)
      .default('📁')
      .messages({
        'string.max': 'Icon cannot exceed 10 characters'
      }),
    
    isActive: Joi.boolean().default(true),
    isSystem: Joi.boolean().default(false),
    
    parentCategory: Joi.string().trim().max(100).optional(),
    sortOrder: Joi.number().integer().min(0).default(0).messages({
      'number.min': 'Sort order cannot be negative'
    }),
    usageCount: Joi.number().integer().min(0).default(0).messages({
      'number.min': 'Usage count cannot be negative'
    })
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(1).max(50).optional(),
    description: Joi.string().trim().min(5).max(200).optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    icon: Joi.string().max(10).optional(),
    isActive: Joi.boolean().optional(),
    parentCategory: Joi.string().trim().max(100).optional(),
    sortOrder: Joi.number().integer().min(0).optional(),
    usageCount: Joi.number().integer().min(0).optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

// Audit trail validation schemas
export const auditTrailSchemas = {
  create: Joi.object({
    entityType: Joi.string()
      .valid('template', 'project', 'category', 'feedback', 'stakeholder', 'document', 'user', 'system')
      .required()
      .messages({
        'any.only': 'Entity type must be one of: template, project, category, feedback, stakeholder, document, user, system',
        'any.required': 'Entity type is required'
      }),
    
    entityId: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Entity ID is required',
        'string.min': 'Entity ID must be at least 1 character long',
        'string.max': 'Entity ID cannot exceed 100 characters',
        'any.required': 'Entity ID is required'
      }),
    
    entityName: Joi.string().trim().max(200).optional(),
    
    action: Joi.string()
      .valid('created', 'updated', 'deleted', 'restored', 'activated', 'deactivated', 'assigned', 'unassigned', 'status_changed', 'permission_changed', 'login', 'logout', 'export', 'import')
      .required()
      .messages({
        'any.only': 'Action must be one of: created, updated, deleted, restored, activated, deactivated, assigned, unassigned, status_changed, permission_changed, login, logout, export, import',
        'any.required': 'Action is required'
      }),
    
    actionDescription: Joi.string().trim().max(500).optional(),
    
    userId: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'User ID is required',
        'string.min': 'User ID must be at least 1 character long',
        'string.max': 'User ID cannot exceed 100 characters',
        'any.required': 'User ID is required'
      }),
    
    userName: Joi.string().trim().max(100).optional(),
    userEmail: commonSchemas.email.optional(),
    userRole: Joi.string().trim().max(50).optional(),
    
    projectId: Joi.string().trim().max(100).optional(),
    projectName: Joi.string().trim().max(200).optional(),
    documentId: Joi.string().trim().max(100).optional(),
    documentName: Joi.string().trim().max(200).optional(),
    
    ipAddress: Joi.string()
      .pattern(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)
      .max(45)
      .optional()
      .messages({
        'string.pattern.base': 'IP address must be valid IPv4 or IPv6'
      }),
    
    userAgent: Joi.string().trim().max(500).optional(),
    
    severity: commonSchemas.severity,
    
    category: Joi.string()
      .valid('data_change', 'access', 'system', 'security', 'compliance', 'workflow')
      .default('data_change')
      .messages({
        'any.only': 'Category must be one of: data_change, access, system, security, compliance, workflow'
      }),
    
    tags: Joi.array()
      .items(Joi.string().trim().min(1).max(50))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 10 tags',
        'string.min': 'Each tag must be at least 1 character long',
        'string.max': 'Each tag cannot exceed 50 characters'
      }),
    
    complianceFramework: Joi.string()
      .valid('sox', 'gdpr', 'hipaa', 'pci', 'iso27001', 'custom')
      .optional()
      .messages({
        'any.only': 'Compliance framework must be one of: sox, gdpr, hipaa, pci, iso27001, custom'
      }),
    
    requiresReview: Joi.boolean().default(false)
  })
};

// Authentication validation schemas
export const authSchemas = {
  register: Joi.object({
    email: commonSchemas.email.required().messages({
      'any.required': 'Email is required'
    }),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    firstName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 1 character long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 1 character long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      })
  }),
  
  login: Joi.object({
    email: commonSchemas.email.required().messages({
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  })
};

// Export all schemas
export const validationSchemas = {
  common: commonSchemas,
  template: templateSchemas,
  project: projectSchemas,
  feedback: feedbackSchemas,
  category: categorySchemas,
  auditTrail: auditTrailSchemas,
  auth: authSchemas
};
