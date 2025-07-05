/**
 * Simple Database Adapter
 * 
 * Provides a simple file-based database for template storage
 * that can be shared between CLI and API processes.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { TEMPLATES_FILENAME } from '../constants.js';

interface DatabaseConfig {
    dataDir: string;
    templatesFile: string;
}

export class SimpleDatabaseAdapter {
    private config: DatabaseConfig;

    constructor(config?: Partial<DatabaseConfig>) {
        this.config = {
            dataDir: config?.dataDir || join(process.cwd(), 'data'),
            templatesFile: config?.templatesFile || TEMPLATES_FILENAME
        };

        // Ensure data directory exists
        if (!existsSync(this.config.dataDir)) {
            mkdirSync(this.config.dataDir, { recursive: true });
        }
    }

    private getTemplatesPath(): string {
        return join(this.config.dataDir, this.config.templatesFile);
    }

    private loadTemplates(): any[] {
        const templatesPath = this.getTemplatesPath();
        if (!existsSync(templatesPath)) {
            return [];
        }

        try {
            const data = readFileSync(templatesPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn('Error loading templates, starting with empty array:', error);
            return [];
        }
    }

    private saveTemplates(templates: any[]): void {
        const templatesPath = this.getTemplatesPath();
        writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf8');
    }

    async query(sql: string, params?: any[]): Promise<any> {
        const templates = this.loadTemplates();

        // Simple SQL parsing for basic operations
        const lowerSql = sql.toLowerCase().trim();

        if (lowerSql.startsWith('select')) {
            return this.handleSelect(sql, params, templates);
        } else if (lowerSql.startsWith('insert')) {
            return this.handleInsert(sql, params, templates);
        } else if (lowerSql.startsWith('update')) {
            return this.handleUpdate(sql, params, templates);
        } else if (lowerSql.startsWith('delete')) {
            return this.handleDelete(sql, params, templates);
        }

        throw new Error(`Unsupported SQL operation: ${sql}`);
    }

    async transaction<T>(callback: (trx: any) => Promise<T>): Promise<T> {
        // Simple transaction simulation - for production use a real database
        return callback(this);
    }

    private handleSelect(sql: string, params: any[] = [], templates: any[]): any {
        // For now, return all active templates
        // In a real implementation, parse the SQL properly
        if (sql.includes('WHERE is_active = true')) {
            return templates.filter(t => t.is_active === true);
        }

        if (sql.includes('WHERE id = $1')) {
            const id = params[0];
            return templates.filter(t => t.id === id);
        }

        if (sql.includes('WHERE generation_function = $1')) {
            const func = params[0];
            return templates.filter(t => t.generation_function === func);
        }

        // Default: return all templates
        return templates;
    }

    private handleInsert(sql: string, params: any[] = [], templates: any[]): any {
        // Create new template record
        const newTemplate = {
            id: this.generateId(),
            name: params[0],
            description: params[1],
            category: params[2],
            template_type: params[3],
            ai_instructions: params[4],
            prompt_template: params[5],
            generation_function: params[6],
            metadata: JSON.parse(params[7]),
            version: params[8] || 1,
            is_active: params[9] !== false,
            is_system: params[10] || false,
            created_by: params[11] || 'system',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        templates.push(newTemplate);
        this.saveTemplates(templates);

        return [newTemplate]; // Return as array to match database interface
    }

    private handleUpdate(sql: string, params: any[] = [], templates: any[]): any {
        // Simple update implementation
        const id = params[0];
        const templateIndex = templates.findIndex(t => t.id === id);
        
        if (templateIndex >= 0) {
            templates[templateIndex].updated_at = new Date().toISOString();
            // Update other fields based on SQL
            this.saveTemplates(templates);
            return [templates[templateIndex]];
        }

        return [];
    }

    private handleDelete(sql: string, params: any[] = [], templates: any[]): any {
        // Soft delete - mark as inactive
        const id = params[0];
        const template = templates.find(t => t.id === id);
        
        if (template) {
            template.is_active = false;
            template.updated_at = new Date().toISOString();
            this.saveTemplates(templates);
        }

        return { changes: 1 };
    }

    private generateId(): string {
        return 'tpl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Export singleton instance
export const database = new SimpleDatabaseAdapter();
