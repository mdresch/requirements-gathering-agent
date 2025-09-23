'use client';

import { useState, useEffect } from 'react';
import { Template, CreateTemplateRequest, TemplateMetadata } from '@/types/template';
import { validateTemplate } from '@/lib/utils';
import { Save, X, Eye, Code, FileText, AlertCircle } from 'lucide-react';

interface TemplateEditorProps {
  template?: Template | null;
  onSave: (templateData: CreateTemplateRequest) => void;
  onCancel: () => void;
}

export default function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: '',
    description: '',
    category: '',
    tags: [],
    content: '',
    aiInstructions: '',
    templateType: 'ai_instruction',
    contextRequirements: [],
    variables: {},
    metadata: {
      framework: '',
      complexity: 'simple',
      estimatedTime: '',
      dependencies: [],
      version: '1.0.0',
      author: '',
    },
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'advanced'>('basic');
  const [tagInput, setTagInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [dependencyInput, setDependencyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template) {
      console.log('TemplateEditor: Loading template data:', template);
      console.log('TemplateEditor: Template content length:', template.content?.length || 0);
      console.log('TemplateEditor: Template content:', template.content);
      console.log('TemplateEditor: Template aiInstructions:', template.aiInstructions);
      console.log('TemplateEditor: Template metadata:', template.metadata);
      console.log('TemplateEditor: Template metadata author:', template.metadata?.author);
      console.log('TemplateEditor: Template metadata framework:', template.metadata?.framework);
      
      setFormData({
        name: template.name || '',
        description: template.description || '',
        category: template.category || '',
        tags: template.tags || [],
        content: template.content || '', // Ensure content is preserved
        aiInstructions: template.aiInstructions || '',
        templateType: template.templateType || 'ai_instruction',
        contextPriority: template.contextPriority || 'medium',
        contextRequirements: template.contextRequirements || [],
        variables: template.variables || {},
        metadata: {
          framework: template.metadata?.framework || '',
          complexity: template.metadata?.complexity || 'simple',
          estimatedTime: template.metadata?.estimatedTime || '',
          dependencies: template.metadata?.dependencies || [],
          version: template.metadata?.version || '1.0.0',
          author: template.metadata?.author || '',
        },
      });
      
      console.log('TemplateEditor: Form data set with content length:', template.content?.length || 0);
    }
  }, [template]);

  const handleInputChange = (field: keyof CreateTemplateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleMetadataChange = (field: keyof TemplateMetadata, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  const handleAddContext = () => {
    if (contextInput.trim() && !formData.contextRequirements?.includes(contextInput.trim())) {
      setFormData(prev => ({
        ...prev,
        contextRequirements: [...(prev.contextRequirements || []), contextInput.trim()],
      }));
      setContextInput('');
    }
  };

  const handleRemoveContext = (context: string) => {
    setFormData(prev => ({
      ...prev,
      contextRequirements: prev.contextRequirements?.filter(c => c !== context) || [],
    }));
  };

  const handleAddDependency = () => {
    if (dependencyInput.trim() && !formData.metadata?.dependencies?.includes(dependencyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          dependencies: [...(prev.metadata?.dependencies || []), dependencyInput.trim()],
        },
      }));
      setDependencyInput('');
    }
  };

  const handleRemoveDependency = (dependency: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        dependencies: prev.metadata?.dependencies?.filter(d => d !== dependency) || [],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      console.log('TemplateEditor: Saving template with form data:', formData);
      console.log('TemplateEditor: Content length being saved:', formData.content?.length || 0);
      
      const validation = validateTemplate(formData);
      if (!validation.isValid) {
        console.log('TemplateEditor: Validation failed:', validation.errors);
        setErrors(validation.errors);
        return;
      }

          // Restructure data to match backend API expectations
          const apiData = {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            tags: formData.tags,
            templateData: {
              content: formData.content || '',
              aiInstructions: formData.aiInstructions || '',
              variables: Array.isArray(formData.variables) ? formData.variables : Object.keys(formData.variables || {}),
              layout: {}
            },
            templateType: formData.templateType,
            contextPriority: formData.contextPriority,
            contextRequirements: formData.contextRequirements,
            metadata: {
              ...formData.metadata,
              author: formData.metadata?.author || 'System', // Ensure author is included
              framework: formData.metadata?.framework || 'general' // Ensure framework has a default
            },
            isActive: true
          };

      console.log('TemplateEditor: Restructured data for API:', apiData);
      console.log('TemplateEditor: Content in templateData:', apiData.templateData.content?.length || 0);
      console.log('TemplateEditor: Metadata being sent:', apiData.metadata);
      console.log('TemplateEditor: Author field:', apiData.metadata?.author);
      console.log('TemplateEditor: Framework field:', apiData.metadata?.framework);

      setErrors([]);
      await onSave(apiData);
    } catch (error) {
      console.error('TemplateEditor: Save error:', error);
      setErrors(['Failed to save template. Please try again.']);
    } finally {
      setIsSaving(false);
    }
  };

  const predefinedCategories = [
    'pmbok', 'babok', 'requirements', 'technical-design', 
    'quality-assurance', 'project-management', 'business-analysis',
    'documentation', 'testing', 'deployment', 'api-testing'
  ];

  // Fixed: Define tabs array properly
  const tabs = [
    {
      id: 'basic',
      label: 'Basic Info',
      icon: FileText
    },
    {
      id: 'content',
      label: 'Content',
      icon: Code
    },
    {
      id: 'advanced',
      label: 'Advanced',
      icon: Eye
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        {/* Tab Navigation - FIXED */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6 max-h-96 overflow-y-auto">
        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Template name"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Template description"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category-select"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-label="Category"
              >
                <option value="">Select a category</option>
                {predefinedCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose from predefined categories or type a custom one
              </p>
            </div>

            <div>
              <label htmlFor="template-type-select" className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
              <select
                id="template-type-select"
                value={formData.templateType || 'ai_instruction'}
                onChange={(e) => handleInputChange('templateType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ai_instruction">AI Instruction</option>
                <option value="document">Document Template</option>
                <option value="form">Form Template</option>
                <option value="report">Report Template</option>
              </select>
            </div>

            <div>
              <label htmlFor="context-priority-select" className="block text-sm font-medium text-gray-700 mb-1">
                Context Priority <span className="text-gray-500 text-sm">(for LLM context building)</span>
              </label>
              <select
                id="context-priority-select"
                value={formData.contextPriority || 'medium'}
                onChange={(e) => handleInputChange('contextPriority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low - Minimal context value</option>
                <option value="medium">Medium - Standard context value</option>
                <option value="high">High - Important for context</option>
                <option value="critical">Critical - Essential for context</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Higher priority documents will be prioritized when building context for new document generation.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter your template content here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables like {`{{VARIABLE_NAME}}`} for dynamic content
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI Instructions</label>
              <textarea
                value={formData.aiInstructions}
                onChange={(e) => handleInputChange('aiInstructions', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Special instructions for AI processing..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide context and guidance for AI when processing this template
              </p>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
                <input
                  type="text"
                  value={formData.metadata?.framework || ''}
                  onChange={(e) => handleMetadataChange('framework', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., PMBOK, BABOK"
                />
              </div>

              <div>
                <label htmlFor="complexity-select" className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
                <select
                  id="complexity-select"
                  value={formData.metadata?.complexity || 'simple'}
                  onChange={(e) => handleMetadataChange('complexity', e.target.value as 'simple' | 'moderate' | 'advanced')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                <input
                  type="text"
                  value={formData.metadata?.estimatedTime || ''}
                  onChange={(e) => handleMetadataChange('estimatedTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 30 minutes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.metadata?.version || ''}
                  onChange={(e) => handleMetadataChange('version', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1.0.0"
                  pattern="^\d+\.\d+\.\d+$"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={formData.metadata?.author || ''}
                onChange={(e) => handleMetadataChange('author', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Template author"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Context Requirements</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddContext())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add context requirement"
                />
                <button
                  type="button"
                  onClick={handleAddContext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.contextRequirements?.map(context => (
                  <span
                    key={context}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {context}
                    <button
                      type="button"
                      onClick={() => handleRemoveContext(context)}
                      className="ml-1 text-green-600 hover:text-green-800 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dependencies</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={dependencyInput}
                  onChange={(e) => setDependencyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDependency())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add dependency"
                />
                <button
                  type="button"
                  onClick={handleAddDependency}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.metadata?.dependencies?.map(dependency => (
                  <span
                    key={dependency}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {dependency}
                    <button
                      type="button"
                      onClick={() => handleRemoveDependency(dependency)}
                      className="ml-1 text-purple-600 hover:text-purple-800 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
