/**
 * File Management and Context Utilities Module for Requirements Gathering Agent
 * 
 * Provides comprehensive file management capabilities, project context reading,
 * and document metadata handling for the requirements gathering system.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Enhanced project context reading from multiple sources
 * - Document metadata management and validation
 * - Integration with project analyzer for comprehensive analysis
 * - File system utilities for document organization
 * - Context population and enhancement workflows
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\fileManager.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ProjectAnalysis, ProjectMarkdownFile } from './projectAnalyzer.js';
import { analyzeProjectComprehensively } from './projectAnalyzer.js';
import { populateEnhancedContextFromAnalysis } from './llmProcessor.js';

export interface DocumentMetadata {
    title: string;
    filename: string;
    category: string;
    description: string;
    generatedAt: string;
}

// Define document categories for better organization
export const DOCUMENT_CATEGORIES = {
    STRATEGIC_STATEMENTS: 'strategic-statements',
    CORE: 'core-analysis',
    STRATEGIC: 'strategic-statements',
    CHARTER: 'project-charter',
    MANAGEMENT_PLANS: 'management-plans',
    PLANNING_ARTIFACTS: 'planning-artifacts',
    STAKEHOLDER: 'stakeholder-management',
    TECHNICAL: 'technical-analysis',
    QUALITY_ASSURANCE: 'quality-assurance',
    IMPLEMENTATION_GUIDES: 'implementation-guides',
    UNKNOWN: 'unknown' // Added for fallback/validation
} as const;

// Document configuration with proper categorization
export const DOCUMENT_CONFIG: Record<string, DocumentMetadata> = {
    'purpose-statement': { title: 'Purpose-Statement', filename: 'strategic-statements/purpose-statement.md', category: DOCUMENT_CATEGORIES.STRATEGIC_STATEMENTS, description: '', generatedAt: '' },
    'company-values': { title: 'CompanyValues', filename: 'strategic-statements/company-values.md', category: DOCUMENT_CATEGORIES.STRATEGIC_STATEMENTS, description: '', generatedAt: '' },
    'mission-vision-core-values': { title: 'MissionVisionCoreValues', filename: 'strategic-statements/mission-vision-core-values.md', category: DOCUMENT_CATEGORIES.STRATEGIC_STATEMENTS, description: '', generatedAt: '' },
    'new-test-doc': { title: 'NewTestDoc', filename: 'quality-assurance/new-test-doc.md', category: DOCUMENT_CATEGORIES.QUALITY_ASSURANCE, description: '', generatedAt: '' },
    'project-summary': {
        title: 'Project Summary and Goals',
        filename: 'project-summary.md',
        category: DOCUMENT_CATEGORIES.CORE,
        description: 'AI-generated project overview with business goals and objectives',
        generatedAt: ''
    },
    'user-stories': {
        title: 'User Stories and Requirements',
        filename: 'user-stories.md',
        category: DOCUMENT_CATEGORIES.CORE,
        description: 'Comprehensive user stories following Agile format',
        generatedAt: ''
    },
    'user-personas': {
        title: 'User Personas',
        filename: 'user-personas.md',
        category: DOCUMENT_CATEGORIES.CORE,
        description: 'Detailed user personas and demographics',
        generatedAt: ''
    },    'key-roles-and-needs': {
        title: 'Key Roles and Needs Analysis',
        filename: 'key-roles-and-needs.md',
        category: DOCUMENT_CATEGORIES.CORE,
        description: 'Analysis of user roles and their specific needs',
        generatedAt: ''
    },
    'project-statement-of-work': {
        title: 'Project Statement of Work',
        filename: 'project-statement-of-work.md',
        category: DOCUMENT_CATEGORIES.CORE,
        description: 'Project Statement of Work detailing scope, deliverables, and acceptance criteria',
        generatedAt: ''
    },
    'business-case': {
        title: 'Business Case',
        filename: 'business-case.md',
        category: DOCUMENT_CATEGORIES.CORE,
        description: 'Comprehensive business case and justification',
        generatedAt: ''
    },'project-charter': {
        title: 'Project Charter',
        filename: 'project-charter.md',
        category: DOCUMENT_CATEGORIES.CHARTER,
        description: 'PMBOK Project Charter formally authorizing the project',
        generatedAt: ''
    },
    'project-management-plan': {
        title: 'Project Management Plan',
        filename: 'project-management-plan.md',
        category: DOCUMENT_CATEGORIES.CHARTER,
        description: 'PMBOK Project Management Plan',
        generatedAt: ''
    },
    'scope-management-plan': {
        title: 'Scope Management Plan',
        filename: 'scope-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Scope Management Plan',
        generatedAt: ''
    },
    'risk-management-plan': {
        title: 'Risk Management Plan',
        filename: 'risk-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Risk Management Plan',
        generatedAt: ''
    },
    'cost-management-plan': {
        title: 'Cost Management Plan',
        filename: 'cost-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Cost Management Plan',
        generatedAt: ''
    },
    'quality-management-plan': {
        title: 'Quality Management Plan',
        filename: 'quality-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Quality Management Plan',
        generatedAt: ''
    },
    'resource-management-plan': {
        title: 'Resource Management Plan',
        filename: 'resource-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Resource Management Plan',
        generatedAt: ''
    },
    'communication-management-plan': {
        title: 'Communication Management Plan',
        filename: 'communication-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Communication Management Plan',
        generatedAt: ''
    },
    'procurement-management-plan': {
        title: 'Procurement Management Plan',
        filename: 'procurement-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Procurement Management Plan',
        generatedAt: ''
    },
    // Stakeholder Management - Fix missing properties
    'stakeholder-engagement-plan': {
        title: 'Stakeholder Engagement Plan',
        filename: 'stakeholder-engagement-plan.md',
        category: DOCUMENT_CATEGORIES.STAKEHOLDER,
        description: 'PMBOK Stakeholder Engagement Plan',
        generatedAt: ''
    },
    'stakeholder-register': {
        title: 'Stakeholder Register',
        filename: 'stakeholder-register.md',
        category: DOCUMENT_CATEGORIES.STAKEHOLDER,
        description: 'PMBOK Stakeholder Register',
        generatedAt: ''
    },
    'stakeholder-analysis': {
        title: 'Stakeholder Analysis',
        filename: 'stakeholder-analysis.md',
        category: DOCUMENT_CATEGORIES.STAKEHOLDER,
        description: 'PMBOK Stakeholder Analysis',
        generatedAt: ''
    },
    'work-breakdown-structure': {
        title: 'Work Breakdown Structure (WBS)',
        filename: 'work-breakdown-structure.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'PMBOK Work Breakdown Structure',
        generatedAt: ''
    },
    'wbs-dictionary': {
        title: 'WBS Dictionary',
        filename: 'wbs-dictionary.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'PMBOK WBS Dictionary with detailed descriptions',
        generatedAt: ''
    },
    'activity-list': {
        title: 'Activity List',
        filename: 'activity-list.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'PMBOK Activity List',
        generatedAt: ''
    },
    'activity-duration-estimates': {
        title: 'Activity Duration Estimates',
        filename: 'activity-duration-estimates.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'PMBOK Activity Duration Estimates',
        generatedAt: ''
    },
    'activity-resource-estimates': {
        title: 'Activity Resource Estimates',
        filename: 'activity-resource-estimates.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'PMBOK Activity Resource Estimates',
        generatedAt: ''
    },
    'schedule-network-diagram': {
        title: 'Schedule Network Diagram',
        filename: 'schedule-network-diagram.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'PMBOK Schedule Network Diagram',
        generatedAt: ''
    },
    'milestone-list': {
        title: 'Milestone List',
        filename: 'milestone-list.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'PMBOK Milestone List',
        generatedAt: ''
    },
    'schedule-development-input': {
        title: 'Schedule Development Input',
        filename: 'schedule-development-input.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'PMBOK Schedule Development Input',
        generatedAt: ''
    },
    'data-model-suggestions': {
        title: 'Data Model Suggestions',
        filename: 'data-model-suggestions.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL,
        description: 'Database architecture and data model recommendations',
        generatedAt: ''
    },
    'tech-stack-analysis': {
        title: 'Technology Stack Analysis',
        filename: 'tech-stack-analysis.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL,
        description: 'Comprehensive technology stack recommendations',
        generatedAt: ''
    },
    'risk-analysis': {
        title: 'Risk Analysis',
        filename: 'risk-analysis.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL,
        description: 'Detailed risk analysis and mitigation strategies',
        generatedAt: ''
    },
    'acceptance-criteria': {
        title: 'Acceptance Criteria',
        filename: 'acceptance-criteria.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL,
        description: 'Comprehensive acceptance criteria and validation methods',
        generatedAt: ''
    },
    'compliance-considerations': {
        title: 'Compliance Considerations',
        filename: 'compliance-considerations.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL,
        description: 'Regulatory and compliance requirements analysis',
        generatedAt: ''
    },    'ui-ux-considerations': {
        title: 'UI/UX Considerations',
        filename: 'ui-ux-considerations.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL,
        description: 'User experience and interface design recommendations',
        generatedAt: ''
    },
    // Missing documents that were incorrectly categorized as "unknown"
    'control-scope': {
        title: 'Control Scope Process',
        filename: 'control-scope.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Control Scope Process',
        generatedAt: ''
    },
    'direct-and-manage-project-work': {
        title: 'Direct and Manage Project Work Process',
        filename: 'direct-and-manage-project-work.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Direct and Manage Project Work Process',
        generatedAt: ''
    },
    'project-scope-statement': {
        title: 'Project Scope Statement',
        filename: 'project-scope-statement.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Project Scope Statement',
        generatedAt: ''
    },
    'requirements-documentation': {
        title: 'Requirements Documentation',
        filename: 'requirements-documentation.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Requirements Documentation',
        generatedAt: ''
    },
    'requirements-traceability-matrix': {
        title: 'Requirements Traceability Matrix',
        filename: 'requirements-traceability-matrix.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Requirements Traceability Matrix',
        generatedAt: ''
    },
    'scope-baseline': {
        title: 'Scope Baseline',
        filename: 'scope-baseline.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Scope Baseline',
        generatedAt: ''
    },    'validate-scope': {
        title: 'Validate Scope Process',
        filename: 'validate-scope.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Validate Scope Process',
        generatedAt: ''
    },
    // Additional missing PMBOK documents
    'perform-integrated-change-control': {
        title: 'Perform Integrated Change Control Process',
        filename: 'perform-integrated-change-control.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Perform Integrated Change Control Process',
        generatedAt: ''
    },
    'close-project-or-phase': {
        title: 'Close Project or Phase Process',
        filename: 'close-project-or-phase.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Close Project or Phase Process',
        generatedAt: ''
    },
    'plan-scope-management': {
        title: 'Plan Scope Management',
        filename: 'plan-scope-management.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Plan Scope Management',
        generatedAt: ''
    },
    'requirements-management-plan': {
        title: 'Requirements Management Plan',
        filename: 'requirements-management-plan.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Requirements Management Plan',
        generatedAt: ''
    },
    'collect-requirements': {
        title: 'Collect Requirements Process',
        filename: 'collect-requirements.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Collect Requirements Process',
        generatedAt: ''
    },
    'define-scope': {
        title: 'Define Scope Process',
        filename: 'define-scope.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Define Scope Process',
        generatedAt: ''
    },
    'create-wbs': {
        title: 'Create WBS Process',
        filename: 'create-wbs.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Create WBS Process',
        generatedAt: ''
    },
    'work-performance-information-scope': {
        title: 'Work Performance Information (Scope)',
        filename: 'work-performance-information-scope.md',
        category: DOCUMENT_CATEGORIES.MANAGEMENT_PLANS,
        description: 'PMBOK Work Performance Information (Scope)',
        generatedAt: ''
    },
    'project-purpose': {
        title: 'Project Purpose',
        filename: 'project-purpose.md',
        category: DOCUMENT_CATEGORIES.STRATEGIC,
        description: 'Project purpose and objectives documentation',
        generatedAt: ''
    },
    'project-kickoff-preparations-checklist': {
        title: 'Project KickOff Preparations Checklist',
        filename: 'Project-KickOff-Preprations-CheckList.md',
        category: DOCUMENT_CATEGORIES.PLANNING_ARTIFACTS,
        description: 'Checklist for project kickoff preparations, including scope, stakeholders, resources, and readiness.',
        generatedAt: ''
    }
};

// Create organized directory structure
export function createDirectoryStructure(): void {
    const baseDir = 'generated-documents';

    // Create base directory
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    // Create category subdirectories
    Object.values(DOCUMENT_CATEGORIES).forEach(category => {
        const categoryDir = path.join(baseDir, category);
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }
    });

    console.log(`📁 Created organized directory structure in ${baseDir}/`);
}

export function readProjectContext(filename: string = 'README.md'): string {
    try {
        if (!fs.existsSync(filename)) {
            console.warn(`⚠️  ${filename} not found. Using generic project context.`);
            return 'Generic project requiring comprehensive requirements analysis and PMBOK documentation.';
        }

        const content = fs.readFileSync(filename, 'utf-8');
        console.log(`✅ Found ${filename} - using as project context`);
        return content;
    } catch (error) {
        console.error(`❌ Error reading ${filename}:`, error);
        return 'Project context could not be loaded.';
    }
}

/**
 * Enhanced project context reader that analyzes all relevant markdown files
 * @param projectPath - The root directory of the project (defaults to current directory)
 * @returns Comprehensive project context including all relevant documentation
 */
