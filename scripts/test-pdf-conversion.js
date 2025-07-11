#!/usr/bin/env node

/**
 * Simple test for batch PDF conversion
 * Tests conversion of a few files first
 */

import { promises as fs } from 'fs';
import path from 'path';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

// Simple configuration
const CONFIG = {
    inputDir: './generated-documents',
    outputDir: './generated-documents-pdf-test',
    maxFiles: 3 // Test with just 3 files first
};

async function testConversion() {
    console.log('🚀 Starting PDF conversion test...');
    
    try {
        // Ensure output directory exists
        await fs.mkdir(CONFIG.outputDir, { recursive: true });
        console.log('✅ Output directory created');
        
        // Find a few test files
        const testFiles = [];
        
        // Look for README.md first
        const readmePath = path.join(CONFIG.inputDir, 'README.md');
        try {
            await fs.access(readmePath);
            testFiles.push({
                path: readmePath,
                name: 'README.md',
                type: 'markdown'
            });
            console.log('✅ Found README.md');
        } catch {
            console.log('⚠️ README.md not found');
        }
        
        // Find other markdown files
        const entries = await fs.readdir(CONFIG.inputDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.md') && testFiles.length < CONFIG.maxFiles) {
                const filePath = path.join(CONFIG.inputDir, entry.name);
                testFiles.push({
                    path: filePath,
                    name: entry.name,
                    type: 'markdown'
                });
                console.log(`✅ Found ${entry.name}`);
            }
        }
        
        if (testFiles.length === 0) {
            console.log('❌ No test files found');
            return;
        }
        
        console.log(`\n📄 Testing conversion of ${testFiles.length} files...\n`);
        
        // Convert each test file
        for (const file of testFiles) {
            console.log(`Converting ${file.name}...`);
            
            try {
                // Read and process content
                const content = await fs.readFile(file.path, 'utf-8');
                const title = path.basename(file.name, '.md').replace(/[-_]/g, ' ');
                
                // Convert markdown to HTML
                const htmlContent = marked(content);
                
                // Create professional HTML
                const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 40px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #3498db; margin: 0; padding-left: 15px; color: #666; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p><em>Generated: ${new Date().toISOString()}</em></p>
    ${htmlContent}
</body>
</html>`;
                
                // Convert to PDF using Puppeteer
                const browser = await puppeteer.launch({ 
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                
                const page = await browser.newPage();
                await page.setContent(fullHTML, { waitUntil: 'networkidle0' });
                
                const outputPath = path.join(CONFIG.outputDir, file.name.replace('.md', '.pdf'));
                await page.pdf({
                    path: outputPath,
                    format: 'A4',
                    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
                    printBackground: true
                });
                
                await browser.close();
                
                // Check file was created and get size
                const stats = await fs.stat(outputPath);
                const sizeKB = Math.round(stats.size / 1024);
                
                console.log(`✅ ${file.name} → ${path.basename(outputPath)} (${sizeKB} KB)`);
                
            } catch (error) {
                console.log(`❌ Failed to convert ${file.name}: ${error.message}`);
            }
        }
        
        console.log('\n🎉 Test conversion complete!');
        console.log(`📁 Check output in: ${CONFIG.outputDir}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run test
testConversion();
