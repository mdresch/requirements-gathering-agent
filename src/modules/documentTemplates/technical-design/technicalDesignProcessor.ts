import { AIProcessor } from '../../ai/AIProcessor';
import type { ProjectContext } from '../../ai/types';
import type { DocumentOutput } from '../../documentGenerator/types';
import type { DocumentProcessor } from '../../documentGenerator/types';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

export class ArchitectureDesignProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior software architect with expertise in system design and documentation.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Architecture Design Document',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Architecture Design Document processing:', error.message);
        throw new Error(`Failed to generate Architecture Design Document: ${error.message}`);
      } else {
        console.error('Unexpected error in Architecture Design Document processing:', error);
        throw new Error('An unexpected error occurred while generating Architecture Design Document');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Architecture Design Document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. System Overview
2. Architecture Principles
3. System Components
4. Component Interactions
5. Data Flow
6. Technology Stack
7. Security Considerations
8. Scalability Design
9. Performance Considerations
10. Integration Points

Requirements:
1. Be specific to this project's needs
2. Include diagrams placeholders where appropriate
3. Follow industry best practices
4. Consider scalability and maintainability
5. Address security concerns`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for an architecture document');
    }
  }
}

export class SystemDesignProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior software architect with expertise in system design and documentation.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'System Design Specification',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in System Design Specification processing:', error.message);
        throw new Error(`Failed to generate System Design Specification: ${error.message}`);
      } else {
        console.error('Unexpected error in System Design Specification processing:', error);
        throw new Error('An unexpected error occurred while generating System Design Specification');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a detailed System Design Specification.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. System Purpose and Scope
2. System Architecture
3. Module Descriptions
4. Interface Specifications
5. Data Structures
6. Processing Logic
7. Error Handling
8. Performance Requirements
9. System Constraints
10. Dependencies

Requirements:
1. Be specific to this project's needs
2. Include technical diagrams placeholders
3. Define clear interfaces
4. Specify error handling mechanisms
5. Document performance requirements`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for a system design document');
    }
  }
}

export class DatabaseSchemaProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a database architect with expertise in schema design and optimization.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Database Schema Design',
        content
      };
    } catch (error) {
      console.error('Error processing Database Schema Design:', error);
      throw new Error(`Failed to generate Database Schema Design: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Database Schema Design document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Database Overview
2. Entity Relationships
3. Table Definitions
4. Data Types
5. Indexes and Keys
6. Constraints
7. Normalization Strategy
8. Performance Considerations
9. Data Migration Strategy
10. Backup and Recovery

Requirements:
1. Follow database design best practices
2. Include ERD diagram placeholders
3. Define clear relationships
4. Consider scalability
5. Address data integrity`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for a database schema document');
    }
  }
}

export class APIDocumentationProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an API documentation specialist with expertise in RESTful services.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'API Documentation',
        content
      };
    } catch (error) {
      console.error('Error processing API Documentation:', error);
      throw new Error(`Failed to generate API Documentation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive API Documentation.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. API Overview
2. Authentication Methods
3. Endpoint Definitions
4. Request/Response Formats
5. Error Codes
6. Rate Limiting
7. Versioning Strategy
8. Security Considerations
9. Example Usage
10. Testing Guidelines

Requirements:
1. Follow OpenAPI/Swagger standards
2. Include clear examples
3. Document all error scenarios
4. Address security concerns
5. Provide usage guidelines`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for API documentation');
    }
  }
}

export class SecurityDesignProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a security architect with expertise in application security design.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Security Design Document',
        content
      };
    } catch (error) {
      console.error('Error processing Security Design Document:', error);
      throw new Error(`Failed to generate Security Design Document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Security Design Document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Security Overview
2. Authentication Design
3. Authorization Framework
4. Data Protection
5. Network Security
6. Security Controls
7. Threat Modeling
8. Security Testing Strategy
9. Incident Response Plan
10. Compliance Requirements

Requirements:
1. Follow security best practices
2. Address common vulnerabilities
3. Include security patterns
4. Consider regulatory compliance
5. Define security monitoring`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for a security design document');
    }
  }
}

