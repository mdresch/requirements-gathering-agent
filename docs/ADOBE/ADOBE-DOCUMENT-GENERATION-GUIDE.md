# Adobe Integration - Document Generation Guide 📄

## 🚀 Quick Start: Generate Your First Document

### Step 1: Setup Adobe Integration
```bash
# Install and configure Adobe credentials
npm run adobe:setup
```

### Step 2: Import and Use the Adobe Integration
```typescript
import { 
  generateProfessionalPDF,
  processDocument,
  analyzeDocument,
  DEFAULT_PDF_TEMPLATES 
} from './src/adobe/index.js';
```

### Step 3: Generate a Basic PDF
```typescript
// Simple PDF generation
const markdownContent = `
# My Business Report
## Executive Summary
This is a professional document generated with Adobe PDF Services.
`;

const pdf = await generateProfessionalPDF(markdownContent, 'corporate');
console.log('✅ PDF generated:', pdf.id);
```

## 📖 Document Generation Methods

### 1. Quick PDF Generation
**Best for**: Simple, single-format PDF generation

```typescript
import { generateProfessionalPDF } from './src/adobe/index.js';

// Generate with default corporate template
const pdf = await generateProfessionalPDF(markdownContent);

// Generate with specific template
const technicalPdf = await generateProfessionalPDF(markdownContent, 'technical');
const executivePdf = await generateProfessionalPDF(markdownContent, 'executive');
const proposalPdf = await generateProfessionalPDF(markdownContent, 'proposal');
```

### 2. Complete Document Processing
**Best for**: Full-featured document packages with multiple formats

```typescript
import { processDocument } from './src/adobe/index.js';

// Basic processing
const documentPackage = await processDocument(markdownContent);

// Advanced processing with options
const advancedPackage = await processDocument(markdownContent, {
  interactive: true,           // Add interactive elements
  accessibility: true,         // Enable accessibility features
  compression: 'medium',       // Optimize file size
  quality: 'high',            // High-quality output
  brandGuidelines: customBrandGuidelines
});

// Access generated documents
console.log('📄 Main PDF:', documentPackage.pdf);
console.log('🖱️ Interactive PDF:', documentPackage.interactivePDF);
console.log('📊 Metadata:', documentPackage.metadata);
```

### 3. Enhanced ADPA Processor
**Best for**: Full control and custom processing workflows

```typescript
import { EnhancedADPAProcessor } from './src/adobe/index.js';

const processor = new EnhancedADPAProcessor();

// Full processing with custom options
const result = await processor.processDocumentationRequest(markdownContent, {
  pdfTemplate: customTemplate,
  brandGuidelines: brandGuidelines,
  interactive: true,
  accessibility: true,
  compression: 'high',
  quality: 'print'
});
```

## 🎨 Templates and Customization

### Available Templates
```typescript
import { DEFAULT_PDF_TEMPLATES } from './src/adobe/index.js';

// Available templates:
// - 'corporate'  : Professional corporate documents
// - 'technical'  : Technical documentation and specs
// - 'executive'  : Executive summaries and reports
// - 'proposal'   : Business proposals and presentations
```

### Custom Template Example
```typescript
const customTemplate = {
  id: 'my-custom-template',
  name: 'Custom Company Template',
  description: 'Our company-specific branding',
  corporateFonts: [
    {
      family: 'Arial',
      variants: ['regular', 'bold'],
      fallback: ['Helvetica', 'sans-serif']
    }
  ],
  colorScheme: {
    primary: '#2E86AB',
    secondary: '#A23B72',
    accent: '#F18F01',
    text: '#2D3748',
    background: '#FFFFFF',
    border: '#E2E8F0'
  },
  margins: {
    top: 72,    // 1 inch
    bottom: 72,
    left: 54,   // 0.75 inch
    right: 54
  },
  pageLayout: 'A4'
};

const pdf = await generateProfessionalPDF(markdownContent, customTemplate);
```

## 📋 Complete Workflow Example

```typescript
/**
 * Complete document generation workflow
 */
import { 
  EnhancedADPAProcessor,
  analyzeDocument,
  processDocument 
} from './src/adobe/index.js';

async function generateCompanyReport(content: string) {
  console.log('🔍 Step 1: Analyzing document...');
  
  // Analyze document structure and complexity
  const analysis = await analyzeDocument(content);
  console.log(`📊 Complexity: ${analysis.complexity}`);
  console.log(`🎯 Key points: ${analysis.keyPoints.length}`);
  
  console.log('📄 Step 2: Generating document package...');
  
  // Process with appropriate settings based on analysis
  const options = {
    interactive: analysis.complexity !== 'low',
    quality: analysis.complexity === 'high' ? 'print' : 'standard',
    compression: 'medium',
    accessibility: true
  };
  
  const documentPackage = await processDocument(content, options);
  
  console.log('✅ Step 3: Document generation complete!');
  console.log(`📄 PDF ID: ${documentPackage.pdf.id}`);
  console.log(`📈 Compliance Score: ${documentPackage.metadata.complianceScore}%`);
  console.log(`⏱️ Processing Time: ${documentPackage.metadata.processingTime}ms`);
  
  return documentPackage;
}

// Usage
const myReport = `
# Q4 Financial Report
## Revenue Analysis
Our Q4 revenue showed significant growth...
`;

const result = await generateCompanyReport(myReport);
```

