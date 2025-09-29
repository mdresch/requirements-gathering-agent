/**
 * Centralized Model Exports
 * 
 * This file provides a single point of import for all Mongoose models
 * in the application, ensuring consistency and making it easier to
 * manage model dependencies.
 * 
 * Usage:
 * import { TemplateModel, ProjectModel, CategoryModel } from '../models';
 * 
 * Or import specific models:
 * import { TemplateModel } from '../models/Template.model';
 */

import { Schema } from 'mongoose';

// Core Models (Phase 1 Foundation)
export { TemplateModel } from './Template.model.js';
export type { ITemplate } from './Template.model.js';
export { ProjectModel } from './Project.model.js';
export type { IProject } from './Project.model.js';
export { CategoryModel } from './Category.model.js';
export type { ICategory } from './Category.model.js';
export { FeedbackModel } from './Feedback.model.js';
export type { IFeedback } from './Feedback.model.js';
export { AuditTrailModel } from './AuditTrail.model.js';
export type { IAuditTrail } from './AuditTrail.model.js';
export { StakeholderModel } from './Stakeholder.model.js';
export type { IStakeholder } from './Stakeholder.model.js';

// Existing Models (already in the codebase)
export { DocumentReviewModel } from './Review.js';
export type { IDocumentReview } from './Review.js';
export { ReviewerProfileModel } from './ReviewerProfile.js';
export type { IReviewerProfile } from './ReviewerProfile.js';
export { ReviewWorkflowConfigModel } from './ReviewWorkflow.js';
export type { IReviewWorkflowConfig } from './ReviewWorkflow.js';
export { GenerationJobModel } from './GenerationJob.js';
export type { IGenerationJob } from './GenerationJob.js';
export { ProjectDocument } from './ProjectDocument.js';
export type { IProjectDocument } from './ProjectDocument.js';
export { ScopeChange } from './ScopeChange.js';
export type { IScopeChange } from './ScopeChange.js';
export { UserSession } from './UserSession.model.js';
export type { IUserSession } from './UserSession.model.js';

// Compliance and Analytics Models
export { ComplianceIssueModel } from './ComplianceIssue.model.js';
export type { IComplianceIssue } from './ComplianceIssue.model.js';
export { ComplianceMetricsModel } from './ComplianceMetrics.model.js';
export type { IComplianceMetrics } from './ComplianceMetrics.model.js';
export { ComplianceNotificationModel } from './ComplianceNotification.model.js';
export type { IComplianceNotification } from './ComplianceNotification.model.js';
export { ComplianceWorkflow } from './ComplianceWorkflow.model.js';
export type { IComplianceWorkflow } from './ComplianceWorkflow.model.js';

// AI and Billing Models
export { AIBillingUsage } from './AIBillingUsage.model.js';
export type { IAIBillingUsage } from './AIBillingUsage.model.js';
export { AIContextTracking } from './AIContextTracking.model.js';
export type { IAIContextTracking } from './AIContextTracking.model.js';

// Monitoring and Alerting Models
export { Alert } from './Alert.model.js';
export type { IAlert } from './Alert.model.js';
export { RealTimeMetrics } from './RealTimeMetrics.model.js';
export type { IRealTimeMetrics } from './RealTimeMetrics.model.js';

// Document Audit Models
export { DocumentAuditTrail } from './DocumentAuditTrail.model.js';
export type { IDocumentAuditTrail } from './DocumentAuditTrail.model.js';
export { DocumentFeedback } from './DocumentFeedback.js';
export type { IDocumentFeedback } from './DocumentFeedback.js';

/**
 * Model Registry
 * 
 * A registry of all available models for dynamic access
 */
export const MODEL_REGISTRY = {
  // Core Models
  Template: 'TemplateModel',
  Project: 'ProjectModel',
  Category: 'CategoryModel',
  Feedback: 'FeedbackModel',
  AuditTrail: 'AuditTrailModel',
  Stakeholder: 'StakeholderModel',
  
  // Review Models
  DocumentReview: 'DocumentReviewModel',
  ReviewerProfile: 'ReviewerProfileModel',
  ReviewWorkflow: 'ReviewWorkflowConfigModel',
  
  // Document Models
  ProjectDocument: 'ProjectDocument',
  ScopeChange: 'ScopeChange',
  GenerationJob: 'GenerationJobModel',
  
  // Compliance Models
  ComplianceIssue: 'ComplianceIssueModel',
  ComplianceMetrics: 'ComplianceMetricsModel',
  ComplianceNotification: 'ComplianceNotificationModel',
  ComplianceWorkflow: 'ComplianceWorkflow',
  
  // AI Models
  AIBillingUsage: 'AIBillingUsage',
  AIContextTracking: 'AIContextTracking',
  
  // Monitoring Models
  Alert: 'Alert',
  RealTimeMetrics: 'RealTimeMetrics',
  DocumentAuditTrail: 'DocumentAuditTrail',
  DocumentFeedback: 'DocumentFeedback',
  UserSession: 'UserSession'
} as const;

