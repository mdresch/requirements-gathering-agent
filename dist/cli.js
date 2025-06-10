#!/usr/bin/env node
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\src\cli.ts
/**
 * Command Line Interface for Requirements Gathering Agent
 *
 * Provides comprehensive CLI functionality for project documentation generation
 * with support for multiple AI providers and PMBOK compliance validation.
 *
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created 2024
 * @updated June 2025
 *
 * Key Features:
 * - Full CLI argument parsing and validation
 * - Multi-provider AI configuration support
 * - Interactive document generation workflows
 * - PMBOK validation and compliance checking
 * - Comprehensive error handling and user feedback
 *
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\cli.ts
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import process from 'process';
import { InteractiveProviderMenu } from './modules/ai/interactive-menu.js';
import { DocumentGenerator, generateDocumentsWithRetry } from './modules/documentGenerator.js';
import { readEnhancedProjectContext } from './modules/fileManager.js';
import { PMBOKValidator } from './modules/pmbokValidation/PMBOKValidator.js';
import { writeFile } from 'fs/promises';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function main() {
    try {
        // Show milestone celebration banner occasionally (10% chance)
        if (Math.random() < 0.1) {
            showMilestoneBanner();
        }
        console.log('🚀 Requirements Gathering Agent v2.1.3'); // Updated version
        // Parse and validate command line arguments
        const args = process.argv.slice(2);
        // Helper function to safely get argument value
        const getArgValue = (flag, defaultValue, validValues) => {
            const index = args.indexOf(flag);
            if (index === -1)
                return defaultValue;
            if (index + 1 >= args.length || args[index + 1].startsWith('--')) {
                console.error(`❌ Error: Missing value for ${flag} flag.`);
                process.exit(1);
            }
            const value = args[index + 1];
            if (validValues && !validValues.includes(value)) {
                console.error(`❌ Error: Invalid value for ${flag}. Valid values are: ${validValues.join(', ')}`);
                process.exit(1);
            }
            return value;
        };
        // Helper function to parse numeric argument
        const getNumericValue = (flag, defaultValue) => {
            const value = getArgValue(flag, defaultValue.toString());
            const numValue = parseInt(value);
            if (isNaN(numValue)) {
                console.error(`❌ Error: Value for ${flag} must be a number.`);
                process.exit(1);
            }
            if (numValue < 0) {
                console.error(`❌ Error: Value for ${flag} must be non-negative.`);
                process.exit(1);
            }
            return numValue;
        };
        const options = {
            outputDir: getArgValue('--output', 'generated-documents'),
            quiet: args.includes('--quiet'),
            verbose: args.includes('--verbose'),
            format: getArgValue('--format', 'markdown', ['markdown', 'json', 'yaml', 'docx', 'pptx']),
            retries: getNumericValue('--retries', 0),
            showProgress: !args.includes('--quiet') && !args.includes('--no-progress'),
            showMetrics: args.includes('--metrics') || args.includes('--verbose'),
            // NEW: Provider selection option
            provider: getArgValue('--provider', '', ['', 'github-ai', 'google-ai', 'azure-openai', 'azure-openai-key', 'ollama'])
        }; // Show version
        if (args.includes('--version') || args.includes('-v')) {
            console.log('v2.1.3'); // Updated version
            return;
        }
        // Show milestone achievement
        if (args.includes('--milestone') || args.includes('--achievement')) {
            showMilestoneDetails();
            return;
        }
        // Show status and configuration
        if (args.includes('--status') || args.includes('--info')) {
            await showStatus();
            return;
        } // Interactive provider selection
        if (args.includes('--select-provider') || args.includes('--choose-provider')) {
            await runProviderSelectionMenu();
            return;
        }
        // Interactive setup wizard
        if (args.includes('--setup')) {
            await runEnhancedSetupWizard();
            return;
        }
        // List available templates
        if (args.includes('--list-templates') || args.includes('--templates')) {
            showAvailableTemplates();
            return;
        }
        // Analyze workspace without generating
        if (args.includes('--analyze')) {
            await analyzeWorkspace();
            return;
        }
        // Show help
        if (args.includes('--help') || args.includes('-h')) {
            printHelp();
            return;
        }
        if (!options.quiet) {
            console.log('🔧 Initializing...');
        }
        // Validate environment and AI provider
        const isValid = await validateEnvironment(options);
        if (!isValid) {
            return;
        }
        if (!options.quiet) {
            console.log('🚀 Starting document generation...');
        }
        // Read project context with enhanced analysis and robust fallback
        let context;
        try {
            context = await readEnhancedProjectContext(process.cwd());
            if (!options.quiet) {
                console.log('✅ Enhanced project context loaded successfully');
            }
        }
        catch (error) {
            console.warn('⚠️ Could not read enhanced project context, using basic README.md');
            // Fallback to basic README.md reading
            const readmePath = join(process.cwd(), 'README.md');
            if (existsSync(readmePath)) {
                const { readFileSync } = await import('fs');
                context = readFileSync(readmePath, 'utf-8');
                if (!options.quiet) {
                    console.log('✅ Found README.md - using as project context');
                }
            }
            else {
                // Default sample project context
                context = `
# Sample Project
A comprehensive software project requiring PMBOK documentation.

## Features
- User management system
- Data processing capabilities
- Web-based dashboard
- API integration

## Technology Stack
- TypeScript/Node.js backend
- React frontend
- PostgreSQL database
- Azure cloud deployment
        `.trim();
                if (!options.quiet) {
                    console.log('📝 Using default project context (no README.md found)');
                }
            }
        }
        // Check for validation-only mode
        if (args.includes('--validate-only')) {
            if (!options.quiet)
                console.log('🔍 Validating existing documents...');
            const validator = new PMBOKValidator();
            const result = await validator.validatePMBOKCompliance();
            console.log('PMBOK Compliance:', result.compliance);
            console.log('Critical Findings:', result.findings.critical);
            console.log('Warnings:', result.findings.warnings);
            console.log('Recommendations:', result.findings.recommendations);
            console.log('Document Quality:', result.documentQuality);
            // Generate and save Markdown compliance report
            function formatMarkdownReport(result) {
                return `\n# PMBOK Compliance Report\n\n**Overall Compliance:** ${result.compliance ? '✅ Compliant' : '❌ Non-compliant'}\n\n## Critical Findings\n${result.findings.critical.length ? result.findings.critical.map((f) => `- ${f}`).join('\n') : 'None'}\n\n## Warnings\n${result.findings.warnings.length ? result.findings.warnings.map((f) => `- ${f}`).join('\n') : 'None'}\n\n## Recommendations\n${result.findings.recommendations.length ? result.findings.recommendations.map((f) => `- ${f}`).join('\n') : 'None'}\n\n## Document Quality\n${Object.entries(result.documentQuality).map(([doc, quality]) => {
                    const q = quality;
                    return `### ${doc}\n- Score: ${q.score}\n- Issues: ${q.issues.join('; ') || 'None'}\n- Strengths: ${q.strengths.join('; ') || 'None'}`;
                }).join('\n\n')}`;
            }
            const mdReport = formatMarkdownReport(result);
            const mdReportPath = join('generated-documents', 'compliance-report.md');
            await writeFile(mdReportPath, mdReport);
            console.log('Markdown compliance report written to:', mdReportPath);
            // Generate and save prompt adjustment report
            const missingElementsByDoc = {};
            for (const finding of result.findings.critical) {
                const match = finding.match(/^(.+): Missing required PMBOK element '(.+)'/);
                if (match) {
                    const [, doc, element] = match;
                    if (!missingElementsByDoc[doc])
                        missingElementsByDoc[doc] = [];
                    missingElementsByDoc[doc].push(element);
                }
            }
            let promptReport = '\n=== PROMPT ADJUSTMENT REPORT ===\n';
            for (const [doc, elements] of Object.entries(missingElementsByDoc)) {
                const els = elements;
                promptReport += `\nDocument: ${doc}\n`;
                els.forEach(el => promptReport += `  - Missing required element: ${el}\n`);
            }
            if (Object.keys(missingElementsByDoc).length === 0) {
                promptReport += 'All required PMBOK elements are present in your documents!\n';
            }
            const promptReportPath = join('generated-documents', 'prompt-adjustment-report.txt');
            await writeFile(promptReportPath, promptReport);
            console.log('Prompt adjustment report written to:', promptReportPath);
            return;
        }
        // Check for comprehensive validation mode
        if (args.includes('--generate-with-validation') || args.includes('--validate-pmbok')) {
            if (!options.quiet)
                console.log('🎯 Generating all documents with PMBOK 7.0 validation...');
            const result = await DocumentGenerator.generateAllWithPMBOKValidation(context);
            if (result.result.success) {
                console.log(`✅ Successfully generated ${result.result.successCount} documents with validation`);
                console.log(`📁 Check the ${options.outputDir}/ directory for organized output`);
            }
            else {
                console.error('❌ Document generation failed');
                process.exit(1);
            }
            return;
        } // Check for consistency validation only
        if (args.includes('--validate-consistency')) {
            if (!options.quiet)
                console.log('🔍 Checking cross-document consistency...');
            const generator = new DocumentGenerator(context, {
                format: options.format,
                provider: options.provider // Use selected provider for consistency validation
            });
            const pmbokCompliance = await generator.validatePMBOKCompliance();
            console.log(`🎯 Consistency Score: ${pmbokCompliance.consistencyScore}/100`);
            return;
        } // Check for quality assessment only
        if (args.includes('--quality-assessment')) {
            if (!options.quiet)
                console.log('📊 Performing document quality assessment...');
            const generator = new DocumentGenerator(context, {
                format: options.format,
                provider: options.provider // Use selected provider for quality assessment
            });
            const pmbokCompliance = await generator.validatePMBOKCompliance();
            return;
        }
        // Determine which documents to generate
        const generateTypes = new Set(args.filter(arg => arg.startsWith('--generate-')).map(arg => arg.replace('--generate-', '')));
        const generateAll = generateTypes.size === 0;
        try {
            // Create common generation options
            const generationOptions = {
                outputDir: options.outputDir,
                format: options.format,
                maxConcurrent: 1,
                delayBetweenCalls: 500,
                continueOnError: true,
                generateIndex: true,
                cleanup: true,
                provider: options.provider // Pass selected provider to enforce strict usage
            };
            if (generateAll || generateTypes.has('core')) {
                if (!options.quiet)
                    console.log('🎯 Generating core documents...');
                const generator = new DocumentGenerator(context, {
                    ...generationOptions,
                    includeCategories: ['core-analysis', 'project-charter']
                });
                await generator.generateAll();
            }
            if (generateAll || generateTypes.has('management')) {
                if (!options.quiet)
                    console.log('📋 Generating management plans...');
                const generator = new DocumentGenerator(context, {
                    ...generationOptions,
                    includeCategories: ['management-plans']
                });
                await generator.generateAll();
            }
            if (generateAll || generateTypes.has('planning')) {
                if (!options.quiet)
                    console.log('🏗️ Generating planning artifacts...');
                const generator = new DocumentGenerator(context, {
                    ...generationOptions,
                    includeCategories: ['planning-artifacts']
                });
                await generator.generateAll();
            }
            if (generateAll || generateTypes.has('technical')) {
                if (!options.quiet)
                    console.log('⚙️ Generating technical analysis...');
                const generator = new DocumentGenerator(context, {
                    ...generationOptions,
                    includeCategories: ['technical-analysis']
                });
                await generator.generateAll();
            }
            if (generateAll || generateTypes.has('stakeholder')) {
                if (!options.quiet)
                    console.log('👥 Generating stakeholder management...');
                const generator = new DocumentGenerator(context, {
                    ...generationOptions,
                    includeCategories: ['stakeholder-management']
                });
                await generator.generateAll();
            } // Fix the stakeholder generation section
            if (args.includes('--generate-stakeholder')) {
                console.log('📊 Generating stakeholder management documents...');
                const results = await generateDocumentsWithRetry(context, {
                    includeCategories: ['stakeholder-management'],
                    format: options.format,
                    outputDir: options.outputDir,
                    maxRetries: options.retries
                });
                if (results?.success) {
                    console.log(`✅ Successfully generated ${results.generatedFiles?.length || 0} stakeholder documents`);
                    console.log(`📁 Check the ${options.outputDir}/stakeholder-management/ directory`);
                }
                else {
                    console.error('❌ Failed to generate stakeholder documents');
                    process.exit(1);
                }
                return;
            } // Generate with validation if requested
            if (generateAll && !options.quiet) {
                console.log('\n🔍 Running document validation...');
                const generator = new DocumentGenerator(context, generationOptions);
                const validation = await generator.validateGeneration();
                if (validation.isComplete) {
                    console.log('✅ All documents generated and validated successfully!');
                }
                else {
                    console.log('⚠️ Some documents may be missing or incomplete');
                    validation.missing.forEach(doc => console.log(`   • ${doc}`));
                }
            }
            if (!options.quiet) {
                console.log('🎉 Document generation completed successfully!');
                console.log(`📁 Check the ${options.outputDir}/ directory for organized output`);
            }
        }
        catch (genError) {
            if (options.retries > 0) {
                if (!options.quiet)
                    console.log(`🔄 Retrying failed operations (${options.retries} attempts remaining)...`);
                await generateDocumentsWithRetry(context, { maxRetries: options.retries });
            }
            else {
                throw genError;
            }
        }
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        if (!error.message.includes('Configuration error')) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}
async function validateEnvironment(options) {
    // Check for help flag
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        printHelp();
        return false;
    }
    // Check for version flag
    if (process.argv.includes('--version') || process.argv.includes('-v')) {
        console.log('2.1.1');
        return false;
    }
    // Load environment variables
    const { config } = await import('dotenv');
    const result = config();
    // Check if .env file exists and provide helpful feedback
    const envPath = join(process.cwd(), '.env');
    const envExamplePath = join(process.cwd(), '.env.example');
    if (!existsSync(envPath)) {
        console.log('📄 No .env file found in current directory');
        if (existsSync(envExamplePath)) {
            console.log('💡 Found .env.example - copy it to .env and configure your settings');
            console.log('   cp .env.example .env');
        }
        else {
            console.log('💡 Create a .env file with your AI provider configuration');
        }
        return false;
    }
    else if (result.error) {
        console.warn('⚠️  Error loading .env file:', result.error.message);
        return false;
    }
    else {
        console.log('✅ Environment configuration loaded');
    }
    // If a specific provider is requested, validate only that provider
    if (options?.provider) {
        return await validateSpecificProvider(options.provider);
    }
    // Enhanced provider detection with better validation
    const providers = detectConfiguredProviders();
    if (providers.length === 0) {
        console.log('⚠️  No AI provider configuration found.');
        console.log('📋 Please configure at least one AI provider in your .env file.');
        console.log('📖 See .env.example for configuration options.');
        console.log('🔍 Ensure you have set the required environment variables for your AI provider. See RGA --help');
        console.log('💡 Run with --help for more information.');
        // Provide specific guidance based on missing configuration
        suggestProviderConfiguration();
        return false;
    }
    console.log(`✅ Found ${providers.length} configured provider(s): ${providers.join(', ')}`);
    // Validate Azure authentication if using Azure OpenAI with Entra ID
    if (process.env.USE_ENTRA_ID === 'true') {
        await validateAzureAuthentication();
    }
    return true;
}
function detectConfiguredProviders() {
    const providerConfigs = [
        {
            name: 'Google AI Studio',
            check: () => !!process.env.GOOGLE_AI_API_KEY
        },
        {
            name: 'Azure OpenAI (Entra ID)',
            check: () => !!process.env.AZURE_OPENAI_ENDPOINT && process.env.USE_ENTRA_ID === 'true'
        },
        {
            name: 'Azure OpenAI (API Key)',
            check: () => !!(process.env.AZURE_AI_ENDPOINT?.includes('openai.azure.com') && process.env.AZURE_AI_API_KEY)
        },
        {
            name: 'GitHub AI',
            check: () => !!(process.env.GITHUB_TOKEN &&
                process.env.GITHUB_ENDPOINT?.includes('models.github.ai'))
        },
        {
            name: 'Ollama (Local)',
            check: () => !!(process.env.OLLAMA_ENDPOINT?.includes('localhost:11434') ||
                process.env.OLLAMA_ENDPOINT?.includes('127.0.0.1:11434'))
        }
    ];
    return providerConfigs
        .filter(config => config.check())
        .map(config => config.name);
}
function suggestProviderConfiguration() {
    console.log('\n🔧 Quick setup suggestions:');
    console.log('\n🟣 For Google AI Studio (Free tier available):');
    console.log('   GOOGLE_AI_API_KEY=your-google-ai-api-key');
    console.log('   GOOGLE_AI_MODEL=gemini-1.5-flash');
    console.log('   Get API key: https://makersuite.google.com/app/apikey');
    console.log('\n🔷 For Azure OpenAI with Entra ID (Enterprise):');
    console.log('   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/');
    console.log('   DEPLOYMENT_NAME=gpt-4');
    console.log('   USE_ENTRA_ID=true');
    console.log('   Then run: az login');
    console.log('\n🔶 For Azure OpenAI with API Key:');
    console.log('   AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com/');
    console.log('   AZURE_AI_API_KEY=your-api-key');
    console.log('   REQUIREMENTS_AGENT_MODEL=gpt-4');
    console.log('\n🟢 For GitHub AI (Free tier available):');
    console.log('   GITHUB_ENDPOINT=https://models.github.ai/inference/');
    console.log('   GITHUB_TOKEN=your-github-token');
    console.log('   REQUIREMENTS_AGENT_MODEL=gpt-4o-mini');
    console.log('\n🟡 For Ollama (Local, offline):');
    console.log('   OLLAMA_ENDPOINT=http://localhost:11434');
    console.log('   REQUIREMENTS_AGENT_MODEL=llama3.1');
    console.log('   Then run: ollama serve');
}
async function validateAzureAuthentication() {
    try {
        console.log('🔐 Validating Azure authentication...');
        // Try to import Azure credential to validate availability
        const { DefaultAzureCredential } = await import('@azure/identity');
        const credential = new DefaultAzureCredential({
            managedIdentityClientId: process.env.AZURE_CLIENT_ID,
            tenantId: process.env.AZURE_TENANT_ID
        });
        // Attempt to get a token (this will validate authentication)
        try {
            const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
            if (tokenResponse) {
                console.log('✅ Azure authentication validated successfully');
            }
        }
        catch (authError) {
            console.warn('⚠️  Azure authentication may have issues:', authError.message);
            console.log('💡 Run "az login" to authenticate with Azure');
            console.log('💡 Ensure you have access to the Cognitive Services resource');
            console.log('💡 Check your Azure subscription and resource permissions');
        }
    }
    catch (importError) {
        console.warn('⚠️  Azure Identity SDK not available - install @azure/identity');
        console.log('💡 Run: npm install @azure/identity');
    }
}
// ===== V2.1.3 MILESTONE CELEBRATION UTILITIES =====
/**
 * Display milestone celebration banner for 175 weekly downloads achievement
 */
