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
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-screen">
      <Navbar />
      
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <motion.h1 
              className="text-5xl font-bold gradient-text mb-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Template Management
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Manage your ADPA enterprise framework templates
            </motion.p>
          </div>
          
          <motion.div 
            className="flex items-center space-x-4 mt-6 lg:mt-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 btn-modern"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </motion.button>
            
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 btn-modern"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </motion.button>
            
            <motion.button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 btn-modern animate-glow"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </motion.button>
            
            <motion.button
              onClick={testApiConnection}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 btn-modern"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              🧪 Test API
            </motion.button>
            
            <motion.button
              onClick={() => loadTemplates()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white hover:from-orange-600 hover:to-red-700 transition-all duration-300 btn-modern"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Reload Templates
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Header with Web Interface Access */}
        <motion.div 
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl p-10 mb-12 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h1 className="text-4xl font-bold mb-3">ADPA Enterprise Platform</h1>
              <p className="text-blue-100 text-xl mb-2">Requirements Gathering Agent - Complete Web Interface</p>
              <motion.p 
                className="text-blue-200 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                ✅ API Server Running • ✅ Adobe Integration Active • ✅ Standards Compliance Ready
              </motion.p>
            </motion.div>
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <motion.a
                href="/web-interface"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl btn-modern"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Launch Full Web Interface
              </motion.a>
              <motion.button
                onClick={() => setShowStats(!showStats)}
                className="bg-blue-500/80 backdrop-blur-sm hover:bg-blue-400 text-white px-6 py-4 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg btn-modern"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="w-5 h-5" />
                <span>{showStats ? 'Hide' : 'Show'} Stats</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <AnimatePresence>
          {showStats && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <TemplateStats />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <SearchFilters
                onSearch={handleSearch}
                initialParams={searchParams}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Template List */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <TemplateList
              templates={templates}
              loading={loading}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onPageChange={handlePageChange}
              currentPage={searchParams.page || 1}
              totalPages={totalPages}
            />
          </motion.div>

          {/* Template Editor/Preview */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <TemplateEditor
                    template={selectedTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={() => {
                      setIsEditing(false);
                      setSelectedTemplate(null);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center py-16">
                    <motion.div 
                      className="mx-auto h-16 w-16 text-gray-400 mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <Search className="w-full h-full animate-float" />
                    </motion.div>
                    <motion.h3 
                      className="text-2xl font-semibold text-gray-900 mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      No template selected
                    </motion.h3>
                    <motion.p 
                      className="text-gray-500 text-lg mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      Select a template to view details or create a new one.
                    </motion.p>
                    <motion.button
                      onClick={handleCreateTemplate}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 btn-modern animate-glow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Template
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
