import express from 'express';
import { FeedbackController } from '../controllers/FeedbackController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/feedback/summary:
 *   get:
 *     summary: Get feedback summary statistics
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: Feedback summary retrieved successfully
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
 *                     totalFeedback:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                     ratingDistribution:
 *                       type: object
 *                     recentFeedback:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Internal server error
 */
router.get('/summary', FeedbackController.getFeedbackSummary);
router.get('/trends', FeedbackController.getFeedbackTrends);
router.get('/performance', FeedbackController.getDocumentPerformance);

/**
 * @swagger
 * /api/v1/feedback/project/{projectId}:
 *   get:
 *     summary: Get feedback for a specific project
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project feedback retrieved successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', FeedbackController.getProjectFeedback);

/**
 * @swagger
 * /api/v1/feedback/document/{documentId}:
 *   get:
 *     summary: Get feedback for a specific document
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document feedback retrieved successfully
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.get('/document/:documentId', FeedbackController.getDocumentFeedback);

/**
 * @swagger
 * /api/v1/feedback:
 *   post:
 *     summary: Submit new feedback
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *               - rating
 *               - feedbackType
 *               - description
 *             properties:
 *               documentId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               feedbackType:
 *                 type: string
 *                 enum: [quality, accuracy, completeness, clarity, usability]
 *               description:
 *                 type: string
 *               title:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               suggestedImprovement:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid feedback data
 *       500:
 *         description: Internal server error
 */
router.post('/', FeedbackController.submitFeedback);

/**
 * @swagger
 * /api/v1/feedback/{feedbackId}/status:
 *   put:
 *     summary: Update feedback status
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in-review, resolved, closed]
 *               reviewerComments:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *     responses:
 *       200:
 *         description: Feedback status updated successfully
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
router.put('/:feedbackId/status', FeedbackController.updateFeedbackStatus);

/**
 * @swagger
 * /api/v1/feedback/analytics/{projectId}:
 *   get:
 *     summary: Get feedback analytics for a project
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Feedback analytics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/:projectId', FeedbackController.getFeedbackAnalytics);

export default router;