# Checklist: Implementing the Program Charter Template

This checklist outlines the tasks required to add the **Program Charter** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files
- [ ] Create the template file: `src/modules/documentTemplates/pppm/ProgramCharterTemplate.ts`
- [ ] Implement the `ProgramCharterTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/pppm/ProgramCharterProcessor.ts`
- [ ] Implement the `ProgramCharterProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor
- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `program-charter`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, if any.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task
- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `program-charter`.
- [ ] Ensure the following fields are correctly filled out:
  - [ ] `key`: 'program-charter'
  - [ ] `name`: 'Program Charter'
  - [ ] `category`: 'pppm'
  - [ ] `func`: 'generateProgramCharter'
  - [ ] `emoji`: '📘'
  - [ ] `priority`: 15
  - [ ] `pmbokRef`: 'PMBOK: Program Charter'

## 4. Add File Manager Configuration
- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `program-charter`.
- [ ] Specify the following properties:
  - [ ] `title`: 'Program Charter'
  - [ ] `filename`: 'pppm/program-charter.md'
  - [ ] `category`: DOCUMENT_CATEGORIES.PPPM
  - [ ] `description`: 'Defines program vision, objectives, components, benefits, governance, and success criteria.'
  - [ ] `generatedAt`: ''

## 5. Test and Validate
- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate program-charter --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/pppm/program-charter.md` to ensure its content and formatting are correct.

## 6. Update Documentation
- [ ] Update `README.md` to include the new **Program Charter** document in the PPPM section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)
The document should include the following sections:
1. Program Overview
2. Program Vision & Objectives
3. Program Components
4. Benefits Realization
5. Governance Structure
6. Success Criteria
