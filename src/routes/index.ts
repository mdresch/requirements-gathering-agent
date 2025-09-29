import { Router } from 'express';
import templateRoutes from './templates.js';
import projectRoutes from './projects.js';
import feedbackRoutes from './feedback.js';
import categoryRoutes from './categories.js';

/**
 * Main Router for Phase 2 Structure
 * 
 * Centralized router that mounts all route modules.
 * This follows the Phase 2 Agent 1 Route Splitting specifications.
 */

const router = Router();

// Mount routes with version prefix
router.use('/templates', templateRoutes);
router.use('/projects', projectRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/categories', categoryRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      routes: [
        '/templates',
        '/projects', 
        '/feedback',
        '/categories'
      ]
    }
  });
});

// API info endpoint
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Requirements Gathering Agent API',
      version: '2.0.0',
      description: 'Enhanced API with comprehensive validation and route splitting',
      phase: 'Phase 2 Structure',
      features: [
        'Enhanced validation library',
        'Route splitting and modularization',
        'Comprehensive error handling',
        'Standardized response formats',
        'Input sanitization and security'
      ],
      documentation: '/api/v1/docs',
      timestamp: new Date().toISOString()
    }
  });
});

export default router;