export async function readEnhancedProjectContext(projectPath: string = process.cwd()): Promise<string> {
    try {
        console.log('🔍 Performing comprehensive project analysis...');

        // Import the analyzer and processor dynamically to avoid circular imports
        const { analyzeProjectComprehensively } = await import('./projectAnalyzer.js');
        const { populateEnhancedContextFromAnalysis } = await import('./llmProcessor.js');

        // Perform comprehensive analysis
        const analysis = await analyzeProjectComprehensively(projectPath);

        // Log findings for transparency
        if (analysis.additionalMarkdownFiles?.length > 0) {
            console.log(`📋 Found ${analysis.additionalMarkdownFiles.length} additional relevant files:`);
            analysis.additionalMarkdownFiles
                .slice(0, 5) // Show top 5
                .forEach((file: ProjectMarkdownFile) => {
                    console.log(`   • ${file.fileName} (${file.category}, score: ${file.relevanceScore})`);
                });

            if (analysis.additionalMarkdownFiles.length > 5) {
                console.log(`   • ... and ${analysis.additionalMarkdownFiles.length - 5} more files`);
            }
        }

        if (analysis.suggestedSources?.length > 0) {
            console.log(`💡 High-value sources identified: ${analysis.suggestedSources.join(', ')}`);
        }

        // Populate Enhanced Context Manager with discovered files
        await populateEnhancedContextFromAnalysis(analysis);

        // Return the comprehensive context
        return analysis.projectContext;

    } catch (error) {
        console.warn('⚠️ Enhanced analysis failed, falling back to basic README analysis:', error);
        return readProjectContext();
    }
}

