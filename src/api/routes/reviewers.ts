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
  validate({ body: createReviewerProfileSchema }),
  ReviewerController.createReviewerProfile
);

router.get(
  '/',
  requirePermission('read'),
  validate({ query: reviewerSearchSchema }),
  ReviewerController.searchReviewers
);

router.get(
  '/available',
  requirePermission('read'),
  validate({ query: availableReviewersSchema }),
  ReviewerController.getAvailableReviewers
);

router.get(
  '/leaderboard',
  requirePermission('read'),
  validate({ query: leaderboardQuerySchema }),
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
  validate({ body: updateReviewerProfileSchema }),
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
  validate({ body: updateAvailabilitySchema }),
  ReviewerController.updateReviewerAvailability
);

router.patch(
  '/:userId/preferences',
  requirePermission('write'),
  validate({ body: updatePreferencesSchema }),
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