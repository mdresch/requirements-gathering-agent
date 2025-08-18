import { Command } from 'commander';
import { RiskComplianceAssessmentService } from '../services/RiskComplianceAssessmentService.js';
import { createProcessor } from '../modules/documentGenerator/ProcessorFactory.js';
import type { ProjectData } from '../types/standardsCompliance.js';
import type { ProjectContext } from '../modules/ai/types.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Risk and Compliance Assessment CLI Command
 * 
 * Provides command-line interface for generating comprehensive risk and compliance assessments
 */
export function createRiskComplianceCommand(): Command {
  const command = new Command('risk-compliance');
  
  command
    .description('Generate comprehensive risk and compliance assessments')
    .option('-p, --project <name>', 'Project name')
    .option('-t, --type <type>', 'Project type (SOFTWARE_DEVELOPMENT, INFRASTRUCTURE, etc.)')
    .option('-d, --description <desc>', 'Project description')
    .option('-o, --output <dir>', 'Output directory', 'generated-documents/risk-compliance')
    .option('--integrated', 'Generate integrated assessment using compliance engine')
    .option('--pmbok-only', 'Generate PMBOK-focused assessment only')
    .option('--format <format>', 'Output format (markdown, json)', 'markdown')
    .action(async (options) => {
      try {
        console.log('🔍 Starting Risk and Compliance Assessment...\n');
        
        // Validate required options
        if (!options.project) {
          console.error('❌ Error: Project name is required. Use -p or --project option.');
          process.exit(1);
        }
        
        // Create project context
        const projectContext: ProjectContext = {
          projectName: options.project,
          projectType: options.type || 'SOFTWARE_DEVELOPMENT',
          description: options.description || 'Project requiring risk and compliance assessment'
        };
        
        // Ensure output directory exists
        if (!existsSync(options.output)) {
          mkdirSync(options.output, { recursive: true });
        }
        
        if (options.integrated) {
          await generateIntegratedAssessment(projectContext, options);
        } else {
          await generateStandardAssessment(projectContext, options);
        }
        
        console.log('\n✅ Risk and Compliance Assessment completed successfully!');
        
      } catch (error) {
        console.error('\n❌ Error generating risk and compliance assessment:', error.message);
        process.exit(1);
      }
    });
  
  return command;
}

/**
 * Generate integrated assessment using the compliance engine
 */
async function generateIntegratedAssessment(
  projectContext: ProjectContext, 
  options: any
): Promise<void> {
  console.log('📊 Generating integrated risk and compliance assessment...');
  
  const service = new RiskComplianceAssessmentService();
  
  // Convert project context to project data
  const projectData: ProjectData = {
    projectId: `proj-${Date.now()}`,
    projectName: projectContext.projectName || 'Untitled Project',
    industry: 'TECHNOLOGY', // Default, could be made configurable
    projectType: mapProjectType(projectContext.projectType),
    complexity: 'MEDIUM', // Default, could be made configurable
    duration: 12, // Default 12 months
    budget: 500000, // Default budget
    teamSize: 10, // Default team size
    stakeholderCount: 5, // Default stakeholder count
    regulatoryRequirements: [],
    methodology: 'AGILE',
    documents: [],
    processes: [],
    deliverables: [],
    governance: {
      steeringCommittee: [],
      projectBoard: [],
      workingGroups: [],
      decisionMakingProcess: 'Consensus-based decision making',
      escalationPaths: []
    },
    metadata: {
      createdDate: new Date(),
      lastUpdated: new Date(),
      version: '1.0',
      tags: ['risk-assessment', 'compliance-assessment'],
      customFields: {}
    }
  };
  
  try {
    const result = await service.performIntegratedAssessment(projectData);
    
    // Save results
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `integrated-risk-compliance-assessment-${timestamp}`;
    
    if (options.format === 'json') {
      const jsonPath = join(options.output, `${filename}.json`);
      writeFileSync(jsonPath, JSON.stringify(result, null, 2));
      console.log(`📄 Integrated assessment saved to: ${jsonPath}`);
    } else {
      const markdownContent = formatIntegratedAssessmentAsMarkdown(result);
      const mdPath = join(options.output, `${filename}.md`);
      writeFileSync(mdPath, markdownContent);
      console.log(`📄 Integrated assessment saved to: ${mdPath}`);
    }
    
    // Display summary
    console.log('\n📋 Assessment Summary:');
    console.log(`   Overall Risk Level: ${result.overallRiskLevel}`);
    console.log(`   Compliance Score: ${result.complianceScore.toFixed(1)}%`);
    console.log(`   Total Risks Identified: ${result.riskAssessment.risks.length}`);
    console.log(`   Standards Evaluated: ${result.complianceResults.length}`);
    console.log(`   Recommendations: ${result.recommendations.length}`);
    
  } catch (error) {
    console.error('Error in integrated assessment:', error);
    throw error;
  }
}

