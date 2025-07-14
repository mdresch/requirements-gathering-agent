'use client';

import { useState } from 'react';
import { TemplateSearchParams } from '@/types/template';
import { Search, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (params: TemplateSearchParams) => void;
  initialParams: TemplateSearchParams;
}

export default function SearchFilters({ onSearch, initialParams }: SearchFiltersProps) {
  const [filters, setFilters] = useState<TemplateSearchParams>(initialParams);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof TemplateSearchParams, value: string | number | string[] | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: TemplateSearchParams = {
      page: 1,
      limit: 20,
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.category || 
    filters.templateType ||
    (filters.tags && filters.tags.length > 0)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Search & Filters
        </h2>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search templates by name, description, or content..."
          />
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Filter by category"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
          <input
            type="text"
            value={filters.templateType || ''}
            onChange={(e) => handleFilterChange('templateType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Filter by template type"
          />
        </div>
      </div>

      {/* Extended Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={filters.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);
                  handleFilterChange('tags', tags.length > 0 ? tags : undefined);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tags separated by commas"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Results per page</label>
              <select
                value={filters.limit || 20}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                title="Select number of results per page"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h3>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {filters.search}
                <button
                  onClick={() => handleFilterChange('search', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Category: {filters.category}
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.templateType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Type: {filters.templateType}
                <button
                  onClick={() => handleFilterChange('templateType', undefined)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.tags && filters.tags.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Tags: {filters.tags.join(', ')}
                <button
                  onClick={() => handleFilterChange('tags', undefined)}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
