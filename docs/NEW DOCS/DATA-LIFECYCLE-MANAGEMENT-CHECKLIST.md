# Checklist: Implementing the Data Lifecycle Management Policy

This checklist outlines the tasks required to add the **Data Lifecycle Management Policy** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files

- [x] Create the template file: `src/modules/documentTemplates/dmbok/DataLifecycleManagementTemplate.ts`
- [x] Implement the `DataLifecycleManagementTemplate` class with a `buildPrompt()` method that defines the document structure.
- [x] Create the processor file: `src/modules/documentTemplates/dmbok/DataLifecycleManagementProcessor.ts`
- [x] Implement the `DataLifecycleManagementProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor

- [x] Open `src/modules/documentGenerator/processor-config.json`.
- [x] Add a new entry for `data-lifecycle-management`.
- [x] Define the `module` path pointing to the new processor class.
- [x] List dependencies, such as `data-governance-plan` and `data-security-privacy-plan`.
- [x] Assign a `priority` for generation order (set to: 13).

## 3. Add a Generation Task

- [x] Open `src/modules/documentGenerator/generationTasks.ts`.
- [x] Add a new task object to the `GENERATION_TASKS` array for `data-lifecycle-management`.
- [x] Ensure the following fields are correctly filled out:
  - `key`: 'data-lifecycle-management'
  - `name`: 'Data Lifecycle Management Policy'
  - `category`: 'dmbok'
  - `func`: 'generateDataLifecycleManagement'
  - `emoji`: '🔄'
  - `priority`: 13
  - `pmbokRef`: 'DMBOK: Data Lifecycle Management'

## 4. Add File Manager Configuration

- [x] Open `src/modules/fileManager.ts`.
- [x] Add a new entry to the `DOCUMENT_CONFIG` object for `data-lifecycle-management`.
- [x] Specify the following properties:
  - `title`: 'Data Lifecycle Management Policy'
  - `filename`: 'dmbok/data-lifecycle-management-policy.md'
  - `category`: DOCUMENT_CATEGORIES.DMBOK
  - `description`: 'Comprehensive policy for managing data throughout its lifecycle from creation to archival and disposal.'
  - `generatedAt`: ''

## 5. Test and Validate

- [x] Build the project: `npm run build`
- [x] Run the generator for the new document with verbose output: `node dist/cli.js generate data-lifecycle-management --verbose`
- [x] Verify the processor loads correctly without errors.
- [x] Confirm the new document is listed: `node dist/cli.js list-templates`
- [x] Inspect the generated file `generated-documents/dmbok/data-lifecycle-management-policy.md` to ensure its content and formatting are correct.

## 6. Update Documentation

- [x] Update `README.md` to include the new **Data Lifecycle Management Policy** in the DMBOK section and usage examples.
- [x] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)

The document should include the following sections:

1. **Introduction**
   - Purpose and Objectives
   - Scope and Applicability
   - Policy Statement
   - Compliance Requirements

2. **Data Lifecycle Phases**
   - Creation and Capture
   - Storage and Maintenance
   - Usage and Sharing
   - Archival and Retention
   - Disposal and Destruction

3. **Roles and Responsibilities**
   - Data Owners
   - Data Stewards
   - IT Operations
   - End Users

4. **Retention and Archival**
   - Retention Schedules
   - Archival Procedures
   - Legal Holds
   - Compliance Requirements

5. **Data Disposal**
   - Secure Deletion Methods
   - Media Sanitization
   - Disposal Documentation
   - Audit Requirements

6. **Monitoring and Compliance**
   - Audit Trails
   - Compliance Monitoring
   - Policy Exceptions
   - Remediation Procedures

7. **Implementation Guidelines**
   - Technology Requirements
   - Process Integration
   - Training and Awareness
   - Continuous Improvement

8. **Appendices**
   - Retention Schedule Template
   - Disposal Certification Form
   - Legal and Regulatory References
   - Contact Information
