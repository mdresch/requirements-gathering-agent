import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../../utils/logger.js';

export interface ValidationSchema {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
}

/**
 * Enhanced validation middleware with better error handling
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
