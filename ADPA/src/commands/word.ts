/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global Office Word console fetch setTimeout */

// Document generation interfaces
interface DocumentSection {
  title: string;
  content: string;
  level: number; // 1 = H1, 2 = H2, etc.
  includePageBreak?: boolean;
}

interface DocumentMetadata {
  title: string;
  author: string;
  projectName: string;
  version: string;
  date: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

// Markdown parsing interfaces
interface MarkdownFrontmatter {
  [key: string]: any;
}

interface MarkdownSection {
  title: string;
  content: string[];
  level: number;
}

interface MarkdownTable {
  headers: string[];
  rows: string[][];
  caption?: string;
}

interface MarkdownDocument {
  filename: string;
  title: string;
  category: string;
  content: string;
  frontmatter: MarkdownFrontmatter;
  sections: MarkdownSection[];
  tables: MarkdownTable[];
}

// Integration interfaces for generated-documents
// Note: These types are defined but not actively used in current implementation
// They remain for future integration enhancements

interface ConversionOptions {
  includeTableOfContents?: boolean;
  includeTitlePage?: boolean;
  applyPMBOKFormatting?: boolean;
  preserveMarkdownStructure?: boolean;
}

/**
 * Insert a blue paragraph in word when the add-in command is executed.
 * @param event
 */
export async function insertBlueParagraphInWord(event: Office.AddinCommands.Event) {
  try {
    await Word.run(async (context) => {
      const paragraph = context.document.body.insertParagraph("Hello World", Word.InsertLocation.end);
      paragraph.font.color = "blue";
      await context.sync();
    });
  } catch (error) {
    // Note: In a production add-in, notify the user through your add-in's UI.
    console.error(error);
  }

  // Be sure to indicate when the add-in command function is complete
  event.completed();
}

/**
 * Generate a complete PMBOK-style document with proper formatting
 * @param event
 * @param documentData - The document content and metadata
 */
export async function generatePMBOKDocument(
  event: Office.AddinCommands.Event,
  documentData: {
    metadata: DocumentMetadata;
    sections: DocumentSection[];
    tables?: { [sectionTitle: string]: TableData };
  }
) {
  try {
    await Word.run(async (context) => {
      // Clear existing content
      context.document.body.clear();

      // Create title page
      await createTitlePage(context, documentData.metadata);

      // Create table of contents placeholder
      await createTableOfContentsPlaceholder(context);

      // Generate sections
      for (const section of documentData.sections) {
        await createSection(context, section);

        // Add table if exists for this section
        if (documentData.tables && documentData.tables[section.title]) {
          await createTable(context, documentData.tables[section.title]);
        }
      }

      // Apply consistent formatting
      await applyDocumentStyles(context);

      await context.sync();
    });
  } catch (error) {
    console.error("Error generating PMBOK document:", error);
  }

  event.completed();
}

/**
 * Create a professional title page
 */
async function createTitlePage(context: Word.RequestContext, metadata: DocumentMetadata) {
  const titleParagraph = context.document.body.insertParagraph(metadata.title, Word.InsertLocation.start);
  titleParagraph.styleBuiltIn = Word.BuiltInStyleName.title;
  titleParagraph.alignment = Word.Alignment.centered;
  context.document.body.insertParagraph("", Word.InsertLocation.end);

  const projectParagraph = context.document.body.insertParagraph(metadata.projectName, Word.InsertLocation.end);
  projectParagraph.styleBuiltIn = Word.BuiltInStyleName.subtitle;
  projectParagraph.alignment = Word.Alignment.centered;

  context.document.body.insertParagraph("", Word.InsertLocation.end);
  context.document.body.insertParagraph("", Word.InsertLocation.end);

  const metadataTable = context.document.body.insertTable(4, 2, Word.InsertLocation.end);

  metadataTable.getCell(0, 0).value = "Author:";
  metadataTable.getCell(0, 1).value = metadata.author;
  metadataTable.getCell(1, 0).value = "Version:";
  metadataTable.getCell(1, 1).value = metadata.version;
  metadataTable.getCell(2, 0).value = "Date:";
  metadataTable.getCell(2, 1).value = metadata.date;
  metadataTable.getCell(3, 0).value = "Project:";
  metadataTable.getCell(3, 1).value = metadata.projectName;

  metadataTable.alignment = Word.Alignment.centered;
  metadataTable.styleBuiltIn = Word.BuiltInStyleName.gridTable1Light;

  // Page break after title page
  context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
}

/**
 * Create table of contents placeholder
 */
async function createTableOfContentsPlaceholder(context: Word.RequestContext) {
  const tocTitle = context.document.body.insertParagraph("Table of Contents", Word.InsertLocation.end);
  tocTitle.styleBuiltIn = Word.BuiltInStyleName.heading1;

  const tocPlaceholder = context.document.body.insertParagraph(
    "[Table of Contents will be generated here]",
    Word.InsertLocation.end
  );
  tocPlaceholder.font.italic = true;
  tocPlaceholder.font.color = "#808080";

  // Page break after TOC
  context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
}

/**
 * Create a document section
 */
async function createSection(context: Word.RequestContext, section: DocumentSection) {
  if (section.includePageBreak) {
    context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
  }

  const heading = context.document.body.insertParagraph(section.title, Word.InsertLocation.end);

  switch (section.level) {
    case 1:
      heading.styleBuiltIn = Word.BuiltInStyleName.heading1;
      break;
    case 2:
      heading.styleBuiltIn = Word.BuiltInStyleName.heading2;
      break;
    case 3:
      heading.styleBuiltIn = Word.BuiltInStyleName.heading3;
      break;
    default:
      heading.styleBuiltIn = Word.BuiltInStyleName.heading4;
  }

  const contentParagraph = context.document.body.insertParagraph(section.content, Word.InsertLocation.end);
  contentParagraph.styleBuiltIn = Word.BuiltInStyleName.normal;

  // Add some spacing
  context.document.body.insertParagraph("", Word.InsertLocation.end);
}

/**
 * Create a table
 */
async function createTable(context: Word.RequestContext, tableData: TableData) {
  if (tableData.headers.length === 0 || tableData.rows.length === 0) return;

  const table = context.document.body.insertTable(
    tableData.rows.length + 1,
    tableData.headers.length,
    Word.InsertLocation.end
  );

  // Set header row
  for (let col = 0; col < tableData.headers.length; col++) {
    const cell = table.getCell(0, col);
    cell.value = tableData.headers[col];
    cell.shadingColor = "#4472C4";
  }

  // Set data rows
  for (let row = 0; row < tableData.rows.length; row++) {
    for (let col = 0; col < Math.min(tableData.rows[row].length, tableData.headers.length); col++) {
      const cell = table.getCell(row + 1, col);
      cell.value = tableData.rows[row][col] || "";
    }
  }

  // Style the table
  table.styleBuiltIn = Word.BuiltInStyleName.gridTable4_Accent1;

  // Add space after table
  context.document.body.insertParagraph("", Word.InsertLocation.end);
}

/**
 * Apply consistent document styles
 */
async function applyDocumentStyles(context: Word.RequestContext) {
  // Set document font
  const body = context.document.body;
  body.font.name = "Calibri";
  body.font.size = 11;

  // Set line spacing
  body.paragraphs.load("style");
  await context.sync();

  body.paragraphs.items.forEach((paragraph) => {
    if (paragraph.style === "Normal") {
      paragraph.lineSpacing = 1.15;
      paragraph.spaceAfter = 6;
    }
  });
}

/**
 * Convert markdown file to Word document
 * @param event Office add-in event
 * @param markdownContent Raw markdown content
 * @param documentType Type of document (project-charter, requirements-matrix, etc.)
 */
export async function convertMarkdownToWord(
  event: Office.AddinCommands.Event,
  markdownContent: string,
  documentType: string
) {
  try {
    // Parse markdown content
    const parsedDoc = parseMarkdownDocument(markdownContent);

    await Word.run(async (context) => {
      // Clear existing content
      context.document.body.clear();

      // Apply document type specific template/styling
      await applyDocumentTypeFormatting(context, documentType);

      // Generate title page from frontmatter
      if (parsedDoc.frontmatter && Object.keys(parsedDoc.frontmatter).length > 0) {
        await createTitlePageFromFrontmatter(context, parsedDoc.frontmatter);
      }

      // Convert sections
      for (let i = 0; i < parsedDoc.sections.length; i++) {
        await convertMarkdownSection(context, parsedDoc.sections[i], i === 0);
      }

      // Convert tables
      for (const table of parsedDoc.tables) {
        await convertMarkdownTable(context, table);
      }

      // Apply final document styling
      await applyDocumentStyles(context);
      await context.sync();
    });
  } catch (error) {
    console.error("Error converting markdown to Word:", error);
  }

  event.completed();
}

/**
 * Parse markdown content into structured document
 */
function parseMarkdownDocument(markdown: string): {
  frontmatter: MarkdownFrontmatter;
  sections: MarkdownSection[];
  tables: MarkdownTable[];
} {
  const lines = markdown.split("\n");
  let frontmatter: MarkdownFrontmatter = {};
  const sections: MarkdownSection[] = [];
  const tables: MarkdownTable[] = [];

  let currentSection: MarkdownSection | null = null;
  let inFrontmatter = false;
  let inTable = false;
  let tableData: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse frontmatter (YAML)
    if (line === "---" && i === 0) {
      inFrontmatter = true;
      continue;
    }
    if (line === "---" && inFrontmatter) {
      inFrontmatter = false;
      continue;
    }
    if (inFrontmatter) {
      // Parse YAML frontmatter
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        frontmatter[key.trim()] = valueParts.join(":").trim().replace(/['"]/g, "");
      }
      continue;
    }

    // Parse headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2];
      currentSection = { level, title, content: [] };
      sections.push(currentSection);
      continue;
    }

    // Parse tables
    if (line.includes("|") && !inTable) {
      inTable = true;
      tableData = [];
    }

    if (inTable && line.includes("|")) {
      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell);
      tableData.push(cells);
      continue;
    }

