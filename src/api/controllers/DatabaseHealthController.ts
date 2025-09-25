import { Request, Response, NextFunction } from 'express';
import dbConnection from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export class DatabaseHealthController {
  /**
   * Get comprehensive database health status
   * GET /api/v1/health/database
   */
  static async getDatabaseHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      
      logger.info('Performing database health check', { requestId });
      
      const isHealthy = await dbConnection.healthCheck();
      
      // Determine HTTP status code based on health status
      const httpStatus = isHealthy ? 200 : 503;
      
      res.status(httpStatus).json({
        success: isHealthy,
        data: {
          database: {
            status: isHealthy ? 'healthy' : 'unhealthy',
            connectionState: isHealthy ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
          }
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Database health check failed', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_HEALTH_CHECK_FAILED',
          message: 'Database health check failed'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get database connection statistics
   * GET /api/v1/health/database/stats
   */
  static async getDatabaseStats(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      
      const connection = dbConnection.getConnection();
      const isActive = connection && connection.readyState === 1;
      
      res.json({
        success: true,
        data: {
          connection: {
            status: isActive ? 'connected' : 'disconnected',
            isActive,
            readyState: connection?.readyState || 0
          },
          timestamp: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Failed to get database stats', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_STATS_FAILED',
          message: 'Failed to retrieve database statistics'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Force database reconnection
   * POST /api/v1/health/database/reconnect
   */
  static async reconnectDatabase(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      
      logger.info('Attempting database reconnection', { requestId });
      
      // Disconnect first if connected
      const connection = dbConnection.getConnection();
      if (connection && connection.readyState === 1) {
        await dbConnection.disconnect();
      }
      
      // Reconnect
      await dbConnection.connect();
      
      // Verify connection
      const isHealthy = await dbConnection.healthCheck();
      
      res.json({
        success: isHealthy,
        data: {
          reconnection: {
            status: isHealthy ? 'healthy' : 'unhealthy',
            message: isHealthy ? 'Reconnection successful' : 'Reconnection completed with issues'
          }
        },
        requestId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      logger.error('Database reconnection failed', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_RECONNECTION_FAILED',
          message: 'Database reconnection failed'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
}

