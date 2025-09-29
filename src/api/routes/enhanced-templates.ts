import { Router } from 'express';
import Joi from 'joi';
import { 
  sanitizeInput, 
  validateRequest, 
  commonValidations, 
  securityHeaders,
  validateContentType,
  validateInputSize 
} from '../../middleware/sanitization.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import {
  templateCreateSchema,
  templateUpdateSchema,
  templateGetSchema,
  templateDeleteSchema,
  templateListSchema,
  templateValidateSchema,
  commonSchemas
} from '../validators/templateSchemas.js';

/**
 * Enhanced Template Routes with Comprehensive Sanitization and Validation
 * This demonstrates how to apply Agent 2's sanitization middleware to template endpoints
 */

// Export a factory function that takes the TemplateController as argument
export function createEnhancedTemplatesRouter(TemplateController: any) {
  const router = Router();

  // Apply security headers to all routes
  router.use(securityHeaders);

  // Apply content type validation to all non-GET routes
  router.use(validateContentType(['application/json']));

  // Apply input size validation (1MB limit)
  router.use(validateInputSize(1024 * 1024));

  // Template overall stats route (must come before any /:id route)
  router.get(
    '/stats',
    sanitizeInput,
    validateQuery(commonSchemas.pagination),
    validateRequest,
    TemplateController.getOverallTemplateStats
  );

  // Soft deleted templates (must come before /:id route)
  router.get(
    '/deleted',
    sanitizeInput,
    validateQuery(commonSchemas.pagination),
    validateRequest,
    TemplateController.getSoftDeletedTemplates
  );

  // Template CRUD operations with enhanced validation

  // POST /api/v1/templates - Create new template
  router.post(
    '/',
    sanitizeInput,
    validateBody(templateCreateSchema.body),
    validateRequest,
    TemplateController.createTemplate
  );

  // GET /api/v1/templates - List templates with pagination and filtering
  router.get(
    '/',
    sanitizeInput,
    validateQuery(templateListSchema.query),
    validateRequest,
    TemplateController.getTemplates
  );

  // GET /api/v1/templates/:id - Get specific template
  router.get(
    '/:id',
    sanitizeInput,
    validateParams(templateGetSchema.params),
    validateRequest,
    TemplateController.getTemplate
  );

  // PUT /api/v1/templates/:id - Update template
  router.put(
    '/:id',
    sanitizeInput,
    validateParams(templateUpdateSchema.params),
    validateBody(templateUpdateSchema.body),
    validateRequest,
    TemplateController.updateTemplate
  );

  // PATCH /api/v1/templates/:id - Partial update template
  router.patch(
    '/:id',
    sanitizeInput,
    validateParams(templateUpdateSchema.params),
    validateBody(templateUpdateSchema.body),
    validateRequest,
    TemplateController.updateTemplate
  );

  // DELETE /api/v1/templates/:id - Soft delete template
  router.delete(
    '/:id',
    sanitizeInput,
    validateParams(templateDeleteSchema.params),
    validateRequest,
    TemplateController.deleteTemplate
  );

  // POST /api/v1/templates/:id/restore - Restore soft deleted template
  router.post(
    '/:id/restore',
    sanitizeInput,
    validateParams(templateDeleteSchema.params),
    validateRequest,
    TemplateController.restoreTemplate
  );

  // POST /api/v1/templates/:id/duplicate - Duplicate template
  router.post(
    '/:id/duplicate',
    sanitizeInput,
    validateParams(templateDeleteSchema.params),
    validateBody(Joi.object({
      name: Joi.string().trim().min(1).max(100).required(),
      description: Joi.string().trim().max(500).optional()
    })),
    validateRequest,
    TemplateController.duplicateTemplate
  );

  // POST /api/v1/templates/validate - Validate template structure
  router.post(
    '/validate',
    sanitizeInput,
    validateBody(templateValidateSchema.body),
    validateRequest,
    TemplateController.validateTemplate
  );

  // GET /api/v1/templates/categories - Get all template categories
  router.get(
    '/categories',
    sanitizeInput,
    validateQuery(Joi.object({
      includeCounts: Joi.boolean().optional(),
      activeOnly: Joi.boolean().optional()
    })),
    validateRequest,
    TemplateController.getTemplateCategories
  );

  // GET /api/v1/templates/search - Advanced search
  router.get(
    '/search',
    sanitizeInput,
    validateQuery(Joi.object({
      q: Joi.string().trim().min(1).max(100).required(),
      category: Joi.string().trim().max(50).optional(),
      tags: Joi.string().trim().max(200).optional(),
      isActive: Joi.boolean().optional(),
      sort: Joi.string().valid('relevance', 'name', 'created_at', 'updated_at').default('relevance'),
      order: Joi.string().valid('asc', 'desc').default('desc'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })),
    validateRequest,
    TemplateController.searchTemplates
  );

  // POST /api/v1/templates/bulk - Bulk operations
  router.post(
    '/bulk',
    sanitizeInput,
    validateBody(Joi.object({
      operation: Joi.string().valid('delete', 'activate', 'deactivate', 'update').required(),
      templateIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).max(100).required(),
      data: Joi.object().optional()
    })),
    validateRequest,
    TemplateController.bulkOperation
  );

  // GET /api/v1/templates/:id/usage - Get template usage statistics
  router.get(
    '/:id/usage',
    sanitizeInput,
    validateParams(templateGetSchema.params),
    validateQuery(Joi.object({
      period: Joi.string().valid('day', 'week', 'month', 'year').default('month'),
      includeDetails: Joi.boolean().optional()
    })),
    validateRequest,
    TemplateController.getTemplateUsage
  );

  // POST /api/v1/templates/:id/feedback - Add feedback to template
  router.post(
    '/:id/feedback',
    sanitizeInput,
    validateParams(templateGetSchema.params),
    validateBody(Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().trim().max(500).optional(),
      userId: Joi.string().trim().min(1).max(100).required()
    })),
    validateRequest,
    TemplateController.addTemplateFeedback
  );

  return router;
}

// Example of how to use the enhanced router in your main server
/*
import { createEnhancedTemplatesRouter } from './routes/enhanced-templates.js';
import { TemplateController } from '../controllers/TemplateController.js';

// In your main server file:
const templatesRouter = createEnhancedTemplatesRouter(TemplateController);
app.use('/api/v1/templates', templatesRouter);
*/
