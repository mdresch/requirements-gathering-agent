import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Risk and Compliance Assessment
 * Provides comprehensive structure for integrated risk and compliance evaluation
 */
export class RiskComplianceAssessmentTemplate {
  private context: ProjectContext;

  constructor(context: ProjectContext) {
    this.context = context;
  }

  generateContent(): string {
    const projectName = this.context.projectName || 'Untitled Project';
    const projectType = this.context.projectType || 'Not specified';

    return `# Risk and Compliance Assessment

## Executive Summary

### Project Overview
- **Project Name**: ${projectName}
- **Project Type**: ${projectType}
- **Assessment Date**: [CURRENT_DATE]
- **Assessment Version**: 1.0
- **Prepared By**: Risk and Compliance Team

### Overall Assessment
- **Overall Risk Level**: [AI_TO_POPULATE - HIGH/MEDIUM/LOW]
- **Compliance Maturity**: [AI_TO_POPULATE - 1-5 SCALE]
- **Recommendation**: [AI_TO_POPULATE - PROCEED/PROCEED_WITH_CONDITIONS/REQUIRES_CHANGES]

### Key Findings
[AI_TO_POPULATE - 3-5 critical findings that require executive attention]

### Critical Actions Required
[AI_TO_POPULATE - Immediate actions needed before project can proceed]

---

## 1. Risk Assessment

### 1.1 Risk Identification and Analysis

#### Strategic Risks
| Risk ID | Risk Description | Probability | Impact | Risk Score | Priority | Owner | Mitigation Strategy |
|---------|------------------|-------------|---------|------------|----------|-------|-------------------|
| STR-001 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| STR-002 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| STR-003 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |

#### Operational Risks
| Risk ID | Risk Description | Probability | Impact | Risk Score | Priority | Owner | Mitigation Strategy |
|---------|------------------|-------------|---------|------------|----------|-------|-------------------|
| OPR-001 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| OPR-002 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| OPR-003 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |

#### Technical Risks
| Risk ID | Risk Description | Probability | Impact | Risk Score | Priority | Owner | Mitigation Strategy |
|---------|------------------|-------------|---------|------------|----------|-------|-------------------|
| TEC-001 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| TEC-002 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| TEC-003 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |

#### Financial Risks
| Risk ID | Risk Description | Probability | Impact | Risk Score | Priority | Owner | Mitigation Strategy |
|---------|------------------|-------------|---------|------------|----------|-------|-------------------|
| FIN-001 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| FIN-002 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| FIN-003 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |

#### Regulatory Risks
| Risk ID | Risk Description | Probability | Impact | Risk Score | Priority | Owner | Mitigation Strategy |
|---------|------------------|-------------|---------|------------|----------|-------|-------------------|
| REG-001 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| REG-002 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| REG-003 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |

#### Reputational Risks
| Risk ID | Risk Description | Probability | Impact | Risk Score | Priority | Owner | Mitigation Strategy |
|---------|------------------|-------------|---------|------------|----------|-------|-------------------|
| REP-001 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |
| REP-002 | [AI_TO_POPULATE] | [1-5] | [1-5] | [CALCULATED] | [HIGH/MEDIUM/LOW] | [ROLE] | [STRATEGY] |

### 1.2 Risk Prioritization Matrix

#### High Priority Risks (Risk Score 15-25)
[AI_TO_POPULATE - List of high priority risks requiring immediate attention]

#### Medium Priority Risks (Risk Score 8-14)
[AI_TO_POPULATE - List of medium priority risks requiring planned mitigation]

#### Low Priority Risks (Risk Score 1-7)
[AI_TO_POPULATE - List of low priority risks requiring monitoring]

### 1.3 Risk Response Strategies

#### Risk Avoidance Strategies
[AI_TO_POPULATE - Risks that should be avoided through project scope or approach changes]

#### Risk Mitigation Strategies
[AI_TO_POPULATE - Specific actions to reduce probability or impact of risks]

#### Risk Transfer Strategies
[AI_TO_POPULATE - Risks that can be transferred through insurance, contracts, or outsourcing]

#### Risk Acceptance Strategies
[AI_TO_POPULATE - Risks that will be accepted with contingency plans]

---

## 2. Compliance Assessment

### 2.1 PMBOK 7.0 Compliance Analysis

#### Performance Domains Assessment
| Performance Domain | Current Maturity | Target Maturity | Gap Analysis | Compliance Score | Action Required |
|-------------------|------------------|-----------------|--------------|------------------|-----------------|
| Stakeholders | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Team | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Development Approach | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Planning | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Project Work | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Delivery | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Measurement | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Uncertainty | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |

#### Project Management Principles Alignment
[AI_TO_POPULATE - Assessment of alignment with PMBOK principles]

#### Project Lifecycle Compliance
[AI_TO_POPULATE - Evaluation of project lifecycle adherence]

### 2.2 BABOK v3 Compliance Analysis (if applicable)

#### Knowledge Areas Assessment
| Knowledge Area | Current Maturity | Target Maturity | Gap Analysis | Compliance Score | Action Required |
|----------------|------------------|-----------------|--------------|------------------|-----------------|
| Business Analysis Planning | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Elicitation and Collaboration | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Requirements Lifecycle | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Strategy Analysis | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Requirements Analysis | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Solution Evaluation | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |

### 2.3 DMBOK 2.0 Compliance Analysis (if applicable)

#### Data Management Functions Assessment
| Function | Current Maturity | Target Maturity | Gap Analysis | Compliance Score | Action Required |
|----------|------------------|-----------------|--------------|------------------|-----------------|
| Data Governance | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Data Architecture | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Data Modeling | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Data Storage | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Data Security | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Data Integration | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |
| Data Quality | [1-5] | [1-5] | [DESCRIPTION] | [0-100%] | [ACTIONS] |

### 2.4 ISO 15408 Compliance Analysis (if applicable)

#### Security Evaluation Criteria Assessment
[AI_TO_POPULATE - Assessment of security evaluation requirements if applicable to project]

#### Evaluation Assurance Levels
[AI_TO_POPULATE - Analysis of required EAL levels and current capability]

---

## 3. Risk-Compliance Correlation Analysis

### 3.1 Compliance Gaps Creating Risks

#### High-Impact Correlations
| Compliance Gap | Related Risk | Risk Amplification | Mitigation Priority | Integrated Response |
|----------------|--------------|-------------------|-------------------|-------------------|
| [GAP] | [RISK_ID] | [DESCRIPTION] | [HIGH/MEDIUM/LOW] | [STRATEGY] |
| [GAP] | [RISK_ID] | [DESCRIPTION] | [HIGH/MEDIUM/LOW] | [STRATEGY] |

#### Medium-Impact Correlations
[AI_TO_POPULATE - Compliance gaps that moderately increase project risks]

#### Low-Impact Correlations
[AI_TO_POPULATE - Compliance gaps with minimal risk amplification]

### 3.2 Risk-Driven Compliance Requirements

#### Risks Requiring Enhanced Compliance
[AI_TO_POPULATE - Risks that necessitate stronger compliance measures]

#### Compliance Controls for Risk Mitigation
[AI_TO_POPULATE - How compliance measures can reduce identified risks]

---

## 4. Integrated Response Strategy

### 4.1 Combined Risk Mitigation and Compliance Remediation

#### Phase 1: Immediate Actions (0-30 days)
| Action | Type | Owner | Resources | Success Criteria | Risk/Compliance Impact |
|--------|------|-------|-----------|------------------|----------------------|
| [ACTION] | [RISK/COMPLIANCE/BOTH] | [ROLE] | [RESOURCES] | [CRITERIA] | [IMPACT] |

#### Phase 2: Short-term Implementation (1-3 months)
[AI_TO_POPULATE - Short-term actions for risk mitigation and compliance improvement]

#### Phase 3: Long-term Optimization (3-12 months)
[AI_TO_POPULATE - Long-term strategies for sustained risk management and compliance]

### 4.2 Resource Requirements

#### Human Resources
[AI_TO_POPULATE - Staffing requirements for implementation]

#### Financial Resources
[AI_TO_POPULATE - Budget requirements and cost-benefit analysis]

#### Technology Resources
[AI_TO_POPULATE - Technology and tool requirements]

### 4.3 Success Metrics and KPIs

#### Risk Management Metrics
[AI_TO_POPULATE - Metrics for measuring risk management effectiveness]

#### Compliance Metrics
[AI_TO_POPULATE - Metrics for measuring compliance improvement]

#### Integrated Metrics
[AI_TO_POPULATE - Combined metrics for overall assessment success]

---

## 5. Monitoring and Governance

### 5.1 Risk Monitoring Procedures

#### Risk Review Schedule
[AI_TO_POPULATE - Regular risk review and update procedures]

#### Risk Escalation Procedures
[AI_TO_POPULATE - When and how to escalate risk issues]

#### Risk Reporting Requirements
[AI_TO_POPULATE - Risk reporting formats and frequencies]

### 5.2 Compliance Monitoring Procedures

#### Compliance Review Schedule
[AI_TO_POPULATE - Regular compliance assessment procedures]

#### Compliance Audit Requirements
[AI_TO_POPULATE - Internal and external audit requirements]

#### Compliance Reporting Requirements
[AI_TO_POPULATE - Compliance reporting formats and frequencies]

### 5.3 Integrated Governance Framework

#### Governance Structure
[AI_TO_POPULATE - Roles and responsibilities for risk and compliance oversight]

#### Decision-Making Processes
[AI_TO_POPULATE - How risk and compliance decisions will be made]

#### Escalation Paths
[AI_TO_POPULATE - Escalation procedures for integrated issues]

---

## 6. Recommendations and Next Steps

### 6.1 Executive Recommendations

#### Immediate Decisions Required
[AI_TO_POPULATE - Decisions that executives must make immediately]

#### Strategic Recommendations
[AI_TO_POPULATE - Long-term strategic recommendations]

#### Investment Recommendations
[AI_TO_POPULATE - Recommended investments in risk and compliance capabilities]

### 6.2 Implementation Roadmap

#### 30-Day Action Plan
[AI_TO_POPULATE - Specific actions for the next 30 days]

#### 90-Day Milestones
[AI_TO_POPULATE - Key milestones for the next 90 days]

#### Annual Objectives
[AI_TO_POPULATE - Annual goals for risk and compliance improvement]

### 6.3 Success Factors

#### Critical Success Factors
[AI_TO_POPULATE - Factors critical to successful implementation]

#### Potential Obstacles
[AI_TO_POPULATE - Anticipated challenges and mitigation strategies]

#### Change Management Requirements
[AI_TO_POPULATE - Change management needs for successful adoption]

---

## 7. Appendices

### Appendix A: Risk Assessment Methodology
[AI_TO_POPULATE - Detailed methodology used for risk assessment]

### Appendix B: Compliance Standards Reference
[AI_TO_POPULATE - Reference materials for compliance standards]

### Appendix C: Risk and Compliance Templates
[AI_TO_POPULATE - Templates for ongoing risk and compliance management]

### Appendix D: Glossary of Terms
[AI_TO_POPULATE - Definitions of key risk and compliance terms]

---

**Document Control:**
- **Version**: 1.0
- **Last Updated**: [CURRENT_DATE]
- **Next Review**: [REVIEW_DATE]
- **Approved By**: [APPROVER]
- **Distribution**: [DISTRIBUTION_LIST]`;
  }
}