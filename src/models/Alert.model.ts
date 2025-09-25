import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAlertThresholdMethods {
  // Instance methods can be added here if needed
}

export interface IAlertThresholdStatics extends Model<IAlertThreshold, IAlertThresholdMethods> {
  getByMetric(metric: string, enabled?: boolean): Promise<IAlertThreshold[]>;
  getBySeverity(severity: string, enabled?: boolean): Promise<IAlertThreshold[]>;
  getByProject(projectId: string, enabled?: boolean): Promise<IAlertThreshold[]>;
}

export interface IAlertThreshold extends Document, IAlertThresholdMethods {
  id: string;
  name: string;
  description: string;
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
  value: number;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  enabled: boolean;
  cooldownMinutes: number;
  context?: {
    projectId?: string;
    userId?: string;
    provider?: string;
    model?: string;
    templateId?: string;
    documentType?: string;
  };
  metadata?: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlertMethods {
  // Instance methods can be added here if needed
}

export interface IAlertStatics extends Model<IAlert, IAlertMethods> {
  getActive(limit?: number): Promise<IAlert[]>;
  getBySeverity(severity: string, limit?: number): Promise<IAlert[]>;
  getByProject(projectId: string, limit?: number): Promise<IAlert[]>;
  getByMetric(metric: string, limit?: number): Promise<IAlert[]>;
  getRecentAlerts(hours?: number, limit?: number): Promise<IAlert[]>;
  getAlertStats(projectId?: string, days?: number): Promise<any>;
}

export interface IAlert extends Document, IAlertMethods {
  id: string;
  thresholdId: string;
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  deviationPercentage: number;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  title: string;
  description: string;
  context?: {
    projectId?: string;
    userId?: string;
    provider?: string;
    model?: string;
    templateId?: string;
    documentType?: string;
  };
  metadata?: mongoose.Schema.Types.Mixed;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface IAlertRuleMethods {
  // Instance methods can be added here if needed
}

export interface IAlertRuleStatics extends Model<IAlertRule, IAlertRuleMethods> {
  getActive(): Promise<IAlertRule[]>;
  getByPriority(priority: number): Promise<IAlertRule[]>;
}

export interface IAlertRule extends Document, IAlertRuleMethods {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    metric: string;
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'contains' | 'not_contains';
    value: any;
    timeWindow?: number;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
  }>;
  actions: Array<{
    type: 'email' | 'webhook' | 'slack' | 'teams' | 'dashboard' | 'log';
    config: mongoose.Schema.Types.Mixed;
    delay?: number;
  }>;
  enabled: boolean;
  priority: number;
  context?: mongoose.Schema.Types.Mixed;
  metadata?: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

const AlertThresholdSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  metric: { type: String, required: true },
  operator: { 
    type: String, 
    required: true, 
    enum: ['gt', 'lt', 'gte', 'lte', 'eq', 'neq']
  },
  value: { type: Number, required: true },
  severity: { 
    type: String, 
    required: true, 
    enum: ['info', 'warning', 'critical', 'emergency']
  },
  enabled: { type: Boolean, required: true, default: true },
  cooldownMinutes: { type: Number, required: true, default: 60 },
  context: {
    projectId: { type: String },
    userId: { type: String },
    provider: { type: String },
    model: { type: String },
    templateId: { type: String },
    documentType: { type: String }
  },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const AlertSchema: Schema = new Schema({
  thresholdId: { type: String, required: true },
  metric: { type: String, required: true },
  currentValue: { type: Number, required: true },
  expectedValue: { type: Number, required: true },
  deviation: { type: Number, required: true },
  deviationPercentage: { type: Number, required: true },
  severity: { 
    type: String, 
    required: true, 
    enum: ['info', 'warning', 'critical', 'emergency']
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['active', 'acknowledged', 'resolved', 'suppressed'],
    default: 'active'
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  context: {
    projectId: { type: String },
    userId: { type: String },
    provider: { type: String },
    model: { type: String },
    templateId: { type: String },
    documentType: { type: String }
  },
  metadata: { type: Schema.Types.Mixed, default: {} },
  triggeredAt: { type: Date, required: true, default: Date.now },
  acknowledgedAt: { type: Date },
  acknowledgedBy: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
  resolutionNotes: { type: String },
  lastTriggered: { type: Date },
  triggerCount: { type: Number, required: true, default: 1 }
}, { timestamps: true });

const AlertRuleSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  conditions: [{
    metric: { type: String, required: true },
    operator: { 
      type: String, 
      required: true, 
      enum: ['gt', 'lt', 'gte', 'lte', 'eq', 'neq', 'contains', 'not_contains']
    },
    value: { type: Schema.Types.Mixed, required: true },
    timeWindow: { type: Number },
    aggregation: { 
      type: String, 
      enum: ['sum', 'avg', 'count', 'min', 'max', 'median']
    }
  }],
  actions: [{
    type: { 
      type: String, 
      required: true, 
      enum: ['email', 'webhook', 'slack', 'teams', 'dashboard', 'log']
    },
    config: { type: Schema.Types.Mixed, required: true },
    delay: { type: Number }
  }],
  enabled: { type: Boolean, required: true, default: true },
  priority: { type: Number, required: true, default: 1 },
  context: { type: Schema.Types.Mixed, default: {} },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Indexes for better query performance
AlertThresholdSchema.index({ metric: 1, enabled: 1 });
AlertThresholdSchema.index({ severity: 1, enabled: 1 });
AlertThresholdSchema.index({ 'context.projectId': 1, enabled: 1 });

AlertSchema.index({ status: 1, severity: 1 });
AlertSchema.index({ triggeredAt: -1 });
AlertSchema.index({ 'context.projectId': 1, status: 1 });
AlertSchema.index({ thresholdId: 1, status: 1 });

AlertRuleSchema.index({ enabled: 1, priority: 1 });

// Static methods for AlertThreshold
AlertThresholdSchema.statics.getByMetric = async function (metric: string, enabled: boolean = true) {
  return this.find({ metric, enabled });
};

AlertThresholdSchema.statics.getBySeverity = async function (severity: string, enabled: boolean = true) {
  return this.find({ severity, enabled });
};

AlertThresholdSchema.statics.getByProject = async function (projectId: string, enabled: boolean = true) {
  return this.find({ 'context.projectId': projectId, enabled });
};

// Static methods for Alert
AlertSchema.statics.getActive = async function (limit: number = 100) {
  return this.find({ status: 'active' })
    .sort({ triggeredAt: -1 })
    .limit(limit);
};

AlertSchema.statics.getBySeverity = async function (severity: string, limit: number = 100) {
  return this.find({ severity })
    .sort({ triggeredAt: -1 })
    .limit(limit);
};

AlertSchema.statics.getByProject = async function (projectId: string, limit: number = 100) {
  return this.find({ 'context.projectId': projectId })
    .sort({ triggeredAt: -1 })
    .limit(limit);
};

AlertSchema.statics.getByMetric = async function (metric: string, limit: number = 100) {
  return this.find({ metric })
    .sort({ triggeredAt: -1 })
    .limit(limit);
};

AlertSchema.statics.getRecentAlerts = async function (hours: number = 24, limit: number = 100) {
  const cutoffDate = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({ triggeredAt: { $gte: cutoffDate } })
    .sort({ triggeredAt: -1 })
    .limit(limit);
};

AlertSchema.statics.getAlertStats = async function (projectId?: string, days: number = 30) {
  const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  const matchQuery: any = { triggeredAt: { $gte: cutoffDate } };
  
  if (projectId) {
    matchQuery['context.projectId'] = projectId;
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        activeAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        acknowledgedAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'acknowledged'] }, 1, 0] }
        },
        resolvedAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        alertsBySeverity: {
          $push: {
            severity: '$severity',
            status: '$status'
          }
        },
        alertsByMetric: {
          $push: {
            metric: '$metric',
            status: '$status'
          }
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalAlerts: 0,
      activeAlerts: 0,
      acknowledgedAlerts: 0,
      resolvedAlerts: 0,
      alertsBySeverity: {},
      alertsByMetric: {}
    };
  }

  const stat = stats[0];
  
  // Process severity breakdown
  const severityBreakdown = stat.alertsBySeverity.reduce((acc: any, alert: any) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});

  // Process metric breakdown
  const metricBreakdown = stat.alertsByMetric.reduce((acc: any, alert: any) => {
    acc[alert.metric] = (acc[alert.metric] || 0) + 1;
    return acc;
  }, {});

  return {
    totalAlerts: stat.totalAlerts,
    activeAlerts: stat.activeAlerts,
    acknowledgedAlerts: stat.acknowledgedAlerts,
    resolvedAlerts: stat.resolvedAlerts,
    alertsBySeverity: severityBreakdown,
    alertsByMetric: metricBreakdown
  };
};

// Static methods for AlertRule
AlertRuleSchema.statics.getActive = async function () {
  return this.find({ enabled: true }).sort({ priority: 1 });
};

AlertRuleSchema.statics.getByPriority = async function (priority: number) {
  return this.find({ priority, enabled: true });
};

export const AlertThreshold = mongoose.model<IAlertThreshold, IAlertThresholdStatics>('AlertThreshold', AlertThresholdSchema);
export const Alert = mongoose.model<IAlert, IAlertStatics>('Alert', AlertSchema);
export const AlertRule = mongoose.model<IAlertRule, IAlertRuleStatics>('AlertRule', AlertRuleSchema);
