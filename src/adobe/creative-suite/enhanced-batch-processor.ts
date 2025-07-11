/**
 * Enhanced Batch Processor for Phase 2
 * 
 * Orchestrates the complete Adobe Creative Suite pipeline for
 * batch processing of documents with professional layouts,
 * visualizations, and multi-format output.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { InDesignAPIClient, type InDesignDocumentRequest } from './indesign-client.js';
import { IllustratorAPIClient, type VisualizationRequest } from './illustrator-client.js';
import { PhotoshopAPIClient, type ImageProcessingRequest } from './photoshop-client.js';
import { DocumentGenerationAPIClient, type DocumentGenerationRequest } from './document-generation-client.js';
import { brandGuidelines } from './brand-guidelines.js';

export interface BatchProcessingRequest {
    sourceDirectory: string;
    outputDirectory: string;
    options: BatchProcessingOptions;
    filters?: DocumentFilters;
}

export interface BatchProcessingOptions {
    enableInDesignLayouts: boolean;
    enableDataVisualization: boolean;
    enableImageEnhancement: boolean;
    enableMultiFormat: boolean;
    outputFormats: string[];
    templateSelection: 'auto' | 'manual';
    qualityLevel: 'standard' | 'high' | 'premium';
    concurrency: number;
    skipExisting: boolean;
    generatePreviews: boolean;
    preserveDirectoryStructure: boolean;
}

export interface DocumentFilters {
    includePatterns: string[];
    excludePatterns: string[];
    documentTypes: string[];
    minFileSize?: number;
    maxFileSize?: number;
    modifiedAfter?: Date;
}

export interface DocumentAnalysis {
    filePath: string;
    documentType: 'project-charter' | 'requirements-doc' | 'management-plan' | 'technical-spec' | 'unknown';
    contentStructure: ContentStructure;
    visualizableData: VisualizableData;
    images: string[];
    complexity: 'simple' | 'moderate' | 'complex';
    recommendedTemplate: string;
    estimatedProcessingTime: number;
}

export interface ContentStructure {
    hasTitle: boolean;
    hasTOC: boolean;
    sectionCount: number;
    tableCount: number;
    imageCount: number;
    codeBlockCount: number;
    listCount: number;
    headingLevels: number[];
}

export interface VisualizableData {
    timelines: any[];
    charts: any[];
    processes: any[];
    matrices: any[];
}

export interface BatchProcessingResult {
    processedFiles: ProcessedDocument[];
    summary: ProcessingSummary;
    errors: ProcessingError[];
    performance: PerformanceMetrics;
}

export interface ProcessedDocument {
    sourceFile: string;
    analysis: DocumentAnalysis;
    outputs: DocumentOutput[];
    processingTime: number;
    qualityScore: number;
}

export interface DocumentOutput {
    type: 'indesign' | 'illustrator' | 'photoshop' | 'pdf' | 'html';
    filePath: string;
    fileSize: number;
    format: string;
    metadata: any;
}

export interface ProcessingSummary {
    totalFiles: number;
    successfullyProcessed: number;
    failed: number;
    skipped: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    totalOutputSize: number;
    templatesUsed: string[];
    visualizationsGenerated: number;
    imagesEnhanced: number;
}

export interface ProcessingError {
    file: string;
    error: string;
    stage: 'analysis' | 'template-selection' | 'indesign' | 'illustrator' | 'photoshop' | 'output';
    timestamp: Date;
}

export interface PerformanceMetrics {
    analysisTime: number;
    templateSelectionTime: number;
    indesignProcessingTime: number;
    illustratorProcessingTime: number;
    photoshopProcessingTime: number;
    outputGenerationTime: number;
    memoryUsage: {
        peak: number;
        average: number;
    };
}

export class EnhancedBatchProcessor {
    private indesignClient: InDesignAPIClient;
    private illustratorClient: IllustratorAPIClient;
    private photoshopClient: PhotoshopAPIClient;
    private documentGenClient: DocumentGenerationAPIClient;

    constructor() {
        this.indesignClient = new InDesignAPIClient();
        this.illustratorClient = new IllustratorAPIClient();
        this.photoshopClient = new PhotoshopAPIClient();
        this.documentGenClient = new DocumentGenerationAPIClient();
    }

    /**
     * Initialize all Adobe Creative Suite clients
     */
    async initialize(): Promise<void> {
        await Promise.all([
            this.indesignClient.initialize(),
            this.illustratorClient.initialize(),
            this.photoshopClient.initialize(),
            this.documentGenClient.initialize()
        ]);
    }

    /**
     * Process batch of documents with enhanced Adobe Creative Suite pipeline
     */
    async processBatch(request: BatchProcessingRequest): Promise<BatchProcessingResult> {
        const startTime = Date.now();
        const results: ProcessedDocument[] = [];
        const errors: ProcessingError[] = [];
        const performance: PerformanceMetrics = {
            analysisTime: 0,
            templateSelectionTime: 0,
            indesignProcessingTime: 0,
            illustratorProcessingTime: 0,
            photoshopProcessingTime: 0,
            outputGenerationTime: 0,
            memoryUsage: { peak: 0, average: 0 }
        };

        try {
            // 1. Discover and filter documents
            const documents = await this.discoverDocuments(request);
            console.log(`Found ${documents.length} documents to process`);

            // 2. Create output directory structure
            await this.createOutputStructure(request);

            // 3. Process documents in batches
            for (let i = 0; i < documents.length; i += request.options.concurrency) {
                const batch = documents.slice(i, i + request.options.concurrency);
                const batchPromises = batch.map(doc => this.processDocument(doc, request, performance));
                
                const batchResults = await Promise.allSettled(batchPromises);
                
                batchResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        results.push(result.value);
                    } else {
                        errors.push({
                            file: batch[index],
                            error: result.reason.message,
                            stage: 'analysis',
                            timestamp: new Date()
                        });
                    }
                });

                // Progress report
                const processed = Math.min(i + request.options.concurrency, documents.length);
                console.log(`Processed ${processed}/${documents.length} documents (${Math.round(processed / documents.length * 100)}%)`);
            }

            // 4. Generate batch summary
            const summary = this.generateSummary(results, errors, startTime);

            return {
                processedFiles: results,
                summary,
                errors,
                performance
            };

        } catch (error) {
            console.error('Batch processing failed:', error);
            throw new Error(`Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Process a single document through the enhanced pipeline
     */
    async processDocument(
        documentPath: string,
        request: BatchProcessingRequest,
        performance: PerformanceMetrics
    ): Promise<ProcessedDocument> {
        const docStartTime = Date.now();
        const outputs: DocumentOutput[] = [];

        try {
            // 1. Analyze document content
            const analysisStart = Date.now();
            const analysis = await this.analyzeDocument(documentPath);
            performance.analysisTime += Date.now() - analysisStart;

            // 2. Select template
            const templateStart = Date.now();
            const template = await this.selectTemplate(analysis, request.options.templateSelection);
            performance.templateSelectionTime += Date.now() - templateStart;

            // 3. Generate visualizations if enabled
            if (request.options.enableDataVisualization && analysis.visualizableData) {
                const illustratorStart = Date.now();
                const visualizations = await this.generateVisualizations(analysis.visualizableData);
                performance.illustratorProcessingTime += Date.now() - illustratorStart;

                visualizations.forEach(viz => {
                    outputs.push({
                        type: 'illustrator',
                        filePath: viz.outputPath,
                        fileSize: viz.fileSize,
                        format: viz.format,
                        metadata: viz.metadata
                    });
                });
            }

            // 4. Enhance images if enabled
            if (request.options.enableImageEnhancement && analysis.images.length > 0) {
                const photoshopStart = Date.now();
                const enhancedImages = await this.enhanceImages(analysis.images);
                performance.photoshopProcessingTime += Date.now() - photoshopStart;

                enhancedImages.forEach(img => {
                    outputs.push({
                        type: 'photoshop',
                        filePath: img.outputPath,
                        fileSize: img.fileSize,
                        format: img.format,
                        metadata: img.metadata
                    });
                });
            }

            // 5. Generate professional layouts if enabled
            if (request.options.enableInDesignLayouts) {
                const indesignStart = Date.now();
                const layoutDoc = await this.generateInDesignLayout(documentPath, analysis, template);
                performance.indesignProcessingTime += Date.now() - indesignStart;

                outputs.push({
                    type: 'indesign',
                    filePath: layoutDoc.outputPath,
                    fileSize: layoutDoc.fileSize,
                    format: layoutDoc.format,
                    metadata: layoutDoc.metadata
                });
            }

            // 6. Generate multi-format outputs if enabled
            if (request.options.enableMultiFormat) {
                const outputStart = Date.now();
                const multiFormatOutputs = await this.generateMultiFormatOutputs(
                    documentPath,
                    analysis,
                    request.options.outputFormats
                );
                performance.outputGenerationTime += Date.now() - outputStart;

                outputs.push(...multiFormatOutputs);
            }

            const processingTime = Date.now() - docStartTime;
            const qualityScore = this.calculateQualityScore(analysis, outputs);

            return {
                sourceFile: documentPath,
                analysis,
                outputs,
                processingTime,
                qualityScore
            };

        } catch (error) {
            console.error(`Failed to process document ${documentPath}:`, error);
            throw error;
        }
    }

    /**
     * Analyze document content and structure
     */
    async analyzeDocument(filePath: string): Promise<DocumentAnalysis> {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Document type detection
        const documentType = this.detectDocumentType(content, filePath);
        
        // Content structure analysis
        const contentStructure = this.analyzeContentStructure(content);
        
        // Extract visualizable data
        const visualizableData = await this.extractVisualizableData(content);
        
        // Find referenced images
        const images = this.findImages(content, path.dirname(filePath));
        
        // Assess complexity
        const complexity = this.assessComplexity(contentStructure);
        
        // Recommend template
        const recommendedTemplate = this.recommendTemplate(documentType, contentStructure);
        
        // Estimate processing time
        const estimatedProcessingTime = this.estimateProcessingTime(contentStructure, complexity);

        return {
            filePath,
            documentType,
            contentStructure,
            visualizableData,
            images,
            complexity,
            recommendedTemplate,
            estimatedProcessingTime
        };
    }

    /**
     * Generate data visualizations from extracted data
     */
    async generateVisualizations(data: VisualizableData): Promise<any[]> {
        const visualizations = [];
        const guidelines = await brandGuidelines.getGuidelines();
        
        const style = {
            colorScheme: guidelines.visualizations.charts.colorPalette,
            fontFamily: guidelines.typography.body.fontFamily,
            theme: 'corporate' as const,
            branding: {
                primaryColor: guidelines.colors.primary,
                secondaryColor: guidelines.colors.secondary,
                accentColor: guidelines.colors.accent
            }
        };

        // Generate timelines
        for (const timeline of data.timelines) {
            const viz = await this.illustratorClient.generateTimeline(timeline, style);
            visualizations.push(viz);
        }

        // Generate charts
        for (const chart of data.charts) {
            const viz = await this.illustratorClient.generateChart(chart, style);
            visualizations.push(viz);
        }

        // Generate process flows
        for (const process of data.processes) {
            const viz = await this.illustratorClient.generateProcessFlow(process, style);
            visualizations.push(viz);
        }

        return visualizations;
    }

    /**
     * Enhance images for professional presentation
     */
    async enhanceImages(imagePaths: string[]): Promise<any[]> {
        return this.photoshopClient.enhanceDocumentImages(imagePaths, 'standard');
    }

    /**
     * Generate professional InDesign layout
     */
    async generateInDesignLayout(
        documentPath: string,
        analysis: DocumentAnalysis,
        template: string
    ): Promise<any> {
        const content = await fs.readFile(documentPath, 'utf-8');
        const guidelines = await brandGuidelines.getGuidelines();

        const request: InDesignDocumentRequest = {
            templateId: template,
            content: {
                title: this.extractTitle(content),
                author: 'Generated by Adobe Creative Suite',
                date: new Date(),
                sections: this.convertToSections(content),
                metadata: { sourceFile: documentPath }
            },
            branding: {
                colorScheme: 'corporate',
                typography: {
                    headingFont: guidelines.typography.headings.fontFamily,
                    bodyFont: guidelines.typography.body.fontFamily,
                    codeFont: guidelines.typography.monospace.fontFamily,
                    lineHeight: guidelines.typography.body.lineHeight,
                    margins: {
                        top: guidelines.layout.margins.page,
                        right: guidelines.layout.margins.page,
                        bottom: guidelines.layout.margins.page,
                        left: guidelines.layout.margins.page
                    }
                }
            },
            outputOptions: {
                format: 'pdf',
                quality: 'high'
            }
        };

        return this.indesignClient.createDocument(request);
    }

    // Private helper methods

    private async discoverDocuments(request: BatchProcessingRequest): Promise<string[]> {
        const documents: string[] = [];
        const entries = await fs.readdir(request.sourceDirectory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(request.sourceDirectory, entry.name);
            
            if (entry.isFile() && entry.name.endsWith('.md')) {
                if (this.passesFilters(fullPath, request.filters)) {
                    documents.push(fullPath);
                }
            } else if (entry.isDirectory() && request.options.preserveDirectoryStructure) {
                const subRequest = {
                    ...request,
                    sourceDirectory: fullPath
                };
                const subDocuments = await this.discoverDocuments(subRequest);
                documents.push(...subDocuments);
            }
        }

        return documents;
    }

    private passesFilters(filePath: string, filters?: DocumentFilters): boolean {
        if (!filters) return true;

        // Include patterns
        if (filters.includePatterns?.length > 0) {
            const passes = filters.includePatterns.some(pattern => 
                filePath.includes(pattern) || path.basename(filePath).includes(pattern)
            );
            if (!passes) return false;
        }

        // Exclude patterns
        if (filters.excludePatterns?.length > 0) {
            const excluded = filters.excludePatterns.some(pattern => 
                filePath.includes(pattern) || path.basename(filePath).includes(pattern)
            );
            if (excluded) return false;
        }

        return true;
    }

    private detectDocumentType(content: string, filePath: string): DocumentAnalysis['documentType'] {
        const fileName = path.basename(filePath).toLowerCase();
        const lowerContent = content.toLowerCase();

        if (fileName.includes('charter') || lowerContent.includes('project charter')) {
            return 'project-charter';
        }
        if (fileName.includes('requirements') || lowerContent.includes('requirements')) {
            return 'requirements-doc';
        }
        if (fileName.includes('management') || lowerContent.includes('management plan')) {
            return 'management-plan';
        }
        if (fileName.includes('technical') || lowerContent.includes('technical specification')) {
            return 'technical-spec';
        }

        return 'unknown';
    }

    private analyzeContentStructure(content: string): ContentStructure {
        const lines = content.split('\n');
        
        return {
            hasTitle: /^#\s/.test(lines[0] || ''),
            hasTOC: content.includes('Table of Contents') || content.includes('## Contents'),
            sectionCount: (content.match(/^##\s/gm) || []).length,
            tableCount: (content.match(/\|.*\|/g) || []).length / 3, // Rough estimate
            imageCount: (content.match(/!\[.*\]\(/g) || []).length,
            codeBlockCount: (content.match(/```/g) || []).length / 2,
            listCount: (content.match(/^[-*+]\s/gm) || []).length,
            headingLevels: [...new Set((content.match(/^#{1,6}\s/gm) || []).map(h => h.length - 1))]
        };
    }

    private async extractVisualizableData(content: string): Promise<VisualizableData> {
        // Phase 2: Implement intelligent data extraction
        return {
            timelines: [],
            charts: [],
            processes: [],
            matrices: []
        };
    }

    private findImages(content: string, baseDir: string): string[] {
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        const images: string[] = [];
        let match;

        while ((match = imageRegex.exec(content)) !== null) {
            const imagePath = match[1];
            if (!imagePath.startsWith('http')) {
                images.push(path.resolve(baseDir, imagePath));
            }
        }

        return images;
    }

    private assessComplexity(structure: ContentStructure): 'simple' | 'moderate' | 'complex' {
        const score = structure.sectionCount + structure.tableCount + structure.imageCount + structure.codeBlockCount;
        
        if (score <= 5) return 'simple';
        if (score <= 15) return 'moderate';
        return 'complex';
    }

    private recommendTemplate(
        documentType: DocumentAnalysis['documentType'],
        structure: ContentStructure
    ): string {
        switch (documentType) {
            case 'project-charter':
                return 'project-charter-template';
            case 'requirements-doc':
                return 'requirements-doc-template';
            case 'management-plan':
                return 'management-plan-template';
            case 'technical-spec':
                return 'technical-spec-template';
            default:
                return structure.hasTitle && structure.sectionCount > 0 
                    ? 'general-document-template' 
                    : 'simple-document-template';
        }
    }

    private estimateProcessingTime(structure: ContentStructure, complexity: string): number {
        let baseTime = 30000; // 30 seconds base
        
        baseTime += structure.sectionCount * 2000; // 2s per section
        baseTime += structure.tableCount * 3000; // 3s per table
        baseTime += structure.imageCount * 5000; // 5s per image
        
        if (complexity === 'complex') baseTime *= 1.5;
        
        return baseTime;
    }

    private async selectTemplate(analysis: DocumentAnalysis, mode: string): Promise<string> {
        if (mode === 'auto') {
            return analysis.recommendedTemplate;
        }
        
        // Phase 2: Implement manual template selection interface
        return analysis.recommendedTemplate;
    }

    private async createOutputStructure(request: BatchProcessingRequest): Promise<void> {
        await fs.mkdir(request.outputDirectory, { recursive: true });
        
        if (request.options.preserveDirectoryStructure) {
            await fs.mkdir(path.join(request.outputDirectory, 'indesign'), { recursive: true });
            await fs.mkdir(path.join(request.outputDirectory, 'visualizations'), { recursive: true });
            await fs.mkdir(path.join(request.outputDirectory, 'enhanced-images'), { recursive: true });
            await fs.mkdir(path.join(request.outputDirectory, 'multi-format'), { recursive: true });
        }
    }

    private async generateMultiFormatOutputs(
        documentPath: string,
        analysis: DocumentAnalysis,
        formats: string[]
    ): Promise<DocumentOutput[]> {
        const outputs: DocumentOutput[] = [];
        
        // Phase 2: Implement multi-format generation
        for (const format of formats) {
            outputs.push({
                type: 'pdf',
                filePath: documentPath.replace('.md', `.${format}`),
                fileSize: 1024000,
                format,
                metadata: { generated: new Date() }
            });
        }
        
        return outputs;
    }

    private calculateQualityScore(analysis: DocumentAnalysis, outputs: DocumentOutput[]): number {
        let score = 50; // Base score
        
        // Structure quality
        if (analysis.contentStructure.hasTitle) score += 10;
        if (analysis.contentStructure.hasTOC) score += 10;
        if (analysis.contentStructure.sectionCount > 0) score += 10;
        
        // Output variety
        score += outputs.length * 5;
        
        // Complexity handling
        if (analysis.complexity === 'complex' && outputs.length > 2) score += 15;
        
        return Math.min(100, score);
    }

    private generateSummary(
        results: ProcessedDocument[],
        errors: ProcessingError[],
        startTime: number
    ): ProcessingSummary {
        const totalTime = Date.now() - startTime;
        const successCount = results.length;
        const totalFiles = successCount + errors.length;
        
        return {
            totalFiles,
            successfullyProcessed: successCount,
            failed: errors.length,
            skipped: 0,
            totalProcessingTime: totalTime,
            averageProcessingTime: successCount > 0 ? totalTime / successCount : 0,
            totalOutputSize: results.reduce((sum, r) => sum + r.outputs.reduce((s, o) => s + o.fileSize, 0), 0),
            templatesUsed: [...new Set(results.map(r => r.analysis.recommendedTemplate))],
            visualizationsGenerated: results.reduce((sum, r) => sum + r.outputs.filter(o => o.type === 'illustrator').length, 0),
            imagesEnhanced: results.reduce((sum, r) => sum + r.outputs.filter(o => o.type === 'photoshop').length, 0)
        };
    }

    private extractTitle(content: string): string {
        const lines = content.split('\n');
        const titleLine = lines.find(line => line.startsWith('#'));
        return titleLine ? titleLine.replace(/^#+\s*/, '') : 'Untitled Document';
    }

    private convertToSections(content: string): any[] {
        // Phase 2: Convert markdown to structured sections
        return [{ id: '1', type: 'paragraph', content: content.substring(0, 1000) + '...' }];
    }
}

export const enhancedBatchProcessor = new EnhancedBatchProcessor();
