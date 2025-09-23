/**
 * Soft Delete Routes
 * 
 * Defines API routes for soft delete operations on templates
 */

import { Router } from 'express';
import { TemplateController } from '../api/controllers/TemplateController.js';

const router = Router();

// Soft delete operations
router.get('/deleted', TemplateController.getSoftDeletedTemplates);
router.get('/deleted/stats', TemplateController.getSoftDeleteStats);
router.post('/:templateId/restore', TemplateController.restoreTemplate);
router.post('/batch-restore', TemplateController.batchRestoreTemplates);
router.delete('/cleanup', TemplateController.cleanupOldDeletedTemplates);
router.get('/:templateId/audit', TemplateController.getTemplateAuditTrail);

export default router;
