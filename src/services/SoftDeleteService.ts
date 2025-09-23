/**
 * Soft Delete Service
 * 
 * Provides comprehensive soft delete operations for templates with audit trails,
 * batch operations, and recovery functionality.
 */

import { TemplateModel, ITemplate } from '../models/Template.model.js';
import { TemplateRepository } from '../repositories/TemplateRepository.js';
import mongoose, { ClientSession } from 'mongoose';

export interface SoftDeleteOptions {
  userId: string;
  reason?: string;
  session?: ClientSession;
}

export interface BatchSoftDeleteOptions extends SoftDeleteOptions {
  templateIds: string[];
  reason?: string;
}

export interface RestoreOptions {
  userId: string;
  reason?: string;
  session?: ClientSession;
}

export interface SoftDeleteResult {
  success: boolean;
  templateId: string;
  templateName: string;
  deletedAt: Date;
  reason?: string;
}

export interface BatchSoftDeleteResult {
  success: boolean;
  totalRequested: number;
  successful: number;
  failed: number;
  results: SoftDeleteResult[];
  errors: { templateId: string; error: string }[];
}

export interface RestoreResult {
  success: boolean;
  templateId: string;
  templateName: string;
  restoredAt: Date;
  reason?: string;
}

export interface SoftDeletedTemplate {
  id: string;
  name: string;
  category: string;
  deletedAt: Date;
  deletedBy: string;
  deleteReason?: string;
  daysSinceDeleted: number;
}

export class SoftDeleteService {
  private templateRepository: TemplateRepository;

  constructor(templateRepository: TemplateRepository) {
    this.templateRepository = templateRepository;
  }

