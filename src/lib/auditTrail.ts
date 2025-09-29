/**
 * Audit Trail Utility
 * Centralized service for creating audit trail entries from the frontend
 */

export interface AuditTrailEntry {
  documentId?: string;
  documentName?: string;
  documentType?: string;
  projectId?: string;
  projectName?: string;
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'downloaded' | 'shared' | 'feedback_submitted' | 'quality_assessed' | 'status_changed' | 'regenerated';
  actionDescription: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  contextData?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'document' | 'quality' | 'user' | 'system' | 'ai';
  notes?: string;
  tags?: string[];
}

class AuditTrailService {
  private baseUrl = typeof window !== 'undefined'
    ? (process.env.NODE_ENV === 'development' ? 'http://localhost:3002/api/v1/audit-trail' : '/api/v1/audit-trail')
    : 'http://localhost:3002/api/v1/audit-trail';

  /**
   * Create an audit trail entry
   */
  async createEntry(entry: AuditTrailEntry): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          // Add default values
          userId: entry.userId || 'frontend-user',
          userName: entry.userName || 'Frontend User',
          userRole: entry.userRole || 'User',
          userEmail: entry.userEmail || 'user@company.com',
          severity: entry.severity || 'medium',
          category: entry.category || 'document',
          tags: entry.tags || [entry.action],
          contextData: {
            ...entry.contextData,
            source: 'frontend',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        return true;
      } else {
        console.error('❌ Failed to create audit trail entry:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error creating audit trail entry:', error);
      return false;
    }
  }

  /**
   * Log document creation
   */
  async logDocumentCreated(documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
    contextData?: Record<string, any>;
  }): Promise<boolean> {
    return this.createEntry({
      ...documentData,
      action: 'created',
      actionDescription: `Document "${documentData.documentName}" was created`,
      severity: 'high',
      category: 'document',
      tags: ['document-creation', documentData.documentType]
    });
  }

  /**
   * Log document update
   */
  async logDocumentUpdated(documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changedFields?: string[];
  }): Promise<boolean> {
    return this.createEntry({
      ...documentData,
      action: 'updated',
      actionDescription: `Document "${documentData.documentName}" was updated`,
      severity: 'medium',
      category: 'document',
      tags: ['document-update', documentData.documentType],
      previousValues: documentData.previousValues,
      newValues: documentData.newValues,
      changedFields: documentData.changedFields
    });
  }

  /**
   * Log document deletion
   */
  async logDocumentDeleted(documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
  }): Promise<boolean> {
    return this.createEntry({
      ...documentData,
      action: 'deleted',
      actionDescription: `Document "${documentData.documentName}" was deleted`,
      severity: 'high',
      category: 'document',
      tags: ['document-deletion', documentData.documentType]
    });
  }

  /**
   * Log document view
   */
  async logDocumentViewed(documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
  }): Promise<boolean> {
    return this.createEntry({
      ...documentData,
      action: 'viewed',
      actionDescription: `Document "${documentData.documentName}" was viewed`,
      severity: 'low',
      category: 'document',
      tags: ['document-view', documentData.documentType]
    });
  }

  /**
   * Log document download
   */
  async logDocumentDownloaded(documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
    format?: string;
  }): Promise<boolean> {
    return this.createEntry({
      ...documentData,
      action: 'downloaded',
      actionDescription: `Document "${documentData.documentName}" was downloaded${documentData.format ? ` in ${documentData.format} format` : ''}`,
      severity: 'medium',
      category: 'document',
      tags: ['document-download', documentData.documentType],
      contextData: {
        downloadFormat: documentData.format
      }
    });
  }

  /**
   * Log AI document generation
   */
  async logAIDocumentGenerated(documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
    aiProvider: string;
    aiModel: string;
    tokensUsed?: number;
    qualityScore?: number;
    generationTime?: number;
  }): Promise<boolean> {
    return this.createEntry({
      ...documentData,
      action: 'created',
      actionDescription: `Document "${documentData.documentName}" was generated using AI (${documentData.aiProvider}/${documentData.aiModel})`,
      severity: 'high',
      category: 'ai',
      tags: ['ai-generation', 'document-creation', documentData.documentType],
      contextData: {
        aiProvider: documentData.aiProvider,
        aiModel: documentData.aiModel,
        tokensUsed: documentData.tokensUsed,
        qualityScore: documentData.qualityScore,
        generationTime: documentData.generationTime,
        framework: 'BABOK',
        optimizationStrategy: 'quality-first'
      }
    });
  }

  /**
   * Log project creation
   */
  async logProjectCreated(projectData: {
    projectId: string;
    projectName: string;
    description?: string;
    framework?: string;
    contextData?: Record<string, any>;
  }): Promise<boolean> {
    return this.createEntry({
      documentId: `project-${projectData.projectId}`, // Use project ID as document ID for project-level actions
      documentName: `Project: ${projectData.projectName}`, // Use project name as document name
      projectId: projectData.projectId,
      projectName: projectData.projectName,
      action: 'created',
      actionDescription: `Project "${projectData.projectName}" was created`,
      severity: 'high',
      category: 'system',
      tags: ['project-creation'],
      contextData: {
        ...projectData.contextData,
        description: projectData.description,
        framework: projectData.framework
      }
    });
  }

  /**
   * Log project changes
   */
  async logProjectUpdated(projectData: {
    projectId: string;
    projectName: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changedFields?: string[];
  }): Promise<boolean> {
    return this.createEntry({
      documentId: `project-${projectData.projectId}`, // Use project ID as document ID for project-level actions
      documentName: `Project: ${projectData.projectName}`, // Use project name as document name
      projectId: projectData.projectId,
      projectName: projectData.projectName,
      action: 'updated',
      actionDescription: `Project "${projectData.projectName}" was updated`,
      severity: 'medium',
      category: 'system',
      tags: ['project-update'],
      previousValues: projectData.previousValues,
      newValues: projectData.newValues,
      changedFields: projectData.changedFields
    });
  }

  /**
   * Log project deletion
   */
  async logProjectDeleted(projectData: {
    projectId: string;
    projectName: string;
  }): Promise<boolean> {
    return this.createEntry({
      documentId: `project-${projectData.projectId}`, // Use project ID as document ID for project-level actions
      documentName: `Project: ${projectData.projectName}`, // Use project name as document name
      projectId: projectData.projectId,
      projectName: projectData.projectName,
      action: 'deleted',
      actionDescription: `Project "${projectData.projectName}" was deleted`,
      severity: 'high',
      category: 'system',
      tags: ['project-deletion']
    });
  }

  /**
   * Log project view
   */
  async logProjectViewed(projectData: {
    projectId: string;
    projectName: string;
  }): Promise<boolean> {
    return this.createEntry({
      documentId: `project-${projectData.projectId}`, // Use project ID as document ID for project-level actions
      documentName: `Project: ${projectData.projectName}`, // Use project name as document name
      projectId: projectData.projectId,
      projectName: projectData.projectName,
      action: 'viewed',
      actionDescription: `Project "${projectData.projectName}" was viewed`,
      severity: 'low',
      category: 'system',
      tags: ['project-view']
    });
  }

  /**
   * Log template creation
   */
  async logTemplateCreated(templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
    category?: string;
    contextData?: Record<string, any>;
  }): Promise<boolean> {
    return this.createEntry({
      documentId: templateData.templateId,
      documentName: templateData.templateName,
      documentType: templateData.templateType || 'template',
      action: 'created',
      actionDescription: `Template "${templateData.templateName}" was created`,
      severity: 'high',
      category: 'system',
      tags: ['template-creation', templateData.category || 'template'],
      contextData: {
        ...templateData.contextData,
        templateType: templateData.templateType,
        category: templateData.category
      }
    });
  }

  /**
   * Log template update
   */
  async logTemplateUpdated(templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changedFields?: string[];
  }): Promise<boolean> {
    return this.createEntry({
      documentId: templateData.templateId,
      documentName: templateData.templateName,
      documentType: templateData.templateType || 'template',
      action: 'updated',
      actionDescription: `Template "${templateData.templateName}" was updated`,
      severity: 'medium',
      category: 'system',
      tags: ['template-update'],
      previousValues: templateData.previousValues,
      newValues: templateData.newValues,
      changedFields: templateData.changedFields
    });
  }

  /**
   * Log template deletion
   */
  async logTemplateDeleted(templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
  }): Promise<boolean> {
    return this.createEntry({
      documentId: templateData.templateId,
      documentName: templateData.templateName,
      documentType: templateData.templateType || 'template',
      action: 'deleted',
      actionDescription: `Template "${templateData.templateName}" was deleted`,
      severity: 'high',
      category: 'system',
      tags: ['template-deletion']
    });
  }

  /**
   * Log template view
   */
  async logTemplateViewed(templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
  }): Promise<boolean> {
    return this.createEntry({
      documentId: templateData.templateId,
      documentName: templateData.templateName,
      documentType: templateData.templateType || 'template',
      action: 'viewed',
      actionDescription: `Template "${templateData.templateName}" was viewed`,
      severity: 'low',
      category: 'system',
      tags: ['template-view']
    });
  }

  /**
   * Log template usage
   */
  async logTemplateUsed(templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
    projectId?: string;
    projectName?: string;
    contextData?: Record<string, any>;
  }): Promise<boolean> {
    return this.createEntry({
      documentId: templateData.templateId,
      documentName: templateData.templateName,
      documentType: templateData.templateType || 'template',
      projectId: templateData.projectId,
      projectName: templateData.projectName,
      action: 'regenerated',
      actionDescription: `Template "${templateData.templateName}" was used${templateData.projectName ? ` for project "${templateData.projectName}"` : ''}`,
      severity: 'medium',
      category: 'system',
      tags: ['template-usage'],
      contextData: {
        ...templateData.contextData,
        templateType: templateData.templateType,
        usageType: 'document-generation'
      }
    });
  }

  /**
   * Log user actions
   */
  async logUserAction(actionData: {
    action: 'created' | 'updated' | 'deleted' | 'viewed' | 'downloaded' | 'shared' | 'feedback_submitted' | 'quality_assessed' | 'status_changed' | 'regenerated';
    description: string;
    userId?: string;
    userName?: string;
    userRole?: string;
    userEmail?: string;
    contextData?: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    category?: 'document' | 'quality' | 'user' | 'system' | 'ai';
    tags?: string[];
  }): Promise<boolean> {
    return this.createEntry({
      action: actionData.action,
      actionDescription: actionData.description,
      userId: actionData.userId,
      userName: actionData.userName,
      userRole: actionData.userRole,
      userEmail: actionData.userEmail,
      severity: actionData.severity || 'medium',
      category: actionData.category || 'user',
      tags: actionData.tags || [actionData.action],
      contextData: actionData.contextData
    });
  }
}

// Export singleton instance
export const auditTrail = new AuditTrailService();

// Export individual methods for convenience
export const {
  createEntry,
  logDocumentCreated,
  logDocumentUpdated,
  logDocumentDeleted,
  logDocumentViewed,
  logDocumentDownloaded,
  logAIDocumentGenerated,
  logProjectCreated,
  logProjectUpdated,
  logProjectDeleted,
  logProjectViewed,
  logTemplateCreated,
  logTemplateUpdated,
  logTemplateDeleted,
  logTemplateViewed,
  logTemplateUsed,
  logUserAction
} = auditTrail;