function showMilestoneBanner() {
    console.log('\n🎉═══════════════════════════════════════════════════════════════🎉');
    console.log('  🌟 MILESTONE ACHIEVEMENT: 175 WEEKLY DOWNLOADS! 🌟');
    console.log('  🎯 Thank you for being part of our growing community!');
    console.log('  📈 Your support drives continuous innovation');
    console.log('🎉═══════════════════════════════════════════════════════════════🎉\n');
}
/**
 * Show detailed milestone information and statistics
 */
function showMilestoneDetails() {
    console.log('\n🎉 Requirements Gathering Agent - Milestone Achievement\n');
    console.log('📊 PACKAGE METRICS:');
    console.log('   📈 Weekly Downloads: 175 (Growing!)');
    console.log('   🚀 Version: 2.1.3-celebration.0');
    console.log('   ⚡ Package Size: 380 kB (Optimized)');
    console.log('   📦 Total Files: 44');
    console.log('   🆓 License: MIT (Open Source)');
    console.log('   📈 Growth Trend: Upward');
    console.log('\n🎯 ACHIEVEMENT SIGNIFICANCE:');
    console.log('   ✅ Market Validation: Strong adoption by PM community');
    console.log('   ✅ Technical Excellence: Stable and reliable downloads');
    console.log('   ✅ PMBOK Compliance: Professional standards implementation');
    console.log('   ✅ AI Innovation: Azure OpenAI integration success');
    console.log('\n🚀 SUCCESS FACTORS:');
    console.log('   • 29-document comprehensive PMBOK suite');
    console.log('   • Multi-provider AI support (Azure, Google, GitHub, Ollama)');
    console.log('   • Professional project management methodology');
    console.log('   • Quality validation and consistency checking');
    console.log('\n🙏 Thank you for being part of our journey!');
    console.log('   🌐 GitHub: https://github.com/mdresch/requirements-gathering-agent');
    console.log('   📦 NPM: https://www.npmjs.com/package/requirements-gathering-agent');
    console.log('   📚 Documentation: See generated GitBook docs');
    console.log('');
}
/**
 * Show current system status and configuration
 */
