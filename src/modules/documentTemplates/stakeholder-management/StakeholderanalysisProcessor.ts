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
 * Processor for the Stakeholder Analysis document.
 */
export class StakeholderanalysisProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project management expert specializing in stakeholder analysis and engagement strategies. Create comprehensive stakeholder assessments that identify, analyze, and provide actionable engagement strategies.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Stakeholder Analysis',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Stakeholder Analysis processing:', error.message);
        throw new Error(`Failed to generate Stakeholder Analysis: ${error.message}`);
      } else {
        console.error('Unexpected error in Stakeholder Analysis processing:', error);
        throw new Error('An unexpected error occurred while generating Stakeholder Analysis');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate a comprehensive Stakeholder Analysis document.

Project Context:
- Name: ${projectName}
- Type: ${context.projectType || 'Not specified'}
- Description: ${projectDescription}

Create a detailed stakeholder analysis that identifies, assesses, and provides engagement strategies for all project stakeholders.

# Stakeholder Analysis

## Executive Summary
- Purpose and scope of stakeholder analysis
- Key stakeholder insights and recommendations
- Critical engagement priorities

## Stakeholder Identification

### Internal Stakeholders
| Stakeholder | Role/Title | Department | Interest Level | Influence Level |
|-------------|------------|------------|----------------|-----------------|
| [Name/Role] | [Title] | [Dept] | [High/Med/Low] | [High/Med/Low] |

### External Stakeholders
| Stakeholder | Organization | Relationship | Interest Level | Influence Level |
|-------------|--------------|--------------|----------------|-----------------|
| [Name/Role] | [Org] | [Type] | [High/Med/Low] | [High/Med/Low] |

### End Users
| User Group | Description | Size | Impact Level | Engagement Need |
|------------|-------------|------|--------------|-----------------|
| [Group] | [Description] | [Count] | [High/Med/Low] | [High/Med/Low] |

## Stakeholder Assessment

### Power/Interest Grid
**High Power, High Interest (Manage Closely)**
- [Stakeholder 1]: [Brief description and key concerns]
- [Stakeholder 2]: [Brief description and key concerns]

**High Power, Low Interest (Keep Satisfied)**
- [Stakeholder 1]: [Brief description and engagement approach]
- [Stakeholder 2]: [Brief description and engagement approach]

**Low Power, High Interest (Keep Informed)**
- [Stakeholder 1]: [Brief description and information needs]
- [Stakeholder 2]: [Brief description and information needs]

**Low Power, Low Interest (Monitor)**
- [Stakeholder 1]: [Brief description and monitoring approach]
- [Stakeholder 2]: [Brief description and monitoring approach]

### Stakeholder Attitudes
**Supporters (Positive)**
- [Stakeholder]: [Why they support, how to leverage]

**Neutral (Neutral)**
- [Stakeholder]: [Current position, how to gain support]

**Resistors (Negative)**
- [Stakeholder]: [Concerns, mitigation strategies]

## Detailed Stakeholder Profiles

### [Stakeholder Name/Role]
**Basic Information:**
- Name/Title: [Full name and title]
- Organization: [Department/company]
- Contact Information: [Email, phone]

**Analysis:**
- Interest in Project: [High/Medium/Low] - [Why they care]
- Influence Level: [High/Medium/Low] - [Type of influence]
- Attitude: [Supporter/Neutral/Resistor] - [Current stance]
- Requirements: [What they need from the project]
- Expectations: [What they expect to happen]
- Concerns: [What they're worried about]
- Success Criteria: [How they define project success]

**Engagement Strategy:**
- Communication Frequency: [Daily/Weekly/Monthly/Ad-hoc]
- Preferred Communication Method: [Email/Meetings/Reports/Dashboard]
- Key Messages: [What they need to hear]
- Engagement Activities: [Specific activities to keep them engaged]
- Escalation Path: [When and how to escalate issues]

[Repeat for each key stakeholder]

## Engagement Strategies

### Communication Plan
| Stakeholder | Frequency | Method | Content Type | Responsible |
|-------------|-----------|--------|--------------|-------------|
| [Name] | [Frequency] | [Method] | [Type] | [Person] |

### Influence Strategies
**Building Coalition Support:**
- [Strategy 1]: [How to build support among key influencers]
- [Strategy 2]: [How to address resistance]

**Managing Competing Interests:**
- [Conflict 1]: [Description and resolution approach]
- [Conflict 2]: [Description and resolution approach]

### Risk Mitigation
**Stakeholder Risks:**
| Risk | Stakeholder | Impact | Probability | Mitigation Strategy |
|------|-------------|--------|-------------|-------------------|
| [Risk] | [Who] | [H/M/L] | [H/M/L] | [Strategy] |

## Engagement Activities

### Phase-Based Engagement
**Project Initiation:**
- [Activity 1]: [Description and participants]
- [Activity 2]: [Description and participants]

**Planning Phase:**
- [Activity 1]: [Description and participants]
- [Activity 2]: [Description and participants]

**Execution Phase:**
- [Activity 1]: [Description and participants]
- [Activity 2]: [Description and participants]

**Closing Phase:**
- [Activity 1]: [Description and participants]
- [Activity 2]: [Description and participants]

### Ongoing Engagement
**Regular Communications:**
- Status Reports: [Frequency, audience, content]
- Steering Committee: [Frequency, participants, agenda items]
- Working Sessions: [Frequency, participants, objectives]

**Feedback Mechanisms:**
- Surveys: [Frequency, target audience, key questions]
- Focus Groups: [Schedule, participants, topics]
- One-on-One Meetings: [Schedule, key stakeholders]

## Success Metrics

### Engagement Effectiveness
- Stakeholder Satisfaction Score: [Target and measurement method]
- Communication Effectiveness: [Metrics and targets]
- Participation Rates: [Meeting attendance, response rates]
- Issue Resolution Time: [Average time to resolve stakeholder concerns]

### Relationship Health
- Trust Indicators: [How to measure trust levels]
- Collaboration Quality: [Metrics for collaboration effectiveness]
- Influence Alignment: [How well stakeholder influence supports project]

## Monitoring and Control

### Regular Reviews
- Stakeholder Analysis Updates: [Monthly/quarterly review schedule]
- Engagement Strategy Effectiveness: [How to assess and adjust]
- New Stakeholder Identification: [Process for identifying new stakeholders]

### Escalation Procedures
- Issue Escalation: [When and how to escalate stakeholder issues]
- Conflict Resolution: [Process for resolving stakeholder conflicts]
- Communication Breakdowns: [How to address communication failures]

## Recommendations

### Immediate Actions
1. [Action 1]: [Description and timeline]
2. [Action 2]: [Description and timeline]
3. [Action 3]: [Description and timeline]

### Long-term Strategies
1. [Strategy 1]: [Description and implementation approach]
2. [Strategy 2]: [Description and implementation approach]
3. [Strategy 3]: [Description and implementation approach]

### Resource Requirements
- **Communication Support:** [Resources needed for communication activities]
- **Facilitation Support:** [Resources for meetings and workshops]
- **Technology Support:** [Tools and systems for stakeholder management]

Make the content specific to the project context provided and use markdown formatting for proper structure.
Focus on creating actionable insights that enable effective stakeholder engagement and project success.
    `;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('Stakeholder Analysis')) {
      throw new ExpectedError('Generated content does not appear to be a valid Stakeholder Analysis');
    }
  }
}
