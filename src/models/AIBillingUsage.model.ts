import mongoose, { Document, Schema } from 'mongoose';

export interface IAIBillingUsage extends Document {
  id: string;
  provider: string;
  aiModel: string;
  timestamp: Date;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    currency: string;
    amount: number;
    costPerToken: number;
    breakdown: {
      promptCost: number;
      completionCost: number;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      estimated?: boolean;
    };
  };
  metadata: {
    requestId?: string;
    projectId?: string;
    userId?: string;
    operation?: string;
    generationJobId?: string;
    documentId?: string;
    templateId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AIBillingUsageSchema: Schema = new Schema({
  provider: { 
    type: String, 
    required: true
  },
  aiModel: { 
    type: String, 
    required: true
  },
  timestamp: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  usage: {
    promptTokens: { type: Number, required: true },
    completionTokens: { type: Number, required: true },
    totalTokens: { type: Number, required: true }
  },
  cost: {
    currency: { type: String, required: true, default: 'USD' },
    amount: { type: Number, required: true },
    costPerToken: { type: Number, required: true },
    breakdown: {
      promptCost: { type: Number, required: true },
      completionCost: { type: Number, required: true },
      promptTokens: { type: Number, required: true },
      completionTokens: { type: Number, required: true },
      totalTokens: { type: Number, required: true },
      estimated: { type: Boolean, default: false }
    }
  },
  metadata: {
    requestId: { type: String },
    projectId: { type: String },
    userId: { type: String },
    operation: { type: String },
    generationJobId: { type: String },
    documentId: { type: String },
    templateId: { type: String }
  }
}, {
  timestamps: true,
  collection: 'ai_billing_usage'
});

// Compound indexes for efficient querying
AIBillingUsageSchema.index({ provider: 1, timestamp: -1 });
AIBillingUsageSchema.index({ 'metadata.projectId': 1, timestamp: -1 });
AIBillingUsageSchema.index({ 'metadata.userId': 1, timestamp: -1 });
AIBillingUsageSchema.index({ 'metadata.generationJobId': 1 });
AIBillingUsageSchema.index({ provider: 1, model: 1, timestamp: -1 });

// TTL index to automatically delete old records after 1 year
AIBillingUsageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Pre-save middleware to ensure id field is set
AIBillingUsageSchema.pre('save', function (this: any, next) {
  if (!this.id) {
    this.id = `billing_${this._id}`;
  }
  next();
});

// Static method to get usage summary
AIBillingUsageSchema.statics.getUsageSummary = function(
  provider?: string,
  projectId?: string,
  userId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const match: any = {};
  
  if (provider) match.provider = provider;
  if (projectId) match['metadata.projectId'] = projectId;
  if (userId) match['metadata.userId'] = userId;
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$cost.amount' },
        totalTokens: { $sum: '$usage.totalTokens' },
        totalRequests: { $sum: 1 },
        averageCostPerRequest: { $avg: '$cost.amount' },
        averageTokensPerRequest: { $avg: '$usage.totalTokens' },
        providers: { $addToSet: '$provider' },
        models: { $addToSet: '$model' }
      }
    }
  ]);
};

// Static method to get usage by time period
AIBillingUsageSchema.statics.getUsageByPeriod = function(
  period: 'hour' | 'day' | 'week' | 'month',
  provider?: string,
  projectId?: string,
  userId?: string,
  limit: number = 100
) {
  const match: any = {};
  
  if (provider) match.provider = provider;
  if (projectId) match['metadata.projectId'] = projectId;
  if (userId) match['metadata.userId'] = userId;

  let groupFormat: string;
  let dateFormat: any;

  switch (period) {
    case 'hour':
      groupFormat = '%Y-%m-%d %H:00:00';
      dateFormat = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' },
        hour: { $hour: '$timestamp' }
      };
      break;
    case 'day':
      groupFormat = '%Y-%m-%d';
      dateFormat = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' }
      };
      break;
    case 'week':
      groupFormat = '%Y-W%U';
      dateFormat = {
        year: { $year: '$timestamp' },
        week: { $week: '$timestamp' }
      };
      break;
    case 'month':
      groupFormat = '%Y-%m';
      dateFormat = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' }
      };
      break;
    default:
      throw new Error('Invalid period specified');
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: dateFormat,
        totalCost: { $sum: '$cost.amount' },
        totalTokens: { $sum: '$usage.totalTokens' },
        totalRequests: { $sum: 1 },
        averageCostPerRequest: { $avg: '$cost.amount' }
      }
    },
    { $sort: { '_id': 1 } },
    { $limit: limit }
  ]);
};

export const AIBillingUsage = mongoose.model<IAIBillingUsage>('AIBillingUsage', AIBillingUsageSchema);