async function showStatus() {
    try {
        console.log('\n🔍 Requirements Gathering Agent - System Status\n');
        // Version and environment info
        console.log('📋 VERSION INFO:');
        console.log(`   🚀 Version: 2.1.3`);
        console.log(`   📁 Working Directory: ${process.cwd()}`);
        console.log(`   🟢 Node.js: ${process.version}`);
        console.log(`   💻 Platform: ${process.platform}`);
        // Environment configuration
        console.log('\n⚙️  CONFIGURATION STATUS:');
        // Check for .env file
        const envPath = join(process.cwd(), '.env');
        if (existsSync(envPath)) {
            console.log('   ✅ .env file: Found');
            // Load and check providers
            const { config } = await import('dotenv');
            config();
            // Detailed provider status
            console.log('\n🤖 AI PROVIDER STATUS:');
            // Google AI Studio
            const googleKey = process.env.GOOGLE_AI_API_KEY;
            console.log('\n   🟣 Google AI Studio:');
            console.log(`      API Key: ${googleKey ? '✅ Set' : '❌ Missing'}`);
            if (googleKey) {
                console.log(`      Model: ${process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash (default)'}`);
            }
            // GitHub AI
            const githubToken = process.env.GITHUB_TOKEN;
            const githubEndpoint = process.env.GITHUB_ENDPOINT;
            console.log('\n   🟢 GitHub AI:');
            console.log(`      Token: ${githubToken ? '✅ Set' : '❌ Missing'}`);
            console.log(`      Endpoint: ${githubEndpoint ? '✅ Set' : '❌ Missing'}`);
            if (githubEndpoint) {
                console.log(`      URL: ${githubEndpoint}`);
            }
            // Azure OpenAI (Entra ID)
            const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const useEntraID = process.env.USE_ENTRA_ID === 'true';
            console.log('\n   🔷 Azure OpenAI (Entra ID):');
            console.log(`      Endpoint: ${azureOpenAIEndpoint ? '✅ Set' : '❌ Missing'}`);
            console.log(`      Entra ID: ${useEntraID ? '✅ Enabled' : '❌ Disabled'}`);
            if (azureOpenAIEndpoint) {
                console.log(`      URL: ${azureOpenAIEndpoint}`);
                console.log(`      Model: ${process.env.DEPLOYMENT_NAME || 'gpt-4 (default)'}`);
            }
            // Azure OpenAI (API Key)
            const azureAIEndpoint = process.env.AZURE_AI_ENDPOINT;
            const azureAIKey = process.env.AZURE_AI_API_KEY;
            console.log('\n   🔶 Azure OpenAI (API Key):');
            console.log(`      Endpoint: ${azureAIEndpoint ? '✅ Set' : '❌ Missing'}`);
            console.log(`      API Key: ${azureAIKey ? '✅ Set' : '❌ Missing'}`);
            if (azureAIEndpoint) {
                console.log(`      URL: ${azureAIEndpoint}`);
                console.log(`      Model: ${process.env.REQUIREMENTS_AGENT_MODEL || 'gpt-4 (default)'}`);
            }
            // Ollama
            const ollamaEndpoint = process.env.OLLAMA_ENDPOINT;
            const isOllama = ollamaEndpoint?.includes('localhost:11434') || ollamaEndpoint?.includes('127.0.0.1:11434');
            console.log('\n   🟡 Ollama (Local):');
            console.log(`      Endpoint: ${isOllama ? '✅ Set' : '❌ Not configured'}`);
            if (isOllama) {
                console.log(`      URL: ${ollamaEndpoint}`);
                console.log(`      Model: ${process.env.REQUIREMENTS_AGENT_MODEL || 'llama3.1 (default)'}`);
            }
            // Overall configuration status
            const providers = detectConfiguredProviders();
            console.log('\n📊 OVERALL STATUS:');
            if (providers.length > 0) {
                console.log(`   ✅ Configured Providers: ${providers.join(', ')}`);
            }
            else {
                console.log('   ⚠️  No fully configured providers found');
                console.log('   💡 Run --setup to configure providers');
            }
        }
        else {
            console.log('   ❌ .env file: Not found');
            console.log('   💡 Create a .env file with your AI provider configuration');
        }
        // Check output directory
        const outputDir = 'generated-documents';
        if (existsSync(outputDir)) {
            const { readdirSync } = await import('fs');
            const files = readdirSync(outputDir, { recursive: true });
            console.log(`\n📁 Output Directory: ${outputDir} (${files.length} files)`);
        }
        else {
            console.log(`\n📁 Output Directory: ${outputDir} (will be created)`);
        }
        // Project context status
        const readmePath = join(process.cwd(), 'README.md');
        if (existsSync(readmePath)) {
            console.log('   ✅ Project Context: README.md found');
        }
        else {
            console.log('   ⚠️  Project Context: No README.md (will use default)');
        }
        console.log('\n🎯 READY STATUS:');
        const isReady = existsSync(envPath) && detectConfiguredProviders().length > 0;
        if (isReady) {
            console.log('   ✅ System ready for document generation');
        }
        else {
            console.log('   ⚠️  System needs configuration (run --setup for help)');
        }
        console.log('');
    }
    catch (error) {
        console.error('   ❌ Error checking configuration:', error instanceof Error ? error.message : String(error));
    }
    finally {
        // Ensure the process exits
        setTimeout(() => process.exit(0), 100);
    }
}
/**
 * Interactive setup wizard for first-time users
 */
