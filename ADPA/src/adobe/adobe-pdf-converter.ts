/*
 * Adobe.io Direct Integration for ADPA
 * Uses your verified Adobe.io credentials to convert documents to PDF
 */

import { adobeConfig } from "../config/adobe-config";

/**
 * Simple Adobe.io PDF converter using environment-based credentials
 */
export class AdobePDFConverter {
  private clientId: string;
  private clientSecret: string;
  private orgId: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Always load from environment variables for security
    this.clientId = adobeConfig.clientId;
    this.clientSecret = adobeConfig.clientSecret;
    this.orgId = adobeConfig.organizationId;
    
    // Validate credentials are provided
    if (!this.clientId || !this.clientSecret || !this.orgId) {
      throw new Error(
        "Adobe.io credentials not found. Please check your .env file contains:\n" +
        "- ADOBE_CLIENT_ID\n" +
        "- ADOBE_CLIENT_SECRET\n" +
        "- ADOBE_ORGANIZATION_ID"
      );
    }
  }

  /**
   * Get Adobe.io access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid (refresh 5 min early)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://ims-na1.adobelogin.com/ims/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'openid,AdobeID,session,additional_info.projectedProductContext,additional_info.roles'
        })
      });

      if (!response.ok) {
        throw new Error(`Adobe authentication failed: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

      console.log('✅ Adobe.io authentication successful');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Adobe.io authentication failed:', error);
      throw new Error(`Failed to authenticate with Adobe.io: ${error}`);
    }
  }

  /**
   * Convert Word document content to professional PDF
   */
  async convertToPDF(content: string, documentTitle: string): Promise<AdobeConversionResult> {
    try {
      console.log('🔄 Starting Adobe.io PDF conversion...');
      
      // Step 1: Get access token
      const accessToken = await this.getAccessToken();
      
      // Step 2: Prepare HTML content with professional styling
      const htmlContent = this.createProfessionalHTML(content, documentTitle);
      
      // Step 3: Upload document to Adobe
      const uploadResult = await this.uploadDocument(htmlContent, documentTitle, accessToken);
      console.log('📤 Document uploaded to Adobe.io');
      
      // Step 4: Create PDF conversion job
      const jobResult = await this.createPDFJob(uploadResult.assetID, accessToken);
      console.log('⚙️ PDF conversion job created');
      
      // Step 5: Poll for completion
      const pdfResult = await this.pollForCompletion(jobResult.jobID, accessToken);
      console.log('✅ PDF conversion completed');
      
      return {
        success: true,
        downloadUrl: pdfResult.downloadUrl,
        jobId: jobResult.jobID,
        processingTime: pdfResult.processingTime || 0,
        message: `PDF generated successfully for "${documentTitle}"`
      };

    } catch (error) {
      console.error('❌ Adobe.io PDF conversion failed:', error);
      return {
        success: false,
        error: error.toString(),
        jobId: null,
        processingTime: 0,
        message: `Failed to convert "${documentTitle}" to PDF`
      };
    }
  }

  /**
   * Create professional HTML with PMBOK-style formatting
   */
  private createProfessionalHTML(content: string, title: string): string {
    // Convert basic markdown to HTML
    let html = content;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 style="color: #F18F01; margin-top: 25px; margin-bottom: 10px;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="color: #A23B72; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #A23B72; padding-bottom: 5px;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="color: #2E86AB; margin-top: 35px; margin-bottom: 20px; border-bottom: 2px solid #2E86AB; padding-bottom: 10px;">$1</h1>');
    
    // Text formatting
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong style="color: #2E86AB;">$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Lists
    html = html.replace(/^- (.*$)/gim, '<li style="margin-bottom: 5px;">$1</li>');
    html = html.replace(/(<li.*<\/li>)/gms, '<ul style="margin: 15px 0; padding-left: 20px;">$1</ul>');
    
    // Line breaks
    html = html.replace(/\n\n/gim, '</p><p style="margin: 15px 0; line-height: 1.6;">');
    html = html.replace(/\n/gim, '<br>');

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @page {
            margin: 1in;
            size: letter;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2E86AB;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        
        .document-title {
            font-size: 24pt;
            font-weight: bold;
            color: #2E86AB;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        
        .document-subtitle {
            font-size: 14pt;
            color: #666;
            margin-bottom: 5px;
        }
        
        .document-meta {
            font-size: 10pt;
            color: #888;
            font-style: italic;
        }
        
        .content {
            padding: 0 20px;
        }
        
        h1 {
            color: #2E86AB;
            font-size: 18pt;
            margin-top: 35px;
            margin-bottom: 20px;
            border-bottom: 2px solid #2E86AB;
            padding-bottom: 10px;
            page-break-after: avoid;
        }
        
        h2 {
            color: #A23B72;
            font-size: 14pt;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid #A23B72;
            padding-bottom: 5px;
            page-break-after: avoid;
        }
        
        h3 {
            color: #F18F01;
            font-size: 12pt;
            margin-top: 25px;
            margin-bottom: 10px;
            page-break-after: avoid;
        }
        
        p {
            margin: 15px 0;
            text-align: justify;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        li {
            margin-bottom: 5px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10pt;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background-color: #2E86AB;
            color: white;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 9pt;
            color: #888;
            text-align: center;
        }
        
        strong {
            color: #2E86AB;
            font-weight: bold;
        }
        
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="document-title">${title}</div>
        <div class="document-subtitle">Generated by ADPA (Automated Documentation Project Assistant)</div>
        <div class="document-meta">
            Document Date: ${currentDate}<br>
            Generated using Adobe.io Document Services
        </div>
    </div>
    
    <div class="content">
        <p style="margin: 15px 0; line-height: 1.6;">${html}</p>
    </div>
    
    <div class="footer">
        <p>This document was automatically generated by ADPA using Adobe.io Document Services<br>
        Generated on ${new Date().toISOString()}</p>
    </div>
</body>
</html>`;
  }

  /**
   * Upload document to Adobe
   */
  private async uploadDocument(htmlContent: string, fileName: string, accessToken: string): Promise<any> {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const formData = new FormData();
    formData.append('file', blob, `${fileName}.html`);

    const response = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': this.clientId
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Document upload failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Create PDF conversion job
   */
  private async createPDFJob(assetID: string, accessToken: string): Promise<any> {
    const response = await fetch('https://pdf-services.adobe.io/operation/createpdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': this.clientId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assetID: assetID,
        outputFormat: 'pdf',
        params: {
          documentLanguage: 'en-US'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDF job creation failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Poll for job completion
   */
  private async pollForCompletion(jobID: string, accessToken: string): Promise<any> {
    const maxAttempts = 60; // 10 minutes max
    const delayMs = 10000; // 10 seconds between checks
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://pdf-services.adobe.io/operation/${jobID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': this.clientId
        }
      });

      if (!response.ok) {
        throw new Error(`Job status check failed: ${response.status}`);
      }

      const jobStatus = await response.json();
      console.log(`🔄 PDF job status: ${jobStatus.status} (attempt ${attempts + 1}/${maxAttempts})`);

      if (jobStatus.status === 'done') {
        return {
          downloadUrl: jobStatus.downloadUri,
          processingTime: Date.now() - (attempts * delayMs)
        };
      } else if (jobStatus.status === 'failed') {
        throw new Error(`PDF generation failed: ${jobStatus.error || 'Unknown error'}`);
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, delayMs));
      attempts++;
    }

    throw new Error('PDF generation timed out after 10 minutes');
  }
}

// Global instance for use in Office Add-in
let adobeConverter: AdobePDFConverter | null = null;

/**
 * Initialize Adobe.io converter
 */
export function initializeAdobeConverter(): AdobePDFConverter {
  if (!adobeConverter) {
    adobeConverter = new AdobePDFConverter();
  }
  return adobeConverter;
}

/**
 * ADPA Office Add-in command: Convert current document to PDF using Adobe.io
 */
export async function convertCurrentDocumentToAdobePDF(event: Office.AddinCommands.Event): Promise<void> {
  try {
    await Word.run(async (context) => {
      // Initialize Adobe converter
      const converter = initializeAdobeConverter();
      
      // Show initial progress
      const progressParagraph = context.document.body.insertParagraph(
        '🔄 Converting document to professional PDF using Adobe.io...',
        Word.InsertLocation.end
      );
      progressParagraph.font.color = '#2E86AB';
      progressParagraph.font.bold = true;
      await context.sync();
      
      // Get document content
      const body = context.document.body;
      context.load(body, 'text');
      await context.sync();
      
      const content = body.text;
      const documentTitle = 'ADPA Document';
      
      // Convert to PDF using Adobe.io
      const result = await converter.convertToPDF(content, documentTitle);
      
      // Remove progress message
      progressParagraph.delete();
      
      // Show result
      if (result.success) {
        const successParagraph = context.document.body.insertParagraph(
          `✅ ${result.message}\n🔗 Download URL: ${result.downloadUrl}\n⏱️ Processing time: ${Math.round(result.processingTime / 1000)} seconds`,
          Word.InsertLocation.end
        );
        successParagraph.font.color = 'green';
        successParagraph.font.bold = true;
      } else {
        const errorParagraph = context.document.body.insertParagraph(
          `❌ ${result.message}\n🔍 Error: ${result.error}`,
          Word.InsertLocation.end
        );
        errorParagraph.font.color = 'red';
        errorParagraph.font.bold = true;
      }
      
      await context.sync();
    });
  } catch (error) {
    console.error('Document conversion failed:', error);
  }

  event.completed();
}

// Type definitions
interface AdobeConversionResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
  jobId: string | null;
  processingTime: number;
  message: string;
}

export { AdobePDFConverter };
