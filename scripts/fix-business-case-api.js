#!/usr/bin/env node

/**
 * Script to fix the Business Case template's documentKey using API calls
 * This script updates the Business Case template to have the correct documentKey: "business-case"
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'dev-api-key-123';

async function makeApiCall(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
        }
        
        return data;
    } catch (error) {
        console.error(`❌ API call failed for ${endpoint}:`, error.message);
        throw error;
    }
}

async function fixBusinessCaseTemplate() {
    try {
        console.log('🔧 Starting Business Case template fix via API...');
        
        // Get all templates
        console.log('📋 Fetching all templates...');
        const templatesResponse = await makeApiCall('/templates');
        
        if (!templatesResponse.success) {
            throw new Error('Failed to fetch templates');
        }
        
        const templates = templatesResponse.data.templates;
        console.log(`📋 Found ${templates.length} templates`);
        
        // Find Business Case templates
        const businessCaseTemplates = templates.filter(template => 
            template.name.toLowerCase().includes('business') && 
            template.name.toLowerCase().includes('case')
        );
        
        console.log(`📋 Found ${businessCaseTemplates.length} Business Case templates`);
        
        for (const template of businessCaseTemplates) {
            console.log(`\n🔍 Processing template: ${template.name} (ID: ${template.id})`);
            console.log(`   Current documentKey: "${template.documentKey}"`);
            
            // Check if documentKey needs fixing
            if (template.documentKey && template.documentKey !== '' && template.documentKey !== 'Document ID') {
                console.log(`   ✅ Template already has valid documentKey: "${template.documentKey}"`);
                continue;
            }
            
            // Prepare update data
            const updateData = {
                ...template,
                documentKey: 'business-case'
            };
            
            console.log(`   🔧 Updating documentKey to: "business-case"`);
            
            // Update the template
            try {
                const updateResponse = await makeApiCall(`/templates/${template.id}`, 'PUT', updateData);
                
                if (updateResponse.success) {
                    console.log(`   ✅ Successfully updated template`);
                    console.log(`   📝 New documentKey: "${updateResponse.data.documentKey}"`);
                } else {
                    console.log(`   ❌ Failed to update template: ${updateResponse.message}`);
                }
            } catch (error) {
                console.log(`   ❌ Error updating template: ${error.message}`);
            }
        }
        
        // Verify the fix
        console.log('\n🔍 Verifying Business Case templates...');
        const updatedTemplatesResponse = await makeApiCall('/templates');
        const updatedTemplates = updatedTemplatesResponse.data.templates.filter(template => 
            template.name.toLowerCase().includes('business') && 
            template.name.toLowerCase().includes('case')
        );
        
        for (const template of updatedTemplates) {
            console.log(`   📋 ${template.name}: documentKey = "${template.documentKey}"`);
        }
        
        console.log('\n✅ Business Case template fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Error fixing Business Case template:', error.message);
        process.exit(1);
    }
}

// Run the fix
fixBusinessCaseTemplate()
    .then(() => {
        console.log('🎉 Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error.message);
        process.exit(1);
    });

export { fixBusinessCaseTemplate };
