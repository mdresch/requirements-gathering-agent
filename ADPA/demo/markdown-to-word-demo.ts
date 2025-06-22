/*
 * ADPA Markdown-to-Word Integration Demo
 * This file demonstrates how the system picks up markdown files and converts them to Word documents
 */

/* global Office Word console */

// This demo shows the complete workflow from markdown files to Word documents
export async function demonstrateMarkdownToWordWorkflow(event: Office.AddinCommands.Event) {
  try {
    await Word.run(async (context) => {
      // Clear the document first
      context.document.body.clear();

      // Add demo title
      const title = context.document.body.insertParagraph(
        "ADPA Markdown-to-Word Integration Demo",
        Word.InsertLocation.end
      );
      title.styleBuiltIn = Word.BuiltInStyleName.title;
      title.alignment = Word.Alignment.centered;

      await context.sync();

      // Step 1: Show how we discover markdown files
      await demonstrateFileDiscovery(context);
      
      // Step 2: Show how we parse markdown content
      await demonstrateMarkdownParsing(context);
      
      // Step 3: Show how we convert to Word
      await demonstrateWordConversion(context);
      
      // Step 4: Show the final result
      await demonstrateFinalResult(context);

      await context.sync();
    });
  } catch (error) {
    console.error("Demo error:", error);
  }
  
  event.completed();
}

