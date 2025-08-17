/**
 * Validation Client
 * 
 * Specialized client for document and project validation.
 * Provides PMBOK compliance checking and quality assessment.
 */

import { EventEmitter } from 'events';
import { SDKConfiguration } from './configuration/SDKConfiguration.js';
import { 
  ValidationResult, 
  ValidationOptions, 
  ProjectContext,
  ValidationIssue,
  ValidationSummary
} from './types/index.js';
import { ValidationError } from './errors/index.js';

/**
 * Validation Client
 * 
 * Handles all validation operations including:
 * - PMBOK compliance validation
 * - Document quality assessment
 * - Project context validation
 * - Custom validation rules
 * - Batch validation processing
 */
export class ValidationClient extends EventEmitter {
  private config: SDKConfiguration;
  private initialized = false;
  private validationRules: Map<string, any> = new Map();

  constructor(config: SDKConfiguration) {
    super();
    this.config = config;
  }

  /**
   * Initialize the validation client
   */
  async initialize(): Promise<void> {
    try {
      await this.loadValidationRules();
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      throw new ValidationError(`Failed to initialize validation client: ${error.message}`);
    }
  }

  /**
   * Validate a document for PMBOK compliance and quality
   */
  async validateDocument(
    documentPath: string, 
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    this.ensureInitialized();
    
    try {
      const content = await this.readDocumentContent(documentPath);
      const issues: ValidationIssue[] = [];
      
      // PMBOK validation
      if (options.enablePMBOKValidation !== false) {
        const pmbokIssues = await this.validatePMBOKCompliance(content, documentPath);
        issues.push(...pmbokIssues);
      }
      
      // Grammar and language validation
      if (options.enableGrammarCheck) {
        const grammarIssues = await this.validateGrammar(content);
        issues.push(...grammarIssues);
      }
      
      // Compliance validation
      if (options.enableComplianceCheck) {
        const complianceIssues = await this.validateCompliance(content);
        issues.push(...complianceIssues);
      }
      
      // Custom validation rules
      if (options.customValidationRules) {
        const customIssues = await this.validateCustomRules(content, options.customValidationRules);
        issues.push(...customIssues);
      }
      
      // Structure validation
      const structureIssues = await this.validateDocumentStructure(content, documentPath);
      issues.push(...structureIssues);
      
      // Content quality validation
      const qualityIssues = await this.validateContentQuality(content);
      issues.push(...qualityIssues);
      
      const summary = this.generateValidationSummary(issues);
      const score = this.calculateValidationScore(issues, content);
      
      return {
        documentPath,
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        score,
        issues,
        summary
      };
    } catch (error) {
      throw new ValidationError(`Failed to validate document: ${error.message}`, documentPath);
    }
  }

  /**
   * Validate project context
   */
  async validateProjectContext(context: ProjectContext): Promise<ValidationResult> {
    this.ensureInitialized();
    
    try {
      const issues: ValidationIssue[] = [];
      
      // Required fields validation
      issues.push(...this.validateRequiredFields(context));
      
      // Business logic validation
      issues.push(...this.validateBusinessLogic(context));
      
      // Stakeholder validation
      if (context.stakeholders) {
        issues.push(...this.validateStakeholders(context.stakeholders));
      }
      
      // Constraint validation
      if (context.constraints) {
        issues.push(...this.validateConstraints(context.constraints));
      }
      
      // Timeline validation
      if (context.timeline) {
        issues.push(...this.validateTimeline(context.timeline));
      }
      
      // Budget validation
      if (context.budget) {
        issues.push(...this.validateBudget(context.budget));
      }
      
      const summary = this.generateValidationSummary(issues);
      const score = this.calculateContextValidationScore(issues, context);
      
      return {
        documentPath: 'project-context',
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        score,
        issues,
        summary
      };
    } catch (error) {
      throw new ValidationError(`Failed to validate project context: ${error.message}`);
    }
  }

  /**
   * Batch validate multiple documents
   */
  async validateDocuments(
    documentPaths: string[], 
    options: ValidationOptions = {}
  ): Promise<ValidationResult[]> {
    this.ensureInitialized();
    
    const results: ValidationResult[] = [];
    
    for (const documentPath of documentPaths) {
      try {
        const result = await this.validateDocument(documentPath, options);
        results.push(result);
        
        this.emit('document-validated', { documentPath, result });
      } catch (error) {
        const errorResult: ValidationResult = {
          documentPath,
          isValid: false,
          score: 0,
          issues: [{
            severity: 'error',
            message: `Validation failed: ${error.message}`,
            rule: 'validation-error'
          }],
          summary: {
            totalIssues: 1,
            errorCount: 1,
            warningCount: 0,
            infoCount: 0,
            complianceScore: 0
          }
        };
        
        results.push(errorResult);
        this.emit('document-validation-error', { documentPath, error });
      }
    }
    
    return results;
  }

