import {
    DocumentJob,
    BatchJob
} from './DocumentProcessor.js';
import {
    PaginatedResponse,
    ProcessingStatus,
    OutputFormat,
    DocumentConversionResponse
} from '../types/api.js';

/**
 * Job Management Service
 * 
 * Handles job storage, retrieval, and lifecycle management
 * for document conversion operations.
 */
export class JobManager {
    private jobs: Map<string, DocumentJob> = new Map();
    private batches: Map<string, BatchJob> = new Map();

    /**
     * Get job by ID
     */
    async getJob(jobId: string): Promise<DocumentJob | null> {
        return this.jobs.get(jobId) || null;
    }

    /**
     * Get batch by ID
     */
    async getBatch(batchId: string): Promise<BatchJob | null> {
        return this.batches.get(batchId) || null;
    }


    /**
     * Store batch
     */
    async storeBatch(batch: BatchJob): Promise<void> {
        this.batches.set(batch.id, batch);
    }

    /**
     * Cancel a job
     */
    async cancelJob(jobId: string): Promise<{
        success: boolean;
        message: string;
        statusCode?: number;
        errorCode?: string;
    }> {
        const job = this.jobs.get(jobId);
        
        if (!job) {
            return {
                success: false,
                message: `Job with ID ${jobId} not found`,
                statusCode: 404,
                errorCode: 'RESOURCE_NOT_FOUND'
            };
        }

        if (job.status === ProcessingStatus.completed) {
            return {
                success: false,
                message: 'Cannot cancel completed job',
                statusCode: 409,
                errorCode: 'RESOURCE_CONFLICT'
            };
        }

        if (job.status === ProcessingStatus.cancelled) {
            return {
                success: false,
                message: 'Job is already cancelled',
                statusCode: 409,
                errorCode: 'RESOURCE_CONFLICT'
            };
        }

        job.updateStatus(ProcessingStatus.cancelled);
        
        return {
            success: true,
            message: 'Job cancelled successfully'
        };
    }

