# Context Window Validation System

## Overview

The Context Window Validation System ensures that AI generation tasks have access to models with sufficient context windows for effective context building and document generation. This system prevents generation failures due to insufficient context capacity and provides intelligent fallback strategies.

## Key Features

- **Automatic Context Window Validation**: Validates context window availability before document generation
- **Provider-Specific Limits**: Maintains accurate context window limits for different AI providers and models
- **Intelligent Fallback Strategies**: Provides multiple strategies when context exceeds available window
- **Document Complexity Awareness**: Adjusts validation based on document type and complexity
- **Real-time Monitoring**: Tracks context utilization and provides warnings/recommendations

## Architecture

### Core Components

1. **ContextWindowValidationService**: Main validation service
2. **ContextFallbackStrategyService**: Fallback strategies for large contexts
3. **Enhanced DocumentGenerator**: Integrated validation in generation pipeline
4. **Enhanced ContextManager**: Context building with validation

### Context Window Requirements by Complexity

| Complexity | Min Context Window | Preferred Context Window | Document Types |
|------------|-------------------|-------------------------|----------------|
| Low | 4,000 tokens | 8,000 tokens | User stories, basic requirements |
| Medium | 8,000 tokens | 16,000 tokens | Project charter, risk register |
| High | 16,000 tokens | 32,000 tokens | Technical specs, architecture |
| Very High | 32,000 tokens | 128,000 tokens | Comprehensive plans, detailed analysis |

## Provider Context Window Limits

### Google Gemini
- **gemini-1.5-pro**: 2,000,000 tokens (2M)
- **gemini-1.5-flash**: 1,000,000 tokens (1M)
- **gemini-pro**: 32,768 tokens (32K)

### OpenAI/Azure OpenAI
- **gpt-4o**: 128,000 tokens (128K)
- **gpt-4-turbo**: 128,000 tokens (128K)
- **gpt-4**: 8,192 tokens (8K)
- **gpt-3.5-turbo**: 4,096 tokens (4K)

### Ollama (Local)
- **llama3.1**: 32,768 tokens (32K)
- **llama3.2**: 32,768 tokens (32K)
- **codellama**: 16,384 tokens (16K)

## Usage Examples

### Basic Validation

```typescript
import { ContextWindowValidationService } from '../src/services/ContextWindowValidationService.js';

const validator = ContextWindowValidationService.getInstance();

// Validate context window for a document
const validation = await validator.validateContextWindow(
    'technical-specification',
    15000, // estimated tokens
    'high' // complexity
);

if (validation.isValid) {
    console.log(`✅ Using ${validation.provider}/${validation.model}`);
    console.log(`Context window: ${validation.contextWindow} tokens`);
    console.log(`Utilization: ${validation.utilizationPercentage}%`);
} else {
    console.log(`❌ Validation failed: ${validation.errors?.join(', ')}`);
    console.log(`💡 Recommendations: ${validation.recommendations?.join(', ')}`);
}
```

### Provider-Specific Check

```typescript
// Check if a specific provider can handle the context
const canHandle = await validator.checkProviderContextWindow(
    'google-gemini',
    'gemini-1.5-pro',
    50000 // required tokens
);

console.log(`Provider can handle context: ${canHandle}`);
```

### Fallback Strategy

```typescript
import { ContextFallbackStrategyService } from '../src/services/ContextFallbackStrategyService.js';

const fallbackService = ContextFallbackStrategyService.getInstance();

const result = await fallbackService.applyFallbackStrategy(
    largeContext,
    'technical-specification',
    8000, // target token limit
    {
        enableChunking: true,
        enableSummarization: true,
        enablePrioritization: true,
        preserveCriticalContext: true
    }
);

if (result.success) {
    console.log(`Strategy: ${result.strategy}`);
    console.log(`Reduction: ${result.reductionPercentage}%`);
    console.log(`Final tokens: ${result.finalTokenCount}`);
}
```

### DocumentGenerator Integration

```typescript
import { DocumentGenerator } from '../src/modules/documentGenerator/DocumentGenerator.js';

const generator = new DocumentGenerator(projectContext, {
    outputDir: 'generated-documents'
});

// Context window validation happens automatically
const success = await generator.generateOne('benefits-realization-plan');
```

## Fallback Strategies

### 1. Provider Switch
- Automatically switches to a provider with larger context window
- Prioritizes providers with sufficient capacity
- No content modification required

### 2. Context Prioritization
- Preserves high-priority content (requirements, specifications)
- Removes low-priority content (references, appendices)
- Maintains document structure and critical information

### 3. Context Summarization
- Creates intelligent summaries of large content sections
- Preserves headers and key information
- Reduces token count while maintaining meaning

### 4. Context Chunking
- Splits content into manageable chunks
- Selects most relevant chunks based on document type
- Maintains logical content flow

## Configuration

### Environment Variables

```bash
# AI Provider Configuration
GOOGLE_AI_API_KEY=your_google_ai_key
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
OLLAMA_API_URL=http://localhost:11434

# Context Window Settings
DEFAULT_CONTEXT_WINDOW=8000
MAX_CONTEXT_WINDOW=2000000
ENABLE_CONTEXT_VALIDATION=true
```

### Provider Priority

The system automatically prioritizes providers based on:
1. Context window size (larger is better)
2. Cost per token (lower is better)
3. Availability and health status

## Monitoring and Logging

### Validation Logs

```
🔍 Validating context window for technical-specification...
✅ Context window validation passed: google-gemini/gemini-1.5-pro (2000000 tokens, 0.8% utilization)
```

### Warning Examples

```
⚠️ Context window warnings: High context utilization (85.2%), Consider using a model with larger context window for better results
```

### Error Examples

```
❌ Context window validation failed: No provider found with sufficient context window
💡 Recommendations: Upgrade to a provider with at least 32000 token context window, Consider using Google Gemini 1.5 Pro (2M tokens) or GPT-4 Turbo (128K tokens)
```

## Best Practices

### 1. Document Complexity Assessment
- Use appropriate complexity levels for document types
- Consider content volume when estimating tokens
- Account for additional context (existing documents, stakeholders)

### 2. Provider Selection
- Prefer providers with larger context windows for complex documents
- Use local providers (Ollama) for simple documents
- Monitor provider health and availability

### 3. Fallback Strategy Configuration
- Enable multiple fallback strategies for robustness
- Configure preservation of critical context
- Test fallback strategies with sample content

### 4. Monitoring
- Monitor context utilization percentages
- Track validation success/failure rates
- Review fallback strategy effectiveness

## Troubleshooting

### Common Issues

1. **"No provider found with sufficient context window"**
   - Solution: Configure a provider with larger context window
   - Alternative: Use fallback strategies to reduce context size

2. **"High context utilization" warnings**
   - Solution: Consider using a larger context window provider
   - Alternative: Optimize context content

3. **"Context prioritization failed"**
   - Solution: Check document structure and priority patterns
   - Alternative: Use summarization or chunking strategies

### Debug Mode

Enable debug logging to see detailed validation information:

```typescript
// Set log level to debug
process.env.LOG_LEVEL = 'debug';
```

## Performance Considerations

- Context validation adds minimal overhead (~50-100ms)
- Fallback strategies may take longer for large contexts
- Caching reduces repeated validation overhead
- Provider health checks are cached for 5 minutes

## Future Enhancements

- AI-powered context summarization
- Dynamic context window detection
- Machine learning-based complexity assessment
- Real-time provider performance monitoring
- Advanced content prioritization algorithms
