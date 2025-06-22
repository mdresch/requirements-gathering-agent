#!/usr/bin/env node

/*
 * Standalone Adobe PDF Converter
 * Directly converts markdown files to PDFs using Adobe PDF Services
 * No Office.js required - works as a standalone Node.js script
 */

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
  organizationId: string;
}

interface ConversionResult {
  success: boolean;
  inputFile: string;
  outputFile?: string;
  downloadUrl?: string;
  error?: string;
  processingTime?: number;
}

class StandaloneAdobePDFConverter {
  private credentials: AdobeCredentials;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.credentials = this.loadCredentials();
  }

  private loadCredentials(): AdobeCredentials {
    const clientId = process.env.ADOBE_CLIENT_ID;
    const clientSecret = process.env.ADOBE_CLIENT_SECRET;
    const organizationId = process.env.ADOBE_ORGANIZATION_ID;

    if (!clientId || !clientSecret || !organizationId) {
      throw new Error(
        'Missing Adobe.io credentials. Please check your .env file:\n' +
        `- ADOBE_CLIENT_ID: ${clientId ? '✓' : '✗'}\n` +
        `- ADOBE_CLIENT_SECRET: ${clientSecret ? '✓' : '✗'}\n` +
        `- ADOBE_ORGANIZATION_ID: ${organizationId ? '✓' : '✗'}`
      );
    }

    return { clientId, clientSecret, organizationId };
  }

  /**
   * Get Adobe access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    console.log('Getting Adobe access token...');

    const response = await fetch('https://ims-na1.adobelogin.com/ims/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        scope: 'openid,AdobeID,session,additional_info.projectedProductContext,additional_info.roles'
      })
    });

    if (!response.ok) {
      throw new Error(`Adobe authentication failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    this.accessToken = tokenData.access_token;
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000;

    console.log('✓ Adobe access token obtained');
    return this.accessToken;
  }

  /**
   * Convert markdown content to HTML
   */
  private markdownToHTML(markdown: string, title?: string): string {
    let html = markdown;

    // Extract frontmatter if present
    const frontmatterMatch = html.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let frontmatter = {};
    if (frontmatterMatch) {
      const frontmatterText = frontmatterMatch[1];
      html = frontmatterMatch[2];
      
      // Parse simple YAML frontmatter
      frontmatterText.split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
        if (match) {
          frontmatter[match[1]] = match[2];
        }
      });
    }

    // Convert markdown to HTML
    html = html.replace(/^### (.*$)/gim, '<h3 style="color: #F18F01; margin-top: 25px;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="color: #A23B72; margin-top: 30px;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="color: #2E86AB; border-bottom: 2px solid #2E86AB; padding-bottom: 10px;">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert tables
    html = this.convertTables(html);
    
    // Convert line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    const documentTitle = frontmatter['title'] || title || 'ADPA Generated Document';
    const documentDate = frontmatter['date'] || new Date().toLocaleDateString();
    const documentVersion = frontmatter['version'] || '1.0';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${documentTitle}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #2E86AB;
            padding-bottom: 20px;
        }
        .document-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
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
            font-size: 14px;
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
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 50px;
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
        <h1 style="margin: 0; border: none;">${documentTitle}</h1>
        <p style="margin: 10px 0; font-size: 18px; color: #666;">Professional Project Management Document</p>
    </div>
    
    <div class="document-info">
        <strong>Document Information:</strong><br>
        Date: ${documentDate}<br>
        Version: ${documentVersion}<br>
        Generated: ${new Date().toLocaleString()}<br>
        System: ADPA (Automated Documentation Project Assistant)
    </div>
    
    <div class="content">
        <p>${html}</p>
    </div>
    
    <div class="footer">
        Document generated by ADPA using Adobe PDF Services<br>
        © ${new Date().getFullYear()} - Professional Project Management Documentation
    </div>
