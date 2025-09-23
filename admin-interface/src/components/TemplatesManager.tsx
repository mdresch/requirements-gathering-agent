// Templates Manager Component - Integrates existing template functionality
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\TemplatesManager.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Template, TemplateSearchParams } from '@/types/template';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import TemplateList from '@/components/TemplateList';
import TemplateEditor from '@/components/TemplateEditor';
import TemplateDetailsView from '@/components/TemplateDetailsView';
import TemplateStats from '@/components/TemplateStats';
import SearchFilters from '@/components/SearchFilters';
import { Plus, Trash2 } from 'lucide-react';
import TemplateDeleteModal from './TemplateDeleteModal';
import DeletedTemplatesModal from './DeletedTemplatesModal';

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchParams, setSearchParams] = useState<TemplateSearchParams>({
    page: 1,
    limit: 6,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showDeletedTemplates, setShowDeletedTemplates] = useState(false);

  const loadTemplates = useCallback(
    async (params: TemplateSearchParams = searchParams) => {
      setLoading(true);
      try {
        console.log('🔄 Loading templates with params:', params);
        const response = await apiClient.getTemplates(params);
        console.log('📋 Templates response:', response);
        if (response.success && response.data) {
          setTemplates(response.data.templates);
          setTotalPages(response.data.totalPages);
          console.log('✅ Templates loaded successfully:', response.data.templates.length);
          
          // Mock data is working correctly, no need to show any message
          // Templates are loaded successfully regardless of data source
        } else {
          console.error('❌ Templates response failed:', response);
          toast.error(response.error || 'Failed to load templates');
        }
      } catch (error) {
        console.error('❌ Templates loading error:', error);
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

  const handleViewDetails = (template: Template) => {
    setSelectedTemplate(template);
    setIsViewingDetails(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    // Find the template to get its name
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      toast.error('Template not found');
      return;
    }

    setTemplateToDelete({ id: templateId, name: template.name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (reason: string) => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      const response = await apiClient.deleteTemplate(templateToDelete.id, reason);
      if (response.success) {
        toast.success('Template deleted successfully');
        loadTemplates();
        setDeleteModalOpen(false);
        setTemplateToDelete(null);
      } else {
        toast.error(response.error || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setTemplateToDelete(null);
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

  const handleTemplateRestored = () => {
    // Reload templates when one is restored
    loadTemplates();
    toast.success('Template restored successfully');
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

  // If viewing details mode, show the template details
  if (isViewingDetails && selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Details</h1>
            <p className="text-gray-600 mt-1">Viewing: {selectedTemplate.name}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleEditTemplate(selectedTemplate)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Template
            </button>
            <button
              onClick={() => {
                setIsViewingDetails(false);
                setSelectedTemplate(null);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
        
        <TemplateDetailsView template={selectedTemplate} />
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
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDeletedTemplates(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Deleted Templates</span>
          </button>
          <button
            onClick={handleCreateTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Template</span>
          </button>
        </div>
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
        onViewDetails={handleViewDetails}
        onDelete={handleDeleteTemplate}
        onPageChange={handlePageChange}
        currentPage={searchParams.page || 1}
        totalPages={totalPages}
      />

      {/* Delete Confirmation Modal */}
      <TemplateDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        templateName={templateToDelete?.name || ''}
        isLoading={isDeleting}
      />

      {/* Deleted Templates Modal */}
      <DeletedTemplatesModal
        isOpen={showDeletedTemplates}
        onClose={() => setShowDeletedTemplates(false)}
        onTemplateRestored={handleTemplateRestored}
      />
    </div>
  );
}
