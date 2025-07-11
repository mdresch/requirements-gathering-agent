# Adobe Document Generation - Complete Usage Examples 🚀

This guide provides practical, ready-to-run examples for generating documents using the Adobe Document Services integration.

## 🏃‍♂️ Quick Start - Generate Your First Document

### Step 1: Setup Adobe Integration
```bash
# First-time setup (interactive)
npm run adobe:setup

# Validate your setup
npm run adobe:validate

# See a live demonstration
npm run adobe:demo-generation
```

### Step 2: Basic Document Generation

Create a new file `my-document-generator.js`:

```javascript
import { generateProfessionalPDF } from './src/adobe/index.js';

// Your content (markdown format)
const myContent = `
# Business Proposal: Cloud Migration Project

## Executive Summary
We propose migrating our core systems to cloud infrastructure to improve scalability, reduce costs, and enhance security.

### Key Benefits
- **Cost Reduction**: 30% decrease in infrastructure costs
- **Scalability**: Automatic scaling based on demand  
- **Security**: Enhanced data protection and compliance
- **Performance**: 50% improvement in response times

## Implementation Timeline
1. **Phase 1** (Months 1-2): Planning and assessment
2. **Phase 2** (Months 3-5): Core system migration
3. **Phase 3** (Months 6): Testing and optimization
4. **Phase 4** (Month 7): Go-live and monitoring

## Budget Overview
| Component | Cost | Timeline |
|-----------|------|----------|
| Planning | $25,000 | Month 1 |
| Migration | $150,000 | Months 2-5 |
| Testing | $30,000 | Month 6 |
| **Total** | **$205,000** | **7 months** |

## Next Steps
Please review this proposal and schedule a meeting to discuss implementation details.
`;

// Generate the PDF
async function createMyDocument() {
  try {
    console.log('🔄 Generating your business proposal...');
    
    // Simple generation with corporate template
    const pdf = await generateProfessionalPDF(myContent, 'proposal');
    
    console.log('✅ Document generated successfully!');
    console.log(`📄 PDF ID: ${pdf.id}`);
    console.log(`📊 Pages: ${pdf.pages}`);
    console.log(`💾 Size: ${pdf.size} bytes`);
    
    return pdf;
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  }
}

createMyDocument();
```

Run it:
```bash
node my-document-generator.js
```

## 📚 Available Document Templates

### 1. Corporate Template (Default)
**Best for**: Business reports, proposals, general corporate documents

```javascript
import { generateProfessionalPDF } from './src/adobe/index.js';

const pdf = await generateProfessionalPDF(content, 'corporate');
// or simply:
const pdf = await generateProfessionalPDF(content); // defaults to corporate
```

### 2. Technical Template
**Best for**: Technical documentation, API guides, system specifications

```javascript
const technicalPdf = await generateProfessionalPDF(content, 'technical');
```

### 3. Executive Template
**Best for**: Executive summaries, board presentations, high-level reports

```javascript
const executivePdf = await generateProfessionalPDF(content, 'executive');
```

### 4. Proposal Template
**Best for**: Business proposals, project pitches, client presentations

```javascript
const proposalPdf = await generateProfessionalPDF(content, 'proposal');
```

## 🎨 Advanced Document Processing

### Full-Featured Document Generation

```javascript
import { processDocument } from './src/adobe/index.js';

async function createAdvancedDocument() {
  const content = `
  # Advanced Project Report
  
  ## Interactive Elements
  This document will include interactive features like:
  - Clickable table of contents
  - Interactive charts
  - Form fields for feedback
  
  ## Accessibility Features
  - Screen reader compatibility
  - High contrast mode support
  - Keyboard navigation
  `;

  // Generate a complete document package
  const documentPackage = await processDocument(content, {
    interactive: true,           // Add interactive elements
    accessibility: true,         // Enable accessibility features
    compression: 'medium',       // Optimize file size
    quality: 'high',            // High-quality output
    pdfTemplate: 'corporate'     // Use corporate template
  });

  console.log('📄 Main PDF:', documentPackage.pdf.id);
  console.log('🖱️ Interactive PDF:', documentPackage.interactivePDF?.id);
  console.log('📊 Compliance Score:', documentPackage.metadata.complianceScore + '%');
  console.log('⏱️ Processing Time:', documentPackage.metadata.processingTime + 'ms');

  return documentPackage;
}
```

