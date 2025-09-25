// Simple Enhanced Audit Trail Routes - Basic implementation for testing
// Provides enhanced audit trail with mock data integration

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../../utils/logger.js';

const router = Router();

// Mock enhanced audit trail data
const mockEnhancedAuditEntries = [
  {
    _id: 'audit_001',
    documentId: 'doc_123',
    documentName: 'Requirements Specification v2.1',
    documentType: 'requirements',
    projectId: 'project_456',
    projectName: 'Customer Portal Enhancement',
    action: 'quality_assessed',
    actionDescription: 'Document quality assessed with compliance scoring',
    userId: 'user_789',
    userName: 'John Doe',
    userRole: 'Business Analyst',
    userEmail: 'john.doe@company.com',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    severity: 'medium',
    category: 'quality',
    notes: 'Compliance score improved from 82% to 87%',
    tags: ['compliance', 'quality', 'babok'],
    
    // Enhanced data
    complianceMetrics: {
      standardType: 'BABOK',
      score: 87,
      previousScore: 82,
      changePercentage: 6.1,
      trendDirection: 'IMPROVING'
    },
    
    dataQuality: {
      qualityScore: 89,
      completenessScore: 92,
      accuracyScore: 87,
      consistencyScore: 88,
      issuesFound: 2
    },
    
    realTimeContext: {
      sessionId: 'session_abc123',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: '192.168.1.100',
      component: 'DocumentEditor',
      action: 'quality_check',
      duration: 1250
    },
    
    workflowContext: {
      workflowId: 'workflow_001',
      workflowName: 'Quality Review Process',
      status: 'IN_PROGRESS',
      assignedTo: 'Jane Smith',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    }
  },
  {
    _id: 'audit_002',
    documentId: 'doc_124',
    documentName: 'Technical Architecture Document',
    documentType: 'architecture',
    projectId: 'project_456',
    projectName: 'Customer Portal Enhancement',
    action: 'created',
    actionDescription: 'New technical architecture document created',
    userId: 'user_790',
    userName: 'Sarah Wilson',
    userRole: 'Technical Architect',
    userEmail: 'sarah.wilson@company.com',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    severity: 'low',
    category: 'document',
    notes: 'Initial architecture document created based on requirements',
    tags: ['architecture', 'technical', 'pmbok'],
    
    complianceMetrics: {
      standardType: 'PMBOK',
      score: 94,
      previousScore: null,
      changePercentage: 0,
      trendDirection: 'STABLE'
    },
    
    dataQuality: {
      qualityScore: 91,
      completenessScore: 88,
      accuracyScore: 94,
      consistencyScore: 92,
      issuesFound: 1
    },
    
    realTimeContext: {
      sessionId: 'session_def456',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      ipAddress: '192.168.1.101',
      component: 'DocumentCreator',
      action: 'document_creation',
      duration: 3200
    }
  },
  {
    _id: 'audit_003',
    documentId: 'doc_125',
    documentName: 'Data Management Plan',
    documentType: 'data_plan',
    projectId: 'project_456',
    projectName: 'Customer Portal Enhancement',
    action: 'updated',
    actionDescription: 'Data management plan updated with new compliance requirements',
    userId: 'user_791',
    userName: 'Mike Johnson',
    userRole: 'Data Manager',
    userEmail: 'mike.johnson@company.com',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    severity: 'high',
    category: 'quality',
    notes: 'Critical compliance updates for data handling procedures',
    tags: ['data', 'compliance', 'dmbok', 'critical'],
    
    complianceMetrics: {
      standardType: 'DMBOK',
      score: 76,
      previousScore: 71,
      changePercentage: 7.0,
      trendDirection: 'IMPROVING'
    },
    
    dataQuality: {
      qualityScore: 83,
      completenessScore: 85,
      accuracyScore: 81,
      consistencyScore: 84,
      issuesFound: 4
    },
    
    alertContext: {
      alertId: 'alert_001',
      alertType: 'COMPLIANCE_ISSUE',
      severity: 'high',
      resolved: false
    }
  }
];

