#!/usr/bin/env node

/**
 * Set Google AI as primary provider and test a single document type
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
try {
    const envContent = readFileSync(join(__dirname, '.env'), 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (error) {
    console.log('Warning: Could not load .env file, using existing environment variables');
}

// Force Google AI as primary provider
process.env.PREFERRED_PROVIDER = 'google-ai';

// Import the compiled modules
import('./dist/modules/documentGenerator/DocumentGenerator.js').then(async (docGenModule) => {
    const { DocumentGenerator } = docGenModule;
    
    console.log('🧪 Testing Single Document with Forced Google AI Provider\n');

    const testContext = `
Project: Digital Transformation Platform
Type: Enterprise software development project
Description: Building a comprehensive digital transformation platform to modernize business operations and improve customer experience.
Technology Stack: React, Node.js, TypeScript, PostgreSQL, Docker, AWS
Timeline: 12 months
Budget: $1.8M
Team: 6 developers, 2 DevOps engineers, 1 UX designer, 2 QA engineers
Stakeholders: CTO, Product Manager, Operations Director, Customer Success Manager
Business Objectives:
- Reduce manual processes by 60%
- Improve customer satisfaction by 40%
- Increase operational efficiency by 35%
- Enable real-time data analytics
Risk Factors:
- Legacy system integration complexity
- Data migration challenges
- User adoption resistance
Deliverables: Web platform, mobile app, API gateway, documentation, training materials
    `.trim();

    try {
        console.log('🔍 Testing project-statement-of-work with Google AI...');
        
        const generator = new DocumentGenerator(testContext);
        const result = await generator.generateOne('project-statement-of-work');
        
        console.log('Result:', result);
        
        if (result && result.success) {
            console.log('✅ Generation completed successfully!');
            console.log('📂 Check the generated-documents/core-analysis/ directory for the output file.');
        } else {
            console.log('❌ Generation failed:', result);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }

}).catch(error => {
    console.error('❌ Failed to load modules:', error);
    process.exit(1);
});
