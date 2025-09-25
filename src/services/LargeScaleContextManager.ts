/**
 * Large-Scale Context Manager
 * Handles 100+ document repositories with intelligent context selection,
 * clustering, and hierarchical loading strategies.
 */

import { logger } from '../utils/logger.js';
import { ContextWindowValidationService } from './ContextWindowValidationService.js';
import { ContextFallbackStrategyService } from './ContextFallbackStrategyService.js';

export interface DocumentCluster {
  id: string;
  name: string;
  documents: DocumentContext[];
  totalTokens: number;
  relevanceScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  lastModified: Date;
}

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
  keywords: string[];
  dependencies: string[];
  references: string[];
}

export interface ContextLoadingStrategy {
  name: string;
  description: string;
  maxDocuments: number;
  maxTokens: number;
  clusteringEnabled: boolean;
  summarizationEnabled: boolean;
  hierarchicalLoading: boolean;
  smartFiltering: boolean;
}

export interface LargeScaleContextResult {
  success: boolean;
  strategy: string;
  clustersLoaded: number;
  totalClusters: number;
  documentsLoaded: number;
  totalDocuments: number;
  totalTokensUsed: number;
  contextWindowUtilization: number;
  loadingTime: number;
  clusters: DocumentCluster[];
  warnings?: string[];
  errors?: string[];
}

export class LargeScaleContextManager {
  private static instance: LargeScaleContextManager;
  private contextWindowValidator: ContextWindowValidationService;
  private fallbackService: ContextFallbackStrategyService;
  private documentCache: Map<string, DocumentContext[]> = new Map();
  private clusterCache: Map<string, DocumentCluster[]> = new Map();

  private constructor() {
    this.contextWindowValidator = ContextWindowValidationService.getInstance();
    this.fallbackService = ContextFallbackStrategyService.getInstance();
  }

  static getInstance(): LargeScaleContextManager {
    if (!LargeScaleContextManager.instance) {
      LargeScaleContextManager.instance = new LargeScaleContextManager();
    }
    return LargeScaleContextManager.instance;
  }

