import { Router, Request, Response } from 'express';
import { TemplateModel } from '../models/Template.model.js';
import { sanitizeInput } from '../middleware/sanitization.js';
import { validateBody, validateQuery, validateParams, commonValidations } from '../middleware/validation.js';
import { templateSchemas, commonSchemas } from '../validation/schemas.js';
import Joi from 'joi';
import { toObjectId, transformDocument, createSuccessResponse, createPaginatedResponse } from '../utils/idUtils.js';

/**
 * Check if template data has actually changed
 * @param existingTemplate The existing template from database
 * @param updateData The new data to be updated
 * @returns true if data has changed, false if no changes
 */
function hasTemplateDataChanged(existingTemplate: any, updateData: any): boolean {
    // Fields to compare for changes
    const fieldsToCompare = [
        'name',
        'description', 
        'category',
        'template_type',
        'ai_instructions',
        'prompt_template',
        'generation_function',
        'content',
        'variables',
        'metadata'
    ];

    for (const field of fieldsToCompare) {
        const existingValue = existingTemplate[field];
        const newValue = updateData[field];

        // Handle different data types
        if (typeof existingValue === 'object' && typeof newValue === 'object') {
            // Compare objects/arrays
            if (JSON.stringify(existingValue) !== JSON.stringify(newValue)) {
                console.log(`📝 Change detected in field '${field}':`, {
                    existing: existingValue,
                    new: newValue
                });
                return true;
            }
        } else if (existingValue !== newValue) {
            console.log(`📝 Change detected in field '${field}':`, {
                existing: existingValue,
                new: newValue
            });
            return true;
        }
    }

    console.log(`📝 No changes detected in template data`);
    return false;
}

const router = Router();

/**
 * GET /api/v1/templates
 * Get all templates with pagination and filtering
 */
router.get('/', 
  validateQuery(commonSchemas.pagination.keys({
    search: Joi.string().trim().max(100).optional(),
    category: Joi.string().trim().max(50).optional(),
    tag: Joi.string().trim().max(30).optional(),
    is_active: Joi.boolean().optional(),
    is_deleted: Joi.boolean().optional()
  })),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, search, category, tag, is_active, is_deleted } = req.query;
      
      // Build query
      const query: any = { is_deleted: false };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'metadata.tags': { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (category) query.category = category;
      if (tag) query['metadata.tags'] = { $in: [tag] };
      if (is_active !== undefined) query.is_active = is_active === 'true';
      if (is_deleted !== undefined) query.is_deleted = is_deleted === 'true';
      
      // Execute query with pagination
      const skip = (Number(page) - 1) * Number(limit);
      const [templates, total] = await Promise.all([
        TemplateModel.find(query)
          .skip(skip)
          .limit(Number(limit))
          .sort({ created_at: -1 })
          .lean(),
        TemplateModel.countDocuments(query)
      ]);
      
      const transformedTemplates = templates.map(transformDocument);
      
      const response = createPaginatedResponse(
        { templates: transformedTemplates },
        Number(page),
        Number(limit),
        total
      );
      
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Templates retrieval error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve templates'
        }
      });
    }
  }
);

/**
 * GET /api/v1/templates/:id
 * Get a specific template by ID
 */
router.get('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const template = await TemplateModel.findById(objectId).lean();
      
      if (!template || template.is_deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Template not found'
          }
        });
      }
      
      const transformedTemplate = transformDocument(template);
      
      const response = createSuccessResponse(transformedTemplate);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Template retrieval error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve template'
        }
      });
    }
  }
);

/**
 * POST /api/v1/templates
 * Create a new template
 */
router.post('/',
  validateBody(templateSchemas.create),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const templateData = {
        ...req.body,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const template = new TemplateModel(templateData);
      await template.save();
      
      const transformedTemplate = transformDocument(template.toObject());
      
      const response = createSuccessResponse(transformedTemplate);
      res.status(201).json(response);
      
    } catch (error) {
      console.error('Template creation error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_DOCUMENT_KEY',
            message: 'A template with this document key already exists'
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create template'
        }
      });
    }
  }
);

/**
 * PUT /api/v1/templates/:id
 * Update an existing template
 */
router.put('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(templateSchemas.update),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const updateData = {
        ...req.body,
        updated_at: new Date()
      };
      
      // TEMPLATE PRESERVATION: Check if data has actually changed
      const existingTemplate = await TemplateModel.findById(objectId).lean();
      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Template not found'
          }
        });
      }
      
      const hasDataChanged = hasTemplateDataChanged(existingTemplate, updateData);
      
      if (!hasDataChanged) {
        console.log(`🛡️ TEMPLATE PRESERVATION: No changes detected for template ${id}, skipping update`);
        return res.status(200).json({
          success: true,
          data: {
            ...existingTemplate,
            message: 'No changes detected, template preserved'
          }
        });
      }
      
      console.log(`🔄 TEMPLATE UPDATE: Changes detected for template ${id}, proceeding with update`);
      
      const template = await TemplateModel.findByIdAndUpdate(
        objectId,
        updateData,
        { new: true, runValidators: true }
      ).lean();
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Template not found'
          }
        });
      }
      
      const transformedTemplate = transformDocument(template);
      
      const response = createSuccessResponse(transformedTemplate);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Template update error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_DOCUMENT_KEY',
            message: 'A template with this document key already exists'
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update template'
        }
      });
    }
  }
);

/**
 * DELETE /api/v1/templates/:id
 * Soft delete a template
 */
router.delete('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const template = await TemplateModel.findByIdAndUpdate(
        objectId,
        { 
          is_deleted: true, 
          deleted_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      ).lean();
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Template not found'
          }
        });
      }
      
      const response = createSuccessResponse(
        { message: 'Template deleted successfully' }
      );
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Template deletion error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete template'
        }
      });
    }
  }
);

/**
 * POST /api/v1/templates/:id/restore
 * Restore a soft-deleted template
 */
router.post('/:id/restore',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const template = await TemplateModel.findByIdAndUpdate(
        objectId,
        { 
          is_deleted: false, 
          deleted_at: null,
          updated_at: new Date()
        },
        { new: true }
      ).lean();
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Template not found'
          }
        });
      }
      
      const transformedTemplate = transformDocument(template);
      
      const response = createSuccessResponse(transformedTemplate);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Template restore error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to restore template'
        }
      });
    }
  }
);

/**
 * GET /api/v1/templates/stats/overview
 * Get template statistics
 */
router.get('/stats/overview',
  async (req: Request, res: Response) => {
    try {
      const [totalTemplates, activeTemplates, deletedTemplates, categoryStats] = await Promise.all([
        TemplateModel.countDocuments({}),
        TemplateModel.countDocuments({ is_active: true, is_deleted: false }),
        TemplateModel.countDocuments({ is_deleted: true }),
        TemplateModel.aggregate([
          { $match: { is_deleted: false } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);
      
      const stats = {
        total: totalTemplates,
        active: activeTemplates,
        deleted: deletedTemplates,
        categories: categoryStats
      };
      
      const response = createSuccessResponse(stats);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Template stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve template statistics'
        }
      });
    }
  }
);

export default router;