// Feedback Routes
// filepath: src/api/routes/feedback.ts

import { Router } from 'express';
import { FeedbackController } from '../controllers/FeedbackController.js';
import { validate } from '../middleware/validation.js';
import { requirePermission } from '../middleware/auth.js';
import { feedbackSchemas } from '../validators/feedbackSchemas.js';

const router = Router();

// Submit new feedback
router.post(
  '/',
  requirePermission('write'),
  validate(feedbackSchemas.submitFeedback),
  FeedbackController.submitFeedback
);

// Get feedback for a specific project
router.get(
  '/project/:projectId',
  requirePermission('read'),
  FeedbackController.getProjectFeedback
);

// Get feedback for a specific document
router.get(
  '/project/:projectId/document/:documentType',
  requirePermission('read'),
  FeedbackController.getDocumentFeedback
);

// Update feedback status
router.patch(
  '/:feedbackId/status',
  requirePermission('write'),
  validate(feedbackSchemas.updateStatus),
  FeedbackController.updateFeedbackStatus
);

// Get feedback analytics for a project
router.get(
  '/analytics/:projectId',
  requirePermission('read'),
  FeedbackController.getFeedbackAnalytics
);

// Get feedback summary for dashboard
router.get(
  '/summary',
  requirePermission('read'),
  FeedbackController.getFeedbackSummary
);

// Search feedback across projects
router.get(
  '/search',
  requirePermission('read'),
  FeedbackController.searchFeedback
);

// Get feedback insights for AI improvement
router.get(
  '/insights',
  requirePermission('read'),
  FeedbackController.getFeedbackInsights
);

export default router;