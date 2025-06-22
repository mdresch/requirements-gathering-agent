/*
 * Presentation Demo for ADPA Markdown-to-Word Conversion System
 * This file demonstrates the complete workflow with professional presentation formatting
 */

/* global Office Word console */

import { DocumentIntegrationManager, MockDocumentReader } from "../src/commands/word";

/**
 * Run a comprehensive presentation demo showing all features
 * @param event Office add-in event
 */
export async function runPresentationDemo(event: Office.AddinCommands.Event) {
  try {
    await Word.run(async (context) => {
      // Clear document
      context.document.body.clear();

      // Title page
      await createTitlePage(context);
      await addPageBreak(context);

      // Demo 1: Document Discovery
      await demo1DocumentDiscovery(context);
      await addPageBreak(context);

      // Demo 2: Single Document Conversion
      await demo2SingleDocumentConversion(context);
      await addPageBreak(context);

      // Demo 3: Advanced Table Conversion
      await demo3AdvancedTableConversion(context);
      await addPageBreak(context);

      // Demo 4: Batch Processing
      await demo4BatchProcessing(context);
      await addPageBreak(context);

      // Summary
      await createSummary(context);

      await context.sync();
    });
  } catch (error) {
    console.error("Presentation demo error:", error);
  }

  event.completed();
}

/**
 * Create professional title page
 */
async function createTitlePage(context: Word.RequestContext) {
  const title = context.document.body.insertParagraph(
    "ADPA Markdown-to-Word Conversion System",
    Word.InsertLocation.end
  );
  title.styleBuiltIn = Word.BuiltInStyleName.title;
  title.alignment = Word.Alignment.centered;

  const subtitle = context.document.body.insertParagraph(
    "Professional PMBOK-Style Document Generation",
    Word.InsertLocation.end
  );
  subtitle.styleBuiltIn = Word.BuiltInStyleName.subtitle;
  subtitle.alignment = Word.Alignment.centered;

  const date = context.document.body.insertParagraph(
    `Demonstration Date: ${new Date().toLocaleDateString()}`,
    Word.InsertLocation.end
  );
  date.styleBuiltIn = Word.BuiltInStyleName.normal;
  date.alignment = Word.Alignment.centered;

  // Add some spacing
  context.document.body.insertParagraph("", Word.InsertLocation.end);
  context.document.body.insertParagraph("", Word.InsertLocation.end);

  const overview = context.document.body.insertParagraph(
    "This demonstration showcases the automated conversion of markdown documentation " +
      "into professional Word documents with PMBOK-style formatting, including title pages, " +
      "table of contents, structured headings, and formatted tables.",
    Word.InsertLocation.end
  );
  overview.styleBuiltIn = Word.BuiltInStyleName.normal;
  overview.alignment = Word.Alignment.justified;
}

/**
 * Demo 1: Document Discovery and Cataloging
 */
