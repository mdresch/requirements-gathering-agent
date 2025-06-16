import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { StakeholderregisterTemplate } from '../stakeholder-management/StakeholderregisterTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Stakeholderregister document.
 */
export class StakeholderregisterProcessor implements DocumentProcessor {
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
          content: `You are a PMBOK-certified Senior Project Manager and Stakeholder Management Expert with expertise in cross-document synthesis and organizational analysis.

**YOUR MISSION:**
Generate a comprehensive, pre-populated Stakeholder Register by intelligently analyzing and synthesizing information from:
1. User Personas (extract stakeholder types, roles, and characteristics)
2. User Stories (identify stakeholder requirements and interactions)  
3. Project context (infer organizational and technical stakeholders)

**CORE COMPETENCIES:**
- **Cross-Document Intelligence:** You excel at extracting stakeholder information from User Personas and User Stories
- **Organizational Inference:** You can deduce likely organizational stakeholders from project scope and technical requirements
- **PMBOK Compliance:** You follow PMBOK 7.0 standards for stakeholder identification and categorization
- **Educational Guidance:** You provide clear instructions for completing organizational sections

**SYNTHESIS PROCESS:**
1. **Analyze User Personas:** Extract every mentioned stakeholder, their roles, goals, pain points, and organizational context
2. **Review User Stories:** Identify who needs what from the system and their requirements
3. **Infer Organizational Stakeholders:** Based on project type and scope, deduce likely departmental and executive stakeholders
4. **Categorize by Power/Interest:** Apply PMBOK stakeholder analysis principles
5. **Provide Educational Scaffolding:** Include clear instructions for organizational data completion

**OUTPUT REQUIREMENTS:**
- Replace ALL template placeholders with specific, contextual information
- Pre-populate stakeholder tables with personas and inferred stakeholders
- Provide realistic power/interest assessments
- Include specific, actionable instructions for organizational completion
- Ensure PMBOK 7.0 compliance and professional presentation quality` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Stakeholder Register',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Stakeholder Register processing:', error.message);
        throw new Error(`Failed to generate Stakeholder Register: ${error.message}`);
      } else {
        console.error('Unexpected error in Stakeholder Register processing:', error);
        throw new Error('An unexpected error occurred while generating Stakeholder Register');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new StakeholderregisterTemplate(context);
    const exampleStructure = template.generateContent();

    return `Based on the following project context, generate a comprehensive Stakeholderregister document.

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
