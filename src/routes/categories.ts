import { Router, Request, Response } from 'express';
import { CategoryModel } from '../models/Category.model.js';
import { sanitizeInput } from '../middleware/sanitization.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import { categorySchemas, commonSchemas } from '../validation/schemas.js';
import Joi from 'joi';
import { toObjectId, transformDocument, createSuccessResponse, createPaginatedResponse } from '../utils/idUtils.js';

const router = Router();

/**
 * GET /api/v1/categories
 * Get all categories with pagination and filtering
 */
router.get('/', 
  validateQuery(commonSchemas.pagination.keys({
    search: Joi.string().trim().max(100).optional(),
    isActive: Joi.boolean().optional(),
    isSystem: Joi.boolean().optional(),
    parentCategory: Joi.string().trim().max(100).optional()
  })),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, search, isActive, isSystem, parentCategory } = req.query;
      
      // Build query
      const query: any = { is_deleted: false };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (isActive !== undefined) query.isActive = isActive === 'true';
      if (isSystem !== undefined) query.isSystem = isSystem === 'true';
      if (parentCategory) query.parentCategory = parentCategory;
      
      // Execute query with pagination
      const skip = (Number(page) - 1) * Number(limit);
      const [categories, total] = await Promise.all([
        CategoryModel.find(query)
          .skip(skip)
          .limit(Number(limit))
          .sort({ sortOrder: 1, name: 1 })
          .lean(),
        CategoryModel.countDocuments(query)
      ]);
      
      const transformedCategories = categories.map(transformDocument);
      
      const response = createPaginatedResponse(
        { categories: transformedCategories },
        Number(page),
        Number(limit),
        total
      );
      
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Categories retrieval error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve categories'
        }
      });
    }
  }
);

/**
 * GET /api/v1/categories/:id
 * Get a specific category by ID
 */
router.get('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const category = await CategoryModel.findById(objectId).lean();
      
      if (!category || category.is_deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found'
          }
        });
      }
      
      const transformedCategory = transformDocument(category);
      
      const response = createSuccessResponse(transformedCategory);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Category retrieval error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve category'
        }
      });
    }
  }
);

/**
 * POST /api/v1/categories
 * Create a new category
 */
router.post('/',
  validateBody(categorySchemas.create),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const categoryData = {
        ...req.body,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const category = new CategoryModel(categoryData);
      await category.save();
      
      const transformedCategory = transformDocument(category.toObject());
      
      const response = createSuccessResponse(transformedCategory);
      res.status(201).json(response);
      
    } catch (error) {
      console.error('Category creation error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_CATEGORY',
            message: 'A category with this name already exists'
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create category'
        }
      });
    }
  }
);

/**
 * PUT /api/v1/categories/:id
 * Update an existing category
 */
router.put('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(categorySchemas.update),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const updateData = {
        ...req.body,
        updated_at: new Date()
      };
      
      const category = await CategoryModel.findByIdAndUpdate(
        objectId,
        updateData,
        { new: true, runValidators: true }
      ).lean();
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found'
          }
        });
      }
      
      const transformedCategory = transformDocument(category);
      
      const response = createSuccessResponse(transformedCategory);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Category update error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_CATEGORY',
            message: 'A category with this name already exists'
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update category'
        }
      });
    }
  }
);

/**
 * DELETE /api/v1/categories/:id
 * Soft delete a category
 */
router.delete('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      // Check if category is a system category
      const category = await CategoryModel.findById(objectId);
      if (category && category.isSystem) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'SYSTEM_CATEGORY_PROTECTED',
            message: 'System categories cannot be deleted'
          }
        });
      }
      
      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        objectId,
        { 
          is_deleted: true, 
          deleted_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      ).lean();
      
      if (!updatedCategory) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found'
          }
        });
      }
      
      const response = createSuccessResponse(
        { message: 'Category deleted successfully' }
      );
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Category deletion error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete category'
        }
      });
    }
  }
);

/**
 * POST /api/v1/categories/:id/restore
 * Restore a soft-deleted category
 */
router.post('/:id/restore',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const category = await CategoryModel.findByIdAndUpdate(
        objectId,
        { 
          is_deleted: false, 
          deleted_at: null,
          updated_at: new Date()
        },
        { new: true }
      ).lean();
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found'
          }
        });
      }
      
      const transformedCategory = transformDocument(category);
      
      const response = createSuccessResponse(transformedCategory);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Category restore error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to restore category'
        }
      });
    }
  }
);

/**
 * GET /api/v1/categories/hierarchy
 * Get category hierarchy
 */
router.get('/hierarchy',
  async (req: Request, res: Response) => {
    try {
      const categories = await CategoryModel.find({ 
        is_deleted: false, 
        isActive: true 
      })
        .sort({ sortOrder: 1, name: 1 })
        .lean();
      
      // Build hierarchy
      const hierarchy = categories.reduce((acc, category) => {
        const transformedCategory = transformDocument(category);
        
        if (category.parentCategory) {
          const parent = acc.find(cat => cat.name === category.parentCategory);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(transformedCategory);
          }
        } else {
          acc.push(transformedCategory);
        }
        
        return acc;
      }, [] as any[]);
      
      const response = createSuccessResponse({ hierarchy });
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Category hierarchy error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve category hierarchy'
        }
      });
    }
  }
);

/**
 * GET /api/v1/categories/stats/overview
 * Get category statistics
 */
router.get('/stats/overview',
  async (req: Request, res: Response) => {
    try {
      const [totalCategories, activeCategories, systemCategories, usageStats] = await Promise.all([
        CategoryModel.countDocuments({ is_deleted: false }),
        CategoryModel.countDocuments({ isActive: true, is_deleted: false }),
        CategoryModel.countDocuments({ isSystem: true, is_deleted: false }),
        CategoryModel.aggregate([
          { $match: { is_deleted: false } },
          { $group: { _id: null, totalUsage: { $sum: '$usageCount' }, avgUsage: { $avg: '$usageCount' } } }
        ])
      ]);
      
      const stats = {
        total: totalCategories,
        active: activeCategories,
        system: systemCategories,
        usage: usageStats[0] || { totalUsage: 0, avgUsage: 0 }
      };
      
      const response = createSuccessResponse(stats);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Category stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve category statistics'
        }
      });
    }
  }
);

export default router;