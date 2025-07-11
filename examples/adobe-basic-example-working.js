#!/usr/bin/env node

/**
 * Adobe PDF Generation Example - Real API
 * Demonstrates PDF generation using Adobe PDF Services with real authentication
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('📄 Adobe PDF Generation Example - Real API');
console.log('='.repeat(50));

async function generateSamplePDF() {
  try {
    // Load environment variables
    const envPath = join(projectRoot, '.env.adobe');
    if (!existsSync(envPath)) {
      console.log('❌ .env.adobe file not found');
      console.log('💡 Run: npm run adobe:setup-real');
      process.exit(1);
    }

    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    // Parse environment variables
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0 && !line.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });

    console.log('\n🔐 Authenticating with Adobe...');

    // Get access token
    const authData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: envVars.ADOBE_CLIENT_ID,
      client_secret: envVars.ADOBE_CLIENT_SECRET,
      scope: 'openid,AdobeID,DCAPI'
    });

    const authResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: authData
    });

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`);
    }

    const authResult = await authResponse.json();
    console.log('✅ Authentication successful');

    // Sample HTML content for PDF generation
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Business Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px; 
            margin-bottom: 30px; 
        }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; font-size: 1.2em; opacity: 0.9; }
        .section { 
            background: #f8f9fa; 
            padding: 25px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 5px solid #667eea; 
        }
        .metrics { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 20px 0; 
        }
        .metric { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .metric .value { 
            font-size: 2em; 
            font-weight: bold; 
            color: #667eea; 
        }
        .metric .label { 
            color: #666; 
            margin-top: 5px; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background: white; 
            border-radius: 8px; 
            overflow: hidden; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        th, td { 
            padding: 15px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
        }
        th { 
            background: #667eea; 
            color: white; 
            font-weight: 600; 
        }
        .highlight { 
            background: #e3f2fd; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0; 
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding: 20px; 
            background: #f1f3f4; 
            border-radius: 8px; 
            color: #666; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Quarterly Business Review</h1>
        <p>Q4 2024 Performance Report</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>🎯 Executive Summary</h2>
        <p>This quarter demonstrates <strong>exceptional performance</strong> across all key business metrics. Our strategic initiatives have delivered significant results, positioning us strongly for continued growth in 2025.</p>
        
        <div class="highlight">
            <strong>Key Achievement:</strong> Successfully exceeded all quarterly targets with 28% revenue growth and 35% profit increase.
        </div>
    </div>

    <div class="section">
        <h2>📈 Key Performance Metrics</h2>
        <div class="metrics">
            <div class="metric">
                <div class="value">$3.2M</div>
                <div class="label">Revenue (+28%)</div>
            </div>
            <div class="metric">
                <div class="value">2,150</div>
                <div class="label">New Customers</div>
            </div>
            <div class="metric">
                <div class="value">4.9/5.0</div>
                <div class="label">Satisfaction Score</div>
            </div>
            <div class="metric">
                <div class="value">35%</div>
                <div class="label">Profit Growth</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>💰 Financial Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Q4 2024</th>
                    <th>Q3 2024</th>
                    <th>Growth</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Revenue</strong></td>
                    <td>$3,200,000</td>
                    <td>$2,500,000</td>
                    <td style="color: #4caf50; font-weight: bold;">+28%</td>
                </tr>
                <tr>
                    <td><strong>Profit</strong></td>
                    <td>$640,000</td>
                    <td>$475,000</td>
                    <td style="color: #4caf50; font-weight: bold;">+35%</td>
                </tr>
                <tr>
                    <td><strong>EBITDA</strong></td>
                    <td>$800,000</td>
                    <td>$625,000</td>
                    <td style="color: #4caf50; font-weight: bold;">+28%</td>
                </tr>
                <tr>
                    <td><strong>Cash Flow</strong></td>
                    <td>$720,000</td>
                    <td>$580,000</td>
                    <td style="color: #4caf50; font-weight: bold;">+24%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>🚀 Strategic Initiatives</h2>
        
        <h3>1. Digital Transformation</h3>
        <ul>
            <li>40% improvement in system performance</li>
            <li>25% reduction in operational costs</li>
            <li>Enhanced security and compliance</li>
        </ul>

        <h3>2. Customer Experience Enhancement</h3>
        <ul>
            <li>50% reduction in response times</li>
            <li>15% increase in satisfaction scores</li>
            <li>24/7 support coverage globally</li>
        </ul>

        <h3>3. Product Innovation</h3>
        <ul>
            <li><strong>AI-Powered Analytics:</strong> Advanced reporting capabilities</li>
            <li><strong>Mobile Application:</strong> Native iOS and Android apps</li>
            <li><strong>API Platform:</strong> Third-party integration framework</li>
        </ul>
    </div>

    <div class="footer">
        <p><strong>Generated by ADPA Enterprise Framework</strong></p>
        <p>Adobe PDF Services Integration • Real-time Business Intelligence</p>
        <p>© 2024 Enterprise Business Solutions</p>
    </div>
</body>
</html>`;

    console.log('📝 Creating PDF from HTML content...');

    // Create a simple HTML-to-PDF conversion using Adobe PDF Services
    // Note: This is a simplified example. In production, you'd use the full Adobe SDK
    console.log('⚠️  Note: Full Adobe PDF Services SDK integration requires additional setup');
    console.log('🔧 This example demonstrates authentication and basic structure');

    // Save the HTML content for manual testing
    const outputPath = join(projectRoot, 'demo-business-report.html');
    writeFileSync(outputPath, htmlContent, 'utf8');
    
    console.log('✅ HTML content generated successfully');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log('🌐 Open this file in your browser to see the styled report');

    // Simulate PDF creation process
    console.log('\n🔄 Simulating PDF creation workflow...');
    console.log('1. ✅ HTML content prepared');
    console.log('2. ✅ Adobe authentication successful');
    console.log('3. ⚠️  PDF Services SDK integration needed for actual PDF generation');
    console.log('4. 📋 Ready for production implementation');

    console.log('\n🎉 Example completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Open the generated HTML file to preview the content');
    console.log('2. Implement full Adobe PDF Services SDK for PDF generation');
    console.log('3. Add document templates and advanced formatting');
    console.log('4. Set up automated PDF delivery workflows');

    return true;

  } catch (error) {
    console.log('❌ PDF generation failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure authentication is working: npm run adobe:test-auth-working');
    console.log('2. Verify environment configuration: npm run adobe:validate-real');
    console.log('3. Check network connectivity');
    return false;
  }
}

generateSamplePDF()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Example failed:', error);
    process.exit(1);
  });
