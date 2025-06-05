/**
 * Main CLI logic for Requirements Gathering Agent
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { 
    getAiSummaryAndGoals,
    getAiUserStories,
    getAiProjectCharter,
    getAiScopeManagementPlan,
    getAiRiskManagementPlan,
    getAiWbs,
    getAiStakeholderRegister
} from './modules/llmProcessor.js';
import { generateMarkdownFile } from './modules/fileUtils.js';

/**
 * Options for document generation
 */
interface GenerationOptions {
    /** Output directory for generated documents */
    outputDir: string;
    /** Whether to suppress progress messages */
    quiet: boolean;
    /** Output format (markdown, json, yaml) */
    format: string;
    /** Number of retry attempts for failed generations */
    retries: number;
}

/**
 * Structure of a generated document
 */
interface GeneratedDocument {
    /** Name of the document (used for file naming) */
    name: string;
    /** Generated content of the document */
    content: string | null;
}

/**
 * Type definition for document generator functions
 */
type DocumentGenerator = (context: string) => Promise<string>;

export async function main(options: GenerationOptions = { 
    outputDir: 'generated-documents',
    quiet: false,
    format: 'markdown',
    retries: 0
}) {
    try {
        if (!options.quiet) {
            console.log('📋 Starting PMBOK document generation...');
        }
        
        // Look for README.md or project description file
        const readmePath = join(process.cwd(), 'README.md');
        let projectContext = '';
        
        if (existsSync(readmePath)) {
            projectContext = readFileSync(readmePath, 'utf-8');
            if (!options.quiet) {
                console.log('✅ Found README.md - using as project context');
            }
        } else {
            projectContext = `
# Sample Project
A comprehensive software project requiring PMBOK documentation.

## Features
- User management system
- Data processing capabilities
- Web-based dashboard
- API integration

## Technology Stack
- TypeScript/Node.js backend
- React frontend
- PostgreSQL database
- Azure cloud deployment
            `.trim();
            if (!options.quiet) {
                console.log('📝 Using default project context (no README.md found)');
            }
        }

        // Type definition for document generator functions
        type DocumentGenerator = (context: string) => Promise<string>;
        
        // Generate AI-powered documents with progress reporting
        const generateWithProgress = async (name: string, generator: DocumentGenerator) => {
            if (!options.quiet) console.log(`🤖 Generating ${name}...`);
            try {
                const result = await generator(projectContext);
                return result;
            } catch (error) {
                if (!options.quiet) console.error(`⚠️ Error generating ${name}:`, error);
                // Ensure error is properly typed and handled
                if (error instanceof Error) {
                    throw error;
                } else {
                    throw new Error(`Failed to generate ${name}: ${String(error)}`);
                }
            }
        };

        // Define document generation tasks
        const documentTasks: Array<{
            name: string;
            displayName: string;
            generator: DocumentGenerator;
        }> = [
            { 
                name: 'project-summary',
                displayName: 'AI Summary and Goals',
                generator: getAiSummaryAndGoals
            },
            { 
                name: 'user-stories',
                displayName: 'User Stories',
                generator: getAiUserStories
            },
            { 
                name: 'project-charter',
                displayName: 'Project Charter',
                generator: getAiProjectCharter
            },
            { 
                name: 'scope-management-plan',
                displayName: 'Scope Management Plan',
                generator: getAiScopeManagementPlan
            },
            { 
                name: 'risk-management-plan',
                displayName: 'Risk Management Plan',
                generator: getAiRiskManagementPlan
            },
            { 
                name: 'work-breakdown-structure',
                displayName: 'Work Breakdown Structure',
                generator: getAiWbs
            },
            { 
                name: 'stakeholder-register',
                displayName: 'Stakeholder Register',
                generator: getAiStakeholderRegister
            }
        ];

        // Generate all documents with progress tracking
        const docs: GeneratedDocument[] = await Promise.all(
            documentTasks.map(async task => ({
                name: task.name,
                content: await generateWithProgress(task.displayName, task.generator)
            }))
        );

        // Save generated documents
        if (!options.quiet) console.log('💾 Saving generated documents...');
        
        for (const doc of docs) {
            if (doc.content) {
                const filePath = join(options.outputDir, `${doc.name}.${options.format}`);
                await generateMarkdownFile(doc.name, doc.content, options);
                if (!options.quiet) console.log(`✅ Generated: ${filePath}`);
            } else {
                if (!options.quiet) console.log(`⚠️ Skipped: ${doc.name} (no content generated)`);
            }
        }

        if (!options.quiet) {
            console.log('🎉 Document generation completed successfully!');
            console.log(`📁 Check ${options.outputDir}/ for generated files`);
        }

    } catch (error) {
        if (!options.quiet) console.error('❌ Error in document generation:', error);
        throw error;
    }
}