### Document Analysis Before Generation

```javascript
import { analyzeDocument, processDocument } from './src/adobe/index.js';

async function smartDocumentGeneration(content) {
  // Step 1: Analyze the document
  console.log('🔍 Analyzing document structure...');
  const analysis = await analyzeDocument(content);
  
  console.log(`📊 Complexity: ${analysis.complexity}`);
  console.log(`🎯 Key points found: ${analysis.keyPoints.length}`);
  console.log(`📈 Visualization opportunities: ${analysis.visualizationOpportunities.length}`);

  // Step 2: Choose optimal settings based on analysis
  const processingOptions = {
    interactive: analysis.complexity !== 'low',
    quality: analysis.complexity === 'high' ? 'print' : 'standard',
    compression: analysis.complexity === 'low' ? 'high' : 'medium',
    accessibility: true
  };

  console.log('📄 Generating optimized document...');
  
  // Step 3: Generate with optimized settings
  const result = await processDocument(content, processingOptions);
  
  console.log('✅ Smart generation complete!');
  return result;
}
```

## 🏢 Enterprise-Level Usage

### Custom Brand Guidelines

```javascript
import { processDocument } from './src/adobe/index.js';

// Define your company's brand guidelines
const myCompanyBranding = {
  colorPalette: {
    primary: '#0066CC',      // Company blue
    secondary: '#FF6600',    // Company orange
    accent: '#00CC66',       // Success green
    text: '#333333',         // Dark gray
    background: '#FFFFFF',   // White
    border: '#DDDDDD'        // Light gray
  },
  typography: {
    headings: [{
      family: 'Montserrat',   // Your brand font
      size: 28,
      weight: 'bold',
      color: '#0066CC'
    }],
    body: {
      family: 'Open Sans',    // Body font
      size: 14,
      weight: 'normal',
      color: '#333333'
    },
    captions: {
      family: 'Open Sans',
      size: 12,
      weight: 'normal',
      color: '#666666'
    }
  },
  logoPlacement: {
    allowedPositions: ['header-left', 'footer-center']
  }
};

// Generate document with custom branding
const brandedDocument = await processDocument(content, {
  brandGuidelines: myCompanyBranding,
  quality: 'print',
  interactive: true
});
```

### Batch Document Generation

```javascript
import { generateProfessionalPDF } from './src/adobe/index.js';

async function generateMultipleDocuments() {
  const documents = [
    { name: 'quarterly-report', content: quarterlyReportContent, template: 'executive' },
    { name: 'tech-specs', content: technicalSpecs, template: 'technical' },
    { name: 'client-proposal', content: proposalContent, template: 'proposal' }
  ];

  const results = [];

  for (const doc of documents) {
    console.log(`🔄 Generating ${doc.name}...`);
    
    try {
      const pdf = await generateProfessionalPDF(doc.content, doc.template);
      results.push({
        name: doc.name,
        success: true,
        pdf: pdf
      });
      
      console.log(`✅ ${doc.name} completed - ID: ${pdf.id}`);
    } catch (error) {
      results.push({
        name: doc.name,
        success: false,
        error: error.message
      });
      
      console.error(`❌ ${doc.name} failed:`, error.message);
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  console.log(`\n📊 Batch Generation Complete:`);
  console.log(`✅ Successful: ${successful}/${documents.length}`);
  console.log(`❌ Failed: ${documents.length - successful}/${documents.length}`);

  return results;
}
```

## 🔧 Production-Ready Features

### Error Handling and Retries

