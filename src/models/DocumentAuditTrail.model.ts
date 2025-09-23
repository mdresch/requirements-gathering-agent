import mongoose, { Document, Schema } from 'mongoose';

export interface IDocumentAuditTrail extends Document {
  // Document identification
  documentId: string;
  documentName: string;
  documentType: string;
  projectId: string;
  projectName: string;
  
  // Action details
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'downloaded' | 'shared' | 'feedback_submitted' | 'quality_assessed' | 'status_changed' | 'regenerated';
  actionDescription: string;
  
  // User information
  userId?: string;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  
  // Change details
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  
  // Context information
  contextData?: {
    aiProvider?: string;
    aiModel?: string;
    tokensUsed?: number;
    qualityScore?: number;
    generationTime?: number;
    templateUsed?: string;
    framework?: string;
    dependencies?: string[];
    optimizationStrategy?: string;
    contextUtilization?: number;
  };
  
  // Technical details
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Metadata
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'document' | 'quality' | 'user' | 'system' | 'ai';
  
  // Additional information
  notes?: string;
  tags?: string[];
  relatedDocumentIds?: string[];
  
  // System fields
  createdAt: Date;
  updatedAt: Date;
}

const DocumentAuditTrailSchema = new Schema<IDocumentAuditTrail>({
  // Document identification
  documentId: {
    type: String,
    required: true,
    index: true
  },
  documentName: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true,
    index: true
  },
  projectName: {
    type: String,
    required: true
  },
  
  // Action details
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'viewed', 'downloaded', 'shared', 'feedback_submitted', 'quality_assessed', 'status_changed', 'regenerated'],
    index: true
  },
  actionDescription: {
    type: String,
    required: true
  },
  
  // User information
  userId: {
    type: String,
    index: true
  },
  userName: {
    type: String
  },
  userRole: {
    type: String
  },
  userEmail: {
    type: String
  },
  
  // Change details
  previousValues: {
    type: Schema.Types.Mixed,
    default: {}
  },
  newValues: {
    type: Schema.Types.Mixed,
    default: {}
  },
  changedFields: {
    type: [String],
    default: []
  },
  
  // Context information
  contextData: {
    aiProvider: String,
    aiModel: String,
    tokensUsed: Number,
    qualityScore: Number,
    generationTime: Number,
    templateUsed: String,
    framework: String,
    dependencies: [String],
    optimizationStrategy: String,
    contextUtilization: Number
  },
  
  // Technical details
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['document', 'quality', 'user', 'system', 'ai'],
    default: 'document',
    index: true
  },
  
  // Additional information
  notes: String,
  tags: [String],
  relatedDocumentIds: [String],
  
  // System fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'document_audit_trails'
});

// Indexes for efficient querying
DocumentAuditTrailSchema.index({ documentId: 1, timestamp: -1 });
DocumentAuditTrailSchema.index({ projectId: 1, timestamp: -1 });
DocumentAuditTrailSchema.index({ userId: 1, timestamp: -1 });
DocumentAuditTrailSchema.index({ action: 1, timestamp: -1 });
DocumentAuditTrailSchema.index({ category: 1, severity: 1 });
DocumentAuditTrailSchema.index({ timestamp: -1 });

// Virtual for human-readable timestamp
DocumentAuditTrailSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - this.timestamp.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return this.timestamp.toLocaleDateString();
  }
});

// Method to get audit summary
DocumentAuditTrailSchema.methods.getAuditSummary = function() {
  return {
    id: this._id,
    documentName: this.documentName,
    action: this.action,
    actionDescription: this.actionDescription,
    userName: this.userName,
    timestamp: this.timestamp,
    timeAgo: this.timeAgo,
    severity: this.severity,
    category: this.category
  };
};

// Method to get detailed context
DocumentAuditTrailSchema.methods.getDetailedContext = function() {
  return {
    documentId: this.documentId,
    documentName: this.documentName,
    documentType: this.documentType,
    projectName: this.projectName,
    action: this.action,
    actionDescription: this.actionDescription,
    user: {
      id: this.userId,
      name: this.userName,
      role: this.userRole,
      email: this.userEmail
    },
    changes: {
      previousValues: this.previousValues,
      newValues: this.newValues,
      changedFields: this.changedFields
    },
    context: this.contextData,
    technical: {
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      sessionId: this.sessionId
    },
    metadata: {
      timestamp: this.timestamp,
      severity: this.severity,
      category: this.category,
      notes: this.notes,
      tags: this.tags
    }
  };
};

// Pre-save middleware to update timestamp
DocumentAuditTrailSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const DocumentAuditTrail = mongoose.model<IDocumentAuditTrail>('DocumentAuditTrail', DocumentAuditTrailSchema);

export default DocumentAuditTrail;

