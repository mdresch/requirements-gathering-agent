import mongoose, { Document, Schema } from 'mongoose';

export interface IStakeholder extends Document {
  _id: string;
  projectId: string;
  name: string;
  title: string;
  role: 'project_manager' | 'sponsor' | 'team_member' | 'end_user' | 'stakeholder';
  email?: string;
  phone?: string;
  department?: string;
  influence: 'low' | 'medium' | 'high' | 'critical';
  interest: 'low' | 'medium' | 'high';
  powerLevel: number; // 1-5 scale
  engagementLevel: number; // 1-5 scale
  communicationPreference: 'email' | 'phone' | 'meeting' | 'portal';
  availability: {
    timezone: string;
    workingHours: string;
    preferredMeetingTimes: string[];
  };
  requirements: string[];
  concerns: string[];
  expectations: string[];
  isActive: boolean;
  lastContact?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StakeholderSchema: Schema = new Schema({
  projectId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  role: {
    type: String,
    enum: ['project_manager', 'sponsor', 'team_member', 'end_user', 'stakeholder'],
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 255
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  influence: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  interest: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  powerLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  engagementLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  communicationPreference: {
    type: String,
    enum: ['email', 'phone', 'meeting', 'portal'],
    default: 'email'
  },
  availability: {
    timezone: { type: String, default: 'UTC' },
    workingHours: { type: String, default: '9:00-17:00' },
    preferredMeetingTimes: [{ type: String }]
  },
  requirements: [{
    type: String,
    maxlength: 500
  }],
  concerns: [{
    type: String,
    maxlength: 500
  }],
  expectations: [{
    type: String,
    maxlength: 500
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastContact: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 1000
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
StakeholderSchema.index({ projectId: 1, role: 1 });
StakeholderSchema.index({ projectId: 1, isActive: 1 });
StakeholderSchema.index({ name: 'text', title: 'text' });

// Virtual for stakeholder priority score
StakeholderSchema.virtual('priorityScore').get(function(this: IStakeholder) {
  const powerWeight = this.powerLevel * 2;
  const influenceWeight = this.influence === 'critical' ? 10 : 
                         this.influence === 'high' ? 8 :
                         this.influence === 'medium' ? 5 : 2;
  const interestWeight = this.interest === 'high' ? 3 :
                        this.interest === 'medium' ? 2 : 1;
  
  return powerWeight + influenceWeight + interestWeight;
});

export const Stakeholder = mongoose.model<IStakeholder>('Stakeholder', StakeholderSchema);