    if (inTable && !line.includes("|")) {
      // End of table
      if (tableData.length > 0) {
        tables.push({
          headers: tableData[0],
          rows: tableData.slice(1).filter((row) => !row.every((cell) => cell.match(/^[-:|\s]*$/))),
        });
      }
      inTable = false;
      tableData = [];
    }

    // Regular content
    if (currentSection && line) {
      currentSection.content.push(line);
    }
  }

  return { frontmatter, sections, tables };
}

/**
 * Apply document type specific formatting
 */
async function applyDocumentTypeFormatting(context: Word.RequestContext, documentType: string) {
  // Document type specific styles and settings
  const typeConfig = {
    "project-charter": {
      headerText: "PROJECT CHARTER",
      footerText: "Confidential - Project Document",
      primaryColor: "#4472C4",
    },
    "requirements-matrix": {
      headerText: "REQUIREMENTS TRACEABILITY MATRIX",
      footerText: "Requirements Documentation",
      primaryColor: "#70AD47",
    },
    "risk-register": {
      headerText: "RISK REGISTER",
      footerText: "Risk Management Document",
      primaryColor: "#E7B547",
    },
  };
  const config = typeConfig[documentType as keyof typeof typeConfig] || typeConfig["project-charter"];
  // Set document properties
  context.document.properties.title = config.headerText;
}

