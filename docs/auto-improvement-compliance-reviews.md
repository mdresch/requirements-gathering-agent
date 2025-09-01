# Auto-Improvement from Compliance Review Outcomes

## Overview
This feature enables the requirements gathering agent to automatically parse compliance review reports, extract actionable findings, and apply improvements to future document generations. The goal is to ensure continuous compliance and document quality by leveraging feedback from compliance validation.

---

## Technical Design

### 1. Compliance Review Parsing
- **Target Files:** Markdown files in `generated-documents/compliance-reports/`.
- **Parsing Logic:**
  - Scan for sections such as `Failed Criteria`, `Recommendations`, `Score`, and `Audit Findings`.
  - Use regex or markdown parsing to extract actionable items.
  - Structure findings as objects: `{criteria, recommendation, affectedSection, severity, score}`.

### 2. Storing and Prioritizing Findings
- **ContextManager Enhancement:**
  - Add a method to ingest and store compliance findings in a dedicated context map.
  - Tag findings with affected document types and sections.
  - Prioritize these findings when building context for related documents.

### 3. Auto-Improvement Logic
- **Document Generation:**
  - When generating a document, check for relevant compliance findings.
  - For each affected section:
    - Auto-flag for revision if failed criteria are found.
    - Insert recommended changes or improvement notes.
    - Optionally, add a compliance improvement summary to the document.
- **Traceability:**
  - Annotate auto-applied changes with source compliance report and timestamp.

### 4. User Notification and Reporting
- **Logging:**
  - Log all auto-applied improvements and flag any manual review required.
- **Reporting:**
  - Provide a summary report of compliance-driven enhancements for each document.

### 5. Testing & Validation
- **Unit Tests:**
  - Test parsing logic for various compliance report formats.
  - Validate correct extraction and application of findings.
- **Integration Tests:**
  - Ensure improvements are traceable and do not overwrite manual edits.

---

## Example Workflow
1. Compliance review report is generated and stored in `generated-documents/compliance-reports/`.
2. ContextManager parses the report and extracts failed criteria and recommendations.
3. When generating a new project charter, the agent checks for relevant findings and auto-applies improvements to affected sections.
4. The generated document includes annotations and a summary of compliance-driven changes.

---

## Roadmap Status
This feature is planned for the next release and will be announced in the project update as a major enhancement for continuous compliance and document quality improvement.

---

## Authors
GitHub Copilot
September 2025
