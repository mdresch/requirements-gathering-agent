import { Request, Response, NextFunction } from 'express';
import { DocumentReviewIntegration, DocumentGenerationWithReviewOptions } from '../../services/DocumentReviewIntegration.js';
import { logger } from '../../utils/logger.js';

export class DocumentGenerationController {
  private static integrationService = new DocumentReviewIntegration()

  /**
   * Determines if a document type requires stakeholder context
   */
  private static documentRequiresStakeholderContext(documentType: string): boolean {
    const stakeholderCriticalDocuments = [
      'project-charter',
      'stakeholder-engagement-plan',
      'stakeholder-analysis',
      'stakeholder-register',
      'communication-management-plan',
      'project-management-plan',
      'business-case',
      'requirements-documentation',
      'acceptance-criteria',
      'change-request',
      'risk-management-plan',
      'quality-management-plan',
      'procurement-management-plan',
      'scope-management-plan',
      'schedule-management-plan',
      'cost-management-plan',
      'resource-management-plan'
    ];
    
    return stakeholderCriticalDocuments.includes(documentType);
  }

  /**
   * Load existing stakeholders and inject them as context for LLM generation
   * This is especially important for documents requiring stakeholder sign-offs or approvals
   */
  private static async loadProjectStakeholdersAsContext(projectId: string, documentTypes?: string[]): Promise<void> {
    try {
      // Check if any of the documents being generated require stakeholder context
      const requiresStakeholderContext = documentTypes ? 
        documentTypes.some(docType => this.documentRequiresStakeholderContext(docType)) : 
        true; // Default to true if no specific document types provided
      
      if (!requiresStakeholderContext) {
        console.log('👥 Skipping stakeholder context injection - no stakeholder-critical documents being generated');
        return;
      }
      
      console.log(`👥 Loading stakeholders for project ${projectId} as context...`);
      
      // Import Stakeholder model
      const { Stakeholder } = await import('../../models/Stakeholder.js');
      
      // Find all active stakeholders for this project, prioritized by influence and role
      const stakeholders = await Stakeholder.find({
        projectId: projectId,
        isActive: true
      }).sort({ 
        role: 1, // Prioritize sponsors and project managers
        influence: -1, // Then by influence level
        powerLevel: -1, // Then by power level
        engagementLevel: -1 // Finally by engagement level
      }).exec();
      
      if (stakeholders.length === 0) {
        console.log('👥 No stakeholders found for context injection');
        return;
      }
      
      console.log(`👥 Found ${stakeholders.length} stakeholders for context injection`);
      console.log(`👥 Stakeholder details:`, stakeholders.map(s => ({ name: s.name, role: s.role, title: s.title })));
      
      // Import ContextManager to inject the stakeholders as context
      const { ContextManager } = await import('../../modules/contextManager.js');
      const contextManager = ContextManager.getInstance();
      
      // Check if we have a large context window available
      const maxTokens = contextManager.getEffectiveTokenLimit('enriched');
      
      let totalTokensInjected = 0;
      let stakeholdersInjected = 0;
      
      // Group stakeholders by role for better organization
      const stakeholdersByRole = {
        sponsors: stakeholders.filter(s => s.role === 'sponsor'),
        project_managers: stakeholders.filter(s => s.role === 'project_manager'),
        team_members: stakeholders.filter(s => s.role === 'team_member'),
        end_users: stakeholders.filter(s => s.role === 'end_user'),
        other_stakeholders: stakeholders.filter(s => s.role === 'stakeholder')
      };
      
      // Create structured stakeholder context content
      let stakeholderContextContent = `# Project Stakeholders

This section provides comprehensive stakeholder information for document generation, including roles, influence levels, communication preferences, and requirements.

`;
      
      // Add stakeholders by role with detailed information
      for (const [roleGroup, roleStakeholders] of Object.entries(stakeholdersByRole)) {
        if (roleStakeholders.length === 0) continue;
        
        const roleDisplayName = roleGroup.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        stakeholderContextContent += `## ${roleDisplayName} (${roleStakeholders.length})\n\n`;
        
        for (const stakeholder of roleStakeholders) {
          stakeholderContextContent += `### ${stakeholder.name}
- **Title:** ${stakeholder.title}
- **Role:** ${stakeholder.role}
- **Department:** ${stakeholder.department || 'Not specified'}
- **Influence Level:** ${stakeholder.influence} (Power: ${stakeholder.powerLevel}/5, Engagement: ${stakeholder.engagementLevel}/5)
- **Communication Preference:** ${stakeholder.communicationPreference}
- **Availability:** ${stakeholder.availability.workingHours} ${stakeholder.availability.timezone}
- **Email:** ${stakeholder.email || 'Not provided'}
- **Phone:** ${stakeholder.phone || 'Not provided'}

**Requirements:**
${stakeholder.requirements.length > 0 ? stakeholder.requirements.map(req => `- ${req}`).join('\n') : '- None specified'}

**Concerns:**
${stakeholder.concerns.length > 0 ? stakeholder.concerns.map(concern => `- ${concern}`).join('\n') : '- None specified'}

**Expectations:**
${stakeholder.expectations.length > 0 ? stakeholder.expectations.map(expectation => `- ${expectation}`).join('\n') : '- None specified'}

${stakeholder.notes ? `**Notes:** ${stakeholder.notes}\n` : ''}
${stakeholder.lastContact ? `**Last Contact:** ${stakeholder.lastContact.toISOString()}\n` : ''}

`;
        }
      }
      
      // Estimate tokens for stakeholder context
      const estimatedTokens = this.estimateTokens(stakeholderContextContent);
      
      // Check if we have room for stakeholder context
      if (estimatedTokens < maxTokens * 0.3) { // Use up to 30% of context window for stakeholders
        contextManager.addEnrichedContext('PROJECT-STAKEHOLDERS', stakeholderContextContent);
        totalTokensInjected += estimatedTokens;
        stakeholdersInjected = stakeholders.length;
        console.log(`✅ Added ${stakeholdersInjected} stakeholders as context - ~${estimatedTokens.toLocaleString()} tokens`);
      } else {
        console.log(`⚠️ Skipping stakeholder context due to token limit - would use ${estimatedTokens.toLocaleString()} tokens`);
      }
      
      console.log(`🎯 Successfully injected stakeholder context for LLM generation`);
      
    } catch (error) {
      console.error('❌ Error loading project stakeholders for context:', error);
      // Don't throw error - stakeholder context injection is enhancement, not critical
    }
  }

