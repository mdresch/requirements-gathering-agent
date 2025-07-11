#!/usr/bin/env node

/**
 * Gemini CLI Setup Script for Requirements Gathering Agent
 * Simple, reliable setup with visible progress indicators
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
            { name: 'Update Config', method: 'updateConfig', emoji: '⚙️' },
            { name: 'Test Integration', method: 'testIntegration', emoji: '🧪' }
        ];
    }

    async run() {
        console.log('\n🚀 Gemini CLI Setup for Requirements Gathering Agent');
        console.log('=' .repeat(60));
        console.log('\nThis script will set up Google Gemini CLI with:');
        console.log('✨ 1 Million token context window (FREE!)');
        console.log('✨ 60 requests/minute, 1000 requests/day');
        console.log('✨ Built-in Google Search integration');
        console.log('✨ Model Context Protocol (MCP) support\n');

        const proceed = await this.askQuestion('Do you want to proceed? (y/n): ');
        if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
            console.log('Setup cancelled.');
            rl.close();
            return;
        }

        console.log('\n🔧 Starting setup process...\n');

        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            const progress = `[${i + 1}/${this.steps.length}]`;
            
            try {
                console.log(`${progress} ${step.emoji} ${step.name}...`);
                await this[step.method]();
                console.log(`${progress} ✅ ${step.name} completed\n`);
                
            } catch (error) {
                console.log(`${progress} ❌ ${step.name} failed: ${error.message}\n`);
                
                const retry = await this.askQuestion('Retry this step? (y/n): ');
                if (retry.toLowerCase() === 'y' || retry.toLowerCase() === 'yes') {
                    console.log(`${progress} 🔄 Retrying ${step.name}...`);
                    await this[step.method]();
                    console.log(`${progress} ✅ ${step.name} completed (retry)\n`);
                } else {
                    console.log('\n❌ Setup incomplete. Please resolve the issue and run again.');
                    rl.close();
                    return;
                }
            }
        }

        console.log('🎉 Gemini CLI setup completed successfully!\n');
        console.log('🚀 You can now use:');
        console.log('   npm run validate-providers');
        console.log('   rga generate --provider gemini-cli [document-type]');
        console.log('   rga status\n');

        rl.close();
    }

    async checkNodeJS() {
        const result = await this.runCommand('node --version');
        if (!result.success) {
            throw new Error('Node.js not found. Install Node.js 18+ first.');
        }
        
        const version = result.stdout.trim();
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        
        if (majorVersion < 18) {
            throw new Error(`Node.js ${version} found. Need Node.js 18+.`);
        }
        
        console.log(`   ✅ Node.js ${version} verified`);
    }

    async installGeminiCLI() {
        // Check if already installed
        const checkResult = await this.runCommand('gemini --version');
        if (checkResult.success) {
            console.log(`   ✅ Already installed: ${checkResult.stdout.trim()}`);
            return;
        }

        console.log('   📦 Installing globally (this takes 2-3 minutes)...');
        console.log('   ⏳ Please wait while npm downloads packages...');
        
        // Show progress during installation
        const installResult = await this.runCommandWithProgress('npm install -g @google/gemini-cli', 180000);
        if (!installResult.success) {
            throw new Error(`Installation failed: ${installResult.stderr}`);
        }

        // Verify installation
        const verifyResult = await this.runCommand('gemini --version');
        if (!verifyResult.success) {
            throw new Error('Installation verification failed');
        }

        console.log(`   ✅ Installed: ${verifyResult.stdout.trim()}`);
    }

    async authenticateGeminiCLI() {
        const authCheck = await this.runCommand('gemini auth status');
        if (authCheck.success && authCheck.stdout.includes('authenticated')) {
            console.log('   ✅ Already authenticated');
            return;
        }

        console.log('\n🔐 Authentication Required');
        console.log('   Opening browser for Google account login...\n');
        
        const proceed = await this.askQuestion('Continue with authentication? (y/n): ');
        if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
            throw new Error('Authentication cancelled');
        }

        console.log('   🌐 Launching browser authentication...');
        await this.runCommandInteractive('gemini auth login');
        
        // Verify authentication
        const verifyAuth = await this.runCommand('gemini auth status');
        if (!verifyAuth.success || !verifyAuth.stdout.includes('authenticated')) {
            throw new Error('Authentication verification failed');
        }

        console.log('   ✅ Authentication successful');
    }

    async updateConfig() {
        try {
            let envContent = '';
            try {
                envContent = await fs.readFile('.env', 'utf8');
            } catch (error) {
                console.log('   📝 Creating .env file...');
            }

            const geminiConfig = `
# Gemini CLI Configuration (1M Context Window - FREE)
GEMINI_CLI_ENABLED=true
GEMINI_CLI_MODEL=gemini-2.5-pro
GEMINI_CLI_CONTEXT_WINDOW=1000000
GEMINI_CLI_SEARCH_ENABLED=true
GEMINI_CLI_MAX_REQUESTS_PER_MINUTE=60
GEMINI_CLI_MAX_REQUESTS_PER_DAY=1000
`;

            if (!envContent.includes('GEMINI_CLI_ENABLED')) {
                envContent += geminiConfig;
                await fs.writeFile('.env', envContent);
                console.log('   ✅ Added Gemini CLI config to .env');
            } else {
                console.log('   ✅ Config already exists');
            }

            // Ask about default provider
            if (envContent.includes('CURRENT_PROVIDER=')) {
                const setDefault = await this.askQuestion('Set as default provider? (y/n): ');
                if (setDefault.toLowerCase() === 'y' || setDefault.toLowerCase() === 'yes') {
                    envContent = envContent.replace(/CURRENT_PROVIDER=.*/, 'CURRENT_PROVIDER=gemini-cli');
                    await fs.writeFile('.env', envContent);
                    console.log('   ✅ Set as default provider');
                }
            }

        } catch (error) {
            throw new Error(`Config update failed: ${error.message}`);
        }
    }

    async testIntegration() {
        console.log('   🧪 Testing basic functionality...');
        
        const testResult = await this.runCommand('gemini "Hello world" --no-interactive', 15000);
        if (!testResult.success) {
            throw new Error(`Test failed: ${testResult.stderr}`);
        }

        console.log('   ✅ Basic test passed');
        
        // Check RGA CLI
        try {
            const rgaTest = await this.runCommand('node dist/cli.js status', 5000);
            if (rgaTest.success) {
                console.log('   ✅ RGA integration ready');
            } else {
                console.log('   ⚠️  RGA CLI not built (run: npm run build)');
            }
        } catch (error) {
            console.log('   ⚠️  RGA CLI not available');
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

            const timer = setTimeout(() => {
                child.kill();
                resolve({
                    success: false,
                    error: 'Timeout',
                    stdout,
                    stderr
                });
            }, timeout);

            child.on('close', (code) => {
                clearTimeout(timer);
                resolve({
                    success: code === 0,
                    stdout,
                    stderr: stderr || (code !== 0 ? `Exit code: ${code}` : '')
                });
            });
        });
    }

    async runCommandWithProgress(command, timeout = 30000) {
        return new Promise((resolve) => {
            const [cmd, ...args] = command.split(' ');
            const child = spawn(cmd, args, {
                cwd: process.cwd(),
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';
            let dotCount = 0;

            // Show progress dots
            const progressInterval = setInterval(() => {
                process.stdout.write('.');
                dotCount++;
                if (dotCount % 50 === 0) {
                    process.stdout.write('\n   ');
                }
            }, 1000);

            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            const timer = setTimeout(() => {
                clearInterval(progressInterval);
                child.kill();
                console.log('\n   ❌ Installation timed out');
                resolve({
                    success: false,
                    error: 'Timeout',
                    stdout,
                    stderr
                });
            }, timeout);

            child.on('close', (code) => {
                clearTimeout(timer);
                clearInterval(progressInterval);
                console.log('\n'); // New line after dots
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

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new GeminiCLISetup();
    setup.run().catch(error => {
        console.error('\n❌ Setup failed:', error.message);
        console.log('\n📚 For help: https://github.com/google-gemini/gemini-cli\n');
        process.exit(1);
    });
}

export default GeminiCLISetup;
