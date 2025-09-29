import Joi from 'joi';
import { uuidSchema, paginationSchema } from './documentSchemas.js';
import { enhancedSchemas } from './enhancedSchemas.js';

// Enhanced template schemas using the comprehensive validation patterns
export const templateCreateSchema = enhancedSchemas.template.create;
export const templateUpdateSchema = enhancedSchemas.template.update;
export const templateGetSchema = enhancedSchemas.template.get;
export const templateDeleteSchema = enhancedSchemas.template.delete;
export const templateListSchema = enhancedSchemas.template.list;

// Additional template-specific schemas
export const templateValidateSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().min(1).max(500).required(),
    category: Joi.string().trim().min(1).max(50).required(),
    documentKey: Joi.string().trim().min(1).max(50).pattern(/^[a-zA-Z0-9_-]+$/).required(),
    template_type: Joi.string().trim().min(1).max(50).required(),
    ai_instructions: Joi.string().trim().min(10).max(5000).required(),
    prompt_template: Joi.string().trim().min(10).max(10000).required(),
    generation_function: Joi.string().trim().min(1).max(100).required()
  })
};

// Common schemas for reuse across different validators
export const commonSchemas = {
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required'
  }),
  
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('created_at', 'updated_at', 'name', 'status').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),
  
  search: Joi.string().trim().max(100).optional(),
  
  auditTrailEntry: Joi.object({
    action: Joi.string().valid('created', 'updated', 'deleted', 'restored', 'activated', 'deactivated').required(),
    timestamp: Joi.date().default(Date.now),
    userId: Joi.string().trim().max(100).required(),
    reason: Joi.string().trim().max(500).optional()
  })
};