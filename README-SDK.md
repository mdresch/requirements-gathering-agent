# Requirements Gathering Agent SDK

A comprehensive TypeScript SDK for the Requirements Gathering Agent, designed to make it easy for developers to integrate AI-powered document generation and project analysis into their applications.

## Features

- 🚀 **Easy Integration**: Simple, intuitive API for quick adoption
- 🤖 **AI-Powered**: Multiple AI provider support (Google AI, Azure OpenAI, GitHub AI, Ollama)
- 📄 **Document Generation**: PMBOK-compliant document generation
- ✅ **Validation**: Built-in PMBOK compliance and quality validation
- 🔌 **Integrations**: Confluence, SharePoint, JIRA, and more
- 🧩 **Extensible**: Plugin system for custom functionality
- 📊 **Analytics**: Project analysis and insights
- 🛡️ **Type Safe**: Full TypeScript support with comprehensive types

## Installation

```bash
npm install requirements-gathering-agent-sdk
```

## Quick Start

```typescript
import { RequirementsGatheringAgent } from 'requirements-gathering-agent-sdk';

// Initialize the SDK
const agent = new RequirementsGatheringAgent({
  aiProvider: 'google-ai',
  apiKey: process.env.GOOGLE_AI_API_KEY,
  outputDirectory: './generated-docs'
});

await agent.initialize();

// Define your project
const projectContext = {
  projectName: 'E-commerce Platform',
  businessProblem: 'Need to modernize legacy shopping system',
  technologyStack: ['React', 'Node.js', 'PostgreSQL']
};

// Generate project charter
const result = await agent.generateProjectCharter(projectContext);
console.log('Generated:', result.documentPath);

// Clean up
await agent.cleanup();
```

## Core Concepts

### Project Context

The `ProjectContext` is the foundation of all operations. It describes your project:

```typescript
const projectContext: ProjectContext = {
  projectName: 'My Project',
  businessProblem: 'Description of the problem being solved',
  technologyStack: ['React', 'Node.js', 'PostgreSQL'],
  stakeholders: [
    {
      name: 'John Doe',
      role: 'Product Manager',
      influence: 'high',
      interest: 'high'
    }
  ],
  constraints: [
    {
      type: 'time',
      description: 'Must complete in 6 months',
      impact: 'high'
    }
  ],
  successCriteria: [
    'Improve performance by 50%',
    'Reduce costs by 30%'
  ]
};
```

### Document Generation

Generate various PMBOK-compliant documents:

```typescript
// Individual documents
await agent.generateProjectCharter(projectContext);
await agent.generateStakeholderRegister(projectContext);
await agent.generateRiskManagementPlan(projectContext);

// All documents at once
const results = await agent.generateAllDocuments(projectContext);

// Documents by category
const planningDocs = await agent.generateDocumentsByCategory(
  'planning', 
  projectContext
);
```

### AI Analysis

Leverage AI for project insights:

```typescript
// Business analysis
const businessAnalysis = await agent.analyzeBusinessRequirements({
  content: 'Your business requirements text',
  analysisType: 'business-analysis'
});

// Risk assessment
const riskAnalysis = await agent.assessRisks({
  content: 'Project description and context',
  analysisType: 'risk-assessment'
});

// Technical analysis
const techAnalysis = await agent.analyzeTechnicalRequirements({
  content: 'Technical requirements and constraints',
  analysisType: 'technical-analysis'
});
```

### Validation

Ensure document quality and PMBOK compliance:

```typescript
// Validate single document
const validation = await agent.validateDocument('./project-charter.md', {
  enablePMBOKValidation: true,
  enableGrammarCheck: true,
  enableComplianceCheck: true
});

// Batch validation
const results = await agent.validateDocuments([
  './charter.md',
  './stakeholders.md',
  './risks.md'
]);
```

### Project Analysis

Get comprehensive project insights:

```typescript
const analysis = await agent.analyzeProject(projectContext);

console.log('Complexity:', analysis.complexity.level);
console.log('Risk Score:', analysis.risks.overallRiskScore);
console.log('Success Probability:', analysis.success.probability);
console.log('Recommended Team Size:', analysis.resources.team.developers);
```

## Configuration

### Environment Variables

