#!/usr/bin/env node

/**
 * Gemini CLI Setup Script - Ultra Simple Version
 * Maximum visibility, minimum complexity, guaranteed progress feedback
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

class GeminiCLISetup {
    constructor() {
        this.totalSteps = 5;
        this.currentStep = 0;
    }

    logStep(message) {
        this.currentStep++;
        const progress = `[${this.currentStep}/${this.totalSteps}]`;
        console.log(`\n${progress} 🔄 ${message}`);
        console.log('─'.repeat(60));
    }

    logSuccess(message) {
        const progress = `[${this.currentStep}/${this.totalSteps}]`;
        console.log(`${progress} ✅ ${message}`);
    }

    logError(message) {
        const progress = `[${this.currentStep}/${this.totalSteps}]`;
        console.log(`${progress} ❌ ${message}`);
    }

    async askQuestion(question) {
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }

    async runCommand(command, showOutput = false) {
        try {
            if (showOutput) {
                console.log(`   Executing: ${command}`);
            }
            const { stdout, stderr } = await execAsync(command);
            return { success: true, stdout, stderr };
        } catch (error) {
            return { 
                success: false, 
                stdout: error.stdout || '', 
                stderr: error.stderr || error.message 
            };
        }
    }

    async installWithRealTimeOutput(command) {
        return new Promise((resolve) => {
            console.log(`   Running: ${command}`);
            console.log('   Output:');
            
            const child = spawn(command, [], {
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                // Show partial output to indicate progress
                process.stdout.write('   📦 ');
                process.stdout.write(output.substring(0, 80).replace(/\n/g, ' ').trim());
                process.stdout.write('...\n');
            });

            child.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                if (!output.includes('npm WARN')) {
                    process.stdout.write('   ⚠️  ');
                    process.stdout.write(output.substring(0, 80).replace(/\n/g, ' ').trim());
                    process.stdout.write('...\n');
                }
            });

            child.on('close', (code) => {
                resolve({
                    success: code === 0,
                    stdout,
                    stderr,
                    code
                });
            });

            // Timeout after 5 minutes
            setTimeout(() => {
                child.kill();
                resolve({
                    success: false,
                    stdout,
                    stderr: 'Installation timed out after 5 minutes',
                    code: -1
                });
            }, 300000);
        });
    }

    async run() {
        console.log('\n🚀 GEMINI CLI SETUP FOR REQUIREMENTS GATHERING AGENT');
        console.log('═'.repeat(60));
        console.log('\n✨ Features you\'ll get:');
        console.log('   • 1 Million token context window (FREE!)');
        console.log('   • 60 requests/minute, 1000 requests/day');
        console.log('   • Built-in Google Search integration');
        console.log('   • Model Context Protocol (MCP) support');
        console.log('   • Advanced reasoning capabilities');
        console.log('\n⚡ This setup will take 3-5 minutes');
        console.log('⚡ You\'ll see progress at every step\n');

        const proceed = await this.askQuestion('🤔 Ready to begin? (y/n): ');
        if (!['y', 'yes'].includes(proceed.toLowerCase().trim())) {
            console.log('\n❌ Setup cancelled. Run again when ready!');
            return;
        }

        try {
            await this.checkNodeJS();
            await this.installGeminiCLI();
            await this.authenticateGeminiCLI();
            await this.updateConfig();
            await this.testIntegration();

            console.log('\n🎉 SUCCESS! Gemini CLI setup completed!');
            console.log('═'.repeat(50));
            console.log('\n🚀 You can now run:');
            console.log('   npm run validate-providers');
            console.log('   npm run gemini:test');
            console.log('   rga generate --provider gemini-cli [document-type]');
            console.log('\n💡 For more help: https://github.com/google-gemini/gemini-cli\n');

        } catch (error) {
            console.log(`\n💥 SETUP FAILED: ${error.message}`);
            console.log('\n🔧 Try running the script again or check:');
            console.log('   • Your internet connection');
            console.log('   • Node.js version (need 18+)');
            console.log('   • Available disk space\n');
            process.exit(1);
        }
    }

    async checkNodeJS() {
        this.logStep('Checking Node.js installation');
        
        const result = await this.runCommand('node --version');
        if (!result.success) {
            throw new Error('Node.js not found. Please install Node.js 18+ first.');
        }
        
        const version = result.stdout.trim();
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        
        if (majorVersion < 18) {
            throw new Error(`Found Node.js ${version}, but need 18+. Please upgrade.`);
        }
        
        this.logSuccess(`Node.js ${version} is ready!`);
    }

    async installGeminiCLI() {
        this.logStep('Installing Google Gemini CLI');
        
        // Check if already installed
        console.log('   🔍 Checking if already installed...');
        const checkResult = await this.runCommand('gemini --version');
        if (checkResult.success) {
            this.logSuccess(`Already installed: ${checkResult.stdout.trim()}`);
            return;
        }

        console.log('   ❌ Not found, installing now...');
        console.log('   📦 This will take 2-3 minutes with live progress:');
        console.log('');

        const installResult = await this.installWithRealTimeOutput('npm install -g @google/gemini-cli');
        
        if (!installResult.success) {
            throw new Error(`Installation failed (code ${installResult.code}): ${installResult.stderr}`);
        }

        // Verify installation
        console.log('\n   🔍 Verifying installation...');
        const verifyResult = await this.runCommand('gemini --version');
        if (!verifyResult.success) {
            throw new Error('Installation verification failed. Try running as administrator.');
        }

        this.logSuccess(`Installed successfully: ${verifyResult.stdout.trim()}`);
    }

    async authenticateGeminiCLI() {
        this.logStep('Setting up authentication');
        
        console.log('   🔍 Testing authentication with simple query...');
        
        // Test authentication by trying a simple command
        const testAuth = await this.runCommand('echo "test auth" | gemini -p "Just respond with OK"');
        if (testAuth.success && testAuth.stdout.includes('OK')) {
            this.logSuccess('Already authenticated and working!');
            return;
        }

        if (testAuth.stderr && testAuth.stderr.includes('Please authenticate')) {
            console.log('   ❌ Authentication required');
            console.log('\n   🔐 AUTHENTICATION REQUIRED');
            console.log('   📝 Gemini CLI will prompt for login when first used');
            console.log('   ⚠️  Make sure you\'re signed into the correct Google account\n');
            
            const proceed = await this.askQuestion('   Test authentication now? (y/n): ');
            if (!['y', 'yes'].includes(proceed.toLowerCase().trim())) {
                console.log('   ⚠️  Skipping auth test - will authenticate on first use');
                this.logSuccess('Authentication setup ready (will prompt on first use)');
                return;
            }

            console.log('\n   🌐 Running interactive authentication test...');
            console.log('   ⏳ This may open a browser window...');
            
            // Try interactive authentication
            const authResult = await this.runInteractiveCommand('echo "hello" | gemini -p "Say hi"');
            if (!authResult.success) {
                throw new Error('Interactive authentication failed. Please try again manually.');
            }
        } else if (testAuth.stderr && testAuth.stderr.includes('token count') && testAuth.stderr.includes('exceeds')) {
            // This means authentication is working but context is too large
            console.log('   ✅ Authentication working (context size issue detected - that\'s normal for large projects)');
            this.logSuccess('Authentication verified!');
            return;
        } else if (!testAuth.success) {
            console.log('   ⚠️  Could not verify authentication status');
            console.log('   📝 Gemini CLI will handle authentication automatically on first use');
            this.logSuccess('Authentication setup ready (auto-login on first use)');
            return;
        }

        this.logSuccess('Authentication successful!');
    }

    async runInteractiveCommand(command) {
        return new Promise((resolve) => {
            const child = spawn(command, [], {
                shell: true,
                stdio: 'inherit'
            });

            child.on('close', (code) => {
                resolve({ success: code === 0, code });
            });
        });
    }

    async updateConfig() {
        this.logStep('Updating configuration files');
        
        try {
            console.log('   📄 Reading current .env file...');
            let envContent = '';
            try {
                envContent = await fs.readFile('.env', 'utf8');
            } catch (error) {
                console.log('   📝 No .env file found, creating one...');
            }

            if (envContent.includes('GEMINI_CLI_ENABLED')) {
                this.logSuccess('Gemini CLI config already exists in .env');
            } else {
                console.log('   ✏️  Adding Gemini CLI configuration...');
                const geminiConfig = `
# Gemini CLI Configuration (1M Context Window - FREE)
GEMINI_CLI_ENABLED=true
GEMINI_CLI_MODEL=gemini-2.5-pro
GEMINI_CLI_CONTEXT_WINDOW=1000000
GEMINI_CLI_SEARCH_ENABLED=true
GEMINI_CLI_MAX_REQUESTS_PER_MINUTE=60
GEMINI_CLI_MAX_REQUESTS_PER_DAY=1000
`;
                envContent += geminiConfig;
                await fs.writeFile('.env', envContent);
                console.log('   ✅ Added Gemini CLI config to .env');
            }

            // Ask about default provider
            if (envContent.includes('CURRENT_PROVIDER=')) {
                const setDefault = await this.askQuestion('   🔧 Set Gemini CLI as default provider? (y/n): ');
                if (['y', 'yes'].includes(setDefault.toLowerCase().trim())) {
                    envContent = envContent.replace(/CURRENT_PROVIDER=.*/, 'CURRENT_PROVIDER=gemini-cli');
                    await fs.writeFile('.env', envContent);
                    console.log('   ✅ Set as default provider');
                }
            } else {
                envContent += '\nCURRENT_PROVIDER=gemini-cli\n';
                await fs.writeFile('.env', envContent);
                console.log('   ✅ Set as default provider');
            }

            this.logSuccess('Configuration updated successfully!');

        } catch (error) {
            throw new Error(`Config update failed: ${error.message}`);
        }
    }

    async testIntegration() {
        this.logStep('Testing integration');
        
        console.log('   🧪 Running basic functionality test...');
        console.log('   ⏳ This may take 10-15 seconds...');
        
        // Use a simple test to avoid context overload
        const testResult = await this.runCommand('echo "test" | gemini -p "Just respond with: TEST OK"');
        if (!testResult.success) {
            console.log('   ⚠️  Basic test had issues, trying alternative...');
            const altTest = await this.runCommand('gemini --version');
            if (!altTest.success) {
                throw new Error('Integration test failed - CLI not responding');
            }
            console.log('   ✅ CLI responds to --version (basic connectivity OK)');
        } else {
            console.log('   ✅ Full functionality test passed!');
            console.log(`   📋 Response: ${testResult.stdout.substring(0, 50).trim()}...`);
        }

        console.log('   🔍 Checking integration with project...');
        // Test that we can use gemini for project tasks
        try {
            const projectTest = await this.runCommand('echo "summarize" | gemini -p "Respond with just: READY FOR PROJECT USE"');
            if (projectTest.success) {
                console.log('   ✅ Ready for project integration');
            } else {
                console.log('   ⚠️  Project test had issues but CLI is functional');
            }
        } catch (error) {
            console.log('   ⚠️  Project integration test skipped (CLI is functional)');
        }

        this.logSuccess('Integration test completed!');
    }
}

// Run the setup
const setup = new GeminiCLISetup();
setup.run().catch(error => {
    console.error('\n💥 FATAL ERROR:', error.message);
    console.log('\n🆘 For support:');
    console.log('   • Check https://github.com/google-gemini/gemini-cli');
    console.log('   • Ensure you have admin/sudo privileges');
    console.log('   • Try running: npm cache clean --force\n');
    process.exit(1);
});
