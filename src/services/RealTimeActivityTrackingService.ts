import DocumentAuditTrail from '../models/DocumentAuditTrail.model.js';
import { logger } from '../utils/logger.js';
import { WebSocket } from 'ws';

export interface UserActivity {
  userId: string;
  userName: string;
  userEmail: string;
  sessionId: string;
  activityType: 'PAGE_VIEW' | 'DOCUMENT_ACTION' | 'SEARCH' | 'NAVIGATION' | 'FORM_INTERACTION' | 'DOWNLOAD' | 'UPLOAD' | 'LOGIN' | 'LOGOUT';
  component: string;
  action: string;
  timestamp: Date;
  duration?: number;
  metadata: {
    page?: string;
    documentId?: string;
    documentName?: string;
    projectId?: string;
    searchQuery?: string;
    formData?: any;
    fileSize?: number;
    fileType?: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  };
}

export interface SessionTracking {
  sessionId: string;
  userId: string;
  userName: string;
  startTime: Date;
  lastActivity: Date;
  totalDuration: number;
  activities: UserActivity[];
  isActive: boolean;
  metadata: {
    ipAddress: string;
    userAgent: string;
    deviceType: string;
    browser: string;
    os: string;
  };
}

export class RealTimeActivityTrackingService {
  private static activeSessions: Map<string, SessionTracking> = new Map();
  private static connectedClients: Set<WebSocket> = new Set();
  private static activityBuffer: UserActivity[] = [];
  private static readonly BUFFER_SIZE = 100;
  private static readonly FLUSH_INTERVAL = 5000; // 5 seconds

  /**
   * Initialize the real-time tracking service
   */
  static initialize(): void {
    // Start periodic flush of activity buffer
    setInterval(() => {
      this.flushActivityBuffer();
    }, this.FLUSH_INTERVAL);

    // Clean up inactive sessions every minute
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 60000);

