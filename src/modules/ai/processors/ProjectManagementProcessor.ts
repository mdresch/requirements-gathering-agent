/**
 * Project Management Processor
 * Handles top-level project management functions and integration
 * 
 * @class ProjectManagementProcessor
 * @description Manages core project management document generation including
 * summaries, user stories, and risk analysis.
 * 
 * @version 1.0.0
 * @since 3.1.0
 */

import { ChatMessage } from "../types.js";
import { AIProcessor, getAIProcessor } from "../AIProcessor.js";
import type { ContextManager } from "../../contextManager.js";
import { BaseAIProcessor } from "./BaseAIProcessor.js";

const aiProcessor = AIProcessor.getInstance();

let _contextManager: any = null;
const getContextManager = async () => {
    if (!_contextManager) {
        const { ContextManager } = await import("../../contextManager");
        _contextManager = new ContextManager();
    }
    return _contextManager;
};

export class ProjectManagementProcessor extends BaseAIProcessor {    /**
     * Gets project summary and goals
     */
    async getSummaryAndGoals(context: string): Promise<string | null> {
        return this.handleAICall(async () => {
                const messages = this.createStandardMessages(
                    "You are a senior business analyst experienced in extracting key project information. Create a comprehensive project summary and goals document following PMBOK standards.",
                    `Based on the provided project context, create a comprehensive summary and goals document:

Project Context:
${context}

Include the following sections:

### Project Summary
- Project name and purpose
- Business problem being solved
- Target users and stakeholders
- Key features and capabilities
- Technical approach overview

### Business Goals
- Primary business objectives
- User-centric outcomes
- Technical/architectural goals
- Success criteria and metrics

### Strategic Alignment
- Business strategy alignment
- Market considerations
- Innovation aspects
- Key differentiators`
                );
                const response = await aiProcessor.makeAICall(messages, 1500);
                return getAIProcessor().extractContent(response);
            }, 
            "Project Summary and Goals Generation",            "project-summary"
        );
    }

