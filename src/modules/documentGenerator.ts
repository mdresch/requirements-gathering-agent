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
    { key: 'stakeholder-engagement-plan', name: 'Stakeholder Engagement Plan', func: 'getAiStakeholderEngagementPlan', emoji: '🤝', category: 'stakeholder-management', priority: 13 },
    
    // Planning Artifacts (Medium Priority)
    { key: 'work-breakdown-structure', name: 'Work Breakdown Structure', func: 'getAiWbs', emoji: '🏗️', category: 'planning-artifacts', priority: 14 },
    { key: 'wbs-dictionary', name: 'WBS Dictionary', func: 'getAiWbsDictionary', emoji: '📚', category: 'planning-artifacts', priority: 15 },
    { key: 'activity-list', name: 'Activity List', func: 'getAiActivityList', emoji: '📋', category: 'planning-artifacts', priority: 16 },
    { key: 'activity-duration-estimates', name: 'Activity Duration Estimates', func: 'getAiActivityDurationEstimates', emoji: '⏱️', category: 'planning-artifacts', priority: 17 },
    { key: 'activity-resource-estimates', name: 'Activity Resource Estimates', func: 'getAiActivityResourceEstimates', emoji: '📦', category: 'planning-artifacts', priority: 18 },
    { key: 'schedule-network-diagram', name: 'Schedule Network Diagram', func: 'getAiScheduleNetworkDiagram', emoji: '🔗', category: 'planning-artifacts', priority: 19 },
    { key: 'milestone-list', name: 'Milestone List', func: 'getAiMilestoneList', emoji: '🎯', category: 'planning-artifacts', priority: 20 },
    { key: 'schedule-development-input', name: 'Schedule Development Input', func: 'getAiDevelopScheduleInput', emoji: '📅', category: 'planning-artifacts', priority: 21 },
    
    // Stakeholder Management
    { key: 'stakeholder-register', name: 'Stakeholder Register', func: 'getAiStakeholderRegister', emoji: '👥', category: 'stakeholder-management', priority: 22 },
    
    // Technical Analysis (Lower Priority but Important)
    { key: 'data-model-suggestions', name: 'Data Model Suggestions', func: 'getAiDataModelSuggestions', emoji: '🗄️', category: 'technical-analysis', priority: 23 },
    { key: 'tech-stack-analysis', name: 'Tech Stack Analysis', func: 'getAiTechStackAnalysis', emoji: '⚙️', category: 'technical-analysis', priority: 24 },
    { key: 'risk-analysis', name: 'Risk Analysis', func: 'getAiRiskAnalysis', emoji: '🔍', category: 'technical-analysis', priority: 25 },
    { key: 'acceptance-criteria', name: 'Acceptance Criteria', func: 'getAiAcceptanceCriteria', emoji: '✔️', category: 'technical-analysis', priority: 26 },
    { key: 'compliance-considerations', name: 'Compliance Considerations', func: 'getAiComplianceConsiderations', emoji: '⚖️', category: 'technical-analysis', priority: 27 },
    { key: 'ui-ux-considerations', name: 'UI/UX Considerations', func: 'getAiUiUxConsiderations', emoji: '🎨', category: 'technical-analysis', priority: 28 }
];

interface GenerationOptions {
    includeCategories?: string[];
    excludeCategories?: string[];
    maxConcurrent?: number;
    delayBetweenCalls?: number;
    continueOnError?: boolean;
    generateIndex?: boolean;
    cleanup?: boolean;
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
            cleanup: options.cleanup ?? true
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
            
            const aiFunction = llmProcessor[task.func] as (context: string) => Promise<string | null>;
            if (typeof aiFunction !== 'function') {
                const error = `AI function ${task.func} not found`;
                console.error(`❌ ${error}`);
                this.results.errors.push({ task: task.name, error });
                return false;
            }
            
            const content = await aiFunction(this.context);
            
            if (content && content.trim().length > 0) {
                saveDocument(task.key, content);
                this.results.generatedFiles.push(`${task.category}/${DOCUMENT_CONFIG[task.key]?.filename || task.key + '.md'}`);
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
}

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
**Generated by:** Requirements Gathering Agent v2.1.1

---

${content}`;
    
    await fs.writeFile(filePath, fileContent, 'utf-8');
    console.log(`✅ Generated: ${filePath}`);
}

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
