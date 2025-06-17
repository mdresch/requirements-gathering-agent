import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { QualityMetricsTemplate } from './QualityMetricsTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Quality Metrics document.
 */
export class QualityMetricsProcessor implements DocumentProcessor {
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
          content: `You are an expert Quality Assurance Manager and Metrics Analyst with extensive experience in defining and tracking quality metrics.

**YOUR TASK:**
Generate a detailed "Quality Metrics" document based on the provided project context.

**PROCESS:**
1. **Metrics Definition:** Define comprehensive quality metrics and KPIs
2. **Measurement Criteria:** Establish clear measurement criteria and thresholds
3. **Tracking Methods:** Define how metrics will be collected and monitored
4. **Reporting Framework:** Create reporting structure and frequency
5. **Improvement Actions:** Define corrective actions based on metrics

The output must be professional, measurable, and actionable for quality management.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Quality Metrics',
        content
      };
    } catch (error) {
      console.error('Error in QualityMetricsProcessor:', error);
      
      if (error instanceof ExpectedError) {
        throw error;
      }

      const template = new QualityMetricsTemplate();
      const fallbackContent = template.generate(context);
      
      return {
        title: 'Quality Metrics',
        content: fallbackContent
      };
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the provided project context, create a comprehensive quality metrics document that includes:

## Quality Metrics Framework

### 1. Quality Metrics Overview
- Purpose and objectives of quality measurement
- Metrics framework and methodology
- Quality goals and targets
- Stakeholder expectations and success criteria

### 2. Process Quality Metrics
- **Development Process Metrics:**
  - Code review effectiveness
  - Defect injection rates by phase
  - Process compliance measurements
  - Development velocity and productivity

- **Testing Process Metrics:**
  - Test execution effectiveness
  - Test coverage measurements
  - Defect detection efficiency
  - Test automation coverage

### 3. Product Quality Metrics
- **Functional Quality:**
  - Requirements coverage
  - Feature completeness
  - User story acceptance rates
  - Business rule compliance

- **Technical Quality:**
  - Code quality metrics
  - Performance measurements
  - Security vulnerability assessment
  - Reliability and availability metrics

### 4. Defect Quality Metrics
- **Defect Discovery:**
  - Defect detection rates by phase
  - Defect density measurements
  - Defect distribution by severity
  - Defect aging and resolution time

- **Defect Prevention:**
  - Root cause analysis metrics
  - Defect prevention effectiveness
  - Process improvement impact
  - Recurring defect patterns

### 5. Customer Quality Metrics
- **User Satisfaction:**
  - User acceptance test results
  - Customer satisfaction scores
  - System usability measurements
  - User experience metrics

- **Production Quality:**
  - System availability and uptime
  - Performance under load
  - Production defect rates
  - Mean time to recovery

### 6. Quality Reporting and Dashboards
- **Metrics Collection Methods:**
  - Automated data collection
  - Manual measurement procedures
  - Tool integration and APIs
  - Data validation and accuracy

- **Reporting Framework:**
  - Dashboard design and KPIs
  - Reporting frequency and distribution
  - Trend analysis and insights
  - Action item tracking

### 7. Quality Improvement Actions
- **Threshold Management:**
  - Quality gates and criteria
  - Escalation procedures
  - Corrective action triggers
  - Continuous improvement processes

- **Metrics Analysis:**
  - Trend identification and analysis
  - Root cause investigation
  - Improvement opportunity identification
  - Success measurement and validation

Context: ${JSON.stringify(context, null, 2)}

Please provide a comprehensive quality metrics framework with specific metrics, measurement criteria, targets, and reporting mechanisms tailored to the project context.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated quality metrics content is empty');
    }

    if (content === this.createPrompt({} as ProjectContext)) {
      throw new ExpectedError('AI returned the prompt instead of generating quality metrics content');
    }

    const requiredSections = [
      'quality metrics',
      'measurement',
      'kpi',
      'defect',
      'coverage',
      'performance',
      'reporting'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      console.warn(`Quality Metrics document may be missing sections: ${missingSections.join(', ')}`);
    }

    // Additional validation for quality metrics specific content
    const qualityMetricsKeywords = [
      'metric',
      'measure',
      'target',
      'threshold',
      'kpi',
      'quality',
      'performance',
      'defect'
    ];

    const hasQualityMetricsContent = qualityMetricsKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (!hasQualityMetricsContent) {
      throw new ExpectedError('Generated content does not appear to be quality metrics documentation');
    }
  }
}
