# Checklist: Implementing the Change Request Form Template

This checklist outlines the tasks required to add the **Change Request Form** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files
- [ ] Create the template file: `src/modules/documentTemplates/pppm/ChangeRequestTemplate.ts`
- [ ] Implement the `ChangeRequestTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/pppm/ChangeRequestProcessor.ts`
- [ ] Implement the `ChangeRequestProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor
- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `change-request`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, if any.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task
- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `change-request`.
- [ ] Ensure the following fields are correctly filled out:
  - [ ] `key`: 'change-request'
  - [ ] `name`: 'Change Request Form'
  - [ ] `category`: 'pppm'
  - [ ] `func`: 'generateChangeRequest'
  - [ ] `emoji`: '🔄'
  - [ ] `priority`: 14
  - [ ] `pmbokRef`: 'PMBOK: Change Request'

## 4. Add File Manager Configuration
- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `change-request`.
- [ ] Specify the following properties:
  - [ ] `title`: 'Change Request Form'
  - [ ] `filename`: 'pppm/change-request.md'
  - [ ] `category`: DOCUMENT_CATEGORIES.PPPM
  - [ ] `description`: 'Documents and manages changes to scope, schedule, budget, or resources.'
  - [ ] `generatedAt`: ''

## 5. Test and Validate
- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate change-request --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/pppm/change-request.md` to ensure its content and formatting are correct.

## 6. Update Documentation
- [ ] Update `README.md` to include the new **Change Request Form** document in the PPPM section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)
The document should include the following sections:
1. Change Request Details
2. Change Description
3. Business Justification
4. Impact Analysis
5. Alternatives Considered
6. Stakeholder Impact
7. Approval Section
