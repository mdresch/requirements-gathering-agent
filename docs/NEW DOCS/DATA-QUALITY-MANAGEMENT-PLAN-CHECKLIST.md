# Checklist: Creating a Data Quality Management Plan

This checklist summarizes the steps required to add a new document type to the Requirements Gathering Agent, based on the official implementation guide.

---

## 1. Plan & Specify
- [x] Define the document category (e.g., Core Analysis, Management Plans, etc.)
- [x] Create a specification for the new document (name, category, fileName, description, PMBOK alignment, dependencies, estimated tokens, priority)
- [x] Ensure the category exists in configuration, or update configuration and documentation if introducing a new category

## 2. Build Context & Relationships
- [x] Ensure project context is clear and complete (project name, type, description, stakeholders, goals, constraints)
- [x] Register the new document in `initializeDocumentRelationships` in `src/modules/contextManager.ts` if it should participate in context enrichment

## 3. Create Template & Processor
- [x] Create a new subdirectory under `src/modules/documentTemplates/` for the category (if needed)
- [x] Add the template file (e.g., `MyDocTemplate.ts`) with a `generateContent(context)` method
- [x] Add the processor file (e.g., `MyDocProcessor.ts`) implementing the `DocumentProcessor` interface with a `process(context)` method

## 4. Register in Configuration
- [x] Add an entry to `src/modules/documentGenerator/processor-config.json` with the correct module path, class name, dependencies, and priority

## 5. Update Generation Tasks
- [ ] Add a `GenerationTask` entry in `src/modules/documentGenerator/generationTasks.ts` under `GENERATION_TASKS` (key, name, category, func, emoji, priority, dmbokRef)
- [ ] Update `DOCUMENT_CONFIG` in the same file to map the key to the correct filename and title

## 6. Update File Manager (if needed)
- [x] Insert a new entry into `fileManager.ts`’s `DOCUMENT_CONFIG` for version control
- [x] If necessary, add a `DocumentMetadata` entry to `DOCUMENT_CONFIG` in `src/modules/fileManager.ts` if it doesn’t already exist

## 7. Validate Processor Registration
- [x] Verify `ProcessorFactory` can dynamically import and register the new processor
- [x] Confirm `DocumentGenerator` has a method matching the `func` name

## 8. Test & Validate
- [x] Run the generator in verbose mode and check for correct processor loading
- [x] List available tasks to confirm inclusion
- [x] Run the generator and validate the output file is created and correct
- [x] Add unit and/or integration tests for the new processor
- [x] Ensure all tests pass

## 9. Document & Finalize
- [ ] Update documentation (e.g., `ARCHITECTURE.md`, `STEPS-TO-IMPLEMENT-NEW-DOCS.md`, README) to reference the new document
- [ ] If a new category, update migration plan and reference implementation notes

---

*For more details, see the full `STEPS-TO-IMPLEMENT-NEW-DOCS.md` guide.*
