# Checklist: Implementing the Lessons Learned Template

This checklist outlines the tasks required to add the **Lessons Learned** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files
- [ ] Create the template file: `src/modules/documentTemplates/pppm/LessonsLearnedTemplate.ts`
- [ ] Implement the `LessonsLearnedTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/pppm/LessonsLearnedProcessor.ts`
- [ ] Implement the `LessonsLearnedProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor
- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `lessons-learned`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, if any.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task
- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `lessons-learned`.
- [ ] Ensure the following fields are correctly filled out:
  - [ ] `key`: 'lessons-learned'
  - [ ] `name`: 'Lessons Learned'
  - [ ] `category`: 'pppm'
  - [ ] `func`: 'generateLessonsLearned'
  - [ ] `emoji`: '📝'
  - [ ] `priority`: 18
  - [ ] `pmbokRef`: 'PMBOK: Lessons Learned'

## 4. Add File Manager Configuration
- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `lessons-learned`.
- [ ] Specify the following properties:
  - [ ] `title`: 'Lessons Learned'
  - [ ] `filename`: 'pppm/lessons-learned.md'
  - [ ] `category`: DOCUMENT_CATEGORIES.PPPM
  - [ ] `description`: 'Captures project/program outcomes, what went well, what went wrong, key insights, recommendations, metrics, and action items for future improvement.'
  - [ ] `generatedAt`: ''

## 5. Test and Validate
- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate lessons-learned --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/pppm/lessons-learned.md` to ensure its content and formatting are correct.

## 6. Update Documentation
- [ ] Update `README.md` to include the new **Lessons Learned** document in the PPPM section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)
The document should include the following sections:
1. Project Information
2. Project Summary
3. What Went Well
4. What Went Wrong
5. Key Insights & Recommendations
6. Metrics & Performance
7. Action Items for Organization
8. Knowledge Artifacts Created
9. Contacts for Future Reference
