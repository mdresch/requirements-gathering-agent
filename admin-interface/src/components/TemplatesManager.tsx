// Templates Manager Component - Integrates existing template functionality
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\TemplatesManager.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Template, TemplateSearchParams } from '@/types/template';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import TemplateList from '@/components/TemplateList';
import TemplateEditor from '@/components/TemplateEditor';
import TemplateStats from '@/components/TemplateStats';
import SearchFilters from '@/components/SearchFilters';
import { Plus } from 'lucide-react';

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchParams, setSearchParams] = useState<TemplateSearchParams>({
    page: 1,
    limit: 20,
  });
  const [totalPages, setTotalPages] = useState(1);

  const loadTemplates = useCallback(
    async (params: TemplateSearchParams = searchParams) => {
      setLoading(true);
      try {
        const response = await apiClient.getTemplates(params);
        if (response.success && response.data) {
          setTemplates(response.data.templates);
          setTotalPages(response.data.totalPages);
        } else {
          toast.error(response.error || 'Failed to load templates');
        }
      } catch (error) {
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    },
    [searchParams]
  );

  useEffect(() => {
    loadTemplates();
  }, [searchParams, loadTemplates]);

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
    setSearchParams(prev => ({ ...prev, page }));
  };

  // If editing mode, show the editor
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </h1>
            <p className="text-gray-600 mt-1">
              {selectedTemplate 
                ? `Editing: ${selectedTemplate.name}`
                : 'Create a new document template'
              }
            </p>
          </div>
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedTemplate(null);
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
        
        <TemplateEditor
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setIsEditing(false);
            setSelectedTemplate(null);
          }}
        />
      </div>
    );
  }

  // Main templates management view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
          <p className="text-gray-600 mt-1">Manage and organize your document templates</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Template</span>
        </button>
      </div>

      {/* Template Statistics */}
      <TemplateStats />

      {/* Search and Filters */}
      <SearchFilters
        onSearch={handleSearch}
        initialParams={searchParams}
      />

      {/* Templates List */}
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
  );
}
