'use client';

import { useState, useEffect } from 'react';
import { Template, CreateTemplateRequest, TemplateMetadata } from '@/types/template';
import { Category } from '@/types/category';
import { validateTemplate } from '@/lib/utils';
import { categoryApiClient } from '@/lib/categoryApi';
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
    promptTemplate: '',
    generationFunction: 'getAiGenericDocument',
    documentKey: '',
    templateType: 'ai_instruction',
    contextPriority: 'medium',
    contextRequirements: [],
    variables: {},
    isActive: false, // Default new templates to Inactive for review
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryApiClient.getActiveCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback to predefined categories
        setCategories([
          { _id: '1', name: 'pmbok', description: 'PMBOK Guide templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '2', name: 'babok', description: 'BABOK Guide templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '3', name: 'requirements', description: 'Requirements management templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '4', name: 'technical-design', description: 'Technical design templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '5', name: 'quality-assurance', description: 'Quality assurance templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '6', name: 'project-management', description: 'Project management templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '7', name: 'business-analysis', description: 'Business analysis templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '8', name: 'documentation', description: 'Documentation templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '9', name: 'testing', description: 'Testing templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '10', name: 'deployment', description: 'Deployment templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 },
          { _id: '11', name: 'api-testing', description: 'API testing templates', isActive: true, isSystem: true, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

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
        promptTemplate: template.promptTemplate || '',
        generationFunction: template.generationFunction || 'getAiGenericDocument',
        documentKey: template.documentKey || '',
        templateType: template.templateType || 'ai_instruction',
        contextPriority: template.contextPriority || 'medium',
        contextRequirements: template.contextRequirements || [],
        variables: template.variables || {},
        isActive: template.isActive !== undefined ? template.isActive : false, // Default to inactive for review
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
    
    // Auto-generate document key when name changes
    if (field === 'name' && value) {
      const documentKey = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Ensure document key is not empty and follows proper format
      if (documentKey && /^[a-z0-9-]+$/.test(documentKey)) {
        setFormData(prev => ({
          ...prev,
          documentKey: documentKey
        }));
        console.log(`✅ Auto-generated document key: "${documentKey}" from template name: "${value}"`);
      } else {
        console.warn(`⚠️ Failed to generate valid document key from template name: "${value}"`);
      }
    }
    
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
            // Required fields for document generation
            aiInstructions: formData.aiInstructions || '',
            promptTemplate: formData.promptTemplate || '',
            generationFunction: formData.generationFunction || 'getAiGenericDocument',
            documentKey: formData.documentKey || '', // Send empty string if not set
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
            isActive: formData.isActive !== undefined ? formData.isActive : false // Default to inactive for review
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

      <div className="p-6 max-h-[70vh] overflow-y-auto">
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
                disabled={categoriesLoading}
              >
                <option value="">{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name} - {cat.description}
                  </option>
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
              <label htmlFor="document-key-input" className="block text-sm font-medium text-gray-700 mb-1">
                Document Key <span className="text-red-500">*</span>
              </label>
              <input
                id="document-key-input"
                type="text"
                value={formData.documentKey || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Validate document key format
                  if (value === '' || /^[a-z0-9-]+$/.test(value)) {
                    handleInputChange('documentKey', value);
                  } else {
                    // Show error for invalid format
                    console.warn(`❌ Invalid document key format: "${value}". Must be lowercase with hyphens only.`);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                  formData.documentKey && !/^[a-z0-9-]+$/.test(formData.documentKey) 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="business-case"
                pattern="^[a-z0-9-]+$"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for document generation (lowercase with hyphens). Auto-generated from template name.
                {formData.documentKey && !/^[a-z0-9-]+$/.test(formData.documentKey) && (
                  <span className="text-red-500 block mt-1">
                    ⚠️ Invalid format. Use lowercase letters, numbers, and hyphens only.
                  </span>
                )}
              </p>
            </div>

            <div>
              <label htmlFor="generation-function-select" className="block text-sm font-medium text-gray-700 mb-1">
                Generation Function <span className="text-red-500">*</span>
              </label>
              <select
                id="generation-function-select"
                value={formData.generationFunction}
                onChange={(e) => handleInputChange('generationFunction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <optgroup label="Core Analysis Documents">
                  <option value="getAiGenericDocument">Generic Document (Default)</option>
                  <option value="getAiSummaryAndGoals">Summary and Goals</option>
                  <option value="getAiUserStories">User Stories</option>
                  <option value="getAiUserPersonas">User Personas</option>
                  <option value="getAiKeyRolesAndNeeds">Key Roles and Needs</option>
                  <option value="getAiProjectStatementOfWork">Project Statement of Work</option>
                  <option value="getAiBusinessCase">Business Case</option>
                </optgroup>
                
                <optgroup label="Strategic Statements">
                  <option value="getMissionVisionAndCoreValues">Mission, Vision & Core Values</option>
                  <option value="getProjectPurpose">Project Purpose</option>
                </optgroup>
                
                <optgroup label="Project Charter">
                  <option value="getAiProjectCharter">Project Charter</option>
                  <option value="getAiProjectManagementPlan">Project Management Plan</option>
                </optgroup>
                
                <optgroup label="PMBOK Process Functions">
                  <option value="getAiDirectAndManageProjectWorkProcess">Direct and Manage Project Work</option>
                  <option value="getAiPerformIntegratedChangeControlProcess">Perform Integrated Change Control</option>
                  <option value="getAiCloseProjectOrPhaseProcess">Close Project or Phase</option>
                  <option value="getAiValidateScopeProcess">Validate Scope Process</option>
                  <option value="getAiControlScopeProcess">Control Scope Process</option>
                </optgroup>
                
                <optgroup label="Management Plans">
                  <option value="getAiScopeManagementPlan">Scope Management Plan</option>
                  <option value="getAiRiskManagementPlan">Risk Management Plan</option>
                  <option value="getAiCostManagementPlan">Cost Management Plan</option>
                  <option value="getAiQualityManagementPlan">Quality Management Plan</option>
                  <option value="getAiResourceManagementPlan">Resource Management Plan</option>
                  <option value="getAiCommunicationManagementPlan">Communication Management Plan</option>
                  <option value="getAiProcurementManagementPlan">Procurement Management Plan</option>
                </optgroup>
                
                <optgroup label="Stakeholder Management">
                  <option value="getAiStakeholderEngagementPlan">Stakeholder Engagement Plan</option>
                  <option value="getAiStakeholderRegister">Stakeholder Register</option>
                  <option value="getAiStakeholderAnalysis">Stakeholder Analysis</option>
                </optgroup>
                
                <optgroup label="Planning Artifacts">
                  <option value="getAiWbs">Work Breakdown Structure</option>
                  <option value="getAiWbsDictionary">WBS Dictionary</option>
                  <option value="getAiActivityList">Activity List</option>
                  <option value="getAiActivityDurationEstimates">Activity Duration Estimates</option>
                  <option value="getAiActivityResourceEstimates">Activity Resource Estimates</option>
                  <option value="getAiScheduleNetworkDiagram">Schedule Network Diagram</option>
                  <option value="getAiMilestoneList">Milestone List</option>
                  <option value="getAiDevelopScheduleInput">Develop Schedule Input</option>
                </optgroup>
                
                <optgroup label="Technical Analysis">
                  <option value="getAiDataModelSuggestions">Data Model Suggestions</option>
                  <option value="getAiTechStackAnalysis">Tech Stack Analysis</option>
                  <option value="getAiRiskAnalysis">Risk Analysis</option>
                  <option value="getAiAcceptanceCriteria">Acceptance Criteria</option>
                  <option value="getAiComplianceConsiderations">Compliance Considerations</option>
                  <option value="getAiUiUxConsiderations">UI/UX Considerations</option>
                </optgroup>
                
                <optgroup label="Technical Recommendations">
                  <option value="getAiTechnicalRecommendations">Technical Recommendations</option>
                  <option value="getAiTechnologySelectionCriteria">Technology Selection Criteria</option>
                  <option value="getAiTechnicalImplementationRoadmap">Technical Implementation Roadmap</option>
                  <option value="getAiTechnologyGovernanceFramework">Technology Governance Framework</option>
                </optgroup>
                
                <optgroup label="Requirements Management">
                  <option value="getAiRequirementsManagementPlan">Requirements Management Plan</option>
                  <option value="getAiCollectRequirementsProcess">Collect Requirements Process</option>
                  <option value="getAiRequirementsDocumentation">Requirements Documentation</option>
                  <option value="getAiRequirementsTraceabilityMatrix">Requirements Traceability Matrix</option>
                </optgroup>
                
                <optgroup label="Scope Management">
                  <option value="getAiPlanScopeManagement">Plan Scope Management</option>
                  <option value="getAiDefineScopeProcess">Define Scope Process</option>
                  <option value="getAiProjectScopeStatement">Project Scope Statement</option>
                  <option value="getAiCreateWbsProcess">Create WBS Process</option>
                  <option value="getAiScopeBaseline">Scope Baseline</option>
                  <option value="getAiWorkPerformanceInformationScope">Work Performance Information Scope</option>
                </optgroup>
                
                <optgroup label="DMBOK Data Management">
                  <option value="getAiDmbokDataManagementStrategy">DMBOK Data Management Strategy</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the document processor function that will generate this type of document.
              </p>
            </div>

            <div>
              <label htmlFor="context-priority-select" className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Status</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === true}
                    onChange={() => handleInputChange('isActive', true)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive === false}
                    onChange={() => handleInputChange('isActive', false)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active templates are available for document generation. Inactive templates are hidden but preserved.
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
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter your template content here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables like {`{{VARIABLE_NAME}}`} for dynamic content
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Instructions (System Prompt) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.aiInstructions}
                onChange={(e) => handleInputChange('aiInstructions', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="You are a Project Management Professional with extensive knowledge..."
                minLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Define the AI's role and expertise for generating this type of document (minimum 10 characters)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Template (AI Prompt) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.promptTemplate}
                onChange={(e) => handleInputChange('promptTemplate', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Generate a comprehensive [Document Type] following [Framework] standards..."
                minLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                The specific prompt that will be sent to the AI for document generation (minimum 10 characters)
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
