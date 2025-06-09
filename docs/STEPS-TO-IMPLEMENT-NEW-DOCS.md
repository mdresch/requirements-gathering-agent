# Steps to Implement New Document Types

**Document Version:** 1.0  
**Created:** June 2025  
**Last Updated:** June 2025  
**Target Audience:** Developers, Contributors, Technical Leads  

---

## 📋 Overview

This guide provides step-by-step instructions for adding new document types to the Requirements Gathering Agent. The agent uses a modular architecture that makes it straightforward to extend with new document categories and specific document templates.

## 🎯 Prerequisites

Before implementing new document types, ensure you have:

- ✅ Node.js 18+ installed
- ✅ TypeScript knowledge
- ✅ Understanding of PMBOK 7.0 principles (for project management docs)
- ✅ Familiarity with the agent's existing architecture
- ✅ AI provider configured (Google AI, Azure OpenAI, GitHub AI, or Ollama)

## 🏗️ Architecture Overview

The document generation system follows this structure:

```
src/modules/
├── documentGenerator.ts      # Main orchestrator
├── documentTemplates/        # Document-specific logic
│   ├── coreAnalysis/        # Core analysis documents
│   ├── managementPlans/     # Management and planning docs
│   ├── stakeholderMgmt/     # Stakeholder management
│   └── technicalAnalysis/   # Technical documentation
├── ai/                      # AI provider management
└── processors/              # Document processors
```

---

## 📝 Step 1: Plan Your New Document Type

### 1.1 Define Document Category

First, determine which category your new document belongs to:

- **Core Analysis**: Project summaries, context analysis, metadata
- **Management Plans**: Risk, scope, quality, communication plans
- **Planning Artifacts**: WBS, schedules, resource planning
- **Technical Analysis**: Architecture, technical requirements, APIs
- **Stakeholder Management**: Registers, communication matrices
- **Strategic Statements**: Vision, mission, objectives

### 1.2 Document Specification

Create a specification for your new document:

```typescript
interface NewDocumentSpec {
  name: string;                    // e.g., "Security Management Plan"
  category: DocumentCategory;      // e.g., "management-plans"
  fileName: string;               // e.g., "security-management-plan.md"
  description: string;            // Brief description
  pmbokAlignment: string[];       // PMBOK 7.0 alignment
  dependencies: string[];         // Other documents it depends on
  estimatedTokens: number;        // AI token estimate
  priority: number;              // Generation priority (1-10)
}
```

---

## 📂 Step 2: Create Document Template Structure

### 2.1 Create Directory Structure

If adding a new category:

```bash
mkdir src/modules/documentTemplates/yourNewCategory
```

### 2.2 Create Template File

Create your document template file:

```bash
touch src/modules/documentTemplates/yourCategory/yourDocumentName.ts
```

### 2.3 Basic Template Structure

```typescript
// src/modules/documentTemplates/yourCategory/yourDocumentName.ts
import { ProjectContext } from '../../types.js';
import { validatePMBOKCompliance } from '../../validation/pmbokValidator.js';

export interface YourDocumentConfig {
  includeRiskAssessment?: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  customSections?: string[];
}

export class YourDocumentNameTemplate {
  constructor(
    private context: ProjectContext,
    private config: YourDocumentConfig = { detailLevel: 'detailed' }
  ) {}

  /**
   * Generate the document content
   */
  async generateContent(): Promise<string> {
    const sections = [
      this.generateHeader(),
      this.generateExecutiveSummary(),
      await this.generateMainSections(),
      this.generateConclusion()
    ];

    return sections.filter(Boolean).join('\n\n');
  }

  /**
   * Generate document header with metadata
   */
  private generateHeader(): string {
    return `# ${this.getDocumentTitle()}

**Document Version:** 1.0  
**Created:** ${new Date().toLocaleDateString()}  
**Project:** ${this.context.projectName || 'Unknown Project'}  
**Category:** ${this.getCategory()}  

---`;
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(): string {
    return `## Executive Summary

This document provides [description of what the document covers].

### Key Objectives
- [Objective 1]
- [Objective 2]
- [Objective 3]`;
  }

  /**
   * Generate main document sections
   */
  private async generateMainSections(): Promise<string> {
    const sections = [];

    // Add your specific sections here
    sections.push(this.generateSection1());
    sections.push(this.generateSection2());
    
    if (this.config.includeRiskAssessment) {
      sections.push(this.generateRiskAssessment());
    }

    return sections.join('\n\n');
  }

  /**
   * Example section generator
   */
  private generateSection1(): string {
    return `## Section 1: [Title]

[Content based on project context]

### Subsection 1.1
[Detailed content]

### Subsection 1.2
[More content]`;
  }

  /**
   * Generate conclusion
   */
  private generateConclusion(): string {
    return `## Conclusion

[Summary and next steps]

---

