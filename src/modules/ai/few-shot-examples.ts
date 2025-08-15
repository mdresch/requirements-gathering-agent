/**
 * Few-Shot Learning Examples for PMBOK AI Prompts
 * 
 * This module contains curated examples to improve AI output quality
 * by providing concrete examples of proper PMBOK-compliant documents.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 */

export interface FewShotExample {
    input: string;
    output: string;
    description: string;
}

export interface DocumentExamples {
    [documentType: string]: FewShotExample[];
}

/**
 * Project Charter Examples
 */
export const PROJECT_CHARTER_EXAMPLES: FewShotExample[] = [
    {
        description: "Small IT project charter with clear SMART objectives",
        input: `Project Context:
- Name: Customer Portal Enhancement
- Type: Software Development
- Description: Upgrade existing customer portal to improve user experience and add mobile responsiveness
- Budget: $150,000
- Timeline: 6 months
- Team Size: 5 developers`,
        output: `# Project Charter: Customer Portal Enhancement

## 1. Project Purpose
This project exists to modernize our customer portal platform to meet evolving user expectations and business requirements. The current portal lacks mobile responsiveness and has outdated user interface elements that negatively impact customer satisfaction scores.

**Business Case Alignment:** Supports the company's digital transformation strategy and customer experience improvement initiative.

**Strategic Value:** Expected to increase customer satisfaction by 25% and reduce support tickets by 30%.

**Problem Addressed:** Current portal has 65% bounce rate on mobile devices and receives 200+ usability complaints monthly.

## 2. Measurable Project Objectives

### Objective 1: Improve Mobile User Experience
**SMART Definition:**
- **Specific:** Implement responsive design for all portal pages to ensure optimal viewing on mobile devices
- **Measurable:** Achieve 95% mobile compatibility score (from current 40%) and reduce mobile bounce rate to 25% (from current 65%)
- **Achievable:** Using proven responsive design frameworks and existing development team expertise
- **Relevant:** Aligns with company's mobile-first strategy and customer experience goals
- **Time-bound:** Complete by Month 4 of project timeline

**Quantifiable Metrics:**
- Current baseline: 40% mobile compatibility score, 65% mobile bounce rate
- Target value: 95% mobile compatibility score, 25% mobile bounce rate
- Measurement method: Google PageSpeed Insights and Google Analytics
- Measurement frequency: Weekly during development, daily during testing
- Data source: Google Analytics dashboard and automated testing tools

**Key Performance Indicators:**
- Primary KPI: Mobile compatibility score ≥ 95%
- Secondary KPIs: Mobile page load time ≤ 3 seconds, Mobile conversion rate ≥ 15%
- Leading indicators: Code review completion rate, responsive design test pass rate
- Lagging indicators: Customer satisfaction scores, mobile traffic retention

### Objective 2: Reduce Customer Support Load
**SMART Definition:**
- **Specific:** Implement self-service features and improve portal navigation to reduce customer support tickets
- **Measurable:** Decrease portal-related support tickets by 30% (from 200 to 140 monthly)
- **Achievable:** Based on similar projects showing 25-35% reduction in support tickets
- **Relevant:** Directly supports operational efficiency and cost reduction goals
- **Time-bound:** Achieve target within 2 months post-deployment

**Quantifiable Metrics:**
- Current baseline: 200 portal-related support tickets per month
- Target value: 140 portal-related support tickets per month (30% reduction)
- Measurement method: Support ticket system categorization and tracking
- Measurement frequency: Daily ticket monitoring, weekly trend analysis
- Data source: Customer support system (ServiceNow)

## 3. High-level Requirements

### Business Requirements
- Mobile-responsive design for all portal pages
- Improved navigation and user interface
- Self-service account management features
- Integration with existing authentication system

### Technical Requirements
- Responsive web design using Bootstrap 5
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- API integration with existing backend systems
- Performance optimization for mobile devices

### Quality Requirements
- 99.5% uptime during business hours
- Page load times under 3 seconds on mobile
- WCAG 2.1 AA accessibility compliance
- Security compliance with company standards

## 4. Budget Summary
- **Total Project Cost:** $150,000
- **Development Team:** $120,000 (80%)
- **Infrastructure & Tools:** $15,000 (10%)
- **Testing & QA:** $10,000 (7%)
- **Contingency:** $5,000 (3%)

**Funding Source:** IT Modernization Budget FY2024
**Budget Milestones:** 40% at project start, 40% at development completion, 20% at go-live`
    },
    {
        description: "Large enterprise project charter with complex stakeholder requirements",
        input: `Project Context:
- Name: Enterprise Resource Planning System Implementation
- Type: Enterprise Software Implementation
- Description: Replace legacy ERP system with modern cloud-based solution across 5 business units
- Budget: $2.5M
- Timeline: 18 months
- Team Size: 25 people across multiple departments`,
        output: `# Project Charter: Enterprise Resource Planning System Implementation

## 1. Project Purpose
This project will replace our legacy ERP system with a modern, cloud-based solution to improve operational efficiency, data accuracy, and business intelligence capabilities across all five business units.

**Business Case Alignment:** Critical component of the company's digital transformation roadmap and operational excellence strategy.

**Strategic Value:** Expected ROI of 180% over 3 years through improved efficiency, reduced manual processes, and enhanced decision-making capabilities.

**Problem Addressed:** Current legacy system causes $500K annual losses due to data inconsistencies, manual workarounds, and limited reporting capabilities.

## 2. Measurable Project Objectives

### Objective 1: Improve Data Accuracy and Consistency
**SMART Definition:**
- **Specific:** Implement unified data model across all business units with automated data validation
- **Measurable:** Achieve 99.5% data accuracy (from current 85%) and eliminate 100% of manual data reconciliation processes
- **Achievable:** Modern ERP systems typically achieve 99%+ data accuracy with proper implementation
- **Relevant:** Directly addresses primary business pain point and regulatory compliance requirements
- **Time-bound:** Achieve target within 6 months of go-live across all business units

**Quantifiable Metrics:**
- Current baseline: 85% data accuracy, 40 hours/week manual reconciliation
- Target value: 99.5% data accuracy, 0 hours manual reconciliation
- Measurement method: Automated data quality reports and audit trails
- Measurement frequency: Daily automated reports, weekly trend analysis
- Data source: ERP system data quality dashboard and business unit reports

### Objective 2: Enhance Operational Efficiency
**SMART Definition:**
- **Specific:** Automate key business processes and reduce manual transaction processing time
- **Measurable:** Reduce average transaction processing time by 60% (from 15 minutes to 6 minutes) and increase process automation to 85%
- **Achievable:** Based on vendor benchmarks and similar implementations
- **Relevant:** Core business objective for operational excellence initiative
- **Time-bound:** Achieve full efficiency targets within 12 months of final deployment

**Quantifiable Metrics:**
- Current baseline: 15 minutes average transaction time, 40% process automation
- Target value: 6 minutes average transaction time, 85% process automation
- Measurement method: ERP system analytics and process mining tools
- Measurement frequency: Real-time monitoring, weekly performance reports
- Data source: ERP workflow analytics and business process monitoring tools

## 3. High-level Requirements

### Business Requirements
- Unified financial reporting across all business units
- Real-time inventory management and tracking
- Automated procurement and approval workflows
- Integrated customer relationship management
- Comprehensive business intelligence and analytics

### Technical Requirements
- Cloud-based SaaS deployment model
- Integration with 15+ existing enterprise systems
- 99.9% uptime SLA with disaster recovery capabilities
- Support for 500+ concurrent users
- Mobile access for field operations

### Compliance Requirements
- SOX compliance for financial reporting
- GDPR compliance for customer data
- Industry-specific regulatory requirements
- Internal audit and control frameworks

## 4. Budget Summary
- **Total Project Cost:** $2,500,000
- **Software Licensing:** $1,200,000 (48%)
- **Implementation Services:** $800,000 (32%)
- **Internal Resources:** $300,000 (12%)
- **Training & Change Management:** $150,000 (6%)
- **Contingency:** $50,000 (2%)

**Funding Sources:** 
- Capital Budget: $2,000,000 (80%)
- Operational Budget: $500,000 (20%)

**Budget Milestones:**
- Phase 1 (Planning): $500,000
- Phase 2 (Core Implementation): $1,200,000
- Phase 3 (Rollout): $600,000
- Phase 4 (Optimization): $200,000`
    }
];

