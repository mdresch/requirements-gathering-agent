// Phase 1: Document Reviews Routes - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import DocumentReviewsController from '../controllers/DocumentReviewsController.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Temporary middleware to replace authentication
const tempAuth = (req: any, res: any, next: any) => next();

/**
 * @route GET /api/v1/document-reviews/analytics
 * @desc Get document reviews analytics
 */
router.get('/analytics', 
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date')
  ],
  tempAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      await DocumentReviewsController.getAnalytics(req, res);
    } catch (error) {
      logger.error('❌ Error in document reviews analytics route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/document-reviews
 * @desc Get all document reviews with filters
 */
router.get('/',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('status').optional().isString().withMessage('Status must be a string'),
    query('priority').optional().isString().withMessage('Priority must be a string'),
    query('reviewerId').optional().isString().withMessage('Reviewer ID must be a string'),
    query('documentType').optional().isString().withMessage('Document type must be a string')
  ],
  tempAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      await DocumentReviewsController.getReviews(req, res);
    } catch (error) {
      logger.error('❌ Error in get reviews route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/document-reviews/projects/:projectId
 * @desc Get document reviews for a specific project
 */
router.get('/projects/:projectId',
  [
    param('projectId').isString().withMessage('Project ID is required'),
    query('status').optional().isString().withMessage('Status must be a string'),
    query('priority').optional().isString().withMessage('Priority must be a string'),
    query('reviewerId').optional().isString().withMessage('Reviewer ID must be a string'),
    query('documentType').optional().isString().withMessage('Document type must be a string')
  ],
  tempAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      await DocumentReviewsController.getProjectReviews(req, res);
    } catch (error) {
      logger.error('❌ Error in get project reviews route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/document-reviews
 * @desc Create new document review
 */
router.post('/',
  [
    body('documentId').isString().withMessage('Document ID is required'),
    body('documentName').isString().withMessage('Document name is required'),
    body('documentType').isString().withMessage('Document type is required'),
    body('documentPath').isString().withMessage('Document path is required'),
    body('projectId').isString().withMessage('Project ID is required'),
    body('projectName').isString().withMessage('Project name is required'),
    body('assignedReviewers').isArray().withMessage('Assigned reviewers must be an array'),
    body('assignedReviewers.*.reviewerId').isString().withMessage('Reviewer ID is required'),
    body('assignedReviewers.*.reviewerName').isString().withMessage('Reviewer name is required'),
    body('assignedReviewers.*.reviewerEmail').isEmail().withMessage('Reviewer email must be valid'),
    body('assignedReviewers.*.role').isString().withMessage('Reviewer role is required')
  ],
  tempAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      await DocumentReviewsController.createReview(req, res);
    } catch (error) {
      logger.error('❌ Error in create review route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route PUT /api/v1/document-reviews/:reviewId/status
 * @desc Update review status
 */
router.put('/:reviewId/status',
  [
    param('reviewId').isMongoId().withMessage('Valid review ID is required'),
    body('status').isString().withMessage('Status is required')
  ],
  tempAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      await DocumentReviewsController.updateReviewStatus(req, res);
    } catch (error) {
      logger.error('❌ Error in update review status route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/document-reviews/:reviewId/feedback
 * @desc Add feedback to review
 */
router.post('/:reviewId/feedback',
  [
    param('reviewId').isMongoId().withMessage('Valid review ID is required'),
    body('roundNumber').isInt({ min: 1 }).withMessage('Round number must be a positive integer'),
    body('reviewerId').isString().withMessage('Reviewer ID is required'),
    body('reviewerName').isString().withMessage('Reviewer name is required'),
    body('feedback').isArray().withMessage('Feedback must be an array'),
    body('decision').isIn(['approve', 'reject', 'request_revision']).withMessage('Invalid decision')
  ],
  tempAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      await DocumentReviewsController.addFeedback(req, res);
    } catch (error) {
      logger.error('❌ Error in add feedback route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/document-reviews/:reviewId/assign-reviewer
 * @desc Assign reviewer to review
 */
router.post('/:reviewId/assign-reviewer',
  [
    param('reviewId').isMongoId().withMessage('Valid review ID is required'),
    body('reviewerId').isString().withMessage('Reviewer ID is required'),
    body('reviewerName').isString().withMessage('Reviewer name is required'),
    body('reviewerEmail').isEmail().withMessage('Reviewer email must be valid'),
    body('role').isString().withMessage('Reviewer role is required')
  ],
  tempAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      await DocumentReviewsController.assignReviewer(req, res);
    } catch (error) {
      logger.error('❌ Error in assign reviewer route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/document-reviews/seed
 * @desc Seed sample data for testing
 */
router.post('/seed', tempAuth, async (req, res) => {
  try {
    await DocumentReviewsController.seedSampleData(req, res);
  } catch (error) {
    logger.error('❌ Error in seed sample data route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
