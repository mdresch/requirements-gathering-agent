/**
 * Advanced Context Compression Service
 * Handles 100+ document repositories with intelligent compression,
 * summarization, and context optimization techniques.
 */

import { logger } from '../utils/logger.js';
import { AIProcessor } from '../modules/ai/AIProcessor.js';

export interface CompressionStrategy {
  name: string;
  description: string;
  compressionRatio: number;
  qualityPreservation: number;
  processingTime: number;
  applicableFor: string[];
}

export interface CompressedContext {
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  qualityScore: number;
  content: string;
  metadata: {
    originalDocumentCount: number;
    compressedDocumentCount: number;
    strategy: string;
    processingTime: number;
  };
}

export interface ContextCompressionOptions {
  targetCompressionRatio: number;
  preserveCriticalContent: boolean;
  enableAISummarization: boolean;
  enableSemanticCompression: boolean;
  enableHierarchicalCompression: boolean;
  maxProcessingTime: number; // milliseconds
  qualityThreshold: number; // 0-100
}

export class AdvancedContextCompressionService {
  private static instance: AdvancedContextCompressionService;
  private aiProcessor: AIProcessor;

  private constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  static getInstance(): AdvancedContextCompressionService {
    if (!AdvancedContextCompressionService.instance) {
      AdvancedContextCompressionService.instance = new AdvancedContextCompressionService();
    }
    return AdvancedContextCompressionService.instance;
  }

