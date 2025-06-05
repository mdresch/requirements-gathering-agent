import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

let client: any = null;
let azureOpenAIClient: AzureOpenAI | null = null;
let googleAIClient: GoogleGenerativeAI | null = null;
let clientInitialized = false;
let rateLimitHit = false;
let skipAI = false;

// Define proper message type for Azure OpenAI compatibility
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Determine which AI provider to use based on environment variables
function getAIProvider(): 'azure-openai' | 'github-ai' | 'ollama' | 'azure-ai-studio' | 'google-ai' {
    const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || "https://models.github.ai/inference";
    
    // Check for Google AI Studio first
    if (process.env.GOOGLE_AI_API_KEY) {
        return 'google-ai';
    } else if (endpoint.includes('openai.azure.com') && process.env.USE_ENTRA_ID === 'true') {
        return 'azure-openai';
    } else if (endpoint.includes('openai.azure.com')) {
        return 'azure-ai-studio';
    } else if (endpoint.includes('localhost:11434') || endpoint.includes('127.0.0.1:11434')) {
        return 'ollama';
    } else {
        return 'github-ai';
    }
}

function initializeClient() {
    if (clientInitialized) return { client, azureOpenAIClient, googleAIClient };
    
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
            } catch (error: any) {
                console.error('❌ Failed to initialize Google AI Studio:', error.message);
            }
            break;

        case 'azure-openai':
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
                
                console.log(`🚀 Azure OpenAI with Entra ID initialized successfully`);
                
            } catch (error: any) {
                console.error('❌ Failed to initialize Azure OpenAI with Entra ID:', error.message);
                console.log('💡 Falling back to API key authentication...');
                
                // Fallback to API key method
                if (token) {
                    console.log('✅ Falling back to Azure OpenAI with API key');
                    client = ModelClient(endpoint, new AzureKeyCredential(token));
                } else {
                    console.error('❌ No API key available for fallback');
                }
            }
            break;

        case 'azure-ai-studio':
            // Azure OpenAI with API key (your current working method)
            console.log('✅ Initializing Azure OpenAI client with API key');
            client = token ? ModelClient(endpoint, new AzureKeyCredential(token)) : null;
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

function getModel() {
    const provider = getAIProvider();
    
    if (provider === 'google-ai') {
        return process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash";
    }
    
    return process.env.DEPLOYMENT_NAME || process.env.REQUIREMENTS_AGENT_MODEL || "gpt-4o-mini";
}

// Helper function to add timeout to promises with longer timeout for Ollama
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> {
    // Use longer timeout for Ollama (large models take time to load)
    const endpoint = process.env.AZURE_AI_ENDPOINT || "";
    const isOllama = endpoint.includes('localhost:11434') || endpoint.includes('127.0.0.1:11434');
    const actualTimeout = isOllama ? Math.max(timeoutMs, 60000) : timeoutMs; // At least 60s for Ollama
    
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error(`Operation timed out after ${actualTimeout}ms`)), actualTimeout)
        )
    ]);
}

// Updated handleAICall to support both client types
async function handleAICall<T>(operation: () => Promise<T>, operationName: string): Promise<T | null> {
    if (skipAI) {
        console.log(`⏭️ Skipping ${operationName} (AI disabled due to previous errors)`);
        return null;
    }    try {
        const { client, azureOpenAIClient, googleAIClient } = initializeClient();
        if (!client && !azureOpenAIClient && !googleAIClient) {
            console.log(`⚠️ No AI client available for ${operationName}`);
            return null;
        }

        const result = await withTimeout(operation());
        return result;
    } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
            console.log(`⚠️ Rate limit hit for ${operationName}. Skipping remaining AI calls.`);
            rateLimitHit = true;
            skipAI = true;
        } else if (error.message?.includes('timeout')) {
            console.log(`⏰ ${operationName} timed out. This is normal for large models on first use.`);
        } else if (error.message?.includes('401') || error.message?.includes('authentication')) {
            console.error(`🔐 Authentication error for ${operationName}. Please run: az login`);
        } else {
            console.error(`❌ Error in ${operationName}:`, error.message);
        }
        return null;
    }
}

