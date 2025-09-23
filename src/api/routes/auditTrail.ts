import { Router } from 'express';
import { AuditTrailController } from '../controllers/AuditTrailController';
import { requirePermission } from '../middleware/auth';

const router = Router();
const auditTrailController = new AuditTrailController();

// Get audit trail entries with filtering and pagination
router.get('/', requirePermission('read'), auditTrailController.getAuditTrail);

// Get audit trail for a specific document
router.get('/document/:documentId', requirePermission('read'), auditTrailController.getDocumentAuditTrail);

// Get audit trail for a specific project
router.get('/project/:projectId', requirePermission('read'), auditTrailController.getProjectAuditTrail);

// Get audit trail statistics
router.get('/stats', requirePermission('read'), auditTrailController.getAuditTrailStats);

// Get audit trail dashboard data
router.get('/dashboard', requirePermission('read'), auditTrailController.getAuditTrailDashboard);

// Create a new audit trail entry
router.post('/', requirePermission('write'), auditTrailController.createAuditEntry);

// Export audit trail to CSV
router.get('/export', requirePermission('read'), auditTrailController.exportAuditTrail);

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Audit trail API is working',
    timestamp: new Date().toISOString()
  });
});

export default router;

