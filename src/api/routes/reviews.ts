import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController.js';
import { validate } from '../middleware/validation.js';
import { requirePermission } from '../middleware/auth.js';
import {
  createReviewSchema,
  assignReviewerSchema,
  submitFeedbackSchema,
  updateReviewStatusSchema,
  reviewSearchSchema,
  analyticsQuerySchema,
  reviewStatsSchema
} from '../validators/reviewSchemas.js';

const router = Router();

// Review Management Routes
router.post(
  '/',
  requirePermission('write'),
  validate(createReviewSchema),
  ReviewController.createReview
);

router.get(
  '/',
  requirePermission('read'),
  validate(reviewSearchSchema, 'query'),
  ReviewController.searchReviews
);

router.get(
  '/stats',
  requirePermission('read'),
  validate(reviewStatsSchema, 'query'),
  ReviewController.getReviewStats
);

router.get(
  '/analytics',
  requirePermission('read'),
  validate(analyticsQuerySchema, 'query'),
  ReviewController.getReviewAnalytics
);

router.get(
  '/my-reviews',
  requirePermission('read'),
  validate(reviewSearchSchema, 'query'),
  ReviewController.getMyReviews
);

router.get(
  '/:reviewId',
  requirePermission('read'),
  ReviewController.getReview
);

router.patch(
  '/:reviewId/status',
  requirePermission('write'),
  validate(updateReviewStatusSchema),
  ReviewController.updateReviewStatus
);

// Reviewer Assignment Routes
router.post(
  '/:reviewId/assign',
  requirePermission('write'),
  validate(assignReviewerSchema),
  ReviewController.assignReviewer
);

router.post(
  '/:reviewId/accept',
  requirePermission('write'),
  ReviewController.acceptReviewAssignment
);

router.post(
  '/:reviewId/decline',
  requirePermission('write'),
  ReviewController.declineReviewAssignment
);

// Feedback Submission Routes
router.post(
  '/:reviewId/feedback',
  requirePermission('write'),
  validate(submitFeedbackSchema),
  ReviewController.submitFeedback
);

// Project-specific Routes
router.get(
  '/projects/:projectId',
  requirePermission('read'),
  ReviewController.getProjectReviews
);

// Dashboard Routes
router.get(
  '/dashboard/:reviewerId',
  requirePermission('read'),
  ReviewController.getReviewerDashboard
);

export default router;