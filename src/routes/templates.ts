import express from 'express';
import { TemplateController } from '../api/controllers/TemplateController.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Template CRUD operations
router.get('/', TemplateController.listTemplates);                    // List templates with filtering

// Soft delete operations (must come before /:templateId routes)
router.get('/deleted', TemplateController.getSoftDeletedTemplates);              // List soft-deleted templates

// Template CRUD operations with parameters
router.get('/:templateId', TemplateController.getTemplate);          // Get single template
router.post('/', TemplateController.createTemplate);                 // Create new template
router.put('/:templateId', TemplateController.updateTemplate);       // Update template
router.delete('/:templateId', TemplateController.deleteTemplate);    // Delete template (soft delete)
router.get('/deleted/stats', TemplateController.getSoftDeleteStats);            // Get deletion statistics
router.post('/:templateId/restore', TemplateController.restoreTemplate);        // Restore single template
router.post('/batch-restore', TemplateController.batchRestoreTemplates);        // Batch restore templates
router.delete('/cleanup', TemplateController.cleanupOldDeletedTemplates);       // Cleanup old deleted templates
router.get('/:templateId/audit', TemplateController.getTemplateAuditTrail);     // Get audit trail

// Additional template operations
router.post('/validate', TemplateController.validateTemplate);                  // Validate template
router.post('/:templateId/preview', TemplateController.previewTemplate);       // Preview template
router.post('/:templateId/clone', TemplateController.cloneTemplate);           // Clone template
router.get('/:templateId/stats', TemplateController.getTemplateStats);         // Get template usage stats
router.get('/stats', TemplateController.getOverallTemplateStats);              // Get overall stats
router.get('/categories', TemplateController.getTemplateCategories);           // Get categories
router.get('/tags', TemplateController.getTemplateTags);                       // Get tags

// Bulk operations
router.post('/bulk-delete', TemplateController.bulkDeleteTemplates);           // Bulk delete templates
router.get('/export', TemplateController.exportTemplates);                     // Export templates
router.post('/import', TemplateController.importTemplates);                    // Import templates

export default router;