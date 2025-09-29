import DocumentAuditTrail from '../models/DocumentAuditTrail.model.js';
import ComplianceMetrics from '../models/ComplianceMetrics.model.js';
import ComplianceIssue from '../models/ComplianceIssue.model.js';
import ComplianceWorkflow from '../models/ComplianceWorkflow.model.js';
import { logger } from '../utils/logger.js';

export interface ComplianceAuditEvent {
  eventType: 'SCORE_CHANGE' | 'ISSUE_CREATED' | 'ISSUE_RESOLVED' | 'ISSUE_UPDATED' | 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED' | 'STANDARD_ASSESSMENT' | 'COMPLIANCE_REVIEW';
  documentId?: string;
  projectId: string;
  userId: string;
  userName: string;
  userRole?: string;
  userEmail?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'compliance' | 'quality' | 'workflow' | 'assessment';
  description: string;
  details: {
    standardType?: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
    previousScore?: number;
    newScore?: number;
    scoreChange?: number;
    changePercentage?: number;
    issueId?: string;
    issueTitle?: string;
    issueSeverity?: 'low' | 'medium' | 'high' | 'critical';
    workflowId?: string;
    workflowName?: string;
    workflowStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    assessmentType?: 'AUTOMATED' | 'MANUAL' | 'REVIEW';
    complianceLevel?: 'FULL' | 'PARTIAL' | 'NON_COMPLIANT';
    notes?: string;
    tags?: string[];
  };
  contextData?: {
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    component?: string;
    action?: string;
    duration?: number;
  };
}

export class ComplianceAuditService {
  /**
   * Log a compliance score change event
   */
  static async logScoreChange(
    projectId: string,
    documentId: string,
    userId: string,
    userName: string,
    standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL',
    previousScore: number,
    newScore: number,
    contextData?: any
  ): Promise<void> {
    try {
      const scoreChange = newScore - previousScore;
      const changePercentage = previousScore > 0 ? (scoreChange / previousScore) * 100 : 0;
      
      const event: ComplianceAuditEvent = {
        eventType: 'SCORE_CHANGE',
        documentId,
        projectId,
        userId,
        userName,
        timestamp: new Date(),
        severity: Math.abs(changePercentage) > 10 ? 'high' : Math.abs(changePercentage) > 5 ? 'medium' : 'low',
        category: 'compliance',
        description: `Compliance score changed for ${standardType} standard`,
        details: {
          standardType,
          previousScore,
          newScore,
          scoreChange,
          changePercentage: Math.round(changePercentage * 100) / 100,
          notes: `Score changed from ${previousScore}% to ${newScore}% (${scoreChange > 0 ? '+' : ''}${changePercentage.toFixed(1)}%)`,
          tags: ['compliance', 'score', standardType.toLowerCase()]
        },
        contextData
      };

      await this.createAuditEntry(event);
      logger.info(`📊 Compliance score change logged: ${standardType} ${previousScore}% → ${newScore}%`);
    } catch (error) {
      logger.error('❌ Error logging compliance score change:', error);
    }
  }

  /**
   * Log a compliance issue creation event
   */
  static async logIssueCreated(
    projectId: string,
    documentId: string,
    userId: string,
    userName: string,
    issueId: string,
    issueTitle: string,
    issueSeverity: 'low' | 'medium' | 'high' | 'critical',
    standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL',
    contextData?: any
  ): Promise<void> {
    try {
      const event: ComplianceAuditEvent = {
        eventType: 'ISSUE_CREATED',
        documentId,
        projectId,
        userId,
        userName,
        timestamp: new Date(),
        severity: issueSeverity,
        category: 'compliance',
        description: `New compliance issue created: ${issueTitle}`,
        details: {
          standardType,
          issueId,
          issueTitle,
          issueSeverity,
          notes: `Issue created for ${standardType} standard compliance`,
          tags: ['compliance', 'issue', 'created', standardType.toLowerCase()]
        },
        contextData
      };

      await this.createAuditEntry(event);
      logger.info(`🚨 Compliance issue created logged: ${issueTitle} (${issueSeverity})`);
    } catch (error) {
      logger.error('❌ Error logging compliance issue creation:', error);
    }
  }

