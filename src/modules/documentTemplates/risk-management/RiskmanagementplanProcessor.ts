import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { RiskmanagementplanTemplate } from '../risk-management/RiskmanagementplanTemplate';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Risk Management Plan document.
 */
export class RiskmanagementplanProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert risk management consultant and project manager specializing in PMBOK-compliant risk management planning. Generate comprehensive, professional risk management plans based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Risk Management Plan',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Risk Management Plan processing:', error.message);
        throw new Error(`Failed to generate Risk Management Plan: ${error.message}`);
      } else {
        console.error('Unexpected error in Risk Management Plan processing:', error);
        throw new Error('An unexpected error occurred while generating Risk Management Plan');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new RiskmanagementplanTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Risk Management Plan that follows PMBOK standards and provides detailed guidance for risk identification, analysis, response planning, and monitoring.

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}

Use this structure as a reference (but customize the content for the specific project):

${exampleStructure}

Important Instructions:
- Follow PMBOK risk management standards and best practices
- Include all six risk management processes (planning, identification, analysis, response planning, implementation, monitoring)
- Define clear risk categories, probability/impact scales, and response strategies
- Include risk register template and risk breakdown structure
- Address both threats and opportunities
- Define roles and responsibilities for risk management
- Include risk tolerance and threshold definitions
- Ensure the plan is actionable and specific to the project context
- Use professional tone appropriate for executive and stakeholder review
- Focus on practical implementation guidance for risk management activities`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    // Ensure it contains risk management specific content
    if (!content.toLowerCase().includes('risk')) {
      throw new ExpectedError('Generated content does not appear to contain risk management content');
    }
  }
}
