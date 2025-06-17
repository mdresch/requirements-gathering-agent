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
 * Processor for the Activity List document.
 */
export class ActivitylistProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project management expert specializing in creating comprehensive Activity Lists that decompose work packages into specific, actionable activities.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Activity List',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Activity List processing:', error.message);
        throw new Error(`Failed to generate Activity List: ${error.message}`);
      } else {
        console.error('Unexpected error in Activity List processing:', error);
        throw new Error('An unexpected error occurred while generating Activity List');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate a comprehensive Activity List document.

Project Context:
- Name: ${projectName}
- Type: ${context.projectType || 'Not specified'}
- Description: ${projectDescription}

Create a detailed activity list that decomposes work packages into specific, actionable activities. Focus on activities that are measurable, assignable, and support the project objectives.

# Activity List

## Document Overview
- Purpose and scope of the Activity List
- Relationship to Work Breakdown Structure
- Activity identification methodology

## Activity Definitions

### Project Phase: [Phase Name]

#### Work Package: [WBS Code] - [Work Package Name]

**Activity ID:** [Unique identifier, e.g., ACT-001]
**Activity Name:** [Clear, action-oriented name]
**Description:** [Detailed description of what needs to be done]
**Deliverable:** [Expected output or result]
**Effort Estimate:** [Hours/days]
**Skills Required:** [Technical skills, roles]
**Constraints:** [Time, resource, or dependency constraints]
**Assumptions:** [Key assumptions for this activity]

[Continue for all work packages and phases]

## Activity Summary

### Activity Inventory
| Activity ID | Activity Name | Work Package | Phase | Effort Est. | Skills Required |
|-------------|---------------|--------------|--------|-------------|-----------------|
| ACT-001     | [Name]        | [WBS Code]   | [Phase]| [Hours]     | [Skills]        |

### Activity Categories
- **Development Activities:** [Count and description]
- **Testing Activities:** [Count and description]
- **Documentation Activities:** [Count and description]
- **Management Activities:** [Count and description]

Make the content specific to the project context provided and use markdown formatting for proper structure.
    `;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('Activity List')) {
      throw new ExpectedError('Generated content does not appear to be a valid Activity List');
    }
  }
}
