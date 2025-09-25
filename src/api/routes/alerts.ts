import { Router } from 'express';
import { AlertController } from '../controllers/AlertController.js';

const router = Router();

/**
 * Alert System Routes
 * Provides endpoints for alert management, threshold configuration, and monitoring.
 */

// Alert Management
router.get('/alerts', AlertController.getAlerts);
router.get('/alerts/:id', AlertController.getAlert);
router.post('/alerts/:id/acknowledge', AlertController.acknowledgeAlert);
router.post('/alerts/:id/resolve', AlertController.resolveAlert);
router.get('/alerts/stats', AlertController.getAlertStats);

// Alert Threshold Management
router.get('/alerts/thresholds', AlertController.getThresholds);
router.post('/alerts/thresholds', AlertController.createThreshold);
router.put('/alerts/thresholds/:id', AlertController.updateThreshold);
router.delete('/alerts/thresholds/:id', AlertController.deleteThreshold);

// Alert Rule Management
router.get('/alerts/rules', AlertController.getRules);
router.post('/alerts/rules', AlertController.createRule);

// System Operations
router.post('/alerts/test', AlertController.triggerTestAlert);
router.get('/alerts/system/status', AlertController.getSystemStatus);

export default router;
