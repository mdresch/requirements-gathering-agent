/**
 * Compliance-Enhanced Document Generator
 * 
 * Extended document generator that integrates comprehensive compliance validation
 * into the document generation workflow to ensure all generated documents
 * adhere to compliance considerations and enterprise governance policies.
 */

import { DocumentGenerator, GenerationResult, GenerationOptions } from './DocumentGenerator.js';
import { ComplianceValidationService, DocumentComplianceValidation, ComplianceValidationConfig } from '../../services/ComplianceValidationService.js';
import { StandardsComplianceAnalysisEngine } from '../standardsCompliance/StandardsComplianceEngine.js';
import { PMBOKValidator } from '../pmbokValidation/PMBOKValidator.js';
import { logger } from '../../utils/logger.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as fs from 'fs/promises';

export interface ComplianceEnhancedGenerationResult extends GenerationResult {
  complianceValidation: {
    overallComplianceScore: number;
    complianceStatus: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT';
    documentsValidated: number;
    criticalIssues: number;
    recommendations: number;
    complianceReports: string[];
  };
  standardsCompliance: {
    babok: { score: number; status: string };
    pmbok: { score: number; status: string };
    dmbok: { score: number; status: string };
    iso15408: { score: number; status: string };
  };
  governanceCompliance: {
    policyViolations: number;
    regulatoryGaps: number;
    enterpriseDeviations: number;
    riskLevel: string;
  };
}

export interface ComplianceEnhancedOptions extends GenerationOptions {
  enableComplianceValidation?: boolean;
  complianceConfig?: ComplianceValidationConfig;
  generateComplianceReports?: boolean;
  enforceComplianceThresholds?: boolean;
  complianceThreshold?: number; // Minimum compliance score required
}

/**
 * Compliance-Enhanced Document Generator
 */
export class ComplianceEnhancedGenerator extends DocumentGenerator {
  private complianceService: ComplianceValidationService;
  private standardsEngine: StandardsComplianceAnalysisEngine;
  private complianceOptions: ComplianceEnhancedOptions;
  private complianceResults: DocumentComplianceValidation[] = [];

  constructor(
    context: string,
    options: ComplianceEnhancedOptions = {}
  ) {
    super(context, options);
    
    this.complianceOptions = {
      enableComplianceValidation: true,
      generateComplianceReports: true,
      enforceComplianceThresholds: false,
      complianceThreshold: 80,
      ...options
    };

    // Initialize compliance services
    const complianceConfig = options.complianceConfig || ComplianceValidationService.getDefaultConfig();
    this.complianceService = new ComplianceValidationService(complianceConfig);
    
    // Initialize standards compliance engine
    this.standardsEngine = new StandardsComplianceAnalysisEngine({
      enabledStandards: ['BABOK_V3', 'PMBOK_7', 'DMBOK_2', 'ISO_15408'],
      analysisDepth: 'COMPREHENSIVE',
      includeIntelligentDeviations: true,
      generateExecutiveSummary: true,
      customRules: []
    });

    logger.info('🔒 Compliance-Enhanced Document Generator initialized');
  }

  /**
   * Generate all documents with comprehensive compliance validation
   */
  public async generateAllWithCompliance(): Promise<ComplianceEnhancedGenerationResult> {
    logger.info('🚀 Starting compliance-enhanced document generation...');
    
    // Phase 1: Generate documents
    console.log('\n📝 Phase 1: Document Generation');
    const generationResult = await super.generateAll();
    
    if (!generationResult.success) {
      return this.createFailedResult(generationResult, 'Document generation failed');
    }

    // Phase 2: Comprehensive compliance validation
    console.log('\n🔍 Phase 2: Compliance Validation');
    const complianceValidation = await this.performComprehensiveComplianceValidation();
    
    // Phase 3: Standards compliance analysis
    console.log('\n📊 Phase 3: Standards Compliance Analysis');
    const standardsCompliance = await this.performStandardsComplianceAnalysis();
    
    // Phase 4: Generate compliance reports
    console.log('\n📄 Phase 4: Compliance Reporting');
    const complianceReports = await this.generateComplianceReports();
    
    // Phase 5: Validate compliance thresholds
    console.log('\n⚖️ Phase 5: Compliance Threshold Validation');
    const thresholdValidation = await this.validateComplianceThresholds(complianceValidation);
    
    // Create enhanced result
    const enhancedResult: ComplianceEnhancedGenerationResult = {
      ...generationResult,
      complianceValidation,
      standardsCompliance,
      governanceCompliance: {
        policyViolations: this.complianceResults.reduce((sum, result) => 
          sum + result.governancePolicyCompliance.policyViolations.length, 0),
        regulatoryGaps: this.complianceResults.reduce((sum, result) => 
          sum + result.regulatoryCompliance.complianceGaps.length, 0),
        enterpriseDeviations: this.complianceResults.reduce((sum, result) => 
          sum + result.enterpriseStandardsCompliance.deviations.length, 0),
        riskLevel: this.calculateOverallRiskLevel()
      }
    };

    // Log final results
    this.logComplianceResults(enhancedResult);
    
    // Enforce compliance thresholds if enabled
    if (this.complianceOptions.enforceComplianceThresholds && !thresholdValidation.passed) {
      throw new Error(`Compliance validation failed: ${thresholdValidation.message}`);
    }

    return enhancedResult;
  }

