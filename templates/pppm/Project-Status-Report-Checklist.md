# Checklist: Implementing the Project Status Report Template

This checklist outlines the tasks required to add the **Project Status Report** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files
- [ ] Create the template file: `src/modules/documentTemplates/pppm/ProjectStatusReportTemplate.ts`
- [ ] Implement the `ProjectStatusReportTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/pppm/ProjectStatusReportProcessor.ts`
- [ ] Implement the `ProjectStatusReportProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor
- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `project-status-report`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, if any.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task
- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `project-status-report`.
- [ ] Ensure the following fields are correctly filled out:
  - [ ] `key`: 'project-status-report'
  - [ ] `name`: 'Project Status Report'
  - [ ] `category`: 'pppm'
  - [ ] `func`: 'generateProjectStatusReport'
  - [ ] `emoji`: '📊'
  - [ ] `priority`: 12
  - [ ] `pmbokRef`: 'PMBOK: Status Report'

## 4. Add File Manager Configuration
- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `project-status-report`.
- [ ] Specify the following properties:
  - [ ] `title`: 'Project Status Report'
  - [ ] `filename`: 'pppm/project-status-report.md'
  - [ ] `category`: DOCUMENT_CATEGORIES.PPPM
  - [ ] `description`: 'Tracks project progress, accomplishments, milestones, budget, schedule, issues, risks, action items, and next period focus.'
  - [ ] `generatedAt`: ''

## 5. Test and Validate
- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate project-status-report --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/pppm/project-status-report.md` to ensure its content and formatting are correct.

## 6. Update Documentation
- [ ] Update `README.md` to include the new **Project Status Report** document in the PPPM section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)
The document should include the following sections:
1. Executive Summary
2. Key Accomplishments
3. Upcoming Milestones
4. Progress Summary
5. Budget Status
6. Schedule Performance
7. Key Issues & Risks
8. Action Items
9. Next Period Focus
