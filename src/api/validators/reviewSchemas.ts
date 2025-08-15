import Joi from 'joi';

// Review Status enum validation
const reviewStatusSchema = Joi.string().valid(
  'pending_assignment',
  'assigned',
  'in_review',
  'feedback_provided',
  'approved',
  'rejected',
  'revision_requested',
  'completed'
);

// Reviewer Role enum validation
const reviewerRoleSchema = Joi.string().valid(
  'subject_matter_expert',
  'technical_reviewer',
  'compliance_officer',
  'project_manager',
  'business_analyst',
  'quality_assurance',
  'stakeholder'
);

// Review Priority enum validation
const reviewPrioritySchema = Joi.string().valid('low', 'medium', 'high', 'critical');

// Feedback Type enum validation
const feedbackTypeSchema = Joi.string().valid(
  'content_accuracy',
  'technical_compliance',
  'formatting',
  'completeness',
  'clarity',
  'stakeholder_alignment',
  'regulatory_compliance'
);

// Review Decision enum validation
const reviewDecisionSchema = Joi.string().valid('approve', 'reject', 'request_revision');

// Create Review Request Schema
export const createReviewSchema = Joi.object({
  documentId: Joi.string().required(),
  documentName: Joi.string().required(),
  documentType: Joi.string().required(),
  documentPath: Joi.string().required(),
  projectId: Joi.string().required(),
  priority: reviewPrioritySchema.default('medium'),
  dueDate: Joi.date().iso().optional(),
  requiredRoles: Joi.array().items(reviewerRoleSchema).optional(),
  specificReviewers: Joi.array().items(Joi.string()).optional(),
  workflowId: Joi.string().optional(),
  metadata: Joi.object().optional()
});

// Assign Reviewer Request Schema
export const assignReviewerSchema = Joi.object({
  reviewerId: Joi.string().required(),
  role: reviewerRoleSchema.required(),
  estimatedHours: Joi.number().min(1).max(40).optional(),
  dueDate: Joi.date().iso().optional()
});

// Review Feedback Schema
const reviewFeedbackSchema = Joi.object({
  type: feedbackTypeSchema.required(),
  severity: Joi.string().valid('info', 'minor', 'major', 'critical').required(),
  section: Joi.string().optional(),
  lineNumber: Joi.number().min(1).optional(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  suggestion: Joi.string().optional(),
  originalText: Joi.string().optional(),
  suggestedText: Joi.string().optional()
});

// Submit Feedback Request Schema
export const submitFeedbackSchema = Joi.object({
  roundNumber: Joi.number().min(1).required(),
  feedback: Joi.array().items(reviewFeedbackSchema).required(),
  decision: reviewDecisionSchema.required(),
  overallComments: Joi.string().optional(),
  qualityScore: Joi.number().min(0).max(100).optional()
});

// Update Review Status Schema
export const updateReviewStatusSchema = Joi.object({
  status: reviewStatusSchema.required(),
  comments: Joi.string().optional()
});

// Review Search Parameters Schema
export const reviewSearchSchema = Joi.object({
  status: Joi.alternatives().try(
    reviewStatusSchema,
    Joi.array().items(reviewStatusSchema)
  ).optional(),
  priority: Joi.alternatives().try(
    reviewPrioritySchema,
    Joi.array().items(reviewPrioritySchema)
  ).optional(),
  documentType: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  projectId: Joi.string().optional(),
  reviewerId: Joi.string().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  limit: Joi.number().min(1).max(100).default(20),
  offset: Joi.number().min(0).default(0),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'priority', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Reviewer Profile Schemas
export const createReviewerProfileSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  title: Joi.string().required(),
  department: Joi.string().required(),
  organization: Joi.string().required(),
  roles: Joi.array().items(reviewerRoleSchema).min(1).required(),
  expertise: Joi.array().items(Joi.string()).min(1).required(),
  certifications: Joi.array().items(Joi.string()).default([]),
  experienceYears: Joi.number().min(0).required(),
  availability: Joi.object({
    hoursPerWeek: Joi.number().min(1).max(168).required(),
    timeZone: Joi.string().required(),
    workingHours: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    }).required(),
    workingDays: Joi.array().items(Joi.number().min(0).max(6)).required(),
    unavailableDates: Joi.array().items(Joi.date().iso()).default([]),
    maxConcurrentReviews: Joi.number().min(1).default(3)
  }).optional(),
  preferences: Joi.object({
    preferredDocumentTypes: Joi.array().items(Joi.string()).default([]),
    preferredProjectTypes: Joi.array().items(Joi.string()).default([]),
    notificationPreferences: Joi.object({
      email: Joi.boolean().default(true),
      inApp: Joi.boolean().default(true),
      sms: Joi.boolean().default(false)
    }).default(),
    reminderFrequency: Joi.string().valid('none', 'daily', 'weekly').default('daily')
  }).optional()
});

