// Health check routes
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// GET /api/v1/health - Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GET /api/v1/health/database - Database health check
router.get('/database', async (req: Request, res: Response) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      res.json({
        success: true,
        status: 'connected',
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        status: 'disconnected',
        error: {
          code: 'DATABASE_DISCONNECTED',
          message: 'Database connection is not available'
        }
      });
    }
  } catch (error: any) {
    console.error('❌ Database health check error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_ERROR',
        message: 'Failed to check database health'
      }
    });
  }
});

export default router;