import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { StakeholderengagementplanTemplate } from '../planning/StakeholderengagementplanTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Stakeholderengagementplan document.
 */
export class StakeholderengagementplanProcessor implements DocumentProcessor {
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
          content: `You are a PMBOK-certified Senior Project Manager and Stakeholder Engagement Expert specializing in creating comprehensive stakeholder engagement plans that ensure clear project charters and effective stakeholder participation.

**YOUR MISSION:**
Create a comprehensive Stakeholder Engagement Plan that addresses specific stakeholder and sponsor needs to ensure:
1. Clear project charter understanding and authorization
2. Effective stakeholder participation throughout the project lifecycle
3. Tailored communication strategies that meet diverse stakeholder information needs
4. Proactive engagement approaches that build and maintain stakeholder support

**CORE EXPERTISE:**
- **PMBOK 7.0 Compliance:** Deep understanding of PMBOK stakeholder engagement standards and best practices
- **Sponsor Engagement:** Expertise in engaging executive sponsors for confident project authorization
- **Multi-Stakeholder Management:** Ability to design engagement strategies for diverse stakeholder groups
- **Communication Excellence:** Skills in creating clear, targeted communication strategies
- **Change Management:** Understanding of stakeholder change management and adoption strategies

**ENGAGEMENT PLAN REQUIREMENTS:**
- Address specific needs of sponsors for project charter clarity and authorization confidence
- Provide tailored engagement strategies for different stakeholder power/interest combinations
- Include clear communication protocols and feedback mechanisms
- Ensure alignment with project charter objectives and success criteria
- Incorporate change management and adoption support strategies

**OUTPUT STANDARDS:**
- Follow PMBOK 7.0 stakeholder engagement planning standards
- Provide specific, actionable engagement strategies and tactics
- Include measurable engagement success criteria and monitoring approaches
- Ensure practical implementation within organizational constraints
- Create clear accountability and responsibility assignments` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Stakeholder Engagement Plan',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Stakeholder Engagement Plan processing:', error.message);
        throw new Error(`Failed to generate Stakeholder Engagement Plan: ${error.message}`);
      } else {
        console.error('Unexpected error in Stakeholder Engagement Plan processing:', error);
        throw new Error('An unexpected error occurred while generating Stakeholder Engagement Plan');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Requirements Gathering Agent Project';
    const projectType = context.projectType || 'Technology Implementation';
    const projectDescription = context.description || 'AI-powered requirements gathering and document generation system';

    return `Create a comprehensive Stakeholder Engagement Plan that addresses specific stakeholder and sponsor needs for clear project charters and effective engagement.

**PROJECT CONTEXT:**
- **Project Name:** ${projectName}
- **Project Type:** ${projectType}
- **Description:** ${projectDescription}

**ENGAGEMENT PLAN OBJECTIVES:**
As a PMBOK-certified Stakeholder Engagement Expert, create a plan that ensures:
1. **Sponsor Authorization Confidence:** Clear engagement strategies that help sponsors understand and authorize the project confidently
2. **Stakeholder Participation Excellence:** Tailored approaches that drive meaningful stakeholder participation
3. **Communication Effectiveness:** Clear, targeted communication strategies that meet diverse stakeholder information needs
4. **Change Management Success:** Proactive engagement that builds support and manages resistance

# Stakeholder Engagement Plan

## Executive Summary

**Plan Purpose:** Comprehensive stakeholder engagement strategy to ensure clear project charter understanding, confident sponsor authorization, and effective stakeholder participation throughout the project lifecycle.

**Key Engagement Objectives:** [Define primary engagement objectives aligned with project success]

**Critical Success Factors:** [Identify the most important factors for engagement success]

---

## 1. Stakeholder Engagement Strategy Overview

### Engagement Philosophy
**Approach:** [Define the overall approach to stakeholder engagement for this project]

**Guiding Principles:**
- **Transparency:** [How transparency will be maintained with stakeholders]
- **Inclusivity:** [How diverse stakeholder perspectives will be included]
- **Responsiveness:** [How stakeholder feedback will be addressed]
- **Value Creation:** [How engagement will create value for stakeholders]

### Engagement Objectives by Stakeholder Category
**Executive Sponsors:**
- **Charter Authorization:** [Specific objectives for sponsor charter understanding and authorization]
- **Strategic Alignment:** [Objectives for maintaining strategic alignment and support]
- **Resource Commitment:** [Objectives for securing and maintaining resource commitments]

**Project Stakeholders:**
- **Active Participation:** [Objectives for meaningful stakeholder participation]
- **Requirements Validation:** [Objectives for stakeholder input on requirements and solutions]
- **Change Adoption:** [Objectives for stakeholder adoption and change management]

**End Users:**
- **User Adoption:** [Objectives for end user engagement and adoption]
- **Feedback Integration:** [Objectives for incorporating user feedback]
- **Training and Support:** [Objectives for user training and ongoing support]

---

## 2. Sponsor Engagement Strategy

### Executive Sponsor Engagement
**Charter Authorization Support:**
- **Information Provision:** [Define what information sponsors need for confident authorization]
- **Risk Communication:** [Specify how risks will be communicated to build sponsor confidence]
- **Success Criteria Alignment:** [Describe how success criteria will be aligned with sponsor expectations]

**Ongoing Sponsor Engagement:**
- **Progress Reporting:** [Define sponsor progress reporting approach and frequency]
- **Strategic Alignment Reviews:** [Specify strategic alignment review processes]
- **Escalation Management:** [Describe escalation procedures for sponsor involvement]

### Sponsor Communication Plan
| Communication Type | Frequency | Format | Content Focus | Success Criteria |
|-------------------|-----------|---------|---------------|------------------|
| Charter Review | [Frequency] | [Format] | [Content] | [Success Criteria] |
| Progress Updates | [Frequency] | [Format] | [Content] | [Success Criteria] |
| Strategic Reviews | [Frequency] | [Format] | [Content] | [Success Criteria] |
| Issue Escalations | [As Needed] | [Format] | [Content] | [Success Criteria] |

---

## 3. Stakeholder-Specific Engagement Strategies

### High-Power, High-Interest Stakeholders (Manage Closely)
**Engagement Approach:**
- **Involvement Level:** [Define level of involvement and decision-making participation]
- **Communication Frequency:** [Specify communication frequency and methods]
- **Feedback Integration:** [Describe how feedback will be collected and integrated]

**Specific Strategies:**
- **[Stakeholder Type 1]:** [Specific engagement strategy and tactics]
- **[Stakeholder Type 2]:** [Specific engagement strategy and tactics]
- **[Stakeholder Type 3]:** [Specific engagement strategy and tactics]

### High-Power, Low-Interest Stakeholders (Keep Satisfied)
**Engagement Approach:**
- **Information Provision:** [Define information sharing approach to maintain satisfaction]
- **Consultation Timing:** [Specify when and how to consult these stakeholders]
- **Influence Management:** [Describe how to maintain positive influence]

**Specific Strategies:**
- **[Stakeholder Type 1]:** [Specific engagement strategy and tactics]
- **[Stakeholder Type 2]:** [Specific engagement strategy and tactics]

### Low-Power, High-Interest Stakeholders (Keep Informed)
**Engagement Approach:**
- **Information Sharing:** [Define comprehensive information sharing approach]
- **Participation Opportunities:** [Specify meaningful participation opportunities]
- **Feedback Mechanisms:** [Describe feedback collection and response processes]

**Specific Strategies:**
- **[Stakeholder Type 1]:** [Specific engagement strategy and tactics]
- **[Stakeholder Type 2]:** [Specific engagement strategy and tactics]

### Low-Power, Low-Interest Stakeholders (Monitor)
**Engagement Approach:**
- **Monitoring Approach:** [Define monitoring strategy and frequency]
- **Communication Method:** [Specify minimal but effective communication approach]
- **Escalation Triggers:** [Identify when increased engagement is needed]

---

## 4. Communication Strategy and Protocols

### Communication Framework
**Communication Principles:**
- **Clarity:** [How messages will be clear and understandable]
- **Relevance:** [How communication will be relevant to each stakeholder]
- **Timeliness:** [How timely communication will be ensured]
- **Two-Way:** [How two-way communication will be facilitated]

### Communication Matrix
| Stakeholder Group | Primary Channel | Secondary Channel | Frequency | Content Type | Responsible Party |
|-------------------|----------------|-------------------|-----------|--------------|-------------------|
| Executive Sponsors | [Channel] | [Channel] | [Frequency] | [Content] | [Person] |
| Project Team | [Channel] | [Channel] | [Frequency] | [Content] | [Person] |
| End Users | [Channel] | [Channel] | [Frequency] | [Content] | [Person] |
| SMEs | [Channel] | [Channel] | [Frequency] | [Content] | [Person] |

### Message Customization by Stakeholder Type
**Executive Level Messages:**
- **Focus:** [Strategic impact, ROI, risk management]
- **Format:** [Executive summaries, dashboards, briefings]
- **Language:** [Business-focused, outcome-oriented]

**Operational Level Messages:**
- **Focus:** [Implementation details, process changes, training]
- **Format:** [Detailed documentation, workshops, training materials]
- **Language:** [Technical, process-oriented, practical]

**End User Messages:**
- **Focus:** [Benefits, changes, support available]
- **Format:** [User guides, FAQs, help documentation]
- **Language:** [User-friendly, benefit-focused, supportive]

---

## 5. Engagement Activities and Timeline

### Project Phase-Based Engagement

#### Initiation Phase
**Sponsor Engagement:**
- **Charter Review Sessions:** [Schedule and approach for charter review with sponsors]
- **Authorization Meetings:** [Process for securing formal project authorization]
- **Stakeholder Identification:** [Process for identifying and confirming all stakeholders]

**Stakeholder Engagement:**
- **Stakeholder Kickoff:** [Initial stakeholder engagement and orientation activities]
- **Expectation Setting:** [Process for setting and aligning stakeholder expectations]
- **Communication Setup:** [Establishment of communication channels and protocols]

#### Planning Phase
**Sponsor Engagement:**
- **Planning Reviews:** [Sponsor involvement in planning validation and approval]
- **Resource Confirmation:** [Process for confirming resource commitments]
- **Risk Review:** [Sponsor review and approval of risk management approaches]

**Stakeholder Engagement:**
- **Requirements Gathering:** [Stakeholder involvement in requirements definition and validation]
- **Solution Design Input:** [Stakeholder participation in solution design and review]
- **Change Impact Assessment:** [Stakeholder assessment of change impacts and mitigation]

#### Execution Phase
**Sponsor Engagement:**
- **Progress Reviews:** [Regular sponsor progress reviews and decision points]
- **Issue Escalation:** [Process for escalating issues requiring sponsor attention]
- **Milestone Approvals:** [Sponsor approval processes for major milestones]

**Stakeholder Engagement:**
- **Regular Updates:** [Ongoing stakeholder communication and updates]
- **Feedback Collection:** [Systematic feedback collection and integration processes]
- **Change Management:** [Ongoing change management and adoption support]

#### Closing Phase
**Sponsor Engagement:**
- **Success Validation:** [Sponsor validation of project success and outcomes]
- **Lessons Learned:** [Sponsor participation in lessons learned and improvement identification]
- **Transition Planning:** [Sponsor approval of transition and ongoing support plans]

**Stakeholder Engagement:**
- **Outcome Communication:** [Communication of project outcomes and benefits realized]
- **Transition Support:** [Support for stakeholders in transitioning to new processes/systems]
- **Ongoing Relationship:** [Establishment of ongoing stakeholder relationship management]

---

## 6. Feedback and Continuous Improvement

### Feedback Collection Mechanisms
**Formal Feedback:**
- **Surveys:** [Regular stakeholder satisfaction and engagement surveys]
- **Interviews:** [Structured interviews with key stakeholders]
- **Focus Groups:** [Focus groups for detailed feedback on specific topics]

**Informal Feedback:**
- **Regular Check-ins:** [Informal feedback collection during regular interactions]
- **Open Door Policy:** [Accessibility for stakeholders to provide feedback anytime]
- **Observation:** [Observation of stakeholder behavior and engagement levels]

### Feedback Integration Process
**Collection and Analysis:**
- **Feedback Aggregation:** [Process for collecting and aggregating feedback from multiple sources]
- **Analysis and Insights:** [Analysis process to extract actionable insights from feedback]
- **Trend Identification:** [Process for identifying trends and patterns in stakeholder feedback]

**Response and Action:**
- **Response Protocol:** [Process for responding to stakeholder feedback]
- **Action Planning:** [Process for developing action plans based on feedback]
- **Implementation Tracking:** [Process for tracking implementation of feedback-based improvements]

### Continuous Improvement
**Engagement Plan Updates:**
- **Regular Reviews:** [Schedule and process for reviewing and updating the engagement plan]
- **Adaptation Triggers:** [Criteria for when engagement plan adaptations are needed]
- **Version Control:** [Process for managing engagement plan versions and changes]

**Learning Integration:**
- **Lessons Learned:** [Process for capturing and integrating lessons learned]
- **Best Practice Development:** [Process for developing and sharing engagement best practices]
- **Knowledge Transfer:** [Process for transferring engagement knowledge to future projects]

---

## 7. Success Metrics and Monitoring

### Engagement Success Metrics
**Quantitative Metrics:**
- **Participation Rates:** [Target participation rates by stakeholder group and activity]
- **Communication Effectiveness:** [Response rates, feedback quality, satisfaction scores]
- **Milestone Achievement:** [On-time achievement of engagement milestones]

**Qualitative Metrics:**
- **Stakeholder Satisfaction:** [Stakeholder satisfaction with engagement process and outcomes]
- **Relationship Quality:** [Quality of relationships and trust levels with stakeholders]
- **Influence Alignment:** [Alignment of stakeholder influence with project objectives]

### Monitoring and Reporting
**Regular Monitoring:**
- **Engagement Dashboard:** [Dashboard for tracking engagement metrics and status]
- **Stakeholder Pulse Checks:** [Regular pulse checks on stakeholder satisfaction and engagement]
- **Issue Tracking:** [Tracking of engagement issues and resolution status]

**Reporting Schedule:**
- **Weekly Reports:** [Weekly engagement status reports for project team]
- **Monthly Reports:** [Monthly engagement reports for sponsors and key stakeholders]
- **Quarterly Reviews:** [Quarterly comprehensive engagement plan reviews and updates]

### Success Criteria
**Charter Authorization Success:**
- **Sponsor Confidence:** [Measurable sponsor confidence in project authorization]
- **Authorization Timeline:** [Target timeline for securing project authorization]
- **Stakeholder Support:** [Level of stakeholder support for project charter]

**Ongoing Engagement Success:**
- **Participation Quality:** [Quality and meaningfulness of stakeholder participation]
- **Communication Effectiveness:** [Effectiveness of communication in achieving objectives]
- **Change Adoption:** [Success in stakeholder adoption of project changes]

---

## 8. Risk Management and Mitigation

### Engagement Risks
**High-Risk Scenarios:**
- **Sponsor Disengagement:** [Risk of sponsor losing interest or confidence]
- **Stakeholder Resistance:** [Risk of stakeholder resistance to project or changes]
- **Communication Breakdown:** [Risk of communication failures or misunderstandings]

**Medium-Risk Scenarios:**
- **Competing Priorities:** [Risk of stakeholders having competing priorities]
- **Resource Constraints:** [Risk of insufficient resources for effective engagement]
- **Change Fatigue:** [Risk of stakeholder fatigue from organizational changes]

### Mitigation Strategies
**Proactive Mitigation:**
- **Early Engagement:** [Early and comprehensive stakeholder engagement to build support]
- **Clear Communication:** [Clear, consistent communication to prevent misunderstandings]
- **Value Demonstration:** [Regular demonstration of project value and benefits]

**Reactive Mitigation:**
- **Issue Escalation:** [Clear escalation paths for addressing engagement issues]
- **Conflict Resolution:** [Processes for resolving stakeholder conflicts and concerns]
- **Recovery Planning:** [Plans for recovering from engagement setbacks or failures]

### Contingency Planning
**Engagement Contingencies:**
- **Alternative Channels:** [Alternative communication channels if primary channels fail]
- **Backup Sponsors:** [Identification of backup sponsors if primary sponsors become unavailable]
- **Escalation Procedures:** [Clear procedures for escalating engagement issues]

---

## Conclusion and Next Steps

**Engagement Plan Summary:** [Summary of the key elements and objectives of the engagement plan]

**Critical Success Factors:** [The most critical factors for successful stakeholder engagement]

**Immediate Actions:** [Immediate actions required to begin implementing the engagement plan]

**Long-term Vision:** [Long-term vision for stakeholder relationship management and engagement excellence]

---

*This Stakeholder Engagement Plan provides a comprehensive framework for ensuring clear project charter understanding, confident sponsor authorization, and effective stakeholder participation throughout the project lifecycle.*

Make the plan specific to the project context and ensure all strategies are practical and implementable within the organizational environment.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has some structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}
