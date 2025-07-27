import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { ProgramCharterTemplate } from './ProgramCharterTemplate.js';

/**
 * Processor for the Program Project Charter document.
 */
export class ProgramCharterProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  /**
   * Detects [AI_SYNTHESIS: ...] tags and generates text for each, replacing the tag with AI-generated content.
   */
  private async synthesizeSectionContent(sectionContent: string, context: ProjectContext): Promise<string> {
    const synthesisRegex = /\[AI_SYNTHESIS:([^\]]+)\]/g;
    let result = sectionContent;
    let match;
    while ((match = synthesisRegex.exec(sectionContent)) !== null) {
      const prompt = match[1].trim();
      // Use AIProcessor to generate content for the prompt
      const aiContent = await this.aiProcessor.makeAICall([
        { role: 'system', content: `You are a PMO Director and Executive Sponsor. Synthesize content for the Program/Project Charter section based on the following prompt and context.` },
        { role: 'user', content: `Prompt: ${prompt}\nContext: ${JSON.stringify(context)}` }
      ]).then(res => typeof res === 'string' ? res : res.content);
      result = result.replace(match[0], aiContent);
    }
    return result;
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const sections = ProgramCharterTemplate.getSections(context);
    let content = `# ${ProgramCharterTemplate.title}\n\n`;
    for (const section of sections) {
      const synthesizedContent = await this.synthesizeSectionContent(section.content, context);
      content += `## ${section.title}\n\n${synthesizedContent}\n\n`;
    }
    return {
      title: ProgramCharterTemplate.title,
      content
    };
  }
}
