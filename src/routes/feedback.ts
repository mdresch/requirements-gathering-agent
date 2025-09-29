import { Router, Request, Response } from 'express';
import { FeedbackModel } from '../models/Feedback.model.js';
import { sanitizeInput } from '../middleware/sanitization.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import { feedbackSchemas, commonSchemas } from '../validation/schemas.js';
import Joi from 'joi';
import { toObjectId, transformDocument, createSuccessResponse, createPaginatedResponse } from '../utils/idUtils.js';

const router = Router();

/**
 * GET /api/v1/feedback
 * Get all feedback with pagination and filtering
 */
router.get('/', 
  validateQuery(commonSchemas.pagination.keys({
    search: Joi.string().trim().max(100).optional(),
    projectId: commonSchemas.objectId.optional(),
    documentId: commonSchemas.objectId.optional(),
    feedbackType: Joi.string().valid('general', 'technical', 'content', 'structure', 'compliance', 'quality').optional(),
    category: Joi.string().valid('positive', 'negative', 'suggestion', 'question', 'issue').optional(),
    status: Joi.string().valid('open', 'in_review', 'addressed', 'resolved', 'rejected', 'closed').optional(),
    priority: commonSchemas.priority,
    severity: Joi.string().valid('minor', 'moderate', 'major', 'critical').optional(),
    assignedTo: Joi.string().trim().max(100).optional()
  })),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        projectId, 
        documentId, 
        feedbackType, 
        category, 
        status, 
        priority, 
        severity, 
        assignedTo 
      } = req.query;
      
      // Build query
      const query: any = { is_deleted: false };
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (projectId) query.projectId = toObjectId(projectId);
      if (documentId) query.documentId = toObjectId(documentId);
      if (feedbackType) query.feedbackType = feedbackType;
      if (category) query.category = category;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (severity) query.severity = severity;
      if (assignedTo) query.assignedTo = { $regex: assignedTo, $options: 'i' };
      
      // Execute query with pagination
      const skip = (Number(page) - 1) * Number(limit);
      const [feedback, total] = await Promise.all([
        FeedbackModel.find(query)
          .skip(skip)
          .limit(Number(limit))
          .sort({ created_at: -1 })
          .lean(),
        FeedbackModel.countDocuments(query)
      ]);
      
      const transformedFeedback = feedback.map(transformDocument);
      
      const response = createPaginatedResponse(
        { feedback: transformedFeedback },
        Number(page),
        Number(limit),
        total
      );
      
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Feedback retrieval error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve feedback'
        }
      });
    }
  }
);

/**
 * GET /api/v1/feedback/:id
 * Get a specific feedback by ID
 */
router.get('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const feedback = await FeedbackModel.findById(objectId).lean();
      
      if (!feedback || feedback.is_deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FEEDBACK_NOT_FOUND',
            message: 'Feedback not found'
          }
        });
      }
      
      const transformedFeedback = transformDocument(feedback);
      
      const response = createSuccessResponse(transformedFeedback);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Feedback retrieval error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve feedback'
        }
      });
    }
  }
);

/**
 * POST /api/v1/feedback
 * Create new feedback
 */
router.post('/',
  validateBody(feedbackSchemas.create),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const feedbackData = {
        ...req.body,
        documentId: toObjectId(req.body.documentId),
        projectId: toObjectId(req.body.projectId),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const feedback = new FeedbackModel(feedbackData);
      await feedback.save();
      
      const transformedFeedback = transformDocument(feedback.toObject());
      
      const response = createSuccessResponse(transformedFeedback);
      res.status(201).json(response);
      
    } catch (error) {
      console.error('Feedback creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create feedback'
        }
      });
    }
  }
);

/**
 * PUT /api/v1/feedback/:id
 * Update existing feedback
 */
router.put('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(feedbackSchemas.update),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const updateData = {
        ...req.body,
        updated_at: new Date()
      };
      
      const feedback = await FeedbackModel.findByIdAndUpdate(
        objectId,
        updateData,
        { new: true, runValidators: true }
      ).lean();
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FEEDBACK_NOT_FOUND',
            message: 'Feedback not found'
          }
        });
      }
      
      const transformedFeedback = transformDocument(feedback);
      
      const response = createSuccessResponse(transformedFeedback);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Feedback update error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update feedback'
        }
      });
    }
  }
);

/**
 * DELETE /api/v1/feedback/:id
 * Soft delete feedback
 */
router.delete('/:id',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      
      const feedback = await FeedbackModel.findByIdAndUpdate(
        objectId,
        { 
          is_deleted: true, 
          deleted_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      ).lean();
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FEEDBACK_NOT_FOUND',
            message: 'Feedback not found'
          }
        });
      }
      
      const response = createSuccessResponse(
        { message: 'Feedback deleted successfully' }
      );
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Feedback deletion error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete feedback'
        }
      });
    }
  }
);

/**
 * POST /api/v1/feedback/:id/resolve
 * Resolve feedback
 */
router.post('/:id/resolve',
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(Joi.object({
    resolution: Joi.string().trim().min(1).max(1000).required(),
    resolvedBy: Joi.string().trim().max(100).optional()
  })),
  sanitizeInput,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const objectId = toObjectId(id);
      const { resolution, resolvedBy } = req.body;
      
      const feedback = await FeedbackModel.findByIdAndUpdate(
        objectId,
        { 
          status: 'resolved',
          resolution,
          resolvedBy: resolvedBy || 'system',
          resolvedAt: new Date(),
          updated_at: new Date()
        },
        { new: true }
      ).lean();
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FEEDBACK_NOT_FOUND',
            message: 'Feedback not found'
          }
        });
      }
      
      const transformedFeedback = transformDocument(feedback);
      
      const response = createSuccessResponse(transformedFeedback);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Feedback resolution error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to resolve feedback'
        }
      });
    }
  }
);

/**
 * GET /api/v1/feedback/stats/overview
 * Get feedback statistics
 */
router.get('/stats/overview',
  async (req: Request, res: Response) => {
    try {
      const [totalFeedback, openFeedback, resolvedFeedback, categoryStats] = await Promise.all([
        FeedbackModel.countDocuments({ is_deleted: false }),
        FeedbackModel.countDocuments({ status: 'open', is_deleted: false }),
        FeedbackModel.countDocuments({ status: 'resolved', is_deleted: false }),
        FeedbackModel.aggregate([
          { $match: { is_deleted: false } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);
      
      const stats = {
        total: totalFeedback,
        open: openFeedback,
        resolved: resolvedFeedback,
        categories: categoryStats
      };
      
      const response = createSuccessResponse(stats);
      res.status(200).json(response);
      
    } catch (error) {
      console.error('Feedback stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve feedback statistics'
        }
      });
    }
  }
);

export default router;