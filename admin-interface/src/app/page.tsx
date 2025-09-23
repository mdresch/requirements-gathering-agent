'use client';

import { useState, useEffect, useCallback } from 'react';
import { Template, TemplateSearchParams } from '@/types/template';
import templatesData from '@/data/templates.json';
import { toast } from 'react-hot-toast';
import TemplateList from '@/components/TemplateList';
import TemplateEditor from '@/components/TemplateEditor';
import TemplateStats from '@/components/TemplateStats';
import SearchFilters from '@/components/SearchFilters';
import Navbar from '@/components/Navbar';
import ModernHero from '@/components/ModernHero';
import ModernFeatureShowcase from '@/components/ModernFeatureShowcase';
import ModernStatsOverview from '@/components/ModernStatsOverview';
import DeletedTemplatesModal from '@/components/DeletedTemplatesModal';
import { Plus, Search, Filter, BarChart3, Sparkles, Trash2 } from 'lucide-react';
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
  const [showStats, setShowStats] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [searchParams, setSearchParams] = useState<TemplateSearchParams>({
    page: 1,
    limit: 20,
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
      const response = await apiClient.getTemplates({ page: 1, limit: 20 });
      
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
  }, []);

  // Load templates when component mounts
  useEffect(() => {
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

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(false);
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

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
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
          
          <div className="flex flex-wrap items-center gap-4 mt-6">
            {/* Debug info */}
            <div className="text-xs text-gray-500 bg-yellow-100 p-2 rounded">
              Debug: showDeletedTemplates = {showDeletedTemplates.toString()}
            </div>
            
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
              onClick={() => {
                console.log('🗑️ Deleted Templates button clicked!');
                setShowDeletedTemplates(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-red-500 border-2 border-red-600 rounded-xl shadow-lg text-sm font-bold text-white hover:bg-red-600 transition-all duration-300 z-50"
              style={{ minWidth: '200px', height: '48px' }}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              🗑️ Deleted Templates
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
                      setSelectedTemplate(null);
                    }}
                  />
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