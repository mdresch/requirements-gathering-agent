import mongoose, { Schema, Document } from 'mongoose';

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
  
  // Enhanced fields for consistency
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Soft delete fields
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
  isDeleted: boolean;
  
  // Audit trail
  auditTrail?: {
    action: 'created' | 'updated' | 'soft_deleted' | 'restored' | 'hard_deleted';
    timestamp: Date;
    userId: string;
    changes?: any;
    reason?: string;
  }[];
}

const ProjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Project description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'active', 'review', 'completed', 'archived'],
      message: 'Status must be one of: draft, active, review, completed, archived'
    },
    default: 'draft',
    required: true
  },
  framework: {
    type: String,
    enum: {
      values: ['babok', 'pmbok', 'dmbok', 'multi'],
      message: 'Framework must be one of: babok, pmbok, dmbok, multi'
    },
    required: [true, 'Framework is required']
  },
  complianceScore: {
    type: Number,
    min: [0, 'Compliance score cannot be negative'],
    max: [100, 'Compliance score cannot exceed 100'],
    default: 0
  },
  documents: {
    type: Number,
    min: [0, 'Document count cannot be negative'],
    default: 0
  },
  stakeholders: {
    type: Number,
    min: [0, 'Stakeholder count cannot be negative'],
    default: 0
  },
  owner: {
    type: String,
    trim: true,
    maxlength: [100, 'Owner name cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 20;
      },
      message: 'Cannot have more than 20 tags'
    }
  }],
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  startDate: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        if (!value) return true; // Optional field
        return value <= new Date(); // Start date cannot be in the future
      },
      message: 'Start date cannot be in the future'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        if (!value || !this.startDate) return true; // Optional field
        return value >= this.startDate; // End date must be after start date
      },
      message: 'End date must be after start date'
    }
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    maxlength: [3, 'Currency code cannot exceed 3 characters'],
    uppercase: true,
    match: [/^[A-Z]{3}$/, 'Currency must be a valid 3-letter code']
  },
  
  // Scope Control Enhancement Fields
  scopeBaseline: {
    version: { 
      type: String,
      maxlength: [20, 'Scope baseline version cannot exceed 20 characters']
    },
    description: { 
      type: String, 
      maxlength: [2000, 'Scope baseline description cannot exceed 2000 characters']
    },
    deliverables: [{
      type: String, 
      maxlength: [200, 'Deliverable description cannot exceed 200 characters']
    }],
    acceptanceCriteria: [{
      type: String, 
      maxlength: [500, 'Acceptance criteria cannot exceed 500 characters']
    }],
    exclusions: [{
      type: String, 
      maxlength: [200, 'Exclusion description cannot exceed 200 characters']
    }],
    assumptions: [{
      type: String, 
      maxlength: [200, 'Assumption description cannot exceed 200 characters']
    }],
    constraints: [{
      type: String, 
      maxlength: [200, 'Constraint description cannot exceed 200 characters']
    }],
    approvedBy: { 
      type: String, 
      maxlength: [100, 'Approved by field cannot exceed 100 characters']
    },
    approvalDate: { type: Date },
    lastModified: { type: Date, default: Date.now }
  },
  
  scopeMetrics: {
    totalChanges: { 
      type: Number, 
      default: 0, 
      min: [0, 'Total changes cannot be negative']
    },
    approvedChanges: { 
      type: Number, 
      default: 0, 
      min: [0, 'Approved changes cannot be negative']
    },
    rejectedChanges: { 
      type: Number, 
      default: 0, 
      min: [0, 'Rejected changes cannot be negative']
    },
    pendingChanges: { 
      type: Number, 
      default: 0, 
      min: [0, 'Pending changes cannot be negative']
    },
    scopeCreepIndex: { 
      type: Number, 
      default: 0, 
      min: [0, 'Scope creep index cannot be negative'], 
      max: [1, 'Scope creep index cannot exceed 1']
    },
    changeVelocity: { 
      type: Number, 
      default: 0, 
      min: [0, 'Change velocity cannot be negative']
    },
    lastCalculated: { type: Date, default: Date.now }
  },
  
  scopeControlEnabled: {
    type: Boolean,
    default: false
  },
  
  scopeControlSettings: {
    autoApprovalThreshold: { 
      type: Number, 
      default: 0.2, 
      min: [0, 'Auto approval threshold cannot be negative'], 
      max: [1, 'Auto approval threshold cannot exceed 1']
    },
    escalationThreshold: { 
      type: Number, 
      default: 0.5, 
      min: [0, 'Escalation threshold cannot be negative'], 
      max: [1, 'Escalation threshold cannot exceed 1']
    },
    scopeCreepThreshold: { 
      type: Number, 
      default: 0.3, 
      min: [0, 'Scope creep threshold cannot be negative'], 
      max: [1, 'Scope creep threshold cannot exceed 1']
    },
    monitoringFrequency: { 
      type: Number, 
      default: 60, 
      min: [1, 'Monitoring frequency must be at least 1 minute'], 
      max: [1440, 'Monitoring frequency cannot exceed 1440 minutes (24 hours)']
    },
    stakeholderNotificationEnabled: { type: Boolean, default: true },
    pmbokValidationEnabled: { type: Boolean, default: true }
  },
  
  lastScopeReview: {
    type: Date
  },
  
  scopeRiskLevel: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Scope risk level must be one of: low, medium, high, critical'
    },
    default: 'low'
  },
  
  // Enhanced fields for consistency
  createdBy: {
    type: String,
    required: [true, 'Created by field is required'],
    trim: true,
    maxlength: [100, 'Created by field cannot exceed 100 characters']
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Soft delete fields
  deletedAt: { type: Date },
  deletedBy: { 
    type: String,
    maxlength: [100, 'Deleted by field cannot exceed 100 characters']
  },
  deleteReason: { 
    type: String,
    maxlength: [500, 'Delete reason cannot exceed 500 characters']
  },
  isDeleted: { type: Boolean, default: false },
  
  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: {
        values: ['created', 'updated', 'soft_deleted', 'restored', 'hard_deleted'],
        message: 'Action must be one of: created, updated, soft_deleted, restored, hard_deleted'
      },
      required: [true, 'Audit action is required']
    },
    timestamp: { type: Date, default: Date.now },
    userId: { 
      type: String, 
      required: [true, 'User ID is required for audit trail'],
      maxlength: [100, 'User ID cannot exceed 100 characters']
    },
    changes: Schema.Types.Mixed,
    reason: { 
      type: String,
      maxlength: [500, 'Audit reason cannot exceed 500 characters']
    }
  }]
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
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
ProjectSchema.index({ isDeleted: 1, status: 1 });
ProjectSchema.index({ createdBy: 1, isDeleted: 1 });

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
  
  // Add audit trail entry for updates
  if (!this.isNew && this.isModified()) {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      action: 'updated',
      timestamp: new Date(),
      userId: this.createdBy, // In real app, get from request context
      changes: this.modifiedPaths(),
      reason: 'Project updated'
    });
  }
  
  next();
});

