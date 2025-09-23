import express from 'express';
import { StakeholderController } from '../controllers/StakeholderController.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

/**
 * @swagger
 * /api/v1/stakeholders/project/{projectId}:
 *   get:
 *     summary: Get all stakeholders for a project
 *     tags: [Stakeholders]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [project_manager, sponsor, team_member, end_user, stakeholder]
 *         description: Filter by stakeholder role
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Stakeholders retrieved successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', 
  [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    query('role').optional().isIn(['project_manager', 'sponsor', 'team_member', 'end_user', 'stakeholder']),
    query('active').optional().isBoolean()
  ],
  StakeholderController.getProjectStakeholders
);

/**
 * @swagger
 * /api/v1/stakeholders/project/{projectId}:
 *   post:
 *     summary: Create a new stakeholder
 *     tags: [Stakeholders]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - title
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               role:
 *                 type: string
 *                 enum: [project_manager, sponsor, team_member, end_user, stakeholder]
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *               department:
 *                 type: string
 *                 maxLength: 100
 *               influence:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: medium
 *               interest:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               powerLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 default: 3
 *               engagementLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 default: 3
 *               communicationPreference:
 *                 type: string
 *                 enum: [email, phone, meeting, portal]
 *                 default: email
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               concerns:
 *                 type: array
 *                 items:
 *                   type: string
 *               expectations:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Stakeholder created successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.post('/project/:projectId',
  [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be 1-100 characters'),
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be 1-100 characters'),
    body('role').isIn(['project_manager', 'sponsor', 'team_member', 'end_user', 'stakeholder']).withMessage('Invalid role'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().isLength({ max: 20 }).withMessage('Phone must be max 20 characters'),
    body('department').optional().isLength({ max: 100 }).withMessage('Department must be max 100 characters'),
    body('influence').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('interest').optional().isIn(['low', 'medium', 'high']),
    body('powerLevel').optional().isInt({ min: 1, max: 5 }),
    body('engagementLevel').optional().isInt({ min: 1, max: 5 }),
    body('communicationPreference').optional().isIn(['email', 'phone', 'meeting', 'portal']),
    body('requirements').optional().isArray(),
    body('concerns').optional().isArray(),
    body('expectations').optional().isArray(),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be max 1000 characters')
  ],
  StakeholderController.createStakeholder
);

/**
 * @swagger
 * /api/v1/stakeholders/{stakeholderId}:
 *   put:
 *     summary: Update a stakeholder
 *     tags: [Stakeholders]
 *     parameters:
 *       - in: path
 *         name: stakeholderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stakeholder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               role:
 *                 type: string
 *                 enum: [project_manager, sponsor, team_member, end_user, stakeholder]
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *               department:
 *                 type: string
 *                 maxLength: 100
 *               influence:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               interest:
 *                 type: string
 *                 enum: [low, medium, high]
 *               powerLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               engagementLevel:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               communicationPreference:
 *                 type: string
 *                 enum: [email, phone, meeting, portal]
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               concerns:
 *                 type: array
 *                 items:
 *                   type: string
 *               expectations:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Stakeholder updated successfully
 *       404:
 *         description: Stakeholder not found
 *       500:
 *         description: Internal server error
 */
router.put('/:stakeholderId',
  [
    param('stakeholderId').isMongoId().withMessage('Invalid stakeholder ID'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('title').optional().trim().isLength({ min: 1, max: 100 }),
    body('role').optional().isIn(['project_manager', 'sponsor', 'team_member', 'end_user', 'stakeholder']),
    body('email').optional().isEmail(),
    body('phone').optional().isLength({ max: 20 }),
    body('department').optional().isLength({ max: 100 }),
    body('influence').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('interest').optional().isIn(['low', 'medium', 'high']),
    body('powerLevel').optional().isInt({ min: 1, max: 5 }),
    body('engagementLevel').optional().isInt({ min: 1, max: 5 }),
    body('communicationPreference').optional().isIn(['email', 'phone', 'meeting', 'portal']),
    body('requirements').optional().isArray(),
    body('concerns').optional().isArray(),
    body('expectations').optional().isArray(),
    body('isActive').optional().isBoolean(),
    body('notes').optional().isLength({ max: 1000 })
  ],
  StakeholderController.updateStakeholder
);

/**
 * @swagger
 * /api/v1/stakeholders/{stakeholderId}:
 *   delete:
 *     summary: Delete a stakeholder
 *     tags: [Stakeholders]
 *     parameters:
 *       - in: path
 *         name: stakeholderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stakeholder ID
 *     responses:
 *       200:
 *         description: Stakeholder deleted successfully
 *       404:
 *         description: Stakeholder not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:stakeholderId',
  [
    param('stakeholderId').isMongoId().withMessage('Invalid stakeholder ID')
  ],
  StakeholderController.deleteStakeholder
);

/**
 * @swagger
 * /api/v1/stakeholders/analytics/{projectId}:
 *   get:
 *     summary: Get stakeholder analytics for a project
 *     tags: [Stakeholders]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Stakeholder analytics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/:projectId',
  [
    param('projectId').isMongoId().withMessage('Invalid project ID')
  ],
  StakeholderController.getStakeholderAnalytics
);

export default router;
