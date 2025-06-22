import { v4 as uuidv4 } from 'uuid';
import {
    DocumentConversionRequest,
    DocumentConversionResponse,
    BatchConversionRequest,
    BatchConversionResponse,
    ProcessingStatus,
    InputFormat,
    OutputFormat
} from '../types/api.js';

/**
 * Document Processing Service
 * 
 * Handles the core document conversion logic, integrating with
 * existing ADPA document processing capabilities and Adobe services.
 */
export class DocumentProcessor {
    private activeJobs: Map<string, DocumentJob> = new Map();
    private activeBatches: Map<string, BatchJob> = new Map();

    /**
     * Start a single document conversion
     */
    async startConversion(request: DocumentConversionRequest): Promise<DocumentJob> {
        const jobId = uuidv4();
        const job = new DocumentJob(jobId, request);
        
        this.activeJobs.set(jobId, job);
        
        // Start processing asynchronously
        this.processDocument(job).catch(error => {
            console.error(`Job ${jobId} failed:`, error);
            job.fail(error.message);
        });

        return job;
    }

    /**
     * Start batch document conversion
     */
    async startBatchConversion(request: BatchConversionRequest): Promise<BatchJob> {
        const batchId = uuidv4();
        const batch = new BatchJob(batchId, request);
        
        this.activeBatches.set(batchId, batch);
        
        // Start batch processing asynchronously
        this.processBatch(batch).catch(error => {
            console.error(`Batch ${batchId} failed:`, error);
            batch.fail(error.message);
        });

        return batch;
    }

