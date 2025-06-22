import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';

export interface ConversionJob {
  id: string;
  templateId: string;
  data: any;
  outputFormat: string;
  options: any;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
  filename?: string;
  mimeType?: string;
  filePath?: string;
}

export class DocumentService {
  private jobs: Map<string, ConversionJob> = new Map();

  async createConversionJob(jobData: ConversionJob): Promise<ConversionJob> {
    logger.info(`Creating conversion job ${jobData.id}`);
    
    this.jobs.set(jobData.id, jobData);
    
    // Simulate async processing
    this.simulateProcessing(jobData.id);
    
    return jobData;
  }

  async createBatchConversionJobs(
    batchId: string,
    jobs: any[],
    userId: string,
    options: any
  ): Promise<ConversionJob[]> {
    logger.info(`Creating batch conversion jobs for batch ${batchId}`);
    
    const conversionJobs: ConversionJob[] = jobs.map(job => ({
      id: uuidv4(),
      templateId: job.templateId,
      data: job.data,
      outputFormat: job.outputFormat || 'docx',
      options: options,
      userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      filename: job.filename
    }));

    // Store all jobs
    for (const job of conversionJobs) {
      this.jobs.set(job.id, job);
      this.simulateProcessing(job.id);
    }

    return conversionJobs;
  }

  async getJobStatus(jobId: string, userId?: string): Promise<ConversionJob | null> {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      return null;
    }

    // Basic access control - users can only see their own jobs
    if (userId && job.userId !== userId && userId !== 'admin') {
      return null;
    }

    return job;
  }

  async downloadDocument(jobId: string, userId?: string): Promise<{
    stream: any;
    filename: string;
    mimeType: string;
  }> {
    const job = await this.getJobStatus(jobId, userId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'completed') {
      throw new Error('Document not ready for download');
    }

    // Mock file stream
    const stream = {
      pipe: (res: any) => {
        res.write(`Mock document content for job ${jobId}`);
        res.end();
      }
    };

    return {
      stream,
      filename: job.filename || `document-${jobId}.${job.outputFormat}`,
      mimeType: this.getMimeType(job.outputFormat)
    };
  }

  async listJobs(
    page: number,
    limit: number,
    sort: string,
    order: string,
    filters: {
      userId?: string;
      status?: string;
      templateId?: string;
      createdAfter?: Date;
      createdBefore?: Date;
    }
  ): Promise<{
    jobs: ConversionJob[];
    total: number;
    page: number;
    limit: number;
  }> {
    let allJobs = Array.from(this.jobs.values());

    // Apply filters
    if (filters.userId) {
      allJobs = allJobs.filter(job => job.userId === filters.userId);
    }
    
    if (filters.status) {
      allJobs = allJobs.filter(job => job.status === filters.status);
    }
    
    if (filters.templateId) {
      allJobs = allJobs.filter(job => job.templateId === filters.templateId);
    }

    if (filters.createdAfter) {
      allJobs = allJobs.filter(job => job.createdAt >= filters.createdAfter!);
    }

    if (filters.createdBefore) {
      allJobs = allJobs.filter(job => job.createdAt <= filters.createdBefore!);
    }

    // Apply sorting
    allJobs.sort((a, b) => {
      let comparison = 0;
      
      switch (sort) {
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }

      return order === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = allJobs.slice(startIndex, endIndex);

    return {
      jobs: paginatedJobs,
      total: allJobs.length,
      page,
      limit
    };
  }

  async cancelJob(jobId: string, userId?: string): Promise<boolean> {
    const job = await this.getJobStatus(jobId, userId);
    
    if (!job) {
      return false;
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return false; // Cannot cancel completed/failed jobs
    }

    job.status = 'cancelled';
    job.updatedAt = new Date();
    
    this.jobs.set(jobId, job);
    
    logger.info(`Job ${jobId} cancelled by user ${userId}`);
    return true;
  }

  private simulateProcessing(jobId: string): void {
    // Simulate async processing
    setTimeout(() => {
      const job = this.jobs.get(jobId);
      if (job && job.status === 'pending') {
        job.status = 'processing';
        job.progress = 25;
        job.updatedAt = new Date();
        this.jobs.set(jobId, job);

        setTimeout(() => {
          const job = this.jobs.get(jobId);
          if (job && job.status === 'processing') {
            job.status = 'completed';
            job.progress = 100;
            job.completedAt = new Date();
            job.updatedAt = new Date();
            job.filename = `document-${jobId}.${job.outputFormat}`;
            job.mimeType = this.getMimeType(job.outputFormat);
            this.jobs.set(jobId, job);
            
            logger.info(`Job ${jobId} completed successfully`);
          }
        }, 15000); // Complete after 15 seconds
      }
    }, 5000); // Start processing after 5 seconds
  }

  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'pdf': 'application/pdf',
      'html': 'text/html'
    };
    
    return mimeTypes[format] || 'application/octet-stream';
  }
}
