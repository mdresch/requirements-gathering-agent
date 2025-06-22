/**
 * Supported input document formats
 */
enum InputFormat {
  /**
   * Markdown format (.md)
   */
  markdown: "markdown",

  /**
   * HTML format (.html)
   */
  html: "html", 

  /**
   * Microsoft Word format (.docx)
   */
  docx: "docx",

  /**
   * Plain text format (.txt)
   */
  txt: "txt",

  /**
   * Rich Text Format (.rtf)
   */
  rtf: "rtf"
}

/**
 * Supported output document formats
 */
enum OutputFormat {
  /**
   * PDF format - Professional documents
   */
  pdf: "pdf",

  /**
   * Microsoft Word format (.docx)
   */
  docx: "docx",

  /**
   * HTML format for web display
   */
  html: "html",

  /**
   * PowerPoint presentation (.pptx)
   */
  pptx: "pptx"
}

/**
 * Document conversion request payload
 */
model DocumentConversionRequest {
  /**
   * Source document content or URL
   * Can be raw content or a publicly accessible URL
   */
  @minLength(1)
  content: string;

  /**
   * Input format of the source document
   */
  inputFormat: InputFormat;

  /**
   * Desired output format
   */
  outputFormat: OutputFormat;

  /**
   * Template ID to use for conversion styling
   */
  templateId?: string;

  /**
   * Document metadata for enhanced processing
   */
  metadata?: DocumentMetadata;

  /**
   * Format-specific conversion options
   */
  options?: ConversionOptions;

  /**
   * Webhook URL for completion notification
   */
  webhookUrl?: url;

  /**
   * Priority level for processing queue
   */
  priority?: "low" | "normal" | "high" = "normal";
}

/**
 * Advanced conversion options for fine-tuned output
 */
model ConversionOptions {
  /**
   * Page size for PDF/DOCX output
   */
  pageSize?: "A4" | "A3" | "Letter" | "Legal" | "Custom";

  /**
   * Page orientation
   */
  orientation?: "portrait" | "landscape";

  /**
   * Custom page dimensions (when pageSize is "Custom")
   */
  customDimensions?: {
    width: float32;
    height: float32;
    unit: "in" | "cm" | "mm";
  };

  /**
   * Include automatically generated table of contents
   */
  includeTableOfContents?: boolean;

  /**
   * Include page numbers in footer
   */
  includePageNumbers?: boolean;

  /**
   * Page number starting value
   */
  pageNumberStart?: int32;

  /**
   * Custom CSS for HTML/PDF styling
   */
  customCss?: string;

  /**
   * DPI for image rendering (72-300)
   */
  @minValue(72)
  @maxValue(300)
  dpi?: int32;

  /**
   * PDF compression level (0-9, 0=none, 9=maximum)
   */
  @minValue(0)
  @maxValue(9)
  compression?: int32;

  /**
   * Password protection for PDF output
   */
  password?: string;

  /**
   * Watermark configuration
   */
  watermark?: {
    text: string;
    opacity: float32;
    position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };

  /**
   * Header/footer configuration
   */
  headerFooter?: {
    includeHeader: boolean;
    includeFooter: boolean;
    headerText?: string;
    footerText?: string;
  };

  /**
   * Adobe-specific processing options
   */
  adobe?: {
    useAdobeServices: boolean;
    pdfServicesApiKey?: string;
    enhancedFormatting: boolean;
  };
}

/**
 * Document conversion response
 */
model DocumentConversionResponse {
  /**
   * Unique job identifier for tracking
   */
  jobId: string;

  /**
   * Current processing status
   */
  status: ProcessingStatus;

  /**
   * Download URL (available when status is "completed")
   */
  downloadUrl?: url;

  /**
   * File size in bytes
   */
  fileSize?: int64;

  /**
   * Processing progress percentage (0-100)
   */
  @minValue(0)
  @maxValue(100)
  progress?: int32;

  /**
   * Estimated completion time
   */
  estimatedCompletion?: utcDateTime;

  /**
   * Job creation timestamp
   */
  createdAt: utcDateTime;

  /**
   * Job completion timestamp
   */
  completedAt?: utcDateTime;

  /**
   * Processing duration in milliseconds
   */
  processingDuration?: int64;

  /**
   * Output format of converted document
   */
  outputFormat: OutputFormat;

  /**
   * Original filename (if provided)
   */
  originalFilename?: string;

  /**
   * Generated filename for download
   */
  generatedFilename?: string;

  /**
   * Error details if status is "failed"
   */
  error?: ProcessingError;

  /**
   * Processing logs for debugging
   */
  logs?: string[];
}

/**
 * Processing error details
 */
model ProcessingError {
  /**
   * Error code for programmatic handling
   */
  code: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Detailed error information
   */
  details?: string;

  /**
   * Whether the error is retryable
   */
  retryable: boolean;

  /**
   * Suggested retry delay in seconds
   */
  retryAfter?: int32;
}

/**
 * Batch conversion request for multiple documents
 */
model BatchConversionRequest {
  /**
   * List of documents to convert (max 100 per batch)
   */
  @minItems(1)
  @maxItems(100)
  documents: DocumentConversionRequest[];

  /**
   * Batch processing options
   */
  options?: BatchOptions;

  /**
   * Batch name for identification
   */
  batchName?: string;
}

/**
 * Batch processing configuration options
 */
model BatchOptions {
  /**
   * Maximum parallel conversions (1-10)
   */
  @minValue(1)
  @maxValue(10)
  maxParallel?: int32 = 3;

  /**
   * Continue processing remaining documents if one fails
   */
  continueOnError?: boolean = true;

  /**
   * Webhook URL for batch completion notification
   */
  webhookUrl?: url;

  /**
   * Priority level for the entire batch
   */
  priority?: "low" | "normal" | "high" = "normal";
}

/**
 * Batch conversion response
 */
model BatchConversionResponse {
  /**
   * Unique batch identifier
   */
  batchId: string;

  /**
   * Individual job responses
   */
  jobs: DocumentConversionResponse[];

  /**
   * Overall batch status
   */
  status: ProcessingStatus;

  /**
   * Batch processing progress (0-100)
   */
  @minValue(0)
  @maxValue(100)
  progress: int32;

  /**
   * Number of successful conversions
   */
  successCount: int32;

  /**
   * Number of failed conversions
   */
  failureCount: int32;

  /**
   * Batch creation timestamp
   */
  createdAt: utcDateTime;

  /**
   * Batch completion timestamp
   */
  completedAt?: utcDateTime;

  /**
   * Total processing duration for batch
   */
  totalDuration?: int64;

  /**
   * Batch name (if provided)
   */
  batchName?: string;
}