  /**
   * Soft delete a single template
   */
  async softDeleteTemplate(
    templateId: string, 
    options: SoftDeleteOptions
  ): Promise<SoftDeleteResult> {
    try {
      // Validate template ID
      if (!mongoose.Types.ObjectId.isValid(templateId)) {
        throw new Error('Invalid template ID format');
      }

      // Get the template
      const template = await TemplateModel.findById(templateId, null, { session: options.session });
      if (!template) {
        throw new Error('Template not found');
      }

      // Check if already deleted
      if (template.is_deleted) {
        throw new Error('Template is already deleted');
      }

      // Check permissions for system templates
      if (template.is_system && !options.userId.includes('admin')) {
        throw new Error('System templates can only be deleted by administrators');
      }

      // Perform soft delete using instance method
      await (template as any).softDelete(options.userId, options.reason);

      console.log(`Template soft deleted: ${templateId} by ${options.userId}`, {
        templateName: template.name,
        reason: options.reason,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        templateId,
        templateName: template.name,
        deletedAt: template.deleted_at!,
        reason: options.reason
      };

    } catch (error) {
      console.error(`Error soft deleting template ${templateId}:`, error);
      throw new Error(`Failed to soft delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch soft delete multiple templates
   */
  async batchSoftDeleteTemplates(
    options: BatchSoftDeleteOptions
  ): Promise<BatchSoftDeleteResult> {
    const results: SoftDeleteResult[] = [];
    const errors: { templateId: string; error: string }[] = [];
    let successful = 0;

    console.log(`Starting batch soft delete for ${options.templateIds.length} templates`);

    for (const templateId of options.templateIds) {
      try {
        const result = await this.softDeleteTemplate(templateId, {
          userId: options.userId,
          reason: options.reason,
          session: options.session
        });
        
        results.push(result);
        successful++;
      } catch (error) {
        errors.push({
          templateId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const batchResult: BatchSoftDeleteResult = {
      success: errors.length === 0,
      totalRequested: options.templateIds.length,
      successful,
      failed: errors.length,
      results,
      errors
    };

    console.log(`Batch soft delete completed: ${successful}/${options.templateIds.length} successful`);

    return batchResult;
  }

  /**
   * Restore a soft-deleted template
   */
  async restoreTemplate(
    templateId: string, 
    options: RestoreOptions
  ): Promise<RestoreResult> {
    try {
      // Validate template ID
      if (!mongoose.Types.ObjectId.isValid(templateId)) {
        throw new Error('Invalid template ID format');
      }

      // Get the template (including deleted ones)
      const template = await TemplateModel.findById(templateId, null, { session: options.session });
      if (!template) {
        throw new Error('Template not found');
      }

      // Check if template is actually deleted
      if (!template.is_deleted) {
        throw new Error('Template is not deleted');
      }

      // Perform restore using instance method
      await (template as any).restore(options.userId, options.reason);

      console.log(`Template restored: ${templateId} by ${options.userId}`, {
        templateName: template.name,
        reason: options.reason,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        templateId,
        templateName: template.name,
        restoredAt: new Date(),
        reason: options.reason
      };

    } catch (error) {
      console.error(`Error restoring template ${templateId}:`, error);
      throw new Error(`Failed to restore template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all soft-deleted templates with metadata
   */
  async getSoftDeletedTemplates(
    options?: {
      category?: string;
      deletedBy?: string;
      daysSinceDeleted?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<SoftDeletedTemplate[]> {
    try {
      const filter: any = { is_deleted: true };

      // Apply filters
      if (options?.category) {
        filter.category = options.category;
      }

      if (options?.deletedBy) {
        filter.deleted_by = options.deletedBy;
      }

      if (options?.daysSinceDeleted) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - options.daysSinceDeleted);
        filter.deleted_at = { $gte: cutoffDate };
      }

      // Build query
      let query = TemplateModel.find(filter)
        .select('name category deleted_at deleted_by delete_reason')
        .sort({ deleted_at: -1 });

      // Apply pagination
      if (options?.offset) {
        query = query.skip(options.offset);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const deletedTemplates = await query.exec();

      // Calculate days since deleted and format response
      const now = new Date();
      return deletedTemplates.map((template: any) => ({
        id: template._id.toString(),
        name: template.name,
        category: template.category,
        deletedAt: template.deleted_at!,
        deletedBy: template.deleted_by!,
        deleteReason: template.delete_reason,
        daysSinceDeleted: Math.floor((now.getTime() - template.deleted_at!.getTime()) / (1000 * 60 * 60 * 24))
      }));

    } catch (error) {
      console.error('Error getting soft-deleted templates:', error);
      throw new Error(`Failed to get soft-deleted templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Permanently delete templates that have been soft-deleted for more than specified days
   */
  async permanentDeleteOldTemplates(
    olderThanDays: number,
    options: { userId: string; reason?: string; session?: ClientSession }
  ): Promise<{ deletedCount: number; templateIds: string[] }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Find templates eligible for permanent deletion
      const oldDeletedTemplates = await TemplateModel.find({
        is_deleted: true,
        deleted_at: { $lt: cutoffDate }
      }).select('_id name deleted_at');

      if (oldDeletedTemplates.length === 0) {
        return { deletedCount: 0, templateIds: [] };
      }

      const templateIds = oldDeletedTemplates.map((t: any) => t._id.toString());

      // Add audit trail entries before deletion
      for (const template of oldDeletedTemplates) {
        if (!template.audit_trail) {
          template.audit_trail = [];
        }

        template.audit_trail.push({
          action: 'hard_deleted',
          timestamp: new Date(),
          user_id: options.userId,
          reason: options.reason || `Permanent deletion after ${olderThanDays} days`
        });

        await template.save({ session: options.session });
      }

      // Perform permanent deletion
      const deleteResult = await TemplateModel.deleteMany(
        { _id: { $in: templateIds } },
        { session: options.session }
      );

      console.log(`Permanently deleted ${deleteResult.deletedCount} old templates`, {
        olderThanDays,
        deletedBy: options.userId,
        timestamp: new Date().toISOString()
      });

      return {
        deletedCount: deleteResult.deletedCount,
        templateIds
      };

    } catch (error) {
      console.error('Error permanently deleting old templates:', error);
      throw new Error(`Failed to permanently delete old templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get soft delete statistics
   */
  async getSoftDeleteStatistics(): Promise<{
    totalDeleted: number;
    deletedThisWeek: number;
    deletedThisMonth: number;
    byCategory: { [category: string]: number };
    byUser: { [userId: string]: number };
    oldestDeleted: Date | null;
  }> {
    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get basic counts
      const [totalDeleted, deletedThisWeek, deletedThisMonth] = await Promise.all([
        TemplateModel.countDocuments({ is_deleted: true }),
        TemplateModel.countDocuments({ 
          is_deleted: true, 
          deleted_at: { $gte: oneWeekAgo } 
        }),
        TemplateModel.countDocuments({ 
          is_deleted: true, 
          deleted_at: { $gte: oneMonthAgo } 
        })
      ]);

      // Get statistics by category
      const categoryStats = await TemplateModel.aggregate([
        { $match: { is_deleted: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const byCategory: { [category: string]: number } = {};
      categoryStats.forEach(stat => {
        byCategory[stat._id] = stat.count;
      });

      // Get statistics by user
      const userStats = await TemplateModel.aggregate([
        { $match: { is_deleted: true, deleted_by: { $exists: true } } },
        { $group: { _id: '$deleted_by', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const byUser: { [userId: string]: number } = {};
      userStats.forEach(stat => {
        byUser[stat._id] = stat.count;
      });

      // Get oldest deleted template
      const oldestDeleted = await TemplateModel.findOne(
        { is_deleted: true },
        { deleted_at: 1 }
      ).sort({ deleted_at: 1 });

      return {
        totalDeleted,
        deletedThisWeek,
        deletedThisMonth,
        byCategory,
        byUser,
        oldestDeleted: oldestDeleted?.deleted_at || null
      };

    } catch (error) {
      console.error('Error getting soft delete statistics:', error);
      throw new Error(`Failed to get soft delete statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore multiple templates
   */
  async batchRestoreTemplates(
    templateIds: string[],
    options: RestoreOptions
  ): Promise<{ success: boolean; restored: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let restored = 0;

    for (const templateId of templateIds) {
      try {
        await this.restoreTemplate(templateId, options);
        restored++;
      } catch (error) {
        errors.push(`${templateId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      restored,
      failed: errors.length,
      errors
    };
  }
}