  /**
   * Perform comprehensive compliance validation on all generated documents
   */
  private async performComprehensiveComplianceValidation(): Promise<ComplianceEnhancedGenerationResult['complianceValidation']> {
    const documentsDir = this.complianceOptions.outputDir || 'generated-documents';
    const documentFiles = await this.getGeneratedDocuments(documentsDir);
    
    let totalScore = 0;
    let criticalIssues = 0;
    let recommendations = 0;
    const complianceReports: string[] = [];

    for (const documentFile of documentFiles) {
      try {
        const content = await fs.readFile(documentFile.path, 'utf-8');
        const validation = await this.complianceService.validateDocumentCompliance(
          documentFile.key,
          documentFile.category,
          content
        );

        this.complianceResults.push(validation);
        totalScore += validation.complianceScore;
        criticalIssues += validation.issues.filter(issue => issue.severity === 'CRITICAL' || issue.severity === 'HIGH').length;
        recommendations += validation.recommendations.length;

        // Generate individual compliance report
        if (this.complianceOptions.generateComplianceReports) {
          const reportPath = await this.saveIndividualComplianceReport(documentFile.key, validation);
          complianceReports.push(reportPath);
        }

        console.log(`✅ Validated ${documentFile.key}: ${validation.complianceScore}% (${validation.complianceStatus})`);
      } catch (error) {
        logger.error(`❌ Failed to validate ${documentFile.key}:`, error);
        criticalIssues++;
      }
    }

    const overallComplianceScore = documentFiles.length > 0 ? Math.round(totalScore / documentFiles.length) : 0;
    const complianceStatus = this.determineOverallComplianceStatus(overallComplianceScore);

    return {
      overallComplianceScore,
      complianceStatus,
      documentsValidated: documentFiles.length,
      criticalIssues,
      recommendations,
      complianceReports
    };
  }

