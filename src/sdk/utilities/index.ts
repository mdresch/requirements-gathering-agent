/**
 * SDK Utilities
 * 
 * Collection of utility functions and helpers for the Requirements Gathering Agent SDK.
 * Provides common functionality for document processing, validation, and integration.
 */

import { ProjectContext, DocumentGenerationOptions, ValidationResult } from '../types/index.js';

/**
 * Document Processing Utilities
 */
export class DocumentUtils {
  /**
   * Extract metadata from document content
   */
  static extractMetadata(content: string): any {
    const metadata: any = {};
    
    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }
    
    // Extract author from content
    const authorMatch = content.match(/(?:author|by):\s*(.+)$/mi);
    if (authorMatch) {
      metadata.author = authorMatch[1].trim();
    }
    
    // Extract date
    const dateMatch = content.match(/(?:date|created):\s*(.+)$/mi);
    if (dateMatch) {
      metadata.date = new Date(dateMatch[1].trim());
    }
    
    // Extract tags
    const tagsMatch = content.match(/(?:tags|keywords):\s*(.+)$/mi);
    if (tagsMatch) {
      metadata.tags = tagsMatch[1].split(',').map(tag => tag.trim());
    }
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = this.countWords(content);
    metadata.readingTime = Math.ceil(wordCount / 200);
    metadata.wordCount = wordCount;
    
    return metadata;
  }

  /**
   * Count words in text
   */
  static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count pages (assuming 250 words per page)
   */
  static countPages(text: string): number {
    const wordCount = this.countWords(text);
    return Math.ceil(wordCount / 250);
  }

  /**
   * Extract headings from document
   */
  static extractHeadings(content: string): Array<{ level: number; text: string; line: number }> {
    const headings: Array<{ level: number; text: string; line: number }> = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#+)\s+(.+)$/);
      if (headingMatch) {
        headings.push({
          level: headingMatch[1].length,
          text: headingMatch[2].trim(),
          line: index + 1
        });
      }
    });
    
    return headings;
  }

  /**
   * Generate table of contents
   */
  static generateTableOfContents(content: string): string {
    const headings = this.extractHeadings(content);
    
    if (headings.length === 0) {
      return '';
    }
    
    let toc = '## Table of Contents\n\n';
    
    headings.forEach(heading => {
      const indent = '  '.repeat(heading.level - 1);
      const anchor = heading.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      toc += `${indent}- [${heading.text}](#${anchor})\n`;
    });
    
    return toc + '\n';
  }

  /**
   * Sanitize filename
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9.-]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Convert markdown to plain text
   */
  static markdownToPlainText(markdown: string): string {
    return markdown
      .replace(/^#+\s+/gm, '') // Remove headings
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images, keep alt text
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .replace(/^\s*>\s+/gm, '') // Remove blockquotes
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();
  }

  /**
   * Estimate reading difficulty (Flesch Reading Ease)
   */
  static calculateReadingDifficulty(text: string): { score: number; level: string } {
    const plainText = this.markdownToPlainText(text);
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = plainText.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) {
      return { score: 0, level: 'Unknown' };
    }
    
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    let level: string;
    if (score >= 90) level = 'Very Easy';
    else if (score >= 80) level = 'Easy';
    else if (score >= 70) level = 'Fairly Easy';
    else if (score >= 60) level = 'Standard';
    else if (score >= 50) level = 'Fairly Difficult';
    else if (score >= 30) level = 'Difficult';
    else level = 'Very Difficult';
    
    return { score: Math.round(score), level };
  }

  /**
   * Count syllables in a word (approximation)
   */
  private static countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }
}

/**
 * Project Context Utilities
 */
export class ProjectUtils {
  /**
   * Validate project context completeness
   */
  static validateContextCompleteness(context: ProjectContext): { score: number; missing: string[] } {
    const required = ['projectName', 'businessProblem', 'technologyStack'];
    const optional = ['stakeholders', 'constraints', 'successCriteria', 'budget', 'timeline'];
    
    const missing: string[] = [];
    let score = 0;
    
    // Check required fields
    required.forEach(field => {
      if (context[field as keyof ProjectContext]) {
        score += 25; // 25 points per required field
      } else {
        missing.push(field);
      }
    });
    
    // Check optional fields
    optional.forEach(field => {
      if (context[field as keyof ProjectContext]) {
        score += 5; // 5 points per optional field
      } else {
        missing.push(field);
      }
    });
    
    return { score: Math.min(score, 100), missing };
  }

