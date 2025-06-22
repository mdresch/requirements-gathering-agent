import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController.js';
import { validate } from '../middleware/validation.js';
import { requirePermission } from '../middleware/auth.js';
import {
  documentConversionSchema,
  documentBatchSchema,
  documentStatusSchema,
  documentDownloadSchema,
  documentListSchema
} from '../validators/documentSchemas.js';

const router = Router();

// Document conversion endpoints
router.post(
  '/convert',
  requirePermission('write'),
  validate(documentConversionSchema),
  DocumentController.convertDocument
);

router.post(
  '/batch',
  requirePermission('write'),
  validate(documentBatchSchema),
  DocumentController.batchConvert
);

// Document status and download endpoints
router.get(
  '/jobs/:jobId/status',
  requirePermission('read'),
  validate(documentStatusSchema),
  DocumentController.getJobStatus
);

router.get(
  '/jobs/:jobId/download',
  requirePermission('read'),
  validate(documentDownloadSchema),
  DocumentController.downloadDocument
);

// Document listing and management
router.get(
  '/jobs',
  requirePermission('read'),
  validate(documentListSchema),
  DocumentController.listJobs
);

router.delete(
  '/jobs/:jobId',
  requirePermission('write'),
  validate(documentStatusSchema),
  DocumentController.cancelJob
);

export default router;
