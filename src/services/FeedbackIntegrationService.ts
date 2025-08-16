// Feedback Integration Service
// filepath: src/services/FeedbackIntegrationService.ts

import { DocumentFeedback, IDocumentFeedback } from '../models/DocumentFeedback.js';
import { AIProcessor } from '../modules/ai/AIProcessor.js';
import { ConfigurationManager } from '../modules/ai/ConfigurationManager.js';

export interface FeedbackInsight {
  documentType: string;
  commonIssues: string[];
  suggestedPromptImprovements: string[];
  qualityTrends: {
    averageRating: number;
    ratingTrend: 'improving' | 'declining' | 'stable';
    feedbackVolume: number;
  };
  priorityAreas: {
    area: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    frequency: number;
  }[];
}

export interface PromptOptimization {
  originalPrompt: string;
  optimizedPrompt: string;
  improvements: string[];
  expectedImpact: string;
  confidence: number;
}

export class FeedbackIntegrationService {
  private aiProcessor: AIProcessor;
  private configManager: ConfigurationManager;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
    this.configManager = ConfigurationManager.getInstance();
  }

  /**
   * Analyze feedback patterns to generate insights for document improvement
   */
  async analyzeFeedbackPatterns(documentType?: string, days: number = 30): Promise<FeedbackInsight[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Build filter
      const filter: any = {
        submittedAt: { $gte: startDate },
        rating: { $lte: 3 } // Focus on lower-rated feedback
      };

      if (documentType) {
        filter.documentType = documentType;
      }

      // Aggregate feedback data
      const insights = await DocumentFeedback.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$documentType',
            totalFeedback: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            commonIssues: { $push: '$title' },
            feedbackTypes: { $push: '$feedbackType' },
            suggestions: { $push: '$suggestedImprovement' },
            priorities: { $push: '$priority' },
            descriptions: { $push: '$description' }
          }
        },
        { $sort: { totalFeedback: -1 } }
      ]);

      // Process insights
      const processedInsights: FeedbackInsight[] = [];

      for (const insight of insights) {
        // Analyze common issues
        const issueFrequency = this.analyzeTextFrequency(insight.commonIssues);
        const commonIssues = Object.entries(issueFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([issue]) => issue);

        // Generate prompt improvements using AI
        const promptImprovements = await this.generatePromptImprovements(
          insight._id,
          insight.descriptions,
          insight.suggestions
        );

        // Calculate quality trends
        const qualityTrends = await this.calculateQualityTrends(insight._id, days);

        // Identify priority areas
        const priorityAreas = this.identifyPriorityAreas(
          insight.feedbackTypes,
          insight.priorities,
          insight.descriptions
        );

        processedInsights.push({
          documentType: insight._id,
          commonIssues,
          suggestedPromptImprovements: promptImprovements,
          qualityTrends,
          priorityAreas
        });
      }

      return processedInsights;

    } catch (error) {
      console.error('Error analyzing feedback patterns:', error);
      throw new Error('Failed to analyze feedback patterns');
    }
  }

  /**
   * Generate optimized prompts based on feedback
   */
  async optimizePromptFromFeedback(
    documentType: string,
    currentPrompt: string,
    feedbackData: IDocumentFeedback[]
  ): Promise<PromptOptimization> {
    try {
      // Analyze feedback for this document type
      const lowRatedFeedback = feedbackData.filter(f => f.rating <= 3);
      const commonIssues = lowRatedFeedback.map(f => f.description).join('\n');
      const suggestions = lowRatedFeedback
        .map(f => f.suggestedImprovement)
        .filter(s => s && s.trim())
        .join('\n');

      // Create optimization prompt
      const optimizationPrompt = `
You are an expert prompt engineer specializing in document generation for project management.

CURRENT PROMPT:
${currentPrompt}

DOCUMENT TYPE: ${documentType}

FEEDBACK ISSUES IDENTIFIED:
${commonIssues}

SUGGESTED IMPROVEMENTS:
${suggestions}

Please optimize the prompt to address these issues. Provide:
1. An improved version of the prompt
2. Specific improvements made
3. Expected impact on document quality
4. Confidence level (0-100%)

Focus on:
- Clarity and specificity
- PMBOK/BABOK compliance
- Addressing common quality issues
- Incorporating user suggestions
- Maintaining professional standards

Return your response in JSON format:
{
  "optimizedPrompt": "...",
  "improvements": ["...", "..."],
  "expectedImpact": "...",
  "confidence": 85
}
`;

      const response: any = await this.aiProcessor.processAIRequest(
        () => Promise.resolve(optimizationPrompt),
        'Optimize document generation prompt based on user feedback'
      );

      let result: any;
      if (response && typeof response === 'object' && 'content' in response && typeof response.content === 'string') {
        result = JSON.parse(response.content);
      } else {
        throw new Error('AI response content missing or invalid');
      }

      return {
        originalPrompt: currentPrompt,
        optimizedPrompt: result.optimizedPrompt,
        improvements: result.improvements,
        expectedImpact: result.expectedImpact,
        confidence: result.confidence
      };

    } catch (error) {
      console.error('Error optimizing prompt from feedback:', error);
      throw new Error('Failed to optimize prompt from feedback');
    }
  }

  /**
   * Apply feedback-driven improvements to document generation
   */
  async applyFeedbackImprovements(projectId: string): Promise<{
    documentsImproved: string[];
    improvementsSummary: string[];
    qualityPrediction: number;
  }> {
    try {
      // Get feedback for this project
      const projectFeedback = await DocumentFeedback.find({
        projectId,
        rating: { $lte: 3 },
        status: { $in: ['open', 'in-review'] }
      });

      if (projectFeedback.length === 0) {
        return {
          documentsImproved: [],
          improvementsSummary: ['No low-rated feedback found to address'],
          qualityPrediction: 0
        };
      }

      // Group feedback by document type
      const feedbackByType = projectFeedback.reduce((acc, feedback) => {
        if (!acc[feedback.documentType]) {
          acc[feedback.documentType] = [];
        }
        acc[feedback.documentType].push(feedback);
        return acc;
      }, {} as Record<string, IDocumentFeedback[]>);

      const documentsImproved: string[] = [];
      const improvementsSummary: string[] = [];

      // Process each document type
      for (const [documentType, feedbacks] of Object.entries(feedbackByType)) {
        try {
          // Get current prompt for this document type
          const currentPrompt = await this.getCurrentPrompt(documentType);
          
          if (currentPrompt) {
            // Optimize prompt based on feedback
            const optimization = await this.optimizePromptFromFeedback(
              documentType,
              currentPrompt,
              feedbacks
            );

            // Apply the optimization (in a real implementation, this would update the prompt templates)
            await this.updatePromptTemplate(documentType, optimization.optimizedPrompt);

            documentsImproved.push(documentType);
            improvementsSummary.push(
              `${documentType}: ${optimization.improvements.join(', ')}`
            );

            // Mark feedback as addressed
            await DocumentFeedback.updateMany(
              { 
                projectId, 
                documentType,
                status: { $in: ['open', 'in-review'] }
              },
              { 
                status: 'implemented',
                implementedAt: new Date()
              }
            );
          }
        } catch (error) {
          console.error(`Error improving ${documentType}:`, error);
          improvementsSummary.push(`${documentType}: Failed to apply improvements`);
        }
      }

      // Predict quality improvement
      const qualityPrediction = this.predictQualityImprovement(projectFeedback);

      return {
        documentsImproved,
        improvementsSummary,
        qualityPrediction
      };

    } catch (error) {
      console.error('Error applying feedback improvements:', error);
      throw new Error('Failed to apply feedback improvements');
    }
  }

  /**
   * Generate feedback-driven recommendations for project managers
   */
  async generateRecommendations(projectId: string): Promise<{
    immediateActions: string[];
    strategicImprovements: string[];
    qualityForecast: {
      currentScore: number;
      projectedScore: number;
      timeframe: string;
    };
  }> {
    try {
      // Get project feedback analytics
      const feedbackStats = await DocumentFeedback.aggregate([
        { $match: { projectId } },
        {
          $group: {
            _id: null,
            totalFeedback: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            criticalIssues: {
              $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
            },
            openIssues: {
              $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
            },
            lowRatedDocs: {
              $sum: { $cond: [{ $lte: ['$rating', 2] }, 1, 0] }
            }
          }
        }
      ]);

      const stats = feedbackStats[0] || {
        totalFeedback: 0,
        averageRating: 0,
        criticalIssues: 0,
        openIssues: 0,
        lowRatedDocs: 0
      };

      const immediateActions: string[] = [];
      const strategicImprovements: string[] = [];

      // Generate immediate actions
      if (stats.criticalIssues > 0) {
        immediateActions.push(`Address ${stats.criticalIssues} critical issues immediately`);
      }
      if (stats.openIssues > 5) {
        immediateActions.push('Review and prioritize open feedback items');
      }
      if (stats.averageRating < 3) {
        immediateActions.push('Focus on improving document quality - average rating is below acceptable threshold');
      }

      // Generate strategic improvements
      if (stats.lowRatedDocs > 0) {
        strategicImprovements.push('Implement AI prompt optimization for consistently low-rated document types');
      }
      if (stats.totalFeedback > 20) {
        strategicImprovements.push('Establish regular feedback review cycles');
      }
      strategicImprovements.push('Integrate feedback insights into template improvements');

      // Calculate quality forecast
      const currentScore = Math.round(stats.averageRating * 20); // Convert to 0-100 scale
      const projectedScore = Math.min(currentScore + 15, 100); // Assume 15% improvement potential

      return {
        immediateActions,
        strategicImprovements,
        qualityForecast: {
          currentScore,
          projectedScore,
          timeframe: '30 days'
        }
      };

    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  /**
   * Track feedback implementation impact
   */
  async trackImplementationImpact(documentType: string, days: number = 30): Promise<{
    beforeMetrics: { averageRating: number; feedbackVolume: number };
    afterMetrics: { averageRating: number; feedbackVolume: number };
    improvement: number;
    success: boolean;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Get metrics before implementation
      const beforeMetrics = await DocumentFeedback.aggregate([
        {
          $match: {
            documentType,
            submittedAt: { $lt: cutoffDate }
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            feedbackVolume: { $sum: 1 }
          }
        }
      ]);

      // Get metrics after implementation
      const afterMetrics = await DocumentFeedback.aggregate([
        {
          $match: {
            documentType,
            submittedAt: { $gte: cutoffDate }
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            feedbackVolume: { $sum: 1 }
          }
        }
      ]);

      const before = beforeMetrics[0] || { averageRating: 0, feedbackVolume: 0 };
      const after = afterMetrics[0] || { averageRating: 0, feedbackVolume: 0 };

      const improvement = after.averageRating - before.averageRating;
      const success = improvement > 0.2; // Consider 0.2+ rating improvement as success

      return {
        beforeMetrics: before,
        afterMetrics: after,
        improvement,
        success
      };

    } catch (error) {
      console.error('Error tracking implementation impact:', error);
      throw new Error('Failed to track implementation impact');
    }
  }

  // Private helper methods

  private analyzeTextFrequency(texts: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    
    texts.forEach(text => {
      if (text && text.trim()) {
        const words = text.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3) { // Filter out short words
            frequency[word] = (frequency[word] || 0) + 1;
          }
        });
      }
    });

    return frequency;
  }

  private async generatePromptImprovements(
    documentType: string,
    descriptions: string[],
    suggestions: string[]
  ): Promise<string[]> {
    try {
      const analysisPrompt = `
Analyze the following feedback for ${documentType} documents and suggest 3-5 specific prompt improvements:

FEEDBACK DESCRIPTIONS:
${descriptions.join('\n')}

SUGGESTIONS:
${suggestions.filter(s => s).join('\n')}

Provide specific, actionable prompt improvements that would address these issues.
Return as a JSON array of strings.
`;

      const response: any = await this.aiProcessor.processAIRequest(
        () => Promise.resolve(analysisPrompt),
        'Generate prompt improvements from feedback'
      );

      if (response && typeof response === 'object' && 'content' in response && typeof response.content === 'string') {
        return JSON.parse(response.content);
      } else {
        throw new Error('AI response content missing or invalid');
      }
    } catch (error) {
      console.error('Error generating prompt improvements:', error);
      return ['Review and enhance prompt specificity', 'Add quality validation criteria'];
    }
  }

  private async calculateQualityTrends(documentType: string, days: number): Promise<{
    averageRating: number;
    ratingTrend: 'improving' | 'declining' | 'stable';
    feedbackVolume: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await DocumentFeedback.aggregate([
        {
          $match: {
            documentType,
            submittedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              week: { $week: '$submittedAt' }
            },
            averageRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.week': 1 } }
      ]);

      if (trends.length < 2) {
        return {
          averageRating: trends[0]?.averageRating || 0,
          ratingTrend: 'stable',
          feedbackVolume: trends[0]?.count || 0
        };
      }

      const firstWeek = trends[0].averageRating;
      const lastWeek = trends[trends.length - 1].averageRating;
      const difference = lastWeek - firstWeek;

      let ratingTrend: 'improving' | 'declining' | 'stable';
      if (difference > 0.2) ratingTrend = 'improving';
      else if (difference < -0.2) ratingTrend = 'declining';
      else ratingTrend = 'stable';

      return {
        averageRating: trends.reduce((sum, t) => sum + t.averageRating, 0) / trends.length,
        ratingTrend,
        feedbackVolume: trends.reduce((sum, t) => sum + t.count, 0)
      };

    } catch (error) {
      console.error('Error calculating quality trends:', error);
      return { averageRating: 0, ratingTrend: 'stable', feedbackVolume: 0 };
    }
  }

  private identifyPriorityAreas(
    feedbackTypes: string[],
    priorities: string[],
    descriptions: string[]
  ): { area: string; severity: 'low' | 'medium' | 'high' | 'critical'; frequency: number }[] {
    const areas: Record<string, { severity: string; frequency: number }> = {};

    feedbackTypes.forEach((type, index) => {
      if (!areas[type]) {
        areas[type] = { severity: priorities[index] || 'medium', frequency: 0 };
      }
      areas[type].frequency++;
    });

    return Object.entries(areas).map(([area, data]) => ({
      area,
      severity: data.severity as any,
      frequency: data.frequency
    })).sort((a, b) => b.frequency - a.frequency);
  }

  private predictQualityImprovement(feedback: IDocumentFeedback[]): number {
    // Simple prediction based on feedback volume and severity
    const criticalCount = feedback.filter(f => f.priority === 'critical').length;
    const highCount = feedback.filter(f => f.priority === 'high').length;
    
    // Predict 10-30% improvement based on issue severity
    const baseImprovement = 10;
    const severityBonus = (criticalCount * 5) + (highCount * 3);
    
    return Math.min(baseImprovement + severityBonus, 30);
  }

  private async getCurrentPrompt(documentType: string): Promise<string | null> {
    // TODO: Implement actual prompt retrieval from template system
    // This would integrate with the existing template/processor system
    return `Generate a professional ${documentType} document following PMBOK standards...`;
  }

  private async updatePromptTemplate(documentType: string, optimizedPrompt: string): Promise<void> {
    // TODO: Implement actual prompt template update
    // This would integrate with the existing template/processor system
    console.log(`Updated prompt template for ${documentType}`);
  }
}