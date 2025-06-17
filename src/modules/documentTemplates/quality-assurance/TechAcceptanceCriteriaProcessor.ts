import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { TechAcceptanceCriteriaTemplate } from './TechAcceptanceCriteriaTemplate.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the Technical Acceptance Criteria document.
 */
export class TechAcceptanceCriteriaProcessor implements DocumentProcessor {
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
          content: `You are an expert Technical Analyst and Requirements Engineer with extensive experience in defining technical acceptance criteria.

**YOUR TASK:**
Generate detailed "Technical Acceptance Criteria" based on the provided project context.

**PROCESS:**
1. **Requirements Analysis:** Break down technical requirements into testable criteria
2. **Criteria Definition:** Define specific, measurable, and verifiable acceptance criteria
3. **Test Scenarios:** Create scenarios that validate each acceptance criterion
4. **Success Metrics:** Define quantifiable success measures for each criterion
5. **Validation Methods:** Specify how each criterion will be validated and verified

The output must be professional, technically precise, and actionable for development and testing teams.` 
        },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Technical Acceptance Criteria',
        content
      };
    } catch (error) {
      console.error('Error in TechAcceptanceCriteriaProcessor:', error);
      
      if (error instanceof ExpectedError) {
        throw error;
      }

      const template = new TechAcceptanceCriteriaTemplate();
      const fallbackContent = template.generate(context);
      
      return {
        title: 'Technical Acceptance Criteria',
        content: fallbackContent
      };
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the provided project context, create comprehensive technical acceptance criteria that includes:

## Technical Acceptance Criteria

### 1. Functional Technical Criteria
Define acceptance criteria for all technical functional requirements:
- **API Functionality:** Endpoint behavior, request/response formats, error handling
- **Data Processing:** Data validation, transformation, storage, and retrieval
- **Business Logic:** Algorithm implementation, calculation accuracy, rule enforcement
- **Integration Points:** External system interactions, data exchange, protocol compliance
- **User Interface:** Technical UI requirements, responsiveness, accessibility compliance

### 2. Performance Acceptance Criteria
Specify measurable performance requirements:
- **Response Time:** Maximum acceptable response times for different operations
- **Throughput:** Required transaction processing capacity and concurrent user support
- **Resource Utilization:** CPU, memory, disk, and network usage limits
- **Scalability:** System behavior under increasing load and data volume
- **Load Handling:** Performance under peak usage conditions

### 3. Security Acceptance Criteria
Define security-related technical requirements:
- **Authentication:** User identity verification mechanisms and security
- **Authorization:** Access control and permission enforcement
- **Data Protection:** Encryption requirements for data at rest and in transit
- **Input Validation:** Protection against injection attacks and malicious input
- **Security Headers:** Required HTTP security headers and configurations

### 4. Reliability and Availability Criteria
Specify system reliability requirements:
- **Uptime Requirements:** System availability percentages and maintenance windows
- **Error Handling:** Graceful error handling and recovery mechanisms
- **Fault Tolerance:** System behavior during component failures
- **Data Integrity:** Data consistency and corruption prevention
- **Backup and Recovery:** Data backup and disaster recovery requirements

### 5. Compatibility and Integration Criteria
Define compatibility requirements:
- **Browser Compatibility:** Supported browsers and versions
- **Platform Compatibility:** Operating system and device support
- **API Compatibility:** Version compatibility and backward compatibility
- **Third-party Integration:** External service integration requirements
- **Legacy System Integration:** Compatibility with existing systems

### 6. Quality and Maintainability Criteria
Specify code and system quality requirements:
- **Code Quality:** Code coverage, complexity, and maintainability metrics
- **Documentation:** Technical documentation completeness and accuracy
- **Testing Requirements:** Unit, integration, and system test coverage
- **Monitoring and Logging:** System observability and diagnostic capabilities
- **Configuration Management:** Environment configuration and deployment requirements

### 7. Validation Methods and Test Scenarios
For each acceptance criterion, specify:
- **Validation Method:** How the criterion will be verified (automated/manual testing)
- **Test Scenarios:** Specific test cases that validate the criterion
- **Success Metrics:** Quantifiable measures that indicate criterion satisfaction
- **Failure Conditions:** Conditions that indicate criterion failure
- **Acceptance Threshold:** Minimum acceptable performance or quality levels

Context: ${JSON.stringify(context, null, 2)}

Please provide comprehensive technical acceptance criteria with specific, measurable, and testable requirements for all aspects of the system.`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated technical acceptance criteria content is empty');
    }

    if (content === this.createPrompt({} as ProjectContext)) {
      throw new ExpectedError('AI returned the prompt instead of generating technical acceptance criteria content');
    }

    const requiredSections = [
      'acceptance criteria',
      'functional',
      'performance',
      'security',
      'validation',
      'test',
      'requirements'
    ];

    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      console.warn(`Technical Acceptance Criteria document may be missing sections: ${missingSections.join(', ')}`);
    }

    // Additional validation for technical acceptance criteria specific content
    const techAcceptanceKeywords = [
      'criteria',
      'requirement',
      'specification',
      'validation',
      'verification',
      'acceptance',
      'technical'
    ];

    const hasTechAcceptanceContent = techAcceptanceKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (!hasTechAcceptanceContent) {
      throw new ExpectedError('Generated content does not appear to be technical acceptance criteria documentation');
    }
  }
}