/**
 * Create title page from markdown frontmatter
 */
async function createTitlePageFromFrontmatter(context: Word.RequestContext, frontmatter: MarkdownFrontmatter) {
  const metadata: DocumentMetadata = {
    title: frontmatter.title || "Untitled Document",
    author: frontmatter.author || "Requirements Gathering Agent",
    projectName: frontmatter.project || frontmatter.projectName || "Project",
    version: frontmatter.version || "1.0",
    date: frontmatter.date || new Date().toLocaleDateString(),
  };
  await createTitlePage(context, metadata);
}

/**
 * Convert markdown section to Word
 */
async function convertMarkdownSection(context: Word.RequestContext, section: MarkdownSection, isFirstSection = false) {
  const docSection: DocumentSection = {
    title: section.title,
    content: section.content.join("\n\n"),
    level: section.level,
    includePageBreak: section.level === 1 && !isFirstSection,
  };

  await createSection(context, docSection);
}

/**
 * Convert markdown table to Word
 */
async function convertMarkdownTable(context: Word.RequestContext, table: MarkdownTable) {
  const tableData: TableData = {
    headers: table.headers,
    rows: table.rows,
  };

  if (table.caption) {
    const caption = context.document.body.insertParagraph(table.caption, Word.InsertLocation.end);
    caption.styleBuiltIn = Word.BuiltInStyleName.caption;
  }

  await createTable(context, tableData);
}

/**
 * Batch convert multiple markdown files
 * @param event Office add-in event
 * @param markdownFiles Array of {filename, content, type} objects
 */
