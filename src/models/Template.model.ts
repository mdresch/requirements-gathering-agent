import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: string;
  documentKey: string;
  template_type: string;
  ai_instructions: string;
  prompt_template: string;
  generation_function: string;
  contextPriority?: 'low' | 'medium' | 'high' | 'critical';
  metadata: {
    tags?: string[];
    variables: any[];
    layout?: any;
    emoji?: string;
    priority?: number;
    source?: string;
    author?: string;
    framework?: string;
    complexity?: string;
    estimatedTime?: string | number;
    dependencies?: string[];
    version?: string;
  };
  version: number;
  is_active: boolean;
  is_system: boolean;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
  // Soft delete fields
  deleted_at?: Date;
  deleted_by?: string;
  delete_reason?: string;
  is_deleted: boolean;
  // Audit trail
  audit_trail?: {
    action: 'created' | 'updated' | 'soft_deleted' | 'restored' | 'hard_deleted';
    timestamp: Date;
    user_id: string;
    changes?: any;
    reason?: string;
  }[];
}

const TemplateSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Template name is required'],
    trim: true,
    minlength: [1, 'Template name must be at least 1 character'],
    maxlength: [200, 'Template name cannot exceed 200 characters']
  },
  description: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  documentKey: { 
    type: String, 
    required: [true, 'Document key is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Document key can only contain lowercase letters, numbers, and hyphens']
  },
  template_type: { 
    type: String, 
    required: [true, 'Template type is required'],
    enum: {
      values: ['basic', 'advanced', 'custom', 'system'],
      message: 'Template type must be one of: basic, advanced, custom, system'
    },
    default: 'basic'
  },
  ai_instructions: { 
    type: String, 
    required: [true, 'AI instructions are required'],
    minlength: [10, 'AI instructions must be at least 10 characters'],
    maxlength: [5000, 'AI instructions cannot exceed 5000 characters']
  },
  prompt_template: { 
    type: String, 
    required: [true, 'Prompt template is required'],
    minlength: [10, 'Prompt template must be at least 10 characters'],
    maxlength: [10000, 'Prompt template cannot exceed 10000 characters']
  },
  generation_function: { 
    type: String, 
    required: [true, 'Generation function is required'],
    trim: true,
    maxlength: [200, 'Generation function name cannot exceed 200 characters']
  },
  contextPriority: { 
    type: String, 
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Context priority must be one of: low, medium, high, critical'
    },
    default: 'medium' 
  },
  metadata: {
    tags: { 
      type: [String], 
      default: [],
      validate: {
        validator: function(tags: string[]) {
          return tags.length <= 20;
        },
        message: 'Cannot have more than 20 tags'
      }
    },
    variables: { type: [Schema.Types.Mixed], default: [] },
    layout: { type: Schema.Types.Mixed, default: {} },
    emoji: { 
      type: String, 
      default: '📄',
      maxlength: [10, 'Emoji cannot exceed 10 characters']
    },
    priority: { 
      type: Number, 
      default: 100,
      min: [1, 'Priority must be at least 1'],
      max: [1000, 'Priority cannot exceed 1000']
    },
    source: { 
      type: String, 
      default: 'unknown',
      maxlength: [100, 'Source cannot exceed 100 characters']
    },
    author: { 
      type: String,
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    framework: { 
      type: String,
      enum: {
        values: ['babok', 'pmbok', 'dmbok', 'agile', 'waterfall', 'hybrid', 'custom'],
        message: 'Framework must be one of: babok, pmbok, dmbok, agile, waterfall, hybrid, custom'
      }
    },
    complexity: { 
      type: String,
      enum: {
        values: ['simple', 'moderate', 'complex', 'expert'],
        message: 'Complexity must be one of: simple, moderate, complex, expert'
      }
    },
    estimatedTime: { 
      type: Schema.Types.Mixed,
      validate: {
        validator: function(value: any) {
          if (typeof value === 'string') {
            return /^\d+[hmd]$/.test(value); // e.g., "2h", "30m", "1d"
          }
          if (typeof value === 'number') {
            return value > 0 && value <= 1000; // minutes
          }
          return false;
        },
        message: 'Estimated time must be a positive number (minutes) or string like "2h", "30m", "1d"'
      }
    },
    dependencies: { 
      type: [String], 
      default: [],
      validate: {
        validator: function(deps: string[]) {
          return deps.length <= 50;
        },
        message: 'Cannot have more than 50 dependencies'
      }
    },
    version: { 
      type: String,
      match: [/^\d+\.\d+(\.\d+)?$/, 'Version must be in format like "1.0" or "1.0.1"']
    }
  },
  version: { 
    type: Number, 
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  is_active: { 
    type: Boolean, 
    default: false // Default new templates to inactive for review
  },
  is_system: { 
    type: Boolean, 
    default: false 
  },
  created_by: { 
    type: String, 
    required: [true, 'Created by field is required'],
    trim: true,
    maxlength: [100, 'Created by field cannot exceed 100 characters']
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  // Soft delete fields
  deleted_at: { type: Date },
  deleted_by: { 
    type: String,
    maxlength: [100, 'Deleted by field cannot exceed 100 characters']
  },
  delete_reason: { 
    type: String,
    maxlength: [500, 'Delete reason cannot exceed 500 characters']
  },
  is_deleted: { type: Boolean, default: false },
  // Audit trail
  audit_trail: [{
    action: {
      type: String,
      enum: {
        values: ['created', 'updated', 'soft_deleted', 'restored', 'hard_deleted'],
        message: 'Action must be one of: created, updated, soft_deleted, restored, hard_deleted'
      },
      required: [true, 'Audit action is required']
    },
    timestamp: { type: Date, default: Date.now },
    user_id: { 
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
});

// Indexes for performance
TemplateSchema.index({ is_deleted: 1, is_active: 1 });
TemplateSchema.index({ deleted_at: 1 });
// documentKey already has unique index from unique: true constraint
TemplateSchema.index({ category: 1, is_deleted: 1 });
TemplateSchema.index({ created_by: 1, is_deleted: 1 });

// Pre-save middleware to generate documentKey and update timestamps
TemplateSchema.pre('save', function (this: any, next) {
  // Generate documentKey only if not provided (undefined/null) or if this is a new document
  // Don't auto-generate if documentKey is explicitly set to empty string (user choice)
  if ((!this.documentKey || this.documentKey.trim() === '') && this.isNew) {
    this.documentKey = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  this.updated_at = new Date();
  
  // Add audit trail entry for updates
  if (!this.isNew && this.isModified()) {
    if (!this.audit_trail) {
      this.audit_trail = [];
    }
    
    this.audit_trail.push({
      action: 'updated',
      timestamp: new Date(),
      user_id: this.created_by, // In real app, get from request context
      changes: this.modifiedPaths(),
      reason: 'Template updated'
    });
  }
  
  next();
});

// Pre-save middleware for creation audit trail
TemplateSchema.pre('save', function (this: any, next) {
  if (this.isNew) {
    if (!this.audit_trail) {
      this.audit_trail = [];
    }
    
    this.audit_trail.push({
      action: 'created',
      timestamp: new Date(),
      user_id: this.created_by,
      reason: 'Template created'
    });
  }
  next();
});

// Static method to find only non-deleted templates
TemplateSchema.statics.findNotDeleted = function() {
  return this.find({ is_deleted: { $ne: true } });
};

// Static method to find only deleted templates
TemplateSchema.statics.findDeleted = function() {
  return this.find({ is_deleted: true });
};

// Static method to find all templates (including deleted)
TemplateSchema.statics.findAllIncludingDeleted = function() {
  return this.find({});
};

// Instance method for soft delete
TemplateSchema.methods.softDelete = function(this: any, userId: string, reason?: string) {
  this.is_deleted = true;
  this.deleted_at = new Date();
  this.deleted_by = userId;
  this.delete_reason = reason || 'Soft deleted by user';
  this.is_active = false;
  
  // Add to audit trail
  if (!this.audit_trail) {
    this.audit_trail = [];
  }
  
  this.audit_trail.push({
    action: 'soft_deleted',
    timestamp: new Date(),
    user_id: userId,
    reason: reason || 'Soft deleted by user'
  });
  
  return this.save();
};

// Instance method for restore
TemplateSchema.methods.restore = function(this: any, userId: string, reason?: string) {
  this.is_deleted = false;
  this.deleted_at = undefined;
  this.deleted_by = undefined;
  this.delete_reason = undefined;
  this.is_active = true;
  
  // Add to audit trail
  if (!this.audit_trail) {
    this.audit_trail = [];
  }
  
  this.audit_trail.push({
    action: 'restored',
    timestamp: new Date(),
    user_id: userId,
    reason: reason || 'Template restored by user'
  });
  
  return this.save();
};

export const TemplateModel = mongoose.model<ITemplate>('Template', TemplateSchema);
