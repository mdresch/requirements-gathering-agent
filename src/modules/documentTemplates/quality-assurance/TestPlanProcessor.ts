import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { TestPlanTemplate } from './TestPlanTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Test Plan document.
 */
export class TestPlanProcessor implements DocumentProcessor {
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
          content: `You are an expert Test Manager and Quality Assurance professional with extensive experience in creating comprehensive test plans.

**YOUR TASK:**
Generate a detailed "Test Plan" document based on the provided project context.

**PROCESS:**
1. **Scope Analysis:** Define what will be tested, test levels, and testing types
2. **Resource Planning:** Identify testing resources, roles, and responsibilities
3. **Schedule Planning:** Create realistic testing timelines and milestones
4. **Risk Assessment:** Identify testing risks and mitigation strategies
5. **Quality Criteria:** Define clear pass/fail criteria and success metrics

The output must be professional, detailed, and actionable for the testing team.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Test Plan',
        content
      };
    } catch (error) {
      console.error('Error in TestPlanProcessor:', error);
      
      if (error instanceof ExpectedError) {
        throw error;
      }

      const template = new TestPlanTemplate();
      const fallbackContent = template.generate(context);
      
      return {
        title: 'Test Plan',
        content: fallbackContent
      };
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the provided project context, create a comprehensive test plan document that includes:

## Test Plan

### 1. Test Plan Overview
- Document purpose, scope, and objectives
- Project background and context
- Test plan assumptions and constraints

### 2. Test Items and Features
- Detailed list of features/modules to be tested
- Version identification and build information
- Dependencies and integration points

### 3. Test Approach and Strategy
- Testing levels (unit, integration, system, acceptance)
- Testing types (functional, performance, security, usability)
- Test design techniques and methodologies
- Automation strategy and tool selection

### 4. Test Environment Requirements
- Hardware and software requirements
- Test data requirements and management
- Environment setup and configuration procedures
- Access requirements and security considerations

### 5. Test Schedule and Milestones
- Detailed testing timeline with phases
- Key milestones and deliverables
- Dependencies and critical path analysis
- Resource allocation across timeline

### 6. Test Team Organization
- Roles and responsibilities matrix
- Required skills and competencies
- Communication and reporting structure
- Escalation procedures

### 7. Entry and Exit Criteria
- Entry criteria for each test phase
- Exit criteria and definition of done
- Suspension and resumption criteria
- Risk-based decision points

### 8. Test Deliverables
- Test cases and test scripts
- Test execution reports and metrics
- Defect reports and analysis
- Test completion reports

### 9. Risk Management
- Identified testing risks with impact assessment
- Risk mitigation strategies and contingency plans
- Risk monitoring and escalation procedures

### 10. Approval and Sign-off
- Review and approval process
- Stakeholder sign-off requirements
- Change management procedures

Context: ${JSON.stringify(context, null, 2)}

Please provide a comprehensive test plan document in markdown format with detailed sections covering all aspects of the testing approach and execution plan.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated test plan content is empty');
    }

    if (content === this.createPrompt({} as ProjectContext)) {
      throw new ExpectedError('AI returned the prompt instead of generating test plan content');
    }

    const requiredSections = [
      'test plan',
      'test items',
      'test approach',
      'schedule',
      'team',
      'criteria',
      'deliverables',
      'risk'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      console.warn(`Test Plan document may be missing sections: ${missingSections.join(', ')}`);
    }

    // Additional validation for test plan specific content
    const testPlanKeywords = [
      'test',
      'testing',
      'quality',
      'validation',
      'verification',
      'execution'
    ];

    const hasTestPlanContent = testPlanKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (!hasTestPlanContent) {
      throw new ExpectedError('Generated content does not appear to be a test plan document');
    }
  }
}
