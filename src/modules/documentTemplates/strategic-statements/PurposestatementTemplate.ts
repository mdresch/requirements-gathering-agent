import type { ProjectContext } from '../../ai/types';

/**
 * Purpose Statement Template generates the content for the Purpose Statement document.
 */
export class PurposestatementTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Purpose Statement
   */
  generateContent(): string {
    return `# Project Purpose Statement

**Project:** ${this.context.projectName || 'Untitled Project'}

${this.context.description ? `**Description:** ${this.context.description}\n\n` : ''}

## Executive Summary

*[This section should provide a brief overview of YOUR specific project's fundamental purpose and strategic importance. The AI should customize this entirely based on the project context provided, not use ADPA as an example.]*

**Template Example:** "The [Project Name] project will develop and deploy [solution type] to address [key business challenge]. This initiative will [primary benefit] while [secondary benefits], ultimately [strategic outcome]."

## Problem Statement

### Current State Challenges

*[Describe the specific problems or challenges that YOUR project addresses. These should be real pain points relevant to your project domain, not generic documentation issues.]*

**Template Examples:**
- **Business Challenge:** [Specific operational inefficiency your project solves]
- **Market Gap:** [Unmet customer needs or competitive disadvantage]
- **Technical Debt:** [System limitations or technology constraints]
- **Process Issues:** [Workflow problems or compliance gaps]
- **Resource Constraints:** [Capacity or capability limitations]

### Impact of Inaction

*[What specific consequences will occur if YOUR project is not undertaken? Focus on business impact relevant to your domain.]*

Without this project, the organization will continue to face:
- [Specific consequence 1 related to your project domain]
- [Specific consequence 2 with measurable impact]
- [Strategic risk or missed opportunity]
- [Competitive disadvantage or market position loss]

## Proposed Solution

*[Describe YOUR project's specific solution approach. This should be completely different for each project type.]*

### Key Features

*[List the specific capabilities, features, or deliverables of YOUR project:]*

1. **[Core Capability 1]:** [Description of how this addresses the problem]

2. **[Core Capability 2]:** [Technical or functional description specific to your solution]

3. **[Core Capability 3]:** [Integration or scalability aspects]

4. **[Quality Assurance]:** [How you'll ensure solution quality and reliability]

5. **[User Experience]:** [How stakeholders will interact with the solution]

6. **[Future-Proofing]:** [Extensibility and long-term viability]

2. **Holistic Context Management:** ADPA analyzes all provided inputs to build a rich, contextual understanding of the project, ensuring generated documents are accurate, relevant, and internally consistent

3. **Guaranteed PMBOK 7.0 Compliance:** Templates and generation logic are aligned with PMBOK 7.0 principles and performance domains, ensuring all outputs meet industry best practices

4. **Automated Quality Assurance:** The platform includes built-in validation checks and quality scoring to identify potential errors or gaps, ensuring high-quality, reliable outputs

5. **Accessible Interface:** Initial deployment via a Command-Line Interface (CLI) for power users and CI/CD integration, with a planned roadmap for a user-friendly web-based GUI to ensure broad adoption

6. **Modular and Extensible Architecture:** Designed for future growth, allowing for the easy addition of new document templates and integration with other enterprise project management tools

## Project Goals and Success Metrics

*[Define the specific, measurable goals for YOUR project. These should be relevant to your domain and achievable within your project scope.]*

**Template Structure - Customize these for your specific project:**

**Goal 1: [Primary Business Objective]** 
- Target: [Specific measurable outcome, e.g., "Reduce processing time by 40%"]
- Timeline: [When this will be achieved]

**Goal 2: [Quality/Performance Objective]** 
- Target: [Quality metric, e.g., "Achieve 99.5% uptime"]
- Measurement: [How this will be tracked]

**Goal 3: [Stakeholder/User Objective]** 
- Target: [User satisfaction or adoption metric]
- Success Criteria: [What success looks like]

**Goal 4: [Strategic/Long-term Objective]** 
- Target: [Long-term business impact]
- Value: [How this supports organizational strategy]

### Key Performance Indicators

*[List specific, measurable KPIs relevant to YOUR project:]*

- [Quantitative metric 1] - baseline, target, measurement method
- [Quantitative metric 2] - frequency of measurement, responsible party  
- [Qualitative metric 1] - survey method, sample size, frequency
- [Financial metric] - ROI calculation, time to value
- [Operational metric] - efficiency gain, error reduction

## Stakeholder Value Proposition

### Primary Beneficiaries

- **Project Managers:** Enhanced productivity and reduced administrative burden
- **Project Teams:** More time for strategic work and value creation
- **Executives:** Improved project visibility and consistent reporting
- **Stakeholders:** Clear, professional documentation and better communication

## Strategic Alignment

The ADPA project provides direct support for our organization's core strategic pillars:

- **Operational Excellence:** Automates a high-effort, low-value task, freeing up skilled resources for strategic work
- **Risk Mitigation:** Improves the quality and consistency of project planning artifacts, leading to more predictable project outcomes
- **Digital Innovation:** Leverages cutting-edge AI to create a distinct competitive advantage in our project delivery capability
- **Stakeholder Trust:** Fosters clearer communication and greater transparency through accessible, high-quality documentation

## Implementation Principles

### Guiding Principles

1. **Quality-First:** Uncompromising commitment to documentation excellence
2. **User-Centric:** Designed for both technical and non-technical users
3. **Scalable:** Built to grow with organizational needs
4. **Compliant:** Ensures adherence to industry standards
5. **Transparent:** Clear processes and measurable outcomes

## Communication Strategy

### Purpose Communication

- Regular stakeholder updates highlighting progress and value delivery
- Training and onboarding programs for user adoption
- Success story sharing and lessons learned
- Continuous reinforcement of strategic value and benefits

## Conclusion

The Automated Documentation Project Assistant is a transformative initiative aimed at modernizing our project management practices. By replacing inefficient manual processes with intelligent automation, ADPA will deliver substantial gains in efficiency, quality, and compliance. This project is a critical investment in our ability to deliver projects successfully and predictably, directly contributing to our organization's long-term strategic success.

---

*This Purpose Statement serves as the foundational document that guides all project decisions and activities. It should be reviewed regularly and updated as the project evolves.*

**Document Version:** 1.1  
**Last Updated:** ${new Date().toLocaleDateString()}  
**Next Review:** ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
  }
}
