/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global Office Word console */

/**
 * Simple Working Demo - ADPA Markdown-to-Word Integration
 * 
 * This file contains working demonstration functions that can be called
 * from Word ribbon buttons to show the markdown-to-Word conversion in action.
 */

/**
 * Demonstrates the complete conversion workflow with live examples
 */
export async function demonstrateConversionWorkflow(event: Office.AddinCommands.Event) {
  try {
    await Word.run(async (context) => {
      // Clear document
      context.document.body.clear();
      
      // Create demonstration title
      const title = context.document.body.insertParagraph("ADPA Markdown-to-Word Demonstration", Word.InsertLocation.end);
      title.styleBuiltIn = Word.BuiltInStyleName.title;
      title.alignment = Word.Alignment.centered;
      
      // Add subtitle
      const subtitle = context.document.body.insertParagraph("Live Conversion Example", Word.InsertLocation.end);
      subtitle.styleBuiltIn = Word.BuiltInStyleName.subtitle;
      subtitle.alignment = Word.Alignment.centered;
      
      // Show the process
      await showDocumentDiscovery(context);
      await showConversionExample(context);
      await showFormattingCapabilities(context);
      await showBatchProcessingDemo(context);
      
      await context.sync();
    });
    
    event.completed();
  } catch (error) {
    console.error("Error in demonstration:", error);
    event.completed();
  }
}

/**
 * Show document discovery process
 */
