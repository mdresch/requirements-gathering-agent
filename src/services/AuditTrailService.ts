import { DocumentAuditTrail, IDocumentAuditTrail } from '../models/DocumentAuditTrail.model';

export interface AuditTrailEntry {
  documentId: string;
  documentName: string;
  documentType: string;
  projectId: string;
  projectName: string;
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'downloaded' | 'shared' | 'feedback_submitted' | 'quality_assessed' | 'status_changed' | 'regenerated';
  actionDescription: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  contextData?: {
    aiProvider?: string;
    aiModel?: string;
    tokensUsed?: number;
    qualityScore?: number;
    generationTime?: number;
    templateUsed?: string;
    framework?: string;
    dependencies?: string[];
    optimizationStrategy?: string;
    contextUtilization?: number;
  };
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'document' | 'quality' | 'user' | 'system' | 'ai';
  notes?: string;
  tags?: string[];
  relatedDocumentIds?: string[];
}

export interface AuditTrailFilters {
  documentId?: string;
  projectId?: string;
  userId?: string;
  action?: string;
  category?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export interface AuditTrailStats {
  totalEntries: number;
  entriesByAction: Record<string, number>;
  entriesByCategory: Record<string, number>;
  entriesBySeverity: Record<string, number>;
  entriesByUser: Record<string, number>;
  entriesByDay: Record<string, number>;
  averageQualityScore?: number;
  totalTokensUsed?: number;
  mostActiveUsers: Array<{ userName: string; count: number }>;
  recentActivity: IDocumentAuditTrail[];
}

export class AuditTrailService {
  
  /**
   * Create a new audit trail entry
   */
  public async createAuditEntry(entryData: AuditTrailEntry): Promise<IDocumentAuditTrail> {
    try {
      const auditEntry = new DocumentAuditTrail({
        ...entryData,
        timestamp: new Date()
      });
      
      const savedEntry = await auditEntry.save();
      console.log(`📝 Audit trail entry created: ${entryData.action} for ${entryData.documentName}`);
      return savedEntry;
    } catch (error) {
      console.error('Error creating audit trail entry:', error);
      throw new Error('Failed to create audit trail entry');
    }
  }

  /**
   * Get audit trail entries with filtering and pagination
   */
  public async getAuditTrail(
    filters: AuditTrailFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ entries: IDocumentAuditTrail[]; total: number; pages: number }> {
    try {
      const query: any = {};
      
      // Apply filters
      if (filters.documentId) query.documentId = filters.documentId;
      if (filters.projectId) query.projectId = filters.projectId;
      if (filters.userId) query.userId = filters.userId;
      if (filters.action) query.action = filters.action;
      if (filters.category) query.category = filters.category;
      if (filters.severity) query.severity = filters.severity;
      
      // Date range filter
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }
      
      // Search filter
      if (filters.searchTerm) {
        query.$or = [
          { documentName: { $regex: filters.searchTerm, $options: 'i' } },
          { actionDescription: { $regex: filters.searchTerm, $options: 'i' } },
          { userName: { $regex: filters.searchTerm, $options: 'i' } },
          { notes: { $regex: filters.searchTerm, $options: 'i' } }
        ];
      }
      
      const skip = (page - 1) * limit;
      
      const [entries, total] = await Promise.all([
        DocumentAuditTrail.find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        DocumentAuditTrail.countDocuments(query)
      ]);
      
      const pages = Math.ceil(total / limit);
      
      return { entries, total, pages };
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw new Error('Failed to fetch audit trail');
    }
  }

  /**
   * Get audit trail for a specific document
   */
  public async getDocumentAuditTrail(documentId: string): Promise<IDocumentAuditTrail[]> {
    try {
      const entries = await DocumentAuditTrail.find({ documentId })
        .sort({ timestamp: -1 })
        .lean();
      
      return entries;
    } catch (error) {
      console.error('Error fetching document audit trail:', error);
      throw new Error('Failed to fetch document audit trail');
    }
  }

