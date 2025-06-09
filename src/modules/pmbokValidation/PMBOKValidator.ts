/**
 * PMBOK Validator
 * Handles validation of documents against PMBOK standards
 */
import * as fs from 'fs/promises';
import { 
    PMBOKComplianceResult, 
    DocumentQualityAssessment, 
    ComprehensiveValidationResult 
} from './types.js';
import { 
    PMBOK_DOCUMENT_REQUIREMENTS, 
    PMBOK_TERMINOLOGY, 
    QUALITY_THRESHOLDS, 
    QUALITY_SCORING,
    PMBOK_PERFORMANCE_DOMAINS,
    PMBOK_PRINCIPLES,
    VALUE_DELIVERY_SYSTEM,
    QUALITY_METRICS_REQUIREMENTS,
    RISK_MANAGEMENT_REQUIREMENTS,
    STAKEHOLDER_ENGAGEMENT_REQUIREMENTS,
    PROJECT_LIFECYCLE_REQUIREMENTS,
    RESOURCE_MANAGEMENT_REQUIREMENTS,
    COMMUNICATION_REQUIREMENTS,
    CHANGE_MANAGEMENT_REQUIREMENTS,
    KNOWLEDGE_MANAGEMENT_REQUIREMENTS,
    SUSTAINABILITY_REQUIREMENTS,
    DIGITAL_TRANSFORMATION_REQUIREMENTS
} from './validationRules.js';

// Add missing constant
const MIN_QUALITY_SCORE = 70;

/**
 * Class responsible for validating document compliance with PMBOK 7.0 standards
 */
export class PMBOKValidator {
    private documentsBasePath: string;

    /**
     * Create a new PMBOK validator
     * @param documentsBasePath Base path for document files
     */
    constructor(documentsBasePath: string = 'generated-documents') {
        this.documentsBasePath = documentsBasePath;
    }

    /**
     * Validate document generation (existence check)
     * @param documentKeys Array of document keys to check
     * @returns Validation result with missing files
     */
    public async validateGeneration(documentKeys: string[]): Promise<{ 
        isComplete: boolean; 
        missing: string[]; 
        errors: string[] 
    }> {
        const validation = {
            isComplete: true,
            missing: [] as string[],
            errors: [] as string[]
        };

        // Check if all expected documents exist
        for (const key of documentKeys) {
            const requirements = PMBOK_DOCUMENT_REQUIREMENTS[key];
            if (!requirements) continue;
            
            const expectedPath = `${this.documentsBasePath}/${requirements.category}/${key}.md`;
            
            try {
                await fs.access(expectedPath);
                console.log(`✅ Found: ${key}`);
            } catch (error) {
                validation.missing.push(`${key} (${expectedPath})`);
                validation.isComplete = false;
            }
        }

        // Check for README.md
        try {
            await fs.access(`${this.documentsBasePath}/README.md`);
            console.log(`✅ Found: Documentation Index`);
        } catch (error) {
            validation.missing.push('Documentation Index (README.md)');
            validation.isComplete = false;
        }

        return validation;
    }

    /**
     * Validate PMBOK compliance for documents
     * @returns Comprehensive validation result
     */
    public async validatePMBOKCompliance(): Promise<PMBOKComplianceResult> {
        console.log('\n📋 Starting PMBOK 7.0 Compliance Validation...');
        
        const validation: PMBOKComplianceResult = {
            compliance: true,
            consistencyScore: 0,
            findings: {
                critical: [],
                warnings: [],
                recommendations: []
            },
            documentQuality: {}
        };

        try {
            console.log(`Base path: ${this.documentsBasePath}`);
            const files = await fs.readdir(this.documentsBasePath);
            console.log('Available directories:', files);
            
            await Promise.all(
                Object.entries(PMBOK_DOCUMENT_REQUIREMENTS).map(async ([docKey, requirements]) => {
                    const filePath = `${this.documentsBasePath}/${requirements.category}/${docKey}.md`;
                    console.log(`Checking file: ${filePath}`);
                    try {
                        const content = await fs.readFile(filePath, 'utf-8');
                        console.log(`Successfully read: ${filePath}`);
                        const quality = await this.assessDocumentQuality(content);
                        validation.documentQuality[docKey] = quality;

                        if (quality.score < MIN_QUALITY_SCORE) {
                            validation.compliance = false;
                            validation.findings.critical.push(`Document ${docKey} does not meet quality standards (score: ${quality.score})`);
                        }

                        // Check for critical PMBOK elements
                        for (const element of requirements.required) {
                            if (!this.contentContainsElement(content, element)) {
                                validation.findings.critical.push(`${docKey}: Missing required PMBOK element '${element}'`);
                                validation.compliance = false;
                            }
                        }

                        return { docKey, quality };
                    } catch (error) {
                        console.error(`Error reading ${filePath}:`, error);
                        validation.findings.critical.push(`Document ${docKey} not found or could not be read`);
                        validation.compliance = false;
                        validation.documentQuality[docKey] = { score: 0, issues: ['Document not found'], strengths: [] };
                        return { docKey, quality: { score: 0, issues: ['Document not found'], strengths: [] } };
                    }
                })
            );

            // Cross-document consistency checks
            await this.validateCrossDocumentConsistency(validation);

            // Calculate overall consistency score
            validation.consistencyScore = this.calculateConsistencyScore(validation);

            // Generate PMBOK 7.0 specific recommendations
            this.generatePMBOKRecommendations(validation);

            this.printPMBOKValidationReport(validation);
            
            return validation;
        } catch (error) {
            validation.compliance = false;
            validation.findings.critical.push('Error reading documents directory');
            return validation;
        }
    }

