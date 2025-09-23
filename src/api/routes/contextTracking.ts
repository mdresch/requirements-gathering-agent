import { Router } from 'express';
import { ContextTrackingController } from '../controllers/ContextTrackingController.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

/**
 * Context Tracking Routes
 * Provides comprehensive AI context utilization monitoring and traceability
 */

/**
 * Get context utilization analytics for a project
 * GET /api/v1/context-tracking/projects/:projectId/analytics
 */
router.get(
    '/projects/:projectId/analytics',
    ContextTrackingController.getProjectAnalytics
);

/**
 * Get traceability matrix for a document
 * GET /api/v1/context-tracking/documents/:documentId/traceability
 */
router.get(
    '/documents/:documentId/traceability',
    ContextTrackingController.getDocumentTraceability
);

/**
 * Get context utilization metrics for a document
 * GET /api/v1/context-tracking/documents/:documentId/metrics
 */
router.get(
    '/documents/:documentId/metrics',
    ContextTrackingController.getDocumentContextMetrics
);

/**
 * Get context utilization details for a specific generation job
 * GET /api/v1/context-tracking/jobs/:jobId
 */
router.get(
    '/jobs/:jobId',
    ContextTrackingController.getGenerationJobDetails
);

/**
 * Get system-wide context utilization statistics
 * GET /api/v1/context-tracking/system/analytics
 */
router.get(
    '/system/analytics',
    ContextTrackingController.getSystemAnalytics
);

/**
 * Test route to verify context tracking is working
 * GET /api/v1/context-tracking/test
 */
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Context tracking routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Simple test without middleware
router.get('/simple-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Simple test route works!',
    timestamp: new Date().toISOString()
  });
});

export default router;
