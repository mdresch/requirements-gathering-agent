import { Router } from 'express';
import { AuditTrailController } from '../controllers/AuditTrailController.js';
// import { requirePermission } from '../middleware/auth.js';

const router = Router();
const auditTrailController = new AuditTrailController();

// Temporary middleware to replace requirePermission
const tempAuth = (req: any, res: any, next: any) => next();

// Get audit trail entries with filtering and pagination
router.get('/', tempAuth, auditTrailController.getAuditTrail);

// Get audit trail for a specific document
router.get('/document/:documentId', tempAuth, auditTrailController.getDocumentAuditTrail);

// Get audit trail for a specific project
router.get('/project/:projectId', tempAuth, auditTrailController.getProjectAuditTrail);

// Get audit trail statistics
router.get('/stats', tempAuth, auditTrailController.getAuditTrailStats);

// Get audit trail dashboard data
router.get('/dashboard', tempAuth, auditTrailController.getAuditTrailDashboard);

// Create a new audit trail entry
router.post('/', tempAuth, auditTrailController.createAuditEntry);

// Export audit trail to CSV
router.get('/export', tempAuth, auditTrailController.exportAuditTrail);

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Audit trail API is working',
    timestamp: new Date().toISOString()
  });
});

export default router;

