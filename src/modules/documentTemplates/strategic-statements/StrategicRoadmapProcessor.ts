import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { StrategicRoadmapTemplate } from '../strategic-statements/StrategicRoadmapTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Strategic Roadmap document.
 */
export class StrategicRoadmapProcessor implements DocumentProcessor {
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
          content: `You are an expert Strategic Planning Consultant and Program Manager with deep expertise in PMBOK 7th Edition schedule management and strategic planning standards. Your core competency is creating comprehensive strategic roadmaps that provide clear direction, realistic timelines, and strategic value delivery.

**YOUR TASK:**
Generate a comprehensive "Strategic Roadmap Document" using the provided template based on the given project context.

**PROCESS:**
1. **Strategic Vision Development:** Articulate a clear strategic vision and destination for the roadmap.
2. **Phase Planning:** Develop logical, strategic phases that build upon each other toward the strategic objectives.
3. **Timeline Development:** Create realistic timelines with appropriate phase durations and dependencies.
4. **Milestone Definition:** Identify major strategic milestones that mark significant progress.
5. **Value Delivery Mapping:** Show when and how strategic value will be delivered throughout the roadmap.
6. **Resource Planning:** Outline resource and investment requirements across phases.
7. **Risk Assessment:** Identify risks to the roadmap and develop contingency plans.
8. **Stakeholder Engagement:** Map stakeholder involvement throughout the strategic journey.
9. **Governance Framework:** Define decision points and governance mechanisms.

**PMBOK ALIGNMENT:**
- Follow PMBOK 7th Edition principles for schedule management and integration management
- Ensure alignment with planning process group standards
- Include appropriate risk management and stakeholder engagement elements
- Focus on value delivery and strategic outcomes` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Strategic Roadmap',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Strategic Roadmap processing:', error.message);
        throw new Error(`Failed to generate Strategic Roadmap: ${error.message}`);
      } else {
        console.error('Unexpected error in Strategic Roadmap processing:', error);
        throw new Error('An unexpected error occurred while generating Strategic Roadmap');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new StrategicRoadmapTemplate(context);
    const exampleStructure = template.generateContent();

    // Extract any available context properties safely
    const contextDetails = JSON.stringify(context, null, 2);

    return `Based on the comprehensive project context below, generate a professional Strategic Roadmap document that provides clear strategic direction, realistic timelines, and follows PMBOK 7th Edition schedule management standards.

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
- Develop a clear strategic vision and destination that the roadmap will achieve
- Create logical, strategic phases that build upon each other with realistic timelines
- Define major strategic milestones with specific success criteria and target dates
- Map value delivery throughout the roadmap showing when benefits will be realized
- Include comprehensive resource and investment planning across phases
- Address potential risks to the roadmap with specific mitigation and contingency strategies
- Map stakeholder engagement requirements throughout the strategic journey
- Define clear governance and decision points that could affect the roadmap
- Write for a senior executive and strategic planning audience
- Ensure every phase and milestone provides genuine strategic value and progress
- Make specific references to the project's actual strategic timeline and milestones
- Remove all template instructions and commentary from the final output
- The final document must be ready for executive approval and strategic implementation
- Follow PMBOK 7th Edition schedule management and integration principles throughout

Generate the complete Strategic Roadmap document now:`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Validate required sections for strategic roadmap
    const requiredSections = [
      'Strategic Vision',
      'Roadmap Overview',
      'Phase Planning',
      'Strategic Milestones',
      'Value Delivery Timeline',
      'Resource'
    ];

    const missingSection = requiredSections.find(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSection) {
      throw new ExpectedError(`Missing required roadmap section: ${missingSection}`);
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}