  /**
   * Compress large document context using advanced techniques
   */
  async compressLargeContext(
    documents: any[],
    options: Partial<ContextCompressionOptions> = {}
  ): Promise<CompressedContext> {
    const startTime = Date.now();
    
    const defaultOptions: ContextCompressionOptions = {
      targetCompressionRatio: 0.3, // Compress to 30% of original size
      preserveCriticalContent: true,
      enableAISummarization: true,
      enableSemanticCompression: true,
      enableHierarchicalCompression: true,
      maxProcessingTime: 30000, // 30 seconds
      qualityThreshold: 80,
      ...options
    };

    logger.info(`🗜️ Starting advanced context compression for ${documents.length} documents`);
    logger.info(`🎯 Target compression ratio: ${(defaultOptions.targetCompressionRatio * 100).toFixed(1)}%`);

    try {
      // Step 1: Analyze document characteristics
      const analysis = this.analyzeDocumentCharacteristics(documents);
      logger.info(`📊 Document analysis: ${analysis.totalTokens.toLocaleString()} tokens, ${analysis.categories.length} categories`);

      // Step 2: Select optimal compression strategy
      const strategy = this.selectCompressionStrategy(analysis, defaultOptions);
      logger.info(`🎯 Selected strategy: ${strategy.name}`);

      // Step 3: Apply compression strategy
      const compressedContent = await this.applyCompressionStrategy(
        documents,
        strategy,
        defaultOptions
      );

      // Step 4: Calculate compression metrics
      const originalTokens = analysis.totalTokens;
      const compressedTokens = this.estimateTokens(compressedContent);
      const compressionRatio = compressedTokens / originalTokens;
      const qualityScore = this.calculateQualityScore(compressedContent, documents);

      const result: CompressedContext = {
        originalTokens,
        compressedTokens,
        compressionRatio,
        qualityScore,
        content: compressedContent,
        metadata: {
          originalDocumentCount: documents.length,
          compressedDocumentCount: this.countCompressedDocuments(compressedContent),
          strategy: strategy.name,
          processingTime: Date.now() - startTime
        }
      };

      logger.info(`✅ Context compression completed:`);
      logger.info(`   Original tokens: ${originalTokens.toLocaleString()}`);
      logger.info(`   Compressed tokens: ${compressedTokens.toLocaleString()}`);
      logger.info(`   Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
      logger.info(`   Quality score: ${qualityScore.toFixed(1)}%`);
      logger.info(`   Processing time: ${result.metadata.processingTime}ms`);

      return result;

    } catch (error) {
      logger.error('❌ Error during context compression:', error);
      throw new Error(`Context compression failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyze document characteristics for compression strategy selection
   */
  private analyzeDocumentCharacteristics(documents: any[]): {
    totalTokens: number;
    categories: string[];
    averageTokens: number;
    maxTokens: number;
    minTokens: number;
    qualityScores: number[];
    priorities: string[];
  } {
    const totalTokens = documents.reduce((sum, doc) => sum + this.estimateTokens(doc.content), 0);
    const categories = [...new Set(documents.map(doc => doc.category))];
    const qualityScores = documents.map(doc => doc.qualityScore || 0);
    const priorities = documents.map(doc => doc.priority || 'low');
    const tokenCounts = documents.map(doc => this.estimateTokens(doc.content));
    
    return {
      totalTokens,
      categories,
      averageTokens: totalTokens / documents.length,
      maxTokens: Math.max(...tokenCounts),
      minTokens: Math.min(...tokenCounts),
      qualityScores,
      priorities
    };
  }

  /**
   * Select optimal compression strategy based on document characteristics
   */
  private selectCompressionStrategy(
    analysis: any,
    options: ContextCompressionOptions
  ): CompressionStrategy {
    
    const strategies: CompressionStrategy[] = [
      {
        name: 'hierarchical-summarization',
        description: 'Hierarchical summarization with critical content preservation',
        compressionRatio: 0.2,
        qualityPreservation: 90,
        processingTime: 15000,
        applicableFor: ['large-repositories', 'mixed-content']
      },
      {
        name: 'semantic-compression',
        description: 'Semantic compression using AI-powered content analysis',
        compressionRatio: 0.3,
        qualityPreservation: 85,
        processingTime: 20000,
        applicableFor: ['technical-documents', 'structured-content']
      },
      {
        name: 'keyword-extraction',
        description: 'Keyword extraction and key phrase preservation',
        compressionRatio: 0.1,
        qualityPreservation: 70,
        processingTime: 5000,
        applicableFor: ['reference-documents', 'glossary-content']
      },
      {
        name: 'template-based',
        description: 'Template-based compression with structured data extraction',
        compressionRatio: 0.4,
        qualityPreservation: 80,
        processingTime: 10000,
        applicableFor: ['standardized-documents', 'form-based-content']
      },
      {
        name: 'hybrid-compression',
        description: 'Hybrid approach combining multiple compression techniques',
        compressionRatio: 0.25,
        qualityPreservation: 88,
        processingTime: 25000,
        applicableFor: ['mixed-repositories', 'complex-content']
      }
    ];

    // Select strategy based on analysis
    if (analysis.totalTokens > 1000000) { // Very large context
      return strategies.find(s => s.name === 'hierarchical-summarization') || strategies[0];
    } else if (analysis.categories.length > 10) { // Many categories
      return strategies.find(s => s.name === 'hybrid-compression') || strategies[4];
    } else if (analysis.averageTokens > 5000) { // Large documents
      return strategies.find(s => s.name === 'semantic-compression') || strategies[1];
    } else if (analysis.qualityScores.every(score => score < 50)) { // Low quality documents
      return strategies.find(s => s.name === 'keyword-extraction') || strategies[2];
    } else {
      return strategies.find(s => s.name === 'template-based') || strategies[3];
    }
  }

  /**
   * Apply selected compression strategy
   */
  private async applyCompressionStrategy(
    documents: any[],
    strategy: CompressionStrategy,
    options: ContextCompressionOptions
  ): Promise<string> {
    
    switch (strategy.name) {
      case 'hierarchical-summarization':
        return this.applyHierarchicalSummarization(documents, options);
      
      case 'semantic-compression':
        return this.applySemanticCompression(documents, options);
      
      case 'keyword-extraction':
        return this.applyKeywordExtraction(documents, options);
      
      case 'template-based':
        return this.applyTemplateBasedCompression(documents, options);
      
      case 'hybrid-compression':
        return this.applyHybridCompression(documents, options);
      
      default:
        return this.applyHierarchicalSummarization(documents, options);
    }
  }

  /**
   * Apply hierarchical summarization compression
   */
  private async applyHierarchicalSummarization(
    documents: any[],
    options: ContextCompressionOptions
  ): Promise<string> {
    
    const compressedSections: string[] = [];
    
    // Group documents by category
    const categoryGroups = new Map<string, any[]>();
    for (const doc of documents) {
      const category = doc.category || 'uncategorized';
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(doc);
    }
    
    // Process each category
    for (const [category, docs] of categoryGroups) {
      const categorySummary = await this.createCategorySummary(category, docs, options);
      compressedSections.push(categorySummary);
    }
    
    // Create overall summary
    const overallSummary = await this.createOverallSummary(compressedSections, options);
    
    return overallSummary;
  }

  /**
   * Apply semantic compression using AI
   */
  private async applySemanticCompression(
    documents: any[],
    options: ContextCompressionOptions
  ): Promise<string> {
    
    try {
      // Create semantic compression prompt
      const compressionPrompt = this.createSemanticCompressionPrompt(documents, options);
      
      // Use AI to compress content
      const response = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert at compressing large document collections while preserving critical information and maintaining context.' },
        { role: 'user', content: compressionPrompt }
      ]);
      
      return this.aiProcessor.extractContent(response);
      
    } catch (error) {
      logger.warn('AI compression failed, falling back to hierarchical summarization:', error);
      return this.applyHierarchicalSummarization(documents, options);
    }
  }

  /**
   * Apply keyword extraction compression
   */
  private applyKeywordExtraction(
    documents: any[],
    options: ContextCompressionOptions
  ): string {
    
    const compressedSections: string[] = [];
    
    for (const doc of documents) {
      const keywords = this.extractKeywords(doc.content);
      const keyPhrases = this.extractKeyPhrases(doc.content);
      const summary = this.createKeywordSummary(doc, keywords, keyPhrases);
      
      compressedSections.push(summary);
    }
    
    return compressedSections.join('\n\n');
  }

  /**
   * Apply template-based compression
   */
  private applyTemplateBasedCompression(
    documents: any[],
    options: ContextCompressionOptions
  ): string {
    
    const compressedSections: string[] = [];
    
    for (const doc of documents) {
      const structuredData = this.extractStructuredData(doc);
      const template = this.createTemplateSummary(doc, structuredData);
      
      compressedSections.push(template);
    }
    
    return compressedSections.join('\n\n');
  }

  /**
   * Apply hybrid compression combining multiple techniques
   */
  private async applyHybridCompression(
    documents: any[],
    options: ContextCompressionOptions
  ): Promise<string> {
    
    // Step 1: Categorize documents by type
    const criticalDocs = documents.filter(doc => doc.priority === 'critical');
    const highDocs = documents.filter(doc => doc.priority === 'high');
    const mediumDocs = documents.filter(doc => doc.priority === 'medium');
    const lowDocs = documents.filter(doc => doc.priority === 'low');
    
    const compressedSections: string[] = [];
    
    // Step 2: Apply different compression strategies based on priority
    if (criticalDocs.length > 0) {
      const criticalSummary = await this.applyHierarchicalSummarization(criticalDocs, options);
      compressedSections.push(`# Critical Documents\n\n${criticalSummary}`);
    }
    
    if (highDocs.length > 0) {
      const highSummary = await this.applySemanticCompression(highDocs, options);
      compressedSections.push(`# High Priority Documents\n\n${highSummary}`);
    }
    
    if (mediumDocs.length > 0) {
      const mediumSummary = this.applyTemplateBasedCompression(mediumDocs, options);
      compressedSections.push(`# Medium Priority Documents\n\n${mediumSummary}`);
    }
    
    if (lowDocs.length > 0) {
      const lowSummary = this.applyKeywordExtraction(lowDocs, options);
      compressedSections.push(`# Low Priority Documents\n\n${lowSummary}`);
    }
    
    return compressedSections.join('\n\n');
  }

  /**
   * Private helper methods
   */
  private async createCategorySummary(
    category: string,
    documents: any[],
    options: ContextCompressionOptions
  ): Promise<string> {
    
    const categoryContent = documents.map(doc => `# ${doc.name}\n\n${doc.content}`).join('\n\n');
    
    if (options.enableAISummarization) {
      try {
        const summaryPrompt = `Summarize the following ${category} documents, preserving all critical information and key details:

${categoryContent}

Create a comprehensive summary that maintains the essential information while reducing length by approximately ${((1 - options.targetCompressionRatio) * 100).toFixed(0)}%.`;

        const response = await this.aiProcessor.makeAICall([
          { role: 'system', content: 'You are an expert at creating comprehensive document summaries while preserving critical information.' },
          { role: 'user', content: summaryPrompt }
        ]);
        
        return `# ${category} Documents Summary\n\n${this.aiProcessor.extractContent(response)}`;
        
      } catch (error) {
        logger.warn(`AI summarization failed for category ${category}, using fallback:`, error);
      }
    }
    
    // Fallback to simple summarization
    return this.createSimpleCategorySummary(category, documents);
  }

  private createSimpleCategorySummary(category: string, documents: any[]): string {
    const summary = documents.map(doc => {
      const keyPoints = this.extractKeyPoints(doc.content);
      return `## ${doc.name}\n- ${keyPoints.join('\n- ')}`;
    }).join('\n\n');
    
    return `# ${category} Documents Summary\n\n${summary}`;
  }

  private async createOverallSummary(
    sections: string[],
    options: ContextCompressionOptions
  ): Promise<string> {
    
    const combinedContent = sections.join('\n\n');
    
    if (options.enableAISummarization) {
      try {
        const overallPrompt = `Create a comprehensive executive summary of the following document sections:

${combinedContent}

Provide a high-level overview that captures the essential information from all sections.`;

        const response = await this.aiProcessor.makeAICall([
          { role: 'system', content: 'You are an expert at creating executive summaries that capture the essence of complex document collections.' },
          { role: 'user', content: overallPrompt }
        ]);
        
        return `# Executive Summary\n\n${this.aiProcessor.extractContent(response)}\n\n# Detailed Sections\n\n${combinedContent}`;
        
      } catch (error) {
        logger.warn('AI overall summarization failed, using fallback:', error);
      }
    }
    
    return `# Project Document Repository Summary\n\n${combinedContent}`;
  }

  private createSemanticCompressionPrompt(
    documents: any[],
    options: ContextCompressionOptions
  ): string {
    
    const documentList = documents.map(doc => 
      `## ${doc.name} (${doc.type})\n${doc.content.substring(0, 1000)}...`
    ).join('\n\n');
    
    return `Compress the following document collection while preserving all critical information and maintaining context relationships:

${documentList}

Requirements:
- Reduce content by approximately ${((1 - options.targetCompressionRatio) * 100).toFixed(0)}%
- Preserve all critical information and key details
- Maintain document relationships and references
- Keep the structure and organization clear
- Ensure the compressed content is still comprehensive and useful

Create a compressed version that maintains the essential information while significantly reducing length.`;
  }

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount = new Map<string, number>();
    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  private extractKeyPhrases(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const phrases: string[] = [];
    
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      if (words.length >= 3 && words.length <= 8) {
        phrases.push(sentence.trim());
      }
    }
    
    return phrases.slice(0, 10);
  }

