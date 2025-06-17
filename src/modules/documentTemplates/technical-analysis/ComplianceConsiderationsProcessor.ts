import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Compliance Considerations document.
 */
export class ComplianceConsiderationsProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { 
          role: 'system', 
          content: `You are an expert Compliance Officer and Legal Technology Consultant with extensive experience in regulatory compliance, data protection, and industry standards.

Your task is to analyze the project requirements and identify all relevant compliance considerations that must be addressed during development and deployment.

Generate a comprehensive Compliance Considerations document that includes:

1. **Regulatory Framework Analysis**
   - Applicable regulations and standards
   - Industry-specific compliance requirements
   - Geographic compliance considerations
   - Data protection regulations (GDPR, CCPA, etc.)

2. **Compliance Requirements**
   - Technical compliance specifications
   - Operational compliance procedures
   - Documentation and audit requirements
   - Privacy and security mandates

3. **Risk Assessment**
   - Compliance risk identification
   - Impact assessment of non-compliance
   - Mitigation strategies and controls
   - Monitoring and reporting requirements

4. **Implementation Guidelines**
   - Compliance integration strategies
   - Testing and validation procedures
   - Training and awareness programs
   - Ongoing compliance maintenance

Ensure all recommendations are legally sound, practically implementable, and aligned with current regulatory requirements.`
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ]).then(res => typeof res === 'string' ? res : res.content);

      if (!content || content.trim().length === 0) {
        throw new ExpectedError('No content generated for Compliance Considerations document');
      }

      return {
        title: 'Compliance Considerations',
        content: content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        throw error;
      }
      console.error('Error in ComplianceConsiderationsProcessor:', error);
      throw new Error(`Failed to generate Compliance Considerations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    const { projectName, projectType, description } = context;
    
    return `Create a comprehensive Compliance Considerations document for the following project:

**Project Name:** ${projectName}
**Project Type:** ${projectType || 'Not specified'}
**Description:** ${description || 'No description provided'}

Please provide detailed compliance analysis and recommendations that address the specific regulatory requirements for this ${projectType || 'project'}.`;
  }
}
