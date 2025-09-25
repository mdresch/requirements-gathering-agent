// Phase 2: Compliance Workflow Model for MongoDB Atlas
// Stores workflow templates and instances for compliance issue resolution

import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'MANUAL' | 'AUTOMATED' | 'APPROVAL' | 'NOTIFICATION';
  assigneeRole?: string;
  estimatedDuration: number; // in hours
  requiredApprovals?: number;
  conditions?: string[];
  actions?: string[];
  order: number;
}

export interface IComplianceWorkflow extends Document {
  name: string;
  description: string;
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'GENERAL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  steps: IWorkflowStep[];
  metadata?: {
    version?: string;
    category?: string;
    tags?: string[];
    estimatedDuration?: number;
    successRate?: number;
    usageCount?: number;
  };
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkflowInstance extends Document {
  workflowId: string;
  issueId: string;
  projectId: string;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  currentStepId: string;
  startedAt: Date;
  completedAt?: Date;
  assignedTo: string;
  progress: number; // percentage
  steps: {
    stepId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
    startedAt?: Date;
    completedAt?: Date;
    assignedTo?: string;
    notes?: string;
    duration?: number; // actual duration in hours
  }[];
  metadata?: {
    priority?: string;
    category?: string;
    estimatedCompletion?: Date;
    actualDuration?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowStepSchema: Schema = new Schema({
  id: {
    type: String,
    required: true
  },
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
  type: {
    type: String,
    required: true,
    enum: ['MANUAL', 'AUTOMATED', 'APPROVAL', 'NOTIFICATION']
  },
  assigneeRole: {
    type: String,
    trim: true,
    maxlength: 100
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 0
  },
  requiredApprovals: {
    type: Number,
    min: 0
  },
  conditions: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  actions: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  order: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const ComplianceWorkflowSchema: Schema = new Schema({
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
  standardType: {
    type: String,
    required: true,
    enum: ['BABOK', 'PMBOK', 'DMBOK', 'ISO', 'GENERAL']
  },
  severity: {
    type: String,
    required: true,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
    default: 'DRAFT'
  },
  steps: [WorkflowStepSchema],
  metadata: {
    version: { type: String, default: '1.0' },
    category: String,
    tags: [String],
    estimatedDuration: Number,
    successRate: { type: Number, min: 0, max: 100 },
    usageCount: { type: Number, default: 0, min: 0 }
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

const WorkflowInstanceSchema: Schema = new Schema({
  workflowId: {
    type: String,
    required: true,
    ref: 'ComplianceWorkflow'
  },
  issueId: {
    type: String,
    required: true,
    ref: 'ComplianceIssue'
  },
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  status: {
    type: String,
    required: true,
    enum: ['RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'RUNNING'
  },
  currentStepId: {
    type: String,
    required: true
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  assignedTo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  steps: [{
    stepId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'FAILED'],
      default: 'PENDING'
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    assignedTo: {
      type: String,
      trim: true,
      maxlength: 100
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    duration: {
      type: Number,
      min: 0
    }
  }],
  metadata: {
    priority: String,
    category: String,
    estimatedCompletion: Date,
    actualDuration: Number
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

// Indexes for ComplianceWorkflow
ComplianceWorkflowSchema.index({ standardType: 1, severity: 1, status: 1 });
ComplianceWorkflowSchema.index({ status: 1, createdAt: -1 });
ComplianceWorkflowSchema.index({ createdBy: 1, createdAt: -1 });

// Text index for search functionality
ComplianceWorkflowSchema.index({
  name: 'text',
  description: 'text'
});

// Indexes for WorkflowInstance
WorkflowInstanceSchema.index({ workflowId: 1, status: 1 });
WorkflowInstanceSchema.index({ projectId: 1, status: 1, startedAt: -1 });
WorkflowInstanceSchema.index({ issueId: 1, status: 1 });
WorkflowInstanceSchema.index({ assignedTo: 1, status: 1 });
WorkflowInstanceSchema.index({ startedAt: -1 });

export const ComplianceWorkflow = mongoose.model<IComplianceWorkflow>('ComplianceWorkflow', ComplianceWorkflowSchema);
export const WorkflowInstance = mongoose.model<IWorkflowInstance>('WorkflowInstance', WorkflowInstanceSchema);

export default ComplianceWorkflow;
