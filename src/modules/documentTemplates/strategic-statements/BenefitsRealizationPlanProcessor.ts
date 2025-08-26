import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { BenefitsRealizationPlanTemplate } from '../strategic-statements/BenefitsRealizationPlanTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Benefits Realization Plan document.
 */
export class BenefitsRealizationPlanProcessor implements DocumentProcessor {
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
          content: `You are an expert Benefits Management Consultant and Financial Analyst with deep expertise in PMBOK 7th Edition benefits management standards. Your core competency is creating comprehensive benefits realization plans that ensure maximum value delivery from projects.

**YOUR TASK:**
Generate a comprehensive "Benefits Realization Plan" using the provided template based on the given project context.

**PROCESS:**
1. **Benefits Identification:** Analyze the project context to identify all potential benefits (financial, operational, strategic, risk-related).
2. **Benefits Quantification:** Where possible, provide realistic quantitative estimates for benefits based on the project context.
3. **Measurement Framework:** Create specific, measurable KPIs and tracking mechanisms for each benefit.
4. **Timeline Development:** Establish realistic timelines for when benefits will be realized.
5. **Stakeholder Mapping:** Map benefits to specific stakeholder groups and their interests.
6. **Risk Assessment:** Identify risks to benefit realization and mitigation strategies.
7. **Financial Analysis:** Provide cost-benefit analysis including ROI, NPV, and payback period where possible.
8. **Governance Structure:** Define roles, responsibilities, and processes for managing benefit realization.

**PMBOK ALIGNMENT:**
- Follow PMBOK 7th Edition principles for benefits management
- Ensure alignment with value delivery principles
- Include appropriate measurement and monitoring frameworks
- Focus on stakeholder value and organizational benefits` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Benefits Realization Plan',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Benefits Realization Plan processing:', error.message);
        throw new Error(`Failed to generate Benefits Realization Plan: ${error.message}`);
      } else {
        console.error('Unexpected error in Benefits Realization Plan processing:', error);
        throw new Error('An unexpected error occurred while generating Benefits Realization Plan');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new BenefitsRealizationPlanTemplate(context);
    const exampleStructure = template.generateContent();

    // Extract any available context properties safely
    const contextDetails = JSON.stringify(context, null, 2);

    return `Based on the comprehensive project context below, generate a professional Benefits Realization Plan that ensures maximum value delivery and follows PMBOK 7th Edition benefits management standards.

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
- Identify and quantify realistic benefits based on the project context provided
- Create specific, measurable KPIs for tracking benefit realization
- Develop realistic timelines for when benefits will be achieved
- Include comprehensive stakeholder benefit mapping
- Provide detailed financial analysis including ROI calculations where possible
- Address risks to benefit realization with specific mitigation strategies
- Write for a senior executive and financial management audience
- Ensure every section provides genuine value and actionable insights
- Make specific references to the project's actual expected benefits
- Remove all template instructions and commentary from the final output
- The final document must be ready for executive review and approval
- Follow PMBOK 7th Edition benefits management principles throughout

Generate the complete Benefits Realization Plan now:`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Validate required sections for benefits realization plan
    const requiredSections = [
      'Benefits Overview',
      'Benefits Analysis',
      'Measurement Framework',
      'Benefits Timeline',
      'Stakeholder Benefits',
      'Financial Analysis'
    ];

    const missingSection = requiredSections.find(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSection) {
      throw new ExpectedError(`Missing required benefits section: ${missingSection}`);
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}