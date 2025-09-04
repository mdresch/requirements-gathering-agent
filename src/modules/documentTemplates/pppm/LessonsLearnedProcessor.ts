import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { LessonsLearnedTemplate } from './LessonsLearnedTemplate.js';

/**
 * Processor for the Lessons Learned document.
 */
export class LessonsLearnedProcessor implements DocumentProcessor {
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
        { role: 'system', content: `You are a Project/Program Manager and experienced PMO professional. Generate comprehensive lessons learned content based on the following prompt and project context. Focus on actionable insights and organizational learning.` },
        { role: 'user', content: `Prompt: ${prompt}\nProject Context: ${JSON.stringify(context)}\n\nProvide specific, actionable content that captures lessons learned and can be applied to future projects. Be constructive and focus on improvement opportunities.` }
      ]).then(res => typeof res === 'string' ? res : res.content);
      result = result.replace(match[0], aiContent);
    }
    return result;
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const sections = LessonsLearnedTemplate.getSections(context);
    let content = `# ${LessonsLearnedTemplate.title}\n\n`;
    
    for (const section of sections) {
      const synthesizedContent = await this.synthesizeSectionContent(section.content, context);
      content += `## ${section.title}\n\n${synthesizedContent}\n\n`;
    }
    
    return {
      title: LessonsLearnedTemplate.title,
      content
    };
  }
}