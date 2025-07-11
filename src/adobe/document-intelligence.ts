/**
 * Document Intelligence Service
 * Phase 1: AI-powered document analysis and optimization
 */

import {
  DocumentAnalysis,
  KeyPoint,
  VisualizationOpportunity,
  ComplexityAssessment,
  ComplexityFactor,
  IDocumentIntelligence
} from './types.js';
import { Logger } from '../utils/logger.js';

/**
 * Document Intelligence implementation using AI analysis
 * Provides insights for better document structure and content optimization
 */
export class DocumentIntelligence implements IDocumentIntelligence {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('DocumentIntelligence');
  }

  /**
   * Analyze document structure and provide optimization recommendations
   */
  async analyzeDocumentStructure(markdownContent: string): Promise<DocumentAnalysis> {
    const operationId = this.generateOperationId();
    
    this.logger.info('Starting document structure analysis', {
      operationId,
      contentLength: markdownContent.length
    });

    try {
      const analysis = await this.performStructuralAnalysis(markdownContent, operationId);
      
      this.logger.info('Document analysis completed', {
        operationId,
        complexity: analysis.complexity,
        keyPointsCount: analysis.keyPoints.length,
        visualizationOpportunities: analysis.visualizationOpportunities.length
      });

      return analysis;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Document analysis failed', {
        operationId,
        error: errorMessage
      });

      throw new Error(`Document analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Extract key points from document content
   */
  async extractKeyPoints(content: string): Promise<KeyPoint[]> {
    this.logger.debug('Extracting key points', { contentLength: content.length });

    const keyPoints: KeyPoint[] = [];
    const lines = content.split('\n');
    let position = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Extract headings as key points
      if (trimmedLine.startsWith('#')) {
        const level = this.getHeadingLevel(trimmedLine);
        const text = trimmedLine.replace(/^#+\s*/, '');
        
        keyPoints.push({
          text,
          importance: this.calculateImportanceByLevel(level),
          category: 'heading',
          position
        });
      }

      // Extract bullet points
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const text = trimmedLine.replace(/^[-*]\s*/, '');
        if (text.length > 10) { // Filter out short items
          keyPoints.push({
            text,
            importance: 0.6,
            category: 'bullet_point',
            position
          });
        }
      }

      // Extract sentences with emphasis (bold, italic)
      if (trimmedLine.includes('**') || trimmedLine.includes('*')) {
        const emphasisMatch = trimmedLine.match(/\*\*([^*]+)\*\*|\*([^*]+)\*/);
        if (emphasisMatch) {
          const text = emphasisMatch[1] || emphasisMatch[2];
          keyPoints.push({
            text,
            importance: 0.7,
            category: 'emphasis',
            position
          });
        }
      }

      position++;
    }

    // Sort by importance and return top points
    return keyPoints
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 20); // Limit to top 20 key points
  }

  /**
   * Suggest visualization opportunities from content
   */
  async suggestVisualizations(content: string): Promise<VisualizationOpportunity[]> {
    this.logger.debug('Analyzing visualization opportunities', { contentLength: content.length });

    const opportunities: VisualizationOpportunity[] = [];

    // Look for tables
    const tableMatches = content.match(/\|.*\|/g);
    if (tableMatches && tableMatches.length > 2) {
      opportunities.push({
        type: 'table',
        data: this.extractTableData(content),
        confidence: 0.9,
        description: 'Structured data detected that would benefit from table formatting'
      });
    }

    // Look for numbered lists (potential process flows)
    const numberedListPattern = /^\s*\d+\.\s+/gm;
    const numberedMatches = content.match(numberedListPattern);
    if (numberedMatches && numberedMatches.length >= 3) {
      opportunities.push({
        type: 'diagram',
        data: this.extractProcessSteps(content),
        confidence: 0.7,
        description: 'Sequential steps detected that could be visualized as a process flow diagram'
      });
    }

    // Look for comparative data
    const comparisonKeywords = ['vs', 'versus', 'compared to', 'before', 'after'];
    const hasComparisons = comparisonKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    if (hasComparisons) {
      opportunities.push({
        type: 'chart',
        data: { type: 'comparison' },
        confidence: 0.6,
        description: 'Comparative data found that could be visualized as charts'
      });
    }

    // Look for statistics and numbers
    const numberPattern = /\b\d+%|\b\d+\.\d+%|\$\d+|\b\d+k|\b\d+M/g;
    const numberMatches = content.match(numberPattern);
    if (numberMatches && numberMatches.length >= 5) {
      opportunities.push({
        type: 'infographic',
        data: { statistics: numberMatches },
        confidence: 0.8,
        description: 'Multiple statistics found that could be presented as an infographic'
      });
    }

    return opportunities.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Assess document complexity
   */
  async assessComplexity(content: string): Promise<ComplexityAssessment> {
    this.logger.debug('Assessing document complexity', { contentLength: content.length });

    const factors: ComplexityFactor[] = [];
    let totalScore = 0;

    // Factor 1: Document length
    const wordCount = content.split(/\s+/).length;
    const lengthScore = Math.min(wordCount / 1000, 1); // Normalize to 0-1
    factors.push({
      name: 'Document Length',
      value: lengthScore,
      weight: 0.2,
      description: `Document contains ${wordCount} words`
    });
    totalScore += lengthScore * 0.2;

    // Factor 2: Structural complexity
    const headingCount = (content.match(/^#+\s/gm) || []).length;
    const structureScore = Math.min(headingCount / 20, 1);
    factors.push({
      name: 'Structural Complexity',
      value: structureScore,
      weight: 0.3,
      description: `Document has ${headingCount} headings and sections`
    });
    totalScore += structureScore * 0.3;

    // Factor 3: Technical content
    const technicalTerms = ['API', 'SDK', 'framework', 'architecture', 'implementation', 'configuration'];
    const technicalMatches = technicalTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    ).length;
    const technicalScore = Math.min(technicalMatches / technicalTerms.length, 1);
    factors.push({
      name: 'Technical Content',
      value: technicalScore,
      weight: 0.25,
      description: `Contains ${technicalMatches} technical concepts`
    });
    totalScore += technicalScore * 0.25;

    // Factor 4: Data complexity
    const tableCount = (content.match(/\|.*\|/g) || []).length;
    const codeBlockCount = (content.match(/```/g) || []).length / 2;
    const dataScore = Math.min((tableCount + codeBlockCount) / 10, 1);
    factors.push({
      name: 'Data Complexity',
      value: dataScore,
      weight: 0.25,
      description: `Contains ${tableCount} tables and ${codeBlockCount} code blocks`
    });
    totalScore += dataScore * 0.25;

    // Generate recommendations based on complexity
    const recommendations = this.generateComplexityRecommendations(totalScore, factors);

    return {
      score: totalScore,
      factors,
      recommendations
    };
  }

  // Private helper methods

  private async performStructuralAnalysis(
    content: string, 
    operationId: string
  ): Promise<DocumentAnalysis> {
    // Extract key points
    const keyPoints = await this.extractKeyPoints(content);
    
    // Suggest visualizations
    const visualizationOpportunities = await this.suggestVisualizations(content);
    
    // Assess complexity
    const complexity = await this.assessComplexity(content);
    
    // Calculate readability score (simplified implementation)
    const readabilityScore = this.calculateReadabilityScore(content);
    
    // Calculate structure score
    const structureScore = this.calculateStructureScore(content);
    
    // Suggest layouts based on content analysis
    const suggestedLayouts = this.suggestLayouts(complexity, visualizationOpportunities);
    
    // Generate compliance flags
    const complianceFlags = this.generateComplianceFlags(content);

    return {
      complexity: this.mapComplexityScore(complexity.score),
      suggestedLayouts,
      keyPoints,
      visualizationOpportunities,
      complianceFlags,
      readabilityScore,
      structureScore
    };
  }

  private getHeadingLevel(line: string): number {
    const match = line.match(/^#+/);
    return match ? match[0].length : 0;
  }

  private calculateImportanceByLevel(level: number): number {
    // Higher importance for higher-level headings
    switch (level) {
      case 1: return 1.0;
      case 2: return 0.8;
      case 3: return 0.6;
      case 4: return 0.4;
      default: return 0.2;
    }
  }

  private extractTableData(content: string): any {
    const tableLines = content.split('\n').filter(line => line.includes('|'));
    return {
      rows: tableLines.length,
      hasHeaders: tableLines.length > 1 && tableLines[1].includes('---')
    };
  }

  private extractProcessSteps(content: string): any {
    const steps = content.match(/^\s*\d+\.\s+(.+)$/gm) || [];
    return {
      stepCount: steps.length,
      steps: steps.slice(0, 10) // Limit for brevity
    };
  }

  private generateComplexityRecommendations(
    score: number, 
    factors: ComplexityFactor[]
  ): string[] {
    const recommendations: string[] = [];

    if (score > 0.8) {
      recommendations.push('Consider breaking this document into multiple smaller documents');
      recommendations.push('Use executive summary for high-level overview');
      recommendations.push('Implement progressive disclosure with collapsible sections');
    } else if (score > 0.6) {
      recommendations.push('Add table of contents for better navigation');
      recommendations.push('Use more visual elements to break up dense text');
      recommendations.push('Consider adding section summaries');
    } else {
      recommendations.push('Document complexity is appropriate for target audience');
      recommendations.push('Consider adding more detailed explanations if needed');
    }

    // Factor-specific recommendations
    const highFactors = factors.filter(f => f.value > 0.7);
    for (const factor of highFactors) {
      switch (factor.name) {
        case 'Technical Content':
          recommendations.push('Include glossary for technical terms');
          break;
        case 'Data Complexity':
          recommendations.push('Use interactive charts and collapsible tables');
          break;
        case 'Structural Complexity':
          recommendations.push('Implement hierarchical navigation');
          break;
      }
    }

    return recommendations;
  }

  private calculateReadabilityScore(content: string): number {
    // Simplified readability calculation
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Lower score for longer sentences (harder to read)
    return Math.max(0, Math.min(1, (25 - avgWordsPerSentence) / 25));
  }

  private calculateStructureScore(content: string): number {
    const lines = content.split('\n');
    const headings = lines.filter(line => line.trim().startsWith('#')).length;
    const paragraphs = lines.filter(line => line.trim().length > 50).length;
    
    // Good structure has balanced headings to content ratio
    const ratio = headings / Math.max(paragraphs, 1);
    return Math.min(1, ratio * 5); // Optimal ratio around 0.2
  }

  private suggestLayouts(
    complexity: ComplexityAssessment, 
    visualizations: VisualizationOpportunity[]
  ): string[] {
    const layouts: string[] = [];

    if (complexity.score > 0.8) {
      layouts.push('executive-summary', 'technical-detailed', 'appendix-heavy');
    } else if (complexity.score > 0.6) {
      layouts.push('technical-standard', 'business-proposal');
    } else {
      layouts.push('simple-report', 'presentation-friendly');
    }

    if (visualizations.length > 3) {
      layouts.push('visual-heavy', 'infographic-style');
    }

    return layouts;
  }

  private generateComplianceFlags(content: string): any[] {
    const flags: any[] = [];

    // Check for accessibility issues
    if (content.includes('![') && !content.includes('alt=')) {
      flags.push({
        type: 'accessibility',
        description: 'Images missing alt text',
        severity: 'warning',
        autoFixable: true
      });
    }

    // Check for broken links
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = Array.from(content.matchAll(linkPattern));
    for (const link of links) {
      if (link[2].startsWith('http') && !this.isValidUrl(link[2])) {
        flags.push({
          type: 'broken_link',
          description: `Potentially broken link: ${link[2]}`,
          severity: 'warning',
          autoFixable: false
        });
      }
    }

    return flags;
  }

  private mapComplexityScore(score: number): 'low' | 'medium' | 'high' {
    if (score < 0.4) return 'low';
    if (score < 0.7) return 'medium';
    return 'high';
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private generateOperationId(): string {
    return `intelligence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