export async function batchConvertMarkdownFiles(
  event: Office.AddinCommands.Event,
  markdownFiles: Array<{ filename: string; content: string; type: string }>
) {
  try {
    await Word.run(async (context) => {
      context.document.body.clear();

      for (let i = 0; i < markdownFiles.length; i++) {
        const file = markdownFiles[i];

        // Add document separator for multiple files
        if (i > 0) {
          context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
        }

        // Parse and convert each file
        const parsedDoc = parseMarkdownDocument(file.content);

        // Add file header
        const fileHeader = context.document.body.insertParagraph(`Document: ${file.filename}`, Word.InsertLocation.end);
        fileHeader.styleBuiltIn = Word.BuiltInStyleName.heading1;
        fileHeader.font.color = "#666666";

        // Convert content
        for (const section of parsedDoc.sections) {
          await convertMarkdownSection(context, section);
        }

        for (const table of parsedDoc.tables) {
          await convertMarkdownTable(context, table);
        }
      }

      await applyDocumentStyles(context);
      await context.sync();
    });
  } catch (error) {
    console.error("Error in batch conversion:", error);
  }

  event.completed();
}

// Document categories mapping from generated-documents folder structure
const DOCUMENT_CATEGORIES = {
  "basic-docs": "Basic Documentation",
  "compliance-report": "Compliance Reports",
  "core-analysis": "Core Analysis",
  "implementation-guides": "Implementation Guides",
  "management-plans": "Management Plans",
  planning: "Project Planning",
  "planning-artifacts": "Planning Artifacts",
  pmbok: "PMBOK Processes",
  "project-charter": "Project Charter",
  "quality-assurance": "Quality Assurance",
  requirements: "Requirements",
  "risk-management": "Risk Management",
  "scope-management": "Scope Management",
  "stakeholder-management": "Stakeholder Management",
  "strategic-statements": "Strategic Statements",
  "technical-analysis": "Technical Analysis",
  "technical-design": "Technical Design",
  unknown: "Uncategorized",
} as const;

/**
 * Abstract base class for document readers
 */
export abstract class DocumentReader {
  abstract getDocumentsByCategory(category: string): Promise<MarkdownDocument[]>;
  abstract getDocumentByFilename(filename: string): Promise<MarkdownDocument | null>;
  abstract getAllDocuments(): Promise<MarkdownDocument[]>;
  abstract getAvailableCategories(): Promise<string[]>;
}

/**
 * Mock document reader for development and testing
 */
export class MockDocumentReader extends DocumentReader {
  private mockDocuments: MarkdownDocument[] = [
    {
      filename: "project-charter.md",
      title: "Project Charter - ADPA",
      category: "project-charter",
      content: `# Project Charter - ADPA: Automated Documentation Project Assistant

**Charter Date:** June 19, 2025
**Project Manager:** [TO BE ASSIGNED]
**Executive Sponsor:** [EXECUTIVE SPONSOR NAME]

## 1. Executive Summary

This Project Charter authorizes the initiation of the ADPA (Automated Documentation Project Assistant) project...

## 2. Project Objectives and Success Criteria

**Primary Objectives:**

1. Develop and deploy a fully functional AI-powered documentation assistant
2. Achieve a 20% reduction in documentation time and effort
3. Enhance the quality and consistency of project documentation

## 3. Project Scope and Deliverables

**Major Deliverables:**

| Deliverable | Description | Timeline |
|------------|-------------|----------|
| ADPA Software | Fully functional application | Week 8 |
| Documentation | User guides and technical specs | Week 10 |
| Training | User training materials | Week 12 |

## 4. Budget and Resources

Total approved budget: $250,000
Resource allocation includes development team, infrastructure, and training costs.`,
      frontmatter: {
        title: "Project Charter - ADPA",
        category: "project-charter",
        generated: "2025-06-19T09:49:23.875Z",
        description: "PMBOK Project Charter formally authorizing the project",
      },
      sections: [
        { title: "Executive Summary", content: ["Project authorization and overview..."], level: 2 },
        { title: "Project Objectives and Success Criteria", content: ["Primary objectives and KPIs..."], level: 2 },
        { title: "Project Scope and Deliverables", content: ["Scope boundaries and major deliverables..."], level: 2 },
        { title: "Budget and Resources", content: ["Financial authorization and resource allocation..."], level: 2 },
      ],
      tables: [
        {
          headers: ["Deliverable", "Description", "Timeline"],
          rows: [
            ["ADPA Software", "Fully functional application", "Week 8"],
            ["Documentation", "User guides and technical specs", "Week 10"],
            ["Training", "User training materials", "Week 12"],
          ],
        },
      ],
    },
    {
      filename: "work-breakdown-structure.md",
      title: "Work Breakdown Structure",
      category: "planning",
      content: `# Work Breakdown Structure (WBS)

## 1.0 ADPA Project
### 1.1 Project Management
#### 1.1.1 Project Planning
#### 1.1.2 Project Monitoring and Control
#### 1.1.3 Project Closure

### 1.2 Requirements and Design
#### 1.2.1 Requirements Gathering
#### 1.2.2 System Design
#### 1.2.3 Architecture Documentation

### 1.3 Development
#### 1.3.1 Core Development
#### 1.3.2 Testing and QA
#### 1.3.3 Integration

| WBS Code | Work Package | Duration | Resources |
|----------|--------------|----------|-----------|
| 1.1.1 | Project Planning | 2 weeks | PM, BA |
| 1.2.1 | Requirements Gathering | 3 weeks | BA, SME |
| 1.3.1 | Core Development | 8 weeks | Dev Team |`,
      frontmatter: {
        title: "Work Breakdown Structure",
        category: "planning",
      },
      sections: [
        { title: "Project Management", content: ["Project management activities..."], level: 2 },
        { title: "Requirements and Design", content: ["Analysis and design work..."], level: 2 },
        { title: "Development", content: ["Software development activities..."], level: 2 },
      ],
      tables: [
        {
          headers: ["WBS Code", "Work Package", "Duration", "Resources"],
          rows: [
            ["1.1.1", "Project Planning", "2 weeks", "PM, BA"],
            ["1.2.1", "Requirements Gathering", "3 weeks", "BA, SME"],
            ["1.3.1", "Core Development", "8 weeks", "Dev Team"],
          ],
        },
      ],
    },
  ];

