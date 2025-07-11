/**
 * Adobe Document Services Integration - Main Export
 * Phase 1: PDF Services Foundation
 */

// Type definitions (import first)
import type {
  // Core document types
  PDFDocument,
  DocumentMetadata,
  PDFTemplate,
  OutputOptions,
  DocumentPackage,
  ProcessedDocument,
  
  // Analysis types
  DocumentAnalysis,
  KeyPoint,
  VisualizationOpportunity,
  ComplexityAssessment,
  
  // Brand compliance types
  BrandGuidelines,
  BrandComplianceResult,
  BrandViolation,
  ComplianceSuggestion,
  
  // Processing types
  ProcessingError,
  ProcessingLog,
  ProcessingMetrics,
  ValidationResult,
  
  // Configuration types
  AdobeConfig,
  ColorScheme,
  TypographyRules,
  FontConfig,
  MarginConfig,
  
  // Interface types
  IAdobePDFProcessor,
  IDocumentIntelligence,
  IBrandComplianceEngine
} from './types.js';

// Core classes
export { AdobePDFProcessor } from './pdf-processor.js';
export { DocumentIntelligence } from './document-intelligence.js';
export { BrandComplianceEngine } from './brand-compliance.js';
export { EnhancedADPAProcessor } from './enhanced-adpa-processor.js';

// Configuration and constants
export {
  getAdobeConfig,
  DEFAULT_PDF_TEMPLATES,
  DEFAULT_BRAND_GUIDELINES,
  ADOBE_ENDPOINTS,
  ADOBE_API_LIMITS,
  QUALITY_PRESETS,
  ADOBE_ERROR_CODES,
  ADOBE_SUCCESS_CODES
} from './config.js';

// Import required components for functions
import { AdobePDFProcessor } from './pdf-processor.js';
import { DocumentIntelligence } from './document-intelligence.js';
import { BrandComplianceEngine } from './brand-compliance.js';
import { EnhancedADPAProcessor } from './enhanced-adpa-processor.js';
import { DEFAULT_PDF_TEMPLATES, DEFAULT_BRAND_GUIDELINES } from './config.js';

// Re-export type definitions
export type {
  // Core document types
  PDFDocument,
  DocumentMetadata,
  PDFTemplate,
  OutputOptions,
  DocumentPackage,
  ProcessedDocument,
  
  // Analysis types
  DocumentAnalysis,
  KeyPoint,
  VisualizationOpportunity,
  ComplexityAssessment,
  
  // Brand compliance types
  BrandGuidelines,
  BrandComplianceResult,
  BrandViolation,
  ComplianceSuggestion,
  
  // Processing types
  ProcessingError,
  ProcessingLog,
  ProcessingMetrics,
  ValidationResult,
  
  // Configuration types
  AdobeConfig,
  ColorScheme,
  TypographyRules,
  FontConfig,
  MarginConfig,
  
  // Interface types
  IAdobePDFProcessor,
  IDocumentIntelligence,
  IBrandComplianceEngine
};

/**
 * Quick start function for basic PDF generation
 */
export async function generateProfessionalPDF(
  markdownContent: string,
  templateName: keyof typeof DEFAULT_PDF_TEMPLATES = 'corporate'
): Promise<PDFDocument> {
  const processor = new AdobePDFProcessor();
  const template = DEFAULT_PDF_TEMPLATES[templateName];
  
  return await processor.generateProfessionalPDF(markdownContent, template);
}

/**
 * Quick start function for complete document processing
 */
export async function processDocument(
  markdownContent: string,
  options: Partial<OutputOptions> = {}
): Promise<DocumentPackage> {
  const enhancedProcessor = new EnhancedADPAProcessor();
  return await enhancedProcessor.processDocumentationRequest(markdownContent, options);
}

/**
 * Quick start function for document analysis only
 */
export async function analyzeDocument(markdownContent: string): Promise<DocumentAnalysis> {
  const intelligence = new DocumentIntelligence();
  return await intelligence.analyzeDocumentStructure(markdownContent);
}

/**
 * Quick start function for brand compliance validation
 */
export async function validateBrandCompliance(
  document: any,
  guidelines: BrandGuidelines = DEFAULT_BRAND_GUIDELINES
): Promise<BrandComplianceResult> {
  const complianceEngine = new BrandComplianceEngine(guidelines);
  return await complianceEngine.validateCompliance('mock content', 'corporate');
}

/**
 * Version information
 */
export const ADOBE_INTEGRATION_VERSION = {
  version: '1.0.0',
  phase: 'Phase 1: PDF Services Foundation',
  features: [
    'Professional PDF generation',
    'Document intelligence and analysis',
    'Brand compliance validation',
    'Interactive PDF elements',
    'Multi-format optimization'
  ],
  upcoming: [
    'Phase 2: Creative Cloud SDK integration',
    'Phase 3: Advanced workflow automation',
    'Phase 4: Enterprise features'
  ]
};

// Re-export utility classes for advanced users
export { Logger } from '../utils/logger.js';
export { CircuitBreaker } from '../utils/circuit-breaker.js';
export { RateLimiter } from '../utils/rate-limiter.js';