async function demonstrateFileDiscovery(context: Word.RequestContext) {
  // Add section header
  const header = context.document.body.insertParagraph("Step 1: File Discovery Process", Word.InsertLocation.end);
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  const explanation = context.document.body.insertParagraph(
    "The ADPA system automatically scans the generated-documents folder and discovers markdown files organized by category:",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;

  // Create a table showing the file structure
  const fileTable = context.document.body.insertTable(7, 3, Word.InsertLocation.end);
  
  // Headers
  fileTable.getCell(0, 0).value = "Category";
  fileTable.getCell(0, 1).value = "File Path";
  fileTable.getCell(0, 2).value = "Description";
  
  // Sample data
  fileTable.getCell(1, 0).value = "project-charter";
  fileTable.getCell(1, 1).value = "generated-documents/project-charter/project-charter.md";
  fileTable.getCell(1, 2).value = "PMBOK Project Charter";
  
  fileTable.getCell(2, 0).value = "planning";
  fileTable.getCell(2, 1).value = "generated-documents/planning/work-breakdown-structure.md";
  fileTable.getCell(2, 2).value = "WBS Document";
  
  fileTable.getCell(3, 0).value = "requirements";
  fileTable.getCell(3, 1).value = "generated-documents/requirements/requirements-specification.md";
  fileTable.getCell(3, 2).value = "Requirements Document";
  
  fileTable.getCell(4, 0).value = "risk-management";
  fileTable.getCell(4, 1).value = "generated-documents/risk-management/risk-register.md";
  fileTable.getCell(4, 2).value = "Risk Management Plan";
  
  fileTable.getCell(5, 0).value = "technical-design";
  fileTable.getCell(5, 1).value = "generated-documents/technical-design/architecture.md";
  fileTable.getCell(5, 2).value = "Technical Architecture";
  
  fileTable.getCell(6, 0).value = "quality-assurance";
  fileTable.getCell(6, 1).value = "generated-documents/quality-assurance/qa-plan.md";
  fileTable.getCell(6, 2).value = "QA Plan";
  // Style the table
  fileTable.styleBuiltIn = Word.BuiltInStyleName.gridTable4_Accent1;
}

async function demonstrateMarkdownParsing(context: Word.RequestContext) {
  // Add page break
  context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
  
  const header = context.document.body.insertParagraph("Step 2: Markdown Parsing Process", Word.InsertLocation.end);
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  const explanation = context.document.body.insertParagraph(
    "When a markdown file is selected, the system parses its structure and extracts key components:",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;

  // Show sample markdown content
  const sampleHeader = context.document.body.insertParagraph("Sample Markdown Content:", Word.InsertLocation.end);
  sampleHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  const markdownSample = context.document.body.insertParagraph(
    `# Project Charter - ADPA: Automated Documentation Project Assistant

**Charter Date:** June 19, 2025
**Project Manager:** [TO BE ASSIGNED]
**Executive Sponsor:** [EXECUTIVE SPONSOR NAME]

## 1. Executive Summary

This Project Charter authorizes the initiation of the ADPA project...

## 2. Project Objectives and Success Criteria

**Primary Objectives:**

1. Develop and deploy a fully functional AI-powered documentation assistant
2. Achieve a 20% reduction in documentation time
3. Enhance the quality and consistency of project documentation

| KPI | Target | Measurement |
|-----|--------|-------------|
| Documentation Time | 20% reduction | Time tracking |
| User Satisfaction | 4.5/5 | Survey |
| Document Quality | 90% accuracy | Review process |`,
    Word.InsertLocation.end
  );
  markdownSample.font.name = "Courier New";
  markdownSample.font.size = 10;

  // Show parsing results
  const parseHeader = context.document.body.insertParagraph("Parsing Results:", Word.InsertLocation.end);
  parseHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  
  const parseTable = context.document.body.insertTable(6, 2, Word.InsertLocation.end);
  
  parseTable.getCell(0, 0).value = "Component";
  parseTable.getCell(0, 1).value = "Extracted Data";
  
  parseTable.getCell(1, 0).value = "Title";
  parseTable.getCell(1, 1).value = "Project Charter - ADPA: Automated Documentation Project Assistant";
  
  parseTable.getCell(2, 0).value = "Headers Found";
  parseTable.getCell(2, 1).value = "H1: Project Charter, H2: Executive Summary, H2: Project Objectives";
  
  parseTable.getCell(3, 0).value = "Tables Found";
  parseTable.getCell(3, 1).value = "KPI table with 3 rows, 3 columns";
  
  parseTable.getCell(4, 0).value = "Metadata";
  parseTable.getCell(4, 1).value = "Date: June 19, 2025; Category: project-charter";
  
  parseTable.getCell(5, 0).value = "Formatting";
  parseTable.getCell(5, 1).value = "Bold text, numbered lists, bullet points identified";

  parseTable.styleBuiltIn = Word.BuiltInStyleName.gridTable4_Accent2;
}

async function demonstrateWordConversion(context: Word.RequestContext) {
  // Add page break
  context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
  
  const header = context.document.body.insertParagraph("Step 3: Word Document Generation", Word.InsertLocation.end);
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  const explanation = context.document.body.insertParagraph(
    "The parsed markdown content is then converted into a professionally formatted Word document with:",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;
  // List conversion features
  const featuresList = [
    "PMBOK-compliant title page with metadata",
    "Automatically generated Table of Contents",
    "Proper heading hierarchy (H1, H2, H3, etc.)",
    "Formatted tables with professional styling",
    "Consistent fonts and spacing",
    "Page breaks and section organization",
    "Cross-references and navigation",
  ];

  featuresList.forEach((feature) => {
    const bullet = context.document.body.insertParagraph(`• ${feature}`, Word.InsertLocation.end);
    bullet.styleBuiltIn = Word.BuiltInStyleName.listParagraph;
  });

  // Show conversion process
  const processHeader = context.document.body.insertParagraph("Conversion Process Flow:", Word.InsertLocation.end);
  processHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  const processSteps = [
    "1. Parse markdown frontmatter for document metadata",
    "2. Extract and structure heading hierarchy",
    "3. Convert markdown tables to Word tables",
    "4. Apply PMBOK formatting standards",
    "5. Generate title page with project information",
    "6. Create Table of Contents with page numbers",
    "7. Insert content with proper styling",
    "8. Add page breaks and section dividers",
  ];

  processSteps.forEach((step) => {
    const stepPara = context.document.body.insertParagraph(step, Word.InsertLocation.end);
    stepPara.styleBuiltIn = Word.BuiltInStyleName.normal;
    stepPara.leftIndent = 20;
  });
}

async function demonstrateFinalResult(context: Word.RequestContext) {
  // Add page break
  context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
  
  const header = context.document.body.insertParagraph("Step 4: Final Word Document", Word.InsertLocation.end);
  header.styleBuiltIn = Word.BuiltInStyleName.heading1;
  
  const explanation = context.document.body.insertParagraph(
    "Here's a sample of what the final Word document looks like:",
    Word.InsertLocation.end
  );
  explanation.styleBuiltIn = Word.BuiltInStyleName.normal;

  // Create a sample title page
  const titlePageHeader = context.document.body.insertParagraph("Sample Title Page:", Word.InsertLocation.end);
  titlePageHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;

  // Simulate a title page
  const docTitle = context.document.body.insertParagraph("Project Charter", Word.InsertLocation.end);
  docTitle.styleBuiltIn = Word.BuiltInStyleName.title;
  docTitle.alignment = Word.Alignment.centered;

  const projectName = context.document.body.insertParagraph(
    "ADPA: Automated Documentation Project Assistant",
    Word.InsertLocation.end
  );
  projectName.styleBuiltIn = Word.BuiltInStyleName.subtitle;
  projectName.alignment = Word.Alignment.centered;

  // Add metadata table
  const metaTable = context.document.body.insertTable(5, 2, Word.InsertLocation.end);
  metaTable.getCell(0, 0).value = "Document Type:";
  metaTable.getCell(0, 1).value = "Project Charter";
  metaTable.getCell(1, 0).value = "Project:";
  metaTable.getCell(1, 1).value = "ADPA";
  metaTable.getCell(2, 0).value = "Date:";
  metaTable.getCell(2, 1).value = "June 19, 2025";
  metaTable.getCell(3, 0).value = "Version:";
  metaTable.getCell(3, 1).value = "1.0";
  metaTable.getCell(4, 0).value = "Generated by:";
  metaTable.getCell(4, 1).value = "ADPA v4.2.3";

  // Sample content
  const contentHeader = context.document.body.insertParagraph("Sample Content:", Word.InsertLocation.end);
  contentHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;

  const h1Sample = context.document.body.insertParagraph("1. Executive Summary", Word.InsertLocation.end);
  h1Sample.styleBuiltIn = Word.BuiltInStyleName.heading1;
  const contentSample = context.document.body.insertParagraph(
    "This Project Charter authorizes the initiation of the ADPA (Automated Documentation Project Assistant) project. " +
      "ADPA represents a revolutionary breakthrough in AI-powered document generation, achieving unprecedented capabilities " +
      "in contextual reasoning and hierarchical authority recognition.",
    Word.InsertLocation.end
  );
  contentSample.styleBuiltIn = Word.BuiltInStyleName.normal;

  const h2Sample = context.document.body.insertParagraph("1.1 Project Objectives", Word.InsertLocation.end);
  h2Sample.styleBuiltIn = Word.BuiltInStyleName.heading2;

  // Sample table
  const sampleTable = context.document.body.insertTable(4, 3, Word.InsertLocation.end);
  sampleTable.getCell(0, 0).value = "KPI";
  sampleTable.getCell(0, 1).value = "Target";
  sampleTable.getCell(0, 2).value = "Measurement";
  sampleTable.getCell(1, 0).value = "Documentation Time";
  sampleTable.getCell(1, 1).value = "20% reduction";
  sampleTable.getCell(1, 2).value = "Time tracking";
  sampleTable.getCell(2, 0).value = "User Satisfaction";
  sampleTable.getCell(2, 1).value = "4.5/5";
  sampleTable.getCell(2, 2).value = "Survey";
  sampleTable.getCell(3, 0).value = "Document Quality";
  sampleTable.getCell(3, 1).value = "90% accuracy";
  sampleTable.getCell(3, 2).value = "Review process";
  
  sampleTable.styleBuiltIn = Word.BuiltInStyleName.gridTable4_Accent1;

  // Usage instructions
  const usageHeader = context.document.body.insertParagraph("How to Use This Feature:", Word.InsertLocation.end);
  usageHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;
  const instructions = [
    "1. Click 'Convert Project Charter' button in the ADPA ribbon",
    "2. Select a markdown file from the generated-documents folder",
    "3. Choose conversion options (title page, TOC, formatting)",
    "4. Click 'Convert' and watch the document generate automatically",
    "5. Review and edit the generated content as needed",
    "6. Save the document with proper naming convention",
  ];

  instructions.forEach((instruction) => {
    const instrPara = context.document.body.insertParagraph(instruction, Word.InsertLocation.end);
    instrPara.styleBuiltIn = Word.BuiltInStyleName.normal;
  });
}

// Export the demo functions for use in the ribbon
export async function demoConvertProjectCharter(event: Office.AddinCommands.Event) {
  await demonstrateMarkdownToWordWorkflow(event);
}
