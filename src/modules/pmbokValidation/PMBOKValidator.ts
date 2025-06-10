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
    static suppressLogging = false;
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
                if (!PMBOKValidator.suppressLogging) console.log(`✅ Found: ${key}`);
            } catch (error) {
                validation.missing.push(`${key} (${expectedPath})`);
                validation.isComplete = false;
            }
        }

        // Check for README.md
        try {
            await fs.access(`${this.documentsBasePath}/README.md`);
            if (!PMBOKValidator.suppressLogging) console.log(`✅ Found: Documentation Index`);
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
        if (!PMBOKValidator.suppressLogging) console.log('\n📋 Starting PMBOK 7.0 Compliance Validation...');
        
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
            if (!PMBOKValidator.suppressLogging) {
                console.log(`Base path: ${this.documentsBasePath}`);
                const files = await fs.readdir(this.documentsBasePath);
                console.log('Available directories:', files);
            } else {
                await fs.readdir(this.documentsBasePath);
            }
            
            await Promise.all(
                Object.entries(PMBOK_DOCUMENT_REQUIREMENTS).map(async ([docKey, requirements]) => {
                    const filePath = `${this.documentsBasePath}/${requirements.category}/${docKey}.md`;
                    if (!PMBOKValidator.suppressLogging) console.log(`Checking file: ${filePath}`);
                    try {
                        const content = await fs.readFile(filePath, 'utf-8');
                        if (!PMBOKValidator.suppressLogging) console.log(`Successfully read: ${filePath}`);
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
                        if (!PMBOKValidator.suppressLogging) console.error(`Error reading ${filePath}:`, error);
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
        if (!PMBOKValidator.suppressLogging) console.log('\n🔍 Validating document generation...');
        const basicValidation = await this.validateGeneration(documentKeys);
        const pmbokCompliance = await this.validatePMBOKCompliance();
        if (!PMBOKValidator.suppressLogging) {
            console.log('\n📋 Final Validation Summary:');
            console.log(`✅ Files Present: ${basicValidation.isComplete ? 'All' : 'Some missing'}`);
            console.log(`📊 PMBOK Compliance: ${pmbokCompliance.compliance ? 'Compliant' : 'Non-compliant'}`);
            console.log(`🎯 Consistency Score: ${pmbokCompliance.consistencyScore}/100`);
        }
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
        if (!PMBOKValidator.suppressLogging) console.log('🔍 Checking cross-document consistency...');
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
        if (PMBOKValidator.suppressLogging) return;
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
            if (quality.issues.length > 0) {
                console.log(`     Issues: ${quality.issues.join(', ')}`);
            }
            if (quality.strengths.length > 0) {
                console.log(`     Strengths: ${quality.strengths.join(', ')}`);
            }
        });
    }

    /**
     * Validate performance domains in the document
     * @param content Document content
     * @returns Validation result for performance domains
     */
    private async validatePerformanceDomains(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all performance domains
        for (const domain of PMBOK_PERFORMANCE_DOMAINS) {
            if (!this.contentContainsElement(content, domain)) {
                findings.push(`Missing performance domain: ${domain}`);
                score -= 10; // Deduct points for each missing domain
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate principles in the document
     * @param content Document content
     * @returns Validation result for principles
     */
    private async validatePrinciples(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all PMBOK principles
        for (const principle of PMBOK_PRINCIPLES) {
            if (!this.contentContainsElement(content, principle)) {
                findings.push(`Missing PMBOK principle: ${principle}`);
                score -= 5; // Deduct points for each missing principle
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate value delivery system in the document
     * @param content Document content
     * @returns Validation result for value delivery system
     */
    private async validateValueDelivery(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for description of value delivery system
        if (!Array.isArray(VALUE_DELIVERY_SYSTEM) || VALUE_DELIVERY_SYSTEM.length === 0 || 
            !VALUE_DELIVERY_SYSTEM.some(system => this.contentContainsElement(content, system))) {
            findings.push('Missing description of value delivery system');
            score -= 20;
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate quality metrics in the document
     * @param content Document content
     * @returns Validation result for quality metrics
     */
    private async validateQualityMetrics(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all quality metrics requirements
        for (const metric of QUALITY_METRICS_REQUIREMENTS.SMART_OBJECTIVES) {
            if (!this.contentContainsElement(content, metric)) {
                findings.push(`Missing quality metric: ${metric}`);
                score -= 10;
            }
        }
        
        for (const metric of QUALITY_METRICS_REQUIREMENTS.PERFORMANCE_METRICS) {
            if (!this.contentContainsElement(content, metric)) {
                findings.push(`Missing performance metric: ${metric}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate risk management in the document
     * @param content Document content
     * @returns Validation result for risk management
     */
    private async validateRiskManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all risk management requirements
        for (const requirement of RISK_MANAGEMENT_REQUIREMENTS.RISK_BREAKDOWN) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing risk management requirement: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of RISK_MANAGEMENT_REQUIREMENTS.RISK_RESPONSE) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing risk response requirement: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate stakeholder engagement in the document
     * @param content Document content
     * @returns Validation result for stakeholder engagement
     */
    private async validateStakeholderEngagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all stakeholder engagement requirements
        for (const requirement of STAKEHOLDER_ENGAGEMENT_REQUIREMENTS.ASSESSMENT) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing stakeholder engagement assessment: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of STAKEHOLDER_ENGAGEMENT_REQUIREMENTS.STRATEGIES) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing stakeholder engagement strategy: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate project lifecycle integration in the document
     * @param content Document content
     * @returns Validation result for project lifecycle integration
     */
    private async validateProjectLifecycle(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all project lifecycle requirements
        for (const requirement of PROJECT_LIFECYCLE_REQUIREMENTS.PHASES) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing project lifecycle phase: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of PROJECT_LIFECYCLE_REQUIREMENTS.INTEGRATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing project lifecycle integration: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate resource management in the document
     * @param content Document content
     * @returns Validation result for resource management
     */
    private async validateResourceManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all resource management requirements
        for (const requirement of RESOURCE_MANAGEMENT_REQUIREMENTS.PLANNING) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing resource management planning: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of RESOURCE_MANAGEMENT_REQUIREMENTS.CONTROL) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing resource management control: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate communication in the document
     * @param content Document content
     * @returns Validation result for communication
     */
    private async validateCommunication(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all communication requirements
        for (const requirement of COMMUNICATION_REQUIREMENTS.PLANNING) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing communication planning: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of COMMUNICATION_REQUIREMENTS.EXECUTION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing communication execution: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate change management in the document
     * @param content Document content
     * @returns Validation result for change management
     */
    private async validateChangeManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all change management requirements
        for (const requirement of CHANGE_MANAGEMENT_REQUIREMENTS.CONTROL) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing change management control: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of CHANGE_MANAGEMENT_REQUIREMENTS.IMPLEMENTATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing change management implementation: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate knowledge management in the document
     * @param content Document content
     * @returns Validation result for knowledge management
     */
    private async validateKnowledgeManagement(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all knowledge management requirements
        for (const requirement of KNOWLEDGE_MANAGEMENT_REQUIREMENTS.PROCESSES) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing knowledge management process: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of KNOWLEDGE_MANAGEMENT_REQUIREMENTS.INTEGRATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing knowledge management integration: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate sustainability in the document
     * @param content Document content
     * @returns Validation result for sustainability
     */
    private async validateSustainability(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all sustainability requirements
        for (const requirement of SUSTAINABILITY_REQUIREMENTS.CONSIDERATIONS) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing sustainability consideration: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of SUSTAINABILITY_REQUIREMENTS.IMPLEMENTATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing sustainability implementation: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }

    /**
     * Validate digital transformation in the document
     * @param content Document content
     * @returns Validation result for digital transformation
     */
    private async validateDigitalTransformation(content: string): Promise<{ score: number; findings: string[] }> {
        const findings: string[] = [];
        let score = 100;
        
        // Check for presence of all digital transformation requirements
        for (const requirement of DIGITAL_TRANSFORMATION_REQUIREMENTS.TECHNOLOGY) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing digital transformation technology: ${requirement}`);
                score -= 10;
            }
        }
        
        for (const requirement of DIGITAL_TRANSFORMATION_REQUIREMENTS.INTEGRATION) {
            if (!this.contentContainsElement(content, requirement)) {
                findings.push(`Missing digital transformation integration: ${requirement}`);
                score -= 10;
            }
        }
        
        return { score: Math.max(0, score), findings };
    }
}
