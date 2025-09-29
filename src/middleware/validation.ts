import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger.js';

export interface ValidationSchema {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
}

/**
 * Enhanced Validation Middleware for Phase 2 Structure
 * 
 * Comprehensive validation middleware that provides enhanced error handling,
 * logging, and integration with the new validation schemas.
 */

/**
 * Main validation middleware that can validate multiple parts of the request
 */
export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any[] = [];

    try {
      // Validate request body
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, { 
          abortEarly: false,
          stripUnknown: true 
        });
        if (error) {
          errors.push(...error.details.map(detail => ({
            field: 'body',
            message: detail.message,
            path: detail.path.join('.'),
            value: detail.context?.value
          })));
        } else {
          // Use validated and sanitized value
          req.body = value;
        }
      }

      // Validate request parameters
      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, { 
          abortEarly: false,
          stripUnknown: true 
        });
        if (error) {
          errors.push(...error.details.map(detail => ({
            field: 'params',
            message: detail.message,
            path: detail.path.join('.'),
            value: detail.context?.value
          })));
        } else {
          req.params = value;
        }
      }

      // Validate query parameters
      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, { 
          abortEarly: false,
          stripUnknown: true 
        });
        if (error) {
          errors.push(...error.details.map(detail => ({
            field: 'query',
            message: detail.message,
            path: detail.path.join('.'),
            value: detail.context?.value
          })));
        } else {
          req.query = value;
        }
      }

      // Validate headers
      if (schema.headers) {
        const { error, value } = schema.headers.validate(req.headers, { 
          abortEarly: false,
          stripUnknown: true 
        });
        if (error) {
          errors.push(...error.details.map(detail => ({
            field: 'headers',
            message: detail.message,
            path: detail.path.join('.'),
            value: detail.context?.value
          })));
        } else {
          req.headers = value;
        }
      }

      if (errors.length > 0) {
        logger.warn('Validation failed:', {
          url: req.url,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          errors
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: errors
          },
          timestamp: new Date().toISOString()
        });
      }

      next();
    } catch (error) {
      logger.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Validation processing failed'
        }
      });
    }
  };
};

/**
 * Validate request body only
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const formattedErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Body validation failed:', {
        url: req.url,
        method: req.method,
        errors: formattedErrors
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body validation failed',
          details: formattedErrors
        },
        timestamp: new Date().toISOString()
      });
    }
    
    req.body = value;
    next();
  };
};

/**
 * Validate query parameters only
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const formattedErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Query validation failed:', {
        url: req.url,
        method: req.method,
        errors: formattedErrors
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query parameters validation failed',
          details: formattedErrors
        },
        timestamp: new Date().toISOString()
      });
    }
    
    req.query = value;
    next();
  };
};

/**
 * Validate URL parameters only
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const formattedErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Params validation failed:', {
        url: req.url,
        method: req.method,
        errors: formattedErrors
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'URL parameters validation failed',
          details: formattedErrors
        },
        timestamp: new Date().toISOString()
      });
    }
    
    req.params = value;
    next();
  };
};

/**
 * Validate headers only
 */
export const validateHeaders = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.headers, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const formattedErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Headers validation failed:', {
        url: req.url,
        method: req.method,
        errors: formattedErrors
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Headers validation failed',
          details: formattedErrors
        },
        timestamp: new Date().toISOString()
      });
    }
    
    req.headers = value;
    next();
  };
};

/**
 * Validate file uploads
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'], required = false } = options;
    
    const files = req.files as Express.Multer.File[] | undefined;
    
    if (required && (!files || files.length === 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File upload is required',
          details: [{
            field: 'files',
            message: 'At least one file must be uploaded'
          }]
        }
      });
    }
    
    if (files && files.length > 0) {
      for (const file of files) {
        // Check file size
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'File size exceeds limit',
              details: [{
                field: 'files',
                message: `File ${file.originalname} exceeds maximum size of ${maxSize / 1024 / 1024}MB`
              }]
            }
          });
        }
        
        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid file type',
              details: [{
                field: 'files',
                message: `File ${file.originalname} has invalid type. Allowed types: ${allowedTypes.join(', ')}`
              }]
            }
          });
        }
      }
    }
    
    next();
  };
};

/**
 * Validate request size
 */
export const validateRequestSize = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: 'Request payload too large',
          details: [{
            field: 'content-length',
            message: `Request size ${contentLength} bytes exceeds maximum of ${maxSize} bytes`
          }]
        }
      });
    }
    
    next();
  };
};

/**
 * Validate JSON payload
 */
export const validateJSON = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: 'Content-Type must be application/json',
            details: [{
              field: 'content-type',
              message: 'Expected application/json content type'
            }]
          }
        });
      }
    }
    
    next();
  };
};

/**
 * Rate limiting validation
 */
export const validateRateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) => {
  const { windowMs, maxRequests, message = 'Too many requests' } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    // This is a simplified rate limiting validation
    // In production, you would use a proper rate limiting library like express-rate-limit
    
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    // This is just a placeholder - real implementation would use Redis or similar
    // For now, we'll just pass through
    next();
  };
};

/**
 * Common validation combinations
 */
export const commonValidations = {
  /**
   * Validate ObjectId parameter
   */
  objectIdParam: (paramName: string = 'id') => {
    return validateParams(Joi.object({
      [paramName]: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': `Invalid ${paramName} format`,
          'any.required': `${paramName} is required`
        })
    }));
  },
  
  /**
   * Validate pagination query
   */
  paginationQuery: () => {
    return validateQuery(Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sort: Joi.string().valid('created_at', 'updated_at', 'name', 'status').default('created_at'),
      order: Joi.string().valid('asc', 'desc').default('desc')
    }));
  },
  
  /**
   * Validate search query
   */
  searchQuery: () => {
    return validateQuery(Joi.object({
      search: Joi.string().trim().max(100).optional(),
      category: Joi.string().trim().max(50).optional(),
      status: Joi.string().valid('active', 'inactive', 'pending', 'completed', 'cancelled', 'archived').optional()
    }));
  }
};

/**
 * Validation error handler
 */
export const handleValidationError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof Joi.ValidationError) {
    const formattedErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    logger.warn('Validation error:', {
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
  
  next(error);
};

// Export all validation functions
export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  validateFileUpload,
  validateRequestSize,
  validateJSON,
  validateRateLimit,
  commonValidations,
  handleValidationError
};
