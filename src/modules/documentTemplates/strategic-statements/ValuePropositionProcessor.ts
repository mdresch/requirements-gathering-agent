import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ValuePropositionTemplate } from '../strategic-statements/ValuePropositionTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Value Proposition document.
 */
export class ValuePropositionProcessor implements DocumentProcessor {
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
          content: `You are an expert Business Strategy Consultant and Value Engineering Specialist with deep expertise in creating compelling value propositions. Your core competency is articulating clear, quantifiable value that resonates with stakeholders and drives decision-making.

**YOUR TASK:**
Generate a comprehensive "Value Proposition Document" using the provided template based on the given project context.

**PROCESS:**
1. **Problem Analysis:** Clearly identify and quantify the problems or opportunities the project addresses.
2. **Solution Articulation:** Describe the solution in business terms that stakeholders can understand and relate to.
3. **Value Quantification:** Provide specific, measurable value estimates across financial, operational, strategic, and risk dimensions.
4. **Stakeholder Mapping:** Map specific value propositions to different stakeholder groups and their interests.
5. **Competitive Analysis:** Compare the solution against alternatives and articulate competitive advantages.
6. **Investment Justification:** Create a compelling investment case with clear value-to-investment ratios.
7. **Risk Assessment:** Address potential risks to value delivery and mitigation strategies.
8. **Compelling Narrative:** Create a persuasive narrative that motivates stakeholders to support the project.

**VALUE FOCUS:**
- Emphasize tangible, measurable benefits
- Include both quantitative and qualitative value
- Address short-term and long-term value delivery
- Consider all stakeholder perspectives
- Provide realistic but compelling value estimates` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Value Proposition Document',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Value Proposition processing:', error.message);
        throw new Error(`Failed to generate Value Proposition Document: ${error.message}`);
      } else {
        console.error('Unexpected error in Value Proposition processing:', error);
        throw new Error('An unexpected error occurred while generating Value Proposition Document');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new ValuePropositionTemplate(context);
    const exampleStructure = template.generateContent();

    // Extract any available context properties safely
    const contextDetails = JSON.stringify(context, null, 2);

    return `Based on the comprehensive project context below, generate a compelling Value Proposition Document that clearly articulates the unique value and competitive advantage this project will deliver.

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
- Create a compelling, memorable value proposition statement that can be communicated in 30 seconds
- Identify and quantify specific problems the project solves with realistic estimates
- Provide detailed value quantification across financial, operational, strategic, and risk dimensions
- Map specific value propositions to different stakeholder groups
- Include competitive analysis showing why this solution is superior to alternatives
- Calculate realistic value-to-investment ratios and ROI projections
- Address potential risks to value delivery with specific mitigation strategies
- Write in a persuasive, business-focused tone that motivates stakeholder support
- Ensure every section provides genuine value insights and compelling arguments
- Make specific references to the project's actual value delivery capabilities
- Remove all template instructions and commentary from the final output
- The final document must be ready for stakeholder presentation and decision-making

Generate the complete Value Proposition Document now:`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Validate required sections for value proposition
    const requiredSections = [
      'Value Proposition Statement',
      'Problem Statement',
      'Solution Overview',
      'Value Delivery',
      'Stakeholder Value',
      'Investment'
    ];

    const missingSection = requiredSections.find(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSection) {
      throw new ExpectedError(`Missing required value section: ${missingSection}`);
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}