  /**
   * Perform standards compliance analysis
   */
  private async performStandardsComplianceAnalysis(): Promise<ComplianceEnhancedGenerationResult['standardsCompliance']> {
    try {
      // Create mock project data for standards analysis
      const projectData = {
        projectId: 'current-project',
        projectName: 'Document Generation Project',
        industry: 'TECHNOLOGY',
        projectType: 'DEVELOPMENT',
        complexity: 'MEDIUM',
        duration: 6,
        budget: 500000,
        teamSize: 10,
        stakeholderCount: 15,
        regulatoryRequirements: [],
        methodology: 'AGILE',
        documents: [],
        processes: [],
        deliverables: [],
        governance: {
          hasSteeringCommittee: true,
          hasProjectBoard: true,
          decisionMakingAuthority: 'PROJECT_MANAGER',
          escalationPaths: [],
          workingGroups: []
        },
        metadata: {
          createdDate: new Date(),
          lastModified: new Date(),
          version: '1.0',
          tags: ['compliance', 'documentation'],
          customFields: {}
        }
      };

      // Perform standards analysis
      const analysisRequest = {
        projectData,
        requestedBy: 'Compliance-Enhanced Generator',
        analysisType: 'FULL' as const,
        config: {
          enabledStandards: ['BABOK_V3', 'PMBOK_7', 'DMBOK_2', 'ISO_15408'],
          analysisDepth: 'COMPREHENSIVE' as const,
          includeIntelligentDeviations: true,
          generateExecutiveSummary: true,
          customRules: []
        }
      };

      const analysisResponse = await this.standardsEngine.analyzeProject(analysisRequest);

      if (analysisResponse.status === 'COMPLETED' && analysisResponse.results) {
        const matrix = analysisResponse.results.complianceMatrix;
        return {
          babok: { 
            score: matrix.standards.find(s => s.standard === 'BABOK_V3')?.overallScore || 0,
            status: matrix.standards.find(s => s.standard === 'BABOK_V3')?.complianceStatus || 'NOT_ASSESSED'
          },
          pmbok: { 
            score: matrix.standards.find(s => s.standard === 'PMBOK_7')?.overallScore || 0,
            status: matrix.standards.find(s => s.standard === 'PMBOK_7')?.complianceStatus || 'NOT_ASSESSED'
          },
          dmbok: { 
            score: matrix.standards.find(s => s.standard === 'DMBOK_2')?.overallScore || 0,
            status: matrix.standards.find(s => s.standard === 'DMBOK_2')?.complianceStatus || 'NOT_ASSESSED'
          },
          iso15408: { 
            score: matrix.standards.find(s => s.standard === 'ISO_15408')?.overallScore || 0,
            status: matrix.standards.find(s => s.standard === 'ISO_15408')?.complianceStatus || 'NOT_ASSESSED'
          }
        };
      }
    } catch (error) {
      logger.error('❌ Standards compliance analysis failed:', error);
    }

    // Return default values if analysis fails
    return {
      babok: { score: 0, status: 'NOT_ASSESSED' },
      pmbok: { score: 0, status: 'NOT_ASSESSED' },
      dmbok: { score: 0, status: 'NOT_ASSESSED' },
      iso15408: { score: 0, status: 'NOT_ASSESSED' }
    };
  }

  /**
   * Generate comprehensive compliance reports
   */
  private async generateComplianceReports(): Promise<string[]> {
    const reports: string[] = [];

    try {
      // Generate executive compliance summary
      const executiveSummaryPath = await this.generateExecutiveComplianceSummary();
      reports.push(executiveSummaryPath);

      // Generate detailed compliance analysis report
      const detailedAnalysisPath = await this.generateDetailedComplianceAnalysis();
      reports.push(detailedAnalysisPath);

      // Generate compliance dashboard data
      const dashboardDataPath = await this.generateComplianceDashboardData();
      reports.push(dashboardDataPath);

      console.log(`📊 Generated ${reports.length} compliance reports`);
    } catch (error) {
      logger.error('❌ Failed to generate compliance reports:', error);
    }

    return reports;
  }

  /**
   * Validate compliance thresholds
   */
  private async validateComplianceThresholds(complianceValidation: ComplianceEnhancedGenerationResult['complianceValidation']): Promise<{ passed: boolean; message: string }> {
    const threshold = this.complianceOptions.complianceThreshold || 80;
    
    if (complianceValidation.overallComplianceScore < threshold) {
      return {
        passed: false,
        message: `Overall compliance score ${complianceValidation.overallComplianceScore}% is below required threshold of ${threshold}%`
      };
    }

    if (complianceValidation.criticalIssues > 0) {
      return {
        passed: false,
        message: `Found ${complianceValidation.criticalIssues} critical compliance issues that must be resolved`
      };
    }

    return {
      passed: true,
      message: 'All compliance thresholds met successfully'
    };
  }

  // Helper methods

  private async getGeneratedDocuments(documentsDir: string): Promise<Array<{ key: string; category: string; path: string }>> {
    const documents: Array<{ key: string; category: string; path: string }> = [];
    
    try {
      const categories = await fs.readdir(documentsDir);
      
      for (const category of categories) {
        const categoryPath = join(documentsDir, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          
          for (const file of files) {
            if (file.endsWith('.md')) {
              const key = file.replace('.md', '');
              documents.push({
                key,
                category,
                path: join(categoryPath, file)
              });
            }
          }
        }
      }
    } catch (error) {
      logger.error('❌ Failed to get generated documents:', error);
    }

    return documents;
  }

