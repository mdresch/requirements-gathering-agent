import Joi from 'joi';
import { enhancedSchemas } from './enhancedSchemas.js';

// Enhanced feedback schemas using the comprehensive validation patterns
export const feedbackCreateSchema = enhancedSchemas.feedback.create;
export const feedbackUpdateSchema = enhancedSchemas.feedback.update;
export const feedbackGetSchema = enhancedSchemas.feedback.get;
export const feedbackDeleteSchema = enhancedSchemas.feedback.delete;
export const feedbackListSchema = enhancedSchemas.feedback.list;

// Additional feedback-specific schemas
export const feedbackResponseSchema = {
  body: Joi.object({
    feedbackId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid feedback ID format',
        'any.required': 'Feedback ID is required'
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
    
    userName: Joi.string()
      .trim()
      .max(100)
      .optional()
      .messages({
        'string.max': 'User name cannot exceed 100 characters'
      }),
    
    message: Joi.string()
      .trim()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.empty': 'Response message is required',
        'string.min': 'Response message must be at least 1 character long',
        'string.max': 'Response message cannot exceed 1000 characters',
        'any.required': 'Response message is required'
      }),
    
    isInternal: Joi.boolean().default(false)
  })
};

// Feedback assignment schema
export const feedbackAssignmentSchema = {
  body: Joi.object({
    feedbackId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid feedback ID format',
        'any.required': 'Feedback ID is required'
      }),
    
    assignedTo: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Assigned to field is required',
        'string.min': 'Assigned to field must be at least 1 character long',
        'string.max': 'Assigned to field cannot exceed 100 characters',
        'any.required': 'Assigned to field is required'
      }),
    
    assignedBy: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Assigned by field is required',
        'string.min': 'Assigned by field must be at least 1 character long',
        'string.max': 'Assigned by field cannot exceed 100 characters',
        'any.required': 'Assigned by field is required'
      }),
    
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'critical')
      .default('medium')
      .messages({
        'any.only': 'Priority must be one of: low, medium, high, critical'
      }),
    
    dueDate: Joi.date().iso().optional().messages({
      'date.format': 'Due date must be in ISO format'
    }),
    
    notes: Joi.string()
      .trim()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Assignment notes cannot exceed 500 characters'
      })
  })
};

// Feedback resolution schema
export const feedbackResolutionSchema = {
  body: Joi.object({
    feedbackId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid feedback ID format',
        'any.required': 'Feedback ID is required'
      }),
    
    resolution: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.empty': 'Resolution is required',
        'string.min': 'Resolution must be at least 10 characters long',
        'string.max': 'Resolution cannot exceed 1000 characters',
        'any.required': 'Resolution is required'
      }),
    
    resolvedBy: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Resolved by field is required',
        'string.min': 'Resolved by field must be at least 1 character long',
        'string.max': 'Resolved by field cannot exceed 100 characters',
        'any.required': 'Resolved by field is required'
      }),
    
    resolutionMethod: Joi.string()
      .valid('fixed', 'accepted', 'rejected', 'deferred')
      .required()
      .messages({
        'any.only': 'Resolution method must be one of: fixed, accepted, rejected, deferred',
        'any.required': 'Resolution method is required'
      }),
    
    attachments: Joi.array()
      .items(Joi.string().uri({ scheme: ['http', 'https'] }))
      .max(5)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 5 attachments',
        'string.uri': 'Attachment must be a valid HTTP or HTTPS URL'
      }),
    
    followUpRequired: Joi.boolean().default(false),
    followUpDate: Joi.date().iso().optional().messages({
      'date.format': 'Follow-up date must be in ISO format'
    })
  })
};

// Feedback analytics schema
export const feedbackAnalyticsSchema = {
  query: Joi.object({
    projectId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid project ID format'
      }),
    
    documentId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid document ID format'
      }),
    
    startDate: Joi.date().iso().optional().messages({
      'date.format': 'Start date must be in ISO format'
    }),
    
    endDate: Joi.date().iso().optional().messages({
      'date.format': 'End date must be in ISO format'
    }),
    
    groupBy: Joi.string()
      .valid('day', 'week', 'month', 'quarter', 'year')
      .default('month')
      .messages({
        'any.only': 'Group by must be one of: day, week, month, quarter, year'
      }),
    
    metricType: Joi.string()
      .valid('count', 'rating', 'resolution_time', 'category_distribution')
      .default('count')
      .messages({
        'any.only': 'Metric type must be one of: count, rating, resolution_time, category_distribution'
      })
  })
};