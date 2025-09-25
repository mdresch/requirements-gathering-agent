import express from 'express';
import { WebSocketServer } from 'ws';
import { RealTimeActivityTrackingService } from '../../services/RealTimeActivityTrackingService.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * POST /api/v1/real-time-activity/track
 * Track a user activity
 */
router.post('/track', async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      sessionId,
      activityType,
      component,
      action,
      duration,
      metadata
    } = req.body;

    if (!userId || !userName || !userEmail || !sessionId || !activityType || !component || !action) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, userName, userEmail, sessionId, activityType, component, action'
      });
    }

    await RealTimeActivityTrackingService.trackActivity({
      userId,
      userName,
      userEmail,
      sessionId,
      activityType,
      component,
      action,
      timestamp: new Date(),
      duration,
      metadata: metadata || {}
    });

    res.json({
      success: true,
      message: 'Activity tracked successfully'
    });
  } catch (error) {
    logger.error('❌ Error tracking activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/real-time-activity/session/start
 * Start a new user session
 */
router.post('/session/start', async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      userName,
      userEmail,
      metadata
    } = req.body;

    if (!sessionId || !userId || !userName || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sessionId, userId, userName, userEmail'
      });
    }

    const sessionMetadata = {
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      deviceType: 'desktop', // Could be enhanced with device detection
      browser: 'unknown', // Could be enhanced with browser detection
      os: 'unknown', // Could be enhanced with OS detection
      ...metadata
    };

    await RealTimeActivityTrackingService.startSession(
      sessionId,
      userId,
      userName,
      userEmail,
      sessionMetadata
    );

    res.json({
      success: true,
      message: 'Session started successfully',
      data: {
        sessionId,
        startTime: new Date()
      }
    });
  } catch (error) {
    logger.error('❌ Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/real-time-activity/session/end
 * End a user session
 */
router.post('/session/end', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: sessionId'
      });
    }

    await RealTimeActivityTrackingService.endSession(sessionId);

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    logger.error('❌ Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/real-time-activity/track/page-view
 * Track a page view
 */
router.post('/track/page-view', async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      sessionId,
      page,
      metadata
    } = req.body;

    if (!userId || !userName || !userEmail || !sessionId || !page) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, userName, userEmail, sessionId, page'
      });
    }

    await RealTimeActivityTrackingService.trackPageView(
      userId,
      userName,
      userEmail,
      sessionId,
      page,
      metadata
    );

    res.json({
      success: true,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    logger.error('❌ Error tracking page view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track page view',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/real-time-activity/track/document-action
 * Track a document action
 */
router.post('/track/document-action', async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      sessionId,
      action,
      documentId,
      documentName,
      projectId,
      metadata
    } = req.body;

    if (!userId || !userName || !userEmail || !sessionId || !action || 
        !documentId || !documentName || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, userName, userEmail, sessionId, action, documentId, documentName, projectId'
      });
    }

    await RealTimeActivityTrackingService.trackDocumentAction(
      userId,
      userName,
      userEmail,
      sessionId,
      action,
      documentId,
      documentName,
      projectId,
      metadata
    );

    res.json({
      success: true,
      message: 'Document action tracked successfully'
    });
  } catch (error) {
    logger.error('❌ Error tracking document action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track document action',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/real-time-activity/track/search
 * Track a search activity
 */
router.post('/track/search', async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      sessionId,
      searchQuery,
      resultsCount,
      metadata
    } = req.body;

    if (!userId || !userName || !userEmail || !sessionId || !searchQuery || 
        resultsCount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, userName, userEmail, sessionId, searchQuery, resultsCount'
      });
    }

    await RealTimeActivityTrackingService.trackSearch(
      userId,
      userName,
      userEmail,
      sessionId,
      searchQuery,
      resultsCount,
      metadata
    );

    res.json({
      success: true,
      message: 'Search activity tracked successfully'
    });
  } catch (error) {
    logger.error('❌ Error tracking search activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track search activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/real-time-activity/sessions
 * Get active sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = RealTimeActivityTrackingService.getActiveSessions();

    res.json({
      success: true,
      message: 'Active sessions retrieved successfully',
      data: {
        sessions,
        total: sessions.length
      }
    });
  } catch (error) {
    logger.error('❌ Error fetching active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/real-time-activity/analytics
 * Get user activity analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const {
      userId,
      startDate,
      endDate
    } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const analytics = await RealTimeActivityTrackingService.getUserActivityAnalytics(
      userId as string,
      start,
      end
    );

    if (!analytics) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate user activity analytics'
      });
    }

    res.json({
      success: true,
      message: 'User activity analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    logger.error('❌ Error fetching user activity analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user activity analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Setup WebSocket server for real-time updates
 */
export function setupWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server, path: '/ws/activity' });

  wss.on('connection', (ws) => {
    logger.info('🔌 WebSocket client connected for real-time activity tracking');
    
    RealTimeActivityTrackingService.addClient(ws);

    ws.on('close', () => {
      logger.info('🔌 WebSocket client disconnected from real-time activity tracking');
      RealTimeActivityTrackingService.removeClient(ws);
    });

    ws.on('error', (error) => {
      logger.error('❌ WebSocket error:', error);
      RealTimeActivityTrackingService.removeClient(ws);
    });
  });

  return wss;
}

export default router;
