# Checklist: Implementing the Risk Register Template

This checklist outlines the tasks required to add the **Risk Register** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files
- [ ] Create the template file: `src/modules/documentTemplates/pppm/RiskRegisterTemplate.ts`
- [ ] Implement the `RiskRegisterTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/pppm/RiskRegisterProcessor.ts`
- [ ] Implement the `RiskRegisterProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor
- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `risk-register`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, if any.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task
- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `risk-register`.
- [ ] Ensure the following fields are correctly filled out:
  - [ ] `key`: 'risk-register'
  - [ ] `name`: 'Risk Register'
  - [ ] `category`: 'pppm'
  - [ ] `func`: 'generateRiskRegister'
  - [ ] `emoji`: '⚠️'
  - [ ] `priority`: 13
  - [ ] `pmbokRef`: 'PMBOK: Risk Register'

## 4. Add File Manager Configuration
- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `risk-register`.
- [ ] Specify the following properties:
  - [ ] `title`: 'Risk Register'
  - [ ] `filename`: 'pppm/risk-register.md'
  - [ ] `category`: DOCUMENT_CATEGORIES.PPPM
  - [ ] `description`: 'Identifies, assesses, and manages project/program risks.'
  - [ ] `generatedAt`: ''

## 5. Test and Validate
- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate risk-register --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/pppm/risk-register.md` to ensure its content and formatting are correct.

## 6. Update Documentation
- [ ] Update `README.md` to include the new **Risk Register** document in the PPPM section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)
The document should include the following sections:
1. Risk Register Table
2. Risk Categories
3. Risk Scoring Matrix