  /**
   * Log a compliance issue resolution event
   */
  static async logIssueResolved(
    projectId: string,
    documentId: string,
    userId: string,
    userName: string,
    issueId: string,
    issueTitle: string,
    issueSeverity: 'low' | 'medium' | 'high' | 'critical',
    standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL',
    resolutionNotes?: string,
    contextData?: any
  ): Promise<void> {
    try {
      const event: ComplianceAuditEvent = {
        eventType: 'ISSUE_RESOLVED',
        documentId,
        projectId,
        userId,
        userName,
        timestamp: new Date(),
        severity: issueSeverity,
        category: 'compliance',
        description: `Compliance issue resolved: ${issueTitle}`,
        details: {
          standardType,
          issueId,
          issueTitle,
          issueSeverity,
          notes: resolutionNotes || `Issue resolved for ${standardType} standard compliance`,
          tags: ['compliance', 'issue', 'resolved', standardType.toLowerCase()]
        },
        contextData
      };

      await this.createAuditEntry(event);
      logger.info(`✅ Compliance issue resolved logged: ${issueTitle}`);
    } catch (error) {
      logger.error('❌ Error logging compliance issue resolution:', error);
    }
  }

  /**
   * Log a compliance workflow event
   */
  static async logWorkflowEvent(
    eventType: 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED',
    projectId: string,
    documentId: string,
    userId: string,
    userName: string,
    workflowId: string,
    workflowName: string,
    workflowStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    standardType?: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL',
    contextData?: any
  ): Promise<void> {
    try {
      const event: ComplianceAuditEvent = {
        eventType,
        documentId,
        projectId,
        userId,
        userName,
        timestamp: new Date(),
        severity: eventType === 'WORKFLOW_COMPLETED' ? 'medium' : 'low',
        category: 'workflow',
        description: `Compliance workflow ${eventType.toLowerCase().replace('_', ' ')}: ${workflowName}`,
        details: {
          standardType,
          workflowId,
          workflowName,
          workflowStatus,
          notes: `Workflow ${eventType.toLowerCase().replace('_', ' ')} for compliance process`,
          tags: ['compliance', 'workflow', eventType.toLowerCase().replace('_', '-'), standardType?.toLowerCase() || 'general']
        },
        contextData
      };

      await this.createAuditEntry(event);
      logger.info(`🔄 Compliance workflow event logged: ${workflowName} - ${eventType}`);
    } catch (error) {
      logger.error('❌ Error logging compliance workflow event:', error);
    }
  }

  /**
   * Log a compliance assessment event
   */
  static async logAssessmentEvent(
    projectId: string,
    documentId: string,
    userId: string,
    userName: string,
    standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL',
    assessmentType: 'AUTOMATED' | 'MANUAL' | 'REVIEW',
    complianceLevel: 'FULL' | 'PARTIAL' | 'NON_COMPLIANT',
    score: number,
    contextData?: any
  ): Promise<void> {
    try {
      const event: ComplianceAuditEvent = {
        eventType: 'STANDARD_ASSESSMENT',
        documentId,
        projectId,
        userId,
        userName,
        timestamp: new Date(),
        severity: complianceLevel === 'NON_COMPLIANT' ? 'high' : complianceLevel === 'PARTIAL' ? 'medium' : 'low',
        category: 'assessment',
        description: `${assessmentType} compliance assessment completed for ${standardType}`,
        details: {
          standardType,
          assessmentType,
          complianceLevel,
          newScore: score,
          notes: `${assessmentType} assessment resulted in ${complianceLevel} compliance (${score}%)`,
          tags: ['compliance', 'assessment', assessmentType.toLowerCase(), standardType.toLowerCase()]
        },
        contextData
      };

      await this.createAuditEntry(event);
      logger.info(`📋 Compliance assessment logged: ${standardType} - ${complianceLevel} (${score}%)`);
    } catch (error) {
      logger.error('❌ Error logging compliance assessment:', error);
    }
  }

  /**
   * Create audit trail entry from compliance event
   */
  private static async createAuditEntry(event: ComplianceAuditEvent): Promise<void> {
    try {
      const auditEntry = new DocumentAuditTrail({
        documentId: event.documentId || 'system',
        documentName: `Compliance Event: ${event.details.standardType || 'General'}`,
        documentType: 'compliance_event',
        projectId: event.projectId,
        projectName: 'Compliance Management', // This could be fetched from project data
        action: event.eventType.toLowerCase(),
        actionDescription: event.description,
        userId: event.userId,
        userName: event.userName,
        userRole: event.userRole,
        userEmail: event.userEmail,
        timestamp: event.timestamp,
        severity: event.severity,
        category: event.category,
        notes: event.details.notes,
        tags: event.details.tags,
        contextData: {
          complianceEvent: true,
          eventType: event.eventType,
          standardType: event.details.standardType,
          scoreChange: event.details.scoreChange,
          changePercentage: event.details.changePercentage,
          issueId: event.details.issueId,
          workflowId: event.details.workflowId,
          assessmentType: event.details.assessmentType,
          complianceLevel: event.details.complianceLevel,
          ...event.contextData
        }
      });

      await auditEntry.save();
    } catch (error) {
      logger.error('❌ Error creating audit entry:', error);
      throw error;
    }
  }