const mockAnalytics = {
  totalEntries: 3,
  entriesByCategory: {
    'document': 1,
    'quality': 2,
    'user': 0,
    'system': 0,
    'ai': 0
  },
  entriesBySeverity: {
    'low': 1,
    'medium': 1,
    'high': 1,
    'critical': 0
  },
  entriesByAction: {
    'created': 1,
    'updated': 1,
    'quality_assessed': 1
  },
  complianceScoreTrends: [
    {
      standardType: 'BABOK',
      currentScore: 87,
      previousScore: 82,
      changePercentage: 6.1,
      trendDirection: 'IMPROVING'
    },
    {
      standardType: 'PMBOK',
      currentScore: 94,
      previousScore: 0,
      changePercentage: 0,
      trendDirection: 'STABLE'
    },
    {
      standardType: 'DMBOK',
      currentScore: 76,
      previousScore: 71,
      changePercentage: 7.0,
      trendDirection: 'IMPROVING'
    }
  ],
  dataQualityTrends: [
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      overallScore: 85,
      completenessScore: 88,
      accuracyScore: 82,
      issuesFound: 5
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      overallScore: 87,
      completenessScore: 90,
      accuracyScore: 85,
      issuesFound: 3
    },
    {
      date: new Date(),
      overallScore: 89,
      completenessScore: 92,
      accuracyScore: 87,
      issuesFound: 2
    }
  ],
  userActivitySummary: [
    {
      userId: 'user_789',
      userName: 'John Doe',
      totalActions: 15,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      topActions: ['quality_assessed', 'viewed', 'updated'],
      complianceScore: 87
    },
    {
      userId: 'user_790',
      userName: 'Sarah Wilson',
      totalActions: 8,
      lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
      topActions: ['created', 'viewed'],
      complianceScore: 94
    },
    {
      userId: 'user_791',
      userName: 'Mike Johnson',
      totalActions: 12,
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
      topActions: ['updated', 'quality_assessed', 'viewed'],
      complianceScore: 76
    }
  ],
  systemHealth: {
    averageResponseTime: 245,
    errorRate: 0.8,
    activeUsers: 3,
    systemUptime: 99.9
  }
};

