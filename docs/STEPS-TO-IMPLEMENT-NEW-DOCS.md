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

The document generation system now separates AI processor logic and document template logic for better modularity and maintainability.

```
src/modules/
├── documentGenerator.ts      # Main orchestrator
├── documentTemplates/        # Document templates and (new) processors
│   ├── coreAnalysis/        # Core analysis documents
│   ├── managementPlans/     # Management and planning docs
│   ├── stakeholderMgmt/     # Stakeholder management
│   ├── strategicStatements.ts  # Strategic statements templates (NEW)
│   ├── strategicStatementsProcessor.js  # Strategic statements processors (NEW)
│   └── ...
├── ai/                      # AI provider management
└── processors/              # (LEGACY) Document processors (being migrated)
```

### ⚡️ Key Change: Processors Move to `documentTemplates`

- **Previously:** All document processors (logic for generating and enhancing documents) were located in `src/modules/ai/processors/`.
- **Now:** New and migrated processors are placed in `src/modules/documentTemplates/`, alongside their template definitions. For example:
  - `strategicStatements.ts` contains the document template classes for Mission, Vision & Core Values and Project Purpose.
  - `strategicStatementsProcessor.js` contains the processor classes for these documents, which handle AI enhancement and validation.

This change improves modularity and makes it easier to maintain and extend document types.

---

## 📝 Step 1: Plan Your New Document Type

### 1.1 Define Document Category

First, determine which category your new document belongs to. The main categories are:

- **Core Analysis**: Project summaries, context analysis, metadata
- **Management Plans**: Risk, scope, quality, communication plans
- **Planning Artifacts**: WBS, schedules, resource planning
- **Technical Analysis**: Architecture, technical requirements, APIs
- **Stakeholder Management**: Registers, communication matrices
- **Strategic Statements**: Vision, mission, objectives, project purpose, mission/vision/core values

> **Tip:**
> The list of categories is defined in the codebase (see `src/modules/documentGenerator/generationTasks.ts` and related config). If you add a new category, update the relevant configuration and documentation to ensure it is recognized by the generator and CLI.

---

### 1.2 Document Specification

Create a specification for your new document. Use the following interface as a guide:

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

- Add your new document's specification to the appropriate configuration (see `src/modules/documentGenerator/generationTasks.ts`).
- Ensure the `category` matches one of the main categories above, or update the configuration and documentation if you introduce a new category.

---

## 🧠 Step 1b: Build Context for Prompts

Before implementing a new document type, ensure you have a clear and rich project context. This context is used to generate high-quality, project-specific documents. The context typically includes:

- Project name, type, and description
- Stakeholder information
- Business goals and objectives
- Technical constraints and requirements
- Any relevant background or history

**How context is built:**
- The agent gathers context from user input, project metadata, and previously generated documents.
- The `src/modules/contextManager.ts` module is responsible for collecting, merging, and providing this context to the rest of the system.
- This context is passed to both the template and processor classes, and is injected into AI prompts to ensure outputs are tailored to the specific project.
- When designing a new processor, always include a section in your prompt for the full project context, and reference it in your template sections.
- For advanced scenarios, see the `ContextManager` implementation for how context is loaded, updated, and made available to document generation routines.

---

## 🔗 Step 1c: Register Document Relationships in ContextManager

**Important:** For new document types to participate in context enrichment and relationship management, you must register them in the context relationship logic.

- Open `src/modules/contextManager.ts`.
- Locate the `initializeDocumentRelationships` function.
- Add your new document type(s) to the relationships map, ensuring they are linked to relevant context sources and dependencies.
- This ensures that when your document is generated, it can access and contribute to the shared project context, and that downstream documents can reference it.
- Example:
  ```ts
  relationships['mission-vision-core-values'] = ['project-purpose', 'project-summary'];
  relationships['project-purpose'] = ['mission-vision-core-values', 'project-summary'];
  ```
- Update this step whenever you add new document types that should be context-aware or referenced by others.

---

## 📂 Step 2: Create Document Template Structure

### 2.1 Create Directory Structure

If adding a new category or document type:

```bash
mkdir src/modules/documentTemplates/yourNewCategory
```

### 2.2 Create Template and Processor Files

