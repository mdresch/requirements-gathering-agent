/**
 * Enhanced Template Repository
 * 
 * Provides unified access to both static (legacy) and database-backed templates
 * with full CRUD operations, search, and PMBOK compliance validation.
 */

import { DatabaseTemplate, TemplateSearchQuery } from '../types/databaseTemplates';
import { GenerationTask } from '../modules/documentGenerator/types';

interface DatabaseConnection {
    query(sql: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (trx: any) => Promise<T>): Promise<T>;
}

export class TemplateRepository {
    constructor(private db: DatabaseConnection) {}

    /**
     * Get all system templates (migrated from static GENERATION_TASKS)
     */
    async getSystemTemplates(): Promise<DatabaseTemplate[]> {
        const sql = `
            SELECT * FROM templates 
            WHERE is_system = true AND is_active = true 
            ORDER BY category, name
        `;
        const result = await this.db.query(sql);
        return result.rows || result;
    }

    /**
     * Get user-created templates
     */
    async getUserTemplates(userId?: string): Promise<DatabaseTemplate[]> {
        const sql = `
            SELECT * FROM templates 
            WHERE is_system = false AND is_active = true 
            ${userId ? 'AND created_by = $1' : ''}
            ORDER BY created_at DESC
        `;
        const params = userId ? [userId] : [];
        const result = await this.db.query(sql, params);
        return result.rows || result;
    }

    /**
     * Get all active templates (system + user)
     */
    async getAllTemplates(): Promise<DatabaseTemplate[]> {
        const sql = `
            SELECT * FROM templates 
            WHERE is_active = true 
            ORDER BY 
                is_system DESC,  -- System templates first
                category,
                name
        `;
        const result = await this.db.query(sql);
        return result.rows || result;
    }

