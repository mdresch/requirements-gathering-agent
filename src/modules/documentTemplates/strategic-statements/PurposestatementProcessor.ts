import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { PurposestatementTemplate } from '../strategic-statements/PurposestatementTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Purposestatement document.
 */
export class PurposestatementProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }
  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert consultant specializing in strategic statements documentation. Generate comprehensive, professional content based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Purposestatement',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Purposestatement processing:', error.message);
        throw new Error(`Failed to generate Purposestatement: ${error.message}`);
      } else {
        console.error('Unexpected error in Purposestatement processing:', error);
        throw new Error('An unexpected error occurred while generating Purposestatement');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new PurposestatementTemplate(context);
    const exampleStructure = template.generateContent();

    // Build enhanced context for purpose statement
    const enhancedContext = this.buildPurposeContext(context);

    return `Based on the following project context, generate a comprehensive Project Purpose Statement document.

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}

Enhanced Context for Purpose Statement:
${enhancedContext}

Use this structure as a reference (but customize the content for the specific project):

${exampleStructure}

Specific Instructions for Purpose Statement:
- Clearly articulate WHY this project exists
- Define the fundamental problem or opportunity being addressed
- Explain the strategic importance and business value
- Identify primary stakeholders and their benefits
- Define success criteria and measurable outcomes
- Ensure alignment with organizational goals
- Make the purpose compelling and motivational
- Use professional, executive-level language
- Focus on business impact and value creation
- Keep the purpose statement clear and memorable`;
  }

  private buildPurposeContext(context: ProjectContext): string {
    let purposeContext = '';

    // Business context
    if (context.projectType) {
      purposeContext += `Business Domain: ${context.projectType}\n`;
    }

    // Strategic alignment context
    purposeContext += `Strategic Focus Areas:\n`;
    purposeContext += `- Innovation and digital transformation\n`;
    purposeContext += `- Operational efficiency and process improvement\n`;
    purposeContext += `- Customer experience enhancement\n`;
    purposeContext += `- Market competitiveness and growth\n\n`;

    // Stakeholder context
    purposeContext += `Key Stakeholder Categories:\n`;
    purposeContext += `- Executive leadership and decision makers\n`;
    purposeContext += `- End users and customers\n`;
    purposeContext += `- Implementation teams and staff\n`;
    purposeContext += `- Business partners and vendors\n\n`;

    // Value drivers
    purposeContext += `Common Value Drivers:\n`;
    purposeContext += `- Revenue growth and cost optimization\n`;
    purposeContext += `- Risk reduction and compliance\n`;
    purposeContext += `- Quality improvement and standardization\n`;
    purposeContext += `- Time-to-market acceleration\n`;
    purposeContext += `- Employee productivity and satisfaction\n\n`;

    // Success metrics
    purposeContext += `Typical Success Metrics:\n`;
    purposeContext += `- ROI and financial performance indicators\n`;
    purposeContext += `- Customer satisfaction and engagement scores\n`;
    purposeContext += `- Operational efficiency measurements\n`;
    purposeContext += `- Quality and compliance metrics\n`;
    purposeContext += `- Timeline and delivery performance\n\n`;

    return purposeContext;
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
