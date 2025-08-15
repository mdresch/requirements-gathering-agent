/**
 * Human-in-the-Loop Document Review Types
 * Type definitions for document review and verification workflow
 */

export type ReviewStatus = 
  | 'pending_assignment'
  | 'assigned'
  | 'in_review'
  | 'feedback_provided'
  | 'approved'
  | 'rejected'
  | 'revision_requested'
  | 'completed';

export type ReviewerRole = 
  | 'subject_matter_expert'
  | 'technical_reviewer'
  | 'compliance_officer'
  | 'project_manager'
  | 'business_analyst'
  | 'quality_assurance'
  | 'stakeholder';

export type ReviewPriority = 'low' | 'medium' | 'high' | 'critical';

export type FeedbackType = 
  | 'content_accuracy'
  | 'technical_compliance'
  | 'formatting'
  | 'completeness'
  | 'clarity'
  | 'stakeholder_alignment'
  | 'regulatory_compliance';

export type ReviewDecision = 'approve' | 'reject' | 'request_revision';

/**
 * Interface for document review request
 */
export interface DocumentReview {
  id: string;
  documentId: string;
  documentName: string;
  documentType: string;
  documentPath: string;
  projectId: string;
  projectName: string;
  
  // Review metadata
  status: ReviewStatus;
  priority: ReviewPriority;
  dueDate?: Date;
  
  // Reviewer information
  assignedReviewers: ReviewerAssignment[];
  currentReviewer?: string;
  
  // Review progress
  reviewRounds: ReviewRound[];
  currentRound: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
  
  // Metadata
  metadata: {
    generationJobId?: string;
    complianceScore?: number;
    automatedChecks?: AutomatedCheckResult[];
    tags?: string[];
  };
}

/**
 * Interface for reviewer assignment
 */
export interface ReviewerAssignment {
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  role: ReviewerRole;
  expertise: string[];
  assignedAt: Date;
  notifiedAt?: Date;
  acceptedAt?: Date;
  status: 'assigned' | 'accepted' | 'declined' | 'completed';
  estimatedHours?: number;
}

/**
 * Interface for review round
 */
export interface ReviewRound {
  roundNumber: number;
  startedAt: Date;
  completedAt?: Date;
  reviewerId: string;
  reviewerName: string;
  
  // Review content
  feedback: ReviewFeedback[];
  decision: ReviewDecision;
  overallComments?: string;
  
  // Quality assessment
  qualityScore?: number;
  complianceScore?: number;
  
  // Attachments and references
  attachments?: ReviewAttachment[];
  references?: string[];
}

/**
 * Interface for review feedback
 */
export interface ReviewFeedback {
  id: string;
  type: FeedbackType;
  severity: 'info' | 'minor' | 'major' | 'critical';
  section?: string;
  lineNumber?: number;
  
  // Feedback content
  title: string;
  description: string;
  suggestion?: string;
  
  // Context
  originalText?: string;
  suggestedText?: string;
  
  // Status
  status: 'open' | 'addressed' | 'dismissed' | 'deferred';
  addressedBy?: string;
  addressedAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for review attachments
 */
export interface ReviewAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
}

/**
 * Interface for automated check results
 */
export interface AutomatedCheckResult {
  checkType: string;
  checkName: string;
  status: 'passed' | 'failed' | 'warning';
  score?: number;
  details: string;
  recommendations?: string[];
  executedAt: Date;
}

/**
 * Interface for review template/criteria
 */
export interface ReviewCriteria {
  id: string;
  name: string;
  description: string;
  documentTypes: string[];
  
  // Criteria definition
  criteria: ReviewCriterion[];
  
  // Scoring
  passingScore: number;
  weightedScoring: boolean;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Interface for individual review criterion
 */
export interface ReviewCriterion {
  id: string;
  name: string;
  description: string;
  category: FeedbackType;
  weight: number;
  required: boolean;
  
  // Evaluation guidelines
  guidelines: string;
  examples?: string[];
  
  // Scoring
  maxScore: number;
  passingScore: number;
}

/**
 * Interface for reviewer profile
 */
export interface ReviewerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  
  // Professional information
  title: string;
  department: string;
  organization: string;
  
  // Expertise and qualifications
  roles: ReviewerRole[];
  expertise: string[];
  certifications: string[];
  experienceYears: number;
  
  // Availability and preferences
  availability: ReviewerAvailability;
  preferences: ReviewerPreferences;
  
  // Performance metrics
  metrics: ReviewerMetrics;
  
  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for reviewer availability
 */
export interface ReviewerAvailability {
  hoursPerWeek: number;
  timeZone: string;
  workingHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  workingDays: number[]; // 0-6, Sunday = 0
  unavailableDates: Date[];
  maxConcurrentReviews: number;
}

/**
 * Interface for reviewer preferences
 */
export interface ReviewerPreferences {
  preferredDocumentTypes: string[];
  preferredProjectTypes: string[];
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
  reminderFrequency: 'none' | 'daily' | 'weekly';
}

/**
 * Interface for reviewer performance metrics
 */
export interface ReviewerMetrics {
  totalReviews: number;
  completedReviews: number;
  averageReviewTime: number; // in hours
  averageQualityScore: number;
  onTimeCompletionRate: number;
  
  // Recent performance
  last30DaysReviews: number;
  last30DaysAvgTime: number;
  
  // Quality metrics
  feedbackQualityScore: number;
  thoroughnessScore: number;
  
  // Updated timestamp
  lastUpdated: Date;
}

/**
 * Interface for review workflow configuration
 */
export interface ReviewWorkflowConfig {
  id: string;
  name: string;
  description: string;
  
  // Workflow definition
  documentTypes: string[];
  requiredRoles: ReviewerRole[];
  reviewStages: ReviewStage[];
  