    /**
     * Perform a comprehensive validation including both existence and PMBOK compliance
     * @param documentKeys Array of document keys to check
     * @returns Comprehensive validation result
     */
    public async performComprehensiveValidation(documentKeys: string[]): Promise<ComprehensiveValidationResult> {
        // Basic validation
        console.log('\n🔍 Validating document generation...');
        const basicValidation = await this.validateGeneration(documentKeys);
        
        // PMBOK 7.0 compliance validation
        const pmbokCompliance = await this.validatePMBOKCompliance();
        
        // Summary report
        console.log('\n📋 Final Validation Summary:');
        console.log(`✅ Files Present: ${basicValidation.isComplete ? 'All' : 'Some missing'}`);
        console.log(`📊 PMBOK Compliance: ${pmbokCompliance.compliance ? 'Compliant' : 'Non-compliant'}`);
        console.log(`🎯 Consistency Score: ${pmbokCompliance.consistencyScore}/100`);
        
        return { 
            validation: basicValidation, 
            pmbokCompliance 
        };
    }

    /**
     * Assess document quality based on PMBOK 7.0 standards
     * @param content Document content
     * @returns Document quality assessment
     */
    private async assessDocumentQuality(content: string): Promise<{ score: number; issues: string[]; strengths: string[] }> {
        const issues: string[] = [];
        const strengths: string[] = [];
        let score = 0;

        // Basic quality checks
        if (content.length < QUALITY_THRESHOLDS.BRIEF_CONTENT_LENGTH) {
            issues.push('Content is too brief');
        } else if (content.length >= QUALITY_THRESHOLDS.COMPREHENSIVE_CONTENT_LENGTH) {
            strengths.push('Comprehensive content coverage');
            score += QUALITY_SCORING.COMPREHENSIVE_CONTENT_POINTS;
        }

        const sections = content.split('\n\n').filter(section => section.trim().length > 0);
        if (sections.length < QUALITY_THRESHOLDS.MIN_SECTION_COUNT) {
            issues.push('Insufficient section structure');
        } else {
            strengths.push('Well-structured with multiple sections');
            score += QUALITY_SCORING.GOOD_STRUCTURE_POINTS;
        }

        const pmbokTerms = PMBOK_TERMINOLOGY.filter(term => 
            content.toLowerCase().includes(term.toLowerCase())
        );
        if (pmbokTerms.length < QUALITY_THRESHOLDS.MIN_PMBOK_TERMS) {
            issues.push('Insufficient PMBOK terminology usage');
        } else {
            strengths.push(`Uses appropriate PMBOK terminology (${pmbokTerms.length} terms found)`);
            score += QUALITY_SCORING.PMBOK_TERMINOLOGY_POINTS;
        }

        // PMBOK 7.0 specific checks
        const performanceDomains = await this.validatePerformanceDomains(content);
        const principles = await this.validatePrinciples(content);
        const valueDelivery = await this.validateValueDelivery(content);
        const qualityMetrics = await this.validateQualityMetrics(content);
        const riskManagement = await this.validateRiskManagement(content);
        const stakeholderEngagement = await this.validateStakeholderEngagement(content);
        const projectLifecycle = await this.validateProjectLifecycle(content);
        const resourceManagement = await this.validateResourceManagement(content);
        const communication = await this.validateCommunication(content);
        const changeManagement = await this.validateChangeManagement(content);
        const knowledgeManagement = await this.validateKnowledgeManagement(content);
        const sustainability = await this.validateSustainability(content);
        const digitalTransformation = await this.validateDigitalTransformation(content);

        // Add findings to issues
        [
            performanceDomains,
            principles,
            valueDelivery,
            qualityMetrics,
            riskManagement,
            stakeholderEngagement,
            projectLifecycle,
            resourceManagement,
            communication,
            changeManagement,
            knowledgeManagement,
            sustainability,
            digitalTransformation
        ].forEach(result => {
            issues.push(...result.findings);
        });

        // Calculate weighted score
        score += performanceDomains.score * QUALITY_SCORING.PERFORMANCE_DOMAIN_WEIGHT;
        score += principles.score * QUALITY_SCORING.PRINCIPLES_WEIGHT;
        score += valueDelivery.score * QUALITY_SCORING.VALUE_DELIVERY_WEIGHT;
        score += qualityMetrics.score * QUALITY_SCORING.QUALITY_METRICS_WEIGHT;
        score += riskManagement.score * QUALITY_SCORING.RISK_MANAGEMENT_WEIGHT;
        score += stakeholderEngagement.score * QUALITY_SCORING.STAKEHOLDER_ENGAGEMENT_WEIGHT;
        score += projectLifecycle.score * QUALITY_SCORING.LIFECYCLE_INTEGRATION_WEIGHT;
        score += resourceManagement.score * QUALITY_SCORING.RESOURCE_MANAGEMENT_WEIGHT;
        score += communication.score * QUALITY_SCORING.COMMUNICATION_WEIGHT;
        score += changeManagement.score * QUALITY_SCORING.CHANGE_MANAGEMENT_WEIGHT;
        score += knowledgeManagement.score * QUALITY_SCORING.KNOWLEDGE_MANAGEMENT_WEIGHT;
        score += sustainability.score * QUALITY_SCORING.SUSTAINABILITY_WEIGHT;
        score += digitalTransformation.score * QUALITY_SCORING.DIGITAL_TRANSFORMATION_WEIGHT;

        // Add strengths based on high scores
        if (performanceDomains.score >= 80) strengths.push('Strong performance domain coverage');
        if (principles.score >= 80) strengths.push('Well-aligned with PMBOK principles');
        if (valueDelivery.score >= 80) strengths.push('Comprehensive value delivery approach');
        if (qualityMetrics.score >= 80) strengths.push('Robust quality metrics implementation');
        if (riskManagement.score >= 80) strengths.push('Thorough risk management approach');
        if (stakeholderEngagement.score >= 80) strengths.push('Effective stakeholder engagement strategy');
        if (projectLifecycle.score >= 80) strengths.push('Clear project lifecycle integration');
        if (resourceManagement.score >= 80) strengths.push('Comprehensive resource management');
        if (communication.score >= 80) strengths.push('Well-defined communication approach');
        if (changeManagement.score >= 80) strengths.push('Strong change management framework');
        if (knowledgeManagement.score >= 80) strengths.push('Effective knowledge management');
        if (sustainability.score >= 80) strengths.push('Strong sustainability considerations');
        if (digitalTransformation.score >= 80) strengths.push('Robust digital transformation approach');

        return {
            score: Math.min(Math.round(score), QUALITY_THRESHOLDS.PERFECT_SCORE),
            issues,
            strengths
        };
    }

