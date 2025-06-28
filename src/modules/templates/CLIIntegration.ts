/**
 * CLI Integration for Advanced Template Engine
 * 
 * This demonstrates how to integrate the revolutionary database-backed
 * template system with your existing CLI while preserving all functionality.
 * 
 * @version 3.0.0
 * @author Requirements Gathering Agent Team
 * @created June 2025
 */

import { AdvancedTemplateEngine, TemplateEngineFactory } from './AdvancedTemplateEngine.js';
import { TemplateMigrationManager } from './TemplateMigrationStrategy.js';

/**
 * Enhanced CLI Template Commands
 * 
 * Add these functions to your existing CLI to support both static and dynamic templates
 */

/**
 * Enhanced showAvailableTemplates that combines static and dynamic templates
 */
export async function showAvailableTemplatesEnhanced(): Promise<void> {
    console.log('📋 Available Document Templates (Enhanced)\n');
    
    try {
        // Create template engine
        const templateEngine = await TemplateEngineFactory.createWithDatabase({});
        
        // Load all templates (both migrated static and new dynamic ones)
        const templates = await templateEngine.loadAllTemplates();
        
        if (templates.length === 0) {
            console.log('⚠️  No templates found. Running migration...');
            const migrationManager = new TemplateMigrationManager(templateEngine);
            await migrationManager.migrateStaticTemplates();
            const migratedTemplates = await templateEngine.loadAllTemplates();
            console.log(`✅ Migrated ${migratedTemplates.length} templates\n`);
        }
        
        // Group templates by category
        const templatesByCategory = templates.reduce((acc, template) => {
            if (!acc[template.category]) {
                acc[template.category] = [];
            }
            acc[template.category].push(template);
            return acc;
        }, {} as Record<string, any[]>);
        
        console.log(`📚 DYNAMIC TEMPLATES: ${Object.keys(templatesByCategory).length} categories with ${templates.length} total templates:\n`);
        
        for (const [category, categoryTemplates] of Object.entries(templatesByCategory)) {
            // Convert category slug to display name
            const displayCategory = category
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            console.log(`${displayCategory} (${categoryTemplates.length} templates):`);
            
            for (const template of categoryTemplates) {
                const emoji = getCategoryEmoji(category);
                console.log(`  ${emoji} ${template.name}`);
                console.log(`      ID: ${template.id}`);
                console.log(`      Version: ${template.version}`);
                console.log(`      Context Points: ${template.contextInjectionPoints.length}`);
                console.log(`      Variables: ${template.variables.length}`);
                console.log(`      Generate: node dist/cli.js --generate-advanced ${template.id}`);
                console.log('');
            }
        }
        
        console.log('🌟 REVOLUTIONARY FEATURES:');
        console.log('   • Dynamic context injection from related documents');
        console.log('   • AI-powered context summarization and optimization');
        console.log('   • Cross-document relationship analysis');
        console.log('   • Template variables for customization');
        console.log('   • Conditional logic for smart adaptation');
        console.log('   • Quality checks and validation');
        
        console.log('\n💡 Enhanced Usage Examples:');
        console.log('   # Generate with enhanced context injection:');
        console.log('   node dist/cli.js --generate-advanced stakeholder-register');
        console.log('   node dist/cli.js --generate-advanced apidocumentation');
        
        console.log('\n   # Generate with custom variables:');
        console.log('   node dist/cli.js --generate-advanced stakeholder-register \\');
        console.log('     --var PROJECT_NAME="My Project" \\');
        console.log('     --var ORGANIZATION_NAME="My Company"');
        
        console.log('\n   # Migrate static templates to dynamic:');
        console.log('   node dist/cli.js --migrate-templates');
        
        console.log('\n   # Template management:');
        console.log('   node dist/cli.js --template-info stakeholder-register');
        console.log('   node dist/cli.js --template-validate apidocumentation');
        
    } catch (error) {
        console.error('❌ Error loading enhanced templates:', error);
        console.log('\n🔧 Falling back to static templates...');
        // Fall back to your existing showAvailableTemplates function
    }
}

/**
 * Generate document using advanced template engine
 */
