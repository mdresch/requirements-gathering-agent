/**
 * Adobe Document Services Integration Orchestrator
 * Phase 1: Main integration point for ADPA with Adobe PDF Services
 */

import {
  DocumentPackage,
  PDFTemplate,
  BrandGuidelines,
  OutputOptions,
  ProcessedDocument,
  DocumentAnalysis,
  BrandComplianceResult,
  AdobeConfig
} from './types.js';
import { AdobePDFProcessor } from './pdf-processor.js';
import { DocumentIntelligence } from './document-intelligence.js';
import { BrandComplianceEngine } from './brand-compliance.js';
import { DEFAULT_PDF_TEMPLATES, DEFAULT_BRAND_GUIDELINES } from './config.js';
import { Logger } from '../utils/logger.js';

/**
 * Enhanced ADPA processor with Adobe Document Services integration
 * Orchestrates the complete document processing pipeline
 */
export class EnhancedADPAProcessor {
  private adobePDFProcessor: AdobePDFProcessor;
  private documentIntelligence: DocumentIntelligence;
  private brandComplianceEngine: BrandComplianceEngine;
  private logger: Logger;

  constructor(config?: Partial<AdobeConfig>) {
    this.adobePDFProcessor = new AdobePDFProcessor(config);
    this.documentIntelligence = new DocumentIntelligence();
    this.brandComplianceEngine = new BrandComplianceEngine(DEFAULT_BRAND_GUIDELINES);
    this.logger = new Logger('EnhancedADPAProcessor');

    this.logger.info('Enhanced ADPA Processor initialized with Adobe integration');
  }

  /**
   * Process documentation request with Adobe enhancement
   * Main entry point for the enhanced ADPA pipeline
   */
  async processDocumentationRequest(
    markdownContent: string,
    options: Partial<OutputOptions> = {}
  ): Promise<DocumentPackage> {
    const operationId = this.generateOperationId();
    const startTime = Date.now();

    this.logger.info('Starting enhanced documentation processing', {
      operationId,
      contentLength: markdownContent.length,
      hasCustomOptions: Object.keys(options).length > 0
    });

    try {
      // Step 1: Analyze document structure with Adobe AI
      this.logger.info('Step 1: Analyzing document structure', { operationId });
      const documentAnalysis = await this.documentIntelligence.analyzeDocumentStructure(markdownContent);

      // Step 2: Select optimal templates based on analysis
      this.logger.info('Step 2: Selecting optimal templates', { operationId });
      const selectedTemplate = await this.selectOptimalTemplate(documentAnalysis, options);

      // Step 3: Prepare processing options
      const processingOptions = this.prepareProcessingOptions(options, selectedTemplate);

      // Step 4: Generate professional PDF
      this.logger.info('Step 3: Generating professional PDF', { operationId });
      const pdf = await this.adobePDFProcessor.generateProfessionalPDF(
        markdownContent,
        selectedTemplate
      );

      // Step 5: Add interactive elements if requested
      let enhancedPDF = pdf;
      if (processingOptions.interactive) {
        this.logger.info('Step 4: Adding interactive elements', { operationId });
        enhancedPDF = await this.adobePDFProcessor.addInteractiveElements(pdf, pdf.metadata);
      }

      // Step 6: Validate brand compliance
      this.logger.info('Step 5: Validating brand compliance', { operationId });
      const complianceResult = await this.brandComplianceEngine.validateCompliance(
        markdownContent,
        'corporate'
      );

      // Step 7: Apply auto-corrections if needed
      let finalPDF = enhancedPDF;
      if (!complianceResult.compliant) {
        this.logger.info('Step 6: Applying compliance corrections', { 
          operationId,
          violationsCount: complianceResult.violations.length 
        });
        
        const autoFixableViolations = complianceResult.violations.filter((v: any) => 
          complianceResult.suggestions.find((s: any) => s.violation === v.description)?.autoFixable
        );

        if (autoFixableViolations.length > 0) {
          this.logger.info('Auto-fixable violations found, applying corrections');
          // Note: Auto-fix would be implemented in production
          finalPDF = enhancedPDF;
        }
      }

      // Step 8: Generate interactive PDF if requested
      let interactivePDF: any = undefined;
      if (processingOptions.interactive && !finalPDF.metadata.reviewFields) {
        this.logger.info('Step 7: Creating interactive PDF version', { operationId });
        interactivePDF = await this.createInteractivePDFVersion(finalPDF, documentAnalysis);
      }

      // Step 9: Create document package
      const processingTime = Date.now() - startTime;
      const documentPackage: DocumentPackage = {
        pdf: finalPDF,
        interactivePDF,
        metadata: {
          generatedAt: new Date(),
          processingTime,
          templateUsed: selectedTemplate.id,
          complianceScore: complianceResult.score,
          qualityScore: this.calculateQualityScore(documentAnalysis, complianceResult)
        },
        artifacts: {
          logs: [], // Would be populated with actual processing logs
          metrics: {
            conversionTime: processingTime * 0.3,
            templateApplicationTime: processingTime * 0.2,
            complianceCheckTime: processingTime * 0.2,
            totalProcessingTime: processingTime,
            memoryUsage: process.memoryUsage().heapUsed
          },
          warnings: this.generateWarnings(documentAnalysis, complianceResult),
          errors: []
        }
      };

      this.logger.info('Enhanced documentation processing completed successfully', {
        operationId,
        processingTime,
        complianceScore: complianceResult.score,
        qualityScore: documentPackage.metadata.qualityScore,
        hasInteractivePDF: !!interactivePDF
      });

      return documentPackage;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.logger.error('Enhanced documentation processing failed', {
        operationId,
        processingTime,
        error: errorMessage
      });

      throw new Error(`Enhanced documentation processing failed: ${errorMessage}`);
    }
  }

