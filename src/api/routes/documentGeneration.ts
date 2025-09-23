import { Router } from 'express';
import { DocumentGenerationController } from '../controllers/DocumentGenerationController.js';
import { validate } from '../middleware/validation.js';
import { requirePermission } from '../middleware/auth.js';
import Joi from 'joi';

const router = Router();

// Validation schemas
const generateWithReviewSchema = Joi.object({
  projectId: Joi.string().required(),
  projectName: Joi.string().required(),
  context: Joi.string().required(),
  enableReview: Joi.boolean().default(true),
  reviewPriority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  requiredRoles: Joi.array().items(Joi.string().valid(
    'subject_matter_expert',
    'technical_reviewer',
    'compliance_officer',
    'project_manager',
    'business_analyst',
    'quality_assurance',
    'stakeholder'
  )).optional(),
  specificReviewers: Joi.array().items(Joi.string()).optional(),
  workflowId: Joi.string().optional(),
  autoSubmitForReview: Joi.boolean().default(true),
  generateAll: Joi.boolean().default(false),
  documentKeys: Joi.array().items(Joi.string()).optional(),
  notifyOnCompletion: Joi.boolean().default(false),
  notificationRecipients: Joi.array().items(Joi.string()).optional()
});

const generateOnlySchema = Joi.object({
  context: Joi.string().required(),
  generateAll: Joi.boolean().default(false),
  documentKeys: Joi.array().items(Joi.string()).optional(),
  projectId: Joi.string().optional(),
  framework: Joi.string().optional()
});

const regenerateWithFeedbackSchema = Joi.object({
  documentKey: Joi.string().required(),
  context: Joi.string().required()
});

const bulkApproveSchema = Joi.object({
  documentIds: Joi.array().items(Joi.string()).min(1).required()
});

// Document Generation with Review Integration Routes

/**
 * Generate documents with automatic review creation
 * POST /api/document-generation/generate-with-review
 */
router.post(
  '/generate-with-review',
  requirePermission('write'),
  validate({ body: generateWithReviewSchema }),
  DocumentGenerationController.generateWithReview
);

/**
 * Generate documents with PMBOK validation and review
 * POST /api/document-generation/generate-with-validation
 */
router.post(
  '/generate-with-validation',
  requirePermission('write'),
  validate({ body: generateWithReviewSchema }),
  DocumentGenerationController.generateWithValidationAndReview
);

/**
 * Generate documents only (without review)
 * POST /api/document-generation/generate-only
 */
router.post(
  '/generate-only',
  requirePermission('write'),
  validate({ body: generateOnlySchema }),
  DocumentGenerationController.generateDocumentsOnly
);

/**
 * Get project review status
 * GET /api/document-generation/projects/:projectId/review-status
 */
router.get(
  '/projects/:projectId/review-status',
  requirePermission('read'),
  DocumentGenerationController.getProjectReviewStatus
);

/**
 * Get workflow status for a project
 * GET /api/document-generation/projects/:projectId/workflow-status
 */
router.get(
  '/projects/:projectId/workflow-status',
  requirePermission('read'),
  DocumentGenerationController.getWorkflowStatus
);

/**
 * Regenerate document with feedback
 * POST /api/document-generation/reviews/:reviewId/regenerate
 */
router.post(
  '/reviews/:reviewId/regenerate',
  requirePermission('write'),
  validate({ body: regenerateWithFeedbackSchema }),
  DocumentGenerationController.regenerateWithFeedback
);

/**
 * Bulk approve documents
 * POST /api/document-generation/projects/:projectId/bulk-approve
 */
router.post(
  '/projects/:projectId/bulk-approve',
  requirePermission('write'),
  validate({ body: bulkApproveSchema }),
  DocumentGenerationController.bulkApproveDocuments
);

export default router;