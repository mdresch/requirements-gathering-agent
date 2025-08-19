import { StandardsComplianceAnalysisEngine } from '../modules/standardsCompliance/StandardsComplianceEngine.js';
import { ExecutiveSummary } from '../types/standardsCompliance.js';
import { PMBOKValidator } from '../modules/pmbokValidation/PMBOKValidator.js';
import type { 
  ProjectData, 
  AnalysisRequest, 
  DeviationAnalysis,
  StandardsComplianceConfig,
  RiskLevel,
  ComplianceResult
} from '../types/standardsCompliance.js';

/**
 * Enhanced Risk and Compliance Assessment Service
 * 
 * This service provides comprehensive risk and compliance assessment capabilities
 * by integrating risk management with multi-standard compliance evaluation.
 */
export class RiskComplianceAssessmentService {
  private complianceEngine: StandardsComplianceAnalysisEngine;
  private pmbokValidator: PMBOKValidator;

  constructor() {
    const config: StandardsComplianceConfig = {
      enabledStandards: ['PMBOK_7', 'BABOK_V3', 'DMBOK_2', 'ISO_15408'],
      analysisDepth: 'COMPREHENSIVE',
      intelligentDeviationThreshold: 75,
      riskToleranceLevel: 'MEDIUM',
      includeRecommendations: true,
      generateExecutiveSummary: true,
      outputFormat: 'JSON'
    };
    
    this.complianceEngine = new StandardsComplianceAnalysisEngine(config);
    this.pmbokValidator = new PMBOKValidator();
  }

  /**
   * Performs comprehensive risk and compliance assessment
   */
  async performIntegratedAssessment(projectData: ProjectData): Promise<IntegratedAssessmentResult> {
    try {
      // Perform compliance analysis
      const complianceResults = await this.performComplianceAnalysis(projectData);
      
      // Perform risk assessment
      const riskAssessment = await this.performRiskAssessment(projectData, complianceResults);
      
      // Generate integrated analysis
      const integratedAnalysis = await this.generateIntegratedAnalysis(
        projectData, 
        complianceResults, 
        riskAssessment
      );
      
      // Generate executive summary
      const executiveSummary = await this.generateExecutiveSummary(integratedAnalysis);
      
      return {
        projectId: projectData.projectId,
        assessmentDate: new Date(),
        complianceResults,
        riskAssessment,
        integratedAnalysis,
        executiveSummary,
        recommendations: await this.generateRecommendations(integratedAnalysis),
        overallRiskLevel: this.calculateOverallRiskLevel(riskAssessment, complianceResults),
        complianceScore: this.calculateOverallComplianceScore(complianceResults)
      };
    } catch (error) {
      console.error('Error performing integrated assessment:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to perform integrated risk and compliance assessment: ${error.message}`);
      } else {
        throw new Error('Failed to perform integrated risk and compliance assessment: Unknown error');
      }
    }
  }

  /**
   * Performs multi-standard compliance analysis
   */
  private async performComplianceAnalysis(projectData: ProjectData): Promise<ComplianceResult[]> {
    const results: ComplianceResult[] = [];
    
    try {
      // PMBOK 7.0 Analysis
      const pmbokResult = await this.complianceEngine.validateAgainstPMBOK(projectData);
      results.push(pmbokResult);
      
      // BABOK v3 Analysis (if applicable)
      if (this.isBABOKApplicable(projectData)) {
        const babokResult = await this.complianceEngine.validateAgainstBABOK(projectData);
        results.push(babokResult);
      }
      
      // DMBOK 2.0 Analysis (if applicable)
      if (this.isDMBOKApplicable(projectData)) {
        const dmbokResult = await this.complianceEngine.validateAgainstDMBOK(projectData);
        results.push(dmbokResult);
      }
      
      // ISO 15408 Analysis (if applicable)
      if (this.isISO15408Applicable(projectData)) {
        const isoResult = await this.complianceEngine.validateAgainstISO15408(projectData);
        results.push(isoResult);
      }
      
      return results;
    } catch (error) {
      console.error('Error in compliance analysis:', error);
      throw error;
    }
  }

  /**
   * Performs comprehensive risk assessment
   */
  private async performRiskAssessment(
    projectData: ProjectData, 
    complianceResults: ComplianceResult[]
  ): Promise<RiskAssessmentResult> {
    const risks: ProjectRisk[] = [];
    
    // Identify risks from project characteristics
    risks.push(...await this.identifyProjectRisks(projectData));
    
    // Identify risks from compliance gaps
    risks.push(...await this.identifyComplianceRisks(complianceResults));
    
    // Assess and prioritize risks
    const assessedRisks = await this.assessRisks(risks, projectData);
    
    // Generate risk response strategies
    const responseStrategies = await this.generateRiskResponseStrategies(assessedRisks);
    
    return {
      risks: assessedRisks,
      riskMatrix: this.generateRiskMatrix(assessedRisks),
      responseStrategies,
      overallRiskLevel: this.calculateProjectRiskLevel(assessedRisks),
      keyRiskIndicators: this.identifyKeyRiskIndicators(assessedRisks)
    };
  }

