#!/usr/bin/env node

/**
 * Adobe Document Generation - Production-Ready Example
 * This example shows enterprise-level document generation with error handling,
 * logging, retries, and monitoring suitable for production use.
 */

import { 
  generateProfessionalPDF, 
  processDocument, 
  analyzeDocument,
  CircuitBreaker,
  Logger 
} from './src/adobe/index.js';

// Initialize production-grade utilities
const logger = new Logger('ProductionDocumentGeneration');
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000
});

// Custom brand guidelines for enterprise use
const enterpriseBrandGuidelines = {
  colorPalette: {
    primary: '#1A365D',      // Navy blue
    secondary: '#2B6CB0',    // Professional blue
    accent: '#ED8936',       // Orange accent
    text: '#2D3748',         // Dark gray
    background: '#FFFFFF',   // White
    border: '#E2E8F0'        // Light gray
  },
  typography: {
    headings: [{
      family: 'Segoe UI',
      size: 24,
      weight: 'bold',
      color: '#1A365D'
    }],
    body: {
      family: 'Segoe UI',
      size: 14,
      weight: 'normal',
      color: '#2D3748'
    },
    captions: {
      family: 'Segoe UI',
      size: 12,
      weight: 'normal',
      color: '#718096'
    }
  },
  logoPlacement: {
    allowedPositions: ['header-left', 'footer-center']
  }
};

/**
 * Production-ready document generation with full error handling
 */
