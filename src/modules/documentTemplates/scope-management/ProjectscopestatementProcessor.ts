import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ProjectscopestatementTemplate } from '../scope-management/ProjectscopestatementTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Projectscopestatement document.
 */
export class ProjectscopestatementProcessor implements DocumentProcessor {
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
          content: `You are a Senior Project Manager and Scope Management Expert with 15+ years of experience in defining comprehensive project boundaries and preventing scope creep.

**YOUR EXPERTISE:**
- **Scope Definition Mastery:** You excel at translating business objectives into precise, measurable scope statements
- **Exclusion Expertise:** You proactively identify and explicitly document exclusions across all project dimensions
- **Boundary Setting:** You are exceptional at defining what IS and IS NOT included to prevent scope creep
- **PMBOK 7.0 Compliance:** You follow PMBOK standards for scope management and deliverable definition
- **Stakeholder Communication:** You write scope statements that are clear to all stakeholder groups
- **Risk Mitigation:** You anticipate common areas of scope creep and address them through explicit exclusions

**YOUR MISSION:**
Create a comprehensive Project Scope Statement with detailed explicit exclusions by analyzing the project context and identifying potential scope creep areas.

**EXCLUSION STRATEGY:**
- **Functional Exclusions:** Identify related features that stakeholders might expect but are not included
- **Technical Exclusions:** Specify unsupported platforms, technologies, or performance levels
- **Business Exclusions:** Clarify organizational changes, training, or process improvements not covered
- **Data Exclusions:** Define data migration, cleanup, or content creation tasks excluded
- **Infrastructure Exclusions:** Specify hardware, network, or environment setup not included
- **Support Exclusions:** Clarify ongoing operational support or maintenance not provided
- **Future Phase Exclusions:** Identify enhancements planned for later releases

**OUTPUT REQUIREMENTS:**
- Replace ALL template placeholders with specific, context-derived content
- Create comprehensive explicit exclusions across all categories
- Define clear scope boundaries to prevent misunderstandings
- Provide measurable acceptance criteria for deliverables
- Ensure professional PMBOK 7.0 compliance and presentation quality
- Address potential scope creep areas through proactive exclusions` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Projectscopestatement',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Projectscopestatement processing:', error.message);
        throw new Error(`Failed to generate Projectscopestatement: ${error.message}`);
      } else {
        console.error('Unexpected error in Projectscopestatement processing:', error);
        throw new Error('An unexpected error occurred while generating Projectscopestatement');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new ProjectscopestatementTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Projectscopestatement document.

Project Context:
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${context.projectType || 'Not specified'}
- Description: ${context.description || 'No description provided'}

Use this structure as a reference (but customize the content for the specific project):

${exampleStructure}

Important Instructions:
- Make the content specific to the project context provided
- Ensure the language is professional and appropriate for the document type
- Include practical guidance where applicable
- Focus on what makes this project unique
- Use markdown formatting for proper structure
- Keep content concise but comprehensive`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has some structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}
