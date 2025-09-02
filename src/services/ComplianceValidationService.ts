/**
 * Compliance Validation Service
 * 
 * Comprehensive service for validating documents against compliance considerations
 * and enterprise governance policies to ensure regulatory requirements are met.
 */

import { logger } from '../utils/logger.js';
import { StandardsComplianceAnalysisEngine } from '../modules/standardsCompliance/StandardsComplianceEngine.js';
import { PMBOKValidator } from '../modules/pmbokValidation/PMBOKValidator.js';
import { ISO15408Validator } from '../modules/standardsCompliance/ISO15408Validator.js';
import {
  ProjectData,
  ComplianceResult,
  StandardsComplianceConfig,
  ComplianceStatus,
  DeviationSeverity,
  RiskLevel,
  Impact,
  Priority,
  ComplianceIssue,
  ComplianceRecommendation
} from '../types/standardsCompliance.js';

export interface DocumentComplianceValidation {
  documentId: string;
  documentType: string;
  content: string;
  complianceScore: number;
  complianceStatus: ComplianceStatus;
  validationDate: Date;
  issues: ComplianceIssue[];
  recommendations: ComplianceRecommendation[];
  governancePolicyCompliance: GovernancePolicyValidation;
  regulatoryCompliance: RegulatoryComplianceValidation;
  enterpriseStandardsCompliance: EnterpriseStandardsValidation;
}

export interface GovernancePolicyValidation {
  overallCompliance: boolean;
  policyChecks: PolicyCheck[];
  missingPolicies: string[];
  policyViolations: PolicyViolation[];
}

export interface PolicyCheck {
  policyId: string;
  policyName: string;
  compliant: boolean;
  severity: DeviationSeverity;
  description: string;
  evidence: string[];
}

export interface PolicyViolation {
  violationId: string;
  policyId: string;
  severity: DeviationSeverity;
  description: string;
  impact: Impact;
  remediation: string;
}

export interface RegulatoryComplianceValidation {
  overallCompliance: boolean;
  applicableRegulations: ApplicableRegulation[];
  complianceGaps: ComplianceGap[];
  riskAssessment: RegulatoryRiskAssessment;
}

export interface ApplicableRegulation {
  regulationId: string;
  name: string;
  jurisdiction: string;
  compliant: boolean;
  requirements: RegulationRequirement[];
}

export interface RegulationRequirement {
  requirementId: string;
  description: string;
  compliant: boolean;
  evidence: string[];
  gaps: string[];
}

export interface ComplianceGap {
  gapId: string;
  regulationId: string;
  description: string;
  severity: DeviationSeverity;
  impact: Impact;
  remediation: string;
  timeline: string;
}

export interface RegulatoryRiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
}

export interface RiskFactor {
  factorId: string;
  description: string;
  probability: number;
  impact: Impact;
  riskLevel: RiskLevel;
}

export interface MitigationStrategy {
  strategyId: string;
  description: string;
  effectiveness: number;
  implementationCost: number;
  timeline: string;
}

export interface EnterpriseStandardsValidation {
  overallCompliance: boolean;
  standardsChecks: StandardCheck[];
  deviations: StandardDeviation[];
  improvementAreas: ImprovementArea[];
}

export interface StandardCheck {
  standardId: string;
  standardName: string;
  category: string;
  compliant: boolean;
  score: number;
  requirements: StandardRequirement[];
}

export interface StandardRequirement {
  requirementId: string;
  description: string;
  compliant: boolean;
  evidence: string[];
}

export interface StandardDeviation {
  deviationId: string;
  standardId: string;
  description: string;
  severity: DeviationSeverity;
  justification: string;
  approved: boolean;
}

export interface ImprovementArea {
  areaId: string;
  description: string;
  priority: Priority;
  recommendations: string[];
  estimatedEffort: string;
}

export interface ComplianceValidationConfig {
  enabledStandards: string[];
  governancePolicies: GovernancePolicy[];
  regulatoryFrameworks: RegulatoryFramework[];
  enterpriseStandards: EnterpriseStandard[];
  validationRules: ValidationRule[];
  riskThresholds: RiskThreshold[];
}

