#!/usr/bin/env node

/**
 * Provider Validation Script for Requirements Gathering Agent
 * Tests each AI provider's ability to generate documents
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
    providers: [
        { name: 'github-ai', display: 'GitHub AI' },
        { name: 'google-ai', display: 'Google AI Studio' },
        { name: 'azure-openai', display: 'Azure OpenAI' },
        { name: 'gemini-cli', display: 'Gemini CLI (1M Context)', featured: true },
        { name: 'ollama', display: 'Ollama' }
    ],
    testDocument: 'key-roles-and-needs',
    timeout: 90000, // 90 seconds per test (increased for Gemini CLI)
    outputDir: 'generated-documents'
};

class ProviderValidator {
    constructor() {
        this.results = {};
        this.originalProvider = null;
    }

    // Check if a provider is enabled based on environment variables
    isProviderEnabled(providerName) {
        switch (providerName) {
            case 'ollama':
                return process.env.OLLAMA_ENABLED === 'true';
            case 'gemini-cli':
                return process.env.GEMINI_CLI_ENABLED === 'true';
            case 'azure-openai':
                return !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY);
            case 'github-ai':
                return !!(process.env.GITHUB_TOKEN || process.env.GITHUB_ENDPOINT);
            case 'google-ai':
                return !!process.env.GOOGLE_API_KEY;
            default:
                return true; // Default to enabled for unknown providers
        }
    }

    async run() {
        console.log('🚀 Starting AI Provider Validation Tests\n');
        console.log('=' .repeat(60));
        
        // Get current provider
        await this.getCurrentProvider();
        
        // Test each provider
        for (const provider of TEST_CONFIG.providers) {
            // Check if provider is enabled
            if (!this.isProviderEnabled(provider.name)) {
                console.log(`⏭️  Skipping ${provider.display} (${provider.name}) - disabled in .env`);
                console.log('-'.repeat(50));
                this.results[provider.name] = {
                    display: provider.display,
                    status: '⏭️ SKIPPED',
                    generation: '⏭️ DISABLED',
                    output: '⏭️ DISABLED',
                    error: 'Provider disabled in .env configuration',
                    overall: false
                };
                console.log('');
                continue;
            }
            
            await this.testProvider(provider);
        }
        
        // Restore original provider
        await this.restoreOriginalProvider();
        
        // Show summary
        this.showSummary();
    }

    async checkGeminiCLI() {
        try {
            // Check if Gemini CLI is installed
            const versionResult = await this.runCommand('gemini --version', 5000);
            if (!versionResult.success) {
                return {
                    ready: false,
                    error: 'Gemini CLI not installed. Run: npm install -g @google/gemini-cli'
                };
            }
            
            // Check if authenticated by testing functionality
            const authResult = await this.runCommand('echo "test" | gemini -p "respond with: AUTH OK"', 10000);
            if (!authResult.success) {
                // Check if it's an authentication error or other issue
                if (authResult.stderr && (authResult.stderr.includes('auth') || authResult.stderr.includes('login'))) {
                    return {
                        ready: false,
                        error: 'Gemini CLI not authenticated. Authentication will happen on first use.'
                    };
                } else if (authResult.stderr && authResult.stderr.includes('token count') && authResult.stderr.includes('exceeds')) {
                    // This is actually a good sign - means auth is working but context is large
                    return {
                        ready: true,
                        version: versionResult.stdout.trim() + ' (authenticated)'
                    };
                } else {
                    return {
                        ready: false,
                        error: `Gemini CLI test failed: ${authResult.stderr || 'Unknown error'}`
                    };
                }
            }
            
            return {
                ready: true,
                version: versionResult.stdout.trim() + ' (authenticated)'
            };
            
        } catch (error) {
            return {
                ready: false,
                error: `Gemini CLI check failed: ${error.message}`
            };
        }
    }

    async getCurrentProvider() {
        try {
            const envContent = fs.readFileSync('.env', 'utf8');
            const match = envContent.match(/CURRENT_PROVIDER=(.+)/);
            this.originalProvider = match ? match[1].trim() : 'github-ai';
            console.log(`📋 Original provider: ${this.originalProvider}\n`);
        } catch (error) {
            console.log('⚠️  Could not read current provider, defaulting to github-ai\n');
            this.originalProvider = 'github-ai';
        }
    }

    async testProvider(provider) {
        const featured = provider.featured ? ' 🌟' : '';
        console.log(`🔄 Testing ${provider.display}${featured} (${provider.name})`);
        console.log('-'.repeat(50));
        
        try {
            // Set provider in .env
            await this.setProvider(provider.name);
            
            // Special handling for Gemini CLI
            if (provider.name === 'gemini-cli') {
                const geminiStatus = await this.checkGeminiCLI();
                if (!geminiStatus.ready) {
                    this.results[provider.name] = {
                        display: provider.display,
                        status: '❌ NOT_READY',
                        generation: '❌ SKIPPED',
                        output: '❌ SKIPPED',
                        error: geminiStatus.error,
                        overall: false
                    };
                    console.log(`❌ ${provider.display}: Not ready - ${geminiStatus.error}`);
                    console.log('   💡 Run: npm run setup-gemini-cli');
                    console.log('');
                    return;
                }
            }
            
            // Test status command
            const statusResult = await this.runCommand('node dist/cli.js status');
            
            // Test document generation with increased timeout for Gemini CLI
            const timeout = provider.name === 'gemini-cli' ? TEST_CONFIG.timeout + 30000 : TEST_CONFIG.timeout;
            const generateResult = await this.runCommand(
                `node dist/cli.js generate ${TEST_CONFIG.testDocument} --quiet`,
                timeout
            );
            
            // Check if output file was created
            const outputExists = this.checkOutputFile(provider.name);
            
            this.results[provider.name] = {
                display: provider.display,
                status: statusResult.success ? '✅ OK' : '❌ FAILED',
                generation: generateResult.success ? '✅ OK' : '❌ FAILED',
                output: outputExists ? '✅ Created' : '❌ Missing',
                error: generateResult.error || statusResult.error,
                overall: statusResult.success && generateResult.success && outputExists,
                special: provider.featured ? 'Featured: 1M Context Window' : undefined
            };
            
            if (this.results[provider.name].overall) {
                console.log(`✅ ${provider.display}: All tests passed${featured}`);
                if (provider.name === 'gemini-cli') {
                    console.log('   🚀 1 Million token context window available!');
                }
            } else {
                console.log(`❌ ${provider.display}: Some tests failed`);
                if (this.results[provider.name].error) {
                    console.log(`   Error: ${this.results[provider.name].error}`);
                }
            }
            
        } catch (error) {
            this.results[provider.name] = {
                display: provider.display,
                status: '❌ ERROR',
                generation: '❌ ERROR',
                output: '❌ ERROR',
                error: error.message,
                overall: false
            };
            console.log(`❌ ${provider.display}: Test failed with error`);
            console.log(`   Error: ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }

    async setProvider(providerName) {
        try {
            let envContent = fs.readFileSync('.env', 'utf8');
            
            // Update CURRENT_PROVIDER
            if (envContent.includes('CURRENT_PROVIDER=')) {
                envContent = envContent.replace(
                    /CURRENT_PROVIDER=.*/,
                    `CURRENT_PROVIDER=${providerName}`
                );
            } else {
                envContent += `\nCURRENT_PROVIDER=${providerName}\n`;
            }
            
            fs.writeFileSync('.env', envContent);
            
            // Wait a moment for the change to take effect
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            throw new Error(`Failed to set provider: ${error.message}`);
        }
    }

    async restoreOriginalProvider() {
        if (this.originalProvider) {
            console.log(`🔄 Restoring original provider: ${this.originalProvider}`);
            await this.setProvider(this.originalProvider);
        }
    }

    runCommand(command, timeoutMs = TEST_CONFIG.timeout) {
        return new Promise((resolve) => {
            const [cmd, ...args] = command.split(' ');
            const child = spawn(cmd, args, { 
                cwd: process.cwd(),
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            let stdout = '';
            let stderr = '';
            
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            const timeout = setTimeout(() => {
                child.kill();
                resolve({
                    success: false,
                    error: 'Command timed out',
                    stdout: stdout,
                    stderr: stderr
                });
            }, timeoutMs);
            
            child.on('close', (code) => {
                clearTimeout(timeout);
                resolve({
                    success: code === 0,
                    error: code !== 0 ? stderr || `Exit code: ${code}` : null,
                    stdout: stdout,
                    stderr: stderr
                });
            });
        });
    }

    checkOutputFile(providerName) {
        try {
            const outputDir = path.join(TEST_CONFIG.outputDir, 'requirements');
            const expectedFile = path.join(outputDir, `${TEST_CONFIG.testDocument}.md`);
            
            if (fs.existsSync(expectedFile)) {
                const stats = fs.statSync(expectedFile);
                // Check if file was created recently (within last 5 minutes)
                const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
                return stats.mtime.getTime() > fiveMinutesAgo && stats.size > 100;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }

    showSummary() {
        console.log('📊 VALIDATION SUMMARY');
        console.log('=' .repeat(60));
        
        const headers = ['Provider', 'Status', 'Generation', 'Output', 'Overall'];
        const rows = [];
        
        for (const [key, result] of Object.entries(this.results)) {
            rows.push([
                result.display,
                result.status,
                result.generation,
                result.output,
                result.overall ? '✅ PASS' : '❌ FAIL'
            ]);
        }
        
        // Simple table formatting
        const colWidths = headers.map((header, i) => 
            Math.max(header.length, ...rows.map(row => row[i].length))
        );
        
        // Print header
        console.log(headers.map((header, i) => header.padEnd(colWidths[i])).join(' | '));
        console.log(colWidths.map(w => '-'.repeat(w)).join('-|-'));
        
        // Print rows
        rows.forEach(row => {
            console.log(row.map((cell, i) => cell.padEnd(colWidths[i])).join(' | '));
        });
        
        console.log('');
        
        // Overall summary
        const passCount = Object.values(this.results).filter(r => r.overall).length;
        const totalCount = Object.keys(this.results).length;
        
        if (passCount === totalCount) {
            console.log(`🎉 ALL PROVIDERS VALIDATED SUCCESSFULLY! (${passCount}/${totalCount})`);
        } else {
            console.log(`⚠️  ${passCount}/${totalCount} providers validated successfully`);
            
            // Show failed providers with errors
            const failed = Object.entries(this.results)
                .filter(([_, result]) => !result.overall);
            
            if (failed.length > 0) {
                console.log('\n❌ Failed Providers:');
                failed.forEach(([key, result]) => {
                    console.log(`   ${result.display}: ${result.error || 'Unknown error'}`);
                });
            }
        }
        
        console.log('\n✅ Validation complete!');
    }
}

// Run the validator
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const validator = new ProviderValidator();
    validator.run().catch(error => {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    });
}

export default ProviderValidator;
