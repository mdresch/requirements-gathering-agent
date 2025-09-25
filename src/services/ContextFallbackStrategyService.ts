/**
 * Context Fallback Strategy Service
 * Provides intelligent fallback strategies when context exceeds available window size
 */

import { logger } from '../utils/logger.js';
import { ContextWindowValidationService } from './ContextWindowValidationService.js';

export interface ContextFallbackOptions {
  maxRetries: number;
  enableChunking: boolean;
  enableSummarization: boolean;
  enablePrioritization: boolean;
  preserveCriticalContext: boolean;
}

export interface ContextFallbackResult {
  success: boolean;
  strategy: 'chunking' | 'summarization' | 'prioritization' | 'provider-switch' | 'none';
  processedContext: string;
  originalTokenCount: number;
  finalTokenCount: number;
  reductionPercentage: number;
  warnings?: string[];
  errors?: string[];
}

export class ContextFallbackStrategyService {
  private static instance: ContextFallbackStrategyService;
  private contextWindowValidator: ContextWindowValidationService;

  private constructor() {
    this.contextWindowValidator = ContextWindowValidationService.getInstance();
  }

  static getInstance(): ContextFallbackStrategyService {
    if (!ContextFallbackStrategyService.instance) {
      ContextFallbackStrategyService.instance = new ContextFallbackStrategyService();
    }
    return ContextFallbackStrategyService.instance;
  }

  /**
   * Apply fallback strategy when context exceeds available window
   */
  async applyFallbackStrategy(
    context: string,
    documentType: string,
    targetTokenLimit: number,
    options: Partial<ContextFallbackOptions> = {}
  ): Promise<ContextFallbackResult> {
    const defaultOptions: ContextFallbackOptions = {
      maxRetries: 3,
      enableChunking: true,
      enableSummarization: true,
      enablePrioritization: true,
      preserveCriticalContext: true,
      ...options
    };

    const originalTokenCount = this.estimateTokens(context);
    logger.info(`🔄 Applying fallback strategy: ${originalTokenCount} tokens → ${targetTokenLimit} tokens for ${documentType}`);

    // Strategy 1: Try provider switch to larger context window
    if (defaultOptions.enablePrioritization) {
      const providerSwitchResult = await this.tryProviderSwitch(documentType, originalTokenCount);
      if (providerSwitchResult.success) {
        return {
          success: true,
          strategy: 'provider-switch',
          processedContext: context,
          originalTokenCount,
          finalTokenCount: originalTokenCount,
          reductionPercentage: 0,
          warnings: ['Switched to provider with larger context window']
        };
      }
    }

    // Strategy 2: Context prioritization (preserve most important content)
    if (defaultOptions.enablePrioritization && originalTokenCount > targetTokenLimit) {
      const prioritizationResult = await this.applyContextPrioritization(
        context,
        documentType,
        targetTokenLimit,
        defaultOptions.preserveCriticalContext
      );
      
      if (prioritizationResult.success) {
        return prioritizationResult;
      }
    }

    // Strategy 3: Context summarization
    if (defaultOptions.enableSummarization && originalTokenCount > targetTokenLimit) {
      const summarizationResult = await this.applyContextSummarization(
        context,
        documentType,
        targetTokenLimit
      );
      
      if (summarizationResult.success) {
        return summarizationResult;
      }
    }

    // Strategy 4: Context chunking (split into multiple parts)
    if (defaultOptions.enableChunking && originalTokenCount > targetTokenLimit) {
      const chunkingResult = await this.applyContextChunking(
        context,
        documentType,
        targetTokenLimit
      );
      
      if (chunkingResult.success) {
        return chunkingResult;
      }
    }

    // If all strategies fail, return error
    return {
      success: false,
      strategy: 'none',
      processedContext: context,
      originalTokenCount,
      finalTokenCount: originalTokenCount,
      reductionPercentage: 0,
      errors: ['All fallback strategies failed to reduce context to target size']
    };
  }

