import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { SchedulenetworkdiagramTemplate } from '../basic-docs/SchedulenetworkdiagramTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Schedulenetworkdiagram document.
 */
export class SchedulenetworkdiagramProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }
  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert consultant specializing in basic docs documentation. Generate comprehensive, professional content based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Schedule Network Diagram',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Schedulenetworkdiagram processing:', error.message);
        throw new Error(`Failed to generate Schedulenetworkdiagram: ${error.message}`);
      } else {
        console.error('Unexpected error in Schedulenetworkdiagram processing:', error);
        throw new Error('An unexpected error occurred while generating Schedulenetworkdiagram');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Untitled Project';
    const projectType = context.projectType || 'Not specified';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate a comprehensive Schedule Network Diagram document.

Project Context:
- Name: ${projectName}
- Type: ${projectType}
- Description: ${projectDescription}

Requirements:
1. Create a detailed schedule network diagram showing activity relationships
2. Define all dependency types (FS, SS, FF, SF) where applicable
3. Identify the critical path and critical activities
4. Show lead and lag times where relevant
5. Include milestone activities and decision points
6. Provide detailed dependency analysis
7. Address resource constraints and leveling
8. Include schedule compression techniques

Structure your response as:
# Schedule Network Diagram

## Document Overview
- Project name and type
- Purpose of the schedule network diagram
- Methodology used (PDM/ADM)

## Network Diagram Development
- Activity identification process
- Dependency analysis methodology
- Critical path determination

## Activity Network Structure
Create detailed network diagrams for each project phase:

### Phase 1: [Phase Name]
\`\`\`
[Activity A] --FS--> [Activity B] --FS--> [Activity C]
     |                   |                   |
     SS                  FF                  FS
     ↓                   ↓                   ↓
[Activity D] --FS--> [Activity E] --FS--> [Activity F]
\`\`\`

**Critical Activities:** [List critical path activities]
**Float Analysis:** [Activities with float and duration]

[Repeat for each phase]

## Critical Path Analysis
- Complete critical path sequence
- Total project duration
- Critical activities that cannot be delayed
- Schedule compression opportunities

## Dependency Management
### Mandatory Dependencies (Hard Logic)
- Technical requirements
- Legal/regulatory requirements
- Physical constraints

### Discretionary Dependencies (Soft Logic)
- Best practices
- Preferred sequences
- Resource optimization

### External Dependencies
- Vendor deliverables
- Third-party approvals
- Infrastructure dependencies

## Resource Considerations
- Resource-constrained activities
- Resource leveling requirements
- Multi-resource activities
- Resource availability windows

## Schedule Optimization
- Fast-tracking opportunities
- Crashing analysis
- Resource smoothing
- Alternative sequencing options

## Risk and Contingency
- Schedule risks and buffers
- Contingency activities
- Risk mitigation in sequencing
- Schedule reserve allocation

## Network Diagram Maintenance
- Update procedures and frequency
- Change control process
- Version management
- Stakeholder communication

Make the content specific to the ${projectType} project context and include realistic activities and dependencies for this type of project.
Use proper markdown formatting and include visual network representations using text diagrams.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    if (!content.includes('Schedule Network Diagram')) {
      throw new ExpectedError('Generated content does not appear to be a valid Schedule Network Diagram');
    }

    // Validate that key sections are present
    const requiredSections = ['Critical Path', 'Dependencies', 'Network'];
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        throw new ExpectedError(`Generated content is missing required section: ${section}`);
      }
    }
  }
}