async function runSetupWizard() {
    console.log('\n🧙‍♂️ Requirements Gathering Agent - Setup Wizard\n');
    console.log('Welcome! Let\'s get you set up for PMBOK document generation.\n');
    // Step 1: Check current directory
    console.log('📁 STEP 1: Project Detection');
    const readmePath = join(process.cwd(), 'README.md');
    if (existsSync(readmePath)) {
        console.log('   ✅ Found README.md - this will be used as project context');
    }
    else {
        console.log('   ⚠️  No README.md found - a default context will be used');
        console.log('   💡 Tip: Create a README.md with your project description for better results');
    }
    // Step 2: Environment configuration
    console.log('\n⚙️  STEP 2: AI Provider Configuration');
    const envPath = join(process.cwd(), '.env');
    const envExamplePath = join(process.cwd(), '.env.example');
    if (!existsSync(envPath)) {
        console.log('   📝 Creating .env file configuration...');
        if (existsSync(envExamplePath)) {
            console.log('   💡 Found .env.example file');
            console.log('   📋 Copy .env.example to .env and configure your settings:');
            console.log('      cp .env.example .env');
        }
        else {
            console.log('   📝 Create a .env file with one of these configurations:');
        }
        console.log('\n🔧 RECOMMENDED CONFIGURATIONS:');
        console.log('\n   🟣 Google AI Studio (Free tier, quick setup):');
        console.log('      GOOGLE_AI_API_KEY=your-google-ai-api-key');
        console.log('      GOOGLE_AI_MODEL=gemini-1.5-flash');
        console.log('      Get key: https://makersuite.google.com/app/apikey');
        console.log('\n   🟢 GitHub AI (Free tier for GitHub users):');
        console.log('      AZURE_AI_ENDPOINT=https://models.inference.ai.azure.com');
        console.log('      GITHUB_TOKEN=your-github-token');
        console.log('      REQUIREMENTS_AGENT_MODEL=gpt-4o-mini');
        console.log('\n   🔷 Azure OpenAI (Enterprise, most reliable):');
        console.log('      AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/');
        console.log('      DEPLOYMENT_NAME=gpt-4');
        console.log('      USE_ENTRA_ID=true');
        console.log('      Then run: az login');
    }
    else {
        console.log('   ✅ .env file exists');
        const providers = detectConfiguredProviders();
        if (providers.length > 0) {
            console.log(`   ✅ Configured providers: ${providers.join(', ')}`);
        }
        else {
            console.log('   ⚠️  No valid provider configuration found in .env');
        }
    }
    // Step 3: Next steps
    console.log('\n🚀 STEP 3: Ready to Generate Documents');
    console.log('   📋 Once configured, run these commands:');
    console.log('      requirements-gathering-agent --help    # See all options');
    console.log('      requirements-gathering-agent           # Generate all documents');
    console.log('      requirements-gathering-agent --validate-pmbok  # With validation');
    console.log('\n📚 STEP 4: Learn More');
    console.log('   🌐 GitHub: https://github.com/mdresch/requirements-gathering-agent');
    console.log('   📖 Full documentation available in generated GitBook');
    console.log('   🎯 Run --status to check configuration anytime');
    console.log('\n✨ Happy documenting! Your PMBOK suite awaits.\n');
}
/**
 * Run the interactive provider selection menu
 */
