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
  
  // Enhanced fields for consistency
  parentCategory?: string; // For hierarchical categories
  sortOrder?: number; // For custom ordering
  usageCount?: number; // Track how often this category is used
  
  // Soft delete fields
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
  isDeleted: boolean;
  
  // Audit trail
  auditTrail?: {
    action: 'created' | 'updated' | 'soft_deleted' | 'restored' | 'hard_deleted';
    timestamp: Date;
    userId: string;
    changes?: any;
    reason?: string;
  }[];
}

const CategorySchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [1, 'Category name must be at least 1 character'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Category description is required'],
    trim: true,
    minlength: [5, 'Description must be at least 5 characters'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: { 
    type: String, 
    default: '#3B82F6',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code']
  },
  icon: { 
    type: String, 
    default: '📁',
    maxlength: [10, 'Icon cannot exceed 10 characters']
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
    required: [true, 'Created by field is required'],
    trim: true,
    maxlength: [100, 'Created by field cannot exceed 100 characters'],
    default: 'system'
  },
  version: { 
    type: Number, 
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  
  // Enhanced fields for consistency
  parentCategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Parent category ID cannot exceed 100 characters']
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: [0, 'Sort order cannot be negative']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  
  // Soft delete fields
  deletedAt: { type: Date },
  deletedBy: { 
    type: String,
    maxlength: [100, 'Deleted by field cannot exceed 100 characters']
  },
  deleteReason: { 
    type: String,
    maxlength: [500, 'Delete reason cannot exceed 500 characters']
  },
  isDeleted: { type: Boolean, default: false },
  
  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: {
        values: ['created', 'updated', 'soft_deleted', 'restored', 'hard_deleted'],
        message: 'Action must be one of: created, updated, soft_deleted, restored, hard_deleted'
      },
      required: [true, 'Audit action is required']
    },
    timestamp: { type: Date, default: Date.now },
    userId: { 
      type: String, 
      required: [true, 'User ID is required for audit trail'],
      maxlength: [100, 'User ID cannot exceed 100 characters']
    },
    changes: Schema.Types.Mixed,
    reason: { 
      type: String,
      maxlength: [500, 'Audit reason cannot exceed 500 characters']
    }
  }]
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
CategorySchema.index({ name: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ isSystem: 1 });
CategorySchema.index({ isDeleted: 1, isActive: 1 });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ usageCount: -1 });
CategorySchema.index({ createdAt: -1 });

// Pre-save middleware to ensure version increment and audit trail
CategorySchema.pre('save', function(this: ICategory, next: any) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    
    // Add audit trail entry for updates
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      action: 'updated',
      timestamp: new Date(),
      userId: this.createdBy, // In real app, get from request context
      changes: this.modifiedPaths(),
      reason: 'Category updated'
    });
  }
  
  next();
});

// Pre-save middleware for creation audit trail
CategorySchema.pre('save', function(this: ICategory, next: any) {
  if (this.isNew) {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      action: 'created',
      timestamp: new Date(),
      userId: this.createdBy,
      reason: 'Category created'
    });
  }
  next();
});

// Static method to find only non-deleted categories
CategorySchema.statics.findNotDeleted = function() {
  return this.find({ isDeleted: { $ne: true } });
};

// Static method to find only deleted categories
CategorySchema.statics.findDeleted = function() {
  return this.find({ isDeleted: true });
};

// Static method to find active categories
CategorySchema.statics.findActive = function() {
  return this.find({ isActive: true, isDeleted: { $ne: true } });
};

// Static method to find system categories
CategorySchema.statics.findSystem = function() {
  return this.find({ isSystem: true, isDeleted: { $ne: true } });
};

// Instance method for soft delete
CategorySchema.methods.softDelete = function(this: any, userId: string, reason?: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.deleteReason = reason || 'Soft deleted by user';
  this.isActive = false;
  
  // Add to audit trail
  if (!this.auditTrail) {
    this.auditTrail = [];
  }
  
  this.auditTrail.push({
    action: 'soft_deleted',
    timestamp: new Date(),
    userId: userId,
    reason: reason || 'Soft deleted by user'
  });
  
  return this.save();
};

// Instance method for restore
CategorySchema.methods.restore = function(this: any, userId: string, reason?: string) {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.deleteReason = undefined;
  this.isActive = true;
  
  // Add to audit trail
  if (!this.auditTrail) {
    this.auditTrail = [];
  }
  
  this.auditTrail.push({
    action: 'restored',
    timestamp: new Date(),
    userId: userId,
    reason: reason || 'Category restored by user'
  });
  
  return this.save();
};

// Instance method to increment usage count
CategorySchema.methods.incrementUsage = function(this: any) {
  this.usageCount = (this.usageCount || 0) + 1;
  return this.save();
};

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
