import { Request, Response, NextFunction } from 'express';
import { ICategory } from '../../models/Category.model.js';
import { logger } from '../../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class CategoryController {
  /**
   * Get all categories with pagination and filtering
   */
  static async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = uuidv4();
      const { page = 1, limit = 20, search, isActive, sort = 'name', order = 'asc' } = req.query;

      logger.info(`ICategory list requested: ${JSON.stringify({
        requestId,
        filters: { search, isActive },
        pagination: { page, limit, sort, order },
        timestamp: new Date().toISOString()
      })}`);

      // Build filter object
      const filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      // Build sort object
      const sortObj: any = {};
      sortObj[sort as string] = order === 'desc' ? -1 : 1;

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);

      // Execute query
      const [categories, totalCount] = await Promise.all([
        ICategory.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        ICategory.countDocuments(filter)
      ]);

      const resultCount = categories.length;

      logger.info(`ICategory list retrieved: ${JSON.stringify({
        requestId,
        resultCount,
        totalCount,
        timestamp: new Date().toISOString()
      })}`);

      res.json({
        success: true,
        data: categories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        },
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching categories:', error);
      next(error);
    }
  }

  /**
   * Get only active categories (for dropdowns)
   */
  static async getActiveCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = uuidv4();

      logger.info(`Active categories requested: ${JSON.stringify({
        requestId,
        timestamp: new Date().toISOString()
      })}`);

      const categories = await ICategory.find({ isActive: true })
        .select('name description color icon')
        .sort({ name: 1 })
        .lean();

      logger.info(`Active categories retrieved: ${JSON.stringify({
        requestId,
        count: categories.length,
        timestamp: new Date().toISOString()
      })}`);

      res.json({
        success: true,
        data: categories,
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching active categories:', error);
      next(error);
    }
  }

  /**
   * Get category by ID
   */
  static async getICategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = uuidv4();
      const { id } = req.params;

      logger.info(`ICategory requested by ID: ${JSON.stringify({
        requestId,
        categoryId: id,
        timestamp: new Date().toISOString()
      })}`);

      const category = await ICategory.findById(id).lean();

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'ICategory not found'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`ICategory retrieved: ${JSON.stringify({
        requestId,
        categoryId: id,
        categoryName: category.name,
        timestamp: new Date().toISOString()
      })}`);

      res.json({
        success: true,
        data: category,
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching category by ID:', error);
      next(error);
    }
  }

  /**
   * Create new category
   */
  static async createICategory(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = uuidv4();
      const { name, description, color, icon, isActive = true } = req.body;

      logger.info(`ICategory creation requested: ${JSON.stringify({
        requestId,
        name,
        description,
        color,
        icon,
        isActive,
        timestamp: new Date().toISOString()
      })}`);

      // Check if category already exists
      const existingICategory = await ICategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existingICategory) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_EXISTS',
            message: 'ICategory with this name already exists'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Create new category
      const category = new ICategory({
        name: name.trim(),
        description: description.trim(),
        color: color || '#3B82F6',
        icon: icon || '📁',
        isActive,
        createdBy: 'api-user' // TODO: Get from auth context
      });

      await category.save();

      logger.info(`ICategory created successfully: ${JSON.stringify({
        requestId,
        categoryId: category._id,
        name: category.name,
        timestamp: new Date().toISOString()
      })}`);

      res.status(201).json({
        success: true,
        data: category,
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error creating category:', error);
      next(error);
    }
  }

  /**
   * Update category
   */
  static async updateICategory(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = uuidv4();
      const { id } = req.params;
      const { name, description, color, icon, isActive } = req.body;

      logger.info(`ICategory update requested: ${JSON.stringify({
        requestId,
        categoryId: id,
        updates: { name, description, color, icon, isActive },
        timestamp: new Date().toISOString()
      })}`);

      const category = await ICategory.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'ICategory not found'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Check if name change conflicts with existing category
      if (name && name !== category.name) {
        const existingICategory = await ICategory.findOne({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          _id: { $ne: id }
        });
        if (existingICategory) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'CATEGORY_EXISTS',
              message: 'ICategory with this name already exists'
            },
            requestId,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Update category
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (color !== undefined) updateData.color = color;
      if (icon !== undefined) updateData.icon = icon;
      if (isActive !== undefined) updateData.isActive = isActive;

      Object.assign(category, updateData);
      await category.save();

      logger.info(`ICategory updated successfully: ${JSON.stringify({
        requestId,
        categoryId: id,
        name: category.name,
        version: category.version,
        timestamp: new Date().toISOString()
      })}`);

      res.json({
        success: true,
        data: category,
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error updating category:', error);
      next(error);
    }
  }

  /**
   * Delete category
   */
  static async deleteICategory(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = uuidv4();
      const { id } = req.params;

      logger.info(`ICategory deletion requested: ${JSON.stringify({
        requestId,
        categoryId: id,
        timestamp: new Date().toISOString()
      })}`);

      const category = await ICategory.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'ICategory not found'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Check if category is system category
      if (category.isSystem) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SYSTEM_CATEGORY',
            message: 'Cannot delete system categories'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // TODO: Check if category is in use by templates
      // const templatesUsingICategory = await Template.countDocuments({ category: category.name });
      // if (templatesUsingICategory > 0) {
      //   return res.status(400).json({
      //     success: false,
      //     error: {
      //       code: 'CATEGORY_IN_USE',
      //       message: `Cannot delete category. ${templatesUsingICategory} templates are using this category.`
      //     },
      //     requestId,
      //     timestamp: new Date().toISOString()
      //   });
      // }

      await ICategory.findByIdAndDelete(id);

      logger.info(`ICategory deleted successfully: ${JSON.stringify({
        requestId,
        categoryId: id,
        categoryName: category.name,
        timestamp: new Date().toISOString()
      })}`);

      res.json({
        success: true,
        message: 'ICategory deleted successfully',
        requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error deleting category:', error);
      next(error);
    }
  }
}
