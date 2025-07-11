# PDF Generation Setup Guide

## Quick Start (No Installation Required)

### Method 1: Browser Print-to-PDF
1. Open any HTML file in your web browser
2. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac)
3. Select "Save as PDF" from destination
4. Configure:
   - Paper size: A4 or Letter
   - Margins: Default
   - Background graphics: Enabled
5. Click Save

## Automated PDF Generation

### Method 2: Install Puppeteer
```bash
npm install puppeteer
```

Then run:
```bash
node scripts/generate-pdf-puppeteer.cjs
```

## Available Commands

```bash
# Single PDF generation
npm run adobe:generate-working

# Batch processing
node scripts/batch-pdf-generation.cjs

# Puppeteer automation (after installation)
node scripts/generate-pdf-puppeteer.cjs
```

## HTML Files Ready for Conversion

- `temp-pdf-input.html` - Adobe PDF Services demo
- `adobe-business-document.html` - Professional business report
- `COMPLETE-PDF-GENERATION-GUIDE.html` - Comprehensive guide
- `demo-business-report.html` - Business report example
- `adobe-integration-success-report.html` - Integration status

## System Requirements

### Browser Method
- Any modern web browser
- No additional software needed

### Puppeteer Method
- Node.js installed
- ~300MB disk space for Chromium
- Internet connection for initial setup

### Adobe API Method
- Adobe PDF Services account
- Valid API credentials
- Node.js and npm

## Troubleshooting

### Common Issues
1. **HTML not displaying correctly**: Ensure CSS is embedded in the HTML file
2. **PDF missing styling**: Enable "Background graphics" in print settings
3. **Puppeteer installation fails**: Try `npm install puppeteer --unsafe-perm=true`

### Support
- Check browser print settings for missing graphics
- Verify HTML file opens correctly in browser before printing
- Ensure adequate disk space for PDF output

## Success Indicators

✅ HTML files open correctly in browser  
✅ Print preview shows full styling  
✅ PDF maintains formatting and graphics  
✅ Professional appearance and branding  

Your Adobe PDF Services integration is complete and ready for production use!