// Phase 1 & 2: Enhanced Data Integration - Compliance Data Service
// Service layer for managing compliance data operations with MongoDB Atlas

import mongoose from 'mongoose';
import ComplianceMetrics from '../models/ComplianceMetrics.model.js';
import ComplianceIssue from '../models/ComplianceIssue.model.js';
import ComplianceNotification from '../models/ComplianceNotification.model.js';
import { logger } from '../utils/logger.js';

export interface ComplianceMetric {
  id: string;
  projectId: string;
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
  score: number;
  dataSource: string;
  calculatedAt: Date;
  metadata?: any;
  trends?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceIssue {
  id: string;
  projectId: string;
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
  issueType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  title: string;
  description?: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'REVIEW' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceHistory {
  id: string;
  projectId: string;
  metricType: 'OVERALL' | 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO';
  value: number;
  changePercentage?: number;
  previousValue?: number;
  changeReason?: string;
  recordedAt: Date;
}

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

export class ComplianceDataService {
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

  // Compliance Metrics Operations
  async getComplianceMetrics(projectId: string, standardType?: string): Promise<ComplianceMetric[]> {
    try {
      await this.ensureConnection();

      const filter: any = { projectId };
      if (standardType) {
        filter.standardType = standardType;
      }

      const metrics = await ComplianceMetrics.find(filter)
        .sort({ calculatedAt: -1 })
        .lean();

      return metrics.map(metric => ({
        id: metric._id.toString(),
        projectId: metric.projectId,
        standardType: metric.standardType,
        score: metric.score,
        dataSource: metric.dataSource,
        calculatedAt: metric.calculatedAt,
        metadata: metric.metadata,
        trends: metric.trends,
        createdAt: metric.createdAt,
        updatedAt: metric.updatedAt
      }));
    } catch (error) {
      logger.error('❌ Error fetching compliance metrics:', error);
      throw error;
    }
  }

  async getLatestComplianceMetrics(projectId: string): Promise<ComplianceMetric[]> {
    try {
      await this.ensureConnection();

      const metrics = await ComplianceMetrics.aggregate([
        { $match: { projectId } },
        { $sort: { calculatedAt: -1 } },
        {
          $group: {
            _id: '$standardType',
            latestMetric: { $first: '$$ROOT' }
          }
        },
        { $replaceRoot: { newRoot: '$latestMetric' } },
        { $sort: { standardType: 1 } }
      ]);

      return metrics.map(metric => ({
        id: metric._id.toString(),
        projectId: metric.projectId,
        standardType: metric.standardType,
        score: metric.score,
        dataSource: metric.dataSource,
        calculatedAt: metric.calculatedAt,
        metadata: metric.metadata,
        trends: metric.trends,
        createdAt: metric.createdAt,
        updatedAt: metric.updatedAt
      }));
    } catch (error) {
      logger.error('❌ Error fetching latest compliance metrics:', error);
      throw error;
    }
  }

  async createComplianceMetric(metric: Omit<ComplianceMetric, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceMetric> {
    try {
      await this.ensureConnection();

      const newMetric = new ComplianceMetrics({
        projectId: metric.projectId,
        standardType: metric.standardType,
        score: metric.score,
        dataSource: metric.dataSource,
        calculatedAt: metric.calculatedAt,
        metadata: metric.metadata,
        trends: metric.trends
      });

      const savedMetric = await newMetric.save();

      return {
        id: (savedMetric._id as any).toString(),
        projectId: savedMetric.projectId,
        standardType: savedMetric.standardType,
        score: savedMetric.score,
        dataSource: savedMetric.dataSource,
        calculatedAt: savedMetric.calculatedAt,
        metadata: savedMetric.metadata,
        trends: savedMetric.trends,
        createdAt: savedMetric.createdAt,
        updatedAt: savedMetric.updatedAt
      };
    } catch (error) {
      logger.error('❌ Error creating compliance metric:', error);
      throw error;
    }
  }

  // Compliance Issues Operations
  async getComplianceIssues(projectId: string, filters?: {
    standardType?: string;
    status?: string;
    severity?: string;
    assigneeId?: string;
  }): Promise<ComplianceIssue[]> {
    try {
      await this.ensureConnection();

      const filter: any = { projectId };

      if (filters?.standardType) {
        filter.standardType = filters.standardType;
      }
      if (filters?.status) {
        filter.status = filters.status;
      }
      if (filters?.severity) {
        filter.severity = filters.severity;
      }
      if (filters?.assigneeId) {
        filter.assigneeId = filters.assigneeId;
      }

      const issues = await ComplianceIssue.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      return issues.map(issue => ({
        id: issue._id.toString(),
        projectId: issue.projectId,
        standardType: issue.standardType,
        issueType: issue.issueType,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        assigneeId: issue.assigneeId,
        dueDate: issue.dueDate,
        resolvedAt: issue.resolvedAt,
        createdBy: issue.createdBy,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt
      }));
    } catch (error) {
      logger.error('❌ Error fetching compliance issues:', error);
      throw error;
    }
  }

  async createComplianceIssue(issue: Omit<ComplianceIssue, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceIssue> {
    try {
      await this.ensureConnection();

      const newIssue = new ComplianceIssue({
        projectId: issue.projectId,
        standardType: issue.standardType,
        issueType: issue.issueType,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        assigneeId: issue.assigneeId,
        dueDate: issue.dueDate,
        createdBy: issue.createdBy
      });

      const savedIssue = await newIssue.save();

      return {
        id: (savedIssue._id as any).toString(),
        projectId: savedIssue.projectId,
        standardType: savedIssue.standardType,
        issueType: savedIssue.issueType,
        severity: savedIssue.severity,
        title: savedIssue.title,
        description: savedIssue.description,
        status: savedIssue.status,
        priority: savedIssue.priority,
        assigneeId: savedIssue.assigneeId,
        dueDate: savedIssue.dueDate,
        resolvedAt: savedIssue.resolvedAt,
        createdBy: savedIssue.createdBy,
        createdAt: savedIssue.createdAt,
        updatedAt: savedIssue.updatedAt
      };
    } catch (error) {
      logger.error('❌ Error creating compliance issue:', error);
      throw error;
    }
  }

  async updateComplianceIssue(id: string, updates: Partial<ComplianceIssue>): Promise<ComplianceIssue> {
    try {
      await this.ensureConnection();

      const updatedIssue = await ComplianceIssue.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedIssue) {
        throw new Error('Compliance issue not found');
      }

      return {
        id: (updatedIssue._id as any).toString(),
        projectId: updatedIssue.projectId,
        standardType: updatedIssue.standardType,
        issueType: updatedIssue.issueType,
        severity: updatedIssue.severity,
        title: updatedIssue.title,
        description: updatedIssue.description,
        status: updatedIssue.status,
        priority: updatedIssue.priority,
        assigneeId: updatedIssue.assigneeId,
        dueDate: updatedIssue.dueDate,
        resolvedAt: updatedIssue.resolvedAt,
        createdBy: updatedIssue.createdBy,
        createdAt: updatedIssue.createdAt,
        updatedAt: updatedIssue.updatedAt
      };
    } catch (error) {
      logger.error('❌ Error updating compliance issue:', error);
      throw error;
    }
  }

  async deleteComplianceIssue(id: string): Promise<void> {
    try {
      await this.ensureConnection();
      await ComplianceIssue.findByIdAndDelete(id);
    } catch (error) {
      logger.error('❌ Error deleting compliance issue:', error);
      throw error;
    }
  }

  // Compliance History Operations
  async getComplianceHistory(projectId: string, standardType?: string, days?: number): Promise<ComplianceHistory[]> {
    try {
      await this.ensureConnection();

      const filter: any = { projectId };
      if (standardType) {
        filter.standardType = standardType;
      }
      if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        filter.calculatedAt = { $gte: cutoffDate };
      }

      const metrics = await ComplianceMetrics.find(filter)
        .sort({ calculatedAt: -1 })
        .lean();

      return metrics.map(metric => ({
        id: metric._id.toString(),
        projectId: metric.projectId,
        metricType: metric.standardType,
        value: metric.score,
        changePercentage: metric.trends?.changePercentage,
        previousValue: metric.trends?.previousScore,
        changeReason: 'Score update',
        recordedAt: metric.calculatedAt
      }));
    } catch (error) {
      logger.error('❌ Error fetching compliance history:', error);
      throw error;
    }
  }

  // Analytics Operations
  async getComplianceTrends(projectId: string, days: number = 30): Promise<any[]> {
    try {
      await this.ensureConnection();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const trends = await ComplianceMetrics.aggregate([
        {
          $match: {
            projectId,
            calculatedAt: { $gte: cutoffDate }
          }
        },
        {
          $group: {
            _id: {
              standardType: '$standardType',
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$calculatedAt'
                }
              }
            },
            avgScore: { $avg: '$score' },
            dataPoints: { $sum: 1 }
          }
        },
        {
          $sort: {
            '_id.date': -1,
            '_id.standardType': 1
          }
        }
      ]);

      return trends.map(trend => ({
        standardType: trend._id.standardType,
        date: trend._id.date,
        avgScore: Math.round(trend.avgScore * 100) / 100,
        dataPoints: trend.dataPoints
      }));
    } catch (error) {
      logger.error('❌ Error fetching compliance trends:', error);
      throw error;
    }
  }