/**
 * Scope Management Plan Examples
 */
export const SCOPE_MANAGEMENT_EXAMPLES: FewShotExample[] = [
    {
        description: "Comprehensive scope management plan for software project",
        input: `Project Context:
- Name: Mobile Banking App Development
- Type: Mobile Application Development
- Description: Develop new mobile banking application for iOS and Android
- Timeline: 8 months
- Team: 12 developers, 3 designers, 2 QA engineers`,
        output: `# Scope Management Plan: Mobile Banking App Development

## 1. Scope Planning Process

### 1.1 Scope Definition Approach
The project scope will be defined through a collaborative process involving:
- **Stakeholder Workshops:** Weekly sessions with business stakeholders to gather requirements
- **User Story Mapping:** Agile methodology to capture user needs and prioritize features
- **Technical Architecture Reviews:** Bi-weekly sessions to validate technical feasibility
- **Regulatory Compliance Reviews:** Monthly reviews to ensure banking regulation adherence

### 1.2 Requirements Collection Process
- **Business Requirements:** Collected through stakeholder interviews and business process analysis
- **Functional Requirements:** Documented through user stories with acceptance criteria
- **Non-functional Requirements:** Defined through performance, security, and usability specifications
- **Technical Requirements:** Established through architecture design sessions and technical spikes

## 2. Scope Definition and Documentation

### 2.1 Work Breakdown Structure (WBS) Approach
The project will use a hybrid WBS structure combining:
- **Phase-based decomposition** for major project phases
- **Feature-based decomposition** for application functionality
- **Component-based decomposition** for technical architecture elements

### 2.2 Scope Baseline Components
- **Project Scope Statement:** Detailed description of project deliverables and boundaries
- **Work Breakdown Structure:** Hierarchical decomposition of project work
- **WBS Dictionary:** Detailed descriptions of each WBS element

## 3. Scope Verification and Control

### 3.1 Scope Verification Process
- **Sprint Reviews:** Bi-weekly demonstrations of completed features to stakeholders
- **User Acceptance Testing:** Formal testing sessions with business users
- **Regulatory Compliance Verification:** Third-party security and compliance audits
- **Performance Testing Verification:** Load and stress testing against defined criteria

### 3.2 Scope Change Control Process
- **Change Request Submission:** Formal process using standardized change request forms
- **Impact Assessment:** Technical and business impact analysis within 3 business days
- **Change Control Board Review:** Weekly meetings to evaluate and approve/reject changes
- **Implementation Authorization:** Formal approval process with stakeholder sign-off

## 4. Scope Monitoring and Reporting

### 4.1 Scope Performance Metrics
- **Scope Creep Index:** Percentage of approved changes vs. original scope
- **Requirements Stability Index:** Percentage of requirements that remain unchanged
- **Scope Completion Rate:** Percentage of scope items completed vs. planned

### 4.2 Reporting Schedule
- **Weekly Status Reports:** Scope progress and change request status
- **Monthly Scope Reviews:** Comprehensive scope performance analysis
- **Quarterly Stakeholder Updates:** High-level scope status and trend analysis`
    }
];

