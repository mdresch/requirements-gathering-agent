import mongoose, { Schema, Document } from 'mongoose';

export interface IGenerationJob extends Document {
  id: string;
  projectId: string;
  templateId: string;
  templateName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  outputFormat: string;
  outputPath?: string;
  downloadUrl?: string;
  error?: string;
  metadata: {
    framework?: string;
    category?: string;
    documentType?: string;
    generatedBy?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    fileSize?: number;
    qualityScore?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

const GenerationJobSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  projectId: { type: String, required: true, index: true, ref: 'Project' },
  templateId: { type: String, required: true, index: true },
  templateName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    required: true,
    index: true
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  outputFormat: { type: String, required: true },
  outputPath: { type: String },
  downloadUrl: { type: String },
  error: { type: String },
  metadata: {
    framework: { type: String },
    category: { type: String },
    documentType: { type: String },
    generatedBy: { type: String, default: 'ADPA-System' },
    estimatedDuration: { type: Number },
    actualDuration: { type: Number },
    fileSize: { type: Number },
    qualityScore: { type: Number }
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  completedAt: { type: Date },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
    message: { type: String, required: true }
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
GenerationJobSchema.index({ projectId: 1, status: 1 });
GenerationJobSchema.index({ status: 1, createdAt: 1 });
GenerationJobSchema.index({ templateId: 1, status: 1 });

export const GenerationJobModel = mongoose.model<IGenerationJob>('GenerationJob', GenerationJobSchema);
