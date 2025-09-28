import mongoose, { Schema, Document } from 'mongoose';
import {
  DocumentReview,
  ReviewerAssignment,
  ReviewRound,
  ReviewFeedback,
  ReviewAttachment,
  AutomatedCheckResult,
  ReviewStatus,
  ReviewerRole,
  ReviewPriority,
  FeedbackType,
  ReviewDecision
} from '../types/review.js';

// Document Review Schema
export interface IDocumentReview extends Omit<DocumentReview, 'id'>, Document {
  id: string;
}

const ReviewFeedbackSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['content_accuracy', 'technical_compliance', 'formatting', 'completeness', 'clarity', 'stakeholder_alignment', 'regulatory_compliance'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['info', 'minor', 'major', 'critical'],
    required: true 
  },
  section: String,
  lineNumber: Number,
  title: { type: String, required: true },
  description: { type: String, required: true },
  suggestion: String,
  originalText: String,
  suggestedText: String,
  status: { 
    type: String, 
    enum: ['open', 'addressed', 'dismissed', 'deferred'],
    default: 'open' 
  },
  addressedBy: String,
  addressedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ReviewAttachmentSchema = new Schema({
  id: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  description: String
});

const ReviewRoundSchema = new Schema({
  roundNumber: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  completedAt: Date,
  reviewerId: { type: String, required: true },
  reviewerName: { type: String, required: true },
  feedback: [ReviewFeedbackSchema],
  decision: { 
    type: String, 
    enum: ['approve', 'reject', 'request_revision'],
    required: true 
  },
  overallComments: String,
  qualityScore: { type: Number, min: 0, max: 100 },
  complianceScore: { type: Number, min: 0, max: 100 },
  attachments: [ReviewAttachmentSchema],
  references: [String]
});

const ReviewerAssignmentSchema = new Schema({
  reviewerId: { type: String, required: true },
  reviewerName: { type: String, required: true },
  reviewerEmail: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['subject_matter_expert', 'technical_reviewer', 'compliance_officer', 'project_manager', 'business_analyst', 'quality_assurance', 'stakeholder'],
    required: true 
  },
  expertise: [String],
  assignedAt: { type: Date, default: Date.now },
  notifiedAt: Date,
  acceptedAt: Date,
  status: { 
    type: String, 
    enum: ['assigned', 'accepted', 'declined', 'completed'],
    default: 'assigned' 
  },
  estimatedHours: Number
});

const AutomatedCheckResultSchema = new Schema({
  checkType: { type: String, required: true },
  checkName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['passed', 'failed', 'warning'],
    required: true 
  },
  score: { type: Number, min: 0, max: 100 },
  details: { type: String, required: true },
  recommendations: [String],
  executedAt: { type: Date, default: Date.now }
});

const DocumentReviewSchema = new Schema({
  documentId: { type: String, required: true, index: true },
  documentName: { type: String, required: true },
  documentType: { type: String, required: true, index: true },
  documentPath: { type: String, required: true },
  projectId: { type: String, required: true, index: true },
  projectName: { type: String, required: true },
  
  // Review metadata
  status: { 
    type: String, 
    enum: ['pending_assignment', 'assigned', 'in_review', 'feedback_provided', 'approved', 'rejected', 'revision_requested', 'completed'],
    default: 'pending_assignment',
    index: true
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  dueDate: { type: Date, index: true },
  
  // Reviewer information
  assignedReviewers: [ReviewerAssignmentSchema],
  currentReviewer: String,
  
  // Review progress
  reviewRounds: [ReviewRoundSchema],
  currentRound: { type: Number, default: 0 },
  
  // Timestamps
  submittedAt: Date,
  completedAt: Date,
  
  // Metadata
  metadata: {
    generationJobId: String,
    complianceScore: { type: Number, min: 0, max: 100 },
    automatedChecks: [AutomatedCheckResultSchema],
    tags: [String]
  }
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
DocumentReviewSchema.index({ status: 1, priority: 1 });
DocumentReviewSchema.index({ projectId: 1, status: 1 });
DocumentReviewSchema.index({ 'assignedReviewers.reviewerId': 1 });
DocumentReviewSchema.index({ dueDate: 1, status: 1 });
DocumentReviewSchema.index({ createdAt: -1 });
DocumentReviewSchema.index({ documentType: 1, status: 1 });

// Virtual for overdue status
DocumentReviewSchema.virtual('isOverdue').get(function(this: IDocumentReview) {
  if (!this.dueDate || this.status === 'completed' || this.status === 'approved') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for current reviewer info
DocumentReviewSchema.virtual('currentReviewerInfo').get(function(this: IDocumentReview) {
  if (!this.currentReviewer) return null;
  return this.assignedReviewers.find(r => r.reviewerId === this.currentReviewer);
});

// Virtual for latest feedback
DocumentReviewSchema.virtual('latestFeedback').get(function(this: IDocumentReview) {
  if (this.reviewRounds.length === 0) return [];
  const latestRound = this.reviewRounds[this.reviewRounds.length - 1];
  return latestRound.feedback;
});

// Pre-save middleware
DocumentReviewSchema.pre('save', function(this: IDocumentReview, next: any) {
  // Update current round number
  if (this.reviewRounds.length > 0) {
    this.currentRound = Math.max(...this.reviewRounds.map(r => r.roundNumber));
  }
  
  // Set completion timestamp
  if (this.status === 'completed' || this.status === 'approved') {
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  }
  
  next();
});

const DocumentReviewModel = mongoose.model<IDocumentReview>('DocumentReview', DocumentReviewSchema);

export default DocumentReviewModel;
export { DocumentReviewModel };