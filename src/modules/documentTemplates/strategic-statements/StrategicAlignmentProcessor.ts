import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { StrategicAlignmentTemplate } from '../strategic-statements/StrategicAlignmentTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Strategic Alignment document.
 */
export class StrategicAlignmentProcessor implements DocumentProcessor {
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
          content: `You are an expert Strategic Planning Consultant and Portfolio Manager with deep expertise in PMBOK 7th Edition standards. Your core competency is demonstrating clear alignment between projects and organizational strategy.

**YOUR TASK:**
Generate a comprehensive "Strategic Alignment Document" using the provided template based on the given project context.

**PROCESS:**
1. **Strategic Context Analysis:** Analyze all provided information to understand the project's strategic context and potential organizational alignment points.
2. **Alignment Mapping:** Create clear connections between project outcomes and organizational strategic objectives.
3. **Stakeholder Strategic Interests:** Identify how the project serves the strategic interests of key stakeholders.
4. **Strategic Value Proposition:** Articulate the strategic value and contribution of the project.
5. **Risk and Opportunity Assessment:** Evaluate strategic risks and opportunities.
6. **Governance Framework:** Define strategic oversight and review mechanisms.
7. **Professional Tone:** Use executive-level language appropriate for strategic planning documents.

**PMBOK ALIGNMENT:**
- Follow PMBOK 7th Edition principles for project integration management
- Ensure alignment with initiating process group standards
- Include appropriate strategic governance elements
- Focus on value delivery and stakeholder engagement` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Strategic Alignment Document',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Strategic Alignment processing:', error.message);
        throw new Error(`Failed to generate Strategic Alignment Document: ${error.message}`);
      } else {
        console.error('Unexpected error in Strategic Alignment processing:', error);
        throw new Error('An unexpected error occurred while generating Strategic Alignment Document');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new StrategicAlignmentTemplate(context);
    const exampleStructure = template.generateContent();

    // Extract any available context properties safely
    const contextDetails = JSON.stringify(context, null, 2);

    return `Based on the comprehensive project context below, generate a professional Strategic Alignment Document that demonstrates clear alignment with organizational strategy and follows PMBOK 7th Edition standards.

**COMPREHENSIVE PROJECT CONTEXT:**

**Core Project Information:**
- Name: ${context.projectName || 'Untitled Project'}
- Type: ${(context as any).projectType || 'Not specified'}
- Description: ${(context as any).description || 'No description provided'}

**Full Project Context:**
${contextDetails}

**Template Structure to Follow:**

${exampleStructure}

**CRITICAL INSTRUCTIONS:**
- Replace ALL instructional placeholders [brackets] with actual, project-specific content
- Create realistic strategic alignment based on the project context provided
- Demonstrate clear line of sight from project outcomes to strategic objectives
- Include specific strategic KPIs and success metrics where possible
- Address strategic risks and opportunities relevant to the project
- Write for a senior executive and strategic planning audience
- Ensure every section provides genuine strategic insight and value
- Make specific references to the project's actual strategic contribution
- Remove all template instructions and commentary from the final output
- The final document must be ready for strategic review and approval
- Follow PMBOK 7th Edition principles throughout

Generate the complete Strategic Alignment Document now:`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Validate required sections for strategic alignment
    const requiredSections = [
      'Strategic Context',
      'Strategic Goals',
      'Strategic Drivers',
      'Portfolio',
      'Strategic Success Criteria',
      'Strategic Risk'
    ];

    const missingSection = requiredSections.find(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSection) {
      throw new ExpectedError(`Missing required strategic section: ${missingSection}`);
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}