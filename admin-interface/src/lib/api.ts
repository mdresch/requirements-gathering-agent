// api.ts
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\lib\api.ts
// Updated: 2025-09-18 - Connected to MongoDB database via backend API server

const API_BASE_URL = typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:3002/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-123';


// Request queue and rate limiting
const requestQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;
const REQUEST_DELAY = 100; // 100ms delay between requests

// Generic request helper function with rate limiting
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const makeRequest = async () => {
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
        
        const response = await fetch(url, config);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API Error Response: "${errorText}"`);
          
          // Handle specific status codes with better error messages
          if (response.status === 429) {
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(`Rate limit exceeded: ${errorData.error?.message || 'Too many requests, please try again later.'}`);
            } catch {
              throw new Error('Rate limit exceeded: Too many requests, please try again later.');
            }
          } else if (response.status === 401) {
            throw new Error('Authentication failed: Please check your API key.');
          } else if (response.status === 403) {
            throw new Error('Access forbidden: You do not have permission to perform this action.');
          } else if (response.status === 404) {
            throw new Error('Resource not found: The requested endpoint does not exist.');
          } else if (response.status >= 500) {
            throw new Error('Server error: Please try again later or contact support.');
          } else {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        resolve(data);
      } catch (error) {
        console.error('❌ API request failed:', error);
        console.error('❌ Error type:', typeof error);
        console.error('❌ Error constructor:', error?.constructor?.name);
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error('❌ Network error - check if API server is running on', API_BASE_URL);
        }
        
        reject(error);
      }
    };

    requestQueue.push(makeRequest);
    processQueue();
  });
}

// Process request queue with rate limiting
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      try {
        await request();
      } catch (error) {
        // Error is already logged in the request function
      }
      
      // Add delay between requests to prevent rate limiting
      if (requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
      }
    }
  }

  isProcessingQueue = false;
}

// Templates API endpoints - now connected to MongoDB database
export async function getTemplates(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<any> {
  
  try {
    // Make real API call to backend server which connects to MongoDB
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/templates${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await request(url);
    
    console.log('📊 Templates API Response:', response);
    console.log('📊 Response success:', response.success);
    console.log('📊 Response data structure:', response.data);
    
    // Handle both array response and paginated response structures
    const templatesData = Array.isArray(response.data) 
      ? response.data 
      : response.data?.templates || response.data?.data || [];
    
    console.log('📊 Templates data extracted:', templatesData);
    console.log('📊 Number of templates:', templatesData.length);
    console.log('📊 First template:', templatesData[0]);
    
    // Transform the API response to match expected Template interface
    const transformedTemplates = (templatesData || []).map((template: any) => ({
             id: template.id.toString(),
             name: template.name,
             description: template.description,
             category: template.category || 'General', // Default category if not provided
             tags: template.tags || [template.category || 'general'], // Use category as tag if no tags
             content: template.templateData?.content || template.content || '',
             aiInstructions: template.templateData?.aiInstructions || template.aiInstructions || `Generate a comprehensive ${template.name.toLowerCase()} document.`,
             documentKey: template.documentKey || '', // Include documentKey
             generationFunction: template.generationFunction || 'getAiGenericDocument', // Include generationFunction
             templateType: template.templateType || 'ai_instruction',
             isActive: template.isActive !== undefined ? template.isActive : true,
             version: template.version || '1.0.0',
             contextPriority: template.contextPriority || 'medium', // Default priority for context building
             contextRequirements: template.contextRequirements || [],
             variables: template.templateData?.variables || template.variables || {},
             metadata: {
               framework: template.metadata?.framework || 'general',
               complexity: template.metadata?.complexity || 'medium',
               estimatedTime: template.metadata?.estimatedTime || '2-4 hours',
               dependencies: template.metadata?.dependencies || [],
               version: template.metadata?.version || '1.0.0',
               author: template.metadata?.author || 'System',
               ...template.metadata // Include any other metadata fields
             },
             createdAt: template.createdAt || new Date().toISOString(),
             updatedAt: template.updatedAt || new Date().toISOString()
           }));

    return {
      success: true,
      data: {
        templates: transformedTemplates,
        total: response.data?.total || response.pagination?.total || transformedTemplates.length,
        page: response.data?.page || response.pagination?.page || 1,
        limit: response.data?.limit || response.pagination?.limit || 20,
        totalPages: response.data?.totalPages || response.pagination?.pages || Math.ceil((response.data?.total || response.pagination?.total || transformedTemplates.length) / (response.data?.limit || response.pagination?.limit || 20))
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
    // Make real API call to backend server which saves to MongoDB
    const response = await request('/templates', {
    method: 'POST',
    body: JSON.stringify(template),
  });
    
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
    
    // Make real API call to backend server which updates MongoDB
    const response = await request(`/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(template),
  });
    
    return response;
  } catch (error) {
    console.error('❌ updateTemplate error:', error);
    return {
      success: false,
      error: 'Failed to update template'
    };
  }
}

