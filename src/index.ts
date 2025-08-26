/**
 * Requirements Gathering Agent - Main Export Module
 * 
 * AI-powered PMBOK documentation generator with multi-provider support.
 * This module serves as the main entry point for all core functionality.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 * 
 * Key Features:
 * - Multi-provider AI integration (Google AI, Azure OpenAI, GitHub AI)
 * - PMBOK 7.0 compliant document generation
 * - Comprehensive project analysis and context building
 * - Automated requirements gathering and documentation
 * - Modern TypeScript architecture with ES modules
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\index.ts
 */

// Core LLM functions
export {
  getAiSummaryAndGoals,
  getAiUserStories,
  getAiUserPersonas,
  getAiKeyRolesAndNeeds,
  getAiDataModelSuggestions,
  getAiTechStackAnalysis,
  getAiRiskAnalysis,
  getAiAcceptanceCriteria,
  getAiComplianceConsiderations,
  getAiUiUxConsiderations
} from './modules/ai/processors/index.js';

// PMBOK document generators
export {
  getAiProjectCharter,
  getAiStakeholderRegister,
  getAiScopeManagementPlan,
  getAiRequirementsManagementPlan,
  getAiScheduleManagementPlan,
  getAiCostManagementPlan,
  getAiQualityManagementPlan,
  getAiResourceManagementPlan,
  getAiCommunicationManagementPlan,
  getAiRiskManagementPlan,
  getAiProcurementManagementPlan,
  getAiStakeholderEngagementPlan,
  getAiWbs,
  getAiWbsDictionary,
  getAiScopeBaseline,               // New function
  getAiActivityList,
  getAiActivityAttributes,          // New function
  getAiActivitySequencing,          // New function
  getAiResourceRequirements,        // New function
  getAiScheduleNetworkDiagram,
  getAiMilestoneList,
  getAiDevelopScheduleInput
} from './modules/llmProcessor-migration.js';

// Utility functions
export { generateMarkdownFile, generateMarkdownFiles, generateProjectDocumentation } from './modules/fileUtils.js';

// Strategic planning functions
export async function generateStrategicSections(input: {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
}): Promise<StrategicSections> {
  const { AIProcessor } = await import('./modules/ai/AIProcessor.js');
  const aiProcessor = AIProcessor.getInstance();
  
  const context = `
Business Problem: ${input.businessProblem}
Technology Stack: ${input.technologyStack.join(', ')}
Context: ${input.contextBundle}
  `.trim();

  try {
    // Generate vision statement
    const visionPrompt = `Based on the following project context, generate a clear and inspiring vision statement that describes the desired future state this project will achieve:

${context}

Generate only the vision statement, no additional text or formatting.`;

  const vision = await aiProcessor.processAIRequest(() => Promise.resolve(visionPrompt), 'strategic-planning');

    // Generate mission statement
    const missionPrompt = `Based on the following project context, generate a concise mission statement that describes the purpose and primary objectives of this project:

${context}

Generate only the mission statement, no additional text or formatting.`;

  const mission = await aiProcessor.processAIRequest(() => Promise.resolve(missionPrompt), 'strategic-planning');

    // Generate core values
    const valuesPrompt = `Based on the following project context, generate 3-5 core values that will guide this project's execution and decision-making:

${context}

Generate only the core values as a comma-separated list, no additional text or formatting.`;

  const coreValues = await aiProcessor.processAIRequest(() => Promise.resolve(valuesPrompt), 'strategic-planning');

    // Generate purpose statement
    const purposePrompt = `Based on the following project context, generate a clear purpose statement that explains why this project exists and what problem it solves:

${context}

Generate only the purpose statement, no additional text or formatting.`;

  const purpose = await aiProcessor.processAIRequest(() => Promise.resolve(purposePrompt), 'strategic-planning');

    return {
      vision: vision?.trim() || 'Vision not generated',
      mission: mission?.trim() || 'Mission not generated',
      coreValues: coreValues?.trim() || 'Core values not generated',
      purpose: purpose?.trim() || 'Purpose not generated'
    };
  } catch (error) {
    console.error('Error generating strategic sections:', error);
    return {
      vision: 'Error generating vision',
      mission: 'Error generating mission',
      coreValues: 'Error generating core values',
      purpose: 'Error generating purpose'
    };
  }
}

