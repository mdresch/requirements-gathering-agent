// Data quality audit routes
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// GET /api/v1/data-quality-audit/events - Get data quality events
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, severity, type } = req.query;
    
    // Build query filter
    const filter: any = {};
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    
    // Get data quality events
    const events = await mongoose.connection.db?.collection('data_quality_events')
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .toArray() || [];
    
    res.json({
      success: true,
      data: {
        events: events,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: events.length
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Data quality events endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATA_QUALITY_ERROR',
        message: 'Failed to retrieve data quality events'
      }
    });
  }
});

export default router;
