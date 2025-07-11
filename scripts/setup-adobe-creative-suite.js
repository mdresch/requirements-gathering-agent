#!/usr/bin/env node

/**
 * Adobe Creative Suite Phase 2 Setup Script
 * 
 * Sets up the infrastructure for Adobe Creative Suite integration including
 * authentication, template directories, branding assets, and API validation.
 */

import { promises as fs } from 'fs';
import path from 'path';

// Configuration
const SETUP_CONFIG = {
    directories: [
        './templates/adobe-creative',
        './templates/adobe-creative/indesign',
        './templates/adobe-creative/illustrator',
        './templates/adobe-creative/photoshop',
        './assets/branding',
        './assets/branding/logos',
        './cache/adobe-templates'
    ],
    environmentTemplate: `# Adobe Creative Suite API Configuration
# Phase 2 Implementation - Professional Adobe Creative APIs

# Authentication
ADOBE_CREATIVE_CLIENT_ID=your_creative_client_id_here
ADOBE_CREATIVE_CLIENT_SECRET=your_creative_client_secret_here

# API Endpoints
ADOBE_INDESIGN_API_ENDPOINT=https://api.adobe.io/indesign/v1
ADOBE_ILLUSTRATOR_API_ENDPOINT=https://api.adobe.io/illustrator/v1
ADOBE_PHOTOSHOP_API_ENDPOINT=https://api.adobe.io/photoshop/v1
ADOBE_DOCUMENT_GEN_API_ENDPOINT=https://api.adobe.io/documentgeneration/v1

# Template Configuration
ADOBE_TEMPLATES_CACHE_ENABLED=true
ADOBE_TEMPLATES_AUTO_UPDATE=true

# Output Configuration
ADOBE_OUTPUT_QUALITY=high
ADOBE_OUTPUT_COMPRESSION=false
ADOBE_PRINT_READY_MODE=true
`,
    brandGuidelines: {
        colors: {
            primary: "#2E86AB",
            secondary: "#A23B72", 
            accent: "#F18F01",
            neutral: ["#2C3E50", "#34495E", "#7F8C8D", "#BDC3C7", "#ECF0F1"]
        },
        typography: {
            headings: "Arial Black",
            body: "Arial",
            code: "Consolas"
        },
        layouts: {
            margins: "2.5cm",
            columns: 2,
            spacing: "1.5em"
        },
        logos: {
            primary: "./assets/branding/logos/primary-logo.svg",
            secondary: "./assets/branding/logos/secondary-logo.svg",
            watermark: "./assets/branding/logos/watermark.svg"
        }
    }
};