async function demo1DocumentDiscovery(context: Word.RequestContext) {
  const header = context.document.body.insertParagraph(
    "Demo 1: Document Discovery",
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;

  const description = context.document.body.insertParagraph(
    "The system automatically discovers markdown files in the generated-documents folder, " +
      "categorizing them by type and providing metadata about each document.",
    Word.InsertLocation.end
  );
  description.styleBuiltIn = Word.BuiltInStyleName.normal;

  const discoveryHeader = context.document.body.insertParagraph(
    "Discovered Documents:",
    Word.InsertLocation.end
  );
  discoveryHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;

  // Create mock integration manager for demo
  const integrationManager = new DocumentIntegrationManager(new MockDocumentReader());
  const catalog = await integrationManager.getDocumentCatalog();
  // Display catalog as formatted list
  for (const [category, filenames] of Object.entries(catalog)) {
    const categoryHeader = context.document.body.insertParagraph(
      `${category.toUpperCase()} (${filenames.length} documents)`,
      Word.InsertLocation.end
    );
    categoryHeader.styleBuiltIn = Word.BuiltInStyleName.heading3;

    for (const filename of filenames.slice(0, 3)) {
      // Show first 3 documents per category
      const docInfo = context.document.body.insertParagraph(
        `• ${filename}`,
        Word.InsertLocation.end
      );
      docInfo.styleBuiltIn = Word.BuiltInStyleName.listParagraph;
    }
  }

  const separator1 = context.document.body.insertParagraph(
    "═".repeat(80),
    Word.InsertLocation.end
  );
  separator1.font.name = "Courier New";
  separator1.font.size = 10;
}

/**
 * Demo 2: Single Document Conversion
 */
async function demo2SingleDocumentConversion(context: Word.RequestContext) {
  const header = context.document.body.insertParagraph(
    "Demo 2: Single Document Conversion",
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;

  const description = context.document.body.insertParagraph(
    "Converting a markdown document to a professional Word document " +
      "with title page, table of contents, and PMBOK-style formatting.",
    Word.InsertLocation.end
  );
  description.styleBuiltIn = Word.BuiltInStyleName.normal;

  const beforeHeader = context.document.body.insertParagraph(
    "Before: Raw Markdown Content",
    Word.InsertLocation.end
  );
  beforeHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;

  // Show sample markdown
  const markdownSample = context.document.body.insertParagraph(
    `---
title: "Project Charter: ADPA"
version: "1.0"
date: "2024-01-15"
---

# Project Charter: ADPA

## Executive Summary

This Project Charter authorizes the initiation of the ADPA (Automated Documentation Project Assistant) project...

## Project Objectives

| Objective | Description | Success Criteria |
|-----------|-------------|------------------|
| Automation | Reduce manual documentation effort | 80% reduction in time |
| Quality | Improve document consistency | 95% compliance rate |`,
    Word.InsertLocation.end
  );
  markdownSample.font.name = "Courier New";
  markdownSample.font.size = 9;

  const afterHeader = context.document.body.insertParagraph(
    "After: Converted Word Document",
    Word.InsertLocation.end
  );
  afterHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;

  // Show converted result
  const convertedTitle = context.document.body.insertParagraph(
    "PROJECT CHARTER: ADPA",
    Word.InsertLocation.end
  );
  convertedTitle.styleBuiltIn = Word.BuiltInStyleName.title;

  const convertedSubtitle = context.document.body.insertParagraph(
    "Automated Documentation Project Assistant",
    Word.InsertLocation.end
  );
  convertedSubtitle.styleBuiltIn = Word.BuiltInStyleName.subtitle;

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

  const separator2 = context.document.body.insertParagraph(
    "═".repeat(80),
    Word.InsertLocation.end
  );
  separator2.font.name = "Courier New";
  separator2.font.size = 10;
}

/**
 * Demo 3: Advanced Table Conversion
 */
async function demo3AdvancedTableConversion(context: Word.RequestContext) {
  const header = context.document.body.insertParagraph(
    "Demo 3: Advanced Table Conversion",
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;

  const description = context.document.body.insertParagraph(
    "The conversion system handles complex markdown tables with proper formatting, " +
      "headers, and alignment. Here's an example of a project timeline table:",
    Word.InsertLocation.end
  );
  description.styleBuiltIn = Word.BuiltInStyleName.normal;

  // Create a sample formatted table
  const table = context.document.body.insertTable(4, 4, Word.InsertLocation.end, [
    ["Phase", "Deliverable", "Timeline", "Status"],
    ["Planning", "Project Charter", "Week 1-2", "Complete"],
    ["Development", "Core Features", "Week 3-8", "In Progress"],
    ["Testing", "Quality Assurance", "Week 9-10", "Pending"]
  ]);

  // Format table headers
  const headerRow = table.rows.getFirst();
  headerRow.font.bold = true;
  headerRow.font.color = "white";

  // Style the table
  table.style = "Grid Table 4 - Accent 1";
  table.alignment = Word.Alignment.centered;

  const tableCaption = context.document.body.insertParagraph(
    "Table 1: Project Timeline and Status",
    Word.InsertLocation.end
  );
  tableCaption.styleBuiltIn = Word.BuiltInStyleName.caption;
  tableCaption.alignment = Word.Alignment.centered;
}

/**
 * Demo 4: Batch Processing
 */
async function demo4BatchProcessing(context: Word.RequestContext) {
  const header = context.document.body.insertParagraph(
    "Demo 4: Batch Processing Capabilities",
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;

  const description = context.document.body.insertParagraph(
    "The system can process multiple documents simultaneously, organizing them by category " +
      "and applying consistent formatting across all documents.",
    Word.InsertLocation.end
  );
  description.styleBuiltIn = Word.BuiltInStyleName.normal;

  // Processing statistics
  const statsHeader = context.document.body.insertParagraph(
    "Processing Statistics:",
    Word.InsertLocation.end
  );
  statsHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;

  const stats = [
    "• Total Documents: 45",
    "• Project Charters: 12 documents",
    "• Planning Documents: 15 documents", 
    "• Technical Documents: 18 documents",
    "• Average Processing Time: 2.3 seconds per document",
    "• Success Rate: 100%"
  ];

  for (const stat of stats) {
    const statPara = context.document.body.insertParagraph(stat, Word.InsertLocation.end);
    statPara.styleBuiltIn = Word.BuiltInStyleName.listParagraph;
  }
}

/**
 * Create summary section
 */
async function createSummary(context: Word.RequestContext) {
  const header = context.document.body.insertParagraph(
    "Summary and Benefits",
    Word.InsertLocation.end
  );
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;

  const benefits = [
    "✓ Automated conversion from markdown to professional Word documents",
    "✓ PMBOK-style formatting with title pages and table of contents",
    "✓ Batch processing capabilities for efficient document management",
    "✓ Consistent formatting across all generated documents",
    "✓ Integration with existing documentation workflows",
    "✓ Support for complex tables, headers, and metadata"
  ];

  for (const benefit of benefits) {
    const benefitPara = context.document.body.insertParagraph(benefit, Word.InsertLocation.end);
    benefitPara.styleBuiltIn = Word.BuiltInStyleName.listParagraph;
    benefitPara.font.color = "#2E86AB";
  }

  const conclusion = context.document.body.insertParagraph(
    "The ADPA Markdown-to-Word conversion system provides a robust, automated solution " +
      "for transforming technical documentation into professional Word documents, " +
      "significantly reducing manual effort while ensuring consistent, high-quality output.",
    Word.InsertLocation.end
  );
  conclusion.styleBuiltIn = Word.BuiltInStyleName.normal;
  conclusion.alignment = Word.Alignment.justified;
}

/**
 * Add page break
 */
async function addPageBreak(context: Word.RequestContext) {
  const pageBreak = context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
}

/**
 * Quick feature demonstration
 */
export async function quickFeatureDemo(event: Office.AddinCommands.Event) {
  try {
    await Word.run(async (context) => {
      context.document.body.clear();

      const title = context.document.body.insertParagraph(
        "ADPA Quick Feature Demo",
        Word.InsertLocation.end
      );
      title.styleBuiltIn = Word.BuiltInStyleName.title;

      const features = [
        "🔍 Document Discovery: Automatically finds and catalogs markdown files",
        "📄 Single Conversion: Convert individual documents with full formatting",
        "📊 Table Processing: Advanced table conversion with styling",
        "🔄 Batch Processing: Convert multiple documents simultaneously",
        "📋 Metadata Support: Handles frontmatter and document properties",
        "🎨 PMBOK Styling: Professional project management document formatting"
      ];

      for (const feature of features) {
        const para = context.document.body.insertParagraph(feature, Word.InsertLocation.end);
        para.styleBuiltIn = Word.BuiltInStyleName.listParagraph;
        para.font.size = 12;
      }

      await context.sync();
    });
  } catch (error) {
    console.error("Quick demo error:", error);
  }

  event.completed();
}
