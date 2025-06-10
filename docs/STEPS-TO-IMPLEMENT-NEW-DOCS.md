# Steps to Implement New Document Types

**Document Version:** 1.1  
**Created:** June 2025  
**Last Updated:** June 9, 2025  
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
├── documentGenerator/        # Main orchestrator (modular)
│   ├── DocumentGenerator.ts # Core generation logic
│   ├── generationTasks.ts   # Task definitions
│   ├── types.ts            # Type definitions
│   └── index.ts            # Module exports
├── documentTemplates/        # Document-specific logic
│   ├── coreAnalysis/        # Core analysis documents
│   ├── managementPlans/     # Management plan documents
│   └── planningArtifacts/   # Planning artifact documents
├── ai/                      # AI provider management
│   └── processors/          # Specialized AI processors by domain
├── llmProcessor-migration.ts # Migration wrapper functions
└── pmbokValidation/         # PMBOK compliance validation
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
  processor: ProcessorType;       // Which AI processor to use
}
```

### 1.3 Choose Appropriate Processor

Select the right processor for your document type:

- **PlanningProcessor**: Planning artifacts, schedules, resources, kickoff documents
- **ScopeManagementProcessor**: Scope management, WBS, scope statements, scope processes
- **TechnicalAnalysisProcessor**: Technical requirements, architecture documents
- **StakeholderProcessor**: Stakeholder registers, communication plans
- **ProjectMgmtProcessor**: Core project management plans, charters
- **PMBOKProcessor**: PMBOK-specific processes and methodologies
- **RequirementsProcessor**: Requirements documentation, traceability
- **WBSProcessor**: Work breakdown structures
- **ActivityProcessor**: Activity definitions, sequencing
- **aiProcessor**: Direct AI calls for simple custom processing (use sparingly)
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
import { ProjectContext } from '../../types';
// Import validation if needed
// import { validatePMBOKCompliance } from '../../pmbokValidation/index';

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

## 🔧 Step 3: Add Generation Task Definition and Processor Method

### 3.1 Update Generation Tasks

Add your new document to `src/modules/documentGenerator/generationTasks.ts`:

```typescript
// Add to GENERATION_TASKS array
export const GENERATION_TASKS: GenerationTask[] = [
  // ...existing tasks...
  {
    key: 'your-document-name',
    name: 'Your Document Name',
    func: 'getYourDocumentName', // Function name in llmProcessor-migration.ts
    emoji: '📋',
    category: 'your-category',
    priority: 10, // Set appropriate priority
    pmbokRef: '4.1' // PMBOK reference if applicable
  }
];
```

### 3.2 Add Method to Appropriate Processor

**IMPORTANT**: Add the actual implementation to the correct processor class first, then create a wrapper in the migration file.

#### Option A: Add to Existing Processor

Add your method to the appropriate processor class (e.g., `PlanningProcessor.ts`, `ScopeManagementProcessor.ts`):

```typescript
// src/modules/ai/processors/YourProcessor.ts
/**
 * Generate Your Document Name
 */
async getYourDocumentName(context: string): Promise<string | null> {
    const contextManager = await getContextManager();
    const enhancedContext = contextManager.buildContextForDocument('your-document-name', [
        'project-charter', 'stakeholder-register' // Add relevant dependencies
    ]);
    const fullContext = enhancedContext || context;

    return await this.handleAICall(async () => {        // Import template without .js extension for compilation
        const { YourDocumentNameTemplate } = await import('../../documentTemplates/yourCategory/yourDocumentName');
        
        const template = new YourDocumentNameTemplate(
            { projectName: 'Context Project' },
            { detailLevel: 'detailed' }
        );
        const baseContent = await template.generateContent();
        
        const messages = this.createStandardMessages(
            `You are a professional project manager and PMBOK expert. Generate detailed, actionable project management documentation.`,
            `Based on the following project context, enhance this document template:

Project Context:
${fullContext}

Document Template:
${baseContent}

Please provide a comprehensive, enhanced version with:
1. PMBOK 7.0 compliance
2. Project-specific content
3. Actionable recommendations
4. Professional language
5. Relevant examples`
        );
        
        const response = await aiProcessor.makeAICall(messages, 1400);
        return getAIProcessor().extractContent(response);
    }, 'Your Document Name Generation', 'your-document-name');
}
```

### 3.3 Add Migration Wrapper Function

Add the wrapper function to `src/modules/llmProcessor-migration.ts`:

```typescript
/**
 * Generate Your Document Name (Migration Wrapper)
 */
