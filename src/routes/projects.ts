import { Router, Request, Response } from 'express';
import { ProjectModel } from '../models/Project.model.js';
import { sanitizeInput } from '../middleware/sanitization.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import { projectSchemas, commonSchemas } from '../validation/schemas.js';
import Joi from 'joi';
import { toObjectId, transformDocument, createSuccessResponse, createPaginatedResponse } from '../utils/idUtils.js';

const router = Router();

/**
 * GET /api/v1/projects
 * Get all projects with pagination and filtering
 */
router.get('/', 
  validateQuery(commonSchemas.pagination.keys({
    search: Joi.string().trim().max(100).optional(),
    status: Joi.string().valid('draft', 'active', 'review', 'completed', 'archived').optional(),
    framework: Joi.string().valid('babok', 'pmbok', 'dmbok', 'multi').optional(),
    owner: Joi.string().trim().max(100).optional(),
    startDateFrom: commonSchemas.date.optional(),
    startDateTo: commonSchemas.date.optional()
  })),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, search, status, framework, owner, startDateFrom, startDateTo } = req.query;
      
      // Build query
      const query: any = { isDeleted: false };
      
      if (search) {
        const searchStr = String(search);
        query.$or = [
          { name: { $regex: searchStr, $options: 'i' } },
          { description: { $regex: searchStr, $options: 'i' } },
          { tags: { $in: [new RegExp(searchStr, 'i')] } }
        ];
      }
      
      if (status) query.status = status;
      if (framework) query.framework = framework;
      if (owner) query.owner = { $regex: owner as string, $options: 'i' };
      
      if (startDateFrom || startDateTo) {
        query.startDate = {};
        if (startDateFrom) query.startDate.$gte = new Date(startDateFrom as string);
        if (startDateTo) query.startDate.$lte = new Date(startDateTo as string);
      }
      
      // Execute query with pagination
      const skip = (Number(page) - 1) * Number(limit);
      const [projects, total] = await Promise.all([
        ProjectModel.find(query)
          .skip(skip)
          .limit(Number(limit))
          .sort({ created_at: -1 })
          .lean(),
        ProjectModel.countDocuments(query)
      ]);
      
      const transformedProjects = projects.map(transformDocument);
      
      const response = createPaginatedResponse(
        transformedProjects,
        {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      );
      
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Projects retrieval error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve projects'
        }
      });
    }
  }
);

/**
 * GET /api/v1/projects/:id
 * Get a specific project by ID
 */
router.get('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const project = await ProjectModel.findById(objectId).lean();
      
      if (!project || project.isDeleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found'
          }
        });
      }
      
      const transformedProject = transformDocument(project);
      
      const response = createSuccessResponse(transformedProject);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Project retrieval error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve project'
        }
      });
    }
  }
);

/**
 * POST /api/v1/projects
 * Create a new project
 */
router.post('/',
  validateBody(projectSchemas.create),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const projectData = {
        ...req.body,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const project = new ProjectModel(projectData);
      await project.save();
      
      const transformedProject = transformDocument(project.toObject());
      
      const response = createSuccessResponse(transformedProject);
      res.status(201).json(response);
      
    } catch (error) {
      console.error('Project creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create project'
        }
      });
    }
  }
);

/**
 * PUT /api/v1/projects/:id
 * Update an existing project
 */
router.put('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(projectSchemas.update),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const updateData = {
        ...req.body,
        updated_at: new Date()
      };
      
      const project = await ProjectModel.findByIdAndUpdate(
        objectId,
        updateData,
        { new: true, runValidators: true }
      ).lean();
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found'
          }
        });
      }
      
      const transformedProject = transformDocument(project);
      
      const response = createSuccessResponse(transformedProject);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Project update error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update project'
        }
      });
    }
  }
);

/**
 * DELETE /api/v1/projects/:id
 * Soft delete a project
 */
router.delete('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const project = await ProjectModel.findByIdAndUpdate(
        objectId,
        { 
          isDeleted: true, 
          deletedAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      ).lean();
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found'
          }
        });
      }
      
      const response = createSuccessResponse(
        { message: 'Project deleted successfully' }
      );
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Project deletion error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete project'
        }
      });
    }
  }
);

/**
 * POST /api/v1/projects/:id/restore
 * Restore a soft-deleted project
 */
router.post('/:id/restore',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const project = await ProjectModel.findByIdAndUpdate(
        objectId,
        { 
          isDeleted: false, 
          deletedAt: null,
          updatedAt: new Date()
        },
        { new: true }
      ).lean();
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found'
          }
        });
      }
      
      const transformedProject = transformDocument(project);
      
      const response = createSuccessResponse(transformedProject);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Project restore error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to restore project'
        }
      });
    }
  }
);

/**
 * GET /api/v1/projects/stats/overview
 * Get project statistics
 */
router.get('/stats/overview',
  async (req: Request, res: Response) => {
    try {
      const [totalProjects, activeProjects, completedProjects, frameworkStats] = await Promise.all([
        ProjectModel.countDocuments({}),
        ProjectModel.countDocuments({ status: 'active', isDeleted: false }),
        ProjectModel.countDocuments({ status: 'completed', isDeleted: false }),
        ProjectModel.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: '$framework', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);
      
      const stats = {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        frameworks: frameworkStats
      };
      
      const response = createSuccessResponse(stats);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Project stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve project statistics'
        }
      });
    }
  }
);

export default router;