export interface GovernancePolicy {
  policyId: string;
  name: string;
  category: string;
  mandatory: boolean;
  requirements: string[];
  validationCriteria: string[];
}

export interface RegulatoryFramework {
  frameworkId: string;
  name: string;
  jurisdiction: string;
  applicableIndustries: string[];
  requirements: RegulationRequirement[];
}

export interface EnterpriseStandard {
  standardId: string;
  name: string;
  category: string;
  version: string;
  requirements: StandardRequirement[];
}

export interface ValidationRule {
  ruleId: string;
  name: string;
  category: string;
  severity: DeviationSeverity;
  condition: string;
  action: string;
}

export interface RiskThreshold {
  category: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

/**
 * Comprehensive Compliance Validation Service
 */
export class ComplianceValidationService {
  private standardsEngine: StandardsComplianceAnalysisEngine;
  private pmbokValidator: PMBOKValidator;
  private iso15408Validator: ISO15408Validator;
  private config: ComplianceValidationConfig;

  constructor(config: ComplianceValidationConfig) {
    this.config = config;
    
    // Initialize standards compliance engine
    const standardsConfig: StandardsComplianceConfig = {
      enabledStandards: config.enabledStandards.filter(
        (s): s is "BABOK_V3" | "PMBOK_7" | "DMBOK_2" | "ISO_15408" =>
          ["BABOK_V3", "PMBOK_7", "DMBOK_2", "ISO_15408"].includes(s)
      ),
      analysisDepth: 'COMPREHENSIVE',
      generateExecutiveSummary: true,
      intelligentDeviationThreshold: 0.7,
      riskToleranceLevel: 'MEDIUM',
      includeRecommendations: true,
      outputFormat: 'JSON'
    };

    this.standardsEngine = new StandardsComplianceAnalysisEngine(standardsConfig);
    this.pmbokValidator = new PMBOKValidator('generated-documents');
    this.iso15408Validator = new ISO15408Validator('generated-documents');

    logger.info('🔒 Compliance Validation Service initialized');
  }

  /**
   * Validate document compliance against all configured standards and policies
   */
  public async validateDocumentCompliance(
    documentId: string,
    documentType: string,
    content: string,
    projectData?: ProjectData
  ): Promise<DocumentComplianceValidation> {
    logger.info(`🔍 Starting compliance validation for document: ${documentId}`);

    try {
      // Perform governance policy validation
      const governancePolicyCompliance = await this.validateGovernancePolicies(content, documentType);

      // Perform regulatory compliance validation
      const regulatoryCompliance = await this.validateRegulatoryCompliance(content, documentType, projectData);

      // Perform enterprise standards validation
      const enterpriseStandardsCompliance = await this.validateEnterpriseStandards(content, documentType);

      // Calculate overall compliance score
      const complianceScore = this.calculateOverallComplianceScore(
        governancePolicyCompliance,
        regulatoryCompliance,
        enterpriseStandardsCompliance
      );

      // Determine compliance status
      const complianceStatus = this.determineComplianceStatus(complianceScore);

      // Generate issues and recommendations
      const { issues, recommendations } = this.generateComplianceFindings(
        governancePolicyCompliance,
        regulatoryCompliance,
        enterpriseStandardsCompliance
      );

      const validation: DocumentComplianceValidation = {
        documentId,
        documentType,
        content,
        complianceScore,
        complianceStatus,
        validationDate: new Date(),
        issues,
        recommendations,
        governancePolicyCompliance,
        regulatoryCompliance,
        enterpriseStandardsCompliance
      };

      logger.info(`✅ Compliance validation completed for ${documentId}. Score: ${complianceScore}%`);
      return validation;

    } catch (error) {
      logger.error(`❌ Compliance validation failed for ${documentId}:`, error);
      throw new Error(`Compliance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate governance policies compliance
   */
  private async validateGovernancePolicies(
    content: string,
    documentType: string
  ): Promise<GovernancePolicyValidation> {
    const policyChecks: PolicyCheck[] = [];
    const missingPolicies: string[] = [];
    const policyViolations: PolicyViolation[] = [];

    // Get applicable policies for document type
    const applicablePolicies = this.config.governancePolicies.filter(policy => 
      this.isPolicyApplicable(policy, documentType)
    );

    for (const policy of applicablePolicies) {
      // For each requirement, create a separate policy check and violation if missing
      for (const requirement of policy.requirements) {
        const compliant = this.contentContainsRequirement(content, requirement);
        policyChecks.push({
          policyId: `${policy.policyId}-${requirement.replace(/\s+/g, '-').toLowerCase()}`,
          policyName: `${policy.name}: ${requirement}`,
          compliant,
          severity: policy.mandatory ? 'HIGH' : 'MEDIUM',
          description: `Validation of ${requirement} in ${policy.name}`,
          evidence: compliant ? [`Found evidence of: ${requirement}`] : []
        });
        if (!compliant) {
          policyViolations.push({
            violationId: `violation-${policy.policyId}-${requirement.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
            policyId: `${policy.policyId}-${requirement.replace(/\s+/g, '-').toLowerCase()}`,
            severity: 'HIGH',
            description: `Mandatory requirement '${requirement}' of policy '${policy.name}' not satisfied`,
            impact: 'MAJOR',
            remediation: `Ensure document includes required element: ${requirement}`
          });
        }
      }
    }

