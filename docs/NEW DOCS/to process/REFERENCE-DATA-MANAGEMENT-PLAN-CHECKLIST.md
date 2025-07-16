# Checklist: Implementing the Reference Data Management Plan Document

This checklist outlines the tasks required to add the **Reference Data Management Plan** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files

- [ ] Create the template file: `src/modules/documentTemplates/dmbok/ReferenceDataManagementPlanTemplate.ts`
- [ ] Implement the `ReferenceDataManagementPlanTemplate` class with a `generateContent()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/dmbok/ReferenceDataManagementPlanProcessor.ts`
- [ ] Implement the `ReferenceDataManagementPlanProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor

- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `reference-data-management-plan`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, such as `metadata-management-framework`.
- [ ] Assign a `priority` for generation order.

## 3. Add a Generation Task

- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `reference-data-management-plan`.
- [ ] Ensure the `key`, `name`, `category`, `func`, `emoji`, `priority`, and `pmbokRef` fields are correctly filled out.

## 4. Add File Manager Configuration

- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `reference-data-management-plan`.
- [ ] Specify the `key`, `fileName`, and `category`.

## 5. Test and Validate

- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate reference-data-management-plan --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/dmbok/reference-data-management-plan.md` to ensure its content and formatting are correct.

## 6. Update Documentation

- [ ] Update `docs/README.md` to include the new **Reference Data Management Plan** document in the DMBOK section and usage examples.
