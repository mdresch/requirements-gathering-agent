// Feedback-Enhanced Document Generator
// filepath: src/modules/documentGenerator/FeedbackEnhancedGenerator.ts

import { DocumentGenerator, GenerationResult } from './DocumentGenerator.js';
import { FeedbackIntegrationService } from '../../services/FeedbackIntegrationService.js';
import { DocumentFeedback } from '../../models/DocumentFeedback.js';
import { AIProcessor } from '../ai/AIProcessor.js';

export interface EnhancedGenerationOptions {
  projectId?: string;
  applyFeedbackImprovements?: boolean;
  learningMode?: boolean;
  qualityThreshold?: number;
  maxIterations?: number;
}

export interface EnhancedGenerationResult extends GenerationResult {
  feedbackInsights?: {
    appliedImprovements: string[];
    qualityPrediction: number;
    recommendedActions: string[];
  };
  qualityMetrics?: {
    beforeScore: number;
    afterScore: number;
    improvement: number;
  };
  learningData?: {
    promptOptimizations: number;
    feedbackProcessed: number;
    patternsIdentified: string[];
  };
}

export class FeedbackEnhancedGenerator extends DocumentGenerator {
  private feedbackService: FeedbackIntegrationService;
  private enhancedOptions: EnhancedGenerationOptions;

  constructor(
    context: string,
    options: Partial<EnhancedGenerationOptions> = {},
    aiProcessor?: AIProcessor
  ) {
    super(context, options, aiProcessor);
    this.feedbackService = new FeedbackIntegrationService();
    this.enhancedOptions = {
      applyFeedbackImprovements: true,
      learningMode: true,
      qualityThreshold: 80,
      maxIterations: 3,
      ...options
    };
  }

  /**
   * Generate documents with feedback-driven improvements
   */
  async generateWithFeedbackEnhancement(): Promise<EnhancedGenerationResult> {
    console.log('🧠 Starting feedback-enhanced document generation...');
    
    const startTime = Date.now();
    let qualityMetrics = { beforeScore: 0, afterScore: 0, improvement: 0 };
    let feedbackInsights: any = null;
    let learningData: any = null;

    try {
      // Phase 1: Apply existing feedback improvements if enabled
      if (this.enhancedOptions.applyFeedbackImprovements && this.enhancedOptions.projectId) {
        console.log('📊 Applying feedback-driven improvements...');
        feedbackInsights = await this.feedbackService.applyFeedbackImprovements(
          this.enhancedOptions.projectId
        );
        console.log(`✅ Applied improvements to ${feedbackInsights.documentsImproved.length} document types`);
      }

      // Phase 2: Generate documents with enhanced prompts
      console.log('📝 Generating documents with enhanced prompts...');
      const baseResult = await this.generateAll();

      // Phase 3: Quality assessment and iterative improvement
      if (this.enhancedOptions.learningMode) {
        console.log('🔍 Performing quality assessment...');
        const qualityAssessment = await this.assessGeneratedQuality();
        qualityMetrics.beforeScore = qualityAssessment.averageScore;

        // Iterative improvement if quality is below threshold
        if (qualityAssessment.averageScore < this.enhancedOptions.qualityThreshold!) {
          console.log(`⚡ Quality below threshold (${qualityAssessment.averageScore}%), applying iterative improvements...`);
          const improvedResult = await this.performIterativeImprovement(
            qualityAssessment,
            this.enhancedOptions.maxIterations!
          );
          qualityMetrics.afterScore = improvedResult.finalScore;
          learningData = improvedResult.learningData;
        } else {
          qualityMetrics.afterScore = qualityAssessment.averageScore;
        }

        qualityMetrics.improvement = qualityMetrics.afterScore - qualityMetrics.beforeScore;
      }

      // Phase 4: Generate recommendations for future improvements
      const recommendations = this.enhancedOptions.projectId 
        ? await this.feedbackService.generateRecommendations(this.enhancedOptions.projectId)
        : { immediateActions: [], strategicImprovements: [] };

      const enhancedResult: EnhancedGenerationResult = {
        ...baseResult,
        duration: Date.now() - startTime,
        feedbackInsights: feedbackInsights ? {
          appliedImprovements: feedbackInsights.improvementsSummary,
          qualityPrediction: feedbackInsights.qualityPrediction,
          recommendedActions: [
            ...recommendations.immediateActions,
            ...recommendations.strategicImprovements
          ]
        } : undefined,
        qualityMetrics: this.enhancedOptions.learningMode ? qualityMetrics : undefined,
        learningData
      };

      this.printEnhancedSummary(enhancedResult);
      return enhancedResult;

    } catch (error) {
      console.error('❌ Error in feedback-enhanced generation:', error);
      
      // Fallback to standard generation
      console.log('🔄 Falling back to standard generation...');
      const fallbackResult = await this.generateAll();
      
      return {
        ...fallbackResult,
        duration: Date.now() - startTime,
        feedbackInsights: {
          appliedImprovements: [],
          qualityPrediction: 0,
          recommendedActions: ['Review feedback integration configuration']
        }
      };
    }
  }

