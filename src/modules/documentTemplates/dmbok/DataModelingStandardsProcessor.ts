import { generateContent } from './DataModelingStandardsTemplate.js';
import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Processor for Data Modeling Standards Guide document generation (AIProcessor-based).
 */
export class DataModelingStandardsProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const promptContent = generateContent(context);
    const prompt = `Based on the following project context, generate a comprehensive Data Modeling Standards Guide.\n\n${promptContent}`;

    const response = await this.aiProcessor.makeAICall([
      {
        role: 'system',
        content: 'You are a senior data modeler. Generate a thorough Data Modeling Standards Guide aligned with DMBOK best practices.'
      },
      { role: 'user', content: prompt }
    ]);

    return {
      title: `Data Modeling Standards Guide for ${context.projectName}`,
      content: typeof response === 'string' ? response : response.content
    };
  }
}
