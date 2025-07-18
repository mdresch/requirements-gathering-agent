// Project Routes
// filepath: src/api/routes/projects.ts

import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController.js';
import {
  validateCreateProject,
  validateUpdateProject,
  validateProjectId,
  validateProjectQuery
} from '../validators/projectValidators.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - framework
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Project name
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           description: Project description
 *         status:
 *           type: string
 *           enum: [draft, active, review, completed, archived]
 *           description: Current project status
 *         framework:
 *           type: string
 *           enum: [babok, pmbok, multi]
 *           description: Framework used for the project
 *         complianceScore:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Compliance score percentage
 *         documents:
 *           type: integer
 *           minimum: 0
 *           description: Number of documents in the project
 *         stakeholders:
 *           type: integer
 *           minimum: 0
 *           description: Number of stakeholders in the project
 *         owner:
 *           type: string
 *           maxLength: 100
 *           description: Project owner name
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             maxLength: 50
 *           maxItems: 10
 *           description: Project tags
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Project priority level
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Project start date
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Project end date
 *         budget:
 *           type: number
 *           minimum: 0
 *           description: Project budget
 *         currency:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           description: Currency code (e.g., USD, EUR)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, review, completed, archived]
 *         description: Filter by project status
 *       - in: query
 *         name: framework
 *         schema:
 *           type: string
 *           enum: [babok, pmbok, multi]
 *         description: Filter by framework
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *         description: Filter by owner name (partial match)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in project name and description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, complianceScore, status]
 *           default: updatedAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       500:
 *         description: Internal server error
 */
router.get('/', validateProjectQuery, ProjectController.getAllProjects);

/**
 * @swagger
 * /api/v1/projects/stats:
 *   get:
 *     summary: Get project statistics
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Project statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalProjects:
 *                           type: integer
 *                         averageComplianceScore:
 *                           type: number
 *                         totalDocuments:
 *                           type: integer
 *                         totalStakeholders:
 *                           type: integer
 *                     statusBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     frameworkBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           averageCompliance:
 *                             type: number
 *       500:
 *         description: Internal server error
 */
router.get('/stats', ProjectController.getProjectStats);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       400:
 *         description: Invalid project ID format
 *       500:
 *         description: Internal server error
 */
router.get('/:id', validateProjectId, ProjectController.getProjectById);

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - framework
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               framework:
 *                 type: string
 *                 enum: [babok, pmbok, multi]
 *               status:
 *                 type: string
 *                 enum: [draft, active, review, completed, archived]
 *               owner:
 *                 type: string
 *                 maxLength: 100
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               documents:
 *                 type: integer
 *                 minimum: 0
 *               stakeholders:
 *                 type: integer
 *                 minimum: 0
 *               budget:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 50
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', validateCreateProject, ProjectController.createProject);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               framework:
 *                 type: string
 *                 enum: [babok, pmbok, multi]
 *               status:
 *                 type: string
 *                 enum: [draft, active, review, completed, archived]
 *               owner:
 *                 type: string
 *                 maxLength: 100
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               documents:
 *                 type: integer
 *                 minimum: 0
 *               stakeholders:
 *                 type: integer
 *                 minimum: 0
 *               budget:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 50
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *                 message:
 *                   type: string
 *       404:
 *         description: Project not found
 *       400:
 *         description: Validation error or invalid ID format
 *       500:
 *         description: Internal server error
 */
router.put('/:id', validateUpdateProject, ProjectController.updateProject);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Project not found
 *       400:
 *         description: Invalid project ID format
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', validateProjectId, ProjectController.deleteProject);

export default router;

