import type { ProjectContext } from '../../ai/types';

/**
 * Template classes for Implementation Guides documents
 */
export class CodingStandardsTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Coding Standards Guide

**Project Name:** ${this.context.projectName}

> TODO: Define code conventions, linting rules, formatting guidelines, naming conventions, and best practices.`;
  }
}

export class DevelopmentSetupTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Development Setup Guide

**Project Name:** ${this.context.projectName}

> TODO: Document environment setup steps, dependencies installation, configuration files, and local development commands.`;
  }
}

export class VersionControlTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Version Control Guide

**Project Name:** ${this.context.projectName}

> TODO: Outline branching strategy, commit message conventions, pull request process, and repository management guidelines.`;
  }
}

export class CIPipelineTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# CI Pipeline Guide

**Project Name:** ${this.context.projectName}

> TODO: Describe CI tools, pipeline stages, test automation, and deployment triggers.`;
  }
}

export class ReleaseProcessTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Release Process Guide

**Project Name:** ${this.context.projectName}

> TODO: Define release workflows, versioning strategy, rollback procedures, and approvals.`;
  }
}

export class CodeDocumentationTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Code Documentation Guide

**Project Name:** ${this.context.projectName}

> TODO: Specify docblock formats, documentation tools, examples, and update policies.`;
  }
}

export class TroubleshootingTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Troubleshooting Guide

**Project Name:** ${this.context.projectName}

> TODO: List common issues, diagnostics steps, logging tips, and support contacts.`;
  }
}

export class DevelopmentWorkflowTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Development Workflow Guide

**Project Name:** ${this.context.projectName}

> TODO: Describe development cadence, task tracking, code review flow, and release cycles.`;
  }
}

export class APIIntegrationTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# API Integration Guide

**Project Name:** ${this.context.projectName}

> TODO: Document external API endpoints, authentication, error handling, and data mapping.`;
  }
}

export class DeploymentGuideTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Deployment Guide

**Project Name:** ${this.context.projectName}

> TODO: Outline deployment steps, environment configurations, rollback procedures, and post-deployment checks.`;
  }
}
