import { ProjectContext } from '../../ai/types';
import { DocumentOutput } from '../../documentGenerator/types';
import { KeyrolesandneedsTemplate } from './KeyrolesandneedsTemplate.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';

export class KeyrolesandneedsProcessor {
  private aiProcessor = getAIProcessor();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new KeyrolesandneedsTemplate();
    const prompt = template.buildPrompt(context);
    const messages = [
      { role: "system" as const, content: 'You are an expert business analyst and requirements engineer specializing in stakeholder analysis and role-based system design.' },
      { role: "user" as const, content: prompt }
    ];
    const aiResponse = await this.aiProcessor.makeAICall(messages);
    const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
    return {
      title: 'Key Roles and Needs Analysis',
      content
    };
  }
}