import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types.js';
import { ImplementationGuidesTemplate } from './implementationGuidesTemplate.js';

/**
 * Implementation Guides Processor generates a comprehensive master document
 * that serves as an overview and navigation hub for all implementation guides.
 */
export class ImplementationGuidesProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;
  private template: ImplementationGuidesTemplate;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
    this.template = new ImplementationGuidesTemplate();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      // Generate the base template content
      const templateContent = this.template.generateContent(context);
      
      // Enhance with AI-generated project-specific insights
      const aiEnhancedContent = await this.enhanceWithAI(templateContent, context);
      
      await this.validateOutput(aiEnhancedContent);
      
      return {
        title: 'Implementation Guides Overview',
        content: aiEnhancedContent
      };
    } catch (error) {
      console.error('Error processing Implementation Guides Overview:', error);
      throw new Error(`Failed to generate Implementation Guides Overview: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async enhanceWithAI(templateContent: string, context: ProjectContext): Promise<string> {
    const prompt = this.createAIPrompt(context);
    
    const aiInsights = await this.aiProcessor.makeAICall([
      { 
        role: 'system', 
        content: 'You are a technical architect and DevOps expert with extensive experience in software implementation and deployment processes.' 
      },
      { role: 'user', content: prompt }
    ]).then(res => typeof res === 'string' ? res : res.content);

    // Replace the AI_INSIGHTS placeholder in the template
    return templateContent.replace('{{AI_INSIGHTS}}', aiInsights);
  }

  private createAIPrompt(context: ProjectContext): string {
    return `Based on the following project context, provide specific implementation guidance and insights:

Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

Please provide:
1. **Project-Specific Implementation Challenges**: Identify 3-5 key technical challenges this project type typically faces
2. **Recommended Implementation Order**: Suggest the optimal sequence for implementing the various guides
3. **Technology Stack Considerations**: Specific considerations for this project type
4. **Team Structure Recommendations**: How team size and composition affects implementation approach
5. **Risk Mitigation Strategies**: Key risks in implementation and how to address them

Format as markdown with clear sections. Be specific to ${context.projectType} projects and keep it practical and actionable.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 1000) {
      console.warn('Generated content seems unusually short for Implementation Guides Overview');
    }
    if (!content.includes('# Implementation Guides Overview')) {
      console.warn('Generated content may be missing the main heading');
    }
  }
}