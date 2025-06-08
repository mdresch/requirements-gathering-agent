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
    QUALITY_SCORING 
} from './validationRules.js';

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

        // Check each document against PMBOK 7.0 standards
        for (const [docKey, requirements] of Object.entries(PMBOK_DOCUMENT_REQUIREMENTS)) {
            const filePath = `${this.documentsBasePath}/${requirements.category}/${docKey}.md`;
            
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const quality = await this.assessDocumentQuality(docKey, content, requirements.required);
                validation.documentQuality[docKey] = quality;

                // Check for critical PMBOK elements
                for (const element of requirements.required) {
                    if (!this.contentContainsElement(content, element)) {
                        validation.findings.critical.push(`${docKey}: Missing required PMBOK element '${element}'`);
                        validation.compliance = false;
                    }
                }

            } catch (error) {
                validation.findings.critical.push(`${docKey}: Document not found or unreadable`);
                validation.compliance = false;
            }
        }

        // Cross-document consistency checks
        await this.validateCrossDocumentConsistency(validation);

        // Calculate overall consistency score
        validation.consistencyScore = this.calculateConsistencyScore(validation);

        // Generate PMBOK 7.0 specific recommendations
        this.generatePMBOKRecommendations(validation);

        this.printPMBOKValidationReport(validation);
        
        return validation;
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
     * Assess the quality of a document
     * @param docKey Document key
     * @param content Document content
     * @param requiredElements Required elements for the document
     * @returns Document quality assessment
     */
    private async assessDocumentQuality(
        docKey: string, 
        content: string, 
        requiredElements: string[]
    ): Promise<DocumentQualityAssessment> {
        const assessment: DocumentQualityAssessment = {
            score: 0,
            issues: [],
            strengths: []
        };

        // Content length check
        if (content.length < QUALITY_THRESHOLDS.BRIEF_CONTENT_LENGTH) {
            assessment.issues.push('Document appears too brief for comprehensive coverage');
        } else if (content.length > QUALITY_THRESHOLDS.COMPREHENSIVE_CONTENT_LENGTH) {
            assessment.strengths.push('Comprehensive content coverage');
            assessment.score += QUALITY_SCORING.COMPREHENSIVE_CONTENT_POINTS;
        }

        // Structure check (headers, sections)
        const headerCount = (content.match(/^#+\s/gm) || []).length;
        if (headerCount >= QUALITY_THRESHOLDS.MIN_SECTION_COUNT) {
            assessment.strengths.push('Well-structured with multiple sections');
            assessment.score += QUALITY_SCORING.GOOD_STRUCTURE_POINTS;
        } else {
            assessment.issues.push('Limited document structure - consider adding more sections');
        }

        // PMBOK terminology usage
        const foundTerms = PMBOK_TERMINOLOGY.filter(term => 
            content.toLowerCase().includes(term.toLowerCase())
        );
        
        if (foundTerms.length >= QUALITY_THRESHOLDS.MIN_PMBOK_TERMS) {
            assessment.strengths.push(`Uses appropriate PMBOK terminology (${foundTerms.length} terms found)`);
            assessment.score += QUALITY_SCORING.PMBOK_TERMINOLOGY_POINTS;
        }

        // Required elements coverage
        const coveredElements = requiredElements.filter(element => 
            this.contentContainsElement(content, element)
        );
        
        const coveragePercentage = (coveredElements.length / requiredElements.length) * 100;
        assessment.score += Math.round(coveragePercentage * QUALITY_SCORING.REQUIRED_ELEMENTS_WEIGHT);

        if (coveragePercentage === 100) {
            assessment.strengths.push('All required PMBOK elements covered');
        } else {
            assessment.issues.push(`Missing ${requiredElements.length - coveredElements.length} required elements`);
        }

        return assessment;
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
}