```bash
# AI Provider Configuration
GOOGLE_AI_API_KEY=your_google_ai_key
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
GITHUB_TOKEN=your_github_token
OLLAMA_HOST=http://localhost:11434

# SDK Configuration
RGA_AI_PROVIDER=google-ai
RGA_OUTPUT_DIR=./generated-docs
RGA_DEBUG=true
RGA_TIMEOUT=30000
RGA_MAX_RETRIES=3

# Integration Configuration
CONFLUENCE_URL=https://your-domain.atlassian.net
CONFLUENCE_TOKEN=your_confluence_token
CONFLUENCE_SPACE_KEY=your_space_key

SHAREPOINT_SITE_URL=https://your-tenant.sharepoint.com/sites/your-site
SHAREPOINT_CLIENT_ID=your_client_id
SHAREPOINT_CLIENT_SECRET=your_client_secret
SHAREPOINT_TENANT_ID=your_tenant_id
```

### Programmatic Configuration

```typescript
const agent = new RequirementsGatheringAgent({
  aiProvider: 'azure-openai',
  apiKey: 'your-api-key',
  endpoint: 'https://your-resource.openai.azure.com',
  outputDirectory: './docs',
  debug: true,
  timeout: 60000,
  maxRetries: 5,
  providerConfig: {
    'azure-openai': {
      deploymentName: 'gpt-4',
      apiVersion: '2024-02-15-preview'
    }
  }
});
```

## Integrations

### Confluence

```typescript
// Configure Confluence
await agent.configureIntegration('confluence', {
  type: 'confluence',
  enabled: true,
  credentials: {
    apiKey: process.env.CONFLUENCE_TOKEN,
    username: process.env.CONFLUENCE_USERNAME
  },
  settings: {
    baseUrl: process.env.CONFLUENCE_URL,
    spaceKey: process.env.CONFLUENCE_SPACE_KEY
  }
});

// Publish documents
const publishResults = await agent.publishToConfluence(
  ['./project-charter.md'],
  {
    target: 'confluence',
    destination: 'Project Documentation',
    overwrite: true
  }
);
```

### SharePoint

```typescript
// Configure SharePoint
await agent.configureIntegration('sharepoint', {
  type: 'sharepoint',
  enabled: true,
  credentials: {
    clientId: process.env.SHAREPOINT_CLIENT_ID,
    clientSecret: process.env.SHAREPOINT_CLIENT_SECRET,
    tenantId: process.env.SHAREPOINT_TENANT_ID
  },
  settings: {
    siteUrl: process.env.SHAREPOINT_SITE_URL,
    libraryName: 'Documents'
  }
});

// Publish to SharePoint
const results = await agent.publishToSharePoint(
  ['./stakeholder-register.md'],
  {
    target: 'sharepoint',
    destination: 'Project Documents'
  }
);
```

## Template Management

### Using Built-in Templates

```typescript
// Get available templates
const templates = await agent.getTemplates();

// Generate document with specific template
const result = await agent.generateCustomDocument(
  'project-charter-default',
  projectContext
);
```

### Creating Custom Templates

```typescript
// Create custom template
const customTemplate = {
  name: 'Custom Risk Assessment',
  description: 'Custom risk assessment template',
  category: 'risk-management',
  content: `# Risk Assessment: {{projectName}}
  
## Overview
{{overview}}

## Identified Risks
{{risks}}

## Mitigation Strategies
{{mitigation}}`,
  variables: [
    {
      name: 'projectName',
      type: 'string',
      required: true,
      description: 'Project name'
    },
    {
      name: 'overview',
      type: 'string',
      description: 'Risk assessment overview'
    }
  ]
};

const template = await agent.createTemplate(customTemplate);
```

## Plugin System

### Installing Plugins

```typescript
// Install a plugin
await agent.installPlugin('rga-plugin-custom-validator', {
  enabled: true,
  config: {
    strictMode: true
  }
});

// Get installed plugins
const plugins = agent.getInstalledPlugins();
```

### Creating Custom Plugins

```typescript
// plugin.js
export const plugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  description: 'Custom plugin for special validation',
  hooks: {
    beforeDocumentGeneration: async (context, options) => {
      console.log('Before generating document for:', context.projectName);
    },
    afterDocumentGeneration: async (result) => {
      console.log('Document generated:', result.documentPath);
    }
  }
};

export function initialize(config) {
  return {
    cleanup: async () => {
      console.log('Plugin cleanup');
    }
  };
}
```

## Error Handling

