import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditTrail extends Document {
  // Core audit fields
  entityType: 'template' | 'project' | 'category' | 'feedback' | 'stakeholder' | 'document' | 'user' | 'system';
  entityId: string;
  entityName?: string; // Human-readable name for the entity
  
  // Action details
  action: 'created' | 'updated' | 'deleted' | 'restored' | 'activated' | 'deactivated' | 'assigned' | 'unassigned' | 'status_changed' | 'permission_changed' | 'login' | 'logout' | 'export' | 'import';
  actionDescription?: string; // Detailed description of what happened
  
  // User information
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  
  // Change tracking
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
    changeType: 'added' | 'modified' | 'removed';
  }[];
  
  // Context information
  projectId?: string;
  projectName?: string;
  documentId?: string;
  documentName?: string;
  
  // Request context
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  
  // Additional metadata
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'data_change' | 'access' | 'system' | 'security' | 'compliance' | 'workflow';
  tags?: string[];
  
  // Timestamps
  timestamp: Date;
  createdAt: Date;
  
  // Retention and archival
  retentionPeriod?: number; // Days to retain this audit record
  isArchived: boolean;
  archivedAt?: Date;
  
  // Compliance and reporting
  complianceFramework?: 'sox' | 'gdpr' | 'hipaa' | 'pci' | 'iso27001' | 'custom';
  requiresReview: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

const AuditTrailSchema: Schema = new Schema({
  // Core audit fields
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    enum: {
      values: ['template', 'project', 'category', 'feedback', 'stakeholder', 'document', 'user', 'system'],
      message: 'Entity type must be one of: template, project, category, feedback, stakeholder, document, user, system'
    }
  },
  entityId: {
    type: String,
    required: [true, 'Entity ID is required'],
    trim: true,
    maxlength: [100, 'Entity ID cannot exceed 100 characters']
  },
  entityName: {
    type: String,
    trim: true,
    maxlength: [200, 'Entity name cannot exceed 200 characters']
  },
  
  // Action details
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: {
      values: ['created', 'updated', 'deleted', 'restored', 'activated', 'deactivated', 'assigned', 'unassigned', 'status_changed', 'permission_changed', 'login', 'logout', 'export', 'import'],
      message: 'Action must be one of: created, updated, deleted, restored, activated, deactivated, assigned, unassigned, status_changed, permission_changed, login, logout, export, import'
    }
  },
  actionDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Action description cannot exceed 500 characters']
  },
  
  // User information
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
  userEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [255, 'User email cannot exceed 255 characters'],
    match: [/^\S+@\S+\.\S+$/, 'User email must be a valid email address']
  },
  userRole: {
    type: String,
    trim: true,
    maxlength: [50, 'User role cannot exceed 50 characters']
  },
  
  // Change tracking
  changes: [{
    field: {
      type: String,
      required: [true, 'Change field is required'],
      maxlength: [100, 'Field name cannot exceed 100 characters']
    },
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    changeType: {
      type: String,
      required: [true, 'Change type is required'],
      enum: {
        values: ['added', 'modified', 'removed'],
        message: 'Change type must be one of: added, modified, removed'
      }
    }
  }],
  
  // Context information
  projectId: {
    type: String,
    trim: true,
    maxlength: [100, 'Project ID cannot exceed 100 characters']
  },
  projectName: {
    type: String,
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  documentId: {
    type: String,
    trim: true,
    maxlength: [100, 'Document ID cannot exceed 100 characters']
  },
  documentName: {
    type: String,
    trim: true,
    maxlength: [200, 'Document name cannot exceed 200 characters']
  },
  
  // Request context
  ipAddress: {
    type: String,
    trim: true,
    maxlength: [45, 'IP address cannot exceed 45 characters'], // IPv6 max length
    match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, 'IP address must be valid IPv4 or IPv6']
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: [500, 'User agent cannot exceed 500 characters']
  },
  requestId: {
    type: String,
    trim: true,
    maxlength: [100, 'Request ID cannot exceed 100 characters']
  },
  sessionId: {
    type: String,
    trim: true,
    maxlength: [100, 'Session ID cannot exceed 100 characters']
  },
  
  // Additional metadata
  severity: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Severity must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  category: {
    type: String,
    enum: {
      values: ['data_change', 'access', 'system', 'security', 'compliance', 'workflow'],
      message: 'Category must be one of: data_change, access, system, security, compliance, workflow'
    },
    default: 'data_change'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  }],
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Retention and archival
  retentionPeriod: {
    type: Number,
    default: 2555, // 7 years in days (default for compliance)
    min: [1, 'Retention period must be at least 1 day'],
    max: [3650, 'Retention period cannot exceed 10 years']
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  
  // Compliance and reporting
  complianceFramework: {
    type: String,
    enum: {
      values: ['sox', 'gdpr', 'hipaa', 'pci', 'iso27001', 'custom'],
      message: 'Compliance framework must be one of: sox, gdpr, hipaa, pci, iso27001, custom'
    }
  },
  requiresReview: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: String,
    trim: true,
    maxlength: [100, 'Reviewed by field cannot exceed 100 characters']
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters']
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }, // No updatedAt for audit trails
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
AuditTrailSchema.index({ entityType: 1, entityId: 1 });
AuditTrailSchema.index({ userId: 1, timestamp: -1 });
AuditTrailSchema.index({ action: 1, timestamp: -1 });
AuditTrailSchema.index({ projectId: 1, timestamp: -1 });
AuditTrailSchema.index({ documentId: 1, timestamp: -1 });
AuditTrailSchema.index({ timestamp: -1 });
AuditTrailSchema.index({ severity: 1, category: 1 });
AuditTrailSchema.index({ isArchived: 1, timestamp: -1 });
AuditTrailSchema.index({ requiresReview: 1, timestamp: -1 });
AuditTrailSchema.index({ complianceFramework: 1, timestamp: -1 });

