/**
 * Basic Usage Examples for Requirements Gathering Agent SDK
 * 
 * This file demonstrates common usage patterns and provides
 * practical examples for developers getting started with the SDK.
 */

import { 
  RequirementsGatheringAgent,
  ProjectContext,
  DocumentGenerationOptions,
  AIAnalysisRequest,
  ValidationOptions,
  PublishOptions
} from '../index.js';

/**
 * Example 1: Basic Document Generation
 */
export async function basicDocumentGeneration() {
  console.log('=== Basic Document Generation Example ===');
  
  // Initialize the SDK
  const agent = new RequirementsGatheringAgent({
    aiProvider: 'google-ai',
    apiKey: process.env.GOOGLE_AI_API_KEY,
    outputDirectory: './generated-docs',
    debug: true
  });
  
  await agent.initialize();
  
  // Define project context
  const projectContext: ProjectContext = {
    projectName: 'E-commerce Platform Modernization',
    businessProblem: 'Our legacy e-commerce system is outdated and cannot handle current traffic volumes. We need to modernize the platform to improve performance, scalability, and user experience.',
    technologyStack: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    stakeholders: [
      {
        name: 'John Smith',
        role: 'Product Manager',
        department: 'Product',
        influence: 'high',
        interest: 'high'
      },
      {
        name: 'Sarah Johnson',
        role: 'Technical Lead',
        department: 'Engineering',
        influence: 'high',
        interest: 'high'
      },
      {
        name: 'Mike Davis',
        role: 'Business Analyst',
        department: 'Business',
        influence: 'medium',
        interest: 'high'
      }
    ],
    constraints: [
      {
        type: 'time',
        description: 'Must be completed within 6 months',
        impact: 'high'
      },
      {
        type: 'budget',
        description: 'Budget limited to $500,000',
        impact: 'medium'
      }
    ],
    successCriteria: [
      'Improve page load times by 50%',
      'Handle 10x current traffic volume',
      'Achieve 99.9% uptime',
      'Reduce customer support tickets by 30%'
    ]
  };
  
  // Generate project charter
  console.log('Generating project charter...');
  const charterResult = await agent.generateProjectCharter(projectContext, {
    format: 'markdown',
    includeTableOfContents: true,
    validation: {
      enablePMBOKValidation: true
    }
  });
  
  console.log('Project charter generated:', charterResult.success);
  console.log('Document path:', charterResult.documentPath);
  
  // Generate stakeholder register
  console.log('Generating stakeholder register...');
  const stakeholderResult = await agent.generateStakeholderRegister(projectContext);
  
  console.log('Stakeholder register generated:', stakeholderResult.success);
  
  // Clean up
  await agent.cleanup();
}

/**
 * Example 2: AI-Powered Analysis
 */
export async function aiAnalysisExample() {
  console.log('=== AI Analysis Example ===');
  
  const agent = new RequirementsGatheringAgent({
    aiProvider: 'google-ai',
    apiKey: process.env.GOOGLE_AI_API_KEY
  });
  
  await agent.initialize();
  
  // Analyze business requirements
  const businessAnalysisRequest: AIAnalysisRequest = {
    content: `We need to build a new customer relationship management (CRM) system 
              that can handle our growing customer base. The current system is slow, 
              lacks modern features, and doesn't integrate well with our other tools. 
              We need better reporting, automation capabilities, and mobile access.`,
    analysisType: 'business-analysis',
    options: {
      outputFormat: 'structured',
      temperature: 0.3
    }
  };
  
  console.log('Performing business analysis...');
  const businessAnalysis = await agent.analyzeBusinessRequirements(businessAnalysisRequest);
  
  if (businessAnalysis.success) {
    console.log('Business Analysis Results:');
    console.log('- Summary:', businessAnalysis.result.summaryAndGoals);
    console.log('- User Stories Count:', businessAnalysis.result.userStories?.length || 0);
    console.log('- User Personas Count:', businessAnalysis.result.userPersonas?.length || 0);
  }
  
  // Perform risk assessment
  const riskAnalysisRequest: AIAnalysisRequest = {
    content: `Project involves migrating from legacy system to modern cloud-based solution. 
              Timeline is aggressive (6 months). Team has mixed experience with new technologies. 
              Integration with 5 external systems required.`,
    analysisType: 'risk-assessment'
  };
  
  console.log('Performing risk analysis...');
  const riskAnalysis = await agent.assessRisks(riskAnalysisRequest);
  
  if (riskAnalysis.success) {
    console.log('Risk Analysis Results:');
    console.log('- Risks identified:', riskAnalysis.result.risks?.length || 0);
    console.log('- Overall risk score:', riskAnalysis.result.overallRiskScore);
  }
  
  await agent.cleanup();
}

