import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { TestStrategyTemplate } from './TestStrategyTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Test Strategy document.
 */
export class TestStrategyProcessor implements DocumentProcessor {
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
          content: `You are an expert Quality Assurance Manager and Test Strategy expert with extensive experience in creating comprehensive test strategies.

**YOUR TASK:**
Generate a detailed "Test Strategy" document based on the provided project context.

**PROCESS:**
1. **Context Analysis:** Analyze the project requirements, architecture, and constraints to understand testing needs.
2. **Risk Assessment:** Identify potential quality risks and testing challenges.
3. **Strategy Definition:** Define comprehensive testing approach covering all test levels and types.
4. **Resource Planning:** Identify testing resources, tools, and environment requirements.
5. **Quality Metrics:** Define measurable quality criteria and success metrics.

The output must be professional, comprehensive, and actionable for the testing team and stakeholders.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Test Strategy',
        content
      };
    } catch (error) {
      console.error('Error in TestStrategyProcessor:', error);
      
      if (error instanceof ExpectedError) {
        throw error;
      }

      const template = new TestStrategyTemplate();
      const fallbackContent = template.generate(context);
      
      return {
        title: 'Test Strategy',
        content: fallbackContent
      };
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the provided project context, create a comprehensive test strategy document that includes:

## Test Strategy

### 1. Testing Objectives and Goals
- Define clear, measurable testing objectives aligned with business requirements
- Specify quality criteria and acceptance thresholds
- Establish success metrics and KPIs for testing activities

### 2. Test Scope and Approach
- Define what will and will not be tested (in-scope vs out-of-scope)
- Identify test levels: Unit Testing, Integration Testing, System Testing, Acceptance Testing
- Specify testing types: Functional, Non-functional, Performance, Security, Compatibility, Usability
- Define risk-based testing priorities and critical path testing

### 3. Test Environment Strategy
- Define test environment requirements and configurations
- Specify test data management approach and data privacy considerations
- Identify environment dependencies, integrations, and external systems
- Plan for test environment setup, maintenance, and refresh procedures

### 4. Test Organization and Roles
- Define testing team structure and individual responsibilities
- Identify required skills, competencies, and training needs
- Specify communication protocols and reporting structures
- Define escalation procedures and decision-making authority

### 5. Risk Assessment and Mitigation
- Identify key testing risks (technical, resource, schedule, quality)
- Assess probability and impact of identified risks
- Define specific risk mitigation strategies and contingency plans
- Establish risk monitoring and escalation procedures

### 6. Test Deliverables and Timeline
- Define all test deliverables (plans, cases, scripts, reports) and their owners
- Establish testing milestones, schedules, and dependencies
- Specify entry and exit criteria for each test phase
- Define review and approval processes for test deliverables

### 7. Tools and Technologies
- Identify required testing tools and frameworks (automation, management, defect tracking)
- Specify test automation strategy, tool selection criteria, and automation scope
- Define test data management tools and data generation strategies
- Plan for performance monitoring, security testing, and accessibility tools

### 8. Resource Planning and Budget
- Estimate testing effort, resource requirements, and skill allocation
- Plan for test environment infrastructure and licensing needs
- Define budget allocation for testing activities, tools, and training
- Identify external dependencies, vendor requirements, and third-party services

### 9. Quality Metrics and Reporting
- Define test coverage metrics and measurement criteria
- Specify defect metrics, classification, and tracking procedures
- Establish performance benchmarks and acceptance criteria
- Define reporting frequency, formats, and stakeholder communication

### 10. Continuous Improvement
- Define processes for capturing lessons learned and best practices
- Establish feedback loops and process improvement mechanisms
- Plan for testing process maturity assessment and enhancement
- Define knowledge transfer and documentation maintenance procedures

Context: ${JSON.stringify(context, null, 2)}

Please provide a comprehensive test strategy document in markdown format with detailed sections covering all aspects of the testing approach.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated test strategy content is empty');
    }

    if (content === this.createPrompt({} as ProjectContext)) {
      throw new ExpectedError('AI returned the prompt instead of generating test strategy content');
    }

    const requiredSections = [
      'testing objectives',
      'test scope',
      'test approach',
      'risk assessment',
      'test organization',
      'deliverables',
      'tools',
      'resource planning'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      console.warn(`Test Strategy document may be missing sections: ${missingSections.join(', ')}`);
    }

    // Additional validation for test strategy specific content
    const testStrategyKeywords = [
      'test',
      'quality',
      'defect',
      'automation',
      'environment',
      'coverage'
    ];

    const hasTestStrategyContent = testStrategyKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (!hasTestStrategyContent) {
      throw new ExpectedError('Generated content does not appear to be a test strategy document');
    }
  }
}
