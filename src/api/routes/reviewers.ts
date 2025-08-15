import { Router } from 'express';
import { ReviewerController } from '../controllers/ReviewerController.js';
import { validate } from '../middleware/validation.js';
import { requirePermission } from '../middleware/auth.js';
import {
  createReviewerProfileSchema,
  updateReviewerProfileSchema,
  updateAvailabilitySchema,
  updatePreferencesSchema,
  reviewerSearchSchema,
  availableReviewersSchema,
  leaderboardQuerySchema
} from '../validators/reviewSchemas.js';

const router = Router();

// Reviewer Profile Management
router.post(
  '/',
  requirePermission('admin'),
  validate(createReviewerProfileSchema),
  ReviewerController.createReviewerProfile
);

router.get(
  '/',
  requirePermission('read'),
  validate(reviewerSearchSchema, 'query'),
  ReviewerController.searchReviewers
);

router.get(
  '/available',
  requirePermission('read'),
  validate(availableReviewersSchema, 'query'),
  ReviewerController.getAvailableReviewers
);

router.get(
  '/leaderboard',
  requirePermission('read'),
  validate(leaderboardQuerySchema, 'query'),
  ReviewerController.getReviewerLeaderboard
);

router.get(
  '/:userId',
  requirePermission('read'),
  ReviewerController.getReviewerProfile
);

router.put(
  '/:userId',
  requirePermission('write'),
  validate(updateReviewerProfileSchema),
  ReviewerController.updateReviewerProfile
);

router.delete(
  '/:userId',
  requirePermission('admin'),
  ReviewerController.deleteReviewerProfile
);

// Reviewer Availability and Preferences
router.patch(
  '/:userId/availability',
  requirePermission('write'),
  validate(updateAvailabilitySchema),
  ReviewerController.updateReviewerAvailability
);

router.patch(
  '/:userId/preferences',
  requirePermission('write'),
  validate(updatePreferencesSchema),
  ReviewerController.updateReviewerPreferences
);

// Reviewer Performance and Metrics
router.get(
  '/:userId/metrics',
  requirePermission('read'),
  ReviewerController.getReviewerMetrics
);

router.get(
  '/:userId/workload',
  requirePermission('read'),
  ReviewerController.getReviewerWorkload
);

export default router;