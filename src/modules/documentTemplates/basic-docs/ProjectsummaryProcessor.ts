import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ProjectsummaryTemplate } from '../basic-docs/ProjectsummaryTemplate';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Project Summary document.
 */
export class ProjectsummaryProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { 
          role: 'system', 
          content: `You are an expert Project Manager and Business Analyst with extensive experience in creating comprehensive project summaries.

**YOUR TASK:**
Generate a detailed "Project Summary and Goals" document based on the provided project context.

**PROCESS:**
1. **Context Analysis:** Analyze all provided information to understand the project's purpose, scope, and objectives.
2. **Goal Identification:** Extract and articulate clear, measurable project goals and success criteria.
3. **Stakeholder Mapping:** Identify key stakeholders and their interests in the project.
4. **Value Proposition:** Clearly define the business value and expected outcomes.
5. **Executive Summary:** Create a concise overview suitable for executive consumption.

The output must be professional, clear, and actionable for project stakeholders.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Project Summary and Goals',
        content
      };
    } catch (error) {
      console.error('Error in ProjectsummaryProcessor:', error);
      
      if (error instanceof ExpectedError) {
        throw error;
      }

      const template = new ProjectsummaryTemplate();
      const fallbackContent = template.generate(context);
      
      return {
        title: 'Project Summary and Goals',
        content: fallbackContent
      };
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the provided project context, create a comprehensive project summary document that includes:

## Project Summary and Goals

### Executive Summary
- Project overview and purpose
- Key objectives and expected outcomes
- Business value proposition

### Project Goals and Objectives
- Primary project goals
- Specific, measurable objectives
- Success criteria and KPIs

### Scope Overview
- Project scope boundaries
- Key deliverables
- Major milestones

### Stakeholder Overview
- Primary stakeholders
- Stakeholder interests and expectations
- Communication requirements

### Business Value
- Expected business benefits
- Return on investment
- Strategic alignment

### Timeline and Resources
- High-level timeline
- Resource requirements
- Budget considerations

### Risk Summary
- Key project risks
- Mitigation strategies
- Contingency planning

Context: ${JSON.stringify(context, null, 2)}

Please provide a comprehensive project summary document in markdown format.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    if (content === this.createPrompt({} as ProjectContext)) {
      throw new ExpectedError('AI returned the prompt instead of generating content');
    }

    const requiredSections = [
      'Project Summary',
      'Executive Summary',
      'Goals',
      'Objectives',
      'Scope',
      'Stakeholder',
      'Business Value'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      console.warn(`Project Summary document may be missing sections: ${missingSections.join(', ')}`);
    }
  }
}
