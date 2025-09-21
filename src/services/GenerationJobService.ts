import { GenerationJobModel, IGenerationJob } from '../models/GenerationJob.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateGenerationJobRequest {
  projectId: string;
  templateId: string;
  templateName: string;
  outputFormat: string;
  metadata?: {
    framework?: string;
    category?: string;
    documentType?: string;
    generatedBy?: string;
    estimatedDuration?: number;
  };
}

export interface UpdateJobProgressRequest {
  progress?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  outputPath?: string;
  downloadUrl?: string;
  metadata?: Partial<IGenerationJob['metadata']>;
}

export class GenerationJobService {
  private static instance: GenerationJobService;

  private constructor() {}

  public static getInstance(): GenerationJobService {
    if (!GenerationJobService.instance) {
      GenerationJobService.instance = new GenerationJobService();
    }
    return GenerationJobService.instance;
  }

  /**
   * Create a new generation job
   */
  public async createJob(request: CreateGenerationJobRequest): Promise<IGenerationJob> {
    try {
      const jobId = uuidv4();
      
      const job = new GenerationJobModel({
        id: jobId,
        projectId: request.projectId,
        templateId: request.templateId,
        templateName: request.templateName,
        status: 'pending',
        progress: 0,
        outputFormat: request.outputFormat,
        metadata: {
          framework: request.metadata?.framework || 'multi',
          category: request.metadata?.category || 'general',
          documentType: request.metadata?.documentType || 'document',
          generatedBy: request.metadata?.generatedBy || 'ADPA-System',
          estimatedDuration: request.metadata?.estimatedDuration || 30000, // 30 seconds default
          ...request.metadata
        },
        logs: [{
          timestamp: new Date(),
          level: 'info',
          message: `Generation job created for template: ${request.templateName}`
        }]
      });

      await job.save();
      
      logger.info(`✅ Created generation job: ${jobId} for template: ${request.templateName}`);
      return job;
    } catch (error) {
      logger.error('❌ Error creating generation job:', error);
      throw new Error(`Failed to create generation job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update job progress and status
   */
  public async updateJob(jobId: string, update: UpdateJobProgressRequest): Promise<IGenerationJob | null> {
    try {
      const job = await GenerationJobModel.findOne({ id: jobId });
      if (!job) {
        logger.warn(`⚠️ Generation job not found: ${jobId}`);
        return null;
      }

      // Update fields
      if (update.progress !== undefined) {
        job.progress = update.progress;
      }
      
      if (update.status) {
        job.status = update.status;
        
        // Set timestamps based on status
        if (update.status === 'processing' && !job.startedAt) {
          job.startedAt = new Date();
        } else if ((update.status === 'completed' || update.status === 'failed') && !job.completedAt) {
          job.completedAt = new Date();
          
          // Calculate actual duration
          if (job.startedAt) {
            job.metadata.actualDuration = job.completedAt.getTime() - job.startedAt.getTime();
          }
        }
      }

      if (update.error) {
        job.error = update.error;
        job.logs.push({
          timestamp: new Date(),
          level: 'error',
          message: update.error
        });
      }

      if (update.outputPath) {
        job.outputPath = update.outputPath;
      }

      if (update.downloadUrl) {
        job.downloadUrl = update.downloadUrl;
      }

      if (update.metadata) {
        job.metadata = { ...job.metadata, ...update.metadata };
      }

      job.updatedAt = new Date();
      await job.save();

      logger.info(`✅ Updated generation job: ${jobId} - Status: ${job.status}, Progress: ${job.progress}%`);
      return job;
    } catch (error) {
      logger.error(`❌ Error updating generation job ${jobId}:`, error);
      throw new Error(`Failed to update generation job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Add log entry to job
   */
  public async addLog(jobId: string, level: 'info' | 'warning' | 'error', message: string): Promise<void> {
    try {
      const job = await GenerationJobModel.findOne({ id: jobId });
      if (!job) {
        logger.warn(`⚠️ Generation job not found for logging: ${jobId}`);
        return;
      }

      job.logs.push({
        timestamp: new Date(),
        level,
        message
      });

      await job.save();
    } catch (error) {
      logger.error(`❌ Error adding log to generation job ${jobId}:`, error);
    }
  }

  /**
   * Get job by ID
   */
  public async getJob(jobId: string): Promise<IGenerationJob | null> {
    try {
      return await GenerationJobModel.findOne({ id: jobId });
    } catch (error) {
      logger.error(`❌ Error retrieving generation job ${jobId}:`, error);
      return null;
    }
  }

  /**
   * Get jobs for a project
   */
  public async getProjectJobs(projectId: string, limit: number = 50, skip: number = 0): Promise<IGenerationJob[]> {
    try {
      return await GenerationJobModel
        .find({ projectId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      logger.error(`❌ Error retrieving jobs for project ${projectId}:`, error);
      return [];
    }
  }

  /**
   * Get jobs by status
   */
  public async getJobsByStatus(status: string, limit: number = 50): Promise<IGenerationJob[]> {
    try {
      return await GenerationJobModel
        .find({ status })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error(`❌ Error retrieving jobs by status ${status}:`, error);
      return [];
    }
  }

  /**
   * Get active jobs (pending or processing)
   */
  public async getActiveJobs(): Promise<IGenerationJob[]> {
    try {
      return await GenerationJobModel
        .find({ status: { $in: ['pending', 'processing'] } })
        .sort({ createdAt: 1 }); // Oldest first for processing order
    } catch (error) {
      logger.error('❌ Error retrieving active jobs:', error);
      return [];
    }
  }

  /**
   * Cancel a job
   */
  public async cancelJob(jobId: string): Promise<boolean> {
    try {
      const job = await GenerationJobModel.findOne({ id: jobId });
      if (!job) {
        logger.warn(`⚠️ Generation job not found for cancellation: ${jobId}`);
        return false;
      }

      if (job.status === 'completed' || job.status === 'failed') {
        logger.warn(`⚠️ Cannot cancel completed or failed job: ${jobId}`);
        return false;
      }

      await this.updateJob(jobId, {
        status: 'cancelled',
        error: 'Job cancelled by user'
      });

      logger.info(`✅ Cancelled generation job: ${jobId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Error cancelling generation job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Get job statistics
   */
  public async getJobStats(projectId?: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageDuration: number;
  }> {
    try {
      const filter = projectId ? { projectId } : {};
      
      const stats = await GenerationJobModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgDuration: { $avg: '$metadata.actualDuration' }
          }
        }
      ]);

      const result = {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        averageDuration: 0
      };

      stats.forEach(stat => {
        result[stat._id as keyof typeof result] = stat.count;
        result.total += stat.count;
        if (stat.avgDuration && stat._id === 'completed') {
          result.averageDuration = Math.round(stat.avgDuration);
        }
      });

      return result;
    } catch (error) {
      logger.error('❌ Error retrieving job statistics:', error);
      return {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        averageDuration: 0
      };
    }
  }
}
