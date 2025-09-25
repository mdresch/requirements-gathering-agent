// Phase 2: Compliance Notification Model for MongoDB Atlas
// Stores real-time notifications for compliance events

import mongoose, { Schema, Document } from 'mongoose';

export interface IComplianceNotification extends Document {
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' | 'COMPLIANCE_UPDATE' | 'ISSUE_CREATED' | 'ISSUE_RESOLVED' | 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'COMPLIANCE' | 'ISSUE' | 'WORKFLOW' | 'SYSTEM' | 'USER';
  projectId?: string;
  issueId?: string;
  workflowId?: string;
  userId?: string;
  actions?: {
    label: string;
    action: string;
    type: 'primary' | 'secondary' | 'danger';
  }[];
  metadata?: {
    source?: string;
    version?: string;
    tags?: string[];
    relatedEntities?: string[];
    context?: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceNotificationSchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'WARNING', 'ERROR', 'INFO', 'COMPLIANCE_UPDATE', 'ISSUE_CREATED', 'ISSUE_RESOLVED', 'WORKFLOW_STARTED', 'WORKFLOW_COMPLETED', 'SYSTEM']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  read: {
    type: Boolean,
    required: true,
    default: false
  },
  priority: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
  },
  category: {
    type: String,
    required: true,
    enum: ['COMPLIANCE', 'ISSUE', 'WORKFLOW', 'SYSTEM', 'USER']
  },
  projectId: {
    type: String,
    ref: 'Project'
  },
  issueId: {
    type: String,
    ref: 'ComplianceIssue'
  },
  workflowId: {
    type: String,
    ref: 'ComplianceWorkflow'
  },
  userId: {
    type: String,
    ref: 'User'
  },
  actions: [{
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    type: {
      type: String,
      required: true,
      enum: ['primary', 'secondary', 'danger']
    }
  }],
  metadata: {
    source: String,
    version: String,
    tags: [String],
    relatedEntities: [String],
    context: Schema.Types.Mixed
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
ComplianceNotificationSchema.index({ projectId: 1, read: 1, timestamp: -1 });
ComplianceNotificationSchema.index({ userId: 1, read: 1, timestamp: -1 });
ComplianceNotificationSchema.index({ category: 1, priority: 1, timestamp: -1 });
ComplianceNotificationSchema.index({ type: 1, timestamp: -1 });
ComplianceNotificationSchema.index({ read: 1, timestamp: -1 });

// Compound index for notification queries
ComplianceNotificationSchema.index({ 
  projectId: 1, 
  read: 1, 
  timestamp: -1 
}, { 
  name: 'notification_query_index' 
});

// Text index for search functionality
ComplianceNotificationSchema.index({
  title: 'text',
  message: 'text'
});

export default mongoose.model<IComplianceNotification>('ComplianceNotification', ComplianceNotificationSchema);