export async function generateDocumentAdvanced(
    templateId: string,
    options: {
        variables?: Record<string, any>;
        outputDir?: string;
        quiet?: boolean;
    } = {}
): Promise<void> {
    try {
        if (!options.quiet) {
            console.log(`🚀 Generating document with advanced context injection: ${templateId}...`);
        }
        
        // Create template engine
        const templateEngine = await TemplateEngineFactory.createWithDatabase({});
        
        // Load template
        const template = await templateEngine.loadTemplate(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        
        if (!options.quiet) {
            console.log(`📋 Template: ${template.name}`);
            console.log(`📂 Category: ${template.category}`);
            console.log(`🔗 Context Points: ${template.contextInjectionPoints.length}`);
            console.log(`⚙️  Variables: ${template.variables.length}`);
        }
        
        // Read project context (use your existing context reading logic)
        const { readEnhancedProjectContext } = await import('../fileManager.js');
        const baseContext = await readEnhancedProjectContext(process.cwd());
        
        // Merge default variables with provided ones
        const defaultVariables = {
            PROJECT_NAME: 'Current Project',
            ORGANIZATION_NAME: 'Organization',
            PROJECT_MANAGER: 'Project Manager',
            DOCUMENT_VERSION: '1.0',
            GENERATION_DATE: new Date().toISOString().split('T')[0]
        };
        
        const variables = { ...defaultVariables, ...(options.variables || {}) };
        
        if (!options.quiet) {
            console.log('🧠 Building enhanced context with dependency resolution...');
        }
        
        // Generate document with enhanced context injection
        const generatedContent = await templateEngine.generateDocument(
            templateId,
            baseContext,
            variables
        );
          // Save the document (use your existing file management logic)
        const { writeFile, mkdir } = await import('fs/promises');
        const { join, dirname } = await import('path');
        
        const outputDir = options.outputDir || 'generated-documents';
        const categoryDir = join(outputDir, template.category);
        const filePath = join(categoryDir, `${templateId}.md`);
        
        // Ensure directory exists
        await mkdir(dirname(filePath), { recursive: true });
        
        // Write the file
        await writeFile(filePath, generatedContent, 'utf-8');
        
        if (!options.quiet) {
            console.log(`✅ Generated: ${template.name}`);
            console.log(`📁 Saved to: ${outputDir}/${template.category}/${templateId}.md`);
            console.log(`📄 Length: ${generatedContent.length} characters`);
            console.log(`🎯 Enhanced with context from ${template.contextInjectionPoints.length} injection points`);
        }
        
    } catch (error) {
        console.error(`❌ Error generating document: ${templateId}`, error);
        throw error;
    }
}

/**
 * Show detailed information about a specific template
 */
export async function showTemplateInfo(templateId: string): Promise<void> {
    try {
        const templateEngine = await TemplateEngineFactory.createWithDatabase({});
        const template = await templateEngine.loadTemplate(templateId);
        
        if (!template) {
            console.error(`❌ Template not found: ${templateId}`);
            return;
        }
        
        console.log(`📋 Template Information: ${template.name}\n`);
        
        console.log('📊 BASIC INFO:');
        console.log(`   ID: ${template.id}`);
        console.log(`   Name: ${template.name}`);
        console.log(`   Category: ${template.category}`);
        console.log(`   Version: ${template.version}`);
        console.log(`   Active: ${template.isActive ? '✅' : '❌'}`);
        console.log(`   Created: ${template.createdAt.toLocaleDateString()}`);
        console.log(`   Updated: ${template.updatedAt.toLocaleDateString()}`);
        
        console.log('\n🧠 AI CONFIGURATION:');
        console.log(`   Max Tokens: ${template.maxTokens}`);
        console.log(`   Temperature: ${template.temperature}`);
        console.log(`   Preferred Models: ${template.modelPreferences.join(', ')}`);
        
        console.log('\n🔗 CONTEXT INJECTION POINTS:');
        for (const [index, point] of template.contextInjectionPoints.entries()) {
            console.log(`   ${index + 1}. ${point.placeholder}`);
            console.log(`      Dependencies: ${point.dependencies.length}`);
            console.log(`      Strategy: ${point.aggregationStrategy}`);
            console.log(`      Max Length: ${point.maxLength || 'unlimited'}`);
            
            for (const dep of point.dependencies) {
                const requiredText = dep.required ? '(required)' : '(optional)';
                console.log(`         - ${dep.documentKey} ${requiredText} (weight: ${dep.weight})`);
            }
        }
        
        console.log('\n⚙️  VARIABLES:');
        for (const variable of template.variables) {
            const requiredText = variable.required ? '(required)' : '(optional)';
            console.log(`   • ${variable.name}: ${variable.type} ${requiredText}`);
            console.log(`     Default: ${variable.defaultValue || 'none'}`);
            console.log(`     Description: ${variable.description}`);
        }
        
        console.log('\n🔀 CONDITIONAL LOGIC:');
        if (template.conditionalLogic.length > 0) {
            for (const rule of template.conditionalLogic) {
                console.log(`   • IF ${rule.condition} THEN ${rule.action} ${rule.target}`);
            }
        } else {
            console.log('   No conditional logic defined');
        }
        
        console.log('\n✅ QUALITY CHECKS:');
        for (const check of template.qualityChecks) {
            console.log(`   • ${check.name} (${check.type}) - Weight: ${check.weight}`);
        }
        
    } catch (error) {
        console.error('❌ Error showing template info:', error);
    }
}

/**
 * Migrate static templates to dynamic format
 */
export async function migrateStaticTemplates(options: { force?: boolean } = {}): Promise<void> {
    try {
        console.log('🚀 Starting template migration from static to dynamic format...');
        
        const templateEngine = await TemplateEngineFactory.createWithDatabase({});
        const migrationManager = new TemplateMigrationManager(templateEngine);
        
        // Check if templates already exist
        const existingTemplates = await templateEngine.loadAllTemplates();
        if (existingTemplates.length > 0 && !options.force) {
            console.log(`⚠️  Found ${existingTemplates.length} existing templates.`);
            console.log('Use --force to re-migrate and overwrite existing templates.');
            return;
        }
        
        await migrationManager.migrateStaticTemplates();
        
        const migratedTemplates = await templateEngine.loadAllTemplates();
        console.log(`\n🎉 Migration completed successfully!`);
        console.log(`📊 Templates migrated: ${migratedTemplates.length}`);
        console.log(`📂 Categories: ${new Set(migratedTemplates.map(t => t.category)).size}`);
        console.log(`🔗 Context injection points: ${migratedTemplates.reduce((sum, t) => sum + t.contextInjectionPoints.length, 0)}`);
        
        console.log('\n✨ REVOLUTIONARY FEATURES NOW AVAILABLE:');
        console.log('   • Dynamic context building with dependency resolution');
        console.log('   • AI-powered context summarization for large contexts');
        console.log('   • Cross-document relationship analysis');
        console.log('   • Template variables for customization');
        console.log('   • Conditional logic for smart adaptation');
        console.log('   • Quality checks and validation');
        console.log('   • Template versioning and evolution tracking');
        
        console.log('\n💡 Next Steps:');
        console.log('   1. Run: node dist/cli.js --list-templates (to see migrated templates)');
        console.log('   2. Run: node dist/cli.js --generate-advanced <template-id>');
        console.log('   3. Use: --template-info <template-id> to explore features');
        
    } catch (error) {
        console.error('❌ Error migrating templates:', error);
    }
}

/**
 * Parse variables from command line arguments
 */
export function parseVariablesFromArgs(args: string[]): Record<string, any> {
    const variables: Record<string, any> = {};
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--var' && i + 1 < args.length) {
            const varAssignment = args[i + 1];
            const [key, ...valueParts] = varAssignment.split('=');
            const value = valueParts.join('=');
            
            // Try to parse as JSON, fallback to string
            try {
                variables[key] = JSON.parse(value);
            } catch {
                variables[key] = value;
            }
            
            i++; // Skip the next argument since we've processed it
        }
    }
    
    return variables;
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
        'stakeholder-management': '👥',
        'technical-design': '⚙️',
        'quality-assurance': '✅',
        'project-charter': '📜',
        'management-plans': '📋',
        'planning': '🏗️',
        'scope-management': '🎯',
        'risk-management': '⚠️',
        'strategic-statements': '🎯',
        'technical-analysis': '🔧',
        'implementation-guides': '📚',
        'pmbok': '📖',
        'requirements': '📝',
        'basic-docs': '📄'
    };
    
    return emojis[category] || '📄';
}

