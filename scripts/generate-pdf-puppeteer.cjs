#!/usr/bin/env node

/**
 * Puppeteer PDF Generator
 * Automatically converts HTML files to PDF using headless Chrome
 */

const fs = require('fs');
const path = require('path');

async function generatePDFsWithPuppeteer() {
    try {
        console.log('🔧 Loading Puppeteer...');
        const puppeteer = require('puppeteer');
        
        console.log('🚀 Starting headless browser...');
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Find all HTML files in project root
        const projectRoot = path.join(__dirname, '..');
        const htmlFiles = fs.readdirSync(projectRoot)
            .filter(file => file.endsWith('.html'))
            .map(file => path.join(projectRoot, file));
        
        console.log(`📄 Found ${htmlFiles.length} HTML files to convert`);
        
        for (const htmlFile of htmlFiles) {
            try {
                const fileName = path.basename(htmlFile, '.html');
                const pdfPath = path.join(projectRoot, `${fileName}.pdf`);
                
                console.log(`🔄 Converting: ${fileName}.html`);
                
                const htmlContent = fs.readFileSync(htmlFile, 'utf8');
                await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
                
                await page.pdf({
                    path: pdfPath,
                    format: 'A4',
                    printBackground: true,
                    margin: {
                        top: '0.75in',
                        right: '0.75in',
                        bottom: '0.75in',
                        left: '0.75in'
                    }
                });
                
                console.log(`✅ Generated: ${fileName}.pdf`);
                
            } catch (fileError) {
                console.log(`❌ Failed to convert ${htmlFile}: ${fileError.message}`);
            }
        }
        
        await browser.close();
        
        console.log('\n🎉 PDF generation complete!');
        console.log(`📁 Generated ${htmlFiles.length} PDF files`);
        
    } catch (error) {
        if (error.message.includes('Cannot find module')) {
            console.log('❌ Puppeteer not installed');
            console.log('💡 Install with: npm install puppeteer');
        } else {
            console.log('❌ PDF generation failed:', error.message);
        }
    }
}

generatePDFsWithPuppeteer();