export async function deleteTemplate(id: string, reason?: string): Promise<any> {
  try {
    
    // Make real API call to backend server which deletes from MongoDB
    const response = await request(`/templates/${id}`, {
      method: 'DELETE',
      body: reason ? JSON.stringify({ reason }) : undefined,
      headers: reason ? { 'Content-Type': 'application/json' } : undefined
    });
    
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
    // Make real API call to backend server which retrieves from MongoDB
    const response = await request(`/templates/${id}`);
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
    
    // Make real API call to backend server which retrieves from MongoDB
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.framework) queryParams.append('framework', params.framework);
    
    const url = `/projects${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await request(url);
    
    // Convert MongoDB _id to id for frontend compatibility
    if (response.success && response.data && response.data.projects) {
      response.data.projects = response.data.projects.map((project: any) => {
        if (project._id && !project.id) {
          project.id = project._id;
        }
        return project;
      });
    }
    
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
    // Make real API call to backend server which retrieves from MongoDB
    const response = await request(`/projects/${id}`);
    
    // Return the project data directly, not the full API response
    if (response.success && response.data) {
      // Convert MongoDB _id to id for frontend compatibility
      const project = response.data;
      if (project._id && !project.id) {
        project.id = project._id;
      }
      return project;
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
    // Make real API call to backend server which saves to MongoDB
    const response = await request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    
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
    // Make real API call to backend server which updates MongoDB
    const response = await request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    
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
    // Make real API call to backend server which deletes from MongoDB
    const response = await request(`/projects/${id}`, {
      method: 'DELETE',
    });
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
  const endpoint = projectId ? `/standards/analyze?projectId=${projectId}` : '/standards/dashboard';
  return request(endpoint);
}

export async function generateComplianceReport(projectId: string, standards?: string[]): Promise<any> {
  return request('/standards/report', {
    method: 'POST',
    body: JSON.stringify({ projectId, standards }),
  });
}

// Feedback API endpoints
export async function submitFeedback(feedbackData: any): Promise<any> {
  return request('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
}

export async function getProjectFeedback(projectId: string): Promise<any> {
  try {
    const response = await request(`/feedback/project/${projectId}`);
    
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
  return request(`/feedback/project/${projectId}/document/${documentType}`);
}

export async function getFeedbackSummary(timeframe?: string): Promise<any> {
  const url = timeframe ? `/feedback/summary?timeframe=${timeframe}` : '/feedback/summary';
  return request(url);
}

export async function getFeedbackTrends(timeframe?: string): Promise<any> {
  const url = timeframe ? `/feedback/trends?timeframe=${timeframe}` : '/feedback/trends';
  return request(url);
}

export async function getDocumentPerformance(timeframe?: string): Promise<any> {
  const url = timeframe ? `/feedback/performance?timeframe=${timeframe}` : '/feedback/performance';
  return request(url);
}

// Template Statistics API endpoints
export async function getTemplateStats(): Promise<any> {
  return request('/templates/stats');
}

export async function getTemplateCategories(): Promise<any> {
  return request('/templates/categories');
}

// Project Documents API functions
export async function getProjectDocuments(projectId: string): Promise<any> {
  try {
    const response = await request(`/projects/${projectId}/documents`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to retrieve project documents');
    }
  } catch (error: any) {
    console.error('❌ getProjectDocuments error:', error);
    
    // Provide more specific error information
    if (error.response?.status === 503) {
      console.error('Database connection error - service unavailable');
      throw new Error('Database connection error. Please try again later.');
    } else if (error.response?.status === 400) {
      console.error('Bad request error:', error.response.data);
      throw new Error(error.response.data?.message || 'Invalid request parameters');
    } else if (error.response?.status === 500) {
      console.error('Internal server error:', error.response.data);
      throw new Error(error.response.data?.message || 'Internal server error occurred');
    }
    
    throw new Error(error.message || 'Failed to retrieve project documents');
  }
}

export async function createProjectDocument(projectId: string, documentData: any): Promise<any> {
  try {
    const response = await request(`/projects/${projectId}/documents`, {
    method: 'POST',
      body: JSON.stringify(documentData),
    });
    
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
    const response = await request(`/projects/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
    
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
    const response = await request(`/projects/documents/${documentId}`, {
      method: 'DELETE'
    });
    
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
    const response = await request(`/projects/documents/${documentId}/restore`, {
      method: 'PUT'
    });
    
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
    const response = await request(`/projects/${projectId}/documents/deleted`);
    
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
    const response = await request(`/projects/${projectId}/documents/stats`);
    
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
  getDocumentById,
  
  // Standards Compliance
  getStandardsCompliance,
  generateComplianceReport,
  
  // Feedback
  submitFeedback,
  getProjectFeedback,
  getDocumentFeedback,
  getFeedbackSummary,
  getFeedbackTrends,
  getDocumentPerformance,
  
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
  
  // Stakeholder Management
  getProjectStakeholders,
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
  getStakeholderAnalytics,
};

