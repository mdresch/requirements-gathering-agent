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
 * Stakeholder Needs Analysis Processor
 * 
 * Specialized processor for analyzing stakeholder and sponsor needs to ensure
 * the Requirements Gathering Agent provides clear project charters and engagement plans.
 * 
 * This processor focuses on:
 * - Identifying specific stakeholder requirements for project authorization
 * - Analyzing sponsor expectations for project charters
 * - Determining engagement plan requirements for different stakeholder groups
 * - Providing actionable insights for improving charter and engagement plan clarity
 */
export class StakeholderNeedsAnalysisProcessor implements DocumentProcessor {
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
          content: `You are a Senior Business Analyst and Stakeholder Management Expert specializing in requirements analysis for project authorization and stakeholder engagement.

**YOUR MISSION:**
Analyze stakeholder and sponsor needs to ensure the Requirements Gathering Agent can provide clear, actionable project charters and engagement plans that meet all stakeholder expectations.

**CORE EXPERTISE:**
- **Stakeholder Requirements Analysis:** Deep understanding of what different stakeholder types need from project documentation
- **Charter Clarity Assessment:** Expertise in identifying what makes project charters clear and actionable for sponsors
- **Engagement Planning:** Knowledge of effective stakeholder engagement strategies and communication requirements
- **Requirements Gathering:** Ability to extract and synthesize stakeholder needs from project context

**ANALYSIS FRAMEWORK:**
1. **Sponsor Authorization Needs:** What sponsors require to authorize projects confidently
2. **Stakeholder Information Needs:** What different stakeholder groups need to engage effectively
3. **Charter Clarity Requirements:** Elements that make project charters clear and actionable
4. **Engagement Plan Effectiveness:** Factors that ensure engagement plans drive successful stakeholder participation
5. **Communication Requirements:** Specific communication needs by stakeholder type and project phase

**OUTPUT REQUIREMENTS:**
- Provide specific, actionable insights for improving charter and engagement plan quality
- Identify gaps in current stakeholder analysis approaches
- Recommend enhancements to stakeholder engagement strategies
- Ensure recommendations are practical and implementable within the Requirements Gathering Agent framework` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Stakeholder Needs Analysis',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Stakeholder Needs Analysis processing:', error.message);
        throw new Error(`Failed to generate Stakeholder Needs Analysis: ${error.message}`);
      } else {
        console.error('Unexpected error in Stakeholder Needs Analysis processing:', error);
        throw new Error('An unexpected error occurred while generating Stakeholder Needs Analysis');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Requirements Gathering Agent Project';
    const projectDescription = context.description || 'AI-powered requirements gathering and document generation system';
    
    return `Analyze the stakeholder and sponsor needs for the following project to ensure clear project charters and effective engagement plans.

**PROJECT CONTEXT:**
- **Project Name:** ${projectName}
- **Project Type:** ${context.projectType || 'Technology Implementation'}
- **Description:** ${projectDescription}

**ANALYSIS OBJECTIVES:**
As a Senior Business Analyst, conduct a comprehensive analysis of stakeholder and sponsor needs to ensure the Requirements Gathering Agent can provide:
1. Clear, actionable project charters that enable confident sponsor authorization
2. Effective engagement plans that drive successful stakeholder participation
3. Targeted communication strategies that meet diverse stakeholder information needs

# Stakeholder Needs Analysis

## Executive Summary

**Purpose:** Analyze stakeholder and sponsor needs to enhance the Requirements Gathering Agent's ability to produce clear project charters and effective engagement plans.

**Key Findings:** [Summarize the most critical insights about stakeholder needs and requirements]

**Recommendations:** [High-level recommendations for improving charter clarity and engagement effectiveness]

---

## 1. Sponsor Authorization Needs Analysis

### Executive Sponsor Requirements
**What Sponsors Need to Authorize Projects Confidently:**

#### Strategic Alignment Requirements
- **Business Case Clarity:** [Analyze what sponsors need to see in business justification]
- **ROI Visibility:** [Define ROI presentation requirements for sponsor confidence]
- **Strategic Fit Assessment:** [Identify how sponsors evaluate strategic alignment]

#### Risk and Resource Assessment
- **Risk Transparency:** [Analyze sponsor needs for risk visibility and mitigation confidence]
- **Resource Authorization Clarity:** [Define what sponsors need to commit resources confidently]
- **Success Metrics Definition:** [Identify sponsor requirements for measurable success criteria]

#### Decision-Making Support
- **Information Sufficiency:** [Analyze information depth and breadth sponsors require]
- **Timeline Confidence:** [Define what sponsors need to believe in project timelines]
- **Stakeholder Buy-in Evidence:** [Identify how sponsors assess stakeholder support]

### Charter Clarity Requirements
**Elements That Enable Confident Sponsor Authorization:**

#### Essential Charter Components
1. **Strategic Context:** [Define how strategic context should be presented]
2. **Resource Commitments:** [Specify resource authorization clarity requirements]
3. **Success Criteria:** [Define measurable success criteria presentation]
4. **Risk Acknowledgment:** [Specify risk presentation for sponsor confidence]
5. **Stakeholder Alignment:** [Define stakeholder support evidence requirements]

#### Charter Quality Indicators
- **Clarity Metrics:** [Define what makes a charter clear and actionable]
- **Completeness Criteria:** [Identify essential information for authorization]
- **Confidence Factors:** [Analyze what builds sponsor confidence in project success]

---

## 2. Stakeholder Information Needs Assessment

### Stakeholder Categories and Information Requirements

#### High-Power, High-Interest Stakeholders
**Executive Stakeholders:**
- **Information Needs:** [Define executive-level information requirements]
- **Communication Preferences:** [Analyze preferred communication methods and frequency]
- **Decision Support Requirements:** [Identify what executives need for decision-making]

**Project Sponsors:**
- **Authorization Information:** [Define information needed for project authorization]
- **Progress Monitoring:** [Specify ongoing information needs for project oversight]
- **Escalation Triggers:** [Identify when sponsors need to be engaged]

#### High-Interest, Variable-Power Stakeholders
**End Users and Beneficiaries:**
- **Engagement Information:** [Define what end users need to engage effectively]
- **Training and Support:** [Identify information needs for user adoption]
- **Feedback Mechanisms:** [Specify how users should provide input]

**Subject Matter Experts:**
- **Technical Requirements:** [Define SME information and engagement needs]
- **Validation Processes:** [Specify how SMEs should validate requirements]
- **Knowledge Transfer:** [Identify SME contribution requirements]

#### Regulatory and Compliance Stakeholders
**Compliance Officers:**
- **Regulatory Requirements:** [Define compliance information needs]
- **Audit Trail Needs:** [Specify documentation requirements for compliance]
- **Risk Mitigation:** [Identify compliance risk management information needs]

### Information Delivery Requirements
**By Stakeholder Type:**

| Stakeholder Type | Information Depth | Frequency | Format | Delivery Method |
|------------------|-------------------|-----------|---------|-----------------|
| Executive Sponsors | [High-level/Strategic] | [Frequency] | [Format] | [Method] |
| Project Managers | [Detailed/Operational] | [Frequency] | [Format] | [Method] |
| End Users | [Practical/Actionable] | [Frequency] | [Format] | [Method] |
| SMEs | [Technical/Detailed] | [Frequency] | [Format] | [Method] |

---

## 3. Engagement Plan Effectiveness Analysis

### Engagement Strategy Requirements

#### Stakeholder-Specific Engagement Needs
**High-Power Stakeholders:**
- **Engagement Frequency:** [Define optimal engagement frequency]
- **Influence Strategies:** [Identify effective influence approaches]
- **Escalation Protocols:** [Define when and how to escalate to high-power stakeholders]

**High-Interest Stakeholders:**
- **Participation Opportunities:** [Define meaningful participation mechanisms]
- **Feedback Integration:** [Specify how feedback should be incorporated]
- **Recognition and Motivation:** [Identify engagement motivation strategies]

#### Communication Effectiveness Factors
**Message Clarity:**
- **Audience-Appropriate Language:** [Define communication style by stakeholder type]
- **Information Hierarchy:** [Specify how to prioritize information by audience]
- **Action Orientation:** [Define how to make communications actionable]

**Channel Optimization:**
- **Preferred Channels by Stakeholder:** [Map communication channels to stakeholder preferences]
- **Multi-Channel Strategies:** [Define when to use multiple communication channels]
- **Feedback Mechanisms:** [Specify two-way communication requirements]

### Engagement Plan Quality Indicators
**Effectiveness Metrics:**
- **Participation Rates:** [Define target participation levels by stakeholder group]
- **Feedback Quality:** [Specify indicators of meaningful stakeholder input]
- **Satisfaction Measures:** [Define stakeholder satisfaction assessment methods]

---

## 4. Requirements Gathering Agent Enhancement Recommendations

### Charter Generation Improvements
**Immediate Enhancements:**
1. **Sponsor-Focused Synthesis:** [Recommend improvements to charter synthesis for sponsor needs]
2. **Risk Communication:** [Suggest enhancements to risk presentation in charters]
3. **Resource Authorization Clarity:** [Recommend improvements to resource commitment presentation]

**Advanced Capabilities:**
1. **Stakeholder-Specific Charter Views:** [Suggest tailored charter presentations by stakeholder type]
2. **Interactive Charter Elements:** [Recommend dynamic charter components]
3. **Authorization Workflow Integration:** [Suggest integration with approval processes]

### Engagement Plan Generation Improvements
**Content Enhancements:**
1. **Stakeholder-Specific Strategies:** [Recommend tailored engagement approaches]
2. **Communication Calendar Integration:** [Suggest automated communication scheduling]
3. **Feedback Loop Automation:** [Recommend automated feedback collection and integration]

**Process Improvements:**
1. **Stakeholder Needs Assessment Automation:** [Suggest automated needs analysis]
2. **Engagement Effectiveness Monitoring:** [Recommend automated engagement tracking]
3. **Adaptive Engagement Strategies:** [Suggest dynamic engagement plan adjustments]

---

## 5. Implementation Roadmap

### Phase 1: Charter Clarity Enhancement (Immediate)
**Objectives:** Improve project charter clarity for sponsor authorization
**Key Activities:**
- [List specific implementation activities]
- [Define success criteria]
- [Specify timeline]

### Phase 2: Engagement Plan Optimization (Short-term)
**Objectives:** Enhance stakeholder engagement plan effectiveness
**Key Activities:**
- [List specific implementation activities]
- [Define success criteria]
- [Specify timeline]

### Phase 3: Advanced Stakeholder Intelligence (Long-term)
**Objectives:** Implement advanced stakeholder needs analysis and adaptive engagement
**Key Activities:**
- [List specific implementation activities]
- [Define success criteria]
- [Specify timeline]

---

## 6. Success Metrics and Monitoring

### Charter Quality Metrics
- **Sponsor Authorization Rate:** [Define target authorization success rate]
- **Charter Revision Frequency:** [Specify acceptable revision rates]
- **Sponsor Confidence Scores:** [Define confidence measurement methods]

### Engagement Effectiveness Metrics
- **Stakeholder Participation Rates:** [Define target participation levels]
- **Engagement Satisfaction Scores:** [Specify satisfaction measurement methods]
- **Communication Effectiveness:** [Define communication success indicators]

### Requirements Gathering Agent Performance
- **Document Quality Scores:** [Define quality assessment methods]
- **Stakeholder Feedback Integration:** [Specify feedback incorporation metrics]
- **Process Efficiency Gains:** [Define efficiency improvement measurements]

---

## Conclusion

This analysis provides a comprehensive framework for understanding stakeholder and sponsor needs to ensure the Requirements Gathering Agent delivers clear project charters and effective engagement plans. The recommendations focus on practical enhancements that can be implemented within the existing system architecture while significantly improving stakeholder satisfaction and project authorization success rates.

**Next Steps:**
1. Review recommendations with project team and key stakeholders
2. Prioritize implementation based on impact and feasibility
3. Develop detailed implementation plans for selected enhancements
4. Establish monitoring and feedback mechanisms for continuous improvement

Make the analysis specific to the project context and provide actionable recommendations that can be implemented within the Requirements Gathering Agent framework.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Enhanced validation for Stakeholder Needs Analysis
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    if (!content.includes('Stakeholder Needs Analysis') && !content.includes('STAKEHOLDER NEEDS ANALYSIS')) {
      throw new ExpectedError('Generated content lacks proper document identification');
    }

    // Validate that analysis has occurred
    const analysisIndicators = ['sponsor', 'engagement', 'charter', 'requirements', 'stakeholder'];
    const foundIndicators = analysisIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    );
    
    if (foundIndicators.length < 4) {
      throw new ExpectedError('Generated content lacks comprehensive stakeholder needs analysis');
    }

    // Validate actionable recommendations
    if (!content.includes('Recommendations') && !content.includes('recommendations')) {
      throw new ExpectedError('Generated content lacks actionable recommendations');
    }
  }
}