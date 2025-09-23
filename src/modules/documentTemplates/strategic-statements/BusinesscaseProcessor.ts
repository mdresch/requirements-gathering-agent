import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { TemplateRepository } from '../../../repositories/TemplateRepository.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Businesscase document.
 */
export class BusinesscaseProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;
  private templateRepository: TemplateRepository;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
    this.templateRepository = new TemplateRepository();
  }
  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = await this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { 
          role: 'system', 
          content: `You are an expert Management Consultant and acting Chief Financial Officer (CFO). Your core competency is building compelling, data-driven business cases to secure executive approval for high-impact projects.

**YOUR TASK:**
Generate a formal "Business Case" document using the provided template based on the given project context.

**PROCESS:**
1. **Full Context Analysis:** Scrutinize all provided information (READMEs, project goals, technical specs) to extract facts and infer business implications. Look specifically for anything related to costs, benefits, risks, goals, and timelines.
2. **Quantify Everything Possible:** Translate qualitative statements into quantitative estimates where logical. If the context says "saves a lot of time," you might infer a financial benefit category like "Productivity Gains." If costs are mentioned, list them.
3. **Synthesize Content for Each Section:** Meticulously draft content for every section of the template, from the executive summary to the final recommendation.
4. **Perform a Balanced Risk Assessment:** Identify realistic risks and propose practical, actionable mitigation strategies.
5. **Formulate a Clear Recommendation:** The final output must conclude with a decisive recommendation to proceed, delay, or cancel the project, backed by the evidence presented. Assume a positive recommendation unless the context strongly suggests otherwise.
6. **Adopt an Executive Tone:** The language must be professional, confident, concise, and geared towards a senior leadership audience. Remove all instructional comments and placeholders from the final output.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Business Case',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Business Case processing:', error.message);
        throw new Error(`Failed to generate Business Case: ${error.message}`);
      } else {
        console.error('Unexpected error in Business Case processing:', error);
        throw new Error('An unexpected error occurred while generating Business Case');
      }
    }
  }

  private async createPrompt(context: ProjectContext): Promise<string> {
    // Fetch the template from the database
    const templateId = '68cf6a63a14fd05622cf3cc5'; // Business Case template ID
    const template = await this.templateRepository.getTemplateById(templateId);
    
    if (!template) {
      throw new ExpectedError('Business Case template not found in database');
    }

    // Get the template content from the database
    // The enhanced template content is stored in templateData.content
    const templateContent = (template as any).templateData?.content || template.prompt_template || '';
    
    if (!templateContent) {
      throw new ExpectedError('Template content is empty in database');
    }

    return `Based on the comprehensive project context below, generate a professional, investment-grade Business Case document following the template structure provided.

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}
- Program: ${context.programName || 'Not specified'}

IMPORTANT: You must follow the EXACT template structure provided below. Replace the template variables with project-specific content, but maintain the exact same structure, sections, and formatting.

Template Structure to Follow:

${templateContent}

Instructions:
1. Replace template variables (like {{projectName}}, {{projectType}}, etc.) with the actual project context provided above
2. Customize the content within each section to be specific to this project
3. Maintain the exact same markdown structure, headers, and formatting
4. Generate realistic and detailed business case content based on the project context
5. Use professional, executive-level language appropriate for funding approval
6. Make the content immediately usable for executive presentation

Generate the Business Case following this template structure exactly.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has some structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}
