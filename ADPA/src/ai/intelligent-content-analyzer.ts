/*
 * AI-Powered Intelligent Content Analyzer
 * Smart content analysis, template selection, and diagram generation
 */

import { DocumentTemplate } from '../templates/brand-guidelines';
import { DiagramData } from '../adobe/creative-suite-integration';

/**
 * AI Content Analysis Results
 */
export interface ContentAnalysis {
  documentType: DocumentTypeAnalysis;
  contentStructure: ContentStructureAnalysis;
  diagramOpportunities: DiagramOpportunity[];
  templateRecommendations: TemplateRecommendation[];
  contentOptimizations: ContentOptimization[];
  brandCompliance: BrandComplianceAnalysis;
  readabilityScore: ReadabilityAnalysis;
}

export interface DocumentTypeAnalysis {
  primaryType: 'project-charter' | 'technical-specification' | 'business-requirements' | 'user-manual' | 'proposal' | 'report';
  confidence: number;
  indicators: string[];
  suggestedTemplate: string;
  reasoning: string;
}

export interface ContentStructureAnalysis {
  sections: AnalyzedSection[];
  missingElements: string[];
  structureQuality: number;
  improvementSuggestions: string[];
}

export interface AnalyzedSection {
  title: string;
  type: 'header' | 'content' | 'list' | 'table' | 'code' | 'diagram';
  quality: number;
  wordCount: number;
  complexity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface DiagramOpportunity {
  location: string;
  type: 'flowchart' | 'orgchart' | 'timeline' | 'process' | 'architecture' | 'network';
  confidence: number;
  description: string;
  suggestedContent: string;
  reasoning: string;
}

export interface TemplateRecommendation {
  templateName: string;
  confidence: number;
  reasoning: string;
  benefits: string[];
  customizations: string[];
}

export interface ContentOptimization {
  type: 'structure' | 'clarity' | 'completeness' | 'formatting' | 'branding';
  priority: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  impact: string;
}

export interface BrandComplianceAnalysis {
  score: number;
  issues: BrandIssue[];
  recommendations: string[];
}

export interface BrandIssue {
  type: 'color' | 'typography' | 'spacing' | 'terminology' | 'structure';
  severity: 'high' | 'medium' | 'low';
  description: string;
  fix: string;
}

export interface ReadabilityAnalysis {
  score: number;
  grade: string;
  metrics: {
    averageSentenceLength: number;
    averageWordsPerSentence: number;
    complexWords: number;
    passiveVoice: number;
  };
  suggestions: string[];
}

/**
 * AI-Powered Content Analyzer
 */
export class IntelligentContentAnalyzer {
  private documentTypePatterns: Map<string, RegExp[]>;
  private diagramKeywords: Map<string, string[]>;
  private brandTerminology: string[];

  constructor() {
    this.initializePatterns();
  }

  /**
   * Perform comprehensive AI analysis of document content
   */
  async analyzeContent(markdownContent: string): Promise<ContentAnalysis> {
    const analysis: ContentAnalysis = {
      documentType: await this.analyzeDocumentType(markdownContent),
      contentStructure: this.analyzeContentStructure(markdownContent),
      diagramOpportunities: this.identifyDiagramOpportunities(markdownContent),
      templateRecommendations: await this.recommendTemplates(markdownContent),
      contentOptimizations: this.suggestOptimizations(markdownContent),
      brandCompliance: this.analyzeBrandCompliance(markdownContent),
      readabilityScore: this.analyzeReadability(markdownContent)
    };

    return analysis;
  }

