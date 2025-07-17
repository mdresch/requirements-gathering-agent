import { ProjectContext } from "../../ai/types.js";

class DocumentContentManagementTemplate {
    buildPrompt(context: ProjectContext): string {
        return `# Document & Content Management Framework

## 1. Introduction

### 1.1 Purpose and Scope
This Document & Content Management Framework establishes the standards, processes, and governance for managing documents and unstructured content across ${context.projectName || 'the organization'}. It ensures consistency, accessibility, and compliance with organizational and regulatory requirements.

### 1.2 Business Drivers
- Need for centralized content management
- Regulatory compliance requirements (e.g., GDPR, HIPAA, SOX)
- Improved collaboration and knowledge sharing
- Risk mitigation through proper retention and disposal

### 1.3 Key Objectives
- Standardize document management practices
- Ensure content security and compliance
- Improve content findability and usability
- Reduce content duplication and redundancy

## 2. Document Management Framework

### 2.1 Document Types and Classification
- **Structured Documents**: Contracts, policies, procedures
- **Unstructured Content**: Emails, reports, presentations
- **Records**: Official business records requiring retention
- **Temporary/Working Documents**: Drafts and transitory content

### 2.2 Metadata Standards
- **Core Metadata Fields**:
  - Title
  - Document Type
  - Owner/Author
  - Creation/Modification Dates
  - Version
  - Status
  - Security Classification
  - Retention Period

### 2.3 Version Control
- Version numbering scheme (e.g., v1.0, v1.1, v2.0)
- Check-in/check-out procedures
- Version history maintenance
- Major vs. minor version changes

### 2.4 Retention and Disposition
- Retention schedules by document type
- Legal hold procedures
- Secure disposal methods
- Disposition documentation

## 3. Content Management Strategy

### 3.1 Content Types and Taxonomy
- Content type definitions
- Hierarchical classification structure
- Tagging and categorization
- Controlled vocabularies

### 3.2 Content Lifecycle
- Creation and capture
- Review and approval
- Publication and distribution
- Archival and disposition

### 3.3 Content Governance
- Ownership and stewardship
- Access controls
- Content quality standards
- Review and audit processes

### 3.4 Search and Retrieval
- Search functionality requirements
- Metadata indexing
- Search result ranking
- Advanced search capabilities

## 4. Policies and Standards

### 4.1 Naming Conventions
- File naming standards
- Folder structure guidelines
- Date formats (YYYY-MM-DD)
- Special character restrictions

### 4.2 Storage and Access
- Approved storage locations
- Access control principles
- Sharing and collaboration guidelines
- External sharing restrictions

### 4.3 Security and Compliance
- Data classification levels
- Encryption requirements
- Audit logging
- Compliance monitoring

### 4.4 Audit Requirements
- Regular content audits
- Access reviews
- Compliance reporting
- Remediation procedures

## 5. Roles and Responsibilities

### 5.1 Document Owners
- Define document requirements
- Approve changes
- Ensure compliance
- Manage access

### 5.2 Content Stewards
- Maintain content quality
- Apply metadata
- Enforce standards
- Train users

### 5.3 End Users
- Follow policies and procedures
- Use approved tools
- Report issues
- Participate in training

### 5.4 IT Support
- System administration
- User access management
- Technical troubleshooting
- Backup and recovery

## 6. Implementation Roadmap

### 6.1 Phased Approach
1. **Phase 1**: Foundation (Policies, Standards, Basic Structure)
2. **Phase 2**: Technology Implementation (CMS/DMS Selection)
3. **Phase 3**: Content Migration and Cleanup
4. **Phase 4**: Training and Adoption
5. **Phase 5**: Continuous Improvement

### 6.2 Success Metrics
- Reduced time to find information
- Decreased storage costs
- Improved compliance audit results
- Increased user satisfaction

### 6.3 Continuous Improvement
- Regular policy reviews
- User feedback mechanisms
- Process optimization
- Technology updates

## 7. Appendices

### 7.1 Glossary
- **CMS**: Content Management System
- **DMS**: Document Management System
- **RIM**: Records and Information Management
- **ECM**: Enterprise Content Management

### 7.2 Templates and Examples
- Document template
- Metadata form
- Retention schedule template
- Disposition certificate

### 7.3 Related Documents
- Data Governance Framework
- Information Security Policy
- Records Management Policy
- Privacy Policy

---
*This document was generated based on the specific requirements and context of ${context.projectName || 'the project'} and should be reviewed and customized as needed for specific organizational requirements.*`;
    }
}

export default DocumentContentManagementTemplate;
