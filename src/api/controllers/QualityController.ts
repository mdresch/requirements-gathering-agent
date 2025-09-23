// Quality Controller
// filepath: src/api/controllers/QualityController.ts

import { Request, Response } from 'express';
import QualityAssessmentService from '../../services/QualityAssessmentService.js';
import { ProjectDocument } from '../../models/ProjectDocument.js';
import Joi from 'joi';

export class QualityController {
    private static qualityService: QualityAssessmentService;

    static initialize() {
        try {
            QualityController.qualityService = QualityAssessmentService.getInstance();
            console.log('✅ QualityController initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize QualityController:', error);
            QualityController.qualityService = null as any;
        }
    }

    /**
     * Assess quality for a specific document
     */
    static async assessDocumentQuality(req: Request, res: Response): Promise<void> {
        try {
            const { documentId } = req.params;

            // Validate document ID
            if (!documentId || !documentId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid document ID format'
                });
                return;
            }

            // Get document from database
            const document = await ProjectDocument.findById(documentId);
            if (!document) {
                res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
                return;
            }

            // Check if quality service is available
            if (!QualityController.qualityService) {
                console.log('⚠️ Quality service not initialized, attempting to initialize...');
                QualityController.qualityService = QualityAssessmentService.getInstance();
                if (!QualityController.qualityService) {
                    res.status(500).json({
                        success: false,
                        message: 'Quality service not available'
                    });
                    return;
                }
            }

            // Perform quality assessment
            const qualityResult = await QualityController.qualityService.assessDocumentQuality(
                document.content,
                document.type,
                { projectId: document.projectId },
                document.framework
            );

            // Update document with quality results
            await QualityController.qualityService.updateDocumentQualityScore(documentId, qualityResult);

