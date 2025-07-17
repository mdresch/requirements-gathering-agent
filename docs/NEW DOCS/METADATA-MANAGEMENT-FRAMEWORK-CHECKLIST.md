# Checklist: Implementing the Metadata Management Framework Document

This checklist outlines the tasks required to add the **Metadata Management Framework** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files

- [x] Create the template file: `src/modules/documentTemplates/dmbok/MetadataManagementFrameworkTemplate.ts`
- [x] Implement the `MetadataManagementFrameworkTemplate` class with a `generateContent()` method that defines the document structure.
- [x] Create the processor file: `src/modules/documentTemplates/dmbok/MetadataManagementFrameworkProcessor.ts`
- [x] Implement the `MetadataManagementFrameworkProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor

- [x] Open `src/modules/documentGenerator/processor-config.json`.
- [x] Add a new entry for `metadata-management-framework`.
- [x] Define the `module` path pointing to the new processor class.
- [x] List dependencies, such as `data-governance-framework`.
- [x] Assign a `priority` for generation order.

## 3. Add a Generation Task

- [x] Open `src/modules/documentGenerator/generationTasks.ts`.
- [x] Add a new task object to the `GENERATION_TASKS` array for `metadata-management-framework`.
- [x] Ensure the `key`, `name`, `category`, `func`, `emoji`, `priority`, and `pmbokRef` fields are correctly filled out.

## 4. Add File Manager Configuration

- [x] Open `src/modules/fileManager.ts`.
- [x] Add a new entry to the `DOCUMENT_CONFIG` object for `metadata-management-framework`.
- [x] Specify the `key`, `fileName`, and `category`.

## 5. Test and Validate

- [x] Build the project: `npm run build`
- [x] Run the generator for the new document with verbose output: `node dist/cli.js generate metadata-management-framework --verbose`
- [x] Verify the processor loads correctly without errors.
- [x] Confirm the new document is listed: `node dist/cli.js list-templates`
- [x] Inspect the generated file `generated-documents/dmbok/metadata-management-framework.md` to ensure its content and formatting are correct.

## 6. Update Documentation

- [x] Update `docs/README.md` to include the new **Metadata Management Framework** document in the DMBOK section and usage examples.
