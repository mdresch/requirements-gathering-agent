import mongoose, { Document, Schema } from 'mongoose';

export interface IRealTimeMetrics extends Document {
  id: string;
  timestamp: Date;
  type: 'user_activity' | 'document_generation' | 'template_usage' | 'adobe_integration' | 'api_usage' | 'system_performance';
  component: string;
  action: string;
  data: any;
  metadata: {
    userId?: string;
    projectId?: string;
    sessionId?: string;
    requestId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RealTimeMetricsSchema: Schema = new Schema({
  timestamp: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['user_activity', 'document_generation', 'template_usage', 'adobe_integration', 'api_usage', 'system_performance']
  },
  component: { 
    type: String, 
    required: true
  },
  action: { 
    type: String, 
    required: true
  },
  data: { 
    type: Schema.Types.Mixed, 
    required: true 
  },
  metadata: {
    userId: { type: String },
    projectId: { type: String },
    sessionId: { type: String },
    requestId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String }
  }
}, {
  timestamps: true,
  collection: 'realtime_metrics'
});

// Compound indexes for efficient querying
RealTimeMetricsSchema.index({ type: 1, timestamp: -1 });
RealTimeMetricsSchema.index({ component: 1, timestamp: -1 });
RealTimeMetricsSchema.index({ 'metadata.userId': 1, timestamp: -1 });
RealTimeMetricsSchema.index({ 'metadata.projectId': 1, timestamp: -1 });
RealTimeMetricsSchema.index({ 'metadata.sessionId': 1, timestamp: -1 });

// TTL index to automatically delete old metrics after 30 days
RealTimeMetricsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Pre-save middleware to ensure id field is set
RealTimeMetricsSchema.pre('save', function (this: any, next) {
  if (!this.id) {
    this.id = `metric_${this._id}`;
  }
  next();
});

export const RealTimeMetrics = mongoose.model<IRealTimeMetrics>('RealTimeMetrics', RealTimeMetricsSchema);