/**
 * Example 3: Document Validation
 */
export async function documentValidationExample() {
  console.log('=== Document Validation Example ===');
  
  const agent = new RequirementsGatheringAgent({
    aiProvider: 'google-ai',
    apiKey: process.env.GOOGLE_AI_API_KEY
  });
  
  await agent.initialize();
  
  // Validation options
  const validationOptions: ValidationOptions = {
    enablePMBOKValidation: true,
    enableGrammarCheck: true,
    enableComplianceCheck: true,
    customValidationRules: [
      {
        name: 'no-placeholder-text',
        description: 'Check for placeholder text',
        severity: 'error',
        pattern: '\\[TODO\\]|\\[PLACEHOLDER\\]'
      }
    ]
  };
  
  // Validate a single document
  console.log('Validating document...');
  const validationResult = await agent.validateDocument('./sample-document.md', validationOptions);
  
  console.log('Validation Results:');
  console.log('- Is valid:', validationResult.isValid);
  console.log('- Score:', validationResult.score);
  console.log('- Issues found:', validationResult.issues.length);
  
  if (validationResult.issues.length > 0) {
    console.log('Issues:');
    validationResult.issues.forEach(issue => {
      console.log(`  - ${issue.severity.toUpperCase()}: ${issue.message}`);
    });
  }
  
  // Batch validate multiple documents
  const documentPaths = [
    './docs/project-charter.md',
    './docs/stakeholder-register.md',
    './docs/risk-management-plan.md'
  ];
  
  console.log('Batch validating documents...');
  const batchResults = await agent.validateDocuments(documentPaths, validationOptions);
  
  console.log(`Validated ${batchResults.length} documents`);
  const validDocuments = batchResults.filter(r => r.isValid).length;
  console.log(`${validDocuments} documents are valid`);
  
  await agent.cleanup();
}

/**
 * Example 4: Integration with External Platforms
 */
export async function integrationExample() {
  console.log('=== Integration Example ===');
  
  const agent = new RequirementsGatheringAgent({
    aiProvider: 'google-ai',
    apiKey: process.env.GOOGLE_AI_API_KEY
  });
  
  await agent.initialize();
  
  // Configure Confluence integration
  await agent.configureIntegration('confluence', {
    type: 'confluence',
    enabled: true,
    credentials: {
      apiKey: process.env.CONFLUENCE_TOKEN,
      username: process.env.CONFLUENCE_USERNAME
    },
    settings: {
      baseUrl: process.env.CONFLUENCE_URL,
      spaceKey: process.env.CONFLUENCE_SPACE_KEY
    }
  });
  
  // Test connection
  console.log('Testing Confluence connection...');
  const isConnected = await agent.testIntegrationConnection('confluence');
  console.log('Confluence connected:', isConnected);
  
  if (isConnected) {
    // Publish documents to Confluence
    const publishOptions: PublishOptions = {
      target: 'confluence',
      destination: 'Project Documentation',
      overwrite: true,
      notifyStakeholders: false
    };
    
    const documentPaths = ['./docs/project-charter.md'];
    
    console.log('Publishing to Confluence...');
    const publishResults = await agent.publishToConfluence(documentPaths, publishOptions);
    
    publishResults.forEach(result => {
      if (result.success) {
        console.log('Published successfully:', result.url);
      } else {
        console.log('Publish failed:', result.errors);
      }
    });
  }
  
  await agent.cleanup();
}