// Pre-save middleware for creation audit trail
ProjectSchema.pre('save', function(this: IProject, next: any) {
  if (this.isNew) {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      action: 'created',
      timestamp: new Date(),
      userId: this.createdBy,
      reason: 'Project created'
    });
  }
  next();
});

// Static method to find only non-deleted projects
ProjectSchema.statics.findNotDeleted = function() {
  return this.find({ isDeleted: { $ne: true } });
};

// Static method to find only deleted projects
ProjectSchema.statics.findDeleted = function() {
  return this.find({ isDeleted: true });
};

// Instance method for soft delete
ProjectSchema.methods.softDelete = function(this: any, userId: string, reason?: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.deleteReason = reason || 'Soft deleted by user';
  this.status = 'archived';
  
  // Add to audit trail
  if (!this.auditTrail) {
    this.auditTrail = [];
  }
  
  this.auditTrail.push({
    action: 'soft_deleted',
    timestamp: new Date(),
    userId: userId,
    reason: reason || 'Soft deleted by user'
  });
  
  return this.save();
};

// Instance method for restore
ProjectSchema.methods.restore = function(this: any, userId: string, reason?: string) {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.deleteReason = undefined;
  this.status = 'active';
  
  // Add to audit trail
  if (!this.auditTrail) {
    this.auditTrail = [];
  }
  
  this.auditTrail.push({
    action: 'restored',
    timestamp: new Date(),
    userId: userId,
    reason: reason || 'Project restored by user'
  });
  
  return this.save();
};

export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);
