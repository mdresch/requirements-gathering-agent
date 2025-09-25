import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSession extends Document {
  id: string;
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  startTime: Date;
  lastActivity: Date;
  endTime?: Date;
  isActive: boolean;
  activities: Array<{
    timestamp: Date;
    type: 'page_view' | 'document_created' | 'template_used' | 'search' | 'download' | 'upload' | 'login' | 'logout';
    component: string;
    duration?: number;
    metadata: any;
  }>;
  metadata: {
    referer?: string;
    browser?: string;
    os?: string;
    device?: string;
    country?: string;
    city?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionSchema: Schema = new Schema({
  userId: { 
    type: String, 
    required: true
  },
  sessionId: { 
    type: String, 
    required: true, 
    unique: true
  },
  ipAddress: { 
    type: String, 
    required: true
  },
  userAgent: { 
    type: String, 
    required: true 
  },
  startTime: { 
    type: Date, 
    required: true, 
    default: Date.now
  },
  lastActivity: { 
    type: Date, 
    required: true, 
    default: Date.now
  },
  endTime: { 
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true
  },
  activities: [{
    timestamp: { type: Date, required: true, default: Date.now },
    type: { 
      type: String, 
      required: true,
      enum: ['page_view', 'document_created', 'template_used', 'search', 'download', 'upload', 'login', 'logout']
    },
    component: { type: String, required: true },
    duration: { type: Number },
    metadata: { type: Schema.Types.Mixed, default: {} }
  }],
  metadata: {
    referer: { type: String },
    browser: { type: String },
    os: { type: String },
    device: { type: String },
    country: { type: String },
    city: { type: String }
  }
}, {
  timestamps: true,
  collection: 'user_sessions'
});

// Compound indexes for efficient querying
UserSessionSchema.index({ userId: 1, isActive: 1 });
UserSessionSchema.index({ startTime: -1 });
UserSessionSchema.index({ lastActivity: -1 });
UserSessionSchema.index({ 'activities.type': 1, 'activities.timestamp': -1 });

// TTL index to automatically delete inactive sessions after 30 days
UserSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Pre-save middleware to update lastActivity
UserSessionSchema.pre('save', function (this: any, next) {
  this.lastActivity = new Date();
  next();
});

// Method to add activity to session
UserSessionSchema.methods.addActivity = function(activity: {
  type: 'page_view' | 'document_created' | 'template_used' | 'search' | 'download' | 'upload' | 'login' | 'logout';
  component: string;
  duration?: number;
  metadata?: any;
}) {
  this.activities.push({
    timestamp: new Date(),
    ...activity
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to end session
UserSessionSchema.methods.endSession = function() {
  this.isActive = false;
  this.endTime = new Date();
  return this.save();
};

// Static method to get active sessions for a user
UserSessionSchema.statics.getActiveSessions = function(userId: string) {
  return this.find({ userId, isActive: true }).sort({ lastActivity: -1 });
};

// Static method to cleanup inactive sessions
UserSessionSchema.statics.cleanupInactiveSessions = function(inactiveThresholdMinutes: number = 30) {
  const threshold = new Date(Date.now() - inactiveThresholdMinutes * 60 * 1000);
  return this.updateMany(
    { 
      isActive: true, 
      lastActivity: { $lt: threshold } 
    },
    { 
      $set: { 
        isActive: false, 
        endTime: new Date() 
      } 
    }
  );
};

export const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);
