import type { ProjectContext } from '../../ai/types';

/**
 * Project Management Plan Template generates the content for the Project Management Plan document.
 */
export class ProjectmanagementplanTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Project Management Plan
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Project';
    const projectType = this.context.projectType || 'Application';
    const description = this.context.description || 'No description provided';

    return `# Project Management Plan

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

## Executive Summary

### Project Purpose
This Project Management Plan (PMP) defines the approach to be taken by the project team to deliver the ${projectName} project successfully. It establishes the framework for project execution, monitoring, and control throughout the project lifecycle.

### Project Objectives
- Deliver high-quality ${projectType} solution that meets stakeholder requirements
- Complete project within approved timeline and budget constraints
- Achieve stakeholder satisfaction and acceptance
- Establish sustainable operational processes

### Key Success Factors
- Clear stakeholder communication and engagement
- Effective risk identification and mitigation
- Quality deliverables that meet acceptance criteria
- Adherence to project governance and controls

---

## Project Scope Management

### Scope Statement
The project will deliver a comprehensive ${projectType} solution including:
- Requirements analysis and documentation
- Solution design and architecture
- Development and implementation
- Testing and quality assurance
- Deployment and go-live support
- Training and knowledge transfer

### Scope Management Process
1. **Scope Planning:** Define how scope will be managed throughout the project
2. **Scope Definition:** Develop detailed scope statement and WBS
3. **Scope Verification:** Formal acceptance of deliverables
4. **Scope Control:** Managing changes to project scope

### Work Breakdown Structure (WBS)
\`\`\`
1.0 ${projectName}
├── 1.1 Project Initiation
├── 1.2 Requirements Analysis
├── 1.3 Solution Design
├── 1.4 Development/Implementation
├── 1.5 Testing & Quality Assurance
├── 1.6 Deployment
├── 1.7 Training & Support
└── 1.8 Project Closure
\`\`\`

---

## Time Management

### Project Schedule Management Approach
- **Methodology:** Agile/Waterfall hybrid approach
- **Scheduling Tool:** Microsoft Project / Jira
- **Reporting Frequency:** Weekly status updates, monthly executive reports

### Key Milestones
| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| Project Kickoff | Week 1 | Official project start and team mobilization |
| Requirements Approval | Week 4 | Stakeholder sign-off on requirements |
| Design Approval | Week 8 | Technical architecture and design approval |
| Development Complete | Week 16 | Code complete and ready for testing |
| User Acceptance Testing | Week 18 | UAT completion and sign-off |
| Go-Live | Week 20 | Production deployment and go-live |
| Project Closure | Week 22 | Final deliverables and project closure |

### Schedule Control Process
- Weekly progress reviews and updates
- Critical path analysis and monitoring
- Early identification of schedule risks
- Change control for schedule modifications

---

## Cost Management

### Budget Overview
| Category | Estimated Cost | Description |
|----------|----------------|-------------|
| Personnel | 60% | Team salaries and contractor costs |
| Technology | 25% | Software licenses, hardware, infrastructure |
| Training | 10% | Team training and user training |
| Contingency | 5% | Risk mitigation and unforeseen costs |

### Cost Control Process
- Monthly budget reviews and variance analysis
- Earned value management tracking
- Change control for budget modifications
- Regular financial reporting to stakeholders

---

## Quality Management

### Quality Objectives
- Zero critical defects in production
- User acceptance rate > 95%
- Performance requirements met
- Security and compliance standards achieved

### Quality Assurance Process
1. **Quality Planning:** Define quality standards and metrics
2. **Quality Assurance:** Process audits and reviews
3. **Quality Control:** Testing, inspections, and defect management
4. **Continuous Improvement:** Lessons learned and process optimization

### Quality Control Activities
- Code reviews and static analysis
- Unit, integration, and system testing
- User acceptance testing
- Performance and security testing
- Documentation reviews

---

## Human Resource Management

### Project Organization Structure
\`\`\`
Project Sponsor
├── Project Manager
    ├── Technical Lead
    │   ├── Development Team
    │   └── QA Team
    ├── Business Analyst
    └── Support Roles
        ├── DevOps Engineer
        └── Training Coordinator
\`\`\`

### Roles and Responsibilities
- **Project Sponsor:** Strategic direction, funding, issue escalation
- **Project Manager:** Day-to-day management, coordination, reporting
- **Technical Lead:** Architecture, technical decisions, team guidance
- **Development Team:** Solution implementation and delivery
- **Business Analyst:** Requirements, stakeholder liaison, acceptance testing
- **QA Team:** Testing strategy, execution, and quality validation

### Resource Management
- Team acquisition and onboarding process
- Skills assessment and training plans
- Performance management and recognition
- Team development activities

---

## Communications Management

### Communication Matrix
| Stakeholder Group | Information Needs | Frequency | Method |
|-------------------|-------------------|-----------|---------|
| Project Sponsor | High-level status, issues, decisions | Weekly | Status report, meetings |
| Steering Committee | Progress, risks, budget | Monthly | Dashboard, presentations |
| Project Team | Tasks, dependencies, issues | Daily | Standups, collaboration tools |
| End Users | Progress, training, change impact | Bi-weekly | Newsletters, demos |

### Communication Channels
- **Project Portal:** Central repository for documents and status
- **Team Collaboration:** Slack/Teams for daily communication
- **Formal Reporting:** Email and presentation deliverables
- **Meeting Cadence:** Daily standups, weekly status, monthly steering

---

## Risk Management

### Risk Management Strategy
- **Risk Tolerance:** Moderate risk appetite with proactive mitigation
- **Risk Categories:** Technical, resource, schedule, budget, external
- **Risk Assessment:** Probability and impact matrix (1-5 scale)
- **Risk Response:** Avoid, mitigate, transfer, or accept

### Top Project Risks
| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Resource unavailability | Medium | High | Cross-training, backup resources |
| Technical complexity | High | Medium | Proof of concepts, expert consultation |
| Scope creep | Medium | Medium | Change control process, stakeholder management |
| Integration challenges | Medium | High | Early integration testing, technical reviews |

### Risk Monitoring and Control
- Weekly risk register updates
- Monthly risk assessment meetings
- Escalation procedures for high-impact risks
- Risk response plan execution tracking

---

## Procurement Management

### Procurement Strategy
- **Make vs. Buy Analysis:** Evaluate internal capabilities vs. external options
- **Vendor Selection:** Competitive bidding for major procurements
- **Contract Management:** Clear SOW, SLA, and performance metrics
- **Vendor Oversight:** Regular performance reviews and relationship management

### Key Procurements
- Development tools and software licenses
- Third-party components and services
- Infrastructure and hosting services
- Training and consulting services

---

## Stakeholder Management

### Stakeholder Analysis
| Stakeholder | Influence | Interest | Engagement Strategy |
|-------------|-----------|----------|-------------------|
| Project Sponsor | High | High | Regular updates, involve in decisions |
| End Users | Medium | High | Frequent communication, training |
| IT Operations | Medium | Medium | Collaboration, requirements gathering |
| Executive Team | High | Medium | Executive summaries, milestone updates |

### Stakeholder Engagement Plan
- Stakeholder identification and analysis
- Communication and engagement strategies
- Regular stakeholder satisfaction surveys
- Issue resolution and feedback incorporation

---

## Integration Management

### Project Integration Approach
- **Unified Project Management:** Single PMO oversight and control
- **Integrated Planning:** Coordinated planning across all knowledge areas
- **Change Management:** Integrated change control process
- **Knowledge Management:** Centralized documentation and lessons learned

### Integration Touchpoints
- Cross-functional team meetings
- Integrated testing and validation
- Coordinated deployment activities
- Unified project reporting

---

## Project Controls and Governance

### Governance Structure
- **Steering Committee:** Strategic oversight and decision-making
- **Project Management Office (PMO):** Standards, processes, and support
- **Change Control Board:** Scope, schedule, and budget change approval
- **Quality Review Board:** Quality standards and acceptance criteria

### Control Processes
- **Progress Monitoring:** Weekly status reports and dashboards
- **Performance Measurement:** Earned value analysis and KPI tracking
- **Issue Management:** Issue log, escalation, and resolution tracking
- **Change Control:** Formal change request and approval process

### Reporting and Metrics
- Project dashboard with key performance indicators
- Weekly status reports to stakeholders
- Monthly executive summaries
- Exception reports for issues and risks

---

## Project Lifecycle and Methodology

### Project Phases
1. **Initiation:** Charter approval, team formation, initial planning
2. **Planning:** Detailed project planning and baseline establishment
3. **Execution:** Solution development and implementation
4. **Monitoring & Control:** Progress tracking and corrective actions
5. **Closure:** Final deliverables, lessons learned, and transition

### Development Methodology
- **Approach:** Agile development with waterfall oversight
- **Sprint Planning:** 2-week sprints with defined deliverables
- **Reviews:** Sprint reviews, retrospectives, and stakeholder demos
- **Continuous Integration:** Automated build and deployment pipeline

---

## Success Criteria and Acceptance

### Project Success Criteria
- **Schedule:** Delivery within approved timeline (±5% tolerance)
- **Budget:** Completion within approved budget (±5% tolerance)
- **Quality:** All acceptance criteria met with zero critical defects
- **Stakeholder Satisfaction:** >90% satisfaction score

### Acceptance Process
- Deliverable-specific acceptance criteria
- Formal sign-off procedures
- User acceptance testing protocols
- Final project acceptance ceremony

---

## Project Closure Plan

### Closure Activities
- Final deliverable verification and acceptance
- Project performance evaluation and lessons learned
- Resource release and team recognition
- Administrative closure and archiving
- Transition to operations and maintenance

### Post-Project Support
- Warranty period and defect resolution
- Knowledge transfer to operations team
- User support and training continuation
- Performance monitoring and optimization

---

## Appendices

### A. Project Charter
- Reference to approved project charter document

### B. Stakeholder Register
- Detailed stakeholder contact information and roles

### C. Risk Register
- Complete risk assessment and mitigation plans

### D. Communication Plan
- Detailed communication matrix and procedures

### E. Quality Management Plan
- Quality standards, processes, and metrics

---

*This Project Management Plan is a living document that will be updated throughout the project lifecycle to reflect current project status and any approved changes.*`;
  }
}
