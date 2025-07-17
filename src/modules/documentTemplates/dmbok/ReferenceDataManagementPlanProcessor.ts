import { ProjectContext } from '../../ai/types.js';
import { DocumentOutput } from '../../documentGenerator/types.js';
import { ReferenceDataManagementPlanTemplate } from './ReferenceDataManagementPlanTemplate.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';

export class ReferenceDataManagementPlanProcessor {
  private aiProcessor = getAIProcessor();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new ReferenceDataManagementPlanTemplate();
    const prompt = template.buildPrompt(context);
    const messages = [
      { role: 'system' as const, content: 'You are an expert in data management. Generate a comprehensive Reference Data Management Plan based on the project context.' },
      { role: 'user' as const, content: prompt }
    ];
    const aiResponse = await this.aiProcessor.makeAICall(messages);
    const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
    return {
      title: 'Reference Data Management Plan',
      content
    };
  }
}
