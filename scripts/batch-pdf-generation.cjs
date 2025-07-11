#!/usr/bin/env node

/**
 * Batch PDF Generation Script
 * Processes multiple HTML files using different methods
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

async function batchGeneratePDFs() {
    console.log('📦 Batch PDF Generation');
    console.log('='.repeat(50));
    
    const htmlFiles = [
    "adobe-business-document.html",
    "adobe-env-var-success.html",
    "adobe-fixed-test.html",
    "adobe-integration-success-report.html",
    "adobe-ultimate-success.html",
    "COMPLETE-PDF-GENERATION-GUIDE.html",
    "demo-business-report.html",
    "temp-pdf-input.html",
    "test-cors.html"
];
    
    console.log(`📄 Found ${htmlFiles.length} HTML files to process`);
    
    // Try Puppeteer first
    try {
        console.log('🤖 Attempting Puppeteer generation...');
        const puppeteer = require('puppeteer');
        
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        for (const htmlFile of htmlFiles) {
            try {
                const htmlPath = path.join(projectRoot, htmlFile);
                const pdfPath = path.join(projectRoot, `batch-${path.basename(htmlFile, '.html')}.pdf`);
                
                const htmlContent = fs.readFileSync(htmlPath, 'utf8');
                await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
                
                await page.pdf({
                    path: pdfPath,
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
                });
                
                console.log(`✅ Generated: ${pdfPath}`);
                
            } catch (fileError) {
                console.log(`⚠️  Skipped ${htmlFile}: ${fileError.message}`);
            }
        }
        
        await browser.close();
        console.log('🎉 Batch PDF generation complete!');
        
    } catch (puppeteerError) {
        console.log('⚠️  Puppeteer not available, creating manual instructions...');
        
        // Create batch instructions file
        const instructions = `
# Batch PDF Generation Instructions

## HTML Files Ready for Conversion:
${htmlFiles.map(file => `- ${file}`).join('\n')}

## Method 1: Browser Print-to-PDF
1. Open each HTML file in your browser
2. Press Ctrl+P (Windows) or Cmd+P (Mac)
3. Select "Save as PDF"
4. Configure settings: A4 paper, default margins, background graphics enabled
5. Save with descriptive filename

## Method 2: Install Puppeteer for Automation
\`\`\`bash
npm install puppeteer
node scripts/generate-pdf-puppeteer.cjs
\`\`\`

## Method 3: Use Online Converters
- Upload HTML files to online HTML-to-PDF converters
- Download resulting PDF files
- Ensure privacy and security for business documents

## Generated Files Location:
All PDF files will be saved in the project root directory.
`;
        
        const instructionsPath = path.join(projectRoot, 'BATCH-PDF-INSTRUCTIONS.md');
        fs.writeFileSync(instructionsPath, instructions, 'utf8');
        
        console.log(`📋 Instructions created: ${instructionsPath}`);
        console.log('💡 Install Puppeteer for automated batch generation');
    }
}

batchGeneratePDFs();