  /**
   * Try switching to a provider with larger context window
   */
  private async tryProviderSwitch(documentType: string, tokenCount: number): Promise<{ success: boolean; provider?: string; model?: string }> {
    try {
      const optimalProvider = await this.contextWindowValidator.getOptimalProviderForLargeContext();
      
      if (optimalProvider && optimalProvider.contextWindow >= tokenCount) {
        logger.info(`✅ Found optimal provider: ${optimalProvider.provider}/${optimalProvider.model} (${optimalProvider.contextWindow} tokens)`);
        return {
          success: true,
          provider: optimalProvider.provider,
          model: optimalProvider.model
        };
      }
      
      return { success: false };
    } catch (error) {
      logger.error('Error trying provider switch:', error);
      return { success: false };
    }
  }

  /**
   * Apply context prioritization to preserve most important content
   */
  private async applyContextPrioritization(
    context: string,
    documentType: string,
    targetTokenLimit: number,
    preserveCritical: boolean
  ): Promise<ContextFallbackResult> {
    try {
      const originalTokenCount = this.estimateTokens(context);
      
      // Define priority patterns for different document types
      const priorityPatterns = this.getPriorityPatterns(documentType);
      
      // Extract high-priority content
      const highPriorityContent = this.extractHighPriorityContent(context, priorityPatterns);
      const highPriorityTokens = this.estimateTokens(highPriorityContent);
      
      // If high-priority content alone exceeds limit, apply summarization
      if (highPriorityTokens > targetTokenLimit) {
        const summarizedContent = await this.summarizeContent(highPriorityContent, targetTokenLimit);
        const finalTokenCount = this.estimateTokens(summarizedContent);
        
        return {
          success: true,
          strategy: 'prioritization',
          processedContext: summarizedContent,
          originalTokenCount,
          finalTokenCount,
          reductionPercentage: Math.round(((originalTokenCount - finalTokenCount) / originalTokenCount) * 100),
          warnings: ['Applied prioritization + summarization due to high-priority content size']
        };
      }
      
      // Add medium-priority content until limit is reached
      const mediumPriorityContent = this.extractMediumPriorityContent(context, priorityPatterns);
      const remainingTokens = targetTokenLimit - highPriorityTokens;
      const selectedMediumContent = this.selectContentByTokenLimit(mediumPriorityContent, remainingTokens);
      
      const finalContext = highPriorityContent + '\n\n' + selectedMediumContent;
      const finalTokenCount = this.estimateTokens(finalContext);
      
      return {
        success: true,
        strategy: 'prioritization',
        processedContext: finalContext,
        originalTokenCount,
        finalTokenCount,
        reductionPercentage: Math.round(((originalTokenCount - finalTokenCount) / originalTokenCount) * 100),
        warnings: [`Preserved high-priority content, reduced by ${Math.round(((originalTokenCount - finalTokenCount) / originalTokenCount) * 100)}%`]
      };
      
    } catch (error) {
      logger.error('Error applying context prioritization:', error);
      return {
        success: false,
        strategy: 'prioritization',
        processedContext: context,
        originalTokenCount: this.estimateTokens(context),
        finalTokenCount: this.estimateTokens(context),
        reductionPercentage: 0,
        errors: ['Context prioritization failed']
      };
    }
  }

  /**
   * Apply context summarization to reduce token count
   */
  private async applyContextSummarization(
    context: string,
    documentType: string,
    targetTokenLimit: number
  ): Promise<ContextFallbackResult> {
    try {
      const originalTokenCount = this.estimateTokens(context);
      
      // Create a summary that fits within the token limit
      const summarizedContent = await this.summarizeContent(context, targetTokenLimit);
      const finalTokenCount = this.estimateTokens(summarizedContent);
      
      return {
        success: true,
        strategy: 'summarization',
        processedContext: summarizedContent,
        originalTokenCount,
        finalTokenCount,
        reductionPercentage: Math.round(((originalTokenCount - finalTokenCount) / originalTokenCount) * 100),
        warnings: [`Content summarized, reduced by ${Math.round(((originalTokenCount - finalTokenCount) / originalTokenCount) * 100)}%`]
      };
      
    } catch (error) {
      logger.error('Error applying context summarization:', error);
      return {
        success: false,
        strategy: 'summarization',
        processedContext: context,
        originalTokenCount: this.estimateTokens(context),
        finalTokenCount: this.estimateTokens(context),
        reductionPercentage: 0,
        errors: ['Context summarization failed']
      };
    }
  }