  async getDocumentsByCategory(category: string): Promise<MarkdownDocument[]> {
    return this.mockDocuments.filter((doc) => doc.category === category);
  }

  async getDocumentByFilename(filename: string): Promise<MarkdownDocument | null> {
    return this.mockDocuments.find((doc) => doc.filename === filename) || null;
  }

  async getAllDocuments(): Promise<MarkdownDocument[]> {
    return [...this.mockDocuments];
  }

  async getAvailableCategories(): Promise<string[]> {
    return Array.from(new Set(this.mockDocuments.map((doc) => doc.category)));
  }
}

/**
 * File system document reader for Node.js environments
 * Note: This would require Node.js APIs not available in Office.js context
 */
export class FileSystemDocumentReader extends DocumentReader {
  constructor(
    private basePath: string = "c:\\Users\\menno\\Source\\Repos\\requirements-gathering-agent\\generated-documents"
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getDocumentsByCategory(_category: string): Promise<MarkdownDocument[]> {
    // This would use Node.js fs APIs to read from the actual folder
    // For now, return empty array as Office.js doesn't have file system access
    console.warn("FileSystemDocumentReader requires Node.js environment");
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getDocumentByFilename(_filename: string): Promise<MarkdownDocument | null> {
    console.warn("FileSystemDocumentReader requires Node.js environment");
    return null;
  }

  async getAllDocuments(): Promise<MarkdownDocument[]> {
    console.warn("FileSystemDocumentReader requires Node.js environment");
    return [];
  }

  async getAvailableCategories(): Promise<string[]> {
    return Object.keys(DOCUMENT_CATEGORIES);
  }
}

/**
 * Web API document reader for browser environments
 */
export class WebDocumentReader extends DocumentReader {
  constructor(private apiBaseUrl: string = "/api/documents") {
    super();
  }

  async getDocumentsByCategory(category: string): Promise<MarkdownDocument[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/category/${category}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching documents by category:", error);
      return [];
    }
  }

  async getDocumentByFilename(filename: string): Promise<MarkdownDocument | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/file/${encodeURIComponent(filename)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error fetching document by filename:", error);
      return null;
    }
  }

  async getAllDocuments(): Promise<MarkdownDocument[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/all`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching all documents:", error);
      return [];
    }
  }

  async getAvailableCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/categories`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return Object.keys(DOCUMENT_CATEGORIES);
    }
  }
}

/**
 * Main document integration manager
 */
export class DocumentIntegrationManager {
  private reader: DocumentReader;

  constructor(reader?: DocumentReader) {
    // Default to mock reader for development
    this.reader = reader || new MockDocumentReader();
  }

  setReader(reader: DocumentReader) {
    this.reader = reader;
  }

  getReader(): DocumentReader {
    return this.reader;
  }

