import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Processor for the Bug Report document.
 * Generates a comprehensive bug reporting process and template document.
 */
export class BugReportProcessor implements DocumentProcessor {
    name = 'Bug Report';
    description = 'Comprehensive bug reporting process and template';
    category = 'Quality Assurance';

    async generateDocument(projectInfo: ProjectContext): Promise<string> {
        const template = new (await import('./BugReportTemplate.js')).BugReportTemplate();
        return template.generateContent(projectInfo);
    }

    async process(projectInfo: ProjectContext): Promise<DocumentOutput> {
        const content = await this.generateDocument(projectInfo);
        return {
            title: 'Bug Report Template',
            content: content
        };
    }

    validate(content: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Check for essential sections
        const requiredSections = [
            'Bug Reporting Process',
            'Bug Report Template',
            'Priority Classification',
            'Lifecycle Management',
            'Roles and Responsibilities'
        ];
        
        for (const section of requiredSections) {
            if (!content.includes(section)) {
                errors.push(`Missing required section: ${section}`);
            }
        }
        
        // Check for minimum content length
        if (content.length < 2000) {
            errors.push('Bug report document appears to be too short');
        }
        
        // Check for specific bug tracking elements
        const bugElements = [
            'severity',
            'priority',
            'reproduce',
            'template',
            'workflow'
        ];
        
        const missingElements = bugElements.filter(element => 
            !content.toLowerCase().includes(element)
        );
        
        if (missingElements.length > 2) {
            errors.push(`Missing key bug tracking elements: ${missingElements.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
