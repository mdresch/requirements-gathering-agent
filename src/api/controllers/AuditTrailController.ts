import { Request, Response } from 'express';
import { AuditTrailService, AuditTrailFilters } from '../../services/AuditTrailService.js';

export class AuditTrailController {
  private auditTrailService: AuditTrailService;

  constructor() {
    this.auditTrailService = new AuditTrailService();
  }

  /**
   * Get audit trail entries with filtering and pagination
   */
  public getAuditTrail = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        documentId,
        projectId,
        userId,
        action,
        category,
        severity,
        startDate,
        endDate,
        searchTerm,
        page = 1,
        limit = 50
      } = req.query;

      const filters: AuditTrailFilters = {
        documentId: documentId as string,
        projectId: projectId as string,
        userId: userId as string,
        action: action as string,
        category: category as string,
        severity: severity as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        searchTerm: searchTerm as string
      };

      const result = await this.auditTrailService.getAuditTrail(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.entries,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit trail'
      });
    }
  };

  /**
   * Get audit trail for a specific document
   */
  public getDocumentAuditTrail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        res.status(400).json({
          success: false,
          error: 'Document ID is required'
        });
        return;
      }

      const auditTrail = await this.auditTrailService.getDocumentAuditTrail(documentId);

      res.json({
        success: true,
        data: auditTrail
      });
    } catch (error) {
      console.error('Error fetching document audit trail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch document audit trail'
      });
    }
  };

  /**
   * Get audit trail for a specific project
   */
  public getProjectAuditTrail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const auditTrail = await this.auditTrailService.getProjectAuditTrail(projectId);

      res.json({
        success: true,
        data: auditTrail
      });
    } catch (error) {
      console.error('Error fetching project audit trail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project audit trail'
      });
    }
  };

  /**
   * Get audit trail statistics
   */
  public getAuditTrailStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        documentId,
        projectId,
        userId,
        startDate,
        endDate
      } = req.query;

      const filters: AuditTrailFilters = {
        documentId: documentId as string,
        projectId: projectId as string,
        userId: userId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const stats = await this.auditTrailService.getAuditTrailStats(filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching audit trail stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit trail stats'
      });
    }
  };

  /**
   * Create a new audit trail entry
   */
  public createAuditEntry = async (req: Request, res: Response): Promise<void> => {
    try {
      const auditEntryData = req.body;

      // Validate required fields
      if (!auditEntryData.documentId || !auditEntryData.documentName || !auditEntryData.action) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: documentId, documentName, action'
        });
        return;
      }

      // Provide default values for required fields that might be missing
      const enrichedData = {
        ...auditEntryData,
        actionDescription: auditEntryData.actionDescription || `Document "${auditEntryData.documentName}" was ${auditEntryData.action}`,
        projectName: auditEntryData.projectName || 'Default Project',
        documentType: auditEntryData.documentType || 'document',
        userId: auditEntryData.userId || 'system',
        userName: auditEntryData.userName || 'System User',
        userRole: auditEntryData.userRole || 'System',
        userEmail: auditEntryData.userEmail || 'system@company.com',
        severity: auditEntryData.severity || 'medium',
        category: auditEntryData.category || 'document',
        notes: auditEntryData.notes || `Action: ${auditEntryData.action}`,
        tags: auditEntryData.tags || [auditEntryData.action, 'audit'],
        contextData: auditEntryData.contextData || {}
      };

      const auditEntry = await this.auditTrailService.createAuditEntry(enrichedData);

      res.status(201).json({
        success: true,
        data: auditEntry
      });
    } catch (error) {
      console.error('Error creating audit entry:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create audit entry'
      });
    }
  };

  /**
   * Get audit trail export (CSV format)
   */
  public exportAuditTrail = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        documentId,
        projectId,
        userId,
        action,
        category,
        severity,
        startDate,
        endDate,
        searchTerm
      } = req.query;

      const filters: AuditTrailFilters = {
        documentId: documentId as string,
        projectId: projectId as string,
        userId: userId as string,
        action: action as string,
        category: category as string,
        severity: severity as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        searchTerm: searchTerm as string
      };

      // Get all entries (no pagination for export)
      const result = await this.auditTrailService.getAuditTrail(filters, 1, 10000);

      // Convert to CSV format
      const csvHeaders = [
        'Timestamp',
        'Document ID',
        'Document Name',
        'Document Type',
        'Project ID',
        'Project Name',
        'Action',
        'Action Description',
        'User ID',
        'User Name',
        'User Role',
        'Severity',
        'Category',
        'AI Provider',
        'AI Model',
        'Tokens Used',
        'Quality Score',
        'Generation Time',
        'Template Used',
        'Framework',
        'IP Address',
        'Notes'
      ];

      const csvRows = result.entries.map(entry => [
        entry.timestamp.toISOString(),
        entry.documentId,
        entry.documentName,
        entry.documentType,
        entry.projectId,
        entry.projectName,
        entry.action,
        entry.actionDescription,
        entry.userId || '',
        entry.userName || '',
        entry.userRole || '',
        entry.severity,
        entry.category,
        entry.contextData?.aiProvider || '',
        entry.contextData?.aiModel || '',
        entry.contextData?.tokensUsed || '',
        entry.contextData?.qualityScore || '',
        entry.contextData?.generationTime || '',
        entry.contextData?.templateUsed || '',
        entry.contextData?.framework || '',
        entry.ipAddress || '',
        entry.notes || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-trail-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting audit trail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export audit trail'
      });
    }
  };

  /**
   * Get audit trail dashboard data
   */
  public getAuditTrailDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.query;

      const filters: AuditTrailFilters = {
        projectId: projectId as string
      };

      const [stats, recentActivity] = await Promise.all([
        this.auditTrailService.getAuditTrailStats(filters),
        this.auditTrailService.getAuditTrail(filters, 1, 20)
      ]);

      res.json({
        success: true,
        data: {
          stats,
          recentActivity: recentActivity.entries
        }
      });
    } catch (error) {
      console.error('Error fetching audit trail dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit trail dashboard'
      });
    }
  };
}

export default AuditTrailController;

