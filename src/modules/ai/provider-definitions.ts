/**
 * Enhanced Provider Definitions for Interactive Provider Selection Menu
 * 
 * Comprehensive provider configurations with metadata, setup guides,
 * and status checking capabilities for the interactive selection interface.
 * 
 * @version 2.1.3
 * @author Requirements Gathering Agent Team
 * @created June 2025
 * 
 * @filepath c:\Users\menno\Source\Repos\requirements-gathering-agent\src\modules\ai\provider-definitions.ts
 */

import fetch from 'node-fetch';
import type { 
  EnhancedProviderConfig, 
  ProviderStatus 
} from './enhanced-types.js';

export const PROVIDER_DEFINITIONS: EnhancedProviderConfig[] = [
  {
    id: 'google-ai',
    name: 'Google AI Studio',
    displayName: 'Google AI Studio (Free Tier)',
    description: 'Free tier with generous limits, large context support (1M-2M tokens)',
    category: 'free',
    priority: 1,
    icon: '🟣',
    statusColor: 'purple',
    recommendation: 'Best for getting started - free tier with excellent capabilities',
    
    requiredEnvVars: ['GOOGLE_AI_API_KEY'],
    optionalEnvVars: ['GOOGLE_AI_MODEL'],
    configTemplate: {
      'GOOGLE_AI_API_KEY': 'your-google-ai-api-key',
      'GOOGLE_AI_MODEL': 'gemini-1.5-flash'
    },
    
    tokenLimit: 1048576, // 1M tokens
    features: ['Large Context (1M-2M tokens)', 'Free Tier', 'Fast Response', 'Easy Setup'],
    
    costInfo: {
      tier: 'free',
      description: 'Free tier with generous daily limits'
    },
    
    setupGuide: {
      steps: [
        {
          title: 'Get Google AI Studio API Key',
          description: 'Visit Google AI Studio and create an API key',
          action: 'manual'
        },
        {
          title: 'Copy API Key',
          description: 'Copy the generated API key to your clipboard',
          action: 'manual'
        }
      ],
      estimatedTime: '2 minutes',
      difficulty: 'easy',
      prerequisites: ['Google Account'],
      helpLinks: [
        { title: 'Google AI Studio', url: 'https://makersuite.google.com/app/apikey' },
        { title: 'Getting Started Guide', url: 'https://ai.google.dev/docs/setup' }
      ]
    },

    async check(): Promise<boolean> {
      return !!process.env.GOOGLE_AI_API_KEY;
    },

    async isAvailable(): Promise<boolean> {
      // Check if Google AI Studio is accessible
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
          method: 'GET',
          timeout: 2000, // Reduced timeout
          headers: {
            'x-goog-api-key': process.env.GOOGLE_AI_API_KEY || ''
          }
        });
        // Consider available if we get any response (even 401)
        return true;
      } catch {
        // If we have an API key, consider it available
        return !!process.env.GOOGLE_AI_API_KEY;
      }
    },

    async getStatus(): Promise<import('./enhanced-types.js').ProviderStatus> {
      const configured = await this.check();
      const available = await this.isAvailable();
      
      return {
        configured,
        available,
        connected: configured && available,
        lastChecked: new Date(),
        error: configured && !available ? 'Service not responding' : undefined
      };
    }
  },

  {
    id: 'github-ai',
    name: 'GitHub AI',
    displayName: 'GitHub AI (Free for GitHub Users)',
    description: 'Free AI access for GitHub users with gpt-4o-mini model',
    category: 'free',
    priority: 2,
    icon: '🟢',
    statusColor: 'green',
    recommendation: 'Great option for GitHub users - completely free',
    
    requiredEnvVars: ['GITHUB_TOKEN', 'GITHUB_ENDPOINT'],
    optionalEnvVars: ['REQUIREMENTS_AGENT_MODEL'],
    configTemplate: {
      'GITHUB_ENDPOINT': 'https://models.github.ai/inference/',
      'GITHUB_TOKEN': 'your-github-token',
      'REQUIREMENTS_AGENT_MODEL': 'gpt-4o-mini'
    },
    
    tokenLimit: 128000, // 128k tokens
    features: ['Free for GitHub Users', 'GPT-4o-mini Access', 'No API Key Required'],
    
    costInfo: {
      tier: 'free',
      description: 'Free for GitHub users with existing GitHub account'
    },
    
    setupGuide: {
      steps: [
        {
          title: 'Create GitHub Personal Access Token',
          description: 'Go to GitHub Settings > Developer settings > Personal access tokens',
          action: 'manual'
        },
        {
          title: 'Generate New Token',
          description: 'Create a token with appropriate scopes',
          action: 'manual'
        }
      ],
      estimatedTime: '3 minutes',
      difficulty: 'easy',
      prerequisites: ['GitHub Account'],
      helpLinks: [
        { title: 'GitHub Token Guide', url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token' },
        { title: 'GitHub Models', url: 'https://github.com/marketplace/models' }
      ]
    },

    async check(): Promise<boolean> {
      return !!(process.env.GITHUB_TOKEN && process.env.GITHUB_ENDPOINT);
    },

    async isAvailable(): Promise<boolean> {
      try {
        if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_ENDPOINT) {
          return false;
        }
        
        // Try a quick check to the GitHub AI endpoint
        const response = await fetch(process.env.GITHUB_ENDPOINT, {
          method: 'HEAD',
          timeout: 2000,
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
          }
        });
        
        // Consider available if we get any response (even 401)
        return response.status < 500; // Any non-server error means the service is available
      } catch {
        return false; // If we can't connect at all, consider it unavailable
      }
    },

    async getStatus(): Promise<import('./enhanced-types.js').ProviderStatus> {
      const configured = await this.check();
      const available = await this.isAvailable();
      
      return {
        configured,
        available,
        connected: configured && available,
        lastChecked: new Date(),
        error: configured && !available ? 'Service not responding' : undefined
      };
    }
  },

  {
    id: 'azure-openai-entra',
    name: 'Azure OpenAI (Entra ID)',
    displayName: 'Azure OpenAI (Enterprise)',
    description: 'Enterprise-grade reliability with Entra ID authentication',
    category: 'enterprise',
    priority: 3,
    icon: '🔷',
    statusColor: 'blue',
    recommendation: 'Best for enterprise environments with existing Azure setup',
    
    requiredEnvVars: ['AZURE_OPENAI_ENDPOINT', 'AZURE_CLIENT_ID', 'AZURE_TENANT_ID', 'AZURE_CLIENT_SECRET'],
    optionalEnvVars: ['DEPLOYMENT_NAME', 'USE_ENTRA_ID'],
    configTemplate: {
      'AZURE_OPENAI_ENDPOINT': 'https://your-resource.openai.azure.com/',
      'AZURE_CLIENT_ID': 'your-client-id',
      'AZURE_TENANT_ID': 'your-tenant-id',
      'AZURE_CLIENT_SECRET': 'your-client-secret',
      'DEPLOYMENT_NAME': 'gpt-4',
      'USE_ENTRA_ID': 'true'
    },
    
    tokenLimit: 128000, // 128k tokens
    features: ['Enterprise Security', 'Entra ID Auth', 'High Reliability', 'SLA Support'],
    
    costInfo: {
      tier: 'enterprise',
      description: 'Pay-per-use pricing with enterprise features'
    },
    
    setupGuide: {
      steps: [
        {
          title: 'Create Azure OpenAI Resource',
          description: 'Create an Azure OpenAI resource in Azure Portal',
          action: 'manual'
        },
        {
          title: 'Register Application in Azure AD',
          description: 'Register a new application in Azure AD and note the Client ID and Tenant ID\n' +
            'Direct link: https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
          action: 'manual'
        },
        {
          title: 'Configure Application Permissions',
          description: 'In Azure AD app registration:\n' +
            '1. Go to your registered application\n' +
            '2. Click on "API permissions" in the left menu\n' +
            '3. Click "Add a permission"\n' +
            '4. Click on "Microsoft APIs" tab\n' +
            '5. Scroll through the list to find "Azure Service Management"\n' +
            '   (It should be listed alphabetically)\n' +
            '6. Select "Azure Service Management" from the list\n' +
            '7. Choose "Application permissions"\n' +
            '8. Add the following permissions:\n' +
            '   - user_impersonation\n' +
            '9. Click "Add permissions"\n' +
            '10. Click "Grant admin consent" button at the top of the permissions page',
          action: 'manual'
        },
        {
          title: 'Assign Azure OpenAI Role',
          description: 'In Azure OpenAI resource, assign the "Cognitive Services OpenAI User" role to your application',
          action: 'manual'
        },
        {
          title: 'Create Client Secret',
          description: 'Create a new client secret in your Azure AD application',
          action: 'manual'
        },
        {
          title: 'Configure Authentication',
          description: 'Run "az login" to authenticate with Azure',
          action: 'command',
          command: 'az login'
        }
      ],
      estimatedTime: '20 minutes',
      difficulty: 'advanced',
      prerequisites: ['Azure Account', 'Azure OpenAI Access', 'Azure CLI'],
      helpLinks: [
        { title: 'Azure OpenAI Documentation', url: 'https://docs.microsoft.com/azure/cognitive-services/openai/' },
        { title: 'Azure AD App Registration', url: 'https://docs.microsoft.com/azure/active-directory/develop/quickstart-register-app' },
        { title: 'Azure OpenAI RBAC', url: 'https://docs.microsoft.com/azure/cognitive-services/openai/how-to/role-based-access-control' },
        { title: 'Azure CLI Installation', url: 'https://docs.microsoft.com/cli/azure/install-azure-cli' }
      ]
    },

    async check(): Promise<boolean> {
      return !!(
        process.env.AZURE_OPENAI_ENDPOINT && 
        process.env.USE_ENTRA_ID === 'true' &&
        process.env.AZURE_CLIENT_ID &&
        process.env.AZURE_TENANT_ID &&
        process.env.AZURE_CLIENT_SECRET
      );
    },

    async isAvailable(): Promise<boolean> {
      // Check Azure authentication and endpoint availability
      try {
        // Basic connectivity check
        if (!process.env.AZURE_OPENAI_ENDPOINT) return false;
        const url = new URL(process.env.AZURE_OPENAI_ENDPOINT);
        const response = await fetch(`${url.origin}/`, { 
          method: 'HEAD', 
          timeout: 5000 
        });
        return true; // If we can connect to the domain, Azure is available
      } catch {
        return false;
      }
    },

    async getStatus(): Promise<import('./enhanced-types.js').ProviderStatus> {
      const configured = await this.check();
      const available = await this.isAvailable();
      
      return {
        configured,
        available,
        connected: configured && available,
        lastChecked: new Date(),
        error: configured && !available ? 'Service not responding' : undefined
      };
    }
  },

  {
    id: 'azure-openai-key',
    name: 'Azure OpenAI (API Key)',
    displayName: 'Azure OpenAI (API Key)',
    description: 'Azure OpenAI with API key authentication',
    category: 'cloud',
    priority: 4,
    icon: '🔶',
    statusColor: 'orange',
    recommendation: 'Alternative to Entra ID for simpler Azure OpenAI setup',
    
    requiredEnvVars: ['AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_API_KEY'],
    optionalEnvVars: ['REQUIREMENTS_AGENT_MODEL'],
    configTemplate: {
      'AZURE_OPENAI_ENDPOINT': 'https://your-resource.openai.azure.com/',
      'AZURE_OPENAI_API_KEY': 'your-api-key',
      'REQUIREMENTS_AGENT_MODEL': 'gpt-4'
    },
    
    tokenLimit: 128000,
    features: ['API Key Auth', 'Azure Reliability', 'Multiple Models'],
    
    costInfo: {
      tier: 'paid',
      description: 'Pay-per-use pricing with Azure OpenAI'
    },
    
    setupGuide: {
      steps: [
        {
          title: 'Create Azure OpenAI Resource',
          description: 'Create an Azure OpenAI resource in Azure Portal',
          action: 'manual'
        },
        {
          title: 'Get API Key',
          description: 'Copy the API key from the Azure OpenAI resource',
          action: 'manual'
        },
        {
          title: 'Get Endpoint URL',
          description: 'Copy the endpoint URL from the Azure OpenAI resource',
          action: 'manual'
        }
      ],
      estimatedTime: '5 minutes',
      difficulty: 'medium',
      prerequisites: ['Azure Account', 'Azure OpenAI Access'],
      helpLinks: [
        { title: 'Azure OpenAI Quickstart', url: 'https://docs.microsoft.com/azure/cognitive-services/openai/quickstart' }
      ]
    },

    async check(): Promise<boolean> {
      return !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY);
    },

    async isAvailable(): Promise<boolean> {
      try {
        if (!process.env.AZURE_OPENAI_ENDPOINT) return false;
        const url = new URL(process.env.AZURE_OPENAI_ENDPOINT);
        const response = await fetch(`${url.origin}/`, { 
          method: 'HEAD', 
          timeout: 5000 
        });
        return true;
      } catch {
        return false;
      }
    },

    async getStatus(): Promise<import('./enhanced-types.js').ProviderStatus> {
      const configured = await this.check();
      const available = await this.isAvailable();
      
      return {
        configured,
        available,
        connected: configured && available,
        lastChecked: new Date()
      };
    }
  },

  {
    id: 'ollama',
    name: 'Ollama (Local)',
    displayName: 'Ollama (Local AI)',
    description: 'Offline/local AI processing with privacy and control',
    category: 'local',
    priority: 5,
    icon: '🟡',
    statusColor: 'yellow',
    recommendation: 'Best for privacy-conscious users and offline environments',
    
    requiredEnvVars: ['OLLAMA_ENDPOINT'],
    optionalEnvVars: ['REQUIREMENTS_AGENT_MODEL'],
    configTemplate: {
      'OLLAMA_ENDPOINT': 'http://localhost:11434',
      'REQUIREMENTS_AGENT_MODEL': 'llama3.1'
    },
    
    tokenLimit: 32768, // Varies by model
    features: ['Offline Processing', 'Privacy Focused', 'No API Keys', 'Multiple Models'],
    
    costInfo: {
      tier: 'free',
      description: 'Free local processing (requires computational resources)'
    },
    
    setupGuide: {
      steps: [
        {
          title: 'Install Ollama',
          description: 'Download and install Ollama from ollama.ai',
          action: 'manual'
        },
        {
          title: 'Start Ollama Service',
          description: 'Run "ollama serve" to start the service',
          action: 'command',
          command: 'ollama serve'
        },
        {
          title: 'Download a Model',
          description: 'Run "ollama pull llama3.1" to download a model',
          action: 'command',
          command: 'ollama pull llama3.1'
        }
      ],
      estimatedTime: '15 minutes',
      difficulty: 'medium',
      prerequisites: ['Sufficient RAM (8GB+)', 'Good CPU/GPU'],
      helpLinks: [
        { title: 'Ollama Installation', url: 'https://ollama.ai/download' },
        { title: 'Ollama Models', url: 'https://ollama.ai/library' }
      ]
    },

    async check(): Promise<boolean> {
      return !!(
        process.env.OLLAMA_ENDPOINT?.includes('localhost:11434') || 
        process.env.OLLAMA_ENDPOINT?.includes('127.0.0.1:11434')
      );
    },

    async isAvailable(): Promise<boolean> {
      try {
        const response = await fetch('http://localhost:11434/api/tags', {
          method: 'GET',
          timeout: 3000
        });
        return response.ok;
      } catch {
        return false;
      }
    },

    async getStatus(): Promise<import('./enhanced-types.js').ProviderStatus> {
      const configured = await this.check();
      const available = await this.isAvailable();
      
      return {
        configured,
        available,
        connected: configured && available,
        lastChecked: new Date()
      };
    }
  }
];

export function getProviderById(id: string): EnhancedProviderConfig | undefined {
  return PROVIDER_DEFINITIONS.find(provider => provider.id === id);
}

export function getConfiguredProviders(): EnhancedProviderConfig[] {
  return PROVIDER_DEFINITIONS.filter(async provider => await provider.check());
}

export function getAvailableProviders(): Promise<EnhancedProviderConfig[]> {
  return Promise.all(
    PROVIDER_DEFINITIONS.map(async provider => {
      const available = await provider.isAvailable();
      return available ? provider : null;
    })
  ).then(providers => providers.filter(Boolean) as EnhancedProviderConfig[]);
}
