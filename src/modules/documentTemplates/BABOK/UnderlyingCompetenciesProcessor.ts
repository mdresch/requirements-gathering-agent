import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';
import { UnderlyingCompetenciesTemplate } from './UnderlyingCompetenciesTemplate.js';
import type { ProjectContext } from '../../ai/types';

/**
 * Processor for the BABOK Underlying Competencies document.
 * Uses AIProcessor for enhanced content, with fallback to the template.
 */
export class UnderlyingCompetenciesProcessor implements DocumentProcessor {
  public async process(context: ProjectContext): Promise<DocumentOutput> {
    return this.generate(context);
  }
  public async generate(context: ProjectContext): Promise<DocumentOutput> {
    const template = new UnderlyingCompetenciesTemplate();
    const aiProcessor = getAIProcessor();
    let content: string;
    try {
      // Use the template to generate a user prompt for the AI
      const userPrompt = template.generateContent(context);
      const systemPrompt = 'You are an expert business analyst. Generate a standards-compliant BABOK Underlying Competencies document in markdown.';
      const messages = aiProcessor.createMessages(systemPrompt, userPrompt);
      const response = await aiProcessor.makeAICall(messages);
      content = aiProcessor.extractContent(response);
    } catch (err) {
      content = template.generateContent(context);
    }
    if (!content || typeof content !== 'string' || content.length < 100) {
      content = template.generateContent(context);
    }
    return {
      title: 'Underlying Competencies (BABOK v3)',
      content
    };
  }
}
