/**
 * Requirements Elicitation Processor
 * Specialized AI processor for automating requirements elicitation activities
 * 
 * @class RequirementsElicitationProcessor
 * @description Handles AI functions for requirements elicitation including interview
 * preparation, workshop facilitation, survey generation, and meeting analysis.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2025-01-27
 * 
 * @filepath src/modules/ai/processors/RequirementsElicitationProcessor.ts
 */

import { BaseAIProcessor } from './BaseAIProcessor.js';
import { AIProcessor } from '../AIProcessor.js';

export interface InterviewGuide {
  stakeholderRole: string;
  questions: InterviewQuestion[];
  followUpQuestions: string[];
  objectives: string[];
  duration: number;
  preparation: string[];
}

export interface InterviewQuestion {
  category: string;
  question: string;
  purpose: string;
  expectedAnswerType: 'open' | 'closed' | 'scale' | 'multiple-choice';
  followUpTriggers: string[];
}

export interface WorkshopPlan {
  title: string;
  objectives: string[];
  agenda: AgendaItem[];
  participants: ParticipantRole[];
  materials: string[];
  facilitation: FacilitationGuide;
}

export interface AgendaItem {
  time: string;
  duration: number;
  activity: string;
  facilitator: string;
  participants: string;
  deliverable: string;
}

export interface ParticipantRole {
  role: string;
  responsibilities: string[];
  preparation: string[];
}

export interface FacilitationGuide {
  techniques: string[];
  potentialChallenges: string[];
  mitigation: string[];
  successCriteria: string[];
}

export class RequirementsElicitationProcessor extends BaseAIProcessor {
  private aiProcessor = AIProcessor.getInstance();