```typescript
import { 
  DocumentGenerationError, 
  ValidationError, 
  AIProcessingError,
  ErrorHandler 
} from 'requirements-gathering-agent-sdk';

try {
  await agent.generateProjectCharter(projectContext);
} catch (error) {
  if (error instanceof DocumentGenerationError) {
    console.log('Document generation failed:', error.message);
    console.log('Document type:', error.documentType);
    console.log('Stage:', error.stage);
  } else if (error instanceof AIProcessingError) {
    console.log('AI processing failed:', error.message);
    console.log('Provider:', error.provider);
    console.log('Retryable:', error.retryable);
    
    if (error.retryable) {
      const delay = ErrorHandler.getRetryDelay(error, 1);
      setTimeout(() => {
        // Retry logic
      }, delay);
    }
  }
}
```

## Utilities

The SDK includes helpful utilities:

```typescript
import { 
  DocumentUtils, 
  ProjectUtils, 
  ValidationUtils,
  FormatUtils 
} from 'requirements-gathering-agent-sdk';

// Document utilities
const metadata = DocumentUtils.extractMetadata(documentContent);
const wordCount = DocumentUtils.countWords(documentContent);
const toc = DocumentUtils.generateTableOfContents(documentContent);

// Project utilities
const summary = ProjectUtils.generateProjectSummary(projectContext);
const keywords = ProjectUtils.extractKeywords(projectContext);
const complexity = ProjectUtils.calculateComplexityScore(projectContext);

// Validation utilities
const aggregated = ValidationUtils.aggregateValidationResults(validationResults);
const report = ValidationUtils.generateValidationReport(validationResults);

// Format utilities
const fileSize = FormatUtils.formatFileSize(1024000);
const duration = FormatUtils.formatDuration(5000);
const percentage = FormatUtils.formatPercentage(75, 100);
```

## Advanced Usage

### Progress Tracking

```typescript
const progressCallback = (progress) => {
  console.log(`${progress.stage}: ${progress.progress}%`);
  if (progress.estimatedTimeRemaining) {
    console.log(`ETA: ${progress.estimatedTimeRemaining}ms`);
  }
};

await agent.generateAllDocuments(
  projectContext,
  { format: 'markdown' },
  progressCallback
);
```

### Batch Processing

```typescript
// Batch document generation
const batchResult = await agent.batchGenerate(
  ['project-charter', 'stakeholder-register', 'risk-plan'],
  projectContext,
  { format: 'pdf' },
  {
    maxConcurrency: 3,
    continueOnError: true,
    progressCallback: (progress) => {
      console.log(`Batch progress: ${progress.progress}%`);
    }
  }
);

console.log(`Success: ${batchResult.successCount}`);
console.log(`Failed: ${batchResult.failureCount}`);
```

### Health Monitoring

```typescript
// Check overall health
const health = await agent.getHealthStatus();
console.log('Overall health:', health.overall);
console.log('Components:', health.components);

// Get analytics
const analytics = await agent.getAnalytics();
console.log('Documents generated:', analytics.documentsGenerated);
console.log('AI provider usage:', analytics.aiProviderUsage);
```

## API Reference

### Main Classes

- **RequirementsGatheringAgent**: Main SDK client
- **DocumentGenerationClient**: Document generation operations
- **AIProcessingClient**: AI analysis and processing
- **TemplateManagementClient**: Template CRUD operations
- **ProjectAnalysisClient**: Project analysis and insights
- **ValidationClient**: Document and project validation
- **IntegrationClient**: Third-party integrations

### Types

- **ProjectContext**: Project information and context
- **DocumentGenerationOptions**: Document generation configuration
- **AIAnalysisRequest**: AI analysis request parameters
- **ValidationOptions**: Validation configuration
- **PublishOptions**: Publishing configuration

### Errors

- **SDKError**: Base error class
- **DocumentGenerationError**: Document generation errors
- **AIProcessingError**: AI processing errors
- **ValidationError**: Validation errors
- **IntegrationError**: Integration errors

## Examples

See the [examples directory](./src/sdk/examples/) for comprehensive usage examples:

- [Basic Usage](./src/sdk/examples/basic-usage.ts)
- [Advanced Features](./src/sdk/examples/advanced-features.ts)
- [Integration Examples](./src/sdk/examples/integration-examples.ts)
- [Plugin Development](./src/sdk/examples/plugin-examples.ts)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- 📖 [Documentation](https://docs.requirements-gathering-agent.com)
- 🐛 [Issue Tracker](https://github.com/requirements-gathering-agent/sdk/issues)
- 💬 [Discussions](https://github.com/requirements-gathering-agent/sdk/discussions)
- 📧 [Email Support](mailto:support@requirements-gathering-agent.com)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.