// Logging utilities
const log = {
    info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
    success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
    error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`)
};

// Setup steps
async function createDirectories() {
    log.info('Creating directory structure for Adobe Creative Suite...');
    
    for (const dir of SETUP_CONFIG.directories) {
        try {
            await fs.mkdir(dir, { recursive: true });
            log.success(`Created directory: ${dir}`);
        } catch (error) {
            log.error(`Failed to create directory ${dir}: ${error.message}`);
        }
    }
}

async function createEnvironmentTemplate() {
    log.info('Creating environment configuration template...');
    
    const envPath = '.env.adobe.creative.template';
    
    try {
        await fs.writeFile(envPath, SETUP_CONFIG.environmentTemplate);
        log.success(`Created environment template: ${envPath}`);
        
        // Check if actual environment file exists
        try {
            await fs.access('.env.adobe.creative');
            log.info('Environment file .env.adobe.creative already exists');
        } catch {
            log.warn('Please copy .env.adobe.creative.template to .env.adobe.creative and configure your API credentials');
        }
        
    } catch (error) {
        log.error(`Failed to create environment template: ${error.message}`);
    }
}

async function createBrandGuidelines() {
    log.info('Creating brand guidelines configuration...');
    
    const brandPath = './assets/branding/brand-guidelines.json';
    
    try {
        await fs.writeFile(brandPath, JSON.stringify(SETUP_CONFIG.brandGuidelines, null, 2));
        log.success(`Created brand guidelines: ${brandPath}`);
    } catch (error) {
        log.error(`Failed to create brand guidelines: ${error.message}`);
    }
}

async function createColorPalette() {
    log.info('Creating color palette configuration...');
    
    const colorPath = './assets/branding/color-palette.json';
    const colorConfig = {
        name: "Requirements Gathering Agent Corporate Palette",
        version: "1.0.0",
        colors: SETUP_CONFIG.brandGuidelines.colors,
        usage: {
            primary: "Main brand color for headers and accents",
            secondary: "Supporting color for highlights and CTAs",
            accent: "Attention-grabbing color for important elements",
            neutral: "Grayscale palette for text and backgrounds"
        }
    };
    
    try {
        await fs.writeFile(colorPath, JSON.stringify(colorConfig, null, 2));
        log.success(`Created color palette: ${colorPath}`);
    } catch (error) {
        log.error(`Failed to create color palette: ${error.message}`);
    }
}

async function createTypographyStyles() {
    log.info('Creating typography styles configuration...');
    
    const typographyPath = './assets/branding/typography-styles.json';
    const typographyConfig = {
        name: "Requirements Gathering Agent Typography System",
        version: "1.0.0",
        fonts: SETUP_CONFIG.brandGuidelines.typography,
        styles: {
            h1: { font: "Arial Black", size: "2.5em", weight: "bold", color: "#2C3E50" },
            h2: { font: "Arial Black", size: "2em", weight: "bold", color: "#2C3E50" },
            h3: { font: "Arial", size: "1.5em", weight: "bold", color: "#34495E" },
            body: { font: "Arial", size: "1em", weight: "normal", color: "#2C3E50" },
            code: { font: "Consolas", size: "0.9em", weight: "normal", color: "#E74C3C" }
        },
        layouts: SETUP_CONFIG.brandGuidelines.layouts
    };
    
    try {
        await fs.writeFile(typographyPath, JSON.stringify(typographyConfig, null, 2));
        log.success(`Created typography styles: ${typographyPath}`);
    } catch (error) {
        log.error(`Failed to create typography styles: ${error.message}`);
    }
}

async function createTemplateReadme() {
    log.info('Creating template documentation...');
    
    const readmePath = './templates/adobe-creative/README.md';
    const readmeContent = `# Adobe Creative Suite Templates

This directory contains professional templates for Adobe Creative Suite integration.

## Template Structure

\`\`\`
templates/adobe-creative/
├── indesign/              # InDesign templates (.indd, .indt)
│   ├── project-charter.indd
│   ├── requirements-doc.indd
│   └── management-plan.indd
├── illustrator/           # Illustrator templates (.ai)
│   ├── timeline-template.ai
│   ├── chart-template.ai
│   └── infographic-template.ai
└── photoshop/            # Photoshop templates (.psd)
    ├── image-enhancement.psd
    └── screenshot-formatting.psd
\`\`\`

## Template Types

### InDesign Templates
- **project-charter.indd**: Professional project charter layout
- **requirements-doc.indd**: Technical specification document template
- **management-plan.indd**: Project management plan layout

### Illustrator Templates
- **timeline-template.ai**: Project timeline visualization
- **chart-template.ai**: Data visualization and charts
- **infographic-template.ai**: Professional infographic layouts

### Photoshop Templates
- **image-enhancement.psd**: Automated image optimization
- **screenshot-formatting.psd**: Professional screenshot styling

## Usage

Templates are automatically selected based on document type and content analysis.
Custom templates can be added to the appropriate directories.

## Next Steps

1. Obtain Adobe Creative Suite API credentials
2. Configure .env.adobe.creative with your API keys
3. Download or create professional templates
4. Run validation: \`npm run adobe:validate-creative\`
`;
    
    try {
        await fs.writeFile(readmePath, readmeContent);
        log.success(`Created template documentation: ${readmePath}`);
    } catch (error) {
        log.error(`Failed to create template documentation: ${error.message}`);
    }
}

