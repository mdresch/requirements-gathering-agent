
import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { requirePermission } from '../middleware/auth.js';
import {
  templateCreateSchema,
  templateUpdateSchema,
  templateGetSchema,
  templateDeleteSchema,
  templateListSchema,
  templateValidateSchema
} from '../validators/templateSchemas.js';

// Export a factory function that takes the TemplateController as argument
export function createTemplatesRouter(TemplateController: any) {
  const router = Router();

  // Template overall stats route (must come before any /:templateId route)
  router.get(
    '/stats',
    requirePermission('read'),
    TemplateController.getOverallTemplateStats
  );

  // Soft deleted templates (must come before /:templateId route)
  router.get(
    '/deleted',
    requirePermission('read'),
    TemplateController.getSoftDeletedTemplates
  );

  // Template CRUD operations
  router.post(
    '/',
    requirePermission('write'),
    validate(templateCreateSchema),
    TemplateController.createTemplate
  );

  router.get(
    '/:templateId',
    requirePermission('read'),
    validate(templateGetSchema),
    TemplateController.getTemplate
  );

  router.put(
    '/:templateId',
    requirePermission('write'),
    validate(templateUpdateSchema),
    TemplateController.updateTemplate
  );

  router.delete(
    '/:templateId',
    requirePermission('write'),
    validate(templateDeleteSchema),
    TemplateController.deleteTemplate
  );

  // Template listing and search
  router.get(
    '/',
    requirePermission('read'),
    validate(templateListSchema),
    TemplateController.listTemplates
  );

  // Template validation
  router.post(
    '/validate',
    requirePermission('read'),
    validate(templateValidateSchema),
    TemplateController.validateTemplate
  );

  // Restore soft deleted template
  router.put(
    '/:templateId/restore',
    requirePermission('write'),
    TemplateController.restoreTemplate
  );

  return router;
}
