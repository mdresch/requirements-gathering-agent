import { ProjectContext } from '../../ai/types.js';
import { DocumentOutput } from '../../documentGenerator/types.js';
import DocumentContentManagementTemplate from './DocumentContentManagementTemplate.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';

export class DocumentContentManagementProcessor {
    private aiProcessor = getAIProcessor();

    async process(context: ProjectContext): Promise<DocumentOutput> {
        const template = new DocumentContentManagementTemplate();
        const prompt = template.buildPrompt(context);
        
        const systemPrompt = 'You are an expert in Document and Content Management with extensive experience in enterprise content governance, document management systems, and information lifecycle management. Your role is to create a comprehensive Document & Content Management Framework that aligns with industry best practices and organizational requirements.';
        
        try {
            const response = await this.aiProcessor.makeAICall(
                [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                4000
            );

            return {
                title: 'Document & Content Management Framework',
                content: response.content
            };
        } catch (error) {
            console.error('Error generating Document & Content Management Framework:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to generate Document & Content Management Framework: ${errorMessage}`);
        }
    }
}

// Export as singleton
export default new DocumentContentManagementProcessor();
