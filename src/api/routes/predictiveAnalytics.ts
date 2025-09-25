import { Router } from 'express';
import { PredictiveAnalyticsController } from '../controllers/PredictiveAnalyticsController.js';

const router = Router();

/**
 * Predictive Analytics Routes
 * Provides endpoints for predictive analytics dashboard and visualization
 */

/**
 * @swagger
 * /api/v1/analytics/predictive/dashboard:
 *   get:
 *     summary: Get comprehensive predictive analytics dashboard
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Time range for analytics
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *         description: Specific resource type to analyze
 *     responses:
 *       200:
 *         description: Predictive analytics dashboard retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/predictive/dashboard', PredictiveAnalyticsController.getDashboard);

/**
 * @swagger
 * /api/v1/analytics/predictive/resource-forecasts:
 *   get:
 *     summary: Get resource demand forecasts
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: query
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [compute, storage, bandwidth, ai_tokens, api_calls, users]
 *         description: Resource type to forecast
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for forecast analysis
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for forecast analysis
 *     responses:
 *       200:
 *         description: Resource demand forecast retrieved successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/predictive/resource-forecasts', PredictiveAnalyticsController.getResourceForecasts);

/**
 * @swagger
 * /api/v1/analytics/predictive/cost-forecasts:
 *   get:
 *     summary: Get cost forecasts
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           default: total
 *         description: Cost category to forecast
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for forecast analysis
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for forecast analysis
 *     responses:
 *       200:
 *         description: Cost forecast retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/predictive/cost-forecasts', PredictiveAnalyticsController.getCostForecasts);

/**
 * @swagger
 * /api/v1/analytics/predictive/capacity-plans:
 *   get:
 *     summary: Get capacity plans
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *         description: Specific resource type for capacity planning
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for capacity planning
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for capacity planning
 *     responses:
 *       200:
 *         description: Capacity plans retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/predictive/capacity-plans', PredictiveAnalyticsController.getCapacityPlans);

/**
 * @swagger
 * /api/v1/analytics/predictive/anomalies:
 *   get:
 *     summary: Get anomalies
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *         description: Specific metric to check for anomalies
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, investigating, resolved, false_positive]
 *           default: active
 *         description: Anomaly status filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of anomalies to return
 *     responses:
 *       200:
 *         description: Anomalies retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/predictive/anomalies', PredictiveAnalyticsController.getAnomalies);

/**
 * @swagger
 * /api/v1/analytics/predictive/warnings:
 *   get:
 *     summary: Get early warnings
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [threshold_breach, trend_alert, capacity_warning, cost_alert, performance_degradation]
 *         description: Warning type filter
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Warning severity filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of warnings to return
 *     responses:
 *       200:
 *         description: Early warnings retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/predictive/warnings', PredictiveAnalyticsController.getWarnings);

/**
 * @swagger
 * /api/v1/analytics/predictive/optimization-opportunities:
 *   get:
 *     summary: Get cost optimization opportunities
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           default: total
 *         description: Cost category for optimization analysis
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for optimization analysis
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for optimization analysis
 *     responses:
 *       200:
 *         description: Optimization opportunities retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/predictive/optimization-opportunities', PredictiveAnalyticsController.getOptimizationOpportunities);

/**
 * @swagger
 * /api/v1/analytics/predictive/accuracy:
 *   get:
 *     summary: Get prediction accuracy metrics
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *         description: Specific metric for accuracy analysis
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days for accuracy calculation
 *     responses:
 *       200:
 *         description: Prediction accuracy metrics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/predictive/accuracy', PredictiveAnalyticsController.getPredictionAccuracy);

/**
 * @swagger
 * /api/v1/analytics/predictive/anomalies/{anomalyId}/acknowledge:
 *   post:
 *     summary: Acknowledge an anomaly
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: anomalyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Anomaly ID to acknowledge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID acknowledging the anomaly
 *     responses:
 *       200:
 *         description: Anomaly acknowledged successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Anomaly not found
 *       500:
 *         description: Internal server error
 */
router.post('/analytics/predictive/anomalies/:anomalyId/acknowledge', PredictiveAnalyticsController.acknowledgeAnomaly);

/**
 * @swagger
 * /api/v1/analytics/predictive/anomalies/{anomalyId}/resolve:
 *   post:
 *     summary: Resolve an anomaly
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: anomalyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Anomaly ID to resolve
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: string
 *                 description: Resolution description for the anomaly
 *     responses:
 *       200:
 *         description: Anomaly resolved successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Anomaly not found
 *       500:
 *         description: Internal server error
 */
router.post('/analytics/predictive/anomalies/:anomalyId/resolve', PredictiveAnalyticsController.resolveAnomaly);

/**
 * @swagger
 * /api/v1/analytics/predictive/warnings/{warningId}/acknowledge:
 *   post:
 *     summary: Acknowledge an early warning
 *     tags: [Predictive Analytics]
 *     parameters:
 *       - in: path
 *         name: warningId
 *         required: true
 *         schema:
 *           type: string
 *         description: Warning ID to acknowledge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID acknowledging the warning
 *     responses:
 *       200:
 *         description: Warning acknowledged successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Warning not found
 *       500:
 *         description: Internal server error
 */
router.post('/analytics/predictive/warnings/:warningId/acknowledge', PredictiveAnalyticsController.acknowledgeWarning);

/**
 * @swagger
 * /api/v1/analytics/predictive/scale:
 *   post:
 *     summary: Execute scaling action
 *     tags: [Predictive Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resourceType
 *               - action
 *               - targetCapacity
 *               - reason
 *             properties:
 *               resourceType:
 *                 type: string
 *                 description: Resource type to scale
 *               action:
 *                 type: string
 *                 enum: [scale_up, scale_down]
 *                 description: Scaling action to perform
 *               targetCapacity:
 *                 type: number
 *                 description: Target capacity for scaling
 *               reason:
 *                 type: string
 *                 description: Reason for scaling action
 *     responses:
 *       200:
 *         description: Scaling action executed successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/analytics/predictive/scale', PredictiveAnalyticsController.executeScaling);

export default router;
