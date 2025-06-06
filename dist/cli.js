#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import process from 'process';
import { DocumentGenerator, generateDocumentsWithRetry } from './modules/documentGenerator.js';
import { readEnhancedProjectContext } from './modules/fileManager.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function main() {
    try {
        console.log('🚀 Requirements Gathering Agent v2.1.2'); // Updated version
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
            format: getArgValue('--format', 'markdown', ['markdown', 'json', 'yaml']),
            retries: getNumericValue('--retries', 0)
        };
        // Show version
        if (args.includes('--version') || args.includes('-v')) {
            console.log('v2.1.2'); // Updated version
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
            const generator = new DocumentGenerator(context);
            const validation = await generator.validateGeneration();
            const pmbokCompliance = await generator.validatePMBOKCompliance();
            console.log('\n📋 Validation Summary:');
            console.log(`📁 Documents Complete: ${validation.isComplete ? 'Yes' : 'No'}`);
            console.log(`📊 PMBOK Compliance: ${pmbokCompliance.compliance ? 'Compliant' : 'Non-compliant'}`);
            console.log(`🎯 Consistency Score: ${pmbokCompliance.consistencyScore}/100`);
            if (!validation.isComplete) {
                process.exit(1);
            }
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
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        if (!error.message.includes('Configuration error')) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
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
            check: () => !!(process.env.GITHUB_TOKEN && (process.env.AZURE_AI_ENDPOINT?.includes('models.inference.ai.azure.com') ||
                process.env.AZURE_AI_ENDPOINT?.includes('models.github.ai')))
        },
        {
            name: 'Ollama (Local)',
            check: () => !!(process.env.AZURE_AI_ENDPOINT?.includes('localhost:11434') ||
                process.env.AZURE_AI_ENDPOINT?.includes('127.0.0.1:11434'))
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
    console.log('   AZURE_AI_ENDPOINT=https://models.inference.ai.azure.com');
    console.log('   GITHUB_TOKEN=your-github-token');
    console.log('   REQUIREMENTS_AGENT_MODEL=gpt-4o-mini');
    console.log('\n🟡 For Ollama (Local, offline):');
    console.log('   AZURE_AI_ENDPOINT=http://localhost:11434');
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
function printHelp() {
    console.log(`
Requirements Gathering Agent v2.1.2
AI-powered PMBOK documentation generator with validation

USAGE:
  requirements-gathering-agent [options] [document-types]

OPTIONS:
  -h, --help              Show this help message
  -v, --version           Show version information
  --output <dir>          Specify output directory (default: generated-documents)
  --format <fmt>          Output format: markdown|json|yaml (default: markdown)
  --quiet                 Suppress progress messages (good for CI/CD)
  --retries <n>          Number of retry attempts for failed generations

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
  # Generate all documents
  requirements-gathering-agent

  # Generate all documents with PMBOK 7.0 validation
  requirements-gathering-agent --validate-pmbok

  # Generate with comprehensive validation and quality assessment
  requirements-gathering-agent --generate-with-validation

  # Generate specific document types
  requirements-gathering-agent --generate-core --generate-technical

  # Generate stakeholder documents only
  requirements-gathering-agent --generate-stakeholder

  # Validate existing documents without regenerating
  requirements-gathering-agent --validate-only

  # Check document consistency only
  requirements-gathering-agent --validate-consistency

  # Get quality assessment of existing documents
  requirements-gathering-agent --quality-assessment

  # Specify output directory and format
  requirements-gathering-agent --output ./docs --format yaml

  # CI/CD pipeline usage with validation
  requirements-gathering-agent --quiet --retries 3 --validate-pmbok --output ./artifacts

  # Using npm
  npm start -- --generate-core --output ./docs

  # Direct execution
  node dist/cli.js --generate-management --format json

TROUBLESHOOTING:
  • Build first: npm run build
  • Check config: cat .env
  • Test Azure auth: az account show
  • Test Ollama: curl http://localhost:11434/api/tags
  • Check deployment: az cognitiveservices account deployment list

OUTPUT STRUCTURE:
  <output-dir>/
  ├── core-analysis/          # User stories, personas, requirements
  ├── project-charter/        # Formal project authorization
  ├── management-plans/       # PMBOK management plans
  ├── planning-artifacts/     # WBS, schedules, estimates
  ├── stakeholder-management/ # Stakeholder analysis and engagement
  └── technical-analysis/     # Tech stack, data models, UX

VALIDATION FEATURES:
  ✅ PMBOK 7.0 compliance checking
  ✅ Cross-document consistency validation
  ✅ Document quality assessment (0-100 scoring)
  ✅ Required element verification
  ✅ Professional terminology validation
  ✅ Comprehensive validation reports

For more information, visit:
https://github.com/mdresch/requirements-gathering-agent
  `);
}
// Run main function
main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map