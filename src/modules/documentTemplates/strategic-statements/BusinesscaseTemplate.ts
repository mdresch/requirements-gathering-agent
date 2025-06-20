import type { ProjectContext } from '../../ai/types';

/**
 * @description A template for generating a formal Business Case document.
 * It provides a structured format for the AI to analyze and present the
 * financial and strategic rationale for a project.
 */
export class BusinesscaseTemplate {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for Business Case
   */
  generateContent(): string {
    const currentDate = new Date().toISOString();
    
    return `# Business Case: ${this.context.projectName}

**Generated by:** ADPA (Automated Documentation Project Assistant)
**Category:** financial-and-strategic
**Generated:** ${currentDate}
**Version:** 1.0

---

## 1. Executive Summary

*[Instruction: Write a concise, powerful summary for a senior executive. State the problem, the proposed project, its key benefits, high-level costs, projected ROI, and a clear recommendation. This should be the entire business case in one paragraph.]*

---

## 2. Problem Definition & Business Need

*[Instruction: Elaborate on the problem or opportunity the project addresses. Quantify the pain points if possible (e.g., "losing X hours per week," "facing Y% market share loss"). Explain why solving this problem is critical for the business right now.]*

---

## 3. Proposed Solution

*[Instruction: Describe the proposed project in business terms. Explain what it does, who it's for, and how it directly solves the problem defined above. Avoid overly technical jargon.]*

---

## 4. Strategic Alignment

*[Instruction: Explain how this project directly supports the organization's core strategic goals (e.g., "improves operational efficiency," "increases market share," "enhances customer satisfaction"). Reference the company's core values if applicable.]*

---

## 5. Financial Analysis

*[Instruction: Analyze the financial implications of the project. If specific numbers are available in the context, use them. If not, describe the categories of costs and benefits qualitatively.]*

*   **Estimated Costs:**
    *   **One-Time Costs:** (e.g., Development, hardware, initial setup)
    *   **Recurring Costs:** (e.g., Maintenance, subscriptions, support)
*   **Projected Benefits:**
    *   **Quantitative:** (e.g., Increased revenue, cost savings, productivity gains)
    *   **Qualitative:** (e.g., Improved morale, enhanced brand reputation, competitive advantage)
*   **Return on Investment (ROI) Projection:** *[Instruction: If possible, calculate or estimate the ROI or payback period. State the key assumptions made.]*

---

## 6. Risk Assessment

*[Instruction: Identify 3-5 potential risks for this project (e.g., technical, market, resource, budget risks). For each risk, assess its potential impact and propose a clear mitigation strategy.]*

| Risk Description | Impact (Low/Med/High) | Mitigation Strategy |
| :--- | :--- | :--- |
| **[Risk 1]** | *[Impact]* | *[Mitigation Strategy]* |
| **[Risk 2]** | *[Impact]* | *[Mitigation Strategy]* |
| **[Risk 3]** | *[Impact]* | *[Mitigation Strategy]* |

---

## 7. Implementation Plan & Timeline

*[Instruction: Outline a high-level, phased implementation plan with key milestones and estimated timelines. This demonstrates that the project's execution has been considered.]*

*   **Phase 1: [Phase Name]** - (e.g., Discovery & Planning) - [Timeline, e.g., 2 Weeks]
*   **Phase 2: [Phase Name]** - (e.g., MVP Development) - [Timeline, e.g., 8 Weeks]
*   **Phase 3: [Phase Name]** - (e.g., Launch & Rollout) - [Timeline, e.g., 2 Weeks]

---

## 8. Success Metrics & KPIs

*[Instruction: Define the specific, measurable Key Performance Indicators (KPIs) that will be used to determine the project's success. These should directly relate to the project's goals and benefits.]*
*   *[KPI 1: e.g., Reduce documentation time by 50% within 3 months post-launch]*
*   *[KPI 2: e.g., Achieve a user adoption rate of 75% across target teams]*
*   *[KPI 3: e.g., Positive ROI achieved within 12 months]*

---

## 9. Recommendation

*[Instruction: Conclude with a clear, definitive recommendation. Based on the analysis, should the organization proceed with this investment? Reiterate the primary reason why.]*

**Recommendation: It is highly recommended to proceed with the ${this.context.projectName} project.**
`;
  }
}
