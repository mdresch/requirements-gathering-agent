/**
 * Unified Template Interface
 * 
 * Provides a consistent data model across all layers of the application
 * to eliminate data transformation inconsistencies and improve type safety.
 */

export interface UnifiedTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  documentKey: string;
  templateType: 'basic' | 'ai_instruction' | 'api_created' | 'system' | 'pmbok';
  content: {
    aiInstructions: string;
    promptTemplate: string;
    variables: TemplateVariable[];
    layout?: any;
  };
  metadata: {
    tags: string[];
    priority: number;
    emoji: string;
    source: string;
    contextPriority?: 'low' | 'medium' | 'high' | 'critical';
    author?: string;
    framework?: string;
    complexity?: string;
    estimatedTime?: string;
    dependencies?: string[];
    version?: string;
  };
  version: number;
  isActive: boolean;
  isSystem: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  required?: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: string;
  documentKey?: string;
  templateType: UnifiedTemplate['templateType'];
  content: {
    aiInstructions: string;
    promptTemplate: string;
    variables?: TemplateVariable[];
    layout?: any;
  };
  metadata: {
    tags?: string[];
    priority?: number;
    emoji?: string;
    source?: string;
    contextPriority?: 'low' | 'medium' | 'high' | 'critical';
    author?: string;
    framework?: string;
    complexity?: string;
    estimatedTime?: string;
    dependencies?: string[];
    version?: string;
  };
  isActive?: boolean;
  isSystem?: boolean;
  createdBy: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: string;
  documentKey?: string;
  templateType?: UnifiedTemplate['templateType'];
  content?: {
    aiInstructions?: string;
    promptTemplate?: string;
    variables?: TemplateVariable[];
    layout?: any;
  };
  metadata?: {
    tags?: string[];
    priority?: number;
    emoji?: string;
    source?: string;
    contextPriority?: 'low' | 'medium' | 'high' | 'critical';
    author?: string;
    framework?: string;
    complexity?: string;
    estimatedTime?: string;
    dependencies?: string[];
    version?: string;
  };
  isActive?: boolean;
  version?: number;
}

export interface TemplateSearchParams {
  page?: number;
  limit?: number;
  sort?: 'name' | 'category' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  category?: string;
  tag?: string;
  search?: string;
  isActive?: boolean;
  isSystem?: boolean;
  templateType?: UnifiedTemplate['templateType'];
}

export interface TemplateApiResponse {
  success: boolean;
  data: UnifiedTemplate | UnifiedTemplate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
  requestId: string;
  error?: string;
}

/**
 * Template conversion utilities
 */
export class TemplateConverter {
  /**
   * Convert database template to unified format
   */
  static fromDatabase(dbTemplate: any): UnifiedTemplate {
    return {
      id: dbTemplate._id?.toString() || dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description || '',
      category: dbTemplate.category,
      documentKey: dbTemplate.documentKey || '',
      templateType: this.mapTemplateType(dbTemplate.template_type),
      content: {
        aiInstructions: dbTemplate.ai_instructions || '',
        promptTemplate: dbTemplate.prompt_template || '',
        variables: dbTemplate.metadata?.variables || [],
        layout: dbTemplate.metadata?.layout
      },
      metadata: {
        tags: dbTemplate.metadata?.tags || [],
        priority: dbTemplate.metadata?.priority || 100,
        emoji: dbTemplate.metadata?.emoji || '📄',
        source: dbTemplate.metadata?.source || 'unknown',
        contextPriority: dbTemplate.contextPriority || 'medium',
        author: dbTemplate.metadata?.author,
        framework: dbTemplate.metadata?.framework,
        complexity: dbTemplate.metadata?.complexity,
        estimatedTime: dbTemplate.metadata?.estimatedTime,
        dependencies: dbTemplate.metadata?.dependencies,
        version: dbTemplate.metadata?.version
      },
      version: dbTemplate.version || 1,
      isActive: dbTemplate.is_active !== false,
      isSystem: dbTemplate.is_system === true,
      createdBy: dbTemplate.created_by || 'unknown',
      createdAt: dbTemplate.created_at || new Date(),
      updatedAt: dbTemplate.updated_at || new Date()
    };
  }