async function runProviderSelectionMenu() {
    console.log('\n🤖 AI Provider Selection\n');
    // Check if we're in an interactive environment
    if (!process.stdout.isTTY) {
        console.log('⚠️  Non-interactive terminal detected');
        console.log('   Use --setup for non-interactive configuration');
        console.log('   Or run in an interactive terminal for the full menu experience');
        return;
    }
    const menu = new InteractiveProviderMenu({
        showMetrics: true,
        allowExit: true
    });
    try {
        const selectedProvider = await menu.showMenu();
        if (selectedProvider) {
            console.log(`\n✅ Successfully configured: ${selectedProvider}`);
            console.log('\n🚀 Ready to generate documents!');
            console.log('\nNext steps:');
            console.log('  requirements-gathering-agent           # Generate all documents');
            console.log('  requirements-gathering-agent --help    # See all options');
            console.log('  requirements-gathering-agent --status  # Check configuration');
        }
        else {
            console.log('\n👋 Provider selection cancelled.');
            console.log('   You can run this again anytime with --select-provider');
        }
    }
    catch (error) {
        console.error('\n❌ Error during provider selection:', error instanceof Error ? error.message : String(error));
        console.log('   You can try again or use --setup for manual configuration');
    }
    finally {
        await menu.cleanup();
    }
}
/**
 * Enhanced setup wizard with interactive provider selection
 */
