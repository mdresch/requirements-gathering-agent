import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { RiskComplianceAssessmentTemplate } from './RiskComplianceAssessmentTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Comprehensive Risk and Compliance Assessment Processor
 * 
 * This processor generates integrated risk and compliance assessments that combine:
 * - Risk identification, analysis, and response planning
 * - Compliance gap analysis against multiple standards (PMBOK, BABOK, DMBOK, ISO 15408)
 * - PMBOK-aligned risk management processes
 * - Integrated recommendations and action plans
 * - Executive summary with decision support
 */
export class RiskComplianceAssessmentProcessor implements DocumentProcessor {
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
          content: `You are a Senior Risk Management and Compliance Professional with 25+ years of experience in enterprise risk assessment, regulatory compliance, and project governance across multiple industries including technology, healthcare, finance, and government sectors.

**YOUR MISSION:**
Generate a comprehensive, integrated Risk and Compliance Assessment that combines sophisticated risk analysis with multi-standard compliance evaluation to provide executive leadership with actionable insights for project decision-making.

**CORE COMPETENCIES:**
- **Enterprise Risk Management**: Expert in ISO 31000, COSO ERM, and PMBOK risk management frameworks
- **Multi-Standard Compliance**: Deep knowledge of PMBOK 7.0, BABOK v3, DMBOK 2.0, and ISO 15408 requirements
- **Regulatory Expertise**: Experience with SOX, GDPR, HIPAA, PCI-DSS, and industry-specific regulations
- **Strategic Risk Assessment**: Ability to identify and assess strategic, operational, financial, and reputational risks
- **Compliance Gap Analysis**: Systematic evaluation of current state vs. required compliance standards
- **Executive Communication**: Skilled in translating complex risk and compliance data into executive-ready insights

**ASSESSMENT METHODOLOGY:**
1. **Integrated Risk Identification**: Systematic identification of risks across all project domains (technical, operational, financial, regulatory, strategic)
2. **Multi-Standard Compliance Analysis**: Evaluation against PMBOK, BABOK, DMBOK, and ISO 15408 requirements
3. **Risk-Compliance Correlation**: Analysis of how compliance gaps create or amplify project risks
4. **Quantitative Risk Assessment**: Probability and impact analysis with risk scoring and prioritization
5. **Compliance Maturity Assessment**: Evaluation of current compliance posture and maturity levels
6. **Integrated Response Planning**: Development of combined risk mitigation and compliance remediation strategies
7. **Executive Decision Support**: Clear recommendations with cost-benefit analysis and implementation roadmaps

**RISK ASSESSMENT FRAMEWORK:**
- **Strategic Risks**: Business alignment, competitive positioning, market conditions
- **Operational Risks**: Process failures, resource constraints, performance issues
- **Technical Risks**: Technology failures, integration challenges, security vulnerabilities
- **Financial Risks**: Budget overruns, cost escalation, ROI threats
- **Regulatory Risks**: Compliance violations, regulatory changes, audit findings
- **Reputational Risks**: Stakeholder confidence, brand impact, public perception

**COMPLIANCE EVALUATION STANDARDS:**
- **PMBOK 7.0**: Performance domains, principles, project lifecycle, value delivery
- **BABOK v3**: Knowledge areas, competencies, techniques, business analysis planning
- **DMBOK 2.0**: Data management functions, governance, quality, security
- **ISO 15408**: Security evaluation criteria, assurance levels, protection profiles

**OUTPUT REQUIREMENTS:**
- Replace ALL template placeholders with specific, project-relevant content
- Generate minimum 20-25 comprehensive risks across all categories
- Provide detailed compliance gap analysis for each applicable standard
- Include quantitative risk scores and compliance maturity ratings
- Develop integrated risk-compliance correlation matrix
- Provide executive summary with clear recommendations and decision points
- Include implementation roadmap with timelines, resources, and success metrics
- Ensure professional presentation quality suitable for board-level review
- Maintain full PMBOK 7.0 compliance throughout all risk management processes` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Risk and Compliance Assessment',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Risk and Compliance Assessment processing:', error.message);
        throw new Error(`Failed to generate Risk and Compliance Assessment: ${error.message}`);
      } else {
        console.error('Unexpected error in Risk and Compliance Assessment processing:', error);
        throw new Error('An unexpected error occurred while generating Risk and Compliance Assessment');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as the foundational structure
    const template = new RiskComplianceAssessmentTemplate(context);
    const templateStructure = template.generateContent();

    return `As a Senior Risk Management and Compliance Professional, conduct a comprehensive integrated assessment that combines sophisticated risk analysis with multi-standard compliance evaluation for the following project.

**PROJECT ANALYSIS CONTEXT:**
- **Project Name**: ${context.projectName || 'Untitled Project'}
- **Project Type**: ${context.projectType || 'Not specified'}
- **Project Description**: ${context.description || 'No description provided'}

**COMPREHENSIVE ASSESSMENT REQUIREMENTS:**

**1. INTEGRATED RISK ANALYSIS:**
Conduct systematic risk identification and assessment across all domains:
- **Strategic Risks**: Business alignment, competitive positioning, market dynamics, stakeholder expectations
- **Operational Risks**: Process dependencies, resource constraints, performance requirements, operational integration
- **Technical Risks**: Technology dependencies, integration complexity, security vulnerabilities, performance requirements
- **Financial Risks**: Budget adequacy, cost escalation factors, ROI sustainability, financial controls
- **Regulatory Risks**: Compliance requirements, regulatory changes, audit exposure, legal implications
- **Reputational Risks**: Stakeholder confidence, brand impact, public perception, media exposure

**2. MULTI-STANDARD COMPLIANCE EVALUATION:**
Assess compliance posture against applicable standards:
- **PMBOK 7.0 Compliance**: Performance domains, principles, project lifecycle, value delivery systems
- **BABOK v3 Compliance**: Knowledge areas, competencies, techniques, business analysis processes
- **DMBOK 2.0 Compliance**: Data management functions, governance frameworks, quality standards
- **ISO 15408 Compliance**: Security evaluation criteria, assurance levels, protection profiles (if applicable)

**3. RISK-COMPLIANCE CORRELATION ANALYSIS:**
Analyze how compliance gaps create or amplify project risks:
- Identify compliance deficiencies that introduce operational risks
- Assess regulatory risks from standards non-compliance
- Evaluate reputational risks from governance gaps
- Determine financial risks from compliance remediation costs

**4. QUANTITATIVE ASSESSMENT:**
Provide detailed scoring and prioritization:
- Risk probability and impact assessments (1-5 scale)
- Risk scores and priority rankings
- Compliance maturity ratings (1-5 scale)
- Gap severity assessments
- Cost-benefit analysis for remediation

**5. INTEGRATED RESPONSE STRATEGY:**
Develop comprehensive response plans:
- Combined risk mitigation and compliance remediation strategies
- Resource requirements and timeline estimates
- Success metrics and monitoring procedures
- Escalation procedures and governance oversight

**RISK AND COMPLIANCE ASSESSMENT TEMPLATE TO POPULATE:**

${templateStructure}

**SPECIFIC INSTRUCTIONS FOR THIS PROJECT:**
1. **Comprehensive Coverage**: Generate 20-25 specific risks across all categories with detailed compliance gap analysis
2. **Quantitative Analysis**: Provide realistic probability, impact, and compliance maturity scores based on project context
3. **Integration Focus**: Clearly demonstrate how compliance gaps create or amplify project risks
4. **Actionable Recommendations**: Provide specific, implementable strategies with clear ownership and timelines
5. **Executive Quality**: Ensure output is suitable for board-level review and strategic decision-making
6. **PMBOK Compliance**: Maintain full adherence to PMBOK 7.0 risk management standards throughout

Focus on providing actionable insights that enable informed decision-making while ensuring comprehensive coverage of both risk and compliance dimensions.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Enhanced validation for risk and compliance assessment
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    // Validate risk assessment components
    if (!content.includes('Risk ID') && !content.includes('Risk Score')) {
      throw new ExpectedError('Generated content lacks proper risk assessment structure');
    }

    // Validate compliance assessment components
    if (!content.includes('Compliance') && !content.includes('Standard')) {
      throw new ExpectedError('Generated content lacks proper compliance assessment structure');
    }

    // Ensure no unfilled placeholders
    if (content.includes('[AI_TO_POPULATE]') || content.includes('[PLACEHOLDER]')) {
      throw new ExpectedError('Generated content contains unfilled placeholders - assessment incomplete');
    }

    // Validate minimum content requirements
    if (content.length < 5000) {
      throw new ExpectedError('Generated content is too short for a comprehensive risk and compliance assessment');
    }
  }
}