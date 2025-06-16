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
│   ├── strategicStatementsProcessor.ts  # Strategic statements processors (NEW)
│   └── ...
├── ai/                      # AI provider management
└── processors/              # (LEGACY) Document processors (being migrated)
```

### ⚡️ Key Change: Processors Move to `documentTemplates`

- **Previously:** All document processors (logic for generating and enhancing documents) were located in `src/modules/ai/processors/`.
- **Now:** New and migrated processors are placed in `src/modules/documentTemplates/`, alongside their template definitions. For example:
  - `strategicStatements.ts` contains the document template classes for Mission, Vision & Core Values and Project Purpose.
  - `strategicStatementsProcessor.ts` contains the processor classes for these documents, which handle AI enhancement and validation.

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

### 📝 Step 1d: Update Configuration Schema & Entries

- Modify `docs/config-rga.schema.json` so each processor entry is an object with:
  ```json
  {
    "module": "<path>#<ClassName>",
    "dependencies": ["string"],
    "priority": <number>
  }
  ```
- Migrate the JSON in `src/modules/documentGenerator/processor-config.json` to this new shape, assigning appropriate `dependencies` (document keys) and `priority` values.
- Confirm that `ProcessorFactory` and `DocumentGenerator.filterTasks()` have been updated to load this schema, validate dependencies, and perform DAG-based ordering.

### 🔍 Step 1e: Verify DAG Ordering

1. Rebuild and run the generator:
   ```bash
   npm run build
   node dist/src/cli.js --output generated-documents
   ```
2. Check console logs to ensure documents appear in the correct dependency order (e.g. A before B if B depends on A).
3. Inspect `generated-documents` to confirm files exist in their categorized folders.

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
  - Create a processor file (e.g., `strategicStatementsProcessor.ts`).
  - Define processor classes (e.g., `MissionVisionCoreValuesProcessor`) that handle:
    - Building the AI prompt (injecting the project context)
    - Calling the AI provider
    - Validating and enhancing the output
  - Export these processors for use in the main generator.

### 2.3 Example Structure

```
src/modules/documentTemplates/
  strategic-statements/
    strategicStatementsTemplate.ts              # Template classes
    strategicStatementsProcessor.ts     # Processor classes (TS)
```

---

## 🔧 Step 3: Register Document in Main Generator

> **Tip:** You can automate this entire step by running:
> ```bash
> rga generate:processor --category <your-category> --name <YourDocName>
> ```
> This command will:
> - Create both `Template.ts` and `Processor.ts` stubs
> - Append your entry to `processor-config.json`
> - Add a new task in `GENERATION_TASKS` and corresponding `DOCUMENT_CONFIG` mapping in `generationTasks.ts`
> - Backup the existing `ProcessorFactory.ts` to a timestamped `.bak.ts`
> - Insert a new entry into `fileManager.ts`’s `DOCUMENT_CONFIG` for version control
> - Append the new category to `DOCUMENT_CATEGORIES` in `fileManager.ts` if it doesn’t already exist

- Add a `GenerationTask` entry in `src/modules/documentGenerator/generationTasks.ts` under `GENERATION_TASKS` with:
  - `key`, `name`, `category`, `func`, `emoji`, `priority`, and `pmbokRef`
- In the same file, update `DOCUMENT_CONFIG` to map your `key` to:
  ```ts
  { filename: '<category>/<key>.md', title: '<Display Name>' }
  ```
- Register your new processor in `src/modules/documentGenerator/processor-config.json` using:
  ```json
  "<key>": {
    "module": "../documentTemplates/<category>/<YourProcessorFile>.ts#<ClassName>",
    "dependencies": [/* other keys */],
    "priority": <number>
  }
  ```
- Verify `ProcessorFactory` can dynamically import and register your new processor:
  - Run `rga --list-templates` or start a generation with `--verbose` to observe dynamic import logs.
  - Check console output for `Error loading processor module` messages and resolve any path or class-name mismatches.
- Confirm `DocumentGenerator` has a method matching the `func` name so `generateSingleDocument` invokes your processor correctly.

---

## 🧪 Step 4: Testing and Validation

- Ensure your new processor and template are correctly registered and can be invoked by the document generator:
  - Run the generator in verbose mode:
    ```bash
    rga --output generated-documents --verbose
    ```
    Watch for lines like `Loading processor for <key>` and no `Processor class not found` errors.
  - List available tasks to confirm inclusion:
    ```bash
    rga --list-templates
    ```
    Your new document key should appear in the list.
- Run tests to validate integration.
- Test with different project contexts to ensure prompts and outputs are context-aware and project-specific.

---

# 🧪 Step 5b: Add a Jest Unit Test for Your Processor

- Create a test file in `src/test/` (or the appropriate test directory):
  - Example: `src/test/projectKickoffPreparationsChecklistProcessor.test.ts`
- Your test should:
  - Instantiate the processor.
  - Call `process(context)` with a sample `ProjectContext`.
  - Assert that the output includes the correct title and key checklist sections.
  - For checklist-style documents, check that all major sections and checkboxes are present in the output.

**Example Jest Test:**
```typescript
import { ProjectKickoffPreparationsChecklistProcessor } from '../modules/documentTemplates/planningArtifacts/projectKickoffPreparationsChecklistProcessor';
import type { ProjectContext } from '../modules/ai/types';
import { describe, it, expect } from '@jest/globals';

