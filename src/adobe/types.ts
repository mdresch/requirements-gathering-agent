/**
 * Adobe Document Services Integration Types
 * Phase 1: PDF Services Foundation
 */

// Core PDF Services Types
export interface PDFDocument {
  id: string;
  content: Buffer;
  metadata: DocumentMetadata;
  format: 'pdf';
  size: number;
  createdAt: Date;
}

export interface DocumentMetadata {
  title: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  tableOfContents?: TOCEntry[];
  reviewFields?: ReviewField[];
  approvers?: Approver[];
  brandCompliance?: BrandComplianceResult;
}

export interface TOCEntry {
  title: string;
  level: number;
  pageNumber?: number;
  bookmark?: string;
}

export interface ReviewField {
  id: string;
  type: 'text' | 'checkbox' | 'signature' | 'date';
  label: string;
  required: boolean;
  position: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Approver {
  name: string;
  email: string;
  role: string;
  signatureField?: string;
}

// Template System Types
export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  corporateFonts: FontConfig[];
  watermark?: WatermarkConfig;
  headerFooter?: HeaderFooterConfig;
  colorScheme: ColorScheme;
  margins: MarginConfig;
  pageLayout: PageLayout;
}

export interface FontConfig {
  family: string;
  variants: string[];
  fallback: string[];
}

