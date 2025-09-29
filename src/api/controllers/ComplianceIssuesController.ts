// Phase 1: Compliance Issues Controller - Real Database Implementation
// Replaces mock data with actual MongoDB operations

import { Request, Response } from 'express';
import ComplianceIssuesService from '../../services/ComplianceIssuesService.js';
import { logger } from '../../utils/logger.js';

export class ComplianceIssuesController {
  /**
   * Get compliance issues analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const analytics = await ComplianceIssuesService.getAnalytics(
        projectId as string,
        start,
        end
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('❌ Error in compliance issues analytics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get project compliance issues
   */
  async getProjectIssues(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { standardType, status, severity, assigneeId } = req.query;

      const filters = {
        standardType: standardType as string,
        status: status as string,
        severity: severity as string,
        assigneeId: assigneeId as string
      };

      const issues = await ComplianceIssuesService.getProjectIssues(projectId, filters);

      res.json({
        success: true,
        data: issues
      });
    } catch (error) {
      logger.error('❌ Error in get project issues:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all compliance issues with filters
   */
  async getIssues(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, standardType, status, severity, assigneeId, search } = req.query;

      let issues;
      if (search) {
        issues = await ComplianceIssuesService.searchIssues(
          search as string,
          projectId as string
        );
      } else {
        const filters = {
          standardType: standardType as string,
          status: status as string,
          severity: severity as string,
          assigneeId: assigneeId as string
        };

        issues = await ComplianceIssuesService.getProjectIssues(
          projectId as string,
          filters
        );
      }

      res.json({
        success: true,
        data: issues
      });
    } catch (error) {
      logger.error('❌ Error in get issues:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new compliance issue
   */
  async createIssue(req: Request, res: Response): Promise<void> {
    try {
      const issueData = req.body;

      const issue = await ComplianceIssuesService.createIssue(issueData);

      res.status(201).json({
        success: true,
        data: issue
      });
    } catch (error) {
      logger.error('❌ Error in create issue:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update compliance issue
   */
  async updateIssue(req: Request, res: Response): Promise<void> {
    try {
      const { issueId } = req.params;
      const updateData = req.body;

      const issue = await ComplianceIssuesService.updateIssue(issueId, updateData);

      if (!issue) {
        res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
        return;
      }

      res.json({
        success: true,
        data: issue
      });
    } catch (error) {
      logger.error('❌ Error in update issue:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add comment to issue
   */
  async addComment(req: Request, res: Response): Promise<void> {
    try {
      const { issueId } = req.params;
      const commentData = req.body;

      const issue = await ComplianceIssuesService.addComment(issueId, commentData);

      if (!issue) {
        res.status(404).json({
          success: false,
          error: 'Issue not found'
        });
        return;
      }

      res.json({
        success: true,
        data: issue
      });
    } catch (error) {
      logger.error('❌ Error in add comment:', error);
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
      await ComplianceIssuesService.seedSampleData();

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

export default new ComplianceIssuesController();
