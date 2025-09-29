/**
 * Document Format Converter Utility
 * Handles conversion between different document formats (MD, PDF, DOCX)
 */

export interface DocumentContent {
  title: string;
  content: string;
  metadata?: {
    author?: string;
    date?: string;
    version?: string;
  };
}

export class DocumentConverter {
  /**
   * Convert markdown content to PDF (simplified HTML version)
   */
  static async convertToPDF(docContent: DocumentContent): Promise<Blob> {
    try {
      // Convert markdown to HTML first
      const htmlContent = this.markdownToHtml(docContent.content);
      
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${docContent.title}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              line-height: 1.6;
              color: #333;
              background: white;
            }
            h1 {
              color: #2c3e50;
              border-bottom: 3px solid #3498db;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            h2 {
              color: #34495e;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-top: 30px;
              margin-bottom: 20px;
            }
            h3 {
              color: #34495e;
              margin-top: 25px;
              margin-bottom: 15px;
            }
            p {
              margin-bottom: 15px;
            }
            code {
              background: #f8f9fa;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 0.9em;
              color: #e74c3c;
            }
            pre {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              overflow-x: auto;
              border-left: 4px solid #3498db;
              margin: 20px 0;
            }
            pre code {
              background: none;
              padding: 0;
              color: #2c3e50;
            }
            blockquote {
              border-left: 4px solid #3498db;
              margin: 20px 0;
              padding-left: 20px;
              color: #7f8c8d;
              font-style: italic;
            }
            ul, ol {
              margin-bottom: 15px;
              padding-left: 30px;
            }
            li {
              margin-bottom: 5px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #bdc3c7;
              padding: 12px;
              text-align: left;
            }
            th {
              background: #ecf0f1;
              font-weight: bold;
            }
            .metadata {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 30px;
              border-left: 4px solid #3498db;
            }
            .metadata p {
              margin: 5px 0;
              font-size: 0.9em;
              color: #7f8c8d;
            }
          </style>
        </head>
        <body>
          <h1>${docContent.title}</h1>
          
          ${docContent.metadata ? `
            <div class="metadata">
              ${docContent.metadata.author ? `<p><strong>Author:</strong> ${docContent.metadata.author}</p>` : ''}
              ${docContent.metadata.date ? `<p><strong>Date:</strong> ${docContent.metadata.date}</p>` : ''}
              ${docContent.metadata.version ? `<p><strong>Version:</strong> ${docContent.metadata.version}</p>` : ''}
            </div>
          ` : ''}
          
          ${htmlContent}
        </body>
        </html>
      `;

      return new Blob([fullHtml], { type: 'text/html' });
    } catch (error) {
      console.error('Error converting to PDF:', error);
      throw new Error('Failed to convert document to PDF');
    }
  }

  /**
   * Convert markdown content to DOCX (simplified text version)
   */
  static async convertToDOCX(docContent: DocumentContent): Promise<Blob> {
    try {
      // Convert markdown to plain text
      const textContent = this.markdownToText(docContent.content);
      
      const docxContent = `
${docContent.title}
${'='.repeat(docContent.title.length)}

${docContent.metadata ? `
Author: ${docContent.metadata.author || 'Unknown'}
Date: ${docContent.metadata.date || new Date().toLocaleDateString()}
Version: ${docContent.metadata.version || '1.0'}

` : ''}
${textContent}
      `;

      return new Blob([docxContent], { 
        type: 'text/plain' 
      });
    } catch (error) {
      console.error('Error converting to DOCX:', error);
      throw new Error('Failed to convert document to DOCX');
    }
  }

  /**
   * Convert markdown content to HTML (for better PDF conversion)
   */
  static convertToHTML(docContent: DocumentContent): string {
    const htmlContent = this.markdownToHtml(docContent.content);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docContent.title}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          h2 {
            color: #34495e;
            border-bottom: 2px solid #bdc3c7;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 20px;
          }
          h3 {
            color: #34495e;
            margin-top: 25px;
            margin-bottom: 15px;
          }
          p {
            margin-bottom: 15px;
          }
          code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #e74c3c;
          }
          pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #3498db;
            margin: 20px 0;
          }
          pre code {
            background: none;
            padding: 0;
            color: #2c3e50;
          }
          blockquote {
            border-left: 4px solid #3498db;
            margin: 20px 0;
            padding-left: 20px;
            color: #7f8c8d;
            font-style: italic;
          }
          ul, ol {
            margin-bottom: 15px;
            padding-left: 30px;
          }
          li {
            margin-bottom: 5px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #bdc3c7;
            padding: 12px;
            text-align: left;
          }
          th {
            background: #ecf0f1;
            font-weight: bold;
          }
          .metadata {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            border-left: 4px solid #3498db;
          }
          .metadata p {
            margin: 5px 0;
            font-size: 0.9em;
            color: #7f8c8d;
          }
        </style>
      </head>
      <body>
        <h1>${docContent.title}</h1>
        
        ${docContent.metadata ? `
          <div class="metadata">
            ${docContent.metadata.author ? `<p><strong>Author:</strong> ${docContent.metadata.author}</p>` : ''}
            ${docContent.metadata.date ? `<p><strong>Date:</strong> ${docContent.metadata.date}</p>` : ''}
            ${docContent.metadata.version ? `<p><strong>Version:</strong> ${docContent.metadata.version}</p>` : ''}
          </div>
        ` : ''}
        
        ${htmlContent}
      </body>
      </html>
    `;
  }

  /**
   * Simple markdown to HTML converter
   */
  private static markdownToHtml(markdown: string): string {
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
      .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')
      .replace(/^<li>/gim, '<ul><li>')
      .replace(/<\/li>$/gim, '</li></ul>')
      .replace(/^<\/p><p>/gim, '<p>')
      .replace(/<\/p><p>$/gim, '</p>');
  }

  /**
   * Simple markdown to text converter
   */
  private static markdownToText(markdown: string): string {
    return markdown
      .replace(/^#{1,6}\s/gim, '') // Remove headers
      .replace(/\*\*(.*)\*\*/gim, '$1') // Remove bold
      .replace(/\*(.*)\*/gim, '$1') // Remove italic
      .replace(/`(.*)`/gim, '$1') // Remove code
      .replace(/^\- /gim, '• ') // Convert bullets
      .replace(/^\* /gim, '• ') // Convert bullets
      .replace(/^\d+\. /gim, '• ') // Convert numbered lists
      .replace(/\n\n/gim, '\n\n') // Preserve paragraphs
      .trim();
  }

  /**
   * Get file extension for a given format
   */
  static getFileExtension(format: 'md' | 'pdf' | 'docx'): string {
    switch (format) {
      case 'md': return 'md';
      case 'pdf': return 'html'; // We're generating HTML for PDF
      case 'docx': return 'txt'; // We're generating text for DOCX
      default: return 'txt';
    }
  }

  /**
   * Get MIME type for a given format
   */
  static getMimeType(format: 'md' | 'pdf' | 'docx'): string {
    switch (format) {
      case 'md': return 'text/markdown';
      case 'pdf': return 'text/html';
      case 'docx': return 'text/plain';
      default: return 'text/plain';
    }
  }
}