export async function getYourDocumentName(context: string): Promise<string | null> {
    // Call the appropriate processor method
    return await planningProcessor.getYourDocumentName(context);
    // OR: return await scopeProcessor.getYourDocumentName(context);
    // OR: return await technicalAnalysisProcessor.getYourDocumentName(context);
}
```

#### Option B: Direct Implementation (for simple cases)

For simple documents that don't fit existing processors, implement directly in migration file:

```typescript
export async function getYourDocumentName(context: string): Promise<string | null> {
    return await MigrationHelperProcessor.handleAICall(async () => {
        // Import without .js extension
        const { YourDocumentNameTemplate } = await import('../documentTemplates/yourCategory/yourDocumentName');
        
        const template = new YourDocumentNameTemplate({ projectName: 'Context Project' });
        const content = await template.generateContent();
        
        const systemPrompt = `You are a professional project manager and PMBOK expert.`;
        const userPrompt = `Enhance this document: ${content}\n\nContext: ${context}`;

        const messages = MigrationHelperProcessor.createMessages(systemPrompt, userPrompt);
        const response = await aiProcessor.makeAICall(messages, 1400);
        return getAIProcessor().extractContent(response);
    }, 'your-document-name');
}
```

---

## 📋 Step 4: Register Document in Main Generator

### 4.1 Verify Task Registration

Ensure your new task appears in the available generation tasks:

```typescript
// The task should now be automatically available since it's in GENERATION_TASKS
// No additional registration needed - the system discovers tasks automatically
```

### 4.2 Update Available Categories (if new category)

If you created a new category, ensure it's recognized by the CLI:

```typescript
// The category is automatically detected from GENERATION_TASKS
// But you may want to add it to category-specific CLI flags in cli.ts
```

---

## 🧪 Step 5: Add CLI Support (Optional)

### 5.1 Update CLI Flags (if adding category-specific generation)

In `src/cli.ts`, you can add category-specific flags:

```typescript
// Add to help text in displayHelp function
console.log('  --generate-your-category    Generate your category documents');

// Add to argument parsing in main function
if (args.includes('--generate-your-category')) {
  const categories = ['your-category'];
  await generateByCategories(categories, outputDir, options);
  return;
}
```

### 5.2 Update Available Categories

The system automatically detects categories from `GENERATION_TASKS`, but you can verify available categories:

```typescript
// Categories are automatically extracted from GENERATION_TASKS
// Use getAvailableCategories() to see all available categories
import { getAvailableCategories } from './modules/documentGenerator.js';
console.log('Available categories:', getAvailableCategories());
```

---

## ✅ Step 6: Testing Your New Document

### 6.1 Create Test File

```powershell
# Create test file using PowerShell
New-Item test/yourDocumentName.test.ts -ItemType File
```

### 6.2 Basic Test Implementation

```typescript
// test/yourDocumentName.test.ts
import { getYourDocumentName } from '../src/modules/llmProcessor-migration';
import { YourDocumentNameTemplate } from '../src/modules/documentTemplates/yourCategory/yourDocumentName';

