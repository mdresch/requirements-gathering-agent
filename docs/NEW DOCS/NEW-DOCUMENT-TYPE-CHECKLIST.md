# Checklist: Creating a New Document Type in Requirements Gathering Agent

This checklist summarizes the steps required to add a new document type to the Requirements Gathering Agent, based on the official implementation guide.

---

## 1. Plan & Specify
- [ ] Define the document category (e.g., Core Analysis, Management Plans, etc.)
- [ ] Create a specification for the new document (name, category, fileName, description, PMBOK alignment, dependencies, estimated tokens, priority)
- [ ] Ensure the category exists in configuration, or update configuration and documentation if introducing a new category

## 2. Build Context & Relationships
- [ ] Ensure project context is clear and complete (project name, type, description, stakeholders, goals, constraints)
- [ ] Register the new document in `initializeDocumentRelationships` in `src/modules/contextManager.ts` if it should participate in context enrichment

## 3. Create Template & Processor
- [ ] Create a new subdirectory under `src/modules/documentTemplates/` for the category (if needed)
- [ ] Add the template file (e.g., `MyDocTemplate.ts`) with a `generateContent(context)` method
- [ ] Add the processor file (e.g., `MyDocProcessor.ts`) implementing the `DocumentProcessor` interface with a `process(context)` method

## 4. Register in Configuration
- [ ] Add an entry to `src/modules/documentGenerator/processor-config.json` with the correct module path, class name, dependencies, and priority

## 5. Update Generation Tasks
- [ ] Add a `GenerationTask` entry in `src/modules/documentGenerator/generationTasks.ts` under `GENERATION_TASKS` (key, name, category, func, emoji, priority, pmbokRef)
- [ ] Update `DOCUMENT_CONFIG` in the same file to map the key to the correct filename and title

## 6. Update File Manager (if needed)
- [ ] Insert a new entry into `fileManager.ts`’s `DOCUMENT_CONFIG` for version control
- [ ] Append the new category to `DOCUMENT_CATEGORIES` in `fileManager.ts` if it doesn’t already exist

## 7. Validate Processor Registration
- [ ] Verify `ProcessorFactory` can dynamically import and register the new processor
- [ ] Confirm `DocumentGenerator` has a method matching the `func` name

## 8. Test & Validate
- [ ] Run the generator in verbose mode and check for correct processor loading
- [ ] List available tasks to confirm inclusion
- [ ] Run the generator and validate the output file is created and correct
- [ ] Add unit and/or integration tests for the processor
- [ ] Ensure all tests pass

## 9. Document & Finalize
- [ ] Update documentation (e.g., `ARCHITECTURE.md`, `STEPS-TO-IMPLEMENT-NEW-DOCS.md`, README) to reference the new document type
- [ ] If a new category, update migration plan and reference implementation notes

---

### Additional Checklist for Complex/Checklist-Style Documents
- [ ] Use a detailed, sectioned structure for checklists, modeled after real-world or Gitbook examples
- [ ] Ensure all major project phases and PMBOK-aligned sections are included
- [ ] Implement the processor to output a rich Markdown document with headings, checkboxes, and explanatory text
- [ ] Use the project context (e.g., project name) to personalize the checklist
- [ ] Validate that the generated document matches the intended structure and content
- [ ] Remove duplicate or alias keys from configuration—use a single canonical key
- [ ] Ensure the output path and filename match the intended folder structure
- [ ] Add a test to verify that all major sections and checkboxes are present in the output
- [ ] Update documentation and CLI help to reference only the canonical checklist key

---

*For more details, see the full `STEPS-TO-IMPLEMENT-NEW-DOCS.md` guide.*
