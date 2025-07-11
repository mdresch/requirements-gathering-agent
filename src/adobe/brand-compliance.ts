/**
 * Adobe Brand Compliance Engine
 * Phase 1: Professional PDF Brand Compliance Validation
 */

import { BrandGuidelines, BrandComplianceResult, BrandViolation, ComplianceSuggestion } from './types.js';
import { CircuitBreaker } from '../utils/circuit-breaker.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { Logger } from '../utils/logger.js';

export class BrandComplianceEngine {
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;
  private logger: Logger;
  private config: BrandGuidelines;

  constructor(config: BrandGuidelines) {
    this.config = config;
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000
    });
    this.rateLimiter = new RateLimiter({
      requestsPerMinute: 600,
      requestsPerHour: 10000
    });
    this.logger = new Logger('BrandCompliance');
  }

  /**
   * Validate document for brand compliance
   */
  async validateCompliance(content: string, template: string): Promise<BrandComplianceResult> {
    await this.rateLimiter.waitForAvailableSlot();
    
    return this.circuitBreaker.execute(async () => {
      this.logger.info('Starting brand compliance validation', {
        template,
        contentLength: content.length
      });

      try {
        const violations = await this.analyzeViolations(content, template);
        const suggestions = await this.generateSuggestions(violations);
        const score = this.calculateComplianceScore(violations);

        const result: BrandComplianceResult = {
          compliant: violations.length === 0,
          score,
          violations,
          suggestions,
          checkedAt: new Date()
        };

        this.logger.info('Brand compliance validation completed', {
          compliant: result.compliant,
          score: result.score,
          violationCount: violations.length
        });

        return result;
      } catch (error) {
        this.logger.error('Brand compliance validation failed', error);
        throw error;
      }
    });
  }

  /**
   * Analyze document for brand violations
   */
  private async analyzeViolations(content: string, template: string): Promise<BrandViolation[]> {
    const violations: BrandViolation[] = [];

    // Color compliance checks
    violations.push(...await this.checkColorCompliance(content, template));
    
    // Typography checks
    violations.push(...await this.checkTypographyCompliance(content, template));
    
    // Layout checks
    violations.push(...await this.checkLayoutCompliance(content, template));
    
    // Logo and branding checks
    violations.push(...await this.checkBrandingCompliance(content, template));

    return violations;
  }

  /**
   * Check color compliance
   */
  private async checkColorCompliance(content: string, template: string): Promise<BrandViolation[]> {
    const violations: BrandViolation[] = [];
    
    // Mock implementation - in production this would use Adobe Color API
    const brandColors = [this.config.colorPalette.primary, this.config.colorPalette.secondary];
    const usedColors = this.extractColors(content);
    
    for (const color of usedColors) {
      if (!this.isApprovedColor(color, brandColors)) {
        violations.push({
          type: 'color',
          severity: 'moderate',
          description: `Unapproved color used: ${color}`,
          location: {
            page: 1,
            element: 'document'
          },
          currentValue: color,
          expectedValue: this.config.colorPalette.primary
        });
      }
    }

    return violations;
  }

  /**
   * Check typography compliance
   */
  private async checkTypographyCompliance(content: string, template: string): Promise<BrandViolation[]> {
    const violations: BrandViolation[] = [];
    
    // Mock implementation - in production this would analyze font usage
    const approvedFont = this.config.typography.body.family;
    const usedFonts = this.extractFonts(content);
    
    for (const font of usedFonts) {
      if (font !== approvedFont) {
        violations.push({
          type: 'typography',
          severity: 'major',
          description: `Unapproved font used: ${font}`,
          location: {
            page: 1,
            element: 'document'
          },
          currentValue: font,
          expectedValue: approvedFont
        });
      }
    }

    return violations;
  }

  /**
   * Check layout compliance
   */
  private async checkLayoutCompliance(content: string, template: string): Promise<BrandViolation[]> {
    const violations: BrandViolation[] = [];
    
    // Mock implementation - in production this would analyze layout structure
    const requiredMargins = this.config.layoutRules.margins;
    const actualMargins = this.extractMargins(content);
    
    if (requiredMargins && actualMargins) {
      if (actualMargins.top < requiredMargins.top) {
        violations.push({
          type: 'layout',
          severity: 'moderate',
          description: 'Top margin below brand standard',
          location: {
            page: 1,
            element: 'page margins'
          },
          currentValue: actualMargins.top,
          expectedValue: requiredMargins.top
        });
      }
    }

    return violations;
  }

  /**
   * Check branding compliance
   */
  private async checkBrandingCompliance(content: string, template: string): Promise<BrandViolation[]> {
    const violations: BrandViolation[] = [];
    
    // Mock implementation - in production this would validate logo placement, etc.
    const hasLogo = content.includes('logo') || content.includes('brand');
    
    if (!hasLogo) {
      violations.push({
        type: 'logo',
        severity: 'major',
        description: 'Required brand logo missing',
        location: {
          page: 1,
          element: 'header/footer'
        },
        currentValue: 'none',
        expectedValue: 'brand logo'
      });
    }

    return violations;
  }

  /**
   * Generate compliance suggestions
   */
  private async generateSuggestions(violations: BrandViolation[]): Promise<ComplianceSuggestion[]> {
    const suggestions: ComplianceSuggestion[] = [];

    for (const violation of violations) {
      suggestions.push({
        violation: violation.description,
        suggestion: this.generateSuggestionText(violation),
        impact: this.mapSeverityToImpact(violation.severity),
        autoFixable: this.isAutoFixable(violation)
      });
    }

    return suggestions;
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(violations: BrandViolation[]): number {
    if (violations.length === 0) return 100;

    const severityWeights = {
      minor: 2,
      moderate: 5,
      major: 10
    };

    const totalDeductions = violations.reduce((sum, violation) => {
      return sum + severityWeights[violation.severity];
    }, 0);

    return Math.max(0, 100 - totalDeductions);
  }

  /**
   * Helper methods for content analysis
   */
  private extractColors(content: string): string[] {
    // Mock implementation
    return ['#ff0000', '#00ff00', '#0000ff'];
  }

  private extractFonts(content: string): string[] {
    // Mock implementation
    return ['Arial', 'Times New Roman', 'Helvetica'];
  }

  private extractMargins(content: string): { top: number; right: number; bottom: number; left: number } | null {
    // Mock implementation
    return { top: 20, right: 20, bottom: 20, left: 20 };
  }

  private isApprovedColor(color: string, approvedColors: string[]): boolean {
    return approvedColors.includes(color);
  }

  private mapSeverityToImpact(severity: 'minor' | 'moderate' | 'major'): 'low' | 'medium' | 'high' {
    switch (severity) {
      case 'major':
        return 'high';
      case 'moderate':
        return 'medium';
      case 'minor':
        return 'low';
    }
  }

  private generateSuggestionText(violation: BrandViolation): string {
    switch (violation.type) {
      case 'color':
        return `Use approved brand color: ${violation.expectedValue}`;
      case 'typography':
        return `Apply brand typography: ${violation.expectedValue}`;
      case 'layout':
        return `Adjust layout to match brand standards`;
      case 'logo':
        return `Add approved brand logo`;
      case 'spacing':
        return `Adjust spacing to brand guidelines`;
      default:
        return 'Review brand guidelines for this element';
    }
  }

  private isAutoFixable(violation: BrandViolation): boolean {
    // Simple rules for what can be auto-fixed
    return violation.type === 'color' || violation.type === 'typography' || violation.type === 'spacing';
  }
}

export default BrandComplianceEngine;