describe('YourDocumentNameProcessor', () => {
  const mockContext = `
Project Name: Test Project
Project Type: web-application
Description: A test project for validation
`;

  test('should generate document content via template', async () => {
    const template = new YourDocumentNameTemplate({
      projectName: 'Test Project',
      projectType: 'web-application',
      description: 'A test project for validation'
    });
    const content = await template.generateContent();
    
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(100);
    expect(content).toContain('Test Project');
    expect(content).toContain('# Your Document Name');
  });

  test('should generate enhanced content via AI processor', async () => {
    const result = await getYourDocumentName(mockContext);
    
    expect(result).toBeDefined();
    if (result) {
      expect(result.length).toBeGreaterThan(500);
    }
  }, 30000); // Allow 30s for AI processing

  test('should handle empty context gracefully', async () => {
    const result = await getYourDocumentName('');
    
    // Should either return valid content or null, but not throw
    expect(result === null || typeof result === 'string').toBe(true);
  });
});
```

### 6.3 Integration Test

```powershell
# Test document generation using PowerShell
node dist/cli.js --generate-your-category --output test-output

# Test specific document generation
node dist/cli.js --interactive

# Run tests
npm test
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
- ✅ Follow existing code patterns in `documentTemplates/` subdirectories
- ✅ Use TypeScript types consistently from `types`
- ✅ Include proper error handling in templates and processors
- ✅ Add meaningful JSDoc comments and documentation
- ✅ Use correct import patterns (no `.js` extensions for dynamic imports)

### AI Integration
- ✅ Always implement methods in appropriate processor classes first
- ✅ Use migration file only as wrapper to call processor methods
- ✅ Design prompts that produce consistent, professional results
- ✅ Include context-specific information in templates
- ✅ Use processor's `handleAICall()` for proper error handling
- ✅ Test with different project contexts to ensure robustness

### Template Design
- ✅ Create modular template sections that can be enabled/disabled
- ✅ Include placeholder content that guides AI generation
- ✅ Use consistent document header format with metadata
- ✅ Support different detail levels (basic, detailed, comprehensive)
- ✅ Make templates project-agnostic but context-aware

### Performance
- ✅ Optimize AI token usage by using concise but comprehensive prompts
- ✅ Set appropriate priority levels in `GENERATION_TASKS`
- ✅ Use existing processors rather than direct AI calls when possible
- ✅ Consider document dependencies when setting generation order

### User Experience
- ✅ Provide clear, intuitive document names and descriptions
- ✅ Use meaningful emojis in task definitions for better CLI experience
- ✅ Include helpful error messages and fallback behaviors
- ✅ Follow established CLI patterns and naming conventions

### Testing Strategy
- ✅ Test template generation independently of AI processing
- ✅ Test AI integration with realistic project contexts
- ✅ Verify error handling for edge cases (empty context, AI failures)
- ✅ Test CLI integration end-to-end
- ✅ Validate PMBOK compliance where applicable

---

## 🔧 Common Issues and Solutions

### Issue: Function Not Found in Generation Tasks
**Problem**: `Error: Function getYourDocumentName not found in llmProcessor-migration`
**Solution**: 
1. Ensure your function is exported from `llmProcessor-migration.ts`
2. Check the `func` name in `GENERATION_TASKS` matches exactly
3. Rebuild the project: `npm run build`

### Issue: AI Generated Content is Generic
**Solution**: 
1. Enhance your AI prompts with more specific project context
2. Use appropriate processor (e.g., `pmbokProcessor` for PMBOK docs)
3. Include more detailed template content as a foundation

### Issue: PMBOK Validation Fails
**Solution**: 
1. Review PMBOK 7.0 guidelines for your document type
2. Ensure your template includes required PMBOK elements
3. Check the `pmbokRef` in your task definition

### Issue: TypeScript Compilation Errors
**Solution**: 
1. Remove `.js` extensions from import paths for dynamic imports
2. Ensure all types are properly imported from `types`
3. Verify template class implements expected interface
4. Check that processor methods exist before calling them

### Issue: Missing Functions in Migration File
**Problem**: `Error: Function getYourDocumentName not found in llmProcessor-migration`
**Solution**: 
1. Always implement the method in the appropriate processor class first
2. Add the wrapper function to `llmProcessor-migration.ts`
3. Ensure the function is exported from migration file
4. Rebuild the project: `npm run build`

