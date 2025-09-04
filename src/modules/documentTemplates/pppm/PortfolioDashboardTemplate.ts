import type { ProjectContext } from '../../ai/types';

export const PortfolioDashboardTemplate = {
  title: 'Portfolio Dashboard',
  getSections: (context?: ProjectContext) => {
    const safeContext: Partial<ProjectContext> = context || {};
    const portfolioName = safeContext.programName || safeContext.projectName || 'Portfolio';
    const reportDate = new Date().toISOString().split('T')[0];
    return [
      {
        title: 'Portfolio Dashboard Instructions',
        content: `MISSION: As Portfolio Manager and Executive, create a comprehensive dashboard that aggregates and visualizes performance, health, risks, and benefits across multiple projects/programs within the portfolio.\n\nREQUIRED SYNTHESIS SOURCES:\n1. Project Status Reports → Extract current status, progress, and key metrics from all portfolio projects\n2. Risk Registers → Consolidate and prioritize risks across all projects\n3. Business Cases → Track benefits realization and ROI across the portfolio\n4. Resource Management Plans → Analyze resource utilization and capacity\n5. Stakeholder Registers → Identify cross-cutting stakeholder concerns and engagement\n\nDASHBOARD APPROACH:\n- Executive Perspective: Present information for C-level and senior leadership decision making\n- Visual Data: Structure content to support charts, graphs, and visual representations\n- Actionable Insights: Highlight decisions needed and recommended actions\n- Performance Focus: Emphasize metrics that matter for portfolio success\n- Strategic Alignment: Connect portfolio performance to organizational objectives`
      },
      {
        title: `Portfolio Dashboard - ${portfolioName}`,
        content: `Dashboard Date: ${reportDate}\nPortfolio Manager: [PORTFOLIO MANAGER NAME]\nExecutive Sponsor: [EXECUTIVE SPONSOR NAME]\nReporting Period: [REPORTING PERIOD]`
      },
      {
        title: 'Portfolio Overview',
        content: `Portfolio Composition: [AI_SYNTHESIS: Summarize the overall portfolio composition, including number of projects, programs, and key initiative areas]\nStrategic Alignment: [AI_SYNTHESIS: Describe how the portfolio aligns with organizational strategy and key business objectives]\nPortfolio Health Status: [AI_SYNTHESIS: Provide an overall health assessment of the portfolio using standard health indicators (Green, Yellow, Red)]\nKey Performance Summary: [AI_SYNTHESIS: Summarize key performance indicators and overall portfolio performance against targets]`
      },
      {
        title: 'Executive Summary',
        content: `Performance Highlights: [AI_SYNTHESIS: Extract and synthesize top performance achievements and successes across the portfolio]\nCritical Issues: [AI_SYNTHESIS: Identify and prioritize the most critical issues requiring executive attention]\nStrategic Decisions Required: [AI_SYNTHESIS: Identify key strategic decisions that need executive input or approval]\nRecommended Actions: [AI_SYNTHESIS: Provide specific, actionable recommendations for executive leadership based on current portfolio performance]`
      },
      {
        title: 'Portfolio Performance Metrics',
        content: `Financial Performance: Budget Status: [AI_SYNTHESIS: Analyze budget utilization across all projects] Cost Performance Index (CPI): [AI_SYNTHESIS: Calculate and analyze cost performance] Return on Investment (ROI): [AI_SYNTHESIS: Track ROI realization across portfolio]\nSchedule Performance: Schedule Performance Index (SPI): [AI_SYNTHESIS: Analyze schedule performance across projects] On-Time Delivery Rate: [AI_SYNTHESIS: Calculate percentage of deliverables delivered on time] Critical Path Analysis: [AI_SYNTHESIS: Identify portfolio-level schedule risks and dependencies]\nQuality Metrics: Defect Rates: [AI_SYNTHESIS: Analyze quality metrics across deliverables] Customer Satisfaction: [AI_SYNTHESIS: Summarize stakeholder satisfaction metrics] Compliance Status: [AI_SYNTHESIS: Track compliance with standards and regulations]`
      },
      {
        title: 'Resource Utilization',
        content: `Resource Capacity Overview: [AI_SYNTHESIS: Analyze current resource utilization rates across the portfolio]\nResource Allocation by Project: [AI_SYNTHESIS: Break down resource allocation across portfolio projects and programs]\nCapacity Planning: [AI_SYNTHESIS: Identify resource constraints and capacity planning needs]\nSkill Gap Analysis: [AI_SYNTHESIS: Identify critical skill gaps that impact portfolio delivery]\nResource Optimization Opportunities: [AI_SYNTHESIS: Recommend resource reallocation or optimization strategies]`
      },
      {
        title: 'Benefits Tracking',
        content: `Expected vs. Actual Benefits: [AI_SYNTHESIS: Compare planned benefits with actual benefits realized to date]\nBenefits Realization Timeline: [AI_SYNTHESIS: Track benefits realization against planned timelines]\nFinancial Benefits: [AI_SYNTHESIS: Quantify financial benefits including cost savings, revenue increases, and ROI]\nStrategic Benefits: [AI_SYNTHESIS: Track non-financial strategic benefits such as capability improvements and market positioning]\nBenefits at Risk: [AI_SYNTHESIS: Identify benefits that are at risk due to project issues or delays]`
      },
      {
        title: 'Top Risks & Issues',
        content: `Critical Portfolio Risks: [AI_SYNTHESIS: Identify and prioritize the top risks that could impact overall portfolio success]\nCross-Project Dependencies: [AI_SYNTHESIS: Analyze risks arising from dependencies between portfolio projects]\nEscalated Issues: [AI_SYNTHESIS: Summarize critical issues that have been escalated from project level to portfolio level]\nRisk Mitigation Status: [AI_SYNTHESIS: Track progress on key risk mitigation activities]\nEmerging Risks: [AI_SYNTHESIS: Identify new or emerging risks that require attention]`
      },
      {
        title: 'Upcoming Decisions',
        content: `Strategic Decisions: [AI_SYNTHESIS: Identify key strategic decisions required in the next reporting period]\nResource Decisions: [AI_SYNTHESIS: Highlight resource allocation decisions that need to be made]\nInvestment Decisions: [AI_SYNTHESIS: Identify investment or funding decisions affecting the portfolio]\nScope and Priority Decisions: [AI_SYNTHESIS: Flag any scope changes or prioritization decisions needed]\nDecision Deadlines: [AI_SYNTHESIS: Provide timeline for critical decisions to maintain portfolio momentum]`
      },
      {
        title: 'Recommendations',
        content: `Performance Optimization: [AI_SYNTHESIS: Recommend specific actions to improve portfolio performance]\nRisk Mitigation: [AI_SYNTHESIS: Provide recommendations for addressing critical risks and issues]\nResource Management: [AI_SYNTHESIS: Suggest resource allocation adjustments or capacity building initiatives]\nStrategic Alignment: [AI_SYNTHESIS: Recommend actions to improve strategic alignment and benefit realization]\nNext Period Focus: [AI_SYNTHESIS: Identify key focus areas and priorities for the next reporting period]`
      },
      {
        title: 'Dashboard Appendices',
        content: `Data Sources: This dashboard synthesizes data from project status reports, risk registers, resource plans, and stakeholder feedback across all portfolio components.\nMetrics Definitions: [AI_SYNTHESIS: Provide definitions for key metrics and KPIs used in this dashboard]\nReporting Methodology: Portfolio performance is assessed using standard PMO frameworks and organizational KPIs.\nNext Update: [Schedule based on reporting cycle]\n*This Dashboard was generated through comprehensive analysis of portfolio data and is designed to support executive decision-making and portfolio governance.*`
      }
    ];
  }
};