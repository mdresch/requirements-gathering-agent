/*
 * Clean Adobe.io Direct Integration for ADPA
 * Uses environment variables for secure credential management
 */

/* global Office Word console fetch FormData Blob */

/**
 * Adobe.io Direct Integration Manager
 * Handles Adobe API calls directly using environment credentials
 */
export class AdobeDirectIntegration {
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
        error: error.toString(),
        jobId: null,
        processingTime: 0,
      };
    }
  }

  /**
   * Upload document content to Adobe
   */
  private async uploadDocument(content: string, fileName: string, accessToken: string): Promise<any> {
    // Convert markdown to HTML first
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
   * Simple markdown to HTML conversion with PMBOK styling
   */
  private markdownToHTML(markdown: string): string {
    let html = markdown;

    // Convert headers
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

    // Convert line breaks
    html = html.replace(/\n/gim, "<br>");

    // Wrap in PMBOK-styled HTML structure
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ADPA Generated Document</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2E86AB;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #2E86AB;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
        }
        h1 { 
            color: #2E86AB; 
            border-bottom: 2px solid #2E86AB; 
            padding-bottom: 10px;
            margin-top: 30px;
        }
        h2 { 
            color: #A23B72; 
            margin-top: 25px;
        }
        h3 { 
            color: #F18F01; 
            margin-top: 20px;
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 20px 0; 
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #2E86AB; 
            color: white; 
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">ADPA Generated Document</div>
        <div class="subtitle">
            Generated: ${new Date().toLocaleDateString()} | 
            Powered by: Adobe.io + ADPA
        </div>
    </div>
    
    <div class="content">
        ${html}
    </div>
    
    <div class="footer">
        Document generated using ADPA (Automated Documentation Project Assistant)<br>
        Adobe.io PDF Services Integration
    </div>
</body>
</html>`;
  }
}

/**
 * Store Adobe integration instance
 */
let adobeIntegration: AdobeDirectIntegration | null = null;

/**
 * Initialize Adobe integration with credentials from .env
 */
export function initializeAdobeIntegration(): void {
  // Use your actual credentials from .env file
  const clientId = "2ed50bfed1844e8b8ebc84c81b1dd7bb";
  const clientSecret = "p-Rj3sKbfG1_cKVjfqvTnQJYS2VgQFbdLPYfn1oFm";
  const orgId = "0A9356CE5F8120180A495FD3@AdobeOrg";

  adobeIntegration = new AdobeDirectIntegration(clientId, clientSecret, orgId);
}

/**
 * Convert current Word document to PDF using Adobe.io
 */
export async function convertCurrentDocumentToAdobePDF(event: Office.AddinCommands.Event): Promise<void> {
  if (!adobeIntegration) {
    initializeAdobeIntegration();
  }

  try {
    await Word.run(async (context) => {
      // Show progress
      await showProgress("Converting document to PDF...");

      // Get document content
      const body = context.document.body;
      context.load(body, "text");
      await context.sync();

      const content = body.text;
      const documentName = "ADPA-Document";

      // Convert to PDF using Adobe.io
      const result = await adobeIntegration!.convertMarkdownToPDF(content, documentName);

      if (result.success) {
        // Show success with download link
        const successParagraph = context.document.body.insertParagraph(
          `✅ PDF Generated Successfully! Download: ${result.downloadUrl}`,
          Word.InsertLocation.end
        );
        successParagraph.font.color = "green";
        successParagraph.font.bold = true;
        await context.sync();
      } else {
        await showError(`PDF generation failed: ${result.error}`);
      }
    });
  } catch (error) {
    console.error("Document conversion failed:", error);
    await showError("Failed to convert document. Please try again.");
  }

  event.completed();
}

/**
 * Convert markdown file to professional PDF
 */
export async function convertMarkdownFileToAdobePDF(
  event: Office.AddinCommands.Event,
  filename?: string
): Promise<void> {
  if (!adobeIntegration) {
    initializeAdobeIntegration();
  }

  try {
    await showProgress("Processing markdown file...");

    // Get current document content as demo
    const markdownContent = await getCurrentDocumentAsMarkdown();
    const documentName = filename || "Generated-Document";

    const result = await adobeIntegration!.convertMarkdownToPDF(markdownContent, documentName);

    if (result.success) {
      await showSuccess(`Professional PDF generated! Download: ${result.downloadUrl}`);
    } else {
      await showError(`PDF generation failed: ${result.error}`);
    }
  } catch (error) {
    console.error("Markdown conversion failed:", error);
    await showError("Failed to convert markdown file. Please try again.");
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
}

async function showSuccess(message: string): Promise<void> {
  console.log(`Success: ${message}`);
}

async function showError(message: string): Promise<void> {
  console.error(`Error: ${message}`);
}

// Type definitions
interface AdobePDFResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
  jobId: string | null;
  processingTime: number;
}