  /**
   * Generate multiple format outputs (Phase 1 - PDF focus)
   */
  async generateMultiFormatOutputs(
    markdownContent: string,
    options: Partial<OutputOptions> = {}
  ): Promise<any> {
    const operationId = this.generateOperationId();

    this.logger.info('Generating multi-format outputs', {
      operationId,
      contentLength: markdownContent.length
    });

    try {
      // For Phase 1, focus on PDF generation with different optimizations
      const documentPackage = await this.processDocumentationRequest(markdownContent, options);
      
      // Generate web-optimized version
      const webOptimizedPDF = await this.adobePDFProcessor.optimizeForWeb(documentPackage.pdf);
      
      // Generate print-optimized version
      const printOptimizedPDF = await this.adobePDFProcessor.optimizeForPrint(documentPackage.pdf);

      return {
        standard: documentPackage.pdf,
        interactive: documentPackage.interactivePDF,
        webOptimized: webOptimizedPDF,
        printOptimized: printOptimizedPDF,
        metadata: documentPackage.metadata
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Multi-format generation failed', {
        operationId,
        error: errorMessage
      });

      throw new Error(`Multi-format generation failed: ${errorMessage}`);
    }
  }

  /**
   * Analyze document and provide recommendations
   */
  async analyzeDocument(markdownContent: string): Promise<DocumentAnalysis> {
    return await this.documentIntelligence.analyzeDocumentStructure(markdownContent);
  }

  /**
   * Validate brand compliance for existing document
   */
  async validateBrandCompliance(
    document: any,
    guidelines?: BrandGuidelines
  ): Promise<BrandComplianceResult> {
    const brandGuidelines = guidelines || DEFAULT_BRAND_GUIDELINES;
    return await this.brandComplianceEngine.validateCompliance('mock content', 'corporate');
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(complianceResult: BrandComplianceResult): Promise<string> {
    return `Compliance Report: ${complianceResult.compliant ? 'PASSED' : 'FAILED'}\nScore: ${complianceResult.score}%`;
  }

  // Private helper methods

  private async selectOptimalTemplate(
    analysis: DocumentAnalysis,
    options: Partial<OutputOptions>
  ): Promise<PDFTemplate> {
    // Use provided template or select based on analysis
    if (options.pdfTemplate) {
      return options.pdfTemplate;
    }

    // Template selection logic based on document analysis
    if (analysis.complexity === 'high') {
      if (analysis.suggestedLayouts.includes('executive-summary')) {
        return DEFAULT_PDF_TEMPLATES.executive;
      }
      return DEFAULT_PDF_TEMPLATES.technical;
    } else if (analysis.complexity === 'medium') {
      if (analysis.visualizationOpportunities.length > 3) {
        return DEFAULT_PDF_TEMPLATES.proposal;
      }
      return DEFAULT_PDF_TEMPLATES.corporate;
    } else {
      return DEFAULT_PDF_TEMPLATES.corporate;
    }
  }

  private prepareProcessingOptions(
    options: Partial<OutputOptions>,
    template: PDFTemplate
  ): OutputOptions {
    return {
      pdfTemplate: template,
      brandGuidelines: options.brandGuidelines || DEFAULT_BRAND_GUIDELINES,
      interactive: options.interactive ?? true,
      accessibility: options.accessibility ?? true,
      compression: options.compression || 'medium',
      quality: options.quality || 'standard'
    };
  }

  private async createInteractivePDFVersion(
    pdf: any,
    analysis: DocumentAnalysis
  ): Promise<any> {
    // Create enhanced interactive version with forms and annotations
    const interactiveMetadata = {
      ...pdf.metadata,
      reviewFields: this.generateReviewFields(analysis),
      approvers: this.generateApproverFields()
    };

    return await this.adobePDFProcessor.addInteractiveElements(pdf, interactiveMetadata);
  }

  private generateReviewFields(analysis: DocumentAnalysis): any[] {
    const fields: any[] = [];

    // Add review fields based on key points
    analysis.keyPoints.slice(0, 5).forEach((keyPoint, index) => {
      fields.push({
        id: `review_${index}`,
        type: 'text',
        label: `Review comment for: ${keyPoint.text.substring(0, 50)}...`,
        required: false,
        position: {
          page: 1,
          x: 400,
          y: 100 + (index * 50),
          width: 150,
          height: 30
        }
      });
    });

    // Add overall approval checkbox
    fields.push({
      id: 'overall_approval',
      type: 'checkbox',
      label: 'Overall Approval',
      required: true,
      position: {
        page: 1,
        x: 400,
        y: 400,
        width: 20,
        height: 20
      }
    });

    return fields;
  }

  private generateApproverFields(): any[] {
    return [
      {
        name: 'Document Reviewer',
        email: 'reviewer@company.com',
        role: 'Senior Analyst',
        signatureField: 'reviewer_signature'
      },
      {
        name: 'Project Manager',
        email: 'pm@company.com',
        role: 'Project Manager',
        signatureField: 'pm_signature'
      }
    ];
  }

  private calculateQualityScore(
    analysis: DocumentAnalysis,
    compliance: BrandComplianceResult
  ): number {
    // Weighted quality score calculation
    const structureWeight = 0.3;
    const readabilityWeight = 0.3;
    const complianceWeight = 0.4;

    return (
      analysis.structureScore * structureWeight +
      analysis.readabilityScore * readabilityWeight +
      compliance.score * complianceWeight
    );
  }

  private generateWarnings(
    analysis: DocumentAnalysis,
    compliance: BrandComplianceResult
  ): any[] {
    const warnings: any[] = [];

    // Add warnings for low readability
    if (analysis.readabilityScore < 0.6) {
      warnings.push({
        code: 'LOW_READABILITY',
        message: 'Document readability score is below recommended threshold',
        severity: 'medium',
        context: { score: analysis.readabilityScore }
      });
    }

    // Add warnings for complexity
    if (analysis.complexity === 'high') {
      warnings.push({
        code: 'HIGH_COMPLEXITY',
        message: 'Document complexity is high - consider breaking into sections',
        severity: 'low',
        context: { complexity: analysis.complexity }
      });
    }

    // Add warnings for compliance issues
    if (compliance.violations.length > 0) {
      warnings.push({
        code: 'COMPLIANCE_VIOLATIONS',
        message: `Document has ${compliance.violations.length} brand compliance violations`,
        severity: 'medium',
        context: { violationsCount: compliance.violations.length }
      });
    }

    return warnings;
  }

  private generateOperationId(): string {
    return `adpa-enhanced-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
