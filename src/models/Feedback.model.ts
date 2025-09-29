import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  // Core feedback fields
  documentId: string;
  projectId: string;
  userId: string;
  userName?: string;
  
  // Feedback content
  feedbackType: 'general' | 'technical' | 'content' | 'structure' | 'compliance' | 'quality';
  rating: number; // 1-5 scale
  title: string;
  description: string;
  
  // Feedback categorization
  category: 'positive' | 'negative' | 'suggestion' | 'question' | 'issue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  
  // Feedback status and workflow
  status: 'open' | 'in_review' | 'addressed' | 'resolved' | 'rejected' | 'closed';
  assignedTo?: string;
  resolution?: string;
  resolutionDate?: Date;
  
  // Feedback metadata
  tags?: string[];
  attachments?: string[]; // URLs or file references
  relatedFeedback?: string[]; // References to other feedback items
  
  // Context and location
  sectionReference?: string; // Which section of the document
  pageNumber?: number;
  lineNumber?: number;
  
  // Response and discussion
  responses?: {
    userId: string;
    userName?: string;
    message: string;
    timestamp: Date;
    isInternal: boolean; // Internal team response vs public response
  }[];
  
  // Feedback lifecycle
  isPublic: boolean; // Whether feedback is visible to stakeholders
  isResolved: boolean;
  resolutionMethod?: 'fixed' | 'accepted' | 'rejected' | 'deferred';
  
  // Audit and tracking
  viewCount: number;
  lastViewed?: Date;
  lastActivity?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Soft delete fields
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
  isDeleted: boolean;
  
  // Audit trail
  auditTrail?: {
    action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'resolved' | 'soft_deleted' | 'restored';
    timestamp: Date;
    userId: string;
    changes?: any;
    reason?: string;
  }[];
}

const FeedbackSchema: Schema = new Schema({
  // Core feedback fields
  documentId: {
    type: String,
    required: [true, 'Document ID is required'],
    trim: true,
    maxlength: [100, 'Document ID cannot exceed 100 characters']
  },
  projectId: {
    type: String,
    required: [true, 'Project ID is required'],
    trim: true,
    maxlength: [100, 'Project ID cannot exceed 100 characters']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true,
    maxlength: [100, 'User ID cannot exceed 100 characters']
  },
  userName: {
    type: String,
    trim: true,
    maxlength: [100, 'User name cannot exceed 100 characters']
  },
  
  // Feedback content
  feedbackType: {
    type: String,
    required: [true, 'Feedback type is required'],
    enum: {
      values: ['general', 'technical', 'content', 'structure', 'compliance', 'quality'],
      message: 'Feedback type must be one of: general, technical, content, structure, compliance, quality'
    },
    default: 'general'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Feedback title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Feedback description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Feedback categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['positive', 'negative', 'suggestion', 'question', 'issue'],
      message: 'Category must be one of: positive, negative, suggestion, question, issue'
    },
    default: 'suggestion'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  severity: {
    type: String,
    enum: {
      values: ['minor', 'moderate', 'major', 'critical'],
      message: 'Severity must be one of: minor, moderate, major, critical'
    },
    default: 'moderate'
  },
  
  // Feedback status and workflow
  status: {
    type: String,
    enum: {
      values: ['open', 'in_review', 'addressed', 'resolved', 'rejected', 'closed'],
      message: 'Status must be one of: open, in_review, addressed, resolved, rejected, closed'
    },
    default: 'open'
  },
  assignedTo: {
    type: String,
    trim: true,
    maxlength: [100, 'Assigned to field cannot exceed 100 characters']
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  },
  resolutionDate: {
    type: Date
  },
  
  // Feedback metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 15;
      },
      message: 'Cannot have more than 15 tags'
    }
  }],
  attachments: [{
    type: String,
    trim: true,
    maxlength: [500, 'Attachment URL cannot exceed 500 characters'],
    validate: {
      validator: function(attachments: string[]) {
        return attachments.length <= 10;
      },
      message: 'Cannot have more than 10 attachments'
    }
  }],
  relatedFeedback: [{
    type: String,
    trim: true,
    maxlength: [100, 'Related feedback ID cannot exceed 100 characters'],
    validate: {
      validator: function(related: string[]) {
        return related.length <= 20;
      },
      message: 'Cannot have more than 20 related feedback items'
    }
  }],
  
  // Context and location
  sectionReference: {
    type: String,
    trim: true,
    maxlength: [200, 'Section reference cannot exceed 200 characters']
  },
  pageNumber: {
    type: Number,
    min: [1, 'Page number must be at least 1']
  },
  lineNumber: {
    type: Number,
    min: [1, 'Line number must be at least 1']
  },
  
  // Response and discussion
  responses: [{
    userId: {
      type: String,
      required: [true, 'Response user ID is required'],
      maxlength: [100, 'User ID cannot exceed 100 characters']
    },
    userName: {
      type: String,
      maxlength: [100, 'User name cannot exceed 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Response message is required'],
      trim: true,
      minlength: [1, 'Response message must be at least 1 character'],
      maxlength: [1000, 'Response message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  
  // Feedback lifecycle
  isPublic: {
    type: Boolean,
    default: true
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolutionMethod: {
    type: String,
    enum: {
      values: ['fixed', 'accepted', 'rejected', 'deferred'],
      message: 'Resolution method must be one of: fixed, accepted, rejected, deferred'
    }
  },
  
  // Audit and tracking
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  lastViewed: {
    type: Date
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Timestamps
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
        values: ['created', 'updated', 'status_changed', 'assigned', 'resolved', 'soft_deleted', 'restored'],
        message: 'Action must be one of: created, updated, status_changed, assigned, resolved, soft_deleted, restored'
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
FeedbackSchema.index({ documentId: 1, projectId: 1 });
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1, priority: 1 });
FeedbackSchema.index({ category: 1, severity: 1 });
FeedbackSchema.index({ assignedTo: 1, status: 1 });
FeedbackSchema.index({ isDeleted: 1, isPublic: 1 });
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ lastActivity: -1 });

// Text search index
FeedbackSchema.index({ 
  title: 'text', 
  description: 'text',
  resolution: 'text'
});

// Pre-save middleware to update lastActivity and audit trail
FeedbackSchema.pre('save', function(this: IFeedback, next: any) {
  // Update lastActivity on any change
  this.lastActivity = new Date();
  
  // Add audit trail entry for updates
  if (!this.isNew && this.isModified()) {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    // Determine action type based on what changed
    let action = 'updated';
    if (this.isModified('status')) {
      action = 'status_changed';
    } else if (this.isModified('assignedTo')) {
      action = 'assigned';
    } else if (this.isModified('resolution') && this.resolution) {
      action = 'resolved';
    }
    
    this.auditTrail.push({
      action: action as any,
      timestamp: new Date(),
      userId: this.userId, // In real app, get from request context
      changes: this.modifiedPaths(),
      reason: `Feedback ${action}`
    });
  }
  
  // Update isResolved based on status
  if (this.isModified('status')) {
    this.isResolved = ['resolved', 'closed'].includes(this.status);
  }
  
  next();
});

// Pre-save middleware for creation audit trail
FeedbackSchema.pre('save', function(this: IFeedback, next: any) {
  if (this.isNew) {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      action: 'created',
      timestamp: new Date(),
      userId: this.userId,
      reason: 'Feedback created'
    });
  }
  next();
});

