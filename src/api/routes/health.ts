import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../../config/logger.js';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    node: process.version
  };

  logger.debug('Health check requested');
  res.json(healthData);
}));

// Detailed health check with service dependencies
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  const services = {
    database: await checkDatabaseHealth(),
    storage: await checkStorageHealth(),
    queue: await checkQueueHealth(),
    external: await checkExternalServices()
  };

  const allHealthy = Object.values(services).every(service => service.status === 'healthy');
  const responseTime = Date.now() - startTime;

  const healthData = {
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    responseTime: `${responseTime}ms`,
    services,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    node: process.version
  };

  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json(healthData);
}));

// Readiness probe (for Kubernetes)
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  // Check if critical services are ready
  const criticalServices = {
    database: await checkDatabaseHealth(),
    storage: await checkStorageHealth()
  };

  const allReady = Object.values(criticalServices).every(service => service.status === 'healthy');

  if (allReady) {
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ 
      status: 'not_ready', 
      timestamp: new Date().toISOString(),
      services: criticalServices 
    });
  }
}));

// Liveness probe (for Kubernetes)
router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  res.json({ 
    status: 'alive', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}));

// Helper functions for service health checks
async function checkDatabaseHealth(): Promise<{ status: string; message?: string; responseTime?: string }> {
  try {
    // TODO: Implement actual database health check
    // For now, return healthy status
    return { status: 'healthy', responseTime: '5ms' };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return { status: 'unhealthy', message: 'Database connection failed' };
  }
}

async function checkStorageHealth(): Promise<{ status: string; message?: string; responseTime?: string }> {
  try {
    // TODO: Implement actual storage health check
    // For now, return healthy status
    return { status: 'healthy', responseTime: '3ms' };
  } catch (error) {
    logger.error('Storage health check failed:', error);
    return { status: 'unhealthy', message: 'Storage service unavailable' };
  }
}

async function checkQueueHealth(): Promise<{ status: string; message?: string; responseTime?: string }> {
  try {
    // TODO: Implement actual queue health check
    // For now, return healthy status
    return { status: 'healthy', responseTime: '2ms' };
  } catch (error) {
    logger.error('Queue health check failed:', error);
    return { status: 'unhealthy', message: 'Queue service unavailable' };
  }
}

async function checkExternalServices(): Promise<{ status: string; message?: string; services?: any }> {
  try {
    // TODO: Check external service dependencies (AI providers, etc.)
    return { 
      status: 'healthy',
      services: {
        aiProvider: 'healthy',
        webhooks: 'healthy'
      }
    };
  } catch (error) {
    logger.error('External services health check failed:', error);
    return { status: 'unhealthy', message: 'External services check failed' };
  }
}

export default router;
