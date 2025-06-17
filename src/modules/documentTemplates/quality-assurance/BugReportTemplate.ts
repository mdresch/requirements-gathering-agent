import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Bug Report document.
 * Provides a structured fallback template when AI generation fails.
 */
export class BugReportTemplate {
  name = 'Bug Report';
  description = 'Comprehensive bug reporting process and template';
  category = 'Quality Assurance';

  async generateContent(projectInfo: ProjectContext): Promise<string> {
    const { 
      projectName, 
      projectType, 
      description
    } = projectInfo;

    return `# Bug Reporting Process and Guidelines
## ${projectName}

### Document Information
- **Project:** ${projectName}
- **Document Type:** Bug Reporting Process and Guidelines
- **Generated:** ${new Date().toLocaleDateString()}
- **Version:** 1.0

## 1. Executive Summary

This document establishes a comprehensive bug reporting process for ${projectName}. 
${description || 'A systematic approach to identifying, documenting, tracking, and resolving defects to ensure high software quality and reliability.'}

## 2. Bug Reporting Objectives

### Primary Objectives
- Ensure consistent and comprehensive bug documentation
- Facilitate efficient bug triage and prioritization
- Enable effective communication between teams
- Support rapid resolution of critical issues
- Maintain quality metrics and improvement tracking

### Success Criteria
- All bugs properly documented and classified
- Bug resolution time meets SLA requirements
- Clear communication channels established
- Quality metrics show continuous improvement
- Stakeholder satisfaction with bug resolution process

## 3. Bug Reporting Process

### 3.1 Bug Discovery
- **Testing Activities:** Formal testing phases (unit, integration, system, acceptance)
- **User Reports:** End-user identified issues in production or UAT
- **Monitoring:** Automated monitoring and alerting systems
- **Code Reviews:** Issues identified during peer review process
- **Production Issues:** Live system errors and performance problems

### 3.2 Bug Verification
Before creating a bug report, verify:
1. **Reproducibility:** Can the issue be consistently reproduced?
2. **Environment:** Is the issue environment-specific?
3. **Scope:** How widespread is the impact?
4. **Existing Reports:** Has this bug already been reported?
5. **Documentation:** Are there clear steps to reproduce?

### 3.3 Bug Reporting Workflow
1. **Initial Report** → Reporter creates bug with basic information
2. **Triage** → QA team reviews and classifies the bug
3. **Assignment** → Bug assigned to appropriate developer/team
4. **Investigation** → Developer investigates and confirms issue
5. **Resolution** → Bug fixed and code changes implemented
6. **Verification** → QA verifies the fix resolves the issue
7. **Closure** → Bug marked resolved and closed

## 4. Bug Classification System

### 4.1 Severity Levels
${projectType ? `#### ${projectType}-Specific Severity Considerations
- Framework-specific critical paths
- Platform-specific performance thresholds
- Integration-specific failure modes

#### ` : '#### '}General Severity Classification

**Critical (S1)**
- System crashes or becomes unusable
- Data loss or corruption occurs
- Security vulnerabilities exposed
- Complete feature failure in production
- Financial impact or legal compliance issues

**High (S2)**
- Major functionality affected
- Significant performance degradation
- Workaround exists but difficult to implement
- Affects multiple users or key features
- Production stability concerns

**Medium (S3)**
- Minor functionality affected
- Reasonable workaround available
- Cosmetic issues with functional impact
- Performance issues with acceptable workarounds
- Isolated feature problems

**Low (S4)**
- Cosmetic issues without functional impact
- Minor inconveniences
- Documentation errors
- Enhancement requests
- Future improvement suggestions

### 4.2 Priority Levels

**P1 - Urgent**
- Must be fixed immediately
- Blocking release or deployment
- Critical business impact
- No acceptable workaround

**P2 - High**
- Should be fixed in current release
- Significant business impact
- Workaround available but not ideal
- Important feature affected

**P3 - Medium**
- Can be fixed in next release
- Moderate business impact
- Acceptable workaround exists
- Normal priority feature

**P4 - Low**
- Nice to fix when time permits
- Minimal business impact
- Easy workaround available
- Enhancement or improvement

## 5. Bug Report Template

### 5.1 Standard Bug Report Format

**Bug ID:** [Auto-generated]
**Title:** [Clear, concise description of the issue]
**Reporter:** [Name and contact information]
**Date Reported:** [Date and time]
**Environment:** [Test/Staging/Production]

#### Basic Information
- **Product/Component:** [Specific area affected]
- **Version:** [Software version or build number]
- **Platform:** [OS, browser, device details]
- **Severity:** [Critical/High/Medium/Low]
- **Priority:** [P1/P2/P3/P4]

#### Issue Description
**Summary:**
[Brief description of what went wrong]

**Expected Behavior:**
[What should have happened]

**Actual Behavior:**
[What actually happened]

**Business Impact:**
[How this affects users/business]

#### Reproduction Steps
**Prerequisites:**
[Any setup or conditions needed]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Continue with detailed steps]
4. [Final step that triggers the issue]

**Reproducibility:**
- [ ] Always (100%)
- [ ] Sometimes (% occurrence)
- [ ] Rarely (< 10%)
- [ ] Unable to reproduce

#### Environment Details
**System Information:**
- Operating System: [Version and details]
- Browser/Client: [Name and version]
- Database: [Type and version if applicable]
- Network: [Connection type/speed if relevant]

**Test Data:**
[Sample data used to reproduce issue]

#### Evidence and Attachments
- [ ] Screenshots attached
- [ ] Video recording included
- [ ] Log files attached
- [ ] Error messages captured
- [ ] Network traces included

#### Additional Information
**Workaround:**
[If any workaround exists, describe it]

**Related Issues:**
[Links to related bugs or tickets]

**Notes:**
[Any additional context or observations]

### 5.2 Critical Bug Report Template

For Critical (S1) and Urgent (P1) bugs, include additional information:

**Business Impact Assessment:**
- Users affected: [Number/percentage]
- Revenue impact: [If applicable]
- Customer complaints: [If applicable]
- SLA impact: [Service level implications]

**Immediate Actions Taken:**
- [ ] Stakeholders notified
- [ ] Incident response activated
- [ ] Rollback considerations evaluated
- [ ] Communication plan initiated

**Resolution Timeline:**
- Required fix time: [Based on SLA]
- Estimated effort: [Development hours]
- Dependencies: [What needs to be coordinated]

## 6. Bug Lifecycle Management

### 6.1 Bug States
1. **New** - Newly reported, awaiting triage
2. **Open** - Confirmed and assigned for investigation
3. **In Progress** - Developer actively working on fix
4. **Resolved** - Fix implemented, awaiting verification
5. **Verified** - Fix confirmed working by QA
6. **Closed** - Issue completely resolved
7. **Rejected** - Not a valid bug (duplicate, by design, etc.)
8. **Deferred** - Valid bug but postponed to future release

### 6.2 State Transitions
- **New → Open:** After triage and assignment
- **Open → In Progress:** Developer starts work
- **In Progress → Resolved:** Fix implemented
- **Resolved → Verified:** QA confirms fix
- **Verified → Closed:** Final closure
- **Any State → Rejected:** If determined invalid
- **Any State → Deferred:** If postponed

### 6.3 Resolution Types
- **Fixed:** Issue resolved with code changes
- **Duplicate:** Same issue already reported
- **By Design:** Behavior is intentional
- **Cannot Reproduce:** Unable to replicate issue
- **Won't Fix:** Valid issue but won't be addressed
- **Deferred:** Will be addressed in future release

## 7. Roles and Responsibilities

### 7.1 Bug Reporter
- **Responsibilities:**
  - Provide clear, complete bug reports
  - Respond to requests for additional information
  - Verify bug fixes when possible
  - Follow up on status updates

- **Best Practices:**
  - Use descriptive titles
  - Include all relevant details
  - Attach supporting evidence
  - Check for duplicates first

### 7.2 QA Team
- **Responsibilities:**
  - Triage incoming bug reports
  - Verify and reproduce issues
  - Classify severity and priority
  - Assign to appropriate teams
  - Verify fixes before closure

- **SLA Commitments:**
  - Critical bugs: 2 hours response
  - High priority: 8 hours response
  - Medium priority: 24 hours response
  - Low priority: 48 hours response

### 7.3 Development Team
- **Responsibilities:**
  - Investigate assigned bugs
  - Implement fixes efficiently
  - Update bug status regularly
  - Provide ETA for resolution
  - Coordinate with QA for verification

### 7.4 Product Owner
- **Responsibilities:**
  - Prioritize bugs based on business impact
  - Make decisions on feature vs. bug trade-offs
  - Approve bug deferral decisions
  - Communicate with stakeholders

## 8. Bug Tracking Tools

### 8.1 Primary Bug Tracking System
- **Tool:** [Jira/Azure DevOps/GitHub Issues]
- **Access:** All team members have appropriate permissions
- **Integration:** Connected to development and deployment tools
- **Reporting:** Automated metrics and dashboards available

### 8.2 Supporting Tools
- **Screen Capture:** [Tool for screenshots and video]
- **Log Analysis:** [Centralized logging system]
- **Performance Monitoring:** [APM tools for performance issues]
- **Communication:** [Slack/Teams integration for notifications]

## 9. Bug Metrics and KPIs

### 9.1 Process Metrics
- **Bug Discovery Rate:** New bugs found per time period
- **Resolution Time:** Average time to fix by severity
- **First Response Time:** Time to initial triage
- **Reopen Rate:** Percentage of bugs reopened after fix

### 9.2 Quality Metrics
- **Defect Density:** Bugs per feature/component
- **Escape Rate:** Production bugs vs. pre-production
- **Fix Quality:** Percentage of fixes that work correctly
- **Customer Satisfaction:** User feedback on bug resolution

### 9.3 Team Performance
- **Triage Efficiency:** Time to classify and assign
- **Developer Velocity:** Bugs fixed per developer per period
- **QA Verification:** Time to verify fixes
- **Process Compliance:** Adherence to reporting standards

## 10. Best Practices

### 10.1 For Bug Reporters
- **Be Specific:** Clear, detailed descriptions
- **Be Timely:** Report issues as soon as discovered
- **Be Complete:** Include all relevant information
- **Be Responsive:** Answer follow-up questions quickly
- **Be Patient:** Allow time for proper investigation

### 10.2 For Developers
- **Acknowledge Quickly:** Confirm receipt of bug assignments
- **Investigate Thoroughly:** Understand root cause fully
- **Fix Completely:** Address the underlying issue, not just symptoms
- **Test Thoroughly:** Verify fix doesn't introduce new issues
- **Document Changes:** Clear commit messages and change notes

### 10.3 For QA Team
- **Triage Consistently:** Apply standards uniformly
- **Verify Completely:** Test all aspects of the fix
- **Communicate Clearly:** Keep all parties informed
- **Track Metrics:** Monitor process effectiveness
- **Continuous Improvement:** Regular process refinement

## 11. Common Bug Types

### 11.1 Functional Bugs
- **Logic Errors:** Incorrect business rule implementation
- **Data Validation:** Improper input validation
- **Integration Issues:** API or service communication problems
- **User Interface:** UI element behavior or display issues
- **Workflow Problems:** Incorrect process flow implementation

### 11.2 Non-Functional Bugs
- **Performance:** Slow response times or resource usage
- **Security:** Authentication, authorization, or data protection issues
- **Usability:** Poor user experience or confusing interfaces
- **Compatibility:** Browser, OS, or device-specific problems
- **Reliability:** System crashes, hangs, or instability

### 11.3 Environment-Specific Issues
- **Configuration:** Environment setup or configuration problems
- **Data Issues:** Test data or production data inconsistencies
- **Infrastructure:** Network, server, or deployment issues
- **Third-Party:** External service or dependency problems

## 12. Escalation Procedures

### 12.1 Standard Escalation Path
1. **Level 1:** Assigned developer
2. **Level 2:** Team lead or senior developer
3. **Level 3:** Technical architect or engineering manager
4. **Level 4:** Product owner and stakeholders

### 12.2 Critical Bug Escalation
- **Immediate:** Technical lead and product owner
- **Within 1 hour:** Engineering manager and stakeholders
- **Communication:** Regular updates every 2 hours
- **Resolution:** All hands on deck until resolved

### 12.3 Escalation Triggers
- Bug remains unresolved past SLA
- Critical bug affects production
- Customer escalation received
- Multiple related bugs indicate systemic issue

## 13. Continuous Improvement

### 13.1 Process Review
- **Monthly Metrics Review:** Analyze bug trends and metrics
- **Quarterly Process Assessment:** Evaluate process effectiveness
- **Annual Training:** Update team on best practices
- **Tool Evaluation:** Assess and upgrade bug tracking tools

### 13.2 Root Cause Analysis
- **Pattern Recognition:** Identify recurring bug types
- **Process Gaps:** Address systematic issues
- **Training Needs:** Improve team skills and knowledge
- **Preventive Measures:** Implement measures to prevent similar bugs

---

*This Bug Reporting Process and Guidelines document should be regularly updated based on team feedback and process improvements.*`;
  }
}
