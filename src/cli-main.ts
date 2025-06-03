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

export async function main() {
    try {
        console.log('📋 Starting PMBOK document generation...');
        
        // Look for README.md or project description file
        const readmePath = join(process.cwd(), 'README.md');
        let projectContext = '';
        
        if (existsSync(readmePath)) {
            projectContext = readFileSync(readmePath, 'utf-8');
            console.log('✅ Found README.md - using as project context');
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
            console.log('📝 Using default project context (no README.md found)');
        }

        // Generate AI-powered documents
        console.log('🤖 Generating AI Summary and Goals...');
        const summary = await getAiSummaryAndGoals(projectContext);
        
        console.log('📖 Generating User Stories...');
        const userStories = await getAiUserStories(projectContext);
        
        console.log('📜 Generating Project Charter...');
        const charter = await getAiProjectCharter(projectContext);
        
        console.log('📊 Generating Scope Management Plan...');
        const scopePlan = await getAiScopeManagementPlan(projectContext);
        
        console.log('⚠️ Generating Risk Management Plan...');
        const riskPlan = await getAiRiskManagementPlan(projectContext);
        
        console.log('🏗️ Generating Work Breakdown Structure...');
        const wbs = await getAiWbs(projectContext);
        
        console.log('👥 Generating Stakeholder Register...');
        const stakeholders = await getAiStakeholderRegister(projectContext);

        // Generate markdown files
        const docs = [
            { name: 'project-summary', content: summary },
            { name: 'user-stories', content: userStories },
            { name: 'project-charter', content: charter },
            { name: 'scope-management-plan', content: scopePlan },
            { name: 'risk-management-plan', content: riskPlan },
            { name: 'work-breakdown-structure', content: wbs },
            { name: 'stakeholder-register', content: stakeholders }
        ];

        console.log('💾 Saving generated documents...');
        for (const doc of docs) {
            if (doc.content) {
                await generateMarkdownFile(doc.name, doc.content);
                console.log(`✅ Generated: ${doc.name}.md`);
            } else {
                console.log(`⚠️ Skipped: ${doc.name} (no content generated)`);
            }
        }

        console.log('🎉 Document generation completed successfully!');
        console.log('📁 Check the current directory for generated .md files');

    } catch (error) {
        console.error('❌ Error in document generation:', error);
        throw error;
    }
}