import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Processor for the Test Environment document.
 * Generates a comprehensive test environment setup and management document.
 */
export class TestEnvironmentProcessor implements DocumentProcessor {
    name = 'Test Environment';
    description = 'Comprehensive test environment setup and management';
    category = 'Quality Assurance';

    async generateDocument(projectInfo: ProjectContext): Promise<string> {
        const template = new (await import('./TestEnvironmentTemplate.js')).TestEnvironmentTemplate();
        return template.generateContent(projectInfo);
    }

    async process(projectInfo: ProjectContext): Promise<DocumentOutput> {
        const content = await this.generateDocument(projectInfo);
        return {
            title: 'Test Environment Setup Guide',
            content: content
        };
    }

    validate(content: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Check for essential sections
        const requiredSections = [
            'Environment Architecture',
            'Environment Types',
            'Configuration Management',
            'Data Management',
            'Access Control',
            'Maintenance Procedures'
        ];
        
        for (const section of requiredSections) {
            if (!content.includes(section)) {
                errors.push(`Missing required section: ${section}`);
            }
        }
        
        // Check for minimum content length
        if (content.length < 2000) {
            errors.push('Test environment document appears to be too short');
        }
        
        // Check for specific environment elements
        const environmentElements = [
            'configuration',
            'setup',
            'deployment',
            'monitoring',
            'backup'
        ];
        
        const missingElements = environmentElements.filter(element => 
            !content.toLowerCase().includes(element)
        );
        
        if (missingElements.length > 2) {
            errors.push(`Missing key environment elements: ${missingElements.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
