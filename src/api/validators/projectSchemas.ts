import Joi from 'joi';
import { enhancedSchemas } from './enhancedSchemas.js';

// Enhanced project schemas using the comprehensive validation patterns
export const projectCreateSchema = enhancedSchemas.project.create;
export const projectUpdateSchema = enhancedSchemas.project.update;
export const projectGetSchema = enhancedSchemas.project.get;
export const projectDeleteSchema = enhancedSchemas.project.delete;
export const projectListSchema = enhancedSchemas.project.list;

// Additional project-specific schemas
export const projectDocumentSchema = {
  body: Joi.object({
    projectId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid project ID format',
        'any.required': 'Project ID is required'
      }),
    
    documentId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid document ID format',
        'any.required': 'Document ID is required'
      }),
    
    relationship: Joi.string()
      .valid('requirement', 'specification', 'design', 'test', 'other')
      .default('other')
      .messages({
        'any.only': 'Relationship must be one of: requirement, specification, design, test, other'
      }),
    
    notes: Joi.string()
      .trim()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Notes cannot exceed 500 characters'
      })
  })
};

// Project stakeholder schema
export const projectStakeholderSchema = {
  body: Joi.object({
    projectId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid project ID format',
        'any.required': 'Project ID is required'
      }),
    
    stakeholderId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid stakeholder ID format',
        'any.required': 'Stakeholder ID is required'
      }),
    
    role: Joi.string()
      .valid('project_manager', 'sponsor', 'team_member', 'end_user', 'stakeholder')
      .required()
      .messages({
        'any.only': 'Role must be one of: project_manager, sponsor, team_member, end_user, stakeholder',
        'any.required': 'Role is required'
      }),
    
    responsibilities: Joi.array()
      .items(Joi.string().trim().min(1).max(200))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 10 responsibilities',
        'string.min': 'Each responsibility must be at least 1 character long',
        'string.max': 'Each responsibility cannot exceed 200 characters'
      }),
    
    isActive: Joi.boolean().default(true)
  })
};

// Project metrics schema
export const projectMetricsSchema = {
  query: Joi.object({
    projectId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid project ID format',
        'any.required': 'Project ID is required'
      }),
    
    startDate: Joi.date().iso().optional().messages({
      'date.format': 'Start date must be in ISO format'
    }),
    
    endDate: Joi.date().iso().optional().messages({
      'date.format': 'End date must be in ISO format'
    }),
    
    metricType: Joi.string()
      .valid('compliance', 'progress', 'quality', 'budget', 'timeline')
      .optional()
      .messages({
        'any.only': 'Metric type must be one of: compliance, progress, quality, budget, timeline'
      })
  })
};