export async function generateRequirements(input: {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
}): Promise<UserRequirement[]> {
  const { AIProcessor } = await import('./modules/ai/AIProcessor.js');
  const aiProcessor = AIProcessor.getInstance();
  
  const context = `
Business Problem: ${input.businessProblem}
Technology Stack: ${input.technologyStack.join(', ')}
Context: ${input.contextBundle}
  `.trim();

  try {
    const prompt = `Based on the following project context, generate a comprehensive list of user roles, their needs, and associated processes. Return the response as a valid JSON array where each object has the following structure:

{
  "role": "Role Name",
  "needs": ["Need 1", "Need 2", "Need 3"],
  "processes": ["Process 1", "Process 2", "Process 3"]
}

Project Context:
${context}

Requirements:
1. Identify all major stakeholder groups and user roles
2. For each role, list 3-5 specific needs they have
3. For each role, list 3-5 relevant processes they participate in
4. Ensure needs are actionable and measurable
5. Ensure processes are clear and specific to the role
6. Return ONLY valid JSON, no additional text or formatting

JSON Response:`;

  const response = await aiProcessor.processAIRequest(() => Promise.resolve(prompt), 'requirements-generation');
    
    if (!response) {
      return [];
    }

    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.trim();
      let jsonString = cleanedResponse;
      
      // Remove any markdown formatting
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Parse the JSON
      const requirements = JSON.parse(jsonString);
      
      // Validate the structure
      if (!Array.isArray(requirements)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each requirement object
      const validatedRequirements: UserRequirement[] = requirements.map((req: any, index: number) => {
        if (!req.role || !Array.isArray(req.needs) || !Array.isArray(req.processes)) {
          throw new Error(`Invalid requirement structure at index ${index}`);
        }
        
        return {
          role: String(req.role),
          needs: req.needs.map((need: any) => String(need)),
          processes: req.processes.map((process: any) => String(process))
        };
      });
      
      return validatedRequirements;
      
    } catch (parseError) {
      console.error('Error parsing requirements JSON:', parseError);
      console.error('Raw response:', response);
      
      // Fallback: return a basic structure
      return [
        {
          role: 'Project Manager',
          needs: ['Project planning and coordination', 'Resource management', 'Risk mitigation'],
          processes: ['Project initiation', 'Planning and execution', 'Monitoring and control']
        },
        {
          role: 'Business Analyst',
          needs: ['Requirements gathering', 'Stakeholder communication', 'Process documentation'],
          processes: ['Requirements elicitation', 'Analysis and validation', 'Documentation and approval']
        },
        {
          role: 'End User',
          needs: ['System functionality', 'User-friendly interface', 'Training and support'],
          processes: ['System usage', 'Feedback provision', 'Training participation']
        }
      ];
    }
    
  } catch (error) {
    console.error('Error generating requirements:', error);
    return [];
  }
}

// Type definitions
export interface ProjectContext {
  projectName: string;
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
}

export interface StrategicSections {
  vision: string;
  mission: string;
  coreValues: string;
  purpose: string;
}

export interface UserRequirement {
  role: string;
  needs: string[];
  processes: string[];
}

export interface TechnologyStackAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  scalabilityConsiderations: string[];
  securityConsiderations: string[];
  complianceConsiderations: string[];
  maintainabilityConsiderations: string[];
  alternativeTechnologies: string[];
  implementationRisks: string[];
  overallAssessment: string;
}

export interface RiskItem {
  riskId: string;
  description: string;
  category: string;
  probability: string;
  impact: string;
  riskLevel: string;
  mitigationStrategy: string;
  contingencyPlan: string;
  owner: string;
  monitoringApproach: string;
}

export interface RiskManagementPlan {
  identifiedRisks: RiskItem[];
  riskCategories: string[];
  overallRiskAssessment: string;
  riskManagementApproach: string;
  escalationProcedures: string[];
  reviewSchedule: string;
}

