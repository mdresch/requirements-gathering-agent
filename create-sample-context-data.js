import mongoose from 'mongoose';
import { AIContextTracking } from './dist/models/AIContextTracking.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/requirements-gathering-agent';

async function createSampleData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await AIContextTracking.deleteMany({});
    console.log('🗑️ Cleared existing context tracking data');

    // Create sample context tracking records
    const sampleRecords = [
      {
        projectId: '68cc74380846c36e221ee391', // ADPA project
        documentId: '68d1c35de0c8bdea67990fb3',
        templateId: 'template-1',
        generationJobId: 'job-001',
        aiProvider: 'openai',
        aiModel: 'gpt-4',
        providerConfig: {
          modelName: 'gpt-4',
          maxTokens: 4000,
          temperature: 0.7,
          topP: 0.9,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        contextUtilization: {
          totalTokensUsed: 3200,
          maxContextWindow: 4000,
          utilizationPercentage: 80,
          breakdown: {
            systemPromptTokens: 800,
            userPromptTokens: 600,
            projectContextTokens: 1200,
            templateTokens: 400,
            outputTokens: 800,
            responseTokens: 1000
          }
        },
        inputContext: {
          systemPrompt: 'You are a professional requirements analyst...',
          userPrompt: 'Generate a stakeholder analysis document for the ADPA project...',
          projectContext: 'ADPA is a digital transformation project...',
          templateContent: 'Template content for stakeholder analysis...',
          fullContext: 'Complete context including system prompt, user prompt, project context, and template content...'
        },
        aiResponse: {
          rawResponse: 'Generated stakeholder analysis document...',
          processedResponse: 'Processed stakeholder analysis document...',
          responseMetadata: {
            finishReason: 'stop',
            usage: {
              promptTokens: 2200,
              completionTokens: 1000,
              totalTokens: 3200
            },
            model: 'gpt-4',
            timestamp: new Date().toISOString()
          }
        },
        performance: {
          generationTimeMs: 4500,
          tokensPerSecond: 0.71,
          costEstimate: {
            currency: 'USD',
            amount: 0.096,
            costPerToken: 0.00003
          }
        },
        traceability: {
          sourceInformation: {
            projectName: 'ADPA',
            projectType: 'Digital Transformation',
            framework: 'BABOK',
            documentType: 'Stakeholder Analysis',
            templateVersion: '1.0'
          },
          qualityMetrics: {
            qualityScore: 85,
            complianceScore: 78,
            validationResults: []
          }
        },
        status: 'completed',
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          sessionId: 'session-001',
          requestId: 'req-001'
        }
      },
      {
        projectId: '68cc74380846c36e221ee391', // ADPA project
        documentId: '68d1c35de0c8bdea67990fb4',
        templateId: 'template-2',
        generationJobId: 'job-002',
        aiProvider: 'anthropic',
        aiModel: 'claude-3',
        providerConfig: {
          modelName: 'claude-3',
          maxTokens: 4000,
          temperature: 0.7,
          topP: 0.9
        },
        contextUtilization: {
          totalTokensUsed: 2800,
          maxContextWindow: 4000,
          utilizationPercentage: 70,
          breakdown: {
            systemPromptTokens: 700,
            userPromptTokens: 500,
            projectContextTokens: 1000,
            templateTokens: 350,
            outputTokens: 700,
            responseTokens: 900
          }
        },
        inputContext: {
          systemPrompt: 'You are a professional requirements analyst...',
          userPrompt: 'Generate a scope management document for the ADPA project...',
          projectContext: 'ADPA is a digital transformation project...',
          templateContent: 'Template content for scope management...',
          fullContext: 'Complete context including system prompt, user prompt, project context, and template content...'
        },
        aiResponse: {
          rawResponse: 'Generated scope management document...',
          processedResponse: 'Processed scope management document...',
          responseMetadata: {
            finishReason: 'stop',
            usage: {
              promptTokens: 1900,
              completionTokens: 900,
              totalTokens: 2800
            },
            model: 'claude-3',
            timestamp: new Date().toISOString()
          }
        },
        performance: {
          generationTimeMs: 3800,
          tokensPerSecond: 0.74,
          costEstimate: {
            currency: 'USD',
            amount: 0.042,
            costPerToken: 0.000015
          }
        },
        traceability: {
          sourceInformation: {
            projectName: 'ADPA',
            projectType: 'Digital Transformation',
            framework: 'PMBOK',
            documentType: 'Scope Management Plan',
            templateVersion: '1.0'
          },
          qualityMetrics: {
            qualityScore: 88,
            complianceScore: 82,
            validationResults: []
          }
        },
        status: 'completed',
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          sessionId: 'session-002',
          requestId: 'req-002'
        }
      },
      {
        projectId: '68cc74380846c36e221ee391', // ADPA project
        documentId: '68d1c35de0c8bdea67990fb5',
        templateId: 'template-3',
        generationJobId: 'job-003',
        aiProvider: 'google',
        aiModel: 'gemini-pro',
        providerConfig: {
          modelName: 'gemini-pro',
          maxTokens: 4000,
          temperature: 0.7
        },
        contextUtilization: {
          totalTokensUsed: 3600,
          maxContextWindow: 4000,
          utilizationPercentage: 90,
          breakdown: {
            systemPromptTokens: 900,
            userPromptTokens: 700,
            projectContextTokens: 1400,
            templateTokens: 450,
            outputTokens: 900,
            responseTokens: 1100
          }
        },
        inputContext: {
          systemPrompt: 'You are a professional requirements analyst...',
          userPrompt: 'Generate a user stories document for the ADPA project...',
          projectContext: 'ADPA is a digital transformation project...',
          templateContent: 'Template content for user stories...',
          fullContext: 'Complete context including system prompt, user prompt, project context, and template content...'
        },
        aiResponse: {
          rawResponse: 'Generated user stories document...',
          processedResponse: 'Processed user stories document...',
          responseMetadata: {
            finishReason: 'stop',
            usage: {
              promptTokens: 2500,
              completionTokens: 1100,
              totalTokens: 3600
            },
            model: 'gemini-pro',
            timestamp: new Date().toISOString()
          }
        },
        performance: {
          generationTimeMs: 5200,
          tokensPerSecond: 0.69,
          costEstimate: {
            currency: 'USD',
            amount: 0.036,
            costPerToken: 0.00001
          }
        },
        traceability: {
          sourceInformation: {
            projectName: 'ADPA',
            projectType: 'Digital Transformation',
            framework: 'Agile',
            documentType: 'User Stories and Requirements',
            templateVersion: '1.0'
          },
          qualityMetrics: {
            qualityScore: 92,
            complianceScore: 85,
            validationResults: []
          }
        },
        status: 'completed',
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          sessionId: 'session-003',
          requestId: 'req-003'
        }
      }
    ];

    console.log('📝 Creating sample context tracking records...');
    const createdRecords = await AIContextTracking.insertMany(sampleRecords);
    console.log(`✅ Created ${createdRecords.length} sample records`);

    console.log('📊 Sample data created successfully!');
    console.log('🔍 You can now test the dashboard with real data');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleData();
