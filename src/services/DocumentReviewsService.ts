// Phase 1: Document Reviews Service - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { DocumentReviewModel, IDocumentReview } from '../models/Review.js';
import { logger } from '../utils/logger.js';

export interface DocumentReviewsAnalytics {
  totalReviews: number;
  reviewsByStatus: Record<string, number>;
  reviewsByPriority: Record<string, number>;
  averageReviewTime: number;
  overdueReviews: number;
  recentReviews: IDocumentReview[];
  topReviewers: Array<{
    reviewerId: string;
    reviewerName: string;
    completedReviews: number;
  }>;
}

export class DocumentReviewsService {
  /**
   * Get document reviews for a specific project
   */
  async getProjectReviews(projectId: string, filters?: {
    status?: string;
    priority?: string;
    reviewerId?: string;
    documentType?: string;
  }): Promise<IDocumentReview[]> {
    try {
      const query: any = { projectId };
      
      if (filters?.status) {
        query.status = filters.status;
      }
      if (filters?.priority) {
        query.priority = filters.priority;
      }
      if (filters?.reviewerId) {
        query['assignedReviewers.reviewerId'] = filters.reviewerId;
      }
      if (filters?.documentType) {
        query.documentType = filters.documentType;
      }

      const reviews = await DocumentReviewModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(100);

      logger.info(`📝 Retrieved ${reviews.length} document reviews for project ${projectId}`);
      return reviews;
    } catch (error) {
      logger.error('❌ Error fetching project document reviews:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics for document reviews
   */
  async getAnalytics(projectId?: string, startDate?: Date, endDate?: Date): Promise<DocumentReviewsAnalytics> {
    try {
      const matchQuery: any = {};
      if (projectId) {
        matchQuery.projectId = projectId;
      }
      if (startDate && endDate) {
        matchQuery.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      }

      const pipeline = [
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            reviews: { $push: '$$ROOT' },
            completedReviews: {
              $push: {
                $cond: [
                  { $in: ['$status', ['completed', 'approved']] },
                  {
                    reviewId: '$_id',
                    submittedAt: '$submittedAt',
                    completedAt: '$completedAt',
                    reviewers: '$assignedReviewers'
                  },
                  null
                ]
              }
            }
          }
        },
        {
          $project: {
            totalReviews: 1,
            reviews: 1,
            completedReviews: { $filter: { input: '$completedReviews', cond: { $ne: ['$$this', null] } } }
          }
        }
      ];

      const [analytics] = await DocumentReviewModel.aggregate(pipeline);
      
      if (!analytics) {
        return {
          totalReviews: 0,
          reviewsByStatus: {},
          reviewsByPriority: {},
          averageReviewTime: 0,
          overdueReviews: 0,
          recentReviews: [],
          topReviewers: []
        };
      }

      // Calculate metrics
      const reviewsByStatus: Record<string, number> = {};
      const reviewsByPriority: Record<string, number> = {};
      let overdueReviews = 0;
      let totalReviewTime = 0;
      let completedCount = 0;
      const reviewerStats: Record<string, { name: string; count: number }> = {};

      analytics.reviews.forEach((review: any) => {
        // Status counts
        reviewsByStatus[review.status] = (reviewsByStatus[review.status] || 0) + 1;
        
        // Priority counts
        reviewsByPriority[review.priority] = (reviewsByPriority[review.priority] || 0) + 1;
        
        // Overdue reviews
        if (review.dueDate && new Date(review.dueDate) < new Date() && !['completed', 'approved'].includes(review.status)) {
          overdueReviews++;
        }
        
        // Review time calculation
        if (['completed', 'approved'].includes(review.status) && review.submittedAt && review.completedAt) {
          const reviewTime = new Date(review.completedAt).getTime() - new Date(review.submittedAt).getTime();
          totalReviewTime += reviewTime;
          completedCount++;
        }

        // Reviewer statistics
        review.assignedReviewers.forEach((reviewer: any) => {
          if (reviewer.status === 'completed') {
            if (!reviewerStats[reviewer.reviewerId]) {
              reviewerStats[reviewer.reviewerId] = {
                name: reviewer.reviewerName,
                count: 0
              };
            }
            reviewerStats[reviewer.reviewerId].count++;
          }
        });
      });

      // Calculate average review time in hours
      const averageReviewTime = completedCount > 0 ? totalReviewTime / completedCount / (1000 * 60 * 60) : 0;

      // Get top reviewers
      const topReviewers = Object.entries(reviewerStats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([reviewerId, stats]) => ({
          reviewerId,
          reviewerName: stats.name,
          completedReviews: stats.count
        }));

      // Get recent reviews
      const recentReviews = analytics.reviews
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      logger.info(`📝 Generated document reviews analytics: ${analytics.totalReviews} total reviews`);

      return {
        totalReviews: analytics.totalReviews,
        reviewsByStatus,
        reviewsByPriority,
        averageReviewTime: Math.round(averageReviewTime * 100) / 100,
        overdueReviews,
        recentReviews,
        topReviewers
      };
    } catch (error) {
      logger.error('❌ Error generating document reviews analytics:', error);
      throw error;
    }
  }

  /**
   * Create a new document review
   */
  async createReview(reviewData: {
    documentId: string;
    documentName: string;
    documentType: string;
    documentPath: string;
    projectId: string;
    projectName: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: Date;
    assignedReviewers: Array<{
      reviewerId: string;
      reviewerName: string;
      reviewerEmail: string;
      role: string;
      expertise?: string[];
      estimatedHours?: number;
    }>;
    metadata?: any;
  }): Promise<IDocumentReview> {
    try {
      const review = new DocumentReviewModel({
        ...reviewData,
        status: 'pending_assignment',
        priority: reviewData.priority || 'medium',
        assignedReviewers: reviewData.assignedReviewers.map(reviewer => ({
          ...reviewer,
          status: 'assigned',
          assignedAt: new Date()
        })),
        submittedAt: new Date()
      });

      await review.save();
      
      logger.info(`✅ Created document review: ${reviewData.documentName} for project ${reviewData.projectId}`);
      return review;
    } catch (error) {
      logger.error('❌ Error creating document review:', error);
      throw error;
    }
  }

  /**
   * Update review status
   */
  async updateReviewStatus(reviewId: string, status: string): Promise<IDocumentReview | null> {
    try {
      const review = await DocumentReviewModel.findByIdAndUpdate(
        reviewId,
        { 
          status,
          completedAt: ['completed', 'approved'].includes(status) ? new Date() : undefined
        },
        { new: true }
      );

      if (review) {
        logger.info(`✅ Updated review status: ${reviewId} to ${status}`);
      }
      
      return review;
    } catch (error) {
      logger.error('❌ Error updating review status:', error);
      throw error;
    }
  }

  /**
   * Add feedback to a review
   */
  async addFeedback(reviewId: string, feedbackData: {
    roundNumber: number;
    reviewerId: string;
    reviewerName: string;
    feedback: Array<{
      type: string;
      severity: string;
      section?: string;
      lineNumber?: number;
      title: string;
      description: string;
      suggestion?: string;
      originalText?: string;
      suggestedText?: string;
    }>;
    decision: 'approve' | 'reject' | 'request_revision';
    overallComments?: string;
    qualityScore?: number;
    complianceScore?: number;
  }): Promise<IDocumentReview | null> {
    try {
      const review = await DocumentReviewModel.findById(reviewId);
      if (!review) {
        return null;
      }

      const reviewRound = {
        roundNumber: feedbackData.roundNumber,
        startedAt: new Date(),
        completedAt: new Date(),
        reviewerId: feedbackData.reviewerId,
        reviewerName: feedbackData.reviewerName,
        feedback: feedbackData.feedback.map(fb => ({
          ...fb,
          id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: fb.type as any, // Cast to FeedbackType
          severity: fb.severity as any, // Cast to severity type
          status: 'open' as any, // Cast to ReviewFeedback status type
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        decision: feedbackData.decision,
        overallComments: feedbackData.overallComments,
        qualityScore: feedbackData.qualityScore,
        complianceScore: feedbackData.complianceScore
      };

      review.reviewRounds.push(reviewRound);
      
      // Update current round
      review.currentRound = Math.max(review.currentRound, feedbackData.roundNumber);
      
      // Update reviewer status
      const reviewer = review.assignedReviewers.find(r => r.reviewerId === feedbackData.reviewerId);
      if (reviewer) {
        reviewer.status = 'completed';
      }

      await review.save();
      
      logger.info(`💬 Added feedback to review: ${reviewId} from ${feedbackData.reviewerName}`);
      return review;
    } catch (error) {
      logger.error('❌ Error adding feedback to review:', error);
      throw error;
    }
  }

  /**
   * Assign reviewer to a review
   */
  async assignReviewer(reviewId: string, reviewerData: {
    reviewerId: string;
    reviewerName: string;
    reviewerEmail: string;
    role: string;
    expertise?: string[];
    estimatedHours?: number;
  }): Promise<IDocumentReview | null> {
    try {
      const review = await DocumentReviewModel.findById(reviewId);
      if (!review) {
        return null;
      }

      const reviewer = {
        ...reviewerData,
        role: reviewerData.role as any, // Cast to ReviewerRole
        expertise: reviewerData.expertise || [], // Ensure expertise is always an array
        status: 'assigned' as any, // Cast to ReviewerAssignment status type
        assignedAt: new Date()
      };

      review.assignedReviewers.push(reviewer);
      review.status = 'assigned';
      review.currentReviewer = reviewerData.reviewerId;

      await review.save();
      
      logger.info(`👤 Assigned reviewer to review: ${reviewId} - ${reviewerData.reviewerName}`);
      return review;
    } catch (error) {
      logger.error('❌ Error assigning reviewer to review:', error);
      throw error;
    }
  }

  /**
   * Seed sample data for testing
   */
  async seedSampleData(): Promise<void> {
    try {
      const sampleReviews = [
        {
          documentId: 'doc_123',
          documentName: 'Requirements Specification v2.1',
          documentType: 'requirements',
          documentPath: '/documents/req_spec_v2.1.pdf',
          projectId: '68cc74380846c36e221ee391',
          projectName: 'Customer Portal Enhancement',
          status: 'in_review',
          priority: 'high',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          assignedReviewers: [
            {
              reviewerId: 'reviewer_001',
              reviewerName: 'John Doe',
              reviewerEmail: 'john.doe@company.com',
              role: 'subject_matter_expert',
              expertise: ['requirements', 'business-analysis'],
              status: 'completed',
              assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
          ],
          reviewRounds: [
            {
              roundNumber: 1,
              startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              reviewerId: 'reviewer_001',
              reviewerName: 'John Doe',
              feedback: [
                {
                  id: 'feedback_001',
                  type: 'content_accuracy',
                  severity: 'minor',
                  section: 'Section 3.2',
                  title: 'Minor clarification needed',
                  description: 'The requirement for user authentication could be more specific.',
                  suggestion: 'Add details about multi-factor authentication requirements.',
                  status: 'open',
                  createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                }
              ],
              decision: 'request_revision',
              overallComments: 'Overall good quality, but needs minor revisions for clarity.',
              qualityScore: 85,
              complianceScore: 90
            }
          ],
          currentRound: 1,
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          metadata: {
            generationJobId: 'job_123',
            complianceScore: 90,
            tags: ['requirements', 'babok']
          }
        },
        {
          documentId: 'doc_124',
          documentName: 'Business Case Document',
          documentType: 'business-case',
          documentPath: '/documents/business_case.pdf',
          projectId: '68cc74380846c36e221ee391',
          projectName: 'Customer Portal Enhancement',
          status: 'completed',
          priority: 'medium',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          assignedReviewers: [
            {
              reviewerId: 'reviewer_002',
              reviewerName: 'Jane Smith',
              reviewerEmail: 'jane.smith@company.com',
              role: 'business_analyst',
              expertise: ['business-analysis', 'financial-modeling'],
              status: 'completed',
              assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            }
          ],
          reviewRounds: [
            {
              roundNumber: 1,
              startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              reviewerId: 'reviewer_002',
              reviewerName: 'Jane Smith',
              feedback: [],
              decision: 'approve',
              overallComments: 'Excellent business case with clear ROI analysis.',
              qualityScore: 95,
              complianceScore: 92
            }
          ],
          currentRound: 1,
          submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          metadata: {
            generationJobId: 'job_124',
            complianceScore: 92,
            tags: ['business-case', 'pmbok']
          }
        }
      ];

      // Clear existing sample data
      await DocumentReviewModel.deleteMany({ 
        projectId: '68cc74380846c36e221ee391',
        documentName: { $in: ['Requirements Specification v2.1', 'Business Case Document'] }
      });
      
      // Insert sample data
      await DocumentReviewModel.insertMany(sampleReviews);
      
      logger.info('✅ Seeded document reviews sample data');
    } catch (error) {
      logger.error('❌ Error seeding document reviews:', error);
      throw error;
    }
  }
}

export default new DocumentReviewsService();
