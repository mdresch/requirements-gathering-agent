import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Test Strategy document.
 * Provides a structured fallback template when AI generation fails.
 */
export class TestStrategyTemplate {
  generate(context: ProjectContext): string {
    const projectName = context.projectName || 'Unnamed Project';
    const currentDate = new Date().toLocaleDateString();

    return `# Test Strategy

**Project:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${currentDate}  
**Status:** Draft

## 1. Testing Objectives and Goals

### Primary Testing Objectives
- Ensure all functional requirements are properly implemented and working as specified
- Validate system performance meets or exceeds defined performance requirements
- Verify system security measures are effective and comprehensive
- Confirm system reliability and stability under various load conditions
- Validate user experience and interface usability standards

### Quality Criteria
- **Functional Coverage:** 100% of critical user stories tested, 95% of all user stories tested
- **Code Coverage:** Minimum 80% unit test coverage, 70% integration test coverage
- **Defect Density:** Less than 2 critical defects per 1000 lines of code
- **Performance:** Response time under 2 seconds for 95% of user transactions
- **Availability:** 99.9% system uptime during business hours

### Success Metrics
- Zero critical defects in production release
- User acceptance test pass rate > 95%
- Performance benchmarks met or exceeded
- Security vulnerability assessment completed with no high-risk findings

## 2. Test Scope and Approach

### In-Scope Testing
- **Functional Testing:** All user stories, business rules, and workflows
- **Integration Testing:** API integrations, database operations, third-party services
- **System Testing:** End-to-end scenarios, cross-browser compatibility
- **Performance Testing:** Load testing, stress testing, scalability validation
- **Security Testing:** Authentication, authorization, data protection
- **Usability Testing:** User interface, user experience, accessibility compliance

### Out-of-Scope Testing
- Third-party vendor system internal functionality
- Infrastructure components managed by external providers
- Legacy system components not modified in this project
- Mobile applications (if not part of current scope)

### Test Levels

#### Unit Testing
- **Scope:** Individual components, functions, and methods
- **Responsibility:** Development team
- **Tools:** Jest, JUnit, or equivalent framework
- **Target Coverage:** 80% code coverage minimum

#### Integration Testing
- **Scope:** Component interactions, API integrations, database operations
- **Responsibility:** Development and QA teams
- **Tools:** Postman, REST Assured, custom test frameworks
- **Focus:** Data flow, interface contracts, error handling

#### System Testing
- **Scope:** Complete integrated system functionality
- **Responsibility:** QA team
- **Tools:** Selenium, Cypress, or equivalent automation tools
- **Focus:** End-to-end business scenarios, cross-browser testing

#### User Acceptance Testing (UAT)
- **Scope:** Business process validation, user workflow verification
- **Responsibility:** Business users and QA team
- **Tools:** Manual testing, business process automation tools
- **Focus:** Business value delivery, user satisfaction

## 3. Test Environment Strategy

### Environment Configuration
- **Development Environment:** Continuous integration testing, unit tests
- **Test Environment:** Integration testing, system testing, performance testing
- **Staging Environment:** User acceptance testing, pre-production validation
- **Production Environment:** Smoke testing, monitoring, production support

### Test Data Management
- **Test Data Creation:** Automated test data generation for consistent testing
- **Data Privacy:** Anonymized production data or synthetic data for testing
- **Data Refresh:** Weekly refresh cycles for non-production environments
- **Data Retention:** Test data retained for 30 days post-testing completion

### Environment Dependencies
- Database systems with appropriate test datasets
- Third-party service integrations (test/sandbox environments)
- Network configurations matching production topology
- Monitoring and logging systems for test result analysis

## 4. Test Organization and Roles

### Test Team Structure

#### Test Manager
- **Responsibilities:** Test strategy oversight, resource planning, stakeholder communication
- **Skills Required:** Test management, project management, quality assurance expertise

#### Senior Test Analyst
- **Responsibilities:** Test case design, test execution oversight, defect analysis
- **Skills Required:** Test analysis, domain expertise, test automation skills

#### Test Automation Engineer
- **Responsibilities:** Automation framework development, automated test creation
- **Skills Required:** Programming skills, automation tools expertise, CI/CD knowledge

#### Performance Test Specialist
- **Responsibilities:** Performance test design, load testing, performance analysis
- **Skills Required:** Performance testing tools, system performance analysis

### Communication Protocols
- Daily standup meetings with development team
- Weekly test status reports to project stakeholders
- Bi-weekly test metrics review with management
- Immediate escalation for critical defects or blocking issues

## 5. Risk Assessment and Mitigation

### High-Risk Areas

#### Technical Risks
- **Risk:** Complex integrations may have undiscovered issues
- **Mitigation:** Early integration testing, comprehensive API testing
- **Contingency:** Additional integration testing cycles, vendor support engagement

#### Resource Risks
- **Risk:** Key testing personnel unavailable during critical phases
- **Mitigation:** Cross-training, knowledge documentation, backup resource identification
- **Contingency:** External consultant engagement, scope prioritization

#### Schedule Risks
- **Risk:** Testing timeline compressed due to development delays
- **Mitigation:** Risk-based testing prioritization, parallel testing activities
- **Contingency:** Additional testing resources, scope reduction for non-critical features

#### Quality Risks
- **Risk:** High defect rate impacting release timeline
- **Mitigation:** Early defect detection, continuous quality monitoring
- **Contingency:** Additional testing cycles, release criteria adjustment

## 6. Test Deliverables and Timeline

### Test Planning Phase
- **Deliverables:** Test strategy, test plans, test case specifications
- **Timeline:** 2 weeks
- **Entry Criteria:** Requirements finalized, architecture design completed
- **Exit Criteria:** Test plans approved, test environment ready

### Test Execution Phase
- **Deliverables:** Test execution reports, defect reports, test coverage reports
- **Timeline:** 4-6 weeks (depending on project scope)
- **Entry Criteria:** Test environment stable, test data available, code ready
- **Exit Criteria:** All planned tests executed, exit criteria met

### Test Closure Phase
- **Deliverables:** Test summary report, lessons learned, test metrics analysis
- **Timeline:** 1 week
- **Entry Criteria:** Testing completed, defects resolved or accepted
- **Exit Criteria:** Test closure report approved, testing artifacts archived

## 7. Tools and Technologies

### Test Management Tools
- **Tool:** Azure DevOps / Jira
- **Purpose:** Test case management, defect tracking, test execution tracking
- **Licensing:** Team licenses for all testing personnel

### Test Automation Tools
- **UI Automation:** Selenium WebDriver, Cypress, or Playwright
- **API Testing:** Postman, REST Assured, or Newman
- **Unit Testing:** Jest, JUnit, or language-specific frameworks
- **Performance Testing:** Apache JMeter, LoadRunner, or k6

### Test Data Management
- **Data Generation:** Custom scripts, Faker.js, or commercial tools
- **Data Masking:** Data anonymization tools for production data usage
- **Database Tools:** SQL tools for data validation and setup

### Continuous Integration
- **CI/CD Integration:** Jenkins, Azure DevOps, or GitHub Actions
- **Test Reporting:** Allure, TestNG, or built-in CI reporting
- **Code Coverage:** SonarQube, Codecov, or similar tools

## 8. Resource Planning and Budget

### Human Resources
- **Test Manager:** 1 FTE for project duration
- **Senior Test Analysts:** 2 FTE for testing phases
- **Automation Engineers:** 1 FTE for automation development
- **Performance Test Specialist:** 0.5 FTE for performance testing phase

### Infrastructure Requirements
- **Test Environments:** 3 dedicated environments (test, staging, UAT)
- **Hardware/Cloud Resources:** Equivalent to production capacity for performance testing
- **Network Bandwidth:** Sufficient for concurrent testing activities

### Tool Licensing and Training
- **Tool Licenses:** Budget for automation tools, test management platforms
- **Training:** Team training on new tools and technologies
- **External Support:** Vendor support contracts for critical tools

### Budget Allocation
- **Personnel Costs:** 70% of testing budget
- **Infrastructure and Tools:** 20% of testing budget
- **Training and Support:** 10% of testing budget

## 9. Quality Metrics and Reporting

### Test Coverage Metrics
- **Requirements Coverage:** Percentage of requirements with test cases
- **Code Coverage:** Percentage of code covered by automated tests
- **Test Case Coverage:** Percentage of planned test cases executed

### Defect Metrics
- **Defect Density:** Number of defects per thousand lines of code
- **Defect Discovery Rate:** Rate of defect identification over time
- **Defect Resolution Time:** Average time to resolve defects by severity
- **Defect Escape Rate:** Percentage of defects found in production

### Performance Metrics
- **Test Execution Progress:** Percentage of planned tests completed
- **Test Pass Rate:** Percentage of tests passing on first execution
- **Environment Stability:** Uptime and availability of test environments
- **Resource Utilization:** Efficiency of testing resource usage

### Reporting Schedule
- **Daily:** Test execution progress, critical defect status
- **Weekly:** Comprehensive test status, metrics summary, risk assessment
- **Monthly:** Test trend analysis, quality metrics review, process improvements

## 10. Continuous Improvement

### Process Improvement Framework
- **Regular Retrospectives:** Weekly team retrospectives, monthly process reviews
- **Metrics Analysis:** Continuous monitoring of quality and efficiency metrics
- **Best Practice Sharing:** Knowledge sharing sessions, documentation updates
- **Tool Evaluation:** Regular assessment of tool effectiveness and alternatives

### Knowledge Management
- **Documentation Standards:** Maintain current test documentation and procedures
- **Lessons Learned:** Capture and share insights from each testing cycle
- **Training Programs:** Ongoing skill development for testing team members
- **Process Optimization:** Regular review and improvement of testing processes

### Quality Assurance Evolution
- **Automation Expansion:** Continuously increase automated test coverage
- **Shift-Left Testing:** Earlier involvement in development lifecycle
- **Risk-Based Testing:** Improve risk assessment and testing prioritization
- **Performance Integration:** Better integration of performance testing in CI/CD

---

**Document Control:**
- **Author:** QA Team Lead
- **Reviewers:** Project Manager, Development Lead, Business Stakeholders
- **Approval:** Project Sponsor
- **Next Review Date:** [Date + 3 months]
- **Distribution:** All project team members, key stakeholders

**Revision History:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | ${currentDate} | QA Team | Initial test strategy document |

`;
  }
}
