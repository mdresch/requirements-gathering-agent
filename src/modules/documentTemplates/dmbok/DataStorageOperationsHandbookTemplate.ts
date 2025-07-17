import { ProjectContext } from '../../ai/types.js';

export class DataStorageOperationsHandbookTemplate {
  buildPrompt(context: ProjectContext): string {
    return `
# Data Storage & Operations Handbook

## 1. Introduction

### 1.1 Purpose
This handbook defines the standards, procedures, and best practices for managing data storage and operations within ${context.projectName}. It aligns with DMBOK 2.0 guidelines to ensure efficient, secure, and reliable data management.

### 1.2 Scope
This document covers all aspects of data storage, database administration, and operations management, including but not limited to:
- Database design and implementation
- Storage infrastructure
- Data operations procedures
- Performance monitoring and tuning
- Backup and recovery processes
- Security and compliance

## 2. Database Architecture

### 2.1 Database Management Systems
- Primary DBMS: [Specify primary database systems]
- NoSQL Solutions: [Specify if applicable]
- Data Warehouse: [Specify data warehouse solution]
- Data Lake: [Specify if applicable]

### 2.2 Database Design Standards
- Naming conventions
- Schema design principles
- Indexing strategy
- Partitioning approach
- Normalization standards

## 3. Storage Management

### 3.1 Storage Infrastructure
- Storage Area Network (SAN) configuration
- Network Attached Storage (NAS) setup
- Cloud storage solutions
- Storage tiering strategy

### 3.2 Capacity Planning
- Storage growth projections
- Performance requirements
- Scalability considerations
- Cost optimization strategies

## 4. Database Administration

### 4.1 Installation and Configuration
- Standard installation procedures
- Configuration parameters
- Security settings
- High availability setup

### 4.2 Performance Monitoring
- Key performance indicators (KPIs)
- Monitoring tools and dashboards
- Alert thresholds
- Performance tuning procedures

## 5. Data Operations

### 5.1 Backup and Recovery
- Backup schedules and retention policies
- Recovery point objectives (RPO)
- Recovery time objectives (RTO)
- Disaster recovery procedures

### 5.2 Data Migration
- Migration strategy
- ETL processes
- Data validation procedures
- Rollback procedures

## 6. Security and Compliance

### 6.1 Access Control
- User authentication
- Role-based access control (RBAC)
- Privilege management
- Audit logging

### 6.2 Data Protection
- Encryption standards
- Data masking procedures
- Tokenization approaches
- Key management

## 7. Maintenance and Support

### 7.1 Routine Maintenance
- Database health checks
- Statistics updates
- Index maintenance
- Storage optimization

### 7.2 Incident Management
- Problem resolution procedures
- Escalation paths
- Root cause analysis
- Preventive measures

## 8. Documentation and Training

### 8.1 Operational Documentation
- Runbooks
- Knowledge base articles
- Troubleshooting guides
- Best practices

### 8.2 Training Requirements
- DBA training programs
- User training
- Certification requirements
- Knowledge transfer processes

## 9. Continuous Improvement

### 9.1 Performance Metrics
- System performance trends
- Incident analysis
- User feedback
- Benchmarking results

### 9.2 Process Optimization
- Automation opportunities
- Process improvements
- Technology upgrades
- Industry best practices

**Project Context:**
${JSON.stringify(context, null, 2)}
`;
  }
}
