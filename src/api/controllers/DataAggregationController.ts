import { Request, Response, NextFunction } from 'express';
import { dataAggregationService } from '../../services/DataAggregationService.js';
import { benchmarkingService } from '../../services/BenchmarkingService.js';
import { logger } from '../../utils/logger.js';

/**
 * Data Aggregation Controller
 * Provides endpoints for data aggregation, trend analysis, and benchmarking
 */

export class DataAggregationController {
  /**
   * Get aggregated data
   * GET /api/v1/analytics/aggregation
   */
  static async getAggregatedData(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const {
        metric,
        startDate,
        endDate,
        granularity = 'day',
        aggregationType = 'average',
        projectId,
        userId,
        provider,
        model,
        component,
        groupBy
      } = req.query;

      if (!metric || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'metric, startDate, and endDate are required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const config = {
        metric: metric as string,
        timeRange: {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
          granularity: granularity as 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
        },
        filters: {
          projectId: projectId as string,
          userId: userId as string,
          provider: provider as string,
          model: model as string,
          component: component as string
        },
        aggregationType: aggregationType as 'sum' | 'average' | 'count' | 'min' | 'max' | 'median' | 'percentile',
        groupBy: groupBy ? (groupBy as string).split(',') : undefined
      };

      logger.info('Getting aggregated data', { requestId, config });

      const results = await dataAggregationService.aggregateData(config);

      res.json({
        success: true,
        data: {
          metric: config.metric,
          timeRange: config.timeRange,
          aggregationType: config.aggregationType,
          results,
          summary: {
            totalDataPoints: results.length,
            totalValue: results.reduce((sum, r) => sum + r.value, 0),
            averageValue: results.length > 0 ? results.reduce((sum, r) => sum + r.value, 0) / results.length : 0,
            minValue: results.length > 0 ? Math.min(...results.map(r => r.value)) : 0,
            maxValue: results.length > 0 ? Math.max(...results.map(r => r.value)) : 0
          }
        },
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get aggregated data', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'AGGREGATION_FAILED',
          message: 'Failed to retrieve aggregated data'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get trend analysis
   * GET /api/v1/analytics/trends
   */
  static async getTrendAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const {
        metric,
        startDate,
        endDate,
        granularity = 'day',
        projectId,
        userId,
        provider,
        model
      } = req.query;

      if (!metric || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'metric, startDate, and endDate are required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const filters = {
        projectId: projectId as string,
        userId: userId as string,
        provider: provider as string,
        model: model as string
      };

      logger.info('Getting trend analysis', { requestId, metric, startDate, endDate });

      const trendAnalysis = await dataAggregationService.performTrendAnalysis(
        metric as string,
        {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        },
        granularity as 'day' | 'week' | 'month',
        filters
      );

      res.json({
        success: true,
        data: trendAnalysis,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get trend analysis', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'TREND_ANALYSIS_FAILED',
          message: 'Failed to perform trend analysis'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get benchmarks
   * GET /api/v1/analytics/benchmarks
   */
  static async getBenchmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const {
        startDate,
        endDate,
        projectId,
        userId,
        provider,
        model
      } = req.query;

      const timeRange = {
        start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate as string) : new Date()
      };

      const context = {
        projectId: projectId as string,
        userId: userId as string,
        provider: provider as string,
        model: model as string
      };

      logger.info('Getting benchmarks', { requestId, timeRange, context });

      const benchmarks = await benchmarkingService.calculateBenchmarks(timeRange, context);

      res.json({
        success: true,
        data: {
          timeRange,
          context,
          benchmarks,
          summary: {
            total: benchmarks.length,
            above: benchmarks.filter(b => b.comparison.performance === 'above').length,
            below: benchmarks.filter(b => b.comparison.performance === 'below').length,
            at: benchmarks.filter(b => b.comparison.performance === 'at').length,
            averagePerformance: benchmarks.reduce((sum, b) => {
              const score = b.comparison.performance === 'above' ? 100 : b.comparison.performance === 'at' ? 50 : 0;
              return sum + score;
            }, 0) / benchmarks.length
          }
        },
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get benchmarks', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'BENCHMARKS_FAILED',
          message: 'Failed to retrieve benchmarks'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get benchmarks by category
   * GET /api/v1/analytics/benchmarks/categories
   */
  static async getBenchmarksByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';

      logger.info('Getting benchmarks by category', { requestId });

      const benchmarksByCategory = benchmarkingService.getBenchmarksByCategory();

      res.json({
        success: true,
        data: {
          categories: benchmarksByCategory,
          summary: {
            totalCategories: benchmarksByCategory.length,
            totalBenchmarks: benchmarksByCategory.reduce((sum, cat) => sum + cat.summary.total, 0),
            overallPerformance: benchmarksByCategory.reduce((sum, cat) => sum + cat.summary.averagePerformance, 0) / benchmarksByCategory.length
          }
        },
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get benchmarks by category', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'BENCHMARKS_CATEGORIES_FAILED',
          message: 'Failed to retrieve benchmarks by category'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Compare with industry standards
   * GET /api/v1/analytics/benchmarks/industry-comparison
   */
  static async getIndustryComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { metric, currentValue, projectId, userId, provider, model } = req.query;

      if (!metric || !currentValue) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'metric and currentValue are required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const context = {
        projectId: projectId as string,
        userId: userId as string,
        provider: provider as string,
        model: model as string
      };

      logger.info('Getting industry comparison', { requestId, metric, currentValue, context });

      const comparison = await benchmarkingService.compareWithIndustry(
        metric as string,
        parseFloat(currentValue as string),
        context
      );

      res.json({
        success: true,
        data: comparison,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get industry comparison', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INDUSTRY_COMPARISON_FAILED',
          message: 'Failed to retrieve industry comparison'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get benchmarking insights
   * GET /api/v1/analytics/benchmarks/insights
   */
  static async getBenchmarkingInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';

      logger.info('Getting benchmarking insights', { requestId });

      const insights = await benchmarkingService.getBenchmarkingInsights();

      res.json({
        success: true,
        data: insights,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get benchmarking insights', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'BENCHMARKING_INSIGHTS_FAILED',
          message: 'Failed to retrieve benchmarking insights'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create performance profile
   * POST /api/v1/analytics/performance-profiles
   */
  static async createPerformanceProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.headers['x-request-id'] as string || 'unknown';
      const { name, description, metrics } = req.body;

      if (!name || !metrics) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'name and metrics are required'
          },
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Creating performance profile', { requestId, name });

      const profileId = benchmarkingService.createPerformanceProfile(name, description || '', metrics);

      res.status(201).json({
        success: true,
        data: { profileId },
        message: 'Performance profile created successfully',
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to create performance profile', { 
        error: error.message,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PERFORMANCE_PROFILE_CREATION_FAILED',
          message: 'Failed to create performance profile'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Calculate performance profile score
   * GET /api/v1/analytics/performance-profiles/:profileId/score
   */
  static async calculateProfileScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { profileId } = req.params;
      const requestId = req.headers['x-request-id'] as string || 'unknown';

      logger.info('Calculating performance profile score', { requestId, profileId });

      const score = await benchmarkingService.calculateProfileScore(profileId);

      res.json({
        success: true,
        data: {
          profileId,
          overallScore: score,
          timestamp: new Date().toISOString()
        },
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to calculate profile score', { 
        error: error.message,
        profileId: req.params.profileId,
        requestId: req.headers['x-request-id']
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_SCORE_CALCULATION_FAILED',
          message: 'Failed to calculate performance profile score'
        },
        requestId: req.headers['x-request-id'] as string || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
}