  /**
   * Main method for loading large-scale document repositories
   */
  async loadLargeScaleContext(
    projectId: string,
    targetDocumentType: string,
    options: {
      maxDocuments?: number;
      maxTokens?: number;
      clusteringStrategy?: 'category' | 'relevance' | 'temporal' | 'hierarchical';
      enableSmartFiltering?: boolean;
      enableSummarization?: boolean;
      enableHierarchicalLoading?: boolean;
      preserveCriticalDocuments?: boolean;
    } = {}
  ): Promise<LargeScaleContextResult> {
    const startTime = Date.now();
    
    const defaultOptions = {
      maxDocuments: 50,
      maxTokens: 1000000, // 1M tokens default
      clusteringStrategy: 'hierarchical' as const,
      enableSmartFiltering: true,
      enableSummarization: true,
      enableHierarchicalLoading: true,
      preserveCriticalDocuments: true,
      ...options
    };

    logger.info(`🚀 Starting large-scale context loading for project ${projectId}`);
    logger.info(`📋 Target document: ${targetDocumentType}`);
    logger.info(`📊 Max documents: ${defaultOptions.maxDocuments}`);
    logger.info(`🧠 Max tokens: ${defaultOptions.maxTokens.toLocaleString()}`);

    try {
      // Step 1: Load all project documents
      const allDocuments = await this.loadAllProjectDocuments(projectId);
      logger.info(`📚 Loaded ${allDocuments.length} total documents from repository`);

      if (allDocuments.length === 0) {
        return {
          success: true,
          strategy: 'empty',
          clustersLoaded: 0,
          totalClusters: 0,
          documentsLoaded: 0,
          totalDocuments: 0,
          totalTokensUsed: 0,
          contextWindowUtilization: 0,
          loadingTime: Date.now() - startTime,
          clusters: []
        };
      }

      // Step 2: Determine optimal strategy based on document count and context window
      const strategy = this.determineOptimalStrategy(
        allDocuments.length,
        defaultOptions.maxTokens,
        defaultOptions.clusteringStrategy
      );

      logger.info(`🎯 Selected strategy: ${strategy.name}`);

      // Step 3: Apply smart filtering if enabled
      let filteredDocuments = allDocuments;
      if (defaultOptions.enableSmartFiltering) {
        filteredDocuments = this.applySmartFiltering(allDocuments, targetDocumentType);
        logger.info(`🔍 Smart filtering: ${filteredDocuments.length}/${allDocuments.length} documents selected`);
      }

      // Step 4: Create document clusters
      const clusters = await this.createDocumentClusters(
        filteredDocuments,
        defaultOptions.clusteringStrategy,
        defaultOptions.maxTokens
      );

      logger.info(`📦 Created ${clusters.length} document clusters`);

      // Step 5: Load context using selected strategy
      const result = await this.executeContextLoadingStrategy(
        clusters,
        strategy,
        defaultOptions,
        targetDocumentType
      );

      result.loadingTime = Date.now() - startTime;

      logger.info(`✅ Large-scale context loading completed:`);
      logger.info(`   Strategy: ${result.strategy}`);
      logger.info(`   Clusters loaded: ${result.clustersLoaded}/${result.totalClusters}`);
      logger.info(`   Documents loaded: ${result.documentsLoaded}/${result.totalDocuments}`);
      logger.info(`   Tokens used: ${result.totalTokensUsed.toLocaleString()}`);
      logger.info(`   Utilization: ${result.contextWindowUtilization.toFixed(1)}%`);
      logger.info(`   Loading time: ${result.loadingTime}ms`);

      return result;

    } catch (error) {
      logger.error('❌ Error during large-scale context loading:', error);
      return {
        success: false,
        strategy: 'error',
        clustersLoaded: 0,
        totalClusters: 0,
        documentsLoaded: 0,
        totalDocuments: 0,
        totalTokensUsed: 0,
        contextWindowUtilization: 0,
        loadingTime: Date.now() - startTime,
        clusters: [],
        errors: [`Large-scale context loading failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Load all project documents with enhanced metadata
   */
  private async loadAllProjectDocuments(projectId: string): Promise<DocumentContext[]> {
    try {
      // Check cache first
      if (this.documentCache.has(projectId)) {
        return this.documentCache.get(projectId)!;
      }

      // Import ProjectDocument model
      const { ProjectDocument } = await import('../models/ProjectDocument.js');
      
      // Find all existing documents for this project
      const existingDocuments = await ProjectDocument.find({
        projectId: projectId,
        deletedAt: null,
        status: { $in: ['draft', 'review', 'approved', 'published'] }
      }).sort({ 
        status: 1,
        qualityScore: -1,
        lastModified: -1
      }).exec();

      // Convert to DocumentContext format with enhanced metadata
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
          priority: this.determineDocumentPriority(doc),
          keywords: this.extractKeywords(doc.content),
          dependencies: this.extractDependencies(doc.content),
          references: this.extractReferences(doc.content)
        };
      });

      // Cache the results
      this.documentCache.set(projectId, documentContexts);
      
      return documentContexts;

    } catch (error) {
      logger.error('Error loading project documents:', error);
      return [];
    }
  }

  /**
   * Determine optimal strategy based on document count and context window
   */
  private determineOptimalStrategy(
    documentCount: number,
    maxTokens: number,
    clusteringStrategy: string
  ): ContextLoadingStrategy {
    
    if (documentCount <= 10) {
      return {
        name: 'full-load',
        description: 'Load all documents completely',
        maxDocuments: documentCount,
        maxTokens: maxTokens,
        clusteringEnabled: false,
        summarizationEnabled: false,
        hierarchicalLoading: false,
        smartFiltering: false
      };
    } else if (documentCount <= 50) {
      return {
        name: 'clustered-load',
        description: 'Load documents in clusters with prioritization',
        maxDocuments: Math.min(documentCount, 30),
        maxTokens: maxTokens,
        clusteringEnabled: true,
        summarizationEnabled: false,
        hierarchicalLoading: false,
        smartFiltering: true
      };
    } else if (documentCount <= 100) {
      return {
        name: 'hierarchical-load',
        description: 'Load documents hierarchically with summarization',
        maxDocuments: Math.min(documentCount, 40),
        maxTokens: maxTokens,
        clusteringEnabled: true,
        summarizationEnabled: true,
        hierarchicalLoading: true,
        smartFiltering: true
      };
    } else {
      return {
        name: 'intelligent-load',
        description: 'Intelligent loading with advanced filtering and summarization',
        maxDocuments: Math.min(documentCount, 50),
        maxTokens: maxTokens,
        clusteringEnabled: true,
        summarizationEnabled: true,
        hierarchicalLoading: true,
        smartFiltering: true
      };
    }
  }

  /**
   * Apply smart filtering to select most relevant documents
   */
  private applySmartFiltering(
    documents: DocumentContext[],
    targetDocumentType: string
  ): DocumentContext[] {
    
    // Define document type relationships
    const documentRelationships: Record<string, string[]> = {
      'benefits-realization-plan': [
        'strategic-business-case',
        'project-charter',
        'requirements-specification',
        'stakeholder-register',
        'risk-register'
      ],
      'technical-specification': [
        'requirements-specification',
        'architecture-document',
        'project-charter',
        'risk-register'
      ],
      'project-charter': [
        'strategic-business-case',
        'stakeholder-register',
        'requirements-specification'
      ],
      'risk-register': [
        'project-charter',
        'requirements-specification',
        'stakeholder-register'
      ]
    };

    const relatedTypes = documentRelationships[targetDocumentType] || [];
    
    // Score documents based on relevance
    const scoredDocuments = documents.map(doc => {
      let relevanceScore = doc.relevanceScore;
      
      // Boost score for related document types
      if (relatedTypes.includes(doc.type)) {
        relevanceScore += 50;
      }
      
      // Boost score for critical priority documents
      if (doc.priority === 'critical') {
        relevanceScore += 30;
      }
      
      // Boost score for high quality documents
      if (doc.qualityScore && doc.qualityScore > 80) {
        relevanceScore += 20;
      }
      
      // Boost score for recent documents
      const daysSinceModified = (Date.now() - doc.lastModified.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceModified < 30) {
        relevanceScore += 10;
      }
      
      return { ...doc, relevanceScore };
    });

    // Sort by relevance score and return top documents
    return scoredDocuments
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 50); // Limit to top 50 most relevant documents
  }

  /**
   * Create document clusters based on specified strategy
   */
  private async createDocumentClusters(
    documents: DocumentContext[],
    strategy: string,
    maxTokens: number
  ): Promise<DocumentCluster[]> {
    
    switch (strategy) {
      case 'category':
        return this.createCategoryClusters(documents, maxTokens);
      case 'relevance':
        return this.createRelevanceClusters(documents, maxTokens);
      case 'temporal':
        return this.createTemporalClusters(documents, maxTokens);
      case 'hierarchical':
        return this.createHierarchicalClusters(documents, maxTokens);
      default:
        return this.createHierarchicalClusters(documents, maxTokens);
    }
  }

  /**
   * Create clusters based on document categories
   */
  private createCategoryClusters(
    documents: DocumentContext[],
    maxTokens: number
  ): DocumentCluster[] {
    
    const categoryGroups = new Map<string, DocumentContext[]>();
    
    // Group documents by category
    for (const doc of documents) {
      const category = doc.category || 'uncategorized';
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(doc);
    }
    
    // Create clusters from category groups
    const clusters: DocumentCluster[] = [];
    for (const [category, docs] of categoryGroups) {
      const totalTokens = docs.reduce((sum, doc) => sum + doc.estimatedTokens, 0);
      const relevanceScore = docs.reduce((sum, doc) => sum + doc.relevanceScore, 0) / docs.length;
      const priority = this.determineClusterPriority(docs);
      
      clusters.push({
        id: `category-${category}`,
        name: `${category} Documents`,
        documents: docs,
        totalTokens,
        relevanceScore,
        priority,
        category,
        lastModified: new Date(Math.max(...docs.map(d => d.lastModified.getTime())))
      });
    }
    
    return clusters.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Create clusters based on document relevance
   */
  private createRelevanceClusters(
    documents: DocumentContext[],
    maxTokens: number
  ): DocumentCluster[] {
    
    const clusters: DocumentCluster[] = [];
    const clusterSize = 10; // Documents per cluster
    
    // Sort documents by relevance
    const sortedDocs = documents.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Create clusters
    for (let i = 0; i < sortedDocs.length; i += clusterSize) {
      const clusterDocs = sortedDocs.slice(i, i + clusterSize);
      const totalTokens = clusterDocs.reduce((sum, doc) => sum + doc.estimatedTokens, 0);
      const relevanceScore = clusterDocs.reduce((sum, doc) => sum + doc.relevanceScore, 0) / clusterDocs.length;
      const priority = this.determineClusterPriority(clusterDocs);
      
      clusters.push({
        id: `relevance-${Math.floor(i / clusterSize)}`,
        name: `Relevance Cluster ${Math.floor(i / clusterSize) + 1}`,
        documents: clusterDocs,
        totalTokens,
        relevanceScore,
        priority,
        category: 'relevance',
        lastModified: new Date(Math.max(...clusterDocs.map(d => d.lastModified.getTime())))
      });
    }
    
    return clusters;
  }

  /**
   * Create clusters based on document temporal relationships
   */
  private createTemporalClusters(
    documents: DocumentContext[],
    maxTokens: number
  ): DocumentCluster[] {
    
    const clusters: DocumentCluster[] = [];
    const now = Date.now();
    const timeRanges = [
      { name: 'Recent', days: 30, priority: 'high' as const },
      { name: 'Recent Past', days: 90, priority: 'medium' as const },
      { name: 'Historical', days: 365, priority: 'low' as const },
      { name: 'Archive', days: Infinity, priority: 'low' as const }
    ];
    
    for (const range of timeRanges) {
      const rangeDocs = documents.filter(doc => {
        const daysSinceModified = (now - doc.lastModified.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceModified <= range.days;
      });
      
      if (rangeDocs.length > 0) {
        const totalTokens = rangeDocs.reduce((sum, doc) => sum + doc.estimatedTokens, 0);
        const relevanceScore = rangeDocs.reduce((sum, doc) => sum + doc.relevanceScore, 0) / rangeDocs.length;
        
        clusters.push({
          id: `temporal-${range.name.toLowerCase().replace(' ', '-')}`,
          name: `${range.name} Documents`,
          documents: rangeDocs,
          totalTokens,
          relevanceScore,
          priority: range.priority,
          category: 'temporal',
          lastModified: new Date(Math.max(...rangeDocs.map(d => d.lastModified.getTime())))
        });
      }
    }
    
    return clusters.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Create hierarchical clusters based on document importance and relationships
   */
  private createHierarchicalClusters(
    documents: DocumentContext[],
    maxTokens: number
  ): DocumentCluster[] {
    
    const clusters: DocumentCluster[] = [];
    
    // Critical documents cluster
    const criticalDocs = documents.filter(doc => doc.priority === 'critical');
    if (criticalDocs.length > 0) {
      clusters.push({
        id: 'hierarchical-critical',
        name: 'Critical Documents',
        documents: criticalDocs,
        totalTokens: criticalDocs.reduce((sum, doc) => sum + doc.estimatedTokens, 0),
        relevanceScore: 100,
        priority: 'critical',
        category: 'hierarchical',
        lastModified: new Date(Math.max(...criticalDocs.map(d => d.lastModified.getTime())))
      });
    }
    
    // High priority documents cluster
    const highDocs = documents.filter(doc => doc.priority === 'high');
    if (highDocs.length > 0) {
      clusters.push({
        id: 'hierarchical-high',
        name: 'High Priority Documents',
        documents: highDocs,
        totalTokens: highDocs.reduce((sum, doc) => sum + doc.estimatedTokens, 0),
        relevanceScore: 80,
        priority: 'high',
        category: 'hierarchical',
        lastModified: new Date(Math.max(...highDocs.map(d => d.lastModified.getTime())))
      });
    }
    
    // Medium priority documents cluster
    const mediumDocs = documents.filter(doc => doc.priority === 'medium');
    if (mediumDocs.length > 0) {
      clusters.push({
        id: 'hierarchical-medium',
        name: 'Medium Priority Documents',
        documents: mediumDocs,
        totalTokens: mediumDocs.reduce((sum, doc) => sum + doc.estimatedTokens, 0),
        relevanceScore: 60,
        priority: 'medium',
        category: 'hierarchical',
        lastModified: new Date(Math.max(...mediumDocs.map(d => d.lastModified.getTime())))
      });
    }
    
    // Low priority documents cluster
    const lowDocs = documents.filter(doc => doc.priority === 'low');
    if (lowDocs.length > 0) {
      clusters.push({
        id: 'hierarchical-low',
        name: 'Low Priority Documents',
        documents: lowDocs,
        totalTokens: lowDocs.reduce((sum, doc) => sum + doc.estimatedTokens, 0),
        relevanceScore: 40,
        priority: 'low',
        category: 'hierarchical',
        lastModified: new Date(Math.max(...lowDocs.map(d => d.lastModified.getTime())))
      });
    }
    
    return clusters.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Execute context loading strategy
   */
  private async executeContextLoadingStrategy(
    clusters: DocumentCluster[],
    strategy: ContextLoadingStrategy,
    options: any,
    targetDocumentType: string
  ): Promise<LargeScaleContextResult> {
    
    let clustersLoaded = 0;
    let documentsLoaded = 0;
    let totalTokensUsed = 0;
    const loadedClusters: DocumentCluster[] = [];
    
    // Import ContextManager
    const { ContextManager } = await import('../modules/contextManager.js');
    const contextManager = ContextManager.getInstance();
    
    // Load clusters based on strategy
    for (const cluster of clusters) {
      if (clustersLoaded >= strategy.maxDocuments / 10) break; // Limit clusters
      if (totalTokensUsed + cluster.totalTokens > options.maxTokens) break;
      
      // Load cluster documents
      for (const doc of cluster.documents) {
        if (documentsLoaded >= strategy.maxDocuments) break;
        if (totalTokensUsed + doc.estimatedTokens > options.maxTokens) break;
        
        const contextKey = `LARGE-SCALE-${cluster.id}-${doc.type}-${doc.id}`;
        contextManager.addEnrichedContext(contextKey, doc.content);
        
        totalTokensUsed += doc.estimatedTokens;
        documentsLoaded++;
        
        logger.info(`✅ Loaded document: ${doc.name} (${doc.type}) - ${doc.estimatedTokens.toLocaleString()} tokens`);
      }
      
      clustersLoaded++;
      loadedClusters.push(cluster);
      
      logger.info(`📦 Loaded cluster: ${cluster.name} (${cluster.documents.length} documents)`);
    }
    
    return {
      success: true,
      strategy: strategy.name,
      clustersLoaded,
      totalClusters: clusters.length,
      documentsLoaded,
      totalDocuments: clusters.reduce((sum, cluster) => sum + cluster.documents.length, 0),
      totalTokensUsed,
      contextWindowUtilization: (totalTokensUsed / options.maxTokens) * 100,
      loadingTime: 0, // Will be set by caller
      clusters: loadedClusters
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

  private determineClusterPriority(docs: DocumentContext[]): 'critical' | 'high' | 'medium' | 'low' {
    const priorities = docs.map(doc => doc.priority);
    if (priorities.includes('critical')) return 'critical';
    if (priorities.includes('high')) return 'high';
    if (priorities.includes('medium')) return 'medium';
    return 'low';
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction - in production, use NLP libraries
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
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractDependencies(content: string): string[] {
    // Extract document references and dependencies
    const dependencies: string[] = [];
    const refPatterns = [
      /see\s+(?:document|section|chapter)\s+([^,\n]+)/gi,
      /refer\s+to\s+([^,\n]+)/gi,
      /as\s+defined\s+in\s+([^,\n]+)/gi
    ];
    
    for (const pattern of refPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        dependencies.push(...matches.map(match => match.trim()));
      }
    }
    
    return dependencies;
  }

  private extractReferences(content: string): string[] {
    // Extract external references
    const references: string[] = [];
    const refPatterns = [
      /https?:\/\/[^\s]+/gi,
      /www\.[^\s]+/gi,
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/gi
    ];
    
    for (const pattern of refPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        references.push(...matches.map(match => match.trim()));
      }
    }
    
    return references;
  }
}

export default LargeScaleContextManager;
