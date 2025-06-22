using TypeSpec.Http;
using TypeSpec.Rest;

/**
 * Document processing and conversion API endpoints
 */
@tag("Document Processing")
@route("/api/v1/documents")
interface DocumentAPI {
  /**
   * Convert a single document to the specified format
   * 
   * Supports conversion between multiple formats including:
   * - Markdown to PDF/DOCX/HTML/PPTX
   * - HTML to PDF/DOCX
   * - DOCX to PDF/HTML
   * - And more format combinations
   */
  @post
  @route("/convert")
  @summary("Convert Document")
  convertDocument(
    /**
     * Document conversion request
     */
    @body request: DocumentConversionRequest
  ): ApiResponse<DocumentConversionResponse> | BadRequestError | UnauthorizedError | UnprocessableEntityError | TooManyRequestsError | InternalServerError;

  /**
   * Convert multiple documents in a single batch operation
   * 
   * Efficiently processes up to 100 documents in parallel,
   * with configurable batch processing options.
   */
  @post
  @route("/batch/convert")
  @summary("Batch Convert Documents")
  batchConvert(
    /**
     * Batch conversion request
     */
    @body request: BatchConversionRequest
  ): ApiResponse<BatchConversionResponse> | BadRequestError | UnauthorizedError | UnprocessableEntityError | TooManyRequestsError | InternalServerError;

  /**
   * Get the current status and progress of a conversion job
   * 
   * Returns detailed information about job progress,
   * estimated completion time, and download URLs when ready.
   */
  @get
  @route("/jobs/{jobId}")
  @summary("Get Job Status")
  getJobStatus(
    /**
     * Unique job identifier
     */
    @path jobId: string
  ): ApiResponse<DocumentConversionResponse> | NotFoundError | UnauthorizedError | InternalServerError;

  /**
   * Get the status and progress of a batch conversion
   * 
   * Returns overall batch progress and individual job statuses
   * within the batch.
   */
  @get
  @route("/batch/{batchId}")
  @summary("Get Batch Status")
  getBatchStatus(
    /**
     * Unique batch identifier
     */
    @path batchId: string
  ): ApiResponse<BatchConversionResponse> | NotFoundError | UnauthorizedError | InternalServerError;

  /**
   * Download the converted document
   * 
   * Returns the binary content of the converted document
   * with appropriate content type and filename headers.
   */
  @get
  @route("/download/{jobId}")
  @summary("Download Document")
  downloadDocument(
    /**
     * Job identifier for the converted document
     */
    @path jobId: string
  ): {
    /**
     * Content type of the converted document
     */
    @header("Content-Type") contentType: string;
    
    /**
     * Suggested filename for download
     */
    @header("Content-Disposition") contentDisposition: string;
    
    /**
     * File size in bytes
     */
    @header("Content-Length") contentLength?: int64;
    
    /**
     * Document binary content
     */
    @body content: bytes;
  } | NotFoundError | UnauthorizedError | InternalServerError;

  /**
   * Cancel a running or queued conversion job
   * 
   * Attempts to cancel the specified job. Jobs that are already
   * completed cannot be cancelled.
   */
  @delete
  @route("/jobs/{jobId}")
  @summary("Cancel Job")
  cancelJob(
    /**
     * Job identifier to cancel
     */
    @path jobId: string
  ): ApiResponse<void> | NotFoundError | UnauthorizedError | ConflictError | InternalServerError;

  /**
   * List conversion jobs with filtering and pagination
   * 
   * Returns a paginated list of conversion jobs with optional
   * filtering by status, date range, and other criteria.
   */
  @get
  @route("/jobs")
  @summary("List Jobs")
  listJobs(
    /**
     * Pagination parameters
     */
    ...PaginationParams,
    
    /**
     * Filter by job status
     */
    @query status?: ProcessingStatus,
    
    /**
     * Filter jobs from this date
     */
    @query fromDate?: utcDateTime,
    
    /**
     * Filter jobs to this date
     */
    @query toDate?: utcDateTime,
    
    /**
     * Filter by output format
     */
    @query outputFormat?: OutputFormat,
    
    /**
     * Search in job names/metadata
     */
    @query search?: string
  ): ApiResponse<PaginatedResponse<DocumentConversionResponse>> | BadRequestError | UnauthorizedError | InternalServerError;

  /**
   * Get conversion statistics and analytics
   * 
   * Returns comprehensive statistics about document conversions
   * including success rates, processing times, and format breakdown.
   */
  @get
  @route("/stats")
  @summary("Get Conversion Statistics")
  getStats(
    /**
     * Statistics from this date
     */
    @query fromDate?: utcDateTime,
    
    /**
     * Statistics to this date
     */
    @query toDate?: utcDateTime,
    
    /**
     * Group statistics by time period
     */
    @query groupBy?: "hour" | "day" | "week" | "month"
  ): ApiResponse<{
    /**
     * Total number of conversion jobs
     */
    totalJobs: int32;
    
    /**
     * Number of successful conversions
     */
    successfulJobs: int32;
    
    /**
     * Number of failed conversions
     */
    failedJobs: int32;
    
    /**
     * Success rate percentage
     */
    successRate: float32;
    
    /**
     * Processing time statistics
     */
    processingTime: {
      /**
       * Average processing time in milliseconds
       */
      average: int64;
      
      /**
       * Minimum processing time in milliseconds
       */
      min: int64;
      
      /**
       * Maximum processing time in milliseconds
       */
      max: int64;
      
      /**
       * Median processing time in milliseconds
       */
      median: int64;
    };
    
    /**
     * Breakdown by input format
     */
    inputFormatBreakdown: Record<int32>;
    
    /**
     * Breakdown by output format
     */
    outputFormatBreakdown: Record<int32>;
    
    /**
     * Error breakdown by error code
     */
    errorBreakdown: Record<int32>;
    
    /**
     * Statistics generation timestamp
     */
    generatedAt: utcDateTime;
  }> | BadRequestError | UnauthorizedError | InternalServerError;

  /**
   * Retry a failed conversion job
   * 
   * Attempts to retry a failed conversion job with the same
   * parameters or updated options.
   */
  @post
  @route("/jobs/{jobId}/retry")
  @summary("Retry Job")
  retryJob(
    /**
     * Job identifier to retry
     */
    @path jobId: string,
    
    /**
     * Optional updated conversion options
     */
    @body options?: ConversionOptions
  ): ApiResponse<DocumentConversionResponse> | NotFoundError | UnauthorizedError | ConflictError | InternalServerError;

  /**
   * Get supported format combinations
   * 
   * Returns a list of supported input-to-output format
   * conversion combinations.
   */
  @get
  @route("/formats")
  @summary("Get Supported Formats")
  getSupportedFormats(): ApiResponse<{
    /**
     * Supported input formats
     */
    inputFormats: InputFormat[];
    
    /**
     * Supported output formats
     */
    outputFormats: OutputFormat[];
    
    /**
     * Valid conversion combinations
     */
    conversions: {
      input: InputFormat;
      outputs: OutputFormat[];
    }[];
  }> | InternalServerError;
}