  /**
   * Validate PMBOK compliance
   */
  async validatePMBOKCompliance(content: string, documentPath: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const documentType = this.detectDocumentType(documentPath);
    
    // Get PMBOK requirements for this document type
    const requirements = this.getPMBOKRequirements(documentType);
    
    for (const requirement of requirements) {
      const hasRequirement = this.checkRequirement(content, requirement);
      
      if (!hasRequirement) {
        issues.push({
          severity: requirement.mandatory ? 'error' : 'warning',
          message: `Missing PMBOK requirement: ${requirement.description}`,
          rule: `pmbok-${requirement.id}`,
          suggestion: requirement.suggestion
        });
      }
    }
    
    return issues;
  }

  /**
   * Validate document structure
   */
  async validateDocumentStructure(content: string, documentPath: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const documentType = this.detectDocumentType(documentPath);
    
    // Check for required sections
    const requiredSections = this.getRequiredSections(documentType);
    
    for (const section of requiredSections) {
      if (!this.hasSection(content, section)) {
        issues.push({
          severity: 'warning',
          message: `Missing recommended section: ${section}`,
          rule: 'structure-section-missing',
          suggestion: `Consider adding a section for ${section}`
        });
      }
    }
    
    // Check heading hierarchy
    const headingIssues = this.validateHeadingHierarchy(content);
    issues.push(...headingIssues);
    
    // Check for table of contents if document is long
    if (content.length > 5000 && !this.hasTableOfContents(content)) {
      issues.push({
        severity: 'info',
        message: 'Consider adding a table of contents for this long document',
        rule: 'structure-toc-recommended'
      });
    }
    
    return issues;
  }

  /**
   * Validate content quality
   */
  async validateContentQuality(content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    // Check for minimum content length
    if (content.trim().length < 100) {
      issues.push({
        severity: 'warning',
        message: 'Document content appears to be very short',
        rule: 'quality-content-length'
      });
    }
    
    // Check for placeholder text
    const placeholders = this.findPlaceholders(content);
    placeholders.forEach(placeholder => {
      issues.push({
        severity: 'error',
        message: `Placeholder text found: ${placeholder}`,
        rule: 'quality-placeholder-text',
        suggestion: 'Replace placeholder text with actual content'
      });
    });
    
    // Check for repeated content
    const repetitions = this.findRepeatedContent(content);
    repetitions.forEach(repetition => {
      issues.push({
        severity: 'warning',
        message: `Repeated content detected: "${repetition.text}"`,
        rule: 'quality-repeated-content',
        line: repetition.line
      });
    });
    
    // Check for broken links or references
    const brokenRefs = this.findBrokenReferences(content);
    brokenRefs.forEach(ref => {
      issues.push({
        severity: 'warning',
        message: `Potentially broken reference: ${ref}`,
        rule: 'quality-broken-reference'
      });
    });
    
    return issues;
  }

  /**
   * Validate grammar and language
   */
  async validateGrammar(content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    // Basic grammar checks
    const sentences = content.split(/[.!?]+/);
    
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length === 0) return;
      
      // Check for very long sentences
      if (trimmed.length > 200) {
        issues.push({
          severity: 'info',
          message: 'Consider breaking up this long sentence for better readability',
          rule: 'grammar-long-sentence',
          line: index + 1
        });
      }
      