// GET /api/v1/audit-trail/simple
// Get simple audit trail entries (frontend compatibility)
router.get('/simple',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('documentId').optional().isString().withMessage('Document ID must be a string'),
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('userId').optional().isString().withMessage('User ID must be a string'),
    query('action').optional().isString().withMessage('Action must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('severity').optional().isString().withMessage('Severity must be a string'),
    query('searchTerm').optional().isString().withMessage('Search term must be a string')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        page = 1,
        limit = 50,
        documentId,
        projectId,
        userId,
        action,
        category,
        severity,
        searchTerm
      } = req.query;

      logger.info(`🔍 Simple audit trail requested with filters:`, {
        page, limit, documentId, projectId, userId, action, category, severity
      });

      // Apply filters to mock data
      let filteredEntries = [...mockEnhancedAuditEntries];

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
      
      if (searchTerm) {
        const searchLower = (searchTerm as string).toLowerCase();
        filteredEntries = filteredEntries.filter(entry => 
          entry.documentName.toLowerCase().includes(searchLower) ||
          entry.actionDescription.toLowerCase().includes(searchLower) ||
          entry.userName.toLowerCase().includes(searchLower) ||
          entry.notes?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const paginatedEntries = filteredEntries.slice(skip, skip + parseInt(limit as string));
      const total = filteredEntries.length;
      const pages = Math.ceil(total / parseInt(limit as string));

      res.json({
        success: true,
        message: 'Simple audit trail retrieved successfully',
        data: {
          entries: paginatedEntries,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages
          }
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching simple audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching simple audit trail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/v1/audit-trail/simple/analytics
// Get simple audit trail analytics (frontend compatibility)
router.get('/simple/analytics',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { projectId } = req.query;

      logger.info(`📊 Simple audit analytics requested for project: ${projectId}`);

      res.json({
        success: true,
        message: 'Simple audit analytics retrieved successfully',
        data: mockAnalytics
      });

    } catch (error) {
      logger.error('❌ Error fetching simple audit analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching simple audit analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/v1/audit-trail/simple-enhanced
// Get enhanced audit trail entries with mock integrated data
router.get('/simple-enhanced',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('documentId').optional().isString().withMessage('Document ID must be a string'),
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('userId').optional().isString().withMessage('User ID must be a string'),
    query('action').optional().isString().withMessage('Action must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('severity').optional().isString().withMessage('Severity must be a string'),
    query('searchTerm').optional().isString().withMessage('Search term must be a string')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        page = 1,
        limit = 50,
        documentId,
        projectId,
        userId,
        action,
        category,
        severity,
        searchTerm
      } = req.query;

      logger.info(`🔍 Simple enhanced audit trail requested with filters:`, {
        page, limit, documentId, projectId, userId, action, category, severity
      });

      // Apply filters to mock data
      let filteredEntries = [...mockEnhancedAuditEntries];

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
      
      if (searchTerm) {
        const searchLower = (searchTerm as string).toLowerCase();
        filteredEntries = filteredEntries.filter(entry => 
          entry.documentName.toLowerCase().includes(searchLower) ||
          entry.actionDescription.toLowerCase().includes(searchLower) ||
          entry.userName.toLowerCase().includes(searchLower) ||
          entry.notes?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const paginatedEntries = filteredEntries.slice(skip, skip + parseInt(limit as string));
      const total = filteredEntries.length;
      const pages = Math.ceil(total / parseInt(limit as string));

      res.json({
        success: true,
        message: 'Simple enhanced audit trail retrieved successfully',
        data: {
          entries: paginatedEntries,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages
          },
          analytics: mockAnalytics
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching simple enhanced audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching simple enhanced audit trail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/v1/audit-trail/simple-enhanced/analytics
// Get comprehensive audit trail analytics
router.get('/simple-enhanced/analytics',
  [
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { projectId } = req.query;

      logger.info(`📊 Simple enhanced audit analytics requested for project: ${projectId}`);

      res.json({
        success: true,
        message: 'Simple enhanced audit analytics retrieved successfully',
        data: mockAnalytics
      });

    } catch (error) {
      logger.error('❌ Error fetching simple enhanced audit analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching simple enhanced audit analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/v1/audit-trail/simple-enhanced/compliance/:projectId
// Get compliance-focused audit trail for a specific project
router.get('/simple-enhanced/compliance/:projectId',
  [
    param('projectId').isString().withMessage('Project ID is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { projectId } = req.params;

      logger.info(`🎯 Simple compliance audit trail requested for project: ${projectId}`);

      // Filter to only include compliance-related entries
      const complianceEntries = mockEnhancedAuditEntries.filter(entry => 
        entry.projectId === projectId && (
          entry.category === 'quality' || 
          entry.action.includes('compliance') ||
          entry.action.includes('quality') ||
          entry.complianceMetrics ||
          entry.dataQuality
        )
      );

      res.json({
        success: true,
        message: 'Simple compliance audit trail retrieved successfully',
        data: {
          entries: complianceEntries,
          analytics: mockAnalytics,
          complianceSummary: {
            totalComplianceEvents: complianceEntries.length,
            averageComplianceScore: complianceEntries.reduce((sum, entry) => 
              sum + (entry.complianceMetrics?.score || 0), 0) / complianceEntries.length || 0,
            qualityTrends: mockAnalytics.dataQualityTrends
          }
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching simple compliance audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching simple compliance audit trail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/v1/audit-trail/simple-enhanced/export
// Export enhanced audit trail data in various formats
router.get('/simple-enhanced/export',
  [
    query('format').isIn(['json', 'csv']).withMessage('Format must be json or csv'),
    query('projectId').optional().isString().withMessage('Project ID must be a string')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { format, projectId } = req.query;

      logger.info(`📤 Exporting simple enhanced audit trail in ${format} format`);

      let entries = mockEnhancedAuditEntries;
      if (projectId) {
        entries = entries.filter(entry => entry.projectId === projectId);
      }

      let exportData: string;
      let contentType: string;
      let filename: string;

      switch (format) {
        case 'json':
          exportData = JSON.stringify({
            entries,
            analytics: mockAnalytics,
            exportedAt: new Date().toISOString()
          }, null, 2);
          contentType = 'application/json';
          filename = `audit-trail-${Date.now()}.json`;
          break;

        case 'csv':
          // Convert to CSV format
          const csvHeaders = [
            'Timestamp', 'Document Name', 'Action', 'Category', 'Severity', 'User Name', 
            'Project Name', 'Compliance Score', 'Quality Score', 'Notes'
          ].join(',');
          
          const csvRows = entries.map(entry => [
            entry.timestamp.toISOString(),
            entry.documentName,
            entry.action,
            entry.category,
            entry.severity,
            entry.userName,
            entry.projectName,
            entry.complianceMetrics?.score || 'N/A',
            entry.dataQuality?.qualityScore || 'N/A',
            entry.notes || ''
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
          
          exportData = [csvHeaders, ...csvRows].join('\n');
          contentType = 'text/csv';
          filename = `audit-trail-${Date.now()}.csv`;
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);

    } catch (error) {
      logger.error('❌ Error exporting simple enhanced audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting simple enhanced audit trail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
