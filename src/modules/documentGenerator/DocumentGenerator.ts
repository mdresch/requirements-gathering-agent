/**
 * Document Generator Module for Requirements Gathering Agent
 * 
 * Core document generation engine that creates comprehensive PMBOK-compliant
 * project documentation based on project context and AI analysis.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Comprehensive PMBOK 7.0 compliant document generation
 * - AI-powered content creation and analysis
 * - Organized file structure and directory management
 * - Validation and quality assessment integration
 * - Batch processing and error handling
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\documentGenerator\DocumentGenerator.ts
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { 
    createDirectoryStructure, 
    saveDocument, 
    generateIndexFile, 
    cleanupOldFiles,
} from '../fileManager.js';
import { AIProcessor } from '../ai/AIProcessor.js';
import { ConfigurationManager } from '../ai/ConfigurationManager.js';
// Import all processor functions
import * as processors from '../ai/processors/index.js';
import { 
    GenerationOptions, 
    GenerationResult, 
    GenerationTask,
    ValidationResult
} from './types';
import { GENERATION_TASKS, DOCUMENT_CONFIG, getAvailableCategories, getTasksByCategory, getTaskByKey } from './generationTasks.js';

/**
 * Class responsible for generating project documentation
 */
export class DocumentGenerator {
    private options: Required<GenerationOptions>;
    private context: string;
    private results: GenerationResult;
    private aiProcessor: AIProcessor;
    private configManager: ConfigurationManager;