/**
 * Integration functions for existing CLI
 */
export const CLI_INTEGRATION = {
    
    /**
     * Add these command handlers to your main CLI function
     */
    commandHandlers: {
        '--list-templates': showAvailableTemplatesEnhanced,
        '--generate-advanced': generateDocumentAdvanced,
        '--template-info': showTemplateInfo,
        '--migrate-templates': migrateStaticTemplates
    },
    
    /**
     * Add these argument parsers
     */
    argumentParsers: {
        parseVariables: parseVariablesFromArgs
    },
    
    /**
     * Example integration in main CLI function
     */
    exampleIntegration: `
// In your main() function, add these handlers:

// Enhanced template listing
if (args.includes('--list-templates') || args.includes('--templates')) {
    await showAvailableTemplatesEnhanced();
    return;
}

// Advanced document generation
if (args.includes('--generate-advanced')) {
    const idx = args.indexOf('--generate-advanced');
    const templateId = args[idx + 1];
    if (!templateId) {
        console.error('❌ Missing template ID for --generate-advanced');
        return;
    }
    
    const variables = parseVariablesFromArgs(args);
    await generateDocumentAdvanced(templateId, { variables, quiet: options.quiet });
    return;
}

// Template information
if (args.includes('--template-info')) {
    const idx = args.indexOf('--template-info');
    const templateId = args[idx + 1];
    if (!templateId) {
        console.error('❌ Missing template ID for --template-info');
        return;
    }
    
    await showTemplateInfo(templateId);
    return;
}

// Template migration
if (args.includes('--migrate-templates')) {
    const force = args.includes('--force');
    await migrateStaticTemplates({ force });
    return;
}
`
};

export default CLI_INTEGRATION;
