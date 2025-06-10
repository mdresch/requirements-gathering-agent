import { ProjectContext } from '../../types.js';

export interface ProjectKickoffChecklistConfig {
  includeSecuritySection?: boolean;
  includeComplianceSection?: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  projectType?: 'software' | 'infrastructure' | 'research' | 'general';
  aiIntegration?: boolean;
}

export class ProjectKickoffChecklistTemplate {
  constructor(
    private context: ProjectContext,
    private config: ProjectKickoffChecklistConfig = { 
      detailLevel: 'detailed',
      projectType: 'software',
      aiIntegration: true
    }
  ) {}

  /**
   * Generate the project kickoff checklist content
   */
  async generateContent(): Promise<string> {
    const sections = [
      this.generateHeader(),
      this.generateProjectInitiation(),
      this.generatePlanningAndRequirements(),
      this.generateProjectSetup(),
      this.generateRiskManagement(),
      this.generateCommunicationCoordination(),
      this.generateDeliverablesAndMilestones(),
      this.config.includeSecuritySection ? this.generateSecurityCompliance() : null,
      this.generateTrainingSupport(),
      this.generateKickoffMeeting(),
      this.generateSummary()
    ];

    return sections.filter(Boolean).join('\n\n');
  }

  /**
   * Generate document header with metadata
   */
  private generateHeader(): string {
    return `# AI-Generated Project Kickoff Checklist

# Project Kickoff Checklist for ${this.context.projectName || 'Project'}

**Document Version:** 1.0  
**Created:** ${new Date().toLocaleDateString()}  
**Project:** ${this.context.projectName || 'Unknown Project'}  
**Category:** Planning Artifacts  
**Project Type:** ${this.config.projectType}

---`;
  }

  /**
   * Generate project initiation section
   */
  private generateProjectInitiation(): string {
    return `## 1. Project Initiation

- [ ] **Confirm Project Sponsor & Product Owner** identified and engaged  
- [ ] **Define and align project vision, objectives, and success criteria** with stakeholders  
- [ ] **Review and finalize project scope** including all deliverables  
- [ ] **Identify all key stakeholders** and establish communication plan  
- [ ] **Document roles and responsibilities** for all team members and stakeholders  
- [ ] **Set up project governance framework** aligned with PMBOK standards and organizational policies`;
  }

  /**
   * Generate planning and requirements section
   */
  private generatePlanningAndRequirements(): string {
    const baseRequirements = `## 2. Planning and Requirements

- [ ] **Gather and confirm detailed functional requirements** based on user stories and acceptance criteria
- [ ] **Define non-functional requirements:** security, performance, compliance, integration, modularity  
- [ ] **Establish integration requirements** and dependencies  
- [ ] **Identify regulatory and compliance requirements**  
- [ ] **Plan for user adoption and training needs** (documentation, tutorials, support)`;

    if (this.config.aiIntegration) {
      return baseRequirements + `
- [ ] **Establish AI integration requirements:** API usage limits, authentication mechanisms, usage metrics  
- [ ] **Confirm AI model selection and configuration**  
- [ ] **Define AI fallback and error handling procedures**`;
    }

    return baseRequirements;
  }

  /**
   * Generate project setup section
   */
  private generateProjectSetup(): string {
    let setupContent = `## 3. Project Setup

- [ ] **Set up development environment:** tools, IDEs, version control, package managers  
- [ ] **Configure project repositories** with proper branch policies and access control  
- [ ] **Establish CI/CD pipelines** for build, test, and deployment automation  
- [ ] **Define coding standards and review processes**  
- [ ] **Set up testing infrastructure:** unit, integration, and validation frameworks`;

    if (this.config.aiIntegration) {
      setupContent += `
- [ ] **Provision cloud resources** needed for AI integration  
- [ ] **Establish secure credential management process**  
- [ ] **Configure AI service connections and authentication**`;
    }

    return setupContent;
  }

  /**
   * Generate risk management section
   */
  private generateRiskManagement(): string {
    return `## 4. Risk Management

- [ ] **Conduct risk workshop** to validate and refine risk register based on project specifics  
- [ ] **Assign risk owners and mitigation strategies** for key risks  
- [ ] **Implement monitoring and alerting** for system health and dependencies  
- [ ] **Plan for fallback mechanisms and error handling**  
- [ ] **Define data privacy and governance protocols**`;
  }

  /**
   * Generate communication and coordination section
   */
  private generateCommunicationCoordination(): string {
    return `## 5. Communication & Coordination

- [ ] **Establish regular project status meetings** and reporting cadence  
- [ ] **Set up collaboration platforms** with appropriate channels and permissions  
- [ ] **Define escalation paths** for issues and decisions  
- [ ] **Coordinate with stakeholders** for ongoing alignment and approvals  
- [ ] **Schedule stakeholder demos and feedback sessions** for iterative validation`;
  }

  /**
   * Generate deliverables and milestones section
   */
  private generateDeliverablesAndMilestones(): string {
    return `## 6. Deliverables & Milestones Definition

- [ ] Define milestone schedule including:  
  - Prototype/alpha release  
  - Beta with core features  
  - Full feature completion  
  - QA and UAT completion  
  - Final release and deployment  
- [ ] Define deliverable acceptance criteria based on user stories and standards  
- [ ] Plan for documentation and training materials delivery`;
  }

  /**
   * Generate security and compliance section
   */
  private generateSecurityCompliance(): string {
    return `## 7. Security & Compliance

- [ ] Review and approve security policies related to credentials, data handling, and access control  
- [ ] Define audit logging and traceability requirements  
- [ ] Ensure compliance with relevant regulations and organizational standards  
- [ ] Plan for regular security reviews and testing if applicable`;
  }

  /**
   * Generate training and support section
   */
  private generateTrainingSupport(): string {
    return `## 8. Training & Support

- [ ] Assign support and training roles  
- [ ] Develop user guides, documentation, FAQs, and training sessions  
- [ ] Plan for feedback collection and issue tracking post-launch`;
  }

  /**
   * Generate kickoff meeting section
   */
  private generateKickoffMeeting(): string {
    return `## 9. Kickoff Meeting Agenda

- [ ] Introductions and role clarifications  
- [ ] Review project objectives, scope, and success metrics  
- [ ] Present project plan, milestones, and deliverables  
- [ ] Discuss risks, challenges, and mitigation strategies  
- [ ] Confirm communication and collaboration tools  
- [ ] Open Q&A and align on next steps`;
  }

  /**
   * Generate summary section
   */
  private generateSummary(): string {
    return `---

# Summary

This checklist ensures that the ${this.context.projectName || 'project'} starts with clear objectives, comprehensive planning, stakeholder alignment, and risk preparedness. It aligns with PMBOK standards and incorporates ${this.config.aiIntegration ? 'AI integration considerations and ' : ''}project-specific requirements.

---

*This document was generated using the Requirements Gathering Agent v2.1.3*`;
  }
}
