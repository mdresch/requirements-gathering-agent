import type { ProjectContext } from '../../ai/types';

/**
 * Common Goals User Personas Template generates analysis of shared objectives across user personas
 * to align Requirements Gathering Agent features with user needs and improve satisfaction.
 */
export class CommongoalsuserpersonasTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Common Goals User Personas Analysis
   */
  generateContent(): string {
    const projectName = this.context.projectName || 'Requirements Gathering Agent';
    const projectType = this.context.projectType || 'Requirements Analysis Tool';
    const description = this.context.description || 'A tool designed to streamline requirements gathering and analysis processes';

    return `# Common Goals User Personas Analysis

## Project Overview
**Project:** ${projectName}
**Type:** ${projectType}
**Description:** ${description}

## Purpose Statement
*As a requirements analyst, I want to identify common goals across the user personas, so that I can align the Requirements Gathering Agent features with user needs and improve user satisfaction.*

---

## Executive Summary

This document analyzes common goals and objectives shared across different user personas to ensure the Requirements Gathering Agent delivers maximum value and user satisfaction. By identifying shared needs, we can prioritize features that serve multiple user segments effectively.

### Key Findings
- **Primary Goal Alignment:** All personas seek efficiency in requirements gathering
- **Quality Focus:** Universal need for accurate, comprehensive documentation
- **Collaboration Enhancement:** Shared desire for improved stakeholder communication
- **Process Optimization:** Common goal of streamlined workflows

---

## Persona Overview

### Primary User Personas
1. **Requirements Analyst** - Core system user focused on thorough analysis
2. **Project Manager** - Oversight and coordination perspective
3. **Business Stakeholder** - Business value and ROI focus
4. **Development Team Lead** - Technical implementation viewpoint
5. **Quality Assurance Specialist** - Quality and validation emphasis

---

## Common Goals Analysis

### 🎯 Goal Category 1: Efficiency & Productivity

#### Shared Objectives
- **Reduce Time-to-Documentation:** All personas want faster requirements capture
- **Minimize Manual Effort:** Automated generation and formatting preferred
- **Streamline Workflows:** Eliminate redundant steps and processes
- **Quick Information Access:** Rapid retrieval of requirements and documentation

#### Feature Alignment Opportunities
- **Auto-Generation Capabilities:** AI-powered document creation
- **Template Standardization:** Consistent, reusable document formats
- **Batch Processing:** Multiple document generation in single workflow
- **Smart Search & Filtering:** Quick access to specific requirements

### 🎯 Goal Category 2: Quality & Accuracy

#### Shared Objectives
- **Comprehensive Coverage:** Complete requirements documentation
- **Consistency Standards:** Uniform format and structure across documents
- **Error Reduction:** Minimize human errors in documentation
- **Validation Mechanisms:** Built-in quality checks and reviews

#### Feature Alignment Opportunities
- **Quality Validation Rules:** Automated completeness checking
- **Consistency Enforcement:** Template-based standardization
- **Review Workflows:** Collaborative review and approval processes
- **Version Control:** Track changes and maintain document integrity

### 🎯 Goal Category 3: Collaboration & Communication

#### Shared Objectives
- **Stakeholder Engagement:** Effective communication with all parties
- **Transparency:** Clear visibility into requirements and progress
- **Feedback Integration:** Incorporate stakeholder input efficiently
- **Knowledge Sharing:** Distribute insights across team members

#### Feature Alignment Opportunities
- **Collaborative Editing:** Multi-user document collaboration
- **Stakeholder Dashboards:** Visual progress and status reporting
- **Comment & Review Systems:** Structured feedback mechanisms
- **Export & Sharing Options:** Multiple format support for distribution

### 🎯 Goal Category 4: Process Optimization

#### Shared Objectives
- **Methodology Compliance:** Adherence to industry standards (PMBOK, BABOK)
- **Scalability:** Handle projects of varying complexity and size
- **Adaptability:** Customize processes for different project types
- **Continuous Improvement:** Learn and optimize from experience

#### Feature Alignment Opportunities
- **Methodology Templates:** Pre-built frameworks for different standards
- **Scalable Architecture:** Support for small to enterprise-level projects
- **Customization Options:** Flexible configuration for varied needs
- **Analytics & Insights:** Usage patterns and improvement recommendations

---

## Requirements Gathering Agent Feature Prioritization

### High Priority Features (Addresses 3+ Persona Goals)

1. **AI-Powered Document Generation**
   - **Personas Served:** All 5 personas
   - **Common Goals:** Efficiency, Quality, Process Optimization
   - **Impact:** High - Core value proposition

2. **Template Management System**
   - **Personas Served:** Requirements Analyst, Project Manager, QA Specialist
   - **Common Goals:** Quality, Consistency, Process Optimization
   - **Impact:** High - Foundation for standardization

3. **Collaborative Review Workflows**
   - **Personas Served:** All 5 personas
   - **Common Goals:** Collaboration, Quality, Communication
   - **Impact:** High - Critical for stakeholder engagement

4. **Real-time Progress Dashboards**
   - **Personas Served:** Project Manager, Business Stakeholder, Team Lead
   - **Common Goals:** Transparency, Communication, Efficiency
   - **Impact:** Medium-High - Visibility and control

### Medium Priority Features (Addresses 2-3 Persona Goals)

5. **Requirements Traceability Matrix**
   - **Personas Served:** Requirements Analyst, QA Specialist, Team Lead
   - **Common Goals:** Quality, Process Optimization
   - **Impact:** Medium - Technical compliance

6. **Stakeholder Communication Tools**
   - **Personas Served:** Project Manager, Business Stakeholder
   - **Common Goals:** Collaboration, Communication
   - **Impact:** Medium - Stakeholder satisfaction

7. **Export & Integration Capabilities**
   - **Personas Served:** All personas (varying degrees)
   - **Common Goals:** Efficiency, Collaboration
   - **Impact:** Medium - Workflow integration

### Lower Priority Features (Addresses 1-2 Persona Goals)

8. **Advanced Analytics & Reporting**
   - **Personas Served:** Project Manager, Business Stakeholder
   - **Common Goals:** Process Optimization, Communication
   - **Impact:** Low-Medium - Strategic insights

---

## User Satisfaction Improvement Strategies

### Strategy 1: Core Workflow Optimization
**Target:** Reduce requirements gathering time by 50%
- Implement AI-powered document generation
- Provide pre-built industry templates
- Enable batch processing capabilities
- Create intelligent requirement suggestions

### Strategy 2: Quality Enhancement
**Target:** Achieve 95% first-pass acceptance rate
- Build-in quality validation rules
- Implement consistency checking
- Provide real-time collaboration features
- Enable structured review processes

### Strategy 3: Stakeholder Engagement
**Target:** Increase stakeholder participation by 75%
- Develop user-friendly interfaces for different personas
- Create role-specific dashboards and views
- Implement notification and alerting systems
- Provide multiple communication channels

### Strategy 4: Process Standardization
**Target:** 100% methodology compliance
- Pre-built PMBOK and BABOK templates
- Automated compliance checking
- Industry best practice integration
- Customizable process workflows

---

## Alignment Matrix

| Feature | Efficiency | Quality | Collaboration | Process Opt. | Satisfaction Impact |
|---------|------------|---------|---------------|--------------|-------------------|
| AI Document Generation | ✅ High | ✅ High | ⚫ Medium | ✅ High | 🟢 Very High |
| Template Management | ✅ High | ✅ High | ⚫ Medium | ✅ High | 🟢 High |
| Collaborative Reviews | ⚫ Medium | ✅ High | ✅ High | ⚫ Medium | 🟢 High |
| Progress Dashboards | ✅ High | ⚫ Low | ✅ High | ⚫ Medium | 🟡 Medium-High |
| Traceability Matrix | ⚫ Medium | ✅ High | ⚫ Low | ✅ High | 🟡 Medium |
| Export Integration | ✅ High | ⚫ Low | ✅ Medium | ⚫ Low | 🟡 Medium |

**Legend:** ✅ Strong Alignment | ⚫ Moderate Alignment | 🟢 High Impact | 🟡 Medium Impact

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-2)
- Core AI document generation engine
- Basic template management system
- User authentication and role management
- Essential quality validation rules

### Phase 2: Collaboration (Months 3-4)
- Multi-user collaboration features
- Review and approval workflows
- Real-time progress tracking
- Stakeholder communication tools

### Phase 3: Optimization (Months 5-6)
- Advanced analytics and reporting
- Process optimization features
- Integration capabilities
- Performance enhancements

### Phase 4: Enhancement (Months 7+)
- Advanced AI features
- Industry-specific customizations
- Enterprise-grade scalability
- Continuous improvement mechanisms

---

## Success Metrics

### User Satisfaction KPIs
- **Task Completion Time:** Target 50% reduction
- **Error Rate:** Target <5% documentation errors
- **User Adoption:** Target 90% active user engagement
- **Stakeholder Satisfaction:** Target >4.5/5 rating
- **Feature Utilization:** Target 80% of core features actively used

### Business Impact Metrics
- **Requirements Quality:** 95% first-pass acceptance
- **Project Timeline:** 30% faster requirements phase completion
- **Cost Savings:** 40% reduction in requirements-related rework
- **Compliance:** 100% methodology adherence
- **ROI:** Positive return within 6 months of implementation

---

## Conclusion

By focusing on the identified common goals across user personas, the Requirements Gathering Agent can deliver significant value improvements:

1. **Unified Value Proposition:** Core features serve multiple persona needs simultaneously
2. **Prioritized Development:** Feature prioritization based on cross-persona impact
3. **Measurable Satisfaction:** Clear metrics tied to user goals and business outcomes
4. **Scalable Foundation:** Architecture supports diverse user needs and growth

The analysis reveals that efficiency, quality, collaboration, and process optimization are the primary drivers for user satisfaction. Features addressing multiple goals simultaneously should receive highest priority for development and enhancement.

---

## Next Steps

1. **Validate Findings:** Conduct user interviews to confirm identified common goals
2. **Feature Specification:** Develop detailed specifications for high-priority features
3. **Prototype Development:** Create MVPs for core functionality validation
4. **User Testing:** Conduct usability testing with representative personas
5. **Iterative Improvement:** Continuously refine based on user feedback and satisfaction metrics

---

*This analysis serves as the foundation for aligning Requirements Gathering Agent development with user needs and maximizing satisfaction across all persona segments.*`;
  }
}
