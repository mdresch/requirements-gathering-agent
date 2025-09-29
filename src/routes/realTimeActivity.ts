// Real-time activity routes
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// GET /api/v1/real-time-activity/sessions - Get real-time activity sessions
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const { userId, projectId, limit = 50 } = req.query;
    
    // Build query filter
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (projectId) filter.projectId = projectId;
    
    // Get activity sessions
    const sessions = await mongoose.connection.db?.collection('activity_sessions')
      .find(filter)
      .sort({ lastActivity: -1 })
      .limit(Number(limit))
      .toArray() || [];
    
    res.json({
      success: true,
      data: {
        sessions: sessions
      }
    });
  } catch (error: any) {
    console.error('❌ Real-time activity sessions endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REAL_TIME_ACTIVITY_ERROR',
        message: 'Failed to retrieve real-time activity sessions'
      }
    });
  }
});

export default router;
