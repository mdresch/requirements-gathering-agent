// Phase 1: Compliance Notifications Routes - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import ComplianceNotificationsController from '../controllers/ComplianceNotificationsController.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// Temporary middleware to replace authentication
const tempAuth = (req: any, res: any, next: any) => next();

/**
 * @route GET /api/v1/compliance-notifications/analytics
 * @desc Get notifications analytics
 */
router.get('/analytics', 
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('userId').optional().isString().withMessage('User ID must be a string')
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

      await ComplianceNotificationsController.getAnalytics(req, res);
    } catch (error) {
      logger.error('❌ Error in notifications analytics route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/v1/compliance-notifications
 * @desc Get notifications with filters
 */
router.get('/',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('userId').optional().isString().withMessage('User ID must be a string'),
    query('read').optional().isBoolean().withMessage('Read must be a boolean'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('priority').optional().isString().withMessage('Priority must be a string'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

      await ComplianceNotificationsController.getNotifications(req, res);
    } catch (error) {
      logger.error('❌ Error in get notifications route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/compliance-notifications
 * @desc Create new notification
 */
router.post('/',
  [
    body('type').isIn(['SUCCESS', 'WARNING', 'ERROR', 'INFO', 'COMPLIANCE_UPDATE', 'ISSUE_CREATED', 'ISSUE_RESOLVED', 'WORKFLOW_STARTED', 'WORKFLOW_COMPLETED', 'SYSTEM']).withMessage('Invalid notification type'),
    body('title').isString().withMessage('Title is required'),
    body('message').isString().withMessage('Message is required'),
    body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
    body('category').isIn(['COMPLIANCE', 'ISSUE', 'WORKFLOW', 'SYSTEM', 'USER']).withMessage('Invalid category')
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

      await ComplianceNotificationsController.createNotification(req, res);
    } catch (error) {
      logger.error('❌ Error in create notification route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route PUT /api/v1/compliance-notifications/:notificationId/read
 * @desc Mark notification as read
 */
router.put('/:notificationId/read',
  [
    param('notificationId').isMongoId().withMessage('Valid notification ID is required')
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

      await ComplianceNotificationsController.markAsRead(req, res);
    } catch (error) {
      logger.error('❌ Error in mark as read route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route PUT /api/v1/compliance-notifications/mark-all-read
 * @desc Mark all notifications as read
 */
router.put('/mark-all-read',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('userId').optional().isString().withMessage('User ID must be a string')
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

      await ComplianceNotificationsController.markAllAsRead(req, res);
    } catch (error) {
      logger.error('❌ Error in mark all as read route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route DELETE /api/v1/compliance-notifications/:notificationId
 * @desc Delete notification
 */
router.delete('/:notificationId',
  [
    param('notificationId').isMongoId().withMessage('Valid notification ID is required')
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

      await ComplianceNotificationsController.deleteNotification(req, res);
    } catch (error) {
      logger.error('❌ Error in delete notification route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/compliance-notifications/compliance-event
 * @desc Create compliance event notification
 */
router.post('/compliance-event',
  [
    body('eventType').isIn(['COMPLIANCE_UPDATE', 'ISSUE_CREATED', 'ISSUE_RESOLVED', 'WORKFLOW_STARTED', 'WORKFLOW_COMPLETED']).withMessage('Invalid event type'),
    body('projectId').isString().withMessage('Project ID is required'),
    body('projectName').isString().withMessage('Project name is required'),
    body('details').isObject().withMessage('Event details are required')
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

      await ComplianceNotificationsController.createComplianceEventNotification(req, res);
    } catch (error) {
      logger.error('❌ Error in create compliance event notification route:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/v1/compliance-notifications/seed
 * @desc Seed sample data for testing
 */
router.post('/seed', tempAuth, async (req, res) => {
  try {
    await ComplianceNotificationsController.seedSampleData(req, res);
  } catch (error) {
    logger.error('❌ Error in seed sample data route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
