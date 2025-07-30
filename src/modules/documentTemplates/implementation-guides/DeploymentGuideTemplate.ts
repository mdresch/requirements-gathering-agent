
import type { ProjectContext } from '../../ai/types';

/**
 * DeploymentGuideTemplate generates the content for the Deployment Guide document.
 */
export class DeploymentGuideTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Deployment Guide
   */
  generateContent(): string {
    return `# Deployment Guide\n\n` +
      `**Project:** ${this.context.projectName}\n\n` +
      `## Introduction\nOverview of deployment architecture and deployment strategy.\n\n` +
      `## Deployment Architecture\nHigh-level architecture of the deployment environment and infrastructure.\n\n` +
      `## Environment Setup\nSetup and configuration of deployment environments.\n\n` +
      `## Infrastructure Requirements\nHardware, software, and network requirements for deployment.\n\n` +
      `## Deployment Strategies\nDifferent deployment strategies including blue-green, canary, and rolling deployments.\n\n` +
      `## Configuration Management\nManagement of configuration files and environment-specific settings.\n\n` +
      `## Security Considerations\nSecurity best practices for deployment including access control and data protection.\n\n` +
      `## Monitoring and Health Checks\nImplementation of monitoring, health checks, and alerting systems.\n\n` +
      `## Backup and Recovery\nBackup strategies and disaster recovery procedures.\n\n` +
      `## Scaling Procedures\nProcedures for scaling applications horizontally and vertically.\n\n` +
      `## Maintenance and Updates\nProcedures for performing maintenance and applying updates.\n\n` +
      `{{AI_INSIGHTS}}\n`;
  }
}
