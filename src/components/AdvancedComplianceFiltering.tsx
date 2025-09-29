// Phase 2: Interactive Drill-down Features - Advanced Filtering and Search
// Advanced filtering capabilities for compliance data

'use client';

import { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  X, 
  Calendar, 
  Users, 
  Tag, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  RefreshCw,
  Save,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

interface FilterCriteria {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  standards: string[];
  severities: string[];
  statuses: string[];
  assignees: string[];
  projects: string[];
  scoreRange: {
    min: number;
    max: number;
  };
  keywords: string[];
  tags: string[];
}

interface SavedFilter {
  id: string;
  name: string;
  description: string;
  criteria: FilterCriteria;
  createdAt: Date;
  createdBy: string;
  isPublic: boolean;
}

interface AdvancedComplianceFilteringProps {
  onFiltersChange: (filters: FilterCriteria) => void;
  onClose?: () => void;
}

export default function AdvancedComplianceFiltering({ 
  onFiltersChange,
  onClose 
}: AdvancedComplianceFilteringProps) {
  const [filters, setFilters] = useState<FilterCriteria>({
    dateRange: { start: null, end: null },
    standards: [],
    severities: [],
    statuses: [],
    assignees: [],
    projects: [],
    scoreRange: { min: 0, max: 100 },
    keywords: [],
    tags: []
  });
  
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'saved'>('basic');
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterDescription, setNewFilterDescription] = useState('');
  const [isPublicFilter, setIsPublicFilter] = useState(false);

  const availableStandards = ['BABOK', 'PMBOK', 'DMBOK', 'ISO'];
  const availableSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'];
  const availableStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'RESOLVED', 'CLOSED'];
  const availableAssignees = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
  const availableProjects = ['current-project', 'project-alpha', 'project-beta', 'project-gamma'];
  const availableTags = ['urgent', 'review', 'compliance', 'quality', 'security', 'governance'];

  useEffect(() => {
    const loadSavedFilters = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to load real saved filters from API
        const response = await fetch('/api/v1/filters/saved');
        const result = await response.json();
        
        if (result.success && result.data?.filters) {
          setSavedFilters(result.data.filters);
        } else {
          // Fallback to mock data
          setSavedFilters(generateMockSavedFilters());
        }
      } catch (error) {
        console.error('❌ Error loading saved filters:', error);
        setError('Failed to load saved filters');
        // Use mock data as fallback
        setSavedFilters(generateMockSavedFilters());
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedFilters();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const retryLoadSavedFilters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load real saved filters from API
      const response = await fetch('/api/v1/filters/saved');
      const result = await response.json();
      
      if (result.success && result.data?.filters) {
        setSavedFilters(result.data.filters);
      } else {
        // Fallback to mock data
        setSavedFilters(generateMockSavedFilters());
      }
    } catch (error) {
      console.error('❌ Error loading saved filters:', error);
      setError('Failed to load saved filters');
      // Use mock data as fallback
      setSavedFilters(generateMockSavedFilters());
    } finally {
      setLoading(false);
    }
  };


  const generateMockSavedFilters = (): SavedFilter[] => [
    {
      id: 'filter-1',
      name: 'Critical Issues',
      description: 'Filter for all critical compliance issues',
      criteria: {
        dateRange: { start: null, end: null },
        standards: ['BABOK', 'PMBOK', 'DMBOK', 'ISO'],
        severities: ['CRITICAL'],
        statuses: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'],
        assignees: [],
        projects: [],
        scoreRange: { min: 0, max: 100 },
        keywords: [],
        tags: ['urgent']
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdBy: 'admin',
      isPublic: true
    },
    {
      id: 'filter-2',
      name: 'BABOK Compliance Review',
      description: 'Filter for BABOK-specific compliance items',
      criteria: {
        dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
        standards: ['BABOK'],
        severities: ['HIGH', 'MEDIUM'],
        statuses: ['OPEN', 'ASSIGNED'],
        assignees: [],
        projects: [],
        scoreRange: { min: 70, max: 100 },
        keywords: ['requirements', 'analysis'],
        tags: ['review']
      },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      createdBy: 'user-1',
      isPublic: false
    }
  ];

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateArrayFilter = (key: 'standards' | 'severities' | 'statuses' | 'assignees' | 'projects' | 'keywords' | 'tags', value: string, add: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: add 
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      standards: [],
      severities: [],
      statuses: [],
      assignees: [],
      projects: [],
      scoreRange: { min: 0, max: 100 },
      keywords: [],
      tags: []
    });
  };

  const saveCurrentFilter = async () => {
    if (!newFilterName.trim()) {
      setError('Filter name is required');
      return;
    }

    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}`,
      name: newFilterName,
      description: newFilterDescription,
      criteria: { ...filters },
      createdAt: new Date(),
      createdBy: 'current-user',
      isPublic: isPublicFilter
    };

    try {
      // Try to save via API
      const response = await fetch('/api/v1/filters/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFilter)
      });

      if (!response.ok) {
        throw new Error('Failed to save filter');
      }
    } catch (error) {
      console.warn('API save failed, using local save:', error);
    }

    setSavedFilters(prev => [newFilter, ...prev]);
    setNewFilterName('');
    setNewFilterDescription('');
    setIsPublicFilter(false);
    setActiveTab('saved');
  };

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.criteria);
    setActiveTab('basic');
  };

  const deleteSavedFilter = async (filterId: string) => {
    try {
      await fetch(`/api/v1/filters/saved/${filterId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('API delete failed:', error);
    }

    setSavedFilters(prev => prev.filter(filter => filter.id !== filterId));
  };

  const exportFilters = () => {
    const dataStr = JSON.stringify(filters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `compliance-filters-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importFilters = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedFilters = JSON.parse(e.target?.result as string);
        setFilters(importedFilters);
      } catch (error) {
        setError('Invalid filter file format');
      }
    };
    reader.readAsText(file);
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    
    if (filters.dateRange.start || filters.dateRange.end) {
      activeFilters.push('Date Range');
    }
    if (filters.standards.length > 0) {
      activeFilters.push(`${filters.standards.length} Standard${filters.standards.length !== 1 ? 's' : ''}`);
    }
    if (filters.severities.length > 0) {
      activeFilters.push(`${filters.severities.length} Severit${filters.severities.length !== 1 ? 'ies' : 'y'}`);
    }
    if (filters.statuses.length > 0) {
      activeFilters.push(`${filters.statuses.length} Status${filters.statuses.length !== 1 ? 'es' : ''}`);
    }
    if (filters.assignees.length > 0) {
      activeFilters.push(`${filters.assignees.length} Assignee${filters.assignees.length !== 1 ? 's' : ''}`);
    }
    if (filters.projects.length > 0) {
      activeFilters.push(`${filters.projects.length} Project${filters.projects.length !== 1 ? 's' : ''}`);
    }
    if (filters.keywords.length > 0) {
      activeFilters.push(`${filters.keywords.length} Keyword${filters.keywords.length !== 1 ? 's' : ''}`);
    }
    if (filters.tags.length > 0) {
      activeFilters.push(`${filters.tags.length} Tag${filters.tags.length !== 1 ? 's' : ''}`);
    }
    if (filters.scoreRange.min > 0 || filters.scoreRange.max < 100) {
      activeFilters.push('Score Range');
    }

    return activeFilters.length > 0 ? activeFilters.join(', ') : 'No filters applied';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Advanced Compliance Filtering
            </h2>
            <p className="text-gray-600 mt-1">
              Filter and search compliance data with advanced criteria
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Filter Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Active Filters</h3>
            <p className="text-sm text-gray-600">{getFilterSummary()}</p>
          </div>
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Filters', icon: Filter },
            { id: 'advanced', label: 'Advanced Filters', icon: Settings },
            { id: 'saved', label: 'Saved Filters', icon: Save }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Basic Filters */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          {/* Standards */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Standards</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableStandards.map((standard) => (
                <label key={standard} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.standards.includes(standard)}
                    onChange={(e) => updateArrayFilter('standards', standard, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{standard}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Severities */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Severities</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {availableSeverities.map((severity) => (
                <label key={severity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.severities.includes(severity)}
                    onChange={(e) => updateArrayFilter('severities', severity, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{severity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Statuses */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Statuses</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableStatuses.map((status) => (
                <label key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status)}
                    onChange={(e) => updateArrayFilter('statuses', status, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Score Range */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Score Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.scoreRange.min}
                  onChange={(e) => updateFilter('scoreRange', { ...filters.scoreRange, min: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.scoreRange.max}
                  onChange={(e) => updateFilter('scoreRange', { ...filters.scoreRange, max: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Date Range */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value ? new Date(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value ? new Date(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Assignees</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableAssignees.map((assignee) => (
                <label key={assignee} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.assignees.includes(assignee)}
                    onChange={(e) => updateArrayFilter('assignees', assignee, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{assignee}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Projects</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              {availableProjects.map((project) => (
                <label key={project} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.projects.includes(project)}
                    onChange={(e) => updateArrayFilter('projects', project, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{project}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Keywords</h3>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add keyword..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const keyword = e.currentTarget.value.trim();
                      if (keyword && !filters.keywords.includes(keyword)) {
                        updateArrayFilter('keywords', keyword, true);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add keyword..."]') as HTMLInputElement;
                    const keyword = input?.value.trim();
                    if (keyword && !filters.keywords.includes(keyword)) {
                      updateArrayFilter('keywords', keyword, true);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {filters.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      <span>{keyword}</span>
                      <button
                        onClick={() => updateArrayFilter('keywords', keyword, false)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableTags.map((tag) => (
                <label key={tag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.tags.includes(tag)}
                    onChange={(e) => updateArrayFilter('tags', tag, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Saved Filters */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Saved Filters</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportFilters}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <label className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importFilters}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Loading saved filters...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={retryLoadSavedFilters}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : savedFilters.length === 0 ? (
            <div className="text-center py-8">
              <Save className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Filters</h3>
              <p className="text-gray-600">Create and save your first filter to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedFilters.map((savedFilter) => (
                <div key={savedFilter.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{savedFilter.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{savedFilter.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Created by {savedFilter.createdBy}</span>
                        <span>{savedFilter.createdAt.toLocaleDateString()}</span>
                        {savedFilter.isPublic && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Public</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => loadSavedFilter(savedFilter)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteSavedFilter(savedFilter.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save Current Filter */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Save Current Filter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Name</label>
                <input
                  type="text"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  placeholder="Enter filter name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newFilterDescription}
                  onChange={(e) => setNewFilterDescription(e.target.value)}
                  placeholder="Enter filter description..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isPublicFilter}
                    onChange={(e) => setIsPublicFilter(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Make this filter public</span>
                </label>
              </div>
              <button
                onClick={saveCurrentFilter}
                disabled={!newFilterName.trim()}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
