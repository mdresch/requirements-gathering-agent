/**
 * Scope Control Routes
 * API routes for adaptive scope control functionality
 * 
 * @description Defines REST API routes for scope control operations including
 * monitoring initialization, change management, and compliance validation
 * 
 * @version 1.0.0
 * @since 3.2.0
 */

import { Router } from 'express';
import { ScopeControlController } from '../controllers/ScopeControlController.js';
import { validateScopeChangeRequest, validateProjectId } from '../validators/scopeControlValidators.js';
import { requestLogger } from '../middleware/requestLogger.js';
import { errorHandler } from '../middleware/errorHandler.js';

const router = Router();

// Apply middleware
router.use(requestLogger);

/**
 * @route POST /api/projects/:projectId/scope-control/initialize
 * @desc Initialize scope control monitoring for a project
 * @access Public
 */
router.post(
  '/projects/:projectId/scope-control/initialize',
  validateProjectId,
  ScopeControlController.initializeScopeControl
);

/**
 * @route POST /api/projects/:projectId/scope-control/changes
 * @desc Submit a scope change request
 * @access Public
 */
router.post(
  '/projects/:projectId/scope-control/changes',
  validateProjectId,
  validateScopeChangeRequest,
  ScopeControlController.submitScopeChange
);

/**
 * @route PUT /api/scope-control/changes/:changeId/approve
 * @desc Approve a scope change
 * @access Public
 */
router.put(
  '/scope-control/changes/:changeId/approve',
  ScopeControlController.approveScopeChange
);

/**
 * @route GET /api/projects/:projectId/scope-control/metrics
 * @desc Get scope metrics for a project
 * @access Public
 */
router.get(
  '/projects/:projectId/scope-control/metrics',
  validateProjectId,
  ScopeControlController.getScopeMetrics
);

/**
 * @route GET /api/projects/:projectId/scope-control/alerts
 * @desc Get scope alerts for a project
 * @access Public
 */
router.get(
  '/projects/:projectId/scope-control/alerts',
  validateProjectId,
  ScopeControlController.getScopeAlerts
);

/**
 * @route POST /api/projects/:projectId/scope-control/detect-creep
 * @desc Detect scope creep for a project
 * @access Public
 */
router.post(
  '/projects/:projectId/scope-control/detect-creep',
  validateProjectId,
  ScopeControlController.detectScopeCreep
);

/**
 * @route DELETE /api/projects/:projectId/scope-control/monitoring
 * @desc Stop scope control monitoring for a project
 * @access Public
 */
router.delete(
  '/projects/:projectId/scope-control/monitoring',
  validateProjectId,
  ScopeControlController.stopScopeControlMonitoring
);

/**
 * @route GET /api/projects/:projectId/scope-control/dashboard
 * @desc Get comprehensive scope control dashboard data
 * @access Public
 */
router.get(
  '/projects/:projectId/scope-control/dashboard',
  validateProjectId,
  ScopeControlController.getScopeControlDashboard
);

// Apply error handling middleware
router.use(errorHandler);

export default router;