export function saveDocument(documentKey: string, content: string): void {
    if (!content || content.trim().length === 0) {
        console.log(`⚠️ Skipped: ${documentKey} (no content generated)`);
        return;
    }

    const config = DOCUMENT_CONFIG[documentKey];
    if (!config) {
        console.warn(`\u26a0\ufe0f WARNING: Unknown document key: ${documentKey}. This document type is not registered in DOCUMENT_CONFIG and will be saved as 'UNKNOWN'.\nTo enable full support and version control, add this document type to the registry in both generationTasks.ts and fileManager.ts.`);
        // Create a fallback config for unknown keys
        const fallbackConfig = {
            title: documentKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            filename: `${documentKey}.md`,
            category: DOCUMENT_CATEGORIES.UNKNOWN, // Use the new UNKNOWN key
            description: 'Auto-generated document',
            generatedAt: ''
        };

        const baseDir = 'generated-documents';
        const categoryDir = path.join(baseDir, fallbackConfig.category);
        const filePath = path.join(categoryDir, fallbackConfig.filename);

        // Ensure directory exists
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        const timestamp = new Date().toISOString();
        const documentHeader = `# ${fallbackConfig.title}

**Generated by Requirements Gathering Agent v2.1.2**  
**Category:** ${fallbackConfig.category}  
**Generated:** ${timestamp}  
**Description:** ${fallbackConfig.description}

---

`;

        const fullContent = documentHeader + content;

        try {
            fs.writeFileSync(filePath, fullContent, 'utf-8');
            console.log(`✅ Saved: ${fallbackConfig.title} → ${filePath}`);
        } catch (error) {
            console.error(`❌ Error saving ${documentKey}:`, error);
        }
        return;
    }

    const baseDir = 'generated-documents';
    // Use filename (which may include category subfolder) directly under baseDir
    const filePath = path.join(baseDir, config.filename);
    // Ensure parent directory exists
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
    }

    // Add document header with metadata
    const timestamp = new Date().toISOString();
    const documentHeader = `# ${config.title}

**Generated by Requirements Gathering Agent v2.1.2**  
**Category:** ${config.category}  
**Generated:** ${timestamp}  
**Description:** ${config.description}

---

`;

    const fullContent = documentHeader + content;

    try {
        fs.writeFileSync(filePath, fullContent, 'utf-8');
        console.log(`✅ Saved: ${config.title} → ${filePath}`);
    } catch (error) {
        console.error(`❌ Error saving ${documentKey}:`, error);
    }
}

