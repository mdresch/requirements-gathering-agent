import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for the Test Environment document.
 * Provides a structured fallback template when AI generation fails.
 */
export class TestEnvironmentTemplate {
  name = 'Test Environment';
  description = 'Comprehensive test environment setup and management';
  category = 'Quality Assurance';

  async generateContent(projectInfo: ProjectContext): Promise<string> {
    const { 
      projectName, 
      projectType, 
      description
    } = projectInfo;

    return `# Test Environment Setup and Management
## ${projectName}

### Document Information
- **Project:** ${projectName}
- **Document Type:** Test Environment Setup and Management
- **Generated:** ${new Date().toLocaleDateString()}
- **Version:** 1.0

## 1. Executive Summary

This document outlines the comprehensive test environment strategy for ${projectName}. 
${description || 'A systematic approach to creating, managing, and maintaining test environments that support quality assurance activities and ensure reliable testing outcomes.'}

## 2. Test Environment Objectives

### Primary Objectives
- Provide stable, reliable environments for all testing activities
- Ensure environment consistency across different test phases
- Support parallel testing activities without conflicts
- Enable rapid environment provisioning and recovery
- Maintain production-like conditions for accurate testing

### Success Criteria
- 99.5% environment availability during testing phases
- Environment provisioning within 2 hours for standard setups
- Configuration consistency across all test environments
- Zero data leakage between environments
- Successful test execution without environment-related failures

## 3. Environment Architecture

### 3.1 Overall Architecture
${projectType ? `#### ${projectType}-Specific Architecture
- Framework-optimized environment setup
- Platform-specific infrastructure considerations
- Technology stack-aligned service configurations

#### ` : '#### '}Core Infrastructure Components

**Application Tier**
- Web servers (Load balanced)
- Application servers
- Background processing services
- API gateways and proxy servers

**Database Tier**
- Primary database instances
- Read replicas for performance testing
- Cache layers (Redis/Memcached)
- Search engines (Elasticsearch/Solr)

**Integration Tier**
- Message queues and brokers
- Third-party service simulators
- API mock servers
- File storage systems

**Monitoring and Logging**
- Application performance monitoring
- Log aggregation and analysis
- Error tracking and alerting
- Resource utilization monitoring

### 3.2 Network Architecture
- **Isolation:** Separate network segments for each environment
- **Security:** Firewall rules and access controls
- **Connectivity:** VPN access for remote testing
- **Load Balancing:** Distribute traffic across multiple instances

## 4. Environment Types

### 4.1 Development Environment
- **Purpose:** Individual developer testing and debugging
- **Configuration:** Lightweight, single-instance setup
- **Data:** Synthetic data for basic functionality testing
- **Access:** Direct developer access
- **Availability:** 24/7 with individual developer control

### 4.2 Integration Testing Environment
- **Purpose:** Component integration and API testing
- **Configuration:** Multi-service setup with realistic integrations
- **Data:** Comprehensive test datasets
- **Access:** Development and QA teams
- **Availability:** Business hours with scheduled maintenance windows

### 4.3 System Testing Environment
- **Purpose:** End-to-end system functionality testing
- **Configuration:** Production-like setup with full feature set
- **Data:** Production-like data volumes and complexity
- **Access:** QA team and business analysts
- **Availability:** Business hours with high availability requirements

### 4.4 Performance Testing Environment
- **Purpose:** Load, stress, and performance testing
- **Configuration:** Production-scale infrastructure
- **Data:** Production volumes with anonymized content
- **Access:** Performance testing team
- **Availability:** Scheduled testing windows with dedicated resources

### 4.5 User Acceptance Testing (UAT) Environment
- **Purpose:** Business user validation and acceptance testing
- **Configuration:** Production-identical setup
- **Data:** Production-like data with privacy compliance
- **Access:** Business users and stakeholders
- **Availability:** Business hours with high reliability

### 4.6 Staging Environment
- **Purpose:** Pre-production validation and deployment testing
- **Configuration:** Exact production replica
- **Data:** Production-like data with security controls
- **Access:** Release team and senior stakeholders
- **Availability:** 24/7 with production-level monitoring

## 5. Environment Configuration Management

### 5.1 Infrastructure as Code (IaC)
**Configuration Management Tools:**
- **Terraform:** Infrastructure provisioning
- **Ansible:** Configuration management
- **Docker:** Containerization
- **Kubernetes:** Container orchestration
- **Helm:** Application deployment

**Version Control:**
- All environment configurations stored in Git
- Branching strategy aligned with environment lifecycle
- Automated configuration deployment
- Change approval workflow for production-like environments

### 5.2 Environment Provisioning
**Automated Provisioning Process:**
1. **Resource Allocation:** Compute, storage, and network resources
2. **Base Image Deployment:** Standardized OS and runtime images
3. **Application Deployment:** Automated application installation
4. **Configuration Application:** Environment-specific settings
5. **Service Integration:** Connect to dependent services
6. **Validation Testing:** Automated environment health checks

**Provisioning Timeline:**
- Development: 30 minutes
- Integration: 1 hour
- System/UAT: 2 hours
- Performance/Staging: 4 hours

### 5.3 Configuration Standards
**Standardization Requirements:**
- Consistent naming conventions
- Standardized port assignments
- Common logging configurations
- Unified monitoring setups
- Standard security baselines

**Configuration Documentation:**
- Environment-specific configuration files
- Deployment procedures and runbooks
- Troubleshooting guides
- Recovery procedures

## 6. Data Management

### 6.1 Test Data Strategy
**Data Categories:**
- **Synthetic Data:** Generated data for functional testing
- **Anonymized Production Data:** Masked real data for realistic testing
- **Static Test Data:** Predefined datasets for specific test scenarios
- **Dynamic Test Data:** Generated during test execution

**Data Privacy and Security:**
- No production data in non-production environments
- Data masking and anonymization procedures
- Secure data transmission and storage
- Regular data cleanup and purging

### 6.2 Database Management
**Database Setup:**
- Separate database instances per environment
- Consistent schema across all environments
- Automated database migrations
- Regular backup and restore procedures

**Data Refresh Process:**
1. **Schedule:** Weekly refresh for most environments
2. **Anonymization:** Apply data masking rules
3. **Validation:** Verify data integrity and completeness
4. **Notification:** Alert teams of refresh completion

### 6.3 File and Media Management
- **File Storage:** Dedicated storage for each environment
- **Media Assets:** Test images, documents, and multimedia files
- **Backup Strategy:** Regular backup of critical test assets
- **Access Control:** Role-based access to sensitive test data

## 7. Access Control and Security

### 7.1 User Access Management
**Access Levels:**
- **Administrator:** Full environment control and configuration
- **Developer:** Application deployment and debugging access
- **Tester:** Test execution and result analysis access
- **Viewer:** Read-only access for monitoring and reporting

**Authentication and Authorization:**
- Single Sign-On (SSO) integration
- Role-based access control (RBAC)
- Multi-factor authentication for sensitive environments
- Regular access review and cleanup

### 7.2 Network Security
- **Firewall Rules:** Restrict access to necessary ports and services
- **VPN Access:** Secure remote access for authorized users
- **Network Monitoring:** Track and log all network traffic
- **Intrusion Detection:** Monitor for suspicious activities

### 7.3 Data Security
- **Encryption:** Data encryption at rest and in transit
- **Access Logging:** Comprehensive audit trails
- **Data Loss Prevention:** Prevent unauthorized data extraction
- **Compliance:** Meet regulatory requirements (GDPR, HIPAA, etc.)

## 8. Environment Monitoring and Maintenance

### 8.1 Monitoring Strategy
**Infrastructure Monitoring:**
- Server performance and resource utilization
- Network connectivity and latency
- Storage capacity and performance
- Database performance and availability

**Application Monitoring:**
- Application response times
- Error rates and exception tracking
- User session monitoring
- API performance metrics

**Monitoring Tools:**
- **Infrastructure:** Nagios, Zabbix, or DataDog
- **Application:** New Relic, AppDynamics, or Dynatrace
- **Logs:** ELK Stack or Splunk
- **Synthetic Monitoring:** Pingdom or Uptime Robot

### 8.2 Maintenance Procedures
**Regular Maintenance:**
- **Daily:** Health checks and log reviews
- **Weekly:** Performance analysis and optimization
- **Monthly:** Security updates and patches
- **Quarterly:** Capacity planning and scaling review

**Maintenance Windows:**
- **Scheduled:** Planned maintenance during off-hours
- **Emergency:** Immediate response for critical issues
- **Communication:** Advance notice to all stakeholders
- **Rollback:** Procedures for reverting changes if needed

### 8.3 Backup and Recovery
**Backup Strategy:**
- **Frequency:** Daily incremental, weekly full backups
- **Retention:** 30-day backup retention policy
- **Storage:** Offsite backup storage for disaster recovery
- **Testing:** Monthly backup restoration testing

**Recovery Procedures:**
1. **Incident Assessment:** Evaluate scope and impact
2. **Recovery Planning:** Determine recovery approach
3. **Data Restoration:** Restore from most recent backup
4. **Service Validation:** Verify environment functionality
5. **Communication:** Update stakeholders on recovery status

## 9. Deployment and Release Management

### 9.1 Deployment Pipeline
**Continuous Integration/Continuous Deployment (CI/CD):**
- **Source Control:** Git-based version control
- **Build Automation:** Automated build and testing
- **Deployment Automation:** Automated deployment to test environments
- **Quality Gates:** Automated quality checks before promotion

**Environment Promotion Path:**
Development → Integration → System → Performance → UAT → Staging → Production

### 9.2 Release Procedures
**Pre-Deployment:**
- Environment preparation and validation
- Backup of current environment state
- Stakeholder notification and coordination
- Risk assessment and mitigation planning

**Deployment Process:**
1. **Deployment Execution:** Automated deployment scripts
2. **Smoke Testing:** Basic functionality validation
3. **Regression Testing:** Automated test suite execution
4. **User Acceptance:** Business user validation
5. **Go/No-Go Decision:** Stakeholder approval for production

### 9.3 Rollback Procedures
- **Rollback Triggers:** Defined criteria for rollback decisions
- **Rollback Process:** Automated rollback to previous version
- **Data Considerations:** Database rollback and data integrity
- **Communication:** Immediate stakeholder notification

## 10. Cost Management and Optimization

### 10.1 Resource Optimization
- **Right-Sizing:** Appropriate resource allocation per environment
- **Auto-Scaling:** Dynamic scaling based on demand
- **Schedule Management:** Automated start/stop for non-24/7 environments
- **Resource Monitoring:** Track utilization and optimize accordingly

### 10.2 Cost Tracking
- **Environment Costing:** Track costs per environment
- **Resource Utilization:** Monitor and optimize resource usage
- **Budget Management:** Set and monitor budget limits
- **Cost Reporting:** Regular cost analysis and reporting

## 11. Troubleshooting and Support

### 11.1 Common Issues and Solutions
**Environment Access Issues:**
- VPN connectivity problems
- Authentication and authorization failures
- Network connectivity issues
- Service unavailability

**Performance Issues:**
- Slow response times
- Resource constraints
- Database performance problems
- Network latency issues

**Data Issues:**
- Data corruption or inconsistency
- Missing or incomplete test data
- Database connection failures
- File system problems

### 11.2 Support Procedures
**Issue Escalation:**
1. **Level 1:** Environment administrator
2. **Level 2:** DevOps team
3. **Level 3:** Infrastructure team
4. **Level 4:** Vendor support (if applicable)

**Support Channels:**
- **Ticketing System:** Primary support channel
- **Chat/Slack:** Real-time communication
- **Email:** Formal communication and documentation
- **Phone:** Emergency support for critical issues

## 12. Disaster Recovery

### 12.1 Disaster Recovery Plan
**Recovery Objectives:**
- **RTO (Recovery Time Objective):** 4 hours maximum downtime
- **RPO (Recovery Point Objective):** 1 hour maximum data loss
- **Business Impact:** Minimize impact on testing schedules

**Recovery Procedures:**
1. **Incident Declaration:** Identify and declare disaster
2. **Team Activation:** Activate disaster recovery team
3. **Assessment:** Evaluate damage and recovery options
4. **Recovery Execution:** Implement recovery procedures
5. **Validation:** Verify recovered environment functionality
6. **Communication:** Update stakeholders on recovery status

### 12.2 Business Continuity
- **Alternative Environments:** Backup environments for critical testing
- **Cloud Failover:** Cloud-based disaster recovery options
- **Documentation:** Maintain up-to-date recovery procedures
- **Testing:** Regular disaster recovery testing and validation

## 13. Metrics and KPIs

### 13.1 Environment Performance Metrics
- **Availability:** Percentage uptime for each environment
- **Response Time:** Average response time for key services
- **Throughput:** Request processing capacity
- **Error Rate:** Percentage of failed requests or transactions

### 13.2 Operational Metrics
- **Provisioning Time:** Time to provision new environments
- **Deployment Success Rate:** Percentage of successful deployments
- **Mean Time to Recovery (MTTR):** Average time to resolve issues
- **Cost per Environment:** Monthly cost breakdown by environment

### 13.3 Quality Metrics
- **Test Environment Stability:** Environment-related test failures
- **Data Quality:** Accuracy and completeness of test data
- **User Satisfaction:** Feedback from testing teams
- **Compliance:** Adherence to security and regulatory requirements

## 14. Continuous Improvement

### 14.1 Regular Reviews
- **Monthly:** Environment performance and utilization review
- **Quarterly:** Cost optimization and capacity planning
- **Semi-Annual:** Security assessment and compliance review
- **Annual:** Technology refresh and architecture review

### 14.2 Feedback and Enhancement
- **User Feedback:** Regular surveys and feedback collection
- **Process Improvement:** Continuous refinement of procedures
- **Technology Updates:** Adoption of new tools and technologies
- **Best Practices:** Industry best practice implementation

---

*This Test Environment Setup and Management document should be regularly updated to reflect infrastructure changes and operational improvements.*`;
  }
}
