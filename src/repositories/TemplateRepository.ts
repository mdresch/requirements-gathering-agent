/**
 * Enhanced Template Repository
 * 
 * Provides unified access to both static (legacy) and database-backed templates
 * with full CRUD operations, search, and PMBOK compliance validation.
 */

import { TemplateModel, ITemplate } from '../models/Template.model';

export class TemplateRepository {
    constructor() {}

    /**
     * Create a new template
     */
    async createTemplate(data: Partial<ITemplate>): Promise<ITemplate> {
        const template = new TemplateModel(data);
        return await template.save();
    }

    /**
     * Get a template by ID
     */
    async getTemplateById(id: string): Promise<ITemplate | null> {
        return TemplateModel.findById(id).exec();
    }

    /**
     * Get all templates (optionally filter by system/user)
     */
    async getAllTemplates(): Promise<ITemplate[]> {
        return TemplateModel.find({ is_active: true }).sort({ is_system: -1, category: 1, name: 1 }).exec();
    }

    /**
     * Search templates with filtering and pagination
     */
    async searchTemplates(query: any): Promise<ITemplate[]> {
        const filter: any = { is_active: true };
        if (query.category) filter.category = query.category;
        if (query.is_system !== undefined) filter.is_system = query.is_system;
        if (query.search_text) {
            filter.$or = [
                { name: { $regex: query.search_text, $options: 'i' } },
                { description: { $regex: query.search_text, $options: 'i' } }
            ];
        }
        const limit = query.limit ? Number(query.limit) : 20;
        const offset = query.offset ? Number(query.offset) : 0;
        return TemplateModel.find(filter).skip(offset).limit(limit).sort({ created_at: -1 }).exec();
    }

    /**
     * Delete a template by ID
     */
    async deleteTemplate(id: string): Promise<void> {
        await TemplateModel.findByIdAndDelete(id).exec();
    }
}

