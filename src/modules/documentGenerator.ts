import * as fs from 'fs/promises';
import * as path from 'path';
import { 
    createDirectoryStructure, 
    saveDocument, 
    generateIndexFile, 
    cleanupOldFiles,
    DOCUMENT_CONFIG 
} from './fileManager.js';
import * as llmProcessor from './llmProcessor.js';

interface GenerationTask {
    key: string;
    name: string;
    func: keyof typeof llmProcessor;
    emoji: string;
    category: string;
    priority: number; // Lower number = higher priority
}

// Define all generation tasks with proper organization and priorities
const GENERATION_TASKS: GenerationTask[] = [
    // Core Analysis Documents (High Priority)
    { key: 'project-summary', name: 'AI Summary and Goals', func: 'getAiSummaryAndGoals', emoji: '🤖', category: 'core-analysis', priority: 1 },
    { key: 'user-stories', name: 'User Stories', func: 'getAiUserStories', emoji: '📖', category: 'core-analysis', priority: 2 },
    { key: 'user-personas', name: 'User Personas', func: 'getAiUserPersonas', emoji: '👥', category: 'core-analysis', priority: 3 },
    { key: 'key-roles-and-needs', name: 'Key Roles and Needs', func: 'getAiKeyRolesAndNeeds', emoji: '🎭', category: 'core-analysis', priority: 4 },
    
    // Project Charter (Critical)
    { key: 'project-charter', name: 'Project Charter', func: 'getAiProjectCharter', emoji: '📜', category: 'project-charter', priority: 5 },
    
    // Management Plans (High Priority)
    { key: 'scope-management-plan', name: 'Scope Management Plan', func: 'getAiScopeManagementPlan', emoji: '📊', category: 'management-plans', priority: 6 },
    { key: 'risk-management-plan', name: 'Risk Management Plan', func: 'getAiRiskManagementPlan', emoji: '⚠️', category: 'management-plans', priority: 7 },
    { key: 'cost-management-plan', name: 'Cost Management Plan', func: 'getAiCostManagementPlan', emoji: '💰', category: 'management-plans', priority: 8 },
    { key: 'quality-management-plan', name: 'Quality Management Plan', func: 'getAiQualityManagementPlan', emoji: '✅', category: 'management-plans', priority: 9 },
    { key: 'resource-management-plan', name: 'Resource Management Plan', func: 'getAiResourceManagementPlan', emoji: '👨‍💼', category: 'management-plans', priority: 10 },
    { key: 'communication-management-plan', name: 'Communication Management Plan', func: 'getAiCommunicationManagementPlan', emoji: '📢', category: 'management-plans', priority: 11 },
    { key: 'procurement-management-plan', name: 'Procurement Management Plan', func: 'getAiProcurementManagementPlan', emoji: '🛒', category: 'management-plans', priority: 12 },
    
    // Stakeholder Management (Updated with proper priority order)
    { key: 'stakeholder-engagement-plan', name: 'Stakeholder Engagement Plan', func: 'getAiStakeholderEngagementPlan', emoji: '🤝', category: 'stakeholder-management', priority: 13 },
    { key: 'stakeholder-register', name: 'Stakeholder Register', func: 'getAiStakeholderRegister', emoji: '👥', category: 'stakeholder-management', priority: 14 },
    { key: 'stakeholder-analysis', name: 'Stakeholder Analysis', func: 'getAiStakeholderAnalysis', emoji: '📈', category: 'stakeholder-management', priority: 15 },
    
    // Planning Artifacts (Medium Priority - updated priorities)
    { key: 'work-breakdown-structure', name: 'Work Breakdown Structure', func: 'getAiWbs', emoji: '🏗️', category: 'planning-artifacts', priority: 16 },
    { key: 'wbs-dictionary', name: 'WBS Dictionary', func: 'getAiWbsDictionary', emoji: '📚', category: 'planning-artifacts', priority: 17 },
    { key: 'activity-list', name: 'Activity List', func: 'getAiActivityList', emoji: '📋', category: 'planning-artifacts', priority: 18 },
    { key: 'activity-duration-estimates', name: 'Activity Duration Estimates', func: 'getAiActivityDurationEstimates', emoji: '⏱️', category: 'planning-artifacts', priority: 19 },
    { key: 'activity-resource-estimates', name: 'Activity Resource Estimates', func: 'getAiActivityResourceEstimates', emoji: '📦', category: 'planning-artifacts', priority: 20 },
    { key: 'schedule-network-diagram', name: 'Schedule Network Diagram', func: 'getAiScheduleNetworkDiagram', emoji: '🔗', category: 'planning-artifacts', priority: 21 },
    { key: 'milestone-list', name: 'Milestone List', func: 'getAiMilestoneList', emoji: '🎯', category: 'planning-artifacts', priority: 22 },
    { key: 'schedule-development-input', name: 'Schedule Development Input', func: 'getAiDevelopScheduleInput', emoji: '📅', category: 'planning-artifacts', priority: 23 },
    
    // Technical Analysis (Lower Priority but Important - updated priorities)
    { key: 'data-model-suggestions', name: 'Data Model Suggestions', func: 'getAiDataModelSuggestions', emoji: '🗄️', category: 'technical-analysis', priority: 24 },
    { key: 'tech-stack-analysis', name: 'Tech Stack Analysis', func: 'getAiTechStackAnalysis', emoji: '⚙️', category: 'technical-analysis', priority: 25 },
    { key: 'risk-analysis', name: 'Risk Analysis', func: 'getAiRiskAnalysis', emoji: '🔍', category: 'technical-analysis', priority: 26 },
    { key: 'acceptance-criteria', name: 'Acceptance Criteria', func: 'getAiAcceptanceCriteria', emoji: '✔️', category: 'technical-analysis', priority: 27 },
    { key: 'compliance-considerations', name: 'Compliance Considerations', func: 'getAiComplianceConsiderations', emoji: '⚖️', category: 'technical-analysis', priority: 28 },
    { key: 'ui-ux-considerations', name: 'UI/UX Considerations', func: 'getAiUiUxConsiderations', emoji: '🎨', category: 'technical-analysis', priority: 29 }
];

