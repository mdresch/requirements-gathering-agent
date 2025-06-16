import type { ProjectContext } from '../../ai/types';

/**
 * Template classes for Quality Assurance documents
 */
export class TestStrategyTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Test Strategy Document

**Project Name:** ${this.context.projectName}

> TODO: Define testing objectives, scope, types, approach, tools, environment, schedule, resources, risk analysis, and quality metrics.`;
  }
}

export class TestPlanTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Test Plan Template

**Project Name:** ${this.context.projectName}

> TODO: Outline test plan overview, test items, features, tasks, environment needs, responsibilities, schedule, risks, and approvals.`;
  }
}

export class TestCaseTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Test Case Specifications

**Project Name:** ${this.context.projectName}

> TODO: Detail test case structure, categories, data requirements, preconditions, steps, expected results, criteria, environment, dependencies, and traceability.`;
  }
}

export class QualityMetricsTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Quality Metrics Definition

**Project Name:** ${this.context.projectName}

> TODO: Specify quality objectives, key indicators, measurement methods, data collection, analysis, reporting, targets, improvement processes, and benchmarks.`;
  }
}

export class TechAcceptanceCriteriaTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Acceptance Criteria Template

**Project Name:** ${this.context.projectName}

> TODO: Define acceptance criteria structure, business & functional requirements, performance, UX, security, compliance, scenarios, validation methods, and sign-off.`;
  }
}

export class PerformanceTestTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Performance Test Plan

**Project Name:** ${this.context.projectName}

> TODO: Establish performance goals, scenarios, load profiles, environment, data, metrics, tools, schedule, and success criteria.`;
  }
}

export class SecurityTestingTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Security Testing Guidelines

**Project Name:** ${this.context.projectName}

> TODO: Outline security testing scope, methodology, controls, vulnerability assessment, penetration testing, tools, environment, reporting, risk assessment, and remediation.`;
  }
}

export class CodeReviewTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Code Review Checklist

**Project Name:** ${this.context.projectName}

> TODO: List code review process, quality standards, security & performance checks, documentation, testing requirements, best practices, and sign-off criteria.`;
  }
}

export class BugReportTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Bug Report Template

**Project Name:** ${this.context.projectName}

> TODO: Structure bug reports with issue description, steps to reproduce, expected vs actual, environment details, logs/screenshots, severity, priority, workflow, and resolution process.`;
  }
}

export class TestEnvironmentTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Test Environment Setup Guide

**Project Name:** ${this.context.projectName}

> TODO: Describe test environment configuration, infrastructure requirements, setup steps, data seeding, and teardown procedures.`;
  }
}
