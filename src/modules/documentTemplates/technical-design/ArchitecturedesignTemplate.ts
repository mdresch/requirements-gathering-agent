import type { ProjectContext } from '../../ai/types';

/**
 * Architecture Design Template generates comprehensive architecture documentation
 * following PMBOK 7.0 performance domains and best practices.
 */
export class ArchitecturedesignTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Architecture Design Document
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    
    return `# Architecture Design Document

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  

## Executive Summary

${projectDescription}

This document outlines the comprehensive system architecture for ${projectName}, including system overview, architectural principles, component design, data flows, integration patterns, and technical decisions.

## 1. System Overview

### 1.1 Purpose and Scope
- **System Purpose:** [Define the primary purpose and goals of the system]
- **Business Context:** [Explain how this system fits within the broader business ecosystem]
- **Scope Boundaries:** [Define what is included and excluded from this architecture]

### 1.2 Stakeholders
- **Primary Users:** [Identify end users and their needs]
- **System Administrators:** [Define admin roles and responsibilities]
- **Developers:** [Outline development team requirements]
- **Business Stakeholders:** [List key business decision makers]

## 2. Architectural Principles

### 2.1 Design Principles
- **Modularity:** Components should be loosely coupled and highly cohesive
- **Scalability:** System must handle growth in users, data, and transactions
- **Reliability:** Maintain high availability and fault tolerance
- **Security:** Implement defense-in-depth security strategies
- **Maintainability:** Design for easy updates and modifications
- **Performance:** Optimize for response time and throughput

### 2.2 Quality Attributes
- **Availability:** Target 99.9% uptime
- **Performance:** Sub-second response times for critical operations
- **Scalability:** Support for horizontal and vertical scaling
- **Security:** End-to-end encryption and secure authentication
- **Usability:** Intuitive interfaces and workflows

## 3. System Architecture

### 3.1 High-Level Architecture
\`\`\`
[Presentation Layer]
        ↓
[Application Layer]
        ↓
[Business Logic Layer]
        ↓
[Data Access Layer]
        ↓
[Data Storage Layer]
\`\`\`

### 3.2 Architectural Patterns
- **Pattern:** [e.g., Microservices, Layered, Event-Driven]
- **Rationale:** [Explain why this pattern was chosen]
- **Implementation:** [Describe how the pattern is implemented]

### 3.3 System Context Diagram
\`\`\`
[External System A] ←→ [${projectName}] ←→ [External System B]
                           ↕
                    [Database Systems]
\`\`\`

## 4. Component Design

### 4.1 Core Components

#### 4.1.1 [Component Name]
- **Purpose:** [What this component does]
- **Responsibilities:** [Key functions and duties]
- **Interfaces:** [How other components interact with it]
- **Dependencies:** [What it depends on]
- **Technology Stack:** [Languages, frameworks, libraries]

#### 4.1.2 [Component Name]
- **Purpose:** [What this component does]
- **Responsibilities:** [Key functions and duties]
- **Interfaces:** [How other components interact with it]
- **Dependencies:** [What it depends on]
- **Technology Stack:** [Languages, frameworks, libraries]

### 4.2 Component Interaction
- **Communication Patterns:** [Synchronous/Asynchronous, REST, GraphQL, messaging]
- **Data Flow:** [How data moves between components]
- **Error Handling:** [How errors are propagated and handled]

## 5. Data Architecture

### 5.1 Data Model
- **Conceptual Model:** [High-level data relationships]
- **Logical Model:** [Detailed entity relationships]
- **Physical Model:** [Database-specific implementation]

### 5.2 Data Storage Strategy
- **Primary Database:** [Type, rationale, schema design]
- **Caching Strategy:** [Redis, Memcached, application-level caching]
- **Data Backup:** [Backup frequency, retention, recovery procedures]
- **Data Migration:** [Versioning, migration scripts, rollback plans]

### 5.3 Data Security
- **Encryption:** [At-rest and in-transit encryption]
- **Access Control:** [Role-based permissions, authentication]
- **Data Privacy:** [PII handling, GDPR compliance]
- **Audit Logging:** [Data access tracking and monitoring]

## 6. Integration Architecture

### 6.1 External Integrations
- **Third-Party APIs:** [List and describe external service integrations]
- **Authentication:** [OAuth, API keys, certificate-based auth]
- **Data Exchange:** [Formats, protocols, frequency]
- **Error Handling:** [Retry logic, circuit breakers, fallback strategies]

### 6.2 Internal Integrations
- **Service Communication:** [Inter-service communication patterns]
- **Event Handling:** [Event-driven architecture, pub/sub patterns]
- **Workflow Management:** [Business process orchestration]

## 7. Technology Stack

### 7.1 Development Stack
- **Frontend:** [React, Angular, Vue.js, etc.]
- **Backend:** [Node.js, Python, Java, .NET, etc.]
- **Database:** [PostgreSQL, MySQL, MongoDB, etc.]
- **Caching:** [Redis, Memcached, etc.]
- **Message Queue:** [RabbitMQ, Apache Kafka, etc.]

### 7.2 Infrastructure
- **Cloud Platform:** [AWS, Azure, GCP]
- **Containerization:** [Docker, Kubernetes]
- **CI/CD:** [Jenkins, GitHub Actions, Azure DevOps]
- **Monitoring:** [Prometheus, Grafana, ELK Stack]
- **Security:** [Vault, OAuth providers, SSL/TLS]

### 7.3 Development Tools
- **Version Control:** [Git, branching strategy]
- **Project Management:** [Jira, Azure DevOps, GitHub Projects]
- **Documentation:** [Confluence, GitBook, README files]
- **Testing:** [Unit, integration, end-to-end testing frameworks]

## 8. Security Architecture

### 8.1 Security Requirements
- **Authentication:** [Multi-factor authentication, SSO]
- **Authorization:** [Role-based access control, permissions]
- **Data Protection:** [Encryption standards, key management]
- **Network Security:** [Firewalls, VPNs, secure protocols]

### 8.2 Threat Model
- **Assets:** [Critical data and systems to protect]
- **Threats:** [Potential security threats and attack vectors]
- **Vulnerabilities:** [Known weaknesses and mitigation strategies]
- **Risk Assessment:** [Risk levels and treatment plans]

### 8.3 Security Controls
- **Preventive Controls:** [Firewalls, access controls, encryption]
- **Detective Controls:** [Monitoring, logging, intrusion detection]
- **Corrective Controls:** [Incident response, backup/recovery]

## 9. Performance and Scalability

### 9.1 Performance Requirements
- **Response Time:** [Target response times for different operations]
- **Throughput:** [Transactions per second, concurrent users]
- **Resource Utilization:** [CPU, memory, storage targets]

### 9.2 Scalability Strategy
- **Horizontal Scaling:** [Load balancing, auto-scaling groups]
- **Vertical Scaling:** [Resource allocation, capacity planning]
- **Database Scaling:** [Read replicas, sharding, partitioning]

### 9.3 Performance Optimization
- **Caching Strategy:** [Application, database, CDN caching]
- **Database Optimization:** [Indexing, query optimization]
- **Code Optimization:** [Profiling, bottleneck identification]

## 10. Deployment Architecture

### 10.1 Environment Strategy
- **Development:** [Local development setup]
- **Testing:** [Test environment configuration]
- **Staging:** [Pre-production environment]
- **Production:** [Live environment specifications]

### 10.2 Deployment Process
- **CI/CD Pipeline:** [Automated build, test, deploy process]
- **Blue-Green Deployment:** [Zero-downtime deployment strategy]
- **Rollback Strategy:** [Quick recovery from failed deployments]

### 10.3 Infrastructure as Code
- **Configuration Management:** [Terraform, CloudFormation, ARM templates]
- **Container Orchestration:** [Kubernetes, Docker Swarm]
- **Monitoring and Alerting:** [Health checks, performance metrics]

## 11. Risk Management

### 11.1 Technical Risks
- **Single Points of Failure:** [Identification and mitigation]
- **Technology Dependencies:** [Vendor lock-in, obsolescence]
- **Performance Bottlenecks:** [Capacity planning, optimization]

### 11.2 Mitigation Strategies
- **Redundancy:** [High availability, disaster recovery]
- **Monitoring:** [Proactive issue detection and resolution]
- **Documentation:** [Knowledge transfer, runbooks]

## 12. Implementation Roadmap

### 12.1 Phase 1: Foundation
- **Duration:** [Timeline]
- **Deliverables:** [Core infrastructure, basic functionality]
- **Success Criteria:** [Measurable outcomes]

### 12.2 Phase 2: Enhancement
- **Duration:** [Timeline]
- **Deliverables:** [Advanced features, integrations]
- **Success Criteria:** [Measurable outcomes]

### 12.3 Phase 3: Optimization
- **Duration:** [Timeline]
- **Deliverables:** [Performance optimization, scaling]
- **Success Criteria:** [Measurable outcomes]

## 13. Appendices

### Appendix A: Glossary
- **Term 1:** Definition
- **Term 2:** Definition

### Appendix B: References
- [Architecture documentation standards]
- [Technology documentation]
- [Industry best practices]

### Appendix C: Assumptions and Constraints
- **Assumptions:** [Key assumptions made during design]
- **Constraints:** [Technical, business, and regulatory constraints]

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **Approved By:** [Approval authority]
- **Version History:**
  - v1.0 - Initial draft
`;
  }
}