  private determineOverallComplianceStatus(score: number): 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' {
    if (score >= 95) return 'COMPLIANT';
    if (score >= 70) return 'PARTIALLY_COMPLIANT';
    return 'NON_COMPLIANT';
  }

  private calculateOverallRiskLevel(): string {
    const criticalIssues = this.complianceResults.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === 'CRITICAL').length, 0);
    const highIssues = this.complianceResults.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === 'HIGH').length, 0);

    if (criticalIssues > 0) return 'VERY_HIGH';
    if (highIssues > 3) return 'HIGH';
    if (highIssues > 0) return 'MEDIUM';
    return 'LOW';
  }

  private async saveIndividualComplianceReport(documentKey: string, validation: DocumentComplianceValidation): Promise<string> {
    const reportContent = this.generateIndividualComplianceReportContent(validation);
    const reportPath = join(this.complianceOptions.outputDir || 'generated-documents', 'compliance-reports', `${documentKey}-compliance.md`);
    
    // Ensure compliance reports directory exists
    const reportsDir = join(this.complianceOptions.outputDir || 'generated-documents', 'compliance-reports');
    await fs.mkdir(reportsDir, { recursive: true });
    
    await writeFile(reportPath, reportContent);
    return reportPath;
  }

  private generateIndividualComplianceReportContent(validation: DocumentComplianceValidation): string {
    // Use the same report generation logic from DocumentGenerator
    const timestamp = new Date().toISOString();
    
    return `# Individual Document Compliance Report

**Document:** ${validation.documentId}  
**Document Type:** ${validation.documentType}  
**Validation Date:** ${timestamp}  
**Compliance Score:** ${validation.complianceScore}%  
**Compliance Status:** ${validation.complianceStatus}  

## Summary

This document has been validated against enterprise governance policies, regulatory requirements, and industry standards.

**Key Metrics:**
- Governance Policy Compliance: ${validation.governancePolicyCompliance.overallCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- Regulatory Compliance: ${validation.regulatoryCompliance.overallCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- Enterprise Standards Compliance: ${validation.enterpriseStandardsCompliance.overallCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}

## Issues Identified (${validation.issues.length})

${validation.issues.map(issue => `
### ${issue.description}
- **Category:** ${issue.category}
- **Severity:** ${issue.severity}
- **Impact:** ${issue.impact}
- **Recommendation:** ${issue.recommendation}
`).join('')}

## Recommendations (${validation.recommendations.length})

${validation.recommendations.map(rec => `
### ${rec.description}
- **Priority:** ${rec.priority}
- **Category:** ${rec.category}
- **Timeline:** ${rec.timeline}
- **Benefits:** ${rec.benefits.join(', ')}
`).join('')}

---

*Generated by ADPA Compliance-Enhanced Document Generator*
`;
  }

  private async generateExecutiveComplianceSummary(): Promise<string> {
    const reportPath = join(this.complianceOptions.outputDir || 'generated-documents', 'compliance-reports', 'executive-compliance-summary.md');
    
    const totalDocuments = this.complianceResults.length;
    const averageScore = totalDocuments > 0 ? 
      Math.round(this.complianceResults.reduce((sum, result) => sum + result.complianceScore, 0) / totalDocuments) : 0;
    const criticalIssues = this.complianceResults.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === 'CRITICAL').length, 0);
    const totalRecommendations = this.complianceResults.reduce((sum, result) => sum + result.recommendations.length, 0);

    const content = `# Executive Compliance Summary

**Generated:** ${new Date().toISOString()}  
**Documents Analyzed:** ${totalDocuments}  
**Average Compliance Score:** ${averageScore}%  
**Critical Issues:** ${criticalIssues}  
**Total Recommendations:** ${totalRecommendations}  

## Executive Overview

This report provides a comprehensive overview of compliance validation results for all generated documents. The analysis covers governance policies, regulatory requirements, and enterprise standards to ensure organizational compliance.

## Key Findings

- **Overall Compliance Status:** ${averageScore >= 80 ? '✅ COMPLIANT' : averageScore >= 60 ? '⚠️ PARTIALLY COMPLIANT' : '❌ NON-COMPLIANT'}
- **Risk Level:** ${this.calculateOverallRiskLevel()}
- **Documents Requiring Attention:** ${this.complianceResults.filter(r => r.complianceScore < 70).length}

## Compliance Breakdown by Category

### Governance Policy Compliance
- **Compliant Documents:** ${this.complianceResults.filter(r => r.governancePolicyCompliance.overallCompliance).length}
- **Policy Violations:** ${this.complianceResults.reduce((sum, r) => sum + r.governancePolicyCompliance.policyViolations.length, 0)}

### Regulatory Compliance
- **Compliant Documents:** ${this.complianceResults.filter(r => r.regulatoryCompliance.overallCompliance).length}
- **Compliance Gaps:** ${this.complianceResults.reduce((sum, r) => sum + r.regulatoryCompliance.complianceGaps.length, 0)}

### Enterprise Standards Compliance
- **Compliant Documents:** ${this.complianceResults.filter(r => r.enterpriseStandardsCompliance.overallCompliance).length}
- **Standards Deviations:** ${this.complianceResults.reduce((sum, r) => sum + r.enterpriseStandardsCompliance.deviations.length, 0)}

## Recommendations

1. **Immediate Actions:** Address all critical compliance issues
2. **Short-term:** Implement recommended improvements for high-priority items
3. **Long-term:** Establish continuous compliance monitoring processes

---

*Generated by ADPA Compliance-Enhanced Document Generator*
`;

    await writeFile(reportPath, content);
    return reportPath;
  }

  private async generateDetailedComplianceAnalysis(): Promise<string> {
    const reportPath = join(this.complianceOptions.outputDir || 'generated-documents', 'compliance-reports', 'detailed-compliance-analysis.md');
    
    const content = `# Detailed Compliance Analysis Report

**Generated:** ${new Date().toISOString()}  

## Document-by-Document Analysis

${this.complianceResults.map(result => `
### ${result.documentId}

**Compliance Score:** ${result.complianceScore}%  
**Status:** ${result.complianceStatus}  
**Issues:** ${result.issues.length}  
**Recommendations:** ${result.recommendations.length}  

#### Governance Policy Compliance
- Overall: ${result.governancePolicyCompliance.overallCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- Policy Checks: ${result.governancePolicyCompliance.policyChecks.length}
- Violations: ${result.governancePolicyCompliance.policyViolations.length}

#### Regulatory Compliance
- Overall: ${result.regulatoryCompliance.overallCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- Applicable Regulations: ${result.regulatoryCompliance.applicableRegulations.length}
- Compliance Gaps: ${result.regulatoryCompliance.complianceGaps.length}

#### Enterprise Standards Compliance
- Overall: ${result.enterpriseStandardsCompliance.overallCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- Standards Checked: ${result.enterpriseStandardsCompliance.standardsChecks.length}
- Deviations: ${result.enterpriseStandardsCompliance.deviations.length}

---
`).join('')}

## Summary Statistics

- **Total Documents:** ${this.complianceResults.length}
- **Average Score:** ${this.complianceResults.length > 0 ? Math.round(this.complianceResults.reduce((sum, r) => sum + r.complianceScore, 0) / this.complianceResults.length) : 0}%
- **Fully Compliant:** ${this.complianceResults.filter(r => r.complianceStatus === 'FULLY_COMPLIANT').length}
- **Partially Compliant:** ${this.complianceResults.filter(r => r.complianceStatus === 'PARTIALLY_COMPLIANT').length}
- **Non-Compliant:** ${this.complianceResults.filter(r => r.complianceStatus === 'NON_COMPLIANT').length}

---

*Generated by ADPA Compliance-Enhanced Document Generator*
`;

    await writeFile(reportPath, content);
    return reportPath;
  }

  private async generateComplianceDashboardData(): Promise<string> {
    const reportPath = join(this.complianceOptions.outputDir || 'generated-documents', 'compliance-reports', 'compliance-dashboard-data.json');
    
    const dashboardData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDocuments: this.complianceResults.length,
        averageScore: this.complianceResults.length > 0 ? 
          Math.round(this.complianceResults.reduce((sum, r) => sum + r.complianceScore, 0) / this.complianceResults.length) : 0,
        criticalIssues: this.complianceResults.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'CRITICAL').length, 0),
        totalRecommendations: this.complianceResults.reduce((sum, r) => sum + r.recommendations.length, 0)
      },
      complianceBreakdown: {
        governance: {
          compliant: this.complianceResults.filter(r => r.governancePolicyCompliance.overallCompliance).length,
          violations: this.complianceResults.reduce((sum, r) => sum + r.governancePolicyCompliance.policyViolations.length, 0)
        },
        regulatory: {
          compliant: this.complianceResults.filter(r => r.regulatoryCompliance.overallCompliance).length,
          gaps: this.complianceResults.reduce((sum, r) => sum + r.regulatoryCompliance.complianceGaps.length, 0)
        },
        enterprise: {
          compliant: this.complianceResults.filter(r => r.enterpriseStandardsCompliance.overallCompliance).length,
          deviations: this.complianceResults.reduce((sum, r) => sum + r.enterpriseStandardsCompliance.deviations.length, 0)
        }
      },
      documentResults: this.complianceResults.map(result => ({
        documentId: result.documentId,
        documentType: result.documentType,
        complianceScore: result.complianceScore,
        complianceStatus: result.complianceStatus,
        issuesCount: result.issues.length,
        recommendationsCount: result.recommendations.length
      }))
    };

    await writeFile(reportPath, JSON.stringify(dashboardData, null, 2));
    return reportPath;
  }

  private createFailedResult(generationResult: GenerationResult, message: string): ComplianceEnhancedGenerationResult {
    return {
      ...generationResult,
      complianceValidation: {
        overallComplianceScore: 0,
        complianceStatus: 'NON_COMPLIANT',
        documentsValidated: 0,
        criticalIssues: 1,
        recommendations: 0,
        complianceReports: []
      },
      standardsCompliance: {
        babok: { score: 0, status: 'NOT_ASSESSED' },
        pmbok: { score: 0, status: 'NOT_ASSESSED' },
        dmbok: { score: 0, status: 'NOT_ASSESSED' },
        iso15408: { score: 0, status: 'NOT_ASSESSED' }
      },
      governanceCompliance: {
        policyViolations: 0,
        regulatoryGaps: 0,
        enterpriseDeviations: 0,
        riskLevel: 'HIGH'
      }
    };
  }

  private logComplianceResults(result: ComplianceEnhancedGenerationResult): void {
    console.log('\n📊 Compliance Validation Complete');
    console.log('=====================================');
    console.log(`🎯 Overall Compliance Score: ${result.complianceValidation.overallComplianceScore}%`);
    console.log(`📋 Compliance Status: ${result.complianceValidation.complianceStatus}`);
    console.log(`📄 Documents Validated: ${result.complianceValidation.documentsValidated}`);
    console.log(`🚨 Critical Issues: ${result.complianceValidation.criticalIssues}`);
    console.log(`💡 Recommendations: ${result.complianceValidation.recommendations}`);
    console.log(`⚖️ Risk Level: ${result.governanceCompliance.riskLevel}`);
    
    console.log('\n📊 Standards Compliance:');
    console.log(`   BABOK v3: ${result.standardsCompliance.babok.score}% (${result.standardsCompliance.babok.status})`);
    console.log(`   PMBOK 7th: ${result.standardsCompliance.pmbok.score}% (${result.standardsCompliance.pmbok.status})`);
    console.log(`   DMBOK 2.0: ${result.standardsCompliance.dmbok.score}% (${result.standardsCompliance.dmbok.status})`);
    console.log(`   ISO 15408: ${result.standardsCompliance.iso15408.score}% (${result.standardsCompliance.iso15408.status})`);
    
    console.log('\n📋 Governance Compliance:');
    console.log(`   Policy Violations: ${result.governanceCompliance.policyViolations}`);
    console.log(`   Regulatory Gaps: ${result.governanceCompliance.regulatoryGaps}`);
    console.log(`   Enterprise Deviations: ${result.governanceCompliance.enterpriseDeviations}`);
    
    if (result.complianceValidation.complianceReports.length > 0) {
      console.log('\n📄 Compliance Reports Generated:');
      result.complianceValidation.complianceReports.forEach(report => {
        console.log(`   📄 ${report}`);
      });
    }
  }
}

export const complianceEnhancedGeneratorVersion = '1.0.0';