import type { ProjectContext } from '../../ai/types';

/**
 * System Design Template generates comprehensive system design specification documentation
 * following software engineering best practices and PMBOK 7.0 performance domains.
 */
export class SystemdesignTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for System Design Specification
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    const projectType = this.context.projectType || 'Software System';
    
    return `# System Design Specification

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}

## Executive Summary

${projectDescription}

This document provides a detailed system design specification for ${projectName}, including system purpose, architecture, modules, interfaces, data structures, processing logic, and technical requirements.

## 1. System Purpose and Scope

### 1.1 System Purpose
- **Primary Objective:** [Define the main goal and purpose of the system]
- **Business Value:** [Explain how this system delivers business value]
- **Problem Statement:** [Describe the problem this system solves]
- **Success Criteria:** [Define measurable success indicators]

### 1.2 System Scope
- **Functional Scope:** [What the system will do]
- **Non-Functional Scope:** [Quality attributes and constraints]
- **System Boundaries:** [What is included and excluded]
- **Integration Points:** [External systems and interfaces]

### 1.3 Stakeholders
- **End Users:** [Primary system users and their roles]
- **System Administrators:** [Administrative roles and responsibilities]
- **Development Team:** [Development and maintenance team]
- **Business Owners:** [Business stakeholders and decision makers]

## 2. System Architecture

### 2.1 Architectural Overview
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Presentation   │    │   Application   │    │      Data       │
│     Layer       │◄──►│     Layer       │◄──►│     Layer       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### 2.2 System Context
- **External Systems:** [List of external systems and their relationships]
- **Data Sources:** [Input data sources and formats]
- **Output Destinations:** [Where system outputs are delivered]
- **User Interfaces:** [Types of user interfaces provided]

### 2.3 Architectural Patterns
- **Primary Pattern:** [e.g., MVC, Microservices, Layered Architecture]
- **Secondary Patterns:** [Supporting architectural patterns]
- **Design Rationale:** [Why these patterns were chosen]

## 3. Module Descriptions

### 3.1 Core Modules

#### 3.1.1 [Module Name 1]
- **Purpose:** [What this module accomplishes]
- **Responsibilities:** [Key functions and duties]
- **Input Data:** [Data received by this module]
- **Output Data:** [Data produced by this module]
- **Processing Logic:** [High-level description of processing]
- **Dependencies:** [Other modules or systems this depends on]

#### 3.1.2 [Module Name 2]
- **Purpose:** [What this module accomplishes]
- **Responsibilities:** [Key functions and duties]
- **Input Data:** [Data received by this module]
- **Output Data:** [Data produced by this module]
- **Processing Logic:** [High-level description of processing]
- **Dependencies:** [Other modules or systems this depends on]

#### 3.1.3 [Module Name 3]
- **Purpose:** [What this module accomplishes]
- **Responsibilities:** [Key functions and duties]
- **Input Data:** [Data received by this module]
- **Output Data:** [Data produced by this module]
- **Processing Logic:** [High-level description of processing]
- **Dependencies:** [Other modules or systems this depends on]

### 3.2 Module Interaction Diagram
\`\`\`
[Module A] ──request──► [Module B] ──data──► [Module C]
     ▲                        │                  │
     └──────response──────────┘                  │
                                                 ▼
[Module D] ◄──────────events───────────────────┘
\`\`\`

## 4. Interface Specifications

### 4.1 External Interfaces

#### 4.1.1 User Interface (UI)
- **Interface Type:** [Web, Mobile, Desktop, CLI]
- **Framework/Technology:** [React, Angular, Swing, etc.]
- **Key Screens/Views:** [List main user interfaces]
- **User Interaction Patterns:** [How users interact with the system]

#### 4.1.2 Application Programming Interface (API)
- **API Type:** [REST, GraphQL, SOAP, gRPC]
- **Authentication:** [API key, OAuth, JWT, etc.]
- **Base URL:** [API endpoint base URL]
- **Key Endpoints:**
  - \`GET /api/[resource]\` - [Description]
  - \`POST /api/[resource]\` - [Description]
  - \`PUT /api/[resource]/{id}\` - [Description]
  - \`DELETE /api/[resource]/{id}\` - [Description]

#### 4.1.3 Database Interface
- **Database Type:** [PostgreSQL, MySQL, MongoDB, etc.]
- **Connection Method:** [Connection pool, ORM, direct connection]
- **Key Tables/Collections:** [Main data entities]
- **Stored Procedures:** [If applicable]

### 4.2 Internal Interfaces
- **Inter-Module Communication:** [How modules communicate]
- **Message Formats:** [Data exchange formats]
- **Communication Protocols:** [HTTP, messaging, events]

## 5. Data Structures

### 5.1 Core Data Entities

#### 5.1.1 [Entity Name 1]
\`\`\`typescript
interface EntityName1 {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

#### 5.1.2 [Entity Name 2]
\`\`\`typescript
interface EntityName2 {
  id: string;
  entityName1Id: string;
  value: number;
  metadata: Record<string, any>;
  createdAt: Date;
}
\`\`\`

### 5.2 Data Relationships
- **One-to-Many:** [Entity A → Entity B relationships]
- **Many-to-Many:** [Complex relationships with junction tables]
- **Foreign Keys:** [Key relationships and constraints]

### 5.3 Data Validation Rules
- **Required Fields:** [Fields that must be present]
- **Data Types:** [Type constraints and validations]
- **Business Rules:** [Domain-specific validation rules]
- **Referential Integrity:** [Data consistency rules]

## 6. Processing Logic

### 6.1 Core Business Processes

#### 6.1.1 [Process Name 1]
- **Trigger:** [What initiates this process]
- **Input:** [Required input data]
- **Steps:**
  1. [Step 1 description]
  2. [Step 2 description]
  3. [Step 3 description]
- **Output:** [Expected results]
- **Error Conditions:** [Possible failure scenarios]

#### 6.1.2 [Process Name 2]
- **Trigger:** [What initiates this process]
- **Input:** [Required input data]
- **Steps:**
  1. [Step 1 description]
  2. [Step 2 description]
  3. [Step 3 description]
- **Output:** [Expected results]
- **Error Conditions:** [Possible failure scenarios]

### 6.2 Data Processing Flow
\`\`\`
Input Data → Validation → Processing → Transformation → Output Data
     ↓            ↓           ↓             ↓             ↓
  Logging    Error Handle   Business    Data Format   Storage
                            Rules       Conversion
\`\`\`

### 6.3 Algorithm Specifications
- **Sorting Algorithms:** [If applicable]
- **Search Algorithms:** [If applicable]
- **Business Logic Algorithms:** [Custom algorithms]
- **Optimization Strategies:** [Performance optimizations]

## 7. Error Handling

### 7.1 Error Categories
- **Input Validation Errors:** [Malformed or invalid input]
- **Business Logic Errors:** [Rule violations]
- **System Errors:** [Infrastructure failures]
- **Integration Errors:** [External system failures]

### 7.2 Error Handling Strategies
- **Graceful Degradation:** [How system handles partial failures]
- **Retry Mechanisms:** [Automatic retry policies]
- **Circuit Breakers:** [Preventing cascade failures]
- **Fallback Procedures:** [Alternative processing paths]

### 7.3 Error Response Format
\`\`\`json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {
    "field": "specific field with error",
    "value": "invalid value",
    "constraint": "validation rule violated"
  },
  "timestamp": "2025-06-17T10:30:00Z"
}
\`\`\`

### 7.4 Logging and Monitoring
- **Log Levels:** [Debug, Info, Warn, Error, Fatal]
- **Log Format:** [Structured logging format]
- **Monitoring Metrics:** [Key performance indicators]
- **Alerting Rules:** [When to trigger alerts]

## 8. Performance Requirements

### 8.1 Response Time Requirements
- **User Interface:** [Maximum acceptable response times]
- **API Endpoints:** [Response time targets per endpoint]
- **Database Queries:** [Query performance targets]
- **Batch Processing:** [Processing time requirements]

### 8.2 Throughput Requirements
- **Concurrent Users:** [Maximum simultaneous users]
- **Transactions per Second:** [TPS targets]
- **Data Processing Volume:** [Records per minute/hour]
- **Peak Load Handling:** [Maximum load scenarios]

### 8.3 Resource Utilization
- **CPU Usage:** [Target and maximum CPU utilization]
- **Memory Usage:** [RAM requirements and limits]
- **Storage Requirements:** [Disk space needs]
- **Network Bandwidth:** [Data transfer requirements]

### 8.4 Performance Optimization Strategies
- **Caching:** [What data to cache and where]
- **Database Optimization:** [Indexing, query optimization]
- **Code Optimization:** [Performance-critical code sections]
- **Resource Pooling:** [Connection pools, thread pools]

## 9. System Constraints

### 9.1 Technical Constraints
- **Platform Requirements:** [Operating system, hardware specs]
- **Technology Stack:** [Mandatory technologies]
- **Third-Party Dependencies:** [Required external libraries]
- **Legacy System Integration:** [Existing system constraints]

### 9.2 Business Constraints
- **Budget Limitations:** [Cost restrictions]
- **Timeline Constraints:** [Delivery deadlines]
- **Regulatory Requirements:** [Compliance obligations]
- **Organizational Policies:** [Internal constraints]

### 9.3 Operational Constraints
- **Maintenance Windows:** [When system can be offline]
- **Deployment Restrictions:** [How and when deployments occur]
- **Support Requirements:** [Support team capabilities]
- **Documentation Standards:** [Required documentation]

## 10. Dependencies

### 10.1 System Dependencies
- **Operating System:** [OS requirements and versions]
- **Runtime Environment:** [JVM, .NET, Node.js versions]
- **Database System:** [Database versions and configurations]
- **Web Server:** [Application server requirements]

### 10.2 External Dependencies
- **Third-Party Services:** [External APIs and services]
- **Libraries and Frameworks:** [Required dependencies]
- **Authentication Providers:** [Identity management systems]
- **Payment Processors:** [If applicable]

### 10.3 Internal Dependencies
- **Shared Services:** [Internal organizational services]
- **Common Libraries:** [Reusable code components]
- **Configuration Management:** [How configuration is managed]
- **Deployment Pipeline:** [CI/CD dependencies]

## 11. Security Considerations

### 11.1 Authentication and Authorization
- **Authentication Methods:** [How users prove identity]
- **Authorization Model:** [Role-based, attribute-based access]
- **Session Management:** [How sessions are maintained]
- **Password Policies:** [Password requirements]

### 11.2 Data Security
- **Data Encryption:** [At-rest and in-transit encryption]
- **Sensitive Data Handling:** [PII, financial data protection]
- **Data Masking:** [How sensitive data is obscured]
- **Audit Trails:** [Security event logging]

### 11.3 Network Security
- **Communication Protocols:** [HTTPS, TLS versions]
- **Firewall Rules:** [Network access restrictions]
- **API Security:** [Rate limiting, input validation]
- **Intrusion Detection:** [Security monitoring]

## 12. Testing Strategy

### 12.1 Unit Testing
- **Test Coverage:** [Target coverage percentage]
- **Testing Frameworks:** [JUnit, Jest, etc.]
- **Mock Strategies:** [How dependencies are mocked]
- **Test Data Management:** [Test data creation/cleanup]

### 12.2 Integration Testing
- **Integration Points:** [What integrations to test]
- **Test Environments:** [Staging, test environment setup]
- **Data Flow Testing:** [End-to-end data validation]
- **API Testing:** [Contract testing, load testing]

### 12.3 System Testing
- **Performance Testing:** [Load, stress, volume testing]
- **Security Testing:** [Penetration testing, vulnerability scans]
- **Usability Testing:** [User experience validation]
- **Compatibility Testing:** [Browser, platform compatibility]

## 13. Deployment and Maintenance

### 13.1 Deployment Architecture
- **Environment Strategy:** [Dev, Test, Staging, Production]
- **Deployment Process:** [How releases are deployed]
- **Rollback Procedures:** [How to revert deployments]
- **Blue-Green Deployment:** [Zero-downtime deployment strategy]

### 13.2 Monitoring and Maintenance
- **Health Checks:** [System health monitoring]
- **Performance Monitoring:** [Key metrics tracking]
- **Log Management:** [Log collection and analysis]
- **Backup and Recovery:** [Data protection strategies]

### 13.3 Support and Documentation
- **User Documentation:** [User guides, help systems]
- **Technical Documentation:** [API docs, system guides]
- **Support Processes:** [Issue tracking, escalation]
- **Knowledge Transfer:** [Team knowledge sharing]

## 14. Appendices

### Appendix A: Glossary
- **Term 1:** Definition and context
- **Term 2:** Definition and context
- **Term 3:** Definition and context

### Appendix B: References
- [System design standards and guidelines]
- [Technology documentation]
- [Industry best practices]
- [Regulatory requirements]

### Appendix C: Design Decisions
- **Decision 1:** [Technical decision and rationale]
- **Decision 2:** [Technical decision and rationale]
- **Decision 3:** [Technical decision and rationale]

### Appendix D: Risk Analysis
- **Technical Risks:** [Potential technical issues]
- **Integration Risks:** [Third-party integration risks]
- **Performance Risks:** [Scalability concerns]
- **Security Risks:** [Security vulnerabilities]

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **Approved By:** [Approval authority]
- **Version History:**
  - v1.0 - Initial system design specification
`;
  }
}