/**
 * Model Collections Map
 * 
 * Maps model names to their MongoDB collection names
 */
export const COLLECTION_MAP = {
  TemplateModel: 'templates',
  ProjectModel: 'projects',
  CategoryModel: 'categories',
  FeedbackModel: 'feedback',
  AuditTrailModel: 'audittrails',
  StakeholderModel: 'stakeholders',
  DocumentReviewModel: 'reviews',
  ReviewerProfileModel: 'reviewerprofiles',
  ReviewWorkflowConfigModel: 'reviewworkflows',
  GenerationJobModel: 'generationjobs',
  ProjectDocument: 'projectdocuments',
  ScopeChange: 'scopechanges',
  ComplianceIssueModel: 'complianceissues',
  ComplianceMetricsModel: 'compliancemetrics',
  ComplianceNotificationModel: 'compliancenotifications',
  ComplianceWorkflow: 'complianceworkflows',
  AIBillingUsage: 'aibillingusage',
  AIContextTracking: 'aicontexttracking',
  Alert: 'alerts',
  RealTimeMetrics: 'realtimemetrics',
  DocumentAuditTrail: 'documentaudittrails',
  DocumentFeedback: 'documentfeedback',
  UserSession: 'usersessions'
} as const;

/**
 * Model Validation Rules
 * 
 * Comprehensive validation patterns used across all models
 * Ensures consistent validation and error messages throughout the application
 */
export const VALIDATION_RULES = {
  // String validation patterns
  requiredString: (field: string, minLength: number = 1, maxLength: number = 100) => ({
    type: String,
    required: [true, `${field} is required`],
    trim: true,
    minlength: [minLength, `${field} must be at least ${minLength} character(s)`],
    maxlength: [maxLength, `${field} cannot exceed ${maxLength} characters`]
  }),
  
  optionalString: (field: string, maxLength: number = 100) => ({
    type: String,
    trim: true,
    maxlength: [maxLength, `${field} cannot exceed ${maxLength} characters`]
  }),
  
  // Email validation
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters'],
    match: [/^\S+@\S+\.\S+$/, 'Email must be a valid email address']
  },
  
  // URL validation
  url: {
    type: String,
    trim: true,
    maxlength: [500, 'URL cannot exceed 500 characters'],
    match: [/^https?:\/\/.+/, 'URL must start with http:// or https://']
  },
  
  // Phone number validation
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Phone number must be valid']
  },
  
  // ObjectId validation
  objectId: {
    type: String,
    trim: true,
    maxlength: [100, 'ID cannot exceed 100 characters'],
    match: [/^[0-9a-fA-F]{24}$/, 'ID must be a valid ObjectId']
  },
  
  // Number validation patterns
  positiveInteger: (field: string, max?: number) => ({
    type: Number,
    required: [true, `${field} is required`],
    min: [1, `${field} must be at least 1`],
    max: max ? [max, `${field} cannot exceed ${max}`] : undefined,
    validate: {
      validator: Number.isInteger,
      message: `${field} must be an integer`
    }
  }),
  
  percentage: (field: string) => ({
    type: Number,
    min: [0, `${field} cannot be negative`],
    max: [100, `${field} cannot exceed 100`],
    validate: {
      validator: (value: number) => Number.isFinite(value),
      message: `${field} must be a valid number`
    }
  }),
  
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  },
  
  // Date validation patterns
  futureDate: (field: string) => ({
    type: Date,
    required: [true, `${field} is required`],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: `${field} must be in the future`
    }
  }),
  
  pastDate: (field: string) => ({
    type: Date,
    required: [true, `${field} is required`],
    validate: {
      validator: function(value: Date) {
        return value < new Date();
      },
      message: `${field} must be in the past`
    }
  }),
  
  // Array validation patterns
  stringArray: (field: string, maxItems: number = 10, maxItemLength: number = 50) => ({
    type: [String],
    default: [],
    validate: {
      validator: function(arr: string[]) {
        return arr.length <= maxItems && arr.every(item => item.length <= maxItemLength);
      },
      message: `${field} cannot have more than ${maxItems} items and each item cannot exceed ${maxItemLength} characters`
    }
  }),
  
  objectIdArray: (field: string, maxItems: number = 100) => ({
    type: [String],
    default: [],
    validate: {
      validator: function(arr: string[]) {
        return arr.length <= maxItems && arr.every(id => /^[0-9a-fA-F]{24}$/.test(id));
      },
      message: `${field} cannot have more than ${maxItems} items and each must be a valid ObjectId`
    }
  }),
  
  // Common enum validations
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'pending', 'completed', 'cancelled', 'archived'],
      message: 'Status must be one of: active, inactive, pending, completed, cancelled, archived'
    },
    default: 'active'
  },
  
  severity: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Severity must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  
  // Audit trail validation
  auditTrailEntry: {
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      enum: {
        values: ['created', 'updated', 'deleted', 'restored', 'activated', 'deactivated', 'assigned', 'unassigned', 'status_changed'],
        message: 'Action must be one of: created, updated, deleted, restored, activated, deactivated, assigned, unassigned, status_changed'
      }
    },
    timestamp: { type: Date, default: Date.now },
    userId: {
      type: String,
      required: [true, 'User ID is required for audit trail'],
      maxlength: [100, 'User ID cannot exceed 100 characters']
    },
    reason: {
      type: String,
      maxlength: [500, 'Audit reason cannot exceed 500 characters']
    }
  },
  
  // Soft delete fields
  softDeleteFields: {
    deleted_at: { type: Date },
    deleted_by: {
      type: String,
      maxlength: [100, 'Deleted by field cannot exceed 100 characters']
    },
    delete_reason: {
      type: String,
      maxlength: [500, 'Delete reason cannot exceed 500 characters']
    },
    is_deleted: { type: Boolean, default: false }
  },
  
  // Common metadata object
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
    validate: {
      validator: function(value: any) {
        return typeof value === 'object' && value !== null;
      },
      message: 'Metadata must be an object'
    }
  }
} as const;