### Issue: CLI Integration Not Working
**Solution**: 
1. Verify your task is in `GENERATION_TASKS` array
2. Check category name matches across all files
3. Ensure function is exported from migration file
4. Rebuild: `npm run build`

### Issue: Template Directory Not Found
**Solution**: 
```powershell
# Create missing directories using PowerShell
New-Item src/modules/documentTemplates/yourCategory -ItemType Directory -Force
```

### Issue: AI Provider Not Configured
**Solution**: 
1. Check your `.env` file has proper AI provider configuration
2. Test AI provider: `node dist/cli.js --test-ai`
3. Verify API keys and endpoints are correct

---

## 🚀 Quick Start Checklist

Use this checklist to ensure you've completed all steps:

- [ ] 1. **Planning**: Document specification created
- [ ] 2. **Template**: Document template class created in appropriate category
- [ ] 3. **Function**: LLM processor function added to migration file
- [ ] 4. **Task**: Generation task added to `GENERATION_TASKS`
- [ ] 5. **Test**: Basic tests created and passing
- [ ] 6. **Build**: Project builds without errors (`npm run build`)
- [ ] 7. **CLI**: Document appears in CLI help (`node dist/cli.js --help`)
- [ ] 8. **Generate**: Document generates successfully
- [ ] 9. **Validate**: PMBOK validation passes (if applicable)
- [ ] 10. **Documentation**: README updated with new document type

---

## 💡 Complete Example: Security Management Plan

Here's a complete example of implementing a new document type:

### Step 1: Create Template

```typescript
// src/modules/documentTemplates/managementPlans/securityManagementPlan.ts
import { ProjectContext } from '../../types';

export interface SecurityManagementPlanConfig {
  includeComplianceSection?: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  securityFramework?: 'ISO27001' | 'NIST' | 'SOC2' | 'custom';
}

export class SecurityManagementPlanTemplate {
  constructor(
    private context: ProjectContext,
    private config: SecurityManagementPlanConfig = { 
      detailLevel: 'detailed',
      securityFramework: 'NIST'
    }
  ) {}

  async generateContent(): Promise<string> {
    const sections = [
      this.generateHeader(),
      this.generateExecutiveSummary(),
      this.generateSecurityObjectives(),
      this.generateRiskAssessment(),
      this.generateSecurityControls(),
      this.config.includeComplianceSection ? this.generateComplianceSection() : null,
      this.generateConclusion()
    ];

    return sections.filter(Boolean).join('\n\n');
  }

  private generateHeader(): string {
    return `# Security Management Plan

**Document Version:** 1.0  
**Created:** ${new Date().toLocaleDateString()}  
**Project:** ${this.context.projectName || 'Unknown Project'}  
**Category:** Management Plans  
**Framework:** ${this.config.securityFramework}

---`;
  }

  private generateExecutiveSummary(): string {
    return `## Executive Summary

This Security Management Plan outlines the security requirements, controls, and procedures for ${this.context.projectName}.

### Key Objectives
- Protect project assets and data from security threats
- Ensure compliance with relevant security standards
- Establish incident response procedures
- Define security roles and responsibilities`;
  }

  private generateSecurityObjectives(): string {
    return `## Security Objectives

- **Confidentiality**: Ensure sensitive data is accessible only to authorized personnel
- **Integrity**: Maintain accuracy and completeness of data and systems
- **Availability**: Ensure systems and data are available when needed
- **Accountability**: Maintain audit trails and access logs`;
  }

  private generateRiskAssessment(): string {
    return `## Security Risk Assessment

### Risk Categories
- Data breaches and unauthorized access
- System vulnerabilities and exploits
- Insider threats and social engineering
- Physical security threats
- Third-party and supply chain risks`;
  }

  private generateSecurityControls(): string {
    return `## Security Controls

