import { Request, Response, NextFunction } from 'express';
import { ReviewerProfileModel, IReviewerProfile } from '../../models/ReviewerProfile.js';
import {
  ReviewerProfile,
  ReviewerRole,
  ReviewerAvailability,
  ReviewerPreferences
} from '../../types/review.js';
import { logger } from '../../utils/logger.js';

export class ReviewerController {
  /**
   * Create a new reviewer profile
   */
  static async createReviewerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profileData = req.body;
      
      // Validate required fields
      if (!profileData.userId || !profileData.name || !profileData.email || !profileData.roles) {
        return res.status(400).json({
          error: 'Missing required fields: userId, name, email, roles'
        });
      }
      
      // Check if profile already exists
      const existingProfile = await ReviewerProfileModel.findOne({ userId: profileData.userId });
      if (existingProfile) {
        return res.status(409).json({ error: 'Reviewer profile already exists for this user' });
      }
      
      // Set default values for required nested objects
      const profileWithDefaults = {
        ...profileData,
        availability: profileData.availability || {
          hoursPerWeek: 20,
          timeZone: 'UTC',
          workingHours: { start: '09:00', end: '17:00' },
          workingDays: [1, 2, 3, 4, 5], // Monday to Friday
          unavailableDates: [],
          maxConcurrentReviews: 3
        },
        preferences: profileData.preferences || {
          preferredDocumentTypes: [],
          preferredProjectTypes: [],
          notificationPreferences: {
            email: true,
            inApp: true,
            sms: false
          },
          reminderFrequency: 'daily'
        },
        metrics: {
          totalReviews: 0,
          completedReviews: 0,
          averageReviewTime: 0,
          averageQualityScore: 0,
          onTimeCompletionRate: 0,
          last30DaysReviews: 0,
          last30DaysAvgTime: 0,
          feedbackQualityScore: 0,
          thoroughnessScore: 0,
          lastUpdated: new Date()
        }
      };
      
      const profile = new ReviewerProfileModel(profileWithDefaults);
      const savedProfile = await profile.save();
      
