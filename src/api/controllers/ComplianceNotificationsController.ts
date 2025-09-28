// Phase 1: Compliance Notifications Controller - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { Request, Response } from 'express';
import ComplianceNotificationsService from '../../services/ComplianceNotificationsService.js';
import { logger } from '../../utils/logger.js';

export class ComplianceNotificationsController {
  /**
   * Get notifications analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.query;

      const analytics = await ComplianceNotificationsService.getAnalytics(
        projectId as string,
        userId as string
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('❌ Error in notifications analytics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get notifications with filters
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId, read, category, priority, limit } = req.query;

      const filters = {
        projectId: projectId as string,
        userId: userId as string,
        read: read === 'true' ? true : read === 'false' ? false : undefined,
        category: category as string,
        priority: priority as string,
        limit: limit ? parseInt(limit as string) : undefined
      };

      const notifications = await ComplianceNotificationsService.getNotifications(filters);

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      logger.error('❌ Error in get notifications:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new notification
   */
  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationData = req.body;

      const notification = await ComplianceNotificationsService.createNotification(notificationData);

      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      logger.error('❌ Error in create notification:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      const notification = await ComplianceNotificationsService.markAsRead(notificationId);

      if (!notification) {
        res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
        return;
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      logger.error('❌ Error in mark as read:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, userId } = req.query;

      const count = await ComplianceNotificationsService.markAllAsRead(
        projectId as string,
        userId as string
      );

      res.json({
        success: true,
        data: { updatedCount: count }
      });
    } catch (error) {
      logger.error('❌ Error in mark all as read:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      const deleted = await ComplianceNotificationsService.deleteNotification(notificationId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      logger.error('❌ Error in delete notification:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create compliance event notification
   */
  async createComplianceEventNotification(req: Request, res: Response): Promise<void> {
    try {
      const eventData = req.body;

      const notification = await ComplianceNotificationsService.createComplianceEventNotification(eventData);

      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      logger.error('❌ Error in create compliance event notification:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Seed sample data
   */
  async seedSampleData(req: Request, res: Response): Promise<void> {
    try {
      await ComplianceNotificationsService.seedSampleData();

      res.json({
        success: true,
        message: 'Sample data seeded successfully'
      });
    } catch (error) {
      logger.error('❌ Error in seed sample data:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new ComplianceNotificationsController();
