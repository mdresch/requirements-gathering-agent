import type { ProjectContext } from '../../ai/types.js';

/**
 * Generates the content for the Business Intelligence & Analytics Strategy document.
 * @param context Project context and relationships
 * @returns Markdown string for the BI & Analytics Strategy
 */
export function generateContent(context: ProjectContext): string {
  return `# Business Intelligence & Analytics Strategy for ${context.projectName}

## Executive Summary
- Business Context
- Strategic Objectives
- Expected Outcomes

## Current State Assessment
- Existing BI/Analytics Capabilities
- Gaps and Challenges
- Data Maturity Assessment

## Target Architecture
- BI Architecture Overview
- Technology Stack
- Data Integration Strategy
- Infrastructure Requirements

## Analytics Strategy
- Descriptive Analytics
- Diagnostic Analytics
- Predictive Analytics
- Prescriptive Analytics

## Self-Service BI Framework
- User Roles and Permissions
- Tools and Platforms
- Training and Support
- Governance and Standards

## Implementation Roadmap
- Phased Approach
- Key Milestones
- Resource Requirements
- Success Metrics

## Governance and Quality
- Data Quality Management
- Metadata Management
- Security and Compliance
- Performance Monitoring

## Appendices
- Glossary
- Tool Evaluation Matrix
- Case Studies
- References
`;
}
