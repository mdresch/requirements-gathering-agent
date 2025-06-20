# Modular Processor Migration Plan

**Version:** 1.4  
**Date:** June 10, 2025  
**Author:** Requirements Gathering Agent Team

---

## Purpose

This document outlines the step-by-step plan for migrating from the legacy document processor structure to the new modular, category-based architecture in the Requirements Gathering Agent.

---

## Progress Update (as of June 10, 2025)

### Migration Status
- **ProcessorFactory**: Refactored to support registry-based, config-driven processor loading with robust error handling and logger support. Unit and integration tests are passing.
- **Processor Classes**: All processor and template files have been migrated to TypeScript, and imports updated to extensionless or `.ts` as appropriate. Legacy `.js` files have been removed.
- **Configuration**: `processor-config.json` is in use for dynamic processor registration.
- **Testing**: Jest test suite for `ProcessorFactory` is complete and passing. Integration with the generator is validated.
- **TypeScript**: All build errors related to the migration have been resolved. All relevant types and interfaces are up to date.
- **Generator Registry**: `index.ts` and related files now use the factory for processor access. No direct processor imports remain.
- **Document Configuration**: All new document types and categories are registered and available for generation.
- **Context Relationships**: Updated to include new document types and dependencies.
- **Documentation**: This plan, `ARCHITECTURE.md`, and `STEPS-TO-IMPLEMENT-NEW-DOCS.md` have been updated to reflect the new architecture.
- **Legacy Code**: All legacy processor files have been marked as deprecated or removed where safe.

### Findings & Lessons Learned
- **ESM/TypeScript Compatibility**: All imports must be extensionless or use `.ts` in source, and `.js` in built output for Node ESM compatibility. This was a common source of runtime errors.
- **Testing**: When mocking processor classes, all async methods must be present and return Promises to avoid Jest async teardown errors.
- **Build Artifacts**: Ensuring all files are present in `dist/` is critical for runtime. Clean builds (`rm -rf dist && npm run build`) are recommended after major refactors.
- **Pandoc PDF Generation**: For document conversion, a LaTeX distribution (e.g., MiKTeX) is required for PDF output. This is a common external dependency for users.
- **Dynamic Imports**: Dynamic processor loading via config and `import()` is working well and provides flexibility for future extension.
- **Backward Compatibility**: Adapter layers are in place for legacy import paths, but these will be removed after full migration.

### Next Steps
- Complete migration of any remaining document types not yet modularized.
- Continue to monitor for runtime or test regressions as new processors are added.
- Remove all deprecated legacy code after final validation.
- Continue to update documentation as the architecture evolves.

---

### Migration Steps

#### 1. Establish Modular Directory Structure
- For each document category (e.g., `strategic-statements`), create a subdirectory under `src/modules/documentTemplates/`.
- Place all template, processor, and type declaration files for that category in this subdirectory.
- **Example:**
  ```
  src/modules/documentTemplates/strategic-statements/
    strategicStatements.ts
    strategicStatementsProcessor.ts
    strategicStatementsProcessor.d.ts
  ```

#### 2. Move and Refactor Processors
- Move processor logic from `src/modules/ai/processors/` (e.g., `StrategicStatementsProcessor.ts`) into the new subdirectory.
- Refactor processors to:
  - Use the new template classes.
  - Accept and use the full project context.
  - Follow the new interface for AI calls and validation.
- Remove or deprecate the legacy processor files after migration.

#### 3. Create a Unified, Extensible Processor Factory
- Create `src/modules/documentGenerator/ProcessorFactory.ts`.
- Use a registry/map instead of a switch statement for extensibility.
- **Explicit Interface for Processors:**
  ```typescript
  interface DocumentProcessor {
    process(context: ProjectContext): DocumentOutput;
  }

  interface ProcessorMap {
    [taskKey: string]: typeof DocumentProcessor;
  }
  ```
