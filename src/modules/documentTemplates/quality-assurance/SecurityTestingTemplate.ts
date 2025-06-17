import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Security Testing document.
 * Provides a structured fallback template when AI generation fails.
 */
export class SecurityTestingTemplate {
  name = 'Security Testing';
  description = 'Comprehensive security testing strategy and plan';
  category = 'Quality Assurance';
  async generateContent(projectInfo: ProjectContext): Promise<string> {
    const { 
      projectName, 
      projectType, 
      description
    } = projectInfo;

    return `# Security Testing Plan
## ${projectName}

### Document Information
- **Project:** ${projectName}
- **Document Type:** Security Testing Plan
- **Generated:** ${new Date().toLocaleDateString()}
- **Version:** 1.0

## 1. Executive Summary

This security testing plan outlines comprehensive security validation strategies for ${projectName}. 
${description || 'A comprehensive security testing approach to ensure the application meets security requirements and industry standards.'}

## 2. Security Testing Objectives

### Primary Objectives
- Identify security vulnerabilities and threats
- Validate authentication and authorization mechanisms
- Test data protection and privacy controls
- Assess network security and communication protocols
- Verify compliance with security standards and regulations

### Success Criteria
- All critical and high-priority security vulnerabilities identified and documented
- Security controls validated against requirements
- Compliance requirements verified
- Security testing coverage meets organizational standards

## 3. Security Testing Scope

### In Scope
- Core application functionality
- User authentication and authorization
- Data handling and storage
- Network communications
- Third-party integrations
${projectType ? `- ${projectType}-specific security considerations` : ''}

### Security Testing Areas
- **Authentication Testing**
  - Login mechanisms
  - Password policies
  - Multi-factor authentication
  - Session management

- **Authorization Testing**
  - Role-based access control
  - Privilege escalation
  - Access control bypass
  - Data access permissions

- **Input Validation Testing**
  - SQL injection
  - Cross-site scripting (XSS)
  - Command injection
  - Buffer overflow
  - File upload vulnerabilities

- **Data Protection Testing**
  - Data encryption at rest
  - Data encryption in transit
  - Sensitive data exposure
  - Data leakage prevention

## 4. Security Testing Types

### 4.1 Static Application Security Testing (SAST)
- **Scope:** Source code analysis
- **Tools:** SonarQube, Checkmarx, Veracode
- **Frequency:** With each major code change
- **Responsibility:** Development team

### 4.2 Dynamic Application Security Testing (DAST)
- **Scope:** Running application testing
- **Tools:** OWASP ZAP, Burp Suite, Nessus
- **Frequency:** Weekly during development, before each release
- **Responsibility:** QA security team

### 4.3 Interactive Application Security Testing (IAST)
- **Scope:** Real-time security testing during application execution
- **Tools:** Contrast Security, Hdiv Security
- **Frequency:** Continuous during testing phases
- **Responsibility:** QA and development teams

### 4.4 Penetration Testing
- **Scope:** Comprehensive security assessment
- **Approach:** Black-box, white-box, and gray-box testing
- **Frequency:** Pre-release and annually
- **Responsibility:** External security experts or internal red team

## 5. Security Test Cases

### 5.1 Authentication Test Cases
| Test Case ID | Description | Expected Result | Priority |
|--------------|-------------|-----------------|----------|
| SEC-AUTH-001 | Valid login with correct credentials | Successful authentication | High |
| SEC-AUTH-002 | Invalid login with incorrect credentials | Authentication failure | High |
| SEC-AUTH-003 | Brute force attack simulation | Account lockout after failed attempts | High |
| SEC-AUTH-004 | Password complexity validation | Weak passwords rejected | Medium |
| SEC-AUTH-005 | Session timeout validation | Session expires after inactivity | Medium |

### 5.2 Authorization Test Cases
| Test Case ID | Description | Expected Result | Priority |
|--------------|-------------|-----------------|----------|
| SEC-AUTHZ-001 | Access with insufficient privileges | Access denied | High |
| SEC-AUTHZ-002 | Privilege escalation attempt | Privilege escalation blocked | High |
| SEC-AUTHZ-003 | Role-based access validation | Correct role permissions enforced | High |
| SEC-AUTHZ-004 | Direct object reference | Unauthorized object access blocked | High |

### 5.3 Input Validation Test Cases
| Test Case ID | Description | Expected Result | Priority |
|--------------|-------------|-----------------|----------|
| SEC-INPUT-001 | SQL injection in login form | SQL injection blocked | Critical |
| SEC-INPUT-002 | XSS in user input fields | Script execution prevented | Critical |
| SEC-INPUT-003 | File upload with malicious content | Malicious files blocked | High |
| SEC-INPUT-004 | Buffer overflow in input fields | Buffer overflow prevented | High |

### 5.4 Data Protection Test Cases
| Test Case ID | Description | Expected Result | Priority |
|--------------|-------------|-----------------|----------|
| SEC-DATA-001 | Sensitive data in logs | No sensitive data exposed | High |
| SEC-DATA-002 | Data encryption at rest | Data properly encrypted | High |
| SEC-DATA-003 | Data transmission encryption | HTTPS/TLS properly implemented | High |
| SEC-DATA-004 | Data backup security | Backups encrypted and secured | Medium |

## 6. Security Testing Tools

### Automated Testing Tools
- **OWASP ZAP:** Dynamic application security testing
- **SonarQube:** Static code analysis
- **Burp Suite:** Web application security testing
- **Nessus:** Vulnerability scanning
- **Metasploit:** Penetration testing framework

### Manual Testing Tools
- Security testing checklists
- Vulnerability assessment templates
- Penetration testing methodologies
- Security code review guidelines

## 7. Test Environment and Data

### Security Test Environment
- **Environment:** Dedicated security testing environment
- **Configuration:** Production-like setup with security monitoring
- **Access Control:** Restricted access for security team only
- **Data Protection:** Anonymized or synthetic test data only

### Test Data Requirements
- No production data in security testing
- Synthetic data covering edge cases
- Test accounts with various privilege levels
- Sample sensitive data for validation testing

## 8. Security Testing Schedule

### Phase 1: Planning and Setup (Week 1-2)
- Security test environment setup
- Tool configuration and validation
- Test data preparation
- Team training

### Phase 2: Automated Security Testing (Week 3-4)
- SAST implementation
- DAST execution
- Vulnerability scanning
- Automated report generation

### Phase 3: Manual Security Testing (Week 5-6)
- Manual penetration testing
- Security code review
- Configuration assessment
- Social engineering tests (if applicable)

### Phase 4: Reporting and Remediation (Week 7-8)
- Vulnerability analysis and prioritization
- Security findings documentation
- Remediation planning
- Re-testing of fixes

## 9. Risk Assessment

### Security Risks
- **High:** Unauthorized data access
- **High:** Authentication bypass
- **Medium:** Denial of service attacks
- **Medium:** Data integrity compromise
- **Low:** Information disclosure through error messages

### Testing Risks
- **False Positives:** Risk of reporting non-vulnerabilities as security issues
- **False Negatives:** Risk of missing actual security vulnerabilities
- **Environment Differences:** Security issues may exist in production but not in test
- **Tool Limitations:** Automated tools may not catch all vulnerability types

## 10. Security Compliance Requirements

### Regulatory Compliance
- **GDPR:** Data protection and privacy requirements
- **SOC 2:** Security, availability, and confidentiality controls
- **OWASP Top 10:** Web application security risks
- **ISO 27001:** Information security management standards

### Industry Standards
- NIST Cybersecurity Framework
- CIS Critical Security Controls
- SANS Top 25 Software Errors
- OWASP Testing Guide

## 11. Reporting and Documentation

### Security Test Reports
- **Vulnerability Report:** Detailed findings with CVSS scores
- **Executive Summary:** High-level security posture assessment
- **Remediation Report:** Prioritized action items with timelines
- **Compliance Report:** Mapping of findings to regulatory requirements

### Report Distribution
- **Security Team:** Full detailed reports
- **Development Team:** Technical vulnerability reports
- **Project Manager:** Executive summary and timeline impact
- **Business Stakeholders:** Executive summary and compliance status

## 12. Exit Criteria

### Security Testing Completion Criteria
- All planned security test cases executed
- Critical and high-priority vulnerabilities documented
- Security compliance requirements validated
- Penetration testing completed with acceptable risk level
- Security test report approved by stakeholders

### Release Readiness Criteria
- No unresolved critical security vulnerabilities
- High-priority vulnerabilities have remediation plans
- Security controls validated and functioning
- Compliance requirements met
- Security sign-off obtained from security team

## 13. Team Responsibilities

### Security Testing Team
- Execute security test cases
- Manage security testing tools
- Analyze security vulnerabilities
- Provide security recommendations

### Development Team
- Fix identified security vulnerabilities
- Implement security controls
- Support security testing activities
- Participate in security code reviews

### Project Management
- Coordinate security testing activities
- Track remediation progress
- Manage security testing timeline
- Communicate with stakeholders

## 14. Continuous Security Testing

### Integration with CI/CD
- Automated security tests in build pipeline
- Security gates in deployment process
- Continuous vulnerability monitoring
- Regular security regression testing

### Ongoing Security Validation
- Regular security assessments
- Threat modeling updates
- Security metrics monitoring
- Incident response testing

---

*This Security Testing Plan is a living document and should be updated as the project evolves and new security requirements are identified.*`;
  }
}