    const overallCompliance = policyViolations.length === 0;

    return {
      overallCompliance,
      policyChecks,
      missingPolicies,
      policyViolations
    };
  }

  /**
   * Validate regulatory compliance
   */
  private async validateRegulatoryCompliance(
    content: string,
    documentType: string,
    projectData?: ProjectData
  ): Promise<RegulatoryComplianceValidation> {
    const applicableRegulations: ApplicableRegulation[] = [];
    const complianceGaps: ComplianceGap[] = [];

    // Get applicable regulatory frameworks
    const frameworks = this.getApplicableRegulatoryFrameworks(projectData);

    for (const framework of frameworks) {
      const regulation = await this.validateRegulation(framework, content, documentType);
      applicableRegulations.push(regulation);

      // Identify compliance gaps
      for (const requirement of regulation.requirements) {
        if (!requirement.compliant) {
          complianceGaps.push({
            gapId: `gap-${framework.frameworkId}-${requirement.requirementId}`,
            regulationId: framework.frameworkId,
            description: `Non-compliance with ${framework.name}: ${requirement.description}`,
            severity: 'HIGH',
            impact: 'MAJOR',
            remediation: `Address requirement: ${requirement.description}`,
            timeline: '30 days'
          });
        }
      }
    }

    // Perform risk assessment
    const riskAssessment = this.assessRegulatoryRisk(complianceGaps);

    const overallCompliance = complianceGaps.length === 0;

    return {
      overallCompliance,
      applicableRegulations,
      complianceGaps,
      riskAssessment
    };
  }

  /**
   * Validate enterprise standards compliance
   */
  private async validateEnterpriseStandards(
    content: string,
    documentType: string
  ): Promise<EnterpriseStandardsValidation> {
    const standardsChecks: StandardCheck[] = [];
    const deviations: StandardDeviation[] = [];
    const improvementAreas: ImprovementArea[] = [];

    // Get applicable enterprise standards
    const applicableStandards = this.config.enterpriseStandards.filter(standard =>
      this.isStandardApplicable(standard, documentType)
    );

    for (const standard of applicableStandards) {
      const check = await this.validateEnterpriseStandard(standard, content);
      standardsChecks.push(check);

      // Identify deviations
      for (const requirement of check.requirements) {
        if (!requirement.compliant) {
          deviations.push({
            deviationId: `dev-${standard.standardId}-${requirement.requirementId}`,
            standardId: standard.standardId,
            description: `Non-compliance with ${standard.name}: ${requirement.description}`,
            severity: 'MEDIUM',
            justification: 'Document does not meet standard requirement',
            approved: false
          });
        }
      }

      // Identify improvement areas
      if (check.score < 80) {
        improvementAreas.push({
          areaId: `improve-${standard.standardId}`,
          description: `Improve compliance with ${standard.name}`,
          priority: 'HIGH',
          recommendations: [
            `Review and update document to meet ${standard.name} requirements`,
            'Implement quality assurance processes',
            'Provide training on enterprise standards'
          ],
          estimatedEffort: '2-4 weeks'
        });
      }
    }

    const overallCompliance = deviations.length === 0;

    return {
      overallCompliance,
      standardsChecks,
      deviations,
      improvementAreas
    };
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallComplianceScore(
    governance: GovernancePolicyValidation,
    regulatory: RegulatoryComplianceValidation,
    enterprise: EnterpriseStandardsValidation
  ): number {
    const governanceScore = governance.overallCompliance ? 100 : 
      Math.max(0, 100 - (governance.policyViolations.length * 5));
    
    const regulatoryScore = regulatory.overallCompliance ? 100 :
      Math.max(0, 100 - (regulatory.complianceGaps.length * 15));
    
    const enterpriseScore = enterprise.overallCompliance ? 100 :
      enterprise.standardsChecks.reduce((sum, check) => sum + check.score, 0) / 
      Math.max(1, enterprise.standardsChecks.length);

    // Weighted average: governance 40%, regulatory 40%, enterprise 20%
    return Math.round((governanceScore * 0.4) + (regulatoryScore * 0.4) + (enterpriseScore * 0.2));
  }

  /**
   * Determine compliance status based on score
   */
  private determineComplianceStatus(score: number): ComplianceStatus {
    if (score >= 95) return 'FULLY_COMPLIANT';
    if (score >= 85) return 'MOSTLY_COMPLIANT';
    if (score >= 70) return 'PARTIALLY_COMPLIANT';
    return 'NON_COMPLIANT';
  }

  /**
   * Generate compliance findings (issues and recommendations)
   */
  private generateComplianceFindings(
    governance: GovernancePolicyValidation,
    regulatory: RegulatoryComplianceValidation,
    enterprise: EnterpriseStandardsValidation
  ): { issues: ComplianceIssue[]; recommendations: ComplianceRecommendation[] } {
    const issues: ComplianceIssue[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Generate issues from governance violations
    governance.policyViolations.forEach(violation => {
      issues.push({
        id: violation.violationId,
        severity: violation.severity,
        category: 'GOVERNANCE',
        description: violation.description,
        requirement: 'Enterprise Governance Policy',
        currentState: 'Non-compliant',
        expectedState: 'Compliant',
        impact: violation.impact,
        recommendation: violation.remediation,
        effort: {
          hours: 8,
          cost: 1000,
          resources: [{ type: 'PERSONNEL', skill: 'Compliance Officer', quantity: 1, duration: '1 week' }],
          duration: '1 week',
          complexity: 'MEDIUM'
        }
      });
    });

    // Generate issues from regulatory gaps
    regulatory.complianceGaps.forEach(gap => {
      issues.push({
        id: gap.gapId,
        severity: gap.severity,
        category: 'REGULATORY',
        description: gap.description,
        requirement: 'Regulatory Compliance',
        currentState: 'Non-compliant',
        expectedState: 'Compliant',
        impact: gap.impact,
        recommendation: gap.remediation,
        effort: {
          hours: 16,
          cost: 2000,
          resources: [{ type: 'PERSONNEL', skill: 'Legal Counsel', quantity: 1, duration: gap.timeline }],
          duration: gap.timeline,
          complexity: 'HIGH'
        }
      });
    });

    // Generate recommendations from improvement areas
    enterprise.improvementAreas.forEach(area => {
      recommendations.push({
        id: area.areaId,
        priority: area.priority,
        category: 'ENTERPRISE_STANDARDS',
        description: area.description,
        rationale: 'Improve enterprise standards compliance',
        implementation: area.recommendations,
        benefits: ['Improved compliance', 'Reduced risk', 'Better quality'],
        risks: ['Resource constraints', 'Timeline pressure'],
        effort: {
          hours: 40,
          cost: 5000,
          resources: [{ type: 'PERSONNEL', skill: 'Standards Team', quantity: 2, duration: area.estimatedEffort }],
          duration: area.estimatedEffort,
          complexity: 'MEDIUM'
        },
        timeline: area.estimatedEffort
      });
    });

    return { issues, recommendations };
  }

  // Helper methods for validation logic

  private isPolicyApplicable(policy: GovernancePolicy, documentType: string): boolean {
    // Logic to determine if a policy applies to a specific document type
    const applicableCategories = ['ALL', documentType.toUpperCase()];
    return applicableCategories.includes(policy.category.toUpperCase());
  }

  private async validatePolicy(policy: GovernancePolicy, content: string): Promise<PolicyCheck> {
    const evidence: string[] = [];
    let compliant = true;

    // Check each requirement
    for (const requirement of policy.requirements) {
      if (!this.contentContainsRequirement(content, requirement)) {
        compliant = false;
      } else {
        evidence.push(`Found evidence of: ${requirement}`);
      }
    }

    return {
      policyId: policy.policyId,
      policyName: policy.name,
      compliant,
      severity: policy.mandatory ? 'HIGH' : 'MEDIUM',
      description: `Validation of ${policy.name} policy`,
      evidence
    };
  }

  private getApplicableRegulatoryFrameworks(projectData?: ProjectData): RegulatoryFramework[] {
    if (!projectData) {
      return this.config.regulatoryFrameworks;
    }

    return this.config.regulatoryFrameworks.filter(framework =>
      framework.applicableIndustries.includes(projectData.industry) ||
      framework.applicableIndustries.includes('ALL')
    );
  }

  private async validateRegulation(
    framework: RegulatoryFramework,
    content: string,
    documentType: string
  ): Promise<ApplicableRegulation> {
    const requirements: RegulationRequirement[] = [];

    for (const req of framework.requirements) {
      const compliant = this.contentContainsRequirement(content, req.description);
      const evidence = compliant ? [`Found compliance evidence for: ${req.description}`] : [];
      const gaps = compliant ? [] : [`Missing: ${req.description}`];

      requirements.push({
        requirementId: req.requirementId,
        description: req.description,
        compliant,
        evidence,
        gaps
      });
    }

    const compliant = requirements.every(req => req.compliant);

    return {
      regulationId: framework.frameworkId,
      name: framework.name,
      jurisdiction: framework.jurisdiction,
      compliant,
      requirements
    };
  }

  private assessRegulatoryRisk(gaps: ComplianceGap[]): RegulatoryRiskAssessment {
    const riskFactors: RiskFactor[] = gaps.map(gap => ({
      factorId: gap.gapId,
      description: gap.description,
      probability: 0.7, // 70% probability of regulatory action
      impact: gap.impact,
      riskLevel: gap.severity === 'CRITICAL' ? 'VERY_HIGH' : 
                gap.severity === 'HIGH' ? 'HIGH' : 'MEDIUM'
    }));

    const overallRisk = gaps.length === 0 ? 'VERY_LOW' :
                       gaps.some(g => g.severity === 'CRITICAL') ? 'VERY_HIGH' :
                       gaps.some(g => g.severity === 'HIGH') ? 'HIGH' : 'MEDIUM';

    const mitigationStrategies: MitigationStrategy[] = [
      {
        strategyId: 'legal-review',
        description: 'Conduct comprehensive legal review',
        effectiveness: 0.9,
        implementationCost: 10000,
        timeline: '2-4 weeks'
      },
      {
        strategyId: 'compliance-training',
        description: 'Implement compliance training program',
        effectiveness: 0.8,
        implementationCost: 5000,
        timeline: '4-6 weeks'
      }
    ];

    return {
      overallRisk,
      riskFactors,
      mitigationStrategies
    };
  }

  private isStandardApplicable(standard: EnterpriseStandard, documentType: string): boolean {
    // Logic to determine if a standard applies to a specific document type
    const applicableCategories = ['ALL', documentType.toUpperCase()];
    return applicableCategories.includes(standard.category.toUpperCase());
  }

  private async validateEnterpriseStandard(
    standard: EnterpriseStandard,
    content: string
  ): Promise<StandardCheck> {
    const requirements: StandardRequirement[] = [];
    let totalScore = 0;

    for (const req of standard.requirements) {
      const compliant = this.contentContainsRequirement(content, req.description);
      const evidence = compliant ? [`Found compliance evidence for: ${req.description}`] : [];
      
      requirements.push({
        requirementId: req.requirementId,
        description: req.description,
        compliant,
        evidence
      });

      if (compliant) totalScore += 100;
    }

    const score = requirements.length > 0 ? totalScore / requirements.length : 0;
    const compliant = requirements.every(req => req.compliant);

    return {
      standardId: standard.standardId,
      standardName: standard.name,
      category: standard.category,
      compliant,
      score,
      requirements
    };
  }

  private contentContainsRequirement(content: string, requirement: string): boolean {
    // Simple keyword-based validation - can be enhanced with NLP
    const keywords = requirement.toLowerCase().split(' ').filter(word => word.length > 3);
    const contentLower = content.toLowerCase();
    
    // Require at least 70% of keywords to be present
    const foundKeywords = keywords.filter(keyword => contentLower.includes(keyword));
    return foundKeywords.length >= (keywords.length * 0.7);
  }

  /**
   * Get default compliance validation configuration
   */
  public static getDefaultConfig(): ComplianceValidationConfig {
    return {
      enabledStandards: ['BABOK_V3', 'PMBOK_7', 'DMBOK_2', 'ISO_15408'],
      governancePolicies: [
        {
          policyId: 'GOV-001',
          name: 'Document Quality Standards',
          category: 'ALL',
          mandatory: true,
          requirements: [
            'Executive summary',
            'Clear objectives',
            'Risk assessment',
            'Stakeholder analysis',
            'Approval process'
          ],
          validationCriteria: [
            'Document structure follows template',
            'All required sections present',
            'Content quality meets standards'
          ]
        },
        {
          policyId: 'GOV-002',
          name: 'Data Governance Policy',
          category: 'DATA',
          mandatory: true,
          requirements: [
            'Data classification',
            'Privacy considerations',
            'Data retention policy',
            'Access controls',
            'Data quality standards'
          ],
          validationCriteria: [
            'Data handling procedures defined',
            'Privacy impact assessment included',
            'Compliance with data protection regulations'
          ]
        },
        {
          policyId: 'GOV-003',
          name: 'Security Governance Policy',
          category: 'SECURITY',
          mandatory: true,
          requirements: [
            'Security requirements',
            'Threat assessment',
            'Security controls',
            'Incident response',
            'Security monitoring'
          ],
          validationCriteria: [
            'Security framework alignment',
            'Risk-based security approach',
            'Compliance with security standards'
          ]
        }
      ],
      regulatoryFrameworks: [
  // GDPR and SOX frameworks removed as requested
      ],
      enterpriseStandards: [
        {
          standardId: 'ENT-001',
          name: 'Enterprise Architecture Standards',
          category: 'TECHNICAL',
          version: '1.0',
          requirements: [
            {
              requirementId: 'ENT-001-001',
              description: 'Architecture documentation standards',
              compliant: false,
              evidence: []
            },
            {
              requirementId: 'ENT-001-002',
              description: 'Technology stack compliance',
              compliant: false,
              evidence: []
            }
          ]
        },
        {
          standardId: 'ENT-002',
          name: 'Project Management Standards',
          category: 'PROJECT',
          version: '2.0',
          requirements: [
            {
              requirementId: 'ENT-002-001',
              description: 'Project charter requirements',
              compliant: false,
              evidence: []
            },
            {
              requirementId: 'ENT-002-002',
              description: 'Stakeholder engagement standards',
              compliant: false,
              evidence: []
            }
          ]
        }
      ],
      validationRules: [
        {
          ruleId: 'RULE-001',
          name: 'Mandatory Sections Check',
          category: 'STRUCTURE',
          severity: 'HIGH',
          condition: 'Document must contain all mandatory sections',
          action: 'Flag as non-compliant if missing mandatory sections'
        },
        {
          ruleId: 'RULE-002',
          name: 'Quality Threshold Check',
          category: 'QUALITY',
          severity: 'MEDIUM',
          condition: 'Document quality score must be above 70%',
          action: 'Recommend improvements if below threshold'
        }
      ],
      riskThresholds: [
        {
          category: 'GOVERNANCE',
          low: 20,
          medium: 50,
          high: 80,
          critical: 95
        },
        {
          category: 'REGULATORY',
          low: 15,
          medium: 40,
          high: 70,
          critical: 90
        },
        {
          category: 'ENTERPRISE',
          low: 25,
          medium: 55,
          high: 85,
          critical: 95
        }
      ]
    };
  }
}