interface GenerationOptions {
    includeCategories?: string[];
    excludeCategories?: string[];
    maxConcurrent?: number;
    delayBetweenCalls?: number;
    continueOnError?: boolean;
    generateIndex?: boolean;
    cleanup?: boolean;
    outputDir?: string;  // Add this line
    format?: 'markdown' | 'json' | 'yaml';  // Add this line
}

interface GenerationResult {
    success: boolean;
    successCount: number;
    failureCount: number;
    skippedCount: number;
    generatedFiles: string[];
    errors: Array<{ task: string; error: string; }>;
    duration: number;
}

export class DocumentGenerator {
    private options: Required<GenerationOptions>;
    private context: string;
    private results: GenerationResult;

    constructor(context: string, options: GenerationOptions = {}) {
        this.context = context;
        this.options = {
            includeCategories: options.includeCategories || [],
            excludeCategories: options.excludeCategories || [],
            maxConcurrent: options.maxConcurrent || 1,
            delayBetweenCalls: options.delayBetweenCalls || 500,
            continueOnError: options.continueOnError ?? true,
            generateIndex: options.generateIndex ?? true,
            cleanup: options.cleanup ?? true,
            outputDir: options.outputDir || 'generated-documents', // Default output directory
            format: options.format || 'markdown' // Default format
        };
        
        this.results = {
            success: false,
            successCount: 0,
            failureCount: 0,
            skippedCount: 0,
            generatedFiles: [],
            errors: [],
            duration: 0
        };
    }

    private filterTasks(): GenerationTask[] {
        let tasks = [...GENERATION_TASKS];

        // Filter by included categories
        if (this.options.includeCategories.length > 0) {
            tasks = tasks.filter(task => this.options.includeCategories.includes(task.category));
        }

        // Filter out excluded categories
        if (this.options.excludeCategories.length > 0) {
            tasks = tasks.filter(task => !this.options.excludeCategories.includes(task.category));
        }

        // Sort by priority
        return tasks.sort((a, b) => a.priority - b.priority);
    }