/**
 * Example 5: Template Management
 */
export async function templateManagementExample() {
  console.log('=== Template Management Example ===');
  
  const agent = new RequirementsGatheringAgent({
    aiProvider: 'google-ai',
    apiKey: process.env.GOOGLE_AI_API_KEY
  });
  
  await agent.initialize();
  
  // Get available templates
  console.log('Getting available templates...');
  const templates = await agent.getTemplates();
  console.log(`Found ${templates.length} templates`);
  
  // Create a custom template
  const customTemplate = {
    name: 'Custom Risk Assessment',
    description: 'Custom template for risk assessment documents',
    category: 'risk-management' as const,
    content: `# Risk Assessment: {{projectName}}

## Overview
{{overview}}

## Risk Categories
{{riskCategories}}

## Risk Matrix
{{riskMatrix}}

## Mitigation Strategies
{{mitigationStrategies}}

## Monitoring Plan
{{monitoringPlan}}`,
    variables: [
      {
        name: 'projectName',
        type: 'string' as const,
        description: 'Name of the project',
        required: true
      },
      {
        name: 'overview',
        type: 'string' as const,
        description: 'Risk assessment overview'
      },
      {
        name: 'riskCategories',
        type: 'string' as const,
        description: 'Categories of risks'
      },
      {
        name: 'riskMatrix',
        type: 'string' as const,
        description: 'Risk probability/impact matrix'
      },
      {
        name: 'mitigationStrategies',
        type: 'string' as const,
        description: 'Risk mitigation strategies'
      },
      {
        name: 'monitoringPlan',
        type: 'string' as const,
        description: 'Risk monitoring plan'
      }
    ],
    version: '1.0.0',
    author: 'SDK Example',
    tags: ['risk', 'assessment', 'custom']
  };
  
  console.log('Creating custom template...');
  const createdTemplate = await agent.createTemplate(customTemplate);
  console.log('Template created:', createdTemplate.id);
  
  // Preview template with sample data
  const sampleData = {
    projectName: 'Sample Project',
    overview: 'This is a sample risk assessment overview.',
    riskCategories: 'Technical, Business, Operational',
    riskMatrix: 'High/Medium/Low probability vs impact',
    mitigationStrategies: 'Various strategies to mitigate identified risks',
    monitoringPlan: 'Regular review and monitoring procedures'
  };
  
  console.log('Previewing template...');
  const preview = await agent.previewTemplate(createdTemplate.id, sampleData);
  console.log('Template preview generated');
  
  await agent.cleanup();
}

/**
 * Example 6: Project Analysis
 */
export async function projectAnalysisExample() {
  console.log('=== Project Analysis Example ===');
  
  const agent = new RequirementsGatheringAgent({
    aiProvider: 'google-ai',
    apiKey: process.env.GOOGLE_AI_API_KEY
  });
  
  await agent.initialize();
  
  const projectContext: ProjectContext = {
    projectName: 'Mobile Banking App',
    businessProblem: 'Customers demand mobile banking capabilities. Current online banking is not mobile-optimized. Need native mobile app with full banking features.',
    technologyStack: ['React Native', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
    stakeholders: [
      {
        name: 'Alice Brown',
        role: 'Product Owner',
        department: 'Product',
        influence: 'high',
        interest: 'high'
      },
      {
        name: 'Bob Wilson',
        role: 'Security Lead',
        department: 'Security',
        influence: 'high',
        interest: 'medium'
      }
    ],
    constraints: [
      {
        type: 'regulatory',
        description: 'Must comply with banking regulations',
        impact: 'high'
      },
      {
        type: 'security',
        description: 'Highest security standards required',
        impact: 'high'
      }
    ],
    budget: {
      totalBudget: 750000,
      currency: 'USD'
    },
    timeline: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-08-31')
    }
  };
  
  console.log('Analyzing project...');
  const analysis = await agent.analyzeProject(projectContext);
  
  console.log('Project Analysis Results:');
  console.log('- Complexity Score:', analysis.complexity.overallScore);
  console.log('- Complexity Level:', analysis.complexity.level);
  console.log('- Risk Score:', analysis.risks.overallRiskScore);
  console.log('- Success Probability:', analysis.success.probability);
  console.log('- Recommended Team Size:', analysis.resources.team.developers);
  console.log('- Estimated Duration:', analysis.resources.duration.total, 'weeks');
  
  // Generate recommendations
  console.log('Generating recommendations...');
  const recommendations = await agent.generateRecommendations(projectContext);
  
  console.log('Recommendations:');
  console.log('- Methodology:', recommendations.methodology);
  console.log('- Team Structure:', recommendations.team.structure);
  console.log('- Timeline Approach:', recommendations.timeline.approach);
  
  await agent.cleanup();
}