async function runEnhancedSetupWizard() {
    console.log('\n🧙‍♂️ Requirements Gathering Agent - Enhanced Setup Wizard\n');
    console.log('Welcome! Let\'s get you set up for PMBOK document generation.\n');
    // Step 1: Project detection (existing logic)
    console.log('📁 STEP 1: Project Detection');
    const readmePath = join(process.cwd(), 'README.md');
    if (existsSync(readmePath)) {
        console.log('   ✅ Found README.md - this will be used as project context');
    }
    else {
        console.log('   ⚠️  No README.md found - a default context will be used');
        console.log('   💡 Tip: Create a README.md with your project description for better results');
    }
    // Step 2: Interactive provider selection
    console.log('\n⚙️  STEP 2: AI Provider Selection');
    // Check if we can use interactive menu
    if (process.stdout.isTTY && !process.env.CI) {
        console.log('Choose your AI provider for document generation:\n');
        const useInteractive = await getUserConfirmation('Would you like to use the interactive provider selection menu? (y/n): ');
        if (useInteractive) {
            await runProviderSelectionMenu();
        }
        else {
            // Fall back to existing configuration guidance
            await showProviderConfigurationGuidance();
        }
    }
    else {
        console.log('Non-interactive environment detected. Showing configuration guidance:');
        await showProviderConfigurationGuidance();
    }
}
function showAvailableTemplates() {
    console.log('\n📋 Requirements Gathering Agent - Available Templates\n');
    // ... existing implementation ...
}
async function analyzeWorkspace() {
    console.log('\n🔍 Requirements Gathering Agent - Workspace Analysis\n');
    // ... existing implementation ...
}
function printHelp() {
    console.log(`
🎉 Requirements Gathering Agent v2.1.3 - Celebrating 175 Weekly Downloads! 🎉
AI-powered PMBOK documentation generator with validation

USAGE:
  requirements-gathering-agent [options] [document-types]

OPTIONS:
  -h, --help              Show this help message
  -v, --version           Show version information
  --output <dir>          Specify output directory (default: generated-documents)
  --format <fmt>          Output format: markdown|json|yaml|docx|pptx (default: markdown)
  --quiet                 Suppress progress messages (good for CI/CD)
  --verbose               Enable verbose output with detailed progress
  --retries <n>           Number of retry attempts for failed generations
  --metrics               Show performance metrics (timing, token usage)
  --no-progress           Disable progress indicators
  --provider <id>         Explicitly select AI provider (overrides auto-detection)
                         Valid values: github-ai, google-ai, azure-openai, azure-openai-key, ollama
  --milestone, --achievement    Show milestone celebration details
  --status, --info             Show system status and configuration
  --setup                      Enhanced interactive setup wizard for new users
  --select-provider            Interactive AI provider selection menu  
  --choose-provider            (Alternative flag for provider selection)
  --list-templates, --templates Show available document templates
  --analyze                    Analyze workspace without generating docs

DOCUMENT TYPES:
  --generate-core         Generate core analysis documents
  --generate-management   Generate management plans
  --generate-planning     Generate planning artifacts
  --generate-technical    Generate technical analysis
  --generate-stakeholder  Generate stakeholder management documents
  (If no types specified, generates all document types)

VALIDATION OPTIONS:
  --validate-pmbok        Generate all documents with PMBOK 7.0 validation
  --generate-with-validation  Generate with comprehensive quality assessment
  --validate-only         Validate existing documents without regenerating
  --validate-consistency  Check cross-document consistency only
  --quality-assessment    Provide detailed quality scores for documents

PROVIDER SELECTION:
  --provider <id>         Use a specific AI provider for this run only.
                         Valid values:
                           github-ai         GitHub AI (free for GitHub users)
                           google-ai         Google AI Studio (free tier)
                           azure-openai      Azure OpenAI (Entra ID)
                           azure-openai-key  Azure OpenAI (API Key)
                           ollama            Ollama (local, offline)
  Example:
    requirements-gathering-agent --provider github-ai --generate-core
    requirements-gathering-agent --provider azure-openai-key --format docx

CONFIGURATION:
  Create a .env file with your AI provider configuration:
    GOOGLE_AI_API_KEY=your-google-ai-api-key
    GITHUB_TOKEN=your-github-token
    GITHUB_ENDPOINT=https://models.github.ai/inference/
    AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
    AZURE_OPENAI_API_KEY=your-api-key
    OLLAMA_ENDPOINT=http://localhost:11434

For more details, see the documentation or run with --status for configuration help.
`);
}
// Add missing function declarations
async function getUserConfirmation(prompt) {
    // ... existing implementation ...
    return false; // Placeholder return value
}
async function showProviderConfigurationGuidance() {
    // ... existing implementation ...
}
/**
 * Validate a specific AI provider selected by the user via --provider flag
 */
