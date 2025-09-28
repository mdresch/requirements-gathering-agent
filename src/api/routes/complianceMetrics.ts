// Phase 1: Compliance Metrics Routes - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import ComplianceMetricsController from '../controllers/ComplianceMetricsController.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Temporary middleware to replace authentication
const tempAuth = (req: any, res: any, next: any) => next();

/**
 * @route GET /api/v1/compliance-metrics/analytics
 * @desc Get compliance metrics analytics
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

      await ComplianceMetricsController.getAnalytics(req, res);
    } catch (error) {
      logger.error('❌ Error in compliance metrics analytics route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/compliance-metrics/projects/:projectId
 * @desc Get compliance metrics for a specific project
 */
router.get('/projects/:projectId',
  [
    param('projectId').isString().withMessage('Project ID is required'),
    query('standardType').optional().isString().withMessage('Standard type must be a string')
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

      await ComplianceMetricsController.getProjectMetrics(req, res);
    } catch (error) {
      logger.error('❌ Error in get project metrics route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/compliance-metrics/latest
 * @desc Get latest compliance metrics for dashboard
 */
router.get('/latest',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string')
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

      await ComplianceMetricsController.getLatestMetrics(req, res);
    } catch (error) {
      logger.error('❌ Error in get latest metrics route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/compliance-metrics
 * @desc Create new compliance metric
 */
router.post('/',
  [
    body('projectId').isString().withMessage('Project ID is required'),
    body('standardType').isIn(['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL']).withMessage('Invalid standard type'),
    body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
    body('dataSource').optional().isString().withMessage('Data source must be a string')
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

      await ComplianceMetricsController.createMetric(req, res);
    } catch (error) {
      logger.error('❌ Error in create metric route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route PUT /api/v1/compliance-metrics/:metricId/trends
 * @desc Update metric with trends analysis
 */
router.put('/:metricId/trends',
  [
    param('metricId').isMongoId().withMessage('Valid metric ID is required')
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

      await ComplianceMetricsController.updateMetricWithTrends(req, res);
    } catch (error) {
      logger.error('❌ Error in update metric with trends route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/compliance-metrics/seed
 * @desc Seed sample data for testing
 */
router.post('/seed', tempAuth, async (req, res) => {
  try {
    await ComplianceMetricsController.seedSampleData(req, res);
  } catch (error) {
    logger.error('❌ Error in seed sample data route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
