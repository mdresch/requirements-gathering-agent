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
   * Get feedback summary statistics
   */
  public static async getFeedbackSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get timeframe filter from query parameters
      const { timeframe } = req.query;
      let dateFilter = {};
      
      if (timeframe) {
        const now = new Date();
        let timeframeDays = 30; // default to 30 days
        
        if (timeframe === '7d') timeframeDays = 7;
        else if (timeframe === '30d') timeframeDays = 30;
        else if (timeframe === '90d') timeframeDays = 90;
        
        const timeframeDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
        dateFilter = { submittedAt: { $gte: timeframeDate } };
      }
      
      // Get overall feedback statistics
      const totalFeedback = await DocumentFeedback.countDocuments(dateFilter);
      
      // Get average rating
      const avgRatingResult = await DocumentFeedback.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalCount: { $sum: 1 }
          }
        }
      ]);
      
      const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].averageRating : 0;
      
      // Get rating distribution
      const ratingDistribution = await DocumentFeedback.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      // Get recent feedback (last 10)
      const recentFeedback = await DocumentFeedback.find(dateFilter)
        .sort({ submittedAt: -1 })
        .limit(10)
        .select('title rating feedbackType status submittedAt projectId documentId')
        .lean();
      
      // Get feedback by type
      const feedbackByType = await DocumentFeedback.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: '$feedbackType',
            count: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // Get feedback by status
      const feedbackByStatus = await DocumentFeedback.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          totalFeedback,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution: ratingDistribution.reduce((acc, item) => {
            acc[`rating_${item._id}`] = item.count;
            return acc;
          }, {}),
          recentFeedback,
          feedbackByType,
          feedbackByStatus,
          summary: {
            totalFeedback,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
            recentCount: recentFeedback.length
          }
        }
      });
    } catch (error) {
      console.error('Error getting feedback summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get feedback summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get feedback trends with timeframe filtering
   */
  public static async getFeedbackTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { timeframe } = req.query;
      let dateFilter = {};
      let groupByField: any = '';
      let periodFormat = '';
      
      if (timeframe) {
        const now = new Date();
        let timeframeDays = 30; // default to 30 days
        
        if (timeframe === '7d') {
          timeframeDays = 7;
          groupByField = { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } };
          periodFormat = 'day';
        } else if (timeframe === '30d') {
          timeframeDays = 30;
          groupByField = { $dateToString: { format: "%Y-W%U", date: "$submittedAt" } };
          periodFormat = 'week';
        } else if (timeframe === '90d') {
          timeframeDays = 90;
          groupByField = { $dateToString: { format: "%Y-%m", date: "$submittedAt" } };
          periodFormat = 'month';
        }
        
        const timeframeDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
        dateFilter = { submittedAt: { $gte: timeframeDate } };
      }

      // Get trends data grouped by timeframe
      const trendsData = await DocumentFeedback.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: groupByField,
            rating: { $avg: '$rating' },
            volume: { $sum: 1 },
            date: { $first: '$submittedAt' }
          }
        },
        { $sort: { date: 1 } }
      ]);

      // Format the trends data
      const trends = trendsData.map((item, index) => {
        let period = '';
        if (periodFormat === 'day') {
          period = `Day ${index + 1}`;
        } else if (periodFormat === 'week') {
          period = `Week ${index + 1}`;
        } else if (periodFormat === 'month') {
          period = `Month ${index + 1}`;
        }

        return {
          period,
          rating: Math.round(item.rating * 10) / 10,
          volume: item.volume
        };
      });

      res.json({
        success: true,
        data: {
          trends,
          timeframe: timeframe || '30d',
          totalRecords: trendsData.length
        }
      });

    } catch (error) {
      console.error('Error getting feedback trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get feedback trends',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get feedback document performance data
   */
  public static async getDocumentPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { timeframe } = req.query;
      let dateFilter = {};
      
      if (timeframe) {
        const now = new Date();
        let timeframeDays = 30; // default to 30 days
        
        if (timeframe === '7d') timeframeDays = 7;
        else if (timeframe === '30d') timeframeDays = 30;
        else if (timeframe === '90d') timeframeDays = 90;
        
        const timeframeDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
        dateFilter = { submittedAt: { $gte: timeframeDate } };
      }

      // Get document performance data
      const documentPerformance = await DocumentFeedback.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$documentType',
            averageRating: { $avg: '$rating' },
            feedbackCount: { $sum: 1 },
            qualityScore: { $avg: '$rating' }
          }
        },
        {
          $addFields: {
            qualityScore: { $multiply: [{ $divide: ['$averageRating', 5] }, 100] },
            trend: { $cond: [{ $gte: ['$averageRating', 4] }, 'up', { $cond: [{ $lte: ['$averageRating', 2] }, 'down', 'stable'] }] }
          }
        },
        { $sort: { feedbackCount: -1 } }
      ]);

      // Format the data
      const performanceData = documentPerformance.map(doc => ({
        documentType: doc._id || 'unknown',
        averageRating: Math.round(doc.averageRating * 10) / 10,
        feedbackCount: doc.feedbackCount,
        qualityScore: Math.round(doc.qualityScore),
        trend: doc.trend
      }));

      res.json({
        success: true,
        data: {
          documentPerformance: performanceData,
          timeframe: timeframe || '30d'
        }
      });

    } catch (error) {
      console.error('Error getting document performance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get document performance',
        message: error instanceof Error ? error.message : 'Unknown error'
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