async function showDocumentDiscovery(context: Word.RequestContext) {
  // Section header
  const header = context.document.body.insertParagraph("1. Document Discovery Process", Word.InsertLocation.end);
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  // Explanation
  const explanation = context.document.body.insertParagraph(
    "ADPA scans the generated-documents folder and automatically categorizes markdown files:",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  // Show discovered documents
  const categories = [
    {
      name: "📁 Project Charter",
      docs: ["Project Charter: ADPA System"]
    },
    {
      name: "📁 Planning Documents", 
      docs: ["Work Breakdown Structure", "Project Management Plan", "Risk Management Plan"]
    },
    {
      name: "📁 Requirements",
      docs: ["Business Requirements", "Functional Requirements", "System Requirements"]
    }
  ];
  
  categories.forEach(category => {
    const categoryPara = context.document.body.insertParagraph(category.name, Word.InsertLocation.end);
    categoryPara.styleBuiltIn = Word.BuiltInStyleName.heading3;
    categoryPara.font.color = "#2E86AB";
    
    category.docs.forEach(doc => {
      const docPara = context.document.body.insertParagraph(`   • ${doc}`, Word.InsertLocation.end);
      docPara.styleBuiltIn = Word.BuiltInStyleName.normal;
      docPara.leftIndent = 20;
    });
  });
  
  context.document.body.insertParagraph("", Word.InsertLocation.end);
}

/**
 * Show conversion example
 */
async function showConversionExample(context: Word.RequestContext) {
  const header = context.document.body.insertParagraph("2. Document Conversion Example", Word.InsertLocation.end);
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  // Before section
  const beforeHeader = context.document.body.insertParagraph("Before: Raw Markdown", Word.InsertLocation.end);
  beforeHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  beforeHeader.font.color = "#D2691E";
  
  const rawMarkdown = context.document.body.insertParagraph(
    `---
title: "Project Charter"
category: "project-charter"
author: "ADPA System"
---

# Project Charter: ADPA

## Executive Summary
This document authorizes the ADPA project...

## Objectives
| Goal | Metric | Timeline |
|------|--------|----------|
| Automate Docs | 95% accuracy | Q2 2025 |`,
    Word.InsertLocation.end
  );
  rawMarkdown.font.name = "Courier New";
  rawMarkdown.font.size = 10;
  
  // After section
  const afterHeader = context.document.body.insertParagraph("After: Professional Word Document", Word.InsertLocation.end);
  afterHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  afterHeader.font.color = "#228B22";
  
  // Simulate converted output
  const convertedTitle = context.document.body.insertParagraph("PROJECT CHARTER: ADPA", Word.InsertLocation.end);
  convertedTitle.styleBuiltIn = Word.BuiltInStyleName.title;
  convertedTitle.alignment = Word.Alignment.centered;
  
  const h1 = context.document.body.insertParagraph("1. Executive Summary", Word.InsertLocation.end);
  h1.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  const content = context.document.body.insertParagraph("This document authorizes the ADPA project...", Word.InsertLocation.end);
  content.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  context.document.body.insertParagraph("", Word.InsertLocation.end);
}

/**
 * Show formatting capabilities
 */
async function showFormattingCapabilities(context: Word.RequestContext) {
  const header = context.document.body.insertParagraph("3. Professional Formatting Features", Word.InsertLocation.end);
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  // Create a sample table
  const tableHeader = context.document.body.insertParagraph("Sample Converted Table:", Word.InsertLocation.end);
  tableHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  const table = context.document.body.insertTable(4, 3, Word.InsertLocation.end);
  
  // Headers
  table.getCell(0, 0).value = "Phase";
  table.getCell(0, 1).value = "Duration";  
  table.getCell(0, 2).value = "Resources";
  
  // Data
  table.getCell(1, 0).value = "Planning";
  table.getCell(1, 1).value = "2 weeks";
  table.getCell(1, 2).value = "PM, BA";
  
  table.getCell(2, 0).value = "Development";
  table.getCell(2, 1).value = "12 weeks";
  table.getCell(2, 2).value = "Dev Team";
  
  table.getCell(3, 0).value = "Testing";
  table.getCell(3, 1).value = "4 weeks";
  table.getCell(3, 2).value = "QA Team";
  
  // Format headers
  for (let i = 0; i < 3; i++) {
    const cell = table.getCell(0, i);
    cell.body.font.bold = true;
    cell.body.font.color = "#FFFFFF";
  }
  
  // Features list
  const featuresHeader = context.document.body.insertParagraph("Automatic Features Applied:", Word.InsertLocation.end);
  featuresHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  const features = [
    "✅ Professional title pages with metadata",
    "✅ Auto-generated table of contents",
    "✅ Consistent heading hierarchy",
    "✅ Formatted tables with styling",
    "✅ PMBOK-compliant formatting",
    "✅ Cross-references and navigation"
  ];
  
  features.forEach(feature => {
    const featurePara = context.document.body.insertParagraph(feature, Word.InsertLocation.end);
    featurePara.styleBuiltIn = Word.BuiltInStyleName.normal;
    featurePara.leftIndent = 10;
  });
  
  context.document.body.insertParagraph("", Word.InsertLocation.end);
}

/**
 * Show batch processing capabilities
 */
async function showBatchProcessingDemo(context: Word.RequestContext) {
  const header = context.document.body.insertParagraph("4. Batch Processing Demonstration", Word.InsertLocation.end);
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  const explanation = context.document.body.insertParagraph(
    "Convert multiple documents simultaneously with progress tracking:",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;
  
  const processSteps = [
    "🔍 Scanning generated-documents folder...",
    "📁 Found 6 documents in 'planning' category",
    "📄 Converting project-charter.md ✓ (1/6)",
    "📄 Converting work-breakdown-structure.md ✓ (2/6)",
    "📄 Converting project-plan.md ✓ (3/6)",
    "📊 Progress: 50% complete...",
    "📄 Converting risk-management-plan.md ✓ (4/6)",
    "📄 Converting communication-plan.md ✓ (5/6)",
    "📄 Converting quality-plan.md ✓ (6/6)",
    "✅ Batch conversion completed!",
    "📈 Result: 6 documents converted in 1.8 seconds"
  ];
  
  processSteps.forEach(step => {
    const stepPara = context.document.body.insertParagraph(step, Word.InsertLocation.end);
    stepPara.styleBuiltIn = Word.BuiltInStyleName.normal;
    stepPara.leftIndent = 10;
    
    if (step.includes("✓")) {
      stepPara.font.color = "#228B22";
    } else if (step.includes("Progress:")) {
      stepPara.font.color = "#FF8C00";
    } else if (step.includes("Result:")) {
      stepPara.font.color = "#2E86AB";
    }
  });
  
  // Add conclusion
  const conclusion = context.document.body.insertParagraph("Ready to transform your documentation workflow!", Word.InsertLocation.end);
  conclusion.styleBuiltIn = Word.BuiltInStyleName.heading2;
  conclusion.alignment = Word.Alignment.centered;
  conclusion.font.color = "#2E86AB";
}

/**
 * Quick demo showing just the conversion result
 */
export async function quickConversionDemo(event: Office.AddinCommands.Event) {
  try {
    await Word.run(async (context) => {
      context.document.body.clear();
      
      const title = context.document.body.insertParagraph("ADPA Conversion Result", Word.InsertLocation.end);
      title.styleBuiltIn = Word.BuiltInStyleName.title;
      title.alignment = Word.Alignment.centered;
      
      const status = context.document.body.insertParagraph(
        "✅ project-charter.md → Professional Word Document\n" +
        "✅ Applied PMBOK formatting\n" +
        "✅ Generated table of contents\n" +
        "✅ Created title page\n" +
        "✅ Converted 3 tables\n" +
        "✅ Ready for distribution!",
        Word.InsertLocation.end
      );
      status.font.color = "#228B22";
      status.font.size = 14;
      
      await context.sync();
    });
    
    event.completed();
  } catch (error) {
    console.error("Error in quick demo:", error);
    event.completed();
  }
}
