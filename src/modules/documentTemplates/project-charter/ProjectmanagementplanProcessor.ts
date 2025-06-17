import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ProjectmanagementplanTemplate } from '../project-charter/ProjectmanagementplanTemplate';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Project Management Plan document.
 */
export class ProjectmanagementplanProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert project manager specializing in PMBOK-compliant project management plan development. Generate comprehensive, professional project management plans based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Project Management Plan',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Project Management Plan processing:', error.message);
        throw new Error(`Failed to generate Project Management Plan: ${error.message}`);
      } else {
        console.error('Unexpected error in Project Management Plan processing:', error);
        throw new Error('An unexpected error occurred while generating Project Management Plan');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new ProjectmanagementplanTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Project Management Plan that follows PMBOK standards and provides detailed guidance for project execution.

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}

Use this structure as a reference (but customize the content for the specific project):

${exampleStructure}

Important Instructions:
- Follow PMBOK standards and best practices
- Include all key project management knowledge areas
- Define clear processes, procedures, and governance
- Address project lifecycle from initiation to closure
- Include specific deliverables, milestones, and success criteria
- Define roles, responsibilities, and communication protocols
- Address risk management, quality assurance, and change control
- Ensure the plan is actionable and specific to the project context
- Use professional tone appropriate for executive and stakeholder review
- Focus on practical implementation guidance`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    // Ensure it contains project management specific content
    if (!content.toLowerCase().includes('project management')) {
      throw new ExpectedError('Generated content does not appear to contain project management plan content');
    }
  }
}
