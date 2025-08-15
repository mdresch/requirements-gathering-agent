/**
 * Scope Control Validators
 * Validation middleware for scope control API endpoints
 * 
 * @description Provides validation functions for scope control requests
 * ensuring data integrity and PMBOK compliance
 * 
 * @version 1.0.0
 * @since 3.2.0
 */

import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { logger } from '../../utils/logger.js';

/**
 * Validate project ID parameter
 */
export const validateProjectId = [
  param('projectId')
    .isMongoId()
    .withMessage('Invalid project ID format'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validate scope change request
 */
export const validateScopeChangeRequest = [
  body('changeType')
    .isIn(['addition', 'reduction', 'modification', 'clarification'])
    .withMessage('Change type must be one of: addition, reduction, modification, clarification'),
  
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('requestedBy')
    .isLength({ min: 2, max: 100 })
    .withMessage('Requested by must be between 2 and 100 characters'),
  
  // Schedule Impact Validation
  body('impact.scheduleImpact.days')
    .isNumeric()
    .withMessage('Schedule impact days must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Schedule impact days cannot be negative');
      }
      return true;
    }),
  
  body('impact.scheduleImpact.percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Schedule impact percentage must be between 0 and 100'),
  
  body('impact.scheduleImpact.criticalPath')
    .isBoolean()
    .withMessage('Critical path impact must be a boolean'),
  
  // Cost Impact Validation
  body('impact.costImpact.amount')
    .isNumeric()
    .withMessage('Cost impact amount must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Cost impact amount cannot be negative');
      }
      return true;
    }),
  
  body('impact.costImpact.percentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Cost impact percentage must be between 0 and 100'),
  
  body('impact.costImpact.budgetCategory')
    .isLength({ min: 2, max: 50 })
    .withMessage('Budget category must be between 2 and 50 characters'),
  
  // Resource Impact Validation
  body('impact.resourceImpact.additionalResources')
    .isArray()
    .withMessage('Additional resources must be an array'),
  
  body('impact.resourceImpact.additionalResources.*')
    .isLength({ min: 2, max: 100 })
    .withMessage('Each additional resource must be between 2 and 100 characters'),
  
  body('impact.resourceImpact.skillsRequired')
    .isArray()
    .withMessage('Skills required must be an array'),
  
  body('impact.resourceImpact.skillsRequired.*')
    .isLength({ min: 2, max: 50 })
    .withMessage('Each skill must be between 2 and 50 characters'),
  
  body('impact.resourceImpact.availabilityImpact')
    .isBoolean()
    .withMessage('Availability impact must be a boolean'),
  
  // Quality Impact Validation
  body('impact.qualityImpact.riskToQuality')
    .isBoolean()
    .withMessage('Risk to quality must be a boolean'),
  
  body('impact.qualityImpact.testingImpact')
    .isBoolean()
    .withMessage('Testing impact must be a boolean'),
  
  body('impact.qualityImpact.acceptanceCriteriaChanges')
    .isBoolean()
    .withMessage('Acceptance criteria changes must be a boolean'),
  
  // Stakeholder Impact Validation
  body('impact.stakeholderImpact.affectedStakeholders')
    .isArray()
    .withMessage('Affected stakeholders must be an array'),
  
  body('impact.stakeholderImpact.affectedStakeholders.*')
    .isLength({ min: 2, max: 100 })
    .withMessage('Each stakeholder name must be between 2 and 100 characters'),
  
  body('impact.stakeholderImpact.communicationRequired')
    .isBoolean()
    .withMessage('Communication required must be a boolean'),
  
  body('impact.stakeholderImpact.approvalRequired')
    .isBoolean()
    .withMessage('Approval required must be a boolean'),
  
  // Custom validation for business logic
  body().custom((value, { req }) => {
    const { impact } = value;
    
    // Validate that high-impact changes have proper justification
    if (impact.scheduleImpact.percentage > 20 || impact.costImpact.percentage > 15) {
      if (!value.description || value.description.length < 50) {
        throw new Error('High-impact changes require detailed description (minimum 50 characters)');
      }
    }
    
    // Validate that critical path changes have stakeholder approval requirement
    if (impact.scheduleImpact.criticalPath && !impact.stakeholderImpact.approvalRequired) {
      throw new Error('Critical path changes must require stakeholder approval');
    }
    
    // Validate that quality risks have testing impact consideration
    if (impact.qualityImpact.riskToQuality && !impact.qualityImpact.testingImpact) {
      logger.warn('Quality risk identified without testing impact consideration');
    }
    
    return true;
  }),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Scope change validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Scope change validation failed',
        errors: errors.array(),
        pmbokGuidance: {
          message: 'Ensure all scope changes follow PMBOK standards',
          requirements: [
            'Complete impact analysis required',
            'Stakeholder identification mandatory',
            'Risk assessment must be thorough',
            'Documentation must be comprehensive'
          ]
        }
      });
    }
    next();
  }
];

