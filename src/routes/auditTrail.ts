// Audit trail routes
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// GET /api/v1/audit-trail/simple - Get simple audit trail
router.get('/simple', async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, action, userId, projectId } = req.query;
    
    // Build query filter
    const filter: any = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (projectId) filter.projectId = projectId;
    
    // Get audit trail entries
    const entries = await mongoose.connection.db?.collection('audit_trail')
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .toArray() || [];
    
    res.json({
      success: true,
      data: {
        entries: entries,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: entries.length
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Audit trail endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUDIT_TRAIL_ERROR',
        message: 'Failed to retrieve audit trail'
      }
    });
  }
});

export default router;
