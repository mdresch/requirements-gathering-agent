import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Work Breakdown Structure document.
 */
export class WorkbreakdownstructureProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project management expert specializing in creating comprehensive Work Breakdown Structures that ensure complete project scope coverage.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Work Breakdown Structure',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Work Breakdown Structure processing:', error.message);
        throw new Error(`Failed to generate Work Breakdown Structure: ${error.message}`);
      } else {
        console.error('Unexpected error in Work Breakdown Structure processing:', error);
        throw new Error('An unexpected error occurred while generating Work Breakdown Structure');
      }
    }
  }
  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate a comprehensive Work Breakdown Structure (WBS) document.

Project Context:
- Name: ${projectName}
- Type: ${context.projectType || 'Not specified'}
- Description: ${projectDescription}

Requirements:
1. Create a hierarchical breakdown of all project work
2. Decompose the project into manageable work packages
3. Ensure 100% scope coverage (no missing work)
4. Use consistent decomposition levels (3-4 levels typical)
5. Include work package descriptions
6. Assign unique WBS codes/identifiers
7. Ensure work packages are measurable and assignable

Structure your response as:
# Work Breakdown Structure

## Project Overview
- Brief project description
- WBS creation approach

## WBS Hierarchy

### Level 1: Project
1.0 ${projectName}

### Level 2: Major Deliverables/Phases
1.1 [Major Deliverable 1]
1.2 [Major Deliverable 2]
1.3 [Major Deliverable 3]
1.4 Project Management

### Level 3: Work Packages
1.1.1 [Work Package Description]
1.1.2 [Work Package Description]
...

### Level 4: Activities (if needed)
1.1.1.1 [Activity Description]
1.1.1.2 [Activity Description]
...

## Work Package Descriptions
For each work package, provide:
- WBS Code
- Work Package Name
- Description
- Deliverables
- Acceptance Criteria

## WBS Guidelines
- Decomposition principles used
- Level of detail rationale
- Maintenance procedures

Focus on creating a logical, complete, and manageable breakdown that covers all project scope.
Make the content specific to the project context provided and use markdown formatting for proper structure.
    `;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('Work Breakdown Structure')) {
      throw new ExpectedError('Generated content does not appear to be a valid Work Breakdown Structure');
    }
  }
}
