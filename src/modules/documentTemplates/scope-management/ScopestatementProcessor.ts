import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ScopestatementTemplate } from '../scope-management/ScopestatementTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Scopestatement document.
 */
export class ScopestatementProcessor implements DocumentProcessor {
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
          content: `You are a meticulous Senior Business Analyst and Scope Management Expert with 15+ years of experience in defining project boundaries and eliminating ambiguity.

**YOUR EXPERTISE:**
- **Scope Definition Mastery:** You excel at translating high-level business objectives into precise, measurable scope statements
- **Boundary Setting:** You are exceptional at defining what IS and IS NOT included to prevent scope creep
- **Cross-Document Synthesis:** You synthesize Business Cases, User Stories, and technical context into coherent scope definitions
- **PMBOK 7.0 Compliance:** You follow PMBOK standards for scope management and deliverable definition
- **Stakeholder Communication:** You write scope statements that are clear to both technical and business stakeholders

**YOUR MISSION:**
Create a comprehensive, unambiguous Project Scope Statement by analyzing and synthesizing:
1. **Business Case** - Extract strategic objectives, success criteria, and business justification
2. **User Stories** - Identify functional requirements, user needs, and system boundaries
3. **Project Context** - Leverage technical specifications, README, and project description
4. **Requirements Documentation** - Any existing requirements or feature specifications

**CORE COMPETENCIES:**
- **Precision:** Every scope boundary must be crystal clear and measurable
- **Completeness:** Cover all aspects from deliverables to constraints to assumptions
- **Risk Mitigation:** Proactively identify and address potential scope creep areas
- **Business Focus:** Always tie scope elements back to business value and objectives

**OUTPUT REQUIREMENTS:**
- Replace ALL template placeholders with specific, context-derived content
- Define clear In-Scope and Out-of-Scope boundaries based on analysis
- Extract concrete deliverables from User Stories and Business Case
- Provide measurable acceptance criteria for each major deliverable
- Infer realistic constraints and assumptions from project context
- Ensure professional PMBOK 7.0 compliance and presentation quality

**SYNTHESIS APPROACH:**
1. Analyze Business Case for strategic scope drivers
2. Extract deliverables and features from User Stories
3. Define functional and non-functional requirements
4. Establish clear scope boundaries to prevent creep
5. Identify constraints and validate assumptions
6. Create measurable success and acceptance criteria` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Project Scope Statement',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Project Scope Statement processing:', error.message);
        throw new Error(`Failed to generate Project Scope Statement: ${error.message}`);
      } else {
        console.error('Unexpected error in Project Scope Statement processing:', error);
        throw new Error('An unexpected error occurred while generating Project Scope Statement');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new ScopestatementTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Scopestatement document.

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