  /**
   * Load existing project documents and inject them as context for LLM generation
   * This ensures that available documents are used as context even when there are no dependencies
   * Optimized for large context windows like Gemini with intelligent token management
   */
  private static async loadExistingProjectDocumentsAsContext(projectId: string): Promise<void> {
    try {
      console.log(`🔍 Loading existing documents for project ${projectId} as context...`);
      
      // Import ProjectDocument model
      const { ProjectDocument } = await import('../../models/ProjectDocument.js');
      
      // Find all existing documents for this project, prioritized by quality and recency
      const existingDocuments = await ProjectDocument.find({
        projectId: projectId,
        deletedAt: null, // Only non-deleted documents
        status: { $in: ['draft', 'review', 'approved', 'published'] } // Only active documents
      }).sort({ 
        status: 1, // Prioritize approved/published documents
        qualityScore: -1, // Then by quality score
        lastModified: -1 // Finally by recency
      }).exec();
      
      if (existingDocuments.length === 0) {
        console.log('📄 No existing documents found for context injection');
        return;
      }
      
      console.log(`📚 Found ${existingDocuments.length} existing documents for context injection`);
      
      // Import ContextManager to inject the documents as context
      const { ContextManager } = await import('../../modules/contextManager.js');
      const contextManager = ContextManager.getInstance();
      
      // Check if we have a large context window available
      const supportsLargeContext = contextManager.supportsLargeContext();
      const maxTokens = contextManager.getEffectiveTokenLimit('enriched');
      
      console.log(`🧠 Context window: ${supportsLargeContext ? 'Large' : 'Standard'} (${maxTokens.toLocaleString()} tokens)`);
      
      let totalTokensInjected = 0;
      let documentsInjected = 0;
      
      // Add each document as high-priority context, respecting token limits
      for (const doc of existingDocuments) {
        const contextKey = `PRIORITY-EXISTING-${doc.type}`;
        
        // Create structured context content with metadata
        const contextContent = `# ${doc.name}

**Document Type:** ${doc.type}
**Category:** ${doc.category}
**Status:** ${doc.status}
**Quality Score:** ${doc.qualityScore || 'N/A'}%
**Last Modified:** ${doc.lastModified.toISOString()}
**Word Count:** ${doc.wordCount || 'N/A'}

## Content

${doc.content}`;
        
        // Estimate tokens for this document
        const estimatedTokens = this.estimateTokens(contextContent);
        
        // Check if we have room for this document
        if (totalTokensInjected + estimatedTokens < maxTokens * 0.8) { // Use 80% of available tokens
          contextManager.addEnrichedContext(contextKey, contextContent);
          totalTokensInjected += estimatedTokens;
          documentsInjected++;
          console.log(`✅ Added existing document as context: ${doc.name} (${doc.type}) - ~${estimatedTokens.toLocaleString()} tokens`);
        } else {
          console.log(`⚠️ Skipping document due to token limit: ${doc.name} (${doc.type}) - would exceed context window`);
          break; // Stop adding more documents to avoid exceeding limits
        }
      }
      
      console.log(`🎯 Successfully injected ${documentsInjected}/${existingDocuments.length} existing documents as context for LLM generation`);
      console.log(`📊 Total context tokens injected: ${totalTokensInjected.toLocaleString()}/${maxTokens.toLocaleString()} (${((totalTokensInjected / maxTokens) * 100).toFixed(1)}%)`);
      
    } catch (error) {
      console.error('❌ Error loading existing project documents for context:', error);
      // Don't throw error - context injection is enhancement, not critical
    }
  }

