import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { logger } from '../../config/logger.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      apiKey?: string;
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'service';
  permissions: string[];
}

// Simple API key authentication for development
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;

    // Skip auth for health checks and development
    if (req.path.includes('/health') || process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
      return next();
    }

    // Check for API key first (simpler authentication)
    if (apiKey) {
      const validApiKeys = process.env.API_KEYS?.split(',') || ['dev-api-key-123'];
      
      if (validApiKeys.includes(apiKey)) {
        req.user = {
          id: 'api-user',
          email: 'api@adpa.io',
          role: 'service',
          permissions: ['read', 'write', 'admin']
        } as AuthenticatedUser;
        
        req.apiKey = apiKey;
        logger.debug(`API key authentication successful for ${req.method} ${req.path}`);
        return next();
      } else {
        logger.warn(`Invalid API key attempted: ${apiKey.substring(0, 8)}...`);
        return res.status(401).json({
          error: true,
          message: 'Invalid API key',
          code: 'INVALID_API_KEY'
        });
      }
    }

    // Check for JWT token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET || 'development-secret-key';

      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        req.user = {
          id: decoded.sub || decoded.id,
          email: decoded.email,
          role: decoded.role || 'user',
          permissions: decoded.permissions || ['read']
        } as AuthenticatedUser;

        logger.debug(`JWT authentication successful for user ${req.user.email}`);
        return next();
      } catch (jwtError) {
        logger.warn(`Invalid JWT token: ${(jwtError as Error).message}`);
        return res.status(401).json({
          error: true,
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
      }
    }

    // No authentication provided
    logger.warn(`No authentication provided for ${req.method} ${req.path}`);
    return res.status(401).json({
      error: true,
      message: 'Authentication required. Provide either X-API-Key header or Authorization Bearer token.',
      code: 'AUTHENTICATION_REQUIRED',
      hint: process.env.NODE_ENV === 'development' ? 'Use X-API-Key: dev-api-key-123 for development' : undefined
    });

  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      error: true,
      message: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.email} with role ${req.user.role}. Required: ${roles.join(', ')}`);
      return res.status(403).json({
        error: true,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!req.user.permissions.includes(permission) && !req.user.permissions.includes('admin')) {
      logger.warn(`Access denied for user ${req.user.email}. Missing permission: ${permission}`);
      return res.status(403).json({
        error: true,
        message: `Access denied. Required permission: ${permission}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Alias for backward compatibility
export const apiKeyAuth = authMiddleware;
