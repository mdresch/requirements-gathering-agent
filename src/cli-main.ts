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

interface GenerationOptions {
    outputDir: string;
    quiet: boolean;
    format: string;
    retries: number;
}

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

        // Generate AI-powered documents with progress reporting
        const generateWithProgress = async (name: string, generator: Function) => {
            if (!options.quiet) console.log(`🤖 Generating ${name}...`);
            try {
                const result = await generator(projectContext);
                return result;
            } catch (error) {
                if (!options.quiet) console.error(`⚠️ Error generating ${name}:`, error);
                throw error;
            }
        };

        // Generate all documents with progress tracking
        const docs = await Promise.all([
            generateWithProgress('AI Summary and Goals', getAiSummaryAndGoals)
                .then(content => ({ name: 'project-summary', content })),
            generateWithProgress('User Stories', getAiUserStories)
                .then(content => ({ name: 'user-stories', content })),
            generateWithProgress('Project Charter', getAiProjectCharter)
                .then(content => ({ name: 'project-charter', content })),
            generateWithProgress('Scope Management Plan', getAiScopeManagementPlan)
                .then(content => ({ name: 'scope-management-plan', content })),
            generateWithProgress('Risk Management Plan', getAiRiskManagementPlan)
                .then(content => ({ name: 'risk-management-plan', content })),
            generateWithProgress('Work Breakdown Structure', getAiWbs)
                .then(content => ({ name: 'work-breakdown-structure', content })),
            generateWithProgress('Stakeholder Register', getAiStakeholderRegister)
                .then(content => ({ name: 'stakeholder-register', content }))
        ]);

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