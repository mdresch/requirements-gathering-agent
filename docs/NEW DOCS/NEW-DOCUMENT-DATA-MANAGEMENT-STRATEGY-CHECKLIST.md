# Checklist: Creating the `data-management-strategy` Document Type in Requirements Gathering Agent

This checklist details the steps to add the new `data-management-strategy` document type, following the official implementation process.

---

## 1. Plan & Specify
- [x] Define the document category (e.g., Technical Analysis, Management Plans, etc.)
- [x] Create a specification for `data-management-strategy` (name: Data Management Strategy, category, fileName: data-management-strategy.md, description, PMBOK alignment, dependencies, estimated tokens, priority)
- [x] Ensure the category exists in configuration, or update configuration and documentation if introducing a new category

## 2. Build Context & Relationships
- [x] Ensure project context is clear and complete (project name, type, description, stakeholders, goals, constraints)
- [x] Register `data-management-strategy` in `initializeDocumentRelationships` in `src/modules/contextManager.ts` if it should participate in context enrichment

## 3. Create Template & Processor
- [x] Create a new subdirectory under `src/modules/documentTemplates/` for the category if needed (e.g., `dmbok/`)
- [x] Add the template file (e.g., `dataManagementStrategyTemplate.ts`) with a `buildPrompt(context)` method
- [x] Add the processor file (e.g., `dataManagementStrategyProcessor.ts`) implementing the `DocumentProcessor` interface with a `process(context)` method

## 4. Register in Configuration
- [x] Add an entry to `src/modules/documentGenerator/processor-config.json` for `data-management-strategy` with the correct module path, class name, dependencies, and priority

## 5. Update Generation Tasks
- [x] Add a `GenerationTask` entry in `src/modules/documentGenerator/generationTasks.ts` under `GENERATION_TASKS` for `data-management-strategy` (key, name, category, func, emoji, priority, pmbokRef)
- [x] Update `DOCUMENT_CONFIG` in the same file to map the key to the correct filename and title

## 6. Update File Manager (if needed)
- [x] Insert a new entry into `fileManager.ts`’s `DOCUMENT_CONFIG` for version control
- [x] Append the new category to `DOCUMENT_CATEGORIES` in `fileManager.ts` if it doesn’t already exist

## 7. Validate Processor Registration
- [x] Verify `ProcessorFactory` can dynamically import and register the new processor
- [x] Confirm `DocumentGenerator` has a method matching the `func` name

## 8. Test & Validate
- [x] Run the generator in verbose mode and check for correct processor loading
- [x] List available tasks to confirm inclusion
- [x] Run the generator and validate the output file is created and correct
- [ ] Add unit and/or integration tests for the processor
- [x] Ensure all tests pass (except for the missing test above)

## 9. Document & Finalize
- [x] Update documentation (e.g., `ARCHITECTURE.md`, `STEPS-TO-IMPLEMENT-NEW-DOCS.md`, README) to reference the new document type
- [x] If a new category, update migration plan and reference implementation notes

---

### Additional Checklist for Complex/Checklist-Style Documents
- [x] Use a detailed, sectioned structure for the strategy document, modeled after DMBOK or industry best practices
- [x] Ensure all major data management domains and PMBOK-aligned sections are included
- [x] Implement the processor to output a rich Markdown document with headings, tables, and explanatory text
- [x] Use the project context (e.g., project name) to personalize the strategy
- [x] Validate that the generated document matches the intended structure and content
- [x] Remove duplicate or alias keys from configuration—use a single canonical key
- [x] Ensure the output path and filename match the intended folder structure
- [ ] Add a test to verify that all major sections and required content are present in the output
- [x] Update documentation and CLI help to reference only the canonical key

---

*For more details, see the full `STEPS-TO-IMPLEMENT-NEW-DOCS.md` guide.*
