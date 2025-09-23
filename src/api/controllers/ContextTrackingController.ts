import { Request, Response, NextFunction } from 'express';
import { AIContextTrackingService } from '../../services/AIContextTrackingService.js';
import { logger } from '../../utils/logger.js';

export class ContextTrackingController {
    /**
     * Get context utilization analytics for a project
     */
    static async getProjectAnalytics(req: Request, res: Response, next: NextFunction) {
        try {
            const { projectId } = req.params;
            const requestId = req.headers['x-request-id'] as string || 'unknown';

            if (!projectId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_PROJECT_ID',
                        message: 'Project ID is required'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            logger.info(`Getting context analytics for project: ${projectId}`, { requestId });

            const analytics = await AIContextTrackingService.getProjectAnalytics(projectId);

            res.json({
                success: true,
                data: analytics,
                requestId,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Failed to get project context analytics', { 
                error: error.message, 
                projectId: req.params.projectId,
                requestId: req.headers['x-request-id']
            });
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'ANALYTICS_FETCH_FAILED',
                    message: 'Failed to fetch context analytics'
                },
                requestId: req.headers['x-request-id'] as string || 'unknown',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get traceability matrix for a document
     */
    static async getDocumentTraceability(req: Request, res: Response, next: NextFunction) {
        try {
            const { documentId } = req.params;
            const requestId = req.headers['x-request-id'] as string || 'unknown';

            if (!documentId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_DOCUMENT_ID',
                        message: 'Document ID is required'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            logger.info(`Getting traceability matrix for document: ${documentId}`, { requestId });

            const traceability = await AIContextTrackingService.getTraceabilityMatrix(documentId);

            res.json({
                success: true,
                data: traceability,
                requestId,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Failed to get document traceability', { 
                error: error.message, 
                documentId: req.params.documentId,
                requestId: req.headers['x-request-id']
            });
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'TRACEABILITY_FETCH_FAILED',
                    message: 'Failed to fetch document traceability'
                },
                requestId: req.headers['x-request-id'] as string || 'unknown',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get context utilization metrics for a specific document
     */
    static async getDocumentContextMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            const { documentId } = req.params;
            const requestId = req.headers['x-request-id'] as string || 'unknown';

            if (!documentId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_DOCUMENT_ID',
                        message: 'Document ID is required'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            logger.info(`Getting context metrics for document: ${documentId}`, { requestId });

            const contextMetrics = await AIContextTrackingService.getDocumentContextMetrics(documentId);

            res.json({
                success: true,
                data: contextMetrics,
                requestId,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Failed to get document context metrics', { 
                error: error.message, 
                documentId: req.params.documentId,
                requestId: req.headers['x-request-id']
            });
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'CONTEXT_METRICS_FETCH_FAILED',
                    message: 'Failed to fetch document context metrics'
                },
                requestId: req.headers['x-request-id'] as string || 'unknown',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get context utilization details for a specific generation job
     */
    static async getGenerationJobDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.params;
            const requestId = req.headers['x-request-id'] as string || 'unknown';

            if (!jobId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_JOB_ID',
                        message: 'Generation job ID is required'
                    },
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

            logger.info(`Getting generation job details: ${jobId}`, { requestId });

            // This would typically fetch from the database
            // For now, return a placeholder response
            res.json({
                success: true,
                data: {
                    jobId,
                    message: 'Generation job details endpoint - implementation pending'
                },
                requestId,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Failed to get generation job details', { 
                error: error.message, 
                jobId: req.params.jobId,
                requestId: req.headers['x-request-id']
            });
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'JOB_DETAILS_FETCH_FAILED',
                    message: 'Failed to fetch generation job details'
                },
                requestId: req.headers['x-request-id'] as string || 'unknown',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get system-wide context utilization statistics
     */
    static async getSystemAnalytics(req: Request, res: Response, next: NextFunction) {
        try {
            const requestId = req.headers['x-request-id'] as string || 'unknown';

            logger.info('Getting system-wide context analytics', { requestId });

            // This would aggregate data across all projects
            // For now, return a placeholder response
            res.json({
                success: true,
                data: {
                    totalGenerations: 0,
                    averageUtilization: 0,
                    totalTokensUsed: 0,
                    totalCost: 0,
                    topProviders: [],
                    utilizationTrends: []
                },
                requestId,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Failed to get system analytics', { 
                error: error.message,
                requestId: req.headers['x-request-id']
            });
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'SYSTEM_ANALYTICS_FETCH_FAILED',
                    message: 'Failed to fetch system analytics'
                },
                requestId: req.headers['x-request-id'] as string || 'unknown',
                timestamp: new Date().toISOString()
            });
        }
    }
}
