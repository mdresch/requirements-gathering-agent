/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global Office Word console */

/**
 * ADPA Markdown-to-Word Integration - Live Presentation Demo
 *
 * This demonstration shows the complete workflow of converting markdown files
 * from the requirements-gathering-agent generated-documents folder into
 * professional Word documents with PMBOK-style formatting.
 */

// Import the integration manager from the main word.ts file
import { DocumentIntegrationManager, MockDocumentReader } from "../src/commands/word";

/**
 * Main presentation demonstration function
 * This will be called from a ribbon button to show the complete workflow
 */
export async function runPresentationDemo(event: Office.AddinCommands.Event) {
  try {
    await Word.run(async (context) => {
      // Clear the document first
      context.document.body.clear();
      
      // Create presentation title
      await createPresentationTitle(context);
      
      // Demo 1: Show available documents
      await demoDocumentDiscovery(context);
      
      // Demo 2: Convert a single document (Project Charter)
      await demoSingleDocumentConversion(context);
      
      // Demo 3: Show table conversion capabilities
      await demoTableConversion(context);
      
      // Demo 4: Demonstrate batch conversion
      await demoBatchConversion(context);
      
      // Demo 5: Show formatting and styling
      await demoFormattingCapabilities(context);
      
      // Add conclusion
      await addDemoConclusion(context);
      
      await context.sync();
    });
    
    event.completed();
  } catch (error) {
    console.error("Error in presentation demo:", error);
    event.completed();
  }
}

/**
 * Create the presentation title and introduction
 */
async function createPresentationTitle(context: Word.RequestContext) {
  // Main title
  const title = context.document.body.insertParagraph("ADPA Markdown-to-Word Integration", Word.InsertLocation.end);
  title.styleBuiltIn = Word.BuiltInStyleName.title;
  title.alignment = Word.Alignment.centered;
  
  // Subtitle
  const subtitle = context.document.body.insertParagraph(
    "Live Demonstration of Requirements Gathering Integration",
    Word.InsertLocation.end
  );
  subtitle.styleBuiltIn = Word.BuiltInStyleName.subtitle;
  subtitle.alignment = Word.Alignment.centered;
  
  // Add date and presenter info
  const dateInfo = context.document.body.insertParagraph(
    `Demonstration Date: ${new Date().toLocaleDateString()}\nPresented by: ADPA System`,
    Word.InsertLocation.end
  );
  dateInfo.alignment = Word.Alignment.centered;
  dateInfo.font.size = 12;
  
  // Add page break
  context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
}

/**
 * Demo 1: Document Discovery and Cataloging
 */
