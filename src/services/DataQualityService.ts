// Phase 1 & 2: Enhanced Data Integration - Data Quality Service
// Service for monitoring and assessing the quality of compliance data

import mongoose from 'mongoose';
import ComplianceMetrics from '../models/ComplianceMetrics.model.js';
import ComplianceIssue from '../models/ComplianceIssue.model.js';
import ComplianceNotification from '../models/ComplianceNotification.model.js';
import { logger } from '../utils/logger.js';

export interface DataQualityMetric {
  id: string;
  projectId: string;
  dataSource: string;
  qualityScore: number;
  completenessScore: number;
  accuracyScore: number;
  consistencyScore: number;
  timelinessScore: number;
  validityScore: number;
  qualityLevel: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  issuesFound: number;
  lastValidatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityIssue {
  id: string;
  projectId: string;
  dataSource: string;
  issueType: 'MISSING_DATA' | 'INVALID_FORMAT' | 'OUTDATED_DATA' | 'INCONSISTENT_DATA' | 'DUPLICATE_DATA';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  affectedRecords: number;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export class DataQualityService {
  constructor() {
    this.ensureConnection();
  }

  private async ensureConnection(): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/requirements-gathering-agent');
      }
    } catch (error) {
      logger.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  // Data Quality Assessment
  async assessDataQuality(projectId: string): Promise<DataQualityMetric> {
    try {
      await this.ensureConnection();

      logger.info(`🔍 Assessing data quality for project: ${projectId}`);

      // Get all compliance data for the project
      const metrics = await ComplianceMetrics.find({ projectId }).lean();
      const issues = await ComplianceIssue.find({ projectId }).lean();
      const notifications = await ComplianceNotification.find({ projectId }).lean();

      // Calculate quality scores
      const completenessScore = this.calculateCompletenessScore(metrics, issues, notifications);
      const accuracyScore = this.calculateAccuracyScore(metrics, issues);
      const consistencyScore = this.calculateConsistencyScore(metrics);
      const timelinessScore = this.calculateTimelinessScore(metrics, issues, notifications);
      const validityScore = this.calculateValidityScore(metrics, issues);

      // Calculate overall quality score
      const qualityScore = Math.round(
        (completenessScore + accuracyScore + consistencyScore + timelinessScore + validityScore) / 5
      );

      // Determine quality level
      const qualityLevel = this.determineQualityLevel(qualityScore);

      // Count issues found
      const issuesFound = await this.countQualityIssues(projectId);

      const qualityMetric: DataQualityMetric = {
        id: `quality-${projectId}-${Date.now()}`,
        projectId,
        dataSource: 'compliance_system',
        qualityScore,
        completenessScore,
        accuracyScore,
        consistencyScore,
        timelinessScore,
        validityScore,
        qualityLevel,
        issuesFound,
        lastValidatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info(`✅ Data quality assessment completed for project: ${projectId}`, {
        qualityScore,
        qualityLevel,
        issuesFound
      });

      return qualityMetric;
    } catch (error) {
      logger.error('❌ Error assessing data quality:', error);
      throw error;
    }
  }

  private calculateCompletenessScore(metrics: any[], issues: any[], notifications: any[]): number {
    try {
      // Check for required fields in metrics
      let completeMetrics = 0;
      const requiredFields = ['projectId', 'standardType', 'score', 'dataSource', 'calculatedAt'];
      
      for (const metric of metrics) {
        const hasAllFields = requiredFields.every(field => metric[field] !== undefined && metric[field] !== null);
        if (hasAllFields) completeMetrics++;
      }

      // Check for required fields in issues
      let completeIssues = 0;
      const requiredIssueFields = ['projectId', 'standardType', 'title', 'severity', 'status'];
      
      for (const issue of issues) {
        const hasAllFields = requiredIssueFields.every(field => issue[field] !== undefined && issue[field] !== null);
        if (hasAllFields) completeIssues++;
      }

      // Check for required fields in notifications
      let completeNotifications = 0;
      const requiredNotificationFields = ['type', 'title', 'message', 'timestamp'];
      
      for (const notification of notifications) {
        const hasAllFields = requiredNotificationFields.every(field => notification[field] !== undefined && notification[field] !== null);
        if (hasAllFields) completeNotifications++;
      }

      // Calculate completeness percentage
      const totalRecords = metrics.length + issues.length + notifications.length;
      const completeRecords = completeMetrics + completeIssues + completeNotifications;
      
      return totalRecords > 0 ? Math.round((completeRecords / totalRecords) * 100) : 100;
    } catch (error) {
      logger.error('❌ Error calculating completeness score:', error);
      return 0;
    }
  }

  private calculateAccuracyScore(metrics: any[], issues: any[]): number {
    try {
      let accurateRecords = 0;
      let totalRecords = 0;

      // Check metrics accuracy
      for (const metric of metrics) {
        totalRecords++;
        if (metric.score >= 0 && metric.score <= 100 && 
            ['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL'].includes(metric.standardType)) {
          accurateRecords++;
        }
      }

      // Check issues accuracy
      for (const issue of issues) {
        totalRecords++;
        if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'].includes(issue.severity) &&
            ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'RESOLVED', 'CLOSED'].includes(issue.status)) {
          accurateRecords++;
        }
      }

      return totalRecords > 0 ? Math.round((accurateRecords / totalRecords) * 100) : 100;
    } catch (error) {
      logger.error('❌ Error calculating accuracy score:', error);
      return 0;
    }
  }

