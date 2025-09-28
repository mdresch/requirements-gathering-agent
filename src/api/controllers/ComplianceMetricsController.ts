// Phase 1: Compliance Metrics Controller - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { Request, Response } from 'express';
import ComplianceMetricsService from '../../services/ComplianceMetricsService.js';
import { logger } from '../../utils/logger.js';

export class ComplianceMetricsController {
  /**
   * Get compliance metrics analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const analytics = await ComplianceMetricsService.getAnalytics(
        projectId as string,
        start,
        end
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('❌ Error in compliance metrics analytics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get project compliance metrics
   */
  async getProjectMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { standardType } = req.query;

      const metrics = await ComplianceMetricsService.getProjectMetrics(
        projectId,
        standardType as string
      );

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('❌ Error in get project metrics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get latest compliance metrics for dashboard
   */
  async getLatestMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;

      const metrics = await ComplianceMetricsService.getLatestMetrics(
        projectId as string
      );

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('❌ Error in get latest metrics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new compliance metric
   */
  async createMetric(req: Request, res: Response): Promise<void> {
    try {
      const metricData = req.body;

      const metric = await ComplianceMetricsService.createMetric(metricData);

      res.status(201).json({
        success: true,
        data: metric
      });
    } catch (error) {
      logger.error('❌ Error in create metric:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update metric with trends
   */
  async updateMetricWithTrends(req: Request, res: Response): Promise<void> {
    try {
      const { metricId } = req.params;

      const metric = await ComplianceMetricsService.updateMetricWithTrends(metricId);

      if (!metric) {
        res.status(404).json({
          success: false,
          error: 'Metric not found'
        });
        return;
      }

      res.json({
        success: true,
        data: metric
      });
    } catch (error) {
      logger.error('❌ Error in update metric with trends:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Seed sample data
   */
  async seedSampleData(req: Request, res: Response): Promise<void> {
    try {
      await ComplianceMetricsService.seedSampleData();

      res.json({
        success: true,
        message: 'Sample data seeded successfully'
      });
    } catch (error) {
      logger.error('❌ Error in seed sample data:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new ComplianceMetricsController();
