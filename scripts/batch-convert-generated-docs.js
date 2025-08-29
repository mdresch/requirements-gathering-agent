#!/usr/bin/env node

/**
 * Batch PDF Conversion for Generated Documents
 * 
 * This script converts all files in the generated-documents directory to PDFs
 * using multiple methods: Adobe SDK (if working), Puppeteer, and markdown-pdf.
 * 
 * Features:
 * - Recursive directory scanning
 * - Multiple conversion methods with fallbacks
 * - Progress tracking and logging
 * - Error handling and retry logic
 * - Support for markdown, text, and HTML files
 * - Maintains directory structure in output
 */

const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

// Configuration
const CONFIG = {
    inputDir: './generated-documents',
    puppeteerOptions: {
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    pdfOptions: {
        format: 'A4',
        margin: {
            top: '1in',
            right: '1in',
            bottom: '1in',
            left: '1in'
        },
        printBackground: true,
        preferCSSPageSize: false
    }
};

// Logging utilities
const logger = {
    info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
    error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
    success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`)
};

// Progress tracker
class ProgressTracker {
    constructor(total) {
        this.total = total;
        this.completed = 0;
        this.failed = 0;
        this.startTime = Date.now();
    }

    update(success = true) {
        if (success) {
            this.completed++;
        } else {
            this.failed++;
        }
        
        const processed = this.completed + this.failed;
        const percentage = ((processed / this.total) * 100).toFixed(1);
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        
        logger.info(`Progress: ${processed}/${this.total} (${percentage}%) - Success: ${this.completed}, Failed: ${this.failed}, Time: ${elapsed}s`);
    }

    getSummary() {
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        return {
            total: this.total,
            completed: this.completed,
            failed: this.failed,
            successRate: ((this.completed / this.total) * 100).toFixed(1),
            totalTime: elapsed
        };
    }
}

// File discovery
async function findFiles(dir, extensions = CONFIG.supportedExtensions) {
    const files = [];
    
    async function scanDirectory(currentDir) {
        try {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                
                if (entry.isDirectory()) {
                    await scanDirectory(fullPath);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (extensions.includes(ext)) {
                        files.push({
                            fullPath,
                            relativePath: path.relative(dir, fullPath),
                            name: entry.name,
                            extension: ext
                        });
                    }
                }
            }
        } catch (error) {
            logger.error(`Error scanning directory ${currentDir}: ${error.message}`);
        }
    }
    
    await scanDirectory(dir);
    return files;
}

// HTML template for consistent styling
function getHTMLTemplate(title, content, filePath) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 24px;
            margin-bottom: 16px;
        }
        h1 {
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 8px;
        }
        p {
            margin-bottom: 16px;
            text-align: justify;
        }
        code {
            background: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            border-left: 4px solid #3498db;
        }
        blockquote {
            border-left: 4px solid #3498db;
            margin: 0;
            padding-left: 16px;
            color: #666;
            font-style: italic;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        ul, ol {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .document-header {
            border-bottom: 2px solid #3498db;
            margin-bottom: 30px;
            padding-bottom: 20px;
        }
        .document-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 0.9em;
            color: #666;
        }
        .page-break {
            page-break-before: always;
        }
        @media print {
            body {
                margin: 0;
                padding: 15mm;
            }
            .document-header {
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="document-header">
        <h1>${title}</h1>
        <div class="document-info">
            <strong>Source:</strong> ${filePath}<br>
            <strong>Generated:</strong> ${new Date().toISOString()}<br>
            <strong>Conversion:</strong> Requirements Gathering Agent - Batch PDF Generator
        </div>
    </div>
    ${content}
</body>
</html>`;
}

// Content converters
const contentConverters = {
    '.md': async (filePath) => {
        const content = await fs.readFile(filePath, 'utf-8');
        const html = marked(content, {
            gfm: true,
            breaks: true,
            headerIds: true,
            mangle: false
        });
        
        const title = path.basename(filePath, '.md').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return getHTMLTemplate(title, html, filePath);
    },
    
    '.txt': async (filePath) => {
        const content = await fs.readFile(filePath, 'utf-8');
        const htmlContent = content
            .split('\n')
            .map(line => `<p>${line.trim() || '&nbsp;'}</p>`)
            .join('\n');
        
        const title = path.basename(filePath, '.txt').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return getHTMLTemplate(title, htmlContent, filePath);
    },
    
    '.html': async (filePath) => {
        return await fs.readFile(filePath, 'utf-8');
    }
};

// PDF conversion methods
const conversionMethods = {
    puppeteer: async (htmlContent, outputPath) => {
        let browser = null;
        try {
            browser = await puppeteer.launch(CONFIG.puppeteerOptions);
            const page = await browser.newPage();
            
            await page.setContent(htmlContent, {
                waitUntil: ['load', 'networkidle0'],
                timeout: 30000
            });
            
            await page.pdf({
                path: outputPath,
                ...CONFIG.pdfOptions
            });
            
            return { success: true, method: 'puppeteer' };
        } catch (error) {
            throw new Error(`Puppeteer conversion failed: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    },
    
    adobe: async (htmlContent, outputPath) => {
        // Adobe SDK integration - using our existing real API setup
        try {
            const { ServicePrincipalCredentials, PDFServices, CreatePDFJob, CreatePDFParams, CreatePDFResult, SDKError, ServiceUsageError, ServiceApiError } = require('@adobe/pdfservices-node-sdk');
            
            // Create temporary HTML file
            const tempHtmlPath = outputPath.replace('.pdf', '_temp.html');
            await fs.writeFile(tempHtmlPath, htmlContent);
            
            // Setup credentials
            const credentials = new ServicePrincipalCredentials({
                clientId: process.env.PDF_SERVICES_CLIENT_ID,
                clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
            });
            
            // Create PDF Services instance
            const pdfServices = new PDFServices({ credentials });
            
            // Create asset from HTML file
            const inputAsset = await pdfServices.upload({
                readStream: require('fs').createReadStream(tempHtmlPath),
                mimeType: 'text/html'
            });
            
            // Create PDF job
            const params = new CreatePDFParams({
                htmlToPDFParams: {
                    pageLayout: {
                        pageSize: 'A4'
                    }
                }
            });
            
            const job = new CreatePDFJob({ inputAsset, params });
            
            // Submit job and get result
            const pollingURL = await pdfServices.submit({ job });
            const pdfServicesResponse = await pdfServices.getJobResult({
                pollingURL,
                resultType: CreatePDFResult
            });
            
            // Save result to output path
            const resultAsset = pdfServicesResponse.result.asset;
            const streamAsset = await pdfServices.getContent({ asset: resultAsset });
            
            const writeStream = require('fs').createWriteStream(outputPath);
            streamAsset.readStream.pipe(writeStream);
            
            // Wait for write to complete
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            
            // Cleanup temp file
            await fs.unlink(tempHtmlPath).catch(() => {});
            
            return { success: true, method: 'adobe' };
        } catch (error) {
            throw new Error(`Adobe SDK conversion failed: ${error.message}`);
        }
    }
};

// Main conversion function
async function convertFile(fileInfo, outputDir, progress) {
    const { fullPath, relativePath, extension } = fileInfo;
    
    try {
        // Ensure output directory exists
        const outputPath = path.join(outputDir, relativePath.replace(extension, '.pdf'));
        const outputDirPath = path.dirname(outputPath);
        await fs.mkdir(outputDirPath, { recursive: true });
        
        // Skip if already exists
        try {
            await fs.access(outputPath);
            logger.info(`Skipping ${relativePath} - PDF already exists`);
            progress.update(true);
            return;
        } catch {
            // File doesn't exist, proceed with conversion
        }
        
        // Convert content to HTML
        const converter = contentConverters[extension];
        if (!converter) {
            throw new Error(`No converter available for ${extension}`);
        }
        
        const htmlContent = await converter(fullPath);
        
        // Try conversion methods in order of preference
        let conversionError = null;
        for (const method of CONFIG.conversionMethods) {
            try {
                const result = await conversionMethods[method](htmlContent, outputPath);
                logger.success(`Converted ${relativePath} using ${result.method}`);
                progress.update(true);
                return;
            } catch (error) {
                conversionError = error;
                logger.warn(`${method} failed for ${relativePath}: ${error.message}`);
                continue;
            }
        }
        
        throw conversionError || new Error('All conversion methods failed');
        
    } catch (error) {
        logger.error(`Failed to convert ${relativePath}: ${error.message}`);
        progress.update(false);
    }
}

// Main execution function
async function main() {
    try {
        logger.info('Starting batch PDF conversion for generated documents...');
        
        // Load environment variables for Adobe
        require('dotenv').config({ path: '.env.adobe' });
        
        // Ensure output directory exists
        await fs.mkdir(CONFIG.outputDir, { recursive: true });
        
        // Find all files to convert
        logger.info(`Scanning ${CONFIG.inputDir} for supported files...`);
        const files = await findFiles(CONFIG.inputDir, CONFIG.supportedExtensions);
        
        if (files.length === 0) {
            logger.warn('No supported files found for conversion');
            return;
        }
        
        logger.info(`Found ${files.length} files to convert`);
        
        // Group files by extension for statistics
        const filesByExtension = files.reduce((acc, file) => {
            acc[file.extension] = (acc[file.extension] || 0) + 1;
            return acc;
        }, {});
        
        logger.info('File breakdown:');
        Object.entries(filesByExtension).forEach(([ext, count]) => {
            logger.info(`  ${ext}: ${count} files`);
        });
        
        // Initialize progress tracking
        const progress = new ProgressTracker(files.length);
        
        // Process files with concurrency control
        const concurrency = 3; // Process 3 files at once to avoid overwhelming the system
        const chunks = [];
        for (let i = 0; i < files.length; i += concurrency) {
            chunks.push(files.slice(i, i + concurrency));
        }
        
        logger.info(`Processing files in chunks of ${concurrency}...`);
        
        for (const chunk of chunks) {
            await Promise.all(
                chunk.map(file => convertFile(file, CONFIG.outputDir, progress))
            );
        }
        
        // Final summary
        const summary = progress.getSummary();
        logger.info('\n=== CONVERSION COMPLETE ===');
        logger.info(`Total files: ${summary.total}`);
        logger.info(`Successfully converted: ${summary.completed}`);
        logger.info(`Failed: ${summary.failed}`);
        logger.info(`Success rate: ${summary.successRate}%`);
        logger.info(`Total time: ${summary.totalTime}s`);
        logger.info(`Output directory: ${CONFIG.outputDir}`);
        
        if (summary.failed > 0) {
            logger.warn(`${summary.failed} files failed to convert. Check the logs above for details.`);
        } else {
            logger.success('All files converted successfully!');
        }
        
    } catch (error) {
        logger.error(`Batch conversion failed: ${error.message}`);
        process.exit(1);
    }
}

// CLI interface
if (require.main === module) {
    main().catch(error => {
        logger.error(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    main,
    findFiles,
    convertFile,
    CONFIG
};
