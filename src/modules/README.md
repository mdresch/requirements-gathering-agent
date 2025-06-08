# Document Generator Modules

This directory contains the refactored document generator modules with improved organization and separation of concerns.

## Module Structure

The document generator functionality has been split into separate modules:

- **documentGenerator**: Core document generation functionality
- **pmbokValidation**: PMBOK standard validation functionality
- **documentGeneratorWithValidation**: Integration of both modules

## Using the Modules

### Method 1: Direct Module Imports (Recommended)

```typescript
// Import document generation functionality
import { DocumentGenerator } from './modules/documentGenerator';
import { GENERATION_TASKS } from './modules/documentGenerator/generationTasks';

// Import validation functionality
import { PMBOKValidator } from './modules/pmbokValidation';

// Import integrated functionality
import { generateAllWithPMBOKValidation } from './modules/documentGeneratorWithValidation';
```

### Method 2: Legacy Compatibility Layer

```typescript
// Import all from the compatibility layer
import * as documentGenerator from './modules/documentGenerator';

// Example usage
const generator = documentGenerator.createDocumentGenerator("Project context");
await generator.generateAll();
```

## Example Usage

```typescript
// Generate documents with validation
const results = await generateAllWithPMBOKValidation("Project context", {
    outputDir: 'my-documents',
    maxConcurrent: 2,
    continueOnError: true
});

console.log(`Generated ${results.result.successCount} documents`);
console.log(`PMBOK compliance: ${results.validation.pmbokCompliance.compliance ? 'Yes' : 'No'}`);
```

See the `examples/documentGeneratorExample.ts` file for more examples.

## Module Details

### Document Generator Module

Located in `./modules/documentGenerator/`, provides:
- `DocumentGenerator` class for generating documents
- Configuration and task definitions
- Utility functions for document management

### PMBOK Validation Module

Located in `./modules/pmbokValidation/`, provides:
- `PMBOKValidator` class for validating PMBOK compliance
- Validation rules and requirements
- Quality assessment functionality

### Integration Module

Located in `./modules/documentGeneratorWithValidation.ts`, provides:
- `generateAllWithPMBOKValidation` function to combine generation and validation
- Simplified API for common use cases
