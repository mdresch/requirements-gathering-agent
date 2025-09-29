// Phase 1: Compliance Metrics Service - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { ComplianceMetricsModel, IComplianceMetrics } from '../models/ComplianceMetrics.model.js';
import { logger } from '../utils/logger.js';

export interface ComplianceMetricsAnalytics {
  totalMetrics: number;
  averageScore: number;
  scoreByStandard: Record<string, number>;
  scoreTrends: Array<{
    date: Date;
    score: number;
    standardType: string;
  }>;
  topPerformers: Array<{
    projectId: string;
    score: number;
    standardType: string;
  }>;
  recentUpdates: IComplianceMetrics[];
}

export class ComplianceMetricsService {
  /**
   * Get compliance metrics for a specific project
   */
  async getProjectMetrics(projectId: string, standardType?: string): Promise<IComplianceMetrics[]> {
    try {
      const query: any = { projectId };
      if (standardType) {
        query.standardType = standardType;
      }

      const metrics = await ComplianceMetricsModel
        .find(query)
        .sort({ calculatedAt: -1 as const })
        .limit(100);

      logger.info(`📊 Retrieved ${metrics.length} compliance metrics for project ${projectId}`);
      return metrics;
    } catch (error) {
      logger.error('❌ Error fetching project compliance metrics:', error);
      throw error;
    }
  }

  /**
   * Get latest compliance metrics for dashboard
   */
  async getLatestMetrics(projectId?: string): Promise<IComplianceMetrics[]> {
    try {
      const query: any = {};
      if (projectId) {
        query.projectId = projectId;
      }

      // Get the latest metrics for each standard type
      const pipeline = [
        { $match: query },
        { $sort: { calculatedAt: -1 as const } },
        {
          $group: {
            _id: { projectId: '$projectId', standardType: '$standardType' },
            latestMetric: { $first: '$$ROOT' }
          }
        },
        { $replaceRoot: { newRoot: '$latestMetric' } },
        { $sort: { calculatedAt: -1 as const } }
      ];

      const metrics = await ComplianceMetricsModel.aggregate(pipeline);
      
      logger.info(`📊 Retrieved ${metrics.length} latest compliance metrics`);
      return metrics;
    } catch (error) {
      logger.error('❌ Error fetching latest compliance metrics:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics for compliance metrics
   */
  async getAnalytics(projectId?: string, startDate?: Date, endDate?: Date): Promise<ComplianceMetricsAnalytics> {
    try {
      const matchQuery: any = {};
      if (projectId) {
        matchQuery.projectId = projectId;
      }
      if (startDate && endDate) {
        matchQuery.calculatedAt = {
          $gte: startDate,
          $lte: endDate
        };
      }

      const pipeline = [
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalMetrics: { $sum: 1 },
            averageScore: { $avg: '$score' },
            scores: { $push: { score: '$score', standardType: '$standardType', projectId: '$projectId', calculatedAt: '$calculatedAt' } },
            recentUpdates: { $push: '$$ROOT' }
          }
        },
        {
          $project: {
            totalMetrics: 1,
            averageScore: { $round: ['$averageScore', 2] },
            scores: 1,
            recentUpdates: { $slice: ['$recentUpdates', 10] }
          }
        }
      ];

      const [analytics] = await ComplianceMetricsModel.aggregate(pipeline);
      
      if (!analytics) {
        return {
          totalMetrics: 0,
          averageScore: 0,
          scoreByStandard: {},
          scoreTrends: [],
          topPerformers: [],
          recentUpdates: []
        };
      }

      // Calculate score by standard
      const scoreByStandard: Record<string, number> = {};
      const standardGroups = analytics.scores.reduce((acc: any, item: any) => {
        if (!acc[item.standardType]) {
          acc[item.standardType] = [];
        }
        acc[item.standardType].push(item.score);
        return acc;
      }, {});

      Object.keys(standardGroups).forEach(standard => {
        const scores = standardGroups[standard];
        scoreByStandard[standard] = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
      });

      // Generate score trends (last 30 days)
      const trends = analytics.scores
        .sort((a: any, b: any) => new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime())
        .slice(-30)
        .map((item: any) => ({
          date: new Date(item.calculatedAt),
          score: item.score,
          standardType: item.standardType
        }));

      // Get top performers
      const topPerformers = analytics.scores
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 10)
        .map((item: any) => ({
          projectId: item.projectId,
          score: item.score,
          standardType: item.standardType
        }));

      logger.info(`📊 Generated compliance analytics: ${analytics.totalMetrics} metrics, avg score ${analytics.averageScore}`);

      return {
        totalMetrics: analytics.totalMetrics,
        averageScore: analytics.averageScore,
        scoreByStandard,
        scoreTrends: trends,
        topPerformers,
        recentUpdates: analytics.recentUpdates
      };
    } catch (error) {
      logger.error('❌ Error generating compliance analytics:', error);
      throw error;
    }
  }

