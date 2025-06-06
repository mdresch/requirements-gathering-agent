// Fix: Use exported createAISummary instead of this.createAISummary
// Fix: Use exported analyzeDocumentContextUtilization instead of contextManager.analyzeDocumentContext
// Fix: Use exported addProjectContext instead of contextManager.addEnrichedContext
// Fix: Remove or correct any references to this.createAISummary, this.analyzeDocumentContext, contextManager.analyzeDocumentContext, contextManager.addEnrichedContext
// --- PATCHED CONTEXT MANAGER USAGE ---
// (1) Replace this.createAISummary with createAISummary
// (2) Replace contextManager.analyzeDocumentContext with analyzeDocumentContextUtilization
// (3) Replace contextManager.addEnrichedContext with addProjectContext
// (4) Remove or correct any references to this.analyzeDocumentContext
// (A) Patch EnhancedContextManager methods if needed
// (B) Patch all usages below class definition
// --- PATCH: Replace this.createAISummary and this.analyzeDocumentContext ---
// (A) Patch EnhancedContextManager methods (if any)
// (B) Patch usages below
// (1) Patch analyzeDocumentContextUtilization usage
// (2) Patch addProjectContext usage
// (3) Patch createAISummary usage
// (4) Remove or correct any remaining references
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();
let client = null;
let azureOpenAIClient = null;
let googleAIClient = null;
let clientInitialized = false;
let rateLimitHit = false;
let skipAI = false;
// --- Minimal stubs for missing helpers ---
function createMessages(systemPrompt, userPrompt) {
    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
}
async function makeAICall(messages, maxTokens) {
    // Stub: In production, this would call the LLM. Here, just join the prompts.
    return messages.map((m) => m.content).join('\n');
}
function extractContent(response) {
    // Stub: In production, this would extract the LLM's response content.
    return typeof response === 'string' ? response : JSON.stringify(response);
}
async function handleAICall(fn, _label, _docType) {
    // Stub: Just call the function directly.
    return await fn();
}
const providerMetrics = {};
function initializeProviderMetrics(provider) {
    if (!providerMetrics[provider]) {
        providerMetrics[provider] = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalResponseTime: 0,
            averageResponseTime: 0,
            lastUsed: new Date(),
            rateLimitHits: 0,
            errors: {}
        };
    }
}
function updateProviderMetrics(provider, success, responseTime, errorType) {
    initializeProviderMetrics(provider);
    const metrics = providerMetrics[provider];
    metrics.totalCalls++;
    metrics.lastUsed = new Date();
    metrics.totalResponseTime += responseTime;
    metrics.averageResponseTime = metrics.totalResponseTime / metrics.totalCalls;
    if (success) {
        metrics.successfulCalls++;
    }
    else {
        metrics.failedCalls++;
        if (errorType) {
            metrics.errors[errorType] = (metrics.errors[errorType] || 0) + 1;
            if (errorType === 'rate_limit') {
                metrics.rateLimitHits++;
            }
        }
    }
}
const defaultRetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    retryableErrors: ['429', 'rate limit', 'timeout', '500', '502', '503', '504', 'ECONNRESET', 'ETIMEDOUT']
};
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function isRetryableError(error, retryableErrors) {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStatus = error.status?.toString() || '';
    return retryableErrors.some(retryableError => errorMessage.includes(retryableError.toLowerCase()) ||
        errorStatus === retryableError);
}
async function executeWithRetry(operation, operationName, config = defaultRetryConfig) {
    let lastError;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            const startTime = Date.now();
            const result = await operation();
            const endTime = Date.now();
            // Record successful metrics
            const provider = getAIProvider();
            updateProviderMetrics(provider, true, endTime - startTime);
            if (attempt > 0) {
                console.log(`✅ ${operationName} succeeded on attempt ${attempt + 1}`);
            }
            return result;
        }
        catch (error) {
            lastError = error;
            const provider = getAIProvider();
            const startTime = Date.now();
            const endTime = Date.now();
            // Determine error type for metrics
            let errorType = 'unknown';
            if (error.message?.includes('429') || error.message?.includes('rate limit')) {
                errorType = 'rate_limit';
            }
            else if (error.message?.includes('timeout')) {
                errorType = 'timeout';
            }
            else if (error.message?.includes('401') || error.message?.includes('authentication')) {
                errorType = 'authentication';
            }
            else if (error.status) {
                errorType = error.status.toString();
            }
            updateProviderMetrics(provider, false, endTime - startTime, errorType);
            // Check if this is the last attempt
            if (attempt === config.maxRetries) {
                console.error(`❌ ${operationName} failed after ${config.maxRetries + 1} attempts. Final error:`, error.message);
                throw error;
            }
            // Check if error is retryable
            if (!isRetryableError(error, config.retryableErrors)) {
                console.error(`❌ ${operationName} failed with non-retryable error:`, error.message);
                throw error;
            }
            // Calculate delay with exponential backoff
            const delay = Math.min(config.baseDelay * Math.pow(config.backoffMultiplier, attempt), config.maxDelay);
            console.log(`⚠️ ${operationName} failed on attempt ${attempt + 1}. Retrying in ${delay}ms... (${error.message})`);
            await sleep(delay);
        }
    }
    throw lastError;
}
// Determine which AI provider to use based on environment variables
function getAIProvider() {
    const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || "https://models.github.ai/inference";
    // Check for Google AI Studio first
    if (process.env.GOOGLE_AI_API_KEY) {
        return 'google-ai';
    }
    else if (endpoint.includes('openai.azure.com') && process.env.USE_ENTRA_ID === 'true') {
        return 'azure-openai';
    }
    else if (endpoint.includes('openai.azure.com')) {
        return 'azure-ai-studio';
    }
    else if (endpoint.includes('localhost:11434') || endpoint.includes('127.0.0.1:11434')) {
        return 'ollama';
    }
    else {
        return 'github-ai';
    }
}
// --- Azure OpenAI Connection Validation ---
async function validateAzureOpenAIConnection() {
    const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_AI_API_KEY;
    const deployment = process.env.DEPLOYMENT_NAME || process.env.REQUIREMENTS_AGENT_MODEL;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";
    const useEntra = process.env.USE_ENTRA_ID === 'true';
    let missingVars = [];
    if (!endpoint)
        missingVars.push('AZURE_AI_ENDPOINT or AZURE_OPENAI_ENDPOINT');
    if (!deployment)
        missingVars.push('DEPLOYMENT_NAME or REQUIREMENTS_AGENT_MODEL');
    if (!apiVersion)
        missingVars.push('AZURE_OPENAI_API_VERSION');
    if (!useEntra && !apiKey)
        missingVars.push('AZURE_AI_API_KEY');
    if (useEntra && (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID)) {
        if (!process.env.AZURE_CLIENT_ID)
            missingVars.push('AZURE_CLIENT_ID');
        if (!process.env.AZURE_TENANT_ID)
            missingVars.push('AZURE_TENANT_ID');
    }
    if (missingVars.length > 0) {
        throw new Error(`Azure OpenAI configuration error: Missing required environment variables: ${missingVars.join(', ')}`);
    }
    // Minimal test call to validate connection
    try {
        let testClient;
        if (useEntra) {
            const credential = new DefaultAzureCredential({
                managedIdentityClientId: process.env.AZURE_CLIENT_ID,
                tenantId: process.env.AZURE_TENANT_ID
            });
            const scope = "https://cognitiveservices.azure.com/.default";
            const azureADTokenProvider = getBearerTokenProvider(credential, scope);
            testClient = new AzureOpenAI({ endpoint: endpoint, azureADTokenProvider, apiVersion, deployment });
            await testClient.chat.completions.create({
                model: deployment,
                messages: [{ role: 'system', content: 'ping' }, { role: 'user', content: 'ping' }],
                max_tokens: 1
            });
        }
        else {
            testClient = ModelClient(endpoint, new AzureKeyCredential(apiKey));
            const apiPath = `/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
            await testClient.path(apiPath).post({
                body: {
                    messages: [
                        { role: 'system', content: 'ping' },
                        { role: 'user', content: 'ping' }
                    ],
                    model: deployment,
                    max_tokens: 1
                }
            });
        }
    }
    catch (error) {
        const err = error;
        if (err.status === 401 || /auth/i.test(err.message)) {
            throw new Error('Azure OpenAI authentication failed. Please check your credentials and run "az login" if using Entra ID.');
        }
        else if (err.status === 404 || /not found/i.test(err.message)) {
            throw new Error(`Azure OpenAI deployment/model "${deployment}" not found. Please check your DEPLOYMENT_NAME/REQUIREMENTS_AGENT_MODEL.`);
        }
        else if (err.status === 429 || /rate limit/i.test(err.message)) {
            throw new Error('Azure OpenAI rate limit exceeded. Please wait or check your quota.');
        }
        else if (/ENOTFOUND|ECONNREFUSED|network/i.test(err.message)) {
            throw new Error('Network error connecting to Azure OpenAI. Please check your endpoint and network connectivity.');
        }
        else {
            throw new Error(`Azure OpenAI connection failed: ${err.message}`);
        }
    }
}
function validateAzureOpenAIConfig() {
    const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.DEPLOYMENT_NAME || process.env.REQUIREMENTS_AGENT_MODEL;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
    const useEntra = process.env.USE_ENTRA_ID === 'true';
    let missing = [];
    if (!endpoint)
        missing.push('AZURE_AI_ENDPOINT or AZURE_OPENAI_ENDPOINT');
    if (!deployment)
        missing.push('DEPLOYMENT_NAME or REQUIREMENTS_AGENT_MODEL');
    if (!apiVersion)
        missing.push('AZURE_OPENAI_API_VERSION');
    if (!useEntra && !apiKey)
        missing.push('AZURE_AI_API_KEY or AZURE_OPENAI_API_KEY');
    if (useEntra && (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID)) {
        missing.push('AZURE_CLIENT_ID and AZURE_TENANT_ID (for Entra ID auth)');
    }
    if (missing.length > 0) {
        throw new Error(`Azure OpenAI configuration missing: ${missing.join(', ')}. Please check your .env file and documentation.`);
    }
}
// Patch initializeClient to call validation and block fallback if Azure OpenAI fails
function initializeClient() {
    if (clientInitialized)
        return { client, azureOpenAIClient, googleAIClient };
    const provider = getAIProvider();
    const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || "https://models.github.ai/inference";
    const token = process.env.AZURE_AI_API_KEY || process.env.GITHUB_TOKEN;
    console.log(`🔍 Detected AI Provider: ${provider}`);
    switch (provider) {
        case 'google-ai':
            try {
                console.log('✅ Initializing Google AI Studio client');
                const googleApiKey = process.env.GOOGLE_AI_API_KEY;
                if (!googleApiKey) {
                    console.error('❌ GOOGLE_AI_API_KEY is required for Google AI Studio');
                    break;
                }
                googleAIClient = new GoogleGenerativeAI(googleApiKey);
                console.log('🚀 Google AI Studio initialized successfully');
            }
            catch (error) {
                console.error('❌ Failed to initialize Google AI Studio:', error.message);
            }
            break;
        case 'azure-openai':
            (async () => {
                try {
                    await validateAzureOpenAIConnection();
                    console.log('🚀 Azure OpenAI with Entra ID validated successfully');
                }
                catch (err) {
                    console.error(`❌ Azure OpenAI validation failed: ${err.message}`);
                    skipAI = true;
                    clientInitialized = true;
                    return { client: null, azureOpenAIClient: null, googleAIClient: null };
                }
            })();
            try {
                console.log('✅ Initializing Azure OpenAI client with Entra ID authentication');
                const deployment = process.env.DEPLOYMENT_NAME || process.env.REQUIREMENTS_AGENT_MODEL || "gpt-4o-mini";
                const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";
                const credential = new DefaultAzureCredential({
                    managedIdentityClientId: process.env.AZURE_CLIENT_ID,
                    tenantId: process.env.AZURE_TENANT_ID
                });
                const scope = "https://cognitiveservices.azure.com/.default";
                const azureADTokenProvider = getBearerTokenProvider(credential, scope);
                azureOpenAIClient = new AzureOpenAI({
                    endpoint,
                    azureADTokenProvider,
                    apiVersion,
                    deployment
                });
            }
            catch (error) {
                const err = error;
                console.error(`❌ Azure OpenAI initialization error: ${err.message}`);
                skipAI = true;
                clientInitialized = true;
                return { client: null, azureOpenAIClient: null, googleAIClient: null };
            }
            break;
        case 'azure-ai-studio':
            try {
                validateAzureOpenAIConfig();
                console.log('✅ Initializing Azure OpenAI client with API key');
                client = token ? ModelClient(endpoint, new AzureKeyCredential(token)) : null;
                // Validate connection
                (async () => {
                    try {
                        await validateAzureOpenAIConnection();
                        console.log('🚀 Azure OpenAI with API key validated successfully');
                    }
                    catch (err) {
                        console.error(`❌ Azure OpenAI API key validation failed: ${err.message}`);
                        skipAI = true;
                        clientInitialized = true;
                        return { client: null, azureOpenAIClient: null, googleAIClient: null };
                    }
                })();
            }
            catch (err) {
                console.error('❌ Azure OpenAI API key initialization failed:', err.message);
                throw err;
            }
            break;
        case 'ollama':
            console.log('✅ Initializing Ollama client (local AI)');
            client = ModelClient(endpoint, new AzureKeyCredential('dummy-token-for-ollama'));
            break;
        case 'github-ai':
        default:
            console.log('✅ Initializing GitHub AI client');
            client = token ? ModelClient(endpoint, new AzureKeyCredential(token)) : null;
            break;
    }
    if (!client && !azureOpenAIClient && !googleAIClient) {
        console.warn('⚠️  No AI client initialized - check your environment variables');
    }
    clientInitialized = true;
    return { client, azureOpenAIClient, googleAIClient };
}
// Export getModel for use in contextManager
export function getModel() {
    // This should return the current model name from your provider selection logic
    // Example: return process.env.AZURE_OPENAI_MODEL || 'gpt-4';
    // Replace with your actual model selection logic
    return globalThis.CURRENT_AI_MODEL || process.env.AZURE_OPENAI_MODEL || 'gpt-4';
}
// Export createAISummary for use in contextManager
export async function createAISummary(text, maxTokens) {
    try {
        const messages = createMessages("You are an expert technical writer. Create a comprehensive but concise summary of the following project information, preserving all key technical details, requirements, and business context.", `Please summarize this project information in approximately ${maxTokens} tokens while preserving all essential details:\n\n${text}`);
        const response = await makeAICall(messages, maxTokens);
        return extractContent(response);
    }
    catch (error) {
        console.warn('⚠️ Failed to create AI summary, using truncation fallback');
        return null;
    }
}
// CORE AI FUNCTIONS - Each function is declared ONLY ONCE
export async function getAiSummaryAndGoals(readmeContent) {
    return await handleAICall(async () => {
        const messages = createMessages("You are an expert business analyst. Analyze the provided project information and generate a comprehensive project summary with clear business goals, objectives, and strategic direction.", `Project Information:\n${readmeContent}\n\nProvide a detailed project summary and business goals.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'AI Summary and Goals');
}
export async function getAiUserStories(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with personas and requirements context
        const enhancedContext = contextManager.buildContextForDocument('user-stories', ['personas', 'key-roles', 'summary']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are an expert requirements analyst specializing in user story creation. Generate comprehensive user stories following agile best practices and the 'As a [user type], I want [goal] so that [benefit]' format.", `Based on the comprehensive project context below, generate detailed user stories with acceptance criteria:

Project Context:
${fullContext}

Generate user stories that include:
- Clear user personas and roles
- Well-defined goals and benefits
- Comprehensive acceptance criteria
- Priority levels and story points estimates
- Dependencies between stories
- Edge cases and error scenarios

Follow agile best practices and ensure stories are testable and valuable.`);
        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'User Stories Generation', 'user-stories');
}
export async function getAiUserPersonas(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with user and project context
        const enhancedContext = contextManager.buildContextForDocument('user-personas', ['summary', 'project-charter', 'key-roles']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a UX research expert specializing in user persona development. Create detailed, research-based user personas that represent the target user base.", `Based on the comprehensive project context below, create detailed user personas:

Project Context:
${fullContext}

Create 3-5 detailed user personas that include:
- Demographics and background information
- Goals, needs, and motivations
- Pain points and challenges
- Technology proficiency and preferences
- Behavioral patterns and usage scenarios
- Decision-making processes and influences
- Communication preferences and channels
- Success criteria and value expectations
- Accessibility needs and considerations
- Context of use and environmental factors

For each persona, provide:
- A realistic name and representative photo description
- Detailed narrative and user journey
- Specific quotes and testimonials
- Key metrics and measurement criteria
- Design and development implications

Focus on actionable insights that drive design and development decisions.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'User Personas Generation', 'user-personas');
}
export async function getAiKeyRolesAndNeeds(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with stakeholder and requirements context
        const enhancedContext = contextManager.buildContextForDocument('key-roles-and-needs', ['summary', 'project-charter', 'stakeholder-register', 'user-stories']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a business process analyst and stakeholder management expert. Identify key user roles and their specific needs, requirements, and business processes.", `Based on the comprehensive project context below, identify and describe key roles and their needs:

Project Context:
${fullContext}

Identify key roles and needs that include:
- Primary user roles and their responsibilities
- Secondary stakeholder roles and interests
- Administrative and support roles
- Technical and operational roles
- Decision-making roles and authority levels
- External partner and vendor roles
- Regulatory and compliance roles
- End-user and customer roles

For each role, provide:
- Detailed role description and responsibilities
- Specific needs and requirements
- Business processes and workflows
- Success criteria and performance metrics
- Pain points and challenges
- Technology and tool requirements
- Communication and collaboration needs
- Training and support requirements

Focus on actionable insights that inform system design and implementation.`);
        const response = await makeAICall(messages, 2000);
        return extractContent(response);
    }, 'Key Roles and Needs Analysis', 'key-roles-and-needs');
}
export async function getAiProjectCharter(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for better document quality
        const enhancedContext = contextManager.buildContextForDocument('project-charter', ['summary', 'stakeholder-register']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Create a comprehensive Project Charter following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Project Charter with all required PMBOK elements:

Project Context:
${fullContext}

Create a Project Charter that includes:
- Project Purpose and Business Justification
- Measurable Project Objectives
- High-Level Requirements
- High-Level Assumptions and Constraints
- High-Level Project Description and Product Characteristics
- Project Approval Requirements
- Assigned Project Manager
- Name and Authority of Project Sponsor
- Key Stakeholders
- Assumptions and Constraints
- Risks and Mitigation Strategies

Follow PMBOK standards and ensure professional quality.`);
        const response = await makeAICall(messages, 1600);
        return extractContent(response);
    }, 'Project Charter Generation', 'project-charter');
}
export async function getAiScopeManagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with related documents
        const enhancedContext = contextManager.buildContextForDocument('scope-management-plan', ['project-charter', 'user-stories', 'wbs']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in scope management. Create a comprehensive Scope Management Plan following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Scope Management Plan:

Project Context:
${fullContext}

Create a Scope Management Plan that includes:
- How project scope will be defined, validated, and controlled
- Preparation of detailed project scope statement
- Creation and definition of the WBS
- How WBS dictionary will be maintained and approved
- Process for formal verification and acceptance of deliverables
- Process for controlling scope changes

Follow PMBOK standards and ensure alignment with project charter.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Scope Management Plan Generation', 'scope-management-plan');
}
export async function getAiRiskManagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with technical and project context
        const enhancedContext = contextManager.buildContextForDocument('risk-management-plan', ['project-charter', 'tech-stack', 'scope-plan']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in risk management. Create a comprehensive Risk Management Plan following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Risk Management Plan:

Project Context:
${fullContext}

Create a Risk Management Plan that includes:
- Risk management methodology and approach
- Risk categories and risk breakdown structure (RBS)
- Risk probability and impact assessment methods
- Risk response strategies and contingency planning
- Risk monitoring and control procedures
- Risk register template and documentation requirements
- Roles and responsibilities for risk management
- Budget and timing for risk management activities

Follow PMBOK standards and focus on project-specific risks.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Risk Management Plan Generation', 'risk-management-plan');
}
export async function getAiCostManagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with cost and resource context
        const enhancedContext = contextManager.buildContextForDocument('cost-management-plan', ['project-charter', 'resource-estimates', 'wbs', 'activity-list']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in cost management. Create a comprehensive Cost Management Plan following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Cost Management Plan:

Project Context:
${fullContext}

Create a Cost Management Plan that includes:
- Cost estimation methodology and tools
- Cost budgeting and baseline development
- Cost control procedures and variance analysis
- Earned value management (EVM) implementation
- Cost reporting and performance measurement
- Change control procedures for cost baseline
- Funding requirements and cash flow analysis
- Cost contingency and risk management
- Procurement cost management procedures
- Cost optimization strategies and value engineering

Follow PMBOK standards and ensure comprehensive cost management coverage.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Cost Management Plan Generation', 'cost-management-plan');
}
export async function getAiQualityManagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with quality and requirements context
        const enhancedContext = contextManager.buildContextForDocument('quality-management-plan', ['project-charter', 'user-stories', 'acceptance-criteria', 'tech-stack']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in quality management. Create a comprehensive Quality Management Plan following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Quality Management Plan:

Project Context:
${fullContext}

Create a Quality Management Plan that includes:
- Quality objectives, standards, and metrics
- Quality assurance procedures and activities
- Quality control processes and checkpoints
- Testing strategies and acceptance criteria
- Quality improvement processes and continuous improvement
- Quality roles and responsibilities
- Quality tools and techniques to be used
- Quality documentation and reporting requirements
- Quality risk management and mitigation strategies
- Customer satisfaction and stakeholder quality requirements

Follow PMBOK standards and ensure comprehensive quality management coverage.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Quality Management Plan Generation', 'quality-management-plan');
}
export async function getAiResourceManagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with resource and organizational context
        const enhancedContext = contextManager.buildContextForDocument('resource-management-plan', ['project-charter', 'resource-estimates', 'activity-list', 'stakeholder-register']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in resource management. Create a comprehensive Resource Management Plan following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Resource Management Plan:

Project Context:
${fullContext}

Create a Resource Management Plan that includes:
- Resource identification and categorization
- Human resource acquisition and team development
- Resource scheduling and allocation strategies
- Team performance management and development
- Resource release and transition planning
- Training and skill development requirements
- Team building and motivation strategies
- Resource conflict resolution procedures
- Performance measurement and feedback systems
- Resource optimization and efficiency improvements

Follow PMBOK standards and ensure comprehensive resource management coverage.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Resource Management Plan Generation', 'resource-management-plan');
}
export async function getAiCommunicationManagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with stakeholder and communication context
        const enhancedContext = contextManager.buildContextForDocument('communication-management-plan', ['stakeholder-register', 'project-charter', 'stakeholder-engagement']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in communication management. Create a comprehensive Communication Management Plan following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Communication Management Plan:

Project Context:
${fullContext}

Create a Communication Management Plan that includes:
- Stakeholder communication requirements and preferences
- Communication methods, formats, and frequency
- Information distribution and access procedures
- Escalation procedures and communication protocols
- Meeting management and reporting structures
- Communication technology and tools to be used
- Document management and version control
- Performance reporting and status communication
- Crisis communication and risk communication procedures
- Communication performance measurement and feedback

Follow PMBOK standards and ensure comprehensive communication management coverage.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Communication Management Plan Generation', 'communication-management-plan');
}
export async function getAiProcurementManagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with procurement and resource context
        const enhancedContext = contextManager.buildContextForDocument('procurement-management-plan', ['project-charter', 'resource-estimates', 'tech-stack', 'cost-management']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in procurement management. Create a comprehensive Procurement Management Plan following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Procurement Management Plan:

Project Context:
${fullContext}

Create a Procurement Management Plan that includes:
- Make-or-buy analysis and procurement decisions
- Procurement strategy and approach
- Contract types and procurement methods
- Vendor selection criteria and evaluation processes
- Contract management and administration procedures
- Risk management for procurement activities
- Procurement performance measurement and control
- Procurement documentation and record keeping
- Vendor relationship management strategies
- Contract closure and lessons learned processes

Follow PMBOK standards and ensure comprehensive procurement management coverage.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Procurement Management Plan Generation', 'procurement-management-plan');
}
export async function getAiStakeholderEngagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with stakeholder and communication context
        const enhancedContext = contextManager.buildContextForDocument('stakeholder-engagement-plan', ['stakeholder-register', 'communication-management', 'project-charter']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in stakeholder management. Create a comprehensive Stakeholder Engagement Plan following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Stakeholder Engagement Plan:

Project Context:
${fullContext}

Create a Stakeholder Engagement Plan that includes:
- Stakeholder engagement strategies by stakeholder group
- Engagement level targets (Unaware, Resistant, Neutral, Supportive, Leading)
- Communication and engagement methods for each stakeholder
- Timing and frequency of stakeholder interactions
- Resource requirements for stakeholder engagement
- Stakeholder feedback and input collection methods
- Conflict resolution and negotiation strategies
- Stakeholder satisfaction measurement and monitoring
- Change management and stakeholder adaptation strategies
- Escalation procedures for stakeholder issues

Follow PMBOK standards and ensure comprehensive stakeholder engagement coverage.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Stakeholder Engagement Plan Generation', 'stakeholder-engagement-plan');
}
export async function getAiWbs(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with scope and planning context
        const enhancedContext = contextManager.buildContextForDocument('wbs', ['scope-management', 'activity-list', 'resource-estimates']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in work breakdown structures. Create a comprehensive Work Breakdown Structure (WBS) following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed WBS:

Project Context:
${fullContext}

Create a Work Breakdown Structure that includes:
- Hierarchical decomposition of project deliverables and work
- Multiple levels (minimum 3 levels) with logical groupings
- Work packages at the lowest level that are:
  * Manageable in size (8-80 hour rule)
  * Clearly defined and measurable
  * Assignable to a responsible party
  * Independent with minimal overlap
- Clear deliverable-oriented structure
- Proper WBS coding/numbering system
- Integration with project scope and objectives

Follow PMBOK standards and 100% rule (sum of work at lower levels equals 100% of work at higher level).`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'WBS Generation', 'wbs');
}
export async function getAiWbsDictionary(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with WBS and project context
        const enhancedContext = contextManager.buildContextForDocument('wbs-dictionary', ['wbs', 'scope-management', 'project-charter']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in work breakdown structures. Create a comprehensive WBS Dictionary following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed WBS Dictionary:

Project Context:
${fullContext}

Create a WBS Dictionary that includes:
- Detailed descriptions for each WBS element
- Work package descriptions with clear scope boundaries
- Deliverable information and acceptance criteria
- Resource assignments and responsibilities
- Schedule milestones and dependencies
- Quality requirements and success criteria
- Cost estimates and budget allocations
- Risk considerations for each work package

Follow PMBOK standards and ensure comprehensive documentation.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'WBS Dictionary Generation', 'wbs-dictionary');
}
export async function getAiActivityList(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with WBS and planning context
        const enhancedContext = contextManager.buildContextForDocument('activity-list', ['wbs', 'wbs-dictionary', 'scope-management']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in schedule management. Create a comprehensive Activity List following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Activity List:

Project Context:
${fullContext}

Create an Activity List that includes:
- Complete decomposition of work packages into activities
- Clear activity descriptions and identifiers
- Activity attributes including resource requirements
- Predecessor and successor relationships
- Activity duration estimates (preliminary)
- Milestone activities and key deliverables
- Resource requirements and constraints
- Assumptions and constraints for each activity

Follow PMBOK standards and ensure activities are specific, measurable, and actionable.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Activity List Generation', 'activity-list');
}
export async function getAiActivityDurationEstimates(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with activity and resource context
        const enhancedContext = contextManager.buildContextForDocument('activity-duration-estimates', ['activity-list', 'wbs', 'resource-estimates']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in schedule management. Create comprehensive Activity Duration Estimates using three-point estimation and PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create detailed Activity Duration Estimates:

Project Context:
${fullContext}

Create Activity Duration Estimates that include:
- Three-point estimates (Optimistic, Most Likely, Pessimistic) for each activity
- PERT calculations and expected durations
- Confidence levels and probability distributions
- Resource productivity factors and availability
- Historical data considerations and lessons learned
- Risk factors affecting duration estimates
- Assumptions and constraints for each estimate
- Buffer recommendations for critical activities

Use industry best practices and follow PMBOK standards for estimation techniques.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Activity Duration Estimates Generation', 'activity-duration-estimates');
}
export async function getAiActivityResourceEstimates(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with activity and resource context
        const enhancedContext = contextManager.buildContextForDocument('activity-resource-estimates', ['activity-list', 'wbs', 'tech-stack', 'resource-management']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in resource management. Create comprehensive Activity Resource Estimates following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create detailed Activity Resource Estimates:

Project Context:
${fullContext}

Create Activity Resource Estimates that include:
- Human resource requirements by skill level and expertise
- Material and equipment needs for each activity
- Resource calendars and availability constraints
- Resource rates and cost implications
- Resource optimization strategies and alternatives
- Team structure and organizational requirements
- Training and skill development needs
- Vendor and contractor requirements
- Resource risk factors and mitigation strategies

Follow PMBOK standards and industry best practices for resource estimation.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Activity Resource Estimates Generation', 'activity-resource-estimates');
}
export async function getAiScheduleNetworkDiagram(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with scheduling context
        const enhancedContext = contextManager.buildContextForDocument('schedule-network-diagram', ['activity-list', 'duration-estimates', 'wbs']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in schedule management. Create a comprehensive Schedule Network Diagram following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Schedule Network Diagram:

Project Context:
${fullContext}

Create a Schedule Network Diagram that includes:
- Activity-on-Node (AON) network diagram using Mermaid syntax
- Logical relationships between activities (FS, SS, FF, SF)
- Critical path identification and analysis
- Lead and lag times where applicable
- Milestone markers and key deliverables
- Resource constraints and dependencies
- External dependencies and interfaces
- Risk factors affecting schedule relationships
- Alternative paths and contingency options

Use Mermaid flowchart syntax and follow PMBOK standards for network diagramming.

Example Mermaid format:
\`\`\`mermaid
flowchart TD
    A[Activity A] --> B[Activity B]
    A --> C[Activity C]
    B --> D[Activity D]
    C --> D
    D --> E[Activity E]
\`\`\``);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Schedule Network Diagram Generation', 'schedule-network-diagram');
}
export async function getAiMilestoneList(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with schedule and project context
        const enhancedContext = contextManager.buildContextForDocument('milestone-list', ['activity-list', 'wbs', 'project-charter', 'scope-management']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in schedule management. Create a comprehensive Milestone List following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Milestone List:

Project Context:
${fullContext}

Create a Milestone List that includes:
- Major project deliverables and completion milestones
- Phase completion and gate review milestones
- External dependencies and vendor milestones
- Regulatory approval and compliance milestones
- Customer review and acceptance milestones
- Risk mitigation and contingency milestones
- Resource allocation and team formation milestones
- Technology implementation and testing milestones
- Communication and stakeholder engagement milestones

For each milestone include:
- Clear description and success criteria
- Target completion date and dependencies
- Responsible parties and stakeholders
- Risk factors and mitigation strategies
- Impact on overall project timeline

Follow PMBOK standards and ensure milestones are specific, measurable, and achievable.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Milestone List Generation', 'milestone-list');
}
export async function getAiDevelopScheduleInput(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with comprehensive scheduling context
        const enhancedContext = contextManager.buildContextForDocument('schedule-development-input', ['activity-list', 'duration-estimates', 'resource-estimates', 'milestone-list', 'network-diagram']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in schedule development. Create comprehensive Schedule Development Input following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create detailed Schedule Development Input:

Project Context:
${fullContext}

Create Schedule Development Input that includes:
- Complete activity list with detailed descriptions
- Activity duration estimates with confidence levels
- Activity resource requirements and assignments
- Activity sequence and logical relationships
- Network diagram logic and dependencies
- Milestone list with target dates
- Resource calendars and availability constraints
- Organizational process assets and historical data
- Enterprise environmental factors affecting scheduling
- Assumptions and constraints documentation
- Risk factors impacting schedule development
- Schedule baseline development methodology
- Performance measurement criteria
- Schedule change control procedures

Follow PMBOK standards and provide comprehensive input for schedule creation and management.`);
        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Schedule Development Input Generation', 'schedule-development-input');
}
export async function getAiStakeholderRegister(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with project and stakeholder context
        const enhancedContext = contextManager.buildContextForDocument('stakeholder-register', ['project-charter', 'personas', 'key-roles']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in stakeholder management. Create a comprehensive Stakeholder Register following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Stakeholder Register:

Project Context:
${fullContext}

Create a Stakeholder Register that includes:
- Complete list of all project stakeholders
- Stakeholder identification information (name, organization, role)
- Stakeholder classification (internal/external, supporter/neutral/resistor)
- Stakeholder assessment (power, interest, influence, impact)
- Requirements and expectations by stakeholder
- Major stakeholder engagement strategies
- Communication preferences and requirements

Follow PMBOK standards and ensure comprehensive coverage.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Stakeholder Register Generation', 'stakeholder-register');
}
export async function getAiDataModelSuggestions(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with technical and requirements context
        const enhancedContext = contextManager.buildContextForDocument('data-model-suggestions', ['tech-stack', 'user-stories', 'compliance', 'project-charter']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a database architect and data modeling expert. Analyze the project context and suggest appropriate data models and database design patterns.", `Based on the comprehensive project context below, provide detailed data model suggestions:

Project Context:
${fullContext}

Provide data model suggestions that include:
- Logical data model design and entity relationships
- Physical database design recommendations
- Data normalization and optimization strategies
- Database technology selection and rationale
- Data security and privacy considerations
- Scalability and performance optimization
- Data integration and migration strategies
- Backup and disaster recovery planning
- Data governance and quality management
- API design for data access and manipulation

Focus on modern database design patterns and best practices.`);
        const response = await makeAICall(messages, 2000);
        return extractContent(response);
    }, 'Data Model Suggestions Generation', 'data-model-suggestions');
}
export async function getAiTechStackAnalysis(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with technical and project context
        const enhancedContext = contextManager.buildContextForDocument('tech-stack-analysis', ['data-model', 'user-stories', 'compliance', 'ui-ux', 'project-charter']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a technical architect and technology expert. Analyze the project requirements and provide comprehensive technology stack recommendations.", `Based on the comprehensive project context below, provide detailed technology stack analysis:

Project Context:
${fullContext}

Provide technology stack analysis that includes:
- Frontend technology recommendations with justifications
- Backend framework and runtime environment suggestions
- Database technology selection and optimization
- Cloud platform and deployment strategy recommendations
- Security framework and authentication/authorization solutions
- Monitoring, logging, and observability tools
- Development tools, testing frameworks, and CI/CD pipeline
- Third-party services and API integration recommendations
- Performance optimization and scalability considerations
- Cost analysis and licensing considerations

Focus on modern, industry-standard technologies and best practices.`);
        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Tech Stack Analysis Generation', 'tech-stack-analysis');
}
export async function getAiRiskAnalysis(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with risk and project context
        const enhancedContext = contextManager.buildContextForDocument('risk-analysis', ['project-charter', 'tech-stack', 'scope-management', 'stakeholder-register']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a risk management expert and project risk analyst. Analyze the project context and identify comprehensive risk factors with mitigation strategies.", `Based on the comprehensive project context below, provide detailed risk analysis:

Project Context:
${fullContext}

Provide risk analysis that includes:
- Technical risks and technology-related challenges
- Project management and execution risks
- Resource and staffing risks
- External dependencies and third-party risks
- Security and compliance risks
- Market and business environment risks
- Timeline and schedule risks
- Budget and cost overrun risks
- Quality and performance risks
- Stakeholder and communication risks

For each risk category, provide:
- Risk identification and description
- Probability and impact assessment
- Risk mitigation strategies and contingency plans
- Risk monitoring and early warning indicators
- Risk ownership and responsibility assignments

Focus on actionable risk management recommendations.`);
        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Risk Analysis Generation', 'risk-analysis');
}
export async function getAiAcceptanceCriteria(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with quality and requirements context
        const enhancedContext = contextManager.buildContextForDocument('acceptance-criteria', ['user-stories', 'quality-management', 'compliance', 'project-charter']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a quality assurance expert and business analyst. Create comprehensive acceptance criteria based on user stories and project requirements.", `Based on the comprehensive project context below, create detailed acceptance criteria:

Project Context:
${fullContext}

Create acceptance criteria that include:
- Functional acceptance criteria for each user story
- Non-functional requirements and performance criteria
- User interface and user experience criteria
- Security and compliance acceptance criteria
- Integration and compatibility criteria
- Data quality and validation criteria
- Error handling and edge case criteria
- Accessibility and usability criteria
- Performance and scalability criteria
- Documentation and training criteria

For each criterion, provide:
- Clear, testable statements using Given-When-Then format
- Measurable success metrics and benchmarks
- Test scenarios and validation methods
- Dependencies and prerequisites
- Risk factors and mitigation strategies

Focus on comprehensive, testable, and measurable criteria.`);
        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Acceptance Criteria Generation', 'acceptance-criteria');
}
export async function getAiComplianceConsiderations(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with compliance and project context
        const enhancedContext = contextManager.buildContextForDocument('compliance-considerations', ['project-charter', 'tech-stack', 'data-model', 'stakeholder-register']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a compliance expert and regulatory specialist. Analyze the project context and identify comprehensive compliance requirements and considerations.", `Based on the comprehensive project context below, provide detailed compliance analysis:

Project Context:
${fullContext}

Provide compliance considerations that include:
- Data privacy and protection regulations (GDPR, CCPA, etc.)
- Industry-specific compliance requirements
- Security standards and frameworks (ISO 27001, SOC 2, etc.)
- Accessibility compliance (WCAG, ADA, Section 508)
- Financial and regulatory compliance requirements
- International standards and cross-border considerations
- Audit and reporting requirements
- Documentation and record-keeping obligations
- Third-party and vendor compliance requirements
- Ongoing compliance monitoring and maintenance

For each compliance area, provide:
- Specific regulatory requirements and standards
- Implementation strategies and best practices
- Risk assessment and mitigation approaches
- Documentation and evidence requirements
- Monitoring and audit procedures

Focus on actionable compliance guidance and risk mitigation.`);
        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Compliance Considerations Generation', 'compliance-considerations');
}
export async function getAiUiUxConsiderations(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with UX and requirements context
        const enhancedContext = contextManager.buildContextForDocument('ui-ux-considerations', ['user-stories', 'personas', 'tech-stack', 'acceptance-criteria']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a UX/UI design expert and user experience specialist. Analyze the project context and provide comprehensive user experience and interface design recommendations.", `Based on the comprehensive project context below, provide detailed UI/UX considerations:

Project Context:
${fullContext}

Provide UI/UX considerations that include:
- User experience strategy and design principles
- Information architecture and navigation design
- User interface design patterns and components
- Responsive design and multi-device considerations
- Accessibility and inclusive design requirements
- User journey mapping and interaction design
- Usability testing and user research recommendations
- Performance optimization for user experience
- Visual design and branding considerations
- Content strategy and information presentation
- Error handling and user feedback mechanisms
- Mobile-first and progressive enhancement strategies

For each UX area, provide:
- Design principles and best practices
- Specific recommendations and guidelines
- Tools and methodologies for implementation
- Success metrics and measurement strategies
- Risk factors and mitigation approaches

Focus on user-centered design and modern UX best practices.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'UI/UX Considerations Generation', 'ui-ux-considerations');
}
// Helper to enforce context and token limits for gpt-4.1 models
function enforceGpt41TokenLimit(messages, maxTokens) {
    const model = getModel();
    if (model && model.startsWith('gpt-4.1')) {
        // Estimate total tokens in context (very rough: 1 token ≈ 4 chars)
        const totalContent = messages.map(m => m.content).join(' ');
        const estimatedTokens = Math.ceil(totalContent.length / 4);
        let newMessages = messages;
        let newMaxTokens = Math.min(maxTokens, 8000); // Up to 8k tokens for core
        if (estimatedTokens > 8000) {
            // Truncate user/system content to fit 8000 tokens
            let allowedChars = 8000 * 4;
            let runningChars = 0;
            newMessages = [];
            for (const msg of messages) {
                if (runningChars >= allowedChars)
                    break;
                let content = msg.content;
                if (runningChars + content.length > allowedChars) {
                    content = content.slice(0, allowedChars - runningChars);
                }
                newMessages.push({ ...msg, content });
                runningChars += content.length;
            }
            console.warn('⚠️ Context truncated to fit 8000 token limit for gpt-4.1 model.');
        }
        return { messages: newMessages, maxTokens: newMaxTokens };
    }
    return { messages, maxTokens };
}
// Enhanced Context Manager with AI Integration and Model-Aware Token Management
class EnhancedContextManager {
    maxContextTokens;
    coreContext = '';
    enrichedContext = new Map();
    contextCache = new Map();
    documentRelationships = new Map();
    modelTokenLimits = new Map();
    constructor(maxTokens = 4000) {
        this.maxContextTokens = maxTokens;
        this.initializeDocumentRelationships();
        this.initializeModelTokenLimits();
        // Auto-adjust based on current AI provider and model
        this.autoAdjustTokenLimits();
    }
    initializeModelTokenLimits() {
        // Define token limits for different models (input context limits)
        this.modelTokenLimits.set('gemini-1.5-flash', 1048576); // 1M tokens
        this.modelTokenLimits.set('gemini-1.5-pro', 2097152); // 2M tokens
        this.modelTokenLimits.set('gemini-2.0-flash-exp', 1048576); // 1M tokens
        this.modelTokenLimits.set('gpt-4', 128000); // 128k tokens
        this.modelTokenLimits.set('gpt-4-turbo', 128000); // 128k tokens
        this.modelTokenLimits.set('gpt-4o', 128000); // 128k tokens
        this.modelTokenLimits.set('gpt-4o-mini', 128000); // 128k tokens
        this.modelTokenLimits.set('gpt-4.1-mini', 8000); // 8k tokens
        this.modelTokenLimits.set('gpt-4.1', 8000); // 8k tokens
        this.modelTokenLimits.set('gpt-3.5-turbo', 16385); // 16k tokens
        this.modelTokenLimits.set('claude-3-opus', 200000); // 200k tokens
        this.modelTokenLimits.set('claude-3-sonnet', 200000); // 200k tokens
        this.modelTokenLimits.set('claude-3-haiku', 200000); // 200k tokens
        this.modelTokenLimits.set('llama3.1', 131072); // 128k tokens (Ollama)
        this.modelTokenLimits.set('llama3.2', 131072); // 128k tokens (Ollama)
        this.modelTokenLimits.set('qwen2.5', 131072); // 128k tokens (Ollama)
        this.modelTokenLimits.set('phi3', 131072); // 128k tokens (Ollama)
    }
    autoAdjustTokenLimits() {
        try {
            const currentModel = getModel().toLowerCase();
            console.log(`🔍 Detected model: ${currentModel}`);
            // Find the best match for the current model
            let modelLimit = 4000; // Default fallback
            for (const [modelName, limit] of this.modelTokenLimits) {
                if (currentModel.includes(modelName.toLowerCase())) {
                    modelLimit = limit;
                    break;
                }
            }
            // Reserve 20% for response tokens and system prompts
            const contextLimit = Math.floor(modelLimit * 0.7);
            // Enforce strict context for gpt-4.1 and gpt-4.1-mini
            if (currentModel.includes('gpt-4.1')) {
                this.maxContextTokens = modelLimit; // 8k or 4k as defined
                console.log(`⚠️ Enforcing strict context limit for ${currentModel}: ${modelLimit} tokens`);
            }
            else if (contextLimit > this.maxContextTokens) {
                this.maxContextTokens = contextLimit;
                console.log(`🚀 Auto-adjusted context limit to ${contextLimit.toLocaleString()} tokens for model: ${currentModel}`);
                // For very large models (>100k tokens), we can include full context
                if (contextLimit > 100000) {
                    console.log(`📖 Large context model detected - enabling full context mode for comprehensive documentation`);
                }
            }
        }
        catch (error) {
            console.warn('⚠️ Could not auto-adjust token limits:', error);
        }
    }
    // Method to check if current model supports large context
    supportsLargeContext() {
        return this.maxContextTokens > 50000; // Consider >50k tokens as large context
    }
    // Method to get effective token limit for different operations
    getEffectiveTokenLimit(operation) {
        const baseLimit = this.maxContextTokens;
        switch (operation) {
            case 'core':
                return Math.floor(baseLimit * 0.3); // 30% for core context
            case 'enriched':
                return Math.floor(baseLimit * 0.6); // 60% for enriched context
            case 'full':
                return Math.floor(baseLimit * 0.9); // 90% for full context
            default:
                return baseLimit;
        }
    }
    initializeDocumentRelationships() {
        // Define relationships between document types for better context selection
        this.documentRelationships.set('user-stories', ['personas', 'summary', 'key-roles']);
        this.documentRelationships.set('project-charter', ['summary', 'scope-plan', 'stakeholder-register']);
        this.documentRelationships.set('risk-management-plan', ['project-charter', 'scope-plan', 'tech-stack', 'quality-plan']);
        this.documentRelationships.set('quality-management-plan', ['requirements', 'tech-stack', 'user-stories', 'acceptance-criteria']);
        this.documentRelationships.set('stakeholder-register', ['project-charter', 'communication-plan', 'stakeholder-analysis']);
        this.documentRelationships.set('scope-management-plan', ['project-charter', 'user-stories', 'wbs', 'requirements']);
        this.documentRelationships.set('wbs', ['scope-management', 'activity-list', 'resource-estimates']);
        this.documentRelationships.set('wbs-dictionary', ['wbs', 'scope-management', 'project-charter']);
        this.documentRelationships.set('activity-list', ['wbs', 'wbs-dictionary', 'scope-management']);
        this.documentRelationships.set('activity-duration-estimates', ['activity-list', 'wbs', 'resource-estimates']);
        this.documentRelationships.set('activity-resource-estimates', ['activity-list', 'wbs', 'tech-stack', 'resource-management']);
        this.documentRelationships.set('schedule-network-diagram', ['activity-list', 'duration-estimates', 'wbs']);
        this.documentRelationships.set('milestone-list', ['activity-list', 'wbs', 'project-charter', 'scope-management']);
        this.documentRelationships.set('schedule-development-input', ['activity-list', 'duration-estimates', 'resource-estimates', 'milestone-list', 'network-diagram']);
        this.documentRelationships.set('communication-plan', ['stakeholder-register', 'stakeholder-analysis', 'project-charter']);
        this.documentRelationships.set('communication-management-plan', ['stakeholder-register', 'project-charter', 'stakeholder-engagement']);
        this.documentRelationships.set('cost-management-plan', ['project-charter', 'resource-estimates', 'wbs', 'activity-list']);
        this.documentRelationships.set('resource-management-plan', ['project-charter', 'resource-estimates', 'activity-list', 'stakeholder-register']);
        this.documentRelationships.set('procurement-management-plan', ['project-charter', 'resource-estimates', 'tech-stack', 'cost-management']);
        this.documentRelationships.set('stakeholder-engagement-plan', ['stakeholder-register', 'communication-management', 'project-charter']);
        this.documentRelationships.set('tech-stack-analysis', ['data-model', 'user-stories', 'compliance', 'ui-ux', 'project-charter']);
        this.documentRelationships.set('data-model-suggestions', ['tech-stack', 'user-stories', 'compliance', 'project-charter']);
        this.documentRelationships.set('risk-analysis', ['project-charter', 'tech-stack', 'scope-management', 'stakeholder-register']);
        this.documentRelationships.set('acceptance-criteria', ['user-stories', 'quality-management', 'compliance', 'project-charter']);
        this.documentRelationships.set('compliance-considerations', ['project-charter', 'tech-stack', 'data-model', 'stakeholder-register']);
        this.documentRelationships.set('ui-ux-considerations', ['user-stories', 'personas', 'tech-stack', 'acceptance-criteria']);
        this.documentRelationships.set('user-personas', ['summary', 'project-charter', 'key-roles']);
        this.documentRelationships.set('key-roles-and-needs', ['summary', 'project-charter', 'stakeholder-register', 'user-stories']);
    }
    estimateTokens(text) {
        // More accurate token estimation (approximate)
        return Math.ceil(text.length / 3.5); // Adjusted for better accuracy
    }
    async createCoreContext(readmeContent) {
        const cacheKey = `core_${this.hashString(readmeContent)}`;
        if (this.contextCache.has(cacheKey)) {
            this.coreContext = this.contextCache.get(cacheKey);
            return this.coreContext;
        }
        const estimatedTokens = this.estimateTokens(readmeContent);
        const coreTokenLimit = this.getEffectiveTokenLimit('core');
        // For large context models, be more generous with core context
        if (this.supportsLargeContext()) {
            console.log(`📖 Large context model: Using generous core context (${estimatedTokens.toLocaleString()} tokens)`);
            // For very large models, use full README if reasonable
            if (estimatedTokens <= coreTokenLimit) {
                this.coreContext = readmeContent;
            }
            else {
                // Use AI summarization but with more generous token allowance
                const targetTokens = Math.min(coreTokenLimit, 8000); // Up to 8k tokens for core
                const summary = await createAISummary(readmeContent, targetTokens);
                this.coreContext = summary || readmeContent.substring(0, targetTokens * 3.5);
            }
        }
        else {
            // Original logic for smaller models
            if (estimatedTokens > 1200) {
                const summary = await createAISummary(readmeContent, 1000);
                this.coreContext = summary || readmeContent.substring(0, 4000);
            }
            else {
                this.coreContext = readmeContent;
            }
        }
        this.contextCache.set(cacheKey, this.coreContext);
        console.log(`✅ Core context created: ${this.estimateTokens(this.coreContext).toLocaleString()} tokens`);
        return this.coreContext;
    }
    buildContextForDocument(documentType, additionalContext) {
        const cacheKey = `${documentType}_${this.hashString(this.coreContext)}_${additionalContext?.join('|') || ''}`;
        if (this.contextCache.has(cacheKey)) {
            return this.contextCache.get(cacheKey);
        }
        let context = this.coreContext;
        const isLargeContext = this.supportsLargeContext();
        let remainingTokens = this.getEffectiveTokenLimit('enriched') - this.estimateTokens(context);
        console.log(`🔧 Building context for ${documentType} (${isLargeContext ? 'large' : 'standard'} context model)`);
        console.log(`📊 Available tokens: ${remainingTokens.toLocaleString()}`);
        // Get relevant context based on document relationships
        const relevantContext = this.getRelevantContext(documentType);
        // Add additional context if provided
        if (additionalContext) {
            relevantContext.push(...additionalContext);
        }
        // For large context models, implement comprehensive context strategy
        if (isLargeContext) {
            // Phase 1: Include all directly related context
            const directlyRelated = relevantContext.filter((key) => this.enrichedContext.has(key));
            const sortedDirect = directlyRelated.sort((a, b) => {
                const aRelations = this.documentRelationships.get(a)?.length || 0;
                const bRelations = this.documentRelationships.get(b)?.length || 0;
                return bRelations - aRelations;
            });
            for (const contextKey of sortedDirect) {
                const contextPart = this.enrichedContext.get(contextKey);
                const tokens = this.estimateTokens(contextPart);
                if (tokens <= remainingTokens) {
                    context += `\n\n## Related Context: ${contextKey}\n${contextPart}`;
                    remainingTokens -= tokens;
                    console.log(`📄 Added full context for ${contextKey}: ${tokens.toLocaleString()} tokens`);
                }
            }
            // Phase 2: For very large models (>200k tokens), include all available context
            if (this.maxContextTokens > 200000 && remainingTokens > 50000) {
                console.log(`🌟 Ultra-large context model: Including comprehensive project context`);
                // Add all remaining enriched context for maximum accuracy
                const remainingKeys = Array.from(this.enrichedContext.keys())
                    .filter((key) => !relevantContext.includes(key));
                for (const contextKey of remainingKeys) {
                    const contextPart = this.enrichedContext.get(contextKey);
                    const tokens = this.estimateTokens(contextPart);
                    if (tokens <= remainingTokens) {
                        context += `\n\n## Additional Context: ${contextKey}\n${contextPart}`;
                        remainingTokens -= tokens;
                        console.log(`📚 Added comprehensive context for ${contextKey}: ${tokens.toLocaleString()} tokens`);
                    }
                    else if (remainingTokens > 20000) {
                        // Include partial content for better coverage
                        const maxChars = Math.max((remainingTokens - 10000) * 3, 2000);
                        const truncated = contextPart.substring(0, maxChars) + '\n...\n[Context partially included for token optimization]';
                        context += `\n\n## Additional Context: ${contextKey} (Partial)\n${truncated}`;
                        console.log(`📄 Added partial comprehensive context for ${contextKey}: ~${this.estimateTokens(truncated).toLocaleString()} tokens`);
                        break;
                    }
                }
            }
            else if (remainingTokens > 5000) {
                // Phase 3: For large models (50k-200k), include partial additional context
                console.log(`📖 Large context model: Adding supplementary context`);
                const supplementaryKeys = Array.from(this.enrichedContext.keys())
                    .filter((key) => !relevantContext.includes(key))
                    .slice(0, 3); // Limit to top 3 supplementary contexts
                for (const contextKey of supplementaryKeys) {
                    const contextPart = this.enrichedContext.get(contextKey);
                    const tokens = this.estimateTokens(contextPart);
                    if (tokens <= remainingTokens - 2000) {
                        context += `\n\n## Supplementary Context: ${contextKey}\n${contextPart}`;
                        remainingTokens -= tokens;
                        console.log(`📄 Added supplementary context for ${contextKey}: ${tokens.toLocaleString()} tokens`);
                    }
                    else if (remainingTokens > 3000) {
                        const maxChars = Math.max((remainingTokens - 2000) * 3, 1000);
                        const truncated = contextPart.substring(0, maxChars) + '\n...\n[Supplementary context truncated]';
                        context += `\n\n## Supplementary Context: ${contextKey} (Partial)\n${truncated}`;
                        console.log(`📄 Added partial supplementary context for ${contextKey}: ~${this.estimateTokens(truncated).toLocaleString()} tokens`);
                        break;
                    }
                }
            }
        }
        else {
            // Original logic for smaller models
            const sortedContext = relevantContext.sort((a, b) => {
                const aRelations = this.documentRelationships.get(a)?.length || 0;
                const bRelations = this.documentRelationships.get(b)?.length || 0;
                return bRelations - aRelations;
            });
            for (const contextKey of sortedContext) {
                const contextPart = this.enrichedContext.get(contextKey);
                if (!contextPart)
                    continue;
                const tokens = this.estimateTokens(contextPart);
                if (tokens <= remainingTokens) {
                    context += `\n\n## Related Context: ${contextKey}\n${contextPart}`;
                    remainingTokens -= tokens;
                }
                else {
                    const maxChars = Math.max(remainingTokens * 3 - 100, 200);
                    if (maxChars > 200) {
                        const truncated = contextPart.substring(0, maxChars) + '...\n[Content truncated due to token limits]';
                        context += `\n\n## Related Context: ${contextKey} (Truncated)\n${truncated}`;
                        break;
                    }
                }
            }
        }
        const finalTokens = this.estimateTokens(context);
        console.log(`✅ Final context for ${documentType}: ${finalTokens.toLocaleString()} tokens`);
        this.contextCache.set(cacheKey, context);
        return context;
    }
    // Analyze context coverage for a specific document type
    analyzeDocumentContext(documentType) {
        const context = this.buildContextForDocument(documentType);
        const totalTokens = this.estimateTokens(context);
        const utilizationPercentage = (totalTokens / this.maxContextTokens) * 100;
        const relevantContext = this.getRelevantContext(documentType);
        const includedContexts = relevantContext.filter(key => context.includes(`## Related Context: ${key}`) ||
            context.includes(`## Additional Context: ${key}`) ||
            context.includes(`## Supplementary Context: ${key}`));
        const allAvailableContexts = Array.from(this.enrichedContext.keys());
        const potentialContexts = allAvailableContexts.filter(key => !includedContexts.includes(key) && !relevantContext.includes(key));
        const recommendations = [];
        if (this.supportsLargeContext()) {
            if (utilizationPercentage < 5) {
                recommendations.push("Very low context utilization - consider adding more comprehensive background");
                recommendations.push("Large model can handle much more context for better accuracy");
            }
            if (potentialContexts.length > 0) {
                recommendations.push(`${potentialContexts.length} additional context sources available for inclusion`);
            }
        }
        return {
            totalTokens,
            utilizationPercentage,
            includedContexts,
            potentialContexts,
            recommendations
        };
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }
    getRelevantContext(documentType) {
        const directRelations = this.documentRelationships.get(documentType) || ['summary'];
        // Also include any contexts that reference this document type
        const reverseRelations = [];
        for (const [key, relations] of this.documentRelationships) {
            if (relations.includes(documentType) && !directRelations.includes(key)) {
                reverseRelations.push(key);
            }
        }
        return [...directRelations, ...reverseRelations]
            .map(key => this.enrichedContext.has(key) ? key : null)
            .filter(Boolean);
    }
    addEnrichedContext(key, content) {
        this.enrichedContext.set(key, content);
        // Clear related cache entries
        this.clearRelatedCache(key);
    }
    clearRelatedCache(key) {
        const keysToDelete = [];
        for (const cacheKey of this.contextCache.keys()) {
            if (cacheKey.includes(key)) {
                keysToDelete.push(cacheKey);
            }
        }
        keysToDelete.forEach(k => this.contextCache.delete(k));
    }
    getMetrics() {
        return {
            coreContextTokens: this.estimateTokens(this.coreContext),
            enrichedContextCount: this.enrichedContext.size,
            cacheSize: this.contextCache.size,
            maxTokens: this.maxContextTokens
        };
    }
    getContextUtilizationReport() {
        const isLargeContext = this.supportsLargeContext();
        const coreTokens = this.estimateTokens(this.coreContext);
        const totalEnrichedTokens = Array.from(this.enrichedContext.values())
            .reduce((sum, content) => sum + this.estimateTokens(content), 0);
        const availableTokens = this.getEffectiveTokenLimit('enriched');
        const totalProjectTokens = coreTokens + totalEnrichedTokens;
        const utilizationPercentage = (totalProjectTokens / this.maxContextTokens) * 100;
        let report = `# Context Manager Performance Report\n\n`;
        report += `- **Core Context Tokens**: ${coreTokens.toLocaleString()}\n`;
        report += `- **Enriched Context Items**: ${this.enrichedContext.size}\n`;
        report += `- **Total Enriched Tokens**: ${totalEnrichedTokens.toLocaleString()}\n`;
        report += `- **Cache Size**: ${this.contextCache.size}\n`;
        report += `- **Max Token Limit**: ${this.maxContextTokens.toLocaleString()}\n`;
        report += `- **Available for Context**: ${availableTokens.toLocaleString()}\n`;
        report += `- **Model Type**: ${isLargeContext ? 'Large Context (>50k)' : 'Standard Context'}\n`;
        report += `- **Context Utilization**: ${utilizationPercentage.toFixed(2)}%\n`;
        report += `- **Cache Efficiency**: ${this.contextCache.size > 0 ? 'Active' : 'Inactive'}\n\n`;
        if (isLargeContext) {
            if (utilizationPercentage < 10) {
                report += `## 🔍 Optimization Recommendations\n`;
                report += `- **Ultra-low utilization**: Consider adding more comprehensive project context\n`;
                report += `- **Potential for enhancement**: Include additional documentation sources\n`;
                report += `- **Large model benefit**: This model can handle ${Math.floor(this.maxContextTokens / 1000)}x more context\n\n`;
            }
            else if (utilizationPercentage < 30) {
                report += `## ✅ Good Performance\n`;
                report += `- **Moderate utilization**: Good balance of context and efficiency\n`;
                report += `- **Room for growth**: Can include ${Math.floor((this.maxContextTokens - totalProjectTokens) / 1000)}k more tokens\n\n`;
            }
            else {
                report += `## 🌟 Excellent Utilization\n`;
                report += `- **High utilization**: Making good use of large context capabilities\n`;
                report += `- **Optimal performance**: Well-suited for comprehensive documentation\n\n`;
            }
        }
        return report;
    }
}
// Initialize enhanced context manager
const contextManager = new EnhancedContextManager(4000);
// Add the missing stakeholder analysis function
export async function getAiStakeholderAnalysis(context) {
    return await handleAICall(async () => {
        const messages = createMessages("You are a PMBOK-certified project manager specializing in stakeholder management. Create a comprehensive stakeholder analysis document following PMBOK 7th Edition standards.", `Based on the following project context, generate a comprehensive PMBOK stakeholder analysis document.

Project Context:
${context}

Please create a detailed stakeholder analysis that includes:

## Stakeholder Analysis

### 1. Stakeholder Identification
- List all project stakeholders
- Categorize stakeholders (internal, external, primary, secondary)
- Identify stakeholder groups and individuals

### 2. Stakeholder Assessment
- Power/Interest Grid analysis
- Influence/Impact matrix
- Stakeholder attitudes (supportive, neutral, resistant)
- Current engagement levels

### 3. Stakeholder Prioritization
- High priority stakeholders requiring active management
- Medium priority stakeholders requiring regular monitoring
- Low priority stakeholders requiring minimal effort

### 4. Stakeholder Requirements and Expectations
- Business requirements by stakeholder group
- Success criteria from each stakeholder perspective
- Potential conflicts between stakeholder interests

### 5. Communication Preferences
- Preferred communication methods by stakeholder
- Frequency of communication needed
- Information requirements and reporting needs

### 6. Engagement Strategies
- Specific strategies for high-influence stakeholders
- Approaches for managing resistant stakeholders
- Methods to maintain support from champions

### 7. Risk Assessment
- Stakeholder-related risks
- Mitigation strategies for stakeholder risks
- Contingency plans for stakeholder issues

Follow PMBOK 7th Edition standards and best practices. Be specific and actionable.`);
        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Stakeholder Analysis Generation');
}
// Provider Performance Metrics Reporting Functions
export function getProviderMetrics(provider) {
    if (provider) {
        initializeProviderMetrics(provider);
        return providerMetrics[provider];
    }
    return providerMetrics;
}
export function getProviderPerformanceReport() {
    let report = "# AI Provider Performance Report\n\n";
    if (Object.keys(providerMetrics).length === 0) {
        return report + "No metrics data available yet.\n";
    }
    for (const [provider, metrics] of Object.entries(providerMetrics)) {
        const successRate = metrics.totalCalls > 0 ?
            ((metrics.successfulCalls / metrics.totalCalls) * 100).toFixed(1) : 0;
        report += `## ${provider.toUpperCase()} Provider\n`;
        report += `- **Total Calls**: ${metrics.totalCalls}\n`;
        report += `- **Success Rate**: ${successRate}%\n`;
        report += `- **Average Response Time**: ${metrics.averageResponseTime.toFixed(0)}ms\n`;
        report += `- **Rate Limit Hits**: ${metrics.rateLimitHits}\n`;
        report += `- **Last Used**: ${metrics.lastUsed.toISOString()}\n`;
        if (Object.keys(metrics.errors).length > 0) {
            report += `- **Error Breakdown**:\n`;
            for (const [errorType, count] of Object.entries(metrics.errors)) {
                report += `  - ${errorType}: ${count}\n`;
            }
        }
        report += `\n`;
    }
    return report;
}
export function resetProviderMetrics(provider) {
    if (provider) {
        delete providerMetrics[provider];
    }
    else {
        Object.keys(providerMetrics).forEach(key => delete providerMetrics[key]);
    }
}
export function getContextManagerMetrics() {
    return contextManager.getMetrics();
}
export function getContextManagerReport() {
    return contextManager.getContextUtilizationReport();
}
export function getBasicContextManagerReport() {
    const metrics = contextManager.getMetrics();
    let report = "# Context Manager Performance Report\n\n";
    report += `- **Core Context Tokens**: ${metrics.coreContextTokens}\n`;
    report += `- **Enriched Context Items**: ${metrics.enrichedContextCount}\n`;
    report += `- **Cache Size**: ${metrics.cacheSize}\n`;
    report += `- **Max Token Limit**: ${metrics.maxTokens}\n`;
    report += `- **Cache Efficiency**: ${metrics.cacheSize > 0 ? 'Active' : 'No cache yet'}\n`;
    return report;
}
/**
 * Analyze document context utilization for a specific document type
 * @param documentType - The type of document to analyze (e.g., 'user-stories', 'project-charter')
 */
export function analyzeDocumentContextUtilization(documentType) {
    return contextManager.analyzeDocumentContext(documentType);
}
// Enhanced Context Manager Access Functions
export function getEnhancedContextManager() {
    return contextManager;
}
// Fix: Correct addProjectContext signature to accept (key: string, content: string)
export function addProjectContext(key, content) {
    contextManager.addEnrichedContext(key, content);
}
/**
 * Populate Enhanced Context Manager with comprehensive project analysis results
 * @param analysis - Project analysis containing discovered markdown files
 */
export async function populateEnhancedContextFromAnalysis(analysis) {
    console.log('🧠 Populating Enhanced Context Manager with project analysis...');
    // Initialize core context with README
    if (analysis.readme) {
        await contextManager.createCoreContext(analysis.readme);
    }
    // Add individual markdown files to enriched context
    if (analysis.additionalMarkdownFiles && analysis.additionalMarkdownFiles.length > 0) {
        console.log(`📋 Adding ${analysis.additionalMarkdownFiles.length} discovered files to Enhanced Context Manager`);
        for (const file of analysis.additionalMarkdownFiles) {
            // Create a key based on filename without extension
            const key = file.fileName.replace(/\.md$/i, '').toLowerCase().replace(/[^a-z0-9]/g, '-');
            // Add file content with metadata header
            const enrichedContent = `File: ${file.filePath}
Category: ${file.category}
Relevance Score: ${file.relevanceScore}

${file.content}`;
            addProjectContext(key, enrichedContent);
            console.log(`   • Added ${file.fileName} as '${key}' (${file.category}, score: ${file.relevanceScore})`);
        }
        console.log(`✅ Enhanced Context Manager populated with ${analysis.additionalMarkdownFiles.length} additional sources`);
    }
    else {
        console.log('ℹ️ No additional markdown files found for Enhanced Context Manager');
    }
}
// New AI Functions for Core Values and Project Purpose
export async function getAiCoreValues(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for core values
        const enhancedContext = contextManager.buildContextForDocument('core-values', ['summary', 'project-charter']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager and organizational strategist. Generate a set of core values for a software project management tool, ensuring alignment with PMBOK and industry best practices.", `Based on the comprehensive project context below, generate a clear, actionable, and inspiring set of core values for the Requirements Gathering Agent project.\n\nProject Context:\n${fullContext}\n\nProvide the core values as a markdown list, each with a short description. Focus on values such as standardization, intelligent automation, collaboration, accessibility, integration, compliance, and responsibility.`);
        const response = await makeAICall(messages, 900);
        return extractContent(response);
    }, 'Core Values Generation', 'core-values');
}
export async function getAiProjectPurpose(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for project purpose
        const enhancedContext = contextManager.buildContextForDocument('project-purpose', ['summary', 'project-charter', 'core-values']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager and business analyst. Write a clear and compelling project purpose statement for a software project management documentation tool.", `Based on the comprehensive project context below, generate a concise and inspiring project purpose statement for the Requirements Gathering Agent.\n\nProject Context:\n${fullContext}\n\nThe purpose statement should explain the fundamental reason the project exists, its overarching goal, and the value it delivers to software teams and organizations. Present the purpose in a single paragraph, using professional and motivational language.`);
        const response = await makeAICall(messages, 600);
        return extractContent(response);
    }, 'Project Purpose Generation', 'project-purpose');
}
export async function getAiMissionVisionAndCoreValues(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for mission, vision, and core values
        const enhancedContext = contextManager.buildContextForDocument('mission-vision-core-values', ['summary', 'project-charter']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager and organizational strategist. Generate a Vision Statement, Mission Statement, and a set of Core Values for a software project management tool, ensuring alignment with PMBOK and industry best practices.", `Based on the comprehensive project context below, generate the following for the Requirements Gathering Agent project as markdown sections:\n\nProject Context:\n${fullContext}\n\n1. **Vision Statement**: A clear, inspiring vision for the future impact of the project.\n2. **Mission Statement**: A concise mission describing what the project aims to achieve and how.\n3. **Core Values**: A markdown list of core values, each with a short description. Focus on values such as standardization, intelligent automation, collaboration, accessibility, integration, compliance, and responsibility.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Mission, Vision, and Core Values Generation', 'mission-vision-core-values');
}
export async function getAiProjectManagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with project charter and all major management plans
        const enhancedContext = contextManager.buildContextForDocument('project-management-plan', [
            'project-charter',
            'scope-management-plan',
            'requirements-management-plan',
            'schedule-management-plan',
            'cost-management-plan',
            'quality-management-plan',
            'resource-management-plan',
            'communication-management-plan',
            'risk-management-plan',
            'procurement-management-plan',
            'stakeholder-engagement-plan'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Create a comprehensive Project Management Plan following PMBOK 7th Edition standards, integrating all subsidiary management plans and aligning with the Project Charter.", `Based on the comprehensive project context below, create a detailed Project Management Plan as a markdown document.\n\nProject Context:\n${fullContext}\n\nCreate a Project Management Plan that includes (as sections):\n- Introduction and Purpose\n- Project Objectives and Success Criteria\n- Project Life Cycle and Approach\n- Integration of Subsidiary Management Plans (Scope, Requirements, Schedule, Cost, Quality, Resource, Communication, Risk, Procurement, Stakeholder Engagement)\n- Roles and Responsibilities\n- Change Management and Configuration Control\n- Performance Measurement and Reporting\n- Assumptions and Constraints\n- Approval and Sign-off\n\nFollow PMBOK standards and ensure the plan is actionable, comprehensive, and tailored to the Requirements Gathering Agent project.`);
        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Project Management Plan Generation', 'project-management-plan');
}
export async function getAiDirectAndManageProjectWorkProcess(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with project management plan and project charter
        const enhancedContext = contextManager.buildContextForDocument('direct-and-manage-project-work', [
            'project-management-plan',
            'project-charter',
            'scope-management-plan',
            'schedule-management-plan',
            'cost-management-plan',
            'quality-management-plan',
            'resource-management-plan',
            'communication-management-plan',
            'risk-management-plan',
            'procurement-management-plan',
            'stakeholder-engagement-plan'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Describe the Direct and Manage Project Work process, following PMBOK 7th Edition standards, for a software project.", `Based on the comprehensive project context below, provide a detailed process description for Direct and Manage Project Work as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Integration with other project management processes\n- Best practices and common challenges\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Direct and Manage Project Work Process Generation', 'direct-and-manage-project-work');
}
export async function getAiPerformIntegratedChangeControlProcess(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with project management plan and change-related documents
        const enhancedContext = contextManager.buildContextForDocument('perform-integrated-change-control', [
            'project-management-plan',
            'project-charter',
            'scope-management-plan',
            'schedule-management-plan',
            'cost-management-plan',
            'quality-management-plan',
            'resource-management-plan',
            'communication-management-plan',
            'risk-management-plan',
            'procurement-management-plan',
            'stakeholder-engagement-plan'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Describe the Perform Integrated Change Control process, following PMBOK 7th Edition standards, for a software project.", `Based on the comprehensive project context below, provide a detailed process description for Perform Integrated Change Control as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables (including Change Control Board)\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Change request evaluation and approval workflow\n- Integration with other project management processes\n- Best practices and common challenges\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Perform Integrated Change Control Process Generation', 'perform-integrated-change-control');
}
export async function getAiCloseProjectOrPhaseProcess(context) {
    return await handleAICall(async () => {
        // Use enhanced context management with project management plan and closure-related documents
        const enhancedContext = contextManager.buildContextForDocument('close-project-or-phase', [
            'project-management-plan',
            'project-charter',
            'scope-management-plan',
            'schedule-management-plan',
            'cost-management-plan',
            'quality-management-plan',
            'resource-management-plan',
            'communication-management-plan',
            'risk-management-plan',
            'procurement-management-plan',
            'stakeholder-engagement-plan'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Describe the Close Project or Phase process, following PMBOK 7th Edition standards, for a software project.", `Based on the comprehensive project context below, provide a detailed process description for Close Project or Phase as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables (including final product/service/result transition)\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Documentation and knowledge transfer\n- Lessons learned and project evaluation\n- Integration with other project management processes\n- Best practices and common challenges\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Close Project or Phase Process Generation', 'close-project-or-phase');
}
export async function getAiPlanScopeManagement(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for plan scope management
        const enhancedContext = contextManager.buildContextForDocument('plan-scope-management', ['project-charter', 'user-stories', 'stakeholder-register']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Describe the Plan Scope Management process for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, provide a detailed process description for Plan Scope Management as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Integration with other project management processes\n- Best practices and common challenges\n- Outputs: Scope Management Plan and Requirements Management Plan (as separate documents)\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1000);
        return extractContent(response);
    }, 'Plan Scope Management Process Generation', 'plan-scope-management');
}
export async function getAiRequirementsManagementPlan(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for requirements management plan
        const enhancedContext = contextManager.buildContextForDocument('requirements-management-plan', ['project-charter', 'user-stories', 'stakeholder-register', 'plan-scope-management']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Create a comprehensive Requirements Management Plan for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Requirements Management Plan as a markdown document.\n\nProject Context:\n${fullContext}\n\nCreate a Requirements Management Plan that includes (as sections):\n- Requirements elicitation and analysis methodology\n- Requirements documentation standards\n- Requirements traceability matrix (RTM) approach\n- Change control procedures for requirements\n- Roles and responsibilities\n- Requirements validation and acceptance criteria\n- Integration with scope, schedule, and quality management\n- Tools and techniques for requirements management\n- Best practices and common challenges\n\nFollow PMBOK standards and ensure the plan is actionable, comprehensive, and tailored to the Requirements Gathering Agent project.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Requirements Management Plan Generation', 'requirements-management-plan');
}
export async function getAiCollectRequirementsProcess(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for collect requirements
        const enhancedContext = contextManager.buildContextForDocument('collect-requirements', ['project-charter', 'user-stories', 'stakeholder-register', 'requirements-management-plan']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Describe the Collect Requirements process for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, provide a detailed process description for Collect Requirements as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and techniques for requirements collection (e.g., interviews, workshops, surveys, document analysis, observation, prototyping)\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Integration with other project management processes\n- Best practices and common challenges\n- Deliverables: Requirements documentation and Requirements Traceability Matrix (RTM)\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Collect Requirements Process Generation', 'collect-requirements');
}
export async function getAiRequirementsDocumentation(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for requirements documentation
        const enhancedContext = contextManager.buildContextForDocument('requirements-documentation', ['project-charter', 'user-stories', 'stakeholder-register', 'requirements-management-plan', 'collect-requirements']);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified business analyst. Generate comprehensive Requirements Documentation for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create detailed Requirements Documentation as a markdown document.\n\nProject Context:\n${fullContext}\n\nYour documentation should include (as sections):\n- Introduction and purpose\n- Functional requirements (detailed list)\n- Non-functional requirements (performance, security, usability, etc.)\n- Stakeholder requirements\n- Business requirements\n- Assumptions and constraints\n- Requirements prioritization\n- Requirements traceability (reference to RTM)\n- Approval and sign-off section\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Requirements Documentation Generation', 'requirements-documentation');
}
export async function getAiRequirementsTraceabilityMatrix(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for RTM
        const enhancedContext = contextManager.buildContextForDocument('requirements-traceability-matrix', [
            'requirements-documentation',
            'user-stories',
            'acceptance-criteria',
            'stakeholder-register',
            'requirements-management-plan'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified business analyst. Generate a comprehensive Requirements Traceability Matrix (RTM) for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a Requirements Traceability Matrix (RTM) as a markdown table.\n\nProject Context:\n${fullContext}\n\nThe RTM should include columns for:\n- Requirement ID\n- Requirement Description\n- Source (Stakeholder/User Story)\n- Acceptance Criteria\n- Priority\n- Status\n- Related Deliverables\n- Test Cases/Validation\n\nEnsure the RTM is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Requirements Traceability Matrix Generation', 'requirements-traceability-matrix');
}
export async function getAiDefineScopeProcess(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for Define Scope
        const enhancedContext = contextManager.buildContextForDocument('define-scope', [
            'requirements-documentation',
            'requirements-traceability-matrix',
            'project-charter',
            'user-stories',
            'stakeholder-register',
            'scope-management-plan'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Describe the Define Scope process for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, provide a detailed process description for Define Scope as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables (including detailed project scope statement)\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Integration with other project management processes\n- Best practices and common challenges\n- Output: Detailed Project Scope Statement\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Define Scope Process Generation', 'define-scope');
}
export async function getAiProjectScopeStatement(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for Project Scope Statement
        const enhancedContext = contextManager.buildContextForDocument('project-scope-statement', [
            'define-scope',
            'requirements-documentation',
            'user-stories',
            'stakeholder-register',
            'scope-management-plan'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Generate a comprehensive Project Scope Statement for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Project Scope Statement as a markdown document.\n\nProject Context:\n${fullContext}\n\nYour Project Scope Statement should include (as sections):\n- Product scope description\n- Project deliverables\n- Acceptance criteria\n- Project exclusions\n- Constraints\n- Assumptions\n- Scope boundaries\n- Links to requirements documentation and RTM\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Project Scope Statement Generation', 'project-scope-statement');
}
export async function getAiCreateWbsProcess(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for Create WBS
        const enhancedContext = contextManager.buildContextForDocument('create-wbs', [
            'project-scope-statement',
            'scope-management-plan',
            'requirements-documentation',
            'user-stories',
            'stakeholder-register',
            'wbs-dictionary'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager specializing in work breakdown structures. Describe the Create WBS process for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, provide a detailed process description for Create WBS as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables (including creation of the Work Breakdown Structure and WBS Dictionary)\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Integration with other project management processes\n- Best practices and common challenges\n- Output: Work Breakdown Structure (WBS) and WBS Dictionary\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Create WBS Process Generation', 'create-wbs');
}
export async function getAiScopeBaseline(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for Scope Baseline
        const enhancedContext = contextManager.buildContextForDocument('scope-baseline', [
            'project-scope-statement',
            'wbs',
            'wbs-dictionary',
            'scope-management-plan',
            'define-scope',
            'requirements-documentation',
            'requirements-traceability-matrix'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Generate a comprehensive Scope Baseline for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a Scope Baseline as a markdown document.\n\nProject Context:\n${fullContext}\n\nYour Scope Baseline should include (as sections):\n- Overview and purpose of the scope baseline\n- Reference to the approved Project Scope Statement\n- Reference to the approved WBS (Work Breakdown Structure)\n- Reference to the approved WBS Dictionary\n- How these components are integrated and controlled\n- Guidance for scope validation and change control\n- Versioning and approval information\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Scope Baseline Generation', 'scope-baseline');
}
export async function getAiValidateScopeProcess(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for Validate Scope
        const enhancedContext = contextManager.buildContextForDocument('validate-scope', [
            'scope-management-plan',
            'requirements-documentation',
            'requirements-traceability-matrix',
            'project-scope-statement',
            'scope-baseline',
            'wbs',
            'wbs-dictionary'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Describe the Validate Scope process for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, provide a detailed process description for Validate Scope as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables (including formal acceptance of deliverables)\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Integration with other project management processes (e.g., Control Quality, Control Scope)\n- Best practices and common challenges\n- Output: Accepted Deliverables and Change Requests\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1000);
        return extractContent(response);
    }, 'Validate Scope Process Generation', 'validate-scope');
}
export async function getAiControlScopeProcess(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for Control Scope
        const enhancedContext = contextManager.buildContextForDocument('control-scope', [
            'scope-management-plan',
            'scope-baseline',
            'requirements-documentation',
            'requirements-traceability-matrix',
            'project-scope-statement',
            'validate-scope',
            'perform-integrated-change-control',
            'project-management-plan',
            'change-control-log',
            'wbs',
            'wbs-dictionary'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Describe the Control Scope process for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, provide a detailed process description for Control Scope as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour description should include:\n- Purpose and objectives of the process\n- Key activities and deliverables (including change control and scope monitoring)\n- Inputs, tools & techniques, and outputs (ITTOs)\n- Roles and responsibilities\n- Integration with other project management processes (e.g., Validate Scope, Perform Integrated Change Control, Control Quality)\n- Best practices and common challenges\n- Output: Updated Scope Baseline, Change Requests, Work Performance Information\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1000);
        return extractContent(response);
    }, 'Control Scope Process Generation', 'control-scope');
}
export async function getAiWorkPerformanceInformationScope(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for Work Performance Information (Scope)
        const enhancedContext = contextManager.buildContextForDocument('work-performance-information-scope', [
            'scope-baseline',
            'control-scope',
            'validate-scope',
            'requirements-documentation',
            'requirements-traceability-matrix',
            'project-management-plan',
            'change-control-log',
            'wbs',
            'wbs-dictionary'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Generate a Work Performance Information (Scope) report for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, provide a detailed Work Performance Information (Scope) report as a markdown section.\n\nProject Context:\n${fullContext}\n\nYour report should include:\n- Purpose and definition of Work Performance Information (WPI) for scope\n- Key metrics: scope variance, change requests, requirements traceability, scope creep, acceptance status, root cause analysis\n- Analysis of how the project scope is performing relative to the scope baseline\n- Reporting and communication practices\n- Outputs and recommendations for corrective or preventive actions\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1000);
        return extractContent(response);
    }, 'Work Performance Information (Scope) Generation', 'work-performance-information-scope');
}
export async function getAiProjectStatementOfWork(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for Project Statement of Work
        const enhancedContext = contextManager.buildContextForDocument('project-statement-of-work', [
            'project-charter',
            'business-case',
            'requirements-documentation',
            'stakeholder-register',
            'scope-management-plan',
            'user-stories',
            'core-values',
            'project-purpose'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Generate a comprehensive Project Statement of Work (SOW) for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Project Statement of Work (SOW) as a markdown document.\n\nProject Context:\n${fullContext}\n\nCreate a Project Statement of Work that includes (as sections):\n- Purpose and business need\n- Product/service description and deliverables\n- Scope of work (inclusions/exclusions)\n- Key requirements and acceptance criteria\n- Project objectives and success criteria\n- Major milestones and schedule overview\n- Assumptions and constraints\n- Roles and responsibilities\n- Approval and sign-off section\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Project Statement of Work Generation', 'project-statement-of-work');
}
/**
 * Generate a comprehensive Business Case document for the project
 * @param context - Project context including objectives, options, benefits, and stakeholders
 */
export async function getAiBusinessCase(context) {
    return await handleAICall(async () => {
        // Use enhanced context management for Business Case
        const enhancedContext = contextManager.buildContextForDocument('business-case', [
            'project-summary',
            'project-charter',
            'stakeholder-register',
            'requirements-documentation',
            'user-stories',
            'core-values',
            'project-purpose'
        ]);
        const fullContext = enhancedContext || context;
        const messages = createMessages("You are a PMBOK-certified project manager. Generate a comprehensive Business Case for a software project, following PMBOK 7th Edition standards.", `Based on the comprehensive project context below, create a detailed Business Case as a markdown document.\n\nProject Context:\n${fullContext}\n\nYour Business Case should include (as sections):\n- Executive summary\n- Business need and problem/opportunity statement\n- Project objectives and alignment with organizational strategy\n- Options analysis (including do-nothing scenario)\n- Benefits, value, and success criteria\n- Risks, assumptions, and constraints\n- Cost estimate and funding requirements\n- Impact analysis (stakeholders, operations, compliance)\n- Recommendation and next steps\n- Approval and sign-off section\n\nEnsure the output is actionable, clear, and tailored to the Requirements Gathering Agent project. Use PMBOK terminology and structure.`);
        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Business Case Generation', 'business-case');
}
//# sourceMappingURL=llmProcessor.js.map