/**
 * Example 7: Batch Document Generation with Progress Tracking
 */
export async function batchGenerationExample() {
  console.log('=== Batch Generation Example ===');
  
  const agent = new RequirementsGatheringAgent({
    aiProvider: 'google-ai',
    apiKey: process.env.GOOGLE_AI_API_KEY
  });
  
  await agent.initialize();
  
  const projectContext: ProjectContext = {
    projectName: 'Digital Transformation Initiative',
    businessProblem: 'Company needs to digitize manual processes and modernize legacy systems to remain competitive.',
    technologyStack: ['Angular', 'Spring Boot', 'PostgreSQL', 'Kubernetes', 'Azure']
  };
  
  // Progress tracking callback
  const progressCallback = (progress: any) => {
    console.log(`Progress: ${progress.stage} - ${progress.progress}%`);
  };
  
  // Generate all documents with progress tracking
  console.log('Starting batch document generation...');
  const startTime = Date.now();
  
  const results = await agent.generateAllDocuments(
    projectContext,
    {
      format: 'markdown',
      includeTableOfContents: true,
      validation: {
        enablePMBOKValidation: true
      }
    },
    progressCallback
  );
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`\nBatch generation completed in ${duration}ms`);
  console.log(`Generated ${results.length} documents`);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Successful: ${successful}, Failed: ${failed}`);
  
  // Show results summary
  results.forEach(result => {
    if (result.success) {
      console.log(`✓ ${result.documentPath}`);
    } else {
      console.log(`✗ ${result.documentPath} - ${result.errors?.join(', ')}`);
    }
  });
  
  await agent.cleanup();
}

/**
 * Example 8: Error Handling and Recovery
 */
export async function errorHandlingExample() {
  console.log('=== Error Handling Example ===');
  
  const agent = new RequirementsGatheringAgent({
    aiProvider: 'google-ai',
    apiKey: 'invalid-api-key', // Intentionally invalid
    maxRetries: 2,
    timeout: 5000
  });
  
  try {
    await agent.initialize();
    
    const projectContext: ProjectContext = {
      projectName: 'Test Project',
      businessProblem: 'Test problem',
      technologyStack: ['Test']
    };
    
    // This should fail due to invalid API key
    await agent.generateProjectCharter(projectContext);
    
  } catch (error) {
    console.log('Expected error caught:', error.message);
    console.log('Error type:', error.constructor.name);
    
    if (error.code) {
      console.log('Error code:', error.code);
    }
    
    if (error.retryable) {
      console.log('Error is retryable');
    }
  }
  
  // Demonstrate graceful cleanup even after errors
  try {
    await agent.cleanup();
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.log('Cleanup error:', error.message);
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('Running Requirements Gathering Agent SDK Examples\n');
  
  try {
    await basicDocumentGeneration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await aiAnalysisExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await documentValidationExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await integrationExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await templateManagementExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await projectAnalysisExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await batchGenerationExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await errorHandlingExample();
    
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}