/*
 * Direct Adobe.io Integration for ADPA
 * No Azure services required - works with your existing Adobe.io c      },
    } catch (error) {
      console.error("Adobe PDF conversion failed:", error);
      return {
        success: false,
        error: error?.toString() || "Unknown error",
        jobId: null,
        processingTime: 0,
      };
    }ss
 *
 * This integrates Adobe PDF Services directly into your Office Add-in
 */

/* global Office Word console fetch URLSearchParams FormData Blob setTimeout */

// Type definitions for missing Office.js types
declare global {
  namespace Office {
    namespace AddinCommands {
      interface Event {
        completed(): void;
      }
    }
  }
  
  namespace Word {
    function run<T>(callback: (context: any) => Promise<T>): Promise<T>;
  }
}

// Type definitions
interface AdobePDFResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
  jobId: string | null;
  processingTime: number;
}

/**
 * Adobe.io Direct Integration Manager
 * Handles Adobe API calls directly from the Office Add-in
 */
class AdobeDirectIntegration {
  private clientId: string;
  private clientSecret: string;
  private orgId: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(clientId: string, clientSecret: string, orgId: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.orgId = orgId;
  }

  /**
   * Get Adobe.io access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch("https://ims-na1.adobelogin.com/ims/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: "openid,AdobeID,session,additional_info.projectedProductContext,additional_info.roles",
        }),
      });

      if (!response.ok) {
        throw new Error(`Adobe authentication failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000 - 60000; // Refresh 1 min early

      if (!this.accessToken) {
        throw new Error("Failed to get access token from Adobe response");
      }

      return this.accessToken;
    } catch (error) {
      throw new Error(`Failed to get Adobe access token: ${error}`);
    }
  }

  /**
   * Convert markdown content to PDF using Adobe PDF Services
   */
  async convertMarkdownToPDF(markdownContent: string, documentName: string): Promise<AdobePDFResult> {
    try {
      const accessToken = await this.getAccessToken();

      // Step 1: Upload document to Adobe
      const uploadResult = await this.uploadDocument(markdownContent, documentName, accessToken);

      // Step 2: Create PDF conversion job
      const jobResult = await this.createPDFJob(uploadResult.assetID, accessToken);

      // Step 3: Poll for completion and get result
      const pdfResult = await this.pollForCompletion(jobResult.jobID, accessToken);

      return {
        success: true,
        downloadUrl: pdfResult.downloadUrl,
        jobId: jobResult.jobID,
        processingTime: pdfResult.processingTime,
      };

    } catch (error) {
      console.error("Adobe PDF conversion failed:", error);
      return {
        success: false,
        error: error?.toString() || "Unknown error",
        jobId: null,
        processingTime: 0,
      };
    }
  }

  /**
   * Upload document content to Adobe
   */
  private async uploadDocument(content: string, fileName: string, accessToken: string): Promise<any> {
    // Convert markdown to HTML first (simple conversion)
    const htmlContent = this.markdownToHTML(content);
    
    // Create blob from HTML content
    const blob = new Blob([htmlContent], { type: "text/html" });
    
    const formData = new FormData();
    formData.append("file", blob, `${fileName}.html`);

    const response = await fetch("https://pdf-services.adobe.io/assets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": this.clientId,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Document upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create PDF conversion job
   */
  private async createPDFJob(assetID: string, accessToken: string): Promise<any> {
    const response = await fetch("https://pdf-services.adobe.io/operation/createpdf", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": this.clientId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assetID: assetID,
        outputFormat: "pdf",
      }),
    });