  async getDocumentCatalog(): Promise<{ [category: string]: string[] }> {
    const categories = await this.reader.getAvailableCategories();
    const catalog: { [category: string]: string[] } = {};
    for (const category of categories) {
      const documents = await this.reader.getDocumentsByCategory(category);
      catalog[DOCUMENT_CATEGORIES[category as keyof typeof DOCUMENT_CATEGORIES] || category] = documents.map(
        (doc) => doc.title
      );
    }

    return catalog;
  }
  async convertDocumentToWord(filename: string, options: ConversionOptions = {}): Promise<boolean> {
    try {
      const document = await this.reader.getDocumentByFilename(filename);
      if (!document) {
        console.error(`Document not found: ${filename}`);
        return false;
      }

      await Word.run(async (context) => {
        // Clear existing content
        context.document.body.clear();

        // Create title page if requested
        if (options.includeTitlePage !== false) {
          await this.createMarkdownTitlePage(context, document);
        }

        // Create table of contents if requested
        if (options.includeTableOfContents) {
          await this.createTableOfContentsFromSections(context, document.sections);
        }

        // Convert markdown content to Word
        await this.convertMarkdownContent(context, document, options);

        // Apply formatting
        if (options.applyPMBOKFormatting !== false) {
          await applyDocumentStyles(context);
        }

        await context.sync();
      });

      return true;
    } catch (error) {
      console.error("Error converting document to Word:", error);
      return false;
    }
  }

  async convertCategoryToWord(
    category: string,
    options: ConversionOptions = {},
    progressCallback?: (progress: number, currentFile: string) => void
  ): Promise<number> {
    const documents = await this.reader.getDocumentsByCategory(category);
    let successCount = 0;

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      progressCallback?.(((i + 1) / documents.length) * 100, doc.filename);

      const success = await this.convertDocumentToWord(doc.filename, options);
      if (success) successCount++;

      // Add delay between conversions to prevent overwhelming Word
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return successCount;
  }

  async convertAllDocumentsToWord(
    options: ConversionOptions = {},
    progressCallback?: (progress: number, currentFile: string) => void
  ): Promise<number> {
    const documents = await this.reader.getAllDocuments();
    let successCount = 0;

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      progressCallback?.(((i + 1) / documents.length) * 100, doc.filename);

      const success = await this.convertDocumentToWord(doc.filename, options);
      if (success) successCount++;

      // Add delay between conversions
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return successCount;
  }

  private async createMarkdownTitlePage(context: Word.RequestContext, document: MarkdownDocument) {
    const titleParagraph = context.document.body.insertParagraph(document.title, Word.InsertLocation.start);
    titleParagraph.styleBuiltIn = Word.BuiltInStyleName.title;
    titleParagraph.alignment = Word.Alignment.centered;

    // Add category and metadata
    const categoryParagraph = context.document.body.insertParagraph(
      `Category: ${DOCUMENT_CATEGORIES[document.category as keyof typeof DOCUMENT_CATEGORIES] || document.category}`,
      Word.InsertLocation.end
    );
    categoryParagraph.styleBuiltIn = Word.BuiltInStyleName.subtitle;
    categoryParagraph.alignment = Word.Alignment.centered;

    // Add generation info if available
    if (document.frontmatter?.generated) {
      const generatedParagraph = context.document.body.insertParagraph(
        `Generated: ${new Date(document.frontmatter.generated).toLocaleDateString()}`,
        Word.InsertLocation.end
      );
      generatedParagraph.font.italic = true;
      generatedParagraph.alignment = Word.Alignment.centered;
    }

    // Add description if available
    if (document.frontmatter?.description) {
      const descParagraph = context.document.body.insertParagraph(
        document.frontmatter.description,
        Word.InsertLocation.end
      );
      descParagraph.font.italic = true;
      descParagraph.alignment = Word.Alignment.centered;
    }

    // Add page break
    context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
  }

