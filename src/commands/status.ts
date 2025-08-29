/**
 * Status Command Handler
 * Displays comprehensive system status, configuration, and AI provider information
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { config as dotenvConfig } from 'dotenv';
import { REQUIRED_FILES, DEFAULT_OUTPUT_DIR } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));

/**
 * Helper to check for provider config and display its status
 */
const checkProvider = (name: string, envVars: string[], details: () => void) => {
    const isConfigured = envVars.every(v => !!process.env[v]);
    console.log(`\n   ${name}:`);
    console.log(`      Status: ${isConfigured ? '✅ Configured' : '❌ Not Configured'}`);
    if (isConfigured) {
        details();
    }
};

// Example usage of version from package.json
console.log(`Version: ${pkg.version}`);

/**
 * Check file existence and report status
 */
const checkFiles = () => {
    console.log('\n📁 PROJECT FILES:');
    
    REQUIRED_FILES.forEach(file => {
        const exists = existsSync(join(process.cwd(), file.name));
        const status = exists ? '✅ Found' : (file.required ? '❌ Missing (Required)' : '⚠️  Missing (Optional)');
        console.log(`   ${file.name}: ${status}`);
    });
};

/**
 * Check AI provider configurations
 */
const checkAIProviders = () => {
    console.log('\n🤖 AI PROVIDER STATUS:');

    checkProvider('🟣 Google AI Studio', ['GOOGLE_AI_API_KEY'], () => {
        console.log(`      Model: ${process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash'}`);
        console.log(`      Endpoint: ${process.env.GOOGLE_AI_ENDPOINT || 'https://generativelanguage.googleapis.com'}`);
    });

    checkProvider('🟢 GitHub AI', ['GITHUB_TOKEN'], () => {
        console.log(`      Endpoint: ${process.env.GITHUB_ENDPOINT || 'https://models.github.ai/inference/'}`);
        console.log(`      Model: ${process.env.GITHUB_MODEL || process.env.REQUIREMENTS_AGENT_MODEL || 'gpt-4o-mini'}`);
    });

    checkProvider('🔷 Azure OpenAI', ['AZURE_OPENAI_ENDPOINT'], () => {
        if (process.env.USE_ENTRA_ID === 'true') {
            console.log(`      Auth: Entra ID`);
            console.log(`      Tenant: ${process.env.AZURE_TENANT_ID ? '✅ Set' : '❌ Missing'}`);
        } else {
            console.log(`      Auth: API Key`);
            console.log(`      API Key: ${process.env.AZURE_OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
        }
        console.log(`      Deployment: ${process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.DEPLOYMENT_NAME || 'Not set'}`);
        console.log(`      API Version: ${process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'}`);
    });

    checkProvider('🦙 Ollama', ['OLLAMA_ENDPOINT'], () => {
        console.log(`      Endpoint: ${process.env.OLLAMA_ENDPOINT}`);
        console.log(`      Model: ${process.env.OLLAMA_MODEL || 'Not specified'}`);
    });
};

/**
 * Check current provider configuration
 */
const checkCurrentProvider = () => {
    console.log('\n⚙️  CURRENT CONFIGURATION:');
    const currentProvider = process.env.CURRENT_PROVIDER;
    if (currentProvider) {
        console.log(`   Active Provider: ${currentProvider}`);
    } else {
        console.log('   Active Provider: ❌ Not set (check CURRENT_PROVIDER in .env)');
    }
    
    const outputDir = process.env.DEFAULT_OUTPUT_DIR || DEFAULT_OUTPUT_DIR;
    console.log(`   Output Directory: ${outputDir}`);
    
    const debugMode = process.env.DEBUG === 'true';
    console.log(`   Debug Mode: ${debugMode ? '✅ Enabled' : '❌ Disabled'}`);
};

/**
 * Main status command handler
 */
export async function handleStatusCommand(): Promise<void> {
    console.log('\n🔍 Requirements Gathering Agent - System Status\n');

    // Version and environment info
    console.log('📋 VERSION INFO:');
    console.log(`   🚀 CLI Version: ${pkg.version}`);
    console.log(`   📁 Working Directory: ${process.cwd()}`);
    console.log(`   🟢 Node.js: ${process.version}`);
    console.log(`   💻 Platform: ${process.platform} (${process.arch})`);

    // Load environment variables
    const envPath = join(process.cwd(), '.env');
    if (existsSync(envPath)) {
        console.log('\n✅ Loading .env configuration...');
        dotenvConfig(); // Load .env to check variables
        
        checkCurrentProvider();
        checkAIProviders();
    } else {
        console.log('\n❌ .env file not found');
        console.log('   Run `rga setup` to configure AI providers.');
    }

    checkFiles();

    // System resources
    console.log('\n💾 SYSTEM RESOURCES:');
    const memUsage = process.memoryUsage();
    console.log(`   Memory Usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
    console.log(`   Uptime: ${Math.round(process.uptime())}s`);

    console.log('\n📖 HELP:');
    console.log('   • Run `rga setup` to configure AI providers');
    console.log('   • Run `rga list-templates` to see available document types');
    console.log('   • Run `rga generate-core-analysis` to start generating documents');
    console.log('   • Run `rga --help` for all available commands\n');
}

/**
 * Export type for command options (if needed in the future)
 */
export interface StatusCommandOptions {
    quiet?: boolean;
    verbose?: boolean;
}
