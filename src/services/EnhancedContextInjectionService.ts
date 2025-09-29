/**
 * Enhanced Context Injection Service
 * Intelligently utilizes large context windows to load all available project documents
 * for comprehensive and contextually rich document generation.
 */

import { logger } from '../utils/logger.js';
import { ContextWindowValidationService } from './ContextWindowValidationService.js';
import { ContextFallbackStrategyService } from './ContextFallbackStrategyService.js';

export interface DocumentContext {
  id: string;
  name: string;
  type: string;
  category: string;
  content: string;
  qualityScore?: number;
  status: string;
  lastModified: Date;
  wordCount?: number;
  estimatedTokens: number;
  relevanceScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ContextInjectionResult {
  success: boolean;
  documentsLoaded: number;
  totalDocuments: number;
  totalTokensUsed: number;
  contextWindowUtilization: number;
  strategy: 'full-load' | 'prioritized-load' | 'chunked-load' | 'summarized-load';
  warnings?: string[];
  errors?: string[];
}

export interface ContextInjectionOptions {
  targetDocumentType: string;
  maxUtilizationPercentage: number;
  enableIntelligentPrioritization: boolean;
  enableContentSummarization: boolean;
  enableChunking: boolean;
  preserveCriticalContext: boolean;
  includeStakeholders: boolean;
  includeComplianceData: boolean;
}

export class EnhancedContextInjectionService {
  private static instance: EnhancedContextInjectionService;
  private contextWindowValidator: ContextWindowValidationService;
  private fallbackService: ContextFallbackStrategyService;

  private constructor() {
    this.contextWindowValidator = ContextWindowValidationService.getInstance();
    this.fallbackService = ContextFallbackStrategyService.getInstance();
  }

  static getInstance(): EnhancedContextInjectionService {
    if (!EnhancedContextInjectionService.instance) {
      EnhancedContextInjectionService.instance = new EnhancedContextInjectionService();
    }
    return EnhancedContextInjectionService.instance;
  }