  /**
   * Generate project summary
   */
  static generateProjectSummary(context: ProjectContext): string {
    let summary = `# ${context.projectName}\n\n`;
    
    summary += `**Business Problem:** ${context.businessProblem}\n\n`;
    
    if (context.technologyStack && context.technologyStack.length > 0) {
      summary += `**Technology Stack:** ${context.technologyStack.join(', ')}\n\n`;
    }
    
    if (context.stakeholders && context.stakeholders.length > 0) {
      summary += `**Key Stakeholders:** ${context.stakeholders.length} identified\n\n`;
    }
    
    if (context.budget) {
      summary += `**Budget:** ${context.budget.currency || '$'}${context.budget.totalBudget?.toLocaleString()}\n\n`;
    }
    
    if (context.timeline) {
      const duration = context.timeline.endDate && context.timeline.startDate
        ? Math.ceil((new Date(context.timeline.endDate).getTime() - new Date(context.timeline.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      if (duration) {
        summary += `**Timeline:** ${duration} days\n\n`;
      }
    }
    
    if (context.successCriteria && context.successCriteria.length > 0) {
      summary += `**Success Criteria:**\n`;
      context.successCriteria.forEach(criteria => {
        summary += `- ${criteria}\n`;
      });
      summary += '\n';
    }
    
    return summary;
  }

  /**
   * Extract keywords from project context
   */
  static extractKeywords(context: ProjectContext): string[] {
    const keywords = new Set<string>();
    
    // Extract from business problem
    const businessWords = this.extractWordsFromText(context.businessProblem);
    businessWords.forEach(word => keywords.add(word));
    
    // Add technology stack
    context.technologyStack.forEach(tech => keywords.add(tech.toLowerCase()));
    
    // Extract from stakeholder roles
    if (context.stakeholders) {
      context.stakeholders.forEach(stakeholder => {
        if (stakeholder.role) {
          keywords.add(stakeholder.role.toLowerCase());
        }
        if (stakeholder.department) {
          keywords.add(stakeholder.department.toLowerCase());
        }
      });
    }
    
    // Extract from constraints
    if (context.constraints) {
      context.constraints.forEach(constraint => {
        keywords.add(constraint.type.toLowerCase());
      });
    }
    
    return Array.from(keywords).filter(keyword => keyword.length > 2);
  }

  /**
   * Calculate project complexity score
   */
  static calculateComplexityScore(context: ProjectContext): { score: number; factors: any } {
    const factors = {
      technologyComplexity: this.assessTechnologyComplexity(context.technologyStack),
      stakeholderCount: context.stakeholders ? Math.min(context.stakeholders.length * 0.5, 5) : 0,
      constraintCount: context.constraints ? Math.min(context.constraints.length * 0.3, 3) : 0,
      scopeComplexity: this.assessScopeComplexity(context.businessProblem),
      timelineComplexity: this.assessTimelineComplexity(context.timeline)
    };
    
    const weights = {
      technologyComplexity: 0.3,
      stakeholderCount: 0.2,
      constraintCount: 0.15,
      scopeComplexity: 0.25,
      timelineComplexity: 0.1
    };
    
    const score = Object.entries(factors).reduce((total, [key, value]) => {
      return total + (value * weights[key as keyof typeof weights]);
    }, 0);
    
    return { score: Math.min(score, 10), factors };
  }

  private static extractWordsFromText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
  }

  private static isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use'];
    return stopWords.includes(word);
  }

  private static assessTechnologyComplexity(technologies: string[]): number {
    const complexityMap: Record<string, number> = {
      'html': 1, 'css': 1, 'javascript': 2,
      'react': 3, 'vue': 3, 'angular': 4,
      'node.js': 2, 'express': 2, 'nestjs': 4,
      'python': 2, 'django': 3, 'flask': 2,
      'java': 3, 'spring': 4, 'kotlin': 3,
      'c#': 3, '.net': 4, 'asp.net': 4,
      'postgresql': 3, 'mysql': 2, 'mongodb': 3,
      'redis': 3, 'elasticsearch': 4,
      'docker': 3, 'kubernetes': 5, 'aws': 4,
      'azure': 4, 'gcp': 4, 'terraform': 4,
      'microservices': 5, 'graphql': 4, 'rest': 2
    };
    
    if (technologies.length === 0) return 1;
    
    const totalComplexity = technologies.reduce((sum, tech) => {
      return sum + (complexityMap[tech.toLowerCase()] || 2);
    }, 0);
    
    return Math.min(totalComplexity / technologies.length, 5);
  }

  private static assessScopeComplexity(businessProblem: string): number {
    const complexityKeywords = [
      'integrate', 'migration', 'transform', 'modernize',
      'scale', 'optimize', 'automate', 'digitize',
      'enterprise', 'multi-tenant', 'real-time',
      'machine learning', 'ai', 'blockchain'
    ];
    
    const foundKeywords = complexityKeywords.filter(keyword =>
      businessProblem.toLowerCase().includes(keyword)
    );
    
    return Math.min(1 + foundKeywords.length * 0.5, 5);
  }

  private static assessTimelineComplexity(timeline: any): number {
    if (!timeline || !timeline.startDate || !timeline.endDate) {
      return 2; // Default complexity for undefined timeline
    }
    
    const duration = new Date(timeline.endDate).getTime() - new Date(timeline.startDate).getTime();
    const days = duration / (1000 * 60 * 60 * 24);
    
    if (days < 30) return 4; // Very tight timeline
    if (days < 90) return 3; // Tight timeline
    if (days < 180) return 2; // Normal timeline
    return 1; // Relaxed timeline
  }
}

/**
 * Validation Utilities
 */
export class ValidationUtils {
  /**
   * Aggregate validation results
   */
  static aggregateValidationResults(results: ValidationResult[]): {
    overallScore: number;
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    worstDocument: string | null;
    bestDocument: string | null;
  } {
    if (results.length === 0) {
      return {
        overallScore: 0,
        totalIssues: 0,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
        worstDocument: null,
        bestDocument: null
      };
    }
    
    const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
    const overallScore = totalScore / results.length;
    
    const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
    const errorCount = results.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === 'error').length, 0);
    const warningCount = results.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === 'warning').length, 0);
    const infoCount = results.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === 'info').length, 0);
    
    const sortedByScore = [...results].sort((a, b) => (b.score || 0) - (a.score || 0));
    const bestDocument = sortedByScore[0]?.documentPath || null;
    const worstDocument = sortedByScore[sortedByScore.length - 1]?.documentPath || null;
    
    return {
      overallScore,
      totalIssues,
      errorCount,
      warningCount,
      infoCount,
      worstDocument,
      bestDocument
    };
  }

  /**
   * Generate validation report
   */
  static generateValidationReport(results: ValidationResult[]): string {
    const aggregated = this.aggregateValidationResults(results);
    
    let report = '# Validation Report\n\n';
    
    report += `## Summary\n\n`;
    report += `- **Overall Score:** ${aggregated.overallScore.toFixed(1)}/100\n`;
    report += `- **Documents Validated:** ${results.length}\n`;
    report += `- **Total Issues:** ${aggregated.totalIssues}\n`;
    report += `- **Errors:** ${aggregated.errorCount}\n`;
    report += `- **Warnings:** ${aggregated.warningCount}\n`;
    report += `- **Info:** ${aggregated.infoCount}\n\n`;
    
    if (aggregated.bestDocument) {
      report += `- **Best Document:** ${aggregated.bestDocument}\n`;
    }
    
    if (aggregated.worstDocument) {
      report += `- **Needs Improvement:** ${aggregated.worstDocument}\n`;
    }
    
    report += '\n## Document Details\n\n';
    
    results.forEach(result => {
      report += `### ${result.documentPath}\n\n`;
      report += `- **Score:** ${result.score || 0}/100\n`;
      report += `- **Valid:** ${result.isValid ? 'Yes' : 'No'}\n`;
      report += `- **Issues:** ${result.issues.length}\n\n`;
      
      if (result.issues.length > 0) {
        const errors = result.issues.filter(i => i.severity === 'error');
        const warnings = result.issues.filter(i => i.severity === 'warning');
        
        if (errors.length > 0) {
          report += '**Errors:**\n';
          errors.forEach(error => {
            report += `- ${error.message}\n`;
          });
          report += '\n';
        }
        
        if (warnings.length > 0) {
          report += '**Warnings:**\n';
          warnings.forEach(warning => {
            report += `- ${warning.message}\n`;
          });
          report += '\n';
        }
      }
    });
    
    return report;
  }
}

/**
 * Format Utilities
 */
export class FormatUtils {
  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Format duration
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format date
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }
}

/**
 * Export all utilities
 */
export { DocumentUtils, ProjectUtils, ValidationUtils, FormatUtils };