/**
 * Model Helper Functions
 * 
 * Common utility functions for working with models
 */
export const MODEL_HELPERS = {
  /**
   * Get model by name
   */
  getModelByName: (name: string) => {
    // This would need to be implemented with actual model imports
    // For now, return null as a placeholder
    return null;
  },
  
  /**
   * Get collection name by model name
   */
  getCollectionName: (modelName: string) => {
    return COLLECTION_MAP[modelName as keyof typeof COLLECTION_MAP];
  },
  
  /**
   * Check if model exists
   */
  modelExists: (name: string) => {
    return Object.keys(MODEL_REGISTRY).includes(name);
  },
  
  /**
   * Get all model names
   */
  getAllModelNames: () => {
    return Object.keys(MODEL_REGISTRY);
  },
  
  /**
   * Get all collection names
   */
  getAllCollectionNames: () => {
    return Object.values(COLLECTION_MAP);
  }
} as const;

/**
 * Model Initialization
 * 
 * Initialize all models and ensure proper indexing
 */
export const initializeModels = async () => {
  try {
    console.log('🔄 Initializing Mongoose models...');
    
    // Import models dynamically to avoid circular dependencies
    const { TemplateModel } = await import('./Template.model.js');
    const { ProjectModel } = await import('./Project.model.js');
    const { CategoryModel } = await import('./Category.model.js');
    const { FeedbackModel } = await import('./Feedback.model.js');
    const { AuditTrailModel } = await import('./AuditTrail.model.js');
    const { StakeholderModel } = await import('./Stakeholder.model.js');
    
    // Ensure all models are registered with Mongoose
    const models = [
      TemplateModel,
      ProjectModel,
      CategoryModel,
      FeedbackModel,
      AuditTrailModel,
      StakeholderModel
    ];
    
    // Verify models are properly registered
    for (const model of models) {
      if (!model.modelName) {
        throw new Error(`Model ${model.name} is not properly registered`);
      }
    }
    
    console.log('✅ All models initialized successfully');
    console.log(`📊 Total models registered: ${models.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Model initialization failed:', error);
    throw error;
  }
};

/**
 * Model Health Check
 * 
 * Check the health and status of all models
 */
export const checkModelHealth = async () => {
  try {
    const health = {
      status: 'healthy',
      models: [] as Array<{ name: string; status: string; collection: string }>,
      timestamp: new Date().toISOString()
    };
    
    const modelNames = Object.keys(MODEL_REGISTRY);
    
    for (const modelName of modelNames) {
      try {
        const model = MODEL_HELPERS.getModelByName(modelName);
        const collection = MODEL_HELPERS.getCollectionName(modelName);
        
        health.models.push({
          name: modelName,
          status: model ? 'active' : 'inactive',
          collection: collection || 'unknown'
        });
      } catch (error) {
        health.models.push({
          name: modelName,
          status: 'error',
          collection: 'unknown'
        });
      }
    }
    
    const inactiveModels = health.models.filter(m => m.status !== 'active');
    if (inactiveModels.length > 0) {
      health.status = 'degraded';
    }
    
    return health;
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

// Default export for convenience
export default {
  // Registry and Helpers
  MODEL_REGISTRY,
  COLLECTION_MAP,
  VALIDATION_RULES,
  MODEL_HELPERS,
  
  // Initialization Functions
  initializeModels,
  checkModelHealth
};
