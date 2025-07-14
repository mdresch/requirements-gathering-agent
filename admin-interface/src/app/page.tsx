'use client';

import { useState, useEffect, useCallback } from 'react';
import { Template, TemplateSearchParams } from '@/types/template';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import TemplateList from '@/components/TemplateList';
import TemplateEditor from '@/components/TemplateEditor';
import TemplateStats from '@/components/TemplateStats';
import SearchFilters from '@/components/SearchFilters';
import Navbar from '@/components/Navbar';
import { Plus, Search, Filter, BarChart3 } from 'lucide-react';

export default function HomePage() {
  console.log('🏠 HomePage component mounted/re-rendered');
  console.log('🌍 Environment check:', {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_KEY: process.env.NEXT_PUBLIC_API_KEY ? 'Present' : 'Missing'
  });
  
  // All state declarations first
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [searchParams, setSearchParams] = useState<TemplateSearchParams>({
    page: 1,
    limit: 20,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Ensure we're fully mounted on client side
  useEffect(() => {
    console.log('🔄 Component mounting...');
    setMounted(true);
  }, []);


  const loadTemplates = useCallback(
    async (params: TemplateSearchParams = searchParams) => {
      console.log('🚀 loadTemplates called with params:', params);
      setLoading(true);
      try {
        console.log('🔍 Loading templates with params:', params);
        const response = await apiClient.getTemplates(params);
        console.log('📡 API Response:', response);
        
        if (response.success && response.data) {
          setTemplates(response.data.templates);
          setTotalPages(response.data.totalPages || 1);
          toast.success(`Loaded ${response.data.templates.length} templates`);
        } else {
          console.error('❌ Failed to load templates:', response);
          toast.error(response.error || 'Failed to load templates');
          
          // Fallback to mock data for demo purposes
          const mockTemplates = [
            {
              id: 'mock-1',
              name: 'Demo Template 1',
              description: 'This is a demo template for testing purposes',
              category: 'demo',
              tags: ['demo', 'test'],
              content: 'Demo template content',
              aiInstructions: 'Demo AI instructions',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              templateType: 'demo',
              version: '1.0'
            },
            {
              id: 'mock-2',
              name: 'Demo Template 2',
              description: 'Another demo template',
              category: 'demo',
              tags: ['demo'],
              content: 'Demo template content 2',
              aiInstructions: 'Demo AI instructions 2',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              templateType: 'demo',
              version: '1.0'
            }
          ];
          setTemplates(mockTemplates);
          setTotalPages(1);
          toast.error('Using demo data - API connection failed');
        }
      } catch (error) {
        console.error('❌ Network error loading templates:', error);
        toast.error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Fallback to mock data
        const mockTemplates = [
          {
            id: 'offline-1',
            name: 'Offline Demo Template',
            description: 'Demo template - API server may be offline',
            category: 'offline',
            tags: ['offline', 'demo'],
            content: 'Offline demo template content',
            aiInstructions: 'Offline demo AI instructions',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            templateType: 'offline',
            version: '1.0'
          }
        ];
        setTemplates(mockTemplates);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [searchParams]
  );

  // Load templates when component mounts
  useEffect(() => {
    console.log('🔥 useEffect: component mounted, loading templates');
    loadTemplates();
  }, [loadTemplates]);

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditing(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await apiClient.deleteTemplate(templateId);
      if (response.success) {
        toast.success('Template deleted successfully');
        loadTemplates();
      } else {
        toast.error(response.error || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      const response = selectedTemplate
        ? await apiClient.updateTemplate(selectedTemplate.id, templateData)
        : await apiClient.createTemplate(templateData);

      if (response.success) {
        toast.success(selectedTemplate ? 'Template updated successfully' : 'Template created successfully');
        setIsEditing(false);
        setSelectedTemplate(null);
        loadTemplates();
      } else {
        toast.error(response.error || 'Failed to save template');
      }
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleSearch = (params: TemplateSearchParams) => {
    setSearchParams({ ...params, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, page });
  };

  // Debug function to test API connectivity
  const testApiConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      const response = await fetch('http://localhost:3000/api/v1/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'dev-api-key-123'
        },
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Health Test Successful:', data);
        toast.success('API connection successful!');
      } else {
        console.error('❌ API Health Test Failed:', response.status, response.statusText);
        toast.error(`API test failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ API Connection Error:', error);
      toast.error(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Template Management
            </h1>
            <p className="text-gray-600">
              Manage your ADPA enterprise framework templates
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </button>
            
            <button
              onClick={testApiConnection}
              className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              🧪 Test API
            </button>
            
            <button
              onClick={() => loadTemplates()}
              className="inline-flex items-center px-4 py-2 bg-orange-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              🔄 Reload Templates
            </button>
          </div>
        </div>

        {/* Header with Web Interface Access */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold mb-2">ADPA Enterprise Platform</h1>
              <p className="text-blue-100 text-lg">Requirements Gathering Agent - Complete Web Interface</p>
              <p className="text-blue-200 text-sm mt-2">✅ API Server Running • ✅ Adobe Integration Active • ✅ Standards Compliance Ready</p>
            </div>
            <div className="flex space-x-3">
              <a
                href="/web-interface"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
              >
                🚀 Launch Full Web Interface
              </a>
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span>{showStats ? 'Hide' : 'Show'} Stats</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {showStats && (
          <div className="mb-8">
            <TemplateStats />
          </div>
        )}

        {/* Filters Section */}
        {showFilters && (
          <div className="mb-8">
            <SearchFilters
              onSearch={handleSearch}
              initialParams={searchParams}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template List */}
          <div className="lg:col-span-2">
            <TemplateList
              templates={templates}
              loading={loading}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onPageChange={handlePageChange}
              currentPage={searchParams.page || 1}
              totalPages={totalPages}
            />
          </div>

          {/* Template Editor/Preview */}
          <div className="lg:col-span-1">
            {isEditing ? (
              <TemplateEditor
                template={selectedTemplate}
                onSave={handleSaveTemplate}
                onCancel={() => {
                  setIsEditing(false);
                  setSelectedTemplate(null);
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <Search className="w-full h-full" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No template selected
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Select a template to view details or create a new one.
                  </p>
                  <button
                    onClick={handleCreateTemplate}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