/**
 * Requirements Documentation Examples
 */
export const REQUIREMENTS_DOCUMENTATION_EXAMPLES: FewShotExample[] = [
    {
        description: "Detailed requirements documentation for e-commerce platform",
        input: `Project Context:
- Name: E-commerce Platform Modernization
- Type: Web Application Development
- Description: Modernize existing e-commerce platform with new features and improved performance
- Users: 50,000+ customers, 100+ admin users
- Integration: Payment gateways, inventory systems, CRM`,
        output: `# Requirements Documentation: E-commerce Platform Modernization

## 1. Business Requirements

### BR-001: Customer Experience Enhancement
**Description:** The platform must provide an intuitive and responsive shopping experience across all devices.
**Business Justification:** Improve customer satisfaction and reduce cart abandonment rate by 25%.
**Success Criteria:** 
- Mobile responsiveness score ≥ 95%
- Page load time ≤ 2 seconds
- Cart abandonment rate ≤ 15%

### BR-002: Inventory Management Integration
**Description:** Real-time synchronization with existing inventory management system.
**Business Justification:** Prevent overselling and improve inventory accuracy.
**Success Criteria:**
- 99.9% inventory accuracy
- Real-time stock updates within 30 seconds
- Zero overselling incidents

## 2. Functional Requirements

### FR-001: User Authentication and Authorization
**Description:** Secure user login system with role-based access control.
**Acceptance Criteria:**
- Users can register with email verification
- Support for social media login (Google, Facebook)
- Multi-factor authentication for admin users
- Password complexity requirements enforced
- Session timeout after 30 minutes of inactivity

### FR-002: Product Catalog Management
**Description:** Comprehensive product catalog with search and filtering capabilities.
**Acceptance Criteria:**
- Support for unlimited product categories and subcategories
- Advanced search with filters (price, brand, rating, availability)
- Product recommendations based on browsing history
- Bulk product import/export functionality
- Product image optimization and multiple image support

### FR-003: Shopping Cart and Checkout
**Description:** Streamlined shopping cart and checkout process.
**Acceptance Criteria:**
- Persistent shopping cart across sessions
- Guest checkout option available
- Multiple payment methods (credit card, PayPal, digital wallets)
- Real-time shipping cost calculation
- Order confirmation and tracking information

## 3. Non-Functional Requirements

### NFR-001: Performance Requirements
- **Response Time:** 95% of page requests must load within 2 seconds
- **Throughput:** Support 1,000 concurrent users during peak hours
- **Scalability:** Auto-scaling capability to handle 300% traffic spikes
- **Availability:** 99.9% uptime with maximum 8 hours planned downtime per month

### NFR-002: Security Requirements
- **Data Encryption:** All sensitive data encrypted at rest and in transit
- **PCI Compliance:** Full PCI DSS Level 1 compliance for payment processing
- **Authentication:** Strong password policies and multi-factor authentication
- **Audit Logging:** Comprehensive audit trail for all user actions

### NFR-003: Usability Requirements
- **Accessibility:** WCAG 2.1 AA compliance for accessibility
- **Browser Support:** Compatible with Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Responsiveness:** Optimized for mobile devices and tablets
- **User Interface:** Intuitive navigation with maximum 3 clicks to any product

## 4. Integration Requirements

### IR-001: Payment Gateway Integration
**Description:** Integration with multiple payment processors for transaction processing.
**Requirements:**
- Support for Stripe, PayPal, and Square payment gateways
- Real-time payment processing and confirmation
- Secure tokenization of payment information
- Automated refund and chargeback handling

### IR-002: Inventory Management System Integration
**Description:** Real-time synchronization with existing ERP system.
**Requirements:**
- RESTful API integration with current inventory system
- Real-time stock level updates
- Automated low-stock notifications
- Batch synchronization for product catalog updates

## 5. Constraints and Assumptions

### Constraints
- **Budget:** Project budget limited to $500,000
- **Timeline:** Must be completed within 6 months
- **Technology:** Must use existing cloud infrastructure (AWS)
- **Compliance:** Must maintain PCI DSS compliance throughout development

### Assumptions
- **User Adoption:** Existing customers will migrate to new platform
- **Data Migration:** Current product data is accurate and complete
- **Third-party Services:** External APIs will maintain current service levels
- **Team Availability:** Development team will be dedicated full-time to project`
    }
];

