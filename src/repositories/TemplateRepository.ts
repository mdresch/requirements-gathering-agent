import { TemplateModel, ITemplate } from '../models/Template.model.js';
import mongoose, { ClientSession } from 'mongoose';

/**
 * Enhanced Template Repository
 * 
 * Provides unified access to both static (legacy) and database-backed templates
 * with full CRUD operations, search, and PMBOK compliance validation.
 */

export interface TemplateSearchQuery {
    category?: string;
    search_text?: string;
    is_system?: boolean;
    is_active?: boolean;
    is_deleted?: boolean;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface CreateTemplateRequest {
    name: string;
    description?: string;
    category: string;
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
    is_active?: boolean;
    is_system?: boolean;
    created_by: string;
}

export class TemplateRepository {
    constructor() {}

    /**
     * Create a new template with validation and transaction support
     */
    async createTemplate(templateData: CreateTemplateRequest, session?: ClientSession): Promise<ITemplate> {
        try {
            console.log('🔍 Creating template with data:', JSON.stringify(templateData, null, 2));
            
            // Validate required fields
            console.log('✅ Validating template data...');
            this.validateTemplateData(templateData);

            // Check for duplicate names in the same category
            console.log('🔍 Checking for duplicate templates...');
            const existingTemplate = await TemplateModel.findOne({
                name: templateData.name,
                category: templateData.category,
                is_active: true,
                is_deleted: { $ne: true }
            }).session(session || null);

            if (existingTemplate) {
                throw new Error(`Template with name "${templateData.name}" already exists in category "${templateData.category}"`);
            }

            // Create the template
            console.log('📝 Creating new template instance...');
            const template = new TemplateModel({
                ...templateData,
                version: 1,
                created_at: new Date(),
                updated_at: new Date(),
                is_deleted: false,  // Ensure it's not marked as deleted
                is_active: templateData.is_active !== undefined ? templateData.is_active : false  // Default to inactive for review
            });

            console.log('💾 Saving template to database...');
            const savedTemplate = await template.save({ session });
            
            console.log(`✅ Template created successfully: ${savedTemplate._id} - ${savedTemplate.name}`);
            return savedTemplate;
        } catch (error) {
            console.error('❌ Error creating template:', error);
            console.error('Template data that failed:', JSON.stringify(templateData, null, 2));
            
            // Provide more detailed error information
            if (error instanceof Error && error.name === 'ValidationError') {
                const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
                throw new Error(`Template validation failed: ${validationErrors.join(', ')}`);
            }
            
            throw new Error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get a template by ID
     */
    async getTemplateById(id: string): Promise<ITemplate | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid template ID format');
            }

            const template = await TemplateModel.findById(id).exec();
            return template;
        } catch (error) {
            console.error(`Error getting template by ID ${id}:`, error);
            throw new Error(`Failed to get template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all templates with optional filtering
     */
    async getAllTemplates(filters?: { is_active?: boolean; is_system?: boolean; is_deleted?: boolean }): Promise<ITemplate[]> {
        try {
            const query: any = {};
            
            if (filters?.is_active !== undefined) {
                query.is_active = filters.is_active;
            } else {
                query.is_active = true; // Default to active templates
            }

            if (filters?.is_deleted !== undefined) {
                query.is_deleted = filters.is_deleted;
            } else {
                query.is_deleted = { $ne: true }; // Default to non-deleted templates
            }
            
            if (filters?.is_system !== undefined) {
                query.is_system = filters.is_system;
            }

            const templates = await TemplateModel.find(query)
                .sort({ is_system: -1, category: 1, name: 1 })
                .exec();
            
            return templates;
        } catch (error) {
            console.error('Error getting all templates:', error);
            throw new Error(`Failed to get templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Search templates with filtering and pagination
     */
    async searchTemplates(query: TemplateSearchQuery): Promise<ITemplate[]> {
        try {
            const filter: any = {};

            // Apply filters - show all templates by default, filter by active status only when specified
            if (query.is_active !== undefined) {
                filter.is_active = query.is_active;
            }
            // No default filter for is_active - show both active and inactive templates

            // Exclude soft-deleted templates by default
            if (query.is_deleted !== undefined) {
                filter.is_deleted = query.is_deleted;
            } else {
                filter.is_deleted = { $ne: true }; // Default to non-deleted templates
            }
            
            if (query.category) {
                filter.category = query.category;
            }
            
            if (query.is_system !== undefined) {
                filter.is_system = query.is_system;
            }
            
            if (query.search_text) {
                filter.$or = [
                    { name: { $regex: query.search_text, $options: 'i' } },
                    { description: { $regex: query.search_text, $options: 'i' } },
                    { 'metadata.tags': { $in: [new RegExp(query.search_text, 'i')] } }
                ];
            }

            // Build query
            const mongoQuery = TemplateModel.find(filter);

            // Apply sorting
            const sortField = query.sort_by || 'created_at';
            const sortOrder = query.sort_order === 'asc' ? 1 : -1;
            mongoQuery.sort({ [sortField]: sortOrder });

            // Apply pagination
            if (query.offset) {
                mongoQuery.skip(query.offset);
            }
            
            if (query.limit) {
                mongoQuery.limit(query.limit);
            }

            const templates = await mongoQuery.exec();
            return templates;
        } catch (error) {
            console.error('Error searching templates:', error);
            throw new Error(`Failed to search templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update a template by ID
     */
    async updateTemplate(id: string, updates: Partial<ITemplate>, session?: ClientSession): Promise<ITemplate | null> {
        try {
            console.log(`🔄 Updating template ${id} with data:`, JSON.stringify(updates, null, 2));
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid template ID format');
            }

            // Check if template exists first
            const existingTemplate = await TemplateModel.findById(id).session(session || null);
            if (!existingTemplate) {
                throw new Error('Template not found');
            }

            // Remove fields that shouldn't be updated directly
            const { _id, created_at, created_by, version, ...allowedUpdates } = updates as any;
            
            // Add updated timestamp
            allowedUpdates.updated_at = new Date();

            console.log(`📝 Applying updates:`, JSON.stringify(allowedUpdates, null, 2));

            const updatedTemplate = await TemplateModel.findByIdAndUpdate(
                id,
                { 
                    $set: allowedUpdates,
                    $inc: { version: 1 }
                },
                { new: true, session }
            ).exec();

            if (!updatedTemplate) {
                throw new Error('Template update failed - no template returned');
            }

            console.log(`✅ Template updated successfully: ${id} - version ${updatedTemplate.version}`);
            return updatedTemplate;
        } catch (error) {
            console.error(`❌ Error updating template ${id}:`, error);
            console.error(`❌ Update data that failed:`, JSON.stringify(updates, null, 2));
            
            // Provide more detailed error information
            if (error instanceof Error && error.name === 'ValidationError') {
                const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
                throw new Error(`Template validation failed: ${validationErrors.join(', ')}`);
            }
            
            throw new Error(`Failed to update template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete a template by ID (soft delete with audit trail)
     */
    async deleteTemplate(id: string, userId?: string, reason?: string, session?: ClientSession): Promise<boolean> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid template ID format');
            }

            const template = await TemplateModel.findById(id, null, { session });
            if (!template) {
                throw new Error('Template not found');
            }

            if (template.is_deleted) {
                throw new Error('Template is already deleted');
            }

            // Use the instance method for soft delete with audit trail
            await (template as any).softDelete(userId || 'system', reason);

            console.log(`Template soft-deleted successfully: ${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting template ${id}:`, error);
            throw new Error(`Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Hard delete a template by ID (permanent deletion)
     */
    async hardDeleteTemplate(id: string, session?: ClientSession): Promise<boolean> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid template ID format');
            }

            const result = await TemplateModel.findByIdAndDelete(id, { session }).exec();
            
            if (!result) {
                throw new Error('Template not found');
            }

            console.log(`Template permanently deleted: ${id}`);
            return true;
        } catch (error) {
            console.error(`Error hard-deleting template ${id}:`, error);
            throw new Error(`Failed to permanently delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get template count by category
     */
    async getTemplateCounts(): Promise<{ [category: string]: number }> {
        try {
            const counts = await TemplateModel.aggregate([
                { $match: { is_active: true } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]).exec();

            const result: { [category: string]: number } = {};
            counts.forEach(item => {
                result[item._id] = item.count;
            });

            return result;
        } catch (error) {
            console.error('Error getting template counts:', error);
            throw new Error(`Failed to get template counts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validate template data before creation/update
     */
    private validateTemplateData(data: CreateTemplateRequest): void {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Template name is required');
        }
        
        if (!data.category || data.category.trim().length === 0) {
            throw new Error('Template category is required');
        }
        
        if (!data.template_type || data.template_type.trim().length === 0) {
            throw new Error('Template type is required');
        }
        
        if (!data.created_by || data.created_by.trim().length === 0) {
            throw new Error('Created by field is required');
        }

        // Validate metadata structure
        if (!data.metadata) {
            throw new Error('Template metadata is required');
        }

        if (data.metadata.tags && !Array.isArray(data.metadata.tags)) {
            throw new Error('Template tags must be an array');
        }

        if (!Array.isArray(data.metadata.variables)) {
            throw new Error('Template variables must be an array');
        }
    }

    /**
     * Restore a soft-deleted template
     */
    async restoreTemplate(id: string, userId?: string, reason?: string, session?: ClientSession): Promise<boolean> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid template ID format');
            }

            const template = await TemplateModel.findById(id, null, { session });
            if (!template) {
                throw new Error('Template not found');
            }

            if (!template.is_deleted) {
                throw new Error('Template is not deleted');
            }

            // Use the instance method for restore with audit trail
            await (template as any).restore(userId || 'system', reason);

            console.log(`Template restored successfully: ${id}`);
            return true;
        } catch (error) {
            console.error(`Error restoring template ${id}:`, error);
            throw new Error(`Failed to restore template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get soft-deleted templates
     */
    async getSoftDeletedTemplates(options?: {
        category?: string;
        deletedBy?: string;
        limit?: number;
        offset?: number;
    }): Promise<ITemplate[]> {
        try {
            const filter: any = { is_deleted: true };

            if (options?.category) {
                filter.category = options.category;
            }

            if (options?.deletedBy) {
                filter.deleted_by = options.deletedBy;
            }

            let query = TemplateModel.find(filter).sort({ deleted_at: -1 });

            if (options?.offset) {
                query = query.skip(options.offset);
            }

            if (options?.limit) {
                query = query.limit(options.limit);
            }

            return await query.exec();
        } catch (error) {
            console.error('Error getting soft-deleted templates:', error);
            throw new Error(`Failed to get soft-deleted templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get template audit trail
     */
    async getTemplateAuditTrail(id: string): Promise<any[]> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid template ID format');
            }

            const template = await TemplateModel.findById(id).select('audit_trail').exec();
            if (!template) {
                throw new Error('Template not found');
            }

            return template.audit_trail || [];
        } catch (error) {
            console.error(`Error getting audit trail for template ${id}:`, error);
            throw new Error(`Failed to get audit trail: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Legacy method aliases for backward compatibility
    async findAll() { 
        return this.getAllTemplates(); 
    }
    
    async findById(id: string) { 
        return this.getTemplateById(id); 
    }
    
    async update(id: string, update: any) { 
        return this.updateTemplate(id, update); 
    }
    
    async delete(id: string) { 
        return this.deleteTemplate(id); 
    }
}

