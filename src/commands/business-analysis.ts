/**
 * Business Analysis Commands
 * Specialized commands for Business Analyst workflows and requirements gathering
 * 
 * @version 1.0.0
 * @author Requirements Gathering Agent Team
 * @created 2025-01-27
 * 
 * @filepath src/commands/business-analysis.ts
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { RequirementsElicitationProcessor } from '../modules/ai/processors/RequirementsElicitationProcessor.js';
import { AdvancedRequirementsAnalysisProcessor } from '../modules/ai/processors/AdvancedRequirementsAnalysisProcessor.js';
import { BusinessAnalysisQualityProcessor } from '../modules/ai/processors/BusinessAnalysisQualityProcessor.js';
import { analyzeProjectComprehensively } from '../modules/projectAnalyzer.js';
import { DEFAULT_OUTPUT_DIR } from '../constants.js';

export interface BusinessAnalysisOptions {
  outputDir?: string;
  stakeholderRole?: string;
  workshopType?: string;
  duration?: number;
  participants?: string[];
  format?: 'markdown' | 'json';
  verbose?: boolean;
}

export interface ElicitationOptions extends BusinessAnalysisOptions {
  elicitationType?: 'interview' | 'workshop' | 'survey' | 'observation';
  targetAudience?: string;
  objectives?: string[];
}

export interface AnalysisOptions extends BusinessAnalysisOptions {
  analysisType?: 'process' | 'usecase' | 'business-rules' | 'impact' | 'gap';
  modelType?: 'BPMN' | 'Flowchart' | 'ValueStream' | 'Swimlane';
  currentState?: string;
  futureState?: string;
}

export interface QualityOptions extends BusinessAnalysisOptions {
  qualityType?: 'requirements' | 'consistency' | 'completeness' | 'traceability' | 'metrics';
  standards?: string;
  template?: string;
  documents?: string[];
}

/**
 * Generate interview questions for stakeholder elicitation
 */
