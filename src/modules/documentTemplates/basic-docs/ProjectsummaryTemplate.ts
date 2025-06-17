import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Project Summary document.
 */
export class ProjectsummaryTemplate {  generate(context: ProjectContext): string {
    return `# Project Summary and Goals

## Executive Summary

### Project Overview
**Project Name:** ${context.projectName || '[Project Name]'}  
**Project Type:** ${context.projectType || '[Project Type]'}  
**Status:** Planning Phase  
**Duration:** [Timeline TBD]

### Purpose and Vision
This project aims to ${context.description || 'deliver business value through innovative solutions'}. The initiative represents a strategic investment in organizational capabilities to achieve measurable business outcomes.

### Key Objectives
- **Primary Goal:** Deliver high-quality solution on time and within budget
- **Business Value:** Improve operational efficiency and user satisfaction
- **Strategic Alignment:** Support organizational growth and digital transformation

## Project Goals and Objectives

### Primary Project Goals
1. **Delivery Excellence**
   - Deliver all project scope within agreed timeline
   - Maintain high quality standards throughout development
   - Ensure stakeholder satisfaction and acceptance

2. **Business Value Creation**
   - Generate measurable business benefits
   - Improve operational efficiency
   - Enhance user experience and satisfaction

3. **Strategic Alignment**
   - Support organizational strategic initiatives
   - Build sustainable competitive advantage
   - Enable future growth and scalability

### Specific Measurable Objectives
- **Timeline:** Complete project within [X months]
- **Budget:** Deliver within approved budget of [Budget TBD]
- **Quality:** Achieve 95% user satisfaction rating
- **Performance:** Meet or exceed performance benchmarks
- **Adoption:** Reach 80% user adoption within 6 months

### Success Criteria and KPIs
- All deliverables completed and accepted
- Project delivered on time and within budget
- User acceptance criteria met
- Performance targets achieved
- Stakeholder satisfaction goals met

## Scope Overview

### Project Scope Boundaries
**In Scope:**
- Core functionality development
- User training and documentation
- Quality assurance and testing
- Deployment and go-live support

**Out of Scope:**
- Third-party integrations (Phase 2)
- Legacy system decommissioning
- Advanced reporting features
- Mobile application development

### Key Deliverables
1. **Requirements Documentation**
   - Business requirements specification
   - Technical requirements document
   - User acceptance criteria

2. **Solution Development**
   - Core application/system
   - User interface components
   - Integration components

3. **Quality Assurance**
   - Test plans and test cases
   - Quality assurance reports
   - Performance testing results

4. **Implementation Support**
   - Deployment documentation
   - User training materials
   - Support documentation

### Major Milestones
- **Project Initiation:** [Date TBD]
- **Requirements Completion:** [Date TBD]
- **Development Completion:** [Date TBD]
- **Testing Completion:** [Date TBD]
- **Go-Live:** [Date TBD]
- **Project Closure:** [Date TBD]

## Stakeholder Overview

### Primary Stakeholders
- **Project Sponsor:** [Sponsor Name]
- **Project Manager:** [PM Name]
- **Business Owner:** [Business Owner]
- **Technical Lead:** [Tech Lead]
- **End Users:** [User Groups]

### Stakeholder Interests and Expectations
- **Executive Leadership:** ROI achievement and strategic alignment
- **Business Users:** Improved efficiency and user experience
- **IT Department:** Technical excellence and maintainability
- **Customers:** Enhanced service quality and functionality

### Communication Requirements
- **Executive Updates:** Monthly steering committee meetings
- **Project Updates:** Bi-weekly status reports
- **Team Communication:** Daily standups and weekly team meetings
- **Stakeholder Engagement:** Regular demos and feedback sessions

## Business Value

### Expected Business Benefits
1. **Operational Efficiency**
   - 20% reduction in manual processes
   - Improved workflow automation
   - Reduced processing time

2. **Cost Savings**
   - $[Amount] annual cost reduction
   - Reduced maintenance overhead
   - Lower operational costs

3. **Revenue Enhancement**
   - Improved customer satisfaction
   - Enhanced service delivery
   - New business opportunities

### Return on Investment
- **Investment:** $[Total Investment]
- **Expected ROI:** [ROI %] within 18 months
- **Payback Period:** [X months]

### Strategic Alignment
- Supports digital transformation initiatives
- Enhances competitive positioning
- Enables future business capabilities

## Timeline and Resources

### High-Level Timeline
- **Total Duration:** [X months]
- **Planning Phase:** 1 month
- **Development Phase:** [X months]
- **Testing Phase:** 1 month
- **Deployment Phase:** 2 weeks

### Resource Requirements
- **Project Team Size:** [X people]
- **Budget Allocation:** $[Amount]
- **Technology Resources:** [Technology stack]
- **External Resources:** [Vendors/Consultants]

### Budget Considerations
- **Development Costs:** $[Amount]
- **Infrastructure Costs:** $[Amount]
- **Training Costs:** $[Amount]
- **Contingency:** 10% of total budget

## Risk Summary

### Key Project Risks
1. **Technical Risks**
   - Technology complexity and integration challenges
   - Performance and scalability concerns
   - Security and compliance requirements

2. **Resource Risks**
   - Key personnel availability
   - Skill gaps and training needs
   - Budget constraints and cost overruns

3. **Business Risks**
   - Changing business requirements
   - Stakeholder alignment and support
   - Market and competitive factors

### Mitigation Strategies
- **Technical:** Proof of concepts and technical spikes
- **Resource:** Cross-training and knowledge sharing
- **Business:** Regular stakeholder communication and change management

### Contingency Planning
- **Schedule Buffers:** 15% buffer for critical path
- **Budget Reserves:** 10% management reserve
- **Alternative Solutions:** Backup plans for high-risk components

---

*This project summary document provides a comprehensive overview of project goals, scope, stakeholders, and success criteria.*

**Document Version:** 1.0  
**Generated Date:** [Insert Date]  
**Next Review:** [Insert Review Date]  
**Approval Required:** Project Sponsor and Steering Committee
`;
  }
}
