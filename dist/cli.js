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
import { execSync } from 'child_process';
import os from 'os';
import { InteractiveProviderMenu } from './modules/ai/interactive-menu.js';
import { DocumentGenerator, generateDocumentsWithRetry } from './modules/documentGenerator.js';
import { readEnhancedProjectContext } from './modules/fileManager.js';
import { PMBOKValidator } from './modules/pmbokValidation/PMBOKValidator.js';
import { writeFile, readFile, mkdir } from 'fs/promises';
import readline from 'readline';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function checkGitInstalled() {
    try {
        execSync('git --version', { stdio: 'ignore' });
        return true;
    }
    catch {
        return false;
    }
}
async function promptAndInstallGitWindows() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question('Would you like to install Git automatically using winget? (y/n): ', async (answer) => {
            rl.close();
            if (answer.trim().toLowerCase().startsWith('y')) {
                console.log('⚠️  This will require elevated (administrator) privileges.');
                console.log('Attempting to install Git using winget...');
                try {
                    const { execSync } = await import('child_process');
                    execSync('winget install --id Git.Git -e', { stdio: 'inherit' });
                    console.log('✅ Git installation complete. Please restart your terminal and re-run the command.');
                }
                catch (e) {
                    console.error('❌ Automatic installation failed. Please install Git manually from https://git-scm.com/downloads');
                }
                process.exit(0);
            }
            else {
                console.log('Please install Git manually from https://git-scm.com/downloads');
                process.exit(1);
            }
        });
    });
}
function promptGitInstallIfMissing() {
    if (!checkGitInstalled()) {
        console.error('❌ Git is not installed or not in your PATH.');
        console.log('Please install Git: https://git-scm.com/downloads');
        if (os.platform() === 'win32') {
            console.log('Or install automatically by running:');
            console.log('  winget install --id Git.Git -e');
            return promptAndInstallGitWindows();
        }
        process.exit(1);
    }
}
// Call this function before any git VCS operation
// promptGitInstallIfMissing();
async function ensureGitRepoInitialized(documentsDir = 'generated-documents') {
    const path = (await import('path')).default;
    const gitDir = path.join(process.cwd(), documentsDir, '.git');
    if (!existsSync(gitDir)) {
        console.log(`Initializing git repository in ${documentsDir}/ ...`);
        try {
            execSync('git init', { cwd: path.join(process.cwd(), documentsDir), stdio: 'inherit' });
            console.log('✅ Git repository initialized.');
        }
        catch (e) {
            console.error('❌ Failed to initialize git repository:', e);
            process.exit(1);
        }
    }
}
async function main() {
    try {
        // Show milestone celebration banner occasionally (10% chance)
        if (Math.random() < 0.1) {
            showMilestoneBanner();
        }
        console.log('🚀 Requirements Gathering Agent v2.1.3'); // Updated version
        // Parse and validate command line arguments
        const args = process.argv.slice(2);
        // CLI scaffolding: generate new processor via flag
        if (args.includes('--generate:processor')) {
            const catIdx = args.indexOf('--category');
            const category = catIdx > -1 && args.length > catIdx + 1 ? args[catIdx + 1] : '';
            const nameIdx = args.indexOf('--name');
            const name = nameIdx > -1 && args.length > nameIdx + 1 ? args[nameIdx + 1] : '';
            if (!category || !name) {
                console.error('Usage: rga --generate:processor --category <category> --name <Name>');
                process.exit(1);
            }
            await scaffoldNewProcessor(category, name);
            return;
        }
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
            format: getArgValue('--format', 'markdown', ['markdown', 'json', 'yaml']),
            retries: getNumericValue('--retries', 0),
            showProgress: !args.includes('--quiet') && !args.includes('--no-progress'),
            showMetrics: args.includes('--metrics') || args.includes('--verbose')
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
            // Reload .env and re-initialize configuration after provider selection
            const { config } = await import('dotenv');
            config();
            try {
                const { ConfigurationManager } = await import('./modules/ai/ConfigurationManager.js');
                if (ConfigurationManager && ConfigurationManager.getInstance) {
                    // Clear validation cache to force re-validation with new env
                    const cm = ConfigurationManager.getInstance();
                    if (typeof cm.clearValidationCache === 'function') {
                        cm.clearValidationCache();
                    }
                }
            }
            catch (e) {
                // If ConfigurationManager is not used, ignore
            }
            console.log('♻️  Environment reloaded. New provider configuration is now active.');
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
        // --- VCS COMMANDS ---
        if (args[0] === 'vcs') {
            const vcsCmd = args[1];
            const vcsFile = args[2];
            const vcsCommit = args[3];
            const vcsDir = options?.outputDir || 'generated-documents';
            promptGitInstallIfMissing();
            await ensureGitRepoInitialized(vcsDir);
            const path = (await import('path')).default;
            const cwd = path.join(process.cwd(), vcsDir);
            try {
                switch (vcsCmd) {
                    case 'log':
                        execSync(`git log --oneline --graph --decorate --all`, { cwd, stdio: 'inherit' });
                        break;
                    case 'diff':
                        if (!vcsFile)
                            throw new Error('Specify a file for diff.');
                        execSync(`git diff ${vcsFile}`, { cwd, stdio: 'inherit' });
                        break;
                    case 'revert':
                        if (!vcsFile || !vcsCommit)
                            throw new Error('Specify a file and commit hash for revert.');
                        execSync(`git checkout ${vcsCommit} -- ${vcsFile}`, { cwd, stdio: 'inherit' });
                        console.log(`Reverted ${vcsFile} to ${vcsCommit}`);
                        break;
                    case 'status':
                        execSync(`git status`, { cwd, stdio: 'inherit' });
                        break;
                    case 'push':
                        execSync(`git push`, { cwd, stdio: 'inherit' });
                        break;
                    case 'pull':
                        execSync(`git pull`, { cwd, stdio: 'inherit' });
                        break;
                    default:
                        console.log('VCS commands: log, diff <file>, revert <file> <commit>, status, push, pull');
                }
            }
            catch (e) {
                const err = e;
                console.error('❌ VCS command failed:', err.message);
            }
            return;
        }
        if (!options.quiet) {
            console.log('🔧 Initializing...');
        }
        // Validate environment and AI provider
        const isValid = await validateEnvironment();
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
        }
        // Check for consistency validation only
        if (args.includes('--validate-consistency')) {
            if (!options.quiet)
                console.log('🔍 Checking cross-document consistency...');
            const generator = new DocumentGenerator(context);
            const pmbokCompliance = await generator.validatePMBOKCompliance();
            console.log(`🎯 Consistency Score: ${pmbokCompliance.consistencyScore}/100`);
            return;
        }
        // Check for quality assessment only
        if (args.includes('--quality-assessment')) {
            if (!options.quiet)
                console.log('📊 Performing document quality assessment...');
            const generator = new DocumentGenerator(context);
            const pmbokCompliance = await generator.validatePMBOKCompliance();
            return;
        }
        // Handle single-document generation via --generate <key>
        if (args.includes('--generate')) {
            const idx = args.indexOf('--generate');
            const docKey = args[idx + 1];
            if (!docKey) {
                console.error('❌ Missing document key for --generate');
                return;
            }
            if (!options.quiet)
                console.log(`🚀 Generating single document: ${docKey}...`);
            const generator = new DocumentGenerator(context);
            await generator.generateOne(docKey);
            return;
        }
        // Determine which documents to generate
        const generateTypes = new Set(args.filter(arg => arg.startsWith('--generate-')).map(arg => arg.replace('--generate-', '')));
        const generateAll = generateTypes.size === 0;
        try {
            if (generateAll || generateTypes.has('core')) {
                if (!options.quiet)
                    console.log('🎯 Generating core documents...');
                await DocumentGenerator.generateCoreDocuments(context);
            }
            if (generateAll || generateTypes.has('management')) {
                if (!options.quiet)
                    console.log('📋 Generating management plans...');
                await DocumentGenerator.generateManagementPlans(context);
            }
            if (generateAll || generateTypes.has('planning')) {
                if (!options.quiet)
                    console.log('🏗️ Generating planning artifacts...');
                await DocumentGenerator.generatePlanningArtifacts(context);
            }
            if (generateAll || generateTypes.has('technical')) {
                if (!options.quiet)
                    console.log('⚙️ Generating technical analysis...');
                await DocumentGenerator.generateTechnicalAnalysis(context);
            }
            if (generateAll || generateTypes.has('stakeholder')) {
                if (!options.quiet)
                    console.log('👥 Generating stakeholder management...');
                await DocumentGenerator.generateStakeholderDocuments(context);
            }
            // Fix the stakeholder generation section
            if (args.includes('--generate-stakeholder')) {
                console.log('📊 Generating stakeholder management documents...');
                const results = await generateDocumentsWithRetry(context, {
                    includeCategories: ['stakeholder-management'],
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
            }
            // Generate with validation if requested
            if (generateAll && !options.quiet) {
                console.log('\n🔍 Running document validation...');
                const generator = new DocumentGenerator(context);
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
        // Auto-commit changes in generated-documents/ directory
        autoCommitGeneratedDocuments(options.outputDir, process.env.CURRENT_PROVIDER, process.env.REQUIREMENTS_AGENT_MODEL);
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        if (!error.message.includes('Configuration error')) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}
function autoCommitGeneratedDocuments(documentsDir = 'generated-documents', provider = '', model = '') {
    import('path').then(pathModule => {
        const path = pathModule.default;
        const commitMsg = `Generated/updated documents on ${new Date().toISOString()}${provider ? ` [by ${provider}${model ? '/' + model : ''}]` : ''}`;
        try {
            execSync('git add .', { cwd: path.join(process.cwd(), documentsDir), stdio: 'inherit' });
            execSync(`git commit -m "${commitMsg}"`, { cwd: path.join(process.cwd(), documentsDir), stdio: 'inherit' });
            console.log('✅ Auto-commit complete.');
        }
        catch (e) {
            const err = e;
            if (err && err.message && err.message.includes('nothing to commit')) {
                console.log('No changes to commit.');
            }
            else {
                console.error('❌ Auto-commit failed:', err);
            }
        }
    });
}
async function validateEnvironment() {
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
                console.log(`      Model: ${process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash'}`);
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
                console.log(`      Model: ${process.env.DEPLOYMENT_NAME || 'gpt-4'}`);
            }
            // Azure OpenAI (API Key)
            const azureAIEndpoint = process.env.AZURE_AI_ENDPOINT;
            const azureAIKey = process.env.AZURE_AI_API_KEY;
            console.log('\n   🔶 Azure OpenAI (API Key):');
            console.log(`      Endpoint: ${azureAIEndpoint ? '✅ Set' : '❌ Missing'}`);
            console.log(`      API Key: ${azureAIKey ? '✅ Set' : '❌ Missing'}`);
            if (azureAIEndpoint) {
                console.log(`      URL: ${azureAIEndpoint}`);
                console.log(`      Model: ${process.env.REQUIREMENTS_AGENT_MODEL || 'gpt-4'}`);
            }
            // Ollama
            const ollamaEndpoint = process.env.OLLAMA_ENDPOINT;
            const isOllama = ollamaEndpoint?.includes('localhost:11434') || ollamaEndpoint?.includes('127.0.0.1:11434');
            console.log('\n   🟡 Ollama (Local):');
            console.log(`      Endpoint: ${isOllama ? '✅ Set' : '❌ Not configured'}`);
            if (isOllama) {
                console.log(`      URL: ${ollamaEndpoint}`);
                console.log(`      Model: ${process.env.REQUIREMENTS_AGENT_MODEL || 'llama3.1'}`);
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
            // After provider selection, ensure CURRENT_PROVIDER is written to .env
            if (typeof selectedProvider === 'string' && selectedProvider.length > 0) {
                const fs = await import('fs/promises');
                const path = await import('path');
                const envPath = path.join(process.cwd(), '.env');
                let envContent = '';
                try {
                    envContent = await fs.readFile(envPath, 'utf8');
                }
                catch { /* file may not exist yet */ }
                const currentProviderLine = `CURRENT_PROVIDER=${selectedProvider}`;
                const currentProviderRegex = /^CURRENT_PROVIDER=.*$/m;
                if (currentProviderRegex.test(envContent)) {
                    envContent = envContent.replace(currentProviderRegex, currentProviderLine);
                }
                else {
                    if (envContent && !envContent.endsWith('\n'))
                        envContent += '\n';
                    envContent += currentProviderLine + '\n';
                }
                await fs.writeFile(envPath, envContent, 'utf8');
                process.env.CURRENT_PROVIDER = selectedProvider;
            }
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
    // Modular architecture: templates are loaded from processor-config.json and generationTasks.ts
    // Example (abbreviated):
    console.log('Planning Artifacts:');
    console.log('  • Project KickOff Preparations Checklist (key: project-kickoff-preparations-checklist)');
    // ...list other templates by category...
    // For full list, see documentation or run with --help
}
function printHelp() {
    console.log(`
Requirements Gathering Agent v2.1.3 - Celebrating 175 Weekly Downloads!
AI-powered PMBOK documentation generator with validation

USAGE:
  requirements-gathering-agent [options] [document-types]

OPTIONS:
  -h, --help              Show this help message
  -v, --version           Show version information
  --output <dir>          Specify output directory (default: generated-documents)
  --format <fmt>          Output format: markdown|json|yaml (default: markdown)
  --quiet                 Suppress progress messages (good for CI/CD)
  --verbose               Enable verbose output with detailed progress
  --retries <n>           Number of retry attempts for failed generations
  --metrics               Show performance metrics (timing, token usage)
  --no-progress           Disable progress indicators

NEW V2.1.3 FEATURES:
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

CONFIGURATION:
  Create a .env file with your AI provider configuration:
  
  Google AI Studio (Free tier available):
    GOOGLE_AI_API_KEY=your-google-ai-api-key
    GOOGLE_AI_MODEL=gemini-1.5-flash
  
  Azure OpenAI with Entra ID (Recommended):
    AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
    DEPLOYMENT_NAME=gpt-4
    USE_ENTRA_ID=true
  
  Azure OpenAI with API Key:
    AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com/
    AZURE_AI_API_KEY=your-api-key
    REQUIREMENTS_AGENT_MODEL=gpt-4
  
  GitHub AI (Free tier):
    AZURE_AI_ENDPOINT=https://models.inference.ai.azure.com
    GITHUB_TOKEN=your-github-token
    REQUIREMENTS_AGENT_MODEL=gpt-4o-mini
  
  Ollama (Local):
    OLLAMA_ENDPOINT=http://localhost:11434
    REQUIREMENTS_AGENT_MODEL=llama3.1

AUTHENTICATION:
  For Azure Entra ID: Run "az login" to authenticate.
  For API keys: Set in .env file.
  For Ollama: Start "ollama serve".

VCS (VERSION CONTROL) COMMANDS:
  requirements-gathering-agent vcs log
      Show commit history for generated documents.
  requirements-gathering-agent vcs diff <file>
      Show changes for a specific document.
  requirements-gathering-agent vcs revert <file> <commit>
      Revert a document to a previous version.
  requirements-gathering-agent vcs status
      Show uncommitted changes in generated docs.
  requirements-gathering-agent vcs push
      Push local changes to remote repository (if configured).
  requirements-gathering-agent vcs pull
      Pull latest changes from remote repository (if configured).

Learn more:
  See documentation: https://github.com/mdresch/requirements-gathering-agent
  Run "requirements-gathering-agent --help" for command options.

Ready to configure your AI provider? Let's go!
`);
}
/**
 * Interactive confirmation prompt
 */
async function getUserConfirmation(prompt) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
}
/**
 * Show provider configuration guidance
 */
async function showProviderConfigurationGuidance() {
    console.log(`
📋 AI Provider Configuration Guidance

To get started, you need to configure at least one AI provider in your .env file.

🔧 Recommended Quick Setup:
1. For Google AI Studio (Free tier):
    - GOOGLE_AI_API_KEY=your-google-ai-api-key
    - GOOGLE_AI_MODEL=gemini-1.5-flash
    - Get API key: https://makersuite.google.com/app/apikey

2. For Azure OpenAI with Entra ID (Enterprise):
    - AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
    - DEPLOYMENT_NAME=gpt-4
    - USE_ENTRA_ID=true
    - Then run: az login

3. For Azure OpenAI with API Key:
    - AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com/
    - AZURE_AI_API_KEY=your-api-key
    - REQUIREMENTS_AGENT_MODEL=gpt-4

4. For GitHub AI (Free tier):
    - AZURE_AI_ENDPOINT=https://models.inference.ai.azure.com
    - GITHUB_TOKEN=your-github-token
    - REQUIREMENTS_AGENT_MODEL=gpt-4o-mini

5. For Ollama (Local, offline):
    - OLLAMA_ENDPOINT=http://localhost:11434
    - REQUIREMENTS_AGENT_MODEL=llama3.1
    - Then run: ollama serve

📄 Example .env file:
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_AI_MODEL=gemini-1.5-flash

AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
DEPLOYMENT_NAME=gpt-4
USE_ENTRA_ID=true

AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_AI_API_KEY=your-api-key
REQUIREMENTS_AGENT_MODEL=gpt-4

GITHUB_ENDPOINT=https://models.github.ai/inference/
GITHUB_TOKEN=your-github-token
REQUIREMENTS_AGENT_MODEL=gpt-4o-mini

OLLAMA_ENDPOINT=http://localhost:11434
REQUIREMENTS_AGENT_MODEL=llama3.1

🔑 Authentication:
  For Azure Entra ID: Run 'az login' to authenticate.
  For API keys: Set in .env file.
  For Ollama: Start 'ollama serve'.

📚 Learn more:
  See documentation: https://github.com/mdresch/requirements-gathering-agent
  Run 'requirements-gathering-agent --help' for command options.

Ready to configure your AI provider? Let's go!
`);
}
/**
 * Analyze workspace for context and documentation
 */
async function analyzeWorkspace() {
    console.log('\n🔍 Requirements Gathering Agent - Workspace Analysis\n');
    try {
        const { analyzeProjectComprehensively } = await import('./modules/projectAnalyzer.js');
        const projectPath = process.cwd();
        const analysis = await analyzeProjectComprehensively(projectPath);
        // (Moved CLI scaffolding block inside main())
        console.log('\n🔗 Suggested Context Sources:');
        if (analysis.suggestedSources && analysis.suggestedSources.length > 0) {
            analysis.suggestedSources.forEach(src => console.log(`   - ${src}`));
        }
        else {
            console.log('   (No additional sources suggested)');
        }
        console.log('\n🧠 Project Context Preview:\n');
        console.log(analysis.projectContext.slice(0, 500) + (analysis.projectContext.length > 500 ? ' ...' : ''));
        console.log(analysis.projectContext.slice(0, 500) + (analysis.projectContext.length > 500 ? ' ...' : ''));
        console.log('\n✅ Workspace analysis complete.\n');
    }
    catch (error) {
        console.error('❌ Error analyzing workspace:', error.message);
    }
}
// (Removed duplicate CLI scaffolding block - handled inside main())
async function scaffoldNewProcessor(category, name) {
    const rootDir = process.cwd();
    const key = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const templateDir = join(rootDir, 'src', 'modules', 'documentTemplates', category);
    await mkdir(templateDir, { recursive: true });
    const templateFile = join(templateDir, `${name}Template.ts`);
    const processorFile = join(templateDir, `${name}Processor.ts`);
    // Standard Template stub
    const templateContent = `import type { ProjectContext } from '../../ai/types';

/**
 * ${name} Template generates the content for the ${name} document.
 */
export class ${name}Template {
  constructor(private context: ProjectContext) {}

  /**
   * Build the markdown content for ${name}
   */
  generateContent(): string {
    // TODO: Implement content generation logic using this.context
    return \`# ${name}\\n\\n\` +
      \`**Project:** \${this.context.projectName}\\n\\n\` +
      \`- Replace this with your checklist items or sections\`;
  }
}`; // Standard Processor stub
    const processorContent = `import { AIProcessor } from '../../ai/AIProcessor.js';
import type { ProjectContext } from '../../ai/types.js';
import type { DocumentProcessor, DocumentOutput } from '../../documentGenerator/types.js';
import { ${name}Template } from '../${category}/${name}Template.js';

class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * Processor for the ${name} document.
 */
export class ${name}Processor implements DocumentProcessor {
  private aiProcessor: AIProcessor;

  constructor() {
    this.aiProcessor = AIProcessor.getInstance();
  }

  async process(context: ProjectContext): Promise<DocumentOutput> {
    try {
      const prompt = this.createPrompt(context);
      const content = await this.aiProcessor.makeAICall([
        { role: 'system', content: 'You are an expert consultant specializing in ${category.replace('-', ' ')} documentation. Generate comprehensive, professional content based on the project context.' },
        { role: 'user', content: prompt }
      ]).then(res => typeof res === 'string' ? res : res.content);

      await this.validateOutput(content);
      
      return {
        title: '${name}',
        content
      };
    } catch (error) {
      if (error instanceof ExpectedError) {
        console.warn('Expected error in ${name} processing:', error.message);
        throw new Error(\`Failed to generate ${name}: \${error.message}\`);
      } else {
        console.error('Unexpected error in ${name} processing:', error);
        throw new Error('An unexpected error occurred while generating ${name}');
      }
    }
  }

  private createPrompt(context: ProjectContext): string {
    // Get the template as an example structure
    const template = new ${name}Template(context);
    const exampleStructure = template.generateContent();

    return \`Based on the following project context, generate a comprehensive ${name} document.

Project Context:
- Name: \${context.projectName || 'Untitled Project'}
- Type: \${context.projectType || 'Not specified'}
- Description: \${context.description || 'No description provided'}

Use this structure as a reference (but customize the content for the specific project):

\${exampleStructure}

Important Instructions:
- Make the content specific to the project context provided
- Ensure the language is professional and appropriate for the document type
- Include practical guidance where applicable
- Focus on what makes this project unique
- Use markdown formatting for proper structure
- Keep content concise but comprehensive\`;
  }

  private async validateOutput(content: string): Promise<void> {
    if (!content || content.trim().length === 0) {
      throw new ExpectedError('Generated content is empty');
    }

    // Basic validation - ensure content has some structure
    if (!content.includes('#')) {
      throw new ExpectedError('Generated content lacks proper markdown structure');
    }
  }
}`;
    await writeFile(templateFile, templateContent + '\n');
    await writeFile(processorFile, processorContent + '\n');
    const configPath = join(rootDir, 'src', 'modules', 'documentGenerator', 'processor-config.json');
    const configJson = JSON.parse(await readFile(configPath, 'utf-8'));
    // Add processor entry with module path, empty dependencies, and default priority
    configJson[key] = {
        module: `../documentTemplates/${category}/${name}Processor.ts#${name}Processor`,
        dependencies: [],
        priority: 999
    };
    await writeFile(configPath, JSON.stringify(configJson, null, 2) + '\n');
    // Backup ProcessorFactory.ts before updating
    // const backupPath = join(rootDir, 'src', 'modules', 'documentGenerator', `ProcessorFactory.${Date.now()}.bak.ts`);
    // await copyFile(factoryPath, backupPath);
    // console.log(`✅ Archived ProcessorFactory.ts to ${backupPath}`);
    // Update generationTasks.ts to include the new document task
    const tasksPath = join(rootDir, 'src', 'modules', 'documentGenerator', 'generationTasks.ts');
    let tasksContent = await readFile(tasksPath, 'utf-8');
    const newTaskEntry = `  {
    key: '${key}',
    name: '${name}',
    category: '${category}',
    func: '${key}.md',
    priority: 999,
    emoji: '📝',
    pmbokRef: ''
  },\n`;
    tasksContent = tasksContent.replace(/\n\];/, `\n${newTaskEntry}];`);
    // After updating GENERATION_TASKS, also update DOCUMENT_CONFIG
    const docConfigEntry = `    '${key}': { filename: '${category}/${key}.md', title: '${name}' },\n`;
    tasksContent = tasksContent.replace(/export const DOCUMENT_CONFIG:[^\n]+{/, match => `${match}\n${docConfigEntry}`);
    await writeFile(tasksPath, tasksContent);
    // Update fileManager.ts to register this document for version control
    const fmPath = join(rootDir, 'src', 'modules', 'fileManager.ts');
    let fmContent = await readFile(fmPath, 'utf-8');
    const newFmEntry = `    '${key}': { title: '${name}', filename: '${category}/${key}.md', category: DOCUMENT_CATEGORIES.${category.replace(/-/g, '_').toUpperCase()}, description: '', generatedAt: '' },\n`;
    // Insert after DOCUMENT_CONFIG opening brace
    fmContent = fmContent.replace(/(export const DOCUMENT_CONFIG:[^=]+=\s*{\s*\n)/, `$1${newFmEntry}`);
    await writeFile(fmPath, fmContent);
    console.log(`✅ Registered new document in fileManager.ts: ${key}`); // Add new category to DOCUMENT_CATEGORIES if it doesn't exist
    const fmCatPath = join(rootDir, 'src', 'modules', 'fileManager.ts');
    let fmCatContent = await readFile(fmCatPath, 'utf-8');
    const categoryConst = category.replace(/-/g, '_').toUpperCase();
    // More precise regex to check for existing category constant
    const categoryRegex = new RegExp(`^\\s*${categoryConst}:\\s*'[^']*',?\\s*$`, 'm');
    if (!categoryRegex.test(fmCatContent)) {
        fmCatContent = fmCatContent.replace(/(export const DOCUMENT_CATEGORIES = {)/, `$1\n    ${categoryConst}: '${category}',`);
        await writeFile(fmCatPath, fmCatContent);
        console.log(`✅ Added new category to DOCUMENT_CATEGORIES: ${category}`);
    }
    else {
        console.log(`ℹ️  Category ${categoryConst} already exists in DOCUMENT_CATEGORIES`);
    }
    console.log(`✅ Scaffolded new processor: ${name} under category ${category}`);
}
main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map