// Quality Assessment API functions
export async function assessDocumentQuality(documentId: string): Promise<any> {
  try {
    console.log('🔍 assessDocumentQuality called for document:', documentId);
    const response = await request(`/quality/assess/${documentId}`, {
      method: 'POST',
    });
    console.log('✅ Document quality assessment response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error assessing document quality:', error);
    throw error;
  }
}

export async function getDocumentQuality(documentId: string): Promise<any> {
  try {
    console.log('🔍 getDocumentQuality called for document:', documentId);
    const response = await request(`/quality/document/${documentId}`, {
      method: 'GET',
    });
    console.log('✅ Document quality response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error getting document quality:', error);
    throw error;
  }
}

export async function getProjectQualityStats(projectId: string): Promise<any> {
  try {
    console.log('🔍 getProjectQualityStats called for project:', projectId);
    const response = await request(`/quality/project/${projectId}/stats`, {
      method: 'GET',
    });
    console.log('✅ Project quality stats response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error getting project quality stats:', error);
    throw error;
  }
}

export async function reassessProjectQuality(projectId: string): Promise<any> {
  try {
    console.log('🔍 reassessProjectQuality called for project:', projectId);
    const response = await request(`/quality/project/${projectId}/reassess`, {
      method: 'POST',
    });
    console.log('✅ Project quality reassessment response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error reassessing project quality:', error);
    throw error;
  }
}

export async function getDocumentById(documentId: string): Promise<any> {
  try {
    console.log('🔍 getDocumentById called for document:', documentId);
    const response = await request(`/projects/documents/${documentId}`, {
      method: 'GET',
    });
    console.log('✅ Document by ID response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error getting document by ID:', error);
    throw error;
  }
}

// Stakeholder Management API functions
export async function getProjectStakeholders(projectId: string): Promise<any> {
  try {
    console.log('🔍 getProjectStakeholders called for project:', projectId);
    const response = await request(`/stakeholders/project/${projectId}`, {
      method: 'GET',
    });
    console.log('✅ Project stakeholders response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error getting project stakeholders:', error);
    throw error;
  }
}

export async function createStakeholder(projectId: string, stakeholderData: any): Promise<any> {
  try {
    console.log('🔍 createStakeholder called for project:', projectId);
    const response = await request(`/stakeholders/project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(stakeholderData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ Create stakeholder response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error creating stakeholder:', error);
    throw error;
  }
}

export async function updateStakeholder(stakeholderId: string, stakeholderData: any): Promise<any> {
  try {
    console.log('🔍 updateStakeholder called for stakeholder:', stakeholderId);
    const response = await request(`/stakeholders/${stakeholderId}`, {
      method: 'PUT',
      body: JSON.stringify(stakeholderData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ Update stakeholder response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error updating stakeholder:', error);
    throw error;
  }
}

export async function deleteStakeholder(stakeholderId: string): Promise<any> {
  try {
    console.log('🔍 deleteStakeholder called for stakeholder:', stakeholderId);
    const response = await request(`/stakeholders/${stakeholderId}`, {
      method: 'DELETE',
    });
    console.log('✅ Delete stakeholder response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting stakeholder:', error);
    throw error;
  }
}

export async function getStakeholderAnalytics(projectId: string): Promise<any> {
  try {
    console.log('🔍 getStakeholderAnalytics called for project:', projectId);
    const response = await request(`/stakeholders/analytics/${projectId}`, {
      method: 'GET',
    });
    console.log('✅ Stakeholder analytics response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error getting stakeholder analytics:', error);
    throw error;
  }
}

// Soft deleted templates API endpoints
export async function getDeletedTemplates(params?: {
  category?: string;
  deletedBy?: string;
  daysSinceDeleted?: number;
  limit?: number;
  offset?: number;
}): Promise<any> {
  try {
    console.log('🔍 Get deleted templates with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.deletedBy) queryParams.append('deletedBy', params.deletedBy);
    if (params?.daysSinceDeleted) queryParams.append('daysSinceDeleted', params.daysSinceDeleted.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const url = `/templates/deleted${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await request(url);
    
    console.log('✅ Deleted templates retrieved:', response);
    
    return {
      success: true,
      data: response.data || [],
      pagination: response.pagination || {}
    };
  } catch (error) {
    console.error('❌ getDeletedTemplates error:', error);
    return {
      success: false,
      error: 'Failed to retrieve deleted templates'
    };
  }
}

export async function restoreTemplate(templateId: string): Promise<any> {
  try {
    console.log(`🔍 Restore template: ${templateId}`);
    
    const response = await request(`/templates/${templateId}/restore`, {
      method: 'PUT'
    });
    
    console.log('✅ Template restored:', response);
    
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('❌ restoreTemplate error:', error);
    return {
      success: false,
      error: 'Failed to restore template'
    };
  }
}

export default apiClient;