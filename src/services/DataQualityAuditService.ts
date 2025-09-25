import DocumentAuditTrail from '../models/DocumentAuditTrail.model.js';
import { logger } from '../utils/logger.js';

export interface DataQualityAssessment {
  assessmentId: string;
  documentId: string;
  projectId: string;
  userId: string;
  userName: string;
  assessmentType: 'AUTOMATED' | 'MANUAL' | 'REVIEW' | 'CONTINUOUS';
  timestamp: Date;
  overallScore: number;
  dimensions: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    uniqueness: number;
  };
  issues: Array<{
    id: string;
    type: 'MISSING_DATA' | 'INCONSISTENT_FORMAT' | 'OUTDATED_INFO' | 'INVALID_VALUE' | 'DUPLICATE_ENTRY';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    field?: string;
    suggestedFix?: string;
  }>;
  recommendations: Array<{
    id: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  metadata: {
    dataSource: string;
    validationRules: string[];
    assessmentDuration: number;
    aiModel?: string;
    confidenceScore?: number;
  };
}

export interface DataQualityTrend {
  date: Date;
  overallScore: number;
  completenessScore: number;
  accuracyScore: number;
  consistencyScore: number;
  issuesFound: number;
  issuesResolved: number;
}

export class DataQualityAuditService {
  /**
   * Log a data quality assessment event
   */
  static async logDataQualityAssessment(
    assessment: DataQualityAssessment,
    contextData?: any
  ): Promise<void> {
    try {
      const severity = this.calculateSeverity(assessment.overallScore, assessment.issues);
      
      const auditEntry = new DocumentAuditTrail({
        documentId: assessment.documentId,
        documentName: `Data Quality Assessment: ${assessment.assessmentId}`,
        documentType: 'data_quality_assessment',
        projectId: assessment.projectId,
        projectName: 'Data Quality Management',
        action: 'quality_assessed',
        actionDescription: `Data quality assessment completed with score ${assessment.overallScore}%`,
        userId: assessment.userId,
        userName: assessment.userName,
        userRole: 'Data Quality Analyst',
        userEmail: `${assessment.userName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        timestamp: assessment.timestamp,
        severity: severity,
        category: 'quality',
        notes: `Assessment type: ${assessment.assessmentType}, Issues found: ${assessment.issues.length}`,
        tags: ['data-quality', 'assessment', assessment.assessmentType.toLowerCase()],
        contextData: {
          dataQualityEvent: true,
          assessmentId: assessment.assessmentId,
          assessmentType: assessment.assessmentType,
          overallScore: assessment.overallScore,
          dimensions: assessment.dimensions,
          issuesCount: assessment.issues.length,
          recommendationsCount: assessment.recommendations.length,
          criticalIssues: assessment.issues.filter(i => i.severity === 'critical').length,
          highIssues: assessment.issues.filter(i => i.severity === 'high').length,
          mediumIssues: assessment.issues.filter(i => i.severity === 'medium').length,
          lowIssues: assessment.issues.filter(i => i.severity === 'low').length,
          dataSource: assessment.metadata.dataSource,
          assessmentDuration: assessment.metadata.assessmentDuration,
          aiModel: assessment.metadata.aiModel,
          confidenceScore: assessment.metadata.confidenceScore,
          ...contextData
        }
      });

      await auditEntry.save();
      logger.info(`📊 Data quality assessment logged: ${assessment.assessmentId} - Score: ${assessment.overallScore}%`);
    } catch (error) {
      logger.error('❌ Error logging data quality assessment:', error);
    }
  }

  /**
   * Log a data quality issue resolution event
   */
  static async logIssueResolution(
    documentId: string,
    projectId: string,
    userId: string,
    userName: string,
    issueId: string,
    issueType: string,
    resolutionMethod: string,
    resolutionNotes: string,
    contextData?: any
  ): Promise<void> {
    try {
      const auditEntry = new DocumentAuditTrail({
        documentId: documentId,
        documentName: `Data Quality Issue Resolution: ${issueId}`,
        documentType: 'data_quality_resolution',
        projectId: projectId,
        projectName: 'Data Quality Management',
        action: 'issue_resolved',
        actionDescription: `Data quality issue ${issueId} resolved using ${resolutionMethod}`,
        userId: userId,
        userName: userName,
        userRole: 'Data Quality Analyst',
        userEmail: `${userName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        timestamp: new Date(),
        severity: 'medium',
        category: 'quality',
        notes: resolutionNotes,
        tags: ['data-quality', 'issue-resolution', issueType.toLowerCase()],
        contextData: {
          dataQualityEvent: true,
          issueResolution: true,
          issueId: issueId,
          issueType: issueType,
          resolutionMethod: resolutionMethod,
          resolutionNotes: resolutionNotes,
          ...contextData
        }
      });

      await auditEntry.save();
      logger.info(`✅ Data quality issue resolution logged: ${issueId}`);
    } catch (error) {
      logger.error('❌ Error logging data quality issue resolution:', error);
    }
  }

  /**
   * Log a data quality rule validation event
   */
  static async logRuleValidation(
    documentId: string,
    projectId: string,
    userId: string,
    userName: string,
    ruleId: string,
    ruleName: string,
    validationResult: 'PASSED' | 'FAILED' | 'WARNING',
    violations: Array<{
      field: string;
      value: any;
      expectedValue: any;
      message: string;
    }>,
    contextData?: any
  ): Promise<void> {
    try {
      const severity = validationResult === 'FAILED' ? 'high' : 
                      validationResult === 'WARNING' ? 'medium' : 'low';
      
      const auditEntry = new DocumentAuditTrail({
        documentId: documentId,
        documentName: `Data Quality Rule Validation: ${ruleName}`,
        documentType: 'data_quality_validation',
        projectId: projectId,
        projectName: 'Data Quality Management',
        action: 'rule_validated',
        actionDescription: `Data quality rule ${ruleName} validation ${validationResult.toLowerCase()}`,
        userId: userId,
        userName: userName,
        userRole: 'Data Quality Analyst',
        userEmail: `${userName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        timestamp: new Date(),
        severity: severity,
        category: 'quality',
        notes: `Rule: ${ruleName}, Result: ${validationResult}, Violations: ${violations.length}`,
        tags: ['data-quality', 'rule-validation', validationResult.toLowerCase()],
        contextData: {
          dataQualityEvent: true,
          ruleValidation: true,
          ruleId: ruleId,
          ruleName: ruleName,
          validationResult: validationResult,
          violationsCount: violations.length,
          violations: violations,
          ...contextData
        }
      });

      await auditEntry.save();
      logger.info(`🔍 Data quality rule validation logged: ${ruleName} - ${validationResult}`);
    } catch (error) {
      logger.error('❌ Error logging data quality rule validation:', error);
    }
  }

  /**
   * Log a data quality improvement event
   */
  static async logQualityImprovement(
    documentId: string,
    projectId: string,
    userId: string,
    userName: string,
    previousScore: number,
    newScore: number,
    improvementMethod: string,
    improvements: Array<{
      dimension: string;
      previousValue: number;
      newValue: number;
      improvement: number;
    }>,
    contextData?: any
  ): Promise<void> {
    try {
      const scoreChange = newScore - previousScore;
      const changePercentage = previousScore > 0 ? (scoreChange / previousScore) * 100 : 0;
      const severity = Math.abs(changePercentage) > 10 ? 'high' : 
                      Math.abs(changePercentage) > 5 ? 'medium' : 'low';
      
      const auditEntry = new DocumentAuditTrail({
        documentId: documentId,
        documentName: `Data Quality Improvement: ${documentId}`,
        documentType: 'data_quality_improvement',
        projectId: projectId,
        projectName: 'Data Quality Management',
        action: 'quality_improved',
        actionDescription: `Data quality improved from ${previousScore}% to ${newScore}% (+${changePercentage.toFixed(1)}%)`,
        userId: userId,
        userName: userName,
        userRole: 'Data Quality Analyst',
        userEmail: `${userName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        timestamp: new Date(),
        severity: severity,
        category: 'quality',
        notes: `Improvement method: ${improvementMethod}`,
        tags: ['data-quality', 'improvement', 'score-change'],
        contextData: {
          dataQualityEvent: true,
          qualityImprovement: true,
          previousScore: previousScore,
          newScore: newScore,
          scoreChange: scoreChange,
          changePercentage: changePercentage,
          improvementMethod: improvementMethod,
          improvements: improvements,
          ...contextData
        }
      });

      await auditEntry.save();
      logger.info(`📈 Data quality improvement logged: ${previousScore}% → ${newScore}% (+${changePercentage.toFixed(1)}%)`);
    } catch (error) {
      logger.error('❌ Error logging data quality improvement:', error);
    }
  }

  /**
   * Get data quality audit events
   */
  static async getDataQualityEvents(
    projectId?: string,
    assessmentType?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const query: any = {
        'contextData.dataQualityEvent': true
      };

      if (projectId) {
        query.projectId = projectId;
      }

      if (assessmentType) {
        query['contextData.assessmentType'] = assessmentType;
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
      logger.error('❌ Error fetching data quality events:', error);
      return [];
    }
  }

  /**
   * Get data quality analytics
   */
  static async getDataQualityAnalytics(
    projectId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      const query: any = {
        'contextData.dataQualityEvent': true
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
      const analytics = {
        totalAssessments: 0,
        totalIssues: 0,
        totalResolutions: 0,
        totalImprovements: 0,
        assessmentsByType: {} as Record<string, number>,
        issuesByType: {} as Record<string, number>,
        issuesBySeverity: {} as Record<string, number>,
        averageScores: {
          overall: 0,
          completeness: 0,
          accuracy: 0,
          consistency: 0,
          timeliness: 0,
          validity: 0,
          uniqueness: 0
        },
        trends: {
          daily: {} as Record<string, number>,
          weekly: {} as Record<string, number>,
          monthly: {} as Record<string, number>
        },
        topIssues: {} as Record<string, number>,
        improvementHistory: [] as Array<{
          timestamp: Date;
          previousScore: number;
          newScore: number;
          changePercentage: number;
        }>
      };

      let totalOverallScore = 0;
      let totalCompletenessScore = 0;
      let totalAccuracyScore = 0;
      let totalConsistencyScore = 0;
      let totalTimelinessScore = 0;
      let totalValidityScore = 0;
      let totalUniquenessScore = 0;
      let scoreCount = 0;

      events.forEach(event => {
        const eventType = (event.contextData as any)?.assessmentType || event.action;
        const overallScore = (event.contextData as any)?.overallScore;
        const dimensions = (event.contextData as any)?.dimensions;

        // Count assessments
        if (eventType) {
          analytics.assessmentsByType[eventType] = (analytics.assessmentsByType[eventType] || 0) + 1;
        }

        // Count issues
        const issuesCount = (event.contextData as any)?.issuesCount || 0;
        analytics.totalIssues += issuesCount;

        // Count resolutions
        if ((event.contextData as any)?.issueResolution) {
          analytics.totalResolutions++;
        }

        // Count improvements
        if ((event.contextData as any)?.qualityImprovement) {
          analytics.totalImprovements++;
          analytics.improvementHistory.push({
            timestamp: event.timestamp,
            previousScore: (event.contextData as any)?.previousScore,
            newScore: (event.contextData as any)?.newScore,
            changePercentage: (event.contextData as any)?.changePercentage
          });
        }

        // Aggregate scores
        if (overallScore !== undefined) {
          totalOverallScore += overallScore;
          scoreCount++;
        }

        if (dimensions) {
          if (dimensions.completeness !== undefined) totalCompletenessScore += dimensions.completeness;
          if (dimensions.accuracy !== undefined) totalAccuracyScore += dimensions.accuracy;
          if (dimensions.consistency !== undefined) totalConsistencyScore += dimensions.consistency;
          if (dimensions.timeliness !== undefined) totalTimelinessScore += dimensions.timeliness;
          if (dimensions.validity !== undefined) totalValidityScore += dimensions.validity;
          if (dimensions.uniqueness !== undefined) totalUniquenessScore += dimensions.uniqueness;
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

      // Calculate averages
      if (scoreCount > 0) {
        analytics.averageScores.overall = totalOverallScore / scoreCount;
        analytics.averageScores.completeness = totalCompletenessScore / scoreCount;
        analytics.averageScores.accuracy = totalAccuracyScore / scoreCount;
        analytics.averageScores.consistency = totalConsistencyScore / scoreCount;
        analytics.averageScores.timeliness = totalTimelinessScore / scoreCount;
        analytics.averageScores.validity = totalValidityScore / scoreCount;
        analytics.averageScores.uniqueness = totalUniquenessScore / scoreCount;
      }

      analytics.totalAssessments = events.length;

      return analytics;
    } catch (error) {
      logger.error('❌ Error generating data quality analytics:', error);
      return null;
    }
  }

  /**
   * Calculate severity based on score and issues
   */
  private static calculateSeverity(score: number, issues: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;

    if (criticalIssues > 0 || score < 50) return 'critical';
    if (highIssues > 2 || score < 70) return 'high';
    if (highIssues > 0 || score < 85) return 'medium';
    return 'low';
  }
}
