import { Router } from 'express';
import { DataAggregationController } from '../controllers/DataAggregationController.js';

const router = Router();

/**
 * Data Aggregation Routes
 * Provides endpoints for data aggregation, trend analysis, and benchmarking
 */

/**
 * @swagger
 * /api/v1/analytics/aggregation:
 *   get:
 *     summary: Get aggregated data for analysis
 *     tags: [Data Aggregation]
 *     parameters:
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *           enum: [document_generation, ai_usage, user_activity, template_usage, system_performance, cost_analysis, quality_metrics]
 *         description: Metric to aggregate
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for aggregation
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for aggregation
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month, quarter, year]
 *           default: day
 *         description: Time granularity for aggregation
 *       - in: query
 *         name: aggregationType
 *         schema:
 *           type: string
 *           enum: [sum, average, count, min, max, median, percentile]
 *           default: average
 *         description: Type of aggregation to perform
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by AI provider
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by AI model
 *     responses:
 *       200:
 *         description: Aggregated data retrieved successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/aggregation', DataAggregationController.getAggregatedData);

/**
 * @swagger
 * /api/v1/analytics/trends:
 *   get:
 *     summary: Get trend analysis for a metric
 *     tags: [Data Aggregation]
 *     parameters:
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *         description: Metric to analyze trends for
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for trend analysis
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for trend analysis
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *         description: Time granularity for trend analysis
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by AI provider
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by AI model
 *     responses:
 *       200:
 *         description: Trend analysis retrieved successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/trends', DataAggregationController.getTrendAnalysis);

/**
 * @swagger
 * /api/v1/analytics/benchmarks:
 *   get:
 *     summary: Get performance benchmarks
 *     tags: [Data Aggregation]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for benchmark calculation (defaults to 30 days ago)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for benchmark calculation (defaults to now)
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by AI provider
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by AI model
 *     responses:
 *       200:
 *         description: Benchmarks retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/benchmarks', DataAggregationController.getBenchmarks);

/**
 * @swagger
 * /api/v1/analytics/benchmarks/categories:
 *   get:
 *     summary: Get benchmarks grouped by category
 *     tags: [Data Aggregation]
 *     responses:
 *       200:
 *         description: Benchmarks by category retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/benchmarks/categories', DataAggregationController.getBenchmarksByCategory);

/**
 * @swagger
 * /api/v1/analytics/benchmarks/industry-comparison:
 *   get:
 *     summary: Compare performance with industry standards
 *     tags: [Data Aggregation]
 *     parameters:
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *         description: Metric to compare
 *       - in: query
 *         name: currentValue
 *         required: true
 *         schema:
 *           type: number
 *         description: Current value of the metric
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by AI provider
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Filter by AI model
 *     responses:
 *       200:
 *         description: Industry comparison retrieved successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/benchmarks/industry-comparison', DataAggregationController.getIndustryComparison);

/**
 * @swagger
 * /api/v1/analytics/benchmarks/insights:
 *   get:
 *     summary: Get benchmarking insights and recommendations
 *     tags: [Data Aggregation]
 *     responses:
 *       200:
 *         description: Benchmarking insights retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/benchmarks/insights', DataAggregationController.getBenchmarkingInsights);

/**
 * @swagger
 * /api/v1/analytics/performance-profiles:
 *   post:
 *     summary: Create a performance profile
 *     tags: [Data Aggregation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - metrics
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the performance profile
 *               description:
 *                 type: string
 *                 description: Description of the performance profile
 *               metrics:
 *                 type: object
 *                 description: Metrics configuration with baseline, target, and weight
 *                 example:
 *                   document_generation_time:
 *                     baseline: 2.5
 *                     target: 1.5
 *                     weight: 0.3
 *                   cost_per_document:
 *                     baseline: 0.05
 *                     target: 0.03
 *                     weight: 0.2
 *     responses:
 *       201:
 *         description: Performance profile created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/analytics/performance-profiles', DataAggregationController.createPerformanceProfile);

/**
 * @swagger
 * /api/v1/analytics/performance-profiles/{profileId}/score:
 *   get:
 *     summary: Calculate performance profile score
 *     tags: [Data Aggregation]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: Performance profile ID
 *     responses:
 *       200:
 *         description: Performance profile score calculated successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics/performance-profiles/:profileId/score', DataAggregationController.calculateProfileScore);

export default router;