  private calculateConsistencyScore(metrics: any[]): number {
    try {
      if (metrics.length === 0) return 100;

      // Group metrics by standard type
      const metricsByStandard: { [key: string]: any[] } = {};
      for (const metric of metrics) {
        if (!metricsByStandard[metric.standardType]) {
          metricsByStandard[metric.standardType] = [];
        }
        metricsByStandard[metric.standardType].push(metric);
      }

      let consistentStandards = 0;
      const totalStandards = Object.keys(metricsByStandard).length;

      for (const [standardType, standardMetrics] of Object.entries(metricsByStandard)) {
        if (standardMetrics.length > 1) {
          // Check for consistency in data structure
          const firstMetric = standardMetrics[0];
          const isConsistent = standardMetrics.every(metric => 
            Object.keys(metric).length === Object.keys(firstMetric).length &&
            Object.keys(metric).every(key => 
              typeof metric[key] === typeof firstMetric[key] ||
              (metric[key] === null && firstMetric[key] === null) ||
              (metric[key] === undefined && firstMetric[key] === undefined)
            )
          );
          
          if (isConsistent) consistentStandards++;
        } else {
          // Single metric is considered consistent
          consistentStandards++;
        }
      }

      return totalStandards > 0 ? Math.round((consistentStandards / totalStandards) * 100) : 100;
    } catch (error) {
      logger.error('❌ Error calculating consistency score:', error);
      return 0;
    }
  }

