/**
 * Database-First Document Service
 * 
 * This service ensures that database-stored documents take priority over
 * template/processor files and prevents overwriting of manually modified content.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 */

import { ProjectDocument } from '../models/ProjectDocument.js';
import { DOCUMENT_CONFIG } from '../modules/fileManager.js';

export interface DocumentPreservationResult {
    documentId: string;
    action: 'preserved' | 'updated' | 'created';
    reason: string;
    wasManuallyModified: boolean;
}

export class DatabaseFirstDocumentService {
    private static instance: DatabaseFirstDocumentService;

    public static getInstance(): DatabaseFirstDocumentService {
        if (!DatabaseFirstDocumentService.instance) {
            DatabaseFirstDocumentService.instance = new DatabaseFirstDocumentService();
        }
        return DatabaseFirstDocumentService.instance;
    }

    /**
     * Save or update a document with database-first approach
     * @param documentKey The document key (e.g., 'stakeholder-analysis')
     * @param content The document content
     * @param projectId The project ID
     * @param task The generation task
     * @returns Document preservation result
     */
    public async saveDocumentWithPreservation(
        documentKey: string,
        content: string,
        projectId: string,
        task: any
    ): Promise<DocumentPreservationResult> {
        try {
            const config = DOCUMENT_CONFIG[documentKey];
            if (!config) {
                throw new Error(`No configuration found for document key: ${documentKey}`);
            }

            // Check if document already exists
            const existingDocument = await ProjectDocument.findOne({
                projectId: projectId,
                type: documentKey,
                deletedAt: null
            });

            if (existingDocument) {
                const isManuallyModified = this.isDocumentManuallyModified(existingDocument);
                
                if (isManuallyModified) {
                    console.log(`🛡️ PRESERVING manually modified document: ${config.title} (ID: ${existingDocument._id})`);
                    console.log(`   Last modified: ${existingDocument.lastModified}`);
                    console.log(`   Modified by: ${existingDocument.lastModifiedBy}`);
                    
                    return {
                        documentId: existingDocument._id.toString(),
                        action: 'preserved',
                        reason: 'Document has been manually modified by user',
                        wasManuallyModified: true
                    };
                } else {
                    // Update existing auto-generated document
                    console.log(`🔄 Updating existing auto-generated document: ${config.title} (ID: ${existingDocument._id})`);
                    
                    // Calculate time saved
                    const timeSaved = await this.calculateTimeSaved(documentKey);
                    
                    // Update document
                    existingDocument.content = content;
                    existingDocument.wordCount = content.split(' ').length;
                    existingDocument.timeSaved = timeSaved;
                    existingDocument.lastModified = new Date();
                    existingDocument.lastModifiedBy = 'ADPA-System';
                    existingDocument.metadata = {
                        ...existingDocument.metadata,
                        templateId: documentKey,
                        generationJobId: `job-${Date.now()}`,
                        complianceScore: 0,
                        automatedChecks: []
                    };

                    await existingDocument.save();
                    
                    return {
                        documentId: existingDocument._id.toString(),
                        action: 'updated',
                        reason: 'Updated existing auto-generated document',
                        wasManuallyModified: false
                    };
                }
            }

            // Document doesn't exist - create new one
            console.log(`🆕 Creating new document: ${config.title}`);
            
            const timeSaved = await this.calculateTimeSaved(documentKey);
            
            const documentData = {
                projectId: projectId,
                name: config.title,
                type: documentKey,
                category: task.category,
                content: content,
                status: 'draft',
                version: '1.0',
                framework: 'multi',
                qualityScore: 0,
                wordCount: content.split(' ').length,
                timeSaved: timeSaved,
                tags: [config.category, 'generated'],
                generatedAt: new Date(),
                generatedBy: 'ADPA-System',
                lastModified: new Date(),
                lastModifiedBy: 'ADPA-System',
                metadata: {
                    templateId: documentKey,
                    generationJobId: `job-${Date.now()}`,
                    complianceScore: 0,
                    automatedChecks: []
                }
            };

            const document = new ProjectDocument(documentData);
            await document.save();

            console.log(`✅ Created new document: ${config.title} (ID: ${document._id})`);

            return {
                documentId: document._id.toString(),
                action: 'created',
                reason: 'Created new document',
                wasManuallyModified: false
            };

        } catch (error: any) {
            console.error(`❌ Error in database-first document service: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check if a document has been manually modified by a user
     * @param document The document to check
     * @returns true if manually modified, false if auto-generated
     */
    private isDocumentManuallyModified(document: any): boolean {
        // Check if lastModifiedBy is not 'ADPA-System'
        if (document.lastModifiedBy && document.lastModifiedBy !== 'ADPA-System') {
            return true;
        }

        // Check if document has been modified after generation
        const timeSinceGeneration = document.lastModified.getTime() - document.generatedAt.getTime();
        const generationThreshold = 5 * 60 * 1000; // 5 minutes threshold
        
        // If modified significantly after generation, likely manual
        if (timeSinceGeneration > generationThreshold) {
            return true;
        }

        // Check metadata for manual modification indicators
        if (document.metadata && document.metadata.manuallyModified) {
            return true;
        }

        // Check if content contains manual modification markers
        if (document.content && document.content.includes('<!-- MANUALLY_MODIFIED -->')) {
            return true;
        }

        return false;
    }

    /**
     * Calculate time saved from template metadata
     * @param documentKey The document key
     * @returns Time saved in hours
     */
    private async calculateTimeSaved(documentKey: string): Promise<number> {
        try {
            const { TemplateModel } = await import('../models/Template.model.js');
            const template = await TemplateModel.findOne({ documentKey: documentKey });
            
            if (template && template.metadata?.estimatedTime) {
                const estimatedTime = template.metadata.estimatedTime;
                
                if (typeof estimatedTime === 'string') {
                    // Extract first number from strings like "2-4 hours", "6-8 hours", "7-9 hours"
                    const match = estimatedTime.match(/(\d+)/);
                    if (match) {
                        return parseInt(match[1]);
                    }
                } else if (typeof estimatedTime === 'number') {
                    return estimatedTime;
                }
            }
        } catch (error) {
            console.warn(`⚠️ Could not fetch template for time saved calculation: ${error}`);
        }
        
        return 2; // Default conservative estimate
    }

    /**
     * Mark a document as manually modified
     * @param documentId The document ID
     * @param modifiedBy The user who modified it
     */
    public async markAsManuallyModified(documentId: string, modifiedBy: string): Promise<void> {
        try {
            const document = await ProjectDocument.findById(documentId);
            if (document) {
                document.lastModified = new Date();
                document.lastModifiedBy = modifiedBy;
                document.metadata = {
                    ...document.metadata,
                    manuallyModified: true,
                    manualModificationDate: new Date(),
                    manualModificationBy: modifiedBy
                };
                await document.save();
                console.log(`✅ Marked document ${documentId} as manually modified by ${modifiedBy}`);
            }
        } catch (error) {
            console.error(`❌ Error marking document as manually modified: ${error}`);
        }
    }

    /**
     * Get document preservation status
     * @param documentId The document ID
     * @returns Preservation status information
     */
    public async getDocumentPreservationStatus(documentId: string): Promise<{
        isManuallyModified: boolean;
        lastModifiedBy: string;
        lastModified: Date;
        generatedBy: string;
        generatedAt: Date;
    } | null> {
        try {
            const document = await ProjectDocument.findById(documentId);
            if (document) {
                return {
                    isManuallyModified: this.isDocumentManuallyModified(document),
                    lastModifiedBy: document.lastModifiedBy,
                    lastModified: document.lastModified,
                    generatedBy: document.generatedBy,
                    generatedAt: document.generatedAt
                };
            }
            return null;
        } catch (error) {
            console.error(`❌ Error getting document preservation status: ${error}`);
            return null;
        }
    }
}