// Static method to find only non-deleted feedback
FeedbackSchema.statics.findNotDeleted = function() {
  return this.find({ isDeleted: { $ne: true } });
};

// Static method to find only deleted feedback
FeedbackSchema.statics.findDeleted = function() {
  return this.find({ isDeleted: true });
};

// Static method to find feedback by project
FeedbackSchema.statics.findByProject = function(projectId: string) {
  return this.find({ projectId, isDeleted: { $ne: true } });
};

// Static method to find feedback by document
FeedbackSchema.statics.findByDocument = function(documentId: string) {
  return this.find({ documentId, isDeleted: { $ne: true } });
};

// Instance method for soft delete
FeedbackSchema.methods.softDelete = function(this: any, userId: string, reason?: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.deleteReason = reason || 'Soft deleted by user';
  this.status = 'closed';
  
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
FeedbackSchema.methods.restore = function(this: any, userId: string, reason?: string) {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.deleteReason = undefined;
  this.status = 'open';
  
  // Add to audit trail
  if (!this.auditTrail) {
    this.auditTrail = [];
  }
  
  this.auditTrail.push({
    action: 'restored',
    timestamp: new Date(),
    userId: userId,
    reason: reason || 'Feedback restored by user'
  });
  
  return this.save();
};

// Instance method to add response
FeedbackSchema.methods.addResponse = function(this: any, userId: string, userName: string, message: string, isInternal: boolean = false) {
  if (!this.responses) {
    this.responses = [];
  }
  
  this.responses.push({
    userId,
    userName,
    message,
    timestamp: new Date(),
    isInternal
  });
  
  this.lastActivity = new Date();
  
  // Add to audit trail
  if (!this.auditTrail) {
    this.auditTrail = [];
  }
  
  this.auditTrail.push({
    action: 'updated',
    timestamp: new Date(),
    userId: userId,
    changes: ['responses'],
    reason: 'Response added'
  });
  
  return this.save();
};

// Instance method to increment view count
FeedbackSchema.methods.incrementViewCount = function(this: any) {
  this.viewCount += 1;
  this.lastViewed = new Date();
  return this.save();
};

export const FeedbackModel = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
