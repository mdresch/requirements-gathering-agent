// Phase 1: Compliance Issues Routes - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import ComplianceIssuesController from '../controllers/ComplianceIssuesController.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Temporary middleware to replace authentication
const tempAuth = (req: any, res: any, next: any) => next();

/**
 * @route GET /api/v1/compliance-issues/analytics
 * @desc Get compliance issues analytics
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

      await ComplianceIssuesController.getAnalytics(req, res);
    } catch (error) {
      logger.error('❌ Error in compliance issues analytics route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/compliance-issues
 * @desc Get all compliance issues with filters
 */
router.get('/',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('standardType').optional().isString().withMessage('Standard type must be a string'),
    query('status').optional().isString().withMessage('Status must be a string'),
    query('severity').optional().isString().withMessage('Severity must be a string'),
    query('assigneeId').optional().isString().withMessage('Assignee ID must be a string'),
    query('search').optional().isString().withMessage('Search term must be a string')
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

      await ComplianceIssuesController.getIssues(req, res);
    } catch (error) {
      logger.error('❌ Error in get issues route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/compliance-issues/projects/:projectId
 * @desc Get compliance issues for a specific project
 */
router.get('/projects/:projectId',
  [
    param('projectId').isString().withMessage('Project ID is required'),
    query('standardType').optional().isString().withMessage('Standard type must be a string'),
    query('status').optional().isString().withMessage('Status must be a string'),
    query('severity').optional().isString().withMessage('Severity must be a string'),
    query('assigneeId').optional().isString().withMessage('Assignee ID must be a string')
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

      await ComplianceIssuesController.getProjectIssues(req, res);
    } catch (error) {
      logger.error('❌ Error in get project issues route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/compliance-issues
 * @desc Create new compliance issue
 */
router.post('/',
  [
    body('projectId').isString().withMessage('Project ID is required'),
    body('standardType').isIn(['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL']).withMessage('Invalid standard type'),
    body('issueType').isString().withMessage('Issue type is required'),
    body('severity').isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']).withMessage('Invalid severity'),
    body('title').isString().withMessage('Title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
    body('createdBy').isString().withMessage('Created by is required')
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

      await ComplianceIssuesController.createIssue(req, res);
    } catch (error) {
      logger.error('❌ Error in create issue route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route PUT /api/v1/compliance-issues/:issueId
 * @desc Update compliance issue
 */
router.put('/:issueId',
  [
    param('issueId').isMongoId().withMessage('Valid issue ID is required'),
    body('status').optional().isString().withMessage('Status must be a string'),
    body('assigneeId').optional().isString().withMessage('Assignee ID must be a string'),
    body('priority').optional().isString().withMessage('Priority must be a string'),
    body('updatedBy').isString().withMessage('Updated by is required')
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

      await ComplianceIssuesController.updateIssue(req, res);
    } catch (error) {
      logger.error('❌ Error in update issue route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/compliance-issues/:issueId/comments
 * @desc Add comment to issue
 */
router.post('/:issueId/comments',
  [
    param('issueId').isMongoId().withMessage('Valid issue ID is required'),
    body('text').isString().withMessage('Comment text is required'),
    body('author').isString().withMessage('Author is required')
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

      await ComplianceIssuesController.addComment(req, res);
    } catch (error) {
      logger.error('❌ Error in add comment route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/compliance-issues/seed
 * @desc Seed sample data for testing
 */
router.post('/seed', tempAuth, async (req, res) => {
  try {
    await ComplianceIssuesController.seedSampleData(req, res);
  } catch (error) {
    logger.error('❌ Error in seed sample data route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
