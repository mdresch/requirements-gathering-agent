import mongoose, { Schema, Document } from 'mongoose';
import {
  ReviewerProfile,
  ReviewerAvailability,
  ReviewerPreferences,
  ReviewerMetrics,
  ReviewerRole
} from '../types/review.js';

export interface IReviewerProfile extends Document {
  // All ReviewerProfile fields except id
  userId: string;
  name: string;
  email: string;
  title: string;
  department: string;
  organization: string;
  roles: ReviewerRole[];
  expertise: string[];
  certifications?: string[];
  experienceYears: number;
  availability: ReviewerAvailability;
  preferences: ReviewerPreferences;
  metrics: ReviewerMetrics;
  isActive: boolean;
  // Virtuals
  availabilityStatus?: string;
  currentWorkload?: number;
  performanceRating?: string;
  // Methods
  canTakeReview?: (estimatedHours?: number) => boolean;
  updateMetrics?: (reviewData: {
    reviewTime: number;
    qualityScore: number;
    onTime: boolean;
    feedbackQuality: number;
    thoroughness: number;
  }) => Promise<void>;
}

const ReviewerAvailabilitySchema = new Schema({
  hoursPerWeek: { type: Number, required: true, min: 1, max: 168 },
  timeZone: { type: String, required: true },
  workingHours: {
    start: { type: String, required: true }, // HH:MM format
    end: { type: String, required: true }     // HH:MM format
  },
  workingDays: [{ type: Number, min: 0, max: 6 }], // 0-6, Sunday = 0
  unavailableDates: [Date],
  maxConcurrentReviews: { type: Number, default: 3, min: 1 }
});

const ReviewerPreferencesSchema = new Schema({
  preferredDocumentTypes: [String],
  preferredProjectTypes: [String],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  reminderFrequency: { 
    type: String, 
    enum: ['none', 'daily', 'weekly'],
    default: 'daily' 
  }
});

const ReviewerMetricsSchema = new Schema({
  totalReviews: { type: Number, default: 0 },
  completedReviews: { type: Number, default: 0 },
  averageReviewTime: { type: Number, default: 0 }, // in hours
  averageQualityScore: { type: Number, default: 0, min: 0, max: 100 },
  onTimeCompletionRate: { type: Number, default: 0, min: 0, max: 100 },
  
  // Recent performance
  last30DaysReviews: { type: Number, default: 0 },
  last30DaysAvgTime: { type: Number, default: 0 },
  
  // Quality metrics
  feedbackQualityScore: { type: Number, default: 0, min: 0, max: 100 },
  thoroughnessScore: { type: Number, default: 0, min: 0, max: 100 },
  
  // Updated timestamp
  lastUpdated: { type: Date, default: Date.now }
});

const ReviewerProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  
  // Professional information
  title: { type: String, required: true },
  department: { type: String, required: true },
  organization: { type: String, required: true },
  
  // Expertise and qualifications
  roles: [{ 
    type: String, 
    enum: ['subject_matter_expert', 'technical_reviewer', 'compliance_officer', 'project_manager', 'business_analyst', 'quality_assurance', 'stakeholder'],
    required: true 
  }],
  expertise: [{ type: String, required: true }],
  certifications: [String],
  experienceYears: { type: Number, required: true, min: 0 },
  
  // Availability and preferences
  availability: { type: ReviewerAvailabilitySchema, required: true },
  preferences: { type: ReviewerPreferencesSchema, required: true },
  
  // Performance metrics
  metrics: { type: ReviewerMetricsSchema, required: true },
  
  // Status
  isActive: { type: Boolean, default: true, index: true }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
ReviewerProfileSchema.index({ roles: 1, isActive: 1 });
ReviewerProfileSchema.index({ expertise: 1, isActive: 1 });
ReviewerProfileSchema.index({ 'availability.hoursPerWeek': 1 });
ReviewerProfileSchema.index({ 'metrics.averageQualityScore': -1 });
ReviewerProfileSchema.index({ 'metrics.onTimeCompletionRate': -1 });

