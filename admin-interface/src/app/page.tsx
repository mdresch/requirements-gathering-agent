'use client';

import { useState, useEffect, useCallback } from 'react';
import { Template, TemplateSearchParams } from '@/types/template';
import templatesData from '@/data/templates.json';
import { toast } from 'react-hot-toast';
import TemplateList from '@/components/TemplateList';
import TemplateEditor from '@/components/TemplateEditor';
import TemplateDetailsView from '@/components/TemplateDetailsView';
import TemplateStats from '@/components/TemplateStats';
import SearchFilters from '@/components/SearchFilters';
import Navbar from '@/components/Navbar';
import ModernHero from '@/components/ModernHero';
import ModernFeatureShowcase from '@/components/ModernFeatureShowcase';
import ModernStatsOverview from '@/components/ModernStatsOverview';
import DeletedTemplatesModal from '@/components/DeletedTemplatesModal';
import { Plus, Search, Filter, BarChart3, Sparkles, Trash2, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  
  // All state declarations first
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [searchParams, setSearchParams] = useState<TemplateSearchParams>({
    page: 1,
    limit: 6,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeletedTemplates, setShowDeletedTemplates] = useState(false);

  console.log('🏠 HomePage component mounted/re-rendered');
  console.log('🗑️ showDeletedTemplates state:', showDeletedTemplates);

  // Ensure we're fully mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      console.log('HomePage: Loading templates from API...');
      const response = await apiClient.getTemplates({ 
        page: searchParams.page, 
        limit: searchParams.limit 
      });
      
      if (response.success && response.data) {
        setTemplates(response.data.templates);
        setTotalPages(response.data.totalPages);
        console.log('HomePage: Templates loaded successfully:', response.data.templates.length);
        toast.success(`Loaded ${response.data.templates.length} templates from API`);
      } else {
        console.error('HomePage: Templates response failed:', response);
        toast.error(response.error || 'Failed to load templates');
        // Fallback to local data
        setTemplates(templatesData as Template[]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('HomePage: Templates loading error:', error);
      toast.error('Failed to load templates from API, using local data');
      // Fallback to local data
      setTemplates(templatesData as Template[]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Load templates when component mounts
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditing(true);
    setIsViewing(false);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setIsViewing(false);
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(false);
    setIsViewing(true);
    toast.success(`Viewing template: ${template.name}`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      console.log('HomePage: Deleting template with id:', templateId);
      
      const response = await apiClient.deleteTemplate(templateId, 'Deleted from homepage');
      
      if (response.success) {
        toast.success('Template deleted successfully');
        // Reload templates
        loadTemplates();
      } else {
        toast.error(response.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('HomePage: Delete template error:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleTemplateRestored = () => {
    // Reload templates when one is restored
    loadTemplates();
    toast.success('Template restored successfully');
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      console.log('HomePage: Saving template with data:', templateData);
      
      const response = selectedTemplate
        ? await apiClient.updateTemplate(selectedTemplate.id, templateData)
        : await apiClient.createTemplate(templateData);

      if (response.success) {
        toast.success(selectedTemplate ? 'Template updated successfully' : 'Template created successfully');
        setIsEditing(false);
        setSelectedTemplate(null);
        // Reload templates
        loadTemplates();
      } else {
        toast.error(response.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('HomePage: Save template error:', error);
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

  const handleManageCategories = () => {
    router.push('/categories');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ADPA Template Management</h1>
                <p className="text-gray-600">Enterprise framework template management and administration</p>
              </div>
            </div>
            <motion.button
              onClick={loadTemplates}
              disabled={loading}
              className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </motion.button>
          </div>

          {/* Quick Stats Bar */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">System Overview</h3>
                  <p className="text-sm text-gray-600">Template management and enterprise framework administration</p>
                </div>
              </div>
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-right">
                  <div className="text-sm text-gray-600">System Status</div>
                  <div className="text-lg font-bold text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Operational
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">Enterprise</div>
                <div className="text-sm text-gray-600">Framework</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">Template</div>
                <div className="text-sm text-gray-600">Management</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">Advanced</div>
                <div className="text-sm text-gray-600">Analytics</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 1.0 }}
                />
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">Real-time</div>
                <div className="text-sm text-gray-600">Monitoring</div>
                <motion.div
                  className="h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 1.1 }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Performance Indicator */}
          <motion.div
            className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold">ADPA System Active</h3>
                  <p className="text-green-100">Enterprise template management system operational</p>
                </div>
              </div>
              <motion.div
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="text-3xl font-bold">100%</div>
                <div className="text-green-100">system efficiency</div>
              </motion.div>
            </div>
          </motion.div>

          {/* System Features Overview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Template Management</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Comprehensive template creation, editing, and management with enterprise-grade features and PMBOK compliance.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Advanced Analytics</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Real-time analytics and performance metrics with comprehensive reporting and trend analysis capabilities.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200/50"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Smart Search</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Intelligent search and filtering capabilities with advanced template discovery and categorization features.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

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
        <div className="mb-16">
          <ModernFeatureShowcase />
        </div>

        {/* Template Management Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-4xl p-8 shadow-xl border border-gray-200/50 mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-3">
            Template Management
          </h1>
          <p className="text-gray-600 text-xl">
            Manage your ADPA enterprise framework templates
          </p>
          
          <div className="flex flex-wrap items-center justify-end gap-4 mt-6">
            <button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            <button
              onClick={handleManageCategories}
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Categories
            </button>
            
            <button
              onClick={() => {
                console.log('🗑️ Deleted Templates button clicked!');
                setShowDeletedTemplates(true);
              }}
              className="inline-flex items-center justify-center px-3 py-3 bg-red-500 border-2 border-red-600 rounded-xl shadow-lg text-sm font-bold text-white hover:bg-red-600 transition-all duration-300 z-50"
              style={{ width: '48px', height: '48px' }}
              title="Deleted Templates"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <AnimatePresence>
          {showStats && (
            <div className="mb-12">
              <TemplateStats />
            </div>
          )}
        </AnimatePresence>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <div className="mb-12">
              <SearchFilters
                onSearch={handleSearch}
                initialParams={searchParams}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Template List */}
          <div className="lg:col-span-2">
            <TemplateList
              templates={templates}
              loading={loading}
              onEdit={handleEditTemplate}
              onViewDetails={handleViewTemplate}
              onDelete={handleDeleteTemplate}
              onPageChange={handlePageChange}
              currentPage={searchParams.page || 1}
              totalPages={totalPages}
              selectedTemplate={selectedTemplate}
            />
          </div>

          {/* Template Editor/Preview */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <div key="editor">
                  <TemplateEditor
                    template={selectedTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={() => {
                      setIsEditing(false);
                      setIsViewing(false);
                      setSelectedTemplate(null);
                    }}
                  />
                </div>
              ) : isViewing && selectedTemplate ? (
                <div key="viewer">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Template Details</h3>
                        <p className="text-gray-600 text-sm">Read-only preview</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTemplate(selectedTemplate)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setIsViewing(false);
                            setSelectedTemplate(null);
                          }}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <TemplateDetailsView template={selectedTemplate} />
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  key="placeholder"
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8"
                >
                  <div className="text-center py-16">
                    <div className="mx-auto h-16 w-16 text-gray-400 mb-6">
                      <Search className="w-full h-full" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      No template selected
                    </h3>
                    <p className="text-gray-500 text-lg mb-6">
                      Select a template to view details or create a new one.
                    </p>
                    <button
                      onClick={handleCreateTemplate}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Template
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Deleted Templates Modal */}
      <DeletedTemplatesModal
        isOpen={showDeletedTemplates}
        onClose={() => setShowDeletedTemplates(false)}
        onTemplateRestored={handleTemplateRestored}
      />
    </div>
  );
}