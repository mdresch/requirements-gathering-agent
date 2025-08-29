import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../../config/logger.js';

export interface ValidationSchema {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any[] = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push({
          field: 'body',
          message: error.details[0].message,
          path: error.details[0].path
        });
      }
    }

    // Validate request parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push({
          field: 'params',
          message: error.details[0].message,
          path: error.details[0].path
        });
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push({
          field: 'query',
          message: error.details[0].message,
          path: error.details[0].path
        });
      }
    }

    // Validate headers
    if (schema.headers) {
      const { error } = schema.headers.validate(req.headers);
      if (error) {
        errors.push({
          field: 'headers',
          message: error.details[0].message,
          path: error.details[0].path
        });
      }
    }

    if (errors.length > 0) {
      logger.warn('Validation failed:', {
        url: req.url,
        method: req.method,
        errors
      });

      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    next();
  };
};