### Technical Controls
- Access control and authentication systems
- Encryption for data at rest and in transit
- Network security and firewalls
- Monitoring and logging systems

### Administrative Controls
- Security policies and procedures
- Training and awareness programs
- Incident response procedures
- Regular security assessments`;
  }

  private generateComplianceSection(): string {
    return `## Compliance Requirements

### ${this.config.securityFramework} Framework Alignment
- Control implementation mapping
- Audit requirements and schedules
- Documentation and reporting procedures
- Continuous monitoring processes`;
  }

  private generateConclusion(): string {
    return `## Implementation Timeline

- **Phase 1**: Security infrastructure setup (Weeks 1-2)
- **Phase 2**: Policy implementation and training (Weeks 3-4)
- **Phase 3**: Monitoring and audit setup (Weeks 5-6)
- **Phase 4**: Ongoing maintenance and review

---

*This document was generated using the Requirements Gathering Agent v2.1.3*`;
  }
}
```

### Step 2: Add Generation Task

```typescript
// Add to src/modules/documentGenerator/generationTasks.ts
{
  key: 'security-management-plan',
  name: 'Security Management Plan',
  func: 'getSecurityManagementPlan',
  emoji: '🔒',
  category: 'management-plans',
  priority: 8.5,
  pmbokRef: '11.1'
}
```

### Step 3: Add LLM Function

```typescript
// Add to src/modules/llmProcessor-migration.ts
export async function getSecurityManagementPlan(context: string): Promise<string | null> {
  return await MigrationHelperProcessor.handleAICall(async () => {
    const template = new SecurityManagementPlanTemplate(
      { projectName: 'Security Project' },
      { detailLevel: 'detailed', securityFramework: 'NIST' }
    );
    const content = await template.generateContent();
      const messages = MigrationHelperProcessor.createMessages(
      `You are a cybersecurity expert and project manager. Generate comprehensive security management documentation following PMBOK and NIST guidelines.`,
      `Based on the following project context, enhance this security management plan:

Project Context:
${context}

Security Management Plan Template:
${content}

Please provide a detailed, project-specific security management plan with:
1. Risk assessment specific to this project type
2. Appropriate security controls and measures
3. Compliance requirements and frameworks
4. Implementation timeline and milestones
5. Roles and responsibilities
6. Incident response procedures`
    );
    
    const response = await aiProcessor.makeAICall(messages, 1400);
    return getAIProcessor().extractContent(response);
  }, 'security-management-plan');
}
```

### Step 4: Test Implementation

```typescript
// test/securityManagementPlan.test.ts
import { getSecurityManagementPlan } from '../src/modules/llmProcessor-migration';
import { SecurityManagementPlanTemplate } from '../src/modules/documentTemplates/managementPlans/securityManagementPlan';

describe('SecurityManagementPlan', () => {
  const mockContext = `
Project Name: E-commerce Platform
Project Type: web-application
Description: Online retail platform with payment processing
`;

  test('should generate security plan template', async () => {
    const template = new SecurityManagementPlanTemplate(
      { projectName: 'E-commerce Platform' },
      { detailLevel: 'detailed', securityFramework: 'NIST' }
    );
    const content = await template.generateContent();
    
    expect(content).toContain('Security Management Plan');
    expect(content).toContain('E-commerce Platform');
    expect(content).toContain('NIST');
    expect(content).toContain('Security Controls');
  });

  test('should enhance with AI processing', async () => {
    const result = await getSecurityManagementPlan(mockContext);
    
    expect(result).toBeDefined();
    if (result) {
      expect(result).toContain('security');
      expect(result.length).toBeGreaterThan(1000);
    }
  }, 30000);
});
```

### Step 5: Verify Integration

```powershell
# Build and test
npm run build
npm test

# Test CLI integration
node dist/cli.js --help | Select-String "security"
node dist/cli.js --generate-management-plans --output test-docs
```

This example demonstrates the complete workflow for adding a new document type to the system.

---

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