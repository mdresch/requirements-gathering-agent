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
 * Processor for the Strategic Business Case document.
 */
export class StrategicbusinesscaseProcessor implements DocumentProcessor {
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
          content: `You are a strategic business analyst creating a comprehensive strategic business case document. 

**YOUR TASK:**
Generate a formal "Strategic Business Case" document based on the provided project context.

**PROCESS:**
1. **Strategic Context Analysis:** Analyze all provided information to understand strategic implications, market position, and long-term value creation opportunities.
2. **Strategic Alignment Assessment:** Evaluate how the project aligns with organizational strategy, competitive positioning, and market opportunities.
3. **Strategic Value Quantification:** Identify and quantify strategic benefits, competitive advantages, and long-term value creation potential.
4. **Strategic Risk Analysis:** Assess strategic risks, market threats, and competitive implications.
5. **Strategic Implementation Planning:** Develop strategic roadmap, resource requirements, and success metrics.
6. **Executive Strategic Recommendation:** Provide clear strategic recommendation with supporting rationale.

The output must be professional, strategic-focused, and suitable for executive leadership review.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Strategic Business Case',
        content
      };
    } catch (error) {
      console.error('Error in StrategicbusinesscaseProcessor:', error);
      
      if (error instanceof ExpectedError) {
        throw error;
      }

      return {
        title: 'Strategic Business Case',
        content: `# Strategic Business Case

*Error generating content: ${error instanceof Error ? error.message : 'Unknown error'}*

## Strategic Business Case Analysis

[Content could not be generated due to processing error]

### Executive Summary
- Strategic overview and business rationale
- Key value proposition  
- Expected strategic outcomes

### Strategic Alignment  
- Organizational strategy alignment
- Strategic objectives and goals
- Competitive advantage

### Strategic Investment Analysis
- Investment requirements
- Strategic ROI projections
- Long-term financial impact

### Strategic Risk Assessment
- Strategic risks and mitigation
- Market and competitive threats
- Operational considerations

### Strategic Implementation
- Strategic roadmap
- Resource requirements
- Change management

### Strategic Benefits
- Quantifiable benefits
- Intangible value creation
- Long-term strategic value

### Recommendations
- Strategic recommendations
- Next steps and actions
- Success criteria
`
      };
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the provided project context, create a detailed strategic business case document that includes:

## Strategic Business Case Analysis

### Executive Summary
- Strategic overview and business rationale
- Key value proposition
- Expected strategic outcomes

### Strategic Alignment
- How this initiative aligns with organizational strategy
- Strategic objectives and goals
- Competitive advantage and market positioning

### Strategic Investment Analysis
- Investment requirements and resource allocation
- Strategic ROI and value creation
- Long-term financial projections

### Strategic Risk Assessment
- Strategic risks and mitigation strategies
- Market risks and competitive threats
- Organizational and operational risks

### Strategic Implementation
- Strategic roadmap and milestones
- Resource requirements and capabilities
- Change management considerations

### Strategic Benefits
- Quantifiable strategic benefits
- Intangible value creation
- Long-term strategic value

### Recommendations
- Strategic recommendations
- Next steps and action items
- Success criteria and measurements

Context: ${JSON.stringify(context, null, 2)}

Please provide a comprehensive strategic business case document in markdown format.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    if (content === this.createPrompt({} as ProjectContext)) {
      throw new ExpectedError('AI returned the prompt instead of generating content');
    }

    const requiredSections = [
      'Strategic Business Case',
      'Executive Summary',
      'Strategic Alignment',
      'Strategic Investment',
      'Strategic Risk',
      'Strategic Implementation',
      'Strategic Benefits',
      'Recommendations'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      console.warn(`Strategic Business Case document may be missing sections: ${missingSections.join(', ')}`);
    }
  }
}
