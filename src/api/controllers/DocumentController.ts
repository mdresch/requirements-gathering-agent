import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DocumentProcessor } from '../services/DocumentProcessor.js';
import { JobManager } from '../services/JobManager.js';
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
 * Document Processing API Controller
 * 
 * Implements the TypeSpec-defined document processing endpoints
 * with full CRUD operations for document conversion jobs.
 */
export class DocumentController {
    private static documentProcessor = new DocumentProcessor();
    private static jobManager = new JobManager();

    /**
     * Convert a single document
     * POST /api/v1/documents/convert
     */
    static async convertDocument(req: Request, res: Response, next: NextFunction) {
        try {
            const request: DocumentConversionRequest = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            // Validate request
            if (!request.content || !request.inputFormat || !request.outputFormat) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_REQUIRED_FIELD',
                        message: 'Missing required fields: content, inputFormat, or outputFormat',
                        timestamp: new Date().toISOString(),
                        errorId: uuidv4()
                    },
                    requestId
                });
            }

            // Start document conversion
            const job = await DocumentController.documentProcessor.startConversion(request);
            
            const response: DocumentConversionResponse = {
                jobId: job.id,
                status: job.status as ProcessingStatus,
                progress: job.progress,
                createdAt: job.createdAt,
                outputFormat: request.outputFormat,
                estimatedCompletion: job.estimatedCompletion
            };

            res.status(202).json({
                success: true,
                data: response,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Convert multiple documents in batch
     * POST /api/v1/documents/batch/convert
     */
    static async batchConvert(req: Request, res: Response, next: NextFunction) {
        try {
            const request: BatchConversionRequest = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            // Validate batch request
            if (!request.documents || request.documents.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'Batch request must contain at least one document',
                        timestamp: new Date().toISOString()
                    },
                    requestId
                });
            }

            if (request.documents.length > 100) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'Batch request cannot exceed 100 documents',
                        timestamp: new Date().toISOString()
                    },
                    requestId
                });
            }

            // Start batch conversion
            const batch = await DocumentController.documentProcessor.startBatchConversion(request);
            
            const response: BatchConversionResponse = {
                batchId: batch.id,
                jobs: batch.jobs,
                status: batch.status as ProcessingStatus,
                progress: batch.progress,
                successCount: batch.successCount,
                failureCount: batch.failureCount,
                createdAt: batch.createdAt,
                batchName: request.batchName
            };

            res.status(202).json({
                success: true,
                data: response,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get job status
     * GET /api/v1/documents/jobs/:jobId
     */
    static async getJobStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            const job = await DocumentController.jobManager.getJob(jobId);
            
            if (!job) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'RESOURCE_NOT_FOUND',
                        message: `Job with ID ${jobId} not found`,
                        timestamp: new Date().toISOString()
                    },
                    requestId
                });
            }

            const response: DocumentConversionResponse = {
                jobId: job.id,
                status: job.status as ProcessingStatus,
                downloadUrl: job.downloadUrl,
                fileSize: job.fileSize,
                progress: job.progress,
                estimatedCompletion: job.estimatedCompletion,
                createdAt: job.createdAt,
                completedAt: job.completedAt,
                processingDuration: job.processingDuration,
                outputFormat: job.outputFormat as OutputFormat,
                originalFilename: job.originalFilename,
                generatedFilename: job.generatedFilename,
                error: job.error,
                logs: job.logs
            };

            res.json({
                success: true,
                data: response,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Download converted document
     * GET /api/v1/documents/download/:jobId
     */
    static async downloadDocument(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;

            const job = await DocumentController.jobManager.getJob(jobId);
            
            if (!job) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'RESOURCE_NOT_FOUND',
                        message: `Job with ID ${jobId} not found`,
                        timestamp: new Date().toISOString()
                    }
                });
            }

            if (job.status !== 'completed') {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'Document is not ready for download',
                        details: `Current status: ${job.status}`,
                        timestamp: new Date().toISOString()
                    }
                });
            }

            // Get file content and metadata
            const fileData = await DocumentController.jobManager.getJobFile(jobId);
            
            // Set response headers
            res.setHeader('Content-Type', fileData.contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
            res.setHeader('Content-Length', fileData.size);

            // Stream file content
            res.send(fileData.content);

        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel conversion job
     * DELETE /api/v1/documents/jobs/:jobId
     */
    static async cancelJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            const result = await DocumentController.jobManager.cancelJob(jobId);
            
            if (!result.success) {
                return res.status(result.statusCode || 400).json({
                    success: false,
                    error: {
                        code: result.errorCode || 'OPERATION_FAILED',
                        message: result.message,
                        timestamp: new Date().toISOString()
                    },
                    requestId
                });
            }

            res.json({
                success: true,
                data: null,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * List conversion jobs
     * GET /api/v1/documents/jobs
     */
    static async listJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                page = 1,
                limit = 20,
                sort = 'createdAt',
                order = 'desc',
                status,
                fromDate,
                toDate,
                outputFormat,
                search
            } = req.query;

            const requestId = req.headers['x-request-id'] as string || uuidv4();

            const filters = {
                status: status as ProcessingStatus,
                fromDate: fromDate ? new Date(fromDate as string) : undefined,
                toDate: toDate ? new Date(toDate as string) : undefined,
                outputFormat: outputFormat as OutputFormat,
                search: search as string
            };

            const result = await DocumentController.jobManager.listJobs({
                page: parseInt(page as string),
                limit: Math.min(parseInt(limit as string), 100),
                sort: sort as string,
                order: order as 'asc' | 'desc',
                filters
            });

            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get conversion statistics
     * GET /api/v1/documents/stats
     */
    static async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                fromDate,
                toDate,
                groupBy = 'day'
            } = req.query;

            const requestId = req.headers['x-request-id'] as string || uuidv4();

            const stats = await DocumentController.jobManager.getStatistics({
                fromDate: fromDate ? new Date(fromDate as string) : undefined,
                toDate: toDate ? new Date(toDate as string) : undefined,
                groupBy: groupBy as 'hour' | 'day' | 'week' | 'month'
            });

            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Retry failed job
     * POST /api/v1/documents/jobs/:jobId/retry
     */
    static async retryJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const options = req.body;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            const result = await DocumentController.jobManager.retryJob(jobId, options);
            
            if (!result.success) {
                return res.status(result.statusCode || 400).json({
                    success: false,
                    error: {
                        code: result.errorCode || 'OPERATION_FAILED',
                        message: result.message,
                        timestamp: new Date().toISOString()
                    },
                    requestId
                });
            }

            res.json({
                success: true,
                data: result.job,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get supported format combinations
     * GET /api/v1/documents/formats
     */
    static async getSupportedFormats(req: Request, res: Response, next: NextFunction) {
        try {
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            const formats = {
                inputFormats: Object.values(InputFormat),
                outputFormats: Object.values(OutputFormat),
                conversions: [
                    { input: InputFormat.markdown, outputs: [OutputFormat.pdf, OutputFormat.docx, OutputFormat.html, OutputFormat.pptx] },
                    { input: InputFormat.html, outputs: [OutputFormat.pdf, OutputFormat.docx] },
                    { input: InputFormat.docx, outputs: [OutputFormat.pdf, OutputFormat.html] },
                    { input: InputFormat.txt, outputs: [OutputFormat.pdf, OutputFormat.docx, OutputFormat.html] },
                    { input: InputFormat.rtf, outputs: [OutputFormat.pdf, OutputFormat.docx, OutputFormat.html] }
                ]
            };

            res.json({
                success: true,
                data: formats,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Get batch status
     * GET /api/v1/documents/batch/:batchId
     */
    static async getBatchStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { batchId } = req.params;
            const requestId = req.headers['x-request-id'] as string || uuidv4();

            const batch = await DocumentController.jobManager.getBatch(batchId);
            
            if (!batch) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'RESOURCE_NOT_FOUND',
                        message: `Batch with ID ${batchId} not found`,
                        timestamp: new Date().toISOString()
                    },
                    requestId
                });
            }

            res.json({
                success: true,
                data: batch,
                timestamp: new Date().toISOString(),
                requestId
            });

        } catch (error) {
            next(error);
        }
    }
}
