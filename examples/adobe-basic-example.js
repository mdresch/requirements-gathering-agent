#!/usr/bin/env node

/**
 * Simple Adobe Document Generation Example
 * This is a basic, ready-to-run example showing how to generate documents
 */

import { generateProfessionalPDF, analyzeDocument, processDocument } from './src/adobe/index.js';

// Sample business content
const sampleContent = `
# Quarterly Business Review - Q4 2024

## Executive Summary

This quarter has shown **exceptional performance** across all key metrics, with significant growth in revenue, customer satisfaction, and market expansion.

### Key Highlights
- 📈 **Revenue Growth**: 28% increase compared to Q3 2024
- 👥 **New Customers**: 2,150 new client acquisitions
- ⭐ **Customer Satisfaction**: 4.9/5.0 average rating
- 🌍 **Market Expansion**: Entered 3 new geographic markets

## Financial Performance

| Metric | Q4 2024 | Q3 2024 | Growth |
|--------|---------|---------|--------|
| Revenue | $3.2M | $2.5M | +28% |
| Profit | $640K | $475K | +35% |
| EBITDA | $800K | $625K | +28% |
| Cash Flow | $720K | $580K | +24% |

## Strategic Initiatives

### 1. Digital Transformation
Our cloud migration project completed successfully, resulting in:
- 40% improvement in system performance
- 25% reduction in operational costs
- Enhanced security and compliance posture

### 2. Customer Experience Enhancement
Implementation of our new customer service platform delivered:
- 50% reduction in response times
- 15% increase in customer satisfaction scores
- 24/7 support coverage across all regions

### 3. Product Innovation
Three major product releases this quarter:
- **AI-Powered Analytics**: Advanced reporting capabilities
- **Mobile Application**: Native iOS and Android apps
- **API Integration**: Seamless third-party connections

## Market Analysis

### Competitive Position
Our market share increased to **18.5%** (+3.2 percentage points), establishing us as the #2 player in our primary market segment.

### Customer Segments
- **Enterprise** (55% of revenue): Large organizations with 1000+ employees
- **Mid-Market** (30% of revenue): Companies with 100-1000 employees  
- **Small Business** (15% of revenue): Organizations under 100 employees

## Looking Forward - Q1 2025

### Priorities
1. **International Expansion**: Launch in European markets
2. **Product Development**: Begin work on next-generation platform
3. **Talent Acquisition**: Hire 45 new team members
4. **Strategic Partnerships**: Establish 5 new channel partnerships

### Financial Projections
- Target Revenue: $3.8M (+19% growth)
- Projected New Customers: 2,500
- Expected Market Share: 21%

## Risk Management

### Identified Risks
- **Market Competition**: New competitors entering the space
- **Economic Uncertainty**: Potential impacts on customer spending
- **Supply Chain**: Possible disruptions in third-party services

### Mitigation Strategies
- Diversified customer portfolio
- Strong cash reserves (6 months operating expenses)
- Multiple vendor relationships for critical services

---

*This report was generated using Adobe Document Services integration.*
`;

async function runBasicExample() {
  console.log('📄 Adobe Document Generation - Basic Example');
  console.log('='.repeat(50));
  console.log('This example demonstrates the core document generation capabilities.\n');

  try {
    // Step 1: Analyze the document
    console.log('🔍 Step 1: Analyzing document structure...');
    const analysis = await analyzeDocument(sampleContent);
    
    console.log(`   📊 Complexity Level: ${analysis.complexity}`);
    console.log(`   🎯 Key Points Found: ${analysis.keyPoints.length}`);
    console.log(`   📈 Visualization Opportunities: ${analysis.visualizationOpportunities.length}`);
    console.log('   ✅ Analysis complete\n');

    // Step 2: Generate basic PDF
    console.log('📄 Step 2: Generating basic PDF (Corporate template)...');
    const basicPdf = await generateProfessionalPDF(sampleContent, 'corporate');
    
    console.log(`   📄 PDF Generated: ${basicPdf.id}`);
    console.log(`   📖 Pages: ${basicPdf.pages}`);
    console.log(`   💾 Size: ${basicPdf.size} bytes`);
    console.log('   ✅ Basic PDF complete\n');

    // Step 3: Generate advanced document package
    console.log('📦 Step 3: Generating advanced document package...');
    const documentPackage = await processDocument(sampleContent, {
      interactive: true,
      accessibility: true,
      quality: 'high',
      compression: 'medium'
    });
    
    console.log(`   📄 Main PDF: ${documentPackage.pdf.id}`);
    console.log(`   🖱️ Interactive PDF: ${documentPackage.interactivePDF?.id || 'Generated'}`);
    console.log(`   📊 Brand Compliance: ${documentPackage.metadata.complianceScore}%`);
    console.log(`   ⏱️ Processing Time: ${documentPackage.metadata.processingTime}ms`);
    console.log('   ✅ Advanced document complete\n');

    // Step 4: Try different templates
    console.log('🎨 Step 4: Testing different templates...');
    const templates = ['technical', 'executive', 'proposal'];
    
    for (const template of templates) {
      const templatePdf = await generateProfessionalPDF(sampleContent, template);
      console.log(`   ${template.charAt(0).toUpperCase() + template.slice(1)} Template: ${templatePdf.id} ✅`);
    }

    console.log('\n🎉 SUCCESS! All document generation examples completed successfully.');
    console.log('\n📚 Next Steps:');
    console.log('   • Check docs/ADOBE/COMPLETE-USAGE-EXAMPLES.md for advanced examples');
    console.log('   • Run "npm run adobe:demo-generation" for more demonstrations');
    console.log('   • Customize templates and branding for your organization');

  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Run "npm run adobe:validate" to check your setup');
    console.error('   • Run "npm run adobe:setup" if credentials are missing');
    console.error('   • Check that all dependencies are installed with "npm install"');
  }
}

async function showQuickReference() {
  console.log('\n📋 Quick Reference - Available Functions:');
  console.log('─'.repeat(50));
  
  console.log('\n🚀 Basic Functions:');
  console.log('   generateProfessionalPDF(content, template)  - Generate a PDF');
  console.log('   analyzeDocument(content)                    - Analyze document structure');
  console.log('   processDocument(content, options)           - Full document processing');
  
  console.log('\n🎨 Available Templates:');
  console.log('   • "corporate"  - Business reports and general documents');
  console.log('   • "technical"  - Technical documentation and specs');
  console.log('   • "executive"  - Executive summaries and presentations');
  console.log('   • "proposal"   - Business proposals and pitches');
  
  console.log('\n⚙️ NPM Scripts:');
  console.log('   npm run adobe:setup           - Setup Adobe credentials');
  console.log('   npm run adobe:validate        - Validate your setup');
  console.log('   npm run adobe:demo-generation - Advanced examples');
  console.log('   npm run adobe:test            - Run tests');
}

// Main execution
console.log('🎯 Adobe Document Services - Ready to Use Examples\n');

if (process.argv.includes('--quick-ref')) {
  showQuickReference();
} else {
  runBasicExample().then(() => {
    showQuickReference();
  });
}
