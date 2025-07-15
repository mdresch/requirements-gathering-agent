
import { ProjectContext } from '../../ai/types';
import { DocumentOutput } from '../../documentGenerator/types';
import { UserpersonasTemplate } from './UserpersonasTemplate.js';
import { getAIProcessor } from '../../ai/AIProcessor.js';

export class UserpersonasProcessor {
  private aiProcessor = getAIProcessor();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const template = new UserpersonasTemplate();
    const prompt = template.buildPrompt(context);
    const messages = [
      { role: "system" as const, content: 'You are an expert business analyst. Generate a set of user personas based on the project context.' },
      { role: "user" as const, content: prompt }
    ];
    const aiResponse = await this.aiProcessor.makeAICall(messages);
    const content = typeof aiResponse === 'string' ? aiResponse : aiResponse.content;
    return {
      title: 'User Personas',
      content
    };
  }
}
