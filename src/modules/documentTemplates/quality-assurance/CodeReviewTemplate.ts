import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Code Review document.
 * Provides a structured fallback template when AI generation fails.
 */
export class CodeReviewTemplate {
  name = 'Code Review';
  description = 'Comprehensive code review process and guidelines';
  category = 'Quality Assurance';

  async generateContent(projectInfo: ProjectContext): Promise<string> {
    const { 
      projectName, 
      projectType, 
      description
    } = projectInfo;

    return `# Code Review Process and Guidelines
## ${projectName}

### Document Information
- **Project:** ${projectName}
- **Document Type:** Code Review Process and Guidelines
- **Generated:** ${new Date().toLocaleDateString()}
- **Version:** 1.0

## 1. Executive Summary

This document establishes comprehensive code review processes and guidelines for ${projectName}. 
${description || 'A systematic approach to ensure code quality, consistency, and adherence to best practices through structured peer review processes.'}

## 2. Code Review Objectives

### Primary Objectives
- Ensure code quality and maintainability
- Identify bugs and potential issues early
- Enforce coding standards and best practices
- Share knowledge and promote learning
- Improve system design and architecture
- Maintain security and performance standards

### Success Criteria
- All code changes reviewed before merge
- Review completion within defined SLA
- Consistent application of coding standards
- Reduction in post-deployment defects
- Improved team knowledge sharing

## 3. Code Review Process

### 3.1 Pre-Review Requirements
- **Code Completion:** All functionality implemented and unit tested
- **Self Review:** Developer performs initial self-review
- **Documentation:** Code properly documented and commented
- **Testing:** All tests pass successfully
- **Standards Compliance:** Code follows established coding standards

### 3.2 Review Initiation
1. **Pull Request Creation**
   - Clear title describing the change
   - Detailed description of modifications
   - Reference to related issues/tickets
   - Test results and coverage information

2. **Reviewer Assignment**
   - Primary reviewer (technical lead/senior developer)
   - Secondary reviewer (peer developer)
   - Domain expert (if specialized knowledge required)

3. **Review Timeline**
   - Small changes (< 100 lines): 24 hours
   - Medium changes (100-500 lines): 48 hours
   - Large changes (> 500 lines): 72 hours
   - Critical/hotfix changes: 4 hours

### 3.3 Review Execution
1. **Code Analysis**
   - Functional correctness
   - Logic and algorithm efficiency
   - Error handling and edge cases
   - Code readability and maintainability

2. **Standards Verification**
   - Coding style consistency
   - Naming conventions
   - Documentation completeness
   - Test coverage adequacy

3. **Architecture Review**
   - Design pattern adherence
   - System integration impact
   - Performance implications
   - Security considerations

## 4. Review Criteria and Standards

### 4.1 Code Quality Criteria
${projectType ? `#### ${projectType}-Specific Standards
- Framework-specific best practices
- Language-specific conventions
- Platform-specific considerations

#### ` : '#### '}General Quality Standards
- **Readability:** Code is clear and self-documenting
- **Simplicity:** Solutions are elegant and not over-engineered
- **Consistency:** Follows established patterns and conventions
- **Modularity:** Proper separation of concerns and loose coupling
- **Reusability:** Components designed for reuse where appropriate

### 4.2 Functional Criteria
- **Correctness:** Code implements requirements accurately
- **Completeness:** All edge cases and error conditions handled
- **Performance:** Efficient algorithms and resource usage
- **Scalability:** Solution supports expected growth
- **Reliability:** Robust error handling and recovery

### 4.3 Security Criteria
- **Input Validation:** All inputs properly validated and sanitized
- **Authentication:** Proper user authentication mechanisms
- **Authorization:** Appropriate access controls implemented
- **Data Protection:** Sensitive data properly protected
- **Vulnerability Prevention:** Common security issues addressed

## 5. Code Review Checklist

### 5.1 General Review Checklist
- [ ] **Functionality**
  - [ ] Code implements requirements correctly
  - [ ] All edge cases handled appropriately
  - [ ] Error conditions properly managed
  - [ ] Business logic is accurate

- [ ] **Code Quality**
  - [ ] Code is readable and well-structured
  - [ ] Appropriate comments and documentation
  - [ ] Consistent naming conventions
  - [ ] No code duplication
  - [ ] Proper error handling

- [ ] **Performance**
  - [ ] Efficient algorithms used
  - [ ] No unnecessary computations
  - [ ] Appropriate data structures
  - [ ] Memory usage optimized
  - [ ] Database queries optimized

- [ ] **Security**
  - [ ] Input validation implemented
  - [ ] No hardcoded secrets or credentials
  - [ ] Appropriate access controls
  - [ ] SQL injection prevention
  - [ ] XSS prevention measures

### 5.2 Testing Checklist
- [ ] **Unit Tests**
  - [ ] All new code covered by tests
  - [ ] Test cases cover edge conditions
  - [ ] Tests are maintainable and clear
  - [ ] Mocking used appropriately
  - [ ] Test data is realistic

- [ ] **Integration Tests**
  - [ ] Integration points tested
  - [ ] End-to-end scenarios covered
  - [ ] API contracts validated
  - [ ] Database interactions tested

### 5.3 Documentation Checklist
- [ ] **Code Documentation**
  - [ ] Complex logic explained
  - [ ] API methods documented
  - [ ] Configuration parameters documented
  - [ ] Dependencies clearly stated

- [ ] **User Documentation**
  - [ ] README updated if needed
  - [ ] API documentation current
  - [ ] Installation guide updated
  - [ ] User guide reflects changes

## 6. Review Types

### 6.1 Standard Review
- **Scope:** Regular feature development and bug fixes
- **Timeline:** Standard SLA applies
- **Reviewers:** 1-2 developers
- **Approval:** Simple majority required

### 6.2 Security Review
- **Scope:** Security-related changes or sensitive areas
- **Timeline:** Extended timeline for thorough analysis
- **Reviewers:** Security specialist required
- **Approval:** Security team sign-off mandatory

### 6.3 Architecture Review
- **Scope:** Major architectural changes or new components
- **Timeline:** Extended timeline with design discussion
- **Reviewers:** Technical architect and senior developers
- **Approval:** Architecture team consensus required

### 6.4 Hotfix Review
- **Scope:** Critical production fixes
- **Timeline:** Expedited 4-hour SLA
- **Reviewers:** Senior developer and technical lead
- **Approval:** Accelerated approval process

## 7. Roles and Responsibilities

### 7.1 Code Author
- **Before Review:**
  - Perform self-review of code
  - Ensure all tests pass
  - Write clear pull request description
  - Address automated tool findings

- **During Review:**
  - Respond to reviewer comments promptly
  - Explain design decisions when needed
  - Make requested changes efficiently
  - Engage in constructive discussion

### 7.2 Primary Reviewer
- **Responsibilities:**
  - Thorough technical review of code
  - Verify compliance with standards
  - Provide constructive feedback
  - Approve or request changes
  - Mentor junior developers

- **Timeline:**
  - Complete review within SLA
  - Provide timely feedback
  - Follow up on requested changes

### 7.3 Secondary Reviewer
- **Responsibilities:**
  - Independent perspective on changes
  - Focus on different aspects than primary reviewer
  - Provide additional feedback
  - Learn from code review process

### 7.4 Technical Lead
- **Responsibilities:**
  - Define review standards and processes
  - Handle escalations and conflicts
  - Ensure consistency across team
  - Monitor review metrics and quality

## 8. Tools and Technology

### 8.1 Code Review Platform
- **Primary Tool:** [GitHub/GitLab/Azure DevOps]
- **Features:**
  - Pull request management
  - Inline commenting
  - Approval workflows
  - Integration with CI/CD

### 8.2 Automated Code Analysis
- **Static Analysis:** [SonarQube/CodeClimate]
- **Security Scanning:** [SAST tools specific to technology stack]
- **Code Coverage:** [Coverage tools integrated with build]
- **Linting:** [Language-specific linters]

### 8.3 Documentation Tools
- **API Documentation:** [Swagger/OpenAPI]
- **Code Documentation:** [Built-in language documentation tools]
- **Wiki/Confluence:** Team knowledge base
- **Markdown:** README and documentation files

## 9. Best Practices

### 9.1 For Code Authors
- **Keep Changes Small:** Smaller pull requests are easier to review
- **Single Responsibility:** One logical change per pull request
- **Clear Communication:** Write descriptive commit messages and PR descriptions
- **Self Review First:** Review your own code before requesting review
- **Be Responsive:** Address feedback promptly and professionally

### 9.2 For Reviewers
- **Be Constructive:** Provide helpful feedback, not just criticism
- **Be Specific:** Point out exact issues and suggest solutions
- **Be Timely:** Complete reviews within established SLA
- **Be Thorough:** Don't rush through reviews
- **Be Educational:** Help teammates learn and grow

### 9.3 Team Best Practices
- **Consistent Standards:** Apply standards consistently across all reviews
- **Knowledge Sharing:** Use reviews as learning opportunities
- **Continuous Improvement:** Regularly update processes and standards
- **Metrics Tracking:** Monitor review effectiveness and efficiency
- **Tool Optimization:** Leverage automation to focus on important issues

## 10. Common Review Issues

### 10.1 Code Quality Issues
- **Poor Naming:** Unclear variable, function, or class names
- **Code Duplication:** Repeated logic that should be abstracted
- **Large Functions:** Functions trying to do too much
- **Deep Nesting:** Overly complex conditional structures
- **Magic Numbers:** Hardcoded values without explanation

### 10.2 Logic Issues
- **Edge Cases:** Unhandled boundary conditions
- **Error Handling:** Missing or inadequate error handling
- **Race Conditions:** Concurrency issues in multi-threaded code
- **Memory Leaks:** Resources not properly released
- **Performance Issues:** Inefficient algorithms or queries

### 10.3 Security Issues
- **Input Validation:** Unvalidated user input
- **Authentication:** Weak or missing authentication
- **Authorization:** Improper access controls
- **Data Exposure:** Sensitive information in logs or responses
- **Injection Vulnerabilities:** SQL, XSS, or command injection risks

## 11. Review Metrics and KPIs

### 11.1 Process Metrics
- **Review Completion Time:** Average time to complete reviews
- **Review Coverage:** Percentage of code changes reviewed
- **Reviewer Participation:** Distribution of review load
- **Revision Cycles:** Number of review iterations per change

### 11.2 Quality Metrics
- **Defect Detection Rate:** Issues found in review vs. production
- **Post-Review Defects:** Bugs found after code review approval
- **Standards Compliance:** Adherence to coding standards
- **Test Coverage:** Code coverage maintained or improved

### 11.3 Team Metrics
- **Knowledge Sharing:** Cross-team review participation
- **Learning Velocity:** Skill improvement through reviews
- **Code Quality Trend:** Improvement in code quality over time
- **Review Satisfaction:** Team satisfaction with review process

## 12. Continuous Improvement

### 12.1 Process Refinement
- **Regular Retrospectives:** Monthly review of process effectiveness
- **Feedback Collection:** Gather team input on process improvements
- **Tool Evaluation:** Assess and upgrade review tools
- **Training Updates:** Keep team updated on best practices

### 12.2 Standards Evolution
- **Technology Updates:** Adapt standards for new technologies
- **Industry Best Practices:** Incorporate emerging best practices
- **Lessons Learned:** Update standards based on production issues
- **Team Growth:** Adjust processes as team expertise evolves

## 13. Escalation Process

### 13.1 Review Conflicts
1. **Discussion:** Attempt to resolve through discussion
2. **Technical Lead:** Escalate to technical lead for guidance
3. **Architecture Review:** Involve architecture team if needed
4. **Final Decision:** Technical lead makes final decision

### 13.2 Timeline Issues
1. **Notification:** Alert stakeholders of potential delays
2. **Priority Assessment:** Evaluate urgency and impact
3. **Resource Allocation:** Assign additional reviewers if needed
4. **Management Escalation:** Involve management for critical delays

---

*This Code Review Process and Guidelines document should be regularly updated to reflect evolving best practices and team needs.*`;
  }
}