  private calculateTimelinessScore(metrics: any[], issues: any[], notifications: any[]): number {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      let timelyRecords = 0;
      let totalRecords = 0;

      // Check metrics timeliness (should be recent)
      for (const metric of metrics) {
        totalRecords++;
        if (metric.calculatedAt && metric.calculatedAt >= oneWeekAgo) {
          timelyRecords++;
        }
      }

      // Check issues timeliness (should be recent or resolved)
      for (const issue of issues) {
        totalRecords++;
        if (issue.status === 'RESOLVED' || issue.status === 'CLOSED' || 
            (issue.createdAt && issue.createdAt >= oneWeekAgo)) {
          timelyRecords++;
        }
      }

      // Check notifications timeliness (should be recent)
      for (const notification of notifications) {
        totalRecords++;
        if (notification.timestamp && notification.timestamp >= oneDayAgo) {
          timelyRecords++;
        }
      }

      return totalRecords > 0 ? Math.round((timelyRecords / totalRecords) * 100) : 100;
    } catch (error) {
      logger.error('❌ Error calculating timeliness score:', error);
      return 0;
    }
  }

  private calculateValidityScore(metrics: any[], issues: any[]): number {
    try {
      let validRecords = 0;
      let totalRecords = 0;

      // Check metrics validity
      for (const metric of metrics) {
        totalRecords++;
        if (metric.score >= 0 && metric.score <= 100 &&
            metric.calculatedAt instanceof Date &&
            metric.calculatedAt <= new Date()) {
          validRecords++;
        }
      }

      // Check issues validity
      for (const issue of issues) {
        totalRecords++;
        if (issue.title && issue.title.length > 0 && issue.title.length <= 200 &&
            (!issue.description || issue.description.length <= 1000)) {
          validRecords++;
        }
      }

      return totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 100;
    } catch (error) {
      logger.error('❌ Error calculating validity score:', error);
      return 0;
    }
  }

  private determineQualityLevel(score: number): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'FAIR';
    return 'POOR';
  }

  private async countQualityIssues(projectId: string): Promise<number> {
    try {
      await this.ensureConnection();

      // Count various types of quality issues
      const missingDataIssues = await ComplianceMetrics.countDocuments({
        projectId,
        $or: [
          { score: { $exists: false } },
          { score: null },
          { standardType: { $exists: false } },
          { standardType: null }
        ]
      });

      const invalidFormatIssues = await ComplianceMetrics.countDocuments({
        projectId,
        $or: [
          { score: { $lt: 0 } },
          { score: { $gt: 100 } },
          { standardType: { $nin: ['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL'] } }
        ]
      });

      const outdatedDataIssues = await ComplianceMetrics.countDocuments({
        projectId,
        calculatedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
      });

      return missingDataIssues + invalidFormatIssues + outdatedDataIssues;
    } catch (error) {
      logger.error('❌ Error counting quality issues:', error);
      return 0;
    }
  }

  // Quality Issue Detection
  async detectQualityIssues(projectId: string): Promise<QualityIssue[]> {
    try {
      await this.ensureConnection();

      logger.info(`🔍 Detecting quality issues for project: ${projectId}`);

      const issues: QualityIssue[] = [];

      // Detect missing data issues
      const missingDataCount = await ComplianceMetrics.countDocuments({
        projectId,
        $or: [
          { score: { $exists: false } },
          { score: null },
          { standardType: { $exists: false } },
          { standardType: null }
        ]
      });

      if (missingDataCount > 0) {
        issues.push({
          id: `missing-data-${projectId}-${Date.now()}`,
          projectId,
          dataSource: 'compliance_metrics',
          issueType: 'MISSING_DATA',
          severity: 'HIGH',
          description: `${missingDataCount} compliance metrics are missing required data fields`,
          affectedRecords: missingDataCount,
          detectedAt: new Date(),
          status: 'OPEN'
        });
      }

      // Detect invalid format issues
      const invalidFormatCount = await ComplianceMetrics.countDocuments({
        projectId,
        $or: [
          { score: { $lt: 0 } },
          { score: { $gt: 100 } },
          { standardType: { $nin: ['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL'] } }
        ]
      });

      if (invalidFormatCount > 0) {
        issues.push({
          id: `invalid-format-${projectId}-${Date.now()}`,
          projectId,
          dataSource: 'compliance_metrics',
          issueType: 'INVALID_FORMAT',
          severity: 'CRITICAL',
          description: `${invalidFormatCount} compliance metrics have invalid data formats`,
          affectedRecords: invalidFormatCount,
          detectedAt: new Date(),
          status: 'OPEN'
        });
      }

      // Detect outdated data issues
      const outdatedDataCount = await ComplianceMetrics.countDocuments({
        projectId,
        calculatedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
      });

      if (outdatedDataCount > 0) {
        issues.push({
          id: `outdated-data-${projectId}-${Date.now()}`,
          projectId,
          dataSource: 'compliance_metrics',
          issueType: 'OUTDATED_DATA',
          severity: 'MEDIUM',
          description: `${outdatedDataCount} compliance metrics are older than 30 days`,
          affectedRecords: outdatedDataCount,
          detectedAt: new Date(),
          status: 'OPEN'
        });
      }

      logger.info(`✅ Quality issue detection completed for project: ${projectId}`, {
        issuesFound: issues.length
      });

      return issues;
    } catch (error) {
      logger.error('❌ Error detecting quality issues:', error);
      throw error;
    }
  }

  // Data Quality Monitoring
  async monitorDataQuality(projectId: string): Promise<void> {
    try {
      logger.info(`📊 Starting data quality monitoring for project: ${projectId}`);

      // Assess current data quality
      const qualityMetric = await this.assessDataQuality(projectId);

      // Detect quality issues
      const qualityIssues = await this.detectQualityIssues(projectId);

      // Create notifications for quality issues
      for (const issue of qualityIssues) {
        if (issue.severity === 'CRITICAL' || issue.severity === 'HIGH') {
          await this.createQualityNotification(projectId, issue);
        }
      }

      logger.info(`✅ Data quality monitoring completed for project: ${projectId}`, {
        qualityScore: qualityMetric.qualityScore,
        qualityLevel: qualityMetric.qualityLevel,
        issuesFound: qualityIssues.length
      });
    } catch (error) {
      logger.error('❌ Error monitoring data quality:', error);
      throw error;
    }
  }

  private async createQualityNotification(projectId: string, issue: QualityIssue): Promise<void> {
    try {
      await this.ensureConnection();

      const notification = new ComplianceNotification({
        type: 'WARNING',
        title: `Data Quality Issue Detected`,
        message: `${issue.description} (${issue.severity} severity)`,
        timestamp: new Date(),
        read: false,
        priority: issue.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
        category: 'SYSTEM',
        projectId,
        metadata: {
          issueType: issue.issueType,
          affectedRecords: issue.affectedRecords,
          dataSource: issue.dataSource
        }
      });

      await notification.save();
    } catch (error) {
      logger.error('❌ Error creating quality notification:', error);
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnection();
      await mongoose.connection.db?.admin().ping();
      return true;
    } catch (error) {
      logger.error('❌ Data quality service health check failed:', error);
      return false;
    }
  }
}
