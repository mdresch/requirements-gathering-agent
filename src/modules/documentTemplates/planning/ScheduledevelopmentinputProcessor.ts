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
 * Processor for the Schedule Development Input document.
 */
export class ScheduledevelopmentinputProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project management expert specializing in creating comprehensive Schedule Development Input that consolidates all information needed for effective project scheduling.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Schedule Development Input',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Schedule Development Input processing:', error.message);
        throw new Error(`Failed to generate Schedule Development Input: ${error.message}`);
      } else {
        console.error('Unexpected error in Schedule Development Input processing:', error);
        throw new Error('An unexpected error occurred while generating Schedule Development Input');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate comprehensive Schedule Development Input.

Project Context:
- Name: ${projectName}
- Type: ${context.projectType || 'Not specified'}
- Description: ${projectDescription}

Create a comprehensive document that consolidates all inputs needed for effective schedule development.

# Schedule Development Input

## Document Overview
- Purpose and scope of schedule development inputs
- Relationship to other planning documents
- Input consolidation methodology

## Activity Information

### Activity List Summary
- **Total Activities:** [Number of activities identified]
- **Activity Categories:** [Development, testing, documentation, management, etc.]
- **Activity Sources:** [WBS decomposition, expert input, templates]

### Activity Attributes
| Activity ID | Activity Name | Type | Complexity | Priority |
|-------------|---------------|------|------------|----------|
| [ID] | [Name] | [Type] | [High/Med/Low] | [Critical/High/Med/Low] |

## Activity Sequencing

### Dependency Types
- **Finish-to-Start (FS):** [Most common dependency type]
- **Start-to-Start (SS):** [Parallel activities that must start together]
- **Finish-to-Finish (FF):** [Activities that must finish together]

### Major Dependencies
| Predecessor | Successor | Dependency Type | Lag/Lead | Rationale |
|------------|-----------|-----------------|-----------|-----------|
| [Activity A] | [Activity B] | [FS/SS/FF] | [Days] | [Why this dependency exists] |

### External Dependencies
- **Vendor Dependencies:** [Third-party deliveries, approvals]
- **Client Dependencies:** [Client approvals, information, resources]
- **Regulatory Dependencies:** [Permits, certifications, compliance]

## Resource Information

### Resource Requirements Summary
| Resource Type | Total Required | Peak Demand | Availability | Constraints |
|---------------|----------------|-------------|--------------|-------------|
| [Role/Skill] | [Quantity] | [Peak period] | [%] | [Limitations] |

### Resource Calendars
- **Standard Work Calendar:** [Days, hours, holidays]
- **Resource-Specific Calendars:** [Individual availability patterns]
- **Equipment Calendars:** [Maintenance schedules, availability]

## Duration Estimates

### Estimation Summary
| Activity Category | Total Duration | Confidence Level | Estimation Method |
|------------------|----------------|------------------|-------------------|
| [Category] | [Duration] | [High/Med/Low] | [Method used] |

### Duration Assumptions
- **Productivity Assumptions:** [Expected work rates, efficiency]
- **Resource Assumptions:** [Skill levels, availability, dedication]
- **Quality Assumptions:** [Rework rates, review cycles]

## Project Constraints

### Time Constraints
- **Project Deadline:** [Final delivery date and rationale]
- **Milestone Dates:** [Key milestone requirements and flexibility]
- **Phase Gates:** [Decision points and approval requirements]

### Resource Constraints
- **Budget Limitations:** [Total budget and spending profiles]
- **Resource Availability:** [Key resource limitations]
- **Skill Availability:** [Critical skill shortages]

### Quality Constraints
- **Quality Standards:** [Required quality levels and criteria]
- **Testing Requirements:** [Test coverage, performance criteria]
- **Review Requirements:** [Approval processes, review cycles]

## Risk Factors

### Schedule Risk Sources
- **Technical Risks:** [Technology challenges, complexity]
- **Resource Risks:** [Availability, turnover, skill gaps]
- **External Risks:** [Vendor delays, regulatory changes]

### Risk Impact on Schedule
| Risk | Probability | Impact | Schedule Effect | Mitigation Strategy |
|------|-------------|--------|-----------------|-------------------|
| [Risk] | [H/M/L] | [H/M/L] | [Days] | [Strategy] |

### Schedule Buffers
- **Activity Buffers:** [Individual activity contingencies]
- **Project Buffer:** [Overall project contingency]
- **Management Reserve:** [Additional executive buffer]

## Assumptions and Constraints

### Key Assumptions
- **Resource Assumptions:** [Team availability, skill levels]
- **Technology Assumptions:** [Tool availability, performance]
- **Process Assumptions:** [Method effectiveness, efficiency]

### Project Constraints
- **Scope Constraints:** [Fixed scope elements]
- **Time Constraints:** [Immovable deadlines]
- **Cost Constraints:** [Budget limitations]
- **Quality Constraints:** [Non-negotiable quality requirements]

Make the content specific to the project context provided and use markdown formatting for proper structure.
    `;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('Schedule Development Input')) {
      throw new ExpectedError('Generated content does not appear to be valid Schedule Development Input');
    }
  }
}
