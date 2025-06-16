import type { ProjectContext } from '../../ai/types';

/**
 * Template classes for Technical Design documents
 */

export class ArchitectureDesignTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Architecture Design Document

**Project Name:** ${this.context.projectName}

> TODO: Add system overview, architecture principles, components, data flow, etc.`;
  }
}

export class SystemDesignTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# System Design Specification

**Project Name:** ${this.context.projectName}

> TODO: Add system purpose, architecture, module descriptions, interfaces, constraints, etc.`;
  }
}

export class DatabaseSchemaTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Database Schema Design

**Project Name:** ${this.context.projectName}

> TODO: Add entity relationships, table definitions, keys, indexes, normalization, etc.`;
  }
}

export class APIDocumentationTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# API Documentation

**Project Name:** ${this.context.projectName}

> TODO: Document endpoints, request/response formats, authentication, error codes, etc.`;
  }
}

export class SecurityDesignTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Security Design Document

**Project Name:** ${this.context.projectName}

> TODO: Add threat model, security controls, encryption, authentication, etc.`;
  }
}

export class PerformanceRequirementsTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Performance Requirements

**Project Name:** ${this.context.projectName}

> TODO: Specify performance goals, benchmarks, scalability targets, etc.`;
  }
}

export class IntegrationDesignTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Integration Design

**Project Name:** ${this.context.projectName}

> TODO: Detail integration points, data flows, interfaces, protocols, etc.`;
  }
}

export class TechnicalStackTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Technical Stack Overview

**Project Name:** ${this.context.projectName}

> TODO: List languages, frameworks, databases, tools, and architecture rationale.`;
  }
}

export class DeploymentArchitectureTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Deployment Architecture

**Project Name:** ${this.context.projectName}

> TODO: Describe deployment topology, environments, CI/CD, scaling, etc.`;
  }
}

export class ErrorHandlingTemplate {
  constructor(private context: ProjectContext) {}

  generateContent(): string {
    return `# Error Handling Guidelines

**Project Name:** ${this.context.projectName}

> TODO: Specify error handling strategies, logging, retries, fallbacks, etc.`;
  }
}
