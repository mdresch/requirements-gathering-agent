// api.ts
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\lib\api.ts
// Updated: 2025-09-18 - Connected to MongoDB database via backend API server

const API_BASE_URL = typeof window !== 'undefined' ? 'http://localhost:3002/api/v1' : 'http://localhost:3002/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-123';

console.log('🔧 API Configuration:', {
  API_BASE_URL,
  API_KEY: API_KEY ? 'Present' : 'Missing',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

// Generic request helper function
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  };

  const config: RequestInit = {
      ...options,
      headers: {
      ...defaultHeaders,
      ...options.headers,
      },
  };

  try {
    console.log(`🌐 Making API request to: ${url}`, config.method || 'GET');
    
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response: "${errorText}"`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response received:', data);
    return data;
  } catch (error) {
    console.error('❌ API request failed:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error constructor:', error?.constructor?.name);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ Network error - check if API server is running on', API_BASE_URL);
    }
    
    throw error;
  }
}

// Templates API endpoints - now connected to MongoDB database
export async function getTemplates(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<any> {
  console.log('🔍 getTemplates called - connecting to MongoDB database');
  
  try {
    // Make real API call to backend server which connects to MongoDB
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/templates${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await request(url);
    
    console.log('✅ Templates loaded from MongoDB database:', response);
    
           // Transform the API response to match expected Template interface
           const transformedTemplates = (response.templates || []).map((template: any) => ({
             id: template.id.toString(),
             name: template.name,
             description: template.description,
             category: template.category || 'General', // Default category if not provided
             tags: template.tags || [template.category || 'general'], // Use category as tag if no tags
             content: template.content || `# ${template.name}\n\n${template.description}\n\n## Fields\n${(template.fields || []).map((field: string) => `- ${field}`).join('\n')}`,
             aiInstructions: template.aiInstructions || `Generate a comprehensive ${template.name.toLowerCase()} document.`,
             templateType: template.templateType || 'ai_instruction',
             isActive: template.isActive !== undefined ? template.isActive : true,
             version: template.version || '1.0.0',
             contextPriority: template.contextPriority || 'medium', // Default priority for context building
             contextRequirements: template.contextRequirements || [],
             variables: template.variables || {},
             metadata: template.metadata || {
               framework: 'general',
               complexity: 'medium',
               estimatedTime: '2-4 hours',
               dependencies: [],
               version: '1.0.0',
               author: 'System'
             },
             createdAt: template.createdAt || new Date().toISOString(),
             updatedAt: template.updatedAt || new Date().toISOString()
           }));

    return {
      success: true,
      data: {
        templates: transformedTemplates,
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 20,
        totalPages: Math.ceil((response.total || 0) / (response.limit || 20))
      },
      message: 'Templates loaded successfully'
    };
  } catch (error) {
    console.error('❌ Failed to load templates from database, using mock data:', error);
    
    // Fallback to mock data if database is not available
           const mockTemplates = [
             // CRITICAL PRIORITY - Foundation Documents (Required for Project Charter)
             { 
               id: "101", 
               name: "Business Case Template", 
               description: "Strategic justification and financial analysis for project initiation", 
               category: "Strategic Planning",
               tags: ["business", "case", "analysis", "strategy"],
               content: "# Business Case Template\n\n## Executive Summary\n\n## Problem Statement\n\n## Solution Overview\n\n## Financial Analysis\n\n## Recommendations",
               aiInstructions: "Generate a comprehensive business case document following standard business analysis practices.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "critical", // CRITICAL: Required for Project Charter
               contextRequirements: ["business objectives", "financial data", "stakeholder input"],
               variables: {
                 projectName: "string",
                 budget: "number",
                 timeline: "string"
               },
               metadata: {
                 framework: "babok",
                 complexity: "high",
                 estimatedTime: "4-6 hours",
                 dependencies: [],
                 pmbokKnowledgeArea: "Integration Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },
             { 
               id: "102", 
               name: "Stakeholder Analysis Template", 
               description: "Comprehensive stakeholder identification, analysis, and engagement strategy", 
               category: "Stakeholder Management",
               tags: ["stakeholder", "analysis", "engagement", "communication"],
               content: "# Stakeholder Analysis\n\n## Stakeholder Identification\n\n## Stakeholder Analysis Matrix\n\n## Engagement Strategy\n\n## Communication Plan",
               aiInstructions: "Create detailed stakeholder analysis following PMBOK stakeholder management guidelines.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "critical", // CRITICAL: Required for Project Charter
               contextRequirements: ["stakeholder interviews", "organizational chart"],
               variables: {
                 projectScope: "string",
                 stakeholders: "array",
                 communicationNeeds: "object"
               },
               metadata: {
                 framework: "pmbok",
                 complexity: "medium",
                 estimatedTime: "3-4 hours",
                 dependencies: [],
                 pmbokKnowledgeArea: "Stakeholder Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },
             { 
               id: "103", 
               name: "Scope Statement Template", 
               description: "Detailed project scope definition, deliverables, and boundaries", 
               category: "Scope Management",
               tags: ["scope", "deliverables", "boundaries", "requirements"],
               content: "# Scope Statement\n\n## Project Scope\n\n## Deliverables\n\n## Acceptance Criteria\n\n## Scope Boundaries",
               aiInstructions: "Generate comprehensive scope statement following PMBOK scope management practices.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "critical", // CRITICAL: Required for Project Charter
               contextRequirements: ["business requirements", "stakeholder input"],
               variables: {
                 scopeDescription: "string",
                 deliverables: "array",
                 constraints: "object"
               },
               metadata: {
                 framework: "pmbok",
                 complexity: "medium",
                 estimatedTime: "3-5 hours",
                 dependencies: ["stakeholder analysis"],
                 pmbokKnowledgeArea: "Scope Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },
             { 
               id: "104", 
               name: "Risk Register Template", 
               description: "Initial risk identification, assessment, and mitigation strategies", 
               category: "Risk Management",
               tags: ["risk", "assessment", "mitigation", "monitoring"],
               content: "# Risk Register\n\n## Risk Identification\n\n## Risk Assessment\n\n## Risk Response Planning\n\n## Risk Monitoring",
               aiInstructions: "Create comprehensive risk register following PMBOK risk management guidelines.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "critical", // CRITICAL: Required for Project Charter
               contextRequirements: ["project context", "historical data"],
               variables: {
                 riskCategories: "array",
                 impactAssessment: "object",
                 mitigationStrategies: "array"
               },
               metadata: {
                 framework: "pmbok",
                 complexity: "medium",
                 estimatedTime: "2-4 hours",
                 dependencies: ["scope statement"],
                 pmbokKnowledgeArea: "Risk Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },

             // HIGH PRIORITY - Supporting Plans (Strongly Recommended for Project Charter)
             { 
               id: "105", 
               name: "Requirements Template", 
               description: "Detailed functional and non-functional requirements documentation", 
               category: "Requirements Management",
               tags: ["requirements", "functional", "non-functional", "specifications"],
               content: "# Requirements Document\n\n## Project Overview\n\n## Functional Requirements\n\n## Non-Functional Requirements\n\n## Acceptance Criteria",
               aiInstructions: "Create detailed requirements documentation following BABOK guidelines.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "high", // HIGH: Strongly recommended for Project Charter
               contextRequirements: ["stakeholder interviews", "business process analysis"],
               variables: {
                 projectScope: "string",
                 stakeholders: "array",
                 constraints: "object"
               },
               metadata: {
                 framework: "babok",
                 complexity: "high",
                 estimatedTime: "4-6 hours",
                 dependencies: ["stakeholder analysis", "scope statement"],
                 pmbokKnowledgeArea: "Scope Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },
             { 
               id: "106", 
               name: "Cost Management Plan Template", 
               description: "Budget estimation, cost control, and financial management strategy", 
               category: "Cost Management",
               tags: ["cost", "budget", "financial", "estimation"],
               content: "# Cost Management Plan\n\n## Budget Estimation\n\n## Cost Control Procedures\n\n## Financial Reporting\n\n## Change Management",
               aiInstructions: "Generate comprehensive cost management plan following PMBOK cost management guidelines.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "high", // HIGH: Strongly recommended for Project Charter
               contextRequirements: ["business case", "scope statement"],
               variables: {
                 budgetEstimate: "number",
                 costCategories: "array",
                 reportingFrequency: "string"
               },
               metadata: {
                 framework: "pmbok",
                 complexity: "medium",
                 estimatedTime: "3-4 hours",
                 dependencies: ["business case", "scope statement"],
                 pmbokKnowledgeArea: "Cost Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },
             { 
               id: "107", 
               name: "Schedule Management Plan Template", 
               description: "Project timeline, milestones, and schedule control procedures", 
               category: "Schedule Management",
               tags: ["schedule", "timeline", "milestones", "planning"],
               content: "# Schedule Management Plan\n\n## Project Timeline\n\n## Key Milestones\n\n## Schedule Control\n\n## Progress Reporting",
               aiInstructions: "Create detailed schedule management plan following PMBOK schedule management practices.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "high", // HIGH: Strongly recommended for Project Charter
               contextRequirements: ["scope statement", "resource availability"],
               variables: {
                 projectDuration: "string",
                 keyMilestones: "array",
                 dependencies: "array"
               },
               metadata: {
                 framework: "pmbok",
                 complexity: "medium",
                 estimatedTime: "3-5 hours",
                 dependencies: ["scope statement"],
                 pmbokKnowledgeArea: "Schedule Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },
             { 
               id: "108", 
               name: "Quality Management Plan Template", 
               description: "Quality standards, assurance, and control procedures", 
               category: "Quality Management",
               tags: ["quality", "standards", "assurance", "control"],
               content: "# Quality Management Plan\n\n## Quality Standards\n\n## Quality Assurance\n\n## Quality Control\n\n## Quality Metrics",
               aiInstructions: "Generate comprehensive quality management plan following PMBOK quality management guidelines.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "high", // HIGH: Strongly recommended for Project Charter
               contextRequirements: ["requirements document", "stakeholder expectations"],
               variables: {
                 qualityStandards: "array",
                 acceptanceCriteria: "array",
                 qualityMetrics: "object"
               },
               metadata: {
                 framework: "pmbok",
                 complexity: "medium",
                 estimatedTime: "3-4 hours",
                 dependencies: ["requirements document"],
                 pmbokKnowledgeArea: "Quality Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },

             // MEDIUM PRIORITY - Supporting Documents (Useful for Project Charter)
             { 
               id: "109", 
               name: "Resource Management Plan Template", 
               description: "Human resource planning, team composition, and resource allocation", 
               category: "Resource Management",
               tags: ["resources", "team", "skills", "allocation"],
               content: "# Resource Management Plan\n\n## Team Composition\n\n## Skill Requirements\n\n## Resource Allocation\n\n## Training Needs",
               aiInstructions: "Create detailed resource management plan following PMBOK resource management practices.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "medium", // MEDIUM: Useful for Project Charter
               contextRequirements: ["scope statement", "schedule plan"],
               variables: {
                 teamSize: "number",
                 skillRequirements: "array",
                 resourceConstraints: "object"
               },
               metadata: {
                 framework: "pmbok",
                 complexity: "medium",
                 estimatedTime: "2-3 hours",
                 dependencies: ["scope statement"],
                 pmbokKnowledgeArea: "Resource Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },
             { 
               id: "110", 
               name: "Communication Management Plan Template", 
               description: "Communication strategy, reporting structure, and information distribution", 
               category: "Communication Management",
               tags: ["communication", "reporting", "information", "distribution"],
               content: "# Communication Management Plan\n\n## Communication Strategy\n\n## Reporting Structure\n\n## Information Distribution\n\n## Meeting Schedule",
               aiInstructions: "Generate comprehensive communication management plan following PMBOK communication management guidelines.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "medium", // MEDIUM: Useful for Project Charter
               contextRequirements: ["stakeholder analysis"],
               variables: {
                 communicationChannels: "array",
                 reportingFrequency: "string",
                 meetingSchedule: "object"
               },
               metadata: {
                 framework: "pmbok",
                 complexity: "low",
                 estimatedTime: "2-3 hours",
                 dependencies: ["stakeholder analysis"],
                 pmbokKnowledgeArea: "Communication Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             },

             // LOW PRIORITY - Implementation Documents (Generated after Project Charter)
             { 
               id: "111", 
               name: "Test Plan Template", 
               description: "Test strategy, test cases, and quality validation procedures", 
               category: "Quality Assurance",
               tags: ["testing", "quality", "validation", "verification"],
               content: "# Test Plan\n\n## Test Strategy\n\n## Test Cases\n\n## Test Execution\n\n## Test Results",
               aiInstructions: "Generate comprehensive test plans following industry best practices.",
               templateType: "ai_instruction",
               isActive: true,
               version: "1.0.0",
               contextPriority: "low", // LOW: Generated after Project Charter
               contextRequirements: ["requirements document", "system design"],
               variables: {
                 testScope: "string",
                 testTypes: "array",
                 testData: "object"
               },
               metadata: {
                 framework: "general",
                 complexity: "medium",
                 estimatedTime: "3-5 hours",
                 dependencies: ["requirements document"],
                 pmbokKnowledgeArea: "Quality Management",
                 version: "1.0.0",
                 author: "System"
               },
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             }
           ];
    
    console.log('✅ Returning mock templates (database unavailable)');
    return {
      success: true,
      data: {
        templates: mockTemplates,
        total: mockTemplates.length,
        page: 1,
        limit: 20,
        totalPages: 1
      },
      message: 'Templates loaded successfully'
    };
  }
}

export async function createTemplate(template: any): Promise<any> {
  try {
    console.log('🔍 createTemplate called with:', template);
    
    // Make real API call to backend server which saves to MongoDB
    const response = await request('/templates', {
    method: 'POST',
    body: JSON.stringify(template),
  });
    
    console.log('✅ Template created in MongoDB database:', response);
    return response;
  } catch (error) {
    console.error('❌ createTemplate error:', error);
    return {
      success: false,
      error: 'Failed to create template'
    };
  }
}

export async function updateTemplate(id: string, template: any): Promise<any> {
  try {
    console.log(`🔍 updateTemplate called for id: ${id} with:`, template);
    
    // Make real API call to backend server which updates MongoDB
    const response = await request(`/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(template),
  });
    
    console.log('✅ Template updated in MongoDB database:', response);
    return response;
  } catch (error) {
    console.error('❌ updateTemplate error:', error);
    return {
      success: false,
      error: 'Failed to update template'
    };
  }
}

export async function deleteTemplate(id: string): Promise<any> {
  try {
    console.log(`🔍 deleteTemplate called for id: ${id}`);
    
    // Make real API call to backend server which deletes from MongoDB
    const response = await request(`/templates/${id}`, {
    method: 'DELETE',
  });
    
    console.log('✅ Template deleted from MongoDB database:', response);
    return response;
  } catch (error) {
    console.error('❌ deleteTemplate error:', error);
    return {
      success: false,
      error: 'Failed to delete template'
    };
  }
}

export async function getTemplate(id: string): Promise<any> {
  try {
    console.log(`🔍 getTemplate called for id: ${id}`);
    
    // Make real API call to backend server which retrieves from MongoDB
    const response = await request(`/templates/${id}`);
    
    console.log('✅ Template retrieved from MongoDB database:', response);
    return response;
  } catch (error) {
    console.error('❌ getTemplate error:', error);
    return {
      success: false,
      error: 'Failed to retrieve template'
    };
  }
}

// Projects API endpoints - now connected to MongoDB database
export async function getProjects(params?: any): Promise<any> {
  try {
    console.log('🔍 getProjects called - connecting to MongoDB database');
    
    // Make real API call to backend server which retrieves from MongoDB
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.framework) queryParams.append('framework', params.framework);
    
    const url = `/projects${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await request(url);
    
    console.log('✅ Projects loaded from MongoDB database:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to load projects from database, using mock data:', error);
    
    // Fallback to mock data if database is not available
    const mockProjects = [
      {
        id: '1',
        name: 'Sample Project 1',
        description: 'A sample project for demonstration',
        status: 'active',
        framework: 'babok',
        complianceScore: 85,
        documents: 5,
        stakeholders: 3,
        templatesCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sample Project 2',
        description: 'Another sample project',
        status: 'planning',
        framework: 'pmbok',
        complianceScore: 72,
        documents: 3,
        stakeholders: 2,
        templatesCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Sample Project 3',
        description: 'Third sample project',
        status: 'completed',
        framework: 'multi',
        complianceScore: 95,
        documents: 8,
        stakeholders: 5,
        templatesCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Requirements Gathering Project',
        description: 'Project for requirements gathering and analysis',
        status: 'active',
        framework: 'babok',
        complianceScore: 88,
        documents: 6,
        stakeholders: 4,
        templatesCount: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    console.log(`✅ Returning ${mockProjects.length} mock projects (database unavailable)`);
    return {
      success: true,
      data: {
        projects: mockProjects,
        total: mockProjects.length,
        page: 1,
        limit: 20,
        totalPages: 1
      }
    };
  }
}

// Fetch a single project by ID
export async function getProjectById(id: string): Promise<any> {
  try {
    console.log(`🔍 getProjectById called with id: ${id}`);
    
    // Make real API call to backend server which retrieves from MongoDB
    const response = await request(`/projects/${id}`);
    
    console.log('✅ Project retrieved from MongoDB database:', response);
    
    // Return the project data directly, not the full API response
    if (response.success && response.data) {
      return response.data;
    } else {
      console.warn('⚠️ Project not found or API call failed:', response);
      return null;
    }
  } catch (error) {
    console.error('❌ getProjectById error:', error);
    return null;
  }
}

// Create a new project
export async function createProject(projectData: any): Promise<any> {
  try {
    console.log('🔍 createProject called with:', projectData);
    
    // Make real API call to backend server which saves to MongoDB
    const response = await request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    
    console.log('✅ Project created in MongoDB database:', response);
    
    // Return the project data directly, not the full API response
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data
      };
    } else {
      throw new Error('Failed to create project');
    }
  } catch (error) {
    console.error('❌ createProject error:', error);
    return {
      success: false,
      error: 'Failed to create project'
    };
  }
}

export async function updateProject(id: string, projectData: any): Promise<any> {
  try {
    console.log(`🔍 updateProject called for id: ${id} with:`, projectData);
    
    // Make real API call to backend server which updates MongoDB
    const response = await request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    
    console.log('✅ Project updated in MongoDB database:', response);
    
    // Return the project data directly, not the full API response
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data
      };
    } else {
      throw new Error('Failed to update project');
    }
  } catch (error) {
    console.error('❌ updateProject error:', error);
    return {
      success: false,
      error: 'Failed to update project'
    };
  }
}

export async function deleteProject(id: string): Promise<any> {
  try {
    console.log(`🔍 deleteProject called for id: ${id}`);
    
    // Make real API call to backend server which deletes from MongoDB
    const response = await request(`/projects/${id}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Project deleted from MongoDB database:', response);
    return response;
  } catch (error) {
    console.error('❌ deleteProject error:', error);
    return {
      success: false,
      error: 'Failed to delete project'
    };
  }
}

// Standards Compliance API endpoints
export async function getStandardsCompliance(projectId?: string): Promise<any> {
  const endpoint = projectId ? `/api/v1/standards/analyze?projectId=${projectId}` : '/api/v1/standards/dashboard';
  return request(endpoint);
}

export async function generateComplianceReport(projectId: string, standards?: string[]): Promise<any> {
  return request('/api/v1/standards/report', {
    method: 'POST',
    body: JSON.stringify({ projectId, standards }),
  });
}

// Feedback API endpoints
export async function submitFeedback(feedbackData: any): Promise<any> {
  return request('/api/v1/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
}

export async function getProjectFeedback(projectId: string): Promise<any> {
  try {
    console.log(`🔍 getProjectFeedback called for project: ${projectId}`);
    
    const response = await request(`/feedback/project/${projectId}`);
    
    console.log('✅ Project feedback retrieved from database:', response);
    
    if (response.success && response.data) {
      // The backend returns feedback in response.data.feedback
      return {
        success: true,
        data: response.data.feedback || []
      };
    } else {
      return {
        success: false,
        data: []
      };
    }
  } catch (error) {
    console.error('❌ getProjectFeedback error:', error);
    return {
      success: false,
      data: []
    };
  }
}

export async function getDocumentFeedback(projectId: string, documentType: string): Promise<any> {
  return request(`/api/v1/feedback/project/${projectId}/document/${documentType}`);
}

export async function getFeedbackSummary(): Promise<any> {
  return request('/api/v1/feedback/summary');
}

// Template Statistics API endpoints
export async function getTemplateStats(): Promise<any> {
  return request('/api/v1/templates/stats');
}

export async function getTemplateCategories(): Promise<any> {
  return request('/api/v1/templates/categories');
}

// Project Documents API functions
export async function getProjectDocuments(projectId: string): Promise<any> {
  try {
    console.log(`🔍 getProjectDocuments called for project: ${projectId}`);
    
    const response = await request(`/projects/${projectId}/documents`);
    
    console.log('✅ Project documents retrieved from database:', response);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to retrieve project documents');
    }
  } catch (error) {
    console.error('❌ getProjectDocuments error:', error);
    return [];
  }
}

export async function createProjectDocument(projectId: string, documentData: any): Promise<any> {
  try {
    console.log(`🔍 createProjectDocument called for project: ${projectId}`, documentData);
    
    const response = await request(`/projects/${projectId}/documents`, {
    method: 'POST',
      body: JSON.stringify(documentData),
    });
    
    console.log('✅ Project document created in database:', response);
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data
      };
    } else {
      throw new Error('Failed to create project document');
    }
  } catch (error) {
    console.error('❌ createProjectDocument error:', error);
    return {
      success: false,
      error: 'Failed to create project document'
    };
  }
}

export async function updateProjectDocument(documentId: string, documentData: any): Promise<any> {
  try {
    console.log(`🔍 updateProjectDocument called for document: ${documentId}`, documentData);
    
    const response = await request(`/projects/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
    
    console.log('✅ Project document updated in database:', response);
    
    if (response.success && response.data) {
    return { 
      success: true, 
        data: response.data
    };
    } else {
      throw new Error('Failed to update project document');
    }
  } catch (error) {
    console.error('❌ updateProjectDocument error:', error);
    return { 
      success: false, 
      error: 'Failed to update project document'
    };
  }
}

export async function deleteProjectDocument(documentId: string): Promise<any> {
  try {
    console.log(`🔍 Soft delete project document: ${documentId}`);
    
    const response = await request(`/projects/documents/${documentId}`, {
      method: 'DELETE'
    });
    
    console.log('✅ Project document soft deleted:', response);
    
    if (response.success) {
      return {
        success: true,
        message: 'Document moved to trash'
      };
    } else {
      throw new Error('Failed to delete project document');
    }
  } catch (error) {
    console.error('❌ deleteProjectDocument error:', error);
    return {
      success: false,
      error: 'Failed to delete project document'
    };
  }
}

export async function restoreProjectDocument(documentId: string): Promise<any> {
  try {
    console.log(`🔍 Restore project document: ${documentId}`);
    
    const response = await request(`/projects/documents/${documentId}/restore`, {
      method: 'PUT'
    });
    
    console.log('✅ Project document restored:', response);
    
    if (response.success) {
      return {
        success: true,
        message: 'Document restored successfully'
      };
    } else {
      throw new Error('Failed to restore project document');
    }
  } catch (error) {
    console.error('❌ restoreProjectDocument error:', error);
    return {
      success: false,
      error: 'Failed to restore project document'
    };
  }
}

export async function getDeletedProjectDocuments(projectId: string): Promise<any> {
  try {
    console.log(`🔍 Get deleted documents for project: ${projectId}`);
    
    const response = await request(`/projects/${projectId}/documents/deleted`);
    
    console.log('✅ Deleted documents retrieved:', response);
    
    return {
      success: true,
      data: response.documents || []
    };
  } catch (error) {
    console.error('❌ getDeletedProjectDocuments error:', error);
    return {
      success: false,
      error: 'Failed to retrieve deleted documents'
    };
  }
}

export async function getProjectDocumentStats(projectId: string): Promise<any> {
  try {
    console.log(`🔍 getProjectDocumentStats called for project: ${projectId}`);
    
    const response = await request(`/projects/${projectId}/documents/stats`);
    
    console.log('✅ Project document stats retrieved from database:', response);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to retrieve project document stats');
    }
  } catch (error) {
    console.error('❌ getProjectDocumentStats error:', error);
    return null;
  }
}

// Document Generation API
export async function generateDocuments(data: {
  projectId: string;
  context: string;
  documentKeys: string[];
  framework?: string;
}): Promise<any> {
  try {
    const response = await request('/document-generation/generate-only', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context: data.context,
        documentKeys: data.documentKeys,
        generateAll: false,
        projectId: data.projectId,
        framework: data.framework
      }),
    });
    return response;
  } catch (error) {
    console.error('❌ generateDocuments error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Generation Jobs API
export async function createGenerationJob(data: {
  projectId: string;
  templateId: string;
  templateName: string;
  outputFormat: string;
  metadata?: any;
}): Promise<any> {
  try {
    const response = await request('/generation-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('❌ createGenerationJob error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getGenerationJob(jobId: string): Promise<any> {
  try {
    const response = await request(`/generation-jobs/${jobId}`);
    return response;
  } catch (error) {
    console.error('❌ getGenerationJob error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function updateGenerationJob(jobId: string, data: any): Promise<any> {
  try {
    const response = await request(`/generation-jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('❌ updateGenerationJob error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getProjectGenerationJobs(projectId: string, limit: number = 50, skip: number = 0): Promise<any> {
  try {
    const response = await request(`/generation-jobs/project/${projectId}?limit=${limit}&skip=${skip}`);
    return response;
  } catch (error) {
    console.error('❌ getProjectGenerationJobs error:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getActiveGenerationJobs(): Promise<any> {
  try {
    const response = await request('/generation-jobs/active/jobs');
    return response;
  } catch (error) {
    console.error('❌ getActiveGenerationJobs error:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function cancelGenerationJob(jobId: string): Promise<any> {
  try {
    const response = await request(`/generation-jobs/${jobId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('❌ cancelGenerationJob error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getGenerationJobStats(projectId?: string): Promise<any> {
  try {
    const url = projectId ? `/generation-jobs/stats/overview?projectId=${projectId}` : '/generation-jobs/stats/overview';
    const response = await request(url);
    return response;
  } catch (error) {
    console.error('❌ getGenerationJobStats error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// API Client object for easy importing
export const apiClient = {
  // Templates
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
  getTemplateStats,
  getTemplateCategories,
  
  // Projects
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,

  // Project Documents
  getProjectDocuments,
  createProjectDocument,
  updateProjectDocument,
  deleteProjectDocument,
  restoreProjectDocument,
  getDeletedProjectDocuments,
  getProjectDocumentStats,
  
  // Standards Compliance
  getStandardsCompliance,
  generateComplianceReport,
  
  // Feedback
  submitFeedback,
  getProjectFeedback,
  getDocumentFeedback,
  getFeedbackSummary,
  
  // Document Generation
  generateDocuments,
  
  // Generation Jobs
  createGenerationJob,
  getGenerationJob,
  updateGenerationJob,
  getProjectGenerationJobs,
  getActiveGenerationJobs,
  cancelGenerationJob,
  getGenerationJobStats,
};

export default apiClient;