async function validateSpecificProvider(providerName) {
    console.log(`🎯 Validating selected provider: ${providerName}`);
    // Map CLI provider names to check functions
    const providerValidators = {
        'github-ai': () => !!(process.env.GITHUB_TOKEN &&
            process.env.GITHUB_ENDPOINT?.includes('models.github.ai')),
        'google-ai': () => !!process.env.GOOGLE_AI_API_KEY,
        'azure-openai': () => !!(process.env.AZURE_OPENAI_ENDPOINT &&
            process.env.USE_ENTRA_ID === 'true'),
        'azure-openai-key': () => !!((process.env.AZURE_AI_ENDPOINT?.includes('openai.azure.com') ||
            process.env.AZURE_OPENAI_ENDPOINT?.includes('openai.azure.com')) &&
            (process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY)),
        'ollama': () => !!(process.env.OLLAMA_ENDPOINT?.includes('localhost:11434') ||
            process.env.OLLAMA_ENDPOINT?.includes('127.0.0.1:11434'))
    };
    const validator = providerValidators[providerName];
    if (!validator) {
        console.error(`❌ Unknown provider: ${providerName}`);
        console.error('   Valid providers: github-ai, google-ai, azure-openai, azure-openai-key, ollama');
        return false;
    }
    const isConfigured = validator();
    if (!isConfigured) {
        console.error(`❌ Provider ${providerName} is not properly configured`);
        console.error('   Please check your .env file and ensure all required environment variables are set');
        // Provide specific guidance for the selected provider
        await provideProviderSpecificGuidance(providerName);
        return false;
    }
    console.log(`✅ Provider ${providerName} is properly configured`);
    // Special handling for Azure OpenAI with Entra ID
    if (providerName === 'azure-openai' && process.env.USE_ENTRA_ID === 'true') {
        await validateAzureAuthentication();
    }
    return true;
}
/**
 * Provide specific configuration guidance for a provider
 */
