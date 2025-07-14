import { Router } from 'express';
import { TemplateController } from '../controllers/TemplateController.js';
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

const router = Router();

// Template overall stats route (must come before any /:templateId route)
router.get(
  '/stats',
  requirePermission('read'),
  TemplateController.getOverallTemplateStats
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

export default router;
