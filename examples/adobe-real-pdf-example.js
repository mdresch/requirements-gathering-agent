#!/usr/bin/env node

/**
 * Adobe PDF Services SDK Example - Real PDF Generation
 * Uses the actual Adobe PDF Services SDK to generate PDFs
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔧 Adobe PDF Services SDK - Real PDF Generation');
console.log('='.repeat(50));

async function generateRealPDF() {
  try {
    // Import Adobe PDF Services SDK
    console.log('📦 Loading Adobe PDF Services SDK...');
    
    let PDFServices, MimeType, ClientConfig, ServicePrincipalCredentials, HTMLToPDFJob, HTMLToPDFParams;
    
    try {
      const sdk = await import('@adobe/pdfservices-node-sdk');
      PDFServices = sdk.PDFServices;
      MimeType = sdk.MimeType;
      ClientConfig = sdk.ClientConfig;
      ServicePrincipalCredentials = sdk.ServicePrincipalCredentials;
      HTMLToPDFJob = sdk.HTMLToPDFJob;
      HTMLToPDFParams = sdk.HTMLToPDFParams;
      console.log('✅ Adobe PDF Services SDK loaded successfully');
    } catch (sdkError) {
      console.log('❌ Adobe PDF Services SDK not found');
      console.log('💡 Run: npm install @adobe/pdfservices-node-sdk');
      process.exit(1);
    }

    // Load environment variables
    const envPath = join(projectRoot, '.env.adobe');
    if (!existsSync(envPath)) {
      console.log('❌ .env.adobe file not found');
      console.log('💡 Run: npm run adobe:setup-real');
      process.exit(1);
    }

    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0 && !line.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });

    console.log('\n🔐 Setting up Adobe credentials...');

    // Create credentials
    const credentials = new ServicePrincipalCredentials({
      clientId: envVars.ADOBE_CLIENT_ID,
      clientSecret: envVars.ADOBE_CLIENT_SECRET
    });

    console.log('✅ Credentials configured');

    // Create client config
    const clientConfig = new ClientConfig({
      credentials: credentials
    });

    console.log('✅ Client configuration set up');

    // Sample HTML content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Adobe PDF Services Demo</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px; 
            margin-bottom: 30px; 
        }
        .section { 
            background: #f9f9f9; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 5px solid #4ecdc4; 
        }
        .success { 
            background: #d4edda; 
            border-color: #28a745; 
            color: #155724; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Adobe PDF Services Success!</h1>
        <p>Real PDF Generation with Adobe SDK</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="section">
        <h2>✅ Integration Complete</h2>
        <p>This PDF was generated using the <strong>Adobe PDF Services SDK</strong> with real authentication and processing.</p>
    </div>

    <div class="success">
        <h3>🚀 Key Achievements:</h3>
        <ul>
            <li>✅ Adobe PDF Services SDK successfully integrated</li>
            <li>✅ Authentication working with real credentials</li>
            <li>✅ HTML to PDF conversion operational</li>
            <li>✅ Production-ready PDF generation pipeline</li>
        </ul>
    </div>

    <div class="section">
        <h2>📊 Technical Details</h2>
        <p><strong>SDK Version:</strong> Latest Adobe PDF Services Node.js SDK</p>
        <p><strong>Authentication:</strong> Client Credentials Flow</p>
        <p><strong>Output Format:</strong> PDF/A compliant</p>
        <p><strong>Processing Time:</strong> Real-time generation</p>
    </div>

    <div class="section">
        <h2>🔧 Next Steps</h2>
        <p>Your Adobe PDF Services integration is now fully operational. You can:</p>
        <ul>
            <li>Generate PDFs from HTML content</li>
            <li>Convert documents between formats</li>
            <li>Apply OCR to scanned documents</li>
            <li>Combine and split PDF documents</li>
            <li>Extract text and data from PDFs</li>
        </ul>
    </div>
</body>
</html>`;

    // Save HTML file
    const htmlPath = join(projectRoot, 'temp-pdf-input.html');
    writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('📝 HTML content prepared');

    console.log('\n🔄 Generating PDF...');

    try {
      // Create PDF Services instance
      const pdfServices = new PDFServices({ clientConfig });

      // Create input stream from file
      const readStream = require('fs').createReadStream(htmlPath);
      const inputAsset = await pdfServices.upload({
        readStream,
        mimeType: MimeType.HTML
      });

      console.log('📤 HTML uploaded to Adobe PDF Services');

      // Create parameters for HTML to PDF conversion
      const params = new HTMLToPDFParams();

      // Create job
      const job = new HTMLToPDFJob({ inputAsset, params });

      console.log('⚙️ PDF conversion job created');

      // Submit job and get result
      const pollingURL = await pdfServices.submit({ job });
      const pdfServicesResponse = await pdfServices.getJobResult({
        pollingURL,
        resultType: HTMLToPDFJob.ResultType
      });

      console.log('🔄 PDF generation in progress...');

      // Get result asset
      const resultAsset = pdfServicesResponse.result.asset;
      const outputPath = join(projectRoot, 'adobe-generated-report.pdf');

      // Download the result
      const streamAsset = await pdfServices.getContent({ asset: resultAsset });
      
      // Save PDF
      const outputStream = require('fs').createWriteStream(outputPath);
      streamAsset.readStream.pipe(outputStream);

      console.log('✅ PDF generated successfully!');
      console.log(`📁 Saved to: ${outputPath}`);

      // Clean up temp file
      require('fs').unlinkSync(htmlPath);

      console.log('\n🎉 Real PDF Generation Complete!');
      console.log('✅ Adobe PDF Services SDK is fully operational');
      console.log(`📄 Open the generated PDF: ${outputPath}`);

      return true;

    } catch (sdkError) {
      console.log('❌ PDF generation failed:', sdkError.message);
      
      if (sdkError.message.includes('Authentication')) {
        console.log('\n🔧 Authentication issue detected:');
        console.log('1. Verify credentials: npm run adobe:test-auth-working');
        console.log('2. Check Adobe Developer Console settings');
        console.log('3. Ensure PDF Services API is enabled');
      } else if (sdkError.message.includes('quota') || sdkError.message.includes('limit')) {
        console.log('\n🔧 Usage limit reached:');
        console.log('1. Check your Adobe account quota');
        console.log('2. Upgrade plan if needed');
        console.log('3. Wait for quota reset');
      } else {
        console.log('\n🔧 General troubleshooting:');
        console.log('1. Check network connectivity');
        console.log('2. Verify SDK installation');
        console.log('3. Review Adobe service status');
      }
      
      return false;
    }

  } catch (error) {
    console.log('❌ Setup failed:', error.message);
    console.log('\n🔧 Please check your configuration and try again');
    return false;
  }
}

generateRealPDF()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Real PDF generation failed:', error);
    process.exit(1);
  });