  /**
   * Simple token estimation function (rough approximation)
   */
  private static estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is a simplified approach - in production, you might want to use a more accurate tokenizer
    return Math.ceil(text.length / 4);
  };

  /**
   * Generate documents with automatic review creation
   */
  static async generateWithReview(req: Request, res: Response, next: NextFunction) {
    try {
      const options: DocumentGenerationWithReviewOptions = {
        projectId: req.body.projectId,
        projectName: req.body.projectName,
        context: req.body.context,
        enableReview: req.body.enableReview ?? true,
        reviewPriority: req.body.reviewPriority ?? 'medium',
        requiredRoles: req.body.requiredRoles,
        specificReviewers: req.body.specificReviewers,
        workflowId: req.body.workflowId,
        autoSubmitForReview: req.body.autoSubmitForReview ?? true,
        generateAll: req.body.generateAll ?? false,
        documentKeys: req.body.documentKeys,
        notifyOnCompletion: req.body.notifyOnCompletion ?? false,
        notificationRecipients: req.body.notificationRecipients
      };

      // Validate required fields
      if (!options.projectId || !options.projectName || !options.context) {
        return res.status(400).json({
          error: 'Missing required fields: projectId, projectName, context'
        });
      }

      if (!options.generateAll && (!options.documentKeys || options.documentKeys.length === 0)) {
        return res.status(400).json({
          error: 'Either generateAll must be true or documentKeys must be provided'
        });
      }

      logger.info(`Starting document generation with review for project: ${options.projectName}`);

      // Load existing project documents and stakeholders for context injection
      await DocumentGenerationController.loadExistingProjectDocumentsAsContext(options.projectId);
      await DocumentGenerationController.loadProjectStakeholdersAsContext(options.projectId, options.documentKeys);

      const result = await DocumentGenerationController.integrationService.generateDocumentsWithReview(options);

      res.status(200).json({
        success: result.generationResult.success,
        message: result.generationResult.message,
        generation: {
          documentsGenerated: result.summary.documentsGenerated,
          generatedFiles: result.generationResult.generatedFiles,
          duration: result.generationResult.duration,
          errors: result.generationResult.errors
        },
        reviews: {
          reviewsCreated: result.summary.reviewsCreated,
          documentsSubmittedForReview: result.summary.documentsSubmittedForReview,
          documentsSkippedReview: result.summary.documentsSkippedReview,
          createdReviews: result.reviewsCreated.map(review => ({
            id: review.id,
            documentName: review.documentName,
            status: review.status,
            priority: review.priority,
            dueDate: review.dueDate
          }))
        },
        summary: result.summary,
        errors: result.errors
      });

    } catch (error) {
      logger.error('Error in generate with review:', error);
      next(error);
    }
  }

  /**
   * Get project review status
   */
  static async getProjectReviewStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const status = await DocumentGenerationController.integrationService.getProjectReviewStatus(projectId);

      res.json({
        projectId,
        reviewStatus: status,
        completionPercentage: status.totalDocuments > 0 
          ? Math.round((status.completedReviews / status.totalDocuments) * 100)
          : 0,
        approvalRate: status.completedReviews > 0
          ? Math.round((status.approvedDocuments / status.completedReviews) * 100)
          : 0
      });

    } catch (error) {
      logger.error('Error getting project review status:', error);
      next(error);
    }
  }

  /**
   * Regenerate document with feedback
   */
  static async regenerateWithFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const { documentKey, context } = req.body;

      if (!reviewId || !documentKey || !context) {
        return res.status(400).json({
          error: 'Missing required fields: reviewId (in params), documentKey, context'
        });
      }

      logger.info(`Regenerating document with feedback for review: ${reviewId}`);

      const result = await DocumentGenerationController.integrationService.regenerateDocumentWithFeedback(
        reviewId,
        documentKey,
        context
      );

      if (result.success) {
        res.json({
          success: true,
          message: 'Document regenerated successfully',
          newReviewId: result.newReviewId
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Error regenerating document with feedback:', error);
      next(error);
    }
  }

  /**
   * Bulk approve documents
   */
  static async bulkApproveDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { documentIds } = req.body;

      if (!projectId || !documentIds || !Array.isArray(documentIds)) {
        return res.status(400).json({
          error: 'Missing required fields: projectId (in params), documentIds (array)'
        });
      }

      logger.info(`Bulk approving ${documentIds.length} documents for project: ${projectId}`);

      const result = await DocumentGenerationController.integrationService.bulkApproveDocuments(
        projectId,
        documentIds
      );

      res.json({
        success: result.approved.length > 0,
        message: `Approved ${result.approved.length} documents, ${result.failed.length} failed`,
        approved: result.approved,
        failed: result.failed,
        errors: result.errors,
        summary: {
          totalRequested: documentIds.length,
          approved: result.approved.length,
          failed: result.failed.length
        }
      });

    } catch (error) {
      logger.error('Error in bulk approve documents:', error);
      next(error);
    }
  }

  /**
   * Generate documents only (without review)
   */
  static async generateDocumentsOnly(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(`🚀 generateDocumentsOnly called with body:`, JSON.stringify(req.body, null, 2));
      const { context, generateAll, documentKeys } = req.body;

      if (!context) {
        return res.status(400).json({ error: 'Context is required' });
      }

      if (!generateAll && (!documentKeys || documentKeys.length === 0)) {
        return res.status(400).json({
          error: 'Either generateAll must be true or documentKeys must be provided'
        });
      }

      // Use the existing DocumentGenerator directly
      const { DocumentGenerator } = await import('../../modules/documentGenerator/DocumentGenerator.js');
      
      // Create a proper project context object
      const projectContext = {
        projectId: req.body.projectId || req.params.projectId || context, // Use projectId from body, params, or context
        projectName: req.body.projectName || context,
        framework: req.body.framework || 'multi',
        ...req.body
      };
      
      // Ensure we have a valid project ID
      if (!projectContext.projectId || projectContext.projectId === 'default-project') {
        console.warn('⚠️ No valid project ID provided for document generation. Using context as project ID.');
        projectContext.projectId = context;
      }
      
      // Load existing project documents and stakeholders for context injection
      console.log(`🔧 Starting context injection for project ${projectContext.projectId}...`);
      await DocumentGenerationController.loadExistingProjectDocumentsAsContext(projectContext.projectId);
      await DocumentGenerationController.loadProjectStakeholdersAsContext(projectContext.projectId, documentKeys);
      console.log(`✅ Context injection completed for project ${projectContext.projectId}`);
      
      const generator = new DocumentGenerator(projectContext);

      let result;
      if (generateAll) {
        result = await generator.generateAll();
      } else {
        // Generate specific documents
        result = {
          success: true,
          successCount: 0,
          failureCount: 0,
          generatedFiles: [] as string[],
          generatedDocuments: [] as Array<{ id: string; name: string; type: string; category: string }>,
          errors: [] as Array<{ task: string; error: string }>,
          duration: 0,
          message: ''
        };

        const startTime = Date.now();
        for (const documentKey of documentKeys) {
          const success = await generator.generateOne(documentKey);
          if (success) {
            result.successCount++;
            result.generatedFiles.push(`${documentKey}.md`);
            
            // Try to get the generated document from the database
            try {
              const { ProjectDocument } = await import('../../models/ProjectDocument.js');
              const recentDocument = await ProjectDocument.findOne({
                type: documentKey,
                projectId: projectContext.projectId
              }).sort({ generatedAt: -1 }).exec();
              
              if (recentDocument) {
                result.generatedDocuments.push({
                  id: recentDocument._id.toString(),
                  name: recentDocument.name,
                  type: recentDocument.type,
                  category: recentDocument.category
                });
              }
            } catch (dbError) {
              console.warn(`Could not retrieve document ID for ${documentKey}:`, dbError);
            }
          } else {
            result.failureCount++;
            result.errors.push({ task: documentKey, error: 'Generation failed' });
          }
        }
        result.duration = Date.now() - startTime;
        result.success = result.successCount > 0;
        result.message = `Generated ${result.successCount} documents`;
      }

      res.json({
        success: result.success,
        message: result.message,
        documentsGenerated: result.successCount,
        documentsFailed: result.failureCount,
        generatedFiles: result.generatedFiles,
        generatedDocuments: (result as any).generatedDocuments || [],
        duration: result.duration,
        errors: result.errors
      });

    } catch (error) {
      logger.error('Error generating documents only:', error);
      next(error);
    }
  }

  /**
   * Generate documents with PMBOK validation and review
   */
  static async generateWithValidationAndReview(req: Request, res: Response, next: NextFunction) {
    try {
      const options: DocumentGenerationWithReviewOptions = {
        projectId: req.body.projectId,
        projectName: req.body.projectName,
        context: req.body.context,
        enableReview: true, // Always enable review for validation workflow
        reviewPriority: req.body.reviewPriority ?? 'high', // Higher priority for validated documents
        requiredRoles: req.body.requiredRoles ?? ['compliance_officer', 'subject_matter_expert'],
        specificReviewers: req.body.specificReviewers,
        workflowId: req.body.workflowId,
        autoSubmitForReview: true,
        generateAll: req.body.generateAll ?? true,
        documentKeys: req.body.documentKeys,
        notifyOnCompletion: req.body.notifyOnCompletion ?? true,
        notificationRecipients: req.body.notificationRecipients
      };

      // Validate required fields
      if (!options.projectId || !options.projectName || !options.context) {
        return res.status(400).json({
          error: 'Missing required fields: projectId, projectName, context'
        });
      }

      logger.info(`Starting document generation with PMBOK validation and review for project: ${options.projectName}`);

      // Load existing project documents and stakeholders for context injection
      await DocumentGenerationController.loadExistingProjectDocumentsAsContext(options.projectId);
      await DocumentGenerationController.loadProjectStakeholdersAsContext(options.projectId, options.documentKeys);

      // Step 1: Generate documents with review
      const result = await DocumentGenerationController.integrationService.generateDocumentsWithReview(options);

      // Step 2: Run PMBOK validation on generated documents
      let validationResult = null;
      if (result.generationResult.success) {
        try {
          const { DocumentGenerator } = await import('../../modules/documentGenerator/DocumentGenerator.js');
          const generator = new DocumentGenerator(options.context);
          validationResult = await generator.validatePMBOKCompliance();
        } catch (validationError) {
          logger.error('Error running PMBOK validation:', validationError);
          result.errors.push(`PMBOK validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`);
        }
      }

      res.status(200).json({
        success: result.generationResult.success,
        message: result.generationResult.message,
        generation: {
          documentsGenerated: result.summary.documentsGenerated,
          generatedFiles: result.generationResult.generatedFiles,
          duration: result.generationResult.duration,
          errors: result.generationResult.errors
        },
        validation: validationResult ? {
          compliance: validationResult.compliance,
          consistencyScore: validationResult.consistencyScore,
          documentQuality: validationResult.documentQuality
        } : null,
        reviews: {
          reviewsCreated: result.summary.reviewsCreated,
          documentsSubmittedForReview: result.summary.documentsSubmittedForReview,
          documentsSkippedReview: result.summary.documentsSkippedReview,
          createdReviews: result.reviewsCreated.map(review => ({
            id: review.id,
            documentName: review.documentName,
            status: review.status,
            priority: review.priority,
            dueDate: review.dueDate,
            complianceScore: review.metadata?.complianceScore
          }))
        },
        summary: {
          ...result.summary,
          validationCompleted: validationResult !== null,
          overallCompliance: validationResult?.compliance ?? false
        },
        errors: result.errors
      });

    } catch (error) {
      logger.error('Error in generate with validation and review:', error);
      next(error);
    }
  }

  /**
   * Get workflow status for a project
   */
  static async getWorkflowStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      // Get review status
      const reviewStatus = await DocumentGenerationController.integrationService.getProjectReviewStatus(projectId);

      // Calculate workflow progress
      const workflowStatus = {
        projectId,
        phase: 'unknown' as 'generation' | 'review' | 'validation' | 'completed',
        progress: 0,
        reviewStatus,
        nextActions: [] as string[],
        blockers: [] as string[]
      };

      // Determine current phase and progress
      if (reviewStatus.totalDocuments === 0) {
        workflowStatus.phase = 'generation';
        workflowStatus.progress = 0;
        workflowStatus.nextActions.push('Generate project documents');
      } else if (reviewStatus.pendingReviews > 0) {
        workflowStatus.phase = 'review';
        workflowStatus.progress = Math.round((reviewStatus.completedReviews / reviewStatus.totalDocuments) * 100);
        workflowStatus.nextActions.push(`Complete ${reviewStatus.pendingReviews} pending reviews`);
      } else if (reviewStatus.completedReviews === reviewStatus.totalDocuments) {
        workflowStatus.phase = 'completed';
        workflowStatus.progress = 100;
        workflowStatus.nextActions.push('All documents reviewed and approved');
      }

      // Identify blockers
      if (reviewStatus.rejectedDocuments > 0) {
        workflowStatus.blockers.push(`${reviewStatus.rejectedDocuments} documents rejected - require revision`);
      }

      // Check for overdue reviews (would need additional data)
      // This is a placeholder - in a real implementation, you'd check due dates
      if (reviewStatus.pendingReviews > 0) {
        workflowStatus.blockers.push('Some reviews may be overdue');
      }

      res.json(workflowStatus);

    } catch (error) {
      logger.error('Error getting workflow status:', error);
      next(error);
    }
  }
}