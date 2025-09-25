import { Router } from 'express';
import { AIBillingController } from '../controllers/AIBillingController.js';

const router = Router();

/**
 * AI Billing Routes
 * Provides endpoints for AI provider billing analytics and budget monitoring
 */

/**
 * @swagger
 * /api/v1/billing/analytics:
 *   get:
 *     summary: Get AI billing analytics
 *     tags: [AI Billing]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by AI provider
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days for analytics
 *     responses:
 *       200:
 *         description: Billing analytics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/billing/analytics', AIBillingController.getBillingAnalytics);

/**
 * @swagger
 * /api/v1/billing/estimate:
 *   post:
 *     summary: Estimate cost for an AI operation
 *     tags: [AI Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - model
 *               - promptTokens
 *               - estimatedCompletionTokens
 *             properties:
 *               provider:
 *                 type: string
 *                 description: AI provider name
 *               model:
 *                 type: string
 *                 description: AI model name
 *               promptTokens:
 *                 type: integer
 *                 description: Number of prompt tokens
 *               estimatedCompletionTokens:
 *                 type: integer
 *                 description: Estimated number of completion tokens
 *               confidence:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *                 description: Confidence level of the estimate
 *     responses:
 *       200:
 *         description: Cost estimate calculated successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/billing/estimate', AIBillingController.estimateCost);

/**
 * @swagger
 * /api/v1/billing/budgets:
 *   get:
 *     summary: Get budget statuses
 *     tags: [AI Billing]
 *     responses:
 *       200:
 *         description: Budget statuses retrieved successfully
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new budget
 *     tags: [AI Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - monthlyBudget
 *               - currency
 *             properties:
 *               name:
 *                 type: string
 *                 description: Budget name
 *               projectId:
 *                 type: string
 *                 description: Project ID (optional)
 *               userId:
 *                 type: string
 *                 description: User ID (optional)
 *               provider:
 *                 type: string
 *                 description: AI provider (optional)
 *               monthlyBudget:
 *                 type: number
 *                 description: Monthly budget amount
 *               dailyBudget:
 *                 type: number
 *                 description: Daily budget amount (optional)
 *               currency:
 *                 type: string
 *                 default: USD
 *                 description: Currency code
 *               alertThresholds:
 *                 type: object
 *                 properties:
 *                   warning:
 *                     type: number
 *                     default: 75
 *                     description: Warning threshold percentage
 *                   critical:
 *                     type: number
 *                     default: 90
 *                     description: Critical threshold percentage
 *     responses:
 *       201:
 *         description: Budget created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.get('/billing/budgets', AIBillingController.getBudgetStatuses);
router.post('/billing/budgets', AIBillingController.createBudget);

/**
 * @swagger
 * /api/v1/billing/budgets/{budgetId}:
 *   put:
 *     summary: Update a budget
 *     tags: [AI Billing]
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               monthlyBudget:
 *                 type: number
 *               dailyBudget:
 *                 type: number
 *               currency:
 *                 type: string
 *               alertThresholds:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       404:
 *         description: Budget not found
 *       500:
 *         description: Internal server error
 */
router.put('/billing/budgets/:budgetId', AIBillingController.updateBudget);

/**
 * @swagger
 * /api/v1/billing/alerts:
 *   get:
 *     summary: Get budget alerts
 *     tags: [AI Billing]
 *     parameters:
 *       - in: query
 *         name: acknowledged
 *         schema:
 *           type: boolean
 *         description: Filter by acknowledgment status
 *     responses:
 *       200:
 *         description: Budget alerts retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/billing/alerts', AIBillingController.getBudgetAlerts);

/**
 * @swagger
 * /api/v1/billing/alerts/{alertId}/acknowledge:
 *   post:
 *     summary: Acknowledge a budget alert
 *     tags: [AI Billing]
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert acknowledged successfully
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Internal server error
 */
router.post('/billing/alerts/:alertId/acknowledge', AIBillingController.acknowledgeAlert);

/**
 * @swagger
 * /api/v1/billing/providers/{provider}:
 *   get:
 *     summary: Get provider billing information
 *     tags: [AI Billing]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *         description: AI provider name
 *     responses:
 *       200:
 *         description: Provider billing information retrieved successfully
 *       404:
 *         description: Provider not found
 *       500:
 *         description: Internal server error
 */
router.get('/billing/providers/:provider', AIBillingController.getProviderBillingInfo);

export default router;
