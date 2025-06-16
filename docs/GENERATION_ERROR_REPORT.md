# Document Generation Error Report

**Date:** June 16, 2025

This report summarizes the errors encountered during a sample run of the document-generation CLI. Use these notes to plan a dedicated troubleshooting session.

---

## 1. Missing Module: `interactive-menu.js`

**Error:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/modules/ai/interactive-menu.js'
```
**Context:** The CLI import of `InteractiveProviderMenu` failed when running via `ts-node`.

**Proposed Fix:**
- Ensure `src/modules/ai/interactive-menu.js` exists or stub it for ESM builds.
- Verify file extension and import paths (use `.js` or `.ts` consistently).

---

## 2. ESM JSON Import Assertion Error

**Error:**
```
TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]: Module ".../dist/modules/documentGenerator/processor-config.json" needs an import attribute of "type: json"
```
**Context:** Running `node ./dist/cli.js` under ES modules without JSON import assertions.

**Proposed Fix:**
- Add `assert { type: 'json' }` in JSON imports, or
- Load JSON at runtime with `fs.readFileSync()` + `JSON.parse()`.

---

## 3. Missing Compiled CLI Entrypoint

**Error:**
```
Error: Cannot find module '.../dist/src/cli.js'
```
**Context:** The compiled CLI entrypoint path did not match the requested file location.

**Proposed Fix:**
- Confirm `outDir` in `tsconfig.json` is `./dist` and maps `src/cli.ts` → `dist/cli.js`.
- Adjust run command to `node dist/cli.js` or ensure folder structure.

---

## 4. Cannot Find Module `src/index` When Running Sample Script

**Error:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/index'
```
**Context:** `sampleGenerate.ts` imported `./src/index` without `.js` extension under ESM in `ts-node`.

**Proposed Fix:**
- Add `.js` extensions in imports for ESM (e.g., `import { ... } from './src/index.js'`).
- Alternatively, run via commonjs or adjust `ts-node` config for `esm`.

---

## Next Steps
1. Consolidate all import paths to use consistent extensions (`.js` vs `.ts`).
2. Stub or implement missing modules (e.g., `interactive-menu`).
3. Standardize JSON loading strategy (runtime vs import assertions).
4. Verify CLI build outputs under `dist/` and update run commands accordingly.
5. Re-run `npm run build` and sample generation (`node dist/cli.js --output generated-documents`) to validate fixes.

---

_Please schedule dedicated time to address these issues sequentially. Once imports and build paths are stabilized, the generation pipeline should run end-to-end._