```javascript
import { generateProfessionalPDF, CircuitBreaker } from './src/adobe/index.js';

// Setup circuit breaker for reliability
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,     // Allow 3 failures before opening
  resetTimeout: 30000      // Try again after 30 seconds
});

async function robustDocumentGeneration(content, template = 'corporate', retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Generation attempt ${attempt}/${retries}...`);
      
      const pdf = await circuitBreaker.execute(async () => {
        return await generateProfessionalPDF(content, template);
      });
      
      console.log('✅ Document generated successfully!');
      return pdf;
      
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        console.error('❌ All attempts failed');
        throw new Error(`Document generation failed after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Monitoring and Logging

```javascript
import { generateProfessionalPDF, Logger } from './src/adobe/index.js';

const logger = new Logger('DocumentGeneration');

async function monitoredGeneration(content, template) {
  const startTime = Date.now();
  
  logger.info('Document generation started', {
    contentLength: content.length,
    template: template,
    timestamp: new Date().toISOString()
  });

  try {
    const pdf = await generateProfessionalPDF(content, template);
    const duration = Date.now() - startTime;
    
    logger.info('Document generation succeeded', {
      pdfId: pdf.id,
      pages: pdf.pages,
      size: pdf.size,
      duration: duration + 'ms',
      template: template
    });

    return pdf;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Document generation failed', {
      error: error.message,
      duration: duration + 'ms',
      template: template,
      contentLength: content.length
    });
    
    throw error;
  }
}
```

## 🧪 Testing Your Implementation

### Basic Test

Create `test-adobe-generation.js`:

```javascript
import { generateProfessionalPDF, analyzeDocument } from './src/adobe/index.js';

async function testDocumentGeneration() {
  console.log('🧪 Testing Adobe Document Generation...\n');

  const testContent = `
  # Test Document
  ## Section 1
  This is a test document to verify the Adobe integration is working correctly.
  
  ### Features Tested
  - Basic PDF generation
  - Document analysis
  - Template application
  
  ## Section 2
  | Feature | Status |
  |---------|--------|
  | PDF Generation | ✅ |
  | Analysis | ✅ |
  | Templates | ✅ |
  `;

  try {
    // Test 1: Document Analysis
    console.log('📊 Test 1: Document Analysis');
    const analysis = await analyzeDocument(testContent);
    console.log(`   Complexity: ${analysis.complexity}`);
    console.log(`   Key Points: ${analysis.keyPoints.length}`);
    console.log('   ✅ Analysis passed\n');

    // Test 2: PDF Generation
    console.log('📄 Test 2: PDF Generation');
    const pdf = await generateProfessionalPDF(testContent);
    console.log(`   PDF ID: ${pdf.id}`);
    console.log(`   Pages: ${pdf.pages}`);
    console.log('   ✅ Generation passed\n');

    // Test 3: Different Templates
    console.log('🎨 Test 3: Template Variations');
    const templates = ['corporate', 'technical', 'executive', 'proposal'];
    
    for (const template of templates) {
      const templatePdf = await generateProfessionalPDF(testContent, template);
      console.log(`   ${template}: ${templatePdf.id} ✅`);
    }

    console.log('\n🎉 All tests passed! Adobe integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('📋 Please check your Adobe setup with: npm run adobe:validate');
  }
}

testDocumentGeneration();
```

Run your test:
```bash
node test-adobe-generation.js
```

## 📋 Available NPM Scripts

```bash
# Setup and validation
npm run adobe:setup           # Interactive setup wizard
npm run adobe:validate        # Validate your configuration

# Demonstrations
npm run adobe:demo            # Basic Adobe integration demo
npm run adobe:demo-generation # Advanced document generation demo

# Testing
npm run adobe:test            # Run all Adobe tests
```

## 🔍 Troubleshooting

### Common Issues and Solutions

**Issue**: "Adobe credentials not found"
```bash
# Solution: Run the setup script
npm run adobe:setup
```

**Issue**: "Template not found"
```javascript
// Solution: Use available templates
import { DEFAULT_PDF_TEMPLATES } from './src/adobe/index.js';
console.log('Available templates:', Object.keys(DEFAULT_PDF_TEMPLATES));
```

**Issue**: "Generation timeout"
```javascript
// Solution: Add error handling
try {
  const pdf = await generateProfessionalPDF(content);
} catch (error) {
  if (error.message.includes('timeout')) {
    console.log('Retrying with smaller content...');
    // Implement retry logic
  }
}
```

## 🚀 Next Steps

1. **Start Simple**: Begin with `generateProfessionalPDF()` for basic needs
2. **Add Features**: Move to `processDocument()` for advanced options
3. **Customize**: Create your own templates and brand guidelines  
4. **Scale**: Implement error handling, monitoring, and batch processing
5. **Monitor**: Add logging and circuit breakers for production use

---

**🎯 You're now ready to generate professional documents at scale!**

For more information:
- Complete API documentation: `docs/ADOBE/ADOBE-INTEGRATION-README.md`
- Live examples: `npm run adobe:demo-generation`
- Interactive setup: `npm run adobe:setup`