// Technology Stack Analysis function
export async function generateTechnologyStackAnalysis(input: {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
}): Promise<TechnologyStackAnalysis> {
  const { AIProcessor } = await import('./modules/ai/AIProcessor.js');
  const aiProcessor = AIProcessor.getInstance();
  
  const context = `
Business Problem: ${input.businessProblem}
Technology Stack: ${input.technologyStack.join(', ')}
Context: ${input.contextBundle}
  `.trim();

  try {
    const prompt = `Based on the following project context and technology stack, provide a comprehensive technology analysis. Return the response as a valid JSON object with the following structure:

{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "scalabilityConsiderations": ["Consideration 1", "Consideration 2", "Consideration 3"],
  "securityConsiderations": ["Security 1", "Security 2", "Security 3"],
  "complianceConsiderations": ["Compliance 1", "Compliance 2", "Compliance 3"],
  "maintainabilityConsiderations": ["Maintainability 1", "Maintainability 2", "Maintainability 3"],
  "alternativeTechnologies": ["Alternative 1", "Alternative 2", "Alternative 3"],
  "implementationRisks": ["Risk 1", "Risk 2", "Risk 3"],
  "overallAssessment": "Overall assessment summary"
}

Project Context:
${context}

Requirements:
1. Analyze the proposed technology stack for strengths and weaknesses
2. Provide specific recommendations for improvements or alternatives
3. Consider scalability, security, compliance, and maintainability aspects
4. Identify potential implementation risks
5. Suggest alternative technologies where appropriate
6. Provide an overall assessment summary
7. Return ONLY valid JSON, no additional text or formatting

JSON Response:`;

  const response = await aiProcessor.processAIRequest(() => Promise.resolve(prompt), 'technology-analysis');
    
    if (!response) {
      throw new Error('No response received from AI processor');
    }

    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.trim();
      let jsonString = cleanedResponse;
      
      // Remove any markdown formatting
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Parse the JSON
      const analysis = JSON.parse(jsonString);
      
      // Validate and structure the response
      return {
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths.map(String) : [],
        weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses.map(String) : [],
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations.map(String) : [],
        scalabilityConsiderations: Array.isArray(analysis.scalabilityConsiderations) ? analysis.scalabilityConsiderations.map(String) : [],
        securityConsiderations: Array.isArray(analysis.securityConsiderations) ? analysis.securityConsiderations.map(String) : [],
        complianceConsiderations: Array.isArray(analysis.complianceConsiderations) ? analysis.complianceConsiderations.map(String) : [],
        maintainabilityConsiderations: Array.isArray(analysis.maintainabilityConsiderations) ? analysis.maintainabilityConsiderations.map(String) : [],
        alternativeTechnologies: Array.isArray(analysis.alternativeTechnologies) ? analysis.alternativeTechnologies.map(String) : [],
        implementationRisks: Array.isArray(analysis.implementationRisks) ? analysis.implementationRisks.map(String) : [],
        overallAssessment: String(analysis.overallAssessment || 'No assessment provided')
      };
      
    } catch (parseError) {
      console.error('Error parsing technology analysis JSON:', parseError);
      console.error('Raw response:', response);
      
      // Fallback: return a basic structure
      return {
        strengths: ['Technology stack analysis could not be parsed'],
        weaknesses: ['Unable to analyze weaknesses due to parsing error'],
        recommendations: ['Review technology stack manually'],
        scalabilityConsiderations: ['Consider scalability requirements'],
        securityConsiderations: ['Review security implications'],
        complianceConsiderations: ['Ensure compliance with regulations'],
        maintainabilityConsiderations: ['Plan for long-term maintenance'],
        alternativeTechnologies: ['Research alternative solutions'],
        implementationRisks: ['Assess implementation complexity'],
        overallAssessment: 'Technology analysis could not be completed due to parsing error'
      };
    }
    
  } catch (error) {
    console.error('Error generating technology stack analysis:', error);
    return {
      strengths: ['Error generating analysis'],
      weaknesses: ['Error generating analysis'],
      recommendations: ['Error generating analysis'],
      scalabilityConsiderations: ['Error generating analysis'],
      securityConsiderations: ['Error generating analysis'],
      complianceConsiderations: ['Error generating analysis'],
      maintainabilityConsiderations: ['Error generating analysis'],
      alternativeTechnologies: ['Error generating analysis'],
      implementationRisks: ['Error generating analysis'],
      overallAssessment: 'Error generating technology stack analysis'
    };
  }
}

