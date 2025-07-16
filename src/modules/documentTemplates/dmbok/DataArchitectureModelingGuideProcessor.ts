import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { DataArchitectureModelingGuideTemplate } from './DataArchitectureModelingGuideTemplate.js';

/**
 * Processor responsible for generating the Data Architecture & Modeling Guide using AIProcessor.
 */
export class DataArchitectureModelingGuideProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new DataArchitectureModelingGuideTemplate(context);
    const promptContent = template.generateContent();

    const prompt = `Based on the following project context, generate a comprehensive Data Architecture & Modeling Guide.\n\n${promptContent}`;

    const response = await this.aiProcessor.makeAICall([
      {
        role: 'system',
        content:
          'You are a senior data architect. Generate a thorough Data Architecture & Modeling Guide aligned with DMBOK best practices.'
      },
      { role: 'user', content: prompt }
    ]);

    return {
      title: `Data Architecture & Modeling Guide for ${context.projectName}`,
      content: response.content
    };
  }
}
