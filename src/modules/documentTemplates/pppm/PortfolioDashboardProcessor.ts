import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types';
import { PortfolioDashboardTemplate } from './PortfolioDashboardTemplate.js';

/**
 * Processor for the Portfolio Dashboard document.
 * Aggregates and visualizes performance, health, risks, and benefits across multiple projects/programs.
 */
export class PortfolioDashboardProcessor implements DocumentProcessor {
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
        { 
          role: 'system', 
          content: `You are a Portfolio Manager and Executive creating a comprehensive portfolio dashboard. Focus on aggregating data across multiple projects, providing executive-level insights, and highlighting actionable information for portfolio governance and decision-making.` 
        },
        { 
          role: 'user', 
          content: `Create portfolio dashboard content for: ${prompt}\n\nContext: ${JSON.stringify(context)}\n\nProvide specific, actionable content suitable for executive dashboards. Include relevant metrics, status indicators, and recommendations where appropriate.` 
        }
      ]).then(res => typeof res === 'string' ? res : res.content);
      result = result.replace(match[0], aiContent);
    }
    return result;
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    const sections = PortfolioDashboardTemplate.getSections(context);
    let content = `# ${PortfolioDashboardTemplate.title}\n\n`;
    
    for (const section of sections) {
      const synthesizedContent = await this.synthesizeSectionContent(section.content, context);
      content += `## ${section.title}\n\n${synthesizedContent}\n\n`;
    }
    
    return {
      title: PortfolioDashboardTemplate.title,
      content
    };
  }
}