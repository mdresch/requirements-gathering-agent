# Checklist: Creating an Acceptance Criteria Component in Requirements Gathering Agent

This checklist outlines the steps required to add a new Acceptance Criteria component/document type, following the established process for new document types.

---

## 1. Plan & Specify
- [x] Define the Acceptance Criteria component's purpose and scope
- [x] Specify the document name, category, fileName, description, PMBOK/BABOK alignment, dependencies, estimated tokens, and priority
- [x] Ensure the category exists in configuration, or update configuration and documentation if introducing a new category

## 2. Build Context & Relationships
- [x] Ensure project context includes all relevant details (project name, type, description, user stories, requirements, stakeholders)
- [x] Register the Acceptance Criteria document in `initializeDocumentRelationships` in `src/modules/contextManager.ts` if it should participate in context enrichment

## 3. Create Template & Processor
- [x] Add `AcceptancecriteriaTemplate.ts` with a `generateContent(context)` method under the appropriate category in `src/modules/documentTemplates/`
- [x] Add `AcceptancecriteriaProcessor.ts` implementing the `DocumentProcessor` interface with a `process(context)` method

## 4. Register in Configuration
- [x] Add an entry to `src/modules/documentGenerator/processor-config.json` with the correct module path, class name, dependencies, and priority

## 5. Update Generation Tasks
- [x] Add a `GenerationTask` entry in `src/modules/documentGenerator/generationTasks.ts` under `GENERATION_TASKS` (key, name, category, func, emoji, priority, pmbokRef)
- [x] Update `DOCUMENT_CONFIG` in the same file to map the key to the correct filename and title

## 6. Update File Manager (if needed)
- [x] Insert a new entry into `fileManager.ts`’s `DOCUMENT_CONFIG` for version control
- [x] Append the new category to `DOCUMENT_CATEGORIES` in `fileManager.ts` if it doesn’t already exist

## 7. Validate Processor Registration
- [x] Verify `ProcessorFactory` can dynamically import and register the new processor
- [x] Confirm `DocumentGenerator` has a method matching the `func` name

## 8. Test & Validate
- [ ] Run the generator in verbose mode and check for correct processor loading
- [ ] List available tasks to confirm inclusion
- [ ] Run the generator and validate the output file is created and correct
- [ ] Add unit and/or integration tests for the Acceptance Criteria processor
- [ ] Ensure all tests pass

## 9. Document & Finalize
- [ ] Update documentation (e.g., `ARCHITECTURE.md`, `STEPS-TO-IMPLEMENT-NEW-DOCS.md`, README) to reference the Acceptance Criteria component
- [ ] If a new category, update migration plan and reference implementation notes

---

### Additional Checklist for Acceptance Criteria Documents
- [ ] Ensure each acceptance criterion is clear, testable, and traceable to a requirement or user story
- [ ] Use consistent markdown formatting (e.g., checkboxes, bullet points, or tables)
- [ ] Validate that the generated document matches the intended structure and content
- [ ] Remove duplicate or alias keys from configuration—use a single canonical key
- [ ] Ensure the output path and filename match the intended folder structure
- [ ] Add a test to verify that all major sections and acceptance criteria are present in the output
- [ ] Update documentation and CLI help to reference only the canonical Acceptance Criteria key

---

*For more details, see the full `STEPS-TO-IMPLEMENT-NEW-DOCS.md` guide.*
