# CLI Refactor Implementation Guide

This guide outlines the recommended steps to refactor the Requirements Gathering Agent CLI for improved maintainability, modularity, and scalability. The approach leverages a modern CLI framework (Yargs), modular command structure, and best practices for configuration and code organization.

---

## 1. Adopt a CLI Framework (Yargs)

**Why:**
- Simplifies argument parsing and validation
- Automatically generates help output
- Makes commands and options declarative and discoverable

**How:**
- Install Yargs:
  ```sh
  npm install yargs @types/yargs
  ```
- Refactor `src/cli.ts` to use Yargs for all command and option parsing.
- Example starter:
  ```typescript
  import yargs from 'yargs';
  import { hideBin } from 'yargs/helpers';

  yargs(hideBin(process.argv))
    .command('generate [key]', 'Generate a document', (yargs) => {
      yargs.positional('key', { type: 'string', describe: 'Document key' });
    }, (argv) => {
      // Call generate logic
    })
    .option('output', { type: 'string', default: 'generated-documents' })
    .help()
    .argv;
  ```
- Remove all manual `process.argv` parsing and helper functions.

**Common Issues & Solutions:**
- **Duplicate imports**: Remove old import statements when adding Yargs imports
- **Type errors**: Use proper type assertions for argv values (e.g., `argv.format as 'markdown' | 'json' | 'yaml'`)
- **Missing modules**: Create placeholder functions or use dynamic imports for non-essential commands during transition

---

## 2. Increase Modularity (Command Extraction)

**Why:**
- Easier to maintain and extend
- Each command is independently testable

**How:**
- Create a `src/commands/` directory.
- Move logic for each major command (e.g., generate, confluence, sharepoint, vcs) into its own file:
  ```
  src/
    commands/
      generate.ts
      confluence.ts
      sharepoint.ts
      vcs.ts
      utils/
        validation.ts
        common.ts
    cli.ts
  ```
- Each command file should export a function that implements the command logic.
- The main CLI file should only parse arguments and dispatch to the appropriate command module.

**Example command module structure:**
```typescript
// src/commands/generate.ts
export interface GenerateOptions {
  key?: string;
  category?: string;
  output: string;
  format: 'markdown' | 'json' | 'yaml';
  retries: number;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  // Command implementation
}
```

---

## 3. Standardize Imports

**Why:**
- Improves readability and static analysis

**How:**
- Move all static imports to the top of each file.
- Use dynamic imports only for optional or large dependencies.
- For Node.js built-in modules, always use static imports.

**Import organization pattern:**
```typescript
// 1. Node.js built-ins
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// 2. Third-party dependencies
import yargs from 'yargs';

// 3. Internal modules
import { DocumentGenerator } from './modules/documentGenerator.js';

// 4. Types (if using separate type imports)
import type { GenerationOptions } from './types.js';
```

---

## 4. Centralize Configuration and Constants

**Why:**
- Prevents version drift and hard-to-find bugs

**How:**
- Read the CLI version from `package.json`:
  ```typescript
  import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
  const { version } = require('../package.json');
  ```
- Use this `version` variable throughout your CLI for all version output.
- Centralize other constants (e.g., default output directory) in a config file or at the top of the CLI.

**Create a constants file:**
```typescript
// src/constants.ts
export const DEFAULT_OUTPUT_DIR = 'generated-documents';
export const SUPPORTED_FORMATS = ['markdown', 'json', 'yaml'] as const;
export const DEFAULT_RETRY_COUNT = 0;
export const DEFAULT_RETRY_BACKOFF = 1000;
export const DEFAULT_MAX_DELAY = 25000;
```

---

## 5. Incremental Refactor Strategy

**Phase 1: Foundation**
- Install Yargs and create basic command structure
- Fix immediate type errors and duplicate imports
- Ensure CLI still functions with basic commands

**Phase 2: Command Migration**
- Create `src/commands/` directory
- Move one command at a time (start with simplest)
- Test each command thoroughly before moving to next

**Phase 3: Cleanup & Enhancement**
- Remove legacy parsing code
- Add comprehensive error handling
- Implement proper TypeScript types
- Add unit tests for each command module

**Phase 4: Advanced Features**
- Add command validation and middleware
- Implement configuration file support
- Add shell completion support

---

## 6. Example Directory Structure (After Refactor)

```
requirements-gathering-agent/
├── src/
│   ├── cli.ts                    # Main entry point
│   ├── constants.ts              # Centralized constants
│   ├── types.ts                  # Shared TypeScript types
│   ├── commands/
│   │   ├── generate.ts           # Document generation commands
│   │   ├── confluence.ts         # Confluence integration
│   │   ├── sharepoint.ts         # SharePoint integration
│   │   ├── vcs.ts               # Version control commands
│   │   └── utils/
│   │       ├── validation.ts     # Command validation utilities
│   │       └── common.ts         # Shared command utilities
│   └── modules/                  # Existing modules
├── tests/
│   ├── commands/                 # Command-specific tests
│   └── integration/              # End-to-end tests
├── package.json
├── CLI-REFACTOR-IMPLEMENTATION-GUIDE.md
└── ...
```

---

## 7. Error Handling & Validation

**Implement robust error handling:**
```typescript
// In command modules
export async function generateCommand(options: GenerateOptions): Promise<void> {
  try {
    validateOptions(options);
    await performGeneration(options);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`);
      process.exit(1);
    }
    throw error; // Re-throw unexpected errors
  }
}
```

**Add input validation:**
```typescript
function validateOptions(options: GenerateOptions): void {
  if (options.retries < 0) {
    throw new ValidationError('Retries must be non-negative');
  }
  // Add more validation as needed
}
```

---

## 8. Testing Strategy

**Unit Tests:**
- Test each command module independently
- Mock external dependencies (file system, AI services)
- Use Jest or Vitest for testing framework

**Integration Tests:**
- Test complete CLI workflows
- Use temporary directories for file operations
- Test error conditions and edge cases

**Example test structure:**
```typescript
// tests/commands/generate.test.ts
describe('Generate Command', () => {
  test('should generate document with valid options', async () => {
    const options = { key: 'test', output: './test-output', format: 'markdown' };
    await expect(generateCommand(options)).resolves.not.toThrow();
  });
});
```

---

## 9. Migration Checklist

- [ ] Install Yargs and types
- [ ] Create basic Yargs structure in cli.ts
- [ ] Fix immediate compilation errors
- [ ] Create src/commands/ directory
- [ ] Create constants.ts file
- [ ] Migrate generate command
- [ ] Migrate confluence command
- [ ] Migrate sharepoint command
- [ ] Migrate vcs command
- [ ] Add error handling and validation
- [ ] Write unit tests for each command
- [ ] Write integration tests
- [ ] Update documentation
- [ ] Remove legacy code

---

## 10. Additional Best Practices

- Add integration/unit tests for each command module.
- Use TypeScript types for all command arguments and options.
- Document each command in the CLI help output and in a `COMMANDS.md` file if needed.
- Use environment variables and a `.env` file for sensitive or environment-specific configuration.
- Consider adding shell completion support for better developer experience.
- Implement proper logging with different log levels.
- Add configuration file support for complex setups.

---

## 11. References
- [Yargs Documentation](https://yargs.js.org/)
- [Commander.js Documentation](https://github.com/tj/commander.js/)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**By following this guide, your CLI will be easier to maintain, extend, and test—ready for future growth and contributions.**
