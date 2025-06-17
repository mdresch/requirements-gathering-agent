import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Processor for the Code Review document.
 * Generates a comprehensive code review process and guidelines document.
 */
export class CodeReviewProcessor implements DocumentProcessor {
    name = 'Code Review';
    description = 'Comprehensive code review process and guidelines';
    category = 'Quality Assurance';

    async generateDocument(projectInfo: ProjectContext): Promise<string> {
        const template = new (await import('./CodeReviewTemplate.js')).CodeReviewTemplate();
        return template.generateContent(projectInfo);
    }

    async process(projectInfo: ProjectContext): Promise<DocumentOutput> {
        const content = await this.generateDocument(projectInfo);
        return {
            title: 'Code Review Checklist',
            content: content
        };
    }

    validate(content: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Check for essential sections
        const requiredSections = [
            'Code Review Process',
            'Review Criteria',
            'Review Checklist',
            'Roles and Responsibilities',
            'Tools and Technology',
            'Best Practices'
        ];
        
        for (const section of requiredSections) {
            if (!content.includes(section)) {
                errors.push(`Missing required section: ${section}`);
            }
        }
        
        // Check for minimum content length
        if (content.length < 2000) {
            errors.push('Code review document appears to be too short');
        }
        
        // Check for specific quality review elements
        const qualityElements = [
            'checklist',
            'criteria',
            'standards',
            'guidelines',
            'process'
        ];
        
        const missingElements = qualityElements.filter(element => 
            !content.toLowerCase().includes(element)
        );
        
        if (missingElements.length > 2) {
            errors.push(`Missing key quality elements: ${missingElements.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
