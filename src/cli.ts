#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import process from 'process';
import { 
    DocumentGenerator, 
    generateAllDocuments, 
    generateDocumentsWithRetry,
    getAvailableCategories 
} from './modules/documentGenerator.js';
import { readProjectContext } from './modules/fileManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    console.log('🚀 Requirements Gathering Agent v2.0.0');
    console.log('🔧 Initializing...');
    
    // Validate environment and AI provider
    const isValid = await validateEnvironment();
    if (!isValid) {
        return;
    }
    
    console.log('🚀 Starting document generation...');
    
    // Read project context
    const context = readProjectContext();
    
    // Parse command line arguments for selective generation
    const args = process.argv.slice(2);
    
    if (args.includes('--core-only')) {
        console.log('🎯 Generating core documents only...');
        await DocumentGenerator.generateCoreDocuments(context);
    } else if (args.includes('--management-plans')) {
        console.log('📋 Generating management plans only...');
        await DocumentGenerator.generateManagementPlans(context);
    } else if (args.includes('--planning-artifacts')) {
        console.log('🏗️ Generating planning artifacts only...');
        await DocumentGenerator.generatePlanningArtifacts(context);
    } else if (args.includes('--technical-analysis')) {
        console.log('⚙️ Generating technical analysis only...');
        await DocumentGenerator.generateTechnicalAnalysis(context);
    } else if (args.includes('--with-retry')) {
        console.log('🔄 Generating with retry logic...');
        await generateDocumentsWithRetry(context, { maxRetries: 3 });
    } else {
        console.log('📋 Generating all PMBOK documents...');
        await generateAllDocuments(context);
    }
    
    console.log('🎉 Document generation completed successfully!');
    console.log('📁 Check the generated-documents/ directory for organized output');
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

async function validateEnvironment(): Promise<boolean> {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return false;
  }

  // Check for version flag
  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log('2.0.0');
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
    } else {
      console.log('💡 Create a .env file with your AI provider configuration');
    }
    return false;
  } else if (result.error) {
    console.warn('⚠️  Error loading .env file:', result.error.message);
    return false;
  } else {
    console.log('✅ Environment configuration loaded');
  }

  // Enhanced provider detection with better validation
  const providers = detectConfiguredProviders();
  
  if (providers.length === 0) {
    console.log('⚠️  No AI provider configuration found.');
    console.log('📋 Please configure at least one AI provider in your .env file.');
    console.log('📖 See .env.example for configuration options.');
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

function detectConfiguredProviders(): string[] {
  const providers: string[] = [];
  
  // Check Azure OpenAI with Entra ID
  if (process.env.AZURE_OPENAI_ENDPOINT && process.env.USE_ENTRA_ID === 'true') {
    providers.push('Azure OpenAI (Entra ID)');
  }
  
  // Check Azure OpenAI with API Key
  if (process.env.AZURE_AI_ENDPOINT?.includes('openai.azure.com') && process.env.AZURE_AI_API_KEY) {
    providers.push('Azure OpenAI (API Key)');
  }
  
  // Check GitHub AI
  if (process.env.GITHUB_TOKEN && 
      (process.env.AZURE_AI_ENDPOINT?.includes('models.inference.ai.azure.com') || 
       process.env.AZURE_AI_ENDPOINT?.includes('models.github.ai'))) {
    providers.push('GitHub AI');
  }
  
  // Check Ollama
  if (process.env.AZURE_AI_ENDPOINT?.includes('localhost:11434') || 
      process.env.AZURE_AI_ENDPOINT?.includes('127.0.0.1:11434')) {
    providers.push('Ollama (Local)');
  }
  
  return providers;
}

function suggestProviderConfiguration(): void {
  console.log('\n🔧 Quick setup suggestions:');
  
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
  console.log('   AZURE_AI_ENDPOINT=https://models.inference.ai.azure.com');
  console.log('   GITHUB_TOKEN=your-github-token');
  console.log('   REQUIREMENTS_AGENT_MODEL=gpt-4o-mini');
  
  console.log('\n🟡 For Ollama (Local, offline):');
  console.log('   AZURE_AI_ENDPOINT=http://localhost:11434');
  console.log('   REQUIREMENTS_AGENT_MODEL=llama3.1');
  console.log('   Then run: ollama serve');
}

async function validateAzureAuthentication(): Promise<void> {
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
    } catch (authError: any) {
      console.warn('⚠️  Azure authentication may have issues:', authError.message);
      console.log('💡 Run "az login" to authenticate with Azure');
      console.log('💡 Ensure you have access to the Cognitive Services resource');
      console.log('💡 Check your Azure subscription and resource permissions');
    }
    
  } catch (importError: any) {
    console.warn('⚠️  Azure Identity SDK not available - install @azure/identity');
    console.log('💡 Run: npm install @azure/identity');
  }
}

function printHelp(): void {
  console.log(`
Requirements Gathering Agent v2.0.0
AI-powered PMBOK documentation generator

USAGE:
  requirements-gathering-agent [options]
  requirements-agent [options]

OPTIONS:
  -h, --help              Show this help message
  -v, --version           Show version information
  --core-only             Generate only core analysis documents
  --management-plans      Generate only management plans
  --planning-artifacts    Generate only planning artifacts
  --technical-analysis    Generate only technical analysis
  --with-retry            Generate with retry logic for failed documents

CONFIGURATION:
  Create a .env file with your AI provider configuration:
  
  Azure OpenAI with Entra ID (Recommended):
    AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
    DEPLOYMENT_NAME=gpt-4.1-mini
    USE_ENTRA_ID=true
  
  Azure OpenAI with API Key:
    AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com/
    AZURE_AI_API_KEY=your-api-key
    REQUIREMENTS_AGENT_MODEL=gpt-4.1-mini
  
  GitHub AI:
    AZURE_AI_ENDPOINT=https://models.inference.ai.azure.com
    GITHUB_TOKEN=your-github-token
    REQUIREMENTS_AGENT_MODEL=gpt-4o-mini
  
  Ollama (Local):
    AZURE_AI_ENDPOINT=http://localhost:11434
    REQUIREMENTS_AGENT_MODEL=llama3.1

AUTHENTICATION:
  For Azure Entra ID: az login
  For API keys: Set in .env file
  For Ollama: Start ollama serve

EXAMPLES:
  requirements-gathering-agent                 # Generate all documents
  requirements-gathering-agent --core-only     # Generate core documents only
  requirements-gathering-agent --with-retry    # Generate with retry logic
  npm start                                    # Using npm
  node dist/cli.js                            # Direct execution

TROUBLESHOOTING:
  • Build first: npm run build
  • Check config: cat .env
  • Test Azure auth: az account show
  • Test Ollama: curl http://localhost:11434/api/tags
  • Check deployment: az cognitiveservices account deployment list

OUTPUT:
  Generated documents are organized in: generated-documents/
  ├── core-analysis/          # User stories, personas, requirements
  ├── project-charter/        # Formal project authorization
  ├── management-plans/       # PMBOK management plans
  ├── planning-artifacts/     # WBS, schedules, estimates
  ├── stakeholder-management/ # Stakeholder analysis
  └── technical-analysis/     # Tech stack, data models, UX

For more information, visit:
https://github.com/mdresch/requirements-gathering-agent
  `);
}

// Run main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
