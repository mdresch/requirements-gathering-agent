import { ReviewService } from './ReviewService.js';
import { DocumentGenerator, GenerationResult } from '../modules/documentGenerator/DocumentGenerator.js';
import { 
  CreateReviewRequest, 
  ReviewPriority, 
  ReviewerRole,
  DocumentReview 
} from '../types/review.js';
import { logger } from '../utils/logger.js';
import path from 'path';

export interface DocumentGenerationWithReviewOptions {
  projectId: string;
  projectName: string;
  context: string;
  
  // Review configuration
  enableReview: boolean;
  reviewPriority: ReviewPriority;
  requiredRoles?: ReviewerRole[];
  specificReviewers?: string[];
  workflowId?: string;
  autoSubmitForReview: boolean;
  
  // Document generation options
  generateAll?: boolean;
  documentKeys?: string[];
  
  // Notification settings
  notifyOnCompletion?: boolean;
  notificationRecipients?: string[];
}

export interface DocumentGenerationWithReviewResult {
  generationResult: GenerationResult;
  reviewsCreated: DocumentReview[];
  errors: string[];
  summary: {
    documentsGenerated: number;
    reviewsCreated: number;
    documentsSubmittedForReview: number;
    documentsSkippedReview: number;
  };
}

export class DocumentReviewIntegration {
  private reviewService: ReviewService;
  
  constructor() {
    this.reviewService = new ReviewService();
  }
  
  /**
   * Generate documents and automatically create review requests
   */
  async generateDocumentsWithReview(
    options: DocumentGenerationWithReviewOptions
  ): Promise<DocumentGenerationWithReviewResult> {
    logger.info(`Starting document generation with review for project: ${options.projectName}`);
    
    const result: DocumentGenerationWithReviewResult = {
      generationResult: {
        success: false,
        successCount: 0,
        failureCount: 0,
        generatedFiles: [],
        errors: [],
        duration: 0,
        message: ''
      },
      reviewsCreated: [],
      errors: [],
      summary: {
        documentsGenerated: 0,
        reviewsCreated: 0,
        documentsSubmittedForReview: 0,
        documentsSkippedReview: 0
      }
    };
    
    try {
      // Step 1: Generate documents
      const generator = new DocumentGenerator(options.context);
      
      let generationResult: GenerationResult;
      if (options.generateAll) {
        generationResult = await generator.generateAll();
      } else if (options.documentKeys?.length) {
        // Generate specific documents
        generationResult = {
          success: true,
          successCount: 0,
          failureCount: 0,
          generatedFiles: [],
          errors: [],
          duration: 0,
          message: ''
        };
        
        const startTime = Date.now();
        for (const documentKey of options.documentKeys) {
          const success = await generator.generateOne(documentKey);
          if (success) {
            generationResult.successCount++;
            generationResult.generatedFiles.push(`${documentKey}.md`);
          } else {
            generationResult.failureCount++;
            generationResult.errors.push({ task: documentKey, error: 'Generation failed' });
          }
        }
        generationResult.duration = Date.now() - startTime;
        generationResult.success = generationResult.successCount > 0;
        generationResult.message = `Generated ${generationResult.successCount} documents`;
      } else {
        throw new Error('Either generateAll must be true or documentKeys must be provided');
      }
      
      result.generationResult = generationResult;
      result.summary.documentsGenerated = generationResult.successCount;
      
      // Step 2: Create review requests for generated documents (if enabled)
      if (options.enableReview && generationResult.success) {
        await this.createReviewsForGeneratedDocuments(
          generationResult,
          options,
          result
        );
      }
      
      // Step 3: Send notifications if configured
      if (options.notifyOnCompletion) {
        await this.sendCompletionNotifications(options, result);
      }
      
      logger.info(`Document generation with review completed. Generated: ${result.summary.documentsGenerated}, Reviews: ${result.summary.reviewsCreated}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error in document generation with review:', error);
      result.errors.push(errorMessage);
      result.generationResult.success = false;
      result.generationResult.message = `Failed: ${errorMessage}`;
    }
    
    return result;
  }
  
  /**
   * Create review requests for successfully generated documents
   */
  private async createReviewsForGeneratedDocuments(
    generationResult: GenerationResult,
    options: DocumentGenerationWithReviewOptions,
    result: DocumentGenerationWithReviewResult
  ): Promise<void> {
    logger.info(`Creating reviews for ${generationResult.generatedFiles.length} generated documents`);
    
    for (const filePath of generationResult.generatedFiles) {
      try {
        const documentInfo = this.extractDocumentInfo(filePath);
        
        // Skip if document type should not be reviewed
        if (!this.shouldCreateReview(documentInfo.type, options)) {
          result.summary.documentsSkippedReview++;
          continue;
        }
        
        const reviewRequest: CreateReviewRequest = {
          documentId: this.generateDocumentId(options.projectId, documentInfo.name),
          documentName: documentInfo.name,
          documentType: documentInfo.type,
          documentPath: path.join(process.cwd(), 'generated-documents', filePath),
          projectId: options.projectId,
          priority: options.reviewPriority,
          requiredRoles: options.requiredRoles,
          specificReviewers: options.specificReviewers,
          workflowId: options.workflowId,
          metadata: {
            generatedAt: new Date().toISOString(),
            projectName: options.projectName,
            generationContext: options.context,
            autoGenerated: true
          }
        };
        
        const review = await this.reviewService.createReview(reviewRequest);
        result.reviewsCreated.push(review);
        result.summary.reviewsCreated++;
        
        if (options.autoSubmitForReview) {
          result.summary.documentsSubmittedForReview++;
        }
        
        logger.info(`Review created for document: ${documentInfo.name} (ID: ${review.id})`);
        
      } catch (error) {
        const errorMessage = `Failed to create review for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        logger.error(errorMessage);
        result.errors.push(errorMessage);
      }
    }
  }
  