            res.json({
                success: true,
                message: 'Quality assessment completed successfully',
                data: {
                    documentId,
                    documentName: document.name,
                    qualityResult
                }
            });

        } catch (error) {
            console.error('Error assessing document quality:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to assess document quality',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get quality assessment for a document
     */
    static async getDocumentQuality(req: Request, res: Response): Promise<void> {
        try {
            const { documentId } = req.params;

            // Validate document ID
            if (!documentId || !documentId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid document ID format'
                });
                return;
            }

            // Check if quality service is available
            if (!QualityController.qualityService) {
                console.log('⚠️ Quality service not initialized, attempting to initialize...');
                QualityController.qualityService = QualityAssessmentService.getInstance();
                if (!QualityController.qualityService) {
                    res.status(500).json({
                        success: false,
                        message: 'Quality service not available'
                    });
                    return;
                }
            }

            // Get quality assessment
            const qualityResult = await QualityController.qualityService.getDocumentQualityAssessment(documentId);

            if (!qualityResult) {
                res.status(404).json({
                    success: false,
                    message: 'Quality assessment not found for this document'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Quality assessment retrieved successfully',
                data: qualityResult
            });

        } catch (error) {
            console.error('Error getting document quality:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get document quality assessment',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get quality statistics for a project
     */
    static async getProjectQualityStats(req: Request, res: Response): Promise<void> {
        try {
            const { projectId } = req.params;

            // Validate project ID
            if (!projectId || !projectId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid project ID format'
                });
                return;
            }

            // Get all documents for the project
            const documents = await ProjectDocument.find({
                projectId,
                deletedAt: null
            }).select('name type qualityScore metadata.qualityAssessment');

            // Calculate statistics
            const stats: any = {
                totalDocuments: documents.length,
                averageQualityScore: 0,
                qualityDistribution: {
                    excellent: 0, // 90-100%
                    good: 0,      // 80-89%
                    acceptable: 0, // 70-79%
                    needsWork: 0,  // 60-69%
                    poor: 0        // <60%
                },
                dimensionAverages: {
                    structure: 0,
                    completeness: 0,
                    accuracy: 0,
                    consistency: 0,
                    relevance: 0,
                    professionalQuality: 0,
                    standardsCompliance: 0
                },
                documentsByType: {} as any,
                recentAssessments: [] as any[]
            };

            if (documents.length > 0) {
                let totalScore = 0;
                let dimensionTotals: any = {
                    structure: 0,
                    completeness: 0,
                    accuracy: 0,
                    consistency: 0,
                    relevance: 0,
                    professionalQuality: 0,
                    standardsCompliance: 0
                };
                let dimensionCount = 0;

                documents.forEach(doc => {
                    const qualityScore = doc.qualityScore || 0;
                    totalScore += qualityScore;

                    // Quality distribution
                    if (qualityScore >= 90) stats.qualityDistribution.excellent++;
                    else if (qualityScore >= 80) stats.qualityDistribution.good++;
                    else if (qualityScore >= 70) stats.qualityDistribution.acceptable++;
                    else if (qualityScore >= 60) stats.qualityDistribution.needsWork++;
                    else stats.qualityDistribution.poor++;

                    // Documents by type
                    const docType = doc.type;
                    if (!stats.documentsByType[docType]) {
                        stats.documentsByType[docType] = {
                            count: 0,
                            averageScore: 0,
                            totalScore: 0
                        };
                    }
                    stats.documentsByType[docType].count++;
                    stats.documentsByType[docType].totalScore += qualityScore;

                    // Dimension averages
                    const qualityAssessment = (doc.metadata as any)?.qualityAssessment;
                    if (qualityAssessment && qualityAssessment.dimensionScores) {
                        Object.keys(dimensionTotals).forEach(dimension => {
                            dimensionTotals[dimension] += qualityAssessment.dimensionScores[dimension] || 0;
                        });
                        dimensionCount++;
                    }

                    // Recent assessments (last 5)
                    if (qualityAssessment && stats.recentAssessments.length < 5) {
                        stats.recentAssessments.push({
                            documentId: doc._id,
                            documentName: doc.name,
                            documentType: doc.type,
                            overallScore: qualityAssessment.overallScore,
                            assessmentDate: qualityAssessment.assessmentDate
                        });
                    }
                });

                stats.averageQualityScore = Math.round(totalScore / documents.length);

                // Calculate dimension averages
                if (dimensionCount > 0) {
                    Object.keys(dimensionTotals).forEach(dimension => {
                        stats.dimensionAverages[dimension] = Math.round(dimensionTotals[dimension] / dimensionCount);
                    });
                }

                // Calculate average scores by document type
                Object.keys(stats.documentsByType).forEach(docType => {
                    const typeStats = stats.documentsByType[docType];
                    typeStats.averageScore = Math.round(typeStats.totalScore / typeStats.count);
                });

                // Sort recent assessments by date
                stats.recentAssessments.sort((a: any, b: any) => 
                    new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
                );
            }

            res.json({
                success: true,
                message: 'Project quality statistics retrieved successfully',
                data: {
                    projectId,
                    stats,
                    generatedAt: new Date()
                }
            });

        } catch (error) {
            console.error('Error getting project quality stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get project quality statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Reassess quality for all documents in a project
     */
    static async reassessProjectQuality(req: Request, res: Response): Promise<void> {
        try {
            const { projectId } = req.params;

            // Validate project ID
            if (!projectId || !projectId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid project ID format'
                });
                return;
            }

            // Get all documents for the project
            const documents = await ProjectDocument.find({
                projectId,
                deletedAt: null
            });

            const results: any = {
                totalDocuments: documents.length,
                successfulAssessments: 0,
                failedAssessments: 0,
                updatedDocuments: [] as any[],
                errors: [] as any[]
            };

            // Check if quality service is available
            if (!QualityController.qualityService) {
                console.log('⚠️ Quality service not initialized, attempting to initialize...');
                QualityController.qualityService = QualityAssessmentService.getInstance();
                if (!QualityController.qualityService) {
                    throw new Error('Quality service not initialized');
                }
            }

            // Process each document
            for (const doc of documents) {
                try {
                    const qualityResult = await QualityController.qualityService.assessDocumentQuality(
                        doc.content,
                        doc.type,
                        { projectId: doc.projectId },
                        doc.framework
                    );

                    await QualityController.qualityService.updateDocumentQualityScore(doc._id.toString(), qualityResult);

                    results.successfulAssessments++;
                    results.updatedDocuments.push({
                        documentId: doc._id,
                        documentName: doc.name,
                        documentType: doc.type,
                        newQualityScore: qualityResult.overallScore
                    });

                } catch (error) {
                    results.failedAssessments++;
                    results.errors.push({
                        documentId: doc._id,
                        documentName: doc.name,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            res.json({
                success: true,
                message: `Quality reassessment completed. ${results.successfulAssessments}/${results.totalDocuments} documents updated successfully`,
                data: results
            });

        } catch (error) {
            console.error('Error reassessing project quality:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reassess project quality',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
