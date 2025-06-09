import { ProjectContext } from '../../types';

export interface PreparationsKickOffChecklistConfig {
  includeRiskAssessment?: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  customSections?: string[];
}

export class PreparationsKickOffChecklistTemplate {
  constructor(
    private context: ProjectContext,
    private config: PreparationsKickOffChecklistConfig = { detailLevel: 'detailed' }
  ) {}

  /**
   * Generate the document content
   */
  async generateContent(): Promise<string> {
    const sections = [
      this.generateHeader(),
      this.generateExecutiveSummary(),
      await this.generateMainSections(),
      this.generateConclusion()
    ];

    return sections.filter(Boolean).join('\n\n');
  }

  /**
   * Generate document header with metadata
   */
  private generateHeader(): string {
    return `# Preparations Kick-off Checklist

**Document Version:** 1.0  
**Created:** ${new Date().toLocaleDateString()}  
**Project:** ${this.context.projectName || 'Unknown Project'}  
**Category:** Core Analysis  

---`;
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(): string {
    return `## Executive Summary

This document provides a checklist to ensure all necessary preparations are completed before the project kick-off.

### Key Objectives
- Ensure all team members are briefed on project goals.
- Verify that all resources are available.
- Confirm stakeholder engagement and communication plans.`;
  }

  /**
   * Generate main document sections
   */
  private async generateMainSections(): Promise<string> {
    const sections = [];

    // Add your specific sections here
    sections.push(this.generateChecklistItems());
    
    if (this.config.includeRiskAssessment) {
      sections.push(this.generateRiskAssessment());
    }

    return sections.join('\n\n');
  }

  /**
   * Example section generator for checklist items
   */
  private generateChecklistItems(): string {
    return `## Checklist Items

- [ ] Review project charter and objectives.
- [ ] Confirm stakeholder roles and responsibilities.
- [ ] Ensure all necessary resources are allocated.
- [ ] Schedule kick-off meeting with all stakeholders.
- [ ] Prepare presentation materials for the kick-off meeting.
- [ ] Verify communication channels and tools are set up.`;
  }

  /**
   * Generate risk assessment section
   */
  private generateRiskAssessment(): string {
    return `## Risk Assessment

- Identify potential risks associated with the project kick-off.
- Assess the impact and likelihood of each risk.
- Develop mitigation strategies for high-priority risks.`;
  }

  /**
   * Generate conclusion
   */
  private generateConclusion(): string {
    return `## Conclusion

This checklist is designed to ensure a smooth project kick-off. Please review and complete all items before proceeding.

---

*This document was generated using the Requirements Gathering Agent v2.1.3*`;
  }
} 