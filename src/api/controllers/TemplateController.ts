import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TemplateRepository } from '../../repositories/TemplateRepository.js';
import { dbConnection } from '../../config/database.js';
import { SoftDeleteService } from '../../services/SoftDeleteService.js';
import { DependencyRegistryService } from '../../services/DependencyRegistryService.js';
import { 
    UnifiedTemplate, 
    CreateTemplateRequest, 
    UpdateTemplateRequest, 
    TemplateApiResponse,
    TemplateConverter 
} from '../../types/UnifiedTemplate.js';

/**
 * Template Management API Controller
 * 
 * Implements the TypeSpec-defined template management endpoints
 * with full CRUD operations for document templates.
 */
export class TemplateController {
    private static templateRepository: any;
    private static softDeleteService: SoftDeleteService;

    /**
     * Set the TemplateRepository instance after DB connection is established
     */
    static setTemplateRepository(repo: any) {
        TemplateController.templateRepository = repo;
        TemplateController.softDeleteService = new SoftDeleteService(repo);
    }
    
    /**
     * Create a new template
     * POST /api/v1/templates
     */
    static async createTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description, category, tags, templateData, metadata, isActive } = req.body;
            
            // Debug: Log the incoming metadata
            console.log('🔍 TemplateController: Received metadata:', JSON.stringify(metadata, null, 2));
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id || 'api-user';

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

            // Validate required fields
            if (!name || !category) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Template name and category are required'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            // Generate documentKey from template name
            const documentKey = name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            // Create unified template request
            const createRequest: CreateTemplateRequest = {
                name,
                description: description || `API-created template: ${name}`,
                category,
                documentKey,
                templateType: 'api_created',
                content: {
                    aiInstructions: templateData?.aiInstructions || `Generate a ${name}`,
                    promptTemplate: templateData?.content || `# ${name}\n\n{{content}}`,
                    variables: templateData?.variables || [],
                    layout: templateData?.layout || {}
                },
                metadata: {
                    tags: tags || [],
                    priority: 200,
                    emoji: '🆕',
                    source: 'api',
                    contextPriority: 'medium',
                    author: metadata?.author || userId,
                    framework: metadata?.framework || 'general',
                    complexity: metadata?.complexity || 'medium',
                    estimatedTime: metadata?.estimatedTime || '2-4 hours',
                    dependencies: metadata?.dependencies || [],
                    version: metadata?.version || '1.0.0'
                },
                isActive: isActive !== false,
                isSystem: false,
                createdBy: userId
            };

            // Debug: Log the created request metadata
            console.log('🔍 TemplateController: Created request metadata:', JSON.stringify(createRequest.metadata, null, 2));

            // Convert to database format and save
            console.log('🔄 Converting template to database format...');
            const dbTemplate = TemplateConverter.toDatabase(createRequest);
            console.log('📄 Database template format:', JSON.stringify(dbTemplate, null, 2));
            
            console.log('💾 Saving template to database...');
            const createdTemplate = await TemplateController.templateRepository.createTemplate(dbTemplate);
            console.log('✅ Template saved to database:', {
                id: createdTemplate._id,
                name: createdTemplate.name
            });

            // Update dependency registry with new template
            try {
                console.log('🔄 Updating dependency registry...');
                await DependencyRegistryService.addTemplateToRegistry(createdTemplate);
                console.log('✅ Dependency registry updated successfully');
            } catch (error) {
                console.warn('⚠️ Failed to update dependency registry:', error);
                // Don't fail the template creation if registry update fails
            }

            // Convert back to unified format
            const unifiedTemplate = TemplateConverter.fromDatabase(createdTemplate);
            const apiTemplate = TemplateConverter.toApiResponse(unifiedTemplate);

            console.log('Template created successfully:', {
                requestId,
                templateId: unifiedTemplate.id,
                name: unifiedTemplate.name,
                category: unifiedTemplate.category,
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
            
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            res.status(500).json({
                success: false,
                error: {
                    code: 'TEMPLATE_CREATION_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to create template'
                },
                requestId,
                timestamp: new Date().toISOString()
            });
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
                    metadata: {
                        tags: template.metadata?.tags || [],
                        priority: template.metadata?.priority || 100,
                        emoji: template.metadata?.emoji || '📄',
                        source: template.metadata?.source || 'unknown',
                        contextPriority: template.contextPriority || 'medium',
                        author: template.metadata?.author,
                        framework: template.metadata?.framework,
                        complexity: template.metadata?.complexity,
                        estimatedTime: template.metadata?.estimatedTime,
                        dependencies: template.metadata?.dependencies,
                        version: template.metadata?.version
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
            const userId = req.user?.id || 'api-user';

            // Debug: Log the incoming request body
            console.log('🔍 TemplateController: Received update request body:', JSON.stringify(updates, null, 2));
            console.log('🔍 TemplateController: templateData field:', updates.templateData);
            console.log('🔍 TemplateController: content in templateData:', updates.templateData?.content);
            console.log('🔍 TemplateController: metadata field:', JSON.stringify(updates.metadata, null, 2));

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

            // Check if template exists
            const existingTemplate = await TemplateController.templateRepository.getTemplateById(templateId);
            if (!existingTemplate) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TEMPLATE_NOT_FOUND',
                        message: 'Template not found'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            // Convert updates to database format
            const updateRequest: UpdateTemplateRequest = {
                name: updates.name,
                description: updates.description,
                category: updates.category,
                templateType: updates.templateType,
                content: updates.templateData ? {
                    aiInstructions: updates.templateData.aiInstructions,
                    promptTemplate: updates.templateData.content,
                    variables: updates.templateData.variables,
                    layout: updates.templateData.layout
                } : undefined,
                metadata: updates.metadata ? {
                    tags: updates.tags || updates.metadata?.tags,
                    priority: updates.metadata?.priority,
                    emoji: updates.metadata?.emoji,
                    source: updates.metadata?.source,
                    contextPriority: updates.metadata?.contextPriority,
                    author: updates.metadata?.author,
                    framework: updates.metadata?.framework,
                    complexity: updates.metadata?.complexity,
                    estimatedTime: updates.metadata?.estimatedTime,
                    dependencies: updates.metadata?.dependencies,
                    version: updates.metadata?.version
                } : undefined,
                isActive: updates.isActive
            };

            // Remove undefined fields
            const cleanUpdateRequest = Object.fromEntries(
                Object.entries(updateRequest).filter(([_, value]) => value !== undefined)
            );

            // Convert to database format
            const dbUpdates = TemplateConverter.toDatabase(cleanUpdateRequest);
            
            // Update the template
            const updatedTemplate = await TemplateController.templateRepository.updateTemplate(
                templateId, 
                dbUpdates
            );

            if (!updatedTemplate) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TEMPLATE_NOT_FOUND',
                        message: 'Template not found after update'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            // Convert back to unified format
            const unifiedTemplate = TemplateConverter.fromDatabase(updatedTemplate);
            const apiTemplate = TemplateConverter.toApiResponse(unifiedTemplate);

            console.log('Template updated successfully:', {
                requestId,
                templateId,
                updatedFields: Object.keys(cleanUpdateRequest),
                userId,
                timestamp: new Date().toISOString()
            });

            res.json({
                success: true,
                data: apiTemplate,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error updating template:', error);
            
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            res.status(500).json({
                success: false,
                error: {
                    code: 'TEMPLATE_UPDATE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to update template'
                },
                requestId,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Delete a template
     * DELETE /api/v1/templates/:templateId
     */
    static async deleteTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateId } = req.params;
            const { permanent } = req.query;
            const { reason } = req.body || {};
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id || 'api-user';

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

            // Check if template exists
            const existingTemplate = await TemplateController.templateRepository.getTemplateById(templateId);
            if (!existingTemplate) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TEMPLATE_NOT_FOUND',
                        message: 'Template not found'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            // Check if user has permission to delete system templates
            if (existingTemplate.is_system && !req.user?.isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_PERMISSIONS',
                        message: 'System templates can only be deleted by administrators'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            // Perform deletion (soft delete by default, permanent if requested)
            if (permanent === 'true') {
                const deleted = await TemplateController.templateRepository.hardDeleteTemplate(templateId);
                if (!deleted) {
                    return res.status(500).json({
                        success: false,
                        error: {
                            code: 'DELETE_FAILED',
                            message: 'Failed to permanently delete template'
                        },
                        requestId,
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                // Use soft delete service for proper audit trail
                const deleteResult = await TemplateController.softDeleteService.softDeleteTemplate(templateId, {
                    userId,
                    reason: reason || 'Deleted via API'
                });

                if (!deleteResult.success) {
                    return res.status(500).json({
                        success: false,
                        error: {
                            code: 'SOFT_DELETE_FAILED',
                            message: 'Failed to soft delete template'
                        },
                        requestId,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            console.log('Template deleted successfully:', {
                requestId,
                templateId,
                templateName: existingTemplate.name,
                permanent: permanent === 'true',
                reason: reason || 'Deleted via API',
                userId,
                timestamp: new Date().toISOString()
            });

            res.json({
                success: true,
                message: permanent === 'true' ? 'Template permanently deleted' : 'Template deleted successfully',
                data: {
                    templateId,
                    templateName: existingTemplate.name,
                    deletedAt: new Date().toISOString(),
                    permanent: permanent === 'true'
                },
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error deleting template:', error);
            
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            res.status(500).json({
                success: false,
                error: {
                    code: 'TEMPLATE_DELETE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to delete template'
                },
                requestId,
                timestamp: new Date().toISOString()
            });
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

            // Get total count for pagination (without limit/offset)
            const totalCountQuery = {
                category: category as string,
                search_text: search as string,
                is_system: undefined
            };
            const totalTemplates = await TemplateController.templateRepository.searchTemplates(totalCountQuery);
            const totalCount = totalTemplates.length;

            // Convert to unified format and then to API format
            const apiTemplates = templates.map((template: any) => {
                const unifiedTemplate = TemplateConverter.fromDatabase(template);
                return TemplateConverter.toApiResponse(unifiedTemplate);
            });            console.log('Template list requested:', {
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
                    total: totalCount,
                    pages: Math.ceil(totalCount / parseInt(limit as string))
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

    /**
     * Get soft-deleted templates
     * GET /api/v1/templates/deleted
     */
    static async getSoftDeletedTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                category,
                deletedBy,
                daysSinceDeleted,
                limit = 20,
                offset = 0
            } = req.query;

            const requestId = req.headers['x-request-id'] as string || uuidv4();

            if (!TemplateController.softDeleteService) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'SERVICE_NOT_INITIALIZED',
                        message: 'Soft delete service is not initialized'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            const deletedTemplates = await TemplateController.softDeleteService.getSoftDeletedTemplates({
                category: category as string,
                deletedBy: deletedBy as string,
                daysSinceDeleted: daysSinceDeleted ? parseInt(daysSinceDeleted as string) : undefined,
                limit: parseInt(limit as string),
                offset: parseInt(offset as string)
            });

            res.json({
                success: true,
                data: deletedTemplates,
                pagination: {
                    limit: parseInt(limit as string),
                    offset: parseInt(offset as string),
                    total: deletedTemplates.length
                },
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error getting soft-deleted templates:', error);
            
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            res.status(500).json({
                success: false,
                error: {
                    code: 'GET_DELETED_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to get soft-deleted templates'
                },
                requestId,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Restore a soft-deleted template
     * POST /api/v1/templates/:templateId/restore
     */
    static async restoreTemplate(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateId } = req.params;
            const { reason } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id || 'api-user';

            if (!TemplateController.softDeleteService) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'SERVICE_NOT_INITIALIZED',
                        message: 'Soft delete service is not initialized'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            const restoreResult = await TemplateController.softDeleteService.restoreTemplate(templateId, {
                userId,
                reason: reason || 'Restored via API'
            });

            res.json({
                success: true,
                data: restoreResult,
                message: 'Template restored successfully',
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error restoring template:', error);
            
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            res.status(500).json({
                success: false,
                error: {
                    code: 'RESTORE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to restore template'
                },
                requestId,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Batch restore templates
     * POST /api/v1/templates/batch-restore
     */
    static async batchRestoreTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateIds, reason } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id || 'api-user';

            if (!Array.isArray(templateIds)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'templateIds must be an array'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            if (!TemplateController.softDeleteService) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'SERVICE_NOT_INITIALIZED',
                        message: 'Soft delete service is not initialized'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            const restoreResult = await TemplateController.softDeleteService.batchRestoreTemplates(
                templateIds,
                {
                    userId,
                    reason: reason || 'Batch restored via API'
                }
            );

            res.json({
                success: restoreResult.success,
                data: {
                    totalRequested: templateIds.length,
                    restored: restoreResult.restored,
                    failed: restoreResult.failed,
                    errors: restoreResult.errors
                },
                message: `Restored ${restoreResult.restored}/${templateIds.length} templates`,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error batch restoring templates:', error);
            
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            res.status(500).json({
                success: false,
                error: {
                    code: 'BATCH_RESTORE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to batch restore templates'
                },
                requestId,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get soft delete statistics
     * GET /api/v1/templates/deleted/stats
     */
    static async getSoftDeleteStats(req: Request, res: Response, next: NextFunction) {
        try {
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            if (!TemplateController.softDeleteService) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'SERVICE_NOT_INITIALIZED',
                        message: 'Soft delete service is not initialized'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            const stats = await TemplateController.softDeleteService.getSoftDeleteStatistics();

            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error getting soft delete stats:', error);
            
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            res.status(500).json({
                success: false,
                error: {
                    code: 'GET_STATS_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to get soft delete statistics'
                },
                requestId,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Permanently delete old soft-deleted templates
     * DELETE /api/v1/templates/cleanup
     */
    static async cleanupOldDeletedTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const { olderThanDays = 30 } = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            const userId = req.user?.id || 'api-user';

            if (!TemplateController.softDeleteService) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'SERVICE_NOT_INITIALIZED',
                        message: 'Soft delete service is not initialized'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            const cleanupResult = await TemplateController.softDeleteService.permanentDeleteOldTemplates(
                parseInt(olderThanDays),
                {
                    userId,
                    reason: `Cleanup of templates older than ${olderThanDays} days`
                }
            );

            res.json({
                success: true,
                data: cleanupResult,
                message: `Permanently deleted ${cleanupResult.deletedCount} old templates`,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error cleaning up old templates:', error);
            
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            res.status(500).json({
                success: false,
                error: {
                    code: 'CLEANUP_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to cleanup old templates'
                },
                requestId,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get template audit trail
     * GET /api/v1/templates/:templateId/audit
     */
    static async getTemplateAuditTrail(req: Request, res: Response, next: NextFunction) {
        try {
            const { templateId } = req.params;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            if (!TemplateController.templateRepository) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'REPOSITORY_NOT_INITIALIZED',
                        message: 'Template repository is not initialized'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            const auditTrail = await TemplateController.templateRepository.getTemplateAuditTrail(templateId);

            res.json({
                success: true,
                data: {
                    templateId,
                    auditTrail
                },
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            console.error('Error getting audit trail:', error);
            
            const requestId = req.headers['x-request-id'] as string || uuidv4();
            res.status(500).json({
                success: false,
                error: {
                    code: 'GET_AUDIT_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to get audit trail'
                },
                requestId,
                timestamp: new Date().toISOString()
            });
        }
    }
}