// Compound indexes for common queries
AuditTrailSchema.index({ entityType: 1, action: 1, timestamp: -1 });
AuditTrailSchema.index({ userId: 1, entityType: 1, timestamp: -1 });
AuditTrailSchema.index({ projectId: 1, entityType: 1, timestamp: -1 });

// Text search index
AuditTrailSchema.index({ 
  entityName: 'text',
  actionDescription: 'text',
  userName: 'text'
});

// TTL index for automatic cleanup based on retention period
AuditTrailSchema.index(
  { timestamp: 1 }, 
  { 
    expireAfterSeconds: 0, // Will be set dynamically based on retentionPeriod
    partialFilterExpression: { isArchived: false }
  }
);

// Pre-save middleware to set TTL based on retention period
AuditTrailSchema.pre('save', function(this: IAuditTrail, next: any) {
  // Set TTL for automatic cleanup
  if (!this.isArchived && this.retentionPeriod) {
    const expireAt = new Date(this.timestamp.getTime() + (this.retentionPeriod * 24 * 60 * 60 * 1000));
    (this as any).expireAt = expireAt;
  }
  
  // Auto-archive old records
  const archiveThreshold = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)); // 1 year
  if (this.timestamp < archiveThreshold && !this.isArchived) {
    this.isArchived = true;
    this.archivedAt = new Date();
  }
  
  next();
});

// Static method to find audit trails by entity
AuditTrailSchema.statics.findByEntity = function(entityType: string, entityId: string) {
  return this.find({ entityType, entityId }).sort({ timestamp: -1 });
};

// Static method to find audit trails by user
AuditTrailSchema.statics.findByUser = function(userId: string, limit: number = 100) {
  return this.find({ userId }).sort({ timestamp: -1 }).limit(limit);
};

// Static method to find audit trails by project
AuditTrailSchema.statics.findByProject = function(projectId: string) {
  return this.find({ projectId }).sort({ timestamp: -1 });
};

// Static method to find audit trails requiring review
AuditTrailSchema.statics.findRequiringReview = function() {
  return this.find({ requiresReview: true, reviewedBy: { $exists: false } }).sort({ timestamp: -1 });
};

// Static method to find audit trails by compliance framework
AuditTrailSchema.statics.findByComplianceFramework = function(framework: string) {
  return this.find({ complianceFramework: framework }).sort({ timestamp: -1 });
};

// Static method to get audit summary for an entity
AuditTrailSchema.statics.getEntitySummary = function(entityType: string, entityId: string) {
  return this.aggregate([
    { $match: { entityType, entityId } },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastOccurrence: { $max: '$timestamp' },
        users: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        action: '$_id',
        count: 1,
        lastOccurrence: 1,
        uniqueUsers: { $size: '$users' }
      }
    }
  ]);
};

// Instance method to mark as reviewed
AuditTrailSchema.methods.markAsReviewed = function(this: any, reviewedBy: string, notes?: string) {
  this.requiresReview = false;
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  
  return this.save();
};

// Instance method to archive
AuditTrailSchema.methods.archive = function(this: any) {
  this.isArchived = true;
  this.archivedAt = new Date();
  
  return this.save();
};

export const AuditTrailModel = mongoose.model<IAuditTrail>('AuditTrail', AuditTrailSchema);
