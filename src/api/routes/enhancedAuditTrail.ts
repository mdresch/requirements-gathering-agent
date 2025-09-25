// Enhanced Audit Trail Routes - Integrates multiple data sources
// Provides comprehensive audit trail with compliance, quality, and activity data

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../../utils/logger.js';
import { EnhancedAuditTrailService } from '../../services/EnhancedAuditTrailService.js';

const router = Router();
const enhancedAuditTrailService = new EnhancedAuditTrailService();

// GET /api/v1/audit-trail/enhanced
// Get enhanced audit trail entries with integrated data from multiple sources
router.get('/enhanced',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('documentId').optional().isString().withMessage('Document ID must be a string'),
    query('projectId').optional().isString().withMessage('Project ID must be a string'),
    query('userId').optional().isString().withMessage('User ID must be a string'),
    query('action').optional().isString().withMessage('Action must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('severity').optional().isString().withMessage('Severity must be a string'),
    query('standardType').optional().isString().withMessage('Standard type must be a string'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    query('searchTerm').optional().isString().withMessage('Search term must be a string'),
    query('includeCompliance').optional().isBoolean().withMessage('Include compliance must be a boolean'),
    query('includeQuality').optional().isBoolean().withMessage('Include quality must be a boolean'),
    query('includeRealTime').optional().isBoolean().withMessage('Include real-time must be a boolean'),
    query('includeWorkflows').optional().isBoolean().withMessage('Include workflows must be a boolean'),
    query('includeAlerts').optional().isBoolean().withMessage('Include alerts must be a boolean')
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
        standardType,
        startDate,
        endDate,
        searchTerm,
        includeCompliance,
        includeQuality,
        includeRealTime,
        includeWorkflows,
        includeAlerts
      } = req.query;

      logger.info(`🔍 Enhanced audit trail requested with filters:`, {
        page, limit, documentId, projectId, userId, action, category, severity, standardType
      });

      const filters = {
        documentId: documentId as string,
        projectId: projectId as string,
        userId: userId as string,
        action: action as string,
        category: category as string,
        severity: severity as string,
        standardType: standardType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        searchTerm: searchTerm as string,
        includeCompliance: includeCompliance === 'true',
        includeQuality: includeQuality === 'true',
        includeRealTime: includeRealTime === 'true',
        includeWorkflows: includeWorkflows === 'true',
        includeAlerts: includeAlerts === 'true'
      };

      const result = await enhancedAuditTrailService.getEnhancedAuditTrail(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Enhanced audit trail retrieved successfully',
        data: {
          entries: result.entries,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: result.total,
            pages: result.pages
          },
          analytics: result.analytics
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching enhanced audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching enhanced audit trail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/v1/audit-trail/enhanced/analytics
// Get comprehensive audit trail analytics
router.get('/enhanced/analytics',
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

      const { projectId, startDate, endDate } = req.query;

      logger.info(`📊 Enhanced audit analytics requested for project: ${projectId}`);

      const filters = {
        projectId: projectId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const result = await enhancedAuditTrailService.getEnhancedAuditTrail(filters, 1, 1);
      const analytics = result.analytics;

      res.json({
        success: true,
        message: 'Enhanced audit analytics retrieved successfully',
        data: analytics
      });

    } catch (error) {
      logger.error('❌ Error fetching enhanced audit analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching enhanced audit analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/v1/audit-trail/enhanced/compliance/:projectId
// Get compliance-focused audit trail for a specific project
router.get('/enhanced/compliance/:projectId',
  [
    param('projectId').isString().withMessage('Project ID is required'),
    query('standardType').optional().isString().withMessage('Standard type must be a string'),
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

      const { projectId } = req.params;
      const { standardType, startDate, endDate } = req.query;

      logger.info(`🎯 Compliance audit trail requested for project: ${projectId}`);

      const filters = {
        projectId,
        standardType: standardType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeCompliance: true,
        includeQuality: true,
        includeWorkflows: true,
        includeAlerts: true
      };

      const result = await enhancedAuditTrailService.getEnhancedAuditTrail(filters, 1, 100);

      // Filter to only include compliance-related entries
      const complianceEntries = result.entries.filter(entry => 
        entry.category === 'quality' || 
        entry.action.includes('compliance') ||
        entry.action.includes('quality') ||
        entry.complianceMetrics ||
        entry.dataQuality
      );

      res.json({
        success: true,
        message: 'Compliance audit trail retrieved successfully',
        data: {
          entries: complianceEntries,
          analytics: result.analytics,
          complianceSummary: {
            totalComplianceEvents: complianceEntries.length,
            averageComplianceScore: result.analytics.complianceScoreTrends.reduce((sum, trend) => sum + trend.currentScore, 0) / result.analytics.complianceScoreTrends.length || 0,
            qualityTrends: result.analytics.dataQualityTrends
          }
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching compliance audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching compliance audit trail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/v1/audit-trail/enhanced/user/:userId
// Get user-focused audit trail for a specific user
router.get('/enhanced/user/:userId',
  [
    param('userId').isString().withMessage('User ID is required'),
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

      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      logger.info(`👤 User audit trail requested for user: ${userId}`);

      const filters = {
        userId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeRealTime: true,
        includeCompliance: true,
        includeQuality: true
      };

      const result = await enhancedAuditTrailService.getEnhancedAuditTrail(filters, 1, 100);

      res.json({
        success: true,
        message: 'User audit trail retrieved successfully',
        data: {
          entries: result.entries,
          analytics: result.analytics,
          userSummary: {
            userId,
            totalActions: result.entries.length,
            lastActivity: result.entries[0]?.timestamp,
            topActions: result.analytics.entriesByAction,
            complianceScore: result.analytics.userActivitySummary.find(u => u.userId === userId)?.complianceScore || 0
          }
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching user audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user audit trail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// POST /api/v1/audit-trail/enhanced
// Create a new enhanced audit trail entry
router.post('/enhanced',
  [
    body('documentId').isString().withMessage('Document ID is required'),
    body('documentName').isString().withMessage('Document name is required'),
    body('documentType').isString().withMessage('Document type is required'),
    body('projectId').isString().withMessage('Project ID is required'),
    body('projectName').isString().withMessage('Project name is required'),
    body('action').isString().withMessage('Action is required'),
    body('actionDescription').isString().withMessage('Action description is required'),
    body('category').isIn(['document', 'quality', 'user', 'system', 'ai']).withMessage('Invalid category'),
    body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
    body('userId').optional().isString().withMessage('User ID must be a string'),
    body('userName').optional().isString().withMessage('User name must be a string'),
    body('userRole').optional().isString().withMessage('User role must be a string'),
    body('userEmail').optional().isEmail().withMessage('User email must be a valid email'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('relatedDocumentIds').optional().isArray().withMessage('Related document IDs must be an array')
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

      const auditData = req.body;
      logger.info(`📝 Creating enhanced audit entry for document: ${auditData.documentName}`);

      const auditEntry = await enhancedAuditTrailService.createEnhancedAuditEntry(auditData);

      res.status(201).json({
        success: true,
        message: 'Enhanced audit entry created successfully',
        data: auditEntry
      });

    } catch (error) {
      logger.error('❌ Error creating enhanced audit entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating enhanced audit entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/v1/audit-trail/enhanced/export
// Export enhanced audit trail data in various formats
router.get('/enhanced/export',
  [
    query('format').isIn(['json', 'csv', 'xlsx']).withMessage('Format must be json, csv, or xlsx'),
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

      const { format, projectId, startDate, endDate } = req.query;

      logger.info(`📤 Exporting enhanced audit trail in ${format} format`);

      const filters = {
        projectId: projectId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      // Get all entries for export (no pagination)
      const result = await enhancedAuditTrailService.getEnhancedAuditTrail(filters, 1, 10000);

      let exportData: string | Buffer;
      let contentType: string;
      let filename: string;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(result.entries, null, 2);
          contentType = 'application/json';
          filename = `audit-trail-${Date.now()}.json`;
          break;

        case 'csv':
          // Convert to CSV format
          const csvHeaders = [
            'Timestamp', 'Document Name', 'Action', 'Category', 'Severity', 'User Name', 
            'Project Name', 'Compliance Score', 'Quality Score', 'Notes'
          ].join(',');
          
          const csvRows = result.entries.map(entry => [
            entry.timestamp,
            entry.documentName,
            entry.action,
            entry.category,
            entry.severity,
            entry.userName || 'System',
            entry.projectName,
            entry.complianceMetrics?.score || 'N/A',
            entry.dataQuality?.qualityScore || 'N/A',
            entry.notes || ''
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
          
          exportData = [csvHeaders, ...csvRows].join('\n');
          contentType = 'text/csv';
          filename = `audit-trail-${Date.now()}.csv`;
          break;

        case 'xlsx':
          // For Excel format, we'll return JSON for now (would need xlsx library for full implementation)
          exportData = JSON.stringify({
            entries: result.entries,
            analytics: result.analytics,
            exportedAt: new Date().toISOString()
          }, null, 2);
          contentType = 'application/json';
          filename = `audit-trail-${Date.now()}.json`;
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);

    } catch (error) {
      logger.error('❌ Error exporting enhanced audit trail:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting enhanced audit trail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
