import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ScopemanagementplanTemplate } from '../scope-management/ScopemanagementplanTemplate';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Scope Management Plan document.
 */
export class ScopemanagementplanProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert project manager specializing in scope management and PMBOK standards. Generate comprehensive, professional scope management plans based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Scope Management Plan',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Scope Management Plan processing:', error.message);
        throw new Error(`Failed to generate Scope Management Plan: ${error.message}`);
      } else {
        console.error('Unexpected error in Scope Management Plan processing:', error);
        throw new Error('An unexpected error occurred while generating Scope Management Plan');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new ScopemanagementplanTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Scope Management Plan that follows PMBOK standards and provides detailed guidance for scope planning, definition, verification, and control.

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}

Use this structure as a reference (but customize the content for the specific project):

${exampleStructure}

Important Instructions:
- Follow PMBOK scope management standards and best practices
- Define clear scope planning, definition, verification, and control processes
- Include Work Breakdown Structure (WBS) development guidance
- Address scope change control procedures
- Define acceptance criteria and verification processes
- Include stakeholder engagement for scope definition
- Address scope creep prevention and management
- Ensure the plan is actionable and specific to the project context
- Use professional tone appropriate for project documentation
- Focus on practical implementation guidance for scope management`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    // Ensure it contains scope management specific content
    if (!content.toLowerCase().includes('scope')) {
      throw new ExpectedError('Generated content does not appear to contain scope management content');
    }
  }
}