      logger.info(`Reviewer profile created: ${savedProfile.userId}`);
      res.status(201).json(savedProfile.toJSON());
      
    } catch (error) {
      logger.error('Error creating reviewer profile:', error);
      next(error);
    }
  }
  
  /**
   * Get reviewer profile by user ID
   */
  static async getReviewerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const profile = await ReviewerProfileModel.findOne({ userId });
      
      if (!profile) {
        return res.status(404).json({ error: 'Reviewer profile not found' });
      }
      
      res.json(profile.toJSON());
      
    } catch (error) {
      logger.error('Error getting reviewer profile:', error);
      next(error);
    }
  }
  
  /**
   * Update reviewer profile
   */
  static async updateReviewerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const profile = await ReviewerProfileModel.findOne({ userId });
      
      if (!profile) {
        return res.status(404).json({ error: 'Reviewer profile not found' });
      }
      
      // Update allowed fields
      const allowedUpdates = [
        'name', 'email', 'title', 'department', 'organization',
        'roles', 'expertise', 'certifications', 'experienceYears',
        'availability', 'preferences', 'isActive'
      ];
      
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          (profile as any)[field] = updates[field];
        }
      });
      
      const updatedProfile = await profile.save();
      
      logger.info(`Reviewer profile updated: ${userId}`);
      res.json(updatedProfile.toJSON());
      
    } catch (error) {
      logger.error('Error updating reviewer profile:', error);
      next(error);
    }
  }
  
  /**
   * Delete reviewer profile
   */
  static async deleteReviewerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const profile = await ReviewerProfileModel.findOne({ userId });
      
      if (!profile) {
        return res.status(404).json({ error: 'Reviewer profile not found' });
      }
      
      // Soft delete by setting isActive to false
      profile.isActive = false;
      await profile.save();
      
      logger.info(`Reviewer profile deactivated: ${userId}`);
      res.json({ message: 'Reviewer profile deactivated successfully' });
      
    } catch (error) {
      logger.error('Error deleting reviewer profile:', error);
      next(error);
    }
  }
  
  /**
   * Search reviewers with filters
   */
  static async searchReviewers(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: any = { isActive: true };
      
      // Apply filters
      if (req.query.roles) {
        const roles = Array.isArray(req.query.roles) ? req.query.roles : [req.query.roles];
        filter.roles = { $in: roles };
      }
      
      if (req.query.expertise) {
        const expertise = Array.isArray(req.query.expertise) ? req.query.expertise : [req.query.expertise];
        filter.expertise = { $in: expertise };
      }
      
      if (req.query.department) {
        filter.department = req.query.department;
      }
      
      if (req.query.organization) {
        filter.organization = req.query.organization;
      }
      
      if (req.query.minExperience) {
        filter.experienceYears = { $gte: parseInt(req.query.minExperience as string) };
      }
      
      if (req.query.minQualityScore) {
        filter['metrics.averageQualityScore'] = { $gte: parseFloat(req.query.minQualityScore as string) };
      }
      
      // Sorting
      const sortField = req.query.sortBy as string || 'metrics.averageQualityScore';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      
      // Pagination
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const [reviewers, total] = await Promise.all([
        ReviewerProfileModel.find(filter)
          .sort({ [sortField]: sortOrder })
          .limit(limit)
          .skip(offset)
          .exec(),
        ReviewerProfileModel.countDocuments(filter)
      ]);
      
      res.json({
        reviewers: reviewers.map(r => r.toJSON()),
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
        hasMore: offset + reviewers.length < total
      });
      
    } catch (error) {
      logger.error('Error searching reviewers:', error);
      next(error);
    }
  }
  
  /**
   * Get available reviewers for a specific role and document type
   */
  static async getAvailableReviewers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, documentType } = req.query;
      
      if (!role) {
        return res.status(400).json({ error: 'Role is required' });
      }
      
      const filter: any = {
        isActive: true,
        roles: role
      };
      
      // Filter by document type preference if specified
      if (documentType) {
        filter.$or = [
          { 'preferences.preferredDocumentTypes': documentType },
          { 'preferences.preferredDocumentTypes': { $size: 0 } } // No preferences means available for all
        ];
      }
      
      const reviewers = await ReviewerProfileModel.find(filter)
        .sort({
          'metrics.averageQualityScore': -1,
          'metrics.onTimeCompletionRate': -1
        })
        .limit(20)
        .exec();
      
      // Filter by actual availability (would check current workload in real implementation)
      const availableReviewers = reviewers.filter(reviewer => {
        // Placeholder for availability check
        return reviewer.canTakeReview();
      });
      
      res.json({
        reviewers: availableReviewers.map(r => ({
          ...r.toJSON(),
          availabilityStatus: r.availabilityStatus,
          performanceRating: r.performanceRating,
          currentWorkload: r.currentWorkload
        }))
      });
      
    } catch (error) {
      logger.error('Error getting available reviewers:', error);
      next(error);
    }
  }
  
  /**
   * Update reviewer availability
   */
  static async updateReviewerAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const availability: ReviewerAvailability = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const profile = await ReviewerProfileModel.findOne({ userId });
      
      if (!profile) {
        return res.status(404).json({ error: 'Reviewer profile not found' });
      }
      
      profile.availability = availability;
      const updatedProfile = await profile.save();
      
      logger.info(`Reviewer availability updated: ${userId}`);
      res.json({
        availability: updatedProfile.availability,
        availabilityStatus: updatedProfile.availabilityStatus
      });
      
    } catch (error) {
      logger.error('Error updating reviewer availability:', error);
      next(error);
    }
  }
  
  /**
   * Update reviewer preferences
   */
  static async updateReviewerPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const preferences: ReviewerPreferences = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const profile = await ReviewerProfileModel.findOne({ userId });
      
      if (!profile) {
        return res.status(404).json({ error: 'Reviewer profile not found' });
      }
      
      profile.preferences = preferences;
      const updatedProfile = await profile.save();
      
      logger.info(`Reviewer preferences updated: ${userId}`);
      res.json({ preferences: updatedProfile.preferences });
      
    } catch (error) {
      logger.error('Error updating reviewer preferences:', error);
      next(error);
    }
  }
  
  /**
   * Get reviewer performance metrics
   */
  static async getReviewerMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const profile = await ReviewerProfileModel.findOne({ userId });
      
      if (!profile) {
        return res.status(404).json({ error: 'Reviewer profile not found' });
      }
      
      res.json({
        metrics: profile.metrics,
        performanceRating: profile.performanceRating,
        availabilityStatus: profile.availabilityStatus,
        currentWorkload: profile.currentWorkload
      });
      
    } catch (error) {
      logger.error('Error getting reviewer metrics:', error);
      next(error);
    }
  }
  
  /**
   * Get reviewer leaderboard
   */
  static async getReviewerLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const metric = req.query.metric as string || 'averageQualityScore';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const validMetrics = [
        'averageQualityScore',
        'onTimeCompletionRate',
        'completedReviews',
        'feedbackQualityScore',
        'thoroughnessScore'
      ];
      
      if (!validMetrics.includes(metric)) {
        return res.status(400).json({ 
          error: `Invalid metric. Valid options: ${validMetrics.join(', ')}` 
        });
      }
      
      const reviewers = await ReviewerProfileModel.find({ isActive: true })
        .sort({ [`metrics.${metric}`]: -1 })
        .limit(limit)
        .select('userId name title department metrics')
        .exec();
      
      const leaderboard = reviewers.map((reviewer, index) => ({
        rank: index + 1,
        userId: reviewer.userId,
        name: reviewer.name,
        title: reviewer.title,
        department: reviewer.department,
        score: (reviewer.metrics as any)[metric],
        performanceRating: reviewer.performanceRating
      }));
      
      res.json({
        metric,
        leaderboard
      });
      
    } catch (error) {
      logger.error('Error getting reviewer leaderboard:', error);
      next(error);
    }
  }
  
  /**
   * Get reviewer workload summary
   */
  static async getReviewerWorkload(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const profile = await ReviewerProfileModel.findOne({ userId });
      
      if (!profile) {
        return res.status(404).json({ error: 'Reviewer profile not found' });
      }
      
      // In a real implementation, this would query the DocumentReview collection
      // to get actual current workload
      const workload = {
        currentReviews: 0, // Would be calculated from active reviews
        maxConcurrentReviews: profile.availability.maxConcurrentReviews,
        hoursPerWeek: profile.availability.hoursPerWeek,
        utilizationRate: 0, // Would be calculated based on current workload
        availabilityStatus: profile.availabilityStatus,
        upcomingDeadlines: [], // Would be populated from active reviews
        estimatedHoursThisWeek: 0 // Would be calculated from active reviews
      };
      
      res.json(workload);
      
    } catch (error) {
      logger.error('Error getting reviewer workload:', error);
      next(error);
    }
  }
}