    if (!response.ok) {
      throw new Error(`PDF job creation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Poll for job completion
   */
  private async pollForCompletion(jobID: string, accessToken: string): Promise<any> {
    const maxAttempts = 30; // 5 minutes max wait
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://pdf-services.adobe.io/operation/${jobID}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": this.clientId,
        },
      });

      if (!response.ok) {
        throw new Error(`Job status check failed: ${response.statusText}`);
      }

      const jobStatus = await response.json();

      if (jobStatus.status === "done") {
        return {
          downloadUrl: jobStatus.downloadUri,
          processingTime: jobStatus.processingTime || 0,
        };
      } else if (jobStatus.status === "failed") {
        throw new Error(`PDF generation failed: ${jobStatus.error}`);
      }

      // Wait 10 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error("PDF generation timed out");
  }

  /**
   * Simple markdown to HTML conversion
   */
  private markdownToHTML(markdown: string): string {
    let html = markdown;

    // Convert headers
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Convert bold
    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");

    // Convert italic
    html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

    // Convert line breaks
    html = html.replace(/\n/gim, "<br>");

    // Wrap in basic HTML structure
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Generated Document</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2E86AB; border-bottom: 2px solid #2E86AB; padding-bottom: 10px; }
        h2 { color: #A23B72; margin-top: 30px; }
        h3 { color: #F18F01; margin-top: 25px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #2E86AB; color: white; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
  }

  /**
   * Generate professional PDF with PMBOK styling
   */
  async generatePMBOKPDF(markdownContent: string, documentTitle: string): Promise<AdobePDFResult> {
    // Add PMBOK-style formatting to the content
    const pmbokContent = this.addPMBOKFormatting(markdownContent, documentTitle);
    return await this.convertMarkdownToPDF(pmbokContent, documentTitle);
  }

  /**
   * Add PMBOK-style formatting
   */
  private addPMBOKFormatting(content: string, title: string): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `# ${title}

**Document Type:** Project Management Document  
**Date:** ${currentDate}  
**Version:** 1.0  

---

## Executive Summary

${content}

---

**Document prepared using ADPA (Automated Documentation Project Assistant)**  
**Generated on:** ${new Date().toISOString()}`;
  }
}

/**
 * ADPA Office Add-in integration functions
 * These functions integrate Adobe.io directly into your existing Word commands
 */

// Store Adobe integration instance
let adobeIntegration: AdobeDirectIntegration | null = null;

/**
 * Initialize Adobe integration (call this when add-in loads)
 */
export function initializeAdobeIntegration(clientId: string, clientSecret: string, orgId: string): void {
  adobeIntegration = new AdobeDirectIntegration(clientId, clientSecret, orgId);
}

/**
 * Convert current Word document to PDF using Adobe.io
 */
export async function convertCurrentDocumentToAdobePDF(event: Office.AddinCommands.Event): Promise<void> {
  if (!adobeIntegration) {
    await showError('Adobe integration not initialized. Please configure Adobe.io credentials.');
    event.completed();
    return;
  }

  try {
    await Word.run(async (context) => {
      // Show progress
      await showProgress('Converting document to PDF...');

      // Get document content
      const body = context.document.body;
      context.load(body, 'text');
      await context.sync();

      const content = body.text;
      const documentName = 'ADPA-Document';

      // Convert to PDF using Adobe.io
      const result = await adobeIntegration!.convertMarkdownToPDF(content, documentName);

      if (result.success) {
        // Show success with download link
        await showSuccess(`PDF generated successfully! Download: ${result.downloadUrl}`);
      } else {
        await showError(`PDF generation failed: ${result.error}`);
      }
    });
  } catch (error) {
    console.error('Document conversion failed:', error);
    await showError('Failed to convert document. Please try again.');
  }

  event.completed();
}

/**
 * Convert markdown file from generated-documents to professional PDF
 */
export async function convertMarkdownFileToAdobePDF(event: Office.AddinCommands.Event, filename?: string): Promise<void> {
  if (!adobeIntegration) {
    await showError('Adobe integration not initialized. Please configure Adobe.io credentials.');
    event.completed();
    return;
  }

  try {
    await showProgress('Processing markdown file...');

    // In a real implementation, you'd read from your generated-documents folder
    // For now, we'll use the current document content as a demo
    const markdownContent = await getCurrentDocumentAsMarkdown();
    const documentName = filename || 'Generated-Document';

    const result = await adobeIntegration.generatePMBOKPDF(markdownContent, documentName);

    if (result.success) {
      await showSuccess(`Professional PDF generated! Download: ${result.downloadUrl}`);
    } else {
      await showError(`PDF generation failed: ${result.error}`);
    }

  } catch (error) {
    console.error('Markdown conversion failed:', error);
    await showError('Failed to convert markdown file. Please try again.');
  }

  event.completed();
}

/**
 * Batch convert multiple markdown files to PDF
 */
export async function batchConvertToAdobePDF(event: Office.AddinCommands.Event): Promise<void> {
  if (!adobeIntegration) {
    await showError('Adobe integration not initialized. Please configure Adobe.io credentials.');
    event.completed();
    return;
  }

  try {
    await showProgress('Starting batch conversion...');

    // Demo: Convert current document multiple times with different formats
    const baseContent = await getCurrentDocumentAsMarkdown();
    const results: AdobePDFResult[] = [];

    const documentTypes = [
      { name: 'Project Charter', content: `# Project Charter\n\n${baseContent}` },
      { name: 'Technical Specification', content: `# Technical Specification\n\n${baseContent}` },
      { name: 'User Guide', content: `# User Guide\n\n${baseContent}` }
    ];

    for (const doc of documentTypes) {
      await showProgress(`Converting ${doc.name}...`);
      const result = await adobeIntegration.generatePMBOKPDF(doc.content, doc.name);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    await showSuccess(
      `Batch conversion completed! ${successCount}/${results.length} documents converted successfully.`
    );

  } catch (error) {
    console.error("Batch conversion failed:", error);
    await showError("Batch conversion failed. Please try again.");
  }

  event.completed();
}

// Helper functions
async function getCurrentDocumentAsMarkdown(): Promise<string> {
  return new Promise((resolve) => {
    Word.run(async (context) => {
      const body = context.document.body;
      context.load(body, "text");
      await context.sync();
      resolve(body.text);
    });
  });
}

async function showProgress(message: string): Promise<void> {
  console.log(`Progress: ${message}`);
  // In a real implementation, you'd show this in your add-in UI
}

async function showSuccess(message: string): Promise<void> {
  console.log(`Success: ${message}`);
  // In a real implementation, you'd show this in your add-in UI
}

async function showError(message: string): Promise<void> {
  console.error(`Error: ${message}`);
  // In a real implementation, you'd show this in your add-in UI
}
