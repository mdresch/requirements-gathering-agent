import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  isSystem: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

const CategorySchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  color: { 
    type: String, 
    default: '#3B82F6',
    match: /^#[0-9A-F]{6}$/i
  },
  icon: { 
    type: String, 
    default: '📁',
    maxlength: 10
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isSystem: { 
    type: Boolean, 
    default: false 
  },
  createdBy: { 
    type: String, 
    required: true,
    default: 'system'
  },
  version: { 
    type: Number, 
    default: 1 
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
CategorySchema.index({ name: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ isSystem: 1 });

// Pre-save middleware to ensure version increment
CategorySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    (this as any).version += 1;
  }
  next();
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
