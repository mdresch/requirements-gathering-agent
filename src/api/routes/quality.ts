// Quality Routes
// filepath: src/api/routes/quality.ts

import { Router } from 'express';
import { QualityController } from '../controllers/QualityController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Initialize quality controller
QualityController.initialize();

/**
 * @swagger
 * components:
 *   schemas:
 *     QualityAssessmentResult:
 *       type: object
 *       properties:
 *         overallScore:
 *           type: number
 *           description: Overall quality score (0-100)
 *         dimensionScores:
 *           type: object
 *           properties:
 *             structure:
 *               type: number
 *             completeness:
 *               type: number
 *             accuracy:
 *               type: number
 *             consistency:
 *               type: number
 *             relevance:
 *               type: number
 *             professionalQuality:
 *               type: number
 *             standardsCompliance:
 *               type: number
 *         strengths:
 *           type: array
 *           items:
 *             type: string
 *         weaknesses:
 *           type: array
 *           items:
 *             type: string
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *         assessmentDate:
 *           type: string
 *           format: date-time
 *         assessmentVersion:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/quality/assess/{documentId}:
 *   post:
 *     summary: Assess quality for a specific document
 *     tags: [Quality]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Quality assessment completed successfully
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
 *                     documentId:
 *                       type: string
 *                     documentName:
 *                       type: string
 *                     qualityResult:
 *                       $ref: '#/components/schemas/QualityAssessmentResult'
 *       400:
 *         description: Invalid document ID
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.post('/assess/:documentId', authMiddleware, QualityController.assessDocumentQuality);

/**
 * @swagger
 * /api/v1/quality/document/{documentId}:
 *   get:
 *     summary: Get quality assessment for a document
 *     tags: [Quality]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Quality assessment retrieved successfully
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
 *                   $ref: '#/components/schemas/QualityAssessmentResult'
 *       400:
 *         description: Invalid document ID
 *       404:
 *         description: Quality assessment not found
 *       500:
 *         description: Internal server error
 */
router.get('/document/:documentId', authMiddleware, QualityController.getDocumentQuality);

/**
 * @swagger
 * /api/v1/quality/project/{projectId}/stats:
 *   get:
 *     summary: Get quality statistics for a project
 *     tags: [Quality]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project quality statistics retrieved successfully
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
 *                     projectId:
 *                       type: string
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalDocuments:
 *                           type: number
 *                         averageQualityScore:
 *                           type: number
 *                         qualityDistribution:
 *                           type: object
 *                         dimensionAverages:
 *                           type: object
 *                         documentsByType:
 *                           type: object
 *                         recentAssessments:
 *                           type: array
 *       400:
 *         description: Invalid project ID
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId/stats', authMiddleware, QualityController.getProjectQualityStats);

/**
 * @swagger
 * /api/v1/quality/project/{projectId}/reassess:
 *   post:
 *     summary: Reassess quality for all documents in a project
 *     tags: [Quality]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Quality reassessment completed successfully
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
 *                     totalDocuments:
 *                       type: number
 *                     successfulAssessments:
 *                       type: number
 *                     failedAssessments:
 *                       type: number
 *                     updatedDocuments:
 *                       type: array
 *                     errors:
 *                       type: array
 *       400:
 *         description: Invalid project ID
 *       500:
 *         description: Internal server error
 */
router.post('/project/:projectId/reassess', authMiddleware, QualityController.reassessProjectQuality);

export default router;