  /**
   * Apply context chunking to split content into manageable parts
   */
  private async applyContextChunking(
    context: string,
    documentType: string,
    targetTokenLimit: number
  ): Promise<ContextFallbackResult> {
    try {
      const originalTokenCount = this.estimateTokens(context);
      
      // Split context into logical chunks
      const chunks = this.splitIntoChunks(context, targetTokenLimit);
      
      // Select the most relevant chunks
      const selectedChunks = this.selectRelevantChunks(chunks, documentType, targetTokenLimit);
      
      const finalContext = selectedChunks.join('\n\n---\n\n');
      const finalTokenCount = this.estimateTokens(finalContext);
      
      return {
        success: true,
        strategy: 'chunking',
        processedContext: finalContext,
        originalTokenCount,
        finalTokenCount,
        reductionPercentage: Math.round(((originalTokenCount - finalTokenCount) / originalTokenCount) * 100),
        warnings: [`Content chunked, reduced by ${Math.round(((originalTokenCount - finalTokenCount) / originalTokenCount) * 100)}%`]
      };
      
    } catch (error) {
      logger.error('Error applying context chunking:', error);
      return {
        success: false,
        strategy: 'chunking',
        processedContext: context,
        originalTokenCount: this.estimateTokens(context),
        finalTokenCount: this.estimateTokens(context),
        reductionPercentage: 0,
        errors: ['Context chunking failed']
      };
    }
  }

  /**
   * Private helper methods
   */
  private getPriorityPatterns(documentType: string): Record<string, string[]> {
    const patterns: Record<string, Record<string, string[]>> = {
      'requirements-specification': {
        high: ['## Requirements', '### Functional Requirements', '### Non-Functional Requirements', '## Acceptance Criteria'],
        medium: ['## Overview', '## Scope', '## Assumptions', '## Constraints'],
        low: ['## References', '## Appendices', '## Glossary']
      },
      'technical-specification': {
        high: ['## Architecture', '## Technical Requirements', '## System Design', '## API Specifications'],
        medium: ['## Overview', '## Technology Stack', '## Performance Requirements'],
        low: ['## References', '## Appendices', '## Glossary']
      },
      'project-charter': {
        high: ['## Project Objectives', '## Success Criteria', '## Key Deliverables', '## Project Scope'],
        medium: ['## Project Overview', '## Stakeholders', '## Timeline'],
        low: ['## References', '## Appendices']
      },
      'default': {
        high: ['## Overview', '## Objectives', '## Requirements', '## Specifications'],
        medium: ['## Background', '## Scope', '## Timeline'],
        low: ['## References', '## Appendices', '## Glossary']
      }
    };
    
    return patterns[documentType] || patterns['default'];
  }

  private extractHighPriorityContent(context: string, patterns: Record<string, string[]>): string {
    const lines = context.split('\n');
    const highPriorityLines: string[] = [];
    let inHighPrioritySection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this line starts a high-priority section
      if (patterns.high.some(pattern => trimmedLine.includes(pattern))) {
        inHighPrioritySection = true;
        highPriorityLines.push(line);
        continue;
      }
      
      // Check if this line starts a medium or low priority section
      if (patterns.medium.some(pattern => trimmedLine.includes(pattern)) || 
          patterns.low.some(pattern => trimmedLine.includes(pattern))) {
        inHighPrioritySection = false;
        continue;
      }
      
      // If we're in a high-priority section, include this line
      if (inHighPrioritySection) {
        highPriorityLines.push(line);
      }
    }
    
