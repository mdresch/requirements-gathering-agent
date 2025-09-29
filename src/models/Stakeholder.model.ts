import mongoose, { Schema, Document } from 'mongoose';

export interface IStakeholder extends Document {
  // Core stakeholder fields
  projectId: string;
  name: string;
  title: string;
  role: 'project_manager' | 'sponsor' | 'team_member' | 'end_user' | 'stakeholder';
  
  // Contact information
  email?: string;
  phone?: string;
  department?: string;
  
  // Stakeholder analysis
  influence: 'low' | 'medium' | 'high' | 'critical';
  interest: 'low' | 'medium' | 'high';
  powerLevel: number; // 1-5 scale
  engagementLevel: number; // 1-5 scale
  
  // Communication preferences
  communicationPreference: 'email' | 'phone' | 'meeting' | 'portal';
  availability: {
    timezone: string;
    workingHours: string;
    preferredMeetingTimes: string[];
  };
  
  // Requirements and concerns
  requirements: string[];
  concerns: string[];
  expectations: string[];
  
  // Status and tracking
  isActive: boolean;
  lastContact?: Date;
  notes?: string;
  
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

const StakeholderSchema: Schema = new Schema({
  // Core stakeholder fields
  projectId: {
    type: String,
    required: [true, 'Project ID is required'],
    trim: true,
    maxlength: [100, 'Project ID cannot exceed 100 characters']
  },
  name: {
    type: String,
    required: [true, 'Stakeholder name is required'],
    trim: true,
    minlength: [1, 'Name must be at least 1 character'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['project_manager', 'sponsor', 'team_member', 'end_user', 'stakeholder'],
      message: 'Role must be one of: project_manager, sponsor, team_member, end_user, stakeholder'
    }
  },
  
  // Contact information
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters'],
    match: [/^\S+@\S+\.\S+$/, 'Email must be a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Phone number must be valid']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  
  // Stakeholder analysis
  influence: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Influence must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  interest: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Interest must be one of: low, medium, high'
    },
    default: 'medium'
  },
  powerLevel: {
    type: Number,
    min: [1, 'Power level must be at least 1'],
    max: [5, 'Power level cannot exceed 5'],
    default: 3
  },
  engagementLevel: {
    type: Number,
    min: [1, 'Engagement level must be at least 1'],
    max: [5, 'Engagement level cannot exceed 5'],
    default: 3
  },
  
  // Communication preferences
  communicationPreference: {
    type: String,
    enum: {
      values: ['email', 'phone', 'meeting', 'portal'],
      message: 'Communication preference must be one of: email, phone, meeting, portal'
    },
    default: 'email'
  },
  availability: {
    timezone: { 
      type: String, 
      default: 'UTC',
      maxlength: [50, 'Timezone cannot exceed 50 characters']
    },
    workingHours: { 
      type: String, 
      default: '9:00-17:00',
      maxlength: [20, 'Working hours cannot exceed 20 characters']
    },
    preferredMeetingTimes: [{
      type: String,
      maxlength: [50, 'Preferred meeting time cannot exceed 50 characters']
    }]
  },
  
  // Requirements and concerns
  requirements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Requirement cannot exceed 500 characters'],
    validate: {
      validator: function(requirements: string[]) {
        return requirements.length <= 20;
      },
      message: 'Cannot have more than 20 requirements'
    }
  }],
  concerns: [{
    type: String,
    trim: true,
    maxlength: [500, 'Concern cannot exceed 500 characters'],
    validate: {
      validator: function(concerns: string[]) {
        return concerns.length <= 20;
      },
      message: 'Cannot have more than 20 concerns'
    }
  }],
  expectations: [{
    type: String,
    trim: true,
    maxlength: [500, 'Expectation cannot exceed 500 characters'],
    validate: {
      validator: function(expectations: string[]) {
        return expectations.length <= 20;
      },
      message: 'Cannot have more than 20 expectations'
    }
  }],
  
  // Status and tracking
  isActive: {
    type: Boolean,
    default: true
  },
  lastContact: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
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
StakeholderSchema.index({ projectId: 1, role: 1 });
StakeholderSchema.index({ projectId: 1, isActive: 1 });
StakeholderSchema.index({ name: 'text', title: 'text' });
StakeholderSchema.index({ email: 1 });
StakeholderSchema.index({ influence: 1, interest: 1 });
StakeholderSchema.index({ isDeleted: 1, isActive: 1 });
StakeholderSchema.index({ createdBy: 1, isDeleted: 1 });
StakeholderSchema.index({ createdAt: -1 });

