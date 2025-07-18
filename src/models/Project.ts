// Project Model
// filepath: src/models/Project.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'review' | 'completed' | 'archived';
  framework: 'babok' | 'pmbok' | 'multi';
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
    enum: ['babok', 'pmbok', 'multi'],
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

// Pre-save middleware to update compliance score based on documents and stakeholders
ProjectSchema.pre('save', function(this: IProject, next: any) {
  if (this.isModified('documents') || this.isModified('stakeholders')) {
    // Simple compliance score calculation
    const docScore = Math.min((this.documents || 0) * 5, 50); // Max 50 points for documents
    const stakeholderScore = Math.min((this.stakeholders || 0) * 3, 30); // Max 30 points for stakeholders
    const baseScore = 20; // Base score for having a project
    
    this.complianceScore = Math.min(docScore + stakeholderScore + baseScore, 100);
  }
  next();
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
