#!/usr/bin/env node

/**
 * Professional PDF Document Generator
 * Create custom business documents with Adobe PDF Services
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('📄 Professional PDF Document Generator');
console.log('='.repeat(50));

// Document templates
const documentTemplates = {
  businessProposal: generateBusinessProposal,
  monthlyReport: generateMonthlyReport,
  invoice: generateInvoice,
  executiveSummary: generateExecutiveSummary
};

async function generateDocument(type = 'businessProposal', customData = {}) {
  try {
    console.log(`🎯 Generating ${type} document...`);

    // Load environment and authenticate
    const { accessToken } = await authenticateWithAdobe();
    
    // Generate document based on type
    const documentData = {
      title: customData.title || 'Professional Business Document',
      clientName: customData.clientName || 'Valued Client',
      date: new Date().toLocaleDateString(),
      companyName: customData.companyName || 'Your Company Name',
      ...customData
    };

    const generator = documentTemplates[type];
    if (!generator) {
      throw new Error(`Unknown document type: ${type}`);
    }

    const htmlContent = generator(documentData);
    const filename = `${type}-${Date.now()}.html`;
    const outputPath = join(projectRoot, filename);
    
    writeFileSync(outputPath, htmlContent, 'utf8');
    
    console.log('✅ Document generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log('🌐 Open in browser to preview, then print to PDF');

    return { success: true, path: outputPath, filename };

  } catch (error) {
    console.log('❌ Document generation failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function authenticateWithAdobe() {
  const envPath = join(projectRoot, '.env.adobe');
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !line.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  const authResponse = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: envVars.ADOBE_CLIENT_ID,
      client_secret: envVars.ADOBE_CLIENT_SECRET,
      scope: 'openid,AdobeID,DCAPI'
    })
  });

  const authResult = await authResponse.json();
  return { accessToken: authResult.access_token };
}

function generateBusinessProposal(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Business Proposal - ${data.clientName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            background: #f8f9fa;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1); 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px; 
            text-align: center; 
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .content { padding: 40px; }
        .section { margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 8px; border-left: 5px solid #667eea; }
        .section h2 { color: #667eea; margin-bottom: 15px; font-size: 1.5em; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .service { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .service h3 { color: #667eea; margin-bottom: 10px; }
        .pricing { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0; }
        .pricing h3 { font-size: 2em; margin-bottom: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
        .timeline { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .timeline-item { display: flex; align-items: center; margin: 15px 0; }
        .timeline-marker { width: 20px; height: 20px; background: #667eea; border-radius: 50%; margin-right: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Business Proposal</h1>
            <p>For: ${data.clientName}</p>
            <p>From: ${data.companyName}</p>
            <p>Date: ${data.date}</p>
        </div>

        <div class="content">
            <div class="section">
                <h2>🎯 Executive Summary</h2>
                <p>We are pleased to present this comprehensive proposal for <strong>${data.clientName}</strong>. Our solution will deliver measurable results through innovative technology and proven methodologies.</p>
                <p>This proposal outlines our approach to help you achieve your business objectives while maximizing ROI and minimizing risk.</p>
            </div>

            <div class="section">
                <h2>🚀 Proposed Services</h2>
                <div class="services">
                    <div class="service">
                        <h3>📊 Strategic Consulting</h3>
                        <p>Comprehensive business analysis and strategic planning to optimize your operations and identify growth opportunities.</p>
                    </div>
                    <div class="service">
                        <h3>⚙️ System Integration</h3>
                        <p>Seamless integration of new technologies with your existing infrastructure to improve efficiency and productivity.</p>
                    </div>
                    <div class="service">
                        <h3>📈 Performance Optimization</h3>
                        <p>Continuous monitoring and optimization to ensure peak performance and sustainable growth.</p>
                    </div>
                    <div class="service">
                        <h3>🛡️ Security & Compliance</h3>
                        <p>Robust security measures and compliance frameworks to protect your business and data.</p>
                    </div>
                </div>
            </div>

            <div class="pricing">
                <h3>💰 Investment</h3>
                <p style="font-size: 1.2em; margin: 20px 0;">Total Project Cost: <strong>$${data.totalCost || '25,000'}</strong></p>
                <p>Flexible payment terms available • ROI expected within 6 months</p>
            </div>

            <div class="section">
                <h2>⏱️ Project Timeline</h2>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div><strong>Week 1-2:</strong> Discovery & Planning Phase</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div><strong>Week 3-6:</strong> Implementation & Development</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div><strong>Week 7-8:</strong> Testing & Quality Assurance</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div><strong>Week 9-10:</strong> Deployment & Training</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div><strong>Week 11-12:</strong> Support & Optimization</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🏆 Why Choose Us</h2>
                <ul style="list-style: none; padding-left: 0;">
                    <li style="margin: 10px 0;"><strong>✅ Proven Track Record:</strong> 500+ successful projects delivered</li>
                    <li style="margin: 10px 0;"><strong>✅ Expert Team:</strong> Certified professionals with 10+ years experience</li>
                    <li style="margin: 10px 0;"><strong>✅ Quality Guarantee:</strong> 100% satisfaction guarantee with ongoing support</li>
                    <li style="margin: 10px 0;"><strong>✅ Competitive Pricing:</strong> Best value for enterprise-grade solutions</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>Ready to Get Started?</strong></p>
            <p>Contact us today to discuss this proposal and begin your transformation journey.</p>
            <p>${data.companyName} • Professional Business Solutions</p>
        </div>
    </div>
</body>
</html>`;
}

function generateMonthlyReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Monthly Business Report - ${data.month || 'Current Month'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; background: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { background: white; padding: 25px; border-radius: 10px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-top: 4px solid #2ecc71; }
        .metric .value { font-size: 2.2em; font-weight: bold; color: #2ecc71; margin-bottom: 5px; }
        .metric .label { color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; }
        .section { margin: 30px; padding: 25px; background: #f8f9fa; border-radius: 8px; }
        .section h2 { color: #2ecc71; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #ecf0f1; }
        th { background: #2ecc71; color: white; }
        .positive { color: #27ae60; font-weight: bold; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Monthly Business Report</h1>
            <p>${data.month || 'Current Month'} ${data.year || new Date().getFullYear()}</p>
            <p>Generated: ${data.date}</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <div class="value">$${data.revenue || '125,000'}</div>
                <div class="label">Monthly Revenue</div>
            </div>
            <div class="metric">
                <div class="value">${data.customers || '2,150'}</div>
                <div class="label">New Customers</div>
            </div>
            <div class="metric">
                <div class="value">${data.growth || '12%'}</div>
                <div class="label">Growth Rate</div>
            </div>
            <div class="metric">
                <div class="value">${data.satisfaction || '4.8'}/5</div>
                <div class="label">Satisfaction</div>
            </div>
        </div>

        <div class="section">
            <h2>📈 Performance Summary</h2>
            <p>This month showed <strong>exceptional performance</strong> across all key metrics. Revenue increased by <span class="positive">${data.growth || '12%'}</span> compared to last month, driven by strong customer acquisition and improved retention rates.</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>This Month</th>
                        <th>Last Month</th>
                        <th>Change</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Revenue</td>
                        <td>$${data.revenue || '125,000'}</td>
                        <td>$${data.lastRevenue || '112,000'}</td>
                        <td class="positive">+${data.revenueChange || '11.6%'}</td>
                    </tr>
                    <tr>
                        <td>New Customers</td>
                        <td>${data.customers || '2,150'}</td>
                        <td>${data.lastCustomers || '1,890'}</td>
                        <td class="positive">+${data.customerChange || '13.8%'}</td>
                    </tr>
                    <tr>
                        <td>Conversion Rate</td>
                        <td>${data.conversion || '3.2%'}</td>
                        <td>${data.lastConversion || '2.8%'}</td>
                        <td class="positive">+${data.conversionChange || '14.3%'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🎯 Key Achievements</h2>
            <ul style="list-style: none; padding-left: 0;">
                <li style="margin: 10px 0;">✅ <strong>Revenue Target:</strong> Exceeded monthly goal by ${data.targetExcess || '8%'}</li>
                <li style="margin: 10px 0;">✅ <strong>Customer Acquisition:</strong> Highest monthly acquisition in Q4</li>
                <li style="margin: 10px 0;">✅ <strong>Product Launch:</strong> Successfully launched 2 new features</li>
                <li style="margin: 10px 0;">✅ <strong>Team Expansion:</strong> Added 5 new team members</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>Monthly Report Generated by ${data.companyName || 'Business Intelligence System'}</strong></p>
            <p>Confidential Business Information • ${data.date}</p>
        </div>
    </div>
</body>
</html>`;
}

function generateInvoice(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${data.invoiceNumber || '#INV-001'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header h1 { color: #e74c3c; font-size: 2.5em; }
        .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .billing { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 30px 0; }
        .billing-section h3 { color: #2c3e50; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #ecf0f1; }
        th { background: #e74c3c; color: white; }
        .total { background: #2c3e50; color: white; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>📄 INVOICE</h1>
                <p>${data.companyName || 'Your Company Name'}</p>
            </div>
            <div style="text-align: right;">
                <h2 style="color: #e74c3c;">${data.invoiceNumber || '#INV-001'}</h2>
                <p>Date: ${data.date}</p>
                <p>Due: ${data.dueDate || 'Net 30'}</p>
            </div>
        </div>

        <div class="billing">
            <div class="billing-section">
                <h3>Bill To:</h3>
                <p><strong>${data.clientName}</strong></p>
                <p>${data.clientAddress || '123 Client Street'}</p>
                <p>${data.clientCity || 'Client City, State 12345'}</p>
                <p>${data.clientEmail || 'client@email.com'}</p>
            </div>
            <div class="billing-section">
                <h3>From:</h3>
                <p><strong>${data.companyName || 'Your Company'}</strong></p>
                <p>${data.companyAddress || '456 Business Ave'}</p>
                <p>${data.companyCity || 'Business City, State 67890'}</p>
                <p>${data.companyEmail || 'billing@company.com'}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Professional Consulting Services</td>
                    <td>40 hours</td>
                    <td>$150.00</td>
                    <td>$6,000.00</td>
                </tr>
                <tr>
                    <td>System Integration & Setup</td>
                    <td>1 project</td>
                    <td>$2,500.00</td>
                    <td>$2,500.00</td>
                </tr>
                <tr>
                    <td>Training & Documentation</td>
                    <td>8 hours</td>
                    <td>$125.00</td>
                    <td>$1,000.00</td>
                </tr>
                <tr style="border-top: 2px solid #2c3e50;">
                    <td colspan="3" class="total">TOTAL</td>
                    <td class="total">$${data.total || '9,500.00'}</td>
                </tr>
            </tbody>
        </table>

        <div class="invoice-details">
            <h3>Payment Terms & Notes</h3>
            <p><strong>Payment Terms:</strong> Net 30 days</p>
            <p><strong>Late Fee:</strong> 1.5% per month on overdue amounts</p>
            <p><strong>Payment Methods:</strong> Check, ACH Transfer, Wire Transfer</p>
            <p style="margin-top: 15px;"><strong>Thank you for your business!</strong> If you have any questions about this invoice, please contact us.</p>
        </div>

        <div class="footer">
            <p><strong>Invoice generated by Professional Billing System</strong></p>
            <p>This is a computer-generated invoice.</p>
        </div>
    </div>
</body>
</html>`;
}

function generateExecutiveSummary(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Executive Summary - ${data.title || 'Strategic Overview'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; background: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }
        .executive-highlight { background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%); padding: 30px; margin: 20px; border-radius: 15px; text-align: center; }
        .key-points { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding: 30px; }
        .point { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-left: 5px solid #8e44ad; }
        .point h3 { color: #8e44ad; margin-bottom: 10px; }
        .section { margin: 30px; padding: 25px; background: #f8f9fa; border-radius: 8px; }
        .section h2 { color: #8e44ad; margin-bottom: 15px; }
        .recommendations { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .recommendations li { margin: 10px 0; padding-left: 20px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Executive Summary</h1>
            <p>${data.title || 'Strategic Business Overview'}</p>
            <p>Prepared for: ${data.clientName || 'Executive Leadership'}</p>
            <p>Date: ${data.date}</p>
        </div>

        <div class="executive-highlight">
            <h2 style="margin: 0; color: #2c3e50;">🎯 Strategic Recommendation</h2>
            <p style="font-size: 1.2em; margin-top: 15px;">Immediate action required to capitalize on market opportunities and achieve 25% growth in the next quarter.</p>
        </div>

        <div class="key-points">
            <div class="point">
                <h3>📈 Market Position</h3>
                <p>Strong competitive advantage with 35% market share growth and expanding customer base across key demographics.</p>
            </div>
            <div class="point">
                <h3>💰 Financial Impact</h3>
                <p>Projected ROI of 150% within 12 months with break-even expected in month 6 of implementation.</p>
            </div>
            <div class="point">
                <h3>⚡ Operational Excellence</h3>
                <p>Streamlined processes resulting in 40% efficiency gains and reduced operational costs by $2.5M annually.</p>
            </div>
            <div class="point">
                <h3>🚀 Innovation Pipeline</h3>
                <p>Three breakthrough products in development, positioned to capture emerging market segments worth $50M.</p>
            </div>
        </div>

        <div class="section">
            <h2>🎯 Strategic Objectives</h2>
            <p>Our analysis reveals significant opportunities for accelerated growth and market expansion. The following strategic objectives will position the organization for sustained success:</p>
            
            <div class="recommendations">
                <h3 style="color: #8e44ad; margin-bottom: 15px;">Priority Initiatives:</h3>
                <ul style="list-style-type: none; padding: 0;">
                    <li>🏆 <strong>Market Expansion:</strong> Enter 3 new geographic markets within Q2</li>
                    <li>🔧 <strong>Digital Transformation:</strong> Complete technology upgrade by Q3</li>
                    <li>👥 <strong>Talent Acquisition:</strong> Hire 50 key personnel across critical roles</li>
                    <li>📊 <strong>Data Analytics:</strong> Implement advanced analytics platform for decision-making</li>
                    <li>🤝 <strong>Strategic Partnerships:</strong> Establish 5 key partnerships for market access</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h2>📊 Performance Metrics</h2>
            <p>Key performance indicators demonstrate strong business fundamentals and growth trajectory:</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background: #8e44ad; color: white;">
                        <th style="padding: 15px; text-align: left;">Metric</th>
                        <th style="padding: 15px; text-align: left;">Current</th>
                        <th style="padding: 15px; text-align: left;">Target</th>
                        <th style="padding: 15px; text-align: left;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">Revenue Growth</td>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">28%</td>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">25%</td>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1; color: #27ae60; font-weight: bold;">Exceeding</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">Customer Satisfaction</td>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">4.8/5.0</td>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">4.5/5.0</td>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1; color: #27ae60; font-weight: bold;">Exceeding</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">Market Share</td>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">22%</td>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1;">20%</td>
                        <td style="padding: 15px; border-bottom: 1px solid #ecf0f1; color: #27ae60; font-weight: bold;">Exceeding</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🎯 Next Steps</h2>
            <p><strong>Immediate Actions Required:</strong></p>
            <div class="recommendations">
                <ol>
                    <li style="margin: 10px 0;"><strong>Week 1:</strong> Secure board approval for strategic initiatives</li>
                    <li style="margin: 10px 0;"><strong>Week 2-3:</strong> Establish project teams and governance structure</li>
                    <li style="margin: 10px 0;"><strong>Month 1:</strong> Begin market expansion and technology upgrades</li>
                    <li style="margin: 10px 0;"><strong>Month 2-3:</strong> Execute talent acquisition and partnership strategies</li>
                    <li style="margin: 10px 0;"><strong>Month 4-6:</strong> Monitor progress and adjust strategies as needed</li>
                </ol>
            </div>
        </div>

        <div class="footer">
            <p><strong>Executive Summary prepared by ${data.companyName || 'Strategic Consulting Team'}</strong></p>
            <p>Confidential Strategic Document • ${data.date}</p>
        </div>
    </div>
</body>
</html>`;
}

// Command-line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const type = args[0] || 'businessProposal';
  const customData = {};

  // Parse additional arguments
  for (let i = 1; i < args.length; i += 2) {
    if (args[i] && args[i + 1]) {
      const key = args[i].replace('--', '');
      customData[key] = args[i + 1];
    }
  }

  console.log('\n📋 Available Document Types:');
  console.log('• businessProposal - Professional business proposal');
  console.log('• monthlyReport - Monthly business performance report');
  console.log('• invoice - Professional invoice template');
  console.log('• executiveSummary - Executive summary document');
  console.log('\n🔧 Usage Examples:');
  console.log('node generate-professional-documents.js businessProposal --clientName "Acme Corp" --totalCost "50000"');
  console.log('node generate-professional-documents.js monthlyReport --month "December" --revenue "150000"');
  console.log('node generate-professional-documents.js invoice --invoiceNumber "INV-2024-001" --total "12500"');
  console.log('node generate-professional-documents.js executiveSummary --title "Q4 Strategic Review"');
  
  generateDocument(type, customData)
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Document generation completed successfully!');
        console.log(`📁 Document saved: ${result.filename}`);
        console.log('🌐 Open the HTML file in your browser, then use Print > Save as PDF');
      } else {
        console.log('\n❌ Document generation failed:', result.error);
      }
    })
    .catch(error => {
      console.error('❌ Error:', error);
    });
}

export { generateDocument, documentTemplates };
