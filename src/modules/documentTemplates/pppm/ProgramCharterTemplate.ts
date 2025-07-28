import type { ProjectContext } from '../../ai/types';

export const ProgramCharterTemplate = {
  title: 'Program/Project Charter',
  getSections: (context?: ProjectContext) => {
    const safeContext: Partial<ProjectContext> = context || {};
    const programName = safeContext.programName || 'Program';
    const projectName = safeContext.projectName || 'Project';
    const charterDate = new Date().toISOString().split('T')[0];
    return [
      {
        title: 'Executive Synthesis Instructions',
        content: `MISSION: As PMO Director and Executive Sponsor, synthesize ALL foundational documents into an authoritative Program/Project Charter that formally establishes legitimacy and grants full organizational authority to the Program/Project Manager.\n\nREQUIRED SYNTHESIS SOURCES:\n1. Business Case → Extract strategic justification, ROI, and business objectives\n2. Stakeholder Register → Identify key decision makers, sponsors, and authority structure\n3. Scope Statement → Define high-level deliverables, boundaries, and success criteria\n4. Risk Register → Summarize critical risks requiring executive attention and mitigation approval\n\nSYNTHESIS APPROACH:\n- Strategic Authority: Write from the perspective of someone committing organizational resources\n- Executive Summary: Distill complex analysis into executive-digestible insights\n- Decision Documentation: Record all key decisions and assumptions for future reference\n- Resource Authorization: Explicitly grant authority for budget, personnel, and organizational assets\n- Governance Framework: Establish reporting relationships and decision-making protocols`
      },
      {
        title: `Program/Project Charter - ${programName} / ${projectName}`,
        content: `Charter Date: ${charterDate}\nProgram/Project Manager: [TO BE ASSIGNED]\nExecutive Sponsor: [EXECUTIVE SPONSOR NAME]\nPMO Director: [PMO DIRECTOR NAME]`
      },
      {
        title: 'Executive Summary',
        content: `Strategic Context: [AI_SYNTHESIS: Extract and synthesize the strategic business rationale from the Business Case, explaining why this program/project is critical to organizational success and how it aligns with corporate strategy]\nBusiness Justification: [AI_SYNTHESIS: Synthesize the financial and strategic justification from the Business Case, including ROI projections, cost-benefit analysis, and strategic value proposition]\nAuthority and Approval: This Charter formally authorizes the initiation of ${programName} / ${projectName} and grants the designated Manager full authority to commit organizational resources within the approved parameters outlined in this document.`
      },
      {
        title: 'Objectives and Success Criteria',
        content: `Primary Objectives: [AI_SYNTHESIS: Extract and prioritize the top 3-5 strategic objectives from the Business Case and Scope Statement, ensuring they are measurable and aligned with organizational goals]\nSuccess Criteria: [AI_SYNTHESIS: Synthesize specific, measurable success criteria from the Scope Statement and Business Case, including both quantitative metrics and qualitative outcomes]\nKey Performance Indicators (KPIs): [AI_SYNTHESIS: Define measurable KPIs that will be used to track program/project success and ROI achievement throughout the lifecycle]`
      },
      {
        title: 'Scope and Deliverables',
        content: `High-Level Scope: [AI_SYNTHESIS: Synthesize the high-level scope from the Scope Statement, focusing on strategic deliverables and outcomes]\nMajor Deliverables: [AI_SYNTHESIS: Extract and list the major deliverables from the Scope Statement that represent significant value delivery milestones]\nScope Boundaries: In Scope: [AI_SYNTHESIS: Summarize key items included in scope] Out of Scope: [AI_SYNTHESIS: Summarize key items excluded from scope]`
      },
      {
        title: 'Stakeholder Authority and Governance',
        content: `Executive Stakeholders: [AI_SYNTHESIS: Extract and synthesize high-power, high-interest stakeholders from the Stakeholder Register]\nGovernance Structure: [AI_SYNTHESIS: Define governance structure, reporting relationships, decision-making protocols, and escalation procedures]\nCommunication and Engagement Strategy: [AI_SYNTHESIS: Synthesize key communication requirements and engagement strategies for executive stakeholders]`
      },
      {
        title: 'Resource Authorization and Budget',
        content: `Budget Authorization: Total Budget: [AI_SYNTHESIS: Extract budget information or indicate where detailed planning will occur] Budget Authority: Manager is authorized to commit resources up to the approved budget with appropriate approval workflows for expenditures exceeding [THRESHOLD].\nResource Allocation: [AI_SYNTHESIS: Identify types and levels of resources authorized]\nOrganizational Support: This charter authorizes the Manager to request and receive appropriate organizational support, including access to subject matter experts, data, and cross-functional collaboration.`
      },
      {
        title: 'Risk Management and Mitigation Authority',
        content: `Critical Risk Summary: [AI_SYNTHESIS: Extract and synthesize top risks from the Risk Register]\nRisk Management Authority: Manager is authorized to implement approved risk mitigation strategies and escalate risks exceeding defined thresholds.\nContingency Authorization: [AI_SYNTHESIS: Identify contingency resources or authority]`
      },
      {
        title: 'Timeline and Milestones',
        content: `High-Level Timeline: [AI_SYNTHESIS: Provide realistic high-level timeline estimates for major phases]\nKey Milestones: [AI_SYNTHESIS: Define strategic milestones requiring executive review]\nCritical Dependencies: [AI_SYNTHESIS: Identify critical external dependencies or constraints]`
      },
      {
        title: 'Assumptions and Constraints',
        content: `Key Assumptions: [AI_SYNTHESIS: Synthesize critical assumptions from foundational documents]\nOrganizational Constraints: [AI_SYNTHESIS: Identify organizational, technical, or resource constraints]\nExternal Dependencies: [AI_SYNTHESIS: Identify external dependencies or factors beyond control]`
      },
      {
        title: 'Manager Authority and Responsibilities',
        content: `Authority Granted: The designated Manager is hereby granted authority to: Commit resources within the approved budget; Make day-to-day decisions within defined scope; Engage cross-functional teams and experts; Implement approved risk mitigation strategies; Represent the program/project in organizational forums\nKey Responsibilities: Deliver objectives within scope, schedule, and budget; Maintain regular communication with Executive Sponsor and stakeholders; Manage risks and escalate issues; Ensure deliverables meet quality standards; Provide regular status reporting\nEscalation Protocols: [AI_SYNTHESIS: Define escalation paths for decisions or issues]`
      },
      {
        title: 'Approval and Authorization',
        content: `Executive Approval: By signing below, the Executive Sponsor formally authorizes the initiation of ${programName} / ${projectName} and commits the organization to provide necessary resources and support.\nExecutive Sponsor: _____________________________ Date: __________  Signature: _____________________________\nPMO Director: _____________________________ Date: __________  Signature: _____________________________\nManager Acceptance: By signing below, the designated Manager accepts responsibility for delivering the objectives within the parameters defined in this charter.\nManager: _____________________________ Date: __________  Signature: _____________________________`
      },
      {
        title: 'Charter Change Control',
        content: `Any changes to this Charter must be approved by the Executive Sponsor and documented through the formal change control process. Significant changes may require additional executive approval.\nCharter Version: 1.0  Last Updated: ${new Date().toISOString()}  Next Review: [Schedule based on phase]\n*This Charter was generated through comprehensive synthesis of foundational documents. It represents the formal authorization and organizational commitment for program/project execution.*`
      }
    ];
  }
};
