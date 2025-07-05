import type { ProjectContext } from '../../ai/types.js';

/**
 * Implementation Guides Template generates comprehensive implementation guide overview
 * covering all aspects of the development and deployment process.
 */
export class ImplementationGuidesTemplate {
  
  /**
   * Build the markdown content for Implementation Guides Overview
   */
  generateContent(context: ProjectContext): string {
    const projectName = context.projectName || 'Unnamed Project';
    const projectDescription = context.description || 'No description provided';
    const projectType = context.projectType || 'Software Project';
    
    return `# Implementation Guides Overview

**Project Name:** ${projectName}  
**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** Draft  
**Project Type:** ${projectType}

## Executive Summary

${projectDescription}

This document serves as a comprehensive overview and navigation hub for all implementation guides related to ${projectName}. It provides a structured approach to project implementation, from initial development setup through production deployment and ongoing maintenance.

## 1. Implementation Process Overview

### 1.1 Implementation Philosophy
Our implementation approach follows industry best practices and is designed to ensure:
- **Quality**: Consistent code quality and documentation standards
- **Efficiency**: Streamlined development and deployment processes  
- **Reliability**: Robust testing and deployment procedures
- **Maintainability**: Clear documentation and version control practices
- **Scalability**: Architecture and processes that can grow with the project

### 1.2 Implementation Lifecycle
The implementation process is divided into several key phases:

1. **Development Setup** - Environment configuration and tooling
2. **Development Workflow** - Day-to-day development processes
3. **Code Quality** - Standards, documentation, and review processes
4. **Integration & Testing** - CI/CD pipeline and testing strategies
5. **Deployment & Operations** - Release management and troubleshooting

## 2. Available Implementation Guides

### 2.1 Development Foundation Guides

#### 📝 [Coding Standards Guide](./coding-standards.md)
**Priority: High** | **Phase: Development Setup**
- Code formatting and style guidelines
- Naming conventions and best practices
- Language-specific coding standards
- Code review criteria and checklists

#### 🔧 [Development Setup Guide](./development-setup.md)
**Priority: Critical** | **Phase: Development Setup**
- Prerequisites and dependencies installation
- IDE configuration and recommended extensions
- Local environment setup procedures
- Database and service configuration

#### 📚 [Code Documentation Guide](./code-documentation.md)
**Priority: High** | **Phase: Development Workflow**
- Documentation standards and templates
- API documentation requirements
- Inline code comment guidelines
- Architecture decision records (ADRs)

### 2.2 Version Control & Collaboration

#### 🔀 [Version Control Guidelines](./version-control.md)
**Priority: Critical** | **Phase: Development Setup**
- Git workflow and branching strategies
- Commit message conventions
- Pull request and code review processes
- Repository organization and access control

#### ⚙️ [Development Workflow Guide](./development-workflow.md)
**Priority: High** | **Phase: Development Workflow**
- Feature development lifecycle
- Task management and tracking
- Collaboration and communication protocols
- Development methodology and practices

### 2.3 Integration & Deployment

#### 🔄 [CI/CD Pipeline Guide](./ci-pipeline.md)
**Priority: High** | **Phase: Integration & Testing**
- Continuous integration setup and configuration
- Automated testing strategies
- Build and deployment automation
- Pipeline monitoring and optimization

#### 🚀 [Release Process Guide](./release-process.md)
**Priority: High** | **Phase: Deployment & Operations**
- Release planning and preparation
- Versioning and changelog management
- Deployment procedures and rollback strategies
- Post-release monitoring and validation

#### 📦 [Deployment Guide](./deployment-guide.md)
**Priority: Critical** | **Phase: Deployment & Operations**
- Environment setup and configuration
- Infrastructure requirements and provisioning
- Security considerations and best practices
- Monitoring and health check implementation

### 2.4 Integration & API Management

#### 🔌 [API Integration Guide](./api-integration.md)
**Priority: Medium** | **Phase: Development Workflow**
- API design and documentation standards
- Integration testing strategies
- Error handling and retry mechanisms
- Performance optimization and caching

### 2.5 Operations & Maintenance

#### 🔍 [Troubleshooting Guide](./troubleshooting.md)
**Priority: Medium** | **Phase: Deployment & Operations**
- Common issues and solutions
- Debugging techniques and tools
- Log analysis and monitoring
- Incident response procedures

## 3. Implementation Roadmap

### 3.1 Phase 1: Foundation (Week 1-2)
**Critical Priority Guides**
1. Development Setup Guide
2. Version Control Guidelines  
3. Coding Standards Guide

**Deliverables:**
- Fully configured development environments
- Established repository structure and access
- Documented coding standards and review processes

### 3.2 Phase 2: Development Process (Week 2-4)
**High Priority Guides**
1. Development Workflow Guide
2. Code Documentation Guide
3. CI/CD Pipeline Guide

**Deliverables:**
- Automated build and test pipeline
- Comprehensive development workflow documentation
- Code quality gates and automated checks

### 3.3 Phase 3: Deployment & Operations (Week 4-6)
**Production Readiness Guides**
1. Deployment Guide
2. Release Process Guide
3. Troubleshooting Guide

**Deliverables:**
- Production deployment procedures
- Release management processes
- Operational monitoring and support documentation

### 3.4 Phase 4: Integration & Optimization (Week 6+)
**Enhancement Guides**
1. API Integration Guide
2. Performance optimization documentation
3. Advanced troubleshooting procedures

**Deliverables:**
- External integration documentation
- Performance benchmarks and optimization guides
- Advanced operational procedures

## 4. Project-Specific Considerations

{{AI_INSIGHTS}}

## 5. Getting Started

### 5.1 For New Team Members
1. **Start with [Development Setup Guide](./development-setup.md)** - Get your environment configured
2. **Review [Coding Standards Guide](./coding-standards.md)** - Understand quality expectations
3. **Study [Version Control Guidelines](./version-control.md)** - Learn the workflow processes
4. **Read [Development Workflow Guide](./development-workflow.md)** - Understand daily procedures

### 5.2 For Project Leads
1. **Customize guides** based on project-specific requirements
2. **Establish team training schedule** for guide adoption
3. **Set up monitoring** for compliance with established processes
4. **Regular review and updates** of guides based on team feedback

### 5.3 For DevOps Engineers
1. **Implement [CI/CD Pipeline Guide](./ci-pipeline.md)** automation
2. **Configure deployment** processes per [Deployment Guide](./deployment-guide.md)
3. **Set up monitoring** and alerting systems
4. **Prepare [Troubleshooting Guide](./troubleshooting.md)** documentation

## 6. Guide Maintenance and Updates

### 6.1 Review Schedule
- **Quarterly Reviews**: Assess guide effectiveness and relevance
- **Post-Project Reviews**: Update guides based on lessons learned
- **Technology Updates**: Revise guides when tools or frameworks change
- **Team Feedback**: Incorporate suggestions and improvements

### 6.2 Version Control
All implementation guides are maintained under version control with:
- Clear change logs and rationale
- Review and approval processes
- Rollback procedures if needed
- Historical tracking of modifications

### 6.3 Continuous Improvement
- Gather metrics on guide usage and effectiveness
- Regular team surveys on guide usefulness
- Benchmark against industry best practices
- Incorporate new tools and methodologies

## 7. Support and Resources

### 7.1 Internal Resources
- **Development Team Leads**: Guide implementation and compliance
- **DevOps Engineers**: Infrastructure and deployment support
- **Technical Writers**: Documentation maintenance and updates
- **Project Managers**: Process coordination and tracking

### 7.2 External Resources
- Industry best practice documentation
- Technology-specific official documentation  
- Community forums and knowledge bases
- Professional development and training resources

### 7.3 Feedback and Contributions
We encourage team members to:
- Suggest improvements to existing guides
- Propose new guides for emerging needs
- Share lessons learned and best practices
- Contribute to guide maintenance and updates

---

**Next Steps:**
1. Review the project-specific considerations section
2. Identify the most relevant guides for your role
3. Follow the getting started checklist for your position
4. Provide feedback on guide effectiveness and usability

**Document Maintainers:** Development Team  
**Last Updated:** ${new Date().toISOString().split('T')[0]}  
**Review Date:** ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`;
  }
}
