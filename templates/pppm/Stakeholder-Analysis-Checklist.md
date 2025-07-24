# Checklist: Implementing the Stakeholder Analysis & Communication Plan Template

This checklist outlines the tasks required to add the **Stakeholder Analysis & Communication Plan** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files
- [ ] Create the template file: `src/modules/documentTemplates/pppm/StakeholderAnalysisTemplate.ts`
- [ ] Implement the `StakeholderAnalysisTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/pppm/StakeholderAnalysisProcessor.ts`
- [ ] Implement the `StakeholderAnalysisProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor
- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `stakeholder-analysis`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, if any.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task
- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `stakeholder-analysis`.
- [ ] Ensure the following fields are correctly filled out:
  - [ ] `key`: 'stakeholder-analysis'
  - [ ] `name`: 'Stakeholder Analysis & Communication Plan'
  - [ ] `category`: 'pppm'
  - [ ] `func`: 'generateStakeholderAnalysis'
  - [ ] `emoji`: '👥'
  - [ ] `priority`: 16
  - [ ] `pmbokRef`: 'PMBOK: Stakeholder Analysis'

## 4. Add File Manager Configuration
- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `stakeholder-analysis`.
- [ ] Specify the following properties:
  - [ ] `title`: 'Stakeholder Analysis & Communication Plan'
  - [ ] `filename`: 'pppm/stakeholder-analysis.md'
  - [ ] `category`: DOCUMENT_CATEGORIES.PPPM
  - [ ] `description`: 'Identifies stakeholders, analyzes their influence/interest, and defines engagement and communication strategies.'
  - [ ] `generatedAt`: ''

## 5. Test and Validate
- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate stakeholder-analysis --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/pppm/stakeholder-analysis.md` to ensure its content and formatting are correct.

## 6. Update Documentation
- [ ] Update `README.md` to include the new **Stakeholder Analysis & Communication Plan** document in the PPPM section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)
The document should include the following sections:
1. Stakeholder Analysis Matrix
2. Communication Plan
3. Stakeholder Engagement Activities
