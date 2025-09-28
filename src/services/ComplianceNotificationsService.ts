// Phase 1: Compliance Notifications Service - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { ComplianceNotificationModel, IComplianceNotification } from '../models/ComplianceNotification.model.js';
import { logger } from '../utils/logger.js';

export interface NotificationsAnalytics {
  totalNotifications: number;
  unreadCount: number;
  notificationsByType: Record<string, number>;
  notificationsByCategory: Record<string, number>;
  notificationsByPriority: Record<string, number>;
  recentNotifications: IComplianceNotification[];
}

export class ComplianceNotificationsService {
  /**
   * Get notifications for a specific project or user
   */
  async getNotifications(filters?: {
    projectId?: string;
    userId?: string;
    read?: boolean;
    category?: string;
    priority?: string;
    limit?: number;
  }): Promise<IComplianceNotification[]> {
    try {
      const query: any = {};
      
      if (filters?.projectId) {
        query.projectId = filters.projectId;
      }
      if (filters?.userId) {
        query.userId = filters.userId;
      }
      if (filters?.read !== undefined) {
        query.read = filters.read;
      }
      if (filters?.category) {
        query.category = filters.category;
      }
      if (filters?.priority) {
        query.priority = filters.priority;
      }

      const limit = filters?.limit || 50;
      const notifications = await ComplianceNotificationModel
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit);

      logger.info(`🔔 Retrieved ${notifications.length} compliance notifications`);
      return notifications;
    } catch (error) {
      logger.error('❌ Error fetching compliance notifications:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics for notifications
   */
  async getAnalytics(projectId?: string, userId?: string): Promise<NotificationsAnalytics> {
    try {
      const matchQuery: any = {};
      if (projectId) {
        matchQuery.projectId = projectId;
      }
      if (userId) {
        matchQuery.userId = userId;
      }

      const pipeline = [
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: 1 },
            unreadCount: {
              $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
            },
            notifications: { $push: '$$ROOT' }
          }
        }
      ];

      const [analytics] = await ComplianceNotificationModel.aggregate(pipeline);
      
      if (!analytics) {
        return {
          totalNotifications: 0,
          unreadCount: 0,
          notificationsByType: {},
          notificationsByCategory: {},
          notificationsByPriority: {},
          recentNotifications: []
        };
      }

      // Calculate metrics
      const notificationsByType: Record<string, number> = {};
      const notificationsByCategory: Record<string, number> = {};
      const notificationsByPriority: Record<string, number> = {};

      analytics.notifications.forEach((notification: any) => {
        // Type counts
        notificationsByType[notification.type] = (notificationsByType[notification.type] || 0) + 1;
        
        // Category counts
        notificationsByCategory[notification.category] = (notificationsByCategory[notification.category] || 0) + 1;
        
        // Priority counts
        notificationsByPriority[notification.priority] = (notificationsByPriority[notification.priority] || 0) + 1;
      });

      // Get recent notifications
      const recentNotifications = analytics.notifications
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      logger.info(`🔔 Generated notifications analytics: ${analytics.totalNotifications} total, ${analytics.unreadCount} unread`);

      return {
        totalNotifications: analytics.totalNotifications,
        unreadCount: analytics.unreadCount,
        notificationsByType,
        notificationsByCategory,
        notificationsByPriority,
        recentNotifications
      };
    } catch (error) {
      logger.error('❌ Error generating notifications analytics:', error);
      throw error;
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(notificationData: {
    type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' | 'COMPLIANCE_UPDATE' | 'ISSUE_CREATED' | 'ISSUE_RESOLVED' | 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED' | 'SYSTEM';
    title: string;
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    category: 'COMPLIANCE' | 'ISSUE' | 'WORKFLOW' | 'SYSTEM' | 'USER';
    projectId?: string;
    issueId?: string;
    workflowId?: string;
    userId?: string;
    actions?: Array<{
      label: string;
      action: string;
      type: 'primary' | 'secondary' | 'danger';
    }>;
    metadata?: any;
  }): Promise<IComplianceNotification> {
    try {
      const notification = new ComplianceNotificationModel({
        ...notificationData,
        timestamp: new Date(),
        read: false
      });

      await notification.save();
      
      logger.info(`✅ Created compliance notification: ${notificationData.title}`);
      return notification;
    } catch (error) {
      logger.error('❌ Error creating compliance notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<IComplianceNotification | null> {
    try {
      const notification = await ComplianceNotificationModel.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );

      if (notification) {
        logger.info(`✅ Marked notification as read: ${notificationId}`);
      }
      
      return notification;
    } catch (error) {
      logger.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a project or user
   */
  async markAllAsRead(projectId?: string, userId?: string): Promise<number> {
    try {
      const query: any = { read: false };
      if (projectId) {
        query.projectId = projectId;
      }
      if (userId) {
        query.userId = userId;
      }

      const result = await ComplianceNotificationModel.updateMany(
        query,
        { read: true }
      );

      logger.info(`✅ Marked ${result.modifiedCount} notifications as read`);
      return result.modifiedCount;
    } catch (error) {
      logger.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const result = await ComplianceNotificationModel.findByIdAndDelete(notificationId);
      
      if (result) {
        logger.info(`✅ Deleted notification: ${notificationId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Create notifications for compliance events
   */
  async createComplianceEventNotification(eventData: {
    eventType: 'COMPLIANCE_UPDATE' | 'ISSUE_CREATED' | 'ISSUE_RESOLVED' | 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED';
    projectId: string;
    projectName: string;
    details: any;
    userId?: string;
  }): Promise<IComplianceNotification> {
    try {
      let title = '';
      let message = '';
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
      let category: 'COMPLIANCE' | 'ISSUE' | 'WORKFLOW' | 'SYSTEM' | 'USER' = 'COMPLIANCE';

      switch (eventData.eventType) {
        case 'COMPLIANCE_UPDATE':
          title = 'Compliance Score Updated';
          message = `Compliance score for project "${eventData.projectName}" has been updated.`;
          priority = 'MEDIUM';
          category = 'COMPLIANCE';
          break;
        case 'ISSUE_CREATED':
          title = 'New Compliance Issue';
          message = `A new compliance issue has been created for project "${eventData.projectName}".`;
          priority = 'HIGH';
          category = 'ISSUE';
          break;
        case 'ISSUE_RESOLVED':
          title = 'Compliance Issue Resolved';
          message = `A compliance issue has been resolved for project "${eventData.projectName}".`;
          priority = 'MEDIUM';
          category = 'ISSUE';
          break;
        case 'WORKFLOW_STARTED':
          title = 'Compliance Workflow Started';
          message = `A compliance workflow has been started for project "${eventData.projectName}".`;
          priority = 'MEDIUM';
          category = 'WORKFLOW';
          break;
        case 'WORKFLOW_COMPLETED':
          title = 'Compliance Workflow Completed';
          message = `A compliance workflow has been completed for project "${eventData.projectName}".`;
          priority = 'MEDIUM';
          category = 'WORKFLOW';
          break;
      }

      const notification = await this.createNotification({
        type: eventData.eventType,
        title,
        message,
        priority,
        category,
        projectId: eventData.projectId,
        userId: eventData.userId,
        metadata: {
          source: 'compliance-system',
          eventDetails: eventData.details
        }
      });

      return notification;
    } catch (error) {
      logger.error('❌ Error creating compliance event notification:', error);
      throw error;
    }
  }

  /**
   * Seed sample data for testing
   */
  async seedSampleData(): Promise<void> {
    try {
      const sampleNotifications = [
        {
          type: 'COMPLIANCE_UPDATE' as const,
          title: 'Compliance Score Updated',
          message: 'BABOK compliance score for Customer Portal Enhancement has improved from 82% to 87%.',
          priority: 'MEDIUM' as const,
          category: 'COMPLIANCE' as const,
          projectId: '68cc74380846c36e221ee391',
          metadata: { source: 'compliance-system', version: '1.0' }
        },
        {
          type: 'ISSUE_CREATED' as const,
          title: 'New Compliance Issue',
          message: 'A new HIGH severity issue has been created: "Missing stakeholder requirements".',
          priority: 'HIGH' as const,
          category: 'ISSUE' as const,
          projectId: '68cc74380846c36e221ee391',
          actions: [
            {
              label: 'View Issue',
              action: 'view_issue',
              type: 'primary' as const
            }
          ]
        },
        {
          type: 'WORKFLOW_STARTED' as const,
          title: 'Quality Review Workflow Started',
          message: 'A quality review workflow has been initiated for the Requirements Specification document.',
          priority: 'MEDIUM' as const,
          category: 'WORKFLOW' as const,
          projectId: '68cc74380846c36e221ee391',
          actions: [
            {
              label: 'View Workflow',
              action: 'view_workflow',
              type: 'secondary' as const
            }
          ]
        },
        {
          type: 'INFO' as const,
          title: 'System Maintenance Notice',
          message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST.',
          priority: 'LOW' as const,
          category: 'SYSTEM' as const,
          metadata: { source: 'system-admin', maintenanceWindow: '2024-01-20T02:00:00Z' }
        }
      ];

      // Clear existing sample data
      await ComplianceNotificationModel.deleteMany({ 
        metadata: { source: { $in: ['compliance-system', 'system-admin'] } }
      });
      
      // Insert sample data
      await ComplianceNotificationModel.insertMany(sampleNotifications);
      
      logger.info('✅ Seeded compliance notifications sample data');
    } catch (error) {
      logger.error('❌ Error seeding compliance notifications:', error);
      throw error;
    }
  }
}

export default new ComplianceNotificationsService();
