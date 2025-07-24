# Checklist: Implementing the Work Breakdown Structure (WBS) Template

This checklist outlines the tasks required to add the **Work Breakdown Structure (WBS)** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files
- [ ] Create the template file: `src/modules/documentTemplates/pppm/WBSTemplate.ts`
- [ ] Implement the `WBSTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/pppm/WBSProcessor.ts`
- [ ] Implement the `WBSProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor
- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `work-breakdown-structure`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, if any.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task
- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `work-breakdown-structure`.
- [ ] Ensure the following fields are correctly filled out:
  - [ ] `key`: 'work-breakdown-structure'
  - [ ] `name`: 'Work Breakdown Structure (WBS)'
  - [ ] `category`: 'pppm'
  - [ ] `func`: 'generateWBS'
  - [ ] `emoji`: '🗂️'
  - [ ] `priority`: 11
  - [ ] `pmbokRef`: 'PMBOK: WBS'

## 4. Add File Manager Configuration
- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `work-breakdown-structure`.
- [ ] Specify the following properties:
  - [ ] `title`: 'Work Breakdown Structure (WBS)'
  - [ ] `filename`: 'pppm/work-breakdown-structure.md'
  - [ ] `category`: DOCUMENT_CATEGORIES.PPPM
  - [ ] `description`: 'Hierarchical decomposition of project deliverables and work packages.'
  - [ ] `generatedAt`: ''

## 5. Test and Validate
- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate work-breakdown-structure --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/pppm/work-breakdown-structure.md` to ensure its content and formatting are correct.

## 6. Update Documentation
- [ ] Update `README.md` to include the new **Work Breakdown Structure (WBS)** document in the PPPM section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)
The document should include the following sections:
1. Project Management
2. Requirements & Design
3. Implementation
4. Deployment & Training