export function generateIndexFile(): void {
    const baseDir = 'generated-documents';
    const indexPath = path.join(baseDir, 'README.md');

    const timestamp = new Date().toISOString();

    let indexContent = `# Generated PMBOK Documentation

**Generated by Requirements Gathering Agent v2.1.2**  
**Timestamp:** ${timestamp}  
**Total Documents:** ${Object.keys(DOCUMENT_CONFIG).length}

## Directory Structure

This directory contains comprehensive PMBOK (Project Management Body of Knowledge) documentation organized by category:

`;

    // Group documents by category
    const categorizedDocs: Record<string, DocumentMetadata[]> = {};
    Object.entries(DOCUMENT_CONFIG).forEach(([key, config]) => {
        if (!categorizedDocs[config.category]) {
            categorizedDocs[config.category] = [];
        }
        categorizedDocs[config.category].push(config);
    });

    // Generate index by category
    Object.entries(categorizedDocs).forEach(([category, docs]) => {
        const categoryTitle = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        indexContent += `\n### ${categoryTitle}\n\n`;

        docs.forEach(doc => {
            const filePath = path.join(category, doc.filename);
            indexContent += `- [${doc.title}](${filePath}) - ${doc.description}\n`;
        });
    });

    indexContent += `\n## Usage

Each document is AI-generated based on your project's README.md context and follows PMBOK standards. The documents are organized into logical categories for easy navigation and reference.

## Categories Explained

- **Core Analysis**: Fundamental project analysis including user stories, personas, and requirements
- **Project Charter**: Formal project authorization and high-level planning
- **Management Plans**: Detailed PMBOK management plans for scope, risk, cost, quality, etc.
- **Planning Artifacts**: Detailed planning documents including WBS, schedules, and activities
- **Stakeholder Management**: Stakeholder analysis and engagement strategies
- **Technical Analysis**: Technology stack, data models, compliance, and UX considerations

---
*Generated by Requirements Gathering Agent using Azure OpenAI*
`;

    try {
        fs.writeFileSync(indexPath, indexContent, 'utf-8');
        console.log(`📋 Generated documentation index: ${indexPath}`);
    } catch (error) {
        console.error(`❌ Error generating index file:`, error);
    }
}

// Version export for tracking
export const fileManagerVersion = '2.1.2';

export function cleanupOldFiles(): void {
    // Remove any .md files from root directory (except README.md)
    const rootFiles = fs.readdirSync('.');
    rootFiles.forEach(file => {
        if (file.endsWith('.md') && file !== 'README.md' && file !== '.env.example') {
            try {
                // Check if this looks like a generated document
                const content = fs.readFileSync(file, 'utf-8');
                if (content.includes('Generated by Requirements Gathering Agent') ||
                    content.includes('PMBOK') ||
                    Object.values(DOCUMENT_CONFIG).some(config => file === config.filename)) {
                    fs.unlinkSync(file);
                    console.log(`🗑️  Cleaned up old file: ${file}`);
                }
            } catch (error) {
                // Skip if we can't read the file
            }
        }
    });
}