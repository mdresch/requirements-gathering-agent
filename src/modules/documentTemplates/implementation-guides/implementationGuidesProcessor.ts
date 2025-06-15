import { AIProcessor } from '../../ai/AIProcessor';
import type { ProjectContext } from '../../ai/types';
import type { DocumentOutput, DocumentProcessor } from '../../documentGenerator/types';

export class CodingStandardsProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior developer with expertise in coding standards and best practices.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Coding Standards Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Coding Standards Guide:', error);
      throw new Error(`Failed to generate Coding Standards Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Coding Standards Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Code Style Guidelines
2. Naming Conventions
3. File Organization
4. Code Documentation
5. Error Handling
6. Testing Requirements
7. Performance Guidelines
8. Security Guidelines
9. Code Review Process
10. Best Practices

Requirements:
1. Clear coding standards
2. Language-specific rules
3. Include examples
4. Address maintainability
5. Define review process`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for coding standards guide');
    }
  }
}

export class DevelopmentSetupProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps engineer with expertise in development environment setup.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Development Setup Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Development Setup Guide:', error);
      throw new Error(`Failed to generate Development Setup Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Development Setup Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Prerequisites
2. Development Tools
3. Environment Setup
4. Configuration Steps
5. IDE Setup
6. Database Setup
7. Local Testing
8. Debugging Setup
9. Common Issues
10. Troubleshooting

Requirements:
1. Clear setup steps
2. Include prerequisites
3. Tool versions
4. Configuration details
5. Troubleshooting tips`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for development setup guide');
    }
  }
}

export class VersionControlProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a version control expert with expertise in Git workflows and best practices.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Version Control Guidelines',
        content
      };
    } catch (error) {
      console.error('Error processing Version Control Guidelines:', error);
      throw new Error(`Failed to generate Version Control Guidelines: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive Version Control Guidelines.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Version Control System
2. Branching Strategy
3. Commit Guidelines
4. Pull Request Process
5. Code Review Process
6. Merge Process
7. Release Tagging
8. Conflict Resolution
9. Best Practices
10. Common Issues

Requirements:
1. Clear workflow
2. Branch naming
3. Commit messages
4. Review process
5. Release process`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for version control guidelines');
    }
  }
}

export class CIPipelineProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps engineer with expertise in CI/CD pipeline design and implementation.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'CI/CD Pipeline Guide',
        content
      };
    } catch (error) {
      console.error('Error processing CI/CD Pipeline Guide:', error);
      throw new Error(`Failed to generate CI/CD Pipeline Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive CI/CD Pipeline Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Pipeline Overview
2. Build Process
3. Testing Strategy
4. Deployment Stages
5. Environment Configuration
6. Security Checks
7. Quality Gates
8. Monitoring
9. Rollback Process
10. Maintenance

Requirements:
1. Clear pipeline stages
2. Tool configuration
3. Security measures
4. Quality checks
5. Deployment process`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for CI/CD pipeline guide');
    }
  }
}

export class ReleaseProcessProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a release manager with expertise in software release processes.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Release Process Document',
        content
      };
    } catch (error) {
      console.error('Error processing Release Process Document:', error);
      throw new Error(`Failed to generate Release Process Document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Release Process Document.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Release Planning
2. Version Control
3. Release Checklist
4. Testing Requirements
5. Approval Process
6. Deployment Steps
7. Rollback Plan
8. Communication Plan
9. Documentation
10. Post-Release Tasks

Requirements:
1. Clear release steps
2. Approval workflow
3. Testing criteria
4. Rollback procedures
5. Communication plan`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for release process document');
    }
  }
}

export class CodeDocumentationProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a technical writer with expertise in code documentation standards.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Code Documentation Standards',
        content
      };
    } catch (error) {
      console.error('Error processing Code Documentation Standards:', error);
      throw new Error(`Failed to generate Code Documentation Standards: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate comprehensive Code Documentation Standards.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Documentation Types
2. Code Comments
3. API Documentation
4. README Standards
5. Documentation Tools
6. Version Control
7. Examples
8. Review Process
9. Maintenance
10. Best Practices

Requirements:
1. Clear standards
2. Include examples
3. Tool configuration
4. Review process
5. Maintenance plan`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for code documentation standards');
    }
  }
}

export class TroubleshootingProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a senior developer with expertise in system troubleshooting and debugging.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Troubleshooting Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Troubleshooting Guide:', error);
      throw new Error(`Failed to generate Troubleshooting Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Troubleshooting Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Common Issues
2. Debugging Tools
3. Error Messages
4. Logging
5. Monitoring
6. Performance Issues
7. Security Issues
8. Network Issues
9. Database Issues
10. Recovery Steps

Requirements:
1. Clear procedures
2. Tool usage
3. Error resolution
4. Monitoring setup
5. Recovery steps`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for troubleshooting guide');
    }
  }
}

export class DevelopmentWorkflowProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a development team lead with expertise in development workflows and processes.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Development Workflow Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Development Workflow Guide:', error);
      throw new Error(`Failed to generate Development Workflow Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Development Workflow Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Development Process
2. Task Management
3. Code Management
4. Review Process
5. Testing Process
6. Documentation
7. Release Process
8. Communication
9. Tools Usage
10. Best Practices

Requirements:
1. Clear workflow
2. Tool integration
3. Process steps
4. Communication plan
5. Best practices`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for development workflow guide');
    }
  }
}

export class APIIntegrationProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an API integration specialist with expertise in API design and implementation.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'API Integration Guide',
        content
      };
    } catch (error) {
      console.error('Error processing API Integration Guide:', error);
      throw new Error(`Failed to generate API Integration Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive API Integration Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. API Overview
2. Authentication
3. Endpoints
4. Request/Response
5. Error Handling
6. Rate Limiting
7. Security
8. Testing
9. Monitoring
10. Best Practices

Requirements:
1. Clear integration steps
2. Authentication details
3. Error handling
4. Security measures
5. Best practices`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for API integration guide');
    }
  }
}

export class DeploymentGuideProcessor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = new AIProcessor();
  }

  public async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are a DevOps engineer with expertise in deployment processes and automation.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: 'Deployment Guide',
        content
      };
    } catch (error) {
      console.error('Error processing Deployment Guide:', error);
      throw new Error(`Failed to generate Deployment Guide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createPrompt(context: ProjectContext): string {
    return `Based on the following project context, generate a comprehensive Deployment Guide.
    
Project Context:
- Name: ${context.projectName}
- Type: ${context.projectType}
- Description: ${context.description}

The document should include:
1. Deployment Process
2. Prerequisites
3. Environment Setup
4. Configuration
5. Deployment Steps
6. Verification
7. Rollback
8. Monitoring
9. Troubleshooting
10. Maintenance

Requirements:
1. Clear deployment steps
2. Environment setup
3. Configuration details
4. Verification process
5. Rollback procedures`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }
    if (content.length < 500) {
      console.warn('Generated content seems unusually short for deployment guide');
    }
  }
}