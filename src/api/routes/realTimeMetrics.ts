import { Router } from 'express';
import { RealTimeMetricsController } from '../controllers/RealTimeMetricsController.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

/**
 * Real-time Metrics Routes
 * Provides endpoints for real-time metrics aggregation and streaming
 */

/**
 * @swagger
 * /api/v1/metrics/dashboard:
 *   get:
 *     summary: Get real-time metrics dashboard data
 *     tags: [Real-time Metrics]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter metrics by project ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days for analytics
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/metrics/dashboard', RealTimeMetricsController.getDashboardMetrics);

/**
 * @swagger
 * /api/v1/metrics/{type}:
 *   get:
 *     summary: Get real-time metrics by type
 *     tags: [Real-time Metrics]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user_activity, document_generation, template_usage, adobe_integration, api_usage, system_performance]
 *         description: Type of metrics to retrieve
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of metrics to return
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *       400:
 *         description: Invalid metric type
 *       500:
 *         description: Internal server error
 */
router.get('/metrics/:type', RealTimeMetricsController.getMetricsByType);

/**
 * @swagger
 * /api/v1/metrics/user-activity/{userId}:
 *   get:
 *     summary: Get user activity analytics
 *     tags: [Real-time Metrics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (optional, defaults to authenticated user)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days for analytics
 *     responses:
 *       200:
 *         description: User activity analytics retrieved successfully
 *       400:
 *         description: User ID required
 *       500:
 *         description: Internal server error
 */
router.get('/metrics/user-activity/:userId?', RealTimeMetricsController.getUserActivityAnalytics);

/**
 * @swagger
 * /api/v1/metrics/adobe-analytics:
 *   get:
 *     summary: Get Adobe integration analytics
 *     tags: [Real-time Metrics]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *     responses:
 *       200:
 *         description: Adobe analytics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/metrics/adobe-analytics', RealTimeMetricsController.getAdobeAnalytics);

/**
 * @swagger
 * /api/v1/metrics/stream:
 *   get:
 *     summary: Stream real-time metrics via Server-Sent Events
 *     tags: [Real-time Metrics]
 *     parameters:
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *           default: all
 *         description: Comma-separated list of metric types to stream
 *     responses:
 *       200:
 *         description: Real-time metrics stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: Server-Sent Events stream
 *       500:
 *         description: Internal server error
 */
router.get('/metrics/stream', RealTimeMetricsController.streamMetrics);

export default router;
