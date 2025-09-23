import express from 'express';
import { DocumentGenerationController } from '../api/controllers/DocumentGenerationController.js';

const router = express.Router();

// Generate documents with automatic review creation
router.post('/', DocumentGenerationController.generateWithReview);

// Generate documents only (without review)
router.post('/generate-only', DocumentGenerationController.generateDocumentsOnly);

// Generate with validation and review
router.post('/generate-with-validation', DocumentGenerationController.generateWithValidationAndReview);

// Get project review status
router.get('/project/:projectId/review-status', DocumentGenerationController.getProjectReviewStatus);

// Regenerate with feedback
router.post('/regenerate-with-feedback', DocumentGenerationController.regenerateWithFeedback);

// Bulk approve documents
router.post('/bulk-approve', DocumentGenerationController.bulkApproveDocuments);

// Get workflow status
router.get('/workflow/:workflowId/status', DocumentGenerationController.getWorkflowStatus);

export default router;
