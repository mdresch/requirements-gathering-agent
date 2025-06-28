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
import { DocumentGenerator, generateDocumentsWithRetry, getAvailableCategories } from './modules/documentGenerator.js';
import { getTasksByCategory, GENERATION_TASKS } from './modules/documentGenerator/generationTasks.js';
import { readEnhancedProjectContext } from './modules/fileManager.js';
import { PMBOKValidator } from './modules/pmbokValidation/PMBOKValidator.js';
import { writeFile } from 'fs/promises';
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
        } // List available templates
        if (args.includes('--list-templates') || args.includes('--templates')) {
            await showAvailableTemplates();
            return;
        }
        // Migrate templates to database format
        if (args.includes('--migrate-templates')) {
            console.log('🚀 Starting template migration to database format...');
            try {
                const { migrateStaticTemplates } = await import('./modules/templates/CLIIntegration.js');
                const force = args.includes('--force');
                await migrateStaticTemplates({ force });
            }
            catch (error) {
                console.error('❌ Migration failed:', error);
                process.exit(1);
            }
            return;
        }
        // Generate with advanced template engine
        if (args.includes('--generate-advanced')) {
            const idx = args.indexOf('--generate-advanced');
            const templateId = args[idx + 1];
            if (!templateId) {
                console.error('❌ Missing template ID for --generate-advanced');
                return;
            }
            try {
                const { generateDocumentAdvanced, parseVariablesFromArgs } = await import('./modules/templates/CLIIntegration.js');
                const variables = parseVariablesFromArgs(args);
                await generateDocumentAdvanced(templateId, {
                    variables,
                    quiet: options.quiet,
                    outputDir: options.outputDir
                });
            }
            catch (error) {
                console.error('❌ Advanced generation failed:', error);
                process.exit(1);
            }
            return;
        }
        // Show template information
        if (args.includes('--template-info')) {
            const idx = args.indexOf('--template-info');
            const templateId = args[idx + 1];
            if (!templateId) {
                console.error('❌ Missing template ID for --template-info');
                return;
            }
            try {
                const { showTemplateInfo } = await import('./modules/templates/CLIIntegration.js');
                await showTemplateInfo(templateId);
            }
            catch (error) {
                console.error('❌ Failed to show template info:', error);
                process.exit(1);
            }
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
        } // --- VCS COMMANDS ---
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
        } // --- CONFLUENCE COMMANDS ---
        if (args[0] === 'confluence') {
            const confluenceCmd = args[1];
            const confluenceSubCmd = args[2];
            try {
                const { testConfluenceConnection, initConfluenceConfig, publishToConfluence, showConfluenceStatus, confluenceOAuth2Login, confluenceOAuth2Status, confluenceDebugOAuth2 } = await import('./modules/confluence/ConfluenceCLI.js');
                switch (confluenceCmd) {
                    case 'init':
                        await initConfluenceConfig();
                        break;
                    case 'test':
                        await testConfluenceConnection();
                        break;
                    case 'oauth2':
                        switch (confluenceSubCmd) {
                            case 'login':
                                await confluenceOAuth2Login();
                                break;
                            case 'status':
                                await confluenceOAuth2Status();
                                break;
                            case 'debug':
                                await confluenceDebugOAuth2();
                                break;
                            default:
                                console.log('🔐 Confluence OAuth2 Commands:');
                                console.log('  confluence oauth2 login  - Start OAuth2 authentication flow');
                                console.log('  confluence oauth2 status - Check OAuth2 authentication status');
                                console.log('  confluence oauth2 debug  - Debug OAuth2 configuration');
                                break;
                        }
                        break;
                    case 'publish':
                        const documentsPath = args[2] || options.outputDir;
                        const publishOptions = {
                            parentPageTitle: getArgValue('--parent-page', ''),
                            labelPrefix: getArgValue('--label-prefix', 'adpa'),
                            dryRun: args.includes('--dry-run'),
                            force: args.includes('--force')
                        };
                        await publishToConfluence(documentsPath, publishOptions);
                        break;
                    case 'status':
                        await showConfluenceStatus();
                        break;
                    default:
                        console.log('🔗 Confluence Integration Commands:');
                        console.log('  confluence init         - Initialize Confluence configuration');
                        console.log('  confluence test         - Test Confluence connection');
                        console.log('  confluence oauth2 login - Start OAuth2 authentication (recommended)');
                        console.log('  confluence oauth2 status- Check OAuth2 authentication status');
                        console.log('  confluence publish      - Publish documents to Confluence');
                        console.log('  confluence status       - Show Confluence integration status');
                        console.log('\nAuthentication Methods:');
                        console.log('  • OAuth2 (recommended) - More secure, uses modern authentication');
                        console.log('  • API Token (legacy)   - Basic auth with API token');
                        console.log('\nPublish Options:');
                        console.log('  --parent-page <title>  - Parent page title for organization');
                        console.log('  --label-prefix <prefix> - Label prefix for published pages');
                        console.log('  --dry-run             - Preview what would be published');
                        console.log('  --force               - Force publish even if validation fails');
                }
            }
            catch (e) {
                const err = e;
                console.error('❌ Confluence command failed:', err.message);
            }
            return;
        }
        // --- SHAREPOINT COMMANDS ---
        if (args[0] === 'sharepoint') {
            const sharepointCmd = args[1];
            const sharepointSubCmd = args[2];
            try {
                const { testSharePointConnection, initSharePointConfig, publishToSharePoint, showSharePointStatus, sharePointOAuth2Login, sharePointOAuth2Status, sharePointDebugOAuth2 } = await import('./modules/sharepoint/SharePointCLI.js');
                switch (sharepointCmd) {
                    case 'init':
                        await initSharePointConfig();
                        break;
                    case 'test':
                        await testSharePointConnection();
                        break;
                    case 'oauth2':
                        switch (sharepointSubCmd) {
                            case 'login':
                                await sharePointOAuth2Login();
                                break;
                            case 'status':
                                await sharePointOAuth2Status();
                                break;
                            case 'debug':
                                await sharePointDebugOAuth2();
                                break;
                            default:
                                console.log('🔐 SharePoint OAuth2 Commands:');
                                console.log('  sharepoint oauth2 login  - Start OAuth2 authentication flow');
                                console.log('  sharepoint oauth2 status - Check OAuth2 authentication status');
                                console.log('  sharepoint oauth2 debug  - Debug OAuth2 configuration');
                                break;
                        }
                        break;
                    case 'publish':
                        const documentsPath = args[2] || options.outputDir;
                        const publishOptions = {
                            folderPath: getArgValue('--folder-path', ''),
                            labelPrefix: getArgValue('--label-prefix', 'adpa'),
                            dryRun: args.includes('--dry-run'),
                            force: args.includes('--force')
                        };
                        await publishToSharePoint(documentsPath, publishOptions);
                        break;
                    case 'status':
                        await showSharePointStatus();
                        break;
                    default:
                        console.log('📄 SharePoint Integration Commands:');
                        console.log('  sharepoint init         - Initialize SharePoint configuration');
                        console.log('  sharepoint test         - Test SharePoint connection');
                        console.log('  sharepoint oauth2 login - Start OAuth2 authentication (recommended)');
                        console.log('  sharepoint oauth2 status- Check OAuth2 authentication status');
                        console.log('  sharepoint publish      - Publish documents to SharePoint');
                        console.log('  sharepoint status       - Show SharePoint integration status');
                        console.log('\nAuthentication Methods:');
                        console.log('  • OAuth2 (recommended) - Secure, modern authentication');
                        console.log('  • Service Principal    - For automated scenarios');
                        console.log('\nPublish Options:');
                        console.log('  --folder-path <path>   - Target folder path in SharePoint');
                        console.log('  --label-prefix <prefix> - Label prefix for metadata');
                        console.log('  --dry-run             - Preview what would be published');
                        console.log('  --force               - Force publish even if validation fails');
                }
            }
            catch (e) {
                const err = e;
                console.error('❌ SharePoint command failed:', err.message);
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
        } // Check for comprehensive validation mode - The ADPA Quality Assurance Engine
        if (args.includes('--generate-with-validation') || args.includes('--validate-pmbok')) {
            if (!options.quiet) {
                console.log('🚀 ADPA Quality Assurance Engine Activated');
                console.log('🎯 Generating all documents with comprehensive PMBOK 7.0 validation...');
                console.log('📊 This creates an intelligent feedback loop for continuous improvement');
            }
            const result = await DocumentGenerator.generateAllWithPMBOKValidation(context);
            if (result.result.success) {
                console.log(`\n✅ Generation Complete: ${result.result.successCount} documents created`);
                console.log(`📁 Documents saved to: ${options.outputDir}/`);
                // Display compliance summary
                console.log('\n📊 QUALITY ASSURANCE SUMMARY:');
                console.log(`   🎯 Compliance Score: ${result.compliance.score}/100`);
                console.log(`   📋 Status: ${result.compliance.isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
                if (result.compliance.actionableInsights.length > 0) {
                    console.log(`   � Key Insights: ${result.compliance.actionableInsights.length} identified`);
                }
                if (result.compliance.improvementRecommendations.length > 0) {
                    console.log(`   🔧 Recommendations: ${result.compliance.improvementRecommendations.length} available`);
                }
                console.log('\n📄 Check quality-assessment-report.md for detailed analysis and improvement guidance');
                if (!result.compliance.isCompliant) {
                    console.log('\n⚠️  Some documents need improvement. Use the quality report to guide prompt engineering.');
                }
                else {
                    console.log('\n🎉 Congratulations! Your documents meet PMBOK professional standards.');
                }
            }
            else {
                console.error('❌ Document generation failed');
                console.error('🔍 Check configuration and project context for issues');
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
            // Generate quality assurance documents if requested
            if (generateAll || generateTypes.has('quality-assurance')) {
                if (!options.quiet)
                    console.log('🧪 Generating quality assurance documents...');
                const results = await generateDocumentsWithRetry(context, {
                    includeCategories: ['quality-assurance'],
                    maxRetries: options.retries
                });
                if (results?.success) {
                    console.log(`✅ Successfully generated ${results.generatedFiles?.length || 0} quality assurance documents`);
                    console.log(`📁 Check the ${options.outputDir}/quality-assurance/ directory`);
                }
                else {
                    console.error('❌ Failed to generate quality assurance documents');
                    process.exit(1);
                }
            }
            // Handle --generate-category command
            const categoryIndex = args.indexOf('--generate-category');
            if (categoryIndex !== -1 && categoryIndex + 1 < args.length) {
                const categoryName = args[categoryIndex + 1];
                if (!options.quiet)
                    console.log(`📂 Generating ${categoryName} documents...`);
                const results = await generateDocumentsWithRetry(context, {
                    includeCategories: [categoryName],
                    maxRetries: options.retries
                });
                if (results?.success) {
                    console.log(`✅ Successfully generated ${results.generatedFiles?.length || 0} documents in ${categoryName} category`);
                    console.log(`📁 Check the ${options.outputDir}/${categoryName}/ directory`);
                }
                else {
                    console.error(`❌ Failed to generate ${categoryName} documents`);
                    process.exit(1);
                }
                return;
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
            const isOllama = ollamaEndpoint?.includes('localhost:11434') || ollamaEndpoint?.includes('127.0.0.1');
            console.log('\n   🦙 Ollama:');
            console.log(`      Endpoint: ${ollamaEndpoint ? '✅ Set' : '❌ Missing'}`);
            if (ollamaEndpoint) {
                console.log(`      URL: ${ollamaEndpoint}`);
                console.log(`      Model: ${process.env.OLLAMA_MODEL || 'llama2'}`);
            }
        }
        else {
            console.log('   ❌ .env file: Not found');
            console.log('      Run --setup to configure providers');
        }
    }
    catch (error) {
        console.error('❌ Error checking configuration:', error);
    }
}
/**
 * Show all available templates dynamically from the generation tasks AND API templates
 */
async function showAvailableTemplates() {
    console.log('📋 Available Document Templates\n');
    try {
        // Show static CLI templates
        const categories = getAvailableCategories();
        console.log(`📚 STATIC TEMPLATES (CLI): ${categories.length} categories with ${GENERATION_TASKS.length} total templates:\n`);
        for (const category of categories) {
            const tasks = getTasksByCategory(category);
            if (tasks.length > 0) {
                // Convert category slug to display name
                const displayCategory = category
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                console.log(`${displayCategory} (${tasks.length} documents):`);
                for (const task of tasks) {
                    console.log(`  ${task.emoji} ${task.name}`);
                    console.log(`      Key: ${task.key}`);
                    console.log(`      Generate: node dist/cli.js --generate ${task.key}`);
                    console.log('');
                }
            }
        }
        // Show dynamic API templates
        console.log('\n🌐 DYNAMIC TEMPLATES (API): User-created templates:\n');
        try {
            // Check if API server is running and try to fetch templates
            const { default: fetch } = await import('node-fetch');
            const apiPort = process.env.PORT || '3002'; // Use the same port as our API server
            const response = await fetch(`http://localhost:${apiPort}/api/v1/templates`, {
                headers: {
                    'X-API-Key': process.env.API_KEY || 'dev-api-key-123' // Use the correct dev API key
                }
            });
            if (response.ok) {
                const data = await response.json();
                const apiTemplates = data.data || [];
                if (apiTemplates.length > 0) {
                    console.log(`Found ${apiTemplates.length} API templates:`);
                    for (const template of apiTemplates) {
                        console.log(`  📋 ${template.name}`);
                        console.log(`      ID: ${template.id}`);
                        console.log(`      Category: ${template.category}`);
                        console.log(`      Description: ${template.description || 'No description'}`);
                        console.log(`      Created: ${template.createdAt}`);
                        console.log(`      Status: ${template.isActive ? 'Active' : 'Inactive'}`);
                        console.log('');
                    }
                    console.log('💡 To use API templates:');
                    console.log('   • Start the API server: npm run server');
                    console.log('   • Create templates via POST /api/v1/templates');
                    console.log('   • Generate docs via POST /api/v1/documents/convert');
                }
                else {
                    console.log('   No API templates found');
                    console.log('   📝 Create templates via: POST /api/v1/templates');
                }
            }
            else {
                throw new Error(`API responded with status ${response.status}`);
            }
        }
        catch (apiError) {
            const apiPort = process.env.PORT || '3002';
            console.log(`   ❌ Could not connect to API server (http://localhost:${apiPort})`);
            console.log('   💡 To see API templates:');
            console.log('      1. Start the API server: npm run api:start');
            console.log('      2. Create templates via: POST /api/v1/templates');
            console.log('      3. Re-run this command to see them here');
            console.log(`   🔍 Error: ${apiError.message}`);
        }
        console.log('\n📚 Usage Examples:');
        console.log('   # Static templates (CLI):');
        console.log('   node dist/cli.js --generate project-charter');
        console.log('   node dist/cli.js --generate-category quality-assurance');
        console.log('   node dist/cli.js --generate-quality-assurance');
        console.log('\n   # Dynamic templates (API):');
        console.log('   curl -X POST http://localhost:3001/api/v1/templates \\');
        console.log('     -H "Content-Type: application/json" \\');
        console.log('     -H "X-API-Key: your-api-key" \\');
        console.log('     -d \'{"name": "Custom Template", "category": "Custom"}\'');
        console.log('\n💡 Tips:');
        console.log('   • Use --generate-category <category> to generate all static documents in a category');
        console.log('   • Use --generate <key> to generate a specific static document');
        console.log('   • Category batch generation: --generate-quality-assurance, --generate-core-analysis, etc.');
        console.log('   • API templates are used via the REST API, not CLI commands');
    }
    catch (error) {
        console.error('❌ Error loading templates:', error);
        console.log('\n🔧 Fallback: Basic template list available');
        console.log('   • project-charter: Project Charter Document');
        console.log('   • business-case: Business Case Analysis');
        console.log('   • stakeholder-register: Stakeholder Register');
    }
}
/**
 * Print comprehensive help information
 */
