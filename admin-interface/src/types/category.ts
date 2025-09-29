export interface Category {
  id: string;
  name: string;
  description: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  isSystem: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface CategoryFilters {
  search?: string;
  isActive?: boolean;
}

export interface CategoryPagination {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