  private createKeywordSummary(
    doc: any,
    keywords: string[],
    keyPhrases: string[]
  ): string {
    
    return `# ${doc.name} (${doc.type})
**Keywords:** ${keywords.join(', ')}
**Key Phrases:** ${keyPhrases.join('; ')}
**Quality Score:** ${doc.qualityScore || 'N/A'}%
**Status:** ${doc.status}

## Summary
${this.extractKeyPoints(doc.content).join('\n')}`;
  }

  private extractKeyPoints(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyPoints: string[] = [];
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 20 && trimmed.length < 200) {
        keyPoints.push(trimmed);
      }
    }
    
    return keyPoints.slice(0, 5);
  }

  private extractStructuredData(doc: any): any {
    return {
      name: doc.name,
      type: doc.type,
      category: doc.category,
      status: doc.status,
      qualityScore: doc.qualityScore,
      lastModified: doc.lastModified,
      wordCount: doc.wordCount,
      keySections: this.extractKeySections(doc.content)
    };
  }

  private extractKeySections(content: string): string[] {
    const sections = content.split(/\n(?=##)/);
    return sections.slice(0, 5).map(section => section.trim());
  }

  private createTemplateSummary(doc: any, structuredData: any): string {
    return `# ${structuredData.name}
**Type:** ${structuredData.type} | **Category:** ${structuredData.category}
**Status:** ${structuredData.status} | **Quality:** ${structuredData.qualityScore || 'N/A'}%
**Last Modified:** ${structuredData.lastModified.toISOString()}

## Key Sections
${structuredData.keySections.map((section: string) => `- ${section.substring(0, 100)}...`).join('\n')}`;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private calculateQualityScore(compressedContent: string, originalDocuments: any[]): number {
    // Simple quality score based on content length and structure
    const hasHeaders = compressedContent.includes('#');
    const hasStructure = compressedContent.includes('**') || compressedContent.includes('-');
    const lengthScore = Math.min(100, (compressedContent.length / 1000) * 10);
    
    let qualityScore = 50; // Base score
    
    if (hasHeaders) qualityScore += 20;
    if (hasStructure) qualityScore += 15;
    qualityScore += lengthScore;
    
    return Math.min(100, qualityScore);
  }

  private countCompressedDocuments(compressedContent: string): number {
    const headerMatches = compressedContent.match(/# [^#]/g);
    return headerMatches ? headerMatches.length : 0;
  }
}

export default AdvancedContextCompressionService;
