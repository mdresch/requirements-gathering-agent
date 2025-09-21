import { Request, Response, NextFunction } from 'express';
import { GenerationJobService } from '../../services/GenerationJobService.js';
import { logger } from '../../utils/logger.js';

export class GenerationJobController {
  private static jobService = GenerationJobService.getInstance();

  /**
   * Create a new generation job
   */
  public static async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId, templateId, templateName, outputFormat, metadata } = req.body;

      if (!projectId || !templateId || !templateName || !outputFormat) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: projectId, templateId, templateName, outputFormat'
        });
        return;
      }

      const job = await GenerationJobController.jobService.createJob({
        projectId,
        templateId,
        templateName,
        outputFormat,
        metadata
      });

      res.status(201).json({
        success: true,
        data: job,
        message: 'Generation job created successfully'
      });

      logger.info(`📋 Created generation job: ${job.id} for template: ${templateName}`);
    } catch (error: any) {
      logger.error('❌ Error creating generation job:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create generation job',
        details: error.message
      });
    }
  }

  /**
   * Get job by ID
   */
  public static async getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;

      const job = await GenerationJobController.jobService.getJob(jobId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Generation job not found'
        });
        return;
      }

      res.json({
        success: true,
        data: job
      });
    } catch (error: any) {
      logger.error(`❌ Error retrieving generation job ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve generation job',
        details: error.message
      });
    }
  }

  /**
   * Update job status and progress
   */
  public static async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const { progress, status, error, outputPath, downloadUrl, metadata } = req.body;

      const job = await GenerationJobController.jobService.updateJob(jobId, {
        progress,
        status,
        error,
        outputPath,
        downloadUrl,
        metadata
      });

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Generation job not found'
        });
        return;
      }

      res.json({
        success: true,
        data: job,
        message: 'Generation job updated successfully'
      });
    } catch (error: any) {
      logger.error(`❌ Error updating generation job ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update generation job',
        details: error.message
      });
    }
  }

  /**
   * Get jobs for a project
   */
  public static async getProjectJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      const jobs = await GenerationJobController.jobService.getProjectJobs(projectId, limit, skip);

      res.json({
        success: true,
        data: jobs,
        pagination: {
          limit,
          skip,
          total: jobs.length
        }
      });
    } catch (error: any) {
      logger.error(`❌ Error retrieving jobs for project ${req.params.projectId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve project jobs',
        details: error.message
      });
    }
  }

  /**
   * Get jobs by status
   */
  public static async getJobsByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const jobs = await GenerationJobController.jobService.getJobsByStatus(status, limit);

      res.json({
        success: true,
        data: jobs,
        pagination: {
          limit,
          total: jobs.length
        }
      });
    } catch (error: any) {
      logger.error(`❌ Error retrieving jobs by status ${req.params.status}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve jobs by status',
        details: error.message
      });
    }
  }

  /**
   * Get active jobs (pending or processing)
   */
  public static async getActiveJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobs = await GenerationJobController.jobService.getActiveJobs();

      res.json({
        success: true,
        data: jobs,
        total: jobs.length
      });
    } catch (error: any) {
      logger.error('❌ Error retrieving active jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve active jobs',
        details: error.message
      });
    }
  }

  /**
   * Cancel a job
   */
  public static async cancelJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;

      const success = await GenerationJobController.jobService.cancelJob(jobId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Generation job not found or cannot be cancelled'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Generation job cancelled successfully'
      });
    } catch (error: any) {
      logger.error(`❌ Error cancelling generation job ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel generation job',
        details: error.message
      });
    }
  }

  /**
   * Get job statistics
   */
  public static async getJobStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.query;

      const stats = await GenerationJobController.jobService.getJobStats(projectId as string);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      logger.error('❌ Error retrieving job statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve job statistics',
        details: error.message
      });
    }
  }

  /**
   * Add log entry to job
   */
  public static async addLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const { level, message } = req.body;

      if (!level || !message) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: level, message'
        });
        return;
      }

      if (!['info', 'warning', 'error'].includes(level)) {
        res.status(400).json({
          success: false,
          error: 'Invalid log level. Must be: info, warning, or error'
        });
        return;
      }

      await GenerationJobController.jobService.addLog(jobId, level, message);

      res.json({
        success: true,
        message: 'Log entry added successfully'
      });
    } catch (error: any) {
      logger.error(`❌ Error adding log to generation job ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to add log entry',
        details: error.message
      });
    }
  }
}