  /**
   * Extract document information from file path
   */
  private extractDocumentInfo(filePath: string): { name: string; type: string; category: string } {
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const category = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'general';
    
    // Remove file extension
    const name = fileName.replace(/\.[^/.]+$/, '');
    
    // Determine document type based on category and name
    let type = 'general';
    
    if (category.includes('pmbok')) {
      type = 'pmbok_document';
    } else if (category.includes('babok')) {
      type = 'babok_document';
    } else if (category.includes('dmbok')) {
      type = 'dmbok_document';
    } else if (category.includes('technical')) {
      type = 'technical_document';
    } else if (category.includes('planning')) {
      type = 'planning_document';
    } else if (category.includes('management')) {
      type = 'management_plan';
    } else if (category.includes('stakeholder')) {
      type = 'stakeholder_document';
    } else if (category.includes('quality')) {
      type = 'quality_document';
    } else if (category.includes('risk')) {
      type = 'risk_document';
    }
    
    return {
      name: this.formatDocumentName(name),
      type,
      category
    };
  }
  
  /**
   * Format document name for display
   */
  private formatDocumentName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Generate unique document ID
   */
  private generateDocumentId(projectId: string, documentName: string): string {
    const timestamp = Date.now();
    const sanitizedName = documentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${projectId}-${sanitizedName}-${timestamp}`;
  }
  
  /**
   * Determine if a review should be created for a document type
   */
  private shouldCreateReview(documentType: string, options: DocumentGenerationWithReviewOptions): boolean {
    // Skip review for certain document types if configured
    const skipReviewTypes = [
      'index',
      'readme',
      'summary'
    ];
    
    if (skipReviewTypes.some(skipType => documentType.toLowerCase().includes(skipType))) {
      return false;
    }
    
    // Always create reviews for critical document types
    const criticalTypes = [
      'pmbok_document',
      'babok_document',
      'technical_document',
      'management_plan'
    ];
    
    if (criticalTypes.includes(documentType)) {
      return true;
    }
    
    // Default to creating reviews for all other types
    return true;
  }
  
  /**
   * Send completion notifications
   */
  private async sendCompletionNotifications(
    options: DocumentGenerationWithReviewOptions,
    result: DocumentGenerationWithReviewResult
  ): Promise<void> {
    try {
      logger.info(`Sending completion notifications for project: ${options.projectName}`);
      
      // This would integrate with a notification service
      const notificationData = {
        projectId: options.projectId,
        projectName: options.projectName,
        summary: result.summary,
        recipients: options.notificationRecipients || [],
        generationSuccess: result.generationResult.success,
        reviewsCreated: result.reviewsCreated.length,
        errors: result.errors
      };
      
      // Placeholder for notification service integration
      logger.info('Notification data prepared:', notificationData);
      
    } catch (error) {
      logger.error('Error sending completion notifications:', error);
    }
  }
  
  /**
   * Get review status for a project's documents
   */
  async getProjectReviewStatus(projectId: string): Promise<{
    totalDocuments: number;
    pendingReviews: number;
    completedReviews: number;
    approvedDocuments: number;
    rejectedDocuments: number;
    overallStatus: 'pending' | 'in_progress' | 'completed' | 'mixed';
  }> {
    try {
      const { reviews } = await this.reviewService.searchReviews({
        projectId,
        limit: 1000,
        offset: 0
      });
      
      const totalDocuments = reviews.length;
      const pendingReviews = reviews.filter(r => 
        ['pending_assignment', 'assigned', 'in_review'].includes(r.status)
      ).length;
      const completedReviews = reviews.filter(r => 
        ['approved', 'rejected', 'completed'].includes(r.status)
      ).length;
      const approvedDocuments = reviews.filter(r => r.status === 'approved').length;
      const rejectedDocuments = reviews.filter(r => r.status === 'rejected').length;
      
      let overallStatus: 'pending' | 'in_progress' | 'completed' | 'mixed' = 'pending';
      
      if (completedReviews === totalDocuments && totalDocuments > 0) {
        overallStatus = 'completed';
      } else if (completedReviews > 0) {
        overallStatus = 'mixed';
      } else if (pendingReviews > 0) {
        overallStatus = 'in_progress';
      }
      
      return {
        totalDocuments,
        pendingReviews,
        completedReviews,
        approvedDocuments,
        rejectedDocuments,
        overallStatus
      };
      
    } catch (error) {
      logger.error('Error getting project review status:', error);
      throw error;
    }
  }
  
  /**
   * Regenerate document after review feedback
   */
  async regenerateDocumentWithFeedback(
    reviewId: string,
    documentKey: string,
    context: string
  ): Promise<{ success: boolean; newReviewId?: string; error?: string }> {
    try {
      logger.info(`Regenerating document with feedback for review: ${reviewId}`);
      
      // Get the review to access feedback
      const review = await this.reviewService.getReview(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }
      
      // Extract feedback for context enhancement
      const feedbackContext = this.extractFeedbackContext(review);
      const enhancedContext = `${context}\n\nFeedback to address:\n${feedbackContext}`;
      
      // Regenerate the document
      const generator = new DocumentGenerator(enhancedContext);
      const success = await generator.generateOne(documentKey);
      
      if (!success) {
        return { success: false, error: 'Document regeneration failed' };
      }
      
      // Create a new review for the regenerated document
      const newReviewRequest: CreateReviewRequest = {
        documentId: `${review.documentId}-revision-${Date.now()}`,
        documentName: `${review.documentName} (Revised)`,
        documentType: review.documentType,
        documentPath: review.documentPath,
        projectId: review.projectId,
        priority: review.priority,
        metadata: {
          ...review.metadata,
          originalReviewId: reviewId,
          regeneratedAt: new Date().toISOString(),
          feedbackAddressed: true
        }
      };
      
      const newReview = await this.reviewService.createReview(newReviewRequest);
      
      // Update original review status
      await this.reviewService.updateReviewStatus({
        reviewId,
        status: 'completed',
        comments: `Document regenerated. New review created: ${newReview.id}`
      });
      
      logger.info(`Document regenerated successfully. New review: ${newReview.id}`);
      
      return { success: true, newReviewId: newReview.id };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error regenerating document with feedback:', error);
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Extract feedback context for document regeneration
   */
  private extractFeedbackContext(review: DocumentReview): string {
    const feedbackItems: string[] = [];
    
    review.reviewRounds.forEach(round => {
      round.feedback.forEach(feedback => {
        if (feedback.status === 'open' && feedback.severity !== 'info') {
          let item = `- ${feedback.title}: ${feedback.description}`;
          if (feedback.suggestion) {
            item += ` Suggestion: ${feedback.suggestion}`;
          }
          feedbackItems.push(item);
        }
      });
    });
    
    return feedbackItems.join('\n');
  }
  
  /**
   * Bulk approve documents after successful review
   */
  async bulkApproveDocuments(projectId: string, documentIds: string[]): Promise<{
    approved: string[];
    failed: string[];
    errors: string[];
  }> {
    const result = {
      approved: [] as string[],
      failed: [] as string[],
      errors: [] as string[]
    };
    
    try {
      for (const documentId of documentIds) {
        try {
          // Find review by document ID
          const { reviews } = await this.reviewService.searchReviews({
            projectId,
            limit: 1,
            offset: 0
          });
          
          const review = reviews.find(r => r.documentId === documentId);
          if (!review) {
            result.failed.push(documentId);
            result.errors.push(`Review not found for document: ${documentId}`);
            continue;
          }
          
          if (review.status !== 'approved') {
            await this.reviewService.updateReviewStatus({
              reviewId: review.id,
              status: 'approved',
              comments: 'Bulk approved'
            });
          }
          
          result.approved.push(documentId);
          
        } catch (error) {
          result.failed.push(documentId);
          result.errors.push(`Failed to approve ${documentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      logger.info(`Bulk approval completed. Approved: ${result.approved.length}, Failed: ${result.failed.length}`);
      
    } catch (error) {
      logger.error('Error in bulk approve documents:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }
    
    return result;
  }
}