/**
 * Validate scope control settings
 */
export const validateScopeControlSettings = [
  body('settings.autoApprovalThreshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Auto approval threshold must be between 0 and 1'),
  
  body('settings.escalationThreshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Escalation threshold must be between 0 and 1'),
  
  body('settings.scopeCreepThreshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Scope creep threshold must be between 0 and 1'),
  
  body('settings.monitoringFrequency')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Monitoring frequency must be between 1 and 1440 minutes'),
  
  body('settings.stakeholderNotificationEnabled')
    .optional()
    .isBoolean()
    .withMessage('Stakeholder notification enabled must be a boolean'),
  
  body('settings.pmbokValidationEnabled')
    .optional()
    .isBoolean()
    .withMessage('PMBOK validation enabled must be a boolean'),
  
  body('settings.predictiveAnalyticsEnabled')
    .optional()
    .isBoolean()
    .withMessage('Predictive analytics enabled must be a boolean'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Settings validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validate change approval request
 */
export const validateChangeApproval = [
  param('changeId')
    .isLength({ min: 10 })
    .withMessage('Invalid change ID format'),
  
  body('approvedBy')
    .isLength({ min: 2, max: 100 })
    .withMessage('Approver name must be between 2 and 100 characters'),
  
  body('approvalComments')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Approval comments must not exceed 500 characters'),
  
  body('conditionalApproval')
    .optional()
    .isBoolean()
    .withMessage('Conditional approval must be a boolean'),
  
  body('conditions')
    .optional()
    .isArray()
    .withMessage('Conditions must be an array'),
  
  body('conditions.*')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Each condition must be between 5 and 200 characters'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Approval validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * PMBOK Compliance Validator
 * Ensures scope changes meet PMBOK standards
 */
export const validatePMBOKCompliance = (req: Request, res: Response, next: NextFunction) => {
  const { changeType, impact, description } = req.body;
  
  const complianceIssues: string[] = [];
  
  // PMBOK 7.3.2.1 - Scope Change Control
  if (!description || description.length < 20) {
    complianceIssues.push('PMBOK 7.3.2.1: Scope changes require detailed description');
  }
  
  // PMBOK 7.3.2.2 - Impact Analysis
  if (!impact || !impact.scheduleImpact || !impact.costImpact) {
    complianceIssues.push('PMBOK 7.3.2.2: Complete impact analysis required');
  }
  
  // PMBOK 7.3.2.3 - Stakeholder Involvement
  if (!impact?.stakeholderImpact?.affectedStakeholders?.length) {
    complianceIssues.push('PMBOK 7.3.2.3: Stakeholder impact analysis required');
  }
  
  // PMBOK 7.3.2.4 - Risk Assessment
  if (impact?.scheduleImpact?.percentage > 10 && !impact?.qualityImpact?.riskToQuality) {
    complianceIssues.push('PMBOK 7.3.2.4: High-impact changes require risk assessment');
  }
  
  // PMBOK 7.3.2.5 - Documentation Standards
  if (changeType === 'addition' && (!impact?.resourceImpact?.additionalResources?.length)) {
    complianceIssues.push('PMBOK 7.3.2.5: Scope additions require resource impact analysis');
  }
  
  if (complianceIssues.length > 0) {
    logger.warn('PMBOK compliance issues detected:', complianceIssues);
    return res.status(400).json({
      success: false,
      message: 'PMBOK compliance validation failed',
      complianceIssues,
      pmbokReference: 'PMBOK Guide 7th Edition - Section 7.3.2 Control Scope',
      recommendations: [
        'Review PMBOK scope management standards',
        'Ensure complete impact analysis',
        'Include all affected stakeholders',
        'Provide comprehensive documentation'
      ]
    });
  }
  
  next();
};

/**
 * Validate scope metrics request
 */
export const validateScopeMetricsRequest = [
  param('projectId')
    .isMongoId()
    .withMessage('Invalid project ID format'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Metrics request validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];