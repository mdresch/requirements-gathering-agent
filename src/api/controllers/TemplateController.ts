import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MongoTemplateRepository } from '../../repositories/TemplateRepository.mongo';
import { connectMongo } from '../../db/mongoose';

/**
 * Template Management API Controller
 * 
 * Implements the TypeSpec-defined template management endpoints
 * with full CRUD operations for document templates.
 */
export class TemplateController {
    // Use the MongoDB repository
    static templateRepository: MongoTemplateRepository = new MongoTemplateRepository();
    
    /**
     * Create a new template
     * POST /api/v1/templates
     */
    static async createTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description, category, tags, templateData, isActive } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id || 'api-user';

            // Create template using ITemplate interface
            const templateRecord = {
                name,
                description: description || `API-created template: ${name}`,
                category: category || 'api-created',
                tags: tags || [],
                templateData: {
                    content: templateData?.content || `# ${name}\n\n{{content}}`,
                    aiInstructions: templateData?.aiInstructions || `Generate a ${name}`,
                    variables: templateData?.variables || [],
                    layout: templateData?.layout || {}
                },
                isActive: isActive !== false
            };

            const createdTemplate = await TemplateController.templateRepository.createTemplate(templateRecord);

            // Convert to API format
            const apiTemplate = {
                id: createdTemplate._id?.toString?.() || createdTemplate.id,
                name: createdTemplate.name,
                description: createdTemplate.description,
                category: createdTemplate.category,
                tags: createdTemplate.tags || [],
                templateData: {
                    content: createdTemplate.templateData?.content,
                    aiInstructions: createdTemplate.templateData?.aiInstructions,
                    variables: createdTemplate.templateData?.variables || [],
                    layout: createdTemplate.templateData?.layout || {}
                },
                isActive: createdTemplate.isActive,
                createdAt: createdTemplate.createdAt,
                updatedAt: createdTemplate.updatedAt
            };

            console.log('Template created:', {
                requestId,
                templateId: createdTemplate.id,
                name,
                userId,
                timestamp: new Date().toISOString()
            });

            res.status(201).json({
                success: true,
                data: apiTemplate,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error creating template:', error);
            next(error);
        }
    }/**
     * Get a template by ID
     * GET /api/v1/templates/:templateId
     */
    static async getTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateId } = req.params;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id;

            // Use the actual TemplateRepository to get template

            const template = await TemplateController.templateRepository.getTemplateById(templateId);
            if (template) {
                // Convert database template to API format (ITemplate)
                const apiTemplate = {
                    id: template._id?.toString?.() || template.id,
                    name: template.name,
                    description: template.description,
                    category: template.category,
                    tags: template.tags || [],
                    templateData: {
                        content: template.templateData?.content,
                        aiInstructions: template.templateData?.aiInstructions,
                        variables: template.templateData?.variables || [],
                        layout: template.templateData?.layout || {}
                    },
                    isActive: template.isActive,
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt
                };

                res.json({
                    success: true,
                    data: apiTemplate,
                    timestamp: new Date().toISOString(),
                    requestId
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'TEMPLATE_NOT_FOUND',
                        message: 'Template not found',
                        timestamp: new Date().toISOString()
                    },
                    requestId
                });
            }

        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a template
     * PUT /api/v1/templates/:templateId
     */
    static async updateTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateId } = req.params;
            const updates = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id;

            // Only allow updates to fields in ITemplate
            const allowedUpdates: any = {};
            if (typeof updates.name !== 'undefined') allowedUpdates.name = updates.name;
            if (typeof updates.description !== 'undefined') allowedUpdates.description = updates.description;
            if (typeof updates.category !== 'undefined') allowedUpdates.category = updates.category;
            if (typeof updates.tags !== 'undefined') allowedUpdates.tags = updates.tags;
            if (typeof updates.isActive !== 'undefined') allowedUpdates.isActive = updates.isActive;
            if (typeof updates.templateData !== 'undefined') allowedUpdates.templateData = updates.templateData;

            const updatedTemplate = await TemplateController.templateRepository.updateTemplate(templateId, allowedUpdates);
            if (!updatedTemplate) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TEMPLATE_NOT_FOUND',
                        message: 'Template not found',
                        timestamp: new Date().toISOString()
                    },
                    requestId
                });
            }
            // Convert to API format
            const apiTemplate = {
                id: updatedTemplate._id?.toString?.() || updatedTemplate.id,
                name: updatedTemplate.name,
                description: updatedTemplate.description,
                category: updatedTemplate.category,
                tags: updatedTemplate.tags || [],
                templateData: {
                    content: updatedTemplate.templateData?.content,
                    aiInstructions: updatedTemplate.templateData?.aiInstructions,
                    variables: updatedTemplate.templateData?.variables || [],
                    layout: updatedTemplate.templateData?.layout || {}
                },
                isActive: updatedTemplate.isActive,
                createdAt: updatedTemplate.createdAt,
                updatedAt: updatedTemplate.updatedAt
            };
            res.json({
                success: true,
                data: apiTemplate,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a template
     * DELETE /api/v1/templates/:templateId
     */
    static async deleteTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateId } = req.params;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id;

            await TemplateController.templateRepository.deleteTemplate(templateId);
            res.json({
                success: true,
                message: 'Template deleted successfully',
                data: {
                    templateId,
                    deletedAt: new Date().toISOString()
                },
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * List templates with filtering and pagination
     * GET /api/v1/templates
     */
    static async listTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                page = 1,
                limit = 20,
                sort = 'created',
                order = 'desc',
                category,
                tag,
                search,
                isActive
            } = req.query;            const requestId = req.headers['x-request-id'] as string || uuidv4();

            // Use the actual TemplateRepository to get templates
            const searchQuery = {
                category: category as string,
                searchText: search as string,
                isSystem: undefined, // Include both system and user templates
                limit: parseInt(limit as string),
                offset: (parseInt(page as string) - 1) * parseInt(limit as string)
            };

            const { templates, total } = await TemplateController.templateRepository.listTemplates(searchQuery, { page, limit });

            // Convert to API format
            const apiTemplates = templates.map((template: any) => ({
                id: template._id?.toString?.() || template.id,
                name: template.name,
                description: template.description,
                category: template.category,
                tags: template.tags || [],
                templateData: {
                    content: template.templateData?.content,
                    aiInstructions: template.templateData?.aiInstructions,
                    variables: template.templateData?.variables || [],
                    layout: template.templateData?.layout || {}
                },
                isActive: template.isActive,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt
            }));
            console.log('Template list requested:', {
                requestId,
                filters: { category, tag, search, isActive },
                pagination: { page, limit, sort, order },
                resultCount: apiTemplates.length,
                timestamp: new Date().toISOString()
            });

            res.json({
                success: true,
                data: apiTemplates,
                pagination: {
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    total: total,
                    pages: Math.ceil(total / parseInt(limit as string))
                },
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate a template
     * POST /api/v1/templates/validate
     */
    static async validateTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateData, testData } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            // TODO: Implement actual template validation logic
            console.log('Template validation requested:', {
                requestId,
                hasTemplateData: !!templateData,
                hasTestData: !!testData,
                timestamp: new Date().toISOString()
            });

            // Mock validation results
            const validationResult = {
                isValid: true,
                errors: [],
                warnings: [],
                variables: templateData.variables || [],
                testResult: testData ? {
                    success: true,
                    renderedContent: 'Rendered template content would appear here',
                    processingTime: '125ms'
                } : null
            };

            res.json({
                success: true,
                data: validationResult,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Preview a template with sample data
     * POST /api/v1/templates/{templateId}/preview
     */
    static async previewTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateId } = req.params;
            const { sampleData } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            // TODO: Implement actual template preview logic
            const previewResult = {
                templateId,
                previewHtml: `<div>Preview of template ${templateId} with sample data</div>`,
                sampleData: sampleData || {},
                generatedAt: new Date().toISOString()
            };

            console.log('Template preview generated:', {
                requestId,
                templateId,
                timestamp: new Date().toISOString()
            });

            res.json({
                success: true,
                data: previewResult,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Clone an existing template
     * POST /api/v1/templates/{templateId}/clone
     */
    static async cloneTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateId } = req.params;
            const { name, description } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id || 'anonymous';

            // TODO: Implement actual template cloning logic
            const newTemplateId = uuidv4();
            const createdAt = new Date().toISOString();

            const clonedTemplate = {
                id: newTemplateId,
                name: name || `Copy of Template ${templateId}`,
                description: description || `Cloned from template ${templateId}`,
                originalTemplateId: templateId,
                category: 'general',
                tags: ['cloned'],
                templateData: {},
                isActive: true,
                createdBy: userId,
                createdAt,
                updatedAt: createdAt,
                version: 1
            };

            console.log('Template cloned:', {
                requestId,
                originalTemplateId: templateId,
                newTemplateId,
                userId,
                timestamp: new Date().toISOString()
            });

            res.status(201).json({
                success: true,
                data: clonedTemplate,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get template usage statistics
     * GET /api/v1/templates/{templateId}/stats
     */
    static async getTemplateStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateId } = req.params;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            // TODO: Implement actual template statistics retrieval
            const stats = {
                templateId,
                usageCount: Math.floor(Math.random() * 100),
                lastUsed: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
                averageProcessingTime: Math.floor(Math.random() * 5000) + 1000, // ms
                successRate: 0.95,
                failureCount: Math.floor(Math.random() * 5),
                popularOutputFormats: ['pdf', 'docx', 'html'],
                generatedAt: new Date().toISOString()
            };

            console.log('Template stats retrieved:', {
                requestId,
                templateId,
                timestamp: new Date().toISOString()
            });

            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get overall template statistics (for admin dashboard)
     * GET /api/v1/templates/stats
     */
    static async getOverallTemplateStats(req: Request, res: Response, next: NextFunction) {
        try {
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            // Get all templates to calculate stats
            const { templates } = await TemplateController.templateRepository.listTemplates({}, { page: 1, limit: 1000 });
            
            // Calculate statistics
            const totalTemplates = templates.length;
            const categoriesMap = new Map<string, number>();
            const tagsMap = new Map<string, number>();
            
            templates.forEach((template: any) => {
                // Count categories
                if (template.category) {
                    categoriesMap.set(template.category, (categoriesMap.get(template.category) || 0) + 1);
                }
                
                // Count tags
                if (template.metadata?.tags && Array.isArray(template.metadata.tags)) {
                    template.metadata.tags.forEach((tag: string) => {
                        tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
                    });
                }
            });

            // Convert to arrays and sort
            const topCategories = Array.from(categoriesMap.entries())
                .map(([category, count]) => ({ category, count }))
                .sort((a, b) => b.count - a.count);

            const topTags = Array.from(tagsMap.entries())
                .map(([tag, count]) => ({ tag, count }))
                .sort((a, b) => b.count - a.count);            const stats = {
                totalTemplates,
                categoriesCount: categoriesMap.size,
                topCategories,
                topTags,
                recentActivity: templates
                    .filter((template: any) => template.updated_at)
                    .sort((a: any, b: any) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime())
                    .slice(0, 10)
                    .map((template: any) => ({
                        type: 'updated' as const,
                        templateName: template.name,
                        timestamp: template.updated_at!
                    }))
            };

            console.log('Overall template stats retrieved:', {
                requestId,
                totalTemplates,
                timestamp: new Date().toISOString()
            });

            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error getting template stats:', error);
            next(error);
        }
    }

    /**
     * Get template categories
     * GET /api/v1/templates/categories
     */
    static async getTemplateCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            const { templates } = await TemplateController.templateRepository.listTemplates({}, { page: 1, limit: 1000 });
            const categories = [...new Set(templates.map((t: any) => t.category).filter(Boolean))].sort();

            res.json({
                success: true,
                data: categories,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error getting template categories:', error);
            next(error);
        }
    }

    /**
     * Get template tags
     * GET /api/v1/templates/tags
     */
    static async getTemplateTags(req: Request, res: Response, next: NextFunction) {
        try {
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            // Use listTemplates to get all templates
            const { templates } = await TemplateController.templateRepository.listTemplates({}, { page: 1, limit: 1000 });
            const tagsSet = new Set<string>();
            templates.forEach((template: any) => {
                if (Array.isArray(template.tags)) {
                    template.tags.forEach((tag: string) => tagsSet.add(tag));
                }
            });
            const tags = [...tagsSet].sort();
            res.json({
                success: true,
                data: tags,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error getting template tags:', error);
            next(error);
        }
    }

    /**
     * Bulk delete templates
     * POST /api/v1/templates/bulk-delete
     */
    static async bulkDeleteTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const { ids } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            if (!Array.isArray(ids)) {
                return res.status(400).json({
                    success: false,
                    error: 'ids must be an array',
                    timestamp: new Date().toISOString(),
                    requestId
                });
            }

            let deleted = 0;
            for (const id of ids) {
                try {
                    await TemplateController.templateRepository.deleteTemplate(id);
                    deleted++;
                } catch (error) {
                    console.error(`Failed to delete template ${id}:`, error);
                }
            }

            res.json({
                success: true,
                data: { deleted },
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error bulk deleting templates:', error);
            next(error);
        }
    }

    /**
     * Export templates
     * GET /api/v1/templates/export
     */
    static async exportTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const { ids } = req.query;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            let templates;
            if (ids && typeof ids === 'string') {
                const templateIds = ids.split(',');
                templates = [];
                for (const id of templateIds) {
                    try {
                        const template = await TemplateController.templateRepository.getTemplateById(id);
                        if (template) templates.push(template);
                    } catch (error) {
                        console.error(`Failed to get template ${id}:`, error);
                    }
                }
            } else {
                const result = await TemplateController.templateRepository.listTemplates({}, { page: 1, limit: 1000 });
                templates = result.templates;
            }

            res.json({
                success: true,
                data: templates,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error exporting templates:', error);
            next(error);
        }
    }

    /**
     * Import templates
     * POST /api/v1/templates/import
     */
    static async importTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const { templates } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id || 'api-user';

            if (!Array.isArray(templates)) {
                return res.status(400).json({
                    success: false,
                    error: 'templates must be an array',
                    timestamp: new Date().toISOString(),
                    requestId
                });
            }

            let imported = 0;
            const errors: string[] = [];

            for (const templateData of templates) {
                try {
                    const templateRecord = {
                        name: templateData.name,
                        description: templateData.description || `Imported template: ${templateData.name}`,
                        category: templateData.category || 'imported',
                        tags: templateData.tags || [],
                        templateData: {
                            content: templateData.content || `# ${templateData.name}\n\n{{content}}`,
                            aiInstructions: templateData.aiInstructions || `Generate a ${templateData.name}`,
                            variables: templateData.variables || [],
                            layout: templateData.layout || {}
                        },
                        isActive: true
                    };

                    await TemplateController.templateRepository.createTemplate(templateRecord);
                    imported++;
                } catch (error) {
                    errors.push(`Failed to import template "${templateData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            res.json({
                success: true,
                data: { imported, errors },
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error importing templates:', error);
            next(error);
        }
    }
}