## 🎯 Specialized Use Cases

### 1. Technical Documentation
```typescript
const techDoc = await processDocument(technicalContent, {
  pdfTemplate: DEFAULT_PDF_TEMPLATES.technical,
  interactive: true,           // Enable bookmarks and navigation
  accessibility: true,         // Screen reader support
  quality: 'high'             // High-quality diagrams
});
```

### 2. Executive Presentations
```typescript
const presentation = await processDocument(executiveContent, {
  pdfTemplate: DEFAULT_PDF_TEMPLATES.executive,
  interactive: true,           // Interactive charts
  compression: 'low',          // Maintain visual quality
  quality: 'print'            // Print-ready quality
});
```

### 3. Business Proposals
```typescript
const proposal = await processDocument(proposalContent, {
  pdfTemplate: DEFAULT_PDF_TEMPLATES.proposal,
  interactive: true,           // Forms and signature fields
  accessibility: true,         // Compliance requirements
  brandGuidelines: companyBranding
});
```

## 🔧 Advanced Configuration

### Brand Compliance Validation
```typescript
import { validateBrandCompliance } from './src/adobe/index.js';

// Custom brand guidelines
const brandGuidelines = {
  colorPalette: {
    primary: '#1A365D',
    secondary: '#2B6CB0',
    accent: '#ED8936',
    text: '#2D3748',
    background: '#FFFFFF',
    border: '#E2E8F0'
  },
  typography: {
    headings: [{
      family: 'Inter',
      size: 24,
      weight: 'bold',
      color: '#1A365D'
    }],
    body: {
      family: 'Inter',
      size: 14,
      weight: 'normal',
      color: '#2D3748'
    },
    captions: {
      family: 'Inter',
      size: 12,
      weight: 'normal',
      color: '#718096'
    },
    lineHeight: 1.6,
    spacing: {
      paragraphs: 16,
      sections: 32,
      lists: 8
    }
  },
  logoPlacement: {
    minSize: { width: 120, height: 40 },
    maxSize: { width: 300, height: 100 },
    clearSpace: 20,
    allowedPositions: ['header-left', 'header-right', 'footer-center']
  },
  layoutRules: {
    gridSystem: {
      columns: 12,
      gutters: 24,
      margins: { top: 72, bottom: 72, left: 54, right: 54 }
    },
    margins: { top: 72, bottom: 72, left: 54, right: 54 },
    columns: 1,
    gutters: 24
  }
};

// Validate compliance
const complianceResult = await validateBrandCompliance(pdf, brandGuidelines);
console.log(`Compliance Score: ${complianceResult.score}%`);
```

### Output Quality Options
```typescript
const qualityOptions = {
  draft: {
    compression: 'high',
    quality: 'draft',
    interactive: false
  },
  standard: {
    compression: 'medium', 
    quality: 'standard',
    interactive: true
  },
  print: {
    compression: 'low',
    quality: 'print',
    interactive: true
  }
};

const printQualityPdf = await processDocument(content, qualityOptions.print);
```

## 📊 Monitoring and Logging

```typescript
import { Logger } from './src/utils/logger.js';

const logger = new Logger('DocumentGeneration');

// Log generation process
logger.info('Starting document generation', { 
  contentLength: content.length,
  template: 'corporate'
});

try {
  const pdf = await generateProfessionalPDF(content);
  logger.info('Document generated successfully', {
    pdfId: pdf.id,
    size: pdf.size
  });
} catch (error) {
  logger.error('Document generation failed', error);
}
```

## 🚨 Error Handling

```typescript
import { CircuitBreaker } from './src/utils/circuit-breaker.js';

const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000
});

async function robustDocumentGeneration(content: string) {
  try {
    return await circuitBreaker.execute(async () => {
      return await processDocument(content);
    });
  } catch (error) {
    if (error.message === 'Circuit breaker is OPEN') {
      console.log('🔴 Service temporarily unavailable, trying again later...');
      // Implement fallback or retry logic
    }
    throw error;
  }
}
```

## 📝 Testing Your Implementation

```bash
# Run the demo to see examples
npm run adobe:demo

# Run tests
npm run adobe:test

# Validate your setup
npm run adobe:validate
```

## 📚 Next Steps

1. **Start Simple**: Use `generateProfessionalPDF()` for basic needs
2. **Add Features**: Progress to `processDocument()` for advanced features
3. **Customize**: Create custom templates and brand guidelines
4. **Scale**: Implement error handling and monitoring for production

---

**🎉 You're ready to generate professional documents with Adobe PDF Services!**

For more examples, check:
- `src/adobe/example.ts` - Working examples
- `docs/ADOBE/ADOBE-INTEGRATION-README.md` - Complete documentation
- `npm run adobe:demo` - Live demonstration
