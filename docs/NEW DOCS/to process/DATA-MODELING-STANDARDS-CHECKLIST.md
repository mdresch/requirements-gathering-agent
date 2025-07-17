# Checklist: Implementing the Data Modeling Standards Guide

This checklist outlines the tasks required to add the **Data Modeling Standards Guide** document type to the ADPA Document Generator.

---

## 1. Create Template and Processor Files

- [ ] Create the template file: `src/modules/documentTemplates/dmbok/DataModelingStandardsTemplate.ts`
- [ ] Implement the `DataModelingStandardsTemplate` class with a `buildPrompt()` method that defines the document structure.
- [ ] Create the processor file: `src/modules/documentTemplates/dmbok/DataModelingStandardsProcessor.ts`
- [ ] Implement the `DataModelingStandardsProcessor` class, ensuring it uses the template and the `AIProcessor` to generate the document content.

## 2. Register the Processor

- [ ] Open `src/modules/documentGenerator/processor-config.json`.
- [ ] Add a new entry for `data-modeling-standards`.
- [ ] Define the `module` path pointing to the new processor class.
- [ ] List dependencies, such as `data-architecture-modeling-guide`.
- [ ] Assign a `priority` for generation order (suggested: 17).

## 3. Add a Generation Task

- [ ] Open `src/modules/documentGenerator/generationTasks.ts`.
- [ ] Add a new task object to the `GENERATION_TASKS` array for `data-modeling-standards`.
- [ ] Ensure the following fields are correctly filled out:
  - `key`: 'data-modeling-standards'
  - `name`: 'Data Modeling Standards Guide'
  - `category`: 'dmbok'
  - `func`: 'generateDataModelingStandards'
  - `emoji`: '📐'
  - `priority`: 17
  - `pmbokRef`: 'DMBOK: Data Modeling & Design'

## 4. Add File Manager Configuration

- [ ] Open `src/modules/fileManager.ts`.
- [ ] Add a new entry to the `DOCUMENT_CONFIG` object for `data-modeling-standards`.
- [ ] Specify the following properties:
  - `title`: 'Data Modeling Standards Guide'
  - `filename`: 'dmbok/data-modeling-standards.md'
  - `category`: DOCUMENT_CATEGORIES.DMBOK
  - `description`: 'Comprehensive guide to data modeling standards, conventions, and best practices.'
  - `generatedAt`: ''

## 5. Test and Validate

- [ ] Build the project: `npm run build`
- [ ] Run the generator for the new document with verbose output: `node dist/cli.js generate data-modeling-standards --verbose`
- [ ] Verify the processor loads correctly without errors.
- [ ] Confirm the new document is listed: `node dist/cli.js list-templates`
- [ ] Inspect the generated file `generated-documents/dmbok/data-modeling-standards.md` to ensure its content and formatting are correct.

## 6. Update Documentation

- [ ] Update `README.md` to include the new **Data Modeling Standards Guide** in the DMBOK section and usage examples.
- [ ] Add a brief description of the document's purpose and when to use it.

## Document Structure (Template Content)

The document should include the following sections:

1. **Introduction**
   - Purpose and Scope
   - Intended Audience
   - Document Conventions

2. **Data Modeling Standards**
   - Naming Conventions
   - Abbreviation Standards
   - Data Types and Domains
   - Null Handling

3. **Conceptual Data Model**
   - Entity Definitions
   - Relationship Rules
   - Business Rules
   - Example Diagrams

4. **Logical Data Model**
   - Attribute Definitions
   - Primary and Foreign Keys
   - Normalization Rules
   - Denormalization Guidelines

5. **Physical Data Model**
   - Table Design
   - Indexing Strategy
   - Partitioning Guidelines
   - Storage Parameters

6. **Model Management**
   - Version Control
   - Change Management
   - Model Validation
   - Documentation Requirements

7. **Tools and Technologies**
   - Modeling Tools
   - Reverse Engineering
   - Forward Engineering
   - Model Comparison

8. **Appendices**
   - Glossary
   - Naming Convention Examples
   - Common Patterns
   - Anti-patterns to Avoid
