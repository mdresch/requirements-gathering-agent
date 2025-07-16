# Checklist: Creating a Data Governance Plan Document in Requirements Gathering Agent

This checklist summarizes the steps required to add a Data Governance Plan document, following the official implementation guide and DMBOK best practices.

---

## 1. Plan & Specify
## 1. Plan & Specify
- [x] Define the document category (e.g., Management Plans, DMBOK)
- [x] Create a specification for the Data Governance Plan (name, category, fileName, description, DMBOK alignment, dependencies, estimated tokens, priority)
- [x] Ensure the category exists in configuration, or update configuration and documentation if introducing a new category

## 2. Build Context & Relationships

## 3. Create Template & Processor
- [x] Create a new subdirectory under `src/modules/documentTemplates/` for DMBOK Management Plans (if needed)
- [x] Add the template file (e.g., `DataGovernancePlanTemplate.ts`) with a `generateContent(context)` method
- [x] Add the processor file (e.g., `DataGovernancePlanProcessor.ts`) implementing the `DocumentProcessor` interface with a `process(context)` method

## 4. Register in Configuration
- [x] Add an entry to `src/modules/documentGenerator/processor-config.json` with the correct module path, class name, dependencies, and priority

## 5. Update Generation Tasks
- [x] Add a `GenerationTask` entry in `src/modules/documentGenerator/generationTasks.ts` under `GENERATION_TASKS` (key, name, category, func, emoji, priority, dmbokRef)
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
- [ ] Add unit and/or integration tests for the Data Governance Plan processor
- [ ] Ensure all tests pass

## 9. Document & Finalize
- [ ] Update documentation (e.g., `ARCHITECTURE.md`, `STEPS-TO-IMPLEMENT-NEW-DOCS.md`, README) to reference the Data Governance Plan document
- [ ] If a new category, update migration plan and reference implementation notes

---

### Additional Checklist for Data Governance Plan Content
- [ ] Define governance structure (roles, responsibilities, committees)
- [ ] Specify data policies, standards, and procedures
- [ ] Include data stewardship and ownership assignments
- [ ] Address compliance, risk management, and audit requirements
- [ ] Outline communication and training plans
- [ ] Include metrics for monitoring and continuous improvement
- [ ] Validate that the generated document matches the intended structure and content
- [ ] Add a test to verify that all major sections and governance elements are present in the output
- [ ] Update documentation and CLI help to reference only the canonical Data Governance Plan key

---

*For more details, see the full `STEPS-TO-IMPLEMENT-NEW-DOCS.md` guide.*
