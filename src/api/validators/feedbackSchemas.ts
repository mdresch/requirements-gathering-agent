// Feedback Validation Schemas
// filepath: src/api/validators/feedbackSchemas.ts

import Joi from 'joi';

export const feedbackSchemas = {
  submitFeedback: Joi.object({
    projectId: Joi.string().required(),
    documentType: Joi.string().required(),
    documentPath: Joi.string().required(),
    feedbackType: Joi.string()
      .valid('quality', 'accuracy', 'completeness', 'clarity', 'compliance', 'suggestion')
      .required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().max(200).required(),
    description: Joi.string().max(2000).required(),
    suggestedImprovement: Joi.string().max(2000).optional(),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'critical')
      .default('medium'),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    category: Joi.string().required(),
    submittedBy: Joi.string().required(),
    submittedByName: Joi.string().required(),
    aiPromptImpact: Joi.object({
      affectedPrompts: Joi.array().items(Joi.string()),
      suggestedPromptChanges: Joi.array().items(Joi.string())
    }).optional()
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid('open', 'in-review', 'implemented', 'rejected', 'closed')
      .required(),
    reviewedBy: Joi.string().optional(),
    notes: Joi.string().max(1000).optional()
  }),

  searchFeedback: Joi.object({
    query: Joi.string().optional(),
    projectId: Joi.string().optional(),
    documentType: Joi.string().optional(),
    feedbackType: Joi.string()
      .valid('quality', 'accuracy', 'completeness', 'clarity', 'compliance', 'suggestion')
      .optional(),
    status: Joi.string()
      .valid('open', 'in-review', 'implemented', 'rejected', 'closed')
      .optional(),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'critical')
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};