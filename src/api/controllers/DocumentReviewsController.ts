// Phase 1: Document Reviews Controller - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { Request, Response } from 'express';
import DocumentReviewsService from '../../services/DocumentReviewsService.js';
import { logger } from '../../utils/logger.js';

export class DocumentReviewsController {
  /**
   * Get document reviews analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const analytics = await DocumentReviewsService.getAnalytics(
        projectId as string,
        start,
        end
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('❌ Error in document reviews analytics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get project document reviews
   */
  async getProjectReviews(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { status, priority, reviewerId, documentType } = req.query;

      const filters = {
        status: status as string,
        priority: priority as string,
        reviewerId: reviewerId as string,
        documentType: documentType as string
      };

      const reviews = await DocumentReviewsService.getProjectReviews(projectId, filters);

      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      logger.error('❌ Error in get project reviews:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all document reviews with filters
   */
  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, status, priority, reviewerId, documentType } = req.query;

      const filters = {
        status: status as string,
        priority: priority as string,
        reviewerId: reviewerId as string,
        documentType: documentType as string
      };

      const reviews = await DocumentReviewsService.getProjectReviews(
        projectId as string,
        filters
      );

      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      logger.error('❌ Error in get reviews:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new document review
   */
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewData = req.body;

      const review = await DocumentReviewsService.createReview(reviewData);

      res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error('❌ Error in create review:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update review status
   */
  async updateReviewStatus(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const { status } = req.body;

      const review = await DocumentReviewsService.updateReviewStatus(reviewId, status);

      if (!review) {
        res.status(404).json({
          success: false,
          error: 'Review not found'
        });
        return;
      }

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error('❌ Error in update review status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add feedback to review
   */
  async addFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const feedbackData = req.body;

      const review = await DocumentReviewsService.addFeedback(reviewId, feedbackData);

      if (!review) {
        res.status(404).json({
          success: false,
          error: 'Review not found'
        });
        return;
      }

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error('❌ Error in add feedback:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Assign reviewer to review
   */
  async assignReviewer(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const reviewerData = req.body;

      const review = await DocumentReviewsService.assignReviewer(reviewId, reviewerData);

      if (!review) {
        res.status(404).json({
          success: false,
          error: 'Review not found'
        });
        return;
      }

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error('❌ Error in assign reviewer:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Seed sample data
   */
  async seedSampleData(req: Request, res: Response): Promise<void> {
    try {
      await DocumentReviewsService.seedSampleData();

      res.json({
        success: true,
        message: 'Sample data seeded successfully'
      });
    } catch (error) {
      logger.error('❌ Error in seed sample data:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new DocumentReviewsController();