// Universal AI call function that works with both client types
async function makeAICall(messages: ChatMessage[], maxTokens: number = 1200): Promise<any> {
    const { client, azureOpenAIClient, googleAIClient } = initializeClient();
    const provider = getAIProvider();

    if (provider === 'google-ai' && googleAIClient) {
        // Use Google AI Studio
        console.log('🔗 Making Google AI Studio call');
        const model = googleAIClient.getGenerativeModel({ model: getModel() });
        
        // Convert messages to Google AI format
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const userMessage = messages.find(m => m.role === 'user')?.content || '';
        
        // Combine system and user messages for Google AI
        const prompt = systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage;
        
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: 0.7,
                topP: 1,
            }
        });
        
        // Return in a format compatible with other providers
        return {
            choices: [{
                message: {
                    content: result.response.text()
                }
            }]
        };
    } else if (provider === 'azure-openai' && azureOpenAIClient) {
        // Use Azure OpenAI with Entra ID
        console.log('🔐 Making Azure OpenAI call with Entra ID authentication');
        const deployment = getModel();
        
        return await azureOpenAIClient.chat.completions.create({
            model: deployment, // Required model parameter
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            max_tokens: maxTokens,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: null
        });
    } else if (client) {
        // Use inference client for GitHub AI, Ollama, or Azure with API key
        const endpoint = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || "";
        let apiPath = "/chat/completions";
        
        // Handle Azure OpenAI API path format
        if (endpoint.includes('openai.azure.com') && provider === 'azure-ai-studio') {
            const deployment = getModel();
            apiPath = `/openai/deployments/${deployment}/chat/completions?api-version=2024-10-21`;
            console.log(`📡 Using Azure OpenAI API path: ${apiPath}`);
        }
        
        const response = await client.path(apiPath).post({
            body: {
                messages,
                model: getModel(),
                max_tokens: maxTokens,
                temperature: 0.7
            }
        });

        if (isUnexpected(response)) {
            throw new Error(`API call failed: ${response.status} ${response.body?.error?.message || ''}`);
        }

        return response;
    } else {
        throw new Error('No AI client available');
    }
}

// Helper function to create properly typed messages
function createMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
    return [
        {
            role: 'system' as const,
            content: systemPrompt
        },
        {
            role: 'user' as const,
            content: userPrompt
        }
    ];
}

// Helper function to extract content from response
function extractContent(response: any): string | null {
    if (response?.choices) {
        // Azure OpenAI format
        return response.choices[0]?.message?.content || null;
    } else if (response?.body?.choices) {
        // Inference client format
        return response.body.choices[0]?.message?.content || null;
    }
    return null;
}

// CORE AI FUNCTIONS - Each function is declared ONLY ONCE
export async function getAiSummaryAndGoals(readmeContent: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are an expert business analyst. Analyze the provided project information and generate a comprehensive project summary with clear business goals, objectives, and strategic direction.",
            `Project Information:\n${readmeContent}\n\nProvide a detailed project summary and business goals.`
        );

        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'AI Summary and Goals');
}

export async function getAiUserStories(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are an expert requirements analyst specializing in user story creation. Generate comprehensive user stories that follow the 'As a [user type], I want [goal] so that [benefit]' format.",
            `Based on this project context:\n${context}\n\nGenerate detailed user stories with acceptance criteria.`
        );

        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'User Stories Generation');
}

export async function getAiUserPersonas(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a UX research expert. Create detailed user personas based on the project context.",
            `Project Context:\n${context}\n\nCreate 3-5 detailed user personas.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'User Personas Generation');
}

export async function getAiKeyRolesAndNeeds(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a business process analyst. Identify key user roles and their specific needs.",
            `Project Context:\n${context}\n\nIdentify and describe key roles and their needs.`
        );

        const response = await makeAICall(messages, 2000);
        return extractContent(response);
    }, 'Key Roles and Needs Analysis');
}

export async function getAiProjectCharter(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Project Charter.",
            `Project Context:\n${context}\n\nCreate a detailed Project Charter with all required elements.`
        );

        const response = await makeAICall(messages, 1600);
        return extractContent(response);
    }, 'Project Charter Generation');
}

export async function getAiScopeManagementPlan(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Scope Management Plan.",
            `Project Context:\n${context}\n\nCreate a detailed Scope Management Plan.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Scope Management Plan Generation');
}