</body>
</html>`;
  }

  /**
   * Convert markdown tables to HTML
   */
  private convertTables(markdown: string): string {
    const tableRegex = /\|(.+)\|\n\|[-\s|:]+\|\n((?:\|.+\|\n?)*)/g;
    
    return markdown.replace(tableRegex, (match, headerRow, bodyRows) => {
      const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
      const rows = bodyRows.trim().split('\n').map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      );

      let html = '<table>\n<thead>\n<tr>\n';
      headers.forEach(header => {
        html += `<th>${header}</th>\n`;
      });
      html += '</tr>\n</thead>\n<tbody>\n';

      rows.forEach(row => {
        html += '<tr>\n';
        row.forEach(cell => {
          html += `<td>${cell}</td>\n`;
        });
        html += '</tr>\n';
      });

      html += '</tbody>\n</table>\n';
      return html;
    });
  }

  /**
   * Convert single markdown file to PDF
   */
  async convertMarkdownToPDF(markdownFilePath: string, outputDir: string): Promise<ConversionResult> {
    const startTime = Date.now();
    const fileName = path.basename(markdownFilePath, '.md');
    
    try {
      console.log(`\n📄 Converting: ${fileName}.md`);

      // Read markdown file
      const markdownContent = fs.readFileSync(markdownFilePath, 'utf8');
      
      // Convert to HTML
      const htmlContent = this.markdownToHTML(markdownContent, fileName);

      // Get access token
      const accessToken = await this.getAccessToken();

      // Upload HTML to Adobe
      console.log('  📤 Uploading to Adobe...');
      const uploadResult = await this.uploadHTMLToAdobe(htmlContent, fileName, accessToken);

      // Create PDF job
      console.log('  🔄 Creating PDF...');
      const jobResult = await this.createPDFJob(uploadResult.assetID, accessToken);

      // Poll for completion
      console.log('  ⏳ Processing...');
      const pdfResult = await this.pollForCompletion(jobResult.jobID, accessToken);

      // Download PDF
      console.log('  📥 Downloading PDF...');
      const outputPath = path.join(outputDir, `${fileName}.pdf`);
      await this.downloadPDF(pdfResult.downloadUrl, outputPath);

      const processingTime = Date.now() - startTime;
      console.log(`  ✅ Success! Generated: ${outputPath} (${processingTime}ms)`);

      return {
        success: true,
        inputFile: markdownFilePath,
        outputFile: outputPath,
        downloadUrl: pdfResult.downloadUrl,
        processingTime
      };

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      return {
        success: false,
        inputFile: markdownFilePath,
        error: error.message
      };
    }
  }  /**
   * Upload HTML content to Adobe (using temp file approach)
   */
  private async uploadHTMLToAdobe(htmlContent: string, fileName: string, accessToken: string): Promise<any> {
    // Create temporary HTML file
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempHtmlPath = path.join(tempDir, `${fileName}.html`);
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

    try {
      // Read the file and create form data
      const fileBuffer = fs.readFileSync(tempHtmlPath);
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: `${fileName}.html`,
        contentType: 'text/html'
      });

      const response = await fetch('https://pdf-services.adobe.io/assets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': this.credentials.clientId
        },
        body: formData
      });

      // Clean up temp file
      fs.unlinkSync(tempHtmlPath);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      // Clean up temp file in case of error
      if (fs.existsSync(tempHtmlPath)) {
        fs.unlinkSync(tempHtmlPath);
      }
      throw error;
    }
  }

  /**
   * Create PDF conversion job
   */
  private async createPDFJob(assetID: string, accessToken: string): Promise<any> {
    const response = await fetch('https://pdf-services.adobe.io/operation/createpdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': this.credentials.clientId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assetID: assetID,
        outputFormat: 'pdf'
      })
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
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://pdf-services.adobe.io/operation/${jobID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': this.credentials.clientId
        }
      });

      if (!response.ok) {
        throw new Error(`Job status check failed: ${response.statusText}`);
      }

      const jobStatus = await response.json();

      if (jobStatus.status === 'done') {
        return {
          downloadUrl: jobStatus.downloadUri,
          processingTime: jobStatus.processingTime || 0
        };
      } else if (jobStatus.status === 'failed') {
        throw new Error(`PDF generation failed: ${jobStatus.error || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
    }

    throw new Error('PDF generation timed out');
  }

  /**
   * Download PDF from Adobe
   */
  private async downloadPDF(downloadUrl: string, outputPath: string): Promise<void> {
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    fs.writeFileSync(outputPath, buffer);
  }

  /**
   * Convert all markdown files in a directory
   */
  async convertDirectory(inputDir: string, outputDir: string): Promise<ConversionResult[]> {
    console.log(`\n🚀 Converting markdown files from: ${inputDir}`);
    console.log(`📁 Output directory: ${outputDir}\n`);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Find all markdown files
    const markdownFiles = this.findMarkdownFiles(inputDir);
    console.log(`📋 Found ${markdownFiles.length} markdown files\n`);

    const results: ConversionResult[] = [];

    for (const filePath of markdownFiles) {
      const result = await this.convertMarkdownToPDF(filePath, outputDir);
      results.push(result);
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n📊 Conversion Summary:`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📁 Output directory: ${outputDir}`);

    return results;
  }

  /**
   * Find all markdown files in directory
   */
  private findMarkdownFiles(dir: string): string[] {
    const files: string[] = [];

    function scan(currentDir: string) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    }

    scan(dir);
    return files;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📄 ADPA Adobe PDF Converter

Usage:
  node adobe-pdf-converter.js <input> [output]

Examples:
  # Convert all markdown files in generated-documents folder
  node adobe-pdf-converter.js ../generated-documents
  
  # Convert specific file
  node adobe-pdf-converter.js ../generated-documents/project-charter.md
  
  # Convert with custom output directory
  node adobe-pdf-converter.js ../generated-documents ./pdf-output

Environment Variables Required:
  ADOBE_CLIENT_ID=your_client_id
  ADOBE_CLIENT_SECRET=your_client_secret  
  ADOBE_ORGANIZATION_ID=your_org_id
`);
    process.exit(1);
  }

  const inputPath = args[0];
  const outputPath = args[1] || './pdf-output';

  try {
    const converter = new StandaloneAdobePDFConverter();
    
    const stat = fs.statSync(inputPath);
    
    if (stat.isDirectory()) {
      await converter.convertDirectory(inputPath, outputPath);
    } else {
      const outputDir = path.dirname(outputPath);
      await converter.convertMarkdownToPDF(inputPath, outputDir);
    }
    
    console.log('\n🎉 All done!');
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { StandaloneAdobePDFConverter };
