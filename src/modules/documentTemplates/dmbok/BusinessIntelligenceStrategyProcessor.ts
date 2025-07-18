import { generateContent } from './BusinessIntelligenceStrategyTemplate';
import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

/**
 * Processor for Business Intelligence & Analytics Strategy document generation (AIProcessor-based).
 */
export class BusinessIntelligenceStrategyProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const promptContent = generateContent(context);
    const prompt = `Based on the following project context, generate a comprehensive Business Intelligence & Analytics Strategy.\n\n${promptContent}`;

    const response = await this.aiProcessor.makeAICall([
      {
        role: 'system',
        content: 'You are a senior BI architect. Generate a thorough Business Intelligence & Analytics Strategy aligned with DMBOK best practices.'
      },
      { role: 'user', content: prompt }
    ]);

    return {
      title: `Business Intelligence & Analytics Strategy for ${context.projectName}`,
      content: typeof response === 'string' ? response : response.content
    };
  }
}
