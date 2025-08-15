import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../../services/ReviewService.js';
import {
  CreateReviewRequest,
  AssignReviewerRequest,
  SubmitFeedbackRequest,
  UpdateReviewStatusRequest,
  ReviewSearchParams,
  ReviewResponse,
  ReviewListResponse,
  ReviewAnalyticsResponse
} from '../../types/review.js';
import { logger } from '../../utils/logger.js';

export class ReviewController {
  private static reviewService = new ReviewService();

  /**
   * Create a new document review
   */
  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const request: CreateReviewRequest = req.body;
      
      // Validate required fields
      if (!request.documentId || !request.documentName || !request.documentType || !request.projectId) {
        return res.status(400).json({
          error: 'Missing required fields: documentId, documentName, documentType, projectId'
        });
      }
      
      const review = await ReviewController.reviewService.createReview(request);
      
      const response: ReviewResponse = {
        review,
        permissions: {
          canEdit: true, // Would be determined by user permissions
          canAssign: true,
          canApprove: true,
          canReject: true,
          canEscalate: true,
          canViewFeedback: true,
          canAddFeedback: true
        }
      };
      
      logger.info(`Review created: ${review.id}`);
      res.status(201).json(response);
      
    } catch (error) {
      logger.error('Error creating review:', error);
      next(error);
    }
  }
  
  /**
   * Get a review by ID
   */
  static async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      
      if (!reviewId) {
        return res.status(400).json({ error: 'Review ID is required' });
      }
      
      const review = await ReviewController.reviewService.getReview(reviewId);
      
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      
      const response: ReviewResponse = {
        review,
        permissions: {
          canEdit: true, // Would be determined by user permissions
          canAssign: true,
          canApprove: true,
          canReject: true,
          canEscalate: true,
          canViewFeedback: true,
          canAddFeedback: true
        }
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting review:', error);
      next(error);
    }
  }
  
  /**
   * Search reviews with filters
   */
  static async searchReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReviewSearchParams = {
        status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status as any[] : [req.query.status as any]) : undefined,
        priority: req.query.priority ? (Array.isArray(req.query.priority) ? req.query.priority as any[] : [req.query.priority as any]) : undefined,
        documentType: req.query.documentType ? (Array.isArray(req.query.documentType) ? req.query.documentType as string[] : [req.query.documentType as string]) : undefined,
        projectId: req.query.projectId as string,
        reviewerId: req.query.reviewerId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      const { reviews, total } = await ReviewController.reviewService.searchReviews(params);
      
      const response: ReviewListResponse = {
        reviews,
        total,
        page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
        limit: params.limit || 20,
        hasMore: (params.offset || 0) + reviews.length < total
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error searching reviews:', error);
      next(error);
    }
  }
  
  /**
   * Assign a reviewer to a review
   */
  static async assignReviewer(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const request: AssignReviewerRequest = {
        reviewId,
        ...req.body
      };
      
      // Validate required fields
      if (!request.reviewerId || !request.role) {
        return res.status(400).json({
          error: 'Missing required fields: reviewerId, role'
        });
      }
      
      const review = await ReviewController.reviewService.assignReviewer(request);
      
      const response: ReviewResponse = {
        review,
        permissions: {
          canEdit: true,
          canAssign: true,
          canApprove: true,
          canReject: true,
          canEscalate: true,
          canViewFeedback: true,
          canAddFeedback: true
        }
      };
      
      logger.info(`Reviewer assigned: ${request.reviewerId} to review ${reviewId}`);
      res.json(response);
      
    } catch (error) {
      logger.error('Error assigning reviewer:', error);
      next(error);
    }
  }
  
  /**
   * Submit feedback for a review
   */
  static async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const request: SubmitFeedbackRequest = {
        reviewId,
        ...req.body
      };
      
      // Validate required fields
      if (!request.roundNumber || !request.feedback || !request.decision) {
        return res.status(400).json({
          error: 'Missing required fields: roundNumber, feedback, decision'
        });
      }
      
      const review = await ReviewController.reviewService.submitFeedback(request);
      
      const response: ReviewResponse = {
        review,
        permissions: {
          canEdit: true,
          canAssign: true,
          canApprove: true,
          canReject: true,
          canEscalate: true,
          canViewFeedback: true,
          canAddFeedback: true
        }
      };
      
      logger.info(`Feedback submitted for review ${reviewId}, round ${request.roundNumber}`);
      res.json(response);
      
    } catch (error) {
      logger.error('Error submitting feedback:', error);
      next(error);
    }
  }
  
  /**
   * Update review status
   */
  static async updateReviewStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const request: UpdateReviewStatusRequest = {
        reviewId,
        ...req.body
      };
      
      // Validate required fields
      if (!request.status) {
        return res.status(400).json({
          error: 'Missing required field: status'
        });
      }
      
      const review = await ReviewController.reviewService.updateReviewStatus(request);
      
      const response: ReviewResponse = {
        review,
        permissions: {
          canEdit: true,
          canAssign: true,
          canApprove: true,
          canReject: true,
          canEscalate: true,
          canViewFeedback: true,
          canAddFeedback: true
        }
      };
      
      logger.info(`Review status updated: ${reviewId} to ${request.status}`);
      res.json(response);
      
    } catch (error) {
      logger.error('Error updating review status:', error);
      next(error);
    }
  }
  
  /**
   * Get reviewer dashboard
   */
  static async getReviewerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewerId } = req.params;
      
      if (!reviewerId) {
        return res.status(400).json({ error: 'Reviewer ID is required' });
      }
      
      const dashboard = await ReviewController.reviewService.getReviewerDashboard(reviewerId);
      
      res.json(dashboard);
      
    } catch (error) {
      logger.error('Error getting reviewer dashboard:', error);
      next(error);
    }
  }
  
  /**
   * Get review analytics
   */
  static async getReviewAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
        
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string)
        : new Date(); // Default to now
      
      const analytics = await ReviewController.reviewService.getReviewAnalytics(startDate, endDate);
      
      const response: ReviewAnalyticsResponse = {
        analytics,
        generatedAt: new Date()
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting review analytics:', error);
      next(error);
    }
  }
  
  /**
   * Get reviews for a specific project
   */
  static async getProjectReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }
      
      const params: ReviewSearchParams = {
        projectId,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      const { reviews, total } = await ReviewController.reviewService.searchReviews(params);
      
      const response: ReviewListResponse = {
        reviews,
        total,
        page: Math.floor((params.offset || 0) / (params.limit || 50)) + 1,
        limit: params.limit || 50,
        hasMore: (params.offset || 0) + reviews.length < total
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting project reviews:', error);
      next(error);
    }
  }
  
  /**
   * Get reviews assigned to current user
   */
  static async getMyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real implementation, you would get the user ID from the authenticated session
      const userId = req.headers['x-user-id'] as string || req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const params: ReviewSearchParams = {
        reviewerId: userId,
        status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status as any[] : [req.query.status as any]) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      };
      
      const { reviews, total } = await ReviewController.reviewService.searchReviews(params);
      
      const response: ReviewListResponse = {
        reviews,
        total,
        page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
        limit: params.limit || 20,
        hasMore: (params.offset || 0) + reviews.length < total
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error getting my reviews:', error);
      next(error);
    }
  }
  
  /**
   * Accept a review assignment
   */
  static async acceptReviewAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const userId = req.headers['x-user-id'] as string || req.body.userId;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const review = await ReviewController.reviewService.getReview(reviewId);
      
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      
      // Find the reviewer assignment
      const assignment = review.assignedReviewers.find(r => r.reviewerId === userId);
      
      if (!assignment) {
        return res.status(404).json({ error: 'Review assignment not found for this user' });
      }
      
      if (assignment.status !== 'assigned') {
        return res.status(400).json({ error: 'Review assignment cannot be accepted in current status' });
      }
      
      // Update the review to mark assignment as accepted
      const updatedReview = await ReviewController.reviewService.updateReviewStatus({
        reviewId,
        status: 'in_review',
        comments: 'Reviewer accepted the assignment'
      });
      
      logger.info(`Review assignment accepted: ${reviewId} by ${userId}`);
      res.json({ review: updatedReview, message: 'Review assignment accepted successfully' });
      
    } catch (error) {
      logger.error('Error accepting review assignment:', error);
      next(error);
    }
  }
  
  /**
   * Decline a review assignment
   */
  static async declineReviewAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const userId = req.headers['x-user-id'] as string || req.body.userId;
      const reason = req.body.reason || 'No reason provided';
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const review = await ReviewController.reviewService.getReview(reviewId);
      
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      
      // Find the reviewer assignment
      const assignment = review.assignedReviewers.find(r => r.reviewerId === userId);
      
      if (!assignment) {
        return res.status(404).json({ error: 'Review assignment not found for this user' });
      }
      
      if (assignment.status !== 'assigned') {
        return res.status(400).json({ error: 'Review assignment cannot be declined in current status' });
      }
      
      // In a real implementation, you would:
      // 1. Mark the assignment as declined
      // 2. Find a replacement reviewer
      // 3. Notify the review coordinator
      
      logger.info(`Review assignment declined: ${reviewId} by ${userId}, reason: ${reason}`);
      res.json({ message: 'Review assignment declined successfully' });
      
    } catch (error) {
      logger.error('Error declining review assignment:', error);
      next(error);
    }
  }
  
  /**
   * Get review statistics summary
   */
  static async getReviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const reviewerId = req.query.reviewerId as string;
      
      const params: ReviewSearchParams = {
        projectId,
        reviewerId,
        limit: 1000, // Get all for stats calculation
        offset: 0
      };
      
      const { reviews } = await ReviewController.reviewService.searchReviews(params);
      
      // Calculate statistics
      const stats = {
        total: reviews.length,
        pending: reviews.filter(r => ['pending_assignment', 'assigned', 'in_review'].includes(r.status)).length,
        completed: reviews.filter(r => ['approved', 'rejected', 'completed'].includes(r.status)).length,
        overdue: reviews.filter(r => 
          r.dueDate && new Date() > r.dueDate && 
          !['approved', 'rejected', 'completed'].includes(r.status)
        ).length,
        byStatus: reviews.reduce((acc, review) => {
          acc[review.status] = (acc[review.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byPriority: reviews.reduce((acc, review) => {
          acc[review.priority] = (acc[review.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byDocumentType: reviews.reduce((acc, review) => {
          acc[review.documentType] = (acc[review.documentType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
      
      res.json(stats);
      
    } catch (error) {
      logger.error('Error getting review stats:', error);
      next(error);
    }
  }
}