  // Timing and escalation
  defaultDueDays: number;
  escalationRules: EscalationRule[];
  
  // Quality gates
  minimumReviewers: number;
  requiredApprovals: number;
  qualityThreshold: number;
  
  // Automation
  autoAssignment: boolean;
  autoEscalation: boolean;
  autoNotification: boolean;
  
  // Status
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for review stage definition
 */
export interface ReviewStage {
  stageNumber: number;
  name: string;
  description: string;
  requiredRole?: ReviewerRole;
  requiredExpertise?: string[];
  
  // Stage configuration
  isParallel: boolean;
  isOptional: boolean;
  canSkip: boolean;
  
  // Timing
  estimatedHours: number;
  maxDays: number;
  
  // Criteria
  criteria: string[]; // Reference to ReviewCriteria IDs
  passingScore: number;
}

/**
 * Interface for escalation rules
 */
export interface EscalationRule {
  id: string;
  name: string;
  condition: EscalationCondition;
  action: EscalationAction;
  
  // Timing
  triggerAfterHours: number;
  reminderIntervalHours: number;
  maxReminders: number;
  
  // Recipients
  escalateTo: string[]; // User IDs or roles
  notificationTemplate: string;
  
  // Status
  isActive: boolean;
}

/**
 * Interface for escalation conditions
 */
export interface EscalationCondition {
  type: 'overdue' | 'no_response' | 'quality_threshold' | 'custom';
  parameters: Record<string, any>;
}

/**
 * Interface for escalation actions
 */
export interface EscalationAction {
  type: 'notify' | 'reassign' | 'auto_approve' | 'escalate_manager' | 'custom';
  parameters: Record<string, any>;
}

/**
 * Interface for review analytics and reporting
 */
export interface ReviewAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  
  // Volume metrics
  totalReviews: number;
  completedReviews: number;
  pendingReviews: number;
  overdueReviews: number;
  
  // Performance metrics
  averageReviewTime: number;
  onTimeCompletionRate: number;
  averageQualityScore: number;
  
  // Reviewer metrics
  activeReviewers: number;
  reviewerUtilization: number;
  topPerformers: ReviewerMetrics[];
  
  // Document metrics
  documentTypeBreakdown: Record<string, number>;
  qualityTrends: QualityTrend[];
  
  // Issues and improvements
  commonIssues: FeedbackSummary[];
  improvementAreas: string[];
}

/**
 * Interface for quality trends
 */
export interface QualityTrend {
  date: Date;
  averageScore: number;
  reviewCount: number;
  documentType?: string;
}

/**
 * Interface for feedback summary
 */
export interface FeedbackSummary {
  type: FeedbackType;
  count: number;
  severity: 'info' | 'minor' | 'major' | 'critical';
  commonPatterns: string[];
  recommendations: string[];
}

/**
 * Interface for review notification
 */
export interface ReviewNotification {
  id: string;
  type: 'assignment' | 'reminder' | 'escalation' | 'completion' | 'feedback';
  reviewId: string;
  recipientId: string;
  
  // Content
  title: string;
  message: string;
  actionUrl?: string;
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: Date;
  readAt?: Date;
  
  // Metadata
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Interface for review dashboard data
 */
export interface ReviewDashboard {
  userId: string;
  
  // Personal metrics
  assignedReviews: DocumentReview[];
  pendingReviews: DocumentReview[];
  completedReviews: DocumentReview[];
  overdueReviews: DocumentReview[];
  
  // Performance summary
  personalMetrics: ReviewerMetrics;
  
  // Workload
  currentWorkload: number;
  upcomingDeadlines: Date[];
  
  // Notifications
  unreadNotifications: ReviewNotification[];
  
  // Quick actions
  quickActions: QuickAction[];
}

/**
 * Interface for quick actions
 */
export interface QuickAction {
  id: string;
  type: 'review' | 'approve' | 'feedback' | 'escalate';
  title: string;
  description: string;
  url: string;
  priority: ReviewPriority;
}

/**
 * Request/Response interfaces for API
 */

export interface CreateReviewRequest {
  documentId: string;
  documentName: string;
  documentType: string;
  documentPath: string;
  projectId: string;
  priority: ReviewPriority;
  dueDate?: Date;
  requiredRoles?: ReviewerRole[];
  specificReviewers?: string[];
  workflowId?: string;
  metadata?: Record<string, any>;
}

export interface AssignReviewerRequest {
  reviewId: string;
  reviewerId: string;
  role: ReviewerRole;
  estimatedHours?: number;
  dueDate?: Date;
}

export interface SubmitFeedbackRequest {
  reviewId: string;
  roundNumber: number;
  feedback: Omit<ReviewFeedback, 'id' | 'createdAt' | 'updatedAt'>[];
  decision: ReviewDecision;
  overallComments?: string;
  qualityScore?: number;
  attachments?: File[];
}

export interface UpdateReviewStatusRequest {
  reviewId: string;
  status: ReviewStatus;
  comments?: string;
}

export interface ReviewSearchParams {
  status?: ReviewStatus[];
  priority?: ReviewPriority[];
  documentType?: string[];
  projectId?: string;
  reviewerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewResponse {
  review: DocumentReview;
  permissions: ReviewPermissions;
}

export interface ReviewPermissions {
  canEdit: boolean;
  canAssign: boolean;
  canApprove: boolean;
  canReject: boolean;
  canEscalate: boolean;
  canViewFeedback: boolean;
  canAddFeedback: boolean;
}

export interface ReviewListResponse {
  reviews: DocumentReview[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ReviewAnalyticsResponse {
  analytics: ReviewAnalytics;
  generatedAt: Date;
}