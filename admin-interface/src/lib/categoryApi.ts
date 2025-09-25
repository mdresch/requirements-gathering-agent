import { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryFilters, CategoryPagination } from '@/types/category';

const API_BASE_URL = typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:3002/api/v1';

export class CategoryApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get all categories with pagination and filtering
   */
  async getCategories(filters?: CategoryFilters, pagination?: CategoryPagination): Promise<{
    success: boolean;
    data: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    requestId: string;
    timestamp: string;
  }> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sort) params.append('sort', pagination.sort);
      if (pagination.order) params.append('order', pagination.order);
    }

    const response = await fetch(`${this.baseUrl}/categories?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get only active categories (for dropdowns)
   */
  async getActiveCategories(): Promise<{
    success: boolean;
    data: Category[];
    requestId: string;
    timestamp: string;
  }> {
    const response = await fetch(`${this.baseUrl}/categories/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch active categories: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<{
    success: boolean;
    data: Category;
    requestId: string;
    timestamp: string;
  }> {
    const response = await fetch(`${this.baseUrl}/categories/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create new category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<{
    success: boolean;
    data: Category;
    requestId: string;
    timestamp: string;
  }> {
    const response = await fetch(`${this.baseUrl}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Failed to create category: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update category
   */
  async updateCategory(id: string, categoryData: UpdateCategoryRequest): Promise<{
    success: boolean;
    data: Category;
    requestId: string;
    timestamp: string;
  }> {
    const response = await fetch(`${this.baseUrl}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Failed to update category: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<{
    success: boolean;
    message: string;
    requestId: string;
    timestamp: string;
  }> {
    const response = await fetch(`${this.baseUrl}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Failed to delete category: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const categoryApiClient = new CategoryApiClient();
