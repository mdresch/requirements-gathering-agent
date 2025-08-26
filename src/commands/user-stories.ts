/**
 * User Stories CLI Commands
 * 
 * Implements CLI commands for the user stories and requirements from the problem statement.
 * Provides functionality for strategic planning, requirements generation, technology analysis,
 * and risk management as specified in the user stories.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2025
 * 
 * @filepath src/commands/user-stories.ts
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { 
  generateStrategicSections, 
  generateRequirements, 
  generateTechnologyStackAnalysis,
  generateRiskManagementPlan,
  type ProjectContext,
  type StrategicSections,
  type UserRequirement,
  type TechnologyStackAnalysis,
  type RiskManagementPlan
} from '../index.js';
import { ValidationError } from '../types.js';

export interface UserStoryOptions {
  businessProblem?: string;
  technologyStack?: string[];
  contextBundle?: string;
  output?: string;
  format?: 'json' | 'markdown';
  quiet?: boolean;
}

/**
 * Handle strategic planning document generation (User Story 2)
 */
export async function handleStrategicPlanningCommand(options: UserStoryOptions): Promise<void> {
  try {
    validateUserStoryOptions(options);
    
    const input = {
      businessProblem: options.businessProblem!,
      technologyStack: options.technologyStack || [],
      contextBundle: options.contextBundle || ''
    };

    if (!options.quiet) {
      console.log('🎯 Generating strategic planning documents...');
      console.log(`📋 Business Problem: ${input.businessProblem}`);
      console.log(`🔧 Technology Stack: ${input.technologyStack.join(', ')}`);
    }

    const strategicSections = await generateStrategicSections(input);
    
    const outputDir = options.output || './output';
    await mkdir(outputDir, { recursive: true });

    if (options.format === 'json') {
      // JSON output for integration
      const jsonOutput = JSON.stringify(strategicSections, null, 2);
      const filePath = join(outputDir, 'strategic-planning.json');
      await writeFile(filePath, jsonOutput);
      
      if (!options.quiet) {
        console.log(`✅ Strategic planning JSON saved to: ${filePath}`);
        console.log('📊 Strategic Sections Generated:');
        console.log(`   Vision: ${strategicSections.vision.substring(0, 100)}...`);
        console.log(`   Mission: ${strategicSections.mission.substring(0, 100)}...`);
        console.log(`   Core Values: ${strategicSections.coreValues.substring(0, 100)}...`);
        console.log(`   Purpose: ${strategicSections.purpose.substring(0, 100)}...`);
      }
    } else {
      // Markdown output for documentation
      const markdownContent = generateStrategicPlanningMarkdown(strategicSections);
      const filePath = join(outputDir, 'strategic-planning.md');
      await writeFile(filePath, markdownContent);
      
      if (!options.quiet) {
        console.log(`✅ Strategic planning document saved to: ${filePath}`);
      }
    }

  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Handle comprehensive requirements generation (User Story 3)
 */
export async function handleRequirementsGenerationCommand(options: UserStoryOptions): Promise<void> {
  try {
    validateUserStoryOptions(options);
    
    const input = {
      businessProblem: options.businessProblem!,
      technologyStack: options.technologyStack || [],
      contextBundle: options.contextBundle || ''
    };

    if (!options.quiet) {
      console.log('📋 Generating comprehensive requirements...');
      console.log(`📋 Business Problem: ${input.businessProblem}`);
      console.log(`🔧 Technology Stack: ${input.technologyStack.join(', ')}`);
    }

    const requirements = await generateRequirements(input);
    
    const outputDir = options.output || './output';
    await mkdir(outputDir, { recursive: true });

    if (options.format === 'json') {
      // Strict JSON output for integration (User Story 9)
      const jsonOutput = JSON.stringify(requirements, null, 2);
      
      // Validate JSON before saving
      try {
        JSON.parse(jsonOutput);
      } catch (parseError) {
        throw new ValidationError('Generated JSON is invalid', 'json-validation');
      }
      
      const filePath = join(outputDir, 'requirements.json');
      await writeFile(filePath, jsonOutput);
      
      if (!options.quiet) {
        console.log(`✅ Requirements JSON saved to: ${filePath}`);
        console.log(`📊 Generated ${requirements.length} user roles with requirements`);
        requirements.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.role}: ${req.needs.length} needs, ${req.processes.length} processes`);
        });
      }
    } else {
      // Markdown output for documentation
      const markdownContent = generateRequirementsMarkdown(requirements);
      const filePath = join(outputDir, 'requirements.md');
      await writeFile(filePath, markdownContent);
      
      if (!options.quiet) {
        console.log(`✅ Requirements document saved to: ${filePath}`);
      }
    }

  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Handle technology stack analysis (User Story 7)
 */
export async function handleTechnologyAnalysisCommand(options: UserStoryOptions): Promise<void> {
  try {
    validateUserStoryOptions(options);
    
    const input = {
      businessProblem: options.businessProblem!,
      technologyStack: options.technologyStack || [],
      contextBundle: options.contextBundle || ''
    };

    if (!options.quiet) {
      console.log('🔧 Analyzing technology stack...');
      console.log(`📋 Business Problem: ${input.businessProblem}`);
      console.log(`🔧 Technology Stack: ${input.technologyStack.join(', ')}`);
    }

    const analysis = await generateTechnologyStackAnalysis(input);
    
    const outputDir = options.output || './output';
    await mkdir(outputDir, { recursive: true });

    if (options.format === 'json') {
      // JSON output for integration
      const jsonOutput = JSON.stringify(analysis, null, 2);
      const filePath = join(outputDir, 'technology-analysis.json');
      await writeFile(filePath, jsonOutput);
      
      if (!options.quiet) {
        console.log(`✅ Technology analysis JSON saved to: ${filePath}`);
        console.log('📊 Analysis Summary:');
        console.log(`   Strengths: ${analysis.strengths.length}`);
        console.log(`   Weaknesses: ${analysis.weaknesses.length}`);
        console.log(`   Recommendations: ${analysis.recommendations.length}`);
        console.log(`   Implementation Risks: ${analysis.implementationRisks.length}`);
      }
    } else {
      // Markdown output for documentation
      const markdownContent = generateTechnologyAnalysisMarkdown(analysis);
      const filePath = join(outputDir, 'technology-analysis.md');
      await writeFile(filePath, markdownContent);
      
      if (!options.quiet) {
        console.log(`✅ Technology analysis document saved to: ${filePath}`);
      }
    }

  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Handle risk management plan generation (User Story 8)
 */
export async function handleRiskManagementCommand(options: UserStoryOptions): Promise<void> {
  try {
    validateUserStoryOptions(options);
    
    const input = {
      businessProblem: options.businessProblem!,
      technologyStack: options.technologyStack || [],
      contextBundle: options.contextBundle || ''
    };

    if (!options.quiet) {
      console.log('⚠️ Generating risk management plan...');
      console.log(`📋 Business Problem: ${input.businessProblem}`);
      console.log(`🔧 Technology Stack: ${input.technologyStack.join(', ')}`);
    }

    const riskPlan = await generateRiskManagementPlan(input);
    
    const outputDir = options.output || './output';
    await mkdir(outputDir, { recursive: true });

    if (options.format === 'json') {
      // JSON output for integration
      const jsonOutput = JSON.stringify(riskPlan, null, 2);
      const filePath = join(outputDir, 'risk-management-plan.json');
      await writeFile(filePath, jsonOutput);
      
      if (!options.quiet) {
        console.log(`✅ Risk management plan JSON saved to: ${filePath}`);
        console.log('📊 Risk Analysis Summary:');
        console.log(`   Identified Risks: ${riskPlan.identifiedRisks.length}`);
        console.log(`   Risk Categories: ${riskPlan.riskCategories.join(', ')}`);
        console.log(`   Overall Assessment: ${riskPlan.overallRiskAssessment.substring(0, 100)}...`);
      }
    } else {
      // Markdown output for documentation
      const markdownContent = generateRiskManagementMarkdown(riskPlan);
      const filePath = join(outputDir, 'risk-management-plan.md');
      await writeFile(filePath, markdownContent);
      
      if (!options.quiet) {
        console.log(`✅ Risk management plan document saved to: ${filePath}`);
      }
    }

  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Handle comprehensive project analysis (combines multiple user stories)
 */
export async function handleComprehensiveAnalysisCommand(options: UserStoryOptions): Promise<void> {
  try {
    validateUserStoryOptions(options);
    
    if (!options.quiet) {
      console.log('🚀 Starting comprehensive project analysis...');
      console.log('📊 This will generate strategic planning, requirements, technology analysis, and risk management');
    }

    const input = {
      businessProblem: options.businessProblem!,
      technologyStack: options.technologyStack || [],
      contextBundle: options.contextBundle || ''
    };

    // Generate all analyses
    const [strategicSections, requirements, techAnalysis, riskPlan] = await Promise.all([
      generateStrategicSections(input),
      generateRequirements(input),
      generateTechnologyStackAnalysis(input),
      generateRiskManagementPlan(input)
    ]);

    const outputDir = options.output || './output';
    await mkdir(outputDir, { recursive: true });

    if (options.format === 'json') {
      // Combined JSON output
      const combinedAnalysis = {
        strategicPlanning: strategicSections,
        requirements: requirements,
        technologyAnalysis: techAnalysis,
        riskManagement: riskPlan,
        metadata: {
          generatedAt: new Date().toISOString(),
          businessProblem: input.businessProblem,
          technologyStack: input.technologyStack,
          version: '2.1.3'
        }
      };

      const jsonOutput = JSON.stringify(combinedAnalysis, null, 2);
      const filePath = join(outputDir, 'comprehensive-analysis.json');
      await writeFile(filePath, jsonOutput);
      
      if (!options.quiet) {
        console.log(`✅ Comprehensive analysis JSON saved to: ${filePath}`);
      }
    } else {
      // Combined markdown output
      const markdownContent = generateComprehensiveAnalysisMarkdown(
        strategicSections, 
        requirements, 
        techAnalysis, 
        riskPlan,
        input
      );
      const filePath = join(outputDir, 'comprehensive-analysis.md');
      await writeFile(filePath, markdownContent);
      
      if (!options.quiet) {
        console.log(`✅ Comprehensive analysis document saved to: ${filePath}`);
      }
    }

    if (!options.quiet) {
      console.log('\n📊 Analysis Complete:');
      console.log(`   ✅ Strategic Planning: Vision, Mission, Core Values, Purpose`);
      console.log(`   ✅ Requirements: ${requirements.length} user roles identified`);
      console.log(`   ✅ Technology Analysis: ${techAnalysis.strengths.length} strengths, ${techAnalysis.weaknesses.length} weaknesses`);
      console.log(`   ✅ Risk Management: ${riskPlan.identifiedRisks.length} risks identified`);
    }

  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Validate user story command options
 */
function validateUserStoryOptions(options: UserStoryOptions): void {
  if (!options.businessProblem) {
    throw new ValidationError('Business problem is required', 'businessProblem');
  }

  if (options.businessProblem.trim().length < 10) {
    throw new ValidationError('Business problem must be at least 10 characters', 'businessProblem');
  }

  if (options.format && !['json', 'markdown'].includes(options.format)) {
    throw new ValidationError('Format must be either "json" or "markdown"', 'format');
  }
}

/**
 * Generate markdown content for strategic planning
 */
function generateStrategicPlanningMarkdown(sections: StrategicSections): string {
  const timestamp = new Date().toISOString();
  
  return `# Strategic Planning Document

**Generated:** ${timestamp}  
**Generated by:** Requirements Gathering Agent v2.1.3  
**Category:** Strategic Planning

---

## Vision Statement

${sections.vision}

## Mission Statement

${sections.mission}

## Core Values

${sections.coreValues}

## Purpose Statement

${sections.purpose}

---

*This document was generated automatically based on project context and business requirements. Review and customize as needed for your specific organizational needs.*
`;
}

/**
 * Generate markdown content for requirements
 */
function generateRequirementsMarkdown(requirements: UserRequirement[]): string {
  const timestamp = new Date().toISOString();
  
  let content = `# Comprehensive Requirements Document

**Generated:** ${timestamp}  
**Generated by:** Requirements Gathering Agent v2.1.3  
**Category:** Requirements Analysis

---

## Executive Summary

This document contains comprehensive user requirements analysis including user roles, their specific needs, and associated processes. A total of ${requirements.length} user roles have been identified and analyzed.

## User Roles and Requirements

`;

  requirements.forEach((req, index) => {
    content += `### ${index + 1}. ${req.role}

#### Needs
${req.needs.map(need => `- ${need}`).join('\n')}

#### Processes
${req.processes.map(process => `- ${process}`).join('\n')}

`;
  });

  content += `---

*This requirements document was generated automatically based on project context and business analysis. Review and validate with stakeholders before implementation.*
`;

  return content;
}

/**
 * Generate markdown content for technology analysis
 */
function generateTechnologyAnalysisMarkdown(analysis: TechnologyStackAnalysis): string {
  const timestamp = new Date().toISOString();
  
  return `# Technology Stack Analysis

**Generated:** ${timestamp}  
**Generated by:** Requirements Gathering Agent v2.1.3  
**Category:** Technical Analysis

---

## Executive Summary

${analysis.overallAssessment}

## Strengths

${analysis.strengths.map(strength => `- ${strength}`).join('\n')}

## Weaknesses

${analysis.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

## Recommendations

${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

## Scalability Considerations

${analysis.scalabilityConsiderations.map(consideration => `- ${consideration}`).join('\n')}

## Security Considerations

${analysis.securityConsiderations.map(consideration => `- ${consideration}`).join('\n')}

## Compliance Considerations

${analysis.complianceConsiderations.map(consideration => `- ${consideration}`).join('\n')}

## Maintainability Considerations

${analysis.maintainabilityConsiderations.map(consideration => `- ${consideration}`).join('\n')}

## Alternative Technologies

${analysis.alternativeTechnologies.map(alt => `- ${alt}`).join('\n')}

## Implementation Risks

${analysis.implementationRisks.map(risk => `- ${risk}`).join('\n')}

---

*This technology analysis was generated automatically based on the provided technology stack and project context. Review with technical architects and stakeholders before making technology decisions.*
`;
}

/**
 * Generate markdown content for risk management plan
 */
function generateRiskManagementMarkdown(riskPlan: RiskManagementPlan): string {
  const timestamp = new Date().toISOString();
  
  let content = `# Risk Management Plan

**Generated:** ${timestamp}  
**Generated by:** Requirements Gathering Agent v2.1.3  
**Category:** Risk Management

---

## Executive Summary

${riskPlan.overallRiskAssessment}

## Risk Management Approach

${riskPlan.riskManagementApproach}

## Risk Categories

${riskPlan.riskCategories.map(category => `- ${category}`).join('\n')}

## Identified Risks

`;

  riskPlan.identifiedRisks.forEach((risk, index) => {
    content += `### ${risk.riskId}: ${risk.description}

- **Category:** ${risk.category}
- **Probability:** ${risk.probability}
- **Impact:** ${risk.impact}
- **Risk Level:** ${risk.riskLevel}
- **Owner:** ${risk.owner}

**Mitigation Strategy:** ${risk.mitigationStrategy}

**Contingency Plan:** ${risk.contingencyPlan}

**Monitoring Approach:** ${risk.monitoringApproach}

`;
  });

  content += `## Escalation Procedures

${riskPlan.escalationProcedures.map(procedure => `- ${procedure}`).join('\n')}

## Review Schedule

${riskPlan.reviewSchedule}

---

*This risk management plan was generated automatically based on project context and analysis. Review and validate with project stakeholders and risk management teams.*
`;

  return content;
}

/**
 * Generate comprehensive analysis markdown
 */
function generateComprehensiveAnalysisMarkdown(
  strategic: StrategicSections,
  requirements: UserRequirement[],
  techAnalysis: TechnologyStackAnalysis,
  riskPlan: RiskManagementPlan,
  input: { businessProblem: string; technologyStack: string[]; contextBundle: string }
): string {
  const timestamp = new Date().toISOString();
  
  return `# Comprehensive Project Analysis

**Generated:** ${timestamp}  
**Generated by:** Requirements Gathering Agent v2.1.3  
**Category:** Comprehensive Analysis

---

## Project Context

**Business Problem:** ${input.businessProblem}

**Technology Stack:** ${input.technologyStack.join(', ')}

**Additional Context:** ${input.contextBundle}

---

## 1. Strategic Planning

### Vision Statement
${strategic.vision}

### Mission Statement
${strategic.mission}

### Core Values
${strategic.coreValues}

### Purpose Statement
${strategic.purpose}

---

## 2. Requirements Analysis

### Summary
A total of ${requirements.length} user roles have been identified with their specific needs and processes.

${requirements.map((req, index) => `
#### ${req.role}
**Needs:** ${req.needs.join(', ')}
**Processes:** ${req.processes.join(', ')}
`).join('')}

---

## 3. Technology Analysis

### Overall Assessment
${techAnalysis.overallAssessment}

### Key Findings
- **Strengths:** ${techAnalysis.strengths.length} identified
- **Weaknesses:** ${techAnalysis.weaknesses.length} identified  
- **Recommendations:** ${techAnalysis.recommendations.length} provided
- **Implementation Risks:** ${techAnalysis.implementationRisks.length} identified

---

## 4. Risk Management

### Risk Summary
- **Total Risks Identified:** ${riskPlan.identifiedRisks.length}
- **Risk Categories:** ${riskPlan.riskCategories.join(', ')}
- **Overall Assessment:** ${riskPlan.overallRiskAssessment}

### Critical Risks
${riskPlan.identifiedRisks.filter(risk => risk.riskLevel === 'Critical' || risk.riskLevel === 'High').map(risk => `
- **${risk.riskId}:** ${risk.description} (${risk.riskLevel} risk)
`).join('')}

---

## Next Steps

1. **Review Strategic Planning:** Validate vision, mission, and core values with stakeholders
2. **Validate Requirements:** Confirm user roles and requirements with business stakeholders  
3. **Technology Review:** Assess technology recommendations with technical team
4. **Risk Mitigation:** Implement risk mitigation strategies for high-priority risks
5. **Project Planning:** Use this analysis as input for detailed project planning

---

*This comprehensive analysis provides a foundation for project planning and execution. Review all sections with appropriate stakeholders before proceeding with implementation.*
`;
}