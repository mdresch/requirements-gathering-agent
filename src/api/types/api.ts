/**
 * TypeScript type definitions for ADPA API
 * 
 * These types correspond to the TypeSpec specifications
 * and provide type safety for the API implementation.
 */

export enum InputFormat {
    markdown = "markdown",
    html = "html",
    docx = "docx", 
    txt = "txt",
    rtf = "rtf"
}

export enum OutputFormat {
    pdf = "pdf",
    docx = "docx",
    html = "html",
    pptx = "pptx"
}

export enum ProcessingStatus {
    queued = "queued",
    processing = "processing", 
    completed = "completed",
    failed = "failed",
    cancelled = "cancelled"
}

export interface DocumentMetadata {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    createdAt?: Date;
    modifiedAt?: Date;
    tags?: string[];
    customProperties?: Record<string, any>;
    pmbok?: {
        phase?: "initiation" | "planning" | "execution" | "monitoring" | "closing";
        processGroup?: string;
        knowledgeArea?: string;
    };
}

export interface ConversionOptions {
    pageSize?: "A4" | "A3" | "Letter" | "Legal" | "Custom";
    orientation?: "portrait" | "landscape";
    customDimensions?: {
        width: number;
        height: number;
        unit: "in" | "cm" | "mm";
    };
    includeTableOfContents?: boolean;
    includePageNumbers?: boolean;
    pageNumberStart?: number;
    customCss?: string;
    dpi?: number;
    compression?: number;
    password?: string;
    watermark?: {
        text: string;
        opacity: number;
        position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
    };
    headerFooter?: {
        includeHeader: boolean;
        includeFooter: boolean;
        headerText?: string;
        footerText?: string;
    };
    adobe?: {
        useAdobeServices: boolean;
        pdfServicesApiKey?: string;
        enhancedFormatting: boolean;
    };
}

export interface DocumentConversionRequest {
    content: string;
    inputFormat: InputFormat;
    outputFormat: OutputFormat;
    templateId?: string;
    metadata?: DocumentMetadata;
    options?: ConversionOptions;
    webhookUrl?: string;
    priority?: "low" | "normal" | "high";
}

export interface ProcessingError {
    code: string;
    message: string;
    details?: string;
    retryable: boolean;
    retryAfter?: number;
}

export interface DocumentConversionResponse {
    jobId: string;
    status: ProcessingStatus;
    downloadUrl?: string;
    fileSize?: number;
    progress?: number;
    estimatedCompletion?: Date;
    createdAt: Date;
    completedAt?: Date;
    processingDuration?: number;
    outputFormat: OutputFormat;
    originalFilename?: string;
    generatedFilename?: string;
    error?: ProcessingError;
    logs?: string[];
}

export interface BatchOptions {
    maxParallel?: number;
    continueOnError?: boolean;
    webhookUrl?: string;
    priority?: "low" | "normal" | "high";
}

export interface BatchConversionRequest {
    documents: DocumentConversionRequest[];
    options?: BatchOptions;
    batchName?: string;
}

export interface BatchConversionResponse {
    batchId: string;
    jobs: DocumentConversionResponse[];
    status: ProcessingStatus;
    progress: number;
    successCount: number;
    failureCount: number;
    createdAt: Date;
    completedAt?: Date;
    totalDuration?: number;
    batchName?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ErrorDetail;
    timestamp: string;
    requestId: string;
}

export interface ErrorDetail {
    code: string;
    message: string;
    details?: string;
    fieldErrors?: Record<string, string[]>;
    errorId?: string;
    timestamp: string;
    resolution?: string;
    documentationUrl?: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sort: string;
    order: "asc" | "desc";
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
