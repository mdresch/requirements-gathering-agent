# Checklist: Creating the Data Governance Framework Document Type in Requirements Gathering Agent

This checklist details the steps to add a new `data-governance-framework` document type, following the official implementation process and DMBOK best practices.

---

## 1. Plan & Specify
- [x] Define the document category (DMBOK, Governance, Management Plans)
- [x] Create a specification for `data-governance-framework` (name: Data Governance Framework, category: DMBOK, fileName: data-governance-framework.md, description: Defines the structure, roles, policies, and processes for data governance in the ADPA project, DMBOK/PMBOK alignment: DMBOK 2.0, dependencies: Data Management Strategy, estimated tokens: 3500, priority: High)
- [x] Ensure the category exists in configuration, or update configuration and documentation if introducing a new category

## 2. Build Context & Relationships
- [x] Ensure project context is clear and complete (project name, type, description, stakeholders, goals, constraints)
- [x] Register `data-governance-framework` in `initializeDocumentRelationships` in `src/modules/contextManager.ts` for context enrichment

## 3. Create Template & Processor
- [x] Create a new subdirectory under `src/modules/documentTemplates/` for the category if needed (e.g., `dmbok/`)
- [x] Add the template file (e.g., `DataGovernanceFrameworkTemplate.ts`) with a `buildPrompt(context)` method
- [x] Add the processor file (e.g., `DataGovernanceFrameworkProcessor.ts`) implementing the `DocumentProcessor` interface with a `process(context)` method

## 4. Register in Configuration
- [x] Add an entry to `src/modules/documentGenerator/processor-config.json` for `data-governance-framework` with the correct module path, class name, dependencies, and priority

## 5. Update Generation Tasks
- [x] Add a `GenerationTask` entry in `src/modules/documentGenerator/generationTasks.ts` under `GENERATION_TASKS` for `data-governance-framework` (key, name, category, func, emoji, priority, dmbokRef)
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
- [x] Add unit and/or integration tests for the processor
- [x] Ensure all tests pass

## 9. Document & Finalize
- [x] Update documentation (e.g., `ARCHITECTURE.md`, `STEPS-TO-IMPLEMENT-NEW-DOCS.md`, README) to reference the new document type
- [x] If a new category, update migration plan and reference implementation notes

---

### Additional Checklist for Complex/Checklist-Style Documents
- [x] Use a detailed, sectioned structure for the governance framework, modeled after DMBOK and industry best practices
- [x] Ensure all major governance domains and DMBOK-aligned sections are included
- [x] Implement the processor to output a rich Markdown document with headings, tables, and explanatory text
- [x] Use the project context (e.g., project name) to personalize the framework
- [x] Validate that the generated document matches the intended structure and content
- [x] Remove duplicate or alias keys from configuration—use a single canonical key
- [x] Ensure the output path and filename match the intended folder structure
- [x] Add a test to verify that all major sections and required content are present in the output
- [x] Update documentation and CLI help to reference only the canonical key

---

*For more details, see the full `STEPS-TO-IMPLEMENT-NEW-DOCS.md` guide.*
