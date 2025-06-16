import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { CompanyValuesTemplate } from '../strategic-statements/CompanyValuesTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Company Values Processor - The "Business Communication Translator" for Core Values
 * Transforms abstract company ideas into clear, inspiring, and actionable core values documents.
 */
export class CompanyValuesProcessor implements DocumentProcessor {
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
          content: `You are an expert strategic communications consultant and culture officer. Your specialty is translating abstract company ideas into clear, inspiring, and actionable core values.

**YOUR ROLE AS BUSINESS COMMUNICATION TRANSLATOR:**
You transform informal inputs (README files, mission statements, leadership quotes, internal memos) into formal, professional Company Values documents that drive organizational alignment.

**CORE TRANSLATION PRINCIPLES:**
1. **Clarity over Complexity** - Make values understandable and memorable
2. **Action over Abstraction** - Focus on behaviors, not just concepts  
3. **Authenticity over Generic** - Reflect the specific organization's culture
4. **Impact over Inspiration** - Connect values to business success

**OUTPUT REQUIREMENTS:**
- Generate 3-5 distinct core values based on the provided context
- Each value must have: Clear Name, Definition, Business Rationale, Specific Behaviors
- Remove ALL instructional comments from the final output
- Ensure professional, executive-ready language throughout` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'CompanyValues',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in CompanyValues processing:', error.message);
        throw new Error(`Failed to generate CompanyValues: ${error.message}`);
      } else {
        console.error('Unexpected error in CompanyValues processing:', error);
        throw new Error('An unexpected error occurred while generating CompanyValues');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as structural guidance
    const template = new CompanyValuesTemplate(context);
    const templateStructure = template.generateContent();

    // Build enhanced context for values extraction
    const valuesContext = this.buildValuesContext(context);

    return `**BUSINESS COMMUNICATION TRANSLATOR TASK:**
Transform the provided organizational context into a formal Company Values document.

**SOURCE CONTEXT TO ANALYZE:**
Organization: ${context.projectName || 'Untitled Organization'}
Type/Domain: ${context.projectType || 'Not specified'}
Description: ${context.description || 'No description provided'}

**ENHANCED CONTEXT FOR VALUES EXTRACTION:**
${valuesContext}

**TRANSLATION PROCESS:**
1. **Analyze Context:** Review all provided information for explicit or implied cultural principles
2. **Identify Core Values:** Extract 3-5 distinct values that reflect the organization's DNA
3. **Synthesize Content:** For each value, create:
   - Clear, memorable name (e.g., "Customer Obsession," "Default to Transparency")
   - Concise definition specific to this organization
   - Business rationale explaining why it matters
   - 2-3 specific, actionable behavioral examples

**TEMPLATE STRUCTURE TO FOLLOW:**
${templateStructure}

**CRITICAL OUTPUT REQUIREMENTS:**
- Remove ALL instructional comments and placeholders from final output
- Use professional, executive-ready language throughout
- Ensure values are specific to this organization, not generic
- Make behavioral examples concrete and measurable
- Connect each value to business success and organizational culture
- Format as clean markdown without instructional text

**TRANSLATION GOAL:**
Convert informal organizational context into a strategic document that drives cultural alignment and guides decision-making.`;
  }

  private buildValuesContext(context: ProjectContext): string {
    let valuesContext = '';

    // Organizational context
    valuesContext += `**Common Organizational Value Categories:**\n`;
    valuesContext += `- Customer Focus: Customer obsession, user-centric design, service excellence\n`;
    valuesContext += `- Innovation: Creative thinking, continuous improvement, experimentation\n`;
    valuesContext += `- Integrity: Honesty, transparency, ethical behavior, accountability\n`;
    valuesContext += `- Collaboration: Teamwork, open communication, knowledge sharing\n`;
    valuesContext += `- Excellence: Quality standards, attention to detail, continuous learning\n`;
    valuesContext += `- Agility: Adaptability, speed, responsiveness to change\n\n`;

    // Industry-specific considerations
    if (context.projectType) {
      valuesContext += `**Industry Context (${context.projectType}):**\n`;
      valuesContext += `Consider values relevant to this specific domain and its unique challenges.\n\n`;
    }

    // Behavioral focus
    valuesContext += `**Behavioral Examples Framework:**\n`;
    valuesContext += `- Actions employees take daily (e.g., "Share documents publicly by default")\n`;
    valuesContext += `- Decision-making criteria (e.g., "Always ask: How does this serve our customers?")\n`;
    valuesContext += `- Interaction patterns (e.g., "Give feedback directly and kindly")\n`;
    valuesContext += `- Problem-solving approaches (e.g., "Start with data, validate with users")\n\n`;

    return valuesContext;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has some structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}
