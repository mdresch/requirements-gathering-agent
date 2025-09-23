/**
 * Seed script to populate the database with sample templates
 */

import { TemplateRepository } from '../src/repositories/TemplateRepository.js';
import { dbConnection } from '../src/config/database.js';
import { logger } from '../src/utils/logger.js';

const sampleTemplates = [
    {
        name: "User Stories Template",
        description: "Comprehensive template for creating user stories with acceptance criteria",
        category: "basic-docs",
        template_type: "basic",
        ai_instructions: "Generate comprehensive user stories following agile best practices with clear acceptance criteria",
        prompt_template: "# User Stories\n\n## Project Overview\n**Project:** {{projectName}}\n**Type:** {{projectType}}\n**Description:** {{description}}\n\n## User Story Format\nEach user story follows the format: \"As a [user type], I want [functionality] so that [benefit].\"\n\n## Epic: Core Functionality\n\n### User Registration and Authentication\n- **US001:** As a new user, I want to create an account so that I can access the system\n- **US002:** As a registered user, I want to log in securely so that I can access my personal data\n- **US003:** As a user, I want to reset my password so that I can regain access if I forget it",
        generation_function: "getAiGenericDocument",
        metadata: {
            tags: ["user-stories", "agile", "requirements"],
            variables: [
                { name: "projectName", type: "string", required: true },
                { name: "projectType", type: "string", required: true },
                { name: "description", type: "string", required: true }
            ],
            layout: {},
            emoji: "📋",
            priority: 100,
            source: "system"
        },
        is_active: true,
        is_system: true,
        created_by: "system"
    },
    {
        name: "Business Case Template",
        description: "Strategic justification and financial analysis for project initiation",
        category: "strategic-statements",
        template_type: "pmbok",
        ai_instructions: "Generate a comprehensive business case document following standard business analysis practices with financial justification",
        prompt_template: "# Business Case\n\n## Executive Summary\n\n## Problem Statement\n\n## Solution Overview\n\n## Financial Analysis\n\n## Risk Assessment\n\n## Recommendations",
        generation_function: "getAiGenericDocument",
        metadata: {
            tags: ["business-case", "strategy", "financial-analysis"],
            variables: [
                { name: "projectName", type: "string", required: true },
                { name: "budget", type: "number", required: true },
                { name: "timeline", type: "string", required: true },
                { name: "stakeholders", type: "array", required: true }
            ],
            layout: {},
            emoji: "💼",
            priority: 200,
            source: "system"
        },
        is_active: true,
        is_system: true,
        created_by: "system"
    },
    {
        name: "Technical Requirements Template",
        description: "Comprehensive technical requirements specification template",
        category: "requirements",
        template_type: "technical",
        ai_instructions: "Generate detailed technical requirements including functional and non-functional requirements",
        prompt_template: "# Technical Requirements\n\n## System Overview\n\n## Functional Requirements\n\n## Non-Functional Requirements\n\n## Technical Constraints\n\n## Integration Requirements",
        generation_function: "getAiGenericDocument",
        metadata: {
            tags: ["technical", "requirements", "specification"],
            variables: [
                { name: "systemName", type: "string", required: true },
                { name: "technology", type: "string", required: false },
                { name: "performance", type: "object", required: false }
            ],
            layout: {},
            emoji: "⚙️",
            priority: 150,
            source: "system"
        },
        is_active: true,
        is_system: true,
        created_by: "system"
    }
];

async function seedTemplates() {
    try {
        console.log('🌱 Starting template seeding...');
        
        // Connect to database
        await dbConnection.connect();
        console.log('✅ Database connected');
        
        // Create repository instance
        const templateRepository = new TemplateRepository();
        console.log('✅ TemplateRepository created');
        
        // Check if templates already exist
        const existingTemplates = await templateRepository.getAllTemplates();
        console.log(`📊 Found ${existingTemplates.length} existing templates`);
        
        if (existingTemplates.length > 0) {
            console.log('⚠️ Templates already exist in database. Skipping seeding.');
            return;
        }
        
        // Create sample templates
        console.log('📝 Creating sample templates...');
        const createdTemplates = [];
        
        for (const templateData of sampleTemplates) {
            try {
                const createdTemplate = await templateRepository.createTemplate(templateData);
                createdTemplates.push(createdTemplate);
                console.log(`✅ Created template: ${createdTemplate.name}`);
            } catch (error) {
                console.error(`❌ Failed to create template ${templateData.name}:`, error.message);
            }
        }
        
        console.log(`🎉 Seeding completed! Created ${createdTemplates.length}/${sampleTemplates.length} templates.`);
        
        // Verify templates were created
        const finalTemplates = await templateRepository.getAllTemplates();
        console.log(`📊 Final template count: ${finalTemplates.length}`);
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the seeding
seedTemplates();
