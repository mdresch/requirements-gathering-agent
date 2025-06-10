import { ProjectContext } from '../../types.js';
import { validatePMBOKCompliance } from '../../validation/pmbokValidator.js';

export interface StrategicStatementsConfig {
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
}

export class MissionVisionCoreValuesTemplate {
  constructor(
    private context: ProjectContext,
    private config: StrategicStatementsConfig = { detailLevel: 'detailed' }
  ) {}

  async generateContent(): Promise<string> {
    const sections = [
      this.generateHeader(),
      this.generateExecutiveSummary(),
      await this.generateMainSections(),
      this.generateConclusion()
    ];
    return sections.filter(Boolean).join('\n\n');
  }

  private generateHeader(): string {
    return `# Mission, Vision & Core Values\n\n**Document Version:** 1.0  \n**Created:** ${new Date().toLocaleDateString()}  \n**Project:** ${this.context.projectName || 'Unknown Project'}  \n**Category:** Strategic Statements  \n\n---`;
  }

  private generateExecutiveSummary(): string {
    return `## Executive Summary\n\nThis document articulates the mission, vision, and core values for the project, providing strategic alignment and guiding principles.\n\n### Key Objectives\n- Define the project mission\n- Clarify the vision for long-term impact\n- Establish core values to guide decision-making`;
  }

  private async generateMainSections(): Promise<string> {
    return [
      this.generateMissionSection(),
      this.generateVisionSection(),
      this.generateCoreValuesSection()
    ].join('\n\n');
  }

  private generateMissionSection(): string {
    return `## Mission\n\n[Project-specific mission statement goes here]`;
  }

  private generateVisionSection(): string {
    return `## Vision\n\n[Project-specific vision statement goes here]`;
  }

  private generateCoreValuesSection(): string {
    return `## Core Values\n\n- [Value 1]\n- [Value 2]\n- [Value 3]`;
  }

  private generateConclusion(): string {
    return `## Conclusion\n\nThese statements provide a foundation for project culture and strategic direction.\n\n---\n\n*This document was generated using the Requirements Gathering Agent v2.1.3*`;
  }

  async validateCompliance(): Promise<boolean> {
    return validatePMBOKCompliance(await this.generateContent(), 'strategic-statements');
  }
}

export class ProjectPurposeTemplate {
  constructor(
    private context: ProjectContext,
    private config: StrategicStatementsConfig = { detailLevel: 'detailed' }
  ) {}

  async generateContent(): Promise<string> {
    const sections = [
      this.generateHeader(),
      this.generateExecutiveSummary(),
      await this.generateMainSections(),
      this.generateConclusion()
    ];
    return sections.filter(Boolean).join('\n\n');
  }

  private generateHeader(): string {
    return `# Project Purpose\n\n**Document Version:** 1.0  \n**Created:** ${new Date().toLocaleDateString()}  \n**Project:** ${this.context.projectName || 'Unknown Project'}  \n**Category:** Strategic Statements  \n\n---`;
  }

  private generateExecutiveSummary(): string {
    return `## Executive Summary\n\nThis document defines the purpose of the project, its intended outcomes, and its alignment with organizational strategy.\n\n### Key Objectives\n- State the primary purpose\n- Describe intended outcomes\n- Align with strategic goals`;
  }

  private async generateMainSections(): Promise<string> {
    return [
      this.generatePurposeSection(),
      this.generateAlignmentSection(),
      this.generateOutcomesSection()
    ].join('\n\n');
  }

  private generatePurposeSection(): string {
    return `## Purpose\n\n[Project-specific purpose statement goes here]`;
  }

  private generateAlignmentSection(): string {
    return `## Strategic Alignment\n\n[Describe how the project aligns with organizational or program strategy]`;
  }

  private generateOutcomesSection(): string {
    return `## Intended Outcomes\n\n- [Outcome 1]\n- [Outcome 2]\n- [Outcome 3]`;
  }

  private generateConclusion(): string {
    return `## Conclusion\n\nA clear project purpose ensures all stakeholders are aligned and focused on shared goals.\n\n---\n\n*This document was generated using the Requirements Gathering Agent v2.1.3*`;
  }

  async validateCompliance(): Promise<boolean> {
    return validatePMBOKCompliance(await this.generateContent(), 'strategic-statements');
  }
}