function printHelp() {
    console.log(`
🚀 Requirements Gathering Agent CLI v2.1.3

USAGE:
   node dist/cli.js [COMMAND] [OPTIONS]

MAIN COMMANDS:
   --setup                     🔧 Interactive setup wizard for AI providers
   --generate <key>           📝 Generate specific document by key
   --generate-category <cat>  📂 Generate all documents in category
   --generate-all             🎯 Generate all available documents
   --list-templates           📋 Show all available document templates
   --analyze                  🔍 Analyze workspace without generating docs
   --status                   ℹ️  Show configuration and system status

ADVANCED TEMPLATE ENGINE:
   --migrate-templates        🚀 Migrate static templates to database format
   --generate-advanced <id>   ⚡ Generate with enhanced context injection
   --template-info <id>       📋 Show detailed template information
   --list-templates           📚 Show all templates (static + dynamic)

TEMPLATE VARIABLES:
   --var KEY=VALUE           ⚙️  Set template variables for generation
   --force                   💪 Force operations (use with migrate-templates)

CATEGORY SHORTCUTS:
   --generate-core-analysis        📊 Generate all core analysis documents
   --generate-quality-assurance    ✅ Generate all QA documents
   --generate-technical-analysis   🔧 Generate all technical analysis docs
   --generate-project-charter      📜 Generate project charter documents
   --generate-management-plans     📋 Generate all management plans

PMBOK VALIDATION:
   --validate                 ✅ Validate generated documents against PMBOK
   --validate-file <file>     📄 Validate specific document file

VERSION CONTROL:
   vcs init                   🔄 Initialize git repository in output directory
   vcs commit <file> [msg]    💾 Commit specific generated document
   vcs status                 📊 Show git status of generated documents
   vcs log                    📜 Show git history
   vcs diff <file>            🔍 Show changes in specific file
   vcs revert <file> <commit> ↩️  Revert file to specific commit

CONFLUENCE INTEGRATION:
   confluence init            ⚙️  Initialize Confluence configuration
   confluence test            🔗 Test Confluence connection
   confluence publish         📤 Publish documents to Confluence
   confluence status          📊 Show Confluence integration status

CONFLUENCE PUBLISH OPTIONS:
   --parent-page <title>      📄 Parent page title for organization
   --label-prefix <prefix>    🏷️  Label prefix for published pages
   --dry-run                  👁️  Preview what would be published
   --force                    ⚡ Force publish even if validation fails

SHAREPOINT INTEGRATION:
   sharepoint init            ⚙️  Initialize SharePoint configuration
   sharepoint test            🔗 Test SharePoint connection
   sharepoint publish         📤 Publish documents to SharePoint
   sharepoint status          📊 Show SharePoint integration status

SHAREPOINT PUBLISH OPTIONS:
   --folder-path <path>       📂 Target folder path in SharePoint
   --label-prefix <prefix>    🏷️  Label prefix for metadata
   --dry-run                  👁️  Preview what would be published
   --force                    ⚡ Force publish even if validation fails

CONFIGURATION:
   --reload-env              ♻️  Reload environment configuration
   --config-status           ⚙️  Show detailed configuration status

EXAMPLES:
   node dist/cli.js --setup
   node dist/cli.js --generate project-charter
   node dist/cli.js --generate-quality-assurance
   node dist/cli.js --list-templates
   node dist/cli.js --status
   node dist/cli.js confluence init
   node dist/cli.js confluence publish --parent-page "Project Documentation"
   node dist/cli.js vcs commit business-case.md "Updated business case"
   node dist/cli.js sharepoint init
   node dist/cli.js sharepoint publish --folder-path "/sites/mysite/documents"

ADVANCED TEMPLATE EXAMPLES:
   node dist/cli.js --migrate-templates
   node dist/cli.js --generate-advanced stakeholder-register
   node dist/cli.js --generate-advanced apidocumentation \\
     --var PROJECT_NAME="Enterprise API" --var VERSION="2.0"
   node dist/cli.js --template-info stakeholder-register

🎯 Breakthrough Features in v2.1.3:
   • Evaluative Contextual Synthesis
   • Hierarchical Authority Recognition
   • Enhanced Context Generation
   • Confluence Integration
   • Milestone Downloads: 175+ weekly

For more information, visit: https://github.com/your-repo/requirements-gathering-agent
`);
}
// Missing function implementations
async function scaffoldNewProcessor(category, name) {
    console.log(`🏗️  Scaffolding new processor: ${name} in category: ${category}`);
    console.log('This feature is not yet implemented.');
    process.exit(0);
}
async function runProviderSelectionMenu() {
    console.log('🤖 AI Provider Selection Menu');
    try {
        const menu = new InteractiveProviderMenu();
        await menu.showMenu();
    }
    catch (error) {
        console.error('Error running provider selection menu:', error);
        process.exit(1);
    }
}
async function analyzeWorkspace() {
    const { promises: fs } = await import('fs');
    const path = await import('path');
    const cwd = process.cwd();
    console.log('🔍 Analyzing workspace...\n');
    const summary = [];
    // Check for key files
    const filesToCheck = [
        'package.json',
        'tsconfig.json',
        '.env',
        'README.md',
        'api-specs/',
        'admin-interface/',
        'dist/',
        'config-rga.json',
        'src/modules/documentGenerator/processor-config.json'
    ];
    for (const file of filesToCheck) {
        try {
            const stat = await fs.stat(path.join(cwd, file));
            summary.push(`✅ ${file} found (${stat.isDirectory() ? 'directory' : 'file'})`);
        }
        catch {
            summary.push(`❌ ${file} missing`);
        }
    }
    // Parse package.json
    try {
        const pkgRaw = await fs.readFile(path.join(cwd, 'package.json'), 'utf-8');
        const pkg = JSON.parse(pkgRaw);
        summary.push(`\n📦 Package: ${pkg.name} v${pkg.version}`);
        summary.push(`   Description: ${pkg.description}`);
        summary.push(`   Main: ${pkg.main}`);
        summary.push(`   Bin: ${JSON.stringify(pkg.bin)}`);
        summary.push(`   Scripts: ${Object.keys(pkg.scripts).length} scripts defined`);
        summary.push(`   Dependencies: ${Object.keys(pkg.dependencies || {}).length}`);
        summary.push(`   DevDependencies: ${Object.keys(pkg.devDependencies || {}).length}`);
    }
    catch {
        summary.push('⚠️  Could not parse package.json');
    }
    // Parse tsconfig.json
    try {
        const tsconfigRaw = await fs.readFile(path.join(cwd, 'tsconfig.json'), 'utf-8');
        const tsconfig = JSON.parse(tsconfigRaw);
        summary.push(`\n🛠️  TypeScript config: target=${tsconfig.compilerOptions?.target}, module=${tsconfig.compilerOptions?.module}`);
    }
    catch {
        summary.push('⚠️  Could not parse tsconfig.json');
    }
    // Check for .env and required variables
    try {
        const envRaw = await fs.readFile(path.join(cwd, '.env'), 'utf-8');
        summary.push('\n🔑 .env file present');
        const requiredVars = ['GOOGLE_AI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_AI_API_KEY', 'GITHUB_TOKEN', 'OLLAMA_ENDPOINT'];
        for (const v of requiredVars) {
            if (envRaw.includes(v)) {
                summary.push(`   • ${v} present`);
            }
            else {
                summary.push(`   • ${v} missing`);
            }
        }
    }
    catch {
        summary.push('⚠️  .env file missing or unreadable');
    }
    // Parse config-rga.json
    try {
        const configRgaRaw = await fs.readFile(path.join(cwd, 'config-rga.json'), 'utf-8');
        const configRga = JSON.parse(configRgaRaw);
        summary.push(`\n⚙️  config-rga.json loaded: currentProvider=${configRga.currentProvider}, outputDir=${configRga.defaultOutputDir}`);
        summary.push(`   Providers: ${Object.keys(configRga.providers || {}).join(', ')}`);
        summary.push(`   VCS: enabled=${configRga.docsVcs?.enabled}, autoCommit=${configRga.docsVcs?.autoCommit}`);
        summary.push(`   Confluence: ${configRga.confluence?.baseUrl || 'not set'}`);
        summary.push(`   SharePoint: ${configRga.sharepoint?.siteUrl || 'not set'}`);
    }
    catch {
        summary.push('⚠️  Could not parse config-rga.json');
    }
    // Parse processor-config.json
    try {
        const procConfigPath = path.join(cwd, 'src/modules/documentGenerator/processor-config.json');
        const procConfigRaw = await fs.readFile(procConfigPath, 'utf-8');
        const procConfig = JSON.parse(procConfigRaw);
        summary.push(`\n🧩 processor-config.json loaded: ${Object.keys(procConfig).length} keys`);
    }
    catch {
        summary.push('⚠️  Could not parse processor-config.json');
    }
    // Output summary
    console.log(summary.join('\n'));
    console.log('\nAnalysis complete.');
}
async function runEnhancedSetupWizard() {
    const readline = (await import('readline')).createInterface({ input: process.stdin, output: process.stdout });
    const fs = await import('fs/promises');
    const path = await import('path');
    const cwd = process.cwd();
    console.log('🧙‍♂️ Interactive Setup Wizard\n');
    function ask(question) {
        return new Promise(resolve => readline.question(question, answer => resolve(answer.trim())));
    }
    // Choose provider
    const provider = await ask('Select AI provider (google/azure/github/ollama): ');
    let envVars = {};
    switch (provider.toLowerCase()) {
        case 'google':
            envVars = {
                GOOGLE_AI_API_KEY: await ask('Enter your Google AI API Key: '),
                GOOGLE_AI_MODEL: await ask('Enter Google AI Model (default: gemini-1.5-flash): ') || 'gemini-1.5-flash'
            };
            break;
        case 'azure':
            envVars = {
                AZURE_OPENAI_ENDPOINT: await ask('Enter your Azure OpenAI Endpoint: '),
                DEPLOYMENT_NAME: await ask('Enter Azure deployment name (default: gpt-4): ') || 'gpt-4',
                USE_ENTRA_ID: await ask('Use Entra ID? (true/false, default: false): ') || 'false',
                AZURE_AI_API_KEY: await ask('Enter Azure API Key (optional, press enter to skip): ')
            };
            break;
        case 'github':
            envVars = {
                GITHUB_TOKEN: await ask('Enter your GitHub AI Token: '),
                GITHUB_ENDPOINT: await ask('Enter GitHub AI Endpoint (default: https://models.github.ai/inference/): ') || 'https://models.github.ai/inference/',
                REQUIREMENTS_AGENT_MODEL: await ask('Enter model (default: gpt-4o-mini): ') || 'gpt-4o-mini'
            };
            break;
        case 'ollama':
            envVars = {
                OLLAMA_ENDPOINT: await ask('Enter Ollama endpoint (default: http://localhost:11434): ') || 'http://localhost:11434',
                REQUIREMENTS_AGENT_MODEL: await ask('Enter model (default: llama3.1): ') || 'llama3.1'
            };
            break;
        default:
            console.log('Unknown provider. Exiting setup.');
            readline.close();
            process.exit(1);
    }
    // Write .env file
    let envContent = '';
    for (const [k, v] of Object.entries(envVars)) {
        if (v)
            envContent += `${k}=${v}\n`;
    }
    try {
        await fs.writeFile(path.join(cwd, '.env'), envContent, { encoding: 'utf-8' });
        console.log('\n✅ .env file created/updated.');
    }
    catch (e) {
        console.error('❌ Failed to write .env:', e);
    }
    // Optionally update config-rga.json
    const updateConfig = (await ask('Update config-rga.json with provider/model? (y/n): ')).toLowerCase() === 'y';
    if (updateConfig) {
        try {
            const configPath = path.join(cwd, 'config-rga.json');
            const configRaw = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(configRaw);
            config.currentProvider = provider + (provider.endsWith('-ai') ? '' : '-ai');
            if (!config.providers)
                config.providers = {};
            config.providers[config.currentProvider] = { model: envVars.REQUIREMENTS_AGENT_MODEL || envVars.GOOGLE_AI_MODEL || envVars.DEPLOYMENT_NAME || '' };
            await fs.writeFile(configPath, JSON.stringify(config, null, 2), { encoding: 'utf-8' });
            console.log('✅ config-rga.json updated.');
        }
        catch (e) {
            console.error('❌ Failed to update config-rga.json:', e);
        }
    }
    // Optionally update processor-config.json
    const updateProc = (await ask('Update processor-config.json (for advanced users)? (y/n): ')).toLowerCase() === 'y';
    if (updateProc) {
        try {
            const procPath = path.join(cwd, 'src/modules/documentGenerator/processor-config.json');
            let procConfig = {};
            try {
                const procRaw = await fs.readFile(procPath, 'utf-8');
                procConfig = JSON.parse(procRaw);
            }
            catch { }
            // Example: add a timestamp or note
            procConfig['lastSetup'] = new Date().toISOString();
            await fs.writeFile(procPath, JSON.stringify(procConfig, null, 2), { encoding: 'utf-8' });
            console.log('✅ processor-config.json updated.');
        }
        catch (e) {
            console.error('❌ Failed to update processor-config.json:', e);
        }
    }
    // Offer to run npm install
    const doInstall = (await ask('Run npm install now? (y/n): ')).toLowerCase() === 'y';
    if (doInstall) {
        const { execSync } = await import('child_process');
        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('✅ npm install complete.');
        }
        catch (e) {
            console.error('❌ npm install failed:', e);
        }
    }
    // Offer to run build
    const doBuild = (await ask('Run npm run build now? (y/n): ')).toLowerCase() === 'y';
    if (doBuild) {
        const { execSync } = await import('child_process');
        try {
            execSync('npm run build', { stdio: 'inherit' });
            console.log('✅ Build complete.');
        }
        catch (e) {
            console.error('❌ Build failed:', e);
        }
    }
    readline.close();
    console.log('\nSetup complete. You may now use the CLI.');
}
// Run the CLI
main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map