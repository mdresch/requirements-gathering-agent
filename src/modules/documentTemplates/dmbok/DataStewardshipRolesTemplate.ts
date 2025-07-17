import { ProjectContext } from '../../ai/types';

export class DataStewardshipRolesTemplate {
  buildPrompt(context: ProjectContext): string {
    const today = new Date().toISOString().split('T')[0];
    return `# Data Stewardship and Roles & Responsibilities Framework for ${context.projectName}

Document ID: DS-RR-001  
Version: 1.0  
Status: Proposed  
Date: ${today}

## 1. Executive Summary

### 1.1 Purpose and Scope
This document establishes the comprehensive Data Stewardship and Roles & Responsibilities Framework for the ${context.projectName}. It defines the organizational structure, roles, responsibilities, and governance processes necessary to ensure effective data stewardship across all data domains within the project ecosystem.

The framework aligns with DMBOK 2.0 principles and establishes clear accountability for data quality, security, compliance, and lifecycle management. This document serves as the foundation for data governance implementation and supports the organization's journey toward data-driven decision making.

### 1.2 Strategic Importance
Effective data stewardship is critical for:
- Ensuring data quality and reliability across all business processes
- Maintaining compliance with regulatory requirements (GDPR, SOX, HIPAA)
- Enabling data-driven decision making and business intelligence
- Protecting organizational data assets and intellectual property
- Supporting digital transformation and innovation initiatives

### 1.3 Key Stakeholders
This framework impacts all stakeholders involved in data creation, management, and consumption within ${context.projectName}, including business users, IT teams, compliance officers, and executive leadership.

## 2. Data Stewardship Framework

### 2.1 Definition and Principles
Data stewardship is the management and oversight of an organization's data assets to help provide business users with high-quality data that is easily accessible in a consistent manner.

**Core Principles:**
- **Accountability**: Clear ownership and responsibility for data assets
- **Quality**: Commitment to maintaining high standards of data accuracy and completeness
- **Accessibility**: Ensuring authorized users can access needed data efficiently
- **Security**: Protecting data assets from unauthorized access and breaches
- **Compliance**: Adherence to regulatory and organizational requirements
- **Transparency**: Open communication about data policies and procedures

### 2.2 Stewardship Model
The ${context.projectName} adopts a federated stewardship model that balances centralized governance with distributed execution:

- **Centralized Governance**: Core policies, standards, and frameworks
- **Distributed Stewardship**: Domain-specific implementation and day-to-day management
- **Collaborative Decision-Making**: Cross-functional teams for complex data issues

### 2.3 Governance Integration
This framework integrates with the broader data governance structure through:
- Alignment with data governance policies and procedures
- Regular reporting to the Data Governance Council
- Participation in governance committees and working groups
- Compliance with enterprise data management standards

## 3. Role Definitions

### 3.1 Data Owner
**Definition**: Business executive or senior manager accountable for the business value and appropriate use of specific data assets.

**Key Responsibilities**:
- Define business requirements for data quality and usage
- Approve access rights and data sharing agreements
- Resolve business-related data conflicts and issues
- Ensure compliance with regulatory requirements
- Sponsor data improvement initiatives

**Authority Level**: Strategic decision-making for assigned data domains
**Reporting**: Reports to executive leadership and Data Governance Council

### 3.2 Data Steward
**Definition**: Subject matter expert responsible for day-to-day data management activities within specific data domains.

**Key Responsibilities**:
- Monitor data quality and implement improvement measures
- Maintain data definitions and business rules
- Coordinate data integration and migration activities
- Provide user support and training
- Escalate issues to Data Owners when necessary

**Authority Level**: Operational decision-making within defined scope
**Reporting**: Reports to Data Owner and participates in stewardship committees

### 3.3 Data Custodian
**Definition**: IT professional responsible for technical implementation of data management requirements.

**Key Responsibilities**:
- Implement technical data controls and security measures
- Maintain data infrastructure and systems
- Execute data backup and recovery procedures
- Monitor system performance and availability
- Support data integration and ETL processes

**Authority Level**: Technical implementation within approved frameworks
**Reporting**: Reports to IT management and coordinates with Data Stewards

### 3.4 Data User
**Definition**: Individual who accesses and uses data to perform business functions.

**Key Responsibilities**:
- Follow data usage policies and procedures
- Report data quality issues and anomalies
- Participate in data training programs
- Maintain confidentiality and security of accessed data
- Provide feedback on data usability and requirements

**Authority Level**: Data consumption within authorized scope
**Reporting**: Reports to business management and Data Stewards

### 3.5 Data Architect
**Definition**: Technical expert responsible for designing data structures, models, and integration patterns.

**Key Responsibilities**:
- Design data models and architecture blueprints
- Define data integration standards and patterns
- Evaluate and recommend data technologies
- Ensure architectural compliance across projects
- Support data governance through technical expertise

**Authority Level**: Technical design decisions within enterprise standards
**Reporting**: Reports to enterprise architecture and Data Governance Council

### 3.6 Data Analyst
**Definition**: Professional who analyzes data to generate insights and support decision-making.

**Key Responsibilities**:
- Perform data analysis and generate reports
- Identify data quality issues and trends
- Support business intelligence initiatives
- Collaborate with business users on requirements
- Contribute to data documentation and metadata

**Authority Level**: Analytical interpretation within business context
**Reporting**: Reports to business management and Data Stewards

### 3.7 Data Protection Officer (DPO)
**Definition**: Specialist responsible for ensuring compliance with data protection regulations.

**Key Responsibilities**:
- Monitor compliance with data protection laws
- Conduct privacy impact assessments
- Provide guidance on data protection matters
- Serve as point of contact for regulatory authorities
- Manage data subject requests and complaints

**Authority Level**: Regulatory compliance oversight and enforcement
**Reporting**: Reports to executive leadership and legal counsel

## 4. Responsibilities Matrix

### 4.1 Role-specific Accountabilities
Each role has specific accountabilities that contribute to overall data stewardship effectiveness:

**Data Quality Management**:
- Data Owner: Define quality requirements and approve remediation plans
- Data Steward: Monitor quality metrics and implement improvements
- Data Custodian: Execute technical quality controls and validations
- Data User: Report quality issues and follow usage guidelines

**Data Security and Access Control**:
- Data Owner: Approve access policies and security requirements
- Data Steward: Manage user access requests and permissions
- Data Custodian: Implement technical security controls
- DPO: Ensure compliance with privacy regulations

**Metadata Management**:
- Data Architect: Define metadata standards and models
- Data Steward: Maintain business metadata and definitions
- Data Custodian: Manage technical metadata and lineage
- Data Analyst: Contribute to analytical metadata

### 4.2 Decision-making Authority
Clear decision-making authority prevents delays and ensures accountability:

**Strategic Decisions**: Data Owner and Data Governance Council
**Operational Decisions**: Data Steward within defined scope
**Technical Decisions**: Data Custodian and Data Architect
**Compliance Decisions**: Data Protection Officer

### 4.3 Escalation Procedures
Structured escalation ensures timely resolution of issues:

1. **Level 1**: Data User to Data Steward
2. **Level 2**: Data Steward to Data Owner
3. **Level 3**: Data Owner to Data Governance Council
4. **Level 4**: Data Governance Council to Executive Leadership

### 4.4 Performance Metrics
Role effectiveness is measured through specific KPIs:

- Data quality scores and improvement trends
- Issue resolution time and escalation rates
- Compliance audit results and findings
- User satisfaction and training completion rates
- Data asset utilization and business value metrics

## 5. RACI Matrix for Data Management Activities

### 5.1 Data Quality Management
| Activity | Data Owner | Data Steward | Data Custodian | Data User | Data Analyst | DPO |
|----------|------------|--------------|----------------|-----------|--------------|-----|
| Define Quality Standards | A | R | C | I | C | I |
| Monitor Quality Metrics | C | R | C | I | C | I |
| Investigate Quality Issues | C | R | C | I | R | I |
| Implement Quality Controls | A | C | R | I | I | I |
| Report Quality Status | I | R | C | I | C | I |

### 5.2 Data Classification and Security
| Activity | Data Owner | Data Steward | Data Custodian | Data User | Data Architect | DPO |
|----------|------------|--------------|----------------|-----------|----------------|-----|
| Define Classification Scheme | A | C | I | I | C | R |
| Classify Data Assets | C | R | I | I | I | C |
| Implement Security Controls | A | C | R | I | C | C |
| Monitor Access and Usage | C | R | R | I | I | C |
| Conduct Security Assessments | C | C | R | I | I | R |

### 5.3 Data Access Control
| Activity | Data Owner | Data Steward | Data Custodian | Data User | DPO |
|----------|------------|--------------|----------------|-----------|-----|
| Define Access Policies | A | C | I | I | C |
| Approve Access Requests | A | R | I | I | C |
| Provision User Access | I | C | R | I | I |
| Review Access Rights | A | R | C | I | C |
| Revoke Access | A | R | R | I | I |

## 6. Role Assignment and Staffing

### 6.1 Selection Criteria
Effective role assignment requires consideration of:

**Business Knowledge**: Understanding of business processes and data usage
**Technical Skills**: Appropriate technical competencies for the role
**Communication**: Ability to collaborate across organizational boundaries
**Analytical Thinking**: Capability to solve complex data-related problems
**Attention to Detail**: Focus on accuracy and quality in data management

### 6.2 Skills and Competencies
Each role requires specific competencies:

**Data Owner**: Business leadership, strategic thinking, decision-making
**Data Steward**: Domain expertise, analytical skills, communication
**Data Custodian**: Technical expertise, system administration, security
**Data User**: Business analysis, tool proficiency, compliance awareness

### 6.3 Training Requirements
Comprehensive training ensures role effectiveness:

- Data governance principles and frameworks
- Role-specific responsibilities and procedures
- Tools and technologies used in data management
- Regulatory compliance requirements
- Communication and collaboration skills

### 6.4 Career Development Paths
Clear career progression supports retention and motivation:

- Data User → Data Steward → Data Owner
- Data Custodian → Data Architect → Enterprise Architect
- Data Analyst → Senior Analyst → Data Scientist
- Cross-functional movement between technical and business roles

## 7. Communication and Training

### 7.1 Stakeholder Communication Plan
Effective communication ensures framework adoption:

**Executive Leadership**: Quarterly governance reports and strategic updates
**Business Users**: Regular training sessions and policy updates
**IT Teams**: Technical briefings and implementation guidance
**External Partners**: Compliance reports and data sharing agreements

### 7.2 Training Programs
Comprehensive training supports role effectiveness:

- **New Employee Orientation**: Introduction to data governance and stewardship
- **Role-Specific Training**: Detailed training for each stewardship role
- **Ongoing Education**: Regular updates on policies, tools, and best practices
- **Certification Programs**: Professional development and skill validation

### 7.3 Onboarding Process
Structured onboarding ensures quick productivity:

1. Role assignment and responsibility briefing
2. Access provisioning and security training
3. Tool training and hands-on practice
4. Mentoring and support assignment
5. Performance expectations and metrics review

### 7.4 Ongoing Education
Continuous learning maintains competency:

- Monthly stewardship forums and knowledge sharing
- Quarterly training on new tools and technologies
- Annual conferences and professional development
- Cross-training and role rotation opportunities

## 8. Monitoring and Evaluation

### 8.1 Performance Indicators
Framework effectiveness is measured through:

**Quantitative Metrics**:
- Data quality scores and trends
- Issue resolution time and escalation rates
- Compliance audit results
- Training completion rates
- User satisfaction scores

**Qualitative Assessments**:
- Stakeholder feedback and surveys
- Process effectiveness reviews
- Cultural maturity assessments
- Best practice adoption rates

### 8.2 Regular Review Cycles
Systematic reviews ensure continuous improvement:

**Monthly**: Operational metrics review and issue tracking
**Quarterly**: Role effectiveness assessment and training evaluation
**Semi-annually**: Framework compliance audit and gap analysis
**Annually**: Comprehensive framework review and strategic alignment

### 8.3 Role Effectiveness Assessment
Individual role performance is evaluated through:

- Goal achievement and KPI performance
- Stakeholder feedback and peer reviews
- Skill development and training completion
- Innovation and process improvement contributions

### 8.4 Continuous Improvement
Framework evolution is driven by:

- Regular feedback collection and analysis
- Industry best practice research and adoption
- Technology advancement and tool evaluation
- Organizational change and business evolution

## 9. Escalation and Decision-Making

### 9.1 Decision Authority Matrix
Clear decision rights prevent delays and ensure accountability:

| Decision Type | Primary Authority | Approval Required | Escalation Path |
|---------------|-------------------|-------------------|-----------------|
| Operational Data Issues | Data Steward | Data Owner (if significant) | Data Governance Council |
| Policy Exceptions | Data Owner | Data Governance Council | Executive Leadership |
| Resource Allocation | Data Owner | Budget Authority | Executive Leadership |
| Technology Changes | Data Architect | Data Governance Council | CTO/CIO |
| Compliance Issues | DPO | Legal Counsel | Executive Leadership |

### 9.2 Escalation Pathways
Structured escalation ensures appropriate resolution:

**Standard Escalation**:
1. Data User → Data Steward (operational issues)
2. Data Steward → Data Owner (policy or resource issues)
3. Data Owner → Data Governance Council (strategic issues)
4. Data Governance Council → Executive Leadership (enterprise issues)

**Emergency Escalation**:
- Security incidents: Direct to DPO and CISO
- Compliance violations: Direct to DPO and Legal Counsel
- System failures: Direct to Data Custodian and IT Operations

### 9.3 Conflict Resolution
Systematic approach to resolving conflicts:

1. **Direct Resolution**: Encourage direct communication between parties
2. **Mediated Resolution**: Data Steward or Data Owner facilitates discussion
3. **Formal Resolution**: Data Governance Council makes binding decision
4. **Executive Resolution**: Executive Leadership provides final determination

### 9.4 Exception Handling
Structured process for managing exceptions:

- **Exception Request**: Formal documentation of exception need
- **Impact Assessment**: Analysis of risks and benefits
- **Approval Process**: Appropriate authority review and decision
- **Monitoring**: Ongoing tracking of exception status and impact

## 10. Integration with Governance Processes

### 10.1 Policy Development
Role integration in policy creation:

- Data Owners define business requirements
- Data Stewards provide operational input
- Data Custodians assess technical feasibility
- DPO ensures regulatory compliance

### 10.2 Standards Enforcement
Collaborative approach to standards compliance:

- Data Architects define technical standards
- Data Stewards monitor compliance
- Data Custodians implement controls
- Data Owners approve enforcement actions

### 10.3 Audit and Compliance
Coordinated audit support:

- DPO leads compliance assessments
- Data Stewards provide documentation
- Data Custodians demonstrate controls
- Data Owners attest to business compliance

### 10.4 Risk Management
Integrated risk management approach:

- Data Owners identify business risks
- Data Stewards assess operational risks
- Data Custodians evaluate technical risks
- DPO monitors regulatory risks

## 11. Appendices

### 11.1 Role Description Templates
Standardized templates for role documentation:

- Position summary and key responsibilities
- Required qualifications and experience
- Performance metrics and success criteria
- Reporting relationships and authority levels

### 11.2 Training Materials
Comprehensive training resources:

- Data governance fundamentals
- Role-specific procedures and guidelines
- Tool training and user guides
- Compliance requirements and regulations

### 11.3 Communication Templates
Standard communication formats:

- Role assignment notifications
- Policy update announcements
- Issue escalation procedures
- Performance review templates

### 11.4 Glossary of Terms
Key terminology and definitions:

- Data governance and stewardship concepts
- Role and responsibility definitions
- Technical and business terminology
- Regulatory and compliance terms

---

**Document Control**:
- **Owner**: Data Governance Council
- **Approver**: Chief Data Officer
- **Review Frequency**: Annual
- **Next Review Date**: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}

This framework establishes the foundation for effective data stewardship within ${context.projectName} and supports the organization's data governance objectives through clear roles, responsibilities, and processes.`;
  }
}