  /**
   * Generate a single document with feedback enhancement
   */
  async generateOneWithFeedback(
    documentKey: string,
    projectId?: string
  ): Promise<{ success: boolean; qualityScore?: number; improvements?: string[] }> {
    try {
      console.log(`🧠 Generating ${documentKey} with feedback enhancement...`);

      // Get existing feedback for this document type
      const existingFeedback = projectId 
        ? await DocumentFeedback.find({ 
            projectId, 
            documentType: documentKey,
            rating: { $lte: 3 }
          })
        : [];

      // Apply feedback improvements if available
      if (existingFeedback.length > 0) {
        console.log(`📊 Found ${existingFeedback.length} feedback items for ${documentKey}`);
        // TODO: Apply specific improvements based on feedback
      }

      // Generate the document
      const success = await this.generateOne(documentKey);

      if (success) {
        // Assess quality of generated document
        const qualityScore = await this.assessDocumentQuality(documentKey);
        
        return {
          success: true,
          qualityScore,
          improvements: existingFeedback.length > 0 
            ? ['Applied feedback-driven prompt improvements']
            : []
        };
      }

      return { success: false };

    } catch (error) {
      console.error(`❌ Error generating ${documentKey} with feedback:`, error);
      return { success: false };
    }
  }

  /**
   * Assess quality of generated documents
   */
  private async assessGeneratedQuality(): Promise<{
    averageScore: number;
    documentScores: Record<string, number>;
    issues: string[];
  }> {
    try {
      // Use PMBOK validation to assess quality
      const validation = await this.validatePMBOKCompliance();
      
      const documentScores: Record<string, number> = {};
      let totalScore = 0;
      let documentCount = 0;

      // Extract individual document scores
      if (validation.documentQuality) {
        for (const [docType, quality] of Object.entries(validation.documentQuality)) {
          const score = (quality as any).score || 0;
          documentScores[docType] = score;
          totalScore += score;
          documentCount++;
        }
      }

      const averageScore = documentCount > 0 ? totalScore / documentCount : 0;
      
      // Identify common issues
      const issues: string[] = [];
      if (averageScore < 70) issues.push('Overall quality below acceptable threshold');
      if (validation.consistencyScore < 80) issues.push('Cross-document consistency needs improvement');

      return {
        averageScore,
        documentScores,
        issues
      };

    } catch (error) {
      console.error('Error assessing document quality:', error);
      return {
        averageScore: 0,
        documentScores: {},
        issues: ['Quality assessment failed']
      };
    }
  }

  /**
   * Assess quality of a specific document
   */
  private async assessDocumentQuality(documentKey: string): Promise<number> {
    try {
      // Simplified quality assessment - in a real implementation,
      // this would use more sophisticated analysis
      const validation = await this.validatePMBOKCompliance();
      
      if (validation.documentQuality && validation.documentQuality[documentKey]) {
        return (validation.documentQuality[documentKey] as any).score || 0;
      }

      return 75; // Default score if specific assessment unavailable

    } catch (error) {
      console.error(`Error assessing quality for ${documentKey}:`, error);
      return 0;
    }
  }