describe('ProjectKickoffPreparationsChecklistProcessor', () => {
  const processor = new ProjectKickoffPreparationsChecklistProcessor();

  it('should generate a checklist with the correct title and content', () => {
    const context: ProjectContext = { projectName: 'Test Project' } as any;
    const output = processor.process(context);
    expect(output.title).toBe('Project KickOff Preparations Checklist');
    expect(output.content).toContain('Define project scope');
    expect(output.content).toContain('Generated for: Test Project');
  });

  it('should handle missing projectName gracefully', () => {
    const context: ProjectContext = {} as any;
    const output = processor.process(context);
    expect(output.content).toContain('Generated for: Unknown Project');
  });
});
```
- Run your test with:
  ```pwsh
  npm run test
  ```
- Ensure all tests pass and the output matches the intended checklist structure.

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

---

# Steps to Implement a New Document Type (2025 Modular Architecture)

Follow these steps to add a new document type to the Requirements Gathering Agent using the modular, configuration-driven processor architecture:

---

## 1. Create the Processor and Template
- Create a new subdirectory under `src/modules/documentTemplates/` for your document category if it does not exist.
- Add your processor class (e.g., `myNewDocProcessor.ts`) and any template or type files needed.
- Ensure your processor implements the `DocumentProcessor` interface:
  ```typescript
  interface DocumentProcessor {
    process(context: ProjectContext): DocumentOutput;
  }
  ```

## 2. Register the Processor in Configuration
- Add an entry to `src/modules/documentGenerator/processor-config.json`:
  ```json
  {
    "my-new-doc-key": "../documentTemplates/my-category/myNewDocProcessor.ts#MyNewDocProcessor"
  }
  ```
- Use the format: `"task-key": "<module-path>#<ClassName>"`.

## 3. Update Generation Tasks
- Add your document type to `src/modules/documentGenerator/generationTasks.ts`.
- Specify the task key, category, display name, and any other required metadata.

## 4. Update Context Relationships (if needed)
- If your document depends on or enriches context, update `src/modules/contextManager.ts` (e.g., `initializeDocumentRelationships`).

## 5. Implement and Test the Processor
- Implement the logic for your processor, using the project context as input.
- Add unit tests for your processor class.
- Add or update integration tests to ensure the new document is generated as expected.

## 6. Validate and Document
- Run the generator and validate that your new document is generated correctly.
- Update documentation (e.g., `ARCHITECTURE.md`, this file) to describe the new document type and its processor.

## 7. (Optional) Add to Reference Implementation
- If your document type is a new category, consider updating the migration plan and reference implementation notes.

---

**Summary Table:**
| Step | File/Location | Description |
|------|---------------|-------------|
| 1    | `documentTemplates/` | Create processor & template |
| 2    | `processor-config.json` | Register processor |
| 3    | `generationTasks.ts` | Add to generation tasks |
| 4    | `contextManager.ts` | Update context relationships (if needed) |
| 5    | `test/` | Add unit/integration tests |
| 6    | Docs | Update documentation |

---

*For more details, see the `MODULAR-PROCESSOR-MIGRATION-PLAN.md` and `ARCHITECTURE.md` files.*

---

# Steps to Implement a New Document Type: Project-KickOff-Preprations-CheckList.md

This guide demonstrates how to add a new document type, `Project-KickOff-Preprations-CheckList.md`, to the Requirements Gathering Agent using the modular processor architecture.

---

## 1. Create the Processor and Template
- Create a new subdirectory if needed (e.g., `src/modules/documentTemplates/project-kickoff/`).
- Add a processor class file, e.g., `projectKickoffPreparationsChecklistProcessor.ts`:
  ```typescript
  import { ProjectContext } from '../../ai/types';
  import { DocumentOutput } from '../../documentGenerator/types';

  export class ProjectKickoffPreparationsChecklistProcessor {
    process(context: ProjectContext): DocumentOutput {
      // Implement checklist generation logic here
      return {
        title: 'Project KickOff Preparations Checklist',
        content: '...generated checklist content...'
      };
    }
  }
  ```
- Add any template or type files as needed.

## 2. Register the Processor in Configuration
- Add to `src/modules/documentGenerator/processor-config.json`:
  ```json
  {
    "project-kickoff-preparations-checklist": "../documentTemplates/project-kickoff/projectKickoffPreparationsChecklistProcessor.ts#ProjectKickoffPreparationsChecklistProcessor"
  }
  ```

## 3. Update Generation Tasks
- In `src/modules/documentGenerator/generationTasks.ts`, add:
  ```typescript
  {
    key: 'project-kickoff-preparations-checklist',
    category: 'project-kickoff',
    name: 'Project KickOff Preparations Checklist',
    fileName: 'Project-KickOff-Preprations-CheckList.md',
    priority: 10,
    emoji: '✅',
    func: 'getProjectKickoffPreparationsChecklist'
  }
  ```

## 4. Update Context Relationships (if needed)
- If this checklist depends on or enriches context, update `initializeDocumentRelationships` in `src/modules/contextManager.ts`.

## 5. Implement and Test the Processor
- Complete the logic in your processor class.
- Add unit tests for `ProjectKickoffPreparationsChecklistProcessor` in the appropriate test directory.
- Add or update integration tests to ensure the document is generated as expected.

## 6. Validate and Document
- Run the generator and confirm that `Project-KickOff-Preprations-CheckList.md` is generated correctly.
- Update documentation (e.g., `ARCHITECTURE.md`, `STEPS-TO-IMPLEMENT-NEW-DOCS.md`) to reference the new document type.

## 7. (Optional) Add to Reference Implementation
- If this is a new category, update the migration plan and reference implementation notes.

---

## 7. Checklist for Complex/Checklist-Style Documents (e.g., Project KickOff Preparations Checklist)
- Use a detailed, sectioned structure for checklists, modeled after real-world or Gitbook examples.
- Ensure all major project phases and PMBOK-aligned sections are included (Initiation, Planning, Setup, Risk, Communication, Milestones, Security, Training, Kickoff Agenda, Summary).
- Implement the processor to output a rich Markdown document with headings, checkboxes, and explanatory text.
- Use the project context (e.g., project name) to personalize the checklist.
- Validate that the generated document matches the intended structure and content (compare to reference markdown if available).
- Remove duplicate or alias keys from configuration—use a single canonical key for the checklist document in both `GENERATION_TASKS` and `DOCUMENT_CONFIG`.
- Ensure the output path and filename match the intended folder structure (e.g., `planning-artifacts/project-kickoff-preparations-checklist.md`).
- Add a test to verify that all major sections and checkboxes are present in the output.
- Update documentation and CLI help to reference only the canonical checklist key.

## 8. Additional Integration Steps for New Document Types
- Add the document to `DOCUMENT_CONFIG` with the correct filename, title, and description.
- If the document should appear in a subfolder (e.g., `strategic-statements/`), set the filename accordingly.
- Register the processor in `processor-config.json` and ensure the class is imported and registered in the processor factory.
- If the document is referenced by or provides context to other documents, update the relationships in `contextManager.ts`.
- If the document is a checklist or has a complex structure, provide a reference markdown in `Gitbook/requirements/` for future maintainers.
- Test end-to-end generation via the CLI and validate the output file is created and non-empty.
- Update the README and any architecture or migration documentation to reflect the new document type and its integration points.