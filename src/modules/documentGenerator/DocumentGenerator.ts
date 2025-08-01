// ...existing code...

// ...existing code...
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
import { join } from 'path';
import process from 'process';
import { writeFile } from 'fs/promises';
import { PMBOKValidator } from '../pmbokValidation/PMBOKValidator.js';
import { createProcessor } from './ProcessorFactory.js';
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
import { readFileSync } from 'fs';
// Load processor-config.json at runtime to avoid import assertions under ESM
const processorConfig: Record<string, any> = JSON.parse(
  readFileSync(new URL('./processor-config.json', import.meta.url), 'utf8')
);
import { 
    GenerationOptions, 
    GenerationResult, 
    GenerationTask,
    ValidationResult
} from './types';
import { ProjectContext } from '../ai/types';
import { DOCUMENT_CONFIG } from '../fileManager.js';
import { GENERATION_TASKS, getAvailableCategories, getTasksByCategory, getTaskByKey } from './generationTasks.js';

/**
 * Class responsible for generating project documentation
 */
export class DocumentGenerator {
    private options: Required<GenerationOptions>;
    private context: string;
    private results: GenerationResult;
    private aiProcessor: AIProcessor;
    private configManager: ConfigurationManager;
    // ...existing code...
    constructor(
        context: string,
        options: Partial<GenerationOptions> = {},
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
    }

