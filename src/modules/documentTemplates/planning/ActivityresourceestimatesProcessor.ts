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
 * Processor for the Activity Resource Estimates document.
 */
export class ActivityresourceestimatesProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project management expert specializing in creating comprehensive Activity Resource Estimates covering human resources, equipment, materials, and facilities.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Activity Resource Estimates',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Activity Resource Estimates processing:', error.message);
        throw new Error(`Failed to generate Activity Resource Estimates: ${error.message}`);
      } else {
        console.error('Unexpected error in Activity Resource Estimates processing:', error);
        throw new Error('An unexpected error occurred while generating Activity Resource Estimates');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate comprehensive Activity Resource Estimates.

Project Context:
- Name: ${projectName}
- Type: ${context.projectType || 'Not specified'}
- Description: ${projectDescription}

Create detailed resource estimates for all project activities including human resources, equipment, materials, and facilities.

# Activity Resource Estimates

## Document Overview
- Purpose and scope of resource estimates
- Resource categories and types
- Estimation methodology

## Resource Categories

### Human Resources
- **Roles and Skills:** [Required positions and competencies]
- **Skill Levels:** [Junior, intermediate, senior classifications]
- **Availability:** [Full-time, part-time, consulting arrangements]

### Equipment and Technology
- **Hardware:** [Computers, servers, testing equipment]
- **Software:** [Development tools, licenses, subscriptions]
- **Infrastructure:** [Network, cloud services, environments]

### Materials and Supplies
- **Physical Materials:** [Hardware components, office supplies]
- **Digital Assets:** [Templates, libraries, data sets]
- **Consumables:** [Licenses, cloud compute credits]

## Resource Estimates by Activity

### [Activity ID] - [Activity Name]

**Work Package:** [WBS Code]
**Duration:** [Estimated duration]

**Human Resource Requirements:**
| Role | Skill Level | Quantity | % Allocation | Duration | Total Effort |
|------|-------------|----------|--------------|----------|--------------|
| [Role 1] | [Level] | [Count] | [%] | [Time] | [Hours/Days] |

**Equipment/Technology Requirements:**
- **[Equipment Type]:** [Quantity needed] × [Duration]
- **[Software Tool]:** [Licenses needed] × [Duration]

**Material Requirements:**
- **[Material Type]:** [Quantity and specifications]

**Estimation Basis:**
- [Factor 1 influencing resource needs]
- [Factor 2 influencing resource needs]

**Assumptions:**
- [Resource availability assumption]
- [Skill level assumption]

**Constraints:**
- [Resource availability constraints]
- [Budget constraints]

## Resource Summary

### Human Resource Summary
| Role | Total Effort | Peak Utilization | Duration Needed | Skills Required |
|------|--------------|------------------|------------------|-----------------|
| [Role 1] | [Hours] | [Peak %] | [Period] | [Skills] |

### Equipment/Technology Summary
| Item | Quantity | Duration | Cost Category | Procurement Lead Time |
|------|----------|----------|---------------|----------------------|
| [Equipment 1] | [Qty] | [Period] | [CAPEX/OPEX] | [Lead time] |

### Resource Optimization Opportunities
- **Shared Resources:** [Resources that can be shared across activities]
- **Resource Leveling:** [Opportunities to smooth resource usage]
- **Alternative Resources:** [Substitute resources or approaches]

Make the content specific to the project context provided and use markdown formatting for proper structure.
    `;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('Resource Estimates')) {
      throw new ExpectedError('Generated content does not appear to be valid Activity Resource Estimates');
    }
  }
}
