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
// 1. Node.js built-ins
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import os from 'os';
import { dirname } from 'path';
import process from 'process';
import readline from 'readline';
import { fileURLToPath } from 'url';
// 2. Third-party dependencies
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// 3. Internal modules
import { InteractiveProviderMenu } from './modules/ai/interactive-menu.js';
// 4. Constants and configuration
import { DEFAULT_OUTPUT_DIR, DEFAULT_RETRY_COUNT, DEFAULT_RETRY_BACKOFF, DEFAULT_RETRY_MAX_DELAY, SUPPORTED_FORMATS, CONFIG_FILENAME, PACKAGE_JSON_FILENAME, TSCONFIG_JSON_FILENAME, README_FILENAME, PROCESSOR_CONFIG_FILENAME } from './constants.js';
// 5. Command handlers
import { handleStatusCommand, handleAnalyzeCommand, handleSetupCommand, handleGenerateCommand, handleGenerateCategoryCommand, handleGenerateAllCommand, handleGenerateCoreAnalysisCommand, handleListTemplatesCommand, handleValidateCommand, 
// Confluence commands
handleConfluenceInitCommand, handleConfluenceTestCommand, handleConfluencePublishCommand, handleConfluenceStatusCommand, handleConfluenceOAuth2LoginCommand, handleConfluenceOAuth2StatusCommand, handleConfluenceOAuth2DebugCommand, 
// SharePoint commands
handleSharePointInitCommand, handleSharePointTestCommand, handleSharePointPublishCommand, handleSharePointStatusCommand, handleSharePointOAuth2LoginCommand, handleSharePointOAuth2StatusCommand, handleSharePointOAuth2DebugCommand, 
// VCS commands
handleVcsInitCommand, handleVcsStatusCommand, handleVcsCommitCommand, handleVcsPushCommand } from './commands/index.js';
// 6. Utilities and version management
import { getLegacyDisplayName } from './utils/version.js';
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
                    console.log('✅ Git installation complete. Please restart your terminal and re-run your command.');
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
async function ensureGitRepoInitialized(documentsDir = DEFAULT_OUTPUT_DIR) {
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
// Yargs CLI definition
yargs(hideBin(process.argv))
    .scriptName('rga')
    .usage('Usage: $0 <command> [options]')
    .version(getLegacyDisplayName())
    .command('generate [key]', 'Generate a specific document by key', (yargs) => {
    return yargs
        .positional('key', { type: 'string', describe: 'Document key' })
        .option('output', { type: 'string', default: DEFAULT_OUTPUT_DIR, describe: 'Output directory' })
        .option('quiet', { type: 'boolean', default: false, describe: 'Suppress output' })
        .option('format', { type: 'string', default: 'markdown', choices: SUPPORTED_FORMATS, describe: 'Output format' })
        .option('retries', { type: 'number', default: DEFAULT_RETRY_COUNT, describe: 'Number of retries for generation' })
        .option('retry-backoff', { type: 'number', default: DEFAULT_RETRY_BACKOFF, describe: 'Initial retry backoff (ms)' })
        .option('retry-max-delay', { type: 'number', default: DEFAULT_RETRY_MAX_DELAY, describe: 'Max retry backoff (ms)' });
}, async (argv) => {
    await handleGenerateCommand(argv.key, {
        output: argv.output || DEFAULT_OUTPUT_DIR,
        format: argv.format || 'markdown',
        quiet: argv.quiet,
        retries: argv.retries,
        retryBackoff: argv['retry-backoff'],
        retryMaxDelay: argv['retry-max-delay']
    });
})
    .command('generate-category <category>', 'Generate all documents in a category', (yargs) => {
    return yargs
        .positional('category', { type: 'string', describe: 'Document category' })
        .option('output', { type: 'string', default: DEFAULT_OUTPUT_DIR })
        .option('quiet', { type: 'boolean', default: false, describe: 'Suppress output' })
        .option('retries', { type: 'number', default: DEFAULT_RETRY_COUNT, describe: 'Number of retries for generation' })
        .option('retry-backoff', { type: 'number', default: DEFAULT_RETRY_BACKOFF, describe: 'Initial retry backoff (ms)' })
        .option('retry-max-delay', { type: 'number', default: DEFAULT_RETRY_MAX_DELAY, describe: 'Max retry backoff (ms)' });
}, async (argv) => {
    await handleGenerateCategoryCommand(argv.category, {
        output: argv.output || DEFAULT_OUTPUT_DIR,
        quiet: argv.quiet,
        retries: argv.retries,
        retryBackoff: argv['retry-backoff'],
        retryMaxDelay: argv['retry-max-delay']
    });
})
    .command('generate-all', 'Generate all available documents', (yargs) => {
    return yargs
        .option('output', { type: 'string', default: DEFAULT_OUTPUT_DIR })
        .option('quiet', { type: 'boolean', default: false, describe: 'Suppress output' })
        .option('retries', { type: 'number', default: DEFAULT_RETRY_COUNT, describe: 'Number of retries for generation' })
        .option('retry-backoff', { type: 'number', default: DEFAULT_RETRY_BACKOFF, describe: 'Initial retry backoff (ms)' })
        .option('retry-max-delay', { type: 'number', default: DEFAULT_RETRY_MAX_DELAY, describe: 'Max retry backoff (ms)' });
}, async (argv) => {
    await handleGenerateAllCommand({
        output: argv.output || DEFAULT_OUTPUT_DIR,
        quiet: argv.quiet,
        retries: argv.retries,
        retryBackoff: argv['retry-backoff'],
        retryMaxDelay: argv['retry-max-delay']
    });
})
    .command('list-templates', 'Show all available document templates', {}, async () => {
    await handleListTemplatesCommand();
})
    .command('status', 'Show configuration and system status', (yargs) => {
    return yargs
        .option('quiet', { type: 'boolean', default: false, describe: 'Suppress output' })
        .option('verbose', { type: 'boolean', default: false, describe: 'Show detailed information' });
}, async (argv) => {
    if (!argv.quiet) {
        await handleStatusCommand();
    }
})
    .command('setup', 'Interactive setup wizard for AI providers', {}, async () => {
    await handleSetupCommand();
})
    .command('analyze', 'Analyze workspace without generating docs', {}, async () => {
    await handleAnalyzeCommand();
})
    .command('generate-core-analysis', 'Generate core analysis documents', (yargs) => {
    return yargs
        .option('output', { type: 'string', default: DEFAULT_OUTPUT_DIR })
        .option('quiet', { type: 'boolean', default: false, describe: 'Suppress output' })
        .option('retries', { type: 'number', default: DEFAULT_RETRY_COUNT })
        .option('retry-backoff', { type: 'number', default: DEFAULT_RETRY_BACKOFF })
        .option('retry-max-delay', { type: 'number', default: DEFAULT_RETRY_MAX_DELAY });
}, async (argv) => {
    await handleGenerateCoreAnalysisCommand({
        output: argv.output || DEFAULT_OUTPUT_DIR,
        quiet: argv.quiet,
        retries: argv.retries,
        retryBackoff: argv['retry-backoff'],
        retryMaxDelay: argv['retry-max-delay']
    });
})
    .command('validate', 'Validate generated documents against PMBOK', (yargs) => {
    return yargs
        .option('output', { type: 'string', default: DEFAULT_OUTPUT_DIR })
        .option('quiet', { type: 'boolean', default: false, describe: 'Suppress output' });
}, async (argv) => {
    await handleValidateCommand({
        outputDir: argv.output || DEFAULT_OUTPUT_DIR,
        quiet: argv.quiet
    });
})
    // Confluence commands
    .command('confluence', 'Confluence integration commands', (yargs) => {
    return yargs
        .command('init', 'Initialize Confluence configuration', {}, async (argv) => {
        await handleConfluenceInitCommand({ quiet: argv.quiet });
    })
        .command('test', 'Test Confluence connection', {}, async (argv) => {
        await handleConfluenceTestCommand({ quiet: argv.quiet });
    })
        .command('publish', 'Publish documents to Confluence', (yargs) => {
        return yargs
            .option('documents-path', { type: 'string', describe: 'Path to documents directory' })
            .option('parent-page', { type: 'string', describe: 'Parent page title' })
            .option('label-prefix', { type: 'string', describe: 'Label prefix for metadata' })
            .option('dry-run', { type: 'boolean', default: false, describe: 'Preview only' })
            .option('force', { type: 'boolean', default: false, describe: 'Force publish' });
    }, async (argv) => {
        await handleConfluencePublishCommand({
            documentsPath: argv['documents-path'],
            parentPageTitle: argv['parent-page'],
            labelPrefix: argv['label-prefix'],
            dryRun: argv['dry-run'],
            force: argv.force,
            quiet: argv.quiet
        });
    })
        .command('status', 'Show Confluence integration status', {}, async (argv) => {
        await handleConfluenceStatusCommand({ quiet: argv.quiet });
    })
        .command('oauth2', 'OAuth2 authentication commands', (yargs) => {
        return yargs
            .command('login', 'Start OAuth2 authentication', {}, async (argv) => {
            await handleConfluenceOAuth2LoginCommand({ quiet: argv.quiet });
        })
            .command('status', 'Check OAuth2 authentication status', {}, async (argv) => {
            await handleConfluenceOAuth2StatusCommand({ quiet: argv.quiet });
        })
            .command('debug', 'Debug OAuth2 authentication', {}, async (argv) => {
            await handleConfluenceOAuth2DebugCommand({ quiet: argv.quiet });
        })
            .demandCommand(1, 'You must provide a valid oauth2 command.');
    })
        .demandCommand(1, 'You must provide a valid confluence command.');
})
    // SharePoint commands
    .command('sharepoint', 'SharePoint integration commands', (yargs) => {
    return yargs
        .command('init', 'Initialize SharePoint configuration', {}, async (argv) => {
        await handleSharePointInitCommand({ quiet: argv.quiet });
    })
        .command('test', 'Test SharePoint connection', {}, async (argv) => {
        await handleSharePointTestCommand({ quiet: argv.quiet });
    })
        .command('publish', 'Publish documents to SharePoint', (yargs) => {
        return yargs
            .option('documents-path', { type: 'string', describe: 'Path to documents directory' })
            .option('folder-path', { type: 'string', describe: 'Target folder path' })
            .option('label-prefix', { type: 'string', describe: 'Label prefix for metadata' })
            .option('dry-run', { type: 'boolean', default: false, describe: 'Preview only' })
            .option('force', { type: 'boolean', default: false, describe: 'Force publish' });
    }, async (argv) => {
        await handleSharePointPublishCommand({
            documentsPath: argv['documents-path'],
            folderPath: argv['folder-path'],
            labelPrefix: argv['label-prefix'],
            dryRun: argv['dry-run'],
            force: argv.force,
            quiet: argv.quiet
        });
    })
        .command('status', 'Show SharePoint integration status', {}, async (argv) => {
        await handleSharePointStatusCommand({ quiet: argv.quiet });
    })
        .command('oauth2', 'OAuth2 authentication commands', (yargs) => {
        return yargs
            .command('login', 'Start OAuth2 authentication', {}, async (argv) => {
            await handleSharePointOAuth2LoginCommand({ quiet: argv.quiet });
        })
            .command('status', 'Check OAuth2 authentication status', {}, async (argv) => {
            await handleSharePointOAuth2StatusCommand({ quiet: argv.quiet });
        })
            .command('debug', 'Debug OAuth2 authentication', {}, async (argv) => {
            await handleSharePointOAuth2DebugCommand({ quiet: argv.quiet });
        })
            .demandCommand(1, 'You must provide a valid oauth2 command.');
    })
        .demandCommand(1, 'You must provide a valid sharepoint command.');
})
    // VCS commands
    .command('vcs', 'Version control system commands', (yargs) => {
    return yargs
        .command('init', 'Initialize Git repository', (yargs) => {
        return yargs
            .option('output', { type: 'string', default: DEFAULT_OUTPUT_DIR, describe: 'Output directory' });
    }, async (argv) => {
        await handleVcsInitCommand({
            outputDir: argv.output,
            quiet: argv.quiet
        });
    })
        .command('status', 'Show Git repository status', (yargs) => {
        return yargs
            .option('output', { type: 'string', default: DEFAULT_OUTPUT_DIR, describe: 'Output directory' });
    }, async (argv) => {
        await handleVcsStatusCommand({
            outputDir: argv.output,
            quiet: argv.quiet
        });
    })
        .command('commit', 'Commit changes to Git repository', (yargs) => {
        return yargs
            .option('output', { type: 'string', default: DEFAULT_OUTPUT_DIR, describe: 'Output directory' })
            .option('message', { type: 'string', default: 'Update generated documents', describe: 'Commit message' });
    }, async (argv) => {
        await handleVcsCommitCommand({
            outputDir: argv.output,
            message: argv.message,
            quiet: argv.quiet
        });
    })
        .command('push', 'Push changes to remote repository', (yargs) => {
        return yargs
            .option('output', { type: 'string', default: DEFAULT_OUTPUT_DIR, describe: 'Output directory' })
            .option('remote', { type: 'string', default: 'origin', describe: 'Remote name' })
            .option('branch', { type: 'string', default: 'main', describe: 'Branch name' });
    }, async (argv) => {
        await handleVcsPushCommand({
            outputDir: argv.output,
            remote: argv.remote,
            branch: argv.branch,
            quiet: argv.quiet
        });
    })
        .demandCommand(1, 'You must provide a valid vcs command.');
})
    .option('quiet', {
    alias: 'q',
    type: 'boolean',
    description: 'Suppress output',
    global: true,
})
    .help()
    .alias('help', 'h')
    .demandCommand(1, 'You must provide a valid command.')
    .parse();
// ...existing code for utility functions, command logic, etc...
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
        PACKAGE_JSON_FILENAME,
        TSCONFIG_JSON_FILENAME,
        '.env',
        README_FILENAME,
        'api-specs/',
        'admin-interface/',
        'dist/',
        CONFIG_FILENAME,
        PROCESSOR_CONFIG_FILENAME
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
        const pkgRaw = await fs.readFile(path.join(cwd, PACKAGE_JSON_FILENAME), 'utf-8');
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
        const tsconfigRaw = await fs.readFile(path.join(cwd, TSCONFIG_JSON_FILENAME), 'utf-8');
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
        const configRgaRaw = await fs.readFile(path.join(cwd, CONFIG_FILENAME), 'utf-8');
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
        const procConfigPath = path.join(cwd, PROCESSOR_CONFIG_FILENAME);
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
            const configPath = path.join(cwd, CONFIG_FILENAME);
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
            const procPath = path.join(cwd, PROCESSOR_CONFIG_FILENAME);
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
// --- FUTURE TESTING REMINDER ---
// When updating retry/backoff logic or AI/model integration, add/maintain integration tests that simulate rate limits, network errors, and provider failures.\n// Use CLI flags --retries, --retry-backoff, --retry-max-delay for test scenarios.\n// See documentation for test strategies and update as needed.
//# sourceMappingURL=cli.js.map