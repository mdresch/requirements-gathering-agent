# Checklist: Implementing the Portfolio Dashboard Template

This checklist outlines the tasks required to add the **Portfolio Dashboard** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files
- [ ] Create the template file: `src/modules/documentTemplates/pppm/PortfolioDashboardTemplate.ts`
- [ ] Implement the `PortfolioDashboardTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/pppm/PortfolioDashboardProcessor.ts`
- [ ] Implement the `PortfolioDashboardProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor
- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `portfolio-dashboard`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, if any.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task
- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `portfolio-dashboard`.
- [ ] Ensure the following fields are correctly filled out:
  - [ ] `key`: 'portfolio-dashboard'
  - [ ] `name`: 'Portfolio Dashboard'
  - [ ] `category`: 'pppm'
  - [ ] `func`: 'generatePortfolioDashboard'
  - [ ] `emoji`: '📈'
  - [ ] `priority`: 17
  - [ ] `pmbokRef`: 'PMBOK: Portfolio Dashboard'

## 4. Add File Manager Configuration
- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `portfolio-dashboard`.
- [ ] Specify the following properties:
  - [ ] `title`: 'Portfolio Dashboard'
  - [ ] `filename`: 'pppm/portfolio-dashboard.md'
  - [ ] `category`: DOCUMENT_CATEGORIES.PPPM
  - [ ] `description`: 'Aggregates and visualizes performance, health, risks, and benefits across multiple projects/programs.'
  - [ ] `generatedAt`: ''

## 5. Test and Validate
- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate portfolio-dashboard --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/pppm/portfolio-dashboard.md` to ensure its content and formatting are correct.

## 6. Update Documentation
- [ ] Update `README.md` to include the new **Portfolio Dashboard** document in the PPPM section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)
The document should include the following sections:
1. Portfolio Overview
2. Executive Summary
3. Portfolio Performance Metrics
4. Resource Utilization
5. Benefits Tracking
6. Top Risks & Issues
7. Upcoming Decisions
8. Recommendations
