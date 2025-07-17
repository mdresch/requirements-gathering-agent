import type { ProjectContext } from '../../../index.js';

export class DataIntegrationInteroperabilityStrategyTemplate {
  private context: ProjectContext;

  constructor(context: ProjectContext) {
    this.context = context;
  }

  generateContent(): string {
    return `
# Data Integration & Interoperability Strategy for ${this.context.projectName}

## 1. Introduction
- Purpose, Scope, and Objectives
- Alignment with Business and IT Strategy
- Key Drivers and Expected Outcomes

## 2. Current State Assessment
- Overview of Existing Integration Landscape
- Key Pain Points and Challenges
- Inventory of Current Integration Patterns and Technologies

## 3. Guiding Principles
- Architectural Principles (e.g., Loose Coupling, Reusability, Scalability)
- Data Governance and Quality Principles
- Security and Compliance Principles

## 4. Target Integration Architecture
- Conceptual Architecture (e.g., Hub-and-Spoke, ESB, Microservices, API-Led)
- Logical Data Flow Patterns
- Technology Stack Recommendations

## 5. Data Integration Patterns
- Batch Integration (ETL/ELT)
- Real-time Integration (e.g., CDC, Messaging, APIs)
- Data Virtualization and Federation
- API-Based Integration

## 6. Interoperability Standards
- Data Format Standards (e.g., JSON, XML, Avro)
- Communication Protocols (e.g., REST, SOAP, gRPC, AMQP)
- API Design and Management Standards
- Metadata and Data Dictionary Standards

## 7. Governance and Security
- Integration Governance Framework
- Roles and Responsibilities
- Data Quality and Error Handling Procedures
- Security, Authentication, and Authorization Policies

## 8. Tooling and Technology
- Recommended Integration Platform(s) (iPaaS, ESB)
- API Gateway and Management Tools
- Monitoring, Logging, and Alerting Tools

## 9. Implementation Roadmap
- Phased Rollout Plan
- Key Initiatives and Milestones
- Resource and Skill Requirements
- Change Management and Communication Plan

## 10. Performance Metrics and KPIs
- KPIs to Measure Success (e.g., Integration Uptime, Data Accuracy, Development Time)
- Monitoring and Reporting Strategy
- Continuous Improvement Process

## 11. Approval

`;
  }
}
