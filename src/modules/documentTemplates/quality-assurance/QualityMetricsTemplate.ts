import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Quality Metrics document.
 * Provides a structured fallback template when AI generation fails.
 */
export class QualityMetricsTemplate {
  generate(context: ProjectContext): string {
    const projectName = context.projectName || 'Unnamed Project';
    const currentDate = new Date().toLocaleDateString();

    return `# Quality Metrics Framework

**Project:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${currentDate}  
**Status:** Draft

## 1. Quality Metrics Overview

### 1.1 Purpose
This document defines the quality metrics framework for the ${projectName} project. It establishes measurable criteria for assessing product quality, process effectiveness, and overall project success.

### 1.2 Objectives
- Establish clear, measurable quality criteria and targets
- Enable data-driven quality decision making
- Provide early warning indicators for quality issues
- Support continuous improvement initiatives
- Ensure stakeholder quality expectations are met

### 1.3 Metrics Framework
The quality metrics framework consists of four primary categories:
- **Process Quality Metrics:** Measure the effectiveness of development and testing processes
- **Product Quality Metrics:** Assess the quality of deliverables and system components
- **Defect Quality Metrics:** Track defect patterns, resolution, and prevention
- **Customer Quality Metrics:** Measure user satisfaction and production system performance

### 1.4 Success Criteria
- **Overall Quality Goal:** 95% customer satisfaction with delivered system
- **Defect Quality Target:** Less than 2 critical defects per 1000 lines of code
- **Performance Target:** 99.9% system availability during business hours
- **Process Efficiency Target:** 90% adherence to defined development processes

## 2. Process Quality Metrics

### 2.1 Development Process Metrics

#### Code Review Effectiveness
- **Metric:** Percentage of defects caught during code review
- **Formula:** (Defects found in code review / Total defects) × 100
- **Target:** ≥ 60% of defects caught during code review
- **Collection Method:** Automated tracking through code review tools
- **Reporting Frequency:** Weekly

#### Code Quality Index
- **Metric:** Composite score based on cyclomatic complexity, code coverage, and technical debt
- **Formula:** Weighted average of complexity (30%), coverage (40%), and debt (30%)
- **Target:** Quality index ≥ 80/100
- **Collection Method:** Static code analysis tools (SonarQube, CodeClimate)
- **Reporting Frequency:** Daily

#### Development Velocity
- **Metric:** Story points completed per sprint
- **Formula:** Sum of completed story points per iteration
- **Target:** 80-120% of planned velocity (consistent delivery)
- **Collection Method:** Project management tools (Jira, Azure DevOps)
- **Reporting Frequency:** Per sprint

#### Process Compliance Rate
- **Metric:** Percentage of deliverables following defined processes
- **Formula:** (Compliant deliverables / Total deliverables) × 100
- **Target:** ≥ 95% process compliance
- **Collection Method:** Manual checklist review and automated checks
- **Reporting Frequency:** Monthly

### 2.2 Testing Process Metrics

#### Test Execution Effectiveness
- **Metric:** Percentage of planned tests executed on schedule
- **Formula:** (Tests executed on time / Total planned tests) × 100
- **Target:** ≥ 95% tests executed as planned
- **Collection Method:** Test management tools
- **Reporting Frequency:** Daily during testing phases

#### Test Coverage Metrics
- **Metric:** Code coverage percentage by test type
- **Targets:**
  - Unit test coverage: ≥ 80%
  - Integration test coverage: ≥ 70%
  - System test coverage: ≥ 90% of requirements
- **Collection Method:** Coverage analysis tools
- **Reporting Frequency:** Daily

#### Defect Detection Efficiency
- **Metric:** Percentage of defects found before production
- **Formula:** (Pre-production defects / Total defects) × 100
- **Target:** ≥ 95% defects caught before production
- **Collection Method:** Defect tracking tools
- **Reporting Frequency:** Weekly

#### Test Automation Coverage
- **Metric:** Percentage of test cases automated
- **Formula:** (Automated test cases / Total test cases) × 100
- **Target:** ≥ 70% regression tests automated
- **Collection Method:** Test automation frameworks
- **Reporting Frequency:** Monthly

## 3. Product Quality Metrics

### 3.1 Functional Quality Metrics

#### Requirements Coverage
- **Metric:** Percentage of requirements with test cases
- **Formula:** (Requirements with tests / Total requirements) × 100
- **Target:** 100% critical requirements, 95% all requirements
- **Collection Method:** Requirements traceability matrix
- **Reporting Frequency:** Weekly

#### Feature Completeness
- **Metric:** Percentage of planned features delivered
- **Formula:** (Delivered features / Planned features) × 100
- **Target:** ≥ 95% of planned features delivered
- **Collection Method:** Feature tracking and acceptance criteria
- **Reporting Frequency:** Per iteration

#### User Story Acceptance Rate
- **Metric:** Percentage of user stories accepted on first review
- **Formula:** (Stories accepted first time / Total stories) × 100
- **Target:** ≥ 85% first-time acceptance rate
- **Collection Method:** User acceptance testing results
- **Reporting Frequency:** Per iteration

### 3.2 Technical Quality Metrics

#### System Performance
- **Response Time:** Average response time for key transactions
- **Target:** < 2 seconds for 95% of user transactions
- **Throughput:** Transactions processed per second
- **Target:** ≥ 100 transactions per second
- **Collection Method:** Application performance monitoring tools
- **Reporting Frequency:** Continuous monitoring, weekly reports

#### System Reliability
- **Availability:** System uptime percentage
- **Target:** 99.9% availability during business hours
- **Mean Time Between Failures (MTBF):** Average time between system failures
- **Target:** ≥ 720 hours (30 days)
- **Collection Method:** System monitoring and incident tracking
- **Reporting Frequency:** Daily

#### Security Quality
- **Vulnerability Score:** Number and severity of security vulnerabilities
- **Target:** 0 critical vulnerabilities, < 5 high severity vulnerabilities
- **Security Test Coverage:** Percentage of security requirements tested
- **Target:** 100% security requirements tested
- **Collection Method:** Security scanning tools and penetration testing
- **Reporting Frequency:** Weekly

## 4. Defect Quality Metrics

### 4.1 Defect Discovery Metrics

#### Defect Density
- **Metric:** Number of defects per thousand lines of code (KLOC)
- **Formula:** Total defects / (Lines of code / 1000)
- **Targets:**
  - Critical defects: < 2 per KLOC
  - High defects: < 5 per KLOC
  - Total defects: < 20 per KLOC
- **Collection Method:** Defect tracking and code analysis tools
- **Reporting Frequency:** Weekly

#### Defect Detection Rate
- **Metric:** Defects found per phase of development
- **Targets:**
  - Unit testing: 40-50% of total defects
  - Integration testing: 25-30% of total defects
  - System testing: 15-20% of total defects
  - User acceptance testing: < 10% of total defects
- **Collection Method:** Defect tracking with phase tagging
- **Reporting Frequency:** Weekly

#### Defect Severity Distribution
- **Metric:** Percentage breakdown of defects by severity
- **Target Distribution:**
  - Critical: < 5%
  - High: < 15%
  - Medium: 40-60%
  - Low: 25-40%
- **Collection Method:** Defect classification in tracking tools
- **Reporting Frequency:** Weekly

### 4.2 Defect Resolution Metrics

#### Defect Resolution Time
- **Metric:** Average time to resolve defects by severity
- **Targets:**
  - Critical: < 4 hours
  - High: < 24 hours
  - Medium: < 72 hours
  - Low: < 168 hours (1 week)
- **Collection Method:** Defect lifecycle tracking
- **Reporting Frequency:** Daily for critical/high, weekly for others

#### Defect Fix Rate
- **Metric:** Percentage of defects fixed vs. reported
- **Formula:** (Fixed defects / Reported defects) × 100
- **Target:** ≥ 95% of defects fixed before release
- **Collection Method:** Defect status tracking
- **Reporting Frequency:** Weekly

#### Defect Reopening Rate
- **Metric:** Percentage of defects reopened after initial fix
- **Formula:** (Reopened defects / Fixed defects) × 100
- **Target:** < 10% defect reopening rate
- **Collection Method:** Defect status change tracking
- **Reporting Frequency:** Weekly

### 4.3 Defect Prevention Metrics

#### Defect Escape Rate
- **Metric:** Percentage of defects found in production
- **Formula:** (Production defects / Total defects) × 100
- **Target:** < 5% defects escape to production
- **Collection Method:** Production incident tracking vs. pre-production defects
- **Reporting Frequency:** Monthly

#### Root Cause Analysis Effectiveness
- **Metric:** Percentage of defects with identified root causes
- **Formula:** (Defects with RCA / Critical + High defects) × 100
- **Target:** 100% of critical and high severity defects have RCA
- **Collection Method:** RCA documentation tracking
- **Reporting Frequency:** Monthly

## 5. Customer Quality Metrics

### 5.1 User Satisfaction Metrics

#### User Acceptance Test Results
- **Metric:** Percentage of UAT scenarios passing
- **Formula:** (Passed UAT scenarios / Total UAT scenarios) × 100
- **Target:** ≥ 95% UAT scenarios pass
- **Collection Method:** UAT execution tracking
- **Reporting Frequency:** Per UAT cycle

#### Customer Satisfaction Score
- **Metric:** Average customer satisfaction rating (1-10 scale)
- **Target:** ≥ 8.0 average satisfaction score
- **Collection Method:** Customer surveys and feedback forms
- **Reporting Frequency:** Monthly

#### System Usability Score
- **Metric:** System Usability Scale (SUS) score
- **Target:** ≥ 80 SUS score (good usability)
- **Collection Method:** Usability testing and user surveys
- **Reporting Frequency:** Per major release

### 5.2 Production Quality Metrics

#### System Availability
- **Metric:** Percentage of time system is available
- **Formula:** (Total time - Downtime) / Total time × 100
- **Target:** 99.9% availability during business hours
- **Collection Method:** System monitoring tools
- **Reporting Frequency:** Daily

#### Performance Under Load
- **Metric:** System performance during peak usage
- **Targets:**
  - Response time: < 3 seconds under peak load
  - Throughput: ≥ 80% of maximum capacity
- **Collection Method:** Performance monitoring and load testing
- **Reporting Frequency:** Weekly

#### Production Incident Rate
- **Metric:** Number of production incidents per month
- **Target:** < 5 incidents per month
- **Collection Method:** Incident management system
- **Reporting Frequency:** Daily

#### Mean Time to Recovery (MTTR)
- **Metric:** Average time to restore service after incident
- **Target:** < 2 hours for critical incidents
- **Collection Method:** Incident timestamp analysis
- **Reporting Frequency:** Weekly

## 6. Quality Reporting and Dashboards

### 6.1 Metrics Collection Framework

#### Automated Data Collection
- **Code Quality:** Integrated with CI/CD pipeline
- **Test Results:** Automated from test execution tools
- **Performance:** Continuous monitoring through APM tools
- **Defects:** Automated from defect tracking systems

#### Data Validation and Quality
- **Data Accuracy:** Automated validation rules and manual spot checks
- **Data Completeness:** Missing data identification and resolution
- **Data Consistency:** Cross-system data reconciliation
- **Data Timeliness:** Real-time and batch data processing

### 6.2 Dashboard Design

#### Executive Dashboard
- **Audience:** Senior management and stakeholders
- **Content:** High-level KPIs, trend indicators, risk alerts
- **Update Frequency:** Daily
- **Key Metrics:** Overall quality score, customer satisfaction, critical issues

#### Project Manager Dashboard
- **Audience:** Project managers and team leads
- **Content:** Process metrics, team performance, milestone progress
- **Update Frequency:** Daily
- **Key Metrics:** Velocity, defect trends, test progress, resource utilization

#### Development Team Dashboard
- **Audience:** Developers and technical teams
- **Content:** Code quality, build status, technical debt, test coverage
- **Update Frequency:** Real-time
- **Key Metrics:** Code coverage, build success rate, technical debt, defect density

#### Quality Assurance Dashboard
- **Audience:** QA team and test managers
- **Content:** Test execution status, defect analysis, quality trends
- **Update Frequency:** Real-time during testing phases
- **Key Metrics:** Test coverage, defect detection rate, test execution progress

### 6.3 Reporting Schedule

#### Daily Reports
- **Quality Summary:** Key metrics snapshot
- **Critical Issues:** High-priority defects and blockers
- **Test Progress:** Current testing status and coverage
- **Performance Alerts:** System performance anomalies

#### Weekly Reports
- **Quality Trends:** Metric trends and analysis
- **Defect Analysis:** Defect patterns and root causes
- **Process Metrics:** Development and testing process effectiveness
- **Risk Assessment:** Quality risks and mitigation status

#### Monthly Reports
- **Quality Review:** Comprehensive quality assessment
- **Customer Satisfaction:** User feedback and satisfaction metrics
- **Process Improvement:** Lessons learned and improvement actions
- **Executive Summary:** High-level quality status for stakeholders

## 7. Quality Improvement Actions

### 7.1 Quality Gates and Thresholds

#### Development Phase Gates
- **Code Quality Gate:** Minimum quality index score of 80
- **Unit Test Gate:** Minimum 80% code coverage
- **Code Review Gate:** All code reviewed and approved
- **Build Quality Gate:** Successful build with zero critical issues

#### Testing Phase Gates
- **Test Coverage Gate:** Minimum coverage targets met
- **Defect Density Gate:** Below maximum defect density thresholds
- **Performance Gate:** Performance requirements validated
- **Security Gate:** Security requirements verified

#### Release Gates
- **UAT Acceptance Gate:** 95% UAT scenarios passing
- **Production Readiness Gate:** All release criteria satisfied
- **Customer Approval Gate:** Customer sign-off obtained
- **Risk Assessment Gate:** Acceptable risk level for production

### 7.2 Escalation Procedures

#### Threshold Breaches
- **Yellow Alert:** Metrics approaching threshold (90% of limit)
- **Red Alert:** Metrics exceeding threshold
- **Critical Alert:** Multiple metrics breaching or safety concerns

#### Escalation Matrix
- **Level 1:** Team Lead notification and immediate action
- **Level 2:** Project Manager involvement and corrective plan
- **Level 3:** Stakeholder notification and risk mitigation
- **Level 4:** Executive escalation and project review

### 7.3 Continuous Improvement Process

#### Metrics Review Cycle
- **Monthly Review:** Metrics effectiveness and relevance
- **Quarterly Assessment:** Targets and thresholds adjustment
- **Annual Evaluation:** Complete metrics framework review
- **Lessons Learned:** Integration of improvement opportunities

#### Process Optimization
- **Root Cause Analysis:** Systematic investigation of quality issues
- **Process Improvement:** Implementation of corrective actions
- **Best Practice Sharing:** Knowledge transfer and standardization
- **Tool Enhancement:** Continuous improvement of measurement tools

---

**Document Control:**
- **Author:** Quality Manager
- **Reviewers:** Project Manager, Development Lead, Test Manager
- **Approval:** Quality Director
- **Next Review Date:** [Date + 1 month]
- **Distribution:** All project team members, quality stakeholders

**Revision History:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | ${currentDate} | Quality Manager | Initial quality metrics framework |

**Metrics Summary:**
- **Total Metrics Defined:** 35
- **Process Metrics:** 12
- **Product Metrics:** 10
- **Defect Metrics:** 8
- **Customer Metrics:** 5
- **Automated Collection:** 28 metrics (80%)
- **Manual Collection:** 7 metrics (20%)

`;
  }
}
