import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { PerformanceTestPlanTemplate } from './PerformanceTestPlanTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Performance Test Plan document.
 */
export class PerformanceTestPlanProcessor implements DocumentProcessor {
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
          content: `You are an expert Performance Test Engineer and Quality Assurance professional with extensive experience in creating comprehensive performance test plans.

**YOUR TASK:**
Generate a detailed "Performance Test Plan" document based on the provided project context.

**PROCESS:**
1. **Performance Analysis:** Define performance requirements and success criteria
2. **Test Strategy:** Establish performance testing approach and methodologies
3. **Test Design:** Create specific performance test scenarios and configurations
4. **Tool Selection:** Recommend appropriate performance testing tools and setup
5. **Execution Planning:** Define test execution schedule and resource requirements

The output must be professional, technically precise, and actionable for performance testing teams.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Performance Test Plan',
        content
      };
    } catch (error) {
      console.error('Error in PerformanceTestPlanProcessor:', error);
      
      if (error instanceof ExpectedError) {
        throw error;
      }

      const template = new PerformanceTestPlanTemplate();
      const fallbackContent = template.generate(context);
      
      return {
        title: 'Performance Test Plan',
        content: fallbackContent
      };
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the provided project context, create a comprehensive performance test plan that includes:

## Performance Test Plan

### 1. Performance Test Overview
- Performance testing objectives and goals
- Success criteria and performance benchmarks
- Testing scope and limitations
- Performance risk assessment

### 2. Performance Requirements
Define specific performance requirements:
- **Response Time Requirements:** Maximum acceptable response times for different operations
- **Throughput Requirements:** Expected transaction volumes and concurrent user capacity
- **Resource Utilization Limits:** CPU, memory, disk, and network usage thresholds
- **Scalability Targets:** System growth and scaling requirements
- **Availability Requirements:** Uptime and reliability expectations

### 3. Performance Test Types and Approach
- **Load Testing:** Normal expected load testing scenarios
- **Stress Testing:** Beyond normal capacity testing to identify breaking points
- **Volume Testing:** Large amounts of data processing validation
- **Spike Testing:** Sudden load increase handling verification
- **Endurance Testing:** Extended period performance validation
- **Capacity Testing:** Maximum system capacity identification

### 4. Test Environment and Infrastructure
- Performance test environment specifications
- Hardware and software requirements
- Network configuration and bandwidth considerations
- Test data requirements and generation strategies
- Environment monitoring and instrumentation setup

### 5. Performance Test Scenarios
Create detailed test scenarios including:
- **User Journey Scenarios:** Real-world user interaction patterns
- **Business Process Scenarios:** Critical business function performance
- **System Integration Scenarios:** End-to-end process performance
- **Background Process Scenarios:** Batch jobs and scheduled task performance
- **Peak Load Scenarios:** Maximum expected system usage patterns

### 6. Test Tools and Technologies
- **Performance Testing Tools:** Tool selection and configuration
- **Monitoring Tools:** System and application performance monitoring
- **Data Analysis Tools:** Performance data analysis and reporting
- **Load Generation:** Distributed load generation setup
- **Test Automation:** Automated test execution and reporting

### 7. Test Execution Strategy
- **Test Execution Schedule:** Timeline for different test phases
- **Resource Allocation:** Team members and infrastructure requirements
- **Test Data Management:** Data setup, refresh, and cleanup procedures
- **Result Collection:** Performance metrics gathering and storage
- **Issue Management:** Performance defect identification and tracking

### 8. Performance Metrics and KPIs
- **Response Time Metrics:** Average, median, 95th percentile response times
- **Throughput Metrics:** Transactions per second, requests per minute
- **System Resource Metrics:** CPU, memory, disk, network utilization
- **Error Rate Metrics:** Error percentage and error distribution
- **Availability Metrics:** System uptime and reliability measurements

### 9. Success Criteria and Acceptance Thresholds
- **Performance Benchmarks:** Minimum acceptable performance levels
- **Pass/Fail Criteria:** Clear criteria for test success or failure
- **Performance Targets:** Optimal performance goals and objectives
- **Escalation Thresholds:** Performance degradation warning levels
- **Business Impact Assessment:** Performance impact on business operations

### 10. Risk Management and Contingency Planning
- **Performance Risks:** Identified risks and their potential impact
- **Risk Mitigation Strategies:** Plans to address performance risks
- **Contingency Plans:** Alternative approaches if performance targets are not met
- **Performance Optimization:** Strategies for performance improvement
- **Go/No-Go Decision Criteria:** Release decision factors based on performance

Context: ${JSON.stringify(context, null, 2)}

Please provide a comprehensive performance test plan with specific scenarios, metrics, tools, and execution strategies tailored to the project requirements.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated performance test plan content is empty');
    }

    if (content === this.createPrompt({} as ProjectContext)) {
      throw new ExpectedError('AI returned the prompt instead of generating performance test plan content');
    }

    const requiredSections = [
      'performance',
      'test plan',
      'load testing',
      'response time',
      'throughput',
      'metrics',
      'scenarios'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      console.warn(`Performance Test Plan document may be missing sections: ${missingSections.join(', ')}`);
    }

    // Additional validation for performance test plan specific content
    const performanceTestKeywords = [
      'performance',
      'load',
      'stress',
      'throughput',
      'response time',
      'scalability',
      'benchmark'
    ];

    const hasPerformanceTestContent = performanceTestKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (!hasPerformanceTestContent) {
      throw new ExpectedError('Generated content does not appear to be performance test plan documentation');
    }
  }
}