/**
 * Work Breakdown Structure Examples
 */
export const WBS_EXAMPLES: FewShotExample[] = [
    {
        description: "Detailed WBS for software development project",
        input: `Project Context:
- Name: Customer Relationship Management System
- Type: Enterprise Software Development
- Description: Develop custom CRM system for sales and customer service teams
- Duration: 12 months
- Team: 15 people including developers, analysts, and testers`,
        output: `# Work Breakdown Structure: Customer Relationship Management System

## 1. Project Management (1.0)
### 1.1 Project Initiation
- 1.1.1 Project Charter Development
- 1.1.2 Stakeholder Identification and Analysis
- 1.1.3 Initial Risk Assessment
- 1.1.4 Project Kick-off Meeting

### 1.2 Project Planning
- 1.2.1 Detailed Project Schedule Development
- 1.2.2 Resource Planning and Allocation
- 1.2.3 Communication Plan Development
- 1.2.4 Quality Management Plan
- 1.2.5 Risk Management Plan

### 1.3 Project Monitoring and Control
- 1.3.1 Weekly Status Reporting
- 1.3.2 Monthly Stakeholder Reviews
- 1.3.3 Change Control Management
- 1.3.4 Quality Assurance Reviews

### 1.4 Project Closure
- 1.4.1 Final Deliverable Acceptance
- 1.4.2 Project Documentation Archive
- 1.4.3 Lessons Learned Documentation
- 1.4.4 Project Closure Report

## 2. Requirements and Analysis (2.0)
### 2.1 Business Requirements Gathering
- 2.1.1 Stakeholder Interviews
- 2.1.2 Current Process Analysis
- 2.1.3 Business Requirements Documentation
- 2.1.4 Requirements Validation and Approval

### 2.2 Functional Requirements Analysis
- 2.2.1 Use Case Development
- 2.2.2 User Story Creation and Prioritization
- 2.2.3 Functional Specification Document
- 2.2.4 Requirements Traceability Matrix

### 2.3 Technical Requirements Analysis
- 2.3.1 System Architecture Design
- 2.3.2 Technology Stack Selection
- 2.3.3 Integration Requirements Analysis
- 2.3.4 Performance and Security Requirements

## 3. System Design (3.0)
### 3.1 User Interface Design
- 3.1.1 User Experience Research
- 3.1.2 Wireframe Development
- 3.1.3 Visual Design and Mockups
- 3.1.4 Prototype Development and Testing

### 3.2 Database Design
- 3.2.1 Data Model Development
- 3.2.2 Database Schema Design
- 3.2.3 Data Migration Strategy
- 3.2.4 Database Performance Optimization

### 3.3 System Architecture Design
- 3.3.1 Application Architecture Design
- 3.3.2 API Design and Documentation
- 3.3.3 Security Architecture Design
- 3.3.4 Deployment Architecture Design

## 4. Development (4.0)
### 4.1 Core Application Development
- 4.1.1 User Management Module
- 4.1.2 Contact Management Module
- 4.1.3 Lead Management Module
- 4.1.4 Opportunity Management Module
- 4.1.5 Account Management Module

### 4.2 Advanced Features Development
- 4.2.1 Reporting and Analytics Module
- 4.2.2 Email Integration Module
- 4.2.3 Calendar Integration Module
- 4.2.4 Mobile Application Development

### 4.3 Integration Development
- 4.3.1 Email System Integration
- 4.3.2 Calendar System Integration
- 4.3.3 Third-party API Integrations
- 4.3.4 Data Import/Export Functionality

## 5. Testing (5.0)
### 5.1 Test Planning and Preparation
- 5.1.1 Test Strategy Development
- 5.1.2 Test Plan Creation
- 5.1.3 Test Environment Setup
- 5.1.4 Test Data Preparation

### 5.2 Functional Testing
- 5.2.1 Unit Testing
- 5.2.2 Integration Testing
- 5.2.3 System Testing
- 5.2.4 User Acceptance Testing

### 5.3 Non-Functional Testing
- 5.3.1 Performance Testing
- 5.3.2 Security Testing
- 5.3.3 Usability Testing
- 5.3.4 Compatibility Testing

## 6. Deployment and Go-Live (6.0)
### 6.1 Deployment Preparation
- 6.1.1 Production Environment Setup
- 6.1.2 Data Migration Execution
- 6.1.3 System Configuration
- 6.1.4 Go-Live Readiness Assessment

### 6.2 User Training and Support
- 6.2.1 Training Material Development
- 6.2.2 User Training Sessions
- 6.2.3 Administrator Training
- 6.2.4 Support Documentation Creation

### 6.3 Go-Live Activities
- 6.3.1 System Deployment
- 6.3.2 Go-Live Support
- 6.3.3 Post-Deployment Monitoring
- 6.3.4 Issue Resolution and Support`
    }
];

