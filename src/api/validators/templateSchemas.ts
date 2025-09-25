import Joi from 'joi';
import { uuidSchema, paginationSchema } from './documentSchemas.js';

// Template creation and update schemas
export const templateCreateSchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().max(50).optional(),
    tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
    // Required for document generation
    aiInstructions: Joi.string().min(10).required().messages({
      'string.min': 'AI instructions must be at least 10 characters long',
      'any.required': 'AI instructions are required for document generation'
    }),
    promptTemplate: Joi.string().min(10).required().messages({
      'string.min': 'Prompt template must be at least 10 characters long',
      'any.required': 'Prompt template is required for document generation'
    }),
    generationFunction: Joi.string().required().messages({
      'any.required': 'Generation function is required to map to document processor'
    }),
    templateData: Joi.object({
      content: Joi.string().required(),
      aiInstructions: Joi.string().min(10).required(),
      variables: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          type: Joi.string().valid('text', 'number', 'date', 'boolean', 'array', 'object').required(),
          required: Joi.boolean().default(false),
          description: Joi.string().optional(),
          defaultValue: Joi.any().optional()
        })
      ).optional(),
      layout: Joi.object({
        pageSize: Joi.string().valid('A4', 'Letter', 'Legal').default('A4'),
        orientation: Joi.string().valid('portrait', 'landscape').default('portrait'),
        margins: Joi.object({
          top: Joi.number().min(0).default(20),
          bottom: Joi.number().min(0).default(20),
          left: Joi.number().min(0).default(20),
          right: Joi.number().min(0).default(20)
        }).optional()
      }).optional()
    }).required(),
    isActive: Joi.boolean().default(true)
  })
};

export const templateUpdateSchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().max(50).optional(),
    tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
    templateData: Joi.object({
      content: Joi.string().optional(),
      variables: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          type: Joi.string().valid('text', 'number', 'date', 'boolean', 'array', 'object').required(),
          required: Joi.boolean().default(false),
          description: Joi.string().optional(),
          defaultValue: Joi.any().optional()
        })
      ).optional(),
      layout: Joi.object({
        pageSize: Joi.string().valid('A4', 'Letter', 'Legal').optional(),
        orientation: Joi.string().valid('portrait', 'landscape').optional(),
        margins: Joi.object({
          top: Joi.number().min(0).optional(),
          bottom: Joi.number().min(0).optional(),
          left: Joi.number().min(0).optional(),
          right: Joi.number().min(0).optional()
        }).optional()
      }).optional()
    }).optional(),
    isActive: Joi.boolean().optional()
  }),
  params: Joi.object({
    templateId: uuidSchema
  })
};

export const templateGetSchema = {
  params: Joi.object({
    templateId: uuidSchema
  })
};

export const templateDeleteSchema = {
  params: Joi.object({
    templateId: uuidSchema
  })
};

export const templateListSchema = {
  query: paginationSchema.keys({
    category: Joi.string().optional(),
    tag: Joi.string().optional(),
    search: Joi.string().max(100).optional(),
    isActive: Joi.boolean().optional()
  })
};

export const templateValidateSchema = {
  body: Joi.object({
    templateData: Joi.object({
      content: Joi.string().required(),
      variables: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          type: Joi.string().valid('text', 'number', 'date', 'boolean', 'array', 'object').required(),
          required: Joi.boolean().default(false),
          description: Joi.string().optional(),
          defaultValue: Joi.any().optional()
        })
      ).optional()
    }).required(),
    testData: Joi.object().optional()
  })
};