  /**
   * Get compliance-specific audit events
   */
  static async getComplianceEvents(
    projectId?: string,
    standardType?: string,
    eventType?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const query: any = {
        'contextData.complianceEvent': true
      };

      if (projectId) {
        query.projectId = projectId;
      }

      if (standardType) {
        query['contextData.standardType'] = standardType;
      }

      if (eventType) {
        query['contextData.eventType'] = eventType;
      }

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = startDate;
        if (endDate) query.timestamp.$lte = endDate;
      }

      const events = await DocumentAuditTrail.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      return events;
    } catch (error) {
      logger.error('❌ Error fetching compliance events:', error);
      return [];
    }
  }

  /**
   * Get compliance analytics data
   */
  static async getComplianceAnalytics(
    projectId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      const query: any = {
        'contextData.complianceEvent': true
      };

      if (projectId) {
        query.projectId = projectId;
      }

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = startDate;
        if (endDate) query.timestamp.$lte = endDate;
      }

      const events = await DocumentAuditTrail.find(query).lean();

      // Analyze events
      const analytics: any = {
        totalEvents: events.length,
        eventsByType: {},
        eventsByStandard: {},
        eventsBySeverity: {},
        eventsByCategory: {},
        scoreChanges: [],
        issueEvents: [],
        workflowEvents: [],
        assessmentEvents: [],
        trends: {
          daily: {},
          weekly: {},
          monthly: {}
        },
        topUsers: {},
        complianceScoreHistory: []
      };

      events.forEach(event => {
        const eventType = (event.contextData as any)?.eventType;
        const standardType = (event.contextData as any)?.standardType;
        const severity = event.severity;
        const category = event.category;
        const userName = event.userName;

        // Count by type
        if (eventType) {
          analytics.eventsByType[eventType] = (analytics.eventsByType[eventType] || 0) + 1;
        }
        if (standardType) {
          analytics.eventsByStandard[standardType] = (analytics.eventsByStandard[standardType] || 0) + 1;
        }
        analytics.eventsBySeverity[severity] = (analytics.eventsBySeverity[severity] || 0) + 1;
        analytics.eventsByCategory[category] = (analytics.eventsByCategory[category] || 0) + 1;
        if (userName) {
          analytics.topUsers[userName] = (analytics.topUsers[userName] || 0) + 1;
        }

        // Categorize events
        if (eventType === 'SCORE_CHANGE') {
          analytics.scoreChanges.push({
            timestamp: event.timestamp,
            standardType,
            previousScore: (event.contextData as any)?.previousScore,
            newScore: (event.contextData as any)?.newScore,
            changePercentage: (event.contextData as any)?.changePercentage
          });
        } else if (eventType?.includes('ISSUE')) {
          analytics.issueEvents.push({
            timestamp: event.timestamp,
            eventType,
            standardType,
            issueId: (event.contextData as any)?.issueId,
            issueTitle: (event.contextData as any)?.issueTitle,
            severity: (event.contextData as any)?.issueSeverity
          });
        } else if (eventType?.includes('WORKFLOW')) {
          analytics.workflowEvents.push({
            timestamp: event.timestamp,
            eventType,
            workflowId: (event.contextData as any)?.workflowId,
            workflowName: (event.contextData as any)?.workflowName,
            workflowStatus: (event.contextData as any)?.workflowStatus
          });
        } else if (eventType === 'STANDARD_ASSESSMENT') {
          analytics.assessmentEvents.push({
            timestamp: event.timestamp,
            standardType,
            assessmentType: (event.contextData as any)?.assessmentType,
            complianceLevel: (event.contextData as any)?.complianceLevel,
            score: (event.contextData as any)?.newScore
          });
        }

        // Build trends
        const date = new Date(event.timestamp);
        const dayKey = date.toISOString().split('T')[0];
        const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        analytics.trends.daily[dayKey] = (analytics.trends.daily[dayKey] || 0) + 1;
        analytics.trends.weekly[weekKey] = (analytics.trends.weekly[weekKey] || 0) + 1;
        analytics.trends.monthly[monthKey] = (analytics.trends.monthly[monthKey] || 0) + 1;
      });

      return analytics;
    } catch (error) {
      logger.error('❌ Error generating compliance analytics:', error);
      return null;
    }
  }
}
