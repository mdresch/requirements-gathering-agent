import { getAIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { RequirementsAnalysisAndDesignDefinitionTemplate } from './RequirementsAnalysisAndDesignDefinitionTemplate.js';

class ExpectedError extends Error {}

/**
 * Processor for the BABOK Requirements Analysis & Design Definition document.
 */
export class RequirementsAnalysisAndDesignDefinitionProcessor implements DocumentProcessor {
  private aiProcessor = getAIProcessor();
  private template = new RequirementsAnalysisAndDesignDefinitionTemplate();

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a business analysis expert. Generate a comprehensive Requirements Analysis & Design Definition document using BABOK best practices.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      return {
        title: 'Requirements Analysis & Design Definition',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw new Error(`Failed to generate Requirements Analysis & Design Definition: ${error.message}`);
      } else {
        // Fallback to static template
        const fallbackContent = this.template.generateContent(context);
        return {
          title: 'Requirements Analysis & Design Definition',
          content: fallbackContent
        };
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Use the template as a structure reference
    const exampleStructure = this.template.generateContent(context);
    return `Based on the following project context, generate a comprehensive Requirements Analysis & Design Definition document.\n\nProject Context:\n- Name: ${context.projectName || 'Untitled Project'}\n- Type: ${context.projectType || 'Not specified'}\n- Description: ${context.description || 'No description provided'}\n\nUse this structure as a reference (customize for the project):\n\n${exampleStructure}\n\nInstructions:\n- Make the content specific to the project context provided\n- Ensure professional, clear, and actionable language\n- Use markdown formatting for structure\n- Keep content concise but comprehensive.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}