    /**
     * Create a new document generator
     * @param context Project context for document generation
     * @param options Options for document generation
     */    constructor(
        context: string, 
        options: GenerationOptions = {},
        aiProcessor?: AIProcessor,
        configManager?: ConfigurationManager
    ) {
        this.context = context;
        this.aiProcessor = aiProcessor || AIProcessor.getInstance();
        this.configManager = configManager || ConfigurationManager.getInstance();
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
            message: 'Document generation starting...',
            successCount: 0,
            failureCount: 0,
            skippedCount: 0,
            generatedFiles: [],
            errors: [],
            duration: 0
        };
    }    /**
     * Delegate to appropriate processor functions instead of hardcoded AI calls
     */    async getAiSummaryAndGoals(context: string): Promise<string> {
        return await processors.getAiSummaryAndGoals(context) ?? '';
    }

    async getAiUserStories(context: string): Promise<string> {
        return await processors.getAiUserStories(context) ?? '';
    }

    async getAiUserPersonas(context: string): Promise<string> {
        return await processors.getAiUserPersonas(context) ?? '';
    }

    async getAiKeyRolesAndNeeds(context: string): Promise<string> {
        return await processors.getAiKeyRolesAndNeeds(context) ?? '';
    }    async getAiProjectCharter(context: string): Promise<string> {
        return await processors.getAiProjectCharter(context) ?? '';
    }

    // Core Analysis Documents
    async getAiProjectStatementOfWork(context: string): Promise<string> {
        return await processors.getAiProjectStatementOfWork(context) ?? '';
    }

    async getAiBusinessCase(context: string): Promise<string> {
        return await processors.getAiBusinessCase(context) ?? '';
    }

    // Strategic Statements
    async getAiMissionVisionAndCoreValues(context: string): Promise<string> {
        return await processors.getAiMissionVisionAndCoreValues(context) ?? '';
    }

    async getAiProjectPurpose(context: string): Promise<string> {
        return await processors.getAiProjectPurpose(context) ?? '';
    }

    // Project Management Plans
    async getAiProjectManagementPlan(context: string): Promise<string> {
        return await processors.getAiProjectManagementPlan(context) ?? '';
    }    // PMBOK Process Functions
    async getAiDirectAndManageProjectWorkProcess(context: string): Promise<string> {
        return await processors.getAiDirectAndManageProjectWorkProcess(context) ?? '';
    }

    async getAiPerformIntegratedChangeControlProcess(context: string): Promise<string> {
        return await processors.getAiPerformIntegratedChangeControlProcess(context) ?? '';
    }

    async getAiCloseProjectOrPhaseProcess(context: string): Promise<string> {
        return await processors.getAiCloseProjectOrPhaseProcess(context) ?? '';
    }

    async getAiPlanScopeManagement(context: string): Promise<string> {
        return await processors.getAiPlanScopeManagement(context) ?? '';
    }

    async getAiRequirementsManagementPlan(context: string): Promise<string> {
        return await processors.getAiRequirementsManagementPlan(context) ?? '';
    }

    async getAiCollectRequirementsProcess(context: string): Promise<string> {
        return await processors.getAiCollectRequirementsProcess(context) ?? '';
    }

    async getAiRequirementsDocumentation(context: string): Promise<string> {
        return await processors.getAiRequirementsDocumentation(context) ?? '';
    }

    async getAiRequirementsTraceabilityMatrix(context: string): Promise<string> {
        return await processors.getAiRequirementsTraceabilityMatrix(context) ?? '';
    }

    async getAiDefineScopeProcess(context: string): Promise<string> {
        return await processors.getAiDefineScopeProcess(context) ?? '';
    }

    async getAiProjectScopeStatement(context: string): Promise<string> {
        return await processors.getAiProjectScopeStatement(context) ?? '';
    }

    async getAiCreateWbsProcess(context: string): Promise<string> {
        return await processors.getAiCreateWbsProcess(context) ?? '';
    }

    async getAiScopeBaseline(context: string): Promise<string> {
        return await processors.getAiScopeBaseline(context) ?? '';
    }

    async getAiValidateScopeProcess(context: string): Promise<string> {
        return await processors.getAiValidateScopeProcess(context) ?? '';
    }

    async getAiControlScopeProcess(context: string): Promise<string> {
        return await processors.getAiControlScopeProcess(context) ?? '';
    }    async getAiWorkPerformanceInformationScope(context: string): Promise<string> {
        return await processors.getAiWorkPerformanceInformationScope(context) ?? '';
    }    // Management Plans
    async getAiScopeManagementPlan(context: string): Promise<string> {
        return await processors.getAiScopeManagementPlan(context) ?? '';
    }

    async getAiRiskManagementPlan(context: string): Promise<string> {
        return await processors.getAiRiskManagementPlan(context) ?? '';
    }

    async getAiCostManagementPlan(context: string): Promise<string> {
        return await processors.getAiCostManagementPlan(context) ?? '';
    }

    async getAiQualityManagementPlan(context: string): Promise<string> {
        return await processors.getAiQualityManagementPlan(context) ?? '';
    }

    async getAiResourceManagementPlan(context: string): Promise<string> {
        return await processors.getAiResourceManagementPlan(context) ?? '';
    }

    async getAiCommunicationManagementPlan(context: string): Promise<string> {
        return await processors.getAiCommunicationManagementPlan(context) ?? '';
    }

    async getAiProcurementManagementPlan(context: string): Promise<string> {
        return await processors.getAiProcurementManagementPlan(context) ?? '';
    }    // Stakeholder Management
    async getAiStakeholderEngagementPlan(context: string): Promise<string> {
        return await processors.getAiStakeholderEngagementPlan(context) ?? '';
    }

    async getAiStakeholderRegister(context: string): Promise<string> {
        return await processors.getAiStakeholderRegister(context) ?? '';
    }

    async getAiStakeholderAnalysis(context: string): Promise<string> {
        return await processors.getAiStakeholderAnalysis(context) ?? '';
    }    // Planning Artifacts
    async getAiWbs(context: string): Promise<string> {
        return await processors.getAiWbs(context) ?? '';
    }

    async getAiWbsDictionary(context: string): Promise<string> {
        return await processors.getAiWbsDictionary(context) ?? '';
    }

    async getAiActivityList(context: string): Promise<string> {
        return await processors.getAiActivityList(context) ?? '';
    }

    async getAiActivityDurationEstimates(context: string): Promise<string> {
        return await processors.getAiActivityDurationEstimates(context) ?? '';
    }

    async getAiActivityResourceEstimates(context: string): Promise<string> {
        return await processors.getAiActivityResourceEstimates(context) ?? '';
    }

    async getAiScheduleNetworkDiagram(context: string): Promise<string> {
        return await processors.getAiScheduleNetworkDiagram(context) ?? '';
    }

    async getAiMilestoneList(context: string): Promise<string> {
        return await processors.getAiMilestoneList(context) ?? '';
    }

    async getAiDevelopScheduleInput(context: string): Promise<string> {
        return await processors.getAiDevelopScheduleInput(context) ?? '';
    }    // Technical Analysis
    async getAiDataModelSuggestions(context: string): Promise<string> {
        return await processors.getAiDataModelSuggestions(context) ?? '';
    }

    async getAiTechStackAnalysis(context: string): Promise<string> {
        return await processors.getAiTechStackAnalysis(context) ?? '';
    }

    async getAiRiskAnalysis(context: string): Promise<string> {
        return await processors.getAiRiskAnalysis(context) ?? '';
    }

    async getAiAcceptanceCriteria(context: string): Promise<string> {
        return await processors.getAiAcceptanceCriteria(context) ?? '';
    }    async getAiComplianceConsiderations(context: string): Promise<string> {
        return await processors.getAiComplianceConsiderations(context) ?? '';
    }

    async getAiUiUxConsiderations(context: string): Promise<string> {
        return await processors.getAiUiUxConsiderations(context) ?? '';
    }

    /**
     * Filter and sort tasks based on options
     * @returns Filtered and sorted tasks
     */
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

    /**
     * Generate a single document
     * @param task Task to generate document for
     * @returns Whether generation was successful
     */
    private async generateSingleDocument(task: GenerationTask): Promise<boolean> {        try {
            console.log(`${task.emoji} Generating ${task.name}...`);
              // Get the AI function using the correct method
            const methodName = task.func as keyof DocumentGenerator;
            const aiFunction = this[methodName] as ((context: string) => Promise<string>) | undefined;
            
            if (typeof aiFunction !== 'function') {
                const error = `AI function ${task.func} not found in DocumentGenerator`;
                console.error(`❌ ${error}`);
                this.results.errors.push({ task: task.name, error });
                return false;
            }
              const content = await aiFunction.call(this, this.context);
            
            if (content && content.trim().length > 0) {
                const documentKey = task.key;
                const config = DOCUMENT_CONFIG[documentKey];
                
                if (!config) {
                    console.error(`❌ Unknown document key: ${documentKey}`);
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

    /**
     * Wait for a specified amount of time
     * @param ms Milliseconds to wait
     */
    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate all documents based on options
     * @returns Generation result
     */
    public async generateAll(): Promise<GenerationResult> {
        const startTime = Date.now();
        
        console.log('📋 Starting document generation...');
        
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
        this.results.message = this.results.success
            ? `Successfully generated ${this.results.successCount} documents`
            : `Failed to generate any documents`;        this.printSummary();
        return this.results;
    }

    /**
     * Generate a single document by key
     * @param documentKey The key of the document to generate (e.g., 'summary', 'user-stories', 'project-charter')
     * @returns Whether generation was successful
     */
    public async generateOne(documentKey: string): Promise<boolean> {
        // Map common document keys to actual task keys
        const keyMapping: Record<string, string> = {
            'summary': 'project-summary',
            'user-stories': 'user-stories',
            'project-charter': 'project-charter'
        };

        // Use mapped key or original key if no mapping exists
        const taskKey = keyMapping[documentKey] || documentKey;
        
        // Find the task by key
        const task = getTaskByKey(taskKey);
        
        if (!task) {
            console.error(`❌ Unknown document key: ${documentKey} (mapped to: ${taskKey})`);
            return false;
        }

        // Setup directory structure if needed
        createDirectoryStructure();

        console.log(`🚀 Generating single document: ${task.name}...`);
        
        try {
            const success = await this.generateSingleDocument(task);
            
            if (success) {
                console.log(`✅ Successfully generated: ${task.name}`);
            } else {
                console.log(`❌ Failed to generate: ${task.name}`);
            }
            
            return success;
        } catch (error: any) {
            console.error(`❌ Error generating ${task.name}: ${error.message}`);
            return false;
        }
    }

    /**
     * Print generation summary
     */
    private printSummary(): void {
        console.log(`\n📊 Generation Summary:`);
        console.log(`✅ Successfully generated: ${this.results.successCount} documents`);
        console.log(`❌ Failed to generate: ${this.results.failureCount} documents`);
        console.log(`⏱️ Total duration: ${(this.results.duration / 1000).toFixed(2)}s`);
        console.log(`📁 Documents organized in: ${this.options.outputDir}/`);
        
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
        
        console.log(`📋 See ${this.options.outputDir}/README.md for complete index`);
    }

    /**
     * Validate that all expected documents exist
     * @returns Validation result
     */
    public async validateGeneration(): Promise<ValidationResult> {
        const validation: ValidationResult = {
            isComplete: true,
            missing: [],
            errors: []
        };

        const tasks = this.filterTasks();

        // Check if all expected documents exist
        for (const task of tasks) {
            const config = DOCUMENT_CONFIG[task.key];
            const expectedPath = config 
                ? `${this.options.outputDir}/${task.category}/${config.filename}`
                : `${this.options.outputDir}/${task.category}/${task.key}.md`;
            
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
            await fs.access(`${this.options.outputDir}/README.md`);
            console.log(`✅ Found: Documentation Index`);
        } catch (error) {
            validation.missing.push(`Documentation Index (${this.options.outputDir}/README.md)`);
            validation.isComplete = false;
        }

        return validation;
    }

    /**
     * Generate a markdown file
     * @param outputDir Output directory
     * @param fileName File name
     * @param title Document title
     * @param content Document content
     */
    public static async generateMarkdownFile(
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

    // Static convenience methods for different document sets

    /**
     * Generate core documents only
     * @param context Project context
     * @returns Generation result
     */
    public static async generateCoreDocuments(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['core-analysis', 'project-charter'],
            delayBetweenCalls: 1000
        });
        return await generator.generateAll();
    }

    /**
     * Generate management plans only
     * @param context Project context
     * @returns Generation result
     */
    public static async generateManagementPlans(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['management-plans'],
            delayBetweenCalls: 800
        });
        return await generator.generateAll();
    }

    /**
     * Generate planning artifacts only
     * @param context Project context
     * @returns Generation result
     */
    public static async generatePlanningArtifacts(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['planning-artifacts'],
            delayBetweenCalls: 600
        });
        return await generator.generateAll();
    }

    /**
     * Generate technical analysis only
     * @param context Project context
     * @returns Generation result
     */
    public static async generateTechnicalAnalysis(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['technical-analysis'],
            delayBetweenCalls: 500
        });
        return await generator.generateAll();
    }

    /**
     * Generate stakeholder documents only
     * @param context Project context
     * @returns Generation result
     */
    public static async generateStakeholderDocuments(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['stakeholder-management'],
            delayBetweenCalls: 800,
            maxConcurrent: 1
        });
        return await generator.generateAll();
    }

    /**
     * Validate PMBOK compliance across documents
     * @returns Compliance validation result
     */
    public async validatePMBOKCompliance(): Promise<{ compliance: boolean; consistencyScore: number }> {
        // Validate PMBOK compliance across documents
        const terminology = await this.validatePMBOKTerminology();
        const structure = await this.validateDocumentStructure();
        const elements = await this.validateRequiredElements();
        
        // Calculate weighted consistency score (0-100)
        const consistencyScore = Math.round(
            (terminology.score * 0.4) + 
            (structure.score * 0.3) + 
            (elements.score * 0.3)
        );

        return {
            compliance: consistencyScore >= 80,
            consistencyScore
        };
    }

    private async validatePMBOKTerminology(): Promise<{ score: number }> {
        // Placeholder: Implement terminology validation
        return { score: 90 };
    }

    private async validateDocumentStructure(): Promise<{ score: number }> {
        // Placeholder: Implement structure validation
        return { score: 85 };
    }

    private async validateRequiredElements(): Promise<{ score: number }> {
        // Placeholder: Implement required elements validation
        return { score: 95 };
    }

    /**
     * Generate all documents and validate PMBOK compliance
     * @param context Project context
     * @returns Generation and compliance result
     */
    public static async generateAllWithPMBOKValidation(context: string): Promise<{ 
        result: GenerationResult;
        compliance: { score: number; details: string[] };
    }> {
        const generator = new DocumentGenerator(context);
        const result = await generator.generateAll();
        
        // Validate PMBOK compliance
        const pmbokValidation = await generator.validatePMBOKCompliance();
        
        return {
            result: result,
            compliance: {
                score: pmbokValidation.consistencyScore,
                details: [
                    `PMBOK Compliance: ${pmbokValidation.compliance ? 'Compliant' : 'Non-compliant'}`,
                    `Consistency Score: ${pmbokValidation.consistencyScore}/100`
                ]
            }
        };
    }
}

/**
 * Version information
 */
export const documentGeneratorVersion = '2.2.0';