// Virtual for current workload
ReviewerProfileSchema.virtual('currentWorkload').get(function(this: IReviewerProfile) {
  // This would be calculated based on active reviews
  // Implementation would query DocumentReview collection
  return 0; // Placeholder
});

// Virtual for availability status
ReviewerProfileSchema.virtual('availabilityStatus').get(function(this: IReviewerProfile) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Check if today is a working day
  if (!this.availability.workingDays.includes(currentDay)) {
    return 'unavailable';
  }
  
  // Check if current time is within working hours
  if (currentTime < this.availability.workingHours.start || currentTime > this.availability.workingHours.end) {
    return 'outside_hours';
  }
  
  // Check for unavailable dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isUnavailable = this.availability.unavailableDates.some(date => {
    const unavailableDate = new Date(date);
    unavailableDate.setHours(0, 0, 0, 0);
    return unavailableDate.getTime() === today.getTime();
  });
  
  if (isUnavailable) {
    return 'unavailable';
  }
  
  return 'available';
});

// Virtual for performance rating
ReviewerProfileSchema.virtual('performanceRating').get(function(this: IReviewerProfile) {
  const qualityWeight = 0.4;
  const timelinessWeight = 0.3;
  const thoroughnessWeight = 0.3;
  
  const rating = (
    this.metrics.averageQualityScore * qualityWeight +
    this.metrics.onTimeCompletionRate * timelinessWeight +
    this.metrics.thoroughnessScore * thoroughnessWeight
  );
  
  if (rating >= 90) return 'excellent';
  if (rating >= 80) return 'good';
  if (rating >= 70) return 'satisfactory';
  if (rating >= 60) return 'needs_improvement';
  return 'poor';
});

// Method to check if reviewer can take on new review
ReviewerProfileSchema.methods.canTakeReview = function(this: IReviewerProfile, estimatedHours: number = 8): boolean {
  if (!this.isActive) return false;
  
  // Check availability status
  if (this.availabilityStatus !== 'available') return false;
  
  // This would check current workload against max concurrent reviews
  // Implementation would query active reviews for this reviewer
  return true; // Placeholder
};

// Method to update metrics
ReviewerProfileSchema.methods.updateMetrics = async function(this: IReviewerProfile, reviewData: {
  reviewTime: number;
  qualityScore: number;
  onTime: boolean;
  feedbackQuality: number;
  thoroughness: number;
}): Promise<void> {
  const metrics = this.metrics;
  
  // Update totals
  metrics.totalReviews += 1;
  metrics.completedReviews += 1;
  
  // Update averages
  metrics.averageReviewTime = (
    (metrics.averageReviewTime * (metrics.completedReviews - 1) + reviewData.reviewTime) / 
    metrics.completedReviews
  );
  
  metrics.averageQualityScore = (
    (metrics.averageQualityScore * (metrics.completedReviews - 1) + reviewData.qualityScore) / 
    metrics.completedReviews
  );
  
  // Update on-time completion rate
  const onTimeReviews = Math.round(metrics.onTimeCompletionRate * (metrics.completedReviews - 1) / 100);
  const newOnTimeReviews = onTimeReviews + (reviewData.onTime ? 1 : 0);
  metrics.onTimeCompletionRate = (newOnTimeReviews / metrics.completedReviews) * 100;
  
  // Update quality metrics
  metrics.feedbackQualityScore = (
    (metrics.feedbackQualityScore * (metrics.completedReviews - 1) + reviewData.feedbackQuality) / 
    metrics.completedReviews
  );
  
  metrics.thoroughnessScore = (
    (metrics.thoroughnessScore * (metrics.completedReviews - 1) + reviewData.thoroughness) / 
    metrics.completedReviews
  );
  
  metrics.lastUpdated = new Date();
  
  await this.save();
};

export const ReviewerProfileModel = mongoose.model<IReviewerProfile>('ReviewerProfile', ReviewerProfileSchema);