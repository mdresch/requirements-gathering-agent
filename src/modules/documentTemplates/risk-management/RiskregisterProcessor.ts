import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { RiskregisterTemplate } from '../risk-management/RiskregisterTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Enhanced Risk Register Processor with Senior Risk Management Professional persona
 * 
 * This processor leverages sophisticated risk management expertise to generate
 * comprehensive, PMBOK-compliant risk registers with intelligent risk identification
 * and assessment based on multi-document synthesis.
 */
export class RiskregisterProcessor implements DocumentProcessor {
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
          content: `You are a Senior Risk Management Professional and Certified PMP with 20+ years of experience in enterprise project risk management across technology, healthcare, finance, and government sectors.

**YOUR MISSION:**
Generate a comprehensive, PMBOK-compliant Risk Register by intelligently synthesizing information from all available project documents and applying advanced risk identification methodologies to uncover technical, operational, financial, and strategic risks.

**CORE COMPETENCIES:**
- **Risk Identification Excellence**: You excel at uncovering hidden risks by analyzing project context, dependencies, and constraints
- **Multi-Domain Risk Assessment**: You assess risks across technical, operational, financial, organizational, and external domains
- **Quantitative Risk Analysis**: You provide realistic probability/impact assessments based on project characteristics and industry patterns
- **Strategic Risk Response**: You develop concrete, actionable mitigation strategies that address root causes
- **PMBOK 7.0 Mastery**: You ensure full compliance with PMBOK risk management standards and best practices
- **Cross-Document Intelligence**: You synthesize insights from Business Case, Scope Statement, Stakeholder Register, and project context

**RISK IDENTIFICATION PROCESS:**
1. **Context Analysis**: Extract risk indicators from project type, technology stack, organizational complexity, and strategic objectives
2. **Stakeholder Risk Mapping**: Identify risks related to stakeholder dynamics, communication gaps, and expectation misalignment
3. **Technical Risk Assessment**: Analyze technology dependencies, integration points, performance requirements, and security concerns
4. **Operational Risk Evaluation**: Assess resource constraints, skill gaps, process dependencies, and timeline pressures
5. **External Risk Scanning**: Consider market conditions, regulatory requirements, vendor dependencies, and environmental factors
6. **Financial Risk Analysis**: Evaluate budget adequacy, cost escalation potential, and ROI threats
7. **Strategic Risk Review**: Identify risks to business objectives, competitive positioning, and long-term value

**RISK ASSESSMENT METHODOLOGY:**
- **Probability Assessment**: Use industry benchmarks, historical data, and project-specific factors to assign realistic probabilities (1-5 scale)
- **Impact Analysis**: Assess effects on scope, schedule, cost, quality, and strategic objectives using standardized impact criteria
- **Risk Scoring**: Calculate comprehensive risk scores (Probability × Impact) with proper categorization
- **Response Strategy Selection**: Choose optimal response strategies (Avoid, Mitigate, Transfer, Accept) based on risk characteristics

**OUTPUT REQUIREMENTS:**
- Replace ALL template placeholders and [AI_TO_POPULATE] sections with specific, project-relevant content
- Generate minimum 15-20 comprehensive risks across all categories (Technical, Operational, Financial, Organizational, External)
- Provide realistic probability/impact assessments based on project analysis
- Include concrete, actionable mitigation strategies with specific steps and ownership
- Populate risk response tables with detailed contingency plans
- Define project-specific Key Risk Indicators (KRIs) and monitoring procedures
- Ensure professional presentation quality suitable for executive stakeholder review
- Maintain PMBOK 7.0 compliance throughout all risk management processes` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Risk Register',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Risk Register processing:', error.message);
        throw new Error(`Failed to generate Risk Register: ${error.message}`);
      } else {
        console.error('Unexpected error in Risk Register processing:', error);
        throw new Error('An unexpected error occurred while generating Risk Register');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as the foundational structure
    const template = new RiskregisterTemplate(context);
    const templateStructure = template.generateContent();

    return `As a Senior Risk Management Professional, analyze the following project context and generate a comprehensive Risk Register that identifies, assesses, and provides response strategies for all significant project risks.

**PROJECT ANALYSIS CONTEXT:**
- **Project Name**: ${context.projectName || 'Untitled Project'}
- **Project Type**: ${context.projectType || 'Not specified'}
- **Project Description**: ${context.description || 'No description provided'}

**ADDITIONAL CONTEXT FOR RISK SYNTHESIS:**
Please analyze the following areas for comprehensive risk identification:

**Technical Context**: Look for technology dependencies, integration challenges, performance requirements, security concerns, and technical complexity indicators within the project context.

**Operational Context**: Assess resource requirements, skill dependencies, process complexity, timeline constraints, and operational integration challenges.

**Strategic Context**: Evaluate business objectives, stakeholder expectations, competitive factors, and strategic alignment risks.

**Financial Context**: Consider budget constraints, cost escalation factors, ROI requirements, and financial sustainability risks.

**Organizational Context**: Analyze change management requirements, stakeholder dynamics, governance complexity, and organizational capacity constraints.

**External Context**: Review market conditions, regulatory requirements, vendor dependencies, and environmental factors that could impact project success.

**RISK REGISTER TEMPLATE TO POPULATE:**

${templateStructure}

**SPECIFIC INSTRUCTIONS FOR THIS PROJECT:**
1. **Comprehensive Risk Identification**: Generate 15-20 specific risks across all categories, ensuring coverage of technical, operational, financial, organizational, and external domains
2. **Contextual Risk Assessment**: Base probability and impact assessments on the specific project type, complexity, and organizational context provided
3. **Actionable Mitigation Strategies**: Provide concrete, step-by-step mitigation strategies that can be immediately implemented
4. **Professional Quality**: Ensure the output is suitable for executive review and stakeholder communication
5. **PMBOK Compliance**: Maintain full adherence to PMBOK 7.0 risk management standards and terminology

Focus on identifying risks that are most relevant to this specific project context while ensuring comprehensive coverage across all risk domains.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Enhanced validation for risk register
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    if (!content.includes('Risk ID') || !content.includes('Risk Score')) {
      throw new ExpectedError('Generated content lacks proper risk register table structure');
    }

    if (content.includes('[AI_TO_POPULATE]')) {
      throw new ExpectedError('Generated content contains unfilled placeholders - risk identification incomplete');
    }
  }
}