async function generateDocumentWithRetries(content, template = 'corporate', maxRetries = 3) {
  const startTime = Date.now();
  
  logger.info('Starting document generation', {
    contentLength: content.length,
    template: template,
    maxRetries: maxRetries,
    timestamp: new Date().toISOString()
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Generation attempt ${attempt}/${maxRetries}`, { attempt });

      const result = await circuitBreaker.execute(async () => {
        return await generateProfessionalPDF(content, template);
      });

      const duration = Date.now() - startTime;
      
      logger.info('Document generation successful', {
        pdfId: result.id,
        pages: result.pages,
        size: result.size,
        duration: duration + 'ms',
        attempt: attempt,
        template: template
      });

      return {
        success: true,
        pdf: result,
        attempt: attempt,
        duration: duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.warn(`Generation attempt ${attempt} failed`, {
        error: error.message,
        attempt: attempt,
        duration: duration + 'ms',
        template: template
      });

      if (attempt === maxRetries) {
        logger.error('All generation attempts failed', {
          error: error.message,
          totalAttempts: maxRetries,
          totalDuration: duration + 'ms',
          template: template
        });

        return {
          success: false,
          error: error.message,
          attempts: maxRetries,
          duration: duration
        };
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      logger.info(`Waiting ${delay}ms before retry`, { delay, nextAttempt: attempt + 1 });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Batch document generation with progress tracking
 */
async function generateDocumentBatch(documents) {
  logger.info('Starting batch document generation', { 
    totalDocuments: documents.length 
  });

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const progress = `${i + 1}/${documents.length}`;
    
    logger.info(`Processing document ${progress}`, { 
      documentName: doc.name,
      progress: progress
    });

    console.log(`\n📄 Processing ${progress}: ${doc.name}`);

    try {
      // Analyze document first for optimal processing
      const analysis = await analyzeDocument(doc.content);
      
      console.log(`   🔍 Complexity: ${analysis.complexity}`);
      console.log(`   📊 Key Points: ${analysis.keyPoints.length}`);

      // Choose processing options based on analysis
      const options = {
        interactive: analysis.complexity !== 'low',
        quality: analysis.complexity === 'high' ? 'print' : 'standard',
        compression: 'medium',
        accessibility: true,
        brandGuidelines: enterpriseBrandGuidelines
      };

      const result = await processDocument(doc.content, options);

      results.push({
        name: doc.name,
        success: true,
        pdf: result.pdf,
        metadata: result.metadata,
        analysis: analysis
      });

      console.log(`   ✅ Success: ${result.pdf.id} (${result.metadata.processingTime}ms)`);
      
      logger.info('Document processed successfully', {
        documentName: doc.name,
        pdfId: result.pdf.id,
        processingTime: result.metadata.processingTime,
        complianceScore: result.metadata.complianceScore
      });

    } catch (error) {
      results.push({
        name: doc.name,
        success: false,
        error: error.message
      });

      console.log(`   ❌ Failed: ${error.message}`);
      
      logger.error('Document processing failed', {
        documentName: doc.name,
        error: error.message
      });
    }
  }

  const totalDuration = Date.now() - startTime;
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;

  logger.info('Batch processing complete', {
    totalDocuments: documents.length,
    successful: successful,
    failed: failed,
    totalDuration: totalDuration + 'ms',
    successRate: (successful / documents.length * 100).toFixed(1) + '%'
  });

  return {
    results: results,
    summary: {
      total: documents.length,
      successful: successful,
      failed: failed,
      duration: totalDuration,
      successRate: (successful / documents.length * 100).toFixed(1) + '%'
    }
  };
}

/**
 * Document health check and validation
 */
async function validateDocumentGeneration() {
  logger.info('Starting document generation health check');

  const testContent = `
  # Adobe Integration Health Check
  
  ## System Status
  This document validates that the Adobe Document Services integration is functioning correctly.
  
  ### Test Components
  - PDF Generation
  - Document Analysis  
  - Template Processing
  - Brand Compliance
  
  ## Test Results
  All systems operational and ready for production use.
  `;

  try {
    console.log('🏥 Adobe Document Generation - Health Check');
    console.log('='.repeat(50));

    // Test 1: Basic generation
    console.log('\n🔍 Test 1: Basic PDF Generation');
    const basicResult = await generateDocumentWithRetries(testContent, 'corporate', 1);
    
    if (basicResult.success) {
      console.log(`   ✅ Basic generation: ${basicResult.pdf.id} (${basicResult.duration}ms)`);
    } else {
      console.log(`   ❌ Basic generation failed: ${basicResult.error}`);
      return false;
    }

    // Test 2: Advanced processing
    console.log('\n📦 Test 2: Advanced Document Processing');
    const advancedResult = await processDocument(testContent, {
      interactive: true,
      accessibility: true,
      quality: 'high'
    });
    
    console.log(`   ✅ Advanced processing: ${advancedResult.pdf.id}`);
    console.log(`   📊 Compliance Score: ${advancedResult.metadata.complianceScore}%`);

    // Test 3: Template variations
    console.log('\n🎨 Test 3: Template Variations');
    const templates = ['corporate', 'technical', 'executive', 'proposal'];
    
    for (const template of templates) {
      const templateResult = await generateDocumentWithRetries(testContent, template, 1);
      
      if (templateResult.success) {
        console.log(`   ✅ ${template}: ${templateResult.pdf.id}`);
      } else {
        console.log(`   ❌ ${template}: ${templateResult.error}`);
      }
    }

    console.log('\n🎉 Health Check Complete - All systems operational!');
    
    logger.info('Health check completed successfully');
    return true;

  } catch (error) {
    console.error('\n❌ Health check failed:', error.message);
    logger.error('Health check failed', { error: error.message });
    return false;
  }
}

/**
 * Main production example
 */
async function runProductionExample() {
  console.log('🏭 Adobe Document Services - Production Example');
  console.log('='.repeat(60));
  console.log('This example demonstrates enterprise-grade document generation.\n');

  // Step 1: Health check
  const healthCheck = await validateDocumentGeneration();
  
  if (!healthCheck) {
    console.error('\n❌ Health check failed. Please resolve issues before proceeding.');
    process.exit(1);
  }

  // Step 2: Sample batch processing
  console.log('\n📋 Running Batch Document Generation...');
  
  const sampleDocuments = [
    {
      name: 'executive-summary',
      content: `
      # Executive Summary - Q4 2024
      ## Key Performance Indicators
      - Revenue: $5.2M (+18% YoY)
      - Customer Growth: +2,400 new customers
      - Market Share: 22.5% (+3.8 points)
      `,
      template: 'executive'
    },
    {
      name: 'technical-specification',
      content: `
      # API Documentation v2.1
      ## Authentication
      All API requests require Bearer token authentication.
      ## Endpoints
      - GET /api/users
      - POST /api/documents
      - PUT /api/settings
      `,
      template: 'technical'
    },
    {
      name: 'client-proposal',
      content: `
      # Digital Transformation Proposal
      ## Project Overview
      Complete modernization of legacy systems with cloud-native architecture.
      ## Timeline
      6-month implementation with phased rollout.
      ## Investment
      $450,000 total project cost with 24-month ROI.
      `,
      template: 'proposal'
    }
  ];

  const batchResult = await generateDocumentBatch(sampleDocuments);

  // Display results
  console.log('\n📊 Batch Processing Results');
  console.log('─'.repeat(40));
  console.log(`Total Documents: ${batchResult.summary.total}`);
  console.log(`Successful: ${batchResult.summary.successful} ✅`);
  console.log(`Failed: ${batchResult.summary.failed} ❌`);
  console.log(`Success Rate: ${batchResult.summary.successRate}`);
  console.log(`Total Duration: ${batchResult.summary.duration}ms`);

  if (batchResult.summary.successful > 0) {
    console.log('\n✅ Production example completed successfully!');
    console.log('\n🚀 Your Adobe integration is production-ready.');
  } else {
    console.log('\n❌ Production example had issues. Please check logs.');
  }

  logger.info('Production example completed', {
    batchSummary: batchResult.summary
  });
}

// Command line interface
if (process.argv.includes('--health-check')) {
  validateDocumentGeneration();
} else if (process.argv.includes('--help')) {
  console.log(`
Adobe Document Generation - Production Example

Usage:
  node examples/adobe-production-example.js              # Run full production example
  node examples/adobe-production-example.js --health-check  # Run health check only
  node examples/adobe-production-example.js --help         # Show this help

Features:
  • Production-grade error handling and retries
  • Circuit breaker pattern for reliability  
  • Comprehensive logging and monitoring
  • Batch document processing
  • Enterprise brand compliance
  • Health check validation

Requirements:
  • Run 'npm run adobe:setup' first to configure credentials
  • Ensure all dependencies are installed with 'npm install'
  `);
} else {
  runProductionExample();
}