/**
 * Risk Management Examples
 */
export const RISK_MANAGEMENT_EXAMPLES: FewShotExample[] = [
    {
        description: "Comprehensive risk register for technology project",
        input: `Project Context:
- Name: Cloud Migration Project
- Type: Infrastructure Migration
- Description: Migrate on-premises applications and data to AWS cloud
- Timeline: 10 months
- Critical systems: ERP, CRM, Email, File Storage`,
        output: `# Risk Register: Cloud Migration Project

## High-Priority Risks

### RISK-001: Data Loss During Migration
**Category:** Technical Risk
**Description:** Critical business data could be lost or corrupted during the migration process from on-premises to cloud storage.
**Probability:** Medium (30%)
**Impact:** High (8/10)
**Risk Score:** 2.4 (High)
**Root Causes:**
- Complex data dependencies between systems
- Large volume of legacy data with inconsistent formats
- Limited migration testing capabilities

**Mitigation Strategies:**
- Implement comprehensive data backup procedures before migration
- Conduct pilot migrations with non-critical data first
- Establish data validation checkpoints throughout migration process
- Maintain parallel systems during transition period

**Contingency Plans:**
- Immediate rollback procedures to on-premises systems
- Data recovery from multiple backup sources
- Emergency data reconstruction from transaction logs

**Owner:** IT Infrastructure Manager
**Status:** Active
**Next Review:** Weekly during migration phases

### RISK-002: Extended System Downtime
**Category:** Operational Risk
**Description:** Business operations could be severely impacted by extended system downtime during migration cutover.
**Probability:** Medium (40%)
**Impact:** High (9/10)
**Risk Score:** 3.6 (High)
**Root Causes:**
- Complex system interdependencies
- Limited maintenance windows
- Potential for unexpected technical issues

**Mitigation Strategies:**
- Schedule migrations during low-business-impact periods
- Implement phased migration approach to minimize simultaneous downtime
- Establish detailed rollback procedures with time limits
- Conduct thorough testing in staging environment

**Contingency Plans:**
- Emergency rollback to on-premises systems within 4 hours
- Alternative manual processes for critical business functions
- Communication plan for stakeholder notification

**Owner:** Project Manager
**Status:** Active
**Next Review:** Bi-weekly

## Medium-Priority Risks

### RISK-003: Cloud Service Provider Outage
**Category:** External Risk
**Description:** AWS service outages could impact business operations and project timeline.
**Probability:** Low (15%)
**Impact:** High (7/10)
**Risk Score:** 1.05 (Medium)
**Root Causes:**
- Dependency on single cloud provider
- Limited control over external service availability
- Potential for regional service disruptions

**Mitigation Strategies:**
- Implement multi-region deployment architecture
- Establish service level agreements with clear uptime requirements
- Monitor AWS service health dashboards continuously
- Develop disaster recovery procedures for cloud outages

**Contingency Plans:**
- Failover to secondary AWS region within 2 hours
- Temporary rollback to on-premises systems if necessary
- Alternative cloud provider evaluation for critical services

**Owner:** Cloud Architect
**Status:** Active
**Next Review:** Monthly

### RISK-004: Skills Gap in Cloud Technologies
**Category:** Resource Risk
**Description:** Team members may lack sufficient expertise in AWS cloud technologies, leading to implementation delays and quality issues.
**Probability:** High (60%)
**Impact:** Medium (5/10)
**Risk Score:** 3.0 (Medium)
**Root Causes:**
- Limited prior cloud migration experience
- Rapid evolution of cloud technologies
- Insufficient training budget allocation

**Mitigation Strategies:**
- Provide comprehensive AWS training for all team members
- Engage AWS professional services for knowledge transfer
- Hire experienced cloud consultants for critical phases
- Establish mentoring program with cloud experts

**Contingency Plans:**
- Increase consultant engagement if internal skills prove insufficient
- Extend project timeline to accommodate additional training
- Prioritize critical system migrations with most experienced resources

**Owner:** HR Manager / Project Manager
**Status:** Active
**Next Review:** Monthly

## Low-Priority Risks

### RISK-005: Budget Overrun Due to Cloud Costs
**Category:** Financial Risk
**Description:** Actual cloud operational costs may exceed budgeted amounts due to usage patterns or pricing changes.
**Probability:** Medium (35%)
**Impact:** Low (3/10)
**Risk Score:** 1.05 (Low)
**Root Causes:**
- Difficulty in accurately predicting cloud usage patterns
- Potential for cost optimization oversights
- AWS pricing model complexity

**Mitigation Strategies:**
- Implement comprehensive cloud cost monitoring and alerting
- Conduct regular cost optimization reviews
- Establish cloud spending governance policies
- Use AWS cost estimation tools for budget planning

**Contingency Plans:**
- Implement immediate cost reduction measures (rightsizing, reserved instances)
- Negotiate additional budget allocation if necessary
- Optimize or migrate less critical workloads to reduce costs

**Owner:** Finance Manager
**Status:** Active
**Next Review:** Monthly

## Risk Monitoring and Reporting

### Risk Review Schedule
- **Weekly:** High-priority risks during active migration phases
- **Bi-weekly:** All risks during planning and preparation phases
- **Monthly:** Comprehensive risk register review and updates
- **Quarterly:** Risk management process effectiveness review

### Risk Escalation Criteria
- **Immediate Escalation:** Risk score increases above 4.0
- **Weekly Escalation:** New high-priority risks identified
- **Monthly Escalation:** Risk mitigation strategies prove ineffective

### Risk Communication Plan
- **Daily Standups:** Current risk status for active migration activities
- **Weekly Reports:** Risk dashboard for project stakeholders
- **Monthly Reviews:** Comprehensive risk analysis for steering committee`
    }
];

