// Document Feedback Model
// filepath: src/models/DocumentFeedback.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IDocumentFeedback extends Document {
  _id: string;
  projectId: string;
  documentType: string;
  documentPath: string;
  feedbackType: 'quality' | 'accuracy' | 'completeness' | 'clarity' | 'compliance' | 'suggestion';
  rating: number; // 1-5 scale
  title: string;
  description: string;
  suggestedImprovement?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-review' | 'implemented' | 'rejected' | 'closed';
  submittedBy: string; // Project manager/user ID
  submittedByName: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  implementedAt?: Date;
  tags: string[];
  category: string; // PMBOK category, BABOK category, etc.
  aiPromptImpact?: {
    affectedPrompts: string[];
    suggestedPromptChanges: string[];
  };
  qualityMetrics?: {
    beforeScore?: number;
    afterScore?: number;
    improvementMeasured?: boolean;
  };
  relatedFeedback?: string[]; // IDs of related feedback items
  attachments?: {
    fileName: string;
    filePath: string;
    fileType: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentFeedbackSchema: Schema = new Schema({
  projectId: {
    type: String,
    required: true,
    index: true
  },
  documentType: {
    type: String,
    required: true,
    index: true
  },
  documentPath: {
    type: String,
    required: true
  },
  feedbackType: {
    type: String,
    enum: ['quality', 'accuracy', 'completeness', 'clarity', 'compliance', 'suggestion'],
    required: true,
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  suggestedImprovement: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['open', 'in-review', 'implemented', 'rejected', 'closed'],
    default: 'open',
    index: true
  },
  submittedBy: {
    type: String,
    required: true,
    index: true
  },
  submittedByName: {
    type: String,
    required: true,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  reviewedBy: {
    type: String,
    index: true
  },
  reviewedAt: {
    type: Date
  },
  implementedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  category: {
    type: String,
    required: true,
    index: true
  },
  aiPromptImpact: {
    affectedPrompts: [{
      type: String
    }],
    suggestedPromptChanges: [{
      type: String
    }]
  },
  qualityMetrics: {
    beforeScore: {
      type: Number,
      min: 0,
      max: 100
    },
    afterScore: {
      type: Number,
      min: 0,
      max: 100
    },
    improvementMeasured: {
      type: Boolean,
      default: false
    }
  },
  relatedFeedback: [{
    type: Schema.Types.ObjectId,
    ref: 'DocumentFeedback'
  }],
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
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
DocumentFeedbackSchema.index({ projectId: 1, documentType: 1 });
DocumentFeedbackSchema.index({ submittedBy: 1, submittedAt: -1 });
DocumentFeedbackSchema.index({ status: 1, priority: 1 });
DocumentFeedbackSchema.index({ feedbackType: 1, category: 1 });
DocumentFeedbackSchema.index({ rating: 1 });
DocumentFeedbackSchema.index({ tags: 1 });

// Text search index
DocumentFeedbackSchema.index({ 
  title: 'text', 
  description: 'text', 
  suggestedImprovement: 'text' 
});

// Virtual for feedback age
DocumentFeedbackSchema.virtual('ageInDays').get(function(this: IDocumentFeedback) {
  return Math.ceil((Date.now() - this.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time
DocumentFeedbackSchema.virtual('resolutionTimeInDays').get(function(this: IDocumentFeedback) {
  if (this.implementedAt) {
    return Math.ceil((this.implementedAt.getTime() - this.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware to update status timestamps
DocumentFeedbackSchema.pre('save', function(this: IDocumentFeedback, next: any) {
  if (this.isModified('status')) {
    if (this.status === 'in-review' && !this.reviewedAt) {
      this.reviewedAt = new Date();
    }
    if (this.status === 'implemented' && !this.implementedAt) {
      this.implementedAt = new Date();
    }
  }
  next();
});

// Static methods for analytics
DocumentFeedbackSchema.statics.getProjectFeedbackStats = function(projectId: string) {
  return this.aggregate([
    { $match: { projectId } },
    {
      $group: {
        _id: null,
        totalFeedback: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        byType: {
          $push: {
            type: '$feedbackType',
            rating: '$rating'
          }
        },
        byStatus: {
          $push: {
            status: '$status',
            priority: '$priority'
          }
        }
      }
    }
  ]);
};

DocumentFeedbackSchema.statics.getFeedbackTrends = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { submittedAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          type: '$feedbackType'
        },
        count: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
};

export const DocumentFeedback = mongoose.model<IDocumentFeedback>('DocumentFeedback', DocumentFeedbackSchema);