*This document was generated using the Requirements Gathering Agent v2.1.3*`;
  }

  /**
   * Get document title
   */
  private getDocumentTitle(): string {
    return 'Your Document Name';
  }

  /**
   * Get document category
   */
  private getCategory(): string {
    return 'your-category';
  }

  /**
   * Validate PMBOK compliance
   */
  async validateCompliance(): Promise<boolean> {
    return validatePMBOKCompliance(await this.generateContent(), this.getCategory());
  }
}
```

---

## 🔧 Step 3: Create Document Processor

### 3.1 Create Processor File

```bash
touch src/modules/processors/yourDocumentNameProcessor.ts
```

### 3.2 Processor Implementation

```typescript
// src/modules/processors/yourDocumentNameProcessor.ts
import { AIProcessor } from '../ai/AIProcessor.js';
import { ProjectContext } from '../types.js';
import { YourDocumentNameTemplate, YourDocumentConfig } from '../documentTemplates/yourCategory/yourDocumentName.js';

export class YourDocumentNameProcessor {
  constructor(
    private aiProcessor: AIProcessor,
    private context: ProjectContext
  ) {}

  /**
   * Process and generate the document using AI
   */
  async processDocument(config: YourDocumentConfig = { detailLevel: 'detailed' }): Promise<string> {
    try {
      // Create template instance
      const template = new YourDocumentNameTemplate(this.context, config);
      
      // Generate initial content
      const initialContent = await template.generateContent();
      
      // AI enhancement prompt
      const aiPrompt = this.createAIPrompt(initialContent);
      
      // Process with AI
      const enhancedContent = await this.aiProcessor.generateContent(
        aiPrompt,
        'your-document-name-generation'
      );

      // Validate and return
      await this.validateOutput(enhancedContent);
      return enhancedContent;

    } catch (error) {
      console.error('Error processing your document:', error);
      throw new Error(`Failed to generate your document: ${error.message}`);
    }
  }

  /**
   * Create AI enhancement prompt
   */
  private createAIPrompt(initialContent: string): string {
    return `You are a professional project manager and PMBOK expert. Please enhance and expand the following document template with detailed, actionable content based on the project context.

Project Context:
- Name: ${this.context.projectName}
- Type: ${this.context.projectType}
- Description: ${this.context.description}

Requirements:
1. Ensure PMBOK 7.0 compliance
2. Make content specific to this project
3. Include actionable recommendations
4. Use professional language and formatting
5. Add relevant examples where appropriate

Document Template:
${initialContent}

Please provide a comprehensive, enhanced version of this document.`;
  }

  /**
   * Validate the generated output
   */
  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new Error('Generated content is empty');
    }

    if (content.length < 500) {
      console.warn('Generated content seems unusually short');
    }

    // Additional validation logic here
  }
}
```

---

## 📋 Step 4: Register Document in Main Generator

### 4.1 Update Document Categories

Add your new document to the main categories in `src/modules/documentGenerator.ts`:

```typescript
// Add to existing categories object
export const DOCUMENT_CATEGORIES = {
  // ...existing categories...
  'your-category': {
    name: 'Your Category',
    description: 'Description of your category',
    documents: [
      'your-document-name'
    ]
  }
};
```

### 4.2 Update Document Definitions

```typescript
// Add to DOCUMENT_DEFINITIONS
export const DOCUMENT_DEFINITIONS = {
  // ...existing definitions...
  'your-document-name': {
    name: 'Your Document Name',
    category: 'your-category',
    fileName: 'your-document-name.md',
    description: 'Description of your document',
    processor: 'YourDocumentNameProcessor',
    dependencies: [], // List any dependencies
    estimatedTokens: 2000,
    priority: 5
  }
};
```

### 4.3 Update Processor Registry

```typescript
// Add import
import { YourDocumentNameProcessor } from './processors/yourDocumentNameProcessor.js';

// Add to processor creation
private createProcessor(type: string, context: ProjectContext): any {
  switch (type) {
    // ...existing cases...
    case 'your-document-name':
      return new YourDocumentNameProcessor(this.aiProcessor, context);
    default:
      throw new Error(`Unknown document type: ${type}`);
  }
}
```

---

## 🧪 Step 5: Add CLI Support

### 5.1 Update CLI Flags

In `src/cli.ts`, add your new document category flag:

```typescript
// Add to help text
console.log('  --generate-your-category    Generate your category documents');

// Add to argument parsing
if (args.includes('--generate-your-category')) {
  categories.push('your-category');
}
```

### 5.2 Update Available Categories

```typescript
// In getAvailableCategories function
export function getAvailableCategories(): string[] {
  return [
    'core-analysis',
    'management-plans',
    'planning-artifacts',
    'technical-analysis',
    'stakeholder-management',
    'your-category' // Add your new category
  ];
}
```

---

