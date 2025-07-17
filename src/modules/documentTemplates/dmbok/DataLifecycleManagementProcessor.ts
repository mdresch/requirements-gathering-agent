import { AIProcessor } from '../../ai/AIProcessor.js';
import type { DocumentOutput } from '../../documentGenerator/types.js';
import type { ProjectContext } from '../../ai/types.js';
import DataLifecycleManagementTemplate from './DataLifecycleManagementTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

export class DataLifecycleManagementProcessor {
    private aiProcessor: AIProcessor;
    private template: DataLifecycleManagementTemplate | null = null;

    constructor() {
        this.aiProcessor = AIProcessor.getInstance();
    }

    async process(context: ProjectContext): Promise<DocumentOutput> {
        try {
            this.template = new DataLifecycleManagementTemplate(context);
            const prompt = this.template.generateContent();
            
            const response = await this.aiProcessor.makeAICall([
                {
                    role: 'system',
                    content: 'You are a data management expert specializing in Data Lifecycle Management (DLM) frameworks and best practices.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ], 3000).then(res => typeof res === 'string' ? res : res.content);
            
            await this.validateOutput(response);
            
            return {
                title: 'Data Lifecycle Management Policy',
                content: response
            };
        } catch (error) {
            if (error instanceof ExpectedError) {
                console.warn('Expected error in Data Lifecycle Management processing:', error.message);
                throw new Error(`Failed to generate Data Lifecycle Management document: ${error.message}`);
            } else {
                console.error('Unexpected error in Data Lifecycle Management processing:', error);
                throw new Error('An unexpected error occurred while generating Data Lifecycle Management document');
            }
        }
    }
    
    private async validateOutput(content: string): Promise<void> {
        if (!content || content.trim().length === 0) {
            throw new ExpectedError('Generated content is empty');
        }
        
        // Add any additional validation specific to the Data Lifecycle Management document
        const requiredSections = [
            'Data Lifecycle Phases',
            'Roles and Responsibilities',
            'Implementation Guidelines'
        ];
        
        const missingSections = requiredSections.filter(
            section => !content.includes(section)
        );
        
        if (missingSections.length > 0) {
            throw new ExpectedError(`Missing required sections: ${missingSections.join(', ')}`);
        }
    }
}

// Export the class to allow for proper instantiation
export default DataLifecycleManagementProcessor;
