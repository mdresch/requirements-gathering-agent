import { ProjectContext } from '../../ai/types';
import { DocumentOutput } from '../../documentGenerator/types.js';
import { GENERATION_TASKS } from '../../documentGenerator/generationTasks.js';
import { validateWithPMBOK } from '../../pmbokValidation/index.js';

export class ProjectKickoffPreparationsChecklistProcessor {
  async process(context: ProjectContext): Promise<DocumentOutput> {
    const project = context.projectName || 'Unknown Project';

    // Get all planning artifact keys (exclude the checklist itself)
    const planningArtifacts = GENERATION_TASKS.filter(
      t => t.category === 'planning-artifacts' && t.key !== 'project-kickoff-preparations-checklist'
    );
    const artifactKeys = planningArtifacts.map(t => t.key);

    // Validate existence and PMBOK compliance/quality
    const validation = await validateWithPMBOK(artifactKeys);
    const quality = validation.pmbokCompliance.documentQuality;
    const missing = new Set(validation.validation.missing.map(m => m.split(' ')[0]));

    // Build dynamic checklist section for PMBOK planning artifacts
    let artifactChecklist = '## PMBOK Planning Artifacts Checklist\n\n';
    artifactChecklist += '| Status | Artifact | Quality | Issues |\n';
    artifactChecklist += '|--------|----------|---------|--------|\n';
    for (const artifact of planningArtifacts) {
      const key = artifact.key;
      const docQuality = quality[key];
      let status = '[ ]';
      let qualityScore = '-';
      let issues = '-';
      if (!docQuality || missing.has(key)) {
        status = '[ ]';
        issues = 'Missing';
      } else if (docQuality.score >= 70) {
        status = '[x]';
        qualityScore = docQuality.score.toString();
        issues = docQuality.issues.length ? docQuality.issues.join('; ') : 'None';
      } else if (docQuality.score > 0) {
        status = '[-]';
        qualityScore = docQuality.score.toString();
        issues = docQuality.issues.length ? docQuality.issues.join('; ') : 'Quality below threshold';
      }
      artifactChecklist += `| ${status} | ${artifact.name} | ${qualityScore} | ${issues} |\n`;
    }

    // Compose the rest of the checklist (static sections)
    const staticSections = `
---

## 1. Project Initiation

- [ ] **Confirm Project Sponsor & Product Owner** identified and engaged
- [ ] **Define and align project vision, objectives, and success criteria** with stakeholders
- [ ] **Review and finalize project scope** including all deliverables (PMBOK-compliant docs, modular CLI, Azure AI integration)
- [ ] **Identify all key stakeholders** (PMs, BAs, Developers, Compliance, IT leadership, Vendors) and establish communication plan
- [ ] **Document roles and responsibilities** for all team members and stakeholders
- [ ] **Set up project governance framework** aligned with PMBOK standards and organizational policies

---

## 2. Planning and Requirements

- [ ] **Gather and confirm detailed functional requirements** based on user stories and acceptance criteria, including:
  - Project Charter generation
  - Stakeholder Register
  - Requirements Management Plan
  - Technology Stack Analysis
  - Risk Management Plan
  - WBS and WBS Dictionary
  - Quality Management Plan
  - Compliance Considerations documentation
  - CLI interface with modular generation
- [ ] **Define non-functional requirements:** security, performance, compliance, integration, modularity
- [ ] **Confirm JSON schema definitions** for all generated documents and output formats
- [ ] **Establish AI integration requirements:** Azure AI API usage limits, authentication mechanisms, usage metrics
- [ ] **Identify regulatory and compliance requirements** with Compliance Officers’ input
- [ ] **Plan for user adoption and training needs** (documentation, tutorials, support)

---

## 3. Project Setup

- [ ] **Provision Azure resources** needed for AI integration (Azure OpenAI, Identity)
- [ ] **Establish secure credential management process** (Azure Key Vault, environment variables, secrets scanning)
- [ ] **Set up development environment:** Node.js/TypeScript, IDEs, version control (Git), package managers
- [ ] **Configure project repositories** with proper branch policies and access control
- [ ] **Establish CI/CD pipelines** for build, test, and deployment automation
- [ ] **Define coding standards and review processes** (TypeScript best practices, linting)
- [ ] **Set up testing infrastructure:** unit, integration, and schema validation frameworks

---

## 4. Risk Management

- [ ] **Conduct risk workshop** to validate and refine risk register based on project specifics
- [ ] **Assign risk owners and mitigation strategies** for key risks (AI accuracy, security, compliance, dependencies)
- [ ] **Implement monitoring and alerting** for Azure AI usage, API limits, and system health
- [ ] **Plan for fallback mechanisms and error handling** in case of Azure AI service issues
- [ ] **Define data privacy and governance protocols** for AI data handling and storage

---

## 5. Communication & Coordination

- [ ] **Establish regular project status meetings** and reporting cadence
- [ ] **Set up collaboration platforms** (Slack, MS Teams, Confluence, Jira) with appropriate channels and permissions
- [ ] **Define escalation paths** for issues and decisions
- [ ] **Coordinate with Compliance Officers and PMO Admins** for ongoing alignment and approvals
- [ ] **Schedule stakeholder demos and feedback sessions** for iterative validation

---

## 6. Deliverables & Milestones Definition

- [ ] Define milestone schedule including:
  - Prototype/alpha release (basic doc generation)
  - Beta with AI integration and CLI commands
  - Full feature completion with all document types and modular API
  - QA and UAT completion
  - Final release and deployment
- [ ] Define deliverable acceptance criteria based on user stories and PMBOK standards
- [ ] Plan for documentation and training materials delivery

---

## 7. Security & Compliance

- [ ] Review and approve security policies related to credentials, data handling, and access control
- [ ] Define audit logging and traceability requirements for AI calls and document generation
- [ ] Ensure compliance with relevant regulations and organizational standards
- [ ] Plan for regular security reviews and penetration testing if applicable

---

## 8. Training & Support

- [ ] Assign support and training roles
- [ ] Develop user guides, CLI usage docs, FAQs, and training sessions
- [ ] Plan for feedback collection and issue tracking post-launch

---

## 9. Kickoff Meeting Agenda (Initial)

- [ ] Introductions and role clarifications
- [ ] Review project objectives, scope, and success metrics
- [ ] Present project plan, milestones, and deliverables
- [ ] Discuss risks, challenges, and mitigation strategies
- [ ] Confirm communication and collaboration tools
- [ ] Open Q&A and align on next steps

---

# Summary

This checklist ensures that the ${project} project starts with clear objectives, comprehensive planning, secure and scalable architecture considerations, stakeholder alignment, and risk preparedness. It aligns tightly with PMBOK standards and the project’s detailed user stories and technical context.`;

    return {
      title: 'Project KickOff Preparations Checklist',
      content: `# Project KickOff Preparations Checklist for ${project}\n\n${artifactChecklist}\n${staticSections}`
    }
  }
}
