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
 * Processor for generating comprehensive detailed project planning artifacts.
 * Integrates WBS, WBS Dictionary, and Schedule Network Diagrams.
 */
export class DetailedPlanningArtifactsProcessor implements DocumentProcessor {
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
          content: 'You are a senior project management expert specializing in creating comprehensive, integrated planning artifacts that provide granular control over project planning. Generate detailed, professional documents that follow PMI standards and best practices.' 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Detailed Project Planning Artifacts',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Detailed Planning Artifacts processing:', error.message);
        throw new Error(`Failed to generate Detailed Planning Artifacts: ${error.message}`);
      } else {
        console.error('Unexpected error in Detailed Planning Artifacts processing:', error);
        throw new Error('An unexpected error occurred while generating Detailed Planning Artifacts');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    const projectName = context.projectName || 'Project';
    const projectType = context.projectType || 'Software Development';
    const projectDescription = context.description || 'No description provided';
    
    return `Generate a comprehensive Detailed Project Planning Artifacts document that integrates Work Breakdown Structure (WBS), WBS Dictionary, and Schedule Network Diagrams for granular project management control.

Project Context:
- Name: ${projectName}
- Type: ${projectType}
- Description: ${projectDescription}

Requirements:
1. Create an integrated planning document that shows how WBS, WBS Dictionary, and Schedule Network Diagrams work together
2. Provide detailed work breakdown with 3-4 levels of decomposition
3. Include comprehensive work package definitions with all required details
4. Show activity relationships and dependencies through network diagrams
5. Demonstrate critical path analysis and schedule optimization
6. Include resource allocation and leveling considerations
7. Provide templates and tools for ongoing planning management
8. Establish integration with other project management processes

Structure your response as:

# Detailed Project Planning Artifacts

## Executive Summary
- **Project:** ${projectName}
- **Project Type:** ${projectType}
- **Document Purpose:** Comprehensive planning artifacts for granular project control
- **Planning Methodology:** Integrated WBS, Dictionary, and Network Diagram approach
- **Key Benefits:** Enhanced project control, improved resource management, better risk mitigation

## Planning Artifacts Overview

### Artifact Integration Model
\`\`\`
Project Scope → WBS → Work Packages → Activities → Network Diagram → Schedule
     ↓            ↓         ↓            ↓            ↓              ↓
Requirements → Dictionary → Resources → Dependencies → Critical Path → Baseline
\`\`\`

### Planning Artifacts Relationship
- **WBS:** Hierarchical decomposition of project scope into manageable components
- **WBS Dictionary:** Detailed definitions, specifications, and requirements for each work package
- **Schedule Network Diagram:** Logical relationships and dependencies between activities
- **Integration:** All artifacts work together to provide complete project planning foundation

## Part I: Work Breakdown Structure (WBS)

### WBS Development Methodology
- **100% Rule:** Complete scope coverage with no gaps or overlaps
- **Decomposition Approach:** Deliverable-based with phase integration
- **Work Package Criteria:** 8-80 hour rule for optimal management
- **Responsibility Assignment:** Single point of accountability for each element
- **Progressive Elaboration:** Detailed planning as information becomes available

### WBS Hierarchy

#### Level 1: Project
**1.0 ${projectName}**
- **Project Manager:** [To be assigned]
- **Total Duration:** [To be determined based on detailed planning]
- **Total Budget:** [To be estimated from work package costs]
- **Success Criteria:** [Defined in project charter]

#### Level 2: Major Deliverables/Phases

**1.1 Project Management & Control**
- **Scope:** All project management activities throughout project lifecycle
- **Duration:** Full project duration
- **Resources:** Project Manager, PMO support
- **Critical Success Factors:** Effective planning, monitoring, and stakeholder management

**1.2 Business Analysis & Requirements**
- **Scope:** Requirements elicitation, analysis, and documentation
- **Duration:** 4-6 weeks
- **Resources:** Business Analyst, Subject Matter Experts, Stakeholders
- **Critical Success Factors:** Complete requirements capture, stakeholder validation

**1.3 Solution Design & Architecture**
- **Scope:** Technical design, architecture, and detailed specifications
- **Duration:** 3-5 weeks
- **Resources:** Solution Architect, Technical Leads, Designers
- **Critical Success Factors:** Scalable architecture, technical feasibility validation

**1.4 Development & Implementation**
- **Scope:** Software development, coding, and component integration
- **Duration:** 8-12 weeks
- **Resources:** Development Team, Technical Leads, DevOps Engineers
- **Critical Success Factors:** Quality code delivery, adherence to standards

**1.5 Testing & Quality Assurance**
- **Scope:** All testing activities from unit to user acceptance testing
- **Duration:** 4-6 weeks
- **Resources:** QA Team, Test Engineers, End Users
- **Critical Success Factors:** Comprehensive test coverage, defect resolution

**1.6 Deployment & Go-Live**
- **Scope:** Production deployment, go-live support, and initial stabilization
- **Duration:** 2-3 weeks
- **Resources:** DevOps Team, Support Team, Business Users
- **Critical Success Factors:** Smooth deployment, minimal business disruption

**1.7 Project Closure & Transition**
- **Scope:** Project closure activities, knowledge transfer, and lessons learned
- **Duration:** 1-2 weeks
- **Resources:** Project Manager, Team Leads, Business Stakeholders
- **Critical Success Factors:** Complete knowledge transfer, documented lessons learned

#### Level 3: Work Packages (Detailed Breakdown)

##### 1.1 Project Management & Control
- **1.1.1 Project Initiation & Planning** (40-60 hours)
- **1.1.2 Project Monitoring & Control** (Ongoing - 20% of project effort)
- **1.1.3 Stakeholder Management** (Ongoing - 15% of project effort)
- **1.1.4 Risk Management** (Ongoing - 10% of project effort)
- **1.1.5 Change Management** (As needed - 5% of project effort)

##### 1.2 Business Analysis & Requirements
- **1.2.1 Requirements Elicitation** (80-120 hours)
- **1.2.2 Requirements Analysis & Prioritization** (60-80 hours)
- **1.2.3 Business Process Modeling** (40-60 hours)
- **1.2.4 Requirements Validation & Sign-off** (20-30 hours)
- **1.2.5 Requirements Traceability Management** (Ongoing - 20 hours)

##### 1.3 Solution Design & Architecture
- **1.3.1 Solution Architecture Design** (80-100 hours)
- **1.3.2 Technical Design Specifications** (120-150 hours)
- **1.3.3 Database Design & Modeling** (60-80 hours)
- **1.3.4 Integration Design** (40-60 hours)
- **1.3.5 Security & Performance Design** (40-60 hours)

##### 1.4 Development & Implementation
- **1.4.1 Development Environment Setup** (30-40 hours)
- **1.4.2 Core Application Development** (400-600 hours)
- **1.4.3 Database Development** (80-120 hours)
- **1.4.4 Integration Development** (100-150 hours)
- **1.4.5 User Interface Development** (150-200 hours)

##### 1.5 Testing & Quality Assurance
- **1.5.1 Test Planning & Strategy** (40-60 hours)
- **1.5.2 Test Environment Setup** (20-30 hours)
- **1.5.3 Unit & Integration Testing** (100-150 hours)
- **1.5.4 System & Performance Testing** (80-120 hours)
- **1.5.5 User Acceptance Testing** (60-80 hours)

##### 1.6 Deployment & Go-Live
- **1.6.1 Production Environment Setup** (40-60 hours)
- **1.6.2 Deployment Planning & Preparation** (30-40 hours)
- **1.6.3 Production Deployment** (20-30 hours)
- **1.6.4 Go-Live Support** (40-60 hours)
- **1.6.5 Post-Deployment Stabilization** (30-40 hours)

##### 1.7 Project Closure & Transition
- **1.7.1 Documentation Finalization** (30-40 hours)
- **1.7.2 Knowledge Transfer** (20-30 hours)
- **1.7.3 Project Evaluation & Lessons Learned** (15-20 hours)
- **1.7.4 Administrative Closure** (10-15 hours)

### WBS Summary Matrix
| WBS Code | Work Package | Owner | Effort (hrs) | Duration | Critical Path | Risk Level |
|----------|--------------|-------|--------------|----------|---------------|------------|
| 1.1.1 | Project Initiation & Planning | PM | 40-60 | 2-3 weeks | Yes | Medium |
| 1.2.1 | Requirements Elicitation | BA | 80-120 | 3-4 weeks | Yes | High |
| 1.3.1 | Solution Architecture Design | Architect | 80-100 | 2-3 weeks | Yes | High |
| 1.4.2 | Core Application Development | Dev Lead | 400-600 | 8-10 weeks | Yes | Medium |
| 1.5.4 | System & Performance Testing | QA Lead | 80-120 | 2-3 weeks | Yes | Medium |
| 1.6.3 | Production Deployment | DevOps | 20-30 | 1 week | Yes | High |

## Part II: WBS Dictionary (Detailed Work Package Definitions)

### Dictionary Standards and Guidelines
- **Naming Convention:** [Phase].[Deliverable].[Work Package]
- **Effort Estimation:** Planning poker with historical data validation
- **Resource Allocation:** Named individuals with backup assignments
- **Quality Standards:** Peer review and stakeholder approval required
- **Change Control:** All changes require project manager approval

### Sample Work Package Definitions

#### 1.2.1 - Requirements Elicitation
**Work Package Details:**
- **WBS Code:** 1.2.1
- **Work Package Name:** Requirements Elicitation
- **Parent Element:** 1.2 Business Analysis & Requirements
- **Work Package Manager:** Senior Business Analyst

**Scope Description:**
Conduct comprehensive requirements gathering activities including stakeholder interviews, facilitated workshops, surveys, document analysis, and observation sessions. Capture functional requirements, non-functional requirements, business rules, constraints, assumptions, and dependencies. Ensure complete coverage of all business areas and stakeholder groups.

**Scope Boundaries:**
- **Included:** All elicitation activities, initial documentation, stakeholder validation sessions
- **Excluded:** Requirements analysis and prioritization (1.2.2), ongoing requirements management
- **Interfaces:** Stakeholder Management (1.1.3), Solution Architecture (1.3.1)

**Detailed Deliverables:**
1. **Requirements Documentation Package**
   - Functional Requirements Specification (100+ requirements expected)
   - Non-Functional Requirements Document (performance, security, usability)
   - Business Rules Catalog (50+ rules expected)
   - Data Requirements Specification
   - Integration Requirements Document

2. **Elicitation Evidence Package**
   - Stakeholder Interview Transcripts (15+ interviews)
   - Workshop Session Reports (5+ workshops)
   - Survey Results and Analysis (100+ responses)
   - Document Analysis Reports
   - Observation Session Notes

3. **Validation and Approval Package**
   - Requirements Review Meeting Minutes
   - Stakeholder Sign-off Forms
   - Requirements Traceability Matrix (initial)
   - Requirements Validation Report
   - Change Request Log (if applicable)

**Acceptance Criteria:**
- [ ] All 25+ identified stakeholders have participated in elicitation activities
- [ ] Requirements documentation follows organizational templates and standards
- [ ] 100% of business processes have been covered in requirements gathering
- [ ] All requirements are traceable to business objectives
- [ ] Stakeholder validation sessions have 95%+ approval rating
- [ ] Requirements coverage analysis shows no gaps in functional areas
- [ ] All non-functional requirements have quantifiable acceptance criteria

**Resource Assignment:**
- **Responsible:** Senior Business Analyst (1.0 FTE)
- **Accountable:** Project Manager
- **Consulted:** Subject Matter Experts (0.5 FTE collective), End Users (0.3 FTE collective)
- **Informed:** Solution Architect, Technical Lead, Project Sponsor

**Detailed Resource Requirements:**
- Senior Business Analyst: 120 hours over 4 weeks
- Subject Matter Experts: 60 hours collective (various schedules)
- End Users: 40 hours collective (workshop participation)
- Administrative Support: 20 hours (scheduling, documentation)
- Meeting Facilities: 15 sessions (conference rooms, virtual platforms)

**Effort Breakdown:**
- Stakeholder Interviews: 45 hours (15 interviews × 3 hours each)
- Workshop Facilitation: 30 hours (5 workshops × 6 hours each)
- Document Analysis: 20 hours (existing system documentation review)
- Requirements Documentation: 40 hours (writing and formatting)
- Validation Sessions: 15 hours (review meetings and revisions)
- Administrative Tasks: 10 hours (scheduling, coordination)

**Schedule Information:**
- **Estimated Duration:** 4 weeks
- **Earliest Start:** After project planning approval (1.1.1 completion)
- **Latest Finish:** Must complete before solution design starts (1.3.1)
- **Critical Path:** Yes - delays will impact overall project schedule
- **Float/Slack:** 0 days (critical path activity)

**Dependencies:**
- **Predecessors:**
  - Project Planning completion (1.1.1) - FS relationship
  - Stakeholder identification and availability confirmation
  - Requirements elicitation tools and templates preparation
  - Meeting facilities and technology setup
- **Successors:**
  - Requirements Analysis & Prioritization (1.2.1) - FS relationship
  - Solution Architecture Design (1.3.1) - FS relationship with lag
  - Test Planning (1.5.1) - SS relationship for early test case development

**Constraints:**
- **Time:** Stakeholder availability limited to specific windows
- **Budget:** Travel budget limited to $5,000 for stakeholder meetings
- **Resources:** Senior BA not available during weeks 3-4 of project
- **Technology:** Some legacy systems have limited documentation
- **Regulatory:** Compliance requirements may limit access to certain data

**Assumptions:**
- Stakeholders will provide accurate and complete information
- Existing system documentation is current and accessible
- Business processes are stable during requirements gathering period
- No major organizational changes during elicitation phase
- Required subject matter experts will be available as scheduled

**Risk Assessment:**
- **High Risk:** Key stakeholder unavailability (Probability: 30%, Impact: High)
  - **Mitigation:** Early scheduling, backup stakeholders identified
- **Medium Risk:** Conflicting requirements from different stakeholder groups (Probability: 50%, Impact: Medium)
  - **Mitigation:** Early conflict resolution process, stakeholder alignment sessions
- **Low Risk:** Technology issues during virtual workshops (Probability: 20%, Impact: Low)
  - **Mitigation:** Backup technology platforms, technical support on standby

**Quality Assurance:**
- **Peer Review:** All requirements documentation reviewed by senior BA
- **Stakeholder Review:** Formal review sessions with business stakeholders
- **Technical Review:** Architecture team reviews technical requirements
- **PMO Review:** Compliance with organizational standards verified

**Work Authorization:**
- **Start Trigger:** Project Manager approval and resource allocation confirmation
- **Approval Gates:** Stakeholder sign-off required before proceeding to analysis phase
- **Quality Gates:** PMO review of requirements documentation completeness

**Performance Measurement:**
- **Schedule Performance:** Actual vs. planned completion dates for each deliverable
- **Quality Performance:** Number of requirements changes after validation
- **Stakeholder Satisfaction:** Survey ratings from elicitation participants
- **Scope Performance:** Percentage of identified requirements successfully captured

## Part III: Schedule Network Diagram

### Network Diagram Methodology
- **Precedence Diagramming Method (PDM):** Activity-on-Node approach
- **Dependency Types:** FS (Finish-to-Start), SS (Start-to-Start), FF (Finish-to-Finish), SF (Start-to-Finish)
- **Lead and Lag:** Applied where logical relationships require time buffers
- **Critical Path Method:** Identifies longest path and schedule optimization opportunities
- **Resource Leveling:** Balances resource allocation across project timeline

### Project Network Structure

#### Phase 1: Project Initiation & Planning Network
\`\`\`
[Project Authorization] --FS--> [Stakeholder Identification] --FS--> [Project Charter]
         |                              |                              |
         SS                             SS                             FS
         ↓                              ↓                              ↓
[Resource Allocation] --FS--> [Project Planning] --FS--> [Baseline Approval]
         |                              |                              |
         FS                             FS                             FS
         ↓                              ↓                              ↓
[Team Assembly] --FS--> [Kickoff Meeting] --FS--> [Requirements Phase Start]
\`\`\`

**Critical Path Activities:** Project Authorization → Project Planning → Baseline Approval → Requirements Phase Start
**Total Phase Duration:** 3 weeks
**Critical Path Duration:** 3 weeks (no float)

#### Phase 2: Requirements & Analysis Network
\`\`\`
[Requirements Planning] --FS--> [Stakeholder Interviews] --FS--> [Requirements Documentation]
         |                              |                              |
         SS                             SS                             FS
         ↓                              ↓                              ↓
[Workshop Planning] --FS--> [Requirements Workshops] --FS--> [Requirements Validation]
         |                              |                              |
         FS                             FF                             FS
         ↓                              ↓                              ↓
[Document Analysis] --FS--> [Business Process Modeling] --FS--> [Requirements Sign-off]
\`\`\`

**Critical Path Activities:** Requirements Planning → Stakeholder Interviews → Requirements Documentation → Requirements Validation → Requirements Sign-off
**Total Phase Duration:** 6 weeks
**Critical Path Duration:** 5 weeks (1 week float in parallel activities)

#### Phase 3: Design & Architecture Network
\`\`\`
[Architecture Planning] --FS--> [High-Level Design] --FS--> [Detailed Design]
         |                              |                              |
         SS                             FS                             FS
         ↓                              ↓                              ↓
[Technology Selection] --FS--> [Database Design] --FS--> [Integration Design]
         |                              |                              |
         FS                             SS                             FF
         ↓                              ↓                              ↓
[Security Design] --FS--> [Performance Design] --FS--> [Design Review & Approval]
\`\`\`

**Critical Path Activities:** Architecture Planning → High-Level Design → Detailed Design → Design Review & Approval
**Total Phase Duration:** 5 weeks
**Critical Path Duration:** 4 weeks (1 week float in parallel design activities)

#### Phase 4: Development & Implementation Network
\`\`\`
[Environment Setup] --FS--> [Core Development] --FS--> [Integration Development]
         |                              |                              |
         SS                             SS                             FS
         ↓                              ↓                              ↓
[Database Development] --FS--> [UI Development] --FS--> [System Integration]
         |                              |                              |
         FS                             FS                             FS
         ↓                              ↓                              ↓
[Unit Testing] --FS--> [Code Review] --FS--> [Development Complete]
\`\`\`

**Critical Path Activities:** Environment Setup → Core Development → Integration Development → System Integration → Development Complete
**Total Phase Duration:** 12 weeks
**Critical Path Duration:** 10 weeks (2 weeks float in parallel development streams)

#### Phase 5: Testing & Quality Assurance Network
\`\`\`
[Test Planning] --FS--> [Test Environment Setup] --FS--> [System Testing]
         |                              |                              |
         SS                             SS                             FS
         ↓                              ↓                              ↓
[Test Case Development] --FS--> [Integration Testing] --FS--> [Performance Testing]
         |                              |                              |
         FS                             FS                             FS
         ↓                              ↓                              ↓
[UAT Preparation] --FS--> [User Acceptance Testing] --FS--> [Testing Sign-off]
\`\`\`

**Critical Path Activities:** Test Planning → Test Environment Setup → System Testing → Performance Testing → UAT → Testing Sign-off
**Total Phase Duration:** 6 weeks
**Critical Path Duration:** 5 weeks (1 week float in parallel testing activities)

#### Phase 6: Deployment & Go-Live Network
\`\`\`
[Production Environment] --FS--> [Deployment Planning] --FS--> [Production Deployment]
         |                              |                              |
         SS                             FS                             FS
         ↓                              ↓                              ↓
[Data Migration Prep] --FS--> [Data Migration] --FS--> [Go-Live Support]
         |                              |                              |
         FS                             FS                             FS
         ↓                              ↓                              ↓
[Training Delivery] --FS--> [Cutover Activities] --FS--> [Stabilization]
\`\`\`

**Critical Path Activities:** Production Environment → Deployment Planning → Production Deployment → Go-Live Support → Stabilization
**Total Phase Duration:** 3 weeks
**Critical Path Duration:** 3 weeks (no float - critical deployment activities)

### Critical Path Analysis

#### Overall Project Critical Path
**Total Project Duration:** 35 weeks
**Critical Path Sequence:**
1. Project Authorization → Project Planning (3 weeks)
2. Requirements Elicitation → Requirements Sign-off (5 weeks)
3. Architecture Design → Design Approval (4 weeks)
4. Core Development → Development Complete (10 weeks)
5. System Testing → Testing Sign-off (5 weeks)
6. Production Deployment → Stabilization (3 weeks)
7. Project Closure (1 week)

#### Schedule Optimization Opportunities
1. **Fast-Tracking Options:**
   - Start high-level design during requirements validation (save 1 week)
   - Begin test planning during detailed design phase (save 1 week)
   - Overlap UAT preparation with system testing (save 0.5 weeks)

2. **Crashing Options:**
   - Add senior developer to core development (reduce by 2 weeks, cost: $40,000)
   - Parallel testing streams with additional QA resources (reduce by 1 week, cost: $15,000)
   - Dedicated deployment team for faster go-live (reduce by 0.5 weeks, cost: $10,000)

3. **Resource Leveling Impact:**
   - Current plan has resource conflicts in weeks 15-18 (development phase)
   - Leveling will extend schedule by 1 week but reduce overtime costs
   - Recommended approach: Level resources and fast-track design activities

### Dependency Management

#### External Dependencies
- **Vendor Software Licenses:** Required by week 8 (before development starts)
- **Infrastructure Provisioning:** Cloud resources needed by week 6
- **Third-Party API Access:** Integration credentials required by week 12
- **Regulatory Approvals:** Security compliance sign-off needed by week 25

#### Internal Dependencies
- **Resource Availability:** Key architects available only during specific periods
- **Budget Approvals:** Additional funding approval needed by week 20
- **Stakeholder Availability:** Business users limited availability during month-end
- **Technology Constraints:** Legacy system maintenance windows affect testing

#### Risk-Based Dependencies
- **High Risk:** Third-party API changes could impact integration (week 12-16)
- **Medium Risk:** Resource conflicts during peak development (week 15-18)
- **Low Risk:** Infrastructure performance issues during testing (week 20-25)

## Part IV: Integrated Planning Management

### Planning Artifacts Integration

#### Artifact Synchronization Process
1. **Weekly Planning Reviews:** Ensure WBS, Dictionary, and Schedule alignment
2. **Change Impact Analysis:** Assess changes across all planning artifacts
3. **Baseline Management:** Maintain integrated baselines for scope, schedule, and cost
4. **Performance Measurement:** Integrated earned value management across artifacts

#### Integration Checkpoints
- **Milestone 1:** Planning artifacts baseline (Week 3)
- **Milestone 2:** Requirements and design integration review (Week 9)
- **Milestone 3:** Development and testing integration review (Week 20)
- **Milestone 4:** Deployment readiness review (Week 30)
- **Milestone 5:** Project closure and lessons learned (Week 35)

### Planning Tools and Templates

#### Recommended Planning Software
- **Primary:** Microsoft Project Professional for schedule management
- **Secondary:** Smartsheet for collaborative WBS management
- **Supporting:** Jira for work package tracking and resource management
- **Integration:** Power BI for integrated planning dashboards

#### Planning Templates
1. **WBS Template:** Standardized decomposition structure for ${projectType} projects
2. **Dictionary Template:** Comprehensive work package definition format
3. **Network Diagram Template:** Standard dependency mapping approach
4. **Integration Template:** Cross-artifact relationship tracking

### Ongoing Planning Management

#### Planning Maintenance Schedule
- **Daily:** Work package progress updates and issue identification
- **Weekly:** Schedule updates and resource allocation adjustments
- **Bi-weekly:** WBS Dictionary updates and scope change assessments
- **Monthly:** Comprehensive planning artifacts review and baseline updates
- **Quarterly:** Planning process improvement and lessons learned integration

#### Change Control Integration
1. **Change Request Assessment:** Impact analysis across WBS, Dictionary, and Schedule
2. **Approval Workflow:** Integrated approval process for all planning artifacts
3. **Implementation Tracking:** Coordinated updates across all planning documents
4. **Communication Plan:** Stakeholder notification of planning changes

#### Performance Monitoring
- **Schedule Performance Index (SPI):** Measure schedule efficiency
- **Cost Performance Index (CPI):** Track budget performance against work packages
- **Scope Performance:** Monitor scope creep and change requests
- **Quality Performance:** Track deliverable quality against acceptance criteria

### Best Practices and Guidelines

#### Planning Excellence Framework
1. **Comprehensive Scope Definition:** Ensure 100% scope coverage in WBS
2. **Detailed Work Package Specifications:** Complete dictionary definitions
3. **Realistic Schedule Development:** Evidence-based duration estimates
4. **Integrated Risk Management:** Risk consideration in all planning artifacts
5. **Stakeholder Engagement:** Continuous validation and approval processes

#### Common Planning Pitfalls to Avoid
- **Incomplete WBS:** Missing work packages or inadequate decomposition
- **Vague Dictionary Definitions:** Unclear scope boundaries or acceptance criteria
- **Unrealistic Dependencies:** Overly optimistic or pessimistic relationship assumptions
- **Resource Overallocation:** Insufficient consideration of resource constraints
- **Poor Integration:** Disconnected planning artifacts that don't align

#### Success Metrics
- **Planning Quality:** Percentage of work packages with complete dictionary definitions
- **Schedule Accuracy:** Variance between planned and actual completion dates
- **Scope Control:** Number of approved vs. rejected change requests
- **Stakeholder Satisfaction:** Approval ratings for planning artifacts
- **Team Productivity:** Actual vs. estimated effort for completed work packages

## Conclusion

This comprehensive planning artifacts package provides project managers with the detailed, granular control needed for successful ${projectType} project execution. The integrated approach ensures that scope (WBS), specifications (Dictionary), and schedule (Network Diagram) work together seamlessly to support effective project management.

### Key Benefits Delivered
1. **Complete Scope Coverage:** Hierarchical WBS ensures no work is missed
2. **Detailed Specifications:** Comprehensive dictionary enables accurate execution
3. **Optimized Scheduling:** Network diagrams support efficient resource utilization
4. **Integrated Management:** All artifacts work together for cohesive project control
5. **Scalable Framework:** Templates and processes support future projects

### Next Steps
1. Review and approve all planning artifacts with project stakeholders
2. Establish baseline versions for scope, schedule, and cost management
3. Implement ongoing maintenance procedures for planning artifact updates
4. Begin project execution using these planning artifacts as the foundation
5. Capture lessons learned for continuous improvement of planning processes

Make this document specific to ${projectType} projects and ensure all work packages, dependencies, and schedules reflect realistic expectations for this project type.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    
    if (!content.includes('Detailed Project Planning Artifacts')) {
      throw new ExpectedError('Generated content does not appear to be a valid Detailed Planning Artifacts document');
    }

    // Validate that all three main sections are present
    const requiredSections = [
      'Work Breakdown Structure',
      'WBS Dictionary',
      'Schedule Network Diagram'
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        throw new ExpectedError(`Generated content is missing required section: ${section}`);
      }
    }
  }

  getRequiredContext(): string[] {
    return [
      'projectScope',
      'deliverables',
      'workPackages',
      'requirements',
      'stakeholders',
      'timeline',
      'resources',
      'dependencies'
    ];
  }

  getName(): string {
    return 'Detailed Project Planning Artifacts';
  }

  getDescription(): string {
    return 'Generates comprehensive integrated planning artifacts including WBS, WBS Dictionary, and Schedule Network Diagrams for granular project control';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDependencies(): string[] {
    return ['project-charter', 'stakeholder-register'];
  }
}