    /**
     * Search templates with advanced filtering
     */
    async searchTemplates(query: TemplateSearchQuery): Promise<DatabaseTemplate[]> {
        let sql = `
            SELECT t.*, tc.description as category_description
            FROM templates t
            LEFT JOIN template_categories tc ON t.category = tc.name
            WHERE t.is_active = true
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (query.category) {
            sql += ` AND t.category = $${paramIndex}`;
            params.push(query.category);
            paramIndex++;
        }

        if (query.template_type) {
            sql += ` AND t.template_type = $${paramIndex}`;
            params.push(query.template_type);
            paramIndex++;
        }

        if (query.is_system !== undefined) {
            sql += ` AND t.is_system = $${paramIndex}`;
            params.push(query.is_system);
            paramIndex++;
        }

        if (query.search_text) {
            sql += ` AND (
                t.name ILIKE $${paramIndex} OR 
                t.description ILIKE $${paramIndex} OR 
                t.ai_instructions ILIKE $${paramIndex}
            )`;
            params.push(`%${query.search_text}%`);
            paramIndex++;
        }

        sql += ` ORDER BY t.is_system DESC, t.name`;

        if (query.limit) {
            sql += ` LIMIT $${paramIndex}`;
            params.push(query.limit);
            paramIndex++;
        }

        if (query.offset) {
            sql += ` OFFSET $${paramIndex}`;
            params.push(query.offset);
        }

        const result = await this.db.query(sql, params);
        return result.rows || result;
    }

    /**
     * Get template by ID
     */
    async getTemplateById(id: string): Promise<DatabaseTemplate | null> {
        const sql = `
            SELECT t.*, tc.description as category_description
            FROM templates t
            LEFT JOIN template_categories tc ON t.category = tc.name
            WHERE t.id = $1
        `;
        const result = await this.db.query(sql, [id]);
        return (result.rows?.[0] || result[0]) || null;
    }

    /**
     * Get template by generation function (for backward compatibility)
     */
    async getTemplateByFunction(functionName: string): Promise<DatabaseTemplate | null> {
        const sql = `
            SELECT * FROM templates 
            WHERE generation_function = $1 AND is_active = true
            LIMIT 1
        `;
        const result = await this.db.query(sql, [functionName]);
        return (result.rows?.[0] || result[0]) || null;
    }

    /**
     * Create new template
     */
    async createTemplate(template: Omit<DatabaseTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseTemplate> {
        const sql = `
            INSERT INTO templates (
                name, description, category, template_type,
                ai_instructions, prompt_template, generation_function,
                metadata, version, is_active, is_system, created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            ) RETURNING *
        `;
        
        const params = [
            template.name,
            template.description,
            template.category,
            template.template_type,
            template.ai_instructions,
            template.prompt_template,
            template.generation_function,
            JSON.stringify(template.metadata),
            template.version,
            template.is_active,
            template.is_system,
            template.created_by
        ];

        const result = await this.db.query(sql, params);
        return result.rows?.[0] || result[0];
    }

    /**
     * Update existing template (creates new version)
     */
    async updateTemplate(id: string, updates: Partial<DatabaseTemplate>, updatedBy: string): Promise<DatabaseTemplate> {
        return this.db.transaction(async (trx) => {
            // Get current template
            const currentTemplate = await this.getTemplateById(id);
            if (!currentTemplate) {
                throw new Error(`Template ${id} not found`);
            }

            // Create version record
            await trx.query(`
                INSERT INTO template_versions (template_id, version, changes, created_by)
                VALUES ($1, $2, $3, $4)
            `, [
                id,
                currentTemplate.version,
                JSON.stringify(updates),
                updatedBy
            ]);

            // Update template
            const setClause = Object.keys(updates)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(', ');
            
            const sql = `
                UPDATE templates 
                SET ${setClause}, version = version + 1, updated_at = NOW()
                WHERE id = $1 
                RETURNING *
            `;
            
            const params = [id, ...Object.values(updates)];
            const result = await trx.query(sql, params);
            return result.rows?.[0] || result[0];
        });
    }

    /**
     * Soft delete template (mark as inactive)
     */
    async deleteTemplate(id: string): Promise<void> {
        const sql = `
            UPDATE templates 
            SET is_active = false, updated_at = NOW()
            WHERE id = $1
        `;
        await this.db.query(sql, [id]);
    }

    /**
     * Get template categories
     */
    async getCategories(): Promise<any[]> {
        const sql = `
            SELECT tc.*, COUNT(t.id) as template_count
            FROM template_categories tc
            LEFT JOIN templates t ON tc.name = t.category AND t.is_active = true
            GROUP BY tc.id, tc.name, tc.description, tc.sort_order
            ORDER BY tc.sort_order, tc.name
        `;
        const result = await this.db.query(sql);
        return result.rows || result;
    }

    /**
     * Convert database template to legacy GenerationTask format (for backward compatibility)
     */
    templateToGenerationTask(template: DatabaseTemplate): GenerationTask {
        const metadata = template.metadata || {};
          return {
            key: metadata.key || template.generation_function || template.name.toLowerCase().replace(/\s+/g, '-'),
            name: template.name,
            func: template.generation_function || 'getAiGenericDocument',
            category: template.category,
            emoji: metadata.emoji || '📄',
            priority: metadata.priority || 100,
            dependencies: metadata.dependencies || [],
            pmbokRef: metadata.pmbokRef
        };
    }

    /**
     * Get all templates as legacy GenerationTask format
     */
    async getTemplatesAsGenerationTasks(): Promise<GenerationTask[]> {
        const templates = await this.getAllTemplates();
        return templates.map(template => this.templateToGenerationTask(template));
    }

    /**
     * Validate template for PMBOK compliance
     */
    validatePMBOKCompliance(template: DatabaseTemplate): { valid: boolean; issues: string[] } {
        const issues: string[] = [];

        // Check required fields
        if (!template.name || template.name.length < 3) {
            issues.push('Template name must be at least 3 characters');
        }

        if (!template.description || template.description.length < 10) {
            issues.push('Template description must be at least 10 characters');
        }

        if (!template.ai_instructions || template.ai_instructions.length < 20) {
            issues.push('AI instructions must be at least 20 characters');
        }

        if (!template.category) {
            issues.push('Template must have a category');
        }

        // Check PMBOK-specific requirements
        if (template.template_type === 'pmbok') {
            if (!template.ai_instructions.toLowerCase().includes('pmbok')) {
                issues.push('PMBOK templates should reference PMBOK standards in AI instructions');
            }

            if (!template.prompt_template.toLowerCase().includes('professional')) {
                issues.push('PMBOK templates should specify professional language requirements');
            }
        }

        // Check metadata structure
        if (template.metadata) {
            const metadata = template.metadata;
            if (!metadata.emoji) {
                issues.push('Template should have an emoji for display purposes');
            }
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    /**
     * Get template usage statistics
     */
    async getTemplateStats(): Promise<any> {
        const sql = `
            SELECT 
                COUNT(*) as total_templates,
                COUNT(CASE WHEN is_system THEN 1 END) as system_templates,
                COUNT(CASE WHEN NOT is_system THEN 1 END) as user_templates,
                COUNT(CASE WHEN is_active THEN 1 END) as active_templates,
                COUNT(DISTINCT category) as categories,
                COUNT(CASE WHEN template_type = 'pmbok' THEN 1 END) as pmbok_templates
            FROM templates
        `;
        const result = await this.db.query(sql);
        return result.rows?.[0] || result[0];
    }
}
