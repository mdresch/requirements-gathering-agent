import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ProjectcharterTemplate } from '../project-charter/ProjectcharterTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Ultimate Project Charter Processor - The Grand Finale Synthesis Engine
 * 
 * This processor represents the pinnacle of ADPA's document generation capabilities,
 * synthesizing information from all foundational documents to create the authoritative
 * Project Charter that formally authorizes project execution.
 * 
 * Persona: PMO Director and Executive Sponsor with 25+ years of experience
 * Mission: Transform comprehensive project analysis into executive authorization
 */
export class ProjectcharterProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      // Use ContextManager to get enriched context including stakeholders
      const { ContextManager } = await import('../../contextManager.js');
      const contextManager = ContextManager.getInstance();
      
      // Get enriched context that includes stakeholder information
      const enrichedContext = contextManager.buildContextForDocument('project-charter', [
        'business-case',
        'stakeholder-register',
        'stakeholder-analysis',
        'scope-management-plan'
      ]);
      
      console.log(`🔍 Project Charter Processor - Enriched context length: ${enrichedContext ? enrichedContext.length : 0}`);
      console.log(`🔍 Project Charter Processor - Context contains stakeholders: ${enrichedContext ? enrichedContext.includes('PROJECT-STAKEHOLDERS') : false}`);
      
      // Use enriched context if available, otherwise fall back to basic context
      const contextToUse = enrichedContext || JSON.stringify(context);
      
      const prompt = this.createPrompt(context, contextToUse);
      const content = await this.aiProcessor.makeAICall([
        { 
          role: 'system', 
          content: `You are a PMO Director and Executive Sponsor with 25+ years of experience in enterprise project management across Fortune 500 companies. You have successfully authorized and overseen hundreds of strategic initiatives worth millions of dollars in investment.

**YOUR MISSION:**
Create the definitive Project Charter by synthesizing ALL foundational project documents into a comprehensive, executive-ready authorization that formally grants the Project Manager the authority and resources to execute this initiative.

**EXECUTIVE AUTHORITY & RESPONSIBILITIES:**
- **Strategic Alignment**: You ensure every project directly supports organizational objectives and delivers measurable business value
- **Resource Authorization**: You have the authority to commit organizational resources (financial, human, technological) to project success
- **Risk Governance**: You establish risk tolerance levels and escalation procedures for the project
- **Stakeholder Leadership**: You represent the voice of the organization's senior leadership and board of directors
- **Success Accountability**: You are ultimately accountable for project ROI and strategic outcome delivery

**SYNTHESIS METHODOLOGY:**
1. **Strategic Context Integration**: Extract business rationale, objectives, and success criteria from Business Case and Purpose Statement
2. **Stakeholder Authority Mapping**: Leverage Stakeholder Register to identify decision-makers, influence networks, and communication requirements
3. **Scope Boundary Establishment**: Use Scope Statement to define precise deliverable boundaries and success criteria
4. **Risk-Informed Decision Making**: Integrate Risk Register insights to establish contingency planning and risk tolerance levels
5. **Resource and Timeline Authorization**: Synthesize across all documents to authorize realistic budgets, timelines, and resource commitments
6. **Success Metrics Definition**: Establish clear, measurable success criteria that align with organizational KPIs

**CHARTER CREATION STANDARDS:**
- **Executive Voice**: Write with the authority and gravitas of a C-level executive making a formal organizational commitment
- **Strategic Precision**: Every statement must directly tie to business value and organizational objectives
- **Resource Specificity**: Provide concrete resource authorizations with clear boundaries and approval levels
- **Risk Awareness**: Acknowledge key risks while demonstrating confidence in mitigation strategies
- **Measurable Outcomes**: Define success in quantifiable terms that can be tracked and reported to the board
- **Professional Authority**: This document represents formal organizational commitment - it must be impeccable

**DOCUMENT SYNTHESIS REQUIREMENTS:**
- Extract and synthesize key insights from Business Case, Stakeholder Register, Scope Statement, and Risk Register
- Replace ALL template placeholders with specific, contextual information derived from foundational documents
- Ensure complete alignment between charter content and the detailed analysis in supporting documents
- Maintain executive-level language appropriate for board presentation and organizational archives
- Demonstrate comprehensive understanding of project complexity while maintaining strategic clarity

This Project Charter formally authorizes project execution and commits organizational resources. Every word carries the weight of executive decision-making and strategic commitment.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Project Charter',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Project Charter processing:', error.message);
        throw new Error(`Failed to generate Project Charter: ${error.message}`);
      } else {
        console.error('Unexpected error in Project Charter processing:', error);
        throw new Error('An unexpected error occurred while generating Project Charter');
      }
    }
  }

  private createPrompt(context: ProjectContext, enrichedContext?: string): string {
    // Get the template as an example structure
    const template = new ProjectcharterTemplate(context);
    const templateStructure = template.generateContent();

    return `As a PMO Director and Executive Sponsor, create the definitive Project Charter for this initiative by synthesizing information from all foundational project documents.

**PROJECT CONTEXT FOR SYNTHESIS:**
- **Project Name**: ${context.projectName || 'Strategic Initiative'}
- **Project Type**: ${context.projectType || 'Technology Implementation'}
- **Project Description**: ${context.description || 'Strategic project requiring executive authorization'}

**COMPREHENSIVE PROJECT INFORMATION:**
${enrichedContext ? enrichedContext : 'No additional context available'}

**CRITICAL REQUIREMENTS:**

**FOUNDATIONAL DOCUMENTS TO SYNTHESIZE:**
You have access to comprehensive foundational analysis including:

1. **Business Case & Strategic Context**: Strategic rationale, ROI projections, and business value propositions
2. **Stakeholder Register**: Key stakeholders, their influence levels, communication requirements, and engagement strategies  
3. **Scope Statement**: Precise project boundaries, deliverables, acceptance criteria, and constraints
4. **Risk Register**: Comprehensive risk analysis with mitigation strategies and contingency planning
5. **Project Context**: Technical requirements, organizational factors, and implementation considerations

**SYNTHESIS INSTRUCTIONS:**
1. **Extract Strategic Elements**: Pull business objectives, success criteria, and strategic alignment factors from Business Case
2. **Integrate Stakeholder Intelligence**: Use Stakeholder Register to identify project sponsor, key decision-makers, and stakeholder management approach
3. **Define Authorized Scope**: Leverage Scope Statement to establish clear project boundaries and deliverable commitments
4. **Incorporate Risk Awareness**: Reference Risk Register to acknowledge key risks and demonstrate executive awareness of mitigation strategies
5. **Synthesize Resource Requirements**: Combine insights across documents to establish realistic resource, budget, and timeline authorizations

**PROJECT CHARTER TEMPLATE TO POPULATE:**

${templateStructure}

**EXECUTIVE AUTHORIZATION REQUIREMENTS:**
- Write with the voice of a senior executive making a formal organizational commitment
- Ensure every section demonstrates synthesis from foundational documents rather than generic content
- Provide specific, measurable success criteria and resource authorizations
- Acknowledge risks while maintaining executive confidence in project success
- Create a document worthy of board presentation and organizational archives

This Project Charter will formally authorize project execution and represent the organization's commitment to this strategic initiative. Ensure it reflects the comprehensive analysis contained in all supporting documents.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Enhanced validation for Project Charter
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    if (!content.includes('Project Charter') && !content.includes('PROJECT CHARTER')) {
      throw new ExpectedError('Generated content lacks proper Project Charter identification');
    }

    // Validate that synthesis has occurred (no generic placeholders remain)
    if (content.includes('[AI_TO_POPULATE]') || content.includes('[PLACEHOLDER]')) {
      throw new ExpectedError('Generated content contains unfilled placeholders - synthesis incomplete');
    }

    // Validate executive content quality
    if (!content.includes('authorize') && !content.includes('Authority')) {
      throw new ExpectedError('Generated content lacks proper executive authorization language');
    }

    // Validate synthesis quality - should have extracted from foundational docs
    const synthesisIndicators = ['stakeholder', 'scope', 'risk', 'business'];
    const foundIndicators = synthesisIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    );
    
    if (foundIndicators.length < 3) {
      throw new ExpectedError('Generated content lacks proper synthesis from foundational documents');
    }
  }
}
