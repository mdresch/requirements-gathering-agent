// Project Validation Middleware
// filepath: src/api/validators/projectValidators.ts

import { body, param, query } from 'express-validator';

export const validateCreateProject = [
  body('name')
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Project name must be between 3 and 200 characters')
    .trim(),
  
  body('description')
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Project description must be between 10 and 1000 characters')
    .trim(),
  
  body('framework')
    .notEmpty()
    .withMessage('Framework is required')
    .isIn(['babok', 'pmbok', 'multi'])
    .withMessage('Framework must be one of: babok, pmbok, multi'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'review', 'completed', 'archived'])
    .withMessage('Status must be one of: draft, active, review, completed, archived'),
  
  body('owner')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Owner name must not exceed 100 characters')
    .trim(),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  
  body('documents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Documents count must be a non-negative integer'),
  
  body('stakeholders')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stakeholders count must be a non-negative integer'),
  
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code (e.g., USD, EUR)')
    .isAlpha()
    .withMessage('Currency must contain only letters'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        const start = new Date(req.body.startDate);
        const end = new Date(endDate);
        if (end <= start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      if (tags && tags.some((tag: string) => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    })
];

export const validateUpdateProject = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID format'),
  
  body('name')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Project name must be between 3 and 200 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Project description must be between 10 and 1000 characters')
    .trim(),
  
  body('framework')
    .optional()
    .isIn(['babok', 'pmbok', 'multi'])
    .withMessage('Framework must be one of: babok, pmbok, multi'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'review', 'completed', 'archived'])
    .withMessage('Status must be one of: draft, active, review, completed, archived'),
  
  body('owner')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Owner name must not exceed 100 characters')
    .trim(),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  
  body('documents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Documents count must be a non-negative integer'),
  
  body('stakeholders')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stakeholders count must be a non-negative integer'),
  
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-character code (e.g., USD, EUR)')
    .isAlpha()
    .withMessage('Currency must contain only letters'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        const start = new Date(req.body.startDate);
        const end = new Date(endDate);
        if (end <= start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      if (tags && tags.some((tag: string) => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    })
];

export const validateProjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID format')
];

export const validateProjectQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['draft', 'active', 'review', 'completed', 'archived'])
    .withMessage('Status must be one of: draft, active, review, completed, archived'),
  
  query('framework')
    .optional()
    .isIn(['babok', 'pmbok', 'multi'])
    .withMessage('Framework must be one of: babok, pmbok, multi'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt', 'complianceScore', 'status'])
    .withMessage('SortBy must be one of: name, createdAt, updatedAt, complianceScore, status'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either asc or desc'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .trim(),
  
  query('owner')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Owner filter must be between 1 and 100 characters')
    .trim()
];

