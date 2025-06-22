using TypeSpec.Http;
using TypeSpec.Rest;

/**
 * Template management API for document formatting and branding
 */
@tag("Template Management")
@route("/api/v1/templates")
interface TemplateAPI {
  /**
   * Create a new document template
   * 
   * Creates a reusable template for consistent document formatting
   * and branding across conversions.
   */
  @post
  @summary("Create Template")
  createTemplate(
    /**
     * Template creation request
     */
    @body request: CreateTemplateRequest
  ): ApiResponse<Template> | BadRequestError | UnauthorizedError | ConflictError | UnprocessableEntityError | InternalServerError;

  /**
   * Get template details by ID
   * 
   * Returns complete template information including content,
   * variables, and metadata.
   */
  @get
  @route("/{templateId}")
  @summary("Get Template")
  getTemplate(
    /**
     * Unique template identifier
     */
    @path templateId: string
  ): ApiResponse<Template> | NotFoundError | UnauthorizedError | InternalServerError;

  /**
   * Update an existing template
   * 
   * Updates template properties, content, or metadata.
   * Version number is automatically incremented.
   */
  @put
  @route("/{templateId}")
  @summary("Update Template")
  updateTemplate(
    /**
     * Template identifier to update
     */
    @path templateId: string,
    
    /**
     * Template update request
     */
    @body request: UpdateTemplateRequest
  ): ApiResponse<Template> | NotFoundError | BadRequestError | UnauthorizedError | ConflictError | InternalServerError;

  /**
   * Delete a template
   * 
   * Permanently removes a template. This action cannot be undone.
   * Active templates cannot be deleted unless force flag is used.
   */
  @delete
  @route("/{templateId}")
  @summary("Delete Template")
  deleteTemplate(
    /**
     * Template identifier to delete
     */
    @path templateId: string,
    
    /**
     * Force deletion even if template is active
     */
    @query force?: boolean = false
  ): ApiResponse<void> | NotFoundError | UnauthorizedError | ConflictError | InternalServerError;

  /**
   * List templates with filtering and pagination
   * 
   * Returns a paginated list of templates with optional filtering
   * by category, format, active status, and search terms.
   */
  @get
  @summary("List Templates")
  listTemplates(
    /**
     * Pagination parameters
     */
    ...PaginationParams,
    
    /**
     * Filter by output format
     */
    @query format?: OutputFormat,
    
    /**
     * Filter by active status
     */
    @query active?: boolean,
    
    /**
     * Filter by category
     */
    @query category?: "business" | "technical" | "academic" | "legal" | "creative" | "pmbok",
    
    /**
     * Search in template names and descriptions
     */
    @query search?: string,
    
    /**
     * Filter by tags
     */
    @query tags?: string,
    
    /**
     * Filter by creator
     */
    @query createdBy?: string
  ): ApiResponse<PaginatedResponse<Template>> | BadRequestError | UnauthorizedError | InternalServerError;

  /**
   * Preview template with sample data
   * 
   * Generates a preview of the template populated with provided
   * sample data to visualize the final output.
   */
  @post
  @route("/{templateId}/preview")
  @summary("Preview Template")
  previewTemplate(
    /**
     * Template identifier to preview
     */
    @path templateId: string,
    
    /**
     * Preview request with sample data
     */
    @body request: TemplatePreviewRequest
  ): ApiResponse<TemplatePreviewResponse> | NotFoundError | BadRequestError | UnauthorizedError | UnprocessableEntityError | InternalServerError;

  /**
   * Clone an existing template
   * 
   * Creates a copy of an existing template with a new name,
   * allowing for customization without affecting the original.
   */
  @post
  @route("/{templateId}/clone")
  @summary("Clone Template")
  cloneTemplate(
    /**
     * Template identifier to clone
     */
    @path templateId: string,
    
    /**
     * New template name and optional modifications
     */
    @body request: {
      /**
       * Name for the cloned template
       */
      @minLength(1)
      @maxLength(100)
      name: string;
      
      /**
       * Optional description for the cloned template
       */
      @maxLength(500)
      description?: string;
      
      /**
       * Optional category change
       */
      category?: "business" | "technical" | "academic" | "legal" | "creative" | "pmbok";
    }
  ): ApiResponse<Template> | NotFoundError | BadRequestError | UnauthorizedError | ConflictError | InternalServerError;

  /**
   * Get template usage statistics
   * 
   * Returns detailed usage analytics for a specific template
   * including conversion counts and success rates.
   */
  @get
  @route("/{templateId}/stats")
  @summary("Get Template Statistics")
  getTemplateStats(
    /**
     * Template identifier
     */
    @path templateId: string,
    
    /**
     * Statistics from this date
     */
    @query fromDate?: utcDateTime,
    
    /**
     * Statistics to this date
     */
    @query toDate?: utcDateTime
  ): ApiResponse<{
    /**
     * Template identifier
     */
    templateId: string;
    
    /**
     * Template name
     */
    templateName: string;
    
    /**
     * Total number of times template was used
     */
    usageCount: int32;
    
    /**
     * Number of successful conversions
     */
    successfulConversions: int32;
    
    /**
     * Number of failed conversions
     */
    failedConversions: int32;
    
    /**
     * Success rate percentage
     */
    successRate: float32;
    
    /**
     * Average processing time in milliseconds
     */
    averageProcessingTime: int64;
    
    /**
     * Last used timestamp
     */
    lastUsed?: utcDateTime;
    
    /**
     * Usage trend (daily usage over time period)
     */
    usageTrend: {
      date: utcDateTime;
      count: int32;
    }[];
  }> | NotFoundError | UnauthorizedError | InternalServerError;

  /**
   * Validate template syntax and content
   * 
   * Validates template content for syntax errors, missing variables,
   * and compatibility with the target format.
   */
  @post
  @route("/{templateId}/validate")
  @summary("Validate Template")
  validateTemplate(
    /**
     * Template identifier to validate
     */
    @path templateId: string
  ): ApiResponse<{
    /**
     * Whether template is valid
     */
    isValid: boolean;
    
    /**
     * Validation errors if any
     */
    errors: {
      /**
       * Error type
       */
      type: "syntax" | "missing-variable" | "invalid-format" | "compatibility";
      
      /**
       * Error message
       */
      message: string;
      
      /**
       * Line number where error occurs (if applicable)
       */
      line?: int32;
      
      /**
       * Column number where error occurs (if applicable)
       */
      column?: int32;
    }[];
    
    /**
     * Validation warnings
     */
    warnings: {
      /**
       * Warning type
       */
      type: "unused-variable" | "deprecated-syntax" | "performance";
      
      /**
       * Warning message
       */
      message: string;
    }[];
    
    /**
     * Available variables in template
     */
    detectedVariables: string[];
    
    /**
     * Template compatibility information
     */
    compatibility: {
      /**
       * Supported output formats
       */
      supportedFormats: OutputFormat[];
      
      /**
       * Required features/capabilities
       */
      requiredFeatures: string[];
    };
  }> | NotFoundError | UnauthorizedError | InternalServerError;
}
