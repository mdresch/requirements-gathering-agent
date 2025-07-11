#!/usr/bin/env node

/**
 * Gemini CLI Setup Script for Requirements Gathering Agent
 * Helps users install and configure Google's Gemini CLI with 1M context window
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class GeminiCLISetup {
    constructor() {
        this.steps = [
            { name: 'Check Node.js', method: 'checkNodeJS', emoji: '🔍' },
            { name: 'Install Gemini CLI', method: 'installGeminiCLI', emoji: '📦' },
            { name: 'Authenticate', method: 'authenticateGeminiCLI', emoji: '🔐' },
            { name: 'Update RGA Config', method: 'updateConfig', emoji: '⚙️' },
            { name: 'Test Integration', method: 'testIntegration', emoji: '🧪' }
        ];
        
        this.currentStep = 0;
        this.totalSteps = this.steps.length;
    }

    async run() {
        console.log('🚀 Gemini CLI Setup for Requirements Gathering Agent');
        console.log('=' .repeat(60));
        console.log('');
        console.log('This script will help you set up Google Gemini CLI with:');
        console.log('✨ 1 Million token context window');
        console.log('✨ 60 requests/minute, 1000 requests/day (FREE)');
        console.log('✨ Built-in Google Search integration');
        console.log('✨ Model Context Protocol (MCP) support');
        console.log('');

        const proceed = await this.askQuestion('Do you want to proceed with setup? (y/n): ');
        if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
            console.log('Setup cancelled.');
            process.exit(0);
        }

        console.log('\n🔧 Starting setup process...\n');

        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            this.currentStep = i + 1;
            
            try {
                this.showProgress(`${step.emoji} ${step.name}...`);
                await this[step.method]();
                this.showProgress(`${step.emoji} ${step.name}`, true);
                
            } catch (error) {
                console.error(`\n❌ ${step.name} failed:`, error.message);
                const retry = await this.askQuestion('Do you want to retry this step? (y/n): ');
                
                if (retry.toLowerCase() === 'y' || retry.toLowerCase() === 'yes') {
                    this.showProgress(`${step.emoji} Retrying ${step.name}...`);
                    await this[step.method]();
                    this.showProgress(`${step.emoji} ${step.name}`, true);
                } else {
                    console.log('Setup incomplete. Please resolve the issue and run setup again.');
                    process.exit(1);
                }
            }
        }

        console.log('\n🎉 Gemini CLI setup completed successfully!');
        console.log('');
        console.log('🚀 You can now use Gemini CLI with:');
        console.log('   rga generate --provider gemini-cli [document-type]');
        console.log('   rga validate-compliance --provider gemini-cli --full-context');
        console.log('   rga audit-security --provider gemini-cli');
        console.log('');
        console.log('📚 Next steps:');
        console.log('   1. Run: npm run validate-providers');
        console.log('   2. Try: rga generate key-roles-and-needs --provider gemini-cli');
        console.log('   3. Check: rga status');

        rl.close();
    }

    showProgress(message, completed = false) {
        const percentage = Math.round((this.currentStep / this.totalSteps) * 100);
        const progressBar = this.createProgressBar(percentage);
        const status = completed ? '✅' : '⏳';
        
        // Clear current line and show progress
        process.stdout.write('\r\x1b[K');
        process.stdout.write(`${status} [${this.currentStep}/${this.totalSteps}] ${progressBar} ${percentage}% - ${message}`);
        
        if (completed) {
            console.log(''); // New line after completion
        }
    }

    createProgressBar(percentage) {
        const width = 20;
        const completed = Math.round((percentage / 100) * width);
        const remaining = width - completed;
        return '█'.repeat(completed) + '░'.repeat(remaining);
    }

    async checkNodeJS() {
        console.log('   🔍 Checking Node.js version...');
        
        const result = await this.runCommand('node --version');
        if (!result.success) {
            throw new Error('Node.js not found. Please install Node.js 18+ first.');
        }
        
        const version = result.stdout.trim();
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        
        if (majorVersion < 18) {
            throw new Error(`Node.js ${version} found. Please upgrade to Node.js 18 or later.`);
        }
        
        console.log(`   ✅ Node.js ${version} verified`);
    }

    async installGeminiCLI() {
        console.log('   � Checking existing Gemini CLI installation...');
        
        const checkResult = await this.runCommand('gemini --version');
        if (checkResult.success) {
            console.log(`   ✅ Gemini CLI already installed: ${checkResult.stdout.trim()}`);
            return;
        }

        console.log('   📦 Installing Gemini CLI globally...');
        console.log('   ⏳ This may take 2-3 minutes - please wait...');
        
        const installResult = await this.runCommand('npm install -g @google/gemini-cli', 180000); // 3 minutes timeout
        if (!installResult.success) {
            throw new Error(`Failed to install Gemini CLI: ${installResult.stderr}`);
        }

        console.log('   🔍 Verifying installation...');
        const verifyResult = await this.runCommand('gemini --version');
        if (!verifyResult.success) {
            throw new Error('Gemini CLI installation verification failed');
        }

        console.log(`   ✅ Gemini CLI installed: ${verifyResult.stdout.trim()}`);
    }

    async authenticateGeminiCLI() {
        console.log('   🔐 Checking authentication status...');
        
        const authCheck = await this.runCommand('gemini auth status');
        if (authCheck.success && authCheck.stdout.includes('authenticated')) {
            console.log('   ✅ Already authenticated with Gemini CLI');
            return;
        }

        console.log('');
        console.log('🔐 Authentication Required');
        console.log('   Gemini CLI needs to authenticate with your Google account.');
        console.log('   This will open a browser window for login.');
        console.log('');
        
        const proceed = await this.askQuestion('Proceed with authentication? (y/n): ');
        if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
            throw new Error('Authentication cancelled by user');
        }

        console.log('   🌐 Starting authentication flow...');
        console.log('   Please complete the authentication in your browser.');
        
        // Run auth login interactively
        await this.runCommandInteractive('gemini auth login');
        
        console.log('   🔍 Verifying authentication...');
        
        // Verify authentication
        const verifyAuth = await this.runCommand('gemini auth status');
        if (!verifyAuth.success || !verifyAuth.stdout.includes('authenticated')) {
            throw new Error('Authentication verification failed');
        }

        console.log('   ✅ Authentication successful');
    }

    async updateConfig() {
        console.log('   ⚙️ Updating Requirements Gathering Agent configuration...');
        
        try {
            // Read current .env file
            let envContent = '';
            try {
                envContent = await fs.readFile('.env', 'utf8');
            } catch (error) {
                console.log('   📝 Creating new .env file...');
            }

            // Add Gemini CLI configuration
            const geminiConfig = `
# ========================================
# Gemini CLI Configuration (1M Context Window)
# ========================================
GEMINI_CLI_ENABLED=true
GEMINI_CLI_MODEL=gemini-2.5-pro
GEMINI_CLI_CONTEXT_WINDOW=1000000
GEMINI_CLI_SEARCH_ENABLED=true
GEMINI_CLI_MCP_ENABLED=true
GEMINI_CLI_MAX_REQUESTS_PER_MINUTE=60
GEMINI_CLI_MAX_REQUESTS_PER_DAY=1000
`;

            // Update or add Gemini CLI config
            if (!envContent.includes('GEMINI_CLI_ENABLED')) {
                envContent += geminiConfig;
                await fs.writeFile('.env', envContent);
                console.log('   ✅ Added Gemini CLI configuration to .env');
            } else {
                console.log('   ✅ Gemini CLI configuration already exists in .env');
            }

            // Update provider list if it exists
            if (envContent.includes('CURRENT_PROVIDER=')) {
                const currentProvider = await this.askQuestion('Set Gemini CLI as default provider? (y/n): ');
                
                if (currentProvider.toLowerCase() === 'y' || currentProvider.toLowerCase() === 'yes') {
                    envContent = envContent.replace(/CURRENT_PROVIDER=.*/, 'CURRENT_PROVIDER=gemini-cli');
                    await fs.writeFile('.env', envContent);
                    console.log('   ✅ Set Gemini CLI as default provider');
                } else {
                    console.log('   ✅ Kept existing default provider');
                }
            } else {
                console.log('   ✅ Configuration updated successfully');
            }

        } catch (error) {
            throw new Error(`Failed to update configuration: ${error.message}`);
        }
    }

    async testIntegration() {
        console.log('   🧪 Testing Gemini CLI integration...');
        
        // Test basic functionality
        const testResult = await this.runCommand('gemini "Hello, can you confirm you are working?" --no-interactive', 10000);
        if (!testResult.success) {
            throw new Error(`Gemini CLI test failed: ${testResult.stderr}`);
        }

        console.log('   ✅ Basic functionality test passed');
        
        // Test with RGA if built
        try {
            const rgaTest = await this.runCommand('node dist/cli.js status');
            if (rgaTest.success) {
                console.log('   ✅ RGA CLI integration ready');
            } else {
                console.log('   ⚠️  RGA CLI not built. Run: npm run build');
            }
        } catch (error) {
            console.log('   ⚠️  RGA CLI not available. Run: npm run build');
        }
    }

    async runCommand(command, timeout = 30000) {
        return new Promise((resolve) => {
            const [cmd, ...args] = command.split(' ');
            const child = spawn(cmd, args, {
                cwd: process.cwd(),
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            const timeoutHandle = setTimeout(() => {
                child.kill();
                resolve({
                    success: false,
                    error: 'Command timed out',
                    stdout,
                    stderr
                });
            }, timeout);

            child.on('close', (code) => {
                clearTimeout(timeoutHandle);
                resolve({
                    success: code === 0,
                    stdout,
                    stderr: stderr || (code !== 0 ? `Exit code: ${code}` : '')
                });
            });
        });
    }

    async runCommandInteractive(command) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            const child = spawn(cmd, args, {
                cwd: process.cwd(),
                shell: true,
                stdio: 'inherit'
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command failed with exit code: ${code}`));
                }
            });
        });
    }

    askQuestion(question) {
        return new Promise((resolve) => {
            rl.question(question, resolve);
        });
    }
}

// Run setup if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    const setup = new GeminiCLISetup();
    setup.run().catch(error => {
        console.error('\n❌ Setup failed:', error.message);
        console.log('\n📚 For help, see: https://github.com/google-gemini/gemini-cli');
        process.exit(1);
    });
}

export default GeminiCLISetup;
