// Phase 1 & 2: Compliance Metrics Model for MongoDB Atlas
// Stores compliance metrics and scores for different standards

import mongoose, { Schema, Document } from 'mongoose';

export interface IComplianceMetrics extends Document {
  projectId: string;
  standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
  score: number;
  dataSource: string;
  calculatedAt: Date;
  metadata?: {
    version?: string;
    framework?: string;
    category?: string;
    subcategory?: string;
    weight?: number;
    maxScore?: number;
    minScore?: number;
  };
  trends?: {
    previousScore?: number;
    changePercentage?: number;
    trendDirection?: 'IMPROVING' | 'STABLE' | 'DECLINING';
    period?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceMetricsSchema: Schema = new Schema({
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
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  dataSource: {
    type: String,
    required: true,
    default: 'api'
  },
  calculatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  metadata: {
    version: String,
    framework: String,
    category: String,
    subcategory: String,
    weight: { type: Number, min: 0, max: 1 },
    maxScore: { type: Number, min: 0, max: 100 },
    minScore: { type: Number, min: 0, max: 100 }
  },
  trends: {
    previousScore: { type: Number, min: 0, max: 100 },
    changePercentage: Number,
    trendDirection: {
      type: String,
      enum: ['IMPROVING', 'STABLE', 'DECLINING']
    },
    period: String
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
ComplianceMetricsSchema.index({ projectId: 1, standardType: 1, calculatedAt: -1 });
ComplianceMetricsSchema.index({ projectId: 1, calculatedAt: -1 });
ComplianceMetricsSchema.index({ standardType: 1, calculatedAt: -1 });

// Compound index for dashboard queries
ComplianceMetricsSchema.index({ 
  projectId: 1, 
  standardType: 1, 
  calculatedAt: -1 
}, { 
  name: 'dashboard_query_index' 
});

const ComplianceMetricsModel = mongoose.model<IComplianceMetrics>('ComplianceMetrics', ComplianceMetricsSchema);

export default ComplianceMetricsModel;
export { ComplianceMetricsModel };