async function validateConfiguration() {
    log.info('Validating Adobe Creative Suite configuration...');
    
    try {
        const validation = creativeSuiteConfig.validateConfiguration();
        
        if (validation.isValid) {
            log.success('Configuration validation passed');
        } else {
            log.warn('Configuration validation warnings:');
            validation.warnings.forEach(warning => log.warn(`  - ${warning}`));
            
            if (validation.errors.length > 0) {
                log.error('Configuration validation errors:');
                validation.errors.forEach(error => log.error(`  - ${error}`));
            }
        }
        
        return validation;
        
    } catch (error) {
        log.error(`Configuration validation failed: ${error.message}`);
        return { isValid: false, errors: [error.message], warnings: [] };
    }
}

async function testAuthentication() {
    log.info('Testing Adobe Creative Suite authentication...');
    
    try {
        const authResult = await creativeSuiteAuth.validateAuthentication();
        
        if (authResult.isAuthenticated) {
            log.success('Authentication test passed');
            log.info(`Token expires at: ${authResult.tokenInfo?.expiresAt}`);
            log.info(`Scopes: ${authResult.tokenInfo?.scopes.join(', ')}`);
        } else {
            log.warn('Authentication test failed (expected if credentials not configured)');
            log.warn(`Reason: ${authResult.error}`);
        }
        
        return authResult;
        
    } catch (error) {
        log.warn(`Authentication test failed: ${error.message}`);
        return { isAuthenticated: false, error: error.message };
    }
}

async function displayNextSteps() {
    log.info('\n=== PHASE 2 SETUP COMPLETE ===');
    log.info('Next steps to complete Adobe Creative Suite integration:');
    log.info('');
    log.info('1. OBTAIN API CREDENTIALS:');
    log.info('   - Register for Adobe Creative Suite APIs at https://developer.adobe.com/');
    log.info('   - Create a new project and obtain Client ID and Client Secret');
    log.info('   - Enable APIs: InDesign, Illustrator, Photoshop, Document Generation');
    log.info('');
    log.info('2. CONFIGURE ENVIRONMENT:');
    log.info('   - Copy .env.adobe.creative.template to .env.adobe.creative');
    log.info('   - Add your Adobe Creative Suite API credentials');
    log.info('   - Configure API endpoints (defaults should work)');
    log.info('');
    log.info('3. CREATE OR OBTAIN TEMPLATES:');
    log.info('   - Design professional InDesign templates for your document types');
    log.info('   - Create Illustrator templates for charts and infographics');
    log.info('   - Set up Photoshop templates for image enhancement');
    log.info('');
    log.info('4. VALIDATE SETUP:');
    log.info('   - Run: npm run adobe:validate-creative');
    log.info('   - Test API connectivity: npm run adobe:test-creative-apis');
    log.info('   - Generate sample documents: npm run adobe:generate-sample-creative');
    log.info('');
    log.info('5. START PHASE 2 IMPLEMENTATION:');
    log.info('   - Begin with template system development');
    log.info('   - Implement visual content generation');
    log.info('   - Enhance existing batch conversion pipeline');
    log.info('');
    log.success('Phase 2 infrastructure is ready for implementation!');
}

// Main setup function
async function main() {
    try {
        log.info('🚀 Starting Adobe Creative Suite Phase 2 Setup...');
        log.info('');
        
        // Step 1: Create directory structure
        await createDirectories();
        log.info('');
        
        // Step 2: Create configuration files
        await createEnvironmentTemplate();
        await createBrandGuidelines();
        await createColorPalette();
        await createTypographyStyles();
        await createTemplateReadme();
        log.info('');
        
        // Step 3: Validate configuration
        const validation = await validateConfiguration();
        log.info('');
        
        // Step 4: Test authentication (if configured)
        const authTest = await testAuthentication();
        log.info('');
        
        // Step 5: Display next steps
        await displayNextSteps();
        
        // Summary
        const setupComplete = validation.isValid && authTest.isAuthenticated;
        if (setupComplete) {
            log.success('🎉 Phase 2 setup complete and ready for implementation!');
        } else {
            log.info('📋 Phase 2 infrastructure created. Complete credential configuration to proceed.');
        }
        
    } catch (error) {
        log.error(`Setup failed: ${error.message}`);
        process.exit(1);
    }
}

// Execute setup
main().catch(error => {
    log.error(`Unexpected setup error: ${error.message}`);
    process.exit(1);
});