export const updateReviewerProfileSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  title: Joi.string().optional(),
  department: Joi.string().optional(),
  organization: Joi.string().optional(),
  roles: Joi.array().items(reviewerRoleSchema).min(1).optional(),
  expertise: Joi.array().items(Joi.string()).min(1).optional(),
  certifications: Joi.array().items(Joi.string()).optional(),
  experienceYears: Joi.number().min(0).optional(),
  availability: Joi.object({
    hoursPerWeek: Joi.number().min(1).max(168).optional(),
    timeZone: Joi.string().optional(),
    workingHours: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
    }).optional(),
    workingDays: Joi.array().items(Joi.number().min(0).max(6)).optional(),
    unavailableDates: Joi.array().items(Joi.date().iso()).optional(),
    maxConcurrentReviews: Joi.number().min(1).optional()
  }).optional(),
  preferences: Joi.object({
    preferredDocumentTypes: Joi.array().items(Joi.string()).optional(),
    preferredProjectTypes: Joi.array().items(Joi.string()).optional(),
    notificationPreferences: Joi.object({
      email: Joi.boolean().optional(),
      inApp: Joi.boolean().optional(),
      sms: Joi.boolean().optional()
    }).optional(),
    reminderFrequency: Joi.string().valid('none', 'daily', 'weekly').optional()
  }).optional(),
  isActive: Joi.boolean().optional()
});

export const updateAvailabilitySchema = Joi.object({
  hoursPerWeek: Joi.number().min(1).max(168).required(),
  timeZone: Joi.string().required(),
  workingHours: Joi.object({
    start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
  }).required(),
  workingDays: Joi.array().items(Joi.number().min(0).max(6)).required(),
  unavailableDates: Joi.array().items(Joi.date().iso()).default([]),
  maxConcurrentReviews: Joi.number().min(1).required()
});

export const updatePreferencesSchema = Joi.object({
  preferredDocumentTypes: Joi.array().items(Joi.string()).required(),
  preferredProjectTypes: Joi.array().items(Joi.string()).required(),
  notificationPreferences: Joi.object({
    email: Joi.boolean().required(),
    inApp: Joi.boolean().required(),
    sms: Joi.boolean().required()
  }).required(),
  reminderFrequency: Joi.string().valid('none', 'daily', 'weekly').required()
});

// Reviewer Search Parameters Schema
export const reviewerSearchSchema = Joi.object({
  roles: Joi.alternatives().try(
    reviewerRoleSchema,
    Joi.array().items(reviewerRoleSchema)
  ).optional(),
  expertise: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  department: Joi.string().optional(),
  organization: Joi.string().optional(),
  minExperience: Joi.number().min(0).optional(),
  minQualityScore: Joi.number().min(0).max(100).optional(),
  limit: Joi.number().min(1).max(100).default(20),
  offset: Joi.number().min(0).default(0),
  sortBy: Joi.string().default('metrics.averageQualityScore'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Available Reviewers Query Schema
export const availableReviewersSchema = Joi.object({
  role: reviewerRoleSchema.required(),
  documentType: Joi.string().optional()
});

// Analytics Query Schema
export const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional()
});

// Review Stats Query Schema
export const reviewStatsSchema = Joi.object({
  projectId: Joi.string().optional(),
  reviewerId: Joi.string().optional()
});

// Leaderboard Query Schema
export const leaderboardQuerySchema = Joi.object({
  metric: Joi.string().valid(
    'averageQualityScore',
    'onTimeCompletionRate',
    'completedReviews',
    'feedbackQualityScore',
    'thoroughnessScore'
  ).default('averageQualityScore'),
  limit: Joi.number().min(1).max(50).default(10)
});