export async function handleInterviewQuestionsCommand(
  stakeholderRole: string,
  options: ElicitationOptions = {}
): Promise<void> {
  console.log(`🎯 Generating interview questions for ${stakeholderRole}...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    const projectAnalysis = await analyzeProjectComprehensively(process.cwd());
    const projectContext = JSON.stringify(projectAnalysis, null, 2);
    
    const processor = new RequirementsElicitationProcessor();
    const interviewGuide = await processor.generateInterviewQuestions(
      stakeholderRole,
      projectContext
    );
    
    if (!interviewGuide) {
      throw new Error('Failed to generate interview questions');
    }
    
    const fileName = `interview-questions-${stakeholderRole.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, interviewGuide, 'utf8');
    
    console.log(`✅ Interview questions generated: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(interviewGuide.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to generate interview questions:', error);
    process.exit(1);
  }
}

/**
 * Create workshop facilitation plan
 */
export async function handleWorkshopPlanCommand(
  workshopType: string,
  options: ElicitationOptions = {}
): Promise<void> {
  console.log(`🏗️ Creating workshop plan for ${workshopType}...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    const duration = options.duration || 4;
    const participants = options.participants || ['Business Users', 'Stakeholders', 'Subject Matter Experts'];
    
    const projectAnalysis = await analyzeProjectComprehensively(process.cwd());
    const projectContext = JSON.stringify(projectAnalysis, null, 2);
    
    const processor = new RequirementsElicitationProcessor();
    const workshopPlan = await processor.createWorkshopPlan(
      workshopType,
      duration,
      participants,
      projectContext
    );
    
    if (!workshopPlan) {
      throw new Error('Failed to generate workshop plan');
    }
    
    const fileName = `workshop-plan-${workshopType.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, workshopPlan, 'utf8');
    
    console.log(`✅ Workshop plan generated: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(workshopPlan.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to generate workshop plan:', error);
    process.exit(1);
  }
}

/**
 * Extract requirements from meeting notes
 */
export async function handleRequirementsExtractionCommand(
  notesFile: string,
  options: ElicitationOptions = {}
): Promise<void> {
  console.log(`📝 Extracting requirements from ${notesFile}...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    const meetingType = options.elicitationType || 'general';
    
    // Read the notes file
    const notesContent = await fs.readFile(notesFile, 'utf8');
    
    const processor = new RequirementsElicitationProcessor();
    const extractedRequirements = await processor.extractRequirementsFromNotes(
      notesContent,
      meetingType
    );
    
    if (!extractedRequirements) {
      throw new Error('Failed to extract requirements from notes');
    }
    
    const fileName = `extracted-requirements-${Date.now()}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, extractedRequirements, 'utf8');
    
    console.log(`✅ Requirements extracted: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(extractedRequirements.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to extract requirements:', error);
    process.exit(1);
  }
}

/**
 * Generate process model from requirements
 */
export async function handleProcessModelCommand(
  requirementsFile: string,
  options: AnalysisOptions = {}
): Promise<void> {
  const modelType = options.modelType || 'BPMN';
  console.log(`🔄 Generating ${modelType} process model...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    
    // Read requirements file
    const requirementsContent = await fs.readFile(requirementsFile, 'utf8');
    const requirements = requirementsContent.split('\n').filter(line => line.trim());
    
    const projectAnalysis = await analyzeProjectComprehensively(process.cwd());
    const projectContext = JSON.stringify(projectAnalysis, null, 2);
    
    const processor = new AdvancedRequirementsAnalysisProcessor();
    const processModel = await processor.generateProcessModel(
      requirements,
      modelType,
      projectContext
    );
    
    if (!processModel) {
      throw new Error('Failed to generate process model');
    }
    
    const fileName = `process-model-${modelType.toLowerCase()}-${Date.now()}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, processModel, 'utf8');
    
    console.log(`✅ Process model generated: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(processModel.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to generate process model:', error);
    process.exit(1);
  }
}

/**
 * Create use case model from functional requirements
 */
export async function handleUseCaseModelCommand(
  requirementsFile: string,
  options: AnalysisOptions = {}
): Promise<void> {
  console.log(`🎭 Creating use case model...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    
    // Read requirements file
    const requirementsContent = await fs.readFile(requirementsFile, 'utf8');
    const requirements = requirementsContent.split('\n').filter(line => line.trim());
    
    const projectAnalysis = await analyzeProjectComprehensively(process.cwd());
    const projectContext = JSON.stringify(projectAnalysis, null, 2);
    
    const processor = new AdvancedRequirementsAnalysisProcessor();
    const useCaseModel = await processor.createUseCaseModel(
      requirements,
      projectContext
    );
    
    if (!useCaseModel) {
      throw new Error('Failed to generate use case model');
    }
    
    const fileName = `use-case-model-${Date.now()}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, useCaseModel, 'utf8');
    
    console.log(`✅ Use case model generated: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(useCaseModel.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to generate use case model:', error);
    process.exit(1);
  }
}

/**
 * Extract business rules from requirements
 */
export async function handleBusinessRulesCommand(
  requirementsFile: string,
  options: AnalysisOptions = {}
): Promise<void> {
  console.log(`📋 Extracting business rules...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    
    // Read requirements file
    const requirementsContent = await fs.readFile(requirementsFile, 'utf8');
    const requirements = requirementsContent.split('\n').filter(line => line.trim());
    
    const projectAnalysis = await analyzeProjectComprehensively(process.cwd());
    const projectContext = JSON.stringify(projectAnalysis, null, 2);
    
    const processor = new AdvancedRequirementsAnalysisProcessor();
    const businessRules = await processor.extractBusinessRules(
      requirements,
      projectContext
    );
    
    if (!businessRules) {
      throw new Error('Failed to extract business rules');
    }
    
    const fileName = `business-rules-catalog-${Date.now()}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, businessRules, 'utf8');
    
    console.log(`✅ Business rules catalog generated: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(businessRules.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to extract business rules:', error);
    process.exit(1);
  }
}

/**
 * Perform impact analysis for requirement changes
 */
export async function handleImpactAnalysisCommand(
  requirement: string,
  options: AnalysisOptions = {}
): Promise<void> {
  console.log(`🎯 Performing impact analysis...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    
    // Get existing requirements context
    const projectAnalysis = await analyzeProjectComprehensively(process.cwd());
    const projectContext = JSON.stringify(projectAnalysis, null, 2);
    
    // Try to read existing requirements if available
    let existingRequirements: string[] = [];
    try {
      const reqFiles = await fs.readdir(outputDir);
      const reqFile = reqFiles.find(f => f.includes('requirements') && f.endsWith('.md'));
      if (reqFile) {
        const content = await fs.readFile(join(outputDir, reqFile), 'utf8');
        existingRequirements = content.split('\n').filter(line => line.trim());
      }
    } catch {
      // No existing requirements found, continue with empty array
    }
    
    const processor = new AdvancedRequirementsAnalysisProcessor();
    const impactAnalysis = await processor.analyzeRequirementImpact(
      requirement,
      existingRequirements,
      projectContext
    );
    
    if (!impactAnalysis) {
      throw new Error('Failed to perform impact analysis');
    }
    
    const fileName = `impact-analysis-${Date.now()}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, impactAnalysis, 'utf8');
    
    console.log(`✅ Impact analysis generated: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(impactAnalysis.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to perform impact analysis:', error);
    process.exit(1);
  }
}

/**
 * Assess requirements quality
 */
export async function handleQualityAssessmentCommand(
  requirementsFile: string,
  options: QualityOptions = {}
): Promise<void> {
  console.log(`🔍 Assessing requirements quality...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    const standards = options.standards || 'BABOK v3';
    
    // Read requirements file
    const requirementsContent = await fs.readFile(requirementsFile, 'utf8');
    const requirements = requirementsContent.split('\n').filter(line => line.trim());
    
    const processor = new BusinessAnalysisQualityProcessor();
    const qualityReport = await processor.assessRequirementsQuality(
      requirements,
      standards
    );
    
    if (!qualityReport) {
      throw new Error('Failed to assess requirements quality');
    }
    
    const fileName = `quality-assessment-${Date.now()}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, qualityReport, 'utf8');
    
    console.log(`✅ Quality assessment generated: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(qualityReport.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to assess requirements quality:', error);
    process.exit(1);
  }
}

/**
 * Validate document consistency
 */
export async function handleConsistencyValidationCommand(
  documentFiles: string[],
  options: QualityOptions = {}
): Promise<void> {
  console.log(`🔄 Validating document consistency...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    
    // Read all document files
    const documents = await Promise.all(
      documentFiles.map(async (file) => ({
        name: file,
        content: await fs.readFile(file, 'utf8')
      }))
    );
    
    const projectAnalysis = await analyzeProjectComprehensively(process.cwd());
    const projectContext = JSON.stringify(projectAnalysis, null, 2);
    
    const processor = new BusinessAnalysisQualityProcessor();
    const consistencyReport = await processor.validateDocumentConsistency(
      documents,
      projectContext
    );
    
    if (!consistencyReport) {
      throw new Error('Failed to validate document consistency');
    }
    
    const fileName = `consistency-validation-${Date.now()}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, consistencyReport, 'utf8');
    
    console.log(`✅ Consistency validation generated: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(consistencyReport.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to validate document consistency:', error);
    process.exit(1);
  }
}

/**
 * Generate quality metrics report
 */
export async function handleQualityMetricsCommand(
  options: QualityOptions = {}
): Promise<void> {
  console.log(`📊 Generating quality metrics...`);
  
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    
    const projectAnalysis = await analyzeProjectComprehensively(process.cwd());
    const projectData = JSON.stringify(projectAnalysis, null, 2);
    
    const processor = new BusinessAnalysisQualityProcessor();
    const metricsReport = await processor.generateQualityMetrics(
      projectData,
      'current'
    );
    
    if (!metricsReport) {
      throw new Error('Failed to generate quality metrics');
    }
    
    const fileName = `quality-metrics-${Date.now()}.md`;
    const filePath = join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, metricsReport, 'utf8');
    
    console.log(`✅ Quality metrics generated: ${filePath}`);
    
    if (options.verbose) {
      console.log('\n📋 Preview:');
      console.log(metricsReport.substring(0, 500) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to generate quality metrics:', error);
    process.exit(1);
  }
}

/**
 * Display help for Business Analysis commands
 */
export function displayBusinessAnalysisHelp(): void {
  console.log(`
🎯 Business Analysis Commands

Requirements Elicitation:
  interview-questions <role>     Generate interview questions for stakeholder role
  workshop-plan <type>          Create workshop facilitation plan
  extract-requirements <file>   Extract requirements from meeting notes
  survey-questions <audience>   Generate requirements gathering survey

Requirements Analysis:
  process-model <file>          Generate process model from requirements
  use-case-model <file>         Create use case model
  business-rules <file>         Extract business rules catalog
  impact-analysis <requirement> Perform requirement impact analysis
  gap-analysis                  Analyze current vs future state gaps

Quality Assurance:
  quality-assessment <file>     Assess requirements quality
  consistency-check <files...>  Validate document consistency
  completeness-check <file>     Verify document completeness
  traceability-check <file>     Validate requirements traceability
  quality-metrics              Generate quality metrics report

Options:
  --output-dir <dir>           Output directory (default: generated-documents)
  --format <format>            Output format: markdown, json (default: markdown)
  --verbose                    Show detailed output
  --stakeholder-role <role>    Specify stakeholder role
  --workshop-type <type>       Specify workshop type
  --model-type <type>          Process model type: BPMN, Flowchart, ValueStream, Swimlane
  --standards <standards>      Quality standards to apply (default: BABOK v3)

Examples:
  rga ba interview-questions "Product Owner" --verbose
  rga ba workshop-plan "Requirements Gathering" --duration 6
  rga ba process-model requirements.md --model-type BPMN
  rga ba quality-assessment requirements.md --standards "BABOK v3"
  rga ba consistency-check req1.md req2.md req3.md
  `);
}