  /**
   * Get audit trail for a specific project
   */
  public async getProjectAuditTrail(projectId: string): Promise<IDocumentAuditTrail[]> {
    try {
      const entries = await DocumentAuditTrail.find({ projectId })
        .sort({ timestamp: -1 })
        .lean();
      
      return entries;
    } catch (error) {
      console.error('Error fetching project audit trail:', error);
      throw new Error('Failed to fetch project audit trail');
    }
  }

  /**
   * Get audit trail statistics
   */
  public async getAuditTrailStats(filters: AuditTrailFilters = {}): Promise<AuditTrailStats> {
    try {
      const query: any = {};
      
      // Apply basic filters
      if (filters.documentId) query.documentId = filters.documentId;
      if (filters.projectId) query.projectId = filters.projectId;
      if (filters.userId) query.userId = filters.userId;
      
      // Date range filter
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }
      
      const [
        totalEntries,
        entriesByAction,
        entriesByCategory,
        entriesBySeverity,
        entriesByUser,
        entriesByDay,
        qualityScores,
        tokensUsed,
        recentActivity
      ] = await Promise.all([
        // Total entries
        DocumentAuditTrail.countDocuments(query),
        
        // Entries by action
        DocumentAuditTrail.aggregate([
          { $match: query },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Entries by category
        DocumentAuditTrail.aggregate([
          { $match: query },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Entries by severity
        DocumentAuditTrail.aggregate([
          { $match: query },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Entries by user
        DocumentAuditTrail.aggregate([
          { $match: { ...query, userName: { $exists: true } } },
          { $group: { _id: '$userName', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        
        // Entries by day (last 30 days)
        DocumentAuditTrail.aggregate([
          { 
            $match: { 
              ...query, 
              timestamp: { 
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
              } 
            } 
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp'
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        
        // Quality scores
        DocumentAuditTrail.aggregate([
          { 
            $match: { 
              ...query, 
              'contextData.qualityScore': { $exists: true } 
            } 
          },
          { $group: { _id: null, avgQuality: { $avg: '$contextData.qualityScore' } } }
        ]),
        
        // Tokens used
        DocumentAuditTrail.aggregate([
          { 
            $match: { 
              ...query, 
              'contextData.tokensUsed': { $exists: true } 
            } 
          },
          { $group: { _id: null, totalTokens: { $sum: '$contextData.tokensUsed' } } }
        ]),
        
        // Recent activity
        DocumentAuditTrail.find(query)
          .sort({ timestamp: -1 })
          .limit(10)
          .lean()
      ]);
      
      // Process aggregation results
      const processAggregation = (results: any[]) => {
        const processed: Record<string, number> = {};
        results.forEach(result => {
          processed[result._id] = result.count;
        });
        return processed;
      };
      
      // Process entries by day
      const processEntriesByDay = (results: any[]) => {
        const processed: Record<string, number> = {};
        results.forEach(result => {
          processed[result._id] = result.count;
        });
        return processed;
      };
      
      return {
        totalEntries,
        entriesByAction: processAggregation(entriesByAction),
        entriesByCategory: processAggregation(entriesByCategory),
        entriesBySeverity: processAggregation(entriesBySeverity),
        entriesByUser: processAggregation(entriesByUser),
        entriesByDay: processEntriesByDay(entriesByDay),
        averageQualityScore: qualityScores.length > 0 ? qualityScores[0].avgQuality : undefined,
        totalTokensUsed: tokensUsed.length > 0 ? tokensUsed[0].totalTokens : undefined,
        mostActiveUsers: entriesByUser.map(user => ({
          userName: user._id,
          count: user.count
        })),
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching audit trail stats:', error);
      throw new Error('Failed to fetch audit trail stats');
    }
  }

  /**
   * Create audit entry for document creation
   */
  public async logDocumentCreation(
    documentId: string,
    documentName: string,
    documentType: string,
    projectId: string,
    projectName: string,
    contextData?: AuditTrailEntry['contextData'],
    userId?: string,
    userName?: string,
    userRole?: string
  ): Promise<IDocumentAuditTrail> {
    return this.createAuditEntry({
      documentId,
      documentName,
      documentType,
      projectId,
      projectName,
      action: 'created',
      actionDescription: `Document "${documentName}" was created`,
      userId,
      userName,
      userRole,
      contextData,
      severity: 'medium',
      category: 'document',
      tags: ['document-creation', 'ai-generated']
    });
  }

  /**
   * Create audit entry for document update
   */
  public async logDocumentUpdate(
    documentId: string,
    documentName: string,
    documentType: string,
    projectId: string,
    projectName: string,
    previousValues: Record<string, any>,
    newValues: Record<string, any>,
    changedFields: string[],
    userId?: string,
    userName?: string,
    userRole?: string
  ): Promise<IDocumentAuditTrail> {
    return this.createAuditEntry({
      documentId,
      documentName,
      documentType,
      projectId,
      projectName,
      action: 'updated',
      actionDescription: `Document "${documentName}" was updated. Fields changed: ${changedFields.join(', ')}`,
      userId,
      userName,
      userRole,
      previousValues,
      newValues,
      changedFields,
      severity: 'low',
      category: 'document',
      tags: ['document-update']
    });
  }

  /**
   * Create audit entry for document view
   */
  public async logDocumentView(
    documentId: string,
    documentName: string,
    documentType: string,
    projectId: string,
    projectName: string,
    userId?: string,
    userName?: string,
    userRole?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IDocumentAuditTrail> {
    return this.createAuditEntry({
      documentId,
      documentName,
      documentType,
      projectId,
      projectName,
      action: 'viewed',
      actionDescription: `Document "${documentName}" was viewed`,
      userId,
      userName,
      userRole,
      ipAddress,
      userAgent,
      severity: 'low',
      category: 'user',
      tags: ['document-view']
    });
  }

  /**
   * Create audit entry for document download
   */
  public async logDocumentDownload(
    documentId: string,
    documentName: string,
    documentType: string,
    projectId: string,
    projectName: string,
    userId?: string,
    userName?: string,
    userRole?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IDocumentAuditTrail> {
    return this.createAuditEntry({
      documentId,
      documentName,
      documentType,
      projectId,
      projectName,
      action: 'downloaded',
      actionDescription: `Document "${documentName}" was downloaded`,
      userId,
      userName,
      userRole,
      ipAddress,
      userAgent,
      severity: 'medium',
      category: 'user',
      tags: ['document-download']
    });
  }

  /**
   * Create audit entry for quality assessment
   */
  public async logQualityAssessment(
    documentId: string,
    documentName: string,
    documentType: string,
    projectId: string,
    projectName: string,
    qualityScore: number,
    contextData?: AuditTrailEntry['contextData'],
    userId?: string,
    userName?: string,
    userRole?: string
  ): Promise<IDocumentAuditTrail> {
    return this.createAuditEntry({
      documentId,
      documentName,
      documentType,
      projectId,
      projectName,
      action: 'quality_assessed',
      actionDescription: `Quality assessment completed for "${documentName}". Score: ${qualityScore}%`,
      userId,
      userName,
      userRole,
      contextData: {
        ...contextData,
        qualityScore
      },
      severity: 'medium',
      category: 'quality',
      tags: ['quality-assessment', 'ai-generated']
    });
  }

  /**
   * Create audit entry for AI document generation
   */
  public async logAIDocumentGeneration(
    documentId: string,
    documentName: string,
    documentType: string,
    projectId: string,
    projectName: string,
    aiProvider: string,
    aiModel: string,
    tokensUsed: number,
    qualityScore: number,
    generationTime: number,
    templateUsed: string,
    framework: string,
    optimizationStrategy: string,
    userId?: string,
    userName?: string,
    userRole?: string
  ): Promise<IDocumentAuditTrail> {
    return this.createAuditEntry({
      documentId,
      documentName,
      documentType,
      projectId,
      projectName,
      action: 'created',
      actionDescription: `Document "${documentName}" was generated using AI (${aiProvider}/${aiModel})`,
      userId,
      userName,
      userRole,
      contextData: {
        aiProvider,
        aiModel,
        tokensUsed,
        qualityScore,
        generationTime,
        templateUsed,
        framework,
        optimizationStrategy
      },
      severity: 'high',
      category: 'ai',
      tags: ['ai-generation', 'document-creation', 'context-optimization'],
      notes: `Generated with ${optimizationStrategy} strategy using ${tokensUsed} tokens`
    });
  }
}

export default AuditTrailService;

