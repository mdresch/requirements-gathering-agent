import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Test Plan document.
 * Provides a structured fallback template when AI generation fails.
 */
export class TestPlanTemplate {
  generate(context: ProjectContext): string {
    const projectName = context.projectName || 'Unnamed Project';
    const currentDate = new Date().toLocaleDateString();

    return `# Test Plan

**Project:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${currentDate}  
**Status:** Draft

## 1. Test Plan Overview

### 1.1 Purpose
This test plan document outlines the testing approach, scope, resources, and schedule for the ${projectName} project. It serves as a guide for all testing activities and ensures comprehensive quality validation of the system.

### 1.2 Scope
This test plan covers all testing activities required to validate the functional and non-functional requirements of ${projectName}. It includes unit testing, integration testing, system testing, and user acceptance testing phases.

### 1.3 Objectives
- Validate all functional requirements are correctly implemented
- Ensure system performance meets specified requirements
- Verify system security and data protection measures
- Confirm system reliability and stability
- Validate user experience and accessibility standards

### 1.4 Assumptions
- Development team will provide stable builds for testing
- Test environments will be available as per schedule
- Required test data will be provided or can be generated
- Key stakeholders will be available for reviews and approvals

### 1.5 Constraints
- Testing timeline is dependent on development completion
- Limited budget for external testing tools and resources
- Production-like test environment may have some limitations
- Third-party system availability may impact integration testing

## 2. Test Items and Features

### 2.1 Features to be Tested
- **Core Functionality:** Primary business processes and workflows
- **User Interface:** All user-facing components and interactions
- **Data Management:** Data entry, validation, storage, and retrieval
- **Integration Points:** API integrations and third-party service connections
- **Security Features:** Authentication, authorization, and data protection
- **Performance:** System responsiveness and scalability
- **Compatibility:** Cross-browser and device compatibility

### 2.2 Features Not to be Tested
- Third-party vendor system internal functionality
- Infrastructure components managed by external providers
- Legacy system components not modified in this project
- Administrative tools not used by end users

### 2.3 Test Item Identification
- **Application Version:** [To be determined based on build]
- **Database Version:** [To be specified]
- **API Version:** [To be specified]
- **Dependencies:** [List of dependent systems and versions]

## 3. Test Approach and Strategy

### 3.1 Test Levels

#### Unit Testing
- **Responsibility:** Development team
- **Coverage:** Individual components, functions, and methods
- **Tools:** Jest, JUnit, or equivalent testing framework
- **Criteria:** 80% code coverage minimum

#### Integration Testing
- **Responsibility:** Development and QA teams
- **Coverage:** Component interactions, API integrations, database operations
- **Tools:** Postman, REST Assured, custom automation frameworks
- **Focus:** Interface contracts, data flow, error handling

#### System Testing
- **Responsibility:** QA team
- **Coverage:** Complete integrated system functionality
- **Tools:** Selenium, Cypress, or equivalent automation tools
- **Focus:** End-to-end scenarios, cross-browser compatibility

#### User Acceptance Testing
- **Responsibility:** Business users and QA team
- **Coverage:** Business process validation, user workflow verification
- **Tools:** Manual testing supplemented by automation where appropriate
- **Focus:** Business value delivery, user satisfaction

### 3.2 Test Types

#### Functional Testing
- **Scope:** Verify all functional requirements are correctly implemented
- **Methods:** Manual testing, automated regression testing
- **Coverage:** 100% of critical user stories, 95% of all user stories

#### Performance Testing
- **Scope:** Validate system performance under various load conditions
- **Methods:** Load testing, stress testing, volume testing
- **Tools:** Apache JMeter, LoadRunner, or k6
- **Criteria:** Response time < 2 seconds for 95% of transactions

#### Security Testing
- **Scope:** Verify security measures and data protection
- **Methods:** Vulnerability scanning, penetration testing, code review
- **Tools:** OWASP ZAP, Nessus, or equivalent security testing tools
- **Coverage:** Authentication, authorization, data encryption, input validation

#### Usability Testing
- **Scope:** Validate user experience and interface design
- **Methods:** User testing sessions, accessibility testing
- **Tools:** Browser developer tools, accessibility scanners
- **Criteria:** WCAG 2.1 AA compliance, user satisfaction scores

### 3.3 Test Design Techniques
- **Equivalence Partitioning:** Group similar inputs to reduce test cases
- **Boundary Value Analysis:** Test edge cases and boundary conditions
- **Decision Table Testing:** Test complex business rules and logic
- **State Transition Testing:** Validate system behavior across different states
- **Risk-Based Testing:** Prioritize testing based on risk assessment

### 3.4 Automation Strategy
- **Automation Framework:** Selenium WebDriver with Page Object Model
- **Automation Scope:** Regression tests, smoke tests, API tests
- **Automation Coverage:** 70% of functional tests, 100% of regression tests
- **Maintenance:** Continuous update and maintenance of automated tests

## 4. Test Environment Requirements

### 4.1 Hardware Requirements
- **Application Server:** [Specify server requirements]
- **Database Server:** [Specify database server requirements]
- **Client Machines:** [Specify client system requirements]
- **Network:** [Specify network bandwidth and connectivity requirements]

### 4.2 Software Requirements
- **Operating Systems:** Windows 10/11, macOS, Linux distributions
- **Browsers:** Chrome, Firefox, Safari, Edge (latest versions)
- **Database Management Systems:** [Specify required database systems]
- **Testing Tools:** [List of required testing tools and versions]

### 4.3 Test Data Requirements
- **Data Volume:** Representative sample of production data
- **Data Types:** Test data covering all scenarios and edge cases
- **Data Privacy:** Anonymized production data or synthetic test data
- **Data Refresh:** Weekly refresh cycles for consistent testing

### 4.4 Environment Setup
- **Development Environment:** For unit testing and initial integration testing
- **Test Environment:** For system testing and integration testing
- **Staging Environment:** For user acceptance testing and pre-production validation
- **Production Environment:** For smoke testing and production support

## 5. Test Schedule and Milestones

### 5.1 Test Planning Phase
- **Duration:** 2 weeks
- **Activities:** Test plan creation, test case design, environment setup
- **Deliverables:** Test plan, test cases, test environment ready
- **Milestone:** Test planning complete

### 5.2 Test Execution Phase
- **Duration:** 4-6 weeks
- **Activities:** Test execution, defect reporting, regression testing
- **Deliverables:** Test execution reports, defect reports
- **Milestone:** Testing complete

### 5.3 Test Closure Phase
- **Duration:** 1 week
- **Activities:** Test summary, lessons learned, artifact archival
- **Deliverables:** Test closure report, metrics analysis
- **Milestone:** Test closure complete

### 5.4 Critical Dependencies
- **Development Completion:** Testing cannot begin until code is stable
- **Environment Availability:** Test environments must be ready before execution
- **Test Data Preparation:** Test data must be available for testing
- **Stakeholder Availability:** Key stakeholders must be available for reviews

## 6. Test Team Organization

### 6.1 Roles and Responsibilities

#### Test Manager
- **Responsibilities:** Test planning, resource management, stakeholder communication
- **Skills:** Test management, project management, quality assurance
- **Contact:** [Name and contact information]

#### Senior Test Analyst
- **Responsibilities:** Test design, execution oversight, defect analysis
- **Skills:** Test analysis, domain expertise, test automation
- **Contact:** [Name and contact information]

#### Test Automation Engineer
- **Responsibilities:** Automation framework, automated test development
- **Skills:** Programming, automation tools, CI/CD integration
- **Contact:** [Name and contact information]

#### Performance Test Specialist
- **Responsibilities:** Performance test design, load testing, analysis
- **Skills:** Performance testing tools, system analysis
- **Contact:** [Name and contact information]

### 6.2 Communication Plan
- **Daily Standups:** Daily progress updates with development team
- **Weekly Reports:** Comprehensive status reports to stakeholders
- **Monthly Reviews:** Test metrics review and process improvement
- **Ad-hoc Communication:** Immediate communication for critical issues

### 6.3 Training Requirements
- **Tool Training:** Training on new testing tools and technologies
- **Domain Training:** Business domain knowledge for test analysts
- **Process Training:** Training on testing processes and methodologies

## 7. Entry and Exit Criteria

### 7.1 Entry Criteria

#### Unit Testing
- Code development complete for the unit/module
- Unit test cases reviewed and approved
- Development environment stable and available

#### Integration Testing
- Unit testing completed with acceptable quality
- Integration test environment setup complete
- Test data available for integration scenarios

#### System Testing
- Integration testing completed successfully
- System test environment configured and stable
- All system test cases designed and reviewed

#### User Acceptance Testing
- System testing completed with acceptable defect levels
- UAT environment setup and user access configured
- Business users trained and available for testing

### 7.2 Exit Criteria

#### Unit Testing
- All unit tests executed with 80% pass rate minimum
- Code coverage meets minimum threshold (80%)
- Critical defects resolved

#### Integration Testing
- All integration test cases executed
- 95% pass rate achieved
- High and medium severity defects resolved

#### System Testing
- All system test cases executed
- 95% pass rate achieved
- All high severity defects resolved
- Performance criteria met

#### User Acceptance Testing
- All UAT scenarios executed
- Business acceptance criteria met
- User sign-off obtained

### 7.3 Suspension Criteria
- **Critical Defects:** More than 5 critical defects identified
- **Environment Issues:** Test environment unavailable for more than 1 day
- **Resource Issues:** Key testing personnel unavailable
- **Quality Issues:** Pass rate below 80% for any test level

### 7.4 Resumption Criteria
- **Defect Resolution:** Critical defects fixed and verified
- **Environment Restoration:** Test environment stable and available
- **Resource Availability:** Required testing personnel available
- **Quality Improvement:** Pass rate improved to acceptable levels

## 8. Test Deliverables

### 8.1 Test Planning Deliverables
- **Test Plan Document:** Comprehensive testing approach and strategy
- **Test Case Specifications:** Detailed test cases for all test levels
- **Test Data Specifications:** Test data requirements and preparation procedures
- **Test Environment Setup Guide:** Environment configuration and setup procedures

### 8.2 Test Execution Deliverables
- **Test Execution Reports:** Daily and weekly test execution status
- **Defect Reports:** Detailed defect tracking and analysis
- **Test Coverage Reports:** Coverage metrics and analysis
- **Performance Test Reports:** Performance testing results and analysis

### 8.3 Test Closure Deliverables
- **Test Summary Report:** Comprehensive summary of all testing activities
- **Test Metrics Analysis:** Quality metrics and trend analysis
- **Lessons Learned Document:** Process improvements and recommendations
- **Test Artifact Archive:** Archive of all test artifacts and documentation

## 9. Risk Management

### 9.1 Technical Risks

#### Risk: Complex integrations may have undiscovered issues
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Early integration testing, comprehensive API testing
- **Contingency:** Additional integration testing cycles, vendor support

#### Risk: Performance issues under load
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Performance testing throughout development
- **Contingency:** Performance optimization, infrastructure scaling

### 9.2 Resource Risks

#### Risk: Key testing personnel unavailable
- **Probability:** Low
- **Impact:** High
- **Mitigation:** Cross-training, documentation, backup resources
- **Contingency:** External consultant engagement, scope prioritization

#### Risk: Test environment instability
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Environment monitoring, backup environments
- **Contingency:** Alternative testing approaches, extended timeline

### 9.3 Schedule Risks

#### Risk: Development delays impacting testing timeline
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Risk-based testing, parallel testing activities
- **Contingency:** Scope reduction, additional resources

#### Risk: Extended defect resolution time
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Early defect detection, clear severity criteria
- **Contingency:** Risk-based release decision, phased deployment

### 9.4 Risk Monitoring
- **Risk Register:** Maintain current risk assessment and status
- **Risk Reviews:** Weekly risk assessment and mitigation review
- **Escalation:** Immediate escalation for high-impact risks
- **Communication:** Regular risk communication to stakeholders

## 10. Approval and Sign-off

### 10.1 Review Process
- **Technical Review:** Development lead and architecture team review
- **Business Review:** Product owner and business stakeholders review
- **Quality Review:** QA manager and test team review
- **Management Review:** Project manager and executive sponsor review

### 10.2 Approval Authority
- **Test Plan Approval:** Project Manager, QA Manager, Development Lead
- **Test Case Approval:** Senior Test Analyst, Business Analyst
- **Test Execution Approval:** Test Manager, Development Lead
- **Test Closure Approval:** Project Manager, Quality Manager

### 10.3 Sign-off Requirements
- **Functional Testing:** Business stakeholder sign-off required
- **Performance Testing:** Technical stakeholder sign-off required
- **Security Testing:** Security officer sign-off required
- **User Acceptance Testing:** End user representative sign-off required

### 10.4 Change Management
- **Change Request Process:** Formal change request for scope modifications
- **Impact Assessment:** Analysis of change impact on testing activities
- **Approval Process:** Change approval by project steering committee
- **Communication:** Communication of approved changes to all stakeholders

---

**Document Control:**
- **Author:** Test Manager
- **Reviewers:** Development Lead, Business Analyst, QA Manager
- **Approval:** Project Manager
- **Next Review Date:** [Date + 1 month]
- **Distribution:** All project team members, key stakeholders

**Revision History:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | ${currentDate} | Test Manager | Initial test plan document |

`;
  }
}
