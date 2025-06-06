import * as fs from 'fs/promises';
import * as path from 'path';
import { createDirectoryStructure, saveDocument, generateIndexFile, cleanupOldFiles, DOCUMENT_CONFIG } from './fileManager.js';
import * as llmProcessor from './llmProcessor.js';
// Define all generation tasks with proper organization and priorities
const GENERATION_TASKS = [
    // Core Analysis Documents (High Priority)
    { key: 'project-summary', name: 'AI Summary and Goals', func: 'getAiSummaryAndGoals', emoji: '🤖', category: 'core-analysis', priority: 1 },
    { key: 'user-stories', name: 'User Stories', func: 'getAiUserStories', emoji: '📖', category: 'core-analysis', priority: 2 },
    { key: 'user-personas', name: 'User Personas', func: 'getAiUserPersonas', emoji: '👥', category: 'core-analysis', priority: 3 },
    { key: 'key-roles-and-needs', name: 'Key Roles and Needs', func: 'getAiKeyRolesAndNeeds', emoji: '🎭', category: 'core-analysis', priority: 4 },
    { key: 'project-statement-of-work', name: 'Project Statement of Work', func: 'getAiProjectStatementOfWork', emoji: '📝', category: 'core-analysis', priority: 4.5 },
    { key: 'business-case', name: 'Business Case', func: 'getAiBusinessCase', emoji: '💼', category: 'core-analysis', priority: 5 },
    // Strategic Statements (New)
    { key: 'mission-vision-core-values', name: 'Mission, Vision, and Core Values', func: 'getAiMissionVisionAndCoreValues', emoji: '🌟', category: 'strategic-statements', priority: 6 },
    { key: 'project-purpose', name: 'Project Purpose', func: 'getAiProjectPurpose', emoji: '🎯', category: 'strategic-statements', priority: 7 },
    // Project Charter (Critical)
    { key: 'project-charter', name: 'Project Charter', func: 'getAiProjectCharter', emoji: '📜', category: 'project-charter', priority: 8 },
    { key: 'project-management-plan', name: 'Project Management Plan', func: 'getAiProjectManagementPlan', emoji: '🗂️', category: 'project-charter', priority: 9 },
    { key: 'direct-and-manage-project-work', name: 'Direct and Manage Project Work Process', func: 'getAiDirectAndManageProjectWorkProcess', emoji: '🚦', category: 'management-plans', priority: 9.5 },
    { key: 'perform-integrated-change-control', name: 'Perform Integrated Change Control Process', func: 'getAiPerformIntegratedChangeControlProcess', emoji: '🔄', category: 'management-plans', priority: 9.6 },
    { key: 'close-project-or-phase', name: 'Close Project or Phase Process', func: 'getAiCloseProjectOrPhaseProcess', emoji: '🏁', category: 'management-plans', priority: 9.7 },
    { key: 'plan-scope-management', name: 'Plan Scope Management', func: 'getAiPlanScopeManagement', emoji: '📝', category: 'management-plans', priority: 9.8 },
    { key: 'requirements-management-plan', name: 'Requirements Management Plan', func: 'getAiRequirementsManagementPlan', emoji: '📑', category: 'management-plans', priority: 9.85 },
    { key: 'collect-requirements', name: 'Collect Requirements Process', func: 'getAiCollectRequirementsProcess', emoji: '🗒️', category: 'management-plans', priority: 9.87 },
    { key: 'requirements-documentation', name: 'Requirements Documentation', func: 'getAiRequirementsDocumentation', emoji: '📃', category: 'management-plans', priority: 9.88 },
    { key: 'requirements-traceability-matrix', name: 'Requirements Traceability Matrix', func: 'getAiRequirementsTraceabilityMatrix', emoji: '🔗', category: 'management-plans', priority: 9.89 },
    { key: 'define-scope', name: 'Define Scope Process', func: 'getAiDefineScopeProcess', emoji: '🛑', category: 'management-plans', priority: 9.9 },
    { key: 'project-scope-statement', name: 'Project Scope Statement', func: 'getAiProjectScopeStatement', emoji: '📄', category: 'management-plans', priority: 9.91 },
    { key: 'create-wbs', name: 'Create WBS Process', func: 'getAiCreateWbsProcess', emoji: '🧩', category: 'management-plans', priority: 9.92 },
    { key: 'scope-baseline', name: 'Scope Baseline', func: 'getAiScopeBaseline', emoji: '📏', category: 'management-plans', priority: 9.93 },
    { key: 'validate-scope', name: 'Validate Scope Process', func: 'getAiValidateScopeProcess', emoji: '✅', category: 'management-plans', priority: 9.94 },
    { key: 'control-scope', name: 'Control Scope Process', func: 'getAiControlScopeProcess', emoji: '🛡️', category: 'management-plans', priority: 9.95 },
    { key: 'work-performance-information-scope', name: 'Work Performance Information (Scope)', func: 'getAiWorkPerformanceInformationScope', emoji: '📈', category: 'management-plans', priority: 9.96 },
    // Management Plans (High Priority)
    { key: 'scope-management-plan', name: 'Scope Management Plan', func: 'getAiScopeManagementPlan', emoji: '📊', category: 'management-plans', priority: 10 },
    { key: 'risk-management-plan', name: 'Risk Management Plan', func: 'getAiRiskManagementPlan', emoji: '⚠️', category: 'management-plans', priority: 11 },
    { key: 'cost-management-plan', name: 'Cost Management Plan', func: 'getAiCostManagementPlan', emoji: '💰', category: 'management-plans', priority: 12 },
    { key: 'quality-management-plan', name: 'Quality Management Plan', func: 'getAiQualityManagementPlan', emoji: '✅', category: 'management-plans', priority: 13 },
    { key: 'resource-management-plan', name: 'Resource Management Plan', func: 'getAiResourceManagementPlan', emoji: '👨‍💼', category: 'management-plans', priority: 14 },
    { key: 'communication-management-plan', name: 'Communication Management Plan', func: 'getAiCommunicationManagementPlan', emoji: '📢', category: 'management-plans', priority: 15 },
    { key: 'procurement-management-plan', name: 'Procurement Management Plan', func: 'getAiProcurementManagementPlan', emoji: '🛒', category: 'management-plans', priority: 16 },
    // Stakeholder Management (Updated with proper priority order)
    { key: 'stakeholder-engagement-plan', name: 'Stakeholder Engagement Plan', func: 'getAiStakeholderEngagementPlan', emoji: '🤝', category: 'stakeholder-management', priority: 17 },
    { key: 'stakeholder-register', name: 'Stakeholder Register', func: 'getAiStakeholderRegister', emoji: '👥', category: 'stakeholder-management', priority: 18 },
    { key: 'stakeholder-analysis', name: 'Stakeholder Analysis', func: 'getAiStakeholderAnalysis', emoji: '📈', category: 'stakeholder-management', priority: 19 },
    // Planning Artifacts (Medium Priority - updated priorities)
    { key: 'work-breakdown-structure', name: 'Work Breakdown Structure', func: 'getAiWbs', emoji: '🏗️', category: 'planning-artifacts', priority: 20 },
    { key: 'wbs-dictionary', name: 'WBS Dictionary', func: 'getAiWbsDictionary', emoji: '📚', category: 'planning-artifacts', priority: 21 },
    { key: 'activity-list', name: 'Activity List', func: 'getAiActivityList', emoji: '📋', category: 'planning-artifacts', priority: 22 },
    { key: 'activity-duration-estimates', name: 'Activity Duration Estimates', func: 'getAiActivityDurationEstimates', emoji: '⏱️', category: 'planning-artifacts', priority: 23 },
    { key: 'activity-resource-estimates', name: 'Activity Resource Estimates', func: 'getAiActivityResourceEstimates', emoji: '📦', category: 'planning-artifacts', priority: 24 },
    { key: 'schedule-network-diagram', name: 'Schedule Network Diagram', func: 'getAiScheduleNetworkDiagram', emoji: '🔗', category: 'planning-artifacts', priority: 25 },
    { key: 'milestone-list', name: 'Milestone List', func: 'getAiMilestoneList', emoji: '🎯', category: 'planning-artifacts', priority: 26 },
    { key: 'schedule-development-input', name: 'Schedule Development Input', func: 'getAiDevelopScheduleInput', emoji: '📅', category: 'planning-artifacts', priority: 27 },
    // Technical Analysis (Lower Priority but Important - updated priorities)
    { key: 'data-model-suggestions', name: 'Data Model Suggestions', func: 'getAiDataModelSuggestions', emoji: '🗄️', category: 'technical-analysis', priority: 28 },
    { key: 'tech-stack-analysis', name: 'Tech Stack Analysis', func: 'getAiTechStackAnalysis', emoji: '⚙️', category: 'technical-analysis', priority: 29 },
    { key: 'risk-analysis', name: 'Risk Analysis', func: 'getAiRiskAnalysis', emoji: '🔍', category: 'technical-analysis', priority: 30 },
    { key: 'acceptance-criteria', name: 'Acceptance Criteria', func: 'getAiAcceptanceCriteria', emoji: '✔️', category: 'technical-analysis', priority: 31 },
    { key: 'compliance-considerations', name: 'Compliance Considerations', func: 'getAiComplianceConsiderations', emoji: '⚖️', category: 'technical-analysis', priority: 32 },
    { key: 'ui-ux-considerations', name: 'UI/UX Considerations', func: 'getAiUiUxConsiderations', emoji: '🎨', category: 'technical-analysis', priority: 33 }
];
export class DocumentGenerator {
    options;
    context;
    results;
    constructor(context, options = {}) {
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
    filterTasks() {
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
    async generateSingleDocument(task) {
        try {
            console.log(`${task.emoji} Generating ${task.name}...`);
            // Fix the type assertion and error handling
            const aiFunction = llmProcessor[task.func];
            if (typeof aiFunction !== 'function') {
                const error = `AI function ${task.func} not found in llmProcessor module`;
                console.error(`❌ ${error}`);
                // Fix the type issue with Object.keys
                const availableFunctions = Object.keys(llmProcessor).filter(key => typeof llmProcessor[key] === 'function');
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
            }
            else {
                console.log(`⚠️ No content generated for ${task.name}`);
                return false;
            }
        }
        catch (error) {
            const errorMsg = error.message || 'Unknown error';
            console.error(`❌ Error generating ${task.name}: ${errorMsg}`);
            this.results.errors.push({ task: task.name, error: errorMsg });
            return false;
        }
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async generateAll() {
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
                }
                else {
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
            }
            catch (error) {
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
            }
            catch (error) {
                console.error(`❌ Failed to generate index: ${error.message}`);
            }
        }
        this.results.duration = Date.now() - startTime;
        this.results.success = this.results.successCount > 0;
        this.printSummary();
        return this.results;
    }
    printSummary() {
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
    static async generateCoreDocuments(context) {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['core-analysis', 'project-charter'],
            delayBetweenCalls: 1000
        });
        return await generator.generateAll();
    }
    static async generateManagementPlans(context) {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['management-plans'],
            delayBetweenCalls: 800
        });
        return await generator.generateAll();
    }
    static async generatePlanningArtifacts(context) {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['planning-artifacts'],
            delayBetweenCalls: 600
        });
        return await generator.generateAll();
    }
    static async generateTechnicalAnalysis(context) {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['technical-analysis'],
            delayBetweenCalls: 500
        });
        return await generator.generateAll();
    }
    // Add a static convenience method specifically for stakeholder documents
    static async generateStakeholderDocuments(context) {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['stakeholder-management'],
            delayBetweenCalls: 800,
            maxConcurrent: 1
        });
        return await generator.generateAll();
    }
    // Add this static method
    static async generateAllWithValidation(context) {
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
        }
        else {
            console.log('❌ Some documents are missing:');
            validation.missing.forEach(doc => console.log(`   • ${doc}`));
        }
        return { result, validation };
    }
    async validateGeneration() {
        const validation = {
            isComplete: true,
            missing: [],
            errors: []
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
            }
            catch (error) {
                validation.missing.push(`${task.name} (${expectedPath})`);
                validation.isComplete = false;
            }
        }
        // Check for README.md
        try {
            await fs.access('generated-documents/README.md');
            console.log(`✅ Found: Documentation Index`);
        }
        catch (error) {
            validation.missing.push('Documentation Index (README.md)');
            validation.isComplete = false;
        }
        return validation;
    }
    // Add this method to the DocumentGenerator class
    async validatePMBOKCompliance() {
        console.log('\n📋 Starting PMBOK 7.0 Compliance Validation...');
        const validation = {
            compliance: true,
            consistencyScore: 0,
            findings: {
                critical: [],
                warnings: [],
                recommendations: []
            },
            documentQuality: {}
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
            if (!config)
                continue;
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
            }
            catch (error) {
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
    async assessDocumentQuality(docKey, content, requiredElements) {
        const assessment = {
            score: 0,
            issues: [],
            strengths: []
        };
        // Content length check
        if (content.length < 500) {
            assessment.issues.push('Document appears too brief for comprehensive coverage');
        }
        else if (content.length > 2000) {
            assessment.strengths.push('Comprehensive content coverage');
            assessment.score += 20;
        }
        // Structure check (headers, sections)
        const headerCount = (content.match(/^#+\s/gm) || []).length;
        if (headerCount >= 3) {
            assessment.strengths.push('Well-structured with multiple sections');
            assessment.score += 15;
        }
        else {
            assessment.issues.push('Limited document structure - consider adding more sections');
        }
        // PMBOK terminology usage
        const pmbokTerms = [
            'deliverable', 'milestone', 'work package', 'baseline', 'change control',
            'risk register', 'stakeholder', 'requirements', 'assumptions', 'constraints'
        ];
        const foundTerms = pmbokTerms.filter(term => content.toLowerCase().includes(term.toLowerCase()));
        if (foundTerms.length >= 3) {
            assessment.strengths.push(`Uses appropriate PMBOK terminology (${foundTerms.length} terms found)`);
            assessment.score += 15;
        }
        // Required elements coverage
        const coveredElements = requiredElements.filter(element => this.contentContainsElement(content, element));
        const coveragePercentage = (coveredElements.length / requiredElements.length) * 100;
        assessment.score += Math.round(coveragePercentage * 0.5); // Up to 50 points for full coverage
        if (coveragePercentage === 100) {
            assessment.strengths.push('All required PMBOK elements covered');
        }
        else {
            assessment.issues.push(`Missing ${requiredElements.length - coveredElements.length} required elements`);
        }
        return assessment;
    }
    contentContainsElement(content, element) {
        const contentLower = content.toLowerCase();
        const elementLower = element.toLowerCase();
        // Check for exact phrase or key words from the element
        const keywords = elementLower.split(' ');
        return keywords.every(keyword => contentLower.includes(keyword)) ||
            contentLower.includes(elementLower);
    }
    async validateCrossDocumentConsistency(validation) {
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
        }
        catch (error) {
            validation.findings.warnings.push('Could not perform all consistency checks due to file access issues');
        }
    }
    calculateConsistencyScore(validation) {
        let score = 100;
        // Deduct points for issues
        score -= validation.findings.critical.length * 20;
        score -= validation.findings.warnings.length * 10;
        // Add points for document quality
        const qualityScores = Object.values(validation.documentQuality).map((doc) => doc.score);
        const avgQuality = qualityScores.length > 0 ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length : 0;
        score = Math.min(100, score + (avgQuality * 0.3));
        return Math.max(0, Math.round(score));
    }
    generatePMBOKRecommendations(validation) {
        // Standard PMBOK 7.0 recommendations
        validation.findings.recommendations.push('Ensure all documents follow PMBOK 7.0 performance domains: Stakeholders, Team, Development Approach, Planning, Project Work, Delivery, Measurement, Uncertainty');
        validation.findings.recommendations.push('Include clear traceability between project objectives and deliverables');
        validation.findings.recommendations.push('Maintain consistent terminology across all project documents');
        // Specific recommendations based on findings
        if (validation.findings.critical.some((f) => f.includes('stakeholder'))) {
            validation.findings.recommendations.push('Strengthen stakeholder management documentation with detailed analysis and engagement strategies');
        }
        if (validation.consistencyScore < 80) {
            validation.findings.recommendations.push('Review all documents for consistency in project scope, objectives, and terminology');
        }
    }
    printPMBOKValidationReport(validation) {
        console.log('\n📊 PMBOK 7.0 Compliance Validation Report');
        console.log('==========================================');
        console.log(`\n🎯 Overall Compliance: ${validation.compliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
        console.log(`📈 Consistency Score: ${validation.consistencyScore}/100`);
        if (validation.findings.critical.length > 0) {
            console.log(`\n🚨 Critical Issues (${validation.findings.critical.length}):`);
            validation.findings.critical.forEach((issue) => console.log(`   • ${issue}`));
        }
        if (validation.findings.warnings.length > 0) {
            console.log(`\n⚠️ Warnings (${validation.findings.warnings.length}):`);
            validation.findings.warnings.forEach((warning) => console.log(`   • ${warning}`));
        }
        console.log(`\n💡 Recommendations (${validation.findings.recommendations.length}):`);
        validation.findings.recommendations.forEach((rec) => console.log(`   • ${rec}`));
        console.log('\n📋 Document Quality Scores:');
        Object.entries(validation.documentQuality).forEach(([doc, quality]) => {
            console.log(`   • ${doc}: ${quality.score}/100`);
            if (quality.strengths.length > 0) {
                quality.strengths.forEach((strength) => console.log(`     ✅ ${strength}`));
            }
            if (quality.issues.length > 0) {
                quality.issues.forEach((issue) => console.log(`     ⚠️ ${issue}`));
            }
        });
    }
    // Enhanced generateAllWithValidation method
    static async generateAllWithPMBOKValidation(context) {
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
export async function generateAllDocuments(context) {
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
export async function generateDocumentsWithRetry(context, options = {}) {
    const maxRetries = options.maxRetries || 2;
    let lastResult = null;
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
    return lastResult;
}
/**
 * Generates a markdown file with a title and content in the specified output directory.
 * @param outputDir - The directory to write the file to.
 * @param fileName - The name of the markdown file.
 * @param title - The title to prepend to the content.
 * @param content - The main content to write.
 */
export async function generateMarkdownFile(outputDir, fileName, title, content) {
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
export function getAvailableCategories() {
    return [...new Set(GENERATION_TASKS.map(task => task.category))];
}
export function getTasksByCategory(category) {
    return GENERATION_TASKS.filter(task => task.category === category);
}
export function getTaskByKey(key) {
    return GENERATION_TASKS.find(task => task.key === key);
}
//# sourceMappingURL=documentGenerator.js.map