    /**
     * Gets user stories
     */
    async getUserStories(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    `You are a certified Scrum Master and Business Analyst with expertise in writing comprehensive user stories following Agile and PMBOK best practices. Generate detailed user stories that capture functional requirements from the user's perspective.`,
                    `Based on the comprehensive project context below, generate detailed User Stories following Agile best practices:

Project Context:
${context}

Generate a comprehensive User Stories document with the following structure:

## User Stories

### Epic-Level Stories
Create 3-5 high-level epic stories that represent major functional areas or user journeys.

### Detailed User Stories
For each epic, create 5-8 detailed user stories using the format:
**As a [user type], I want [functionality] so that [benefit/value].**

For each user story include:

#### Acceptance Criteria
- Clear, testable criteria using Given/When/Then format
- 3-5 specific acceptance criteria per story
- Edge cases and error conditions

#### Story Points & Priority
- Estimated complexity (1, 2, 3, 5, 8, 13)
- Priority level (High, Medium, Low)
- Dependencies on other stories

#### Technical Notes
- Key technical considerations
- Integration requirements
- Performance criteria

### Story Mapping
- Organize stories by user journey flow
- Show dependencies between stories
- Identify MVP vs future releases

### Traceability
- Link to business requirements
- Connect to project objectives
- Map to stakeholder needs

Format as professional markdown suitable for development teams, product owners, and stakeholder reviews. Ensure stories are INVEST compliant (Independent, Negotiable, Valuable, Estimable, Small, Testable).`
                );
                const response = await getAIProcessor().makeAICall(messages, 2000);
                return getAIProcessor().extractContent(response);
            },
            "User Stories Generation",            "user-stories"
        );
    }

    /**
     * Gets risk analysis
     */
    async getRiskAnalysis(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    `You are a certified Project Management Professional (PMP) with expertise in risk management following PMBOK Guide standards. Generate a comprehensive risk analysis that identifies, assesses, and provides mitigation strategies for project risks.`,
                    `Based on the comprehensive project context below, generate a detailed Risk Analysis document following PMBOK risk management processes:

Project Context:
${context}

Generate a comprehensive Risk Analysis document with the following structure:

## Risk Analysis

### Risk Identification

#### Technical Risks
- Technology-related risks and uncertainties
- Integration challenges and compatibility issues
- Performance and scalability concerns
- Security and data protection risks

#### Project Management Risks  
- Schedule and timeline risks
- Resource availability and skill gaps
- Budget and cost overrun risks
- Scope creep and requirement changes

#### Business Risks
- Market and competitive risks
- Stakeholder and organizational risks
- Regulatory and compliance risks
- External dependency risks

### Risk Assessment Matrix

For each identified risk, provide:

#### Risk Details
- **Risk ID**: Unique identifier
- **Risk Description**: Clear description of the risk event
- **Risk Category**: Technical, Project, Business, External
- **Risk Triggers**: What might cause this risk to occur

#### Risk Analysis
- **Probability**: High/Medium/Low (with %)
- **Impact**: High/Medium/Low (1-5 scale)
- **Risk Score**: Probability × Impact
- **Risk Priority**: Critical/High/Medium/Low

### Risk Response Planning

#### Risk Mitigation Strategies
- **Avoid**: Strategies to eliminate the risk
- **Mitigate**: Actions to reduce probability or impact
- **Transfer**: Ways to shift risk to third parties
- **Accept**: Risks to acknowledge and monitor

#### Contingency Plans
- Specific actions if risks materialize
- Resource requirements for response
- Timeline for response implementation
- Escalation procedures

### Risk Monitoring & Control
- Key risk indicators (KRIs)
- Risk review schedule and responsibilities
- Risk register maintenance procedures
- Communication protocols for risk events

Format as professional markdown suitable for project teams, stakeholders, and risk committees. Follow PMBOK risk management best practices and include quantitative analysis where appropriate.`
                );
                const response = await getAIProcessor().makeAICall(messages, 2200);
                return getAIProcessor().extractContent(response);
            },
            "Risk Analysis Generation",
            "risk-analysis"
        );
    }

    /**
     * Gets core values for the project
     */
    async getCoreValues(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    "Generate core values for the project following organizational development best practices.",
                    `Based on the following context, generate comprehensive core values: ${context}`
                );
                const response = await getAIProcessor().makeAICall(messages, 1200);
                return getAIProcessor().extractContent(response);
            },
            "Core Values Generation",            "core-values"
        );
    }

    /**
     * Gets project purpose statement
     */
    async getProjectPurpose(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    `You are a PMBOK-certified project manager specializing in strategic project definition. Generate a comprehensive Project Purpose statement that clearly articulates why this project exists and what fundamental business need it addresses.`,
                    `Based on the comprehensive project context below, generate a detailed Project Purpose document:

Project Context:
${context}

Generate the following sections:

## Project Purpose

Create a comprehensive purpose statement that includes:

### Primary Purpose
- A clear, concise statement (2-3 sentences) explaining the fundamental reason this project exists
- The core business problem or opportunity being addressed
- The essential value the project will deliver

### Business Justification
- Why this project is necessary now
- What happens if this project is not undertaken
- How this project aligns with organizational strategy

### Strategic Alignment
- Connection to broader business objectives
- Alignment with industry best practices (PMBOK)
- Support for organizational transformation or improvement

### Success Definition
- What "success" looks like for this project
- Key outcomes that will demonstrate purpose fulfillment
- Measurable impact on stakeholders and organization

### Scope Boundary Definition
- What is included in achieving this purpose
- What is explicitly excluded from this purpose
- Clarity on project boundaries and limitations

Format as professional markdown suitable for project charters, stakeholder presentations, and strategic planning documents. The purpose should be compelling, clear, and actionable.`
                );
                const response = await getAIProcessor().makeAICall(messages, 1600);
                return getAIProcessor().extractContent(response);
            },
            "Project Purpose Generation",
            "project-purpose"
        );
    }/**
     * Gets mission, vision and core values
     */
    async getMissionVisionAndCoreValues(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    `You are a PMBOK-certified project manager and organizational strategist. Generate a Vision Statement, Mission Statement, and a set of Core Values for a software project, ensuring alignment with PMBOK and industry best practices.`,
                    `Based on the comprehensive project context below, generate the following for the Requirements Gathering Agent project as markdown sections:

Project Context:
${context}

Generate the following sections:

## Vision Statement
Create an inspiring, future-oriented statement (2-3 sentences) that describes what the project aspires to achieve in the long term. The vision should:
- Paint a picture of the desired future state
- Be inspirational and motivational
- Align with PMBOK principles of project success
- Focus on organizational and user benefits

## Mission Statement  
Develop a clear, concise statement (1-2 sentences) that defines the project's fundamental purpose and primary objectives. The mission should:
- Explain why the project exists
- Define the core purpose and value proposition
- Be actionable and measurable
- Align with stakeholder needs

## Core Values
Define 5-7 core values that will guide the project team's behavior, decisions, and culture. Each value should:
- Include the value name (2-3 words)
- Provide a detailed description (2-3 sentences)
- Be relevant to software project management
- Support PMBOK principles
- Be actionable and measurable

Format the output as professional markdown with clear headers and structured content suitable for inclusion in project documentation and stakeholder presentations.`
                );
                const response = await getAIProcessor().makeAICall(messages, 1800);
                return getAIProcessor().extractContent(response);
            },
            "Mission Vision Core Values Generation",            "mission-vision-core-values"
        );
    }

    /**
     * Gets schedule network diagram
     */
    async getScheduleNetworkDiagram(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    `You are a certified Project Management Professional (PMP) with expertise in schedule development and network diagramming following PMBOK Guide standards. Generate a comprehensive schedule network diagram using precedence diagramming method (PDM).`,
                    `Based on the comprehensive project context below, generate a detailed Schedule Network Diagram following PMBOK schedule management processes:

Project Context:
${context}

Generate a comprehensive Schedule Network Diagram document with the following structure:

## Schedule Network Diagram

### Network Diagram Overview
- **Diagramming Method**: Precedence Diagramming Method (PDM)
- **Project Phases**: Major phases and their relationships
- **Critical Path**: Identification of the longest path through the network
- **Schedule Constraints**: Key dates, milestones, and dependencies

### Activity Network Structure

#### Project Initiation Phase
- Project charter development
- Stakeholder identification
- Initial planning activities
- **Dependencies**: Finish-to-Start relationships
- **Duration Estimates**: Time estimates for each activity

#### Planning Phase Activities
- Requirements gathering and analysis
- Architecture and design activities
- Resource planning and allocation
- Risk assessment and planning
- **Dependencies**: Complex relationships (FS, SS, FF, SF)
- **Leads and Lags**: Time adjustments between activities

#### Execution Phase Activities
- Development and implementation tasks
- Testing and quality assurance
- Integration activities
- Deployment preparation
- **Dependencies**: Resource and technical dependencies
- **Parallel Activities**: Tasks that can run concurrently

#### Monitoring & Control Activities
- Progress monitoring and reporting
- Quality control checkpoints
- Risk monitoring activities
- Change control processes
- **Dependencies**: Ongoing activities throughout project

#### Closing Phase Activities
- Final deliverable acceptance
- Project closure documentation
- Lessons learned capture
- Resource release activities

### Network Analysis

#### Critical Path Analysis
- **Critical Path Activities**: Activities with zero float
- **Critical Path Duration**: Total project duration
- **Near-Critical Paths**: Paths with minimal float
- **Schedule Risk**: Activities most likely to delay project

#### Float Analysis
- **Total Float**: Maximum delay without affecting project end date
- **Free Float**: Delay without affecting successor activities
- **Project Float**: Buffer time in overall schedule
- **Resource Conflicts**: Activities competing for same resources

### Network Diagram Representation

#### ASCII Network Diagram
\`\`\`
[Start] -> [Activity A] -> [Activity C] -> [Activity F] -> [End]
            |              |              ^
        [Activity B] -> [Activity D] -> [Activity E]
\`\`\`

#### Detailed Activity Boxes
For each activity node, show:
- Activity ID and Name
- Duration estimate
- Early Start/Early Finish dates
- Late Start/Late Finish dates
- Total Float value

### Schedule Optimization
- **Schedule Compression**: Fast tracking and crashing options
- **Resource Leveling**: Adjustments for resource constraints
- **Schedule Baseline**: Approved schedule for performance measurement
- **Change Control**: Process for schedule modifications

Format as professional markdown suitable for project teams, schedulers, and stakeholder reviews. Include both high-level network overview and detailed activity relationships following PMBOK standards.`
                );
                const response = await getAIProcessor().makeAICall(messages, 2400);
                return getAIProcessor().extractContent(response);
            },
            "Schedule Network Diagram Generation",
            "schedule-network"
        );
    }

    /**
     * Gets milestone list
     */
    async getMilestoneList(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    `You are a certified Project Management Professional (PMP) with expertise in milestone planning and schedule management following PMBOK Guide standards. Generate a comprehensive milestone list that identifies key project achievements and decision points.`,
                    `Based on the comprehensive project context below, generate a detailed Milestone List following PMBOK schedule management processes:

Project Context:
${context}

Generate a comprehensive Milestone List document with the following structure:

## Project Milestone List

### Milestone Planning Overview
- **Purpose**: Key project achievements and decision points
- **Milestone Criteria**: Significant events with zero duration
- **Stakeholder Approval**: Milestones requiring formal sign-off
- **Schedule Integration**: How milestones fit into overall project timeline

### Project Phase Milestones

#### Initiation Phase Milestones
- **Project Charter Approved**: Formal project authorization
  - **Target Date**: Based on project timeline
  - **Success Criteria**: Signed charter document
  - **Stakeholders**: Project sponsor, key stakeholders
  - **Dependencies**: Business case approval, resource commitment

#### Planning Phase Milestones
- **Requirements Baseline Established**: Complete requirements documentation
  - **Target Date**: End of requirements gathering
  - **Success Criteria**: Approved requirements traceability matrix
  - **Stakeholders**: Business analysts, user representatives
  - **Dependencies**: Stakeholder interviews completed

- **Project Management Plan Approved**: Complete planning documentation
  - **Target Date**: End of planning phase
  - **Success Criteria**: Signed project management plan
  - **Stakeholders**: Project manager, project sponsor
  - **Dependencies**: All subsidiary plans completed

#### Execution Phase Milestones
- **Architecture Design Completed**: Technical foundation established
  - **Target Date**: Early execution phase
  - **Success Criteria**: Approved architecture document
  - **Stakeholders**: Technical team, architect
  - **Dependencies**: Requirements analysis complete

- **MVP Development Complete**: Minimum viable product ready
  - **Target Date**: Mid-execution phase
  - **Success Criteria**: Core functionality implemented and tested
  - **Stakeholders**: Development team, product owner
  - **Dependencies**: Architecture implementation, testing completion

- **User Acceptance Testing Passed**: Solution validated by users
  - **Target Date**: Late execution phase
  - **Success Criteria**: UAT sign-off documentation
  - **Stakeholders**: End users, business stakeholders
  - **Dependencies**: System testing completed, training materials ready

#### Monitoring & Control Milestones
- **Project Health Reviews**: Regular assessment checkpoints
  - **Target Dates**: Monthly throughout project
  - **Success Criteria**: Status reports and metrics review
  - **Stakeholders**: Project team, steering committee
  - **Dependencies**: Performance data collection

#### Closing Phase Milestones
- **Final Deliverable Acceptance**: Customer approval of final product
  - **Target Date**: Project completion
  - **Success Criteria**: Signed acceptance certificate
  - **Stakeholders**: Project sponsor, customer representative
  - **Dependencies**: All deliverables completed and tested

- **Project Closure Complete**: Administrative closure and lessons learned
  - **Target Date**: Post-delivery
  - **Success Criteria**: Closure documentation and resource release
  - **Stakeholders**: Project manager, project team
  - **Dependencies**: Customer acceptance, contract closure

### Milestone Dependencies and Relationships

#### Critical Milestone Path
- Sequence of milestones that directly impact project completion
- Dependencies between major milestones
- Risk factors that could delay milestone achievement

#### Milestone Integration
- **Schedule Milestones**: Integration with project schedule
- **Contract Milestones**: Alignment with contractual obligations
- **Funding Milestones**: Connection to budget releases
- **Go/No-Go Decision Points**: Major project continuation decisions

### Milestone Monitoring and Control

#### Milestone Performance Metrics
- **Milestone Achievement Rate**: Percentage of milestones met on time
- **Milestone Variance**: Actual vs. planned milestone dates
- **Milestone Quality**: Success criteria fulfillment rate
- **Stakeholder Satisfaction**: Approval and acceptance ratings

#### Risk Management for Milestones
- **High-Risk Milestones**: Those most likely to be delayed
- **Mitigation Strategies**: Actions to ensure milestone achievement
- **Contingency Plans**: Alternative approaches if milestones are missed
- **Early Warning Indicators**: Signals of potential milestone delays

### Stakeholder Communication
- **Milestone Reporting**: Regular updates on milestone progress
- **Escalation Procedures**: Actions when milestones are at risk
- **Celebration Events**: Recognition of milestone achievements
- **Lessons Learned**: Capture insights from milestone experiences

Format as professional markdown suitable for project teams, stakeholders, and governance boards. Include clear dates, criteria, and accountability assignments following PMBOK standards.`
                );
                const response = await getAIProcessor().makeAICall(messages, 2300);
                return getAIProcessor().extractContent(response);
            },
            "Milestone List Generation",
            "milestone-list"
        );
    }

    /**
     * Gets schedule development input
     */
    async getDevelopScheduleInput(context: string): Promise<string | null> {
        return this.handleAICall(
            async () => {
                const messages = this.createStandardMessages(
                    `You are a certified Project Management Professional (PMP) with expertise in schedule development following PMBOK Guide standards. Generate comprehensive input data required for developing a detailed project schedule using best practices in time management.`,
                    `Based on the comprehensive project context below, generate detailed Schedule Development Input following PMBOK schedule management processes:

Project Context:
${context}

Generate a comprehensive Schedule Development Input document with the following structure:

## Schedule Development Input

### Activity List and Definitions

#### Work Package Breakdown
- **Activity Identification**: Detailed list of all project activities
- **Activity Descriptions**: Clear definition of work to be performed
- **Activity Codes**: Unique identifiers for each activity
- **Work Package Integration**: Connection to WBS work packages

#### Activity Attributes
For each activity, define:
- **Activity Name**: Descriptive name of the work
- **Activity Type**: Development, Testing, Review, Management
- **Responsible Organization**: Team or department accountable
- **Geographic Location**: Where the work will be performed
- **Calendar Requirements**: Working days and availability constraints

### Activity Sequencing Information

#### Dependency Analysis
- **Mandatory Dependencies**: Hard logic based on work nature
- **Discretionary Dependencies**: Preferred logic based on best practices
- **External Dependencies**: Dependencies on external parties or events
- **Internal Dependencies**: Dependencies within project control

#### Relationship Types
- **Finish-to-Start (FS)**: Successor starts after predecessor finishes
- **Start-to-Start (SS)**: Successor starts when predecessor starts
- **Finish-to-Finish (FF)**: Successor finishes when predecessor finishes
- **Start-to-Finish (SF)**: Successor finishes when predecessor starts

#### Leads and Lags
- **Lead Time**: Overlap between related activities
- **Lag Time**: Delay between related activities
- **Justification**: Business or technical reasons for leads/lags

### Resource Requirements

#### Resource Categories
- **Human Resources**: Skills, roles, and capacity requirements
- **Equipment Resources**: Tools, hardware, and facilities needed
- **Material Resources**: Supplies and consumables required
- **Financial Resources**: Budget allocations and spending profiles

#### Resource Availability
- **Resource Calendars**: When resources are available
- **Resource Constraints**: Limitations and competing priorities
- **Resource Skills Matrix**: Required competencies and experience levels
- **Resource Cost Rates**: Standard rates for different resource types

### Duration Estimates

#### Estimation Methods
- **Expert Judgment**: Input from experienced team members
- **Analogous Estimating**: Comparison with similar past activities
- **Parametric Estimating**: Mathematical models based on variables
- **Three-Point Estimating**: Optimistic, pessimistic, and most likely estimates

#### Duration Analysis
For each activity:
- **Optimistic Duration**: Best-case scenario timing
- **Most Likely Duration**: Expected duration under normal conditions
- **Pessimistic Duration**: Worst-case scenario timing
- **Expected Duration**: Calculated using PERT formula
- **Confidence Level**: Reliability of duration estimates

### Schedule Constraints and Assumptions

#### Schedule Constraints
- **Imposed Dates**: Fixed start or finish dates from external sources
- **Key Milestone Dates**: Important delivery or review dates
- **Resource Availability**: When key resources are available
- **Regulatory Requirements**: Compliance deadlines and approvals

#### Project Assumptions
- **Work Environment**: Assumptions about working conditions
- **Team Productivity**: Expected performance levels
- **Technology Availability**: Tool and system accessibility
- **Stakeholder Availability**: Decision-maker and reviewer availability

### Risk Considerations for Scheduling

#### Schedule Risk Factors
- **Technical Risks**: Complexity and uncertainty in work estimates
- **Resource Risks**: Availability and skill level uncertainties
- **External Risks**: Dependencies on external parties or events
- **Quality Risks**: Potential rework and correction requirements

#### Risk Response for Scheduling
- **Schedule Buffers**: Time contingencies for high-risk activities
- **Alternative Approaches**: Different methods to accomplish work
- **Resource Contingencies**: Backup resource arrangements
- **Fast-Tracking Options**: Opportunities to compress schedule

### Schedule Development Tools and Techniques

#### Scheduling Method
- **Critical Path Method (CPM)**: Network analysis for schedule optimization
- **Critical Chain Method**: Resource-constrained scheduling approach
- **Agile/Iterative Scheduling**: Timeboxed iteration planning
- **Rolling Wave Planning**: Progressive elaboration of schedule details

#### Schedule Model Requirements
- **Software Tools**: Recommended scheduling software and features
- **Model Complexity**: Level of detail required in schedule model
- **Reporting Requirements**: Schedule reports and dashboard needs
- **Update Frequency**: How often schedule should be revised

### Quality and Validation Criteria

#### Schedule Quality Metrics
- **Schedule Health**: Indicators of schedule viability
- **Critical Path Stability**: Consistency of critical path over time
- **Resource Loading**: Balanced distribution of work across resources
- **Schedule Realism**: Achievability of planned dates

#### Validation Requirements
- **Stakeholder Review**: Required approvals and sign-offs
- **Technical Validation**: Engineering and architecture review
- **Resource Validation**: Confirmation of resource commitments
- **Risk Validation**: Assessment of schedule risk acceptability

Format as professional markdown suitable for schedulers, project managers, and resource managers. Provide specific, actionable input data that can be directly used in schedule development tools following PMBOK standards.`
                );
                const response = await getAIProcessor().makeAICall(messages, 2500);
                return getAIProcessor().extractContent(response);
            },
            "Schedule Development Input Generation",
            "schedule-dev-input"
        );
    }
}
