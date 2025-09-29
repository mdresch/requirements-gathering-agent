/**
 * Validation Library Index
 * 
 * Centralized export point for all validation utilities, schemas, and middleware.
 * This provides a single import point for the enhanced validation library.
 */

// Export all validation schemas
export {
  validationSchemas,
  commonSchemas,
  templateSchemas,
  projectSchemas,
  feedbackSchemas,
  categorySchemas,
  auditTrailSchemas,
  authSchemas
} from './schemas.js';

// Export all validation middleware
export {
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
  handleValidationError,
  type ValidationSchema
} from '../middleware/validation.js';

// Re-export existing enhanced schemas for backward compatibility
export {
  enhancedSchemas,
  templateSchemas as existingTemplateSchemas,
  projectSchemas as existingProjectSchemas,
  feedbackSchemas as existingFeedbackSchemas,
  categorySchemas as existingCategorySchemas,
  auditTrailSchemas as existingAuditTrailSchemas
} from '../api/validators/enhancedSchemas.js';

// Export validation utilities
export * from './utils.js';

// Default export with all validation utilities
export default {
  schemas: {
    common: commonSchemas,
    template: templateSchemas,
    project: projectSchemas,
    feedback: feedbackSchemas,
    category: categorySchemas,
    auditTrail: auditTrailSchemas,
    auth: authSchemas
  },
  middleware: {
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
  }
};
