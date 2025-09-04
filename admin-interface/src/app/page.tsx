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
import ModernHero from '@/components/ModernHero';
import ModernFeatureShowcase from '@/components/ModernFeatureShowcase';
import ModernStatsOverview from '@/components/ModernStatsOverview';
import { Plus, Search, Filter, BarChart3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  console.log('🏠 HomePage component mounted/re-rendered');
  console.log('🌍 Environment check:', {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_KEY: process.env.NEXT_PUBLIC_API_KEY ? 'Present' : 'Missing'
  });
  
  const router = useRouter();
  
  // All state declarations first
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
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

  const handleLaunchWebInterface = () => {
    router.push('/web-interface');
  };

  const handleShowAdvancedStats = () => {
    setShowAdvancedStats(!showAdvancedStats);
  };

  // Debug function to test API connectivity
  const testApiConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/v1/health`, {
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
        // Incremental diagnostics for failed response
        let errorDetails = '';
        try {
          errorDetails = await response.text();
        } catch (e) {
          errorDetails = 'Could not read error body.';
        }
        console.error('❌ API Health Test Failed:', response.status, response.statusText, errorDetails);
        toast.error(`API test failed: ${response.status} ${response.statusText}\nDetails: ${errorDetails}`);

        // Step 1: Check if backend is running
        if (response.status === 404 || response.status === 502 || response.status === 503) {
          toast(`Step 1: Is the backend server running and accessible at ${apiUrl}?\nTry: ${apiUrl}/api/v1/health\nOr run: curl -H 'Content-Type: application/json' -H 'X-API-Key: dev-api-key-123' ${apiUrl}/health`);
        }
        // Step 2: Check CORS/network issues
        if (response.status === 0) {
          toast('Step 2: Possible CORS or network error. Check browser console and backend CORS settings.');
        }
        // Step 3: Check API key
        if (response.status === 401 || response.status === 403) {
          toast('Step 3: API key may be missing or invalid. Check backend authentication.');
        }
      }
    } catch (error) {
      // Incremental diagnostics for fetch/network errors
      console.error('❌ API Connection Error:', error);
      toast.error(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      toast(`Step 1: Is the backend server running and accessible at ${apiUrl}?`);
      toast('Step 2: Check your network connection and browser console for errors.');
      toast('Step 3: If using Docker or a remote server, check port mappings and firewall.');
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
        {/* Modern Hero Section */}
        <ModernHero 
          onLaunchWebInterface={handleLaunchWebInterface}
          onShowStats={handleShowAdvancedStats}
        />

        {/* Advanced Stats Section */}
        <AnimatePresence>
          {showAdvancedStats && (
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <ModernStatsOverview />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Feature Showcase */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-electric-50 to-neon-50 px-4 py-2 rounded-full border border-electric-200 text-electric-700 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Modern Features</span>
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Tools for{' '}
              <span className="bg-gradient-to-r from-electric-600 via-neon-600 to-cyber-600 bg-clip-text text-transparent">
                Modern Teams
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline requirements gathering and boost team productivity
            </p>
          </motion.div>
          <ModernFeatureShowcase />
        </motion.div>

        {/* Template Management Section */}
        <motion.div 
          className="bg-white/60 backdrop-blur-sm rounded-4xl p-8 shadow-xl border border-gray-200/50 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Section Header */}
          <motion.div 
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div>
              <motion.h2 
                className="text-4xl font-bold gradient-text mb-3"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                Template Management
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-xl"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                Manage your ADPA enterprise framework templates
              </motion.p>
            </div>
            
            <motion.div 
              className="flex items-center space-x-4 mt-6 lg:mt-0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
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
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-electric-600 to-neon-600 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white hover:from-electric-700 hover:to-neon-700 transition-all duration-300 btn-modern animate-glow"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </motion.button>
            </motion.div>
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
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {/* Template List */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
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
              transition={{ duration: 0.6, delay: 0.9 }}
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
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-electric-600 to-neon-600 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-electric-700 hover:to-neon-700 transition-all duration-300 btn-modern animate-glow"
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
      </motion.div>
    </div>
  );
}