- **Revised Factory Example:**
  ```typescript
  import { ILogger } from '../logging/ILogger';
  import { MissionVisionCoreValuesProcessor, ProjectPurposeProcessor } from '../documentTemplates/strategic-statements/strategicStatementsProcessor.ts';
  // ... other imports ...

  export class ProcessorFactory {
    private processorMap: ProcessorMap = {
      'mission-vision-core-values': MissionVisionCoreValuesProcessor,
      'project-purpose': ProjectPurposeProcessor,
    };

    constructor(private logger: ILogger) {}

    getProcessorForTask(taskKey: string, ...args: any[]): DocumentProcessor {
      const ProcessorClass = this.processorMap[taskKey];
      if (ProcessorClass) {
        try {
          return new ProcessorClass(...args);
        } catch (error) {
          this.logger.error(`Error instantiating processor ${taskKey}: ${error}`);
          throw new ProcessorInstantiationError(`Failed to create processor for ${taskKey}`, error);
        }
      } else {
        this.logger.error(`Processor not found for taskKey: ${taskKey}.`);
        throw new ProcessorNotFoundError(`Processor not found for taskKey: ${taskKey}`);
      }
    }

    registerProcessor(taskKey: string, processorClass: typeof DocumentProcessor) {
      this.processorMap[taskKey] = processorClass;
    }
  }

  class ProcessorNotFoundError extends Error {}
  class ProcessorInstantiationError extends Error {}
  ```
- This allows for registering processors dynamically, perhaps during application startup by loading them from a configuration file.

#### 4. Configuration-Driven Registration
- Load the `processorMap` from a configuration file (e.g., JSON) during application startup for maximum flexibility.
- **Example JSON config:**
  ```json
  {
    "mission-vision-core-values": "../documentTemplates/strategic-statements/strategicStatementsProcessor.ts#MissionVisionCoreValuesProcessor",
    "project-purpose": "../documentTemplates/strategic-statements/strategicStatementsProcessor.ts#ProjectPurposeProcessor"
  }
  ```
- **Example loader snippet:**
  ```typescript
  import processorConfig from './processor-config.json';
  for (const [taskKey, modulePathAndClass] of Object.entries(processorConfig)) {
    const [modulePath, className] = modulePathAndClass.split('#');
    import(modulePath).then(mod => {
      factory.registerProcessor(taskKey, mod[className]);
    });
  }
  ```

#### 5. Dependency Injection
- Use a dependency injection container (like [InversifyJS](https://inversify.io/)) or a simple service locator pattern for passing dependencies to processors.
- Example (simplified service locator):
  ```typescript
  interface Dependencies {
    contextManager: ContextManager;
    aiService: AIService;
  }

  export class ProcessorFactory {
    constructor(private dependencies: Dependencies, private logger: ILogger) {}
    // ... (rest of the code using dependencies.contextManager etc.)
  }
  ```

#### 6. Testing the Factory
- Add unit tests for the ProcessorFactory using a framework like Jest or Mocha.
- **Benefits of Jest:** Mocking, snapshot testing, code coverage reporting.
- Write unit tests for:
  - Successful processor retrieval and instantiation
  - Fallback to legacy processors
  - Error handling (including custom errors)
- Add integration tests to check interaction with other modules.

#### 7. Error Handling
- Use custom error classes (e.g., `ProcessorNotFoundError`, `ProcessorInstantiationError`) for more granular error handling and easier debugging.
- Log errors at a high level and throw when appropriate.

#### 8. Backward Compatibility
- Create a shim or adapter layer to handle calls to old import paths and redirect them to the new factory.
- This allows a graceful transition period before removing legacy code entirely.

#### 9. Performance (Optional/Future)
- For very large numbers of processors, consider using dynamic imports (`import()`) to load processors only when needed.
- This avoids loading unnecessary code during startup and can be implemented as a future optimization.

#### 10. Update Generator Registry
- In `src/modules/documentGenerator/index.ts`, remove direct processor imports.
- Use the new factory to obtain processors as needed.
- This keeps orchestration and processor wiring separate and scalable.

#### 11. Update Document Configuration
- In `src/modules/documentGenerator/generationTasks.ts`, ensure new document types and categories are registered and available for generation.

#### 12. Update Context Relationships
- In `src/modules/contextManager.ts`, update `initializeDocumentRelationships` to include new document types and their dependencies for context enrichment.

#### 13. Test Thoroughly
- Run the generator and validate that:
  - All new processors are invoked correctly.
  - Documents are generated with the correct context and structure.
  - No legacy processor code is being used for migrated document types.

#### 14. Document the Change
- Update `STEPS-TO-IMPLEMENT-NEW-DOCS.md` and `ARCHITECTURE.md` to reference the new factory and modular approach.
- Add migration notes and troubleshooting for future contributors.

#### 15. Deprecate Legacy Code
- Mark legacy processor files as deprecated.
- Remove them after confirming all document types have been migrated.

---

### Reference Implementation

The `strategic-statements` category is the reference implementation for this migration. Follow its structure and integration as a model for all future migrations.

---

### Notes
- This plan ensures a smooth, incremental migration to a scalable, maintainable, and modular document generation system.
- Update this plan as new categories or requirements emerge.

---

*End of Plan*
