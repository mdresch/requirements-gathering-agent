/**
 * Document template for consistent formatting and branding
 */
model Template {
  /**
   * Unique template identifier
   */
  id: string;

  /**
   * Template display name
   */
  @minLength(1)
  @maxLength(100)
  name: string;

  /**
   * Template description
   */
  @maxLength(500)
  description?: string;

  /**
   * Supported output format for this template
   */
  format: OutputFormat;

  /**
   * Template content (CSS, HTML, or format-specific markup)
   */
  @minLength(1)
  content: string;

  /**
   * Template variables that can be substituted
   */
  variables?: string[];

  /**
   * Template category for organization
   */
  category?: "business" | "technical" | "academic" | "legal" | "creative" | "pmbok";

  /**
   * Template creation timestamp
   */
  createdAt: utcDateTime;

  /**
   * Template last update timestamp
   */
  updatedAt: utcDateTime;

  /**
   * Template version number
   */
  version: int32;

  /**
   * Whether template is active and available for use
   */
  isActive: boolean;

  /**
   * Template author/creator
   */
  createdBy?: string;

  /**
   * Template usage statistics
   */
  usageCount?: int32;

  /**
   * Template metadata and custom properties
   */
  metadata?: Record<string>;

  /**
   * Preview thumbnail URL
   */
  thumbnailUrl?: url;

  /**
   * Template tags for searchability
   */
  tags?: string[];

  /**
   * PMBOK-specific template configuration
   */
  pmbokConfig?: {
    phase: "initiation" | "planning" | "execution" | "monitoring" | "closing";
    processGroup: string;
    knowledgeArea: string;
    deliverableType: string;
  };
}

/**
 * Template creation request
 */
model CreateTemplateRequest {
  /**
   * Template name
   */
  @minLength(1)
  @maxLength(100)
  name: string;

  /**
   * Template description
   */
  @maxLength(500)
  description?: string;

  /**
   * Target output format
   */
  format: OutputFormat;

  /**
   * Template content
   */
  @minLength(1)
  content: string;

  /**
   * Available template variables
   */
  variables?: string[];

  /**
   * Template category
   */
  category?: "business" | "technical" | "academic" | "legal" | "creative" | "pmbok";

  /**
   * Template tags
   */
  tags?: string[];

  /**
   * Custom metadata
   */
  metadata?: Record<string>;

  /**
   * PMBOK configuration (if category is "pmbok")
   */
  pmbokConfig?: {
    phase: "initiation" | "planning" | "execution" | "monitoring" | "closing";
    processGroup: string;
    knowledgeArea: string;
    deliverableType: string;
  };
}

/**
 * Template update request
 */
model UpdateTemplateRequest {
  /**
   * Updated template name
   */
  @maxLength(100)
  name?: string;

  /**
   * Updated description
   */
  @maxLength(500)
  description?: string;

  /**
   * Updated template content
   */
  content?: string;

  /**
   * Updated template variables
   */
  variables?: string[];

  /**
   * Updated category
   */
  category?: "business" | "technical" | "academic" | "legal" | "creative" | "pmbok";

  /**
   * Update active status
   */
  isActive?: boolean;

  /**
   * Updated tags
   */
  tags?: string[];

  /**
   * Updated metadata
   */
  metadata?: Record<string>;

  /**
   * Updated PMBOK configuration
   */
  pmbokConfig?: {
    phase: "initiation" | "planning" | "execution" | "monitoring" | "closing";
    processGroup: string;
    knowledgeArea: string;
    deliverableType: string;
  };
}

/**
 * Template preview request with sample data
 */
model TemplatePreviewRequest {
  /**
   * Sample data to populate template variables
   */
  data: Record<unknown>;

  /**
   * Optional conversion options for preview
   */
  options?: ConversionOptions;
}

/**
 * Template preview response
 */
model TemplatePreviewResponse {
  /**
   * URL to preview the rendered template
   */
  previewUrl: url;

  /**
   * Preview expiration timestamp
   */
  expiresAt: utcDateTime;

  /**
   * Preview file size
   */
  fileSize?: int64;

  /**
   * Preview generation timestamp
   */
  generatedAt: utcDateTime;
}