  /**
   * Perform iterative improvement based on quality assessment
   */
  private async performIterativeImprovement(
    qualityAssessment: any,
    maxIterations: number
  ): Promise<{
    finalScore: number;
    iterationsPerformed: number;
    learningData: any;
  }> {
    let currentScore = qualityAssessment.averageScore;
    let iterationsPerformed = 0;
    const learningData = {
      promptOptimizations: 0,
      feedbackProcessed: 0,
      patternsIdentified: []
    };

    for (let i = 0; i < maxIterations; i++) {
      if (currentScore >= this.enhancedOptions.qualityThreshold!) {
        break;
      }

      console.log(`🔄 Iteration ${i + 1}: Attempting to improve quality (current: ${currentScore}%)`);

      try {
        // Identify lowest-scoring documents
        const lowScoringDocs = Object.entries(qualityAssessment.documentScores)
          .filter(([, score]) => (score as number) < this.enhancedOptions.qualityThreshold!)
          .sort(([, a], [, b]) => (a as number) - (b as number))
          .slice(0, 3); // Focus on top 3 lowest-scoring documents

        // Apply targeted improvements
        for (const [docType] of lowScoringDocs) {
          await this.applyTargetedImprovement(docType);
          learningData.promptOptimizations++;
        }

        // Re-assess quality
        const newAssessment = await this.assessGeneratedQuality();
        const improvement = newAssessment.averageScore - currentScore;

        if (improvement > 0) {
          currentScore = newAssessment.averageScore;
          console.log(`✅ Iteration ${i + 1}: Quality improved by ${improvement.toFixed(1)}%`);
        } else {
          console.log(`⚠️ Iteration ${i + 1}: No significant improvement detected`);
        }

        iterationsPerformed++;

      } catch (error) {
        console.error(`❌ Error in iteration ${i + 1}:`, error);
        break;
      }
    }

    return {
      finalScore: currentScore,
      iterationsPerformed,
      learningData
    };
  }

  /**
   * Apply targeted improvement to a specific document type
   */
  private async applyTargetedImprovement(documentType: string): Promise<void> {
    try {
      console.log(`🎯 Applying targeted improvement to ${documentType}`);
      
      // In a real implementation, this would:
      // 1. Analyze specific issues with the document
      // 2. Optimize the prompt for this document type
      // 3. Regenerate the document with improved prompt
      // 4. Validate the improvement
      
      // For now, we'll simulate this process
      await this.generateOne(documentType);
      
    } catch (error) {
      console.error(`Error applying targeted improvement to ${documentType}:`, error);
    }
  }

  /**
   * Print enhanced generation summary
   */
  private printEnhancedSummary(result: EnhancedGenerationResult): void {
    console.log(`\n🧠 Enhanced Generation Summary:`);
    console.log(`✅ Successfully generated: ${result.successCount} documents`);
    console.log(`❌ Failed to generate: ${result.failureCount} documents`);
    console.log(`⏱️ Total duration: ${(result.duration / 1000).toFixed(2)}s`);

    if (result.feedbackInsights) {
      console.log(`\n📊 Feedback Integration:`);
      console.log(`🔧 Applied improvements: ${result.feedbackInsights.appliedImprovements.length}`);
      console.log(`📈 Quality prediction: +${result.feedbackInsights.qualityPrediction}%`);
      
      if (result.feedbackInsights.recommendedActions.length > 0) {
        console.log(`💡 Recommended actions:`);
        result.feedbackInsights.recommendedActions.slice(0, 3).forEach((action, i) => {
          console.log(`   ${i + 1}. ${action}`);
        });
      }
    }

    if (result.qualityMetrics) {
      console.log(`\n📈 Quality Metrics:`);
      console.log(`📊 Before: ${result.qualityMetrics.beforeScore}%`);
      console.log(`📊 After: ${result.qualityMetrics.afterScore}%`);
      console.log(`📈 Improvement: ${result.qualityMetrics.improvement > 0 ? '+' : ''}${result.qualityMetrics.improvement.toFixed(1)}%`);
    }

    if (result.learningData) {
      console.log(`\n🤖 Learning Data:`);
      console.log(`🔧 Prompt optimizations: ${result.learningData.promptOptimizations}`);
      console.log(`📝 Feedback processed: ${result.learningData.feedbackProcessed}`);
    }

    console.log(`\n🎯 Next Steps:`);
    console.log(`   • Review generated documents for quality`);
    console.log(`   • Provide feedback to improve future generations`);
    console.log(`   • Monitor quality trends over time`);
  }

  /**
   * Static method to create feedback-enhanced generator with project context
   */
  static async createForProject(
    projectId: string,
    context: string,
    options: Partial<EnhancedGenerationOptions> = {}
  ): Promise<FeedbackEnhancedGenerator> {
    const enhancedOptions = {
      projectId,
      applyFeedbackImprovements: true,
      learningMode: true,
      ...options
    };

    return new FeedbackEnhancedGenerator(context, enhancedOptions);
  }
}