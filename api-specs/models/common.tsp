using TypeSpec.Http;

/**
 * Standard API response wrapper for all endpoints
 */
model ApiResponse<T> {
  /**
   * Indicates if the request was successful
   */
  success: boolean;

  /**
   * Response data when successful
   */
  data?: T;

  /**
   * Error details when unsuccessful
   */
  error?: ErrorDetail;

  /**
   * Response timestamp
   */
  timestamp: utcDateTime;

  /**
   * Unique request identifier for tracking
   */
  requestId: string;
}

/**
 * Pagination parameters for list operations
 */
model PaginationParams {
  /**
   * Page number (1-based)
   */
  @query page?: int32 = 1;

  /**
   * Items per page (max 100)
   */
  @query 
  @minValue(1) 
  @maxValue(100) 
  limit?: int32 = 20;

  /**
   * Sort field
   */
  @query sort?: string;

  /**
   * Sort order
   */
  @query order?: "asc" | "desc" = "asc";
}

/**
 * Pagination response metadata
 */
model PaginatedResponse<T> {
  /**
   * Array of items for current page
   */
  items: T[];

  /**
   * Pagination metadata
   */
  pagination: {
    /**
     * Current page number
     */
    page: int32;

    /**
     * Items per page
     */
    limit: int32;

    /**
     * Total number of items
     */
    total: int32;

    /**
     * Total number of pages
     */
    totalPages: int32;

    /**
     * Whether there is a next page
     */
    hasNext: boolean;

    /**
     * Whether there is a previous page
     */
    hasPrev: boolean;
  };
}

/**
 * Document metadata for enhanced processing
 */
model DocumentMetadata {
  /**
   * Document title
   */
  title?: string;

  /**
   * Document author
   */
  author?: string;

  /**
   * Document subject/description
   */
  subject?: string;

  /**
   * Keywords for searchability
   */
  keywords?: string[];

  /**
   * Creation timestamp
   */
  createdAt?: utcDateTime;

  /**
   * Last modification timestamp
   */
  modifiedAt?: utcDateTime;

  /**
   * Categorization tags
   */
  tags?: string[];

  /**
   * Custom properties for specialized use cases
   */
  customProperties?: Record<string>;

  /**
   * PMBOK-specific metadata
   */
  pmbok?: {
    phase?: "initiation" | "planning" | "execution" | "monitoring" | "closing";
    processGroup?: string;
    knowledgeArea?: string;
  };
}

/**
 * Processing status enumeration
 */
enum ProcessingStatus {
  /**
   * Job is queued for processing
   */
  queued: "queued",

  /**
   * Job is currently being processed
   */
  processing: "processing",

  /**
   * Job completed successfully
   */
  completed: "completed",

  /**
   * Job failed with errors
   */
  failed: "failed",

  /**
   * Job was cancelled by user
   */
  cancelled: "cancelled"
}