  /**
   * Create or update compliance metrics
   */
  async createMetric(metricData: {
    projectId: string;
    standardType: 'BABOK' | 'PMBOK' | 'DMBOK' | 'ISO' | 'OVERALL';
    score: number;
    dataSource?: string;
    metadata?: any;
  }): Promise<IComplianceMetrics> {
    try {
      const metric = new ComplianceMetricsModel({
        ...metricData,
        dataSource: metricData.dataSource || 'api',
        calculatedAt: new Date()
      });

      await metric.save();
      
      logger.info(`✅ Created compliance metric: ${metricData.standardType} score ${metricData.score} for project ${metricData.projectId}`);
      return metric;
    } catch (error) {
      logger.error('❌ Error creating compliance metric:', error);
      throw error;
    }
  }

  /**
   * Update metric with trend analysis
   */
  async updateMetricWithTrends(metricId: string): Promise<IComplianceMetrics | null> {
    try {
      const metric = await ComplianceMetricsModel.findById(metricId);
      if (!metric) {
        return null;
      }

      // Get previous score for trend calculation
      const previousMetric = await ComplianceMetricsModel
        .findOne({
          projectId: metric.projectId,
          standardType: metric.standardType,
          _id: { $ne: metricId }
        })
        .sort({ calculatedAt: -1 });

      if (previousMetric) {
        const changePercentage = ((metric.score - previousMetric.score) / previousMetric.score) * 100;
        const trendDirection = changePercentage > 1 ? 'IMPROVING' : 
                             changePercentage < -1 ? 'DECLINING' : 'STABLE';

        metric.trends = {
          previousScore: previousMetric.score,
          changePercentage: Math.round(changePercentage * 100) / 100,
          trendDirection,
          period: '30d'
        };

        await metric.save();
      }

      return metric;
    } catch (error) {
      logger.error('❌ Error updating metric with trends:', error);
      throw error;
    }
  }

  /**
   * Seed sample data for testing
   */
  async seedSampleData(): Promise<void> {
    try {
      const sampleMetrics = [
        {
          projectId: '68cc74380846c36e221ee391',
          standardType: 'BABOK' as const,
          score: 87,
          dataSource: 'api',
          metadata: { version: '3.0', framework: 'BABOK' }
        },
        {
          projectId: '68cc74380846c36e221ee391',
          standardType: 'PMBOK' as const,
          score: 94,
          dataSource: 'api',
          metadata: { version: '7.0', framework: 'PMBOK' }
        },
        {
          projectId: '68cc74380846c36e221ee391',
          standardType: 'DMBOK' as const,
          score: 76,
          dataSource: 'api',
          metadata: { version: '2.0', framework: 'DMBOK' }
        },
        {
          projectId: '68cc74380846c36e221ee391',
          standardType: 'OVERALL' as const,
          score: 85,
          dataSource: 'api',
          metadata: { version: '1.0', framework: 'COMPOSITE' }
        }
      ];

      // Clear existing sample data
      await ComplianceMetricsModel.deleteMany({ dataSource: 'api' });
      
      // Insert sample data
      await ComplianceMetricsModel.insertMany(sampleMetrics);
      
      logger.info('✅ Seeded compliance metrics sample data');
    } catch (error) {
      logger.error('❌ Error seeding compliance metrics:', error);
      throw error;
    }
  }
}

export default new ComplianceMetricsService();