async function demoDocumentDiscovery(context: Word.RequestContext) {
  // Section header
  const header = context.document.body.insertParagraph(
    "Demo 1: Document Discovery", 
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  // Explanation
  const explanation = context.document.body.insertParagraph(
    "The ADPA system automatically scans the generated-documents folder and discovers all available markdown files, " +
    "categorizing them by type and providing metadata about each document.",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  // Show discovered documents
  const discoveryHeader = context.document.body.insertParagraph(
    "Discovered Documents:", 
    Word.InsertLocation.end
  );
  discoveryHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  // Create mock integration manager
  const integrationManager = new DocumentIntegrationManager(new MockDocumentReader());
  
  // Get document catalog
  const catalog = await integrationManager.getDocumentCatalog();
    // Display catalog as formatted list
  for (const [category, documents] of Object.entries(catalog)) {
    const categoryHeader = context.document.body.insertParagraph(`📁 ${category}`, Word.InsertLocation.end);
    categoryHeader.styleBuiltIn = Word.BuiltInStyleName.heading3;
    categoryHeader.font.color = "#2E86AB";
    
    // Type assertion to handle the unknown type
    const docArray = documents as string[];
    docArray.forEach((docTitle) => {
      const docItem = context.document.body.insertParagraph(`   • ${docTitle}`, Word.InsertLocation.end);
      docItem.styleBuiltIn = Word.BuiltInStyleName.normal;
      docItem.leftIndent = 20;
    });
  }
  
  // Add separator
  context.document.body.insertParagraph("", Word.InsertLocation.end);
  const separator1 = context.document.body.insertParagraph(
    "═".repeat(80), 
    Word.InsertLocation.end
  );
  separator1.alignment = Word.Alignment.centered;
  separator1.font.color = "#cccccc";
  context.document.body.insertParagraph("", Word.InsertLocation.end);
}

/**
 * Demo 2: Single Document Conversion
 */
async function demoSingleDocumentConversion(context: Word.RequestContext) {
  // Section header
  const header = context.document.body.insertParagraph(
    "Demo 2: Single Document Conversion", 
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  // Explanation
  const explanation = context.document.body.insertParagraph(
    "Here we demonstrate converting a single markdown file (Project Charter) into a professionally formatted Word document " +
    "with title page, table of contents, and PMBOK-style formatting.",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  // Show "Before" - Raw Markdown
  const beforeHeader = context.document.body.insertParagraph(
    "Before: Raw Markdown Content", 
    Word.InsertLocation.end
  );
  beforeHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  beforeHeader.font.color = "#D2691E";
  
  const rawMarkdown = context.document.body.insertParagraph(
    `---
title: "Project Charter"
category: "project-charter"
author: "ADPA System"
version: "1.0"
---

# Project Charter: ADPA

## Executive Summary
This Project Charter authorizes the initiation of the ADPA project...

## Project Objectives
| Objective | Success Criteria | Timeline |
|-----------|------------------|----------|
| Automate Documentation | 95% accuracy | Q2 2025 |
| Reduce Manual Effort | 80% time savings | Q3 2025 |`,
    Word.InsertLocation.end
  );
  rawMarkdown.font.name = "Courier New";
  rawMarkdown.font.size = 9;
  rawMarkdown.font.color = "#666666";
  
  // Show "After" - Converted Word Document
  const afterHeader = context.document.body.insertParagraph(
    "After: Converted Word Document", 
    Word.InsertLocation.end
  );
  afterHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  afterHeader.font.color = "#228B22";
  
  // Simulate converted content
  const convertedTitle = context.document.body.insertParagraph(
    "PROJECT CHARTER: ADPA", 
    Word.InsertLocation.end
  );
  convertedTitle.styleBuiltIn = Word.BuiltInStyleName.title;
  convertedTitle.alignment = Word.Alignment.centered;
  
  const convertedSubtitle = context.document.body.insertParagraph(
    "Automated Documentation Project Assistant", 
    Word.InsertLocation.end
  );
  convertedSubtitle.styleBuiltIn = Word.BuiltInStyleName.subtitle;
  convertedSubtitle.alignment = Word.Alignment.centered;
  
  const executiveSummary = context.document.body.insertParagraph(
    "1. Executive Summary", 
    Word.InsertLocation.end
  );
  executiveSummary.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  const summaryContent = context.document.body.insertParagraph(
    "This Project Charter authorizes the initiation of the ADPA (Automated Documentation Project Assistant) project...", 
    Word.InsertLocation.end
  );
  summaryContent.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  // Add separator
  context.document.body.insertParagraph("", Word.InsertLocation.end);
  const separator2 = context.document.body.insertParagraph(
    "═".repeat(80), 
    Word.InsertLocation.end
  );
  separator2.alignment = Word.Alignment.centered;
  separator2.font.color = "#cccccc";
  context.document.body.insertParagraph("", Word.InsertLocation.end);
}

/**
 * Demo 3: Table Conversion Capabilities
 */
async function demoTableConversion(context: Word.RequestContext) {
  // Section header
  const header = context.document.body.insertParagraph(
    "Demo 3: Advanced Table Conversion", 
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  // Explanation
  const explanation = context.document.body.insertParagraph(
    "The system intelligently converts markdown tables into professionally formatted Word tables with proper styling, " +
    "headers, and alignment. Here's an example of a project timeline table:",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  // Create a sample table
  const tableHeader = context.document.body.insertParagraph(
    "Sample Converted Table: Project Timeline", 
    Word.InsertLocation.end
  );
  tableHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  // Insert a formatted table
  const table = context.document.body.insertTable(4, 4, Word.InsertLocation.end);
  
  // Set table style
  table.styleBuiltIn = Word.BuiltInStyleName.tableGridLight;
  
  // Headers
  table.getCell(0, 0).value = "Phase";
  table.getCell(0, 1).value = "Deliverable";
  table.getCell(0, 2).value = "Duration";
  table.getCell(0, 3).value = "Resources";
  
  // Data rows
  table.getCell(1, 0).value = "Planning";
  table.getCell(1, 1).value = "Project Charter";
  table.getCell(1, 2).value = "2 weeks";
  table.getCell(1, 3).value = "PM, BA";
  
  table.getCell(2, 0).value = "Development";
  table.getCell(2, 1).value = "ADPA System";
  table.getCell(2, 2).value = "12 weeks";
  table.getCell(2, 3).value = "Dev Team";
  
  table.getCell(3, 0).value = "Testing";
  table.getCell(3, 1).value = "Test Results";
  table.getCell(3, 2).value = "4 weeks";
  table.getCell(3, 3).value = "QA Team";
  
  // Format header row
  for (let i = 0; i < 4; i++) {
    const headerCell = table.getCell(0, i);
    headerCell.body.font.bold = true;
    headerCell.body.font.color = "#FFFFFF";
    headerCell.shading.backgroundPatternColor = "#2E86AB";
  }
  
  // Add separator
  context.document.body.insertParagraph("", Word.InsertLocation.end);
  const separator3 = context.document.body.insertParagraph(
    "═".repeat(80), 
    Word.InsertLocation.end
  );
  separator3.alignment = Word.Alignment.centered;
  separator3.font.color = "#cccccc";
  context.document.body.insertParagraph("", Word.InsertLocation.end);
}

/**
 * Demo 4: Batch Conversion Process
 */
async function demoBatchConversion(context: Word.RequestContext) {
  // Section header
  const header = context.document.body.insertParagraph(
    "Demo 4: Batch Conversion Capabilities", 
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  // Explanation
  const explanation = context.document.body.insertParagraph(
    "The system can process multiple documents simultaneously, converting entire categories of documents " +
    "with progress tracking and error handling. This is particularly useful for converting all planning documents " +
    "or requirements documents at once.",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  // Show batch process simulation
  const processHeader = context.document.body.insertParagraph(
    "Batch Conversion Process:", 
    Word.InsertLocation.end
  );
  processHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  const steps = [
    "🔍 Scanning generated-documents folder...",
    "📁 Found 8 documents in 'planning' category",
    "📄 Converting project-charter.md ✓",
    "📄 Converting work-breakdown-structure.md ✓",
    "📄 Converting project-plan.md ✓",
    "📄 Converting risk-management-plan.md ✓",
    "📊 Progress: 4/8 documents completed (50%)",
    "📄 Converting stakeholder-register.md ✓",
    "📄 Converting communication-plan.md ✓",
    "📄 Converting quality-management-plan.md ✓",
    "📄 Converting procurement-plan.md ✓",
    "✅ Batch conversion completed successfully!",
    "📈 Results: 8 documents converted in 2.3 seconds",
  ];
  
  steps.forEach((step, index) => {
    const stepPara = context.document.body.insertParagraph(step, Word.InsertLocation.end);
    stepPara.styleBuiltIn = Word.BuiltInStyleName.normal;
    stepPara.leftIndent = 10;
    
    // Color code different types of steps
    if (step.includes("✓")) {
      stepPara.font.color = "#228B22"; // Green for success
    } else if (step.includes("Progress:")) {
      stepPara.font.color = "#FF8C00"; // Orange for progress
    } else if (step.includes("Results:")) {
      stepPara.font.color = "#2E86AB"; // Blue for results
    }
  });
  
  // Add separator
  context.document.body.insertParagraph("", Word.InsertLocation.end);
  const separator4 = context.document.body.insertParagraph(
    "═".repeat(80), 
    Word.InsertLocation.end
  );
  separator4.alignment = Word.Alignment.centered;
  separator4.font.color = "#cccccc";
  context.document.body.insertParagraph("", Word.InsertLocation.end);
}

/**
 * Demo 5: Formatting and Styling Capabilities
 */
async function demoFormattingCapabilities(context: Word.RequestContext) {
  // Section header
  const header = context.document.body.insertParagraph(
    "Demo 5: Professional Formatting & PMBOK Styling", 
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  // Explanation
  const explanation = context.document.body.insertParagraph(
    "The integration applies professional PMBOK-style formatting automatically, including consistent heading styles, " +
    "proper spacing, title pages, and table of contents generation.",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  // Show formatting features
  const featuresHeader = context.document.body.insertParagraph(
    "Automatic Formatting Features:", 
    Word.InsertLocation.end
  );
  featuresHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  const features = [
    "📋 Professional title pages with metadata",
    "📑 Auto-generated table of contents with hyperlinks",
    "🎨 Consistent heading hierarchy (H1, H2, H3)",
    "📊 Formatted tables with headers and styling",
    "📝 Proper paragraph spacing and indentation",
    "🔗 Cross-references and navigation",
    "📄 Page breaks and section formatting",
    "🏷️ Document metadata and properties",
  ];
  
  features.forEach((feature) => {
    const featurePara = context.document.body.insertParagraph(feature, Word.InsertLocation.end);
    featurePara.styleBuiltIn = Word.BuiltInStyleName.normal;
    featurePara.leftIndent = 15;
  });
  
  // Show style examples
  const styleHeader = context.document.body.insertParagraph(
    "Style Examples:", 
    Word.InsertLocation.end
  );
  styleHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  // Example heading levels
  const h1Example = context.document.body.insertParagraph(
    "1. Main Section (Heading 1)", 
    Word.InsertLocation.end
  );
  h1Example.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  const h2Example = context.document.body.insertParagraph(
    "1.1 Subsection (Heading 2)", 
    Word.InsertLocation.end
  );
  h2Example.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  const h3Example = context.document.body.insertParagraph(
    "1.1.1 Detail Section (Heading 3)", 
    Word.InsertLocation.end
  );
  h3Example.styleBuiltIn = Word.BuiltInStyleName.heading3;
  
  const normalExample = context.document.body.insertParagraph(
    "This is normal body text with proper formatting, spacing, and professional appearance suitable for business documents.", 
    Word.InsertLocation.end
  );
  normalExample.styleBuiltIn = Word.BuiltInStyleName.normal;
}

/**
 * Add demonstration conclusion
 */
async function addDemoConclusion(context: Word.RequestContext) {
  // Add page break
  context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
  
  // Conclusion header
  const conclusionHeader = context.document.body.insertParagraph(
    "Demonstration Summary", 
    Word.InsertLocation.end
  );
  conclusionHeader.styleBuiltIn = Word.BuiltInStyleName.heading1;
  conclusionHeader.alignment = Word.Alignment.centered;
  
  // Summary content
  const summary = context.document.body.insertParagraph(
    "The ADPA Markdown-to-Word integration provides a complete solution for converting requirements gathering " +
    "documentation into professional Word documents. The system automatically handles document discovery, " +
    "content parsing, formatting, and styling to produce publication-ready documents that meet PMBOK standards.",
    Word.InsertLocation.end
  );
  summary.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  // Key benefits
  const benefitsHeader = context.document.body.insertParagraph(
    "Key Benefits:", 
    Word.InsertLocation.end
  );
  benefitsHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  const benefits = [
    "⚡ Instant conversion from markdown to professional Word documents",
    "🎯 Consistent PMBOK-style formatting across all documents",
    "📁 Automatic document discovery and categorization",
    "🔄 Batch processing capabilities for multiple documents",
    "📊 Advanced table conversion and formatting",
    "🔧 Customizable conversion options and styling",
    "✅ Integration with existing requirements gathering workflow",
  ];
  
  benefits.forEach((benefit) => {
    const benefitPara = context.document.body.insertParagraph(benefit, Word.InsertLocation.end);
    benefitPara.styleBuiltIn = Word.BuiltInStyleName.normal;
    benefitPara.leftIndent = 15;
  });
  
  // Next steps
  const nextStepsHeader = context.document.body.insertParagraph(
    "Next Steps:", 
    Word.InsertLocation.end
  );
  nextStepsHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  const nextSteps = context.document.body.insertParagraph(
    "1. Try the conversion features with your own generated documents\n" +
    "2. Customize formatting options to match your organization's standards\n" +
    "3. Integrate with your existing document management workflow\n" +
    "4. Explore advanced features like batch conversion and automation",
    Word.InsertLocation.end
  );
  nextSteps.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  // Final note
  const finalNote = context.document.body.insertParagraph(
    "Thank you for exploring the ADPA Markdown-to-Word integration capabilities!", 
    Word.InsertLocation.end
  );
  finalNote.styleBuiltIn = Word.BuiltInStyleName.heading2;
  finalNote.alignment = Word.Alignment.centered;
  finalNote.font.color = "#2E86AB";
}

/**
 * Quick demo function for testing individual features
 */
async function quickFeatureDemo(event: Office.AddinCommands.Event) {
  try {
    await Word.run(async (context) => {
      context.document.body.clear();
      
      const title = context.document.body.insertParagraph(
        "ADPA Quick Feature Demo", 
        Word.InsertLocation.end
      );
      title.styleBuiltIn = Word.BuiltInStyleName.title;
      title.alignment = Word.Alignment.centered;
      
      // Show a simple conversion example
      const integrationManager = new DocumentIntegrationManager(new MockDocumentReader());
      
      // Simulate converting a document
      const status = context.document.body.insertParagraph(
        "✅ Converting project-charter.md...\n" +
        "✅ Applying PMBOK formatting...\n" +
        "✅ Generating table of contents...\n" +
        "✅ Document ready!", 
        Word.InsertLocation.end
      );
      status.font.color = "#228B22";
      
      await context.sync();
    });
    
    event.completed();
  } catch (error) {
    console.error("Error in quick demo:", error);
    event.completed();
  }
}

// Export functions for ribbon integration
export { runPresentationDemo, quickFeatureDemo };