// Risk Management Analysis function
export async function generateRiskManagementPlan(input: {
  businessProblem: string;
  technologyStack: string[];
  contextBundle: string;
}): Promise<RiskManagementPlan> {
  const { AIProcessor } = await import('./modules/ai/AIProcessor.js');
  const aiProcessor = AIProcessor.getInstance();
  
  const context = `
Business Problem: ${input.businessProblem}
Technology Stack: ${input.technologyStack.join(', ')}
Context: ${input.contextBundle}
  `.trim();

  try {
    const prompt = `Based on the following project context, generate a comprehensive risk management plan. Return the response as a valid JSON object with the following structure:

{
  "identifiedRisks": [
    {
      "riskId": "R001",
      "description": "Risk description",
      "category": "Technical|Business|Operational|External",
      "probability": "High|Medium|Low",
      "impact": "High|Medium|Low",
      "riskLevel": "Critical|High|Medium|Low",
      "mitigationStrategy": "Mitigation strategy description",
      "contingencyPlan": "Contingency plan description",
      "owner": "Risk owner role",
      "monitoringApproach": "How to monitor this risk"
    }
  ],
  "riskCategories": ["Category 1", "Category 2", "Category 3"],
  "overallRiskAssessment": "Overall risk assessment summary",
  "riskManagementApproach": "Risk management approach description",
  "escalationProcedures": ["Procedure 1", "Procedure 2", "Procedure 3"],
  "reviewSchedule": "Risk review schedule description"
}

Project Context:
${context}

Requirements:
1. Identify 5-10 specific project risks across different categories
2. Assess probability and impact for each risk
3. Provide mitigation strategies and contingency plans
4. Assign risk owners and monitoring approaches
5. Include overall risk assessment and management approach
6. Define escalation procedures and review schedule
7. Return ONLY valid JSON, no additional text or formatting

JSON Response:`;

  const response = await aiProcessor.processAIRequest(() => Promise.resolve(prompt), 'risk-management');
    
    if (!response) {
      throw new Error('No response received from AI processor');
    }

    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.trim();
      let jsonString = cleanedResponse;
      
      // Remove any markdown formatting
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Parse the JSON
      const riskPlan = JSON.parse(jsonString);
      
      // Validate and structure the response
      const validatedRisks = Array.isArray(riskPlan.identifiedRisks) 
        ? riskPlan.identifiedRisks.map((risk: any, index: number) => ({
            riskId: String(risk.riskId || `R${String(index + 1).padStart(3, '0')}`),
            description: String(risk.description || 'Risk description not provided'),
            category: String(risk.category || 'General'),
            probability: String(risk.probability || 'Medium'),
            impact: String(risk.impact || 'Medium'),
            riskLevel: String(risk.riskLevel || 'Medium'),
            mitigationStrategy: String(risk.mitigationStrategy || 'Mitigation strategy to be defined'),
            contingencyPlan: String(risk.contingencyPlan || 'Contingency plan to be defined'),
            owner: String(risk.owner || 'Project Manager'),
            monitoringApproach: String(risk.monitoringApproach || 'Regular monitoring required')
          }))
        : [];
      
      return {
        identifiedRisks: validatedRisks,
        riskCategories: Array.isArray(riskPlan.riskCategories) ? riskPlan.riskCategories.map(String) : ['Technical', 'Business', 'Operational'],
        overallRiskAssessment: String(riskPlan.overallRiskAssessment || 'Risk assessment to be completed'),
        riskManagementApproach: String(riskPlan.riskManagementApproach || 'Risk management approach to be defined'),
        escalationProcedures: Array.isArray(riskPlan.escalationProcedures) ? riskPlan.escalationProcedures.map(String) : ['Escalate to project manager', 'Escalate to steering committee'],
        reviewSchedule: String(riskPlan.reviewSchedule || 'Weekly risk reviews')
      };
      
    } catch (parseError) {
      console.error('Error parsing risk management plan JSON:', parseError);
      console.error('Raw response:', response);
      
      // Fallback: return a basic structure
      return {
        identifiedRisks: [
          {
            riskId: 'R001',
            description: 'Risk analysis could not be parsed',
            category: 'Technical',
            probability: 'Medium',
            impact: 'Medium',
            riskLevel: 'Medium',
            mitigationStrategy: 'Review risk analysis manually',
            contingencyPlan: 'Develop contingency plan manually',
            owner: 'Project Manager',
            monitoringApproach: 'Regular monitoring'
          }
        ],
        riskCategories: ['Technical', 'Business', 'Operational'],
        overallRiskAssessment: 'Risk analysis could not be completed due to parsing error',
        riskManagementApproach: 'Manual risk management required',
        escalationProcedures: ['Escalate to project manager'],
        reviewSchedule: 'Weekly reviews'
      };
    }
    
  } catch (error) {
    console.error('Error generating risk management plan:', error);
    return {
      identifiedRisks: [],
      riskCategories: ['Technical', 'Business', 'Operational'],
      overallRiskAssessment: 'Error generating risk assessment',
      riskManagementApproach: 'Error generating risk management approach',
      escalationProcedures: ['Error generating escalation procedures'],
      reviewSchedule: 'Error generating review schedule'
    };
  }
}

// Version information
export const version = '2.1.3';
export const name = 'requirements-gathering-agent';