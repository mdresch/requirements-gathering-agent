// Templates Manager Component - Integrates existing template functionality
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\src\components\TemplatesManager.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Template, TemplateSearchParams } from '@/types/template';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import TemplateList from '@/components/TemplateList';
import TemplateEditor from '@/components/TemplateEditor';
import TemplateDetailsView from '@/components/TemplateDetailsView';
import TemplateStats from '@/components/TemplateStats';
import SearchFilters from '@/components/SearchFilters';
import { Plus, Trash2, FolderOpen, Play } from 'lucide-react';
import TemplateDeleteModal from './TemplateDeleteModal';
import DeletedTemplatesModal from './DeletedTemplatesModal';
import TemplateDocumentGenerationModal from './TemplateDocumentGenerationModal';

export default function TemplatesManager() {
  const router = useRouter();
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
  const [totalCount, setTotalCount] = useState(0);
  const [showDeletedTemplates, setShowDeletedTemplates] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [templateForGeneration, setTemplateForGeneration] = useState<Template | null>(null);

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
          setTotalCount(response.data.total);
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

  const handleManageCategories = () => {
    router.push('/categories');
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleViewDetails = (template: Template) => {
    setSelectedTemplate(template);
    setIsViewingDetails(true);
  };

  const handleGenerateDocument = (template: Template) => {
    console.log('🚀 Generate Document clicked for template:', template.name);
    console.log('🚀 Template object:', template);
    console.log('🚀 Template ID:', template.id);
    
    // Set the template and open modal
    setTemplateForGeneration(template);
    setShowGenerationModal(true);
    
    console.log('🚀 Modal should be opening now');
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
        console.log('📝 TemplatesManager: Response received:', response);
        console.log('📝 TemplatesManager: Response data message:', response.data?.message);
        
        // Check if this was a "no changes" response
        if (response.data?.message === 'No changes detected, template preserved') {
          console.log('📝 TemplatesManager: No changes detected, showing info toast');
          toast('No changes detected - template preserved', { type: 'info' });
        } else {
          console.log('📝 TemplatesManager: Changes detected, showing success toast');
          toast.success(selectedTemplate ? 'Template updated successfully' : 'Template created successfully');
        }
        
        // Update the selectedTemplate with fresh data from database
        if (selectedTemplate && response.success) {
          console.log('🔄 Fetching fresh template data from database...');
          try {
            // Fetch the template again to ensure we have the latest data
            const freshTemplate = await apiClient.getTemplate(selectedTemplate.id);
            console.log('🔄 Fresh template API response:', freshTemplate);
            if (freshTemplate.success && freshTemplate.data) {
              console.log('🔄 Fresh template data received:', {
                id: freshTemplate.data._id || freshTemplate.data.id,
                name: freshTemplate.data.name,
                contentLength: freshTemplate.data.content?.length || 0,
                contentPreview: freshTemplate.data.content?.substring(0, 100) + '...',
                aiInstructionsLength: freshTemplate.data.aiInstructions?.length || 0,
                fullFreshTemplate: freshTemplate.data
              });
              setSelectedTemplate(freshTemplate.data);
            } else {
              console.log('❌ Fresh template fetch failed, using response data');
              // Fallback to response data if fresh fetch fails
              setSelectedTemplate(response.data);
            }
          } catch (error) {
            console.error('❌ Failed to fetch fresh template data:', error);
            // Fallback to response data
            setSelectedTemplate(response.data);
          }
        } else {
          setIsEditing(false);
          setSelectedTemplate(null);
        }
        
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
          key={`${selectedTemplate?.id || selectedTemplate?._id || 'new-template'}-${selectedTemplate?.updatedAt || selectedTemplate?.version || 'v1'}`}
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
      <>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Template Details</h1>
              <p className="text-gray-600 mt-1">Viewing: {selectedTemplate.name}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleGenerateDocument(selectedTemplate)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Generate Document</span>
              </button>
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

        {/* Template Document Generation Modal */}
        <TemplateDocumentGenerationModal
          isOpen={showGenerationModal}
          onClose={() => {
            console.log('🚀 Closing generation modal');
            setShowGenerationModal(false);
            setTemplateForGeneration(null);
          }}
          template={templateForGeneration}
          projectId="current-project"
        />
      </>
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
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
            title="Deleted Templates"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleManageCategories}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
            <span>Categories</span>
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
        onGenerateDocument={handleGenerateDocument}
        onPageChange={handlePageChange}
        currentPage={searchParams.page || 1}
        totalPages={totalPages}
        totalCount={totalCount}
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

      {/* Template Document Generation Modal */}
      <TemplateDocumentGenerationModal
        isOpen={showGenerationModal}
        onClose={() => {
          console.log('🚀 Closing generation modal');
          setShowGenerationModal(false);
          setTemplateForGeneration(null);
        }}
        template={templateForGeneration}
        projectId="current-project"
      />
    </div>
  );
}
