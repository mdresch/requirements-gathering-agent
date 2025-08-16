import mongoose, { Schema, Document } from 'mongoose';
import {
  ReviewWorkflowConfig,
  ReviewStage,
  EscalationRule,
  EscalationCondition,
  EscalationAction,
  ReviewerRole
} from '../types/review.js';

export interface IReviewWorkflowConfig extends Omit<ReviewWorkflowConfig, 'id'>, Document {
  id: string;
  validateWorkflow(): { isValid: boolean; errors: string[] };
  getApplicableStages(documentType: string): ReviewStage[];
  getNextStage(currentStageNumber: number): ReviewStage | null;
}

const EscalationConditionSchema = new Schema({
  type: { 
    type: String, 
    enum: ['overdue', 'no_response', 'quality_threshold', 'custom'],
    required: true 
  },
  parameters: { type: Schema.Types.Mixed, default: {} }
});

const EscalationActionSchema = new Schema({
  type: { 
    type: String, 
    enum: ['notify', 'reassign', 'auto_approve', 'escalate_manager', 'custom'],
    required: true 
  },
  parameters: { type: Schema.Types.Mixed, default: {} }
});

const EscalationRuleSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  condition: { type: EscalationConditionSchema, required: true },
  action: { type: EscalationActionSchema, required: true },
  
  // Timing
  triggerAfterHours: { type: Number, required: true, min: 1 },
  reminderIntervalHours: { type: Number, default: 24, min: 1 },
  maxReminders: { type: Number, default: 3, min: 0 },
  
  // Recipients
  escalateTo: [String], // User IDs or roles
  notificationTemplate: { type: String, required: true },
  
  // Status
  isActive: { type: Boolean, default: true }
});

const ReviewStageSchema = new Schema({
  stageNumber: { type: Number, required: true, min: 1 },
  name: { type: String, required: true },
  description: { type: String, required: true },
  requiredRole: { 
    type: String, 
    enum: ['subject_matter_expert', 'technical_reviewer', 'compliance_officer', 'project_manager', 'business_analyst', 'quality_assurance', 'stakeholder']
  },
  requiredExpertise: [String],
  
  // Stage configuration
  isParallel: { type: Boolean, default: false },
  isOptional: { type: Boolean, default: false },
  canSkip: { type: Boolean, default: false },
  
  // Timing
  estimatedHours: { type: Number, required: true, min: 1 },
  maxDays: { type: Number, required: true, min: 1 },
  
  // Criteria
  criteria: [String], // Reference to ReviewCriteria IDs
  passingScore: { type: Number, default: 70, min: 0, max: 100 }
});

const ReviewWorkflowConfigSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  
  // Workflow definition
  documentTypes: [{ type: String, required: true }],
  requiredRoles: [{ 
    type: String, 
    enum: ['subject_matter_expert', 'technical_reviewer', 'compliance_officer', 'project_manager', 'business_analyst', 'quality_assurance', 'stakeholder'],
    required: true 
  }],
  reviewStages: [ReviewStageSchema],
  
  // Timing and escalation
  defaultDueDays: { type: Number, default: 5, min: 1 },
  escalationRules: [EscalationRuleSchema],
  
  // Quality gates
  minimumReviewers: { type: Number, default: 1, min: 1 },
  requiredApprovals: { type: Number, default: 1, min: 1 },
  qualityThreshold: { type: Number, default: 70, min: 0, max: 100 },
  
  // Automation
  autoAssignment: { type: Boolean, default: true },
  autoEscalation: { type: Boolean, default: true },
  autoNotification: { type: Boolean, default: true },
  
  // Status
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: String, required: true }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
ReviewWorkflowConfigSchema.index({ documentTypes: 1, isActive: 1 });
ReviewWorkflowConfigSchema.index({ requiredRoles: 1, isActive: 1 });
ReviewWorkflowConfigSchema.index({ name: 1 });

// Virtual for total estimated time
ReviewWorkflowConfigSchema.virtual('totalEstimatedHours').get(function(this: IReviewWorkflowConfig) {
  return this.reviewStages.reduce((total, stage) => total + stage.estimatedHours, 0);
});

// Virtual for parallel stages count
ReviewWorkflowConfigSchema.virtual('parallelStagesCount').get(function(this: IReviewWorkflowConfig) {
  return this.reviewStages.filter(stage => stage.isParallel).length;
});

// Method to validate workflow configuration
ReviewWorkflowConfigSchema.methods.validateWorkflow = function(this: IReviewWorkflowConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if stages are properly numbered
  const stageNumbers = this.reviewStages.map(s => s.stageNumber).sort((a, b) => a - b);
  for (let i = 0; i < stageNumbers.length; i++) {
    if (stageNumbers[i] !== i + 1) {
      errors.push(`Stage numbers must be sequential starting from 1. Missing stage ${i + 1}`);
      break;
    }
  }
  
  // Check if required approvals doesn't exceed minimum reviewers
  if (this.requiredApprovals > this.minimumReviewers) {
    errors.push('Required approvals cannot exceed minimum reviewers');
  }
  
  // Check if document types are specified
  if (this.documentTypes.length === 0) {
    errors.push('At least one document type must be specified');
  }
  
  // Check if required roles are specified
  if (this.requiredRoles.length === 0) {
    errors.push('At least one required role must be specified');
  }
  
  // Check escalation rules
  for (const rule of this.escalationRules) {
    if (rule.triggerAfterHours <= 0) {
      errors.push(`Escalation rule "${rule.name}" must have trigger time greater than 0`);
    }
    if (rule.escalateTo.length === 0) {
      errors.push(`Escalation rule "${rule.name}" must have at least one escalation recipient`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Method to get applicable stages for a document type
ReviewWorkflowConfigSchema.methods.getApplicableStages = function(this: IReviewWorkflowConfig, documentType: string): ReviewStage[] {
  if (!this.documentTypes.includes(documentType)) {
    return [];
  }
  
  return this.reviewStages.sort((a, b) => a.stageNumber - b.stageNumber);
};

// Method to get next stage
ReviewWorkflowConfigSchema.methods.getNextStage = function(this: IReviewWorkflowConfig, currentStageNumber: number): ReviewStage | null {
  const stages = this.reviewStages.sort((a, b) => a.stageNumber - b.stageNumber);
  const currentIndex = stages.findIndex(s => s.stageNumber === currentStageNumber);
  
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null;
  }
  
  return stages[currentIndex + 1];
};

// Pre-save validation
ReviewWorkflowConfigSchema.pre('save', function(this: IReviewWorkflowConfig, next: any) {
  const validation = this.validateWorkflow();
  if (!validation.isValid) {
    const error = new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
    return next(error);
  }
  next();
});

export const ReviewWorkflowConfigModel = mongoose.model<IReviewWorkflowConfig>('ReviewWorkflowConfig', ReviewWorkflowConfigSchema);