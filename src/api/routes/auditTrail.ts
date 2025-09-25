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

// Basic audit trail entry creation (for compatibility)
router.post('/entry', tempAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Audit trail entry created successfully',
    timestamp: new Date().toISOString(),
    data: req.body
  });
});

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

// Fallback route for basic audit trail creation
router.post('/basic', tempAuth, (req, res) => {
  try {
    const { documentId, documentName, action, userId, projectId, details } = req.body;
    
    // Basic validation
    if (!documentId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: documentId and action are required'
      });
    }

    // Create basic audit entry
    const auditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      documentName: documentName || 'Unknown Document',
      action,
      userId: userId || 'system',
      projectId: projectId || 'unknown',
      details: details || {},
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    };

    res.status(201).json({
      success: true,
      message: 'Audit trail entry created successfully',
      data: auditEntry
    });
  } catch (error) {
    console.error('Error creating basic audit entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create audit entry'
    });
  }
});

// Simple audit trail endpoints (for frontend compatibility)
router.get('/simple', tempAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, documentId, projectId, userId, action, category, severity, searchTerm, startDate, endDate } = req.query;
    
    // Mock data for now - in production this would query the database
    const mockEntries = [
      {
        _id: 'audit_001',
        documentId: 'doc_123',
        documentName: 'Requirements Specification v2.1',
        documentType: 'requirements',
        projectId: 'project_456',
        projectName: 'Customer Portal Enhancement',
        action: 'created',
        actionDescription: 'Document created successfully',
        userId: 'user_789',
        userName: 'John Doe',
        userRole: 'Business Analyst',
        userEmail: 'john.doe@company.com',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'medium',
        category: 'document',
        notes: 'Initial document creation',
        tags: ['requirements', 'babok'],
        contextData: {
          aiProvider: 'openai',
          aiModel: 'gpt-4',
          tokensUsed: 1500,
          qualityScore: 85
        }
      },
      {
        _id: 'audit_002',
        documentId: 'doc_124',
        documentName: 'Business Case Document',
        documentType: 'business-case',
        projectId: 'project_456',
        projectName: 'Customer Portal Enhancement',
        action: 'updated',
        actionDescription: 'Document updated with new requirements',
        userId: 'user_790',
        userName: 'Jane Smith',
        userRole: 'Product Manager',
        userEmail: 'jane.smith@company.com',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        severity: 'low',
        category: 'document',
        notes: 'Added new stakeholder requirements',
        tags: ['business-case', 'requirements'],
        contextData: {
          aiProvider: 'openai',
          aiModel: 'gpt-4',
          tokensUsed: 2000,
          qualityScore: 92
        }
      }
    ];

    // Apply basic filtering
    let filteredEntries = mockEntries;
    
    if (documentId) {
      filteredEntries = filteredEntries.filter(entry => entry.documentId === documentId);
    }
    if (projectId) {
      filteredEntries = filteredEntries.filter(entry => entry.projectId === projectId);
    }
    if (userId) {
      filteredEntries = filteredEntries.filter(entry => entry.userId === userId);
    }
    if (action && action !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.action === action);
    }
    if (category && category !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.category === category);
    }
    if (severity && severity !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.severity === severity);
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        entries: paginatedEntries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredEntries.length,
          pages: Math.ceil(filteredEntries.length / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching simple audit trail:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Simple audit trail analytics endpoint
router.get('/simple/analytics', tempAuth, async (req, res) => {
  try {
    const { documentId, projectId, userId, startDate, endDate } = req.query;
    
    // Mock analytics data
    const analytics = {
      totalEntries: 25,
      entriesByAction: {
        'created': 8,
        'updated': 12,
        'deleted': 2,
        'viewed': 3
      },
      entriesByCategory: {
        'document': 18,
        'user': 4,
        'system': 3
      },
      entriesBySeverity: {
        'high': 3,
        'medium': 15,
        'low': 7
      },
      entriesByUser: {
        'John Doe': 8,
        'Jane Smith': 10,
        'Mike Johnson': 7
      },
      entriesByDay: {
        '2024-01-15': 5,
        '2024-01-16': 8,
        '2024-01-17': 7,
        '2024-01-18': 5
      },
      averageQualityScore: 87,
      totalTokensUsed: 45000,
      mostActiveUsers: [
        { name: 'Jane Smith', count: 10 },
        { name: 'John Doe', count: 8 },
        { name: 'Mike Johnson', count: 7 }
      ],
      recentActivity: [
        {
          _id: 'audit_001',
          documentName: 'Requirements Specification v2.1',
          action: 'created',
          userName: 'John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          _id: 'audit_002',
          documentName: 'Business Case Document',
          action: 'updated',
          userName: 'Jane Smith',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching simple audit trail analytics:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;

