import Joi from 'joi';

/**
 * Validation Utilities
 * 
 * Helper functions and utilities for validation operations.
 * Provides common validation patterns and helper functions.
 */

/**
 * Create a custom validation message
 */
export const createValidationMessage = (field: string, rule: string, value?: any): string => {
  const messages: Record<string, string> = {
    required: `${field} is required`,
    email: `${field} must be a valid email address`,
    min: `${field} must be at least ${value} characters long`,
    max: `${field} cannot exceed ${value} characters`,
    pattern: `${field} format is invalid`,
    integer: `${field} must be an integer`,
    number: `${field} must be a number`,
    date: `${field} must be a valid date`,
    url: `${field} must be a valid URL`,
    phone: `${field} must be a valid phone number`,
    objectId: `${field} must be a valid ObjectId`,
    enum: `${field} must be one of: ${Array.isArray(value) ? value.join(', ') : value}`
  };
  
  return messages[rule] || `${field} validation failed`;
};

/**
 * Create a Joi schema with custom messages
 */
export const createSchemaWithMessages = (schema: Joi.Schema, messages: Record<string, string>): Joi.Schema => {
  return schema.messages(messages);
};

/**
 * Validate ObjectId format
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate date format
 */
export const isValidDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate file type
 */
export const isValidFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

/**
 * Validate file size
 */
export const isValidFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

/**
 * Validate IP address
 */
export const isValidIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Validate hex color
 */
export const isValidHexColor = (color: string): boolean => {
  const hexColorRegex = /^#[0-9A-F]{6}$/i;
  return hexColorRegex.test(color);
};

/**
 * Validate UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Sanitize HTML input
 */
export const sanitizeHTML = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '');
};

/**
 * Sanitize JSON input
 */
export const sanitizeJSON = (input: any): any => {
  if (typeof input === 'string') {
    try {
      return JSON.parse(input);
    } catch {
      return null;
    }
  }
  return input;
};

/**
 * Create validation error response
 */
export const createValidationErrorResponse = (errors: any[]): any => {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: errors
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Create success response
 */
export const createSuccessResponse = (data: any, message?: string): any => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

/**
 * Validate array of items
 */
export const validateArray = <T>(items: T[], validator: (item: T) => boolean): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (let i = 0; i < items.length; i++) {
    if (!validator(items[i])) {
      errors.push(`Item at index ${i} is invalid`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate object properties
 */
export const validateObjectProperties = (obj: any, requiredProps: string[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const prop of requiredProps) {
    if (!(prop in obj) || obj[prop] === undefined || obj[prop] === null) {
      errors.push(`Property '${prop}' is required`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Create conditional validation
 */
export const createConditionalValidation = (condition: (value: any) => boolean, schema: Joi.Schema): Joi.Schema => {
  return Joi.when(Joi.ref('$'), {
    is: condition,
    then: schema,
    otherwise: Joi.any()
  });
};

/**
 * Validate against multiple schemas
 */
export const validateMultipleSchemas = (value: any, schemas: Joi.Schema[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const schema of schemas) {
    const { error } = schema.validate(value);
    if (error) {
      errors.push(...error.details.map(detail => detail.message));
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Create validation schema from model
 */
export const createSchemaFromModel = (model: any): Joi.Schema => {
  // This would need to be implemented based on your model structure
  // For now, return a basic object schema
  return Joi.object();
};

/**
 * Validate nested objects
 */
export const validateNestedObject = (obj: any, schema: Joi.Schema): { valid: boolean; errors: string[] } => {
  const { error } = schema.validate(obj);
  
  if (error) {
    return {
      valid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return {
    valid: true,
    errors: []
  };
};

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: any;
}

/**
 * Validate and transform data
 */
export const validateAndTransform = <T>(data: any, schema: Joi.Schema): ValidationResult => {
  const { error, value } = schema.validate(data, { stripUnknown: true });
  
  if (error) {
    return {
      valid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return {
    valid: true,
    errors: [],
    data: value as T
  };
};

// Export all utilities
export default {
  createValidationMessage,
  createSchemaWithMessages,
  isValidObjectId,
  isValidEmail,
  isValidUrl,
  isValidPhoneNumber,
  isValidDate,
  isValidPassword,
  isValidFileType,
  isValidFileSize,
  isValidIPAddress,
  isValidHexColor,
  isValidUUID,
  sanitizeString,
  sanitizeHTML,
  sanitizeJSON,
  createValidationErrorResponse,
  createSuccessResponse,
  validateArray,
  validateObjectProperties,
  createConditionalValidation,
  validateMultipleSchemas,
  createSchemaFromModel,
  validateNestedObject,
  validateAndTransform
};
