import { Router } from 'express';
import { GenerationJobController } from '../controllers/GenerationJobController.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new generation job
router.post('/', requirePermission('write'), GenerationJobController.createJob);

// Get job by ID
router.get('/:jobId', requirePermission('read'), GenerationJobController.getJob);

// Update job status and progress
router.patch('/:jobId', requirePermission('write'), GenerationJobController.updateJob);

// Cancel a job
router.delete('/:jobId', requirePermission('write'), GenerationJobController.cancelJob);

// Add log entry to job
router.post('/:jobId/logs', requirePermission('write'), GenerationJobController.addLog);

// Get jobs for a specific project
router.get('/project/:projectId', requirePermission('read'), GenerationJobController.getProjectJobs);

// Get jobs by status
router.get('/status/:status', requirePermission('read'), GenerationJobController.getJobsByStatus);

// Get active jobs (pending or processing)
router.get('/active/jobs', requirePermission('read'), GenerationJobController.getActiveJobs);

// Get job statistics
router.get('/stats/overview', requirePermission('read'), GenerationJobController.getJobStats);

export default router;
