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
 * Processor for the WBS Dictionary document.
 */
export class WbsdictionaryProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project management expert specializing in creating comprehensive WBS Dictionaries that provide detailed work package definitions.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'WBS Dictionary',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in WBS Dictionary processing:', error.message);
        throw new Error(`Failed to generate WBS Dictionary: ${error.message}`);
      } else {
        console.error('Unexpected error in WBS Dictionary processing:', error);
        throw new Error('An unexpected error occurred while generating WBS Dictionary');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate a comprehensive WBS Dictionary document.

Project Context:
- Name: ${projectName}
- Type: ${context.projectType || 'Not specified'}
- Description: ${projectDescription}

Requirements:
1. Define each work package from the WBS in detail
2. Provide complete work package descriptions
3. Specify deliverables for each work package
4. Define acceptance criteria and success metrics
5. Identify responsible parties and skills required
6. Estimate effort and duration ranges
7. Highlight dependencies and constraints

Structure your response as:
# WBS Dictionary

## Document Overview
- Purpose and scope of the WBS Dictionary
- Relationship to Work Breakdown Structure
- How to use this document

## Work Package Definitions

### [WBS Code] - [Work Package Name]
**Description:** [Detailed description of the work to be performed]

**Deliverables:**
- [Specific deliverable 1]
- [Specific deliverable 2]
- [Specific deliverable 3]

**Acceptance Criteria:**
- [Measurable criteria 1]
- [Measurable criteria 2]
- [Measurable criteria 3]

**Responsible Party:** [Role/Department]
**Skills Required:** [Technical skills, certifications, experience]
**Estimated Effort:** [Hours/Days range]
**Estimated Duration:** [Calendar time]

**Dependencies:**
- **Predecessors:** [What must be completed first]
- **Successors:** [What depends on this work package]

**Constraints:**
- [Resource constraints]
- [Time constraints]
- [Quality constraints]

**Assumptions:**
- [Key assumptions about this work package]

**Risks:**
- [Potential risks and mitigation strategies]

[Repeat for each work package in the WBS]

## Work Package Cross-Reference
- Summary table of all work packages
- Responsibility matrix
- Dependency network overview

## Dictionary Maintenance
- Update procedures
- Version control
- Review schedule

Focus on providing clear, actionable definitions that enable accurate planning and execution.
Make the content specific to the project context provided and use markdown formatting for proper structure.
    `;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('WBS Dictionary')) {
      throw new ExpectedError('Generated content does not appear to be a valid WBS Dictionary');
    }
  }
}
