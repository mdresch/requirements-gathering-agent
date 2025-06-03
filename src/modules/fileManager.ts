import * as fs from 'fs';
import * as path from 'path';

export interface DocumentMetadata {
    title: string;
    filename: string;
    category: string;
    description: string;
    generatedAt: string;
}

// Define document categories for better organization
export const DOCUMENT_CATEGORIES = {
    CORE: 'core-analysis',
    CHARTER: 'project-charter',
    MANAGEMENT_PLANS: 'management-plans', 
    PLANNING_ARTIFACTS: 'planning-artifacts',
    STAKEHOLDER: 'stakeholder-management',
    TECHNICAL: 'technical-analysis'
} as const;

// Document configuration with proper categorization
export const DOCUMENT_CONFIG: Record<string, DocumentMetadata> = {
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
    },
    'key-roles-and-needs': {
        title: 'Key Roles and Needs Analysis',
        filename: 'key-roles-and-needs.md',
        category: DOCUMENT_CATEGORIES.CORE,
        description: 'Analysis of user roles and their specific needs',
        generatedAt: ''
    },
    'project-charter': {
        title: 'Project Charter',
        filename: 'project-charter.md',
        category: DOCUMENT_CATEGORIES.CHARTER,
        description: 'PMBOK Project Charter formally authorizing the project',
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
    'stakeholder-engagement-plan': {
        title: 'Stakeholder Engagement Plan',
        filename: 'stakeholder-engagement-plan.md',
        category: DOCUMENT_CATEGORIES.STAKEHOLDER,
        description: 'PMBOK Stakeholder Engagement Plan',
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
    'stakeholder-register': {
        title: 'Stakeholder Register',
        filename: 'stakeholder-register.md',
        category: DOCUMENT_CATEGORIES.STAKEHOLDER,
        description: 'PMBOK Stakeholder Register',
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
    },
    'ui-ux-considerations': {
        title: 'UI/UX Considerations',
        filename: 'ui-ux-considerations.md',
        category: DOCUMENT_CATEGORIES.TECHNICAL,
        description: 'User experience and interface design recommendations',
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

export function saveDocument(documentKey: string, content: string): void {
    if (!content || content.trim().length === 0) {
        console.log(`⚠️ Skipped: ${documentKey} (no content generated)`);
        return;
    }
    
    const config = DOCUMENT_CONFIG[documentKey];
    if (!config) {
        console.error(`❌ Unknown document key: ${documentKey}`);
        return;
    }
    
    // Create the full file path with category subdirectory
    const baseDir = 'generated-documents';
    const categoryDir = path.join(baseDir, config.category);
    const filePath = path.join(categoryDir, config.filename);
    
    // Ensure directory exists
    if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    // Add document header with metadata
    const timestamp = new Date().toISOString();
    const documentHeader = `# ${config.title}

**Generated by Requirements Gathering Agent v2.0.0**  
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

**Generated by Requirements Gathering Agent v2.0.0**  
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