  /**
   * Convert unified template to database format
   */
  static toDatabase(unifiedTemplate: CreateTemplateRequest | UpdateTemplateRequest): any {
    const isUpdate = 'id' in unifiedTemplate;
    
    const base = {
      name: unifiedTemplate.name,
      description: unifiedTemplate.description,
      category: unifiedTemplate.category,
      documentKey: unifiedTemplate.documentKey || '',
      template_type: this.mapTemplateTypeToDb(unifiedTemplate.templateType || 'basic'),
      ai_instructions: unifiedTemplate.content?.aiInstructions || '',
      prompt_template: unifiedTemplate.content?.promptTemplate || '',
      generation_function: 'getAiGenericDocument',
      contextPriority: unifiedTemplate.metadata?.contextPriority || 'medium',
      metadata: {
        tags: unifiedTemplate.metadata?.tags || [],
        variables: unifiedTemplate.content?.variables || [],
        layout: unifiedTemplate.content?.layout || {},
        emoji: unifiedTemplate.metadata?.emoji || '📄',
        priority: unifiedTemplate.metadata?.priority || 100,
        source: unifiedTemplate.metadata?.source || 'api',
        author: unifiedTemplate.metadata?.author,
        framework: unifiedTemplate.metadata?.framework,
        complexity: unifiedTemplate.metadata?.complexity,
        estimatedTime: unifiedTemplate.metadata?.estimatedTime,
        dependencies: unifiedTemplate.metadata?.dependencies,
        version: unifiedTemplate.metadata?.version
      },
      is_active: unifiedTemplate.isActive !== false,
      is_system: (unifiedTemplate as any).isSystem === true,
      created_by: (unifiedTemplate as any).createdBy
    };

    if (!isUpdate) {
      return {
        ...base,
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
    }

    return {
      ...base,
      updated_at: new Date()
    };
  }

  /**
   * Convert unified template to API response format
   */
  static toApiResponse(unifiedTemplate: UnifiedTemplate): any {
    return {
      id: unifiedTemplate.id,
      name: unifiedTemplate.name,
      description: unifiedTemplate.description,
      category: unifiedTemplate.category,
      documentKey: unifiedTemplate.documentKey,
      tags: unifiedTemplate.metadata.tags,
      templateData: {
        content: unifiedTemplate.content.promptTemplate,
        aiInstructions: unifiedTemplate.content.aiInstructions,
        variables: unifiedTemplate.content.variables,
        layout: unifiedTemplate.content.layout
      },
      metadata: {
        tags: unifiedTemplate.metadata.tags,
        priority: unifiedTemplate.metadata.priority,
        emoji: unifiedTemplate.metadata.emoji,
        source: unifiedTemplate.metadata.source,
        contextPriority: unifiedTemplate.metadata.contextPriority,
        author: unifiedTemplate.metadata.author,
        framework: unifiedTemplate.metadata.framework,
        complexity: unifiedTemplate.metadata.complexity,
        estimatedTime: unifiedTemplate.metadata.estimatedTime,
        dependencies: unifiedTemplate.metadata.dependencies,
        version: unifiedTemplate.metadata.version
      },
      isActive: unifiedTemplate.isActive,
      createdBy: unifiedTemplate.createdBy,
      createdAt: unifiedTemplate.createdAt,
      updatedAt: unifiedTemplate.updatedAt,
      version: unifiedTemplate.version,
      templateType: unifiedTemplate.templateType
    };
  }

  /**
   * Map database template type to unified format
   */
  private static mapTemplateType(dbType: string): UnifiedTemplate['templateType'] {
    const typeMap: { [key: string]: UnifiedTemplate['templateType'] } = {
      'basic': 'basic',
      'ai_instruction': 'ai_instruction',
      'api_created': 'api_created',
      'system': 'system',
      'pmbok': 'pmbok'
    };
    
    return typeMap[dbType] || 'basic';
  }

  /**
   * Map unified template type to database format
   */
  private static mapTemplateTypeToDb(unifiedType: UnifiedTemplate['templateType']): string {
    const typeMap: { [key in UnifiedTemplate['templateType']]: string } = {
      'basic': 'basic',
      'ai_instruction': 'ai_instruction',
      'api_created': 'api_created',
      'system': 'system',
      'pmbok': 'pmbok'
    };
    
    return typeMap[unifiedType] || 'basic';
  }
}
