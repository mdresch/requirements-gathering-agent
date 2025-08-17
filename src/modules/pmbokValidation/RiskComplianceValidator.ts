import { PMBOKValidator } from './PMBOKValidator.js';
import type { 
  ComplianceResult, 
  RiskLevel, 
  DeviationAnalysis 
} from '../../types/standardsCompliance.js';

/**
 * Enhanced Risk and Compliance Validator
 * 
 * Extends PMBOK validation to include comprehensive risk and compliance assessment validation
 */
export class RiskComplianceValidator extends PMBOKValidator {
  
  /**
   * Validates risk and compliance assessment documents
   */
  async validateRiskComplianceAssessment(
    documentPath: string
  ): Promise<RiskComplianceValidationResult> {
    try {
      const content = await this.readDocumentContent(documentPath);
      
      // Perform base PMBOK validation
      const pmbokValidation = await this.validatePMBOKCompliance();
      
      // Perform risk assessment validation
      const riskValidation = await this.validateRiskAssessment(content);
      
      // Perform compliance assessment validation
      const complianceValidation = await this.validateComplianceAssessment(content);
      
      // Perform integration validation
      const integrationValidation = await this.validateIntegration(content);
      
      // Calculate overall score
      const overallScore = this.calculateOverallValidationScore([
        riskValidation,
        complianceValidation,
        integrationValidation
      ]);
      
      return {
        documentPath,
        validationDate: new Date(),
        overallScore,
        pmbokCompliance: pmbokValidation,
        riskAssessment: riskValidation,
        complianceAssessment: complianceValidation,
        integration: integrationValidation,
        recommendations: this.generateValidationRecommendations(
          riskValidation,
          complianceValidation,
          integrationValidation
        ),
        isValid: overallScore >= 80,
        criticalIssues: this.identifyCriticalIssues([
          riskValidation,
          complianceValidation,
          integrationValidation
        ])
      };
    } catch (error) {
      console.error('Error validating risk and compliance assessment:', error);
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  /**
   * Validates risk assessment components
   */
  private async validateRiskAssessment(content: string): Promise<ValidationComponent> {
    const findings: string[] = [];
    const strengths: string[] = [];
    let score = 0;

    // Check for risk identification
    if (this.contentContainsElement(content, 'Risk ID')) {
      score += 15;
      strengths.push('Risk identification table present');
    } else {
      findings.push('Missing risk identification table with Risk IDs');
    }

    // Check for risk categories
    const riskCategories = [
      'Strategic Risks',
      'Operational Risks', 
      'Technical Risks',
      'Financial Risks',
      'Regulatory Risks',
      'Reputational Risks'
    ];
    
    const presentCategories = riskCategories.filter(category => 
      content.includes(category)
    );
    
    if (presentCategories.length >= 4) {
      score += 20;
      strengths.push(`Comprehensive risk categories covered (${presentCategories.length}/6)`);
    } else {
      findings.push(`Insufficient risk categories (${presentCategories.length}/6 minimum required: 4)`);
    }

    // Check for probability and impact assessment
    if (content.includes('Probability') && content.includes('Impact')) {
      score += 15;
      strengths.push('Probability and impact assessment included');
    } else {
      findings.push('Missing probability and impact assessment');
    }

    // Check for risk scoring
    if (content.includes('Risk Score')) {
      score += 10;
      strengths.push('Risk scoring methodology present');
    } else {
      findings.push('Missing risk scoring methodology');
    }

    // Check for risk response strategies
    const responseStrategies = ['Avoid', 'Mitigate', 'Transfer', 'Accept'];
    const presentStrategies = responseStrategies.filter(strategy =>
      content.toLowerCase().includes(strategy.toLowerCase())
    );
    
    if (presentStrategies.length >= 3) {
      score += 15;
      strengths.push('Risk response strategies covered');
    } else {
      findings.push('Insufficient risk response strategies');
    }

    // Check for risk monitoring
    if (content.includes('Risk Monitoring') || content.includes('Risk Review')) {
      score += 10;
      strengths.push('Risk monitoring procedures included');
    } else {
      findings.push('Missing risk monitoring procedures');
    }

    // Check for risk prioritization
    if (content.includes('High Priority') || content.includes('Risk Matrix')) {
      score += 15;
      strengths.push('Risk prioritization methodology present');
    } else {
      findings.push('Missing risk prioritization methodology');
    }

    return {
      component: 'Risk Assessment',
      score,
      findings,
      strengths,
      isValid: score >= 70
    };
  }

  /**
   * Validates compliance assessment components
   */
  private async validateComplianceAssessment(content: string): Promise<ValidationComponent> {
    const findings: string[] = [];
    const strengths: string[] = [];
    let score = 0;

    // Check for PMBOK compliance
    if (content.includes('PMBOK') && content.includes('Performance Domain')) {
      score += 25;
      strengths.push('PMBOK 7.0 compliance assessment included');
    } else {
      findings.push('Missing PMBOK 7.0 compliance assessment');
    }

    // Check for compliance maturity assessment
    if (content.includes('Maturity') && content.includes('Current Maturity')) {
      score += 15;
      strengths.push('Compliance maturity assessment included');
    } else {
      findings.push('Missing compliance maturity assessment');
    }

    // Check for gap analysis
    if (content.includes('Gap Analysis') || content.includes('Compliance Gap')) {
      score += 20;
      strengths.push('Compliance gap analysis included');
    } else {
      findings.push('Missing compliance gap analysis');
    }

    // Check for multiple standards
    const standards = ['PMBOK', 'BABOK', 'DMBOK', 'ISO'];
    const presentStandards = standards.filter(standard =>
      content.includes(standard)
    );
    
    if (presentStandards.length >= 2) {
      score += 15;
      strengths.push(`Multiple standards assessed (${presentStandards.length})`);
    } else {
      findings.push('Assessment should cover multiple applicable standards');
    }

    // Check for compliance scoring
    if (content.includes('Compliance Score') || content.includes('%')) {
      score += 10;
      strengths.push('Compliance scoring methodology present');
    } else {
      findings.push('Missing compliance scoring methodology');
    }

    // Check for action plans
    if (content.includes('Action Required') || content.includes('Remediation')) {
      score += 15;
      strengths.push('Compliance remediation actions included');
    } else {
      findings.push('Missing compliance remediation action plans');
    }

    return {
      component: 'Compliance Assessment',
      score,
      findings,
      strengths,
      isValid: score >= 70
    };
  }

  /**
   * Validates integration between risk and compliance assessments
   */
  private async validateIntegration(content: string): Promise<ValidationComponent> {
    const findings: string[] = [];
    const strengths: string[] = [];
    let score = 0;

    // Check for risk-compliance correlation
    if (content.includes('Risk-Compliance Correlation') || 
        content.includes('Compliance Gaps Creating Risks')) {
      score += 25;
      strengths.push('Risk-compliance correlation analysis included');
    } else {
      findings.push('Missing risk-compliance correlation analysis');
    }

    // Check for integrated response strategy
    if (content.includes('Integrated Response') || 
        content.includes('Combined Risk Mitigation')) {
      score += 20;
      strengths.push('Integrated response strategy included');
    } else {
      findings.push('Missing integrated response strategy');
    }

    // Check for executive summary
    if (content.includes('Executive Summary')) {
      score += 15;
      strengths.push('Executive summary provided');
    } else {
      findings.push('Missing executive summary');
    }

    // Check for recommendations
    if (content.includes('Recommendations') && content.includes('Next Steps')) {
      score += 15;
      strengths.push('Comprehensive recommendations included');
    } else {
      findings.push('Missing comprehensive recommendations');
    }

    // Check for monitoring and governance
    if (content.includes('Monitoring') && content.includes('Governance')) {
      score += 15;
      strengths.push('Monitoring and governance framework included');
    } else {
      findings.push('Missing monitoring and governance framework');
    }

    // Check for implementation roadmap
    if (content.includes('Implementation') && content.includes('Roadmap')) {
      score += 10;
      strengths.push('Implementation roadmap provided');
    } else {
      findings.push('Missing implementation roadmap');
    }

    return {
      component: 'Integration',
      score,
      findings,
      strengths,
      isValid: score >= 70
    };
  }

  /**
   * Calculates overall validation score
   */
  private calculateOverallValidationScore(components: ValidationComponent[]): number {
    if (components.length === 0) return 0;
    
    const totalScore = components.reduce((sum, component) => sum + component.score, 0);
    const maxPossibleScore = components.length * 100;
    
    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  /**
   * Generates validation recommendations
   */
  private generateValidationRecommendations(
    ...components: ValidationComponent[]
  ): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];
    
    for (const component of components) {
      if (component.score < 70) {
        recommendations.push({
          priority: 'HIGH',
          component: component.component,
          issue: `${component.component} score below threshold (${component.score}/100)`,
          recommendation: `Improve ${component.component.toLowerCase()} by addressing: ${component.findings.join(', ')}`,
          effort: 'MEDIUM'
        });
      } else if (component.score < 85) {
        recommendations.push({
          priority: 'MEDIUM',
          component: component.component,
          issue: `${component.component} has room for improvement (${component.score}/100)`,
          recommendation: `Enhance ${component.component.toLowerCase()} by addressing: ${component.findings.slice(0, 2).join(', ')}`,
          effort: 'LOW'
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Identifies critical issues requiring immediate attention
   */
  private identifyCriticalIssues(components: ValidationComponent[]): CriticalIssue[] {
    const criticalIssues: CriticalIssue[] = [];
    
    for (const component of components) {
      if (component.score < 50) {
        criticalIssues.push({
          severity: 'CRITICAL',
          component: component.component,
          description: `${component.component} severely deficient (${component.score}/100)`,
          impact: 'Project may not meet risk management and compliance requirements',
          immediateAction: `Immediately address all findings in ${component.component}`
        });
      } else if (component.score < 70) {
        criticalIssues.push({
          severity: 'HIGH',
          component: component.component,
          description: `${component.component} below acceptable threshold (${component.score}/100)`,
          impact: 'Risk of non-compliance and inadequate risk management',
          immediateAction: `Address key findings in ${component.component} before project approval`
        });
      }
    }
    
    return criticalIssues;
  }

  /**
   * Reads document content from file path
   */
  private async readDocumentContent(documentPath: string): Promise<string> {
    try {
      const fs = await import('fs/promises');
      return await fs.readFile(documentPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read document: ${error.message}`);
    }
  }
}

// Supporting interfaces
export interface RiskComplianceValidationResult {
  documentPath: string;
  validationDate: Date;
  overallScore: number;
  pmbokCompliance: any;
  riskAssessment: ValidationComponent;
  complianceAssessment: ValidationComponent;
  integration: ValidationComponent;
  recommendations: ValidationRecommendation[];
  isValid: boolean;
  criticalIssues: CriticalIssue[];
}

export interface ValidationComponent {
  component: string;
  score: number;
  findings: string[];
  strengths: string[];
  isValid: boolean;
}

export interface ValidationRecommendation {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  component: string;
  issue: string;
  recommendation: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CriticalIssue {
  severity: 'HIGH' | 'CRITICAL';
  component: string;
  description: string;
  impact: string;
  immediateAction: string;
}