async function provideProviderSpecificGuidance(providerName) {
    const guidance = {
        'github-ai': [
            'Required environment variables:',
            '  GITHUB_TOKEN=your-github-token',
            '  GITHUB_ENDPOINT=https://models.github.ai/inference/',
            '',
            'Get your GitHub token at: https://github.com/settings/tokens'
        ],
        'google-ai': [
            'Required environment variables:',
            '  GOOGLE_AI_API_KEY=your-api-key',
            '',
            'Get your API key at: https://makersuite.google.com/app/apikey'
        ],
        'azure-openai': [
            'Required environment variables:',
            '  AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/',
            '  USE_ENTRA_ID=true',
            '  AZURE_CLIENT_ID=your-client-id',
            '  AZURE_TENANT_ID=your-tenant-id',
            '  AZURE_CLIENT_SECRET=your-client-secret',
            '',
            'Then run: az login'
        ],
        'azure-openai-key': [
            'Required environment variables:',
            '  AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/',
            '  AZURE_OPENAI_API_KEY=your-api-key',
            '  AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4',
            '',
            'Get these from your Azure OpenAI resource in the Azure Portal'
        ],
        'ollama': [
            'Required environment variables:',
            '  OLLAMA_ENDPOINT=http://localhost:11434',
            '',
            'Make sure Ollama is running locally with: ollama serve'
        ]
    };
    const providerGuidance = guidance[providerName];
    if (providerGuidance) {
        console.log('\n💡 Configuration guidance:');
        providerGuidance.forEach(line => console.log(`   ${line}`));
    }
}
// Run main function
main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map