export class PerformanceRequirementsProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a performance engineering expert with expertise in system optimization.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Performance Requirements',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in Performance Requirements processing:', error.message);
        throw new Error(`Failed to generate Performance Requirements: ${error.message}`);
      } else {
        console.error('Unexpected error in Performance Requirements processing:', error);
        throw new Error('An unexpected error occurred while generating Performance Requirements');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive Performance Requirements.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Performance Goals
2. Response Time Requirements
3. Throughput Expectations
4. Scalability Requirements
5. Resource Utilization
6. Load Handling
7. Caching Strategy
8. Performance Metrics
9. Monitoring Requirements
10. Performance Testing Plan

Requirements:
1. Define measurable metrics
2. Include baseline requirements
3. Specify monitoring needs
4. Address scalability
5. Consider resource constraints`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for performance requirements');
    }
  }
}

export class IntegrationDesignProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a systems integration architect with expertise in enterprise integration patterns.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Integration Design',
        content
      };
    } catch (error) {
      console.error('Error processing Integration Design:', error);
      throw new Error(`Failed to generate Integration Design: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Integration Design document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Integration Overview
2. Integration Patterns
3. System Interfaces
4. Data Flow Design
5. Error Handling
6. Integration Points
7. Message Formats
8. Integration Security
9. Performance Considerations
10. Monitoring Strategy

Requirements:
1. Follow integration best practices
2. Define clear interfaces
3. Address error scenarios
4. Consider scalability
5. Document dependencies`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for integration design');
    }
  }
}

export class TechnicalStackProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a technical architect with expertise in modern technology stacks.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Technical Stack Overview',
        content
      };
    } catch (error) {
      console.error('Error processing Technical Stack Overview:', error);
      throw new Error(`Failed to generate Technical Stack Overview: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Technical Stack Overview.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Technology Stack Overview
2. Frontend Technologies
3. Backend Technologies
4. Database Technologies
5. Infrastructure Components
6. Development Tools
7. Testing Tools
8. Monitoring Tools
9. Deployment Tools
10. Version Control and CI/CD

Requirements:
1. Justify technology choices
2. Consider scalability needs
3. Address maintainability
4. Include version information
5. Document dependencies`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for technical stack overview');
    }
  }
}

export class DeploymentArchitectureProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps architect with expertise in deployment architecture.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Deployment Architecture',
        content
      };
    } catch (error) {
      console.error('Error processing Deployment Architecture:', error);
      throw new Error(`Failed to generate Deployment Architecture: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Deployment Architecture document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Deployment Overview
2. Infrastructure Architecture
3. Environment Setup
4. Deployment Process
5. Configuration Management
6. Scaling Strategy
7. Monitoring Setup
8. Backup and Recovery
9. Disaster Recovery
10. Maintenance Procedures

Requirements:
1. Define deployment workflow
2. Include environment details
3. Address scalability
4. Consider security
5. Document dependencies`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for deployment architecture');
    }
  }
}

export class ErrorHandlingProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a software architect with expertise in error handling and system reliability.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Error Handling Guidelines',
        content
      };
    } catch (error) {
      console.error('Error processing Error Handling Guidelines:', error);
      throw new Error(`Failed to generate Error Handling Guidelines: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive Error Handling Guidelines.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Error Handling Strategy
2. Error Categories
3. Error Logging
4. Error Reporting
5. Recovery Procedures
6. Retry Mechanisms
7. Circuit Breakers
8. User Error Messages
9. Monitoring and Alerts
10. Troubleshooting Guide

Requirements:
1. Define error handling patterns
2. Include logging standards
3. Address user experience
4. Consider monitoring
5. Document recovery procedures`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for error handling guidelines');
    }
  }
}