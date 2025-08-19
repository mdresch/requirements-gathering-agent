import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { StrategicSuccessMetricsTemplate } from '../strategic-statements/StrategicSuccessMetricsTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Strategic Success Metrics document.
 */
export class StrategicSuccessMetricsProcessor implements DocumentProcessor {
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
          content: `You are an expert Performance Management Consultant and Strategic Analytics Specialist with deep expertise in PMBOK 7th Edition performance management standards. Your core competency is creating comprehensive success measurement frameworks that ensure strategic objectives are achieved and measured effectively.

**YOUR TASK:**
Generate a comprehensive "Strategic Success Metrics Document" using the provided template based on the given project context.

**PROCESS:**
1. **Success Definition:** Clearly define what strategic success means for this specific project beyond just delivery.
2. **KPI Development:** Create specific, measurable, achievable, relevant, and time-bound (SMART) KPIs that align with strategic objectives.
3. **Metrics Categorization:** Organize metrics across financial, operational, strategic positioning, and stakeholder dimensions.
4. **Measurement Framework:** Establish comprehensive data collection, analysis, and reporting frameworks.
5. **Timeline Development:** Create realistic timelines for when different success metrics will be achieved and measured.
6. **Governance Structure:** Define roles, responsibilities, and processes for managing success measurement.
7. **Risk Assessment:** Identify risks to success achievement and mitigation strategies.
8. **Continuous Improvement:** Build in mechanisms for optimizing and evolving the success framework.

**PMBOK ALIGNMENT:**
- Follow PMBOK 7th Edition principles for performance management
- Ensure alignment with value delivery and stakeholder engagement principles
- Include appropriate monitoring and controlling processes
- Focus on outcomes and benefits rather than just outputs` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Strategic Success Metrics',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Strategic Success Metrics processing:', error.message);
        throw new Error(`Failed to generate Strategic Success Metrics: ${error.message}`);
      } else {
        console.error('Unexpected error in Strategic Success Metrics processing:', error);
        throw new Error('An unexpected error occurred while generating Strategic Success Metrics');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new StrategicSuccessMetricsTemplate(context);
    const exampleStructure = template.generateContent();

    // Extract any available context properties safely
    const contextDetails = JSON.stringify(context, null, 2);

    return `Based on the comprehensive project context below, generate a professional Strategic Success Metrics document that establishes clear, measurable criteria for strategic success and follows PMBOK 7th Edition performance management standards.

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
- Define clear, specific success criteria that go beyond project delivery to include business outcomes
- Create SMART KPIs (Specific, Measurable, Achievable, Relevant, Time-bound) for each success dimension
- Provide realistic baseline values, targets, and stretch goals based on the project context
- Establish comprehensive measurement methods and data collection approaches
- Include detailed governance structure with clear roles and responsibilities
- Address potential risks to success achievement with specific mitigation strategies
- Write for a senior executive and performance management audience
- Ensure every metric provides genuine strategic insight and accountability
- Make specific references to the project's actual success criteria and measurement capabilities
- Remove all template instructions and commentary from the final output
- The final document must be ready for executive approval and implementation
- Follow PMBOK 7th Edition performance management principles throughout

Generate the complete Strategic Success Metrics document now:`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Validate required sections for strategic success metrics
    const requiredSections = [
      'Success Framework',
      'Strategic KPIs',
      'Success Metrics',
      'Measurement Timeline',
      'Measurement Framework',
      'Success Governance'
    ];

    const missingSection = requiredSections.find(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSection) {
      throw new ExpectedError(`Missing required success section: ${missingSection}`);
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}