/**
 * Stakeholder Management Examples
 */
export const STAKEHOLDER_MANAGEMENT_EXAMPLES: FewShotExample[] = [
    {
        description: "Comprehensive stakeholder register for enterprise project",
        input: `Project Context:
- Name: Digital Transformation Initiative
- Type: Enterprise Technology Implementation
- Description: Modernize legacy systems and implement new digital workflows
- Duration: 24 months
- Budget: $5M
- Stakeholders: C-level executives, department heads, IT teams, end users`,
        output: `# Stakeholder Register: Digital Transformation Initiative

## Executive Stakeholders

### STK-001: Chief Executive Officer (CEO)
**Name:** Sarah Johnson
**Role:** Project Sponsor
**Department:** Executive Leadership
**Influence:** High (9/10)
**Interest:** High (9/10)
**Power:** High (10/10)
**Attitude:** Supportive

**Expectations:**
- Strategic alignment with business objectives
- ROI achievement within 18 months post-implementation
- Minimal business disruption during transition
- Clear communication of progress and risks

**Communication Requirements:**
- Monthly executive briefings
- Quarterly steering committee meetings
- Immediate escalation for high-risk issues
- Annual strategic review sessions

**Engagement Strategy:**
- Regular one-on-one updates with Project Manager
- Participation in key milestone reviews
- Final approval authority for major decisions
- Champion role for organizational change

### STK-002: Chief Information Officer (CIO)
**Name:** Michael Chen
**Role:** Technical Sponsor
**Department:** Information Technology
**Influence:** High (8/10)
**Interest:** High (9/10)
**Power:** High (8/10)
**Attitude:** Supportive

**Expectations:**
- Technical architecture alignment with IT strategy
- Security and compliance requirements adherence
- Integration with existing systems
- Knowledge transfer to internal IT team

**Communication Requirements:**
- Bi-weekly technical reviews
- Monthly architecture board meetings
- Weekly status updates during critical phases
- Immediate notification of technical risks

## Department Stakeholders

### STK-003: Head of Sales
**Name:** Jennifer Martinez
**Role:** Business Unit Leader
**Department:** Sales
**Influence:** Medium (6/10)
**Interest:** High (8/10)
**Power:** Medium (6/10)
**Attitude:** Neutral to Supportive

**Expectations:**
- Improved sales process efficiency
- Enhanced customer relationship management
- Minimal disruption to sales activities
- Training and support for sales team

**Communication Requirements:**
- Monthly department updates
- Quarterly business impact reviews
- Training schedule coordination
- Change impact assessments

### STK-004: Head of Operations
**Name:** David Kim
**Role:** Process Owner
**Department:** Operations
**Influence:** Medium (7/10)
**Interest:** High (8/10)
**Power:** Medium (7/10)
**Attitude:** Cautious

**Expectations:**
- Streamlined operational processes
- Reduced manual work and errors
- Comprehensive training program
- Phased implementation approach

**Communication Requirements:**
- Bi-weekly operational impact reviews
- Monthly process design sessions
- Training coordination meetings
- Go-live support planning

## Technical Stakeholders

### STK-005: IT Security Manager
**Name:** Lisa Wang
**Role:** Security Compliance Officer
**Department:** IT Security
**Influence:** High (8/10)
**Interest:** Medium (6/10)
**Power:** High (8/10)
**Attitude:** Cautious

**Expectations:**
- Full security compliance verification
- Risk assessment and mitigation
- Security testing and validation
- Incident response procedures

**Communication Requirements:**
- Weekly security reviews during development
- Monthly compliance status reports
- Immediate escalation for security issues
- Security testing coordination

## End User Representatives

### STK-006: Sales Representative (Power User)
**Name:** Robert Thompson
**Role:** End User Champion
**Department:** Sales
**Influence:** Low (3/10)
**Interest:** High (9/10)
**Power:** Low (2/10)
**Attitude:** Supportive

**Expectations:**
- User-friendly system interface
- Comprehensive training and support
- Feedback incorporation in design
- Minimal learning curve

**Communication Requirements:**
- Weekly user acceptance testing sessions
- Monthly feedback collection meetings
- Training session participation
- Go-live support availability

## External Stakeholders

### STK-007: Technology Vendor
**Name:** TechSolutions Inc.
**Role:** Implementation Partner
**Department:** External
**Influence:** Medium (6/10)
**Interest:** High (8/10)
**Power:** Medium (5/10)
**Attitude:** Supportive

**Expectations:**
- Clear project requirements and scope
- Timely decision-making and approvals
- Access to necessary resources and information
- Payment according to contract terms

**Communication Requirements:**
- Daily standups during active development
- Weekly progress reviews
- Monthly vendor management meetings
- Quarterly contract reviews

## Stakeholder Analysis Summary

### High Influence, High Interest (Manage Closely)
- CEO (STK-001)
- CIO (STK-002)
- IT Security Manager (STK-005)

### High Influence, Low Interest (Keep Satisfied)
- None identified in current analysis

### Low Influence, High Interest (Keep Informed)
- Head of Sales (STK-003)
- Head of Operations (STK-004)
- Sales Representative (STK-006)
- Technology Vendor (STK-007)

### Low Influence, Low Interest (Monitor)
- None identified in current analysis

## Communication Plan Summary

### Daily Communications
- Development team standups with vendor
- Critical issue escalations

### Weekly Communications
- Security reviews and user testing sessions
- Status updates to CIO during critical phases

### Monthly Communications
- Executive briefings to CEO
- Department updates to business unit leaders
- Vendor management meetings

### Quarterly Communications
- Steering committee meetings
- Business impact reviews
- Contract reviews with external vendors`
    }
];

