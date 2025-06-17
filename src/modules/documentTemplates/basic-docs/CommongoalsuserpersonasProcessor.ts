import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { CommongoalsuserpersonasTemplate } from '../basic-docs/CommongoalsuserpersonasTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Common Goals User Personas Analysis document.
 * Analyzes shared objectives across user personas to align Requirements Gathering Agent features with user needs.
 */
export class CommongoalsuserpersonasProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert UX researcher and requirements analyst specializing in user persona analysis and feature alignment. Generate comprehensive analysis of common goals across user personas to guide feature development and improve user satisfaction.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Common Goals User Personas Analysis',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Common Goals User Personas processing:', error.message);
        throw new Error(`Failed to generate Common Goals User Personas Analysis: ${error.message}`);
      } else {
        console.error('Unexpected error in Common Goals User Personas processing:', error);
        throw new Error('An unexpected error occurred while generating Common Goals User Personas Analysis');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new CommongoalsuserpersonasTemplate(context);
    const exampleStructure = template.generateContent();

    return `As a requirements analyst, analyze the user personas for the Requirements Gathering Agent to identify common goals and align features with user needs.

Project Context:
- Name: ${context.projectName || 'Requirements Gathering Agent'}
- Type: ${context.projectType || 'Requirements Analysis Tool'}
- Description: ${context.description || 'AI-powered tool for streamlining requirements gathering and documentation processes'}

User Story Context:
"As a requirements analyst, I want to identify common goals across the user personas, so that I can align the Requirements Gathering Agent features with user needs and improve user satisfaction."

Use this structure as a reference (but customize the analysis for the specific project):

${exampleStructure}

Important Instructions:
- Focus on identifying shared objectives across different user personas
- Analyze how Requirements Gathering Agent features can address common user goals
- Prioritize features based on cross-persona impact and user satisfaction potential
- Include specific user personas relevant to requirements gathering and project management
- Provide actionable insights for feature development and user experience improvement
- Use data-driven approach with specific metrics and success criteria
- Ensure the analysis serves requirements analysts in making informed decisions
- Include practical recommendations for aligning features with user needs
- Address efficiency, quality, collaboration, and process optimization goals
- Provide clear feature prioritization matrix and implementation roadmap`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    // Ensure it contains persona-specific content
    if (!content.toLowerCase().includes('persona') && !content.toLowerCase().includes('user')) {
      throw new ExpectedError('Generated content does not appear to contain user persona analysis');
    }

    // Ensure it contains goals analysis
    if (!content.toLowerCase().includes('goal')) {
      throw new ExpectedError('Generated content does not appear to contain goals analysis');
    }

    // Ensure it contains feature alignment content
    if (!content.toLowerCase().includes('feature') && !content.toLowerCase().includes('requirement')) {
      throw new ExpectedError('Generated content does not appear to contain feature alignment analysis');
    }
  }
}
