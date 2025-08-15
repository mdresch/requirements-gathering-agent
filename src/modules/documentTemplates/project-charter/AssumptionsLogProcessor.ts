import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { AssumptionsLogTemplate } from './AssumptionsLogTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Assumptions Log Processor for Project Charter
 * 
 * This processor creates a comprehensive assumptions log that serves as a critical
 * component of the project charter. It identifies, categorizes, and tracks all
 * project assumptions to support risk management and informed decision-making.
 * 
 * Persona: Senior Project Manager with expertise in risk management and assumption tracking
 * Mission: Create a comprehensive, actionable assumptions log that enhances project success
 */
export class AssumptionsLogProcessor implements DocumentProcessor {
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
          content: `You are a Senior Project Manager with 15+ years of experience in enterprise project management, specializing in risk management and assumption tracking across complex, multi-million dollar initiatives.

**YOUR EXPERTISE:**
- **Assumption Identification**: Expert at identifying both explicit and implicit assumptions from project documentation
- **Risk-Assumption Correlation**: Skilled at understanding how assumptions relate to project risks and uncertainties
- **Stakeholder Analysis**: Experienced in identifying stakeholder-related assumptions and engagement expectations
- **Technical Assessment**: Capable of recognizing technical assumptions and their potential impact on project success
- **Change Management**: Expert in understanding how assumption changes affect project scope, schedule, and budget

**YOUR MISSION:**
Create a comprehensive, actionable Assumptions Log by systematically analyzing ALL foundational project documents to identify, categorize, and establish tracking mechanisms for every critical project assumption.

**ASSUMPTION IDENTIFICATION METHODOLOGY:**
1. **Document Analysis**: Systematically review Business Case, Stakeholder Register, Scope Statement, and Risk Register
2. **Implicit Assumption Detection**: Identify unstated assumptions underlying project plans and decisions
3. **Risk-Assumption Mapping**: Connect assumptions to potential risks if proven false
4. **Impact Assessment**: Evaluate the potential impact of each assumption on project success
5. **Validation Planning**: Establish methods for testing and validating each assumption
6. **Tracking Framework**: Create monitoring mechanisms for assumption validity throughout the project

**SYNTHESIS REQUIREMENTS:**
- **Comprehensive Coverage**: Extract assumptions from ALL available project documents
- **Categorization**: Organize assumptions by type (strategic, technical, resource, stakeholder, environmental)
- **Impact Classification**: Assess and classify the potential impact of each assumption
- **Validation Methods**: Define specific approaches for validating each assumption
- **Tracking Mechanisms**: Establish ongoing monitoring and review processes
- **Integration**: Connect assumptions to related risks, constraints, and dependencies

**QUALITY STANDARDS:**
- Every assumption must be specific, measurable, and actionable
- Each assumption must include validation methods and success criteria
- All assumptions must be categorized by impact and probability
- Tracking mechanisms must be practical and sustainable
- The log must serve as a living document that supports project decision-making

**DOCUMENT INTEGRATION:**
- Synthesize strategic assumptions from Business Case analysis
- Extract stakeholder assumptions from Stakeholder Register insights
- Identify technical assumptions from Scope Statement and requirements
- Connect risk assumptions from Risk Register analysis
- Infer environmental assumptions from project context and constraints

This Assumptions Log will serve as a critical project management tool that enhances risk management, supports informed decision-making, and improves project success probability through proactive assumption management.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Assumptions Log',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Assumptions Log processing:', error.message);
        throw new Error(`Failed to generate Assumptions Log: ${error.message}`);
      } else {
        console.error('Unexpected error in Assumptions Log processing:', error);
        throw new Error('An unexpected error occurred while generating Assumptions Log');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new AssumptionsLogTemplate(context);
    const templateStructure = template.generateContent();

    return `As a Senior Project Manager specializing in assumption tracking and risk management, create a comprehensive Assumptions Log for this project by systematically analyzing all foundational project documents.

**PROJECT CONTEXT FOR ANALYSIS:**
- **Project Name**: ${context.projectName || 'Strategic Initiative'}
- **Project Type**: ${context.projectType || 'Technology Implementation'}
- **Project Description**: ${context.description || 'Strategic project requiring comprehensive assumption management'}

**FOUNDATIONAL DOCUMENTS TO ANALYZE:**
You have access to comprehensive project documentation including:

1. **Business Case**: Strategic rationale, financial projections, ROI assumptions, market analysis, and business value propositions
2. **Stakeholder Register**: Stakeholder identification, influence analysis, engagement strategies, and communication requirements
3. **Scope Statement**: Project boundaries, deliverables, acceptance criteria, constraints, and technical requirements
4. **Risk Register**: Risk identification, probability assessments, impact analysis, and mitigation strategies
5. **Project Context**: Technical specifications, organizational factors, environmental constraints, and implementation considerations

**ASSUMPTION EXTRACTION INSTRUCTIONS:**

### 1. Strategic and Business Assumptions
- Extract business environment assumptions from Business Case
- Identify financial and budget assumptions underlying cost estimates
- Recognize organizational assumptions about change readiness and support
- Document market and competitive assumptions affecting project viability

### 2. Technical and Implementation Assumptions
- Identify technology capability and compatibility assumptions
- Extract performance and quality assumptions from requirements
- Document integration and interface assumptions
- Recognize security and compliance assumptions

### 3. Resource and Capability Assumptions
- Extract human resource availability and skill assumptions
- Identify vendor and third-party capability assumptions
- Document budget and funding continuity assumptions
- Recognize organizational capacity and support assumptions

### 4. Stakeholder and Communication Assumptions
- Extract stakeholder engagement and availability assumptions from Stakeholder Register
- Identify decision-making authority and process assumptions
- Document communication effectiveness and channel assumptions
- Recognize change management and adoption assumptions

### 5. Environmental and External Assumptions
- Identify regulatory and compliance environment assumptions
- Extract market condition and industry trend assumptions
- Document external dependency and supplier assumptions
- Recognize political and economic environment assumptions

### 6. Schedule and Timeline Assumptions
- Extract project duration and milestone assumptions
- Identify resource availability timing assumptions
- Document dependency and sequencing assumptions
- Recognize external factor timing assumptions

### 7. Risk-Related Assumptions
- Connect assumptions to identified risks in Risk Register
- Document risk probability and impact assumptions
- Identify mitigation effectiveness assumptions
- Recognize contingency and response capability assumptions

**ASSUMPTIONS LOG TEMPLATE TO POPULATE:**

${templateStructure}

**SYNTHESIS QUALITY REQUIREMENTS:**
- **Comprehensive Analysis**: Extract assumptions from ALL available project documents
- **Specific Documentation**: Each assumption must be clearly stated and measurable
- **Impact Assessment**: Classify each assumption by potential impact if proven false
- **Validation Planning**: Define specific methods for testing each assumption
- **Tracking Framework**: Establish practical monitoring and review processes
- **Risk Integration**: Connect assumptions to related risks and dependencies
- **Stakeholder Alignment**: Ensure assumptions reflect stakeholder expectations and commitments

**VALIDATION AND TRACKING FOCUS:**
- Prioritize critical assumptions that could significantly impact project success
- Establish realistic validation methods that can be implemented within project constraints
- Create monitoring schedules that align with project governance and review cycles
- Define clear escalation criteria for assumption changes or validation failures
- Ensure the log serves as a practical tool for ongoing project management

This Assumptions Log will serve as a living document that enhances project risk management, supports informed decision-making, and improves the probability of project success through proactive assumption identification and management.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Enhanced validation for Assumptions Log
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    if (!content.includes('Assumptions Log') && !content.includes('ASSUMPTIONS LOG')) {
      throw new ExpectedError('Generated content lacks proper Assumptions Log identification');
    }

