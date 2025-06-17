import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { TestCasesTemplate } from './TestCasesTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Test Cases document.
 */
export class TestCasesProcessor implements DocumentProcessor {
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
          content: `You are an expert Test Analyst and Quality Assurance professional with extensive experience in creating comprehensive test cases.

**YOUR TASK:**
Generate a detailed "Test Cases" document based on the provided project context.

**PROCESS:**
1. **Requirements Analysis:** Break down requirements into testable scenarios
2. **Test Case Design:** Create detailed, step-by-step test cases
3. **Coverage Analysis:** Ensure comprehensive coverage of all functionality
4. **Validation Criteria:** Define clear expected results and pass/fail criteria
5. **Test Data Specification:** Identify required test data for each scenario

The output must be professional, detailed, and executable by any tester.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Test Cases',
        content
      };
    } catch (error) {
      console.error('Error in TestCasesProcessor:', error);
      
      if (error instanceof ExpectedError) {
        throw error;
      }

      const template = new TestCasesTemplate();
      const fallbackContent = template.generate(context);
      
      return {
        title: 'Test Cases',
        content: fallbackContent
      };
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the provided project context, create a comprehensive test cases document that includes:

## Test Cases Documentation

### 1. Test Case Overview
- Purpose and scope of test cases
- Test case naming conventions and identification
- Test case categories and priorities
- Traceability to requirements

### 2. Functional Test Cases
Create detailed test cases for each functional requirement including:
- **Test Case ID:** Unique identifier
- **Test Case Title:** Descriptive title
- **Objective:** What is being tested
- **Preconditions:** Setup requirements
- **Test Steps:** Detailed step-by-step actions
- **Expected Results:** Expected system behavior
- **Test Data:** Required input data
- **Priority:** Critical, High, Medium, Low
- **Requirements Traceability:** Link to requirements

### 3. User Interface Test Cases
- Navigation and menu functionality
- Form validation and data entry
- Display and layout verification
- Responsive design testing
- Accessibility compliance testing

### 4. Integration Test Cases
- API endpoint testing
- Database operations verification
- Third-party service integration
- Data flow between components
- Error handling and recovery

### 5. Performance Test Cases
- Load testing scenarios
- Stress testing conditions
- Volume testing parameters
- Response time verification
- Resource utilization monitoring

### 6. Security Test Cases
- Authentication testing
- Authorization verification
- Data protection validation
- Input validation and sanitization
- Security vulnerability testing

### 7. Negative Test Cases
- Invalid input handling
- Error condition testing
- Boundary value testing
- Exception handling verification
- System recovery testing

### 8. Regression Test Cases
- Core functionality verification
- Previously fixed defect retesting
- Integration point validation
- Performance regression checks
- Configuration change impact

### 9. Test Data Requirements
- Specific data sets for each test case
- Data setup and cleanup procedures
- Test data privacy and security
- Data generation and maintenance

### 10. Test Case Execution Guidelines
- Execution order and dependencies
- Environment prerequisites
- Test result documentation
- Defect reporting procedures

Context: ${JSON.stringify(context, null, 2)}

Please provide comprehensive test cases in a structured format with detailed steps, expected results, and all necessary information for test execution.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated test cases content is empty');
    }

    if (content === this.createPrompt({} as ProjectContext)) {
      throw new ExpectedError('AI returned the prompt instead of generating test cases content');
    }

    const requiredSections = [
      'test case',
      'test steps',
      'expected result',
      'functional',
      'validation',
      'verification'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      console.warn(`Test Cases document may be missing sections: ${missingSections.join(', ')}`);
    }

    // Additional validation for test cases specific content
    const testCaseKeywords = [
      'test',
      'step',
      'expected',
      'actual',
      'pass',
      'fail',
      'verify'
    ];

    const hasTestCaseContent = testCaseKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (!hasTestCaseContent) {
      throw new ExpectedError('Generated content does not appear to be test cases documentation');
    }
  }
}
