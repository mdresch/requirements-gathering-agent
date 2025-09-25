import { Request, Response, NextFunction } from 'express';
import { realTimeMetricsService } from '../services/RealTimeMetricsService.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware for tracking API usage metrics in real-time
 */
export function trackApiMetrics(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Add request ID to request object for use in other middleware
  req.requestId = requestId;
  
  // Track the request start
  realTimeMetricsService.trackApiUsage({
    endpoint: req.path,
    method: req.method,
    responseTime: 0, // Will be updated when response is sent
    statusCode: 0, // Will be updated when response is sent
    userId: (req as any).user?.id || req.headers['x-user-id'] as string,
    requestId: requestId
  });

  // Override res.end to capture response metrics
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    
    // Track the completed request
    realTimeMetricsService.trackApiUsage({
      endpoint: req.path,
      method: req.method,
      responseTime: responseTime,
      statusCode: res.statusCode,
      userId: (req as any).user?.id || req.headers['x-user-id'] as string,
      requestId: requestId
    });
    
    // Call the original end method and return its result
    return originalEnd.call(this, chunk, encoding);

    // Log the request if it's slow or has an error
    if (responseTime > 5000 || res.statusCode >= 400) {
      logger.warn('Slow or error request detected', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: responseTime,
        requestId: requestId,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

/**
 * Middleware for tracking user activity
 */
export function trackUserActivity(req: Request, res: Response, next: NextFunction): void {
  const userId = (req as any).user?.id || req.headers['x-user-id'] as string;
  const sessionId = req.headers['x-session-id'] as string || req.sessionID;
  
  if (userId) {
    // Track page/endpoint view
    realTimeMetricsService.trackUserActivity({
      userId: userId,
      sessionId: sessionId || 'unknown',
      timestamp: new Date(),
      activity: {
        type: 'page_view',
        component: req.path,
        duration: 0, // Could be tracked separately
        metadata: {
          method: req.method,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          referer: req.get('Referer')
        }
      }
    });
  }
  
  next();
}

/**
 * Middleware for tracking document generation activities
 */
export function trackDocumentGeneration(req: Request, res: Response, next: NextFunction): void {
  // This middleware will be used in document generation endpoints
  // It extracts relevant information from the request and tracks it
  
  if (req.path.includes('/document-generation') || req.path.includes('/generate')) {
    const userId = (req as any).user?.id || req.headers['x-user-id'] as string;
    const projectId = req.body?.projectId || req.params?.projectId;
    const templateId = req.body?.templateId || req.params?.templateId;
    
    // Track document generation request
    realTimeMetricsService.trackMetric({
      type: 'document_generation',
      component: 'document_generator',
      action: 'generation_requested',
      data: {
        templateId: templateId,
        projectId: projectId,
        requestBody: req.body ? Object.keys(req.body) : []
      },
      metadata: {
        userId: userId,
        projectId: projectId,
        requestId: req.requestId
      }
    });
  }
  
  next();
}

/**
 * Middleware for tracking template usage
 */
export function trackTemplateUsage(req: Request, res: Response, next: NextFunction): void {
  if (req.path.includes('/templates') && req.method === 'GET') {
    const userId = (req as any).user?.id || req.headers['x-user-id'] as string;
    const templateId = req.params?.id || req.query?.templateId;
    
    if (templateId) {
      realTimeMetricsService.trackTemplateUsage({
        templateId: templateId as string,
        timestamp: new Date(),
        usage: {
          type: 'viewed',
          userId: userId || 'anonymous',
          projectId: req.query?.projectId as string,
          success: true
        }
      });
    }
  }
  
  next();
}
