import { Router } from 'express';
import { DatabaseHealthController } from '../controllers/DatabaseHealthController.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

/**
 * Database Health Routes
 * Provides comprehensive database health monitoring and management
 */

/**
 * @swagger
 * /api/v1/health/database:
 *   get:
 *     summary: Get comprehensive database health status
 *     tags: [Database Health]
 *     responses:
 *       200:
 *         description: Database is healthy
 *       206:
 *         description: Database is degraded but functional
 *       503:
 *         description: Database is unhealthy
 */
router.get('/health/database', DatabaseHealthController.getDatabaseHealth);

/**
 * @swagger
 * /api/v1/health/database/stats:
 *   get:
 *     summary: Get database connection statistics
 *     tags: [Database Health]
 *     responses:
 *       200:
 *         description: Database statistics retrieved successfully
 *       500:
 *         description: Failed to retrieve database statistics
 */
router.get('/health/database/stats', DatabaseHealthController.getDatabaseStats);

/**
 * @swagger
 * /api/v1/health/database/reconnect:
 *   post:
 *     summary: Force database reconnection
 *     tags: [Database Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database reconnection successful
 *       500:
 *         description: Database reconnection failed
 */
router.post('/health/database/reconnect', 
  requirePermission('admin'), 
  DatabaseHealthController.reconnectDatabase
);

export default router;

