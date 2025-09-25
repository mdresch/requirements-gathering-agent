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
    estimatedTime?: string;
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
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  documentKey: { type: String, required: true, unique: true },
  template_type: { type: String, required: true, default: 'basic' },
  ai_instructions: { type: String, required: true, minlength: 10 },
  prompt_template: { type: String, required: true, minlength: 10 },
  generation_function: { type: String, required: true },
  contextPriority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  metadata: {
    tags: { type: [String], default: [] },
    variables: { type: [Schema.Types.Mixed], default: [] },
    layout: { type: Schema.Types.Mixed, default: {} },
    emoji: { type: String, default: '📄' },
    priority: { type: Number, default: 100 },
    source: { type: String, default: 'unknown' },
    author: { type: String },
    framework: { type: String },
    complexity: { type: String },
    estimatedTime: { type: String },
    dependencies: { type: [String], default: [] },
    version: { type: String }
  },
  version: { type: Number, default: 1 },
  is_active: { type: Boolean, default: false }, // Default new templates to inactive for review
  is_system: { type: Boolean, default: false },
  created_by: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  // Soft delete fields
  deleted_at: { type: Date },
  deleted_by: { type: String },
  delete_reason: { type: String },
  is_deleted: { type: Boolean, default: false },
  // Audit trail
  audit_trail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'soft_deleted', 'restored', 'hard_deleted'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    user_id: { type: String, required: true },
    changes: Schema.Types.Mixed,
    reason: String
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