/**
 * Generate standard assessment using the document processor
 */
async function generateStandardAssessment(
  projectContext: ProjectContext, 
  options: any
): Promise<void> {
  console.log('📋 Generating standard risk and compliance assessment...');
  
  try {
    const processor = await createProcessor('risk-compliance-assessment');
    const result = await processor.process(projectContext);
    
    // Save the generated document
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `risk-compliance-assessment-${timestamp}.md`;
    const filepath = join(options.output, filename);
    
    writeFileSync(filepath, result.content);
    console.log(`📄 Assessment saved to: ${filepath}`);
    
    // Display summary
    console.log('\n📋 Assessment Summary:');
    console.log(`   Document: ${result.title}`);
    console.log(`   Content Length: ${result.content.length} characters`);
    console.log(`   File: ${filepath}`);
    
  } catch (error) {
    console.error('Error in standard assessment:', error);
    throw error;
  }
}

/**
 * Format integrated assessment result as markdown
 */
function formatIntegratedAssessmentAsMarkdown(result: any): string {
  const date = new Date().toLocaleDateString();
  
  return `# Integrated Risk and Compliance Assessment

**Project:** ${result.projectId}  
**Assessment Date:** ${date}  
**Overall Risk Level:** ${result.overallRiskLevel}  
**Compliance Score:** ${result.complianceScore.toFixed(1)}%

## Executive Summary

${result.executiveSummary ? JSON.stringify(result.executiveSummary, null, 2) : 'Executive summary not available'}

## Risk Assessment

### Risk Summary
- **Total Risks:** ${result.riskAssessment.risks.length}
- **High Priority Risks:** ${result.riskAssessment.riskMatrix.highRisks.length}
- **Medium Priority Risks:** ${result.riskAssessment.riskMatrix.mediumRisks.length}
- **Low Priority Risks:** ${result.riskAssessment.riskMatrix.lowRisks.length}

### High Priority Risks
${result.riskAssessment.riskMatrix.highRisks.map((risk: any) => 
  `- **${risk.id}**: ${risk.description} (${risk.riskLevel})`
).join('\n')}

## Compliance Assessment

### Standards Evaluated
${result.complianceResults.map((comp: any) => 
  `- **${comp.standard}**: ${comp.overallScore}% (${comp.complianceStatus})`
).join('\n')}

### Critical Issues
${result.complianceResults.flatMap((comp: any) => 
  comp.criticalIssues.map((issue: any) => `- **${comp.standard}**: ${issue.description}`)
).join('\n')}

## Recommendations

${result.recommendations.map((rec: any, index: number) => 
  `${index + 1}. **${rec.priority}**: ${rec.description}`
).join('\n')}

## Detailed Analysis

\`\`\`json
${JSON.stringify(result.integratedAnalysis, null, 2)}
\`\`\`

---
*Generated by ADPA Risk and Compliance Assessment Module*
`;
}

/**
 * Map project type to compliance project type
 */
function mapProjectType(projectType?: string): any {
  const typeMap: Record<string, any> = {
    'SOFTWARE_DEVELOPMENT': 'SOFTWARE_DEVELOPMENT',
    'INFRASTRUCTURE': 'INFRASTRUCTURE',
    'DATA_MIGRATION': 'DATA_MIGRATION',
    'BUSINESS_TRANSFORMATION': 'BUSINESS_TRANSFORMATION',
    'COMPLIANCE': 'COMPLIANCE',
    'RESEARCH': 'RESEARCH',
    'MAINTENANCE': 'MAINTENANCE'
  };
  
  return typeMap[projectType || 'SOFTWARE_DEVELOPMENT'] || 'OTHER';
}