    private async generateSingleDocument(task: GenerationTask): Promise<boolean> {
        try {
            console.log(`${task.emoji} Generating ${task.name}...`);
            
            // Fix the type assertion and error handling
            const aiFunction = (llmProcessor as any)[task.func] as (context: string) => Promise<string | null>;
            if (typeof aiFunction !== 'function') {
                const error = `AI function ${task.func} not found in llmProcessor module`;
                console.error(`❌ ${error}`);
                // Fix the type issue with Object.keys
                const availableFunctions = Object.keys(llmProcessor).filter(key => typeof (llmProcessor as any)[key] === 'function');
                console.error(`Available functions:`, availableFunctions);
                this.results.errors.push({ task: task.name, error });
                return false;
            }
            
            const content = await aiFunction(this.context);
            
            if (content && content.trim().length > 0) {
                const documentKey = task.key;
                const config = DOCUMENT_CONFIG[documentKey];
                
                if (!config) {
                    console.error(`❌ Unknown document key: ${documentKey}`);
                    // Fix saveDocument call - remove the third parameter
                    saveDocument(documentKey, content);
                    this.results.generatedFiles.push(`${task.category}/${documentKey}.md`);
                    console.log(`✅ Generated: ${task.name} (using default filename)`);
                    return true;
                }
                
                saveDocument(documentKey, content);
                this.results.generatedFiles.push(`${task.category}/${config.filename}`);
                console.log(`✅ Generated: ${task.name}`);
                return true;
            } else {
                console.log(`⚠️ No content generated for ${task.name}`);
                return false;
            }
            
        } catch (error: any) {
            const errorMsg = error.message || 'Unknown error';
            console.error(`❌ Error generating ${task.name}: ${errorMsg}`);
            this.results.errors.push({ task: task.name, error: errorMsg });
            return false;
        }
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async generateAll(): Promise<GenerationResult> {
        const startTime = Date.now();
        
        console.log('📋 Starting PMBOK document generation...');
        
        // Setup directory structure
        if (this.options.cleanup) {
            cleanupOldFiles();
        }
        createDirectoryStructure();

        const tasks = this.filterTasks();
        console.log(`📝 Planning to generate ${tasks.length} documents in ${this.options.maxConcurrent} concurrent batches`);
        
        // Process tasks in batches
        for (let i = 0; i < tasks.length; i += this.options.maxConcurrent) {
            const batch = tasks.slice(i, i + this.options.maxConcurrent);
            
            const batchPromises = batch.map(async (task) => {
                const success = await this.generateSingleDocument(task);
                if (success) {
                    this.results.successCount++;
                } else {
                    this.results.failureCount++;
                }
                
                // Add delay between calls to avoid rate limiting
                if (this.options.delayBetweenCalls > 0) {
                    await this.delay(this.options.delayBetweenCalls);
                }
                
                return success;
            });
            
            try {
                await Promise.all(batchPromises);
            } catch (error: any) {
                if (!this.options.continueOnError) {
                    console.error(`❌ Batch processing failed: ${error.message}`);
                    break;
                }
            }
        }

        // Generate documentation index
        if (this.options.generateIndex) {
            try {
                generateIndexFile();
                console.log('📋 Generated documentation index');
            } catch (error: any) {
                console.error(`❌ Failed to generate index: ${error.message}`);
            }
        }

        this.results.duration = Date.now() - startTime;
        this.results.success = this.results.successCount > 0;

        this.printSummary();
        return this.results;
    }

    private printSummary(): void {
        console.log(`\n📊 Generation Summary:`);
        console.log(`✅ Successfully generated: ${this.results.successCount} documents`);
        console.log(`❌ Failed to generate: ${this.results.failureCount} documents`);
        console.log(`⏱️ Total duration: ${(this.results.duration / 1000).toFixed(2)}s`);
        console.log(`📁 Documents organized in: generated-documents/`);
        
        if (this.results.generatedFiles.length > 0) {
            console.log(`📋 Generated files:`);
            this.results.generatedFiles.forEach(file => {
                console.log(`   • ${file}`);
            });
        }
        
        if (this.results.errors.length > 0) {
            console.log(`\n❌ Errors encountered:`);
            this.results.errors.forEach(error => {
                console.log(`   • ${error.task}: ${error.error}`);
            });
        }
        
        console.log(`📋 See generated-documents/README.md for complete index`);
    }

    // Static convenience methods
    public static async generateCoreDocuments(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['core-analysis', 'project-charter'],
            delayBetweenCalls: 1000
        });
        return await generator.generateAll();
    }

    public static async generateManagementPlans(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['management-plans'],
            delayBetweenCalls: 800
        });
        return await generator.generateAll();
    }

    public static async generatePlanningArtifacts(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['planning-artifacts'],
            delayBetweenCalls: 600
        });
        return await generator.generateAll();
    }

    public static async generateTechnicalAnalysis(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['technical-analysis'],
            delayBetweenCalls: 500
        });
        return await generator.generateAll();
    }

    // Add a static convenience method specifically for stakeholder documents
    public static async generateStakeholderDocuments(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['stakeholder-management'],
            delayBetweenCalls: 800,
            maxConcurrent: 1
        });
        return await generator.generateAll();
    }

    // Add this static method

    public static async generateAllWithValidation(context: string): Promise<{ result: GenerationResult; validation: any }> {
        // Generate all documents
        const generator = new DocumentGenerator(context, {
            maxConcurrent: 1,
            delayBetweenCalls: 500,
            continueOnError: true,
            generateIndex: true,
            cleanup: true
        });
        
        const result = await generator.generateAll();
        
        // Validate generation
        console.log('\n🔍 Validating document generation...');
        const validation = await generator.validateGeneration();
        
        if (validation.isComplete) {
            console.log('✅ All documents generated successfully!');
        } else {
            console.log('❌ Some documents are missing:');
            validation.missing.forEach(doc => console.log(`   • ${doc}`));
        }
        
        return { result, validation };
    }

    public async validateGeneration(): Promise<{ isComplete: boolean; missing: string[]; errors: string[] }> {
        const validation = {
            isComplete: true,
            missing: [] as string[],
            errors: [] as string[]
        };

        // Check if all expected documents exist
        for (const task of GENERATION_TASKS) {
            const config = DOCUMENT_CONFIG[task.key];
            const expectedPath = config 
                ? `generated-documents/${task.category}/${config.filename}`
                : `generated-documents/${task.category}/${task.key}.md`;
            
            try {
                await fs.access(expectedPath);
                console.log(`✅ Found: ${task.name}`);
            } catch (error) {
                validation.missing.push(`${task.name} (${expectedPath})`);
                validation.isComplete = false;
            }
        }

        // Check for README.md
        try {
            await fs.access('generated-documents/README.md');
            console.log(`✅ Found: Documentation Index`);
        } catch (error) {
            validation.missing.push('Documentation Index (README.md)');
            validation.isComplete = false;
        }

        return validation;
    }

    // Add this method to the DocumentGenerator class

    public async validatePMBOKCompliance(): Promise<{
        compliance: boolean;
        consistencyScore: number;
        findings: {
            critical: string[];
            warnings: string[];
            recommendations: string[];
        };
        documentQuality: Record<string, {
            score: number;
            issues: string[];
            strengths: string[];
        }>;
    }> {
        console.log('\n📋 Starting PMBOK 7.0 Compliance Validation...');
        
        const validation = {
            compliance: true,
            consistencyScore: 0,
            findings: {
                critical: [] as string[],
                warnings: [] as string[],
                recommendations: [] as string[]
            },
            documentQuality: {} as Record<string, any>
        };

        // PMBOK 7.0 Required Document Categories
        const pmbok7Requirements = {
            'project-charter': {
                required: ['project purpose', 'measurable objectives', 'high-level requirements', 'assumptions', 'constraints', 'project approval requirements'],
                category: 'project-charter'
            },
            'stakeholder-register': {
                required: ['identification information', 'assessment information', 'stakeholder classification'],
                category: 'stakeholder-management'
            },
            'stakeholder-engagement-plan': {
                required: ['engagement strategies', 'communication requirements', 'stakeholder expectations'],
                category: 'stakeholder-management'
            },
            'scope-management-plan': {
                required: ['scope definition', 'wbs development', 'scope verification', 'scope control'],
                category: 'management-plans'
            },
            'work-breakdown-structure': {
                required: ['work packages', 'deliverables', 'hierarchical decomposition'],
                category: 'planning-artifacts'
            }
        };

        // Check each document against PMBOK 7.0 standards
        for (const [docKey, requirements] of Object.entries(pmbok7Requirements)) {
            const config = DOCUMENT_CONFIG[docKey];
            if (!config) continue;

            const filePath = `generated-documents/${requirements.category}/${config.filename}`;
            
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

    private async assessDocumentQuality(
        docKey: string, 
        content: string, 
        requiredElements: string[]
    ): Promise<{ score: number; issues: string[]; strengths: string[] }> {
        const assessment = {
            score: 0,
            issues: [] as string[],
            strengths: [] as string[]
        };

        // Content length check
        if (content.length < 500) {
            assessment.issues.push('Document appears too brief for comprehensive coverage');
        } else if (content.length > 2000) {
            assessment.strengths.push('Comprehensive content coverage');
            assessment.score += 20;
        }

        // Structure check (headers, sections)
        const headerCount = (content.match(/^#+\s/gm) || []).length;
        if (headerCount >= 3) {
            assessment.strengths.push('Well-structured with multiple sections');
            assessment.score += 15;
        } else {
            assessment.issues.push('Limited document structure - consider adding more sections');
        }

        // PMBOK terminology usage
        const pmbokTerms = [
            'deliverable', 'milestone', 'work package', 'baseline', 'change control',
            'risk register', 'stakeholder', 'requirements', 'assumptions', 'constraints'
        ];
        
        const foundTerms = pmbokTerms.filter(term => 
            content.toLowerCase().includes(term.toLowerCase())
        );
        
        if (foundTerms.length >= 3) {
            assessment.strengths.push(`Uses appropriate PMBOK terminology (${foundTerms.length} terms found)`);
            assessment.score += 15;
        }

        // Required elements coverage
        const coveredElements = requiredElements.filter(element => 
            this.contentContainsElement(content, element)
        );
        
        const coveragePercentage = (coveredElements.length / requiredElements.length) * 100;
        assessment.score += Math.round(coveragePercentage * 0.5); // Up to 50 points for full coverage

        if (coveragePercentage === 100) {
            assessment.strengths.push('All required PMBOK elements covered');
        } else {
            assessment.issues.push(`Missing ${requiredElements.length - coveredElements.length} required elements`);
        }

        return assessment;
    }

    private contentContainsElement(content: string, element: string): boolean {
        const contentLower = content.toLowerCase();
        const elementLower = element.toLowerCase();
        
        // Check for exact phrase or key words from the element
        const keywords = elementLower.split(' ');
        return keywords.every(keyword => contentLower.includes(keyword)) ||
               contentLower.includes(elementLower);
    }

    private async validateCrossDocumentConsistency(validation: any): Promise<void> {
        console.log('🔍 Checking cross-document consistency...');
        
        try {
            // Check project name consistency
            const projectCharterPath = 'generated-documents/project-charter/project-charter.md';
            const scopePlanPath = 'generated-documents/management-plans/scope-management-plan.md';
            
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
            const stakeholderRegisterPath = 'generated-documents/stakeholder-management/stakeholder-register.md';
            const stakeholderPlanPath = 'generated-documents/stakeholder-management/stakeholder-engagement-plan.md';
            
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

    private calculateConsistencyScore(validation: any): number {
        let score = 100;
        
        // Deduct points for issues
        score -= validation.findings.critical.length * 20;
        score -= validation.findings.warnings.length * 10;
        
        // Add points for document quality
        const qualityScores = Object.values(validation.documentQuality).map((doc: any) => doc.score);
        const avgQuality = qualityScores.length > 0 ? qualityScores.reduce((a: number, b: number) => a + b, 0) / qualityScores.length : 0;
        score = Math.min(100, score + (avgQuality * 0.3));
        
        return Math.max(0, Math.round(score));
    }

    private generatePMBOKRecommendations(validation: any): void {
        // Standard PMBOK 7.0 recommendations
        validation.findings.recommendations.push('Ensure all documents follow PMBOK 7.0 performance domains: Stakeholders, Team, Development Approach, Planning, Project Work, Delivery, Measurement, Uncertainty');
        validation.findings.recommendations.push('Include clear traceability between project objectives and deliverables');
        validation.findings.recommendations.push('Maintain consistent terminology across all project documents');
        
        // Specific recommendations based on findings
        if (validation.findings.critical.some((f: string) => f.includes('stakeholder'))) {
            validation.findings.recommendations.push('Strengthen stakeholder management documentation with detailed analysis and engagement strategies');
        }
        
        if (validation.consistencyScore < 80) {
            validation.findings.recommendations.push('Review all documents for consistency in project scope, objectives, and terminology');
        }
    }

    private printPMBOKValidationReport(validation: any): void {
        console.log('\n📊 PMBOK 7.0 Compliance Validation Report');
        console.log('==========================================');
        
        console.log(`\n🎯 Overall Compliance: ${validation.compliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
        console.log(`📈 Consistency Score: ${validation.consistencyScore}/100`);
        
        if (validation.findings.critical.length > 0) {
            console.log(`\n🚨 Critical Issues (${validation.findings.critical.length}):`);
            validation.findings.critical.forEach((issue: string) => console.log(`   • ${issue}`));
        }
        
        if (validation.findings.warnings.length > 0) {
            console.log(`\n⚠️ Warnings (${validation.findings.warnings.length}):`);
            validation.findings.warnings.forEach((warning: string) => console.log(`   • ${warning}`));
        }
        
        console.log(`\n💡 Recommendations (${validation.findings.recommendations.length}):`);
        validation.findings.recommendations.forEach((rec: string) => console.log(`   • ${rec}`));
        
        console.log('\n📋 Document Quality Scores:');
        Object.entries(validation.documentQuality).forEach(([doc, quality]: [string, any]) => {
            console.log(`   • ${doc}: ${quality.score}/100`);
            if (quality.strengths.length > 0) {
                quality.strengths.forEach((strength: string) => console.log(`     ✅ ${strength}`));
            }
            if (quality.issues.length > 0) {
                quality.issues.forEach((issue: string) => console.log(`     ⚠️ ${issue}`));
            }
        });
    }

    // Enhanced generateAllWithValidation method
    public static async generateAllWithPMBOKValidation(context: string): Promise<{
        result: GenerationResult;
        validation: any;
        pmbokCompliance: any;
    }> {
        // Generate all documents
        const generator = new DocumentGenerator(context, {
            maxConcurrent: 1,
            delayBetweenCalls: 500,
            continueOnError: true,
            generateIndex: true,
            cleanup: true
        });
        
        const result = await generator.generateAll();
        
        // Basic validation
        console.log('\n🔍 Validating document generation...');
        const validation = await generator.validateGeneration();
        
        // PMBOK 7.0 compliance validation
        const pmbokCompliance = await generator.validatePMBOKCompliance();
        
        // Summary report
        console.log('\n📋 Final Validation Summary:');
        console.log(`📁 Generated: ${result.successCount}/${result.successCount + result.failureCount} documents`);
        console.log(`✅ Files Present: ${validation.isComplete ? 'All' : 'Some missing'}`);
        console.log(`📊 PMBOK Compliance: ${pmbokCompliance.compliance ? 'Compliant' : 'Non-compliant'}`);
        console.log(`🎯 Consistency Score: ${pmbokCompliance.consistencyScore}/100`);
        
        return { result, validation, pmbokCompliance };
    }
}

/**
 * Requirements Gathering Agent Document Generator
 * Version: 2.1.2
 */

// Backward compatibility function
export async function generateAllDocuments(context: string): Promise<void> {
    const generator = new DocumentGenerator(context, {
        maxConcurrent: 1,
        delayBetweenCalls: 500,
        continueOnError: true,
        generateIndex: true,
        cleanup: true
    });
    
    await generator.generateAll();
}

// Enhanced batch generation with smart retry
export async function generateDocumentsWithRetry(
    context: string, 
    options: GenerationOptions & { maxRetries?: number } = {}
): Promise<GenerationResult> {
    const maxRetries = options.maxRetries || 2;
    let lastResult: GenerationResult | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`\n🔄 Generation attempt ${attempt}/${maxRetries}`);
        
        const generator = new DocumentGenerator(context, {
            ...options,
            cleanup: attempt === 1 // Only cleanup on first attempt
        });
        
        lastResult = await generator.generateAll();
        
        if (lastResult.success && lastResult.failureCount === 0) {
            console.log(`✅ All documents generated successfully on attempt ${attempt}`);
            break;
        }
        
        if (attempt < maxRetries) {
            console.log(`⚠️ Some documents failed. Retrying in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    return lastResult!;
}

/**
 * Generates a markdown file with a title and content in the specified output directory.
 * @param outputDir - The directory to write the file to.
 * @param fileName - The name of the markdown file.
 * @param title - The title to prepend to the content.
 * @param content - The main content to write.
 */
export async function generateMarkdownFile(
    outputDir: string,
    fileName: string,
    title: string,
    content: string
): Promise<void> {
    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    const filePath = path.join(outputDir, fileName);
    const timestamp = new Date().toISOString();
    const fileContent = `# ${title}

**Generated:** ${timestamp}  
**Generated by:** Requirements Gathering Agent v2.1.2

---

${content}`;
    
    await fs.writeFile(filePath, fileContent, 'utf-8');
    console.log(`✅ Generated: ${filePath}`);
}

// Version export for tracking
export const documentGeneratorVersion = '2.1.2';

// Utility functions for selective generation
export function getAvailableCategories(): string[] {
    return [...new Set(GENERATION_TASKS.map(task => task.category))];
}

export function getTasksByCategory(category: string): GenerationTask[] {
    return GENERATION_TASKS.filter(task => task.category === category);
}

export function getTaskByKey(key: string): GenerationTask | undefined {
    return GENERATION_TASKS.find(task => task.key === key);
}
