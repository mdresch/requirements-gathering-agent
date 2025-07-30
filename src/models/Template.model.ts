import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: string;
  template_type: string;
  ai_instructions: string;
  prompt_template: string;
  generation_function: string;
  metadata: {
    tags?: string[];
    variables: any[];
    layout?: any;
    emoji?: string;
    priority?: number;
    source?: string;
  };
  version: number;
  is_active: boolean;
  is_system: boolean;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

const TemplateSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  template_type: { type: String },
  ai_instructions: { type: String },
  prompt_template: { type: String },
  generation_function: { type: String },
  metadata: {
    tags: { type: [String], required: false },
    variables: [Schema.Types.Mixed],
    layout: Schema.Types.Mixed,
    emoji: String,
    priority: Number,
    source: String
  },
  version: { type: Number, default: 1 },
  is_active: { type: Boolean, default: true },
  is_system: { type: Boolean, default: false },
  created_by: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

TemplateSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

export const TemplateModel = mongoose.model<ITemplate>('Template', TemplateSchema);
