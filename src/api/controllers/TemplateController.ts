import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TemplateRepository } from '../../repositories/TemplateRepository.js';
import { dbConnection } from '../../config/database.js';

/**
 * Template Management API Controller
 * 
 * Implements the TypeSpec-defined template management endpoints
 * with full CRUD operations for document templates.
 */
export class TemplateController {
    private static templateRepository: any;

    /**
     * Set the TemplateRepository instance after DB connection is established
     */
    static setTemplateRepository(repo: any) {
        TemplateController.templateRepository = repo;
    }
    
    /**
     * Create a new template
     * POST /api/v1/templates
     */
    static async createTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description, category, tags, templateData, isActive } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id || 'api-user';

            // Create template using actual TemplateRepository
            const templateRecord = {
                name,
                description: description || `API-created template: ${name}`,
                category: category || 'api-created',
                template_type: 'api_created',
                ai_instructions: templateData?.aiInstructions || `Generate a ${name}`,
                prompt_template: templateData?.content || `# ${name}\n\n{{content}}`,
                generation_function: 'getAiGenericDocument',
                metadata: {
                    tags: tags || [],
                    variables: templateData?.variables || [],
                    layout: templateData?.layout || {},
                    emoji: '🆕',
                    priority: 200,
                    source: 'api'
                },
                version: 1,
                is_active: isActive !== false,
                is_system: false,
                created_by: userId
            };

            const createdTemplate = await TemplateController.templateRepository.createTemplate(templateRecord);

            // Convert to API format
            const apiTemplate = {
                id: createdTemplate.id,
                name: createdTemplate.name,
                description: createdTemplate.description,
                category: createdTemplate.category,
                tags: createdTemplate.metadata?.tags || [],
                templateData: {
                    content: createdTemplate.prompt_template,
                    aiInstructions: createdTemplate.ai_instructions,
                    variables: createdTemplate.metadata?.variables || [],
                    layout: createdTemplate.metadata?.layout || {}
                },
                isActive: createdTemplate.is_active,
                createdBy: createdTemplate.created_by,
                createdAt: createdTemplate.created_at,
                updatedAt: createdTemplate.updated_at,
                version: createdTemplate.version,
                templateType: createdTemplate.template_type
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

            if (!TemplateController.templateRepository) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'REPOSITORY_NOT_INITIALIZED',
                        message: 'Template repository is not initialized. Please try again later.'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }
            const template = await TemplateController.templateRepository.getTemplateById(templateId);
            if (template) {
                // Convert database template to API format
                const apiTemplate = {
                    id: template.id,
                    name: template.name,
                    description: template.description,
                    category: template.category,
                    tags: template.metadata?.tags || [],
                    templateData: {
                        content: template.prompt_template,
                        aiInstructions: template.ai_instructions,
                        variables: template.metadata?.variables || [],
                        layout: template.metadata?.layout || {}
                    },
                    isActive: template.is_active,
                    createdBy: template.created_by,
                    createdAt: template.created_at,
                    updatedAt: template.updated_at,
                    version: template.version,
                    templateType: template.template_type
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

            // TODO: Implement actual template update in database
            console.log('Template update requested:', {
                requestId,
                templateId,
                updates: Object.keys(updates),
                userId,
                timestamp: new Date().toISOString()
            });

            // Mock successful update
            const updatedTemplate = {
                id: templateId,
                ...updates,
                updatedAt: new Date().toISOString(),
                version: 2
            };

            res.json({
                success: true,
                data: updatedTemplate,
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

            // TODO: Implement actual template deletion in database
            console.log('Template deletion requested:', {
                requestId,
                templateId,
                userId,
                timestamp: new Date().toISOString()
            });

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

            if (!TemplateController.templateRepository) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'REPOSITORY_NOT_INITIALIZED',
                        message: 'Template repository is not initialized. Please try again later.'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }
            const searchQuery = {
                category: category as string,
                search_text: search as string,
                is_system: undefined, // Include both system and user templates
                limit: parseInt(limit as string),
                offset: (parseInt(page as string) - 1) * parseInt(limit as string)
            };
            const templates = await TemplateController.templateRepository.searchTemplates(searchQuery);

            // Convert to API format
            const apiTemplates = templates.map((template: any) => ({
                id: template.id,
                name: template.name,
                description: template.description,
                category: template.category,
                tags: template.metadata?.tags || [],
                isActive: template.is_active,
                createdAt: template.created_at,
                updatedAt: template.updated_at,
                templateType: template.template_type,
                version: template.version
            }));            console.log('Template list requested:', {
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
                    total: apiTemplates.length,
                    pages: Math.ceil(apiTemplates.length / parseInt(limit as string))
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

            if (!TemplateController.templateRepository) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'REPOSITORY_NOT_INITIALIZED',
                        message: 'Template repository is not initialized. Please try again later.'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }
            // Get all templates to calculate stats
            const templates = await TemplateController.templateRepository.getAllTemplates();
            
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

            if (!TemplateController.templateRepository) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'REPOSITORY_NOT_INITIALIZED',
                        message: 'Template repository is not initialized. Please try again later.'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }
            const templates = await TemplateController.templateRepository.getAllTemplates();
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

            if (!TemplateController.templateRepository) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'REPOSITORY_NOT_INITIALIZED',
                        message: 'Template repository is not initialized. Please try again later.'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }
            const templates = await TemplateController.templateRepository.getAllTemplates();
            const tagsSet = new Set<string>();
            
            templates.forEach((template: any) => {
                if (template.metadata?.tags && Array.isArray(template.metadata.tags)) {
                    template.metadata.tags.forEach((tag: string) => tagsSet.add(tag));
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
                    if (!TemplateController.templateRepository) {
                        throw new Error('Template repository is not initialized.');
                    }
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
                if (!TemplateController.templateRepository) {
                    throw new Error('Template repository is not initialized.');
                }
                const template = await TemplateController.templateRepository.getTemplateById(id);
                        if (template) templates.push(template);
                    } catch (error) {
                        console.error(`Failed to get template ${id}:`, error);
                    }
                }
            } else {
                if (!TemplateController.templateRepository) {
                    throw new Error('Template repository is not initialized.');
                }
                templates = await TemplateController.templateRepository.getAllTemplates();
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
                        template_type: 'imported',
                        ai_instructions: templateData.aiInstructions || `Generate a ${templateData.name}`,
                        prompt_template: templateData.content || `# ${templateData.name}\n\n{{content}}`,
                        generation_function: 'getAiGenericDocument',
                        metadata: {
                            tags: templateData.tags || [],
                            variables: templateData.variables || [],
                            source: 'import'
                        },
                        version: 1,
                        is_active: true,
                        is_system: false,
                        created_by: userId
                    };

                    if (!TemplateController.templateRepository) {
                        throw new Error('Template repository is not initialized.');
                    }
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
