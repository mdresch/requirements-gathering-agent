import { UserSession } from '../models/UserSession.model.js';
import { realTimeMetricsService } from './RealTimeMetricsService.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * User Session Service
 * Manages user sessions and tracks user activity in real-time
 */

export interface SessionActivity {
  type: 'page_view' | 'document_created' | 'template_used' | 'search' | 'download' | 'upload' | 'login' | 'logout';
  component: string;
  duration?: number;
  metadata?: any;
}

export class UserSessionService {
  /**
   * Start a new user session
   */
  public static async startSession(data: {
    userId: string;
    ipAddress: string;
    userAgent: string;
    referer?: string;
    browser?: string;
    os?: string;
    device?: string;
    country?: string;
    city?: string;
  }): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${uuidv4().substring(0, 8)}`;
      
      // End any existing active sessions for this user
      await UserSession.updateMany(
        { userId: data.userId, isActive: true },
        { isActive: false, endTime: new Date() }
      );
      
      const session = new UserSession({
        userId: data.userId,
        sessionId: sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        startTime: new Date(),
        lastActivity: new Date(),
        isActive: true,
        activities: [],
        metadata: {
          referer: data.referer,
          browser: data.browser,
          os: data.os,
          device: data.device,
          country: data.country,
          city: data.city
        }
      });
      
      await session.save();
      
      // Track login activity
      await this.trackActivity(sessionId, {
        type: 'login',
        component: 'authentication',
        metadata: {
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        }
      });
      
      logger.info('User session started', {
        userId: data.userId,
        sessionId: sessionId,
        ipAddress: data.ipAddress
      });
      
      return sessionId;
      
    } catch (error: any) {
      logger.error('Failed to start user session:', error);
      throw error;
    }
  }
  
  /**
   * Track user activity
   */
  public static async trackActivity(sessionId: string, activity: SessionActivity): Promise<void> {
    try {
      const session = await UserSession.findOne({ sessionId, isActive: true });
      
      if (!session) {
        logger.warn('Session not found or inactive', { sessionId });
        return;
      }
      
      // Add activity to session
      await session.addActivity(activity);
      
      // Track in real-time metrics
      realTimeMetricsService.trackUserActivity({
        userId: session.userId,
        sessionId: sessionId,
        timestamp: new Date(),
        activity: activity
      });
      
      logger.debug('User activity tracked', {
        sessionId: sessionId,
        userId: session.userId,
        activityType: activity.type,
        component: activity.component
      });
      
    } catch (error: any) {
      logger.error('Failed to track user activity:', error);
      throw error;
    }
  }
  
  /**
   * End a user session
   */
  public static async endSession(sessionId: string): Promise<void> {
    try {
      const session = await UserSession.findOne({ sessionId, isActive: true });
      
      if (!session) {
        logger.warn('Session not found or already ended', { sessionId });
        return;
      }
      
      // Track logout activity
      await this.trackActivity(sessionId, {
        type: 'logout',
        component: 'authentication',
        metadata: {}
      });
      
      // End the session
      await session.endSession();
      
      logger.info('User session ended', {
        userId: session.userId,
        sessionId: sessionId,
        duration: session.endTime!.getTime() - session.startTime.getTime()
      });
      
    } catch (error: any) {
      logger.error('Failed to end user session:', error);
      throw error;
    }
  }
  
  /**
   * Get active sessions for a user
   */
  public static async getActiveSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await UserSession.getActiveSessions(userId);
      return sessions.map(session => ({
        sessionId: session.sessionId,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        activitiesCount: session.activities.length,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        metadata: session.metadata
      }));
    } catch (error: any) {
      logger.error('Failed to get active sessions:', error);
      throw error;
    }
  }
  
  /**
   * Get session analytics
   */
  public static async getSessionAnalytics(userId?: string, days: number = 30): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageSessionDuration: number;
    mostActiveComponents: Array<{ component: string; count: number }>;
    activityTypes: Array<{ type: string; count: number }>;
    uniqueUsers: number;
  }> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const matchStage: any = {
        startTime: { $gte: startDate }
      };
      
      if (userId) {
        matchStage.userId = userId;
      }
      
      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            activeSessions: { $sum: { $cond: ['$isActive', 1, 0] } },
            averageSessionDuration: {
              $avg: {
                $cond: [
                  { $ne: ['$endTime', null] },
                  { $subtract: ['$endTime', '$startTime'] },
                  null
                ]
              }
            },
            allActivities: { $push: '$activities' },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            totalSessions: 1,
            activeSessions: 1,
            averageSessionDuration: 1,
            uniqueUsersCount: { $size: '$uniqueUsers' },
            allActivities: { $reduce: {
              input: '$allActivities',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }}
          }
        }
      ];
      
      const result = await UserSession.aggregate(pipeline);
      const data = result[0] || {
        totalSessions: 0,
        activeSessions: 0,
        averageSessionDuration: 0,
        uniqueUsersCount: 0,
        allActivities: []
      };
      
      // Analyze activity types and components
      const activityTypes: Record<string, number> = {};
      const components: Record<string, number> = {};
      
      data.allActivities.forEach((activity: any) => {
        activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
        components[activity.component] = (components[activity.component] || 0) + 1;
      });
      
      const mostActiveComponents = Object.entries(components)
        .map(([component, count]) => ({ component, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const activityTypesArray = Object.entries(activityTypes)
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count);
      
      return {
        totalSessions: data.totalSessions,
        activeSessions: data.activeSessions,
        averageSessionDuration: Math.round(data.averageSessionDuration || 0),
        mostActiveComponents,
        activityTypes: activityTypesArray,
        uniqueUsers: data.uniqueUsersCount
      };
      
    } catch (error: any) {
      logger.error('Failed to get session analytics:', error);
      throw error;
    }
  }
  
  /**
   * Cleanup inactive sessions
   */
  public static async cleanupInactiveSessions(inactiveThresholdMinutes: number = 30): Promise<number> {
    try {
      const result = await UserSession.cleanupInactiveSessions(inactiveThresholdMinutes);
      logger.info(`Cleaned up ${result.modifiedCount} inactive sessions`);
      return result.modifiedCount || 0;
    } catch (error: any) {
      logger.error('Failed to cleanup inactive sessions:', error);
      throw error;
    }
  }
  
  /**
   * Get user activity timeline
   */
  public static async getUserActivityTimeline(
    userId: string, 
    days: number = 7
  ): Promise<Array<{
    date: string;
    sessions: number;
    activities: number;
    components: string[];
  }>> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const pipeline = [
        {
          $match: {
            userId: userId,
            startTime: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$startTime' },
              month: { $month: '$startTime' },
              day: { $dayOfMonth: '$startTime' }
            },
            sessions: { $sum: 1 },
            activities: { $sum: { $size: '$activities' } },
            components: { $addToSet: { $arrayElemAt: ['$activities.component', 0] } }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ];
      
      const result = await UserSession.aggregate(pipeline);
      
      return result.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        sessions: item.sessions,
        activities: item.activities,
        components: item.components.filter(Boolean)
      }));
      
    } catch (error: any) {
      logger.error('Failed to get user activity timeline:', error);
      throw error;
    }
  }
}