    /**
     * Check if content contains a specific element
     * @param content Document content
     * @param element Element to check for
     * @returns Whether element is in content
     */
    private contentContainsElement(content: string, element: string): boolean {
        const contentLower = content.toLowerCase();
        const elementLower = element.toLowerCase();
        
        // Check for exact phrase or key words from the element
        const keywords = elementLower.split(' ');
        return keywords.every(keyword => contentLower.includes(keyword)) ||
               contentLower.includes(elementLower);
    }

    /**
     * Validate consistency across documents
     * @param validation Validation result object to update
     */
    private async validateCrossDocumentConsistency(validation: PMBOKComplianceResult): Promise<void> {
        console.log('🔍 Checking cross-document consistency...');
        
        try {
            // Check project name consistency
            const projectCharterPath = `${this.documentsBasePath}/project-charter/project-charter.md`;
            const scopePlanPath = `${this.documentsBasePath}/management-plans/scope-management-plan.md`;
            
            const charterContent = await fs.readFile(projectCharterPath, 'utf-8').catch(() => '');
            const scopeContent = await fs.readFile(scopePlanPath, 'utf-8').catch(() => '');
            
            if (charterContent && scopeContent) {
                // Extract project names (simplified check)
                const charterProjectMatch = charterContent.match(/project\s+name[:\s]+([^\n\r]+)/i);
                const scopeProjectMatch = scopeContent.match(/project[:\s]+([^\n\r]+)/i);
                
                if (charterProjectMatch && scopeProjectMatch) {
                    const charterProject = charterProjectMatch[1].trim();
                    const scopeProject = scopeProjectMatch[1].trim();
                    
                    if (charterProject !== scopeProject) {
                        validation.findings.warnings.push('Project name inconsistency between charter and scope plan');
                    }
                }
            }

            // Check stakeholder consistency
            const stakeholderRegisterPath = `${this.documentsBasePath}/stakeholder-management/stakeholder-register.md`;
            const stakeholderPlanPath = `${this.documentsBasePath}/stakeholder-management/stakeholder-engagement-plan.md`;
            
            const registerContent = await fs.readFile(stakeholderRegisterPath, 'utf-8').catch(() => '');
            const planContent = await fs.readFile(stakeholderPlanPath, 'utf-8').catch(() => '');
            
            if (registerContent && planContent) {
                // Check if stakeholders mentioned in plan are in register
                const stakeholderMatches = planContent.match(/stakeholder[s]?\s*[:\-]?\s*([^\n\r]+)/gi);
                if (stakeholderMatches && !registerContent.includes('stakeholder')) {
                    validation.findings.warnings.push('Stakeholder engagement plan references stakeholders not clearly defined in register');
                }
            }

        } catch (error) {
            validation.findings.warnings.push('Could not perform all consistency checks due to file access issues');
        }
    }