  /**
   * Generates integrated analysis combining risk and compliance
   */
  private async generateIntegratedAnalysis(
    projectData: ProjectData,
    complianceResults: ComplianceResult[],
    riskAssessment: RiskAssessmentResult
  ): Promise<DeviationAnalysis> {
    const analysisRequest: AnalysisRequest = {
      requestId: `integrated-${projectData.projectId}-${Date.now()}`,
      projectData,
      enabledStandards: ['PMBOK_7', 'BABOK_V3', 'DMBOK_2', 'ISO_15408'],
      analysisOptions: {
        includeIntelligentDeviations: true,
        includeCrossStandardAnalysis: true,
        generateExecutiveSummary: true,
        detailLevel: 'COMPREHENSIVE',
        riskAssessmentLevel: 'COMPREHENSIVE'
      },
      requestDate: new Date(),
      requestor: 'RiskComplianceAssessmentService'
    };

    return await this.complianceEngine.generateDeviationAnalysis(complianceResults);
  }

  /**
   * Identifies risks specific to project characteristics
   */
  private async identifyProjectRisks(projectData: ProjectData): Promise<ProjectRisk[]> {
    const risks: ProjectRisk[] = [];
    
    // Strategic risks
    if (projectData.complexity === 'VERY_HIGH') {
      risks.push({
        id: 'STR-001',
        category: 'STRATEGIC',
        description: 'High project complexity may lead to scope creep and stakeholder misalignment',
        probability: 'HIGH',
        impact: 'MAJOR',
        riskLevel: 'HIGH'
      });
    }
    
    // Operational risks
    if (projectData.teamSize > 50) {
      risks.push({
        id: 'OPR-001',
        category: 'OPERATIONAL',
        description: 'Large team size increases communication and coordination risks',
        probability: 'MEDIUM',
        impact: 'MODERATE',
        riskLevel: 'MEDIUM'
      });
    }
    
    // Financial risks
    if (projectData.budget > 1000000) {
      risks.push({
        id: 'FIN-001',
        category: 'FINANCIAL',
        description: 'High budget project increases financial oversight and cost control risks',
        probability: 'MEDIUM',
        impact: 'MAJOR',
        riskLevel: 'HIGH'
      });
    }
    
    // Regulatory risks
    if (projectData.regulatoryRequirements.length > 0) {
      risks.push({
        id: 'REG-001',
        category: 'REGULATORY',
        description: 'Multiple regulatory requirements increase compliance and audit risks',
        probability: 'MEDIUM',
        impact: 'MAJOR',
        riskLevel: 'HIGH'
      });
    }
    
    return risks;
  }

  /**
   * Identifies risks from compliance gaps
   */
  private async identifyComplianceRisks(complianceResults: ComplianceResult[]): Promise<ProjectRisk[]> {
    const risks: ProjectRisk[] = [];
    
    for (const result of complianceResults) {
      if (result.overallScore < 70) {
        risks.push({
          id: `COMP-${result.standard}`,
          category: 'COMPLIANCE',
          description: `Low compliance score (${result.overallScore}%) for ${result.standard} creates regulatory and operational risks`,
          probability: 'HIGH',
          impact: 'MAJOR',
          riskLevel: 'HIGH'
        });
      }
      
      // Add risks for critical issues
      result.criticalIssues.forEach((issue, index) => {
        risks.push({
          id: `COMP-${result.standard}-${index + 1}`,
          category: 'COMPLIANCE',
          description: `Critical compliance issue: ${issue.description}`,
          probability: 'HIGH',
          impact: issue.impact,
          riskLevel: this.mapImpactToRiskLevel(issue.impact)
        });
      });
    }
    
    return risks;
  }

  /**
   * Utility methods
   */
  private isBABOKApplicable(projectData: ProjectData): boolean {
    return projectData.projectType === 'BUSINESS_TRANSFORMATION' || 
           projectData.documents.some(doc => doc.type === 'REQUIREMENTS');
  }

  private isDMBOKApplicable(projectData: ProjectData): boolean {
    return projectData.projectType === 'DATA_MIGRATION' ||
           projectData.documents.some(doc => doc.name.toLowerCase().includes('data'));
  }

  private isISO15408Applicable(projectData: ProjectData): boolean {
    return projectData.regulatoryRequirements.some(req => 
      req.name.toLowerCase().includes('security') || 
      req.name.toLowerCase().includes('iso')
    );
  }

