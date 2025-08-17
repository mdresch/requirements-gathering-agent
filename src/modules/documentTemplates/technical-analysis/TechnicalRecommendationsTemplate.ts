/**
 * Technical Recommendations Template
 * 
 * This template provides the structure for generating comprehensive technical recommendations
 * that align with PMBOK standards and support informed technology stack decisions.
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @since 3.2.0
 */

export const TechnicalRecommendationsTemplate = {
  title: "Technical Recommendations",
  description: "Comprehensive technical recommendations aligned with PMBOK standards for informed technology stack decisions",
  category: "technical-analysis",
  pmbokAlignment: [
    "PMBOK 4.0 - Integration Management",
    "PMBOK 6.0 - Schedule Management", 
    "PMBOK 7.0 - Cost Management",
    "PMBOK 8.0 - Quality Management",
    "PMBOK 9.0 - Resource Management",
    "PMBOK 11.0 - Risk Management",
    "PMBOK 13.0 - Stakeholder Management"
  ],
  sections: [
    {
      id: "executive-summary",
      title: "Executive Summary",
      description: "High-level overview of key technical recommendations and strategic alignment",
      required: true,
      pmbokReference: "PMBOK 4.0 - Integration Management"
    },
    {
      id: "technology-architecture",
      title: "Technology Architecture Recommendations",
      description: "Detailed technology stack and architecture recommendations",
      required: true,
      pmbokReference: "PMBOK 8.0 - Quality Management"
    },
    {
      id: "risk-management",
      title: "Risk Management",
      description: "Technical risk identification, assessment, and mitigation strategies",
      required: true,
      pmbokReference: "PMBOK 11.0 - Risk Management"
    },
    {
      id: "quality-management",
      title: "Quality Management",
      description: "Quality standards, testing strategies, and performance requirements",
      required: true,
      pmbokReference: "PMBOK 8.0 - Quality Management"
    },
    {
      id: "resource-management",
      title: "Resource Management",
      description: "Technical skill requirements, team composition, and infrastructure needs",
      required: true,
      pmbokReference: "PMBOK 9.0 - Resource Management"
    },
    {
      id: "cost-management",
      title: "Cost Management",
      description: "Technology cost analysis, budgeting, and cost-benefit considerations",
      required: true,
      pmbokReference: "PMBOK 7.0 - Cost Management"
    },
    {
      id: "schedule-management",
      title: "Schedule Management",
      description: "Technology implementation timeline and critical path considerations",
      required: true,
      pmbokReference: "PMBOK 6.0 - Schedule Management"
    },
    {
      id: "stakeholder-management",
      title: "Stakeholder Management",
      description: "Technical stakeholder considerations and communication strategies",
      required: true,
      pmbokReference: "PMBOK 13.0 - Stakeholder Management"
    },
    {
      id: "integration-management",
      title: "Integration Management",
      description: "Technology integration strategies and system interoperability",
      required: true,
      pmbokReference: "PMBOK 4.0 - Integration Management"
    },
    {
      id: "implementation-roadmap",
      title: "Implementation Roadmap",
      description: "Phased implementation approach and success metrics",
      required: true,
      pmbokReference: "PMBOK 6.0 - Schedule Management"
    }
  ],
  deliverables: [
    "Technical architecture recommendations",
    "Technology selection criteria",
    "Risk assessment and mitigation plan",
    "Quality assurance strategy",
    "Resource and skill requirements",
    "Cost-benefit analysis",
    "Implementation timeline",
    "Stakeholder communication plan",
    "Integration strategy",
    "Success metrics and KPIs"
  ],
  dependencies: [
    "project-charter",
    "stakeholder-register",
    "requirements-documentation",
    "risk-register"
  ],
  outputs: [
    "technical-recommendations.md"
  ]
};

export default TechnicalRecommendationsTemplate;