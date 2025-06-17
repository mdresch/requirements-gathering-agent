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
 * Processor for the Activity Duration Estimates document.
 */
export class ActivitydurationestimatesProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project management expert specializing in creating accurate Activity Duration Estimates using proven estimation techniques.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Activity Duration Estimates',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Activity Duration Estimates processing:', error.message);
        throw new Error(`Failed to generate Activity Duration Estimates: ${error.message}`);
      } else {
        console.error('Unexpected error in Activity Duration Estimates processing:', error);
        throw new Error('An unexpected error occurred while generating Activity Duration Estimates');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate comprehensive Activity Duration Estimates.

Project Context:
- Name: ${projectName}
- Type: ${context.projectType || 'Not specified'}
- Description: ${projectDescription}

Create detailed duration estimates for project activities using appropriate estimation techniques.

# Activity Duration Estimates

## Document Overview
- Purpose and scope of duration estimates
- Estimation methodology and techniques
- Assumptions and constraints

## Estimation Methodology

### Techniques Used
- **Expert Judgment:** [Description of expert sources]
- **Analogous Estimating:** [Historical data used]
- **Parametric Estimating:** [Parameters and models]
- **Three-Point Estimating:** [PERT/Beta distribution approach]

### Estimation Factors
- **Resource Productivity:** [Skill levels, experience]
- **Resource Availability:** [Full-time vs. part-time]
- **Work Environment:** [Location, tools, infrastructure]
- **Complexity Factors:** [Technical difficulty, integration]

## Duration Estimates by Activity

### [Activity ID] - [Activity Name]

**Work Package:** [WBS Code]
**Phase:** [Project Phase]

**Three-Point Estimate:**
- **Optimistic (O):** [Best case scenario] [time unit]
- **Most Likely (M):** [Most probable scenario] [time unit]
- **Pessimistic (P):** [Worst case scenario] [time unit]
- **Expected Duration:** [(O + 4M + P) / 6] [time unit]

**Estimation Basis:**
- [Factor 1 and its impact]
- [Factor 2 and its impact]

**Assumptions:**
- [Key assumption 1]
- [Key assumption 2]

**Dependencies:**
- [Predecessor activities and their impact]
- [Resource dependencies]

## Duration Summary

### Activity Duration Table
| Activity ID | Activity Name | Optimistic | Most Likely | Pessimistic | Expected |
|-------------|---------------|------------|-------------|-------------|----------|
| ACT-001     | [Name]        | [O]        | [M]         | [P]         | [E]      |

### Duration Analysis
- **Total Project Duration:** [Sum of critical path activities]
- **Critical Path Duration:** [Longest sequence duration]
- **Project Buffer:** [Overall contingency recommendation]

Make the content specific to the project context provided and use markdown formatting for proper structure.
    `;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('Duration Estimates')) {
      throw new ExpectedError('Generated content does not appear to be valid Activity Duration Estimates');
    }
  }
}