export interface WatermarkConfig {
  text?: string;
  image?: string;
  opacity: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface HeaderFooterConfig {
  header?: {
    left?: string;
    center?: string;
    right?: string;
    height: number;
  };
  footer?: {
    left?: string;
    center?: string;
    right?: string;
    height: number;
  };
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  border: string;
}

export interface MarginConfig {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type PageLayout = 'A4' | 'Letter' | 'Legal' | 'A3' | 'Tabloid';

// Brand Compliance Types
export interface BrandGuidelines {
  colorPalette: ColorScheme;
  typography: TypographyRules;
  logoPlacement: LogoRules;
  layoutRules: LayoutRules;
}

export interface TypographyRules {
  headings: FontRule[];
  body: FontRule;
  captions: FontRule;
  lineHeight: number;
  spacing: SpacingRules;
}

export interface FontRule {
  family: string;
  size: number;
  weight: string;
  color: string;
}

export interface SpacingRules {
  paragraphs: number;
  sections: number;
  lists: number;
}

export interface LogoRules {
  minSize: { width: number; height: number; };
  maxSize: { width: number; height: number; };
  clearSpace: number;
  allowedPositions: string[];
}

export interface LayoutRules {
  gridSystem: GridSystem;
  margins: MarginConfig;
  columns: number;
  gutters: number;
}

export interface GridSystem {
  columns: number;
  gutters: number;
  margins: MarginConfig;
}

// Processing Types
export interface ProcessedDocument {
  sections: DocumentSection[];
  tables: TableData[];
  charts: ChartData[];
  images: ImageData[];
  metadata: ProcessingMetadata;
}

export interface DocumentSection {
  id: string;
  level: number;
  title: string;
  content: string;
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'code';
  position: number;
}

export interface TableData {
  id: string;
  headers: string[];
  rows: string[][];
  caption?: string;
  style?: TableStyle;
}

export interface TableStyle {
  headerStyle: CellStyle;
  bodyStyle: CellStyle;
  alternateRows: boolean;
  borders: BorderStyle;
}

export interface CellStyle {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: string;
  padding: number;
}

export interface BorderStyle {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface ChartData {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  title: string;
  data: any[];
  options: ChartOptions;
}

export interface ChartOptions {
  width: number;
  height: number;
  colors: string[];
  showLegend: boolean;
  showAxis: boolean;
}

export interface ImageData {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ProcessingMetadata {
  wordCount: number;
  pageCount: number;
  complexity: 'low' | 'medium' | 'high';
  estimatedReadTime: number;
  language: string;
}

// Output Configuration Types
export interface OutputOptions {
  pdfTemplate: PDFTemplate;
  brandGuidelines: BrandGuidelines;
  interactive: boolean;
  accessibility: boolean;
  compression: 'none' | 'low' | 'medium' | 'high';
  quality: 'draft' | 'standard' | 'high' | 'print';
}

export interface DocumentPackage {
  pdf: PDFDocument;
  interactivePDF?: PDFDocument;
  metadata: PackageMetadata;
  artifacts: ProcessingArtifacts;
}

export interface PackageMetadata {
  generatedAt: Date;
  processingTime: number;
  templateUsed: string;
  complianceScore: number;
  qualityScore: number;
}

export interface ProcessingArtifacts {
  logs: ProcessingLog[];
  metrics: ProcessingMetrics;
  warnings: Warning[];
  errors: ProcessingError[];
}

export interface ProcessingLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: any;
}

export interface ProcessingMetrics {
  conversionTime: number;
  templateApplicationTime: number;
  complianceCheckTime: number;
  totalProcessingTime: number;
  memoryUsage: number;
}

export interface Warning {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  context?: any;
}

export interface ProcessingError extends Error {
  code: string;
  severity: 'recoverable' | 'fatal';
  context?: any;
  timestamp: Date;
}

// Brand Compliance Types
export interface BrandComplianceResult {
  compliant: boolean;
  score: number;
  violations: BrandViolation[];
  suggestions: ComplianceSuggestion[];
  checkedAt: Date;
}

export interface BrandViolation {
  type: 'color' | 'typography' | 'layout' | 'logo' | 'spacing';
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  location?: {
    page: number;
    element: string;
  };
  currentValue: any;
  expectedValue: any;
}

export interface ComplianceSuggestion {
  violation: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  autoFixable: boolean;
}

// Document Analysis Types
export interface DocumentAnalysis {
  complexity: 'low' | 'medium' | 'high';
  suggestedLayouts: string[];
  keyPoints: KeyPoint[];
  visualizationOpportunities: VisualizationOpportunity[];
  complianceFlags: ComplianceFlag[];
  readabilityScore: number;
  structureScore: number;
}

export interface KeyPoint {
  text: string;
  importance: number;
  category: string;
  position: number;
}

export interface VisualizationOpportunity {
  type: 'chart' | 'diagram' | 'table' | 'infographic';
  data: any;
  confidence: number;
  description: string;
}

export interface ComplianceFlag {
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  autoFixable: boolean;
}

// Adobe API Configuration
export interface AdobeConfig {
  clientId: string;
  clientSecret: string;
  organizationId: string;
  accountId: string;
  privateKey: string;
  environment: 'sandbox' | 'production';
  apiBaseUrl: string;
  timeoutMs: number;
  retryAttempts: number;
  rateLimitPerSecond: number;
}

// Service Interfaces
export interface IAdobePDFProcessor {
  generateProfessionalPDF(markdownContent: string, template: PDFTemplate): Promise<PDFDocument>;
  addInteractiveElements(pdf: PDFDocument, metadata: DocumentMetadata): Promise<PDFDocument>;
  validateDocument(pdf: PDFDocument): Promise<ValidationResult>;
  optimizeForWeb(pdf: PDFDocument): Promise<PDFDocument>;
  optimizeForPrint(pdf: PDFDocument): Promise<PDFDocument>;
}

export interface IDocumentIntelligence {
  analyzeDocumentStructure(markdownContent: string): Promise<DocumentAnalysis>;
  extractKeyPoints(content: string): Promise<KeyPoint[]>;
  suggestVisualizations(content: string): Promise<VisualizationOpportunity[]>;
  assessComplexity(content: string): Promise<ComplexityAssessment>;
}

export interface IBrandComplianceEngine {
  validateBrandCompliance(document: any, guidelines: BrandGuidelines): Promise<BrandComplianceResult>;
  autoFixViolations(document: any, violations: BrandViolation[]): Promise<any>;
  generateComplianceReport(result: BrandComplianceResult): Promise<string>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: DocumentMetadata;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  location?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}

export interface ComplexityAssessment {
  score: number;
  factors: ComplexityFactor[];
  recommendations: string[];
}

export interface ComplexityFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
}
