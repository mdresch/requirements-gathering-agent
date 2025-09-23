// Project Document Model
// filepath: src/models/ProjectDocument.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectDocument extends Document {
  _id: string;
  projectId: string;
  name: string;
  type: string;
  category: string;
  content: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  version: string;
  framework: 'babok' | 'pmbok' | 'multi';
  qualityScore: number;
  wordCount: number;
  tags: string[];
  generatedAt: Date;
  generatedBy: string;
  lastModified: Date;
  lastModifiedBy: string;
  metadata?: {
    templateId?: string;
    generationJobId?: string;
    complianceScore?: number;
    automatedChecks?: any[];
    qualityAssessment?: any;
    contextMetrics?: {
      inputTokens: number;
      systemPromptTokens: number;
      userPromptTokens: number;
      projectContextTokens: number;
      templateTokens: number;
      outputTokens: number;
      responseTokens: number;
      totalTokensUsed: number;
      contextWindowSize: number;
      contextUtilizationPercentage: number;
      provider: string;
      model: string;
      generatedAt: Date;
      processingTimeMs: number;
    };
  };
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectDocumentSchema: Schema = new Schema({
  projectId: {
    type: String,
    required: true,
    index: true,
    ref: 'Project'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published'],
    default: 'draft',
    required: true,
    index: true
  },
  version: {
    type: String,
    default: '1.0',
    trim: true,
    maxlength: 20
  },
  framework: {
    type: String,
    enum: ['babok', 'pmbok', 'multi'],
    required: true,
    index: true
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  wordCount: {
    type: Number,
    min: 0,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  generatedBy: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  lastModified: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastModifiedBy: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  metadata: {
    templateId: String,
    generationJobId: String,
    complianceScore: { type: Number, min: 0, max: 100 },
    automatedChecks: [Schema.Types.Mixed]
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true
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
ProjectDocumentSchema.index({ projectId: 1, type: 1 });
ProjectDocumentSchema.index({ projectId: 1, status: 1 });
ProjectDocumentSchema.index({ projectId: 1, framework: 1 });
ProjectDocumentSchema.index({ generatedAt: -1 });
ProjectDocumentSchema.index({ lastModified: -1 });

// Pre-save middleware to update word count
ProjectDocumentSchema.pre('save', function(this: IProjectDocument, next: any) {
  if (this.isModified('content')) {
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
    this.lastModified = new Date();
  }
  next();
});

export const ProjectDocument = mongoose.model<IProjectDocument>('ProjectDocument', ProjectDocumentSchema);
