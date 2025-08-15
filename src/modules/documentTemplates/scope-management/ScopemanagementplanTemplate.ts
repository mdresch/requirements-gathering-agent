import type { ProjectContext } from '../../ai/types';

/**
 * Scope Management Plan Template generates the content for the Scope Management Plan document.
 */
export class ScopemanagementplanTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Scope Management Plan
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Project';
    const projectType = this.context.projectType || 'Application';
    const description = this.context.description || 'No description provided';

    return `# Scope Management Plan

## Project Overview
**Project Name:** ${projectName}
**Project Type:** ${projectType}
**Project Description:** ${description}

## Document Information
- **Version:** 1.0
- **Date:** ${new Date().toLocaleDateString()}
- **Prepared By:** Project Management Team
- **Approved By:** Project Sponsor

---

## Purpose and Objectives

### Purpose
This Scope Management Plan defines how the project scope will be planned, developed, monitored, verified, and controlled throughout the project lifecycle for the ${projectName} project. It provides the framework for managing scope-related activities and ensuring project deliverables meet stakeholder expectations.

### Objectives
- Establish clear processes for scope planning and definition
- Define procedures for scope verification and acceptance
- Implement effective scope change control mechanisms
- Ensure stakeholder alignment on project scope
- Prevent scope creep and manage scope changes systematically

---

## Scope Planning Process

### Scope Planning Activities
1. **Requirements Collection**
   - Stakeholder interviews and workshops
   - Requirements documentation and analysis
   - Requirements prioritization and validation
   - Requirements traceability establishment

2. **Scope Definition**
   - Project scope statement development
   - Work Breakdown Structure (WBS) creation
   - WBS dictionary preparation
   - Scope baseline establishment

3. **Acceptance Criteria Definition**
   - Deliverable acceptance criteria specification
   - Quality standards and metrics definition
   - Verification and validation procedures
   - Sign-off criteria establishment

### Scope Planning Inputs
- Project charter and business case
- Stakeholder requirements documentation
- Organizational process assets
- Enterprise environmental factors
- Expert judgment and historical data

### Scope Planning Outputs
- Project scope statement
- Work Breakdown Structure (WBS)
- WBS dictionary
- Scope baseline
- Requirements documentation

---

## Scope Definition Process

### Project Scope Statement
The project scope statement will include:

#### Product Scope Description
**In Scope:**
- Core ${projectType} functionality and features
- User interface and user experience components
- Integration with existing systems
- Data migration and conversion
- Testing and quality assurance activities
- Documentation and training materials
- Deployment and go-live support

**Explicit Exclusions (Out of Scope):**
The project scope statement will include comprehensive explicit exclusions organized by category:

- **Functional Exclusions:** Features or capabilities not implemented
- **Technical Exclusions:** Platforms, technologies, or integrations not supported  
- **Business Process Exclusions:** Organizational changes or training not covered
- **Data and Content Exclusions:** Migration or content creation tasks not included
- **Infrastructure Exclusions:** Hardware, network, or environment setup not provided
- **Support and Maintenance Exclusions:** Ongoing operational support not included
- **Future Phase Exclusions:** Enhancements planned for later releases

*Note: Detailed exclusions will be documented in the Project Scope Statement following the enhanced exclusion framework.*

#### Project Deliverables
1. **Analysis and Design Deliverables**
   - Requirements documentation
   - System architecture and design documents
   - Technical specifications
   - User interface mockups and prototypes

2. **Development Deliverables**
   - Source code and applications
   - Database schema and scripts
   - Configuration files and settings
   - Integration components

3. **Testing Deliverables**
   - Test plans and test cases
   - Test execution reports
   - Defect reports and resolution documentation
   - User acceptance testing artifacts

4. **Deployment Deliverables**
   - Installation and configuration guides
   - Production deployment scripts
   - Go-live support documentation
   - Rollback procedures

5. **Training and Support Deliverables**
   - User training materials and guides
   - Administrator documentation
   - Knowledge transfer sessions
   - Support transition documentation

#### Project Constraints
- **Time Constraints:** Project must be completed within [X] months
- **Budget Constraints:** Total project budget not to exceed $[X]
- **Resource Constraints:** Limited to [X] full-time team members
- **Technical Constraints:** Must integrate with existing [system] infrastructure
- **Regulatory Constraints:** Must comply with [relevant] compliance requirements

#### Project Assumptions
- Stakeholders will be available for requirements validation
- Existing infrastructure can support the new solution
- Third-party vendors will meet their commitments
- No major organizational changes during project execution
- Required resources will remain available throughout the project

---

## Work Breakdown Structure (WBS) Development

### WBS Development Process
1. **Top-Down Decomposition**
   - Start with project deliverables
   - Decompose into manageable work packages
   - Continue until appropriate level of detail achieved
   - Ensure 100% scope coverage

2. **WBS Structure Guidelines**
   - Each level represents increasing detail
   - Work packages should be 8-80 hours of effort
   - Each element should have clear deliverables
   - WBS should facilitate assignment of responsibility

### WBS Organization
The WBS will be organized using a deliverable-oriented structure:

**Level 1:** Project Name (${projectName})
**Level 2:** Major Deliverables
**Level 3:** Sub-deliverables
**Level 4:** Work Packages

### WBS Dictionary
For each WBS element, the following information will be documented:
- WBS element identifier and name
- Description of work to be performed
- Responsible organization/person
- Deliverables and acceptance criteria
- Dependencies and predecessor activities
- Resource requirements and duration estimates

---

## Requirements Management

### Requirements Collection Process
1. **Stakeholder Identification**
   - Identify all relevant stakeholders
   - Understand stakeholder roles and interests
   - Plan stakeholder engagement approach

2. **Requirements Elicitation**
   - Conduct stakeholder interviews
   - Facilitate requirements workshops
   - Use surveys and questionnaires
   - Analyze existing documentation

3. **Requirements Analysis**
   - Requirements prioritization (MoSCoW method)
   - Requirements validation and verification
   - Conflict resolution and negotiation
   - Impact analysis and feasibility assessment

4. **Requirements Documentation**
   - Functional requirements specification
   - Non-functional requirements definition
   - Business rules documentation
   - User stories and use cases

### Requirements Traceability
- Maintain requirements traceability matrix
- Link requirements to deliverables and test cases
- Track requirements through project lifecycle
- Manage requirements change impact

---

## Scope Verification Process

### Verification Activities
1. **Deliverable Review**
   - Technical review of deliverables
   - Quality assurance validation
   - Compliance and standards verification
   - Stakeholder review and feedback

2. **Acceptance Testing**
   - Unit testing and integration testing
   - System testing and performance testing
   - User acceptance testing (UAT)
   - Security and compliance testing

3. **Formal Acceptance**
   - Deliverable presentation to stakeholders
   - Acceptance criteria validation
   - Sign-off documentation
   - Acceptance certificate issuance

### Verification Criteria
- All functional requirements are implemented
- Non-functional requirements are met
- Quality standards are achieved
- Documentation is complete and accurate
- Training requirements are satisfied

### Verification Schedule
- **Phase-End Reviews:** At completion of each major phase
- **Deliverable Reviews:** For each major deliverable
- **Milestone Reviews:** At key project milestones
- **Final Acceptance:** Prior to project closure

---

## Scope Control Process

### Change Control Procedure
1. **Change Request Submission**
   - Formal change request documentation
   - Change impact analysis
   - Cost and schedule impact assessment
   - Risk assessment and mitigation

2. **Change Review and Approval**
   - Change control board review
   - Stakeholder impact assessment
   - Business case evaluation
   - Approval or rejection decision

3. **Change Implementation**
   - Scope baseline updates
   - Work plan modifications
   - Resource allocation adjustments
   - Communication to project team

### Change Control Board (CCB)
**Members:**
- Project Sponsor (Chairman)
- Project Manager
- Business Analyst
- Technical Lead
- Key Stakeholder Representatives

**Responsibilities:**
- Review and approve/reject change requests
- Assess change impact on project objectives
- Ensure proper change documentation
- Communicate decisions to stakeholders

### Scope Change Categories
- **Class 1 (Minor):** Changes within 5% of baseline scope
- **Class 2 (Major):** Changes between 5-15% of baseline scope  
- **Class 3 (Significant):** Changes exceeding 15% of baseline scope

---

## Exclusion Management Process

### Purpose
The exclusion management process ensures that all stakeholders understand what is explicitly NOT included in the project scope, preventing scope creep and managing expectations effectively.

### Exclusion Identification and Documentation
1. **Stakeholder Expectation Analysis**
   - Review stakeholder assumptions about project deliverables
   - Identify commonly expected features not in scope
   - Document potential areas of misunderstanding

2. **Exclusion Categorization**
   - **Functional Exclusions:** Features or capabilities not implemented
   - **Technical Exclusions:** Platforms, technologies, or integrations not supported
   - **Business Process Exclusions:** Organizational changes or training not covered
   - **Data and Content Exclusions:** Migration or content creation tasks not included
   - **Infrastructure Exclusions:** Hardware, network, or environment setup not provided
   - **Support and Maintenance Exclusions:** Ongoing operational support not included
   - **Future Phase Exclusions:** Enhancements planned for later releases

3. **Exclusion Communication**
   - Include exclusions in all scope documentation
   - Communicate exclusions during stakeholder meetings
   - Obtain stakeholder acknowledgment of exclusions
   - Reference exclusions in change control discussions

### Exclusion Review and Updates
- **Regular Review:** Review exclusions at each phase gate
- **Stakeholder Validation:** Confirm exclusions remain valid with stakeholders
- **Documentation Updates:** Update exclusion lists as project understanding evolves
- **Change Impact:** Assess how scope changes affect existing exclusions

### Change Request Documentation
- Change request identifier and title
- Description of proposed change
- Justification and business need
- Impact analysis (scope, time, cost, quality, risk)
- Recommended response
- Approval status and date

---

## Scope Performance Measurement

### Scope Metrics
1. **Scope Completion Metrics**
   - Percentage of requirements completed
   - Number of deliverables accepted
   - Scope baseline variance
   - Requirements volatility index

2. **Change Control Metrics**
   - Number of change requests submitted
   - Change request approval rate
   - Average change processing time
   - Scope creep percentage

3. **Quality Metrics**
   - Defect density per deliverable
   - First-time acceptance rate
   - Rework percentage
   - Customer satisfaction scores

### Reporting and Communication
- **Weekly Status Reports:** Scope progress and issues
- **Monthly Scope Reviews:** Detailed scope performance analysis
- **Change Control Reports:** Change request status and trends
- **Stakeholder Updates:** Scope-related communications

---

## Scope Governance

### Governance Structure
- **Project Sponsor:** Overall scope authority and approval
- **Project Manager:** Day-to-day scope management
- **Business Analyst:** Requirements and scope definition
- **Technical Lead:** Technical scope validation
- **Change Control Board:** Scope change decisions

### Scope Decision Authority
| Decision Type | Authority Level | Approver |
|---------------|----------------|----------|
| Minor scope clarifications | Project Manager | Project Manager |
| Requirements changes | Change Control Board | CCB Chairman |
| Major scope changes | Executive Level | Project Sponsor |
| Scope reduction | Steering Committee | Steering Committee |

### Escalation Procedures
1. **Level 1:** Project Manager resolution (within 2 days)
2. **Level 2:** Change Control Board review (within 1 week)  
3. **Level 3:** Project Sponsor decision (within 2 weeks)
4. **Level 4:** Steering Committee escalation (as needed)

---

## Risk Management for Scope

### Scope-Related Risks
1. **Requirements Risks**
   - Unclear or changing requirements
   - Conflicting stakeholder expectations
   - Missing or incomplete requirements
   - Requirements volatility

2. **Scope Control Risks**
   - Scope creep and uncontrolled changes
   - Inadequate change control process
   - Stakeholder pressure for additions
   - Gold plating and over-engineering

3. **Acceptance Risks**
   - Unclear acceptance criteria
   - Stakeholder unavailability for reviews
   - Quality issues affecting acceptance
   - Delayed acceptance decisions

### Risk Mitigation Strategies
- Implement robust requirements management process
- Establish clear change control procedures
- Maintain regular stakeholder communication
- Define clear acceptance criteria upfront
- Conduct regular scope reviews and validations

---

## Tools and Techniques

### Scope Management Tools
- **Requirements Management:** [Tool Name]
- **Work Breakdown Structure:** Microsoft Project / Visio
- **Change Control:** [Change Management System]
- **Document Management:** SharePoint / Confluence
- **Communication:** Email, meetings, dashboards

### Scope Management Techniques
- Interviews and workshops for requirements gathering
- Prototyping for requirements validation
- Decomposition for WBS development
- Inspection for scope verification
- Variance analysis for scope control

---

## Success Criteria

### Scope Management Success Factors
- All project deliverables meet acceptance criteria
- Scope changes are managed through formal process
- Stakeholder expectations are met and managed
- Project scope is completed within approved parameters
- Scope-related risks are identified and mitigated

### Key Performance Indicators
- **Scope Completion Rate:** 100% of approved scope delivered
- **Change Control Effectiveness:** >90% of changes properly managed
- **Stakeholder Satisfaction:** >95% satisfaction with scope delivery
- **Requirements Stability:** <10% requirements volatility
- **Acceptance Rate:** >95% first-time acceptance of deliverables

---

## Appendices

### A. Requirements Traceability Matrix Template
### B. Change Request Form Template  
### C. WBS Dictionary Template
### D. Acceptance Criteria Checklist
### E. Scope Verification Checklist

---

*This Scope Management Plan will be reviewed and updated as needed throughout the project lifecycle to ensure it remains current and effective for managing project scope.*`;
  }
}
