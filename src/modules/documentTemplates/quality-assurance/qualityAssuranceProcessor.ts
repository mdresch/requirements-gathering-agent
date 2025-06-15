import { AIProcessor } from '../../ai/AIProcessor';
import type { ProjectContext } from '../../ai/types';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types';

export class TestStrategyProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a QA architect with expertise in test strategy and planning.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Test Strategy Document',
        content
      };
    } catch (error) {
      console.error('Error processing Test Strategy Document:', error);
      throw new Error(`Failed to generate Test Strategy Document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Test Strategy Document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Testing Objectives
2. Testing Scope
3. Testing Types
4. Testing Approach
5. Testing Tools
6. Testing Environment
7. Testing Schedule
8. Resource Requirements
9. Risk Analysis
10. Quality Metrics

Requirements:
1. Define clear testing goals
2. Include all testing phases
3. Specify tools and resources
4. Address risk mitigation
5. Define success criteria`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for a test strategy document');
    }
  }
}

export class TestPlanProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a QA lead with expertise in test planning and execution.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Test Plan Template',
        content
      };
    } catch (error) {
      console.error('Error processing Test Plan Template:', error);
      throw new Error(`Failed to generate Test Plan Template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Test Plan Template.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Test Plan Overview
2. Test Items
3. Features to be Tested
4. Testing Tasks
5. Environmental Needs
6. Responsibilities
7. Schedule
8. Risks and Contingencies
9. Approvals
10. Test Deliverables

Requirements:
1. Follow IEEE 829 standard
2. Include all test phases
3. Define responsibilities
4. Address dependencies
5. Specify deliverables`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for a test plan template');
    }
  }
}

export class TestCaseProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a QA engineer with expertise in test case design.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Test Case Specifications',
        content
      };
    } catch (error) {
      console.error('Error processing Test Case Specifications:', error);
      throw new Error(`Failed to generate Test Case Specifications: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive Test Case Specifications.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Test Case Structure
2. Test Case Categories
3. Test Data Requirements
4. Preconditions
5. Test Steps
6. Expected Results
7. Pass/Fail Criteria
8. Test Environment
9. Test Dependencies
10. Traceability Matrix

Requirements:
1. Follow test case standards
2. Include clear steps
3. Define expected results
4. Specify test data
5. Include traceability`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for test case specifications');
    }
  }
}

export class QualityMetricsProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a quality assurance expert with expertise in quality metrics and measurements.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Quality Metrics Definition',
        content
      };
    } catch (error) {
      console.error('Error processing Quality Metrics Definition:', error);
      throw new Error(`Failed to generate Quality Metrics Definition: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive Quality Metrics Definitions.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Quality Objectives
2. Key Quality Indicators
3. Measurement Methods
4. Data Collection
5. Analysis Techniques
6. Reporting Format
7. Quality Targets
8. Improvement Process
9. Benchmarks
10. Review Process

Requirements:
1. Define measurable metrics
2. Include collection methods
3. Specify targets
4. Define thresholds
5. Include improvement process`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for quality metrics definition');
    }
  }
}

export class AcceptanceCriteriaProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a QA lead with expertise in acceptance testing and criteria definition.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Acceptance Criteria Template',
        content
      };
    } catch (error) {
      console.error('Error processing Acceptance Criteria Template:', error);
      throw new Error(`Failed to generate Acceptance Criteria Template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Acceptance Criteria Template.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Acceptance Criteria Structure
2. Business Requirements
3. Functional Requirements
4. Performance Requirements
5. User Experience Requirements
6. Security Requirements
7. Compliance Requirements
8. Testing Scenarios
9. Validation Methods
10. Sign-off Process

Requirements:
1. Follow SMART criteria
2. Include all requirement types
3. Define validation methods
4. Specify acceptance levels
5. Include sign-off process`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for acceptance criteria template');
    }
  }
}

export class PerformanceTestProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a performance testing expert with expertise in load testing and performance analysis.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Performance Test Plan',
        content
      };
    } catch (error) {
      console.error('Error processing Performance Test Plan:', error);
      throw new Error(`Failed to generate Performance Test Plan: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Performance Test Plan.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Performance Testing Goals
2. Test Scenarios
3. Load Profiles
4. Test Environment
5. Test Data
6. Performance Metrics
7. Test Tools
8. Test Schedule
9. Resource Requirements
10. Success Criteria

Requirements:
1. Define clear objectives
2. Include all test types
3. Specify metrics
4. Define thresholds
5. Include monitoring plan`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for performance test plan');
    }
  }
}

export class SecurityTestingProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a security testing expert with expertise in security assessments and penetration testing.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Security Testing Guidelines',
        content
      };
    } catch (error) {
      console.error('Error processing Security Testing Guidelines:', error);
      throw new Error(`Failed to generate Security Testing Guidelines: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive Security Testing Guidelines.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Security Testing Scope
2. Testing Methodology
3. Security Controls
4. Vulnerability Assessment
5. Penetration Testing
6. Security Tools
7. Test Environment
8. Reporting Format
9. Risk Assessment
10. Remediation Process

Requirements:
1. Follow security standards
2. Include all test types
3. Define methodology
4. Specify tools
5. Include reporting format`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for security testing guidelines');
    }
  }
}

export class CodeReviewProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior developer with expertise in code review practices and quality standards.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Code Review Checklist',
        content
      };
    } catch (error) {
      console.error('Error processing Code Review Checklist:', error);
      throw new Error(`Failed to generate Code Review Checklist: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Code Review Checklist.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Code Review Process
2. Code Quality Standards
3. Security Checks
4. Performance Checks
5. Documentation Requirements
6. Testing Requirements
7. Best Practices
8. Common Issues
9. Review Tools
10. Sign-off Criteria

Requirements:
1. Follow coding standards
2. Include security aspects
3. Address performance
4. Check documentation
5. Include best practices`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for code review checklist');
    }
  }
}

export class BugReportProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a QA engineer with expertise in defect management and reporting.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Bug Report Template',
        content
      };
    } catch (error) {
      console.error('Error processing Bug Report Template:', error);
      throw new Error(`Failed to generate Bug Report Template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Bug Report Template.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Bug Report Structure
2. Issue Description
3. Steps to Reproduce
4. Expected vs Actual Results
5. Environment Details
6. Screenshots/Logs
7. Severity Levels
8. Priority Levels
9. Status Workflow
10. Resolution Process

Requirements:
1. Clear issue description
2. Reproducible steps
3. Environment details
4. Severity guidelines
5. Resolution process`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for bug report template');
    }
  }
}

export class TestEnvironmentProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps engineer with expertise in test environment setup and management.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Test Environment Setup Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Test Environment Setup Guide:', error);
      throw new Error(`Failed to generate Test Environment Setup Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Test Environment Setup Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Environment Overview
2. Hardware Requirements
3. Software Requirements
4. Network Configuration
5. Database Setup
6. Test Data Management
7. Access Control
8. Monitoring Setup
9. Backup Procedures
10. Troubleshooting Guide

Requirements:
1. Clear setup steps
2. Include prerequisites
3. Define configurations
4. Address security
5. Include maintenance`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for test environment setup guide');
    }
  }
}