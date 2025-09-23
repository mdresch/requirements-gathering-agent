// Project Model
// filepath: src/models/Project.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IScopeBaseline {
  version: string;
  description: string;
  deliverables: string[];
  acceptanceCriteria: string[];
  exclusions: string[];
  assumptions: string[];
  constraints: string[];
  approvedBy: string;
  approvalDate: Date;
  lastModified: Date;
}

export interface IScopeMetrics {
  totalChanges: number;
  approvedChanges: number;
  rejectedChanges: number;
  pendingChanges: number;
  scopeCreepIndex: number;
  changeVelocity: number;
  lastCalculated: Date;
}

export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'review' | 'completed' | 'archived';
  framework: 'babok' | 'pmbok' | 'dmbok' | 'multi';
  complianceScore: number;
  documents: number;
  stakeholders: number;
  owner?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  
  // Scope Control Enhancement
  scopeBaseline?: IScopeBaseline;
  scopeMetrics?: IScopeMetrics;
  scopeControlEnabled?: boolean;
  scopeControlSettings?: {
    autoApprovalThreshold: number;
    escalationThreshold: number;
    scopeCreepThreshold: number;
    monitoringFrequency: number;
    stakeholderNotificationEnabled: boolean;
    pmbokValidationEnabled: boolean;
  };
  lastScopeReview?: Date;
  scopeRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'review', 'completed', 'archived'],
    default: 'draft',
    required: true
  },
  framework: {
    type: String,
    enum: ['babok', 'pmbok', 'dmbok', 'multi'],
    required: true
  },
  complianceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  documents: {
    type: Number,
    min: 0,
    default: 0
  },
  stakeholders: {
    type: Number,
    min: 0,
    default: 0
  },
  owner: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    maxlength: 3
  },
  
  // Scope Control Enhancement Fields
  scopeBaseline: {
    version: { type: String },
    description: { type: String, maxlength: 2000 },
    deliverables: [{ type: String, maxlength: 200 }],
    acceptanceCriteria: [{ type: String, maxlength: 500 }],
    exclusions: [{ type: String, maxlength: 200 }],
    assumptions: [{ type: String, maxlength: 200 }],
    constraints: [{ type: String, maxlength: 200 }],
    approvedBy: { type: String, maxlength: 100 },
    approvalDate: { type: Date },
    lastModified: { type: Date, default: Date.now }
  },
  
  scopeMetrics: {
    totalChanges: { type: Number, default: 0, min: 0 },
    approvedChanges: { type: Number, default: 0, min: 0 },
    rejectedChanges: { type: Number, default: 0, min: 0 },
    pendingChanges: { type: Number, default: 0, min: 0 },
    scopeCreepIndex: { type: Number, default: 0, min: 0, max: 1 },
    changeVelocity: { type: Number, default: 0, min: 0 },
    lastCalculated: { type: Date, default: Date.now }
  },
  
  scopeControlEnabled: {
    type: Boolean,
    default: false
  },
  
  scopeControlSettings: {
    autoApprovalThreshold: { type: Number, default: 0.2, min: 0, max: 1 },
    escalationThreshold: { type: Number, default: 0.5, min: 0, max: 1 },
    scopeCreepThreshold: { type: Number, default: 0.3, min: 0, max: 1 },
    monitoringFrequency: { type: Number, default: 60, min: 1, max: 1440 },
    stakeholderNotificationEnabled: { type: Boolean, default: true },
    pmbokValidationEnabled: { type: Boolean, default: true }
  },
  
  lastScopeReview: {
    type: Date
  },
  
  scopeRiskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  }
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
ProjectSchema.index({ name: 'text', description: 'text' });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ framework: 1 });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ updatedAt: -1 });

// Virtual for project duration
ProjectSchema.virtual('duration').get(function(this: IProject) {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware to update compliance score based on documents, stakeholders, and scope control
ProjectSchema.pre('save', function(this: IProject, next: any) {
  if (this.isModified('documents') || this.isModified('stakeholders') || this.isModified('scopeMetrics')) {
    // Enhanced compliance score calculation including scope control
    const docScore = Math.min((this.documents || 0) * 5, 40); // Max 40 points for documents
    const stakeholderScore = Math.min((this.stakeholders || 0) * 3, 25); // Max 25 points for stakeholders
    const baseScore = 15; // Base score for having a project
    
    // Scope control bonus
    let scopeScore = 0;
    if (this.scopeControlEnabled) {
      scopeScore += 10; // Base scope control bonus
      
      if (this.scopeMetrics) {
        // Bonus for good scope management
        const scopeCreepPenalty = Math.min(this.scopeMetrics.scopeCreepIndex * 10, 5);
        const changeManagementBonus = this.scopeMetrics.totalChanges > 0 ? 
          Math.min((this.scopeMetrics.approvedChanges / this.scopeMetrics.totalChanges) * 10, 10) : 5;
        
        scopeScore += changeManagementBonus - scopeCreepPenalty;
      }
    }
    
    this.complianceScore = Math.min(docScore + stakeholderScore + baseScore + scopeScore, 100);
  }
  
  // Update scope risk level based on metrics
  if (this.isModified('scopeMetrics') && this.scopeMetrics) {
    if (this.scopeMetrics.scopeCreepIndex > 0.7) {
      this.scopeRiskLevel = 'critical';
    } else if (this.scopeMetrics.scopeCreepIndex > 0.5) {
      this.scopeRiskLevel = 'high';
    } else if (this.scopeMetrics.scopeCreepIndex > 0.3) {
      this.scopeRiskLevel = 'medium';
    } else {
      this.scopeRiskLevel = 'low';
    }
  }
  
  next();
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
