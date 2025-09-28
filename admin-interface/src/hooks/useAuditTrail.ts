/**
 * React hook for audit trail logging
 * Provides easy access to audit trail functionality in React components
 */

import { useCallback } from 'react';
import { auditTrail, AuditTrailEntry } from '../lib/auditTrail';

export const useAuditTrail = () => {
  const logEntry = useCallback(async (entry: AuditTrailEntry): Promise<boolean> => {
    return await auditTrail.createEntry(entry);
  }, []);

  const logDocumentCreated = useCallback(async (documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
    contextData?: Record<string, any>;
  }): Promise<boolean> => {
    return await auditTrail.logDocumentCreated(documentData);
  }, []);

  const logDocumentUpdated = useCallback(async (documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changedFields?: string[];
  }): Promise<boolean> => {
    return await auditTrail.logDocumentUpdated(documentData);
  }, []);

  const logDocumentDeleted = useCallback(async (documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
  }): Promise<boolean> => {
    return await auditTrail.logDocumentDeleted(documentData);
  }, []);

  const logDocumentViewed = useCallback(async (documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
  }): Promise<boolean> => {
    return await auditTrail.logDocumentViewed(documentData);
  }, []);

  const logDocumentDownloaded = useCallback(async (documentData: {
    documentId: string;
    documentName: string;
    documentType: string;
    projectId: string;
    projectName: string;
    format?: string;
  }): Promise<boolean> => {
    return await auditTrail.logDocumentDownloaded(documentData);
  }, []);

  const logAIDocumentGenerated = useCallback(async (documentData: {
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
  }): Promise<boolean> => {
    return await auditTrail.logAIDocumentGenerated(documentData);
  }, []);

  const logProjectCreated = useCallback(async (projectData: {
    projectId: string;
    projectName: string;
    description?: string;
    framework?: string;
    contextData?: Record<string, any>;
  }): Promise<boolean> => {
    return await auditTrail.logProjectCreated(projectData);
  }, []);

  const logProjectUpdated = useCallback(async (projectData: {
    projectId: string;
    projectName: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changedFields?: string[];
  }): Promise<boolean> => {
    return await auditTrail.logProjectUpdated(projectData);
  }, []);

  const logProjectDeleted = useCallback(async (projectData: {
    projectId: string;
    projectName: string;
  }): Promise<boolean> => {
    return await auditTrail.logProjectDeleted(projectData);
  }, []);

  const logProjectViewed = useCallback(async (projectData: {
    projectId: string;
    projectName: string;
  }): Promise<boolean> => {
    return await auditTrail.logProjectViewed(projectData);
  }, []);

  const logTemplateCreated = useCallback(async (templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
    category?: string;
    contextData?: Record<string, any>;
  }): Promise<boolean> => {
    return await auditTrail.logTemplateCreated(templateData);
  }, []);

  const logTemplateUpdated = useCallback(async (templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changedFields?: string[];
  }): Promise<boolean> => {
    return await auditTrail.logTemplateUpdated(templateData);
  }, []);

  const logTemplateDeleted = useCallback(async (templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
  }): Promise<boolean> => {
    return await auditTrail.logTemplateDeleted(templateData);
  }, []);

  const logTemplateViewed = useCallback(async (templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
  }): Promise<boolean> => {
    return await auditTrail.logTemplateViewed(templateData);
  }, []);

  const logTemplateUsed = useCallback(async (templateData: {
    templateId: string;
    templateName: string;
    templateType?: string;
    projectId?: string;
    projectName?: string;
    contextData?: Record<string, any>;
  }): Promise<boolean> => {
    return await auditTrail.logTemplateUsed(templateData);
  }, []);

  const logUserAction = useCallback(async (actionData: {
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
  }): Promise<boolean> => {
    return await auditTrail.logUserAction(actionData);
  }, []);

  return {
    logEntry,
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
  };
};
