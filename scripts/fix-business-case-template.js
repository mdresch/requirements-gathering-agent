#!/usr/bin/env node

/**
 * Script to fix the Business Case template's documentKey
 * This script updates the Business Case template to have the correct documentKey: "business-case"
 */

import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the Template model
const { default: TemplateModel } = await import('../src/models/Template.model.ts');

async function fixBusinessCaseTemplate() {
    try {
        console.log('🔧 Starting Business Case template fix...');
        
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adpa-enterprise';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find Business Case templates with empty or incorrect documentKey
        const businessCaseTemplates = await TemplateModel.find({
            $or: [
                { name: { $regex: /business.*case/i } },
                { name: { $regex: /strategic.*business.*case/i } }
            ],
            $or: [
                { documentKey: '' },
                { documentKey: { $exists: false } },
                { documentKey: 'Document ID' }
            ]
        });

        console.log(`📋 Found ${businessCaseTemplates.length} Business Case templates to fix`);

        for (const template of businessCaseTemplates) {
            console.log(`\n🔍 Processing template: ${template.name} (ID: ${template._id})`);
            console.log(`   Current documentKey: "${template.documentKey}"`);
            
            // Set the correct documentKey
            const correctDocumentKey = 'business-case';
            
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
            } else {
                console.log(`   ❌ Failed to update template`);
            }
        }

        // Verify the fix
        console.log('\n🔍 Verifying Business Case templates...');
        const verifiedTemplates = await TemplateModel.find({
            $or: [
                { name: { $regex: /business.*case/i } },
                { name: { $regex: /strategic.*business.*case/i } }
            ]
        });

        for (const template of verifiedTemplates) {
            console.log(`   📋 ${template.name}: documentKey = "${template.documentKey}"`);
        }

        console.log('\n✅ Business Case template fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Error fixing Business Case template:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the fix
fixBusinessCaseTemplate()
    .then(() => {
        console.log('🎉 Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });

export { fixBusinessCaseTemplate };