/**
 * Master collection of all few-shot examples organized by document type
 */
export const PMBOK_FEW_SHOT_EXAMPLES: DocumentExamples = {
    'project-charter': PROJECT_CHARTER_EXAMPLES,
    'scope-management-plan': SCOPE_MANAGEMENT_EXAMPLES,
    'requirements-documentation': REQUIREMENTS_DOCUMENTATION_EXAMPLES,
    'requirements-traceability-matrix': REQUIREMENTS_DOCUMENTATION_EXAMPLES, // Reuse for RTM
    'work-breakdown-structure': WBS_EXAMPLES,
    'risk-register': RISK_MANAGEMENT_EXAMPLES,
    'risk-management-plan': RISK_MANAGEMENT_EXAMPLES,
    'stakeholder-register': STAKEHOLDER_MANAGEMENT_EXAMPLES,
    'stakeholder-analysis': STAKEHOLDER_MANAGEMENT_EXAMPLES,
    'project-management-plan': PROJECT_CHARTER_EXAMPLES, // Reuse charter examples for PMP
    'develop-project-charter': PROJECT_CHARTER_EXAMPLES,
    'validate-scope-process': SCOPE_MANAGEMENT_EXAMPLES,
    'control-scope-process': SCOPE_MANAGEMENT_EXAMPLES,
    'define-scope-process': SCOPE_MANAGEMENT_EXAMPLES,
    'plan-scope-management': SCOPE_MANAGEMENT_EXAMPLES,
    // Add more document types as needed
};

/**
 * Get few-shot examples for a specific document type
 */
export function getFewShotExamples(documentType: string): FewShotExample[] {
    return PMBOK_FEW_SHOT_EXAMPLES[documentType] || [];
}

/**
 * Get a random few-shot example for a document type
 */
export function getRandomExample(documentType: string): FewShotExample | null {
    const examples = getFewShotExamples(documentType);
    if (examples.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * examples.length);
    return examples[randomIndex];
}

/**
 * Format few-shot examples for inclusion in AI prompts
 */
export function formatExamplesForPrompt(examples: FewShotExample[]): string {
    if (examples.length === 0) return '';
    
    return examples.map((example, index) => `
## Example ${index + 1}: ${example.description}

**Input Context:**
${example.input}

**Expected Output:**
${example.output}
`).join('\n');
}