    /**
     * List jobs with filtering and pagination
     */
    async listJobs(params: {
        page: number;
        limit: number;
        sort: string;
        order: 'asc' | 'desc';
        filters: {
            status?: ProcessingStatus;
            fromDate?: Date;
            toDate?: Date;
            outputFormat?: OutputFormat;
            search?: string;
        };
    }): Promise<PaginatedResponse<DocumentConversionResponse>> {
        let filteredJobs = Array.from(this.jobs.values());

        // Apply filters
        if (params.filters.status) {
            filteredJobs = filteredJobs.filter(job => job.status === params.filters.status);
        }

        if (params.filters.fromDate) {
            filteredJobs = filteredJobs.filter(job => job.createdAt >= params.filters.fromDate!);
        }

        if (params.filters.toDate) {
            filteredJobs = filteredJobs.filter(job => job.createdAt <= params.filters.toDate!);
        }

        if (params.filters.outputFormat) {
            filteredJobs = filteredJobs.filter(job => job.request.outputFormat === params.filters.outputFormat);
        }

        if (params.filters.search) {
            const searchTerm = params.filters.search.toLowerCase();
            filteredJobs = filteredJobs.filter(job => 
                job.generatedFilename?.toLowerCase().includes(searchTerm) ||
                job.originalFilename?.toLowerCase().includes(searchTerm) ||
                job.request.metadata?.title?.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filteredJobs.sort((a, b) => {
            let aValue: any = a[params.sort as keyof DocumentJob];
            let bValue: any = b[params.sort as keyof DocumentJob];

            if (aValue instanceof Date) aValue = aValue.getTime();
            if (bValue instanceof Date) bValue = bValue.getTime();

            if (params.order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        // Apply pagination
        const total = filteredJobs.length;
        const totalPages = Math.ceil(total / params.limit);
        const offset = (params.page - 1) * params.limit;
        const paginatedJobs = filteredJobs.slice(offset, offset + params.limit);

        // Convert to response format
        const items: DocumentConversionResponse[] = paginatedJobs.map(job => ({
            jobId: job.id,
            status: job.status,
            downloadUrl: job.downloadUrl,
            fileSize: job.fileSize,
            progress: job.progress,
            estimatedCompletion: job.estimatedCompletion,
            createdAt: job.createdAt,
            completedAt: job.completedAt,
            processingDuration: job.processingDuration,
            outputFormat: job.request.outputFormat,
            originalFilename: job.originalFilename,
            generatedFilename: job.generatedFilename,
            error: job.error,
            logs: job.logs
        }));

        return {
            items,
            pagination: {
                page: params.page,
                limit: params.limit,
                total,
                totalPages,
                hasNext: params.page < totalPages,
                hasPrev: params.page > 1
            }
        };
    }

    /**
     * Get conversion statistics
     */
    async getStatistics(params: {
        fromDate?: Date;
        toDate?: Date;
        groupBy: 'hour' | 'day' | 'week' | 'month';
    }) {
        let jobs = Array.from(this.jobs.values());

        // Apply date filters
        if (params.fromDate) {
            jobs = jobs.filter(job => job.createdAt >= params.fromDate!);
        }

        if (params.toDate) {
            jobs = jobs.filter(job => job.createdAt <= params.toDate!);
        }

        const totalJobs = jobs.length;
        const successfulJobs = jobs.filter(job => job.status === ProcessingStatus.completed).length;
        const failedJobs = jobs.filter(job => job.status === ProcessingStatus.failed).length;
        const successRate = totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0;

        // Calculate processing time statistics
        const completedJobs = jobs.filter(job => job.processingDuration);
        const processingTimes = completedJobs.map(job => job.processingDuration!);
        
        const processingTime = {
            average: processingTimes.length > 0 ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length) : 0,
            min: processingTimes.length > 0 ? Math.min(...processingTimes) : 0,
            max: processingTimes.length > 0 ? Math.max(...processingTimes) : 0,
            median: processingTimes.length > 0 ? this.calculateMedian(processingTimes) : 0
        };

        // Format breakdown
        const inputFormatBreakdown: Record<string, number> = {};
        const outputFormatBreakdown: Record<string, number> = {};
        const errorBreakdown: Record<string, number> = {};

        jobs.forEach(job => {
            // Input format breakdown
            const inputFormat = job.request.inputFormat;
            inputFormatBreakdown[inputFormat] = (inputFormatBreakdown[inputFormat] || 0) + 1;

            // Output format breakdown
            const outputFormat = job.request.outputFormat;
            outputFormatBreakdown[outputFormat] = (outputFormatBreakdown[outputFormat] || 0) + 1;

            // Error breakdown
            if (job.error) {
                const errorCode = job.error.code;
                errorBreakdown[errorCode] = (errorBreakdown[errorCode] || 0) + 1;
            }
        });

        return {
            totalJobs,
            successfulJobs,
            failedJobs,
            successRate,
            processingTime,
            inputFormatBreakdown,
            outputFormatBreakdown,
            errorBreakdown,
            generatedAt: new Date()
        };
    }

    /**
     * Retry a failed job
     */
    async retryJob(jobId: string, options?: any): Promise<{
        success: boolean;
        message: string;
        statusCode?: number;
        errorCode?: string;
        job?: DocumentConversionResponse;
    }> {
        const job = this.jobs.get(jobId);
        
        if (!job) {
            return {
                success: false,
                message: `Job with ID ${jobId} not found`,
                statusCode: 404,
                errorCode: 'RESOURCE_NOT_FOUND'
            };
        }

        if (job.status !== ProcessingStatus.failed) {
            return {
                success: false,
                message: 'Only failed jobs can be retried',
                statusCode: 409,
                errorCode: 'RESOURCE_CONFLICT'
            };
        }

        // Reset job state for retry
        job.updateStatus(ProcessingStatus.queued);
        job.progress = 0;
        job.error = undefined;
        job.downloadUrl = undefined;
        job.completedAt = undefined;
        job.processingDuration = undefined;

        // Apply any updated options
        if (options) {
            job.request.options = { ...job.request.options, ...options };
        }

        return {
            success: true,
            message: 'Job queued for retry',
            job: {
                jobId: job.id,
                status: job.status,
                progress: job.progress,
                createdAt: job.createdAt,
                outputFormat: job.request.outputFormat
            }
        };
    }

    /**
     * Get file data for download
     */
    async getJobFile(jobId: string): Promise<{
        content: Buffer;
        contentType: string;
        filename: string;
        size: number;
    }> {
        const fs = await import('fs/promises');
        const path = await import('path');
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Job with ID ${jobId} not found`);
        }
        if (job.status !== ProcessingStatus.completed) {
            throw new Error('Document is not ready for download');
        }
        // Determine file path
        const outputDir = path.resolve(process.cwd(), 'generated-documents', 'job-output');
        const filename = job.generatedFilename || `document.${job.request.outputFormat}`;
        const filePath = path.join(outputDir, `${jobId}-${filename}`);
        // Read file from disk
        let content;
        try {
            content = await fs.readFile(filePath);
        } catch (e) {
            throw new Error(`Generated file not found for job ${jobId}`);
        }
        const contentTypeMap: Record<string, string> = {
            pdf: 'application/pdf',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            html: 'text/html',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        };
        return {
            content,
            contentType: contentTypeMap[job.request.outputFormat] || 'application/octet-stream',
            filename,
            size: content.length
        };
    }

    /**
     * Calculate median from array of numbers
     */
    private calculateMedian(numbers: number[]): number {
        const sorted = numbers.slice().sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
        }
        return sorted[middle];
    }

    /**
     * Store job
     */
    async storeJob(job: DocumentJob): Promise<void> {
        this.jobs.set(job.id, job);
        // If job is completed and has output, write file to disk
        if (job.status === ProcessingStatus.completed && job.generatedContent) {
            const fs = await import('fs/promises');
            const path = await import('path');
            const outputDir = path.resolve(process.cwd(), 'generated-documents', 'job-output');
            await fs.mkdir(outputDir, { recursive: true });
            const filename = job.generatedFilename || `document.${job.request.outputFormat}`;
            const filePath = path.join(outputDir, `${job.id}-${filename}`);
            await fs.writeFile(filePath, job.generatedContent);
        }
    }
}
