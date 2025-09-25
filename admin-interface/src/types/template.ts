export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  aiInstructions: string;
  promptTemplate?: string;
  generationFunction?: string;
  documentKey?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: string;
  templateType: string;
  // Context building priority for LLM processing
  contextPriority?: 'low' | 'medium' | 'high' | 'critical';
  // Add missing properties for the editor
  contextRequirements?: string[];
  variables?: Record<string, any>;
  metadata?: TemplateMetadata;
}

export interface TemplateMetadata {
  framework?: string;
  complexity?: 'simple' | 'moderate' | 'advanced';
  estimatedTime?: string;
  dependencies?: string[];
  version?: string;
  author?: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
  content?: string; // Make optional since we're using templateData
  aiInstructions?: string;
  promptTemplate?: string;
  generationFunction?: string;
  documentKey?: string;
  tags?: string[];
  templateType?: string;
  contextPriority?: 'low' | 'medium' | 'high' | 'critical';
  // Add missing properties for the editor
  contextRequirements?: string[];
  variables?: Record<string, any>;
  metadata?: TemplateMetadata;
  templateData?: {
    content: string;
    aiInstructions: string;
    variables: any[];
    layout: any;
  };
  isActive?: boolean;
}

export interface UpdateTemplateRequest extends CreateTemplateRequest {
  id: string;
}

export interface TemplateSearchParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  tags?: string[];
  templateType?: string;
}

export interface TemplateSearchResponse {
  templates: Template[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Updated TemplateStats interface to match actual API response
export interface TemplateStats {
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}

// Extended interface for the UI component with computed properties
export interface ExtendedTemplateStats extends TemplateStats {
  totalTemplates: number;
  categoriesCount: number;
  topCategories: Array<{ category: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  recentActivity: Array<{
    type: 'created' | 'updated' | 'deleted';
    templateName: string;
    timestamp: string;
  }>;
}
