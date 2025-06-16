import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { BusinesscaseTemplate } from '../strategic-statements/BusinesscaseTemplate.js';

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

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }
  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
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

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new BusinesscaseTemplate(context);
    const exampleStructure = template.generateContent();

    // Extract any available context properties safely
    const contextDetails = JSON.stringify(context, null, 2);

    return `Based on the comprehensive project context below, generate a professional, investment-grade Business Case document. This document will be presented to senior executives for funding approval.

**COMPREHENSIVE PROJECT CONTEXT:**

**Core Project Information:**
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${(context as any).projectType || 'Not specified'}
- Description: ${(context as any).description || 'No description provided'}

**Full Project Context:**
${contextDetails}

**Template Structure to Follow:**

${exampleStructure}

**CRITICAL INSTRUCTIONS:**
- Replace ALL instructional placeholders [brackets] with actual, project-specific content
- Generate concrete, realistic financial estimates where possible based on the project context
- Create authentic risk assessments based on the project's actual characteristics
- Write for a senior executive audience - confident, data-driven, decision-oriented
- Ensure every section provides genuine business value and insight
- Make specific references to the project's actual capabilities and benefits
- Remove all template instructions and commentary from the final output
- The final document must be ready for immediate executive presentation

Generate the complete Business Case document now:`;
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
