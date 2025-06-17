import type { ProjectContext } from '../../ai/types';

/**
 * Risk Management Plan Template generates the content for the Risk Management Plan document.
 */
export class RiskmanagementplanTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Risk Management Plan
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Project';
    const projectType = this.context.projectType || 'Application';
    const description = this.context.description || 'No description provided';

    return `# Risk Management Plan

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

### Purpose
This Risk Management Plan defines how risks will be identified, analyzed, responded to, and monitored throughout the ${projectName} project lifecycle. It establishes the framework for proactive risk management to maximize positive outcomes and minimize negative impacts on project objectives.

### Risk Management Objectives
- Identify and assess potential project risks early and continuously
- Develop appropriate response strategies for identified risks
- Monitor and control risks throughout the project lifecycle
- Maintain risk awareness and communication among stakeholders
- Improve project success probability through proactive risk management

---

## Risk Management Strategy

### Risk Management Approach
The project will implement a proactive, systematic approach to risk management based on PMBOK standards:

1. **Risk Planning:** Establish risk management framework and processes
2. **Risk Identification:** Continuously identify potential project risks
3. **Risk Analysis:** Assess probability and impact of identified risks
4. **Risk Response Planning:** Develop strategies to address risks
5. **Risk Response Implementation:** Execute planned risk responses
6. **Risk Monitoring:** Track identified risks and identify new risks

### Risk Tolerance and Thresholds
- **Risk Appetite:** Moderate risk tolerance with focus on project success
- **Risk Threshold:** Risks with High probability AND High impact require immediate attention
- **Escalation Criteria:** Risks exceeding project manager authority escalated to sponsor
- **Acceptable Risk Levels:** Low and Medium risks managed at project level

---

## Risk Categories and Breakdown Structure

### Risk Breakdown Structure (RBS)
\`\`\`
Project Risks
├── Technical Risks
│   ├── Technology and Architecture
│   ├── Integration and Interfaces
│   ├── Performance and Scalability
│   └── Security and Compliance
├── Management Risks
│   ├── Scope and Requirements
│   ├── Schedule and Timeline
│   ├── Budget and Resources
│   └── Communication and Stakeholder
├── External Risks
│   ├── Vendor and Supplier
│   ├── Regulatory and Compliance
│   ├── Market and Business
│   └── Environmental and Infrastructure
└── Organizational Risks
    ├── Resource Availability
    ├── Skills and Competency
    ├── Process and Methodology
    └── Cultural and Change Management
\`\`\`

### Risk Category Definitions

#### Technical Risks
- **Technology Risks:** Unproven or complex technologies, technical feasibility
- **Architecture Risks:** System design flaws, scalability limitations
- **Integration Risks:** Interface failures, data compatibility issues
- **Performance Risks:** System performance below requirements
- **Security Risks:** Vulnerabilities, compliance violations

#### Management Risks
- **Scope Risks:** Unclear requirements, scope creep, requirement changes
- **Schedule Risks:** Unrealistic timelines, dependency delays, resource conflicts
- **Budget Risks:** Cost overruns, funding shortfalls, estimation errors
- **Communication Risks:** Poor stakeholder engagement, information gaps

#### External Risks
- **Vendor Risks:** Supplier failures, vendor capability limitations
- **Regulatory Risks:** Compliance requirement changes, regulatory delays
- **Market Risks:** Business environment changes, competitive pressures
- **Infrastructure Risks:** Network outages, facility issues

#### Organizational Risks
- **Resource Risks:** Key person unavailability, skill shortages
- **Process Risks:** Inadequate processes, methodology failures
- **Change Risks:** Resistance to change, cultural barriers
- **Organizational Risks:** Restructuring, priority changes

---

## Risk Analysis Framework

### Probability Scale
| Rating | Probability | Description |
|--------|-------------|-------------|
| 1 | Very Low (1-10%) | Risk is very unlikely to occur |
| 2 | Low (11-30%) | Risk has low probability of occurring |
| 3 | Medium (31-50%) | Risk has moderate probability of occurring |
| 4 | High (51-80%) | Risk is likely to occur |
| 5 | Very High (81-100%) | Risk is almost certain to occur |

### Impact Scale
| Rating | Impact Level | Cost Impact | Schedule Impact | Quality Impact |
|--------|--------------|-------------|-----------------|----------------|
| 1 | Very Low | <2% budget increase | <1 week delay | Minor quality degradation |
| 2 | Low | 2-5% budget increase | 1-2 weeks delay | Some quality impacts |
| 3 | Medium | 5-10% budget increase | 2-4 weeks delay | Moderate quality impacts |
| 4 | High | 10-20% budget increase | 1-2 months delay | Significant quality impacts |
| 5 | Very High | >20% budget increase | >2 months delay | Unacceptable quality impacts |

### Risk Score Calculation
**Risk Score = Probability × Impact**

### Risk Priority Matrix
| Risk Score | Priority Level | Response Required |
|------------|----------------|-------------------|
| 1-4 | Low | Monitor and accept |
| 5-9 | Medium | Develop response plan |
| 10-15 | High | Immediate action required |
| 16-25 | Critical | Executive escalation required |

---

## Risk Identification Process

### Risk Identification Techniques
1. **Brainstorming Sessions**
   - Team workshops and facilitated sessions
   - Cross-functional perspective gathering
   - Creative thinking and idea generation

2. **Expert Interviews**
   - Subject matter expert consultations
   - Lessons learned from similar projects
   - Industry best practice reviews

3. **Documentation Review**
   - Project documents and plans analysis
   - Historical project data review
   - Organizational process assets review

4. **Checklist Analysis**
   - Risk category checklist review
   - Industry-specific risk checklists
   - Organizational risk databases

5. **Assumption Analysis**
   - Project assumption validation
   - Assumption risk assessment
   - Scenario analysis and what-if reviews

### Risk Identification Schedule
- **Project Initiation:** Initial risk identification workshop
- **Planning Phase:** Detailed risk analysis and documentation
- **Execution Phase:** Weekly risk identification reviews
- **Monitoring Phase:** Continuous risk monitoring and identification
- **Key Milestones:** Formal risk reassessment at major milestones

### Risk Documentation Requirements
- Risk identifier and title
- Risk description and context
- Risk category and source
- Probability and impact assessment
- Risk triggers and warning signs
- Potential risk responses
- Risk owner assignment

---

## Risk Response Strategies

### Threat Response Strategies
1. **Avoid**
   - Eliminate the risk by changing project approach
   - Remove risk causes or conditions
   - Modify project scope or methodology

2. **Mitigate**
   - Reduce probability of risk occurrence
   - Minimize impact if risk occurs
   - Implement preventive measures

3. **Transfer**
   - Shift risk responsibility to third party
   - Insurance, contracts, or outsourcing
   - Risk sharing arrangements

4. **Accept**
   - Acknowledge risk but take no action
   - Passive acceptance with no contingency
   - Active acceptance with contingency reserves

### Opportunity Response Strategies
1. **Exploit**
   - Ensure opportunity realization
   - Assign best resources to opportunity
   - Enhance probability of occurrence

2. **Enhance**
   - Increase probability or impact
   - Facilitate opportunity triggers
   - Strengthen opportunity benefits

3. **Share**
   - Partner with others to realize opportunity
   - Joint ventures or partnerships
   - Shared benefits and risks

4. **Accept**
   - Take advantage if opportunity occurs
   - No proactive action required
   - Passive opportunity monitoring

### Response Planning Criteria
- Cost-effectiveness of response
- Feasibility and practicality
- Impact on other project objectives
- Stakeholder acceptance
- Resource availability
- Timing considerations

---

## Risk Monitoring and Control

### Risk Monitoring Process
1. **Risk Register Maintenance**
   - Regular risk register updates
   - Risk status tracking and reporting
   - New risk identification and documentation

2. **Risk Reassessment**
   - Periodic probability and impact review
   - Risk priority recalculation
   - Response strategy effectiveness evaluation

3. **Risk Trigger Monitoring**
   - Early warning sign identification
   - Trigger condition monitoring
   - Proactive response activation

4. **Risk Response Implementation**
   - Response plan execution tracking
   - Resource allocation for responses
   - Response effectiveness measurement

### Risk Reporting and Communication
- **Weekly Risk Reports:** High and critical risks status
- **Monthly Risk Reviews:** Complete risk register review
- **Quarterly Risk Assessments:** Comprehensive risk analysis
- **Executive Risk Dashboards:** Key risk metrics and trends

### Risk Metrics and KPIs
- Number of identified risks by category
- Risk exposure trends over time
- Response plan implementation rate
- Risk occurrence vs. predicted probability
- Cost and schedule impact of realized risks

---

## Roles and Responsibilities

### Risk Management Organization
| Role | Responsibilities |
|------|-----------------|
| **Project Sponsor** | Risk policy approval, escalation decisions, resource authorization |
| **Project Manager** | Overall risk management accountability, risk planning and monitoring |
| **Risk Manager** | Risk process facilitation, risk analysis, reporting coordination |
| **Technical Lead** | Technical risk identification, impact assessment, response planning |
| **Team Members** | Risk identification, response implementation, status reporting |
| **Stakeholders** | Risk communication, acceptance decisions, feedback provision |

### Risk Ownership
- Each identified risk assigned to specific risk owner
- Risk owner responsible for monitoring and response
- Clear escalation path for risk owner decisions
- Regular risk owner reporting requirements

### Risk Management Team Structure
- **Risk Steering Committee:** Strategic risk oversight
- **Risk Management Team:** Operational risk management
- **Risk Champions:** Departmental risk coordination
- **Project Team:** Day-to-day risk activities

---

## Risk Management Tools and Techniques

### Risk Management Tools
- **Risk Register:** Central repository for all project risks
- **Risk Dashboard:** Visual risk status and trends
- **Risk Analysis Software:** Quantitative risk analysis tools
- **Communication Tools:** Risk reporting and collaboration platforms

### Risk Analysis Techniques
- **Qualitative Analysis:** Probability and impact assessment
- **Quantitative Analysis:** Monte Carlo simulation, decision trees
- **Sensitivity Analysis:** Impact of individual risks
- **Expected Monetary Value:** Risk-adjusted financial analysis

### Risk Documentation Templates
- Risk register template
- Risk assessment forms
- Risk response plans
- Risk monitoring checklists

---

## Risk Management Schedule and Budget

### Risk Management Activities Timeline
| Phase | Activities | Timeline |
|-------|------------|----------|
| **Initiation** | Risk management planning, initial identification | Weeks 1-2 |
| **Planning** | Detailed risk analysis, response planning | Weeks 3-4 |
| **Execution** | Risk monitoring, response implementation | Ongoing |
| **Monitoring** | Risk tracking, reporting, reassessment | Weekly/Monthly |
| **Closure** | Risk lessons learned, documentation update | Final week |

### Risk Management Budget
- **Risk Management Activities:** 2-3% of total project budget
- **Risk Response Implementation:** 5-10% contingency reserve
- **Risk Monitoring Tools:** Included in project management costs
- **Training and Development:** 1% of project budget

### Resource Allocation
- Project Manager: 20% time allocation for risk management
- Risk Manager: 100% dedicated to risk activities (if applicable)
- Team Members: 5-10% time for risk identification and response
- Subject Matter Experts: As needed for risk analysis

---

## Risk Register Template

### Risk Register Fields
| Field | Description |
|-------|-------------|
| Risk ID | Unique risk identifier |
| Risk Title | Brief descriptive name |
| Risk Description | Detailed risk description |
| Risk Category | RBS category classification |
| Probability | Likelihood of occurrence (1-5) |
| Impact | Consequence severity (1-5) |
| Risk Score | Probability × Impact |
| Priority | Low/Medium/High/Critical |
| Risk Triggers | Early warning indicators |
| Risk Owner | Person responsible for risk |
| Response Strategy | Avoid/Mitigate/Transfer/Accept |
| Response Actions | Specific response activities |
| Response Owner | Person responsible for response |
| Target Date | Response completion date |
| Status | Open/In Progress/Closed |
| Residual Risk | Risk level after response |

### Sample Risk Register Entries

#### Risk #001: Technical Integration Complexity
- **Category:** Technical - Integration
- **Description:** Integration with legacy systems may be more complex than anticipated
- **Probability:** 4 (High)
- **Impact:** 4 (High)
- **Risk Score:** 16 (Critical)
- **Response:** Mitigate - Conduct proof of concept, engage integration specialists
- **Owner:** Technical Lead

#### Risk #002: Key Resource Unavailability
- **Category:** Organizational - Resource
- **Description:** Key team members may become unavailable due to competing priorities
- **Probability:** 3 (Medium)
- **Impact:** 4 (High)
- **Risk Score:** 12 (High)
- **Response:** Mitigate - Cross-train team members, identify backup resources
- **Owner:** Project Manager

---

## Risk Communication Plan

### Communication Matrix
| Audience | Information | Frequency | Method |
|----------|-------------|-----------|---------|
| Project Sponsor | High/Critical risks, escalations | Weekly | Status report, meetings |
| Steering Committee | Risk summary, trends, major issues | Monthly | Dashboard, presentations |
| Project Team | All risks, action items, updates | Weekly | Team meetings, risk register |
| Stakeholders | Relevant risks, impacts, responses | Bi-weekly | Newsletters, briefings |

### Escalation Procedures
1. **Level 1:** Project Manager manages Medium risks
2. **Level 2:** Project Sponsor handles High risks
3. **Level 3:** Steering Committee addresses Critical risks
4. **Level 4:** Executive escalation for program-level risks

### Risk Communication Guidelines
- Use clear, non-technical language for executive reporting
- Focus on business impact and required decisions
- Provide recommended actions and alternatives
- Include risk trends and predictive analysis
- Maintain transparency while managing stakeholder concerns

---

## Risk Management Success Criteria

### Success Metrics
- **Risk Identification:** 100% of major risks identified before impact
- **Risk Response:** 90% of planned responses implemented on time
- **Risk Communication:** 95% stakeholder satisfaction with risk reporting
- **Risk Impact:** <5% project variance due to risk events
- **Process Adherence:** 100% compliance with risk management procedures

### Risk Management Maturity
- **Level 1:** Ad-hoc risk identification and response
- **Level 2:** Structured risk management process implementation  
- **Level 3:** Integrated risk management across project lifecycle
- **Level 4:** Predictive risk management with advanced analytics
- **Level 5:** Optimized risk management with continuous improvement

---

## Lessons Learned and Continuous Improvement

### Lessons Learned Process
- Regular risk management effectiveness reviews
- Post-incident analysis and improvement identification
- Best practice documentation and sharing
- Risk management process refinement

### Continuous Improvement Activities
- Risk management training and development
- Process optimization based on feedback
- Tool and technique enhancement
- Organizational risk capability building

---

## Appendices

### A. Risk Register Template
### B. Risk Assessment Forms
### C. Risk Response Plan Templates
### D. Risk Monitoring Checklists
### E. Risk Communication Templates
### F. Risk Management Procedures
### G. Risk Category Definitions
### H. Probability and Impact Scales

---

*This Risk Management Plan will be reviewed and updated throughout the project lifecycle to ensure it remains effective and relevant for managing project risks.*`;
  }
}
