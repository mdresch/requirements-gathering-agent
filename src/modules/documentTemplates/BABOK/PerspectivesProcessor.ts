import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';
import { PerspectivesTemplate } from './PerspectivesTemplate.js';
import type { ProjectContext } from '../../ai/types';

/**
 * Processor for the BABOK Perspectives document.
 * Uses AI to enhance the Perspectives content, with fallback to the template.
 */
export class PerspectivesProcessor implements DocumentProcessor {
  public async process(context: ProjectContext): Promise<DocumentOutput> {
    return this.generate(context);
  }
  public async generate(context: ProjectContext): Promise<DocumentOutput> {
    const template = new PerspectivesTemplate();
    const aiProcessor = getAIProcessor();
    let content: string;
    try {
      const userPrompt = template.generateContent(context);
      const systemPrompt = 'You are an expert business analyst. Generate a standards-compliant BABOK Perspectives document in markdown.';
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
      title: 'Perspectives (BABOK v3)',
      content
    };
  }
}