    logger.info('🔄 Real-time activity tracking service initialized');
  }

  /**
   * Track a user activity in real-time
   */
  static async trackActivity(activity: UserActivity): Promise<void> {
    try {
      // Add to buffer for batch processing
      this.activityBuffer.push(activity);

      // Update session tracking
      this.updateSessionTracking(activity);

      // Broadcast to connected clients
      this.broadcastActivity(activity);

      // Flush buffer if it's full
      if (this.activityBuffer.length >= this.BUFFER_SIZE) {
        await this.flushActivityBuffer();
      }

      logger.debug(`📊 Activity tracked: ${activity.userName} - ${activity.activityType} in ${activity.component}`);
    } catch (error) {
      logger.error('❌ Error tracking activity:', error);
    }
  }

  /**
   * Start a new user session
   */
  static async startSession(
    sessionId: string,
    userId: string,
    userName: string,
    userEmail: string,
    metadata: {
      ipAddress: string;
      userAgent: string;
      deviceType: string;
      browser: string;
      os: string;
    }
  ): Promise<void> {
    try {
      const session: SessionTracking = {
        sessionId,
        userId,
        userName,
        startTime: new Date(),
        lastActivity: new Date(),
        totalDuration: 0,
        activities: [],
        isActive: true,
        metadata
      };

      this.activeSessions.set(sessionId, session);

      // Log session start
      await this.trackActivity({
        userId,
        userName,
        userEmail,
        sessionId,
        activityType: 'LOGIN',
        component: 'auth',
        action: 'session_started',
        timestamp: new Date(),
        metadata: {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent
        }
      });

      logger.info(`🚀 Session started: ${userName} (${sessionId})`);
    } catch (error) {
      logger.error('❌ Error starting session:', error);
    }
  }

  /**
   * End a user session
   */
  static async endSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      session.isActive = false;
      session.totalDuration = Date.now() - session.startTime.getTime();

      // Log session end
      await this.trackActivity({
        userId: session.userId,
        userName: session.userName,
        userEmail: `${session.userName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        sessionId,
        activityType: 'LOGOUT',
        component: 'auth',
        action: 'session_ended',
        timestamp: new Date(),
        duration: session.totalDuration,
        metadata: {
          ipAddress: session.metadata.ipAddress,
          userAgent: session.metadata.userAgent
        }
      });

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      logger.info(`🏁 Session ended: ${session.userName} (${sessionId}) - Duration: ${Math.round(session.totalDuration / 1000)}s`);
    } catch (error) {
      logger.error('❌ Error ending session:', error);
    }
  }

  /**
   * Track page view activity
   */
  static async trackPageView(
    userId: string,
    userName: string,
    userEmail: string,
    sessionId: string,
    page: string,
    metadata?: any
  ): Promise<void> {
    await this.trackActivity({
      userId,
      userName,
      userEmail,
      sessionId,
      activityType: 'PAGE_VIEW',
      component: 'navigation',
      action: 'page_viewed',
      timestamp: new Date(),
      metadata: {
        page,
        ...metadata
      }
    });
  }

  /**
   * Track document action
   */
  static async trackDocumentAction(
    userId: string,
    userName: string,
    userEmail: string,
    sessionId: string,
    action: string,
    documentId: string,
    documentName: string,
    projectId: string,
    metadata?: any
  ): Promise<void> {
    await this.trackActivity({
      userId,
      userName,
      userEmail,
      sessionId,
      activityType: 'DOCUMENT_ACTION',
      component: 'document_manager',
      action,
      timestamp: new Date(),
      metadata: {
        documentId,
        documentName,
        projectId,
        ...metadata
      }
    });
  }

  /**
   * Track search activity
   */
  static async trackSearch(
    userId: string,
    userName: string,
    userEmail: string,
    sessionId: string,
    searchQuery: string,
    resultsCount: number,
    metadata?: any
  ): Promise<void> {
    await this.trackActivity({
      userId,
      userName,
      userEmail,
      sessionId,
      activityType: 'SEARCH',
      component: 'search',
      action: 'search_performed',
      timestamp: new Date(),
      metadata: {
        searchQuery,
        resultsCount,
        ...metadata
      }
    });
  }

  /**
   * Track form interaction
   */
  static async trackFormInteraction(
    userId: string,
    userName: string,
    userEmail: string,
    sessionId: string,
    formName: string,
    action: string,
    formData: any,
    metadata?: any
  ): Promise<void> {
    await this.trackActivity({
      userId,
      userName,
      userEmail,
      sessionId,
      activityType: 'FORM_INTERACTION',
      component: 'forms',
      action,
      timestamp: new Date(),
      metadata: {
        formName,
        formData,
        ...metadata
      }
    });
  }

  /**
   * Add WebSocket client for real-time updates
   */
  static addClient(ws: WebSocket): void {
    this.connectedClients.add(ws);
    logger.info(`🔌 WebSocket client connected. Total clients: ${this.connectedClients.size}`);

    // Send current active sessions
    ws.send(JSON.stringify({
      type: 'active_sessions',
      data: Array.from(this.activeSessions.values())
    }));
  }

  /**
   * Remove WebSocket client
   */
  static removeClient(ws: WebSocket): void {
    this.connectedClients.delete(ws);
    logger.info(`🔌 WebSocket client disconnected. Total clients: ${this.connectedClients.size}`);
  }

  /**
   * Get active sessions
   */
  static getActiveSessions(): SessionTracking[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get user activity analytics
   */
  static async getUserActivityAnalytics(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      const query: any = {
        'contextData.realTimeActivity': true
      };

      if (userId) {
        query.userId = userId;
      }

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = startDate;
        if (endDate) query.timestamp.$lte = endDate;
      }

      const activities = await DocumentAuditTrail.find(query)
        .sort({ timestamp: -1 })
        .limit(1000)
        .lean();

      const analytics = {
        totalActivities: activities.length,
        activitiesByType: {} as Record<string, number>,
        activitiesByComponent: {} as Record<string, number>,
        activitiesByUser: {} as Record<string, number>,
        activeSessions: this.activeSessions.size,
        sessionStats: {
          totalSessions: 0,
          averageSessionDuration: 0,
          longestSession: 0,
          shortestSession: Infinity
        },
        trends: {
          hourly: {} as Record<string, number>,
          daily: {} as Record<string, number>,
          weekly: {} as Record<string, number>
        },
        topPages: {} as Record<string, number>,
        topActions: {} as Record<string, number>,
        userEngagement: {} as Record<string, number>
      };

      let totalSessionDuration = 0;
      let sessionCount = 0;

      activities.forEach(activity => {
        const activityType = (activity.contextData as any)?.activityType || activity.action;
        const component = (activity.contextData as any)?.component || 'unknown';
        const userName = activity.userName;

        // Count by type
        analytics.activitiesByType[activityType] = (analytics.activitiesByType[activityType] || 0) + 1;
        analytics.activitiesByComponent[component] = (analytics.activitiesByComponent[component] || 0) + 1;
        if (userName) {
          analytics.activitiesByUser[userName] = (analytics.activitiesByUser[userName] || 0) + 1;
        }

        // Track pages
        const page = (activity.contextData as any)?.page;
        if (page) {
          analytics.topPages[page] = (analytics.topPages[page] || 0) + 1;
        }

        // Track actions
        analytics.topActions[activity.action] = (analytics.topActions[activity.action] || 0) + 1;

        // Session duration tracking
        const duration = (activity.contextData as any)?.duration;
        if (duration) {
          totalSessionDuration += duration;
          sessionCount++;
          analytics.sessionStats.longestSession = Math.max(analytics.sessionStats.longestSession, duration);
          analytics.sessionStats.shortestSession = Math.min(analytics.sessionStats.shortestSession, duration);
        }

        // Build trends
        const date = new Date(activity.timestamp);
        const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        const dayKey = date.toISOString().split('T')[0];
        const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

        analytics.trends.hourly[hourKey] = (analytics.trends.hourly[hourKey] || 0) + 1;
        analytics.trends.daily[dayKey] = (analytics.trends.daily[dayKey] || 0) + 1;
        analytics.trends.weekly[weekKey] = (analytics.trends.weekly[weekKey] || 0) + 1;
      });

      // Calculate session statistics
      analytics.sessionStats.totalSessions = sessionCount;
      analytics.sessionStats.averageSessionDuration = sessionCount > 0 ? totalSessionDuration / sessionCount : 0;
      analytics.sessionStats.shortestSession = analytics.sessionStats.shortestSession === Infinity ? 0 : analytics.sessionStats.shortestSession;

      return analytics;
    } catch (error) {
      logger.error('❌ Error generating user activity analytics:', error);
      return null;
    }
  }

  /**
   * Update session tracking
   */
  private static updateSessionTracking(activity: UserActivity): void {
    const session = this.activeSessions.get(activity.sessionId);
    if (session) {
      session.lastActivity = activity.timestamp;
      session.activities.push(activity);
      
      // Keep only last 100 activities per session
      if (session.activities.length > 100) {
        session.activities = session.activities.slice(-100);
      }
    }
  }

  /**
   * Broadcast activity to connected clients
   */
  private static broadcastActivity(activity: UserActivity): void {
    const message = JSON.stringify({
      type: 'activity_update',
      data: activity
    });

    this.connectedClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Flush activity buffer to database
   */
  private static async flushActivityBuffer(): Promise<void> {
    if (this.activityBuffer.length === 0) return;

    try {
      const activities = [...this.activityBuffer];
      this.activityBuffer = [];

      const auditEntries = activities.map(activity => ({
        documentId: (activity as any).documentId || 'system',
        documentName: `User Activity: ${activity.activityType}`,
        documentType: 'user_activity',
        projectId: activity.metadata.projectId || 'system',
        projectName: 'User Activity Tracking',
        action: activity.action,
        actionDescription: `${activity.userName} performed ${activity.activityType} in ${activity.component}`,
        userId: activity.userId,
        userName: activity.userName,
        userRole: 'User',
        userEmail: activity.userEmail,
        timestamp: activity.timestamp,
        severity: 'low',
        category: 'user',
        notes: `Real-time activity tracking: ${activity.activityType}`,
        tags: ['real-time', 'activity', 'user', activity.activityType.toLowerCase()],
        contextData: {
          realTimeActivity: true,
          activityType: activity.activityType,
          component: activity.component,
          sessionId: activity.sessionId,
          duration: activity.duration,
          ...activity.metadata
        }
      }));

      await DocumentAuditTrail.insertMany(auditEntries);
      logger.debug(`📊 Flushed ${activities.length} activities to database`);
    } catch (error) {
      logger.error('❌ Error flushing activity buffer:', error);
    }
  }

  /**
   * Clean up inactive sessions
   */
  private static cleanupInactiveSessions(): void {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity.getTime() > inactiveThreshold) {
        this.activeSessions.delete(sessionId);
        logger.debug(`🧹 Cleaned up inactive session: ${sessionId}`);
      }
    }
  }
}