// Virtual for stakeholder priority score
StakeholderSchema.virtual('priorityScore').get(function(this: IStakeholder) {
  const powerWeight = this.powerLevel * 2;
  const influenceWeight = this.influence === 'critical' ? 10 : 
                         this.influence === 'high' ? 8 :
                         this.influence === 'medium' ? 5 : 2;
  const interestWeight = this.interest === 'high' ? 3 :
                        this.interest === 'medium' ? 2 : 1;
  
  return powerWeight + influenceWeight + interestWeight;
});

// Virtual for stakeholder engagement score
StakeholderSchema.virtual('engagementScore').get(function(this: IStakeholder) {
  const baseEngagement = this.engagementLevel * 2;
  const communicationBonus = this.communicationPreference === 'meeting' ? 3 :
                            this.communicationPreference === 'phone' ? 2 : 1;
  const activityBonus = this.lastContact ? 
    Math.max(0, 5 - Math.floor((Date.now() - this.lastContact.getTime()) / (7 * 24 * 60 * 60 * 1000))) : 0;
  
  return baseEngagement + communicationBonus + activityBonus;
});

// Pre-save middleware to update audit trail
StakeholderSchema.pre('save', function(this: IStakeholder, next: any) {
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
      reason: 'Stakeholder updated'
    });
  }
  
  next();
});

// Pre-save middleware for creation audit trail
StakeholderSchema.pre('save', function(this: IStakeholder, next: any) {
  if (this.isNew) {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      action: 'created',
      timestamp: new Date(),
      userId: this.createdBy,
      reason: 'Stakeholder created'
    });
  }
  next();
});

// Static method to find only non-deleted stakeholders
StakeholderSchema.statics.findNotDeleted = function() {
  return this.find({ isDeleted: { $ne: true } });
};

// Static method to find only deleted stakeholders
StakeholderSchema.statics.findDeleted = function() {
  return this.find({ isDeleted: true });
};

// Static method to find stakeholders by project
StakeholderSchema.statics.findByProject = function(projectId: string) {
  return this.find({ projectId, isDeleted: { $ne: true } });
};

// Static method to find stakeholders by role
StakeholderSchema.statics.findByRole = function(role: string) {
  return this.find({ role, isDeleted: { $ne: true } });
};

// Static method to find high-priority stakeholders
StakeholderSchema.statics.findHighPriority = function() {
  return this.find({ 
    $or: [
      { influence: 'critical' },
      { influence: 'high', interest: 'high' },
      { powerLevel: { $gte: 4 } }
    ],
    isDeleted: { $ne: true }
  });
};

// Instance method for soft delete
StakeholderSchema.methods.softDelete = function(this: any, userId: string, reason?: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.deleteReason = reason || 'Soft deleted by user';
  this.isActive = false;
  
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
StakeholderSchema.methods.restore = function(this: any, userId: string, reason?: string) {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.deleteReason = undefined;
  this.isActive = true;
  
  // Add to audit trail
  if (!this.auditTrail) {
    this.auditTrail = [];
  }
  
  this.auditTrail.push({
    action: 'restored',
    timestamp: new Date(),
    userId: userId,
    reason: reason || 'Stakeholder restored by user'
  });
  
  return this.save();
};

// Instance method to update last contact
StakeholderSchema.methods.updateLastContact = function(this: any, userId: string) {
  this.lastContact = new Date();
  
  // Add to audit trail
  if (!this.auditTrail) {
    this.auditTrail = [];
  }
  
  this.auditTrail.push({
    action: 'updated',
    timestamp: new Date(),
    userId: userId,
    changes: ['lastContact'],
    reason: 'Last contact updated'
  });
  
  return this.save();
};

// Instance method to add requirement
StakeholderSchema.methods.addRequirement = function(this: any, requirement: string, userId: string) {
  if (!this.requirements) {
    this.requirements = [];
  }
  
  if (this.requirements.length < 20) {
    this.requirements.push(requirement);
    
    // Add to audit trail
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      action: 'updated',
      timestamp: new Date(),
      userId: userId,
      changes: ['requirements'],
      reason: 'Requirement added'
    });
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to add concern
StakeholderSchema.methods.addConcern = function(this: any, concern: string, userId: string) {
  if (!this.concerns) {
    this.concerns = [];
  }
  
  if (this.concerns.length < 20) {
    this.concerns.push(concern);
    
    // Add to audit trail
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      action: 'updated',
      timestamp: new Date(),
      userId: userId,
      changes: ['concerns'],
      reason: 'Concern added'
    });
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

export const StakeholderModel = mongoose.model<IStakeholder>('Stakeholder', StakeholderSchema);
