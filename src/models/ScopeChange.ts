/**
 * Scope Change Model
 * Database model for scope change requests and tracking
 * 
 * @description Defines the data structure for scope changes with full
 * impact analysis and PMBOK compliance tracking
 * 
 * @version 1.0.0
 * @since 3.2.0
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IScopeImpact {
  scheduleImpact: {
    days: number;
    percentage: number;
    criticalPath: boolean;
  };
  costImpact: {
    amount: number;
    percentage: number;
    budgetCategory: string;
  };
  resourceImpact: {
    additionalResources: string[];
    skillsRequired: string[];
    availabilityImpact: boolean;
  };
  qualityImpact: {
    riskToQuality: boolean;
    testingImpact: boolean;
    acceptanceCriteriaChanges: boolean;
  };
  stakeholderImpact: {
    affectedStakeholders: string[];
    communicationRequired: boolean;
    approvalRequired: boolean;
  };
}

export interface IScopeChange extends Document {
  _id: string;
  projectId: string;
  changeType: 'addition' | 'reduction' | 'modification' | 'clarification';
  description: string;
  requestedBy: string;
  requestDate: Date;
  impact: IScopeImpact;
  status: 'pending' | 'approved' | 'rejected' | 'implemented' | 'cancelled';
  approvedBy?: string;
  approvalDate?: Date;
  implementationDate?: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  pmbokCompliance: boolean;
  
  // Additional tracking fields
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedEffort?: number; // in hours
  actualEffort?: number; // in hours
  businessJustification?: string;
  alternativesConsidered?: string[];
  rollbackPlan?: string;
  
  // Approval workflow
  approvalWorkflow?: {
    level1Approver?: string;
    level1ApprovalDate?: Date;
    level2Approver?: string;
    level2ApprovalDate?: Date;
    finalApprover?: string;
    finalApprovalDate?: Date;
  };
  
  // Implementation tracking
  implementationPlan?: {
    steps: string[];
    assignedTo?: string;
    estimatedDuration?: number;
    dependencies?: string[];
    milestones?: {
      name: string;
      targetDate: Date;
      completed: boolean;
      completedDate?: Date;
    }[];
  };
  
  // Metrics and analysis
  impactScore: number; // Calculated impact score 0-1
  complexityScore: number; // Calculated complexity score 0-1
  
  // Audit trail
  statusHistory: {
    status: string;
    changedBy: string;
    changedDate: Date;
    comments?: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

const ScopeImpactSchema = new Schema({
  scheduleImpact: {
    days: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    criticalPath: { type: Boolean, required: true }
  },
  costImpact: {
    amount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    budgetCategory: { type: String, required: true, maxlength: 50 }
  },
  resourceImpact: {
    additionalResources: [{ type: String, maxlength: 100 }],
    skillsRequired: [{ type: String, maxlength: 50 }],
    availabilityImpact: { type: Boolean, required: true }
  },
  qualityImpact: {
    riskToQuality: { type: Boolean, required: true },
    testingImpact: { type: Boolean, required: true },
    acceptanceCriteriaChanges: { type: Boolean, required: true }
  },
  stakeholderImpact: {
    affectedStakeholders: [{ type: String, maxlength: 100 }],
    communicationRequired: { type: Boolean, required: true },
    approvalRequired: { type: Boolean, required: true }
  }
}, { _id: false });

const ScopeChangeSchema: Schema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  changeType: {
    type: String,
    enum: ['addition', 'reduction', 'modification', 'clarification'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  requestedBy: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  requestDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  impact: {
    type: ScopeImpactSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'implemented', 'cancelled'],
    default: 'pending',
    required: true,
    index: true
  },
  approvedBy: {
    type: String,
    trim: true,
    maxlength: 100
  },
  approvalDate: {
    type: Date
  },
  implementationDate: {
    type: Date
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  pmbokCompliance: {
    type: Boolean,
    required: true,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedEffort: {
    type: Number,
    min: 0
  },
  actualEffort: {
    type: Number,
    min: 0
  },
  businessJustification: {
    type: String,
    maxlength: 1000
  },
  alternativesConsidered: [{
    type: String,
    maxlength: 500
  }],
  rollbackPlan: {
    type: String,
    maxlength: 1000
  },
  approvalWorkflow: {
    level1Approver: { type: String, maxlength: 100 },
    level1ApprovalDate: { type: Date },
    level2Approver: { type: String, maxlength: 100 },
    level2ApprovalDate: { type: Date },
    finalApprover: { type: String, maxlength: 100 },
    finalApprovalDate: { type: Date }
  },
  implementationPlan: {
    steps: [{ type: String, maxlength: 200 }],
    assignedTo: { type: String, maxlength: 100 },
    estimatedDuration: { type: Number, min: 0 },
    dependencies: [{ type: String, maxlength: 100 }],
    milestones: [{
      name: { type: String, required: true, maxlength: 100 },
      targetDate: { type: Date, required: true },
      completed: { type: Boolean, default: false },
      completedDate: { type: Date }
    }]
  },
  impactScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  complexityScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  statusHistory: [{
    status: { type: String, required: true },
    changedBy: { type: String, required: true, maxlength: 100 },
    changedDate: { type: Date, required: true, default: Date.now },
    comments: { type: String, maxlength: 500 }
  }]
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
ScopeChangeSchema.index({ projectId: 1, status: 1 });
ScopeChangeSchema.index({ projectId: 1, requestDate: -1 });
ScopeChangeSchema.index({ riskLevel: 1, status: 1 });
ScopeChangeSchema.index({ requestedBy: 1 });
ScopeChangeSchema.index({ approvalDate: -1 });
ScopeChangeSchema.index({ 'impact.scheduleImpact.criticalPath': 1 });

// Virtual for change age in days
ScopeChangeSchema.virtual('ageInDays').get(function(this: IScopeChange) {
  return Math.ceil((Date.now() - this.requestDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for approval duration
ScopeChangeSchema.virtual('approvalDuration').get(function(this: IScopeChange) {
  if (this.approvalDate && this.requestDate) {
    return Math.ceil((this.approvalDate.getTime() - this.requestDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for implementation duration
ScopeChangeSchema.virtual('implementationDuration').get(function(this: IScopeChange) {
  if (this.implementationDate && this.approvalDate) {
    return Math.ceil((this.implementationDate.getTime() - this.approvalDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware to calculate impact and complexity scores
ScopeChangeSchema.pre('save', function(this: IScopeChange, next: any) {
  // Calculate impact score
  if (this.isModified('impact')) {
    const scheduleWeight = 0.3;
    const costWeight = 0.3;
    const qualityWeight = 0.2;
    const stakeholderWeight = 0.2;

    const scheduleScore = Math.min(this.impact.scheduleImpact.percentage / 100, 1);
    const costScore = Math.min(this.impact.costImpact.percentage / 100, 1);
    const qualityScore = this.impact.qualityImpact.riskToQuality ? 0.5 : 0;
    const stakeholderScore = Math.min(this.impact.stakeholderImpact.affectedStakeholders.length / 10, 1);

    this.impactScore = (scheduleScore * scheduleWeight) + 
                      (costScore * costWeight) + 
                      (qualityScore * qualityWeight) + 
                      (stakeholderScore * stakeholderWeight);
  }

  // Calculate complexity score
  if (this.isModified('impact') || this.isModified('description')) {
    let complexityScore = 0;
    
    // Description complexity
    const descriptionLength = this.description.length;
    complexityScore += Math.min(descriptionLength / 1000, 0.3);
    
    // Resource complexity
    const resourceCount = this.impact.resourceImpact.additionalResources.length + 
                         this.impact.resourceImpact.skillsRequired.length;
    complexityScore += Math.min(resourceCount / 10, 0.3);
    
    // Stakeholder complexity
    const stakeholderCount = this.impact.stakeholderImpact.affectedStakeholders.length;
    complexityScore += Math.min(stakeholderCount / 10, 0.2);
    
    // Critical path complexity
    if (this.impact.scheduleImpact.criticalPath) {
      complexityScore += 0.2;
    }
    
    this.complexityScore = Math.min(complexityScore, 1);
  }

  // Add status history entry if status changed
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.approvedBy || 'system',
      changedDate: new Date(),
      comments: `Status changed to ${this.status}`
    });
  }

  next();
});

// Static method to get changes by project
ScopeChangeSchema.statics.getByProject = function(projectId: string, status?: string) {
  const query: any = { projectId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ requestDate: -1 });
};

// Static method to get pending changes requiring approval
ScopeChangeSchema.statics.getPendingApprovals = function(approver?: string) {
  const query: any = { status: 'pending' };
  if (approver) {
    query.$or = [
      { 'approvalWorkflow.level1Approver': approver },
      { 'approvalWorkflow.level2Approver': approver },
      { 'approvalWorkflow.finalApprover': approver }
    ];
  }
  return this.find(query).sort({ priority: -1, requestDate: 1 });
};

// Static method to get high-risk changes
ScopeChangeSchema.statics.getHighRiskChanges = function(projectId?: string) {
  const query: any = { 
    riskLevel: { $in: ['high', 'critical'] },
    status: { $in: ['pending', 'approved'] }
  };
  if (projectId) {
    query.projectId = projectId;
  }
  return this.find(query).sort({ riskLevel: -1, requestDate: 1 });
};

export const ScopeChange = mongoose.model<IScopeChange>('ScopeChange', ScopeChangeSchema);