import type { ProjectContext } from '../../ai/types';

/**
 * Security Design Template generates comprehensive security design documentation
 * following security architecture best practices and industry standards.
 */
export class SecuritydesignTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Security Design Document
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    const projectType = this.context.projectType || 'Software System';
    
    return `# Security Design Document

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}  
**Security Classification:** [Confidential/Internal/Public]

## Executive Summary

${projectDescription}

This document provides a comprehensive security design for ${projectName}, including authentication mechanisms, authorization frameworks, data protection strategies, network security, threat modeling, and compliance requirements.

## 1. Security Overview

### 1.1 Security Mission Statement
- **Primary Objective:** [Define the main security goals and objectives]
- **Security Principles:** [Confidentiality, Integrity, Availability, Authentication, Authorization, Non-repudiation]
- **Risk Tolerance:** [Organization's acceptable risk levels]
- **Compliance Requirements:** [Regulatory and industry standards]

### 1.2 Security Scope
- **Assets to Protect:** [Data, systems, users, intellectual property]
- **Threat Landscape:** [Internal and external threats]
- **Security Domains:** [Network, application, data, physical, operational]
- **Stakeholder Security Responsibilities:** [Roles and accountabilities]

### 1.3 Security Architecture Principles
- **Defense in Depth:** Multiple layers of security controls
- **Least Privilege:** Minimum necessary access rights
- **Fail Secure:** System fails to a secure state
- **Zero Trust:** Never trust, always verify
- **Security by Design:** Built-in security from inception
- **Separation of Duties:** Critical functions require multiple people

### 1.4 Security Standards and Frameworks
- **NIST Cybersecurity Framework:** [Identify, Protect, Detect, Respond, Recover]
- **ISO 27001/27002:** Information security management
- **OWASP:** Application security best practices
- **SANS Top 25:** Most dangerous software errors
- **Industry Standards:** [PCI DSS, HIPAA, SOX, GDPR, etc.]

## 2. Authentication Design

### 2.1 Authentication Requirements
- **User Authentication:** Verify user identity
- **System Authentication:** Service-to-service authentication
- **Device Authentication:** Trusted device verification
- **Multi-Factor Authentication:** Multiple verification methods

### 2.2 Authentication Methods

#### 2.2.1 Username/Password Authentication
- **Password Policy:**
  - Minimum 12 characters
  - Complexity requirements (uppercase, lowercase, numbers, symbols)
  - Password history (last 12 passwords)
  - Maximum age: 90 days
  - Account lockout: 5 failed attempts
- **Password Storage:** Bcrypt with salt (cost factor 12+)
- **Password Recovery:** Secure reset process with time-limited tokens

#### 2.2.2 Multi-Factor Authentication (MFA)
- **SMS/Voice:** Time-based one-time passwords
- **Authenticator Apps:** TOTP (Google Authenticator, Authy)
- **Hardware Tokens:** FIDO2/WebAuthn, YubiKey
- **Biometric:** Fingerprint, facial recognition (where applicable)
- **Push Notifications:** Mobile app approval

#### 2.2.3 Single Sign-On (SSO)
- **Protocol:** SAML 2.0, OAuth 2.0, OpenID Connect
- **Identity Providers:** Active Directory, Azure AD, Okta
- **Federation:** Cross-domain authentication
- **Session Management:** Centralized session control

#### 2.2.4 API Authentication
- **API Keys:** For service-to-service communication
- **JWT Tokens:** Stateless authentication
- **OAuth 2.0:** Delegated authorization
- **Client Certificates:** Mutual TLS authentication

### 2.3 Authentication Flow Design
\`\`\`
[User] → [Login Request] → [Authentication Service] → [MFA Challenge] → [Token Issuance] → [Resource Access]
   ↓                            ↓                        ↓                    ↓
[Audit Log]              [Identity Store]         [MFA Provider]      [Session Store]
\`\`\`

### 2.4 Session Management
- **Session Tokens:** Cryptographically secure random tokens
- **Session Timeout:** Idle timeout (30 minutes), absolute timeout (8 hours)
- **Session Storage:** Secure server-side storage
- **Session Invalidation:** Logout, password change, admin termination
- **Concurrent Sessions:** Configurable limits per user

## 3. Authorization Framework

### 3.1 Authorization Model
- **Role-Based Access Control (RBAC):** Permissions assigned to roles
- **Attribute-Based Access Control (ABAC):** Context-aware decisions
- **Discretionary Access Control (DAC):** Owner-controlled access
- **Mandatory Access Control (MAC):** System-enforced labels

### 3.2 Role Definition

#### 3.2.1 System Roles
- **Super Administrator:** Full system access
- **System Administrator:** System configuration and maintenance
- **Security Administrator:** Security policy and audit access
- **Application Administrator:** Application-specific administration
- **Operator:** Day-to-day operational tasks
- **Auditor:** Read-only access for compliance

#### 3.2.2 Business Roles
- **Executive:** Strategic information access
- **Manager:** Team and department data access
- **Employee:** Job function-specific access
- **Contractor:** Limited temporary access
- **Customer:** Self-service portal access
- **Partner:** B2B integration access

### 3.3 Permission Matrix
\`\`\`
Resource Type    | Super Admin | Sys Admin | Sec Admin | App Admin | Operator | User
-----------------|-------------|-----------|-----------|-----------|----------|------
User Management  |     CRUD    |    CRUD   |    R--    |   CR--    |   -R--   | -R--
System Config    |     CRUD    |    CRUD   |    -R--   |   ----    |   -R--   | ----
Security Logs    |     CRUD    |    -R--   |    CRUD   |   -R--    |   ----   | ----
Application Data |     CRUD    |    ----   |    -R--   |   CRUD    |   CR--   | CR--
Reports          |     CRUD    |    CR--   |    CR--   |   CR--    |   -R--   | -R--
\`\`\`

### 3.4 Access Control Implementation
- **Policy Decision Point (PDP):** Central authorization engine
- **Policy Enforcement Point (PEP):** Access control enforcement
- **Policy Information Point (PIP):** Attribute data sources
- **Policy Administration Point (PAP):** Policy management

### 3.5 Dynamic Authorization
- **Context-Aware Access:** Time, location, device-based decisions
- **Risk-Based Access:** Adaptive authentication based on risk score
- **Just-in-Time Access:** Temporary elevated privileges
- **Emergency Access:** Break-glass procedures for critical situations

## 4. Data Protection

### 4.1 Data Classification
- **Public:** No confidentiality concerns
- **Internal:** Limited to organization
- **Confidential:** Sensitive business information
- **Restricted:** Highly sensitive, regulated data

### 4.2 Encryption Standards

#### 4.2.1 Data at Rest
- **Symmetric Encryption:** AES-256 with secure key management
- **Database Encryption:** Transparent Data Encryption (TDE)
- **File System Encryption:** Full disk encryption
- **Backup Encryption:** Encrypted backup storage

#### 4.2.2 Data in Transit
- **Transport Layer Security:** TLS 1.3 minimum
- **API Communications:** HTTPS with certificate pinning
- **Internal Communications:** mTLS for service-to-service
- **Message Encryption:** End-to-end encryption for sensitive data

#### 4.2.3 Data in Use
- **Application-Level Encryption:** Field-level encryption
- **Homomorphic Encryption:** Computation on encrypted data
- **Secure Enclaves:** Hardware-based protection
- **Confidential Computing:** TEE (Trusted Execution Environment)

### 4.3 Key Management
- **Key Generation:** Hardware Security Modules (HSM)
- **Key Storage:** Secure key vaults (Azure Key Vault, AWS KMS)
- **Key Rotation:** Automated regular rotation
- **Key Escrow:** Secure key recovery procedures
- **Key Destruction:** Secure deletion of expired keys

### 4.4 Data Loss Prevention (DLP)
- **Content Inspection:** Pattern matching and classification
- **Egress Monitoring:** Outbound data monitoring
- **Endpoint Protection:** Device-level data protection
- **Email Security:** Attachment and content scanning
- **Cloud Security:** Cloud storage monitoring

### 4.5 Data Privacy and Compliance
- **GDPR Compliance:** Right to be forgotten, data portability
- **CCPA Compliance:** California Consumer Privacy Act
- **HIPAA Compliance:** Healthcare information protection
- **PCI DSS:** Payment card data protection
- **Data Retention:** Automated data lifecycle management

## 5. Network Security

### 5.1 Network Architecture
\`\`\`
Internet → [WAF] → [Load Balancer] → [DMZ] → [Application Tier] → [Database Tier]
             ↓           ↓              ↓           ↓                ↓
         [DDoS Prot]  [SSL Term]    [Firewall]  [IDS/IPS]      [Encryption]
\`\`\`

### 5.2 Perimeter Security
- **Web Application Firewall (WAF):** OWASP Top 10 protection
- **Distributed Denial of Service (DDoS) Protection:** Traffic scrubbing
- **Intrusion Detection/Prevention System (IDS/IPS):** Threat detection
- **Network Firewalls:** Stateful packet inspection
- **VPN Gateways:** Secure remote access

### 5.3 Network Segmentation
- **DMZ (Demilitarized Zone):** External-facing services
- **Application Tier:** Business logic layer
- **Database Tier:** Data storage layer
- **Management Network:** Administrative access
- **Guest Network:** Visitor and contractor access

### 5.4 Zero Trust Network
- **Micro-segmentation:** Granular network controls
- **Software-Defined Perimeter (SDP):** Dynamic access control
- **Network Access Control (NAC):** Device authentication
- **Endpoint Detection and Response (EDR):** Continuous monitoring

### 5.5 Secure Communications
- **TLS/SSL Certificates:** Valid, properly configured certificates
- **Certificate Management:** Automated renewal and monitoring
- **Perfect Forward Secrecy:** Session key protection
- **HTTP Security Headers:** HSTS, CSP, X-Frame-Options

## 6. Security Controls

### 6.1 Preventive Controls
- **Access Controls:** Authentication and authorization
- **Input Validation:** Data sanitization and validation
- **Encryption:** Data protection at rest and in transit
- **Security Awareness Training:** User education
- **Secure Development:** Security in SDLC

### 6.2 Detective Controls
- **Security Monitoring:** SIEM and log analysis
- **Intrusion Detection:** Network and host-based detection
- **Vulnerability Scanning:** Regular security assessments
- **Audit Trails:** Comprehensive logging
- **Anomaly Detection:** Behavioral analysis

### 6.3 Corrective Controls
- **Incident Response:** Structured response procedures
- **Backup and Recovery:** Data restoration capabilities
- **Patch Management:** Timely security updates
- **Forensic Analysis:** Evidence collection and analysis
- **Business Continuity:** Operational resilience

### 6.4 Compensating Controls
- **Alternative Measures:** When primary controls can't be implemented
- **Risk Mitigation:** Additional protective measures
- **Monitoring Enhancement:** Increased surveillance
- **Process Controls:** Procedural safeguards

## 7. Threat Modeling

### 7.1 Threat Modeling Methodology
- **STRIDE Framework:**
  - **Spoofing:** Identity verification
  - **Tampering:** Data integrity
  - **Repudiation:** Non-repudiation
  - **Information Disclosure:** Confidentiality
  - **Denial of Service:** Availability
  - **Elevation of Privilege:** Authorization

### 7.2 Asset Identification
- **Critical Assets:** [List of high-value assets]
- **Data Assets:** [Sensitive data categories]
- **System Assets:** [Critical system components]
- **Infrastructure Assets:** [Network and hardware resources]

### 7.3 Threat Landscape

#### 7.3.1 External Threats
- **Cybercriminals:** Financial motivation
- **Nation-State Actors:** Espionage and disruption
- **Hacktivists:** Ideological motivation
- **Script Kiddies:** Opportunistic attacks
- **Insider Threats:** Malicious employees/contractors

#### 7.3.2 Attack Vectors
- **Web Application Attacks:** OWASP Top 10
- **Network Attacks:** DDoS, man-in-the-middle
- **Social Engineering:** Phishing, pretexting
- **Physical Attacks:** Unauthorized access
- **Supply Chain Attacks:** Third-party compromises

### 7.4 Risk Assessment Matrix
\`\`\`
Threat          | Likelihood | Impact | Risk Level | Mitigation Priority
----------------|------------|--------|------------|-------------------
SQL Injection   |   Medium   |  High  |    High    |      Critical
DDoS Attack     |    High    | Medium |    High    |      Critical
Insider Threat  |   Low      |  High  |   Medium   |      High
Phishing        |    High    |  Low   |   Medium   |      High
Data Breach     |   Medium   |  High  |    High    |      Critical
\`\`\`

### 7.5 Attack Tree Analysis
\`\`\`
Goal: Compromise User Data
├── Exploit Application Vulnerabilities
│   ├── SQL Injection
│   ├── Cross-Site Scripting (XSS)
│   └── Authentication Bypass
├── Network-Based Attacks
│   ├── Man-in-the-Middle
│   ├── DNS Poisoning
│   └── Session Hijacking
└── Social Engineering
    ├── Phishing Emails
    ├── Pretexting
    └── Baiting
\`\`\`

## 8. Security Testing Strategy

### 8.1 Security Testing Types
- **Static Application Security Testing (SAST):** Source code analysis
- **Dynamic Application Security Testing (DAST):** Runtime testing
- **Interactive Application Security Testing (IAST):** Hybrid approach
- **Penetration Testing:** Simulated attacks
- **Vulnerability Assessments:** Systematic security reviews

### 8.2 Testing Methodologies
- **OWASP Testing Guide:** Comprehensive web application testing
- **NIST SP 800-115:** Technical guide to information security testing
- **PTES (Penetration Testing Execution Standard):** Structured penetration testing
- **OSSTMM (Open Source Security Testing Methodology Manual):** Scientific testing approach

### 8.3 Automated Security Testing
- **CI/CD Integration:** Security gates in deployment pipeline
- **Dependency Scanning:** Third-party component vulnerabilities
- **Container Security:** Image and runtime scanning
- **Infrastructure as Code Security:** Configuration validation

### 8.4 Security Testing Schedule
- **Continuous:** Automated testing in CI/CD
- **Weekly:** Vulnerability scans
- **Monthly:** Security assessments
- **Quarterly:** Penetration testing
- **Annually:** Comprehensive security audit

### 8.5 Security Metrics and KPIs
- **Mean Time to Detection (MTTD):** How quickly threats are identified
- **Mean Time to Response (MTTR):** How quickly incidents are addressed
- **Vulnerability Density:** Number of vulnerabilities per KLOC
- **Patch Deployment Time:** Time to apply security patches
- **Security Training Completion:** Employee security awareness

## 9. Incident Response Plan

### 9.1 Incident Response Team
- **Incident Commander:** Overall incident management
- **Security Analyst:** Technical investigation
- **IT Operations:** System restoration
- **Legal Counsel:** Legal and regulatory guidance
- **Communications:** Internal and external communications
- **Executive Sponsor:** Senior management oversight

### 9.2 Incident Classification
- **Low:** Minimal impact, no data exposure
- **Medium:** Moderate impact, limited data exposure
- **High:** Significant impact, substantial data exposure
- **Critical:** Severe impact, massive data exposure or system compromise

### 9.3 Incident Response Process
1. **Preparation:** Plans, tools, and training
2. **Identification:** Detecting and reporting incidents
3. **Containment:** Limiting incident scope and impact
4. **Eradication:** Removing the threat
5. **Recovery:** Restoring normal operations
6. **Lessons Learned:** Post-incident analysis and improvement

### 9.4 Communication Plan
- **Internal Notifications:** Staff, management, stakeholders
- **External Notifications:** Customers, partners, regulators
- **Media Relations:** Public communications
- **Legal Notifications:** Law enforcement, regulatory bodies

### 9.5 Forensic Procedures
- **Evidence Collection:** Preserving digital evidence
- **Chain of Custody:** Maintaining evidence integrity
- **Analysis Tools:** Forensic software and techniques
- **Expert Testimony:** Court proceedings support

## 10. Compliance Requirements

### 10.1 Regulatory Compliance

#### 10.1.1 General Data Protection Regulation (GDPR)
- **Data Protection by Design:** Built-in privacy protection
- **Data Subject Rights:** Access, rectification, erasure, portability
- **Consent Management:** Explicit and informed consent
- **Data Protection Officer (DPO):** Privacy oversight role
- **Breach Notification:** 72-hour reporting requirement

#### 10.1.2 Payment Card Industry Data Security Standard (PCI DSS)
- **Secure Network:** Firewalls and secure configurations
- **Cardholder Data Protection:** Encryption and access controls
- **Vulnerability Management:** Regular testing and updates
- **Access Control:** Restricted access to cardholder data
- **Monitoring:** Network monitoring and testing
- **Information Security Policy:** Comprehensive security policies

#### 10.1.3 Health Insurance Portability and Accountability Act (HIPAA)
- **Administrative Safeguards:** Policies and procedures
- **Physical Safeguards:** Facility and equipment controls
- **Technical Safeguards:** Technology-based protections
- **Breach Notification:** Patient and HHS notification

### 10.2 Industry Standards
- **ISO 27001:** Information Security Management System
- **SOC 2:** Service Organization Control 2
- **NIST Cybersecurity Framework:** Risk-based cybersecurity
- **CIS Controls:** Critical Security Controls
- **COBIT:** IT governance framework

### 10.3 Compliance Monitoring
- **Continuous Monitoring:** Real-time compliance checking
- **Regular Audits:** Internal and external assessments
- **Compliance Dashboard:** Management reporting
- **Gap Analysis:** Identifying compliance shortfalls
- **Remediation Tracking:** Addressing compliance issues

## 11. Security Architecture Patterns

### 11.1 Common Security Patterns
- **Authentication Gateway:** Centralized authentication
- **Authorization Service:** Centralized authorization decisions
- **Security Token Service:** Token issuance and validation
- **Audit Interceptor:** Comprehensive logging
- **Secure Proxy:** Secure communication intermediary

### 11.2 Cloud Security Patterns
- **Shared Responsibility Model:** Cloud provider and customer responsibilities
- **Cloud Security Posture Management (CSPM):** Configuration monitoring
- **Cloud Access Security Broker (CASB):** Cloud service protection
- **Zero Trust Network Access (ZTNA):** Secure remote access

### 11.3 API Security Patterns
- **API Gateway:** Centralized API management
- **Rate Limiting:** Throttling API requests
- **API Key Management:** Secure key distribution
- **OAuth 2.0/OpenID Connect:** Delegated authorization

## 12. Security Monitoring and Logging

### 12.1 Security Information and Event Management (SIEM)
- **Log Collection:** Centralized log aggregation
- **Event Correlation:** Pattern detection and analysis
- **Alerting:** Real-time threat notifications
- **Dashboards:** Security posture visualization
- **Reporting:** Compliance and management reports

### 12.2 Logging Standards
- **Log Format:** Standardized structured logging
- **Log Content:** What to log (authentication, authorization, data access)
- **Log Protection:** Integrity and confidentiality
- **Log Retention:** How long to keep logs
- **Log Analysis:** Regular review and investigation

### 12.3 Security Metrics
- **Security Incidents:** Number and severity
- **Vulnerability Metrics:** Discovery and remediation times
- **Compliance Metrics:** Audit results and gap closure
- **Security Training:** Awareness program effectiveness
- **Risk Metrics:** Risk exposure and mitigation

## 13. Security Operations

### 13.1 Security Operations Center (SOC)
- **24/7 Monitoring:** Continuous security surveillance
- **Threat Hunting:** Proactive threat detection
- **Incident Triage:** Initial incident assessment
- **Escalation Procedures:** When and how to escalate
- **Playbooks:** Standardized response procedures

### 13.2 Vulnerability Management
- **Vulnerability Scanning:** Regular automated scans
- **Risk Assessment:** Prioritizing vulnerabilities
- **Patch Management:** Timely security updates
- **Exception Handling:** Managing acceptable risks
- **Metrics and Reporting:** Vulnerability program effectiveness

### 13.3 Security Awareness Program
- **Security Training:** Regular employee education
- **Phishing Simulations:** Testing user awareness
- **Security Communications:** Ongoing security updates
- **Incident Reporting:** Encouraging security reporting
- **Security Culture:** Building security-conscious culture

## 14. Appendices

### Appendix A: Security Glossary
- **CIA Triad:** Confidentiality, Integrity, Availability
- **AAA:** Authentication, Authorization, Accounting
- **Zero Trust:** Never trust, always verify security model
- **Defense in Depth:** Layered security approach
- **SIEM:** Security Information and Event Management
- **SOAR:** Security Orchestration, Automation and Response

### Appendix B: Security Standards References
- **NIST Cybersecurity Framework:** [https://www.nist.gov/cyberframework]
- **OWASP Top 10:** [https://owasp.org/www-project-top-ten/]
- **ISO 27001/27002:** [https://www.iso.org/isoiec-27001-information-security.html]
- **CIS Controls:** [https://www.cisecurity.org/controls/]
- **SANS Top 25:** [https://www.sans.org/top25-software-errors/]

### Appendix C: Security Tools and Technologies
- **SIEM Solutions:** Splunk, IBM QRadar, ArcSight
- **Vulnerability Scanners:** Nessus, OpenVAS, Qualys
- **Web Application Scanners:** OWASP ZAP, Burp Suite
- **Network Security:** Wireshark, Nmap, Metasploit
- **Encryption Tools:** OpenSSL, GnuPG, HashiCorp Vault

### Appendix D: Compliance Checklists
- **GDPR Compliance Checklist:** Data protection requirements
- **PCI DSS Compliance Checklist:** Payment card security
- **HIPAA Compliance Checklist:** Healthcare information protection
- **SOC 2 Compliance Checklist:** Service organization controls
- **ISO 27001 Compliance Checklist:** Information security management

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **Security Team Contact:** [security-team@example.com]
- **Classification:** [Confidential]
- **Version History:**
  - v1.0 - Initial comprehensive security design document
`;
  }
}