## ✅ Step 6: Testing Your New Document

### 6.1 Create Test File

```bash
touch test/yourDocumentName.test.ts
```

### 6.2 Basic Test Implementation

```typescript
// test/yourDocumentName.test.ts
import { YourDocumentNameProcessor } from '../src/modules/processors/yourDocumentNameProcessor.js';
import { YourDocumentNameTemplate } from '../src/modules/documentTemplates/yourCategory/yourDocumentName.js';
import { ProjectContext } from '../src/modules/types.js';

describe('YourDocumentNameProcessor', () => {
  const mockContext: ProjectContext = {
    projectName: 'Test Project',
    projectType: 'web-application',
    description: 'A test project for validation'
  };

  test('should generate document content', async () => {
    const template = new YourDocumentNameTemplate(mockContext);
    const content = await template.generateContent();
    
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(100);
    expect(content).toContain('Test Project');
  });

  test('should validate PMBOK compliance', async () => {
    const template = new YourDocumentNameTemplate(mockContext);
    const isCompliant = await template.validateCompliance();
    
    expect(isCompliant).toBe(true);
  });
});
```

### 6.3 Integration Test

```bash
# Test document generation
node dist/cli.js --generate-your-category --output test-output
```

---

## 📊 Step 7: Validation and Quality Assurance

### 7.1 PMBOK Compliance

Ensure your document meets PMBOK 7.0 standards:

- ✅ Follows project management principles
- ✅ Uses standard terminology
- ✅ Includes appropriate stakeholder considerations
- ✅ Aligns with project lifecycle phases

### 7.2 Content Quality

- ✅ Professional language and tone
- ✅ Actionable recommendations
- ✅ Project-specific content
- ✅ Proper markdown formatting
- ✅ Consistent structure

### 7.3 Technical Validation

- ✅ No TypeScript compilation errors
- ✅ Tests pass
- ✅ Integrates with existing CLI
- ✅ Handles errors gracefully

---

## 📚 Step 8: Documentation

### 8.1 Update README

Add your new document type to the main README.md:

```markdown
### Your Category Documents
- **Your Document Name**: Description of what it provides
```

### 8.2 Update Help Documentation

Update CLI help text and documentation to include your new document type.

### 8.3 Create Usage Examples

Add examples of using your new document type:

```bash
# Generate your specific document
requirements-gathering-agent --generate-your-category

# Generate with custom configuration
requirements-gathering-agent --generate-your-category --output my-docs
```

---

## 🚀 Step 9: Deployment

### 9.1 Version Update

Update the version in `package.json` and relevant files.

### 9.2 Changelog

Add entry to `docs/CHANGELOG.md`:

```markdown
## [2.1.4] - 2025-06-XX
### Added
- New document type: Your Document Name
- Support for your-category document generation
```

### 9.3 Testing

Run comprehensive tests:

```bash
npm test
npm run build
node dist/cli.js --help  # Verify new options appear
```

---

## 🎯 Best Practices

### Code Quality
- ✅ Follow existing code patterns and conventions
- ✅ Use TypeScript types consistently
- ✅ Include proper error handling
- ✅ Add meaningful comments and documentation

### AI Integration
- ✅ Design prompts that produce consistent results
- ✅ Include context-specific information
- ✅ Validate AI outputs appropriately
- ✅ Handle AI failures gracefully

### User Experience
- ✅ Provide clear documentation
- ✅ Use intuitive CLI flags
- ✅ Include helpful error messages
- ✅ Follow established patterns

### Performance
- ✅ Optimize token usage for AI calls
- ✅ Cache results where appropriate
- ✅ Handle large projects efficiently
- ✅ Provide progress feedback

---

## 🔧 Common Issues and Solutions

### Issue: AI Generated Content is Generic
**Solution**: Enhance your AI prompts with more specific project context and examples.

### Issue: PMBOK Validation Fails
**Solution**: Review PMBOK 7.0 guidelines and ensure your document structure aligns with standards.

### Issue: TypeScript Compilation Errors
**Solution**: Check import paths and ensure all types are properly defined.

### Issue: CLI Integration Not Working
**Solution**: Verify you've updated all necessary files in the CLI chain.

---

## 📞 Support

If you encounter issues while implementing new document types:

1. Check existing document implementations for reference
2. Review the TypeScript compiler output for specific errors
3. Test with a simple project context first
4. Consult the PMBOK 7.0 guide for compliance requirements

---

## 🎉 Conclusion

Following these steps will help you successfully implement new document types in the Requirements Gathering Agent. The modular architecture makes it straightforward to extend functionality while maintaining code quality and user experience.

Remember to:
- Start with a clear specification
- Follow existing patterns
- Test thoroughly
- Document your changes
- Consider PMBOK compliance

Happy coding! 🚀

---

*This guide was created for Requirements Gathering Agent v2.1.3*