- **Template:**
  - Create a TypeScript file for your document template (e.g., `strategicStatements.ts`).
  - Define the template class (e.g., `MissionVisionCoreValuesTemplate`).
  - The template should have a `generateContent(context)` method that builds the document using the provided context.
- **Processor:**
  - Create a processor file (e.g., `strategicStatementsProcessor.js`).
  - Define processor classes (e.g., `MissionVisionCoreValuesProcessor`) that handle:
    - Building the AI prompt (injecting the project context)
    - Calling the AI provider
    - Validating and enhancing the output
  - Export these processors for use in the main generator.

### 2.3 Example Structure

```
src/modules/documentTemplates/
  strategic-statements/
    strategicStatements.ts              # Template classes
    strategicStatementsProcessor.js     # Processor classes (JS/TS)
    strategicStatementsProcessor.d.ts   # Type declarations (if needed)
```

---

## 🔧 Step 3: Register Document in Main Generator

- Import your processor from `documentTemplates/yourProcessorFile.js` in the generator registry (not from `ai/processors`).
- Update the processor registry to instantiate your new processor for the relevant document type.
- Ensure the generator passes the full project context to your processor and template.

---

## 🧪 Step 4: Testing and Validation

- Ensure your new processor and template are correctly registered and can be invoked by the document generator.
- Run tests to validate integration.
- Test with different project contexts to ensure prompts and outputs are context-aware and project-specific.

---

## 📝 Migration Note

- **Legacy processors** in `src/modules/ai/processors/` are being phased out. New and updated document types should use the `documentTemplates` directory for both templates and processors.
- This approach improves maintainability and aligns with the modular architecture goals.

---

## 🎉 Conclusion

Following these steps will help you successfully implement new document types in the Requirements Gathering Agent. The modular architecture makes it straightforward to extend functionality while maintaining code quality and user experience.

Remember to:
- Start with a clear specification
- Follow existing patterns
- Test thoroughly
- Document your changes
- Consider PMBock compliance

Happy coding! 🚀

---

*This guide was created for Requirements Gathering Agent v2.1.3*

---

## 🛠️ Troubleshooting & Common Build Issues

### TypeScript Import/Type Errors

If you encounter errors like:
- `Cannot find module '../../types.js' or its corresponding type declarations.`
- `Cannot find module '../../validation/pmbokValidator.js' or its corresponding type declarations.`
- Property errors such as `Property 'projectType' does not exist on type 'ProjectContext'.`
- `Property 'generateContent' does not exist on type 'AIProcessor'.`

#### How to Fix:

1. **Check Import Paths:**
   - Use `.ts` extensions for TypeScript imports (e.g., `import { ProjectContext } from '../../types';`).
   - Only use `.js` if you are importing compiled JavaScript or using Node.js resolution.
   - Make sure the referenced files exist and are included in your `tsconfig.json`.

2. **Type Declarations:**
   - Ensure all types (like `ProjectContext`) are exported from the correct file (e.g., `src/types.ts`).
   - If you move or rename files, update all import paths accordingly.

3. **Context Properties:**
   - If you reference properties like `projectType` or `description` on `ProjectContext`, confirm they exist in `src/types.ts` and are populated by the `ContextManager`.
   - If not, add them to the type and ensure they are set in the context-building logic.

4. **AIProcessor Methods:**
   - If you call `generateContent` on `AIProcessor`, ensure this method exists. If not, use the correct method (e.g., `makeAICall`).
   - Review the implementation in `src/modules/ai/AIProcessor.ts` for available methods.

5. **Error Handling:**
   - When catching errors of type `unknown`, use `if (error instanceof Error)` to safely access `error.message`.

#### Example Fixes:
- Change `import { ProjectContext } from '../../types.js';` to `import { ProjectContext } from '../../types';`
- Add missing properties to `ProjectContext` in `src/types.ts`:
  ```ts
  export interface ProjectContext {
    projectName: string;
    projectType?: string;
    description?: string;
    // ...other fields
  }
  ```
- Replace `this.aiProcessor.generateContent(...)` with `this.aiProcessor.makeAICall(...)` if that's the correct method.
- Use:
  ```ts
  if (error instanceof Error) {
    throw new Error(`Failed: ${error.message}`);
  } else {
    throw error;
  }
  ```