import type { ProjectContext } from '../../ai/types';

export const LessonsLearnedTemplate = {
  title: 'Lessons Learned',
  getSections: (context?: ProjectContext) => {
    const safeContext: Partial<ProjectContext> = context || {};
    const projectName = safeContext.projectName || 'Project';
    const programName = safeContext.programName || 'Program';
    const currentDate = new Date().toISOString().split('T')[0];
    
    return [
      {
        title: 'Executive Summary Instructions',
        content: `MISSION: As Project/Program Manager and team, document comprehensive lessons learned to improve future project delivery and organizational capabilities.\n\nOBJECTIVE: Capture actionable insights, validated best practices, and systemic improvements that can be applied to future projects and embedded into organizational processes.\n\nFOCUS AREAS:\n1. What worked well and should be repeated\n2. What didn't work and should be avoided or improved\n3. Process improvements and organizational recommendations\n4. Knowledge transfer and capability building\n5. Metrics and performance insights\n\nAPPROACH:\n- Constructive Analysis: Focus on improvement rather than blame\n- Actionable Insights: Ensure all lessons can be practically applied\n- Stakeholder Validation: Include perspectives from all key participants\n- Organizational Learning: Connect insights to broader organizational capabilities\n- Knowledge Preservation: Document for easy retrieval and application`
      },
      {
        title: `Lessons Learned Document - ${projectName}`,
        content: `Project/Program: ${programName} / ${projectName}\nDocument Date: ${currentDate}\nPrepared by: [PROJECT/PROGRAM MANAGER NAME]\nReviewed by: [STAKEHOLDER REVIEW COMMITTEE]\nApproved by: [EXECUTIVE SPONSOR/PMO DIRECTOR]`
      },
      {
        title: '1. Project Information',
        content: `Project Name: [AI_SYNTHESIS: Extract project name and brief description from context]\nProject Manager: [AI_SYNTHESIS: Identify project manager and key team members]\nExecutive Sponsor: [AI_SYNTHESIS: Identify executive sponsor and key stakeholders]\nProject Duration: Start Date: [AI_SYNTHESIS: Extract or estimate project start date] End Date: [AI_SYNTHESIS: Extract or estimate project completion date]\nBudget: Original Budget: [AI_SYNTHESIS: Extract or estimate original budget] Final Budget: [AI_SYNTHESIS: Extract or estimate final budget] Variance: [AI_SYNTHESIS: Calculate budget variance]\nScope: [AI_SYNTHESIS: Summarize final project scope and major deliverables]`
      },
      {
        title: '2. Project Summary',
        content: `Project Overview: [AI_SYNTHESIS: Provide comprehensive project summary including objectives, key deliverables, and outcomes achieved]\nSuccess Metrics Achievement: [AI_SYNTHESIS: Analyze achievement of original success criteria and KPIs]\nMajor Accomplishments: [AI_SYNTHESIS: List key accomplishments and value delivered]\nFinal Deliverables: [AI_SYNTHESIS: Document final deliverables and their acceptance status]\nStakeholder Satisfaction: [AI_SYNTHESIS: Assess stakeholder satisfaction and feedback received]`
      },
      {
        title: '3. What Went Well',
        content: `Successful Practices: [AI_SYNTHESIS: Identify specific practices, processes, or approaches that worked exceptionally well and should be repeated]\nTeam Performance: [AI_SYNTHESIS: Highlight effective team dynamics, collaboration methods, and individual contributions]\nTechnical Solutions: [AI_SYNTHESIS: Document successful technical approaches, tools, or methodologies]\nStakeholder Engagement: [AI_SYNTHESIS: Identify effective stakeholder management and communication practices]\nRisk Management: [AI_SYNTHESIS: Highlight successful risk mitigation strategies and proactive measures]\nProcess Effectiveness: [AI_SYNTHESIS: Document effective project management processes and workflows]`
      },
      {
        title: '4. What Went Wrong',
        content: `Process Issues: [AI_SYNTHESIS: Identify process breakdowns, inefficiencies, or gaps that caused delays or problems]\nCommunication Challenges: [AI_SYNTHESIS: Document communication failures, misunderstandings, or information gaps]\nTechnical Problems: [AI_SYNTHESIS: Identify technical challenges, solution limitations, or integration issues]\nResource Constraints: [AI_SYNTHESIS: Document resource shortages, skill gaps, or capacity issues]\nStakeholder Management Issues: [AI_SYNTHESIS: Identify stakeholder engagement problems or expectation misalignments]\nRisk Realization: [AI_SYNTHESIS: Document risks that materialized and their impact on the project]`
      },
      {
        title: '5. Key Insights & Recommendations',
        content: `Process Improvements: [AI_SYNTHESIS: Recommend specific process improvements based on lessons learned]\nOrganizational Capabilities: [AI_SYNTHESIS: Identify organizational capabilities that need development or strengthening]\nBest Practices: [AI_SYNTHESIS: Codify best practices that should be adopted organization-wide]\nTraining and Development: [AI_SYNTHESIS: Recommend training or development programs based on identified gaps]\nTool and Technology Recommendations: [AI_SYNTHESIS: Recommend tools, technologies, or methodologies for future projects]\nGovernance and Oversight: [AI_SYNTHESIS: Recommend improvements to governance, decision-making, or oversight processes]`
      },
      {
        title: '6. Metrics & Performance',
        content: `Schedule Performance: Planned Duration: [AI_SYNTHESIS: Extract planned project duration] Actual Duration: [AI_SYNTHESIS: Extract actual project duration] Schedule Variance: [AI_SYNTHESIS: Calculate schedule variance and impact]\nBudget Performance: Budget Variance Analysis: [AI_SYNTHESIS: Provide detailed budget variance analysis] Cost Per Deliverable: [AI_SYNTHESIS: Calculate cost efficiency metrics]\nQuality Metrics: Defect Rates: [AI_SYNTHESIS: Document quality metrics and defect rates] Rework Requirements: [AI_SYNTHESIS: Document rework and its impact]\nStakeholder Metrics: Satisfaction Scores: [AI_SYNTHESIS: Document stakeholder satisfaction ratings] Engagement Levels: [AI_SYNTHESIS: Assess stakeholder engagement effectiveness]`
      },
      {
        title: '7. Action Items for Organization',
        content: `Immediate Actions: [AI_SYNTHESIS: List immediate actions the organization should take to address identified issues]\nPolicy and Procedure Updates: [AI_SYNTHESIS: Recommend specific policy or procedure changes based on lessons learned]\nTraining Programs: [AI_SYNTHESIS: Recommend training programs to address skill gaps or process improvements]\nTool and Resource Investments: [AI_SYNTHESIS: Recommend investments in tools, resources, or infrastructure]\nGovernance Improvements: [AI_SYNTHESIS: Recommend improvements to project governance and oversight]\nKnowledge Management: [AI_SYNTHESIS: Recommend knowledge management and sharing improvements]`
      },
      {
        title: '8. Knowledge Artifacts Created',
        content: `Documentation: [AI_SYNTHESIS: List key documentation created during the project that has ongoing value]\nTemplates and Tools: [AI_SYNTHESIS: Document templates, tools, or utilities created that can be reused]\nBest Practice Guides: [AI_SYNTHESIS: List best practice guides or methodologies developed]\nTraining Materials: [AI_SYNTHESIS: Document training materials or knowledge transfer artifacts]\nTechnical Specifications: [AI_SYNTHESIS: List technical specifications or architecture documents with ongoing value]\nProcess Definitions: [AI_SYNTHESIS: Document new or improved processes that can be standardized]`
      },
      {
        title: '9. Contacts for Future Reference',
        content: `Project Team Key Contacts: Project Manager: [AI_SYNTHESIS: Provide project manager contact information] Technical Lead: [AI_SYNTHESIS: Provide technical lead contact information] Business Analyst: [AI_SYNTHESIS: Provide business analyst contact information]\nSubject Matter Experts: [AI_SYNTHESIS: List key subject matter experts and their areas of expertise with contact information]\nVendor and Partner Contacts: [AI_SYNTHESIS: List key vendor and partner contacts for ongoing relationships]\nStakeholder Contacts: [AI_SYNTHESIS: List key stakeholder contacts for future collaboration]\nKnowledge Repository Locations: [AI_SYNTHESIS: Provide locations of project documentation, code repositories, and knowledge assets]`
      },
      {
        title: 'Approval and Sign-off',
        content: `This Lessons Learned document has been reviewed and approved by the following stakeholders:\n\nProject Manager: _____________________________ Date: __________ Signature: _____________________________\nExecutive Sponsor: _____________________________ Date: __________ Signature: _____________________________\nPMO Director: _____________________________ Date: __________ Signature: _____________________________\nKey Stakeholder Representative: _____________________________ Date: __________ Signature: _____________________________\n\nDocument Version: 1.0\nLast Updated: ${currentDate}\nNext Review: [Schedule based on organizational requirements]\n\n*This document captures institutional knowledge and lessons learned to improve future project delivery and organizational capabilities.*`
      }
    ];
  }
};