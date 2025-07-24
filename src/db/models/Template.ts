import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  templateData: {
    content: string;
    aiInstructions?: string;
    variables?: Array<{
      name: string;
      type: string;
      required?: boolean;
      description?: string;
      defaultValue?: any;
    }>;
    layout?: {
      pageSize?: string;
      orientation?: string;
      margins?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      };
    };
  };
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  category: { type: String, maxlength: 50 },
  tags: [{ type: String, maxlength: 30 }],
  templateData: {
    content: { type: String, required: true },
    aiInstructions: { type: String },
    variables: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean, default: false },
        description: { type: String },
        defaultValue: { type: Schema.Types.Mixed },
      },
    ],
    layout: {
      pageSize: { type: String, default: 'A4' },
      orientation: { type: String, default: 'portrait' },
      margins: {
        top: { type: Number, default: 20 },
        bottom: { type: Number, default: 20 },
        left: { type: Number, default: 20 },
        right: { type: Number, default: 20 },
      },
    },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const TemplateModel = mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);