    return highPriorityLines.join('\n');
  }

  private extractMediumPriorityContent(context: string, patterns: Record<string, string[]>): string {
    const lines = context.split('\n');
    const mediumPriorityLines: string[] = [];
    let inMediumPrioritySection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this line starts a medium-priority section
      if (patterns.medium.some(pattern => trimmedLine.includes(pattern))) {
        inMediumPrioritySection = true;
        mediumPriorityLines.push(line);
        continue;
      }
      
      // Check if this line starts a high or low priority section
      if (patterns.high.some(pattern => trimmedLine.includes(pattern)) || 
          patterns.low.some(pattern => trimmedLine.includes(pattern))) {
        inMediumPrioritySection = false;
        continue;
      }
      
      // If we're in a medium-priority section, include this line
      if (inMediumPrioritySection) {
        mediumPriorityLines.push(line);
      }
    }
    
    return mediumPriorityLines.join('\n');
  }

  private selectContentByTokenLimit(content: string, tokenLimit: number): string {
    const lines = content.split('\n');
    const selectedLines: string[] = [];
    let currentTokens = 0;
    
    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);
      if (currentTokens + lineTokens <= tokenLimit) {
        selectedLines.push(line);
        currentTokens += lineTokens;
      } else {
        break;
      }
    }
    
    return selectedLines.join('\n');
  }

  private async summarizeContent(content: string, targetTokenLimit: number): Promise<string> {
    // Simple summarization strategy - in production, this could use AI
    const lines = content.split('\n');
    const summaryLines: string[] = [];
    let currentTokens = 0;
    
    // Keep headers and important lines
    for (const line of lines) {
      const trimmedLine = line.trim();
      const lineTokens = this.estimateTokens(line);
      
      // Always keep headers (lines starting with #)
      if (trimmedLine.startsWith('#')) {
        if (currentTokens + lineTokens <= targetTokenLimit) {
          summaryLines.push(line);
          currentTokens += lineTokens;
        }
        continue;
      }
      
      // Keep important content (lines with key terms)
      const importantTerms = ['requirement', 'specification', 'objective', 'criteria', 'deliverable'];
      const isImportant = importantTerms.some(term => trimmedLine.toLowerCase().includes(term));
      
      if (isImportant && currentTokens + lineTokens <= targetTokenLimit) {
        summaryLines.push(line);
        currentTokens += lineTokens;
      }
    }
    
    return summaryLines.join('\n');
  }

  private splitIntoChunks(content: string, maxChunkSize: number): string[] {
    const sections = content.split(/\n(?=##)/); // Split by major sections
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

  private selectRelevantChunks(chunks: string[], documentType: string, targetTokenLimit: number): string[] {
    // Score chunks based on relevance to document type
    const scoredChunks = chunks.map(chunk => ({
      content: chunk,
      score: this.scoreChunkRelevance(chunk, documentType),
      tokens: this.estimateTokens(chunk)
    }));
    
    // Sort by relevance score (highest first)
    scoredChunks.sort((a, b) => b.score - a.score);
    
    // Select chunks until token limit is reached
    const selectedChunks: string[] = [];
    let totalTokens = 0;
    
    for (const chunk of scoredChunks) {
      if (totalTokens + chunk.tokens <= targetTokenLimit) {
        selectedChunks.push(chunk.content);
        totalTokens += chunk.tokens;
      }
    }
    
    return selectedChunks;
  }

  private scoreChunkRelevance(chunk: string, documentType: string): number {
    let score = 0;
    const content = chunk.toLowerCase();
    
    // Document type specific scoring
    const typeKeywords: Record<string, string[]> = {
      'requirements-specification': ['requirement', 'functional', 'non-functional', 'acceptance', 'criteria'],
      'technical-specification': ['architecture', 'technical', 'system', 'api', 'design'],
      'project-charter': ['objective', 'scope', 'deliverable', 'stakeholder', 'timeline'],
      'default': ['overview', 'objective', 'requirement', 'specification']
    };
    
    const keywords = typeKeywords[documentType] || typeKeywords['default'];
    
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        score += 10;
      }
    }
    
    // Boost score for headers
    const headerMatches = chunk.match(/^#+\s+/gm);
    if (headerMatches) {
      score += headerMatches.length * 5;
    }
    
    return score;
  }

  private estimateTokens(text: string): number {
    // Simple token estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

export default ContextFallbackStrategyService;