    // Validate that synthesis has occurred (no generic placeholders remain)
    if (content.includes('[AI_TO_POPULATE]') || content.includes('[PLACEHOLDER]')) {
      throw new ExpectedError('Generated content contains unfilled placeholders - synthesis incomplete');
    }

    // Validate assumptions log specific content
    const requiredSections = ['assumption', 'validation', 'impact', 'status'];
    const foundSections = requiredSections.filter(section => 
      content.toLowerCase().includes(section)
    );
    
    if (foundSections.length < 3) {
      throw new ExpectedError('Generated content lacks essential assumptions log components');
    }

    // Validate synthesis quality - should have extracted from foundational docs
    const synthesisIndicators = ['business case', 'stakeholder', 'scope', 'risk', 'technical'];
    const foundIndicators = synthesisIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    );
    
    if (foundIndicators.length < 3) {
      throw new ExpectedError('Generated content lacks proper synthesis from foundational documents');
    }

    // Validate tracking and management components
    const managementComponents = ['tracking', 'monitoring', 'validation', 'review'];
    const foundComponents = managementComponents.filter(component => 
      content.toLowerCase().includes(component)
    );
    
    if (foundComponents.length < 2) {
      throw new ExpectedError('Generated content lacks proper assumption management framework');
    }
  }
}