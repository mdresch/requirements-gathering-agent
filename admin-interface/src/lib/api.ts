// api.ts
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\lib\api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-123';

// Enhanced request function with better error handling
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
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
  
  return request(endpoint);
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

// Export an apiClient object for compatibility with React components
export const apiClient = {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
};