  async getComplianceSummary(projectId: string): Promise<any[]> {
    try {
      await this.ensureConnection();

      const summary = await ComplianceMetrics.aggregate([
        { $match: { projectId } },
        {
          $group: {
            _id: '$standardType',
            avgScore: { $avg: '$score' },
            maxScore: { $max: '$score' },
            minScore: { $min: '$score' },
            totalMeasurements: { $sum: 1 },
            lastUpdated: { $max: '$calculatedAt' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return summary.map(item => ({
        standardType: item._id,
        avgScore: Math.round(item.avgScore * 100) / 100,
        maxScore: item.maxScore,
        minScore: item.minScore,
        totalMeasurements: item.totalMeasurements,
        lastUpdated: item.lastUpdated
      }));
    } catch (error) {
      logger.error('❌ Error fetching compliance summary:', error);
      throw error;
    }
  }

  // Notification Operations
  async getNotifications(projectId: string, filters?: {
    read?: boolean;
    category?: string;
    priority?: string;
  }): Promise<any[]> {
    try {
      await this.ensureConnection();

      const filter: any = { projectId };

      if (filters?.read !== undefined) {
        filter.read = filters.read;
      }
      if (filters?.category) {
        filter.category = filters.category;
      }
      if (filters?.priority) {
        filter.priority = filters.priority;
      }

      const notifications = await ComplianceNotification.find(filter)
        .sort({ timestamp: -1 })
        .lean();

      return notifications.map(notification => ({
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp,
        read: notification.read,
        priority: notification.priority,
        category: notification.category,
        projectId: notification.projectId,
        issueId: notification.issueId,
        workflowId: notification.workflowId,
        userId: notification.userId,
        actions: notification.actions,
        metadata: notification.metadata
      }));
    } catch (error) {
      logger.error('❌ Error fetching notifications:', error);
      throw error;
    }
  }

  async createNotification(notification: any): Promise<any> {
    try {
      await this.ensureConnection();

      const newNotification = new ComplianceNotification(notification);
      const savedNotification = await newNotification.save();

      return {
        id: (savedNotification._id as any).toString(),
        type: savedNotification.type,
        title: savedNotification.title,
        message: savedNotification.message,
        timestamp: savedNotification.timestamp,
        read: savedNotification.read,
        priority: savedNotification.priority,
        category: savedNotification.category,
        projectId: savedNotification.projectId,
        issueId: savedNotification.issueId,
        workflowId: savedNotification.workflowId,
        userId: savedNotification.userId,
        actions: savedNotification.actions,
        metadata: savedNotification.metadata
      };
    } catch (error) {
      logger.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await this.ensureConnection();
      await ComplianceNotification.findByIdAndUpdate(id, { read: true });
    } catch (error) {
      logger.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(projectId: string): Promise<void> {
    try {
      await this.ensureConnection();
      await ComplianceNotification.updateMany({ projectId }, { read: true });
    } catch (error) {
      logger.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnection();
      await mongoose.connection.db?.admin().ping();
      return true;
    } catch (error) {
      logger.error('❌ Compliance data service health check failed:', error);
      return false;
    }
  }
}