  private async createTableOfContentsFromSections(context: Word.RequestContext, sections: MarkdownSection[]) {
    const tocTitle = context.document.body.insertParagraph("Table of Contents", Word.InsertLocation.end);
    tocTitle.styleBuiltIn = Word.BuiltInStyleName.heading1;

    for (const section of sections) {
      const tocEntry = context.document.body.insertParagraph(
        `${"  ".repeat(section.level - 1)}${section.title}`,
        Word.InsertLocation.end
      );
      tocEntry.font.name = "Calibri";
      tocEntry.font.size = 11;
    }

    // Add page break after TOC
    context.document.body.insertBreak(Word.BreakType.page, Word.InsertLocation.end);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async convertMarkdownContent(
    context: Word.RequestContext,
    document: MarkdownDocument,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: ConversionOptions
  ) {
    // Parse and convert markdown content
    const content = document.content;
    const lines = content.split("\n");
    let currentTableData: string[][] = [];
    let inTable = false;
    let tableHeaders: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        // Empty line - add paragraph break
        context.document.body.insertParagraph("", Word.InsertLocation.end);
        continue;
      }

      // Handle headers
      if (line.startsWith("#")) {
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const text = headerMatch[2];
          const paragraph = context.document.body.insertParagraph(text, Word.InsertLocation.end);

          switch (level) {
            case 1:
              paragraph.styleBuiltIn = Word.BuiltInStyleName.heading1;
              break;
            case 2:
              paragraph.styleBuiltIn = Word.BuiltInStyleName.heading2;
              break;
            case 3:
              paragraph.styleBuiltIn = Word.BuiltInStyleName.heading3;
              break;
            default:
              paragraph.styleBuiltIn = Word.BuiltInStyleName.heading4;
          }
          continue;
        }
      }

      // Handle tables
      if (line.includes("|") && !inTable) {
        // Start of table - this is the header row
        tableHeaders = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell);
        inTable = true;
        currentTableData = [];
        continue;
      } else if (line.includes("|") && inTable) {
        // Check if this is the separator line (contains only |, -, and spaces)
        if (line.match(/^[\s|-]+$/)) {
          continue; // Skip separator line
        }

        // This is a data row
        const rowData = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell);
        if (rowData.length > 0) {
          currentTableData.push(rowData);
        }
        continue;
      } else if (inTable && !line.includes("|")) {
        // End of table - create the table in Word
        if (tableHeaders.length > 0 && currentTableData.length > 0) {
          await this.createWordTable(context, { headers: tableHeaders, rows: currentTableData });
        }
        inTable = false;
        tableHeaders = [];
        currentTableData = [];
      }

      // Handle regular text
      if (!inTable) {
        const paragraph = context.document.body.insertParagraph(line, Word.InsertLocation.end);

        // Apply basic formatting for bold text (simplified)
        if (line.includes("**")) {
          // Note: This is a simplified bold detection - a full implementation would need more sophisticated parsing
          paragraph.font.bold = true;
        }
      }
    }

    // Handle any remaining table at the end
    if (inTable && tableHeaders.length > 0 && currentTableData.length > 0) {
      await this.createWordTable(context, { headers: tableHeaders, rows: currentTableData });
    }
  }

  private async createWordTable(context: Word.RequestContext, tableData: TableData) {
    if (tableData.headers.length === 0 || tableData.rows.length === 0) return;

    const table = context.document.body.insertTable(
      tableData.rows.length + 1, // +1 for header
      tableData.headers.length,
      Word.InsertLocation.end
    );

    // Set header row
    for (let col = 0; col < tableData.headers.length; col++) {
      const cell = table.getCell(0, col);
      cell.value = tableData.headers[col];
      cell.shadingColor = "#4472C4";
    }

    // Set data rows
    for (let row = 0; row < tableData.rows.length; row++) {
      for (let col = 0; col < Math.min(tableData.rows[row].length, tableData.headers.length); col++) {
        const cell = table.getCell(row + 1, col);
        cell.value = tableData.rows[row][col] || "";
      }
    }

    // Style the table
    table.styleBuiltIn = Word.BuiltInStyleName.gridTable4_Accent1;
    table.font.size = 10;

    // Add space after table
    context.document.body.insertParagraph("", Word.InsertLocation.end);
  }
}

// Global integration manager instance
const integrationManager = new DocumentIntegrationManager();

/**
 * Main integration function for taskpane use
 * @param event Office add-in event
 * @param request Configuration for document conversion
 */
