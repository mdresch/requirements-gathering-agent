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
import { Plus, Search, Filter, BarChart3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  console.log('🏠 HomePage component mounted/re-rendered');
  
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
    setMounted(true);
  }, []);

  const loadTemplates = useCallback(async (params?: TemplateSearchParams) => {
    setLoading(true);
    const page = params?.page ?? searchParams.page ?? 1;
    const limit = params?.limit ?? searchParams.limit ?? 20;

    // Try API first
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      const url = `${base}/api/v1/templates?page=${page}&limit=${limit}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Support both { templates: [...] } and plain array responses
        const fetched = Array.isArray(data) ? data : data.templates || [];
        setTemplates(fetched as Template[]);
        const total = typeof data.total === 'number' ? data.total : fetched.length;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
        toast.success(`Loaded ${fetched.length} templates from API`);
        setLoading(false);
        return;
      }
      throw new Error(`API returned ${res.status}`);
    } catch (err) {
      // Fallback to bundled JSON
      setTemplates(templatesData as Template[]);
      setTotalPages(Math.max(1, Math.ceil((templatesData as Template[]).length / (searchParams.limit || 20))));
      toast(`Using local templates (API unavailable)`);
      setLoading(false);
    }
  }, [searchParams.limit, searchParams.page]);

  // Load templates when component mounts or when searchParams change
  useEffect(() => {
    loadTemplates(searchParams);
  }, [loadTemplates, searchParams]);

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
    toast('Delete functionality for Wix templates is not implemented yet.');
  };

  const handleSaveTemplate = async (templateData: any) => {
    toast('Save functionality for Wix templates is not implemented yet.');
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
          
          <div className="flex items-center space-x-4 mt-6">
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
    </div>
  );
}