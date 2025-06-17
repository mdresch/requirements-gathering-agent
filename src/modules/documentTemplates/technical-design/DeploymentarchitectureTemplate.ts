import type { ProjectContext } from '../../ai/types';

/**
 * Deployment Architecture Template generates comprehensive deployment architecture documentation
 * covering infrastructure, deployment processes, and operational procedures.
 */
export class DeploymentarchitectureTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Deployment Architecture
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Unnamed Project';
    const projectDescription = this.context.description || 'No description provided';
    const projectType = this.context.projectType || 'Software Project';
    
    return `# Deployment Architecture

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}  
**Deployment Model:** [Cloud-Native/Hybrid/On-Premises]

## Executive Summary

${projectDescription}

This document outlines the deployment architecture for ${projectName}, including infrastructure components, deployment processes, environment configurations, scaling strategies, and operational procedures. The architecture is designed to ensure high availability, scalability, security, and maintainability.

## 1. Deployment Overview

### 1.1 Deployment Objectives
- **High Availability:** Minimize downtime and ensure service continuity
- **Scalability:** Support horizontal and vertical scaling based on demand
- **Security:** Implement defense-in-depth security practices
- **Performance:** Optimize for speed and responsiveness
- **Cost Efficiency:** Balance performance with operational costs
- **Maintainability:** Enable easy updates and maintenance

### 1.2 Deployment Principles
- **Infrastructure as Code:** All infrastructure defined and versioned
- **Immutable Infrastructure:** Replace rather than modify infrastructure
- **Blue-Green Deployments:** Zero-downtime deployment strategy
- **Automated Testing:** Comprehensive testing in deployment pipeline
- **Monitoring and Observability:** Full visibility into system health
- **Disaster Recovery:** Robust backup and recovery procedures

### 1.3 Deployment Architecture Overview
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Load Balancer                             │
│              (High Availability)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Web Tier (DMZ)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Web Server  │  │ Web Server  │  │ Web Server  │          │
│  │   (AZ-1)    │  │   (AZ-2)    │  │   (AZ-3)    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               Application Tier                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ App Server  │  │ App Server  │  │ App Server  │          │
│  │   (AZ-1)    │  │   (AZ-2)    │  │   (AZ-3)    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Data Tier                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Database   │  │   Cache     │  │   Storage   │          │
│  │  (Primary)  │  │  (Redis)    │  │   (S3)      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 2. Infrastructure Architecture

### 2.1 Cloud Infrastructure
- **Cloud Provider:** [AWS/Azure/Google Cloud/Multi-Cloud]
- **Regions:** 
  - Primary: [us-east-1/eastus/us-central1]
  - Secondary: [us-west-2/westus2/us-west1]
- **Availability Zones:** Multi-AZ deployment for high availability
- **Network Architecture:** VPC with public and private subnets

### 2.2 Compute Resources

#### 2.2.1 Container Platform
- **Container Runtime:** Docker
- **Orchestration:** Kubernetes/Amazon EKS/Azure AKS/Google GKE
- **Cluster Configuration:**
  - Master Nodes: 3 nodes (HA configuration)
  - Worker Nodes: Auto-scaling group (3-10 nodes)
  - Node Types: [t3.medium/Standard_DS2_v2/n1-standard-2]

#### 2.2.2 Virtual Machines (if applicable)
- **Instance Types:**
  - Web Tier: [t3.medium/Standard_B2s/n1-standard-2]
  - App Tier: [t3.large/Standard_D2s_v3/n1-standard-4]
  - Database: [r5.xlarge/Standard_E4s_v3/n1-highmem-4]
- **Auto Scaling:** Based on CPU, memory, and custom metrics
- **Load Distribution:** Across multiple availability zones

### 2.3 Network Architecture

#### 2.3.1 Virtual Private Cloud (VPC)
- **CIDR Block:** 10.0.0.0/16
- **Public Subnets:** 
  - AZ-1: 10.0.1.0/24
  - AZ-2: 10.0.2.0/24
  - AZ-3: 10.0.3.0/24
- **Private Subnets:**
  - AZ-1: 10.0.11.0/24
  - AZ-2: 10.0.12.0/24
  - AZ-3: 10.0.13.0/24

#### 2.3.2 Load Balancing
- **Application Load Balancer:** Layer 7 load balancing
- **Network Load Balancer:** Layer 4 load balancing for high performance
- **Internal Load Balancer:** Internal service communication
- **Health Checks:** Automated health monitoring and failover

#### 2.3.3 Security Groups and Network ACLs
- **Web Tier Security Group:**
  - Inbound: HTTP (80), HTTPS (443) from Internet
  - Outbound: All traffic to App Tier
- **App Tier Security Group:**
  - Inbound: Custom ports from Web Tier
  - Outbound: Database ports to Data Tier
- **Data Tier Security Group:**
  - Inbound: Database ports from App Tier only
  - Outbound: Restricted outbound access

### 2.4 Storage Architecture

#### 2.4.1 Database Storage
- **Primary Database:** [RDS PostgreSQL/Azure Database/Cloud SQL]
- **Configuration:**
  - Multi-AZ deployment for high availability
  - Read replicas for read scaling
  - Automated backups with point-in-time recovery
  - Encryption at rest and in transit

#### 2.4.2 Object Storage
- **Service:** [Amazon S3/Azure Blob Storage/Google Cloud Storage]
- **Buckets:**
  - Static Assets: Public read access
  - Application Data: Private with IAM policies
  - Backups: Encrypted with lifecycle policies
  - Logs: Long-term retention with archival

#### 2.4.3 File Systems
- **Shared Storage:** [EFS/Azure Files/Cloud Filestore]
- **Block Storage:** [EBS/Azure Disk/Persistent Disk]
- **Backup Strategy:** Automated snapshots and cross-region replication

## 3. Environment Setup

### 3.1 Environment Tiers

#### 3.1.1 Development Environment
- **Purpose:** Individual developer testing and feature development
- **Infrastructure:** 
  - Single availability zone
  - Minimal resource allocation
  - Shared development database
- **Access:** VPN-based access for developers
- **Data:** Synthetic test data

#### 3.1.2 Testing Environment
- **Purpose:** Automated testing and QA validation
- **Infrastructure:**
  - Production-like configuration (scaled down)
  - Automated provisioning and teardown
  - Isolated test database
- **Testing Types:** Unit, integration, performance, security
- **Data Management:** Refreshed from production (anonymized)

#### 3.1.3 Staging Environment
- **Purpose:** Production-like validation and rehearsal
- **Infrastructure:**
  - Identical to production (smaller scale)
  - Multi-AZ deployment
  - Production-like data volume
- **Access:** Restricted to authorized personnel
- **Deployment:** Blue-green deployment testing

#### 3.1.4 Production Environment
- **Purpose:** Live customer-facing services
- **Infrastructure:**
  - Full high-availability configuration
  - Multi-region deployment
  - Auto-scaling enabled
- **Monitoring:** 24/7 monitoring and alerting
- **Access:** Highly restricted with audit logging

### 3.2 Environment Configuration

#### 3.2.1 Configuration Management
- **Tool:** [AWS Systems Manager/Azure Key Vault/Kubernetes ConfigMaps]
- **Environment Variables:** Centralized configuration management
- **Secrets Management:** Encrypted storage with rotation
- **Configuration Validation:** Automated validation of configurations

#### 3.2.2 Database Configuration
- **Connection Pooling:** Optimized connection management
- **Performance Tuning:** Environment-specific database optimization
- **Backup Schedules:** Regular automated backups
- **Monitoring:** Database performance and health monitoring

## 4. Deployment Process

### 4.1 CI/CD Pipeline Architecture
\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Source    │    │    Build    │    │    Test     │    │   Deploy    │
│   Control   │───▶│   Pipeline  │───▶│   Pipeline  │───▶│   Pipeline  │
│   (Git)     │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Feature     │    │ Compile     │    │ Unit Tests  │    │   Dev       │
│ Branch      │    │ Code        │    │ Integration │    │ Environment │
│ Commit      │    │ Dependencies│    │ Security    │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │ Container   │    │ Performance │    │ Staging     │
                   │ Image       │    │ Tests       │    │ Environment │
                   │ Build       │    │             │    │             │
                   └─────────────┘    └─────────────┘    └─────────────┘
                                              │                   │
                                              ▼                   ▼
                                      ┌─────────────┐    ┌─────────────┐
                                      │ Quality     │    │ Production  │
                                      │ Gates       │    │ Environment │
                                      │             │    │             │
                                      └─────────────┘    └─────────────┘
\`\`\`

### 4.2 Build Process
1. **Source Code Checkout:** Retrieve code from version control
2. **Dependency Resolution:** Install required dependencies
3. **Code Compilation:** Compile source code and assets
4. **Unit Testing:** Execute unit tests with coverage analysis
5. **Code Quality Analysis:** Static code analysis and linting
6. **Security Scanning:** Vulnerability scanning of dependencies
7. **Container Image Build:** Create Docker images
8. **Image Scanning:** Security scanning of container images
9. **Artifact Storage:** Store build artifacts in repository

### 4.3 Deployment Strategies

#### 4.3.1 Blue-Green Deployment
- **Process:**
  1. Deploy new version to green environment
  2. Run smoke tests on green environment
  3. Switch traffic from blue to green
  4. Monitor for issues
  5. Keep blue environment for quick rollback
- **Benefits:** Zero-downtime deployments, quick rollback
- **Considerations:** Requires double infrastructure resources

#### 4.3.2 Rolling Deployment
- **Process:**
  1. Deploy to subset of instances
  2. Health check new instances
  3. Gradually replace remaining instances
  4. Monitor throughout process
- **Benefits:** Resource efficient, gradual rollout
- **Considerations:** Mixed versions during deployment

#### 4.3.3 Canary Deployment
- **Process:**
  1. Deploy new version to small subset (5-10%)
  2. Monitor metrics and user feedback
  3. Gradually increase traffic percentage
  4. Full rollout if metrics are good
- **Benefits:** Risk mitigation, early issue detection
- **Tools:** Feature flags, traffic splitting

### 4.4 Rollback Procedures
- **Automated Rollback:** Trigger rollback based on health checks
- **Manual Rollback:** Operations team initiated rollback
- **Database Rollback:** Database migration rollback procedures
- **Configuration Rollback:** Revert configuration changes
- **Monitoring:** Post-rollback monitoring and validation

## 5. Configuration Management

### 5.1 Infrastructure as Code (IaC)
- **Tool:** [Terraform/CloudFormation/Azure ARM/Pulumi]
- **Repository:** Separate IaC repository with version control
- **Validation:** Automated syntax and security validation
- **Deployment:** Automated infrastructure provisioning
- **State Management:** Remote state storage with locking

### 5.2 Configuration Hierarchy
\`\`\`
Global Configuration
├── Environment-Specific Configuration
│   ├── Development
│   ├── Testing
│   ├── Staging
│   └── Production
├── Service-Specific Configuration
│   ├── Web Service
│   ├── API Service
│   └── Background Service
└── Instance-Specific Configuration
    ├── Database Configuration
    ├── Cache Configuration
    └── Monitoring Configuration
\`\`\`

### 5.3 Secrets Management
- **Secrets Store:** [HashiCorp Vault/AWS Secrets Manager/Azure Key Vault]
- **Access Control:** Role-based access with audit logging
- **Rotation:** Automated secret rotation policies
- **Encryption:** Encryption at rest and in transit
- **Integration:** Seamless integration with deployment pipeline

### 5.4 Configuration Validation
- **Schema Validation:** Validate configuration structure
- **Value Validation:** Validate configuration values
- **Dependency Validation:** Check configuration dependencies
- **Security Validation:** Scan for security misconfigurations
- **Testing:** Configuration testing in lower environments

## 6. Scaling Strategy

### 6.1 Horizontal Scaling

#### 6.1.1 Auto Scaling Groups
- **Metrics-Based Scaling:**
  - CPU Utilization: Scale out at >70%, scale in at <30%
  - Memory Utilization: Scale out at >80%, scale in at <40%
  - Request Count: Scale based on requests per second
  - Custom Metrics: Application-specific scaling triggers

#### 6.1.2 Kubernetes Horizontal Pod Autoscaler
- **Resource-Based Scaling:** CPU and memory utilization
- **Custom Metrics Scaling:** Application metrics from Prometheus
- **Predictive Scaling:** Machine learning-based scaling predictions
- **Cluster Scaling:** Node auto-scaling based on pod requirements

### 6.2 Vertical Scaling
- **Instance Resizing:** Automatic instance type changes
- **Resource Limits:** Dynamic CPU and memory allocation
- **Database Scaling:** Read replicas and connection pooling
- **Storage Scaling:** Automatic storage expansion

### 6.3 Geographic Scaling
- **Multi-Region Deployment:** Active-active across regions
- **Content Delivery Network (CDN):** Global content distribution
- **DNS-Based Routing:** Route users to nearest region
- **Data Replication:** Cross-region data synchronization

### 6.4 Performance Optimization
- **Caching Strategy:** Multi-level caching implementation
- **Database Optimization:** Query optimization and indexing
- **Connection Pooling:** Efficient database connections
- **Load Balancing:** Intelligent traffic distribution

## 7. Monitoring and Observability

### 7.1 Monitoring Stack
- **Infrastructure Monitoring:** [Prometheus/CloudWatch/Azure Monitor]
- **Application Monitoring:** [New Relic/DataDog/Application Insights]
- **Log Management:** [ELK Stack/Splunk/Azure Log Analytics]
- **Distributed Tracing:** [Jaeger/Zipkin/AWS X-Ray]

### 7.2 Key Metrics

#### 7.2.1 Infrastructure Metrics
- **System Metrics:** CPU, memory, disk, network utilization
- **Container Metrics:** Pod CPU/memory usage, restart counts
- **Database Metrics:** Connection count, query performance, replication lag
- **Network Metrics:** Bandwidth utilization, packet loss, latency

#### 7.2.2 Application Metrics
- **Request Metrics:** Request rate, response time, error rate
- **Business Metrics:** User registrations, transactions, revenue
- **Custom Metrics:** Application-specific performance indicators
- **SLA Metrics:** Service level agreement compliance

### 7.3 Alerting Strategy
- **Alert Severity Levels:**
  - Critical: Immediate response required (P1)
  - Warning: Response within 1 hour (P2)
  - Info: Response within 4 hours (P3)
- **Escalation Procedures:** Automatic escalation based on response time
- **Alert Fatigue Prevention:** Smart alerting to reduce noise
- **On-Call Rotation:** 24/7 on-call coverage for critical alerts

### 7.4 Dashboards and Reporting
- **Executive Dashboard:** High-level business and system metrics
- **Operations Dashboard:** System health and performance metrics
- **Development Dashboard:** Build and deployment metrics
- **Incident Dashboard:** Real-time incident tracking and resolution

## 8. Security Architecture

### 8.1 Network Security
- **Firewall Rules:** Restrictive ingress and egress rules
- **VPN Access:** Secure remote access for administrators
- **Network Segmentation:** Isolated network segments by tier
- **DDoS Protection:** [CloudFlare/AWS Shield/Azure DDoS Protection]

### 8.2 Application Security
- **Authentication:** [OAuth 2.0/SAML/Multi-factor authentication]
- **Authorization:** Role-based access control (RBAC)
- **API Security:** Rate limiting, input validation, HTTPS enforcement
- **Secrets Management:** Encrypted storage and rotation

### 8.3 Data Security
- **Encryption at Rest:** Database and storage encryption
- **Encryption in Transit:** TLS 1.3 for all communications
- **Data Classification:** Sensitive data identification and protection
- **Backup Encryption:** Encrypted backup storage

### 8.4 Security Monitoring
- **Security Information and Event Management (SIEM):** Log analysis
- **Vulnerability Scanning:** Regular security assessments
- **Penetration Testing:** Annual third-party security testing
- **Compliance Monitoring:** Regulatory compliance tracking

## 9. Backup and Recovery

### 9.1 Backup Strategy

#### 9.1.1 Database Backups
- **Full Backups:** Daily full database backups
- **Incremental Backups:** Hourly incremental backups
- **Point-in-Time Recovery:** 35-day retention period
- **Cross-Region Replication:** Backups stored in multiple regions
- **Backup Testing:** Monthly backup restoration testing

#### 9.1.2 Application Backups
- **Configuration Backups:** Version-controlled configuration
- **Code Repositories:** Distributed version control with multiple remotes
- **Container Images:** Registry with image versioning and retention
- **Infrastructure State:** IaC state files with version control

#### 9.1.3 Data Archival
- **Archive Strategy:** Long-term storage for compliance
- **Lifecycle Policies:** Automatic data lifecycle management
- **Retrieval Process:** Documented data retrieval procedures
- **Cost Optimization:** Tiered storage for cost efficiency

### 9.2 Recovery Procedures

#### 9.2.1 Recovery Time Objectives (RTO)
- **Critical Systems:** RTO < 1 hour
- **Important Systems:** RTO < 4 hours
- **Standard Systems:** RTO < 8 hours
- **Non-Critical Systems:** RTO < 24 hours

#### 9.2.2 Recovery Point Objectives (RPO)
- **Critical Data:** RPO < 15 minutes
- **Important Data:** RPO < 1 hour
- **Standard Data:** RPO < 4 hours
- **Non-Critical Data:** RPO < 24 hours

### 9.3 Disaster Recovery Testing
- **Test Schedule:** Quarterly disaster recovery drills
- **Test Scenarios:** Various failure scenarios and recovery procedures
- **Documentation:** Detailed test procedures and results
- **Improvements:** Continuous improvement based on test results

## 10. Operational Procedures

### 10.1 Change Management
- **Change Approval Process:** Formal change approval workflow
- **Change Documentation:** Detailed change documentation requirements
- **Rollback Planning:** Mandatory rollback procedures for all changes
- **Change Communication:** Stakeholder notification procedures

### 10.2 Incident Management
- **Incident Response Team:** Defined roles and responsibilities
- **Incident Severity Levels:** Clear severity classification
- **Communication Plan:** Internal and external communication procedures
- **Post-Incident Review:** Learning and improvement process

### 10.3 Capacity Planning
- **Resource Monitoring:** Continuous resource utilization monitoring
- **Growth Projections:** Capacity planning based on business growth
- **Performance Testing:** Regular performance and load testing
- **Scaling Triggers:** Automated and manual scaling procedures

### 10.4 Maintenance Procedures
- **Scheduled Maintenance:** Regular maintenance windows
- **Security Updates:** Timely security patch management
- **Database Maintenance:** Regular database optimization and cleanup
- **Certificate Management:** SSL/TLS certificate renewal procedures

## 11. Cost Management

### 11.1 Cost Optimization Strategies
- **Right-Sizing:** Optimize instance sizes based on utilization
- **Reserved Instances:** Long-term capacity planning with cost savings
- **Spot Instances:** Cost-effective compute for non-critical workloads
- **Auto-Scaling:** Dynamic resource allocation based on demand

### 11.2 Cost Monitoring
- **Cost Tracking:** Detailed cost breakdown by service and environment
- **Budget Alerts:** Automated alerting for budget overruns
- **Cost Reports:** Regular cost analysis and optimization reports
- **Tagging Strategy:** Comprehensive resource tagging for cost allocation

### 11.3 Resource Optimization
- **Unused Resources:** Regular identification and cleanup of unused resources
- **Storage Optimization:** Lifecycle policies and storage tiering
- **Network Optimization:** Efficient data transfer and CDN usage
- **Database Optimization:** Query optimization and connection pooling

## 12. Compliance and Governance

### 12.1 Regulatory Compliance
- **Data Protection:** [GDPR/CCPA/HIPAA] compliance requirements
- **Security Standards:** [SOC 2/ISO 27001/PCI DSS] compliance
- **Audit Requirements:** Regular compliance audits and assessments
- **Documentation:** Comprehensive compliance documentation

### 12.2 Governance Framework
- **Policies and Procedures:** Documented operational policies
- **Access Control:** Role-based access with regular reviews
- **Audit Logging:** Comprehensive audit trail for all activities
- **Risk Management:** Regular risk assessments and mitigation

### 12.3 Data Governance
- **Data Classification:** Sensitive data identification and handling
- **Data Retention:** Data retention policies and procedures
- **Data Privacy:** Privacy by design principles
- **Data Quality:** Data quality monitoring and improvement

## 13. Appendices

### Appendix A: Network Diagrams
- **High-Level Architecture:** Overall system architecture
- **Network Topology:** Detailed network configuration
- **Security Architecture:** Security controls and data flow
- **Disaster Recovery:** DR site architecture and failover procedures

### Appendix B: Runbooks
- **Deployment Procedures:** Step-by-step deployment instructions
- **Troubleshooting Guide:** Common issues and resolution procedures
- **Emergency Procedures:** Incident response and escalation procedures
- **Maintenance Procedures:** Regular maintenance task instructions

### Appendix C: Configuration Templates
- **Infrastructure Templates:** IaC templates and configurations
- **Application Configuration:** Environment-specific configurations
- **Security Configuration:** Security settings and policies
- **Monitoring Configuration:** Monitoring and alerting setup

### Appendix D: Testing Procedures
- **Deployment Testing:** Pre and post-deployment testing procedures
- **Disaster Recovery Testing:** DR test procedures and validation
- **Performance Testing:** Load testing and performance validation
- **Security Testing:** Security testing and vulnerability assessment

---

**Document Control:**
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
- **Next Review:** [Review date]
- **DevOps Team Contact:** [devops-team@example.com]
- **Version History:**
  - v1.0 - Initial comprehensive deployment architecture documentation
`;
  }
}