  private calculateOverallRiskLevel(
    riskAssessment: RiskAssessmentResult, 
    complianceResults: ComplianceResult[]
  ): RiskLevel {
    const riskScore = riskAssessment.overallRiskLevel;
    const avgComplianceScore = complianceResults.reduce((sum, result) => sum + result.overallScore, 0) / complianceResults.length;
    
    if (riskScore === 'VERY_HIGH' || avgComplianceScore < 50) return 'VERY_HIGH';
    if (riskScore === 'HIGH' || avgComplianceScore < 70) return 'HIGH';
    if (riskScore === 'MEDIUM' || avgComplianceScore < 85) return 'MEDIUM';
    if (riskScore === 'LOW' || avgComplianceScore < 95) return 'LOW';
    return 'VERY_LOW';
  }

  private calculateOverallComplianceScore(complianceResults: ComplianceResult[]): number {
    if (complianceResults.length === 0) return 0;
    return complianceResults.reduce((sum, result) => sum + result.overallScore, 0) / complianceResults.length;
  }

  private mapImpactToRiskLevel(impact: string): RiskLevel {
    switch (impact) {
      case 'SEVERE': return 'VERY_HIGH';
      case 'MAJOR': return 'HIGH';
      case 'MODERATE': return 'MEDIUM';
      case 'MINOR': return 'LOW';
      default: return 'VERY_LOW';
    }
  }

  private async assessRisks(risks: ProjectRisk[], projectData: ProjectData): Promise<ProjectRisk[]> {
    // Enhanced risk assessment logic would go here
    return risks;
  }

  private generateRiskMatrix(risks: ProjectRisk[]): RiskMatrix {
    // Risk matrix generation logic
    return {
      highRisks: risks.filter(r => r.riskLevel === 'VERY_HIGH' || r.riskLevel === 'HIGH'),
      mediumRisks: risks.filter(r => r.riskLevel === 'MEDIUM'),
      lowRisks: risks.filter(r => r.riskLevel === 'LOW' || r.riskLevel === 'VERY_LOW')
    };
  }

  private async generateRiskResponseStrategies(risks: ProjectRisk[]): Promise<RiskResponseStrategy[]> {
    // Risk response strategy generation logic
    return [];
  }

  private calculateProjectRiskLevel(risks: ProjectRisk[]): RiskLevel {
    const highRiskCount = risks.filter(r => r.riskLevel === 'VERY_HIGH' || r.riskLevel === 'HIGH').length;
    const totalRisks = risks.length;
    
    if (totalRisks === 0) return 'VERY_LOW';
    
    const highRiskRatio = highRiskCount / totalRisks;
    
    if (highRiskRatio > 0.5) return 'VERY_HIGH';
    if (highRiskRatio > 0.3) return 'HIGH';
    if (highRiskRatio > 0.1) return 'MEDIUM';
    if (highRiskRatio > 0) return 'LOW';
    return 'VERY_LOW';
  }

  private identifyKeyRiskIndicators(risks: ProjectRisk[]): KeyRiskIndicator[] {
    // KRI identification logic
    return [];
  }

  private async generateRecommendations(analysis: DeviationAnalysis): Promise<AssessmentRecommendation[]> {
    // Recommendation generation logic
    return [];
  }

  private async generateExecutiveSummary(analysis: DeviationAnalysis): Promise<ExecutiveSummary> {
    return await this.complianceEngine.generateExecutiveSummary(analysis);
  }
}

// Supporting interfaces
export interface IntegratedAssessmentResult {
  projectId: string;
  assessmentDate: Date;
  complianceResults: ComplianceResult[];
  riskAssessment: RiskAssessmentResult;
  integratedAnalysis: DeviationAnalysis;
  executiveSummary: any;
  recommendations: AssessmentRecommendation[];
  overallRiskLevel: RiskLevel;
  complianceScore: number;
}

export interface RiskAssessmentResult {
  risks: ProjectRisk[];
  riskMatrix: RiskMatrix;
  responseStrategies: RiskResponseStrategy[];
  overallRiskLevel: RiskLevel;
  keyRiskIndicators: KeyRiskIndicator[];
}

export interface ProjectRisk {
  id: string;
  category: 'STRATEGIC' | 'OPERATIONAL' | 'TECHNICAL' | 'FINANCIAL' | 'REGULATORY' | 'REPUTATIONAL' | 'COMPLIANCE';
  description: string;
  probability: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  impact: 'NEGLIGIBLE' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE';
  riskLevel: RiskLevel;
}

export interface RiskMatrix {
  highRisks: ProjectRisk[];
  mediumRisks: ProjectRisk[];
  lowRisks: ProjectRisk[];
}

export interface RiskResponseStrategy {
  riskId: string;
  strategy: 'AVOID' | 'MITIGATE' | 'TRANSFER' | 'ACCEPT';
  actions: string[];
  owner: string;
  timeline: string;
  cost: number;
}

export interface KeyRiskIndicator {
  name: string;
  description: string;
  metric: string;
  threshold: string;
  frequency: string;
}

export interface AssessmentRecommendation {
  id: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  description: string;
  rationale: string;
  implementation: string[];
  timeline: string;
  resources: string[];
}