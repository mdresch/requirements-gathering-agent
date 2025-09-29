import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

/**
 * Comprehensive Input Sanitization Middleware
 * Provides XSS protection, NoSQL injection prevention, and input cleaning
 */

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Sanitization error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'SANITIZATION_ERROR',
        message: 'Input sanitization failed'
      }
    });
  }
};

/**
 * Recursively sanitize objects, arrays, and strings
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitize individual strings
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  let sanitized = str;

  // Remove potential script tags and dangerous HTML
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<link\b[^<]*>/gi, '');
  sanitized = sanitized.replace(/<meta\b[^<]*>/gi, '');
  
  // Remove dangerous JavaScript event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove potential NoSQL injection patterns
  sanitized = sanitized.replace(/\$where/gi, '');
  sanitized = sanitized.replace(/\$ne/gi, '');
  sanitized = sanitized.replace(/\$gt/gi, '');
  sanitized = sanitized.replace(/\$lt/gi, '');
  sanitized = sanitized.replace(/\$regex/gi, '');
  sanitized = sanitized.replace(/\$exists/gi, '');
  sanitized = sanitized.replace(/\$in/gi, '');
  sanitized = sanitized.replace(/\$nin/gi, '');
  sanitized = sanitized.replace(/\$or/gi, '');
  sanitized = sanitized.replace(/\$and/gi, '');
  sanitized = sanitized.replace(/\$not/gi, '');
  sanitized = sanitized.replace(/\$nor/gi, '');
  
  // Remove potential command injection patterns
  sanitized = sanitized.replace(/[;&|`$()]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Enhanced validation result handler
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : error.type,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    logger.warn('Validation failed:', {
      url: req.url,
      method: req.method,
      errors: formattedErrors
    });

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: formattedErrors
      },
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Common validation rules for reuse across endpoints
 */
export const commonValidations = {
  // ObjectId validation
  objectId: param('id').isMongoId().withMessage('Invalid ID format'),
  
  // Pagination validation
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  
  // Search validation
  search: query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be 1-100 characters'),
  
  // Sort validation
  sort: query('sort').optional().isIn(['created_at', 'updated_at', 'name', 'status']).withMessage('Invalid sort field'),
  
  // Order validation
  order: query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  
  // Category validation
  category: query('category').optional().isLength({ min: 1, max: 50 }).withMessage('Category must be 1-50 characters'),
  
  // Status validation
  status: query('status').optional().isIn(['active', 'inactive', 'deleted']).withMessage('Invalid status'),
  
  // Boolean validation
  boolean: (field: string) => query(field).optional().isBoolean().withMessage(`${field} must be a boolean`),
  
  // String validation with length limits
  string: (field: string, min: number = 1, max: number = 100) => 
    body(field).trim().isLength({ min, max }).withMessage(`${field} must be ${min}-${max} characters`),
  
  // Required string validation
  requiredString: (field: string, min: number = 1, max: number = 100) => 
    body(field).trim().isLength({ min, max }).notEmpty().withMessage(`${field} is required and must be ${min}-${max} characters`),
  
  // Email validation
  email: body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  
  // URL validation
  url: (field: string) => body(field).optional().isURL().withMessage(`${field} must be a valid URL`),
  
  // Date validation
  date: (field: string) => body(field).optional().isISO8601().withMessage(`${field} must be a valid date`),
  
  // Number validation
  number: (field: string, min?: number, max?: number) => {
    let validator = body(field).isNumeric().withMessage(`${field} must be a number`);
    if (min !== undefined) validator = validator.isFloat({ min }).withMessage(`${field} must be at least ${min}`);
    if (max !== undefined) validator = validator.isFloat({ max }).withMessage(`${field} must be at most ${max}`);
    return validator;
  }
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content security policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'"
  );
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  
  next();
};

/**
 * Rate limiting per endpoint
 */
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // This is a simplified rate limiter - in production, use redis-based rate limiting
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    
    // Store rate limit data in memory (use Redis in production)
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }
    
    const store = global.rateLimitStore;
    const record = store.get(key);
    
    if (!record) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: message || 'Too many requests, please try again later'
        },
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
};

/**
 * Input size validation
 */
export const validateInputSize = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request payload too large. Maximum size: ${maxSize} bytes`
        }
      });
    }
    
    next();
  };
};

/**
 * Content type validation
 */
export const validateContentType = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CONTENT_TYPE',
          message: 'Content-Type header is required'
        }
      });
    }
    
    const isValidType = allowedTypes.some(type => contentType.includes(type));
    
    if (!isValidType) {
      return res.status(415).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: `Content-Type must be one of: ${allowedTypes.join(', ')}`
        }
      });
    }
    
    next();
  };
};

// Extend global namespace for rate limiting
declare global {
  var rateLimitStore: Map<string, { count: number; resetTime: number }>;
}
