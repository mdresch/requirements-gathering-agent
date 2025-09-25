#!/usr/bin/env node

/**
 * Script to fix all templates with empty or invalid documentKeys
 * This script ensures all templates have proper documentKeys that match processor-config.json
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import the Template model
const TemplateModel = require('../src/models/Template.model.js');

// Load processor config to get valid document keys
function loadProcessorConfig() {
    try {
        const configPath = path.resolve(process.cwd(), 'processor-config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return Object.keys(config).filter(key => key !== 'lastSetup');
    } catch (error) {
        console.warn('⚠️ Could not load processor-config.json:', error.message);
        return [];
    }
}

// Generate document key from template name
function generateDocumentKey(templateName) {
    return templateName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Map template names to known document keys
const templateNameToDocumentKey = {
    'Business Case': 'business-case',
    'Business Case Template': 'business-case',
    'Strategic Business Case': 'strategic-business-case',
    'Project Charter': 'project-charter',
    'Project Charter Template': 'project-charter',
    'User Stories': 'user-stories',
    'User Stories Template': 'user-stories',
    'User Personas': 'user-personas',
    'User Personas Template': 'user-personas',
    'Stakeholder Register': 'stakeholder-register',
    'Stakeholder Register Template': 'stakeholder-register',
    'Risk Register': 'risk-register',
    'Risk Register Template': 'risk-register',
    'Scope Statement': 'scope-statement',
    'Scope Statement Template': 'scope-statement',
    'Requirements Documentation': 'requirements-documentation',
    'Requirements Documentation Template': 'requirements-documentation',
    'Test Plan': 'test-plan',
    'Test Plan Template': 'test-plan',
    'Test Strategy': 'test-strategy',
    'Test Strategy Template': 'test-strategy',
    'Architecture Design': 'architecture-design',
    'Architecture Design Document': 'architecture-design',
    'System Design': 'system-design',
    'System Design Document': 'system-design',
    'Database Schema': 'database-schema',
    'Database Schema Document': 'database-schema',
    'API Documentation': 'apidocumentation',
    'API Documentation Template': 'apidocumentation',
    'Security Design': 'security-design',
    'Security Design Document': 'security-design',
    'Performance Requirements': 'performance-requirements',
    'Performance Requirements Document': 'performance-requirements',
    'Integration Design': 'integration-design',
    'Integration Design Document': 'integration-design',
    'Technical Stack': 'technical-stack',
    'Technical Stack Document': 'technical-stack',
    'Deployment Architecture': 'deployment-architecture',
    'Deployment Architecture Document': 'deployment-architecture',
    'Error Handling': 'error-handling',
    'Error Handling Document': 'error-handling'
};

async function fixAllTemplateDocumentKeys() {
    try {
        console.log('🔧 Starting comprehensive template documentKey fix...');
        
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adpa-enterprise';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Load valid document keys from processor config
        const validDocumentKeys = loadProcessorConfig();
        console.log(`📋 Loaded ${validDocumentKeys.length} valid document keys from processor-config.json`);

        // Find all templates with empty or invalid documentKeys
        const templatesToFix = await TemplateModel.find({
            $or: [
                { documentKey: '' },
                { documentKey: { $exists: false } },
                { documentKey: 'Document ID' },
                { documentKey: { $not: { $regex: /^[a-z0-9-]+$/ } } }
            ]
        });

        console.log(`📋 Found ${templatesToFix.length} templates to fix`);

        let fixedCount = 0;
        let skippedCount = 0;

        for (const template of templatesToFix) {
            console.log(`\n🔍 Processing template: ${template.name} (ID: ${template._id})`);
            console.log(`   Current documentKey: "${template.documentKey}"`);
            
            let correctDocumentKey = null;
            
            // First, try to find a known mapping
            if (templateNameToDocumentKey[template.name]) {
                correctDocumentKey = templateNameToDocumentKey[template.name];
                console.log(`   📝 Using known mapping: ${template.name} -> ${correctDocumentKey}`);
            } else {
                // Generate from template name
                correctDocumentKey = generateDocumentKey(template.name);
                console.log(`   🔧 Generated documentKey: ${correctDocumentKey}`);
            }
            
            // Validate that the documentKey exists in processor config
            if (validDocumentKeys.length > 0 && !validDocumentKeys.includes(correctDocumentKey)) {
                console.log(`   ⚠️ Warning: documentKey "${correctDocumentKey}" not found in processor-config.json`);
                console.log(`   📋 Available keys: ${validDocumentKeys.slice(0, 10).join(', ')}${validDocumentKeys.length > 10 ? '...' : ''}`);
            }
            
            // Update the template
            const updatedTemplate = await TemplateModel.findByIdAndUpdate(
                template._id,
                { 
                    $set: { 
                        documentKey: correctDocumentKey,
                        updated_at: new Date()
                    },
                    $inc: { version: 1 }
                },
                { new: true }
            );

            if (updatedTemplate) {
                console.log(`   ✅ Updated documentKey to: "${updatedTemplate.documentKey}"`);
                console.log(`   📝 New version: ${updatedTemplate.version}`);
                fixedCount++;
            } else {
                console.log(`   ❌ Failed to update template`);
                skippedCount++;
            }
        }

        // Summary
        console.log('\n📊 Summary:');
        console.log(`   ✅ Fixed: ${fixedCount} templates`);
        console.log(`   ⏭️ Skipped: ${skippedCount} templates`);
        console.log(`   📋 Total processed: ${templatesToFix.length} templates`);

        // Verify the fix
        console.log('\n🔍 Verifying all templates...');
        const allTemplates = await TemplateModel.find({});
        const invalidTemplates = allTemplates.filter(t => 
            !t.documentKey || 
            t.documentKey === '' || 
            t.documentKey === 'Document ID' ||
            !/^[a-z0-9-]+$/.test(t.documentKey)
        );

        if (invalidTemplates.length === 0) {
            console.log('✅ All templates now have valid documentKeys!');
        } else {
            console.log(`⚠️ ${invalidTemplates.length} templates still have invalid documentKeys:`);
            invalidTemplates.forEach(t => {
                console.log(`   - ${t.name}: "${t.documentKey}"`);
            });
        }

        console.log('\n✅ Comprehensive template documentKey fix completed!');
        
    } catch (error) {
        console.error('❌ Error fixing template documentKeys:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the fix
if (require.main === module) {
    fixAllTemplateDocumentKeys()
        .then(() => {
            console.log('🎉 Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error);
            process.exit(1);
        });
}

module.exports = { fixAllTemplateDocumentKeys };
