// Feedback Controller
// filepath: src/api/controllers/FeedbackController.ts

import { Request, Response, NextFunction } from 'express';
import { DocumentFeedback, IDocumentFeedback } from '../../models/DocumentFeedback.js';
import { Project } from '../../models/Project.js';

export class FeedbackController {
  
  /**
   * Submit new feedback for a document
   */
  public static async submitFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        projectId,
        documentType,
        documentPath,
        feedbackType,
        rating,
        title,
        description,
        suggestedImprovement,
        priority,
        tags,
        category,
        submittedBy,
        submittedByName
      } = req.body;

      // Validate project exists
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found'
        });
        return;
      }

      // Create feedback
      const feedback = new DocumentFeedback({
        projectId,
        documentType,
        documentPath,
        feedbackType,
        rating,
        title,
        description,
        suggestedImprovement,
        priority: priority || 'medium',
        tags: tags || [],
        category,
        submittedBy,
        submittedByName,
        status: 'open'
      });

      await feedback.save();

      res.status(201).json({
        success: true,
        data: feedback,
        message: 'Feedback submitted successfully'
      });

    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback',
        details: error.message
      });
    }
  }

  /**
   * Get feedback for a specific project
   */
  public static async getProjectFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.params;
      const { 
        status, 
        feedbackType, 
        priority, 
        page = 1, 
        limit = 20,
        sortBy = 'submittedAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter
      const filter: any = { projectId };
      if (status) filter.status = status;
      if (feedbackType) filter.feedbackType = feedbackType;
      if (priority) filter.priority = priority;

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (Number(page) - 1) * Number(limit);
      const [feedback, total] = await Promise.all([
        DocumentFeedback.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        DocumentFeedback.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          feedback,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error: any) {
      console.error('Error getting project feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve feedback',
        details: error.message
      });
    }
  }

  /**
   * Get feedback for a specific document
   */
  public static async getDocumentFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId, documentType } = req.params;

      const feedback = await DocumentFeedback.find({
        projectId,
        documentType
      }).sort({ submittedAt: -1 });

      // Calculate summary statistics
      const stats = {
        total: feedback.length,
        averageRating: feedback.length > 0 
          ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
          : 0,
        byStatus: feedback.reduce((acc: any, f) => {
          acc[f.status] = (acc[f.status] || 0) + 1;
          return acc;
        }, {}),
        byType: feedback.reduce((acc: any, f) => {
          acc[f.feedbackType] = (acc[f.feedbackType] || 0) + 1;
          return acc;
        }, {}),
        byPriority: feedback.reduce((acc: any, f) => {
          acc[f.priority] = (acc[f.priority] || 0) + 1;
          return acc;
        }, {})
      };

      res.json({
        success: true,
        data: {
          feedback,
          stats
        }
      });

    } catch (error: any) {
      console.error('Error getting document feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve document feedback',
        details: error.message
      });
    }
  }

  /**
   * Update feedback status
   */
  public static async updateFeedbackStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { feedbackId } = req.params;
      const { status, reviewedBy, notes } = req.body;

      const feedback = await DocumentFeedback.findById(feedbackId);
      if (!feedback) {
        res.status(404).json({
          success: false,
          error: 'Feedback not found'
        });
        return;
      }

      feedback.status = status;
      if (reviewedBy) {
        feedback.reviewedBy = reviewedBy;
      }

      await feedback.save();

      res.json({
        success: true,
        data: feedback,
        message: 'Feedback status updated successfully'
      });

    } catch (error: any) {
      console.error('Error updating feedback status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update feedback status',
        details: error.message
      });
    }
  }

  /**
   * Get feedback analytics for a project
   */
  public static async getFeedbackAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.params;
      const { days = 30 } = req.query;

      // Get project feedback stats
      const projectStats = await (DocumentFeedback as any).getProjectFeedbackStats(projectId);
      
      // Get feedback trends
      const trends = await (DocumentFeedback as any).getFeedbackTrends(Number(days));

      // Get top issues by document type
      const topIssues = await DocumentFeedback.aggregate([
        { $match: { projectId, rating: { $lte: 2 } } },
        {
          $group: {
            _id: '$documentType',
            count: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            issues: { $push: { title: '$title', rating: '$rating' } }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Get improvement suggestions
      const suggestions = await DocumentFeedback.find({
        projectId,
        suggestedImprovement: { $exists: true, $ne: '' },
        status: { $in: ['open', 'in-review'] }
      })
      .select('documentType title suggestedImprovement priority rating')
      .sort({ priority: 1, rating: 1 })
      .limit(20);

      // Calculate quality improvement metrics
      const qualityMetrics = await DocumentFeedback.aggregate([
        { 
          $match: { 
            projectId,
            'qualityMetrics.improvementMeasured': true 
          } 
        },
        {
          $group: {
            _id: null,
            totalImproved: { $sum: 1 },
            averageImprovement: {
              $avg: {
                $subtract: ['$qualityMetrics.afterScore', '$qualityMetrics.beforeScore']
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          projectStats: projectStats[0] || {},
          trends,
          topIssues,
          suggestions,
          qualityMetrics: qualityMetrics[0] || { totalImproved: 0, averageImprovement: 0 }
        }
      });

    } catch (error: any) {
      console.error('Error getting feedback analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve feedback analytics',
        details: error.message
      });
    }
  }

  /**
   * Get feedback summary for dashboard
   */
  public static async getFeedbackSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query;

      // Get overall feedback stats
      const overallStats = await DocumentFeedback.aggregate([
        {
          $group: {
            _id: null,
            totalFeedback: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            openFeedback: {
              $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
            },
            criticalFeedback: {
              $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get recent feedback
      const recentFeedback = await DocumentFeedback.find()
        .sort({ submittedAt: -1 })
        .limit(10)
        .select('title documentType rating status submittedAt submittedByName');

      // Get user's feedback if userId provided
      let userFeedback = null;
      if (userId) {
        userFeedback = await DocumentFeedback.find({ submittedBy: userId })
          .sort({ submittedAt: -1 })
          .limit(5)
          .select('title documentType rating status submittedAt');
      }

      res.json({
        success: true,
        data: {
          overallStats: overallStats[0] || {
            totalFeedback: 0,
            averageRating: 0,
            openFeedback: 0,
            criticalFeedback: 0
          },
          recentFeedback,
          userFeedback
        }
      });

    } catch (error: any) {
      console.error('Error getting feedback summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve feedback summary',
        details: error.message
      });
    }
  }

  /**
   * Search feedback across projects
   */
  public static async searchFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        query, 
        projectId, 
        documentType, 
        feedbackType, 
        status,
        priority,
        page = 1, 
        limit = 20 
      } = req.query;

      // Build search filter
      const filter: any = {};
      
      if (projectId) filter.projectId = projectId;
      if (documentType) filter.documentType = documentType;
      if (feedbackType) filter.feedbackType = feedbackType;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      // Add text search if query provided
      if (query) {
        filter.$text = { $search: query as string };
      }

      // Execute search with pagination
      const skip = (Number(page) - 1) * Number(limit);
      const [feedback, total] = await Promise.all([
        DocumentFeedback.find(filter)
          .sort(query ? { score: { $meta: 'textScore' } } : { submittedAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate('relatedFeedback', 'title documentType rating')
          .lean(),
        DocumentFeedback.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          feedback,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error: any) {
      console.error('Error searching feedback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search feedback',
        details: error.message
      });
    }
  }

  /**
   * Get feedback insights for AI prompt improvement
   */
  public static async getFeedbackInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentType, category } = req.query;

      // Build filter for insights
      const filter: any = {
        rating: { $lte: 3 }, // Focus on lower-rated feedback
        status: { $in: ['open', 'in-review'] }
      };

      if (documentType) filter.documentType = documentType;
      if (category) filter.category = category;

      // Get common issues and suggestions
      const insights = await DocumentFeedback.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              documentType: '$documentType',
              feedbackType: '$feedbackType'
            },
            count: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            commonIssues: { $push: '$title' },
            suggestions: { $push: '$suggestedImprovement' },
            affectedPrompts: { $push: '$aiPromptImpact.affectedPrompts' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Get prompt improvement suggestions
      const promptSuggestions = await DocumentFeedback.find({
        ...filter,
        'aiPromptImpact.suggestedPromptChanges': { $exists: true, $ne: [] }
      })
      .select('documentType aiPromptImpact.suggestedPromptChanges rating')
      .sort({ rating: 1 });

      res.json({
        success: true,
        data: {
          insights,
          promptSuggestions,
          summary: {
            totalLowRatedFeedback: insights.reduce((sum, item) => sum + item.count, 0),
            mostProblematicDocuments: insights.slice(0, 5),
            promptImprovementOpportunities: promptSuggestions.length
          }
        }
      });

    } catch (error: any) {
      console.error('Error getting feedback insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve feedback insights',
        details: error.message
      });
    }
  }
}