  /**
   * Generates comprehensive interview questions based on stakeholder role and project context
   */
  async generateInterviewQuestions(
    stakeholderRole: string, 
    projectContext: string
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert Business Analyst specializing in requirements elicitation. Generate comprehensive interview questions tailored to specific stakeholder roles.",
        `Generate a comprehensive interview guide for the following stakeholder role and project context:

Stakeholder Role: ${stakeholderRole}

Project Context:
${projectContext}

Create an interview guide that includes:

## Interview Objectives
- Primary objectives for this interview
- Key information to gather
- Success criteria for the interview

## Pre-Interview Preparation
- Background research needed
- Documents to review
- Logistics and setup requirements

## Core Interview Questions
Generate 15-20 questions organized by category:

### Business Context Questions
- Questions about current business processes
- Pain points and challenges
- Business goals and objectives

### Functional Requirements Questions  
- What the system should do
- User workflows and scenarios
- Business rules and constraints

### Non-Functional Requirements Questions
- Performance expectations
- Security and compliance needs
- Usability and accessibility requirements

### Stakeholder-Specific Questions
- Role-specific concerns and priorities
- Decision-making authority
- Success criteria from their perspective

## Follow-Up Question Strategies
- Probing questions for unclear responses
- Clarification techniques
- Validation questions

## Interview Techniques
- Recommended elicitation techniques for this stakeholder type
- Communication style considerations
- Potential challenges and mitigation strategies

## Post-Interview Actions
- Documentation requirements
- Follow-up activities
- Validation steps

Format each question with:
- The question text
- Purpose/rationale
- Expected answer type
- Potential follow-up questions

Ensure questions are:
- Open-ended where appropriate
- Specific and actionable
- Relevant to the stakeholder role
- Aligned with project objectives`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 2000);
      return this.aiProcessor.extractContent(response);
    }, 'Interview Questions Generation', 'interview-questions');
  }

  /**
   * Creates detailed workshop facilitation plans
   */
  async createWorkshopPlan(
    workshopType: string,
    duration: number,
    participants: string[],
    projectContext: string
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert workshop facilitator and Business Analyst. Create comprehensive workshop plans for requirements elicitation.",
        `Create a detailed workshop facilitation plan with the following parameters:

Workshop Type: ${workshopType}
Duration: ${duration} hours
Participants: ${participants.join(', ')}

Project Context:
${projectContext}

Generate a comprehensive workshop plan that includes:

## Workshop Overview
- Workshop title and objectives
- Expected outcomes and deliverables
- Success criteria

## Pre-Workshop Preparation
- Participant preparation requirements
- Materials and resources needed
- Room setup and logistics
- Technology requirements

## Detailed Agenda
Create a minute-by-minute agenda including:
- Welcome and introductions (timing)
- Objective setting and ground rules
- Main activities with specific techniques
- Break times and transitions
- Wrap-up and next steps

For each agenda item include:
- Start time and duration
- Activity description
- Facilitation technique
- Participant roles
- Expected deliverable

## Facilitation Techniques
- Specific techniques for each workshop type
- Group dynamics management
- Conflict resolution strategies
- Energy management techniques

## Workshop Activities
Detail specific activities such as:
- Brainstorming sessions
- Affinity mapping
- Prioritization exercises
- Process mapping
- User story workshops
- Acceptance criteria definition

## Risk Management
- Potential challenges and issues
- Mitigation strategies
- Contingency plans
- Escalation procedures

## Documentation and Follow-up
- Real-time documentation approach
- Post-workshop deliverables
- Follow-up actions and responsibilities
- Validation and approval process

## Materials and Templates
- Flipchart templates
- Sticky note organization
- Digital tool requirements
- Handout materials

Ensure the plan is:
- Practical and actionable
- Appropriate for the participant mix
- Aligned with workshop objectives
- Scalable based on group size`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 2200);
      return this.aiProcessor.extractContent(response);
    }, 'Workshop Plan Generation', 'workshop-plan');
  }

  /**
   * Extracts requirements from meeting transcripts or notes
   */
  async extractRequirementsFromNotes(
    meetingNotes: string,
    meetingType: string = 'general'
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert Business Analyst specializing in requirements extraction. Analyze meeting notes and extract structured requirements.",
        `Analyze the following meeting notes and extract structured requirements:

Meeting Type: ${meetingType}

Meeting Notes:
${meetingNotes}

Extract and organize the following information:

## Identified Requirements
Categorize requirements as:

### Functional Requirements
- User stories or use cases mentioned
- Business processes described
- System behaviors discussed
- Integration requirements

### Non-Functional Requirements
- Performance criteria mentioned
- Security concerns raised
- Usability expectations
- Compliance requirements

### Business Requirements
- Business objectives stated
- Success criteria mentioned
- Constraints identified
- Assumptions made

## Stakeholder Information
- Key stakeholders mentioned
- Roles and responsibilities
- Decision makers identified
- Subject matter experts

## Decisions Made
- Requirements approved
- Design decisions
- Technology choices
- Process agreements

## Action Items
- Follow-up requirements gathering needed
- Additional stakeholders to involve
- Documents to review
- Validation activities required

## Open Questions
- Unclear requirements needing clarification
- Conflicting information to resolve
- Missing information to gather
- Assumptions to validate

## Risk and Issues
- Potential risks identified
- Issues raised
- Concerns expressed
- Dependencies noted

## Next Steps
- Immediate actions required
- Future meetings needed
- Documentation to create
- Approvals to obtain

For each requirement identified, provide:
- Requirement statement
- Source (who mentioned it)
- Priority (if indicated)
- Acceptance criteria (if discussed)
- Dependencies (if mentioned)

Format the output as structured markdown with clear sections and actionable items.`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 1800);
      return this.aiProcessor.extractContent(response);
    }, 'Requirements Extraction', 'requirements-extraction');
  }

  /**
   * Generates survey questions for requirements gathering
   */
  async generateRequirementsSurvey(
    targetAudience: string,
    projectContext: string,
    surveyObjectives: string[]
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert in survey design and requirements gathering. Create comprehensive surveys for collecting requirements from stakeholders.",
        `Design a comprehensive requirements gathering survey with the following parameters:

Target Audience: ${targetAudience}
Survey Objectives: ${surveyObjectives.join(', ')}

Project Context:
${projectContext}

Create a survey that includes:

## Survey Introduction
- Purpose and objectives
- Expected completion time
- Confidentiality statement
- Instructions for completion

## Demographic Questions
- Role and department
- Experience level
- Relationship to the project
- Decision-making authority

## Current State Assessment
- Current process questions
- Pain points and challenges
- System usage patterns
- Satisfaction levels

## Requirements Questions
Design questions to gather:

### Functional Requirements
- Feature priorities
- Workflow preferences
- Integration needs
- Reporting requirements

### Non-Functional Requirements
- Performance expectations
- Security concerns
- Usability preferences
- Accessibility needs

### Business Requirements
- Success criteria
- Business value expectations
- Timeline constraints
- Budget considerations

## Prioritization Questions
- Feature importance ranking
- Trade-off preferences
- Must-have vs. nice-to-have
- Implementation timeline preferences

## Open-Ended Questions
- Additional requirements not covered
- Concerns or risks
- Suggestions for improvement
- Success factors

## Question Types
Use appropriate question types:
- Multiple choice for clear options
- Likert scales for satisfaction/importance
- Ranking for prioritization
- Open text for detailed feedback
- Matrix questions for comparisons

## Survey Design Best Practices
- Logical flow and grouping
- Clear and unambiguous language
- Balanced response options
- Progress indicators
- Mobile-friendly design

## Analysis Framework
- How responses will be analyzed
- Weighting criteria
- Conflict resolution approach
- Follow-up strategy

Ensure the survey is:
- Comprehensive but not overwhelming
- Appropriate for the target audience
- Aligned with project objectives
- Actionable for requirements definition`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 2000);
      return this.aiProcessor.extractContent(response);
    }, 'Requirements Survey Generation', 'requirements-survey');
  }

  /**
   * Creates observation checklists for requirements gathering
   */
  async generateObservationChecklist(
    processToObserve: string,
    observationObjectives: string[],
    projectContext: string
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert Business Analyst specializing in process observation and requirements elicitation. Create comprehensive observation checklists.",
        `Create a detailed observation checklist for requirements gathering:

Process to Observe: ${processToObserve}
Observation Objectives: ${observationObjectives.join(', ')}

Project Context:
${projectContext}

Generate a comprehensive observation guide that includes:

## Pre-Observation Preparation
- Background research required
- Stakeholder notifications
- Permission and access requirements
- Equipment and materials needed

## Observation Objectives
- Primary information to gather
- Key questions to answer
- Success criteria for observation
- Expected duration and timing

## Process Observation Checklist

### Process Flow
- Process start and end points
- Key process steps and sequence
- Decision points and branches
- Handoffs between roles
- Parallel activities

### People and Roles
- Roles involved in the process
- Responsibilities and authorities
- Skill levels and expertise
- Communication patterns
- Collaboration methods

### Systems and Tools
- Technology systems used
- Manual tools and documents
- Data inputs and outputs
- Integration points
- System limitations

### Business Rules
- Formal rules and policies
- Informal practices
- Exception handling
- Approval requirements
- Compliance considerations

### Performance Metrics
- Time measurements
- Quality indicators
- Volume and throughput
- Error rates and types
- Customer satisfaction

### Pain Points and Issues
- Process bottlenecks
- Error-prone steps
- Workarounds used
- Frustration points
- Inefficiencies

### Environmental Factors
- Physical workspace
- Interruptions and distractions
- Peak vs. normal times
- Resource availability
- External dependencies

## Data Collection Framework
- Quantitative measures to track
- Qualitative observations to note
- Timing and frequency data
- Exception scenarios
- Improvement opportunities

## Observation Techniques
- Structured observation methods
- Note-taking strategies
- Timing and measurement approaches
- Photography/video considerations
- Stakeholder interaction guidelines

## Post-Observation Activities
- Data analysis approach
- Validation with participants
- Follow-up questions
- Documentation requirements
- Findings presentation

## Ethical Considerations
- Privacy and confidentiality
- Participant consent
- Data protection
- Observation boundaries
- Feedback obligations

Ensure the checklist is:
- Comprehensive and systematic
- Practical for field use
- Objective and unbiased
- Aligned with project goals
- Respectful of participants`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 1900);
      return this.aiProcessor.extractContent(response);
    }, 'Observation Checklist Generation', 'observation-checklist');
  }

  /**
   * Generates follow-up actions from elicitation activities
   */
  async generateFollowUpActions(
    elicitationSummary: string,
    elicitationType: string
  ): Promise<string | null> {
    return await this.handleAICall(async () => {
      const messages = this.createStandardMessages(
        "You are an expert Business Analyst specializing in requirements management. Generate comprehensive follow-up actions from elicitation activities.",
        `Based on the following elicitation summary, generate comprehensive follow-up actions:

Elicitation Type: ${elicitationType}

Elicitation Summary:
${elicitationSummary}

Generate follow-up actions organized by:

## Immediate Actions (Next 1-3 days)
- Critical clarifications needed
- Urgent stakeholder follow-ups
- Time-sensitive documentation
- Quick wins and easy confirmations

## Short-term Actions (Next 1-2 weeks)
- Detailed requirements documentation
- Stakeholder validation sessions
- Additional elicitation activities
- Prototype or mockup creation

## Medium-term Actions (Next 2-4 weeks)
- Requirements analysis and modeling
- Traceability matrix updates
- Impact analysis completion
- Solution option evaluation

## Documentation Actions
- Requirements to document
- Meeting minutes to finalize
- Templates to complete
- Artifacts to create

## Validation Actions
- Requirements to validate
- Stakeholders to confirm with
- Assumptions to verify
- Conflicts to resolve

## Communication Actions
- Status updates to send
- Meetings to schedule
- Reports to distribute
- Approvals to obtain

## Analysis Actions
- Requirements to analyze
- Gaps to investigate
- Dependencies to map
- Risks to assess

For each action item, include:
- Specific action description
- Responsible party
- Due date/timeline
- Dependencies
- Success criteria
- Priority level

## Risk Mitigation
- Potential risks in follow-up
- Mitigation strategies
- Contingency plans
- Escalation procedures

## Quality Assurance
- Review checkpoints
- Validation criteria
- Approval gates
- Quality standards

Ensure actions are:
- Specific and actionable
- Properly prioritized
- Realistically timed
- Clearly assigned
- Measurable outcomes`
      );
      
      const response = await this.aiProcessor.makeAICall(messages, 1700);
      return this.aiProcessor.extractContent(response);
    }, 'Follow-up Actions Generation', 'follow-up-actions');
  }
}