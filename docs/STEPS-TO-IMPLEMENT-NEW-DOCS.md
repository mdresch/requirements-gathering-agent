# Steps to Implement New Document Types

This guide provides step-by-step instructions for adding new document types to the Requirements Gathering Agent.

## 1. Create Template and Processor Files

- Create a new directory in `src/modules/documentTemplates` for your new document's category (e.g., `planning`) if it doesn't already exist.
- Inside the new directory, create two files:
  - `YourDocumentNameTemplate.ts`: This file will contain the template for your document. It should export a class that takes the project context as a constructor argument and has a `generateContent()` method that returns the document's structure as a string.
  - `YourDocumentNameProcessor.ts`: This file will contain the processor for your document. It should export a class that implements the `DocumentProcessor` interface. The `process()` method should instantiate your template, generate the content, and then use the `AIProcessor` to populate the template with AI-generated text.

## 2. Register the Processor

- Open `src/modules/documentGenerator/processor-config.json`.
- Add a new entry for your document. The key should be the document's identifier (e.g., `data-quality-management-plan`), and the value should be an object with the following properties:
  - `module`: The path to your processor file, followed by a `#` and the name of your processor class (e.g., `../documentTemplates/planning/DataQualityManagementPlanProcessor.ts#DataQualityManagementPlanProcessor`).
  - `dependencies`: An array of document keys that your document depends on.
  - `priority`: A number from 1-10 that determines the order in which the document is generated.

## 3. Add a Generation Task

- Open `src/modules/documentGenerator/generationTasks.ts`.
- Add a new entry to the `GENERATION_TASKS` array for your document. This object should include the following properties:
  - `key`: The same identifier you used in `processor-config.json`.
  - `name`: A human-readable name for your document.
  - `category`: The category your document belongs to.
  - `func`: The name of the function that will be called to generate the document (this should match the `key`).
  - `emoji`: An emoji to represent your document.
  - `priority`: The same priority you used in `processor-config.json`.
  - `pmbok`: The PMBOK process group that your document belongs to.

## 4. Add File Manager Configuration

- Open `src/modules/fileManager.ts`.
- Add a new entry to the `DOCUMENT_CONFIG` object for your document. This object should include the following properties:
  - `key`: The same identifier you used in the previous steps.
  - `fileName`: The name of the file that will be generated.
  - `category`: The same category you used in the previous steps.

## 5. Test and Validate

- Build the project by running `npm run build`.
- Run the generator in verbose mode to check for correct processor loading: `node dist/cli.js generate your-document-key --verbose`.
- List the available tasks to confirm that your new document is included: `node dist/cli.js list-templates`.
- Validate that the output file is created and correct by viewing the generated file in the `generated-documents` directory.

## 6. Update Documentation

- Update `docs/README.md` and any other relevant documentation to reflect the addition of the new document type.