export async function getAiRiskManagementPlan(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager specializing in risk management. Create a comprehensive Risk Management Plan.",
            `Project Context:\n${context}\n\nCreate a detailed Risk Management Plan.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Risk Management Plan Generation');
}

export async function getAiCostManagementPlan(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Cost Management Plan.",
            `Project Context:\n${context}\n\nCreate a detailed Cost Management Plan.`
        );

        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Cost Management Plan Generation');
}

export async function getAiQualityManagementPlan(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Quality Management Plan.",
            `Project Context:\n${context}\n\nCreate a detailed Quality Management Plan.`
        );

        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Quality Management Plan Generation');
}

export async function getAiResourceManagementPlan(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Resource Management Plan.",
            `Project Context:\n${context}\n\nCreate a detailed Resource Management Plan.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Resource Management Plan Generation');
}

export async function getAiCommunicationManagementPlan(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Communication Management Plan.",
            `Project Context:\n${context}\n\nCreate a detailed Communication Management Plan.`
        );

        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Communication Management Plan Generation');
}

export async function getAiProcurementManagementPlan(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Procurement Management Plan.",
            `Project Context:\n${context}\n\nCreate a detailed Procurement Management Plan.`
        );

        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Procurement Management Plan Generation');
}

export async function getAiStakeholderEngagementPlan(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Stakeholder Engagement Plan.",
            `Project Context:\n${context}\n\nCreate a detailed Stakeholder Engagement Plan.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Stakeholder Engagement Plan Generation');
}

export async function getAiWbs(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Work Breakdown Structure (WBS).",
            `Project Context:\n${context}\n\nCreate a detailed WBS with hierarchical decomposition.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'WBS Generation');
}

export async function getAiWbsDictionary(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive WBS Dictionary.",
            `Project Context:\n${context}\n\nCreate a detailed WBS Dictionary.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'WBS Dictionary Generation');
}

export async function getAiActivityList(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Activity List.",
            `Project Context:\n${context}\n\nCreate a detailed Activity List.`
        );

        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Activity List Generation');
}

export async function getAiActivityDurationEstimates(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create comprehensive Activity Duration Estimates using three-point estimation.",
            `Project Context:\n${context}\n\nCreate detailed Duration Estimates.`
        );

        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Activity Duration Estimates Generation');
}

export async function getAiActivityResourceEstimates(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create comprehensive Activity Resource Estimates.",
            `Project Context:\n${context}\n\nCreate detailed Resource Estimates.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Activity Resource Estimates Generation');
}

