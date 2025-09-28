// Phase 2: Compliance Issues Model for MongoDB Atlas
// Stores compliance issues and their management data

import mongoose, { Schema, Document } from 'mongoose';

export interface IComplianceIssue extends Document {
  projectId: string;
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
  issueType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  title: string;
  description?: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'REVIEW' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  createdBy: string;
  updatedBy?: string;
  tags?: string[];
  metadata?: {
    category?: string;
    subcategory?: string;
    impact?: string;
    effort?: string;
    businessValue?: number;
    technicalDebt?: number;
  };
  comments?: {
    id: string;
    text: string;
    author: string;
    createdAt: Date;
    updatedAt?: Date;
  }[];
  history?: {
    action: string;
    description: string;
    user: string;
    timestamp: Date;
    changes?: any;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceIssueSchema: Schema = new Schema({
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  standardType: {
    type: String,
    required: true,
    enum: ['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'OVERALL']
  },
  issueType: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  severity: {
    type: String,
    required: true,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    required: true,
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  priority: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  assigneeId: {
    type: String,
    trim: true,
    maxlength: 100
  },
  dueDate: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  createdBy: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  updatedBy: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  metadata: {
    category: String,
    subcategory: String,
    impact: String,
    effort: String,
    businessValue: { type: Number, min: 0, max: 10 },
    technicalDebt: { type: Number, min: 0, max: 10 }
  },
  comments: [{
    id: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date
    }
  }],
  history: [{
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    user: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changes: Schema.Types.Mixed
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
ComplianceIssueSchema.index({ projectId: 1, standardType: 1, status: 1 });
ComplianceIssueSchema.index({ projectId: 1, severity: 1, status: 1 });
ComplianceIssueSchema.index({ projectId: 1, assigneeId: 1, status: 1 });
ComplianceIssueSchema.index({ projectId: 1, createdAt: -1 });
ComplianceIssueSchema.index({ status: 1, priority: 1, createdAt: -1 });
ComplianceIssueSchema.index({ dueDate: 1, status: 1 });

// Text index for search functionality
ComplianceIssueSchema.index({
  title: 'text',
  description: 'text',
  issueType: 'text',
  tags: 'text'
});

const ComplianceIssueModel = mongoose.model<IComplianceIssue>('ComplianceIssue', ComplianceIssueSchema);

export default ComplianceIssueModel;
export { ComplianceIssueModel };