      // Check for passive voice (simplified)
      if (this.hasPassiveVoice(trimmed)) {
        issues.push({
          severity: 'info',
          message: 'Consider using active voice for clearer communication',
          rule: 'grammar-passive-voice',
          line: index + 1
        });
      }
    });
    
    return issues;
  }

  /**
   * Validate compliance requirements
   */
  async validateCompliance(content: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    // Check for required compliance statements
    const complianceKeywords = ['gdpr', 'privacy', 'security', 'audit', 'compliance'];
    const hasComplianceContent = complianceKeywords.some(keyword =>
      content.toLowerCase().includes(keyword)
    );
    
    if (!hasComplianceContent) {
      issues.push({
        severity: 'info',
        message: 'Consider adding compliance and security considerations',
        rule: 'compliance-considerations'
      });
    }
    
    return issues;
  }

  /**
   * Validate custom rules
   */
  async validateCustomRules(content: string, rules: any[]): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    for (const rule of rules) {
      try {
        if (rule.pattern) {
          const regex = new RegExp(rule.pattern, 'gi');
          const matches = content.match(regex);
          
          if (matches) {
            matches.forEach(match => {
              issues.push({
                severity: rule.severity || 'warning',
                message: rule.description || `Pattern match: ${match}`,
                rule: rule.name || 'custom-rule'
              });
            });
          }
        } else if (rule.validator) {
          const customIssues = rule.validator(content);
          issues.push(...customIssues);
        }
      } catch (error) {
        issues.push({
          severity: 'error',
          message: `Custom validation rule error: ${error.message}`,
          rule: 'custom-rule-error'
        });
      }
    }
    
    return issues;
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<string> {
    return this.initialized ? 'healthy' : 'unhealthy';
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.validationRules.clear();
    this.initialized = false;
    this.emit('cleanup');
  }

  // === Private Methods ===

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new ValidationError('Validation client not initialized');
    }
  }

  private async loadValidationRules(): Promise<void> {
    // Load default PMBOK validation rules
    const defaultRules = this.getDefaultValidationRules();
    defaultRules.forEach(rule => {
      this.validationRules.set(rule.id, rule);
    });
  }

  private async readDocumentContent(documentPath: string): Promise<string> {
    try {
      const fs = await import('fs/promises');
      return await fs.readFile(documentPath, 'utf-8');
    } catch (error) {
      throw new ValidationError(`Failed to read document: ${error.message}`, documentPath);
    }
  }

  private detectDocumentType(documentPath: string): string {
    const filename = documentPath.toLowerCase();
    
    if (filename.includes('charter')) return 'project-charter';
    if (filename.includes('stakeholder')) return 'stakeholder-register';
    if (filename.includes('risk')) return 'risk-management-plan';
    if (filename.includes('scope')) return 'scope-management-plan';
    if (filename.includes('quality')) return 'quality-management-plan';
    if (filename.includes('communication')) return 'communication-management-plan';
    if (filename.includes('wbs')) return 'work-breakdown-structure';
    
    return 'general';
  }

  private getPMBOKRequirements(documentType: string): any[] {
    const requirements: Record<string, any[]> = {
      'project-charter': [
        {
          id: 'project-purpose',
          description: 'Project purpose and justification',
          mandatory: true,
          keywords: ['purpose', 'justification', 'business case'],
          suggestion: 'Add a clear statement of project purpose and business justification'
        },
        {
          id: 'high-level-requirements',
          description: 'High-level project requirements',
          mandatory: true,
          keywords: ['requirements', 'objectives', 'deliverables'],
          suggestion: 'Include high-level project requirements and objectives'
        },
        {
          id: 'stakeholders',
          description: 'Key stakeholders identification',
          mandatory: true,
          keywords: ['stakeholder', 'sponsor', 'customer'],
          suggestion: 'Identify key project stakeholders'
        }
      ],
      'stakeholder-register': [
        {
          id: 'stakeholder-list',
          description: 'Comprehensive stakeholder list',
          mandatory: true,
          keywords: ['stakeholder', 'name', 'role'],
          suggestion: 'Include a comprehensive list of all project stakeholders'
        },
        {
          id: 'influence-interest',
          description: 'Stakeholder influence and interest assessment',
          mandatory: false,
          keywords: ['influence', 'interest', 'power', 'impact'],
          suggestion: 'Add stakeholder influence and interest analysis'
        }
      ]
    };
    
    return requirements[documentType] || [];
  }

  private checkRequirement(content: string, requirement: any): boolean {
    const lowerContent = content.toLowerCase();
    return requirement.keywords.some((keyword: string) => 
      lowerContent.includes(keyword.toLowerCase())
    );
  }

  private getRequiredSections(documentType: string): string[] {
    const sections: Record<string, string[]> = {
      'project-charter': [
        'Project Purpose',
        'Objectives',
        'Stakeholders',
        'Success Criteria',
        'High-Level Requirements'
      ],
      'stakeholder-register': [
        'Stakeholder Information',
        'Contact Details',
        'Roles and Responsibilities',
        'Influence Assessment'
      ],
      'risk-management-plan': [
        'Risk Identification',
        'Risk Assessment',
        'Risk Response',
        'Risk Monitoring'
      ]
    };
    
    return sections[documentType] || [];
  }

  private hasSection(content: string, sectionName: string): boolean {
    const patterns = [
      new RegExp(`^#+\\s*${sectionName}`, 'mi'),
      new RegExp(`^${sectionName}\\s*$`, 'mi'),
      new RegExp(`\\*\\*${sectionName}\\*\\*`, 'mi')
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  private validateHeadingHierarchy(content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const lines = content.split('\n');
    let previousLevel = 0;
    
    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#+)\s/);
      if (headingMatch) {
        const currentLevel = headingMatch[1].length;
        
        if (currentLevel > previousLevel + 1) {
          issues.push({
            severity: 'warning',
            message: `Heading level skipped (from h${previousLevel} to h${currentLevel})`,
            rule: 'structure-heading-hierarchy',
            line: index + 1,
            suggestion: 'Use consecutive heading levels for better document structure'
          });
        }
        
        previousLevel = currentLevel;
      }
    });
    
    return issues;
  }

  private hasTableOfContents(content: string): boolean {
    const tocPatterns = [
      /table of contents/i,
      /contents/i,
      /toc/i
    ];
    
    return tocPatterns.some(pattern => pattern.test(content));
  }

  private findPlaceholders(content: string): string[] {
    const placeholderPatterns = [
      /\{\{[^}]+\}\}/g,
      /\[placeholder\]/gi,
      /\[todo\]/gi,
      /\[tbd\]/gi,
      /\[insert[^]]*\]/gi
    ];
    
    const placeholders: string[] = [];
    
    placeholderPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        placeholders.push(...matches);
      }
    });
    
    return placeholders;
  }

  private findRepeatedContent(content: string): Array<{ text: string; line: number }> {
    const lines = content.split('\n');
    const repetitions: Array<{ text: string; line: number }> = [];
    const seen = new Map<string, number>();
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length > 20) { // Only check substantial lines
        if (seen.has(trimmed)) {
          repetitions.push({
            text: trimmed.substring(0, 50) + '...',
            line: index + 1
          });
        } else {
          seen.set(trimmed, index + 1);
        }
      }
    });
    
    return repetitions;
  }

  private findBrokenReferences(content: string): string[] {
    const refPatterns = [
      /\[([^\]]+)\]\([^)]*\)/g, // Markdown links
      /\{\{[^}]+\}\}/g, // Template variables
      /@\w+/g // References
    ];
    
    const brokenRefs: string[] = [];
    
    refPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Simple heuristic for broken references
          if (match.includes('undefined') || match.includes('null') || match.includes('{{')) {
            brokenRefs.push(match);
          }
        });
      }
    });
    
    return brokenRefs;
  }

  private hasPassiveVoice(sentence: string): boolean {
    const passiveIndicators = [
      /\bis\s+\w+ed\b/,
      /\bare\s+\w+ed\b/,
      /\bwas\s+\w+ed\b/,
      /\bwere\s+\w+ed\b/,
      /\bbeen\s+\w+ed\b/
    ];
    
    return passiveIndicators.some(pattern => pattern.test(sentence));
  }

  private validateRequiredFields(context: ProjectContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (!context.projectName || context.projectName.trim().length === 0) {
      issues.push({
        severity: 'error',
        message: 'Project name is required',
        rule: 'context-project-name-required'
      });
    }
    
    if (!context.businessProblem || context.businessProblem.trim().length === 0) {
      issues.push({
        severity: 'error',
        message: 'Business problem description is required',
        rule: 'context-business-problem-required'
      });
    }
    
    if (!context.technologyStack || context.technologyStack.length === 0) {
      issues.push({
        severity: 'warning',
        message: 'Technology stack should be specified',
        rule: 'context-technology-stack-recommended'
      });
    }
    
    return issues;
  }

  private validateBusinessLogic(context: ProjectContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (context.businessProblem && context.businessProblem.length < 20) {
      issues.push({
        severity: 'warning',
        message: 'Business problem description seems too brief',
        rule: 'context-business-problem-detail'
      });
    }
    
    return issues;
  }

  private validateStakeholders(stakeholders: any[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    stakeholders.forEach((stakeholder, index) => {
      if (!stakeholder.name) {
        issues.push({
          severity: 'error',
          message: `Stakeholder at index ${index} is missing a name`,
          rule: 'context-stakeholder-name-required'
        });
      }
      
      if (!stakeholder.role) {
        issues.push({
          severity: 'warning',
          message: `Stakeholder '${stakeholder.name}' is missing a role`,
          rule: 'context-stakeholder-role-recommended'
        });
      }
    });
    
    return issues;
  }

  private validateConstraints(constraints: any[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    constraints.forEach((constraint, index) => {
      if (!constraint.description) {
        issues.push({
          severity: 'error',
          message: `Constraint at index ${index} is missing a description`,
          rule: 'context-constraint-description-required'
        });
      }
      
      if (!constraint.type) {
        issues.push({
          severity: 'warning',
          message: `Constraint '${constraint.description}' is missing a type`,
          rule: 'context-constraint-type-recommended'
        });
      }
    });
    
    return issues;
  }

  private validateTimeline(timeline: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (timeline.startDate && timeline.endDate) {
      const start = new Date(timeline.startDate);
      const end = new Date(timeline.endDate);
      
      if (start >= end) {
        issues.push({
          severity: 'error',
          message: 'Project end date must be after start date',
          rule: 'context-timeline-date-order'
        });
      }
    }
    
    return issues;
  }

  private validateBudget(budget: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (budget.totalBudget && budget.totalBudget <= 0) {
      issues.push({
        severity: 'error',
        message: 'Total budget must be greater than zero',
        rule: 'context-budget-positive'
      });
    }
    
    if (budget.breakdown) {
      const totalBreakdown = budget.breakdown.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      if (Math.abs(totalBreakdown - budget.totalBudget) > 0.01) {
        issues.push({
          severity: 'warning',
          message: 'Budget breakdown does not match total budget',
          rule: 'context-budget-breakdown-mismatch'
        });
      }
    }
    
    return issues;
  }

  private generateValidationSummary(issues: ValidationIssue[]): ValidationSummary {
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;
    
    const complianceScore = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5) - (infoCount * 1));
    
    const recommendations: string[] = [];
    if (errorCount > 0) {
      recommendations.push('Address all error-level issues before proceeding');
    }
    if (warningCount > 3) {
      recommendations.push('Consider addressing warning-level issues to improve quality');
    }
    if (complianceScore < 80) {
      recommendations.push('Document needs significant improvement to meet quality standards');
    }
    
    return {
      totalIssues: issues.length,
      errorCount,
      warningCount,
      infoCount,
      complianceScore,
      recommendations
    };
  }

  private calculateValidationScore(issues: ValidationIssue[], content: string): number {
    const baseScore = 100;
    const errorPenalty = issues.filter(i => i.severity === 'error').length * 20;
    const warningPenalty = issues.filter(i => i.severity === 'warning').length * 5;
    const infoPenalty = issues.filter(i => i.severity === 'info').length * 1;
    
    // Bonus for content length and structure
    const lengthBonus = Math.min(content.length / 1000, 5);
    
    return Math.max(0, Math.min(100, baseScore - errorPenalty - warningPenalty - infoPenalty + lengthBonus));
  }

  private calculateContextValidationScore(issues: ValidationIssue[], context: ProjectContext): number {
    const baseScore = 100;
    const errorPenalty = issues.filter(i => i.severity === 'error').length * 25;
    const warningPenalty = issues.filter(i => i.severity === 'warning').length * 10;
    
    // Bonus for completeness
    let completenessBonus = 0;
    if (context.stakeholders && context.stakeholders.length > 0) completenessBonus += 5;
    if (context.constraints && context.constraints.length > 0) completenessBonus += 5;
    if (context.timeline) completenessBonus += 5;
    if (context.budget) completenessBonus += 5;
    
    return Math.max(0, Math.min(100, baseScore - errorPenalty - warningPenalty + completenessBonus));
  }

  private getDefaultValidationRules(): any[] {
    return [
      {
        id: 'pmbok-project-charter-purpose',
        name: 'Project Charter Purpose',
        description: 'Project charter must include project purpose',
        documentTypes: ['project-charter'],
        severity: 'error'
      },
      {
        id: 'structure-heading-hierarchy',
        name: 'Heading Hierarchy',
        description: 'Document headings should follow proper hierarchy',
        documentTypes: ['*'],
        severity: 'warning'
      },
      {
        id: 'quality-placeholder-text',
        name: 'No Placeholder Text',
        description: 'Document should not contain placeholder text',
        documentTypes: ['*'],
        severity: 'error'
      }
    ];
  }
}