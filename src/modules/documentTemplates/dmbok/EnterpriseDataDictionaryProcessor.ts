import { generateContent } from './EnterpriseDataDictionaryTemplate.js';
import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Processor for Enterprise Data Dictionary document generation (AIProcessor-based).
 */
export class EnterpriseDataDictionaryProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const promptContent = generateContent(context);
    const prompt = `Based on the following project context, generate a comprehensive Enterprise Data Dictionary.\n\n${promptContent}`;

    const response = await this.aiProcessor.makeAICall([
      {
        role: 'system',
        content: 'You are a senior data architect. Generate a thorough Enterprise Data Dictionary aligned with DMBOK best practices.'
      },
      { role: 'user', content: prompt }
    ]);

    return {
      title: `Enterprise Data Dictionary for ${context.projectName}`,
      content: typeof response === 'string' ? response : response.content
    };
  }
}