    /**
     * Process a single document conversion
     */
    private async processDocument(job: DocumentJob): Promise<void> {
        try {
            job.updateStatus(ProcessingStatus.processing);
            
            // Simulate processing time based on content length
            const processingTime = Math.min(job.request.content.length / 100, 30000);
            job.estimatedCompletion = new Date(Date.now() + processingTime);

            // Progress simulation
            for (let progress = 0; progress <= 100; progress += 20) {
                job.updateProgress(progress);
                await this.delay(processingTime / 5);
            }

            // Simulate conversion based on formats
            const result = await this.performConversion(job.request);
            
            job.complete(result.downloadUrl, result.fileSize, result.filename);
            
        } catch (error) {
            job.fail(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    }

    /**
     * Process batch conversion
     */
    private async processBatch(batch: BatchJob): Promise<void> {
        try {
            batch.updateStatus(ProcessingStatus.processing);
            
            const maxParallel = batch.request.options?.maxParallel || 3;
            const continueOnError = batch.request.options?.continueOnError ?? true;

            // Process documents in parallel batches
            for (let i = 0; i < batch.jobs.length; i += maxParallel) {
                const chunk = batch.jobs.slice(i, i + maxParallel);
                
                const promises = chunk.map(async (job) => {
                    try {
                        await this.processDocument(job);
                        batch.successCount++;
                    } catch (error) {
                        batch.failureCount++;
                        if (!continueOnError) {
                            throw error;
                        }
                    }
                });

                await Promise.all(promises);
                batch.updateProgress(Math.round(((i + chunk.length) / batch.jobs.length) * 100));
            }

            batch.complete();
            
        } catch (error) {
            batch.fail(error instanceof Error ? error.message : 'Batch processing failed');
        }
    }

    /**
     * Perform the actual document conversion
     */
    private async performConversion(request: DocumentConversionRequest): Promise<{
        downloadUrl: string;
        fileSize: number;
        filename: string;
    }> {
        // Here we would integrate with existing ADPA conversion logic
        // For now, simulate the conversion process
          const conversionMap: Record<string, string> = {
            [`${InputFormat.markdown}-${OutputFormat.pdf}`]: 'convertMarkdownToPdf',
            [`${InputFormat.markdown}-${OutputFormat.docx}`]: 'convertMarkdownToDocx',
            [`${InputFormat.markdown}-${OutputFormat.html}`]: 'convertMarkdownToHtml',
            [`${InputFormat.markdown}-${OutputFormat.pptx}`]: 'convertMarkdownToPptx',
            [`${InputFormat.html}-${OutputFormat.pdf}`]: 'convertHtmlToPdf',
            [`${InputFormat.docx}-${OutputFormat.pdf}`]: 'convertDocxToPdf'
        };

        const conversionKey = `${request.inputFormat}-${request.outputFormat}`;
        const conversionMethod = conversionMap[conversionKey];

        if (!conversionMethod) {
            throw new Error(`Conversion from ${request.inputFormat} to ${request.outputFormat} is not supported`);
        }

        // Simulate file processing
        await this.delay(1000);

        // Generate mock file data
        const fileExtension = request.outputFormat;
        const filename = `converted_${Date.now()}.${fileExtension}`;
        const downloadUrl = `/api/v1/documents/download/${uuidv4()}`;
        const fileSize = Math.floor(Math.random() * 1000000) + 50000; // 50KB - 1MB

        return {
            downloadUrl,
            fileSize,
            filename
        };
    }

    /**
     * Get conversion job by ID
     */
    getJob(jobId: string): DocumentJob | undefined {
        return this.activeJobs.get(jobId);
    }

    /**
     * Get batch by ID
     */
    getBatch(batchId: string): BatchJob | undefined {
        return this.activeBatches.get(batchId);
    }

    /**
     * Utility method for delays
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Individual document conversion job
 */
export class DocumentJob {
    public id: string;
    public request: DocumentConversionRequest;
    public status: ProcessingStatus = ProcessingStatus.queued;
    public progress: number = 0;
    public createdAt: Date = new Date();
    public completedAt?: Date;
    public estimatedCompletion?: Date;
    public downloadUrl?: string;
    public fileSize?: number;
    public processingDuration?: number;
    public originalFilename?: string;
    public generatedFilename?: string;
    public outputFormat: OutputFormat;
    public error?: { code: string; message: string; retryable: boolean };
    public logs: string[] = [];

    constructor(id: string, request: DocumentConversionRequest) {
        this.id = id;
        this.request = request;
        this.outputFormat = request.outputFormat;
        this.logs.push(`Job ${id} created at ${this.createdAt.toISOString()}`);
    }

    updateStatus(status: ProcessingStatus): void {
        this.status = status;
        this.logs.push(`Status updated to ${status} at ${new Date().toISOString()}`);
    }

    updateProgress(progress: number): void {
        this.progress = progress;
        this.logs.push(`Progress updated to ${progress}% at ${new Date().toISOString()}`);
    }

    complete(downloadUrl: string, fileSize: number, filename: string): void {
        this.status = ProcessingStatus.completed;
        this.completedAt = new Date();
        this.processingDuration = this.completedAt.getTime() - this.createdAt.getTime();
        this.downloadUrl = downloadUrl;
        this.fileSize = fileSize;
        this.generatedFilename = filename;
        this.progress = 100;
        this.logs.push(`Job completed at ${this.completedAt.toISOString()}`);
    }

    fail(message: string, retryable: boolean = true): void {
        this.status = ProcessingStatus.failed;
        this.completedAt = new Date();
        this.processingDuration = this.completedAt.getTime() - this.createdAt.getTime();
        this.error = {
            code: 'CONVERSION_FAILED',
            message,
            retryable
        };
        this.logs.push(`Job failed at ${this.completedAt.toISOString()}: ${message}`);
    }
}

/**
 * Batch conversion job
 */
export class BatchJob {
    public id: string;
    public request: BatchConversionRequest;
    public jobs: DocumentJob[] = [];
    public status: ProcessingStatus = ProcessingStatus.queued;
    public progress: number = 0;
    public successCount: number = 0;
    public failureCount: number = 0;
    public createdAt: Date = new Date();
    public completedAt?: Date;
    public totalDuration?: number;

    constructor(id: string, request: BatchConversionRequest) {
        this.id = id;
        this.request = request;
        
        // Create individual jobs for each document
        this.jobs = request.documents.map(doc => {
            const jobId = uuidv4();
            return new DocumentJob(jobId, doc);
        });
    }

    updateStatus(status: ProcessingStatus): void {
        this.status = status;
    }

    updateProgress(progress: number): void {
        this.progress = progress;
    }

    complete(): void {
        this.status = ProcessingStatus.completed;
        this.completedAt = new Date();
        this.totalDuration = this.completedAt.getTime() - this.createdAt.getTime();
        this.progress = 100;
    }

    fail(message: string): void {
        this.status = ProcessingStatus.failed;
        this.completedAt = new Date();
        this.totalDuration = this.completedAt.getTime() - this.createdAt.getTime();
    }
}
