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
 * Processor for the UI/UX Considerations document.
 */
export class UIUXConsiderationsProcessor implements DocumentProcessor {
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
          content: `You are an expert UI/UX Designer and User Experience Strategist with extensive experience in creating user-centered design strategies and interface guidelines, specifically trained in PMBOK 7.0 performance domains and project management best practices.

Your task is to analyze the project requirements and provide comprehensive UI/UX considerations that will guide the design and development of an exceptional user experience while ensuring alignment with project management standards and successful project delivery.

Generate a detailed UI/UX Considerations document that includes:

1. **Strategic UX Planning** (PMBOK Planning Performance Domain)
   - UI/UX project roadmap and milestone planning
   - Resource allocation for design activities
   - Timeline considerations for user research and testing
   - Integration with overall project schedule
   - Risk identification and mitigation for UX deliverables

2. **User-Centered Design Process** (PMBOK Stakeholder Performance Domain)
   - Comprehensive user research methodology
   - Stakeholder mapping and engagement strategy
   - User persona development and validation process
   - User journey mapping and experience flow analysis
   - Stakeholder feedback integration workflows

3. **Design Standards and Guidelines** (PMBOK Project Work Performance Domain)
   - Visual design principles and brand alignment
   - Component library and design system development
   - Accessibility compliance (WCAG 2.1 AA, Section 508)
   - Responsive design and cross-platform considerations
   - Information architecture and navigation standards

4. **Implementation and Delivery Strategy** (PMBOK Delivery Performance Domain)
   - Design-to-development handoff processes
   - Quality assurance for UI/UX deliverables
   - User acceptance criteria and testing protocols
   - Performance metrics and success measurement
   - Post-launch optimization and iteration planning

5. **Risk Management and Quality Assurance**
   - UX-specific risk assessment and mitigation
   - Quality gates for design deliverables
   - User testing and validation checkpoints
   - Change management for design iterations
   - Continuous improvement processes

6. **Project Integration Considerations**
   - Cross-functional team collaboration
   - Communication protocols for design decisions
   - Documentation and knowledge management
   - Training and adoption strategies
   - Maintenance and long-term support planning

Ensure all recommendations are actionable, measurable, aligned with PMBOK 7.0 performance domains, and contribute to successful project delivery while maintaining exceptional user experience standards.`
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ]).then(res => typeof res === 'string' ? res : res.content);

      if (!content || content.trim().length === 0) {
        throw new ExpectedError('No content generated for UI/UX Considerations document');
      }

      return {
        title: 'UI/UX Considerations',
        content: content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw error;
      }
      console.error('Error in UIUXConsiderationsProcessor:', error);
      throw new Error(`Failed to generate UI/UX Considerations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    const { projectName, projectType, description } = context;
    
    return `Create a comprehensive UI/UX Considerations document for the following project that aligns with PMBOK 7.0 performance domains and project management best practices:

**Project Name:** ${projectName}
**Project Type:** ${projectType || 'Not specified'}
**Description:** ${description || 'No description provided'}

## PMBOK 7.0 Performance Domain Alignment

Your UI/UX analysis should align with the following PMBOK performance domains:

### Stakeholder Performance Domain
- User research and stakeholder analysis for UI/UX
- User persona development and validation
- Stakeholder engagement through design processes
- User feedback collection and management strategies

### Planning Performance Domain
- UI/UX project planning and timeline considerations
- Resource planning for design and development
- Risk assessment for user experience delivery
- Quality planning for user interface standards

### Project Work Performance Domain
- UI/UX implementation workflows and processes
- Design system development and maintenance
- Cross-functional collaboration between UX and development teams
- Change management for design iterations

### Delivery Performance Domain
- User acceptance criteria for UI/UX deliverables
- Performance metrics and success criteria
- User training and adoption strategies
- Post-launch user experience optimization

## Comprehensive UI/UX Analysis Required

Please provide detailed analysis covering:

1. **Strategic UX Planning** (aligned with Planning Performance Domain)
2. **User-Centered Design Process** (aligned with Stakeholder Performance Domain)
3. **Implementation Strategy** (aligned with Project Work Performance Domain)
4. **Delivery and Success Metrics** (aligned with Delivery Performance Domain)
5. **Risk Management for UX** (cross-domain considerations)
6. **Quality Assurance for UI/UX** (cross-domain considerations)

Ensure all recommendations are actionable, measurable, and aligned with project management best practices for successful project delivery.`;
  }
}