    /**
     * Calculate consistency score based on findings
     * @param validation Validation result
     * @returns Consistency score (0-100)
     */
    private calculateConsistencyScore(validation: PMBOKComplianceResult): number {
        let score = 100;
        
        // Deduct points for issues
        score -= validation.findings.critical.length * QUALITY_SCORING.CRITICAL_ISSUE_PENALTY;
        score -= validation.findings.warnings.length * QUALITY_SCORING.WARNING_PENALTY;
        
        // Add points for document quality
        const qualityScores = Object.values(validation.documentQuality).map(doc => doc.score);
        const avgQuality = qualityScores.length > 0 
            ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
            : 0;
        
        score = Math.min(QUALITY_THRESHOLDS.PERFECT_SCORE, score + (avgQuality * QUALITY_SCORING.QUALITY_BONUS_WEIGHT));
        
        return Math.max(0, Math.round(score));
    }

    /**
     * Generate recommendations based on findings
     * @param validation Validation result to update with recommendations
     */
    private generatePMBOKRecommendations(validation: PMBOKComplianceResult): void {
        // Standard PMBOK 7.0 recommendations
        validation.findings.recommendations.push('Ensure all documents follow PMBOK 7.0 performance domains: Stakeholders, Team, Development Approach, Planning, Project Work, Delivery, Measurement, Uncertainty');
        validation.findings.recommendations.push('Include clear traceability between project objectives and deliverables');
        validation.findings.recommendations.push('Maintain consistent terminology across all project documents');
        
        // Specific recommendations based on findings
        if (validation.findings.critical.some(f => f.includes('stakeholder'))) {
            validation.findings.recommendations.push('Strengthen stakeholder management documentation with detailed analysis and engagement strategies');
        }
        
        if (validation.consistencyScore < 80) {
            validation.findings.recommendations.push('Review all documents for consistency in project scope, objectives, and terminology');
        }
    }