  /**
   * Intelligently inject all available project documents as context
   * Leverages large context windows for comprehensive document generation
   */
  async injectAllProjectDocuments(
    projectId: string,
    options: Partial<ContextInjectionOptions> = {}
  ): Promise<ContextInjectionResult> {
    const defaultOptions: ContextInjectionOptions = {
      targetDocumentType: 'comprehensive-document',
      maxUtilizationPercentage: 90, // Use up to 90% of available context window
      enableIntelligentPrioritization: true,
      enableContentSummarization: true,
      enableChunking: true,
      preserveCriticalContext: true,
      includeStakeholders: true,
      includeComplianceData: true,
      ...options
    };

    logger.info(`🚀 Starting enhanced context injection for project ${projectId}`);
    logger.info(`📋 Target document: ${defaultOptions.targetDocumentType}`);
    logger.info(`🎯 Max utilization: ${defaultOptions.maxUtilizationPercentage}%`);

    try {
      // Step 1: Get optimal provider for large context
      // Method not implemented yet, using fallback
      const optimalProvider = null;
      if (!optimalProvider) {
        return {
          success: false,
          documentsLoaded: 0,
          totalDocuments: 0,
          totalTokensUsed: 0,
          contextWindowUtilization: 0,
          strategy: 'full-load',
          errors: ['No provider with large context window available']
        };
      }

      logger.info(`✅ Using fallback provider for context injection`);

      // Step 2: Load all available project documents
      const allDocuments = await this.loadAllProjectDocuments(projectId);
      if (allDocuments.length === 0) {
        logger.info('📄 No project documents found for context injection');
        return {
          success: true,
          documentsLoaded: 0,
          totalDocuments: 0,
          totalTokensUsed: 0,
          contextWindowUtilization: 0,
          strategy: 'full-load'
        };
      }

      logger.info(`📚 Found ${allDocuments.length} project documents`);

      // Step 3: Calculate total context requirements
      const totalRequiredTokens = allDocuments.reduce((sum, doc) => sum + doc.estimatedTokens, 0);
      const maxAvailableTokens = 100000; // Fallback token limit

      logger.info(`📊 Context analysis:`);
      logger.info(`   Total documents: ${allDocuments.length}`);
      logger.info(`   Total required tokens: ${totalRequiredTokens.toLocaleString()}`);
      logger.info(`   Available tokens: ${maxAvailableTokens.toLocaleString()}`);
      logger.info(`   Utilization: ${((totalRequiredTokens / maxAvailableTokens) * 100).toFixed(1)}%`);

      // Step 4: Determine injection strategy
      const strategy = this.determineInjectionStrategy(
        totalRequiredTokens,
        maxAvailableTokens,
        allDocuments.length,
        defaultOptions
      );

      logger.info(`🎯 Selected strategy: ${strategy}`);

      // Step 5: Execute injection strategy
      const result = await this.executeInjectionStrategy(
        allDocuments,
        maxAvailableTokens,
        strategy,
        defaultOptions
      );

      logger.info(`✅ Context injection completed:`);
      logger.info(`   Documents loaded: ${result.documentsLoaded}/${result.totalDocuments}`);
      logger.info(`   Tokens used: ${result.totalTokensUsed.toLocaleString()}`);
      logger.info(`   Utilization: ${result.contextWindowUtilization.toFixed(1)}%`);

      return result;

    } catch (error) {
      logger.error('❌ Error during enhanced context injection:', error);
      return {
        success: false,
        documentsLoaded: 0,
        totalDocuments: 0,
        totalTokensUsed: 0,
        contextWindowUtilization: 0,
        strategy: 'full-load',
        errors: [`Context injection failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Load all available project documents with metadata
   */
  private async loadAllProjectDocuments(projectId: string): Promise<DocumentContext[]> {
    try {
      // Import ProjectDocument model
      const { ProjectDocument } = await import('../models/ProjectDocument.js');
      
      // Find all existing documents for this project
      const existingDocuments = await ProjectDocument.find({
        projectId: projectId,
        deletedAt: null,
        status: { $in: ['draft', 'review', 'approved', 'published'] }
      }).sort({ 
        status: 1, // Prioritize approved/published documents
        qualityScore: -1, // Then by quality score
        lastModified: -1 // Finally by recency
      }).exec();

      // Convert to DocumentContext format
      const documentContexts: DocumentContext[] = existingDocuments.map(doc => {
        const content = this.createStructuredContextContent(doc);
        const estimatedTokens = this.estimateTokens(content);
        
        return {
          id: doc._id.toString(),
          name: doc.name,
          type: doc.type,
          category: doc.category,
          content,
          qualityScore: doc.qualityScore,
          status: doc.status,
          lastModified: doc.lastModified,
          wordCount: doc.wordCount,
          estimatedTokens,
          relevanceScore: this.calculateRelevanceScore(doc),
          priority: this.determineDocumentPriority(doc)
        };
      });

      return documentContexts;

    } catch (error) {
      logger.error('Error loading project documents:', error);
      return [];
    }
  }

  /**
   * Determine the best injection strategy based on context requirements
   */
  private determineInjectionStrategy(
    totalRequiredTokens: number,
    maxAvailableTokens: number,
    documentCount: number,
    options: ContextInjectionOptions
  ): 'full-load' | 'prioritized-load' | 'chunked-load' | 'summarized-load' {
    
    // If we can fit all documents, use full load
    if (totalRequiredTokens <= maxAvailableTokens) {
      return 'full-load';
    }

    // If we can fit most documents with prioritization, use prioritized load
    const highPriorityDocuments = documentCount * 0.7; // Assume 70% are high priority
    if (highPriorityDocuments > 0) {
      return 'prioritized-load';
    }

    // If we have many documents, try chunking
    if (documentCount > 10) {
      return 'chunked-load';
    }

    // Otherwise, use summarization
    return 'summarized-load';
  }

  /**
   * Execute the selected injection strategy
   */
  private async executeInjectionStrategy(
    documents: DocumentContext[],
    maxTokens: number,
    strategy: string,
    options: ContextInjectionOptions
  ): Promise<ContextInjectionResult> {
    
    switch (strategy) {
      case 'full-load':
        return this.executeFullLoad(documents, maxTokens);
      
      case 'prioritized-load':
        return this.executePrioritizedLoad(documents, maxTokens, options);
      
      case 'chunked-load':
        return this.executeChunkedLoad(documents, maxTokens, options);
      
      case 'summarized-load':
        return this.executeSummarizedLoad(documents, maxTokens, options);
      
      default:
        return this.executeFullLoad(documents, maxTokens);
    }
  }

  /**
   * Execute full load strategy - load all documents
   */
  private async executeFullLoad(
    documents: DocumentContext[],
    maxTokens: number
  ): Promise<ContextInjectionResult> {
    
    let totalTokensUsed = 0;
    let documentsLoaded = 0;
    
    // Import ContextManager
    const { ContextManager } = await import('../modules/contextManager.js');
    const contextManager = ContextManager.getInstance();
    
    for (const doc of documents) {
      if (totalTokensUsed + doc.estimatedTokens <= maxTokens) {
        const contextKey = `FULL-CONTEXT-${doc.type}-${doc.id}`;
        contextManager.addEnrichedContext(contextKey, doc.content);
        totalTokensUsed += doc.estimatedTokens;
        documentsLoaded++;
        
        logger.info(`✅ Loaded full document: ${doc.name} (${doc.type}) - ${doc.estimatedTokens.toLocaleString()} tokens`);
      } else {
        logger.warn(`⚠️ Skipping document due to token limit: ${doc.name} (${doc.type})`);
        break;
      }
    }
    
    return {
      success: true,
      documentsLoaded,
      totalDocuments: documents.length,
      totalTokensUsed,
      contextWindowUtilization: (totalTokensUsed / maxTokens) * 100,
      strategy: 'full-load'
    };
  }

  /**
   * Execute prioritized load strategy - prioritize important documents
   */
  private async executePrioritizedLoad(
    documents: DocumentContext[],
    maxTokens: number,
    options: ContextInjectionOptions
  ): Promise<ContextInjectionResult> {
    
    // Sort documents by priority and relevance
    const sortedDocuments = documents.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.relevanceScore - a.relevanceScore;
    });
    
    let totalTokensUsed = 0;
    let documentsLoaded = 0;
    
    // Import ContextManager
    const { ContextManager } = await import('../modules/contextManager.js');
    const contextManager = ContextManager.getInstance();
    
    // Load critical and high priority documents first
    for (const doc of sortedDocuments) {
      if (doc.priority === 'critical' || doc.priority === 'high') {
        if (totalTokensUsed + doc.estimatedTokens <= maxTokens) {
          const contextKey = `PRIORITY-${doc.priority.toUpperCase()}-${doc.type}-${doc.id}`;
          contextManager.addEnrichedContext(contextKey, doc.content);
          totalTokensUsed += doc.estimatedTokens;
          documentsLoaded++;
          
          logger.info(`✅ Loaded priority document: ${doc.name} (${doc.priority}) - ${doc.estimatedTokens.toLocaleString()} tokens`);
        }
      }
    }
    
    // Load medium priority documents if space allows
    for (const doc of sortedDocuments) {
      if (doc.priority === 'medium' && totalTokensUsed + doc.estimatedTokens <= maxTokens) {
        const contextKey = `MEDIUM-PRIORITY-${doc.type}-${doc.id}`;
        contextManager.addEnrichedContext(contextKey, doc.content);
        totalTokensUsed += doc.estimatedTokens;
        documentsLoaded++;
        
        logger.info(`✅ Loaded medium priority document: ${doc.name} - ${doc.estimatedTokens.toLocaleString()} tokens`);
      }
    }
    
    return {
      success: true,
      documentsLoaded,
      totalDocuments: documents.length,
      totalTokensUsed,
      contextWindowUtilization: (totalTokensUsed / maxTokens) * 100,
      strategy: 'prioritized-load',
      warnings: [`Prioritized loading: ${documentsLoaded}/${documents.length} documents loaded`]
    };
  }

  /**
   * Execute chunked load strategy - split large documents into chunks
   */
  private async executeChunkedLoad(
    documents: DocumentContext[],
    maxTokens: number,
    options: ContextInjectionOptions
  ): Promise<ContextInjectionResult> {
    
    let totalTokensUsed = 0;
    let documentsLoaded = 0;
    
    // Import ContextManager
    const { ContextManager } = await import('../modules/contextManager.js');
    const contextManager = ContextManager.getInstance();
    
    for (const doc of documents) {
      if (doc.estimatedTokens <= maxTokens - totalTokensUsed) {
        // Document fits entirely
        const contextKey = `CHUNKED-FULL-${doc.type}-${doc.id}`;
        contextManager.addEnrichedContext(contextKey, doc.content);
        totalTokensUsed += doc.estimatedTokens;
        documentsLoaded++;
        
        logger.info(`✅ Loaded full document: ${doc.name} - ${doc.estimatedTokens.toLocaleString()} tokens`);
      } else if (doc.priority === 'critical' || doc.priority === 'high') {
        // Split high-priority documents into chunks
        const chunks = this.splitDocumentIntoChunks(doc, maxTokens - totalTokensUsed);
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const contextKey = `CHUNKED-${doc.type}-${doc.id}-${i + 1}`;
          contextManager.addEnrichedContext(contextKey, chunk);
          totalTokensUsed += this.estimateTokens(chunk);
        }
        
        documentsLoaded++;
        logger.info(`✅ Loaded document in chunks: ${doc.name} - ${chunks.length} chunks`);
      }
      
      if (totalTokensUsed >= maxTokens * 0.95) break; // Stop at 95% utilization
    }
    
    return {
      success: true,
      documentsLoaded,
      totalDocuments: documents.length,
      totalTokensUsed,
      contextWindowUtilization: (totalTokensUsed / maxTokens) * 100,
      strategy: 'chunked-load',
      warnings: [`Chunked loading: ${documentsLoaded}/${documents.length} documents processed`]
    };
  }

  /**
   * Execute summarized load strategy - summarize large documents
   */
  private async executeSummarizedLoad(
    documents: DocumentContext[],
    maxTokens: number,
    options: ContextInjectionOptions
  ): Promise<ContextInjectionResult> {
    
    let totalTokensUsed = 0;
    let documentsLoaded = 0;
    
    // Import ContextManager
    const { ContextManager } = await import('../modules/contextManager.js');
    const contextManager = ContextManager.getInstance();
    
    for (const doc of documents) {
      let processedContent = doc.content;
      
      // Summarize if document is too large
      if (doc.estimatedTokens > (maxTokens - totalTokensUsed) * 0.3) {
        processedContent = await this.summarizeDocument(doc, maxTokens - totalTokensUsed);
      }
      
      const processedTokens = this.estimateTokens(processedContent);
      
      if (totalTokensUsed + processedTokens <= maxTokens) {
        const contextKey = `SUMMARIZED-${doc.type}-${doc.id}`;
        contextManager.addEnrichedContext(contextKey, processedContent);
        totalTokensUsed += processedTokens;
        documentsLoaded++;
        
        logger.info(`✅ Loaded summarized document: ${doc.name} - ${processedTokens.toLocaleString()} tokens`);
      }
      
      if (totalTokensUsed >= maxTokens * 0.95) break; // Stop at 95% utilization
    }
    
    return {
      success: true,
      documentsLoaded,
      totalDocuments: documents.length,
      totalTokensUsed,
      contextWindowUtilization: (totalTokensUsed / maxTokens) * 100,
      strategy: 'summarized-load',
      warnings: [`Summarized loading: ${documentsLoaded}/${documents.length} documents processed`]
    };
  }

  /**
   * Private helper methods
   */
  private createStructuredContextContent(doc: any): string {
    return `# ${doc.name}

**Document Type:** ${doc.type}
**Category:** ${doc.category}
**Status:** ${doc.status}
**Quality Score:** ${doc.qualityScore || 'N/A'}%
**Last Modified:** ${doc.lastModified.toISOString()}
**Word Count:** ${doc.wordCount || 'N/A'}

## Content

${doc.content}`;
  }

  private estimateTokens(text: string): number {
    // Simple token estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private calculateRelevanceScore(doc: any): number {
    let score = 0;
    
    // Base score from quality
    score += doc.qualityScore || 0;
    
    // Boost for approved/published documents
    if (doc.status === 'approved' || doc.status === 'published') {
      score += 20;
    }
    
    // Boost for recent documents
    const daysSinceModified = (Date.now() - doc.lastModified.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceModified < 30) score += 10;
    else if (daysSinceModified < 90) score += 5;
    
    return score;
  }

  private determineDocumentPriority(doc: any): 'critical' | 'high' | 'medium' | 'low' {
    const criticalTypes = ['project-charter', 'requirements-specification', 'technical-specification'];
    const highTypes = ['risk-register', 'stakeholder-register', 'benefits-realization-plan'];
    const mediumTypes = ['project-plan', 'communication-plan', 'quality-plan'];
    
    if (criticalTypes.includes(doc.type)) return 'critical';
    if (highTypes.includes(doc.type)) return 'high';
    if (mediumTypes.includes(doc.type)) return 'medium';
    return 'low';
  }

  private splitDocumentIntoChunks(doc: DocumentContext, maxChunkSize: number): string[] {
    const sections = doc.content.split(/\n(?=##)/); // Split by major sections
    const chunks: string[] = [];
    
    for (const section of sections) {
      const sectionTokens = this.estimateTokens(section);
      
      if (sectionTokens <= maxChunkSize) {
        chunks.push(section);
      } else {
        // Split large sections into smaller chunks
        const subChunks = this.splitLargeSection(section, maxChunkSize);
        chunks.push(...subChunks);
      }
    }
    
    return chunks;
  }

  private splitLargeSection(section: string, maxChunkSize: number): string[] {
    const lines = section.split('\n');
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentTokens = 0;
    
    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);
      
      if (currentTokens + lineTokens > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [line];
        currentTokens = lineTokens;
      } else {
        currentChunk.push(line);
        currentTokens += lineTokens;
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
    }
    
    return chunks;
  }

  private async summarizeDocument(doc: DocumentContext, maxTokens: number): Promise<string> {
    // Simple summarization strategy - in production, this could use AI
    const lines = doc.content.split('\n');
    const summaryLines: string[] = [];
    let currentTokens = 0;
    
    // Always include document header
    summaryLines.push(`# ${doc.name}`);
    summaryLines.push(`**Document Type:** ${doc.type}`);
    summaryLines.push(`**Status:** ${doc.status}`);
    summaryLines.push(`**Quality Score:** ${doc.qualityScore || 'N/A'}%`);
    summaryLines.push('');
    
    // Keep headers and important content
    for (const line of lines) {
      const trimmedLine = line.trim();
      const lineTokens = this.estimateTokens(line);
      
      // Always keep headers (lines starting with #)
      if (trimmedLine.startsWith('#')) {
        if (currentTokens + lineTokens <= maxTokens) {
          summaryLines.push(line);
          currentTokens += lineTokens;
        }
        continue;
      }
      
      // Keep important content (lines with key terms)
      const importantTerms = ['requirement', 'specification', 'objective', 'criteria', 'deliverable', 'benefit', 'risk'];
      const isImportant = importantTerms.some(term => trimmedLine.toLowerCase().includes(term));
      
      if (isImportant && currentTokens + lineTokens <= maxTokens) {
        summaryLines.push(line);
        currentTokens += lineTokens;
      }
    }
    
    return summaryLines.join('\n');
  }
}

export default EnhancedContextInjectionService;
