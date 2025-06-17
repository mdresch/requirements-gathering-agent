import type { ProjectContext } from '../../ai/types.js';

/**
 * Template for Strategic Business Case document.
 */
export class StrategicbusinesscaseTemplate {
  generate(context: ProjectContext): string {
    return `# Strategic Business Case

## Executive Summary
*This section provides a high-level overview of the strategic business case for ${context.projectName || 'the project'}.*

### Strategic Overview and Business Rationale
- Strategic initiative overview
- Business rationale and strategic fit
- Key strategic drivers

### Key Value Proposition
- Primary value proposition
- Competitive advantage
- Market positioning benefits

### Expected Strategic Outcomes
- Long-term strategic benefits
- Market impact expectations
- Organizational transformation goals

## Strategic Alignment

### Organizational Strategy Alignment
- How this initiative aligns with organizational strategy
- Strategic objectives supported
- Mission and vision alignment

### Strategic Objectives and Goals
- Primary strategic objectives
- Key performance indicators
- Success metrics and measurements

### Competitive Advantage and Market Positioning
- Competitive differentiation
- Market positioning improvements
- Strategic advantages gained

## Strategic Investment Analysis

### Investment Requirements and Resource Allocation
- Capital investment requirements
- Resource allocation strategy
- Strategic resource considerations

### Strategic ROI and Value Creation
- Expected return on investment
- Value creation mechanisms
- Strategic benefit quantification

### Long-term Financial Projections
- Multi-year financial impact
- Revenue growth projections
- Cost optimization benefits

## Strategic Risk Assessment

### Strategic Risks and Mitigation Strategies
- Key strategic risks identified
- Risk mitigation approaches
- Strategic contingency planning

### Market Risks and Competitive Threats
- Market volatility considerations
- Competitive response risks
- External threat assessment

### Organizational and Operational Risks
- Organizational change risks
- Operational implementation risks
- Capability and skill gaps

## Strategic Implementation

### Strategic Roadmap and Milestones
- High-level implementation roadmap
- Key strategic milestones
- Phase-gate approach

### Resource Requirements and Capabilities
- Strategic capability requirements
- Resource allocation plan
- Skill development needs

### Change Management Considerations
- Organizational change strategy
- Stakeholder engagement approach
- Communication and training plans

## Strategic Benefits

### Quantifiable Strategic Benefits
- Measurable financial benefits
- Operational efficiency gains
- Market share improvements

### Intangible Value Creation
- Brand value enhancement
- Customer satisfaction improvements
- Strategic capability development

### Long-term Strategic Value
- Sustainable competitive advantages
- Future option value
- Strategic platform benefits

## Recommendations

### Strategic Recommendations
- Primary strategic recommendation
- Alternative strategic options
- Risk-adjusted recommendations

### Next Steps and Action Items
- Immediate next steps
- Key decision points
- Implementation priorities

### Success Criteria and Measurements
- Success criteria definition
- Key performance indicators
- Monitoring and evaluation framework

---

*This strategic business case document was generated based on project context analysis and strategic framework assessment.*

**Document Version:** 1.0  
**Generated Date:** [Insert Date]  
**Review Cycle:** Quarterly  
**Approval Required:** Executive Leadership Team
`;
  }
}