    /**
     * Print validation report to console
     * @param validation Validation result to print
     */
    private printPMBOKValidationReport(validation: PMBOKComplianceResult): void {
        console.log('\n📊 PMBOK 7.0 Compliance Validation Report');
        console.log('==========================================');
        
        console.log(`\n🎯 Overall Compliance: ${validation.compliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
        console.log(`📈 Consistency Score: ${validation.consistencyScore}/100`);
        
        if (validation.findings.critical.length > 0) {
            console.log(`\n🚨 Critical Issues (${validation.findings.critical.length}):`);
            validation.findings.critical.forEach(issue => console.log(`   • ${issue}`));
        }
        
        if (validation.findings.warnings.length > 0) {
            console.log(`\n⚠️ Warnings (${validation.findings.warnings.length}):`);
            validation.findings.warnings.forEach(warning => console.log(`   • ${warning}`));
        }
        
        console.log(`\n💡 Recommendations (${validation.findings.recommendations.length}):`);
        validation.findings.recommendations.forEach(rec => console.log(`   • ${rec}`));
        
        console.log('\n📋 Document Quality Scores:');
        Object.entries(validation.documentQuality).forEach(([doc, quality]) => {
            console.log(`   • ${doc}: ${quality.score}/100`);
            if (quality.strengths.length > 0) {
                quality.strengths.forEach(strength => console.log(`     ✅ ${strength}`));
            }
            if (quality.issues.length > 0) {
                quality.issues.forEach(issue => console.log(`     ⚠️ ${issue}`));
            }
        });
    }

    private async validatePerformanceDomains(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const foundDomains = PMBOK_PERFORMANCE_DOMAINS.filter(domain => 
            content.toLowerCase().includes(domain.toLowerCase())
        );

        if (foundDomains.length < QUALITY_THRESHOLDS.MIN_PERFORMANCE_DOMAINS) {
            findings.push(`Only ${foundDomains.length} performance domains found (minimum ${QUALITY_THRESHOLDS.MIN_PERFORMANCE_DOMAINS} required)`);
        }

        score = (foundDomains.length / PMBOK_PERFORMANCE_DOMAINS.length) * 100;
        return { score, findings };
    }

    private async validatePrinciples(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const foundPrinciples = PMBOK_PRINCIPLES.filter(principle => 
            content.toLowerCase().includes(principle.toLowerCase())
        );

        if (foundPrinciples.length < QUALITY_THRESHOLDS.MIN_PRINCIPLES) {
            findings.push(`Only ${foundPrinciples.length} principles found (minimum ${QUALITY_THRESHOLDS.MIN_PRINCIPLES} required)`);
        }

        score = (foundPrinciples.length / PMBOK_PRINCIPLES.length) * 100;
        return { score, findings };
    }

    private async validateValueDelivery(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const foundElements = VALUE_DELIVERY_SYSTEM.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_VALUE_DELIVERY_ELEMENTS) {
            findings.push(`Only ${foundElements.length} value delivery elements found (minimum ${QUALITY_THRESHOLDS.MIN_VALUE_DELIVERY_ELEMENTS} required)`);
        }

        score = (foundElements.length / VALUE_DELIVERY_SYSTEM.length) * 100;
        return { score, findings };
    }

    private async validateQualityMetrics(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allMetrics = [
            ...QUALITY_METRICS_REQUIREMENTS.SMART_OBJECTIVES,
            ...QUALITY_METRICS_REQUIREMENTS.PERFORMANCE_METRICS
        ];
        const foundMetrics = allMetrics.filter(metric => 
            content.toLowerCase().includes(metric.toLowerCase())
        );

        if (foundMetrics.length < QUALITY_THRESHOLDS.MIN_QUALITY_METRICS) {
            findings.push(`Only ${foundMetrics.length} quality metrics found (minimum ${QUALITY_THRESHOLDS.MIN_QUALITY_METRICS} required)`);
        }

        score = (foundMetrics.length / allMetrics.length) * 100;
        return { score, findings };
    }

    private async validateRiskManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allRiskElements = [
            ...RISK_MANAGEMENT_REQUIREMENTS.RISK_BREAKDOWN,
            ...RISK_MANAGEMENT_REQUIREMENTS.RISK_RESPONSE
        ];
        const foundElements = allRiskElements.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_RISK_ELEMENTS) {
            findings.push(`Only ${foundElements.length} risk management elements found (minimum ${QUALITY_THRESHOLDS.MIN_RISK_ELEMENTS} required)`);
        }

        score = (foundElements.length / allRiskElements.length) * 100;
        return { score, findings };
    }

    private async validateStakeholderEngagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allElements = [
            ...STAKEHOLDER_ENGAGEMENT_REQUIREMENTS.ASSESSMENT,
            ...STAKEHOLDER_ENGAGEMENT_REQUIREMENTS.STRATEGIES
        ];
        const foundElements = allElements.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_STAKEHOLDER_ELEMENTS) {
            findings.push(`Only ${foundElements.length} stakeholder engagement elements found (minimum ${QUALITY_THRESHOLDS.MIN_STAKEHOLDER_ELEMENTS} required)`);
        }

        score = (foundElements.length / allElements.length) * 100;
        return { score, findings };
    }

    private async validateProjectLifecycle(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allElements = [
            ...PROJECT_LIFECYCLE_REQUIREMENTS.PHASES,
            ...PROJECT_LIFECYCLE_REQUIREMENTS.INTEGRATION
        ];
        const foundElements = allElements.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_LIFECYCLE_ELEMENTS) {
            findings.push(`Only ${foundElements.length} lifecycle elements found (minimum ${QUALITY_THRESHOLDS.MIN_LIFECYCLE_ELEMENTS} required)`);
        }

        score = (foundElements.length / allElements.length) * 100;
        return { score, findings };
    }

    private async validateResourceManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allElements = [
            ...RESOURCE_MANAGEMENT_REQUIREMENTS.PLANNING,
            ...RESOURCE_MANAGEMENT_REQUIREMENTS.CONTROL
        ];
        const foundElements = allElements.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_RESOURCE_ELEMENTS) {
            findings.push(`Only ${foundElements.length} resource management elements found (minimum ${QUALITY_THRESHOLDS.MIN_RESOURCE_ELEMENTS} required)`);
        }

        score = (foundElements.length / allElements.length) * 100;
        return { score, findings };
    }

    private async validateCommunication(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allElements = [
            ...COMMUNICATION_REQUIREMENTS.PLANNING,
            ...COMMUNICATION_REQUIREMENTS.EXECUTION
        ];
        const foundElements = allElements.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_COMMUNICATION_ELEMENTS) {
            findings.push(`Only ${foundElements.length} communication elements found (minimum ${QUALITY_THRESHOLDS.MIN_COMMUNICATION_ELEMENTS} required)`);
        }

        score = (foundElements.length / allElements.length) * 100;
        return { score, findings };
    }

    private async validateChangeManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allElements = [
            ...CHANGE_MANAGEMENT_REQUIREMENTS.CONTROL,
            ...CHANGE_MANAGEMENT_REQUIREMENTS.IMPLEMENTATION
        ];
        const foundElements = allElements.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_CHANGE_ELEMENTS) {
            findings.push(`Only ${foundElements.length} change management elements found (minimum ${QUALITY_THRESHOLDS.MIN_CHANGE_ELEMENTS} required)`);
        }

        score = (foundElements.length / allElements.length) * 100;
        return { score, findings };
    }

    private async validateKnowledgeManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allElements = [
            ...KNOWLEDGE_MANAGEMENT_REQUIREMENTS.PROCESSES,
            ...KNOWLEDGE_MANAGEMENT_REQUIREMENTS.INTEGRATION
        ];
        const foundElements = allElements.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_KNOWLEDGE_ELEMENTS) {
            findings.push(`Only ${foundElements.length} knowledge management elements found (minimum ${QUALITY_THRESHOLDS.MIN_KNOWLEDGE_ELEMENTS} required)`);
        }

        score = (foundElements.length / allElements.length) * 100;
        return { score, findings };
    }

    private async validateSustainability(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allElements = [
            ...SUSTAINABILITY_REQUIREMENTS.CONSIDERATIONS,
            ...SUSTAINABILITY_REQUIREMENTS.IMPLEMENTATION
        ];
        const foundElements = allElements.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_SUSTAINABILITY_ELEMENTS) {
            findings.push(`Only ${foundElements.length} sustainability elements found (minimum ${QUALITY_THRESHOLDS.MIN_SUSTAINABILITY_ELEMENTS} required)`);
        }

        score = (foundElements.length / allElements.length) * 100;
        return { score, findings };
    }

    private async validateDigitalTransformation(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 0;
        const allElements = [
            ...DIGITAL_TRANSFORMATION_REQUIREMENTS.TECHNOLOGY,
            ...DIGITAL_TRANSFORMATION_REQUIREMENTS.INTEGRATION
        ];
        const foundElements = allElements.filter(element => 
            content.toLowerCase().includes(element.toLowerCase())
        );

        if (foundElements.length < QUALITY_THRESHOLDS.MIN_DIGITAL_ELEMENTS) {
            findings.push(`Only ${foundElements.length} digital transformation elements found (minimum ${QUALITY_THRESHOLDS.MIN_DIGITAL_ELEMENTS} required)`);
        }

        score = (foundElements.length / allElements.length) * 100;
        return { score, findings };
    }
}
