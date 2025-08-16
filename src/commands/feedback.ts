// Feedback Management CLI Command
// filepath: src/commands/feedback.ts

import { Command } from 'commander';
import { FeedbackIntegrationService } from '../services/FeedbackIntegrationService.js';
import { FeedbackEnhancedGenerator } from '../modules/documentGenerator/FeedbackEnhancedGenerator.js';
import { DocumentFeedback } from '../models/DocumentFeedback.js';

export function createFeedbackCommand(): Command {
  const feedback = new Command('feedback');
  feedback.description('Manage document feedback and AI improvements');

  // Analyze feedback patterns
  feedback
    .command('analyze')
    .description('Analyze feedback patterns to identify improvement opportunities')
    .option('-d, --document-type <type>', 'Analyze specific document type')
    .option('-p, --project <id>', 'Analyze specific project')
    .option('--days <number>', 'Number of days to analyze', '30')
    .action(async (options) => {
      try {
        console.log('🔍 Analyzing feedback patterns...');
        
        const service = new FeedbackIntegrationService();
        const insights = await service.analyzeFeedbackPatterns(
          options.documentType,
          parseInt(options.days)
        );

        if (insights.length === 0) {
          console.log('📊 No feedback patterns found for the specified criteria.');
          return;
        }

        console.log(`\n📈 Feedback Analysis Results (${options.days} days):`);
        console.log('=' .repeat(60));

        insights.forEach((insight, index) => {
          console.log(`\n${index + 1}. Document Type: ${insight.documentType}`);
          console.log(`   Quality Trend: ${insight.qualityTrends.ratingTrend} (${insight.qualityTrends.averageRating.toFixed(1)}/5)`);
          console.log(`   Feedback Volume: ${insight.qualityTrends.feedbackVolume} items`);
          
          if (insight.commonIssues.length > 0) {
            console.log(`   Common Issues:`);
            insight.commonIssues.slice(0, 3).forEach(issue => {
              console.log(`     • ${issue}`);
            });
          }

          if (insight.suggestedPromptImprovements.length > 0) {
            console.log(`   Suggested Improvements:`);
            insight.suggestedPromptImprovements.slice(0, 2).forEach(improvement => {
              console.log(`     • ${improvement}`);
            });
          }

          if (insight.priorityAreas.length > 0) {
            console.log(`   Priority Areas:`);
            insight.priorityAreas.slice(0, 3).forEach(area => {
              console.log(`     • ${area.area} (${area.severity}, ${area.frequency} occurrences)`);
            });
          }
        });

        console.log('\n💡 Next Steps:');
        console.log('   • Use "adpa feedback apply" to implement improvements');
        console.log('   • Review specific document types with low ratings');
        console.log('   • Monitor trends after implementing changes');

      } catch (error) {
        console.error('❌ Error analyzing feedback:', error);
        process.exit(1);
      }
    });

  // Apply feedback improvements
  feedback
    .command('apply')
    .description('Apply feedback-driven improvements to document generation')
    .requiredOption('-p, --project <id>', 'Project ID to apply improvements to')
    .option('--dry-run', 'Show what would be improved without applying changes')
  .action(async (options: any) => {
      try {
        console.log(`🔧 ${options.dryRun ? 'Analyzing' : 'Applying'} feedback improvements for project ${options.project}...`);
        
        const service = new FeedbackIntegrationService();
        
        if (options.dryRun) {
          // Get recommendations without applying
          const recommendations = await service.generateRecommendations(options.project);
          
          console.log('\n📋 Recommended Improvements:');
          console.log('=' .repeat(50));
          
          if (recommendations.immediateActions.length > 0) {
            console.log('\n🚨 Immediate Actions:');
            recommendations.immediateActions.forEach((action, i) => {
              console.log(`   ${i + 1}. ${action}`);
            });
          }

          if (recommendations.strategicImprovements.length > 0) {
            console.log('\n📈 Strategic Improvements:');
            recommendations.strategicImprovements.forEach((improvement, i) => {
              console.log(`   ${i + 1}. ${improvement}`);
            });
          }

          console.log('\n📊 Quality Forecast:');
          console.log(`   Current Score: ${recommendations.qualityForecast.currentScore}%`);
          console.log(`   Projected Score: ${recommendations.qualityForecast.projectedScore}%`);
          console.log(`   Timeframe: ${recommendations.qualityForecast.timeframe}`);

          console.log('\n💡 Run without --dry-run to apply these improvements');
          
        } else {
          // Apply improvements
          const result = await service.applyFeedbackImprovements(options.project);
          
          console.log('\n✅ Feedback Improvements Applied:');
          console.log('=' .repeat(50));
          console.log(`📝 Documents Improved: ${result.documentsImproved.length}`);
          
          if (result.documentsImproved.length > 0) {
            console.log('\n📋 Improved Documents:');
            result.documentsImproved.forEach(doc => {
              console.log(`   • ${doc}`);
            });
          }

          if (result.improvementsSummary.length > 0) {
            console.log('\n🔧 Applied Improvements:');
            result.improvementsSummary.forEach(summary => {
              console.log(`   • ${summary}`);
            });
          }

          console.log(`\n📈 Predicted Quality Improvement: +${result.qualityPrediction}%`);
          
          console.log('\n💡 Next Steps:');
          console.log('   • Regenerate documents to see improvements');
          console.log('   • Monitor feedback on improved documents');
          console.log('   • Track quality metrics over time');
        }

      } catch (error) {
        console.error('❌ Error applying feedback improvements:', error);
        process.exit(1);
      }
    });

  // Generate with feedback enhancement
  feedback
    .command('generate')
    .description('Generate documents with feedback-driven enhancements')
    .requiredOption('-c, --context <context>', 'Project context for document generation')
    .option('-p, --project <id>', 'Project ID for feedback integration')
    .option('--learning', 'Enable learning mode for iterative improvement')
    .option('--threshold <number>', 'Quality threshold for iterative improvement', '80')
  .action(async (options: any) => {
      try {
        console.log('🧠 Starting feedback-enhanced document generation...');
        
        const generator = new FeedbackEnhancedGenerator(options.context, {
          projectId: options.project,
          applyFeedbackImprovements: true,
          learningMode: options.learning,
          qualityThreshold: parseInt(options.threshold)
        });

        const result = await generator.generateWithFeedbackEnhancement();

        console.log('\n📊 Generation Results:');
        console.log('=' .repeat(50));
        console.log(`✅ Success: ${result.success}`);
        console.log(`📝 Documents Generated: ${result.successCount}`);
        console.log(`❌ Failed: ${result.failureCount}`);
        console.log(`⏱️ Duration: ${(result.duration / 1000).toFixed(2)}s`);

        if (result.feedbackInsights) {
          console.log('\n🔧 Feedback Integration:');
          console.log(`   Applied Improvements: ${result.feedbackInsights.appliedImprovements.length}`);
          console.log(`   Quality Prediction: +${result.feedbackInsights.qualityPrediction}%`);
          
          if (result.feedbackInsights.recommendedActions.length > 0) {
            console.log('\n💡 Recommended Actions:');
            result.feedbackInsights.recommendedActions.slice(0, 3).forEach((action, i) => {
              console.log(`   ${i + 1}. ${action}`);
            });
          }
        }

        if (result.qualityMetrics) {
          console.log('\n📈 Quality Metrics:');
          console.log(`   Before: ${result.qualityMetrics.beforeScore}%`);
          console.log(`   After: ${result.qualityMetrics.afterScore}%`);
          console.log(`   Improvement: ${result.qualityMetrics.improvement > 0 ? '+' : ''}${result.qualityMetrics.improvement.toFixed(1)}%`);
        }

        if (result.learningData) {
          console.log('\n🤖 Learning Data:');
          console.log(`   Prompt Optimizations: ${result.learningData.promptOptimizations}`);
          console.log(`   Feedback Processed: ${result.learningData.feedbackProcessed}`);
        }

      } catch (error) {
        console.error('❌ Error in feedback-enhanced generation:', error);
        process.exit(1);
      }
    });

  // Show feedback statistics
  feedback
    .command('stats')
    .description('Show feedback statistics and trends')
    .option('-p, --project <id>', 'Show stats for specific project')
    .option('--days <number>', 'Number of days to analyze', '30')
  .action(async (options: any) => {
      try {
        console.log('📊 Gathering feedback statistics...');
        
        const filter: any = {};
        if (options.project) {
          filter.projectId = options.project;
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(options.days));
        filter.submittedAt = { $gte: startDate };

        // Get basic stats
        const totalFeedback = await DocumentFeedback.countDocuments(filter);
        const avgRating = await DocumentFeedback.aggregate([
          { $match: filter },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);

        // Get feedback by type
        const byType = await DocumentFeedback.aggregate([
          { $match: filter },
          { $group: { _id: '$feedbackType', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
          { $sort: { count: -1 } }
        ]);

        // Get feedback by status
        const byStatus = await DocumentFeedback.aggregate([
          { $match: filter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);

        // Get top issues
        const topIssues = await DocumentFeedback.aggregate([
          { $match: { ...filter, rating: { $lte: 2 } } },
          { $group: { _id: '$documentType', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]);

        console.log('\n📈 Feedback Statistics:');
        console.log('=' .repeat(50));
        console.log(`📝 Total Feedback: ${totalFeedback}`);
        console.log(`⭐ Average Rating: ${avgRating[0]?.avgRating?.toFixed(1) || 'N/A'}/5`);
        console.log(`📅 Period: Last ${options.days} days`);

        if (byType.length > 0) {
          console.log('\n📊 Feedback by Type:');
          byType.forEach(type => {
            console.log(`   ${type._id}: ${type.count} items (avg: ${type.avgRating.toFixed(1)}/5)`);
          });
        }

        if (byStatus.length > 0) {
          console.log('\n📋 Feedback by Status:');
          byStatus.forEach(status => {
            console.log(`   ${status._id}: ${status.count} items`);
          });
        }

        if (topIssues.length > 0) {
          console.log('\n🚨 Documents with Most Issues:');
          topIssues.forEach((issue, i) => {
            console.log(`   ${i + 1}. ${issue._id}: ${issue.count} low ratings (avg: ${issue.avgRating.toFixed(1)}/5)`);
          });
        }

        console.log('\n💡 Recommendations:');
        if (avgRating[0]?.avgRating < 3) {
          console.log('   • Focus on improving overall document quality');
        }
        if (topIssues.length > 0) {
          console.log(`   • Prioritize improvements for ${topIssues[0]._id} documents`);
        }
        console.log('   • Use "adpa feedback analyze" for detailed insights');

      } catch (error) {
        console.error('❌ Error gathering feedback statistics:', error);
        process.exit(1);
      }
    });

  return feedback;
}