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
 * Processor for the WBS Dictionary document.
 */
export class WbsdictionaryProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a project management expert specializing in creating comprehensive WBS Dictionaries that provide detailed work package definitions.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'WBS Dictionary',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in WBS Dictionary processing:', error.message);
        throw new Error(`Failed to generate WBS Dictionary: ${error.message}`);
      } else {
        console.error('Unexpected error in WBS Dictionary processing:', error);
        throw new Error('An unexpected error occurred while generating WBS Dictionary');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Unknown Project';
    const projectType = context.projectType || 'Not specified';
    const projectDescription = context.description || 'No description provided';
    
    return `Based on the following project context, generate a comprehensive WBS Dictionary document.

Project Context:
- Name: ${projectName}
- Type: ${projectType}
- Description: ${projectDescription}

Requirements:
1. Define each work package from the WBS in detail
2. Provide complete work package descriptions with scope boundaries
3. Specify all deliverables and sub-deliverables for each work package
4. Define measurable acceptance criteria and quality standards
5. Identify responsible parties, required skills, and resource needs
6. Provide detailed effort estimates and duration ranges
7. Document all dependencies, constraints, and assumptions
8. Include risk assessment and mitigation strategies
9. Define work authorization and approval processes
10. Establish performance measurement criteria

Structure your response as:
# WBS Dictionary

## Document Overview
- **Project:** ${projectName}
- **Project Type:** ${projectType}
- **Document Purpose:** Detailed definitions of all WBS work packages
- **Relationship to WBS:** Companion document providing detailed specifications
- **Usage Guidelines:** How project team members should use this dictionary
- **Maintenance:** Procedures for keeping the dictionary current

## Dictionary Structure and Standards
- **Work Package Naming Convention:** [Describe naming standards]
- **Effort Estimation Method:** [Planning poker, expert judgment, historical data]
- **Duration Estimation Basis:** [Calendar days, working days, hours]
- **Resource Allocation Principles:** [Full-time, part-time, shared resources]
- **Quality Standards:** [Deliverable quality criteria and review processes]

## Work Package Definitions

### 1.1.1 - Project Planning
**WBS Code:** 1.1.1
**Work Package Name:** Project Planning
**Parent Element:** 1.1 Project Management

**Scope Description:**
Develop comprehensive project management plans including project charter, scope statement, work breakdown structure, schedule, budget, quality plan, risk management plan, communication plan, and procurement plan. Establish project baselines and obtain stakeholder approval for project execution.

**Scope Boundaries:**
- **Included:** All project management planning activities, baseline establishment, stakeholder approval
- **Excluded:** Ongoing project monitoring activities (covered in 1.1.2), project closure activities (covered in 1.7)

**Deliverables:**
- Project Charter (approved)
- Project Management Plan (comprehensive)
- Work Breakdown Structure (detailed)
- Project Schedule (baselined)
- Project Budget (approved)
- Risk Management Plan
- Communication Management Plan
- Quality Management Plan
- Stakeholder Engagement Plan

**Acceptance Criteria:**
- All project management plans are complete and approved by sponsor
- Project baselines are established and documented
- All stakeholders have reviewed and approved the project approach
- Project charter is signed by project sponsor
- All plans follow organizational PMO standards and templates

**Responsible Party:** Project Manager
**Accountable Party:** Project Sponsor
**Supporting Roles:** Business Analyst, Technical Lead, Stakeholders

**Required Skills and Qualifications:**
- PMP or equivalent project management certification
- 5+ years of project management experience in ${projectType} projects
- Strong stakeholder management and communication skills
- Proficiency in project management tools (MS Project, Jira, etc.)
- Knowledge of organizational PMO standards and methodologies

**Resource Requirements:**
- Project Manager: 1.0 FTE
- Business Analyst: 0.5 FTE
- Technical Lead: 0.3 FTE
- Administrative Support: 0.2 FTE

**Estimated Effort:** 40-60 hours
**Estimated Duration:** 2-3 weeks
**Effort Distribution:**
- Project Charter: 8-12 hours
- Scope and WBS: 12-16 hours
- Schedule Development: 10-15 hours
- Budget Planning: 6-10 hours
- Risk and Quality Planning: 8-12 hours

**Dependencies:**
- **Predecessors:** 
  - Project authorization from sponsor
  - Stakeholder identification and availability
  - Resource allocation approval
- **Successors:**
  - All subsequent project work packages
  - Project execution activities (1.2.x, 1.3.x, etc.)

**Constraints:**
- **Time:** Must be completed within 3 weeks of project start
- **Budget:** Planning costs cannot exceed 5% of total project budget
- **Resources:** Limited to assigned project team members
- **Quality:** Must comply with organizational PMO standards

**Assumptions:**
- Stakeholders will be available for planning sessions
- Organizational templates and standards are current
- Project sponsor will provide timely approvals
- No major scope changes during planning phase

**Risks and Mitigation:**
- **Risk:** Stakeholder unavailability → **Mitigation:** Schedule planning sessions early, have backup dates
- **Risk:** Scope creep during planning → **Mitigation:** Strict change control, regular sponsor communication
- **Risk:** Resource allocation delays → **Mitigation:** Early resource requests, escalation procedures

**Work Authorization:**
- **Start Trigger:** Project sponsor approval and resource allocation
- **Approval Required:** Project sponsor sign-off on all major deliverables
- **Quality Gates:** PMO review of all plans before approval

**Performance Measurement:**
- **Schedule Performance:** Planned vs. actual completion dates
- **Quality Performance:** Number of plan revisions required
- **Stakeholder Satisfaction:** Approval ratings from stakeholders

---

### 1.2.1 - Requirements Gathering
**WBS Code:** 1.2.1
**Work Package Name:** Requirements Gathering
**Parent Element:** 1.2 Requirements & Analysis

**Scope Description:**
Conduct comprehensive requirements elicitation activities including stakeholder interviews, workshops, surveys, and document analysis. Gather functional and non-functional requirements, business rules, constraints, and assumptions. Document all requirements in standardized format with traceability.

**Scope Boundaries:**
- **Included:** All requirements elicitation activities, initial documentation, stakeholder validation
- **Excluded:** Requirements analysis and prioritization (covered in 1.2.2), requirements management (ongoing)

**Deliverables:**
- Requirements Documentation (comprehensive)
- Stakeholder Interview Notes
- Workshop Session Reports
- Requirements Traceability Matrix (initial)
- Business Rules Documentation
- Non-Functional Requirements Specification
- Requirements Validation Report

**Acceptance Criteria:**
- All identified stakeholders have been interviewed or participated in workshops
- Requirements are documented using organizational templates
- Initial traceability matrix links requirements to business objectives
- Stakeholders have validated captured requirements
- Requirements coverage is complete for all functional areas

**Responsible Party:** Business Analyst
**Accountable Party:** Project Manager
**Supporting Roles:** Subject Matter Experts, End Users, Technical Lead

**Required Skills and Qualifications:**
- Business Analysis certification (CBAP, CCBA, or equivalent)
- 3+ years of requirements gathering experience in ${projectType} projects
- Strong facilitation and interview skills
- Proficiency in requirements management tools
- Knowledge of business analysis techniques and methodologies

**Resource Requirements:**
- Business Analyst: 1.0 FTE
- Subject Matter Experts: 0.5 FTE (collective)
- End Users: 0.3 FTE (collective)
- Technical Consultant: 0.2 FTE

**Estimated Effort:** 80-120 hours
**Estimated Duration:** 3-4 weeks
**Effort Distribution:**
- Stakeholder interviews: 30-40 hours
- Workshop facilitation: 20-30 hours
- Document analysis: 15-20 hours
- Requirements documentation: 25-35 hours
- Validation activities: 10-15 hours

**Dependencies:**
- **Predecessors:**
  - Project planning completion (1.1.1)
  - Stakeholder identification and availability
  - Access to existing documentation and systems
- **Successors:**
  - Requirements analysis (1.2.2)
  - System design activities (1.3.x)

**Constraints:**
- **Time:** Stakeholder availability limited to specific time windows
- **Access:** Some systems may have restricted access
- **Budget:** Travel costs for stakeholder meetings must be minimized
- **Quality:** All requirements must be traceable to business objectives

**Assumptions:**
- Stakeholders will provide accurate and complete information
- Existing documentation is current and accessible
- Business processes are stable during requirements gathering
- Technical constraints are known and documented

**Risks and Mitigation:**
- **Risk:** Stakeholder unavailability → **Mitigation:** Schedule sessions early, use multiple elicitation methods
- **Risk:** Conflicting requirements → **Mitigation:** Early conflict resolution, stakeholder prioritization
- **Risk:** Scope creep → **Mitigation:** Clear scope boundaries, change control process

**Work Authorization:**
- **Start Trigger:** Completion of project planning and stakeholder approval
- **Approval Required:** Business stakeholder sign-off on requirements documentation
- **Quality Gates:** Requirements review by technical team and PMO

**Performance Measurement:**
- **Completeness:** Percentage of identified requirements documented
- **Quality:** Number of requirements changes after validation
- **Stakeholder Engagement:** Participation rates in elicitation activities

---

[Continue with similar detailed definitions for all other work packages: 1.2.2, 1.2.3, 1.3.1, 1.3.2, 1.3.3, 1.4.1, 1.4.2, 1.4.3, 1.5.1, 1.5.2, 1.5.3, 1.6.1, 1.6.2, 1.6.3, 1.7.1, 1.7.2]

## Work Package Cross-Reference Matrix

| WBS Code | Work Package | Owner | Effort (hrs) | Duration | Dependencies | Critical Path | Risk Level |
|----------|--------------|-------|--------------|----------|--------------|---------------|------------|
| 1.1.1 | Project Planning | PM | 40-60 | 2-3 weeks | None | Yes | Medium |
| 1.1.2 | Project Monitoring | PM | 20% duration | Ongoing | 1.1.1 | No | Low |
| 1.1.3 | Stakeholder Mgmt | PM | 15% duration | Ongoing | 1.1.1 | No | Medium |
| 1.2.1 | Requirements Gathering | BA | 80-120 | 3-4 weeks | 1.1.1 | Yes | High |
| 1.2.2 | Requirements Analysis | BA | 60-80 | 2-3 weeks | 1.2.1 | Yes | Medium |
| 1.2.3 | Business Process Analysis | BA | 40-60 | 2 weeks | 1.2.1 | No | Low |
| 1.3.1 | System Architecture | Architect | 60-80 | 2-3 weeks | 1.2.2 | Yes | High |
| 1.3.2 | Detailed Design | Tech Lead | 100-150 | 3-4 weeks | 1.3.1 | Yes | Medium |
| 1.3.3 | Database Design | DBA | 40-60 | 2 weeks | 1.3.1 | No | Medium |

## Responsibility Assignment Matrix (RACI)

| Work Package | PM | BA | Architect | Dev Lead | QA Lead | DevOps | Sponsor |
|--------------|----|----|-----------|----------|---------|--------|---------|
| 1.1.1 Project Planning | R | C | C | C | C | C | A |
| 1.2.1 Requirements Gathering | A | R | C | C | I | I | C |
| 1.3.1 System Architecture | C | C | R | C | C | C | A |
| 1.4.2 Core Development | C | I | C | R | C | I | I |
| 1.5.2 System Testing | C | C | I | C | R | C | I |
| 1.6.2 Production Deployment | C | I | C | C | C | R | A |

**Legend:** R=Responsible, A=Accountable, C=Consulted, I=Informed

## Dictionary Maintenance Procedures

### Update Process
1. **Weekly Reviews:** Project Manager reviews all active work packages
2. **Change Requests:** Any scope changes require dictionary updates
3. **Lessons Learned:** Incorporate feedback from completed work packages
4. **Version Control:** Maintain version history with change tracking

### Approval Workflow
1. Work package owner proposes changes
2. Project Manager reviews and validates
3. Stakeholders review and approve
4. PMO reviews for compliance
5. Updated dictionary is distributed

### Quality Assurance
- Monthly dictionary audits by PMO
- Quarterly stakeholder reviews
- Annual template and standard updates
- Continuous improvement based on project outcomes

### Communication Plan
- **Weekly:** Updated dictionary sections shared with team
- **Monthly:** Complete dictionary review with stakeholders
- **Quarterly:** Dictionary effectiveness assessment
- **Project Closure:** Final dictionary archived for future reference

Focus on providing clear, actionable definitions specific to ${projectType} projects that enable accurate planning, execution, and control.
Ensure all work packages are measurable, assignable, and properly integrated with project management processes.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('WBS Dictionary')) {
      throw new ExpectedError('Generated content does not appear to be a valid WBS Dictionary');
    }
  }
}