  /**
   * AI-powered document type detection
   */
  private async analyzeDocumentType(content: string): Promise<DocumentTypeAnalysis> {
    const contentLower = content.toLowerCase();
    const scores = new Map<string, number>();
    const indicators = new Map<string, string[]>();

    // Project Charter indicators
    const charterKeywords = ['project charter', 'project objectives', 'project scope', 'stakeholders', 'milestones', 'deliverables'];
    const charterScore = this.calculateKeywordScore(contentLower, charterKeywords);
    scores.set('project-charter', charterScore);
    indicators.set('project-charter', charterKeywords.filter(k => contentLower.includes(k)));

    // Technical Specification indicators
    const techKeywords = ['technical specification', 'system architecture', 'api', 'database', 'requirements', 'implementation'];
    const techScore = this.calculateKeywordScore(contentLower, techKeywords);
    scores.set('technical-specification', techScore);
    indicators.set('technical-specification', techKeywords.filter(k => contentLower.includes(k)));

    // Business Requirements indicators
    const bizKeywords = ['business requirements', 'functional requirements', 'business rules', 'use cases', 'acceptance criteria'];
    const bizScore = this.calculateKeywordScore(contentLower, bizKeywords);
    scores.set('business-requirements', bizScore);
    indicators.set('business-requirements', bizKeywords.filter(k => contentLower.includes(k)));

    // User Manual indicators
    const manualKeywords = ['user manual', 'how to', 'instructions', 'step by step', 'tutorial', 'guide'];
    const manualScore = this.calculateKeywordScore(contentLower, manualKeywords);
    scores.set('user-manual', manualScore);
    indicators.set('user-manual', manualKeywords.filter(k => contentLower.includes(k)));

    // Proposal indicators
    const proposalKeywords = ['proposal', 'solution', 'recommendation', 'benefits', 'cost', 'timeline'];
    const proposalScore = this.calculateKeywordScore(contentLower, proposalKeywords);
    scores.set('proposal', proposalScore);
    indicators.set('proposal', proposalKeywords.filter(k => contentLower.includes(k)));

    // Report indicators
    const reportKeywords = ['report', 'analysis', 'findings', 'results', 'conclusion', 'summary'];
    const reportScore = this.calculateKeywordScore(contentLower, reportKeywords);
    scores.set('report', reportScore);
    indicators.set('report', reportKeywords.filter(k => contentLower.includes(k)));

    // Find highest scoring type
    const sortedScores = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
    const [primaryType, confidence] = sortedScores[0];

    return {
      primaryType: primaryType as any,
      confidence: Math.min(confidence * 100, 95), // Cap at 95% confidence
      indicators: indicators.get(primaryType) || [],
      suggestedTemplate: this.mapTypeToTemplate(primaryType),
      reasoning: this.generateTypeReasoning(primaryType, indicators.get(primaryType) || [])
    };
  }

  /**
   * Analyze content structure and quality
   */
  private analyzeContentStructure(content: string): ContentStructureAnalysis {
    const lines = content.split('\n');
    const sections: AnalyzedSection[] = [];
    let currentSection: AnalyzedSection | null = null;

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: headerMatch[2].trim(),
          type: 'header',
          quality: 0,
          wordCount: 0,
          complexity: 'low',
          suggestions: []
        };
      } else if (currentSection && line.trim()) {
        currentSection.wordCount += line.split(' ').length;
        currentSection.type = this.detectContentType(line);
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }

    // Analyze each section
    sections.forEach(section => {
      section.quality = this.calculateSectionQuality(section);
      section.complexity = this.determineSectionComplexity(section);
      section.suggestions = this.generateSectionSuggestions(section);
    });

    const structureQuality = this.calculateOverallStructureQuality(sections);
    const missingElements = this.identifyMissingElements(content, sections);
    const improvementSuggestions = this.generateStructureImprovements(sections, missingElements);