export async function getAiScheduleNetworkDiagram(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a Schedule Network Diagram.",
            `Project Context:\n${context}\n\nCreate a detailed Network Diagram with Mermaid syntax.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Schedule Network Diagram Generation');
}

export async function getAiMilestoneList(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Milestone List.",
            `Project Context:\n${context}\n\nCreate a detailed Milestone List.`
        );

        const response = await makeAICall(messages, 1500);
        return extractContent(response);
    }, 'Milestone List Generation');
}

export async function getAiDevelopScheduleInput(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create comprehensive Schedule Development Input.",
            `Project Context:\n${context}\n\nCreate detailed Schedule Development Input.`
        );

        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Schedule Development Input Generation');
}

export async function getAiStakeholderRegister(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager. Create a comprehensive Stakeholder Register.",
            `Project Context:\n${context}\n\nCreate a detailed Stakeholder Register.`
        );

        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'Stakeholder Register Generation');
}

export async function getAiDataModelSuggestions(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a database architect expert. Analyze the project context and suggest appropriate data models.",
            `Project Context:\n${context}\n\nSuggest comprehensive data models.`
        );

        const response = await makeAICall(messages, 2000);
        return extractContent(response);
    }, 'Data Model Suggestions Generation');
}

export async function getAiTechStackAnalysis(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a technical architect expert. Analyze the project requirements and provide technology stack recommendations.",
            `Project Context:\n${context}\n\nProvide comprehensive tech stack analysis.`
        );

        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Tech Stack Analysis Generation');
}

export async function getAiRiskAnalysis(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a risk management expert. Analyze the project context and identify potential risks.",
            `Project Context:\n${context}\n\nProvide comprehensive risk analysis.`
        );

        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Risk Analysis Generation');
}

export async function getAiAcceptanceCriteria(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a quality assurance expert. Create comprehensive acceptance criteria.",
            `Project Context:\n${context}\n\nCreate detailed acceptance criteria.`
        );

        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Acceptance Criteria Generation');
}

export async function getAiComplianceConsiderations(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a compliance expert. Analyze the project context and identify compliance requirements.",
            `Project Context:\n${context}\n\nProvide comprehensive compliance analysis.`
        );

        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Compliance Considerations Generation');
}

export async function getAiUiUxConsiderations(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a UX/UI design expert. Analyze the project context and provide user experience recommendations.",
            `Project Context:\n${context}\n\nProvide comprehensive UI/UX considerations.`
        );

        const response = await makeAICall(messages, 1200);
        return extractContent(response);
    }, 'UI/UX Considerations Generation');
}

// Context Manager
class ContextManager {
    private maxContextTokens: number;
    private coreContext: string = '';
    public enrichedContext: Map<string, string> = new Map();

    constructor(maxTokens: number = 3000) {
        this.maxContextTokens = maxTokens;
    }

    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    async createCoreContext(readmeContent: string): Promise<string> {
        if (this.estimateTokens(readmeContent) > 1000) {
            const summary = await this.summarizeText(readmeContent, 800);
            this.coreContext = summary;
        } else {
            this.coreContext = readmeContent;
        }
        return this.coreContext;
    }

    buildContextForDocument(documentType: string, additionalContext?: string[]): string {
        let context = this.coreContext;
        let remainingTokens = this.maxContextTokens - this.estimateTokens(context);

        const relevantContext = this.getRelevantContext(documentType);
        
        for (const contextPart of relevantContext) {
            const tokens = this.estimateTokens(contextPart);
            if (tokens <= remainingTokens) {
                context += `\n\n${contextPart}`;
                remainingTokens -= tokens;
            } else {
                const maxChars = remainingTokens * 4 - 100;
                if (maxChars > 200) {
                    context += `\n\n${contextPart.substring(0, maxChars)}...`;
                }
                break;
            }
        }

        return context;
    }

    private getRelevantContext(documentType: string): string[] {
        const contextMap: { [key: string]: string[] } = {
            'user-stories': ['personas', 'summary'],
            'risk-management': ['project-charter', 'scope-plan', 'tech-stack'],
            'quality-plan': ['requirements', 'tech-stack', 'user-stories'],
            'stakeholder-register': ['project-charter', 'communication-plan'],
        };

        return (contextMap[documentType] || ['summary'])
            .map(key => this.enrichedContext.get(key))
            .filter(Boolean) as string[];
    }

    async summarizeText(text: string, maxTokens: number): Promise<string> {
        return text.substring(0, maxTokens * 4);
    }
}

// Initialize context manager
const contextManager = new ContextManager(3000);

// Add the missing stakeholder analysis function
export async function getAiStakeholderAnalysis(context: string): Promise<string | null> {
    return await handleAICall(async () => {
        const messages = createMessages(
            "You are a PMBOK-certified project manager specializing in stakeholder management. Create a comprehensive stakeholder analysis document following PMBOK 7th Edition standards.",
            `Based on the following project context, generate a comprehensive PMBOK stakeholder analysis document.

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

Follow PMBOK 7th Edition standards and best practices. Be specific and actionable.`
        );

        const response = await makeAICall(messages, 1800);
        return extractContent(response);
    }, 'Stakeholder Analysis Generation');
}

