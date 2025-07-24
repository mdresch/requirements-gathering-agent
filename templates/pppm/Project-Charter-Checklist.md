# Checklist: Implementing the Project Charter Template

This checklist outlines the tasks required to add the **Project Charter** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files
- [ ] Create the template file: `src/modules/documentTemplates/pppm/ProjectCharterTemplate.ts`
- [ ] Implement the `ProjectCharterTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/pppm/ProjectCharterProcessor.ts`
- [ ] Implement the `ProjectCharterProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor
- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `project-charter`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, if any.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task
- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `project-charter`.
- [ ] Ensure the following fields are correctly filled out:
  - [ ] `key`: 'project-charter'
  - [ ] `name`: 'Project Charter'
  - [ ] `category`: 'pppm'
  - [ ] `func`: 'generateProjectCharter'
  - [ ] `emoji`: '📄'
  - [ ] `priority`: 10
  - [ ] `pmbokRef`: 'PMBOK: Project Charter'

## 4. Add File Manager Configuration
- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `project-charter`.
- [ ] Specify the following properties:
  - [ ] `title`: 'Project Charter'
  - [ ] `filename`: 'pppm/project-charter.md'
  - [ ] `category`: DOCUMENT_CATEGORIES.PPPM
  - [ ] `description`: 'Defines project purpose, objectives, scope, stakeholders, and authorization.'
  - [ ] `generatedAt`: ''

## 5. Test and Validate
- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate project-charter --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/pppm/project-charter.md` to ensure its content and formatting are correct.

## 6. Update Documentation
- [ ] Update `README.md` to include the new **Project Charter** document in the PPPM section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)
The document should include the following sections:
1. Project Overview
2. Business Case
3. Project Objectives
4. Success Criteria
5. Scope Definition
6. Stakeholder Matrix
7. High-Level Timeline
8. Budget Overview
9. Risk Summary
10. Authorization