    return {
      sections,
      missingElements,
      structureQuality,
      improvementSuggestions
    };
  }

  /**
   * Identify opportunities for diagram generation
   */
  private identifyDiagramOpportunities(content: string): DiagramOpportunity[] {
    const opportunities: DiagramOpportunity[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      // Process flow opportunities
      if (this.containsProcessIndicators(line)) {
        opportunities.push({
          location: `Line ${i + 1}`,
          type: 'process',
          confidence: 0.8,
          description: 'Process flow detected',
          suggestedContent: this.generateProcessDiagram(lines, i),
          reasoning: 'Sequential steps or process language detected'
        });
      }

      // Organization chart opportunities
      if (this.containsOrgIndicators(line)) {
        opportunities.push({
          location: `Line ${i + 1}`,
          type: 'orgchart',
          confidence: 0.7,
          description: 'Organizational structure detected',
          suggestedContent: this.generateOrgChart(lines, i),
          reasoning: 'Hierarchical structure or team roles detected'
        });
      }

      // Timeline opportunities
      if (this.containsTimelineIndicators(line)) {
        opportunities.push({
          location: `Line ${i + 1}`,
          type: 'timeline',
          confidence: 0.75,
          description: 'Timeline or schedule detected',
          suggestedContent: this.generateTimeline(lines, i),
          reasoning: 'Temporal sequence or schedule detected'
        });
      }

      // Architecture opportunities
      if (this.containsArchitectureIndicators(line)) {
        opportunities.push({
          location: `Line ${i + 1}`,
          type: 'architecture',
          confidence: 0.85,
          description: 'System architecture detected',
          suggestedContent: this.generateArchitectureDiagram(lines, i),
          reasoning: 'System components or architecture language detected'
        });
      }
    }

    return opportunities;
  }

  /**
   * Recommend optimal templates based on content analysis
   */
  private async recommendTemplates(content: string): Promise<TemplateRecommendation[]> {
    const documentType = await this.analyzeDocumentType(content);
    const recommendations: TemplateRecommendation[] = [];

    // Primary recommendation based on document type
    recommendations.push({
      templateName: documentType.suggestedTemplate,
      confidence: documentType.confidence,
      reasoning: `Best match for ${documentType.primaryType} based on content analysis`,
      benefits: this.getTemplateBenefits(documentType.suggestedTemplate),
      customizations: this.suggestTemplateCustomizations(content, documentType.suggestedTemplate)
    });

    // Alternative recommendations
    const alternatives = this.getAlternativeTemplates(documentType.primaryType);
    alternatives.forEach(alt => {
      recommendations.push({
        templateName: alt.name,
        confidence: alt.confidence,
        reasoning: alt.reasoning,
        benefits: alt.benefits,
        customizations: alt.customizations
      });
    });

    return recommendations;
  }

  /**
   * Suggest content optimizations
   */
  private suggestOptimizations(content: string): ContentOptimization[] {
    const optimizations: ContentOptimization[] = [];

    // Structure optimizations
    if (!content.includes('# ')) {
      optimizations.push({
        type: 'structure',
        priority: 'high',
        description: 'Missing main title',
        suggestion: 'Add a main title (# Title) at the beginning of the document',
        impact: 'Improves document hierarchy and professional appearance'
      });
    }

    // Clarity optimizations
    const avgSentenceLength = this.calculateAverageSentenceLength(content);
    if (avgSentenceLength > 25) {
      optimizations.push({
        type: 'clarity',
        priority: 'medium',
        description: 'Long sentences detected',
        suggestion: 'Break down complex sentences for better readability',
        impact: 'Improves comprehension and professional communication'
      });
    }

    // Completeness optimizations
    if (!content.includes('## ')) {
      optimizations.push({
        type: 'completeness',
        priority: 'medium',
        description: 'Limited section structure',
        suggestion: 'Add section headers (## Section) to organize content',
        impact: 'Enhances document navigation and professional structure'
      });
    }

    return optimizations;
  }

  /**
   * Analyze brand compliance
   */
  private analyzeBrandCompliance(content: string): BrandComplianceAnalysis {
    const issues: BrandIssue[] = [];
    let score = 100;

    // Check for consistent terminology
    const inconsistentTerms = this.findInconsistentTerminology(content);
    inconsistentTerms.forEach(term => {
      issues.push({
        type: 'terminology',
        severity: 'medium',
        description: `Inconsistent terminology: ${term}`,
        fix: `Use consistent terminology throughout the document`
      });
      score -= 5;
    });

    // Check structure compliance
    if (!this.hasProperStructure(content)) {
      issues.push({
        type: 'structure',
        severity: 'high',
        description: 'Document lacks proper hierarchical structure',
        fix: 'Use proper heading hierarchy (H1 > H2 > H3)'
      });
      score -= 15;
    }

    return {
      score: Math.max(score, 0),
      issues,
      recommendations: this.generateBrandRecommendations(issues)
    };
  }

  /**
   * Analyze readability metrics
   */
  private analyzeReadability(content: string): ReadabilityAnalysis {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    const avgSentenceLength = words.length / sentences.length;
    const avgWordsPerSentence = avgSentenceLength;
    const complexWords = words.filter(w => w.length > 6).length;
    const passiveVoice = this.countPassiveVoice(content);

    // Simple readability score calculation
    const score = Math.max(0, 100 - (avgSentenceLength * 2) - (complexWords / words.length * 100));

    return {
      score,
      grade: this.calculateGradeLevel(score),
      metrics: {
        averageSentenceLength: avgSentenceLength,
        averageWordsPerSentence: avgWordsPerSentence,
        complexWords,
        passiveVoice
      },
      suggestions: this.generateReadabilitySuggestions(score, avgSentenceLength, complexWords)
    };
  }

  // Helper methods
  private initializePatterns(): void {
    this.documentTypePatterns = new Map();
    this.diagramKeywords = new Map();
    this.brandTerminology = ['ADPA', 'professional', 'corporate', 'business'];
  }

  private calculateKeywordScore(content: string, keywords: string[]): number {
    let score = 0;
    keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 1;
      }
    });
    return score / keywords.length;
  }

  private mapTypeToTemplate(type: string): string {
    const mapping = {
      'project-charter': 'project-charter',
      'technical-specification': 'technical-specification',
      'business-requirements': 'business-requirements',
      'user-manual': 'user-manual',
      'proposal': 'business-proposal',
      'report': 'business-report'
    };
    return mapping[type] || 'project-charter';
  }

  private generateTypeReasoning(type: string, indicators: string[]): string {
    return `Identified as ${type} based on keywords: ${indicators.join(', ')}`;
  }

  private detectContentType(line: string): AnalyzedSection['type'] {
    if (line.trim().startsWith('-') || line.trim().startsWith('*')) return 'list';
    if (line.trim().startsWith('|')) return 'table';
    if (line.trim().startsWith('```')) return 'code';
    return 'content';
  }

  private calculateSectionQuality(section: AnalyzedSection): number {
    let quality = 50; // Base quality
    
    if (section.wordCount > 20) quality += 20;
    if (section.wordCount > 50) quality += 20;
    if (section.title.length > 5) quality += 10;
    
    return Math.min(quality, 100);
  }

  private determineSectionComplexity(section: AnalyzedSection): 'low' | 'medium' | 'high' {
    if (section.wordCount < 30) return 'low';
    if (section.wordCount < 100) return 'medium';
    return 'high';
  }

  private generateSectionSuggestions(section: AnalyzedSection): string[] {
    const suggestions: string[] = [];
    
    if (section.wordCount < 20) {
      suggestions.push('Consider expanding this section with more detail');
    }
    
    if (section.title.length < 5) {
      suggestions.push('Use more descriptive section titles');
    }
    
    return suggestions;
  }

  private calculateOverallStructureQuality(sections: AnalyzedSection[]): number {
    if (sections.length === 0) return 0;
    
    const avgQuality = sections.reduce((sum, s) => sum + s.quality, 0) / sections.length;
    return avgQuality;
  }

  private identifyMissingElements(content: string, sections: AnalyzedSection[]): string[] {
    const missing: string[] = [];
    
    if (!content.includes('# ')) missing.push('Main title');
    if (sections.length < 3) missing.push('Sufficient section structure');
    if (!content.includes('## ')) missing.push('Section headers');
    
    return missing;
  }

  private generateStructureImprovements(sections: AnalyzedSection[], missing: string[]): string[] {
    const improvements: string[] = [];
    
    if (missing.includes('Main title')) {
      improvements.push('Add a clear main title using # syntax');
    }
    
    if (sections.length < 3) {
      improvements.push('Organize content into logical sections');
    }
    
    return improvements;
  }

  private containsProcessIndicators(line: string): boolean {
    const indicators = ['step', 'process', 'workflow', 'procedure', 'then', 'next', 'first', 'second'];
    return indicators.some(indicator => line.includes(indicator));
  }

  private containsOrgIndicators(line: string): boolean {
    const indicators = ['team', 'manager', 'lead', 'director', 'reports to', 'organization'];
    return indicators.some(indicator => line.includes(indicator));
  }

  private containsTimelineIndicators(line: string): boolean {
    const indicators = ['timeline', 'schedule', 'milestone', 'deadline', 'phase', 'quarter'];
    return indicators.some(indicator => line.includes(indicator));
  }

  private containsArchitectureIndicators(line: string): boolean {
    const indicators = ['architecture', 'system', 'component', 'service', 'api', 'database'];
    return indicators.some(indicator => line.includes(indicator));
  }

  private generateProcessDiagram(lines: string[], startIndex: number): string {
    return 'flowchart TD\n    A[Start] --> B[Process]\n    B --> C[End]';
  }

  private generateOrgChart(lines: string[], startIndex: number): string {
    return 'graph TD\n    A[Manager] --> B[Team Lead]\n    B --> C[Developer]';
  }

  private generateTimeline(lines: string[], startIndex: number): string {
    return 'gantt\n    title Project Timeline\n    Task 1 :a1, 2024-01-01, 30d';
  }

  private generateArchitectureDiagram(lines: string[], startIndex: number): string {
    return 'graph LR\n    A[Frontend] --> B[API]\n    B --> C[Database]';
  }

  private getTemplateBenefits(templateName: string): string[] {
    return ['Professional formatting', 'Consistent branding', 'Optimized layout'];
  }

  private suggestTemplateCustomizations(content: string, templateName: string): string[] {
    return ['Adjust color scheme', 'Customize section order', 'Add company logo'];
  }

  private getAlternativeTemplates(primaryType: string): any[] {
    return [
      {
        name: 'generic-professional',
        confidence: 0.6,
        reasoning: 'Fallback professional template',
        benefits: ['Clean design', 'Flexible structure'],
        customizations: ['Basic customization']
      }
    ];
  }

  private calculateAverageSentenceLength(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    return sentences.length > 0 ? words.length / sentences.length : 0;
  }

  private findInconsistentTerminology(content: string): string[] {
    // Simplified implementation
    return [];
  }

  private hasProperStructure(content: string): boolean {
    return content.includes('# ') && content.includes('## ');
  }

  private generateBrandRecommendations(issues: BrandIssue[]): string[] {
    return issues.map(issue => issue.fix);
  }

  private countPassiveVoice(content: string): number {
    const passiveIndicators = ['was', 'were', 'been', 'being'];
    return passiveIndicators.reduce((count, indicator) => {
      return count + (content.toLowerCase().split(indicator).length - 1);
    }, 0);
  }

  private calculateGradeLevel(score: number): string {
    if (score >= 90) return 'College Graduate';
    if (score >= 80) return 'College';
    if (score >= 70) return 'High School';
    if (score >= 60) return 'Middle School';
    return 'Elementary';
  }

  private generateReadabilitySuggestions(score: number, avgSentenceLength: number, complexWords: number): string[] {
    const suggestions: string[] = [];
    
    if (avgSentenceLength > 20) {
      suggestions.push('Break down long sentences for better readability');
    }
    
    if (complexWords > 10) {
      suggestions.push('Consider using simpler vocabulary where appropriate');
    }
    
    if (score < 70) {
      suggestions.push('Overall readability could be improved');
    }
    
    return suggestions;
  }
}

/**
 * Create intelligent content analyzer instance
 */
export function createIntelligentAnalyzer(): IntelligentContentAnalyzer {
  return new IntelligentContentAnalyzer();
}