export async function integrateWithGeneratedDocuments(
  event: Office.AddinCommands.Event,
  request: {
    action: "catalog" | "convert" | "convert-category" | "convert-files";
    environment?: "mock" | "filesystem" | "web";
    apiBaseUrl?: string;
    categories?: string[];
    filenames?: string[];
    onProgress?: (progress: { current: number; total: number; filename: string }) => void;
  }
) {
  try {
    // Set up the appropriate reader based on environment
    switch (request.environment) {
      case "filesystem":
        integrationManager.setReader(new FileSystemDocumentReader());
        break;
      case "web":
        integrationManager.setReader(new WebDocumentReader(request.apiBaseUrl));
        break;
      default:
        integrationManager.setReader(new MockDocumentReader());
    }

    switch (request.action) {
      case "catalog": {
        const catalog = await integrationManager.getDocumentCatalog();
        console.log("Document catalog:", catalog);
        // In real implementation, send this to taskpane UI
        break;
      }

      case "convert": {
        const allDocs = await integrationManager.getReader().getAllDocuments();
        for (const doc of allDocs) {
          await integrationManager.convertDocumentToWord(doc.filename);
        }
        break;
      }

      case "convert-category": {
        if (request.categories && request.categories.length > 0) {
          for (const category of request.categories) {
            await integrationManager.convertCategoryToWord(category);
          }
        }
        break;
      }

      case "convert-files": {
        if (request.filenames && request.filenames.length > 0) {
          for (const filename of request.filenames) {
            await integrationManager.convertDocumentToWord(filename);
          }
        }
        break;
      }
    }

    event.completed();
  } catch (error) {
    console.error("Error in generated documents integration:", error);
    event.completed();
  }
}

/**
 * Quick conversion functions for ribbon buttons
 */

// Convert all project charter documents
export async function convertAllProjectCharters(event: Office.AddinCommands.Event) {
  await integrateWithGeneratedDocuments(event, {
    action: "convert-category",
    categories: ["project-charter", "basic-docs"],
  });
}

// Convert all planning documents
export async function convertAllPlanningDocs(event: Office.AddinCommands.Event) {
  await integrateWithGeneratedDocuments(event, {
    action: "convert-category",
    categories: ["planning", "management-plans"],
  });
}

// Convert all technical documents
export async function convertAllTechnicalDocs(event: Office.AddinCommands.Event) {
  await integrateWithGeneratedDocuments(event, {
    action: "convert-category",
    categories: ["technical-analysis", "technical-design"],
  });
}

/**
 * Convert a specific markdown document from generated-documents to Word
 */
export async function convertMarkdownDocumentToWord(event: Office.AddinCommands.Event, filename?: string) {
  try {
    // If no filename provided, use a default or prompt user
    const targetFile = filename || "project-charter.md";

    const success = await integrationManager.convertDocumentToWord(targetFile, {
      includeTitlePage: true,
      includeTableOfContents: true,
      applyPMBOKFormatting: true,
    });

    if (success) {
      console.log(`Successfully converted ${targetFile} to Word`);
    } else {
      console.error(`Failed to convert ${targetFile} to Word`);
    }
  } catch (error) {
    console.error("Error in convertMarkdownDocumentToWord:", error);
  }

  event.completed();
}

/**
 * Convert all documents in a category to Word
 */
export async function convertCategoryToWord(event: Office.AddinCommands.Event, category?: string) {
  try {
    const targetCategory = category || "project-charter";

    const successCount = await integrationManager.convertCategoryToWord(
      targetCategory,
      {
        includeTitlePage: true,
        includeTableOfContents: false, // Skip TOC for batch conversion
        applyPMBOKFormatting: true,
      },
      (progress, currentFile) => {
        console.log(`Converting ${currentFile}... ${progress.toFixed(1)}% complete`);
      }
    );

    console.log(`Successfully converted ${successCount} documents from category: ${targetCategory}`);
  } catch (error) {
    console.error("Error in convertCategoryToWord:", error);
  }

  event.completed();
}

/**
 * Show available documents catalog
 */
export async function showDocumentCatalog(event: Office.AddinCommands.Event) {
  try {
    const catalog = await integrationManager.getDocumentCatalog();

    await Word.run(async (context) => {
      context.document.body.clear();

      const title = context.document.body.insertParagraph("Generated Documents Catalog", Word.InsertLocation.end);
      title.styleBuiltIn = Word.BuiltInStyleName.title;

      for (const [category, documents] of Object.entries(catalog)) {
        const categoryHeader = context.document.body.insertParagraph(category, Word.InsertLocation.end);
        categoryHeader.styleBuiltIn = Word.BuiltInStyleName.heading2;

        for (const docTitle of documents) {
          const docParagraph = context.document.body.insertParagraph(`• ${docTitle}`, Word.InsertLocation.end);
          docParagraph.leftIndent = 20;
        }

        context.document.body.insertParagraph("", Word.InsertLocation.end);
      }

      await context.sync();
    });
  } catch (error) {
    console.error("Error showing document catalog:", error);
  }

  event.completed();
}
