import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { SecurityTestingTemplate } from './SecurityTestingTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Security Testing document.
 */
export class SecurityTestingProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { 
          role: 'system', 
          content: `You are an expert Security Testing Engineer and Cybersecurity professional with extensive experience in creating comprehensive security testing plans.

**YOUR TASK:**
Generate a detailed "Security Testing" document based on the provided project context.

**PROCESS:**
1. **Security Assessment:** Identify security risks and vulnerability areas
2. **Test Strategy:** Define comprehensive security testing approach and methodologies
3. **Test Design:** Create specific security test scenarios and attack simulations
4. **Tool Selection:** Recommend appropriate security testing tools and frameworks
5. **Compliance Validation:** Ensure security standards and regulatory compliance

The output must be professional, technically precise, and actionable for security testing teams.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Security Testing',
        content
      };
    } catch (error) {
      console.error('Error in SecurityTestingProcessor:', error);
      
      if (error instanceof ExpectedError) {
        throw error;
      }      const template = new SecurityTestingTemplate();
      const fallbackContent = await template.generateContent(context);
      
      return {
        title: 'Security Testing',
        content: fallbackContent
      };
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the provided project context, create a comprehensive security testing document that includes:

## Security Testing Plan

### 1. Security Testing Overview
- Security testing objectives and goals
- Security risk assessment and threat modeling
- Compliance requirements and standards
- Security testing scope and limitations

### 2. Security Test Strategy
Define comprehensive security testing approach:
- **Authentication Testing:** User identity verification and session management
- **Authorization Testing:** Access control and permission validation
- **Input Validation Testing:** Protection against injection attacks and malicious input
- **Data Protection Testing:** Encryption, data integrity, and privacy protection
- **Network Security Testing:** Communication security and network vulnerabilities
- **Application Security Testing:** Code vulnerabilities and security weaknesses

### 3. Security Test Types and Methodologies
- **Vulnerability Assessment:** Automated scanning for known vulnerabilities
- **Penetration Testing:** Manual testing to exploit security weaknesses
- **Security Code Review:** Static analysis of source code for security issues
- **Configuration Testing:** Security configuration validation and hardening
- **Compliance Testing:** Regulatory and industry standard compliance validation
- **Social Engineering Testing:** Human factor security testing

### 4. Security Test Scenarios
Create detailed security test scenarios:
- **Authentication Attacks:** Brute force, credential stuffing, session hijacking
- **Authorization Bypass:** Privilege escalation, access control circumvention
- **Injection Attacks:** SQL injection, XSS, command injection, LDAP injection
- **Data Exposure:** Sensitive data leakage, information disclosure
- **Denial of Service:** Resource exhaustion, application layer attacks
- **Cryptographic Failures:** Weak encryption, key management vulnerabilities

### 5. Security Testing Tools and Technologies
- **Vulnerability Scanners:** OWASP ZAP, Nessus, OpenVAS, Qualys
- **Penetration Testing Tools:** Metasploit, Burp Suite, Nmap, Wireshark
- **Static Analysis Tools:** SonarQube Security, Checkmarx, Veracode
- **Dynamic Analysis Tools:** Interactive security testing tools
- **Compliance Scanners:** PCI DSS, HIPAA, SOX compliance validation tools

### 6. Security Test Environment
- Security testing environment setup and isolation
- Test data security and privacy considerations
- Network segmentation and security controls
- Monitoring and logging for security testing activities

### 7. Security Test Execution
- Security test execution phases and timeline
- Test result analysis and vulnerability classification
- Security incident response during testing
- Remediation tracking and validation

### 8. Security Compliance and Standards
- **Regulatory Compliance:** GDPR, HIPAA, PCI DSS, SOX requirements
- **Industry Standards:** OWASP Top 10, NIST Cybersecurity Framework
- **Security Frameworks:** ISO 27001, CIS Controls, SANS Top 25
- **Compliance Validation:** Audit trails and compliance reporting

### 9. Security Metrics and Reporting
- Security vulnerability metrics and KPIs
- Risk assessment and impact analysis
- Security test coverage and effectiveness
- Executive security reporting and dashboards

### 10. Security Improvement and Remediation
- Vulnerability remediation priorities and timelines
- Security control implementation and validation
- Continuous security monitoring and improvement
- Security awareness and training recommendations

Context: ${JSON.stringify(context, null, 2)}

Please provide a comprehensive security testing plan with specific test scenarios, tools, methodologies, and compliance requirements tailored to the project context.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated security testing content is empty');
    }

    if (content === this.createPrompt({} as ProjectContext)) {
      throw new ExpectedError('AI returned the prompt instead of generating security testing content');
    }

    const requiredSections = [
      'security testing',
      'vulnerability',
      'authentication',
      'authorization',
      'penetration',
      'compliance',
      'encryption'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      console.warn(`Security Testing document may be missing sections: ${missingSections.join(', ')}`);
    }

    // Additional validation for security testing specific content
    const securityTestingKeywords = [
      'security',
      'vulnerability',
      'penetration',
      'authentication',
      'authorization',
      'encryption',
      'attack',
      'compliance'
    ];

    const hasSecurityTestingContent = securityTestingKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (!hasSecurityTestingContent) {
      throw new ExpectedError('Generated content does not appear to be security testing documentation');
    }
  }
}