    /**
     * Generate Data Governance Framework document
     * @param context Project context
     */
    public async generateDataGovernanceFramework(context: ProjectContext): Promise<boolean> {
        // Find the task by key
        const taskKey = 'data-governance-framework';
        const task = getTaskByKey(taskKey);
        if (!task) {
            console.error(`❌ Unknown document key: ${taskKey}`);
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
     * Generate Data Governance Plan document
     * @param context Project context
     */
    public async generateDataGovernancePlan(context: ProjectContext): Promise<boolean> {
        try {
            const processor = await createProcessor('data-governance-plan');
            const output = await processor.process(context);
            await saveDocument('data-governance-plan', output);
            return true;
        } catch (error) {
            console.error('Error generating Data Governance Plan:', error);
            return false;
        }
    }

    /**
     * Save document output to file
     * @param output Document output to save
     * @param fileName Optional custom file name (without extension)
     */
    private async saveDocumentOutput(output: any, fileName: string = 'data-lifecycle-management'): Promise<void> {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            
            // Ensure output directory exists
            await fs.mkdir(this.options.outputDir, { recursive: true });
            
            const filePath = path.join(this.options.outputDir, `${fileName}.${this.options.format}`);
            await fs.writeFile(filePath, output, 'utf-8');
            
            // Add to generated files list
            this.results.generatedFiles.push(filePath);
            this.results.successCount++;
            
        } catch (error: any) {
            console.error(`❌ Error saving document output: ${error.message}`);
            this.results.failureCount++;
            this.results.errors.push({
                task: fileName,
                error: error.message
            });
            throw error; // Re-throw to be caught by the calling method
        }
    }

    /**
     * Generate Data Lifecycle Management document
     * @param context Project context
     */
    public async generateDataLifecycleManagement(context: ProjectContext): Promise<boolean> {
        try {
            const processor = new (await import('../documentTemplates/dmbok/DataLifecycleManagementProcessor.js')).DataLifecycleManagementProcessor();
            const output = await processor.process(context);
            await this.saveDocumentOutput(output, 'data-lifecycle-management');
            console.log('✅ Successfully generated Data Lifecycle Management document');
            return true;
        } catch (error: any) {
            console.error('❌ Error generating Data Lifecycle Management document:', error.message);
            return false;
        }
    }

    /**
     * Generate Master Data Management Strategy document
     * @param context Project context
     */
    public async generateMasterDataManagementStrategy(context: ProjectContext): Promise<boolean> {
        // Find the task by key
        const taskKey = 'master-data-management-strategy';
        const task = getTaskByKey(taskKey);
        if (!task) {
            console.error(`❌ Unknown document key: ${taskKey}`);
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

    // ...rest of the class methods...

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
        return await processors.getMissionVisionAndCoreValues(context) ?? '';
    }

    async getAiProjectPurpose(context: string): Promise<string> {
        return await processors.getProjectPurpose(context) ?? '';
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
    async getAiDmbokDataManagementStrategy(context: string): Promise<string> {
        if (processors.getAiDmbokDataManagementStrategy) {
            return await processors.getAiDmbokDataManagementStrategy(context) ?? '';
        }
        // Fallback: try to use the template processor directly
        try {
            const { DataManagementStrategyTemplate } = await import('../documentTemplates/dmbok/dataManagementStrategyTemplate.js');
            const template = new DataManagementStrategyTemplate();
            return template.buildPrompt({ projectName: context });
        } catch {
            return '';
        }
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

    async getProjectKickoffPreparationsChecklist(context: string): Promise<string> {
        // Import the processor and run its process method
        const { ProjectKickoffPreparationsChecklistProcessor } = await import('../documentTemplates/planningArtifacts/projectKickoffPreparationsChecklistProcessor.js');
        const processor = new ProjectKickoffPreparationsChecklistProcessor();
        const output = await processor.process({ projectName: context });
        return output.content;
    }

    /**
     * Filter and sort tasks based on options and dependencies
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

        // Build map for quick lookup
        const taskMap = new Map(tasks.map(t => [t.key, t]));

        // Initialize in-degree and adjacency lists
        const inDegree = new Map<string, number>();
        const adj = new Map<string, string[]>();
        tasks.forEach(t => { inDegree.set(t.key, 0); adj.set(t.key, []); });

        // Populate graph edges from dependencies
        tasks.forEach(t => {
            const deps: string[] = processorConfig[t.key]?.dependencies || [];
            deps.forEach(dep => {
                if (!taskMap.has(dep)) {
                    throw new Error(`Processor dependency not found: ${dep} for task ${t.key}`);
                }
                adj.get(dep)!.push(t.key);
                inDegree.set(t.key, (inDegree.get(t.key) || 0) + 1);
            });
        });

        // Kahn's algorithm for topological sort, using priority to order zero-degree tasks
        const sorted: GenerationTask[] = [];
        let zeroDeg = tasks.filter(t => (inDegree.get(t.key) || 0) === 0);
        zeroDeg.sort((a, b) => a.priority - b.priority);

        while (zeroDeg.length > 0) {
            const current = zeroDeg.shift()!;
            sorted.push(current);

            adj.get(current.key)!.forEach(nextKey => {
                inDegree.set(nextKey, (inDegree.get(nextKey) || 1) - 1);
                if (inDegree.get(nextKey) === 0) {
                    zeroDeg.push(taskMap.get(nextKey)!);
                }
            });
            zeroDeg.sort((a, b) => a.priority - b.priority);
        }

        if (sorted.length !== tasks.length) {
            throw new Error('Cycle detected in document processor dependencies');
        }

        return sorted;
    }

    /**
     * Generate a single document
     * @param task Task to generate document for
     * @returns Whether generation was successful
     */
    private async generateSingleDocument(task: GenerationTask): Promise<boolean> {
         try {
             console.log(`${task.emoji} Generating ${task.name}...`);
            // Use generic ProcessorFactory to create and run the processor
            const processor = await createProcessor(task.key);
            const output = await processor.process({ projectName: this.context });
            const content = output.content;
             
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
            includeCategories: ['core-analysis', 'project-charter', 'scope-management', 'risk-management'],
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
    }    /**
     * Generate technical analysis including technical design documents
     * @param context Project context
     * @returns Generation result
     */
    public static async generateTechnicalAnalysis(context: string): Promise<GenerationResult> {
        const generator = new DocumentGenerator(context, {
            includeCategories: ['technical-analysis', 'technical-design'],
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
    }    /**
     * Validate PMBOK compliance across documents using the real PMBOKValidator
     * @returns Comprehensive compliance validation result
     */
    public async validatePMBOKCompliance(): Promise<{ 
        compliance: boolean; 
        consistencyScore: number; 
        documentQuality: Record<string, any>;
        validationResult?: any;
    }> {
        console.log('🔍 Running comprehensive PMBOK validation...');
        
        try {
            // Initialize the real PMBOKValidator
            const validator = new PMBOKValidator(this.options.outputDir);
            
            // Get all available document types from the configuration
            const documentTypes = Object.keys(processors);
            
            // Perform comprehensive validation
            const validationResult = await validator.performComprehensiveValidation(documentTypes);
              // Extract key metrics for compatibility with existing interfaces
            const consistencyScore = validationResult.pmbokCompliance.consistencyScore || 0;
            const documentQuality = validationResult.pmbokCompliance.documentQuality || {};
            
            // Determine overall compliance based on our enhanced criteria
            const compliance = this.determineOverallCompliance(validationResult);
            
            console.log(`✅ PMBOK validation complete. Consistency Score: ${consistencyScore}/100`);
            
            return {
                compliance,
                consistencyScore,
                documentQuality,
                validationResult // Include full validation result for detailed reporting
            };
            
        } catch (error) {
            console.error('❌ Error during PMBOK validation:', error);
            
            // Fallback to ensure the system continues to work
            return {
                compliance: false,
                consistencyScore: 0,
                documentQuality: {},
                validationResult: { error: error instanceof Error ? error.message : 'Unknown validation error' }
            };
        }
    }
      /**
     * Determine overall compliance based on comprehensive validation results
     * @param validationResult Full validation result from PMBOKValidator
     * @returns Whether the documents meet compliance standards
     */
    private determineOverallCompliance(validationResult: any): boolean {
        // More sophisticated compliance determination
        const consistencyScore = validationResult.pmbokCompliance?.consistencyScore || 0;
        const documentQuality = validationResult.pmbokCompliance?.documentQuality || {};
        
        // Check if consistency score meets threshold
        if (consistencyScore < 70) {
            return false;
        }
        
        // Check if any critical documents have very low scores
        const criticalDocuments = ['project-charter', 'stakeholder-register', 'scope-management-plan'];
        for (const docType of criticalDocuments) {
            const quality = documentQuality[docType];
            if (quality && quality.score < 60) {
                return false;
            }
        }
        
        // Check for critical missing documents
        const generationSuccess = validationResult.validation?.isComplete;
        if (generationSuccess === false) {
            return false;
        }
        
        return true;
    }    // Placeholder methods removed - now using real PMBOKValidator

    /**
     * Generate all documents and validate PMBOK compliance
     * @param context Project context
     * @returns Generation and compliance result
     */
    public static async generateAllWithPMBOKValidation(context: string): Promise<{ 
        result: GenerationResult;
        compliance: { 
            score: number; 
            details: string[];
            isCompliant: boolean;
            qualityReport: any;
            actionableInsights: string[];
            improvementRecommendations: string[];
        };
    }> {
        console.log('🚀 Starting Generate-and-Validate Cycle...');
        console.log('📊 This is the ADPA Quality Assurance Engine in action');
        
        const generator = new DocumentGenerator(context);
        
        // Phase 1: Generation
        console.log('\n🔄 Phase 1: Document Generation');
        const result = await generator.generateAll();
        
        if (!result.success) {
            return {
                result: result,
                compliance: {
                    score: 0,
                    details: ['Generation failed - cannot validate'],
                    isCompliant: false,
                    qualityReport: null,
                    actionableInsights: ['Fix generation errors before validation'],
                    improvementRecommendations: ['Check configuration and context quality']
                }
            };
        }
        
        console.log(`✅ Generated ${result.successCount} documents successfully`);
        
        // Phase 2: Comprehensive PMBOK Validation
        console.log('\n🔍 Phase 2: PMBOK 7.0 Validation & Quality Assessment');
        const pmbokValidation = await generator.validatePMBOKCompliance();
        
        // Phase 3: Generate Quality Report with Actionable Insights
        console.log('\n📋 Phase 3: Quality Analysis & Improvement Recommendations');
        
        const actionableInsights: string[] = [];
        const improvementRecommendations: string[] = [];
        
        // Analyze document quality scores and provide specific guidance
        if (pmbokValidation.documentQuality) {
            for (const [docKey, quality] of Object.entries(pmbokValidation.documentQuality)) {
                const docQuality = quality as any;
                if (docQuality.score < 70) {
                    actionableInsights.push(`🚨 ${docKey}: Score ${docQuality.score}/100 - Needs immediate attention`);
                    
                    // Specific recommendations based on missing elements
                    if (docQuality.missingElements?.length > 0) {
                        improvementRecommendations.push(
                            `${docKey}: Add missing PMBOK elements: ${docQuality.missingElements.slice(0, 3).join(', ')}${docQuality.missingElements.length > 3 ? '...' : ''}`
                        );
                    }
                    
                    if (docQuality.structureScore < 60) {
                        improvementRecommendations.push(`${docKey}: Improve document structure and section organization`);
                    }
                    
                    if (docQuality.terminologyScore < 60) {
                        improvementRecommendations.push(`${docKey}: Enhance PMBOK terminology usage in prompts`);
                    }
                }
            }
        }
        
        // Cross-document consistency insights
        if (pmbokValidation.consistencyScore < 80) {
            actionableInsights.push(`🔗 Cross-document consistency needs improvement: ${pmbokValidation.consistencyScore}/100`);
            improvementRecommendations.push('Review project charter alignment across all documents');
            improvementRecommendations.push('Ensure stakeholder information is consistent between documents');
        }
        
        // Generate overall quality insights
        const overallScore = pmbokValidation.consistencyScore;
        const isCompliant = pmbokValidation.compliance && overallScore >= 75;
        
        if (!isCompliant) {
            actionableInsights.push('🎯 Overall PMBOK compliance below acceptable threshold');
            improvementRecommendations.push('Focus on top 3 lowest-scoring documents for prompt engineering');
            improvementRecommendations.push('Review PMBOK 7.0 performance domains integration');
        }
        
        // Success insights
        if (isCompliant) {
            actionableInsights.push('✅ PMBOK compliance achieved - documents meet professional standards');
        }
        
        console.log('\n📊 Quality Assessment Complete');
        console.log(`🎯 Overall Compliance Score: ${overallScore}/100`);
        console.log(`📋 Status: ${isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
        
        if (actionableInsights.length > 0) {
            console.log('\n💡 Key Insights:');
            actionableInsights.forEach((insight, i) => console.log(`   ${i + 1}. ${insight}`));
        }
        
        if (improvementRecommendations.length > 0) {
            console.log('\n🔧 Improvement Recommendations:');
            improvementRecommendations.slice(0, 5).forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));
        }
        
        // Save comprehensive quality report
        const qualityReportPath = join(process.cwd(), 'generated-documents', 'quality-assessment-report.md');
        const qualityReportContent = this.generateQualityReport(pmbokValidation, actionableInsights, improvementRecommendations);
        
        try {
            await writeFile(qualityReportPath, qualityReportContent);
            console.log(`\n📄 Comprehensive quality report saved: ${qualityReportPath}`);
        } catch (error) {
            console.warn('Could not save quality report:', error);
        }
        
        return {
            result: result,
            compliance: {
                score: overallScore,
                details: [
                    `PMBOK Compliance: ${pmbokValidation.compliance ? 'Compliant' : 'Non-compliant'}`,
                    `Consistency Score: ${pmbokValidation.consistencyScore}/100`,
                    `Documents Assessed: ${Object.keys(pmbokValidation.documentQuality || {}).length}`,
                    `Critical Issues: ${actionableInsights.filter(i => i.includes('🚨')).length}`,
                    `Improvement Areas: ${improvementRecommendations.length}`
                ],
                isCompliant,
                qualityReport: pmbokValidation,
                actionableInsights,
                improvementRecommendations
            }
        };
    }

    /**
     * Generate a comprehensive quality assessment report in markdown format
     */
    private static generateQualityReport(
        validation: any, 
        insights: string[], 
        recommendations: string[]
    ): string {
        const timestamp = new Date().toISOString();
        
        return `# ADPA Quality Assurance Report

**Generated:** ${timestamp}  
**System:** ADPA Quality Assurance Engine v2.0  
**Standard:** PMBOK 7.0 Performance Domains  

## Executive Summary

**Overall Compliance Score:** ${validation.consistencyScore}/100  
**Status:** ${validation.compliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}  
**Documents Assessed:** ${Object.keys(validation.documentQuality || {}).length}  

## Key Quality Insights

${insights.map((insight, i) => `${i + 1}. ${insight.replace(/🚨|🔗|🎯|✅/g, '')}`).join('\n')}

## Document Quality Breakdown

${Object.entries(validation.documentQuality || {}).map(([key, quality]: [string, any]) => {
    return `### ${key}
- **Score:** ${quality.score}/100
- **Issues Found:** ${quality.issues?.length || 0}
- **Strengths:** ${quality.strengths?.length || 0}
- **Status:** ${quality.score >= 70 ? '✅ Acceptable' : '❌ Needs Improvement'}

${quality.issues?.length > 0 ? `**Issues:** ${quality.issues.slice(0, 5).join(', ')}${quality.issues.length > 5 ? '...' : ''}` : ''}
${quality.strengths?.length > 0 ? `**Strengths:** ${quality.strengths.join(', ')}` : ''}
`;
}).join('\n')}

## Improvement Recommendations

${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## Cross-Document Consistency

**Consistency Score:** ${validation.consistencyScore}/100

${validation.consistencyIssues ? 
`**Issues Found:**
${validation.consistencyIssues.map((issue: string) => `- ${issue}`).join('\n')}` : 
'No significant consistency issues detected.'}

## Next Steps for Quality Improvement

1. **Priority Focus:** Address documents scoring below 70/100
2. **Prompt Engineering:** Enhance prompts for low-scoring documents
3. **PMBOK Integration:** Strengthen performance domain coverage
4. **Consistency Review:** Align cross-document references and terminology
5. **Iterative Improvement:** Re-run validation after improvements

---

*This report was generated by the ADPA Quality Assurance Engine - your intelligent document compliance partner.*
`;    }
}

/**
 * Version information
 */
export const documentGeneratorVersion = '2.1.3';
