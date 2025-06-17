import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { CommonchallengesuserpersonasTemplate } from '../basic-docs/CommonchallengesuserpersonasTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Common Challenges User Personas Analysis document.
 * Generates comprehensive analysis of shared difficulties across user personas in project documentation, 
 * processes, and lifecycle management to enhance Requirements Gathering Agent usability and effectiveness.
 * 
 * This processor analyzes five critical challenge categories:
 * 1. Documentation Complexity - Information overload, inconsistent standards, accessibility issues
 * 2. Process Inefficiencies - Manual tasks, workflow bottlenecks, context switching
 * 3. Communication & Collaboration Gaps - Stakeholder misalignment, information silos, feedback delays
 * 4. Quality Control & Validation Issues - Inconsistent standards, manual reviews, late discovery
 * 5. Project Lifecycle Management - Phase transitions, scope creep, knowledge transfer
 * 
 * The analysis includes:
 * - Multi-persona impact assessment with quantified business metrics
 * - Actionable solution strategies for Requirements Gathering Agent enhancements
 * - Implementation roadmaps with phased approaches and success criteria
 * - ROI analysis and risk mitigation strategies
 * - Prioritization matrix based on impact and feasibility
 * 
 * Serves requirements analysts in making informed decisions about system enhancements
 * to address root causes of common challenges across all user personas.
 */
export class CommonchallengesuserpersonasProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior UX researcher, process optimization consultant, and requirements specialist with expertise in identifying and solving complex user challenges in project documentation and lifecycle management. You excel at conducting comprehensive multi-persona challenge analysis, quantifying business impacts, and developing actionable solution strategies. Generate comprehensive, data-driven analysis of common challenges across user personas to guide strategic enhancement decisions for the Requirements Gathering Agent. Focus on providing measurable insights, prioritized recommendations, and practical implementation roadmaps that address root causes and deliver quantifiable business value.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Common Challenges User Personas Analysis',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Common Challenges User Personas processing:', error.message);
        throw new Error(`Failed to generate Common Challenges User Personas Analysis: ${error.message}`);
      } else {
        console.error('Unexpected error in Common Challenges User Personas processing:', error);
        throw new Error('An unexpected error occurred while generating Common Challenges User Personas Analysis');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new CommonchallengesuserpersonasTemplate(context);
    const exampleStructure = template.generateContent();

    return `As an expert UX researcher, process analyst, and requirements specialist, conduct a comprehensive analysis of common challenges faced by user personas when dealing with project documentation, processes, and project lifecycle management.

Project Context:
- Name: ${context.projectName || 'Requirements Gathering Agent'}
- Type: ${context.projectType || 'Requirements Analysis Tool'}
- Description: ${context.description || 'AI-powered tool for streamlining requirements gathering and addressing common project challenges'}

Requirements Analyst User Story:
"As a requirements analyst, I want to identify common challenges across the user personas, so that I can address these challenges in the Requirements Gathering Agent and enhance its usability and effectiveness."

Core Analysis Framework:
Analyze challenges across these 5 critical categories affecting all user personas:

1. **Documentation Complexity Challenges**
   - Information overload and inconsistent standards
   - Version control and accessibility issues
   - Technical jargon vs. business language barriers
   - Format standardization and template consistency

2. **Process Inefficiency Challenges**
   - Manual repetitive tasks and workflow bottlenecks
   - Context switching between multiple tools
   - Redundant activities and approval delays
   - Resource planning and effort estimation difficulties

3. **Communication & Collaboration Challenges**
   - Stakeholder misalignment and information silos
   - Feedback delays and language barriers
   - Cross-functional team coordination issues
   - Real-time collaboration and shared understanding

4. **Quality Control & Validation Challenges**
   - Inconsistent standards and manual review processes
   - Late issue discovery and compliance complexity
   - Validation workload and accuracy concerns
   - Progressive quality assurance throughout lifecycle

5. **Project Lifecycle Management Challenges**
   - Phase transition difficulties and scope creep
   - Knowledge transfer issues and resource planning
   - Change management and impact analysis
   - Requirement traceability and history tracking

User Personas to Analyze:
- **Requirements Analyst:** Core documentation and analysis responsibilities
- **Project Manager:** Coordination, oversight, and timeline management
- **Business Stakeholder:** Communication, clarity, and value delivery needs
- **Development Team Lead:** Technical translation and implementation challenges
- **Quality Assurance Specialist:** Validation, compliance, and testing difficulties

Use the following comprehensive structure as a reference (customize for the specific project context):

${exampleStructure}

Detailed Analysis Requirements:
1. **Challenge Identification:** Identify specific pain points affecting multiple personas
2. **Impact Assessment:** Quantify frequency, severity, and business impact of each challenge
3. **Root Cause Analysis:** Determine underlying causes for each challenge category
4. **Solution Strategy:** Develop targeted enhancement opportunities for Requirements Gathering Agent
5. **Success Metrics:** Define measurable KPIs and expected outcomes
6. **Implementation Roadmap:** Provide phased approach with clear milestones
7. **Risk Mitigation:** Address potential risks in challenge resolution
8. **ROI Analysis:** Calculate expected return on investment for solutions

Critical Success Factors:
- Focus on challenges that impact 3+ user personas simultaneously
- Provide actionable, measurable solution recommendations
- Include specific metrics for tracking challenge resolution effectiveness
- Prioritize solutions based on business impact and implementation feasibility
- Address root causes rather than symptoms
- Ensure solutions align with requirements analyst needs and workflows
- Include progressive implementation approach with quick wins
- Provide clear success criteria and validation methods
- Consider change management and user adoption factors
- Balance comprehensive coverage with practical implementation

Quality Standards:
- Each challenge must include specific examples and quantified impact
- Solutions must be directly actionable within Requirements Gathering Agent context
- All metrics must be measurable and time-bound
- Implementation roadmap must include realistic timelines and resource requirements
- Risk mitigation strategies must address technical, adoption, and business risks
- Analysis must serve decision-making needs of requirements analysts
- Content must be structured for executive consumption and technical implementation
- Include both immediate tactical solutions and strategic long-term improvements`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has proper structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }

    // Ensure it contains comprehensive challenge analysis
    const requiredChallengeCategories = [
      'documentation complexity',
      'process inefficiencies', 
      'communication',
      'quality control',
      'lifecycle management'
    ];
    
    const contentLower = content.toLowerCase();
    const missingCategories = requiredChallengeCategories.filter(category => 
      !contentLower.includes(category.toLowerCase())
    );
    
    if (missingCategories.length > 2) {
      throw new ExpectedError(`Generated content is missing key challenge categories: ${missingCategories.join(', ')}`);
    }

    // Ensure it contains persona-specific analysis
    const requiredPersonas = ['requirements analyst', 'project manager', 'business stakeholder'];
    const missingPersonas = requiredPersonas.filter(persona => 
      !contentLower.includes(persona.toLowerCase())
    );
    
    if (missingPersonas.length > 1) {
      throw new ExpectedError(`Generated content is missing analysis for key personas: ${missingPersonas.join(', ')}`);
    }

    // Ensure it contains solution and enhancement content
    const solutionKeywords = ['solution', 'enhancement', 'improvement', 'strategy'];
    const hasSolutionContent = solutionKeywords.some(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    if (!hasSolutionContent) {
      throw new ExpectedError('Generated content does not appear to contain solution recommendations');
    }

    // Ensure it contains metrics and measurable outcomes
    const metricsKeywords = ['metric', 'kpi', 'measure', 'target', 'roi', '%'];
    const hasMetricsContent = metricsKeywords.some(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    if (!hasMetricsContent) {
      throw new ExpectedError('Generated content does not appear to contain metrics and measurable outcomes');
    }

    // Ensure it contains implementation guidance
    const implementationKeywords = ['implementation', 'roadmap', 'phase', 'timeline'];
    const hasImplementationContent = implementationKeywords.some(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    if (!hasImplementationContent) {
      throw new ExpectedError('Generated content does not appear to contain implementation guidance');
    }

    // Ensure it contains prioritization or impact analysis
    const prioritizationKeywords = ['priority', 'impact', 'critical', 'high', 'medium', 'low'];
    const hasPrioritizationContent = prioritizationKeywords.some(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    if (!hasPrioritizationContent) {
      throw new ExpectedError('Generated content does not appear to contain prioritization or impact analysis');
    }

    // Validate minimum content length for comprehensive analysis
    if (content.length < 5000) {
      throw new ExpectedError('Generated content appears too short for comprehensive challenge analysis');
    }
  }
}
