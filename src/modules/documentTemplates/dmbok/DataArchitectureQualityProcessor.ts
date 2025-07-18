import { generateContent } from './DataArchitectureQualityTemplate.js';
import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Processor for Data Architecture & Quality document generation (AIProcessor-based).
 */
export class DataArchitectureQualityProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const promptContent = generateContent(context);
    const prompt = `Based on the following project context, generate a comprehensive Data Architecture & Quality document.\n\n${promptContent}`;

    const response = await this.aiProcessor.makeAICall([
      {
        role: 'system',
        content: 'You are a senior data architect. Generate a thorough Data Architecture & Quality document aligned with DMBOK best practices.'
      },
      { role: 'user', content: prompt }
    ]);

    return {
      title: `Data Architecture & Quality for ${context.projectName}`,
      content: typeof response === 'string' ? response : response.content
    };
  }
}
