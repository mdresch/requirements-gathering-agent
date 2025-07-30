// api.ts
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\lib\api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-123';

// Enhanced request function with better error handling
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  console.log(`🔑 API Key: ${API_KEY ? 'Present' : 'Missing'}`);
  console.log(`🌍 Base URL: ${API_BASE_URL}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        ...options.headers,
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send credentials for now
    });

    console.log(`📡 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ API request failed:', {
      url,
      error: errorMessage,
      stack: errorStack,
      apiKey: API_KEY ? 'Present' : 'Missing',
      baseUrl: API_BASE_URL
    });
    throw error;
  }
}

export async function getTemplates(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<any> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.category) searchParams.append('category', params.category);
  if (params?.search) searchParams.append('search', params.search);

  const queryString = searchParams.toString();
  const endpoint = `/templates${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await request(endpoint);
    
    // Transform API response to match frontend expectations
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          templates: response.data,
          totalPages: response.pagination ? response.pagination.pages : 1,
          total: response.pagination ? response.pagination.total : response.data.length
        }
      };
    } else {
      return {
        success: false,
        error: 'Failed to load templates'
      };
    }
  } catch (error) {
    console.error('❌ getTemplates error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function createTemplate(template: any): Promise<any> {
  return request('/templates', {
    method: 'POST',
    body: JSON.stringify(template),
  });
}

export async function updateTemplate(id: string, template: any): Promise<any> {
  return request(`/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(template),
  });
}

export async function deleteTemplate(id: string): Promise<any> {
  return request(`/templates/${id}`, {
    method: 'DELETE',
  });
}

export async function getTemplate(id: string): Promise<any> {
  return request(`/templates/${id}`);
}

// Standards Compliance API endpoints
export async function getStandardsCompliance(projectId?: string): Promise<any> {
  const endpoint = projectId ? `/standards/analyze?projectId=${projectId}` : '/standards/dashboard';
  return request(endpoint);
}

export async function generateExecutiveReport(projectId: string): Promise<any> {
  return request('/standards/reports/executive-summary', {
    method: 'POST',
    body: JSON.stringify({ projectId }),
  });
}

// Standards Compliance Dashboard API endpoints
export async function getStandardsDashboard(timeframe: string = '30d'): Promise<any> {
  try {
    const response = await request(`/standards/dashboard?timeframe=${timeframe}`);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: 'Failed to load compliance dashboard' };
  }
}

export async function getExecutiveSummary(): Promise<any> {
  try {
    const response = await request('/standards/reports/executive-summary');
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: 'Failed to load executive summary' };
  }
}

export async function generateComplianceReport(): Promise<any> {
  try {
    const response = await request('/standards/reports/generate', {
      method: 'POST',
    });
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: 'Failed to generate compliance report' };
  }
}

export async function getComplianceTrends(timeframe: string = '30d'): Promise<any> {
  try {
    const response = await request(`/standards/trends?timeframe=${timeframe}`);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: 'Failed to load compliance trends' };
  }
}

export async function analyzeDocumentCompliance(documentId: string): Promise<any> {
  try {
    const response = await request(`/standards/analyze/${documentId}`, {
      method: 'POST',
    });
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: 'Failed to analyze document compliance' };
  }
}

// Document Generation API endpoints
export async function generateDocument(templateId: string, inputData: any, outputFormat: string): Promise<any> {
  return request('/documents/convert', {
    method: 'POST',
    body: JSON.stringify({
      templateId,
      inputData,
      outputFormat,
    }),
  });
}

export async function getGenerationJob(jobId: string): Promise<any> {
  return request(`/documents/jobs/${jobId}/status`);
}

export async function downloadDocument(jobId: string): Promise<any> {
  return request(`/documents/jobs/${jobId}/download`);
}

// Adobe Integration API endpoints
export async function getAdobeStatus(): Promise<any> {
  return request('/adobe/status');
}

export async function generateAdobeDocument(templateId: string, data: any): Promise<any> {
  return request('/adobe/generate-document', {
    method: 'POST',
    body: JSON.stringify({ templateId, data }),
  });
}

// System Health API endpoints
export async function getSystemHealth(): Promise<any> {
  return request('/health/detailed');
}

export async function getSystemMetrics(): Promise<any> {
  return request('/health/metrics');
}

// API Health Check
export async function checkApiHealth(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('🏥 Performing API health check...');
    const response = await request('/health');
    return { 
      success: true, 
      message: 'API is healthy', 
      details: response 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ API health check failed:', errorMessage);
    return { 
      success: false, 
      message: `API health check failed: ${errorMessage}`,
      details: {
        baseUrl: API_BASE_URL,
        endpoint: '/health',
        timestamp: new Date().toISOString()
      }
    };
  }
}


// Projects API endpoints
export async function getProjects(params?: any): Promise<any> {
  // This would connect to a future projects API endpoint
  return Promise.resolve({
    success: true,
    data: {
      projects: [],
      totalPages: 1
    }
  });
}

// Fetch a single project by ID
export async function getProjectById(id: string): Promise<any> {
  try {
    const response = await request(`/projects/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function createProject(projectData: any): Promise<any> {
  // Placeholder for project creation
  return Promise.resolve({ success: true });
}

export async function updateProject(id: string, projectData: any): Promise<any> {
  // Placeholder for project updates
  return Promise.resolve({ success: true });
}

export async function deleteProject(id: string): Promise<any> {
  // Placeholder for project deletion
  return Promise.resolve({ success: true });
}

// Template statistics endpoint
export async function getTemplateStats(): Promise<any> {
  try {
    const response = await request('/templates/stats');
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: 'Failed to load template statistics' };
  }
}

// Export extended apiClient with all endpoints
export const apiClient = {
  // Existing template endpoints
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
  getTemplateStats,

  // New standards compliance endpoints
  getStandardsCompliance,
  generateExecutiveReport,
  getStandardsDashboard,
  getExecutiveSummary,
  generateComplianceReport,
  getComplianceTrends,
  analyzeDocumentCompliance,

  // Document generation endpoints
  generateDocument,
  getGenerationJob,
  downloadDocument,

  // Adobe integration endpoints
  getAdobeStatus,
  generateAdobeDocument,

  // System health endpoints
  getSystemHealth,
  getSystemMetrics,

  // Project management endpoints
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,

  // API health check
  checkApiHealth,
};