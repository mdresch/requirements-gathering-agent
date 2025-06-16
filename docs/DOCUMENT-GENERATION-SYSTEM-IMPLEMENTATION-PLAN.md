# Document Generation System Implementation Plan

This document outlines a phased plan to harden and streamline the document-generation subsystem of the Requirements Gathering Agent. Each phase builds on the last, allowing incremental rollout and validation.

---

## Phase 1 – Configuration & Validation
Goal: Fail fast on misconfiguration and avoid runtime surprises.

1. Define a JSON Schema for `processor-config.json`:
   - Fields: `module` (string), `class` (string), `category` (string), `dependencies` (string[]), `estimatedTokens` (number)
2. At application startup, load and validate `processor-config.json` against the schema:
   - Halt with clear error messages if invalid or missing
3. In `ProcessorFactory`, add a `validateProcessor(config)` step:
   - Check module file exists and exports the named class
   - Verify declared `dependencies` refer to other config keys

**Deliverables:**
- `config-rga.schema.json` in `/docs`
- Startup hook that validates and reports config issues

---

## Phase 2 – Scaffolding CLI Command
Goal: Make adding new document types frictionless.

1. Add a new CLI sub-command:
   ```bash
   rga generate:processor --category <cat> --name <DocName>
   ```
2. Have it create:
   - `src/modules/documentTemplates/<cat>/<DocName>Template.ts` (stub)
   - `src/modules/documentTemplates/<cat>/<DocName>Processor.ts` (stub)
   - Append new entry to `processor-config.json`

**Deliverables:**
- CLI code in `cli.ts` + tests
- Stub templates for new processor files

---

## Phase 3 – Context Relationship Management
Goal: Explicitly track document dependencies and enforce build order.

1. Extend config entries with a `dependencies` array (`string[]`) and a numeric `priority`
2. Build a simple DAG resolver that:
   - Sorts processors topologically by dependencies
   - Detects and rejects cycles at startup
3. Reject startup with clear error messages when unknown dependencies or cycles are detected

**Deliverables:**
- Enhanced `processor-config.json` fields
- `DocumentOrchestrator` updated to use DAG order
- `DocumentGenerator.filterTasks()` updated to use DAG order

---

## Phase 4 – Error Handling & Monitoring
Goal: Catch and log failures; surface slow processors.

1. Introduce a centralized logger (e.g., Winston) and replace existing `console.*` calls in `ProcessorFactory` and `DocumentGenerator` with `logger.error/info/warn/debug`.
2. Wrap each processor invocation in try/catch within `DocumentGenerator.generateSingleDocument`:
   - On error: use `logger.error` with task key, module path, and full stack trace.
3. Measure execution time per task:
   - Record start/end timestamps and log duration at debug level (`logger.debug`).
4. Emit warnings when a task’s duration exceeds a configurable threshold (exposed via CLI flag or environment variable), using `logger.warn`.
5. At the end of `generateAll()`, emit a summary metrics report:
   - Total run time, slowest N tasks, counts of warnings/errors.
6. Add unit and integration tests to verify error handling and timing behavior:
   - Simulate processor failures and delays to assert logs and warnings are emitted as expected.
7. Update documentation and CI configuration:
   - Document new CLI flags (e.g., `--slow-threshold`) and include sample logs or artifacts in CI jobs.

**Deliverables:**
- Centralized error logger (e.g., Winston)
- Sample metrics report in CI logs

---

## Phase 5 – Processor Caching
Goal: Skip re-running unchanged documents for identical contexts.

1. Compute a hash of relevant `ProjectContext` keys + processor name
2. On run:
   - If cache entry exists, return cached `DocumentOutput`
   - Otherwise run processor and store result in cache
3. Invalidate cache when `processor-config.json` or template file mtime changes

**Deliverables:**
- Simple cache module with pluggable store (file-based or in-memory)
- Unit tests validating cache hits and misses

---

## Phase 6 – Testing & Quality
Goal: Achieve high confidence when adding new docs.

1. **Unit tests** for every existing processor:
   - Stub `ProjectContext`, assert `DocumentOutput` fields and content snippets
2. **Integration tests**:
   - Mock AI providers with canned completions
   - Run end-to-end on a sample project context
   - Verify file creation and content structure
3. Add tests for:
   - Config schema enforcement
   - DAG ordering logic
   - Caching behavior

**Deliverables:**
- Tests under `src/modules/documentTemplates/**/__tests__`
- CI job updated to fail on test errors

---

## Phase 7 – Documentation & Training
Goal: Ensure team understands and adopts the new workflow.

1. Update `docs/STEPS-TO-IMPLEMENT-NEW-DOCS.md` with new sections:
   - Scaffolding CLI usage
   - Config schema reference
   - Caching and invalidation notes
2. Add a `docs/CONFIGURATION.md` detailing the `processor-config.json` schema
3. Host a short demo (video or live) to walk through the “add a document” workflow

**Deliverables:**
- Revised markdown docs in `/docs`
- Demo video link or internal wiki page

---

By following these seven phases, the document-generation engine will become self-documenting, robust, and highly maintainable—making it easy for any developer to add and maintain document types with confidence.
